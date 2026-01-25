# Cloudflare Tunnel Deployment Guide

## 🚀 Why Cloudflare Tunnel?

**Cost Savings**: Instead of paying $50-200/month for cloud hosting (4 microservices × $10-50 each), Cloudflare Tunnel is **FREE** and provides:
- ✅ Automatic HTTPS/SSL certificates
- ✅ DDoS protection and security
- ✅ Global CDN and fast routing
- ✅ WebSocket support (for SignalR)
- ✅ No need to open firewall ports
- ✅ Works even behind NAT/router

**Perfect For**: Development, testing, and low-traffic production (up to ~1000 users).

---

## 📋 Prerequisites

1. **Cloudflare Account** (free tier works)
   - Sign up at: https://dash.cloudflare.com/sign-up

2. **Domain Name** added to Cloudflare
   - You need a domain (e.g., `mandiapp.in`)
   - Add it to Cloudflare and change nameservers at your domain registrar
   - Wait for DNS to propagate (usually 5-30 minutes)

3. **All Backend Services Running Locally**
   - Identity.API on port 5003
   - Marketplace.API on port 5001
   - Ordering.API on port 5002
   - Logistics.Hub on port 5004

---

## 🛠️ Quick Setup (5 Steps)

### Step 1: Install Cloudflared

Run PowerShell:

```powershell
.\cloudflare-setup.ps1 -Action install
```

This downloads and installs `cloudflared.exe` to `%LOCALAPPDATA%\cloudflared\`.

**⚠ Windows Defender Issue:**
Windows Defender may block cloudflared as "potentially unwanted software" (false positive).

**Quick Fix:**
1. Open **Windows Security** > **Virus & threat protection** > **Manage settings** > **Exclusions**
2. Add folder exclusion: `%LOCALAPPDATA%\cloudflared`
3. Re-run: `.\cloudflare-setup.ps1 -Action install`

See [WINDOWS_DEFENDER_FIX.md](WINDOWS_DEFENDER_FIX.md) for detailed instructions.

**Verify Installation:**
```powershell
cloudflared --version
```

---

### Step 2: Authenticate with Cloudflare

```powershell
.\cloudflare-setup.ps1 -Action login
```

- This opens your browser
- Login to your Cloudflare account
- Authorize the application
- Credentials saved to: `C:\Users\<YourName>\.cloudflared\cert.pem`

---

### Step 3: Create Tunnel

```powershell
.\cloudflare-setup.ps1 -Action create
```

This creates a tunnel named `mandiapp-tunnel` and generates:
- Tunnel ID (like `a1b2c3d4-1234-5678-90ab-cdef12345678`)
- Credentials file at: `C:\Users\<YourName>\.cloudflared\<TUNNEL_ID>.json`

**Important**: Copy your tunnel ID and update `cloudflared-config.yml`:

```yaml
tunnel: mandiapp-tunnel
credentials-file: C:\Users\<YourName>\.cloudflared\<TUNNEL_ID>.json
```

---

### Step 4: Configure DNS Records

**Option A: Automatic (Recommended)**
```powershell
.\cloudflare-setup.ps1 -Action dns -Domain mandiapp.in
```

**Option B: Manual via Cloudflare Dashboard**

Go to: https://dash.cloudflare.com → Select your domain → DNS → Records

Add these CNAME records:

| Type  | Name               | Target               |
|-------|--------------------|----------------------|
| CNAME | identity-api       | <TUNNEL_ID>.cfargotunnel.com |
| CNAME | marketplace-api    | <TUNNEL_ID>.cfargotunnel.com |
| CNAME | ordering-api       | <TUNNEL_ID>.cfargotunnel.com |
| CNAME | logistics-hub      | <TUNNEL_ID>.cfargotunnel.com |

**Proxy Status**: ✅ Proxied (orange cloud)

---

### Step 5: Start Backend Services & Tunnel

**Terminal 1 - Start All Backend Services:**
```powershell
.\start-all-services.ps1
```

Wait for all 4 services to be running and healthy.

**Terminal 2 - Start Cloudflare Tunnel:**
```powershell
.\cloudflare-setup.ps1 -Action start
```

You should see:
```
✓ Registered tunnel connection
✓ Connection established
```

---

## 🌐 Your Service URLs

After setup, your services are accessible at:

| Service           | Local URL            | Public URL (Cloudflare Tunnel) |
|-------------------|----------------------|-------------------------------|
| Identity API      | http://localhost:5003 | https://identity-api.mandiapp.in |
| Marketplace API   | http://localhost:5001 | https://marketplace-api.mandiapp.in |
| Ordering API      | http://localhost:5002 | https://ordering-api.mandiapp.in |
| Logistics Hub     | http://localhost:5004 | https://logistics-hub.mandiapp.in |

**Test Endpoints:**
```bash
# Health check
curl https://identity-api.mandiapp.in/api/health

