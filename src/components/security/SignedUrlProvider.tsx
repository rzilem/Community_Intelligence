import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SignedUrlContextType {
  getSignedUrl: (bucketId: string, path: string, expiresIn?: number) => Promise<string | null>;
  revokeSignedUrl: (url: string) => void;
}

const SignedUrlContext = createContext<SignedUrlContextType | undefined>(undefined);

interface SignedUrlProviderProps {
  children: React.ReactNode;
}

export const SignedUrlProvider: React.FC<SignedUrlProviderProps> = ({ children }) => {
  const [urlCache, setUrlCache] = useState<Map<string, { url: string; expires: number }>>(new Map());

  const getSignedUrl = useCallback(async (
    bucketId: string, 
    path: string, 
    expiresIn: number = 3600 // 1 hour default
  ): Promise<string | null> => {
    const cacheKey = `${bucketId}/${path}`;
    const cached = urlCache.get(cacheKey);
    const now = Date.now();

    // Return cached URL if still valid (with 5 minute buffer)
    if (cached && cached.expires > now + 300000) {
      return cached.url;
    }

    try {
      const { data, error } = await supabase.storage
        .from(bucketId)
        .createSignedUrl(path, expiresIn);

      if (error) {
        console.error('Error creating signed URL:', error);
        return null;
      }

      if (data?.signedUrl) {
        // Cache the URL with expiration time
        const expires = now + (expiresIn * 1000);
        setUrlCache(prev => new Map(prev).set(cacheKey, {
          url: data.signedUrl,
          expires
        }));

        return data.signedUrl;
      }

      return null;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      return null;
    }
  }, [urlCache]);

  const revokeSignedUrl = useCallback((url: string) => {
    // Remove from cache
    setUrlCache(prev => {
      const newCache = new Map(prev);
      for (const [key, value] of newCache.entries()) {
        if (value.url === url) {
          newCache.delete(key);
          break;
        }
      }
      return newCache;
    });
  }, []);

  // Clean up expired URLs periodically
  React.useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setUrlCache(prev => {
        const newCache = new Map();
        for (const [key, value] of prev.entries()) {
          if (value.expires > now) {
            newCache.set(key, value);
          }
        }
        return newCache;
      });
    }, 300000); // Clean up every 5 minutes

    return () => clearInterval(cleanup);
  }, []);

  return (
    <SignedUrlContext.Provider value={{ getSignedUrl, revokeSignedUrl }}>
      {children}
    </SignedUrlContext.Provider>
  );
};

export const useSignedUrl = () => {
  const context = useContext(SignedUrlContext);
  if (context === undefined) {
    throw new Error('useSignedUrl must be used within a SignedUrlProvider');
  }
  return context;
};

// Hook for secure image display
export const useSecureImage = (bucketId: string, path: string | null) => {
  const { getSignedUrl } = useSignedUrl();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!path) {
      setImageUrl(null);
      return;
    }

    const loadImage = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const url = await getSignedUrl(bucketId, path);
        setImageUrl(url);
      } catch (err) {
        setError('Failed to load image');
        console.error('Error loading secure image:', err);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [bucketId, path, getSignedUrl]);

  return { imageUrl, loading, error };
};