
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, FileSearch } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/types/document-types';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DocumentAnalysisDialogProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

interface AnalysisResults {
  summary: string;
  docType: string;
  keyTopics: string[];
  importantClauses: Array<{ title: string; summary: string }>;
  actionItems: string[];
  effectiveDates: string[];
  relevantRoles: string[];
}

const DocumentAnalysisDialog: React.FC<DocumentAnalysisDialogProps> = ({
  isOpen,
  onClose,
  document
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResults | null>(null);
  
  const handleAnalyze = async () => {
    if (!document) return;
    
    setIsAnalyzing(true);
    setAnalysis(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-document', {
        body: {
          documentUrl: document.url,
          documentName: document.name,
          documentType: document.file_type
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data?.analysis) {
        throw new Error('Failed to analyze document');
      }
      
      setAnalysis(data.analysis);
      toast.success('Document analysis completed');
    } catch (err: any) {
      console.error('Error analyzing document:', err);
      toast.error(err.message || 'Failed to analyze document');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Document Analysis</DialogTitle>
          <DialogDescription>
            {document ? `Analyze "${document.name}" using AI to extract key information.` : 'Select a document to analyze'}
          </DialogDescription>
        </DialogHeader>
        
        {!analysis && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <FileSearch className="w-16 h-16 text-muted-foreground" />
            <p className="text-center text-muted-foreground">
              Our AI will analyze your document to extract key information, 
              summarize content, and highlight important clauses.
            </p>
            
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !document}
              className="mt-4"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Document
                </>
              )}
            </Button>
          </div>
        )}
        
        {analysis && (
          <div className="space-y-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-2">Summary</h3>
              <p>{analysis.summary}</p>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-2">Document Type</h3>
                <p>{analysis.docType}</p>
              </Card>
              
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-2">Key Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.keyTopics.map((topic, index) => (
                    <Badge key={index} variant="outline">{topic}</Badge>
                  ))}
                </div>
              </Card>
            </div>
            
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-2">Important Clauses</h3>
              <div className="space-y-3">
                {analysis.importantClauses.map((clause, index) => (
                  <div key={index} className="border-b pb-2 last:border-0">
                    <h4 className="font-medium">{clause.title}</h4>
                    <p className="text-sm text-muted-foreground">{clause.summary}</p>
                  </div>
                ))}
              </div>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-2">Action Items</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {analysis.actionItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </Card>
              
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-2">Key Dates</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {analysis.effectiveDates.map((date, index) => (
                    <li key={index}>{date}</li>
                  ))}
                </ul>
              </Card>
            </div>
            
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-2">Relevant for</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.relevantRoles.map((role, index) => (
                  <Badge key={index} variant="secondary">{role}</Badge>
                ))}
              </div>
            </Card>
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setAnalysis(null)}
              >
                Analyze Again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentAnalysisDialog;
