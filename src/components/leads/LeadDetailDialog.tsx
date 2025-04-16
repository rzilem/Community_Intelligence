
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lead } from '@/types/lead-types';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Mail, Phone } from 'lucide-react';

interface LeadDetailDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LeadDetailDialog: React.FC<LeadDetailDialogProps> = ({ lead, open, onOpenChange }) => {
  if (!lead) return null;
  
  // Extract and format address components
  const streetAddress = lead.street_address || '';
  const formattedStreetAddress = streetAddress.replace(/TrailAustin/i, 'Trail Austin').replace(/Austin,/i, 'Austin, ');
  
  // Get city and clean it
  const city = lead.city || '';
  const cleanedCity = city === 'TrailAuin' ? 'Austin' : city;
  
  // Extract ZIP from address if not present in lead.zip
  const zipPattern = /\b\d{5}\b/;
  const zipMatch = streetAddress.match(zipPattern);
  const zipCode = lead.zip || (zipMatch ? zipMatch[0] : '');
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
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
            <ScrollArea className="h-[75vh]">
              <div className="space-y-6 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg border-b pb-1 mb-2 underline">Association Information</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground font-bold">Association Name:</div>
                      <div className="font-semibold">{lead.association_name || 'N/A'}</div>
                      
                      <div className="text-muted-foreground font-bold">Association Type:</div>
                      <div className="font-semibold">{lead.association_type || 'N/A'}</div>
                      
                      <div className="text-muted-foreground font-bold">Number of Units:</div>
                      <div className="font-semibold">{lead.number_of_units || 'N/A'}</div>
                      
                      <div className="text-muted-foreground font-bold">Current Management:</div>
                      <div className="font-semibold">{lead.current_management || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg border-b pb-1 mb-2 underline">Contact Information</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground font-bold">Name:</div>
                      <div className="font-semibold">{lead.name}</div>
                      
                      <div className="text-muted-foreground font-bold">Email:</div>
                      <div>
                        {lead.email ? (
                          <a 
                            href={`mailto:${lead.email}`} 
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {lead.email}
                            <Mail size={14} />
                          </a>
                        ) : 'N/A'}
                      </div>
                      
                      <div className="text-muted-foreground font-bold">Phone:</div>
                      <div>
                        {lead.phone ? (
                          <a 
                            href={`tel:${lead.phone}`} 
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {lead.phone}
                            <Phone size={14} />
                          </a>
                        ) : 'N/A'}
                      </div>
                      
                      <div className="text-muted-foreground font-bold">Company:</div>
                      <div className="font-semibold">{lead.company || 'N/A'}</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-lg border-b pb-1 mb-2 underline">Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
                    <div className="text-muted-foreground font-bold">Street Address:</div>
                    <div className="col-span-2 text-left font-semibold">
                      {formattedStreetAddress || 'N/A'}
                      {formattedStreetAddress && (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formattedStreetAddress)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:underline inline-flex items-center"
                        >
                          Map It <ExternalLink size={14} className="ml-1" />
                        </a>
                      )}
                    </div>
                    
                    {lead.address_line2 && (
                      <>
                        <div className="text-muted-foreground font-bold">Address Line 2:</div>
                        <div className="col-span-2 text-left font-semibold">{lead.address_line2}</div>
                      </>
                    )}
                    
                    <div className="text-muted-foreground font-bold">City:</div>
                    <div className="col-span-2 text-left font-semibold">{cleanedCity || 'N/A'}</div>
                    
                    <div className="text-muted-foreground font-bold">State:</div>
                    <div className="col-span-2 text-left font-semibold">{lead.state || 'N/A'}</div>
                    
                    <div className="text-muted-foreground font-bold">ZIP:</div>
                    <div className="col-span-2 text-left font-semibold">{zipCode || 'N/A'}</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-lg border-b pb-1 mb-2 underline">Lead Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="text-muted-foreground font-bold">Source:</div>
                    <div>{lead.source}</div>
                    
                    <div className="text-muted-foreground font-bold">Status:</div>
                    <div className="capitalize">{lead.status}</div>
                    
                    <div className="text-muted-foreground font-bold">Created:</div>
                    <div>{formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}</div>
                    
                    <div className="text-muted-foreground font-bold">Additional Requirements:</div>
                    <div>{lead.additional_requirements || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="original" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[70vh]">
              <div className="p-4">
                <div className="border rounded-md">
                  {lead.html_content ? (
                    <iframe 
                      srcDoc={lead.html_content} 
                      title="Original Email" 
                      className="w-full h-[65vh]" 
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
            <ScrollArea className="h-[70vh]">
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
