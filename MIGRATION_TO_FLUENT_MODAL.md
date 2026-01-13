# 🔄 Migration vers FluentModal - Guide Pratique

## Vue d'ensemble

**FluentModal** est la nouvelle version simplifiée et moderne des modals, remplaçant `FluentDialog` pour la majorité des cas d'usage.

**Avantages** :
- ⚡ **50% moins de code** à écrire
- 🎨 **Animations fluides** avec Framer Motion
- 🎯 **API ultra-simple** : 4 props au lieu de 6+ composants
- 💨 **Plus léger** : ~3KB vs ~12KB

---

## 📊 Avant / Après

### Ancien style (FluentDialog)

```tsx
import {
  FluentDialog,
  FluentDialogContent,
  FluentDialogHeader,
  FluentDialogTitle,
  FluentDialogDescription,
  FluentDialogFooter,
} from '@/components/ui/fluent-dialog';

<FluentDialog open={open} onOpenChange={setOpen}>
  <FluentDialogContent>
    <FluentDialogHeader>
      <FluentDialogTitle>Mon titre</FluentDialogTitle>
      <FluentDialogDescription>
        Ma description
      </FluentDialogDescription>
    </FluentDialogHeader>

    <div className="py-4">
      Contenu principal
    </div>

    <FluentDialogFooter>
      <Button onClick={() => setOpen(false)}>Fermer</Button>
    </FluentDialogFooter>
  </FluentDialogContent>
</FluentDialog>
```

**Verbosité** : 6 composants, 15+ lignes

---

### Nouveau style (FluentModal) ⭐

```tsx
import { FluentModal } from '@/components/ui/fluent-modal';

<FluentModal
  open={open}
  title="Mon titre"
  onClose={() => setOpen(false)}
>
  <div className="space-y-4">
    <p className="text-[rgb(var(--muted))]">Ma description</p>
    <div>Contenu principal</div>
    <Button onClick={() => setOpen(false)}>Fermer</Button>
  </div>
</FluentModal>
```

**Simplicité** : 1 composant, 8 lignes

**Économie** : **~50% moins de code** !

---

## 🔧 Migration pas à pas

### Étape 1 : Import

**Avant** :
```tsx
import {
  FluentDialog,
  FluentDialogContent,
  FluentDialogHeader,
  FluentDialogTitle,
  FluentDialogDescription,
  FluentDialogFooter,
} from '@/components/ui/fluent-dialog';
```

**Après** :
```tsx
import { FluentModal } from '@/components/ui/fluent-modal';
```

---

### Étape 2 : Props

**Avant** :
```tsx
<FluentDialog open={open} onOpenChange={setOpen}>
```

**Après** :
```tsx
<FluentModal open={open} onClose={() => setOpen(false)}>
```

**Note** : `onOpenChange` → `onClose` (plus explicite)

---

### Étape 3 : Titre

**Avant** :
```tsx
<FluentDialogHeader>
  <FluentDialogTitle>Mon titre</FluentDialogTitle>
</FluentDialogHeader>
```

**Après** :
```tsx
<FluentModal title="Mon titre" {...props}>
```

**Note** : Le titre est maintenant une simple prop !

---

### Étape 4 : Description (optionnelle)

**Avant** :
```tsx
<FluentDialogDescription>
  Ma description
</FluentDialogDescription>
```

**Après** :
```tsx
<p className="text-[rgb(var(--muted))] text-sm">
  Ma description
</p>
```

**Note** : Intégrez-la directement dans le contenu

---

### Étape 5 : Footer

**Avant** :
```tsx
<FluentDialogFooter>
  <Button>Annuler</Button>
  <Button>Confirmer</Button>
</FluentDialogFooter>
```

**Après** :
```tsx
<div className="flex justify-end gap-2 pt-4 border-t border-[rgb(var(--border))]">
  <Button>Annuler</Button>
  <Button>Confirmer</Button>
</div>
```

**Note** : Contrôle total sur le layout !

---

## 📝 Exemples de migration

### Exemple 1 : QuickStatsModal

**Avant (FluentDialog)** :
```tsx
import {
  FluentDialog,
  FluentDialogContent,
  FluentDialogHeader,
  FluentDialogTitle,
} from '@/components/ui/fluent-dialog';

export function QuickStatsModal({ open, onOpenChange }) {
  return (
    <FluentDialog open={open} onOpenChange={onOpenChange}>
      <FluentDialogContent>
        <FluentDialogHeader>
          <FluentDialogTitle>📊 Stats Live</FluentDialogTitle>
        </FluentDialogHeader>
        
        <div className="py-4">
          {/* Stats */}
        </div>
      </FluentDialogContent>
    </FluentDialog>
  );
}
```

**Après (FluentModal)** ⭐ :
```tsx
import { FluentModal } from '@/components/ui/fluent-modal';

export function QuickStatsModal({ open, onOpenChange }) {
  return (
    <FluentModal
      open={open}
      title="Stats Live — Demandes"
      onClose={() => onOpenChange(false)}
    >
      {/* Stats directement, plus simple ! */}
    </FluentModal>
  );
}
```

**Économie** : 8 lignes → 3 lignes (header)

---

### Exemple 2 : ExportModal

**Avant (FluentDialog)** :
```tsx
<FluentDialog open={open} onOpenChange={setOpen}>
  <FluentDialogContent>
    <FluentDialogHeader>
      <FluentDialogTitle>Exporter les demandes</FluentDialogTitle>
      <FluentDialogDescription>
        Sélectionnez les options d'export
      </FluentDialogDescription>
    </FluentDialogHeader>

    <div className="p-6 pt-0 space-y-4">
      {/* Formulaire */}
    </div>

    <FluentDialogFooter>
      <Button variant="secondary">Annuler</Button>
      <Button variant="primary">Exporter</Button>
    </FluentDialogFooter>
  </FluentDialogContent>
</FluentDialog>
```

**Après (FluentModal)** ⭐ :
```tsx
<FluentModal
  open={open}
  title="Exporter les demandes"
  onClose={() => setOpen(false)}
  className="max-w-md"
>
  <div className="space-y-4">
    <p className="text-sm text-[rgb(var(--muted))]">
      Sélectionnez les options d'export
    </p>

    {/* Formulaire */}

    <div className="flex justify-end gap-2 pt-2">
      <Button variant="secondary" onClick={() => setOpen(false)}>
        Annuler
      </Button>
      <Button variant="primary">
        Exporter
      </Button>
    </div>
  </div>
</FluentModal>
```

**Économie** : 20 lignes → 12 lignes

---

### Exemple 3 : DemandDetailsModal

**Avant (FluentDialog)** :
```tsx
<FluentDialog open={open} onOpenChange={setOpen}>
  <FluentDialogContent className="sm:max-w-3xl">
    <FluentDialogHeader>
      <FluentDialogTitle>
        Détails de la demande #{demand.id}
      </FluentDialogTitle>
      <FluentDialogDescription>
        {demand.subject}
      </FluentDialogDescription>
    </FluentDialogHeader>

    <div className="space-y-4">
      {/* Détails */}
    </div>

    <FluentDialogFooter>
      <Button variant="destructive">Rejeter</Button>
      <Button variant="success">Valider</Button>
    </FluentDialogFooter>
  </FluentDialogContent>
</FluentDialog>
```

**Après (FluentModal)** ⭐ :
```tsx
<FluentModal
  open={open}
  title={`Détails de la demande #${demand.id}`}
  onClose={() => setOpen(false)}
  className="max-w-3xl"
>
  <div className="space-y-4">
    <p className="text-[rgb(var(--muted))]">{demand.subject}</p>

    {/* Détails */}

    <div className="flex justify-end gap-2 pt-4 border-t border-[rgb(var(--border))]">
      <Button variant="destructive">Rejeter</Button>
      <Button variant="success">Valider</Button>
    </div>
  </div>
