import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  ChevronRight, 
  ChevronDown, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertCircle, 
  CheckCircle2
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/lib/utils';
import { GLAccount, GLAccountGroup, BudgetEntry, BudgetPrediction } from '@/types/accounting-types';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BudgetEditorProps {
  glAccountGroups: GLAccountGroup[];
  budgetEntries: Record<string, BudgetEntry>;
  year: string;
  previousYear: string;
  isEditable: boolean;
  aiPredictions?: BudgetPrediction[];
  onBudgetChange: (glAccountId: string, month: number, amount: number) => void;
  onGroupToggle: (groupId: string) => void;
  onApplyAISuggestion?: (prediction: BudgetPrediction) => void;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const BudgetEditor: React.FC<BudgetEditorProps> = ({
  glAccountGroups,
  budgetEntries,
  year,
  previousYear,
  isEditable,
  aiPredictions,
  onBudgetChange,
  onGroupToggle,
  onApplyAISuggestion
}) => {
  const [visibleMonths, setVisibleMonths] = useState<number[]>([0, 1, 2, 3, 4, 5]);
  
  const predictionsMap = aiPredictions ? 
    Object.fromEntries(aiPredictions.map(p => [p.glAccountId, p])) : 
    {};
  
  const handleChangeMonth = (direction: 'left' | 'right') => {
    if (direction === 'left' && visibleMonths[0] > 0) {
      setVisibleMonths(visibleMonths.map(m => m - 1));
    } else if (direction === 'right' && visibleMonths[visibleMonths.length - 1] < 11) {
      setVisibleMonths(visibleMonths.map(m => m + 1));
    }
  };

  const calculateChangePercent = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? "New" : "0%";
    const change = ((current - previous) / Math.abs(previous)) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const formatNumber = (num: number | undefined): string => {
    if (num === undefined) return '-';
    return formatCurrency(num);
  };

  const renderMonthlyInput = (glAccount: GLAccount, month: number) => {
    const entry = budgetEntries[glAccount.id];
    const monthlyAmount = entry?.monthlyAmounts.find(m => m.month === month + 1)?.amount || 0;
    
    return (
      <TableCell key={`${glAccount.id}-${month}`} className="text-right p-2">
        {isEditable ? (
          <Input 
            type="number"
            value={monthlyAmount === 0 ? '' : monthlyAmount}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
              onBudgetChange(glAccount.id, month + 1, value);
            }}
            className="h-8 w-24 text-right"
            placeholder="0.00"
          />
        ) : (
          formatNumber(monthlyAmount)
        )}
      </TableCell>
    );
  };

  const renderAIPredictionIndicator = (glAccount: GLAccount) => {
    const prediction = predictionsMap[glAccount.id];
    if (!prediction) return null;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 ml-1"
              onClick={() => onApplyAISuggestion && onApplyAISuggestion(prediction)}
            >
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="max-w-xs">
              <p className="font-medium">AI Suggestion: {formatCurrency(prediction.suggestedAmount)}</p>
              <p className="text-xs text-muted-foreground mt-1">{prediction.reasoning}</p>
              <p className="text-xs mt-2">Confidence: {(prediction.confidence * 100).toFixed(0)}%</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="border rounded-md">
      <div className="flex justify-between items-center p-2 bg-muted">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleChangeMonth('left')}
            disabled={visibleMonths[0] === 0}
          >
            &lt;
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleChangeMonth('right')}
            disabled={visibleMonths[visibleMonths.length - 1] === 11}
          >
            &gt;
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing months: {MONTHS[visibleMonths[0]]} - {MONTHS[visibleMonths[visibleMonths.length - 1]]}
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100vh-300px)]">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-64 sticky left-0 bg-background z-20">GL Account</TableHead>
              <TableHead className="text-right w-32">{previousYear} Actual</TableHead>
              <TableHead className="text-right w-32">{year} Budget</TableHead>
              <TableHead className="text-right w-24">% Change</TableHead>
              {visibleMonths.map(month => (
                <TableHead key={month} className="text-right w-24">{MONTHS[month]}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {glAccountGroups.map(group => (
              <React.Fragment key={group.id}>
                <TableRow className="hover:bg-muted/30 group cursor-pointer" onClick={() => onGroupToggle(group.id)}>
                  <TableCell className="font-medium sticky left-0 bg-background group-hover:bg-muted/30 z-20">
                    <div className="flex items-center">
                      {group.isExpanded ? 
                        <ChevronDown className="h-4 w-4 mr-2" /> : 
                        <ChevronRight className="h-4 w-4 mr-2" />}
                      {group.code} - {group.name} (Count: {group.accounts.length})
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatNumber(group.totalPreviousYear)}</TableCell>
                  <TableCell className="text-right font-medium">{formatNumber(group.totalBudget)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      {group.change > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : group.change < 0 ? (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      ) : (
                        <Minus className="h-4 w-4 text-gray-500 mr-1" />
                      )}
                      {calculateChangePercent(group.totalBudget, group.totalPreviousYear)}
                    </div>
                  </TableCell>
                  {visibleMonths.map(() => <TableCell key={`${group.id}-spacer`} />)}
                </TableRow>
                
                {group.isExpanded && group.accounts.map(account => {
                  const entry = budgetEntries[account.id] || { 
                    id: account.id,
                    glAccountId: account.id,
                    monthlyAmounts: [], 
                    annualTotal: 0,
                    previousYearActual: 0
                  };
                  
                  return (
                    <TableRow key={account.id} className="hover:bg-muted/20">
                      <TableCell className="pl-8 sticky left-0 bg-background hover:bg-muted/20 z-20">
                        <div className="flex items-center">
                          {account.code} - {account.name}
                          {renderAIPredictionIndicator(account)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{formatNumber(entry.previousYearActual)}</TableCell>
                      <TableCell className="text-right">{formatNumber(entry.annualTotal)}</TableCell>
                      <TableCell className="text-right">
                        {calculateChangePercent(
                          entry.annualTotal || 0, 
                          entry.previousYearActual || 0
                        )}
                      </TableCell>
                      {visibleMonths.map(month => renderMonthlyInput(account, month))}
                    </TableRow>
                  );
                })}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default BudgetEditor;
