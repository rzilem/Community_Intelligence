
import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Users, Search, Plus, Columns } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
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
import ColumnSelector from '@/components/table/ColumnSelector';
import { useHomeownerColumns } from './hooks/useHomeownerColumns';
import { formatDate } from '@/lib/date-utils';
import { useSupabaseQuery } from '@/hooks/supabase';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { LoadingState } from '@/components/ui/loading-state';

const HomeownerListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAssociation, setFilterAssociation] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { columns, visibleColumnIds, updateVisibleColumns, reorderColumns } = useHomeownerColumns();

  // Fetch associations from Supabase
  const { data: associations = [], isLoading: isLoadingAssociations, error: associationsError } = useSupabaseQuery(
    'associations',
    {
      select: 'id, name',
      filter: [{ column: 'is_archived', operator: 'eq', value: false }],
      order: { column: 'name', ascending: true }
    }
  );

  // Show error toast if associations failed to load
  useEffect(() => {
    if (associationsError) {
      console.error("Error loading associations:", associationsError);
      toast.error("Failed to load associations");
    }
  }, [associationsError]);

  // Fetch residents data
  useEffect(() => {
    const fetchResidents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get associations the user has access to
        const associationIds = filterAssociation === 'all' 
          ? associations.map(a => a.id)
          : [filterAssociation];
          
        if (associationIds.length === 0) {
          console.log('No associations found for user');
          setLoading(false);
          setResidents([]);
          return;
        }
        
        console.log('Fetching properties for associations:', associationIds);
        
        // Get properties for these associations
        const { data: properties, error: propertiesError } = await supabase
          .from('properties')
          .select('*')
          .in('association_id', associationIds);
          
        if (propertiesError) {
          console.error('Error fetching properties:', propertiesError);
          setError('Failed to load properties');
          toast.error('Failed to load properties');
          setLoading(false);
          return;
        }
        
        if (!properties || properties.length === 0) {
          console.log('No properties found for associations:', associationIds);
          setLoading(false);
          setResidents([]);
          return;
        }
        
        // Get all property IDs
        const propertyIds = properties.map(p => p.id);
        console.log(`Found ${propertyIds.length} properties`);
        
        // Fetch all residents for these properties with error handling
        try {
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
            setError('Failed to load residents');
            toast.error('Failed to load residents: ' + residentsError.message);
            setLoading(false);
            return;
          }
          
          console.log(`Found ${residentsData?.length || 0} residents`);
          
          // Create association name lookup
          const associationsMap = associations.reduce((map, assoc) => {
            map[assoc.id] = assoc.name;
            return map;
          }, {});
          
          // Map the results
          const formattedResidents = (residentsData || []).map(resident => {
            const property = resident.properties;
            const associationId = property?.association_id;
            
            return {
              id: resident.id,
              name: resident.name || 'Unknown',
              email: resident.email || '',
              phone: resident.phone || '',
              propertyAddress: property ? `${property.address}${property.unit_number ? ` Unit ${property.unit_number}` : ''}` : 'Unknown',
              type: resident.resident_type,
              status: resident.move_out_date ? 'inactive' : 'active',
              moveInDate: resident.move_in_date || new Date().toISOString().split('T')[0],
              moveOutDate: resident.move_out_date,
              association: associationId || '',
              associationName: associationId && associationsMap[associationId] ? associationsMap[associationId] : 'Unknown Association',
              lastPayment: null,
              closingDate: null,
              hasValidAssociation: !!associationsMap[associationId]
            };
          });
          
          setResidents(formattedResidents);
        } catch (err) {
          console.error('Unexpected error fetching residents:', err);
          setError('An unexpected error occurred while loading residents');
          toast.error('Unexpected error loading residents');
        }
      } catch (error) {
        console.error('Error loading residents:', error);
        setError('Failed to load residents data');
        toast.error('Failed to load residents');
      } finally {
        setLoading(false);
      }
    };

    if (associations && associations.length > 0) {
      fetchResidents();
    } else if (!isLoadingAssociations) {
      setLoading(false);
      setResidents([]);
    }
  }, [associations, filterAssociation, isLoadingAssociations]);

  // Count residents with invalid associations
  const invalidAssociationCount = residents.filter(
    resident => !resident.hasValidAssociation
  ).length;

  // Extract just the street address part (without city, state, zip)
  const extractStreetAddress = (fullAddress: string | undefined) => {
    if (!fullAddress) return '';
    // Simple extraction - assumes the street address is before the first comma
    // More complex regex can be used for better extraction if needed
    const parts = fullAddress.split(',');
    return parts[0]?.trim() || fullAddress;
  };

  const filteredHomeowners = residents.filter(homeowner => {
    const matchesSearch = 
      homeowner.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      homeowner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (homeowner.propertyAddress && homeowner.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesAssociation = filterAssociation === 'all' || homeowner.association === filterAssociation;
    const matchesStatus = filterStatus === 'all' || homeowner.status === filterStatus;
    const matchesType = filterType === 'all' || homeowner.type === filterType;
    
    return matchesSearch && matchesAssociation && matchesStatus && matchesType;
  });

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // This will trigger the useEffect to fetch residents again
    const timer = setTimeout(() => {
      // Empty dependency arrays don't trigger re-renders, so we need to manually trigger it
      setFilterAssociation(prev => prev === 'all' ? 'all_refresh' : 'all');
    }, 100);
    return () => clearTimeout(timer);
  };

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
            
            {invalidAssociationCount > 0 && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Association Issues Detected</AlertTitle>
                <AlertDescription>
                  {invalidAssociationCount} owners have invalid or missing association assignments. 
                  Please use the import tools to fix these data issues.
                </AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert className="mb-6" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-4"
                    onClick={handleRetry}
                  >
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center mb-6 gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search owners..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-2 md:gap-4">
                <Select value={filterAssociation} onValueChange={setFilterAssociation}>
                  <SelectTrigger className="w-[170px]">
                    <SelectValue placeholder="All Associations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Associations</SelectItem>
                    {associations.map(assoc => (
                      <SelectItem key={assoc.id} value={assoc.id}>{assoc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="tenant">Tenant</SelectItem>
                    <SelectItem value="family">Family Member</SelectItem>
                  </SelectContent>
                </Select>
                
                <ColumnSelector
                  columns={columns}
                  selectedColumns={visibleColumnIds}
                  onChange={updateVisibleColumns}
                  onReorder={reorderColumns}
                  className="ml-1"
                />
              </div>
            </div>
            
            {loading ? (
              <LoadingState text="Loading owners..." />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {visibleColumnIds.includes('name') && <TableHead>Name</TableHead>}
                      {visibleColumnIds.includes('email') && <TableHead>Email</TableHead>}
                      {visibleColumnIds.includes('propertyAddress') && <TableHead>Street Address</TableHead>}
                      {visibleColumnIds.includes('association') && <TableHead>Association</TableHead>}
                      {visibleColumnIds.includes('status') && <TableHead>Status</TableHead>}
                      {visibleColumnIds.includes('type') && <TableHead>Type</TableHead>}
                      {visibleColumnIds.includes('lastPaymentDate') && <TableHead>Last Payment Date</TableHead>}
                      {visibleColumnIds.includes('closingDate') && <TableHead>Closing Date</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHomeowners.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={visibleColumnIds.length} className="text-center h-24 text-muted-foreground">
                          No homeowners found matching your search.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredHomeowners.map(homeowner => (
                        <TableRow key={homeowner.id} className="group">
                          {visibleColumnIds.includes('name') && (
                            <TableCell className="font-medium">
                              <span 
                                className="cursor-pointer hover:text-primary hover:underline"
                                onClick={() => navigate(`/homeowners/${homeowner.id}`)}
                              >
                                {homeowner.name}
                              </span>
                            </TableCell>
                          )}
                          {visibleColumnIds.includes('email') && (
                            <TableCell>{homeowner.email}</TableCell>
                          )}
                          {visibleColumnIds.includes('propertyAddress') && (
                            <TableCell>
                              <span 
                                className="cursor-pointer hover:text-primary hover:underline"
                                onClick={() => navigate(`/homeowners/${homeowner.id}`)}
                              >
                                {extractStreetAddress(homeowner.propertyAddress)}
                              </span>
                            </TableCell>
                          )}
                          {visibleColumnIds.includes('association') && (
                            <TableCell className="text-muted-foreground truncate max-w-[200px]">
                              {homeowner.associationName}
                            </TableCell>
                          )}
                          {visibleColumnIds.includes('status') && (
                            <TableCell>
                              <Badge 
                                variant={homeowner.status === 'active' ? 'default' : 'outline'} 
                                className={homeowner.status === 'inactive' ? 'bg-gray-100 text-gray-800' : ''}
                              >
                                {homeowner.status === 'active' ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                          )}
                          {visibleColumnIds.includes('type') && (
                            <TableCell>
                              {homeowner.type === 'owner' ? 'Owner' : 
                               homeowner.type === 'tenant' ? 'Tenant' : 
                               homeowner.type === 'family' ? 'Family Member' : 
                               homeowner.type}
                            </TableCell>
                          )}
                          {visibleColumnIds.includes('lastPaymentDate') && (
                            <TableCell>
                              {homeowner.lastPayment ? 
                                formatDate(homeowner.lastPayment.date) : 
                                '-'}
                            </TableCell>
                          )}
                          {visibleColumnIds.includes('closingDate') && (
                            <TableCell>
                              {homeowner.closingDate ? 
                                formatDate(homeowner.closingDate) : 
                                '-'}
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredHomeowners.length} of {residents.length} owners
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
