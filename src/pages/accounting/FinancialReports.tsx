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
    <PageTemplate 
      title="Financial Reports" 
      description="Generate comprehensive financial statements and management reports for HOA operations"
      icon={BarChart2}
    >
      <div className="space-y-6">
        <AssociationSelector
          value={selectedAssociationId}
          onValueChange={handleAssociationChange}
          placeholder="Select association to generate reports"
        />

        {selectedAssociationId && (
          <AdvancedFinancialReports associationId={selectedAssociationId} />
        )}
      </div>
    </PageTemplate>
  );
};

export default FinancialReports;