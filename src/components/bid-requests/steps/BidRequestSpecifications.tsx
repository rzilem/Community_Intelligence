
import React, { useState } from 'react';
import { BidRequestWithVendors } from '@/types/bid-request-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FormFieldTextarea from '@/components/homeowners/form/FormFieldTextarea';
import FormFieldInput from '@/components/homeowners/form/FormFieldInput';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Save, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BidRequestSpecificationsProps {
  formData: Partial<BidRequestWithVendors>;
  onUpdate: (data: Partial<BidRequestWithVendors>) => void;
}

interface SpecificationsFormData {
  projectGoals: string;
  materialRequirements: string;
  timelineExpectations: string;
  specialNotes: string;
  dueDate: string;
}

const BidRequestSpecifications: React.FC<BidRequestSpecificationsProps> = ({ 
  formData, 
  onUpdate 
}) => {
  const [customQuestions, setCustomQuestions] = useState<{ id: string; question: string }[]>(
    formData.specifications?.customQuestions || []
  );
  const [newQuestion, setNewQuestion] = useState('');

  const form = useForm<SpecificationsFormData>({
    defaultValues: {
      projectGoals: formData.specifications?.projectGoals || '',
      materialRequirements: formData.specifications?.materialRequirements || '',
      timelineExpectations: formData.specifications?.timelineExpectations || '',
      specialNotes: formData.specifications?.specialNotes || '',
      dueDate: formData.dueDate || '',
    }
  });

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      const updatedQuestions = [
        ...customQuestions,
        { id: `q-${Date.now()}`, question: newQuestion }
      ];
      setCustomQuestions(updatedQuestions);
      setNewQuestion('');
      
      // Update the parent component
      onUpdate({
        specifications: {
          ...formData.specifications,
          customQuestions: updatedQuestions
        }
      });
    }
  };

  const handleRemoveQuestion = (id: string) => {
    const updatedQuestions = customQuestions.filter(q => q.id !== id);
    setCustomQuestions(updatedQuestions);
    
    // Update the parent component
    onUpdate({
      specifications: {
        ...formData.specifications,
        customQuestions: updatedQuestions
      }
    });
  };

  // Auto-save as the user types
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      const { dueDate, ...specFields } = value;
      
      onUpdate({
        dueDate: dueDate || undefined,
        specifications: {
          ...formData.specifications,
          ...specFields
        }
      });
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);

  return (
    <Form {...form}>
      <form className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Specifications</CardTitle>
            <CardDescription>
              Provide detailed specifications to help vendors understand exactly what you need.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormFieldTextarea
              form={form}
              name="projectGoals"
              label="Project Goals"
              placeholder="What are the main objectives of this project?"
              rows={3}
            />
            
            <FormFieldTextarea
              form={form}
              name="materialRequirements"
              label="Material Requirements"
              placeholder="Specify any material requirements or preferences"
              rows={3}
            />
            
            <FormFieldTextarea
              form={form}
              name="timelineExpectations"
              label="Timeline Expectations"
              placeholder="What is your expected timeline for completion?"
              rows={2}
            />
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Bid Due Date</Label>
              <div className="flex">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dueDate"
                    type="date"
                    className="pl-10"
                    {...form.register('dueDate')}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                The date by which vendors should submit their proposals
              </p>
            </div>
            
            <FormFieldTextarea
              form={form}
              name="specialNotes"
              label="Special Instructions or Notes"
              placeholder="Any additional information vendors should know"
              rows={3}
            />
            
            <div className="space-y-3 pt-2">
              <div>
                <Label>Custom Questions for Vendors</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Add specific questions that vendors must answer in their proposals
                </p>
              </div>
              
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter a question..." 
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  onClick={handleAddQuestion}
                  disabled={!newQuestion.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              
              {customQuestions.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {customQuestions.map((q) => (
                    <div key={q.id} className="flex items-center gap-2 p-2 border rounded-md">
                      <div className="flex-1">{q.question}</div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveQuestion(q.id)}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic pt-2">
                  No custom questions added yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};

export default BidRequestSpecifications;
