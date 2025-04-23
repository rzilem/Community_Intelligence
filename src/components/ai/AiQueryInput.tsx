
import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/use-translation';

export const AiQueryInput: React.FC<{ placeholder?: string }> = ({ placeholder: customPlaceholder }) => {
  const [query, setQuery] = useState('');
  const [placeholder, setPlaceholder] = useState(customPlaceholder || 'Ask Community Intelligence anything...');
  const { translateText, preferredLanguage, translateVersion } = useTranslation();

  useEffect(() => {
    const updatePlaceholder = async () => {
      if (!customPlaceholder) {
        const defaultPlaceholder = 'Ask Community Intelligence anything...';
        if (preferredLanguage === 'en') {
          setPlaceholder(defaultPlaceholder);
          return;
        }
        
        try {
          const translated = await translateText(defaultPlaceholder);
          if (translated) {
            setPlaceholder(translated);
          }
        } catch (error) {
          console.error('Error translating placeholder:', error);
        }
      }
    };
    
    updatePlaceholder();
  }, [customPlaceholder, preferredLanguage, translateText, translateVersion]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Process query
    console.log('Processing query:', query);
    // Reset query
    setQuery('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={handleQueryChange}
        placeholder={placeholder}
        className="w-full p-4 pl-5 pr-16 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-primary text-white px-3 py-1 rounded-md"
      >
        Ask
      </button>
    </form>
  );
};
