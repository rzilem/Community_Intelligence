
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useOnboardingTemplateCreator } from '@/hooks/onboarding/useOnboardingTemplateCreator';
import { Loader2 } from 'lucide-react';

const HOAOnboardingTemplateCreator: React.FC = () => {
  const [templateName, setTemplateName] = useState('Complete HOA Onboarding');
  const [templateDescription, setTemplateDescription] = useState('Comprehensive 60-day onboarding template for new HOA communities');
  const { createHOAOnboardingTemplate, isCreating } = useOnboardingTemplateCreator();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) return;
    createHOAOnboardingTemplate(templateName, templateDescription);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create HOA Onboarding Template</CardTitle>
        <CardDescription>
          This will create a complete 60-day onboarding template with all stages and tasks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Enter template name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Enter template description"
              rows={3}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Creates all 6 stages with 53 tasks
        </div>
        <Button onClick={handleSubmit} disabled={isCreating}>
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Template'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default HOAOnboardingTemplateCreator;
