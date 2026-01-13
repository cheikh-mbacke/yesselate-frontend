/**
 * Configuration Globale des Services
 * ===================================
 * 
 * Configuration centralisée pour tous les services BMO
 */

// ============================================
// TYPES
// ============================================

export interface ServiceConfig {
  apiBaseUrl: string;
  wsBaseUrl?: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableMocks: boolean;
  enableLogs: boolean;
}

export interface FeatureFlags {
  enableNotifications: boolean;
  enableWorkflows: boolean;
  enableAnalytics: boolean;
  enableAlerts: boolean;
  enableComments: boolean;
  enableExport: boolean;
  enableDocuments: boolean;
  enableAudit: boolean;
  enableSearch: boolean;
}

// ============================================
// CONFIGURATION PAR DÉFAUT
// ============================================

const defaultConfig: ServiceConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  wsBaseUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000',
  timeout: 30000, // 30 secondes
  retryAttempts: 3,
  retryDelay: 1000, // 1 seconde
  enableMocks: process.env.NODE_ENV === 'development',
  enableLogs: process.env.NODE_ENV === 'development',
};

const defaultFeatureFlags: FeatureFlags = {
  enableNotifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== 'false',
  enableWorkflows: process.env.NEXT_PUBLIC_ENABLE_WORKFLOWS !== 'false',
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false',
  enableAlerts: process.env.NEXT_PUBLIC_ENABLE_ALERTS !== 'false',
  enableComments: process.env.NEXT_PUBLIC_ENABLE_COMMENTS !== 'false',
  enableExport: process.env.NEXT_PUBLIC_ENABLE_EXPORT !== 'false',
  enableDocuments: process.env.NEXT_PUBLIC_ENABLE_DOCUMENTS !== 'false',
  enableAudit: process.env.NEXT_PUBLIC_ENABLE_AUDIT !== 'false',
  enableSearch: process.env.NEXT_PUBLIC_ENABLE_SEARCH !== 'false',
};

// ============================================
// CLASSE DE CONFIGURATION
// ============================================

class ConfigManager {
  private config: ServiceConfig;
  private features: FeatureFlags;

  constructor() {
    this.config = { ...defaultConfig };
    this.features = { ...defaultFeatureFlags };
  }

  /**
   * Récupère la configuration des services
   */
  getServiceConfig(): ServiceConfig {
    return { ...this.config };
  }

  /**
   * Met à jour la configuration des services
   */
  updateServiceConfig(updates: Partial<ServiceConfig>): void {
    this.config = { ...this.config, ...updates };
    if (this.config.enableLogs) {
      console.log('📝 Configuration mise à jour:', updates);
    }
  }

  /**
   * Récupère les feature flags
   */
  getFeatureFlags(): FeatureFlags {
    return { ...this.features };
  }

  /**
   * Vérifie si une fonctionnalité est activée
   */
  isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    return this.features[feature];
  }

  /**
   * Active/désactive une fonctionnalité
   */
  toggleFeature(feature: keyof FeatureFlags, enabled: boolean): void {
    this.features[feature] = enabled;
    if (this.config.enableLogs) {
      console.log(`🎯 Feature "${feature}": ${enabled ? 'activée' : 'désactivée'}`);
    }
  }

  /**
   * Récupère l'URL de base de l'API
   */
  getApiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  /**
   * Récupère l'URL de base WebSocket
   */
  getWsBaseUrl(): string {
    return this.config.wsBaseUrl || this.config.apiBaseUrl.replace('http', 'ws');
  }

  /**
   * Vérifie si les mocks sont activés
   */
  isMockEnabled(): boolean {
    return this.config.enableMocks;
  }

  /**
   * Vérifie si les logs sont activés
   */
  isLogEnabled(): boolean {
    return this.config.enableLogs;
  }

  /**
   * Réinitialise la configuration par défaut
   */
  reset(): void {
    this.config = { ...defaultConfig };
    this.features = { ...defaultFeatureFlags };
    if (this.config.enableLogs) {
      console.log('🔄 Configuration réinitialisée');
    }
  }

  /**
   * Affiche la configuration actuelle
   */
  debug(): void {
    console.group('🔧 Configuration BMO');
    console.log('Services:', this.config);
    console.log('Features:', this.features);
    console.groupEnd();
  }
}

// ============================================
// INSTANCE SINGLETON
// ============================================

export const configManager = new ConfigManager();

// ============================================
// UTILITAIRES
// ============================================

/**
 * Helper pour créer une URL d'API complète
 */
export function buildApiUrl(endpoint: string, params?: Record<string, string | number>): string {
  const baseUrl = configManager.getApiBaseUrl();
  const url = new URL(endpoint, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  return url.toString();
}

/**
 * Helper pour faire un fetch avec la configuration
 */
export async function fetchWithConfig<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const config = configManager.getServiceConfig();
  const url = buildApiUrl(endpoint);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout après ${config.timeout}ms`);
    }

    throw error;
  }
}

/**
 * Helper pour faire un fetch avec retry automatique
 */
export async function fetchWithRetry<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const config = configManager.getServiceConfig();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.retryAttempts; attempt++) {
    try {
      return await fetchWithConfig<T>(endpoint, options);
    } catch (error) {
      lastError = error as Error;

      if (attempt < config.retryAttempts) {
        if (config.enableLogs) {
          console.warn(`⚠️ Tentative ${attempt + 1}/${config.retryAttempts} échouée, retry dans ${config.retryDelay}ms`);
        }

        await new Promise(resolve => setTimeout(resolve, config.retryDelay * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Échec après plusieurs tentatives');
}

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default configManager;

