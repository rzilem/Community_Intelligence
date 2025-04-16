
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, PhoneOutgoing, Award, FileCheck, XCircle } from 'lucide-react';
import { Lead } from '@/types/lead-types';

interface LeadStatusBadgeProps {
  status: Lead['status'];
}

const LeadStatusBadge = ({ status }: LeadStatusBadgeProps) => {
  const statusConfig: Record<
    Lead['status'], 
    { 
      variant: "default" | "secondary" | "destructive" | "outline"; 
      label: string;
      icon: React.ReactNode;
      className: string;
    }
  > = {
    new: { 
      variant: "default", 
      label: "New", 
      icon: <AlertCircle className="h-3.5 w-3.5 mr-1" />,
      className: "bg-blue-500 hover:bg-blue-600"
    },
    contacted: { 
      variant: "secondary", 
      label: "Contacted", 
      icon: <PhoneOutgoing className="h-3.5 w-3.5 mr-1" />,
      className: "bg-purple-500 text-white hover:bg-purple-600"
    },
    qualified: { 
      variant: "default", 
      label: "Qualified", 
      icon: <Award className="h-3.5 w-3.5 mr-1" />,
      className: "bg-amber-500 hover:bg-amber-600"
    },
    proposal: { 
      variant: "secondary", 
      label: "Proposal Sent", 
      icon: <FileCheck className="h-3.5 w-3.5 mr-1" />,
      className: "bg-indigo-500 text-white hover:bg-indigo-600"
    },
    converted: { 
      variant: "outline", 
      label: "Converted", 
      icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />,
      className: "bg-green-500 text-white hover:bg-green-600"
    },
    lost: { 
      variant: "destructive", 
      label: "Lost", 
      icon: <XCircle className="h-3.5 w-3.5 mr-1" />,
      className: ""
    }
  };
  
  const { variant, label, icon, className } = statusConfig[status];
  
  return (
    <Badge variant={variant} className={`flex items-center ${className}`}>
      {icon}
      {label}
    </Badge>
  );
};

export default LeadStatusBadge;
