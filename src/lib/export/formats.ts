export interface ExportFormat {
    id: string;
    name: string;
    platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'display' | 'print';
    width: number;
    height: number;
    safeZone: number; // percentage (e.g., 0.1 for 10%)
    maxFileSize?: number; // in bytes
}

export const SOCIAL_FORMATS: ExportFormat[] = [
    {
        id: 'fb-feed',
        name: 'Facebook Feed',
        platform: 'facebook',
        width: 1080,
        height: 1080,
        safeZone: 0.05,
        maxFileSize: 30 * 1024 * 1024,
    },
    {
        id: 'fb-story',
        name: 'Facebook Story',
        platform: 'facebook',
        width: 1080,
        height: 1920,
        safeZone: 0.15, // Larger safe zone for UI elements
    },
    {
        id: 'ig-post',
        name: 'Instagram Post',
        platform: 'instagram',
        width: 1080,
        height: 1080,
        safeZone: 0.05,
    },
    {
        id: 'ig-story',
        name: 'Instagram Story',
        platform: 'instagram',
        width: 1080,
        height: 1920,
        safeZone: 0.15,
    },
    {
        id: 'li-post',
        name: 'LinkedIn Post',
        platform: 'linkedin',
        width: 1200,
        height: 627,
        safeZone: 0.05,
    },
    {
        id: 'tw-post',
        name: 'Twitter Post',
        platform: 'twitter',
        width: 1600,
        height: 900,
        safeZone: 0.05,
    },
];

export const DISPLAY_FORMATS: ExportFormat[] = [
    {
        id: 'mrec',
        name: 'Medium Rectangle',
        platform: 'display',
        width: 300,
        height: 250,
        safeZone: 0,
    },
    {
        id: 'leaderboard',
        name: 'Leaderboard',
        platform: 'display',
        width: 728,
        height: 90,
        safeZone: 0,
    },
    {
        id: 'skyscraper',
        name: 'Skyscraper',
        platform: 'display',
        width: 160,
        height: 600,
        safeZone: 0,
    },
];
