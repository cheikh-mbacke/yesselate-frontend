/**
 * Types TypeScript pour le module Centre d'Alerte - Maître d'Ouvrage
 */

// ================================
// Types de base
// ================================

export type TypologieAlerte = "CRITIQUE" | "SLA" | "RH" | "PROJET";

export type StatutAlerte = "EN_COURS" | "ACQUITTEE" | "RESOLUE";

export type SeveriteAlerte = "critical" | "warning" | "info" | "success";

// ================================
// Interfaces principales
// ================================

export interface Alerte {
  id: string;
  titre: string;
  description?: string;
  typologie: TypologieAlerte;
  statut: StatutAlerte;
  severite: SeveriteAlerte;
  bureau: string;
  responsable: string;
  responsableId?: string;
  montant?: number;
  devise?: string;
  dateDeclenchement: string;
  dateResolution?: string;
  dateAcquittement?: string;
  estSla?: boolean;
  estBloquante?: boolean;
  projetId?: string;
  projetNom?: string;
  chantierId?: string;
  chantierNom?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
}

export interface AlerteStats {
  total: number;
  critiques: number;
  sla: number;
  rh: number;
  projets: number;
  parBureau: Record<string, number>;
  parTypologie: Record<TypologieAlerte, number>;
  parStatut: Record<StatutAlerte, number>;
}

export interface AlerteFiltres {
  typologies?: TypologieAlerte[];
  statuts?: StatutAlerte[];
  bureaux?: string[];
  responsables?: string[];
  projets?: string[];
  dateDebut?: Date;
  dateFin?: Date;
  recherche?: string;
}

// ================================
// Types pour la navigation
// ================================

export interface AlerteNavItem {
  id: string;
  label: string;
  icon?: string;
  route: string;
  badge?: number;
  badgeType?: "default" | "warning" | "critical";
  children?: AlerteNavItem[];
}

