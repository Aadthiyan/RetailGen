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
        id: 'ig-reel',
        name: 'Instagram Reel',
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
    {
        id: 'yt-thumbnail',
        name: 'YouTube Thumbnail',
        platform: 'youtube' as any,
        width: 1280,
        height: 720,
        safeZone: 0.05,
        maxFileSize: 2 * 1024 * 1024, // 2MB max
    },
    {
        id: 'pinterest-pin',
        name: 'Pinterest Pin',
        platform: 'pinterest' as any,
        width: 1000,
        height: 1500,
        safeZone: 0.05,
    },
    {
        id: 'tiktok-video',
        name: 'TikTok Cover',
        platform: 'tiktok' as any,
        width: 1080,
        height: 1920,
        safeZone: 0.15,
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
    {
        id: 'large-rectangle',
        name: 'Large Rectangle',
        platform: 'display',
        width: 336,
        height: 280,
        safeZone: 0,
    },
    {
        id: 'mobile-banner',
        name: 'Mobile Banner',
        platform: 'display',
        width: 320,
        height: 50,
        safeZone: 0,
    },
    {
        id: 'half-page',
        name: 'Half Page',
        platform: 'display',
        width: 300,
        height: 600,
        safeZone: 0,
    },
];

export const PRINT_FORMATS: ExportFormat[] = [
    {
        id: 'a4-print',
        name: 'A4 Print (300 DPI)',
        platform: 'print',
        width: 2480,
        height: 3508,
        safeZone: 0.05,
    },
    {
        id: 'letter-print',
        name: 'Letter Print (300 DPI)',
        platform: 'print',
        width: 2550,
        height: 3300,
        safeZone: 0.05,
    },
    {
        id: 'poster-small',
        name: 'Poster 18×24" (300 DPI)',
        platform: 'print',
        width: 5400,
        height: 7200,
        safeZone: 0.05,
    },
    {
        id: 'flyer',
        name: 'Flyer 8.5×11" (300 DPI)',
        platform: 'print',
        width: 2550,
        height: 3300,
        safeZone: 0.05,
    },
    {
        id: 'business-card',
        name: 'Business Card (300 DPI)',
        platform: 'print',
        width: 1050,
        height: 600,
        safeZone: 0.1,
    },
];

