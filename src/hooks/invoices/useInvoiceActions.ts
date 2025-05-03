
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useInvoiceActions = (saveInvoice: () => Promise<any>, updateInvoice: any, invoice: any) => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const handleSave = async () => {
    console.log("Saving invoice with association:", invoice.association);
    console.log("Saving invoice with vendor:", invoice.vendor);
    
    if (isSaving) return; // Prevent multiple save attempts
    
    setIsSaving(true);
    setPreviewError(null);
    
    try {
      await saveInvoice();
      
      toast.success("Invoice updated successfully");
    } catch (error: any) {
      console.error("Error saving invoice:", error);
      
      let errorMessage = "There was an error updating the invoice. Please try again.";
      
      if (error instanceof Error && error.message.includes("uuid")) {
        errorMessage = "There was an error with the association field. Please select a valid association or leave it empty.";
      }
      
      toast.error(errorMessage);
      setPreviewError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = () => {
    updateInvoice({
      id: invoice.id,
      data: {
        status: 'approved'
      }
    }, {
      onSuccess: () => {
        toast.success("Invoice approved successfully");
        navigate("/accounting/invoice-queue");
      },
      onError: (error: Error) => {
        toast.error(`Error approving invoice: ${error.message}`);
        setPreviewError(`Error approving invoice: ${error.message}`);
      }
    });
  };

  return {
    isSaving,
    previewError,
    setPreviewError,
    handleSave,
    handleApprove
  };
};
