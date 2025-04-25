
import React from 'react';
import { CheckCircle, XCircle, Eye, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccessIconProps {
  access: 'full' | 'read' | 'none';
}

interface AccessButtonProps extends AccessIconProps {
  onClick?: () => void;
  disabled?: boolean;
}

export const AccessIcon: React.FC<AccessIconProps> = ({ access }) => {
  switch (access) {
    case 'full':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'read':
      return <Eye className="h-4 w-4 text-blue-500" />;
    case 'none':
      return <XCircle className="h-4 w-4 text-gray-300" />;
  }
};

export const AccessText: React.FC<AccessIconProps> = ({ access }) => {
  switch (access) {
    case 'full':
      return <span className="text-xs text-green-600">Full Access</span>;
    case 'read':
      return <span className="text-xs text-blue-600">Read Only</span>;
    case 'none':
      return <span className="text-xs text-gray-400">No Access</span>;
  }
};

export const AccessButton: React.FC<AccessButtonProps> = ({ access, onClick, disabled = false }) => {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-auto p-1 hover:bg-muted/50 flex flex-col items-center gap-1"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="flex items-center gap-1">
        <AccessIcon access={access} />
        {!disabled && <Edit className="h-3 w-3 text-muted-foreground ml-1" />}
      </div>
      <AccessText access={access} />
    </Button>
  );
};
