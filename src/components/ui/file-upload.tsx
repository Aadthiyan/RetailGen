'use client';

import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { CloudUpload, X, File as FileIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
    onUpload: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number; // in bytes
    accept?: Record<string, string[]>;
    className?: string;
    disabled?: boolean;
}

export function FileUpload({
    onUpload,
    maxFiles = 1,
    maxSize = 5 * 1024 * 1024, // 5MB default
    accept = {
        'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    className,
    disabled = false,
}: FileUploadProps) {
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(
        (acceptedFiles: File[], fileRejections: FileRejection[]) => {
            setError(null);

            if (fileRejections.length > 0) {
                const rejection = fileRejections[0];
                if (rejection.errors[0].code === 'file-too-large') {
                    setError(`File is too large. Max size is ${maxSize / 1024 / 1024}MB.`);
                } else if (rejection.errors[0].code === 'file-invalid-type') {
                    setError('Invalid file type.');
                } else {
                    setError(rejection.errors[0].message);
                }
                return;
            }

            if (acceptedFiles.length > 0) {
                onUpload(acceptedFiles);
            }
        },
        [onUpload, maxSize]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles,
        maxSize,
        accept,
        disabled,
    });

    return (
        <div className={cn('w-full', className)}>
            <div
                {...getRootProps()}
                className={cn(
                    'border-2 border-dashed rounded-lg p-8 transition-colors duration-200 ease-in-out cursor-pointer flex flex-col items-center justify-center gap-4 text-center',
                    isDragActive
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50',
                    disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent hover:border-gray-300',
                    error && 'border-error-500 bg-error-50'
                )}
            >
                <input {...getInputProps()} />
                <div className="p-4 bg-white rounded-full shadow-sm">
                    <CloudUpload className={cn("w-8 h-8", error ? "text-error-500" : "text-primary-500")} />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                        {isDragActive ? 'Drop the files here' : 'Click or drag files to upload'}
                    </p>
                    <p className="text-xs text-gray-500">
                        SVG, PNG, JPG or GIF (max {maxSize / 1024 / 1024}MB)
                    </p>
                </div>
            </div>

            {error && (
                <div className="mt-2 flex items-center text-sm text-error-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {error}
                </div>
            )}
        </div>
    );
}
