export interface AdFormat {
    id: string;
    name: string;
    width: number;
    height: number;
    platform: 'facebook' | 'instagram' | 'linkedin' | 'google' | 'custom';
    safeZone?: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
}

export const AD_FORMATS: AdFormat[] = [
    {
        id: 'fb-feed',
        name: 'Facebook Feed',
        width: 1080,
        height: 1080,
        platform: 'facebook',
    },
    {
        id: 'ig-story',
        name: 'Instagram Story',
        width: 1080,
        height: 1920,
        platform: 'instagram',
        safeZone: {
            top: 250,    // Avoid profile icon/status bar
            bottom: 250, // Avoid swipe up/reply
            left: 0,
            right: 0,
        },
    },
    {
        id: 'ig-feed',
        name: 'Instagram Feed (Portrait)',
        width: 1080,
        height: 1350,
        platform: 'instagram',
    },
    {
        id: 'linkedin-feed',
        name: 'LinkedIn Feed',
        width: 1200,
        height: 628,
        platform: 'linkedin',
    },
    {
        id: 'google-mrec',
        name: 'Medium Rectangle',
        width: 300,
        height: 250,
        platform: 'google',
    },
    {
        id: 'google-leaderboard',
        name: 'Leaderboard',
        width: 728,
        height: 90,
        platform: 'google',
    },
    {
        id: 'google-skyscraper',
        name: 'Wide Skyscraper',
        width: 160,
        height: 600,
        platform: 'google',
    },
];

export const getFormatById = (id: string): AdFormat | undefined => {
    return AD_FORMATS.find(f => f.id === id);
};
