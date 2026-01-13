/**
 * Système d'alertes métier intelligentes pour les délégations
 * Détecte automatiquement les situations à risque et propose des actions
 */

export interface BusinessAlert {
  id: string;
  type: 'expiration' | 'conflict' | 'anomaly' | 'compliance' | 'risk' | 'opportunity';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  affectedDelegations: string[];
  suggestedActions: AlertAction[];
  detectedAt: Date;
  autoResolvable: boolean;
  businessImpact: string;
  metadata?: Record<string, any>;
}

export interface AlertAction {
  id: string;
  label: string;
  type: 'extend' | 'transfer' | 'suspend' | 'notify' | 'escalate' | 'custom';
  automated: boolean;
  requiresApproval: boolean;
  estimatedTime?: string;
  execute: () => Promise<void>;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: (delegation: any, context: any) => boolean;
  severity: BusinessAlert['severity'];
  type: BusinessAlert['type'];
  createAlert: (delegation: any, context: any) => BusinessAlert;
  enabled: boolean;
}

/**
 * Moteur de détection d'alertes métier
 */
export class BusinessAlertEngine {
  private rules: AlertRule[] = [];
  private alerts: BusinessAlert[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Règles métier par défaut
   */
  private initializeDefaultRules() {
    // Règle 1: Expiration imminente (< 7 jours)
    this.rules.push({
      id: 'exp-imminent',
      name: 'Expiration imminente',
      condition: (del, ctx) => {
        const daysUntilExpiry = this.getDaysUntilExpiry(del.endDate);
        return daysUntilExpiry > 0 && daysUntilExpiry <= 7 && del.status === 'active';
      },
      severity: 'high',
      type: 'expiration',
      createAlert: (del, ctx) => ({
        id: `exp-${del.id}-${Date.now()}`,
        type: 'expiration',
        severity: 'high',
        title: 'Délégation expire dans moins de 7 jours',
        description: `La délégation de ${del.agentName} (${del.type}) expire le ${this.formatDate(del.endDate)}. Action requise pour éviter une interruption.`,
        affectedDelegations: [del.id],
        suggestedActions: [
          {
            id: 'extend',
            label: 'Prolonger de 30 jours',
            type: 'extend',
            automated: true,
            requiresApproval: false,
            estimatedTime: '2 min',
            execute: async () => this.extendDelegation(del.id, 30),
          },
          {
            id: 'transfer',
            label: 'Transférer à un remplaçant',
            type: 'transfer',
            automated: false,
            requiresApproval: true,
            estimatedTime: '15 min',
            execute: async () => this.openTransferWizard(del.id),
          },
        ],
        detectedAt: new Date(),
        autoResolvable: true,
        businessImpact: 'Risque d\'interruption de service si non résolu',
      }),
      enabled: true,
    });

    // Règle 2: Conflit de délégations multiples
    this.rules.push({
      id: 'conflict-multiple',
      name: 'Conflit de délégations',
      condition: (del, ctx) => {
        return ctx.activeDelegations.filter((d: any) => 
          d.agentId === del.agentId && 
          d.bureau === del.bureau && 
          d.type === del.type &&
          d.id !== del.id
        ).length > 0;
      },
      severity: 'medium',
      type: 'conflict',
      createAlert: (del, ctx) => ({
        id: `conflict-${del.id}-${Date.now()}`,
        type: 'conflict',
        severity: 'medium',
        title: 'Délégations en conflit détectées',
        description: `${del.agentName} possède plusieurs délégations actives du même type sur ${del.bureau}. Risque d'ambiguïté.`,
        affectedDelegations: [del.id, ...ctx.conflicts.map((d: any) => d.id)],
        suggestedActions: [
          {
            id: 'consolidate',
            label: 'Consolider en une seule délégation',
            type: 'custom',
            automated: false,
            requiresApproval: true,
            execute: async () => this.consolidateDelegations(ctx.conflicts),
          },
          {
            id: 'clarify',
            label: 'Clarifier les périmètres',
            type: 'custom',
            automated: false,
            requiresApproval: false,
            execute: async () => this.openClarificationDialog(ctx.conflicts),
          },
        ],
        detectedAt: new Date(),
        autoResolvable: false,
        businessImpact: 'Risque d\'ambiguïté dans l\'exercice des pouvoirs',
      }),
      enabled: true,
    });

    // Règle 3: Anomalie de montant
    this.rules.push({
      id: 'anomaly-amount',
      name: 'Anomalie de montant',
      condition: (del, ctx) => {
        if (!del.maxAmount) return false;
        const avgAmount = ctx.averageMaxAmount || 50000;
        return del.maxAmount > avgAmount * 3; // 3x la moyenne
      },
      severity: 'medium',
      type: 'anomaly',
      createAlert: (del, ctx) => ({
        id: `anomaly-${del.id}-${Date.now()}`,
        type: 'anomaly',
        severity: 'medium',
        title: 'Montant inhabituellement élevé',
        description: `La délégation de ${del.agentName} a un plafond de ${this.formatAmount(del.maxAmount)}, bien supérieur à la moyenne (${this.formatAmount(ctx.averageMaxAmount)}).`,
        affectedDelegations: [del.id],
        suggestedActions: [
          {
            id: 'review',
            label: 'Demander une validation supplémentaire',
            type: 'escalate',
            automated: false,
            requiresApproval: false,
            execute: async () => this.escalateForReview(del.id),
          },
          {
            id: 'adjust',
            label: 'Ajuster le montant',
            type: 'custom',
            automated: false,
            requiresApproval: true,
            execute: async () => this.openAmountAdjustment(del.id),
          },
        ],
        detectedAt: new Date(),
        autoResolvable: false,
        businessImpact: 'Risque financier potentiel',
      }),
      enabled: true,
    });

    // Règle 4: Conformité - Absence de remplaçant
    this.rules.push({
      id: 'compliance-no-backup',
      name: 'Absence de remplaçant',
      condition: (del, ctx) => {
        return del.isCritical && !del.hasBackup && del.status === 'active';
      },
      severity: 'high',
      type: 'compliance',
      createAlert: (del, ctx) => ({
        id: `compliance-${del.id}-${Date.now()}`,
        type: 'compliance',
        severity: 'high',
        title: 'Délégation critique sans remplaçant',
        description: `La délégation critique de ${del.agentName} n'a pas de remplaçant désigné. Non-conformité au processus.`,
        affectedDelegations: [del.id],
        suggestedActions: [
          {
            id: 'assign-backup',
            label: 'Désigner un remplaçant',
            type: 'custom',
            automated: false,
            requiresApproval: false,
            estimatedTime: '10 min',
            execute: async () => this.openBackupAssignment(del.id),
          },
        ],
        detectedAt: new Date(),
        autoResolvable: false,
        businessImpact: 'Non-conformité au processus de gouvernance',
      }),
      enabled: true,
    });

    // Règle 5: Opportunité - Consolidation possible
    this.rules.push({
      id: 'opportunity-consolidation',
      name: 'Opportunité de consolidation',
      condition: (del, ctx) => {
        const similarDelegations = ctx.activeDelegations.filter((d: any) =>
          d.bureau === del.bureau &&
          d.type === del.type &&
          d.id !== del.id &&
          this.areSimilarScopes(d.scope, del.scope)
        );
        return similarDelegations.length >= 2;
      },
      severity: 'low',
      type: 'opportunity',
      createAlert: (del, ctx) => ({
        id: `opp-${del.id}-${Date.now()}`,
        type: 'opportunity',
        severity: 'low',
        title: 'Opportunité de simplification',
        description: `${ctx.similarCount} délégations similaires sur ${del.bureau} pourraient être consolidées pour simplifier la gestion.`,
        affectedDelegations: ctx.similarDelegations.map((d: any) => d.id),
        suggestedActions: [
          {
            id: 'consolidate',
            label: 'Lancer l\'assistant de consolidation',
            type: 'custom',
            automated: false,
            requiresApproval: true,
            execute: async () => this.launchConsolidationWizard(ctx.similarDelegations),
          },
        ],
        detectedAt: new Date(),
        autoResolvable: false,
        businessImpact: 'Amélioration de l\'efficacité opérationnelle',
      }),
      enabled: true,
    });

    // Règle 6: Risque - Usage anormalement faible
    this.rules.push({
      id: 'risk-low-usage',
      name: 'Usage anormalement faible',
      condition: (del, ctx) => {
        const daysSinceCreation = this.getDaysSince(del.createdAt);
        return daysSinceCreation > 30 && (del.usageCount || 0) < 3 && del.status === 'active';
      },
      severity: 'low',
      type: 'risk',
      createAlert: (del, ctx) => ({
        id: `risk-${del.id}-${Date.now()}`,
        type: 'risk',
        severity: 'low',
        title: 'Délégation sous-utilisée',
        description: `La délégation de ${del.agentName} n'a été utilisée que ${del.usageCount || 0} fois en ${this.getDaysSince(del.createdAt)} jours.`,
        affectedDelegations: [del.id],
        suggestedActions: [
          {
            id: 'review-necessity',
            label: 'Vérifier la nécessité',
            type: 'custom',
            automated: false,
            requiresApproval: false,
            execute: async () => this.reviewNecessity(del.id),
          },
          {
            id: 'suspend',
            label: 'Suspendre temporairement',
            type: 'suspend',
            automated: false,
            requiresApproval: true,
            execute: async () => this.suspendDelegation(del.id),
          },
        ],
        detectedAt: new Date(),
        autoResolvable: false,
        businessImpact: 'Optimisation des ressources',
      }),
      enabled: true,
    });
  }

  /**
   * Analyser une délégation et détecter les alertes
   */
  public analyzeDelegation(delegation: any, context: any): BusinessAlert[] {
    const newAlerts: BusinessAlert[] = [];

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      try {
        if (rule.condition(delegation, context)) {
          const alert = rule.createAlert(delegation, context);
          newAlerts.push(alert);
        }
      } catch (error) {
        console.error(`Error in rule ${rule.id}:`, error);
      }
    }

    return newAlerts;
  }

