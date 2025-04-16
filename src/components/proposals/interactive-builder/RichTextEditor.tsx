import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Link,
  Image
} from 'lucide-react';

interface RichTextEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  initialValue, 
  onChange,
  className = ''
}) => {
  const [editorContent, setEditorContent] = useState(initialValue);
  const editorRef = React.useRef<HTMLDivElement>(null);
  
  // Initialize editor content
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialValue;
    }
  }, [initialValue]);

  const handleContentChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setEditorContent(content);
      onChange(content);
    }
  };

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    handleContentChange();
    // Keep focus on the editor
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // This is a simplified rich text editor. In a production app,
  // you'd want to use a more robust solution like TinyMCE, CKEditor, etc.
  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap gap-1 mb-2 p-1 bg-muted/20 rounded-md">
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand('bold')}
          className="h-8 px-2"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand('italic')}
          className="h-8 px-2"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand('insertUnorderedList')}
          className="h-8 px-2"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand('insertOrderedList')}
          className="h-8 px-2"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand('justifyLeft')}
          className="h-8 px-2"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand('justifyCenter')}
          className="h-8 px-2"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand('justifyRight')}
          className="h-8 px-2"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            const url = prompt('Enter link URL');
            if (url) execCommand('createLink', url);
          }}
          className="h-8 px-2"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            const url = prompt('Enter image URL');
            if (url) execCommand('insertImage', url);
          }}
          className="h-8 px-2"
        >
          <Image className="h-4 w-4" />
        </Button>
      </div>
      
      <div
        ref={editorRef}
        contentEditable
        className={`outline-none min-h-[150px] ${className}`}
        onInput={handleContentChange}
        onBlur={handleContentChange}
      />
    </div>
  );
};

export default RichTextEditor;
