import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Code, Download, Upload, Key, Settings, Database, FileDown, FileUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  created: string;
  lastUsed?: string;
  isActive: boolean;
}

interface ImportExportJob {
  id: string;
  type: 'import' | 'export';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileName: string;
  recordCount?: number;
  errorMessage?: string;
  startTime: string;
  completedTime?: string;
}

const VendorAPIManagement: React.FC = () => {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Main API Key',
      key: 'vk_1234567890abcdef',
      permissions: ['read', 'write'],
      created: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      isActive: true
    }
  ]);
  
  const [importExportJobs, setImportExportJobs] = useState<ImportExportJob[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['read']);

  const availablePermissions = [
    { id: 'read', label: 'Read Vendors' },
    { id: 'write', label: 'Create/Update Vendors' },
    { id: 'delete', label: 'Delete Vendors' },
    { id: 'analytics', label: 'Access Analytics' },
    { id: 'integrations', label: 'Manage Integrations' }
  ];

  const generateAPIKey = () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Key Name Required",
        description: "Please enter a name for the API key",
        variant: "destructive"
      });
      return;
    }

    const newKey: APIKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `vk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      permissions: selectedPermissions,
      created: new Date().toISOString(),
      isActive: true
    };

    setApiKeys(prev => [...prev, newKey]);
    setNewKeyName('');
    setSelectedPermissions(['read']);
    
    toast({
      title: "API Key Generated",
      description: `New API key "${newKey.name}" has been created`
    });
  };

  const revokeAPIKey = (keyId: string) => {
    setApiKeys(prev => prev.map(key => 
      key.id === keyId ? { ...key, isActive: false } : key
    ));
    toast({
      title: "API Key Revoked",
      description: "The API key has been deactivated"
    });
  };

  const exportVendorData = async (format: 'csv' | 'json' | 'xlsx') => {
    const job: ImportExportJob = {
      id: Date.now().toString(),
      type: 'export',
      status: 'processing',
      fileName: `vendors_export_${new Date().toISOString().split('T')[0]}.${format}`,
      startTime: new Date().toISOString()
    };

    setImportExportJobs(prev => [job, ...prev]);

    // Simulate export process
    setTimeout(() => {
      setImportExportJobs(prev => prev.map(j => 
        j.id === job.id ? {
          ...j,
          status: 'completed',
          completedTime: new Date().toISOString(),
          recordCount: Math.floor(Math.random() * 500) + 50
        } : j
      ));

      toast({
        title: "Export Completed",
        description: `Vendor data exported to ${job.fileName}`
      });
    }, 3000);
  };

  const importVendorData = async (file: File) => {
    const job: ImportExportJob = {
      id: Date.now().toString(),
      type: 'import',
      status: 'processing',
      fileName: file.name,
      startTime: new Date().toISOString()
    };

    setImportExportJobs(prev => [job, ...prev]);

    // Simulate import process
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate
      
      setImportExportJobs(prev => prev.map(j => 
        j.id === job.id ? {
          ...j,
          status: success ? 'completed' : 'failed',
          completedTime: new Date().toISOString(),
          recordCount: success ? Math.floor(Math.random() * 200) + 10 : undefined,
          errorMessage: success ? undefined : 'Invalid data format in row 15'
        } : j
      ));

      toast({
        title: success ? "Import Completed" : "Import Failed",
        description: success ? 
          `Successfully imported vendor data from ${file.name}` :
          `Failed to import ${file.name}. Check the job details for more information`,
        variant: success ? "default" : "destructive"
      });
    }, 4000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importVendorData(file);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'processing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Vendor API & Data Management
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="api-keys" className="w-full">
        <TabsList>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="import-export">Import/Export</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="backup">Backup & Migration</TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="space-y-4">
          {/* Generate New API Key */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generate New API Key</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="keyName">API Key Name</Label>
                  <Input
                    id="keyName"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Mobile App Integration"
                  />
                </div>
                <div>
                  <Label>Permissions</Label>
                  <Select 
                    value={selectedPermissions[0]} 
                    onValueChange={(value) => setSelectedPermissions([value])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select permissions" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePermissions.map(perm => (
                        <SelectItem key={perm.id} value={perm.id}>
                          {perm.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={generateAPIKey}>
                <Key className="h-4 w-4 mr-2" />
                Generate API Key
              </Button>
            </CardContent>
          </Card>

          {/* Existing API Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Existing API Keys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map(key => (
                  <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{key.name}</h3>
                        <Badge variant={key.isActive ? "default" : "secondary"}>
                          {key.isActive ? "Active" : "Revoked"}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Key: {key.key}</p>
                        <p>Created: {new Date(key.created).toLocaleDateString()}</p>
                        {key.lastUsed && (
                          <p>Last used: {new Date(key.lastUsed).toLocaleDateString()}</p>
                        )}
                        <div className="flex gap-1">
                          {key.permissions.map(perm => (
                            <Badge key={perm} variant="outline" className="text-xs">
                              {availablePermissions.find(p => p.id === perm)?.label || perm}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {key.isActive && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => revokeAPIKey(key.id)}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import-export" className="space-y-4">
          {/* Export Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileDown className="h-5 w-5" />
                Export Vendor Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button onClick={() => exportVendorData('csv')} variant="outline">
                  Export CSV
                </Button>
                <Button onClick={() => exportVendorData('json')} variant="outline">
                  Export JSON
                </Button>
                <Button onClick={() => exportVendorData('xlsx')} variant="outline">
                  Export Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Import Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileUp className="h-5 w-5" />
                Import Vendor Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fileUpload">Select File</Label>
                  <Input
                    id="fileUpload"
                    type="file"
                    accept=".csv,.json,.xlsx"
                    onChange={handleFileUpload}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Supported formats: CSV, JSON, Excel (.xlsx)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Import/Export History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {importExportJobs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No import/export jobs yet
                  </p>
                ) : (
                  importExportJobs.map(job => (
                    <div key={job.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        {job.type === 'import' ? 
                          <Upload className="h-4 w-4" /> : 
                          <Download className="h-4 w-4" />
                        }
                        <div>
                          <p className="font-medium">{job.fileName}</p>
                          <p className="text-sm text-muted-foreground">
                            {job.type === 'import' ? 'Import' : 'Export'} • {new Date(job.startTime).toLocaleString()}
                          </p>
                          {job.recordCount && (
                            <p className="text-sm text-muted-foreground">
                              {job.recordCount} records processed
                            </p>
                          )}
                          {job.errorMessage && (
                            <p className="text-sm text-red-600">{job.errorMessage}</p>
                          )}
                        </div>
                      </div>
                      
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Third-Party Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'QuickBooks', status: 'connected', description: 'Sync vendor payments and invoices' },
                    { name: 'ServiceTitan', status: 'available', description: 'Import service providers and schedules' },
                    { name: 'Angie\'s List', status: 'available', description: 'Access pre-screened contractors' },
                    { name: 'HomeAdvisor', status: 'available', description: 'Find and compare local pros' }
                  ].map(integration => (
                    <Card key={integration.name}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{integration.name}</h3>
                          <Badge variant={integration.status === 'connected' ? 'default' : 'outline'}>
                            {integration.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {integration.description}
                        </p>
                        <Button 
                          size="sm" 
                          variant={integration.status === 'connected' ? 'outline' : 'default'}
                        >
                          {integration.status === 'connected' ? 'Configure' : 'Connect'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup & Migration Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Create Backup</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Generate a complete backup of all vendor data and relationships
                    </p>
                    <Button className="w-full">Create Full Backup</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Restore Data</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Restore vendor data from a previous backup file
                    </p>
                    <Button variant="outline" className="w-full">Select Backup File</Button>
                  </CardContent>
                </Card>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Migration Assistant</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Migrate vendor data from other systems or formats
                </p>
                <div className="flex gap-2">
                  <Button variant="outline">From Excel</Button>
                  <Button variant="outline">From Other HOA Systems</Button>
                  <Button variant="outline">Custom Migration</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorAPIManagement;
