import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { authenticate, authorize, generateToken } from './middleware/auth.js';
import db, { initializeDatabase } from './db/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
initializeDatabase();

// Seed initial admin user if none exists
const seedAdminUser = () => {
  const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@candiez.com');
  if (!adminExists) {
    const passwordHash = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('admin@candiez.com', passwordHash, 'Admin', 'User', 'admin', 'active');

    const managerHash = bcrypt.hashSync('manager123', 10);
    db.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('manager@candiez.com', managerHash, 'Manager', 'User', 'manager', 'active');

    const budtenderHash = bcrypt.hashSync('budtender123', 10);
    db.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('budtender@candiez.com', budtenderHash, 'Bud', 'Tender', 'budtender', 'active');

    console.log('Demo users created successfully');
  }
};

seedAdminUser();

// Middleware
app.use(cors());
app.use(express.json());

// Helper to generate transaction number
const generateTransactionNumber = () => {
  const prefix = 'TXN';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Health check endpoint (public)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.0.1'
  });
});

// ==========================================
// AUTH ENDPOINTS (Public)
// ==========================================

// Get current user - requires authentication
app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({
    user: req.user
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Email and password are required'
    });
  }

  // Look up user in database
  const user = db.prepare(`
    SELECT id, email, password_hash, first_name, last_name, role, status
    FROM users WHERE email = ? AND status = 'active'
  `).get(email.toLowerCase());

  if (!user) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid email or password'
    });
  }

  // Compare password with bcrypt
  const passwordMatch = bcrypt.compareSync(password, user.password_hash);
  if (!passwordMatch) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid email or password'
    });
  }

  // Update last login
  db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);

  // Generate token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.first_name,
    lastName: user.last_name
  });

  // Return user and token
  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role
    }
  });
});

// Logout endpoint
app.post('/api/auth/logout', authenticate, (req, res) => {
  // In a real app, you might blacklist the token or clear server-side session
  res.json({
    message: 'Logged out successfully'
  });
});

// ==========================================
// DASHBOARD ENDPOINTS
// ==========================================

