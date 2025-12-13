'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function Home() {
    const { isSignedIn } = useAuth();
    const router = useRouter();

    const handleGetStarted = () => {
        if (isSignedIn) {
            router.push('/app/dashboard');
        } else {
            router.push('/sign-up');
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
            <div className="container mx-auto px-4 py-16">
                {/* Hero Section */}
                <div className="text-center max-w-4xl mx-auto space-y-8">
                    <div className="inline-block px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-4">
                        🚀 AI-Powered Creative Automation
                    </div>

                    <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 leading-tight">
                        Democratizing Retail Media
                        <span className="block text-primary-600 mt-2">Creative Production</span>
                    </h1>

                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Generate professional, multi-format, fully compliant advertising creatives in minutes—not weeks.
                        Powered by AI, designed for small to mid-sized brands.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                        <button
                            onClick={handleGetStarted}
                            className="px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
                        >
                            {isSignedIn ? 'Go to Dashboard' : 'Start Creating Free'}
                        </button>
                        <button
                            onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
                            className="px-8 py-4 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                        >
                            Watch Demo
                        </button>
                    </div>

                    {/* Key Features */}
                    <div className="grid md:grid-cols-3 gap-8 pt-16">
                        <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                            <div className="text-4xl mb-4">🎨</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">AI-Powered Generation</h3>
                            <p className="text-gray-600">
                                Automatically generate 3-5 creative variations with AI-driven layouts and copywriting
                            </p>
                        </div>

                        <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                            <div className="text-4xl mb-4">✅</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Compliance Copilot</h3>
                            <p className="text-gray-600">
                                Real-time validation ensures 99%+ compliance with retailer guidelines
                            </p>
                        </div>

                        <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                            <div className="text-4xl mb-4">📤</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Multi-Format Export</h3>
                            <p className="text-gray-600">
                                One-click export to all platforms: Facebook, Instagram, LinkedIn, and more
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 pt-16 max-w-3xl mx-auto">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary-600">5 min</div>
                            <div className="text-sm text-gray-600 mt-1">vs. 2-4 weeks</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary-600">70%</div>
                            <div className="text-sm text-gray-600 mt-1">cost reduction</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary-600">99%</div>
                            <div className="text-sm text-gray-600 mt-1">compliance rate</div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
