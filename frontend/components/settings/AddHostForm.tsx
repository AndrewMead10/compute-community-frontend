import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { HostConfiguration } from '@/types/settings';

interface AddHostFormProps {
  onAdd: (host: Omit<HostConfiguration, 'id'>) => void;
}

export function AddHostForm({ onAdd }: AddHostFormProps) {
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://openrouter.ai/api/v1');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('AMead10/SuperNova-Medius-AWQ');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !baseUrl || !apiKey) return;

    onAdd({ name, baseUrl, apiKey, modelName });
    
    // Reset form
    setName('');
    setApiKey('');
    setBaseUrl('https://openrouter.ai/api/v1');
    setModelName('AMead10/SuperNova-Medius-AWQ');
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="grid grid-cols-[1fr,2fr,2fr,1fr,auto] gap-3 items-end">
          <div>
            <Label htmlFor="name" className="text-sm">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Host name"
              required
              className="h-9"
            />
          </div>
          <div>
            <Label htmlFor="base-url" className="text-sm">Base URL</Label>
            <Input
              id="base-url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="OpenRouter base URL"
              required
              className="h-9"
            />
          </div>
          <div>
            <Label htmlFor="api-key" className="text-sm">API Key</Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="OpenRouter API key"
              required
              className="h-9"
            />
          </div>
          <div>
            <Label htmlFor="model-name" className="text-sm">Model</Label>
            <Input
              id="model-name"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="Model name"
              className="h-9"
            />
          </div>
          <Button type="submit" size="sm" className="h-9">Add Host</Button>
        </form>
      </CardContent>
    </Card>
  );
} 