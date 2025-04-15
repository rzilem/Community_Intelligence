
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Unplug, Save, FileText, CalendarCheck, CalendarX } from 'lucide-react';
import AssociationSelector from '@/components/associations/AssociationSelector';
import { Budget } from '@/types/accounting-types';

interface BudgetSettingsProps {
  budget: Budget;
  onBudgetChange: (key: keyof Budget, value: any) => void;
  onAssociationChange: (id: string) => void;
  onSave: () => void;
  onApprove: () => void;
  onUnapprove: () => void;
  onFinalize: () => void;
  onExport: () => void;
  isApproved: boolean;
  isFinalized: boolean;
}

const BudgetSettings: React.FC<BudgetSettingsProps> = ({
  budget,
  onBudgetChange,
  onAssociationChange,
  onSave,
  onApprove,
  onUnapprove,
  onFinalize,
  onExport,
  isApproved,
  isFinalized
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - 1 + i).toString());
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <AssociationSelector
          onAssociationChange={onAssociationChange}
          initialAssociationId={budget.associationId}
        />
        
        <div className="space-y-2">
          <Label>Fund</Label>
          <Select 
            value={budget.fundType} 
            onValueChange={(value) => onBudgetChange('fundType', value)}
            disabled={isFinalized}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Fund" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="operating">Operating</SelectItem>
              <SelectItem value="reserve">Reserve</SelectItem>
              <SelectItem value="capital">Capital Improvement</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Fiscal Year</Label>
          <Select 
            value={budget.year} 
            onValueChange={(value) => onBudgetChange('year', value)}
            disabled={isFinalized}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Status</Label>
          <div className="p-2 border rounded-md bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="font-medium">{isFinalized ? 'Finalized' : isApproved ? 'Approved' : 'Draft'}</span>
              <div className={`h-2 w-2 rounded-full ${
                isFinalized ? 'bg-blue-500' : 
                isApproved ? 'bg-green-500' : 
                'bg-amber-500'
              }`} />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>AI Assistance</Label>
          <div className="flex items-center space-x-2">
            <Switch id="ai-assist" defaultChecked />
            <Label htmlFor="ai-assist">Enable AI suggestions</Label>
          </div>
          <p className="text-xs text-muted-foreground">
            AI will analyze historical data and suggest budget allocations based on patterns and industry standards.
          </p>
        </div>
        
        <div className="pt-6 space-y-2">
          <Button className="w-full" onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Budget
          </Button>
          
          {!isApproved && (
            <Button className="w-full" variant="outline" onClick={onApprove}>
              <CalendarCheck className="h-4 w-4 mr-2" />
              Approve Budget
            </Button>
          )}
          
          {isApproved && !isFinalized && (
            <>
              <Button className="w-full" variant="outline" onClick={onUnapprove}>
                <CalendarX className="h-4 w-4 mr-2" />
                Unapprove Budget
              </Button>
              <Button className="w-full" variant="outline" onClick={onFinalize}>
                <Unplug className="h-4 w-4 mr-2" />
                Finalize Budget
              </Button>
            </>
          )}
          
          <Button className="w-full" variant="outline" onClick={onExport}>
            <FileText className="h-4 w-4 mr-2" />
            Export Budget
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetSettings;
