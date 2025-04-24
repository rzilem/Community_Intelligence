
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DataCategory } from '@/types/demo-seeder-types';

interface CategoryListProps {
  categories: DataCategory[];
  onToggleCategory: (categoryId: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onToggleCategory,
}) => {
  return (
    <div className="space-y-3">
      <Label>Select Data Categories</Label>
      {categories.map(category => (
        <div key={category.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50">
          <Checkbox 
            id={`category-${category.id}`}
            checked={category.selected}
            onCheckedChange={() => onToggleCategory(category.id)}
            className="mt-1"
          />
          <div className="space-y-1 flex-1">
            <Label 
              htmlFor={`category-${category.id}`}
              className="flex items-center gap-2 cursor-pointer font-medium"
            >
              {category.icon}
              {category.name} ({category.count})
            </Label>
            <p className="text-sm text-muted-foreground">{category.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
