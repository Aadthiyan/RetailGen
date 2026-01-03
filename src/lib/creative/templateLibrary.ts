/**
 * Template Library
 * Pre-designed templates for quick creative generation
 */

export interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    format: string;
    thumbnail: string;
    content: any; // Fabric.js JSON
    tags: string[];
    isPremium: boolean;
    createdAt: number;
}

export interface TemplateCategory {
    id: string;
    name: string;
    description: string;
    icon: string;
    count: number;
}

/**
 * Template categories
 */
export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
    {
        id: 'social-media',
        name: 'Social Media',
        description: 'Instagram, Facebook, Twitter posts',
        icon: '📱',
        count: 0,
    },
    {
        id: 'sale',
        name: 'Sale & Promotion',
        description: 'Sale banners, discount ads',
        icon: '🏷️',
        count: 0,
    },
    {
        id: 'product',
        name: 'Product Showcase',
        description: 'Product displays, e-commerce',
        icon: '📦',
        count: 0,
    },
    {
        id: 'announcement',
        name: 'Announcements',
        description: 'News, updates, launches',
        icon: '📢',
        count: 0,
    },
    {
        id: 'event',
        name: 'Events',
        description: 'Event posters, invitations',
        icon: '🎉',
        count: 0,
    },
    {
        id: 'quote',
        name: 'Quotes',
        description: 'Inspirational quotes, testimonials',
        icon: '💬',
        count: 0,
    },
];

/**
 * Generate sample templates
 */
export function generateSampleTemplates(): Template[] {
    return [
        // Social Media Templates
        {
            id: 'instagram-sale-1',
            name: 'Summer Sale Instagram Post',
            description: 'Vibrant summer sale template for Instagram',
            category: 'sale',
            format: '1080x1080',
            thumbnail: '/templates/instagram-sale-1.png',
            content: generateSaleTemplate('Summer Sale', '50% OFF', '#FF6B6B'),
            tags: ['sale', 'summer', 'instagram'],
            isPremium: false,
            createdAt: Date.now(),
        },
        {
            id: 'instagram-product-1',
            name: 'Product Showcase',
            description: 'Clean product display template',
            category: 'product',
            format: '1080x1080',
            thumbnail: '/templates/instagram-product-1.png',
            content: generateProductTemplate('New Product', '#4ECDC4'),
            tags: ['product', 'clean', 'minimal'],
            isPremium: false,
            createdAt: Date.now(),
        },
        {
            id: 'instagram-quote-1',
            name: 'Motivational Quote',
            description: 'Elegant quote template',
            category: 'quote',
            format: '1080x1080',
            thumbnail: '/templates/instagram-quote-1.png',
            content: generateQuoteTemplate('Your Quote Here', '#8B5CF6'),
            tags: ['quote', 'motivation', 'elegant'],
            isPremium: false,
            createdAt: Date.now(),
        },
        {
            id: 'facebook-event-1',
            name: 'Event Announcement',
            description: 'Eye-catching event poster',
            category: 'event',
            format: '1200x628',
            thumbnail: '/templates/facebook-event-1.png',
            content: generateEventTemplate('Event Name', 'Date & Time', '#F59E0B'),
            tags: ['event', 'announcement', 'facebook'],
            isPremium: false,
            createdAt: Date.now(),
        },
        {
            id: 'instagram-announcement-1',
            name: 'Big Announcement',
            description: 'Bold announcement template',
            category: 'announcement',
            format: '1080x1080',
            thumbnail: '/templates/instagram-announcement-1.png',
            content: generateAnnouncementTemplate('Big News!', '#EF4444'),
            tags: ['announcement', 'bold', 'news'],
            isPremium: false,
            createdAt: Date.now(),
        },
    ];
}

/**
 * Generate sale template
 */
function generateSaleTemplate(title: string, discount: string, color: string): any {
    return {
        version: '5.3.0',
        objects: [
            {
                type: 'rect',
                left: 0,
                top: 0,
                width: 1080,
                height: 1080,
                fill: color,
            },
            {
                type: 'text',
                left: 540,
                top: 400,
                text: title,
                fontSize: 80,
                fontFamily: 'Inter',
                fontWeight: 'bold',
                fill: '#FFFFFF',
                textAlign: 'center',
                originX: 'center',
                originY: 'center',
            },
            {
                type: 'text',
                left: 540,
                top: 540,
                text: discount,
                fontSize: 120,
                fontFamily: 'Inter',
                fontWeight: 'bold',
                fill: '#FFFFFF',
                textAlign: 'center',
                originX: 'center',
                originY: 'center',
            },
            {
                type: 'text',
                left: 540,
                top: 680,
                text: 'Shop Now',
                fontSize: 40,
                fontFamily: 'Inter',
                fontWeight: '600',
                fill: '#FFFFFF',
                textAlign: 'center',
                originX: 'center',
                originY: 'center',
            },
        ],
        background: color,
    };
}

/**
 * Generate product template
 */
