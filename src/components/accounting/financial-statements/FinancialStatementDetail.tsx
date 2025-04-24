
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { financialStatementService } from '@/services/financial-statements/financial-statement-service';
import IncomeStatementView from './IncomeStatementView';
import BalanceSheetView from './BalanceSheetView';
import CashFlowStatementView from './CashFlowStatementView';

interface FinancialStatementDetailProps {
  statementId?: string;
}

const FinancialStatementDetail: React.FC<FinancialStatementDetailProps> = ({ statementId: propStatementId }) => {
  const { statementId: paramStatementId } = useParams<{ statementId: string }>();
  const statementId = propStatementId || paramStatementId;
  
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statement, setStatement] = useState<any>(null);

  useEffect(() => {
    if (statementId) {
      fetchStatement();
    }
  }, [statementId]);

  const fetchStatement = async () => {
    try {
      setLoading(true);
      const data = await financialStatementService.getStatementById(statementId!);
      setStatement(data);
    } catch (error) {
      console.error('Error fetching statement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // This would typically use a library like jsPDF or a backend service
    // to generate and download a PDF, but for now we'll just show a toast
    console.log('Download PDF functionality would be implemented here');
    alert('PDF download feature coming soon!');
  };

  const renderStatementContent = () => {
    if (!statement) return null;

    switch (statement.statement_type) {
      case 'income':
        return <IncomeStatementView data={statement.data} />;
      case 'balance_sheet':
        return <BalanceSheetView data={statement.data} />;
      case 'cash_flow':
        return <CashFlowStatementView data={statement.data} />;
      default:
        return <p>Unknown statement type</p>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-20" />
          <div className="space-x-2">
            <Skeleton className="h-10 w-10 inline-block" />
            <Skeleton className="h-10 w-10 inline-block" />
          </div>
        </div>
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-40 mx-auto" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="space-x-2 print:hidden">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      {statement ? (
        <div className="max-w-3xl mx-auto">
          {renderStatementContent()}
          <div className="text-xs text-right mt-4 text-muted-foreground">
            Generated on {format(new Date(statement.created_at), 'PPP pp')}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p>Statement not found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialStatementDetail;
