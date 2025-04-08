
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Building, Search, Filter, PlusCircle, Download, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TooltipButton from '@/components/ui/tooltip-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  type: 'single-family' | 'townhouse' | 'condo' | 'apartment';
  bedrooms: number;
  bathrooms: number;
  sqFt: number;
  association: string;
  status: 'occupied' | 'vacant' | 'pending' | 'delinquent';
  ownerName?: string;
}

const mockProperties: Property[] = [
  {
    id: 'PROP-101',
    address: '123 Oak Lane',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    type: 'single-family',
    bedrooms: 4,
    bathrooms: 3,
    sqFt: 2400,
    association: 'Oakridge Estates',
    status: 'occupied',
    ownerName: 'Michael Thompson'
  },
  {
    id: 'PROP-102',
    address: '456 Maple Street',
    city: 'Austin',
    state: 'TX',
    zip: '78702',
    type: 'townhouse',
    bedrooms: 3,
    bathrooms: 2.5,
    sqFt: 1800,
    association: 'Oakridge Estates',
    status: 'occupied',
    ownerName: 'Sarah Johnson'
  },
  {
    id: 'PROP-103',
    address: '789 Pine Avenue',
    city: 'Austin',
    state: 'TX',
    zip: '78703',
    type: 'condo',
    bedrooms: 2,
    bathrooms: 2,
    sqFt: 1200,
    association: 'Highland Towers',
    status: 'vacant'
  },
  {
    id: 'PROP-104',
    address: '101 Elm Court',
    city: 'Austin',
    state: 'TX',
    zip: '78704',
    type: 'single-family',
    bedrooms: 5,
    bathrooms: 3.5,
    sqFt: 3200,
    association: 'Lakeside Community',
    status: 'occupied',
    ownerName: 'David Wilson'
  },
  {
    id: 'PROP-105',
    address: '202 Cedar Road',
    city: 'Austin',
    state: 'TX',
    zip: '78705',
    type: 'townhouse',
    bedrooms: 3,
    bathrooms: 2,
    sqFt: 1750,
    association: 'Lakeside Community',
    status: 'delinquent',
    ownerName: 'Jennifer Miller'
  },
  {
    id: 'PROP-106',
    address: '303 Birch Drive',
    city: 'Austin',
    state: 'TX',
    zip: '78705',
    type: 'condo',
    bedrooms: 1,
    bathrooms: 1,
    sqFt: 850,
    association: 'Highland Towers',
    status: 'pending',
  },
];

const getStatusBadge = (status: Property['status']) => {
  switch (status) {
    case 'occupied':
      return <Badge className="bg-green-500">Occupied</Badge>;
    case 'vacant':
      return <Badge variant="outline" className="border-blue-500 text-blue-500">Vacant</Badge>;
    case 'pending':
      return <Badge variant="secondary">Pending</Badge>;
    case 'delinquent':
      return <Badge variant="destructive">Delinquent</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

const PropertyCard: React.FC<{ property: Property }> = ({ property }) => {
  return (
    <Card className="shadow-sm card-hover">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{property.address}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <MapPin className="h-3 w-3 mr-1" /> 
              {property.city}, {property.state} {property.zip}
            </CardDescription>
          </div>
          {getStatusBadge(property.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="text-muted-foreground">Type:</div>
          <div className="font-medium capitalize">{property.type.replace('-', ' ')}</div>
          
          <div className="text-muted-foreground">Size:</div>
          <div className="font-medium">{property.sqFt} sq.ft.</div>
          
          <div className="text-muted-foreground">Bedrooms:</div>
          <div className="font-medium">{property.bedrooms}</div>
          
          <div className="text-muted-foreground">Bathrooms:</div>
          <div className="font-medium">{property.bathrooms}</div>
          
          <div className="text-muted-foreground">HOA:</div>
          <div className="font-medium">{property.association}</div>
          
          <div className="text-muted-foreground">Owner:</div>
          <div className="font-medium">{property.ownerName || 'Not Assigned'}</div>
        </div>
        
        <div className="mt-4 flex justify-end gap-2">
          <TooltipButton size="sm" variant="ghost" tooltip="View property details">
            Details
          </TooltipButton>
          <TooltipButton size="sm" variant="outline" tooltip="Edit property information">
            Edit
          </TooltipButton>
        </div>
      </CardContent>
    </Card>
  );
};

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAssociation, setFilterAssociation] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredProperties = mockProperties.filter(property => {
    const matchesSearch = 
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) || 
      property.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (property.ownerName && property.ownerName.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesAssociation = filterAssociation === 'all' || property.association === filterAssociation;
    const matchesStatus = filterStatus === 'all' || property.status === filterStatus;
    
    return matchesSearch && matchesAssociation && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building className="h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Property Management</CardTitle>
            <CardDescription>View and manage all properties across your community associations.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="grid" className="w-full">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search properties..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <div className="flex items-center gap-2">
                    <Select value={filterAssociation} onValueChange={setFilterAssociation}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Association" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Associations</SelectItem>
                        <SelectItem value="Oakridge Estates">Oakridge Estates</SelectItem>
                        <SelectItem value="Highland Towers">Highland Towers</SelectItem>
                        <SelectItem value="Lakeside Community">Lakeside Community</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="occupied">Occupied</SelectItem>
                        <SelectItem value="vacant">Vacant</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="delinquent">Delinquent</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <TabsList>
                      <TabsTrigger value="grid">Grid</TabsTrigger>
                      <TabsTrigger value="list">List</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <div className="flex gap-2">
                    <TooltipButton tooltip="Export properties as CSV">
                      <Download className="h-4 w-4 mr-2" /> Export
                    </TooltipButton>
                    <TooltipButton variant="default" tooltip="Add a new property">
                      <PlusCircle className="h-4 w-4 mr-2" /> Add Property
                    </TooltipButton>
                  </div>
                </div>
              </div>
              
              <TabsContent value="grid">
                {filteredProperties.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No properties found matching your search.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProperties.map(property => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="list">
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">ID</th>
                        <th className="py-3 px-4 text-left font-medium">Address</th>
                        <th className="py-3 px-4 text-left font-medium">Type</th>
                        <th className="py-3 px-4 text-left font-medium">Size</th>
                        <th className="py-3 px-4 text-left font-medium">Association</th>
                        <th className="py-3 px-4 text-left font-medium">Status</th>
                        <th className="py-3 px-4 text-left font-medium">Owner</th>
                        <th className="py-3 px-4 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProperties.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-6 text-center text-muted-foreground">
                            No properties found matching your search.
                          </td>
                        </tr>
                      ) : (
                        filteredProperties.map(property => (
                          <tr key={property.id} className="border-b hover:bg-muted/20">
                            <td className="py-3 px-4 font-medium">{property.id}</td>
                            <td className="py-3 px-4">{property.address}</td>
                            <td className="py-3 px-4 capitalize">{property.type.replace('-', ' ')}</td>
                            <td className="py-3 px-4">{property.sqFt} sq.ft.</td>
                            <td className="py-3 px-4">{property.association}</td>
                            <td className="py-3 px-4">{getStatusBadge(property.status)}</td>
                            <td className="py-3 px-4">{property.ownerName || 'Not Assigned'}</td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                <TooltipButton size="sm" variant="ghost" tooltip="View property details">
                                  View
                                </TooltipButton>
                                <TooltipButton size="sm" variant="outline" tooltip="Edit property information">
                                  Edit
                                </TooltipButton>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredProperties.length} of {mockProperties.length} properties
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Properties;
