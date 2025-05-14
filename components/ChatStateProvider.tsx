'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/components/ChatBox/types';
import { chatHistoryDB, ChatHistory } from '@/lib/indexdb';
import { getOpenRouterStreamingCompletion } from '@/lib/openrouter';
import { useHostConfig } from '@/hooks/useHostConfig';

const SYSTEM_PROMPT_KEY = 'system_prompt';

interface ChatContextType {
  messages: Message[];
  currentChatId: string | undefined;
  isGenerating: boolean;
  handleNewChat: () => void;
  handleLoadChat: (chatId: string) => void;
  handleSendMessage: (content: string) => Promise<void>;
  stopGeneration: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChatState() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatState must be used within a ChatStateProvider');
  }
  return context;
}

export function ChatStateProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const hostConfig = useHostConfig();
  const abortControllerRef = useRef<AbortController | null>(null);

  const getSystemPrompt = (): string | null => {
    return localStorage.getItem(SYSTEM_PROMPT_KEY);
  };

  useEffect(() => {
    const loadInitialChat = async () => {
      // Start with a new chat instead of loading the most recent one
      handleNewChat();
    };

    loadInitialChat();
  }, []);

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(undefined);
  };

  const handleLoadChat = async (chatId: string) => {
    const chat = await chatHistoryDB.getChatById(chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = { role: 'user', content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsGenerating(true);

    // Create a new AbortController for this request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
      };
      setMessages([...updatedMessages, assistantMessage]);

      const systemPrompt = getSystemPrompt();
      const messagesWithSystemPrompt = systemPrompt
        ? [{ role: 'system', content: systemPrompt }, ...updatedMessages]
        : updatedMessages;

      let streamedContent = '';
      await getOpenRouterStreamingCompletion(
        messagesWithSystemPrompt as Message[],
        (token) => {
          streamedContent += token;
          setMessages(messages => {
            const lastMessage = messages[messages.length - 1];
            const updatedLastMessage: Message = {
              ...lastMessage,
              role: 'assistant',
              content: streamedContent,
            };
            return [...messages.slice(0, -1), updatedLastMessage];
          });
        },
        {
          baseUrl: hostConfig.baseUrl,
          apiKey: hostConfig.apiKey || null,
          modelName: hostConfig.modelName || 'AMead10/SuperNova-Medius-AWQ',
        },
        signal
      );

      const chatId = currentChatId || uuidv4();
      if (!currentChatId) {
        setCurrentChatId(chatId);
      }

      const finalMessages = [...updatedMessages, {
        role: 'assistant' as const,
        content: streamedContent,
        modelName: hostConfig.modelName || 'AMead10/SuperNova-Medius-AWQ'
      }];
      setMessages(finalMessages);
      const chatHistory: ChatHistory = {
        id: chatId,
        title: finalMessages[0].content.slice(0, 50) + (finalMessages[0].content.length > 50 ? '...' : ''),
        messages: finalMessages as Message[],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await chatHistoryDB.saveChat(chatHistory);
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Only show error message if it's not an AbortError (user cancellation)
      if (error instanceof Error && 
          (error.name !== 'AbortError' && 
           !error.message.includes('BodyStreamBuffer was aborted'))) {
        const errorMessage: Message = {
          role: 'assistant',
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}. Please check your API settings.`,
        };
        setMessages([...updatedMessages, errorMessage]);
      }
    } finally {
      // Always clean up the abort controller reference
      if (abortControllerRef.current?.signal === signal) {
        abortControllerRef.current = null;
      }
      setIsGenerating(false);
    }
  };

  const value = {
    messages,
    currentChatId,
    isGenerating,
    handleNewChat,
    handleLoadChat,
    handleSendMessage,
    stopGeneration,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
} 