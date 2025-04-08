
import React from 'react';
import { Button } from '@/components/ui/button';
import { HeroSection } from '@/components/marketing/HeroSection';
import { FeatureSection } from '@/components/marketing/FeatureSection';
import { AuthSection } from '@/components/marketing/AuthSection';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-hoa-blue">
                Community Intelligence
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-hoa-blue">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-hoa-blue">Pricing</a>
              <a href="#contact" className="text-gray-600 hover:text-hoa-blue">Contact</a>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>Log In</Button>
              <Button onClick={() => navigate('/dashboard')}>Get Started</Button>
            </div>
            <div className="md:hidden">
              <Button variant="ghost">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <HeroSection />
        <FeatureSection />
        <AuthSection />
        
        {/* Testimonials Section */}
        <section className="py-16 md:py-24 bg-white">
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
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Community Intelligence</h3>
              <p className="mb-4">
                AI-powered HOA management software that simplifies operations and enhances community living.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-twitter"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Resources</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <p className="mb-2">1234 Community Way</p>
              <p className="mb-2">Suite 567</p>
              <p className="mb-2">San Francisco, CA 94107</p>
              <p className="mb-4">info@communityintelligence.com</p>
              <p className="text-lg font-semibold">(555) 123-4567</p>
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
