
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { vendorExtendedService } from "@/services/vendor-extended-service";
import { VendorEmergencyContactFormData } from "@/types/vendor-extended-types";
import { Plus, Phone, Mail, User, Edit, Trash2 } from "lucide-react";

interface VendorEmergencyContactsTabProps {
  vendorId: string;
}

const VendorEmergencyContactsTab: React.FC<VendorEmergencyContactsTabProps> = ({ vendorId }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['vendor-emergency-contacts', vendorId],
    queryFn: () => vendorExtendedService.getVendorEmergencyContacts(vendorId),
  });

  const createContactMutation = useMutation({
    mutationFn: (data: VendorEmergencyContactFormData) => 
      vendorExtendedService.createVendorEmergencyContact(vendorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-emergency-contacts', vendorId] });
      setIsAddDialogOpen(false);
      toast({ title: "Emergency contact added successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error adding emergency contact", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const updateContactMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<VendorEmergencyContactFormData> }) => 
      vendorExtendedService.updateVendorEmergencyContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-emergency-contacts', vendorId] });
      setEditingContact(null);
      toast({ title: "Emergency contact updated successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error updating emergency contact", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id: string) => vendorExtendedService.deleteVendorEmergencyContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-emergency-contacts', vendorId] });
      toast({ title: "Emergency contact deleted successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error deleting emergency contact", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: VendorEmergencyContactFormData = {
      contact_name: formData.get('contact_name') as string,
      contact_phone: formData.get('contact_phone') as string,
      contact_email: formData.get('contact_email') as string || undefined,
      relationship: formData.get('relationship') as any,
      is_primary: formData.get('is_primary') === 'on',
    };

    if (editingContact) {
      updateContactMutation.mutate({ id: editingContact.id, data });
    } else {
      createContactMutation.mutate(data);
    }
  };

  const getRelationshipColor = (relationship: string) => {
    const colors = {
      primary: 'bg-blue-100 text-blue-800',
      secondary: 'bg-green-100 text-green-800',
      after_hours: 'bg-purple-100 text-purple-800'
    };
    return colors[relationship as keyof typeof colors] || colors.primary;
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading emergency contacts...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Emergency Contacts</h3>
        <Dialog open={isAddDialogOpen || !!editingContact} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setEditingContact(null);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="contact_name">Contact Name</Label>
                <Input 
                  id="contact_name" 
                  name="contact_name" 
                  defaultValue={editingContact?.contact_name}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="contact_phone">Phone Number</Label>
                <Input 
                  id="contact_phone" 
                  name="contact_phone" 
                  type="tel"
                  defaultValue={editingContact?.contact_phone}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="contact_email">Email (Optional)</Label>
                <Input 
                  id="contact_email" 
                  name="contact_email" 
                  type="email"
                  defaultValue={editingContact?.contact_email}
                />
              </div>
              <div>
                <Label htmlFor="relationship">Relationship</Label>
                <Select name="relationship" defaultValue={editingContact?.relationship || 'primary'} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary Contact</SelectItem>
                    <SelectItem value="secondary">Secondary Contact</SelectItem>
                    <SelectItem value="after_hours">After Hours Contact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="is_primary" 
                  name="is_primary"
                  defaultChecked={editingContact?.is_primary}
                />
                <Label htmlFor="is_primary">Primary Emergency Contact</Label>
              </div>
              <Button type="submit" disabled={createContactMutation.isPending || updateContactMutation.isPending}>
                {createContactMutation.isPending || updateContactMutation.isPending 
                  ? (editingContact ? 'Updating...' : 'Adding...') 
                  : (editingContact ? 'Update Contact' : 'Add Contact')
                }
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {contacts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No emergency contacts found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contacts.map((contact) => (
            <Card key={contact.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{contact.contact_name}</h4>
                      <Badge className={getRelationshipColor(contact.relationship)}>
                        {contact.relationship.replace('_', ' ')}
                      </Badge>
                      {contact.is_primary && (
                        <Badge variant="default">Primary</Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${contact.contact_phone}`} className="hover:underline">
                          {contact.contact_phone}
                        </a>
                      </div>
                      
                      {contact.contact_email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          <a href={`mailto:${contact.contact_email}`} className="hover:underline">
                            {contact.contact_email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditingContact(contact)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => deleteContactMutation.mutate(contact.id)}
                      disabled={deleteContactMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorEmergencyContactsTab;
