<p align="center">
  <img src="https://img.shields.io/badge/Status-In%20Development-purple?style=for-the-badge" alt="Status"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js" alt="Node.js"/>
  <img src="https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite" alt="SQLite"/>
</p>

<h1 align="center">Candiez-CA</h1>

<p align="center">
  <strong>CRM & Inventory Management System for California Cannabis Dispensary</strong>
</p>

<p align="center">
  A playful, candy-themed purple/lavender system for customer management, inventory tracking, and point-of-sale operations.
</p>

<p align="center">
  <a href="https://candiez.shop"><strong>candiez.shop</strong></a>
</p>

---

## Overview

Candiez-CA is a full-stack dispensary management solution focusing on:

| Module | Description |
|--------|-------------|
| **Customer Management** | Profiles, purchase history, loyalty tracking |
| **Inventory Management** | Stock levels, suppliers, compliance tracking |
| **Point of Sale** | Transaction processing, receipts, shift management |
| **Loyalty Program** | Points, tiers (Bronze/Silver/Gold/Platinum), redemption |
| **Reporting** | Sales analytics, inventory reports, customer metrics |

---

## Tech Stack

<table>
<tr>
<td width="50%">

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: CSS Modules + Custom Properties
- **State**: React Context + useReducer
- **Routing**: React Router v6
- **UI**: antd-mobile, Lucide React
- **Charts**: Recharts

</td>
<td width="50%">

### Backend
- **Runtime**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Auth**: JWT + bcrypt
- **Validation**: Zod

</td>
</tr>
</table>

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone and setup
git clone <repository>
cd Candiez-CA

# Run setup script
chmod +x init.sh && ./init.sh
```

### Development

```bash
# Terminal 1 - Server (port 3001)
cd server && npm run dev

# Terminal 2 - Client (port 5173)
cd client && npm run dev
```

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@candiez.com | admin123 |
| Manager | manager@candiez.com | manager123 |
| Budtender | budtender@candiez.com | budtender123 |

---

## Project Structure

```
Candiez-CA/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components (CSS Modules)
│   │   ├── contexts/       # React Context providers
│   │   ├── hooks/          # Custom hooks
│   │   └── pages/          # Route pages
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── db/            # Database schema
│   │   └── index.js       # API endpoints
│   └── package.json
├── scripts/
│   ├── migrations/        # Database migration scripts
│   └── utils/             # Utility scripts
├── docs/                  # Documentation
│   ├── app_spec.txt       # Full specification
│   └── claude-progress.txt
├── prompts/               # AutoCoder prompts
├── .memory-bank/          # Project context
├── CLAUDE.md              # Claude Code guidance
└── README.md
```

---

## User Roles & Permissions

| Feature | Admin | Manager | Budtender |
|---------|:-----:|:-------:|:---------:|
| Dashboard | Full | View | View |
| Customers | Full | Full | Limited |
| Products | Full | Full | View |
| Inventory | Full | Full | View |
| POS | Full | Full | Full |
| Reports | Full | Full | - |
| Settings | Full | Limited | - |
| Users | Full | - | - |

---

## Design System

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#B57EDC` | Buttons, links, accents |
| Primary Light | `#E8D5F2` | Backgrounds, hover states |
| Primary Dark | `#7B4A9E` | Headers, emphasis |
| Teal Accent | `#5BC0BE` | Success, positive actions |
| Pink Accent | `#F5A9B8` | Notifications, highlights |
| Yellow Accent | `#F7DC6F` | Warnings, loyalty points |

### Typography

- **Headings**: Poppins (Bold, Semi-Bold)
- **Body**: Inter (Regular, Medium)
- **Monospace**: JetBrains Mono (prices, codes)

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User authentication |
| `/api/customers` | GET/POST | Customer CRUD |
| `/api/products` | GET/POST | Product CRUD |
| `/api/categories` | GET/POST | Category management |
| `/api/pos/transaction` | POST | Process sale |
| `/api/inventory` | GET | Stock levels |
| `/api/inventory/adjust` | POST | Stock adjustments |
| `/api/reports/*` | GET | Various analytics |
| `/api/settings` | GET/PUT | System configuration |
| `/api/users` | GET/POST | User management (admin) |

---

## Commands

```bash
# Development
cd server && npm run dev      # Start server with auto-reload
cd client && npm run dev      # Start Vite dev server

# Production
cd client && npm run build    # Build frontend
cd server && npm start        # Start production server

# Database
cd server && npm run db:init  # Initialize database

# Linting
cd client && npm run lint     # ESLint check
```

---

## Ports

| Service | Port |
|---------|------|
| Client (Vite) | 5173 |
| Server (Express) | 3001 |

---

## License

Proprietary - Candiez California

---

<p align="center">
  <sub>Built with AutoCoder Autonomous Agent</sub>
</p>
<p align="center">
  <sub>Created: January 2026</sub>
</p>
