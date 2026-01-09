// Script to seed 25+ test products for pagination testing
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'data', 'candiez.db'));

// First, get or create a test category
let categoryId;
const existingCategory = db.prepare('SELECT id FROM categories WHERE name = ?').get('Pagination Test');
if (existingCategory) {
  categoryId = existingCategory.id;
} else {
  const result = db.prepare(`
    INSERT INTO categories (name, slug, description, is_active)
    VALUES (?, ?, ?, ?)
  `).run('Pagination Test', 'pagination-test', 'Products for pagination testing', 1);
  categoryId = result.lastInsertRowid;
}

console.log('Using category ID:', categoryId);

const products = [
  { name: 'Purple Haze Premium', strain: 'sativa', thc: 22.5, cbd: 0.1, price: 55.00, stock: 100 },
  { name: 'Northern Lights Classic', strain: 'indica', thc: 20.0, cbd: 0.2, price: 48.00, stock: 85 },
  { name: 'Girl Scout Cookies', strain: 'hybrid', thc: 25.0, cbd: 0.1, price: 52.00, stock: 75 },
  { name: 'Granddaddy Purple', strain: 'indica', thc: 19.5, cbd: 0.3, price: 45.00, stock: 120 },
  { name: 'Jack Herer Supreme', strain: 'sativa', thc: 23.0, cbd: 0.1, price: 58.00, stock: 90 },
  { name: 'White Widow Gold', strain: 'hybrid', thc: 21.0, cbd: 0.2, price: 50.00, stock: 65 },
  { name: 'Durban Poison', strain: 'sativa', thc: 24.0, cbd: 0.1, price: 55.00, stock: 80 },
  { name: 'Gorilla Glue #4', strain: 'hybrid', thc: 28.0, cbd: 0.1, price: 62.00, stock: 45 },
  { name: 'Pineapple Express', strain: 'hybrid', thc: 20.5, cbd: 0.2, price: 48.00, stock: 110 },
  { name: 'Strawberry Cough', strain: 'sativa', thc: 21.5, cbd: 0.1, price: 52.00, stock: 95 },
  { name: 'Blueberry Kush', strain: 'indica', thc: 18.0, cbd: 0.5, price: 42.00, stock: 130 },
  { name: 'Tangie Dream', strain: 'sativa', thc: 22.0, cbd: 0.1, price: 50.00, stock: 70 },
  { name: 'Wedding Cake', strain: 'hybrid', thc: 26.0, cbd: 0.1, price: 60.00, stock: 55 },
  { name: 'Gelato #41', strain: 'hybrid', thc: 24.5, cbd: 0.1, price: 58.00, stock: 60 },
  { name: 'Amnesia Haze', strain: 'sativa', thc: 22.5, cbd: 0.1, price: 54.00, stock: 85 },
  { name: 'Grape Ape', strain: 'indica', thc: 21.0, cbd: 0.2, price: 48.00, stock: 75 },
  { name: 'Lemon Haze', strain: 'sativa', thc: 20.0, cbd: 0.1, price: 46.00, stock: 100 },
  { name: 'Zkittlez', strain: 'indica', thc: 19.0, cbd: 0.3, price: 44.00, stock: 90 },
  { name: 'Mimosa', strain: 'hybrid', thc: 21.0, cbd: 0.1, price: 50.00, stock: 80 },
  { name: 'Runtz', strain: 'hybrid', thc: 25.5, cbd: 0.1, price: 65.00, stock: 40 },
  { name: 'Cereal Milk', strain: 'hybrid', thc: 23.0, cbd: 0.1, price: 55.00, stock: 65 },
  { name: 'Apple Fritter', strain: 'hybrid', thc: 24.0, cbd: 0.1, price: 58.00, stock: 50 },
  { name: 'Ice Cream Cake', strain: 'indica', thc: 22.5, cbd: 0.2, price: 52.00, stock: 70 },
  { name: 'Biscotti', strain: 'indica', thc: 21.0, cbd: 0.1, price: 48.00, stock: 85 },
  { name: 'Gary Payton', strain: 'hybrid', thc: 26.5, cbd: 0.1, price: 68.00, stock: 35 },
];

const insertStmt = db.prepare(`
  INSERT INTO products (
    sku, name, category_id, strain_type, thc_percent, cbd_percent,
    price, stock_quantity, is_active, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
`);

let inserted = 0;
for (const product of products) {
  const sku = 'TEST_' + product.name.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase().substring(0, 15);

  // Check if product with this SKU already exists
  const existing = db.prepare('SELECT id FROM products WHERE sku = ?').get(sku);
  if (!existing) {
    insertStmt.run(
      sku,
      product.name,
      categoryId,
      product.strain,
      product.thc,
      product.cbd,
      product.price,
      product.stock
    );
    inserted++;
    console.log(`Inserted: ${product.name}`);
  } else {
    console.log(`Skipped (already exists): ${product.name}`);
  }
}

console.log(`\nTotal inserted: ${inserted} products`);
console.log('Seed completed!');

// Verify total count
const count = db.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').get();
console.log(`Total active products: ${count.count}`);

db.close();
