# B2B Mandi App - .NET Core & Angular Architecture

**Last Updated:** January 2026 - Stock Market UI Features Added

## Project Structure
```
/mandi-b2b-dotnet
  ├── /Backend
  │   ├── Mandi.Api (API Gateway - future)
  │   ├── Identity.API (Auth & User Management)
  │   ├── Ordering.API (Business Logic - Orders, Buyers, Vendors, Transporters)
  │   │   ├── /Hubs
  │   │   │   └── PriceHub.cs (SignalR for Real-time Price Updates)
  │   │   └── /Controllers
  │   │       └── PriceTestController.cs (Price Change Simulation)
  │   ├── Marketplace.API (Product Catalog & Inventory)
  │   └── Logistics.Hub (SignalR for Real-time Tracking)
  ├── /Frontend
  │   ├── /src (Unified Angular Ionic App with Role-based Routing)
  │   │   ├── /pages/buyer (Buyer Portal Pages)
  │   │   │   └── /marketplace (Stock Market UI with Price Tickers)
  │   │   ├── /pages/vendor (Vendor Portal Pages)
  │   │   ├── /pages/transporter (Transporter Portal Pages)
  │   │   ├── /core/services
  │   │   │   └── signalr.service.ts (Real-time Price Sync)
  │   │   └── /pages/auth (Shared Authentication)
  │   ├── price-test.html (Price Ticker Testing Tool)
  ├── ARCHITECTURE.md
  ├── STOCK_MARKET_UI_FEATURES.md (Stock Market UI Documentation)
  └── DATABASE_SCHEMA.sql
```

