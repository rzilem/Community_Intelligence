
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SystemSettingsSaveButtonProps {
  isSaving: boolean;
  onClick: () => void;
  disabled: boolean;
}

const SystemSettingsSaveButton: React.FC<SystemSettingsSaveButtonProps> = ({ 
  isSaving,
  onClick,
  disabled
}) => {
  return (
    <Button 
      onClick={onClick} 
      disabled={disabled || isSaving} 
      className="min-w-[120px]"
    >
      {isSaving ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving
        </>
      ) : "Save Changes"}
    </Button>
  );
};

export default SystemSettingsSaveButton;
