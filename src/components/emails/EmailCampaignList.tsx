
import React from 'react';
import { useEmailCampaigns } from '@/hooks/emails/useEmailCampaigns';
import { EmailCampaign } from '@/types/email-campaign-types';
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
import { Edit, MoreHorizontal, Trash2, Eye, Send, Pause } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface EmailCampaignListProps {
  onEdit: (campaign: EmailCampaign) => void;
  onView: (campaign: EmailCampaign) => void;
  onDelete: (campaignId: string) => void;
  onSend: (campaign: EmailCampaign) => void;
  onPause: (campaign: EmailCampaign) => void;
}

const EmailCampaignList: React.FC<EmailCampaignListProps> = ({
  onEdit,
  onView,
  onDelete,
  onSend,
  onPause
}) => {
  const { campaigns, isLoading } = useEmailCampaigns();

  const getStatusBadge = (status: EmailCampaign['status']) => {
    const statusStyles = {
      draft: 'bg-gray-200 text-gray-800',
      scheduled: 'bg-yellow-200 text-yellow-800',
      sending: 'bg-blue-200 text-blue-800',
      sent: 'bg-green-200 text-green-800',
      cancelled: 'bg-red-200 text-red-800',
      paused: 'bg-orange-200 text-orange-800',
    };

    return <Badge className={statusStyles[status]}>{status}</Badge>;
  };

  const handleDelete = async (campaignId: string) => {
    try {
      onDelete(campaignId);
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
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

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg bg-gray-50">
        <p className="text-gray-500">No email campaigns found.</p>
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
            <TableHead>Recipients</TableHead>
            <TableHead>Opens</TableHead>
            <TableHead>Clicks</TableHead>
            <TableHead>Date Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell className="font-medium">{campaign.name}</TableCell>
              <TableCell>{getStatusBadge(campaign.status)}</TableCell>
              <TableCell>{campaign.recipient_count}</TableCell>
              <TableCell>{campaign.open_count} ({campaign.recipient_count ? Math.round((campaign.open_count / campaign.recipient_count) * 100) : 0}%)</TableCell>
              <TableCell>{campaign.click_count} ({campaign.recipient_count ? Math.round((campaign.click_count / campaign.recipient_count) * 100) : 0}%)</TableCell>
              <TableCell>{format(new Date(campaign.created_at), 'PPP')}</TableCell>
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
                    <DropdownMenuItem onClick={() => onView(campaign)}>
                      <Eye className="mr-2 h-4 w-4" /> View
                    </DropdownMenuItem>
                    {campaign.status === 'draft' && (
                      <>
                        <DropdownMenuItem onClick={() => onEdit(campaign)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSend(campaign)}>
                          <Send className="mr-2 h-4 w-4" /> Send Now
                        </DropdownMenuItem>
                      </>
                    )}
                    {campaign.status === 'scheduled' && (
                      <DropdownMenuItem onClick={() => onPause(campaign)}>
                        <Pause className="mr-2 h-4 w-4" /> Pause
                      </DropdownMenuItem>
                    )}
                    {campaign.status === 'sending' && (
                      <DropdownMenuItem onClick={() => onPause(campaign)}>
                        <Pause className="mr-2 h-4 w-4" /> Cancel Sending
                      </DropdownMenuItem>
                    )}
                    {['draft', 'scheduled'].includes(campaign.status) && (
                      <DropdownMenuItem 
                        className="text-red-600" 
                        onClick={() => handleDelete(campaign.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    )}
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

export default EmailCampaignList;
