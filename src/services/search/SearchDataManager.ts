
import { supabase } from '@/integrations/supabase/client';

export interface SearchDataSource {
  key: string;
  priority: number;
  isLoaded: boolean;
  isLoading: boolean;
  lastFetched?: Date;
  data?: any[];
  error?: Error;
}

export interface SearchDataState {
  associations: SearchDataSource;
  homeownerRequests: SearchDataSource;
  leads: SearchDataSource;
  invoices: SearchDataSource;
}

class SearchDataManager {
  private state: SearchDataState = {
    associations: { key: 'associations', priority: 1, isLoaded: false, isLoading: false },
    homeownerRequests: { key: 'homeownerRequests', priority: 2, isLoaded: false, isLoading: false },
    leads: { key: 'leads', priority: 3, isLoaded: false, isLoading: false },
    invoices: { key: 'invoices', priority: 4, isLoaded: false, isLoading: false },
  };

  private listeners: Set<() => void> = new Set();
  private abortControllers: Map<string, AbortController> = new Map();
  private refreshIntervals: Map<string, NodeJS.Timeout> = new Map();

  // Cache expiry time (5 minutes)
  private readonly CACHE_EXPIRY_MS = 5 * 60 * 1000;
  
  // Background refresh interval (10 minutes)
  private readonly BACKGROUND_REFRESH_MS = 10 * 60 * 1000;

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  getState(): SearchDataState {
    return { ...this.state };
  }

  private updateDataSource(key: keyof SearchDataState, updates: Partial<SearchDataSource>) {
    this.state[key] = { ...this.state[key], ...updates };
    this.notify();
  }

  private isDataFresh(dataSource: SearchDataSource): boolean {
    if (!dataSource.lastFetched) return false;
    return Date.now() - dataSource.lastFetched.getTime() < this.CACHE_EXPIRY_MS;
  }

  async loadDataSource(key: keyof SearchDataState, force = false): Promise<void> {
    const dataSource = this.state[key];
    
    // Skip if already loading or fresh data exists
    if (dataSource.isLoading || (!force && this.isDataFresh(dataSource))) {
      return;
    }

    // Cancel any existing request
    this.cancelRequest(key);

    const abortController = new AbortController();
    this.abortControllers.set(key, abortController);

    this.updateDataSource(key, { isLoading: true, error: undefined });

    try {
      let data: any[] = [];

      switch (key) {
        case 'associations':
          const { data: associations } = await supabase
            .from('associations')
            .select('*')
            .abortSignal(abortController.signal);
          data = associations || [];
          break;

        case 'homeownerRequests':
          const { data: requests } = await supabase
            .from('homeowner_requests')
            .select('*')
            .abortSignal(abortController.signal);
          data = requests || [];
          break;

        case 'leads':
          const { data: leads } = await supabase
            .from('leads')
            .select('*')
            .abortSignal(abortController.signal);
          data = leads || [];
          break;

        case 'invoices':
          const { data: invoices } = await supabase
            .from('invoices')
            .select('*')
            .abortSignal(abortController.signal);
          data = invoices || [];
          break;
      }

      this.updateDataSource(key, {
        isLoading: false,
        isLoaded: true,
        data,
        lastFetched: new Date(),
        error: undefined
      });

    } catch (error) {
      if (error.name !== 'AbortError') {
        this.updateDataSource(key, {
          isLoading: false,
          error: error as Error
        });
      }
    } finally {
      this.abortControllers.delete(key);
    }
  }

  private cancelRequest(key: keyof SearchDataState) {
    const controller = this.abortControllers.get(key);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(key);
    }
  }

  async loadProgressively(): Promise<void> {
    // Load data sources in priority order with staggered timing
    const sources = Object.entries(this.state)
      .sort(([, a], [, b]) => a.priority - b.priority);

    for (let i = 0; i < sources.length; i++) {
      const [key] = sources[i] as [keyof SearchDataState, SearchDataSource];
      
      // Start loading immediately for highest priority, with delays for others
      if (i === 0) {
        this.loadDataSource(key);
      } else {
        setTimeout(() => this.loadDataSource(key), i * 100);
      }
    }
  }

  startBackgroundRefresh() {
    // Set up background refresh for each data source
    Object.keys(this.state).forEach(key => {
      const typedKey = key as keyof SearchDataState;
      const interval = setInterval(() => {
        if (this.isDataStale(this.state[typedKey])) {
          this.loadDataSource(typedKey);
        }
      }, this.BACKGROUND_REFRESH_MS);
      
      this.refreshIntervals.set(key, interval);
    });
  }

  private isDataStale(dataSource: SearchDataSource): boolean {
    if (!dataSource.lastFetched) return true;
    return Date.now() - dataSource.lastFetched.getTime() > this.BACKGROUND_REFRESH_MS;
  }

  preloadCriticalData() {
    // Preload associations and recent requests in the background
    this.loadDataSource('associations');
    
    // Delay loading of other sources to avoid blocking
    setTimeout(() => this.loadDataSource('homeownerRequests'), 200);
  }

  cancelAllRequests() {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }

  cleanup() {
    this.cancelAllRequests();
    this.refreshIntervals.forEach(interval => clearInterval(interval));
    this.refreshIntervals.clear();
    this.listeners.clear();
  }
}

// Singleton instance
export const searchDataManager = new SearchDataManager();
