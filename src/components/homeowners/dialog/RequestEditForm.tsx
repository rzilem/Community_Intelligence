
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import RequestActionsArea from './RequestActionsArea';

interface RequestEditFormProps {
  request: HomeownerRequest | null;
  onSubmit: (values: any) => void;
  isPending: boolean;
  onCancel: () => void;
  form: UseFormReturn<any>;
}

const RequestEditForm: React.FC<RequestEditFormProps> = ({ 
  request, 
  onSubmit, 
  isPending,
  onCancel,
  form
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {request && (
          <RequestActionsArea
            request={request}
            onSubmit={onSubmit}
            isPending={isPending}
            onCancel={onCancel}
          />
        )}
      </form>
    </Form>
  );
};

export default RequestEditForm;
