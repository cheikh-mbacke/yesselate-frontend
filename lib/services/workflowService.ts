/**
 * Service de Workflow de Validation Multi-niveaux
 * ================================================
 * 
 * Système configurable de validation avec plusieurs niveaux d'approbation
 */

// ============================================
// TYPES
// ============================================

export type WorkflowStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';
export type ApprovalAction = 'approve' | 'reject' | 'delegate' | 'request_changes';

export interface WorkflowStep {
  id: string;
  ordre: number;
  titre: string;
  description?: string;
  approbateurRole: string; // Rôle requis (ex: 'manager', 'directeur', 'admin')
  approbateurIds?: string[]; // IDs spécifiques (optionnel)
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  approbateurActuel?: string;
  dateAction?: string;
  commentaire?: string;
  delaiMax?: number; // en heures
  actionRequise?: boolean; // Si vraie, bloque jusqu'à action
  conditions?: (data: any) => boolean; // Conditions pour activer cette étape
}

export interface WorkflowDefinition {
  id: string;
  nom: string;
  description: string;
  entityType: string; // 'bc', 'contrat', 'projet', 'depense', etc.
  etapes: Omit<WorkflowStep, 'id' | 'status' | 'approbateurActuel' | 'dateAction' | 'commentaire'>[];
  isActive: boolean;
  conditions?: (data: any) => boolean; // Conditions pour appliquer ce workflow
}

export interface WorkflowInstance {
  id: string;
  workflowDefId: string;
  entityId: string;
  entityType: string;
  entityData: Record<string, unknown>;
  status: WorkflowStatus;
  etapes: WorkflowStep[];
  etapeActuelle: number;
  dateCreation: string;
  dateCompletion?: string;
  initiateur: string;
  historique: WorkflowHistoryEntry[];
}

export interface WorkflowHistoryEntry {
  id: string;
  etapeId: string;
  action: ApprovalAction;
  acteur: string;
  acteurNom: string;
  commentaire?: string;
  date: string;
  metadata?: Record<string, unknown>;
}

export interface WorkflowStats {
  total: number;
  enCours: number;
  approuves: number;
  rejetes: number;
  moyenneDuree: number; // en heures
  parType: Array<{ entityType: string; count: number }>;
  enRetard: number;
}

// ============================================
// DÉFINITIONS DE WORKFLOWS PRÉDÉFINIS
// ============================================

