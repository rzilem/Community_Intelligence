
import React from 'react';

interface InvoiceLayoutManagerProps {
  showPreview: boolean;
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  previewContent?: React.ReactNode;
}

export const InvoiceLayoutManager: React.FC<InvoiceLayoutManagerProps> = React.memo(({
  showPreview,
  leftContent,
  rightContent,
  previewContent
}) => {
  const layoutConfig = {
    leftColumn: showPreview ? "lg:col-span-2" : "lg:col-span-3",
    rightColumn: "lg:col-span-1"
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className={layoutConfig.leftColumn}>
        <div className="space-y-6">
          {leftContent}
          {showPreview && previewContent}
        </div>
      </div>
      
      <div className={layoutConfig.rightColumn}>
        {rightContent}
      </div>
    </div>
  );
});

InvoiceLayoutManager.displayName = 'InvoiceLayoutManager';
