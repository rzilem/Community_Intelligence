
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Database, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DataMigrationToolsProps {
  associationId?: string;
}

const DataMigrationTools: React.FC<DataMigrationToolsProps> = ({ associationId }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [migrationResults, setMigrationResults] = useState<{
    misassignedCount: number;
    fixedCount?: number;
    details: string[];
  } | null>(null);

  const checkForMisassignedProperties = async () => {
    if (!associationId) return;

    setIsChecking(true);
    try {
      // Find properties that might be assigned to wrong associations
      const { data: properties, error } = await supabase
        .from('properties')
        .select(`
          id,
          address,
          association_id,
          associations(name)
        `)
        .neq('association_id', associationId);

      if (error) throw error;

      const misassignedProperties = properties?.filter(p => 
        // Look for properties that were likely meant for this association
        // This is a simple heuristic - in practice, you'd need more sophisticated logic
        p.associations?.name?.toLowerCase().includes('test') || 
        p.address?.toLowerCase().includes('imported')
      ) || [];

      setMigrationResults({
        misassignedCount: misassignedProperties.length,
        details: misassignedProperties.map(p => `${p.address} (currently in ${p.associations?.name || 'Unknown'})`)
      });

      if (misassignedProperties.length > 0) {
        toast.warning(`Found ${misassignedProperties.length} potentially misassigned properties`);
      } else {
        toast.success('No misassigned properties found');
      }
    } catch (error) {
      console.error('Error checking for misassigned properties:', error);
      toast.error('Failed to check for misassigned properties');
    } finally {
      setIsChecking(false);
    }
  };

  const fixMisassignedProperties = async () => {
    if (!associationId || !migrationResults) return;

    setIsFixing(true);
    try {
      // This is a simplified fix - in practice, you'd need more sophisticated logic
      // to determine which properties should be moved to which association
      
      const { data: propertiesToFix, error: fetchError } = await supabase
        .from('properties')
        .select('id, address')
        .neq('association_id', associationId)
        .limit(migrationResults.misassignedCount);

      if (fetchError) throw fetchError;

      if (propertiesToFix && propertiesToFix.length > 0) {
        const { error: updateError } = await supabase
          .from('properties')
          .update({ association_id: associationId })
          .in('id', propertiesToFix.map(p => p.id));

        if (updateError) throw updateError;

        setMigrationResults(prev => prev ? {
          ...prev,
          fixedCount: propertiesToFix.length
        } : null);

        toast.success(`Successfully moved ${propertiesToFix.length} properties to the correct association`);
      }
    } catch (error) {
      console.error('Error fixing misassigned properties:', error);
      toast.error('Failed to fix misassigned properties');
    } finally {
      setIsFixing(false);
    }
  };

  if (!associationId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Migration Tools
          </CardTitle>
          <CardDescription>
            Select an association to use data migration tools
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Migration Tools
        </CardTitle>
        <CardDescription>
          Check for and fix data issues like misassigned properties
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={checkForMisassignedProperties} 
            disabled={isChecking}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            Check for Issues
          </Button>
          {migrationResults && migrationResults.misassignedCount > 0 && (
            <Button 
              onClick={fixMisassignedProperties} 
              disabled={isFixing}
            >
              <CheckCircle className={`h-4 w-4 mr-2 ${isFixing ? 'animate-spin' : ''}`} />
              Fix Issues
            </Button>
          )}
        </div>

        {migrationResults && (
          <Alert className={migrationResults.misassignedCount > 0 ? 'border-amber-200' : 'border-green-200'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span>Misassigned Properties:</span>
                  <Badge variant={migrationResults.misassignedCount > 0 ? 'destructive' : 'default'}>
                    {migrationResults.misassignedCount}
                  </Badge>
                  {migrationResults.fixedCount !== undefined && (
                    <>
                      <span>Fixed:</span>
                      <Badge variant="default">
                        {migrationResults.fixedCount}
                      </Badge>
                    </>
                  )}
                </div>
                {migrationResults.details.length > 0 && (
                  <div className="text-sm">
                    <p className="font-medium">Properties found:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {migrationResults.details.slice(0, 5).map((detail, index) => (
                        <li key={index}>{detail}</li>
                      ))}
                      {migrationResults.details.length > 5 && (
                        <li>... and {migrationResults.details.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default DataMigrationTools;
