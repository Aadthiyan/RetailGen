import { NextResponse } from 'next/server';
import { ApiError } from './api-error';

type ApiResponse<T> = {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code: string;
    };
};

export function successResponse<T>(data: T, statusCode: number = 200) {
    return NextResponse.json(
        { success: true, data },
        { status: statusCode }
    );
}

export function errorResponse(error: unknown) {
    console.error('API Error:', error);

    if (error instanceof ApiError) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                },
            },
            { status: error.statusCode }
        );
    }

    // Handle generic errors
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';

    return NextResponse.json(
        {
            success: false,
            error: {
                message,
                code: 'INTERNAL_SERVER_ERROR',
            },
        },
        { status: 500 }
    );
}
