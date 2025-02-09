'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  const [baseUrl, setBaseUrl] = useState('https://openrouter.ai/api/v1');
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load saved settings
    const savedBaseUrl = localStorage.getItem('openrouter_base_url');
    const savedApiKey = localStorage.getItem('openrouter_api_key');
    
    if (savedBaseUrl) setBaseUrl(savedBaseUrl);
    if (savedApiKey) setApiKey(savedApiKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem('openrouter_base_url', baseUrl);
    localStorage.setItem('openrouter_api_key', apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>API Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="base-url">Base URL</Label>
            <Input
              id="base-url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="Enter OpenRouter base URL"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your OpenRouter API key"
            />
          </div>
          <Button onClick={handleSave}>
            {saved ? 'Saved!' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 