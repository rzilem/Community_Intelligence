
import React, { FormEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import RequestStatusSelect from '@/components/homeowners/form/RequestStatusSelect';
import RequestTypeSelect from '@/components/homeowners/form/RequestTypeSelect';
import RequestPrioritySelect from '@/components/homeowners/form/RequestPrioritySelect';
import { Textarea } from '@/components/ui/textarea';

export interface HomeownerRequestEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: Partial<HomeownerRequest>;
  updateField: (field: keyof HomeownerRequest, value: any) => void;
  handleSubmit: (e?: FormEvent) => Promise<boolean>;
  handleCancel: () => void;
  isSubmitting: boolean;
  errors: {
    [key: string]: string;
  };
}

const HomeownerRequestEditDialog: React.FC<HomeownerRequestEditDialogProps> = ({
  isOpen,
  onClose,
  request,
  updateField,
  handleSubmit,
  handleCancel,
  isSubmitting,
  errors
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Request</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="resident">Resident</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={request.title || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                    required
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tracking_number">Tracking Number</Label>
                  <Input
                    id="tracking_number"
                    value={request.tracking_number || ''}
                    onChange={(e) => updateField('tracking_number', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Status</Label>
                  <RequestStatusSelect
                    value={request.status || 'open'}
                    onChange={(value) => updateField('status', value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <RequestPrioritySelect
                    value={request.priority || 'medium'}
                    onChange={(value) => updateField('priority', value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Type</Label>
                  <RequestTypeSelect
                    value={request.type || 'general'}
                    onChange={(value) => updateField('type', value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assigned_to">Assigned To</Label>
                  <Input
                    id="assigned_to"
                    value={request.assigned_to || ''}
                    onChange={(e) => updateField('assigned_to', e.target.value)}
                    placeholder="Enter user ID or email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={request.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Enter a detailed description"
                  rows={4}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Original HTML Content</Label>
                <div className="border rounded-md p-4 max-h-[400px] overflow-y-auto">
                  {request.html_content ? (
                    <div dangerouslySetInnerHTML={{ __html: request.html_content }} />
                  ) : (
                    <p className="text-muted-foreground">No HTML content available</p>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="resident" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="resident_id">Resident ID</Label>
                  <Input
                    id="resident_id"
                    value={request.resident_id || ''}
                    onChange={(e) => updateField('resident_id', e.target.value)}
                    placeholder="Enter resident ID"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="property_id">Property ID</Label>
                  <Input
                    id="property_id"
                    value={request.property_id || ''}
                    onChange={(e) => updateField('property_id', e.target.value)}
                    placeholder="Enter property ID"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="association_id">Association ID</Label>
                  <Input
                    id="association_id"
                    value={request.association_id || ''}
                    onChange={(e) => updateField('association_id', e.target.value)}
                    placeholder="Enter association ID"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HomeownerRequestEditDialog;
