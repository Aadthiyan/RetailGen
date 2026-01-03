/**
 * Collections System
 * Group creatives into collections/folders
 */

export interface Collection {
    id: string;
    name: string;
    description?: string;
    color: string;
    icon?: string;
    creativeIds: string[];
    createdAt: number;
    updatedAt: number;
}

export const COLLECTION_COLORS = [
    '#ef4444', // red
    '#f59e0b', // orange
    '#10b981', // green
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#6b7280', // gray
];

export const COLLECTION_ICONS = [
    '📁', '🗂️', '📂', '🎨', '🎯', '⭐', '🚀', '💼',
    '📊', '🎬', '🛒', '📱', '💡', '🔥', '✨', '🎉',
];

/**
 * Create a new collection
 */
export function createCollection(
    name: string,
    description?: string,
    color?: string,
    icon?: string
): Collection {
    return {
        id: generateCollectionId(),
        name,
        description,
        color: color || getRandomCollectionColor(),
        icon: icon || getRandomCollectionIcon(),
        creativeIds: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
}

/**
 * Add creative to collection
 */
export function addToCollection(
    collection: Collection,
    creativeId: string
): Collection {
    if (collection.creativeIds.includes(creativeId)) {
        return collection;
    }

    return {
        ...collection,
        creativeIds: [...collection.creativeIds, creativeId],
        updatedAt: Date.now(),
    };
}

/**
 * Remove creative from collection
 */
export function removeFromCollection(
    collection: Collection,
    creativeId: string
): Collection {
    return {
        ...collection,
        creativeIds: collection.creativeIds.filter(id => id !== creativeId),
        updatedAt: Date.now(),
    };
}

/**
 * Update collection
 */
export function updateCollection(
    collection: Collection,
    updates: Partial<Omit<Collection, 'id' | 'createdAt'>>
): Collection {
    return {
        ...collection,
        ...updates,
        updatedAt: Date.now(),
    };
}

/**
 * Generate collection ID
 */
function generateCollectionId(): string {
    return `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get random collection color
 */
export function getRandomCollectionColor(): string {
    return COLLECTION_COLORS[Math.floor(Math.random() * COLLECTION_COLORS.length)];
}

/**
 * Get random collection icon
 */
export function getRandomCollectionIcon(): string {
    return COLLECTION_ICONS[Math.floor(Math.random() * COLLECTION_ICONS.length)];
}

/**
 * Get default collections
 */
export function getDefaultCollections(): Collection[] {
    return [
        {
            id: 'all',
            name: 'All Creatives',
            description: 'All your creatives',
            color: '#6b7280',
            icon: '📁',
            creativeIds: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        },
        {
            id: 'recent',
            name: 'Recent',
            description: 'Recently created',
            color: '#3b82f6',
            icon: '🕐',
            creativeIds: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        },
        {
            id: 'favorites',
            name: 'Favorites',
            description: 'Your starred creatives',
            color: '#f59e0b',
            icon: '⭐',
            creativeIds: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        },
    ];
}

/**
 * Sort collections
 */
export function sortCollections(
    collections: Collection[],
    sortBy: 'name' | 'date' | 'count' = 'name'
): Collection[] {
    return [...collections].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'date':
                return b.updatedAt - a.updatedAt;
            case 'count':
                return b.creativeIds.length - a.creativeIds.length;
            default:
                return 0;
        }
    });
}

/**
 * Search collections
 */
export function searchCollections(
    collections: Collection[],
    query: string
): Collection[] {
    const lowerQuery = query.toLowerCase();
    return collections.filter(collection =>
        collection.name.toLowerCase().includes(lowerQuery) ||
        collection.description?.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Get collection stats
 */
export function getCollectionStats(collection: Collection) {
    return {
        totalCreatives: collection.creativeIds.length,
        isEmpty: collection.creativeIds.length === 0,
    };
}

/**
 * Duplicate collection
 */
export function duplicateCollection(collection: Collection): Collection {
    return {
        ...collection,
        id: generateCollectionId(),
        name: `${collection.name} (Copy)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
}

/**
 * Merge collections
 */
export function mergeCollections(
    collection1: Collection,
    collection2: Collection,
    newName?: string
): Collection {
    const uniqueCreativeIds = Array.from(
        new Set([...collection1.creativeIds, ...collection2.creativeIds])
    );

    return {
        id: generateCollectionId(),
        name: newName || `${collection1.name} + ${collection2.name}`,
        description: `Merged from ${collection1.name} and ${collection2.name}`,
        color: collection1.color,
        icon: collection1.icon,
        creativeIds: uniqueCreativeIds,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
}
