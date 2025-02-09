export interface HostConfiguration {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
}

export type HostConfigurations = HostConfiguration[];

export interface HostContextType {
  selectedHostId: string | null;
  setSelectedHostId: (id: string) => void;
  getSelectedHost: () => HostConfiguration | null;
} 