# Test authentication
curl https://identity-api.mandiapp.in/api/auth/login
```

---

## 📱 Update Frontend Configuration

The frontend environment files have been updated:

**For Testing with Tunnel** (`environment.tunnel.ts`):
```typescript
identityApiUrl: 'https://identity-api.mandiapp.in/api'
marketplaceApiUrl: 'https://marketplace-api.mandiapp.in/api'
orderingApiUrl: 'https://ordering-api.mandiapp.in/api'
logisticsHubUrl: 'https://logistics-hub.mandiapp.in'
```

**Build Frontend with Tunnel Config:**
```bash
cd Frontend
ng build --configuration=tunnel
```

Or update `angular.json` to add tunnel configuration:
```json
{
  "configurations": {
    "tunnel": {
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.tunnel.ts"
        }
      ]
    }
  }
}
```

---

## 🔧 Backend CORS Configuration

Update each backend service's `appsettings.json` to allow Cloudflare Tunnel URLs:

### Identity.API/appsettings.json
```json
{
  "AllowedOrigins": [
    "http://localhost:8100",
    "https://identity-api.mandiapp.in",
    "https://marketplace-api.mandiapp.in",
    "https://ordering-api.mandiapp.in",
    "https://logistics-hub.mandiapp.in",
    "capacitor://localhost",
    "ionic://localhost"
  ]
}
```

### Marketplace.API/appsettings.json
```json
{
  "AllowedOrigins": [
    "http://localhost:8100",
    "https://identity-api.mandiapp.in",
    "https://marketplace-api.mandiapp.in",
    "https://ordering-api.mandiapp.in",
    "https://logistics-hub.mandiapp.in",
    "capacitor://localhost",
    "ionic://localhost"
  ]
}
```

### Ordering.API/appsettings.json
```json
{
  "AllowedOrigins": [
    "http://localhost:8100",
    "https://identity-api.mandiapp.in",
    "https://marketplace-api.mandiapp.in",
    "https://ordering-api.mandiapp.in",
    "https://logistics-hub.mandiapp.in",
    "capacitor://localhost",
    "ionic://localhost"
  ]
}
```

### Logistics.Hub/appsettings.json
```json
{
  "AllowedOrigins": [
    "http://localhost:8100",
    "https://identity-api.mandiapp.in",
    "https://marketplace-api.mandiapp.in",
    "https://ordering-api.mandiapp.in",
    "https://logistics-hub.mandiapp.in",
    "capacitor://localhost",
    "ionic://localhost"
  ]
}
```

**Restart all services** after updating CORS settings.

---

## 🎯 Complete Workflow

### Daily Development Workflow:

1. **Start Backend Services**
   ```powershell
   .\start-all-services.ps1
   ```

2. **Start Cloudflare Tunnel** (in separate terminal)
   ```powershell
   .\cloudflare-setup.ps1 -Action start
   ```

3. **Develop/Test**
   - Services now accessible via HTTPS from anywhere
   - Test on real Android device without USB cable
   - Share URLs with team members for testing

4. **Stop Services**
   - Press `Ctrl+C` in tunnel terminal
   - Close backend service terminals

---

## 🔍 Troubleshooting

### Issue: "tunnel credentials file not found"

**Fix:** Update `cloudflared-config.yml` with correct path:
```yaml
credentials-file: C:\Users\<YourUsername>\.cloudflared\<TUNNEL_ID>.json
```

Find your tunnel ID:
```powershell
cloudflared tunnel list
```

---

### Issue: "CORS error" in browser console

**Fix:** Update `AllowedOrigins` in all `appsettings.json` files to include Cloudflare Tunnel URLs.

---

### Issue: "502 Bad Gateway"

**Causes:**
- Backend service not running
- Wrong port in `cloudflared-config.yml`
- Service crashed

**Fix:**
1. Check service is running: `Get-Process | Where-Object {$_.ProcessName -like "*dotnet*"}`
2. Check service logs
3. Verify ports in `cloudflared-config.yml` match running services

---

### Issue: SignalR WebSocket not connecting

**Fix:** Ensure `warp-routing: enabled: true` in `cloudflared-config.yml`

And add WebSocket compression:
```yaml
- hostname: logistics-hub.mandiapp.in
  service: http://localhost:5004
  originRequest:
    websocketCompression: true
