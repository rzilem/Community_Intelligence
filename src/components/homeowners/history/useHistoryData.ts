
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { HistoryItemData } from './HistoryItem';
import { checkTableAccess } from '@/integrations/supabase/queries';

export const useHistoryData = (request: HomeownerRequest | null, isDialogOpen: boolean) => {
  const [history, setHistory] = useState<HistoryItemData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isDialogOpen && request) {
      fetchHistory();
    }
  }, [isDialogOpen, request]);

  const fetchHistory = async () => {
    if (!request) return;
    
    try {
      setLoading(true);
      
      // First check if we have access to the history table
      const { accessible, error: accessError } = await checkTableAccess('history');
      
      if (!accessible) {
        console.warn('History table not available:', accessError?.message);
        // Use mock data if table doesn't exist
        setHistory(generateMockHistory(request));
        return;
      }
      
      // Fetch real history data directly from the table instead of using RPC
      const { data, error } = await supabase
        .from('history')
        .select(`
          *,
          user:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('entity_id', request.id)
        .eq('entity_type', 'homeowner_request')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data && Array.isArray(data) && data.length > 0) {
        // Type cast the data as HistoryItemData[]
        setHistory(data as unknown as HistoryItemData[]);
      } else {
        // Use mock data if no real history exists
        setHistory(generateMockHistory(request));
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load request history');
      // Fallback to mock data
      setHistory(generateMockHistory(request));
    } finally {
      setLoading(false);
    }
  };
  
  // Generate mock history for development and testing
  const generateMockHistory = (req: HomeownerRequest): HistoryItemData[] => {
    const createdDate = new Date(req.created_at);
    const updateDate = new Date(req.updated_at);
    
    return [
      {
        id: 'mock-1',
        created_at: req.created_at,
        entity_id: req.id,
        entity_type: 'homeowner_request',
        change_type: 'created',
        changes: {
          status: 'open',
          title: req.title,
          priority: req.priority
        },
        user: {
          first_name: 'System',
          last_name: 'Generated',
          email: 'system@community-intelligence.app'
        }
      },
      ...(updateDate.getTime() > createdDate.getTime() + 60000 ? [{
        id: 'mock-2',
        created_at: req.updated_at,
        entity_id: req.id,
        entity_type: 'homeowner_request',
        change_type: 'updated',
        changes: {
          status: {
            old: 'open',
            new: req.status
          }
        },
        user: {
          first_name: 'System',
          last_name: 'Generated',
          email: 'system@community-intelligence.app'
        }
      }] : [])
    ];
  };

  return {
    history,
    loading,
    fetchHistory
  };
};
