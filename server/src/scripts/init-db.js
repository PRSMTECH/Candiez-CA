import bcrypt from 'bcrypt';
import db, { initializeDatabase } from '../db/database.js';

async function seedDatabase() {
  console.log('Initializing database...');

  // Initialize schema
  initializeDatabase();

  // Check if users already exist
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();

  if (existingUsers.count > 0) {
    console.log('Database already seeded. Skipping...');
    return;
  }

  console.log('Seeding database with initial data...');

  // Hash passwords
  const adminHash = await bcrypt.hash('admin123', 10);
  const managerHash = await bcrypt.hash('manager123', 10);
  const budtenderHash = await bcrypt.hash('budtender123', 10);

  // Insert demo users
  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, first_name, last_name, role, status)
    VALUES (?, ?, ?, ?, ?, 'active')
  `);

  insertUser.run('admin@candiez.com', adminHash, 'Admin', 'User', 'admin');
  insertUser.run('manager@candiez.com', managerHash, 'Manager', 'User', 'manager');
  insertUser.run('budtender@candiez.com', budtenderHash, 'Bud', 'Tender', 'budtender');

  console.log('Users created');

  // Insert default categories
  const insertCategory = db.prepare(`
    INSERT INTO categories (name, slug, description, sort_order, is_active)
    VALUES (?, ?, ?, ?, 1)
  `);

  const categories = [
    ['Flower', 'flower', 'Cannabis flower and buds', 1],
    ['Edibles', 'edibles', 'Cannabis-infused food products', 2],
    ['Concentrates', 'concentrates', 'Cannabis extracts and concentrates', 3],
    ['Pre-rolls', 'pre-rolls', 'Pre-rolled joints and blunts', 4],
    ['Topicals', 'topicals', 'Creams, lotions, and balms', 5],
    ['Accessories', 'accessories', 'Pipes, papers, and accessories', 6]
  ];

  for (const cat of categories) {
    insertCategory.run(...cat);
  }

  console.log('Categories created');

  // Insert default settings
  const insertSetting = db.prepare(`
    INSERT INTO settings (key, value)
    VALUES (?, ?)
  `);

  const settings = [
    ['tax_rate', '0.15'],
    ['loyalty_points_per_dollar', '1'],
    ['loyalty_redemption_rate', '0.01'],
    ['business_name', 'Candiez Dispensary'],
    ['business_license', 'C10-0000001-LIC'],
    ['low_stock_threshold', '10']
  ];

  for (const [key, value] of settings) {
    insertSetting.run(key, value);
  }

  console.log('Settings created');
  console.log('Database seeding complete!');
}

seedDatabase().catch(console.error);
