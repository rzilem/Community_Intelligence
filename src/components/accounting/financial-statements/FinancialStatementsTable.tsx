
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, FileText, BarChart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { financialStatementService, FinancialStatement, StatementType } from '@/services/financial-statements/financial-statement-service';
import GenerateStatementDialog from './GenerateStatementDialog';

interface FinancialStatementsTableProps {
  associationId: string;
  onSelectStatement?: (statementId: string) => void;
}

const FinancialStatementsTable: React.FC<FinancialStatementsTableProps> = ({ 
  associationId,
  onSelectStatement 
}) => {
  const [statements, setStatements] = useState<FinancialStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (associationId) {
      fetchStatements();
    }
  }, [associationId]);

  const fetchStatements = async () => {
    try {
      setLoading(true);
      const data = await financialStatementService.getStatements(associationId);
      setStatements(data);
    } catch (error) {
      console.error('Error fetching statements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStatement = (statementId: string) => {
    if (onSelectStatement) {
      onSelectStatement(statementId);
    } else {
      navigate(`/accounting/financial-statements/${statementId}`);
    }
  };

  const handleGenerateSuccess = (statementId: string) => {
    fetchStatements();
    handleViewStatement(statementId);
  };

  const getStatementTypeIcon = (type: StatementType) => {
    switch (type) {
      case 'income':
        return <FileText className="h-4 w-4" />;
      case 'balance_sheet':
        return <BarChart className="h-4 w-4" />;
      case 'cash_flow':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatStatementType = (type: StatementType) => {
    switch (type) {
      case 'income':
        return 'Income Statement';
      case 'balance_sheet':
        return 'Balance Sheet';
      case 'cash_flow':
        return 'Cash Flow Statement';
      default:
        return type;
    }
  };

  const columns = [
    {
      accessorKey: 'statement_type',
      header: 'Type',
      cell: (info: any) => {
        const type = info.row.original.statement_type as StatementType;
        return (
          <div className="flex items-center gap-2">
            {getStatementTypeIcon(type)}
            <span>{formatStatementType(type)}</span>
          </div>
        );
      }
    },
    {
      accessorKey: 'period_start',
      header: 'Period',
      cell: (info: any) => {
        const start = new Date(info.row.original.period_start);
        const end = new Date(info.row.original.period_end);
        return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
      }
    },
    {
      accessorKey: 'created_at',
      header: 'Generated On',
      cell: (info: any) => format(new Date(info.row.original.created_at), 'MMM d, yyyy')
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (info: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewStatement(info.row.original.id)}
        >
          View
        </Button>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Financial Statements</h3>
        <Button onClick={() => setShowGenerateDialog(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Generate Statement
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={statements}
        isLoading={loading}
      />

      <GenerateStatementDialog
        isOpen={showGenerateDialog}
        onClose={() => setShowGenerateDialog(false)}
        associationId={associationId}
        onSuccess={handleGenerateSuccess}
      />
    </div>
  );
};

export default FinancialStatementsTable;
