
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Association } from '@/types/association-types';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Check, AlertTriangle, FileUp, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PropertyHealthCheckProps {
  association: Association;
}

export const PropertyHealthCheck: React.FC<PropertyHealthCheckProps> = ({ association }) => {
  const [propertyCount, setPropertyCount] = useState<number | null>(null);
  const [ownersCount, setOwnersCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        
        // Get property count
        const { count: propCount, error: propError } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('association_id', association.id);
          
        if (propError) throw propError;
        setPropertyCount(propCount);
        
        // Get owners count
        // First, fetch property IDs for this association
        const { data: propertyData, error: propIdError } = await supabase
          .from('properties')
          .select('id')
          .eq('association_id', association.id);
          
        if (propIdError) throw propIdError;
        
        if (propertyData && propertyData.length > 0) {
          const propertyIds = propertyData.map(p => p.id);
          
          // Then use those IDs to count owners
          const { data: residents, error: resError } = await supabase
            .from('residents')
            .select('property_id')
            .eq('resident_type', 'owner')
            .in('property_id', propertyIds);
            
          if (resError) throw resError;
          setOwnersCount(residents?.length || 0);
        } else {
          setOwnersCount(0);
        }
      } catch (err) {
        console.error('Error fetching counts:', err);
      } finally {
        setLoading(false);
      }
    };

    if (association.id) {
      fetchCounts();
    }
  }, [association.id]);

  // Calculate discrepancies
  const unitsVsProperties = association.total_units && propertyCount !== null 
    ? association.total_units - propertyCount 
    : null;
    
  const propertiesWithoutOwners = propertyCount !== null && ownersCount !== null 
    ? propertyCount - ownersCount 
    : null;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Health Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2">Analyzing association data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Association Data Health Check</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-2 rounded-md border">
            <div className="flex items-center">
              {unitsVsProperties === 0 ? (
                <Check className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              )}
              <span>Units vs Properties</span>
            </div>
            <div>
              {unitsVsProperties === 0 ? (
                <span className="text-sm text-green-600 font-medium">
                  Perfect match: {association.total_units} units = {propertyCount} properties
                </span>
              ) : (
                <span className="text-sm text-amber-600 font-medium">
                  Mismatch: {association.total_units} units ≠ {propertyCount} properties 
                  ({unitsVsProperties && unitsVsProperties > 0 ? 'Missing' : 'Extra'} {Math.abs(unitsVsProperties || 0)} properties)
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded-md border">
            <div className="flex items-center">
              {propertiesWithoutOwners === 0 ? (
                <Check className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              )}
              <span>Properties with Owners</span>
            </div>
            <div>
              {propertiesWithoutOwners === 0 ? (
                <span className="text-sm text-green-600 font-medium">
                  Perfect: All {propertyCount} properties have owners
                </span>
              ) : (
                <span className="text-sm text-amber-600 font-medium">
                  {propertiesWithoutOwners} properties don't have owners assigned
                </span>
              )}
            </div>
          </div>
          
          {(unitsVsProperties !== 0 || propertiesWithoutOwners !== 0) && (
            <div className="pt-2">
              <Button asChild className="w-full">
                <Link to="/system/import-export">
                  <FileUp className="h-4 w-4 mr-2" />
                  Import Properties & Owners
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
