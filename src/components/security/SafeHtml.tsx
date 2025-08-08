import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface SafeHtmlProps {
  html?: string | null;
  className?: string;
}

// Centralized, strict HTML sanitizer for any user/AI-generated content
export const SafeHtml: React.FC<SafeHtmlProps> = ({ html = '', className }) => {
  const sanitized = useMemo(() => {
    const clean = DOMPurify.sanitize(html || '', {
      USE_PROFILES: { html: true },
      ALLOWED_TAGS: [
        'a','abbr','b','blockquote','br','caption','code','div','em','figcaption','figure','h1','h2','h3','h4','h5','h6','hr','i','img','li','ol','p','pre','section','small','span','strong','sub','sup','table','tbody','td','th','thead','tr','u','ul'
      ],
      ALLOWED_ATTR: [
        'href','target','rel','src','alt','title','width','height','style','class','id','data-*','colspan','rowspan','align'
      ],
      ALLOW_DATA_ATTR: true,
      FORBID_TAGS: ['script','style','iframe','object','embed'],
      FORBID_ATTR: ['onerror','onload','onclick','onmouseover','onfocus','onblur','onchange'],
      ADD_ATTR: ['rel'],
      ADD_TAGS: []
    });

    // Ensure links are safe
    return clean.replace(/<a\s/g, '<a rel="noopener noreferrer nofollow" target="_blank" ');
  }, [html]);

  if (!sanitized) return null;
  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitized }} />;
};

export default SafeHtml;
