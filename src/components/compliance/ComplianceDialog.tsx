
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/auth';
import { Compliance } from '@/types/app-types';
import { useSupabaseCreate, useSupabaseUpdate } from '@/hooks/supabase';
import { ComplianceForm } from './ComplianceForm';
import { supabase } from '@/integrations/supabase/client';

interface ComplianceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issue: Compliance | null;
}

interface DatabaseProperty {
  id: string;
  address: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  square_footage?: number;
  association_id?: string;
  unit_number?: string;
  created_at: string;
  updated_at: string;
}

export const ComplianceDialog: React.FC<ComplianceDialogProps> = ({ 
  open, 
  onOpenChange,
  issue 
}) => {
  const { currentAssociation } = useAuth();
  const [properties, setProperties] = useState<DatabaseProperty[]>([]);
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
          .eq('association_id', currentAssociation.id);
          
        if (error) throw error;
        
        setProperties(data || []);
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

  // Convert database properties to the format expected by ComplianceForm
  const convertedProperties = properties.map(prop => ({
    id: prop.id,
    association_id: prop.association_id || currentAssociation?.id || '',
    address: prop.address,
    unit_number: prop.unit_number,
    city: prop.city,
    state: prop.state,
    zip: prop.zip_code,
    property_type: prop.property_type || '',
    bedrooms: prop.bedrooms,
    bathrooms: prop.bathrooms,
    square_feet: prop.square_footage,
    created_at: prop.created_at,
    updated_at: prop.updated_at
  }));

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
          properties={convertedProperties}
          loadingProperties={loading}
          onSubmit={handleSubmit}
          isSubmitting={createIssue.isPending || updateIssue.isPending}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
