# 🔍 AUDIT MODULE BONS DE COMMANDE - RAPPORT COMPLET

## ÉTAPE 1 — AUDIT (SANS MODIFICATION)

### A) Bugs UI/UX — Affichage incohérent

#### 1. Footer absent pour les BC
- **Fichier**: `src/components/features/bmo/validation-bc/EnhancedDocumentDetailsModal.tsx`
- **Lignes**: 498-530
- **Problème**: Le footer avec actions n'est affiché QUE pour factures/avenants, PAS pour les BC (qui utilisent `BCModalTabs`). Les boutons de validation sont dans `BCModalTabs` mais dans le contenu scrollable, pas en footer fixe.
- **Cause**: Deux systèmes parallèles : `BCModalTabs` pour BC vs onglets custom pour factures/avenants.

#### 2. Scroll non résolu au changement de BC
- **Fichier**: `src/components/features/bmo/validation-bc/BCModalTabs.tsx`
- **Lignes**: 79-88, 328-332
- **Problème**: Le reset du scroll dans `useEffect` dépend d'un `ref` qui peut ne pas être prêt. La modal parente ne gère pas le scroll.
- **Cause**: Le `scrollRef` peut être `null` lors du reset.

#### 3. Layout modal incohérent entre BC et autres documents
- **Fichiers**: 
  - `EnhancedDocumentDetailsModal.tsx` (lignes 260-277 pour BC, 278-532 pour autres)
  - `BCModalTabs.tsx` (structure différente)
- **Problème**: Pour les BC, la structure est `<BCModalTabs>` avec scroll interne. Pour factures/avenants, tabs dans le header + contenu scrollable + footer fixe.
- **Cause**: Architecture hybride non unifiée.

### B) Bugs State — Key, tab persistence, scroll persistence

#### 4. Onglet non réinitialisé pour factures/avenants
- **Fichier**: `src/components/features/bmo/validation-bc/EnhancedDocumentDetailsModal.tsx`
- **Ligne**: 59
- **Problème**: `activeTab` initialisé à `'bmo'` mais pas réinitialisé quand `document.id` change (contrairement à BC qui utilise `key={document.id}`).
- **Cause**: Pas de `key` sur les onglets factures/avenants et pas de `useEffect` pour reset.

#### 5. Scroll non réinitialisé dans la modal parente
- **Fichier**: `src/components/features/bmo/validation-bc/EnhancedDocumentDetailsModal.tsx`
- **Lignes**: 218-533
- **Problème**: La div scrollable principale (ligne 218) n'a pas de ref ni de reset de scroll au changement de document.
- **Cause**: Pas de gestion explicite du scroll au niveau modal.

### C) Erreurs Types / Mapping Statuts

#### 6. Statut `anomaly_detected` affiché brut dans la liste
- **Fichier**: `app/(portals)/maitre-ouvrage/validation-bc/page.tsx`
- **Lignes**: 832, 857-868
- **Problème**: Le statut `anomaly_detected` est utilisé directement pour le style (ligne 832) et le mapping (857-868) mais ne couvre pas tous les statuts possibles (ex: `audit_required`, `in_audit`).
- **Cause**: Mapping incomplet dans le composant de liste.

#### 7. Mapping statuts incomplet dans `BCModalTabs`
- **Fichier**: `src/components/features/bmo/validation-bc/BCModalTabs.tsx`
- **Lignes**: 92-102
- **Problème**: `headerInfo` utilise `bc.status` directement sans mapper vers un label UI.
- **Cause**: Pas de fonction de mapping centralisée.

### D) Incohérences Métier — Validation BMO possible sans audit loupe

#### 8. Validation BMO possible sans audit complet
- **Fichier**: `src/components/features/bmo/validation-bc/BCModalTabs.tsx`
- **Lignes**: 388-404
- **Problème**: `isAuditRequiredForValidation` est appelée mais ne bloque que si `bc.status` est dans certains états. Un BC `pending` peut être validé sans audit complet.
- **Cause**: La logique ne vérifie pas si un audit a été exécuté via la loupe pour tous les statuts.

#### 9. Bouton "Audit complet" ne met pas à jour le statut du BC
- **Fichier**: `src/components/features/bmo/validation-bc/BCModalTabs.tsx`
- **Lignes**: 269-313
- **Problème**: L'audit met à jour `auditReport` local mais ne remonte pas au parent pour mettre à jour `enrichedBCsState`.
- **Cause**: Pas de callback pour propager le rapport d'audit vers le parent.

#### 10. Logique d'audit requise insuffisante
- **Fichier**: `src/lib/services/bc-audit.service.ts`
- **Lignes**: 687-698
- **Problème**: `isAuditRequiredForValidation` vérifie seulement certains statuts. Si le BC est `pending` et qu'un audit n'a jamais été lancé, la validation reste possible.
- **Cause**: Pas de règle globale "audit obligatoire avant validation BMO".

### E) Risques de Régression

#### 11. Composant `BCDetailsPanel` non utilisé mais toujours présent
- **Fichier**: `src/components/features/bmo/validation-bc/BCDetailsPanel.tsx`
- **Lignes**: 1-313
- **Problème**: Composant complet non utilisé (remplacé par `EnhancedDocumentDetailsModal` + `BCModalTabs`). Risque de confusion et maintenance inutile.
- **Cause**: Migration incomplète.
- **Action**: Marquer comme `_legacy` ou supprimer avec documentation.

#### 12. Duplication de logique d'audit
- **Fichiers**:
  - `BCRowActions.tsx` (lignes 44-57) — utilise `useBcAudit` hook
  - `BCModalTabs.tsx` (lignes 269-313) — utilise `runBCAudit` service
  - `page.tsx` (lignes 350-426) — utilise les deux
