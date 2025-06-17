
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
    col.toLowerCase().includes('community')
  );

  const hasAssociationMapping = Object.values(mappings).includes('association_identifier');
  
  return (
    <div className="space-y-3">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Multi-Association Import:</strong> Each row must include an association identifier. 
          Map one of your columns to "Association Identifier" below.
        </AlertDescription>
      </Alert>
      
      {associationColumns.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Detected Association Columns:</strong>
            <div className="flex flex-wrap gap-1 mt-2">
              {associationColumns.map(col => (
                <Badge key={col} variant="outline" className="text-xs">
                  {col}
                </Badge>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {!hasAssociationMapping && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Required:</strong> You must map a column to "Association Identifier" for multi-association imports.
            This can be Association ID, Association Name, or Association Code.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="text-sm text-muted-foreground">
        <strong>Supported identifier formats:</strong>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Association ID (UUID format)</li>
          <li>Association Name (exact match, case-insensitive)</li>
          <li>Association Code (exact match, case-insensitive)</li>
        </ul>
      </div>
    </div>
  );
};

export default AssociationIdentifierHelper;
