
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MERGE_TAGS, MergeTag, MergeTagCategory } from '@/utils/mergeTags';

interface MergeTagsPopoverProps {
  onSelectTag: (tag: string) => void;
}

const MergeTagsPopover: React.FC<MergeTagsPopoverProps> = ({ onSelectTag }) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<MergeTagCategory>('resident');

  const categories: MergeTagCategory[] = ['resident', 'property', 'association', 'payment', 'compliance'];
  
  const filteredTags = MERGE_TAGS[activeTab].filter(tag => 
    tag.tag.toLowerCase().includes(search.toLowerCase()) ||
    tag.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Search className="h-4 w-4" />
          Insert Merge Tag
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4" align="start">
        <div className="space-y-4">
          <Input
            placeholder="Search merge tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2"
          />
          
          <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as MergeTagCategory)}>
            <TabsList className="w-full">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="capitalize"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {categories.map((category) => (
              <TabsContent key={category} value={category}>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-2">
                    {filteredTags.map((tag) => (
                      <button
                        key={tag.tag}
                        onClick={() => onSelectTag(tag.tag)}
                        className="w-full p-2 text-left hover:bg-muted rounded-md transition-colors"
                      >
                        <div className="font-medium">{tag.tag}</div>
                        <div className="text-sm text-muted-foreground">
                          {tag.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MergeTagsPopover;
