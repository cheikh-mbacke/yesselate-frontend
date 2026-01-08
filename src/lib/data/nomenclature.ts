// ============================================
// Nomenclature interne (type CPV)
// ============================================

import type { NomenclatureFamily } from '@/lib/types/bmo.types';

export const NOMENCLATURE: NomenclatureFamily[] = [
  { code: "F10-01", label: "Ciment & liants", domain: "F", parent: "F10" },
  { code: "F10-02", label: "Ferraillage & acier", domain: "F", parent: "F10" },
  { code: "F20-01", label: "Menuiserie aluminium", domain: "F", parent: "F20" },
  { code: "S10-01", label: "Location engins TP", domain: "S", parent: "S10" },
  { code: "S20-01", label: "Transport & livraison", domain: "S", parent: "S20", allowMixedWith: ["F10-01", "F10-02"] },
  { code: "C10-01", label: "Études & conception", domain: "C", parent: "C10" },
];

