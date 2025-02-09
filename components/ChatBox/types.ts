export type MessageRole = 'user' | 'assistant';

export interface Message {
    role: MessageRole;
    content: string;
    thinking?: string;
}

export interface ChatBoxProps {
    messages: Message[];
    onSendMessage: (message: string) => void;
    onRegenerateMessage?: () => void;
    onLike?: () => void;
    onDislike?: () => void;
    generateAudio?: (text: string) => Promise<void>;
    isGenerating?: boolean;
    modelName?: string;
    webSearchEnabled?: boolean;
    onToggleWebSearch?: () => void;
    allowFileUpload?: boolean;
    onFileUpload?: (file: File) => void;
    allowAudioInput?: boolean;
    onAudioInput?: (audio: Blob) => Promise<string>;
    thinkingTokens?: {
        start: string;
        end: string;
    };
    className?: string;
    isNewChat?: boolean;
} 