
import { useState } from 'react';
import { HomeownerRequest, HomeownerRequestStatus, HomeownerRequestPriority, HomeownerRequestType } from '@/types/homeowner-request-types';

interface UseRequestFormProps {
  initialRequest?: Partial<HomeownerRequest>;
  onSubmit: (request: HomeownerRequest) => Promise<boolean>;
  onCancel: () => void;
}

export const useRequestForm = ({ initialRequest, onSubmit, onCancel }: UseRequestFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [request, setRequest] = useState<Partial<HomeownerRequest>>({
    title: '',
    description: '',
    status: 'open' as HomeownerRequestStatus,
    priority: 'medium' as HomeownerRequestPriority,
    type: 'general' as HomeownerRequestType,
    property_id: '',
    association_id: '',
    ...initialRequest
  });

  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    type?: string;
    property_id?: string;
    association_id?: string;
  }>({});

  const updateField = (field: keyof HomeownerRequest, value: any) => {
    setRequest(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when field is updated
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!request.title) {
      newErrors.title = 'Title is required';
    }

    if (!request.description) {
      newErrors.description = 'Description is required';
    }

    if (!request.status) {
      newErrors.status = 'Status is required';
    }

    if (!request.priority) {
      newErrors.priority = 'Priority is required';
    }

    if (!request.type) {
      newErrors.type = 'Type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateForm()) {
      return false;
    }

    setIsSubmitting(true);

    try {
      // Create full request object with all required fields
      const fullRequest: HomeownerRequest = {
        id: request.id || `req-${Date.now()}`,
        title: request.title || '',
        description: request.description || '',
        status: request.status as HomeownerRequestStatus,
        priority: request.priority as HomeownerRequestPriority,
        type: request.type as HomeownerRequestType,
        created_at: request.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        association_id: request.association_id || '',
        resolved_at: request.resolved_at || undefined,
        tracking_number: request.tracking_number || `TRK-${Date.now()}`,
        attachments: request.attachments || [],
        property_id: request.property_id,
        resident_id: request.resident_id,
        assigned_to: request.assigned_to,
        html_content: request.html_content,
        
        // Virtual properties
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
        residentId: request.residentId,
        propertyId: request.propertyId,
        associationId: request.associationId,
        resolvedAt: request.resolvedAt
      };

      const success = await onSubmit(fullRequest);
      return success;
    } catch (error) {
      console.error('Error submitting request:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    request,
    updateField,
    handleSubmit,
    handleCancel: onCancel,
    isSubmitting,
    errors
  };
};
