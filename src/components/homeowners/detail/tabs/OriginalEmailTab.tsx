
import React from 'react';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';

interface OriginalEmailTabProps {
  htmlContent?: string;
  fullscreenEmail: boolean;
  setFullscreenEmail: (value: boolean) => void;
}

const OriginalEmailTab: React.FC<OriginalEmailTabProps> = ({ 
  htmlContent, 
  fullscreenEmail, 
  setFullscreenEmail 
}) => {
  return (
    <div className={`${fullscreenEmail ? 'h-[calc(100vh-120px)]' : 'h-[60vh]'} flex flex-col`}>
      {htmlContent ? (
        <div className="border rounded-lg flex-1 overflow-hidden">
          <div className="bg-gray-100 p-2 border-b flex justify-between items-center">
            <h3 className="font-medium">Original Email Content</h3>
          </div>
          <div className="w-full h-full overflow-auto">
            <iframe 
              srcDoc={`<!DOCTYPE html><html><head><style>body { font-family: Arial, sans-serif; margin: 20px; }</style></head><body>${htmlContent}</body></html>`}
              title="Original Email" 
              className="w-full h-full bg-white"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      ) : (
        <div className="p-8 text-center border rounded-md h-full flex items-center justify-center">
          <p className="text-muted-foreground">No HTML content available for this request.</p>
        </div>
      )}
    </div>
  );
};

export default OriginalEmailTab;
