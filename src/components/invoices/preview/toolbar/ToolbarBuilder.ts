
import { ViewConfig, ActionConfig, ToolbarState, ToolbarBuilderConfig, ViewType } from './types';
import { VIEW_CONFIGS, ACTION_CONFIGS } from './config';

/**
 * Builder class for constructing toolbar configurations
 */
export class ToolbarBuilder {
  private config: ToolbarBuilderConfig;

  constructor(config: ToolbarBuilderConfig) {
    this.config = config;
  }

  /**
   * Build the complete toolbar state
   */
  build(): ToolbarState {
    const views = this.buildViews();
    const actions = this.buildActions();
    const currentView = this.determineCurrentView(views);

    return {
      currentView,
      views,
      actions,
      isCompact: this.shouldUseCompactLayout(),
      showAdvanced: this.shouldShowAdvanced()
    };
  }

  private buildViews(): ViewConfig[] {
    const views: ViewConfig[] = [];

    // Build views based on configuration
    if (this.config.views.html) {
      views.push({
        ...VIEW_CONFIGS.html,
        available: true
      });
    }

    if (this.config.views.pdf) {
      views.push({
        ...VIEW_CONFIGS.pdf,
        available: true
      });
    }

    if (this.config.views.email) {
      views.push({
        ...VIEW_CONFIGS.email,
        available: true
      });
    }

    return views;
  }

  private buildActions(): ActionConfig[] {
    const actions: ActionConfig[] = [];

    // External PDF action
    if (this.config.actions.external && this.config.callbacks.onExternalOpen) {
      actions.push({
        ...ACTION_CONFIGS.external,
        onClick: this.config.callbacks.onExternalOpen
      });
    }

    // Validation action
    if (this.config.actions.validate && this.config.callbacks.onValidate) {
      actions.push({
        ...ACTION_CONFIGS.validate,
        onClick: this.config.callbacks.onValidate,
        disabled: this.config.state.isValidating,
        loading: this.config.state.isValidating,
        label: this.config.state.isValidating ? 'Validating...' : 'Validate Content'
      });
    }

    // Retry action
    if (this.config.actions.retry && this.config.callbacks.onRetry && this.config.state.canRetry) {
      actions.push({
        ...ACTION_CONFIGS.retry,
        onClick: this.config.callbacks.onRetry
      });
    }

    // Debug action
    if (this.config.actions.debug && this.config.callbacks.onShowStorageDebug) {
      actions.push({
        ...ACTION_CONFIGS.debug,
        onClick: this.config.callbacks.onShowStorageDebug
      });
    }

    // Settings action
    if (this.config.actions.settings && this.config.callbacks.onShowSettings) {
      actions.push({
        ...ACTION_CONFIGS.settings,
        onClick: this.config.callbacks.onShowSettings
      });
    }

    // Fullscreen action
    if (this.config.actions.fullscreen && this.config.callbacks.onToggleFullscreen) {
      actions.push({
        ...ACTION_CONFIGS.fullscreen,
        onClick: this.config.callbacks.onToggleFullscreen
      });
    }

    return actions;
  }

  private determineCurrentView(views: ViewConfig[]): ViewType {
    // Prefer recommended views first
    const recommendedView = views.find(v => v.recommended && v.available);
    if (recommendedView) {
      return recommendedView.id;
    }

    // Fall back to first available view
    const firstAvailable = views.find(v => v.available);
    return firstAvailable?.id || 'pdf';
  }

  private shouldUseCompactLayout(): boolean {
    // Use compact layout on smaller screens or when many actions are present
    return window.innerWidth < 768 || this.config.actions && Object.keys(this.config.actions).length > 4;
  }

  private shouldShowAdvanced(): boolean {
    return this.config.state.hasErrors || false;
  }

  /**
   * Static factory method for common configurations
   */
  static createDefault(config: Partial<ToolbarBuilderConfig>): ToolbarBuilder {
    const defaultConfig: ToolbarBuilderConfig = {
      views: {
        pdf: true,
        html: true,
        email: true
      },
      actions: {
        external: true,
        fullscreen: true,
        settings: true,
        validate: true,
        retry: true,
        debug: true
      },
      state: {
        isValidating: false,
        canRetry: false,
        hasErrors: false
      },
      callbacks: {},
      ...config
    };

    return new ToolbarBuilder(defaultConfig);
  }
}
