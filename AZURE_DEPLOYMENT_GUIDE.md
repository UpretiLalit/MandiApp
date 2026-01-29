# Azure Deployment Guide - MandiApp

Complete guide for deploying MandiApp to Microsoft Azure (Much Easier than Oracle Cloud!)

## 🚀 Why Azure?

- ✅ **Easier Setup** - No SSH key hassles
- ✅ **Better Documentation** - Clear step-by-step guides
- ✅ **Free Tier Available** - Free credits for new users
- ✅ **Excellent CLI Tools** - Azure CLI makes everything simple
- ✅ **Managed Services** - Less infrastructure management

## 📋 Prerequisites

1. **Azure Account** (Free tier available)
   - Sign up at: https://azure.microsoft.com/free/
   - Get ₹20,000 free credits for 30 days
   
2. **Azure CLI** (will be installed automatically if needed)

## 🎯 Quick Start (3 Simple Steps)

### Option 1: App Service Deployment (RECOMMENDED - Easiest!)

This uses Azure App Service - no VM management needed!

```powershell
cd d:\MandiApp
.\azure-deploy.ps1
```

**That's it!** The script will:
- ✅ Install Azure CLI if needed
- ✅ Login to Azure (opens browser)
- ✅ Create all resources
- ✅ Setup PostgreSQL database
- ✅ Deploy all 4 APIs
- ✅ Configure everything

**Time:** ~15-20 minutes
**Cost:** ~₹2,000-3,000/month (or free with credits)

### Option 2: VM Deployment (Like Oracle Cloud)

If you prefer a VM:

```powershell
.\azure-deploy.ps1 -UseVM
```

## 📊 What Gets Created

### App Service Deployment
- **PostgreSQL Database** (Managed)
- **4 Web Apps** (One for each API)
- **Container Registry** (For Docker images)
- **App Service Plan** (Hosting)

### VM Deployment  
- **Ubuntu VM** (Standard_B2s)
- **Public IP Address**
- **Network Security Group** (Ports 80, 443 open)

## 💰 Cost Breakdown

### App Service (Recommended)
| Resource | SKU | Monthly Cost (INR) |
|----------|-----|-------------------|
| App Service Plan | B1 | ~₹1,200 |
| PostgreSQL | B1ms | ~₹1,500 |
| Container Registry | Basic | ~₹400 |
| **Total** | | **~₹3,100/month** |

### VM Option
| Resource | SKU | Monthly Cost (INR) |
|----------|-----|-------------------|
| Virtual Machine | B2s | ~₹2,400 |
| Managed Disk | 32GB | ~₹300 |
| Public IP | Standard | ~₹200 |
| **Total** | | **~₹2,900/month** |

💡 **Use Free Credits:** New Azure accounts get ₹20,000 free for 30 days!

## 🔧 Detailed Steps

### Step 1: Install Azure CLI (Automatic)

The script will install it automatically. Or manually:

```powershell
winget install Microsoft.AzureCLI
```

Or download: https://aka.ms/installazurecliwindows

### Step 2: Login to Azure

```powershell
az login
```

This opens your browser for authentication.

### Step 3: Run Deployment Script

```powershell
.\azure-deploy.ps1
```

The script will prompt you for confirmation before creating resources.

### Step 4: Deploy Frontend

After backend is deployed, deploy frontend:

```powershell
.\azure-deploy-frontend.ps1
```

## 📱 Custom Configuration

### Change Location

```powershell
.\azure-deploy.ps1 -Location "southindia"
```

Available locations:
- `centralindia` (Default - Mumbai)
- `southindia` (Chennai)
- `westindia` (Pune)

### Change Database Password

```powershell
.\azure-deploy.ps1 -DbAdminPassword "YourSecurePassword123!"
```

### Use VM Instead of App Service

```powershell
.\azure-deploy.ps1 -UseVM
```

## 🌐 Access Your Application

After deployment completes, you'll get URLs like:

```
https://mandiapp-1234-identity-api.azurewebsites.net
https://mandiapp-1234-marketplace-api.azurewebsites.net
https://mandiapp-1234-ordering-api.azurewebsites.net
https://mandiapp-1234-logistics-hub.azurewebsites.net
```

All credentials are saved to: `d:\MandiApp\azure-credentials.txt`

## 🔍 Managing Your Deployment

### View All Resources

```powershell
az resource list --resource-group mandiapp-rg --output table
```

### View App Service Logs

```powershell
az webapp log tail --resource-group mandiapp-rg --name mandiapp-1234-identity-api
```

### Restart an App

```powershell
az webapp restart --resource-group mandiapp-rg --name mandiapp-1234-identity-api
```

### Scale Up (More Power)

```powershell
az appservice plan update --resource-group mandiapp-rg --name mandiapp-plan --sku B2
```

### Scale Out (More Instances)

```powershell
az appservice plan update --resource-group mandiapp-rg --name mandiapp-plan --number-of-workers 2
```

## 🔒 Add Custom Domain & SSL

### Step 1: Map Domain

```powershell
az webapp config hostname add --resource-group mandiapp-rg --webapp-name mandiapp-1234-identity-api --hostname api.yourdomain.com
```

