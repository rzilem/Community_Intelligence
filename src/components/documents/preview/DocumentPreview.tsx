
import React from 'react';
import { 
  FileText, 
  Image as ImageIcon,
  FileVideo,
  FileAudio,
  File
} from 'lucide-react';
import { Document } from '@/types/document-types';

interface DocumentPreviewProps {
  document: Document;
  className?: string;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document, className }) => {
  const getFileType = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return 'pdf';
    if (type.match(/^image\//)) return 'image';
    if (type.match(/^video\//)) return 'video';
    if (type.match(/^audio\//)) return 'audio';
    return 'other';
  };

  const renderPreview = () => {
    const type = getFileType(document.file_type);

    switch (type) {
      case 'image':
        return (
          <div className="relative w-full h-full min-h-[200px] bg-muted rounded-lg overflow-hidden">
            <img 
              src={document.url} 
              alt={document.name}
              className="object-contain w-full h-full"
            />
          </div>
        );
      case 'video':
        return (
          <div className="relative w-full h-full min-h-[200px] bg-muted rounded-lg overflow-hidden">
            <video 
              src={document.url} 
              controls
              className="w-full h-full"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      case 'audio':
        return (
          <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
            <audio controls src={document.url}>
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      case 'pdf':
        return (
          <div className="w-full h-full min-h-[200px] bg-muted rounded-lg">
            <iframe
              src={document.url}
              className="w-full h-full min-h-[500px]"
              title={document.name}
            />
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
            <File className="w-12 h-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Preview not available</p>
          </div>
        );
    }
  };

  const getFileIcon = () => {
    const type = getFileType(document.file_type);
    switch (type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'video':
        return <FileVideo className="h-4 w-4" />;
      case 'audio':
        return <FileAudio className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        {getFileIcon()}
        <h3 className="font-medium">{document.name}</h3>
      </div>
      {renderPreview()}
    </div>
  );
};

export default DocumentPreview;
