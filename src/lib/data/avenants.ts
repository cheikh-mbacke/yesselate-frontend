// ============================================
// Types et données pour les Avenants
// ============================================

// =============== TYPES (réutilise BMODecision de @/lib/types/bmo.types) ===============
import type { BMODecision } from '@/lib/types/bmo.types';

// =============== ÉTATS AVENANT ===============
export type AvenantStatut =
  | 'proposé'
  | 'en_analyse'
  | 'validé'
  | 'rejeté'
  | 'signé';

// =============== STRUCTURE AVENANT ===============
export interface Avenant {
  id: string;               // AV-2026-001
  dateProposition: string;  // '10/01/2026'
  chantier: string;         // 'Chantier Dakar Nord'
  chantierId: string;       // 'CH-2025-DKN'
  bcReference: string;      // 'BC-2025-0154'
  motif: string;            // 'Modification planning – aléa climatique'
  description: string;      // 'Report de 15j – impact sur livraison béton'
  montantInitial: number;   // 185000000 (montant du BC initial)
  montantRevisé: number;    // 192000000 (nouveau montant)
  ecart: number;            // +7000000
  statut: AvenantStatut;
  auteur: string;           // 'Ingénieur BM – SONATEL'

  // 🔑 CHAMP CLÉ : DÉCISION BMO
  decisionBMO?: BMODecision;
}

// =============== DONNÉES EXEMPLE ===============
export const avenants: Avenant[] = [
  {
    id: 'AV-2026-001',
    dateProposition: '10/01/2026',
    chantier: 'Chantier Dakar Nord',
    chantierId: 'CH-2025-DKN',
    bcReference: 'BC-2025-0154',
    motif: 'Aléa climatique',
    description: 'Report de 15j – impact sur livraison béton',
    montantInitial: 185_000_000,
    montantRevisé: 192_000_000,
    ecart: 7_000_000,
    statut: 'signé',
    auteur: 'Ingénieur BM – SONATEL',
    decisionBMO: {
      decisionId: 'AVDEC-20260115-001',
      origin: 'validation-avenants',
      validatorRole: 'A',
      hash: 'SHA3-256:c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
      comment: 'Validé – justifié par rapport pluviométrique DG',
    },
  },
  {
    id: 'AV-2026-002',
    dateProposition: '18/01/2026',
    chantier: 'Chantier Ziguinchor Port',
    chantierId: 'CH-2025-ZGP',
    bcReference: 'BC-2025-0188',
    motif: 'Changement de fournisseur',
    description: 'Remplacement SENFER par EIFFAGE – coût +5%',
    montantInitial: 1_250_000_000,
    montantRevisé: 1_312_500_000,
    ecart: 62_500_000,
    statut: 'rejeté',
    auteur: 'BM EIFFAGE',
    decisionBMO: {
      decisionId: 'AVDEC-20260122-002',
      origin: 'validation-avenants',
      validatorRole: 'A',
      hash: 'SHA3-256:d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3',
      comment: 'Rejeté – non conforme clause 8.2 marché',
    },
  },
  {
    id: 'AV-2026-003',
    dateProposition: '05/01/2026',
    chantier: 'Chantier Thiès Est',
    chantierId: 'CH-2025-THE',
    bcReference: 'BC-2025-0201',
    motif: 'Erreur de quantité',
    description: 'Correction volume parpaings – +1200 unités',
    montantInitial: 8_500_000,
    montantRevisé: 9_100_000,
    ecart: 600_000,
    statut: 'en_analyse',
    auteur: 'Chef de chantier – MATBTP',
    // ⏳ En attente de décision BMO
  },
];

