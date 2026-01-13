/**
 * Système de détection automatique de conflits pour les délégations
 * Identifie les situations problématiques et les incohérences
 */

export type ConflictType =
  | 'duplicate' // Délégations en double
  | 'overlap' // Chevauchement de périmètres
  | 'hierarchy' // Conflit hiérarchique
  | 'temporal' // Conflittemporel (dates)
  | 'amount' // Conflit de montants
  | 'scope' // Conflits de périmètre
  | 'authorization'; // Conflits d'autorisation

export interface Conflict {
  id: string;
  type: ConflictType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedDelegations: string[];
  detectedAt: Date;
  resolved: boolean;
  resolutionSuggestions: ConflictResolution[];
  metadata?: Record<string, any>;
}

export interface ConflictResolution {
  id: string;
  action: string;
  description: string;
  automated: boolean;
  impact: string;
  execute: () => Promise<void>;
}

export interface ConflictRule {
  id: string;
  name: string;
  type: ConflictType;
  check: (delegations: any[]) => Conflict[];
  enabled: boolean;
}

/**
 * Détecteur de conflits
 */
export class ConflictDetector {
  private rules: ConflictRule[] = [];
  private conflicts: Map<string, Conflict> = new Map();

  constructor() {
    this.initializeRules();
  }

  /**
   * Initialiser les règles de détection
   */
  private initializeRules() {
    // Règle 1: Délégations en double
    this.rules.push({
      id: 'duplicate-delegation',
      name: 'Délégations en double',
      type: 'duplicate',
      check: (delegations) => {
        const conflicts: Conflict[] = [];
        const seen = new Map<string, any[]>();

        for (const del of delegations.filter(d => d.status === 'active')) {
          const key = `${del.agentId}-${del.type}-${del.bureau}`;
          if (!seen.has(key)) {
            seen.set(key, []);
          }
          seen.get(key)!.push(del);
        }

        for (const [key, dups] of seen) {
          if (dups.length > 1) {
            conflicts.push({
              id: `conflict-dup-${key}-${Date.now()}`,
              type: 'duplicate',
              severity: 'high',
              title: 'Délégations en double détectées',
              description: `${dups[0].agentName} possède ${dups.length} délégations identiques actives`,
              affectedDelegations: dups.map(d => d.id),
              detectedAt: new Date(),
              resolved: false,
              resolutionSuggestions: [
                {
                  id: 'merge',
                  action: 'Fusionner les délégations',
                  description: 'Créer une seule délégation consolidée',
                  automated: false,
                  impact: 'Les délégations en double seront révoquées',
                  execute: async () => this.mergeDelegations(dups),
                },
                {
                  id: 'keep-recent',
                  action: 'Conserver la plus récente',
                  description: 'Révoquer les anciennes délégations',
                  automated: true,
                  impact: 'Seule la délégation la plus récente sera conservée',
                  execute: async () => this.keepMostRecent(dups),
                },
              ],
            });
          }
        }

        return conflicts;
      },
      enabled: true,
    });

    // Règle 2: Chevauchement de périmètres
    this.rules.push({
      id: 'scope-overlap',
      name: 'Chevauchement de périmètres',
      type: 'overlap',
      check: (delegations) => {
        const conflicts: Conflict[] = [];
        const active = delegations.filter(d => d.status === 'active');

        for (let i = 0; i < active.length; i++) {
          for (let j = i + 1; j < active.length; j++) {
            const del1 = active[i];
            const del2 = active[j];

            if (
              del1.bureau === del2.bureau &&
              del1.type === del2.type &&
              this.scopesOverlap(del1.scope, del2.scope)
            ) {
              conflicts.push({
                id: `conflict-overlap-${del1.id}-${del2.id}`,
                type: 'overlap',
                severity: 'medium',
                title: 'Chevauchement de périmètres',
                description: `Les délégations de ${del1.agentName} et ${del2.agentName} ont des périmètres qui se chevauchent`,
                affectedDelegations: [del1.id, del2.id],
                detectedAt: new Date(),
                resolved: false,
                resolutionSuggestions: [
                  {
                    id: 'clarify',
                    action: 'Clarifier les périmètres',
                    description: 'Ajuster les périmètres pour éviter le chevauchement',
                    automated: false,
                    impact: 'Les périmètres seront modifiés',
                    execute: async () => this.clarifyScopes([del1, del2]),
                  },
                ],
              });
            }
          }
        }

        return conflicts;
      },
      enabled: true,
    });

    // Règle 3: Conflits hiérarchiques
    this.rules.push({
      id: 'hierarchy-conflict',
      name: 'Conflit hiérarchique',
      type: 'hierarchy',
      check: (delegations) => {
        const conflicts: Conflict[] = [];
        const active = delegations.filter(d => d.status === 'active');

        for (const del of active) {
          // Vérifier si l'agent délègue à son supérieur hiérarchique
          const conflicts_found = active.filter(
            d =>
              d.agentId === del.delegatorId &&
              d.delegatorId === del.agentId &&
              d.type === del.type
          );

          if (conflicts_found.length > 0) {
            conflicts.push({
              id: `conflict-hierarchy-${del.id}`,
              type: 'hierarchy',
              severity: 'critical',
              title: 'Conflit hiérarchique circulaire',
              description: `Délégation circulaire détectée entre ${del.agentName} et ${del.delegatorName}`,
              affectedDelegations: [del.id, ...conflicts_found.map(d => d.id)],
              detectedAt: new Date(),
              resolved: false,
              resolutionSuggestions: [
                {
                  id: 'revoke-one',
                  action: 'Révoquer une des délégations',
                  description: 'Supprimer la délégation circulaire',
                  automated: false,
                  impact: 'Une délégation sera révoquée',
                  execute: async () => this.resolveCircular([del, ...conflicts_found]),
                },
              ],
            });
          }
        }

        return conflicts;
      },
      enabled: true,
    });

    // Règle 4: Conflits temporels
    this.rules.push({
      id: 'temporal-conflict',
      name: 'Conflit temporel',
      type: 'temporal',
      check: (delegations) => {
        const conflicts: Conflict[] = [];

        for (const del of delegations.filter(d => d.status === 'active')) {
          const endDate = new Date(del.endDate);
          const startDate = new Date(del.startDate);

          // Délégation avec dates incohérentes
          if (endDate < startDate) {
            conflicts.push({
              id: `conflict-temporal-${del.id}`,
              type: 'temporal',
              severity: 'critical',
              title: 'Dates incohérentes',
              description: `La date de fin (${endDate.toLocaleDateString()}) est antérieure à la date de début (${startDate.toLocaleDateString()})`,
              affectedDelegations: [del.id],
              detectedAt: new Date(),
              resolved: false,
              resolutionSuggestions: [
                {
                  id: 'fix-dates',
                  action: 'Corriger les dates',
                  description: 'Ajuster les dates pour résoudre l\'incohérence',
                  automated: false,
                  impact: 'Les dates seront modifiées',
                  execute: async () => this.fixDates(del.id),
                },
              ],
            });
          }

          // Délégation déjà expirée mais encore active
          if (endDate < new Date()) {
            conflicts.push({
              id: `conflict-expired-${del.id}`,
              type: 'temporal',
              severity: 'high',
              title: 'Délégation expirée mais active',
              description: `La délégation de ${del.agentName} est expirée depuis le ${endDate.toLocaleDateString()} mais reste active`,
              affectedDelegations: [del.id],
              detectedAt: new Date(),
              resolved: false,
              resolutionSuggestions: [
                {
                  id: 'auto-expire',
                  action: 'Expirer automatiquement',
                  description: 'Passer le statut à "expired"',
                  automated: true,
                  impact: 'La délégation sera marquée comme expirée',
                  execute: async () => this.expireDelegation(del.id),
                },
                {
                  id: 'extend',
                  action: 'Prolonger la délégation',
                  description: 'Étendre la période de validité',
                  automated: false,
                  impact: 'La date de fin sera prolongée',
                  execute: async () => this.extendDelegation(del.id),
                },
              ],
            });
          }
        }

        return conflicts;
      },
      enabled: true,
    });

    // Règle 5: Conflits de montants
    this.rules.push({
      id: 'amount-conflict',
      name: 'Conflit de montants',
      type: 'amount',
      check: (delegations) => {
        const conflicts: Conflict[] = [];

        for (const del of delegations.filter(d => d.status === 'active')) {
          // Agent avec montant supérieur au délégant
          const delegator = delegations.find(d => d.agentId === del.delegatorId);

          if (delegator && del.maxAmount && delegator.maxAmount) {
            if (del.maxAmount > delegator.maxAmount) {
              conflicts.push({
                id: `conflict-amount-${del.id}`,
                type: 'amount',
                severity: 'high',
                title: 'Montant supérieur au délégant',
                description: `${del.agentName} a un plafond de ${this.formatAmount(del.maxAmount)} supérieur à son délégant ${delegator.agentName} (${this.formatAmount(delegator.maxAmount)})`,
                affectedDelegations: [del.id, delegator.id],
                detectedAt: new Date(),
                resolved: false,
                resolutionSuggestions: [
                  {
                    id: 'adjust-amount',
                    action: 'Ajuster le montant',
                    description: 'Réduire le montant au niveau du délégant',
                    automated: true,
                    impact: `Le montant sera réduit à ${this.formatAmount(delegator.maxAmount)}`,
                    execute: async () => this.adjustAmount(del.id, delegator.maxAmount),
                  },
                ],
              });
            }
          }
        }

        return conflicts;
      },
      enabled: true,
    });
  }

