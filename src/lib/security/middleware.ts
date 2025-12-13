import { NextRequest, NextResponse } from 'next/server';
import { SECURITY_CONFIG } from './config';

/**
 * Rate Limiting Middleware
 * 
 * Simple in-memory rate limiting (use Redis in production)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
    identifier: string,
    config: { windowMs: number; max: number }
): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const key = identifier;
    const existing = rateLimitStore.get(key);

    // Clean up expired entries
    if (existing && now > existing.resetTime) {
        rateLimitStore.delete(key);
    }

    const current = rateLimitStore.get(key);

    if (!current) {
        // First request
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + config.windowMs,
        });
        return {
            allowed: true,
            remaining: config.max - 1,
            resetTime: now + config.windowMs,
        };
    }

    if (current.count >= config.max) {
        // Rate limit exceeded
        return {
            allowed: false,
            remaining: 0,
            resetTime: current.resetTime,
        };
    }

    // Increment count
    current.count++;
    rateLimitStore.set(key, current);

    return {
        allowed: true,
        remaining: config.max - current.count,
        resetTime: current.resetTime,
    };
}

/**
 * API Rate Limiting Middleware
 */
export function apiRateLimitMiddleware(req: NextRequest): NextResponse | null {
    const identifier = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    const result = rateLimit(identifier, SECURITY_CONFIG.rateLimits.api);

    if (!result.allowed) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: 'Too many requests. Please try again later.',
                    retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
                },
            },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': SECURITY_CONFIG.rateLimits.api.max.toString(),
                    'X-RateLimit-Remaining': result.remaining.toString(),
                    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
                    'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
                },
            }
        );
    }

    return null; // Allow request
}

/**
 * Security Headers Middleware
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
    Object.entries(SECURITY_CONFIG.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    // Content Security Policy
    const cspDirectives = Object.entries(SECURITY_CONFIG.csp.directives)
        .map(([key, values]) => {
            const directive = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            return `${directive} ${Array.isArray(values) ? values.join(' ') : values}`;
        })
        .join('; ');

    response.headers.set('Content-Security-Policy', cspDirectives);

    return response;
}

/**
 * CORS Middleware
 */
export function corsMiddleware(req: NextRequest, response: NextResponse): NextResponse {
    const origin = req.headers.get('origin');
    const allowedOrigins = SECURITY_CONFIG.cors.origin;

    if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set(
            'Access-Control-Allow-Methods',
            SECURITY_CONFIG.cors.methods.join(', ')
        );
        response.headers.set(
            'Access-Control-Allow-Headers',
            SECURITY_CONFIG.cors.allowedHeaders.join(', ')
        );
    }

    return response;
}

/**
 * Clean up rate limit store periodically
 */
if (typeof window === 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, value] of rateLimitStore.entries()) {
            if (now > value.resetTime) {
                rateLimitStore.delete(key);
            }
        }
    }, 60000); // Clean up every minute
}
