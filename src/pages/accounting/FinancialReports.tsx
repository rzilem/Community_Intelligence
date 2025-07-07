import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { BarChart2 } from 'lucide-react';
import AssociationSelector from '@/components/associations/AssociationSelector';
import AdvancedFinancialReports from '@/components/accounting/AdvancedFinancialReports';

const FinancialReports = () => {
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | undefined>();

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground">
            Generate comprehensive financial statements and management reports for HOA operations
          </p>
        </div>
      </div>
      
      <AssociationSelector
        onAssociationChange={handleAssociationChange}
      />

      {selectedAssociationId && (
        <AdvancedFinancialReports associationId={selectedAssociationId} />
      )}
    </div>
  );
};

export default FinancialReports;