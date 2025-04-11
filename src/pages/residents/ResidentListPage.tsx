
import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Users2, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ResidentFilters from './ResidentFilters';
import ResidentTable from './ResidentTable';
import { mockResidents } from './resident-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AddOwnerForm from './AddOwnerForm';
import TooltipButton from '@/components/ui/tooltip-button';
import { toast } from 'sonner';

const ResidentListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAssociation, setFilterAssociation] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [residents, setResidents] = useState(mockResidents);
  const navigate = useNavigate();
  
  const filteredResidents = residents.filter(resident => {
    const matchesSearch = resident.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          resident.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          resident.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAssociation = filterAssociation === 'all' || resident.association === filterAssociation;
    const matchesStatus = filterStatus === 'all' || resident.status === filterStatus;
    const matchesType = filterType === 'all' || resident.type === filterType;
    return matchesSearch && matchesAssociation && matchesStatus && matchesType;
  });
  
  const handleAddSuccess = (newOwner) => {
    // Add the new owner to the residents list
    setResidents(prev => [newOwner, ...prev]);
    setIsAddDialogOpen(false);
    toast.success('Owner added successfully');
  };

  return <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users2 className="h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">Owners</h1>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <TooltipButton 
                variant="default" 
                tooltip="Add a new owner"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <PlusCircle className="h-4 w-4 mr-2" /> Add Owner
              </TooltipButton>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Owner</DialogTitle>
              </DialogHeader>
              <AddOwnerForm onSuccess={handleAddSuccess} onCancel={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Owner Management</CardTitle>
            <CardDescription>View and manage all owners across your community associations.</CardDescription>
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
                Showing {filteredResidents.length} of {residents.length} owners
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>;
};

export default ResidentListPage;
