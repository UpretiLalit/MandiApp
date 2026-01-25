# 🚀 MandiApp Deployment Checklist - Ready to Test!

## ✅ What's Already Done:

### 1. Backend Services (Complete ✓)
- **Identity.API** (Port 5003) - Authentication, OTP
- **Marketplace.API** (Port 5001) - Products, Vendors
- **Ordering.API** (Port 5002) - Orders, Cart, Payments
- **Logistics.Hub** (Port 5004) - Tracking, Delivery

### 2. Cloudflare Tunnel (Configured ✓)
- Tunnel ID: `dad9ffa0-5cf2-4ea0-8a88-f4547c976f0c`
- Tunnel Name: `mandiapp-tunnel`
- Config file: `cloudflared-config.yml` ✓
- Credentials: `C:\Users\lalit\.cloudflared\dad9ffa0-5cf2-4ea0-8a88-f4547c976f0c.json` ✓

### 3. Public URLs (Ready ✓)
```
Identity API:    https://identity-api.mandiapp.in
Marketplace API: https://marketplace-api.mandiapp.in
Ordering API:    https://ordering-api.mandiapp.in
Logistics Hub:   https://logistics-hub.mandiapp.in
```

### 4. SignalR (Implemented ✓)
- Real-time price updates
- Live order tracking
- WebSocket support enabled in Cloudflare

### 5. Frontend (Ready ✓)
- Angular/Ionic app configured
- Environment files updated for tunnel URLs
- SignalR client integrated

---

## 🔧 What Needs to be Done:

### Step 1: Add Twilio WhatsApp Configuration

You have Twilio credentials - let's integrate them:

#### **Option A: Add to appsettings.json (Recommended for Testing)**

Add to each service's `appsettings.json`:

**Identity.API/appsettings.json:**
```json
{
  "Logging": { ... },
  "AllowedHosts": "*",
  "ConnectionStrings": { ... },
  "JwtSettings": { ... },
  "OtpSettings": { ... },
  "TwilioSettings": {
    "AccountSid": "AC1bac0b94413d260c266bb30b69b6b44e",
    "AuthToken": "9dbcf6421e625b7161d950a9ce5dc204",
    "WhatsAppFrom": "whatsapp:+14155238886"
  },
  "AllowedOrigins": [ ... ]
}
```

**Ordering.API/appsettings.json:**
```json
{
  "Logging": { ... },
  "AllowedHosts": "*",
  "ConnectionStrings": { ... },
  "JwtSettings": { ... },
  "TwilioSettings": {
    "AccountSid": "AC1bac0b94413d260c266bb30b69b6b44e",
    "AuthToken": "9dbcf6421e625b7161d950a9ce5dc204",
    "WhatsAppFrom": "whatsapp:+14155238886"
  },
  "AllowedOrigins": [ ... ]
}
```

#### **Option B: Use Environment Variables (Better for Production)**

Create `.env` file in each service folder:
```bash
TWILIO_ACCOUNT_SID=AC1bac0b94413d260c266bb30b69b6b44e
TWILIO_AUTH_TOKEN=9dbcf6421e625b7161d950a9ce5dc204
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

---

### Step 2: Start All Services

**Terminal 1 - Start Backend Services:**
```powershell
.\start-all-services.ps1
```

Wait for all 4 services to show "Now listening on..."

**Terminal 2 - Start Cloudflare Tunnel:**
```powershell
.\cloudflare-setup.ps1 -Action start
```

Wait for:
```
✓ Registered tunnel connection (connIndex=0, 1, 2, 3)
```

---

### Step 3: Test Backend Endpoints

Open browser and test these URLs:

1. **Health Check:**
   - https://identity-api.mandiapp.in/api/health
   - https://marketplace-api.mandiapp.in/api/health
   - https://ordering-api.mandiapp.in/api/health
   - https://logistics-hub.mandiapp.in/api/health

2. **Swagger UI:**
   - https://identity-api.mandiapp.in/swagger
   - https://marketplace-api.mandiapp.in/swagger
   - https://ordering-api.mandiapp.in/swagger
   - https://logistics-hub.mandiapp.in/swagger

---

### Step 4: Configure Frontend for Tunnel

The frontend already has `environment.tunnel.ts` configured. Build with:

```bash
cd Frontend
ng build --configuration=tunnel
# OR for development with live reload:
ng serve --configuration=tunnel
```

Frontend will connect to:
- Identity API: `https://identity-api.mandiapp.in/api`
- Marketplace API: `https://marketplace-api.mandiapp.in/api`
- Ordering API: `https://ordering-api.mandiapp.in/api`
- Logistics Hub: `https://logistics-hub.mandiapp.in`
- Price Hub (SignalR): `wss://ordering-api.mandiapp.in/hubs/price`
- Tracking Hub (SignalR): `wss://logistics-hub.mandiapp.in/hubs/tracking`

---

### Step 5: Test End-to-End

