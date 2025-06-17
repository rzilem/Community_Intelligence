
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
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('parent_id', requestId)
        .eq('parent_type', 'homeowner_request')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setComments(data || []);
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
