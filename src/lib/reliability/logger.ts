/**
 * Structured Logging Utility
 * 
 * Centralized logging for the application.
 * Supports log levels, context, and external service integration.
 */

export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
}

interface LogEntry {
    level: LogLevel;
    message: string;
    context?: Record<string, any>;
    timestamp: string;
    environment: string;
}

class Logger {
    private static instance: Logger;
    private environment: string = process.env.NODE_ENV || 'development';

    private constructor() { }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private formatEntry(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
        return {
            level,
            message,
            context: this.sanitizeContext(context),
            timestamp: new Date().toISOString(),
            environment: this.environment,
        };
    }

    private sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
        if (!context) return undefined;

        // Deep copy to avoid mutation
        const sanitized = JSON.parse(JSON.stringify(context));

        // Mask sensitive fields
        const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization', 'credit_card'];

        const mask = (obj: any) => {
            for (const key in obj) {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    mask(obj[key]);
                } else if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
                    obj[key] = '***MASKED***';
                }
            }
        };

        mask(sanitized);
        return sanitized;
    }

    private output(entry: LogEntry) {
        if (this.environment === 'test') return;

        const output = JSON.stringify(entry);

        switch (entry.level) {
            case LogLevel.DEBUG:
                if (this.environment === 'development') console.debug(output);
                break;
            case LogLevel.INFO:
                console.info(output);
                break;
            case LogLevel.WARN:
                console.warn(output);
                break;
            case LogLevel.ERROR:
                console.error(output);
                // Here you would integrate with Sentry/Datadog
                // captureException(new Error(entry.message), { extra: entry.context });
                break;
        }
    }

    public debug(message: string, context?: Record<string, any>) {
        this.output(this.formatEntry(LogLevel.DEBUG, message, context));
    }

    public info(message: string, context?: Record<string, any>) {
        this.output(this.formatEntry(LogLevel.INFO, message, context));
    }

    public warn(message: string, context?: Record<string, any>) {
        this.output(this.formatEntry(LogLevel.WARN, message, context));
    }

    public error(message: string, error?: Error | unknown, context?: Record<string, any>) {
        const errorContext = {
            ...context,
            error: error instanceof Error ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
            } : error,
        };
        this.output(this.formatEntry(LogLevel.ERROR, message, errorContext));
    }
}

export const logger = Logger.getInstance();
