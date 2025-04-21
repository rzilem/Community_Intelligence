
import React from 'react';
import { HomeownerRequest } from '@/types/homeowner-request-types';

interface AttachmentsTabProps {
  request: HomeownerRequest;
}

const AttachmentsTab: React.FC<AttachmentsTabProps> = ({ request }) => {
  // Here we would display the attachments for the request
  return (
    <div className="p-4">
      {request.attachments && request.attachments.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {request.attachments.map((attachment, index) => (
            <div key={index} className="border rounded p-4 flex flex-col">
              <div className="font-medium">{attachment.name}</div>
              <div className="text-sm text-muted-foreground">{attachment.size} bytes</div>
              <a 
                href={attachment.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline mt-2"
              >
                View Attachment
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No attachments for this request</p>
        </div>
      )}
    </div>
  );
};

export default AttachmentsTab;
