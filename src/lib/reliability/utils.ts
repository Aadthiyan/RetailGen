/**
 * Reliability Utilities
 * 
 * Implements patterns for robust service interaction:
 * - Retry with exponential backoff
 * - Circuit Breaker
 * - Timeout handling
 */

// Retry Configuration
interface RetryOptions {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
    timeout?: number;
    onRetry?: (error: any, attempt: number) => void;
    shouldRetry?: (error: any) => boolean;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    factor: 2,
    timeout: 30000,
    onRetry: () => { },
    shouldRetry: () => true,
};

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
    let attempt = 0;
    let delay = opts.initialDelay;

    while (true) {
        try {
            // Execute with timeout
            return await withTimeout(fn, opts.timeout);
        } catch (error: any) {
            attempt++;

            // Check if we should stop retrying
            if (
                attempt > opts.maxRetries ||
                !opts.shouldRetry(error)
            ) {
                throw error;
            }

            // Notify retry
            opts.onRetry(error, attempt);

            // Wait before next attempt
            await sleep(delay);

            // Calculate next delay (exponential backoff)
            delay = Math.min(delay * opts.factor, opts.maxDelay);
        }
    }
}

/**
 * Execute a function with timeout
 */
export function withTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number
): Promise<T> {
    return Promise.race([
        fn(),
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
        ),
    ]);
}

/**
 * Sleep utility
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Circuit Breaker Configuration
interface CircuitBreakerOptions {
    failureThreshold?: number; // Number of failures before opening
    resetTimeout?: number; // Time to wait before trying to close (half-open)
    fallback?: () => any; // Fallback function
}

enum CircuitState {
    CLOSED, // Normal operation
    OPEN, // Failing, fast fail
    HALF_OPEN, // Testing if service recovered
}

/**
 * Circuit Breaker Pattern
 */
export class CircuitBreaker {
    private state: CircuitState = CircuitState.CLOSED;
    private failures: number = 0;
    private lastFailureTime: number = 0;
    private options: Required<CircuitBreakerOptions>;

    constructor(options: CircuitBreakerOptions = {}) {
        this.options = {
            failureThreshold: 5,
            resetTimeout: 60000, // 1 minute
            fallback: () => { throw new Error('Service unavailable (Circuit Breaker Open)'); },
            ...options,
        };
    }

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === CircuitState.OPEN) {
            if (Date.now() - this.lastFailureTime > this.options.resetTimeout) {
                this.state = CircuitState.HALF_OPEN;
            } else {
                return this.options.fallback();
            }
        }

        try {
            const result = await fn();

            if (this.state === CircuitState.HALF_OPEN) {
                this.reset();
            }

            return result;
        } catch (error) {
            this.recordFailure();
            throw error;
        }
    }

    private recordFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();

        if (this.failures >= this.options.failureThreshold) {
            this.state = CircuitState.OPEN;
        }
    }

    private reset() {
        this.state = CircuitState.CLOSED;
        this.failures = 0;
    }

    getState(): CircuitState {
        return this.state;
    }
}

// Global Circuit Breakers for External Services
export const openAICircuitBreaker = new CircuitBreaker({ failureThreshold: 5, resetTimeout: 30000 });
export const replicateCircuitBreaker = new CircuitBreaker({ failureThreshold: 3, resetTimeout: 60000 });
export const cloudinaryCircuitBreaker = new CircuitBreaker({ failureThreshold: 5, resetTimeout: 30000 });
