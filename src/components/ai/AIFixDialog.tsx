
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2 } from 'lucide-react';

export interface FixOption {
  id: string;
  label: string;
  description?: string;
  route?: string;
  action?: () => Promise<void>;
}

interface AIFixDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  options: FixOption[];
}

export const AIFixDialog: React.FC<AIFixDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  severity,
  options,
}) => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFixAction = async (option: FixOption) => {
    setSelectedOption(option.id);
    setLoading(true);
    
    try {
      if (option.action) {
        await option.action();
      }
      
      setSuccess(true);
      toast.success(`Issue resolution initiated: ${option.label}`);
      
      // Wait a moment to show success state
      setTimeout(() => {
        setLoading(false);
        onOpenChange(false);
        
        // If there's a route to navigate to, do it after dialog closes
        if (option.route) {
          navigate(option.route);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error fixing AI issue:', error);
      toast.error('Failed to complete the requested action');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <p className="text-sm font-medium text-gray-500">
            Choose an action to resolve this issue:
          </p>
          {options.map((option) => (
            <Button
              key={option.id}
              variant="outline"
              className="w-full justify-start text-left h-auto py-3 px-4"
              disabled={loading}
              onClick={() => handleFixAction(option)}
            >
              {selectedOption === option.id && loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : selectedOption === option.id && success ? (
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
              ) : null}
              <div className="flex flex-col items-start">
                <span>{option.label}</span>
                {option.description && (
                  <span className="text-xs text-gray-500">{option.description}</span>
                )}
              </div>
            </Button>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
