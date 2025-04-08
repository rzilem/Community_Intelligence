import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Users2, Search, Filter, PlusCircle, Download, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TooltipButton from '@/components/ui/tooltip-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

interface Resident {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'owner' | 'tenant' | 'family-member';
  propertyId: string;
  propertyAddress: string;
  association: string;
  moveInDate: string;
  status: 'active' | 'inactive' | 'pending-approval';
  avatarUrl?: string;
}

const mockResidents: Resident[] = [
  {
    id: 'RES-201',
    name: 'Michael Thompson',
    email: 'michael.thompson@example.com',
    phone: '(512) 555-1234',
    type: 'owner',
    propertyId: 'PROP-101',
    propertyAddress: '123 Oak Lane',
    association: 'Oakridge Estates',
    moveInDate: '2020-06-15',
    status: 'active'
  },
  {
    id: 'RES-202',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '(512) 555-2345',
    type: 'owner',
    propertyId: 'PROP-102',
    propertyAddress: '456 Maple Street',
    association: 'Oakridge Estates',
    moveInDate: '2021-03-22',
    status: 'active'
  },
  {
    id: 'RES-203',
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    phone: '(512) 555-3456',
    type: 'owner',
    propertyId: 'PROP-104',
    propertyAddress: '101 Elm Court',
    association: 'Lakeside Community',
    moveInDate: '2019-09-10',
    status: 'active'
  },
  {
    id: 'RES-204',
    name: 'Jennifer Miller',
    email: 'jennifer.miller@example.com',
    phone: '(512) 555-4567',
    type: 'owner',
    propertyId: 'PROP-105',
    propertyAddress: '202 Cedar Road',
    association: 'Lakeside Community',
    moveInDate: '2022-01-05',
    status: 'active'
  },
  {
    id: 'RES-205',
    name: 'Robert Davis',
    email: 'robert.davis@example.com',
    phone: '(512) 555-5678',
    type: 'tenant',
    propertyId: 'PROP-103',
    propertyAddress: '789 Pine Avenue',
    association: 'Highland Towers',
    moveInDate: '2023-05-17',
    status: 'inactive'
  },
  {
    id: 'RES-206',
    name: 'Lisa Garcia',
    email: 'lisa.garcia@example.com',
    phone: '(512) 555-6789',
    type: 'tenant',
    propertyId: 'PROP-106',
    propertyAddress: '303 Birch Drive',
    association: 'Highland Towers',
    moveInDate: '2023-11-30',
    status: 'pending-approval'
  },
];

const getStatusBadge = (status: Resident['status']) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-500">Active</Badge>;
    case 'inactive':
      return <Badge variant="outline" className="border-gray-500 text-gray-500">Inactive</Badge>;
    case 'pending-approval':
      return <Badge variant="secondary">Pending Approval</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

