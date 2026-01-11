# Étapes d'Intégration - AnomalyAnnotationPanel

## ✅ Déjà Fait

1. ✅ Imports ajoutés (BatchActionsBar, ExportModal, AnnotationDetailModal, Checkbox)
2. ✅ États ajoutés (sélection, pagination, modals, loading)
3. ✅ Composants créés (BatchActionsBar, ExportModal, AnnotationDetailModal)

## ⏳ À Faire

### 1. Ajouter la logique de pagination (useMemo)

Dans la section "Computed", après les filteredAnnotations :

```typescript
// Pagination - Anomalies
const paginatedAnomalies = useMemo(() => {
  const startIndex = (currentPageAnomalies - 1) * itemsPerPage;
  return filteredUnresolvedAnomalies.slice(startIndex, startIndex + itemsPerPage);
}, [filteredUnresolvedAnomalies, currentPageAnomalies, itemsPerPage]);

const totalPagesAnomalies = Math.ceil(filteredUnresolvedAnomalies.length / itemsPerPage);

// Pagination - Annotations
const paginatedAnnotations = useMemo(() => {
  const startIndex = (currentPageAnnotations - 1) * itemsPerPage;
  return filteredAnnotations.slice(startIndex, startIndex + itemsPerPage);
}, [filteredAnnotations, currentPageAnnotations, itemsPerPage]);

const totalPagesAnnotations = Math.ceil(filteredAnnotations.length / itemsPerPage);

// Reset pagination quand les filtres changent
useEffect(() => {
  setCurrentPageAnomalies(1);
  setCurrentPageAnnotations(1);
}, [searchQuery, severityFilter]);
```

### 2. Ajouter les handlers (après handleCopy)

```typescript
// Handlers pour sélection
const handleToggleAnomalySelection = (anomalyId: string) => {
  setSelectedAnomalyIds(prev => {
    const next = new Set(prev);
    if (next.has(anomalyId)) {
      next.delete(anomalyId);
    } else {
      next.add(anomalyId);
    }
    return next;
  });
};

const handleToggleAnnotationSelection = (annotationId: string) => {
  setSelectedAnnotationIds(prev => {
    const next = new Set(prev);
    if (next.has(annotationId)) {
      next.delete(annotationId);
    } else {
      next.add(annotationId);
    }
    return next;
  });
};

// Handlers pour actions en lot
const handleBulkResolve = async (anomalyIds: string[]) => {
  setIsBulkResolving(true);
  try {
    for (const id of anomalyIds) {
      await Promise.resolve(onResolveAnomaly(id));
    }
    setSelectedAnomalyIds(new Set());
    addToast(`${anomalyIds.length} anomalie(s) résolue(s)`, 'success');
  } catch (error) {
    addToast('Erreur lors de la résolution en lot', 'error');
  } finally {
    setIsBulkResolving(false);
  }
};

const handleBulkDelete = async (annotationIds: string[]) => {
  if (!onDeleteAnnotation) return;
  setIsBulkDeleting(true);
  try {
    for (const id of annotationIds) {
      await Promise.resolve(onDeleteAnnotation(id));
    }
    setSelectedAnnotationIds(new Set());
    addToast(`${annotationIds.length} annotation(s) supprimée(s)`, 'success');
  } catch (error) {
    addToast('Erreur lors de la suppression en lot', 'error');
  } finally {
    setIsBulkDeleting(false);
  }
};

const handleExport = async (config: ExportConfig) => {
  setIsExporting(true);
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    addToast('Export réussi', 'success');
    setExportModalOpen(false);
  } catch (error) {
    addToast('Erreur lors de l\'export', 'error');
  } finally {
    setIsExporting(false);
  }
};
```

### 3. Modifier les sections pour utiliser paginatedAnomalies/paginatedAnnotations

Remplacer :
- `filteredUnresolvedAnomalies.map` → `paginatedAnomalies.map`
- `filteredAnnotations.map` → `paginatedAnnotations.map`

### 4. Ajouter les checkboxes dans AnomalyCard et AnnotationCard

### 5. Ajouter les composants en fin de return (avant la fermeture du TooltipProvider)

```tsx
{/* BatchActionsBar */}
<BatchActionsBar
  selectedCount={selectedAnomalyIds.size + selectedAnnotationIds.size}
  selectedAnomalyIds={selectedAnomalyIds}
  selectedAnnotationIds={selectedAnnotationIds}
  onResolveSelected={handleBulkResolve}
  onExportSelected={() => setExportModalOpen(true)}
  onDeleteSelected={handleBulkDelete}
  onClear={() => {
    setSelectedAnomalyIds(new Set());
    setSelectedAnnotationIds(new Set());
  }}
  isResolving={isBulkResolving}
  isDeleting={isBulkDeleting}
/>

{/* ExportModal */}
<ExportModal
  isOpen={exportModalOpen}
  onClose={() => setExportModalOpen(false)}
  onExport={handleExport}
  filteredCount={filteredUnresolvedAnomalies.length + filteredAnnotations.length}
  selectedAnomalyCount={selectedAnomalyIds.size}
  selectedAnnotationCount={selectedAnnotationIds.size}
  hasFilters={severityFilter !== 'all' || !!searchQuery}
/>

{/* AnnotationDetailModal */}
{selectedAnnotationId && (
  <AnnotationDetailModal
    isOpen={annotationDetailModalOpen}
    onClose={() => {
      setAnnotationDetailModalOpen(false);
      setSelectedAnnotationId(null);
    }}
    annotation={annotations.find(a => a.id === selectedAnnotationId) || null}
    annotations={filteredAnnotations}
    linkedAnomaly={annotations.find(a => a.id === selectedAnnotationId)?.anomalyId 
      ? anomalies.find(an => an.id === annotations.find(a => a.id === selectedAnnotationId)?.anomalyId) || null
      : null}
    onUpdate={onUpdateAnnotation}
    onDelete={onDeleteAnnotation}
    onNavigatePrev={(prev) => setSelectedAnnotationId(prev.id)}
    onNavigateNext={(next) => setSelectedAnnotationId(next.id)}
    onEdit={(annotation) => {
      setEditingAnnotationId(annotation.id);
      setEditingComment(annotation.comment);
    }}
  />
)}
```

### 6. Ajouter les contrôles de pagination après chaque section

```tsx
{/* Pagination Anomalies */}
{totalPagesAnomalies > 1 && (
  <div className="flex items-center justify-between px-4 py-2 border-t border-slate-700/50">
    <p className="text-sm text-slate-400">
      Page {currentPageAnomalies} sur {totalPagesAnomalies} • {filteredUnresolvedAnomalies.length} anomalie{filteredUnresolvedAnomalies.length > 1 ? 's' : ''}
    </p>
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPageAnomalies(Math.max(1, currentPageAnomalies - 1))}
        disabled={currentPageAnomalies === 1}
        className="h-8 w-8 p-0 border-slate-700"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPageAnomalies(Math.min(totalPagesAnomalies, currentPageAnomalies + 1))}
        disabled={currentPageAnomalies === totalPagesAnomalies}
        className="h-8 w-8 p-0 border-slate-700"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  </div>
)}
```

