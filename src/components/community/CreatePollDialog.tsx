
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { usePollCreate } from '@/hooks/polls/usePollCreate';
import { useAuth } from '@/hooks/auth/useAuth';
import { toast } from 'sonner';

interface CreatePollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  associationId: string;
  onSuccess: () => void;
}

const CreatePollDialog: React.FC<CreatePollDialogProps> = ({
  open,
  onOpenChange,
  associationId,
  onSuccess
}) => {
  const { user } = useAuth();
  const { createPoll, isLoading } = usePollCreate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [closingDate, setClosingDate] = useState<Date | undefined>(undefined);
  
  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      toast.error("A poll must have at least two options");
      return;
    }
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast.error("Please provide a title for the poll");
      return;
    }
    
    if (options.some(option => !option)) {
      toast.error("All poll options must have a value");
      return;
    }
    
    if (!user?.id) {
      toast.error("You must be logged in to create a poll");
      return;
    }
    
    try {
      await createPoll({
        title,
        description,
        options,
        associationId,
        createdBy: user.id,
        closesAt: closingDate
      });
      
      setTitle('');
      setDescription('');
      setOptions(['', '']);
      setClosingDate(undefined);
      onOpenChange(false);
      onSuccess();
      
      toast.success("Poll created successfully");
    } catch (error) {
      console.error("Failed to create poll:", error);
      toast.error("Failed to create poll");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a New Poll</DialogTitle>
            <DialogDescription>
              Create a new poll for your community to vote on.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Poll Question</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Should we renovate the playground?"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide more context about this poll..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Poll Options</Label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={addOption}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Option
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="closingDate">Closing Date (Optional)</Label>
              <DatePicker
                date={closingDate}
                setDate={setClosingDate}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                If no closing date is set, the poll will remain open until manually closed.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Poll"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePollDialog;
