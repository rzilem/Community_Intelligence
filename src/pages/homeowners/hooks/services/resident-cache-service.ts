
import { FormattedResident, AssociationData } from '../types/resident-types';

interface CacheEntry {
  data: FormattedResident[];
  timestamp: number;
  associationIds: string[];
}

class ResidentCacheService {
  private cache: Map<string, CacheEntry> = new Map<string, CacheEntry>();
  private readonly CACHE_TTL: number = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(associationIds: string[]): string {
    return associationIds.sort().join(',') || 'all';
  }

  get(associationIds: string[]): FormattedResident[] | null {
    const key: string = this.getCacheKey(associationIds);
    const entry: CacheEntry | undefined = this.cache.get(key);
    
    if (!entry) return null;
    
    const isExpired: boolean = Date.now() - entry.timestamp > this.CACHE_TTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set(associationIds: string[], data: FormattedResident[]): void {
    const key: string = this.getCacheKey(associationIds);
    this.cache.set(key, {
      data: [...data], // Create a copy to prevent mutations
      timestamp: Date.now(),
      associationIds: [...associationIds]
    });
  }

  invalidate(associationId?: string): void {
    if (!associationId) {
      this.cache.clear();
      return;
    }
    
    // Remove entries that include the specified association
    for (const [key, entry] of this.cache.entries()) {
      if (entry.associationIds.includes(associationId)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

export const residentCacheService: ResidentCacheService = new ResidentCacheService();
