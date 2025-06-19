
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye,
  Users,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';
import type { EnhancedDuplicateDetectionResult, EnhancedDuplicateMatch, DuplicateCluster } from '@/services/import-export/enhanced-duplicate-detection-service';

interface DuplicateDetectionDashboardProps {
  results: EnhancedDuplicateDetectionResult;
  onResolveMatch: (matchId: string, action: 'merge' | 'skip' | 'keep_both') => void;
  onResolveCluster: (clusterId: string, action: string) => void;
}

const DuplicateDetectionDashboard: React.FC<DuplicateDetectionDashboardProps> = ({
  results,
  onResolveMatch,
  onResolveCluster
}) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedMatch, setSelectedMatch] = useState<EnhancedDuplicateMatch | null>(null);

  const getSeverityColor = (confidence: number) => {
    if (confidence > 0.9) return 'text-red-600 bg-red-50';
    if (confidence > 0.7) return 'text-yellow-600 bg-yellow-50';
    return 'text-blue-600 bg-blue-50';
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Duplicates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.totalDuplicates}</div>
            <p className="text-xs text-muted-foreground">
              Found across {results.clusters.length} clusters
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Confidence</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{results.highConfidenceMatches}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Resolvable</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {results.duplicates.filter(d => d.suggestedAction === 'skip' || d.suggestedAction === 'merge').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Can be resolved automatically
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(results.performanceMetrics.processingTime / 1000).toFixed(1)}s</div>
            <p className="text-xs text-muted-foreground">
              {results.performanceMetrics.comparisons.toLocaleString()} comparisons
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions Alert */}
      {results.suggestions.length > 0 && (
        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            <strong>Recommendations:</strong>
            <ul className="mt-2 list-disc list-inside space-y-1">
              {results.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm">{suggestion}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="matches">Duplicate Matches</TabsTrigger>
          <TabsTrigger value="clusters">Clusters</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Confidence Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Confidence Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>High Confidence (90%+)</span>
                    <span>{results.highConfidenceMatches}</span>
                  </div>
                  <Progress 
                    value={(results.highConfidenceMatches / results.totalDuplicates) * 100} 
                    className="h-2"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Medium Confidence (70-90%)</span>
                    <span>{results.mediumConfidenceMatches}</span>
                  </div>
                  <Progress 
                    value={(results.mediumConfidenceMatches / results.totalDuplicates) * 100} 
                    className="h-2"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Low Confidence (&lt;70%)</span>
                    <span>{results.lowConfidenceMatches}</span>
                  </div>
                  <Progress 
                    value={(results.lowConfidenceMatches / results.totalDuplicates) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Suggested Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['skip', 'merge', 'manual_review', 'keep_both'].map(action => {
                    const count = results.duplicates.filter(d => d.suggestedAction === action).length;
                    const percentage = results.totalDuplicates > 0 ? (count / results.totalDuplicates) * 100 : 0;
                    
                    return (
                      <div key={action} className="flex items-center justify-between">
                        <Badge variant="outline" className="capitalize">
                          {action.replace('_', ' ')}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{count}</span>
                          <span className="text-xs text-muted-foreground">
                            ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <div className="grid gap-4">
            {results.duplicates.map((match) => (
              <Card key={match.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={getRiskBadgeVariant(match.riskLevel)}>
                        {match.riskLevel} risk
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {match.matchType}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {(match.confidence * 100).toFixed(1)}% confidence
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMatch(match)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      {match.suggestedAction !== 'manual_review' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onResolveMatch(match.id, match.suggestedAction as any)}
                        >
                          Auto-Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Source: {match.sourceFile}</h4>
                      <div className="text-sm space-y-1">
                        {Object.entries(match.sourceRecord)
                          .filter(([key]) => !key.startsWith('_'))
                          .slice(0, 3)
                          .map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span> {String(value)}
                            </div>
                          ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Target: {match.targetFile}</h4>
                      <div className="text-sm space-y-1">
                        {Object.entries(match.targetRecord)
                          .filter(([key]) => !key.startsWith('_'))
                          .slice(0, 3)
                          .map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span> {String(value)}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                  
                  {match.matchingFields.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium mb-2">Matching Fields:</h5>
                      <div className="flex flex-wrap gap-1">
                        {match.matchingFields.map((field, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {field.field} ({(field.similarity * 100).toFixed(0)}%)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="clusters" className="space-y-4">
          <div className="grid gap-4">
            {results.clusters.map((cluster) => (
              <Card key={cluster.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Cluster {cluster.id} ({cluster.records.length} records)
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {(cluster.confidence * 100).toFixed(1)}% confidence
                      </Badge>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onResolveCluster(cluster.id, cluster.suggestedAction)}
                      >
                        <Target className="h-4 w-4 mr-1" />
                        Resolve Cluster
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Master Record (Highest Quality):</h4>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                          {Object.entries(cluster.masterRecord)
                            .filter(([key]) => !key.startsWith('_'))
                            .slice(0, 6)
                            .map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}:</span> {String(value)}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Other Records in Cluster:</h4>
                      <div className="space-y-2">
                        {cluster.records.filter(r => r !== cluster.masterRecord).map((record, index) => (
                          <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {Object.entries(record)
                                .filter(([key]) => !key.startsWith('_'))
                                .slice(0, 3)
                                .map(([key, value]) => (
                                  <div key={key}>
                                    <span className="font-medium">{key}:</span> {String(value)}
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{results.performanceMetrics.recordsProcessed}</div>
                  <div className="text-sm text-muted-foreground">Records Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{results.performanceMetrics.comparisons.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Comparisons Made</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{(results.performanceMetrics.processingTime / 1000).toFixed(2)}s</div>
                  <div className="text-sm text-muted-foreground">Processing Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {Math.round(results.performanceMetrics.comparisons / (results.performanceMetrics.processingTime / 1000))}
                  </div>
                  <div className="text-sm text-muted-foreground">Comparisons/sec</div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-2">Algorithms Used:</h4>
                <div className="flex flex-wrap gap-2">
                  {results.performanceMetrics.algorithmsUsed.map((algorithm) => (
                    <Badge key={algorithm} variant="outline" className="capitalize">
                      {algorithm}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Match Detail Modal would go here */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Duplicate Match Details</CardTitle>
                <Button variant="outline" onClick={() => setSelectedMatch(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Detailed comparison view would go here */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Source Record</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedMatch.sourceRecord)
                        .filter(([key]) => !key.startsWith('_'))
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between py-1 border-b">
                            <span className="font-medium">{key}:</span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">Target Record</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedMatch.targetRecord)
                        .filter(([key]) => !key.startsWith('_'))
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between py-1 border-b">
                            <span className="font-medium">{key}:</span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => onResolveMatch(selectedMatch.id, 'merge')}>
                    Merge Records
                  </Button>
                  <Button variant="outline" onClick={() => onResolveMatch(selectedMatch.id, 'skip')}>
                    Skip Duplicate
                  </Button>
                  <Button variant="outline" onClick={() => onResolveMatch(selectedMatch.id, 'keep_both')}>
                    Keep Both
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DuplicateDetectionDashboard;