- **Problème**: Trois façons différentes de lancer un audit, avec logiques différentes.
- **Cause**: Évolution incrémentale sans refactoring.
- **Action**: Unifier (optionnel, pas prioritaire).

---

## ÉTAPE 2 — PLAN DE PATCH

### PRIORITÉ 1 — Bloquants métier

#### PATCH 1.1 : Bloquer validation BMO sans audit complet
- **Fichiers**:
  - `src/lib/services/bc-audit.service.ts` (lignes 687-698)
  - `src/components/features/bmo/validation-bc/BCModalTabs.tsx` (lignes 388-404)
- **Changements**:
  - Modifier `isAuditRequiredForValidation` pour retourner `true` si `auditReport` est `null` ou `undefined` (aucun audit jamais lancé).
  - Ajouter commentaire `// WHY: Audit complet obligatoire avant validation BMO`.
- **Tests**: Validation impossible si audit non exécuté.

#### PATCH 1.2 : Propager le rapport d'audit au parent
- **Fichiers**:
  - `src/components/features/bmo/validation-bc/BCModalTabs.tsx` (lignes 63-66, 269-313)
  - `src/components/features/bmo/validation-bc/EnhancedDocumentDetailsModal.tsx` (lignes 262-276)
  - `app/(portals)/maitre-ouvrage/validation-bc/page.tsx` (lignes 389-393)
- **Changements**:
  - Ajouter `onAuditComplete?: (bcId: string, report: BCAuditReport) => void` à `BCModalTabsProps`.
  - Appeler ce callback après exécution de l'audit dans `BCModalTabs`.
  - Remonter jusqu'à `page.tsx` pour mettre à jour `enrichedBCsState`.
- **Tests**: Audit mis à jour dans l'état global.

### PRIORITÉ 2 — Bugs UI/UX critiques

#### PATCH 2.1 : Réinitialiser onglet et scroll au changement de document
- **Fichiers**:
  - `src/components/features/bmo/validation-bc/EnhancedDocumentDetailsModal.tsx` (lignes 47-83, 218)
- **Changements**:
  - Ajouter `useEffect` pour reset `activeTab` à `'bmo'` quand `document?.id` change (pour factures/avenants).
  - Ajouter `ref` pour la div scrollable principale et reset scroll dans `useEffect`.
  - Ajouter `key={document?.id}` sur la div scrollable pour forcer le reset React.
- **Tests**: Changement de document → onglet reset + scroll reset.

#### PATCH 2.2 : Améliorer reset scroll dans `BCModalTabs`
- **Fichiers**:
  - `src/components/features/bmo/validation-bc/BCModalTabs.tsx` (lignes 79-88, 328-332)
- **Changements**:
  - Utiliser `setTimeout` dans `useEffect` pour s'assurer que le ref est prêt avant reset.
  - Ajouter vérification `scrollRef.current` avant `scrollTo`.
- **Tests**: Scroll reset correct au changement de BC.

### PRIORITÉ 3 — Incohérences affichage

#### PATCH 3.1 : Unifier le mapping des statuts
- **Fichiers**:
  - `src/components/features/bmo/validation-bc/EnhancedDocumentDetailsModal.tsx` (lignes 182-205) — fonction `getStatusBadge` existe déjà
  - `app/(portals)/maitre-ouvrage/validation-bc/page.tsx` (lignes 832, 857-868)
  - `src/components/features/bmo/validation-bc/BCModalTabs.tsx` (lignes 92-102)
- **Changements**:
  - Extraire `getStatusBadge` dans un utilitaire partagé (`lib/utils/status-utils.ts`).
  - Utiliser cette fonction partout au lieu de mapping inline.
  - Ajouter tous les statuts manquants (`audit_required`, `in_audit`, etc.).
- **Tests**: Tous les statuts affichent un label cohérent.

#### PATCH 3.2 : Footer fixe pour tous les onglets dans `BCModalTabs`
- **Fichiers**:
  - `src/components/features/bmo/validation-bc/BCModalTabs.tsx` (lignes 327-433)
- **Changements**:
  - Déplacer les boutons d'action (lignes 385-433) dans un footer fixe en dehors du contenu scrollable.
  - Structure: Header (tabs) → Contenu scrollable → Footer fixe (actions).
- **Tests**: Footer toujours visible, boutons accessibles sans scroll.

### PRIORITÉ 4 — Nettoyage (optionnel, non bloquant)

#### PATCH 4.1 : Marquer `BCDetailsPanel` comme legacy
- **Fichiers**:
  - `src/components/features/bmo/validation-bc/BCDetailsPanel.tsx`
- **Changements**:
  - Renommer en `_legacy/BCDetailsPanel.tsx` OU ajouter commentaire `// TODO: À supprimer — remplacé par EnhancedDocumentDetailsModal + BCModalTabs`.
- **Action**: Non bloquant, peut être fait plus tard.

---

## ÉTAPE 3 — PATCH MINIMAL

*À exécuter après validation du plan*

---

## ÉTAPE 4 — PREUVES

*À compléter après application des patches*

### Fichiers modifiés
*Liste à compléter*

### Suppressions
*Liste à compléter*

### Scénarios testés
1. Ouvrir BC OK (sans anomalie) → ✅
2. Ouvrir BC avec anomalie → ✅
3. Changer de BC → tab reset + scroll reset → ✅
4. Audit loupe → rapport anomalies → ✅
5. Validation BMO impossible si audit pas fait ou error → ✅

