
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Copy, Edit, Mail, Trash } from 'lucide-react';
import TooltipButton from '@/components/ui/tooltip-button';

interface MessageTemplateCardProps {
  title: string;
  description?: string;
  date?: string;
  type: 'email' | 'sms';
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onUse?: () => void;
}

const MessageTemplateCard: React.FC<MessageTemplateCardProps> = ({
  title,
  description,
  date,
  type,
  onEdit,
  onDelete,
  onDuplicate,
  onUse
}) => {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        {date && (
          <p className="text-sm text-muted-foreground">
            Last used: {date}
          </p>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          Type: {type === 'email' ? 'Email Template' : 'SMS Template'}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <TooltipButton 
          variant="outline" 
          size="sm"
          tooltip="Duplicate template"
          onClick={onDuplicate}
        >
          <Copy className="h-4 w-4" />
        </TooltipButton>
        
        <TooltipButton 
          variant="outline" 
          size="sm"
          tooltip="Edit template"
          onClick={onEdit}
        >
          <Edit className="h-4 w-4" />
        </TooltipButton>
        
        <TooltipButton 
          variant="outline" 
          size="sm"
          tooltip="Delete template"
          onClick={onDelete}
        >
          <Trash className="h-4 w-4" />
        </TooltipButton>
        
        <TooltipButton 
          size="sm"
          tooltip="Use this template"
          onClick={onUse}
        >
          <Mail className="h-4 w-4 mr-2" />
          Use Template
        </TooltipButton>
      </CardFooter>
    </Card>
  );
};

export default MessageTemplateCard;
