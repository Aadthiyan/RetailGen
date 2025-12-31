'use client';

import { useBuilderStore } from '../store/builderStore';
import { SketchPicker } from 'react-color';
import { useState, useEffect } from 'react';
import { AlignmentTools } from './AlignmentTools';

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

    const isTextObject = activeObject.type === 'i-text' || activeObject.type === 'text';

    return (
        <div className="w-64 bg-white border-l border-gray-200 flex flex-col h-full overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Properties</h3>
            </div>

            <div className="p-4 space-y-4">
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

                {/* Font Family - Only for text */}
                {isTextObject && (
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-700">Font Family</label>
                        <select
                            value={activeObject.fontFamily || 'Inter'}
                            onChange={(e) => {
                                if (activeObject && canvas) {
                                    activeObject.set('fontFamily', e.target.value);
                                    canvas.renderAll();
                                }
                            }}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                            style={{ fontFamily: activeObject.fontFamily || 'Inter' }}
                        >
                            <optgroup label="⭐ RECOMMENDED FOR POSTERS">
                                <option value="Bebas Neue" style={{ fontFamily: 'Bebas Neue' }}>BEBAS NEUE ⭐⭐⭐⭐⭐</option>
                                <option value="Anton" style={{ fontFamily: 'Anton' }}>ANTON ⭐⭐⭐⭐⭐</option>
                                <option value="Oswald" style={{ fontFamily: 'Oswald' }}>Oswald ⭐⭐⭐⭐⭐</option>
                                <option value="Montserrat" style={{ fontFamily: 'Montserrat' }}>Montserrat ⭐⭐⭐⭐</option>
                                <option value="Poppins" style={{ fontFamily: 'Poppins' }}>Poppins ⭐⭐⭐⭐</option>
                            </optgroup>
                            <optgroup label="🎯 Display Fonts (Headlines)">
                                <option value="Bebas Neue" style={{ fontFamily: 'Bebas Neue' }}>BEBAS NEUE</option>
                                <option value="Anton" style={{ fontFamily: 'Anton' }}>ANTON</option>
                                <option value="Oswald" style={{ fontFamily: 'Oswald' }}>Oswald</option>
                                <option value="Righteous" style={{ fontFamily: 'Righteous' }}>Righteous</option>
                                <option value="Archivo Black" style={{ fontFamily: 'Archivo Black' }}>Archivo Black</option>
                                <option value="Russo One" style={{ fontFamily: 'Russo One' }}>Russo One</option>
                                <option value="Barlow Condensed" style={{ fontFamily: 'Barlow Condensed' }}>Barlow Condensed</option>
                                <option value="Fjalla One" style={{ fontFamily: 'Fjalla One' }}>Fjalla One</option>
                                <option value="Bangers" style={{ fontFamily: 'Bangers' }}>Bangers</option>
                            </optgroup>
                            <optgroup label="Sans-Serif (Body Text)">
                                <option value="Inter" style={{ fontFamily: 'Inter' }}>Inter</option>
                                <option value="Open Sans" style={{ fontFamily: 'Open Sans' }}>Open Sans</option>
                                <option value="Source Sans 3" style={{ fontFamily: 'Source Sans 3' }}>Source Sans 3</option>
                                <option value="Roboto" style={{ fontFamily: 'Roboto' }}>Roboto</option>
                                <option value="Ubuntu" style={{ fontFamily: 'Ubuntu' }}>Ubuntu</option>
                                <option value="Outfit" style={{ fontFamily: 'Outfit' }}>Outfit</option>
                                <option value="Montserrat" style={{ fontFamily: 'Montserrat' }}>Montserrat</option>
                                <option value="Poppins" style={{ fontFamily: 'Poppins' }}>Poppins</option>
                                <option value="Raleway" style={{ fontFamily: 'Raleway' }}>Raleway</option>
                            </optgroup>
                            <optgroup label="Serif (Classic)">
                                <option value="Playfair Display" style={{ fontFamily: 'Playfair Display' }}>Playfair Display</option>
                                <option value="Lora" style={{ fontFamily: 'Lora' }}>Lora</option>
                                <option value="Merriweather" style={{ fontFamily: 'Merriweather' }}>Merriweather</option>
                            </optgroup>
                            <optgroup label="✍️ Script (Decorative)">
                                <option value="Dancing Script" style={{ fontFamily: 'Dancing Script' }}>Dancing Script</option>
                                <option value="Pacifico" style={{ fontFamily: 'Pacifico' }}>Pacifico</option>
                                <option value="Lobster" style={{ fontFamily: 'Lobster' }}>Lobster</option>
                                <option value="Permanent Marker" style={{ fontFamily: 'Permanent Marker' }}>Permanent Marker</option>
                            </optgroup>
                        </select>
                    </div>
                )}

                {/* Font Size - Only for text */}
                {isTextObject && (
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-700">Font Size</label>
                        <input
                            type="number"
                            min="8"
                            max="200"
                            value={Math.round(activeObject.fontSize || 40)}
                            onChange={(e) => {
                                if (activeObject && canvas) {
                                    activeObject.set('fontSize', parseInt(e.target.value));
                                    canvas.renderAll();
                                }
                            }}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                )}

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

                {/* Dimensions - Now Editable */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Width</label>
                        <input
                            type="number"
                            min="10"
                            max="5000"
                            value={Math.round(activeObject.getScaledWidth())}
                            onChange={(e) => {
                                if (activeObject && canvas) {
                                    const newWidth = parseInt(e.target.value);
                                    const currentWidth = activeObject.getScaledWidth();
                                    const scaleX = newWidth / (activeObject.width * activeObject.scaleX);
                                    activeObject.set('scaleX', activeObject.scaleX * scaleX);
                                    canvas.renderAll();
                                }
                            }}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Height</label>
                        <input
                            type="number"
                            min="10"
                            max="5000"
                            value={Math.round(activeObject.getScaledHeight())}
                            onChange={(e) => {
                                if (activeObject && canvas) {
                                    const newHeight = parseInt(e.target.value);
                                    const currentHeight = activeObject.getScaledHeight();
                                    const scaleY = newHeight / (activeObject.height * activeObject.scaleY);
                                    activeObject.set('scaleY', activeObject.scaleY * scaleY);
                                    canvas.renderAll();
                                }
                            }}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>

                {/* Alignment Tools */}
                <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-xs font-semibold text-gray-700 mb-3">Alignment</h4>
                    <AlignmentTools />
                </div>
            </div>
        </div>
    );
}
