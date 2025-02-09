'use client';

import { ChatBox } from '@/components/ChatBox/ChatBox';
import { useChatState } from '@/components/ChatStateProvider';

export default function Home() {
  const { messages, handleSendMessage, isGenerating } = useChatState();

  return (
    <main className="flex-1">
      <ChatBox
        messages={messages}
        onSendMessage={handleSendMessage}
        isGenerating={isGenerating}
        modelName="AI Assistant"
        isNewChat={messages.length === 0}
      />
    </main>
  );
}
