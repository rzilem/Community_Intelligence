
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info, CheckCircle } from 'lucide-react';

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
    <Alert className={`py-1.5 px-3 text-xs ${hasAssociationMapping ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
      <div className="flex items-center gap-2">
        {hasAssociationMapping ? (
          <CheckCircle className="h-3 w-3 text-green-600" />
        ) : (
          <Info className="h-3 w-3 text-blue-600" />
        )}
        <AlertDescription className="text-xs m-0 flex-1">
          {hasAssociationMapping ? (
            <span className="text-green-700 font-medium">✓ Association Identifier mapped</span>
          ) : (
            <span className="text-blue-700">
              <strong>Multi-Association Import:</strong> Map one column to "Association Identifier"
              {associationColumns.length > 0 && (
                <span className="ml-2">
                  (Suggested: {associationColumns.slice(0, 2).join(', ')})
                </span>
              )}
            </span>
          )}
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default AssociationIdentifierHelper;
