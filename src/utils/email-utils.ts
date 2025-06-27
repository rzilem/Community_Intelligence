
/**
 * Email utility functions for extracting and formatting email addresses
 */

export const extractPrimarySenderEmail = (htmlContent?: string): string | null => {
  if (!htmlContent) return null;
  
  try {
    // Try to extract from "From:" header in email content
    const fromMatch = htmlContent.match(/From:\s*(.+?)(?:\n|<br|$)/i);
    if (fromMatch) {
      const emailMatch = fromMatch[1].match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        return emailMatch[1].trim();
      }
    }
    
    // Fallback: try to find any email in the content
    const emailMatch = htmlContent.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      return emailMatch[1].trim();
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting email:', error);
    return null;
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

export const parseEmailList = (emailString: string): string[] => {
  return emailString
    .split(/[,;\s]+/)
    .map(email => email.trim())
    .filter(email => email.length > 0 && validateEmail(email));
};

export const formatEmailList = (emails: string[]): string => {
  return emails.filter(email => validateEmail(email)).join(', ');
};
