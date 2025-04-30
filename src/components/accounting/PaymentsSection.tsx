
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PaymentFilters from './PaymentFilters';
import PaymentTable from './PaymentTable';
import PaymentHistorySummary from './PaymentHistorySummary';
import { Payment } from '@/types/transaction-payment-types';

interface PaymentsSectionProps {
  payments: Payment[];
}

const PaymentsSection: React.FC<PaymentsSectionProps> = ({ payments }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.vendor.toLowerCase().includes(searchTerm.toLowerCase()) || 
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.associationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.category.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle>Payment Management</CardTitle>
        <CardDescription>Track, process, and manage vendor payments across all associations.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="outgoing" className="w-full">
          <TabsList>
            <TabsTrigger value="outgoing">Outgoing Payments</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
          </TabsList>
          <TabsContent value="outgoing" className="space-y-4 pt-4">
            <PaymentFilters 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
            />
            
            <PaymentTable payments={filteredPayments} />
          </TabsContent>
          
          <TabsContent value="history" className="pt-4">
            <PaymentHistorySummary />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">Showing {filteredPayments.length} of {payments.length} payments</p>
        <Button variant="outline" size="sm">
          View all payment history
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaymentsSection;
