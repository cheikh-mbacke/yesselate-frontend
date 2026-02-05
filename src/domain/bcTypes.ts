// src/domain/bcTypes.ts
import type { FamilyCode } from "./nomenclature";

export type BCStatus =
  | "draft_ba"
  | "pending_bmo"
  | "audit_required"
  | "in_audit"
  | "needs_complement"
  | "approved_bmo"
  | "rejected_bmo"
  | "sent_supplier";

export interface BCLine {
  id: string;
  supplierItemRef?: string;
  familyCode: FamilyCode;
  designation: string;
  qty: number;
  unitPriceHT: number;
  chantierRefs?: string[];   // allocations chantier (optionnel)
  costCenters?: string[];    // centres de coûts
}

export interface BonCommande {
  id: string;                 // BC-2025-0154
  supplierId: string;
  supplierName: string;
  familyCode: FamilyCode;     // IMPORTANT : 1 BC = 1 famille principale
  createdBy: string;
  createdAt: string;
  status: BCStatus;
  paymentMethod?: string;
  deliveryAddress?: string;
  vatRate?: number;           // ex 0.20
  lines: BCLine[];
  totalHT?: number;           // peut être recalculé
}

