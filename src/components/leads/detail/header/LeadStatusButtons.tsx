
import React from 'react';
import { Button } from '@/components/ui/button';
import { Lead } from '@/types/lead-types';

interface LeadStatusButtonsProps {
  currentStatus: Lead['status'];
  onStatusChange: (status: Lead['status']) => void;
}

const LeadStatusButtons: React.FC<LeadStatusButtonsProps> = ({ 
  currentStatus, 
  onStatusChange 
}) => {
  return (
    <div className="p-4 bg-white">
      <p className="text-sm font-medium text-gray-500 mb-3">Update Status:</p>
      <div className="flex flex-wrap gap-2">
        <Button 
          size="sm" 
          variant={currentStatus === 'new' ? 'default' : 'outline'}
          onClick={() => onStatusChange('new')}
          className={currentStatus === 'new' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >New</Button>
        <Button 
          size="sm" 
          variant={currentStatus === 'contacted' ? 'default' : 'outline'}
          onClick={() => onStatusChange('contacted')}
          className={currentStatus === 'contacted' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >Contacted</Button>
        <Button 
          size="sm" 
          variant={currentStatus === 'qualified' ? 'default' : 'outline'}
          onClick={() => onStatusChange('qualified')}
          className={currentStatus === 'qualified' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >Qualified</Button>
        <Button 
          size="sm" 
          variant={currentStatus === 'proposal' ? 'default' : 'outline'}
          onClick={() => onStatusChange('proposal')}
          className={currentStatus === 'proposal' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >Proposal</Button>
        <Button 
          size="sm" 
          variant={currentStatus === 'converted' ? 'default' : 'outline'}
          onClick={() => onStatusChange('converted')}
          className={currentStatus === 'converted' ? 'bg-green-600 hover:bg-green-700' : ''}
        >Converted</Button>
        <Button 
          size="sm" 
          variant={currentStatus === 'lost' ? 'default' : 'outline'}
          onClick={() => onStatusChange('lost')}
          className={currentStatus === 'lost' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
        >Lost</Button>
      </div>
    </div>
  );
};

export default LeadStatusButtons;
