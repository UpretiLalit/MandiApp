# 🚀 Quick Start Guide - Stock Market UI Features

## Prerequisites
- ✅ .NET 8 SDK installed
- ✅ Node.js 18+ and npm installed
- ✅ Angular CLI installed globally
- ✅ Backend API running on `http://localhost:5002`

---

## 🏁 Getting Started

### Step 1: Start the Backend
```bash
cd d:\MandiApp\Backend\Services\Ordering.API
dotnet run
```

**Expected Output:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5002
info: Microsoft.AspNetCore.SignalR[1]
      SignalR Hub 'PriceHub' mapped at '/hubs/price'
```

---

### Step 2: Start the Frontend
```bash
cd d:\MandiApp\Frontend
npm start
```

**Expected Output:**
```
** Angular Live Development Server is listening on localhost:8100 **
✔ Compiled successfully.
```

---

### Step 3: View the Marketplace
1. Open browser to `http://localhost:8100`
2. Login with test credentials (or create account)
3. Navigate to **Marketplace** tab
4. You should see:
   - 🍅 Emoji icons on products
   - Green **#1 Best Value** badges
   - **Quick Buy** buttons
   - Expandable vendor comparisons

---

### Step 4: Test Price Tickers

#### Option A: Use HTML Test Page
1. Open `d:\MandiApp\Frontend\price-test.html` in browser
2. Click any price change button (⬇️ Drop ₹5, ⬆️ Increase ₹5, or 🎲 Random)
3. Watch the marketplace tab update in real-time!
4. Green ⬇️ arrows appear for price drops
5. Red ⬆️ arrows appear for price increases

#### Option B: Use API Directly
```bash
# Using PowerShell
$body = @{
    productId = "1"
    vendorId = "1"
    newPrice = 35
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5002/api/pricetest/update-price" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

#### Option C: Use Postman
```http
POST http://localhost:5002/api/pricetest/update-price
Content-Type: application/json

