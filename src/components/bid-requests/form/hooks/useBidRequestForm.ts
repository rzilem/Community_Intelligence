
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/auth';
import { bidRequestFormSchema, BidRequestFormData } from '../../types/bid-request-form-types';

export const useBidRequestForm = () => {
  const { currentAssociation, profile } = useAuth();

  console.log('=== FORM INITIALIZATION ===');
  console.log('Current association:', currentAssociation);
  console.log('User profile:', profile);

  const form = useForm<BidRequestFormData>({
    resolver: zodResolver(bidRequestFormSchema),
    defaultValues: {
      association_id: currentAssociation?.id || '',
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      location: '',
      special_requirements: '',
    },
  });

  const handleAssociationChange = (associationId: string) => {
    console.log('Association changed to:', associationId);
    form.setValue('association_id', associationId);
  };

  return {
    form,
    handleAssociationChange,
  };
};
