# 100% FREE Deployment Guide - MandiApp

## 🎉 Zero Cost Cloud Deployment

This guide shows you how to deploy MandiApp completely **FREE** using:
- ✅ **Vercel** - Frontend (Unlimited bandwidth)
- ✅ **Render.com** - Backend APIs (512MB RAM per service)
- ✅ **Supabase** - PostgreSQL Database (500MB free)

**Total Monthly Cost: $0** 💰

---

## 🚀 Quick Start (3 Services, 5 Steps)

### Prerequisites
1. **GitHub Account** (Free) - https://github.com/signup
2. **Supabase Account** (Free) - https://supabase.com
3. **Render Account** (Free) - https://render.com
4. **Vercel Account** (Free) - https://vercel.com

### Run the Automated Script

```powershell
cd d:\MandiApp
.\deploy-free.ps1
```

The script will guide you through all steps!

---

## 📋 Manual Step-by-Step Guide

### Step 1: Setup Database (Supabase) - 5 minutes

1. **Go to** https://supabase.com
2. **Click** "Start your project"
3. **Sign in** with GitHub
4. **Click** "New project"
5. **Enter:**
   - Name: `mandiapp`
   - Database Password: Create a strong password (save it!)
   - Region: Mumbai (closest to India)
6. **Click** "Create new project" (takes ~2 minutes)
7. **Go to** Settings → Database
8. **Copy** the "Connection string" (URI format)
   - Example: `postgresql://postgres:password@db.xxx.supabase.co:5432/postgres`

**Save this connection string!** You'll need it for backend deployment.

---

### Step 2: Push Code to GitHub - 5 minutes

1. **Go to** https://github.com/new
2. **Create repository:**
   - Name: `mandiapp`
   - Public (required for free tier)
   - Don't initialize with README
3. **Click** "Create repository"

4. **In PowerShell:**
```powershell
cd d:\MandiApp
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mandiapp.git
git push -u origin main
```

---

### Step 3: Deploy Backend APIs (Render.com) - 20 minutes

#### Deploy Identity API

1. **Go to** https://render.com
2. **Sign in** with GitHub
3. **Click** "New +" → "Web Service"
4. **Select** your `mandiapp` repository
5. **Configure:**
   - **Name:** `mandiapp-identity-api`
   - **Region:** Singapore (or closest)
   - **Branch:** main
   - **Root Directory:** `Backend/Services/Identity.API`
   - **Runtime:** Docker
   - **Instance Type:** Free
6. **Add Environment Variables:**
   ```
   DATABASE_URL = (paste your Supabase connection string)
   JWT_SECRET = (generate random 64 char string)
   ASPNETCORE_ENVIRONMENT = Production
   ```
7. **Click** "Create Web Service"
8. **Wait** 3-5 minutes for deployment
9. **Copy** the service URL (e.g., `https://mandiapp-identity-api.onrender.com`)

#### Repeat for Other APIs

**Marketplace API:**
- Name: `mandiapp-marketplace-api`
- Root Directory: `Backend/Services/Marketplace.API`
- Same environment variables

**Ordering API:**
- Name: `mandiapp-ordering-api`
- Root Directory: `Backend/Services/Ordering.API`
- Same environment variables

**Logistics Hub:**
- Name: `mandiapp-logistics-hub`
- Root Directory: `Backend/Services/Logistics.Hub`
- Same environment variables

**Total: 4 Web Services (all FREE!)**

---

### Step 4: Update Frontend Configuration - 2 minutes

Edit `Frontend/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://mandiapp-marketplace-api.onrender.com/api',
  identityApiUrl: 'https://mandiapp-identity-api.onrender.com/api',
  marketplaceApiUrl: 'https://mandiapp-marketplace-api.onrender.com/api',
  orderingApiUrl: 'https://mandiapp-ordering-api.onrender.com/api',
  logisticsHubUrl: 'https://mandiapp-logistics-hub.onrender.com',
  trackingHubUrl: 'https://mandiapp-logistics-hub.onrender.com/hubs/tracking',
  priceHubUrl: 'https://mandiapp-marketplace-api.onrender.com/hubs/price',
  razorpayKeyId: 'rzp_test_Rt4HsYWkXkSWT4',
  useMockPayment: true,
  firebase: {
    apiKey: 'your-firebase-api-key',
    authDomain: 'your-app.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-app.appspot.com',
    messagingSenderId: 'your-sender-id',
    appId: 'your-app-id'
  }
};
```

**Commit and push:**
```powershell
git add .
git commit -m "Update production URLs"
git push
```

---

### Step 5: Deploy Frontend (Vercel) - 5 minutes

1. **Go to** https://vercel.com
2. **Sign in** with GitHub
3. **Click** "Add New" → "Project"
4. **Import** your `mandiapp` repository
5. **Configure:**
   - **Framework Preset:** Other
   - **Root Directory:** `Frontend`
   - **Build Command:** `npm run build --prod`
   - **Output Directory:** `www`
6. **Click** "Deploy"
7. **Wait** 2-3 minutes
8. **Your app is live!** 🎉

