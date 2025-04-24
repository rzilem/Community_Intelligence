
import React, { useState, useEffect, useMemo } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Filter, Search, SortAsc, ArrowUpDown } from 'lucide-react';
import WorkflowTemplateCard from '@/components/operations/WorkflowTemplateCard';
import ActiveWorkflowCard from '@/components/operations/ActiveWorkflowCard';
import WorkflowTabs from '@/components/operations/WorkflowTabs';
import { Workflow } from '@/types/workflow-types';
import ResponsiveGrid from '@/components/layout/ResponsiveGrid';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Sample data for templates
const templateWorkflows: Workflow[] = [
  {
    id: '1',
    name: 'New Resident Onboarding',
    description: 'Step-by-step process to welcome and onboard new residents',
    type: 'Resident Management',
    status: 'template',
    steps: [
      { id: '101', name: 'Welcome Email', description: 'Send welcome email with community guidelines', order: 1 },
      { id: '102', name: 'Access Setup', description: 'Set up gate access codes and amenity access', order: 2 },
      { id: '103', name: 'Community Tour', description: 'Schedule in-person community tour', order: 3 }
    ],
    isTemplate: true,
    isPopular: true
  },
  {
    id: '2',
    name: 'Violation Enforcement',
    description: 'Standard procedure for handling HOA violations from initial notice to resolution',
    type: 'Compliance',
    status: 'template',
    steps: [
      { id: '201', name: 'First Notice', description: 'Send first violation notice with photo documentation', order: 1 },
      { id: '202', name: 'Follow Up', description: 'Check compliance after grace period', order: 2 },
      { id: '203', name: 'Final Warning', description: 'Send final warning notice before fine', order: 3 },
      { id: '204', name: 'Fine Assessment', description: 'Apply fine to homeowner account', order: 4 }
    ],
    isTemplate: true,
    isPopular: true
  },
  {
    id: '3',
    name: 'Maintenance Request',
    description: 'Process for handling maintenance requests from submission to completion',
    type: 'Maintenance',
    status: 'template',
    steps: [
      { id: '301', name: 'Initial Assessment', description: 'Review and categorize maintenance request', order: 1 },
      { id: '302', name: 'Vendor Assignment', description: 'Select and assign appropriate vendor', order: 2 },
      { id: '303', name: 'Work Completion', description: 'Verify work has been completed satisfactorily', order: 3 }
    ],
    isTemplate: true,
    isPopular: true
  },
  {
    id: '4',
    name: 'Annual Budget Review',
    description: 'Workflow for the annual budget review and approval process',
    type: 'Financial',
    status: 'template',
    steps: [
      { id: '401', name: 'Data Collection', description: 'Gather financial data and vendor projections', order: 1 },
      { id: '402', name: 'Draft Budget', description: 'Create draft budget for board review', order: 2 },
      { id: '403', name: 'Board Review', description: 'Present budget to board for feedback', order: 3 },
      { id: '404', name: 'Homeowner Notice', description: 'Provide notice to homeowners about budget changes', order: 4 },
      { id: '405', name: 'Final Approval', description: 'Obtain final board approval for budget', order: 5 }
    ],
    isTemplate: true
  },
  {
    id: '5',
    name: 'Reserve Study',
    description: 'Process for conducting and implementing a reserve study',
    type: 'Financial',
    status: 'template',
    steps: [
      { id: '501', name: 'Vendor Selection', description: 'Select qualified reserve study provider', order: 1 },
      { id: '502', name: 'Site Assessment', description: 'Schedule and conduct on-site assessment', order: 2 },
      { id: '503', name: 'Report Review', description: 'Review findings and recommendations', order: 3 },
      { id: '504', name: 'Implementation Plan', description: 'Create funding and maintenance plan based on findings', order: 4 }
    ],
    isTemplate: true
  },
  {
    id: '6',
    name: 'Board Meeting Preparation',
    description: 'Steps to prepare for and conduct effective board meetings',
    type: 'Governance',
    status: 'template',
    steps: [
      { id: '601', name: 'Agenda Creation', description: 'Prepare meeting agenda and supporting documents', order: 1 },
      { id: '602', name: 'Notice Distribution', description: 'Send meeting notice to board members and homeowners', order: 2 },
      { id: '603', name: 'Meeting Setup', description: 'Prepare meeting venue and materials', order: 3 },
      { id: '604', name: 'Minutes Distribution', description: 'Distribute minutes and action items after meeting', order: 4 }
    ],
    isTemplate: true
  },
  {
    id: '7',
    name: 'Community Newsletter',
    description: 'Process for creating and distributing the community newsletter',
    type: 'Communication',
    status: 'template',
    steps: [
      { id: '701', name: 'Content Collection', description: 'Gather content from board and committee members', order: 1 },
      { id: '702', name: 'Draft Creation', description: 'Create draft newsletter layout', order: 2 },
      { id: '703', name: 'Review', description: 'Board review of newsletter content', order: 3 },
      { id: '704', name: 'Distribution', description: 'Print and/or email newsletter to residents', order: 4 }
    ],
    isTemplate: true
  },
  {
    id: '8',
    name: 'Architectural Request Review',
    description: 'Process for reviewing and approving architectural modification requests',
    type: 'Governance',
    status: 'template',
    steps: [
      { id: '801', name: 'Initial Review', description: 'Review submission for completeness', order: 1 },
      { id: '802', name: 'Committee Review', description: 'ARC committee reviews request against guidelines', order: 2 },
      { id: '803', name: 'Decision', description: 'Approve, deny, or request modifications', order: 3 },
      { id: '804', name: 'Homeowner Notification', description: 'Notify homeowner of decision and next steps', order: 4 }
    ],
    isTemplate: true,
    isPopular: true
  },
];

