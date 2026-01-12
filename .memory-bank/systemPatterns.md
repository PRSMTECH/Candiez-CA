# System Patterns & Conventions

**Project**: Candiez-CA
**Last Updated**: 2026-01-12

## Code Organization

### Directory Structure
```
Candiez-CA/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # UI components (CSS Modules)
│   │   ├── contexts/          # React Context providers
│   │   ├── hooks/             # Custom hooks
│   │   ├── pages/             # Route pages
│   │   └── App.jsx            # Main app with routing
│   ├── public/
│   └── package.json
├── server/                    # Express backend
│   ├── src/
│   │   ├── db/
│   │   │   └── database.js    # SQLite schema init
│   │   ├── scripts/
│   │   │   └── init-db.js     # DB initialization
│   │   └── index.js           # Express server (all routes)
│   └── package.json
├── prompts/
│   └── app_spec.txt           # Project specification
├── .memory-bank/              # This directory
└── CLAUDE.md
```

## Naming Conventions

### Files
- Components: PascalCase (CustomerManagement.jsx)
- Styles: ComponentName.module.css
- Pages: PascalCase (Dashboard.jsx)
- Utilities: camelCase (formatDate.js)

### Variables
- camelCase for variables and functions
- PascalCase for React components
- UPPER_SNAKE_CASE for constants

## Component Patterns

### Standard Component Structure
```jsx
import { useState, useEffect } from 'react'
import styles from './ComponentName.module.css'

export default function ComponentName({ prop }) {
  const [state, setState] = useState(null)

  useEffect(() => {
    // Side effects
  }, [])

  return (
    <div className={styles.container}>
      {/* JSX */}
    </div>
  )
}
```

### Protected Route Pattern
```jsx
<Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminPage />
    </ProtectedRoute>
  }
/>
```

## State Management

- **AuthContext**: JWT token, user info, login/logout functions
- **Local useState**: Component-specific state
- **No Redux**: Simpler Context + useReducer pattern

## API Patterns

### Fetch with JWT
```javascript
const response = await fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

### Server Endpoint Pattern
```javascript
app.get('/api/resource', authenticateToken, (req, res) => {
  try {
    const data = db.prepare('SELECT * FROM table').all()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

### Zod Validation Pattern
```javascript
const schema = z.object({
  name: z.string().min(1),
  email: z.string().email()
})

const validated = schema.parse(req.body)
```

## Error Handling

### Frontend
```javascript
try {
  const response = await fetch(...)
  if (!response.ok) throw new Error('Request failed')
  const data = await response.json()
} catch (error) {
  console.error(error)
  setError(error.message)
}
```

### Backend
```javascript
try {
  // Database operation
} catch (error) {
  console.error('Operation failed:', error)
  res.status(500).json({ error: error.message })
}
```

## Database Patterns

### Prepared Statements (Security)
```javascript
const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
const user = stmt.get(userId)
```

### Transaction Pattern
```javascript
const insertMany = db.transaction((items) => {
  for (const item of items) {
    insertStmt.run(item)
  }
})
insertMany(items)
```

## Styling Patterns

### CSS Module Import
```jsx
import styles from './Component.module.css'

<div className={styles.container}>
```

### CSS Custom Properties
```css
.container {
  background: var(--candy-purple);
  color: var(--text-light);
}
```

### Candy Theme Colors
- Primary: Purple/lavender palette
- Success: Green
- Warning: Amber
- Error: Red

## Authentication Flow

### Login Flow
1. User submits login form
2. Server validates credentials, returns JWT
3. Frontend stores token in localStorage
4. AuthContext provides token to components
5. Protected routes check auth state
6. API requests include Bearer token

### Sign-Up Flow (New)
1. User fills signup form (with optional referral code)
2. Server validates input with Zod
3. Creates user with `status: 'pending'`, `email_verified: 0`
4. Generates unique referral code (format: XXXX0001)
5. Tracks referral if referral code provided
6. Sends verification email (or logs to console in dev)
7. User clicks verification link
8. Server verifies token, sets `email_verified: 1`
9. User can now log in

### Referral Code Pattern
```javascript
// Generate unique referral code
const generateReferralCode = (firstName, lastName, id) => {
  const prefix = (firstName[0] + firstName[1] + lastName[0] + lastName[1]).toUpperCase();
  return `${prefix}${String(id).padStart(4, '0')}`;
};
// Example: ADUS0001, MAUS0002, BUTE0003
```

## Roles & Permissions

| Role | Dashboard | Customers | Products | Inventory | POS | Reports | Settings |
|------|-----------|-----------|----------|-----------|-----|---------|----------|
| admin | Full | Full | Full | Full | Full | Full | Full |
| manager | View | Full | Full | Full | Full | Full | Limited |
| budtender | View | Limited | View | View | Full | None | None |

---
**Usage**: Update when establishing new patterns or conventions
