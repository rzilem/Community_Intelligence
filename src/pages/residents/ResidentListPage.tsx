
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
  useEffect(() => {
    const fetchResidentsData = async () => {
      try {
        setLoading(true);
        
        // First get all properties for the user's associations
        const { data: properties, error: propertiesError } = await supabase
          .from('properties')
          .select('*');
          
        if (propertiesError) {
          console.error('Error fetching properties:', propertiesError);
          return;
        }
        
        if (!properties || properties.length === 0) {
          setLoading(false);
          return;
        }
        
        // Get all residents for these properties
        const propertyIds = properties.map(p => p.id);
        
        // Create a batched query to fetch residents for each property
        const residentsPromises = propertyIds.map(propertyId => 
          fetchResidentsWithProfiles(propertyId)
        );
        
        const residentsResults = await Promise.all(residentsPromises);
        
        // Flatten and map the results
        const allResidents = residentsResults.flat().map(resident => {
          const property = properties.find(p => p.id === resident.property_id);
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
            association: property?.association_id || '',
            balance: 0, // We'll add real data later
          };
        });
        
        setResidents(allResidents);
        
        // Fetch associations for filtering
        const { data: associationsData, error: associationsError } = await supabase
          .rpc('get_user_associations');
          
        if (associationsError) {
          console.error('Error fetching associations:', associationsError);
        } else {
          setAssociations(associationsData || []);
        }
      } catch (error) {
        console.error('Error loading residents:', error);
        toast.error('Failed to load residents');
      } finally {
        setLoading(false);
      }
    };
    
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
        // Reload the residents when there's a change
        const fetchResidentsData = async () => {
          try {
            // First get all properties for the user's associations
            const { data: properties, error: propertiesError } = await supabase
              .from('properties')
              .select('*');
              
            if (propertiesError) {
              console.error('Error fetching properties:', propertiesError);
              return;
            }
            
            if (!properties || properties.length === 0) {
              return;
            }
            
            // Get all residents for these properties
            const propertyIds = properties.map(p => p.id);
            
            // Create a batched query to fetch residents for each property
            const residentsPromises = propertyIds.map(propertyId => 
              fetchResidentsWithProfiles(propertyId)
            );
            
            const residentsResults = await Promise.all(residentsPromises);
            
            // Flatten and map the results
            const allResidents = residentsResults.flat().map(resident => {
              const property = properties.find(p => p.id === resident.property_id);
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
                association: property?.association_id || '',
                balance: 0, // We'll add real data later
              };
            });
            
            setResidents(allResidents);
          } catch (error) {
            console.error('Error reloading residents:', error);
          }
        };
        
        fetchResidentsData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
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
    // We'll now rely on the real-time subscription to update the residents list
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
