# Security Agent Instructions

## Overview
As a security agent, your responsibility is to identify, prevent, and fix security vulnerabilities in both frontend and backend applications.

## Security Responsibilities

### 1. Code Security Review
### 2. Dependency Security
### 3. Configuration Security
### 4. Authentication & Authorization
### 5. Data Protection
### 6. API Security
### 7. Deployment Security

## Security Checklist

### Backend Security

#### Input Validation
- [ ] Validate all user inputs
- [ ] Sanitize data before processing
- [ ] Use parameterized queries (prevent SQL injection)
- [ ] Validate file uploads (type, size, content)
- [ ] Implement rate limiting

#### Authentication & Authorization
- [ ] Use secure session management
- [ ] Implement strong password policies
- [ ] Use JWT tokens securely
- [ ] Implement OAuth 2.0 for third-party auth
- [ ] Use HTTPS for all authentication endpoints
- [ ] Implement multi-factor authentication (MFA)

#### API Security
- [ ] Implement CORS properly
- [ ] Use API rate limiting
- [ ] Validate API tokens
- [ ] Implement request size limits
- [ ] Log security events
- [ ] Use API versioning

#### Data Security
- [ ] Encrypt sensitive data at rest
- [ ] Encrypt data in transit (HTTPS/TLS)
- [ ] Hash passwords with bcrypt/argon2
- [ ] Never log sensitive data
- [ ] Implement data retention policies
- [ ] Use environment variables for secrets

#### Error Handling
- [ ] Don't expose stack traces in production
- [ ] Use generic error messages for users
- [ ] Log errors securely
- [ ] Implement proper error boundaries

### Frontend Security

#### XSS Prevention
- [ ] Sanitize user input
- [ ] Use React's built-in XSS protection
- [ ] Avoid dangerouslySetInnerHTML
- [ ] Validate data from API
- [ ] Use Content Security Policy (CSP)

#### Authentication
- [ ] Store tokens securely (httpOnly cookies)
- [ ] Don't store sensitive data in localStorage
- [ ] Implement token refresh mechanism
- [ ] Clear tokens on logout
- [ ] Handle expired sessions

#### Data Protection
- [ ] Don't expose API keys in frontend
- [ ] Use environment variables
- [ ] Minimize data exposure
- [ ] Implement client-side encryption for sensitive data

## Security Implementation

### Environment Variables

**Backend (.env)**
```bash
# Never commit this file to Git!
PORT=3001
NODE_ENV=production

# Database
DB_HOST=localhost
DB_USER=dbuser
DB_PASSWORD=strong_password_here
DB_NAME=myapp

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=24h

# API Keys
API_KEY=your_api_key_here
```

**Frontend (.env)**
```bash
# Public variables only (REACT_APP_ prefix)
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_ENV=production
```

### Security Headers (Backend)

```javascript
// src/middleware/security.js
const helmet = require('helmet');

app.use(helmet());

// Custom security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

### Rate Limiting

```javascript
// src/middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);
```

### Input Validation

```javascript
// src/middleware/validation.js
const { body, validationResult } = require('express-validator');

const validateUser = [
  body('email').isEmail().normalizeEmail(),
  body('name').trim().isLength({ min: 2, max: 50 }).escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

router.post('/users', validateUser, userController.createUser);
```

### CORS Configuration

```javascript
// src/server.js
const cors = require('cors');

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
```

### Authentication Example

```javascript
// src/middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
```

### Password Hashing

```javascript
// src/utils/password.js
const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = { hashPassword, comparePassword };
```

## Dependency Security

### Audit Dependencies

```bash
# Backend
cd backend
npm audit
npm audit fix

# Frontend
cd frontend
npm audit
npm audit fix
```

### Update Dependencies

```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Update to latest versions (carefully)
npx npm-check-updates -u
npm install
```

### Security Scanning Tools

```bash
# Snyk
npm install -g snyk
snyk test
snyk monitor

# OWASP Dependency-Check
dependency-check --project MyProject --scan ./

# npm audit
npm audit --production
```

## Common Vulnerabilities

### 1. SQL Injection
**Risk**: Malicious SQL queries can access/modify database

**Prevention**:
- Use parameterized queries
- Use ORM/ODM libraries
- Validate and sanitize input

```javascript
// Bad
const query = `SELECT * FROM users WHERE id = ${req.params.id}`;

// Good
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [req.params.id]);
```

### 2. Cross-Site Scripting (XSS)
**Risk**: Malicious scripts executed in user's browser

**Prevention**:
- Sanitize user input
- Use React's built-in protection
- Implement CSP headers
- Avoid dangerouslySetInnerHTML

```javascript
// Bad
<div dangerouslySetInnerHTML={{__html: userInput}} />

