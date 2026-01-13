# ⚡ ACTIONS IMMÉDIATES - DOSSIERS BLOQUÉS

## 🎯 3 Actions Rapides pour Améliorer l'Expérience

Ces 3 actions peuvent être faites **en moins de 30 minutes** et amélioreront significativement l'expérience.

---

## 1. ✅ SYNC AUTOMATIQUE DU BADGE SIDEBAR (10 min)

### Problème Actuel
Le badge "Dossiers Bloqués" dans la sidebar est hardcodé à `4`.

### Solution

**Étape 1**: Créer le hook (5 min)

Créer `src/hooks/useBlockedSync.ts`:
```typescript
import { useEffect } from 'react';
import { useNavigationStore } from '@/lib/stores';
import { blockedDossiers } from '@/lib/data';
import type { BlockedDossier } from '@/lib/types/bmo.types';

export function useBlockedSync() {
  const { updatePageCount } = useNavigationStore();

  useEffect(() => {
    const syncCount = () => {
      const data = blockedDossiers as unknown as BlockedDossier[];
      const count = data.filter(d => 
        d.status === 'pending' || d.status === 'escalated'
      ).length;
      
      updatePageCount('blocked', count);
    };

    // Sync immédiat
    setTimeout(syncCount, 100);

    // Sync toutes les 30s
    const interval = setInterval(syncCount, 30000);

    return () => clearInterval(interval);
  }, [updatePageCount]);
}
```

**Étape 2**: Utiliser le hook (2 min)

Dans `app/(portals)/maitre-ouvrage/blocked/page.tsx`:
```typescript
import { useBlockedSync } from '@/hooks/useBlockedSync';

function BlockedPageContent() {
  useBlockedSync(); // ← Ajouter cette ligne en haut
  
  // ... reste du code existant
}
```

**Résultat**: Le badge se met à jour automatiquement avec le bon nombre !

---

## 2. ✅ AMÉLIORER LES TOOLTIPS KPI (10 min)

### Problème Actuel
Les sparklines dans les KPIs n'ont pas de tooltip explicatif.

### Solution

Dans `src/components/features/bmo/workspace/blocked/command-center/BlockedKPIBar.tsx`:

**Avant** (ligne 231):
```typescript
{kpi.sparkline && kpi.sparkline.length > 0 && (
  <div className="flex items-end gap-0.5 h-4 mt-1.5">
    {kpi.sparkline.map((val, i) => {
      // ... code sparkline
    })}
  </div>
)}
```

**Après**:
```typescript
{kpi.sparkline && kpi.sparkline.length > 0 && (
  <div className="flex items-end gap-0.5 h-4 mt-1.5" role="img" aria-label="Graphique d'évolution">
    {kpi.sparkline.map((val, i) => {
      const maxVal = Math.max(...kpi.sparkline!);
      const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
      
      const barColor = i === kpi.sparkline!.length - 1
        ? statusColors[kpi.status].replace('text-', 'bg-')
        : 'bg-slate-700/60';
      
      const dayLabel = i === 0 ? 'Il y a 6j' : 
                      i === kpi.sparkline!.length - 1 ? 'Aujourd\'hui' :
                      `J-${kpi.sparkline!.length - i - 1}`;
      
      return (
        <div
          key={i}
          className={cn('flex-1 rounded-sm min-h-[2px] group relative', barColor)}
          style={{ height: `${Math.max(height, 10)}%` }}
          title={`${dayLabel}: ${val}`}
        >
          {/* Tooltip on hover */}
          <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none transition-opacity z-10">
            {dayLabel}: {val}
          </div>
        </div>
      );
    })}
  </div>
)}
```

**Résultat**: Hover sur les barres affiche un tooltip avec la date et la valeur !

---

## 3. ✅ AJOUTER LE RACCOURCI ⌘R POUR REFRESH (5 min)

### Problème Actuel
Pas de raccourci clavier rapide pour rafraîchir.

### Solution

Dans `app/(portals)/maitre-ouvrage/blocked/page.tsx`, ajouter dans `handleKeyDown` (ligne ~296):

