"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { OpenRouterModel, getAvailableModels } from "@/lib/openrouter"

// Define the CSS for scrolling text
const scrollingTextStyles = {
    container: "w-full overflow-hidden",
    content: "whitespace-nowrap text-ellipsis block",
}

interface ModelSelectorProps {
    baseUrl: string;
    apiKey: string;
    onModelSelect: (modelId: string) => void;
    defaultModelId?: string;
    compact?: boolean;
}

export function ModelSelector({
    baseUrl,
    apiKey,
    onModelSelect,
    defaultModelId,
    compact = false
}: ModelSelectorProps) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(defaultModelId || "")
    const [models, setModels] = React.useState<OpenRouterModel[]>([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [showFreeOnly, setShowFreeOnly] = React.useState(true)

    // Check if using OpenRouter API
    const isOpenRouter = baseUrl?.includes("openrouter")

    const fetchModels = async () => {
        if (!baseUrl || !apiKey) return;

        setLoading(true);
        setError(null);
        try {
            const fetchedModels = await getAvailableModels(baseUrl, apiKey);
            setModels(fetchedModels);

            // Priority for model selection:
            // 1. If defaultModelId is provided and it exists in fetched models, use it
            // 2. If current value exists in models, keep it
            // 3. Fallback to first model only if no value is set

            if (defaultModelId && fetchedModels.some(m => m.id === defaultModelId)) {
                // Set to default model if provided and exists
                setValue(defaultModelId);
            } else if (value && fetchedModels.some(m => m.id === value)) {
                // Keep current value if it exists in fetched models
            } else if (fetchedModels.length > 0 && !value) {
                // Only select first model if no value is set
                setValue(fetchedModels[0].id);
                onModelSelect(fetchedModels[0].id);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch models');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchModels();
    }, [baseUrl, apiKey]);

    // Only update value when defaultModelId changes and is valid
    React.useEffect(() => {
        if (defaultModelId && models.some(m => m.id === defaultModelId) && defaultModelId !== value) {
            setValue(defaultModelId);
        }
    }, [defaultModelId, models, value]);

    const filteredModels = React.useMemo(() => {
        if (isOpenRouter && showFreeOnly) {
            return models.filter(model => model.id.includes(':free'));
        }
        return models;
    }, [models, showFreeOnly, isOpenRouter]);

    const handleSelect = (currentValue: string) => {
        setValue(currentValue);
        onModelSelect(currentValue);
        setOpen(false);
    };

    const getSelectedModelName = () => {
        const model = models.find(m => m.id === value);
        return model ? model.name : "Select model...";
    };

    return (
        <div className={cn("space-y-4", compact && "space-y-2")}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "w-full justify-between pl-3",
                            compact && "h-8 text-xs"
                        )}
                        disabled={loading || Boolean(error)}
                    >
                        <div className="flex-1 overflow-hidden text-left">
                            <div className={scrollingTextStyles.container}>
                                <span className={cn(
                                    scrollingTextStyles.content,
                                    "hover:animate-marquee"
                                )}>
                                    {loading ? "Loading models..." : error ? "Error loading models" : getSelectedModelName()}
                                </span>
                            </div>
                        </div>
                        {/* <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" /> */}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className={cn(
                        "p-0",
                        "w-[16rem]"
                    )}
                    align="start"
                    side="bottom"
                    sideOffset={compact ? 4 : 8}
                >
                    <Command className="bg-background">
                        <CommandInput placeholder="Search model..." />
                        <CommandList>
                            <CommandEmpty>No model found.</CommandEmpty>
                            {isOpenRouter && (
                                <div className="flex items-center px-2 py-1.5 border-b">
                                    <Switch
                                        id="free-models-compact"
                                        checked={showFreeOnly}
                                        onCheckedChange={setShowFreeOnly}
                                        className="scale-75"
                                    />
                                    <Label htmlFor="free-models-compact" className="ml-2 text-xs">
                                        Show only free models
                                    </Label>
                                </div>
                            )}
                            {error ? (
                                <div className="py-6 text-center text-sm">{error}</div>
                            ) : (
                                <CommandGroup>
                                    {filteredModels.map((model) => (
                                        <CommandItem
                                            key={model.id}
                                            value={model.id}
                                            onSelect={handleSelect}
                                            className="flex flex-col items-start py-2"
                                        >
                                            <div className="flex w-full items-center">
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4 shrink-0",
                                                        value === model.id ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                <div className={scrollingTextStyles.container}>
                                                    <span className={cn(
                                                        "font-medium",
                                                        scrollingTextStyles.content,
                                                        "hover:animate-marquee"
                                                    )}>
                                                        {model.name}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* {model.description && !compact && (
                                                <p className="ml-6 mt-1 text-sm text-muted-foreground line-clamp-2">
                                                    {model.description}
                                                </p>
                                            )} */}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
} 