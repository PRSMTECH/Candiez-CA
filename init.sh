#!/bin/bash

# Candiez-CA - CRM & Inventory Management System
# California Marijuana Dispensary Application
#
# This script sets up the development environment for the Candiez-CA application.
# Technology Stack: React 18 + Node.js/Express + SQLite

set -e  # Exit on any error

echo "=============================================="
echo "  Candiez-CA Development Environment Setup"
echo "  CRM & Inventory Management System"
echo "=============================================="
echo ""

# Check Node.js version
echo "[1/8] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed. Please install Node.js 18+ first."
    echo "Download from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "ERROR: Node.js 18+ required. Current version: $(node -v)"
    exit 1
fi
echo "Node.js version: $(node -v)"

# Check npm
echo "[2/8] Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed."
    exit 1
fi
echo "npm version: $(npm -v)"

# Create project directories
echo ""
echo "[3/8] Creating project directories..."
mkdir -p client/src/components
mkdir -p client/src/contexts
mkdir -p client/src/hooks
mkdir -p client/src/pages
mkdir -p client/src/styles
mkdir -p client/src/utils
mkdir -p client/public
mkdir -p server/src/routes
mkdir -p server/src/middleware
mkdir -p server/src/models
mkdir -p server/src/services
mkdir -p server/src/utils
mkdir -p server/data
echo "Project directories created."

# Initialize client (React 18 with Vite)
echo ""
echo "[4/8] Setting up React client..."
if [ ! -f "client/package.json" ]; then
    cat > client/package.json << 'EOF'
{
  "name": "candiez-ca-client",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "lucide-react": "^0.309.0",
    "recharts": "^2.10.3",
    "axios": "^1.6.3"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "eslint": "^8.55.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "vite": "^5.0.8"
  }
}
EOF
    echo "Created client/package.json"
fi

# Create Vite config
if [ ! -f "client/vite.config.js" ]; then
    cat > client/vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
EOF
    echo "Created client/vite.config.js"
fi

# Initialize server (Node.js + Express)
echo ""
echo "[5/8] Setting up Express server..."
if [ ! -f "server/package.json" ]; then
    cat > server/package.json << 'EOF'
{
  "name": "candiez-ca-server",
  "version": "0.0.1",
  "type": "module",
  "main": "src/index.js",
  "scripts": {
    "dev": "node --watch src/index.js",
    "start": "node src/index.js",
    "db:init": "node src/scripts/init-db.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "better-sqlite3": "^9.2.2",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.22.4",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
EOF
    echo "Created server/package.json"
fi

# Install dependencies
echo ""
echo "[6/8] Installing dependencies..."
echo "Installing client dependencies..."
(cd client && npm install --silent)
echo "Installing server dependencies..."
(cd server && npm install --silent)
echo "Dependencies installed."

# Create environment files
echo ""
echo "[7/8] Creating environment configuration..."
if [ ! -f "server/.env" ]; then
    cat > server/.env << 'EOF'
# Candiez-CA Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=change-this-to-a-secure-random-string-in-production
JWT_EXPIRES_IN=8h

# Database
DATABASE_PATH=./data/candiez.db

# Tax Rate (California Cannabis Tax)
DEFAULT_TAX_RATE=15.0

# Loyalty Program
POINTS_PER_DOLLAR=1
SILVER_THRESHOLD=500
GOLD_THRESHOLD=1500
PLATINUM_THRESHOLD=5000
EOF
    echo "Created server/.env"
fi

if [ ! -f "client/.env" ]; then
    cat > client/.env << 'EOF'
# Candiez-CA Client Configuration
VITE_API_URL=http://localhost:3001/api
EOF
    echo "Created client/.env"
fi

# Create initial server entry point
echo ""
echo "[8/8] Creating initial server files..."
if [ ! -f "server/src/index.js" ]; then
    cat > server/src/index.js << 'EOF'
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Placeholder routes - to be implemented
app.get('/api/auth/me', (req, res) => {
  res.status(401).json({ error: 'Not authenticated' });
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
EOF
    echo "Created server/src/index.js"
fi

# Create client index.html
if [ ! -f "client/index.html" ]; then
    cat > client/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Candiez-CA | Dispensary CRM & Inventory</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF
    echo "Created client/index.html"
fi

# Create client entry point
if [ ! -f "client/src/main.jsx" ]; then
    cat > client/src/main.jsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF
    echo "Created client/src/main.jsx"
fi

# Create initial App component
if [ ! -f "client/src/App.jsx" ]; then
    cat > client/src/App.jsx << 'EOF'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<div>Login Page - Coming Soon</div>} />
        <Route path="/dashboard" element={<div>Dashboard - Coming Soon</div>} />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
EOF
    echo "Created client/src/App.jsx"
fi

# Create initial CSS with design system colors
if [ ! -f "client/src/styles/index.css" ]; then
    cat > client/src/styles/index.css << 'EOF'
/* Candiez-CA Design System */
:root {
  /* Primary Colors - Lavender Purple Theme */
  --color-primary: #B57EDC;
  --color-primary-light: #E8D5F2;
  --color-primary-dark: #7B4A9E;

  /* Secondary Accent Colors - Candy Theme */
  --color-teal: #5BC0BE;
  --color-pink: #F5A9B8;
  --color-yellow: #F7DC6F;

  /* Neutral Colors - Light Mode */
  --color-bg-light: #FAFAFA;
  --color-card-light: #FFFFFF;
  --color-text-primary: #2D2D2D;
  --color-text-secondary: #6B6B6B;

  /* Neutral Colors - Dark Mode */
  --color-bg-dark: #1A1A2E;
  --color-card-dark: #252542;
  --color-text-dark: #E8E8E8;

  /* Semantic Colors */
  --color-success: #4CAF50;
  --color-warning: #FF9800;
  --color-error: #F44336;
  --color-info: #2196F3;

  /* Typography */
  --font-heading: 'Poppins', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(181, 126, 220, 0.12);
  --shadow-md: 0 4px 6px rgba(181, 126, 220, 0.16);
  --shadow-lg: 0 10px 15px rgba(181, 126, 220, 0.2);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-body);
  background-color: var(--color-bg-light);
  color: var(--color-text-primary);
  line-height: 1.6;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: 600;
}
EOF
    echo "Created client/src/styles/index.css"
fi

echo ""
echo "=============================================="
echo "  Setup Complete!"
echo "=============================================="
echo ""
echo "To start development:"
echo ""
echo "  Terminal 1 (Server):"
echo "    cd server && npm run dev"
echo ""
echo "  Terminal 2 (Client):"
echo "    cd client && npm run dev"
echo ""
echo "  Access the application:"
echo "    Client: http://localhost:5173"
echo "    Server: http://localhost:3001"
echo "    API:    http://localhost:3001/api"
echo ""
echo "Default Admin Credentials (to be created):"
echo "    Email:    admin@candiez.com"
echo "    Password: admin123 (CHANGE IMMEDIATELY)"
echo ""
echo "=============================================="
