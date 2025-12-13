import { NextResponse } from 'next/server';

export async function GET() {
    const services = {
        openai: !!process.env.OPENAI_API_KEY,
        replicate: !!process.env.REPLICATE_API_TOKEN,
        googleVision: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
        removeBg: !!process.env.REMOVE_BG_API_KEY,
        cloudinary: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        convex: !!process.env.NEXT_PUBLIC_CONVEX_URL,
        clerk: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    };

    const allConfigured = Object.values(services).every(Boolean);

    return NextResponse.json({
        status: allConfigured ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        services,
        version: '1.0.0',
    }, {
        status: allConfigured ? 200 : 503
    });
}
