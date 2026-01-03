/**
 * Search and Filter Engine
 * Advanced search and filtering for creatives
 */

export interface SearchFilters {
    query?: string;
    tags?: string[];
    category?: string;
    format?: string;
    dateRange?: {
        start: number;
        end: number;
    };
    isFavorite?: boolean;
    sortBy?: 'name' | 'date' | 'modified';
    sortOrder?: 'asc' | 'desc';
}

export interface SearchResult<T> {
    items: T[];
    total: number;
    hasMore: boolean;
}

/**
 * Search and filter creatives
 */
export function searchAndFilter<T extends Record<string, any>>(
    items: T[],
    filters: SearchFilters
): SearchResult<T> {
    let filtered = [...items];

    // Text search
    if (filters.query && filters.query.trim()) {
        const query = filters.query.toLowerCase();
        filtered = filtered.filter(item => {
            const searchableText = [
                item.name,
                item.description,
                ...(item.tags || []),
            ].join(' ').toLowerCase();

            return searchableText.includes(query);
        });
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter(item => {
            if (!item.tags || item.tags.length === 0) return false;
            return filters.tags!.some(tag => item.tags.includes(tag));
        });
    }

    // Filter by category
    if (filters.category) {
        filtered = filtered.filter(item => item.category === filters.category);
    }

    // Filter by format
    if (filters.format) {
        filtered = filtered.filter(item => item.format === filters.format);
    }

    // Filter by date range
    if (filters.dateRange) {
        filtered = filtered.filter(item => {
            const itemDate = item._creationTime || item.createdAt || 0;
            return itemDate >= filters.dateRange!.start && itemDate <= filters.dateRange!.end;
        });
    }

    // Filter by favorite
    if (filters.isFavorite !== undefined) {
        filtered = filtered.filter(item => item.isFavorite === filters.isFavorite);
    }

    // Sort
    if (filters.sortBy) {
        filtered.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (filters.sortBy) {
                case 'name':
                    aValue = a.name || '';
                    bValue = b.name || '';
                    break;
                case 'date':
                    aValue = a._creationTime || a.createdAt || 0;
                    bValue = b._creationTime || b.createdAt || 0;
                    break;
                case 'modified':
                    aValue = a.updatedAt || a._creationTime || 0;
                    bValue = b.updatedAt || b._creationTime || 0;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }

    return {
        items: filtered,
        total: filtered.length,
        hasMore: false,
    };
}

/**
 * Get quick filter presets
 */
export function getQuickFilters() {
    return [
        {
            id: 'recent',
            label: 'Recent',
            icon: '🕐',
            filters: {
                sortBy: 'date' as const,
                sortOrder: 'desc' as const,
            },
        },
        {
            id: 'favorites',
            label: 'Favorites',
            icon: '⭐',
            filters: {
                isFavorite: true,
            },
        },
        {
            id: 'this-week',
            label: 'This Week',
            icon: '📅',
            filters: {
                dateRange: {
                    start: Date.now() - 7 * 24 * 60 * 60 * 1000,
                    end: Date.now(),
                },
            },
        },
        {
            id: 'this-month',
            label: 'This Month',
            icon: '📆',
            filters: {
                dateRange: {
                    start: Date.now() - 30 * 24 * 60 * 60 * 1000,
                    end: Date.now(),
                },
            },
        },
    ];
}

/**
 * Build search query string for display
 */
export function buildSearchQueryString(filters: SearchFilters): string {
    const parts: string[] = [];

    if (filters.query) {
        parts.push(`"${filters.query}"`);
    }

    if (filters.tags && filters.tags.length > 0) {
        parts.push(`tags: ${filters.tags.join(', ')}`);
    }

    if (filters.category) {
        parts.push(`category: ${filters.category}`);
    }

    if (filters.format) {
        parts.push(`format: ${filters.format}`);
    }

    if (filters.isFavorite) {
        parts.push('favorites only');
    }

    return parts.join(' • ') || 'All creatives';
}

/**
 * Get available formats
 */
export function getAvailableFormats() {
    return [
        { value: '1080x1080', label: 'Instagram Square (1080x1080)' },
        { value: '1080x1920', label: 'Instagram Story (1080x1920)' },
        { value: '1200x628', label: 'Facebook Post (1200x628)' },
        { value: '1200x1200', label: 'Facebook Square (1200x1200)' },
        { value: '1080x566', label: 'LinkedIn Post (1080x566)' },
        { value: '728x90', label: 'Banner Ad (728x90)' },
        { value: '300x250', label: 'Medium Rectangle (300x250)' },
        { value: '160x600', label: 'Wide Skyscraper (160x600)' },
    ];
}

/**
 * Highlight search terms in text
 */
export function highlightSearchTerms(text: string, query: string): string {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}
