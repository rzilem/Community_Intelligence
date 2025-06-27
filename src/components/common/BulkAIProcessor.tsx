
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BulkAIProcessorProps {
  items: any[];
  itemType: 'invoices' | 'leads';
  onProcessingComplete: () => void;
}

const BulkAIProcessor: React.FC<BulkAIProcessorProps> = ({
  items,
  itemType,
  onProcessingComplete
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentItem, setCurrentItem] = useState('');
  const [processedCount, setProcessedCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  const handleBulkProcess = async () => {
    setIsProcessing(true);
    setProgress(0);
    setProcessedCount(0);
    setSuccessCount(0);
    setErrorCount(0);

    const functionName = itemType === 'invoices' ? 'ai-invoice-processor' : 'ai-lead-processor';
    const total = items.length;

    for (let i = 0; i < total; i++) {
      const item = items[i];
      setCurrentItem(item.vendor || item.company_name || item.invoice_number || 'Unknown');
      
      try {
        const { data, error } = await supabase.functions.invoke(functionName, {
          body: {
            [itemType === 'invoices' ? 'invoiceId' : 'leadId']: item.id
          }
        });

        if (error) {
          console.error(`Error processing ${itemType.slice(0, -1)} ${item.id}:`, error);
          setErrorCount(prev => prev + 1);
        } else if (data.success) {
          setSuccessCount(prev => prev + 1);
        } else {
          setErrorCount(prev => prev + 1);
        }
      } catch (error) {
        console.error(`Error processing ${itemType.slice(0, -1)} ${item.id}:`, error);
        setErrorCount(prev => prev + 1);
      }

      setProcessedCount(prev => prev + 1);
      setProgress(((i + 1) / total) * 100);
    }

    setIsProcessing(false);
    setCurrentItem('');
    
    toast.success(
      `Bulk processing complete! ${successCount} successful, ${errorCount} errors.`
    );
    
    onProcessingComplete();
  };

  const unprocessedItems = items.filter(item => {
    if (itemType === 'invoices') {
      return !item.ai_processing_status || item.ai_processing_status !== 'completed';
    } else {
      return !item.ai_confidence || Object.keys(item.ai_confidence).length === 0;
    }
  });

  if (unprocessedItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            All {itemType} processed
          </CardTitle>
          <CardDescription>
            All {itemType} have been processed with AI. You can re-process individual items if needed.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          Bulk AI Processing
        </CardTitle>
        <CardDescription>
          Process {unprocessedItems.length} unprocessed {itemType} with AI to auto-fill information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing: {currentItem}</span>
              <span>{processedCount} / {unprocessedItems.length}</span>
            </div>
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>✅ Success: {successCount}</span>
              <span>❌ Errors: {errorCount}</span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleBulkProcess}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Processing {itemType}...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Process {unprocessedItems.length} {itemType} with AI
              </>
            )}
          </Button>
        </div>

        {!isProcessing && (
          <div className="text-sm text-muted-foreground">
            <p>This will process unprocessed {itemType} to:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              {itemType === 'invoices' ? (
                <>
                  <li>Extract vendor information</li>
                  <li>Parse invoice numbers and amounts</li>
                  <li>Identify due dates and line items</li>
                  <li>Provide confidence scores</li>
                </>
              ) : (
                <>
                  <li>Extract company and contact information</li>
                  <li>Identify property types and requirements</li>
                  <li>Determine lead priority and timeline</li>
                  <li>Provide confidence scores</li>
                </>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkAIProcessor;
