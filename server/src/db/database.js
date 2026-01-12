import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dataDir, 'candiez.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'budtender')),
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
      phone TEXT,
      avatar_url TEXT,
      email_verified INTEGER DEFAULT 0,
      email_verification_token TEXT,
      email_verification_expires TEXT,
      referral_code TEXT UNIQUE,
      referred_by_user_id INTEGER,
      referred_by_code TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      last_login TEXT,
      FOREIGN KEY (referred_by_user_id) REFERENCES users(id)
    )
  `);

  // Migration: Add email verification columns if missing
  try {
    db.exec(`ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0`);
  } catch (e) {
    // Column already exists, ignore error
  }
  try {
    db.exec(`ALTER TABLE users ADD COLUMN email_verification_token TEXT`);
  } catch (e) {
    // Column already exists, ignore error
  }
  try {
    db.exec(`ALTER TABLE users ADD COLUMN email_verification_expires TEXT`);
  } catch (e) {
    // Column already exists, ignore error
  }

  // Migration: Add password reset columns
  try {
    db.exec(`ALTER TABLE users ADD COLUMN password_reset_token TEXT`);
  } catch (e) {
    // Column already exists, ignore error
  }
  try {
    db.exec(`ALTER TABLE users ADD COLUMN password_reset_expires TEXT`);
  } catch (e) {
    // Column already exists, ignore error
  }

  // Migration: Add referral system columns
  try {
    db.exec(`ALTER TABLE users ADD COLUMN referral_code TEXT UNIQUE`);
  } catch (e) {
    // Column already exists, ignore error
  }
  try {
    db.exec(`ALTER TABLE users ADD COLUMN referred_by_user_id INTEGER REFERENCES users(id)`);
  } catch (e) {
    // Column already exists, ignore error
  }
  try {
    db.exec(`ALTER TABLE users ADD COLUMN referred_by_code TEXT`);
  } catch (e) {
    // Column already exists, ignore error
  }

  // Referral tracking table (for pyramid-style tracking)
  db.exec(`
    CREATE TABLE IF NOT EXISTS referral_tracking (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      referrer_id INTEGER NOT NULL,
      referred_id INTEGER NOT NULL,
      referral_code TEXT NOT NULL,
      level INTEGER DEFAULT 1,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (referrer_id) REFERENCES users(id),
      FOREIGN KEY (referred_id) REFERENCES users(id)
    )
  `);

  // Referral rewards table (track points/rewards earned from referrals)
  db.exec(`
    CREATE TABLE IF NOT EXISTS referral_rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      referrer_id INTEGER NOT NULL,
      referred_id INTEGER,
      transaction_id INTEGER,
      reward_type TEXT NOT NULL CHECK (reward_type IN ('signup_bonus', 'transaction_commission', 'tier_bonus')),
      points_earned INTEGER DEFAULT 0,
      amount REAL DEFAULT 0,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (referrer_id) REFERENCES users(id),
      FOREIGN KEY (referred_id) REFERENCES users(id),
      FOREIGN KEY (transaction_id) REFERENCES transactions(id)
    )
  `);

  // Create index for referral code lookup
  try {
    db.exec(`CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code)`);
  } catch (e) {
    // Index already exists or column doesn't exist yet
  }
  try {
    db.exec(`CREATE INDEX IF NOT EXISTS idx_referral_tracking_referrer ON referral_tracking(referrer_id)`);
  } catch (e) {
    // Index already exists
  }
  try {
    db.exec(`CREATE INDEX IF NOT EXISTS idx_referral_tracking_referred ON referral_tracking(referred_id)`);
  } catch (e) {
    // Index already exists
  }

  // ========================================
  // Ambassador Program Tables & Migrations
  // ========================================

  // Ambassador tiers table (defines commission rates and requirements)
  db.exec(`
    CREATE TABLE IF NOT EXISTS ambassador_tiers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tier_name TEXT NOT NULL UNIQUE,
      min_referrals INTEGER DEFAULT 0,
      min_sales REAL DEFAULT 0,
      commission_rate REAL NOT NULL,
      signup_bonus_points INTEGER DEFAULT 50,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Referral payouts table (track redemption requests and payments)
  db.exec(`
    CREATE TABLE IF NOT EXISTS referral_payouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payout_type TEXT DEFAULT 'store_credit' CHECK (payout_type IN ('store_credit', 'cash', 'points')),
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
      notes TEXT,
      approved_by INTEGER,
      approved_at TEXT,
      paid_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (approved_by) REFERENCES users(id)
    )
  `);

  // Migration: Add ambassador program columns to users table
  try {
    db.exec(`ALTER TABLE users ADD COLUMN ambassador_tier TEXT DEFAULT 'Member'`);
  } catch (e) {
    // Column already exists, ignore error
  }
  try {
    db.exec(`ALTER TABLE users ADD COLUMN total_referral_earnings REAL DEFAULT 0`);
  } catch (e) {
    // Column already exists, ignore error
  }
  try {
    db.exec(`ALTER TABLE users ADD COLUMN available_balance REAL DEFAULT 0`);
  } catch (e) {
    // Column already exists, ignore error
  }
  try {
    db.exec(`ALTER TABLE users ADD COLUMN lifetime_referral_count INTEGER DEFAULT 0`);
  } catch (e) {
    // Column already exists, ignore error
  }
  try {
    db.exec(`ALTER TABLE users ADD COLUMN lifetime_referral_sales REAL DEFAULT 0`);
  } catch (e) {
    // Column already exists, ignore error
  }

  // Create indexes for ambassador/referral queries
  try {
    db.exec(`CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer ON referral_rewards(referrer_id)`);
  } catch (e) {
    // Index already exists
  }
  try {
    db.exec(`CREATE INDEX IF NOT EXISTS idx_referral_payouts_user ON referral_payouts(user_id)`);
  } catch (e) {
    // Index already exists
  }
  try {
    db.exec(`CREATE INDEX IF NOT EXISTS idx_referral_payouts_status ON referral_payouts(status)`);
  } catch (e) {
    // Index already exists
  }

  // Seed default ambassador tiers (if not exist)
  const tierCount = db.prepare(`SELECT COUNT(*) as count FROM ambassador_tiers`).get();
  if (tierCount.count === 0) {
    const insertTier = db.prepare(`
      INSERT INTO ambassador_tiers (tier_name, min_referrals, min_sales, commission_rate, signup_bonus_points, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertTier.run('Member', 0, 0, 0.05, 50, 1);        // 5% commission, 50 points/signup
    insertTier.run('Promoter', 5, 500, 0.075, 75, 2);   // 7.5% commission, 75 points/signup
    insertTier.run('Ambassador', 15, 2000, 0.10, 100, 3); // 10% commission, 100 points/signup
    insertTier.run('Elite', 50, 10000, 0.15, 150, 4);   // 15% commission, 150 points/signup

    console.log('Default ambassador tiers seeded');
  }

  // Customers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      date_of_birth TEXT,
      age_verified INTEGER DEFAULT 0,
      medical_card_number TEXT,
      medical_card_expiry TEXT,
      address TEXT,
      city TEXT,
      state TEXT DEFAULT 'CA',
      zip TEXT,
      photo_url TEXT,
      notes TEXT,
      tags TEXT,
      preferences TEXT,
      referral_source TEXT,
      referred_by_customer_id INTEGER,
      loyalty_points INTEGER DEFAULT 0,
      loyalty_tier TEXT DEFAULT 'bronze',
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (referred_by_customer_id) REFERENCES customers(id)
    )
  `);

  // Migration: Add staff/ambassador referral to customers
  try {
    db.exec(`ALTER TABLE customers ADD COLUMN referred_by_user_id INTEGER REFERENCES users(id)`);
  } catch (e) {
    // Column already exists, ignore error
  }
  try {
    db.exec(`ALTER TABLE customers ADD COLUMN referred_by_code TEXT`);
  } catch (e) {
    // Column already exists, ignore error
  }

  // Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      parent_id INTEGER,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (parent_id) REFERENCES categories(id)
    )
  `);

  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT UNIQUE NOT NULL,
      barcode TEXT,
      name TEXT NOT NULL,
      description TEXT,
      category_id INTEGER,
      strain_type TEXT CHECK (strain_type IN ('indica', 'sativa', 'hybrid', 'cbd', NULL)),
      thc_percent REAL,
      cbd_percent REAL,
      price REAL NOT NULL,
      sale_price REAL,
      cost REAL,
      weight REAL,
      weight_unit TEXT DEFAULT 'g',
      stock_quantity INTEGER DEFAULT 0,
      low_stock_threshold INTEGER DEFAULT 10,
      batch_number TEXT,
      lab_test_url TEXT,
      expiration_date TEXT,
      image_urls TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  // Suppliers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_name TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      license_number TEXT,
      notes TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_number TEXT UNIQUE NOT NULL,
      customer_id INTEGER,
      user_id INTEGER NOT NULL,
      subtotal REAL NOT NULL,
      tax_amount REAL NOT NULL,
      discount_amount REAL DEFAULT 0,
      loyalty_points_used INTEGER DEFAULT 0,
      loyalty_points_earned INTEGER DEFAULT 0,
      total REAL NOT NULL,
      payment_method TEXT,
      payment_status TEXT DEFAULT 'pending',
      notes TEXT,
      voided INTEGER DEFAULT 0,
      voided_by INTEGER,
      voided_at TEXT,
      void_reason TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (voided_by) REFERENCES users(id)
    )
  `);

  // Transaction items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transaction_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      discount_amount REAL DEFAULT 0,
      total_price REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (transaction_id) REFERENCES transactions(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Inventory adjustments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory_adjustments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      adjustment_type TEXT NOT NULL,
      quantity_change INTEGER NOT NULL,
      reason TEXT,
      notes TEXT,
      batch_number TEXT,
      approved_by INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (approved_by) REFERENCES users(id)
    )
  `);

  // Loyalty transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS loyalty_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      transaction_id INTEGER,
      points_earned INTEGER DEFAULT 0,
      points_redeemed INTEGER DEFAULT 0,
      reason TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (transaction_id) REFERENCES transactions(id)
    )
  `);

  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      updated_at TEXT DEFAULT (datetime('now')),
      updated_by INTEGER,
      FOREIGN KEY (updated_by) REFERENCES users(id)
    )
  `);

  // Activity log table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      details TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Refunds table
  db.exec(`
    CREATE TABLE IF NOT EXISTS refunds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original_transaction_id INTEGER NOT NULL,
      refund_number TEXT UNIQUE NOT NULL,
      subtotal REAL NOT NULL,
      tax_amount REAL NOT NULL,
      total REAL NOT NULL,
      reason TEXT,
      processed_by INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (original_transaction_id) REFERENCES transactions(id),
      FOREIGN KEY (processed_by) REFERENCES users(id)
    )
  `);

  // Refund items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS refund_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      refund_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      refund_amount REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (refund_id) REFERENCES refunds(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Migration: Add loyalty_points_earned column if missing
  try {
    db.exec(`ALTER TABLE transactions ADD COLUMN loyalty_points_earned INTEGER DEFAULT 0`);
  } catch (e) {
    // Column already exists, ignore error
  }

  // Create indexes for common queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
    CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
    CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(first_name, last_name);
    CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(created_at);
  `);

  console.log('Database initialized successfully');
}

export default db;