export const defaultWorkflows: WorkflowDefinition[] = [
  // Workflow 1: Validation BC Standard (< 5M)
  {
    id: 'bc_standard',
    nom: 'Validation BC Standard',
    description: 'Workflow pour BC de moins de 5M FCFA',
    entityType: 'bc',
    isActive: true,
    conditions: (data: any) => data.montant < 5000000,
    etapes: [
      {
        ordre: 1,
        titre: 'Vérification Technique',
        description: 'Vérifier la conformité technique du BC',
        approbateurRole: 'ingenieur',
        delaiMax: 24,
        actionRequise: true,
      },
      {
        ordre: 2,
        titre: 'Validation Budgétaire',
        description: 'Vérifier la disponibilité budgétaire',
        approbateurRole: 'controleur_budget',
        delaiMax: 24,
        actionRequise: true,
      },
      {
        ordre: 3,
        titre: 'Approbation Finale',
        description: 'Approbation par le chef de projet',
        approbateurRole: 'chef_projet',
        delaiMax: 48,
        actionRequise: true,
      },
    ],
  },

  // Workflow 2: Validation BC Important (>= 5M)
  {
    id: 'bc_important',
    nom: 'Validation BC Important',
    description: 'Workflow pour BC de plus de 5M FCFA',
    entityType: 'bc',
    isActive: true,
    conditions: (data: any) => data.montant >= 5000000,
    etapes: [
      {
        ordre: 1,
        titre: 'Vérification Technique',
        approbateurRole: 'ingenieur',
        delaiMax: 24,
        actionRequise: true,
      },
      {
        ordre: 2,
        titre: 'Validation Juridique',
        description: 'Vérification des clauses contractuelles',
        approbateurRole: 'juriste',
        delaiMax: 48,
        actionRequise: true,
      },
      {
        ordre: 3,
        titre: 'Validation Budgétaire',
        approbateurRole: 'controleur_budget',
        delaiMax: 24,
        actionRequise: true,
      },
      {
        ordre: 4,
        titre: 'Approbation Chef de Projet',
        approbateurRole: 'chef_projet',
        delaiMax: 48,
        actionRequise: true,
      },
      {
        ordre: 5,
        titre: 'Approbation Directeur',
        description: 'Validation finale par le directeur',
        approbateurRole: 'directeur',
        delaiMax: 72,
        actionRequise: true,
      },
    ],
  },

  // Workflow 3: Validation Contrat
  {
    id: 'contrat_validation',
    nom: 'Validation Contrat',
    description: 'Workflow pour validation de contrats',
    entityType: 'contrat',
    isActive: true,
    etapes: [
      {
        ordre: 1,
        titre: 'Revue Juridique',
        description: 'Vérification des clauses et conformité légale',
        approbateurRole: 'juriste',
        delaiMax: 72,
        actionRequise: true,
      },
      {
        ordre: 2,
        titre: 'Validation Financière',
        description: 'Vérification des aspects financiers',
        approbateurRole: 'controleur_financier',
        delaiMax: 48,
        actionRequise: true,
      },
      {
        ordre: 3,
        titre: 'Approbation DG',
        description: 'Validation finale par la direction générale',
        approbateurRole: 'dg',
        delaiMax: 96,
        actionRequise: true,
      },
    ],
  },

  // Workflow 4: Validation Dépense
  {
    id: 'depense_validation',
    nom: 'Validation Dépense',
    description: 'Workflow pour validation de dépenses',
    entityType: 'depense',
    isActive: true,
    etapes: [
      {
        ordre: 1,
        titre: 'Vérification Conformité',
        description: 'Vérifier les justificatifs et la conformité',
        approbateurRole: 'comptable',
        delaiMax: 24,
        actionRequise: true,
      },
      {
        ordre: 2,
        titre: 'Validation Budgétaire',
        approbateurRole: 'controleur_budget',
        delaiMax: 24,
        actionRequise: true,
        conditions: (data: any) => data.montant > 500000, // Si > 500K
      },
      {
        ordre: 3,
        titre: 'Approbation Manager',
        approbateurRole: 'manager',
        delaiMax: 48,
        actionRequise: true,
      },
    ],
  },
];

// ============================================
// SERVICE
// ============================================

class WorkflowService {
  private baseUrl = '/api/workflows';
  private workflows: WorkflowDefinition[] = [...defaultWorkflows];
  private instances: WorkflowInstance[] = [];

  /**
   * Démarre un nouveau workflow pour une entité
   */
  async startWorkflow(
    entityType: string,
    entityId: string,
    entityData: Record<string, unknown>,
    initiateur: string
  ): Promise<WorkflowInstance> {
    await this.delay(500);

    // Trouver le workflow approprié
    const workflowDef = this.workflows.find(
      (w) =>
        w.isActive &&
        w.entityType === entityType &&
        (!w.conditions || w.conditions(entityData))
    );

    if (!workflowDef) {
      throw new Error(`Aucun workflow actif trouvé pour ${entityType}`);
    }

    // Initialiser les étapes
    const etapes: WorkflowStep[] = workflowDef.etapes
      .filter((e) => !e.conditions || e.conditions(entityData))
      .map((e, index) => ({
        id: `STEP-${Date.now()}-${index}`,
        ...e,
        status: index === 0 ? 'pending' : ('pending' as const),
      }));

    // Créer l'instance
    const instance: WorkflowInstance = {
      id: `WF-${Date.now()}`,
      workflowDefId: workflowDef.id,
      entityId,
      entityType,
      entityData,
      status: 'pending',
      etapes,
      etapeActuelle: 0,
      dateCreation: new Date().toISOString(),
      initiateur,
      historique: [],
    };

    this.instances.push(instance);

    console.log(`🔄 Workflow démarré: ${workflowDef.nom} pour ${entityType} ${entityId}`);

    return instance;
  }

