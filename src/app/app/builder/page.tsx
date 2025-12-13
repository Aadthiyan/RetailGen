'use client';

import dynamic from 'next/dynamic';

const CanvasEditor = dynamic(
    () => import('@/features/builder/components/CanvasEditor').then(mod => mod.CanvasEditor),
    {
        ssr: false,
        loading: () => (
            <div className="flex-1 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        )
    }
);
import { Toolbar } from '@/features/builder/components/Toolbar';
import { LayerList } from '@/features/builder/components/LayerList';
import { PropertiesPanel } from '@/features/builder/components/PropertiesPanel';
import { FormatSelector } from '@/features/builder/components/FormatSelector';
import { GenerationPanel } from '@/features/builder/components/GenerationPanel';
import { CopyGenerationPanel } from '@/features/builder/components/CopyGenerationPanel';
import { RecommendationsPanel } from '@/features/builder/components/RecommendationsPanel';
import { CompliancePanel } from '@/features/builder/components/CompliancePanel';
import { ExportPanel } from '@/features/builder/components/ExportPanel';
import { useSearchParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useEffect, useState } from 'react';
import { useBuilderStore } from '@/features/builder/store/builderStore';
import { useAutoSave } from '@/features/builder/hooks/useAutoSave';
import { Id } from '../../../../convex/_generated/dataModel';
import { PreviewModal } from '@/features/builder/components/PreviewModal';
import { Loader2, CheckCircle, AlertCircle, Eye, Sparkles, Image as ImageIcon, Type, Lightbulb, ShieldCheck, Share2 } from 'lucide-react';

export default function BuilderPage() {
    const searchParams = useSearchParams();
    const creativeId = searchParams.get('id');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [showAIPanel, setShowAIPanel] = useState(false);
    const [showCompliancePanel, setShowCompliancePanel] = useState(false);
    const [showExportPanel, setShowExportPanel] = useState(false);
    const [activeAIPanel, setActiveAIPanel] = useState<'layout' | 'copy' | 'recommendations'>('layout');

    const creative = useQuery(api.creatives.get, creativeId ? { id: creativeId as Id<"creatives"> } : "skip");

    const { setCreativeId, loadFromJSON, saveStatus, setFormat } = useBuilderStore();

    // Initialize Store
    useEffect(() => {
        if (creative) {
            setCreativeId(creative._id);
            if (creative.content && Object.keys(creative.content).length > 0) {
                loadFromJSON(creative.content);
            }
            if (creative.format) {
                setFormat(creative.format);
            }
        }
    }, [creative, setCreativeId, loadFromJSON, setFormat]);

    // Enable Autosave
    useAutoSave();

    const toggleAIPanel = () => {
        setShowAIPanel(!showAIPanel);
        if (showCompliancePanel) setShowCompliancePanel(false);
        if (showExportPanel) setShowExportPanel(false);
    };

    const toggleCompliancePanel = () => {
        setShowCompliancePanel(!showCompliancePanel);
        if (showAIPanel) setShowAIPanel(false);
        if (showExportPanel) setShowExportPanel(false);
    };

    const toggleExportPanel = () => {
        setShowExportPanel(!showExportPanel);
        if (showAIPanel) setShowAIPanel(false);
        if (showCompliancePanel) setShowCompliancePanel(false);
    };

    if (creativeId && creative === undefined) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden">
            {/* Left Toolbar */}
            <Toolbar />

            {/* Main Canvas Area */}
            <div className="flex-1 relative flex flex-col">
                {/* Top Bar */}
                <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4 justify-between">
                    <div className="flex items-center gap-4">
                        <div className="text-sm font-medium text-gray-900">
                            {creative?.name || 'Untitled Creative'}
                        </div>
                        {/* Save Status Indicator */}
                        <div className="flex items-center gap-1.5 text-xs">
                            {saveStatus === 'saved' && (
                                <span className="text-green-600 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Saved
                                </span>
                            )}
                            {saveStatus === 'saving' && (
                                <span className="text-gray-500 flex items-center gap-1">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                                </span>
                            )}
                            {saveStatus === 'unsaved' && (
                                <span className="text-gray-400">Unsaved changes</span>
                            )}
                            {saveStatus === 'error' && (
                                <span className="text-error-600 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Save Failed
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleExportPanel}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${showExportPanel
                                ? 'bg-purple-100 text-purple-700'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <Share2 className="w-4 h-4" />
                            Export
                        </button>
                        <button
                            onClick={toggleCompliancePanel}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${showCompliancePanel
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <ShieldCheck className="w-4 h-4" />
                            Compliance
                        </button>
                        <button
                            onClick={toggleAIPanel}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${showAIPanel
                                ? 'bg-primary-100 text-primary-700'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <Sparkles className="w-4 h-4" />
                            AI Tools
                        </button>
                        <button
                            onClick={() => setIsPreviewOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            <Eye className="w-4 h-4" />
                            Preview
                        </button>
                        <div className="w-px h-6 bg-gray-200 mx-1" />
                        <FormatSelector />
                    </div>
                </div>

                {/* Canvas */}
                <CanvasEditor className="flex-1" />

                {/* Preview Modal */}
                <PreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} />
            </div>

            {/* Right Sidebar - Conditional based on panel state */}
            {showAIPanel ? (
                <div className="flex flex-col border-l border-gray-200 bg-white w-80">
                    {/* AI Panel Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveAIPanel('layout')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors ${activeAIPanel === 'layout'
                                ? 'text-primary-600 border-b-2 border-primary-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <ImageIcon className="w-4 h-4" />
                            Layouts
                        </button>
                        <button
                            onClick={() => setActiveAIPanel('copy')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors ${activeAIPanel === 'copy'
                                ? 'text-primary-600 border-b-2 border-primary-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Type className="w-4 h-4" />
                            Copy
                        </button>
                        <button
                            onClick={() => setActiveAIPanel('recommendations')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors ${activeAIPanel === 'recommendations'
                                ? 'text-primary-600 border-b-2 border-primary-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Lightbulb className="w-4 h-4" />
                            Tips
                        </button>
                    </div>

                    {/* Panel Content */}
                    {activeAIPanel === 'layout' && <GenerationPanel creativeId={creativeId || undefined} />}
                    {activeAIPanel === 'copy' && <CopyGenerationPanel />}
                    {activeAIPanel === 'recommendations' && <RecommendationsPanel />}
                </div>
            ) : showCompliancePanel ? (
                <CompliancePanel />
            ) : showExportPanel ? (
                <ExportPanel />
            ) : (
                <div className="flex flex-col border-l border-gray-200 bg-white">
                    <PropertiesPanel />
                    <div className="h-px bg-gray-200 my-2" />
                    <LayerList />
                </div>
            )}
        </div>
    );
}
