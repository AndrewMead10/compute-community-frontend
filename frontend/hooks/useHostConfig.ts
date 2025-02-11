import { useEffect, useState, useCallback } from 'react';
import { HostConfiguration } from '@/types/settings';

const STORAGE_KEY = 'host_configurations';
const SELECTED_HOST_KEY = 'selected_host_id';

export function useHostConfig() {
  const [selectedHost, setSelectedHost] = useState<HostConfiguration | null>(null);

  const loadSelectedHost = useCallback(() => {
    const savedHosts = localStorage.getItem(STORAGE_KEY);
    const selectedHostId = localStorage.getItem(SELECTED_HOST_KEY);

    if (savedHosts && selectedHostId) {
      const hosts = JSON.parse(savedHosts);
      const host = hosts.find((h: HostConfiguration) => h.id === selectedHostId);
      if (host) {
        setSelectedHost(host);
        return;
      }
    }

    // If no host is selected or the selected host doesn't exist,
    // try to select the first available host
    if (savedHosts) {
      const hosts = JSON.parse(savedHosts);
      if (hosts.length > 0) {
        setSelectedHost(hosts[0]);
        localStorage.setItem(SELECTED_HOST_KEY, hosts[0].id);
      } else {
        setSelectedHost(null);
      }
    }
  }, []);

  useEffect(() => {
    loadSelectedHost();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === SELECTED_HOST_KEY) {
        loadSelectedHost();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadSelectedHost]);

  return {
    selectedHost,
    baseUrl: selectedHost?.baseUrl || 'https://openrouter.ai/api/v1',
    apiKey: selectedHost?.apiKey,
    modelName: selectedHost?.modelName || 'Qwen/Qwen2.5-14B-Instruct-AWQ',
    refresh: loadSelectedHost,
  };
} 