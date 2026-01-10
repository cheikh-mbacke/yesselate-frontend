/**
 * SERVICE DE MONITORING & MÉTRIQUES
 * 
 * Collecte et agrège des métriques pour :
 * - Performance (latence API, queries DB)
 * - Utilisation (requêtes, utilisateurs actifs)
 * - Erreurs et exceptions
 * - Business metrics (événements créés, délégations, etc.)
 * - Santé système
 */

// ============================================
// TYPES
// ============================================

export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';

export interface Metric {
  name: string;
  type: MetricType;
  value: number;
  labels?: Record<string, string>;
  timestamp: number;
}

export interface PerformanceMetric {
  operation: string;
  duration: number;
  success: boolean;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface ErrorMetric {
  type: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
  timestamp: number;
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  message?: string;
  timestamp: number;
}

// ============================================
// SERVICE
// ============================================

export class MonitoringService {
  private static instance: MonitoringService;
  private metrics: Map<string, Metric[]> = new Map();
  private performanceMetrics: PerformanceMetric[] = [];
  private errorMetrics: ErrorMetric[] = [];
  private healthChecks: Map<string, HealthCheck> = new Map();

  // Limites de stockage en mémoire
  private readonly MAX_METRICS = 10000;
  private readonly MAX_PERFORMANCE = 5000;
  private readonly MAX_ERRORS = 1000;

  private constructor() {
    this.startAggregationWorker();
    this.startHealthCheckWorker();
  }

  public static getInstance(): MonitoringService {
    if (!this.instance) {
      this.instance = new MonitoringService();
    }
    return this.instance;
  }

  // ============================================
  // MÉTRIQUES GÉNÉRALES
  // ============================================

  /**
   * Incrémenter un compteur
   */
  incrementCounter(name: string, labels?: Record<string, string>, value: number = 1): void {
    const metric: Metric = {
      name,
      type: 'counter',
      value,
      labels,
      timestamp: Date.now(),
    };

    this.addMetric(name, metric);
  }

  /**
   * Définir une jauge
   */
  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    const metric: Metric = {
      name,
      type: 'gauge',
      value,
      labels,
      timestamp: Date.now(),
    };

    this.addMetric(name, metric);
  }

  /**
   * Enregistrer une valeur d'histogramme
   */
  recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const metric: Metric = {
      name,
      type: 'histogram',
      value,
      labels,
      timestamp: Date.now(),
    };

