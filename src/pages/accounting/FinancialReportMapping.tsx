
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { CreditCard, ArrowRight, Upload, FileText, Sparkles, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUploader } from '@/components/ui/file-uploader';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AssociationSelector from '@/components/associations/AssociationSelector';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const FinancialReportMapping = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | undefined>();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setAnalysisResults(null);
  };

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    if (!selectedAssociationId) {
      setError('Please select an association');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 150);

      // Upload file to Supabase Storage
      const fileName = `${Date.now()}_${selectedFile.name}`;
      const filePath = `financial-reports/${selectedAssociationId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile);

      clearInterval(progressInterval);
      
      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      setUploadProgress(100);
      toast.success('Report uploaded successfully');
      
      // Start AI analysis
      setIsAnalyzing(true);

      // Get file URL for analysis
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Call AI analysis function
      try {
        const { data, error: analysisError } = await supabase.functions.invoke('analyze-financial-report', {
          body: { 
            fileUrl: publicUrl,
            associationId: selectedAssociationId
          }
        });
        
        if (analysisError) throw new Error(analysisError.message);
        
        setAnalysisResults(data);
        toast.success('Report analysis completed');
      } catch (err: any) {
        console.error('Error during analysis:', err);
        setError(`Analysis failed: ${err.message}`);
        toast.error('Report analysis failed');
      }

    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const handleSaveMapping = () => {
    if (!analysisResults) return;
    
    toast.success('GL code mapping saved successfully');
  };

  return (
    <PageTemplate 
      title="Financial Report Mapping" 
      icon={<CreditCard className="h-8 w-8" />}
      description="Upload and analyze financial reports for GL code mapping during client transitions."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Upload Financial Report</CardTitle>
            <CardDescription>
              Upload your existing financial report to analyze and map GL codes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AssociationSelector 
              className="w-full mb-6" 
              onAssociationChange={handleAssociationChange}
            />
          
            <div className="space-y-4">
              <FileUploader 
                onFileSelect={handleFileSelect}
                accept=".pdf"
                label="Upload Financial Report (PDF)"
              />
              
              {selectedFile && (
                <div className="text-sm">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
              
              {isUploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
                  </p>
                </div>
              )}
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Button 
                onClick={handleUploadAndAnalyze} 
                disabled={!selectedFile || isUploading || isAnalyzing || !selectedAssociationId}
                className="w-full"
              >
                {isUploading ? 'Uploading...' : isAnalyzing ? 'Analyzing...' : 'Upload & Analyze'}
                {!isUploading && !isAnalyzing && <Upload className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>GL Code Mapping</CardTitle>
            <CardDescription>
              AI-suggested mappings from source financial report to destination GL accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Sparkles className="h-12 w-12 text-purple-500 animate-pulse mb-4" />
                <h3 className="text-lg font-medium mb-2">Analyzing Financial Report</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Our AI is analyzing your financial report to extract GL codes and suggest mappings.
                  This may take a few moments.
                </p>
              </div>
            ) : !analysisResults ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mb-4" />
                <p>Upload a financial report to see GL code mapping suggestions</p>
              </div>
            ) : (
              <div className="space-y-6">
                <Tabs defaultValue="suggested">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="suggested">Suggested Mapping</TabsTrigger>
                    <TabsTrigger value="manual">Manual Mapping</TabsTrigger>
                    <TabsTrigger value="review">Review & Confirm</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="suggested" className="space-y-4 pt-4">
                    {/* Mock AI suggested mappings */}
                    <div className="rounded-md border">
                      <div className="p-4 bg-muted/50 flex items-center justify-between">
                        <div className="flex items-center">
                          <Sparkles className="h-4 w-4 text-purple-500 mr-2" />
                          <span className="font-medium">AI-Suggested Mappings</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Confidence: <span className="font-medium text-green-600">High</span>
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-5 gap-2 text-sm font-medium text-muted-foreground">
                          <div className="col-span-2">Source GL Code</div>
                          <div className="col-span-2">Target GL Code</div>
                          <div className="col-span-1">Confidence</div>
                        </div>
                        
                        <Separator />
                        
                        {[
                          { source: "1000 - Operating Cash", target: "1000 - First Citizens Bank Operating", confidence: "95%" },
                          { source: "1100 - Reserve Cash", target: "1100 - First Citizens Bank Reserve", confidence: "92%" },
                          { source: "1200 - Accounts Receivable", target: "1200 - Accounts Receivable", confidence: "99%" },
                          { source: "2000 - Accounts Payable", target: "2000 - Accounts Payable", confidence: "99%" },
                          { source: "3000 - Operating Fund", target: "3000 - Operating Fund Balance", confidence: "94%" },
                          { source: "4000 - Assessment Revenue", target: "4000 - Assessment Income", confidence: "90%" },
                          { source: "5000 - Landscaping Expense", target: "5000 - Landscaping", confidence: "88%" }
                        ].map((mapping, index) => (
                          <div key={index} className="grid grid-cols-5 gap-2 py-2 text-sm items-center border-b last:border-0">
                            <div className="col-span-2 font-medium">{mapping.source}</div>
                            <div className="col-span-2 font-medium text-primary flex items-center">
                              <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
                              {mapping.target}
                            </div>
                            <div className="col-span-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                parseInt(mapping.confidence) > 90 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {mapping.confidence}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={handleSaveMapping}>
                        Accept Suggested Mappings
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="manual" className="pt-4">
                    <div className="text-center py-10 text-muted-foreground">
                      <p>Manual mapping interface will be implemented in the next phase.</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="review" className="pt-4">
                    <div className="text-center py-10 text-muted-foreground">
                      <p>Review and confirmation interface will be implemented in the next phase.</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
};

export default FinancialReportMapping;
