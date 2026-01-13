# 🚀 Guide d'Intégration Rapide - Gouvernance

## ⚡ Installation des Nouvelles Fonctionnalités

### Étape 1: Wrapper avec ToastProvider

Modifiez `app/(portals)/maitre-ouvrage/governance/page.tsx` :

```typescript
import { GovernanceToastProvider } from '@/components/features/bmo/governance/workspace';

export default function GovernancePageWrapper() {
  return (
    <GovernanceToastProvider>
      <GovernancePage />
    </GovernanceToastProvider>
  );
}

function GovernancePage() {
  // Votre code existant...
}
```

### Étape 2: Utiliser les Toasts

Dans n'importe quel composant enfant :

```typescript
import { useGovernanceToast } from '@/components/features/bmo/governance/workspace';

function MyComponent() {
  const toast = useGovernanceToast();
  
  const handleAction = () => {
    toast.success('Succès !', 'Opération terminée.');
  };
  
  return <button onClick={handleAction}>Action</button>;
}
```

### Étape 3: Ajouter le Panneau de Recherche

Dans votre page principale :

```typescript
import { useState } from 'react';
import { GovernanceSearchPanel } from '@/components/features/bmo/governance/workspace';

function GovernancePage() {
  const [showSearch, setShowSearch] = useState(false);
  
  const handleSearch = (filters) => {
    console.log('Filtres appliqués:', filters);
    // Traiter les filtres...
  };
  
  return (
    <>
      {/* Bouton pour ouvrir */}
      <Button onClick={() => setShowSearch(true)}>
        Recherche Avancée
      </Button>
      
      {/* Panneau */}
      <GovernanceSearchPanel
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onSearch={handleSearch}
      />
    </>
  );
}
```

---

## 🎯 Exemples d'Utilisation

### Notifications Toast

```typescript
// Success
toast.success('RACI mis à jour', 'La matrice a été sauvegardée.');

// Error
toast.error('Échec du chargement', 'Impossible de récupérer les données.');

// Warning
toast.warning('Conflit détecté', '2 responsables sur la même activité.');

// Info
toast.info('Nouvelle alerte', '3 dossiers bloqués nécessitent votre attention.');
```

### Export avec Feedback

```typescript
const handleExport = async (format) => {
  try {
    setExporting(true);
    await exportData(format);
    toast.success('Export réussi !', `Fichier ${format.toUpperCase()} téléchargé.`);
  } catch (error) {
    toast.error('Erreur d\'export', error.message);
  } finally {
    setExporting(false);
  }
};
```

### Recherche Avancée

```typescript
const handleAdvancedSearch = (filters) => {
  const { query, dateFrom, dateTo, bureaux, criticality } = filters;
  
  // Construire la requête
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (dateFrom) params.append('from', dateFrom);
  if (dateTo) params.append('to', dateTo);
  bureaux.forEach(b => params.append('bureau', b));
  criticality.forEach(c => params.append('criticality', c));
  
  // Appeler l'API
  fetch(`/api/governance/search?${params}`)
    .then(res => res.json())
    .then(data => {
      toast.info('Recherche terminée', `${data.length} résultats trouvés.`);
    });
};
```

---

## 🔄 Rafraîchir avec Skeleton

```typescript
const [loading, setLoading] = useState(false);

const handleRefresh = async () => {
  setLoading(true);
  try {
    await fetchData();
    toast.success('Données actualisées', 'Les informations ont été rechargées.');
  } catch (error) {
    toast.error('Erreur', 'Impossible de rafraîchir les données.');
  } finally {
    setTimeout(() => setLoading(false), 500); // Skeleton visible minimum 500ms
  }
};

if (loading) {
  return <GovernanceListSkeleton />;
}
```

---

## 📝 Checklist d'Intégration

- [ ] Wrapper page avec `GovernanceToastProvider`
- [ ] Importer `useGovernanceToast` dans composants
- [ ] Ajouter bouton "Recherche Avancée"
- [ ] Intégrer `GovernanceSearchPanel`
- [ ] Remplacer `console.log` par `toast.*`
- [ ] Ajouter toasts dans actions (export, save, delete...)
- [ ] Tester toutes les notifications
- [ ] Vérifier responsive (mobile/desktop)

---

## 🎨 Personnalisation

### Durée des Toasts

```typescript
toast.success('Message', 'Description', 3000); // 3 secondes
toast.error('Message', 'Description', 10000); // 10 secondes
```

### Position des Toasts (CSS)

Modifier dans `GovernanceToast.tsx` :

```typescript
// Changer de position
<div className="fixed top-4 right-4 z-[100]"> {/* Haut droite */}
<div className="fixed bottom-4 left-4 z-[100]"> {/* Bas gauche */}
<div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100]"> {/* Haut centre */}
```

---

## 🚀 Déploiement

Tout est prêt ! Il suffit de :

1. ✅ Wrapper la page avec ToastProvider
2. ✅ Importer les composants nécessaires
3. ✅ Ajouter les handlers d'événements
4. ✅ Tester en dev
5. ✅ Déployer en production

**Aucune dépendance externe requise** - Tout est en pur React/TypeScript ! 🎉


