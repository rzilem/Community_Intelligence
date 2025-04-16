
import React, { useState } from 'react';
import { ProposalVideo } from '@/types/proposal-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { PlayCircle, Video, UserCheck, Home } from 'lucide-react';

interface ProposalVideoSectionProps {
  videos: ProposalVideo[];
}

const ProposalVideoSection: React.FC<ProposalVideoSectionProps> = ({ videos }) => {
  const [selectedVideo, setSelectedVideo] = useState<ProposalVideo | null>(
    videos.length > 0 ? videos[0] : null
  );

  const testimonials = videos.filter(video => video.type === 'testimonial');
  const propertyTours = videos.filter(video => video.type === 'property_tour');
  const teamIntros = videos.filter(video => video.type === 'team_intro');
  const others = videos.filter(video => video.type === 'other');

  const renderVideoPlayer = (video: ProposalVideo) => {
    // Extract video ID for common video platforms
    const getEmbedUrl = (url: string) => {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        // YouTube
        const videoId = url.includes('v=') 
          ? url.split('v=')[1].split('&')[0]
          : url.split('/').pop();
        return `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes('vimeo.com')) {
        // Vimeo
        const videoId = url.split('/').pop();
        return `https://player.vimeo.com/video/${videoId}`;
      } else {
        // Direct video URL
        return url;
      }
    };

    if (!video) return null;

    const embedUrl = getEmbedUrl(video.url);

    return (
      <div className="space-y-4">
        <div className="border rounded-md overflow-hidden">
          <AspectRatio ratio={16/9}>
            <iframe 
              src={embedUrl}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </AspectRatio>
        </div>
        
        <div>
          <h3 className="text-lg font-medium">{video.title}</h3>
          {video.description && (
            <p className="text-muted-foreground mt-1">{video.description}</p>
          )}
        </div>
      </div>
    );
  };

  const renderVideoCategory = (categoryVideos: ProposalVideo[], icon: React.ReactNode, title: string) => {
    if (categoryVideos.length === 0) return null;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-medium">{title}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryVideos.map(video => (
            <Card 
              key={video.id} 
              className={`cursor-pointer transition-all hover:border-primary ${selectedVideo?.id === video.id ? 'border-primary' : ''}`}
              onClick={() => setSelectedVideo(video)}
            >
              <CardContent className="p-3">
                <div className="relative rounded-md overflow-hidden mb-2">
                  <AspectRatio ratio={16/9}>
                    {video.thumbnail_url ? (
                      <img 
                        src={video.thumbnail_url} 
                        alt={video.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Video className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </AspectRatio>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <PlayCircle className="h-10 w-10 text-white" />
                  </div>
                </div>
                <p className="text-sm font-medium line-clamp-1">{video.title}</p>
                {video.duration && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  if (videos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Video Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No videos available for this proposal.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Gallery</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {selectedVideo && renderVideoPlayer(selectedVideo)}
        
        <Tabs defaultValue="all">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All Videos</TabsTrigger>
            {testimonials.length > 0 && <TabsTrigger value="testimonials">Testimonials</TabsTrigger>}
            {propertyTours.length > 0 && <TabsTrigger value="propertyTours">Property Tours</TabsTrigger>}
            {teamIntros.length > 0 && <TabsTrigger value="teamIntros">Team Intros</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="all" className="space-y-8">
            {renderVideoCategory(testimonials, <UserCheck className="h-5 w-5 text-blue-500" />, "Testimonials")}
            {renderVideoCategory(propertyTours, <Home className="h-5 w-5 text-green-500" />, "Property Tours")}
            {renderVideoCategory(teamIntros, <Video className="h-5 w-5 text-purple-500" />, "Team Introductions")}
            {renderVideoCategory(others, <PlayCircle className="h-5 w-5 text-gray-500" />, "Other Videos")}
          </TabsContent>
          
          <TabsContent value="testimonials">
            {renderVideoCategory(testimonials, <UserCheck className="h-5 w-5 text-blue-500" />, "Testimonials")}
          </TabsContent>
          
          <TabsContent value="propertyTours">
            {renderVideoCategory(propertyTours, <Home className="h-5 w-5 text-green-500" />, "Property Tours")}
          </TabsContent>
          
          <TabsContent value="teamIntros">
            {renderVideoCategory(teamIntros, <Video className="h-5 w-5 text-purple-500" />, "Team Introductions")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProposalVideoSection;
