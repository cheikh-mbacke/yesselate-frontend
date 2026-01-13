/**
 * Système de gestion des remplaçants et successeurs pour les délégations
 * Assure la continuité de service en cas d'absence
 */

export interface Replacement {
  id: string;
  delegationId: string;
  originalAgentId: string;
  originalAgentName: string;
  replacementAgentId: string;
  replacementAgentName: string;
  startDate: Date;
  endDate: Date;
  reason: 'absence' | 'congés' | 'maladie' | 'formation' | 'mutation' | 'autre';
  status: 'active' | 'scheduled' | 'completed' | 'cancelled';
  autoActivate: boolean;
  notifyOriginal: boolean;
  restrictions?: {
    maxAmount?: number;
    excludedOperations?: string[];
  };
  createdAt: Date;
  createdBy: string;
}

export interface Successor {
  id: string;
  delegationId: string;
  currentHolderId: string;
  successorId: string;
  successorName: string;
  priority: number; // 1 = premier successeur, 2 = second, etc.
  conditions?: {
    automatic?: boolean; // Succession automatique?
    requiresApproval?: boolean;
    effectiveDate?: Date;
  };
  status: 'designated' | 'active' | 'declined';
  createdAt: Date;
}

export interface AbsenceNotification {
  id: string;
  agentId: string;
  agentName: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  affectedDelegations: string[];
  replacements: Replacement[];
  status: 'pending' | 'processed' | 'cancelled';
  createdAt: Date;
}

/**
 * Moteur de gestion des remplaçants
 */
export class ReplacementManager {
  private replacements: Map<string, Replacement> = new Map();
  private successors: Map<string, Successor[]> = new Map();
  private absences: Map<string, AbsenceNotification> = new Map();

  /**
   * Déclarer une absence et gérer les remplacements
   */
  public async declareAbsence(
    agentId: string,
    agentName: string,
    startDate: Date,
    endDate: Date,
    reason: string,
    affectedDelegations: string[]
  ): Promise<AbsenceNotification> {
    const notification: AbsenceNotification = {
      id: `absence-${Date.now()}`,
      agentId,
      agentName,
      startDate,
      endDate,
      reason,
      affectedDelegations,
      replacements: [],
      status: 'pending',
      createdAt: new Date(),
    };

    this.absences.set(notification.id, notification);

    // Trouver automatiquement des remplaçants pour chaque délégation
    for (const delegationId of affectedDelegations) {
      const replacement = await this.findBestReplacement(
        delegationId,
        agentId,
        startDate,
        endDate
      );

      if (replacement) {
        notification.replacements.push(replacement);
      }
    }

    return notification;
  }

