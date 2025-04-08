
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/types/lead-types';

interface LeadStatusBadgeProps {
  status: Lead['status'];
}

const LeadStatusBadge = ({ status }: LeadStatusBadgeProps) => {
  const variants: Record<Lead['status'], { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    new: { variant: "default", label: "New" },
    contacted: { variant: "secondary", label: "Contacted" },
    qualified: { variant: "default", label: "Qualified" },
    proposal: { variant: "secondary", label: "Proposal Sent" },
    converted: { variant: "outline", label: "Converted" },
    lost: { variant: "destructive", label: "Lost" }
  };
  
  const { variant, label } = variants[status];
  
  return (
    <Badge variant={variant}>{label}</Badge>
  );
};

export default LeadStatusBadge;
