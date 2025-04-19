
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { BankAccount } from './BankAccountTable';
import { UploadCloud, Database, FileUp, FileText, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import BankStatementTable from './BankStatementTable';

interface BankStatementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  account: BankAccount;
}

const BankStatementDialog: React.FC<BankStatementDialogProps> = ({
  isOpen,
  onClose,
  account,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statementDate, setStatementDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStatementUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setIsUploading(true);
      
      // 1. Upload file to storage
      const filePath = `${account.id}/${Date.now()}_${selectedFile.name}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from('bank_statements')
        .upload(filePath, selectedFile);

      if (storageError) throw storageError;

      // Get public URL
      const { data: urlData } = await supabase.storage
        .from('bank_statements')
        .getPublicUrl(filePath);

      // 2. Create bank statement record
      const { data: statementData, error: statementError } = await supabase
        .from('bank_statements')
        .insert({
          bank_account_id: account.id,
          statement_date: statementDate,
          filename: selectedFile.name,
          file_url: urlData.publicUrl,
          file_size: selectedFile.size,
          upload_method: 'manual',
          import_status: 'pending'
        })
        .select()
        .single();

      if (statementError) throw statementError;

      // 3. Update bank account with last statement date
      const { error: updateError } = await supabase
        .from('bank_accounts')
        .update({
          last_statement_date: statementDate
        })
        .eq('id', account.id);

      if (updateError) throw updateError;

      toast.success('Statement uploaded successfully');
      setSelectedFile(null);
      onClose();
    } catch (error: any) {
      console.error('Error uploading statement:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConnectToBank = () => {
    setConnectionStatus('connecting');
    setTimeout(() => {
      toast.info('Bank connection feature is coming soon!');
      setConnectionStatus('disconnected');
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>
            Manage Bank Statements
          </DialogTitle>
          <DialogDescription>
            {account.name} - {account.institution}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              <span>Upload Statement</span>
            </TabsTrigger>
            <TabsTrigger value="connect" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>Connect Bank</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="statementDate">Statement Date</Label>
              <Input
                id="statementDate"
                type="date"
                value={statementDate}
                onChange={(e) => setStatementDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Upload Statement File</Label>
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 bg-muted/30">
                <UploadCloud className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop your bank statement file here, or click to browse
                </p>
                <Input
                  type="file"
                  accept=".pdf,.csv,.xlsx,.xls,.qfx,.ofx"
                  className="max-w-sm"
                  onChange={handleFileChange}
                />
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm mt-2">
                    <FileText className="h-4 w-4" />
                    <span>{selectedFile.name}</span>
                    <span className="text-muted-foreground">
                      ({Math.round(selectedFile.size / 1024)} KB)
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-300 p-4 text-sm flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Processing Requirements</p>
                <p className="text-amber-700">
                  For best results, upload either PDF statements or .QFX/.OFX files from your bank. 
                  CSV files are also supported but may require additional mapping.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="connect" className="py-4">
            <div className="space-y-4">
              <div className="bg-muted/30 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Connect to Your Bank</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Securely connect to {account.institution} to automatically import statements and transactions.
                </p>
                
                <Button 
                  onClick={handleConnectToBank}
                  className="w-full"
                  disabled={connectionStatus === 'connecting'}
                >
                  <Database className="h-4 w-4 mr-2" />
                  {connectionStatus === 'connecting' ? 'Connecting...' : connectionStatus === 'connected' ? 'Connected' : 'Connect Account'}
                </Button>
              </div>
              
              <div className="bg-amber-50 border-l-4 border-amber-300 p-4 text-sm flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Data Security</p>
                  <p className="text-amber-700">
                    We use industry-standard security practices to protect your banking credentials. 
                    Your login information is never stored on our servers.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <BankStatementTable accountId={account.id} />

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleStatementUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Statement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BankStatementDialog;
