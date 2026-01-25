# Cloudflare Tunnel DNS Setup Guide

## Your Tunnel Information
- **Tunnel Name**: mandiapp-tunnel
- **Tunnel ID**: dad9ffa0-5cf2-4ea0-8a88-f4547c976f0c
- **Domain**: mandiapp.in

## Option 1: Quick Setup via Command Line (RECOMMENDED)

Run these commands to automatically create DNS records:

```powershell
# Add DNS routes for all services
cloudflared tunnel route dns mandiapp-tunnel identity-api.mandiapp.in
cloudflared tunnel route dns mandiapp-tunnel marketplace-api.mandiapp.in
cloudflared tunnel route dns mandiapp-tunnel ordering-api.mandiapp.in
cloudflared tunnel route dns mandiapp-tunnel logistics-hub.mandiapp.in
```

## Option 2: Manual Setup in Cloudflare Dashboard

1. Go to https://dash.cloudflare.com
2. Select your domain: **mandiapp.in**
3. Go to **DNS** → **Records**
4. Add these CNAME records:

| Type  | Name            | Content (Target)                                          | Proxy |
|-------|-----------------|-----------------------------------------------------------|-------|
| CNAME | identity-api    | dad9ffa0-5cf2-4ea0-8a88-f4547c976f0c.cfargotunnel.com   | Yes   |
| CNAME | marketplace-api | dad9ffa0-5cf2-4ea0-8a88-f4547c976f0c.cfargotunnel.com   | Yes   |
| CNAME | ordering-api    | dad9ffa0-5cf2-4ea0-8a88-f4547c976f0c.cfargotunnel.com   | Yes   |
| CNAME | logistics-hub   | dad9ffa0-5cf2-4ea0-8a88-f4547c976f0c.cfargotunnel.com   | Yes   |

**Important**: Make sure "Proxy status" is ENABLED (orange cloud ☁️)

## Verify DNS Setup

After adding records, test with:

```powershell
# Check DNS resolution
nslookup identity-api.mandiapp.in
nslookup marketplace-api.mandiapp.in

# Test API endpoints
curl https://identity-api.mandiapp.in/api/health
curl https://marketplace-api.mandiapp.in/api/health
```

## Services Must Be Running Locally

The tunnel forwards traffic from public URLs to your local services. Make sure these are running:

- Identity API: http://localhost:5003
- Marketplace API: http://localhost:5001
- Ordering API: http://localhost:5002
- Logistics Hub: http://localhost:5004

## Troubleshooting

**DNS not resolving?**
- Wait 2-5 minutes for DNS propagation
- Clear DNS cache: `ipconfig /flushdns`
- Check Cloudflare dashboard shows the CNAME records

**502 Bad Gateway?**
- Make sure local services are running on correct ports
- Check tunnel is running: `Get-Process cloudflared`
- Restart tunnel: `cloudflared tunnel run mandiapp-tunnel`

**Connection timeout?**
- Check Windows Firewall isn't blocking ports 5001-5004
- Verify services are listening: `netstat -ano | findstr "500[1-4]"`
