
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw, Plus, Home } from 'lucide-react';
import { useProperties } from '@/hooks/properties/useProperties';
import PropertyTable from '@/components/properties/PropertyTable';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PropertiesTabProps {
  associationId?: string;
}

const PropertiesTab: React.FC<PropertiesTabProps> = ({ associationId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { properties, isLoading, error, searchProperties, refetch } = useProperties(associationId);

  const handleSearch = () => {
    searchProperties(searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    refetch();
  };

  if (!associationId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Properties
          </CardTitle>
          <CardDescription>
            Select an association to view its properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Please select an association from the dropdown above to view properties.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Properties
              {properties.length > 0 && (
                <Badge variant="secondary">
                  {properties.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Manage properties for the selected association
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refetch} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties by address or unit number..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading}>
            Search
          </Button>
          {searchTerm && (
            <Button variant="outline" onClick={handleClearSearch}>
              Clear
            </Button>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Properties Table */}
        {!isLoading && properties.length > 0 && (
          <PropertyTable properties={properties} showOwnerWarning={true} />
        )}

        {/* Empty State */}
        {!isLoading && properties.length === 0 && !error && (
          <div className="text-center py-8">
            <Home className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Properties Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 
                "No properties match your search criteria." : 
                "This association doesn't have any properties yet."
              }
            </p>
            <div className="space-y-2">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add First Property
              </Button>
              <p className="text-sm text-muted-foreground">
                or import properties using the data import tool above
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertiesTab;
