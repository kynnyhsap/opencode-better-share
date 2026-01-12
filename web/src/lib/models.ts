/**
 * Fetch model info from our API (proxies models.dev to avoid CORS)
 */

export interface ModelInfo {
  id?: string;
  name?: string;
  limit?: {
    context?: number;
    output?: number;
  };
  cost?: {
    input?: number;
    output?: number;
    cache_read?: number;
    cache_write?: number;
  };
}

// Cache for model info
const modelCache = new Map<string, ModelInfo | null>();

/**
 * Get model info by provider ID and model ID
 * Fetches from our API which proxies models.dev
 */
export async function getModelInfo(providerID: string, modelID: string): Promise<ModelInfo | null> {
  const cacheKey = `${providerID}/${modelID}`;

  if (modelCache.has(cacheKey)) {
    return modelCache.get(cacheKey) ?? null;
  }

  try {
    const response = await fetch(`/api/models/${providerID}/${encodeURIComponent(modelID)}`);

    if (!response.ok) {
      modelCache.set(cacheKey, null);
      return null;
    }

    const data = (await response.json()) as ModelInfo;
    modelCache.set(cacheKey, data);
    return data;
  } catch (err) {
    console.error("Failed to fetch model info:", err);
    modelCache.set(cacheKey, null);
    return null;
  }
}

/**
 * Calculate context usage percentage
 */
export function calculateContextPercentage(contextTokens: number, contextLimit: number): number {
  if (contextLimit === 0) return 0;
  return Math.round((contextTokens / contextLimit) * 100);
}
