
import { useState, useEffect, useCallback } from 'react';

export function useAppLayoutState(isMobile: boolean) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  
  // Update sidebar state when mobile state changes
  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);
  
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);
  
  return {
    isSidebarOpen,
    setIsSidebarOpen,
    toggleSidebar
  };
}
