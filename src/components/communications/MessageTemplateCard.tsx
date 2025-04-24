
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Copy, Edit, Mail, Trash } from 'lucide-react';
import TooltipButton from '@/components/ui/tooltip-button';

interface MessageTemplateCardProps {
  template: {
    name: string;
    description?: string;
    lastUsed?: string;
  };
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onUse?: () => void;
}

const MessageTemplateCard: React.FC<MessageTemplateCardProps> = ({
  template,
  onEdit,
  onDelete,
  onDuplicate,
  onUse
}) => {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium">{template.name}</h3>
        {template.description && (
          <p className="text-sm text-muted-foreground">{template.description}</p>
        )}
      </CardHeader>
      <CardContent>
        {template.lastUsed && (
          <p className="text-sm text-muted-foreground">
            Last used: {template.lastUsed}
          </p>
        )}
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
