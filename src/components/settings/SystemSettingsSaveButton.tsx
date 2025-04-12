
import React from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SystemSettingsSaveButtonProps {
  isSaving: boolean;
  onClick: () => void;
}

const SystemSettingsSaveButton: React.FC<SystemSettingsSaveButtonProps> = ({ 
  isSaving, 
  onClick 
}) => {
  return (
    <Button onClick={onClick} disabled={isSaving} className="flex items-center gap-2">
      <Save className="h-4 w-4" /> 
      {isSaving ? 'Saving...' : 'Save Settings'}
    </Button>
  );
};

export default SystemSettingsSaveButton;
