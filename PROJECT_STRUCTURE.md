# RetailGen AI - Project Structure

## Complete Folder & File Structure

```
retailgen-ai/
├── public/
│   └── .gitkeep
│
├── src/
│   ├── app/                                    # Next.js App Router
│   │   ├── layout.tsx                          # Root layout
│   │   ├── page.tsx                            # Landing page
│   │   │
│   │   ├── (marketing)/                        # Marketing routes
│   │   │   └── demo/
│   │   │       └── page.tsx                    # Demo for judges
│   │   │
│   │   ├── app/                                # Main application
│   │   │   ├── layout.tsx                      # Auth-protected shell
│   │   │   ├── page.tsx                        # Dashboard
│   │   │   └── builder/
│   │   │       ├── page.tsx                    # Creative builder
│   │   │       └── preview/
│   │   │           └── page.tsx                # Full-screen preview
│   │   │
│   │   └── api/                                # API Routes
│   │       ├── ai/
│   │       │   ├── generate-layout/route.ts
│   │       │   ├── generate-copy/route.ts
│   │       │   └── suggest-variants/route.ts
│   │       ├── assets/
│   │       │   ├── upload/route.ts
│   │       │   └── list/route.ts
│   │       ├── compliance/
│   │       │   └── validate/route.ts
│   │       ├── export/
│   │       │   └── render/route.ts
│   │       └── health/route.ts
│   │
│   ├── components/                             # Reusable UI Components
│   │   ├── ui/
│   │   │   ├── button/
│   │   │   │   ├── Button.tsx
│   │   │   │   └── index.ts
│   │   │   ├── input/Input.tsx
│   │   │   ├── select/Select.tsx
│   │   │   ├── modal/Modal.tsx
│   │   │   ├── tabs/Tabs.tsx
│   │   │   ├── toast/Toast.tsx
│   │   │   └── spinner/Spinner.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   │
│   │   └── common/
│   │       ├── EmptyState.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── LoadingState.tsx
│   │
│   ├── features/                               # Feature Modules
│   │   ├── builder/
│   │   │   ├── components/
│   │   │   │   ├── CanvasEditor.tsx
│   │   │   │   ├── AssetSidebar.tsx
│   │   │   │   ├── LayerList.tsx
│   │   │   │   └── Toolbar.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useCanvasState.ts
│   │   │   │   └── useKeyboardShortcuts.ts
│   │   │   ├── store/
│   │   │   │   └── builderStore.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── assets/
│   │   │   ├── components/
│   │   │   │   ├── AssetUploadPanel.tsx
│   │   │   │   └── AssetLibraryGrid.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAssetLibrary.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── ai/
│   │   │   ├── components/
│   │   │   │   ├── LayoutSuggestionsPanel.tsx
│   │   │   │   └── CopySuggestions.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAiSuggestions.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── compliance/
│   │   │   ├── components/
│   │   │   │   ├── ComplianceSidebar.tsx
│   │   │   │   ├── RuleViolationList.tsx
│   │   │   │   └── GuidelineTooltip.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useComplianceCheck.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── export/
│   │   │   ├── components/
│   │   │   │   └── ExportDialog.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useExportCreative.ts
│   │   │   └── index.ts
│   │   │
│   │   └── auth/
│   │       ├── components/
│   │       │   ├── LoginForm.tsx
│   │       │   └── RequireAuth.tsx
│   │       └── index.ts
│   │
│   ├── lib/                                    # External Integrations
│   │   ├── ai/
│   │   │   ├── openaiClient.ts
│   │   │   ├── imageGenClient.ts
│   │   │   └── prompts.ts
│   │   │
│   │   ├── compliance/
│   │   │   ├── rules/
│   │   │   │   ├── retailerRules.ts
│   │   │   │   └── brandRules.ts
│   │   │   ├── evaluator.ts
│   │   │   └── scoring.ts
│   │   │
│   │   ├── storage/
│   │   │   ├── cloudinaryClient.ts
│   │   │   └── paths.ts
│   │   │
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   └── constants.ts
│   │   │
│   │   └── logging/
│   │       └── logger.ts
│   │
│   ├── server/                                 # Server-Only Logic
│   │   ├── db/
│   │   │   ├── client.ts
│   │   │   └── models.ts
│   │   │
│   │   ├── services/
│   │   │   ├── assetService.ts
│   │   │   ├── creativeService.ts
│   │   │   ├── aiService.ts
│   │   │   └── complianceService.ts
│   │   │
│   │   └── actions/
│   │       ├── createCreative.ts
│   │       └── validateCreative.ts
│   │
│   ├── styles/                                 # Global Styles
│   │   ├── globals.css
│   │   ├── tailwind.css
│   │   └── theme.css
│   │
│   ├── types/                                  # TypeScript Types
│   │   ├── creative.ts
│   │   ├── compliance.ts
│   │   ├── assets.ts
│   │   └── index.ts
│   │
│   └── utils/                                  # Utility Functions
│       ├── format.ts
│       ├── validation.ts
│       ├── image.ts
│       └── id.ts
│
├── .env.local                                  # Environment variables
├── .gitignore                                  # Git ignore
├── next.config.js                              # Next.js config
├── package.json                                # Dependencies
├── README.md                                   # Project documentation
├── tailwind.config.js                          # Tailwind config
└── tsconfig.json                               # TypeScript config

```

## File Count Summary

- **Total Files Created**: 90+
- **API Routes**: 8
- **Feature Modules**: 6 (builder, assets, ai, compliance, export, auth)
- **UI Components**: 14
- **Services**: 4
- **Configuration Files**: 6

## Next Steps

1. Install dependencies:
   ```bash
   npm install next@14 react@18 react-dom@18 typescript @types/react @types/node
   npm install tailwindcss postcss autoprefixer
   npm install fabric @types/fabric
   npm install zustand
   npm install @clerk/nextjs
   npm install openai replicate
   ```

2. Initialize Tailwind:
   ```bash
   npx tailwindcss init -p
   ```

3. Start development:
   ```bash
   npm run dev
   ```

## Structure Benefits

✅ **Feature-Based Organization** - Easy to locate and develop features
✅ **Clear Separation of Concerns** - UI, logic, and services separated
✅ **Scalable Architecture** - Easy to add new features
✅ **Type Safety** - Centralized TypeScript types
✅ **Reusable Components** - Generic UI components
✅ **Clean API Routes** - Thin handlers calling services
