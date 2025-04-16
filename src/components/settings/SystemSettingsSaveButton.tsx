
import React from 'react';
import { Save } from 'lucide-react';
import TooltipButton from '@/components/ui/tooltip-button';

interface SystemSettingsSaveButtonProps {
  isSaving: boolean;
  onClick: () => void;
}

const SystemSettingsSaveButton: React.FC<SystemSettingsSaveButtonProps> = ({ 
  isSaving, 
  onClick 
}) => {
  return (
    <TooltipButton 
      onClick={onClick} 
      disabled={isSaving} 
      className="flex items-center gap-2"
      tooltip="Save system settings"
    >
      <Save className="h-4 w-4" /> 
      {isSaving ? 'Saving...' : 'Save Settings'}
    </TooltipButton>
  );
};

export default SystemSettingsSaveButton;
