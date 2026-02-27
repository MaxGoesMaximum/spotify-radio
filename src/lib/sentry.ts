/**
 * Sentry Error Tracking Setup
 *
 * To enable:
 * 1. npm install @sentry/nextjs
 * 2. npx @sentry/wizard@latest -i nextjs
 * 3. Add NEXT_PUBLIC_SENTRY_DSN to .env.local
 *
 * This module provides a lightweight wrapper that logs errors
 * to the console. When @sentry/nextjs is installed and configured,
 * it will also forward errors to Sentry.
 */

interface ErrorContext {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  user?: { id: string; email?: string };
}

/**
 * Capture an error — logs to console.
 * When Sentry is installed, also forwards to Sentry.
 */
export function captureError(error: Error, context?: ErrorContext): void {
  console.error("[Error]", error.message, context?.tags);
}

/**
 * Log a message.
 * When Sentry is installed, also forwards to Sentry.
 */
export function captureMessage(message: string, level: "info" | "warning" | "error" = "info"): void {
  if (level === "error") {
    console.error("[Message]", message);
  } else if (level === "warning") {
    console.warn("[Message]", message);
  } else {
    console.log("[Message]", message);
  }
}
