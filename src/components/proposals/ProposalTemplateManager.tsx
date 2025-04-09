
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  FileText, 
  FolderPlus, 
  Image, 
  Video, 
  File, 
  FileType, 
  ChevronDown,
  ChevronRight,
  Share,
  Save,
  Plus,
  Folder
} from 'lucide-react';
import { useProposalTemplates } from '@/hooks/proposals/useProposalTemplates';
import { ProposalTemplate, ProposalAttachment, ProposalFolder } from '@/types/proposal-types';
import { toast } from 'sonner';

const demoFolders: ProposalFolder[] = [
  { id: '1', name: 'Welcome to PS Property Management Company', parent_id: undefined, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', name: 'Experienced Management Team', parent_id: undefined, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', name: 'PS Property Management', parent_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', name: 'The Grove at Bull Creek HOA', parent_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '5', name: 'Welcome Board Of Directors', parent_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const demoAttachments: ProposalAttachment[] = [
  { id: '1', name: 'Community Pride Flyer', type: 'pdf', url: '/assets/documents/flyer.pdf', content_type: 'application/pdf', created_at: new Date().toISOString() },
  { id: '2', name: 'Management Services', type: 'pdf', url: '/assets/documents/services.pdf', content_type: 'application/pdf', created_at: new Date().toISOString() },
  { id: '3', name: 'Property Tour', type: 'video', url: '/assets/videos/tour.mp4', content_type: 'video/mp4', created_at: new Date().toISOString() },
  { id: '4', name: 'Welcome Presentation', type: 'document', url: '/assets/documents/welcome.docx', content_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', created_at: new Date().toISOString() },
  { id: '5', name: 'PS Accounting Difference', type: 'pdf', url: '/assets/documents/accounting.pdf', content_type: 'application/pdf', created_at: new Date().toISOString() },
  { id: '6', name: 'Community HOA Assessment Collection', type: 'pdf', url: '/assets/documents/assessment.pdf', content_type: 'application/pdf', created_at: new Date().toISOString() },
];

interface FolderItemProps {
  folder: ProposalFolder;
  allFolders: ProposalFolder[];
  allAttachments: ProposalAttachment[];
  onSelectAttachment: (attachment: ProposalAttachment) => void;
}

const FolderItem: React.FC<FolderItemProps> = ({ folder, allFolders, allAttachments, onSelectAttachment }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get child folders for this folder
  const childFolders = allFolders.filter(f => f.parent_id === folder.id);
  
  // Get attachments for this folder (in a real app, attachments would have folder_id)
  const folderAttachments = folder.id === '1' ? allAttachments.slice(0, 2) : 
                          folder.id === '2' ? allAttachments.slice(2, 6) : [];
  
  const hasChildren = childFolders.length > 0 || folderAttachments.length > 0;
  
  const getAttachmentIcon = (type: string) => {
    switch(type) {
      case 'pdf': return <FileText className="h-4 w-4 mr-2 text-red-500" />;
      case 'image': return <Image className="h-4 w-4 mr-2 text-blue-500" />;
      case 'video': return <Video className="h-4 w-4 mr-2 text-purple-500" />;
      case 'document': return <FileType className="h-4 w-4 mr-2 text-orange-500" />;
      default: return <File className="h-4 w-4 mr-2 text-gray-500" />;
    }
  };

  return (
    <div className="ml-1">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center p-1 hover:bg-gray-100 rounded-md w-full text-left">
          {hasChildren ? (
            isOpen ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />
          ) : (
            <span className="w-5" />
          )}
          <Folder className="h-4 w-4 mr-2 text-yellow-500" />
          <span className="text-sm">{folder.name}</span>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="pl-4 border-l-2 border-gray-100 ml-2 mt-1">
            {/* Render child folders recursively */}
            {childFolders.map(childFolder => (
              <FolderItem 
                key={childFolder.id}
                folder={childFolder}
                allFolders={allFolders}
                allAttachments={allAttachments}
                onSelectAttachment={onSelectAttachment}
              />
            ))}
            
            {/* Render attachments */}
            {folderAttachments.map(attachment => (
              <div 
                key={attachment.id} 
                className="flex items-center p-1 hover:bg-gray-100 rounded-md cursor-pointer ml-1 text-sm"
                onClick={() => onSelectAttachment(attachment)}
              >
                {getAttachmentIcon(attachment.type)}
                <span>{attachment.name}</span>
                {attachment.type === 'pdf' && <span className="text-xs text-gray-500 ml-1">(1 page)</span>}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

const ProposalTemplateManager: React.FC = () => {
  const { templates, createTemplate } = useProposalTemplates();
  const [activeTab, setActiveTab] = useState("content");
  const [templateName, setTemplateName] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [selectedAttachment, setSelectedAttachment] = useState<ProposalAttachment | null>(null);

  const handleSaveTemplate = async () => {
    if (!templateName || !templateContent) {
      toast.error("Please provide a name and content for your template");
      return;
    }

    try {
      await createTemplate({
        name: templateName,
        content: templateContent,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      toast.success("Template created successfully");
      setTemplateName("");
      setTemplateContent("");
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to create template");
    }
  };

  const handleShareTemplate = () => {
    toast.success("Sharing options will be available soon");
  };

  const handleSelectAttachment = (attachment: ProposalAttachment) => {
    setSelectedAttachment(attachment);
    
    // In a real implementation, you would update the template content or add the attachment
    toast.success(`Selected ${attachment.name}`);
    
    // For demo purposes, let's add a placeholder in the content
    const placeholder = `[${attachment.name} - ${attachment.type.toUpperCase()}]`;
    setTemplateContent(prev => prev + '\n\n' + placeholder);
  };

  const renderAttachmentPreview = () => {
    if (!selectedAttachment) return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Select an attachment to preview</p>
        </div>
      </div>
    );

    switch (selectedAttachment.type) {
      case 'pdf':
        return (
          <div className="bg-red-50 p-4 rounded-lg flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-red-500" />
              <p className="mt-2 font-medium">{selectedAttachment.name}</p>
              <p className="text-sm text-gray-500">PDF Document</p>
              <Button variant="outline" size="sm" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Insert into proposal
              </Button>
            </div>
          </div>
        );
      case 'video':
        return (
          <div className="rounded-lg border overflow-hidden">
            <div className="relative bg-black aspect-video">
              <div className="absolute inset-0 flex items-center justify-center">
                <Button variant="outline" className="bg-black/50 text-white border-white">
                  <Video className="h-8 w-8" />
                </Button>
              </div>
              <img 
                src="/lovable-uploads/a170c61c-25b9-4ed9-b92e-749c91d85cbc.png" 
                alt="Video thumbnail" 
                className="w-full h-full object-cover opacity-50"
              />
            </div>
            <div className="p-2 flex justify-between items-center bg-gray-100">
              <span className="text-sm font-medium">{selectedAttachment.name}</span>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-center h-64">
            <div className="text-center">
              <File className="mx-auto h-12 w-12 text-blue-500" />
              <p className="mt-2 font-medium">{selectedAttachment.name}</p>
              <p className="text-sm text-gray-500">{selectedAttachment.type.toUpperCase()}</p>
              <Button variant="outline" size="sm" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Insert into proposal
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex flex-row h-[calc(100vh-220px)] min-h-[500px]">
        {/* Left sidebar - Navigation */}
        <div className="w-64 border-r bg-gray-50 overflow-y-auto p-2">
          <div className="flex items-center justify-between p-2 mb-2">
            <h3 className="font-medium text-sm">Template Assets</h3>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <FolderPlus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1">
            {demoFolders
              .filter(folder => !folder.parent_id) // Only top-level folders
              .map(folder => (
                <FolderItem 
                  key={folder.id} 
                  folder={folder} 
                  allFolders={demoFolders}
                  allAttachments={demoAttachments}
                  onSelectAttachment={handleSelectAttachment}
                />
            ))}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b p-4">
            <div className="flex justify-between items-center mb-4">
              <Input 
                placeholder="Template Name" 
                className="max-w-md"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
              <div className="space-x-2">
                <Button variant="outline" onClick={handleShareTemplate}>
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button onClick={handleSaveTemplate}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Template
                </Button>
              </div>
            </div>
            
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            <TabsContent value="content" className="flex gap-4 h-full mt-0">
              <div className="flex-1">
                <Textarea 
                  placeholder="Enter your proposal content here..."
                  className="h-full min-h-[400px] resize-none"
                  value={templateContent}
                  onChange={(e) => setTemplateContent(e.target.value)}
                />
              </div>
              <div className="w-1/3">
                {renderAttachmentPreview()}
              </div>
            </TabsContent>
            
            <TabsContent value="design" className="mt-0">
              <div className="border rounded-lg p-6 text-center">
                <div className="mb-4">
                  <FileText className="h-10 w-10 mx-auto text-gray-400" />
                </div>
                <h3 className="text-lg font-medium">Template Design</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Design controls for the template will be available here.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="mt-0">
              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">{templateName || "Untitled Template"}</h2>
                <div className="prose max-w-none">
                  {templateContent ? (
                    <div dangerouslySetInnerHTML={{ __html: templateContent.replace(/\n/g, '<br>') }} />
                  ) : (
                    <p className="text-gray-500">No content available for preview.</p>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="mt-0">
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Template Settings</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium block mb-1">Category</label>
                      <Input placeholder="Select category" />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Access</label>
                      <Input placeholder="Private" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalTemplateManager;
