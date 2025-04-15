
import React, { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Users, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useHomeownerColumns } from './hooks/useHomeownerColumns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useHomeownersData } from './hooks/useHomeownersData';
import { useHomeownerFilters } from './hooks/useHomeownerFilters';
import HomeownerListFilters from './components/HomeownerListFilters';
import HomeownerTable from './components/HomeownerTable';

const HomeownerListPage = () => {
  const navigate = useNavigate();
  const { columns, visibleColumnIds, updateVisibleColumns, reorderColumns } = useHomeownerColumns();
  
  const {
    residents,
    loading,
    error,
    associations,
    isLoadingAssociations,
    fetchResidentsByAssociationId,
    setError
  } = useHomeownersData();

  const {
    searchTerm,
    setSearchTerm,
    filterAssociation,
    setFilterAssociation,
    filterStatus,
    setFilterStatus,
    filterType,
    setFilterType,
    filteredHomeowners,
    extractStreetAddress
  } = useHomeownerFilters(residents);

  // Count residents with invalid associations
  const invalidAssociationCount = residents.filter(
    resident => !resident.hasValidAssociation
  ).length;

  useEffect(() => {
    if (!isLoadingAssociations) {
      fetchResidentsByAssociationId(filterAssociation === 'all' ? null : filterAssociation);
    }
  }, [filterAssociation, isLoadingAssociations]);

  const handleRetry = () => {
    setError(null);
    fetchResidentsByAssociationId(filterAssociation === 'all' ? null : filterAssociation);
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
            
            <HomeownerListFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterAssociation={filterAssociation}
              setFilterAssociation={setFilterAssociation}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterType={filterType}
              setFilterType={setFilterType}
              associations={associations}
              columns={columns}
              visibleColumnIds={visibleColumnIds}
              updateVisibleColumns={updateVisibleColumns}
              reorderColumns={reorderColumns}
            />
            
            <HomeownerTable
              loading={loading}
              filteredHomeowners={filteredHomeowners}
              visibleColumnIds={visibleColumnIds}
              extractStreetAddress={extractStreetAddress}
              allResidentsCount={residents.length}
              error={error}
              onRetry={handleRetry}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default HomeownerListPage;