#### A. Test Authentication Flow
1. Open frontend at `http://localhost:8100` (or `http://localhost:4200` for ng serve)
2. Go to Login page
3. Enter phone number: `+919876543210`
4. Click "Send OTP"
5. **Check**: Should receive OTP (currently mock, will be WhatsApp with Twilio)
6. Enter OTP and login

#### B. Test Marketplace
1. Go to Marketplace page
2. **Check**: Products load from `https://marketplace-api.mandiapp.in`
3. Search for "Tomato"
4. **Check**: Price comparison across vendors

#### C. Test Real-Time Price Updates (SignalR)
1. Keep marketplace page open
2. In another tab, open: `https://ordering-api.mandiapp.in/swagger`
3. Find `/api/pricetest/simulate-price-drop` endpoint
4. Execute it
5. **Check**: Price should update in real-time on marketplace page with green flash!

#### D. Test Order Placement
1. Add items to cart
2. Click "Checkout"
3. Place order
4. **Check**: Order appears in orders list
5. **Check**: WhatsApp notification sent (once Twilio is integrated)

#### E. Test Live Tracking (SignalR)
1. Place an order
2. Go to "Track Order" page
3. **Check**: Map loads with delivery location
4. **Check**: Real-time location updates via WebSocket

---

## 📱 Mobile App Testing

### Build for Android/iOS:

```bash
cd Frontend

# Build production
npm run build --configuration=tunnel

# Copy to native platform
npx cap sync

# Open in Android Studio
npx cap open android

# Open in Xcode
npx cap open ios
```

### Test on Real Device:
- App will connect to `https://identity-api.mandiapp.in` (public URL)
- No need for USB debugging or port forwarding!
- Test from anywhere with internet connection

---

## 🔍 Troubleshooting

### Issue: "Cannot connect to backend"
**Fix:**
1. Check backend services are running: `Get-Process | Where-Object {$_.ProcessName -like "*dotnet*"}`
2. Check Cloudflare tunnel is running: Look for "Registered tunnel connection"
3. Test URL directly: `curl https://identity-api.mandiapp.in/api/health`

### Issue: "CORS error"
**Fix:** AllowedOrigins already configured in all `appsettings.json` files ✓

### Issue: "SignalR not connecting"
**Fix:**
1. Check browser console for connection errors
2. Verify WebSocket is allowed in Cloudflare (already configured ✓)
3. Test SignalR endpoint: `wss://ordering-api.mandiapp.in/hubs/price`

### Issue: "WhatsApp not sending"
**Fix:**
1. Verify Twilio credentials are correct
2. Check Twilio console: https://console.twilio.com/
3. Verify WhatsApp sandbox is active
4. Test phone number is registered in Twilio sandbox

---

## 🎯 Next Steps Priority:

### **IMMEDIATE (Do Now):**
1. ✅ Add Twilio credentials to `appsettings.json` (see Step 1 above)
2. ✅ Restart all services with `.\start-all-services.ps1`
3. ✅ Start tunnel with `.\cloudflare-setup.ps1 -Action start`
4. ✅ Test health endpoints in browser
5. ✅ Test frontend with `ng serve --configuration=tunnel`

### **TODAY:**
1. Test authentication flow (OTP via console logs)
2. Test marketplace loading
3. Test real-time price updates (SignalR)
4. Test order placement
5. Test payment flow (Razorpay test mode)

### **THIS WEEK:**
1. Implement Twilio WhatsApp notifications
2. Test on real Android device
3. Add more test data (products, vendors)
4. Test live tracking with GPS simulation
5. Invite beta testers

### **LATER:**
1. Production database setup
2. Production Razorpay credentials
3. SSL certificate renewal automation
4. Performance optimization
5. Cloud hosting migration (when needed)

---

## 💰 Current Cost: $0/month!

**What You're Running:**
- 4 Microservices (Free - localhost)
- Cloudflare Tunnel (Free tier)
- Supabase Database (Free tier)
- HTTPS + DDoS Protection (Free with Cloudflare)
- SignalR WebSockets (Free)

**No credit card required!** 🎉

---

## 📞 Quick Commands

```powershell
# Start everything
.\start-all-services.ps1
.\cloudflare-setup.ps1 -Action start

# Check tunnel status
.\cloudflare-setup.ps1 -Action status

# Test endpoints
curl https://identity-api.mandiapp.in/api/health
curl https://marketplace-api.mandiapp.in/api/health

# Frontend dev server
cd Frontend
npm start  # Uses localhost
# OR
ng serve --configuration=tunnel  # Uses Cloudflare tunnel

# Stop tunnel
# Press Ctrl+C in tunnel terminal

# List tunnels
cloudflared tunnel list
```

---

## ✅ Ready to Test Checklist:

- [x] Backend services configured
- [x] Cloudflare tunnel configured
- [x] DNS records created
- [x] SignalR implemented
- [x] Frontend environment configured
- [x] CORS configured
- [x] WebSocket support enabled
- [ ] **Twilio credentials added** ← DO THIS NOW!
- [ ] Services running
- [ ] Tunnel active
- [ ] Frontend tested
- [ ] Mobile app tested

---

**YOU'RE 95% READY!** Just add Twilio credentials and start testing! 🚀
