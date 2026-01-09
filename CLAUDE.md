# Candiez-CA

CRM and inventory management system for a California marijuana dispensary. Features candy-themed purple/lavender design, role-based access control, points-based loyalty program, and comprehensive inventory tracking.

## Build Commands

```bash
# Client (React + Vite)
cd client
npm install          # Install dependencies
npm run dev          # Start dev server (Vite)
npm run build        # Production build
npm run lint         # ESLint check
npm run preview      # Preview production build

# Server (Node.js + Express)
cd server
npm install          # Install dependencies
npm run dev          # Start with --watch (auto-reload)
npm run start        # Production start
npm run db:init      # Initialize database

# Full Stack Setup
./init.sh            # Creates structure, installs deps (Unix)
```

## Testing

No test framework is currently configured. The project has no test scripts or test directories.

## Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (React)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ AuthContext  │  │  Components  │  │   React Router v6    │  │
│  │ (JWT Token)  │  │ (CSS Modules)│  │  (Protected Routes)  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                      │              │
│         └─────────────────┼──────────────────────┘              │
│                           │                                      │
│                    fetch() with JWT                              │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                      Server (Express)                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐   │
│  │  JWT Auth   │  │ Zod Valid.  │  │    REST Endpoints       │   │
│  │ Middleware  │  │ Middleware  │  │ /api/auth, /api/customers│  │
│  └──────┬──────┘  └──────┬──────┘  │ /api/products, /api/pos │   │
│         │                │         │ /api/inventory, /api/... │   │
│         └────────────────┼─────────┴─────────────┬───────────┘   │
│                          │                       │                │
│                          ▼                       ▼                │
│                    ┌─────────────────────────────────┐           │
│                    │   SQLite (better-sqlite3)       │           │
│                    │   candiez.db                    │           │
│                    └─────────────────────────────────┘           │
└───────────────────────────────────────────────────────────────────┘
```

### Core Components

| Component | Purpose |
|-----------|---------|
| `AuthContext` | JWT token management, login/logout, role-based auth |
| `Dashboard` | Role-specific overview with stats and charts |
| `CustomerManagement` | CRUD for customers, loyalty tracking |
| `ProductManagement` | Product catalog with categories |
| `InventoryManagement` | Stock levels, adjustments, alerts |
| `POSInterface` | Point-of-sale transaction processing |
| `TransactionHistory` | Sales records, refunds |
| `Reports` | Analytics with Recharts visualizations |
| `Settings` | System configuration, user management |

### Database Schema

| Table | Purpose |
|-------|---------|
| `users` | Staff accounts with roles (admin/manager/budtender) |
| `customers` | Customer profiles with loyalty tier |
| `categories` | Product categories |
| `products` | Inventory items with pricing, stock |
| `suppliers` | Product suppliers |
| `transactions` | Sales with payment method, totals |
| `transaction_items` | Line items for transactions |
| `inventory_adjustments` | Stock change audit trail |
| `loyalty_transactions` | Points earned/redeemed |
| `settings` | Key-value system configuration |
| `activity_log` | User action audit trail |
| `refunds` | Refund records |
| `refund_items` | Refunded line items |

## Key Directories

```
Candiez-CA/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # UI components (CSS Modules)
│   │   ├── contexts/          # React Context providers
│   │   ├── hooks/             # Custom hooks
│   │   ├── pages/             # Route pages
│   │   └── App.jsx            # Main app with routing
│   └── package.json
├── server/                    # Express backend
│   ├── src/
│   │   ├── db/
│   │   │   └── database.js    # SQLite schema init
│   │   ├── scripts/
│   │   │   └── init-db.js     # DB initialization script
│   │   └── index.js           # Express server (~1500 lines)
│   └── package.json
├── prompts/
│   └── app_spec.txt           # Full project specification
├── init.sh                    # Setup script
└── README.md
```

## File Locations

| What | Where |
|------|-------|
| React entry | `client/src/main.jsx` |
| App routing | `client/src/App.jsx` |
| Auth context | `client/src/contexts/AuthContext.jsx` |
| API endpoints | `server/src/index.js` |
| Database schema | `server/src/db/database.js` |
| SQLite database | `server/candiez.db` (created at runtime) |
| CSS variables | Component `.module.css` files |
| Project spec | `prompts/app_spec.txt` |

## Notes

### Authentication
- JWT tokens stored in localStorage
- Tokens expire in 24 hours
- Three roles: `admin`, `manager`, `budtender`
- Demo users seeded on server startup:
  - `admin@candiez.com` / `admin123`
  - `manager@candiez.com` / `manager123`
  - `budtender@candiez.com` / `budtender123`

### Loyalty Program
- Points-based system with tier multipliers
- Tiers: Bronze (1x), Silver (1.25x), Gold (1.5x), Platinum (2x)
- Tier thresholds configurable in settings
- Points can be redeemed at POS

### Design System
- Candy-themed purple/lavender palette
- CSS Modules for component styling
- CSS custom properties for theming
- Mobile-optimized with antd-mobile components
- Lucide React for icons
- Recharts for data visualization

### API Structure
All endpoints prefixed with `/api/`:
- `POST /api/auth/login` - Authentication
- `GET/POST /api/customers` - Customer CRUD
- `GET/POST /api/products` - Product CRUD
- `GET/POST /api/categories` - Category CRUD
- `POST /api/pos/transaction` - Process sale
- `GET /api/inventory` - Stock levels
- `POST /api/inventory/adjust` - Stock adjustments
- `GET /api/reports/*` - Various analytics
- `GET/PUT /api/settings` - System config
- `GET/POST /api/users` - User management (admin only)

### Server Architecture
- Single-file Express server (`index.js`)
- Synchronous SQLite with better-sqlite3
- Zod schemas for request validation
- JWT middleware for protected routes
- Role-based authorization checks
- Activity logging for audit trail

### Ports
- Client dev server: `5173` (Vite default)
- Server: `3001`
