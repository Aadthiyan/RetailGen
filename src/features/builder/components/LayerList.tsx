'use client';

import { useBuilderStore } from '../store/builderStore';
import { ArrowUp, ArrowDown, Eye, EyeOff, Lock, Unlock, Trash2, Copy, GripVertical, Type, Square, Circle, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function LayerList() {
    const { layers, activeObject, setActiveObject, moveLayer, removeActiveObject, canvas } = useBuilderStore();
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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
        useBuilderStore.getState().updateLayers();
    };

    const toggleLock = (obj: any) => {
        obj.lockMovementX = !obj.lockMovementX;
        obj.lockMovementY = !obj.lockMovementY;
        obj.lockRotation = !obj.lockRotation;
        obj.lockScalingX = !obj.lockScalingX;
        obj.lockScalingY = !obj.lockScalingY;
        obj.selectable = !obj.lockMovementX;
        canvas?.renderAll();
        useBuilderStore.getState().updateLayers();
    };

    const duplicateLayer = (obj: any) => {
        obj.clone((cloned: any) => {
            cloned.set({
                left: (obj.left || 0) + 10,
                top: (obj.top || 0) + 10,
            });
            canvas?.add(cloned);
            canvas?.setActiveObject(cloned);
            canvas?.renderAll();
            useBuilderStore.getState().updateLayers();
        });
    };

    const getLayerIcon = (obj: any) => {
        if (obj.type === 'i-text' || obj.type === 'text') return Type;
        if (obj.type === 'rect') return Square;
        if (obj.type === 'circle') return Circle;
        if (obj.type === 'image') return ImageIcon;
        return Square;
    };

    const getLayerName = (obj: any) => {
        if (obj.name) return obj.name;
        if (obj.type === 'i-text' || obj.type === 'text') {
            const text = obj.text || '';
            return text.length > 20 ? text.substring(0, 20) + '...' : text || 'Text';
        }
        if (obj.type === 'rect') return 'Rectangle';
        if (obj.type === 'circle') return 'Circle';
        if (obj.type === 'image') return 'Image';
        return 'Object';
    };

    const getLayerThumbnail = (obj: any) => {
        // Generate a simple visual representation
        if (obj.type === 'i-text' || obj.type === 'text') {
            return (
                <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded text-blue-600 text-xs font-bold">
                    T
                </div>
            );
        }
        if (obj.type === 'rect') {
            return (
                <div
                    className="w-8 h-8 rounded border-2"
                    style={{ backgroundColor: obj.fill || '#3b82f6', borderColor: obj.stroke || 'transparent' }}
                />
            );
        }
        if (obj.type === 'circle') {
            return (
                <div
                    className="w-8 h-8 rounded-full border-2"
                    style={{ backgroundColor: obj.fill || '#ef4444', borderColor: obj.stroke || 'transparent' }}
                />
            );
        }
        if (obj.type === 'image') {
            return (
                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-gray-500" />
                </div>
            );
        }
        return (
            <div className="w-8 h-8 bg-gray-100 rounded" />
        );
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        // Reorder layers
        const newLayers = [...layers];
        const draggedItem = newLayers[draggedIndex];
        newLayers.splice(draggedIndex, 1);
        newLayers.splice(index, 0, draggedItem);

        // Update canvas z-index
        if (canvas) {
            canvas.clear();
            newLayers.forEach(obj => canvas.add(obj));
            canvas.renderAll();
        }

        setDraggedIndex(index);
        useBuilderStore.getState().updateLayers();
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 text-sm">Layers</h3>
                <p className="text-xs text-gray-500 mt-0.5">{layers.length} object{layers.length !== 1 ? 's' : ''}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {layers.map((obj: any, index) => {
                    const isActive = activeObject === obj;
                    const Icon = getLayerIcon(obj);
                    const isLocked = obj.lockMovementX;
                    const isHidden = !obj.visible;

                    return (
                        <div
                            key={index}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={cn(
                                "flex items-center gap-2 p-2 rounded-lg text-sm cursor-pointer group transition-all",
                                isActive ? "bg-primary-50 border-2 border-primary-400 shadow-sm" : "hover:bg-gray-50 border-2 border-transparent",
                                draggedIndex === index && "opacity-50",
                                isHidden && "opacity-60"
                            )}
                            onClick={() => handleSelect(obj)}
                        >
                            {/* Drag Handle */}
                            <div className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
                                <GripVertical className="w-4 h-4 text-gray-400" />
                            </div>

                            {/* Thumbnail */}
                            {getLayerThumbnail(obj)}

                            {/* Layer Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <Icon className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                                    <span className="truncate font-medium text-gray-700 text-xs">
                                        {getLayerName(obj)}
                                    </span>
                                </div>
                                <div className="text-[10px] text-gray-400 mt-0.5">
                                    {Math.round(obj.width * (obj.scaleX || 1))} × {Math.round(obj.height * (obj.scaleY || 1))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleVisibility(obj); }}
                                    className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                                    title={obj.visible ? "Hide" : "Show"}
                                >
                                    {obj.visible ? <Eye className="w-3.5 h-3.5 text-gray-600" /> : <EyeOff className="w-3.5 h-3.5 text-gray-400" />}
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleLock(obj); }}
                                    className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                                    title={isLocked ? "Unlock" : "Lock"}
                                >
                                    {isLocked ? <Lock className="w-3.5 h-3.5 text-orange-500" /> : <Unlock className="w-3.5 h-3.5 text-gray-600" />}
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); duplicateLayer(obj); }}
                                    className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                                    title="Duplicate"
                                >
                                    <Copy className="w-3.5 h-3.5 text-gray-600" />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {layers.length === 0 && (
                    <div className="text-center text-gray-400 py-12 text-sm">
                        <Square className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No layers yet</p>
                        <p className="text-xs mt-1">Add objects to get started</p>
                    </div>
                )}
            </div>

            {activeObject && (
                <div className="p-3 border-t border-gray-200 space-y-2">
                    <div className="flex gap-2">
                        <button
                            onClick={() => moveLayer(layers.indexOf(activeObject), 'up')}
                            className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-xs font-medium"
                            disabled={layers.indexOf(activeObject) === 0}
                        >
                            <ArrowUp className="w-3.5 h-3.5" />
                            Up
                        </button>
                        <button
                            onClick={() => moveLayer(layers.indexOf(activeObject), 'down')}
                            className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-xs font-medium"
                            disabled={layers.indexOf(activeObject) === layers.length - 1}
                        >
                            <ArrowDown className="w-3.5 h-3.5" />
                            Down
                        </button>
                    </div>
                    <button
                        onClick={removeActiveObject}
                        className="w-full flex items-center justify-center gap-2 p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-xs font-medium"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Selected
                    </button>
                </div>
            )}
        </div>
    );
}
