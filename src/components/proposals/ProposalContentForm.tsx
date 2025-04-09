
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ProposalTemplate } from '@/types/proposal-types';
import { Lead } from '@/types/lead-types';

interface ProposalContentFormProps {
  leads: Lead[];
  templates: ProposalTemplate[];
  templatesLoading: boolean;
  onTemplateChange: (templateId: string) => void;
  showLeadSelector: boolean;
}

const ProposalContentForm: React.FC<ProposalContentFormProps> = ({ 
  leads, 
  templates, 
  templatesLoading, 
  onTemplateChange,
  showLeadSelector
}) => {
  const form = useFormContext();

  return (
    <div className="space-y-4">
      {showLeadSelector && (
        <FormField
          control={form.control}
          name="lead_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lead</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a lead" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {leads.map((lead: Lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Proposal Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter proposal name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="template_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Template</FormLabel>
            {templatesLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    onTemplateChange(value);
                  }} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Selecting a template will replace the current content.
                </FormDescription>
              </>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Content</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Enter proposal content"
                className="min-h-[200px]" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ProposalContentForm;
