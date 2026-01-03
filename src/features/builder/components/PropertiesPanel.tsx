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
            activeObject.setCoords();
            canvas.renderAll();
            canvas.fire('object:modified', { target: activeObject });
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
                {/* Element Name */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700">Element Name</label>
                    <input
                        type="text"
                        value={(activeObject as any).name || ''}
                        onChange={(e) => {
                            if (activeObject && canvas) {
                                (activeObject as any).name = e.target.value;
                                canvas.fire('object:modified', { target: activeObject });
                            }
                        }}
                        placeholder="e.g., logo, headline, price"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-500">
                        Name this element (e.g., "logo", "headline") for better compliance checking
                    </p>
                </div>

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
                            onChange={async (e) => {
                                if (activeObject && canvas) {
                                    const newFont = e.target.value;
                                    console.log('Changing font to:', newFont);

                                    // Wait for font to load before applying
                                    try {
                                        await document.fonts.load(`40px "${newFont}"`);
                                        console.log('Font loaded successfully:', newFont);

                                        activeObject.set('fontFamily', newFont);
                                        console.log('Font set on object:', activeObject.fontFamily);
                                        activeObject.setCoords();
                                        canvas.renderAll();
                                        canvas.fire('object:modified', { target: activeObject });
                                        console.log('Canvas rendered');
                                    } catch (error) {
                                        console.error('Font loading error:', error);
                                        // Apply anyway, might work
                                        activeObject.set('fontFamily', newFont);
                                        activeObject.setCoords();
                                        canvas.renderAll();
                                        canvas.fire('object:modified', { target: activeObject });
                                    }
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
                                    const newSize = parseInt(e.target.value);
                                    activeObject.set('fontSize', newSize);
                                    activeObject.setCoords(); // Important: recalculate coordinates
                                    canvas.renderAll();
                                    canvas.fire('object:modified', { target: activeObject }); // Trigger save
                                }
                            }}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                )}

                {/* Bold & Italic - Only for text */}
                {isTextObject && (
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-700">Text Style</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    if (activeObject && canvas) {
                                        const currentWeight = activeObject.fontWeight;
                                        const newWeight = currentWeight === 'bold' ? 'normal' : 'bold';
                                        activeObject.set('fontWeight', newWeight);
                                        activeObject.setCoords();
                                        canvas.renderAll();
                                        canvas.fire('object:modified', { target: activeObject });
                                    }
                                }}
                                className={`flex-1 px-3 py-2 text-sm font-bold border rounded transition-colors ${activeObject.fontWeight === 'bold'
                                    ? 'bg-primary-500 text-white border-primary-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                B
                            </button>
                            <button
                                onClick={() => {
                                    if (activeObject && canvas) {
                                        const currentStyle = activeObject.fontStyle;
                                        const newStyle = currentStyle === 'italic' ? 'normal' : 'italic';
                                        activeObject.set('fontStyle', newStyle);
                                        activeObject.setCoords();
                                        canvas.renderAll();
                                        canvas.fire('object:modified', { target: activeObject });
                                    }
                                }}
                                className={`flex-1 px-3 py-2 text-sm italic border rounded transition-colors ${activeObject.fontStyle === 'italic'
                                    ? 'bg-primary-500 text-white border-primary-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                I
                            </button>
                        </div>
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
                                activeObject.setCoords();
                                canvas.renderAll();
                                canvas.fire('object:modified', { target: activeObject });
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
