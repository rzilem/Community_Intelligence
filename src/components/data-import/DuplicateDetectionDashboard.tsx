import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  FileText,
  TrendingUp,
  BarChart3,
  Settings
} from 'lucide-react';
import { 
  enhancedDuplicateDetectionService,
  EnhancedDuplicateDetectionResult,
  EnhancedDuplicateMatch,
  DuplicateCluster
} from '@/services/import-export/enhanced-duplicate-detection-service';
import { toast } from 'sonner';
import { devLog } from '@/utils/dev-logger';

interface DuplicateDetectionDashboardProps {
  files: Array<{ filename: string; data: any[] }>;
  onProcessComplete?: (results: EnhancedDuplicateDetectionResult) => void;
  autoProcess?: boolean;
}

const DuplicateDetectionDashboard: React.FC<DuplicateDetectionDashboardProps> = ({ files, onProcessComplete, autoProcess = true }) => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<EnhancedDuplicateDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    if (autoProcess && files && files.length > 0) {
      detectDuplicates();
    }
  }, [files, autoProcess]);

  const detectDuplicates = async () => {
    setProcessing(true);
    setProgress(10);
    setError(null);

    try {
      const detectionResults = await enhancedDuplicateDetectionService.detectDuplicatesAdvanced(
        files,
        {
          strictMode: false,
          fuzzyMatching: true,
          confidenceThreshold: 0.7,
          semanticAnalysis: true
        }
      );

      setResults(detectionResults);
      setProgress(100);
      toast.success(`Found ${detectionResults.totalDuplicates} potential duplicates`);
      onProcessComplete?.(detectionResults);
    } catch (err: any) {
      setError(err.message || 'Duplicate detection failed');
      toast.error(`Duplicate detection failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleRetry = () => {
    setResults(null);
    setError(null);
    detectDuplicates();
  };

  const getSeverityColor = (confidence: number): string => {
    if (confidence > 0.9) return 'text-red-500';
    if (confidence > 0.8) return 'text-orange-500';
    return 'text-yellow-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-500" />
          Duplicate Detection Dashboard
        </CardTitle>
        <CardDescription>
          Analyze and manage potential duplicate records across your data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {processing && (
          <div className="space-y-2">
            <p>Detecting duplicates...</p>
            <Progress value={progress} />
          </div>
        )}

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <p>Error: {error}</p>
            <Button variant="secondary" size="sm" onClick={handleRetry}>
              Retry
            </Button>
          </div>
        )}

        {results && (
          <Tabs defaultValue="summary" className="space-y-4" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="summary">
                <FileText className="h-4 w-4 mr-2" />
                Summary
              </TabsTrigger>
              <TabsTrigger value="matches">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Matches
              </TabsTrigger>
              <TabsTrigger value="clusters">
                <Users className="h-4 w-4 mr-2" />
                Clusters
              </TabsTrigger>
              <TabsTrigger value="quality">
                <TrendingUp className="h-4 w-4 mr-2" />
                Quality
              </TabsTrigger>
              <TabsTrigger value="stats">
                <BarChart3 className="h-4 w-4 mr-2" />
                Stats
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-2">
              <h3 className="text-lg font-semibold">Detection Summary</h3>
              <p>
                Found <Badge variant="secondary">{results.totalDuplicates}</Badge> potential
                duplicate records.
              </p>
              <p>
                <Badge variant="outline">{results.recommendations.suggestions.length}</Badge>{' '}
                recommendations available.
              </p>
            </TabsContent>

            <TabsContent value="matches" className="space-y-2">
              <h3 className="text-lg font-semibold">Duplicate Matches</h3>
              {results.enhancedMatches.length === 0 ? (
                <p>No duplicate matches found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.enhancedMatches.map((match, index) => (
                    <Card key={index} className="border-2 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">
                          Match #{index + 1}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm space-y-1">
                        <p>
                          Source: {match.sourceFile} (Record #{match.sourceIndex})
                        </p>
                        <p>
                          Target: {match.targetFile} (Record #{match.targetIndex})
                        </p>
                        <p className={`font-semibold ${getSeverityColor(match.confidence)}`}>
                          Confidence: {(match.confidence * 100).toFixed(2)}%
                        </p>
                        <p>Matching Fields: {match.matchingFields.join(', ')}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="clusters" className="space-y-2">
              <h3 className="text-lg font-semibold">Duplicate Clusters</h3>
              {results.clusters.length === 0 ? (
                <p>No duplicate clusters found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.clusters.map((cluster, index) => (
                    <Card key={index} className="border-2 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">
                          Cluster #{index + 1}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm space-y-1">
                        <p>Records: {cluster.records.length}</p>
                        <p>Confidence: {(cluster.confidence * 100).toFixed(2)}%</p>
                        <p>Common Fields: {cluster.commonFields.join(', ')}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="quality" className="space-y-2">
              <h3 className="text-lg font-semibold">Data Quality Assessment</h3>
              <p>Overall Quality Score: {results.qualityScore}%</p>
              <p>
                <TrendingUp className="h-4 w-4 inline-block mr-1" />
                Based on match confidence, contextual similarity, and semantic analysis.
              </p>
            </TabsContent>

            <TabsContent value="stats" className="space-y-2">
              <h3 className="text-lg font-semibold">Processing Statistics</h3>
              <p>Total Comparisons: {results.processingStats.totalComparisons}</p>
              <p>Processing Time: {results.processingStats.processingTime}ms</p>
            </TabsContent>

            <TabsContent value="settings" className="space-y-2">
              <h3 className="text-lg font-semibold">Detection Settings</h3>
              <p>Adjust duplicate detection sensitivity and matching criteria.</p>
            </TabsContent>
          </Tabs>
        )}

        {!processing && !results && !error && (
          <div className="text-center">
            <p>No duplicate detection has been run yet.</p>
            <Button onClick={detectDuplicates}>Run Duplicate Detection</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DuplicateDetectionDashboard;
