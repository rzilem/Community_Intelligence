
import React from 'react';
import { Landmark, Calendar, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Lead } from '@/types/lead-types';
import LeadStatusBadge from '../../LeadStatusBadge';

interface LeadInfoCardsProps {
  lead: Lead;
}

const LeadInfoCards: React.FC<LeadInfoCardsProps> = ({ lead }) => {
  return (
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
  );
};

export default LeadInfoCards;
