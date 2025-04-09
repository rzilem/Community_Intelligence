
import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Network } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useAssociations } from '@/hooks/associations';
import AssociationTable from '@/components/associations/AssociationTable';
import AssociationStats from '@/components/associations/AssociationStats';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Associations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    associations, 
    isLoading, 
    error,
    manuallyRefresh 
  } = useAssociations();
  
  const filteredAssociations = associations.filter(
    association => association.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   (association.address && association.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const activeAssociations = filteredAssociations.filter(a => !a.is_archived);
  const inactiveAssociations = filteredAssociations.filter(a => a.is_archived);

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Network className="h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">Associations</h1>
          </div>
        </div>
        
        <p className="text-muted-foreground">Manage community associations and client organizations.</p>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
              <div className="relative flex-1">
                <Input
                  placeholder="Search associations..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={manuallyRefresh}
                  disabled={isLoading}
                  title="Refresh association list"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  There was a problem loading associations. Please try refreshing.
                </AlertDescription>
              </Alert>
            )}
            
            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">
                  All
                  <span className="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
                    {filteredAssociations.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="active">
                  Active
                  <span className="ml-1.5 rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs">
                    {activeAssociations.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="inactive">
                  Inactive
                  <span className="ml-1.5 rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-xs">
                    {inactiveAssociations.length}
                  </span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <AssociationTable associations={filteredAssociations} isLoading={isLoading} />
              </TabsContent>
              
              <TabsContent value="active">
                <AssociationTable associations={activeAssociations} isLoading={isLoading} />
              </TabsContent>
              
              <TabsContent value="inactive">
                <AssociationTable associations={inactiveAssociations} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <AssociationStats associations={associations} isLoading={isLoading} />
      </div>
    </AppLayout>
  );
};

export default Associations;
