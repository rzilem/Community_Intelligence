
import React from 'react';

interface TableContainerProps {
  isLoading?: boolean;
  error?: Error | null;
  children: React.ReactNode;
  loadingMessage?: string;
}

const TableContainer: React.FC<TableContainerProps> = ({
  isLoading,
  error,
  children,
  loadingMessage = "Loading..."
}) => {
  if (isLoading) {
    return <div className="text-center py-8">{loadingMessage}</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error.message}</div>;
  }

  return <>{children}</>;
};

export default TableContainer;
