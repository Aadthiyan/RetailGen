import { create } from 'zustand';
import { AdFormat, AD_FORMATS } from '../config/formats';

// Avoid importing fabric directly to prevent SSR/Webpack issues
type FabricCanvas = any;
type FabricObject = any;

interface BuilderState {
    canvas: FabricCanvas | null;
    activeObject: FabricObject | null;
    zoom: number;
    canvasSize: { width: number; height: number };
    currentFormat: AdFormat;
    layers: FabricObject[];
    creativeId: string | null;
    saveStatus: 'saved' | 'saving' | 'unsaved' | 'error';

    // Actions
    setCanvas: (canvas: FabricCanvas) => void;
    setActiveObject: (object: FabricObject | null) => void;
    setZoom: (zoom: number) => void;
    setFormat: (formatId: string) => void;
    updateLayers: () => void;
    setCreativeId: (id: string | null) => void;
    setSaveStatus: (status: 'saved' | 'saving' | 'unsaved' | 'error') => void;
    loadFromJSON: (json: any) => void;

    // Canvas Operations
    addObject: (object: FabricObject) => void;
    removeActiveObject: () => void;
    moveLayer: (index: number, direction: 'up' | 'down') => void;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
    canvas: null,
    activeObject: null,
    zoom: 1,
    canvasSize: { width: 1080, height: 1080 },
    currentFormat: AD_FORMATS[0], // Default to FB Feed
    layers: [],
    creativeId: null,
    saveStatus: 'saved',

    setCanvas: (canvas) => set({ canvas }),

    setActiveObject: (object) => set({ activeObject: object }),

    setZoom: (zoom) => {
        const { canvas } = get();
        if (canvas) {
            canvas.setZoom(zoom);
            set({ zoom });
        }
    },

    setFormat: (formatId) => {
        const { canvas, canvasSize } = get();
        const newFormat = AD_FORMATS.find(f => f.id === formatId);

        if (!canvas || !newFormat) return;

        const oldWidth = canvasSize.width;
        const oldHeight = canvasSize.height;
        const newWidth = newFormat.width;
        const newHeight = newFormat.height;

        // Smart Resize Logic
        const scaleX = newWidth / oldWidth;
        const scaleY = newHeight / oldHeight;

        canvas.getObjects().forEach((obj: any) => {
            const left = obj.left || 0;
            const top = obj.top || 0;

            obj.set({
                left: left * scaleX,
                top: top * scaleY,
                scaleX: (obj.scaleX || 1) * scaleX,
                scaleY: (obj.scaleY || 1) * scaleY,
            });

            obj.setCoords();
        });

        canvas.setWidth(newWidth);
        canvas.setHeight(newHeight);
        canvas.renderAll();

        set({
            currentFormat: newFormat,
            canvasSize: { width: newWidth, height: newHeight }
        });
    },

    updateLayers: () => {
        const { canvas } = get();
        if (canvas) {
            const objects = canvas.getObjects().reverse();
            set({ layers: [...objects] });
        }
    },

    setCreativeId: (id) => set({ creativeId: id }),

    setSaveStatus: (status) => set({ saveStatus: status }),

    loadFromJSON: (json) => {
        const { canvas } = get();
        if (canvas && json) {
            canvas.loadFromJSON(json, () => {
                canvas.renderAll();
                get().updateLayers();
            });
        }
    },

    addObject: (object) => {
        const { canvas } = get();
        if (canvas) {
            canvas.add(object);
            canvas.setActiveObject(object);
            canvas.renderAll();
            get().updateLayers();
        }
    },

    removeActiveObject: () => {
        const { canvas } = get();
        if (canvas) {
            const active = canvas.getActiveObjects();
            if (active.length) {
                canvas.discardActiveObject();
                active.forEach((obj: any) => {
                    canvas.remove(obj);
                });
                canvas.renderAll();
                get().updateLayers();
            }
        }
    },

    moveLayer: (index, direction) => {
        const { canvas, layers } = get();
        if (!canvas) return;

        const object = layers[index];
        if (!object) return;

        if (direction === 'up') {
            object.bringForward();
        } else {
            object.sendBackwards();
        }

        canvas.renderAll();
        get().updateLayers();
    },
}));
