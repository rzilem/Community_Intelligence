
import React from 'react';
import { DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CurrencySettingsCardProps {
  value: string;
  onChange: (value: string) => void;
}

const CurrencySettingsCard: React.FC<CurrencySettingsCardProps> = ({ value, onChange }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <CardTitle>Currency</CardTitle>
        </div>
        <CardDescription>
          Set the default currency for financial data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select 
          value={value} 
          onValueChange={onChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">US Dollar ($)</SelectItem>
            <SelectItem value="EUR">Euro (€)</SelectItem>
            <SelectItem value="GBP">British Pound (£)</SelectItem>
            <SelectItem value="CAD">Canadian Dollar (C$)</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default CurrencySettingsCard;
