# Guide d'utilisation des nouveaux hooks et composants

## 🎯 useHotkeys

```tsx
import { useHotkeys } from '@/hooks/useHotkeys';

function MyComponent() {
  // Utilisation basique
  useHotkeys('ctrl+s', (e) => {
    console.log('Ctrl+S pressed!');
  });

  // Avec options
  useHotkeys('ctrl+k', (e, hotkeyEvent) => {
    console.log('Keys:', hotkeyEvent.keys);
  }, {
    preventDefault: true,
    enabled: true,
    enableOnFormTags: false,
  });

  // Multiples touches
  useHotkeys(['ctrl+a', 'cmd+a'], (e) => {
    console.log('Select all');
  });

  return <div>Press Ctrl+S</div>;
}
```

## 💾 useUserPreferences

```tsx
import { useUserPreferences } from '@/hooks/useUserPreferences';

function MyComponent() {
  const { 
    preferences, 
    setPreferences,
    setAutoRefresh,
    resetPreferences 
  } = useUserPreferences();

  return (
    <div>
      <p>Auto-refresh: {preferences.autoRefresh ? 'ON' : 'OFF'}</p>
      <button onClick={() => setAutoRefresh(!preferences.autoRefresh)}>
        Toggle Auto-refresh
      </button>
      <button onClick={resetPreferences}>
        Reset All
      </button>
    </div>
  );
}
```

## 🔔 useDelegationToast

```tsx
import { useDelegationToast } from '@/hooks/useDelegationToast';

function MyComponent() {
  const toast = useDelegationToast();

  const handleSave = async () => {
    try {
      // ... save logic
      toast.success('Sauvegarde réussie', 'Les données ont été enregistrées');
    } catch (error) {
      toast.error('Erreur de sauvegarde', error.message);
    }
  };

  const handleAction = () => {
    toast.showToast({
      title: 'Action personnalisée',
      description: 'Avec action',
      type: 'info',
      action: {
        label: 'Annuler',
        onClick: () => console.log('Action cancelled'),
      },
      duration: 10000, // 10 secondes
    });
  };

  return (
    <>
      <button onClick={handleSave}>Save</button>
      <button onClick={handleAction}>Custom Action</button>
    </>
  );
}
```

## ♿ useAccessibility

```tsx
import { 
  useAriaAnnounce, 
  useKeyboardNavigation,
  useFocusTrap,
  VisuallyHidden 
} from '@/hooks/useAccessibility';

function MyModal({ isOpen, onClose }) {
  const { announce } = useAriaAnnounce();
  const isKeyboardUser = useKeyboardNavigation();
  
  // Piège de focus pour la modale
  useFocusTrap(isOpen);

  useEffect(() => {
    if (isOpen) {
      announce('Modal ouverte', 'polite');
    }
  }, [isOpen, announce]);

  return (
    <div>
      <h2>Modal Title</h2>
      <VisuallyHidden>
        Additional context for screen readers only
      </VisuallyHidden>
      {isKeyboardUser && (
        <div className="keyboard-hint">
          Press Escape to close
        </div>
      )}
    </div>
  );
}
```

## 🎨 Composants d'accessibilité

### SkipLinks

```tsx
import { SkipLinks } from '@/components/ui/accessibility';

function Layout({ children }) {
  return (
    <>
      <SkipLinks />
      <nav id="navigation">...</nav>
      <main id="main-content">{children}</main>
    </>
  );
}
```

### AriaLiveRegion

```tsx
import { AriaLiveRegion } from '@/components/ui/accessibility';

function MyComponent() {
  const [message, setMessage] = useState('');

  const handleUpdate = () => {
    setMessage('Données mises à jour');
    setTimeout(() => setMessage(''), 5000);
  };

  return (
    <>
      <button onClick={handleUpdate}>Update</button>
      <AriaLiveRegion message={message} politeness="polite" />
    </>
  );
}
```

## 🎬 Exemple complet

```tsx
'use client';

import { useState } from 'react';
import { useHotkeys } from '@/hooks/useHotkeys';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useDelegationToast } from '@/hooks/useDelegationToast';
import { ToastContainer } from '@/hooks/ToastContainer';
import { useAriaAnnounce } from '@/hooks/useAccessibility';
import { SkipLinks, AriaLiveRegion } from '@/components/ui/accessibility';

export default function MyPage() {
  const { preferences, setAutoRefresh } = useUserPreferences();
  const toast = useDelegationToast();
  const { message, politeness, announce } = useAriaAnnounce();
  const [count, setCount] = useState(0);

  // Raccourcis clavier
  useHotkeys('ctrl+i', () => {
    setCount(c => c + 1);
    toast.success('Incrémenté', `Nouveau compte : ${count + 1}`);
    announce(`Compte incrémenté à ${count + 1}`, 'polite');
  });

  useHotkeys('ctrl+r', () => {
    setCount(0);
    toast.info('Réinitialisé', 'Le compte est à zéro');
    announce('Compte réinitialisé', 'polite');
  });

  useHotkeys('ctrl+p', () => {
    setAutoRefresh(!preferences.autoRefresh);
    toast.success(
      'Préférences', 
      `Auto-refresh ${!preferences.autoRefresh ? 'activé' : 'désactivé'}`
    );
  });

  return (
    <>
      <SkipLinks />
      <AriaLiveRegion message={message} politeness={politeness} />
      
      <main id="main-content" className="p-8">
        <h1>Ma page améliorée</h1>
        
        <div className="space-y-4">
          <p>Compte : {count}</p>
          
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setCount(c => c + 1);
                toast.success('Success!');
              }}
            >
              Incrémenter (Ctrl+I)
            </button>
            
            <button 
              onClick={() => {
                setCount(0);
                toast.info('Reset!');
              }}
            >
              Réinitialiser (Ctrl+R)
            </button>
            
            <button onClick={() => setAutoRefresh(!preferences.autoRefresh)}>
              Toggle Auto-refresh (Ctrl+P)
            </button>
          </div>

          <div className="text-sm text-slate-500">
            Auto-refresh: {preferences.autoRefresh ? 'ON' : 'OFF'}
          </div>
        </div>
      </main>

      <ToastContainer />
    </>
  );
}
```

## 📚 Bonnes pratiques

1. **Toasts** : Ne pas abuser, réserver pour les actions importantes
2. **Raccourcis** : Éviter les conflits avec les raccourcis navigateur
3. **Accessibilité** : Toujours tester avec un lecteur d'écran
4. **Préférences** : Ne stocker que ce qui est nécessaire
5. **Annonces ARIA** : Utiliser 'polite' par défaut, 'assertive' pour les urgences

## 🔗 Ressources

- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Keyboard Event Key Values](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values)

