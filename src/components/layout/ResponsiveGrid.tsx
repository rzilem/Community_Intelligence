
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  desktopClassName?: string;
  mobileColumns?: 1 | 2;
  desktopColumns?: 2 | 3 | 4 | 5;
  gap?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * A responsive grid component that adjusts columns based on screen size
 */
const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  mobileClassName,
  desktopClassName,
  mobileColumns = 1,
  desktopColumns = 3,
  gap = 'md',
}) => {
  const isMobile = useIsMobile();

  // Map gap size to Tailwind classes
  const gapClasses = {
    none: '',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  // Map column count to Tailwind grid classes
  const mobileGridClass = mobileColumns === 1 ? 'grid-cols-1' : 'grid-cols-2';
  const desktopGridClass = `md:grid-cols-${desktopColumns}`;

  return (
    <div
      className={cn(
        'grid',
        gapClasses[gap],
        mobileGridClass,
        desktopGridClass,
        className,
        isMobile ? mobileClassName : desktopClassName
      )}
    >
      {children}
    </div>
  );
};

export default ResponsiveGrid;
