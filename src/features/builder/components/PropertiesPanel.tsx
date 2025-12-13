'use client';

import { useBuilderStore } from '../store/builderStore';
import { SketchPicker } from 'react-color';
import { useState, useEffect } from 'react';

export function PropertiesPanel() {
    const { activeObject, canvas } = useBuilderStore();
    const [color, setColor] = useState('#000000');
    const [showColorPicker, setShowColorPicker] = useState(false);

    useEffect(() => {
        if (activeObject) {
            setColor(activeObject.fill as string || '#000000');
        }
    }, [activeObject]);

    const handleColorChange = (newColor: any) => {
        setColor(newColor.hex);
        if (activeObject && canvas) {
            activeObject.set('fill', newColor.hex);
            canvas.renderAll();
        }
    };

    if (!activeObject) {
        return (
            <div className="w-64 bg-white border-l border-gray-200 p-4 text-sm text-gray-500 text-center">
                Select an object to edit properties
            </div>
        );
    }

    return (
        <div className="w-64 bg-white border-l border-gray-200 flex flex-col h-full">
            <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Properties</h3>
            </div>

            <div className="p-4 space-y-6">
                {/* Color Picker */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700">Fill Color</label>
                    <div className="relative">
                        <div
                            className="w-full h-8 rounded border border-gray-300 cursor-pointer shadow-sm"
                            style={{ backgroundColor: color }}
                            onClick={() => setShowColorPicker(!showColorPicker)}
                        />
                        {showColorPicker && (
                            <div className="absolute z-10 top-10 right-0">
                                <div className="fixed inset-0" onClick={() => setShowColorPicker(false)} />
                                <SketchPicker color={color} onChange={handleColorChange} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Opacity */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700">Opacity</label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        defaultValue={activeObject.opacity}
                        onChange={(e) => {
                            if (activeObject && canvas) {
                                activeObject.set('opacity', parseFloat(e.target.value));
                                canvas.renderAll();
                            }
                        }}
                        className="w-full"
                    />
                </div>

                {/* Dimensions (Read-only for now) */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Width</label>
                        <input
                            type="text"
                            value={Math.round(activeObject.getScaledWidth())}
                            disabled
                            className="w-full px-2 py-1 text-xs border rounded bg-gray-50"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Height</label>
                        <input
                            type="text"
                            value={Math.round(activeObject.getScaledHeight())}
                            disabled
                            className="w-full px-2 py-1 text-xs border rounded bg-gray-50"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
