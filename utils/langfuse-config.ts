import { Langfuse } from 'langfuse';

/**
 * Lightweight Langfuse configuration for production monitoring
 * Focuses on: cost tracking, token usage, and tool execution monitoring
 */

// Initialize Langfuse client (singleton pattern)
let langfuseInstance: Langfuse | null = null;

/**
 * Get or create Langfuse instance
 * Returns null if environment variables are not configured
 */
export function getLangfuseClient(): Langfuse | null {
    // Return existing instance if already created
    if (langfuseInstance) {
        return langfuseInstance;
    }

    // Check if Langfuse is configured
    const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
    const secretKey = process.env.LANGFUSE_SECRET_KEY;
    const host = process.env.LANGFUSE_HOST;

    // If not configured, return null (graceful degradation)
    if (!publicKey || !secretKey) {
        console.log('[Langfuse] Not configured - monitoring disabled');
        return null;
    }

    try {
        langfuseInstance = new Langfuse({
            publicKey,
            secretKey,
            baseUrl: host || 'https://cloud.langfuse.com',
            // Minimal configuration for lightweight usage
            flushAt: 1, // Flush after each event for real-time monitoring
            flushInterval: 1000, // Flush every second
        });

        console.log('[Langfuse] Client initialized successfully');
        return langfuseInstance;
    } catch (error) {
        console.error('[Langfuse] Failed to initialize:', error);
        return null;
    }
}

/**
 * Flush pending events to Langfuse
 * Call this at the end of API routes to ensure data is sent
 */
export async function flushLangfuse(): Promise<void> {
    const client = getLangfuseClient();
    if (client) {
        try {
            await client.flushAsync();
        } catch (error) {
            console.error('[Langfuse] Failed to flush:', error);
        }
    }
}

/**
 * Shutdown Langfuse client
 * Call this during application shutdown
 */
export async function shutdownLangfuse(): Promise<void> {
    if (langfuseInstance) {
        try {
            await langfuseInstance.shutdownAsync();
            langfuseInstance = null;
        } catch (error) {
            console.error('[Langfuse] Failed to shutdown:', error);
        }
    }
}

/**
 * Check if Langfuse is enabled
 */
export function isLangfuseEnabled(): boolean {
    return getLangfuseClient() !== null;
}
