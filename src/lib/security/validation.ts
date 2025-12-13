/**
 * Input Validation and Sanitization Utilities
 * 
 * Protects against XSS, SQL injection, and other injection attacks
 */

// Lazy load DOMPurify only on client-side
let DOMPurify: any = null;
if (typeof window !== 'undefined') {
    import('isomorphic-dompurify').then(module => {
        DOMPurify = module.default;
    });
}

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHTML(dirty: string): string {
    // If DOMPurify is not loaded (server-side), just strip all HTML
    if (!DOMPurify || typeof window === 'undefined') {
        return dirty.replace(/<[^>]*>/g, '');
    }

    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
        ALLOWED_ATTR: ['href', 'title'],
    });
}

/**
 * Sanitize user input (remove HTML, trim, normalize)
 */
export function sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';

    return input
        .trim()
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/[<>]/g, '') // Remove angle brackets
        .substring(0, 10000); // Limit length
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate URL format
 */
export function isValidURL(url: string): boolean {
    try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
        return false;
    }
}

/**
 * Validate file extension
 */
export function isValidFileExtension(filename: string, allowedExtensions: string[]): boolean {
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return allowedExtensions.includes(ext);
}

/**
 * Validate MIME type
 */
export function isValidMimeType(mimeType: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(mimeType.toLowerCase());
}

/**
 * Sanitize filename (prevent directory traversal)
 */
export function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars
        .replace(/\.{2,}/g, '.') // Remove multiple dots
        .replace(/^\.+/, '') // Remove leading dots
        .substring(0, 255); // Limit length
}

/**
 * Validate JSON structure
 */
export function isValidJSON(str: string): boolean {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

/**
 * Validate Convex ID format
 */
export function isValidConvexId(id: string): boolean {
    // Convex IDs are base64-like strings
    return /^[a-zA-Z0-9_-]+$/.test(id) && id.length > 0 && id.length < 100;
}

/**
 * Validate number within range
 */
export function isNumberInRange(value: number, min: number, max: number): boolean {
    return typeof value === 'number' && !isNaN(value) && value >= min && value <= max;
}

/**
 * Validate string length
 */
export function isValidLength(str: string, min: number, max: number): boolean {
    return typeof str === 'string' && str.length >= min && str.length <= max;
}

/**
 * Detect potential SQL injection patterns
 */
export function hasSQLInjection(input: string): boolean {
    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
        /(--|;|\/\*|\*\/|xp_|sp_)/i,
        /(\bOR\b.*=.*|1=1|'=')/i,
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Detect potential XSS patterns
 */
export function hasXSS(input: string): boolean {
    const xssPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi, // Event handlers like onclick=
        /<iframe/gi,
        /eval\(/gi,
    ];

    return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Validate and sanitize object keys
 */
export function sanitizeObjectKeys(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = sanitizeInput(key);

        if (typeof value === 'string') {
            sanitized[sanitizedKey] = sanitizeInput(value);
        } else if (typeof value === 'object' && value !== null) {
            sanitized[sanitizedKey] = sanitizeObjectKeys(value);
        } else {
            sanitized[sanitizedKey] = value;
        }
    }

    return sanitized;
}

/**
 * Rate limit key generator
 */
export function generateRateLimitKey(identifier: string, action: string): string {
    return `ratelimit:${action}:${identifier}`;
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string): string {
    if (data.length <= 8) {
        return '***';
    }
    return data.substring(0, 4) + '***' + data.substring(data.length - 4);
}