  /**
   * Approuve une étape du workflow
   */
  async approveStep(
    instanceId: string,
    etapeId: string,
    approbateur: string,
    approbateurNom: string,
    commentaire?: string
  ): Promise<WorkflowInstance> {
    await this.delay(400);

    const instance = this.instances.find((i) => i.id === instanceId);
    if (!instance) throw new Error('Instance de workflow non trouvée');

    const etape = instance.etapes.find((e) => e.id === etapeId);
    if (!etape) throw new Error('Étape non trouvée');

    if (etape.status !== 'pending') {
      throw new Error('Cette étape a déjà été traitée');
    }

    // Marquer l'étape comme approuvée
    etape.status = 'approved';
    etape.approbateurActuel = approbateur;
    etape.dateAction = new Date().toISOString();
    etape.commentaire = commentaire;

    // Ajouter à l'historique
    instance.historique.push({
      id: `HIST-${Date.now()}`,
      etapeId,
      action: 'approve',
      acteur: approbateur,
      acteurNom: approbateurNom,
      commentaire,
      date: new Date().toISOString(),
    });

    // Vérifier si toutes les étapes sont complétées
    if (instance.etapes.every((e) => e.status === 'approved' || e.status === 'skipped')) {
      instance.status = 'approved';
      instance.dateCompletion = new Date().toISOString();
      console.log(`✅ Workflow ${instanceId} complété avec succès`);
    } else {
      // Passer à l'étape suivante
      instance.etapeActuelle += 1;
    }

    return instance;
  }

  /**
   * Rejette une étape du workflow
   */
  async rejectStep(
    instanceId: string,
    etapeId: string,
    approbateur: string,
    approbateurNom: string,
    commentaire: string
  ): Promise<WorkflowInstance> {
    await this.delay(400);

    const instance = this.instances.find((i) => i.id === instanceId);
    if (!instance) throw new Error('Instance de workflow non trouvée');

    const etape = instance.etapes.find((e) => e.id === etapeId);
    if (!etape) throw new Error('Étape non trouvée');

    // Marquer l'étape comme rejetée
    etape.status = 'rejected';
    etape.approbateurActuel = approbateur;
    etape.dateAction = new Date().toISOString();
    etape.commentaire = commentaire;

    // Ajouter à l'historique
    instance.historique.push({
      id: `HIST-${Date.now()}`,
      etapeId,
      action: 'reject',
      acteur: approbateur,
      acteurNom: approbateurNom,
      commentaire,
      date: new Date().toISOString(),
    });

    // Marquer tout le workflow comme rejeté
    instance.status = 'rejected';
    instance.dateCompletion = new Date().toISOString();

    console.log(`❌ Workflow ${instanceId} rejeté`);

    return instance;
  }

  /**
   * Délègue une étape à un autre utilisateur
   */
  async delegateStep(
    instanceId: string,
    etapeId: string,
    delegataire: string,
    delegataireNom: string,
    commentaire?: string
  ): Promise<WorkflowInstance> {
    await this.delay(300);

    const instance = this.instances.find((i) => i.id === instanceId);
    if (!instance) throw new Error('Instance de workflow non trouvée');

    const etape = instance.etapes.find((e) => e.id === etapeId);
    if (!etape) throw new Error('Étape non trouvée');

    // Ajouter le délégataire
    etape.approbateurIds = etape.approbateurIds || [];
    etape.approbateurIds.push(delegataire);

    // Ajouter à l'historique
    instance.historique.push({
      id: `HIST-${Date.now()}`,
      etapeId,
      action: 'delegate',
      acteur: delegataire,
      acteurNom: delegataireNom,
      commentaire: commentaire || `Délégation à ${delegataireNom}`,
      date: new Date().toISOString(),
    });

    console.log(`👉 Étape déléguée à ${delegataireNom}`);

    return instance;
  }

