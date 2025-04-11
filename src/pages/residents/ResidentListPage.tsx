
import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Users2, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ResidentFilters from './ResidentFilters';
import ResidentTable from './ResidentTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AddOwnerForm from './AddOwnerForm';
import TooltipButton from '@/components/ui/tooltip-button';
import { toast } from 'sonner';
import { fetchResidentsWithProfiles } from '@/services/hoa/resident-service';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const ResidentListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAssociation, setFilterAssociation] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [associations, setAssociations] = useState<any[]>([]);
  const navigate = useNavigate();
  const { currentAssociation } = useAuth();
  
  // Fetch residents from Supabase
  const fetchResidentsData = async () => {
    try {
      setLoading(true);
      
      // First get all properties for the user's associations
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*');
        
      if (propertiesError) {
        console.error('Error fetching properties:', propertiesError);
        toast.error('Failed to load properties');
        setLoading(false);
        return;
      }
      
      if (!properties || properties.length === 0) {
        setLoading(false);
        return;
      }
      
      // Get all residents for these properties
      const propertyIds = properties.map(p => p.id);
      
      // Fetch all residents directly using a JOIN query instead of separate queries
      const { data: residentsData, error: residentsError } = await supabase
        .from('residents')
        .select(`
          *,
          properties:property_id (
            id,
            address,
            unit_number,
            association_id
          )
        `)
        .in('property_id', propertyIds);
      
      if (residentsError) {
        console.error('Error fetching residents:', residentsError);
        toast.error('Failed to load residents');
        setLoading(false);
        return;
      }
      
      // Get associations to display proper names
      const { data: associationsData, error: associationsError } = await supabase
        .from('associations')
        .select('id, name');
        
      if (associationsError) {
        console.error('Error fetching associations:', associationsError);
      }
      
      const associationsMap = (associationsData || []).reduce((map, assoc) => {
        map[assoc.id] = assoc.name;
        return map;
      }, {});
      
      // Map the results
      const allResidents = (residentsData || []).map(resident => {
        const property = resident.properties;
        const associationId = property?.association_id || '';
        
        return {
          id: resident.id,
          name: resident.name || 'Unknown',
          email: resident.email || '',
          phone: resident.phone || '',
          propertyId: resident.property_id,
          propertyAddress: property ? `${property.address}${property.unit_number ? ` Unit ${property.unit_number}` : ''}` : 'Unknown',
          type: resident.resident_type,
          status: resident.move_out_date ? 'inactive' : 'active',
          moveInDate: resident.move_in_date || new Date().toISOString().split('T')[0],
          moveOutDate: resident.move_out_date,
          association: associationId,
          associationName: associationsMap[associationId] || 'Unknown',
          balance: 0, // We'll add real data later
        };
      });
      
      setResidents(allResidents);
      
      // Fetch associations for filtering
      const { data: userAssociations, error: userAssociationsError } = await supabase
        .rpc('get_user_associations');
          
      if (userAssociationsError) {
        console.error('Error fetching user associations:', userAssociationsError);
      } else {
        setAssociations(userAssociations || []);
      }
    } catch (error) {
      console.error('Error loading residents:', error);
      toast.error('Failed to load residents');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data fetching
  useEffect(() => {
    fetchResidentsData();
  }, []);
  
  // Listen for real-time updates to residents
  useEffect(() => {
    const channel = supabase
      .channel('residents-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'residents'
      }, (payload) => {
        console.log('Realtime update detected:', payload);
        // Reload the residents when there's a change
        fetchResidentsData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const filteredResidents = residents.filter(resident => {
    const matchesSearch = resident.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (resident.email && resident.email.toLowerCase().includes(searchTerm.toLowerCase())) || 
                          resident.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAssociation = filterAssociation === 'all' || resident.association === filterAssociation;
    const matchesStatus = filterStatus === 'all' || resident.status === filterStatus;
    const matchesType = filterType === 'all' || resident.type === filterType;
    return matchesSearch && matchesAssociation && matchesStatus && matchesType;
  });
  
  const handleAddSuccess = (newOwner) => {
    setIsAddDialogOpen(false);
    toast.success('Owner added successfully');
    // Immediately reload the resident list to show the new owner
    fetchResidentsData();
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
              associations={associations}
            />
            
            {loading ? (
              <div className="py-24 text-center text-muted-foreground">
                Loading owners...
              </div>
            ) : (
              <ResidentTable residents={filteredResidents} />
            )}
            
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
