# Developer Onboarding Guide - RetailGen AI

Welcome to the RetailGen AI development team! This guide will help you get set up and productive quickly.

## Prerequisites

Before you begin, ensure you have:

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher (or yarn/pnpm)
- **Git:** Latest version
- **Code Editor:** VS Code recommended
- **Browser:** Chrome (for best DevTools experience)

---

## Quick Start (< 30 minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/retailgen-ai.git
cd retailgen-ai
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages (~750MB).

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Fill in the required values:

```env
# Convex
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=your-secret

# AI Services
OPENAI_API_KEY=sk-...
REPLICATE_API_TOKEN=r8_...
GOOGLE_APPLICATION_CREDENTIALS=./path/to/credentials.json

# Optional: Monitoring
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
SENTRY_DSN=https://...
```

### 4. Set Up Convex

```bash
# Login to Convex
npx convex login

# Initialize Convex project
npx convex dev
```

This will:
- Create a new Convex deployment (or connect to existing)
- Generate TypeScript types
- Start the Convex dev server

**Keep this terminal open** - it watches for schema changes.

### 5. Run the Development Server

In a **new terminal**:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### 6. Verify Setup

1. Open `http://localhost:3000`
2. Sign up for an account (uses Clerk test mode)
3. Upload a test image
4. Create a new creative
5. Run a compliance check

If all steps work, you're ready to develop! 🎉

---

## Project Structure

```
RetailGen/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── app/               # Application pages
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Shared components
│   │   └── ui/               # Base UI components
│   ├── features/              # Feature modules
│   │   ├── assets/           # Asset management
│   │   └── builder/          # Creative builder
│   ├── lib/                   # Core libraries
│   │   ├── ai/               # AI integrations
│   │   ├── compliance/       # Compliance engine
│   │   ├── export/           # Export system
│   │   └── storage/          # Storage utilities
│   └── styles/                # Global styles
├── convex/                    # Convex backend
│   ├── schema.ts             # Database schema
│   ├── assets.ts             # Asset functions
│   ├── creatives.ts          # Creative functions
│   ├── compliance.ts         # Compliance functions
│   └── exports.ts            # Export functions
├── public/                    # Static assets
└── docs/                      # Documentation
```

---

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Follow our coding standards:

- **TypeScript:** Use strict types, avoid `any`
- **Components:** Functional components with hooks
- **Naming:** camelCase for variables, PascalCase for components
- **Imports:** Absolute imports using `@/` alias

### 3. Test Your Changes

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build (to catch build errors)
npm run build
```

### 4. Commit Changes

We use conventional commits:

```bash
git commit -m "feat: add new compliance rule"
git commit -m "fix: resolve export bug"
git commit -m "docs: update API documentation"
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## Key Technologies

### Frontend
- **Next.js 14:** React framework with App Router
- **TypeScript:** Type-safe JavaScript
- **Tailwind CSS:** Utility-first CSS
- **Fabric.js:** Canvas manipulation
- **Zustand:** Local state management

### Backend
- **Convex:** Real-time database and serverless functions
- **Clerk:** Authentication and user management
- **Cloudinary:** Image storage and optimization

### AI Services
- **OpenAI GPT-4:** Copywriting and recommendations
- **Replicate:** Stable Diffusion for image generation
- **Google Vision:** Image analysis and OCR
- **Tesseract.js:** Client-side OCR

---

## Common Tasks

### Adding a New API Route

1. Create file in `src/app/api/your-route/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Your logic here
    
    return successResponse({ data: result });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
```

2. Test with curl or Postman
3. Add to API documentation

### Adding a Convex Function

1. Edit or create file in `convex/`:

```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const myFunction = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    
    // Your logic here
    
    return result;
  },
});
```

2. Convex dev server will auto-generate types
3. Use in frontend:

```typescript
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

const myFunction = useMutation(api.myFile.myFunction);
await myFunction({ name: 'test' });
```

### Adding a UI Component

1. Create in `src/components/ui/`:

```typescript
import { cn } from '@/lib/utils';

interface MyComponentProps {
  className?: string;
  children: React.ReactNode;
}

export function MyComponent({ className, children }: MyComponentProps) {
  return (
    <div className={cn('base-styles', className)}>
      {children}
    </div>
  );
}
```

