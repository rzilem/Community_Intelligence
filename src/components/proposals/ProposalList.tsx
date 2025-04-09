
import React from 'react';
import { Proposal } from '@/types/proposal-types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, MoreHorizontal, Trash2, Eye, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ProposalListProps {
  proposals: Proposal[];
  isLoading: boolean;
  leadId?: string;
  onEdit: (proposal: Proposal) => void;
  onView: (proposal: Proposal) => void;
  onDelete: (proposalId: string) => void;
  onSend: (proposal: Proposal) => void;
}

const ProposalList: React.FC<ProposalListProps> = ({
  proposals,
  isLoading,
  onEdit,
  onView,
  onDelete,
  onSend
}) => {
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

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg bg-gray-50">
        <p className="text-gray-500">No proposals found.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proposals.map((proposal) => (
            <TableRow key={proposal.id}>
              <TableCell className="font-medium">{proposal.name}</TableCell>
              <TableCell>{getStatusBadge(proposal.status)}</TableCell>
              <TableCell>{formatCurrency(proposal.amount)}</TableCell>
              <TableCell>{format(new Date(proposal.created_at), 'PPP')}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onView(proposal)}>
                      <Eye className="mr-2 h-4 w-4" /> View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(proposal)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    {proposal.status === 'draft' && (
                      <DropdownMenuItem onClick={() => onSend(proposal)}>
                        <Send className="mr-2 h-4 w-4" /> Send
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      className="text-red-600" 
                      onClick={() => onDelete(proposal.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProposalList;
