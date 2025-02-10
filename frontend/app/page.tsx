'use client';

import { ChatBox } from '@/components/ChatBox/ChatBox';
import { useChatState } from '@/components/ChatStateProvider';
import { useHostConfig } from '@/hooks/useHostConfig';

export default function Home() {
  const { messages, handleSendMessage, isGenerating } = useChatState();
  const hostConfig = useHostConfig();

  return (
    <main className="flex-1">
      <ChatBox
        messages={messages}
        onSendMessage={handleSendMessage}
        isGenerating={isGenerating}
        modelName={hostConfig.modelName || 'AI Assistant'}
        isNewChat={messages.length === 0}
      />
    </main>
  );
}
