
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users2, Calendar, FileText, Zap, Home } from 'lucide-react';
import { Association } from '@/types/association-types';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AssociationStatsProps {
  association: Association;
}

export const AssociationStats: React.FC<AssociationStatsProps> = ({ association }) => {
  const [propertyCount, setPropertyCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPropertyCount = async () => {
      try {
        setLoading(true);
        const { count, error } = await (supabase as any)
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('association_id', association.id);
          
        if (error) throw error;
        setPropertyCount(count);
      } catch (err: any) {
        console.error('Error fetching property count:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (association.id) {
      fetchPropertyCount();
    }
  }, [association.id]);

  // Calculate property count discrepancy
  const hasDiscrepancy = association.total_units && propertyCount !== null && propertyCount !== association.total_units;

  return (
    <div className="space-y-4 mt-6">
      {hasDiscrepancy && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Data Discrepancy Detected</AlertTitle>
          <AlertDescription>
            This association has {association.total_units} units but only {propertyCount} properties. 
            You should <Link to="/system/import-export" className="underline font-medium">import property data</Link> or 
            update the unit count to match.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users2 className="h-5 w-5" />
                <span>Units</span>
              </div>
              <h3 className="text-2xl font-bold">{association.total_units || 'N/A'}</h3>
              <span className="text-sm text-muted-foreground">Total residential units</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Home className="h-5 w-5" />
                <span>Properties</span>
              </div>
              <h3 className="text-2xl font-bold">
                {loading ? '...' : propertyCount !== null ? propertyCount : 'N/A'}
              </h3>
              <span className="text-sm text-muted-foreground">
                {loading ? 'Loading...' : `${propertyCount || 0} addresses in database`}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-5 w-5" />
                <span>Onboarding Date</span>
              </div>
              <h3 className="text-2xl font-bold">{association.founded_date || 'N/A'}</h3>
              <span className="text-sm text-muted-foreground">
                {association.founded_date ? `Client since ${new Date(association.founded_date).getFullYear()}` : 'No date available'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <FileText className="h-5 w-5" />
                <span>Legal Property Type</span>
              </div>
              <h3 className="text-lg font-bold">{association.property_type || 'Not specified'}</h3>
              <span className="text-sm text-muted-foreground">Property classification</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-4">
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="h-5 w-5" />
                  <span>Community Management Actions</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                <Button className="flex items-center gap-2" asChild>
                  <Link to="/system/import-export">
                    <Users2 className="h-4 w-4" />
                    <span>Import Properties</span>
                  </Link>
                </Button>
                
                <Button className="flex items-center gap-2" variant="outline" asChild>
                  <Link to="/residents">
                    <Users2 className="h-4 w-4" />
                    <span>Manage Owners</span>
                  </Link>
                </Button>
                
                <Button className="flex items-center gap-2" variant="outline">
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Workflow</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
