
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, FileText, Calendar, MessageSquare, Home, DollarSign, Settings } from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'create' | 'navigate' | 'tool';
  keywords: string[];
}

const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const quickActions: QuickAction[] = [
    // Create actions
    {
      id: 'create-lead',
      title: 'New Lead',
      description: 'Create a new lead or prospect',
      icon: <Users className="h-4 w-4" />,
      action: () => navigate('/leads/new'),
      category: 'create',
      keywords: ['new', 'lead', 'prospect', 'create']
    },
    {
      id: 'create-invoice',
      title: 'New Invoice',
      description: 'Create a new invoice',
      icon: <FileText className="h-4 w-4" />,
      action: () => navigate('/accounting/invoice-queue/new'),
      category: 'create',
      keywords: ['new', 'invoice', 'bill', 'create']
    },
    {
      id: 'create-event',
      title: 'Schedule Event',
      description: 'Create a new calendar event',
      icon: <Calendar className="h-4 w-4" />,
      action: () => navigate('/operations/calendar'),
      category: 'create',
      keywords: ['new', 'event', 'calendar', 'schedule', 'meeting']
    },
    {
      id: 'send-message',
      title: 'Send Message',
      description: 'Send a communication',
      icon: <MessageSquare className="h-4 w-4" />,
      action: () => navigate('/communications/messaging'),
      category: 'create',
      keywords: ['message', 'communication', 'send', 'email']
    },
    {
      id: 'upload-document',
      title: 'Upload Document',
      description: 'Upload a new document',
      icon: <FileText className="h-4 w-4" />,
      action: () => navigate('/records-reports/documents'),
      category: 'create',
      keywords: ['upload', 'document', 'file', 'new']
    },
    
    // Navigate actions
    {
      id: 'view-dashboard',
      title: 'Dashboard',
      description: 'Go to main dashboard',
      icon: <Home className="h-4 w-4" />,
      action: () => navigate('/dashboard'),
      category: 'navigate',
      keywords: ['dashboard', 'home', 'overview']
    },
    {
      id: 'view-homeowners',
      title: 'Owners',
      description: 'View homeowner list',
      icon: <Users className="h-4 w-4" />,
      action: () => navigate('/homeowners'),
      category: 'navigate',
      keywords: ['owners', 'homeowners', 'residents']
    },
    {
      id: 'view-accounting',
      title: 'Accounting',
      description: 'View financial reports',
      icon: <DollarSign className="h-4 w-4" />,
      action: () => navigate('/accounting'),
      category: 'navigate',
      keywords: ['accounting', 'financial', 'money', 'reports']
    },
    
    // Tool actions
    {
      id: 'settings',
      title: 'Settings',
      description: 'Open application settings',
      icon: <Settings className="h-4 w-4" />,
      action: () => navigate('/settings'),
      category: 'tool',
      keywords: ['settings', 'preferences', 'config']
    }
  ];

  const filteredActions = search
    ? quickActions.filter(action =>
        action.title.toLowerCase().includes(search.toLowerCase()) ||
        action.description.toLowerCase().includes(search.toLowerCase()) ||
        action.keywords.some(keyword => keyword.toLowerCase().includes(search.toLowerCase()))
      )
    : quickActions;

  const handleSelect = (action: QuickAction) => {
    action.action();
    setOpen(false);
    setSearch('');
  };

  return (
    <>
      <Button
        variant="default"
        size="sm"
        onClick={() => setOpen(true)}
        className="bg-primary/90 hover:bg-primary shadow-sm"
      >
        <Plus className="h-4 w-4 mr-1" />
        Quick
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="What would you like to do?" 
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No actions found.</CommandEmpty>
          
          {['create', 'navigate', 'tool'].map(category => {
            const actions = filteredActions.filter(action => action.category === category);
            if (actions.length === 0) return null;
            
            const categoryLabels = {
              create: 'Create New',
              navigate: 'Go To',
              tool: 'Tools'
            };
            
            return (
              <CommandGroup key={category} heading={categoryLabels[category as keyof typeof categoryLabels]}>
                {actions.map((action) => (
                  <CommandItem
                    key={action.id}
                    onSelect={() => handleSelect(action)}
                    className="flex items-center gap-3 py-3"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted">
                      {action.icon}
                    </div>
                    <div>
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-muted-foreground">{action.description}</div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default QuickActions;
