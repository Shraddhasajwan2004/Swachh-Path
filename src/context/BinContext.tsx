import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BinData } from '../data/mockData';
import { API_BASE_URL } from '../api/config';

interface BinContextType {
  bins: BinData[];
  isLoading: boolean;
  error: string | null;
  fetchLiveData: () => Promise<void>;
  addBinConfig: (config: { name: string; binId: string; channelId: string; readApiKey: string; writeApiKey?: string }) => Promise<void>;
  removeBinConfig: (id: string) => Promise<void>;
  sendCommand: (binId: string, command: 'dry_open' | 'wet_open') => Promise<void>;
  alerts: string[];
}

const BinContext = createContext<BinContextType | undefined>(undefined);

export function BinProvider({ children }: { children: React.ReactNode }) {
  const [bins, setBins] = useState<BinData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);

  const fetchLiveData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/bins/live-data`);
      if (!response.ok) throw new Error('Failed to fetch live data');
      const data = await response.json();
      setBins(data);
      
      // Check for alerts
      const newAlerts: string[] = [];
      data.forEach((bin: BinData) => {
        if (bin.wet > 80) newAlerts.push(`CRITICAL: ${bin.name} - Wet Waste Full (${bin.wet}%)`);
        if (bin.dry > 80) newAlerts.push(`CRITICAL: ${bin.name} - Dry Waste Full (${bin.dry}%)`);
      });
      setAlerts(newAlerts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addBinConfig = async (config: { name: string; binId: string; channelId: string; readApiKey: string; writeApiKey?: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error('Failed to add bin config');
      await fetchLiveData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const removeBinConfig = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bins/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove bin config');
      await fetchLiveData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const sendCommand = async (binId: string, command: 'dry_open' | 'wet_open') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bins/${binId}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send command');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 5000); // Real-time update every 5s
    return () => clearInterval(interval);
  }, [fetchLiveData]);

  return (
    <BinContext.Provider value={{ bins, isLoading, error, fetchLiveData, addBinConfig, removeBinConfig, sendCommand, alerts }}>
      {children}
    </BinContext.Provider>
  );
}

export function useBins() {
  const context = useContext(BinContext);
  if (context === undefined) {
    throw new Error('useBins must be used within a BinProvider');
  }
  return context;
}
