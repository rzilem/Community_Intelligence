
import { MappingOption } from '@/components/data-import/types/mapping-types';

// Simple similarity scoring between strings
const getStringSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
  const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Check for exact match after normalization
  if (s1 === s2) return 1;
  
  // Check if one is contained in the other
  if (s1.includes(s2) || s2.includes(s1)) {
    const ratio = Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length);
    return 0.7 * ratio;
  }
  
  // Calculate edit distance-based similarity for more advanced matching
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1; // Both strings are empty
  
  let matchCount = 0;
  for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
    if (s1[i] === s2[i]) matchCount++;
  }
  
  return matchCount / maxLen;
};

// Analyze sample data to determine data types and patterns
const analyzeColumnData = (columnData: any[]): {
  type: 'text' | 'number' | 'date' | 'boolean' | 'email' | 'phone' | 'address' | 'unknown';
  confidence: number;
} => {
  if (!columnData || columnData.length === 0) {
    return { type: 'unknown', confidence: 0 };
  }
  
  // Remove null/undefined values
  const cleanData = columnData.filter(val => val !== null && val !== undefined && val !== '');
  
  if (cleanData.length === 0) {
    return { type: 'unknown', confidence: 0 };
  }
  
  // Check data patterns
  let numberCount = 0;
  let dateCount = 0;
  let boolCount = 0;
  let emailCount = 0;
  let phoneCount = 0;
  let addressCount = 0;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[\d\+\-\(\)\s]{7,15}$/;
  const dateRegex = /^\d{1,4}[-\/\.]\d{1,2}[-\/\.]\d{1,4}$|^\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4}$/;
  const addressIndicators = ['street', 'ave', 'road', 'blvd', 'dr', 'lane', 'way', 'circle', 'apt', 'unit', '#'];
  
  for (const val of cleanData) {
    const strVal = String(val).trim();
    
    // Check if number
    if (!isNaN(Number(strVal)) && strVal !== '') {
      numberCount++;
    }
    
    // Check if date
    if (dateRegex.test(strVal) || !isNaN(Date.parse(strVal))) {
      dateCount++;
    }
    
    // Check if boolean
    if (['true', 'false', 'yes', 'no', '0', '1', 'y', 'n', 't', 'f'].includes(strVal.toLowerCase())) {
      boolCount++;
    }
    
    // Check if email
    if (emailRegex.test(strVal)) {
      emailCount++;
    }
    
    // Check if phone
    if (phoneRegex.test(strVal)) {
      phoneCount++;
    }
    
    // Check for address indicators
    if (addressIndicators.some(indicator => strVal.toLowerCase().includes(indicator))) {
      addressCount++;
    }
  }
  
  const total = cleanData.length;
  
  // Determine most likely type based on highest percentage
  const metrics = [
    { type: 'number', count: numberCount },
    { type: 'date', count: dateCount },
    { type: 'boolean', count: boolCount },
    { type: 'email', count: emailCount },
    { type: 'phone', count: phoneCount },
    { type: 'address', count: addressCount },
  ];
  
  const highestMatch = metrics.reduce((prev, current) => 
    (current.count > prev.count) ? current : prev, { type: 'text', count: 0 });
  
  // Calculate confidence score
  const confidence = highestMatch.count / total;
  
  // Default to text if no strong match
  return {
    type: confidence > 0.5 ? highestMatch.type as any : 'text',
    confidence
  };
};

export const aiMappingService = {
  // Generate mapping suggestions based on column names and sample data
  generateMappingSuggestions: (
    fileColumns: string[],
    systemFields: MappingOption[],
    sampleData: any[]
  ): Record<string, { fieldValue: string; confidence: number }> => {
    const suggestions: Record<string, { fieldValue: string; confidence: number }> = {};
    
    for (const column of fileColumns) {
      let bestMatch = { field: '', score: 0 };
      
      // Get sample data for this column
      const columnData = sampleData.map(row => row[column]);
      const dataAnalysis = analyzeColumnData(columnData);
      
      // Check each system field for a match with this column
      for (const field of systemFields) {
        // Calculate string similarity score between column name and field label/value
        const labelSimilarity = getStringSimilarity(column, field.label);
        const valueSimilarity = getStringSimilarity(column, field.value);
        let similarityScore = Math.max(labelSimilarity, valueSimilarity);
        
        // Boost score based on data type matches
        if (dataAnalysis.type === 'email' && field.value.includes('email')) {
          similarityScore += 0.3;
        } else if (dataAnalysis.type === 'phone' && field.value.includes('phone')) {
          similarityScore += 0.3;
        } else if (dataAnalysis.type === 'date' && field.value.includes('date')) {
          similarityScore += 0.3;
        } else if (dataAnalysis.type === 'address' && 
                  (field.value.includes('address') || field.value === 'street')) {
          similarityScore += 0.3;
        }
        
        // Cap score at 1.0
        similarityScore = Math.min(similarityScore, 1.0);
        
        // Update best match if this score is higher
        if (similarityScore > bestMatch.score) {
          bestMatch = { field: field.value, score: similarityScore };
        }
      }
      
      // Only suggest matches with reasonable confidence
      if (bestMatch.score >= 0.4) {
        suggestions[column] = { 
          fieldValue: bestMatch.field, 
          confidence: bestMatch.score 
        };
      }
    }
    
    return suggestions;
  }
};
