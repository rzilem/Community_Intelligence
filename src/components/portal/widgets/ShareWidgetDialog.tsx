
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface ShareWidgetDialogProps {
  widgetId: string;
  widgetType: string;
}

const ShareWidgetDialog: React.FC<ShareWidgetDialogProps> = ({ widgetId, widgetType }) => {
  const { user } = useAuth();

  const handleShare = async (recipientId: string) => {
    try {
      // Clone widget settings for recipient
      // This would be implemented in your backend
      toast.success('Widget shared successfully');
    } catch (error) {
      toast.error('Failed to share widget');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Share className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Widget</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Share this widget with other users in your organization
          </p>
          {/* Add user selection and sharing logic */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareWidgetDialog;