app.get('/api/dashboard/stats', authenticate, (req, res) => {
  try {
    const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM customers').get();
    const activeCustomers = db.prepare("SELECT COUNT(*) as count FROM customers WHERE status = 'active'").get();
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').get();
    const transactionCount = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE voided = 0').get();

    // Today's sales
    const todaySalesResult = db.prepare(`
      SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as count
      FROM transactions
      WHERE voided = 0 AND date(created_at) = date('now')
    `).get();

    // Low stock products
    const lowStockCount = db.prepare(`
      SELECT COUNT(*) as count FROM products
      WHERE is_active = 1 AND stock_quantity <= low_stock_threshold AND stock_quantity > 0
    `).get();

    // Out of stock products
    const outOfStockCount = db.prepare(`
      SELECT COUNT(*) as count FROM products
      WHERE is_active = 1 AND stock_quantity = 0
    `).get();

    res.json({
      totalCustomers: totalCustomers.count,
      activeCustomers: activeCustomers.count,
      totalProducts: totalProducts.count,
      transactions: transactionCount.count,
      todaySales: todaySalesResult.total,
      todayTransactions: todaySalesResult.count,
      lowStockProducts: lowStockCount.count,
      outOfStockProducts: outOfStockCount.count
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get recent transactions for dashboard
app.get('/api/transactions/recent', authenticate, (req, res) => {
  try {
    const transactions = db.prepare(`
      SELECT t.id, t.total, t.created_at,
             COALESCE(c.first_name || ' ' || c.last_name, 'Walk-in') as customer,
             strftime('%H:%M', t.created_at) as time,
             CASE WHEN t.voided = 1 THEN 'voided' ELSE 'completed' END as status
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE date(t.created_at) = date('now')
      ORDER BY t.created_at DESC
      LIMIT 10
    `).all();

    res.json({ transactions });
  } catch (error) {
    console.error('Recent transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch recent transactions' });
  }
});

// Get low stock products for dashboard
app.get('/api/products/low-stock', authenticate, (req, res) => {
  try {
    const products = db.prepare(`
      SELECT id, name, stock_quantity as stock, low_stock_threshold
      FROM products
      WHERE is_active = 1 AND stock_quantity <= low_stock_threshold
      ORDER BY stock_quantity ASC
      LIMIT 10
    `).all();

    res.json({ products });
  } catch (error) {
    console.error('Low stock products error:', error);
    res.status(500).json({ error: 'Failed to fetch low stock products' });
  }
});

// ==========================================
// CUSTOMER ENDPOINTS
// ==========================================

// Get all customers with pagination and search
app.get('/api/customers', authenticate, (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = 'all' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = '1=1';
    const params = [];

    if (search) {
      whereClause += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (status !== 'all') {
      whereClause += ` AND status = ?`;
      params.push(status);
    }

    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM customers WHERE ${whereClause}`);
    const total = countStmt.get(...params).count;

    const customersStmt = db.prepare(`
      SELECT * FROM customers
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);
    const customers = customersStmt.all(...params, parseInt(limit), offset);

    res.json({
      customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get single customer
app.get('/api/customers/:id', authenticate, (req, res) => {
  try {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ customer });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Create customer
app.post('/api/customers', authenticate, (req, res) => {
  try {
    const {
      first_name, last_name, email, phone, date_of_birth,
      medical_card_number, medical_card_expiry, address, city, state, zip,
      notes, tags, preferences, referral_source, referred_by_customer_id
    } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    // Check for duplicate email
    if (email) {
      const existingEmail = db.prepare('SELECT id FROM customers WHERE email = ?').get(email);
      if (existingEmail) {
        return res.status(400).json({ error: 'A customer with this email already exists' });
      }
    }

    const result = db.prepare(`
      INSERT INTO customers (
        first_name, last_name, email, phone, date_of_birth,
        medical_card_number, medical_card_expiry, address, city, state, zip,
        notes, tags, preferences, referral_source, referred_by_customer_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      first_name, last_name, email || null, phone || null, date_of_birth || null,
      medical_card_number || null, medical_card_expiry || null,
      address || null, city || null, state || 'CA', zip || null,
      notes || null, tags || null, preferences || null,
      referral_source || null, referred_by_customer_id || null
    );

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ customer, message: 'Customer created successfully' });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Update customer
app.put('/api/customers/:id', authenticate, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const {
      first_name, last_name, email, phone, date_of_birth, age_verified,
      medical_card_number, medical_card_expiry, address, city, state, zip,
      photo_url, notes, tags, preferences, loyalty_points, loyalty_tier, status
    } = req.body;

    // Check for duplicate email (if changing email and not to the same one)
    if (email && email !== existing.email) {
      const existingEmail = db.prepare('SELECT id FROM customers WHERE email = ? AND id != ?').get(email, req.params.id);
      if (existingEmail) {
        return res.status(400).json({ error: 'A customer with this email already exists' });
      }
    }

    db.prepare(`
      UPDATE customers SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        date_of_birth = COALESCE(?, date_of_birth),
        age_verified = COALESCE(?, age_verified),
        medical_card_number = COALESCE(?, medical_card_number),
        medical_card_expiry = COALESCE(?, medical_card_expiry),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        zip = COALESCE(?, zip),
        photo_url = COALESCE(?, photo_url),
        notes = COALESCE(?, notes),
        tags = COALESCE(?, tags),
        preferences = COALESCE(?, preferences),
        loyalty_points = COALESCE(?, loyalty_points),
        loyalty_tier = COALESCE(?, loyalty_tier),
        status = COALESCE(?, status),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      first_name, last_name, email, phone, date_of_birth, age_verified,
      medical_card_number, medical_card_expiry, address, city, state, zip,
      photo_url, notes, tags, preferences, loyalty_points, loyalty_tier, status,
      req.params.id
    );

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    res.json({ customer, message: 'Customer updated successfully' });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete customer (admin only)
app.delete('/api/customers/:id', authenticate, authorize('admin'), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Soft delete by setting status to inactive
    db.prepare("UPDATE customers SET status = 'inactive', updated_at = datetime('now') WHERE id = ?")
      .run(req.params.id);

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// ==========================================
// PRODUCT ENDPOINTS
// ==========================================

// Get all products with pagination and search
app.get('/api/products', authenticate, (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', category_id, strain_type, active = 'all' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = '1=1';
    const params = [];

    if (search) {
      whereClause += ` AND (name LIKE ? OR sku LIKE ? OR description LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (category_id) {
      whereClause += ` AND category_id = ?`;
      params.push(category_id);
    }

    if (strain_type) {
      whereClause += ` AND strain_type = ?`;
      params.push(strain_type);
    }

    if (active !== 'all') {
      whereClause += ` AND is_active = ?`;
      params.push(active === 'true' ? 1 : 0);
    }

    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM products WHERE ${whereClause}`);
    const total = countStmt.get(...params).count;

    const productsStmt = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereClause.replace('1=1', 'p.id IS NOT NULL')}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `);
    const products = productsStmt.all(...params, parseInt(limit), offset);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
app.get('/api/products/:id', authenticate, (req, res) => {
  try {
    const product = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product (admin/manager only)
app.post('/api/products', authenticate, authorize('admin', 'manager'), (req, res) => {
  try {
    const {
      sku, barcode, name, description, category_id, strain_type,
      thc_percent, cbd_percent, price, sale_price, cost,
      weight, weight_unit, stock_quantity, low_stock_threshold,
      batch_number, lab_test_url, expiration_date, image_urls
    } = req.body;

    if (!sku || !name || !price) {
      return res.status(400).json({ error: 'SKU, name, and price are required' });
    }

    // Check SKU uniqueness
    const existingSku = db.prepare('SELECT id FROM products WHERE sku = ?').get(sku);
    if (existingSku) {
      return res.status(400).json({ error: 'SKU already exists' });
    }

    const result = db.prepare(`
      INSERT INTO products (
        sku, barcode, name, description, category_id, strain_type,
        thc_percent, cbd_percent, price, sale_price, cost,
        weight, weight_unit, stock_quantity, low_stock_threshold,
        batch_number, lab_test_url, expiration_date, image_urls
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sku, barcode || null, name, description || null, category_id || null, strain_type || null,
      thc_percent || null, cbd_percent || null, price, sale_price || null, cost || null,
      weight || null, weight_unit || 'g', stock_quantity || 0, low_stock_threshold || 10,
      batch_number || null, lab_test_url || null, expiration_date || null,
      image_urls ? JSON.stringify(image_urls) : null
    );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ product, message: 'Product created successfully' });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (admin/manager only)
app.put('/api/products/:id', authenticate, authorize('admin', 'manager'), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const {
      sku, barcode, name, description, category_id, strain_type,
      thc_percent, cbd_percent, price, sale_price, cost,
      weight, weight_unit, stock_quantity, low_stock_threshold,
      batch_number, lab_test_url, expiration_date, image_urls, is_active
    } = req.body;

    // Check SKU uniqueness if changing
    if (sku && sku !== existing.sku) {
      const existingSku = db.prepare('SELECT id FROM products WHERE sku = ? AND id != ?').get(sku, req.params.id);
      if (existingSku) {
        return res.status(400).json({ error: 'SKU already exists' });
      }
    }

    db.prepare(`
      UPDATE products SET
        sku = COALESCE(?, sku),
        barcode = COALESCE(?, barcode),
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        category_id = COALESCE(?, category_id),
        strain_type = COALESCE(?, strain_type),
        thc_percent = COALESCE(?, thc_percent),
        cbd_percent = COALESCE(?, cbd_percent),
        price = COALESCE(?, price),
        sale_price = COALESCE(?, sale_price),
        cost = COALESCE(?, cost),
        weight = COALESCE(?, weight),
        weight_unit = COALESCE(?, weight_unit),
        stock_quantity = COALESCE(?, stock_quantity),
        low_stock_threshold = COALESCE(?, low_stock_threshold),
        batch_number = COALESCE(?, batch_number),
        lab_test_url = COALESCE(?, lab_test_url),
        expiration_date = COALESCE(?, expiration_date),
        image_urls = COALESCE(?, image_urls),
        is_active = COALESCE(?, is_active),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      sku, barcode, name, description, category_id, strain_type,
      thc_percent, cbd_percent, price, sale_price, cost,
      weight, weight_unit, stock_quantity, low_stock_threshold,
      batch_number, lab_test_url, expiration_date,
      image_urls ? JSON.stringify(image_urls) : null, is_active,
      req.params.id
    );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json({ product, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (admin only)
app.delete('/api/products/:id', authenticate, authorize('admin'), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Soft delete by setting is_active to 0
    db.prepare('UPDATE products SET is_active = 0, updated_at = datetime("now") WHERE id = ?')
      .run(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ==========================================
// CATEGORY ENDPOINTS
// ==========================================

app.get('/api/categories', authenticate, (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT c.*, p.name as parent_name
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      WHERE c.is_active = 1
      ORDER BY c.sort_order, c.name
    `).all();

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', authenticate, authorize('admin', 'manager'), (req, res) => {
  try {
    const { name, slug, description, parent_id, sort_order } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    const result = db.prepare(`
      INSERT INTO categories (name, slug, description, parent_id, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, slug, description || null, parent_id || null, sort_order || 0);

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ category, message: 'Category created successfully' });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// ==========================================
// TRANSACTION ENDPOINTS
// ==========================================

// Get all transactions (manager/admin only)
app.get('/api/transactions', authenticate, authorize('admin', 'manager'), (req, res) => {
  try {
    const { page = 1, limit = 20, start_date, end_date, customer_id, payment_method } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = 'voided = 0';
    const params = [];

    if (start_date) {
      whereClause += ` AND date(t.created_at) >= date(?)`;
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ` AND date(t.created_at) <= date(?)`;
      params.push(end_date);
    }

    if (customer_id) {
      whereClause += ` AND t.customer_id = ?`;
      params.push(customer_id);
    }

    if (payment_method) {
      whereClause += ` AND t.payment_method = ?`;
      params.push(payment_method);
    }

    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM transactions t WHERE ${whereClause}`);
    const total = countStmt.get(...params).count;

    const transactionsStmt = db.prepare(`
      SELECT t.*,
        c.first_name || ' ' || c.last_name as customer_name,
        u.first_name || ' ' || u.last_name as user_name
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `);
    const transactions = transactionsStmt.all(...params, parseInt(limit), offset);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get single transaction
app.get('/api/transactions/:id', authenticate, (req, res) => {
  try {
    const transaction = db.prepare(`
      SELECT t.*,
        c.first_name || ' ' || c.last_name as customer_name,
        u.first_name || ' ' || u.last_name as user_name
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `).get(req.params.id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Get transaction items
    const items = db.prepare(`
      SELECT ti.*, p.name as product_name, p.sku
      FROM transaction_items ti
      JOIN products p ON ti.product_id = p.id
      WHERE ti.transaction_id = ?
    `).all(req.params.id);

    res.json({ transaction, items });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Create transaction (sale)
app.post('/api/transactions', authenticate, (req, res) => {
  try {
    const { customer_id, items, payment_method, discount_amount, loyalty_points_used, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one item is required' });
    }

    // Calculate totals
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(item.product_id);
      if (!product) {
        return res.status(400).json({ error: `Product ${item.product_id} not found or inactive` });
      }
      if (product.stock_quantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      const unitPrice = product.sale_price || product.price;
      const itemDiscount = item.discount_amount || 0;
      const totalPrice = (unitPrice * item.quantity) - itemDiscount;

      processedItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: unitPrice,
        discount_amount: itemDiscount,
        total_price: totalPrice
      });

      subtotal += totalPrice;
    }

    const taxRate = 0.0775; // California cannabis tax rate example
    const taxAmount = subtotal * taxRate;
    const totalDiscount = discount_amount || 0;
    const total = subtotal + taxAmount - totalDiscount;

    // Create transaction
    const transactionNumber = generateTransactionNumber();
    const result = db.prepare(`
      INSERT INTO transactions (
        transaction_number, customer_id, user_id, subtotal, tax_amount,
        discount_amount, loyalty_points_used, total, payment_method, payment_status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?)
    `).run(
      transactionNumber, customer_id || null, req.user.id, subtotal, taxAmount,
      totalDiscount, loyalty_points_used || 0, total, payment_method || 'cash', notes || null
    );

    const transactionId = result.lastInsertRowid;

    // Create transaction items and update inventory
    const insertItem = db.prepare(`
      INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, discount_amount, total_price)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const updateStock = db.prepare(`
      UPDATE products SET stock_quantity = stock_quantity - ?, updated_at = datetime('now')
      WHERE id = ?
    `);

    for (const item of processedItems) {
      insertItem.run(transactionId, item.product_id, item.quantity, item.unit_price, item.discount_amount, item.total_price);
      updateStock.run(item.quantity, item.product_id);
    }

    // Update customer loyalty points if applicable
    if (customer_id) {
      const pointsEarned = Math.floor(total); // 1 point per dollar
      db.prepare(`
        UPDATE customers SET loyalty_points = loyalty_points + ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(pointsEarned, customer_id);

      // Record loyalty transaction
      db.prepare(`
        INSERT INTO loyalty_transactions (customer_id, transaction_id, points_earned, reason)
        VALUES (?, ?, ?, 'Purchase')
      `).run(customer_id, transactionId, pointsEarned);
    }

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(transactionId);
    res.status(201).json({ transaction, message: 'Transaction completed successfully' });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Void transaction (admin/manager only)
app.post('/api/transactions/:id/void', authenticate, authorize('admin', 'manager'), (req, res) => {
  try {
    const { reason } = req.body;
    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ? AND voided = 0').get(req.params.id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found or already voided' });
    }

    // Restore inventory
    const items = db.prepare('SELECT * FROM transaction_items WHERE transaction_id = ?').all(req.params.id);
    for (const item of items) {
      db.prepare('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?')
        .run(item.quantity, item.product_id);
    }

    // Void the transaction
    db.prepare(`
      UPDATE transactions SET
        voided = 1, voided_by = ?, voided_at = datetime('now'), void_reason = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(req.user.id, reason || null, req.params.id);

    res.json({ message: 'Transaction voided successfully' });
  } catch (error) {
    console.error('Void transaction error:', error);
    res.status(500).json({ error: 'Failed to void transaction' });
  }
});

// ==========================================
// INVENTORY ENDPOINTS
// ==========================================

app.get('/api/inventory', authenticate, authorize('admin', 'manager'), (req, res) => {
  try {
    const { low_stock_only = 'false' } = req.query;

    let query = `
      SELECT p.id, p.sku, p.name, p.stock_quantity, p.low_stock_threshold,
        p.batch_number, p.expiration_date, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `;

    if (low_stock_only === 'true') {
      query += ' AND p.stock_quantity <= p.low_stock_threshold';
    }

    query += ' ORDER BY p.stock_quantity ASC';

    const inventory = db.prepare(query).all();
    res.json({ inventory });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Inventory adjustment
app.post('/api/inventory/adjust', authenticate, authorize('admin', 'manager'), (req, res) => {
  try {
    const { product_id, adjustment_type, quantity_change, reason, notes, batch_number } = req.body;

    if (!product_id || !adjustment_type || quantity_change === undefined) {
      return res.status(400).json({ error: 'Product ID, adjustment type, and quantity change are required' });
    }

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Record adjustment
    db.prepare(`
      INSERT INTO inventory_adjustments (product_id, user_id, adjustment_type, quantity_change, reason, notes, batch_number)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(product_id, req.user.id, adjustment_type, quantity_change, reason || null, notes || null, batch_number || null);

    // Update product stock
    db.prepare(`
      UPDATE products SET stock_quantity = stock_quantity + ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(quantity_change, product_id);

    const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
    res.json({ product: updatedProduct, message: 'Inventory adjusted successfully' });
  } catch (error) {
    console.error('Inventory adjustment error:', error);
    res.status(500).json({ error: 'Failed to adjust inventory' });
  }
});

// ==========================================
// REPORTS ENDPOINTS
// ==========================================

app.get('/api/reports/sales', authenticate, authorize('admin', 'manager'), (req, res) => {
  try {
    const { start_date, end_date, group_by = 'day' } = req.query;

    let dateFormat;
    switch (group_by) {
      case 'month':
        dateFormat = '%Y-%m';
        break;
      case 'week':
        dateFormat = '%Y-W%W';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    let whereClause = 'voided = 0';
    const params = [];

    if (start_date) {
      whereClause += ' AND date(created_at) >= date(?)';
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ' AND date(created_at) <= date(?)';
      params.push(end_date);
    }

    const salesByPeriod = db.prepare(`
      SELECT strftime('${dateFormat}', created_at) as period,
        COUNT(*) as transaction_count,
        SUM(subtotal) as subtotal,
        SUM(tax_amount) as tax,
        SUM(discount_amount) as discounts,
        SUM(total) as total
      FROM transactions
      WHERE ${whereClause}
      GROUP BY period
      ORDER BY period DESC
    `).all(...params);

    // Top products
    const topProducts = db.prepare(`
      SELECT p.id, p.name, p.sku,
        SUM(ti.quantity) as units_sold,
        SUM(ti.total_price) as revenue
      FROM transaction_items ti
      JOIN products p ON ti.product_id = p.id
      JOIN transactions t ON ti.transaction_id = t.id
      WHERE t.voided = 0 ${start_date ? 'AND date(t.created_at) >= date(?)' : ''} ${end_date ? 'AND date(t.created_at) <= date(?)' : ''}
      GROUP BY p.id
      ORDER BY revenue DESC
      LIMIT 10
    `).all(...(start_date ? [start_date] : []), ...(end_date ? [end_date] : []));

    res.json({
      report: {
        salesByPeriod,
        topProducts,
        summary: {
          totalTransactions: salesByPeriod.reduce((sum, p) => sum + p.transaction_count, 0),
          totalRevenue: salesByPeriod.reduce((sum, p) => sum + p.total, 0),
          totalTax: salesByPeriod.reduce((sum, p) => sum + p.tax, 0)
        }
      }
    });
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({ error: 'Failed to generate sales report' });
  }
});

// ==========================================
// SETTINGS ENDPOINTS
// ==========================================

app.get('/api/settings', authenticate, authorize('admin'), (req, res) => {
  try {
    const settings = db.prepare('SELECT key, value FROM settings').all();
    const settingsObj = {};
    settings.forEach(s => {
      try {
        settingsObj[s.key] = JSON.parse(s.value);
      } catch {
        settingsObj[s.key] = s.value;
      }
    });
    res.json({ settings: settingsObj });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/settings', authenticate, authorize('admin'), (req, res) => {
  try {
    const { settings } = req.body;

    const upsert = db.prepare(`
      INSERT INTO settings (key, value, updated_by, updated_at)
      VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_by = excluded.updated_by, updated_at = datetime('now')
    `);

    for (const [key, value] of Object.entries(settings)) {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      upsert.run(key, stringValue, req.user.id);
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ==========================================
// USERS/STAFF ENDPOINTS
// ==========================================

app.get('/api/users', authenticate, authorize('admin'), (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, email, first_name, last_name, role, status, phone, avatar_url, created_at, last_login
      FROM users
      ORDER BY created_at DESC
    `).all();
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', authenticate, authorize('admin'), (req, res) => {
  try {
    const { email, password, first_name, last_name, role, phone } = req.body;

    if (!email || !password || !first_name || !last_name || !role) {
      return res.status(400).json({ error: 'Email, password, first name, last name, and role are required' });
    }

    // Check email uniqueness
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const result = db.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(email.toLowerCase(), passwordHash, first_name, last_name, role, phone || null);

    const user = db.prepare(`
      SELECT id, email, first_name, last_name, role, status, phone, created_at
      FROM users WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ user, message: 'User created successfully' });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/users/:id', authenticate, authorize('admin'), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { email, password, first_name, last_name, role, phone, status } = req.body;

    // Check email uniqueness if changing
    if (email && email.toLowerCase() !== existing.email) {
      const existingEmail = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email.toLowerCase(), req.params.id);
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    let updateQuery = `
      UPDATE users SET
        email = COALESCE(?, email),
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        role = COALESCE(?, role),
        phone = COALESCE(?, phone),
        status = COALESCE(?, status),
        updated_at = datetime('now')
    `;
    const params = [email?.toLowerCase(), first_name, last_name, role, phone, status];

    if (password) {
      updateQuery = updateQuery.replace('updated_at = datetime', 'password_hash = ?, updated_at = datetime');
      params.splice(params.length, 0, bcrypt.hashSync(password, 10));
    }

    updateQuery += ' WHERE id = ?';
    params.push(req.params.id);

    db.prepare(updateQuery).run(...params);

    const user = db.prepare(`
      SELECT id, email, first_name, last_name, role, status, phone, created_at, last_login
      FROM users WHERE id = ?
    `).get(req.params.id);

    res.json({ user, message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', authenticate, authorize('admin'), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow deleting yourself
    if (existing.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Soft delete
    db.prepare('UPDATE users SET status = "inactive", updated_at = datetime("now") WHERE id = ?')
      .run(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ==========================================
// ACTIVITY LOG ENDPOINT
// ==========================================

app.get('/api/activity', authenticate, authorize('admin', 'manager'), (req, res) => {
  try {
    const { page = 1, limit = 50, user_id, action, entity_type } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = '1=1';
    const params = [];

    if (user_id) {
      whereClause += ' AND a.user_id = ?';
      params.push(user_id);
    }

    if (action) {
      whereClause += ' AND a.action = ?';
      params.push(action);
    }

    if (entity_type) {
      whereClause += ' AND a.entity_type = ?';
      params.push(entity_type);
    }

    const activities = db.prepare(`
      SELECT a.*, u.first_name || ' ' || u.last_name as user_name
      FROM activity_log a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), offset);

    res.json({ activities });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ======================================================
           Candiez-CA Server Running
  ======================================================
    Port:    ${PORT}
    Mode:    ${process.env.NODE_ENV || 'development'}
    API:     http://localhost:${PORT}/api
  ------------------------------------------------------
    Demo Accounts:
    admin@candiez.com / admin123
    manager@candiez.com / manager123
    budtender@candiez.com / budtender123
  ======================================================
  `);
});
