
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MERGE_TAGS, 
  MergeTag, 
  getMergeTagsByCategory, 
  MergeTagCategory 
} from '@/utils/mergeTags';

interface MergeTagsPopoverProps {
  onSelectTag: (tag: string) => void;
}

const MergeTagsPopover: React.FC<MergeTagsPopoverProps> = ({ onSelectTag }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const categories: { id: MergeTagCategory; name: string; }[] = [
    { id: 'resident', name: 'Resident' },
    { id: 'property', name: 'Property' },
    { id: 'association', name: 'Association' },
    { id: 'date', name: 'Date' },
    { id: 'payment', name: 'Payment' },
    { id: 'compliance', name: 'Compliance' }
  ];
  
  const filteredTags = searchTerm 
    ? MERGE_TAGS.filter(tag => 
        tag.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        tag.description.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];
  
  const handleSelectTag = (tag: MergeTag) => {
    onSelectTag(`{${tag.id}}`);
  };
  
  return (
    <div className="w-[400px] p-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search merge tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      
      {searchTerm ? (
        <div>
          <h3 className="font-medium mb-2">Search Results</h3>
          <ScrollArea className="h-[300px]">
            <div className="space-y-1">
              {filteredTags.length > 0 ? (
                filteredTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleSelectTag(tag)}
                    className="w-full text-left p-2 hover:bg-muted rounded-md flex items-start"
                  >
                    <div>
                      <p className="font-medium">{tag.name}</p>
                      <p className="text-sm text-muted-foreground">{tag.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">Example: {tag.example}</p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-muted-foreground p-2">No merge tags found.</p>
              )}
            </div>
          </ScrollArea>
        </div>
      ) : (
        <Tabs defaultValue="resident">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            {categories.slice(0, 3).map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsList className="w-full grid grid-cols-3 mb-4">
            {categories.slice(3).map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <ScrollArea className="h-[300px]">
                <div className="space-y-1">
                  {getMergeTagsByCategory(category.id).map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleSelectTag(tag)}
                      className="w-full text-left p-2 hover:bg-muted rounded-md flex items-start"
                    >
                      <div>
                        <p className="font-medium">{tag.name}</p>
                        <p className="text-sm text-muted-foreground">{tag.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">Example: {tag.example}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default MergeTagsPopover;
