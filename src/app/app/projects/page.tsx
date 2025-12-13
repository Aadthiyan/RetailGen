'use client';

import { useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Plus, FolderOpen, Trash2, Share2, MoreVertical } from 'lucide-react';

interface Project {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    itemCount: number;
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([
        {
            id: '1',
            name: 'Summer 2025 Campaign',
            description: 'Retail media assets for summer collection launch',
            createdAt: '2025-12-01',
            updatedAt: '2025-12-08',
            itemCount: 12
        },
        {
            id: '2',
            name: 'Holiday Promotions',
            description: 'Multi-format holiday season creatives',
            createdAt: '2025-11-15',
            updatedAt: '2025-12-05',
            itemCount: 24
        }
    ]);

    const handleDeleteProject = (id: string) => {
        if (confirm('Are you sure you want to delete this project?')) {
            setProjects(projects.filter(p => p.id !== id));
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

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
                            <Link href="/app/projects" className="text-primary-600 hover:text-primary-700 font-medium border-b-2 border-primary-600 pb-1">
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
                {/* Page Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Projects</h2>
                        <p className="text-gray-600 mt-2">Manage your creative projects and campaigns</p>
                    </div>
                    <Link
                        href="/app/builder"
                        className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        New Project
                    </Link>
                </div>

                {/* Projects Grid */}
                {projects.length === 0 ? (
                    <div className="text-center py-16">
                        <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No projects yet</h3>
                        <p className="text-gray-600 mb-6">Create your first project to get started with RetailGen AI</p>
                        <Link
                            href="/app/builder"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Create First Project
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden group"
                            >
                                {/* Card Content */}
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                                                {project.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {project.itemCount} item{project.itemCount !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <div className="relative group/menu">
                                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                                <MoreVertical className="w-4 h-4 text-gray-600" />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {project.description}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                        <span>Created {formatDate(project.createdAt)}</span>
                                        <span>Updated {formatDate(project.updatedAt)}</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/app/builder?project=${project.id}`}
                                            className="flex-1 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium text-center"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Share"
                                        >
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProject(project.id)}
                                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
