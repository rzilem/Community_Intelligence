
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AIBadge from '@/components/ui/ai-badge';

interface AIProcessingControlsProps {
  lead: any;
  onProcessingComplete: () => void;
  compact?: boolean;
}

const AIProcessingControls: React.FC<AIProcessingControlsProps> = ({
  lead,
  onProcessingComplete,
  compact = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAIProcess = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-lead-processor', {
        body: {
          leadId: lead.id
        }
      });

      if (error) {
        toast.error(`AI processing failed: ${error.message}`);
        return;
      }

      if (data.success) {
        toast.success('Lead processed successfully with AI');
        onProcessingComplete();
      } else {
        toast.error('AI processing failed');
      }
    } catch (error) {
      console.error('AI processing error:', error);
      toast.error('Failed to process lead with AI');
    } finally {
      setIsProcessing(false);
    }
  };

  const getAverageConfidence = () => {
    if (!lead.ai_confidence) return 0;
    const scores = Object.values(lead.ai_confidence);
    const numericScores = scores.filter((score): score is number => typeof score === 'number');
    return numericScores.length > 0 ? numericScores.reduce((a, b) => a + b, 0) / numericScores.length : 0;
  };

  const hasAIData = lead.ai_confidence && Object.keys(lead.ai_confidence).length > 0;
  const avgConfidence = getAverageConfidence();

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {hasAIData && (
          <AIBadge confidence={avgConfidence} />
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={handleAIProcess}
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
        <Sparkles className="h-4 w-4 text-blue-500" />
        <span className="text-sm font-medium">AI Processing</span>
        <Badge variant={hasAIData ? 'default' : 'secondary'}>
          {hasAIData ? 'processed' : 'pending'}
        </Badge>
      </div>

      {hasAIData && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Confidence:</span>
          <AIBadge confidence={avgConfidence} />
          <span className="text-sm">{Math.round(avgConfidence * 100)}%</span>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleAIProcess}
          disabled={isProcessing}
          variant={hasAIData ? 'outline' : 'default'}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {hasAIData ? 'Re-process' : 'Process'} with AI
            </>
          )}
        </Button>
      </div>

      {lead.ai_generated_fields && lead.ai_generated_fields.length > 0 && (
        <div className="text-xs text-muted-foreground">
          AI-generated: {lead.ai_generated_fields.join(', ')}
        </div>
      )}
    </div>
  );
};

export default AIProcessingControls;
