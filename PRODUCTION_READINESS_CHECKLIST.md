# 🚀 Production Readiness Checklist - User Testing Phase

## Date: January 21, 2026
## Database: Supabase PostgreSQL (Migrated ✅)

---

## 📋 PHASE 1: CRITICAL - Must Complete Before Testing (Week 1)

### 1. 🔐 Authentication & Security
- [ ] **Test OTP SMS Service**
  - Configure real SMS provider (Twilio, AWS SNS, or MSG91)
  - Update `Identity.API/Services/OtpService.cs`
  - Test OTP delivery to real phones
  
- [ ] **Create Test User Accounts**
  - [ ] 2-3 Buyer accounts (Restaurant/Hotel owners)
  - [ ] 3-5 Vendor accounts (Different product suppliers)
  - [ ] 2 Transporter accounts (Delivery agents)
  - [ ] 1 Admin account
  - Document credentials in secure location

- [ ] **JWT Token Security**
  - [ ] Generate strong JWT secret key (32+ characters)
  - [ ] Update all appsettings.json files
  - [ ] Set token expiry (recommended: 24 hours)
  - [ ] Test token refresh mechanism

### 2. 🗄️ Database & Data
- [ ] **Verify Supabase Connection**
  - [ ] All 4 services connect successfully
  - [ ] Test connection pooling under load
  - [ ] Monitor connection limits
  
- [ ] **Seed Test Data** (Use seed-test-data.sql)
  - [ ] Create buyer profiles for test users
  - [ ] Create vendor profiles with business details
  - [ ] Create transporter profiles
  - [ ] Add 20-30 products with images
  - [ ] Add vendor inventory with competitive prices
  - [ ] Verify RLS policies work correctly

- [ ] **Backup Strategy**
  - [ ] Enable Supabase automatic backups
  - [ ] Document manual backup procedure
  - [ ] Test restore process

### 3. 🌐 API Deployment - **USING CLOUDFLARE TUNNEL** 🎉

**Cost: $0/month (instead of $50-200/month for cloud hosting)**

See detailed guide: [CLOUDFLARE_TUNNEL_GUIDE.md](CLOUDFLARE_TUNNEL_GUIDE.md)

- [ ] **Setup Cloudflare Tunnel** (15 minutes)
  ```powershell
  # 1. Install cloudflared
  .\setup-cloudflare-tunnel.ps1 -Action install
  
  # 2. Login to Cloudflare
  .\setup-cloudflare-tunnel.ps1 -Action login
  
  # 3. Create tunnel
  .\setup-cloudflare-tunnel.ps1 -Action create
  
  # 4. Configure DNS
  .\setup-cloudflare-tunnel.ps1 -Action dns -Domain mandiapp.in
  ```
  
- [ ] **Start Backend Services Locally**
  ```powershell
  .\start-all-services.ps1
  ```
  
- [ ] **Start Cloudflare Tunnel** (in separate terminal)
  ```powershell
  .\setup-cloudflare-tunnel.ps1 -Action start
  ```
  
- [ ] **Service URLs (Public HTTPS)**
  - [ ] Identity.API: https://identity-api.mandiapp.in
  - [ ] Marketplace.API: https://marketplace-api.mandiapp.in
  - [ ] Ordering.API: https://ordering-api.mandiapp.in
  - [ ] Logistics.Hub: https://logistics-hub.mandiapp.in
  
- [ ] **Verify CORS Configuration**
  - [x] All appsettings.json updated with Cloudflare Tunnel URLs
  - [ ] Restart all backend services after CORS update
  
- [ ] **Test Endpoints**
  ```bash
  curl https://identity-api.mandiapp.in/api/health
  curl https://marketplace-api.mandiapp.in/api/health
  curl https://ordering-api.mandiapp.in/api/health
  curl https://logistics-hub.mandiapp.in/api/health
  ```

