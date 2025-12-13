'use client';

import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <h1 className="text-2xl font-bold text-primary-600">RetailGen AI</h1>
                        <nav className="hidden md:flex gap-6">
                            <Link href="/app/dashboard" className="text-gray-700 hover:text-primary-600 font-medium">
                                Dashboard
                            </Link>
                            <Link href="/app/projects" className="text-gray-700 hover:text-primary-600 font-medium">
                                Projects
                            </Link>
                            <Link href="/app/assets" className="text-gray-700 hover:text-primary-600 font-medium">
                                Assets
                            </Link>
                        </nav>
                    </div>
                    <UserButton afterSignOutUrl="/" />
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to RetailGen AI! 🎉</h2>
                    <p className="text-gray-600">Start creating amazing retail marketing creatives.</p>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Link
                        href="/app/builder"
                        className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-500"
                    >
                        <div className="text-4xl mb-4">🎨</div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Create New Creative</h3>
                        <p className="text-gray-600 text-sm">
                            Start designing with our AI-powered creative builder
                        </p>
                    </Link>

                    <Link
                        href="/app/assets"
                        className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-500"
                    >
                        <div className="text-4xl mb-4">📁</div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Upload Assets</h3>
                        <p className="text-gray-600 text-sm">
                            Manage your brand assets and product images
                        </p>
                    </Link>

                    <Link
                        href="/app/projects"
                        className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-500"
                    >
                        <div className="text-4xl mb-4">📊</div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">View Projects</h3>
                        <p className="text-gray-600 text-sm">
                            Access your saved projects and creatives
                        </p>
                    </Link>
                </div>

                {/* Getting Started */}
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                                1
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Upload Your Brand Assets</h4>
                                <p className="text-gray-600 text-sm">Add your logos, product images, and brand guidelines</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                                2
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Create Your First Creative</h4>
                                <p className="text-gray-600 text-sm">Use our AI-powered builder to design professional ads</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                                3
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Run Compliance Check</h4>
                                <p className="text-gray-600 text-sm">Ensure your creative meets all retailer guidelines</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                                4
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Export to All Platforms</h4>
                                <p className="text-gray-600 text-sm">Download optimized versions for every social platform</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