## 1. Technology Stack
- **Backend:** .NET 8 Web API (C#)
- **Real-time:** ASP.NET Core SignalR (For Live Tracking & Price Updates)
- **Database:** PostgreSQL with Entity Framework (EF) Core
- **Mobile App:** Angular 17+ with Ionic/Capacitor (Cross-platform Android/iOS)
- **Auth:** JWT-based Identity with Role-based Access (Buyer, Vendor, Transporter)
- **UI Design:** Stock Market-inspired interface with real-time tickers

## 2. Micro-Service Architecture (Backend)

### Identity.API (Port 5001)
**Purpose:** Authentication, Authorization, User Management
- OTP-based phone authentication
- JWT token generation with role claims
- User profile management (Buyer, Vendor, Transporter)
- Role-based access control

**Key Entities:**
- `ApplicationUser` (IdentityUser with Role, CompanyName, GstNumber, etc.)
- `OtpVerification`

### Ordering.API (Port 5002)
**Purpose:** Core Business Logic + Real-time Price Sync
- Multi-vendor cart and checkout
- Escrow payment management
- Order lifecycle (Pending → VendorsNotified → ReadyForDispatch → InTransit → Delivered)
- Three-way payout distribution (Vendors, Transporter, Platform)
- Buyer, Vendor, Transporter profiles with business metrics
- **NEW:** Real-time price updates via SignalR PriceHub
- **NEW:** Price change simulation API for testing

**Key Entities:**
- `Buyer` - Restaurant/business buyers with credit limits
- `Vendor` - Agricultural suppliers with location and ratings
- `Transporter` - Delivery personnel with vehicle details
- `Order` - Multi-vendor orders with escrow tracking
- `OrderItem` - Individual items with vendor and pickup QR codes
- `Payment` - Escrow and payout distribution
- `Cart` - Shopping cart

### Marketplace.API (Port 5003)
**Purpose:** Product Catalog & Inventory
- Live product listings
- Vendor inventory management
- Price updates (Quick-Update mobile UI)
- Product search and filtering

**Key Entities:**
- `Product`
- `VendorInventory`
- `Category`

### Logistics.Hub (Port 5004)
**Purpose:** Real-time Delivery Tracking
- SignalR hub for GPS streaming
- Transporter location broadcasts
- Live order tracking for buyers
- Route optimization data

## 3. Mobile Strategy (Frontend)

### Unified Angular Ionic App
**Role-based Routing:**
- `/auth` - OTP login and registration
- `/buyer/*` - Buyer portal (marketplace, cart, orders, tracking)
- `/vendor/*` - Vendor portal (orders, products, quick-update, earnings)
- `/transporter/*` - Transporter portal (deliveries, scan, proof, map, earnings)

**Key Features:**
- **State Management:** Services with BehaviorSubjects for real-time updates
- **Native Features:** Capacitor plugins for Camera (QR), Geolocation, Push Notifications
- **Offline Support:** LocalStorage for cart persistence
- **Real-time:** SignalR client for delivery tracking

## 4. Three-Phase Order Flow

### Phase 1: Buyer Ordering with Escrow
1. Buyer adds products from multiple vendors to cart
2. System calculates Total Landing Cost:
   - Produce Cost (sum of items)
   - Logistics Fee (₹2/kg)
   - Service Fee (3% commission)
3. Buyer pays total amount via Razorpay/Stripe
4. Money held in Secure Escrow
5. System broadcasts pickup requests to all vendors

### Phase 2: Vendor Preparation & Transporter Assignment
1. Each vendor packs their items
2. Vendor clicks "Mark Ready for Pickup"
3. System generates QR code for each vendor's items
4. When ALL vendors mark ready:
   - System finds nearest available transporter
   - Sends optimized multi-stop route
   - Transporter accepts delivery
5. Transporter visits each vendor location
6. Scans QR code at each stop to confirm pickup
7. Changes status to "In Transit" after all pickups

### Phase 3: Delivery Confirmation & Automated Payout
1. Transporter arrives at buyer location
2. Buyer inspects item quality
3. Buyer scans "Delivery Received" QR code
4. System automatically releases escrow and distributes:
   - **Vendors:** Receive produce cost (split by item totals)
   - **Transporter:** Receives logistics fee
   - **Platform:** Receives service fee/commission
5. Order marked as Delivered
6. All parties receive payment confirmation

## 5. Database Design

### User Tables (Identity.API)
- `AspNetUsers` (ApplicationUser)
- `AspNetRoles`
- `OtpVerifications`

### Business Tables (Ordering.API)
- `Buyers` - Business profiles with credit limits
- `Vendors` - Supplier profiles with location and ratings
- `Transporters` - Delivery profiles with vehicle and availability
- `Orders` - Order headers with escrow status
- `OrderItems` - Line items with vendor and pickup tracking
- `Payments` - Payment and payout records
- `Carts` - Shopping carts
- `CartItems` - Cart line items

### Catalog Tables (Marketplace.API)
- `Products` - Product master
- `VendorInventory` - Stock and pricing per vendor
- `Categories` - Product categories

### Tracking Tables (Logistics.Hub)
- `DeliveryTracking` - GPS coordinates history
- `Routes` - Optimized delivery routes

## 6. Key Logic for Implementation

### Escrow Payment Flow
- Payment captured into escrow account on order creation
- `Order.EscrowStatus` = Held
- Funds locked until delivery confirmation
- On confirmation, `PaymentService.ReleaseEscrowAsync()` distributes to 3 parties

### Multi-Vendor Coordination
- Order splits into items grouped by `VendorId`
- Each vendor independently marks items ready
- Transporter only assigned when ALL vendors ready
- Each vendor gets their specific payout amount

### QR Code System
- **Pickup QR:** `PICKUP-{orderNumber}-VND-{vendorId}`
- **Delivery QR:** `DELIVERY-{orderNumber}-CONF-{timestamp}`

### Real-time Tracking
- Transporter app streams GPS via SignalR every 5 seconds
- Buyer app subscribes to delivery hub
- Shows live map with ETA updates

## 7. API Endpoints

### Identity.API
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `POST /api/auth/register`
- `GET /api/auth/profile`

### Ordering.API
- `POST /api/orders` - Create order with escrow
- `GET /api/orders/buyer-orders` - Buyer's orders
- `GET /api/orders/vendor-orders` - Vendor's orders
- `POST /api/orders/{id}/mark-ready` - Vendor marks ready
- `POST /api/orders/{id}/confirm-delivery` - Buyer confirms delivery
- `GET /api/buyers/{id}`
- `GET /api/vendors/{id}`
- `GET /api/transporters/{id}`
- **NEW:** `POST /api/pricetest/update-price` - Simulate price changes
- **NEW:** `POST /api/pricetest/simulate-price-drop` - Random price changes
- **NEW:** SignalR Hub: `/hubs/price` - Real-time price broadcast

### Marketplace.API
- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/vendor-inventory`

### Logistics.Hub
- SignalR Hub: `DeliveryTrackingHub`
- Methods: `JoinDelivery`, `UpdateLocation`, `CompleteDelivery`

---

## 8. 📊 Stock Market UI Features (v2.0)

### Overview
The marketplace features a **"Stock Market for Vegetables"** interface designed for instant price comparison and real-time updates.

### Key Components

#### 1. Price Tickers
- **Green ⬇️ Arrow:** Price dropped compared to baseline
- **Red ⬆️ Arrow:** Price increased compared to baseline
- Shows percentage change dynamically
- Animated pulse effect for visibility
- Price history tracked in `Map<string, {price, timestamp}>`

#### 2. Best Price Highlighting
- **#1 Best Value:** Green border, trophy badge, "Best Value" label
- **#2 Rank:** Yellow left border
- **#3 Rank:** Gray left border
- Multi-level sorting: Price → Rating → Stock quantity

#### 3. Visual Cues (Emoji Icons)
- Large product emojis for instant recognition (🍅 🧅 🥔 🥕 🥬 🍎 🍌 🥭)
- Faster identification than text labels
- Laymen-friendly interface design

#### 4. Status Tags
- **🌿 Fresh Arrival** (Green): Recently arrived, high quality (rating ≥ 4.7)
- **⚠️ Limited Stock** (Yellow): Quantity < 100 units
- **📦 Bulk Only** (Gray): Minimum order requirements (quantity > 500)

### Technical Implementation

#### Frontend (Angular + Ionic)
```typescript
// Price change tracking
getPriceChange(productId, vendorId, currentPrice): {
  direction: 'up' | 'down' | 'same',
  percentage: number
}

// Status tag generation
getStatusTags(vendor): string[] {
  // Returns ['Fresh Arrival', 'Limited Stock', 'Bulk Only']
}

// Price history storage
private priceHistory = new Map<string, {
  price: number,
  timestamp: Date
}>();
```

#### Backend (SignalR Hub)
```csharp
// PriceHub.cs
public class PriceHub : Hub {
  public async Task UpdatePrice(string productId, string vendorId, decimal newPrice) {
    await Clients.All.SendAsync("PriceUpdated", new {
      productId, vendorId, newPrice, timestamp = DateTime.UtcNow
    });
  }
}

// PriceTestController.cs
[HttpPost("update-price")]
public async Task<IActionResult> UpdatePrice([FromBody] PriceUpdateRequest request)
```

### User Experience Flow

#### Scenario 1: Price-Conscious Buyer
1. Opens marketplace → sees green ⬇️ 15% ticker on tomatoes
2. Recognizes 🍅 emoji instantly
3. Clicks **Quick Buy** on #1 Best Value
4. Auto-selects cheapest vendor
5. ✅ Purchase complete

#### Scenario 2: Quality-Focused Buyer
1. Expands accordion for product details
2. Sees **🌿 Fresh Arrival** and **⚠️ Limited Stock** badges
3. Chooses fresh arrival despite higher price
4. Adds to cart from vendor comparison

#### Scenario 3: Testing Price Changes
1. Opens `price-test.html` in browser
2. Backend running on `localhost:5002`
3. Clicks price change buttons
4. Watches tickers appear in marketplace tab
5. Validates real-time synchronization

### Animation & Styling
```scss
// Price ticker pulse animation
@keyframes tickerPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.75; transform: scale(0.95); }
}

