
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Play, Search, Filter } from 'lucide-react';
import { workflowService } from '@/services/workflow-service';
import { Workflow, WorkflowType } from '@/types/workflow-types';
import { toast } from 'sonner';

interface WorkflowTemplatesGalleryProps {
  associationId: string;
  onExecuteWorkflow?: (workflow: Workflow) => void;
  onViewDetails?: (workflow: Workflow) => void;
}

const WORKFLOW_TYPES: WorkflowType[] = [
  'Financial',
  'Maintenance', 
  'Compliance',
  'Resident Management',
  'Communication',
  'Governance'
];

const WorkflowTemplatesGallery: React.FC<WorkflowTemplatesGalleryProps> = ({
  associationId,
  onExecuteWorkflow,
  onViewDetails
}) => {
  const [templates, setTemplates] = useState<Workflow[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showPopularOnly, setShowPopularOnly] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, selectedType, showPopularOnly]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await workflowService.getWorkflowTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading workflow templates:', error);
      toast.error('Failed to load workflow templates');
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(t => t.type === selectedType);
    }

    if (showPopularOnly) {
      filtered = filtered.filter(t => t.isPopular);
    }

    setFilteredTemplates(filtered);
  };

  const handleExecute = async (workflow: Workflow) => {
    try {
      await workflowService.executeWorkflow(workflow.id, associationId);
      toast.success(`Started executing "${workflow.name}"`);
      if (onExecuteWorkflow) {
        onExecuteWorkflow(workflow);
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
      toast.error('Failed to execute workflow');
    }
  };

  const getTypeColor = (type: WorkflowType) => {
    const colors = {
      'Financial': 'bg-emerald-100 text-emerald-800',
      'Maintenance': 'bg-orange-100 text-orange-800',
      'Compliance': 'bg-red-100 text-red-800',
      'Resident Management': 'bg-blue-100 text-blue-800',
      'Communication': 'bg-purple-100 text-purple-800',
      'Governance': 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const groupedTemplates = WORKFLOW_TYPES.reduce((acc, type) => {
    acc[type] = filteredTemplates.filter(t => t.type === type);
    return acc;
  }, {} as Record<WorkflowType, Workflow[]>);

  if (loading) {
    return <div className="flex justify-center p-8">Loading workflow templates...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search workflows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {WORKFLOW_TYPES.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={showPopularOnly ? "default" : "outline"}
          onClick={() => setShowPopularOnly(!showPopularOnly)}
          className="flex items-center gap-2"
        >
          <Star className="h-4 w-4" />
          Popular Only
        </Button>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredTemplates.length} of {templates.length} workflow templates
      </div>

      {/* Grouped Templates */}
      {WORKFLOW_TYPES.map(type => {
        const typeTemplates = groupedTemplates[type];
        if (typeTemplates.length === 0) return null;

        return (
          <div key={type} className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{type}</h3>
              <Badge variant="secondary">{typeTemplates.length}</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {typeTemplates.map(template => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          {template.name}
                          {template.isPopular && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                        </CardTitle>
                        <Badge className={getTypeColor(template.type)} variant="secondary">
                          {template.type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                    
                    <div className="text-xs text-muted-foreground">
                      {template.steps.length} steps
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleExecute(template)}
                        className="flex items-center gap-1"
                      >
                        <Play className="h-3 w-3" />
                        Execute
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewDetails?.(template)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default WorkflowTemplatesGallery;