### Step 2: Enable SSL (Free!)

```powershell
az webapp config ssl bind --resource-group mandiapp-rg --name mandiapp-1234-identity-api --certificate-thumbprint auto --ssl-type SNI
```

Azure provides **FREE SSL certificates** automatically!

## 🗄️ Database Management

### Connect to Database

```powershell
# Using Azure Cloud Shell (in portal)
psql "host=mandiapp-db-1234.postgres.database.azure.com port=5432 dbname=MandiIdentityDB user=mandiadmin password=YOUR_PASSWORD sslmode=require"
```

### Backup Database

```powershell
pg_dump "host=mandiapp-db-1234.postgres.database.azure.com port=5432 dbname=MandiIdentityDB user=mandiadmin password=YOUR_PASSWORD sslmode=require" > backup.sql
```

### Restore Database

```powershell
psql "host=mandiapp-db-1234.postgres.database.azure.com port=5432 dbname=MandiIdentityDB user=mandiadmin password=YOUR_PASSWORD sslmode=require" < backup.sql
```

## 🔄 Update/Redeploy

### Update an API

```powershell
# Rebuild and push image
docker build -t mandiapp1234.azurecr.io/identity-api:latest Backend/Services/Identity.API
docker push mandiapp1234.azurecr.io/identity-api:latest

# Restart web app to pull new image
az webapp restart --resource-group mandiapp-rg --name mandiapp-1234-identity-api
```

### Full Redeployment

```powershell
# Delete everything
az group delete --name mandiapp-rg --yes --no-wait

# Deploy again
.\azure-deploy.ps1
```

## 📊 Monitoring

### View Metrics

```powershell
# CPU Usage
az monitor metrics list --resource /subscriptions/.../mandiapp-1234-identity-api --metric "CpuPercentage"

# Memory Usage
az monitor metrics list --resource /subscriptions/.../mandiapp-1234-identity-api --metric "MemoryPercentage"

# HTTP Requests
az monitor metrics list --resource /subscriptions/.../mandiapp-1234-identity-api --metric "Requests"
```

### Enable Application Insights (Recommended)

```powershell
# Create Application Insights
az monitor app-insights component create --resource-group mandiapp-rg --app mandiapp-insights --location centralindia

# Link to Web App
az webapp config appsettings set --resource-group mandiapp-rg --name mandiapp-1234-identity-api --settings APPINSIGHTS_INSTRUMENTATIONKEY=<key>
```

## 🐛 Troubleshooting

### App Not Starting

```powershell
# Check logs
az webapp log tail --resource-group mandiapp-rg --name mandiapp-1234-identity-api

# Check container logs
az webapp log download --resource-group mandiapp-rg --name mandiapp-1234-identity-api
```

### Database Connection Issues

```powershell
# Test connection
az postgres flexible-server connect --name mandiapp-db-1234 --admin-user mandiadmin

# Check firewall rules
az postgres flexible-server firewall-rule list --resource-group mandiapp-rg --name mandiapp-db-1234
```

### Container Not Pulling

```powershell
# Check ACR
az acr repository list --name mandiapp1234

# Re-configure web app
az webapp config container set --resource-group mandiapp-rg --name mandiapp-1234-identity-api --docker-custom-image-name mandiapp1234.azurecr.io/identity-api:latest
```

## 💾 Backup & Disaster Recovery

### Automated Backups

Azure automatically backs up:
- **Database**: Point-in-time restore up to 7 days
- **Web Apps**: App settings and configuration

### Manual Backup

```powershell
# Export web app configuration
az webapp config appsettings list --resource-group mandiapp-rg --name mandiapp-1234-identity-api > backup-config.json

# Backup database
pg_dump "host=..." > backup-$(Get-Date -Format 'yyyyMMdd').sql
```

## 🗑️ Clean Up (Delete Everything)

```powershell
# Delete all resources
az group delete --name mandiapp-rg --yes --no-wait
```

This removes:
- All web apps
- Database
- Container registry
- Storage
- Everything!

## 📞 Azure Support

- **Documentation**: https://docs.microsoft.com/azure/
- **Support Portal**: https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade
- **Pricing Calculator**: https://azure.microsoft.com/pricing/calculator/
- **Free Account**: https://azure.microsoft.com/free/

## 🆚 Azure vs Oracle Cloud

| Feature | Azure | Oracle Cloud |
|---------|-------|--------------|
| Setup Difficulty | ⭐ Easy | ⭐⭐⭐ Complex |
| SSH Access | Auto-configured | Manual setup |
| Documentation | Excellent | Good |
| CLI Tools | Excellent | Good |
| Free Tier | ₹20,000 credits | Always Free VM |
| Support | Better | Good |
| Managed Services | More options | Limited |

## 🎓 Next Steps

1. ✅ Deploy backend with `.\azure-deploy.ps1`
2. ⏹ Deploy frontend (separate script coming)
3. ⏹ Configure custom domain
4. ⏹ Enable Application Insights
5. ⏹ Setup CI/CD pipeline
6. ⏹ Configure scaling rules

---

**Ready to deploy?** Just run: `.\azure-deploy.ps1`

**Questions?** All credentials and URLs will be saved to `azure-credentials.txt`
