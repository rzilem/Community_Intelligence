
import React, { useState } from 'react';
import { TemplateVersion, ProposalTemplate } from '@/types/proposal-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Clock, History, ArrowLeft, ArrowRight, Check, X, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface TemplateVersionHistoryProps {
  template: ProposalTemplate;
  versions: TemplateVersion[];
  onUpdateTemplate: (template: ProposalTemplate) => Promise<void>;
  onCreateVersion: (version: Partial<TemplateVersion>) => Promise<void>;
}

const TemplateVersionHistory: React.FC<TemplateVersionHistoryProps> = ({
  template,
  versions,
  onUpdateTemplate,
  onCreateVersion
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<TemplateVersion | null>(null);
  const [isComparingVersions, setIsComparingVersions] = useState(false);
  const [compareVersion, setCompareVersion] = useState<TemplateVersion | null>(null);
  const [newVersionNotes, setNewVersionNotes] = useState('');
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  
  const sortedVersions = [...versions].sort((a, b) => 
    b.version_number - a.version_number
  );

  const currentVersion = sortedVersions.find(v => 
    v.version_number === template.version
  ) || null;

  const handleSelectVersion = (version: TemplateVersion) => {
    if (isComparingVersions) {
      setCompareVersion(version);
    } else {
      setSelectedVersion(version);
    }
  };

  const handleRestoreVersion = async (version: TemplateVersion) => {
    try {
      await onUpdateTemplate({
        ...template,
        content: version.content,
        version: version.version_number
      });
      
      toast({
        title: "Version Restored",
        description: `Template has been restored to version ${version.version_number}.`
      });
      
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Restore Failed",
        description: "There was an error restoring the version.",
        variant: "destructive"
      });
    }
  };

  const handleCreateNewVersion = async () => {
    try {
      setIsCreatingVersion(true);
      
      const newVersionNumber = Math.max(0, ...versions.map(v => v.version_number)) + 1;
      
      await onCreateVersion({
        template_id: template.id,
        version_number: newVersionNumber,
        content: template.content,
        change_notes: newVersionNotes
      });
      
      toast({
        title: "New Version Created",
        description: `Version ${newVersionNumber} has been created successfully.`
      });
      
      setNewVersionNotes('');
      setIsCreatingVersion(false);
    } catch (error) {
      toast({
        title: "Version Creation Failed",
        description: "There was an error creating the new version.",
        variant: "destructive"
      });
      setIsCreatingVersion(false);
    }
  };

  // Helper to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const renderVersionsList = () => {
    return (
      <div className="space-y-4">
        {sortedVersions.map((version) => (
          <div
            key={version.id}
            className={`p-4 border rounded-md cursor-pointer transition-all hover:border-primary hover:bg-accent/10 ${
              (selectedVersion?.id === version.id || compareVersion?.id === version.id) 
                ? 'border-primary bg-accent/20' 
                : ''
            }`}
            onClick={() => handleSelectVersion(version)}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={version.version_number === template.version ? "default" : "outline"}>
                    Version {version.version_number}
                  </Badge>
                  {version.version_number === template.version && (
                    <Badge variant="secondary">Current</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {formatDate(version.created_at)}
                </p>
                {version.created_by && (
                  <p className="text-xs text-muted-foreground mt-1">
                    By: {version.created_by}
                  </p>
                )}
              </div>
              
              {!isComparingVersions && selectedVersion?.id === version.id && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRestoreVersion(version);
                  }}
                >
                  Restore
                </Button>
              )}
            </div>
            
            {version.change_notes && (
              <div className="mt-2 border-t pt-2">
                <p className="text-sm">{version.change_notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderComparisonView = () => {
    if (!selectedVersion || !compareVersion) return null;
    
    // In a real implementation, you would use a proper diff library
    // This is a simplified representation
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <div>
            <Badge>Version {selectedVersion.version_number}</Badge>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(selectedVersion.created_at)}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
          <div>
            <Badge>Version {compareVersion.version_number}</Badge>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(compareVersion.created_at)}
            </p>
          </div>
        </div>
        
        <div className="border rounded-md p-4 bg-muted/20">
          <p className="text-sm text-muted-foreground">
            In a full implementation, this would show a detailed comparison of the differences between these versions.
          </p>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="border rounded-md p-3 bg-red-50">
              <p className="text-xs font-medium text-red-700">Removed</p>
              <div className="mt-2 text-sm">
                <p>Example of removed content from version {selectedVersion.version_number}...</p>
              </div>
            </div>
            
            <div className="border rounded-md p-3 bg-green-50">
              <p className="text-xs font-medium text-green-700">Added</p>
              <div className="mt-2 text-sm">
                <p>Example of added content in version {compareVersion.version_number}...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1"
      >
        <History className="h-4 w-4 mr-1" />
        Version History
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">Template Version History</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow overflow-hidden">
            <div className="md:col-span-1 border-r pr-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Versions</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsComparingVersions(!isComparingVersions)}
                >
                  {isComparingVersions ? 'Cancel Compare' : 'Compare'}
                </Button>
              </div>
              
              <ScrollArea className="h-[calc(100vh-280px)]">
                {renderVersionsList()}
              </ScrollArea>
              
              <div className="mt-4 pt-4 border-t">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Create New Version</h4>
                  <Textarea
                    placeholder="Version notes (optional)"
                    value={newVersionNotes}
                    onChange={(e) => setNewVersionNotes(e.target.value)}
                    className="resize-none"
                  />
                  <Button 
                    onClick={handleCreateNewVersion}
                    disabled={isCreatingVersion}
                    className="w-full"
                  >
                    {isCreatingVersion ? 'Creating...' : 'Create Version Snapshot'}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              {isComparingVersions ? (
                <>
                  <h3 className="font-medium mb-4">Compare Versions</h3>
                  {selectedVersion && compareVersion ? (
                    renderComparisonView()
                  ) : (
                    <p className="text-muted-foreground">
                      Select two versions to compare their differences.
                      {selectedVersion && !compareVersion && " Now select a second version."}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h3 className="font-medium mb-4">Version Details</h3>
                  {selectedVersion ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Version {selectedVersion.version_number}</Badge>
                        <p className="text-sm text-muted-foreground">
                          Created on {formatDate(selectedVersion.created_at)}
                        </p>
                      </div>
                      
                      {selectedVersion.change_notes && (
                        <div className="border rounded-md p-4 bg-muted/10">
                          <h4 className="text-sm font-medium mb-2">Change Notes</h4>
                          <p className="text-sm">{selectedVersion.change_notes}</p>
                        </div>
                      )}
                      
                      <div className="border rounded-md p-4 bg-white overflow-auto max-h-[calc(100vh-380px)]">
                        <div dangerouslySetInnerHTML={{ __html: selectedVersion.content }} />
                      </div>
                      
                      <div className="flex space-x-2 justify-end">
                        {selectedVersion.version_number !== template.version && (
                          <Button 
                            variant="default" 
                            onClick={() => handleRestoreVersion(selectedVersion)}
                          >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Restore This Version
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Select a version to view its details.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TemplateVersionHistory;
