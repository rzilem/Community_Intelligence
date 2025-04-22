import React, { createContext, useContext, useState } from 'react';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabs must be used within a Tabs provider');
  }
  return context;
}

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ 
  defaultValue, 
  value, 
  onValueChange, 
  className = "", 
  children 
}) => {
  const [localActiveTab, setLocalActiveTab] = useState(defaultValue || "");
  
  const activeTab = value !== undefined ? value : localActiveTab;
  const setActiveTab = (newValue: string) => {
    if (value === undefined) {
      setLocalActiveTab(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`tabs ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

export const TabsList: React.FC<TabsListProps> = ({ className = "", children }) => {
  return <div className={`flex space-x-1 mb-4 ${className}`}>{children}</div>;
};

interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, className = "", children }) => {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === value;
  
  return (
    <button
      className={`px-4 py-2 rounded-md focus:outline-none ${
        isActive
          ? 'bg-primary text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${className}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, className = "", children }) => {
  const { activeTab } = useTabs();
  
  if (activeTab !== value) return null;
  
  return <div className={`tab-content ${className}`}>{children}</div>;
};

// Keep backward compatibility with the previous naming convention
export const TabList = TabsList;
export const Tab = TabsTrigger;
export const TabPanel = TabsContent;
