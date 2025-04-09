
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Printer } from 'lucide-react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import PrintQueueTabs from '@/components/operations/PrintQueueTabs';
import PrintQueueActions from '@/components/operations/PrintQueueActions';
import PrintJobsTable from '@/components/operations/PrintJobsTable';
import PrintSettings from '@/components/operations/PrintSettings';
import { PrintJob, PrintSettings as PrintSettingsType } from '@/types/print-queue-types';

const PrintQueue = () => {
  // State for tabs
  const [activeTab, setActiveTab] = useState('queue');

  // State for selected jobs
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  // State for print settings
  const [printSettings, setPrintSettings] = useState<PrintSettingsType>({
    defaultPrinter: 'Main Office Printer',
    doubleSided: true,
    includeMailingLabels: false,
    previewBeforePrint: false,
  });

  // Mock data for print jobs
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([
    {
      id: '1',
      name: 'HOA Meeting Minutes - March 2023.pdf',
      type: 'Board Documents',
      association_name: 'Sunset Heights HOA',
      association_id: '123',
      pages: 12,
      copies: 25,
      status: 'pending',
      certified: false,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Annual Budget Report 2023.pdf',
      type: 'Financial Documents',
      association_name: 'Sunset Heights HOA',
      association_id: '123',
      pages: 35,
      copies: 15,
      status: 'printing',
      certified: true,
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Community Newsletter - Spring 2023.pdf',
      type: 'Communications',
      association_name: 'Sunset Heights HOA',
      association_id: '123',
      pages: 8,
      copies: 200,
      status: 'completed',
      certified: false,
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Violation Notices - Batch March 15.pdf',
      type: 'Compliance',
      association_name: 'Sunset Heights HOA',
      association_id: '123',
      pages: 45,
      copies: 1,
      status: 'failed',
      certified: true,
      created_at: new Date().toISOString(),
    },
  ]);

  // Event handlers
  const handleDeleteJob = (jobId: string) => {
    setPrintJobs(printJobs.filter(job => job.id !== jobId));
    setSelectedJobs(selectedJobs.filter(id => id !== jobId));
    toast.success('Print job removed from queue');
  };

  const handleReprintJob = (jobId: string) => {
    setPrintJobs(printJobs.map(job => 
      job.id === jobId 
        ? { ...job, status: 'pending', completed_at: undefined } 
        : job
    ));
    toast.success('Job added back to print queue');
  };

  const handlePrint = () => {
    if (selectedJobs.length === 0) return;
    
    toast.success(`Printing ${selectedJobs.length} job(s)`);
    
    // Update status of selected jobs to 'printing'
    setPrintJobs(printJobs.map(job => 
      selectedJobs.includes(job.id) 
        ? { ...job, status: 'printing' } 
        : job
    ));
    
    // Clear selection after print
    setSelectedJobs([]);
  };

  const handleSendToMailers = () => {
    if (selectedJobs.length === 0) return;
    toast.success(`Sending ${selectedJobs.length} job(s) to HOA mailers`);
    setSelectedJobs([]);
  };

  const handleExport = () => {
    if (selectedJobs.length === 0) return;
    toast.success(`Exporting ${selectedJobs.length} job(s)`);
    setSelectedJobs([]);
  };

  return (
    <PageTemplate 
      title="Print Queue" 
      icon={<Printer className="h-8 w-8" />}
      description="Manage batch printing jobs for community mailings."
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Print Queue Management</h2>
          <p className="text-muted-foreground">
            View, organize, and process batch print jobs for your community
          </p>
        </div>

        <PrintQueueTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
        
        <Tabs value={activeTab} className="space-y-4">
          <TabsContent value="queue" className="space-y-4">
            <PrintQueueActions 
              includeMailingLabels={printSettings.includeMailingLabels}
              setIncludeMailingLabels={(value) => 
                setPrintSettings({...printSettings, includeMailingLabels: value})
              }
              printPreview={printSettings.previewBeforePrint}
              setPrintPreview={(value) => 
                setPrintSettings({...printSettings, previewBeforePrint: value})
              }
              onPrint={handlePrint}
              onSendToMailers={handleSendToMailers}
              onExport={handleExport}
              selectedJobsCount={selectedJobs.length}
            />

            <PrintJobsTable 
              jobs={printJobs}
              onDelete={handleDeleteJob}
              onReprint={handleReprintJob}
              selectedJobs={selectedJobs}
              setSelectedJobs={setSelectedJobs}
            />
          </TabsContent>
          
          <TabsContent value="jobs" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              Print job history will be displayed here.
            </div>
          </TabsContent>
          
          <TabsContent value="thirdParty" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              Third party print orders will be displayed here.
            </div>
          </TabsContent>
        </Tabs>
        
        <PrintSettings 
          defaultPrinter={printSettings.defaultPrinter}
          setDefaultPrinter={(printer) => 
            setPrintSettings({...printSettings, defaultPrinter: printer})
          }
          doubleSided={printSettings.doubleSided}
          setDoubleSided={(value) => 
            setPrintSettings({...printSettings, doubleSided: value})
          }
        />
      </div>
    </PageTemplate>
  );
};

export default PrintQueue;
