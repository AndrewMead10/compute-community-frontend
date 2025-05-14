import { Trash2, Check, Pencil } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HostConfiguration } from '@/types/settings';
import { cn } from '@/lib/utils';

interface HostCardProps {
  host: HostConfiguration;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onEdit: (host: HostConfiguration) => void;
  isSelected: boolean;
  isRunning: boolean | null;
}

export function HostCard({ host, onDelete, onSelect, onEdit, isSelected, isRunning }: HostCardProps) {
  // Mask API key for display
  const maskedApiKey = '••••' + host.apiKey.slice(-4);

  return (
    <Card
      className={cn(
        "mb-2 cursor-pointer transition-colors",
        isSelected ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-primary/10"
      )}
      onClick={() => onSelect(host.id)}
    >
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{host.name}</h3>
              <div className="flex items-center gap-2">
                {isSelected && (
                  <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-medium">
                    Selected
                  </span>
                )}
                {isRunning !== null && (
                  <span
                    className={cn(
                      "text-xs rounded-full px-2 py-0.5 font-medium flex items-center gap-1",
                      isRunning
                        ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                    )}
                  >
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isRunning ? "bg-green-500" : "bg-red-500"
                    )} />
                    {isRunning ? 'Running' : 'Offline'}
                  </span>
                )}
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              <div>Base URL: {host.baseUrl}</div>
              <div>API Key: {maskedApiKey}</div>
              {host.modelName && <div>Model: {host.modelName}</div>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="customSecondary"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(host);
              }}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="customSecondary"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(host.id);
              }}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
} 