import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { HostConfiguration } from '@/types/settings';
import { getAvailableModels, OpenRouterModel } from '@/lib/openrouter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddHostFormProps {
  onAdd: (host: Omit<HostConfiguration, 'id'>) => void;
  hostToEdit?: HostConfiguration;
  onUpdate?: (host: HostConfiguration) => void;
  onCancel?: () => void;
}

export function AddHostForm({ onAdd, hostToEdit, onUpdate, onCancel }: AddHostFormProps) {
  const [name, setName] = useState(hostToEdit?.name || '');
  const [baseUrl, setBaseUrl] = useState(hostToEdit?.baseUrl || '');
  const [apiKey, setApiKey] = useState(hostToEdit?.apiKey || '');
  const [modelName, setModelName] = useState(hostToEdit?.modelName || '');
  const [availableModels, setAvailableModels] = useState<OpenRouterModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (hostToEdit) {
      setName(hostToEdit.name);
      setBaseUrl(hostToEdit.baseUrl);
      setApiKey(hostToEdit.apiKey);
      setModelName(hostToEdit.modelName || '');
    }
  }, [hostToEdit]);

  useEffect(() => {
    if (baseUrl) {
      setIsLoading(true);
      getAvailableModels(baseUrl)
        .then(models => {
          setAvailableModels(models);
          if (models.length > 0 && !modelName && !hostToEdit?.modelName) {
            setModelName(models[0].id);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [baseUrl, hostToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !baseUrl || !apiKey) return;

    const hostData = { name, baseUrl, apiKey, modelName };

    if (hostToEdit && onUpdate) {
      onUpdate({ ...hostData, id: hostToEdit.id });
    } else {
      onAdd(hostData);
    }

    // Reset form if not editing
    if (!hostToEdit) {
      setName('');
      setApiKey('');
      setBaseUrl('');
      setModelName('');
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My friends computer"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="base-url">Base URL</Label>
            <Input
              id="base-url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="Base URL"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API key"
              required
            />
          </div>

          {availableModels.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="model-name">Model</Label>
              <Select value={modelName} onValueChange={setModelName}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            {hostToEdit && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit">
              {hostToEdit ? 'Update Host' : 'Add Host'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 