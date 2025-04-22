
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { MessageSquare } from 'lucide-react';
import ForumCategoryList from '@/components/forum/ForumCategoryList';
import { useSupabaseQuery } from '@/hooks/supabase';
import { useAuth } from '@/contexts/auth';

const ForumPage = () => {
  const { currentAssociation } = useAuth();
  const navigate = useNavigate();
  
  const { data: categories = [], isLoading } = useSupabaseQuery(
    'forum_categories',
    {
      filter: [{ column: 'association_id', value: currentAssociation?.id }],
      order: { column: 'order_index', ascending: true }
    }
  );

  return (
    <PageTemplate
      title="Community Forum"
      icon={<MessageSquare className="h-8 w-8" />}
      description="Engage with your community members"
    >
      {isLoading ? (
        <div>Loading categories...</div>
      ) : (
        <ForumCategoryList 
          categories={categories} 
        />
      )}
    </PageTemplate>
  );
};

export default ForumPage;
