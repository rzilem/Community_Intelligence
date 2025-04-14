
import React, { useState } from 'react';
import { BidRequestWithVendors } from '@/types/bid-request-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, X, FileText, CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormFieldTextarea } from '@/components/homeowners/form/FormFieldTextarea';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface BidRequestSpecificationsProps {
  formData: Partial<BidRequestWithVendors>;
  onUpdate: (data: Partial<BidRequestWithVendors>) => void;
}

const BidRequestSpecifications: React.FC<BidRequestSpecificationsProps> = ({ 
  formData, 
  onUpdate 
}) => {
  const [customQuestions, setCustomQuestions] = useState<{id: string, question: string}[]>(
    formData.specifications?.customQuestions || []
  );
  const [newQuestion, setNewQuestion] = useState('');
  const [date, setDate] = React.useState<Date | undefined>(
    formData.dueDate ? new Date(formData.dueDate) : undefined
  );

  const form = useForm<Partial<BidRequestWithVendors>>({
    defaultValues: {
      projectGoals: formData.specifications?.projectGoals || '',
      materialRequirements: formData.specifications?.materialRequirements || '',
      timelineExpectations: formData.specifications?.timelineExpectations || '',
      specialNotes: formData.specifications?.specialNotes || '',
    }
  });

  const addCustomQuestion = () => {
    if (!newQuestion.trim()) return;
    
    const updatedQuestions = [
      ...customQuestions,
      { id: Date.now().toString(), question: newQuestion.trim() }
    ];
    
    setCustomQuestions(updatedQuestions);
    setNewQuestion('');
    
    // Update parent component
    onUpdate({
      specifications: {
        ...formData.specifications,
        customQuestions: updatedQuestions
      }
    });
  };

  const removeQuestion = (id: string) => {
    const updatedQuestions = customQuestions.filter(q => q.id !== id);
    setCustomQuestions(updatedQuestions);
    
    // Update parent component
    onUpdate({
      specifications: {
        ...formData.specifications,
        customQuestions: updatedQuestions
      }
    });
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      onUpdate({ dueDate: newDate.toISOString() });
    }
  };

  // Update specifications as the form values change
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      const specs = {
        ...formData.specifications,
        projectGoals: value.projectGoals,
        materialRequirements: value.materialRequirements,
        timelineExpectations: value.timelineExpectations,
        specialNotes: value.specialNotes,
      };
      
      onUpdate({ specifications: specs });
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
              Define the detailed requirements for your project to ensure vendors understand exactly what you need.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormFieldTextarea
              form={form}
              name="projectGoals"
              label="Project Goals & Objectives"
              placeholder="Describe what you want to achieve with this project"
              description="Clearly state the desired outcomes and objectives of the project."
              rows={3}
            />
            
            <FormFieldTextarea
              form={form}
              name="materialRequirements"
              label="Material Requirements & Specifications"
              placeholder="Specify any material requirements or quality standards"
              description="Indicate specific materials, brands, or quality standards required."
              rows={3}
            />
            
            <FormFieldTextarea
              form={form}
              name="timelineExpectations"
              label="Timeline Expectations"
              placeholder="Describe your expected timeline for the project"
              description="Specify any important dates, milestones, or completion deadlines."
              rows={3}
            />
            
            <div className="space-y-2">
              <Label>Bid Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Select a due date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-sm text-muted-foreground">
                Set a deadline for vendors to submit their bids.
              </p>
            </div>
            
            <FormFieldTextarea
              form={form}
              name="specialNotes"
              label="Special Instructions & Notes"
              placeholder="Any additional instructions or special considerations"
              description="Include any other details that vendors should be aware of when bidding."
              rows={3}
            />
            
            <div className="space-y-4">
              <div>
                <Label>Custom Questions for Vendors</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Add specific questions you would like vendors to answer in their proposals.
                </p>
                
                <div className="flex gap-2 mb-4">
                  <Input 
                    value={newQuestion} 
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Enter a question for vendors" 
                    className="flex-1"
                  />
                  <Button type="button" onClick={addCustomQuestion}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                
                {customQuestions.length > 0 ? (
                  <div className="space-y-2">
                    {customQuestions.map((q) => (
                      <div key={q.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="flex-1 text-sm">{q.question}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          onClick={() => removeQuestion(q.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No custom questions added yet.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};

export default BidRequestSpecifications;
