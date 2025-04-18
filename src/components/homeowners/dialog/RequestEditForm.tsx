
import React from 'react';
import { z } from 'zod';
import { UseFormReturn } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import RequestActionsArea from './RequestActionsArea';
import { Separator } from '@/components/ui/separator';

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
  form
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Separator className="my-4" />
        
        <div className="rounded-md overflow-hidden">
          {request && (
            <RequestActionsArea
              request={request}
              onSubmit={onSubmit}
              isPending={isPending}
            />
          )}
        </div>
      </form>
    </Form>
  );
};

export default RequestEditForm;
