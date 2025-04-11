
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NoteType } from '@/components/homeowners/detail/types';

interface HomeownerTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeNotesTab: string;
  setActiveNotesTab: (tab: string) => void;
  notes: NoteType[];
}

export const HomeownerTabs: React.FC<HomeownerTabsProps> = ({
  activeTab,
  setActiveTab,
  activeNotesTab,
  setActiveNotesTab,
  notes
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-6 mb-8">
        <TabsTrigger value="Summary">Summary</TabsTrigger>
        <TabsTrigger value="Property">Property</TabsTrigger>
        <TabsTrigger value="Financial">Financial</TabsTrigger>
        <TabsTrigger value="Communications">Communications</TabsTrigger>
        <TabsTrigger value="Documents">Documents</TabsTrigger>
        <TabsTrigger value="Notes">Notes</TabsTrigger>
      </TabsList>

      <TabsContent value="Summary">
        <Card>
          <CardContent className="p-6 w-full max-w-full min-h-[200px] max-h-[400px] overflow-y-auto">
            <h2>Homeowner Summary Content</h2>
            <p>Summary information would appear here.</p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="Property">
        <Card>
          <CardContent className="p-6">
            <h2>Property Information</h2>
            <p>Property details would appear here.</p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="Financial">
        <Card>
          <CardContent className="p-6">
            <h2>Financial Information</h2>
            <p>Financial details would appear here.</p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="Communications">
        <Card>
          <CardContent className="p-6">
            <h2>Communications History</h2>
            <p>Communication logs would appear here.</p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="Documents">
        <Card>
          <CardContent className="p-6">
            <h2>Homeowner Documents</h2>
            <p>Document list would appear here.</p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="Notes">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-semibold">Notes</h2>
                <p className="text-muted-foreground text-sm">Internal notes and activity logs about this homeowner</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search notes..." 
                    className="pl-9 w-[250px]"
                  />
                </div>
                <Button className="flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Add Note
                </Button>
              </div>
            </div>

            <div className="border-b mb-6">
              <div className="flex gap-4">
                <button
                  className={`pb-2 px-1 font-medium text-sm ${
                    activeNotesTab === 'Manual Notes' 
                      ? 'border-b-2 border-primary' 
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => setActiveNotesTab('Manual Notes')}
                >
                  Manual Notes
                </button>
                <button
                  className={`pb-2 px-1 font-medium text-sm ${
                    activeNotesTab === 'Activity Log' 
                      ? 'border-b-2 border-primary' 
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => setActiveNotesTab('Activity Log')}
                >
                  Activity Log
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {notes.map((note, index) => (
                <div key={index} className="border rounded-md p-4">
                  <div className="flex justify-between">
                    <h3 className="font-semibold">{note.type === 'system' ? 'System' : note.author}</h3>
                    <span className="text-sm text-muted-foreground">{note.date}</span>
                  </div>
                  <p className="mt-2">{note.content}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Activity logs are automatically generated and cannot be modified
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
