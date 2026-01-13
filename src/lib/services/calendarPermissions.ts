/**
 * SYSTÈME DE PERMISSIONS ET RBAC (Role-Based Access Control)
 * 
 * Gère les permissions d'accès au calendrier :
 * - Qui peut voir quels événements
 * - Qui peut créer/modifier/supprimer
 * - Permissions granulaires par bureau/projet
 * - Rôles prédéfinis et personnalisés
 */

// ============================================
// TYPES
// ============================================

export type CalendarRole = 
  | 'admin'           // Accès complet, toutes actions
  | 'manager'         // Gestion d'un bureau/projet
  | 'coordinator'     // Coordination événements
  | 'contributor'     // Création et modification limités
  | 'viewer'          // Lecture seule
  | 'guest';          // Accès très limité

export type CalendarPermission =
  // Lecture
  | 'calendar.view_all'
  | 'calendar.view_own'
  | 'calendar.view_bureau'
  | 'calendar.view_project'
  
  // Création
  | 'calendar.create'
  | 'calendar.create_bureau'
  | 'calendar.create_project'
  
  // Modification
  | 'calendar.update_all'
  | 'calendar.update_own'
  | 'calendar.update_bureau'
  
  // Suppression
  | 'calendar.delete_all'
  | 'calendar.delete_own'
  
  // Participants
  | 'calendar.manage_participants'
  | 'calendar.invite_external'
  
  // Export
  | 'calendar.export'
  | 'calendar.export_sensitive'
  
  // Statistiques
  | 'calendar.view_stats'
  | 'calendar.view_detailed_stats'
  
  // Administration
  | 'calendar.manage_settings'
  | 'calendar.manage_permissions'
  | 'calendar.view_audit';

export interface UserContext {
  id: string;
  name: string;
  email?: string;
  role: CalendarRole;
  bureaux?: string[]; // Bureaux gérés
  projects?: string[]; // Projets gérés
  permissions?: CalendarPermission[]; // Permissions personnalisées
}

export interface EventContext {
  id: string;
  createdBy?: string;
  bureau?: string;
  project?: string;
  assignees?: Array<{ userId: string }>;
  isPublic?: boolean;
}

// ============================================
// CONFIGURATION DES RÔLES
// ============================================

const ROLE_PERMISSIONS: Record<CalendarRole, CalendarPermission[]> = {
  admin: [
    'calendar.view_all',
    'calendar.create',
    'calendar.update_all',
    'calendar.delete_all',
    'calendar.manage_participants',
    'calendar.invite_external',
    'calendar.export',
    'calendar.export_sensitive',
    'calendar.view_stats',
    'calendar.view_detailed_stats',
    'calendar.manage_settings',
    'calendar.manage_permissions',
    'calendar.view_audit',
  ],
  
  manager: [
    'calendar.view_all',
    'calendar.view_bureau',
    'calendar.create_bureau',
    'calendar.update_bureau',
    'calendar.delete_own',
    'calendar.manage_participants',
    'calendar.export',
    'calendar.view_stats',
    'calendar.view_detailed_stats',
  ],
  
  coordinator: [
    'calendar.view_all',
    'calendar.view_bureau',
    'calendar.create',
    'calendar.update_own',
    'calendar.delete_own',
    'calendar.manage_participants',
    'calendar.export',
    'calendar.view_stats',
  ],
  
  contributor: [
    'calendar.view_bureau',
    'calendar.view_own',
    'calendar.create_bureau',
    'calendar.update_own',
    'calendar.export',
  ],
  
  viewer: [
    'calendar.view_bureau',
    'calendar.view_own',
  ],
  
  guest: [
    'calendar.view_own',
  ],
};

// ============================================
// SERVICE DE PERMISSIONS
// ============================================

export class CalendarPermissionService {
  private static instance: CalendarPermissionService;

  private constructor() {}

  public static getInstance(): CalendarPermissionService {
    if (!this.instance) {
      this.instance = new CalendarPermissionService();
    }
    return this.instance;
  }

  /**
   * Vérifier si un utilisateur a une permission
   */
  hasPermission(user: UserContext, permission: CalendarPermission): boolean {
    // Admin a toutes les permissions
    if (user.role === 'admin') {
      return true;
    }

    // Vérifier permissions du rôle
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    if (rolePermissions.includes(permission)) {
      return true;
    }

    // Vérifier permissions personnalisées
    if (user.permissions && user.permissions.includes(permission)) {
      return true;
    }

    return false;
  }

