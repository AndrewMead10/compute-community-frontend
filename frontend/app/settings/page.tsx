'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { HostCard } from '@/components/settings/HostCard';
import { AddHostForm } from '@/components/settings/AddHostForm';
import { HostConfiguration, HostConfigurations } from '@/types/settings';
import { checkHostHealth } from '@/lib/openrouter';

const STORAGE_KEY = 'host_configurations';
const SELECTED_HOST_KEY = 'selected_host_id';
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

export default function SettingsPage() {
  const [hosts, setHosts] = useState<HostConfigurations>([]);
  const [selectedHostId, setSelectedHostId] = useState<string | null>(null);
  const [hostStatus, setHostStatus] = useState<Record<string, boolean>>({});

  // Load hosts and selected host
  useEffect(() => {
    const savedHosts = localStorage.getItem(STORAGE_KEY);
    const savedSelectedHostId = localStorage.getItem(SELECTED_HOST_KEY);
    
    if (savedHosts) {
      const parsedHosts = JSON.parse(savedHosts);
      setHosts(parsedHosts);
      
      // If there's a saved selected host that still exists, use it
      if (savedSelectedHostId && parsedHosts.some((h: HostConfiguration) => h.id === savedSelectedHostId)) {
        setSelectedHostId(savedSelectedHostId);
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
  };

  const handleSelectHost = (id: string) => {
    setSelectedHostId(id);
    localStorage.setItem(SELECTED_HOST_KEY, id);
  };

  return (
    <div className="container mx-auto py-4 px-6 max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">API Settings</h1>
        <span className="text-sm text-muted-foreground">{hosts.length} host{hosts.length !== 1 ? 's' : ''} configured</span>
      </div>
      
      <AddHostForm onAdd={handleAddHost} />
      
      <div>
        {hosts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hosts configured yet. Add one above.</p>
        ) : (
          hosts.map(host => (
            <HostCard
              key={host.id}
              host={host}
              onDelete={handleDeleteHost}
              onSelect={handleSelectHost}
              isSelected={host.id === selectedHostId}
              isRunning={hostStatus[host.id] ?? null}
            />
          ))
        )}
      </div>
    </div>
  );
} 