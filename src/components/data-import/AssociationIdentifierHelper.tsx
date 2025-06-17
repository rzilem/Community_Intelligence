
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info, AlertTriangle } from 'lucide-react';

interface AssociationIdentifierHelperProps {
  isMultiAssociation: boolean;
  fileColumns: string[];
  mappings: Record<string, string>;
}

const AssociationIdentifierHelper: React.FC<AssociationIdentifierHelperProps> = ({
  isMultiAssociation,
  fileColumns,
  mappings
}) => {
  if (!isMultiAssociation) return null;

  const associationColumns = fileColumns.filter(col => 
    col.toLowerCase().includes('association') || 
    col.toLowerCase().includes('hoa') ||
    col.toLowerCase().includes('community') ||
    col.toLowerCase().includes('account')
  );

  const hasAssociationMapping = Object.values(mappings).includes('association_identifier');
  
  return (
    <div className="space-y-2">
      {/* Main instruction - compact */}
      <Alert className="py-2">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Multi-Association Import:</strong> Map one column to "Association Identifier" below.
        </AlertDescription>
      </Alert>
      
      {/* Suggested columns - only show if we found some */}
      {associationColumns.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <strong>Suggested columns:</strong>
          <div className="flex flex-wrap gap-1 mt-1">
            {associationColumns.slice(0, 4).map(col => (
              <Badge key={col} variant="outline" className="text-xs py-0">
                {col}
              </Badge>
            ))}
            {associationColumns.length > 4 && (
              <Badge variant="outline" className="text-xs py-0">
                +{associationColumns.length - 4} more
              </Badge>
            )}
          </div>
        </div>
      )}
      
      {/* Error state - only show if no mapping yet */}
      {!hasAssociationMapping && (
        <Alert variant="destructive" className="py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Required:</strong> Select "Association Identifier" from any column dropdown.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AssociationIdentifierHelper;
