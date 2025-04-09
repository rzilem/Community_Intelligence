
import React from 'react';
import { Proposal } from '@/types/proposal-types';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

interface ProposalViewerProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: Proposal | null;
  onSend?: () => void;
}

const ProposalViewer: React.FC<ProposalViewerProps> = ({
  isOpen,
  onClose,
  proposal,
  onSend
}) => {
  if (!proposal) return null;
  
  const getStatusBadge = (status: Proposal['status']) => {
    const statusStyles = {
      draft: 'bg-gray-200 text-gray-800',
      sent: 'bg-blue-200 text-blue-800',
      viewed: 'bg-yellow-200 text-yellow-800',
      accepted: 'bg-green-200 text-green-800',
      rejected: 'bg-red-200 text-red-800',
    };

    return <Badge className={statusStyles[status]}>{status}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>{proposal.name}</DialogTitle>
            {getStatusBadge(proposal.status)}
          </div>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="font-medium">{formatCurrency(proposal.amount)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date Created</p>
              <p className="font-medium">{format(new Date(proposal.created_at), 'PPP')}</p>
            </div>
            {proposal.sent_date && (
              <div>
                <p className="text-muted-foreground">Date Sent</p>
                <p className="font-medium">{format(new Date(proposal.sent_date), 'PPP')}</p>
              </div>
            )}
            {proposal.viewed_date && (
              <div>
                <p className="text-muted-foreground">Date Viewed</p>
                <p className="font-medium">{format(new Date(proposal.viewed_date), 'PPP')}</p>
              </div>
            )}
            {proposal.responded_date && (
              <div>
                <p className="text-muted-foreground">Date Responded</p>
                <p className="font-medium">{format(new Date(proposal.responded_date), 'PPP')}</p>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: proposal.content }} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {proposal.status === 'draft' && onSend && (
            <Button onClick={onSend}>
              Send Proposal
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalViewer;
