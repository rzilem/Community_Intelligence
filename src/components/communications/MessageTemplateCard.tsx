
import React from 'react';
import { FileText, MoreVertical, Copy, Pencil, Trash } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MessageTemplateCardProps {
  title: string;
  description: string;
  date: string;
  type: 'email' | 'sms';
  onUse: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const MessageTemplateCard: React.FC<MessageTemplateCardProps> = ({
  title,
  description,
  date,
  type,
  onUse,
  onEdit,
  onDuplicate,
  onDelete
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start space-y-0">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-xs text-muted-foreground">
              {type === 'email' ? 'Email Template' : 'SMS Template'} • Last updated: {date}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate} className="cursor-pointer">
              <Copy className="mr-2 h-4 w-4" />
              <span>Duplicate</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-destructive focus:text-destructive">
              <Trash className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-3 w-full"
          onClick={onUse}
        >
          Use Template
        </Button>
      </CardContent>
    </Card>
  );
};

export default MessageTemplateCard;
