
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileText, BarChart2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import FinancialStatementDetail from '@/components/accounting/financial-statements/FinancialStatementDetail';

const FinancialStatementDetailPage = () => {
  return (
    <PageTemplate 
      title="Financial Statement" 
      icon={<FileText className="h-8 w-8" />}
      description="View financial statement details."
      backLink="/accounting/financial-statements"
    >
      <Card>
        <CardContent className="p-6">
          <FinancialStatementDetail />
        </CardContent>
      </Card>
    </PageTemplate>
  );
};

export default FinancialStatementDetailPage;
