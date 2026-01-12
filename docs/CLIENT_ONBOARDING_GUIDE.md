# Candiez Dispensary Management System
## Client Onboarding Guide

Welcome to your new Candiez dispensary management system! This guide will walk you through everything you need to know to get started and run your business effectively.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Daily Operations Walkthrough](#daily-operations-walkthrough)
4. [Point of Sale (POS) Guide](#point-of-sale-pos-guide)
5. [Customer Management](#customer-management)
6. [Loyalty Program](#loyalty-program)
7. [Product & Inventory Management](#product--inventory-management)
8. [Transaction Management](#transaction-management)
9. [Reports & Analytics](#reports--analytics)
10. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### Accessing Your System

Your Candiez system is available at: **https://candiez.shop**

### Initial Login

1. Navigate to the login page
2. Enter your email and password
3. Click **Sign In**

### Demo Accounts (For Training)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@candiez.com | admin123 |
| Manager | manager@candiez.com | manager123 |
| Budtender | budtender@candiez.com | budtender123 |

> **Important**: Change these passwords immediately after your first login!

---

## User Roles & Permissions

Your system has three user roles, each with specific capabilities:

### Budtender (Front-line Staff)
- Process sales at Point of Sale
- Look up and create customers
- View product information
- Track daily transactions

### Manager (Shift Supervisors)
- Everything Budtenders can do, plus:
- Manage inventory and stock levels
- Void transactions and process refunds
- Create and edit products
- View transaction history
- Access reports

### Admin (Owners/System Administrators)
- Full system access
- Manage staff accounts
- Configure system settings
- Access all reports and analytics
- Delete products and categories

---

## Daily Operations Walkthrough

### Opening Shift

1. **Log In** to your account
2. **Navigate to POS** from the sidebar
3. **Start Your Shift**:
   - Enter your starting cash drawer amount
   - Click "Start Shift"
4. **Review Dashboard**:
   - Check low stock alerts
   - Review any pending tasks

### During the Day

1. **Process Sales** at the POS
2. **Register New Customers** as walk-ins arrive
3. **Check Stock Levels** if items seem low
4. **Handle Refunds/Voids** (Manager+ only)

### Closing Shift

1. **End Your Shift** in the POS
2. **Reconcile Cash Drawer**
3. **Review Daily Transactions**
4. **Check Inventory** for restock needs

---

## Point of Sale (POS) Guide

The POS is the heart of your daily operations. Here's how to complete a sale:

### Step 1: Start Your Shift

Before you can ring up sales, you must start a shift:

1. Go to **POS** in the sidebar
2. The Shift Start modal will appear
3. Count your cash drawer
4. Enter the starting amount
5. Click **Start Shift**

### Step 2: Build the Cart

1. **Browse Products**: Use category filters on the left
2. **Search**: Type product name or SKU in the search bar
3. **Add to Cart**: Click on a product to add it
4. **Adjust Quantity**: Use +/- buttons on cart items
5. **Remove Items**: Click the X or swipe left (mobile)

### Step 3: Select Customer (Optional but Recommended)

1. Click **Select Customer** button
2. Search by name, phone, or email
3. Click on the customer to select them
4. Their loyalty points will appear in the cart

> **Tip**: Always ask customers if they're loyalty members!

### Step 4: Apply Loyalty Points (If Applicable)

If the customer has loyalty points:

1. Their available points will display
2. Click **Redeem Points** to apply discount
3. Enter the number of points to redeem
4. Discount will be applied to subtotal

### Step 5: Process Payment

1. Review the order summary:
   - Subtotal
   - Tax (7.75% CA tax)
   - Loyalty discount (if any)
   - **Total**
2. Click **Checkout**
3. Select payment method:
   - **Cash**: Enter amount received, system calculates change
   - **Debit**: Process through your card terminal

### Step 6: Complete Transaction

1. Receipt displays on screen
2. Customer earns loyalty points (if registered)
3. Inventory automatically updates
4. Ready for next customer!

### Quick POS Tips

| Action | How To |
|--------|--------|
| Clear cart | Click "Clear Cart" button |
| Remove single item | Click X on item or swipe left |
| Change quantity | Use +/- buttons on item |
| Search products | Use search bar at top |
| Filter by category | Click category tabs |

---

## Customer Management

### Creating a New Customer

1. Go to **Customers** in the sidebar
2. Click **+ New Customer**
3. Fill in the required information:
   - First Name
   - Last Name
   - Phone Number
   - Email (optional)
   - Date of Birth
   - Notes (optional)
4. Click **Save Customer**

### Finding Existing Customers

1. Go to **Customers**
2. Use the search bar to search by:
   - Name
   - Phone number
   - Email
3. Click on a customer to view details

### Customer Profile Information

Each customer profile shows:
- Contact information
- Loyalty tier and points balance
- Purchase history
- Points history (earned/redeemed)
- Total lifetime spend

### Editing Customer Information

1. Find and click on the customer
2. Click **Edit** button
3. Update information
4. Click **Save Changes**

---

## Loyalty Program

Your loyalty program rewards repeat customers and encourages return visits.

### How Points Work

| Action | Points |
|--------|--------|
| $1 spent | 1 point earned |
| 100 points | $1.00 discount |

### Loyalty Tiers

| Tier | Requirement | Points Multiplier |
|------|-------------|-------------------|
| Bronze | 0 points | 1x (base) |
| Silver | 500 points | 1.25x |
| Gold | 1,500 points | 1.5x |
| Platinum | 5,000 points | 2x |

**Example**: A Gold member spending $100 earns 150 points instead of 100!

### Redeeming Points at POS

1. Add customer to transaction
2. Click **Redeem Points**
3. Enter points to redeem (or max)
4. Discount applied to total

### Checking Customer Points

1. Go to **Customers**
2. Search for customer
3. Click to view profile
4. Points balance shown on profile page

---

## Product & Inventory Management

### Viewing Products

1. Go to **Products** in the sidebar
2. Browse all products in a grid/list view
3. Use filters:
   - Category
   - In Stock / Low Stock / Out of Stock
   - Search by name or SKU

### Adding a New Product (Manager+)

1. Go to **Products**
2. Click **+ New Product**
3. Fill in product details:
   - **Name**: Product name
   - **SKU**: Unique identifier
   - **Category**: Select from dropdown
   - **Price**: Selling price
   - **Cost**: Your cost (for profit tracking)
   - **Stock**: Initial quantity
   - **Low Stock Threshold**: Alert when stock drops below this
   - **Strain Type**: Indica/Sativa/Hybrid (for flower)
   - **THC %**: THC content percentage
   - **CBD %**: CBD content percentage
   - **Description**: Product details
4. Click **Save Product**

### Managing Stock Levels (Manager+)

1. Go to **Inventory** in the sidebar
2. View all products with stock levels
3. Low stock items highlighted in yellow
4. Out of stock items highlighted in red

### Making Stock Adjustments (Manager+)

1. Go to **Inventory**
2. Find the product
3. Click **Adjust Stock**
4. Enter adjustment details:
   - **Quantity**: Positive to add, negative to remove
   - **Reason**: Select from:
     - Restock (new shipment)
     - Damage (damaged product)
     - Theft (stolen)
     - Admin Correction (fixing errors)
     - Return to Vendor
   - **Notes**: Additional details
5. Click **Confirm Adjustment**

### Bulk Import Products (Manager+)

1. Go to **Products**
2. Click **Import CSV**
3. Download template or prepare your CSV
4. Upload your file
5. Review and confirm import

### Export Products

1. Go to **Products**
2. Apply any filters desired
3. Click **Export CSV**
4. File downloads automatically

---

## Transaction Management

### Viewing Transaction History (Manager+)

1. Go to **Transactions** in the sidebar
2. View all sales with:
   - Date and time
   - Customer name
   - Items sold
   - Total amount
   - Payment method

### Filtering Transactions

Use the filters to find specific transactions:
- **Date Range**: Select start and end dates
- **Payment Method**: Cash or Debit
- **Customer**: Search by name
- **Status**: Active, Voided, Refunded

### Voiding a Transaction (Manager+)

Use void when the **entire transaction** was a mistake:

1. Find the transaction
2. Click to open details
3. Click **Void Transaction**
4. Confirm the void
5. Stock is automatically restored

> **Note**: Voided transactions cannot be undone!

### Processing a Refund (Manager+)

Use refund when customer returns items:

1. Find the transaction
2. Click to open details
3. Click **Refund**
4. Select items to refund:
   - Check items being returned
   - Enter quantities
5. Click **Process Refund**
6. Stock is automatically restored

---

## Reports & Analytics

### Dashboard Overview

Your dashboard shows at-a-glance metrics:

- **Today's Sales**: Total revenue today
- **Transactions**: Number of sales today
- **Customers Served**: Unique customers today
- **Average Transaction**: Average sale amount

### Low Stock Alerts

The dashboard shows products needing restock:
- Products below their low stock threshold
- Click to go directly to inventory

### Recent Transactions

Quick view of your last 10 transactions:
- Customer name
- Total amount
- Time

---

## Tips & Best Practices

### For Budtenders

1. **Always ask for loyalty cards** - Helps track customers and rewards
2. **Register walk-ins** - Even if they don't want loyalty, having their info helps
3. **Double-check quantities** - Verify cart before checkout
4. **Use the search** - Faster than browsing categories

### For Managers

1. **Check inventory daily** - Address low stock before it becomes out of stock
2. **Review transactions** - Look for unusual patterns
3. **Document adjustments** - Always add notes to stock adjustments
4. **Train staff regularly** - Ensure everyone knows the system

### For Admins

1. **Backup regularly** - Ensure your data is safe
2. **Update passwords** - Change default credentials immediately
3. **Review audit logs** - Monitor staff activity
4. **Set proper thresholds** - Configure low stock alerts appropriately

### General Tips

| Tip | Benefit |
|-----|---------|
| Use customer search in POS | Faster than creating new every time |
| Check stock before selling | Avoid disappointing customers |
| Complete shifts properly | Accurate cash reconciliation |
| Log out when leaving | Security best practice |

---

## Troubleshooting

### Common Issues

**Can't log in?**
- Check email/password spelling
- Contact admin to reset password
- Clear browser cache and try again

**POS not loading?**
- Refresh the page
- Check internet connection
- Try logging out and back in

**Inventory not updating?**
- Transaction may still be processing
- Refresh the page
- Check if transaction completed successfully

**Customer points not showing?**
- Ensure customer is selected in transaction
- Check if customer is in loyalty program
- Points update after transaction completes

### Getting Help

For technical support:
1. Contact your system administrator
2. Check the documentation
3. Report issues at: https://github.com/anthropics/claude-code/issues

---

## Quick Reference

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `/` | Focus search bar |
| `Esc` | Close modals |
| `Enter` | Confirm actions |

### Important URLs

| Resource | URL |
|----------|-----|
| Live System | https://candiez.shop |
| API Documentation | /api (internal) |

---

## Next Steps

1. **Change default passwords** for all demo accounts
2. **Set up real staff accounts** with appropriate roles
3. **Import your product catalog** via CSV
4. **Configure system settings** (tax rates, thresholds)
5. **Train your team** using this guide
6. **Start processing sales!**

---

*Welcome to Candiez! We're excited to help you manage your dispensary more efficiently.*
