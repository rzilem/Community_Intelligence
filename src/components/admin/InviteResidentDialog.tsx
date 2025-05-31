
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseQuery } from '@/hooks/supabase';
import { UserPlus } from 'lucide-react';

interface InviteResidentDialogProps {
  associationId: string;
  trigger?: React.ReactNode;
}

const InviteResidentDialog: React.FC<InviteResidentDialogProps> = ({ 
  associationId, 
  trigger 
}) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    propertyId: '',
    message: ''
  });

  const { data: properties = [] } = useSupabaseQuery(
    'properties',
    {
      select: 'id, address, unit_number',
      filter: [
        { column: 'association_id', value: associationId }
      ],
      order: { column: 'address', ascending: true }
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-invitation', {
        body: {
          email: formData.email,
          associationId,
          propertyId: formData.propertyId,
          message: formData.message
        }
      });

      if (error) throw error;

      toast.success('Invitation sent successfully!');
      setFormData({ email: '', propertyId: '', message: '' });
      setOpen(false);
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Resident
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite New Resident</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="resident@example.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="property">Property</Label>
            <Select 
              value={formData.propertyId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, propertyId: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property: any) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.address}
                    {property.unit_number && ` Unit ${property.unit_number}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message">Welcome Message (Optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Welcome to our community! Please complete your registration..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteResidentDialog;
