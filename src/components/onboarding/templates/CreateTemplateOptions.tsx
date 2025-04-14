
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import HOAOnboardingTemplateCreator from '../HOAOnboardingTemplateCreator';

interface CreateTemplateOptionsProps {
  onCreateBasic: () => void;
}

const CreateTemplateOptions: React.FC<CreateTemplateOptionsProps> = ({ onCreateBasic }) => {
  return (
    <Tabs defaultValue="basic">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="basic">Basic Template</TabsTrigger>
        <TabsTrigger value="complete">Complete 60-Day Template</TabsTrigger>
      </TabsList>
      
      <TabsContent value="basic" className="pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Create Basic Template</CardTitle>
            <CardDescription>
              Create a simple template structure that you can customize later with your own stages and tasks.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={onCreateBasic}>Create Basic Template</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="complete" className="pt-4">
        <HOAOnboardingTemplateCreator />
      </TabsContent>
    </Tabs>
  );
};

export default CreateTemplateOptions;
