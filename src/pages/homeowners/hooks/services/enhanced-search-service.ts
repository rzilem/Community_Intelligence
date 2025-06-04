import { FormattedResident } from '../types/resident-types';

interface SearchIndex {
  id: string;
  searchableText: string;
  resident: FormattedResident;
  searchTerms: string[];
}

interface SearchFilters {
  searchTerm?: string;
  statusFilter?: string;
  associationFilter?: string;
  typeFilter?: string;
  hasBalance?: boolean;
  hasViolations?: boolean;
}

class EnhancedSearchService {
  private searchIndex: Map<string, SearchIndex> = new Map();
  private lastIndexedData: FormattedResident[] = [];

  buildSearchIndex(residents: FormattedResident[]): void {
    // Only rebuild if data has changed
    if (this.lastIndexedData === residents) return;
    
    console.log(`🔍 Building search index for ${residents.length} residents`);
    const startTime = performance.now();
    
    this.searchIndex.clear();
    
    residents.forEach(resident => {
      const searchableText = this.createSearchableText(resident);
      const searchTerms = this.extractSearchTerms(searchableText);
      
      this.searchIndex.set(resident.id, {
        id: resident.id,
        searchableText,
        resident,
        searchTerms
      });
    });
    
    this.lastIndexedData = residents;
    
    const endTime = performance.now();
    console.log(`✅ Search index built in ${(endTime - startTime).toFixed(2)}ms`);
  }

  private createSearchableText(resident: FormattedResident): string {
    return [
      resident.name,
      resident.email,
      resident.phone,
      resident.propertyAddress,
      resident.type,
      resident.status,
      resident.associationName,
      resident.unitNumber,
      resident.property,
      resident.unit,
      ...(resident.tags || []),
      ...(resident.violations || [])
    ].filter(Boolean).join(' ').toLowerCase();
  }

  private extractSearchTerms(text: string): string[] {
    return text
      .split(/\s+/)
      .filter(term => term.length > 1)
      .map(term => term.replace(/[^\w]/g, ''));
  }

  search(residents: FormattedResident[], filters: SearchFilters): FormattedResident[] {
    // Build index if needed
    this.buildSearchIndex(residents);
    
    let filteredResidents = residents;

    // Apply non-search filters first (most selective)
    if (filters.associationFilter && filters.associationFilter !== 'all') {
      filteredResidents = filteredResidents.filter(r => r.association === filters.associationFilter);
    }

    if (filters.statusFilter && filters.statusFilter !== 'all') {
      filteredResidents = filteredResidents.filter(r => r.status === filters.statusFilter);
    }

    if (filters.typeFilter && filters.typeFilter !== 'all') {
      filteredResidents = filteredResidents.filter(r => r.type === filters.typeFilter);
    }

    if (filters.hasBalance) {
      filteredResidents = filteredResidents.filter(r => (r.balance || 0) > 0);
    }

    if (filters.hasViolations) {
      filteredResidents = filteredResidents.filter(r => (r.violations || []).length > 0);
    }

    // Apply search filter last
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchTerms = filters.searchTerm.toLowerCase().split(/\s+/).filter(term => term.length > 0);
      
      filteredResidents = filteredResidents.filter(resident => {
        const indexEntry = this.searchIndex.get(resident.id);
        if (!indexEntry) return false;
        
        return searchTerms.every(term => 
          indexEntry.searchableText.includes(term) ||
          indexEntry.searchTerms.some(indexTerm => indexTerm.includes(term))
        );
      });
    }

    return filteredResidents;
  }

  // Advanced search with weighted results
  searchWithRelevance(residents: FormattedResident[], searchTerm: string): FormattedResident[] {
    if (!searchTerm.trim()) return residents;

    this.buildSearchIndex(residents);
    
    const searchTerms = searchTerm.toLowerCase().split(/\s+/).filter(term => term.length > 0);
    const results: { resident: FormattedResident; relevance: number }[] = [];

    residents.forEach(resident => {
      const indexEntry = this.searchIndex.get(resident.id);
      if (!indexEntry) return;

      let relevance = 0;

      searchTerms.forEach(term => {
        // Exact name match gets highest score
        if (resident.name.toLowerCase().includes(term)) relevance += 10;
        
        // Email match gets high score
        if (resident.email.toLowerCase().includes(term)) relevance += 8;
        
        // Property address match
        if (resident.propertyAddress.toLowerCase().includes(term)) relevance += 6;
        
        // Phone number match
        if (resident.phone.includes(term)) relevance += 6;
        
        // Other field matches
        if (indexEntry.searchableText.includes(term)) relevance += 2;
        
        // Partial term matches
        indexEntry.searchTerms.forEach(indexTerm => {
          if (indexTerm.includes(term)) relevance += 1;
        });
      });

      if (relevance > 0) {
        results.push({ resident, relevance });
      }
    });

    // Sort by relevance score descending
    return results
      .sort((a, b) => b.relevance - a.relevance)
      .map(result => result.resident);
  }

  // Get search suggestions based on current index
  getSearchSuggestions(partialTerm: string, limit: number = 10): string[] {
    if (!partialTerm.trim() || partialTerm.length < 2) return [];

    const suggestions = new Set<string>();
    const lowerPartial = partialTerm.toLowerCase();

    this.searchIndex.forEach(({ resident }) => {
      // Add name suggestions
      if (resident.name.toLowerCase().includes(lowerPartial)) {
        suggestions.add(resident.name);
      }
      
      // Add property address suggestions
      if (resident.propertyAddress.toLowerCase().includes(lowerPartial)) {
        suggestions.add(resident.propertyAddress);
      }
      
      // Add association name suggestions
      if (resident.associationName.toLowerCase().includes(lowerPartial)) {
        suggestions.add(resident.associationName);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  clearIndex(): void {
    this.searchIndex.clear();
    this.lastIndexedData = [];
  }

  getIndexStats() {
    return {
      indexSize: this.searchIndex.size,
      lastIndexedCount: this.lastIndexedData.length,
      memoryUsage: `${Math.round(JSON.stringify(Array.from(this.searchIndex.values())).length / 1024)}KB`
    };
  }
}

export const enhancedSearchService = new EnhancedSearchService();

// Export for debugging in development
if (import.meta.env.DEV) {
  (window as any).enhancedSearchService = enhancedSearchService;
}
