import React, { useState, useEffect } from 'react';
import { Database } from '@/integrations/supabase/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CreditCard, Plus, Trash2, Eye, Download, CheckCircle, Clock, DollarSign, Wallet } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import { PaymentService } from '@/services/accounting/payment-service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';

interface PaymentMethod {
  id: string;
  payment_type: string;
  account_number_last_four: string;
  routing_number?: string;
  bank_name?: string;
  card_type?: string;
  expiry_date?: string;
  is_primary: boolean;
  is_active: boolean;
}

interface PaymentHistory {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number: string;
  status: string;
  description?: string;
}

interface AutoPaySetting {
  id: string;
  is_enabled: boolean;
  payment_method_id: string;
  payment_day: number;
  payment_amount_type: string;
  fixed_amount?: number;
}

const ResidentPaymentPortal = () => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [autoPaySettings, setAutoPaySettings] = useState<AutoPaySetting | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAddPaymentMethodOpen, setIsAddPaymentMethodOpen] = useState(false);
  const { toast } = useToast();

  const [newPaymentMethod, setNewPaymentMethod] = useState({
    payment_type: '',
    account_number: '',
    routing_number: '',
    bank_name: '',
    card_number: '',
    card_type: '',
    expiry_date: '',
    cvv: '',
    is_primary: false
  });

  useEffect(() => {
    if (user) {
      loadPaymentData();
    }
  }, [user]);

  const loadPaymentData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const [methods, history, autopay] = await Promise.all([
        PaymentService.getResidentPaymentMethods(user.id),
        PaymentService.getPaymentHistory(user.id),
        PaymentService.getAutoPaySettings(user.id)
      ]);
      
      setPaymentMethods(methods);
      setPaymentHistory(history);
      setAutoPaySettings(autopay);
    } catch (error) {
      console.error('Error loading payment data:', error);
      toast({
        title: "Error",
        description: "Failed to load payment information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    if (!user?.id || !newPaymentMethod.payment_type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const method = await PaymentService.addPaymentMethod({
        resident_id: user.id,
        payment_type: newPaymentMethod.payment_type,
        account_number_last_four: newPaymentMethod.payment_type === 'bank' 
          ? newPaymentMethod.account_number.slice(-4)
          : newPaymentMethod.card_number.slice(-4),
        routing_number: newPaymentMethod.routing_number || undefined,
        bank_name: newPaymentMethod.bank_name || undefined,
        card_type: newPaymentMethod.card_type || undefined,
        expiry_date: newPaymentMethod.expiry_date || undefined,
        is_primary: newPaymentMethod.is_primary
      });

      setPaymentMethods(prev => [...prev, method]);
      setIsAddPaymentMethodOpen(false);
      setNewPaymentMethod({
        payment_type: '',
        account_number: '',
        routing_number: '',
        bank_name: '',
        card_number: '',
        card_type: '',
        expiry_date: '',
        cvv: '',
        is_primary: false
      });
      
      toast({
        title: "Success",
        description: "Payment method added successfully"
      });
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast({
        title: "Error",
        description: "Failed to add payment method",
        variant: "destructive"
      });
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    try {
      await PaymentService.deletePaymentMethod(methodId);
      setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
      toast({
        title: "Success",
        description: "Payment method deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast({
        title: "Error",
        description: "Failed to delete payment method",
        variant: "destructive"
      });
    }
  };

  const handleUpdateAutoPay = async (enabled: boolean, settings?: Partial<AutoPaySetting>) => {
    if (!user?.id) return;

    try {
      const updatedSettings = await PaymentService.updateAutoPaySettings(user.id, {
        is_enabled: enabled,
        ...settings
      });
      
      setAutoPaySettings(updatedSettings);
      toast({
        title: "Success",
        description: `Auto-pay ${enabled ? 'enabled' : 'disabled'} successfully`
      });
    } catch (error) {
      console.error('Error updating auto-pay:', error);
      toast({
        title: "Error",
        description: "Failed to update auto-pay settings",
        variant: "destructive"
      });
    }
  };

  const handleDownloadReceipt = async (paymentId: string) => {
    try {
      const receipt = await PaymentService.generatePaymentReceipt(paymentId);
      // Create download link
      const blob = new Blob([receipt], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Payment_Receipt_${paymentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Receipt downloaded successfully"
      });
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast({
        title: "Error",
        description: "Failed to download receipt",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: 'default' as const, icon: CheckCircle },
      pending: { variant: 'secondary' as const, icon: Clock },
      failed: { variant: 'destructive' as const, icon: Clock }
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

  return (
    <PageTemplate
      title="Payment Portal"
      description="Manage your payment methods, view payment history, and set up auto-pay"
      icon={<Wallet className="h-8 w-8" />}
    >
      <div className="space-y-6">
        <Tabs defaultValue="methods" className="space-y-4">
          <TabsList>
            <TabsTrigger value="methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
            <TabsTrigger value="autopay">Auto-Pay Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="methods" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>
                      Manage your bank accounts and credit cards for payments
                    </CardDescription>
                  </div>
                  <Dialog open={isAddPaymentMethodOpen} onOpenChange={setIsAddPaymentMethodOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Payment Method
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Payment Method</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="payment_type">Payment Type</Label>
                          <Select value={newPaymentMethod.payment_type} onValueChange={(value) => 
                            setNewPaymentMethod(prev => ({ ...prev, payment_type: value }))
                          }>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bank">Bank Account</SelectItem>
                              <SelectItem value="credit_card">Credit Card</SelectItem>
                              <SelectItem value="debit_card">Debit Card</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {newPaymentMethod.payment_type === 'bank' && (
                          <>
                            <div>
                              <Label htmlFor="bank_name">Bank Name</Label>
                              <Input
                                id="bank_name"
                                value={newPaymentMethod.bank_name}
                                onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, bank_name: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="routing_number">Routing Number</Label>
                              <Input
                                id="routing_number"
                                value={newPaymentMethod.routing_number}
                                onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, routing_number: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="account_number">Account Number</Label>
                              <Input
                                id="account_number"
                                type="password"
                                value={newPaymentMethod.account_number}
                                onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, account_number: e.target.value }))}
                              />
                            </div>
                          </>
                        )}

                        {(newPaymentMethod.payment_type === 'credit_card' || newPaymentMethod.payment_type === 'debit_card') && (
                          <>
                            <div>
                              <Label htmlFor="card_number">Card Number</Label>
                              <Input
                                id="card_number"
                                type="password"
                                value={newPaymentMethod.card_number}
                                onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, card_number: e.target.value }))}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="expiry_date">Expiry Date</Label>
                                <Input
                                  id="expiry_date"
                                  placeholder="MM/YY"
                                  value={newPaymentMethod.expiry_date}
                                  onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, expiry_date: e.target.value }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="cvv">CVV</Label>
                                <Input
                                  id="cvv"
                                  type="password"
                                  value={newPaymentMethod.cvv}
                                  onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cvv: e.target.value }))}
                                />
                              </div>
                            </div>
                          </>
                        )}

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_primary"
                            checked={newPaymentMethod.is_primary}
                            onCheckedChange={(checked) => setNewPaymentMethod(prev => ({ ...prev, is_primary: checked }))}
                          />
                          <Label htmlFor="is_primary">Set as primary payment method</Label>
                        </div>

                        <Button onClick={handleAddPaymentMethod} className="w-full">
                          Add Payment Method
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <Card key={method.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-muted rounded-lg">
                                <CreditCard className="h-6 w-6" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium capitalize">
                                    {method.payment_type.replace('_', ' ')}
                                  </p>
                                  {method.is_primary && (
                                    <Badge variant="default">Primary</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {method.payment_type === 'bank' 
                                    ? `${method.bank_name} - ****${method.account_number_last_four}`
                                    : `${method.card_type} - ****${method.account_number_last_four}`
                                  }
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePaymentMethod(method.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>
                  View your past payments and download receipts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>${payment.amount.toLocaleString()}</TableCell>
                        <TableCell className="capitalize">
                          {payment.payment_method.replace('_', ' ')}
                        </TableCell>
                        <TableCell>{payment.reference_number}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadReceipt(payment.id)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Receipt
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="autopay" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Auto-Pay Settings</CardTitle>
                <CardDescription>
                  Set up automatic payments for your assessments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Enable Auto-Pay</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatically pay your assessments each month
                    </p>
                  </div>
                  <Switch
                    checked={autoPaySettings?.is_enabled || false}
                    onCheckedChange={(checked) => handleUpdateAutoPay(checked)}
                  />
                </div>

                {autoPaySettings?.is_enabled && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="payment_method">Payment Method</Label>
                      <Select value={autoPaySettings.payment_method_id || ''}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method.id} value={method.id}>
                              {method.payment_type === 'bank' 
                                ? `${method.bank_name} - ****${method.account_number_last_four}`
                                : `${method.card_type} - ****${method.account_number_last_four}`
                              }
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="payment_day">Payment Day</Label>
                      <Select value={autoPaySettings.payment_day?.toString() || ''}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment day" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                            <SelectItem key={day} value={day.toString()}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="amount_type">Payment Amount</Label>
                      <Select value={autoPaySettings.payment_amount_type || ''}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select amount type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_balance">Full Balance</SelectItem>
                          <SelectItem value="minimum_due">Minimum Due</SelectItem>
                          <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {autoPaySettings.payment_amount_type === 'fixed_amount' && (
                      <div>
                        <Label htmlFor="fixed_amount">Fixed Amount</Label>
                        <Input
                          id="fixed_amount"
                          type="number"
                          step="0.01"
                          value={autoPaySettings.fixed_amount || ''}
                          placeholder="Enter amount"
                        />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
};

export default ResidentPaymentPortal;