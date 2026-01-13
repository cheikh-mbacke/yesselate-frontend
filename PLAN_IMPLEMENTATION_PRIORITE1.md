# Plan d'Implémentation - Priorité 1

## Fonctionnalités à Implémenter

### 1. Pagination ✅
- États : `currentPage`, `itemsPerPage` (10, 25, 50, 100)
- Calcul des pages paginées pour chaque section (anomalies, annotations)
- Composant de pagination réutilisable
- Reset de la page quand les filtres changent

### 2. BatchActionsBar ✅
- Sélection multiple avec checkboxes
- Barre d'actions flottante en bas
- Actions : Résoudre sélectionné, Exporter sélectionné, Supprimer annotations sélectionnées
- Compteur d'items sélectionnés

### 3. ExportModal ✅
- Formats : CSV, Excel, PDF, JSON
- Options : Tout exporter, Filtré, Sélectionné
- Options d'inclusion : Détails, Annotations, Résolues
- Callback `onExport` dans les props

### 4. AnnotationDetailModal ✅
- Similaire à AnomalyDetailModal
- Navigation prev/next
- Affichage complet de l'annotation
- Actions : Modifier, Supprimer

## Structure des Fichiers

```
src/components/features/bmo/validation-bc/
├── AnomalyAnnotationPanel.tsx (MODIFIÉ - ajout pagination, sélection)
├── components/
│   ├── BatchActionsBar.tsx (NOUVEAU)
│   └── PaginationControls.tsx (NOUVEAU - optionnel, peut être inline)
├── modals/
│   ├── ExportModal.tsx (NOUVEAU)
│   └── AnnotationDetailModal.tsx (NOUVEAU)
```

## Étapes d'Implémentation

1. ✅ Créer BatchActionsBar.tsx
2. ✅ Créer ExportModal.tsx  
3. ✅ Créer AnnotationDetailModal.tsx
4. ✅ Modifier AnomalyAnnotationPanel.tsx :
   - Ajouter états pagination et sélection
   - Ajouter pagination aux listes
   - Ajouter checkboxes de sélection
   - Intégrer BatchActionsBar
   - Intégrer ExportModal
   - Intégrer AnnotationDetailModal

## Notes

- La pagination sera appliquée séparément pour chaque section (anomalies actives, résolues, annotations)
- Les sélections seront maintenues par section
- L'export prendra en compte les filtres actifs
- Les modals utiliseront le pattern overlay existant

