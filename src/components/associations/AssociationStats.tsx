
import React from 'react';
import { Building, Users, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Association } from '@/types/association-types';

interface AssociationStatsProps {
  associations: Association[];
  isLoading: boolean;
}

const AssociationStats: React.FC<AssociationStatsProps> = ({ associations, isLoading }) => {
  const locationStats = associations.reduce((acc, association) => {
    const state = association.state || 'Unknown';
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Association Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="py-4 text-center text-muted-foreground">Loading statistics...</div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span>Homeowners Association</span>
                  <Badge variant="outline">{associations.filter(a => a.property_type === 'HOA').length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Condominium</span>
                  <Badge variant="outline">{associations.filter(a => a.property_type === 'Condo').length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Apartment Complex</span>
                  <Badge variant="outline">{associations.filter(a => a.property_type === 'Apartment').length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Commercial</span>
                  <Badge variant="outline">{associations.filter(a => a.property_type === 'Commercial').length}</Badge>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Management Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="py-4 text-center text-muted-foreground">Loading statistics...</div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span>Total Associations</span>
                  <Badge variant="outline">{associations.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Active Associations</span>
                  <Badge variant="outline">{associations.filter(a => !a.is_archived).length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Inactive Associations</span>
                  <Badge variant="outline">{associations.filter(a => a.is_archived).length}</Badge>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="py-4 text-center text-muted-foreground">Loading statistics...</div>
            ) : (
              associations.length > 0 ? (
                Object.entries(locationStats).map(([state, count]) => (
                  <div key={state} className="flex justify-between items-center">
                    <span>{state}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-muted-foreground">No location data available</div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssociationStats;
