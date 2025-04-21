
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { PlusCircle, Layout } from 'lucide-react';
import { WidgetType } from '@/types/portal-types';
import { useWidgetSettings } from '@/hooks/portal/useWidgetSettings';

const customWidgetSchema = z.object({
  title: z.string().min(3, { message: 'Widget title must be at least 3 characters' }),
  content: z.string().min(10, { message: 'Content must be at least 10 characters' }),
  height: z.number().min(100).max(800).default(200),
  backgroundColor: z.string().default('#ffffff'),
  textColor: z.string().default('#000000')
});

type CustomWidgetFormValues = z.infer<typeof customWidgetSchema>;

interface CustomWidgetBuilderProps {
  portalType: 'user' | 'association';
}

const CustomWidgetBuilder: React.FC<CustomWidgetBuilderProps> = ({ portalType }) => {
  const [open, setOpen] = useState(false);
  const { saveWidgetSettings } = useWidgetSettings(portalType);
  
  const form = useForm<CustomWidgetFormValues>({
    resolver: zodResolver(customWidgetSchema),
    defaultValues: {
      title: '',
      content: '',
      height: 200,
      backgroundColor: '#ffffff',
      textColor: '#000000'
    }
  });
  
  const onSubmit = async (data: CustomWidgetFormValues) => {
    try {
      // Create a new custom widget
      await saveWidgetSettings('custom-widget', {
        title: data.title,
        content: data.content,
        height: data.height,
        backgroundColor: data.backgroundColor,
        textColor: data.textColor,
        createdAt: new Date().toISOString()
      });
      
      toast.success('Custom widget created successfully');
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error creating custom widget:', error);
      toast.error('Failed to create custom widget');
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-1">
          <PlusCircle className="h-4 w-4" />
          <span>Create Widget</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create Custom Widget</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Widget Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter widget title" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Widget Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter widget content (supports HTML)" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (px)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={100} 
                        max={800}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="backgroundColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background Color</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input type="color" {...field} className="w-12 h-8 p-1" />
                      </FormControl>
                      <Input 
                        type="text" 
                        value={field.value} 
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="textColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Text Color</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input type="color" {...field} className="w-12 h-8 p-1" />
                    </FormControl>
                    <Input 
                      type="text" 
                      value={field.value} 
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Widget</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomWidgetBuilder;
