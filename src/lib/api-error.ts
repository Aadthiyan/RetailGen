export class ApiError extends Error {
    statusCode: number;
    code: string;

    constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_SERVER_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'ApiError';
    }

    static badRequest(message: string, code: string = 'BAD_REQUEST') {
        return new ApiError(message, 400, code);
    }

    static unauthorized(message: string = 'Unauthorized', code: string = 'UNAUTHORIZED') {
        return new ApiError(message, 401, code);
    }

    static forbidden(message: string = 'Forbidden', code: string = 'FORBIDDEN') {
        return new ApiError(message, 403, code);
    }

    static notFound(message: string = 'Not Found', code: string = 'NOT_FOUND') {
        return new ApiError(message, 404, code);
    }

    static internal(message: string = 'Internal Server Error', code: string = 'INTERNAL_SERVER_ERROR') {
        return new ApiError(message, 500, code);
    }
}
