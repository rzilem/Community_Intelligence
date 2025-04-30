
import React from 'react';
import { Button } from '@/components/ui/button';

interface RequestFormActionsProps {
  trackingNumber?: string;
  isPending: boolean;
  onCancel: () => void;
}

const RequestFormActions: React.FC<RequestFormActionsProps> = ({
  trackingNumber,
  isPending,
  onCancel
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="text-sm text-muted-foreground">
        {trackingNumber && (
          <span>Tracking #: {trackingNumber}</span>
        )}
      </div>
      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default RequestFormActions;