---

## 🌐 Your Live URLs

After deployment:

**Frontend:**
```
https://mandiapp-yourname.vercel.app
```

**Backend APIs:**
```
https://mandiapp-identity-api.onrender.com
https://mandiapp-marketplace-api.onrender.com
https://mandiapp-ordering-api.onrender.com
https://mandiapp-logistics-hub.onrender.com
```

**Database:**
```
Supabase Dashboard: https://app.supabase.com
```

---

## 💰 Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Hobby | **$0** |
| Render (4 services) | Free | **$0** |
| Supabase | Free | **$0** |
| **Total** | | **$0/month** |

---

## 📊 Free Tier Limits

### Vercel
- ✅ Unlimited bandwidth
- ✅ Unlimited deployments
- ✅ 100GB build minutes/month
- ✅ Automatic SSL
- ✅ Global CDN

### Render.com (per service)
- ✅ 512MB RAM
- ✅ 0.1 CPU
- ✅ 750 hours/month (enough for 24/7!)
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ First request after sleep: 30-60 sec

### Supabase
- ✅ 500MB database
- ✅ 2GB file storage
- ✅ Unlimited API requests
- ✅ Up to 50MB file uploads
- ✅ Automatic backups

---

## 🔄 Auto-Deploy on Push

All three platforms support **automatic deployment**:

1. **Push to GitHub:**
```powershell
git add .
git commit -m "Update feature"
git push
```

2. **Automatic:**
- Vercel rebuilds frontend automatically
- Render rebuilds backend automatically
- Updates live in 2-3 minutes!

---

## 🐛 Handling Render Sleep

Render free tier services sleep after 15 minutes of inactivity. Solutions:

### Option 1: Keep-Alive Service (Free)

Use **UptimeRobot** (free) to ping your APIs every 5 minutes:

1. Go to https://uptimerobot.com
2. Add monitors for each API
3. Set interval: 5 minutes

### Option 2: Accept the Sleep

- First request takes 30-60 seconds to wake up
- Subsequent requests are instant
- Good for low-traffic apps

### Option 3: Upgrade to Paid

- $7/month per service
- Always awake
- Better performance

---

## 🔐 Environment Variables

**Backend (.env):**
```env
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
JWT_SECRET=your_64_character_random_string_here
JWT_ISSUER=https://mandiapp-yourname.vercel.app
JWT_AUDIENCE=https://mandiapp-yourname.vercel.app
ASPNETCORE_ENVIRONMENT=Production
```

**Generate JWT Secret:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

---

## 📈 Upgrade Path (When Needed)

### When to Upgrade?

- More than 500 users
- Need faster response times
- Need more database storage
- Want custom domain

### Upgrade Options

**Render:**
- Starter: $7/month per service
- Always awake, 512MB RAM

**Supabase:**
- Pro: $25/month
- 8GB database, better performance

**Vercel:**
- Pro: $20/month
- Team collaboration, analytics

**Total for upgraded stack: ~$50/month**

---

## 🛠️ Troubleshooting

### Backend Not Responding
- Check Render dashboard for errors
- Services sleep after 15 min (normal)
- First request wakes them up (30-60 sec)

### Database Connection Error
- Verify DATABASE_URL is correct
- Check Supabase dashboard is working
- Ensure database password is correct

### Frontend Not Updating
- Clear browser cache
- Check Vercel deployment logs
- Verify build succeeded

### CORS Errors
- Add frontend URL to backend CORS settings
- Check API URLs in environment.prod.ts

---

## 📞 Support & Resources

### Documentation
- **Vercel:** https://vercel.com/docs
- **Render:** https://render.com/docs
- **Supabase:** https://supabase.com/docs

### Community
- **Vercel Discord:** https://vercel.com/discord
- **Render Community:** https://community.render.com
- **Supabase Discord:** https://discord.supabase.com

---

## ✅ Deployment Checklist

- [ ] Created Supabase account
- [ ] Created database & copied connection string
- [ ] Created GitHub repository
- [ ] Pushed code to GitHub
- [ ] Created Render account
- [ ] Deployed 4 backend services on Render
- [ ] Updated frontend environment.prod.ts
- [ ] Pushed frontend updates
- [ ] Created Vercel account
- [ ] Deployed frontend on Vercel
- [ ] Tested all APIs
- [ ] Tested frontend application
- [ ] Set up UptimeRobot (optional)
- [ ] Saved all credentials

---

## 🎯 Next Steps After Deployment

1. **Custom Domain** (Optional)
   - Buy domain (~$10/year)
   - Point to Vercel
   - Free SSL included!

2. **Monitoring**
   - Set up UptimeRobot
   - Enable Render health checks
   - Check Supabase usage

3. **Backups**
   - Supabase auto-backups included
   - Download manual backup monthly

4. **Performance**
   - Monitor Render response times
   - Check Vercel analytics
   - Optimize database queries

---

**Ready to deploy?** Run: `.\deploy-free.ps1`

**Questions?** Everything is 100% FREE and takes ~30 minutes total!
