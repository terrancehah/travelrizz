import { getLangfuseClient } from './langfuse-config';

/**
 * Prompt Management Utility
 * Manages AI prompts with versioning through Langfuse
 */

export interface PromptVersion {
    name: string;
    version: number;
    prompt: string;
    config?: {
        temperature?: number;
        maxTokens?: number;
        model?: string;
    };
    labels?: string[];
}

/**
 * Fetch a prompt from Langfuse by name
 * Falls back to hardcoded prompt if Langfuse is not available
 */
export async function getPrompt(
    promptName: string,
    fallbackPrompt: string,
    version?: number
): Promise<{ prompt: string; config: any; version: number }> {
    const client = getLangfuseClient();
    
    if (!client) {
        console.log(`[PromptManager] Langfuse not configured, using fallback prompt for ${promptName}`);
        return {
            prompt: fallbackPrompt,
            config: {},
            version: 0,
        };
    }

    try {
        // Fetch prompt from Langfuse
        const promptData = await client.getPrompt(promptName, version);
        
        if (promptData) {
            console.log(`[PromptManager] Loaded prompt "${promptName}" v${promptData.version} from Langfuse`);
            return {
                prompt: promptData.prompt,
                config: promptData.config || {},
                version: promptData.version,
            };
        }
    } catch (error) {
        console.error(`[PromptManager] Failed to fetch prompt "${promptName}":`, error);
    }

    // Fallback to hardcoded prompt
    console.log(`[PromptManager] Using fallback prompt for ${promptName}`);
    return {
        prompt: fallbackPrompt,
        config: {},
        version: 0,
    };
}

/**
 * Create or update a prompt in Langfuse
 * This is typically done through the Langfuse UI, but can be done programmatically
 */
export async function createPrompt(
    name: string,
    prompt: string,
    config?: any,
    labels?: string[]
): Promise<boolean> {
    const client = getLangfuseClient();
    
    if (!client) {
        console.error('[PromptManager] Cannot create prompt - Langfuse not configured');
        return false;
    }

    try {
        // Note: Langfuse SDK doesn't have direct prompt creation API
        // Prompts should be created through the Langfuse UI
        console.log(`[PromptManager] To create/update prompt "${name}", use the Langfuse UI at ${process.env.LANGFUSE_HOST}`);
        return false;
    } catch (error) {
        console.error('[PromptManager] Failed to create prompt:', error);
        return false;
    }
}

/**
 * List all available prompts
 * Returns prompt names and their latest versions
 */
export async function listPrompts(): Promise<Array<{ name: string; version: number }>> {
    const client = getLangfuseClient();
    
    if (!client) {
        return [];
    }

    try {
        // Note: Langfuse SDK doesn't have a list prompts API
        // This would need to be done through the Langfuse API directly
        console.log('[PromptManager] To view all prompts, visit the Langfuse UI');
        return [];
    } catch (error) {
        console.error('[PromptManager] Failed to list prompts:', error);
        return [];
    }
}

/**
 * Track prompt usage in a trace
 * Links the prompt version to the conversation for analytics
 */
export function trackPromptUsage(
    traceId: string,
    promptName: string,
    promptVersion: number,
    variables?: Record<string, any>
) {
    const client = getLangfuseClient();
    
    if (!client) return;

    try {
        const trace = client.trace({ id: traceId });
        
        trace.event({
            name: 'prompt-usage',
            metadata: {
                promptName,
                promptVersion,
                variables,
            },
        });
    } catch (error) {
        console.error('[PromptManager] Failed to track prompt usage:', error);
    }
}

/**
 * Predefined prompt names for the application
 */
export const PROMPT_NAMES = {
    SYSTEM_STATIC: 'travel-rizz-system-static',
    SYSTEM_DYNAMIC: 'travel-rizz-system-dynamic',
    QUICK_RESPONSE: 'travel-rizz-quick-response',
} as const;
