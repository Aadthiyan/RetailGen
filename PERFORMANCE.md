# Performance Optimization Guide - RetailGen AI

## Current Performance Metrics

### Target Metrics
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3.5s
- **Cumulative Layout Shift (CLS):** < 0.1
- **First Input Delay (FID):** < 100ms

## Implemented Optimizations

### 1. Code Splitting & Lazy Loading

#### Dynamic Imports
```typescript
// Lazy load heavy components
const ExportPanel = dynamic(() => import('./ExportPanel'), {
  loading: () => <Skeleton />,
  ssr: false
});
```

#### Route-based Code Splitting
- Next.js automatically splits code by route
- Each page bundle loaded on-demand

### 2. Image Optimization

#### Cloudinary Integration
- Automatic format conversion (WebP, AVIF)
- Responsive image sizing
- Lazy loading with blur placeholders
- CDN delivery

```typescript
// Example usage
<Image
  src={cloudinaryUrl}
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
/>
```

### 3. Database Query Optimization

#### Convex Best Practices
- Indexed queries for fast lookups
- Pagination for large datasets
- Selective field projection
- Real-time subscriptions only where needed

```typescript
// Optimized query with index
const creatives = await ctx.db
  .query("creatives")
  .withIndex("by_user", (q) => q.eq("userId", userId))
  .order("desc")
  .take(20);
```

### 4. Bundle Size Optimization

#### Current Bundle Sizes
- **Main Bundle:** ~250KB (gzipped)
- **Vendor Bundle:** ~180KB (gzipped)
- **Total JS:** ~430KB (gzipped)

#### Optimization Strategies
- Tree shaking enabled
- Dynamic imports for heavy libraries
- Removed unused dependencies
- Minification and compression

### 5. Caching Strategy

#### Browser Caching
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

#### API Response Caching
- Convex handles caching automatically
- Stale-while-revalidate for non-critical data

### 6. Rendering Optimizations

#### React Best Practices
- `useMemo` for expensive calculations
- `useCallback` for stable function references
- `React.memo` for pure components
- Virtualization for long lists

```typescript
// Example: Memoized calculation
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);
```

### 7. Font Optimization

#### Google Fonts
- Preconnect to font CDN
- Font display: swap
- Subset fonts to reduce size

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

## Performance Monitoring

### Tools
1. **Lighthouse:** Built into Chrome DevTools
2. **Web Vitals:** Real user monitoring
3. **Sentry:** Error tracking and performance
4. **PostHog:** User analytics

### Running Lighthouse
```bash
npm run build
npm start
# In Chrome DevTools: Lighthouse tab > Generate report
```

### Web Vitals Integration
```typescript
// pages/_app.tsx
import { reportWebVitals } from 'next/web-vitals';

export function reportWebVitals(metric) {
  console.log(metric);
  // Send to analytics
}
```

## Optimization Checklist

### Initial Load
- [ ] Enable gzip/brotli compression
- [ ] Minimize critical CSS
- [ ] Defer non-critical JavaScript
- [ ] Preload critical resources
- [ ] Use CDN for static assets

### Runtime Performance
- [ ] Debounce expensive operations
- [ ] Throttle scroll/resize handlers
- [ ] Use Web Workers for heavy computation
- [ ] Implement virtual scrolling for long lists
- [ ] Optimize re-renders with React DevTools

### Network Performance
- [ ] Minimize API calls
- [ ] Batch requests where possible
- [ ] Use HTTP/2 multiplexing
- [ ] Implement request deduplication
- [ ] Add offline support with Service Workers

## Common Performance Issues

### Issue: Large Bundle Size
**Solution:**
- Analyze bundle with `@next/bundle-analyzer`
- Remove unused dependencies
- Use dynamic imports for large libraries

### Issue: Slow Initial Load
**Solution:**
- Reduce JavaScript execution time
- Optimize images and fonts
- Enable server-side rendering (SSR)
- Use static generation where possible

### Issue: Layout Shifts
**Solution:**
- Set explicit width/height for images
- Reserve space for dynamic content
- Avoid inserting content above existing content

### Issue: Slow API Responses
**Solution:**
- Add database indexes
- Implement caching
- Optimize queries
- Use pagination

## Advanced Optimizations

### 1. Service Worker
```typescript
// Register service worker for offline support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### 2. Resource Hints
```html
<!-- Preload critical resources -->
<link rel="preload" href="/fonts/inter.woff2" as="font" crossorigin />

<!-- Prefetch next page -->
<link rel="prefetch" href="/dashboard" />

<!-- DNS prefetch -->
<link rel="dns-prefetch" href="https://api.cloudinary.com" />
```

### 3. Image Sprites
- Combine small icons into sprite sheets
- Reduce HTTP requests
- Use SVG sprites for scalability

### 4. Code Minification
- JavaScript: Terser (built into Next.js)
- CSS: cssnano (built into Next.js)
- HTML: html-minifier

## Monitoring & Alerts

### Set Up Alerts
- LCP > 2.5s
- FID > 100ms
- CLS > 0.1
- Error rate > 1%

### Regular Audits
- Weekly Lighthouse audits
- Monthly bundle size review
- Quarterly performance review

## Resources

- [Web.dev Performance](https://web.dev/performance/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Convex Best Practices](https://docs.convex.dev/production/best-practices)

---

*Last Updated: December 2, 2025*
