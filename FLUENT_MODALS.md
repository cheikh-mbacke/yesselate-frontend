# 🎭 Modals Fluent - Guide Complet

## Vue d'ensemble

**2 composants de modal** disponibles avec des cas d'usage différents :

1. **`FluentModal`** ⭐ - Simple, moderne, animations Framer Motion
2. **`FluentDialog`** - Complet, structure Radix UI, accessible

---

## 🎯 Quand utiliser quoi ?

### FluentModal ⭐ (Recommandé)

**Utilisez pour** :
- ✅ Modals simples et rapides
- ✅ Animations fluides importantes
- ✅ Design moderne et épuré
- ✅ Contrôle total sur le contenu

**Avantages** :
- ⚡ **Léger** : API minimaliste
- 🎨 **Moderne** : Design Fluent authentique
- 🔄 **Animations** : Framer Motion intégré
- 🎯 **Flexible** : Pas de contraintes de structure

**Inconvénients** :
- ❌ Moins de fonctionnalités natives
- ❌ Structure de footer à gérer manuellement

---

### FluentDialog

**Utilisez pour** :
- ✅ Dialogs complexes avec footer
- ✅ Accessibilité maximale (Radix UI)
- ✅ Structure standardisée (Header, Content, Footer)
- ✅ Compatibilité avec ShadCN patterns

**Avantages** :
- ♿ **Accessible** : Radix UI sous le capot
- 📦 **Structure** : Header, Content, Footer prédéfinis
- 🎯 **Standards** : Suit les patterns ShadCN

**Inconvénients** :
- ⚠️ Plus verbeux (plus de composants)
- ⚠️ Moins flexible visuellement

---

## 💡 Exemples d'utilisation

### FluentModal - Exemple de base ⭐

```tsx
'use client';

import { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton as Button } from '@/components/ui/fluent-button';

export function SimpleModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Ouvrir le modal
      </Button>

      <FluentModal
        open={open}
        title="Titre du Modal"
        onClose={() => setOpen(false)}
      >
        <div className="space-y-4">
          <p className="text-[rgb(var(--muted))]">
            Votre contenu ici...
          </p>
          
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Confirmer
            </Button>
          </div>
        </div>
      </FluentModal>
    </>
  );
}
```

---

### FluentModal - Exemple avec formulaire

```tsx
'use client';

import { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton as Button } from '@/components/ui/fluent-button';
import { Label } from '@/components/ui/label';
import { FluentInput } from '@/components/ui/fluent-input';

export function FormModalExample() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    
    // Appel API...
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLoading(false);
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Créer une demande
      </Button>

      <FluentModal
        open={open}
        title="Nouvelle demande"
        onClose={() => setOpen(false)}
        className="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la demande</Label>
            <FluentInput
              id="name"
              name="name"
              placeholder="Ex: Acquisition équipement"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bureau">Bureau</Label>
            <select
              id="bureau"
              name="bureau"
              className="w-full px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface))]"
              required
            >
              <option value="">Sélectionner...</option>
              <option value="ADM">Administration</option>
              <option value="FIN">Finance</option>
              <option value="RH">Ressources Humaines</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </form>
      </FluentModal>
    </>
  );
}
```

---

### FluentModal - Exemple de confirmation

```tsx
'use client';

import { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton as Button } from '@/components/ui/fluent-button';
import { AlertTriangle } from 'lucide-react';

export function ConfirmModalExample() {
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    // Action de suppression...
    console.log('Supprimé !');
    setOpen(false);
  };

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Supprimer
      </Button>

      <FluentModal
        open={open}
        title="Confirmer la suppression"
        onClose={() => setOpen(false)}
        className="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-[rgb(var(--text))] font-medium mb-1">
                Êtes-vous sûr ?
              </p>
              <p className="text-sm text-[rgb(var(--muted))]">
                Cette action est irréversible. La demande sera définitivement supprimée.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer définitivement
            </Button>
          </div>
        </div>
      </FluentModal>
    </>
  );
}
```

---

### FluentModal - Exemple avec tabs internes

```tsx
'use client';

import { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton as Button } from '@/components/ui/fluent-button';
import { FluentTabs } from '@/components/ui/fluent-tabs';

export function TabsModalExample() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Voir les détails
      </Button>

      <FluentModal
        open={open}
        title="Détails de la demande"
        onClose={() => setOpen(false)}
        className="max-w-3xl"
      >
        <FluentTabs
          tabs={[
            { id: 'details', label: 'Détails' },
            { id: 'history', label: 'Historique' },
            { id: 'comments', label: 'Commentaires' }
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="mt-4">
          {activeTab === 'details' && (
            <div>Contenu des détails...</div>
          )}
          {activeTab === 'history' && (
            <div>Historique des modifications...</div>
          )}
          {activeTab === 'comments' && (
            <div>Commentaires...</div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[rgb(var(--border))]">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Fermer
          </Button>
        </div>
      </FluentModal>
    </>
  );
}
```