const getResidentTypeBadge = (type: Resident['type']) => {
  switch (type) {
    case 'owner':
      return <Badge variant="outline" className="border-blue-500 text-blue-500">Owner</Badge>;
    case 'tenant':
      return <Badge variant="outline" className="border-amber-500 text-amber-500">Tenant</Badge>;
    case 'family-member':
      return <Badge variant="outline" className="border-purple-500 text-purple-500">Family Member</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

const ResidentCard: React.FC<{ resident: Resident }> = ({ resident }) => {
  const navigate = useNavigate();
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handleViewResident = () => {
    navigate(`/residents/${resident.id}`);
  };

  return (
    <Card className="shadow-sm card-hover cursor-pointer" onClick={handleViewResident}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={resident.avatarUrl} />
              <AvatarFallback>{getInitials(resident.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{resident.name}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                {resident.propertyAddress}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge(resident.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="text-muted-foreground">Type:</div>
          <div className="font-medium">{getResidentTypeBadge(resident.type)}</div>
          
          <div className="text-muted-foreground">Email:</div>
          <div className="font-medium flex items-center">
            <Mail className="h-3 w-3 mr-1" /> <span className="truncate">{resident.email}</span>
          </div>
          
          <div className="text-muted-foreground">Phone:</div>
          <div className="font-medium flex items-center">
            <Phone className="h-3 w-3 mr-1" /> {resident.phone}
          </div>
          
          <div className="text-muted-foreground">HOA:</div>
          <div className="font-medium">{resident.association}</div>
          
          <div className="text-muted-foreground">Move-in Date:</div>
          <div className="font-medium">{new Date(resident.moveInDate).toLocaleDateString()}</div>
          
          <div className="text-muted-foreground">Property ID:</div>
          <div className="font-medium">{resident.propertyId}</div>
        </div>
        
        <div className="mt-4 flex justify-end gap-2">
          <TooltipButton size="sm" variant="ghost" tooltip="View resident details">
            Details
          </TooltipButton>
          <TooltipButton size="sm" variant="outline" tooltip="Edit resident information">
            Edit
          </TooltipButton>
        </div>
      </CardContent>
    </Card>
  );
};

const Residents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAssociation, setFilterAssociation] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const navigate = useNavigate();

  const filteredResidents = mockResidents.filter(resident => {
    const matchesSearch = 
      resident.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      resident.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesAssociation = filterAssociation === 'all' || resident.association === filterAssociation;
    const matchesStatus = filterStatus === 'all' || resident.status === filterStatus;
    const matchesType = filterType === 'all' || resident.type === filterType;
    
    return matchesSearch && matchesAssociation && matchesStatus && matchesType;
  });

  const handleViewResident = (id: string) => {
    navigate(`/residents/${id}`);
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users2 className="h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">Residents</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resident Management</CardTitle>
            <CardDescription>View and manage all residents across your community associations.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="grid" className="w-full">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search residents..."
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
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending-approval">Pending Approval</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Resident Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="tenant">Tenant</SelectItem>
                        <SelectItem value="family-member">Family Member</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <TabsList>
                      <TabsTrigger value="grid">Grid</TabsTrigger>
                      <TabsTrigger value="list">List</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <div className="flex gap-2">
                    <TooltipButton tooltip="Export residents as CSV">
                      <Download className="h-4 w-4 mr-2" /> Export
                    </TooltipButton>
                    <TooltipButton variant="default" tooltip="Add a new resident">
                      <PlusCircle className="h-4 w-4 mr-2" /> Add Resident
                    </TooltipButton>
                  </div>
                </div>
              </div>
              
              <TabsContent value="grid">
                {filteredResidents.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No residents found matching your search.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredResidents.map(resident => (
                      <ResidentCard key={resident.id} resident={resident} />
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
                        <th className="py-3 px-4 text-left font-medium">Name</th>
                        <th className="py-3 px-4 text-left font-medium">Type</th>
                        <th className="py-3 px-4 text-left font-medium">Email</th>
                        <th className="py-3 px-4 text-left font-medium">Property</th>
                        <th className="py-3 px-4 text-left font-medium">Association</th>
                        <th className="py-3 px-4 text-left font-medium">Status</th>
                        <th className="py-3 px-4 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResidents.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-6 text-center text-muted-foreground">
                            No residents found matching your search.
                          </td>
                        </tr>
                      ) : (
                        filteredResidents.map(resident => (
                          <tr key={resident.id} className="border-b hover:bg-muted/20">
                            <td className="py-3 px-4 font-medium">{resident.id}</td>
                            <td className="py-3 px-4">
                              <div 
                                className="flex items-center cursor-pointer hover:text-primary"
                                onClick={() => handleViewResident(resident.id)}
                              >
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarImage src={resident.avatarUrl} />
                                  <AvatarFallback>
                                    {resident.name.split(' ').map(part => part[0]).join('').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                {resident.name}
                              </div>
                            </td>
                            <td className="py-3 px-4">{getResidentTypeBadge(resident.type)}</td>
                            <td className="py-3 px-4">{resident.email}</td>
                            <td className="py-3 px-4">{resident.propertyAddress}</td>
                            <td className="py-3 px-4">{resident.association}</td>
                            <td className="py-3 px-4">{getStatusBadge(resident.status)}</td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                <TooltipButton 
                                  size="sm" 
                                  variant="ghost" 
                                  tooltip="View resident details"
                                  onClick={() => handleViewResident(resident.id)}
                                >
                                  View
                                </TooltipButton>
                                <TooltipButton size="sm" variant="outline" tooltip="Edit resident information">
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
                Showing {filteredResidents.length} of {mockResidents.length} residents
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

export default Residents;
