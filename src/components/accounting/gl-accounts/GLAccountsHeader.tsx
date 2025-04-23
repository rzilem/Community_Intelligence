
import React from 'react';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AssociationSelector from '@/components/associations/AssociationSelector';

interface GLAccountsHeaderProps {
  onAssociationChange: (associationId: string) => void;
}

export const GLAccountsHeader: React.FC<GLAccountsHeaderProps> = ({ 
  onAssociationChange 
}) => {
  return (
    <CardHeader>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <CardTitle>Chart of Accounts</CardTitle>
          <CardDescription>Manage general ledger accounts for your associations</CardDescription>
        </div>
        <AssociationSelector 
          className="md:self-end" 
          onAssociationChange={onAssociationChange}
        />
      </div>
    </CardHeader>
  );
};
