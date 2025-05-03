
import React from 'react';

interface HtmlContentViewerProps {
  htmlContent: string;
  onError: () => void;
  onLoad: () => void;
}

export const HtmlContentViewer: React.FC<HtmlContentViewerProps> = ({ 
  htmlContent, 
  onError, 
  onLoad 
}) => {
  const createHtmlContent = () => {
    if (!htmlContent) return '';
    
    // Improve the styling of the HTML content for better readability
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
              padding: 20px;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 1rem;
            }
            th, td {
              padding: 8px;
              text-align: left;
              border: 1px solid #ddd;
            }
            th {
              background-color: #f2f2f2;
            }
            div {
              margin-bottom: 1rem;
            }
            h1, h2, h3 {
              color: #1a56db;
            }
            .invoice-details {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 1rem;
              margin-bottom: 2rem;
            }
            .invoice-total {
              text-align: right;
              font-weight: bold;
              margin-top: 1rem;
              font-size: 1.2rem;
            }
            font[color="#6fa8dc"] {
              color: #6fa8dc;
              font-size: 24px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `;
  };

  return (
    <div className="h-full">
      <iframe
        srcDoc={createHtmlContent()}
        title="Invoice HTML Content"
        className="w-full h-full border-0"
        sandbox="allow-same-origin"
        onError={(e) => {
          console.error('HTML iframe error:', e);
          onError();
        }}
        onLoad={() => {
          console.log('HTML iframe loaded successfully');
          onLoad();
        }}
      />
    </div>
  );
};
