import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Check, AlertTriangle, Calendar, Filter } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import AssociationSelector from '@/components/associations/AssociationSelector';
import { TaxReportingService } from '@/services/accounting/tax-reporting-service';
import { useToast } from '@/hooks/use-toast';

interface Vendor1099Record {
  id: string;
  vendor_id: string;
  vendor_name: string;
  vendor_tin: string;
  tax_year: number;
  total_payments: number;
  is_1099_required: boolean;
  form_type: string;
  status: string;
  generated_date?: string;
  submitted_date?: string;
  corrections_count: number;
}

interface TaxYear {
  year: number;
  status: string;
  total_vendors: number;
  total_amount: number;
  forms_generated: number;
  deadline: string;
}

const TaxReporting1099 = () => {
  const [selectedAssociation, setSelectedAssociation] = useState<string>('');
  const [records, setRecords] = useState<Vendor1099Record[]>([]);
  const [taxYears, setTaxYears] = useState<TaxYear[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear() - 1);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    if (selectedAssociation) {
      loadTaxReportingData();
    }
  }, [selectedAssociation, selectedYear]);

  const loadTaxReportingData = async () => {
    if (!selectedAssociation) return;
    
    setLoading(true);
    try {
      const [recordsData, yearsData] = await Promise.all([
        TaxReportingService.get1099Records(selectedAssociation, selectedYear),
        TaxReportingService.getTaxYearSummary(selectedAssociation)
      ]);
      setRecords(recordsData);
      setTaxYears(yearsData);
    } catch (error) {
      console.error('Error loading tax reporting data:', error);
      toast({
        title: "Error",
        description: "Failed to load tax reporting data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate1099s = async () => {
    if (!selectedAssociation) return;

    try {
      await TaxReportingService.generate1099Forms(selectedAssociation, selectedYear);
      await loadTaxReportingData();
      toast({
        title: "Success",
        description: "1099 forms generated successfully"
      });
    } catch (error) {
      console.error('Error generating 1099 forms:', error);
      toast({
        title: "Error",
        description: "Failed to generate 1099 forms",
        variant: "destructive"
      });
    }
  };

  const handleDownload1099 = async (recordId: string) => {
    try {
      const pdfData = await TaxReportingService.download1099Form(recordId);
      // Create download link
      const blob = new Blob([pdfData], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `1099_${recordId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "1099 form downloaded successfully"
      });
    } catch (error) {
      console.error('Error downloading 1099 form:', error);
      toast({
        title: "Error",
        description: "Failed to download 1099 form",
        variant: "destructive"
      });
    }
  };

  const handleBulkDownload = async () => {
    try {
      const zipData = await TaxReportingService.downloadBulk1099s(selectedAssociation, selectedYear);
      // Create download link
      const blob = new Blob([zipData], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `1099_Forms_${selectedYear}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "All 1099 forms downloaded successfully"
      });
    } catch (error) {
      console.error('Error downloading bulk 1099 forms:', error);
      toast({
        title: "Error",
        description: "Failed to download 1099 forms",
        variant: "destructive"
      });
    }
  };

  const handleSubmitToIRS = async () => {
    try {
      await TaxReportingService.submitToIRS(selectedAssociation, selectedYear);
      await loadTaxReportingData();
      toast({
        title: "Success",
        description: "1099 forms submitted to IRS successfully"
      });
    } catch (error) {
      console.error('Error submitting to IRS:', error);
      toast({
        title: "Error",
        description: "Failed to submit to IRS",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: AlertTriangle },
      generated: { variant: 'default' as const, icon: FileText },
      submitted: { variant: 'default' as const, icon: Check },
      corrected: { variant: 'outline' as const, icon: FileText }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredRecords = records.filter(record => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'required') return record.is_1099_required;
    return record.status === filterStatus;
  });

  const currentTaxYear = taxYears.find(ty => ty.year === selectedYear);

  return (
    <PageTemplate
      title="1099 Tax Reporting"
      description="Generate, manage, and submit 1099 forms for vendor payments"
      icon={<FileText className="h-8 w-8" />}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <AssociationSelector
            value={selectedAssociation}
            onValueChange={setSelectedAssociation}
            placeholder="Select association for tax reporting"
          />

          <div className="flex gap-2">
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleGenerate1099s}
              disabled={!selectedAssociation || loading}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate 1099s
            </Button>
          </div>
        </div>

        {selectedAssociation && currentTaxYear && (
          <Card>
            <CardHeader>
              <CardTitle>Tax Year {selectedYear} Summary</CardTitle>
              <CardDescription>
                Overview of 1099 reporting status for the selected tax year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{currentTaxYear.total_vendors}</div>
                  <p className="text-sm text-muted-foreground">Total Vendors</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">${currentTaxYear.total_amount.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">Total Payments</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{currentTaxYear.forms_generated}</div>
                  <p className="text-sm text-muted-foreground">Forms Generated</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    <Calendar className="h-6 w-6 inline mr-1" />
                    {new Date(currentTaxYear.deadline).toLocaleDateString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Filing Deadline</p>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-6 border-t">
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Records</SelectItem>
                      <SelectItem value="required">1099 Required</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="generated">Generated</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleBulkDownload}
                    disabled={records.filter(r => r.status === 'generated').length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                  <Button
                    onClick={handleSubmitToIRS}
                    disabled={records.filter(r => r.status === 'generated').length === 0}
                  >
                    Submit to IRS
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedAssociation && (
          <Tabs defaultValue="records" className="space-y-4">
            <TabsList>
              <TabsTrigger value="records">1099 Records</TabsTrigger>
              <TabsTrigger value="history">Filing History</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="records" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>1099 Records for {selectedYear}</CardTitle>
                  <CardDescription>
                    Vendor payment records requiring 1099 reporting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vendor Name</TableHead>
                          <TableHead>TIN/SSN</TableHead>
                          <TableHead>Form Type</TableHead>
                          <TableHead>Total Payments</TableHead>
                          <TableHead>1099 Required</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Generated Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.vendor_name}</TableCell>
                            <TableCell>{record.vendor_tin}</TableCell>
                            <TableCell>{record.form_type}</TableCell>
                            <TableCell>${record.total_payments.toLocaleString()}</TableCell>
                            <TableCell>
                              {record.is_1099_required ? (
                                <Badge variant="default">Yes</Badge>
                              ) : (
                                <Badge variant="outline">No</Badge>
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(record.status)}</TableCell>
                            <TableCell>
                              {record.generated_date 
                                ? new Date(record.generated_date).toLocaleDateString()
                                : '-'
                              }
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {record.status === 'generated' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDownload1099(record.id)}
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                  </Button>
                                )}
                                {record.corrections_count > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {record.corrections_count} corrections
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Filing History</CardTitle>
                  <CardDescription>
                    Historical 1099 filing records by tax year
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tax Year</TableHead>
                        <TableHead>Total Vendors</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Forms Generated</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {taxYears.map((taxYear) => (
                        <TableRow key={taxYear.year}>
                          <TableCell className="font-medium">{taxYear.year}</TableCell>
                          <TableCell>{taxYear.total_vendors}</TableCell>
                          <TableCell>${taxYear.total_amount.toLocaleString()}</TableCell>
                          <TableCell>{taxYear.forms_generated}</TableCell>
                          <TableCell>{getStatusBadge(taxYear.status)}</TableCell>
                          <TableCell>
                            {new Date(taxYear.deadline).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedYear(taxYear.year)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>1099 Reporting Settings</CardTitle>
                  <CardDescription>
                    Configure 1099 reporting preferences and thresholds
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="threshold_1099_misc">1099-MISC Threshold</Label>
                      <Input
                        id="threshold_1099_misc"
                        type="number"
                        defaultValue="600"
                        placeholder="600.00"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Minimum payment amount requiring 1099-MISC
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="threshold_1099_nec">1099-NEC Threshold</Label>
                      <Input
                        id="threshold_1099_nec"
                        type="number"
                        defaultValue="600"
                        placeholder="600.00"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Minimum payment amount requiring 1099-NEC
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="filing_method">Filing Method</Label>
                      <Select defaultValue="electronic">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electronic">Electronic Filing</SelectItem>
                          <SelectItem value="paper">Paper Filing</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="reminder_days">Reminder Days</Label>
                      <Input
                        id="reminder_days"
                        type="number"
                        defaultValue="30"
                        placeholder="30"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Days before deadline to send reminders
                      </p>
                    </div>
                  </div>

                  <Button className="w-full md:w-auto">
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageTemplate>
  );
};

export default TaxReporting1099;