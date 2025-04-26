
import { useState } from 'react';

export function useAutoRefresh(defaultRefreshInterval: number = 30000) {
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(defaultRefreshInterval);

  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
  };

  const updateLastRefreshed = () => {
    setLastRefreshed(new Date());
  };

  return {
    lastRefreshed,
    updateLastRefreshed,
    autoRefreshEnabled,
    toggleAutoRefresh,
    refreshInterval,
    setRefreshInterval
  };
}
