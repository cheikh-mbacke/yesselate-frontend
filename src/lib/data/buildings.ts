// ============================================
// Bâtiments
// ============================================

import type { Building } from '@/lib/types/bmo.types';

// =========================
// BÂTIMENTS (N bâtiments)
// =========================
export const buildings: Building[] = [
  {
    id: 'BLDG-001',
    name: 'Siège SONATEL - Dakar',
    type: 'bureaux',
    surface: 12500,
  },
  {
    id: 'BLDG-002',
    name: 'Bloc A - Urgences Ziguinchor',
    type: 'sanitaire',
    surface: 8200,
  },
  {
    id: 'BLDG-003',
    name: 'Lot 1 - Villa type A',
    type: 'logement',
    surface: 180,
  },
  {
    id: 'BLDG-004',
    name: 'Lot 2 - Villa type B',
    type: 'logement',
    surface: 220,
  },
];

