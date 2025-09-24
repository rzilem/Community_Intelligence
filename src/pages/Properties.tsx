import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';

export default function Properties() {
  const { toast } = useToast();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  
  const [formData, setFormData] = useState({
    unit_number: '',
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    property_type: 'single_family',
    property_status: 'occupied',
    square_footage: '',
    bedrooms: '',
    bathrooms: ''
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      // In production, this would fetch from the properties table
      // For now, use mock data
      setProperties([
        {
          id: '1',
          unit_number: '101',
          street_address: '123 Main St',
          city: 'Austin',
          state: 'TX',
          property_type: 'condo',
          property_status: 'occupied',
          residents: [{ first_name: 'John', last_name: 'Doe' }]
        },
        {
          id: '2',
          unit_number: '102',
          street_address: '125 Main St',
          city: 'Austin',
          state: 'TX',
          property_type: 'condo',
          property_status: 'vacant',
          residents: []
        }
      ]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch properties',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProperty) {
        // Update property
        toast({ title: 'Success', description: 'Property updated successfully' });
      } else {
        // Create property
        toast({ title: 'Success', description: 'Property created successfully' });
      }
      setDialogOpen(false);
      resetForm();
      fetchProperties();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save property',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      unit_number: '',
      street_address: '',
      city: '',
      state: '',
      zip_code: '',
      property_type: 'single_family',
      property_status: 'occupied',
      square_footage: '',
      bedrooms: '',
      bathrooms: ''
    });
    setEditingProperty(null);
  };

  const filteredProperties = properties.filter(property =>
    property.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.street_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building className="h-8 w-8" />
            Properties
          </h1>
          <p className="text-muted-foreground">Manage all properties in your HOA</p>
        </div>

        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingProperty ? 'Edit Property' : 'Add New Property'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unit_number">Unit Number</Label>
                    <Input
                      id="unit_number"
                      value={formData.unit_number}
                      onChange={(e) => setFormData({...formData, unit_number: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="property_type">Property Type</Label>
                    <Select
                      value={formData.property_type}
                      onValueChange={(value) => setFormData({...formData, property_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single_family">Single Family</SelectItem>
                        <SelectItem value="condo">Condo</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="street_address">Street Address</Label>
                  <Input
                    id="street_address"
                    value={formData.street_address}
                    onChange={(e) => setFormData({...formData, street_address: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip_code">ZIP Code</Label>
                    <Input
                      id="zip_code"
                      value={formData.zip_code}
                      onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingProperty ? 'Update' : 'Create'} Property
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Properties Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">Loading properties...</div>
            ) : filteredProperties.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {searchTerm ? 'No properties found matching your search' : 'No properties found. Add your first property to get started.'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit #</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Residents</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProperties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium">{property.unit_number}</TableCell>
                      <TableCell>{property.street_address}</TableCell>
                      <TableCell className="capitalize">{property.property_type.replace('_', ' ')}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          property.property_status === 'occupied' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {property.property_status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {property.residents.length > 0 ? 
                          property.residents.map(r => `${r.first_name} ${r.last_name}`).join(', ') : 
                          'No residents'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}