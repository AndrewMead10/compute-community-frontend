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

export async function getOpenRouterCompletion(messages: Message[]): Promise<string> {
  const baseUrl = localStorage.getItem('openrouter_base_url') || 'https://openrouter.ai/api/v1';
  const apiKey = localStorage.getItem('openrouter_api_key');

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
        'X-Title': 'Compute Community Chat', // Replace with your app name
      },
      body: JSON.stringify({
        model: 'AMead10/SuperNova-Medius-AWQ', // You can make this configurable
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
  onToken: (token: string) => void
): Promise<void> {
  const baseUrl = localStorage.getItem('openrouter_base_url') || 'https://openrouter.ai/api/v1';
  const apiKey = localStorage.getItem('openrouter_api_key');

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
        model: 'AMead10/SuperNova-Medius-AWQ',
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        stream: true,
      }),
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
    console.error('Error calling OpenRouter:', error);
    throw error;
  }
} 