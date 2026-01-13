# 🚀 GUIDE RAPIDE - Harmoniser un Nouveau Module

## ⚡ Quick Start (5 étapes - ~15 minutes)

### 1️⃣ Copier le Template

```bash
# Copier le template générique
cp src/components/shared/GenericModalsTemplate.tsx src/components/features/bmo/[MODULE]/[Module]Modals.tsx
```

### 2️⃣ Remplacer les Variables

**Find & Replace** dans votre éditeur :

| Trouver | Remplacer par | Exemple |
|---------|---------------|---------|
| `{{MODULE_NAME}}` | Nom du module | `Delegations` |
| `{{MODULE_COLOR}}` | Couleur principale | `purple` |

**Couleurs par module** (recommandées) :

| Module | Couleur |
|--------|---------|
| Delegations | `purple` |
| Finances | `emerald` |
| Projets | `blue` |
| Litiges | `red` |
| Depenses | `amber` |
| Autres | `blue` (par défaut) |

### 3️⃣ Créer le Panneau de Notifications

```typescript
// Fichier: [Module]NotificationPanel.tsx
// Template minimal (copier depuis un module existant)

export function [Module]NotificationPanel({ isOpen, onClose }) {
  // ... (voir PaiementsNotificationPanel.tsx comme référence)
}
```

### 4️⃣ Intégrer dans page.tsx

```typescript
// 1. Importer les composants
import { [Module]Modals, [Module]NotificationPanel } from '@/components/features/bmo/[module]';

// 2. Ajouter l'état
const [modal, setModal] = useState<{
  isOpen: boolean;
  type: [Module]ModalType | null;
  data?: any;
}>({ isOpen: false, type: null });

const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);

// 3. Ajouter les raccourcis clavier
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
      e.preventDefault();
      setModal({ isOpen: true, type: 'stats' });
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
      e.preventDefault();
      setModal({ isOpen: true, type: 'export' });
    }
    if (e.key === '?') {
      e.preventDefault();
      setModal({ isOpen: true, type: 'shortcuts' });
    }
    if (e.key === 'Escape') {
      if (modal.isOpen) setModal({ isOpen: false, type: null });
      else if (notificationPanelOpen) setNotificationPanelOpen(false);
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [modal.isOpen, notificationPanelOpen]);

// 4. Ajouter les boutons dans le header
<Button onClick={() => setModal({ isOpen: true, type: 'stats' })} title="Stats (⌘I)">
  <BarChart3 />
</Button>
<Button onClick={() => setModal({ isOpen: true, type: 'export' })} title="Export (⌘E)">
  <Download />
</Button>
<Button onClick={() => setNotificationPanelOpen(true)}>
  <Bell />
</Button>

// 5. Monter les composants
<[Module]Modals modal={modal} onClose={() => setModal({ isOpen: false, type: null })} />
<[Module]NotificationPanel isOpen={notificationPanelOpen} onClose={() => setNotificationPanelOpen(false)} />
```

### 5️⃣ Tester

```bash
# Vérifier qu'il n'y a pas d'erreurs
npm run lint

# Test rapide des raccourcis
# - ⌘I → Modal Stats
# - ⌘E → Modal Export
# - ? → Modal Shortcuts
# - Esc → Fermer
```

---

## 📋 CHECKLIST PAR MODULE

### Avant de commencer
- [ ] Identifier la couleur du module
- [ ] Vérifier la structure de page.tsx existante
- [ ] Lister les modales spécifiques nécessaires

### Pendant l'implémentation
- [ ] Copier et adapter le template
- [ ] Remplacer {{MODULE_NAME}} et {{MODULE_COLOR}}
- [ ] Créer le panneau de notifications
- [ ] Intégrer dans page.tsx
- [ ] Ajouter les raccourcis clavier
- [ ] Ajouter les boutons dans le header

### Après l'implémentation
- [ ] Tester tous les raccourcis clavier
- [ ] Vérifier les animations
- [ ] Run linter (0 erreur)
- [ ] Tester en dev
- [ ] Documentation (optionnel)

---

## 🎯 MODULES PRIORITAIRES - ROADMAP

### Phase 3A - Critique (5 modules - ~15h avec template)

| # | Module | Priorité | Temps estimé | Couleur |
|---|--------|----------|--------------|---------|
| 1 | **Delegations** | 🔴 Haute | 3h | `purple` |
| 2 | **Finances** | 🔴 Haute | 3h | `emerald` |
| 3 | **Projets-en-cours** | 🔴 Haute | 4h | `blue` |
| 4 | **Litiges** | 🔴 Haute | 2.5h | `red` |
| 5 | **Depenses** | 🔴 Haute | 2.5h | `amber` |

### Phase 3B - Important (8 modules - ~12h)

