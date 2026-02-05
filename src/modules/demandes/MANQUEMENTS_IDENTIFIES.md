# 🔍 Éléments Manquants - Module Demandes

## ❌ MODALS MANQUANTES

### 1. **DemandeDetailModal** 🔴 CRITIQUE
**Problème**: Aucune modal pour visualiser/valider/rejeter une demande en détail

**Ce qui devrait exister**:
```typescript
<DemandeDetailModal
  open={detailModalOpen}
  demande={selectedDemande}
  onClose={() => setDetailModalOpen(false)}
  onValidate={(id, comment) => handleValidate(id, comment)}
  onReject={(id, reason) => handleReject(id, reason)}
  onRequestComplement={(id, message) => handleRequestComplement(id, message)}
  prevDemande={prevDemande}
  nextDemande={nextDemande}
  onNavigate={(id) => setSelectedDemande(id)}
/>
```

**Sections nécessaires**:
- Onglet **Détails** : Référence, titre, description, montant, dates, statut, priorité, service
- Onglet **Documents** : Fichiers joints, pièces justificatives
- Onglet **Historique** : Timeline des actions (création, modifications, validations)
- Onglet **Commentaires** : Notes et commentaires internes
- Actions : Valider, Rejeter, Demander complément, Affecter, Escalader

**Pattern à utiliser**: `GenericDetailModal` (comme dans autres modules)

---

### 2. **FiltersModal** 🟡 IMPORTANT
**Problème**: Pas de modal de filtres avancés (sauvegarde/chargement de filtres)

**Ce qui devrait exister**:
```typescript
<FiltersModal
  isOpen={filtersModalOpen}
  filters={filters}
  onApplyFilters={(newFilters) => handleApplyFilters(newFilters)}
  onSaveFilter={(name, filters) => handleSaveFilter(name, filters)}
  savedFilters={savedFilters}
  onLoadFilter={(id) => handleLoadFilter(id)}
/>
```

**Filtres nécessaires**:
- Statut (multiple)
- Service (multiple)
- Priorité (multiple)
- Période (dates)
- Montant (min/max)
- Créateur
- Date de création/échéance

---

### 3. **ExportModal** 🟡 IMPORTANT
**Problème**: Pas de modal d'export de données

**Ce qui devrait exister**:
```typescript
<ExportModal
  isOpen={exportModalOpen}
  onClose={() => setExportModalOpen(false)}
  data={filteredDemandes}
  onExport={(format, options) => handleExport(format, options)}
/>
```

**Formats nécessaires**:
- Excel (.xlsx)
- CSV (.csv)
- PDF (.pdf)
- JSON (.json)

**Options**:
- Colonnes à exporter
- Filtres appliqués
- Formattage

---

### 4. **HelpModal (F1)** 🟢 OPTIONNEL
**Problème**: Pas de modal d'aide utilisateur

**Ce qui devrait exister**:
- Raccourcis clavier
- Guide d'utilisation
- FAQ

---

## 📊 CHARTS/GRAPHIQUES MANQUANTS

### 1. **TrendsPage - Charts Recharts** 🔴 CRITIQUE
**Problème**: Graphique basique HTML/CSS au lieu de Recharts

**Ce qui devrait exister**:
```typescript
<AreaChart data={trendsData}>
  <Area dataKey="count" fill="#f97316" fillOpacity={0.3} />
  <Line dataKey="count" stroke="#f97316" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Legend />
</AreaChart>
```

**Graphiques nécessaires**:
- Évolution temporelle (AreaChart ou LineChart)
- Répartition par statut (PieChart)
- Répartition par service (BarChart)
- Comparaison périodes (BarChart groupé)

---

### 2. **StatsPage - Charts supplémentaires** 🟡 IMPORTANT
**Problème**: Pas de graphiques visuels (seulement cartes)

**Ce qui devrait exister**:
- PieChart : Répartition par statut
- BarChart : Stats par service
- BarChart horizontal : Top demandes
- RadarChart : Performance multi-critères

---

## 🎯 FONCTIONNALITÉS MANQUANTES

### 1. **Actions Batch (Sélection multiple)** 🔴 CRITIQUE
**Problème**: Pas de sélection multiple ni d'actions groupées

**Ce qui devrait exister**:
```typescript
<BatchActionsBar
  selectedCount={selectedIds.length}
  onValidateAll={() => handleValidateBatch(selectedIds)}
  onRejectAll={(reason) => handleRejectBatch(selectedIds, reason)}
  onExportAll={() => handleExportBatch(selectedIds)}
  onClearSelection={() => clearSelection()}
/>
```

**Actions nécessaires**:
- Valider en masse
- Rejeter en masse
- Exporter en masse
- Affecter en masse
- Supprimer en masse

---

### 2. **Recherche avancée** 🟡 IMPORTANT
**Problème**: Pas de recherche intelligente (seulement filtre basique)

