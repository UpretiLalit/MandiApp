# User Flows by Role

## Overview
The MandiApp supports 4 distinct user roles, each with their own authentication flow, landing page, and features.

---

## 1. Buyer Flow

### Registration
1. Enter phone number → Receive OTP
2. Verify OTP → New user detected
3. Fill registration form:
   - Full Name
   - Select Role: **Buyer**
4. Submit → Redirect to **Marketplace** (`/marketplace`)

### Login
1. Enter phone number → Receive OTP
2. Verify OTP → Existing user detected
3. Auto-redirect to **Marketplace** (`/marketplace`)

### Features
- Browse products by category
- View product details with pricing
- Add products to cart
- Place orders
- Track order status
- View order history
- Rate vendors

---

## 2. Vendor Flow

### Registration
1. Enter phone number → Receive OTP
2. Verify OTP → New user detected
3. Fill registration form:
   - Full Name
   - Select Role: **Vendor**
   - Company Name (required)
   - GST Number (required)
4. Submit → Redirect to **Vendor Products** (`/vendor/products`)

### Login
1. Enter phone number → Receive OTP
2. Verify OTP → Existing vendor detected
3. Auto-redirect to **Vendor Products** (`/vendor/products`)

### Features
- View product catalog (set by admin)
- Add products from catalog to their inventory
- Set their own selling prices
- Manage inventory levels
- View incoming orders
- Update order status
- View sales reports
- Manage company profile

### Important Notes
- Vendors cannot create new product types (only admin can)
- Vendors select from existing product catalog and set their prices
- Each vendor has independent pricing for the same products

---

## 3. Transporter Flow

### Registration
1. Enter phone number → Receive OTP
2. Verify OTP → New user detected
3. Fill registration form:
   - Full Name
   - Select Role: **Transporter**
4. Submit → Redirect to **Transporter Dashboard** (`/transporter/dashboard`)

### Login
1. Enter phone number → Receive OTP
2. Verify OTP → Existing transporter detected
3. Auto-redirect to **Transporter Dashboard** (`/transporter/dashboard`)

### Features
- View available delivery jobs
- Accept delivery assignments
- Update delivery status
- Navigate to pickup/delivery locations
- View delivery history
- Earnings dashboard

---

## 4. Admin Flow

### Registration
1. Enter phone number → Receive OTP
2. Verify OTP → New user detected
3. Fill registration form:
   - Full Name
   - Select Role: **Admin**
4. Submit → Redirect to **Admin Panel** (`/admin`)

### Login
1. Enter phone number → Receive OTP (hardcoded for testing: 8287433081)
2. Verify OTP
3. Auto-redirect to **Admin Panel** (`/admin`)

### Features
- **Product Catalog Management** (`/admin/products`)
  - Create base product types (with emoji icons)
  - Set reference/base prices
  - Manage categories
  - Note: Vendors will set their own prices
  
- **KYC Verification** (`/admin/verification`)
  - Approve/reject vendor registrations
  - Verify GST numbers
  - Review company documents

- **User Management** (`/admin/users`)
  - View all users by role
  - Activate/deactivate accounts
  - Assign mandis to vendors

- **Mandi & Hub Management** (`/admin/hubs`)
  - Create mandi locations
  - Set operating hours
  - Manage logistics zones

- **Marketplace Management** (`/admin/marketplace`)
  - Define quality standards
  - Set price alerts
  - Monitor market trends

- **Logistics** (`/admin/logistics`)
  - View demand heatmap
  - Optimize delivery routes
  - Manage transporter assignments

- **Reports** (`/admin/reports`)
  - Sales analytics
  - User growth metrics
  - Revenue reports

---

## Authentication Flow Diagram

```
User enters phone number
         ↓
   System sends OTP
         ↓
   User enters OTP
         ↓
   OTP verification
         ↓
    ┌────┴────┐
    │         │
New User   Existing User
    │         │
    ↓         ↓
Registration  Role Detection
with Role     │
Selection     ├── Buyer → /marketplace
    │         ├── Vendor → /vendor/products
    │         ├── Transporter → /transporter/dashboard
    │         └── Admin → /admin
    │
    └─→ Role-based redirect after registration
```

---

## Logout Flow (All Roles)

