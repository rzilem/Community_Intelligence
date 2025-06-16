
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import BudgetRangeFields from '../fields/BudgetRangeFields';
import DatePickerField from '../fields/DatePickerField';
import { BidRequestFormData } from '../../types/bid-request-form-types';

interface BidRequestBudgetTimelineSectionProps {
  form: UseFormReturn<BidRequestFormData>;
}

const BidRequestBudgetTimelineSection: React.FC<BidRequestBudgetTimelineSectionProps> = ({ form }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget & Timeline</CardTitle>
        <CardDescription>
          Set your budget expectations and project timeline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <BudgetRangeFields form={form} />
            </div>

            <DatePickerField
              form={form}
              name="preferred_start_date"
              label="Preferred Start Date"
            />

            <DatePickerField
              form={form}
              name="required_completion_date"
              label="Required Completion Date"
            />

            <DatePickerField
              form={form}
              name="bid_deadline"
              label="Bid Deadline"
            />
          </div>
        </Form>
      </CardContent>
    </Card>
  );
};

export default BidRequestBudgetTimelineSection;