2. Export from `src/components/ui/index.ts`
3. Use in your feature

### Adding a Compliance Rule

1. Edit `src/lib/compliance/rules.ts`:

```typescript
export const NEW_RULE: ComplianceRule = {
  id: 'retailer-rule-id',
  name: 'Rule Name',
  description: 'What this rule checks',
  category: 'branding',
  severity: 'error',
  retailer: 'tesco',
  validator: {
    type: 'custom',
    params: {},
  },
  enabled: true,
};

// Add to TESCO_RULES array
```

2. Implement validator in `src/lib/compliance/validator.ts`
3. Test with sample creatives

---

## Debugging

### Convex Functions

View logs in the Convex dashboard:
```bash
npx convex dashboard
```

Or use console.log (appears in Convex dev terminal):
```typescript
console.log('Debug:', value);
```

### API Routes

Check Next.js terminal for logs:
```typescript
console.log('API Debug:', data);
```

### Client-Side

Use React DevTools and browser console:
```typescript
console.log('State:', useBuilderStore.getState());
```

---

## Testing

### Manual Testing Checklist

- [ ] Sign up/sign in works
- [ ] Asset upload works
- [ ] Creative creation works
- [ ] Canvas editing works
- [ ] AI generation works
- [ ] Compliance validation works
- [ ] Export works
- [ ] No console errors

### Automated Testing (Future)

We plan to add:
- Unit tests (Jest + React Testing Library)
- Integration tests (Playwright)
- E2E tests (Cypress)

---

## Deployment

### Staging

Automatically deployed on push to `develop` branch.

**URL:** https://staging.retailgen.ai

### Production

Deployed on push to `main` branch (requires approval).

**URL:** https://app.retailgen.ai

### Manual Deployment

```bash
# Build
npm run build

# Deploy Convex
npx convex deploy

# Deploy Next.js (Vercel)
vercel --prod
```

---

## Troubleshooting

### Issue: Convex types not generating

**Solution:**
```bash
# Stop Convex dev
# Delete generated files
rm -rf convex/_generated

# Restart Convex dev
npx convex dev
```

### Issue: "Module not found" errors

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: Environment variables not working

**Solution:**
- Restart dev server after changing `.env.local`
- Check variable names start with `NEXT_PUBLIC_` for client-side
- Verify no typos in variable names

### Issue: Clerk authentication not working

**Solution:**
- Check Clerk dashboard for correct keys
- Verify `middleware.ts` is configured
- Clear browser cookies and try again

---

## Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Convex Docs](https://docs.convex.dev)
- [Clerk Docs](https://clerk.com/docs)
- [Fabric.js Docs](http://fabricjs.com/docs)

### Internal Docs
- [API Documentation](./API_DOCUMENTATION.md)
- [User Guide](./USER_GUIDE.md)
- [Accessibility Guide](./ACCESSIBILITY.md)
- [Performance Guide](./PERFORMANCE.md)

### Team
- **Slack:** #retailgen-dev
- **Standup:** Daily at 10 AM
- **Sprint Planning:** Bi-weekly Mondays

---

## Code Style Guide

### TypeScript

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
}

function getUser(id: string): User {
  // ...
}

// ❌ Bad
function getUser(id: any): any {
  // ...
}
```

### React Components

```typescript
// ✅ Good
export function MyComponent({ title, onClose }: MyComponentProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="container">
      {/* ... */}
    </div>
  );
}

// ❌ Bad
export default function MyComponent(props: any) {
  // ...
}
```

### Imports

```typescript
// ✅ Good - Absolute imports
import { Button } from '@/components/ui/button';
import { useBuilderStore } from '@/features/builder/store';

// ❌ Bad - Relative imports
import { Button } from '../../../components/ui/button';
```

---

## Getting Help

- **Documentation:** Check docs first
- **Code Search:** Use GitHub search
- **Ask Team:** Post in #retailgen-dev
- **Office Hours:** Fridays 2-3 PM

---

## Welcome Aboard! 🚀

You're now ready to contribute to RetailGen AI. If you have any questions, don't hesitate to ask the team!

*Last Updated: December 2, 2025*
