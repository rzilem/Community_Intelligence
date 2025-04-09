
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { EnhancedAIQueryDemo } from '@/components/ai/EnhancedAIQueryDemo';
import { useNavigate } from 'react-router-dom';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-hoa-blue-900 to-hoa-blue-700 text-white">
      <div className="absolute inset-0 bg-[url('/src/assets/grid-pattern.svg')] opacity-10"></div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="py-16 md:py-24 lg:py-32 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="block">AI-Powered</span>
            <span className="bg-gradient-to-r from-white via-hoa-teal-300 to-white bg-clip-text text-transparent">
              HOA Management Solution
            </span>
          </h1>
          
          <p className="text-lg md:text-xl max-w-3xl mb-10 text-blue-100">
            Community Intelligence revolutionizes how HOAs are managed with AI-driven insights, 
            streamlined operations, and seamless communication.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={() => navigate('/dashboard')} 
              size="lg" 
              className="bg-white text-hoa-blue hover:bg-blue-50"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white/10"
              onClick={() => navigate('/auth?tab=signup')}
            >
              Request Demo
            </Button>
          </div>
          
          <div className="w-full max-w-2xl">
            <EnhancedAIQueryDemo 
              placeholder="Try asking about reports, maintenance, or finances..." 
              compact={true}
            />
          </div>

          <div className="mt-16 w-full max-w-4xl flex flex-col md:flex-row justify-between gap-8 text-left">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-hoa-teal-300" />
                <h3 className="font-bold text-white">AI-Powered Insights</h3>
              </div>
              <p className="text-blue-100 text-sm">
                Natural language queries provide instant answers and automate routine tasks.
              </p>
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-hoa-teal-300" />
                <h3 className="font-bold text-white">Multi-HOA Management</h3>
              </div>
              <p className="text-blue-100 text-sm">
                Manage multiple properties and HOAs from a single, unified platform.
              </p>
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-hoa-teal-300" />
                <h3 className="font-bold text-white">Enterprise Security</h3>
              </div>
              <p className="text-blue-100 text-sm">
                Role-based access control and encryption keep your sensitive data protected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
