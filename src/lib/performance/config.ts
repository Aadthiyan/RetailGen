/**
 * Performance Configuration for RetailGen AI
 * 
 * Centralized performance settings and thresholds
 */

export const PERFORMANCE_CONFIG = {
    // Core Web Vitals Targets
    webVitals: {
        // Largest Contentful Paint (LCP) - should be < 2.5s
        lcp: {
            good: 2500,
            needsImprovement: 4000,
        },
        // First Input Delay (FID) - should be < 100ms
        fid: {
            good: 100,
            needsImprovement: 300,
        },
        // Cumulative Layout Shift (CLS) - should be < 0.1
        cls: {
            good: 0.1,
            needsImprovement: 0.25,
        },
        // First Contentful Paint (FCP) - should be < 1.8s
        fcp: {
            good: 1800,
            needsImprovement: 3000,
        },
        // Time to First Byte (TTFB) - should be < 800ms
        ttfb: {
            good: 800,
            needsImprovement: 1800,
        },
    },

    // Canvas Performance
    canvas: {
        // Maximum canvas size before warning
        maxDimension: 4096,
        // Target FPS for animations
        targetFPS: 60,
        // Debounce delay for canvas updates (ms)
        debounceDelay: 100,
        // Maximum undo/redo history
        maxHistorySize: 50,
        // Enable object caching
        objectCaching: true,
        // Render on add/remove
        renderOnAddRemove: true,
    },

    // Image Optimization
    images: {
        // Quality settings
        quality: {
            thumbnail: 60,
            preview: 75,
            full: 90,
        },
        // Maximum dimensions
        maxWidth: 4096,
        maxHeight: 4096,
        // Lazy loading threshold (pixels from viewport)
        lazyLoadThreshold: 300,
        // Use WebP when supported
        preferWebP: true,
    },

    // Caching Strategy
    cache: {
        // API response cache duration (ms)
        apiCache: {
            default: 5 * 60 * 1000, // 5 minutes
            static: 60 * 60 * 1000, // 1 hour
            dynamic: 1 * 60 * 1000, // 1 minute
        },
        // Browser cache
        browserCache: {
            images: 'public, max-age=31536000, immutable', // 1 year
            fonts: 'public, max-age=31536000, immutable', // 1 year
            scripts: 'public, max-age=31536000, immutable', // 1 year
            styles: 'public, max-age=31536000, immutable', // 1 year
        },
    },

    // Bundle Size Targets
    bundleSize: {
        // Maximum bundle sizes (bytes)
        maxMainBundle: 250 * 1024, // 250KB
        maxVendorBundle: 200 * 1024, // 200KB
        maxTotalJS: 500 * 1024, // 500KB
        // Warn threshold (percentage of max)
        warnThreshold: 0.8,
    },

    // Database Query Performance
    database: {
        // Maximum query execution time (ms)
        maxQueryTime: 500,
        // Slow query threshold (ms)
        slowQueryThreshold: 200,
        // Enable query result caching
        enableCaching: true,
        // Cache TTL (ms)
        cacheTTL: 5 * 60 * 1000, // 5 minutes
    },

    // API Performance
    api: {
        // Maximum response time (ms)
        maxResponseTime: 500,
        // Slow response threshold (ms)
        slowResponseThreshold: 300,
        // Enable compression
        enableCompression: true,
        // Compression threshold (bytes)
        compressionThreshold: 1024,
    },

    // Monitoring
    monitoring: {
        // Sample rate for performance monitoring (0-1)
        sampleRate: 0.1, // 10% of requests
        // Enable real user monitoring
        enableRUM: true,
        // Report slow operations
        reportSlowOps: true,
    },
};

// Performance thresholds for alerts
export const PERFORMANCE_THRESHOLDS = {
    pageLoad: 3000, // 3 seconds
    apiResponse: 500, // 500ms
    canvasOperation: 100, // 100ms
    imageLoad: 2000, // 2 seconds
    bundleSize: 500 * 1024, // 500KB
};

// Lazy loading configuration
export const LAZY_LOAD_CONFIG = {
    rootMargin: '300px', // Load 300px before entering viewport
    threshold: 0.01, // Trigger when 1% visible
};

// Code splitting routes
export const CODE_SPLIT_ROUTES = [
    '/app/builder',
    '/app/dashboard',
    '/app/projects',
    '/app/assets',
];
