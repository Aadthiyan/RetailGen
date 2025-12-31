'use client';

import { useBuilderStore } from '../store/builderStore';
import { AlignLeft, AlignCenter, AlignRight, AlignVerticalJustifyCenter, AlignHorizontalJustifyCenter, AlignVerticalJustifyStart, Grid3x3, Maximize2 } from 'lucide-react';

export function AlignmentTools() {
    const { canvas, activeObject } = useBuilderStore();

    const alignLeft = () => {
        if (!activeObject || !canvas) return;
        activeObject.set('left', 0);
        canvas.renderAll();
    };

    const alignCenter = () => {
        if (!activeObject || !canvas) return;
        const centerX = canvas.getWidth() / 2;
        activeObject.set('left', centerX - (activeObject.getScaledWidth() / 2));
        canvas.renderAll();
    };

    const alignRight = () => {
        if (!activeObject || !canvas) return;
        const right = canvas.getWidth() - activeObject.getScaledWidth();
        activeObject.set('left', right);
        canvas.renderAll();
    };

    const alignTop = () => {
        if (!activeObject || !canvas) return;
        activeObject.set('top', 0);
        canvas.renderAll();
    };

    const alignMiddle = () => {
        if (!activeObject || !canvas) return;
        const centerY = canvas.getHeight() / 2;
        activeObject.set('top', centerY - (activeObject.getScaledHeight() / 2));
        canvas.renderAll();
    };

    const alignBottom = () => {
        if (!activeObject || !canvas) return;
        const bottom = canvas.getHeight() - activeObject.getScaledHeight();
        activeObject.set('top', bottom);
        canvas.renderAll();
    };

    const centerBoth = () => {
        if (!activeObject || !canvas) return;
        const centerX = canvas.getWidth() / 2;
        const centerY = canvas.getHeight() / 2;
        activeObject.set({
            left: centerX - (activeObject.getScaledWidth() / 2),
            top: centerY - (activeObject.getScaledHeight() / 2),
        });
        canvas.renderAll();
    };

    const fitToCanvas = () => {
        if (!activeObject || !canvas) return;
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        const objWidth = activeObject.width || 1;
        const objHeight = activeObject.height || 1;

        const scaleX = canvasWidth / objWidth;
        const scaleY = canvasHeight / objHeight;
        const scale = Math.min(scaleX, scaleY) * 0.9; // 90% to leave margin

        activeObject.set({
            scaleX: scale,
            scaleY: scale,
            left: (canvasWidth - objWidth * scale) / 2,
            top: (canvasHeight - objHeight * scale) / 2,
        });
        canvas.renderAll();
    };

    if (!activeObject) {
        return (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                    Select an object to use alignment tools
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div>
                <label className="text-xs font-semibold text-gray-700 mb-2 block">Horizontal Alignment</label>
                <div className="grid grid-cols-3 gap-1">
                    <button
                        onClick={alignLeft}
                        className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center"
                        title="Align Left"
                    >
                        <AlignLeft className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                        onClick={alignCenter}
                        className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center"
                        title="Align Center"
                    >
                        <AlignCenter className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                        onClick={alignRight}
                        className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center"
                        title="Align Right"
                    >
                        <AlignRight className="w-4 h-4 text-gray-700" />
                    </button>
                </div>
            </div>

            <div>
                <label className="text-xs font-semibold text-gray-700 mb-2 block">Vertical Alignment</label>
                <div className="grid grid-cols-3 gap-1">
                    <button
                        onClick={alignTop}
                        className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center"
                        title="Align Top"
                    >
                        <AlignVerticalJustifyStart className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                        onClick={alignMiddle}
                        className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center"
                        title="Align Middle"
                    >
                        <AlignVerticalJustifyCenter className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                        onClick={alignBottom}
                        className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center"
                        title="Align Bottom"
                    >
                        <AlignHorizontalJustifyCenter className="w-4 h-4 text-gray-700 rotate-90" />
                    </button>
                </div>
            </div>

            <div className="pt-2 border-t border-gray-200 space-y-2">
                <button
                    onClick={centerBoth}
                    className="w-full flex items-center justify-center gap-2 p-2 bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100 transition-colors text-xs font-medium"
                >
                    <Grid3x3 className="w-4 h-4" />
                    Center on Canvas
                </button>
                <button
                    onClick={fitToCanvas}
                    className="w-full flex items-center justify-center gap-2 p-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-xs font-medium"
                >
                    <Maximize2 className="w-4 h-4" />
                    Fit to Canvas
                </button>
            </div>
        </div>
    );
}
