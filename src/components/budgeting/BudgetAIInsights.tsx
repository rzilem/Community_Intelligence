
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react';
import { BudgetSummary } from '@/types/accounting-types';
import { formatCurrency } from '@/utils/accounting-helpers';

interface BudgetAIInsightsProps {
  summary: BudgetSummary; // Changed from summary to match BudgetPlanning.tsx
  isLoading?: boolean;
}

const BudgetAIInsights: React.FC<BudgetAIInsightsProps> = ({ summary, isLoading = false }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Budget Summary</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 w-1/2 animate-pulse bg-slate-200 rounded"></div>
            <div className="h-4 w-3/4 animate-pulse bg-slate-200 rounded"></div>
            <div className="h-4 w-2/3 animate-pulse bg-slate-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Budget Summary</CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <div className="flex items-center">
              <p className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</p>
              {summary.changePercentage !== 0 && (
                <Badge variant="outline" className="ml-2">
                  <span className={summary.changePercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatPercentage(summary.changePercentage)}
                  </span>
                </Badge>
              )}
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <div className="flex items-center">
              <p className="text-2xl font-bold">{formatCurrency(summary.totalExpenses)}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Net Income</p>
            <div className="flex items-center">
              <p className="text-2xl font-bold">{formatCurrency(summary.netIncome)}</p>
              {summary.netIncomeChange !== 0 && (
                <div className="flex items-center ml-2">
                  {summary.netIncomeChange > 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className={summary.netIncomeChange > 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(Math.abs(summary.netIncomeChange))}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">AI Insights:</h4>
            <ul className="space-y-1">
              {summary.insights.map((insight, index) => (
                <li key={index} className="text-sm text-muted-foreground">• {insight}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetAIInsights;
