
import { useState, useEffect } from 'react';
import { HomeownerRequestComment } from '@/types/homeowner-request-types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRequestComments = (requestId: string | null) => {
  const [comments, setComments] = useState<HomeownerRequestComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const fetchComments = async () => {
    if (!requestId) return;
    
    try {
      setLoadingComments(true);
      
      // Mock comments data since comments table doesn't exist
      const mockComments: HomeownerRequestComment[] = [
        {
          id: '1',
          content: 'Initial comment on this request',
          created_at: new Date().toISOString(),
          user_id: 'user-1',
          parent_id: requestId,
          parent_type: 'homeowner_request',
          user: {
            first_name: 'Admin',
            last_name: 'User',
            email: 'admin@example.com'
          }
        }
      ];
      
      setComments(mockComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (requestId) {
      fetchComments();
    }
  }, [requestId]);

  return {
    comments,
    loadingComments,
    fetchComments
  };
};
