
interface VirtualizationConfig {
  itemHeight: number;
  containerHeight: number;
  overscan: number;
}

interface VirtualizedItems<T> {
  visibleItems: T[];
  startIndex: number;
  endIndex: number;
  totalHeight: number;
  offsetY: number;
}

class ResidentVirtualizationService {
  private defaultConfig: VirtualizationConfig = {
    itemHeight: 72, // Height of each resident row in pixels
    containerHeight: 600, // Default container height
    overscan: 5 // Number of items to render outside visible area
  };

  calculateVisibleItems<T>(
    items: T[],
    scrollTop: number,
    config: Partial<VirtualizationConfig> = {}
  ): VirtualizedItems<T> {
    const { itemHeight, containerHeight, overscan } = { ...this.defaultConfig, ...config };
    
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2);
    
    const visibleItems = items.slice(startIndex, endIndex);
    const totalHeight = items.length * itemHeight;
    const offsetY = startIndex * itemHeight;
    
    return {
      visibleItems,
      startIndex,
      endIndex,
      totalHeight,
      offsetY
    };
  }

  getScrollToIndex(index: number, itemHeight: number = this.defaultConfig.itemHeight): number {
    return index * itemHeight;
  }

  isItemVisible(
    itemIndex: number,
    scrollTop: number,
    containerHeight: number,
    itemHeight: number = this.defaultConfig.itemHeight
  ): boolean {
    const itemTop = itemIndex * itemHeight;
    const itemBottom = itemTop + itemHeight;
    const viewportBottom = scrollTop + containerHeight;
    
    return itemTop < viewportBottom && itemBottom > scrollTop;
  }
}

export const residentVirtualizationService = new ResidentVirtualizationService();
