
import React from 'react';
import PageTemplate from './PageTemplate';
import { Settings } from 'lucide-react';

const SettingsPage = () => {
  return <PageTemplate title="Settings" icon={<Settings className="h-8 w-8" />} />;
};

export default SettingsPage;
