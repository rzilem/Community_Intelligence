
import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ImportDataFormProps {
  onFileUpload: (file: File, type: string) => void;
  associationId: string;
}

const ImportDataForm: React.FC<ImportDataFormProps> = ({ onFileUpload, associationId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<string>('associations');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile && importType) {
      onFileUpload(selectedFile, importType);
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
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Data Type to Import</h3>
            <RadioGroup
              defaultValue={importType}
              onValueChange={setImportType}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
            >
              <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50">
                <RadioGroupItem value="associations" id="associations" />
                <Label htmlFor="associations" className="flex-1 cursor-pointer">Associations</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50">
                <RadioGroupItem value="owners" id="owners" />
                <Label htmlFor="owners" className="flex-1 cursor-pointer">Owners/Residents</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50">
                <RadioGroupItem value="properties" id="properties" />
                <Label htmlFor="properties" className="flex-1 cursor-pointer">Properties</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50">
                <RadioGroupItem value="financial" id="financial" />
                <Label htmlFor="financial" className="flex-1 cursor-pointer">
                  Financial Data
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 ml-2 text-muted-foreground inline" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Import financial data including assessments, payments, and transactions
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50">
                <RadioGroupItem value="compliance" id="compliance" />
                <Label htmlFor="compliance" className="flex-1 cursor-pointer">Compliance Issues</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50">
                <RadioGroupItem value="maintenance" id="maintenance" />
                <Label htmlFor="maintenance" className="flex-1 cursor-pointer">Maintenance Requests</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Upload File</h3>
            <div
              className={`border-2 border-dashed rounded-md p-6 text-center ${
                isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {selectedFile ? selectedFile.name : 'Drag and drop or click to upload'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports CSV and Excel (.xlsx) files
                  </p>
                </div>
                <label className="cursor-pointer">
                  <Button variant="outline" type="button" onClick={() => {}}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Browse Files
                  </Button>
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
            {selectedFile && (
              <div className="flex items-center justify-between border rounded-md p-3 bg-muted/30">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={() => setSelectedFile(null)}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!selectedFile || !importType || !associationId}
            >
              {!associationId ? 'Select an Association' : 'Upload and Validate'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default ImportDataForm;
