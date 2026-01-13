// src/domain/nomenclature.ts
export type NomenclatureDomain = "F" | "S" | "C" | "T" | "L";

export type FamilyCode = `${NomenclatureDomain}${number}${number}-${number}${number}`; 
// ex: "F10-01"

export interface NomenclatureFamily {
  code: FamilyCode;
  label: string;
  domain: NomenclatureDomain;
  parent?: string;         // ex "F10"
  cpvRef?: string[];       // optionnel (référence CPV)
  keywords?: string[];     // aide auto-classification
  allowMixedWith?: FamilyCode[]; // exceptions (ex: livraison)
}

export const NOMENCLATURE: NomenclatureFamily[] = [
  { code: "F10-01", label: "Ciment & liants", domain: "F", parent: "F10", cpvRef: ["44111200-3"], keywords: ["ciment", "liant"] },
  { code: "F10-02", label: "Béton & produits béton", domain: "F", parent: "F10", cpvRef: ["44114000-2"], keywords: ["béton", "dalle", "prêt à l'emploi"] },
  { code: "F10-03", label: "Ferraillage & acier", domain: "F", parent: "F10", keywords: ["fer", "acier", "armature", "treillis"] },

  { code: "F20-01", label: "Menuiserie aluminium", domain: "F", parent: "F20", keywords: ["menuiserie", "aluminium", "profilé"] },
  { code: "F20-02", label: "Carrelage", domain: "F", parent: "F20", keywords: ["carrelage", "faïence"] },

  { code: "S10-01", label: "Location engins TP", domain: "S", parent: "S10", keywords: ["location", "engin", "TP"] },
  { code: "S20-01", label: "Transport & livraison", domain: "S", parent: "S20", keywords: ["transport", "livraison"], allowMixedWith: ["F10-01","F10-02","F10-03","F20-01","F20-02"] },

  { code: "C10-01", label: "Études & conception", domain: "C", parent: "C10", keywords: ["étude", "plan", "architecture", "ingénierie"] },
];

// Helpers
export function getFamily(code: FamilyCode): NomenclatureFamily | undefined {
  return NOMENCLATURE.find(f => f.code === code);
}

export function isCompatibleFamily(bcFamily: FamilyCode, lineFamily: FamilyCode): boolean {
  if (bcFamily === lineFamily) return true;
  // tolérance : la livraison/logistique peut se mélanger si autorisé
  const line = getFamily(lineFamily);
  if (line?.allowMixedWith?.includes(bcFamily)) return true;
  const bc = getFamily(bcFamily);
  if (bc?.allowMixedWith?.includes(lineFamily)) return true;
  return false;
}

// Détecter la famille d'une ligne BC à partir de son code/désignation
export function detectFamilyFromLine(line: { code?: string; designation: string }): FamilyCode | null {
  const upperCode = (line.code || '').toUpperCase();
  const upperDesignation = (line.designation || '').toUpperCase();
  
  // Recherche par code exact ou pattern
  for (const family of NOMENCLATURE) {
    // Si le code de la ligne contient le code de famille
    if (upperCode.includes(family.code) || upperCode.includes(family.parent || '')) {
      return family.code;
    }
  }
  
  // Recherche par mots-clés dans la désignation
  for (const family of NOMENCLATURE) {
    if (family.keywords) {
      const matches = family.keywords.filter(keyword => 
        upperDesignation.includes(keyword.toUpperCase())
      );
      if (matches.length > 0) {
        return family.code;
      }
    }
  }
  
  return null; // Famille non détectée
}

// Obtenir toutes les familles compatibles avec une famille donnée
export function getCompatibleFamilies(familyCode: FamilyCode): FamilyCode[] {
  const family = getFamily(familyCode);
  if (!family) return [];
  
  // Retourner la famille elle-même + celles autorisées à être mélangées
  const compatible = [familyCode];
  
  if (family.allowMixedWith) {
    compatible.push(...family.allowMixedWith);
  }
  
  // Réciproque : trouver les familles qui autorisent cette famille
  for (const otherFamily of NOMENCLATURE) {
    if (otherFamily.allowMixedWith?.includes(familyCode) && !compatible.includes(otherFamily.code)) {
      compatible.push(otherFamily.code);
    }
  }
  
  return compatible;
}

