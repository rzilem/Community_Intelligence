
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CollectionsTimeline } from './CollectionsTimeline';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CollectionAccount, CollectionStep, CollectionPaymentPlan, CollectionPayment } from '@/hooks/collections/useCollectionsData';
import { PaymentPlanDialog } from './PaymentPlanDialog';
import { PaymentPlanFormData } from '@/types/collections-types';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CollectionAccountDialogProps {
  account: CollectionAccount | null;
  steps: CollectionStep[];
  paymentPlans: CollectionPaymentPlan[];
  payments: CollectionPayment[];
  documents: any[];
  isOpen: boolean;
  onClose: () => void;
  onAccountUpdated: () => void;
}

export function CollectionAccountDialog({
  account,
  steps,
  paymentPlans,
  payments,
  documents,
  isOpen,
  onClose,
  onAccountUpdated
}: CollectionAccountDialogProps) {
  const [activeTab, setActiveTab] = useState('history');
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);

  if (!account) return null;

  const createPaymentPlan = async (data: PaymentPlanFormData) => {
    try {
      const { error } = await supabase
        .from('collections_payment_plans')
        .insert({
          collections_account_id: account.id,
          plan_type: data.plan_type,
          start_date: data.start_date,
          end_date: data.end_date,
          total_amount: data.total_amount,
          monthly_amount: data.monthly_amount,
          notes: data.notes,
          status: 'pending',
          created_by: 'system', // In a real app, this would be the current user ID
        });

      if (error) throw error;
      
      toast.success('Payment plan created successfully');
      onAccountUpdated();
    } catch (err) {
      console.error('Error creating payment plan:', err);
      toast.error('Failed to create payment plan');
      throw err;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Account Details - {account.property?.address}
              {account.property?.unit_number && ` Unit ${account.property.unit_number}`}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm">Balance Due</h4>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(account.balance_amount)}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm">Delinquent Since</h4>
                <p className="text-lg">{formatDate(account.delinquent_since)}</p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="history">Collection History</TabsTrigger>
                <TabsTrigger value="payment-plans">Payment Plans</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="history">
                <CollectionsTimeline 
                  steps={steps.map(step => ({
                    id: step.id,
                    name: step.name,
                    description: step.description || undefined,
                    completed: false,
                  }))}
                  currentStep={2}
                />
              </TabsContent>

              <TabsContent value="payment-plans">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Payment Plans</h3>
                    <Button 
                      size="sm"
                      onClick={() => setIsPlanDialogOpen(true)}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      New Plan
                    </Button>
                  </div>
                  
                  {paymentPlans && paymentPlans.length > 0 ? (
                    <div className="space-y-3">
                      {paymentPlans.map(plan => (
                        <div key={plan.id} className="border rounded-md p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{plan.plan_type.charAt(0).toUpperCase() + plan.plan_type.slice(1)} Payment Plan</h4>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(plan.start_date)} - {formatDate(plan.end_date)}
                              </p>
                            </div>
                            <div className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {plan.status}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Total Amount:</span>{' '}
                              <span className="font-medium">{formatCurrency(plan.total_amount)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Monthly Payment:</span>{' '}
                              <span className="font-medium">{formatCurrency(plan.monthly_amount)}</span>
                            </div>
                          </div>
                          {plan.notes && (
                            <p className="mt-2 text-sm border-t pt-2">{plan.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No payment plans have been created yet.</p>
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => setIsPlanDialogOpen(true)}
                      >
                        Create Payment Plan
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="payments">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Payment History</h3>
                  
                  {payments && payments.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {payments.map(payment => (
                            <tr key={payment.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(payment.payment_date)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatCurrency(payment.amount)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {payment.payment_method.charAt(0).toUpperCase() + payment.payment_method.slice(1)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                  {payment.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No payments have been recorded yet.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="documents">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Documents</h3>
                  
                  {documents && documents.length > 0 ? (
                    <div className="space-y-3">
                      {documents.map(doc => (
                        <div key={doc.id} className="border rounded-md p-4 flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{doc.document_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Sent: {doc.sent_date ? formatDate(doc.sent_date) : 'Not sent'}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No documents have been generated yet.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Plan Dialog */}
      <PaymentPlanDialog
        account={account}
        isOpen={isPlanDialogOpen}
        onClose={() => setIsPlanDialogOpen(false)}
        onSubmit={createPaymentPlan}
      />
    </>
  );
}
