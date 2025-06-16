
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/auth';
import { bidRequestFormSchema, BidRequestFormData } from '../../types/bid-request-form-types';

export const useBidRequestForm = () => {
  const { currentAssociation } = useAuth();

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
    form.setValue('association_id', associationId);
  };

  return {
    form,
    handleAssociationChange,
  };
};
