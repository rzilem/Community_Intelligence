
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import HomeownerRequestDetailDialog from '@/components/homeowners/HomeownerRequestDetailDialog';
import HomeownerRequestEditDialog from '@/components/homeowners/dialog/HomeownerRequestEditDialog';
import HomeownerRequestCommentDialog from '@/components/homeowners/HomeownerRequestCommentDialog';
import HomeownerRequestHistoryDialog from '@/components/homeowners/history/HomeownerRequestHistoryDialog';
import NewRequestDialog from '@/components/homeowners/dialog/NewRequestDialog';
import { toast } from 'sonner';
import { HomeownerRequest, HomeownerRequestStatus, HomeownerRequestPriority, HomeownerRequestType } from '@/types/homeowner-request-types';
import { supabase } from '@/integrations/supabase/client';

interface HomeownerRequestDialogsProps {
  handleRefresh: () => void;
}

const HomeownerRequestDialogs = ({ handleRefresh }: HomeownerRequestDialogsProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRequest, setSelectedRequest] = useState<HomeownerRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isNewRequestFormOpen, setIsNewRequestFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check URL parameters for request ID
  useEffect(() => {
    const requestId = searchParams.get('requestId');
    const action = searchParams.get('action');
    
    if (requestId) {
      fetchRequestById(requestId, action);
    }
  }, [searchParams]);

  const fetchRequestById = async (requestId: string, action: string | null) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('homeowner_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setSelectedRequest(data);
        
        // Open the corresponding dialog based on the action
        if (action === 'view') {
          setIsDetailOpen(true);
        } else if (action === 'edit') {
          setIsEditOpen(true);
        } else if (action === 'comment') {
          setIsCommentOpen(true);
        } else if (action === 'history') {
          setIsHistoryOpen(true);
        } else {
          // Default to edit if no action specified
          setIsEditOpen(true);
        }
      }
    } catch (error) {
      console.error('Error fetching request:', error);
      toast.error('Failed to load request details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDialogs = () => {
    setIsDetailOpen(false);
    setIsEditOpen(false);
    setIsCommentOpen(false);
    setIsHistoryOpen(false);
    setSearchParams({});
  };

  const handleNewRequestSuccess = () => {
    setIsNewRequestFormOpen(false);
    toast.success("Request created successfully!");
    handleRefresh();
  };

  return (
    <>
      <HomeownerRequestDetailDialog
        request={selectedRequest}
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) handleCloseDialogs();
        }}
      />

      <HomeownerRequestEditDialog
        request={selectedRequest}
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) handleCloseDialogs();
        }}
        onSuccess={handleRefresh}
      />

      <HomeownerRequestCommentDialog
        request={selectedRequest}
        open={isCommentOpen}
        onOpenChange={(open) => {
          setIsCommentOpen(open);
          if (!open) handleCloseDialogs();
        }}
        onSuccess={handleRefresh}
      />

      <HomeownerRequestHistoryDialog
        request={selectedRequest}
        open={isHistoryOpen}
        onOpenChange={(open) => {
          setIsHistoryOpen(open);
          if (!open) handleCloseDialogs();
        }}
      />

      <NewRequestDialog
        isOpen={isNewRequestFormOpen}
        onClose={() => setIsNewRequestFormOpen(false)}
        onSuccess={handleNewRequestSuccess}
      />
    </>
  );
};

export default HomeownerRequestDialogs;
