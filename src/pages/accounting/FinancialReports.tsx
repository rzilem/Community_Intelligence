import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';
import { AdvancedGLService } from '@/services/accounting/advanced-gl-service';
import { useToast } from '@/hooks/use-toast';
import AdvancedFinancialReports from '@/components/accounting/AdvancedFinancialReports';

const FinancialReports: React.FC = () => {
  const [reportType, setReportType] = useState('trial_balance');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // For demo purposes
  const associationId = 'demo-association-id';

  const reportTypes = [
    { value: 'trial_balance', label: 'Trial Balance', icon: FileText },
    { value: 'balance_sheet', label: 'Balance Sheet', icon: TrendingUp },
    { value: 'income_statement', label: 'Income Statement', icon: FileText },
    { value: 'cash_flow', label: 'Cash Flow Statement', icon: Calendar },
    { value: 'budget_variance', label: 'Budget vs Actual', icon: TrendingUp },
  ];

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      
      if (reportType === 'trial_balance') {
        const trialBalance = await AdvancedGLService.generateTrialBalance(
          associationId, 
          endDate || new Date().toISOString().split('T')[0]
        );
        
        toast({
          title: "Report Generated",
          description: `Trial Balance generated with ${trialBalance.length} accounts`
        });
        
        // In a real implementation, this would format and display/download the report
        console.log('Trial Balance Data:', trialBalance);
      } else {
        // Placeholder for other report types
        toast({
          title: "Report Generated",
          description: `${reportTypes.find(r => r.value === reportType)?.label} generated successfully`
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <PageTemplate
        title="Financial Reports"
        icon={<FileText className="h-8 w-8" />}
        description="Generate comprehensive financial reports and statements"
      >
        <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground">
            Generate and export financial statements and reports
          </p>
        </div>
      </div>

      <Tabs defaultValue="advanced" className="space-y-6">
        <TabsList>
          <TabsTrigger value="advanced">Advanced Reports</TabsTrigger>
          <TabsTrigger value="simple">Quick Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="advanced">
          <AdvancedFinancialReports associationId={associationId} />
        </TabsContent>

        <TabsContent value="simple" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Report Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <Button 
                className="w-full" 
                onClick={handleGenerateReport}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTypes.map((type) => (
                  <Card key={type.value} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <type.icon className="h-8 w-8 text-primary" />
                        <div>
                          <h3 className="font-semibold">{type.label}</h3>
                          <p className="text-sm text-muted-foreground">
                            {type.value === 'trial_balance' && 'List of all accounts with debit and credit balances'}
                            {type.value === 'balance_sheet' && 'Assets, liabilities, and equity snapshot'}
                            {type.value === 'income_statement' && 'Revenue and expense summary'}
                            {type.value === 'cash_flow' && 'Cash receipts and payments analysis'}
                            {type.value === 'budget_variance' && 'Budget vs actual comparison'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          </div>
          </div>
        </TabsContent>
      </Tabs>
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default FinancialReports;