| # | Module | Priorité | Temps estimé | Couleur |
|---|--------|----------|--------------|---------|
| 6 | Recouvrements | 🟡 Moyenne | 1.5h | `orange` |
| 7 | Clients | 🟡 Moyenne | 1.5h | `blue` |
| 8 | Tickets-clients | 🟡 Moyenne | 1.5h | `blue` |
| 9 | Messages-externes | 🟡 Moyenne | 1.5h | `blue` |
| 10 | Conferences | 🟡 Moyenne | 1.5h | `purple` |
| 11 | Evaluations | 🟡 Moyenne | 1.5h | `amber` |
| 12 | Paie-avances | 🟡 Moyenne | 1.5h | `emerald` |
| 13 | Deplacements | 🟡 Moyenne | 1.5h | `blue` |

### Phase 3C - Secondaire (10 modules - ~12h)

| # | Module | Priorité | Temps estimé | Couleur |
|---|--------|----------|--------------|---------|
| 14-23 | Autres modules | 🟢 Basse | 1-1.5h chacun | `blue` |

**TOTAL RESTANT**: ~39h → **~20h avec template** (gain 50%)

---

## 🛠️ COMMANDES UTILES

### Créer un nouveau module rapidement

```bash
# 1. Créer le dossier
mkdir -p src/components/features/bmo/[module]

# 2. Copier le template
cp src/components/shared/GenericModalsTemplate.tsx src/components/features/bmo/[module]/[Module]Modals.tsx

# 3. Copier un panneau de notifications existant
cp src/components/features/bmo/workspace/paiements/PaiementsNotificationPanel.tsx src/components/features/bmo/[module]/[Module]NotificationPanel.tsx

# 4. Adapter avec votre éditeur (Find & Replace)
```

### Vérifier les erreurs

```bash
# TypeScript
npm run type-check

# Linter
npm run lint

# Build
npm run build
```

---

## 💡 TIPS & BEST PRACTICES

### 1. Couleurs cohérentes
- **Finance/Money**: `emerald` ou `green`
- **Urgent/Risque**: `red`
- **Warning**: `amber` ou `orange`
- **Info/Général**: `blue`
- **RH**: `teal` ou `cyan`
- **Analytics**: `purple`

### 2. Animations
- Garder les mêmes classes: `animate-slideInRight`, `animate-spin`
- Durées: 300ms pour panels, 200ms pour boutons
- Toujours utiliser `transition-all` ou `transition-colors`

### 3. Z-index
- **40**: Overlays/backdrops
- **50**: Panels latéraux
- **100**: Modales

### 4. Raccourcis clavier
- Toujours implémenter: ⌘I (stats), ⌘E (export), ? (help), Esc (close)
- Optionnels: ⌘F (filters), ⌘B (sidebar), ⌘N (new)

### 5. États de chargement
- Toujours afficher un spinner pendant les appels API
- Toujours gérer les erreurs avec des messages clairs
- Toujours fermer les modales après succès

---

## 📝 TEMPLATE MINIMAL PAGE.TSX

```typescript
'use client';

import { useState, useEffect } from 'react';
import { [Module]Modals, [Module]NotificationPanel } from '@/components/features/bmo/[module]';
import { Bell, BarChart3, Download } from 'lucide-react';

export default function [Module]Page() {
  // État des modales
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: [Module]ModalType | null;
    data?: any;
  }>({ isOpen: false, type: null });
  
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        setModal({ isOpen: true, type: 'stats' });
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        setModal({ isOpen: true, type: 'export' });
      }
      if (e.key === '?') {
        e.preventDefault();
        setModal({ isOpen: true, type: 'shortcuts' });
      }
      if (e.key === 'Escape') {
        if (modal.isOpen) {
          setModal({ isOpen: false, type: null });
        } else if (notificationPanelOpen) {
          setNotificationPanelOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modal.isOpen, notificationPanelOpen]);

  return (
    <div className="h-screen flex flex-col">
      {/* Header avec boutons */}
      <header className="flex items-center justify-between p-4">
        <h1>[Module]</h1>
        <div className="flex gap-2">
          <button onClick={() => setModal({ isOpen: true, type: 'stats' })}>
            <BarChart3 />
          </button>
          <button onClick={() => setModal({ isOpen: true, type: 'export' })}>
            <Download />
          </button>
          <button onClick={() => setNotificationPanelOpen(true)}>
            <Bell />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        {/* Votre contenu ici */}
      </main>

      {/* Modales */}
      <[Module]Modals
        modal={modal}
        onClose={() => setModal({ isOpen: false, type: null })}
      />

      {/* Notifications */}
      <[Module]NotificationPanel
        isOpen={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
      />
    </div>
  );
}
```

---

## 🎯 PROCHAINE ÉTAPE

**Quel module voulez-vous harmoniser en premier ?**

1. **Delegations** (priorité haute)
2. **Finances** (priorité haute)
3. **Projets-en-cours** (priorité haute)
4. **Autre module** (précisez)

Ou voulez-vous :
- Un exemple complet pour un module spécifique ?
- Un script d'automatisation pour générer les fichiers ?
- Continuer avec tous les modules d'un coup ?

---

**Temps estimé par module avec ce guide**: **~15-30 minutes** ⚡

**Gain de temps grâce au template**: **50%** 🚀

