
import React from 'react';
import { Save, Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight, Link, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LetterTemplate, LetterTemplateCategory } from '@/types/letter-template-types';

interface LetterTemplateEditorProps {
  template?: LetterTemplate;
  onSave: (template: Partial<LetterTemplate>) => void;
}

const LetterTemplateEditor: React.FC<LetterTemplateEditorProps> = ({
  template,
  onSave
}) => {
  const [formData, setFormData] = React.useState<Partial<LetterTemplate>>(
    template || {
      name: '',
      description: '',
      category: 'General',
      content: ''
    }
  );
  
  const handleChange = (field: keyof LetterTemplate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const categories: LetterTemplateCategory[] = [
    'General', 'Compliance', 'Delinquency', 'Architectural', 'Meeting', 'Welcome', 'Other'
  ];
  
  const handleSave = () => {
    onSave(formData);
  };

  const insertMergeTag = () => {
    // This would insert a merge tag at the cursor position
    // For now, just append a sample merge tag to the content
    handleChange('content', (formData.content || '') + ' {first_name} ');
  };
  
  return (
    <div className="space-y-6 p-4 border rounded-md">
      <div>
        <h2 className="text-lg font-medium">Create New Template</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Template Name</label>
          <Input
            placeholder="Enter template name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea
            placeholder="Brief description of the template"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium">Letter Content</label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={insertMergeTag}
            >
              Insert Merge Tag
            </Button>
          </div>
          
          <Tabs defaultValue="visual">
            <TabsList>
              <TabsTrigger value="visual">Visual</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
            </TabsList>
            
            <TabsContent value="visual" className="border rounded-md mt-2">
              <div className="p-1 border-b flex gap-1">
                <Button variant="ghost" size="icon">
                  <Bold className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Italic className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Underline className="h-4 w-4" />
                </Button>
                <div className="border-r mx-1" />
                <Button variant="ghost" size="icon">
                  <List className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <div className="border-r mx-1" />
                <Button variant="ghost" size="icon">
                  <Heading1 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Heading2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Heading3 className="h-4 w-4" />
                </Button>
                <div className="border-r mx-1" />
                <Button variant="ghost" size="icon">
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <AlignRight className="h-4 w-4" />
                </Button>
                <div className="border-r mx-1" />
                <Button variant="ghost" size="icon">
                  <Link className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Image className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                className="min-h-[300px] border-0"
              />
            </TabsContent>
            
            <TabsContent value="html">
              <Textarea
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  );
};

export default LetterTemplateEditor;
