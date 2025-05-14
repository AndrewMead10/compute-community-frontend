import { Message } from '@/components/ChatBox/types';

interface OpenRouterMessage {
  role: string;
  content: string;
}

interface OpenRouterResponse {
  choices: {
    message: OpenRouterMessage;
  }[];
}

interface OpenRouterConfig {
  baseUrl: string;
  apiKey: string | null;
  modelName: string;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
}

export async function checkHostHealth(baseUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/health`);
    return response.status === 200;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

export async function getOpenRouterCompletion(
  messages: Message[],
  config: OpenRouterConfig
): Promise<string> {
  const { baseUrl, apiKey, modelName } = config;

  if (!apiKey) {
    throw new Error('OpenRouter API key not found. Please configure it in settings.');
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Compute Community Chat',
      },
      body: JSON.stringify({
        model: modelName,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    const data: OpenRouterResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenRouter:', error);
    throw error;
  }
}

export async function getOpenRouterStreamingCompletion(
  messages: Message[],
  onToken: (token: string) => void,
  config: OpenRouterConfig,
  signal?: AbortSignal
): Promise<void> {
  const { baseUrl, apiKey, modelName } = config;

  if (!apiKey) {
    throw new Error('OpenRouter API key not found. Please configure it in settings.');
  }

  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Compute Community Chat',
      },
      body: JSON.stringify({
        model: modelName,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        stream: true,
      }),
      signal: signal,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Response body is null');
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const token = parsed.choices[0]?.delta?.content;
              if (token) {
                onToken(token);
              }
            } catch (e) {
              console.error('Error parsing streaming response:', e);
            }
          }
        }
      }
    } catch (error) {
      // Rethrow the error unless it's an abort error
      if (error instanceof Error && 
          error.name !== 'AbortError' && 
          !error.message.includes('BodyStreamBuffer was aborted')) {
        throw error;
      }
      // Otherwise, it's a normal abort, which we can just ignore
      console.log('Stream reading was aborted by user');
    }
  } catch (error) {
    console.error('Error calling OpenRouter:', error);
    // Don't rethrow AbortError since that's expected behavior when stopping
    if (error instanceof Error && 
        error.name !== 'AbortError' && 
        !error.message.includes('BodyStreamBuffer was aborted')) {
      throw error;
    }
  }
}

export async function getAvailableModels(baseUrl: string, apiKey: string): Promise<OpenRouterModel[]> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Compute Community Chat',
    };

    // Only include ngrok-skip-browser-warning header if not using OpenRouter
    if (!baseUrl.includes('openrouter')) {
      headers['ngrok-skip-browser-warning'] = 'true';
    }

    const response = await fetch(`${baseUrl}/v1/models`, {
      method: 'GET',
      headers: headers,
    });

    if (response.status >= 500) {
      throw new Error('Server is down');
    }
    if (response.status >= 400) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Different APIs might have different response formats
    if (baseUrl.includes('openrouter')) {
      // OpenRouter format
      return (data.data || []).map((model: any) => ({
        id: model.id,
        name: model.name,
        description: model.description || ''
      }));
    } else {
      // Handle different API response formats

      // Case 1: Standard OpenAI-like format with data array
      if (Array.isArray(data.data)) {
        return data.data.map((model: any) => ({
          id: model.id || model.model || '',
          name: model.name || model.id || model.model || 'Unknown Model',
          description: model.description || ''
        }));
      }

      // Case 2: Direct array format
      else if (Array.isArray(data)) {
        return data.map((model: any) => ({
          id: model.id || model.model || '',
          name: model.name || model.id || model.model || 'Unknown Model',
          description: model.description || ''
        }));
      }

      // Case 3: Object with models property
      else if (data.models && Array.isArray(data.models)) {
        return data.models.map((model: any) => ({
          id: model.id || model.model || '',
          name: model.name || model.id || model.model || 'Unknown Model',
          description: model.description || ''
        }));
      }

      // Case 4: OpenAI format
      else if (data.object === 'list' && Array.isArray(data.data)) {
        return data.data.map((model: any) => ({
          id: model.id,
          name: model.id.split(':')[0] || model.id,
          description: ''
        }));
      }

      // Default case - return empty array with a console error
      console.error('Unknown API response format:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
}