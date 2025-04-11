
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Users, Columns, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import HomeownerFilters from './HomeownerFilters';
import HomeownerTable from './HomeownerTable';
import { mockHomeowners } from './homeowner-data';
import ColumnSelector from '@/components/table/ColumnSelector';

const HomeownerListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAssociation, setFilterAssociation] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'name', 'unit', 'property', 'email', 'status', 'moveInDate', 'moveOutDate',
    'propertyAddress', 'balance', 'lastPayment', 'aclStartDate', 'actions'
  ]);
  const navigate = useNavigate();

  const availableColumns = [
    { id: 'name', label: 'Name' },
    { id: 'unit', label: 'Unit' },
    { id: 'property', label: 'Property' },
    { id: 'email', label: 'Email' },
    { id: 'status', label: 'Status' },
    { id: 'moveInDate', label: 'Move-In Date' },
    { id: 'moveOutDate', label: 'Move-Out Date' },
    { id: 'propertyAddress', label: 'Property Address' },
    { id: 'balance', label: 'Balance' },
    { id: 'lastPayment', label: 'Last Payment' },
    { id: 'aclStartDate', label: 'ACL Start Date' },
    { id: 'actions', label: 'Actions' }
  ];

  const handleReorderColumns = (sourceIndex: number, destinationIndex: number) => {
    const reorderedColumns = [...selectedColumns];
    const [removed] = reorderedColumns.splice(sourceIndex, 1);
    reorderedColumns.splice(destinationIndex, 0, removed);
    setSelectedColumns(reorderedColumns);
  };

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
            <h1 className="text-3xl font-bold tracking-tight">Homeowners</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Homeowner Directory</CardTitle>
            <CardDescription>Search and manage all homeowners across your community associations.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center mb-4">
              <div className="flex-1 relative max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or address..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <HomeownerFilters 
                  filterAssociation={filterAssociation}
                  setFilterAssociation={setFilterAssociation}
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  filterType={filterType}
                  setFilterType={setFilterType}
                />
                
                <ColumnSelector
                  columns={availableColumns}
                  selectedColumns={selectedColumns}
                  onChange={setSelectedColumns}
                  onReorder={handleReorderColumns}
                />
              </div>
            </div>
            
            <HomeownerTable 
              homeowners={filteredHomeowners} 
              selectedColumns={selectedColumns} 
            />
            
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredHomeowners.length} of {mockHomeowners.length} homeowners
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

export default HomeownerListPage;
