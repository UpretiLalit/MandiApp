## 🚀 Quick Fix for Tunnel DNS

You have DNS records created but they're not resolving. Here's what to do:

### Step 1: Go to Cloudflare Dashboard
1. Open: https://dash.cloudflare.com
2. Login with your account
3. Select domain: **mandimarket.com** (or mandiapp.in - whichever you want to use)

### Step 2: Check DNS Records
Go to **DNS** → **Records** tab

You should see these CNAME records (if not, add them):

```
Type: CNAME
Name: identity-api
Target: dad9ffa0-5cf2-4ea0-8a88-f4547c976f0c.cfargotunnel.com
Proxy: ✅ Proxied (Orange Cloud)

Type: CNAME
Name: marketplace-api  
Target: dad9ffa0-5cf2-4ea0-8a88-f4547c976f0c.cfargotunnel.com
Proxy: ✅ Proxied (Orange Cloud)

Type: CNAME
Name: ordering-api
Target: dad9ffa0-5cf2-4ea0-8a88-f4547c976f0c.cfargotunnel.com
Proxy: ✅ Proxied (Orange Cloud)

Type: CNAME
Name: logistics-hub
Target: dad9ffa0-5cf2-4ea0-8a88-f4547c976f0c.cfargotunnel.com
Proxy: ✅ Proxied (Orange Cloud)
```

### Step 3: Update Configuration Based on Your Domain

**If using mandimarket.com**, update these files:

1. **Frontend environment** - Already configured ✅
2. **Tunnel config** - Update cloudflared-config.yml:
   ```yaml
   ingress:
     - hostname: identity-api.mandimarket.com
       service: http://localhost:5003
     - hostname: marketplace-api.mandimarket.com
       service: http://localhost:5001
     - hostname: ordering-api.mandimarket.com
       service: http://localhost:5002
     - hostname: logistics-hub.mandimarket.com
       service: http://localhost:5004
     - service: http_status:404
   ```

**If using mandiapp.in**, update:
1. Frontend environment.ts (change .mandimarket.com → .mandiapp.in)
2. Tunnel config is already set for .mandiapp.in ✅

### Step 4: Restart Tunnel
```powershell
Get-Process cloudflared | Stop-Process -Force
cloudflared tunnel --config D:\MandiApp\cloudflared-config.yml run
```

### Step 5: Test
Wait 2-3 minutes for DNS propagation, then:
```powershell
curl https://identity-api.mandimarket.com/api/health
# OR
curl https://identity-api.mandiapp.in/api/health
```

## 🎯 Which Domain Should You Use?

**mandimarket.com** - Better for production (sounds more professional)
**mandiapp.in** - Better if you want .in domain for Indian market

Choose ONE and stick with it!
