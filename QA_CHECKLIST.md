# Quality Assurance Checklist - RetailGen AI

## Overview

This document provides a comprehensive QA checklist for RetailGen AI, covering functionality, performance, security, compliance, and integration testing.

**Testing Philosophy:** Follow the Testing Pyramid - 70% Unit, 20% Integration, 10% E2E

---

## Pre-Release QA Checklist

### 1. Functionality Testing

#### Core Features
- [ ] **Asset Upload**
  - [ ] Upload images (JPG, PNG, WebP)
  - [ ] File size validation (max 10MB)
  - [ ] MIME type validation
  - [ ] Preview generation
  - [ ] Asset library display
  - [ ] Asset deletion

- [ ] **Canvas Editor**
  - [ ] Add/remove elements (text, images, shapes)
  - [ ] Resize and position elements
  - [ ] Layer management (reorder, lock, hide)
  - [ ] Undo/redo functionality
  - [ ] Auto-save (every 30 seconds)
  - [ ] Manual save
  - [ ] Canvas export to JSON

- [ ] **AI Generation**
  - [ ] Layout generation with Stable Diffusion
  - [ ] Copywriting with GPT-4
  - [ ] Recommendations engine
  - [ ] Error handling for API failures
  - [ ] Loading states displayed

- [ ] **Compliance Validation**
  - [ ] All 15 Tesco rules execute
  - [ ] Compliance score calculated correctly
  - [ ] Errors vs warnings differentiated
  - [ ] AI Copilot provides guidance
  - [ ] Auto-fix suggestions work
  - [ ] Certification generation
  - [ ] Audit trail logged

- [ ] **Export Functionality**
  - [ ] All 9 formats export correctly
  - [ ] Smart resize maintains layout
  - [ ] Safe zones respected
  - [ ] ZIP package created
  - [ ] README.txt included
  - [ ] Export history tracked
  - [ ] Re-download works

#### User Workflows
- [ ] Sign up and onboarding
- [ ] Create new project
- [ ] Upload assets
- [ ] Design creative
- [ ] Run compliance check
- [ ] Fix violations
- [ ] Export to multiple formats
- [ ] Download package

#### Error Handling
- [ ] Error messages are user-friendly
- [ ] Errors don't crash the app
- [ ] Error boundaries catch UI errors
- [ ] Toast notifications display correctly
- [ ] Network errors handled gracefully
- [ ] Retry logic works for transient failures

#### Data Persistence
- [ ] Creatives save correctly
- [ ] Assets persist after upload
- [ ] Compliance results stored
- [ ] Export history maintained
- [ ] User preferences saved
- [ ] No data loss on refresh

---

### 2. Performance Testing

#### Response Times
- [ ] Page load < 3 seconds (LCP < 2.5s)
- [ ] Canvas operations < 100ms
- [ ] API responses < 500ms
- [ ] Image load < 2 seconds
- [ ] Export completes < 60 seconds

#### Canvas Performance
- [ ] Smooth editing with 50+ elements
- [ ] No lag when adding/removing objects
- [ ] Undo/redo is instant
- [ ] Rendering at 60fps
- [ ] No memory leaks after extended use

#### Database Performance
- [ ] Queries execute < 500ms
- [ ] Pagination works efficiently
- [ ] No N+1 query issues
- [ ] Indexes used correctly

#### Bundle Size
- [ ] Main bundle < 250KB (gzipped)
- [ ] Vendor bundle < 200KB (gzipped)
- [ ] Total JS < 500KB (gzipped)
- [ ] Images optimized (WebP/AVIF)

#### Core Web Vitals
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] Lighthouse score > 85

---

### 3. Security Testing

#### Authentication & Authorization
- [ ] Clerk authentication works
- [ ] Users can only access their own data
- [ ] Protected routes require login
- [ ] Session timeout works (7 days)
- [ ] Logout clears session

#### Input Validation
- [ ] All user inputs sanitized
- [ ] HTML tags removed/escaped
- [ ] SQL injection prevented (Convex NoSQL)
- [ ] XSS attacks blocked
- [ ] File uploads validated

#### API Security
- [ ] Rate limiting enforced
- [ ] CORS configured correctly
- [ ] Security headers present
- [ ] API keys not exposed
- [ ] Error messages don't leak info

#### Data Protection
- [ ] HTTPS enforced (production)
- [ ] Sensitive data masked in logs
- [ ] No secrets in Git
- [ ] Environment variables used
- [ ] Passwords hashed (Clerk)

#### File Upload Security
- [ ] File size limits enforced
- [ ] MIME type validation
- [ ] Magic number verification
- [ ] Malware detection (basic)
- [ ] Filename sanitization

---

### 4. Compliance Testing

#### Rule Accuracy
- [ ] Logo size validation correct
- [ ] Text size validation correct
- [ ] Safe zone validation correct
- [ ] Brand color detection accurate
- [ ] Logo placement validation correct
- [ ] Mandatory elements detected
- [ ] Color contrast calculation correct
- [ ] Image quality assessment accurate

