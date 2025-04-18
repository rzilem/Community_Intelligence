
import React from 'react';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { X, Tag, Flag, FileType, Users, CalendarClock, Building } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CompactRequestHeaderProps {
  request: HomeownerRequest;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const CompactRequestHeader: React.FC<CompactRequestHeaderProps> = ({
  request,
  onClose,
  activeTab,
  setActiveTab
}) => {
  return (
    <div className="bg-gradient-to-r from-hoa-blue-600 to-hoa-blue-400 text-white p-4 rounded-t-lg">
      {/* Top row with close button and title */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">{request.title}</h2>
          <Badge variant="outline" className="text-white border-white">
            #{request.tracking_number}
          </Badge>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1 bg-white/20 hover:bg-white/30 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {/* Middle row with quick status controls */}
      <div className="flex flex-wrap md:flex-nowrap gap-2 mb-3">
        <div className="flex items-center gap-1 bg-white/10 rounded-md px-2 py-1">
          <FileType className="h-4 w-4" />
          <Select defaultValue={request.type} disabled>
            <SelectTrigger className="w-24 h-7 bg-transparent border-0 text-white">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
              <SelectItem value="billing">Billing</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="amenity">Amenity</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-1 bg-white/10 rounded-md px-2 py-1">
          <Flag className="h-4 w-4" />
          <Select defaultValue={request.priority} disabled>
            <SelectTrigger className="w-24 h-7 bg-transparent border-0 text-white">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-1 bg-white/10 rounded-md px-2 py-1">
          <Tag className="h-4 w-4" />
          <Select defaultValue={request.status} disabled>
            <SelectTrigger className="w-24 h-7 bg-transparent border-0 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-1 bg-white/10 rounded-md px-2 py-1">
          <Users className="h-4 w-4" />
          <Select defaultValue={request.assigned_to || "unassigned"} disabled>
            <SelectTrigger className="w-28 h-7 bg-transparent border-0 text-white">
              <SelectValue placeholder="Assigned To" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-1 bg-white/10 rounded-md px-2 py-1">
          <Building className="h-4 w-4" />
          <Select defaultValue={request.association_id || "unassigned"} disabled>
            <SelectTrigger className="w-28 h-7 bg-transparent border-0 text-white">
              <SelectValue placeholder="Association" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-1 bg-white/10 rounded-md px-2 py-1">
          <CalendarClock className="h-4 w-4" />
          <span className="text-sm">
            {new Date(request.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
      
      {/* Bottom row with tabs */}
      <div className="mt-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white/10 text-white">
            <TabsTrigger 
              value="details" 
              className="data-[state=active]:bg-white data-[state=active]:text-hoa-blue-600"
            >
              Details
            </TabsTrigger>
            <TabsTrigger 
              value="comments" 
              className="data-[state=active]:bg-white data-[state=active]:text-hoa-blue-600"
            >
              Comments
            </TabsTrigger>
            <TabsTrigger 
              value="email" 
              className="data-[state=active]:bg-white data-[state=active]:text-hoa-blue-600"
            >
              Original Email
            </TabsTrigger>
            <TabsTrigger 
              value="attachments" 
              className="data-[state=active]:bg-white data-[state=active]:text-hoa-blue-600"
            >
              Attachments
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default CompactRequestHeader;
