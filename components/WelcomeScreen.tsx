'use client';

import React, { useState } from 'react';
import { ArrowUp, Sparkles, Code, HelpCircle, BookOpen } from 'lucide-react';
import { MessageInput } from '@/components/ChatBox/MessageInput';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onSendMessage: (message: string) => void;
  isGenerating: boolean;
  allowFileUpload?: boolean;
  onFileUpload?: (file: File) => void;
  allowAudioInput?: boolean;
  onAudioInput?: (audio: Blob) => Promise<string>;
  webSearchEnabled?: boolean;
  onToggleWebSearch?: () => void;
}

const ExamplePrompt: React.FC<{ icon: React.ReactNode; text: string; onClick: () => void }> = ({
  icon,
  text,
  onClick
}) => (
  <Button
    variant="outline"
    className="h-auto py-4 px-4 flex items-start gap-3 hover:bg-accent text-left justify-start"
    onClick={onClick}
  >
    <div className="flex-shrink-0 mt-0.5">{icon}</div>
    <span className="text-sm break-words whitespace-normal">{text}</span>
  </Button>
);

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSendMessage,
  isGenerating,
  allowFileUpload = false,
  onFileUpload,
  allowAudioInput = false,
  onAudioInput,
  webSearchEnabled = false,
  onToggleWebSearch
}) => {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[] | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isGenerating) {
      onSendMessage(input.trim());
      setInput('');
      setFiles(null);
    }
  };

  const examplePrompts = [
    {
      icon: <Sparkles className="h-5 w-5" />,
      text: "Marketing plan for a meditation app",
      onClick: () => onSendMessage("Create a marketing plan for a new mobile meditation app targeting busy professionals")
    },
    {
      icon: <Code className="h-5 w-5" />,
      text: "Explain React hooks with examples",
      onClick: () => onSendMessage("Explain how React hooks work and provide examples of useState and useEffect")
    },
    {
      icon: <HelpCircle className="h-5 w-5" />,
      text: "Best ways to learn a new language",
      onClick: () => onSendMessage("What are the most effective strategies for learning a new language?")
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      text: "Summarize latest climate change report",
      onClick: () => onSendMessage("Summarize the key points of the latest climate change report")
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center px-3 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 text-center">What's on your mind today?</h1>
        
        <div className="w-full mb-6 sm:mb-8">
          <form onSubmit={handleSubmit} className="w-full">
            {allowFileUpload ? (
              <MessageInput
                value={input}
                onChange={(e) => setInput(e.target.value)}
                isGenerating={isGenerating}
                allowAttachments={true}
                files={files}
                setFiles={setFiles}
                placeholder="Ask anything..."
                webSearchEnabled={webSearchEnabled}
                onToggleWebSearch={onToggleWebSearch}
                allowAudioInput={allowAudioInput}
                onAudioInput={onAudioInput}
                submitOnEnter={true}
              />
            ) : (
              <MessageInput
                value={input}
                onChange={(e) => setInput(e.target.value)}
                isGenerating={isGenerating}
                allowAttachments={false}
                placeholder="Ask anything..."
                webSearchEnabled={webSearchEnabled}
                onToggleWebSearch={onToggleWebSearch}
                allowAudioInput={allowAudioInput}
                onAudioInput={onAudioInput}
                submitOnEnter={true}
              />
            )}
          </form>
        </div>
        
        <div className="w-full mt-2 sm:mt-4">
          <h2 className="text-base sm:text-lg font-medium mb-2 sm:mb-3 text-center">Try asking about...</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full">
            {examplePrompts.map((prompt, index) => (
              <ExamplePrompt
                key={index}
                icon={prompt.icon}
                text={prompt.text}
                onClick={prompt.onClick}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 