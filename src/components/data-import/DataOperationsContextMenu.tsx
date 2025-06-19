
import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuCheckboxItem,
  ContextMenuLabel
} from '@/components/ui/context-menu';
import {
  Copy,
  Trash2,
  Edit,
  Eye,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  XCircle,
  Merge,
  Split,
  Filter,
  Settings,
  AlertTriangle,
  Zap
} from 'lucide-react';

export interface DataOperationsContextMenuProps {
  children: React.ReactNode;
  selectedRecords: any[];
  onCopy: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onView: () => void;
  onExport: () => void;
  onImport: () => void;
  onRefresh: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onMerge?: () => void;
  onSplit?: () => void;
  onFilter?: (field: string) => void;
  onAutoFix?: () => void;
  onMarkAsReviewed?: () => void;
  showDuplicateOptions?: boolean;
  showQualityOptions?: boolean;
  showApprovalOptions?: boolean;
}

const DataOperationsContextMenu: React.FC<DataOperationsContextMenuProps> = ({
  children,
  selectedRecords,
  onCopy,
  onDelete,
  onEdit,
  onView,
  onExport,
  onImport,
  onRefresh,
  onApprove,
  onReject,
  onMerge,
  onSplit,
  onFilter,
  onAutoFix,
  onMarkAsReviewed,
  showDuplicateOptions = false,
  showQualityOptions = false,
  showApprovalOptions = false
}) => {
  const hasSelection = selectedRecords.length > 0;
  const isSingleSelection = selectedRecords.length === 1;
  const isMultipleSelection = selectedRecords.length > 1;

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64 bg-white shadow-lg border border-gray-200">
        {/* Basic Operations */}
        <ContextMenuLabel>Basic Operations</ContextMenuLabel>
        
        {isSingleSelection && (
          <>
            <ContextMenuItem onClick={onView} className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View Details
            </ContextMenuItem>
            <ContextMenuItem onClick={onEdit} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Record
            </ContextMenuItem>
          </>
        )}
        
        {hasSelection && (
          <>
            <ContextMenuItem onClick={onCopy} className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Copy {isMultipleSelection ? `${selectedRecords.length} Records` : 'Record'}
            </ContextMenuItem>
            <ContextMenuItem 
              onClick={onDelete} 
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Delete {isMultipleSelection ? `${selectedRecords.length} Records` : 'Record'}
            </ContextMenuItem>
          </>
        )}
        
        <ContextMenuSeparator />
        
        {/* Data Operations */}
        <ContextMenuLabel>Data Operations</ContextMenuLabel>
        
        <ContextMenuItem onClick={onExport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </ContextMenuItem>
        
        <ContextMenuItem onClick={onImport} className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Import Data
        </ContextMenuItem>
        
        <ContextMenuItem onClick={onRefresh} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        {/* Duplicate Detection Options */}
        {showDuplicateOptions && (
          <>
            <ContextMenuLabel>Duplicate Management</ContextMenuLabel>
            
            {isMultipleSelection && onMerge && (
              <ContextMenuItem onClick={onMerge} className="flex items-center gap-2">
                <Merge className="h-4 w-4" />
                Merge Records
              </ContextMenuItem>
            )}
            
            {isSingleSelection && onSplit && (
              <ContextMenuItem onClick={onSplit} className="flex items-center gap-2">
                <Split className="h-4 w-4" />
                Split Record
              </ContextMenuItem>
            )}
            
            <ContextMenuSub>
              <ContextMenuSubTrigger className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter by Field
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-48 bg-white shadow-lg border border-gray-200">
                {selectedRecords.length > 0 && 
                  Object.keys(selectedRecords[0])
                    .filter(key => !key.startsWith('_'))
                    .slice(0, 8)
                    .map(field => (
                      <ContextMenuItem 
                        key={field}
                        onClick={() => onFilter?.(field)}
                        className="capitalize"
                      >
                        {field.replace('_', ' ')}
                      </ContextMenuItem>
                    ))
                }
              </ContextMenuSubContent>
            </ContextMenuSub>
            
            <ContextMenuSeparator />
          </>
        )}
        
        {/* Data Quality Options */}
        {showQualityOptions && (
          <>
            <ContextMenuLabel>Quality Management</ContextMenuLabel>
            
            {onAutoFix && (
              <ContextMenuItem onClick={onAutoFix} className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Auto-Fix Issues
              </ContextMenuItem>
            )}
            
            {onMarkAsReviewed && (
              <ContextMenuItem onClick={onMarkAsReviewed} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Mark as Reviewed
              </ContextMenuItem>
            )}
            
            <ContextMenuItem className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Flag for Review
            </ContextMenuItem>
            
            <ContextMenuSeparator />
          </>
        )}
        
        {/* Approval Options */}
        {showApprovalOptions && (onApprove || onReject) && (
          <>
            <ContextMenuLabel>Approval Actions</ContextMenuLabel>
            
            {onApprove && (
              <ContextMenuItem 
                onClick={onApprove} 
                className="flex items-center gap-2 text-green-600 hover:text-green-700"
              >
                <CheckCircle className="h-4 w-4" />
                Approve {isMultipleSelection ? `${selectedRecords.length} Records` : 'Record'}
              </ContextMenuItem>
            )}
            
            {onReject && (
              <ContextMenuItem 
                onClick={onReject} 
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <XCircle className="h-4 w-4" />
                Reject {isMultipleSelection ? `${selectedRecords.length} Records` : 'Record'}
              </ContextMenuItem>
            )}
            
            <ContextMenuSeparator />
          </>
        )}
        
        {/* Advanced Options */}
        <ContextMenuLabel>Advanced</ContextMenuLabel>
        
        <ContextMenuSub>
          <ContextMenuSubTrigger className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Batch Operations
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48 bg-white shadow-lg border border-gray-200">
            <ContextMenuItem>Update Field Values</ContextMenuItem>
            <ContextMenuItem>Apply Transformations</ContextMenuItem>
            <ContextMenuItem>Run Validations</ContextMenuItem>
            <ContextMenuItem>Generate Reports</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem className="text-red-600">Bulk Delete</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        
        <ContextMenuSub>
          <ContextMenuSubTrigger className="flex items-center gap-2">
            Export Options
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-40 bg-white shadow-lg border border-gray-200">
            <ContextMenuItem>Export as CSV</ContextMenuItem>
            <ContextMenuItem>Export as Excel</ContextMenuItem>
            <ContextMenuItem>Export as JSON</ContextMenuItem>
            <ContextMenuItem>Generate PDF Report</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        
        {/* Quality Preferences */}
        {showQualityOptions && (
          <ContextMenuSub>
            <ContextMenuSubTrigger className="flex items-center gap-2">
              Quality Settings
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-56 bg-white shadow-lg border border-gray-200">
              <ContextMenuCheckboxItem>Auto-fix format issues</ContextMenuCheckboxItem>
              <ContextMenuCheckboxItem>Validate on save</ContextMenuCheckboxItem>
              <ContextMenuCheckboxItem>Show confidence scores</ContextMenuCheckboxItem>
              <ContextMenuCheckboxItem>Highlight duplicates</ContextMenuCheckboxItem>
              <ContextMenuSeparator />
              <ContextMenuItem>Configure Rules</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default DataOperationsContextMenu;
