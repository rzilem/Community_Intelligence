
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Trash2, Download, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useSupabaseQuery } from '@/hooks/supabase/use-supabase-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BankStatement {
  id: string;
  statement_date: string;
  filename: string;
  file_url: string;
  file_size: number;
  import_status: 'pending' | 'processing' | 'processed' | 'failed';
  balance_ending?: number;
  created_at: string;
}

interface BankStatementTableProps {
  accountId: string;
}

const BankStatementTable: React.FC<BankStatementTableProps> = ({ accountId }) => {
  const { data: statements, isLoading, refetch } = useSupabaseQuery<BankStatement[]>(
    'bank_statements',
    {
      filter: [{ column: 'bank_account_id', value: accountId }],
      order: { column: 'statement_date', ascending: false },
    }
  );

  const handleDownload = async (fileUrl: string, filename: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bank_statements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Statement deleted successfully');
      refetch();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(`Failed to delete statement: ${error.message}`);
    }
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
    return `${Math.round(size / (1024 * 1024))} MB`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MM/dd/yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <span className="text-green-600 text-xs font-medium">Processed</span>;
      case 'processing':
        return <span className="text-blue-600 text-xs font-medium">Processing</span>;
      case 'failed':
        return <span className="text-red-600 text-xs font-medium">Failed</span>;
      default:
        return <span className="text-amber-600 text-xs font-medium">Pending</span>;
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading statements...</div>;
  }

  if (!statements || statements.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        No statements found. Upload a statement to see it here.
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">Recent Statements</h3>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Filename</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statements.map((statement) => (
              <TableRow key={statement.id}>
                <TableCell>{formatDate(statement.statement_date)}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{statement.filename}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({formatFileSize(statement.file_size)})
                    </span>
                  </div>
                </TableCell>
                <TableCell>{getStatusIcon(statement.import_status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownload(statement.file_url, statement.filename)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive"
                      onClick={() => handleDelete(statement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BankStatementTable;
