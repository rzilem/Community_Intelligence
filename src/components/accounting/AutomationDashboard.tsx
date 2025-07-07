import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  Settings, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Calendar,
  Repeat,
  DollarSign
} from 'lucide-react';
import { AutomationService } from '@/services/accounting/automation-service';
import { useToast } from '@/hooks/use-toast';

interface AutomationDashboardProps {
  associationId: string;
}

interface RecurringEntry {
  id: string;
  name: string;
  frequency: string;
  next_run_date: string;
  is_active: boolean;
  line_items: any[];
}

interface AutomationJob {
  type: string;
  last_run: string;
  next_run: string;
  status: 'success' | 'error' | 'pending';
  items_processed: number;
}

const AutomationDashboard: React.FC<AutomationDashboardProps> = ({ associationId }) => {
  const [recurringEntries, setRecurringEntries] = useState<RecurringEntry[]>([]);
  const [automationJobs, setAutomationJobs] = useState<AutomationJob[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAutomationData();
  }, [associationId]);

  const loadAutomationData = async () => {
    try {
      setLoading(true);
      
      // Mock data for recurring entries
      const mockRecurringEntries: RecurringEntry[] = [
        {
          id: '1',
          name: 'Monthly Pool Maintenance',
          frequency: 'monthly',
          next_run_date: '2024-01-01',
          is_active: true,
          line_items: [{ account: '6100', amount: 450 }]
        },
        {
          id: '2',
          name: 'Quarterly Insurance Premium',
          frequency: 'quarterly',
          next_run_date: '2024-03-01',
          is_active: true,
          line_items: [{ account: '6200', amount: 2500 }]
        }
      ];

      const mockAutomationJobs: AutomationJob[] = [
        {
          type: 'Recurring Entries',
          last_run: '2024-12-01T10:00:00Z',
          next_run: '2024-01-01T10:00:00Z',
          status: 'success',
          items_processed: 12
        },
        {
          type: 'Assessment Billing',
          last_run: '2024-12-01T08:00:00Z',
          next_run: '2025-01-01T08:00:00Z',
          status: 'success',
          items_processed: 145
        },
        {
          type: 'Late Fee Calculation',
          last_run: '2024-12-05T09:00:00Z',
          next_run: '2025-01-05T09:00:00Z',
          status: 'pending',
          items_processed: 8
        }
      ];

      setRecurringEntries(mockRecurringEntries);
      setAutomationJobs(mockAutomationJobs);
    } catch (error) {
      console.error('Error loading automation data:', error);
      toast({
        title: "Error",
        description: "Failed to load automation data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleRecurringEntry = async (entryId: string, isActive: boolean) => {
    try {
      // In a real implementation, this would call the API
      setRecurringEntries(prev => 
        prev.map(entry => 
          entry.id === entryId ? { ...entry, is_active: isActive } : entry
        )
      );
      
      toast({
        title: "Success",
        description: `Recurring entry ${isActive ? 'enabled' : 'disabled'}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update recurring entry",
        variant: "destructive"
      });
    }
  };

  const runManualAutomation = async (type: string) => {
    try {
      let result;
      switch (type) {
        case 'recurring':
          result = await AutomationService.processRecurringEntries(associationId);
          break;
        case 'assessments':
          result = await AutomationService.processAssessmentBilling(associationId);
          break;
        case 'late_fees':
          result = await AutomationService.calculateLateFees(associationId);
          break;
        default:
          throw new Error('Unknown automation type');
      }

      toast({
        title: "Automation Complete",
        description: `Processed ${result} items successfully`
      });

      loadAutomationData(); // Refresh data
    } catch (error) {
      toast({
        title: "Automation Failed",
        description: "Failed to run automation process",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading automation dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Automation Dashboard</h2>
          <p className="text-muted-foreground">Manage automated financial processes</p>
        </div>
        <Button onClick={() => runManualAutomation('all')} className="gap-2">
          <Play className="h-4 w-4" />
          Run All Automations
        </Button>
      </div>

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">Automation Status</TabsTrigger>
          <TabsTrigger value="recurring">Recurring Entries</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Repeat className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active Recurring</p>
                    <p className="text-2xl font-bold">{recurringEntries.filter(e => e.is_active).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Successful Runs</p>
                    <p className="text-2xl font-bold">{automationJobs.filter(j => j.status === 'success').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Jobs</p>
                    <p className="text-2xl font-bold">{automationJobs.filter(j => j.status === 'pending').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Automation Jobs Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Process</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Next Run</TableHead>
                    <TableHead>Items Processed</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {automationJobs.map((job, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{job.type}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(job.status)} className="gap-1">
                          {getStatusIcon(job.status)}
                          {job.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(job.last_run).toLocaleString()}</TableCell>
                      <TableCell>{new Date(job.next_run).toLocaleString()}</TableCell>
                      <TableCell>{job.items_processed}</TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => runManualAutomation(job.type.toLowerCase().replace(' ', '_'))}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Run Now
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recurring">
          <Card>
            <CardHeader>
              <CardTitle>Recurring Journal Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Next Run</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recurringEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {entry.frequency.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(entry.next_run_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={entry.is_active}
                            onCheckedChange={(checked) => toggleRecurringEntry(entry.id, checked)}
                          />
                          <span className={entry.is_active ? 'text-green-600' : 'text-gray-500'}>
                            {entry.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Settings className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Automation Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-blue-500" />
                        <div>
                          <h3 className="font-semibold">Daily</h3>
                          <p className="text-sm text-muted-foreground">Bank reconciliation check</p>
                          <p className="text-xs text-muted-foreground">Next: Tomorrow 6:00 AM</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Repeat className="h-8 w-8 text-green-500" />
                        <div>
                          <h3 className="font-semibold">Monthly</h3>
                          <p className="text-sm text-muted-foreground">Assessment billing & recurring entries</p>
                          <p className="text-xs text-muted-foreground">Next: Jan 1, 2025</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-8 w-8 text-orange-500" />
                        <div>
                          <h3 className="font-semibold">Weekly</h3>
                          <p className="text-sm text-muted-foreground">Late fee calculation</p>
                          <p className="text-xs text-muted-foreground">Next: Every Friday</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomationDashboard;