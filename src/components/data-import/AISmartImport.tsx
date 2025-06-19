
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Database, FileArchive, Zap } from 'lucide-react';
import DocumentStorageUploader from './DocumentStorageUploader';

const AISmartImport: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          AI-Powered Smart Import
          <Badge variant="secondary" className="ml-2">Beta</Badge>
        </CardTitle>
        <CardDescription>
          Advanced import capabilities powered by AI for different types of data structures
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="documents" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileArchive className="h-4 w-4" />
              Document Archives
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-4">
            <div className="flex items-start gap-2 p-4 bg-blue-50 rounded-lg">
              <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Hierarchical Document Import</h4>
                <p className="text-sm text-blue-700">
                  Perfect for importing organized document collections with folder structures like:
                  Association → Units → Communication Types → Documents
                </p>
              </div>
            </div>
            <DocumentStorageUploader />
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <div className="flex items-start gap-2 p-4 bg-green-50 rounded-lg">
              <Database className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Structured Data Import</h4>
                <p className="text-sm text-green-700">
                  For importing tabular data like resident lists, property information, 
                  assessments, and other structured datasets.
                </p>
              </div>
            </div>
            <div className="text-center py-8 text-gray-500">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Traditional data import functionality</p>
              <p className="text-sm">Available in the "Single File Import" tab</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AISmartImport;
