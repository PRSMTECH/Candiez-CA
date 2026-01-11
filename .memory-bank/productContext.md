# Product Context

**Project**: Candiez-CA
**Last Updated**: 2026-01-10
**Status**: Production
**Production URL**: https://candiez.shop

## Overview
CRM and inventory management system for a California marijuana dispensary. Features a candy-themed purple/lavender design, role-based access control, points-based loyalty program, and comprehensive inventory tracking.

## Tech Stack

### Frontend
- React 18 with Vite
- CSS Modules with custom properties
- React Context + useReducer for state
- React Router v6 for routing
- antd-mobile for mobile UI components
- Lucide React for icons
- Recharts for data visualization

### Backend
- Node.js with Express
- JWT + bcrypt for authentication
- Zod for request validation

### Database
- SQLite with better-sqlite3
- 13 tables: users, customers, categories, products, suppliers, transactions, transaction_items, inventory_adjustments, loyalty_transactions, settings, activity_log, refunds, refund_items

### Infrastructure
- Monorepo structure (client/ and server/)
- Vite dev server for frontend
- Node --watch for backend hot reload

## Architecture
```
Client (React + Vite)
    ↓ fetch() with JWT
Server (Express)
    ↓ better-sqlite3
SQLite Database (candiez.db)
```

## Key Features
1. Role-based access control (admin, manager, budtender)
2. Customer management with loyalty program
3. Product catalog with categories
4. Inventory tracking with adjustment history
5. Point-of-sale transaction processing
6. Reports and analytics with charts
7. Settings and user management

## User Roles
- **admin**: Full system access
- **manager**: Customer, product, inventory, reports access
- **budtender**: POS and limited customer access

## External Integrations
- None currently (self-contained system)

## Environment Variables
```env
# Server runs on port 3001
# Client runs on port 5173
# SQLite database created at server/candiez.db
```

---
**Usage**: Update when architecture or major features change