### 4. 📱 Frontend Configuration
- [ ] **Environment Setup**
  - [x] API URLs updated in environment.prod.ts (Cloudflare Tunnel)
  - [x] API URLs updated in environment.tunnel.ts (for testing)
  - [ ] Configure SignalR hub URLs: https://logistics-hub.mandiapp.in
  - [ ] Test API connectivity from mobile app
  
- [ ] **Build Mobile App with Tunnel URLs**
  ```bash
  cd Frontend
  
  # Option 1: Use tunnel environment (recommended for testing)
  ng build --configuration=tunnel
  
  # Option 2: Use production environment
  ng build --configuration=production
  
  # Sync with Capacitor
  ionic cap sync android
  ```
  - [ ] Generate Android APK for testing
  - [ ] Install APK on test devices
  - [ ] Test from external network (not localhost)
  
- [ ] **Test Web Version**
  ```bash
  npm start
  ```
  - [ ] Test on Chrome/Safari/Firefox
  - [ ] Test responsive design
  - [ ] Test on tablets

### 5. 📸 Image Storage
- [ ] **Setup Supabase Storage**
  - [ ] Create bucket: `product-images`
  - [ ] Create bucket: `user-profiles`
  - [ ] Create bucket: `documents` (for licenses, etc.)
  - [ ] Configure public access for product images
  - [ ] Set up RLS policies for storage

- [ ] **Update Image Upload Code**
  - [ ] Implement Supabase storage upload in services
  - [ ] Add image compression
  - [ ] Test image upload from mobile
  - [ ] Add placeholder images for products

---

## 📋 PHASE 2: IMPORTANT - Complete for Full Functionality (Week 2)

### 6. 💳 Payment Integration
- [ ] **Razorpay Setup** (or alternative)
  - [ ] Create Razorpay account
  - [ ] Get Test API keys
  - [ ] Update appsettings.json
  - [ ] Update frontend environment.ts
  - [ ] Test payment flow end-to-end
  
- [ ] **Payment Testing**
  - [ ] Test successful payment
  - [ ] Test failed payment
  - [ ] Test payment timeout
  - [ ] Verify escrow flow
  - [ ] Test refund process

### 7. 📲 Push Notifications
- [ ] **Firebase Setup**
  - [ ] Create Firebase project
  - [ ] Add Android app to Firebase
  - [ ] Add iOS app (if applicable)
  - [ ] Download google-services.json
  - [ ] Update Frontend/capacitor.config.ts
  
- [ ] **Notification Types**
  - [ ] Order placed (to vendors)
  - [ ] Order ready (to buyers & transporters)
  - [ ] Order in transit (to buyers)
  - [ ] Order delivered (to all parties)
  - [ ] Price updates (to interested buyers)
  - [ ] Payment received (to vendors)

### 8. 🚚 Real-Time Features
- [ ] **SignalR Configuration**
  - [ ] Test price updates (PriceHub)
  - [ ] Test location tracking (TrackingHub)
  - [ ] Test order notifications
  - [ ] Test multi-device synchronization
  
- [ ] **WebSocket Connection**
  - [ ] Test on 4G/5G mobile networks
  - [ ] Test reconnection after network loss
  - [ ] Monitor connection stability
  - [ ] Add connection status indicator in UI

### 9. 📍 Location Services
- [ ] **GPS Tracking**
  - [ ] Request location permissions in app
  - [ ] Test real-time location updates
  - [ ] Test background location tracking
  - [ ] Implement battery optimization
  
- [ ] **Map Integration**
  - [ ] Add Google Maps API key
  - [ ] Test delivery tracking map
  - [ ] Test vendor location display
  - [ ] Test route optimization

### 10. 📊 Admin Dashboard
- [ ] **Analytics Setup**
  - [ ] Create admin role in database
  - [ ] Test admin login
  - [ ] Verify order monitoring
  - [ ] Test logistics heatmap
  - [ ] Test stuck orders alert
  