```

---

### Issue: DNS not resolving

**Causes:**
- DNS records not created
- DNS propagation delay

**Fix:**
1. Check DNS records at: https://dash.cloudflare.com → DNS
2. Verify CNAME points to `<TUNNEL_ID>.cfargotunnel.com`
3. Wait 5-10 minutes for propagation
4. Test with: `nslookup identity-api.mandiapp.in`

---

## 📊 Monitoring & Management

### Check Tunnel Status
```powershell
.\cloudflare-setup.ps1 -Action status
```

### View Tunnel Logs
```powershell
# Run tunnel with debug logging
cloudflared tunnel --config cloudflared-config.yml --loglevel debug run mandiapp-tunnel
```

### Cloudflare Dashboard
View tunnel metrics at: https://dash.cloudflare.com → Zero Trust → Access → Tunnels

---

## 🚀 Running as Windows Service (24/7)

For production/always-on deployment:

### Install as Service
```powershell
cloudflared service install
```

### Start Service
```powershell
Start-Service cloudflared
```

### Check Service Status
```powershell
Get-Service cloudflared
```

### Uninstall Service
```powershell
Stop-Service cloudflared
cloudflared service uninstall
```

**Note:** Service runs with SYSTEM account, so config file should be in:
`C:\Windows\System32\config\systemprofile\.cloudflared\`

---

## 💡 Advanced Configuration

### Multiple Tunnels for Different Environments

**Dev Tunnel:**
```powershell
cloudflared tunnel create mandiapp-dev
```

**Prod Tunnel:**
```powershell
cloudflared tunnel create mandiapp-prod
```

Update DNS records accordingly:
- `dev.identity-api.mandiapp.in`
- `identity-api.mandiapp.in`

---

### Custom Headers
```yaml
- hostname: identity-api.mandiapp.in
  service: http://localhost:5003
  originRequest:
    httpHostHeader: localhost:5003
    customHeaders:
      - "X-Custom-Header: value"
```

---

### Access Policies (Require Login)

Protect your APIs with Cloudflare Access:

1. Go to: https://dash.cloudflare.com → Zero Trust → Access → Applications
2. Add Application
3. Set policy: Require login with Google/GitHub
4. Apply to: `*.mandiapp.in`

Now users must authenticate to access your APIs.

---

## 📈 Performance Tips

1. **Enable Compression**
   - Already enabled in config for all services

2. **Use Argo Smart Routing** (optional, paid)
   - Faster global routing
   - ~$5/month for low traffic

3. **Monitor Bandwidth**
   - Free tier: Unlimited bandwidth
   - Check usage: https://dash.cloudflare.com → Analytics

---

## 🔐 Security Best Practices

1. **Don't Commit Credentials**
   - `.cloudflared/*.json` files contain secrets
   - Already added to `.gitignore`

2. **Use Cloudflare Access** for sensitive APIs
   - Free for up to 50 users

3. **Rotate Tunnel Credentials**
   ```powershell
   cloudflared tunnel rotate-creds mandiapp-tunnel
   ```

4. **Monitor Access Logs**
   - Available in Cloudflare dashboard

---

## 📚 Additional Resources

- **Cloudflare Tunnel Docs**: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **Troubleshooting Guide**: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/troubleshooting/
- **Community Forum**: https://community.cloudflare.com/

---

## 🆘 Quick Command Reference

```powershell
# Install
.\cloudflare-setup.ps1 -Action install

# Login
.\cloudflare-setup.ps1 -Action login

# Create tunnel
.\cloudflare-setup.ps1 -Action create

# Configure DNS
.\cloudflare-setup.ps1 -Action dns -Domain mandiapp.in

# Start tunnel
.\cloudflare-setup.ps1 -Action start

# Check status
.\cloudflare-setup.ps1 -Action status

# List tunnels
cloudflared tunnel list

# Delete tunnel
cloudflared tunnel delete mandiapp-tunnel
```

---

## ✅ Testing Checklist

After setup, verify:

- [ ] All 4 backend services running locally
- [ ] Cloudflare tunnel connected (no errors)
- [ ] DNS records created and propagated
- [ ] HTTPS endpoints accessible: `curl https://identity-api.mandiapp.in/api/health`
- [ ] CORS configured in all backend services
- [ ] Frontend can connect to backend APIs
- [ ] SignalR WebSocket connections working
- [ ] Mobile app can connect from external network

---

## 💰 Cost Comparison

| Solution | Monthly Cost | Setup Time | Pros | Cons |
|----------|--------------|------------|------|------|
| **Cloudflare Tunnel** | **$0** | 15 min | Free, HTTPS, DDoS protection | Requires local server running |
| AWS ECS | $50-150 | 2-4 hours | Scalable, managed | Complex, expensive |
| Azure App Service | $60-200 | 1-2 hours | Easy, integrated | Expensive for 4 services |
| DigitalOcean | $40-80 | 2-3 hours | Affordable, simple | Manual SSL, no auto-scaling |
| Heroku | $50-100 | 1 hour | Very easy | Expensive, deprecated free tier |

**Winner:** Cloudflare Tunnel for testing and small-scale production! 🎉

---

## 🎓 Next Steps

1. ✅ Complete Cloudflare Tunnel setup (follow steps above)
2. 📱 Test mobile app with real device over internet
3. 👥 Invite beta testers to try your app
4. 📊 Monitor usage and performance
5. 💳 When ready for scale, consider migrating to cloud hosting

**You've saved $50-200/month!** 💰

