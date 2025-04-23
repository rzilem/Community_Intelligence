
import React, { useState } from 'react';

export const AiQueryInput: React.FC<{ placeholder?: string; compact?: boolean }> = ({ 
  placeholder: customPlaceholder,
  compact = false 
}) => {
  const [query, setQuery] = useState('');
  const [placeholder] = useState(customPlaceholder || 'Ask Community Intelligence anything...');

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
        className={`w-full ${compact ? 'p-3' : 'p-4'} pl-5 pr-16 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
      />
      <button
        type="submit"
        className={`absolute right-3 top-1/2 transform -translate-y-1/2 bg-primary text-white px-3 py-1 rounded-md ${compact ? 'text-sm' : ''}`}
      >
        Ask
      </button>
    </form>
  );
};
