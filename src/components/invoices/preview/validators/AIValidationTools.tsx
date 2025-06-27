
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  RefreshCw,
  Loader2,
  FileText,
  DollarSign,
  Calendar,
  Building
} from 'lucide-react';
import { showToast } from '@/utils/toast-utils';

interface ValidationResult {
  field: string;
  confidence: number;
  status: 'verified' | 'warning' | 'error';
  aiValue: string;
  documentValue?: string;
  suggestion?: string;
}

interface AIValidationToolsProps {
  pdfUrl?: string;
  htmlContent?: string;
  aiData?: any;
  onValidationComplete?: (results: ValidationResult[]) => void;
}

export const AIValidationTools: React.FC<AIValidationToolsProps> = ({
  pdfUrl,
  htmlContent,
  aiData,
  onValidationComplete
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [validationProgress, setValidationProgress] = useState(0);

  const runValidation = async () => {
    setIsValidating(true);
    setValidationProgress(0);

    try {
      // Simulate validation steps
      setValidationProgress(25);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Simulate AI vs Document comparison
      const mockResults: ValidationResult[] = [
        {
          field: 'Total Amount',
          confidence: 95,
          status: 'verified',
          aiValue: '$1,500.00',
          documentValue: '$1,500.00'
        },
        {
          field: 'Vendor Name',
          confidence: 88,
          status: 'warning',
          aiValue: 'ABC Company LLC',
          documentValue: 'ABC Company',
          suggestion: 'Check if full legal name should be used'
        },
        {
          field: 'Invoice Date',
          confidence: 92,
          status: 'verified',
          aiValue: '2024-01-15',
          documentValue: '2024-01-15'
        },
        {
          field: 'Line Items',
          confidence: 75,
          status: 'warning',
          aiValue: '2 items detected',
          documentValue: '2 items found',
          suggestion: 'Review line item descriptions for accuracy'
        }
      ];

      setValidationProgress(75);
      await new Promise(resolve => setTimeout(resolve, 600));

      setValidationResults(mockResults);
      onValidationComplete?.(mockResults);
      setValidationProgress(100);

      showToast('AI Validation Complete', {
        description: `Validated ${mockResults.length} fields with ${mockResults.filter(r => r.status === 'verified').length} verified`
      });

    } catch (error) {
      showToast('Validation Failed', {
        description: 'Unable to complete AI validation'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getFieldIcon = (field: string) => {
    if (field.toLowerCase().includes('amount') || field.toLowerCase().includes('total')) {
      return <DollarSign className="h-4 w-4" />;
    }
    if (field.toLowerCase().includes('date')) {
      return <Calendar className="h-4 w-4" />;
    }
    if (field.toLowerCase().includes('vendor') || field.toLowerCase().includes('company')) {
      return <Building className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            AI Validation
          </div>
          <Button
            size="sm"
            onClick={runValidation}
            disabled={isValidating || (!pdfUrl && !htmlContent)}
            className="flex items-center gap-2"
          >
            {isValidating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isValidating ? 'Validating...' : 'Validate'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isValidating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Validating AI extraction...</span>
              <span>{validationProgress}%</span>
            </div>
            <Progress value={validationProgress} />
          </div>
        )}

        {validationResults.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Validation Results</span>
              <div className="flex gap-2">
                <Badge variant="default" className="text-xs">
                  {validationResults.filter(r => r.status === 'verified').length} Verified
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {validationResults.filter(r => r.status === 'warning').length} Warnings
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              {validationResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getFieldIcon(result.field)}
                      <span className="text-sm font-medium">{result.field}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="text-xs text-muted-foreground">
                        {result.confidence}% confidence
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">AI Value:</span>
                      <div className="font-mono">{result.aiValue}</div>
                    </div>
                    {result.documentValue && (
                      <div>
                        <span className="text-muted-foreground">Document:</span>
                        <div className="font-mono">{result.documentValue}</div>
                      </div>
                    )}
                  </div>

                  {result.suggestion && (
                    <div className="text-xs text-muted-foreground">
                      💡 {result.suggestion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!isValidating && validationResults.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click "Validate" to compare AI extraction with document</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
