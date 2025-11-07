# Deployment Agent Instructions

## Overview
As a deployment agent, your responsibility is to deploy the application to various environments (staging, production) and ensure smooth operation in production.

## Deployment Methods

### 1. Docker Deployment (Recommended)

#### Prerequisites
- Docker installed
- Docker Compose installed

#### Steps
```bash
# Build and start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Configuration
The `docker-compose.yml` file defines:
- Backend service on port 3001
- Frontend service on port 3000
- Environment variables
- Volume mounts for development

### 2. Manual Deployment

#### Backend Deployment

1. **Prepare Environment**
```bash
cd backend
npm install --production
```

2. **Set Environment Variables**
```bash
export PORT=3001
export NODE_ENV=production
```

3. **Start Server**
```bash
npm start
```

For production, use a process manager like PM2:
```bash
npm install -g pm2
pm2 start src/server.js --name backend-api
pm2 save
pm2 startup
```

#### Frontend Deployment

1. **Build Production Bundle**
```bash
cd frontend
npm install
npm run build
```

2. **Serve Static Files**

Option A: Using serve package
```bash
npm install -g serve
serve -s build -p 3000
```

Option B: Using Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/frontend/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3001/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Cloud Platform Deployment

#### Heroku

**Backend**
```bash
cd backend
heroku create your-app-backend
heroku config:set NODE_ENV=production
git subtree push --prefix backend heroku master
```

**Frontend**
```bash
cd frontend
heroku create your-app-frontend
heroku config:set REACT_APP_API_URL=https://your-app-backend.herokuapp.com/api
git subtree push --prefix frontend heroku master
```

#### AWS (EC2)

1. Launch EC2 instance
2. SSH into instance
3. Install Node.js and npm
4. Clone repository
5. Follow manual deployment steps
6. Configure security groups for ports 3000 and 3001

#### DigitalOcean

1. Create Droplet
2. SSH into droplet
3. Install Node.js and npm
4. Clone repository
5. Follow manual deployment steps
6. Configure firewall

#### Vercel (Frontend only)

```bash
cd frontend
npm install -g vercel
vercel --prod
```

## Environment Configuration

### Production Environment Variables

**Backend (.env)**
```
PORT=3001
NODE_ENV=production
# Add database connection strings
# Add API keys and secrets
# Add other production-specific variables
```

**Frontend (.env.production)**
```
REACT_APP_API_URL=https://your-backend-url.com/api
```

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Dependencies updated and security audited
- [ ] Production build tested locally
- [ ] Database migrations applied (if applicable)
- [ ] SSL certificates configured
- [ ] Domain names configured
- [ ] Monitoring and logging set up
- [ ] Backup strategy in place
- [ ] Documentation updated

## Post-Deployment Verification

1. **Check Backend Health**
```bash
curl https://your-backend-url.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

2. **Verify Frontend**
- Access frontend URL in browser
- Check console for errors
- Test user interactions
- Verify API communication

3. **Monitor Logs**
```bash
# Docker
docker-compose logs -f

# PM2
pm2 logs backend-api

# System logs
tail -f /var/log/application.log
```

## Rollback Procedures

### Docker
```bash
# Stop current deployment
docker-compose down

# Checkout previous version
git checkout <previous-commit>

# Rebuild and start
docker-compose up -d --build
```

### PM2
```bash
# Rollback to previous version
pm2 reload backend-api --update-env
```

### Manual
```bash
# Checkout previous version
git checkout <previous-commit>

# Reinstall dependencies
cd backend && npm install
cd ../frontend && npm install && npm run build

# Restart services
pm2 restart backend-api
```

## Monitoring

### Health Checks
- Backend: `GET /health` endpoint
- Frontend: Check if page loads successfully
- Set up automated health checks with services like:
  - UptimeRobot
  - Pingdom
  - StatusCake

### Application Monitoring
- Use APM tools (New Relic, DataDog, Application Insights)
- Set up error tracking (Sentry, Rollbar)
- Monitor performance metrics
- Set up alerts for errors and downtime

### Log Management
- Centralize logs (ELK Stack, Splunk, CloudWatch)
- Set up log rotation
- Monitor for errors and warnings

## Performance Optimization

### Backend
- Enable compression middleware
- Implement caching strategies
- Optimize database queries
- Use CDN for static assets
- Enable HTTP/2

### Frontend
- Minimize bundle size
- Code splitting and lazy loading
- Optimize images
- Enable browser caching
- Use CDN for static assets

## Security Considerations

- Use HTTPS/SSL certificates
- Set security headers
- Implement rate limiting
- Use environment variables for secrets
- Keep dependencies updated
- Regular security audits
- Implement CORS properly
- Use authentication/authorization

## Scaling Strategies

### Horizontal Scaling
- Load balancer (Nginx, HAProxy)
- Multiple application instances
- Container orchestration (Kubernetes, Docker Swarm)

### Vertical Scaling
- Increase server resources
- Optimize application performance

## Backup Strategy

- Database backups (if applicable)
- Application code in version control
- Environment configuration backups
- Regular backup testing

## Disaster Recovery

1. Document recovery procedures
2. Test recovery process regularly
3. Keep backup of critical data
4. Have rollback plan ready
5. Document infrastructure as code

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy Backend
        run: |
          # Deployment commands
      - name: Deploy Frontend
        run: |
          # Deployment commands
```

## Support and Maintenance

- Regular dependency updates
- Security patches
- Performance monitoring
- Log analysis
- User feedback monitoring

## Emergency Contacts

- DevOps Lead: [contact info]
- Backend Team: [contact info]
- Frontend Team: [contact info]
- Infrastructure Team: [contact info]

## Troubleshooting

### Common Issues

**Backend not responding**
- Check if process is running
- Check logs for errors
- Verify environment variables
- Check network connectivity

**Frontend not loading**
- Check if static files are served correctly
- Verify API URL configuration
- Check browser console for errors
- Verify CDN/assets loading

**Database connection issues**
- Verify connection string
- Check database server status
- Verify network connectivity
- Check credentials

## Quick Reference

### Docker Commands
```bash
docker-compose up -d        # Start services
docker-compose down         # Stop services
docker-compose logs -f      # View logs
docker-compose ps           # Check status
docker-compose restart      # Restart services
```

### PM2 Commands
```bash
pm2 start app.js            # Start app
pm2 stop app                # Stop app
pm2 restart app             # Restart app
pm2 logs app                # View logs
pm2 list                    # List all apps
pm2 monit                   # Monitor apps
```

## Documentation

Keep deployment documentation updated:
- Deployment procedures
- Environment configurations
- Troubleshooting guides
- Architecture diagrams
- Runbooks for common issues
