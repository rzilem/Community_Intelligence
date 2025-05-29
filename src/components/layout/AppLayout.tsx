
import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import ErrorBoundary from '../ErrorBoundary';
import { ErrorFallback } from '../ui/error-fallback';

interface AppLayoutProps {
  children?: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <ErrorBoundary fallback={<ErrorFallback title="Navigation Error" description="There was an error loading the navigation. Please refresh the page." />}>
        <Header />
      </ErrorBoundary>
      
      <div className="flex">
        <ErrorBoundary fallback={<ErrorFallback title="Sidebar Error" description="There was an error loading the sidebar menu." />}>
          <Sidebar />
        </ErrorBoundary>
        
        <main className="flex-1 ml-64">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