function generateProductTemplate(title: string, color: string): any {
    return {
        version: '5.3.0',
        objects: [
            {
                type: 'rect',
                left: 0,
                top: 0,
                width: 1080,
                height: 1080,
                fill: '#FFFFFF',
            },
            {
                type: 'rect',
                left: 0,
                top: 0,
                width: 1080,
                height: 200,
                fill: color,
            },
            {
                type: 'text',
                left: 540,
                top: 100,
                text: title,
                fontSize: 60,
                fontFamily: 'Inter',
                fontWeight: 'bold',
                fill: '#FFFFFF',
                textAlign: 'center',
                originX: 'center',
                originY: 'center',
            },
            {
                type: 'rect',
                left: 240,
                top: 340,
                width: 600,
                height: 600,
                fill: '#F3F4F6',
                rx: 20,
                ry: 20,
            },
            {
                type: 'text',
                left: 540,
                top: 640,
                text: 'Product Image',
                fontSize: 30,
                fontFamily: 'Inter',
                fill: '#9CA3AF',
                textAlign: 'center',
                originX: 'center',
                originY: 'center',
            },
        ],
        background: '#FFFFFF',
    };
}

/**
 * Generate quote template
 */
function generateQuoteTemplate(quote: string, color: string): any {
    return {
        version: '5.3.0',
        objects: [
            {
                type: 'rect',
                left: 0,
                top: 0,
                width: 1080,
                height: 1080,
                fill: color,
            },
            {
                type: 'text',
                left: 540,
                top: 440,
                text: '"',
                fontSize: 200,
                fontFamily: 'Georgia',
                fill: 'rgba(255,255,255,0.3)',
                textAlign: 'center',
                originX: 'center',
                originY: 'center',
            },
            {
                type: 'text',
                left: 540,
                top: 540,
                text: quote,
                fontSize: 50,
                fontFamily: 'Georgia',
                fontStyle: 'italic',
                fill: '#FFFFFF',
                textAlign: 'center',
                originX: 'center',
                originY: 'center',
                width: 800,
            },
        ],
        background: color,
    };
}

/**
 * Generate event template
 */
function generateEventTemplate(eventName: string, dateTime: string, color: string): any {
    return {
        version: '5.3.0',
        objects: [
            {
                type: 'rect',
                left: 0,
                top: 0,
                width: 1200,
                height: 628,
                fill: color,
            },
            {
                type: 'text',
                left: 600,
                top: 250,
                text: eventName,
                fontSize: 80,
                fontFamily: 'Inter',
                fontWeight: 'bold',
                fill: '#FFFFFF',
                textAlign: 'center',
                originX: 'center',
                originY: 'center',
            },
            {
                type: 'text',
                left: 600,
                top: 370,
                text: dateTime,
                fontSize: 40,
                fontFamily: 'Inter',
                fill: '#FFFFFF',
                textAlign: 'center',
                originX: 'center',
                originY: 'center',
            },
        ],
        background: color,
    };
}

/**
 * Generate announcement template
 */
function generateAnnouncementTemplate(announcement: string, color: string): any {
    return {
        version: '5.3.0',
        objects: [
            {
                type: 'rect',
                left: 0,
                top: 0,
                width: 1080,
                height: 1080,
                fill: '#FFFFFF',
            },
            {
                type: 'rect',
                left: 90,
                top: 90,
                width: 900,
                height: 900,
                fill: color,
                rx: 30,
                ry: 30,
            },
            {
                type: 'text',
                left: 540,
                top: 540,
                text: announcement,
                fontSize: 90,
                fontFamily: 'Inter',
                fontWeight: 'bold',
                fill: '#FFFFFF',
                textAlign: 'center',
                originX: 'center',
                originY: 'center',
            },
        ],
        background: '#FFFFFF',
    };
}

/**
 * Search templates
 */
export function searchTemplates(
    templates: Template[],
    query: string,
    category?: string,
    format?: string
): Template[] {
    let filtered = [...templates];

    // Filter by category
    if (category) {
        filtered = filtered.filter(t => t.category === category);
    }

    // Filter by format
    if (format) {
        filtered = filtered.filter(t => t.format === format);
    }

    // Search by query
    if (query) {
        const lowerQuery = query.toLowerCase();
        filtered = filtered.filter(t =>
            t.name.toLowerCase().includes(lowerQuery) ||
            t.description.toLowerCase().includes(lowerQuery) ||
            t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }

    return filtered;
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
    templates: Template[],
    categoryId: string
): Template[] {
    return templates.filter(t => t.category === categoryId);
}

/**
 * Apply template to canvas
 */
export function applyTemplate(canvas: any, template: Template): void {
    canvas.loadFromJSON(template.content, () => {
        canvas.renderAll();
    });
}

/**
 * Create template from canvas
 */
export function createTemplateFromCanvas(
    canvas: any,
    name: string,
    description: string,
    category: string,
    tags: string[]
): Template {
    const content = canvas.toJSON(['name', 'selectable', 'evented']);
    const thumbnail = canvas.toDataURL({ format: 'png', quality: 0.8, multiplier: 0.3 });

    return {
        id: `custom-${Date.now()}`,
        name,
        description,
        category,
        format: `${canvas.width}x${canvas.height}`,
        thumbnail,
        content,
        tags,
        isPremium: false,
        createdAt: Date.now(),
    };
}