// Sample data for active workflows
const activeWorkflows: Workflow[] = [
  {
    id: '101',
    name: 'Smith Family Onboarding',
    description: 'Onboarding process for the Smith family moving in on June 1',
    type: 'Resident Management',
    status: 'active',
    steps: [
      { id: '1001', name: 'Welcome Email', description: 'Send welcome email with community guidelines', order: 1, isComplete: true },
      { id: '1002', name: 'Access Setup', description: 'Set up gate access codes and amenity access', order: 2, isComplete: true },
      { id: '1003', name: 'Community Tour', description: 'Schedule in-person community tour', order: 3 }
    ],
    isTemplate: false
  },
  {
    id: '102',
    name: 'Oak Street Playground Maintenance',
    description: 'Annual maintenance for the Oak Street playground equipment',
    type: 'Maintenance',
    status: 'active',
    steps: [
      { id: '1101', name: 'Vendor Selection', description: 'Select playground maintenance vendor', order: 1, isComplete: true },
      { id: '1102', name: 'Schedule Work', description: 'Schedule maintenance work', order: 2, isComplete: true },
      { id: '1103', name: 'Inspection', description: 'Inspect completed work', order: 3 }
    ],
    isTemplate: false
  },
  {
    id: '103',
    name: 'Fall Newsletter',
    description: 'Creation and distribution of the Fall community newsletter',
    type: 'Communication',
    status: 'active',
    steps: [
      { id: '1201', name: 'Content Collection', description: 'Gather content from board and committee members', order: 1, isComplete: true },
      { id: '1202', name: 'Draft Creation', description: 'Create draft newsletter layout', order: 2 },
      { id: '1203', name: 'Review', description: 'Board review of newsletter content', order: 3 },
      { id: '1204', name: 'Distribution', description: 'Print and/or email newsletter to residents', order: 4 }
    ],
    isTemplate: false
  },
  {
    id: '104',
    name: '123 Maple Street Violation',
    description: 'Handling landscaping violation at 123 Maple Street',
    type: 'Compliance',
    status: 'inactive',
    steps: [
      { id: '1301', name: 'First Notice', description: 'Send first violation notice with photo documentation', order: 1, isComplete: true },
      { id: '1302', name: 'Follow Up', description: 'Check compliance after grace period', order: 2, isComplete: true },
      { id: '1303', name: 'Final Warning', description: 'Send final warning notice before fine', order: 3 }
    ],
    isTemplate: false
  }
];

