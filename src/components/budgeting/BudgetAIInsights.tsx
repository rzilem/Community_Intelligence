
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowBigUp, ArrowBigDown, Sparkles, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { BudgetPrediction, BudgetSummary } from '@/types/accounting-types';

interface BudgetAIInsightsProps {
  accountPredictions?: BudgetPrediction[];
  summary?: BudgetSummary;
  isLoading?: boolean;
  onGenerateInsights?: () => void;
}

export const BudgetAIInsights: React.FC<BudgetAIInsightsProps> = ({
  accountPredictions,
  summary,
  isLoading = false,
  onGenerateInsights
}) => {
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Budget Insights
        </CardTitle>
        <CardDescription>
          AI-powered analysis and recommendations for your budget
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Analyzing budget data...</span>
          </div>
        ) : summary ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted rounded-md p-4">
                <div className="text-sm text-muted-foreground">Net Income</div>
                <div className="text-2xl font-bold">${summary.netIncome.toLocaleString()}</div>
                <div className="flex items-center mt-1">
                  {summary.netIncomeChange >= 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-500">+{summary.netIncomeChange.toLocaleString()}</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-sm text-red-500">{summary.netIncomeChange.toLocaleString()}</span>
                    </>
                  )}
                  <span className="text-xs text-muted-foreground ml-1">from last year</span>
                </div>
              </div>

              <div className="bg-muted rounded-md p-4">
                <div className="text-sm text-muted-foreground">Year-over-Year Change</div>
                <div className={`text-2xl font-bold ${summary.changePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.changePercentage >= 0 ? '+' : ''}{summary.changePercentage}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {summary.changeFromLastYear >= 0 ? 'Increase' : 'Decrease'} of ${Math.abs(summary.changeFromLastYear).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Key Insights</h3>
              <ul className="space-y-2">
                {summary.insights.map((insight, index) => (
                  <li key={index} className="bg-muted/50 rounded-md p-3 text-sm">
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
            
            {accountPredictions && accountPredictions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Account-Specific Recommendations</h3>
                <div className="space-y-2">
                  {accountPredictions.map((prediction) => (
                    <div 
                      key={prediction.glAccountId}
                      className="border rounded-md overflow-hidden"
                    >
                      <div 
                        className="bg-muted p-3 cursor-pointer flex justify-between items-center"
                        onClick={() => setExpandedInsight(expandedInsight === prediction.glAccountId ? null : prediction.glAccountId)}
                      >
                        <div>
                          <span className="font-medium">Account {prediction.glAccountId}</span>
                          <span className="text-sm ml-2">${prediction.suggestedAmount.toLocaleString()}</span>
                        </div>
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                          {Math.round(prediction.confidence * 100)}% confidence
                        </span>
                      </div>
                      
                      {expandedInsight === prediction.glAccountId && (
                        <div className="p-3 text-sm bg-white">
                          <p>{prediction.reasoning}</p>
                          {prediction.sources && prediction.sources.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs text-muted-foreground">Based on: </span>
                              {prediction.sources.map((source, i) => (
                                <span key={i} className="text-xs text-muted-foreground">{source}{i < prediction.sources!.length - 1 ? ', ' : ''}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center p-6 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Generate AI Insights</h3>
            <p className="text-muted-foreground mt-2 mb-4">
              Let AI analyze your budget to find savings opportunities and provide recommendations.
            </p>
            <Button onClick={onGenerateInsights}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Insights
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetAIInsights;
