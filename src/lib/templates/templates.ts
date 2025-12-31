export interface Template {
    id: string;
    name: string;
    description: string;
    category: 'social' | 'display' | 'print' | 'email';
    thumbnail: string;
    format: {
        width: number;
        height: number;
    };
    canvasJSON: any;
    tags: string[];
}

export const TEMPLATES: Template[] = [
    // Social Media Templates
    {
        id: 'coffee-ig-post',
        name: 'Coffee Shop Post',
        description: 'Perfect for cafes and coffee shops',
        category: 'social',
        thumbnail: '/templates/coffee-ig.png',
        format: { width: 1080, height: 1080 },
        tags: ['instagram', 'food', 'coffee', 'brown'],
        canvasJSON: {
            version: '5.3.0',
            objects: [
                {
                    type: 'rect',
                    fill: '#8B4513',
                    width: 1080,
                    height: 1080,
                    left: 0,
                    top: 0,
                },
                {
                    type: 'text',
                    text: 'FRESH COFFEE',
                    fontSize: 80,
                    fontFamily: 'Bebas Neue',
                    fill: '#FFFFFF',
                    top: 400,
                    left: 540,
                    originX: 'center',
                    originY: 'center',
                },
                {
                    type: 'text',
                    text: 'Daily',
                    fontSize: 48,
                    fontFamily: 'Dancing Script',
                    fill: '#FFD700',
                    top: 500,
                    left: 540,
                    originX: 'center',
                    originY: 'center',
                },
            ],
        },
    },
    {
        id: 'sale-ig-post',
        name: 'Sale Announcement',
        description: 'Eye-catching sale promotion',
        category: 'social',
        thumbnail: '/templates/sale-ig.png',
        format: { width: 1080, height: 1080 },
        tags: ['instagram', 'sale', 'promotion', 'red'],
        canvasJSON: {
            version: '5.3.0',
            objects: [
                {
                    type: 'rect',
                    fill: '#EE1C2E',
                    width: 1080,
                    height: 1080,
                    left: 0,
                    top: 0,
                },
                {
                    type: 'text',
                    text: '50% OFF',
                    fontSize: 120,
                    fontFamily: 'Bebas Neue',
                    fill: '#FFFFFF',
                    top: 400,
                    left: 540,
                    originX: 'center',
                    originY: 'center',
                },
                {
                    type: 'text',
                    text: 'Limited Time Only',
                    fontSize: 36,
                    fontFamily: 'Inter',
                    fill: '#FFFFFF',
                    top: 550,
                    left: 540,
                    originX: 'center',
                    originY: 'center',
                },
            ],
        },
    },
    {
        id: 'product-ig-post',
        name: 'Product Showcase',
        description: 'Clean product display template',
        category: 'social',
        thumbnail: '/templates/product-ig.png',
        format: { width: 1080, height: 1080 },
        tags: ['instagram', 'product', 'minimal', 'white'],
        canvasJSON: {
            version: '5.3.0',
            objects: [
                {
                    type: 'rect',
                    fill: '#FFFFFF',
                    width: 1080,
                    height: 1080,
                    left: 0,
                    top: 0,
                },
                {
                    type: 'rect',
                    fill: '#F3F4F6',
                    width: 900,
                    height: 600,
                    left: 90,
                    top: 150,
                },
                {
                    type: 'text',
                    text: 'NEW ARRIVAL',
                    fontSize: 64,
                    fontFamily: 'Montserrat',
                    fill: '#1F2937',
                    top: 850,
                    left: 540,
                    originX: 'center',
                    originY: 'center',
                },
            ],
        },
    },
    {
        id: 'quote-ig-post',
        name: 'Inspirational Quote',
        description: 'Share motivational quotes',
        category: 'social',
        thumbnail: '/templates/quote-ig.png',
        format: { width: 1080, height: 1080 },
        tags: ['instagram', 'quote', 'inspiration', 'gradient'],
        canvasJSON: {
            version: '5.3.0',
            objects: [
                {
                    type: 'rect',
                    fill: '#6366F1',
                    width: 1080,
                    height: 1080,
                    left: 0,
                    top: 0,
                },
                {
                    type: 'text',
                    text: '"Your Quote Here"',
                    fontSize: 56,
                    fontFamily: 'Playfair Display',
                    fill: '#FFFFFF',
                    top: 450,
                    left: 540,
                    originX: 'center',
                    originY: 'center',
                    textAlign: 'center',
                    width: 900,
                },
                {
                    type: 'text',
                    text: '— Author Name',
                    fontSize: 32,
                    fontFamily: 'Inter',
                    fill: '#E0E7FF',
                    top: 600,
                    left: 540,
                    originX: 'center',
                    originY: 'center',
                },
            ],
        },
    },
    // YouTube Template
    {
        id: 'youtube-thumbnail',
        name: 'YouTube Thumbnail',
        description: 'Attention-grabbing video thumbnail',
        category: 'social',
        thumbnail: '/templates/youtube.png',
        format: { width: 1280, height: 720 },
        tags: ['youtube', 'video', 'thumbnail', 'bold'],
        canvasJSON: {
            version: '5.3.0',
            objects: [
                {
                    type: 'rect',
                    fill: '#FF0000',
                    width: 1280,
                    height: 720,
                    left: 0,
                    top: 0,
                },
                {
                    type: 'text',
                    text: 'WATCH NOW',
                    fontSize: 100,
                    fontFamily: 'Bebas Neue',
                    fill: '#FFFFFF',
                    stroke: '#000000',
                    strokeWidth: 3,
                    top: 280,
                    left: 640,
                    originX: 'center',
                    originY: 'center',
                },
            ],
        },
    },
    // Display Ad Templates
    {
        id: 'banner-ad',
        name: 'Leaderboard Banner',
        description: 'Standard web banner ad',
        category: 'display',
        thumbnail: '/templates/banner.png',
        format: { width: 728, height: 90 },
        tags: ['banner', 'ad', 'web', 'horizontal'],
        canvasJSON: {
            version: '5.3.0',
            objects: [
                {
                    type: 'rect',
                    fill: '#3B82F6',
                    width: 728,
                    height: 90,
                    left: 0,
                    top: 0,
                },
                {
                    type: 'text',
                    text: 'Your Ad Here',
                    fontSize: 32,
                    fontFamily: 'Inter',
                    fill: '#FFFFFF',
                    top: 45,
                    left: 364,
                    originX: 'center',
                    originY: 'center',
                },
            ],
        },
    },
    // Print Templates
    {
        id: 'flyer-a4',
        name: 'Event Flyer',
        description: 'A4 event promotion flyer',
        category: 'print',
        thumbnail: '/templates/flyer.png',
        format: { width: 2480, height: 3508 },
        tags: ['flyer', 'print', 'event', 'a4'],
        canvasJSON: {
            version: '5.3.0',
            objects: [
                {
                    type: 'rect',
                    fill: '#FFFFFF',
                    width: 2480,
                    height: 3508,
                    left: 0,
                    top: 0,
                },
                {
                    type: 'rect',
                    fill: '#10B981',
                    width: 2480,
                    height: 800,
                    left: 0,
                    top: 0,
                },
                {
                    type: 'text',
                    text: 'EVENT NAME',
                    fontSize: 180,
                    fontFamily: 'Bebas Neue',
                    fill: '#FFFFFF',
                    top: 300,
                    left: 1240,
                    originX: 'center',
                    originY: 'center',
                },
                {
                    type: 'text',
                    text: 'Date & Location',
                    fontSize: 80,
                    fontFamily: 'Inter',
                    fill: '#1F2937',
                    top: 1500,
                    left: 1240,
                    originX: 'center',
                    originY: 'center',
                },
            ],
        },
    },
    {
        id: 'business-card',
        name: 'Business Card',
        description: 'Professional business card',
        category: 'print',
        thumbnail: '/templates/business-card.png',
        format: { width: 1050, height: 600 },
        tags: ['business', 'card', 'print', 'professional'],
        canvasJSON: {
            version: '5.3.0',
            objects: [
                {
                    type: 'rect',
                    fill: '#1F2937',
                    width: 1050,
                    height: 600,
                    left: 0,
                    top: 0,
                },
                {
                    type: 'text',
                    text: 'JOHN DOE',
                    fontSize: 64,
                    fontFamily: 'Montserrat',
                    fill: '#FFFFFF',
                    top: 200,
                    left: 80,
                },
                {
                    type: 'text',
                    text: 'CEO & Founder',
                    fontSize: 32,
                    fontFamily: 'Inter',
                    fill: '#9CA3AF',
                    top: 280,
                    left: 80,
                },
            ],
        },
    },
];

export const getTemplatesByCategory = (category: Template['category']) => {
    return TEMPLATES.filter(t => t.category === category);
};

export const getTemplateById = (id: string) => {
    return TEMPLATES.find(t => t.id === id);
};
