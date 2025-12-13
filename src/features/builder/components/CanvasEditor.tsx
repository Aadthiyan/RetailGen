'use client';

import { useEffect, useRef } from 'react';
import { useBuilderStore } from '../store/builderStore';
import { cn } from '@/lib/utils';

interface CanvasEditorProps {
    className?: string;
}

export function CanvasEditor({ className }: CanvasEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { setCanvas, setActiveObject, updateLayers, canvasSize, currentFormat, setSaveStatus } = useBuilderStore();

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        // Ref to track if the effect is active (prevent race conditions)
        let isMounted = true;
        let canvasInstance: any = null;

        const initCanvas = async () => {
            try {
                console.log("🎨 Initializing Fabric.js...");
                const { Canvas, Rect } = await import('fabric');

                if (!Canvas) {
                    console.error("❌ Fabric.js Canvas not found!");
                    return;
                }

                if (!isMounted) return;
                if (!canvasRef.current) return;

                // Dispose existing instance if any (safety check)
                if (canvasInstance) {
                    canvasInstance.dispose();
                }

                console.log("✨ Creating new Canvas instance");
                // Initialize Fabric Canvas
                canvasInstance = new Canvas(canvasRef.current, {
                    width: canvasSize.width,
                    height: canvasSize.height,
                    backgroundColor: '#ffffff',
                    preserveObjectStacking: true,
                    selection: true,
                    renderOnAddRemove: true,
                });

                // Set initial canvas in store
                setCanvas(canvasInstance);

                // Render Safe Zone if exists
                if (currentFormat.safeZone) {
                    const { top, bottom, left, right } = currentFormat.safeZone;
                    const width = canvasSize.width - left - right;
                    const height = canvasSize.height - top - bottom;

                    const safeZone = new Rect({
                        left: left,
                        top: top,
                        width: width,
                        height: height,
                        fill: 'transparent',
                        stroke: 'rgba(0, 255, 0, 0.3)',
                        strokeWidth: 2,
                        strokeDashArray: [10, 10],
                        selectable: false,
                        evented: false,
                        excludeFromExport: true,
                    });

                    canvasInstance.add(safeZone);
                    canvasInstance.sendToBack(safeZone);
                }

                // Event Listeners
                const handleSelection = (e: any) => {
                    const selected = e.selected?.[0] || null;
                    setActiveObject(selected);
                };

                const handleObjectModified = () => {
                    updateLayers();
                    setSaveStatus('unsaved');
                };

                canvasInstance.on('selection:created', handleSelection);
                canvasInstance.on('selection:updated', handleSelection);
                canvasInstance.on('selection:cleared', () => setActiveObject(null));
                canvasInstance.on('object:added', handleObjectModified);
                canvasInstance.on('object:removed', handleObjectModified);
                canvasInstance.on('object:modified', handleObjectModified);

                // Responsive sizing logic
                const resizeCanvas = () => {
                    if (!containerRef.current || !canvasInstance) return;
                    const containerWidth = containerRef.current.clientWidth;
                    const containerHeight = containerRef.current.clientHeight;

                    if (containerWidth === 0 || containerHeight === 0) return;

                    const scale = Math.min(
                        (containerWidth - 40) / canvasSize.width,
                        (containerHeight - 40) / canvasSize.height
                    );

                    const zoom = Math.min(scale, 1);

                    canvasInstance.setZoom(zoom);
                    canvasInstance.setWidth(canvasSize.width * zoom);
                    canvasInstance.setHeight(canvasSize.height * zoom);
                    canvasInstance.renderAll();
                };

                window.addEventListener('resize', resizeCanvas);
                // Small delay to ensure container has size
                setTimeout(resizeCanvas, 100);

            } catch (error) {
                console.error("❌ Failed to load fabric.js", error);
            }
        };

        initCanvas();

        return () => {
            isMounted = false;
            window.removeEventListener('resize', () => { }); // Cleanup listener

            if (canvasInstance) {
                console.log("🧹 Disposing Fabric canvas");
                try {
                    canvasInstance.dispose();
                } catch (e) {
                    console.warn("Error disposing canvas:", e);
                }
                setCanvas(null);
            }
        };
    }, [canvasSize, currentFormat, setCanvas, setActiveObject, updateLayers, setSaveStatus]);

    return (
        <div ref={containerRef} className={cn("flex items-center justify-center bg-gray-100 overflow-hidden h-full w-full", className)}>
            <div className="shadow-lg">
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
}
