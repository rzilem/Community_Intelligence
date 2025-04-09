
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DocumentTab } from '@/types/document-types';

interface DocumentHeaderProps {
  activeTab: DocumentTab;
  onTabChange: (value: DocumentTab) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onUploadClick: () => void;
  isUploadDisabled: boolean;
}

const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
  onUploadClick,
  isUploadDisabled
}) => {
  return (
    <div className="flex flex-col space-y-4">
      {/* Tabs */}
      <Tabs defaultValue={activeTab} onValueChange={(value) => onTabChange(value as DocumentTab)}>
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="templates">HTML Templates</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search and upload */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <Input
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="sm:max-w-sm"
        />
        <Button 
          onClick={onUploadClick}
          disabled={isUploadDisabled}
        >
          <Plus className="mr-2 h-4 w-4" /> Upload
        </Button>
      </div>
    </div>
  );
};

export default DocumentHeader;
