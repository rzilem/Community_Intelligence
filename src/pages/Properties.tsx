
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Building, Plus, Search, Filter, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSupabaseQuery } from '@/hooks/supabase';
import { Property } from '@/types/app-types';
import { useAuth } from '@/contexts/AuthContext';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyDialog } from '@/components/properties/PropertyDialog';
import TooltipButton from '@/components/ui/tooltip-button';

const Properties = () => {
  const { currentAssociation } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const { data: propertiesResponse = [], isLoading, error } = useSupabaseQuery<Property[]>(
    'properties',
    {
      select: '*',
      filter: currentAssociation ? [
        { column: 'association_id', value: currentAssociation.id }
      ] : [],
      order: { column: 'address', ascending: true },
    },
    !!currentAssociation
  );

  // Ensure properties is always an array
  const properties = Array.isArray(propertiesResponse) ? propertiesResponse : [propertiesResponse];

  const filteredProperties = properties.filter(property => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      property.address.toLowerCase().includes(searchLower) || 
      (property.unit_number && property.unit_number.toLowerCase().includes(searchLower)) ||
      (property.city && property.city.toLowerCase().includes(searchLower))
    );
  });

  const handleAddProperty = () => {
    setSelectedProperty(null);
    setIsDialogOpen(true);
  };

  const handleEditProperty = (property: Property) => {
    setSelectedProperty(property);
    setIsDialogOpen(true);
  };

  return (
    <PageTemplate 
      title="Properties" 
      icon={<Building className="h-8 w-8" />}
      description="Manage all properties within your homeowners associations."
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search properties..." 
                className="pl-8"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <TooltipButton
                variant="outline"
                size="sm"
                tooltip="Filter properties"
              >
                <Filter className="h-4 w-4 mr-2" /> Filter
              </TooltipButton>
              
              <TooltipButton
                variant="outline"
                size="sm" 
                tooltip="Export property data"
              >
                <Download className="h-4 w-4 mr-2" /> Export
              </TooltipButton>
              
              <TooltipButton
                variant="default"
                size="sm"
                onClick={handleAddProperty}
                tooltip="Add a new property"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Property
              </TooltipButton>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-muted rounded-lg p-4 h-48"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">Error loading properties. Please try again later.</p>
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProperties.map(property => (
                <PropertyCard 
                  key={property.id} 
                  property={property}
                  onEdit={() => handleEditProperty(property)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? "No properties match your search criteria." 
                  : "No properties found in this community."}
              </p>
              <Button onClick={handleAddProperty}>
                <Plus className="h-4 w-4 mr-2" /> Add Your First Property
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <PropertyDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        property={selectedProperty} 
      />
    </PageTemplate>
  );
};

export default Properties;
