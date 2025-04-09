
import React from 'react';
import { Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { LetterTemplate } from '@/types/letter-template-types';

interface LetterTemplateListProps {
  templates: LetterTemplate[];
  onSelectTemplate: (template: LetterTemplate) => void;
}

const LetterTemplateList: React.FC<LetterTemplateListProps> = ({
  templates,
  onSelectTemplate
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      <div className="space-y-2">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map(template => (
            <div
              key={template.id}
              className="flex items-start gap-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelectTemplate(template)}
            >
              <Mail className="h-5 w-5 text-gray-500 mt-1" />
              <div>
                <h3 className="font-medium">{template.name}</h3>
                <p className="text-sm text-gray-500">{template.description}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            No templates found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default LetterTemplateList;
