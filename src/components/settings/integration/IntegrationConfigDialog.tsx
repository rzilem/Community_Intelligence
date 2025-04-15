
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TestOpenAIButton from '../TestOpenAIButton';
import OpenAIHelp from '../OpenAIHelp';
import { Loader2 } from 'lucide-react';

interface IntegrationConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIntegration: string | null;
  configFields: {[key: string]: string};
  onConfigFieldChange: (field: string, value: string) => void;
  openAIModel: string;
  onOpenAIModelChange: (value: string) => void;
  onSave: () => void;
  hasOpenAIKey: boolean;
  isPending?: boolean;
}

const IntegrationConfigDialog: React.FC<IntegrationConfigDialogProps> = ({
  open,
  onOpenChange,
  selectedIntegration,
  configFields,
  onConfigFieldChange,
  openAIModel,
  onOpenAIModelChange,
  onSave,
  hasOpenAIKey,
  isPending = false
}) => {
  if (!selectedIntegration) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {selectedIntegration} Configuration
            {selectedIntegration === 'OpenAI' && <OpenAIHelp />}
          </DialogTitle>
          <DialogDescription>
            Enter the required information to {hasOpenAIKey ? 'update' : 'connect'} {selectedIntegration}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {Object.keys(configFields).filter(field => field !== 'configDate' && field !== 'model').map((field) => (
            <div key={field} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={field} className="text-right">
                {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
              </Label>
              <Input
                id={field}
                type={field.toLowerCase().includes('key') || field.toLowerCase().includes('secret') ? 'password' : 'text'}
                value={configFields[field]}
                onChange={(e) => onConfigFieldChange(field, e.target.value)}
                className="col-span-3"
                disabled={isPending}
              />
            </div>
          ))}
          
          {/* Special field for OpenAI model selection */}
          {selectedIntegration === 'OpenAI' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model" className="text-right">
                Model
              </Label>
              <Select 
                value={openAIModel} 
                onValueChange={onOpenAIModelChange}
                disabled={isPending}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini (Fast & Efficient)</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o (Powerful)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex items-center justify-between sm:justify-between">
          {selectedIntegration === 'OpenAI' && hasOpenAIKey && (
            <TestOpenAIButton />
          )}
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IntegrationConfigDialog;
