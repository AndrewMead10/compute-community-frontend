'use client';

import { useEffect, useState } from 'react';
import { Plus, MessageSquare, Trash2, Settings } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatHistoryDB, ChatHistory } from '@/lib/indexdb';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ModelSelector } from '@/components/ModelSelector';

interface ChatSidebarProps {
  onNewChat: () => void;
  currentChatId?: string;
  onSelectChat: (chatId: string) => void;
  onToggleSettings: () => void;
  onToggleSystemPromptSettings: () => void;
  currentModel: string | null;
  modelError: string | null;
  onModelSelect: (modelId: string) => void;
  baseUrl: string;
  apiKey: string;
}

export function ChatSidebar({
  onNewChat,
  currentChatId,
  onSelectChat,
  onToggleSettings,
  onToggleSystemPromptSettings,
  currentModel,
  modelError,
  onModelSelect,
  baseUrl,
  apiKey
}: ChatSidebarProps) {
  const [chats, setChats] = useState<ChatHistory[]>([]);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const { setOpenMobile, isMobile } = useSidebar();

  useEffect(() => {
    loadChats();
  }, [currentChatId]);

  const loadChats = async () => {
    const allChats = await chatHistoryDB.getAllChats();
    setChats(allChats.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ));
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setChatToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!chatToDelete) return;

    await chatHistoryDB.deleteChat(chatToDelete);
    if (chatToDelete === currentChatId) {
      onNewChat();
    } else {
      loadChats();
    }
    setChatToDelete(null);
  };

  const handleSettingsClick = () => {
    onToggleSettings();
  };

  const handleSystemPromptSettingsClick = () => {
    onToggleSystemPromptSettings();
  };

  const handleNewChatClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
    onNewChat();
  };

  const handleModelSelect = (modelId: string) => {
    onModelSelect(modelId);
  };

  // Handle model selection without closing sidebar on mobile
  const handleSelectModel = (modelId: string) => {
    onModelSelect(modelId);
  };

  return (
    <>
      <Dialog open={chatToDelete !== null} onOpenChange={(open) => !open && setChatToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chat? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChatToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sidebar className="border-r">
        <SidebarHeader className="border-b p-2">
          <div className="px-2 mb-2">
            {modelError ? (
              <span className="text-destructive text-sm">{modelError}</span>
            ) : !baseUrl || !apiKey ? (
              <span className="text-muted-foreground text-sm">No API configured</span>
            ) : (
              <ModelSelector
                baseUrl={baseUrl}
                apiKey={apiKey}
                onModelSelect={handleSelectModel}
                defaultModelId={currentModel || undefined}
                compact={false}
              />
            )}
          </div>
          <Button
            onClick={handleNewChatClick}
            className="w-full justify-start"
            variant="default"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </SidebarHeader>
        <SidebarContent>
          <ScrollArea className="h-[calc(100vh-13rem)]">
            <div className="space-y-1 p-2">
              {chats.map((chat) => (
                <Button
                  key={chat.id}
                  variant={currentChatId === chat.id ? "secondary" : "ghost"}
                  className={`w-full justify-start relative group overflow-hidden ${currentChatId === chat.id ? 'bg-sidebar-accent hover:cursor-default hover:bg-sidebar-accent' : 'hover:bg-sidebar-accent'}`}
                  onClick={() => onSelectChat(chat.id)}
                >
                  <div className="flex w-[210px] pr-8">
                    <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {chat.title}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 hover:bg-sidebar-accent hover:text-destructive ${currentChatId === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    onClick={(e) => handleDeleteClick(chat.id, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="border-t space-y-2 p-2">
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-sidebar-accent"
            onClick={handleSystemPromptSettingsClick}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-sidebar-accent"
            onClick={handleSettingsClick}
          >
            <Settings className="mr-2 h-4 w-4" />
            Configure Hosts
          </Button>
        </SidebarFooter>
      </Sidebar>
    </>
  );
} 