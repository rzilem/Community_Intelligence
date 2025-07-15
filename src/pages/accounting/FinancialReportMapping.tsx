
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, FileUp, Database, CheckCircle2, XCircle, RefreshCw, Sparkles } from 'lucide-react';
import AssociationSelector from '@/components/associations/AssociationSelector';
import { GLAccount } from '@/types/accounting-types';
import { toast } from 'sonner';

interface GLCodeMapping {
  fromCode: string;
  fromDescription: string;
  toCode: string;
  toDescription: string;
  confidence: number;
  mapped: boolean;
}

interface ReportAnalysisResult {
  fileName: string;
  uploadDate: string;
  glCodes: {
    detected: number;
    mapped: number;
    unmapped: number;
  };
  suggestedMappings: GLCodeMapping[];
}

const FinancialReportMapping = () => {
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<ReportAnalysisResult | null>(null);
  
  // Mock GL accounts for destination mapping
  const destinationGLAccounts: GLAccount[] = [
    { id: '1', number: '4000', name: 'Assessment Income', type: 'Revenue', balance: 0, code: '4000', description: 'Assessment Income', category: 'Income' },
    { id: '2', number: '4010', name: 'Special Assessment', type: 'Revenue', balance: 0, code: '4010', description: 'Special Assessment', category: 'Income' },
    { id: '3', number: '4100', name: 'Interest Income', type: 'Revenue', balance: 0, code: '4100', description: 'Interest Income', category: 'Income' },
    { id: '4', number: '5000', name: 'Admin Expenses', type: 'Expense', balance: 0, code: '5000', description: 'Admin Expenses', category: 'Expenses' },
    { id: '5', number: '5010', name: 'Bank Charges', type: 'Expense', balance: 0, code: '5010', description: 'Bank Charges', category: 'Expenses' },
    { id: '6', number: '5200', name: 'General Repairs & Maintenance', type: 'Expense', balance: 0, code: '5200', description: 'General Repairs & Maintenance', category: 'Expenses' },
    { id: '7', number: '5710', name: 'Landscaping Expense', type: 'Expense', balance: 0, code: '5710', description: 'Landscaping Expense', category: 'Expenses' },
    { id: '8', number: '6250', name: 'Trash', type: 'Expense', balance: 0, code: '6250', description: 'Trash', category: 'Expenses' },
    { id: '9', number: '8010', name: 'General Liability + D&O Insurance', type: 'Expense', balance: 0, code: '8010', description: 'General Liability + D&O Insurance', category: 'Expenses' },
    { id: '10', number: '9050', name: 'Contribution to Reserves', type: 'Expense', balance: 0, code: '9050', description: 'Contribution to Reserves', category: 'Expenses' },
  ];

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileUploaded(true);
    }
  };

  const handleAnalyzeReport = () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      // Mock analysis result
      const mockResult: ReportAnalysisResult = {
        fileName: file?.name || 'financial-report.pdf',
        uploadDate: new Date().toISOString(),
        glCodes: {
          detected: 15,
          mapped: 8,
          unmapped: 7
        },
        suggestedMappings: [
          { 
            fromCode: '4001', 
            fromDescription: 'Regular Assessments', 
            toCode: '4000', 
            toDescription: 'Assessment Income', 
            confidence: 0.95, 
            mapped: false 
          },
          { 
            fromCode: '4102', 
            fromDescription: 'Interest Revenue', 
            toCode: '4100', 
            toDescription: 'Interest Income', 
            confidence: 0.92, 
            mapped: false 
          },
          { 
            fromCode: '5110', 
            fromDescription: 'Banking Fees', 
            toCode: '5010', 
            toDescription: 'Bank Charges', 
            confidence: 0.88, 
            mapped: false 
          },
          { 
            fromCode: '5250', 
            fromDescription: 'General Maintenance', 
            toCode: '5200', 
            toDescription: 'General Repairs & Maintenance', 
            confidence: 0.85, 
            mapped: false 
          },
          { 
            fromCode: '5780', 
            fromDescription: 'Landscape Maintenance', 
            toCode: '5710', 
            toDescription: 'Landscaping Expense', 
            confidence: 0.93, 
            mapped: false 
          },
          { 
            fromCode: '6200', 
            fromDescription: 'Garbage Collection', 
            toCode: '6250', 
            toDescription: 'Trash', 
            confidence: 0.89, 
            mapped: false 
          },
          { 
            fromCode: '8020', 
            fromDescription: 'Insurance - General Liability', 
            toCode: '8010', 
            toDescription: 'General Liability + D&O Insurance', 
            confidence: 0.87, 
            mapped: false 
          },
          { 
            fromCode: '9500', 
            fromDescription: 'Reserve Funding', 
            toCode: '9050', 
            toDescription: 'Contribution to Reserves', 
            confidence: 0.94, 
            mapped: false 
          },
          { 
            fromCode: '5700', 
            fromDescription: 'Pool Service', 
            toCode: '', 
            toDescription: '', 
            confidence: 0.0, 
            mapped: false 
          },
          { 
            fromCode: '5800', 
            fromDescription: 'Security System', 
            toCode: '', 
            toDescription: '', 
            confidence: 0.0, 
            mapped: false 
          },
        ]
      };
      
      setAnalysisResult(mockResult);
      setIsAnalyzing(false);
      toast.success("Financial report analyzed successfully!");
    }, 3000);
  };

  const handleMappingChange = (index: number, toCode: string, toDescription: string) => {
    if (!analysisResult) return;
    
    setAnalysisResult({
      ...analysisResult,
      suggestedMappings: analysisResult.suggestedMappings.map((mapping, i) => 
        i === index 
          ? { ...mapping, toCode, toDescription, mapped: true } 
          : mapping
      )
    });
  };

  const handleApplyAllMappings = () => {
    toast.success("All mappings applied successfully!");
  };

  const filteredMappings = analysisResult ? 
    analysisResult.suggestedMappings.filter(mapping => 
      mapping.fromCode.includes(searchTerm) || 
      mapping.fromDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.toCode.includes(searchTerm) ||
      mapping.toDescription.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

  return (
    <AppLayout>
      <PageTemplate 
        title="Financial Report Mapping" 
        icon={<FileText className="h-8 w-8" />}
        description="Map GL codes from financial reports during client transitions"
      >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:items-center justify-between">
                <div>
                  <CardTitle>GL Code Mapping</CardTitle>
                  <CardDescription>
                    Upload a financial report to map GL codes between systems
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" disabled={!analysisResult}>
                    <Upload className="h-4 w-4 mr-2" />
                    Export Mappings
                  </Button>
                  <Button disabled={!analysisResult} onClick={handleApplyAllMappings}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Apply All
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="mapping">
                <TabsList className="mb-4">
                  <TabsTrigger value="mapping">Code Mapping</TabsTrigger>
                  <TabsTrigger value="history">Mapping History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="mapping">
                  {!fileUploaded ? (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/50">
                      <FileUp className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Upload Financial Report</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload a PDF or Excel financial report to analyze and map GL codes
                      </p>
                      <div className="flex justify-center">
                        <label htmlFor="file-upload">
                          <Input
                            id="file-upload"
                            type="file"
                            accept=".pdf,.xlsx,.xls,.csv"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                          <Button asChild>
                            <span>
                              <FileUp className="h-4 w-4 mr-2" />
                              Select File
                            </span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  ) : isAnalyzing ? (
                    <div className="text-center py-12">
                      <Sparkles className="h-12 w-12 text-primary/70 mx-auto mb-4 animate-pulse" />
                      <h3 className="text-lg font-medium mb-2">Analyzing Report</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        AI is reading your report and identifying GL codes...
                      </p>
                      <div className="flex justify-center">
                        <div className="border-4 border-t-primary border-primary/30 w-10 h-10 rounded-full animate-spin"></div>
                      </div>
                    </div>
                  ) : analysisResult ? (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/50 p-4 rounded-lg">
                        <div>
                          <h3 className="font-medium flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            {analysisResult.fileName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Detected {analysisResult.glCodes.detected} GL codes: {analysisResult.glCodes.mapped} mapped, {analysisResult.glCodes.unmapped} unmapped
                          </p>
                        </div>
                        <Input
                          type="text"
                          placeholder="Search GL codes..."
                          className="max-w-[250px]"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      
                      <div className="border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[100px]">Source Code</TableHead>
                              <TableHead className="w-[200px]">Source Description</TableHead>
                              <TableHead className="w-[100px]">Target Code</TableHead>
                              <TableHead>Target Description</TableHead>
                              <TableHead className="w-[100px] text-right">Confidence</TableHead>
                              <TableHead className="w-[80px] text-center">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredMappings.map((mapping, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{mapping.fromCode}</TableCell>
                                <TableCell>{mapping.fromDescription}</TableCell>
                                <TableCell>
                                  <select
                                    className="w-full p-2 border rounded bg-background"
                                    value={mapping.toCode}
                                    onChange={(e) => {
                                      const selected = destinationGLAccounts.find(a => a.number === e.target.value);
                                      if (selected) {
                                        handleMappingChange(index, selected.number, selected.name);
                                      }
                                    }}
                                  >
                                    <option value="">Select GL code</option>
                                    {destinationGLAccounts.map(account => (
                                      <option key={account.id} value={account.number}>
                                        {account.number}
                                      </option>
                                    ))}
                                  </select>
                                </TableCell>
                                <TableCell>
                                  {mapping.toDescription || (
                                    <span className="text-muted-foreground italic">Select a target GL code</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {mapping.confidence > 0 ? (
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      mapping.confidence > 0.9 ? 'bg-green-100 text-green-800' :
                                      mapping.confidence > 0.7 ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {Math.round(mapping.confidence * 100)}%
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">N/A</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {mapping.mapped ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : mapping.confidence > 0 ? (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-7 px-2"
                                      onClick={() => handleMappingChange(
                                        index, 
                                        mapping.toCode, 
                                        mapping.toDescription
                                      )}
                                    >
                                      Confirm
                                    </Button>
                                  ) : (
                                    <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                            
                            {filteredMappings.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                  No GL code mappings match your search
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{file?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file?.size && (file.size / 1024 / 1024).toFixed(2)) || '0'} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" onClick={() => setFileUploaded(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAnalyzeReport}>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Analyze Report
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="history">
                  <div className="text-center py-12 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Mapping History</h3>
                    <p className="max-w-md mx-auto">
                      GL code mapping history will appear here after you've uploaded and mapped financial reports
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AssociationSelector
                onAssociationChange={handleAssociationChange}
                label="Target Association"
              />
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">AI Mapping Assistant</h4>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                    <span className="text-sm">AI Assistant</span>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  The AI assistant analyzes financial reports and suggests GL code mappings based on code numbers, descriptions, and financial patterns.
                </p>
              </div>
              
              <div className="space-y-2 pt-4">
                <h4 className="text-sm font-medium border-b pb-2">Mapping Stats</h4>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground">Total Mappings</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground">Reports Analyzed</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground">Last Mapping</span>
                  <span className="font-medium">Never</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTemplate>
    </AppLayout>
  );
};

export default FinancialReportMapping;
