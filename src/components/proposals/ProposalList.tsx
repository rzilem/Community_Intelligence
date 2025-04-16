
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Edit2, 
  Trash2, 
  Eye, 
  Send, 
  MoreHorizontal,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  BarChart
} from 'lucide-react';
import { Proposal } from '@/types/proposal-types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProposalListProps {
  proposals: Proposal[];
  isLoading: boolean;
  onEdit: (proposal: Proposal) => void;
  onView: (proposal: Proposal) => void;
  onDelete: (proposalId: string) => void;
  onSend: (proposal: Proposal) => void;
  onSelect?: (proposal: Proposal | null) => void;
  selectedProposal?: Proposal | null;
}

const ProposalList: React.FC<ProposalListProps> = ({
  proposals,
  isLoading,
  onEdit,
  onView,
  onDelete,
  onSend,
  onSelect,
  selectedProposal
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-gray-100">Draft</Badge>;
      case 'sent':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Sent</Badge>;
      case 'viewed':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Viewed</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-4 w-4 text-gray-500" />;
      case 'sent':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'viewed':
        return <Eye className="h-4 w-4 text-purple-500" />;
      case 'accepted':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (proposals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <h3 className="font-medium text-lg mb-2">No proposals yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first proposal to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proposals</CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Created</TableHead>
                <TableHead className="hidden sm:table-cell">Last Updated</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Analytics</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.map((proposal) => (
                <TableRow 
                  key={proposal.id}
                  className={selectedProposal?.id === proposal.id ? "bg-accent/50" : ""}
                  onClick={() => onSelect?.(proposal)}
                  style={{ cursor: onSelect ? 'pointer' : 'default' }}
                >
                  <TableCell className="font-medium">{proposal.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(proposal.status)}
                      {getStatusBadge(proposal.status)}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {new Date(proposal.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {new Date(proposal.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ${proposal.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4 text-blue-500" />
                            <span>{proposal.analytics?.views || 0}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Total views</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      {proposal.analytics?.avg_view_time && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-green-500" />
                              <span>{proposal.analytics.avg_view_time}m</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Average view time</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              onView(proposal);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View proposal</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(proposal);
                            }}
                          >
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          
                          {proposal.status === 'draft' && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onSend(proposal);
                              }}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Send to Client
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(proposal.id);
                            }}
                            className="text-red-500 focus:text-red-500"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};

export default ProposalList;
