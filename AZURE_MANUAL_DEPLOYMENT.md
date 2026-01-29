# Azure Manual Deployment Guide

Do this step by step in Azure Portal to avoid throttling issues.

## Step 1: Create Resource Group (1 minute)

1. Go to: https://portal.azure.com
2. Click **"Resource groups"** in the left menu
3. Click **"+ Create"**
4. Fill in:
   - **Subscription**: Azure subscription 1
   - **Resource group**: `mandiapp-rg`
   - **Region**: `Central India`
5. Click **"Review + Create"** → **"Create"**

**✅ Wait for it to complete**

---

## Step 2: Create PostgreSQL Database (10-15 minutes)

1. Search for **"Azure Database for PostgreSQL flexible servers"**
2. Click **"+ Create"**
3. Fill in:
   - **Resource group**: `mandiapp-rg`
   - **Server name**: `mandiapp-db-2026` (must be unique)
   - **Region**: `Central India`
   - **PostgreSQL version**: `16`
   - **Workload type**: `Development`
   - **Compute + storage**: Click "Configure server"
     - Select: **Burstable, B1ms (1 vCore, 2 GiB RAM)**
     - Storage: **32 GiB**
     - Click **"Save"**
   - **Admin username**: `mandiadmin`
   - **Password**: Create a strong password (SAVE THIS!)

4. Click **"Next: Networking"**
   - **Firewall rules**: Add rule
     - Rule name: `AllowAll`
     - Start IP: `0.0.0.0`
     - End IP: `255.255.255.255`
   
5. Click **"Review + Create"** → **"Create"**

**✅ Wait 10-15 minutes for database to be created**

**📝 SAVE THESE:**
- Server name: `mandiapp-db-2026.postgres.database.azure.com`
- Admin username: `mandiadmin`
- Password: (what you entered)

---

## Step 3: Create Databases (5 minutes)

1. Go to your PostgreSQL server in Azure Portal
2. Click **"Databases"** in left menu
3. Click **"+ Add"** and create:
   - `MandiIdentityDB`
   - `MandiMarketplaceDB`
   - `MandiOrderingDB`
   - `MandiLogisticsDB`

---

## Step 4: Create App Service Plan (2 minutes)

1. Search for **"App Service plans"**
2. Click **"+ Create"**
3. Fill in:
   - **Resource group**: `mandiapp-rg`
   - **Name**: `mandiapp-plan`
   - **Operating System**: `Linux`
   - **Region**: `Central India`
   - **Pricing tier**: Click "Explore pricing plans"
     - Select **"Basic B1"** (1.75 GB RAM)
     - Click **"Select"**

4. Click **"Review + Create"** → **"Create"**

**✅ Wait for it to complete**

---

## Step 5: Create Backend API Apps (5 minutes each = 20 minutes total)

Create 4 web apps (one for each service):

### 5.1 Identity API

1. Search for **"App Services"**
2. Click **"+ Create"** → **"Web App"**
3. Fill in:
   - **Resource group**: `mandiapp-rg`
   - **Name**: `    `
   - **Publish**: `Code`
   - **Runtime stack**: `.NET 8 (LTS)`
   - **Operating System**: `Linux`
   - **Region**: `Central India`
   - **App Service Plan**: `mandiapp-plan`

4. Click **"Review + Create"** → **"Create"**

**Repeat for:**
- `mandiapp-marketplace-api`
- `mandiapp-ordering-api`
- `mandiapp-logistics-hub`

---

## Step 6: Configure App Settings for Each API (5 minutes each)

For **each of the 4 web apps**, do this:

1. Go to the web app in Azure Portal
2. Click **"Configuration"** in left menu
3. Click **"+ New connection string"**
   - **Name**: `DefaultConnection`
   - **Value**: 
     ```
     Host=mandiapp-db-2026.postgres.database.azure.com;Port=5432;Username=mandiadmin;Password=YOUR_PASSWORD;Database=DATABASE_NAME;SSL Mode=Require
     ```
     Replace:
     - `YOUR_PASSWORD` with your PostgreSQL password
     - `DATABASE_NAME` with:
       - Identity API → `MandiIdentityDB`
       - Marketplace API → `MandiMarketplaceDB`
       - Ordering API → `MandiOrderingDB`
       - Logistics Hub → `MandiLogisticsDB`
   - **Type**: `PostgreSQL`

4. Click **"+ New application setting"** for each:
   - `ASPNETCORE_ENVIRONMENT` = `Production`
   - `JWT__Secret` = (generate random 64 character string)
   - `JWT__Issuer` = `https://mandiapp-identity-api.azurewebsites.net`
   - `JWT__Audience` = `https://mandiapp-identity-api.azurewebsites.net`

5. Click **"Save"** at the top

---

## Step 7: Deploy Backend Code (Manual Upload)

### Option A: Using VS Code (Recommended)

1. Open your Backend solution in VS Code
2. Install extension: **"Azure App Service"**
3. Right-click on each project → **"Publish to Azure Web App"**
4. Select the corresponding web app

### Option B: Using ZIP Deploy

For each service:

1. Open terminal in service folder:
   ```powershell
   cd Backend\Services\Identity.API
   dotnet publish -c Release -o ./publish
   Compress-Archive -Path ./publish/* -DestinationPath deploy.zip -Force
   ```

2. In Azure Portal, go to the web app
3. Click **"Deployment Center"** → **"FTPS credentials"**
4. Use **"Advanced Tools (Kudu)"** → Click **"Go"**
5. Click **"Tools"** → **"Zip Push Deploy"**
6. Drag and drop `deploy.zip`

---

## Step 8: Create Static Web App for Frontend (10 minutes)

1. Search for **"Static Web Apps"**
2. Click **"+ Create"**
3. Fill in:
   - **Resource group**: `mandiapp-rg`
   - **Name**: `mandiapp-frontend`
   - **Plan type**: `Free`
   - **Region**: `Central India`
   - **Deployment source**: `Other` (we'll upload manually)

4. Click **"Review + Create"** → **"Create"**

5. Build frontend locally:
   ```powershell
   cd Frontend
   npm install
   npm run build --prod
   ```

6. Upload the `www` folder:
   - Go to Static Web App in portal
   - Click **"Browse"** to see the deployment token
   - Use Azure CLI or GitHub to deploy

---

## Step 9: Get Your URLs

After everything is deployed:

**Backend APIs:**
- Identity: `https://mandiapp-identity-api.azurewebsites.net`
- Marketplace: `https://mandiapp-marketplace-api.azurewebsites.net`
- Ordering: `https://mandiapp-ordering-api.azurewebsites.net`
- Logistics: `https://mandiapp-logistics-hub.azurewebsites.net`

**Frontend:**
- Static Web App: (check in portal)

---

## Testing

Test each API:
```powershell
curl https://mandiapp-identity-api.azurewebsites.net/health
curl https://mandiapp-marketplace-api.azurewebsites.net/health
curl https://mandiapp-ordering-api.azurewebsites.net/health
curl https://mandiapp-logistics-hub.azurewebsites.net/health
```

---

## Estimated Time: 1-2 hours
## Estimated Cost: ~$30/month (FREE with $200 credits!)

---

## Cleanup (Delete Everything)

When done testing:
1. Go to **Resource groups**
2. Find `mandiapp-rg`
3. Click **"Delete resource group"**
4. Type the name to confirm
5. Click **"Delete"**

**This removes everything and stops all billing.**
