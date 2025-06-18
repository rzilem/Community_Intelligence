
import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';

export interface AssociationCandidate {
  name: string;
  code?: string;
  confidence: number;
  source: 'folder' | 'filename' | 'data' | 'account_code';
  metadata?: Record<string, any>;
}

export interface CreatedAssociation {
  id: string;
  name: string;
  code?: string;
  isNew: boolean;
}

export const associationAutoCreationService = {
  async detectAssociationCandidates(
    folderNames: string[],
    fileNames: string[],
    dataRows: any[]
  ): Promise<AssociationCandidate[]> {
    const candidates: AssociationCandidate[] = [];
    
    // Detect from folder names (highest confidence)
    folderNames.forEach(folder => {
      if (this.isLikelyAssociationName(folder)) {
        candidates.push({
          name: this.normalizeAssociationName(folder),
          confidence: 0.95,
          source: 'folder',
          metadata: { originalFolder: folder }
        });
      }
    });
    
    // Detect from file names (medium confidence)
    fileNames.forEach(filename => {
      const associationName = this.extractAssociationFromFilename(filename);
      if (associationName) {
        candidates.push({
          name: associationName,
          confidence: 0.75,
          source: 'filename',
          metadata: { originalFilename: filename }
        });
      }
    });
    
    // Detect from data content (variable confidence)
    const dataAssociations = this.extractAssociationsFromData(dataRows);
    candidates.push(...dataAssociations);
    
    // Remove duplicates and return top candidates
    return this.deduplicateCandidates(candidates);
  },

  async createOrFindAssociations(candidates: AssociationCandidate[]): Promise<CreatedAssociation[]> {
    const results: CreatedAssociation[] = [];
    
    for (const candidate of candidates) {
      try {
        // First, try to find existing association
        const existing = await this.findExistingAssociation(candidate.name, candidate.code);
        
        if (existing) {
          results.push({
            id: existing.id,
            name: existing.name,
            code: existing.code,
            isNew: false
          });
          devLog.info('Found existing association:', existing.name);
        } else if (candidate.confidence > 0.8) {
          // Auto-create if confidence is high
          const created = await this.createNewAssociation(candidate);
          results.push(created);
          devLog.info('Auto-created association:', created.name);
        }
      } catch (error) {
        devLog.error('Error processing association candidate:', error);
      }
    }
    
    return results;
  },

  async findExistingAssociation(name: string, code?: string): Promise<any> {
    const normalizedName = this.normalizeAssociationName(name);
    
    const { data, error } = await supabase
      .from('associations')
      .select('id, name, code')
      .or(`name.ilike.%${normalizedName}%,code.eq.${code || ''}`)
      .limit(1);
    
    if (error) {
      devLog.error('Error finding association:', error);
      return null;
    }
    
    return data?.[0] || null;
  },

  async createNewAssociation(candidate: AssociationCandidate): Promise<CreatedAssociation> {
    const associationData = {
      name: candidate.name,
      code: candidate.code || this.generateAssociationCode(candidate.name),
      status: 'active',
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('associations')
      .insert(associationData)
      .select('id, name, code')
      .single();
    
    if (error) {
      throw new Error(`Failed to create association: ${error.message}`);
    }
    
    return {
      id: data.id,
      name: data.name,
      code: data.code,
      isNew: true
    };
  },

  isLikelyAssociationName(folderName: string): boolean {
    const normalized = folderName.toLowerCase();
    const indicators = [
      'hoa', 'association', 'community', 'condo', 'townhome',
      'estate', 'village', 'manor', 'court', 'place', 'heights',
      'ridge', 'view', 'park', 'gardens', 'club'
    ];
    
    return indicators.some(indicator => normalized.includes(indicator)) ||
           normalized.match(/^[a-z\s]+\s(hoa|association)$/i) !== null;
  },

  normalizeAssociationName(name: string): string {
    return name
      .replace(/[_-]/g, ' ')
      .replace(/\b(hoa|association)\b/gi, '')
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  },

  extractAssociationFromFilename(filename: string): string | null {
    // Remove file extensions and normalize
    const nameWithoutExt = filename.replace(/\.(csv|xlsx?|txt)$/i, '');
    
    // Look for patterns like "AssociationName_Properties" or "HOA_Name_Owners"
    const patterns = [
      /^([^_]+)_(?:properties|owners|financial|residents)/i,
      /^([^_]+)_hoa/i,
      /([a-z\s]+)\s*(?:hoa|association)/i
    ];
    
    for (const pattern of patterns) {
      const match = nameWithoutExt.match(pattern);
      if (match) {
        return this.normalizeAssociationName(match[1]);
      }
    }
    
    return null;
  },

  extractAssociationsFromData(dataRows: any[]): AssociationCandidate[] {
    const candidates: AssociationCandidate[] = [];
    
    // Sample first few rows to find association indicators
    const sampleRows = dataRows.slice(0, 10);
    
    for (const row of sampleRows) {
      Object.entries(row).forEach(([key, value]) => {
        if (typeof value === 'string' && this.isLikelyAssociationReference(key, value)) {
          candidates.push({
            name: this.normalizeAssociationName(value),
            confidence: 0.6,
            source: 'data',
            metadata: { field: key, value }
          });
        }
      });
    }
    
    return candidates;
  },

  isLikelyAssociationReference(fieldName: string, value: string): boolean {
    const field = fieldName.toLowerCase();
    const val = value.toLowerCase();
    
    return (
      (field.includes('association') || field.includes('hoa') || field.includes('community')) &&
      val.length > 3 &&
      val.length < 50 &&
      this.isLikelyAssociationName(value)
    );
  },

  generateAssociationCode(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 6);
  },

  deduplicateCandidates(candidates: AssociationCandidate[]): AssociationCandidate[] {
    const seen = new Map<string, AssociationCandidate>();
    
    candidates.forEach(candidate => {
      const key = this.normalizeAssociationName(candidate.name).toLowerCase();
      const existing = seen.get(key);
      
      if (!existing || candidate.confidence > existing.confidence) {
        seen.set(key, candidate);
      }
    });
    
    return Array.from(seen.values())
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10); // Limit to top 10 candidates
  }
};
