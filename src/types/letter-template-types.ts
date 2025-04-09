
export type LetterTemplateCategory = 
  | 'General' 
  | 'Compliance' 
  | 'Delinquency' 
  | 'Architectural' 
  | 'Meeting' 
  | 'Welcome' 
  | 'Other';

export type LetterTemplate = {
  id: string;
  name: string;
  description: string;
  category: LetterTemplateCategory;
  content: string;
  created_at?: string;
  updated_at?: string;
};