  /**
   * Analyser toutes les délégations
   */
  public analyzeAll(delegations: any[]): BusinessAlert[] {
    const context = this.buildAnalysisContext(delegations);
    const allAlerts: BusinessAlert[] = [];

    for (const delegation of delegations) {
      const delegationContext = {
        ...context,
        activeDelegations: delegations.filter(d => d.status === 'active'),
        conflicts: delegations.filter(d =>
          d.agentId === delegation.agentId &&
          d.bureau === delegation.bureau &&
          d.type === delegation.type &&
          d.id !== delegation.id &&
          d.status === 'active'
        ),
        similarDelegations: delegations.filter(d =>
          d.bureau === delegation.bureau &&
          d.type === delegation.type &&
          d.id !== delegation.id &&
          d.status === 'active'
        ),
        similarCount: 0,
      };

      delegationContext.similarCount = delegationContext.similarDelegations.length;

      const alerts = this.analyzeDelegation(delegation, delegationContext);
      allAlerts.push(...alerts);
    }

    this.alerts = allAlerts;
    return allAlerts;
  }

  /**
   * Construire le contexte d'analyse
   */
  private buildAnalysisContext(delegations: any[]) {
    const activeDelegations = delegations.filter(d => d.status === 'active');
    const amounts = activeDelegations
      .map(d => d.maxAmount)
      .filter(a => a && a > 0);

    const averageMaxAmount = amounts.length > 0
      ? amounts.reduce((sum, a) => sum + a, 0) / amounts.length
      : 50000;

    return {
      totalCount: delegations.length,
      activeCount: activeDelegations.length,
      averageMaxAmount,
      activeDelegations,
    };
  }

