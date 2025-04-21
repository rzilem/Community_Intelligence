
import React, { useEffect } from 'react';
import { useCollaborationWidget, CollaboratorInfo } from '@/hooks/portal/useCollaborationWidget';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface CollaborationIndicatorProps {
  widgetId: string;
}

// Define the window property for cursor tracking
declare global {
  interface Window {
    lastCursorUpdate?: number;
  }
}

const CollaborationIndicator: React.FC<CollaborationIndicatorProps> = ({ 
  widgetId 
}) => {
  const { collaborators, updateCursorPosition } = useCollaborationWidget(widgetId);
  
  // Track mouse position for real-time collaboration
  useEffect(() => {
    if (collaborators.length === 0) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      // Throttle updates to avoid excessive events
      if (!window.lastCursorUpdate || Date.now() - window.lastCursorUpdate > 100) {
        window.lastCursorUpdate = Date.now();
        updateCursorPosition(e.clientX, e.clientY);
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [collaborators.length, updateCursorPosition]);
  
  if (collaborators.length === 0) return null;
  
  return (
    <div className="flex items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex -space-x-2 mr-2">
              {collaborators.slice(0, 3).map((collaborator) => (
                <Avatar key={collaborator.userId} className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-xs">
                    {collaborator.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              ))}
              {collaborators.length > 3 && (
                <Avatar className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    +{collaborators.length - 3}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-semibold">Currently viewing:</p>
            <ul className="text-sm mt-1">
              {collaborators.map((c) => (
                <li key={c.userId}>{c.name || c.email}</li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Badge variant="outline" className="h-5 text-xs flex items-center gap-0.5 bg-primary/5">
        <Users className="h-3 w-3" />
        <span>{collaborators.length}</span>
      </Badge>
    </div>
  );
};

export default CollaborationIndicator;
