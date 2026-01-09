# Candiez-CA

A CRM and inventory management system for a California marijuana dispensary. Features a playful, candy-themed purple/lavender design that matches the Candiez brand identity.

## Overview

Candiez-CA focuses on two core areas:
1. **Client Acquisition** - Customer tracking, loyalty programs, communication
2. **Inventory Management** - Product catalog, stock levels, compliance tracking

## Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: CSS Modules with custom properties
- **State Management**: React Context + useReducer
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js with Express
- **Database**: SQLite with better-sqlite3
- **Authentication**: JWT with bcrypt
- **Validation**: Zod

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

```bash
# Make init.sh executable
chmod +x init.sh

# Run setup script
./init.sh
```

### Development

```bash
# Terminal 1 - Start the server
cd server && npm run dev

# Terminal 2 - Start the client
cd client && npm run dev
```

### Access
- **Client**: http://localhost:5173
- **Server API**: http://localhost:3001/api

## Project Structure

```
Candiez-CA/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   ├── styles/        # CSS modules
│   │   └── utils/         # Helper functions
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Database models
│   │   ├── services/     # Business logic
│   │   └── utils/        # Helper functions
│   └── data/             # SQLite database
├── prompts/              # AutoCoder prompts
├── features.db           # Feature tracking database
├── init.sh              # Environment setup script
└── README.md
```

## User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management, settings |
| **Manager** | Reports, inventory, customer management, transactions |
| **Budtender** | POS, customer lookup, view products |

## Design System

### Color Palette

**Primary (Lavender Purple)**
- Primary: `#B57EDC`
- Primary Light: `#E8D5F2`
- Primary Dark: `#7B4A9E`

**Candy Accents**
- Teal: `#5BC0BE`
- Pink: `#F5A9B8`
- Yellow: `#F7DC6F`

### Typography
- **Headings**: Poppins (Bold, Semi-Bold)
- **Body**: Inter (Regular, Medium)
- **Monospace**: JetBrains Mono (prices, codes)

### Effects
- Gradient buttons with hover glow
- Soft shadows with purple tint
- Rounded corners (8px default, 16px cards)
- Glassmorphism for modals
- Smooth animations

## Features

### Customer Management (CRM)
- Customer profiles with purchase history
- Customer search and segmentation
- Notes, tags, and preferences
- Referral tracking
- Medical card expiration tracking

### Loyalty Program
- Points-based rewards
- Tier levels (Bronze, Silver, Gold, Platinum)
- Birthday and referral bonuses
- Points redemption at checkout

### Inventory Management
- Real-time stock tracking
- Low stock alerts
- Batch/lot number tracking
- Supplier management
- Expiration date tracking

### Point of Sale
- Quick product lookup
- Cart management
- Multiple payment types
- Receipt generation
- Shift management

### Compliance (California)
- Daily purchase limit tracking
- Age verification (21+)
- Lab testing info display
- Required receipt warnings

### Reporting
- Sales dashboard with charts
- Inventory reports
- Customer acquisition metrics
- Loyalty program analytics
- Export to CSV/PDF

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/login` | User authentication |
| `GET /api/customers` | List customers |
| `GET /api/products` | List products |
| `POST /api/transactions` | Create transaction |
| `GET /api/reports/sales` | Sales report |

See `prompts/app_spec.txt` for complete API documentation.

## Environment Variables

### Server (.env)
```
PORT=3001
JWT_SECRET=your-secret-key
DATABASE_PATH=./data/candiez.db
DEFAULT_TAX_RATE=15.0
```

### Client (.env)
```
VITE_API_URL=http://localhost:3001/api
```

## AutoCoder Status

- [x] Specification created
- [x] Features initialized (148 tests)
- [x] Development in progress (some features implemented)

### Feature Categories
- Security & Access Control
- Navigation Integrity
- Real Data Verification
- Workflow Completeness
- Error Handling
- UI-Backend Integration
- State & Persistence
- Form Validation
- Responsive & Layout
- Accessibility
- Performance
- UI Style & Design

## Development Commands

```bash
# Install all dependencies
./init.sh

# Run server in development mode
cd server && npm run dev

# Run client in development mode
cd client && npm run dev

# Initialize database
cd server && npm run db:init

# Build client for production
cd client && npm run build

# Run linting
cd client && npm run lint
```

## License

Proprietary - Candiez California

---

Created: January 8, 2026
AutoCoder Autonomous Project