#### Compliance Scoring
- [ ] Score calculation correct (0-100%)
- [ ] Pass/fail threshold correct (70%)
- [ ] Error vs warning distinction clear
- [ ] Summary counts accurate

#### AI Copilot
- [ ] Explanations are clear
- [ ] Business context relevant
- [ ] Fix suggestions actionable
- [ ] Learning tips helpful
- [ ] No hallucinations

#### False Positives/Negatives
- [ ] Minimal false positives (< 5%)
- [ ] Minimal false negatives (< 5%)
- [ ] Edge cases handled
- [ ] Guideline updates applied

---

### 5. Browser & Device Testing

#### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

#### Mobile Browsers
- [ ] Chrome Mobile
- [ ] Safari iOS
- [ ] Samsung Internet

#### Responsive Design
- [ ] Mobile (320px - 767px)
- [ ] Tablet (768px - 1023px)
- [ ] Desktop (1024px+)
- [ ] Large screens (1920px+)

#### Touch Interactions
- [ ] Tap targets > 44x44px
- [ ] Swipe gestures work
- [ ] Pinch to zoom disabled on canvas
- [ ] Touch scrolling smooth

#### Keyboard Navigation
- [ ] Tab order logical
- [ ] Focus indicators visible
- [ ] Keyboard shortcuts work
- [ ] Escape closes modals

#### Accessibility
- [ ] Screen reader compatible
- [ ] ARIA labels present
- [ ] Color contrast WCAG AA
- [ ] Keyboard accessible
- [ ] Alt text on images

---

### 6. Integration Testing

#### External Services
- [ ] **Cloudinary**
  - [ ] Image upload works
  - [ ] Signed uploads secure
  - [ ] Optimized URLs generated
  - [ ] Deletion works
  - [ ] Error handling

- [ ] **OpenAI (GPT-4)**
  - [ ] Copywriting generates text
  - [ ] Recommendations work
  - [ ] Copilot guidance works
  - [ ] Rate limiting handled
  - [ ] Errors handled gracefully

- [ ] **Replicate (Stable Diffusion)**
  - [ ] Image generation works
  - [ ] Layout generation works
  - [ ] Polling for results works
  - [ ] Timeouts handled
  - [ ] Errors handled

- [ ] **Google Vision API**
  - [ ] Logo detection works
  - [ ] Text extraction (OCR) works
  - [ ] Color analysis works
  - [ ] Object detection works
  - [ ] Errors handled

- [ ] **Tesseract.js (Client-side OCR)**
  - [ ] Text extraction works
  - [ ] Fallback for Vision API
  - [ ] Performance acceptable

- [ ] **Clerk (Auth)**
  - [ ] Sign up works
  - [ ] Sign in works
  - [ ] OAuth providers work
  - [ ] Session management works
  - [ ] User data syncs

- [ ] **Convex (Database)**
  - [ ] Real-time updates work
  - [ ] Mutations execute
  - [ ] Queries return data
  - [ ] Authentication integrated
  - [ ] Errors handled

---

### 7. Regression Testing

After each deployment, verify:
- [ ] No previously working features broken
- [ ] All critical paths still work
- [ ] Performance hasn't degraded
- [ ] No new console errors
- [ ] Tests still pass

---

## Test Execution

### Manual Testing
1. **Smoke Test:** Quick check of critical paths (15 min)
2. **Full Regression:** Complete checklist (2-3 hours)
3. **Exploratory:** Free-form testing (1 hour)

### Automated Testing
```bash
# Run all tests
npm test

# Run with coverage
npm test:coverage

# Run E2E tests (if configured)
npx playwright test
```

### Performance Testing
```bash
# Lighthouse audit
npm run build
npx lighthouse http://localhost:3000 --view

# Load testing (k6)
k6 run load-test.js
```

### Security Testing
```bash
# Dependency scan
npm audit

# OWASP ZAP scan
# (Manual via ZAP UI)
```

---

## Bug Reporting

When a bug is found:
1. **Severity:** SEV-1 (Critical), SEV-2 (High), SEV-3 (Medium), SEV-4 (Low)
2. **Steps to Reproduce:** Clear, numbered steps
3. **Expected vs Actual:** What should happen vs what happens
4. **Environment:** Browser, OS, version
5. **Screenshots/Video:** Visual evidence
6. **Logs:** Console errors, network errors

---

## Sign-Off Criteria

Before production release:
- [ ] All SEV-1 and SEV-2 bugs fixed
- [ ] All P0 tests passing
- [ ] 90%+ P1 tests passing
- [ ] Performance targets met
- [ ] Security scan passed
- [ ] Stakeholder approval

---

## QA Team Contacts

- **QA Lead:** [Name]
- **Security Tester:** [Name]
- **Performance Tester:** [Name]
- **Accessibility Tester:** [Name]

---

*Last Updated: December 2, 2025*