  /**
   * Demande des modifications
   */
  async requestChanges(
    instanceId: string,
    etapeId: string,
    approbateur: string,
    approbateurNom: string,
    commentaire: string
  ): Promise<WorkflowInstance> {
    await this.delay(300);

    const instance = this.instances.find((i) => i.id === instanceId);
    if (!instance) throw new Error('Instance de workflow non trouvée');

    instance.historique.push({
      id: `HIST-${Date.now()}`,
      etapeId,
      action: 'request_changes',
      acteur: approbateur,
      acteurNom: approbateurNom,
      commentaire,
      date: new Date().toISOString(),
    });

    console.log(`📝 Modifications demandées sur ${instanceId}`);

    return instance;
  }

  /**
   * Récupère les workflows en attente pour un utilisateur
   */
  async getPendingForUser(userId: string, role: string): Promise<WorkflowInstance[]> {
    await this.delay(300);

    return this.instances.filter((instance) => {
      if (instance.status !== 'pending') return false;

      const etapeActuelle = instance.etapes[instance.etapeActuelle];
      if (!etapeActuelle || etapeActuelle.status !== 'pending') return false;

      // Vérifier si l'utilisateur a le bon rôle
      if (etapeActuelle.approbateurRole !== role) return false;

      // Vérifier si l'utilisateur est dans la liste (si définie)
      if (etapeActuelle.approbateurIds && etapeActuelle.approbateurIds.length > 0) {
        return etapeActuelle.approbateurIds.includes(userId);
      }

      return true;
    });
  }

  /**
   * Récupère une instance de workflow
   */
  async getInstance(instanceId: string): Promise<WorkflowInstance | null> {
    await this.delay(200);
    return this.instances.find((i) => i.id === instanceId) || null;
  }

  /**
   * Récupère les statistiques des workflows
   */
  async getStats(): Promise<WorkflowStats> {
    await this.delay(300);

    const instances = this.instances;

    return {
      total: instances.length,
      enCours: instances.filter((i) => i.status === 'pending').length,
      approuves: instances.filter((i) => i.status === 'approved').length,
      rejetes: instances.filter((i) => i.status === 'rejected').length,
      moyenneDuree: this.calculateAverageDuration(instances),
      parType: Array.from(new Set(instances.map((i) => i.entityType))).map((type) => ({
        entityType: type,
        count: instances.filter((i) => i.entityType === type).length,
      })),
      enRetard: this.countLate(instances),
    };
  }

  /**
   * Calcule la durée moyenne de completion
   */
  private calculateAverageDuration(instances: WorkflowInstance[]): number {
    const completed = instances.filter((i) => i.dateCompletion);
    if (completed.length === 0) return 0;

    const totalHours = completed.reduce((sum, i) => {
      const start = new Date(i.dateCreation).getTime();
      const end = new Date(i.dateCompletion!).getTime();
      return sum + (end - start) / (1000 * 60 * 60);
    }, 0);

    return Math.round(totalHours / completed.length);
  }

  /**
   * Compte les workflows en retard
   */
  private countLate(instances: WorkflowInstance[]): number {
    return instances.filter((i) => {
      if (i.status !== 'pending') return false;

      const etapeActuelle = i.etapes[i.etapeActuelle];
      if (!etapeActuelle || !etapeActuelle.delaiMax) return false;

      const hoursSinceStart =
        (Date.now() - new Date(i.dateCreation).getTime()) / (1000 * 60 * 60);

      return hoursSinceStart > etapeActuelle.delaiMax;
    }).length;
  }

  /**
   * Récupère les définitions de workflows
   */
  getWorkflowDefinitions(): WorkflowDefinition[] {
    return [...this.workflows];
  }

  /**
   * Ajoute une définition de workflow
   */
  addWorkflowDefinition(workflow: WorkflowDefinition): void {
    this.workflows.push(workflow);
    console.log(`Workflow ajouté: ${workflow.nom}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const workflowService = new WorkflowService();

