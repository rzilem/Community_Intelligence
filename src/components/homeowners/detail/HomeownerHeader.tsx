
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ProfileImageUpload from '@/components/users/ProfileImageUpload';

interface HomeownerTag {
  tag: string;
  color: string;
}

interface HomeownerHeaderProps {
  id: string;
  name: string;
  status: string;
  tags: string[];
  violations: string[];
  avatarUrl: string;
  onProfileImageUpdated: (newUrl: string) => void;
}

const getTagColor = (tag: string) => {
  const tagColors: Record<string, string> = {
    'Board Member': 'bg-blue-100 text-blue-800 border-blue-200',
    'New Resident': 'bg-purple-100 text-purple-800 border-purple-200',
    'Delinquent': 'bg-red-100 text-red-800 border-red-200',
    'Landscaping Violation': 'bg-orange-100 text-orange-800 border-orange-200',
    'ARC Pending': 'bg-violet-100 text-violet-800 border-violet-200'
  };
  
  return tagColors[tag] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const HomeownerHeader: React.FC<HomeownerHeaderProps> = ({ 
  id, 
  name, 
  status, 
  tags, 
  violations, 
  avatarUrl,
  onProfileImageUpdated
}) => {
  return (
    <div className="flex items-center gap-4">
      <ProfileImageUpload
        userId={id}
        imageUrl={avatarUrl}
        firstName={name.split(' ')[0]}
        lastName={name.split(' ')[1] || ''}
        onImageUpdated={onProfileImageUpdated}
        size="lg"
      />
      
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{name}</h1>
          <Badge className="bg-green-100 text-green-800 border border-green-200 rounded-full px-3 py-1 ml-4">
            {status}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map(tag => (
            <Badge 
              key={tag} 
              variant="outline" 
              className={`rounded-full px-3 py-1 flex items-center gap-1 ${getTagColor(tag)}`}
            >
              <span className="h-2 w-2 rounded-full bg-current opacity-70"></span>
              {tag}
            </Badge>
          ))}
          {violations.map(violation => (
            <Badge 
              key={violation} 
              variant="outline" 
              className={`rounded-full px-3 py-1 flex items-center gap-1 ${getTagColor(violation)}`}
            >
              <span className="h-2 w-2 rounded-full bg-current opacity-70"></span>
              {violation}
            </Badge>
          ))}
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-sm h-7">
            <Plus className="h-4 w-4" /> Add Tag
          </Button>
        </div>
      </div>
    </div>
  );
};
