
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, UserPlus } from 'lucide-react';
import { Lead } from '@/types/lead-types';
import LeadStatusBadge from '../LeadStatusBadge';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useOnboardingTemplates } from '@/hooks/onboarding/useOnboardingTemplates';

interface LeadDetailHeaderProps {
  lead: Lead;
  onStatusChange: (status: Lead['status']) => void;
  onStartOnboarding: (templateId: string) => void;
  isCreating: boolean;
}

const LeadDetailHeader: React.FC<LeadDetailHeaderProps> = ({ 
  lead, 
  onStatusChange, 
  onStartOnboarding,
  isCreating
}) => {
  const navigate = useNavigate();
  const { templates } = useOnboardingTemplates();
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>('');

  return (
    <>
      <div className="flex gap-2 mb-6">
        <Button 
          variant="outline"
          onClick={() => navigate('/lead-management/dashboard')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Leads
        </Button>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Start Onboarding
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start Onboarding Process</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Select Template</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md mt-1"
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                  >
                    <option value="">Select an onboarding template</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">
                Cancel
              </Button>
              <Button 
                onClick={() => onStartOnboarding(selectedTemplateId)}
                disabled={!selectedTemplateId || isCreating}
              >
                {isCreating ? 'Starting...' : 'Start Process'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <LeadStatusBadge status={lead.status} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Source</p>
                <span className="inline-block bg-muted px-2 py-1 rounded-md text-sm">
                  {lead.source}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <span className="text-sm">
                  {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant={lead.status === 'new' ? 'default' : 'outline'}
                onClick={() => onStatusChange('new')}
              >New</Button>
              <Button 
                size="sm" 
                variant={lead.status === 'contacted' ? 'default' : 'outline'}
                onClick={() => onStatusChange('contacted')}
              >Contacted</Button>
              <Button 
                size="sm" 
                variant={lead.status === 'qualified' ? 'default' : 'outline'}
                onClick={() => onStatusChange('qualified')}
              >Qualified</Button>
              <Button 
                size="sm" 
                variant={lead.status === 'proposal' ? 'default' : 'outline'}
                onClick={() => onStatusChange('proposal')}
              >Proposal</Button>
              <Button 
                size="sm" 
                variant={lead.status === 'converted' ? 'default' : 'outline'}
                onClick={() => onStatusChange('converted')}
              >Converted</Button>
              <Button 
                size="sm" 
                variant={lead.status === 'lost' ? 'default' : 'outline'}
                onClick={() => onStatusChange('lost')}
              >Lost</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default LeadDetailHeader;