  /**
   * Vérifier si un utilisateur peut voir un événement
   */
  canViewEvent(user: UserContext, event: EventContext): boolean {
    // Admin voit tout
    if (this.hasPermission(user, 'calendar.view_all')) {
      return true;
    }

    // Événement public
    if (event.isPublic) {
      return true;
    }

    // Créateur de l'événement
    if (event.createdBy === user.id) {
      return true;
    }

    // Participant de l'événement
    if (event.assignees?.some(a => a.userId === user.id)) {
      return true;
    }

    // Événement dans un bureau géré
    if (event.bureau && user.bureaux?.includes(event.bureau)) {
      if (this.hasPermission(user, 'calendar.view_bureau')) {
        return true;
      }
    }

    // Événement dans un projet géré
    if (event.project && user.projects?.includes(event.project)) {
      if (this.hasPermission(user, 'calendar.view_project')) {
        return true;
      }
    }

    return false;
  }

  /**
   * Vérifier si un utilisateur peut créer un événement
   */
  canCreateEvent(user: UserContext, eventData?: Partial<EventContext>): boolean {
    // Permission générale
    if (this.hasPermission(user, 'calendar.create')) {
      return true;
    }

    // Création dans un bureau spécifique
    if (eventData?.bureau) {
      if (user.bureaux?.includes(eventData.bureau)) {
        return this.hasPermission(user, 'calendar.create_bureau');
      }
    }

    // Création dans un projet spécifique
    if (eventData?.project) {
      if (user.projects?.includes(eventData.project)) {
        return this.hasPermission(user, 'calendar.create_project');
      }
    }

    return false;
  }

  /**
   * Vérifier si un utilisateur peut modifier un événement
   */
  canUpdateEvent(user: UserContext, event: EventContext): boolean {
    // Permission de modification globale
    if (this.hasPermission(user, 'calendar.update_all')) {
      return true;
    }

    // Modification de ses propres événements
    if (event.createdBy === user.id && this.hasPermission(user, 'calendar.update_own')) {
      return true;
    }

    // Modification d'événements du bureau
    if (event.bureau && user.bureaux?.includes(event.bureau)) {
      if (this.hasPermission(user, 'calendar.update_bureau')) {
        return true;
      }
    }

    return false;
  }

  /**
   * Vérifier si un utilisateur peut supprimer un événement
   */
  canDeleteEvent(user: UserContext, event: EventContext): boolean {
    // Permission de suppression globale
    if (this.hasPermission(user, 'calendar.delete_all')) {
      return true;
    }

    // Suppression de ses propres événements
    if (event.createdBy === user.id && this.hasPermission(user, 'calendar.delete_own')) {
      return true;
    }

    return false;
  }

  /**
   * Vérifier si un utilisateur peut gérer les participants
   */
  canManageParticipants(user: UserContext, event: EventContext): boolean {
    // Permission générale
    if (this.hasPermission(user, 'calendar.manage_participants')) {
      return true;
    }

    // Organisateur de l'événement
    if (event.createdBy === user.id) {
      return true;
    }

    return false;
  }

  /**
   * Vérifier si un utilisateur peut inviter des externes
   */
  canInviteExternal(user: UserContext): boolean {
    return this.hasPermission(user, 'calendar.invite_external');
  }

  /**
   * Vérifier si un utilisateur peut exporter
   */
  canExport(user: UserContext, includeSensitive: boolean = false): boolean {
    if (includeSensitive) {
      return this.hasPermission(user, 'calendar.export_sensitive');
    }
    return this.hasPermission(user, 'calendar.export');
  }

  /**
   * Vérifier si un utilisateur peut voir les statistiques
   */
  canViewStats(user: UserContext, detailed: boolean = false): boolean {
    if (detailed) {
      return this.hasPermission(user, 'calendar.view_detailed_stats');
    }
    return this.hasPermission(user, 'calendar.view_stats');
  }

