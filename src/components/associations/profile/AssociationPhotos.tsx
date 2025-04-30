
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Code } from 'lucide-react';

export const AssociationPhotos: React.FC = () => {
  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Association Photos & 3D Views
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              View Photos
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              Manage Photos
            </Button>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          <Button className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Photo
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Add 3D Embed
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
