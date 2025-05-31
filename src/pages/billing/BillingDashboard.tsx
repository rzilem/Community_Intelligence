
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseQuery } from '@/hooks/supabase';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, CreditCard, Calendar, Receipt, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';

const BillingDashboard = () => {
  const { user } = useAuth();
  const [payingAssessment, setPayingAssessment] = useState<string | null>(null);

  const { data: resident } = useSupabaseQuery(
    'residents',
    {
      select: 'id, property_id',
      filter: [{ column: 'user_id', value: user?.id }],
      single: true
    },
    !!user?.id
  );

  const { data: assessments = [], refetch: refetchAssessments } = useSupabaseQuery(
    'assessments',
    {
      select: `
        *,
        assessment_types(name),
        properties(address, unit_number)
      `,
      filter: [{ column: 'property_id', value: resident?.property_id }],
      order: { column: 'due_date', ascending: false }
    },
    !!resident?.property_id
  );

  const { data: paymentHistory = [] } = useSupabaseQuery(
    'payment_transactions',
    {
      select: `
        *,
        assessments(
          amount,
          due_date,
          assessment_types(name)
        )
      `,
      filter: [
        { column: 'resident_id', value: resident?.id },
        { column: 'status', value: 'succeeded' }
      ],
      order: { column: 'created_at', ascending: false }
    },
    !!resident?.id
  );

  const unpaidAssessments = assessments.filter((a: any) => a.payment_status === 'unpaid');
  const totalBalance = unpaidAssessments.reduce((sum: number, a: any) => sum + parseFloat(a.amount), 0);

  const handlePayment = async (assessmentId: string) => {
    setPayingAssessment(assessmentId);

    try {
      const { data, error } = await supabase.functions.invoke('create-payment-session', {
        body: { assessmentId }
      });

      if (error) throw error;

      // Open Stripe checkout in new tab
      window.open(data.url, '_blank');
    } catch (error: any) {
      console.error('Error creating payment session:', error);
      toast.error('Failed to start payment: ' + error.message);
    } finally {
      setPayingAssessment(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-500">Paid</Badge>;
      case 'unpaid':
        return <Badge variant="destructive">Unpaid</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <PageTemplate
      title="Billing Dashboard"
      icon={<DollarSign className="h-8 w-8" />}
      description="View and pay your assessments"
    >
      <div className="space-y-6">
        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                  <p className="text-2xl font-bold text-red-600">${totalBalance.toFixed(2)}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Unpaid Assessments</p>
                  <p className="text-2xl font-bold">{unpaidAssessments.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Payments This Year</p>
                  <p className="text-2xl font-bold">{paymentHistory.length}</p>
                </div>
                <Receipt className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Assessments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assessments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No assessments found</p>
            ) : (
              <div className="space-y-4">
                {assessments.map((assessment: any) => (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <h4 className="font-medium">
                        {assessment.assessment_types?.name || 'Assessment'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {assessment.properties?.address}
                        {assessment.properties?.unit_number && 
                          ` Unit ${assessment.properties.unit_number}`
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(assessment.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">${assessment.amount}</p>
                        {getStatusBadge(assessment.payment_status)}
                      </div>
                      
                      {assessment.payment_status === 'unpaid' && (
                        <Button
                          onClick={() => handlePayment(assessment.id)}
                          disabled={payingAssessment === assessment.id}
                          size="sm"
                        >
                          {payingAssessment === assessment.id ? (
                            <LoadingSpinner size="sm" className="mr-2" />
                          ) : (
                            <CreditCard className="w-4 h-4 mr-2" />
                          )}
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No payment history</p>
            ) : (
              <div className="space-y-3">
                {paymentHistory.map((payment: any) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div>
                      <p className="font-medium">
                        {payment.assessments?.assessment_types?.name || 'Payment'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${payment.amount}</p>
                      <Badge variant="default" className="bg-green-500">Paid</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
};

export default BillingDashboard;
