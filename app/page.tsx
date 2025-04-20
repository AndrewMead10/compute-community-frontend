'use client';

import { useState, useEffect } from 'react';
import { ChatBox } from '@/components/ChatBox/ChatBox';
import { useChatState } from '@/components/ChatStateProvider';
import { useHostConfig, dispatchHostConfigChange } from '@/hooks/useHostConfig';
import { HostCard } from '@/components/settings/HostCard';
import { AddHostForm } from '@/components/settings/AddHostForm';
import { HostConfiguration, HostConfigurations } from '@/types/settings';
import { checkHostHealth, getAvailableModels } from '@/lib/openrouter';
import { v4 as uuidv4 } from 'uuid';
import { ChatSidebar } from '@/components/ChatSidebar';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { ModelSelector } from '@/components/ModelSelector';

const STORAGE_KEY = 'host_configurations';
const SELECTED_HOST_KEY = 'selected_host_id';
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
const SYSTEM_PROMPT_KEY = 'system_prompt';

export default function Home() {
  const { messages, handleSendMessage, isGenerating, handleNewChat, handleLoadChat, currentChatId } = useChatState();
  const hostConfig = useHostConfig();
  const [showSettings, setShowSettings] = useState(false);
  const [showSystemPromptSettings, setShowSystemPromptSettings] = useState(false);
  const [hosts, setHosts] = useState<HostConfigurations>([]);
  const [selectedHostId, setSelectedHostId] = useState<string | null>(null);
  const [hostStatus, setHostStatus] = useState<Record<string, boolean>>({});
  const [hostToEdit, setHostToEdit] = useState<HostConfiguration | undefined>(undefined);
  const [showHostDialog, setShowHostDialog] = useState(false);
  const [currentModel, setCurrentModel] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [userSelectedModel, setUserSelectedModel] = useState<boolean>(false);
  const [userModelSelections, setUserModelSelections] = useState<Record<string, string>>({});
  const [systemPrompt, setSystemPrompt] = useState<string>('');

  // Load hosts, selected host, and user model selections
  useEffect(() => {
    const savedHosts = localStorage.getItem(STORAGE_KEY);
    const savedSelectedHostId = localStorage.getItem(SELECTED_HOST_KEY);
    const savedUserModelSelections = localStorage.getItem('user_model_selections');
    const savedSystemPrompt = localStorage.getItem(SYSTEM_PROMPT_KEY);

    // Load saved user model selections
    if (savedUserModelSelections) {
      setUserModelSelections(JSON.parse(savedUserModelSelections));
    }

    // Load system prompt if available
    if (savedSystemPrompt) {
      setSystemPrompt(savedSystemPrompt);
    } else {
      // Set default system prompt if none exists
      const defaultPrompt = "You are a helpful AI assistant. Answer questions accurately, truthfully, and be as helpful as possible.";
      setSystemPrompt(defaultPrompt);
      localStorage.setItem(SYSTEM_PROMPT_KEY, defaultPrompt);
    }

    if (savedHosts) {
      const parsedHosts = JSON.parse(savedHosts);
      setHosts(parsedHosts);

      // If there's a saved selected host that still exists, use it
      if (savedSelectedHostId && parsedHosts.some((h: HostConfiguration) => h.id === savedSelectedHostId)) {
        setSelectedHostId(savedSelectedHostId);

        // If we have a saved model selection for this host, set it as current
        if (savedUserModelSelections) {
          const selections = JSON.parse(savedUserModelSelections);
          if (selections[savedSelectedHostId]) {
            setCurrentModel(selections[savedSelectedHostId]);
            setUserSelectedModel(true);
          }
        }
      } else if (parsedHosts.length > 0) {
        // Otherwise, select the first host
        setSelectedHostId(parsedHosts[0].id);
        localStorage.setItem(SELECTED_HOST_KEY, parsedHosts[0].id);
      }
    } else {
      // Migration: Check for old format
      const oldBaseUrl = localStorage.getItem('openrouter_base_url');
      const oldApiKey = localStorage.getItem('openrouter_api_key');

      if (oldBaseUrl && oldApiKey) {
        const migratedHost: HostConfiguration = {
          id: uuidv4(),
          name: 'Default Host',
          baseUrl: oldBaseUrl,
          apiKey: oldApiKey,
          modelName: 'Qwen/Qwen2.5-14B-Instruct-AWQ',
        };
        setHosts([migratedHost]);
        setSelectedHostId(migratedHost.id);

        // Save in new format and remove old keys
        localStorage.setItem(STORAGE_KEY, JSON.stringify([migratedHost]));
        localStorage.setItem(SELECTED_HOST_KEY, migratedHost.id);
        localStorage.removeItem('openrouter_base_url');
        localStorage.removeItem('openrouter_api_key');
      }
    }
  }, []);

  // Health check effect
  useEffect(() => {
    const checkAllHosts = async () => {
      const newStatus: Record<string, boolean> = {};
      for (const host of hosts) {
        newStatus[host.id] = await checkHostHealth(host.baseUrl);
      }
      setHostStatus(newStatus);
    };

    // Initial check
    if (hosts.length > 0) {
      checkAllHosts();
    }

    // Set up interval for periodic checks
    const interval = setInterval(checkAllHosts, HEALTH_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [hosts]);

  // Replace the model polling effect with a manual check function
  const checkCurrentModel = async () => {
    if (!selectedHostId) return;
    const selectedHost = hosts.find(h => h.id === selectedHostId);
    if (!selectedHost) return;

    try {
      const models = await getAvailableModels(selectedHost.baseUrl, selectedHost.apiKey);
      if (models.length > 0) {
        if (!userSelectedModel) {
          const newModel = models[0].id;
          if (newModel !== selectedHost.modelName) {
            // Update host configuration with new model
            const updatedHost = { ...selectedHost, modelName: newModel };
            handleUpdateHost(updatedHost);
          }
          setCurrentModel(newModel);
        }
        setModelError(null);
      }
    } catch (error) {
      console.error('Error checking current model:', error);
      if (error instanceof Error) {
        setModelError(error.message);
        if (!userSelectedModel) {
          setCurrentModel(null);
        }
      }
    }
  };

  // Initial model check on host selection
  useEffect(() => {
    if (selectedHostId) {
      checkCurrentModel();
    }
  }, [selectedHostId, hosts, userSelectedModel]);

  const handleAddHost = (newHost: Omit<HostConfiguration, 'id'>) => {
    const hostWithId: HostConfiguration = {
      ...newHost,
      id: uuidv4(),
    };
    const updatedHosts = [...hosts, hostWithId];
    setHosts(updatedHosts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHosts));

    // If this is the first host, select it
    if (updatedHosts.length === 1) {
      setSelectedHostId(hostWithId.id);
      localStorage.setItem(SELECTED_HOST_KEY, hostWithId.id);
    }

    // Check health of new host
    checkHostHealth(hostWithId.baseUrl).then(status => {
      setHostStatus(prev => ({ ...prev, [hostWithId.id]: status }));
    });

    // Close the dialog
    setShowHostDialog(false);

    // Dispatch the change event
    dispatchHostConfigChange();
  };

  const handleUpdateHost = (updatedHost: HostConfiguration) => {
    const updatedHosts = hosts.map(host =>
      host.id === updatedHost.id ? updatedHost : host
    );
    setHosts(updatedHosts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHosts));
    setHostToEdit(undefined);
    setShowHostDialog(false);

    // Check health of updated host
    checkHostHealth(updatedHost.baseUrl).then(status => {
      setHostStatus(prev => ({ ...prev, [updatedHost.id]: status }));
    });

    /**
    // Refresh the host config if this was the selected host
    if (updatedHost.id === selectedHostId) {
      hostConfig.refresh();
    }
    **/
    // Dispatch the change event
    dispatchHostConfigChange();
  };

  const handleDeleteHost = (id: string) => {
    const updatedHosts = hosts.filter(host => host.id !== id);
    setHosts(updatedHosts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHosts));

    // Remove health status
    setHostStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[id];
      return newStatus;
    });

    // If we're deleting the selected host, select another one if available
    if (id === selectedHostId) {
      const newSelectedId = updatedHosts.length > 0 ? updatedHosts[0].id : null;
      setSelectedHostId(newSelectedId);
      if (newSelectedId) {
        localStorage.setItem(SELECTED_HOST_KEY, newSelectedId);
      } else {
        localStorage.removeItem(SELECTED_HOST_KEY);
      }
    }

    // Dispatch the change event
    dispatchHostConfigChange();
  };

  const handleSelectHost = (id: string) => {
    setSelectedHostId(id);
    localStorage.setItem(SELECTED_HOST_KEY, id);

    // Check if we have a saved model for this host
    if (userModelSelections[id]) {
      setCurrentModel(userModelSelections[id]);
      setUserSelectedModel(true);
    } else {
      // Reset user model selection when changing to a host without saved selection
      setUserSelectedModel(false);
    }

    // Dispatch the change event
    dispatchHostConfigChange();
  };

  // Add wrapper for handleNewChat
  const handleNewChatWithSettingsClose = () => {
    setShowSettings(false);
    setShowSystemPromptSettings(false);
    handleNewChat();
  };

  const handleLoadChatWithSettingsClose = (chatId: string) => {
    handleLoadChat(chatId);
    setShowSettings(false);
    setShowSystemPromptSettings(false);
  };

  const openAddHostDialog = () => {
    setHostToEdit(undefined);
    setShowHostDialog(true);
  };

  const handleEditHost = (host: HostConfiguration) => {
    setHostToEdit(host);
    setShowHostDialog(true);
  };

  const handleModelSelect = (modelId: string) => {
    if (!selectedHostId) return;

    // Find the selected host and update its model
    const selectedHost = hosts.find(h => h.id === selectedHostId);
    if (!selectedHost) return;

    const updatedHost = { ...selectedHost, modelName: modelId };
    handleUpdateHost(updatedHost);
    setCurrentModel(modelId);
    setUserSelectedModel(true);

    // Save this selection for this host
    const updatedSelections = {
      ...userModelSelections,
      [selectedHostId]: modelId
    };
    setUserModelSelections(updatedSelections);
    localStorage.setItem('user_model_selections', JSON.stringify(updatedSelections));
  };

  return (
    <main className="flex-1 flex">
      <ChatSidebar
        onNewChat={handleNewChatWithSettingsClose}
        currentChatId={currentChatId}
        onSelectChat={handleLoadChatWithSettingsClose}
        onToggleSettings={() => {
          setShowSettings(!showSettings);
          setShowSystemPromptSettings(false);
        }}
        onToggleSystemPromptSettings={() => {
          setShowSystemPromptSettings(!showSystemPromptSettings);
          setShowSettings(false);
        }}
        currentModel={currentModel}
        modelError={modelError}
        onModelSelect={handleModelSelect}
        baseUrl={selectedHostId ? hosts.find(h => h.id === selectedHostId)?.baseUrl || '' : ''}
        apiKey={selectedHostId ? hosts.find(h => h.id === selectedHostId)?.apiKey || '' : ''}
      />

      <div className="flex-1" style={{width: "200px"}}>
        {showSettings ? (
          <div className="container mx-auto py-4 px-6 max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold">Configure Hosts</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {hosts.length} host{hosts.length !== 1 ? 's' : ''} configured
                </span>
                {selectedHostId && (
                  <Button
                    onClick={checkCurrentModel}
                    className="flex items-center gap-2"
                    variant="outline"
                    title="Refresh available models"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                )}
                <Button onClick={openAddHostDialog} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Host
                </Button>
              </div>
            </div>

            <AddHostForm
              onAdd={handleAddHost}
              hostToEdit={hostToEdit}
              onUpdate={handleUpdateHost}
              onCancel={() => {
                setHostToEdit(undefined);
                setShowHostDialog(false);
              }}
              open={showHostDialog}
              onOpenChange={(open) => {
                setShowHostDialog(open);
                if (!open) setHostToEdit(undefined);
              }}
            />

            <div>
              {hosts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No hosts configured yet. Add one to get started.
                  </p>
                </div>
              ) : (
                hosts.map(host => (
                  <HostCard
                    key={host.id}
                    host={host}
                    onDelete={handleDeleteHost}
                    onSelect={handleSelectHost}
                    onEdit={handleEditHost}
                    isSelected={host.id === selectedHostId}
                    isRunning={hostStatus[host.id] ?? null}
                  />
                ))
              )}
            </div>
          </div>
        ) : showSystemPromptSettings ? (
          <div className="container mx-auto py-4 px-6 max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold">Settings</h1>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-medium mb-2">System Prompt</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Set a system prompt that will be sent with every conversation. This helps guide the AI's behavior.
                </p>
                <div className="grid gap-2">
                  <Label htmlFor="systemPrompt">System Prompt</Label>
                  <textarea
                    id="systemPrompt"
                    className="min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="You are a helpful AI assistant..."
                    value={systemPrompt}
                    onChange={(e) => {
                      setSystemPrompt(e.target.value);
                      localStorage.setItem(SYSTEM_PROMPT_KEY, e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ChatBox
            messages={messages}
            onSendMessage={handleSendMessage}
            isGenerating={isGenerating}
            modelName={hostConfig.modelName || 'AI Assistant'}
            isNewChat={messages.length === 0}
          />
        )}
      </div>
    </main>
  );
}
