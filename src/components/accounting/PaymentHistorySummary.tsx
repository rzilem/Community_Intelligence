
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import TooltipButton from '@/components/ui/tooltip-button';

const PaymentHistorySummary: React.FC = () => {
  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-4">
        <h3 className="text-lg font-medium">Payment History</h3>
        <div className="flex gap-2">
          <Select defaultValue="90days">
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          <TooltipButton tooltip="Export payment history as CSV">
            <Download className="h-4 w-4 mr-2" /> Export
          </TooltipButton>
        </div>
      </div>
      
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border rounded-md p-4">
              <div className="text-sm font-medium text-muted-foreground">Total Payments</div>
              <div className="text-2xl font-bold mt-1">$14,570.00</div>
              <div className="text-xs text-muted-foreground mt-1">Last 90 days</div>
            </div>
            
            <div className="border rounded-md p-4">
              <div className="text-sm font-medium text-muted-foreground">Payment Count</div>
              <div className="text-2xl font-bold mt-1">32</div>
              <div className="text-xs text-muted-foreground mt-1">Last 90 days</div>
            </div>
            
            <div className="border rounded-md p-4">
              <div className="text-sm font-medium text-muted-foreground">Average Payment</div>
              <div className="text-2xl font-bold mt-1">$455.31</div>
              <div className="text-xs text-muted-foreground mt-1">Last 90 days</div>
            </div>
            
            <div className="border rounded-md p-4">
              <div className="text-sm font-medium text-muted-foreground">Top Category</div>
              <div className="text-2xl font-bold mt-1">Landscaping</div>
              <div className="text-xs text-muted-foreground mt-1">$5,250.00 (36%)</div>
            </div>
          </div>
          
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-4">Payment method breakdown for the period:</p>
            <div className="grid grid-cols-4 gap-2">
              <div className="h-20 bg-blue-100 rounded-md flex flex-col items-center justify-center">
                <div className="text-lg font-bold text-blue-700">48%</div>
                <div className="text-xs text-muted-foreground">ACH</div>
              </div>
              <div className="h-20 bg-gray-100 rounded-md flex flex-col items-center justify-center">
                <div className="text-lg font-bold text-gray-700">32%</div>
                <div className="text-xs text-muted-foreground">Check</div>
              </div>
              <div className="h-20 bg-amber-100 rounded-md flex flex-col items-center justify-center">
                <div className="text-lg font-bold text-amber-700">15%</div>
                <div className="text-xs text-muted-foreground">Credit Card</div>
              </div>
              <div className="h-20 bg-emerald-100 rounded-md flex flex-col items-center justify-center">
                <div className="text-lg font-bold text-emerald-700">5%</div>
                <div className="text-xs text-muted-foreground">Wire</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default PaymentHistorySummary;
