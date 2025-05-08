
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Mail, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sanitizeHtml } from './utils/htmlUtils';

interface EmailPreviewProps {
  emailContent?: string;
  htmlContent?: string;
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({ emailContent, htmlContent }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // If we have HTML content, prefer that over plain text email content
  const hasContent = !!htmlContent || !!emailContent;
  const contentToUse = htmlContent || emailContent;
  
  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-muted-foreground">
        <Mail className="h-12 w-12 mb-4 opacity-20" />
        <p className="text-lg font-medium">No email content available</p>
        <p className="text-sm mt-2">This invoice may not have been received via email.</p>
      </div>
    );
  }

  // Function to safely create HTML content for iframe
  const createHtmlContent = () => {
    if (!contentToUse) return '';
    
    // If we already have HTML content, wrap it in a proper HTML structure
    if (htmlContent) {
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
    }
    
    // If we only have plain text, format it nicely
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
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>${emailContent}</body>
      </html>
    `;
  };

  const fullscreenClass = isFullscreen ? "fixed inset-0 z-50 bg-white dark:bg-gray-900" : "";

  return (
    <Card className={`p-0 h-full overflow-hidden ${fullscreenClass}`} style={{ position: 'relative' }}>
      <div className="bg-gray-100 p-2 border-b flex justify-between items-center">
        <h3 className="font-medium">Original Email Content</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="h-8 w-8 p-0 rounded-full"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="w-full h-[calc(100%-40px)] overflow-auto">
        <iframe 
          srcDoc={createHtmlContent()}
          title="Original Email" 
          className="w-full h-full bg-white"
          sandbox="allow-same-origin"
        />
      </div>
    </Card>
  );
};
