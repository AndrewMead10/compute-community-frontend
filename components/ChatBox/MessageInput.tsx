'use client';

import React, { useRef, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, FileIcon, Paperclip, Square, X, Globe, Mic } from 'lucide-react';
import { omit } from 'remeda';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from '@/components/ui/tooltip';

interface MessageInputBaseProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    value: string;
    submitOnEnter?: boolean;
    stop?: () => void;
    isGenerating: boolean;
    webSearchEnabled?: boolean;
    onToggleWebSearch?: () => void;
    allowAudioInput?: boolean;
    onAudioInput?: (audio: Blob) => Promise<string>;
}

interface MessageInputWithoutAttachmentProps extends MessageInputBaseProps {
    allowAttachments?: false;
}

interface MessageInputWithAttachmentsProps extends MessageInputBaseProps {
    allowAttachments: true;
    files: File[] | null;
    setFiles: React.Dispatch<React.SetStateAction<File[] | null>>;
}

type MessageInputProps =
    | MessageInputWithoutAttachmentProps
    | MessageInputWithAttachmentsProps;

export function MessageInput({
    placeholder = 'Ask AI...',
    onKeyDown: onKeyDownProp,
    submitOnEnter = true,
    stop,
    isGenerating,
    webSearchEnabled = false,
    onToggleWebSearch,
    allowAudioInput = false,
    onAudioInput,
    ...props
}: MessageInputProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [windowWidth, setWindowWidth] = useState(800);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    useEffect(() => {
        setWindowWidth(window.innerWidth);
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            const chunks: Blob[] = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                if (onAudioInput) {
                    const transcription = await onAudioInput(audioBlob);
                    if (transcription) {
                        const event = {
                            target: { value: transcription },
                        } as React.ChangeEvent<HTMLTextAreaElement>;
                        props.onChange?.(event);
                    }
                }
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const addFiles = (files: File[] | null) => {
        if (props.allowAttachments) {
            props.setFiles((currentFiles) => {
                if (currentFiles === null) {
                    return files;
                }

                if (files === null) {
                    return currentFiles;
                }

                return [...currentFiles, ...files];
            });
        }
    };

    const onDragOver = (event: React.DragEvent) => {
        if (props.allowAttachments !== true) return;
        event.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (event: React.DragEvent) => {
        if (props.allowAttachments !== true) return;
        event.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (event: React.DragEvent) => {
        setIsDragging(false);
        if (props.allowAttachments !== true) return;
        event.preventDefault();
        const dataTransfer = event.dataTransfer;
        if (dataTransfer.files.length) {
            addFiles(Array.from(dataTransfer.files));
        }
    };

    const onPaste = (event: React.ClipboardEvent) => {
        const items = event.clipboardData?.items;
        if (!items) return;

        const files = Array.from(items)
            .map((item) => item.getAsFile())
            .filter((file): file is File => file !== null);

        if (props.allowAttachments && files.length > 0) {
            addFiles(files);
        }
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (submitOnEnter && event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
        }

        onKeyDownProp?.(event);
    };

    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

    const calculateRows = (text: string) => {
        const lineBreaks = (text.match(/\n/g) || []).length;
        const baseRows = Math.ceil((text.length * 6) / (windowWidth - 100));
        return Math.max(1, Math.min(10, lineBreaks + baseRows));
    };

    return (
        <div
            className="relative flex w-full flex-col gap-2"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <div className="relative rounded-xl border border-background bg-secondary focus-within:border-primary py-1">
                <div className="flex">
                    <textarea
                        aria-label="Write your prompt here"
                        placeholder={placeholder}
                        ref={textAreaRef}
                        onPaste={onPaste}
                        onKeyDown={onKeyDown}
                        className="flex-1 resize-none rounded-xl bg-transparent p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        {...(props.allowAttachments
                            ? omit(props, ['allowAttachments', 'files', 'setFiles'])
                            : omit(props, ['allowAttachments']))}
                        rows={calculateRows(props.value)}
                    />
                    {!props.allowAttachments && !webSearchEnabled && !allowAudioInput && (
                        <div className="flex items-center pr-3">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="submit"
                                            size="sm"
                                            className="px-2.5"
                                            aria-label="Send message"
                                            disabled={props.value === '' || isGenerating}
                                        >
                                            {isGenerating && stop ? (
                                                <Square className="h-3 w-3 animate-pulse" fill="currentColor" />
                                            ) : (
                                                <ArrowUp className="h-4 w-4" />
                                            )}

                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{isGenerating && stop ? 'Stop generating' : 'Send message'}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    )}
                </div>

                {(props.allowAttachments || webSearchEnabled || allowAudioInput) && (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-1 border-t border-background px-3 py-2">
                            <div className="flex items-center gap-2">
                                <TooltipProvider>
                                    {props.allowAttachments && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8"
                                                    aria-label="Attach a file"
                                                    onClick={async () => {
                                                        const files = await showFileUploadDialog();
                                                        addFiles(files);
                                                    }}
                                                >
                                                    <Paperclip className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Attach files</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}

                                    {webSearchEnabled !== false && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant={webSearchEnabled ? 'default' : 'ghost'}
                                                    className="h-8 w-8"
                                                    onClick={onToggleWebSearch}
                                                >
                                                    <Globe className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Toggle web search</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}

                                    {allowAudioInput && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant={isRecording ? 'default' : 'ghost'}
                                                    className="h-8 w-8"
                                                    onClick={isRecording ? stopRecording : startRecording}
                                                >
                                                    <Mic className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{isRecording ? 'Stop recording' : 'Start recording'}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </TooltipProvider>

                                {props.allowAttachments && props.files && props.files.length > 0 && (
                                    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 pl-3 pr-1.5 py-1.5 text-sm text-muted-foreground">
                                        <FileIcon className="h-4 w-4" />
                                        <span className="truncate max-w-[200px]">
                                            {props.files[0].name}
                                            {props.files.length > 1 && ` (+${props.files.length - 1} more)`}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 hover:bg-muted"
                                            onClick={() => props.allowAttachments && props.setFiles(null)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="submit"
                                            size="sm"
                                            className="px-4"
                                            aria-label="Send message"
                                            disabled={props.value === '' || isGenerating}
                                        >
                                            {isGenerating && stop ? (
                                                <Square className="h-3 w-3 mr-2 animate-pulse" fill="currentColor" />
                                            ) : (
                                                <ArrowUp className="h-4 w-4 mr-2" />
                                            )}
                                            Send
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{isGenerating && stop ? 'Stop generating' : 'Send message'}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                )}
            </div>

            {props.allowAttachments && <FileUploadOverlay isDragging={isDragging} />}
        </div>
    );
}
MessageInput.displayName = 'MessageInput';

interface FileUploadOverlayProps {
    isDragging: boolean;
}

function FileUploadOverlay({ isDragging }: FileUploadOverlayProps) {
    return (
        <AnimatePresence>
            {isDragging && (
                <motion.div
                    className="pointer-events-none absolute inset-0 flex items-center justify-center space-x-2 rounded-xl border border-dashed border-border bg-background text-sm text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    aria-hidden
                >
                    <Paperclip className="h-4 w-4" />
                    <span>Drop your files here to attach them.</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

interface FilePreviewProps {
    file: File;
    onRemove: () => void;
}

const ImageFilePreview = React.forwardRef<HTMLDivElement, FilePreviewProps>(
    ({ file, onRemove }, ref) => {
        return (
            <motion.div
                ref={ref}
                className="relative flex max-w-[200px] rounded-md border p-1.5 pr-2 text-xs"
                layout
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
            >
                <div className="flex w-full items-center space-x-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        alt={`Attachment ${file.name}`}
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-sm border bg-muted object-cover"
                        src={URL.createObjectURL(file)}
                    />
                    <span className="w-full truncate text-muted-foreground">
                        {file.name}
                    </span>
                </div>

                <button
                    className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border bg-background"
                    type="button"
                    onClick={onRemove}
                >
                    <X className="h-2.5 w-2.5" />
                </button>
            </motion.div>
        );
    }
);
ImageFilePreview.displayName = 'ImageFilePreview';

function showFileUploadDialog() {
    const input = document.createElement('input');

    input.type = 'file';
    input.multiple = true;
    input.accept = '*/*';
    input.click();

    return new Promise<File[] | null>((resolve) => {
        input.onchange = (e) => {
            const files = (e.currentTarget as HTMLInputElement).files;

            if (files) {
                resolve(Array.from(files));
                return;
            }

            resolve(null);
        };
    });
} 