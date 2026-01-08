import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.0.1'
  });
});

// Auth endpoints (placeholder)
app.get('/api/auth/me', (req, res) => {
  res.status(401).json({ error: 'Not authenticated' });
});

app.post('/api/auth/login', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

app.post('/api/auth/logout', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// Customer endpoints (placeholder)
app.get('/api/customers', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// Product endpoints (placeholder)
app.get('/api/products', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// Transaction endpoints (placeholder)
app.get('/api/transactions', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
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
  ╚═══════════════════════════════════════════════╝
  `);
});
