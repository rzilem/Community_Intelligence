
import React, { useState } from 'react';
import HomeownerRequestDetailDialog from '@/components/homeowners/HomeownerRequestDetailDialog';
import HomeownerRequestEditDialog from '@/components/homeowners/dialog/HomeownerRequestEditDialog';
import HomeownerRequestCommentDialog from '@/components/homeowners/HomeownerRequestCommentDialog';
import HomeownerRequestHistoryDialog from '@/components/homeowners/history/HomeownerRequestHistoryDialog';
import NewRequestDialog from '@/components/homeowners/dialog/NewRequestDialog';
import { toast } from 'sonner';
import { HomeownerRequest } from '@/types/homeowner-request-types';

interface HomeownerRequestDialogsProps {
  handleRefresh: () => void;
}

const HomeownerRequestDialogs = ({ handleRefresh }: HomeownerRequestDialogsProps) => {
  const [selectedRequest, setSelectedRequest] = useState<HomeownerRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isNewRequestFormOpen, setIsNewRequestFormOpen] = useState(false);

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
        onOpenChange={setIsDetailOpen}
      />

      <HomeownerRequestEditDialog
        request={selectedRequest}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={handleRefresh}
      />

      <HomeownerRequestCommentDialog
        request={selectedRequest}
        open={isCommentOpen}
        onOpenChange={setIsCommentOpen}
        onSuccess={handleRefresh}
      />

      <HomeownerRequestHistoryDialog
        request={selectedRequest}
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
      />

      <NewRequestDialog
        open={isNewRequestFormOpen}
        onOpenChange={setIsNewRequestFormOpen}
        onSuccess={handleNewRequestSuccess}
      />
    </>
  );
};

export default HomeownerRequestDialogs;
