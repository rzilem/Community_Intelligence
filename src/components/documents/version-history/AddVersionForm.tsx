
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AddVersionFormProps {
  file: File | null;
  notes: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNotesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSave: () => void;
  isUploading: boolean;
}

const AddVersionForm: React.FC<AddVersionFormProps> = ({
  file,
  notes,
  onFileChange,
  onNotesChange,
  onSave,
  isUploading
}) => {
  return (
    <div className="bg-muted p-4 rounded-md mb-4">
      <h3 className="text-sm font-medium mb-2">Upload New Version</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="version-file">File</Label>
          <Input 
            id="version-file" 
            type="file" 
            onChange={onFileChange}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="version-notes">Version Notes</Label>
          <Textarea 
            id="version-notes" 
            placeholder="Describe the changes in this version..."
            value={notes}
            onChange={onNotesChange}
            className="mt-1"
          />
        </div>
        <div className="flex justify-end">
          <Button 
            onClick={onSave} 
            disabled={!file || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Save Version'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddVersionForm;
