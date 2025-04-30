
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddNoteDialog } from './AddNoteDialog';
import { NoteType } from './types';

interface HomeownerTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeNotesTab: string;
  setActiveNotesTab: (tab: string) => void;
  notes?: NoteType[];
  onAddNote?: (note: Omit<NoteType, 'date'>) => void;
  homeownerId: string;
}

export const HomeownerTabs: React.FC<HomeownerTabsProps> = ({
  activeTab,
  setActiveTab,
  activeNotesTab,
  setActiveNotesTab,
  notes = [],
  onAddNote,
  homeownerId
}) => {
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false);

  const manualNotes = notes?.filter(note => note.type === 'manual') || [];
  const systemNotes = notes?.filter(note => note.type === 'system') || [];

  const handleAddNote = (note: Omit<NoteType, 'date'>) => {
    if (onAddNote) {
      onAddNote(note);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="Summary">Summary</TabsTrigger>
          <TabsTrigger value="Notes">Notes</TabsTrigger>
          <TabsTrigger value="Financial">Financial</TabsTrigger>
          <TabsTrigger value="Documents">Documents</TabsTrigger>
          <TabsTrigger value="History">History</TabsTrigger>
        </TabsList>
        
        {activeTab === 'Notes' && (
          <Button size="sm" onClick={() => setIsAddNoteDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        )}
      </div>

      <TabsContent value="Summary" className="space-y-4">
        <div className="bg-muted p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Homeowner Summary</h3>
          <p>This section will contain an overview of the homeowner's information and activity.</p>
        </div>
      </TabsContent>

      <TabsContent value="Notes" className="space-y-4">
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="border-b">
            <div className="flex">
              <button
                className={`px-4 py-2 ${activeNotesTab === 'Manual Notes' ? 'bg-primary text-primary-foreground' : 'bg-muted/30 hover:bg-muted/50'}`}
                onClick={() => setActiveNotesTab('Manual Notes')}
              >
                Manual Notes ({manualNotes.length})
              </button>
              <button
                className={`px-4 py-2 ${activeNotesTab === 'System Notes' ? 'bg-primary text-primary-foreground' : 'bg-muted/30 hover:bg-muted/50'}`}
                onClick={() => setActiveNotesTab('System Notes')}
              >
                System Notes ({systemNotes.length})
              </button>
            </div>
          </div>
          
          <div className="p-4">
            {activeNotesTab === 'Manual Notes' ? (
              manualNotes.length > 0 ? (
                <div className="space-y-4">
                  {manualNotes.map((note, index) => (
                    <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <p className="font-medium">{note.author}</p>
                        <span className="text-sm text-gray-500">{new Date(note.date).toLocaleString()}</span>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>No manual notes available</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setIsAddNoteDialogOpen(true)}
                  >
                    Add the first note
                  </Button>
                </div>
              )
            ) : (
              systemNotes.length > 0 ? (
                <div className="space-y-4">
                  {systemNotes.map((note, index) => (
                    <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-gray-500">System</p>
                        <span className="text-sm text-gray-500">{new Date(note.date).toLocaleString()}</span>
                      </div>
                      <p className="mt-1 text-gray-600">{note.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>No system notes available</p>
                </div>
              )
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="Financial" className="space-y-4">
        <div className="bg-muted p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Financial Information</h3>
          <p>This section will display financial records and history.</p>
        </div>
      </TabsContent>

      <TabsContent value="Documents" className="space-y-4">
        <div className="bg-muted p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Documents</h3>
          <p>This section will contain uploaded documents and forms.</p>
        </div>
      </TabsContent>

      <TabsContent value="History" className="space-y-4">
        <div className="bg-muted p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Activity History</h3>
          <p>This section will show a timeline of all homeowner activity.</p>
        </div>
      </TabsContent>

      <AddNoteDialog
        isOpen={isAddNoteDialogOpen}
        onClose={() => setIsAddNoteDialogOpen(false)}
        onAddNote={handleAddNote}
        homeownerId={homeownerId}
      />
    </Tabs>
  );
};
