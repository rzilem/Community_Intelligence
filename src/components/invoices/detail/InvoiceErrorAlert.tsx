
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface InvoiceErrorAlertProps {
  error: string | null;
}

export const InvoiceErrorAlert: React.FC<InvoiceErrorAlertProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};
