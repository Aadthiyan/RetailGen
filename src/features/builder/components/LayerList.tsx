'use client';

import { useBuilderStore } from '../store/builderStore';
import { ArrowUp, ArrowDown, Eye, EyeOff, Lock, Unlock, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LayerList() {
    const { layers, activeObject, setActiveObject, moveLayer, removeActiveObject, canvas } = useBuilderStore();

    const handleSelect = (obj: any) => {
        if (canvas) {
            canvas.setActiveObject(obj);
            canvas.renderAll();
            setActiveObject(obj);
        }
    };

    const toggleVisibility = (obj: any) => {
        obj.visible = !obj.visible;
        canvas?.renderAll();
        // Force re-render of component
        useBuilderStore.getState().updateLayers();
    };

    const toggleLock = (obj: any) => {
        obj.lockMovementX = !obj.lockMovementX;
        obj.lockMovementY = !obj.lockMovementY;
        obj.lockRotation = !obj.lockRotation;
        obj.lockScalingX = !obj.lockScalingX;
        obj.lockScalingY = !obj.lockScalingY;
        canvas?.renderAll();
        useBuilderStore.getState().updateLayers();
    };

    return (
        <div className="flex flex-col h-full bg-white border-l border-gray-200 w-64">
            <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Layers</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {layers.map((obj: any, index) => {
                    const isActive = activeObject === obj;
                    // Determine type label
                    let type = 'Object';
                    if (obj.type === 'i-text' || obj.type === 'text') type = 'Text';
                    if (obj.type === 'rect') type = 'Rectangle';
                    if (obj.type === 'circle') type = 'Circle';
                    if (obj.type === 'image') type = 'Image';

                    return (
                        <div
                            key={index}
                            className={cn(
                                "flex items-center justify-between p-2 rounded-md text-sm cursor-pointer group",
                                isActive ? "bg-primary-50 border border-primary-200" : "hover:bg-gray-50 border border-transparent"
                            )}
                            onClick={() => handleSelect(obj)}
                        >
                            <span className="truncate font-medium text-gray-700">{type}</span>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); toggleVisibility(obj); }} className="p-1 hover:bg-gray-200 rounded">
                                    {obj.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-gray-400" />}
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); toggleLock(obj); }} className="p-1 hover:bg-gray-200 rounded">
                                    {obj.lockMovementX ? <Lock className="w-3 h-3 text-gray-400" /> : <Unlock className="w-3 h-3" />}
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); moveLayer(index, 'up'); }} className="p-1 hover:bg-gray-200 rounded">
                                    <ArrowUp className="w-3 h-3" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); moveLayer(index, 'down'); }} className="p-1 hover:bg-gray-200 rounded">
                                    <ArrowDown className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {layers.length === 0 && (
                    <div className="text-center text-gray-400 py-8 text-sm">
                        No layers yet
                    </div>
                )}
            </div>

            {activeObject && (
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={removeActiveObject}
                        className="w-full flex items-center justify-center gap-2 p-2 bg-error-50 text-error-600 rounded-md hover:bg-error-100 transition-colors text-sm font-medium"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Selected
                    </button>
                </div>
            )}
        </div>
    );
}
