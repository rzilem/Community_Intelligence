
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, X, Download, Send, Settings } from 'lucide-react';
import { Invoice } from '@/types/invoice-types';

interface EnhancedInvoiceActionsProps {
  invoice: Invoice;
  onApprove?: () => void;
  onReject?: () => void;
  onDownload?: () => void;
  onSend?: () => void;
  onSettings?: () => void;
  isLoading?: boolean;
}

export const EnhancedInvoiceActions: React.FC<EnhancedInvoiceActionsProps> = React.memo(({
  invoice,
  onApprove,
  onReject,
  onDownload,
  onSend,
  onSettings,
  isLoading = false
}) => {
  const canApprove = invoice.status === 'pending';
  const canReject = invoice.status === 'pending';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-2">
          {canApprove && onApprove && (
            <Button 
              onClick={onApprove}
              disabled={isLoading}
              className="w-full"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Invoice
            </Button>
          )}
          
          {canReject && onReject && (
            <Button 
              variant="destructive"
              onClick={onReject}
              disabled={isLoading}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Reject Invoice
            </Button>
          )}
          
          {onDownload && (
            <Button 
              variant="outline"
              onClick={onDownload}
              disabled={isLoading}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
          
          {onSend && (
            <Button 
              variant="outline"
              onClick={onSend}
              disabled={isLoading}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

EnhancedInvoiceActions.displayName = 'EnhancedInvoiceActions';
