
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles, Image } from 'lucide-react';
import { useAITemplateGenerator } from '@/hooks/communications/useAITemplateGenerator';
import MultilingualOptions from '../MultilingualOptions';

interface MessageContentProps {
  content: string;
  setContent: (content: string) => void;
}

const MessageContent: React.FC<MessageContentProps> = ({ content, setContent }) => {
  const [activeTab, setActiveTab] = React.useState('compose');
  const { generateTemplate, isGenerating } = useAITemplateGenerator();
  const [subject, setSubject] = React.useState('');

  const handleAIGenerate = async () => {
    const prompt = "Generate a community announcement about upcoming pool maintenance work";
    const result = await generateTemplate(prompt, 'email');
    
    if (result) {
      setContent(result);
    }
  };

  const handleTranslated = (translatedSubject: string, translatedContent: string) => {
    setContent(translatedContent);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
            <TabsList>
              <TabsTrigger value="compose">Compose</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Image className="h-4 w-4 mr-2" /> 
              Add Image
            </Button>
            
            <Button onClick={handleAIGenerate} variant="outline" size="sm" disabled={isGenerating}>
              <Sparkles className="h-4 w-4 mr-2" /> 
              AI Generate
            </Button>
            
            <MultilingualOptions
              subject={subject}
              content={content}
              onTranslated={handleTranslated}
            />
          </div>
        </div>
        
        <TabsContent value="compose" className="mt-0">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message content here..."
            className="min-h-[200px] font-normal"
          />
        </TabsContent>
        
        <TabsContent value="html" className="mt-0">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter HTML content here..."
            className="min-h-[200px] font-mono text-sm"
          />
        </TabsContent>
      </CardContent>
    </Card>
  );
};

export default MessageContent;
