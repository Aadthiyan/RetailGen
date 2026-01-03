/**
 * Tags and Categories System
 * Organize creatives with tags and categories
 */

export interface Tag {
    id: string;
    name: string;
    color: string;
    createdAt: number;
}

export interface Category {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    color: string;
    createdAt: number;
}

export const DEFAULT_CATEGORIES: Category[] = [
    {
        id: 'social-media',
        name: 'Social Media',
        description: 'Facebook, Instagram, Twitter posts',
        icon: '📱',
        color: '#3b82f6',
        createdAt: Date.now(),
    },
    {
        id: 'email',
        name: 'Email Marketing',
        description: 'Email headers, banners',
        icon: '📧',
        color: '#8b5cf6',
        createdAt: Date.now(),
    },
    {
        id: 'display-ads',
        name: 'Display Ads',
        description: 'Banner ads, display campaigns',
        icon: '🎯',
        color: '#ec4899',
        createdAt: Date.now(),
    },
    {
        id: 'print',
        name: 'Print',
        description: 'Flyers, posters, brochures',
        icon: '🖨️',
        color: '#10b981',
        createdAt: Date.now(),
    },
    {
        id: 'video',
        name: 'Video Thumbnails',
        description: 'YouTube, TikTok thumbnails',
        icon: '🎬',
        color: '#f59e0b',
        createdAt: Date.now(),
    },
    {
        id: 'ecommerce',
        name: 'E-commerce',
        description: 'Product images, listings',
        icon: '🛒',
        color: '#06b6d4',
        createdAt: Date.now(),
    },
];

export const TAG_COLORS = [
    '#ef4444', // red
    '#f59e0b', // orange
    '#10b981', // green
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#84cc16', // lime
];

/**
 * Generate a unique tag ID
 */
export function generateTagId(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Get random tag color
 */
export function getRandomTagColor(): string {
    return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
}

/**
 * Parse tags from string (comma-separated)
 */
export function parseTagsFromString(tagsString: string): string[] {
    return tagsString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
}

/**
 * Format tags to string
 */
export function formatTagsToString(tags: string[]): string {
    return tags.join(', ');
}

/**
 * Get popular tags (mock - in production, query from database)
 */
export function getPopularTags(): Tag[] {
    return [
        { id: 'sale', name: 'Sale', color: '#ef4444', createdAt: Date.now() },
        { id: 'new-product', name: 'New Product', color: '#10b981', createdAt: Date.now() },
        { id: 'seasonal', name: 'Seasonal', color: '#f59e0b', createdAt: Date.now() },
        { id: 'promotion', name: 'Promotion', color: '#ec4899', createdAt: Date.now() },
        { id: 'brand', name: 'Brand', color: '#3b82f6', createdAt: Date.now() },
        { id: 'campaign', name: 'Campaign', color: '#8b5cf6', createdAt: Date.now() },
        { id: 'holiday', name: 'Holiday', color: '#06b6d4', createdAt: Date.now() },
        { id: 'clearance', name: 'Clearance', color: '#84cc16', createdAt: Date.now() },
    ];
}

/**
 * Search tags
 */
export function searchTags(query: string, allTags: Tag[]): Tag[] {
    const lowerQuery = query.toLowerCase();
    return allTags.filter(tag =>
        tag.name.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Get category by ID
 */
export function getCategoryById(id: string): Category | undefined {
    return DEFAULT_CATEGORIES.find(cat => cat.id === id);
}

/**
 * Get category color
 */
export function getCategoryColor(categoryId: string): string {
    const category = getCategoryById(categoryId);
    return category?.color || '#6b7280';
}