  /**
   * Détecter tous les conflits
   */
  public detectConflicts(delegations: any[]): Conflict[] {
    const allConflicts: Conflict[] = [];

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      try {
        const conflicts = rule.check(delegations);
        allConflicts.push(...conflicts);
      } catch (error) {
        console.error(`Error in conflict rule ${rule.id}:`, error);
      }
    }

    // Stocker les conflits
    for (const conflict of allConflicts) {
      this.conflicts.set(conflict.id, conflict);
    }

    return allConflicts;
  }

  /**
   * Obtenir les conflits par sévérité
   */
  public getConflictsBySeverity(severity: Conflict['severity']): Conflict[] {
    return Array.from(this.conflicts.values()).filter(c => c.severity === severity && !c.resolved);
  }

  /**
   * Résoudre un conflit
   */
  public async resolveConflict(conflictId: string, resolutionId: string): Promise<void> {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error('Conflict not found');
    }

    const resolution = conflict.resolutionSuggestions.find(r => r.id === resolutionId);
    if (!resolution) {
      throw new Error('Resolution not found');
    }

    await resolution.execute();
    conflict.resolved = true;
  }

  /**
   * Obtenir le nombre de conflits actifs
   */
  public getActiveConflictsCount(): number {
    return Array.from(this.conflicts.values()).filter(c => !c.resolved).length;
  }

  // Actions de résolution
  private async mergeDelegations(delegations: any[]) {
    console.log('Merging delegations:', delegations.map(d => d.id));
  }

  private async keepMostRecent(delegations: any[]) {
    const sorted = delegations.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    console.log('Keeping most recent:', sorted[0].id);
  }

  private scopesOverlap(scope1: string, scope2: string): boolean {
    // Logique simplifiée de détection de chevauchement
    return scope1 === scope2;
  }

  private async clarifyScopes(delegations: any[]) {
    console.log('Clarifying scopes for:', delegations.map(d => d.id));
  }

  private async resolveCircular(delegations: any[]) {
    console.log('Resolving circular delegation:', delegations.map(d => d.id));
  }

  private async fixDates(delegationId: string) {
    console.log('Fixing dates for:', delegationId);
  }

  private async expireDelegation(delegationId: string) {
    console.log('Expiring delegation:', delegationId);
  }

  private async extendDelegation(delegationId: string) {
    console.log('Extending delegation:', delegationId);
  }

  private async adjustAmount(delegationId: string, newAmount: number) {
    console.log(`Adjusting amount for ${delegationId} to ${newAmount}`);
  }

  private formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }
}

/**
 * Instance singleton du détecteur de conflits
 */
export const conflictDetector = new ConflictDetector();