// Sample data for custom workflows
const customWorkflows: Workflow[] = [
  {
    id: '201',
    name: 'Pool Maintenance',
    description: 'Custom workflow for weekly pool maintenance and chemical checks',
    type: 'Maintenance',
    status: 'template',
    steps: [
      { id: '2001', name: 'Chemical Check', description: 'Check and balance pool chemicals', order: 1 },
      { id: '2002', name: 'Physical Cleaning', description: 'Clean skimmers and remove debris', order: 2 },
      { id: '2003', name: 'Equipment Check', description: 'Inspect pump and filter systems', order: 3 }
    ],
    isTemplate: true
  },
  {
    id: '202',
    name: 'Custom Vendor Onboarding',
    description: 'Process for adding new vendors to our approved list',
    type: 'Financial',
    status: 'template',
    steps: [
      { id: '2101', name: 'Initial Review', description: 'Review vendor credentials and references', order: 1 },
      { id: '2102', name: 'Insurance Verification', description: 'Verify insurance coverage', order: 2 },
      { id: '2103', name: 'Contract Creation', description: 'Draft and review service contract', order: 3 },
      { id: '2104', name: 'Approval', description: 'Final approval and vendor database addition', order: 4 }
    ],
    isTemplate: true
  }
];

const Workflows: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('templates');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'name' | 'type'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const itemsPerPage = 10;
  
  // Reset to page 1 when changing tabs or search term
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  // Get the current workflow data based on the active tab
  const getWorkflowData = () => {
    switch (activeTab) {
      case 'templates':
        return templateWorkflows;
      case 'active':
        return activeWorkflows;
      case 'custom':
        return customWorkflows;
      default:
        return [];
    }
  };
  
  // Filter and sort the workflows
  const filteredAndSortedWorkflows = useMemo(() => {
    const workflows = getWorkflowData();
    
    // Filter by search term
    const filtered = workflows.filter(workflow => 
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      workflow.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Sort by field
    const sorted = [...filtered].sort((a, b) => {
      // Handle sorting by popularity first if available
      if (sortField === 'name' && a.isPopular && !b.isPopular) return -1;
      if (sortField === 'name' && !a.isPopular && b.isPopular) return 1;
      
      // Then sort by the selected field
      const aValue = a[sortField].toLowerCase();
      const bValue = b[sortField].toLowerCase();
      
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
    
    return sorted;
  }, [activeTab, searchTerm, sortField, sortDirection]);
  
  // Paginate the workflows
  const paginatedWorkflows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedWorkflows.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedWorkflows, currentPage]);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredAndSortedWorkflows.length / itemsPerPage);
  
  // Generate page numbers for pagination
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // If we have few pages, show all of them
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of the sliding window
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust window if we're near the ends
      if (currentPage <= 2) {
        endPage = 4;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }
      
      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push('ellipsis-start');
      }
      
      // Add pages in the sliding window
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push('ellipsis-end');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);
  
  // Handle workflow actions
  const handleUseTemplate = (id: string) => {
    toast.success(`Template ${id} selected for use. Starting workflow...`);
    // Implementation would create a new workflow instance from this template
  };
  
  const handleDuplicateTemplate = (id: string) => {
    toast.success(`Template ${id} duplicated to custom workflows`);
    // Implementation would copy this template to custom workflows
  };
  
  const handleEditTemplate = (id: string) => {
    navigate(`/operations/workflows/${id}`);
  };
  
  const handleDeleteTemplate = (id: string) => {
    toast.success(`Template ${id} deleted`);
    // Implementation would delete the template
  };
  
  const handleViewDetails = (id: string) => {
    navigate(`/operations/workflows/${id}`);
  };
  
  const handlePauseWorkflow = (id: string) => {
    toast.success(`Workflow ${id} paused`);
    // Implementation would pause the workflow
  };
  
  const handleResumeWorkflow = (id: string) => {
    toast.success(`Workflow ${id} resumed`);
    // Implementation would resume the workflow
  };
  
  const handleCancelWorkflow = (id: string) => {
    toast.success(`Workflow ${id} cancelled`);
    // Implementation would cancel the workflow
  };
  
  const handleEditWorkflow = (id: string) => {
    navigate(`/operations/workflows/${id}`);
  };
  
  const handleDeleteWorkflow = (id: string) => {
    toast.success(`Workflow ${id} deleted`);
    // Implementation would delete the workflow
  };
  
  const handleSortChange = (field: 'name' | 'type') => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and reset direction to asc
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const renderWorkflowsGrid = () => {
    if (activeTab === 'templates' || activeTab === 'custom') {
      return (
        <ResponsiveGrid 
          mobileColumns={2} 
          desktopColumns={5} 
          gap="md"
          className="mt-6"
        >
          {paginatedWorkflows.map(workflow => (
            <WorkflowTemplateCard
              key={workflow.id}
              workflow={workflow}
              onUseTemplate={handleUseTemplate}
              onDuplicateTemplate={handleDuplicateTemplate}
              onEditTemplate={handleEditTemplate}
              onDeleteTemplate={handleDeleteTemplate}
            />
          ))}
        </ResponsiveGrid>
      );
    } else if (activeTab === 'active') {
      return (
        <ResponsiveGrid 
          mobileColumns={1} 
          desktopColumns={5} 
          gap="md"
          className="mt-6"
        >
          {paginatedWorkflows.map(workflow => (
            <ActiveWorkflowCard
              key={workflow.id}
              workflow={workflow}
              onViewDetails={handleViewDetails}
              onPauseWorkflow={handlePauseWorkflow}
              onResumeWorkflow={handleResumeWorkflow}
              onCancelWorkflow={handleCancelWorkflow}
              onEditWorkflow={handleEditWorkflow}
              onDeleteWorkflow={handleDeleteWorkflow}
            />
          ))}
        </ResponsiveGrid>
      );
    }
    
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Select a tab to view workflows</p>
      </div>
    );
  };
  
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              tabIndex={currentPage === 1 ? -1 : 0}
              aria-disabled={currentPage === 1}
            />
          </PaginationItem>
          
          {pageNumbers.map((page, index) => (
            typeof page === 'number' ? (
              <PaginationItem key={index}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => setCurrentPage(page)}
                  tabIndex={0}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ) : (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            )
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              tabIndex={currentPage === totalPages ? -1 : 0}
              aria-disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };
  
  return (
    <PageTemplate
      title="Workflows"
      icon={<FileText className="h-6 w-6" />}
      description="Manage your workflow templates and active processes"
      actions={
        <Button onClick={() => navigate('/operations/workflows/new')}>
          <Plus className="mr-2 h-4 w-4" /> Create Workflow
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Tabs and Search */}
        <WorkflowTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        {/* Sorting and filtering */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSearchTerm("")}>
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchTerm("Financial")}>
                Financial
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchTerm("Compliance")}>
                Compliance
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchTerm("Maintenance")}>
                Maintenance
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchTerm("Resident Management")}>
                Resident Management
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchTerm("Governance")}>
                Governance
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchTerm("Communication")}>
                Communication
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleSortChange('name')}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" /> 
            Sort by Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleSortChange('type')}
          >
            <SortAsc className="h-4 w-4 mr-2" /> 
            Sort by Type {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Button>
          
          {searchTerm && (
            <div className="ml-auto text-sm text-muted-foreground">
              Showing {filteredAndSortedWorkflows.length} results for "{searchTerm}"
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => setSearchTerm("")}
                className="p-0 h-auto ml-1 text-primary"
              >
                Clear
              </Button>
            </div>
          )}
        </div>
        
        {/* Workflows grid */}
        {renderWorkflowsGrid()}
        
        {/* Pagination */}
        {renderPagination()}
      </div>
    </PageTemplate>
  );
};

export default Workflows;
