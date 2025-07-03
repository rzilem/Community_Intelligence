import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  FileText, 
  Eye,
  Check,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ThreeWayMatchingService, MatchingException } from '@/services/accounting/three-way-matching-service';

interface ThreeWayMatchingDashboardProps {
  associationId: string;
}

const ThreeWayMatchingDashboard: React.FC<ThreeWayMatchingDashboardProps> = ({ associationId }) => {
  const [matches, setMatches] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [showExceptionsDialog, setShowExceptionsDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [associationId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [matchesData, statsData] = await Promise.all([
        ThreeWayMatchingService.getThreeWayMatches(associationId),
        ThreeWayMatchingService.getMatchingStatistics(associationId)
      ]);
      
      setMatches(matchesData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Error loading matching data:', error);
      toast({
        title: "Error",
        description: "Failed to load matching data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveMatch = async (matchId: string) => {
    try {
      await ThreeWayMatchingService.approveMatch(matchId, 'user-approval');
      toast({
        title: "Success",
        description: "Match approved successfully",
      });
      loadData();
    } catch (error) {
      console.error('Error approving match:', error);
      toast({
        title: "Error",
        description: "Failed to approve match",
        variant: "destructive",
      });
    }
  };

  const handleRejectMatch = async (matchId: string) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;

    try {
      await ThreeWayMatchingService.rejectMatch(matchId, reason);
      toast({
        title: "Success",
        description: "Match rejected",
      });
      loadData();
    } catch (error) {
      console.error('Error rejecting match:', error);
      toast({
        title: "Error",
        description: "Failed to reject match",
        variant: "destructive",
      });
    }
  };

  const handleOverrideMatch = async (matchId: string, newStatus: 'approved' | 'rejected') => {
    const reason = prompt(`Please enter override reason for ${newStatus}:`);
    if (!reason) return;

    try {
      await ThreeWayMatchingService.overrideMatch(matchId, reason, newStatus);
      toast({
        title: "Success",
        description: `Match ${newStatus} with override`,
      });
      loadData();
    } catch (error) {
      console.error('Error overriding match:', error);
      toast({
        title: "Error",
        description: "Failed to override match",
        variant: "destructive",
      });
    }
  };

  const getMatchStatusBadge = (status: string, autoApproved: boolean) => {
    if (autoApproved) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Auto-Approved</Badge>;
    }
    
    switch (status) {
      case 'matched':
        return <Badge variant="default">Matched</Badge>;
      case 'exception':
        return <Badge variant="destructive">Exception</Badge>;
      case 'manual_review':
        return <Badge variant="outline">Manual Review</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800">High</Badge>;
      case 'medium':
        return <Badge variant="outline">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>3-Way Matching Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Loading matching data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Matches</p>
                  <p className="text-2xl font-bold">{statistics.total_matches}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Auto-Approval Rate</p>
                  <p className="text-2xl font-bold">{statistics.auto_approval_rate.toFixed(1)}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <Progress value={statistics.auto_approval_rate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Match Success Rate</p>
                  <p className="text-2xl font-bold">{statistics.match_success_rate.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <Progress value={statistics.match_success_rate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Confidence</p>
                  <p className={`text-2xl font-bold ${getConfidenceColor(statistics.average_confidence)}`}>
                    {statistics.average_confidence.toFixed(1)}%
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-muted-foreground" />
              </div>
              <Progress value={statistics.average_confidence} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>3-Way Matching Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Matches</TabsTrigger>
              <TabsTrigger value="pending">Pending Review</TabsTrigger>
              <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <MatchingTable 
                matches={matches}
                onApprove={handleApproveMatch}
                onReject={handleRejectMatch}
                onOverride={handleOverrideMatch}
                onViewExceptions={(match) => {
                  setSelectedMatch(match);
                  setShowExceptionsDialog(true);
                }}
                getMatchStatusBadge={getMatchStatusBadge}
                getConfidenceColor={getConfidenceColor}
              />
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <MatchingTable 
                matches={matches.filter(m => m.match_status === 'manual_review' || (m.requires_approval && !m.approved_at))}
                onApprove={handleApproveMatch}
                onReject={handleRejectMatch}
                onOverride={handleOverrideMatch}
                onViewExceptions={(match) => {
                  setSelectedMatch(match);
                  setShowExceptionsDialog(true);
                }}
                getMatchStatusBadge={getMatchStatusBadge}
                getConfidenceColor={getConfidenceColor}
              />
            </TabsContent>

            <TabsContent value="exceptions" className="space-y-4">
              <MatchingTable 
                matches={matches.filter(m => m.match_status === 'exception')}
                onApprove={handleApproveMatch}
                onReject={handleRejectMatch}
                onOverride={handleOverrideMatch}
                onViewExceptions={(match) => {
                  setSelectedMatch(match);
                  setShowExceptionsDialog(true);
                }}
                getMatchStatusBadge={getMatchStatusBadge}
                getConfidenceColor={getConfidenceColor}
              />
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              <MatchingTable 
                matches={matches.filter(m => m.match_status === 'approved' || m.auto_approved)}
                onApprove={handleApproveMatch}
                onReject={handleRejectMatch}
                onOverride={handleOverrideMatch}
                onViewExceptions={(match) => {
                  setSelectedMatch(match);
                  setShowExceptionsDialog(true);
                }}
                getMatchStatusBadge={getMatchStatusBadge}
                getConfidenceColor={getConfidenceColor}
                readOnly
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Exceptions Dialog */}
      {selectedMatch && showExceptionsDialog && (
        <ExceptionsDialog
          match={selectedMatch}
          open={showExceptionsDialog}
          onClose={() => setShowExceptionsDialog(false)}
          getSeverityBadge={getSeverityBadge}
        />
      )}
    </div>
  );
};

interface MatchingTableProps {
  matches: any[];
  onApprove: (matchId: string) => void;
  onReject: (matchId: string) => void;
  onOverride: (matchId: string, status: 'approved' | 'rejected') => void;
  onViewExceptions: (match: any) => void;
  getMatchStatusBadge: (status: string, autoApproved: boolean) => React.ReactNode;
  getConfidenceColor: (score: number) => string;
  readOnly?: boolean;
}

const MatchingTable: React.FC<MatchingTableProps> = ({
  matches,
  onApprove,
  onReject,
  onOverride,
  onViewExceptions,
  getMatchStatusBadge,
  getConfidenceColor,
  readOnly = false
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PO Number</TableHead>
            <TableHead>Receipt #</TableHead>
            <TableHead>Invoice #</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead>Exceptions</TableHead>
            <TableHead>Date</TableHead>
            {!readOnly && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.map((match) => (
            <TableRow key={match.id}>
              <TableCell className="font-medium">
                {match.purchase_order?.po_number || 'N/A'}
              </TableCell>
              <TableCell>{match.receipt?.receipt_number || 'N/A'}</TableCell>
              <TableCell>{match.invoice?.invoice_number || 'N/A'}</TableCell>
              <TableCell>
                {getMatchStatusBadge(match.match_status, match.auto_approved)}
              </TableCell>
              <TableCell>
                <span className={getConfidenceColor(match.confidence_score)}>
                  {match.confidence_score.toFixed(1)}%
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{match.exceptions_data?.length || 0}</span>
                  {match.exceptions_data?.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewExceptions(match)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {new Date(match.created_at).toLocaleDateString()}
              </TableCell>
              {!readOnly && (
                <TableCell>
                  <div className="flex gap-2">
                    {match.requires_approval && !match.approved_at && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onApprove(match.id)}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onReject(match.id)}
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOverride(match.id, 'approved')}
                      title="Override as Approved"
                    >
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {matches.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No matching records found
        </div>
      )}
    </div>
  );
};

interface ExceptionsDialogProps {
  match: any;
  open: boolean;
  onClose: () => void;
  getSeverityBadge: (severity: string) => React.ReactNode;
}

const ExceptionsDialog: React.FC<ExceptionsDialogProps> = ({
  match,
  open,
  onClose,
  getSeverityBadge
}) => {
  const exceptions: MatchingException[] = match.exceptions_data || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Matching Exceptions - {match.purchase_order?.po_number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {exceptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No exceptions found for this match
            </div>
          ) : (
            <div className="space-y-4">
              {exceptions.map((exception, index) => (
                <Alert key={index} className={exception.severity === 'critical' ? 'border-red-200' : ''}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{exception.description}</span>
                      {getSeverityBadge(exception.severity)}
                    </div>
                    
                    {exception.variance_amount && (
                      <div className="text-sm text-muted-foreground">
                        Variance: ${exception.variance_amount.toFixed(2)} 
                        {exception.variance_percentage && ` (${exception.variance_percentage.toFixed(1)}%)`}
                      </div>
                    )}
                    
                    {exception.po_amount && exception.invoice_amount && (
                      <div className="text-sm text-muted-foreground mt-1">
                        PO: ${exception.po_amount.toFixed(2)} | 
                        Invoice: ${exception.invoice_amount.toFixed(2)}
                        {exception.receipt_amount && ` | Receipt: $${exception.receipt_amount.toFixed(2)}`}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ThreeWayMatchingDashboard;