    this.addMetric(name, metric);
  }

  // ============================================
  // MÉTRIQUES DE PERFORMANCE
  // ============================================

  /**
   * Enregistrer une performance
   */
  recordPerformance(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    this.performanceMetrics.push({
      ...metric,
      timestamp: Date.now(),
    });

    // Limiter taille
    if (this.performanceMetrics.length > this.MAX_PERFORMANCE) {
      this.performanceMetrics.shift();
    }

    // Enregistrer comme histogramme
    this.recordHistogram(
      `performance.${metric.operation}`,
      metric.duration,
      { success: metric.success.toString() }
    );
  }

  /**
   * Mesurer le temps d'exécution d'une fonction
   */
  async measure<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const start = Date.now();
    let success = true;
    let error: any;

    try {
      const result = await fn();
      return result;
    } catch (e) {
      success = false;
      error = e;
      throw e;
    } finally {
      const duration = Date.now() - start;
      
      this.recordPerformance({
        operation,
        duration,
        success,
        metadata: {
          ...metadata,
          error: error?.message,
        },
      });
    }
  }

  /**
   * Obtenir stats de performance
   */
  getPerformanceStats(operation?: string): any {
    let metrics = this.performanceMetrics;

    if (operation) {
      metrics = metrics.filter(m => m.operation === operation);
    }

    if (metrics.length === 0) {
      return null;
    }

    const durations = metrics.map(m => m.duration);
    const successes = metrics.filter(m => m.success).length;

    return {
      count: metrics.length,
      successRate: (successes / metrics.length) * 100,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      p50: this.percentile(durations, 50),
      p95: this.percentile(durations, 95),
      p99: this.percentile(durations, 99),
    };
  }

  // ============================================
  // MÉTRIQUES D'ERREURS
  // ============================================

  /**
   * Enregistrer une erreur
   */
  recordError(error: Omit<ErrorMetric, 'timestamp'>): void {
    this.errorMetrics.push({
      ...error,
      timestamp: Date.now(),
    });

    // Limiter taille
    if (this.errorMetrics.length > this.MAX_ERRORS) {
      this.errorMetrics.shift();
    }

    // Incrémenter compteur d'erreurs
    this.incrementCounter('errors.total', { type: error.type });
  }

  /**
   * Obtenir erreurs récentes
   */
  getRecentErrors(limit: number = 10, type?: string): ErrorMetric[] {
    let errors = [...this.errorMetrics].reverse();

    if (type) {
      errors = errors.filter(e => e.type === type);
    }

    return errors.slice(0, limit);
  }

  /**
   * Obtenir stats d'erreurs
   */
  getErrorStats(): any {
    const byType: Record<string, number> = {};

    for (const error of this.errorMetrics) {
      byType[error.type] = (byType[error.type] || 0) + 1;
    }

    return {
      total: this.errorMetrics.length,
      byType,
      recent: this.getRecentErrors(5),
    };
  }

  // ============================================
  // HEALTH CHECKS
  // ============================================

  /**
   * Enregistrer un health check
   */
  registerHealthCheck(check: HealthCheck): void {
    this.healthChecks.set(check.service, check);
  }

  /**
   * Vérifier santé d'un service
   */
  async checkHealth(service: string, checkFn: () => Promise<boolean>): Promise<HealthCheck> {
    const start = Date.now();

    try {
      const healthy = await checkFn();
      const latency = Date.now() - start;

      const check: HealthCheck = {
        service,
        status: healthy ? 'healthy' : 'unhealthy',
        latency,
        timestamp: Date.now(),
      };

      this.registerHealthCheck(check);
      return check;
    } catch (error: any) {
      const check: HealthCheck = {
        service,
        status: 'unhealthy',
        message: error.message,
        timestamp: Date.now(),
      };

      this.registerHealthCheck(check);
      return check;
    }
  }

  /**
   * Obtenir état de santé global
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: HealthCheck[];
  } {
    const services = Array.from(this.healthChecks.values());

    if (services.length === 0) {
      return { status: 'healthy', services: [] };
    }

    const unhealthy = services.filter(s => s.status === 'unhealthy').length;
    const degraded = services.filter(s => s.status === 'degraded').length;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (unhealthy > 0) {
      status = 'unhealthy';
    } else if (degraded > 0) {
      status = 'degraded';
    }

    return { status, services };
  }

  // ============================================
  // MÉTRIQUES BUSINESS
  // ============================================

  /**
   * Tracker création d'événement calendrier
   */
  trackCalendarEventCreated(bureau?: string): void {
    this.incrementCounter('business.calendar.events.created', { bureau: bureau || 'all' });
  }

  /**
   * Tracker création de délégation
   */
  trackDelegationCreated(type: string): void {
    this.incrementCounter('business.delegation.created', { type });
  }

  /**
   * Tracker export
   */
  trackExport(type: string, format: string): void {
    this.incrementCounter('business.export', { type, format });
  }

  /**
   * Tracker login
   */
  trackLogin(success: boolean): void {
    this.incrementCounter('business.login', { success: success.toString() });
  }

  // ============================================
  // AGRÉGATION & EXPORT
  // ============================================

  /**
   * Obtenir toutes les métriques
   */
  getAllMetrics(): Record<string, Metric[]> {
    const result: Record<string, Metric[]> = {};
    
    for (const [name, metrics] of this.metrics.entries()) {
      result[name] = metrics;
    }

    return result;
  }

  /**
   * Obtenir snapshot complet
   */
  getSnapshot(): any {
    return {
      timestamp: Date.now(),
      metrics: this.summarizeMetrics(),
      performance: this.getPerformanceStats(),
      errors: this.getErrorStats(),
      health: this.getHealthStatus(),
    };
  }

  /**
   * Export en format Prometheus
   */
  exportPrometheus(): string {
    const lines: string[] = [];

    for (const [name, metrics] of this.metrics.entries()) {
      const latest = metrics[metrics.length - 1];
      if (!latest) continue;

      let labels = '';
      if (latest.labels) {
        const labelPairs = Object.entries(latest.labels)
          .map(([k, v]) => `${k}="${v}"`)
          .join(',');
        labels = `{${labelPairs}}`;
      }

      lines.push(`# TYPE ${name} ${latest.type}`);
      lines.push(`${name}${labels} ${latest.value}`);
    }

    return lines.join('\n');
  }

  // ============================================
  // HELPERS PRIVÉS
  // ============================================

  private addMetric(name: string, metric: Metric): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(metric);

    // Limiter taille par métrique
    if (metrics.length > 1000) {
      metrics.shift();
    }
  }

  private summarizeMetrics(): any {
    const summary: Record<string, any> = {};

    for (const [name, metrics] of this.metrics.entries()) {
      const latest = metrics[metrics.length - 1];
      
      if (latest.type === 'counter') {
        summary[name] = metrics.reduce((sum, m) => sum + m.value, 0);
      } else if (latest.type === 'gauge') {
        summary[name] = latest.value;
      } else {
        summary[name] = {
          count: metrics.length,
          latest: latest.value,
        };
      }
    }

    return summary;
  }

  private percentile(values: number[], p: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  private startAggregationWorker(): void {
    // Agréger et nettoyer toutes les 5 minutes
    setInterval(() => {
      console.log('[Monitoring] Aggregating metrics...');
      
      // Nettoyer vieilles métriques (> 1h)
      const cutoff = Date.now() - 3600000;
      
      for (const [name, metrics] of this.metrics.entries()) {
        const filtered = metrics.filter(m => m.timestamp > cutoff);
        this.metrics.set(name, filtered);
      }

      this.performanceMetrics = this.performanceMetrics.filter(m => m.timestamp > cutoff);
      this.errorMetrics = this.errorMetrics.filter(m => m.timestamp > cutoff);
    }, 5 * 60 * 1000);
  }

  private startHealthCheckWorker(): void {
    // Vérifier santé toutes les 30s
    setInterval(async () => {
      // Health check DB
      await this.checkHealth('database', async () => {
        // TODO: Ping database
        return true;
      });

      // Health check Cache
      await this.checkHealth('cache', async () => {
        // TODO: Ping cache
        return true;
      });

      // Nettoyer vieux checks
      const cutoff = Date.now() - 300000; // 5 min
      for (const [service, check] of this.healthChecks.entries()) {
        if (check.timestamp < cutoff) {
          this.healthChecks.delete(service);
        }
      }
    }, 30000);
  }
}

// ============================================
// EXPORTS & HELPERS
// ============================================

export const monitoring = MonitoringService.getInstance();

/**
 * Décorateur pour mesurer performance
 */
export function Measure(operation?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const opName = operation || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      return monitoring.measure(
        opName,
        () => originalMethod.apply(this, args)
      );
    };

    return descriptor;
  };
}

/**
 * Helper pour mesurer sync
 */
export function measureSync<T>(operation: string, fn: () => T): T {
  const start = Date.now();
  let success = true;

  try {
    const result = fn();
    return result;
  } catch (error) {
    success = false;
    throw error;
  } finally {
    const duration = Date.now() - start;
    monitoring.recordPerformance({ operation, duration, success });
  }
}

export default monitoring;

