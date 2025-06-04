
import { FormattedResident } from '../types/resident-types';

interface SearchIndex {
  id: string;
  searchText: string;
  resident: FormattedResident;
}

class ResidentSearchService {
  private searchIndex: SearchIndex[] = [];
  private lastIndexedData: FormattedResident[] = [];

  buildSearchIndex(residents: FormattedResident[]): void {
    // Only rebuild if data has changed
    if (this.lastIndexedData === residents) return;
    
    this.searchIndex = residents.map(resident => ({
      id: resident.id,
      searchText: this.createSearchText(resident),
      resident
    }));
    
    this.lastIndexedData = residents;
  }

  private createSearchText(resident: FormattedResident): string {
    return [
      resident.name,
      resident.email,
      resident.phone,
      resident.propertyAddress,
      resident.type,
      resident.status,
      resident.associationName
    ].filter(Boolean).join(' ').toLowerCase();
  }

  search(query: string, residents: FormattedResident[]): FormattedResident[] {
    if (!query.trim()) return residents;
    
    // Build index if needed
    this.buildSearchIndex(residents);
    
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return this.searchIndex
      .filter(item => 
        searchTerms.every(term => item.searchText.includes(term))
      )
      .map(item => item.resident);
  }

  filterByStatus(residents: FormattedResident[], status: string): FormattedResident[] {
    if (status === 'all') return residents;
    return residents.filter(resident => resident.status === status);
  }

  filterByAssociation(residents: FormattedResident[], associationId: string): FormattedResident[] {
    if (associationId === 'all') return residents;
    return residents.filter(resident => resident.association === associationId);
  }

  applyAllFilters(
    residents: FormattedResident[],
    searchTerm: string,
    statusFilter: string,
    associationFilter: string
  ): FormattedResident[] {
    let filtered = residents;
    
    // Apply association filter first (most selective)
    filtered = this.filterByAssociation(filtered, associationFilter);
    
    // Apply status filter
    filtered = this.filterByStatus(filtered, statusFilter);
    
    // Apply search filter last
    filtered = this.search(searchTerm, filtered);
    
    return filtered;
  }
}

export const residentSearchService = new ResidentSearchService();
