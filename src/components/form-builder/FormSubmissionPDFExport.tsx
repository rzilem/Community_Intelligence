
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { File, Save, Settings } from 'lucide-react';
import { FormTemplate } from '@/types/form-builder-types';
import { toast } from 'sonner';

interface FormSubmissionPDFExportProps {
  formTemplate: FormTemplate;
  submissions?: any[]; // In a real app, this would have a proper type
}

const FormSubmissionPDFExport: React.FC<FormSubmissionPDFExportProps> = ({
  formTemplate,
  submissions = []
}) => {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('select');
  const [includeHeader, setIncludeHeader] = useState(true);
  const [includeLogo, setIncludeLogo] = useState(true);
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  
  // Mock data for demonstration purposes
  const mockSubmissions = submissions.length > 0 ? submissions : [
    { id: '1', submittedAt: '2023-09-15T14:30:00Z', submittedBy: 'John Doe', status: 'approved' },
    { id: '2', submittedAt: '2023-09-14T10:45:00Z', submittedBy: 'Jane Smith', status: 'pending' },
    { id: '3', submittedAt: '2023-09-13T09:15:00Z', submittedBy: 'Bob Johnson', status: 'rejected' },
    { id: '4', submittedAt: '2023-09-12T16:20:00Z', submittedBy: 'Alice Williams', status: 'approved' },
    { id: '5', submittedAt: '2023-09-11T11:10:00Z', submittedBy: 'Charlie Brown', status: 'archived' },
  ];
  
  const toggleSelectAll = () => {
    if (selectedIds.length === mockSubmissions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(mockSubmissions.map(s => s.id));
    }
  };
  
  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };
  
  const handleExport = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one submission to export");
      return;
    }
    
    toast.success(`Exporting ${selectedIds.length} submissions as PDF`);
    // In a real implementation, this would call an API to generate and download the PDF
    setTimeout(() => {
      setOpen(false);
      toast("PDF generated successfully", {
        description: "Your PDF has been downloaded",
        action: {
          label: "Open",
          onClick: () => console.log("Open PDF")
        }
      });
    }, 1500);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <File className="mr-2 h-4 w-4" />
          Export to PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Export Form Submissions to PDF</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="select">Select Submissions</TabsTrigger>
            <TabsTrigger value="options">PDF Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="select" className="space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b">
              <Checkbox 
                id="select-all" 
                checked={selectedIds.length === mockSubmissions.length} 
                onCheckedChange={toggleSelectAll}
              />
              <Label htmlFor="select-all" className="text-sm font-medium">
                Select All ({mockSubmissions.length})
              </Label>
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {mockSubmissions.map(submission => (
                <div key={submission.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md">
                  <Checkbox 
                    id={`submission-${submission.id}`} 
                    checked={selectedIds.includes(submission.id)}
                    onCheckedChange={() => toggleSelection(submission.id)}
                  />
                  <Label htmlFor={`submission-${submission.id}`} className="flex-1 cursor-pointer">
                    <div className="flex flex-col">
                      <span className="font-medium">{submission.submittedBy}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(submission.submittedAt)}
                      </span>
                    </div>
                  </Label>
                  <div className={`text-xs px-2 py-1 rounded-full capitalize ${
                    submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                    submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {submission.status}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="options" className="space-y-4">
            <div className="space-y-4 p-4 border rounded-md">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-header" 
                  checked={includeHeader}
                  onCheckedChange={(checked) => setIncludeHeader(!!checked)} 
                />
                <Label htmlFor="include-header">Include Form Header</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-logo" 
                  checked={includeLogo}
                  onCheckedChange={(checked) => setIncludeLogo(!!checked)} 
                />
                <Label htmlFor="include-logo">Include Company Logo</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-timestamp" 
                  checked={includeTimestamp}
                  onCheckedChange={(checked) => setIncludeTimestamp(!!checked)} 
                />
                <Label htmlFor="include-timestamp">Include Export Timestamp</Label>
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-md text-sm">
              <p className="text-muted-foreground">
                PDF will include {formTemplate.fields.length} form fields and selected submission data.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedIds.length} submission{selectedIds.length !== 1 && 's'} selected
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleExport}>
              <Save className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormSubmissionPDFExport;