---

### FluentDialog - Exemple (pour comparaison)

```tsx
'use client';

import { useState } from 'react';
import {
  FluentDialog,
  FluentDialogContent,
  FluentDialogHeader,
  FluentDialogTitle,
  FluentDialogDescription,
  FluentDialogFooter,
} from '@/components/ui/fluent-dialog';
import { FluentButton as Button } from '@/components/ui/fluent-button';

export function DialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Ouvrir le dialog
      </Button>

      <FluentDialog open={open} onOpenChange={setOpen}>
        <FluentDialogContent>
          <FluentDialogHeader>
            <FluentDialogTitle>Titre du Dialog</FluentDialogTitle>
            <FluentDialogDescription>
              Description optionnelle...
            </FluentDialogDescription>
          </FluentDialogHeader>

          <div className="py-4">
            Votre contenu ici...
          </div>

          <FluentDialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Confirmer
            </Button>
          </FluentDialogFooter>
        </FluentDialogContent>
      </FluentDialog>
    </>
  );
}
```

---

## 🎨 Personnalisation

### Tailles personnalisées

```tsx
// Petit modal
<FluentModal className="max-w-sm" {...props} />

// Moyen (défaut)
<FluentModal className="max-w-2xl" {...props} />

// Grand
<FluentModal className="max-w-4xl" {...props} />

// Très grand
<FluentModal className="max-w-6xl" {...props} />

// Pleine largeur (avec padding)
<FluentModal className="max-w-[95vw]" {...props} />
```

---

### Styles personnalisés

```tsx
<FluentModal
  className={cn(
    "max-w-md",
    "bg-gradient-to-br from-blue-500/10 to-purple-500/10"
  )}
  {...props}
>
  {/* Contenu avec gradient de fond */}
</FluentModal>
```

---

### Footer personnalisé

```tsx
<FluentModal {...props}>
  <div className="space-y-4">
    {/* Contenu principal */}
    <div>...</div>

    {/* Footer personnalisé avec bordure supérieure */}
    <div className="flex justify-between items-center pt-4 border-t border-[rgb(var(--border))]">
      <span className="text-sm text-[rgb(var(--muted))]">
        Dernière modification: il y a 2h
      </span>
      
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onClose}>
          Annuler
        </Button>
        <Button variant="primary" onClick={onSave}>
          Enregistrer
        </Button>
      </div>
    </div>
  </div>
</FluentModal>
```

---

## 🎭 Animations personnalisées

Le composant utilise Framer Motion. Vous pouvez créer des variantes :

```tsx
import { motion, AnimatePresence } from 'framer-motion';

// Variante "slide from right"
<AnimatePresence>
  {open && (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="h-full w-96 bg-[rgb(var(--surface))] shadow-xl"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
      >
        {/* Contenu du drawer */}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

---

## 📊 Comparaison finale

| Feature | FluentModal ⭐ | FluentDialog |
|---------|---------------|--------------|
| **API** | Simple | Composable |
| **Animations** | Framer Motion | CSS |
| **Accessibilité** | Basique | Radix UI (A11y++) |
| **Taille bundle** | ~3KB | ~12KB |
| **Flexibilité** | Très haute | Moyenne |
| **Structure** | Libre | Header/Content/Footer |
| **Recommandé pour** | Modals simples/modernes | Dialogs accessibles |

---

## 🎯 Recommandation

**Utilisez `FluentModal` ⭐** pour :
- La majorité des cas d'usage
- Design moderne et fluide
- Performance optimale
- Flexibilité maximale

**Utilisez `FluentDialog`** pour :
- Accessibilité maximale requise
- Conformité stricte aux standards
- Structure standardisée obligatoire

---

## 🎨 Exemples réels dans le projet

### QuickStatsModal (peut migrer vers FluentModal)

```tsx
// Avant (FluentDialog)
<FluentDialog open={open} onOpenChange={setOpen}>
  <FluentDialogContent>
    <FluentDialogHeader>
      <FluentDialogTitle>Statistiques</FluentDialogTitle>
    </FluentDialogHeader>
    {/* ... */}
  </FluentDialogContent>
</FluentDialog>

// Après (FluentModal) ⭐
<FluentModal
  open={open}
  title="📊 Statistiques en temps réel"
  onClose={() => setOpen(false)}
  className="max-w-2xl"
>
  {/* Contenu direct, plus simple */}
</FluentModal>
```

---

## 🎉 Résumé

**2 composants disponibles** :
- ⭐ **`FluentModal`** - Simple, moderne, recommandé
- **`FluentDialog`** - Accessible, structure Radix UI

**Choisissez selon vos besoins** :
- Performance + Design = `FluentModal`
- Accessibilité max = `FluentDialog`

**Dans 90% des cas, utilisez `FluentModal` !** ⭐

