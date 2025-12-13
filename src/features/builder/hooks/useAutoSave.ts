import { useEffect, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useBuilderStore } from '../store/builderStore';
import { Id } from '../../../../convex/_generated/dataModel';

export function useAutoSave() {
    const { canvas, creativeId, saveStatus, setSaveStatus } = useBuilderStore();
    const updateCreative = useMutation(api.creatives.update);
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    useEffect(() => {
        if (!canvas || !creativeId) return;

        const save = async () => {
            if (saveStatus !== 'unsaved') return;

            setSaveStatus('saving');
            try {
                const json = canvas.toJSON();
                const thumbnail = canvas.toDataURL({ format: 'png', multiplier: 0.5 });

                await updateCreative({
                    id: creativeId as Id<"creatives">,
                    content: json,
                    thumbnailUrl: thumbnail,
                });

                setSaveStatus('saved');
            } catch (error) {
                console.error('Autosave failed:', error);
                setSaveStatus('error');
            }
        };

        // Debounce save
        if (saveStatus === 'unsaved') {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(save, 2000); // Save after 2 seconds of inactivity
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [canvas, creativeId, saveStatus, updateCreative, setSaveStatus]);
}
