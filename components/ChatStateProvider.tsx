'use client';

import { createContext, useContext, useEffect, useState } from 'react';
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

  const getSystemPrompt = (): string | null => {
    return localStorage.getItem(SYSTEM_PROMPT_KEY);
  };

  useEffect(() => {
    const loadInitialChat = async () => {
      const chats = await chatHistoryDB.getAllChats();
      if (chats.length > 0) {
        const mostRecentChat = chats.sort((a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )[0];

        setCurrentChatId(mostRecentChat.id);
        setMessages(mostRecentChat.messages);
      }
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

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = { role: 'user', content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsGenerating(true);

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
        }
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
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}. Please check your API settings.`,
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
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
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
} 