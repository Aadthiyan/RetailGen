/**
 * Auto-Save Hook - Automatically saves canvas every 30 seconds
 */

import { useEffect, useRef } from 'react';
import { useBuilderStore } from '../store/builderStore';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

export function useAutoSave(intervalMs: number = 30000) {
    const { canvas, creativeId, saveStatus, setSaveStatus } = useBuilderStore();
    const updateCreative = useMutation(api.creatives.update);
    const lastSaveRef = useRef<number>(0);
    const saveTimeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (!canvas || !creativeId) return;

        const saveCanvas = async () => {
            const now = Date.now();

            // Prevent saving too frequently
            if (now - lastSaveRef.current < 5000) {
                console.log('⏸️ Auto-save skipped (too soon)');
                return;
            }

            try {
                console.log('💾 Auto-saving...', { creativeId });
                setSaveStatus('saving');

                const canvasData = canvas.toJSON(['name', 'selectable', 'evented']);

                await updateCreative({
                    id: creativeId as any,
                    content: canvasData,
                });

                lastSaveRef.current = now;
                setSaveStatus('saved');
                console.log('✅ Auto-save successful');

                // Clear "saved" status after 2 seconds
                setTimeout(() => setSaveStatus(null), 2000);
            } catch (error) {
                console.error('❌ Auto-save failed:', error);
                setSaveStatus('error');
                setTimeout(() => setSaveStatus(null), 3000);
            }
        };

        // Save on canvas changes (debounced)
        const handleCanvasChange = () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            saveTimeoutRef.current = setTimeout(saveCanvas, 2000);
        };

        // Listen to canvas events
        canvas.on('object:modified', handleCanvasChange);
        canvas.on('object:added', handleCanvasChange);
        canvas.on('object:removed', handleCanvasChange);

        // Periodic auto-save
        const interval = setInterval(saveCanvas, intervalMs);

        // Save before page unload
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (saveStatus === 'saving') {
                e.preventDefault();
                e.returnValue = 'Changes are being saved...';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            canvas.off('object:modified', handleCanvasChange);
            canvas.off('object:added', handleCanvasChange);
            canvas.off('object:removed', handleCanvasChange);
            clearInterval(interval);
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [canvas, creativeId, intervalMs, updateCreative, saveStatus, setSaveStatus]);

    return { saveStatus };
}
