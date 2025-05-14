import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { HostConfiguration } from '@/types/settings';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface AddHostFormProps {
  onAdd: (host: Omit<HostConfiguration, 'id'>) => void;
  hostToEdit?: HostConfiguration;
  onUpdate?: (host: HostConfiguration) => void;
  onCancel?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddHostForm({
  onAdd,
  hostToEdit,
  onUpdate,
  onCancel,
  open,
  onOpenChange
}: AddHostFormProps) {
  const [name, setName] = useState(hostToEdit?.name || '');
  // Normalize baseUrl by removing trailing slashes in initial state
  const initialBaseUrl = hostToEdit?.baseUrl 
    ? (hostToEdit.baseUrl.endsWith('/') ? hostToEdit.baseUrl.slice(0, -1) : hostToEdit.baseUrl)
    : '';
  const [baseUrl, setBaseUrl] = useState(initialBaseUrl);
  const [apiKey, setApiKey] = useState(hostToEdit?.apiKey || '');
  const [modelName, setModelName] = useState(hostToEdit?.modelName || '');

  useEffect(() => {
    if (hostToEdit) {
      setName(hostToEdit.name);
      // Normalize baseUrl by removing trailing slashes when loading from hostToEdit
      const normalizedBaseUrl = hostToEdit.baseUrl.endsWith('/') 
        ? hostToEdit.baseUrl.slice(0, -1) 
        : hostToEdit.baseUrl;
      setBaseUrl(normalizedBaseUrl);
      setApiKey(hostToEdit.apiKey);
      setModelName(hostToEdit.modelName || '');
    }
  }, [hostToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !baseUrl || !apiKey) return;

    // Normalize baseUrl by removing trailing slashes
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const hostData = { name, baseUrl: normalizedBaseUrl, apiKey, modelName };

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

    // Close the dialog
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {hostToEdit ? 'Edit Host' : 'Add New Host'}
          </DialogTitle>
        </DialogHeader>

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
              onChange={(e) => {
                // Normalize URL by removing trailing slashes when user inputs it
                const value = e.target.value;
                setBaseUrl(value);
              }}
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

          <DialogFooter>
            {hostToEdit && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit">
              {hostToEdit ? 'Update Host' : 'Add Host'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 