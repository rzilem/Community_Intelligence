
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIntegrationConfig } from '@/hooks/settings/useIntegrationConfig';
import IntegrationConfigDialog from './integration/IntegrationConfigDialog';
import { Button } from '@/components/ui/button';
import TestOpenAIButton from './TestOpenAIButton';
import { Sparkles, AlertCircle, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LogViewer from './LogViewer';

const AISettingsSection = () => {
  const [showConfigDialog, setShowConfigDialog] = React.useState(false);
  const [activeTab, setActiveTab] = useState('settings');
  
  const {
    openAIModel,
    setOpenAIModel,
    configFields,
    handleConfigFieldChange,
    saveOpenAIConfig,
    fetchOpenAIConfig,
    isPending,
    hasOpenAIKey,
    lastError
  } = useIntegrationConfig();
  
  useEffect(() => {
    fetchOpenAIConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Logs
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  OpenAI Integration
                </CardTitle>
                <CardDescription>
                  Configure the AI features for data extraction from invoices, homeowner requests and leads
                </CardDescription>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowConfigDialog(true)}
                >
                  {hasOpenAIKey ? 'Configure' : 'Connect OpenAI'}
                </Button>
                
                {hasOpenAIKey && (
                  <TestOpenAIButton />
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {lastError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Integration Error</AlertTitle>
                  <AlertDescription>
                    {lastError}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-model">Default AI Model</Label>
                  <Select
                    value={openAIModel}
                    onValueChange={setOpenAIModel}
                    disabled={!hasOpenAIKey}
                  >
                    <SelectTrigger id="ai-model">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini (Fast & Efficient)</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4o (Powerful)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="h-10 flex items-center">
                    {hasOpenAIKey ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        Connected
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1">
                        <span className="relative flex h-3 w-3">
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                        </span>
                        Not Connected
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Data Classification Features</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-2">
                    <div className="rounded-full bg-blue-100 p-1.5">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h5 className="text-sm font-medium">Invoice Analysis</h5>
                      <p className="text-xs text-muted-foreground">Extract vendor, amounts, dates and line items</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className="rounded-full bg-blue-100 p-1.5">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h5 className="text-sm font-medium">Request Classification</h5>
                      <p className="text-xs text-muted-foreground">Categorize and prioritize homeowner requests</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className="rounded-full bg-blue-100 p-1.5">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h5 className="text-sm font-medium">Lead Information</h5>
                      <p className="text-xs text-muted-foreground">Extract contact details and requirements</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs">
          <LogViewer initialFunction="generate-response" />
        </TabsContent>
      </Tabs>
      
      <IntegrationConfigDialog
        open={showConfigDialog}
        onOpenChange={setShowConfigDialog}
        selectedIntegration="OpenAI"
        configFields={configFields}
        onConfigFieldChange={handleConfigFieldChange}
        openAIModel={openAIModel}
        onOpenAIModelChange={setOpenAIModel}
        onSave={saveOpenAIConfig}
        hasOpenAIKey={hasOpenAIKey}
        isPending={isPending}
      />
    </div>
  );
};

export default AISettingsSection;