**Avant**:
```typescript
// ⌘E - Export
if (isMod && e.key.toLowerCase() === 'e') {
  e.preventDefault();
  openModal('export');
  return;
}

// F11 - Fullscreen
```

**Après**:
```typescript
// ⌘E - Export
if (isMod && e.key.toLowerCase() === 'e') {
  e.preventDefault();
  openModal('export');
  return;
}

// ⌘R - Refresh
if (isMod && e.key.toLowerCase() === 'r') {
  e.preventDefault();
  handleRefresh();
  return;
}

// F11 - Fullscreen
```

**Mettre à jour le dropdown menu** (ligne ~452):
```typescript
<DropdownMenuItem onClick={handleRefresh} disabled={isRefreshing}>
  <RefreshCw className={cn('mr-2 h-4 w-4', isRefreshing && 'animate-spin')} />
  Rafraîchir
  <kbd className="ml-auto text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
    ⌘R
  </kbd>
</DropdownMenuItem>
```

**Résultat**: L'utilisateur peut rafraîchir avec ⌘R (comme un navigateur) !

---

## 🚀 BONUS: Quick Wins Optionnels (5 min chacun)

### 4. Loading State sur les Boutons

Dans `BlockedKPIBar`, ajouter un état de loading:
```typescript
<Button
  variant="ghost"
  size="sm"
  onClick={onRefresh}
  disabled={isRefreshing}
  className="h-6 w-6 p-0 text-slate-500 hover:text-slate-300 disabled:opacity-50"
  aria-label={isRefreshing ? 'Rafraîchissement...' : 'Rafraîchir'}
>
  <RefreshCw className={cn('h-3 w-3', isRefreshing && 'animate-spin')} />
</Button>
```

### 5. Feedback Sonore sur Actions Critiques

```typescript
// Ajouter dans les actions critiques
const playSound = (type: 'success' | 'error' | 'warning') => {
  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.volume = 0.3;
  audio.play().catch(() => {/* ignore errors */});
};

// Utiliser
const handleEscalate = () => {
  // ... logique escalade
  playSound('warning');
  toast.warning('Blocage escaladé');
};
```

### 6. Raccourci pour Toggle KPI Bar

```typescript
// Dans handleKeyDown
// ⌘⇧K - Toggle KPI Bar
if (isMod && e.shiftKey && e.key.toLowerCase() === 'k') {
  e.preventDefault();
  setKPIConfig({ collapsed: !kpiConfig.collapsed });
  return;
}
```

---

## 📋 Checklist d'Implémentation

### Essentiels (30 min total)
- [ ] useBlockedSync pour sidebar badge
- [ ] Tooltips sur sparklines
- [ ] Raccourci ⌘R pour refresh

### Bonus (15 min total)
- [ ] Loading states sur boutons
- [ ] Feedback sonore
- [ ] Toggle KPI Bar (⌘⇧K)

---

## 🎯 Impact Attendu

### useBlockedSync
- ✅ Badge sidebar toujours à jour
- ✅ Meilleure awareness de l'activité
- ✅ Sync automatique toutes les 30s

### Tooltips Sparklines
- ✅ Compréhension immédiate des tendances
- ✅ Pas besoin de cliquer pour voir les détails
- ✅ UX plus professionnelle

### Raccourci ⌘R
- ✅ Muscle memory des utilisateurs
- ✅ Refresh plus rapide
- ✅ Cohérent avec les standards web

---

## 💡 Après ces Actions

Votre page Dossiers Bloqués aura:

1. ✅ **Badge sidebar dynamique** qui se met à jour auto
2. ✅ **Tooltips informatifs** sur tous les graphiques
3. ✅ **Raccourci ⌘R** familier pour les utilisateurs
4. ✅ **Feedback visuel** sur toutes les actions
5. ✅ **UX encore plus polie** qu'Analytics

Total temps: **30-45 minutes**
Impact: **Énorme** sur l'expérience utilisateur

---

*Actions recommandées - Janvier 2026*
*Page: Dossiers Bloqués v2.0*