- [ ] **Monitoring**
  - [ ] Set up error logging (Sentry/AppInsights)
  - [ ] Monitor API response times
  - [ ] Track user activities
  - [ ] Set up alerts for critical errors

---

## 📋 PHASE 3: NICE TO HAVE - Enhanced Features (Week 3+)

### 11. 📄 Documentation
- [ ] **User Guides**
  - [ ] Buyer user guide
  - [ ] Vendor user guide
  - [ ] Transporter user guide
  - [ ] Admin guide
  
- [ ] **API Documentation**
  - [ ] Update Swagger descriptions
  - [ ] Add request/response examples
  - [ ] Document authentication flow
  - [ ] Create Postman collection

### 12. 🧪 Testing
- [ ] **Functional Testing**
  - [ ] Test complete order flow (Buyer → Vendor → Transporter → Delivery)
  - [ ] Test cart operations
  - [ ] Test price comparison
  - [ ] Test payment flow
  - [ ] Test QR code scanning
  - [ ] Test order cancellation
  
- [ ] **Performance Testing**
  - [ ] Test with 10+ concurrent users
  - [ ] Test with 100+ products
  - [ ] Test SignalR with multiple connections
  - [ ] Monitor database query performance
  
- [ ] **Mobile Testing**
  - [ ] Test on different Android versions
  - [ ] Test on different screen sizes
  - [ ] Test offline functionality
  - [ ] Test low network conditions
  - [ ] Test battery consumption

### 13. 🔒 Security Audit
- [ ] **Code Review**
  - [ ] Review SQL injection risks
  - [ ] Review XSS vulnerabilities
  - [ ] Check authentication bypass attempts
  - [ ] Verify RLS policies
  
- [ ] **Infrastructure**
  - [ ] Enable HTTPS only
  - [ ] Set up rate limiting
  - [ ] Configure firewall rules
  - [ ] Enable DDoS protection
  
- [ ] **Data Privacy**
  - [ ] Mask sensitive data in logs
  - [ ] Implement data retention policy
  - [ ] Add user data export feature
  - [ ] Add account deletion feature

### 14. 📱 App Store Preparation
- [ ] **Android**
  - [ ] Create app icons (all sizes)
  - [ ] Create splash screens
  - [ ] Write app description
  - [ ] Take screenshots
  - [ ] Create privacy policy
  - [ ] Create terms of service
  - [ ] Generate signed APK
  - [ ] Create Google Play Console account
  
- [ ] **iOS** (if applicable)
  - [ ] Similar preparation for App Store
  - [ ] Get Apple Developer account
  - [ ] Set up TestFlight for beta testing

---

## 🚀 QUICK START GUIDE FOR TESTING

### Day 1: Setup & Deploy

1. **Start All Backend Services**
```powershell
# Terminal 1 - Identity API
cd d:\MandiApp\Backend\Services\Identity.API
dotnet run

# Terminal 2 - Marketplace API
cd d:\MandiApp\Backend\Services\Marketplace.API
dotnet run

# Terminal 3 - Ordering API
cd d:\MandiApp\Backend\Services\Ordering.API
dotnet run

# Terminal 4 - Logistics Hub
cd d:\MandiApp\Backend\Services\Logistics.Hub
dotnet run
```

2. **Start Frontend**
```powershell
cd d:\MandiApp\Frontend
npm install
npm start
```
Access at: http://localhost:8100

3. **Create Test Users**
- Open Swagger: http://localhost:5003/swagger
- Register 3 buyers, 5 vendors, 2 transporters
- Save credentials

### Day 2: Seed Data

1. **Run Seed Script**
```powershell
cd d:\MandiApp\DbMigrationRunner
# Update seed-test-data.sql with actual user IDs
# Run the seed script
```

2. **Add Product Images**
- Upload images via Supabase dashboard or API