{
  "productId": "1",
  "vendorId": "1",
  "newPrice": 35
}
```

---

## 🎨 What to Look For

### Price Tickers (⬇️ ⬆️)
- **First Load**: No tickers visible (baseline not set yet)
- **After Price Change**: 
  - Green ⬇️ with percentage if price dropped
  - Red ⬆️ with percentage if price increased
  - Animated pulse effect
  - Example: **⬇️ 12.5%** or **⬆️ 8.3%**

### Best Price Highlighting
- **Green border** around entire vendor card
- **Trophy 🏆 badge** in top-left corner
- **"Best Value"** label
- Always appears **first** in the list

### Status Tags
Check for these badges on vendor cards:

#### 🌿 Fresh Arrival (Green)
- Appears when vendor rating ≥ 4.7
- Indicates highest quality produce
- Example: "Fresh Farms Co." with 4.9 rating

#### ⚠️ Limited Stock (Yellow)
- Appears when quantity < 100 units
- Warns users to buy quickly
- Example: "85 kg available"

#### 📦 Bulk Only (Gray)
- Appears for wholesale vendors
- Large stock + lower rating
- Example: "600 kg available" with 4.2 rating

### Visual Emojis
Look for large emoji icons:
- 🍅 Fresh Tomatoes
- 🧅 Onions
- 🥔 Potatoes
- Should be ~2rem size with drop shadow

---

## 🧪 Testing Scenarios

### Scenario 1: Price Drop Alert
1. Note current price of "Fresh Tomatoes" (e.g., ₹40)
2. Use price-test.html to drop price by ₹5
3. Watch marketplace update instantly
4. Green ⬇️ arrow appears with **12.5%**
5. Price flashes with green glow animation

### Scenario 2: Best Price Changes
1. "Fresh Tomatoes" has 2 vendors (₹40 and ₹35)
2. Vendor 2 (₹35) should have green border + trophy
3. Drop Vendor 1 price to ₹32 using price-test.html
4. Watch Vendor 1 become new #1 Best Value
5. Green border moves to Vendor 1

### Scenario 3: Status Tag Visibility
1. Find product with vendor rating ≥ 4.7
2. Expand accordion to see vendor details
3. "Fresh Arrival" badge should appear
4. Find vendor with quantity < 100
5. "Limited Stock" badge should appear

### Scenario 4: Quick Buy
1. Click **Quick Buy** button on any product
2. Should add cheapest vendor to cart automatically
3. Toast notification: "⚡ Quick Buy: Tomatoes from Vendor @ ₹35"
4. Cart count increases by 1

---

## 🐛 Troubleshooting

### Tickers Not Appearing
**Problem:** Price arrows don't show up

**Solution:**
1. Check browser console for errors
2. Verify SignalR connection:
   ```javascript
   // In browser console
   console.log('SignalR State:', window.signalrState);
   ```
3. Make sure backend is broadcasting updates
4. Try refreshing the page after price change

### Status Tags Missing
**Problem:** Fresh Arrival / Limited Stock badges don't appear

**Solution:**
1. Check vendor data meets conditions:
   - Fresh Arrival: rating ≥ 4.7
   - Limited Stock: quantity < 100
2. Expand accordion to see vendor details
3. Status tags only show in expanded view

### Build Errors
**Problem:** Angular build fails with budget exceeded

**Solution:**
Already fixed! `angular.json` updated:
```json
"anyComponentStyle": {
  "maximumWarning": "12kb",
  "maximumError": "16kb"
}
```

### SignalR Connection Failed
**Problem:** Real-time updates not working

**Solution:**
1. Check backend console for SignalR logs
2. Verify CORS settings in `Program.cs`:
   ```csharp
   .WithOrigins("http://localhost:8100")
   .AllowCredentials()
   ```
3. Check browser network tab for WebSocket connection
4. Look for `/hubs/price` endpoint

---

## 📊 Performance Tips

### For Development
- Keep price-test.html open in separate window
- Use browser DevTools Network tab to monitor SignalR
- Check console for price history Map updates

### For Production
- Consider implementing price change rate limiting
- Add authentication to SignalR connections
- Cache price history in localStorage
- Implement pagination for large product lists

---

## 📚 Next Steps

### Explore More Features
1. **Multi-Vendor Cart**: Add items from different vendors
2. **Trust Badges**: See "Trusted", "Reliable", or "New" labels
3. **Accordion Comparison**: Compare all vendors side-by-side
4. **Grade System**: View A/B/C grade explanations
5. **Category Filters**: Filter by Vegetables, Fruits, Grains, etc.

### Documentation
- [STOCK_MARKET_UI_FEATURES.md](./STOCK_MARKET_UI_FEATURES.md) - Detailed feature docs
- [Architechture.md](./Architechture.md) - System architecture
- [README.md](./Frontend/README.md) - Frontend setup guide

---

## 🎯 Success Checklist

- [ ] Backend running on port 5002
- [ ] Frontend running on port 8100
- [ ] Marketplace page loads with emoji icons
- [ ] Quick Buy button visible on product cards
- [ ] Price tickers appear after using price-test.html
- [ ] Best Value highlighting shows green border
- [ ] Status tags visible in vendor details
- [ ] SignalR connection established (check console)
- [ ] Real-time price updates working

---

## 🆘 Getting Help

### Common Issues
1. **Port Already in Use**: Change ports in `launchSettings.json` (backend) or `angular.json` (frontend)
2. **CORS Errors**: Verify origin URLs match in `Program.cs`
3. **NPM Install Fails**: Use `--legacy-peer-deps` flag
4. **Build Timeout**: Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096`

### Debug Commands
```bash
# Check backend is running
curl http://localhost:5002/api/products

# Check SignalR hub is mapped
curl http://localhost:5002/hubs/price

# Test price update API
curl -X POST http://localhost:5002/api/pricetest/update-price \
  -H "Content-Type: application/json" \
  -d '{"productId":"1","vendorId":"1","newPrice":35}'
```

---

**Happy Testing! 🎉**

If you see green arrows appearing when prices drop, you've successfully implemented the Stock Market UI! 🚀
