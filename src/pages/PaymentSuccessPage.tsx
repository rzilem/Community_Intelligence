
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      // Update the assessment status if this was an assessment payment
      const { data: assessments } = await supabase
        .from('assessments')
        .select('*')
        .eq('stripe_session_id', sessionId);

      if (assessments && assessments.length > 0) {
        const assessment = assessments[0];
        
        // Mark as paid
        await supabase
          .from('assessments')
          .update({
            payment_status: 'paid',
            payment_date: new Date().toISOString().split('T')[0],
            paid: true
          })
          .eq('id', assessment.id);

        setPaymentDetails({
          type: 'assessment',
          amount: assessment.amount,
          assessmentId: assessment.id
        });
      }

      toast.success('Payment confirmed successfully!');
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Error verifying payment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Verifying payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 mt-4">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Your payment has been processed successfully.
          </p>
          
          {paymentDetails && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Payment Amount</p>
              <p className="text-lg font-semibold">${paymentDetails.amount}</p>
              {paymentDetails.type === 'assessment' && (
                <p className="text-xs text-gray-500 mt-1">
                  Assessment ID: {paymentDetails.assessmentId}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link to="/dashboard" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Return to Dashboard
              </Link>
            </Button>
            
            {paymentDetails && (
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download Receipt
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500">
            You will receive a confirmation email shortly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
