
import React from 'react';
import { Button } from '@/components/ui/button';
import { HeroSection } from '@/components/marketing/HeroSection';
import { FeatureSection } from '@/components/marketing/FeatureSection';
import { AuthSection } from '@/components/marketing/AuthSection';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedAIQueryDemo } from '@/components/ai/EnhancedAIQueryDemo';
import { 
  Twitter, 
  Linkedin, 
  Facebook, 
  ArrowRight,
  Menu
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // If user is already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (user && session) {
      navigate('/dashboard');
    }
  }, [user, session, navigate]);

  // Functions to handle navigation and scrolling to sections
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 
                className="text-xl font-bold text-hoa-blue cursor-pointer"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Community Intelligence
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('features')} 
                className="text-gray-600 hover:text-hoa-blue"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('pricing')} 
                className="text-gray-600 hover:text-hoa-blue"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')} 
                className="text-gray-600 hover:text-hoa-blue"
              >
                Testimonials
              </button>
              <button 
                onClick={() => scrollToSection('contact')} 
                className="text-gray-600 hover:text-hoa-blue"
              >
                Contact
              </button>
              <Button variant="outline" onClick={() => navigate('/auth?tab=login')}>
                Log In
              </Button>
              <Button onClick={() => navigate('/auth?tab=signup')}>
                Get Started
              </Button>
            </div>
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu />
              </Button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={() => {
                    scrollToSection('features');
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-hoa-blue hover:bg-gray-50 rounded-md"
                >
                  Features
                </button>
                <button 
                  onClick={() => {
                    scrollToSection('pricing');
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-hoa-blue hover:bg-gray-50 rounded-md"
                >
                  Pricing
                </button>
                <button 
                  onClick={() => {
                    scrollToSection('testimonials');
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-hoa-blue hover:bg-gray-50 rounded-md"
                >
                  Testimonials
                </button>
                <button 
                  onClick={() => {
                    scrollToSection('contact');
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-hoa-blue hover:bg-gray-50 rounded-md"
                >
                  Contact
                </button>
                <div className="pt-2 flex flex-col space-y-2">
                  <Button variant="outline" onClick={() => navigate('/auth?tab=login')} className="w-full">
                    Log In
                  </Button>
                  <Button onClick={() => navigate('/auth?tab=signup')} className="w-full">
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        <HeroSection />
        
        <section id="features">
          <FeatureSection />
        </section>
        
        <section id="pricing" className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Simple, Transparent Pricing</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Choose the plan that best fits your community's needs.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Starter Plan */}
              <div className="bg-white p-8 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-2">Starter</h3>
                <p className="text-muted-foreground mb-6">Perfect for small communities</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold">$99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Up to 50 units
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Basic AI capabilities
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Financial management
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Email support
                  </li>
                </ul>
                <Button className="w-full" onClick={() => navigate('/auth?tab=signup&plan=starter')}>
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              {/* Professional Plan */}
              <div className="bg-white p-8 rounded-lg border-2 border-hoa-blue shadow-lg relative">
                <div className="absolute top-0 right-0 bg-hoa-blue text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                  POPULAR
                </div>
                <h3 className="text-xl font-bold mb-2">Professional</h3>
                <p className="text-muted-foreground mb-6">Ideal for medium communities</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold">$249</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Up to 250 units
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Advanced AI analytics
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Complete financial suite
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Compliance tracking
                  </li>
                </ul>
                <Button className="w-full bg-hoa-blue hover:bg-hoa-blue/90" onClick={() => navigate('/auth?tab=signup&plan=professional')}>
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              {/* Enterprise Plan */}
              <div className="bg-white p-8 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                <p className="text-muted-foreground mb-6">For large-scale operations</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold">Custom</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Unlimited units
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Custom AI development
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Enterprise integrations
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Dedicated account manager
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    24/7 support
                  </li>
                </ul>
                <Button className="w-full" variant="outline" onClick={() => navigate('/auth?tab=signup&plan=enterprise')}>
                  Contact Sales <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        <section id="ai-demo" className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Experience AI-Powered HOA Management</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                See how Community Intelligence can answer your questions and provide insights in real-time.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <EnhancedAIQueryDemo 
                placeholder="Ask Community Intelligence anything about HOA management..."
                suggestionsVisible={true}
              />
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Trusted by HOA Communities</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                See why property managers and HOA boards choose Community Intelligence.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-gray-50 p-6 rounded-lg border">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-hoa-blue-100 flex items-center justify-center mr-4">
                    <span className="text-hoa-blue font-bold">JD</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Jane Doe</h4>
                    <p className="text-sm text-muted-foreground">HOA President, Lakeside Community</p>
                  </div>
                </div>
                <p className="italic">
                  "Community Intelligence has transformed how we manage our 250-unit community. The AI capabilities have reduced our administrative workload by 40%."
                </p>
              </div>
              
              {/* Testimonial 2 */}
              <div className="bg-gray-50 p-6 rounded-lg border">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-hoa-blue-100 flex items-center justify-center mr-4">
                    <span className="text-hoa-blue font-bold">MS</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Michael Smith</h4>
                    <p className="text-sm text-muted-foreground">Property Manager, Oakridge Estates</p>
                  </div>
                </div>
                <p className="italic">
                  "The amenity booking system alone has eliminated countless scheduling conflicts and resident complaints. Plus the AI handles all routine questions."
                </p>
              </div>
              
              {/* Testimonial 3 */}
              <div className="bg-gray-50 p-6 rounded-lg border">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-hoa-blue-100 flex items-center justify-center mr-4">
                    <span className="text-hoa-blue font-bold">AJ</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Amanda Johnson</h4>
                    <p className="text-sm text-muted-foreground">Treasurer, Highland Towers</p>
                  </div>
                </div>
                <p className="italic">
                  "The financial reporting tools are exceptional. We've cut our monthly financial review time in half and improved our collection rates by 25%."
                </p>
              </div>
            </div>
          </div>
        </section>

        <AuthSection />
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Community Intelligence</h3>
              <p className="mb-4">
                AI-powered HOA management software that simplifies operations and enhances community living.
              </p>
              <div className="flex space-x-4">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                  <Twitter />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                  <Linkedin />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                  <Facebook />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('features')} className="text-gray-400 hover:text-white">Features</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="text-gray-400 hover:text-white">Pricing</button></li>
                <li><button onClick={() => scrollToSection('testimonials')} className="text-gray-400 hover:text-white">Testimonials</button></li>
                <li><button onClick={() => navigate('/auth?tab=signup')} className="text-gray-400 hover:text-white">Sign Up</button></li>
                <li><button onClick={() => navigate('/auth?tab=login')} className="text-gray-400 hover:text-white">Login</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <p className="mb-2">1234 Community Way</p>
              <p className="mb-2">Suite 567</p>
              <p className="mb-2">San Francisco, CA 94107</p>
              <p className="mb-4">
                <a href="mailto:info@communityintelligence.com" className="hover:underline">
                  info@communityintelligence.com
                </a>
              </p>
              <p className="text-lg font-semibold">
                <a href="tel:+15551234567" className="hover:underline">(555) 123-4567</a>
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Community Intelligence. All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
