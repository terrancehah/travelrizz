import { getLangfuseClient } from './langfuse-config';

/**
 * Helper utilities for Langfuse tracing
 * Lightweight implementation focusing on cost and tool monitoring
 */

/**
 * Track tool execution with Langfuse
 * Records tool name, input parameters, output, and execution time
 */
export function trackToolExecution(
    traceId: string,
    toolName: string,
    input: any,
    output: any,
    metadata?: Record<string, any>
) {
    const client = getLangfuseClient();
    if (!client) return;

    try {
        // Get or create trace
        const trace = client.trace({
            id: traceId,
            name: 'chat-interaction',
        });

        // Create a span for the tool execution
        trace.span({
            name: toolName,
            input,
            output,
            metadata: {
                toolType: 'ai-tool',
                ...metadata,
            },
        });
    } catch (error) {
        console.error('[Langfuse] Failed to track tool execution:', error);
    }
}

/**
 * Calculate token usage from OpenAI response
 * This is a helper to extract usage data
 */
export function extractTokenUsage(usage: any) {
    if (!usage) return null;

    return {
        promptTokens: usage.promptTokens || 0,
        completionTokens: usage.completionTokens || 0,
        totalTokens: usage.totalTokens || 0,
    };
}

/**
 * Calculate cost based on model and token usage
 * Prices as of 2025 for GPT-4o-mini
 */
export function calculateCost(model: string, usage: any): number {
    if (!usage) return 0;

    const promptTokens = usage.promptTokens || 0;
    const completionTokens = usage.completionTokens || 0;

    // Pricing per 1M tokens (as of 2025)
    const pricing: Record<string, { input: number; output: number }> = {
        'gpt-4o-mini': { input: 0.15, output: 0.60 }, // $0.15 / $0.60 per 1M tokens
        'gpt-4o': { input: 2.50, output: 10.00 },
        'deepseek-chat': { input: 0.14, output: 0.28 },
    };

    const modelPricing = pricing[model] || pricing['gpt-4o-mini'];

    // Calculate cost in dollars
    const inputCost = (promptTokens / 1_000_000) * modelPricing.input;
    const outputCost = (completionTokens / 1_000_000) * modelPricing.output;

    return inputCost + outputCost;
}

/**
 * Sanitize user data to remove PII before sending to Langfuse
 * This is a basic implementation - enhance as needed
 */
export function sanitizeForLogging(data: any): any {
    if (!data) return data;

    // Create a deep copy
    const sanitized = JSON.parse(JSON.stringify(data));

    // Remove sensitive fields (add more as needed)
    const sensitiveFields = ['email', 'phone', 'creditCard', 'password'];

    function recursiveSanitize(obj: any) {
        if (typeof obj !== 'object' || obj === null) return;

        for (const key in obj) {
            if (sensitiveFields.includes(key)) {
                obj[key] = '[REDACTED]';
            } else if (typeof obj[key] === 'object') {
                recursiveSanitize(obj[key]);
            }
        }
    }

    recursiveSanitize(sanitized);
    return sanitized;
}