  // Helpers
  private getDaysUntilExpiry(endDate: string | Date): number {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private getDaysSince(date: string | Date): number {
    const start = new Date(date);
    const now = new Date();
    const diffTime = now.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  private formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }

  private areSimilarScopes(scope1: string, scope2: string): boolean {
    // Logique de comparaison de périmètres (à adapter selon le métier)
    return scope1 === scope2;
  }

  // Actions (à implémenter selon le contexte de l'application)
  private async extendDelegation(id: string, days: number) {
    console.log(`Extending delegation ${id} by ${days} days`);
  }

  private async openTransferWizard(id: string) {
    console.log(`Opening transfer wizard for ${id}`);
  }

  private async consolidateDelegations(delegations: any[]) {
    console.log(`Consolidating delegations:`, delegations);
  }

  private async openClarificationDialog(delegations: any[]) {
    console.log(`Opening clarification for:`, delegations);
  }

  private async escalateForReview(id: string) {
    console.log(`Escalating ${id} for review`);
  }

  private async openAmountAdjustment(id: string) {
    console.log(`Opening amount adjustment for ${id}`);
  }

  private async openBackupAssignment(id: string) {
    console.log(`Opening backup assignment for ${id}`);
  }

  private async launchConsolidationWizard(delegations: any[]) {
    console.log(`Launching consolidation wizard`);
  }

  private async reviewNecessity(id: string) {
    console.log(`Reviewing necessity of ${id}`);
  }

  private async suspendDelegation(id: string) {
    console.log(`Suspending delegation ${id}`);
  }

  /**
   * Obtenir toutes les alertes actives
   */
  public getAlerts(): BusinessAlert[] {
    return this.alerts;
  }

  /**
   * Filtrer les alertes par sévérité
   */
  public getAlertsBySeverity(severity: BusinessAlert['severity']): BusinessAlert[] {
    return this.alerts.filter(a => a.severity === severity);
  }

  /**
   * Obtenir les alertes critiques
   */
  public getCriticalAlerts(): BusinessAlert[] {
    return this.getAlertsBySeverity('critical');
  }

  /**
   * Marquer une alerte comme résolue
   */
  public resolveAlert(alertId: string) {
    this.alerts = this.alerts.filter(a => a.id !== alertId);
  }
}

/**
 * Instance singleton du moteur d'alertes
 */
export const businessAlertEngine = new BusinessAlertEngine();

