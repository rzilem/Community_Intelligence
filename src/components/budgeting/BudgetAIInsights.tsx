
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, FileCheck, AlertTriangle, PieChart, TrendingUp, Download } from 'lucide-react';
import { BudgetPrediction, BudgetSummary } from '@/types/accounting-types';
import { formatCurrency } from '@/lib/utils';

interface BudgetAIInsightsProps {
  budgetSummary: BudgetSummary;
  predictions: BudgetPrediction[];
  onApplyAllSuggestions: () => void;
  onGenerateReport: () => void;
}

const BudgetAIInsights: React.FC<BudgetAIInsightsProps> = ({
  budgetSummary,
  predictions,
  onApplyAllSuggestions,
  onGenerateReport
}) => {
  const topInsights = predictions.slice(0, 3);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-primary" />
          AI Budget Insights
        </CardTitle>
        <CardDescription>
          Community Intelligence analysis and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-2 border-b">
            <h4 className="font-medium">Budget Analysis</h4>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Net Income</p>
              <p className={`text-lg font-medium ${budgetSummary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(budgetSummary.netIncome)}
              </p>
              <div className="flex items-center text-xs">
                <span className={budgetSummary.netIncomeChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {budgetSummary.netIncomeChange > 0 ? '+' : ''}
                  {budgetSummary.netIncomeChange.toFixed(1)}%
                </span>
                <span className="text-muted-foreground ml-1">vs previous year</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Income/Expense Ratio</p>
              <p className="text-lg font-medium">
                {(budgetSummary.totalRevenue / budgetSummary.totalExpenses).toFixed(2)}
              </p>
              <div className="flex items-center text-xs text-muted-foreground">
                {budgetSummary.totalRevenue >= budgetSummary.totalExpenses ? 
                  "Balanced budget" : "Budget deficit"}
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-2 border-b">
            <h4 className="font-medium">Top Recommendations</h4>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          
          <div className="space-y-3">
            {topInsights.map((prediction, index) => (
              <div key={index} className="p-2 bg-muted/50 rounded-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">{prediction.glAccountId.split('-')[1]?.trim()}</p>
                    <p className="text-xs text-muted-foreground">{prediction.reasoning}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(prediction.suggestedAmount)}</p>
                    <p className="text-xs text-amber-600">Suggested</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {predictions.length > 3 && (
            <p className="text-xs text-muted-foreground text-center">
              +{predictions.length - 3} more recommendations available
            </p>
          )}
        </div>
        
        <div className="bg-muted/50 p-3 rounded-md">
          <div className="flex items-start">
            <TrendingUp className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Budget Health Score</p>
              <p className="text-3xl font-bold mt-1">84<span className="text-lg text-muted-foreground">/100</span></p>
              <p className="text-xs text-muted-foreground mt-1">Based on reserve levels, cash flow projections, and expense distribution</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button 
          className="w-full" 
          onClick={onApplyAllSuggestions}
          variant="default"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Apply AI Suggestions
        </Button>
        <Button 
          className="w-full" 
          onClick={onGenerateReport}
          variant="outline"
        >
          <FileCheck className="h-4 w-4 mr-2" />
          Generate AI Analysis Report
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BudgetAIInsights;
