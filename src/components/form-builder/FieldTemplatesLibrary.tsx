import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FilePlus } from 'lucide-react';
import { FormField } from '@/types/form-builder-types';

// Pre-built field templates
const fieldTemplates: Record<string, FormField[]> = {
  contact: [
    {
      id: 'full-name',
      type: 'text',
      label: 'Full Name',
      placeholder: 'John Doe',
      required: true,
      validation: {
        minLength: 2,
        maxLength: 100
      }
    },
    {
      id: 'email',
      type: 'email',
      label: 'Email Address',
      placeholder: 'john.doe@example.com',
      required: true,
      validation: {
        pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$'
      }
    },
    {
      id: 'phone',
      type: 'phone',
      label: 'Phone Number',
      placeholder: '(123) 456-7890',
      required: false
    }
  ],
  address: [
    {
      id: 'street-address',
      type: 'text',
      label: 'Street Address',
      placeholder: '123 Main St',
      required: true
    },
    {
      id: 'city',
      type: 'text',
      label: 'City',
      placeholder: 'Anytown',
      required: true
    },
    {
      id: 'state',
      type: 'select',
      label: 'State',
      required: true,
      options: [
        { label: 'Alabama', value: 'AL' },
        { label: 'Alaska', value: 'AK' },
        { label: 'Arizona', value: 'AZ' },
        // Other states would be included
        { label: 'Wyoming', value: 'WY' }
      ]
    },
    {
      id: 'zip',
      type: 'text',
      label: 'ZIP Code',
      placeholder: '12345',
      required: true,
      validation: {
        pattern: '^\\d{5}(-\\d{4})?$'
      }
    }
  ],
  assessments: [
    {
      id: 'assessment-type',
      type: 'select',
      label: 'Assessment Type',
      required: true,
      options: [
        { label: 'Monthly HOA Dues', value: 'monthly-dues' },
        { label: 'Special Assessment', value: 'special' },
        { label: 'Late Fee', value: 'late-fee' },
        { label: 'Violation Fine', value: 'violation' }
      ]
    },
    {
      id: 'amount',
      type: 'number',
      label: 'Amount ($)',
      placeholder: '0.00',
      required: true,
      validation: {
        min: 0
      }
    },
    {
      id: 'due-date',
      type: 'date',
      label: 'Due Date',
      required: true
    }
  ],
  compliance: [
    {
      id: 'violation-type',
      type: 'select',
      label: 'Violation Type',
      required: true,
      options: [
        { label: 'Landscaping', value: 'landscaping' },
        { label: 'Architectural', value: 'architectural' },
        { label: 'Parking', value: 'parking' },
        { label: 'Pet', value: 'pet' },
        { label: 'Noise', value: 'noise' },
        { label: 'Trash', value: 'trash' }
      ]
    },
    {
      id: 'violation-description',
      type: 'textarea',
      label: 'Violation Description',
      placeholder: 'Please describe the violation in detail',
      required: true
    },
    {
      id: 'resolution-date',
      type: 'date',
      label: 'Resolution Deadline',
      required: true
    }
  ],
  maintenance: [
    {
      id: 'maintenance-type',
      type: 'select',
      label: 'Maintenance Type',
      required: true,
      options: [
        { label: 'Plumbing', value: 'plumbing' },
        { label: 'Electrical', value: 'electrical' },
        { label: 'HVAC', value: 'hvac' },
        { label: 'Structural', value: 'structural' },
        { label: 'Landscaping', value: 'landscaping' }
      ]
    },
    {
      id: 'priority',
      type: 'radio',
      label: 'Priority',
      required: true,
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Emergency', value: 'emergency' }
      ]
    },
    {
      id: 'description',
      type: 'textarea',
      label: 'Issue Description',
      placeholder: 'Please describe the issue in detail',
      required: true
    },
    {
      id: 'photo',
      type: 'file',
      label: 'Upload Photos',
      required: false
    }
  ]
};

interface FieldTemplatesLibraryProps {
  onAddField: (field: FormField) => void;
  onAddTemplate: (fields: FormField[]) => void;
}

const FieldTemplatesLibrary: React.FC<FieldTemplatesLibraryProps> = ({ onAddField, onAddTemplate }) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('contact');
  
  const categories = Object.keys(fieldTemplates);
  
  const handleAddField = (field: FormField) => {
    // Create a new ID to avoid duplication
    const newField = {
      ...field,
      id: `${field.id}-${Date.now()}`
    };
    onAddField(newField);
    setOpen(false);
  };
  
  const handleAddTemplate = (template: FormField[]) => {
    // Create new IDs for all fields in the template
    const fieldsWithNewIds = template.map(field => ({
      ...field,
      id: `${field.id}-${Date.now()}`
    }));
    onAddTemplate(fieldsWithNewIds);
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FilePlus className="mr-2 h-4 w-4" />
          Field Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Field Templates Library</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-5 mb-4">
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map(category => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="flex justify-end">
                <Button 
                  size="sm" 
                  onClick={() => handleAddTemplate(fieldTemplates[category])}
                >
                  Add All Fields
                </Button>
              </div>
              
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {fieldTemplates[category].map(field => (
                    <Card key={field.id} className="shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{field.label}</CardTitle>
                        <CardDescription>
                          Type: {field.type} {field.required && "(Required)"}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleAddField(field)}
                        >
                          Add to Form
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FieldTemplatesLibrary;
