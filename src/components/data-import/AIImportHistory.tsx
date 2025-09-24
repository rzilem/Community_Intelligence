import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Download,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface AIImportRecord {
  id: string;
  document_type: string;
  confidence: number;
  extracted_data: any;
  metadata: any;
  created_at: string;
}

interface AIImportHistoryProps {
  associationId: string;
}

const AIImportHistory: React.FC<AIImportHistoryProps> = ({ associationId }) => {
  const [importHistory, setImportHistory] = useState<AIImportRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImportHistory();
  }, [associationId]);

  const fetchImportHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('association_id', associationId)
        .order('uploaded_date', { ascending: false })
        .limit(20);

      if (error) throw error;
      setImportHistory((data || []).map(item => ({
        id: item.id,
        document_type: item.file_type,
        confidence: 0.85,
        extracted_data: { fileName: item.name },
        metadata: { analysisResult: { summary: item.description } },
        created_at: item.uploaded_date
      })) as AIImportRecord[]);
    } catch (error) {
      console.error('Error fetching import history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-50';
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceBadge = (confidence: number) => {
    const percentage = Math.round(confidence * 100);
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'warning';
    return 'destructive';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Import History
        </CardTitle>
        <CardDescription>
          Recent AI-powered data imports for this association
        </CardDescription>
      </CardHeader>
      <CardContent>
        {importHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No AI imports yet</p>
            <p className="text-sm">Upload files using the One-Click AI Import above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {importHistory.map((record) => (
              <div
                key={record.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize">
                        {record.document_type}
                      </Badge>
                      <Badge 
                        variant={getConfidenceBadge(record.confidence)}
                        className="gap-1"
                      >
                        {Math.round(record.confidence * 100)}% Confidence
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(record.created_at), 'MMM d, yyyy HH:mm')}
                      </span>
                    </div>

                    {record.extracted_data?.fileName && (
                      <p className="text-sm font-medium">
                        File: {record.extracted_data.fileName}
                      </p>
                    )}

                    {record.metadata?.analysisResult?.summary && (
                      <p className="text-sm text-muted-foreground">
                        {record.metadata.analysisResult.summary}
                      </p>
                    )}

                    {record.metadata?.analysisResult?.targetTables && (
                      <div className="flex gap-1 flex-wrap">
                        {record.metadata.analysisResult.targetTables.map((table: string) => (
                          <Badge key={table} variant="secondary" className="text-xs">
                            {table}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Download className="h-3 w-3" />
                      Export
                    </Button>
                  </div>
                </div>

                {/* Data Quality Indicators */}
                {record.metadata?.analysisResult?.dataQuality && (
                  <div className="mt-3 flex gap-4 text-xs">
                    {record.metadata.analysisResult.dataQuality.issues?.length > 0 && (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        {record.metadata.analysisResult.dataQuality.issues.length} Issues
                      </div>
                    )}
                    {record.metadata.analysisResult.dataQuality.warnings?.length > 0 && (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Clock className="h-3 w-3" />
                        {record.metadata.analysisResult.dataQuality.warnings.length} Warnings
                      </div>
                    )}
                    {record.metadata.analysisResult.dataQuality.suggestions?.length > 0 && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <CheckCircle className="h-3 w-3" />
                        {record.metadata.analysisResult.dataQuality.suggestions.length} Suggestions
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIImportHistory;