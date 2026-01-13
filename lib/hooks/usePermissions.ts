/**
 * Hook de gestion des permissions utilisateur
 * ============================================
 * 
 * Fournit un système granulaire de contrôle d'accès basé sur les rôles
 */

import { useMemo } from 'react';

// ============================================
// TYPES
// ============================================

export type UserRole = 
  | 'direction'
  | 'chef_service'
  | 'chef_projet'
  | 'comptable'
  | 'ingenieur'
  | 'technicien'
  | 'support'
  | 'rh'
  | 'juridique'
  | 'admin';

export interface User {
  id: string;
  nom: string;
  role: UserRole;
  departement?: string;
  permissions?: string[];
}

export interface Permissions {
  // Projets
  canViewProjets: boolean;
  canCreateProjet: boolean;
  canEditProjet: boolean;
  canDeleteProjet: boolean;
  canBlockProjet: boolean;
  canCloseProjet: boolean;

  // Validation
  canValidateBC: boolean;
  canValidateContrat: boolean;
  canValidatePaiement: boolean;
  canRejectValidation: boolean;

  // Clients
  canViewClients: boolean;
  canCreateClient: boolean;
  canEditClient: boolean;
  canDeleteClient: boolean;

  // Finances
  canViewFinances: boolean;
  canEditBudget: boolean;
  canApproveBudget: boolean;
  canViewTresorerie: boolean;
  canManageTresorerie: boolean;

  // RH
  canViewEmployes: boolean;
  canCreateEmploye: boolean;
  canEditEmploye: boolean;
  canDeleteEmploye: boolean;
  canViewSalaires: boolean;
  canEditSalaires: boolean;
  canApproveConges: boolean;

  // Litiges
  canViewLitiges: boolean;
  canCreateLitige: boolean;
  canManageLitige: boolean;

  // Système
  canViewAudit: boolean;
  canViewLogs: boolean;
  canManageParameters: boolean;
  canManageUsers: boolean;
  canExportData: boolean;

  // Missions
  canViewMissions: boolean;
  canCreateMission: boolean;
  canApproveMission: boolean;
  canValidateFrais: boolean;
}

// ============================================
// MATRICES DE PERMISSIONS PAR RÔLE
// ============================================

const rolePermissions: Record<UserRole, Permissions> = {
  direction: {
    // Projets
    canViewProjets: true,
    canCreateProjet: true,
    canEditProjet: true,
    canDeleteProjet: true,
    canBlockProjet: true,
    canCloseProjet: true,

    // Validation
    canValidateBC: true,
    canValidateContrat: true,
    canValidatePaiement: true,
    canRejectValidation: true,

    // Clients
    canViewClients: true,
    canCreateClient: true,
    canEditClient: true,
    canDeleteClient: true,

    // Finances
    canViewFinances: true,
    canEditBudget: true,
    canApproveBudget: true,
    canViewTresorerie: true,
    canManageTresorerie: true,

    // RH
    canViewEmployes: true,
    canCreateEmploye: true,
    canEditEmploye: true,
    canDeleteEmploye: true,
    canViewSalaires: true,
    canEditSalaires: true,
    canApproveConges: true,

    // Litiges
    canViewLitiges: true,
    canCreateLitige: true,
    canManageLitige: true,

    // Système
    canViewAudit: true,
    canViewLogs: true,
    canManageParameters: true,
    canManageUsers: true,
    canExportData: true,

    // Missions
    canViewMissions: true,
    canCreateMission: true,
    canApproveMission: true,
    canValidateFrais: true,
  },

  chef_service: {
    canViewProjets: true,
    canCreateProjet: true,
    canEditProjet: true,
    canDeleteProjet: false,
    canBlockProjet: true,
    canCloseProjet: true,
    canValidateBC: true,
    canValidateContrat: true,
    canValidatePaiement: true,
    canRejectValidation: true,
    canViewClients: true,
    canCreateClient: true,
    canEditClient: true,
    canDeleteClient: false,
    canViewFinances: true,
    canEditBudget: true,
    canApproveBudget: false,
    canViewTresorerie: true,
    canManageTresorerie: false,
    canViewEmployes: true,
    canCreateEmploye: false,
    canEditEmploye: true,
    canDeleteEmploye: false,
    canViewSalaires: true,
    canEditSalaires: false,
    canApproveConges: true,
    canViewLitiges: true,
    canCreateLitige: true,
    canManageLitige: true,
    canViewAudit: true,
    canViewLogs: false,
    canManageParameters: false,
    canManageUsers: false,
    canExportData: true,
    canViewMissions: true,
    canCreateMission: true,
    canApproveMission: true,
    canValidateFrais: true,
  },

  chef_projet: {
    canViewProjets: true,
    canCreateProjet: false,
    canEditProjet: true,
    canDeleteProjet: false,
    canBlockProjet: false,
    canCloseProjet: false,
    canValidateBC: false,
    canValidateContrat: false,
    canValidatePaiement: false,
    canRejectValidation: false,
    canViewClients: true,
    canCreateClient: false,
    canEditClient: false,
    canDeleteClient: false,
    canViewFinances: true,
    canEditBudget: false,
    canApproveBudget: false,
    canViewTresorerie: false,
    canManageTresorerie: false,
    canViewEmployes: true,
    canCreateEmploye: false,
    canEditEmploye: false,
    canDeleteEmploye: false,
    canViewSalaires: false,
    canEditSalaires: false,
    canApproveConges: false,
    canViewLitiges: true,
    canCreateLitige: false,
    canManageLitige: false,
    canViewAudit: false,
    canViewLogs: false,
    canManageParameters: false,
    canManageUsers: false,
    canExportData: true,
    canViewMissions: true,
    canCreateMission: true,
    canApproveMission: false,
    canValidateFrais: false,
  },

  comptable: {
    canViewProjets: true,
    canCreateProjet: false,
    canEditProjet: false,
    canDeleteProjet: false,
    canBlockProjet: false,
    canCloseProjet: false,
    canValidateBC: true,
    canValidateContrat: false,
    canValidatePaiement: true,
    canRejectValidation: true,
    canViewClients: true,
    canCreateClient: false,
    canEditClient: false,
    canDeleteClient: false,
    canViewFinances: true,
    canEditBudget: true,
    canApproveBudget: false,
    canViewTresorerie: true,
    canManageTresorerie: true,
    canViewEmployes: true,
    canCreateEmploye: false,
    canEditEmploye: false,
    canDeleteEmploye: false,
    canViewSalaires: true,
    canEditSalaires: false,
    canApproveConges: false,
    canViewLitiges: false,
    canCreateLitige: false,
    canManageLitige: false,
    canViewAudit: true,
    canViewLogs: false,
    canManageParameters: false,
    canManageUsers: false,
    canExportData: true,
    canViewMissions: true,
    canCreateMission: false,
    canApproveMission: false,
    canValidateFrais: true,
  },

  rh: {
    canViewProjets: true,
    canCreateProjet: false,
    canEditProjet: false,
    canDeleteProjet: false,
    canBlockProjet: false,
    canCloseProjet: false,
    canValidateBC: false,
    canValidateContrat: false,
    canValidatePaiement: false,
    canRejectValidation: false,
    canViewClients: false,
    canCreateClient: false,
    canEditClient: false,
    canDeleteClient: false,
    canViewFinances: false,
    canEditBudget: false,
    canApproveBudget: false,
    canViewTresorerie: false,
    canManageTresorerie: false,
    canViewEmployes: true,
    canCreateEmploye: true,
    canEditEmploye: true,
    canDeleteEmploye: false,
    canViewSalaires: true,
    canEditSalaires: true,
    canApproveConges: true,
    canViewLitiges: false,
    canCreateLitige: false,
    canManageLitige: false,
    canViewAudit: true,
    canViewLogs: false,
    canManageParameters: false,
    canManageUsers: false,
    canExportData: true,
    canViewMissions: true,
    canCreateMission: true,
    canApproveMission: false,
    canValidateFrais: false,
  },

  juridique: {
    canViewProjets: true,
    canCreateProjet: false,
    canEditProjet: false,
    canDeleteProjet: false,
    canBlockProjet: false,
    canCloseProjet: false,
    canValidateBC: false,
    canValidateContrat: true,
    canValidatePaiement: false,
    canRejectValidation: true,
    canViewClients: true,
    canCreateClient: false,
    canEditClient: false,
    canDeleteClient: false,
    canViewFinances: false,
    canEditBudget: false,
    canApproveBudget: false,
    canViewTresorerie: false,
    canManageTresorerie: false,
    canViewEmployes: false,
    canCreateEmploye: false,
    canEditEmploye: false,
    canDeleteEmploye: false,
    canViewSalaires: false,
    canEditSalaires: false,
    canApproveConges: false,
    canViewLitiges: true,
    canCreateLitige: true,
    canManageLitige: true,
    canViewAudit: true,
    canViewLogs: false,
    canManageParameters: false,
    canManageUsers: false,
    canExportData: true,
    canViewMissions: false,
    canCreateMission: false,
    canApproveMission: false,
    canValidateFrais: false,
  },

  ingenieur: {
    canViewProjets: true,
    canCreateProjet: false,
    canEditProjet: true,
    canDeleteProjet: false,
    canBlockProjet: false,
    canCloseProjet: false,
    canValidateBC: false,
    canValidateContrat: false,
    canValidatePaiement: false,
    canRejectValidation: false,
    canViewClients: true,
    canCreateClient: false,
    canEditClient: false,
    canDeleteClient: false,
    canViewFinances: false,
    canEditBudget: false,
    canApproveBudget: false,
    canViewTresorerie: false,
    canManageTresorerie: false,
    canViewEmployes: true,
    canCreateEmploye: false,
    canEditEmploye: false,
    canDeleteEmploye: false,
    canViewSalaires: false,
    canEditSalaires: false,
    canApproveConges: false,
    canViewLitiges: false,
    canCreateLitige: false,
    canManageLitige: false,
    canViewAudit: false,
    canViewLogs: false,
    canManageParameters: false,
    canManageUsers: false,
    canExportData: false,
    canViewMissions: true,
    canCreateMission: true,
    canApproveMission: false,
    canValidateFrais: false,
  },

  technicien: {
    canViewProjets: true,
    canCreateProjet: false,
    canEditProjet: false,
    canDeleteProjet: false,
    canBlockProjet: false,
    canCloseProjet: false,
    canValidateBC: false,
    canValidateContrat: false,
    canValidatePaiement: false,
    canRejectValidation: false,
    canViewClients: false,
    canCreateClient: false,
    canEditClient: false,
    canDeleteClient: false,
    canViewFinances: false,
    canEditBudget: false,
    canApproveBudget: false,
    canViewTresorerie: false,
    canManageTresorerie: false,
    canViewEmployes: false,
    canCreateEmploye: false,
    canEditEmploye: false,
    canDeleteEmploye: false,
    canViewSalaires: false,
    canEditSalaires: false,
    canApproveConges: false,
    canViewLitiges: false,
    canCreateLitige: false,
    canManageLitige: false,
    canViewAudit: false,
    canViewLogs: false,
    canManageParameters: false,
    canManageUsers: false,
    canExportData: false,
    canViewMissions: true,
    canCreateMission: false,
    canApproveMission: false,
    canValidateFrais: false,
  },

  support: {
    canViewProjets: false,
    canCreateProjet: false,
    canEditProjet: false,
    canDeleteProjet: false,
    canBlockProjet: false,
    canCloseProjet: false,
    canValidateBC: false,
    canValidateContrat: false,
    canValidatePaiement: false,
    canRejectValidation: false,
    canViewClients: true,
    canCreateClient: false,
    canEditClient: false,
    canDeleteClient: false,
    canViewFinances: false,
    canEditBudget: false,
    canApproveBudget: false,
    canViewTresorerie: false,
    canManageTresorerie: false,
    canViewEmployes: false,
    canCreateEmploye: false,
    canEditEmploye: false,
    canDeleteEmploye: false,
    canViewSalaires: false,
    canEditSalaires: false,
    canApproveConges: false,
    canViewLitiges: false,
    canCreateLitige: false,
    canManageLitige: false,
    canViewAudit: false,
    canViewLogs: false,
    canManageParameters: false,
    canManageUsers: false,
    canExportData: false,
    canViewMissions: false,
    canCreateMission: false,
    canApproveMission: false,
    canValidateFrais: false,
  },

  admin: {
    canViewProjets: true,
    canCreateProjet: true,
    canEditProjet: true,
    canDeleteProjet: true,
    canBlockProjet: true,
    canCloseProjet: true,
    canValidateBC: true,
    canValidateContrat: true,
    canValidatePaiement: true,
    canRejectValidation: true,
    canViewClients: true,
    canCreateClient: true,
    canEditClient: true,
    canDeleteClient: true,
    canViewFinances: true,
    canEditBudget: true,
    canApproveBudget: true,
    canViewTresorerie: true,
    canManageTresorerie: true,
    canViewEmployes: true,
    canCreateEmploye: true,
    canEditEmploye: true,
    canDeleteEmploye: true,
    canViewSalaires: true,
    canEditSalaires: true,
    canApproveConges: true,
    canViewLitiges: true,
    canCreateLitige: true,
    canManageLitige: true,
    canViewAudit: true,
    canViewLogs: true,
    canManageParameters: true,
    canManageUsers: true,
    canExportData: true,
    canViewMissions: true,
    canCreateMission: true,
    canApproveMission: true,
    canValidateFrais: true,
  },
};

// ============================================
// HOOK
// ============================================

/**
 * Hook de gestion des permissions
 * 
 * @param user Utilisateur courant
 * @returns Permissions de l'utilisateur
 * 
 * @example
 * ```tsx
 * const { canValidateBC, canViewFinances } = usePermissions(currentUser);
 * 
 * return (
 *   <button disabled={!canValidateBC}>
 *     Valider BC
 *   </button>
 * );
 * ```
 */
export function usePermissions(user: User | null): Permissions {
  const permissions = useMemo(() => {
    if (!user) {
      // Aucune permission si pas d'utilisateur
      return Object.keys(rolePermissions.support).reduce((acc, key) => {
        acc[key as keyof Permissions] = false;
        return acc;
      }, {} as Permissions);
    }

    // Permissions de base par rôle
    const basePermissions = rolePermissions[user.role];

    // Permissions personnalisées (si définies)
    if (user.permissions && user.permissions.length > 0) {
      const customPermissions = { ...basePermissions };
      
      user.permissions.forEach((perm) => {
        if (perm in customPermissions) {
          customPermissions[perm as keyof Permissions] = true;
        }
      });

      return customPermissions;
    }

    return basePermissions;
  }, [user]);

  return permissions;
}

/**
 * Vérifie si un utilisateur a une permission spécifique
 * 
 * @param user Utilisateur
 * @param permission Nom de la permission
 * @returns true si l'utilisateur a la permission
 * 
 * @example
 * ```tsx
 * if (hasPermission(user, 'canValidateBC')) {
 *   // Afficher le bouton de validation
 * }
 * ```
 */
export function hasPermission(
  user: User | null,
  permission: keyof Permissions
): boolean {
  if (!user) return false;

  const permissions = rolePermissions[user.role];
  
  // Vérifier permission personnalisée
  if (user.permissions && user.permissions.includes(permission)) {
    return true;
  }

  return permissions[permission];
}

/**
 * Vérifie si un utilisateur a au moins une des permissions
 * 
 * @param user Utilisateur
 * @param permissions Liste des permissions
 * @returns true si l'utilisateur a au moins une permission
 * 
 * @example
 * ```tsx
 * if (hasAnyPermission(user, ['canViewProjets', 'canViewClients'])) {
 *   // Afficher le menu
 * }
 * ```
 */
export function hasAnyPermission(
  user: User | null,
  permissions: Array<keyof Permissions>
): boolean {
  return permissions.some((perm) => hasPermission(user, perm));
}

/**
 * Vérifie si un utilisateur a toutes les permissions
 * 
 * @param user Utilisateur
 * @param permissions Liste des permissions
 * @returns true si l'utilisateur a toutes les permissions
 */
export function hasAllPermissions(
  user: User | null,
  permissions: Array<keyof Permissions>
): boolean {
  return permissions.every((perm) => hasPermission(user, perm));
}

