/**
 * Performance Monitoring Utilities
 * 
 * Track and report performance metrics
 */

import { PERFORMANCE_CONFIG, PERFORMANCE_THRESHOLDS } from './config';

// Performance entry types
type PerformanceMetric = {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    timestamp: number;
};

// Performance observer for Web Vitals
export class PerformanceMonitor {
    private metrics: Map<string, PerformanceMetric> = new Map();
    private observers: PerformanceObserver[] = [];

    constructor() {
        if (typeof window !== 'undefined') {
            this.initializeObservers();
        }
    }

    private initializeObservers() {
        // Observe LCP
        this.observeLCP();

        // Observe FID
        this.observeFID();

        // Observe CLS
        this.observeCLS();
    }

    private observeLCP() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1] as any;

                this.recordMetric('LCP', lastEntry.renderTime || lastEntry.loadTime);
            });

            observer.observe({ entryTypes: ['largest-contentful-paint'] });
            this.observers.push(observer);
        } catch (e) {
            // LCP not supported
        }
    }

    private observeFID() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry: any) => {
                    this.recordMetric('FID', entry.processingStart - entry.startTime);
                });
            });

            observer.observe({ entryTypes: ['first-input'] });
            this.observers.push(observer);
        } catch (e) {
            // FID not supported
        }
    }

    private observeCLS() {
        try {
            let clsValue = 0;
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry: any) => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        this.recordMetric('CLS', clsValue);
                    }
                });
            });

            observer.observe({ entryTypes: ['layout-shift'] });
            this.observers.push(observer);
        } catch (e) {
            // CLS not supported
        }
    }

    private recordMetric(name: string, value: number) {
        const rating = this.getRating(name, value);

        const metric: PerformanceMetric = {
            name,
            value,
            rating,
            timestamp: Date.now(),
        };

        this.metrics.set(name, metric);

        // Report to analytics
        this.reportMetric(metric);
    }

    private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
        const thresholds = PERFORMANCE_CONFIG.webVitals[name.toLowerCase() as keyof typeof PERFORMANCE_CONFIG.webVitals];

        if (!thresholds) return 'good';

        if (value <= thresholds.good) return 'good';
        if (value <= thresholds.needsImprovement) return 'needs-improvement';
        return 'poor';
    }

    private reportMetric(metric: PerformanceMetric) {
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Performance] ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);
        }

        // Send to analytics (PostHog, Sentry, etc.)
        if (typeof window !== 'undefined' && (window as any).posthog) {
            (window as any).posthog.capture('performance_metric', {
                metric: metric.name,
                value: metric.value,
                rating: metric.rating,
            });
        }
    }

    getMetrics(): PerformanceMetric[] {
        return Array.from(this.metrics.values());
    }

    disconnect() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
    }
}

// Measure function execution time
export function measurePerformance<T>(
    name: string,
    fn: () => T,
    threshold?: number
): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;

    if (threshold && duration > threshold) {
        console.warn(`[Performance] ${name} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`);
    }

    return result;
}

// Measure async function execution time
export async function measurePerformanceAsync<T>(
    name: string,
    fn: () => Promise<T>,
    threshold?: number
): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    if (threshold && duration > threshold) {
        console.warn(`[Performance] ${name} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`);
    }

    return result;
}

// Debounce function for performance
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for performance
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

// Memory usage monitoring
export function getMemoryUsage(): {
    used: number;
    total: number;
    percentage: number;
} | null {
    if (typeof window === 'undefined' || !(performance as any).memory) {
        return null;
    }

    const memory = (performance as any).memory;
    return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
    };
}

// Check if memory usage is high
export function isMemoryHigh(): boolean {
    const usage = getMemoryUsage();
    return usage ? usage.percentage > 80 : false;
}

// Global performance monitor instance
export const performanceMonitor = typeof window !== 'undefined'
    ? new PerformanceMonitor()
    : null;
