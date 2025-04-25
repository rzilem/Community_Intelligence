
import React from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

interface AccessIconProps {
  access: 'full' | 'read' | 'none';
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
