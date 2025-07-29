import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette, Sparkles } from 'lucide-react';

// Import the generated design concept images
import designConcept1 from '@/assets/design-concept-1.jpg';
import designConcept2 from '@/assets/design-concept-2.jpg';
import designConcept3 from '@/assets/design-concept-3.jpg';
import designConceptMobile from '@/assets/design-concept-mobile.jpg';
import designConceptDark from '@/assets/design-concept-dark.jpg';
import designConceptGrid from '@/assets/design-concept-grid.jpg';
import designConceptAI from '@/assets/design-concept-ai.jpg';
import designConceptVibrant from '@/assets/design-concept-vibrant.jpg';
import designConceptGlassmorphism from '@/assets/design-concept-glassmorphism.jpg';
import designConceptLighterDark from '@/assets/design-concept-lighter-dark.jpg';
import designConceptGradientHarmony from '@/assets/design-concept-gradient-harmony.jpg';
import designConceptGlassFusion from '@/assets/design-concept-glass-fusion.jpg';

const DesignShowcase: React.FC = () => {
  const concepts = [
    {
      id: 1,
      title: "Glass Morphism Design",
      description: "Sophisticated interface with glass morphism effects, floating elements, and clean card layouts perfect for modern enterprise applications.",
      image: designConcept1,
      features: ["Glass morphism effects", "Sophisticated sidebar", "Clean card layouts", "Professional aesthetics"],
      category: "Modern Enterprise"
    },
    {
      id: 2,
      title: "Minimalist Elegance",
      description: "Clean, minimalist design with floating components, elegant typography, and subtle gradients for maximum readability and user focus.",
      image: designConcept2,
      features: ["Floating components", "Elegant typography", "Subtle gradients", "Minimal clutter"],
      category: "Minimalist"
    },
    {
      id: 3,
      title: "Data-Rich Analytics",
      description: "Advanced data visualization interface with interactive charts, AI insights panels, and comprehensive analytics dashboards.",
      image: designConcept3,
      features: ["Data visualizations", "Interactive charts", "AI insights panels", "Analytics focus"],
      category: "Analytics Heavy"
    },
    {
      id: 4,
      title: "Mobile-First Responsive",
      description: "Touch-optimized mobile interface with responsive design, gesture support, and seamless cross-device experience.",
      image: designConceptMobile,
      features: ["Touch-friendly", "Responsive design", "Gesture support", "Mobile optimized"],
      category: "Mobile First"
    },
    {
      id: 5,
      title: "Dark Mode Professional",
      description: "Elegant dark theme interface with deep navy backgrounds, neon blue accents, and sophisticated styling for extended usage sessions.",
      image: designConceptDark,
      features: ["Dark theme", "Neon accents", "Eye-friendly", "Night mode optimized"],
      category: "Dark Theme"
    },
    {
      id: 6,
      title: "Grid-Based Organization",
      description: "Clean grid layout design with organized card systems, perfect spacing, and intuitive data organization for maximum efficiency.",
      image: designConceptGrid,
      features: ["Grid layouts", "Organized cards", "Clean spacing", "Data focused"],
      category: "Organized Layout"
    },
    {
      id: 7,
      title: "AI-Integrated Interface",
      description: "Smart interface featuring prominent AI assistant integration, conversational UI elements, and seamless human-AI collaboration.",
      image: designConceptAI,
      features: ["AI chat panel", "Smart suggestions", "Conversational UI", "AI-first design"],
      category: "AI-Powered"
    },
    {
      id: 8,
      title: "Vibrant & Engaging",
      description: "Colorful and energetic design with bright gradients, cheerful palette, and engaging visual elements that inspire productivity.",
      image: designConceptVibrant,
      features: ["Bright colors", "Gradient effects", "Engaging visuals", "Energetic design"],
      category: "Colorful"
    },
    {
      id: 9,
      title: "Glassmorphism Premium",
      description: "Sophisticated glassmorphism interface with frosted glass panels, blue-to-silver gradients, semi-transparent cards, and green accent highlights.",
      image: designConceptGlassmorphism,
      features: ["Frosted glass panels", "Blue-silver gradients", "Semi-transparent cards", "Green accents"],
      category: "Premium Glass"
    },
    {
      id: 10,
      title: "Lighter Professional Dark",
      description: "Refined dark mode with soft navy backgrounds, silver metallic accents, blue gradient headers, and excellent contrast for extended use.",
      image: designConceptLighterDark,
      features: ["Soft dark navy", "Silver accents", "Blue gradients", "High contrast"],
      category: "Refined Dark"
    },
    {
      id: 11,
      title: "Gradient Harmony",
      description: "Beautiful multi-directional blue-to-silver-to-green gradients with white content areas and smooth color transitions throughout.",
      image: designConceptGradientHarmony,
      features: ["Multi-directional gradients", "Color harmony", "Smooth transitions", "White content areas"],
      category: "Gradient Rich"
    },
    {
      id: 12,
      title: "Glass & Gradients Fusion",
      description: "Advanced combination of glassmorphism with embedded gradient effects, featuring multi-layered depth and professional aesthetics.",
      image: designConceptGlassFusion,
      features: ["Glass + gradients", "Multi-layered depth", "Embedded effects", "Professional fusion"],
      category: "Fusion Design"
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <Palette className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Design Showcase</h1>
            <p className="text-muted-foreground">
              Explore different design concepts and visual directions for Community Intelligence
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {concepts.map((concept) => (
            <Card key={concept.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted relative overflow-hidden">
                <img 
                  src={concept.image} 
                  alt={concept.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-4 left-4 bg-primary/90 text-primary-foreground">
                  {concept.category}
                </Badge>
              </div>
              
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">{concept.title}</CardTitle>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  {concept.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Key Features
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {concept.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Design Philosophy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              These design concepts showcase different approaches to creating a modern, professional HOA management platform. 
              Each design emphasizes clean aesthetics, intuitive navigation, and the AI-powered features that set Community Intelligence apart.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">User-Centric</h4>
                <p className="text-sm text-muted-foreground">Intuitive interfaces that prioritize user experience and workflow efficiency</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">AI-Integrated</h4>
                <p className="text-sm text-muted-foreground">Seamless AI features that enhance productivity and provide intelligent insights</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Professional</h4>
                <p className="text-sm text-muted-foreground">Enterprise-grade aesthetics that inspire confidence and trust</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DesignShowcase;