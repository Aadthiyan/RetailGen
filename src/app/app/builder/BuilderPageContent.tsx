'use client';

import dynamic from 'next/dynamic';
import { Suspense, useRef } from 'react';

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

const Toolbar = dynamic(
    () => import('@/features/builder/components/Toolbar').then(mod => ({ default: mod.Toolbar })),
    {
        ssr: false,
        loading: () => (
            <div className="w-16 bg-white border-r border-gray-200">
                <div className="p-2">
                    <div className="animate-pulse bg-gray-200 h-12 w-12 rounded-lg"></div>
                </div>
            </div>
        )
    }
);
import { LayerList } from '@/features/builder/components/LayerList';
import { PropertiesPanel } from '@/features/builder/components/PropertiesPanel';
import { FormatSelector } from '@/features/builder/components/FormatSelector';
import { GenerationPanel } from '@/features/builder/components/GenerationPanel';
import { CopyGenerationPanel } from '@/features/builder/components/CopyGenerationPanel';
import { RecommendationsPanel } from '@/features/builder/components/RecommendationsPanel';
import { CompliancePanel } from '@/features/builder/components/CompliancePanel';
import { ExportPanel } from '@/features/builder/components/ExportPanel';
import { TemplateGallery } from '@/features/builder/components/TemplateGallery';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useEffect, useState } from 'react';
import { useBuilderStore } from '@/features/builder/store/builderStore';
import { useAutoSave } from '@/features/builder/hooks/useAutoSave';
import { useKeyboardShortcuts } from '@/features/builder/hooks/useKeyboardShortcuts';
import { Id } from '../../../../convex/_generated/dataModel';
import { PreviewModal } from '@/features/builder/components/PreviewModal';
import { Loader2, CheckCircle, AlertCircle, Eye, Sparkles, Image as ImageIcon, Type, Lightbulb, ShieldCheck, Share2 } from 'lucide-react';

function BuilderPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const creativeIdParam = searchParams.get('id');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [showAIPanel, setShowAIPanel] = useState(false);
    const [showCompliancePanel, setShowCompliancePanel] = useState(false);
    const [showExportPanel, setShowExportPanel] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [activeAIPanel, setActiveAIPanel] = useState<'layout' | 'copy' | 'recommendations'>('layout');

    const creative = useQuery(api.creatives.get, creativeIdParam ? { id: creativeIdParam as Id<"creatives"> } : "skip");
    const createCreative = useMutation(api.creatives.create);
    const updateCreative = useMutation(api.creatives.update);

    const { canvas, creativeId, setCreativeId, loadFromJSON, saveStatus, setFormat, currentFormat } = useBuilderStore();

    // Ref to track if we've loaded this creative already
    const loadedCreativeIdRef = useRef<string | null>(null);

    // Initialize Store - only load ONCE per creative ID
    useEffect(() => {
        if (creative && creative._id !== loadedCreativeIdRef.current) {
            setCreativeId(creative._id);
            if (creative.content && Object.keys(creative.content).length > 0) {
                loadFromJSON(creative.content);
            }
            if (creative.format) {
                setFormat(creative.format);
            }
            loadedCreativeIdRef.current = creative._id; // Mark as loaded
        }
    }, [creative?._id, setCreativeId, loadFromJSON, setFormat]);

    // Auto-create creative when user starts working without one
    useEffect(() => {
        if (!canvas || creativeId || creativeIdParam) return;

        let hasCreated = false;

        const handleFirstEdit = async () => {
            if (hasCreated) return;
            hasCreated = true;

            try {
                console.log('🎨 Auto-creating creative for unsaved work...');

                const newCreative = await createCreative({
                    name: `Untitled ${new Date().toLocaleDateString()}`,
                    format: currentFormat.id,
                    dimensions: {
                        width: currentFormat.width,
                        height: currentFormat.height,
                    },
                    content: canvas.toJSON(['name', 'selectable', 'evented']),
                });

                setCreativeId(newCreative);

                // Update URL with new creative ID
                const newUrl = `/app/builder?id=${newCreative}`;
                window.history.replaceState({}, '', newUrl);

                console.log('✅ Creative auto-created:', newCreative);
            } catch (error) {
                console.error('Failed to auto-create creative:', error);
                hasCreated = false; // Allow retry
            }
        };

        // Listen for first edit
        canvas.on('object:added', handleFirstEdit);
        canvas.on('object:modified', handleFirstEdit);

        return () => {
            canvas.off('object:added', handleFirstEdit);
            canvas.off('object:modified', handleFirstEdit);
        };
    }, [canvas, creativeId, creativeIdParam, createCreative, setCreativeId, currentFormat]);

    // Enable Autosave
    useAutoSave();

    // Enable Keyboard Shortcuts
    useKeyboardShortcuts();

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

    const [creativeName, setCreativeName] = useState(creative?.name || 'Untitled');

    // Update local state when creative loads
    useEffect(() => {
        if (creative?.name) {
            setCreativeName(creative.name);
        }
    }, [creative?.name]);

    // Debounced save
    const handleNameChange = (newName: string) => {
        setCreativeName(newName);

        // Debounce the save
        if (creativeId && updateCreative) {
            setTimeout(() => {
                updateCreative({
                    id: creativeId as any,
                    name: newName,
                });
            }, 500);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Title Bar */}
            <div className="flex items-center justify-between h-12 px-4 bg-white border-b border-gray-200" suppressHydrationWarning>
                <input
                    type="text"
                    value={creativeName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="text-lg font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
                    placeholder="Untitled Creative"
                    suppressHydrationWarning
                />

                {/* Save Status */}
                {saveStatus && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-sm" suppressHydrationWarning>
                        {saveStatus === 'saving' && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                        {saveStatus === 'saved' && <CheckCircle className="w-4 h-4 text-green-600" />}
                        {saveStatus === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
                        <span className="text-gray-700 capitalize">{saveStatus}</span>
                    </div>
                )}
            </div>

            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar */}
                <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
                    {/* Templates Button */}
                    <div className="p-4 border-b border-gray-200">
                        <button
                            onClick={() => setShowTemplates(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span className="font-semibold">Browse Templates</span>
                        </button>
                    </div>

                    <div className="p-4">
                        <FormatSelector />
                    </div>
                    <div className="px-2 py-2 border-t border-gray-200">
                        <LayerList />
                    </div>
                </div>

                {/* Center Canvas */}
                <div className="flex-1 flex flex-row overflow-hidden">
                    <Toolbar onExportClick={toggleExportPanel} />
                    <div className="flex-1 flex items-center justify-center overflow-hidden">
                        <CanvasEditor className="w-full h-full" />
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto flex flex-col">
                    {!showAIPanel && !showCompliancePanel && !showExportPanel && (
                        <>
                            <PropertiesPanel />
                            <div className="flex gap-2 p-4 border-t border-gray-200">
                                <button
                                    onClick={toggleAIPanel}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    <span className="text-sm font-medium">AI</span>
                                </button>
                                <button
                                    onClick={toggleCompliancePanel}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    <span className="text-sm font-medium">Check</span>
                                </button>
                                <button
                                    onClick={toggleExportPanel}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    <Share2 className="w-4 h-4" />
                                    <span className="text-sm font-medium">Export</span>
                                </button>
                            </div>
                        </>
                    )}

                    {showAIPanel && (
                        <div className="flex-1 overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 p-3 flex items-center justify-between">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-purple-600" />
                                    AI Generation
                                </h3>
                                <button
                                    onClick={toggleAIPanel}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setActiveAIPanel('layout')}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${activeAIPanel === 'layout'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        <ImageIcon className="w-3.5 h-3.5" />
                                        Layout
                                    </button>
                                    <button
                                        onClick={() => setActiveAIPanel('copy')}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${activeAIPanel === 'copy'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        <Type className="w-3.5 h-3.5" />
                                        Copy
                                    </button>
                                    <button
                                        onClick={() => setActiveAIPanel('recommendations')}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${activeAIPanel === 'recommendations'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        <Lightbulb className="w-3.5 h-3.5" />
                                        Tips
                                    </button>
                                </div>
                                {activeAIPanel === 'layout' && <GenerationPanel />}
                                {activeAIPanel === 'copy' && <CopyGenerationPanel />}
                                {activeAIPanel === 'recommendations' && <RecommendationsPanel />}
                            </div>
                        </div>
                    )}

                    {showCompliancePanel && (
                        <div className="flex-1 overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 p-3 flex items-center justify-between">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-green-600" />
                                    Compliance Check
                                </h3>
                                <button
                                    onClick={toggleCompliancePanel}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </div>
                            <CompliancePanel />
                        </div>
                    )}

                    {showExportPanel && (
                        <div className="flex-1 overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 p-3 flex items-center justify-between">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Share2 className="w-4 h-4 text-blue-600" />
                                    Export Creatives
                                </h3>
                                <button
                                    onClick={toggleExportPanel}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </div>
                            <ExportPanel />
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Modal */}
            {isPreviewOpen && <PreviewModal isOpen={true} onClose={() => setIsPreviewOpen(false)} />}

            {/* Template Gallery */}
            {showTemplates && <TemplateGallery onClose={() => setShowTemplates(false)} />}
        </div>
    );
}

export default function BuilderPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BuilderPageContent />
        </Suspense>
    );
}
