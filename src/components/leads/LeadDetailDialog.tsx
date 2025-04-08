
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lead } from '@/types/lead-types';
import { formatDistanceToNow } from 'date-fns';

interface LeadDetailDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LeadDetailDialog: React.FC<LeadDetailDialogProps> = ({ lead, open, onOpenChange }) => {
  if (!lead) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Lead Details: {lead.association_name || lead.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="flex-1">
          <TabsList>
            <TabsTrigger value="details">Lead Information</TabsTrigger>
            <TabsTrigger value="original">Original Email</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Association Information</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground">Association Name:</div>
                      <div>{lead.association_name || 'N/A'}</div>
                      
                      <div className="text-muted-foreground">Association Type:</div>
                      <div>{lead.association_type || 'N/A'}</div>
                      
                      <div className="text-muted-foreground">Number of Units:</div>
                      <div>{lead.number_of_units || 'N/A'}</div>
                      
                      <div className="text-muted-foreground">Current Management:</div>
                      <div>{lead.current_management || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Contact Information</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground">Name:</div>
                      <div>{lead.name}</div>
                      
                      <div className="text-muted-foreground">Email:</div>
                      <div>{lead.email}</div>
                      
                      <div className="text-muted-foreground">Phone:</div>
                      <div>{lead.phone || 'N/A'}</div>
                      
                      <div className="text-muted-foreground">Company:</div>
                      <div>{lead.company || 'N/A'}</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Street Address:</div>
                    <div>{lead.street_address || 'N/A'}</div>
                    
                    {lead.address_line2 && (
                      <>
                        <div className="text-muted-foreground">Address Line 2:</div>
                        <div>{lead.address_line2}</div>
                      </>
                    )}
                    
                    <div className="text-muted-foreground">City:</div>
                    <div>{lead.city || 'N/A'}</div>
                    
                    <div className="text-muted-foreground">State:</div>
                    <div>{lead.state || 'N/A'}</div>
                    
                    <div className="text-muted-foreground">ZIP:</div>
                    <div>{lead.zip || 'N/A'}</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Lead Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Source:</div>
                    <div>{lead.source}</div>
                    
                    <div className="text-muted-foreground">Status:</div>
                    <div className="capitalize">{lead.status}</div>
                    
                    <div className="text-muted-foreground">Created:</div>
                    <div>{formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}</div>
                    
                    <div className="text-muted-foreground">Additional Requirements:</div>
                    <div>{lead.additional_requirements || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="original" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[60vh]">
              <div className="p-4">
                <div className="border rounded-md">
                  {lead.html_content ? (
                    <iframe 
                      srcDoc={lead.html_content} 
                      title="Original Email" 
                      className="w-full h-[55vh]" 
                      sandbox="allow-same-origin"
                    />
                  ) : (
                    <div className="p-4 text-muted-foreground">No HTML content available for this lead.</div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="notes" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[60vh]">
              <div className="p-4">
                <div className="border rounded-md p-4 whitespace-pre-wrap">
                  {lead.notes || 'No notes available for this lead.'}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailDialog;
