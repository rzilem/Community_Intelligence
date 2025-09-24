import React, { useState } from 'react';
import { BankReconciliationService } from '@/services/accounting/bank-reconciliation-service';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BankStatementUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAccount: string;
}

const BankStatementUpload: React.FC<BankStatementUploadProps> = ({
  open,
  onOpenChange,
  selectedAccount
}) => {
  const [uploadType, setUploadType] = useState('csv');
  const [file, setFile] = useState<File | null>(null);
  const [statementDate, setStatementDate] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !statementDate || !selectedAccount) return;

    setIsUploading(true);
    
    try {
      await BankReconciliationService.uploadStatement(file, selectedAccount);
      
      onOpenChange(false);
      setFile(null);
      setStatementDate('');
    } catch (error) {
      console.error('Error uploading statement:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Bank Statement</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="statement_date">Statement Date</Label>
            <Input
              id="statement_date"
              type="date"
              value={statementDate}
              onChange={(e) => setStatementDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="upload_type">File Type</Label>
            <Select value={uploadType} onValueChange={setUploadType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV File</SelectItem>
                <SelectItem value="pdf">PDF Statement</SelectItem>
                <SelectItem value="ofx">OFX/QFX File</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="file_upload">Bank Statement File</Label>
            <div className="mt-2">
              <input
                id="file_upload"
                type="file"
                onChange={handleFileChange}
                accept={uploadType === 'csv' ? '.csv' : uploadType === 'pdf' ? '.pdf' : '.ofx,.qfx'}
                className="hidden"
              />
              <label
                htmlFor="file_upload"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors"
              >
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to select a file or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {uploadType.toUpperCase()} files only
                  </p>
                </div>
              </label>
            </div>

            {file && (
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatFileSize(file.size)}
                </p>
              </div>
            )}
          </div>

          {uploadType === 'csv' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                CSV files should include columns: Date, Description, Amount (negative for debits).
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={!file || !statementDate || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Import Statement'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BankStatementUpload;