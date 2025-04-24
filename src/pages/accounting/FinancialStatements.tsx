
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { BarChart2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import AssociationSelector from '@/components/associations/AssociationSelector';
import FinancialStatementsTable from '@/components/accounting/financial-statements/FinancialStatementsTable';
import FinancialStatementDetail from '@/components/accounting/financial-statements/FinancialStatementDetail';

const FinancialStatementsPage = () => {
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | undefined>();
  const [selectedStatementId, setSelectedStatementId] = useState<string | undefined>();

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
    setSelectedStatementId(undefined); // Clear selected statement when association changes
  };

  return (
    <PageTemplate 
      title="Financial Statements" 
      icon={<BarChart2 className="h-8 w-8" />}
      description="Generate and view financial statements."
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">Financial Statements</h2>
              <p className="text-muted-foreground">
                Generate and view income statements, balance sheets, and cash flow statements
              </p>
            </div>
            <AssociationSelector
              className="md:w-[250px]"
              onAssociationChange={handleAssociationChange}
              initialAssociationId={selectedAssociationId}
            />
          </div>

          {selectedStatementId ? (
            <FinancialStatementDetail 
              statementId={selectedStatementId} 
            />
          ) : (
            selectedAssociationId ? (
              <FinancialStatementsTable 
                associationId={selectedAssociationId} 
                onSelectStatement={setSelectedStatementId}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Please select an association to view financial statements</p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </PageTemplate>
  );
};

export default FinancialStatementsPage;
