
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Save, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAITemplateGenerator } from '@/hooks/communications/useAITemplateGenerator';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

interface AITemplateCreatorProps {
  onSaveTemplate: (title: string, content: string, type: string) => void;
  disabled?: boolean;
}

const AITemplateCreator: React.FC<AITemplateCreatorProps> = ({ onSaveTemplate, disabled }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('email');
  const [prompt, setPrompt] = useState('');
  const [formality, setFormality] = useState('neutral');
  const [length, setLength] = useState([2]); // 1-3 scale: brief, normal, detailed
  
  const { 
    generateTemplate, 
    generatedContent, 
    isGenerating, 
    error 
  } = useAITemplateGenerator();

  const handleGenerate = async () => {
    if (!prompt) return;
    
    const formalityLevel = formality === 'formal' ? 'formal and professional' : 
                          formality === 'casual' ? 'casual and friendly' : 'neutral';
    
    const contentLength = length[0] === 1 ? 'brief and concise' : 
                         length[0] === 3 ? 'detailed and comprehensive' : 'moderate length';
    
    const fullPrompt = `Create a ${type} template for ${prompt}. The tone should be ${formalityLevel} and the content should be ${contentLength}.`;
    
    await generateTemplate(fullPrompt, type);
  };

  const handleSave = () => {
    if (title && generatedContent) {
      onSaveTemplate(title, generatedContent, type);
      setOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setTitle('');
    setType('email');
    setPrompt('');
    setFormality('neutral');
    setLength([2]);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          className="flex items-center gap-2" 
          disabled={disabled}
        >
          <Sparkles className="h-4 w-4" />
          AI Template Creator
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create AI-Powered Communication Template</DialogTitle>
          <DialogDescription>
            Describe the communication you need, and our AI will generate a template for you.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-type">Template Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="template-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="prompt">Describe what you need</Label>
              <Textarea
                id="prompt"
                placeholder="Example: Welcome email for new HOA residents that introduces the community and provides important contact information"
                rows={6}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Formality</Label>
                  <div className="flex items-center justify-between mt-2">
                    <Select value={formality} onValueChange={setFormality}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select formality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between">
                    <Label>Content Length</Label>
                    <span className="text-xs text-muted-foreground">
                      {length[0] === 1 ? 'Brief' : length[0] === 2 ? 'Normal' : 'Detailed'}
                    </span>
                  </div>
                  <Slider
                    value={length}
                    min={1}
                    max={3}
                    step={1}
                    onValueChange={setLength}
                    className="mt-2"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">Brief</span>
                    <span className="text-xs text-muted-foreground">Detailed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Button 
              onClick={handleGenerate} 
              disabled={!prompt || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Template
                </>
              )}
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Template Title</Label>
              <Input
                id="title"
                placeholder="Enter a title for this template"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="generated-content">Generated Content</Label>
              <Textarea
                id="generated-content"
                placeholder="AI-generated content will appear here"
                rows={15}
                value={generatedContent}
                onChange={(e) => {/* Allow user to edit */}}
                className="h-[calc(100%-80px)]"
              />
              {error && (
                <p className="text-destructive text-sm mt-1">{error}</p>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!title || !generatedContent}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AITemplateCreator;
