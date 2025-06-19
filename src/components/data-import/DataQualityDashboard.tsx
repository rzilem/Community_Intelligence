
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
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
  FileText,
  AlertCircle
} from 'lucide-react';
import type { DataQualityReport, DataQualityIssue } from '@/services/import-export/data-quality-service';

interface DataQualityDashboardProps {
  report: DataQualityReport;
  onAutoFix: () => void;
  onResolveIssue: (issueId: string) => void;
}

const DataQualityDashboard: React.FC<DataQualityDashboardProps> = ({
  report,
  onAutoFix,
  onResolveIssue
}) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedIssue, setSelectedIssue] = useState<DataQualityIssue | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (score >= 70) return <BarChart3 className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4"  />;
      case 'medium': return <AlertCircle className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Score Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Data Quality Score</h2>
              <div className="flex items-center gap-4">
                <div className={`text-6xl font-bold ${getScoreColor(report.overallScore)}`}>
                  {report.overallScore}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    {getScoreIcon(report.overallScore)}
                    <span className="text-sm font-medium">
                      {report.overallScore >= 90 ? 'Excellent' : 
                       report.overallScore >= 70 ? 'Good' : 
                       report.overallScore >= 50 ? 'Fair' : 'Poor'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {report.totalRecords} records analyzed
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold mb-1">{report.totalIssues}</div>
              <div className="text-sm text-muted-foreground mb-3">Total Issues</div>
              {report.fixableIssues > 0 && (
                <Button onClick={onAutoFix} className="gap-2">
                  <Zap className="h-4 w-4" />
                  Auto-Fix {report.fixableIssues} Issues
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(report.issuesBySeverity).map(([severity, count]) => (
          <Card key={severity}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">{severity} Issues</CardTitle>
              {getSeverityIcon(severity)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
              <p className="text-xs text-muted-foreground">
                {report.totalIssues > 0 ? ((count / report.totalIssues) * 100).toFixed(1) : 0}% of total
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            <strong>Quality Recommendations:</strong>
            <ul className="mt-2 list-disc list-inside space-y-1">
              {report.recommendations.map((recommendation, index) => (
                <li key={index} className="text-sm">{recommendation}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="issues">Issues ({report.totalIssues})</TabsTrigger>
          <TabsTrigger value="fields">Field Quality</TabsTrigger>
          <TabsTrigger value="types">Issue Types</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Issue Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Issue Distribution by Severity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(report.issuesBySeverity).map(([severity, count]) => (
                  <div key={severity} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize font-medium">{severity}</span>
                      <span>{count} issues</span>
                    </div>
                    <Progress 
                      value={report.totalIssues > 0 ? (count / report.totalIssues) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Issue Types */}
            <Card>
              <CardHeader>
                <CardTitle>Issue Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(report.issuesByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {type.replace('_', ' ')}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{count}</span>
                      <span className="text-xs text-muted-foreground">
                        ({report.totalIssues > 0 ? ((count / report.totalIssues) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Processing Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Processing Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{report.totalRecords}</div>
                  <div className="text-sm text-muted-foreground">Records Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{(report.processingTime / 1000).toFixed(2)}s</div>
                  <div className="text-sm text-muted-foreground">Processing Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {Math.round(report.totalRecords / (report.processingTime / 1000))}
                  </div>
                  <div className="text-sm text-muted-foreground">Records/sec</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <div className="grid gap-4">
            {report.issues.map((issue) => (
              <Card key={issue.id} className={`border-l-4 ${getSeverityColor(issue.severity)}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(issue.severity)}
                      <Badge variant="outline" className="capitalize">
                        {issue.severity}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        {issue.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Field: {issue.field}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {issue.autoFixable && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Auto-fixable
                        </Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onResolveIssue(issue.id)}
                      >
                        Resolve
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">{issue.description}</p>
                    {issue.suggestedFix && (
                      <p className="text-sm text-blue-600">
                        <strong>Suggested fix:</strong> {issue.suggestedFix}
                      </p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Record #{issue.recordIndex + 1} • Confidence: {(issue.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fields" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Field Quality Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(report.fieldQualityScores)
                  .sort(([,a], [,b]) => a - b) // Sort by score, lowest first
                  .map(([field, score]) => (
                    <div key={field} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{field}</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${getScoreColor(score)}`}>
                            {score}%
                          </span>
                          {getScoreIcon(score)}
                        </div>
                      </div>
                      <Progress value={score} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {report.issues.filter(issue => issue.field === field).length} issues found
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(report.issuesByType).map(([type, count]) => {
              const typeIssues = report.issues.filter(issue => issue.type === type);
              const avgConfidence = typeIssues.length > 0 
                ? typeIssues.reduce((sum, issue) => sum + issue.confidence, 0) / typeIssues.length
                : 0;
              const autoFixableCount = typeIssues.filter(issue => issue.autoFixable).length;
              
              return (
                <Card key={type}>
                  <CardHeader>
                    <CardTitle className="capitalize">{type.replace('_', ' ')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Issues:</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Auto-fixable:</span>
                        <span className="font-medium">{autoFixableCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg. Confidence:</span>
                        <span className="font-medium">{(avgConfidence * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={(count / report.totalIssues) * 100} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {((count / report.totalIssues) * 100).toFixed(1)}% of all issues
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataQualityDashboard;
