
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface ForumCategoryListProps {
  categories: ForumCategory[];
}

const ForumCategoryList: React.FC<ForumCategoryListProps> = ({ categories }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <Card 
          key={category.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate(`/forum/category/${category.id}`)}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">{category.name}</CardTitle>
            </div>
            <CardDescription>{category.description}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};

export default ForumCategoryList;
