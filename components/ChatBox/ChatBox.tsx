'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Message, ChatBoxProps } from './types';
import { cn } from '@/lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useTheme } from 'next-themes';
import {
    Copy,
    CheckCheck,
    Volume2,
    RefreshCw,
    ThumbsUp,
    ThumbsDown,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { MessageInput } from './MessageInput';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { WelcomeScreen } from '@/components/WelcomeScreen';

export const ChatBox: React.FC<ChatBoxProps> = ({
    messages,
    onSendMessage,
    onRegenerateMessage,
    onLike,
    onDislike,
    generateAudio,
    isGenerating = false,
    modelName,
    webSearchEnabled = false,
    onToggleWebSearch,
    allowFileUpload = false,
    onFileUpload,
    allowAudioInput = false,
    onAudioInput,
    thinkingTokens = { start: '<think>', end: '</think>' },
    className,
    isNewChat = false,
    stop,
}) => {
    const [input, setInput] = useState('');
    const [files, setFiles] = useState<File[] | null>(null);
    const [autoScroll, setAutoScroll] = useState(true);
    const [hasScrolled, setHasScrolled] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

    // Handle auto-scrolling
    useEffect(() => {
        if (autoScroll && chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, autoScroll]);

    // Handle scroll events - memoize this callback
    const handleScroll = useCallback(() => {
        if (!chatContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        setAutoScroll(scrollTop + clientHeight >= scrollHeight - 10);
        setHasScrolled(scrollTop > 0);
    }, []);

    // Handle message submission - memoize this callback
    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isGenerating) return;

        // Handle file uploads if present
        if (files && files.length > 0 && onFileUpload) {
            files.forEach((file) => onFileUpload(file));
        }

        onSendMessage(input.trim());
        setInput('');
        setFiles(null);
        setAutoScroll(true);
    }, [input, isGenerating, files, onFileUpload, onSendMessage]);

    // Handle copy functionality - memoize this callback
    const handleCopy = useCallback(async (text: string, key: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedStates(prev => ({ ...prev, [key]: true }));
        setTimeout(() => {
            setCopiedStates(prev => ({ ...prev, [key]: false }));
        }, 2000);
    }, []);

    // Handlers for message component actions - memoize these callbacks
    const handleRegenerateMessage = useCallback(() => {
        if (onRegenerateMessage) onRegenerateMessage();
    }, [onRegenerateMessage]);

    const handleLike = useCallback(() => {
        if (onLike) onLike();
    }, [onLike]);

    const handleDislike = useCallback(() => {
        if (onDislike) onDislike();
    }, [onDislike]);

    const handleGenerateAudio = useCallback(async (text: string) => {
        if (generateAudio) await generateAudio(text);
    }, [generateAudio]);

    // Memoize container classes to prevent recalculation on every render
    const containerClasses = useMemo(() => 
        cn('flex flex-col w-full h-full overflow-hidden', className),
    [className]);

    const messageContainerClasses = useMemo(() => 
        cn('flex-1 overflow-y-auto p-4 space-y-4 h-full'),
    []);

    // Memoize the gradient overlay style
    const gradientStyle = useMemo(() => 
        cn(
            'absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent pointer-events-none z-10 transition-opacity duration-200',
            hasScrolled ? 'opacity-100' : 'opacity-0'
        ),
    [hasScrolled]);

    // If it's a new chat, render the welcome screen
    if (isNewChat) {
        return (
            <div className={containerClasses}>
                <WelcomeScreen
                    onSendMessage={onSendMessage}
                    isGenerating={isGenerating}
                    allowFileUpload={allowFileUpload}
                    onFileUpload={onFileUpload}
                    allowAudioInput={allowAudioInput}
                    onAudioInput={onAudioInput}
                    webSearchEnabled={webSearchEnabled}
                    onToggleWebSearch={onToggleWebSearch}
                />
            </div>
        );
    }

    return (
        <div className={containerClasses}>
            <div className="relative flex-1 overflow-hidden">
                <div className={gradientStyle} />
                <div
                    ref={chatContainerRef}
                    onScroll={handleScroll}
                    className={messageContainerClasses}
                    style={{ overflowY: 'auto', maxHeight: '100%' }}
                >
                    <div className="max-w-4xl mx-auto">
                        {messages.map((message, index) => (
                            <MemoizedMessageComponent
                                key={`${message.role}-${index}`}
                                message={message}
                                onCopy={handleCopy}
                                copiedStates={copiedStates}
                                onRegenerateMessage={handleRegenerateMessage}
                                onLike={handleLike}
                                onDislike={handleDislike}
                                generateAudio={handleGenerateAudio}
                                modelName={message.role === 'assistant' ? (message.modelName || modelName) : undefined}
                                thinkingTokens={thinkingTokens}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="p-4">
                        <MessageInput
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            isGenerating={isGenerating}
                            allowAttachments={allowFileUpload}
                            files={files}
                            setFiles={setFiles}
                            placeholder="Type a message..."
                            webSearchEnabled={webSearchEnabled}
                            onToggleWebSearch={onToggleWebSearch}
                            allowAudioInput={allowAudioInput}
                            onAudioInput={onAudioInput}
                            stop={stop}
                        />
                    </form>
                </div>
            </div>
        </div>
    );
};

interface MessageComponentProps {
    message: Message;
    onCopy: (text: string, key: string) => void;
    copiedStates: { [key: string]: boolean };
    onRegenerateMessage?: () => void;
    onLike?: () => void;
    onDislike?: () => void;
    generateAudio?: (text: string) => Promise<void>;
    modelName?: string;
    thinkingTokens: { start: string; end: string };
}

const MessageComponent: React.FC<MessageComponentProps> = ({
    message,
    onCopy,
    copiedStates,
    onRegenerateMessage,
    onLike,
    onDislike,
    generateAudio,
    modelName,
    thinkingTokens,
}) => {
    const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);
    const [mounted, setMounted] = useState(false);
    const messageKey = `${message.role}-${message.content.substring(0, 20)}`;
    const { theme } = useTheme();
    
    // Extract thinking content using thinkingTokens
    const extractThinkingContent = useCallback((content: string) => {
        if (!content) return { thinking: null, mainContent: content };
        
        const startToken = thinkingTokens.start;
        const endToken = thinkingTokens.end;
        
        if (!content.includes(startToken)) return { thinking: null, mainContent: content };
        
        const startIndex = content.indexOf(startToken);
        const endIndex = content.indexOf(endToken, startIndex + startToken.length);
        
        // If we find a start token but no end token (during generation), 
        // consider everything after the start token as thinking
        if (endIndex === -1) {
            const thinking = content.substring(startIndex + startToken.length).trim();
            const mainContent = content.substring(0, startIndex).trim();
            return { thinking, mainContent };
        }
        
        const thinking = content.substring(startIndex + startToken.length, endIndex).trim();
        const mainContent = (content.substring(0, startIndex) + content.substring(endIndex + endToken.length)).trim();
        
        return { thinking, mainContent };
    }, [thinkingTokens]);

    // Set mounted state
    useEffect(() => {
        setMounted(true);
    }, []);

    // Extract thinking and main content
    const { thinking, mainContent } = useMemo(() => {
        return message.thinking 
            ? { thinking: message.thinking, mainContent: message.content }
            : extractThinkingContent(message.content);
    }, [message.thinking, message.content, extractThinkingContent]);
    
    // Check if thinking is empty
    const hasThinkingContent = useMemo(() => 
        Boolean(thinking && thinking.trim().length > 0),
    [thinking]);

    // Auto-expand thinking during generation if we have thinking content
    // and collapse it when thinking has ended
    useEffect(() => {
        if (thinking) {
            const isGeneratingThinking = hasThinkingContent && !message.content.includes(thinkingTokens.end);
            setIsThinkingExpanded(isGeneratingThinking);
        }
    }, [thinking, hasThinkingContent, message.content, thinkingTokens.end]);

    const renderMarkdown = useCallback((content: string) => {
        if (!content) return null;
        
        // Replace LaTeX delimiters
        const processedContent = content
            .replace(/\\\[/g, '$$')
            .replace(/\\\]/g, '$$')
            .replace(/\\\(/g, '$')
            .replace(/\\\)/g, '$');

        return (
            <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeKatex]}
                components={{
                    code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const key = `${messageKey}-${children}`;

                        // Don't render syntax highlighting until theme is available
                        if (!mounted) {
                            return <code {...props}>{children}</code>;
                        }

                        return match ? (
                            <div className="relative">
                                <SyntaxHighlighter
                                    language={match?.[1] || 'text'}
                                    PreTag="div"
                                    className="rounded-lg"
                                    style={theme === 'dark' ? vscDarkPlus : prism}
                                    children={String(children).replace(/\n$/, '')}
                                />
                                <button
                                    onClick={() => onCopy(String(children), key)}
                                    className="absolute top-2 right-2 p-1 rounded bg-primary/10 hover:bg-primary/20"
                                    title="Copy code"
                                >
                                    {copiedStates[key] ? (
                                        <CheckCheck className="w-4 h-4" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        ) : (
                            <code className="bg-muted px-1 py-0.5 rounded" {...props}>
                                {children}
                            </code>
                        );
                    },
                    p: ({ children }) => (
                        <p className={message.role === 'assistant' ? 'mb-4' : ''}>{children}</p>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal list-outside ml-6 space-y-1">{children}</ol>
                    ),
                    ul: ({ children }) => (
                        <ul className="list-disc list-outside ml-6 space-y-1">{children}</ul>
                    ),
                    li: ({ children }) => (
                        <li className="pl-1 mb-1">{children}</li>
                    ),
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-4 rounded-md border border-border">
                            <table className="border-collapse w-full">{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-muted/50">{children}</thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-border">{children}</tbody>
                    ),
                    tr: (props) => {
                        const { children, ...rest } = props;
                        return <tr className="hover:bg-muted/10 transition-colors" {...rest}>{children}</tr>;
                    },
                    th: ({ children }) => (
                        <th className="py-3 px-4 text-left font-medium border-b border-border">{children}</th>
                    ),
                    td: ({ children }) => (
                        <td className="py-3 px-4">{children}</td>
                    ),
                }}
                className="prose dark:prose-invert max-w-none prose-pre:p-0 prose-table:my-0 prose-table:overflow-hidden leading-7"
            >
                {processedContent}
            </ReactMarkdown>
        );
    }, [messageKey, mounted, theme, onCopy, copiedStates, message.role]);

    return (
        <div
            className={cn(
                'py-2.5 px-5 border-b text-md mt-2',
                message.role === 'assistant'
                    ? 'mr-4'
                    : 'bg-primary text-primary-foreground rounded-3xl max-w-[80%] ml-auto w-fit'
            )}
        >
            {hasThinkingContent && (
                <div className="mb-4">
                    <button
                        onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
                        className="flex items-center gap-1 text-md text-muted-foreground hover:text-foreground px-2 py-1 rounded-md"
                    >
                        {isThinkingExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                        <span>Thinking</span>
                    </button>
                    {isThinkingExpanded && thinking && (
                        <div className="mt-2 text-sm text-muted-foreground p-3 bg-muted/30 rounded-md border border-muted/50">
                            {renderMarkdown(thinking)}
                        </div>
                    )}
                </div>
            )}

            {mainContent && renderMarkdown(mainContent)}

            {message.role === 'assistant' && (
                <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        {onRegenerateMessage && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={onRegenerateMessage}
                                            className="p-1 hover:text-foreground"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Regenerate response</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                        {onLike && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={onLike}
                                            className="p-1 hover:text-foreground"
                                        >
                                            <ThumbsUp className="w-4 h-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Like response</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                        {onDislike && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={onDislike}
                                            className="p-1 hover:text-foreground"
                                        >
                                            <ThumbsDown className="w-4 h-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Dislike response</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                        {generateAudio && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => generateAudio(message.content)}
                                            className="p-1 hover:text-foreground"
                                        >
                                            <Volume2 className="w-4 h-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Generate audio</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => onCopy(message.content, messageKey)}
                                        className="p-1 hover:text-foreground"
                                    >
                                        {copiedStates[messageKey] ? (
                                            <CheckCheck className="w-4 h-4" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{copiedStates[messageKey] ? 'Copied!' : 'Copy message'}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    {modelName && (
                        <span className="text-xs">{modelName}</span>
                    )}
                </div>
            )}
        </div>
    );
};

// Memoized version of MessageComponent to prevent unnecessary re-renders
const MemoizedMessageComponent = React.memo(MessageComponent, (prevProps, nextProps) => {
    // Custom comparison function to determine if the component should re-render
    // Only re-render if essential props have changed
    return (
        prevProps.message.content === nextProps.message.content &&
        prevProps.message.role === nextProps.message.role &&
        prevProps.message.thinking === nextProps.message.thinking &&
        prevProps.modelName === nextProps.modelName &&
        // For copiedStates, only check the keys relevant to this message
        prevProps.copiedStates[`${prevProps.message.role}-${prevProps.message.content.substring(0, 20)}`] ===
        nextProps.copiedStates[`${nextProps.message.role}-${nextProps.message.content.substring(0, 20)}`]
    );
}); 