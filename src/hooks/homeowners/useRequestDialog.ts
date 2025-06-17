
import { useState } from 'react';

export const useRequestDialog = () => {
  const [fullscreenEmail, setFullscreenEmail] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleFullscreenToggle = () => {
    setFullscreenEmail(!fullscreenEmail);
  };

  return {
    fullscreenEmail,
    setFullscreenEmail,
    activeTab,
    setActiveTab,
    handleTabChange,
    handleFullscreenToggle
  };
};
