
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import FileUploader from './FileUploader';
import DataTypeSelector from './DataTypeSelector';
import { useFileParser } from './useFileParser';
import { Upload } from 'lucide-react';

interface ImportDataFormProps {
  onFileUpload: (file: File, parsedData: any[], type: string) => void;
  associationId: string;
}

const ImportDataForm: React.FC<ImportDataFormProps> = ({ onFileUpload, associationId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<string>('associations');
  const { parseFile, isProcessing } = useFileParser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFile && importType && associationId) {
      try {
        console.log('Parsing file:', selectedFile.name);
        // Parse the file to get the data
        const parsedData = await parseFile(selectedFile);
        
        if (parsedData.length === 0) {
          toast.error('The file appears to be empty or could not be parsed');
          return;
        }
        
        console.log('Parsed data:', parsedData.slice(0, 2)); // Log first two items for debugging
        
        // Pass the file, parsed data, and type to the parent component
        onFileUpload(selectedFile, parsedData, importType);
      } catch (error) {
        console.error('Error parsing file:', error);
        toast.error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      if (!selectedFile) {
        toast.error('Please select a file to import');
      } else if (!associationId) {
        toast.error('Please select an association');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Import Data</CardTitle>
          <CardDescription>
            Upload CSV or Excel files to import data into the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <DataTypeSelector 
            value={importType} 
            onChange={setImportType} 
          />

          <FileUploader 
            onFileSelected={setSelectedFile} 
            selectedFile={selectedFile} 
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!selectedFile || !importType || !associationId || isProcessing}
            >
              {isProcessing ? 
                'Processing...' : 
                !associationId ? 
                  'Select an Association' : 
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload and Validate
                  </>
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default ImportDataForm;
