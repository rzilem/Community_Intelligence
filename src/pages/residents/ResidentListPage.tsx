
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Users2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ResidentFilters from './ResidentFilters';
import ResidentTable from './ResidentTable';
import { mockResidents } from './resident-data';

const ResidentListPage = () => {
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
            <ResidentFilters 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterAssociation={filterAssociation}
              setFilterAssociation={setFilterAssociation}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterType={filterType}
              setFilterType={setFilterType}
            />
            
            <ResidentTable residents={filteredResidents} />
            
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

export default ResidentListPage;
