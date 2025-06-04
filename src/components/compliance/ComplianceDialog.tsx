
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { Compliance, Property } from '@/types/app-types';
import { useSupabaseCreate, useSupabaseUpdate } from '@/hooks/supabase';
import { ComplianceForm } from './ComplianceForm';
import { supabase } from '@/integrations/supabase/client';

interface ComplianceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issue: Compliance | null;
}

export const ComplianceDialog: React.FC<ComplianceDialogProps> = ({ 
  open, 
  onOpenChange,
  issue 
}) => {
  const { currentAssociation } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  
  const createIssue = useSupabaseCreate<Compliance>('compliance_issues');
  const updateIssue = useSupabaseUpdate<Compliance>('compliance_issues');

  useEffect(() => {
    const fetchProperties = async () => {
      if (!currentAssociation) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('hoa_id', currentAssociation.id);
          
        if (error) throw error;
        
        // Map to ensure the data conforms to the Property type from app-types.ts
        const mappedData = (data || []).map(prop => ({
          id: prop.id,
          association_id: (prop as any).hoa_id ?? (prop as any).association_id ?? '',
          address: prop.address,
          unit_number: (prop as any).unit_number ?? undefined,
          city: prop.city ?? undefined,
          state: prop.state ?? undefined,
          zip: (prop as any).zip_code ?? (prop as any).zip ?? undefined,
          property_type: prop.property_type ?? '',
          bedrooms: prop.bedrooms ?? undefined,
          bathrooms: prop.bathrooms ?? undefined,
          square_feet: (prop as any).square_footage ?? (prop as any).square_feet ?? undefined,
          created_at: prop.created_at || new Date().toISOString(),
          updated_at: prop.updated_at || new Date().toISOString(),
          image_url: (prop as any).image_url ?? undefined
        })) as Property[];
        
        setProperties(mappedData);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, [currentAssociation]);

  const handleSubmit = async (data: Partial<Compliance>) => {
    try {
      if (issue) {
        await updateIssue.mutateAsync({ 
          id: issue.id,
          data 
        });
      } else if (currentAssociation) {
        await createIssue.mutateAsync({
          ...data,
          association_id: currentAssociation.id,
          status: data.status || 'open'
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving compliance issue:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{issue ? 'Edit Compliance Issue' : 'Report New Compliance Issue'}</DialogTitle>
          <DialogDescription>
            {issue 
              ? 'Update the details of this compliance issue.' 
              : 'Enter the details of the new compliance violation or issue.'}
          </DialogDescription>
        </DialogHeader>
        
        <ComplianceForm 
          defaultValues={issue || {
            violation_type: 'appearance',
            status: 'open',
            association_id: currentAssociation?.id || ''
          }}
          properties={properties}
          loadingProperties={loading}
          onSubmit={handleSubmit}
          isSubmitting={createIssue.isPending || updateIssue.isPending}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
