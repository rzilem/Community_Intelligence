
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Save } from 'lucide-react';
import { useAITemplateGenerator } from '@/hooks/communications/useAITemplateGenerator';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

interface AITemplateGeneratorProps {
  onSave: (template: { title: string; content: string; type: string }) => void;
}

const AITemplateGenerator: React.FC<AITemplateGeneratorProps> = ({ onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [formality, setFormality] = useState('neutral');
  const [length, setLength] = useState([2]); // 1-3 scale: brief, normal, detailed
  
  const { generateTemplate, isGenerating, error } = useAITemplateGenerator();

  const handleGenerate = async () => {
    if (!prompt) return;
    
    const formalityLevel = formality === 'formal' ? 'formal and professional' : 
                          formality === 'casual' ? 'casual and friendly' : 'neutral';
    
    const contentLength = length[0] === 1 ? 'brief and concise' : 
                         length[0] === 3 ? 'detailed and comprehensive' : 'moderate length';
    
    const fullPrompt = `Create a message template with the following requirements: ${prompt}. The tone should be ${formalityLevel} and the content should be ${contentLength}.`;
    
    const generatedContent = await generateTemplate(fullPrompt, 'email');
    if (generatedContent) {
      // Populate the preview area
    }
  };

  const handleSave = () => {
    if (title && generatedContent) {
      onSave({
        title,
        content: generatedContent,
        type: 'email'
      });
    }
  };

  return (
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
        <Label htmlFor="prompt">Describe what you need</Label>
        <Textarea
          id="prompt"
          placeholder="Example: Welcome email for new HOA residents that introduces the community and provides important contact information"
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>
      
      <Card className="p-4 space-y-4">
        <div>
          <Label>Formality</Label>
          <div className="flex justify-between mt-2">
            <Button 
              variant={formality === 'casual' ? 'default' : 'outline'}
              onClick={() => setFormality('casual')}
              size="sm"
            >
              Casual
            </Button>
            <Button 
              variant={formality === 'neutral' ? 'default' : 'outline'}
              onClick={() => setFormality('neutral')}
              size="sm"
            >
              Neutral
            </Button>
            <Button 
              variant={formality === 'formal' ? 'default' : 'outline'}
              onClick={() => setFormality('formal')}
              size="sm"
            >
              Formal
            </Button>
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
      </Card>
      
      <div className="flex gap-2">
        <Button 
          onClick={handleGenerate} 
          disabled={!prompt || isGenerating}
          className="flex-1"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {isGenerating ? 'Generating...' : 'Generate Template'}
        </Button>
        
        <Button 
          onClick={handleSave} 
          disabled={!title || !generatedContent}
          variant="outline"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Template
        </Button>
      </div>
      
      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}
    </div>
  );
};

export default AITemplateGenerator;
