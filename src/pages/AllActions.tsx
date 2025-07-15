import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { Button } from '@/components/ui/button';
import { ArrowLeft, List } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { quickActionItems, QuickActionItem } from '@/data/quickActionItems';
import { toast } from 'sonner';

const AllActions = () => {
  const navigate = useNavigate();

  const handleActionClick = (path: string, title: string) => {
    navigate(path);
    toast.success(`Navigating to ${title}`);
  };

  return (
    <AppLayout>
      <PageTemplate
        title="All Actions"
        icon={<List className="h-8 w-8" />}
        actions={
          <Button variant="ghost" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActionItems.map((action: QuickActionItem, index: number) => (
            <button
              key={index}
              className={`flex items-center p-4 rounded-lg border-2 transition-all ${action.color} hover:shadow-md hover:border-hoa-blue-500 focus:outline-none focus:ring-2 focus:ring-hoa-blue-300`}
              onClick={() => handleActionClick(action.path, action.title)}
              aria-label={action.description}
            >
              <div className="mr-3">{action.icon}</div>
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-sm text-muted-foreground">{action.description}</div>
              </div>
            </button>
          ))}
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default AllActions;
