
import React from 'react';

interface TabsProps {
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ children }) => {
  return <div className="tabs">{children}</div>;
};

interface TabListProps {
  children: React.ReactNode;
}

export const TabList: React.FC<TabListProps> = ({ children }) => {
  return <div className="flex space-x-1 mb-4">{children}</div>;
};

interface TabProps {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Tab: React.FC<TabProps> = ({ active, onClick, children }) => {
  return (
    <button
      className={`px-4 py-2 rounded-md focus:outline-none ${
        active
          ? 'bg-primary text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

interface TabPanelProps {
  active?: boolean;
  children: React.ReactNode;
}

export const TabPanel: React.FC<TabPanelProps> = ({ active, children }) => {
  if (!active) return null;
  return <div className="tab-panel">{children}</div>;
};
