
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { format } from 'date-fns';

interface FinancialReportViewProps {
  associationId: string;
  reportType: 'balance-sheet' | 'income-statement' | 'cash-flow';
  title?: string;
  date?: Date;
}

export const FinancialReportView: React.FC<FinancialReportViewProps> = ({
  associationId,
  reportType,
  title,
  date = new Date(),
}) => {
  const [period, setPeriod] = useState('month');
  const reportTitle = title || (
    reportType === 'balance-sheet' 
      ? 'Balance Sheet' 
      : reportType === 'income-statement'
        ? 'Income Statement'
        : 'Cash Flow Statement'
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{reportTitle}</CardTitle>
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Current Month</SelectItem>
              <SelectItem value="quarter">Current Quarter</SelectItem>
              <SelectItem value="year">Year to Date</SelectItem>
              <SelectItem value="fiscal-year">Fiscal Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold">{reportTitle}</h3>
          <p className="text-muted-foreground">
            {period === 'month' && `For the month ending ${format(date, 'MMMM d, yyyy')}`}
            {period === 'quarter' && `For the quarter ending ${format(date, 'MMMM d, yyyy')}`}
            {period === 'year' && `Year to date as of ${format(date, 'MMMM d, yyyy')}`}
            {period === 'fiscal-year' && `For the fiscal year ending ${format(date, 'MMMM d, yyyy')}`}
            {period === 'custom' && `Custom period as of ${format(date, 'MMMM d, yyyy')}`}
          </p>
        </div>

        {reportType === 'balance-sheet' && (
          <div className="space-y-6">
            {/* Assets */}
            <div>
              <h4 className="text-lg font-bold mb-2">Assets</h4>
              <div className="space-y-2">
                <ReportLine name="Current Assets" amount={25000} indent={0} />
                <ReportLine name="Cash" amount={10000} indent={1} />
                <ReportLine name="Accounts Receivable" amount={8000} indent={1} />
                <ReportLine name="Prepaid Expenses" amount={7000} indent={1} />
                <ReportLine name="Fixed Assets" amount={75000} indent={0} />
                <ReportLine name="Equipment" amount={25000} indent={1} />
                <ReportLine name="Buildings" amount={50000} indent={1} />
                <ReportLine name="Total Assets" amount={100000} indent={0} isBold />
              </div>
            </div>

            {/* Liabilities */}
            <div>
              <h4 className="text-lg font-bold mb-2">Liabilities</h4>
              <div className="space-y-2">
                <ReportLine name="Current Liabilities" amount={15000} indent={0} />
                <ReportLine name="Accounts Payable" amount={8000} indent={1} />
                <ReportLine name="Accrued Expenses" amount={7000} indent={1} />
                <ReportLine name="Long Term Liabilities" amount={35000} indent={0} />
                <ReportLine name="Loans" amount={35000} indent={1} />
                <ReportLine name="Total Liabilities" amount={50000} indent={0} isBold />
              </div>
            </div>

            {/* Equity */}
            <div>
              <h4 className="text-lg font-bold mb-2">Equity</h4>
              <div className="space-y-2">
                <ReportLine name="Retained Earnings" amount={40000} indent={0} />
                <ReportLine name="Current Year Earnings" amount={10000} indent={0} />
                <ReportLine name="Total Equity" amount={50000} indent={0} isBold />
              </div>
            </div>

            <div className="pt-4 border-t">
              <ReportLine name="Total Liabilities and Equity" amount={100000} indent={0} isBold />
            </div>
          </div>
        )}

        {reportType === 'income-statement' && (
          <div className="space-y-6">
            {/* Revenue */}
            <div>
              <h4 className="text-lg font-bold mb-2">Revenue</h4>
              <div className="space-y-2">
                <ReportLine name="Assessment Income" amount={35000} indent={0} />
                <ReportLine name="Late Fees" amount={2000} indent={0} />
                <ReportLine name="Other Income" amount={3000} indent={0} />
                <ReportLine name="Total Revenue" amount={40000} indent={0} isBold />
              </div>
            </div>

            {/* Expenses */}
            <div>
              <h4 className="text-lg font-bold mb-2">Expenses</h4>
              <div className="space-y-2">
                <ReportLine name="Maintenance" amount={12000} indent={0} />
                <ReportLine name="Utilities" amount={8000} indent={0} />
                <ReportLine name="Management Fees" amount={6000} indent={0} />
                <ReportLine name="Insurance" amount={4000} indent={0} />
                <ReportLine name="Total Expenses" amount={30000} indent={0} isBold />
              </div>
            </div>

            <div className="pt-4 border-t">
              <ReportLine name="Net Income" amount={10000} indent={0} isBold />
            </div>
          </div>
        )}

        {reportType === 'cash-flow' && (
          <div className="space-y-6">
            {/* Operating Activities */}
            <div>
              <h4 className="text-lg font-bold mb-2">Operating Activities</h4>
              <div className="space-y-2">
                <ReportLine name="Net Income" amount={10000} indent={0} />
                <ReportLine name="Depreciation" amount={5000} indent={0} />
                <ReportLine name="Increase in Accounts Receivable" amount={-3000} indent={0} />
                <ReportLine name="Increase in Accounts Payable" amount={2000} indent={0} />
                <ReportLine name="Net Cash from Operating Activities" amount={14000} indent={0} isBold />
              </div>
            </div>

            {/* Investing Activities */}
            <div>
              <h4 className="text-lg font-bold mb-2">Investing Activities</h4>
              <div className="space-y-2">
                <ReportLine name="Purchase of Equipment" amount={-7000} indent={0} />
                <ReportLine name="Net Cash from Investing Activities" amount={-7000} indent={0} isBold />
              </div>
            </div>

            {/* Financing Activities */}
            <div>
              <h4 className="text-lg font-bold mb-2">Financing Activities</h4>
              <div className="space-y-2">
                <ReportLine name="Loan Repayment" amount={-3000} indent={0} />
                <ReportLine name="Net Cash from Financing Activities" amount={-3000} indent={0} isBold />
              </div>
            </div>

            <div className="pt-4 border-t">
              <ReportLine name="Net Increase in Cash" amount={4000} indent={0} isBold />
              <ReportLine name="Cash at Beginning of Period" amount={6000} indent={0} />
              <ReportLine name="Cash at End of Period" amount={10000} indent={0} isBold />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ReportLineProps {
  name: string;
  amount: number;
  indent: number;
  isBold?: boolean;
}

const ReportLine: React.FC<ReportLineProps> = ({ name, amount, indent, isBold = false }) => {
  const indentClass = `pl-${indent * 4}`;
  const fontClass = isBold ? 'font-bold' : '';
  
  return (
    <div className={`flex justify-between ${fontClass}`}>
      <span className={indentClass}>{name}</span>
      <span>${amount.toLocaleString()}</span>
    </div>
  );
};
