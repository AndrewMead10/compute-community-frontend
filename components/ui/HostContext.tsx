'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface HostContextType {
  hostName: string | null;
  setHostName: (name: string | null) => void;
}

const HostContext = createContext<HostContextType | undefined>(undefined);

export function HostProvider({ children }: { children: ReactNode }) {
  const [hostName, setHostName] = useState<string | null>(null);

  return (
    <HostContext.Provider value={{ hostName, setHostName }}>
      {children}
    </HostContext.Provider>
  );
}

export function useHost(): HostContextType {
  const context = useContext(HostContext);
  if (context === undefined) {
    throw new Error('useHost must be used within a HostProvider');
  }
  return context;
} 