// Price flash on update
@keyframes priceFlash {
  0%, 100% { transform: scale(1); background: transparent; }
  50% { transform: scale(1.15); background: rgba(40, 167, 69, 0.3); }
}

// Status tag styling
.status-chip {
  &[color="success"] { --background: rgba(40, 167, 69, 0.15); }
  &[color="warning"] { --background: rgba(255, 193, 7, 0.15); }
  &[color="medium"] { --background: rgba(146, 148, 151, 0.15); }
}
```

### Testing Tools
- **price-test.html:** Interactive price change simulator
- **SignalR Hub:** Real-time broadcast to all clients
- **PriceTestController:** API for programmatic updates

### Documentation
See [STOCK_MARKET_UI_FEATURES.md](./STOCK_MARKET_UI_FEATURES.md) for detailed documentation.

---

## 9. Future Enhancements

### Phase 1 (Current)
- ✅ Real-time price sync with SignalR
- ✅ Price tickers (up/down arrows)
- ✅ Best price highlighting
- ✅ Emoji icons for visual recognition
- ✅ Status tags (Fresh Arrival, Limited Stock, Bulk Only)
- ✅ Quick Buy functionality
- ✅ Trust-based vendor selection

### Phase 2 (Planned)
- [ ] Price history charts (last 7 days)
- [ ] Price alerts & notifications
- [ ] Trending indicators (📈 📉)
- [ ] Best time to buy suggestions
- [ ] Smart recommendations based on purchase history

### Phase 3 (Future)
- [ ] ML-based price forecasting
- [ ] Seasonal price patterns
- [ ] Vendor price reliability scoring
- [ ] Market average comparison
- [ ] Automated bidding system
