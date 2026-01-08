import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate, authorize, generateToken } from './middleware/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

  // TODO: Replace with actual database lookup
  // Demo users for testing
  const demoUsers = {
    'admin@candiez.com': {
      id: 1,
      email: 'admin@candiez.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    },
    'manager@candiez.com': {
      id: 2,
      email: 'manager@candiez.com',
      password: 'manager123',
      firstName: 'Manager',
      lastName: 'User',
      role: 'manager'
    },
    'budtender@candiez.com': {
      id: 3,
      email: 'budtender@candiez.com',
      password: 'budtender123',
      firstName: 'Bud',
      lastName: 'Tender',
      role: 'budtender'
    }
  };

  const user = demoUsers[email.toLowerCase()];

  if (!user || user.password !== password) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid email or password'
    });
  }

  // Generate token
  const token = generateToken(user);

  // Return user and token
  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
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
// PROTECTED API ENDPOINTS
// All endpoints below require authentication
// ==========================================

// Customer endpoints (protected)
app.get('/api/customers', authenticate, (req, res) => {
  res.json({
    message: 'Customers endpoint - Coming soon',
    customers: []
  });
});

app.post('/api/customers', authenticate, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

app.get('/api/customers/:id', authenticate, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

app.put('/api/customers/:id', authenticate, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

app.delete('/api/customers/:id', authenticate, authorize('admin'), (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// Product endpoints (protected)
app.get('/api/products', authenticate, (req, res) => {
  res.json({
    message: 'Products endpoint - Coming soon',
    products: []
  });
});

app.post('/api/products', authenticate, authorize('admin', 'manager'), (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

app.get('/api/products/:id', authenticate, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

app.put('/api/products/:id', authenticate, authorize('admin', 'manager'), (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

app.delete('/api/products/:id', authenticate, authorize('admin'), (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// Transaction endpoints (protected - manager/admin only for viewing)
app.get('/api/transactions', authenticate, authorize('admin', 'manager'), (req, res) => {
  res.json({
    message: 'Transactions endpoint - Coming soon',
    transactions: []
  });
});

app.post('/api/transactions', authenticate, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

app.get('/api/transactions/:id', authenticate, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// Inventory endpoints (protected - manager/admin only)
app.get('/api/inventory', authenticate, authorize('admin', 'manager'), (req, res) => {
  res.json({
    message: 'Inventory endpoint - Coming soon',
    inventory: []
  });
});

// Reports endpoints (protected - manager/admin only)
app.get('/api/reports/sales', authenticate, authorize('admin', 'manager'), (req, res) => {
  res.json({
    message: 'Sales report endpoint - Coming soon',
    report: {}
  });
});

// Settings endpoints (protected - admin only)
app.get('/api/settings', authenticate, authorize('admin'), (req, res) => {
  res.json({
    message: 'Settings endpoint - Coming soon',
    settings: {}
  });
});

app.put('/api/settings', authenticate, authorize('admin'), (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// Users/Staff endpoints (protected - admin only)
app.get('/api/users', authenticate, authorize('admin'), (req, res) => {
  res.json({
    message: 'Users endpoint - Coming soon',
    users: []
  });
});

app.post('/api/users', authenticate, authorize('admin'), (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
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
  ╔═══════════════════════════════════════════════╗
  ║         Candiez-CA Server Running             ║
  ╠═══════════════════════════════════════════════╣
  ║  Port:    ${PORT}                              ║
  ║  Mode:    ${process.env.NODE_ENV || 'development'}                    ║
  ║  API:     http://localhost:${PORT}/api         ║
  ╠═══════════════════════════════════════════════╣
  ║  Demo Accounts:                               ║
  ║  admin@candiez.com / admin123                 ║
  ║  manager@candiez.com / manager123             ║
  ║  budtender@candiez.com / budtender123         ║
  ╚═══════════════════════════════════════════════╝
  `);
});
