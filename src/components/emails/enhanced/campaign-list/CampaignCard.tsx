
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EmailCampaign } from '@/types/email-campaign-types';
import { MoreHorizontal, Send, Edit, Trash2, Calendar, Eye, BarChart3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CampaignCardProps {
  campaign: EmailCampaign;
  onEdit: (campaign: EmailCampaign) => void;
  onDelete: (id: string) => void;
  onSend: (id: string) => void;
  onSchedule: (campaign: EmailCampaign) => void;
  onViewAnalytics: (campaign: EmailCampaign) => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onEdit,
  onDelete,
  onSend,
  onSchedule,
  onViewAnalytics
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'sending': return 'bg-yellow-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const canSend = campaign.status === 'draft' && campaign.recipient_count && campaign.recipient_count > 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg truncate">{campaign.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(campaign)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {canSend && (
                <DropdownMenuItem onClick={() => onSend(campaign.id)}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Now
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onSchedule(campaign)}>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule
              </DropdownMenuItem>
              {campaign.status === 'sent' && (
                <DropdownMenuItem onClick={() => onViewAnalytics(campaign)}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(campaign.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(campaign.status)}>
            {campaign.status.toUpperCase()}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {campaign.recipient_count || 0} recipients
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm font-medium truncate">{campaign.subject}</div>
          <div className="text-xs text-muted-foreground">
            Created {formatDistanceToNow(new Date(campaign.created_at))} ago
          </div>
          {campaign.send_at && (
            <div className="text-xs text-blue-600">
              Scheduled for {new Date(campaign.send_at).toLocaleString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignCard;
