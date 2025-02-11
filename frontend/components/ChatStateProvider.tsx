'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/components/ChatBox/types';
import { chatHistoryDB, ChatHistory } from '@/lib/indexdb';
import { ChatSidebar } from '@/components/ChatSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getOpenRouterStreamingCompletion } from '@/lib/openrouter';
import { useHostConfig } from '@/hooks/useHostConfig';

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
  const [currentChatId, setCurrentChatId] = useState<string | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);
  const hostConfig = useHostConfig();

  useEffect(() => {
    // Load the most recent chat if exists
    const loadInitialChat = async () => {
      const chats = await chatHistoryDB.getAllChats();
      if (chats.length > 0) {
        const mostRecent = chats.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )[0];
        setCurrentChatId(mostRecent.id);
        setMessages(mostRecent.messages);
      }
    };
    loadInitialChat();
  }, []);

  const handleNewChat = () => {
    setCurrentChatId(undefined);
    setMessages([]);
  };

  const handleLoadChat = async (chatId: string) => {
    const chats = await chatHistoryDB.getAllChats();
    const chat = chats.find(c => c.id === chatId);
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
      // Create a placeholder message for streaming
      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
      };
      setMessages([...updatedMessages, assistantMessage]);

      let streamedContent = '';
      await getOpenRouterStreamingCompletion(
        updatedMessages,
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

      // Save to IndexDB
      const chatId = currentChatId || uuidv4();
      if (!currentChatId) {
        setCurrentChatId(chatId);
      }

      const finalMessages = [...updatedMessages, { role: 'assistant' as const, content: streamedContent }];
      const chatHistory: ChatHistory = {
        id: chatId,
        title: finalMessages[0].content.slice(0, 50) + (finalMessages[0].content.length > 50 ? '...' : ''),
        messages: finalMessages,
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
      <SidebarProvider>
        <ChatSidebar 
          onNewChat={handleNewChat} 
          currentChatId={currentChatId}
          onSelectChat={handleLoadChat}
        />
        {children}
      </SidebarProvider>
    </ChatContext.Provider>
  );
} 