
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';

interface TransactionFiltersProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onReset: () => void;
}

export const TransactionFilters = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onReset,
}: TransactionFiltersProps) => {
  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <DatePicker
              date={startDate}
              onSelect={onStartDateChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label>End Date</Label>
            <DatePicker
              date={endDate}
              onSelect={onEndDateChange}
            />
          </div>
          
          <div className="flex items-end">
            <Button variant="outline" onClick={onReset}>
              Reset Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