**Ce qui devrait exister**:
- Recherche globale (titre, référence, description)
- Recherche par mots-clés
- Autocomplétion
- Historique de recherche

---

### 3. **Actions sur les demandes** 🔴 CRITIQUE
**Problème**: Les cartes `DemandeCard` ne sont pas cliquables/actionnables

**Ce qui devrait exister**:
- Clic → Ouvre `DemandeDetailModal`
- Actions contextuelles (menu dropdown)
- Raccourcis clavier (Valider, Rejeter)

---

### 4. **Pagination** 🟡 IMPORTANT
**Problème**: Affiche toutes les demandes d'un coup (pas de pagination)

**Ce qui devrait exister**:
- Pagination avec `pageSize` configurable
- Navigation (prev/next)
- Affichage "X-Y sur Z"

---

### 5. **Tri** 🟡 IMPORTANT
**Problème**: Pas de tri des demandes

**Ce qui devrait exister**:
- Tri par : Date, Montant, Priorité, Statut, Service
- Ordre : Croissant/Descendant
- Tri multi-colonnes

---

### 6. **Filtres persistants** 🟢 OPTIONNEL
**Problème**: Filtres non sauvegardés entre sessions

**Ce qui devrait exister**:
- Sauvegarde de filtres personnalisés
- Filtres par défaut utilisateur
- URL avec paramètres de filtres

---

## 📦 COMPOSANTS UI MANQUANTS

### 1. **BatchActionsBar** 🔴 CRITIQUE
**Problème**: Pas de barre d'actions batch

**Pattern à utiliser**: Comme `GovernanceBatchActionsBar`

---

### 2. **FiltersPanel** (slide-in) 🟡 IMPORTANT
**Problème**: Seulement modal, pas de panel persistant

**Ce qui devrait exister**:
- Panel slide-in à gauche/droite
- Filtres rapides visibles
- Badge nombre de filtres actifs

---

### 3. **DemandeCard amélioré** 🟡 IMPORTANT
**Problème**: Card basique sans actions ni interactivité

**Ce qui devrait exister**:
- Clic pour ouvrir modal
- Menu contextuel (dropdown)
- Actions rapides (icônes)
- État visuel (hover, selected)

---

### 4. **CommandPalette** 🟢 OPTIONNEL
**Problème**: Pas de command palette pour navigation rapide

**Ce qui devrait exister**:
- Raccourci `Cmd+K` / `Ctrl+K`
- Recherche rapide de demandes
- Actions rapides

---

## 🔧 PATTERNS MANQUANTS

### 1. **DetailModal avec navigation prev/next** 🔴 CRITIQUE
**Pattern**: Utiliser `GenericDetailModal` avec props `prev`/`next`

---

### 2. **Toast notifications** 🟢 OPTIONNEL
**Problème**: Pas de toasts pour actions (validation, rejet)

**Ce qui devrait exister**:
- Toast success : "Demande validée avec succès"
- Toast error : "Erreur lors de la validation"
- Toast info : "Complément demandé"

---

### 3. **Loading states avancés** 🟡 IMPORTANT
**Problème**: Skeleton basique

**Ce qui devrait exister**:
- Skeleton adapté à chaque type de contenu
- Loading progress pour actions longues
- États optimistes (optimistic updates)

---

## 📋 RÉSUMÉ PAR PRIORITÉ

### 🔴 CRITIQUE (À faire en priorité)
1. **DemandeDetailModal** - Modal de détail avec actions
2. **TrendsPage Charts** - Intégrer Recharts
3. **Actions Batch** - Sélection multiple + BatchActionsBar
4. **Actions sur demandes** - Cliquables, menus contextuels
5. **DetailModal navigation** - Prev/next pour naviguer entre demandes

### 🟡 IMPORTANT (À faire ensuite)
6. **FiltersModal** - Filtres avancés avec sauvegarde
7. **ExportModal** - Export de données
8. **StatsPage Charts** - Graphiques supplémentaires
9. **Recherche avancée** - Recherche intelligente
10. **Pagination** - Pagination des listes
11. **Tri** - Tri des demandes
12. **FiltersPanel** - Panel slide-in persistant
13. **DemandeCard amélioré** - Interactivité et actions

### 🟢 OPTIONNEL (Nice to have)
14. **HelpModal** - Modal d'aide (F1)
15. **CommandPalette** - Navigation rapide
16. **Toast notifications** - Notifications d'actions
17. **Filtres persistants** - Sauvegarde entre sessions

---

## 🎯 ESTIMATION

- **Critique** : ~4-6 heures de développement
- **Important** : ~6-8 heures de développement
- **Optionnel** : ~4-6 heures de développement

**TOTAL** : ~14-20 heures de développement pour compléter tous les éléments manquants

