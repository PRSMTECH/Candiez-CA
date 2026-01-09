# Technical Decision Log

**Project**: Candiez-CA

---

## 2026-01-09 - Initial Architecture

**Context**: Building a dispensary CRM system that needs to be lightweight, easy to deploy, and feature-rich.

**Decision**: Monorepo with React + Vite frontend and Express + SQLite backend

**Rationale**:
- SQLite provides zero-configuration database perfect for single-location dispensary
- Express offers flexible, well-understood backend framework
- React 18 with Vite provides fast development experience
- Monorepo keeps client and server code together

**Alternatives Considered**:
- Next.js full-stack (more complex for this use case)
- PostgreSQL (overkill for single-location)
- Separate repositories (harder to coordinate)

**Impact**:
- Simple deployment (single server can run both)
- Easy local development
- No external database dependencies

---

## 2026-01-09 - Authentication Strategy

**Context**: Need secure authentication with role-based access control

**Decision**: JWT tokens with bcrypt password hashing, stored in localStorage

**Rationale**:
- JWT allows stateless authentication
- bcrypt provides secure password hashing
- Three roles (admin/manager/budtender) cover all use cases
- 24-hour token expiry balances security and convenience

**Alternatives Considered**:
- Session-based auth (requires server state)
- OAuth (overkill for internal system)
- httpOnly cookies (more complex setup)

**Impact**:
- Stateless server design
- Simple role checking on routes
- Need to handle token expiry in frontend

---

## 2026-01-09 - Styling Approach

**Context**: Need consistent candy-themed design across components

**Decision**: CSS Modules with custom properties for theming

**Rationale**:
- CSS Modules provide component-scoped styles
- Custom properties enable easy theme customization
- antd-mobile provides mobile-optimized components
- No heavy CSS framework needed

**Alternatives Considered**:
- Tailwind CSS (different design approach)
- Styled Components (runtime overhead)
- Plain CSS (no scoping)

**Impact**:
- Each component has isolated styles
- Easy to maintain candy theme
- Mobile-friendly out of the box

---

## 2026-01-09 - Loyalty Program Design

**Context**: Dispensary wants to reward repeat customers

**Decision**: Points-based system with tier multipliers (Bronze/Silver/Gold/Platinum)

**Rationale**:
- Simple points = dollars spent model
- Tier multipliers encourage customer retention
- Configurable thresholds via settings
- Points redeemable at POS

**Alternatives Considered**:
- Percentage discounts only (less engaging)
- Visit-based rewards (harder to track value)
- External loyalty provider (added complexity)

**Impact**:
- Customers earn points on every purchase
- Higher tiers earn points faster
- Integrated with POS workflow

---
**Usage**: Add entry whenever making significant technical decisions
