
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react';
import { BudgetSummary, BudgetPrediction } from '@/types/accounting-types';
import { formatCurrency } from '@/utils/accounting-helpers';

interface BudgetAIInsightsProps {
  summary?: BudgetSummary;
  budgetSummary?: BudgetSummary; // Added alternate prop name for backward compatibility
  isLoading?: boolean;
  predictions?: BudgetPrediction[];
  onApplyAllSuggestions?: () => void;
  onGenerateReport?: () => void;
}

const BudgetAIInsights: React.FC<BudgetAIInsightsProps> = ({ 
  summary, 
  budgetSummary, 
  isLoading = false,
  predictions
}) => {
  // Use either summary or budgetSummary prop
  const actualSummary = summary || budgetSummary;
  
  if (isLoading || !actualSummary) {
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
              <p className="text-2xl font-bold">{formatCurrency(actualSummary.totalRevenue)}</p>
              {actualSummary.changePercentage !== 0 && (
                <Badge variant="outline" className="ml-2">
                  <span className={actualSummary.changePercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatPercentage(actualSummary.changePercentage)}
                  </span>
                </Badge>
              )}
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <div className="flex items-center">
              <p className="text-2xl font-bold">{formatCurrency(actualSummary.totalExpenses)}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Net Income</p>
            <div className="flex items-center">
              <p className="text-2xl font-bold">{formatCurrency(actualSummary.netIncome)}</p>
              {actualSummary.netIncomeChange !== 0 && (
                <div className="flex items-center ml-2">
                  {actualSummary.netIncomeChange > 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className={actualSummary.netIncomeChange > 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(Math.abs(actualSummary.netIncomeChange))}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">AI Insights:</h4>
            <ul className="space-y-1">
              {actualSummary.insights.map((insight, index) => (
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