1. Click Logout button (in profile or menu)
2. Confirm logout action
3. System clears:
   - Capacitor Preferences (auth tokens)
   - localStorage (all browser data)
   - sessionStorage (session data)
4. Redirect to Login page (`/auth/login`)
5. Browser back button is disabled (cannot return to authenticated pages)

---

## Key Principles

### 1. Role-Based Access Control (RBAC)
- Each role has specific permissions
- Routes are protected by role guards
- Features are conditionally displayed based on role

### 2. Product Management Separation
- **Admin**: Creates product catalog (types, categories, base prices)
- **Vendor**: Adds products to their inventory and sets their prices
- **Buyer**: Views vendor-specific products and prices

### 3. Price Management
- Admin sets "reference price" in product catalog
- Each vendor sets their own "selling price" for products
- Buyers see vendor-specific prices
- This allows market competition and price discovery

### 4. Registration Validation
- Phone number must be unique
- GST number required for vendors
- Company name required for vendors
- Role selection is mandatory

### 5. Security
- OTP-based authentication (no passwords)
- JWT tokens for API authorization
- Role claims in JWT tokens
- Session timeout on inactivity
- Complete storage clearing on logout

---

## Testing Users

### Admin
- Phone: 8287433081
- OTP: Any 6-digit number (dev mode)
- Landing: `/admin`

### Test Vendor
1. Register with new phone number
2. Select "Vendor" role
3. Fill company details
4. Should land on `/vendor/products`

### Test Buyer
1. Register with new phone number
2. Select "Buyer" role
3. Should land on `/marketplace`

### Test Transporter
1. Register with new phone number
2. Select "Transporter" role
3. Should land on `/transporter/dashboard`

---

## Common Issues & Solutions

### Issue: Registered as Vendor but can't login
**Cause**: Login was hardcoding role to "Buyer"  
**Fix**: Updated login.page.ts to use backend response role  
**Status**: ✅ Fixed

### Issue: Can navigate back after logout
**Cause**: Logout wasn't clearing all storage  
**Fix**: Added complete storage clearing + replaceUrl: true  
**Status**: ✅ Fixed

### Issue: Admin can't add products
**Cause**: Products page wasn't integrated  
**Fix**: Created full product management with emoji picker  
**Status**: ✅ Fixed

### Issue: Vendor redirect to marketplace
**Cause**: Registration hardcoded /marketplace redirect  
**Fix**: Role-based redirect logic  
**Status**: ✅ Fixed

---

## Future Enhancements

1. **Multi-vendor comparison** - Buyers compare prices across vendors
2. **Vendor ratings** - Buyers rate vendors, affects visibility
3. **Dynamic pricing** - Vendors set time-based pricing rules
4. **Inventory alerts** - Notify vendors of low stock
5. **Delivery tracking** - Real-time GPS tracking for orders
6. **Push notifications** - Order updates, delivery alerts
7. **Multi-language** - Support regional languages
8. **Payment integration** - UPI, cards, wallets
9. **Analytics dashboard** - Role-specific insights
10. **Bulk operations** - Admin bulk import products, vendors bulk update prices

---

## API Endpoints by Role

### Buyer
- `GET /api/products` - Browse products
- `POST /api/orders` - Place order
- `GET /api/orders/my-orders` - View orders

### Vendor
- `GET /api/products` - View catalog
- `POST /api/vendor/inventory` - Add to inventory
- `PUT /api/vendor/inventory/{id}` - Update price
- `GET /api/orders/vendor-orders` - View orders

### Transporter
- `GET /api/logistics/available-jobs` - View jobs
- `POST /api/logistics/accept-job` - Accept delivery
- `PUT /api/logistics/update-status` - Update status

### Admin
- `POST /api/products` - Create product type
- `PUT /api/products/{id}` - Update product
- `GET /api/users` - View all users
- `PUT /api/users/{id}/approve` - Approve vendor
- `GET /api/reports/sales` - View reports

---

## Summary

Each role has a **distinct journey** through the app:
- **Buyers** focus on purchasing and tracking orders
- **Vendors** manage inventory and fulfill orders  
- **Transporters** handle deliveries and logistics
- **Admins** oversee the entire marketplace

The system is designed to keep these flows **separate and streamlined**, preventing confusion and ensuring each user type can accomplish their goals efficiently.
