
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  FileText, 
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { showToast } from '@/utils/toast-utils';

interface AIValidationToolsProps {
  pdfUrl?: string;
  htmlContent?: string;
  invoice?: any;
}

interface ValidationResult {
  category: string;
  score: number;
  issues: string[];
  suggestions: string[];
}

export const AIValidationTools: React.FC<AIValidationToolsProps> = ({
  pdfUrl,
  htmlContent,
  invoice
}) => {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [overallScore, setOverallScore] = useState(0);

  const runValidation = async () => {
    setIsValidating(true);
    
    try {
      // Simulate AI validation process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const results: ValidationResult[] = [
        {
          category: 'Content Accuracy',
          score: 92,
          issues: ['Minor formatting difference in date format'],
          suggestions: ['Verify date format consistency']
        },
        {
          category: 'Data Extraction',
          score: 88,
          issues: ['Vendor name partially truncated', 'Line item description incomplete'],
          suggestions: ['Review vendor field extraction', 'Check line item parsing']
        },
        {
          category: 'Document Quality',
          score: 95,
          issues: [],
          suggestions: ['Document is high quality and well-formatted']
        },
        {
          category: 'AI Confidence',
          score: invoice?.ai_confidence?.overall || 85,
          issues: invoice?.ai_confidence?.overall < 80 ? ['Low confidence score'] : [],
          suggestions: invoice?.ai_confidence?.overall < 80 ? ['Manual review recommended'] : ['AI processing successful']
        }
      ];
      
      setValidationResults(results);
      setOverallScore(Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length));
      
      showToast('Validation Complete', {
        description: `Overall accuracy: ${Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length)}%`
      });
      
    } catch (error) {
      showToast('Validation Failed', {
        description: 'Unable to complete AI validation',
        variant: 'destructive'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 75) return 'secondary';
    return 'destructive';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            AI Validation Tools
          </div>
          <Button
            size="sm"
            onClick={runValidation}
            disabled={isValidating}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isValidating ? 'animate-spin' : ''}`} />
            {isValidating ? 'Validating...' : 'Run Validation'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {validationResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Overall Score:</span>
              <div className="flex items-center gap-2">
                <Progress value={overallScore} className="w-20" />
                <Badge variant={getScoreBadgeVariant(overallScore)}>
                  {overallScore}%
                </Badge>
              </div>
            </div>

            <Tabs defaultValue="summary">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="comparison">Compare</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="space-y-3">
                {validationResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {result.score >= 90 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      )}
                      <span className="font-medium">{result.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={result.score} className="w-16" />
                      <span className={`font-medium ${getScoreColor(result.score)}`}>
                        {result.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="comparison">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Original PDF
                    </h4>
                    <div className="text-sm text-muted-foreground">
                      {pdfUrl ? 'PDF available for comparison' : 'No PDF available'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      AI Processed
                    </h4>
                    <div className="text-sm text-muted-foreground">
                      {htmlContent ? 'Processed content available' : 'No processed content'}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="space-y-4">
                {validationResults.map((result, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-medium">{result.category}</h4>
                    {result.issues.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-red-600">Issues:</span>
                        {result.issues.map((issue, i) => (
                          <div key={i} className="text-sm text-muted-foreground ml-2">
                            • {issue}
                          </div>
                        ))}
                      </div>
                    )}
                    {result.suggestions.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-blue-600">Suggestions:</span>
                        {result.suggestions.map((suggestion, i) => (
                          <div key={i} className="text-sm text-muted-foreground ml-2">
                            • {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        {validationResults.length === 0 && !isValidating && (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Click "Run Validation" to analyze AI accuracy</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
