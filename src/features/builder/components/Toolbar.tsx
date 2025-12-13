'use client';

import { useBuilderStore } from '../store/builderStore';
import { Type, Square, Circle, Image as ImageIcon, MousePointer2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Toolbar() {
    const { addObject, canvas } = useBuilderStore();

    const addText = async () => {
        const fabricModule = await import('fabric');
        const IText = fabricModule.fabric.IText;

        const text = new IText('Double click to edit', {
            left: 100,
            top: 100,
            fontFamily: 'Inter',
            fill: '#000000',
            fontSize: 40,
        });
        addObject(text);
    };

    const addRectangle = async () => {
        const fabricModule = await import('fabric');
        const Rect = fabricModule.fabric.Rect;

        const rect = new Rect({
            left: 100,
            top: 100,
            fill: '#3b82f6', // primary-500
            width: 200,
            height: 200,
        });
        addObject(rect);
    };

    const addCfabricModule = await import('fabric');
        const Circle = fabricModule.fabric.Circle
        const { Circle } = await import('fabric');

        const circle = new Circle({
            left: 100,
            top: 100,
            fill: '#ef4444', // error-500
            radius: 100,
        });
        addObject(circle);
    };

    // Placeholder for image upload trigger
    const triggerImageUpload = () => {
        // This would typically open the asset sidebar or a file picker
        alert('Use the Assets tab to add images!');
    };

    return (
        <div className="flex flex-col gap-2 p-2 bg-white border-r border-gray-200 w-16 items-center h-full">
            <ToolButton icon={MousePointer2} label="Select" active onClick={() => { }} />
            <ToolButton icon={Type} label="Text" onClick={addText} />
            <ToolButton icon={Square} label="Rect" onClick={addRectangle} />
            <ToolButton icon={Circle} label="Circle" onClick={addCircle} />
            <ToolButton icon={ImageIcon} label="Image" onClick={triggerImageUpload} />
        </div>
    );
}

function ToolButton({ icon: Icon, label, onClick, active }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "p-3 rounded-lg flex flex-col items-center justify-center gap-1 w-full transition-colors",
                active ? "bg-primary-50 text-primary-600" : "text-gray-600 hover:bg-gray-100"
            )}
            title={label}
        >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    );
}
