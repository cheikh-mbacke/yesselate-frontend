/**
 * Tests pour les utilitaires de statistiques BMO
 * 
 * Note: Pour exécuter ces tests, installer un framework de test (ex: Vitest)
 * npm install -D vitest @vitest/ui
 * 
 * Puis ajouter dans package.json:
 * "scripts": {
 *   "test": "vitest",
 *   "test:ui": "vitest --ui"
 * }
 */

import { calculateBMOTotalImpact } from './bmo-stats';
import type { Financials, FinancialGain, FinancialLoss, Facture } from '@/lib/types/bmo.types';
import type { Avenant } from '@/lib/data/avenants';

// Alias pour correspondre au nom utilisé dans le code
const calculateImpactTotal = calculateBMOTotalImpact;
// Mock data pour les tests
const createMockFinancials = (gains: Partial<FinancialGain>[], pertes: Partial<FinancialLoss>[]): Financials => ({
  totalGains: gains.reduce((sum, g) => sum + (g.montant || 0), 0),
  totalPertes: pertes.reduce((sum, p) => sum + (p.montant || 0), 0),
  resultatNet: 0,
  tauxMarge: 0,
  gains: gains.map((g, i) => ({
    id: `GAIN-${i}`,
    date: '01/01/2025',
    category: 'paiement_client',
    categoryLabel: 'Paiement client',
    description: `Gain ${i}`,
    montant: g.montant || 0,
    decisionBMO: g.decisionBMO,
  })) as FinancialGain[],
  pertes: pertes.map((p, i) => ({
    id: `LOSS-${i}`,
    date: '01/01/2025',
    category: 'penalite_retard',
    categoryLabel: 'Pénalité retard',
    description: `Perte ${i}`,
    montant: p.montant || 0,
    decisionBMO: p.decisionBMO,
  })) as FinancialLoss[],
  tresorerieActuelle: 0,
  tresoreriePrevisionnelle: 0,
  treasury: [],
  evolution: [],
  gainsParCategorie: [],
  pertesParCategorie: [],
  kpis: {
    margeNette: 0,
    ratioRecouvrement: 0,
    expositionLitiges: 0,
    provisionContentieux: 0,
  },
});

const createMockFacture = (overrides: Partial<Facture>): Facture => ({
  id: 'F-001',
  dateEmission: '01/01/2025',
  dateReception: '01/01/2025',
  fournisseur: 'Fournisseur Test',
  chantier: 'Chantier Test',
  chantierId: 'CH-001',
  referenceBC: 'BC-001',
  montantHT: 1000000,
  montantTTC: 1200000,
  description: 'Facture test',
  statut: 'conforme',
  ...overrides,
});

const createMockAvenant = (overrides: Partial<Avenant>): Avenant => ({
  id: 'AV-001',
  dateProposition: '01/01/2025',
  chantier: 'Chantier Test',
  chantierId: 'CH-001',
  bcReference: 'BC-001',
  motif: 'Test',
  description: 'Avenant test',
  montantInitial: 1000000,
  montantRevisé: 1100000,
  ecart: 100000,
  statut: 'validé',
  auteur: 'Test',
  ...overrides,
});

// WHY: Chaque décision BMO doit avoir un hash SHA3-256 horodaté pour garantir l'intégrité et la traçabilité
// Le rôle RACI ('A' ou 'R') détermine qui est responsable de la validation
test('impactTotal inclut les gains, pertes, factures et avenants validés', () => {
  const financials = createMockFinancials(
    [
      { montant: 1000000, decisionBMO: { decisionId: 'DEC-1', origin: 'validation-bc', validatorRole: 'A', hash: 'SHA3-256:test1' } },
      { montant: 2000000, decisionBMO: { decisionId: 'DEC-2', origin: 'validation-bc', validatorRole: 'R', hash: 'SHA3-256:test2' } },
      { montant: 3000000 }, // Pas de decisionBMO, ne doit pas être inclus
    ],
    [
      { montant: 500000, decisionBMO: { decisionId: 'DEC-3', origin: 'arbitrages', validatorRole: 'A', hash: 'SHA3-256:test3' } },
      { montant: 1500000 }, // Pas de decisionBMO, ne doit pas être inclus
    ]
  );

  const factures: Facture[] = [
    createMockFacture({ 
      montantTTC: 4000000, 
      decisionBMO: { decisionId: 'DEC-4', origin: 'validation-paiements', validatorRole: 'A', hash: 'SHA3-256:test4' } 
    }),
    createMockFacture({ montantTTC: 5000000 }), // Pas de decisionBMO, ne doit pas être inclus
  ];

  const avenants: Avenant[] = [
    createMockAvenant({ 
      ecart: 600000, 
      decisionBMO: { decisionId: 'DEC-5', origin: 'validation-avenants', validatorRole: 'R', hash: 'SHA3-256:test5' } 
    }),
    createMockAvenant({ ecart: 700000 }), // Pas de decisionBMO, ne doit pas être inclus
  ];

  const impact = calculateBMOTotalImpact(financials, factures, avenants);

  // Gains avec decisionBMO: 1000000 + 2000000 = 3000000
  // Pertes avec decisionBMO: 500000
  // Factures avec decisionBMO: 4000000
  // Avenants avec decisionBMO: 600000
  // Total attendu: 8100000
  expect(impact).toBe(8100000);
  expect(impact).toBeGreaterThan(0);
});

test('impactTotal retourne 0 si aucune décision BMO', () => {
  const financials = createMockFinancials(
    [{ montant: 1000000 }], // Pas de decisionBMO
    [{ montant: 500000 }] // Pas de decisionBMO
  );

  const factures: Facture[] = [createMockFacture({ montantTTC: 4000000 })];
  const avenants: Avenant[] = [createMockAvenant({ ecart: 600000 })];

  const impact = calculateBMOTotalImpact(financials, factures, avenants);
  expect(impact).toBe(0);
});

test('impactTotal utilise la valeur absolue des montants', () => {
  const financials = createMockFinancials(
    [{ montant: -1000000, decisionBMO: { decisionId: 'DEC-1', origin: 'test', validatorRole: 'A', hash: 'SHA3-256:test' } }], // Montant négatif
    [{ montant: -500000, decisionBMO: { decisionId: 'DEC-2', origin: 'test', validatorRole: 'A', hash: 'SHA3-256:test' } }] // Montant négatif
  );

  const factures: Facture[] = [
    createMockFacture({ montantTTC: -2000000, decisionBMO: { decisionId: 'DEC-3', origin: 'test', validatorRole: 'A', hash: 'SHA3-256:test' } })
  ];

  const avenants: Avenant[] = [
    createMockAvenant({ ecart: -300000, decisionBMO: { decisionId: 'DEC-4', origin: 'test', validatorRole: 'A', hash: 'SHA3-256:test' } })
  ];

  const impact = calculateBMOTotalImpact(financials, factures, avenants);
  
  // Tous les montants sont en valeur absolue
  // 1000000 + 500000 + 2000000 + 300000 = 3800000
  expect(impact).toBe(3800000);
});