3. **Test Order Flow**
- Login as buyer → Add to cart → Checkout
- Login as vendor → Accept order → Mark ready
- Login as transporter → Accept delivery → Update location
- Login as buyer → Confirm delivery

### Day 3: Real-Time Testing

1. **Test Price Updates**
- Open app on 2 devices
- Update price as vendor
- Verify buyer sees price change in real-time

2. **Test Location Tracking**
- Start delivery as transporter
- Enable GPS
- Verify buyer sees live location

3. **Test Notifications**
- Place order
- Verify all parties receive notifications

---

## 📞 SUPPORT & RESOURCES

### Key Configuration Files
- Backend APIs: `appsettings.json` (each service)
- Frontend: `src/environments/environment.ts`
- Database: Supabase Dashboard
- Mobile: `capacitor.config.ts`

### Important URLs
- Supabase Dashboard: https://supabase.com/dashboard
- Razorpay Dashboard: https://dashboard.razorpay.com
- Firebase Console: https://console.firebase.google.com
- Google Cloud Console: https://console.cloud.google.com

### Database Connection
```
Host: db.iytscokxxuxprrivmzvg.supabase.co
Database: postgres
User: postgres
Password: PYvWmYoMYiO3RiCJ
```

---

## ⚠️ KNOWN ISSUES & LIMITATIONS

1. **No SMS Service Configured**
   - Currently using mock OTP
   - Need to integrate real SMS provider

2. **Payment Gateway**
   - Using test mode
   - Need production keys for real payments

3. **Image Storage**
   - Need to set up Supabase storage buckets
   - Currently no images for products

4. **Push Notifications**
   - Firebase not configured
   - Need to set up FCM

5. **Background Location**
   - iOS requires special permissions
   - May drain battery

---

## 🎯 SUCCESS CRITERIA FOR USER TESTING

### Minimum Viable Product (MVP)
- [ ] Users can register with phone OTP
- [ ] Buyers can browse products from multiple vendors
- [ ] Buyers can add items to cart and checkout
- [ ] Vendors receive order notifications
- [ ] Vendors can update inventory and prices
- [ ] Prices update in real-time for buyers
- [ ] Payment flow works (even in test mode)
- [ ] Basic order tracking available

### Full Feature Set
- [ ] All of above + 
- [ ] Real-time delivery tracking with GPS
- [ ] QR code verification at pickup/delivery
- [ ] Push notifications for all events
- [ ] Admin dashboard for monitoring
- [ ] Escrow payment release on delivery
- [ ] Rating and review system

---

## 📅 RECOMMENDED TIMELINE

| Week | Focus | Deliverables |
|------|-------|--------------|
| Week 1 | Critical Setup | Auth working, APIs deployed, Test users created |
| Week 2 | Core Features | Orders working, Payments working, Real-time active |
| Week 3 | Polish & Testing | Notifications, GPS tracking, Bug fixes |
| Week 4 | User Testing | Beta testing with real users, Feedback collection |

---

## 💡 NEXT IMMEDIATE STEPS

1. **Right Now** (Next 2 hours)
   - [ ] Test all 4 backend services start without errors
   - [ ] Create 3 test user accounts (1 buyer, 1 vendor, 1 transporter)
   - [ ] Add 5 products with vendor inventory
   - [ ] Test one complete order flow

2. **Today** (Next 8 hours)
   - [ ] Deploy APIs to a public server (Railway/Render/Azure)
   - [ ] Update frontend environment with public URLs
   - [ ] Build Android APK
   - [ ] Test app on real phone

3. **This Week**
   - [ ] Set up Supabase storage for images
   - [ ] Configure real SMS service
   - [ ] Set up Firebase for notifications
   - [ ] Create 20-30 test products with images
   - [ ] Complete end-to-end testing with 5 test users

---

**Status:** Ready for Phase 1 implementation ✅
**Database:** Migrated and ready ✅
**Next Action:** Start backend deployment and test user creation
