/**
 * API Response Caching Utility
 * 
 * Simple in-memory cache for API responses
 * Use Redis or similar in production for distributed caching
 */

import { PERFORMANCE_CONFIG } from './config';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

class ResponseCache {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor() {
        // Clean up expired entries every minute
        if (typeof window === 'undefined') {
            this.cleanupInterval = setInterval(() => {
                this.cleanup();
            }, 60000);
        }
    }

    /**
     * Get cached response
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) return null;

        // Check if expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Set cached response
     */
    set<T>(key: string, data: T, ttl?: number): void {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            ttl: ttl || PERFORMANCE_CONFIG.cache.apiCache.default,
        };

        this.cache.set(key, entry);
    }

    /**
     * Delete cached response
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Clear all cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Clean up expired entries
     */
    private cleanup(): void {
        const now = Date.now();

        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Get cache statistics
     */
    getStats(): {
        size: number;
        hitRate: number;
        entries: number;
    } {
        return {
            size: this.cache.size,
            hitRate: 0, // Would need to track hits/misses
            entries: this.cache.size,
        };
    }

    /**
     * Destroy cache and cleanup
     */
    destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.clear();
    }
}

// Global cache instance
export const responseCache = new ResponseCache();

/**
 * Cache decorator for async functions
 */
export function cached<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    options?: {
        ttl?: number;
        keyGenerator?: (...args: Parameters<T>) => string;
    }
): T {
    return (async (...args: Parameters<T>) => {
        // Generate cache key
        const key = options?.keyGenerator
            ? options.keyGenerator(...args)
            : `${fn.name}:${JSON.stringify(args)}`;

        // Check cache
        const cached = responseCache.get(key);
        if (cached !== null) {
            return cached;
        }

        // Execute function
        const result = await fn(...args);

        // Cache result
        responseCache.set(key, result, options?.ttl);

        return result;
    }) as T;
}

/**
 * Generate cache key from request
 */
export function generateCacheKey(
    method: string,
    url: string,
    params?: Record<string, any>
): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${method}:${url}:${paramsStr}`;
}

/**
 * Cache middleware for API routes
 */
export function withCache<T>(
    handler: () => Promise<T>,
    cacheKey: string,
    ttl?: number
): Promise<T> {
    const cached = responseCache.get<T>(cacheKey);

    if (cached !== null) {
        return Promise.resolve(cached);
    }

    return handler().then(result => {
        responseCache.set(cacheKey, result, ttl);
        return result;
    });
}
