/**
 * Security Configuration for RetailGen AI
 * 
 * This file centralizes security settings and constants
 */

export const SECURITY_CONFIG = {
    // Rate Limiting
    rateLimits: {
        auth: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 5, // 5 attempts
        },
        api: {
            windowMs: 60 * 1000, // 1 minute
            max: 100, // 100 requests
        },
        aiGeneration: {
            windowMs: 60 * 1000, // 1 minute
            max: 10, // 10 requests
        },
        imageAnalysis: {
            windowMs: 60 * 1000, // 1 minute
            max: 20, // 20 requests
        },
    },

    // File Upload Security
    fileUpload: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
        ],
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
        scanForMalware: true,
    },

    // Password Requirements
    password: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
    },

    // Session Management
    session: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        rolling: true,
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax' as const,
    },

    // CORS Configuration
    cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    },

    // Content Security Policy
    csp: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.jsdelivr.net'],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            connectSrc: ["'self'", 'https://*.convex.cloud', 'https://*.clerk.accounts.dev'],
            frameSrc: ["'self'", 'https://*.clerk.accounts.dev'],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },

    // Security Headers
    headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
};

// Sensitive data patterns to detect and prevent logging
export const SENSITIVE_PATTERNS = [
    /api[_-]?key/i,
    /secret/i,
    /password/i,
    /token/i,
    /bearer/i,
    /authorization/i,
    /credential/i,
];

// Allowed file extensions for different contexts
export const ALLOWED_EXTENSIONS = {
    images: ['.jpg', '.jpeg', '.png', '.webp'],
    documents: ['.pdf', '.doc', '.docx'],
    all: ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.doc', '.docx'],
};

// Maximum file sizes by type (in bytes)
export const MAX_FILE_SIZES = {
    image: 10 * 1024 * 1024, // 10MB
    document: 5 * 1024 * 1024, // 5MB
    default: 10 * 1024 * 1024, // 10MB
};
