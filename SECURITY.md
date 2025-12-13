# Security Guide - RetailGen AI

## Overview

RetailGen AI implements comprehensive security measures to protect user data, prevent unauthorized access, and ensure compliance with industry standards.

---

## Security Architecture

### Defense in Depth

We implement multiple layers of security:

1. **Network Layer:** HTTPS, DDoS protection, WAF
2. **Application Layer:** Input validation, output encoding, CSRF protection
3. **Authentication Layer:** Clerk, MFA, session management
4. **Data Layer:** Encryption at rest and in transit
5. **Infrastructure Layer:** Secure deployment, monitoring, backups

---

## OWASP Top 10 Mitigation

### 1. Broken Access Control ✅

**Mitigations:**
- Clerk authentication on all protected routes
- Convex authentication checks in all mutations/queries
- User-scoped data access
- Role-based access control (RBAC)

**Implementation:**
```typescript
// Convex function with auth check
export const myFunction = mutation({
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    
    // User can only access their own data
    const data = await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("userId"), identity.tokenIdentifier))
      .collect();
  },
});
```

### 2. Cryptographic Failures ✅

**Mitigations:**
- HTTPS everywhere (enforced in production)
- Encrypted data at rest (Convex, Cloudinary)
- Secure password hashing (Clerk)
- No sensitive data in logs

**Implementation:**
- All API keys stored in environment variables
- Secrets never committed to Git
- `.env.local` in `.gitignore`

### 3. Injection ✅

**Mitigations:**
- Input validation on all user inputs
- Parameterized queries (Convex prevents SQL injection)
- HTML sanitization (DOMPurify)
- No eval() or dangerous functions

**Implementation:**
```typescript
import { sanitizeInput, sanitizeHTML } from '@/lib/security/validation';

// Sanitize user input
const clean = sanitizeInput(userInput);

// Sanitize HTML
const safeHTML = sanitizeHTML(userHTML);
```

### 4. Insecure Design ✅

**Mitigations:**
- Security requirements in design phase
- Threat modeling
- Secure defaults
- Principle of least privilege

**Implementation:**
- All features designed with security in mind
- Security reviews before deployment
- Regular security audits

### 5. Security Misconfiguration ✅

**Mitigations:**
- Security headers configured
- CORS properly configured
- No default credentials
- Error messages don't leak sensitive info

**Implementation:**
```typescript
// Security headers
const headers = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy': '...',
};
```

### 6. Vulnerable Components ✅

**Mitigations:**
- Regular dependency updates
- Automated vulnerability scanning
- No known vulnerable dependencies
- Minimal dependency footprint

**Implementation:**
```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Check outdated packages
npm outdated
```

### 7. Authentication Failures ✅

**Mitigations:**
- Clerk handles authentication
- MFA support
- Session management
- Rate limiting on auth endpoints

**Implementation:**
- Clerk provides secure authentication
- Sessions expire after 7 days
- Failed login attempts rate limited

### 8. Software and Data Integrity Failures ✅

**Mitigations:**
- Subresource Integrity (SRI) for CDN resources
- Code signing
- Secure CI/CD pipeline
- Integrity checks on uploads

**Implementation:**
```typescript
// File integrity validation
const validation = await validateFileBuffer(buffer, filename, mimeType);
if (!validation.valid) {
  throw new Error(validation.error);
}
```

### 9. Security Logging Failures ✅

**Mitigations:**
- Comprehensive logging (Sentry)
- Audit trail for sensitive operations
- Log retention policy
- Sensitive data masked in logs

**Implementation:**
```typescript
// Audit logging
await ctx.db.insert("complianceAudit", {
  creativeId,
  userId,
  action: 'certify',
  timestamp: Date.now(),
});
```

### 10. Server-Side Request Forgery (SSRF) ✅

**Mitigations:**
- URL validation
- Whitelist of allowed domains
- No user-controlled URLs in server requests
- Network segmentation

**Implementation:**
```typescript
// URL validation
if (!isValidURL(url)) {
  throw new Error('Invalid URL');
}

// Check against whitelist
const allowedDomains = ['cloudinary.com', 'replicate.com'];
const domain = new URL(url).hostname;
if (!allowedDomains.includes(domain)) {
  throw new Error('Domain not allowed');
}
```

---

## Authentication & Authorization

### Clerk Integration

**Features:**
- OAuth providers (Google, GitHub, etc.)
- Email/password authentication
- Multi-factor authentication (MFA)
- Session management
- User management

**Configuration:**
```typescript
// middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/api/health"],
});
```

### Session Security

**Settings:**
- **Max Age:** 7 days
- **Rolling:** Yes (extends on activity)
- **Secure:** HTTPS only in production
- **HttpOnly:** Yes (prevents XSS access)
- **SameSite:** Lax (CSRF protection)

---

## Data Protection

### Encryption

**At Rest:**
- Convex: AES-256 encryption
- Cloudinary: Encrypted storage
- Backups: Encrypted

**In Transit:**
- HTTPS/TLS 1.3
- Certificate pinning (production)
- No mixed content

### Data Classification

| Level | Examples | Protection |
|-------|----------|------------|
| **Public** | Landing page content | None required |
| **Internal** | User preferences | Authentication required |
| **Confidential** | Creative content | User-scoped access |
| **Restricted** | API keys, credentials | Environment variables only |

---

## Input Validation

### Client-Side Validation

```typescript
// Form validation
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  message: z.string().max(1000),
});

const result = schema.safeParse(formData);
if (!result.success) {
  // Handle validation errors
}
```

