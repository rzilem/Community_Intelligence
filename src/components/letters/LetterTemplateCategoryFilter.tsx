
import React from 'react';
import { Button } from '@/components/ui/button';
import { LetterTemplateCategory } from '@/types/letter-template-types';

interface LetterTemplateCategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const LetterTemplateCategoryFilter: React.FC<LetterTemplateCategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory
}) => {
  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'Compliance', label: 'Compliance' },
    { id: 'Delinquency', label: 'Delinquency' },
    { id: 'Architectural', label: 'Architectural' }
  ];
  
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(category => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          onClick={() => onSelectCategory(category.id === 'all' ? null : category.id)}
          className={`rounded-full ${selectedCategory === category.id ? 'bg-primary text-white' : ''}`}
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
};

export default LetterTemplateCategoryFilter;
