
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, FileText, Calendar, File } from 'lucide-react';
import { toast } from 'sonner';
import { QuickLinkCard } from './QuickLinkCard';

interface QuickLinksSectionProps {
  translations: {
    makePayment: string;
    submitRequest: string;
    calendar: string;
    viewDocuments: string;
    [key: string]: string; // Add index signature for flexibility
  };
}

export const QuickLinksSection: React.FC<QuickLinksSectionProps> = ({ translations }) => {
  const navigate = useNavigate();
  
  const quickLinks = [
    { 
      title: translations.makePayment, 
      path: '/portal/homeowner/payments', 
      icon: CreditCard, 
      color: 'bg-blue-100',
      onClickToast: () => toast.info(translations.makePayment, { description: 'Redirecting to payment options' })
    },
    { 
      title: translations.submitRequest, 
      path: '/portal/homeowner/requests', 
      icon: FileText, 
      color: 'bg-green-100',
      onClickToast: () => toast.info(translations.submitRequest, { description: 'Preparing request submission form' })
    },
    { 
      title: translations.calendar, 
      path: '/portal/homeowner/calendar', 
      icon: Calendar, 
      color: 'bg-purple-100' 
    },
    { 
      title: translations.viewDocuments, 
      path: '/portal/homeowner/documents', 
      icon: File, 
      color: 'bg-amber-100' 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {quickLinks.map((link) => (
        <QuickLinkCard
          key={link.path}
          icon={link.icon}
          title={link.title}
          color={link.color}
          onClick={() => {
            link.onClickToast?.();
            navigate(link.path);
          }}
        />
      ))}
    </div>
  );
};
