
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AIBadge from '@/components/ui/ai-badge';

interface AIProcessingControlsProps {
  invoice: any;
  onProcessingComplete: () => void;
  compact?: boolean;
}

const AIProcessingControls: React.FC<AIProcessingControlsProps> = ({
  invoice,
  onProcessingComplete,
  compact = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAIProcess = async (reprocess = false) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-invoice-processor', {
        body: {
          invoiceId: invoice.id,
          reprocess
        }
      });

      if (error) {
        toast.error(`AI processing failed: ${error.message}`);
        return;
      }

      if (data.success) {
        toast.success('Invoice processed successfully with AI');
        onProcessingComplete();
      } else {
        toast.error('AI processing failed');
      }
    } catch (error) {
      console.error('AI processing error:', error);
      toast.error('Failed to process invoice with AI');
    } finally {
      setIsProcessing(false);
    }
  };

  const getProcessingStatus = () => {
    if (invoice.ai_processing_status === 'completed') {
      return { status: 'completed', color: 'green', icon: CheckCircle2 };
    }
    if (invoice.ai_processing_status === 'failed') {
      return { status: 'failed', color: 'red', icon: AlertCircle };
    }
    return { status: 'pending', color: 'yellow', icon: Sparkles };
  };

  const getAverageConfidence = () => {
    if (!invoice.ai_confidence) return 0;
    const scores = Object.values(invoice.ai_confidence);
    const numericScores = scores.filter((score): score is number => typeof score === 'number');
    return numericScores.length > 0 ? numericScores.reduce((a, b) => a + b, 0) / numericScores.length : 0;
  };

  const { status, color, icon: StatusIcon } = getProcessingStatus();
  const avgConfidence = getAverageConfidence();

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {invoice.ai_confidence && (
          <AIBadge confidence={avgConfidence} />
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAIProcess(status === 'completed')}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <Sparkles className="h-3 w-3" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <StatusIcon className={`h-4 w-4 text-${color}-500`} />
        <span className="text-sm font-medium">AI Processing</span>
        <Badge variant={status === 'completed' ? 'default' : 'secondary'}>
          {status}
        </Badge>
      </div>

      {invoice.ai_confidence && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Confidence:</span>
          <AIBadge confidence={avgConfidence} />
          <span className="text-sm">{Math.round(avgConfidence * 100)}%</span>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => handleAIProcess(false)}
          disabled={isProcessing}
          variant={status === 'completed' ? 'outline' : 'default'}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {status === 'completed' ? 'Re-process' : 'Process'} with AI
            </>
          )}
        </Button>

        {status === 'completed' && avgConfidence < 0.8 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAIProcess(true)}
            disabled={isProcessing}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Improve Accuracy
          </Button>
        )}
      </div>

      {invoice.ai_processed_at && (
        <p className="text-xs text-muted-foreground">
          Last processed: {new Date(invoice.ai_processed_at).toLocaleString()}
        </p>
      )}
    </div>
  );
};

export default AIProcessingControls;
