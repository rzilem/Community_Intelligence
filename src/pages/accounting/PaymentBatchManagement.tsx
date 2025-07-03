import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Download, CheckCircle, Clock, XCircle, Upload, DollarSign } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import AssociationSelector from '@/components/associations/AssociationSelector';
import { PaymentService } from '@/services/accounting/payment-service';
import { useToast } from '@/hooks/use-toast';

interface PaymentBatch {
  id: string;
  batch_number: string;
  payment_method: string;
  status: string;
  total_amount: number;
  payment_count: number;
  created_at: string;
  scheduled_date?: string;
  processed_date?: string;
  description?: string;
}

const PaymentBatchManagement = () => {
  const [selectedAssociation, setSelectedAssociation] = useState<string>('');
  const [batches, setBatches] = useState<PaymentBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newBatch, setNewBatch] = useState({
    payment_method: '',
    scheduled_date: '',
    description: '',
    filter_criteria: {}
  });

  useEffect(() => {
    if (selectedAssociation) {
      loadBatches();
    }
  }, [selectedAssociation]);

  const loadBatches = async () => {
    if (!selectedAssociation) return;
    
    setLoading(true);
    try {
      const batchData = await PaymentService.getPaymentBatches(selectedAssociation);
      setBatches(batchData);
    } catch (error) {
      console.error('Error loading payment batches:', error);
      toast({
        title: "Error",
        description: "Failed to load payment batches",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async () => {
    if (!selectedAssociation || !newBatch.payment_method) {
      toast({
        title: "Error",
        description: "Please select association and payment method",
        variant: "destructive"
      });
      return;
    }

    try {
      const batch = await PaymentService.createPaymentBatch({
        association_id: selectedAssociation,
        payment_method: newBatch.payment_method,
        scheduled_date: newBatch.scheduled_date || undefined,
        description: newBatch.description,
        filter_criteria: newBatch.filter_criteria
      });

      setBatches(prev => [batch, ...prev]);
      setIsCreateDialogOpen(false);
      setNewBatch({ payment_method: '', scheduled_date: '', description: '', filter_criteria: {} });
      
      toast({
        title: "Success",
        description: "Payment batch created successfully"
      });
    } catch (error) {
      console.error('Error creating payment batch:', error);
      toast({
        title: "Error",
        description: "Failed to create payment batch",
        variant: "destructive"
      });
    }
  };

  const handleProcessBatch = async (batchId: string) => {
    try {
      await PaymentService.processBatch(batchId);
      await loadBatches();
      toast({
        title: "Success",
        description: "Payment batch processed successfully"
      });
    } catch (error) {
      console.error('Error processing batch:', error);
      toast({
        title: "Error",
        description: "Failed to process payment batch",
        variant: "destructive"
      });
    }
  };

  const handleDownloadACH = async (batchId: string) => {
    try {
      const achFile = await PaymentService.generateACHFile(batchId);
      // Create download link
      const blob = new Blob([achFile], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ACH_Batch_${batchId}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "ACH file downloaded successfully"
      });
    } catch (error) {
      console.error('Error downloading ACH file:', error);
      toast({
        title: "Error",
        description: "Failed to download ACH file",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, icon: Clock },
      pending: { variant: 'default' as const, icon: Clock },
      processing: { variant: 'default' as const, icon: Upload },
      completed: { variant: 'default' as const, icon: CheckCircle },
      failed: { variant: 'destructive' as const, icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <PageTemplate
      title="Payment Batch Management"
      description="Create, manage, and process payment batches for ACH and check payments"
      icon={<DollarSign className="h-8 w-8" />}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <AssociationSelector
            onValueChange={setSelectedAssociation}
            placeholder="Select association to manage payment batches"
          />

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedAssociation}>
                <Plus className="h-4 w-4 mr-2" />
                Create Batch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Payment Batch</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select value={newBatch.payment_method} onValueChange={(value) => 
                    setNewBatch(prev => ({ ...prev, payment_method: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ach">ACH</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="wire">Wire Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="scheduled_date">Scheduled Date (Optional)</Label>
                  <Input
                    id="scheduled_date"
                    type="date"
                    value={newBatch.scheduled_date}
                    onChange={(e) => setNewBatch(prev => ({ ...prev, scheduled_date: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter batch description..."
                    value={newBatch.description}
                    onChange={(e) => setNewBatch(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <Button onClick={handleCreateBatch} className="w-full">
                  Create Batch
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {selectedAssociation && (
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active">Active Batches</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Active Payment Batches</CardTitle>
                  <CardDescription>
                    Batches that are pending processing or currently being processed
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
                          <TableHead>Batch Number</TableHead>
                          <TableHead>Payment Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Payment Count</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {batches
                          .filter(batch => ['pending', 'processing'].includes(batch.status))
                          .map((batch) => (
                          <TableRow key={batch.id}>
                            <TableCell className="font-medium">{batch.batch_number}</TableCell>
                            <TableCell className="capitalize">{batch.payment_method}</TableCell>
                            <TableCell>{getStatusBadge(batch.status)}</TableCell>
                            <TableCell>${batch.total_amount.toLocaleString()}</TableCell>
                            <TableCell>{batch.payment_count}</TableCell>
                            <TableCell>
                              {new Date(batch.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {batch.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleProcessBatch(batch.id)}
                                  >
                                    Process
                                  </Button>
                                )}
                                {batch.payment_method === 'ach' && batch.status === 'completed' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDownloadACH(batch.id)}
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    ACH File
                                  </Button>
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

            <TabsContent value="completed" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Completed Payment Batches</CardTitle>
                  <CardDescription>
                    Successfully processed payment batches
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Batch Number</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Count</TableHead>
                        <TableHead>Processed Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {batches
                        .filter(batch => batch.status === 'completed')
                        .map((batch) => (
                        <TableRow key={batch.id}>
                          <TableCell className="font-medium">{batch.batch_number}</TableCell>
                          <TableCell className="capitalize">{batch.payment_method}</TableCell>
                          <TableCell>${batch.total_amount.toLocaleString()}</TableCell>
                          <TableCell>{batch.payment_count}</TableCell>
                          <TableCell>
                            {batch.processed_date ? new Date(batch.processed_date).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            {batch.payment_method === 'ach' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadACH(batch.id)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                ACH File
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="draft" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Draft Payment Batches</CardTitle>
                  <CardDescription>
                    Draft batches that haven't been processed yet
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Batch Number</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {batches
                        .filter(batch => batch.status === 'draft')
                        .map((batch) => (
                        <TableRow key={batch.id}>
                          <TableCell className="font-medium">{batch.batch_number}</TableCell>
                          <TableCell className="capitalize">{batch.payment_method}</TableCell>
                          <TableCell>{batch.description || '-'}</TableCell>
                          <TableCell>
                            {new Date(batch.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => handleProcessBatch(batch.id)}
                            >
                              Process
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageTemplate>
  );
};

export default PaymentBatchManagement;