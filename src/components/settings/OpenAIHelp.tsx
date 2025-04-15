
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, HelpCircle } from 'lucide-react';

const OpenAIHelp = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>About OpenAI Integration</DialogTitle>
          <DialogDescription>
            Learn how to connect and use OpenAI in Community Intelligence
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <h3 className="text-lg font-medium">What you can do with OpenAI</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Generate AI-assisted insights for financial planning and budgeting</li>
            <li>Create professional communication templates for residents</li>
            <li>Extract information from documents automatically</li>
            <li>Get AI recommendations for maintenance and operations</li>
            <li>Power the AI assistant throughout the platform</li>
          </ul>
          
          <h3 className="text-lg font-medium mt-6">How to get an OpenAI API key</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Go to <a href="https://platform.openai.com/signup" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI's platform</a> and create an account</li>
            <li>Navigate to the <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">API keys section</a></li>
            <li>Click "Create new secret key" and give it a name (e.g., "Community Intelligence")</li>
            <li>Copy the generated key (it will only be shown once)</li>
            <li>Paste the key into the API Key field in the configuration dialog</li>
          </ol>
          
          <h3 className="text-lg font-medium mt-6">Models Available</h3>
          <ul className="space-y-4 mt-2">
            <li className="border p-3 rounded-md">
              <div className="font-medium">GPT-4o Mini</div>
              <div className="text-sm text-muted-foreground">Faster and more cost-effective. Good for most everyday tasks.</div>
            </li>
            <li className="border p-3 rounded-md">
              <div className="font-medium">GPT-4o</div>
              <div className="text-sm text-muted-foreground">More powerful with higher quality outputs. Best for complex analysis and generation.</div>
            </li>
          </ul>
          
          <div className="mt-6 flex justify-end">
            <Button variant="outline" asChild>
              <a href="https://platform.openai.com/docs/guides/gpt" target="_blank" rel="noopener noreferrer">
                OpenAI Documentation
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OpenAIHelp;
