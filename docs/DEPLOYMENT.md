# Production Deployment Guide

This guide provides comprehensive instructions for deploying the Cyclists Social Network to production using Docker Compose with automatic SSL certificate generation via Traefik and Let's Encrypt.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Deployment Steps](#deployment-steps)
- [Service Configuration](#service-configuration)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [SSL Certificates](#ssl-certificates)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)

## Prerequisites

### Server Requirements

- **Operating System**: Linux (Ubuntu 20.04 LTS or newer recommended)
- **RAM**: Minimum 2GB, 4GB+ recommended
- **Storage**: Minimum 20GB free space
- **CPU**: 2+ cores recommended

### Software Requirements

1. **Docker** (version 20.10 or newer)
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

2. **Docker Compose** (version 2.0 or newer)
   ```bash
   sudo apt-get update
   sudo apt-get install docker compose-plugin
   ```

3. **Git** (for cloning the repository)
   ```bash
   sudo apt-get install git
   ```

### Domain and DNS Setup

1. **Domain Name**: You need a registered domain name (e.g., `yourdomain.com`)

2. **DNS Configuration**: Create the following A records pointing to your server's IP:
   - `yourdomain.com` → Your Server IP
   - `www.yourdomain.com` → Your Server IP
   - `api.yourdomain.com` → Your Server IP
   - `admin.yourdomain.com` → Your Server IP
   - `traefik.yourdomain.com` → Your Server IP

3. **Wait for DNS Propagation**: DNS changes can take up to 24-48 hours to propagate worldwide. Verify with:
   ```bash
   nslookup yourdomain.com
   nslookup api.yourdomain.com
   ```

### External Services Setup

You'll need accounts and API keys for the following services:

1. **Supabase** (Authentication)
   - Create a project at https://supabase.com
   - Get your `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`

2. **Cloudinary** (Image Storage)
   - Create account at https://cloudinary.com
   - Get your `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`

3. **Resend** (Email Service)
   - Create account at https://resend.com
   - Get your `RESEND_API_KEY`

4. **VAPID Keys** (Push Notifications)
   - Generate with: `npx web-push generate-vapid-keys`

## Initial Setup

### 1. Clone the Repository

```bash
cd /opt
sudo git clone https://github.com/yourusername/cyclists-social-network.git
cd cyclists-social-network
```

### 2. Configure Environment Variables

Create your production environment file:

```bash
cp .env.production .env.production.local
nano .env.production.local
```

Update the following variables in `.env.production.local`:

```bash
# Domain Configuration
DOMAIN=yourdomain.com

# Let's Encrypt SSL Certificate
LETSENCRYPT_EMAIL=your-email@example.com

# Traefik Dashboard Authentication (see generation below)
TRAEFIK_AUTH=admin:$$apr1$$xyz$$hashedpassword

# PostgreSQL Database
POSTGRES_USER=cyclists_user
POSTGRES_PASSWORD=your-secure-database-password
POSTGRES_DB=cyclists_db

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Resend
RESEND_API_KEY=your-resend-api-key

# VAPID Keys
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:your-email@example.com
```

**Important**: Use `.env.production.local` for your actual deployment. The `.env.production` file is just a template.

### 3. Generate Traefik Dashboard Password

Use `htpasswd` to generate a hashed password for the Traefik dashboard:

```bash
# Install apache2-utils if not already installed
sudo apt-get install apache2-utils

# Generate password (replace 'your-password' with your actual password)
htpasswd -nb admin your-password
```

This will output something like:
```
admin:$apr1$xyz$hashedpassword
```

**Important**: When adding to `.env.production.local`, escape the dollar signs by doubling them:
```bash
TRAEFIK_AUTH=admin:$$apr1$$xyz$$hashedpassword
```

Alternatively, use an online generator: https://hostingcanada.org/htpasswd-generator/

### 4. Open Firewall Ports

Ensure your firewall allows traffic on ports 80 and 443:

```bash
# UFW (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Or iptables
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

## Deployment Steps

### Automated Deployment (Recommended)

Use the deployment script for automated deployment:

```bash
# Make sure you're using .env.production.local (not .env.production)
mv .env.production.local .env.production

# Run the deployment script
./deploy.sh
```

The script will:
1. ✅ Check for `.env.production` file
2. ✅ Create SSL certificate storage with proper permissions
3. ✅ Build Docker images
4. ✅ Run database migrations
5. ✅ Start all services
6. ✅ Clean up Docker resources
7. ✅ Display deployment status and service URLs

### Manual Deployment

If you prefer manual control:

```bash
# 1. Load environment variables
export $(grep -v '^#' .env.production | xargs)

# 2. Create SSL certificate storage
mkdir -p traefik-certificates
touch traefik-certificates/acme.json
chmod 600 traefik-certificates/acme.json

# 3. Build images
docker compose -f docker compose.prod.yml build --no-cache

# 4. Start services
docker compose -f docker compose.prod.yml up -d

# 5. Run migrations (wait for PostgreSQL to be ready first)
sleep 10
docker compose -f docker compose.prod.yml exec backend npm run migrate:up

# 6. Clean up
docker system prune -f
```

## Service Configuration

### Services Overview

The deployment includes the following services:

1. **Traefik** (Port 80, 443)
   - Reverse proxy and load balancer
   - Automatic SSL certificate generation
   - HTTP to HTTPS redirect

2. **PostgreSQL** (Internal only)
   - Database service
   - Persistent data storage

3. **Backend API** (Port 3001 internal)
   - Next.js API with Socket.IO
   - Accessible at `https://api.yourdomain.com`

4. **Web PWA** (Port 3000 internal)
   - Progressive Web App
   - Accessible at `https://yourdomain.com`

5. **WebAdmin** (Port 3002 internal)
   - Administration panel
   - Accessible at `https://admin.yourdomain.com`

### Service URLs

After successful deployment, your services will be available at:

- **Web App**: https://yourdomain.com
- **Admin Panel**: https://admin.yourdomain.com
- **API**: https://api.yourdomain.com
- **Traefik Dashboard**: https://traefik.yourdomain.com
  - Username: `admin` (or what you set in TRAEFIK_AUTH)
  - Password: Your configured password

## Monitoring and Maintenance

### View Logs

```bash
# All services
docker compose -f docker compose.prod.yml logs -f

# Specific service
docker compose -f docker compose.prod.yml logs -f backend
docker compose -f docker compose.prod.yml logs -f web
docker compose -f docker compose.prod.yml logs -f traefik

# Last 100 lines
docker compose -f docker compose.prod.yml logs --tail=100 backend
```

### Check Service Status

```bash
# View running containers
docker compose -f docker compose.prod.yml ps

# Check container health
docker ps
```

### Restart Services

```bash
# Restart all services
docker compose -f docker compose.prod.yml restart

# Restart specific service
docker compose -f docker compose.prod.yml restart backend
docker compose -f docker compose.prod.yml restart web
```

### Stop Services

```bash
# Stop all services (keeps data)
docker compose -f docker compose.prod.yml down

# Stop and remove volumes (WARNING: deletes all data)
docker compose -f docker compose.prod.yml down -v
```

### Update Application

When you have code updates:

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
./deploy.sh
```

### Database Backup

```bash
# Backup database
docker compose -f docker compose.prod.yml exec postgres pg_dump -U cyclists_user cyclists_db > backup-$(date +%Y%m%d-%H%M%S).sql

# Restore database
docker compose -f docker compose.prod.yml exec -T postgres psql -U cyclists_user cyclists_db < backup-20240101-120000.sql
```

### View Resource Usage

```bash
# Container resource usage
docker stats

# Disk usage
docker system df
```

## SSL Certificates

### Certificate Generation

- SSL certificates are **automatically generated** by Let's Encrypt via Traefik
- Certificates are stored in the `traefik-certificates` volume
- First-time generation may take 1-5 minutes

### Certificate Renewal

- Certificates are **automatically renewed** by Traefik before expiration
- Let's Encrypt certificates are valid for 90 days
- Traefik checks for renewal ~30 days before expiration
- No manual intervention required

### Certificate Verification

Check certificate status:

```bash
# View Traefik logs
docker compose -f docker compose.prod.yml logs traefik | grep -i certificate

# Check acme.json file
sudo cat traefik-certificates/acme.json | jq
```

Verify in browser:
- Visit https://yourdomain.com
- Click the padlock icon
- View certificate details

### Troubleshooting Certificates

If certificates fail to generate:

1. **Verify DNS**: Ensure all DNS records are properly configured
   ```bash
   nslookup yourdomain.com
   dig yourdomain.com
   ```

2. **Check Ports**: Ensure ports 80 and 443 are accessible
   ```bash
   sudo netstat -tuln | grep -E ':80|:443'
   ```

3. **Check Traefik Logs**:
   ```bash
   docker compose -f docker compose.prod.yml logs traefik
   ```

4. **Reset Certificates** (if needed):
   ```bash
   docker compose -f docker compose.prod.yml down
   sudo rm traefik-certificates/acme.json
   touch traefik-certificates/acme.json
   chmod 600 traefik-certificates/acme.json
   docker compose -f docker compose.prod.yml up -d
   ```

5. **Let's Encrypt Rate Limits**: Let's Encrypt has rate limits (50 certificates per domain per week). For testing, use Let's Encrypt staging:
   
   Modify `docker compose.prod.yml`:
   ```yaml
   - "--certificatesresolvers.letsencrypt.acme.caserver=https://acme-staging-v02.api.letsencrypt.org/directory"
   ```

## Troubleshooting

### Common Issues

#### 1. Services Not Starting

**Symptoms**: Containers keep restarting or won't start

**Solutions**:
```bash
# Check logs
docker compose -f docker compose.prod.yml logs

# Check specific service
docker compose -f docker compose.prod.yml logs backend

# Verify environment variables
docker compose -f docker compose.prod.yml config
```

#### 2. Database Connection Errors

**Symptoms**: Backend can't connect to PostgreSQL

**Solutions**:
```bash
# Check if PostgreSQL is running
docker compose -f docker compose.prod.yml ps postgres

# Check PostgreSQL logs
docker compose -f docker compose.prod.yml logs postgres

# Verify DATABASE_URL format
echo $DATABASE_URL
```

#### 3. 502 Bad Gateway

**Symptoms**: Traefik returns 502 error

**Solutions**:
```bash
# Check if backend service is running
docker compose -f docker compose.prod.yml ps

# Check backend logs
docker compose -f docker compose.prod.yml logs backend

# Verify Traefik routing
docker compose -f docker compose.prod.yml logs traefik | grep -i router
```

#### 4. SSL Certificate Errors

**Symptoms**: "Your connection is not private" or certificate warnings

**Solutions**:
- Wait 5 minutes for certificate generation
- Verify DNS is properly configured
- Check Traefik logs for Let's Encrypt errors
- See [Certificate Troubleshooting](#troubleshooting-certificates) above

#### 5. Out of Disk Space

**Symptoms**: Build fails with "no space left on device"

**Solutions**:
```bash
# Clean up Docker resources
docker system prune -a -f

# Remove unused volumes
docker volume prune -f

# Remove unused images
docker image prune -a -f
```

#### 6. Memory Issues

**Symptoms**: Services crashing, OOM errors

**Solutions**:
```bash
# Check memory usage
docker stats

# Add swap space (if needed)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Debug Mode

Enable debug mode for more verbose logging:

1. Add to `docker compose.prod.yml` under Traefik command:
   ```yaml
   - "--log.level=DEBUG"
   ```

2. Restart Traefik:
   ```bash
   docker compose -f docker compose.prod.yml restart traefik
   ```

### Access Container Shell

```bash
# Backend container
docker compose -f docker compose.prod.yml exec backend sh

# Database container
docker compose -f docker compose.prod.yml exec postgres sh

# Web container
docker compose -f docker compose.prod.yml exec web sh
```

## Security Best Practices

### 1. Environment Variables

- ✅ **Never commit** `.env.production.local` to version control
- ✅ Use **strong passwords** for all services (minimum 20 characters)
- ✅ Rotate credentials regularly (every 90 days)
- ✅ Use different passwords for each service

### 2. Firewall Configuration

```bash
# Only allow essential ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. Docker Security

- ✅ Run containers as **non-root users** (already configured)
- ✅ Keep Docker and images **up to date**
- ✅ Use **specific image versions** (not `latest`)
- ✅ Regularly scan images for vulnerabilities:
  ```bash
  docker scan cyclists-backend-prod
  ```

### 4. SSL/TLS

- ✅ Force HTTPS (already configured)
- ✅ Use strong TLS versions (TLS 1.2+)
- ✅ Enable HSTS headers

### 5. Database Security

- ✅ PostgreSQL is **not exposed** publicly (internal network only)
- ✅ Use **strong database password**
- ✅ Regular **backups** (see [Database Backup](#database-backup))
- ✅ Encrypt backups before storing

### 6. Monitoring and Logs

- ✅ Regularly review logs for suspicious activity
- ✅ Set up log rotation to prevent disk space issues
- ✅ Consider using a centralized logging solution (ELK, Grafana, etc.)

### 7. Access Control

- ✅ Limit SSH access (key-based authentication only)
- ✅ Use Traefik dashboard authentication
- ✅ Implement rate limiting for APIs
- ✅ Regular security audits

### 8. Updates and Patches

```bash
# Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# Update Docker
sudo apt-get install docker-ce docker-ce-cli containerd.io

# Rebuild application images
./deploy.sh
```

## Additional Resources

- **Traefik Documentation**: https://doc.traefik.io/traefik/
- **Let's Encrypt**: https://letsencrypt.org/docs/
- **Docker Compose**: https://docs.docker.com/compose/
- **Next.js Production**: https://nextjs.org/docs/deployment
- **PostgreSQL**: https://www.postgresql.org/docs/

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review service logs
3. Open an issue on GitHub
4. Contact the development team

---

**Last Updated**: December 2024
**Version**: 1.0.0
