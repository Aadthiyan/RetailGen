'use client';

import { PreviewModal } from '@/features/builder/components/PreviewModal';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PreviewPage() {
    const searchParams = useSearchParams();
    const creativeId = searchParams.get('id');
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        // Open preview modal on mount
        setIsOpen(true);
    }, []);

    if (!creativeId) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">No Creative Selected</h1>
                    <p className="text-gray-600 mt-2">Please select a creative to preview</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <PreviewModal 
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                creativeId={creativeId}
            />
        </div>
    );
}
