
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface RequestStatusBadgeProps {
  status: string;
  type: 'status' | 'priority';
}

export const RequestStatusBadge: React.FC<RequestStatusBadgeProps> = ({ status, type }) => {
  const getVariant = (value: string, type: 'status' | 'priority'): "default" | "secondary" | "destructive" | "outline" | "warning" | "success" => {
    if (type === 'priority') {
      switch (value) {
        case 'urgent': return 'destructive';
        case 'high': return 'warning';
        case 'low': return 'secondary';
        default: return 'outline';
      }
    } else {
      switch (value) {
        case 'open': return 'secondary';
        case 'in-progress': 
        case 'in_progress': return 'warning';
        case 'resolved': return 'success';
        case 'closed': return 'outline';
        default: return 'default';
      }
    }
  };

  return (
    <Badge variant={getVariant(status, type)}>{status}</Badge>
  );
};
