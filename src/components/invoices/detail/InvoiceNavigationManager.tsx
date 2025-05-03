
import React, { useState } from 'react';
import { InvoiceNavigation } from '@/components/invoices/InvoiceNavigation';

interface InvoiceNavigationManagerProps {
  isNewInvoice: boolean;
  allInvoices: any[] | undefined;
  isLoadingAllInvoices: boolean;
  currentId: string;
  onNavigate: (invoiceId: string) => void;
}

export const InvoiceNavigationManager: React.FC<InvoiceNavigationManagerProps> = ({
  isNewInvoice,
  allInvoices,
  isLoadingAllInvoices,
  currentId,
  onNavigate
}) => {
  const [showPreview, setShowPreview] = useState(true);
  
  // Get pending invoices and current position
  const pendingInvoices = allInvoices?.filter(inv => inv.status === 'pending') || [];
  const currentPosition = pendingInvoices.findIndex(inv => inv.id === currentId) + 1;
  const totalPending = pendingInvoices.length;

  const navigateToInvoice = (direction: 'next' | 'prev') => {
    if (!allInvoices || allInvoices.length === 0) return;
    
    if (pendingInvoices.length === 0) return;
    
    // Find current index within pending invoices
    const currentIndex = pendingInvoices.findIndex(inv => inv.id === currentId);
    if (currentIndex === -1) {
      // If current invoice is not pending, navigate to the first pending invoice
      onNavigate(pendingInvoices[0].id);
      return;
    }
    
    // Calculate next index
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % pendingInvoices.length;
    } else {
      nextIndex = (currentIndex - 1 + pendingInvoices.length) % pendingInvoices.length;
    }
    
    onNavigate(pendingInvoices[nextIndex].id);
  };

  return (
    <InvoiceNavigation 
      isNewInvoice={isNewInvoice}
      showPreview={showPreview}
      onTogglePreview={() => setShowPreview(!showPreview)}
      onNavigate={navigateToInvoice}
      disableNavigation={isLoadingAllInvoices || pendingInvoices.length <= 1}
      currentPosition={currentPosition}
      totalPending={totalPending}
    />
  );
};
