
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  FileText, 
  Image, 
  Video, 
  PanelLeft, 
  Layers, 
  Save, 
  ArrowRight, 
  Plus, 
  Trash2 
} from 'lucide-react';
import ProposalBuilderSection from './ProposalBuilderSection';
import ProposalSectionLibrary from './ProposalSectionLibrary';
import { ProposalSection } from '@/types/proposal-types';
import { useToast } from '@/components/ui/use-toast';

interface ProposalBuilderProps {
  initialContent?: string;
  onSave: (content: string, sections: ProposalSection[]) => void;
  proposalId?: string;
}

const ProposalBuilder: React.FC<ProposalBuilderProps> = ({ 
  initialContent = '', 
  onSave,
  proposalId
}) => {
  const { toast } = useToast();
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState('sections');
  const [sections, setSections] = useState<ProposalSection[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    // If there's initial content, try to parse sections from it
    if (initialContent && initialContent.trim() !== '') {
      try {
        // This is a simplified approach. In a real implementation,
        // you would need a more sophisticated parser.
        const parser = new DOMParser();
        const doc = parser.parseFromString(initialContent, 'text/html');
        const sectionElements = doc.querySelectorAll('section[data-section-id]');
        
        const parsedSections: ProposalSection[] = Array.from(sectionElements).map((el, index) => {
          const id = el.getAttribute('data-section-id') || `section-${Date.now()}-${index}`;
          const title = el.querySelector('h2')?.textContent || 'Untitled Section';
          const content = el.innerHTML;
          
          return {
            id,
            title,
            content,
            order: index,
            attachments: []
          };
        });
        
        if (parsedSections.length > 0) {
          setSections(parsedSections);
        } else {
          // If no sections could be parsed, create a default one
          setSections([{
            id: `section-${Date.now()}`,
            title: 'Introduction',
            content: '<p>Enter your proposal content here...</p>',
            order: 0,
            attachments: []
          }]);
        }
      } catch (error) {
        console.error('Error parsing initial content:', error);
        // Set default section if parsing fails
        setSections([{
          id: `section-${Date.now()}`,
          title: 'Introduction',
          content: '<p>Enter your proposal content here...</p>',
          order: 0,
          attachments: []
        }]);
      }
    } else {
      // If no initial content, set up a default section
      setSections([{
        id: `section-${Date.now()}`,
        title: 'Introduction',
        content: '<p>Enter your proposal content here...</p>',
        order: 0,
        attachments: []
      }]);
    }
  }, [initialContent]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update order property
    const reorderedSections = items.map((item, index) => ({
      ...item,
      order: index
    }));
    
    setSections(reorderedSections);
  };

  const handleAddSection = (template?: ProposalSection) => {
    const newSection: ProposalSection = template ? {
      ...template,
      id: `section-${Date.now()}`,
      order: sections.length
    } : {
      id: `section-${Date.now()}`,
      title: `New Section`,
      content: '<p>Enter content here...</p>',
      order: sections.length,
      attachments: []
    };
    
    setSections([...sections, newSection]);
    toast({
      title: "Section added",
      description: `"${newSection.title}" has been added to your proposal.`
    });
  };

  const handleUpdateSection = (id: string, updatedData: Partial<ProposalSection>) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, ...updatedData } : section
    ));
  };

  const handleDeleteSection = (id: string) => {
    setSections(sections.filter(section => section.id !== id));
    toast({
      title: "Section removed",
      description: "The section has been removed from your proposal."
    });
  };

  const handleSave = () => {
    // Combine all sections into a single HTML string
    const combinedContent = sections
      .sort((a, b) => a.order - b.order)
      .map(section => 
        `<section data-section-id="${section.id}" class="proposal-section">
          <h2>${section.title}</h2>
          ${section.content}
        </section>`
      )
      .join('\n\n');
    
    onSave(combinedContent, sections);
  };

  return (
    <div className="flex h-full border rounded-md">
      {/* Left sidebar with sections library */}
      {showSidebar && (
        <div className="w-64 border-r bg-muted/20 p-4 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="sections" className="flex-1">Sections</TabsTrigger>
              <TabsTrigger value="media" className="flex-1">Media</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sections" className="mt-2">
              <ProposalSectionLibrary onAddSection={handleAddSection} />
            </TabsContent>
            
            <TabsContent value="media" className="mt-2">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Attachments</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Card className="cursor-pointer hover:bg-accent/10">
                    <CardContent className="p-3 text-center">
                      <Image className="h-8 w-8 mx-auto mb-1 text-blue-500" />
                      <p className="text-xs">Images</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:bg-accent/10">
                    <CardContent className="p-3 text-center">
                      <FileText className="h-8 w-8 mx-auto mb-1 text-red-500" />
                      <p className="text-xs">Documents</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:bg-accent/10">
                    <CardContent className="p-3 text-center">
                      <Video className="h-8 w-8 mx-auto mb-1 text-purple-500" />
                      <p className="text-xs">Videos</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b p-2 flex items-center justify-between bg-background">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSidebar(!showSidebar)}
              className="mr-2"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className="mr-2"
            >
              {previewMode ? 'Edit Mode' : 'Preview'}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="default" 
              size="sm"
              onClick={handleSave}
              className="flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Next Step
            </Button>
          </div>
        </div>
        
        {/* Sections area */}
        <div className="flex-1 overflow-y-auto p-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="proposal-sections">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {sections.map((section, index) => (
                    <Draggable 
                      key={section.id} 
                      draggableId={section.id} 
                      index={index}
                      isDragDisabled={previewMode}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <ProposalBuilderSection
                            section={section}
                            dragHandleProps={provided.dragHandleProps}
                            onUpdate={(data) => handleUpdateSection(section.id, data)}
                            onDelete={() => handleDeleteSection(section.id)}
                            isPreview={previewMode}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  
                  {!previewMode && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-4 border-dashed" 
                      onClick={() => handleAddSection()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Section
                    </Button>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
};

export default ProposalBuilder;
