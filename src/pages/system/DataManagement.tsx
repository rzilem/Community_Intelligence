
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Database, Download, Upload, Network, RefreshCw, Search, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Import components from both original pages
import ImportTabContent from '@/components/data-import/ImportTabContent';
import ExportDataTemplates from '@/components/data-import/ExportDataTemplates';
import ImportDataMappingModal from '@/components/data-import/ImportDataMappingModal';
import { useImportState } from '@/hooks/import-export/useImportState';
import { useFileUploadHandler } from '@/hooks/import-export/useFileUploadHandler';
import AssociationStats from '@/components/associations/AssociationStats';
import AssociationToolbar from '@/components/associations/AssociationToolbar';
import AssociationTabs from '@/components/associations/AssociationTabs';
import AssociationBulkActions from '@/components/associations/AssociationBulkActions';
import { useAssociationsList, useAssociationMutations } from '@/hooks/associations';
import { toast } from 'sonner';
import { Association } from '@/types/association-types';
import { AssociationFormData } from '@/components/associations/AssociationForm';
import { LoadingState } from '@/components/ui/loading-state';
import SuccessAnimation from '@/components/ui/success-animation';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

const DataManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssociations, setSelectedAssociations] = useState<Association[]>([]);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Import state for data import/export functionality
  const {
    selectedAssociationId,
    showMappingModal,
    validationResults,
    importResults,
    importFile,
    importData,
    importType,
    isValidating,
    isImporting,
    setShowMappingModal,
    setImportFile,
    setImportData,
    setImportType,
    handleAssociationChange,
    resetImportState,
    validateData,
    importDataWithMapping
  } = useImportState();

  // File upload handler for import functionality
  const { handleFileUpload } = useFileUploadHandler({
    setImportFile,
    setImportData,
    setImportType,
    validateData,
    selectedAssociationId
  });

  // Association list and mutations
  const { 
    associations, 
    isLoading, 
    error,
    manuallyRefresh 
  } = useAssociationsList();
  
  const { 
    createAssociation,
    isCreating,
    updateAssociation,
    isUpdating,
    deleteAssociation,
    isDeleting
  } = useAssociationMutations();
  
  // Process associations for display
  const associationsArray = Array.isArray(associations) ? associations : [];
  
  const filteredAssociations = associationsArray.filter(
    association => association.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   (association.address && association.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const activeAssociations = filteredAssociations.filter(a => !a.is_archived);
  const inactiveAssociations = filteredAssociations.filter(a => a.is_archived);
  
  // Handlers for association operations
  const handleSaveAssociation = (data: AssociationFormData) => {
    const newAssociation = {
      name: data.name,
      property_type: data.type,
      total_units: data.units,
      city: data.city,
      state: data.state,
      address: data.address,
      zip: data.zipCode,
      phone: data.phone,
      contact_email: data.email
    };
    
    createAssociation(newAssociation);
    showSuccessNotification(`Association "${data.name}" created successfully`);
  };
  
  const handleEditAssociation = (id: string, data: Partial<Association>) => {
    updateAssociation({ id, data });
    showSuccessNotification("Association updated successfully");
  };
  
  const handleDeleteAssociation = (id: string) => {
    deleteAssociation(id);
    showSuccessNotification("Association archived successfully");
  };

  const handleBulkArchive = (ids: string[]) => {
    Promise.all(ids.map(id => updateAssociation({ id, data: { is_archived: true } })))
      .then(() => {
        setSelectedAssociations([]);
        showSuccessNotification(`${ids.length} associations archived successfully`);
      });
  };

  const handleBulkRestore = (ids: string[]) => {
    Promise.all(ids.map(id => updateAssociation({ id, data: { is_archived: false } })))
      .then(() => {
        setSelectedAssociations([]);
        showSuccessNotification(`${ids.length} associations restored successfully`);
      });
  };

  const handleBulkDelete = (ids: string[]) => {
    Promise.all(ids.map(id => deleteAssociation(id)))
      .then(() => {
        setSelectedAssociations([]);
        showSuccessNotification(`${ids.length} associations deleted successfully`);
      });
  };

  const showSuccessNotification = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessAnimation(true);
    toast.success(message);
  };

  const handleToggleSelectAssociation = (association: Association) => {
    setSelectedAssociations(prev => {
      const isSelected = prev.some(a => a.id === association.id);
      if (isSelected) {
        return prev.filter(a => a.id !== association.id);
      } else {
        return [...prev, association];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedAssociations.length === filteredAssociations.length) {
      setSelectedAssociations([]);
    } else {
      setSelectedAssociations([...filteredAssociations]);
    }
  };

  const handleViewAssociationProfile = (id: string) => {
    navigate(`/system/associations/${id}`);
  };

  return (
    <PageTemplate 
      title="Data Management" 
      icon={<Database className="h-8 w-8" />}
      description="Manage associations, import data, and export templates."
      actions={
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                onClick={manuallyRefresh}
                disabled={isLoading}
                className="hover:scale-105 transition-transform duration-200"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh data</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      }
    >
      {showSuccessAnimation && (
        <SuccessAnimation 
          text={successMessage} 
          onComplete={() => setShowSuccessAnimation(false)}
        />
      )}

      <Tabs defaultValue="associations" className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full md:w-auto">
          <TabsTrigger value="associations" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            <span className="hidden sm:inline">Associations</span>
            <span className="inline sm:hidden">Assoc.</span>
          </TabsTrigger>
          <TabsTrigger value="import-export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Import & Export</span>
            <span className="inline sm:hidden">I/E</span>
          </TabsTrigger>
        </TabsList>

        {/* Associations Tab Content */}
        <TabsContent value="associations" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-6 flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search associations (Ctrl + /)" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <AssociationToolbar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  onRefresh={manuallyRefresh}
                  isLoading={isLoading}
                  isCreating={isCreating}
                  onSaveAssociation={handleSaveAssociation}
                  onSelectAll={handleSelectAll}
                  selectedCount={selectedAssociations.length}
                  totalCount={filteredAssociations.length}
                />
              </div>
              
              <AssociationBulkActions 
                selectedAssociations={selectedAssociations}
                onArchive={handleBulkArchive}
                onRestore={handleBulkRestore}
                onDelete={handleBulkDelete}
                onClearSelection={() => setSelectedAssociations([])}
                isLoading={isUpdating || isDeleting}
              />
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                  <p className="text-red-700 flex items-center">
                    <Search className="inline-block mr-2 h-5 w-5" />
                    {error.message || "An error occurred while loading associations"}
                  </p>
                </div>
              )}
              
              {isLoading ? (
                <LoadingState variant="skeleton" count={3} />
              ) : filteredAssociations.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-md">
                  <Network className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No associations found</p>
                  <Button className="mt-4" onClick={() => document.getElementById('create-association-button')?.click()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Association
                  </Button>
                </div>
              ) : (
                <AssociationTabs
                  error={error}
                  filteredAssociations={filteredAssociations}
                  activeAssociations={activeAssociations}
                  inactiveAssociations={inactiveAssociations}
                  isLoading={isLoading}
                  onEdit={handleEditAssociation}
                  onDelete={handleDeleteAssociation}
                  onToggleSelect={handleToggleSelectAssociation}
                  selectedAssociations={selectedAssociations}
                  onViewProfile={handleViewAssociationProfile}
                />
              )}
            </CardContent>
          </Card>
          
          <AssociationStats associations={associationsArray} isLoading={isLoading} />
        </TabsContent>

        {/* Import & Export Tab Content */}
        <TabsContent value="import-export" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Data Transfer</CardTitle>
                  <CardDescription>
                    Import data from CSV or Excel files, or export data templates and reports
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Tabs defaultValue="import" className="space-y-4">
            <TabsList>
              <TabsTrigger value="import">
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </TabsTrigger>
              <TabsTrigger value="export">
                <Download className="h-4 w-4 mr-2" />
                Export Templates
              </TabsTrigger>
            </TabsList>

            <TabsContent value="import">
              <ImportTabContent
                associationId={selectedAssociationId}
                importFile={importFile}
                importResults={importResults}
                isValidating={isValidating}
                isImporting={isImporting}
                onFileUpload={handleFileUpload}
                onImportAnother={resetImportState}
                onAssociationChange={handleAssociationChange}
              />
            </TabsContent>

            <TabsContent value="export">
              <ExportDataTemplates associationId={selectedAssociationId} />
            </TabsContent>
          </Tabs>

          {showMappingModal && (
            <ImportDataMappingModal
              importType={importType}
              fileData={importData}
              associationId={selectedAssociationId}
              validationResults={validationResults || undefined}
              onClose={() => setShowMappingModal(false)}
              onConfirm={importDataWithMapping}
            />
          )}
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

export default DataManagement;
