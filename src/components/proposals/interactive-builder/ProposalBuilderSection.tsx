
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Grip, Trash2, Edit, ChevronDown, ChevronUp, Image, Video, FileText } from 'lucide-react';
import { ProposalSection } from '@/types/proposal-types';
import RichTextEditor from './RichTextEditor';

interface ProposalBuilderSectionProps {
  section: ProposalSection;
  dragHandleProps: any;
  onUpdate: (data: Partial<ProposalSection>) => void;
  onDelete: () => void;
  isPreview?: boolean;
}

const ProposalBuilderSection: React.FC<ProposalBuilderSectionProps> = ({
  section,
  dragHandleProps,
  onUpdate,
  onDelete,
  isPreview = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [title, setTitle] = useState(section.title);
  const [content, setContent] = useState(section.content);

  const handleSave = () => {
    onUpdate({ title, content });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(section.title);
    setContent(section.content);
    setIsEditing(false);
  };

  // Preview mode just renders the content
  if (isPreview) {
    return (
      <Card className="mb-4">
        <CardHeader className="py-3">
          <CardTitle className="text-xl">{section.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div dangerouslySetInnerHTML={{ __html: section.content }} />
          
          {section.attachments && section.attachments.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-sm font-medium mb-2">Attachments</h3>
              <div className="flex flex-wrap gap-2">
                {section.attachments.map(attachment => (
                  <div 
                    key={attachment.id}
                    className="flex items-center bg-muted p-2 rounded-md text-sm"
                  >
                    {attachment.type === 'image' && <Image className="h-4 w-4 mr-2 text-blue-500" />}
                    {attachment.type === 'video' && <Video className="h-4 w-4 mr-2 text-purple-500" />}
                    {attachment.type === 'pdf' && <FileText className="h-4 w-4 mr-2 text-red-500" />}
                    {attachment.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b">
        <div className="flex items-center flex-1">
          <div {...dragHandleProps} className="cursor-move mr-2">
            <Grip className="h-5 w-5 text-muted-foreground" />
          </div>
          {isEditing ? (
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="h-8 py-1"
            />
          ) : (
            <CardTitle className="text-base flex-1">{section.title}</CardTitle>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!isEditing && (
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="p-4">
          {isEditing ? (
            <>
              <RichTextEditor 
                initialValue={content}
                onChange={setContent}
                className="min-h-[150px] border rounded-md p-2"
              />
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ProposalBuilderSection;
