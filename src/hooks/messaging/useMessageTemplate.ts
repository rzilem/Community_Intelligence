
import { useState } from 'react';
import { MessageTemplateData } from '@/types/messaging-types';
import { useAITemplateGenerator } from '@/hooks/communications/useAITemplateGenerator';
import { toast } from 'sonner';

export interface UseMessageTemplateOptions {
  onTemplateSelect?: (template: MessageTemplateData) => void;
}

export interface UseMessageTemplateReturn {
  templates: MessageTemplateData[];
  selectedTemplate: MessageTemplateData | null;
  isLoading: boolean;
  isGenerating: boolean;
  selectTemplate: (templateId: string) => void;
  generateTemplate: (prompt: string, type: string) => Promise<string | null>;
  searchTemplates: (searchText: string) => MessageTemplateData[];
}

/**
 * Hook for managing message templates
 */
export function useMessageTemplate({ onTemplateSelect }: UseMessageTemplateOptions = {}): UseMessageTemplateReturn {
  const [templates, setTemplates] = useState<MessageTemplateData[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplateData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    generateTemplate: generateWithAI, 
    isGenerating 
  } = useAITemplateGenerator();
  
  // Select a template by ID
  const selectTemplate = (templateId: string) => {
    setIsLoading(true);
    try {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
        onTemplateSelect?.(template);
      } else {
        toast.error('Template not found');
      }
    } catch (error) {
      console.error('Error selecting template:', error);
      toast.error('Error selecting template');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate a template with AI
  const generateTemplate = async (prompt: string, type: string): Promise<string | null> => {
    try {
      const generatedContent = await generateWithAI(prompt, type);
      return generatedContent;
    } catch (error) {
      console.error('Error generating template:', error);
      toast.error('Failed to generate template');
      return null;
    }
  };
  
  // Search templates by text
  const searchTemplates = (searchText: string): MessageTemplateData[] => {
    if (!searchText) return templates;
    
    const lowerSearch = searchText.toLowerCase();
    return templates.filter(template => 
      template.title.toLowerCase().includes(lowerSearch) || 
      template.description.toLowerCase().includes(lowerSearch)
    );
  };
  
  return {
    templates,
    selectedTemplate,
    isLoading,
    isGenerating,
    selectTemplate,
    generateTemplate,
    searchTemplates
  };
}
