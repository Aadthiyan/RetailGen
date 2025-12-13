# 🚀 RetailGen AI Deployment Guide

This guide covers the deployment process for the RetailGen AI platform, including frontend, backend, and CI/CD pipeline.

## 🏗️ Architecture Overview

- **Frontend:** Next.js 14 (App Router) deployed on Vercel
- **Backend:** Next.js API Routes (Serverless) + Convex (Database & Realtime)
- **Auth:** Clerk
- **Storage:** Cloudinary
- **AI Services:** OpenAI, Replicate, Google Vision

---

## 📦 Prerequisites

Ensure you have the following accounts and API keys ready:

1. **Vercel Account** (for frontend hosting)
2. **Convex Account** (for database)
3. **Clerk Account** (for authentication)
4. **Cloudinary Account** (for asset storage)
5. **GitHub Repository** (for source control)

---

## 🛠️ Environment Variables

Configure these variables in your Vercel project settings:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL |
| `CONVEX_DEPLOYMENT` | Convex deployment ID |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `OPENAI_API_KEY` | OpenAI API key |
| `REPLICATE_API_TOKEN` | Replicate API token |
| `GOOGLE_APPLICATION_CREDENTIALS` | Google Cloud service account JSON |
| `REMOVE_BG_API_KEY` | Remove.bg API key |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog instance URL |

---

## 🚀 Deployment Steps

### 1. Database Deployment (Convex)

Deploy your Convex schema and functions:

```bash
npx convex deploy
```

This will push your local schema to the production Convex instance.

### 2. Frontend Deployment (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** -> **"Project"**
3. Import your GitHub repository `RetailGen`
4. Configure the **Environment Variables** listed above
5. Click **"Deploy"**

Vercel will automatically detect the Next.js framework and build settings.

### 3. CI/CD Pipeline

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that runs on every push to `main`:

- **Linting:** Checks code style
- **Type Checking:** Verifies TypeScript types
- **Build Verification:** Ensures the project builds successfully

To enable this:
1. Go to GitHub Repo -> **Settings** -> **Secrets and variables** -> **Actions**
2. Add the required secrets (mock values can be used for build verification if actual keys are sensitive)

---

## 📊 Monitoring & Observability

### Sentry (Error Tracking)
- Sentry is configured to catch runtime errors in both client and server.
- Check the Sentry dashboard for error reports and stack traces.

### PostHog (Analytics)
- User interactions are tracked via PostHog.
- View the dashboard for:
  - User sign-ups
  - Creative generation stats
  - Feature usage

### API Health Check
- Monitor the `/api/health` endpoint to verify all external services are operational.
- Returns `200 OK` if all services are configured, `503 Service Unavailable` otherwise.

---

## 🔄 Troubleshooting

**Build Fails on Vercel?**
- Check if `npm run build` works locally.
- Verify all environment variables are set in Vercel.
- Check for TypeScript errors (`npm run type-check`).

**Database Connection Errors?**
- Ensure `NEXT_PUBLIC_CONVEX_URL` matches your production Convex instance.
- Run `npx convex deploy` to ensure schema is synced.

**Authentication Issues?**
- Verify Clerk keys and allowed domains in Clerk dashboard.
- Check `middleware.ts` configuration.

---

## 📝 Release Checklist

- [ ] Run full test suite: `npm run test` (if available)
- [ ] Verify linting: `npm run lint`
- [ ] Check types: `npm run type-check`
- [ ] Deploy database: `npx convex deploy`
- [ ] Push to `main` branch
- [ ] Verify Vercel deployment status
- [ ] Check `/api/health` endpoint
