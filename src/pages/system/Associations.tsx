
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

// Mock data for associations
const mockAssociations = [
  {
    id: '1',
    name: 'Lakeside Community HOA',
    type: 'HOA',
    units: 156,
    city: 'Austin',
    state: 'TX',
    status: 'active'
  },
  {
    id: '2',
    name: 'Mountain View Condominiums',
    type: 'Condo',
    units: 78,
    city: 'Denver',
    state: 'CO',
    status: 'active'
  },
  {
    id: '3',
    name: 'Oceanfront Villas',
    type: 'HOA',
    units: 92,
    city: 'Miami',
    state: 'FL',
    status: 'active'
  },
  {
    id: '4',
    name: 'Sunset Apartments',
    type: 'Apartment',
    units: 210,
    city: 'San Diego',
    state: 'CA',
    status: 'inactive'
  },
  {
    id: '5',
    name: 'Downtown Business Center',
    type: 'Commercial',
    units: 45,
    city: 'Chicago',
    state: 'IL',
    status: 'active'
  },
];

const AssociationForm = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Association Name</label>
          <Input id="name" placeholder="Enter association name" />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium mb-1">Type</label>
          <select id="type" className="w-full p-2 border rounded-md">
            <option>Select type...</option>
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
          <Input id="units" type="number" placeholder="0" />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium mb-1">City</label>
          <Input id="city" placeholder="Enter city" />
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium mb-1">State</label>
          <Input id="state" placeholder="Enter state" />
        </div>
      </div>
      
      <div>
        <label htmlFor="address" className="block text-sm font-medium mb-1">Address</label>
        <Input id="address" placeholder="Enter street address" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium mb-1">ZIP Code</label>
          <Input id="zipCode" placeholder="Enter ZIP code" />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone</label>
          <Input id="phone" placeholder="Enter phone number" />
        </div>
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
        <Input id="email" type="email" placeholder="Enter contact email" />
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button>Save Association</Button>
      </DialogFooter>
    </div>
  );
};

const Associations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const filteredAssociations = mockAssociations.filter(
    association => association.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   association.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   association.state.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const activeAssociations = filteredAssociations.filter(a => a.status === 'active');
  const inactiveAssociations = filteredAssociations.filter(a => a.status === 'inactive');
  
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
                <AssociationForm onClose={() => setIsDialogOpen(false)} />
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
              <AssociationTable associations={filteredAssociations} />
            </TabsContent>
            
            <TabsContent value="active">
              <AssociationTable associations={activeAssociations} />
            </TabsContent>
            
            <TabsContent value="inactive">
              <AssociationTable associations={inactiveAssociations} />
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
              <div className="flex justify-between items-center">
                <span>Homeowners Association</span>
                <Badge variant="outline">3</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Condominium</span>
                <Badge variant="outline">1</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Apartment Complex</span>
                <Badge variant="outline">1</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Commercial</span>
                <Badge variant="outline">1</Badge>
              </div>
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
              <div className="flex justify-between items-center">
                <span>Total Properties</span>
                <Badge variant="outline">581</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Residents</span>
                <Badge variant="outline">2,345</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Average Properties per HOA</span>
                <Badge variant="outline">116</Badge>
              </div>
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
              <div className="flex justify-between items-center">
                <span>Texas</span>
                <Badge variant="outline">1</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Colorado</span>
                <Badge variant="outline">1</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Florida</span>
                <Badge variant="outline">1</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>California</span>
                <Badge variant="outline">1</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Illinois</span>
                <Badge variant="outline">1</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
};

const AssociationTable = ({ associations }: { associations: any[] }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Association Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Units</TableHead>
            <TableHead>Location</TableHead>
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
                <TableCell>{association.type}</TableCell>
                <TableCell>{association.units}</TableCell>
                <TableCell>{association.city}, {association.state}</TableCell>
                <TableCell>
                  {association.status === 'active' ? (
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