### Server-Side Validation

```typescript
// API route validation
import { sanitizeInput, isValidEmail } from '@/lib/security/validation';

export async function POST(req: NextRequest) {
  const { email, message } = await req.json();
  
  // Validate and sanitize
  if (!isValidEmail(email)) {
    return errorResponse('Invalid email', 400);
  }
  
  const cleanMessage = sanitizeInput(message);
  
  // Process...
}
```

---

## File Upload Security

### Validation Steps

1. **File Size:** Max 10MB
2. **MIME Type:** Whitelist (JPEG, PNG, WebP)
3. **File Extension:** Whitelist (.jpg, .png, .webp)
4. **Magic Numbers:** Verify file signature
5. **Malware Scan:** Check for malicious content
6. **Filename:** Sanitize to prevent directory traversal

### Implementation

```typescript
import { validateFile } from '@/lib/security/fileValidation';

const validation = validateFile(file);
if (!validation.valid) {
  throw new Error(validation.error);
}

// Use sanitized filename
const secureFilename = validation.sanitizedFilename;
```

---

## API Security

### Rate Limiting

**Limits:**
- **General API:** 100 requests/minute
- **AI Generation:** 10 requests/minute
- **Image Analysis:** 20 requests/minute
- **Auth Endpoints:** 5 attempts/15 minutes

**Implementation:**
```typescript
import { apiRateLimitMiddleware } from '@/lib/security/middleware';

export async function POST(req: NextRequest) {
  const rateLimitResponse = apiRateLimitMiddleware(req);
  if (rateLimitResponse) return rateLimitResponse;
  
  // Process request...
}
```

### API Key Management

**Best Practices:**
- Store in environment variables
- Rotate regularly
- Use different keys for dev/staging/prod
- Never commit to Git
- Use secret management service (production)

---

## Frontend Security

### XSS Prevention

**Mitigations:**
- React escapes output by default
- DOMPurify for user-generated HTML
- Content Security Policy
- No `dangerouslySetInnerHTML` without sanitization

**Example:**
```typescript
// Safe
<div>{userInput}</div>

// Unsafe - requires sanitization
<div dangerouslySetInnerHTML={{ __html: sanitizeHTML(userHTML) }} />
```

### CSRF Protection

**Mitigations:**
- SameSite cookies
- CSRF tokens (Clerk handles this)
- Double-submit cookies
- Custom headers

### Content Security Policy

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: https: blob:;
font-src 'self' https://fonts.gstatic.com;
connect-src 'self' https://*.convex.cloud https://*.clerk.accounts.dev;
```

---

## Database Security

### Convex Security

**Features:**
- Automatic authentication integration
- User-scoped queries
- No SQL injection (NoSQL database)
- Encrypted at rest
- Encrypted in transit

**Best Practices:**
```typescript
// Always check authentication
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("Unauthenticated");

// User-scoped queries
const items = await ctx.db
  .query("items")
  .filter((q) => q.eq(q.field("userId"), identity.tokenIdentifier))
  .collect();
```

---

## Secrets Management

### Environment Variables

**Never commit:**
- API keys
- Database credentials
- OAuth secrets
- Encryption keys

**Storage:**
```env
# .env.local (gitignored)
OPENAI_API_KEY=sk-...
REPLICATE_API_TOKEN=r8_...
CLOUDINARY_API_SECRET=...
```

### Production Secrets

**Vercel:**
- Store in Vercel dashboard
- Environment-specific secrets
- Encrypted at rest

**Best Practices:**
- Rotate regularly
- Use different secrets per environment
- Monitor for leaks (GitHub secret scanning)
- Use secret management service (AWS Secrets Manager, etc.)

---

## Security Monitoring

### Logging

**What we log:**
- Authentication events
- API requests
- Errors and exceptions
- Compliance checks
- File uploads

**What we DON'T log:**
- Passwords
- API keys
- Sensitive user data
- Full request bodies

### Monitoring Tools

- **Sentry:** Error tracking and performance
- **PostHog:** User analytics
- **Vercel Analytics:** Performance monitoring
- **Convex Dashboard:** Database monitoring

---

## Incident Response

### Security Incident Process

1. **Detection:** Monitoring alerts
2. **Assessment:** Determine severity
3. **Containment:** Limit damage
4. **Eradication:** Remove threat
5. **Recovery:** Restore services
6. **Lessons Learned:** Post-mortem

### Contact

**Security Issues:**
- Email: security@retailgen.ai
- Response Time: < 24 hours
- PGP Key: Available on request

---

## Compliance

### Standards

- **OWASP Top 10:** Mitigated
- **WCAG 2.1 AA:** Accessibility compliance
- **GDPR:** Data protection (EU users)
- **SOC 2 Type II:** Enterprise (planned)

### Data Privacy

- **Data Collection:** Minimal, necessary only
- **Data Retention:** Configurable
- **Data Deletion:** User-initiated
- **Data Export:** Available on request

---

## Security Checklist

### Development
- [ ] No hardcoded secrets
- [ ] Input validation on all inputs
- [ ] Output encoding
- [ ] Error handling doesn't leak info
- [ ] Dependencies up to date

### Deployment
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Monitoring configured
- [ ] Backups enabled

### Ongoing
- [ ] Regular security audits
- [ ] Dependency updates
- [ ] Log review
- [ ] Incident response plan tested
- [ ] Team security training

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Clerk Security](https://clerk.com/docs/security)
- [Convex Security](https://docs.convex.dev/production/security)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)

---

*Last Updated: December 2, 2025*