  /**
   * Trouver le meilleur remplaçant pour une délégation
   */
  private async findBestReplacement(
    delegationId: string,
    originalAgentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Replacement | null> {
    // Vérifier si des successeurs sont désignés
    const successors = this.successors.get(delegationId) || [];
    const availableSuccessors = successors
      .filter(s => s.status === 'designated')
      .sort((a, b) => a.priority - b.priority);

    if (availableSuccessors.length > 0) {
      const successor = availableSuccessors[0];

      return {
        id: `rep-${Date.now()}`,
        delegationId,
        originalAgentId,
        originalAgentName: '', // À compléter
        replacementAgentId: successor.successorId,
        replacementAgentName: successor.successorName,
        startDate,
        endDate,
        reason: 'absence',
        status: 'scheduled',
        autoActivate: true,
        notifyOriginal: true,
        createdAt: new Date(),
        createdBy: 'system',
      };
    }

    // Sinon, utiliser des règles métier pour suggérer un remplaçant
    // (à implémenter selon la logique métier)
    return null;
  }

  /**
   * Créer un remplacement manuel
   */
  public createReplacement(replacement: Omit<Replacement, 'id' | 'createdAt'>): Replacement {
    const newReplacement: Replacement = {
      ...replacement,
      id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    this.replacements.set(newReplacement.id, newReplacement);
    return newReplacement;
  }

  /**
   * Activer un remplacement
   */
  public async activateReplacement(replacementId: string): Promise<Replacement> {
    const replacement = this.replacements.get(replacementId);
    if (!replacement) {
      throw new Error('Replacement not found');
    }

    replacement.status = 'active';

    // Logique métier : créer une délégation temporaire pour le remplaçant
    // ou modifier la délégation existante
    console.log(`Activating replacement: ${replacementId}`);

    return replacement;
  }

  /**
   * Terminer un remplacement
   */
  public async completeReplacement(replacementId: string): Promise<Replacement> {
    const replacement = this.replacements.get(replacementId);
    if (!replacement) {
      throw new Error('Replacement not found');
    }

    replacement.status = 'completed';

    // Restaurer la délégation originale
    console.log(`Completing replacement: ${replacementId}`);

    return replacement;
  }

  /**
   * Désigner un successeur pour une délégation
   */
  public designateSuccessor(
    delegationId: string,
    currentHolderId: string,
    successorId: string,
    successorName: string,
    priority: number = 1,
    conditions?: Successor['conditions']
  ): Successor {
    const successor: Successor = {
      id: `succ-${Date.now()}`,
      delegationId,
      currentHolderId,
      successorId,
      successorName,
      priority,
      conditions,
      status: 'designated',
      createdAt: new Date(),
    };

    const existingSuccessors = this.successors.get(delegationId) || [];
    existingSuccessors.push(successor);
    this.successors.set(delegationId, existingSuccessors);

    return successor;
  }

  /**
   * Activer une succession
   */
  public async activateSuccession(delegationId: string, successorId?: string): Promise<void> {
    const successors = this.successors.get(delegationId) || [];

    let targetSuccessor: Successor | undefined;

    if (successorId) {
      targetSuccessor = successors.find(s => s.id === successorId);
    } else {
      // Prendre le premier successeur désigné par priorité
      targetSuccessor = successors
        .filter(s => s.status === 'designated')
        .sort((a, b) => a.priority - b.priority)[0];
    }

    if (!targetSuccessor) {
      throw new Error('No successor found');
    }

    // Logique métier : transférer la délégation au successeur
    targetSuccessor.status = 'active';
    console.log(`Activating succession for delegation ${delegationId} to ${targetSuccessor.successorName}`);
  }

  /**
   * Obtenir tous les remplacements actifs pour un agent
   */
  public getActiveReplacements(agentId: string): Replacement[] {
    const replacements: Replacement[] = [];

    for (const [id, replacement] of this.replacements) {
      if (
        (replacement.originalAgentId === agentId || replacement.replacementAgentId === agentId) &&
        replacement.status === 'active'
      ) {
        replacements.push(replacement);
      }
    }

    return replacements;
  }

  /**
   * Obtenir les successeurs d'une délégation
   */
  public getSuccessors(delegationId: string): Successor[] {
    return this.successors.get(delegationId) || [];
  }

  /**
   * Vérifier les remplacements à activer automatiquement
   */
  public checkScheduledReplacements(): void {
    const now = new Date();

    for (const [id, replacement] of this.replacements) {
      if (replacement.status === 'scheduled' && replacement.autoActivate) {
        if (now >= replacement.startDate) {
          this.activateReplacement(id);
        }
      }

      if (replacement.status === 'active') {
        if (now >= replacement.endDate) {
          this.completeReplacement(id);
        }
      }
    }
  }

  /**
   * Obtenir les délégations sans remplaçant désigné
   */
  public getDelegationsWithoutBackup(delegations: any[]): any[] {
    return delegations.filter(d => {
      const successors = this.successors.get(d.id) || [];
      return successors.length === 0 && d.isCritical && d.status === 'active';
    });
  }

  /**
   * Suggérer des remplaçants potentiels
   */
  public suggestReplacements(delegationId: string, delegation: any): Array<{
    userId: string;
    name: string;
    score: number;
    reasons: string[];
  }> {
    // Logique de suggestion basée sur:
    // - Même bureau
    // - Compétences similaires
    // - Disponibilité
    // - Expérience
    // (À implémenter selon la logique métier)

    const suggestions = [
      {
        userId: 'USR-002',
        name: 'B. MARTIN',
        score: 95,
        reasons: [
          'Même bureau',
          'Expérience similaire',
          'Disponible',
          'A déjà remplacé avec succès',
        ],
      },
      {
        userId: 'USR-003',
        name: 'C. BERNARD',
        score: 85,
        reasons: [
          'Compétences complémentaires',
          'Disponible',
          'Formation récente',
        ],
      },
    ];

    return suggestions.sort((a, b) => b.score - a.score);
  }

  /**
   * Créer un plan de continuité pour une période
   */
  public createContinuityPlan(
    startDate: Date,
    endDate: Date,
    affectedAgents: string[]
  ): {
    missingReplacements: string[];
    conflicts: string[];
    recommendations: string[];
  } {
    const analysis = {
      missingReplacements: [] as string[],
      conflicts: [] as string[],
      recommendations: [] as string[],
    };

    // Analyser les remplacements pour la période
    // Détecter les manques et les conflits
    // Proposer des recommandations

    return analysis;
  }
}

/**
 * Instance singleton du gestionnaire de remplaçants
 */
export const replacementManager = new ReplacementManager();