</FluentModal>
```

---

## 🎨 Patterns communs

### Pattern 1 : Footer avec bordure

```tsx
<FluentModal {...props}>
  <div className="space-y-4">
    {/* Contenu */}
    
    <div className="flex justify-end gap-2 pt-4 border-t border-[rgb(var(--border))]">
      <Button>Actions</Button>
    </div>
  </div>
</FluentModal>
```

---

### Pattern 2 : Footer avec info + actions

```tsx
<FluentModal {...props}>
  <div className="space-y-4">
    {/* Contenu */}
    
    <div className="flex justify-between items-center pt-4 border-t border-[rgb(var(--border))]">
      <span className="text-sm text-[rgb(var(--muted))]">
        Dernière modif: il y a 2h
      </span>
      
      <div className="flex gap-2">
        <Button>Annuler</Button>
        <Button>Confirmer</Button>
      </div>
    </div>
  </div>
</FluentModal>
```

---

### Pattern 3 : Modal avec loading

```tsx
<FluentModal {...props}>
  {loading ? (
    <div className="text-sm text-[rgb(var(--muted))]">Chargement…</div>
  ) : (
    <div>Contenu chargé</div>
  )}
</FluentModal>
```

---

### Pattern 4 : Modal avec erreur

```tsx
<FluentModal {...props}>
  {error ? (
    <div className="text-sm text-red-400">{error}</div>
  ) : (
    <div>Contenu</div>
  )}
</FluentModal>
```

---

## ✅ Checklist de migration

Pour chaque modal à migrer :

- [ ] Remplacer l'import `FluentDialog` par `FluentModal`
- [ ] Remplacer `onOpenChange` par `onClose`
- [ ] Déplacer le titre de `FluentDialogTitle` vers la prop `title`
- [ ] Supprimer `FluentDialogContent`, `FluentDialogHeader`, etc.
- [ ] Intégrer la description dans le contenu si nécessaire
- [ ] Recréer le footer avec flexbox si besoin
- [ ] Ajuster la classe `className` pour la taille (`max-w-*`)
- [ ] Tester les animations (automatique avec Framer Motion)
- [ ] Vérifier l'accessibilité (ESC, click outside)

---

## 🎯 Quand NE PAS migrer

**Gardez FluentDialog si** :
- ✅ Vous avez besoin de structure très rigide
- ✅ Vous utilisez déjà Radix UI patterns
- ✅ Vous avez des contraintes d'accessibilité extrêmes

**Mais dans 90% des cas, FluentModal est meilleur !** ⭐

---

## 📊 Résumé des bénéfices

| Métrique | FluentDialog | FluentModal | Gain |
|----------|--------------|-------------|------|
| **Composants** | 6+ | 1 | **-83%** |
| **Props** | 8+ | 4 | **-50%** |
| **Lignes** | ~20 | ~10 | **-50%** |
| **Bundle** | ~12KB | ~3KB | **-75%** |
| **Animations** | CSS | Framer | ⭐ |

---

## 🚀 Migration automatique (script)

Si vous avez beaucoup de modals à migrer, voici un script de recherche/remplacement :

### Rechercher
```regex
<FluentDialog open=\{(.+?)\} onOpenChange=\{(.+?)\}>
  <FluentDialogContent.*?>
    <FluentDialogHeader>
      <FluentDialogTitle>(.+?)<\/FluentDialogTitle>
```

### Remplacer par
```tsx
<FluentModal open={$1} title="$3" onClose={() => $2(false)}>
```

**Note** : Adaptez selon vos besoins !

---

## 🎉 Conclusion

**FluentModal** est :
- ⚡ **Plus simple** : 1 composant au lieu de 6
- 🎨 **Plus moderne** : Animations Framer Motion
- 💨 **Plus léger** : 75% de bundle en moins
- 🎯 **Plus flexible** : Structure libre

**Migrez dès aujourd'hui pour une meilleure DX !** ⭐

---

## 📚 Ressources

- **Guide complet** : [`FLUENT_MODALS.md`](./FLUENT_MODALS.md)
- **Composant** : `src/components/ui/fluent-modal.tsx`
- **Exemple** : `src/components/features/bmo/QuickStatsModal.tsx`