  /**
   * Obtenir les permissions effectives d'un utilisateur
   */
  getEffectivePermissions(user: UserContext): CalendarPermission[] {
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    const customPermissions = user.permissions || [];
    
    // Fusionner et dédupliquer
    return Array.from(new Set([...rolePermissions, ...customPermissions]));
  }

  /**
   * Filtrer les événements selon les permissions
   */
  filterEventsByPermissions(user: UserContext, events: EventContext[]): EventContext[] {
    return events.filter(event => this.canViewEvent(user, event));
  }

  /**
   * Construire un filtre Prisma selon les permissions
   */
  buildPermissionFilter(user: UserContext): any {
    // Admin voit tout
    if (this.hasPermission(user, 'calendar.view_all')) {
      return {};
    }

    const conditions: any[] = [];

    // Événements créés par l'utilisateur
    if (this.hasPermission(user, 'calendar.view_own')) {
      conditions.push({ createdBy: user.id });
    }

    // Événements où l'utilisateur est participant
    conditions.push({
      assignees: {
        some: {
          userId: user.id,
        },
      },
    });

    // Événements dans les bureaux gérés
    if (this.hasPermission(user, 'calendar.view_bureau') && user.bureaux && user.bureaux.length > 0) {
      conditions.push({
        bureau: {
          in: user.bureaux,
        },
      });
    }

    // Événements dans les projets gérés
    if (this.hasPermission(user, 'calendar.view_project') && user.projects && user.projects.length > 0) {
      conditions.push({
        project: {
          in: user.projects,
        },
      });
    }

    // Événements publics
    conditions.push({ isPublic: true });

    return conditions.length > 0 ? { OR: conditions } : { id: { equals: null } };
  }

  /**
   * Attribuer un rôle à un utilisateur
   */
  assignRole(userId: string, role: CalendarRole): void {
    // TODO: Enregistrer dans la DB
    console.log(`Assigning role ${role} to user ${userId}`);
  }

  /**
   * Attribuer une permission personnalisée
   */
  grantPermission(userId: string, permission: CalendarPermission): void {
    // TODO: Enregistrer dans la DB
    console.log(`Granting permission ${permission} to user ${userId}`);
  }

  /**
   * Révoquer une permission
   */
  revokePermission(userId: string, permission: CalendarPermission): void {
    // TODO: Supprimer de la DB
    console.log(`Revoking permission ${permission} from user ${userId}`);
  }

  /**
   * Obtenir les rôles disponibles
   */
  getAvailableRoles(): Array<{ role: CalendarRole; description: string }> {
    return [
      { role: 'admin', description: 'Administrateur - Accès complet' },
      { role: 'manager', description: 'Gestionnaire - Gestion bureau/projet' },
      { role: 'coordinator', description: 'Coordinateur - Coordination événements' },
      { role: 'contributor', description: 'Contributeur - Création limitée' },
      { role: 'viewer', description: 'Visualisateur - Lecture seule' },
      { role: 'guest', description: 'Invité - Accès minimal' },
    ];
  }

  /**
   * Obtenir les permissions d'un rôle
   */
  getRolePermissions(role: CalendarRole): CalendarPermission[] {
    return ROLE_PERMISSIONS[role] || [];
  }
}

// ============================================
// MIDDLEWARE / GUARDS
// ============================================

/**
 * Middleware pour vérifier les permissions
 */
export function requirePermission(permission: CalendarPermission) {
  return (user: UserContext) => {
    const service = CalendarPermissionService.getInstance();
    
    if (!service.hasPermission(user, permission)) {
      throw new Error(`Permission refusée: ${permission}`);
    }
  };
}

/**
 * Guard pour vérifier l'accès à un événement
 */
export function requireEventAccess(action: 'view' | 'update' | 'delete') {
  return (user: UserContext, event: EventContext) => {
    const service = CalendarPermissionService.getInstance();
    
    let hasAccess = false;
    
    switch (action) {
      case 'view':
        hasAccess = service.canViewEvent(user, event);
        break;
      case 'update':
        hasAccess = service.canUpdateEvent(user, event);
        break;
      case 'delete':
        hasAccess = service.canDeleteEvent(user, event);
        break;
    }
    
    if (!hasAccess) {
      throw new Error(`Accès refusé: impossible de ${action} cet événement`);
    }
  };
}

// Export singleton
export default CalendarPermissionService.getInstance();