// Good
<div>{userInput}</div>
```

### 3. Cross-Site Request Forgery (CSRF)
**Risk**: Unauthorized commands transmitted from user

**Prevention**:
- Use CSRF tokens
- Check Origin/Referer headers
- Use SameSite cookie attribute

```javascript
const csrf = require('csurf');
app.use(csrf({ cookie: true }));
```

### 4. Sensitive Data Exposure
**Risk**: Exposure of sensitive information

**Prevention**:
- Encrypt sensitive data
- Use HTTPS
- Don't log sensitive data
- Use environment variables

```javascript
// Bad
console.log('User password:', password);

// Good
console.log('User authenticated successfully');
```

### 5. Broken Authentication
**Risk**: Compromise user accounts

**Prevention**:
- Implement secure session management
- Use strong password policies
- Implement account lockout
- Use MFA

### 6. Security Misconfiguration
**Risk**: Unnecessary exposure or access

**Prevention**:
- Remove default credentials
- Disable directory listing
- Keep software updated
- Configure security headers

### 7. Insecure Deserialization
**Risk**: Remote code execution

**Prevention**:
- Validate serialized data
- Use safe parsing methods
- Implement integrity checks

```javascript
// Bad
eval(userInput);

// Good
JSON.parse(userInput); // with try-catch
```

### 8. Using Components with Known Vulnerabilities
**Risk**: Exploitable vulnerabilities in dependencies

**Prevention**:
- Regular dependency updates
- Use npm audit
- Monitor security advisories

## Security Testing

### Manual Security Testing

```bash
# Test SQL Injection
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "test'; DROP TABLE users;--", "email": "test@test.com"}'

# Test XSS
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "<script>alert('XSS')</script>", "email": "test@test.com"}'

# Test Rate Limiting
for i in {1..150}; do curl http://localhost:3001/api/users; done
```

### Automated Security Testing

```javascript
// backend/src/__tests__/security.test.js
describe('Security Tests', () => {
  it('should reject SQL injection attempts', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: "'; DROP TABLE users;--", email: 'test@test.com' });
    
    expect(response.status).toBe(400);
  });

  it('should sanitize XSS attempts', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: '<script>alert("XSS")</script>', email: 'test@test.com' });
    
    expect(response.body.data.name).not.toContain('<script>');
  });

  it('should enforce rate limiting', async () => {
    const requests = Array(101).fill(null).map(() => 
      request(app).get('/api/users')
    );
    
    const responses = await Promise.all(requests);
    const tooManyRequests = responses.filter(r => r.status === 429);
    expect(tooManyRequests.length).toBeGreaterThan(0);
  });
});
```

## Security Monitoring

### Logging Security Events

```javascript
// src/middleware/securityLogger.js
const logger = require('./logger');

const logSecurityEvent = (event, details) => {
  logger.warn('Security Event', {
    event,
    details,
    timestamp: new Date().toISOString(),
    ip: details.ip,
    userAgent: details.userAgent
  });
};

// Usage
app.use((req, res, next) => {
  if (req.path.includes('admin') && !req.user?.isAdmin) {
    logSecurityEvent('unauthorized_admin_access', {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      path: req.path
    });
  }
  next();
});
```

### Security Alerts

Set up alerts for:
- Failed login attempts
- Unauthorized access attempts
- Unusual traffic patterns
- Vulnerability discoveries
- Certificate expiration

## Incident Response

### Security Incident Checklist

1. **Identify**: Detect and confirm the incident
2. **Contain**: Limit the damage
3. **Eradicate**: Remove the threat
4. **Recover**: Restore systems
5. **Learn**: Document and improve

### Response Steps

1. **Immediate Actions**
   - Isolate affected systems
   - Preserve evidence
   - Notify stakeholders
   - Document everything

2. **Investigation**
   - Analyze logs
   - Identify attack vector
   - Assess damage
   - Identify compromised data

3. **Remediation**
   - Patch vulnerabilities
   - Update credentials
   - Deploy fixes
   - Monitor for recurrence

4. **Post-Incident**
   - Conduct review
   - Update procedures
   - Train team
   - Improve defenses

## Compliance & Standards

### OWASP Top 10
- Review annually
- Test for each vulnerability
- Document compliance

### GDPR Compliance
- Data minimization
- User consent
- Right to deletion
- Data breach notification

### PCI DSS (if handling payments)
- Never store CVV
- Encrypt card data
- Use secure payment gateways

## Security Documentation

### Required Documentation
- Security policies
- Incident response plan
- Data classification
- Access control policies
- Encryption standards
- Backup procedures

## Quick Reference

### Security Commands
```bash
# Audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Check for updates
npm outdated

# Security scan with Snyk
snyk test
```

### Security Headers
```javascript
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

### Environment Variables Checklist
- [ ] All secrets in environment variables
- [ ] .env file in .gitignore
- [ ] .env.example committed (without secrets)
- [ ] Different secrets for each environment
- [ ] Secrets rotated regularly

## Resources
- OWASP: https://owasp.org/
- Node.js Security Best Practices: https://nodejs.org/en/docs/guides/security/
- React Security: https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml
- CWE Top 25: https://cwe.mitre.org/top25/
