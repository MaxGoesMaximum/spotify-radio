/**
 * Error Recovery Utility
 * Provides retry logic with exponential backoff for API calls
 */

interface RetryOptions {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    /** Custom predicate to decide if an error should trigger a retry */
    shouldRetry?: (error: Error) => boolean;
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
        shouldRetry,
        onRetry,
    } = options;

    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            if (attempt === maxRetries) break;

            // If a shouldRetry predicate is provided, check it
            if (shouldRetry && !shouldRetry(lastError)) break;

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
 * Check if an HTTP status code is retryable.
 * 401/403 are NOT retryable (auth issues won't self-heal).
 * 429 and 5xx ARE retryable.
 */
function isRetryableStatus(status: number): boolean {
    if (status === 401 || status === 403) return false;
    return status >= 500 || status === 429;
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

        if (!response.ok && isRetryableStatus(response.status)) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
    }, retryOptions);
}
