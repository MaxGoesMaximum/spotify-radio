/**
 * Error Recovery Utility
 * Provides retry logic with exponential backoff for API calls
 */

interface RetryOptions {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    onRetry?: (attempt: number, error: Error) => void;
}

export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const {
        maxRetries = 3,
        initialDelay = 1000,
        maxDelay = 10000,
        backoffFactor = 2,
        onRetry,
    } = options;

    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            if (attempt === maxRetries) break;

            const delay = Math.min(
                initialDelay * Math.pow(backoffFactor, attempt),
                maxDelay
            );

            // Add jitter (±25%)
            const jitter = delay * (0.75 + Math.random() * 0.5);

            onRetry?.(attempt + 1, lastError);

            await new Promise((resolve) => setTimeout(resolve, jitter));
        }
    }

    throw lastError!;
}

/**
 * Fetch with automatic retry
 */
export async function fetchWithRetry(
    url: string,
    options?: RequestInit & { retryOptions?: RetryOptions }
): Promise<Response> {
    const { retryOptions, ...fetchOptions } = options || {};

    return withRetry(async () => {
        const response = await fetch(url, fetchOptions);

        // Retry on 5xx server errors and 429 rate limit
        if (response.status >= 500 || response.status === 429) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
    }, retryOptions);
}
