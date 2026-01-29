# Oracle Cloud VM Deployment Guide

Complete guide for deploying MandiApp to Oracle Cloud Infrastructure (OCI).

## VM Details

- **Instance Name**: vyaparmandap-server
- **Public IP**: 140.245.9.144
- **Private IP**: 10.0.0.13
- **Shape**: VM.Standard.E2.1.Micro (Always Free)
- **OS**: Ubuntu 20.04/22.04

## 🚀 Quick Deployment (3 Steps)

### Step 1: Initial VM Setup (One-time)

Run this script from your local machine to setup the VM:

```powershell
cd d:\MandiApp
.\vm-setup-complete.ps1 -VMIP "140.245.9.144" -VMUser "ubuntu"
```

This will:
- Generate SSH keys
- Install Docker, Nginx, Certbot
- Configure firewall rules
- Prepare VM for deployment

**Time**: ~10 minutes

### Step 2: Configure Oracle Cloud Security Rules

1. Go to Oracle Cloud Console
2. Navigate to: **Networking → Virtual Cloud Networks → Your VCN**
3. Click: **Security Lists → Default Security List**
4. Add these **Ingress Rules**:

| Source CIDR | Protocol | Port Range | Description |
|-------------|----------|------------|-------------|
| 0.0.0.0/0   | TCP      | 80         | HTTP        |
| 0.0.0.0/0   | TCP      | 443        | HTTPS       |
| 0.0.0.0/0   | TCP      | 22         | SSH         |

### Step 3: Deploy Application

```powershell
cd d:\MandiApp
.\deploy-to-oracle.ps1
```

This will:
- Build Angular frontend
- Create deployment package
- Upload to VM
- Build and start Docker containers
- Configure nginx reverse proxy

**Time**: ~15-20 minutes

## 🌐 Access Your Application

After deployment:
- **Application URL**: http://140.245.9.144
- **API Endpoints**:
  - Identity API: http://140.245.9.144/api/identity
  - Marketplace API: http://140.245.9.144/api/marketplace
  - Ordering API: http://140.245.9.144/api/ordering
  - Logistics Hub: http://140.245.9.144/api/logistics

## 📊 Monitoring & Management

### View Logs
```powershell
ssh ubuntu@140.245.9.144 'cd ~/mandiapp && docker compose logs -f'
```

### Check Service Status
```powershell
ssh ubuntu@140.245.9.144 'cd ~/mandiapp && docker compose ps'
```

### Restart Services
```powershell
ssh ubuntu@140.245.9.144 'cd ~/mandiapp && docker compose restart'
```

### Stop Services
```powershell
ssh ubuntu@140.245.9.144 'cd ~/mandiapp && docker compose down'
```

### SSH into VM
```powershell
ssh ubuntu@140.245.9.144
```

## 🔒 SSL Certificate Setup (Optional but Recommended)

### Prerequisites
1. Domain name configured (e.g., vyaparmandap.com)
2. DNS A record pointing to 140.245.9.144

### Install SSL Certificate

1. SSH into VM:
```bash
ssh ubuntu@140.245.9.144
```

2. Get certificate from Let's Encrypt:
```bash
sudo certbot certonly --standalone -d vyaparmandap.com -d www.vyaparmandap.com
```

3. Copy certificates to nginx:
```bash
sudo cp /etc/letsencrypt/live/vyaparmandap.com/fullchain.pem ~/mandiapp/nginx/ssl/
sudo cp /etc/letsencrypt/live/vyaparmandap.com/privkey.pem ~/mandiapp/nginx/ssl/
sudo chown $USER:$USER ~/mandiapp/nginx/ssl/*
```

4. Update nginx configuration:
```bash
cd ~/mandiapp
nano nginx/nginx.conf
```

Uncomment the HTTPS server block and comment out the HTTP redirect section.

5. Restart nginx:
```bash
docker compose restart nginx
```

### Auto-renewal Setup
```bash
sudo crontab -e
```

Add this line:
```
0 0 * * * certbot renew --quiet && cp /etc/letsencrypt/live/vyaparmandap.com/*.pem ~/mandiapp/nginx/ssl/ && docker compose -f ~/mandiapp/docker-compose.yml restart nginx
```

## 🔄 Update/Redeploy Application

To deploy updates:

```powershell
cd d:\MandiApp
.\deploy-to-oracle.ps1
```

To only rebuild without uploading:
```powershell
ssh ubuntu@140.245.9.144 'cd ~/mandiapp && docker compose up --build -d'
```

## 🐛 Troubleshooting

### Cannot Connect to VM
```powershell
# Test connectivity
ping 140.245.9.144

# Test SSH
ssh -v ubuntu@140.245.9.144

# Check Oracle Cloud Security Rules
```

### Services Not Starting
```bash
# Check logs
docker compose logs

# Check specific service
docker compose logs identity-api

# Restart Docker
sudo systemctl restart docker
```

### Port Already in Use
```bash
# Check what's using ports
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :5432

# Stop conflicting services
sudo systemctl stop nginx  # If nginx is running outside Docker
```

### Database Connection Issues
```bash
# Check PostgreSQL
docker compose logs postgres

# Connect to database
docker compose exec postgres psql -U postgres

# Restart database
docker compose restart postgres
```

### High Memory Usage (Always Free Tier)
```bash
# Check memory
free -h

# Check Docker stats
docker stats

# Restart specific service
docker compose restart marketplace-api
```

## 📁 File Structure on VM

```
~/mandiapp/
├── docker-compose.yml          # Production compose file
├── .env                        # Environment variables
├── init-databases.sql          # Database initialization
├── nginx/
│   └── nginx.conf             # Nginx configuration
├── Backend/                    # Backend source code
│   └── Services/
│       ├── Identity.API/
│       ├── Marketplace.API/
│       ├── Ordering.API/
│       └── Logistics.Hub/
└── www/                        # Frontend build output
```

## 🔐 Security Best Practices

1. **Change Default Passwords**
   - Update `.env` file on VM
   - Generate secure JWT secret

2. **Enable Firewall**
   ```bash
   sudo ufw enable
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

3. **Regular Updates**
   ```bash
   sudo apt update && sudo apt upgrade -y
   docker compose pull
   ```

4. **Backup Database**
   ```bash
   docker compose exec postgres pg_dump -U postgres MandiIdentityDB > backup.sql
   ```

5. **Monitor Logs**
   ```bash
   docker compose logs --tail=100 -f
   ```

## 💰 Cost Optimization (Always Free Tier)

- 1 OCPU and 1 GB RAM (Always Free)
- 10 TB monthly egress (Always Free)
- No charges for public IP

**Tips:**
- Monitor resource usage
- Optimize Docker images
- Use nginx caching
- Compress static assets

## 📞 Support Commands

### System Info
```bash
# Check system resources
htop

# Disk usage
df -h

# Docker disk usage
docker system df
```

### Clean Up
```bash
# Remove unused Docker resources
docker system prune -a

# Remove old images
docker image prune -a
```

## 🎯 Next Steps

1. ✅ Deploy application
2. ✅ Test all APIs
3. ⏹ Configure domain name
4. ⏹ Setup SSL certificate
5. ⏹ Configure backups
6. ⏹ Setup monitoring (optional)
7. ⏹ Load testing

## 📚 Additional Resources

- [Oracle Cloud Documentation](https://docs.oracle.com/en-us/iaas/Content/home.htm)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

---

**Questions?** Check logs first: `docker compose logs -f`
