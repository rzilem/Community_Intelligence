
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Calendar, Landmark, Clock } from 'lucide-react';
import { Lead } from '@/types/lead-types';
import LeadStatusBadge from '../LeadStatusBadge';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';

interface LeadDetailHeaderProps {
  lead: Lead;
  onStatusChange: (status: Lead['status']) => void;
}

const LeadDetailHeader: React.FC<LeadDetailHeaderProps> = ({ 
  lead, 
  onStatusChange
}) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="absolute top-4 left-4 z-10">
        <Button 
          variant="outline"
          onClick={() => navigate('/lead-management/dashboard')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Leads
        </Button>
      </div>

      <Card className="mb-6 shadow-md border-gray-200 overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-blue-50 to-gray-50 p-5 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {/* Status section */}
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Landmark className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <LeadStatusBadge status={lead.status} />
                  </div>
                </div>
                
                {/* Source section */}
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <Calendar className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Source</p>
                    <span className="inline-block bg-muted px-2 py-1 rounded-md text-sm font-medium">
                      {lead.source}
                    </span>
                  </div>
                </div>
                
                {/* Created section */}
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 rounded-full p-2">
                    <Clock className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created</p>
                    <span className="text-sm font-medium">
                      {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Status buttons with improved styling */}
          <div className="p-4 bg-white">
            <p className="text-sm font-medium text-gray-500 mb-3">Update Status:</p>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant={lead.status === 'new' ? 'default' : 'outline'}
                onClick={() => onStatusChange('new')}
                className={lead.status === 'new' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >New</Button>
              <Button 
                size="sm" 
                variant={lead.status === 'contacted' ? 'default' : 'outline'}
                onClick={() => onStatusChange('contacted')}
                className={lead.status === 'contacted' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >Contacted</Button>
              <Button 
                size="sm" 
                variant={lead.status === 'qualified' ? 'default' : 'outline'}
                onClick={() => onStatusChange('qualified')}
                className={lead.status === 'qualified' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >Qualified</Button>
              <Button 
                size="sm" 
                variant={lead.status === 'proposal' ? 'default' : 'outline'}
                onClick={() => onStatusChange('proposal')}
                className={lead.status === 'proposal' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >Proposal</Button>
              <Button 
                size="sm" 
                variant={lead.status === 'converted' ? 'default' : 'outline'}
                onClick={() => onStatusChange('converted')}
                className={lead.status === 'converted' ? 'bg-green-600 hover:bg-green-700' : ''}
              >Converted</Button>
              <Button 
                size="sm" 
                variant={lead.status === 'lost' ? 'default' : 'outline'}
                onClick={() => onStatusChange('lost')}
                className={lead.status === 'lost' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
              >Lost</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default LeadDetailHeader;
