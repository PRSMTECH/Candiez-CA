# Active Context

**Last Updated**: 2026-01-12 (Ambassador Program Session)
**Project**: Candiez-CA

## Current Focus
<!-- What you're actively working on -->
- [x] Sign-up system with email verification
- [x] Referral code system (pyramid-style tracking)
- [x] Vercel project consolidation (merged `client` + `candiez-ca`)
- [x] GitHub auto-deploy connected to PRSMTECH/Candiez-CA
- [x] AnimatedLogo component with crossfade between two logos
- [x] Professional HTML email templates (verification + welcome)
- [x] Resend API configuration (Railway env var + dotenv fix)
- [x] Password reset flow (forgot-password, reset-password pages)
- [x] Vitest test framework (client + server)
- [x] **Ambassador Program** (complete tiered commission system)

## Active Features
<!-- Features currently in development -->
- Core CRM functionality - Production Ready
- Inventory management - Production Ready
- POS interface - Production Ready
- Loyalty program - Production Ready
- Sign-up with email verification - Production Ready
- Referral tracking system - Production Ready
- AnimatedLogo component - Production Ready
- Professional email templates - Production Ready
- Password reset flow - Production Ready
- Test framework (Vitest) - Configured
- **Ambassador Program** - Production Ready (deployed 2026-01-12)
  - User dashboard at `/referrals`
  - Admin panel at `/admin/referrals`
  - QR code sharing with Web Share API
  - 4 tiers: Member (5%), Promoter (7.5%), Ambassador (10%), Elite (15%)

## Known Blockers
<!-- Issues preventing progress -->
- None currently - all systems operational
- Resend API key configured in Railway (ready for production emails)

## Next Session Priorities
<!-- What to tackle next time -->
1. Set up CI/CD pipeline (GitHub Actions)
2. Add monitoring/logging
3. Customer onboarding and training docs
4. Test Ambassador Program in production with Josh

## Quick Notes
<!-- Temporary notes and reminders -->
- Demo users with referral codes:
  - admin@candiez.com / admin123 (ADUS0001)
  - manager@candiez.com / manager123 (MAUS0002)
  - budtender@candiez.com / budtender123 (BUTE0003)
- Production Frontend: https://candiez.shop
- Production Backend: https://candiez-ca-production.up.railway.app
- GitHub Repo: https://github.com/PRSMTECH/Candiez-CA
- Vercel Project: `candiezca` (vercel.com/prsmtechbuilds/candiezca)
- Railway Project Token: d5520c0b-ae7b-44bf-acba-92a3aab58457
- Logo URLs (Supabase):
  - Primary: https://hhdmovjjvlfkspqrzsjz.supabase.co/storage/v1/object/public/public-media/candiez/images/logos/official-logo.png
  - Secondary: https://hhdmovjjvlfkspqrzsjz.supabase.co/storage/v1/object/public/public-media/candiez/images/logos/Candiez2-logo.png
- CLIENT_URL defaults to https://candiez.shop (production)
- Test commands: `npm run test:run` (client or server)
- Total tests: 43 (referral 32 + auth 11)
- Latest commit: 5b838b7 (Ambassador Program)

---
**Usage**: Update at end of each session with current status
