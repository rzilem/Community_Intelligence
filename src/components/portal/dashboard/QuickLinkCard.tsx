
import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface QuickLinkCardProps {
  icon: LucideIcon;
  title: string;
  color: string;
  onClick: () => void;
}

export const QuickLinkCard: React.FC<QuickLinkCardProps> = ({
  icon: Icon,
  title,
  color,
  onClick
}) => {
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="p-4">
        <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center mb-2`}>
          <Icon className="h-5 w-5" />
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
    </Card>
  );
};
