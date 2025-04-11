
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Users, Search, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { mockHomeowners } from './homeowner-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HomeownerListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAssociation, setFilterAssociation] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const navigate = useNavigate();

  const filteredHomeowners = mockHomeowners.filter(homeowner => {
    const matchesSearch = 
      homeowner.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      homeowner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (homeowner.propertyAddress && homeowner.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesAssociation = filterAssociation === 'all' || homeowner.association === filterAssociation;
    const matchesStatus = filterStatus === 'all' || homeowner.status === filterStatus;
    const matchesType = filterType === 'all' || homeowner.type === filterType;
    
    return matchesSearch && matchesAssociation && matchesStatus && matchesType;
  });

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">Owners</h1>
          </div>
          <Button onClick={() => navigate('/homeowners/add')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Owner
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-2">Owner Management</h2>
            <p className="text-muted-foreground mb-6">View and manage all owners across your community associations.</p>
            
            <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center mb-6 gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search owners..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <Select value={filterAssociation} onValueChange={setFilterAssociation}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Associations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Associations</SelectItem>
                    {/* Add association options here */}
                  </SelectContent>
                </Select>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="tenant">Tenant</SelectItem>
                    <SelectItem value="family-member">Family Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Association</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHomeowners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                        No homeowners found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredHomeowners.map(homeowner => (
                      <TableRow key={homeowner.id}>
                        <TableCell className="font-medium cursor-pointer hover:text-primary" onClick={() => navigate(`/homeowners/${homeowner.id}`)}>
                          {homeowner.name}
                        </TableCell>
                        <TableCell>{homeowner.email}</TableCell>
                        <TableCell className="cursor-pointer hover:text-primary" onClick={() => navigate(`/homeowners/${homeowner.id}`)}>
                          {homeowner.propertyAddress}
                        </TableCell>
                        <TableCell className="text-muted-foreground truncate max-w-[200px]">
                          {homeowner.association}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={homeowner.status === 'active' ? 'default' : 'outline'} 
                            className={homeowner.status === 'inactive' ? 'bg-gray-100 text-gray-800' : ''}
                          >
                            {homeowner.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {homeowner.type === 'owner' ? 'Owner' : homeowner.type}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/homeowners/${homeowner.id}`)}>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredHomeowners.length} of {mockHomeowners.length} owners
              </p>
              <div className="flex gap-2">
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

export default HomeownerListPage;
