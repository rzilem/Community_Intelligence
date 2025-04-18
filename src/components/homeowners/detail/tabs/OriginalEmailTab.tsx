
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
  // Function to safely create HTML content for iframe
  const createHtmlContent = () => {
    if (!htmlContent) return '';
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              line-height: 1.5;
              color: #333;
              margin: 20px;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              padding: 8px;
              text-align: left;
              border: 1px solid #ddd;
            }
            th {
              background-color: #f2f2f2;
            }
          </style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `;
  };

  return (
    <div className={`${fullscreenEmail ? 'h-[calc(100vh-120px)]' : 'h-full'} flex flex-col`}>
      {htmlContent ? (
        <div className="border rounded-lg flex-1 overflow-hidden">
          <div className="bg-gray-100 p-2 border-b flex justify-between items-center">
            <h3 className="font-medium">Original Email Content</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFullscreenEmail(!fullscreenEmail)}
              className="h-8 w-8 p-0 rounded-full"
            >
              {fullscreenEmail ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="w-full h-full overflow-auto">
            <iframe 
              srcDoc={createHtmlContent()}
              title="Original Email" 
              className="w-full h-full bg-white"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      ) : (
        <div className="p-8 text-center border rounded-md h-full flex items-center justify-center">
          <p className="text-muted-foreground">No HTML content available for this invoice.</p>
        </div>
      )}
    </div>
  );
};

export default OriginalEmailTab;
