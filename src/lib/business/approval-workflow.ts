/**
 * Système de workflow de validation multi-niveaux pour les délégations
 * Gère les approbations hiérarchiques et les circuits de validation
 */

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'delegated' | 'cancelled';

export interface ApprovalLevel {
  level: number;
  role: string;
  approvers: string[]; // User IDs
  requiredApprovals: number; // Nombre d'approbations nécessaires
  timeout?: number; // Temps max en heures
  allowDelegation: boolean; // Peut déléguer à quelqu'un d'autre
  autoEscalate: boolean; // Escalade auto si timeout
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  description: string;
  levels: ApprovalLevel[];
  applicableTo: {
    types?: string[]; // Types de délégation
    minAmount?: number;
    maxAmount?: number;
    bureaux?: string[];
  };
  parallel: boolean; // Tous les niveaux en parallèle ou séquentiel
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalRequest {
  id: string;
  workflowId: string;
  delegationId: string;
  requesterId: string;
  requesterName: string;
  currentLevel: number;
  status: ApprovalStatus;
  approvals: Approval[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  metadata: Record<string, any>;
}

export interface Approval {
  id: string;
  level: number;
  approverId: string;
  approverName: string;
  status: ApprovalStatus;
  comments?: string;
  timestamp: Date;
  delegatedTo?: string;
  attachments?: string[];
}

/**
 * Moteur de workflow de validation
 */
export class ApprovalWorkflowEngine {
  private workflows: Map<string, ApprovalWorkflow> = new Map();
  private requests: Map<string, ApprovalRequest> = new Map();

  constructor() {
    this.initializeDefaultWorkflows();
  }

  /**
   * Initialiser les workflows par défaut
   */
  private initializeDefaultWorkflows() {
    // Workflow standard pour délégations < 50k€
    this.registerWorkflow({
      id: 'standard',
      name: 'Validation Standard',
      description: 'Workflow pour les délégations standards (< 50k€)',
      levels: [
        {
          level: 1,
          role: 'Chef de Bureau',
          approvers: [],
          requiredApprovals: 1,
          timeout: 24,
          allowDelegation: true,
          autoEscalate: true,
        },
        {
          level: 2,
          role: 'Directeur',
          approvers: [],
          requiredApprovals: 1,
          timeout: 48,
          allowDelegation: false,
          autoEscalate: false,
        },
      ],
      applicableTo: {
        maxAmount: 50000,
      },
      parallel: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Workflow renforcé pour > 50k€
    this.registerWorkflow({
      id: 'enhanced',
      name: 'Validation Renforcée',
      description: 'Workflow renforcé pour les montants élevés (> 50k€)',
      levels: [
        {
          level: 1,
          role: 'Chef de Bureau',
          approvers: [],
          requiredApprovals: 1,
          timeout: 24,
          allowDelegation: false,
          autoEscalate: true,
        },
        {
          level: 2,
          role: 'Directeur Adjoint',
          approvers: [],
          requiredApprovals: 1,
          timeout: 48,
          allowDelegation: false,
          autoEscalate: true,
        },
        {
          level: 3,
          role: 'Directeur Général',
          approvers: [],
          requiredApprovals: 1,
          timeout: 72,
          allowDelegation: false,
          autoEscalate: false,
        },
      ],
      applicableTo: {
        minAmount: 50000,
      },
      parallel: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Workflow express (délégations temporaires courtes)
    this.registerWorkflow({
      id: 'express',
      name: 'Validation Express',
      description: 'Validation accélérée pour délégations temporaires < 7 jours',
      levels: [
        {
          level: 1,
          role: 'Chef de Bureau',
          approvers: [],
          requiredApprovals: 1,
          timeout: 12,
          allowDelegation: true,
          autoEscalate: true,
        },
      ],
      applicableTo: {},
      parallel: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Enregistrer un nouveau workflow
   */
  public registerWorkflow(workflow: ApprovalWorkflow): void {
    this.workflows.set(workflow.id, workflow);
  }

  /**
   * Sélectionner le workflow approprié
   */
  public selectWorkflow(delegation: any): ApprovalWorkflow | null {
    for (const [id, workflow] of this.workflows) {
      if (this.isWorkflowApplicable(workflow, delegation)) {
        return workflow;
      }
    }
    return null;
  }

  /**
   * Vérifier si un workflow est applicable
   */
  private isWorkflowApplicable(workflow: ApprovalWorkflow, delegation: any): boolean {
    const { applicableTo } = workflow;

    if (applicableTo.types && !applicableTo.types.includes(delegation.type)) {
      return false;
    }

    if (applicableTo.minAmount && delegation.maxAmount < applicableTo.minAmount) {
      return false;
    }

    if (applicableTo.maxAmount && delegation.maxAmount > applicableTo.maxAmount) {
      return false;
    }

    if (applicableTo.bureaux && !applicableTo.bureaux.includes(delegation.bureau)) {
      return false;
    }

    return true;
  }

  /**
   * Créer une demande d'approbation
   */
  public createApprovalRequest(
    delegationId: string,
    requesterId: string,
    requesterName: string,
    metadata: Record<string, any> = {}
  ): ApprovalRequest {
    const workflow = this.selectWorkflow(metadata.delegation);

    if (!workflow) {
      throw new Error('No applicable workflow found');
    }

    const request: ApprovalRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      workflowId: workflow.id,
      delegationId,
      requesterId,
      requesterName,
      currentLevel: 1,
      status: 'pending',
      approvals: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata,
    };

    this.requests.set(request.id, request);
    return request;
  }

  /**
   * Approuver une demande
   */
  public async approve(
    requestId: string,
    approverId: string,
    approverName: string,
    comments?: string
  ): Promise<ApprovalRequest> {
    const request = this.requests.get(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    const workflow = this.workflows.get(request.workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const approval: Approval = {
      id: `app-${Date.now()}`,
      level: request.currentLevel,
      approverId,
      approverName,
      status: 'approved',
      comments,
      timestamp: new Date(),
    };

    request.approvals.push(approval);
    request.updatedAt = new Date();

    // Vérifier si le niveau actuel est complété
    const currentLevel = workflow.levels.find(l => l.level === request.currentLevel);
    if (currentLevel) {
      const approvalsAtLevel = request.approvals.filter(
        a => a.level === request.currentLevel && a.status === 'approved'
      );

      if (approvalsAtLevel.length >= currentLevel.requiredApprovals) {
        // Passer au niveau suivant ou compléter
        if (request.currentLevel < workflow.levels.length) {
          request.currentLevel++;
        } else {
          request.status = 'approved';
          request.completedAt = new Date();
        }
      }
    }

    return request;
  }

  /**
   * Rejeter une demande
   */
  public async reject(
    requestId: string,
    approverId: string,
    approverName: string,
    reason: string
  ): Promise<ApprovalRequest> {
    const request = this.requests.get(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    const approval: Approval = {
      id: `app-${Date.now()}`,
      level: request.currentLevel,
      approverId,
      approverName,
      status: 'rejected',
      comments: reason,
      timestamp: new Date(),
    };

    request.approvals.push(approval);
    request.status = 'rejected';
    request.completedAt = new Date();
    request.updatedAt = new Date();

    return request;
  }

  /**
   * Déléguer l'approbation
   */
  public async delegate(
    requestId: string,
    fromApproverId: string,
    toApproverId: string,
    toApproverName: string
  ): Promise<ApprovalRequest> {
    const request = this.requests.get(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    const workflow = this.workflows.get(request.workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const currentLevel = workflow.levels.find(l => l.level === request.currentLevel);
    if (!currentLevel?.allowDelegation) {
      throw new Error('Delegation not allowed at this level');
    }

    const approval: Approval = {
      id: `app-${Date.now()}`,
      level: request.currentLevel,
      approverId: fromApproverId,
      approverName: 'Delega',
      status: 'delegated',
      comments: `Délégué à ${toApproverName}`,
      timestamp: new Date(),
      delegatedTo: toApproverId,
    };

    request.approvals.push(approval);
    request.updatedAt = new Date();

    // Mettre à jour les approbateurs du niveau
    if (!currentLevel.approvers.includes(toApproverId)) {
      currentLevel.approvers.push(toApproverId);
    }

    return request;
  }

  /**
   * Obtenir les demandes en attente pour un approbateur
   */
  public getPendingRequestsForApprover(approverId: string): ApprovalRequest[] {
    const pending: ApprovalRequest[] = [];

    for (const [id, request] of this.requests) {
      if (request.status !== 'pending') continue;

      const workflow = this.workflows.get(request.workflowId);
      if (!workflow) continue;

      const currentLevel = workflow.levels.find(l => l.level === request.currentLevel);
      if (currentLevel && currentLevel.approvers.includes(approverId)) {
        pending.push(request);
      }
    }

    return pending;
  }

  /**
   * Obtenir toutes les demandes
   */
  public getAllRequests(): ApprovalRequest[] {
    return Array.from(this.requests.values());
  }

  /**
   * Obtenir une demande par ID
   */
  public getRequest(requestId: string): ApprovalRequest | undefined {
    return this.requests.get(requestId);
  }

  /**
   * Vérifier les timeouts et escalader
   */
  public checkTimeouts(): void {
    const now = new Date();

    for (const [id, request] of this.requests) {
      if (request.status !== 'pending') continue;

      const workflow = this.workflows.get(request.workflowId);
      if (!workflow) continue;

      const currentLevel = workflow.levels.find(l => l.level === request.currentLevel);
      if (!currentLevel || !currentLevel.timeout || !currentLevel.autoEscalate) continue;

      const hoursSinceUpdate = (now.getTime() - request.updatedAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceUpdate > currentLevel.timeout) {
        // Escalader au niveau suivant
        if (request.currentLevel < workflow.levels.length) {
          request.currentLevel++;
          request.updatedAt = now;
          console.log(`Escalated request ${id} to level ${request.currentLevel}`);
        }
      }
    }
  }
}

/**
 * Instance singleton du moteur de workflow
 */
export const approvalWorkflowEngine = new ApprovalWorkflowEngine();

