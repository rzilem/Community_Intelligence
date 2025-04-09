import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Network, Search, Plus, PencilLine, Trash2, Building, Users, CreditCard, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TooltipButton from '@/components/ui/tooltip-button';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Association } from '@/types/association-types';
import { useAuth } from '@/contexts/auth';
import { useAssociations } from '@/hooks/associations';

interface AssociationFormData {
  name: string;
  type: string;
  units: number;
  city: string;
  state: string;
  address: string;
  zipCode: string;
  phone: string;
  email: string;
}

interface AssociationFormProps {
  onClose: () => void;
  onSave: (data: AssociationFormData) => void;
  isSubmitting: boolean;
}

const AssociationForm: React.FC<AssociationFormProps> = ({ onClose, onSave, isSubmitting }) => {
  const [formData, setFormData] = useState<AssociationFormData>({
    name: '',
    type: 'HOA',
    units: 0,
    city: '',
    state: '',
    address: '',
    zipCode: '',
    phone: '',
    email: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, type: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Association Name</label>
          <Input 
            id="name" 
            placeholder="Enter association name" 
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium mb-1">Type</label>
          <select 
            id="type" 
            className="w-full p-2 border rounded-md"
            value={formData.type}
            onChange={handleSelectChange}
          >
            <option value="HOA">Homeowners Association</option>
            <option value="Condo">Condominium</option>
            <option value="Apartment">Apartment Complex</option>
            <option value="Commercial">Commercial</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="units" className="block text-sm font-medium mb-1">Total Units</label>
          <Input 
            id="units" 
            type="number" 
            placeholder="0" 
            value={formData.units || ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium mb-1">City</label>
          <Input 
            id="city" 
            placeholder="Enter city" 
            value={formData.city}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium mb-1">State</label>
          <Input 
            id="state" 
            placeholder="Enter state" 
            value={formData.state}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="address" className="block text-sm font-medium mb-1">Address</label>
        <Input 
          id="address" 
          placeholder="Enter street address" 
          value={formData.address}
          onChange={handleChange}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium mb-1">ZIP Code</label>
          <Input 
            id="zipCode" 
            placeholder="Enter ZIP code" 
            value={formData.zipCode}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone</label>
          <Input 
            id="phone" 
            placeholder="Enter phone number" 
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
        <Input 
          id="email" 
          type="email" 
          placeholder="Enter contact email" 
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Association'}
        </Button>
      </DialogFooter>
    </form>
  );
};

const Associations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  
  const { 
    associations, 
    isLoading, 
    createAssociation,
    isCreating 
  } = useAssociations();
  
  const handleSaveAssociation = async (formData: AssociationFormData) => {
    if (!formData.name) {
      toast.error('Association name is required');
      return;
    }
    
    try {
      const associationData = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zipCode,
        phone: formData.phone,
        contact_email: formData.email,
        property_type: formData.type,
        total_units: formData.units > 0 ? formData.units : undefined
      };
      
      createAssociation(associationData, {
        onSuccess: () => {
          setIsDialogOpen(false);
        }
      });
    } catch (error) {
      console.error('Error saving association:', error);
    }
  };
  
  const filteredAssociations = associations.filter(
    association => association.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   (association.address && association.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const activeAssociations = filteredAssociations.filter(a => !a.is_archived);
  const inactiveAssociations = filteredAssociations.filter(a => a.is_archived);
  
  return (
    <PageTemplate 
      title="Associations" 
      icon={<Network className="h-8 w-8" />}
      description="Manage community associations and client organizations."
    >
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search associations..."
                className="pl-8"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Add Association
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Association</DialogTitle>
                  <DialogDescription>
                    Create a new community association or organization to manage.
                  </DialogDescription>
                </DialogHeader>
                <AssociationForm 
                  onClose={() => setIsDialogOpen(false)} 
                  onSave={handleSaveAssociation}
                  isSubmitting={isCreating}
                />
              </DialogContent>
            </Dialog>
          </div>
          
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                All
                <span className="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {filteredAssociations.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="active">
                Active
                <span className="ml-1.5 rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs">
                  {activeAssociations.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="inactive">
                Inactive
                <span className="ml-1.5 rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-xs">
                  {inactiveAssociations.length}
                </span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <AssociationTable associations={filteredAssociations} isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="active">
              <AssociationTable associations={activeAssociations} isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="inactive">
              <AssociationTable associations={inactiveAssociations} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Association Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="py-4 text-center text-muted-foreground">Loading statistics...</div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span>Homeowners Association</span>
                    <Badge variant="outline">{associations.filter(a => a.property_type === 'HOA').length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Condominium</span>
                    <Badge variant="outline">{associations.filter(a => a.property_type === 'Condo').length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Apartment Complex</span>
                    <Badge variant="outline">{associations.filter(a => a.property_type === 'Apartment').length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Commercial</span>
                    <Badge variant="outline">{associations.filter(a => a.property_type === 'Commercial').length}</Badge>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Management Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="py-4 text-center text-muted-foreground">Loading statistics...</div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span>Total Associations</span>
                    <Badge variant="outline">{associations.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Associations</span>
                    <Badge variant="outline">{associations.filter(a => !a.is_archived).length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Inactive Associations</span>
                    <Badge variant="outline">{associations.filter(a => a.is_archived).length}</Badge>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="py-4 text-center text-muted-foreground">Loading statistics...</div>
              ) : (
                associations.length > 0 ? (
                  Object.entries(
                    associations.reduce((acc, association) => {
                      const state = association.state || 'Unknown';
                      acc[state] = (acc[state] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([state, count]) => (
                    <div key={state} className="flex justify-between items-center">
                      <span>{state}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-muted-foreground">No location data available</div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
};

interface AssociationTableProps {
  associations: Association[];
  isLoading: boolean;
}

const AssociationTable = ({ associations, isLoading }: AssociationTableProps) => {
  if (isLoading) {
    return (
      <div className="rounded-md border p-8">
        <div className="text-center text-muted-foreground">Loading associations...</div>
      </div>
    );
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Association Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {associations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No associations found
              </TableCell>
            </TableRow>
          ) : (
            associations.map((association) => (
              <TableRow key={association.id}>
                <TableCell>
                  <Link to={`/system/associations/${association.id}`} className="font-medium hover:underline">
                    {association.name}
                  </Link>
                </TableCell>
                <TableCell>{association.property_type || 'HOA'}</TableCell>
                <TableCell>
                  {association.city && association.state 
                    ? `${association.city}, ${association.state}`
                    : association.address || 'No location data'}
                </TableCell>
                <TableCell>{association.contact_email || 'No contact info'}</TableCell>
                <TableCell>
                  {!association.is_archived ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <TooltipButton
                      size="icon"
                      variant="ghost"
                      tooltip="Edit Association"
                    >
                      <PencilLine className="h-4 w-4" />
                    </TooltipButton>
                    <TooltipButton
                      size="icon"
                      variant="ghost"
                      tooltip="Delete Association"
                    >
                      <Trash2 className="h-4 w-4" />
                    </TooltipButton>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Associations;
