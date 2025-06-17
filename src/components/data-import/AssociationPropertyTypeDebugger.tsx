
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Association {
  id: string;
  name: string;
  property_type: string | null;
}

const AssociationPropertyTypeDebugger: React.FC = () => {
  const [associations, setAssociations] = useState<Association[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssociations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('associations')
        .select('id, name, property_type')
        .order('name');

      if (error) {
        console.error('Error fetching associations:', error);
      } else {
        setAssociations(data || []);
        console.log('All associations property types:', data);
      }
    } catch (error) {
      console.error('Error in fetchAssociations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssociations();
  }, []);

  const associationsWithoutPropertyType = associations.filter(a => !a.property_type);
  const associationsWithPropertyType = associations.filter(a => a.property_type);

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">Association Property Types Debug</CardTitle>
            <CardDescription className="text-xs">
              Current status of all associations in the database
            </CardDescription>
          </div>
          <Button size="sm" variant="ghost" onClick={fetchAssociations} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-green-700 mb-2">
              Configured ({associationsWithPropertyType.length})
            </h4>
            <div className="space-y-1">
              {associationsWithPropertyType.map((assoc) => (
                <div key={assoc.id} className="flex items-center justify-between text-xs p-2 bg-green-50 rounded">
                  <span>{assoc.name}</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                    {assoc.property_type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {associationsWithoutPropertyType.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-amber-700 mb-2">
                Missing Property Type ({associationsWithoutPropertyType.length})
              </h4>
              <div className="space-y-1">
                {associationsWithoutPropertyType.map((assoc) => (
                  <div key={assoc.id} className="flex items-center justify-between text-xs p-2 bg-amber-50 rounded">
                    <span>{assoc.name}</span>
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 text-xs">
                      Not Set
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssociationPropertyTypeDebugger;
