
import React, { useState } from 'react';
import { ProposalFollowUp, Proposal } from '@/types/proposal-types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Calendar as CalendarIcon, Clock, Send, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

interface FollowUpManagerProps {
  proposal: Proposal;
  followUps: ProposalFollowUp[];
  onAddFollowUp: (followUp: Partial<ProposalFollowUp>) => Promise<void>;
  onDeleteFollowUp: (id: string) => Promise<void>;
}

const FollowUpManager: React.FC<FollowUpManagerProps> = ({
  proposal,
  followUps,
  onAddFollowUp,
  onDeleteFollowUp
}) => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newFollowUp, setNewFollowUp] = useState<Partial<ProposalFollowUp>>({
    proposal_id: proposal.id,
    status: 'scheduled',
    trigger_type: 'days_after_send',
    trigger_days: 3,
    message_template: ''
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // Default 3 days from now
  );

  const handleAddFollowUp = async () => {
    if (!newFollowUp.message_template) {
      toast({
        title: "Missing Information",
        description: "Please provide a message template for the follow-up.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Set the scheduled date
      const followUpData = {
        ...newFollowUp,
        scheduled_date: selectedDate?.toISOString() || new Date().toISOString()
      };
      
      await onAddFollowUp(followUpData);
      
      toast({
        title: "Follow-up Added",
        description: "The follow-up has been scheduled successfully."
      });
      
      // Reset form and close dialog
      setNewFollowUp({
        proposal_id: proposal.id,
        status: 'scheduled',
        trigger_type: 'days_after_send',
        trigger_days: 3,
        message_template: ''
      });
      setSelectedDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
      setIsAddDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule the follow-up. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTriggerTypeChange = (value: string) => {
    let days = 3; // Default
    
    switch (value) {
      case 'days_after_send':
        days = 3;
        break;
      case 'days_after_view':
        days = 2;
        break;
      case 'no_activity':
        days = 7;
        break;
      case 'manual':
        days = 0;
        break;
    }
    
    setNewFollowUp({
      ...newFollowUp,
      trigger_type: value as any,
      trigger_days: days
    });
    
    // Update selected date based on the trigger type
    if (value !== 'manual') {
      setSelectedDate(new Date(Date.now() + days * 24 * 60 * 60 * 1000));
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTriggerTypeText = (followUp: ProposalFollowUp) => {
    switch (followUp.trigger_type) {
      case 'days_after_send':
        return `${followUp.trigger_days} day${followUp.trigger_days !== 1 ? 's' : ''} after proposal sent`;
      case 'days_after_view':
        return `${followUp.trigger_days} day${followUp.trigger_days !== 1 ? 's' : ''} after proposal viewed`;
      case 'no_activity':
        return `After ${followUp.trigger_days} day${followUp.trigger_days !== 1 ? 's' : ''} of no activity`;
      case 'manual':
        return 'Manually scheduled';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Proposal Follow-ups</CardTitle>
            <CardDescription>
              Schedule automated follow-up communications
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Follow-up
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {followUps.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No follow-ups scheduled for this proposal.</p>
            <p className="text-sm mt-2">
              Click "Add Follow-up" to schedule a communication.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {followUps.map((followUp) => (
              <div key={followUp.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getStatusBadgeColor(followUp.status)}>
                        {followUp.status.charAt(0).toUpperCase() + followUp.status.slice(1)}
                      </Badge>
                      <p className="text-sm font-medium">
                        {getTriggerTypeText(followUp)}
                      </p>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      Scheduled for {format(new Date(followUp.scheduled_date), 'PPP')}
                    </div>
                    {followUp.sent_date && (
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Send className="h-3 w-3 mr-1" />
                        Sent on {format(new Date(followUp.sent_date), 'PPP')}
                      </div>
                    )}
                  </div>
                  
                  {followUp.status === 'scheduled' && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onDeleteFollowUp(followUp.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
                
                <div className="mt-3 border-t pt-3">
                  <h4 className="text-sm font-medium mb-1">Message Template</h4>
                  <p className="text-sm">
                    {followUp.message_template.length > 200 
                      ? followUp.message_template.substring(0, 200) + '...' 
                      : followUp.message_template}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule a Follow-up</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="trigger-type">Trigger Type</Label>
              <Select 
                onValueChange={handleTriggerTypeChange}
                defaultValue={newFollowUp.trigger_type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a trigger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days_after_send">Days after proposal sent</SelectItem>
                  <SelectItem value="days_after_view">Days after proposal viewed</SelectItem>
                  <SelectItem value="no_activity">No activity for X days</SelectItem>
                  <SelectItem value="manual">Manual schedule</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {newFollowUp.trigger_type !== 'manual' && (
              <div className="space-y-2">
                <Label htmlFor="trigger-days">Days</Label>
                <Input
                  id="trigger-days"
                  type="number"
                  min="1"
                  max="30"
                  value={newFollowUp.trigger_days}
                  onChange={(e) => setNewFollowUp({
                    ...newFollowUp,
                    trigger_days: parseInt(e.target.value) || 1
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  Number of days to wait before sending follow-up
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Scheduled Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message-template">Message Template</Label>
              <Textarea
                id="message-template"
                placeholder="Enter the follow-up message content..."
                rows={6}
                value={newFollowUp.message_template}
                onChange={(e) => setNewFollowUp({
                  ...newFollowUp,
                  message_template: e.target.value
                })}
              />
              <p className="text-xs text-muted-foreground">
                You can use placeholders like {"{client_name}"}, {"{proposal_name}"}, and {"{amount}"} which will be replaced with actual values.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddFollowUp}
              disabled={isSubmitting || !newFollowUp.message_template}
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Follow-up'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default FollowUpManager;
