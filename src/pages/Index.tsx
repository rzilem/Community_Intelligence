
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to Community Intelligence</h1>
        
        <p className="text-xl mb-8 text-gray-700 max-w-2xl">
          The AI-powered enterprise-grade HOA management platform for modern associations.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6 mb-12 max-w-4xl">
          <FeatureCard 
            title="Unified Management" 
            description="Manage multiple HOAs within a single platform with unique portals for each community."
          />
          <FeatureCard 
            title="AI Integration" 
            description="Harness the power of AI for intelligent insights and automated workflows."
          />
          <FeatureCard 
            title="Comprehensive Tools" 
            description="From accounting to resident communications, everything you need in one place."
          />
        </div>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <Button 
            onClick={() => navigate('/dashboard')}
            size="lg"
            className="text-lg px-8"
          >
            Go to Dashboard
          </Button>
          <Button 
            onClick={() => navigate('/associations')}
            size="lg" 
            variant="outline"
            className="text-lg px-8"
          >
            View Associations
          </Button>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ title, description }: { title: string; description: string }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default Index;
