'use client';

import { useEffect, useState } from 'react';
import { Plus, MessageSquare, Trash2, Settings } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatHistoryDB, ChatHistory } from '@/lib/indexdb';
import Link from 'next/link';

interface ChatSidebarProps {
  onNewChat: () => void;
  currentChatId?: string;
  onSelectChat: (chatId: string) => void;
}

export function ChatSidebar({ onNewChat, currentChatId, onSelectChat }: ChatSidebarProps) {
  const [chats, setChats] = useState<ChatHistory[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    const allChats = await chatHistoryDB.getAllChats();
    setChats(allChats.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ));
  };

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    await chatHistoryDB.deleteChat(id);
    await loadChats();
    if (id === currentChatId) {
      onNewChat();
    }
  };

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b px-4 py-2 flex justify-between items-center">
        <Button 
          onClick={onNewChat} 
          className="justify-start"
          variant="ghost"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
        <Link href="/settings">
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-5rem)]">
          <div className="space-y-1 p-2">
            {chats.map((chat) => (
              <Button
                key={chat.id}
                variant={currentChatId === chat.id ? "secondary" : "ghost"}
                className="w-full justify-start relative group"
                onClick={() => onSelectChat(chat.id)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                <span className="truncate">{chat.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 opacity-0 group-hover:opacity-100"
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
} 