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

## 2026-01-10 - Production Deployment Architecture

**Context**: Need to deploy the monorepo with separate frontend and backend services

**Decision**: Vercel for frontend (React/Vite) + Railway for backend (Express/SQLite)

**Rationale**:
- Vercel excels at static site hosting with edge CDN
- Railway handles Node.js with native modules (better-sqlite3)
- Vercel rewrites proxy /api requests to Railway
- Both platforms have generous free tiers

**Alternatives Considered**:
- Single server deployment (harder to scale)
- Docker on a VPS (more maintenance)
- Vercel serverless functions (SQLite persistence issues)

**Impact**:
- Frontend: https://candiez.shop (Vercel)
- Backend: https://candiez-ca-production.up.railway.app (Railway)
- Seamless API proxying via vercel.json rewrites

---

## 2026-01-10 - GitHub Organization Move

**Context**: Project originally in personal MrJPTech repo, needed to move to business org

**Decision**: Move repository to PRSMTECH organization

**Rationale**:
- Centralizes all business projects
- Better team access control
- Professional organization for client projects

**Impact**:
- New repo URL: https://github.com/PRSMTECH/Candiez-CA
- Vercel reconnected to new repo
- Railway connected to PRSMTECH org

---

## 2026-01-10 - Railway Native Module Fix

**Context**: better-sqlite3 and bcrypt require native compilation, failed on Railway

**Decision**: Add nixpacks.toml with Python/GCC build tools + explicit npm rebuild

**Rationale**:
- Native modules must be compiled for Linux (Railway's OS)
- Windows-compiled binaries won't work
- Build tools (python3, gcc, gnumake) required for node-gyp

**Impact**:
- nixpacks.toml configures Railway build environment
- postinstall script rebuilds native modules
- Database directory auto-created on startup

---

## 2026-01-12 - Sign-Up System with Email Verification

**Context**: Need user self-registration with email verification for security

**Decision**: Implement sign-up flow with Resend API for transactional emails, graceful dev fallback

**Rationale**:
- Resend API provides reliable transactional email delivery
- Dev mode fallback logs emails to console when API key missing
- Email verification prevents fake accounts
- Token-based verification with 24-hour expiry

**Alternatives Considered**:
- SendGrid (more complex setup)
- Nodemailer with SMTP (less reliable)
- No email verification (security risk)

**Impact**:
- New signup page at /signup
- Email verification page at /verify-email
- Database columns: email_verified, email_verification_token, email_verification_expires
- Environment variable: RESEND_API_KEY (optional for dev)

---

## 2026-01-12 - Pyramid-Style Referral System

**Context**: Josh Tenove requested referral tracking per meeting notes

**Decision**: Implement referral codes with tracking tables for pyramid-style analytics

**Rationale**:
- Every user gets unique referral code (format: XXXX0001)
- Signup form accepts referral codes
- URL parameter support (?ref=CODE)
- referral_tracking table for audit trail
- referral_rewards table for future reward calculations

**Alternatives Considered**:
- Simple referral count (no tracking detail)
- Third-party referral service (added cost/complexity)
- No referral system (missed growth opportunity)

**Impact**:
- Demo users have codes: ADUS0001, MAUS0002, BUTE0003
- New tables: referral_tracking, referral_rewards
- User columns: referral_code, referred_by_user_id, referred_by_code

---

## 2026-01-12 - Vercel Project Consolidation

**Context**: Two Vercel projects existed (client + candiez-ca) after repo migration

**Decision**: Consolidate to single `client` project with GitHub auto-deploy

**Rationale**:
- Repo moved from MrJPTech to PRSMTECH org
- Old candiez-ca project still connected to old GitHub location
- Single project simplifies deployment and monitoring
- GitHub integration enables auto-deploy on push

**Impact**:
- Single Vercel project: `client`
- Domain: candiez.shop → client project
- GitHub: Connected to PRSMTECH/Candiez-CA
- Auto-deploy: Enabled on push to master

---
**Usage**: Add entry whenever making significant technical decisions
