# Incident Response Plan - RetailGen AI

## 1. Overview

This document outlines the procedures for responding to security incidents, service outages, and critical bugs in the RetailGen AI platform.

**Objective:** Minimize downtime, protect user data, and restore normal service as quickly as possible.

---

## 2. Severity Levels

| Level | Description | Examples | Response Time |
|-------|-------------|----------|---------------|
| **SEV-1 (Critical)** | Complete service outage or critical security breach. | Site down, data leak, payment failure. | < 15 mins |
| **SEV-2 (High)** | Major feature broken or significant performance degradation. | Export failing, AI generation down. | < 1 hour |
| **SEV-3 (Medium)** | Minor feature broken or localized issue. | UI glitch, slow loading for some users. | < 4 hours |
| **SEV-4 (Low)** | Cosmetic issue or non-urgent bug. | Typo, minor styling issue. | < 24 hours |

---

## 3. Roles & Responsibilities

- **Incident Commander (IC):** Leads the response, coordinates team, communicates status. (Usually Tech Lead)
- **Tech Lead:** Investigates root cause, implements fix.
- **Communications Lead:** Updates status page, communicates with customers. (Product Manager)
- **Scribe:** Documents timeline, actions taken, and decisions made.

---

## 4. Response Process

### Phase 1: Detection & Identification
- **Alerts:** Monitoring systems (Sentry, Uptime) trigger alert.
- **Reports:** User reports via support channels.
- **Action:** Verify the issue and determine Severity Level.

### Phase 2: Containment (SEV-1 & SEV-2)
- **Objective:** Stop the bleeding. Prevent further damage or data loss.
- **Actions:**
  - Rollback recent deployments.
  - Enable maintenance mode if necessary.
  - Block malicious IPs.
  - Disable affected feature flags.

### Phase 3: Investigation & Diagnosis
- **Objective:** Find the root cause.
- **Actions:**
  - Analyze logs (Sentry, Server logs).
  - Reproduce the issue in staging.
  - Check recent changes/commits.
  - Check external service status (OpenAI, Clerk, Convex).

### Phase 4: Resolution & Recovery
- **Objective:** Restore full service.
- **Actions:**
  - Implement fix (hotfix).
  - Deploy to production.
  - Verify fix with smoke tests.
  - Restore data from backups if needed.

### Phase 5: Post-Mortem & Review
- **Objective:** Prevent recurrence.
- **Actions:**
  - Conduct Post-Incident Review (PIR) meeting within 24 hours (SEV-1/2).
  - Create PIR document (Root Cause Analysis).
  - Create action items (Jira tickets) to fix underlying issues.

---

## 5. Communication Templates

### Status Page Update (Investigating)
**Title:** Service Issue - [Feature Name]
**Message:** We are currently investigating reports of issues with [Feature]. Our team is working to identify the cause. We will provide an update in [Time].

### Status Page Update (Identified)
**Title:** Service Issue - [Feature Name]
**Message:** We have identified the issue affecting [Feature] as [Brief Cause]. A fix is currently being implemented.

### Status Page Update (Resolved)
**Title:** Resolved - Service Issue - [Feature Name]
**Message:** The issue affecting [Feature] has been resolved. All systems are operational. We apologize for any inconvenience.

---

## 6. Key Contacts & Resources

- **Status Page:** status.retailgen.ai
- **Monitoring:** sentry.io/retailgen
- **Database:** dashboard.convex.dev
- **Hosting:** vercel.com/dashboard

**Emergency Contacts:**
- CTO: [Phone Number]
- Lead Engineer: [Phone Number]
- Security Officer: [Phone Number]

---

*Last Updated: December 2, 2025*
