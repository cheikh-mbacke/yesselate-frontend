# 🔧 PATTERN DETAIL MODAL - RÉFÉRENCE TECHNIQUE

**Documentation technique complète pour développeurs**

---

## 📐 ARCHITECTURE

### Composants

```
src/components/ui/detail-modal.tsx
├── DetailModal (Component)
│   ├── Props: DetailModalProps
│   ├── Features:
│   │   ├── Overlay backdrop
│   │   ├── Panel responsive
│   │   ├── Navigation prev/next
│   │   ├── Keyboard shortcuts
│   │   └── Body scroll lock
│   └── Exports: DetailModal
│
└── useDetailNavigation (Hook)
    ├── Params: <T>(items: T[], selectedItem: T | null)
    ├── Returns:
    │   ├── canNavigatePrev: boolean
    │   ├── canNavigateNext: boolean
    │   ├── navigatePrev: () => T | null
    │   ├── navigateNext: () => T | null
    │   ├── currentIndex: number
    │   └── totalItems: number
    └── Exports: useDetailNavigation
```

---

## 📝 TYPE DEFINITIONS

### DetailModalProps

```typescript
export interface DetailModalProps {
  // Required
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  
  // Optional - Display
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: string;              // Default: 'blue'
  size?: 'md' | 'lg' | 'xl' | 'full'; // Default: 'xl'
  position?: 'center' | 'right';     // Default: 'right'
  
  // Optional - Navigation
  canNavigatePrev?: boolean;         // Default: false
  canNavigateNext?: boolean;         // Default: false
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  
  // Optional - Footer
  footer?: React.ReactNode;
}
```

### useDetailNavigation Return Type

```typescript
interface DetailNavigationReturn<T> {
  canNavigatePrev: boolean;
  canNavigateNext: boolean;
  navigatePrev: () => T | null;
  navigateNext: () => T | null;
  currentIndex: number;
  totalItems: number;
}
```

---

## 🎨 STYLING

### Tailwind Classes Utilisées

```typescript
// Overlay
'fixed inset-0 z-[9999] flex'
'bg-black/60 backdrop-blur-sm'

// Panel
'relative bg-slate-900 shadow-2xl border border-slate-700'

// Sizes
{
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-full',
}

// Positions
{
  center: 'items-center justify-center',
  right: 'items-stretch justify-end',
}

// Position-specific panel
position === 'right'
  ? 'h-full w-full md:w-[600px] lg:w-[800px] rounded-l-xl'
  : `${sizeClasses[size]} rounded-xl m-4 max-h-[90vh]`

// Accent colors (utilisés avec cn())
`bg-${accentColor}-500/10 border-${accentColor}-500/20`
```

---

## ⚙️ FEATURES TECHNIQUES

### 1. Keyboard Shortcuts

```typescript
useEffect(() => {
  if (!isOpen) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    // Échap pour fermer
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }

    // Flèche gauche pour précédent
    if (e.key === 'ArrowLeft' && canNavigatePrev && onNavigatePrev) {
      e.preventDefault();
      onNavigatePrev();
    }

    // Flèche droite pour suivant
    if (e.key === 'ArrowRight' && canNavigateNext && onNavigateNext) {
      e.preventDefault();
      onNavigateNext();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isOpen, canNavigatePrev, canNavigateNext, onNavigatePrev, onNavigateNext, onClose]);
```

**Shortcuts** :
- `Échap` → Fermer modal
- `←` → Item précédent (si disponible)
- `→` → Item suivant (si disponible)

### 2. Body Scroll Lock

```typescript
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
  return () => {
    document.body.style.overflow = '';
  };
}, [isOpen]);
```

**Comportement** :
- Modal ouverte → Scroll body désactivé
- Modal fermée → Scroll body restauré
- Cleanup automatique au unmount

### 3. Navigation Logic

```typescript
export function useDetailNavigation<T>(items: T[], selectedItem: T | null) {
  const currentIndex = selectedItem ? items.indexOf(selectedItem) : -1;
  
  const canNavigatePrev = currentIndex > 0;
  const canNavigateNext = currentIndex >= 0 && currentIndex < items.length - 1;
  
  const navigatePrev = () => {
    if (canNavigatePrev) return items[currentIndex - 1];
    return null;
  };
  
  const navigateNext = () => {
    if (canNavigateNext) return items[currentIndex + 1];
    return null;
  };
  
  return {
    canNavigatePrev,
    canNavigateNext,
    navigatePrev,
    navigateNext,
    currentIndex,
    totalItems: items.length,
  };
}
```

**Generic Type** : `<T>` permet de typer n'importe quel type d'item

**Edge Cases** :
- `selectedItem = null` → `currentIndex = -1`, navigation disabled
- `currentIndex = 0` → `canNavigatePrev = false`
- `currentIndex = items.length - 1` → `canNavigateNext = false`

---

## 🚀 USAGE PATTERNS

### Pattern 1: Basic Modal

```typescript
function MyPage() {
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  return (
    <>
      <button onClick={() => {
        setSelectedItem(item);
        setDetailOpen(true);
      }}>
        Open
      </button>

      <DetailModal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selectedItem?.name || ''}
      >
        <div className="p-6">Content</div>
      </DetailModal>
    </>
  );
}
```

### Pattern 2: With Navigation

```typescript
function MyPage() {
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  const {
    canNavigatePrev,
    canNavigateNext,
    navigatePrev,
    navigateNext,
  } = useDetailNavigation(items, selectedItem);

  const handleNavigatePrev = () => {
    const prev = navigatePrev();
    if (prev) setSelectedItem(prev);
  };

  const handleNavigateNext = () => {
    const next = navigateNext();
    if (next) setSelectedItem(next);
  };

  return (
    <>
      <DetailModal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selectedItem?.name || ''}
        canNavigatePrev={canNavigatePrev}
        canNavigateNext={canNavigateNext}
        onNavigatePrev={handleNavigatePrev}
        onNavigateNext={handleNavigateNext}
      >
        <div className="p-6">Content</div>
      </DetailModal>
    </>
  );
}
```

### Pattern 3: With Tabs

```typescript
function MyDetailModal({ item, ... }: Props) {
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');

  return (
    <DetailModal {...props}>
      {/* Tabs Header */}
      <div className="border-b border-slate-700 px-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('details')}
            className={cn(
              'py-3 border-b-2',
              activeTab === 'details'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-slate-400'
            )}
          >
            Détails
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              'py-3 border-b-2',
              activeTab === 'history'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-slate-400'
            )}
          >
            Historique
          </button>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="p-6">
        {activeTab === 'details' && <DetailsTab item={item} />}
        {activeTab === 'history' && <HistoryTab item={item} />}
      </div>
    </DetailModal>
  );
}
```

### Pattern 4: With Footer Actions

```typescript
<DetailModal
  {...props}
  footer={
    <div className="flex items-center justify-between w-full">
      {/* Left: Status */}
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400">
          ✓ Active
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleEdit(item)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(item)}
          className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  }
>
  <div className="p-6">Content</div>
</DetailModal>
```

---

## ⚡ PERFORMANCE

### Bundle Impact

```
Composant:        ~12 KB (minified)
Dependencies:     React, lucide-react, cn utility
Tree-shaking:     ✅ Supporté
Code-splitting:   ✅ Possible (dynamic import)
```

### Render Optimization

```typescript
// 1. Éviter le re-render si modal fermée
if (!isOpen) return null;

// 2. Memoize children si stable
const content = useMemo(
  () => <ExpensiveContent item={selectedItem} />,
  [selectedItem]
);

// 3. Use React.memo pour tab contents
const DetailsTab = React.memo(({ item }) => {
  return <div>{/* ... */}</div>;
});
```

### Best Practices

```typescript
// ✅ DO: Lazy load modal content
const HeavyChart = lazy(() => import('./HeavyChart'));

<DetailModal isOpen={detailOpen}>
  <Suspense fallback={<Spinner />}>
    <HeavyChart data={data} />
  </Suspense>
</DetailModal>

// ✅ DO: Cleanup effects
useEffect(() => {
  const interval = setInterval(...);
  return () => clearInterval(interval);
}, []);

// ❌ DON'T: Render modal if never opened
{hasBeenOpened && <DetailModal ... />}  // Better

// ❌ DON'T: Load all items data upfront
// Load detail data only when modal opens
```

---

## 🧪 TESTING

### Unit Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { DetailModal } from '@/components/ui/detail-modal';

describe('DetailModal', () => {
  it('should render when isOpen is true', () => {
    render(
      <DetailModal isOpen={true} onClose={jest.fn()} title="Test">
        <div>Content</div>
      </DetailModal>
    );
    
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <DetailModal isOpen={false} onClose={jest.fn()} title="Test">
        <div>Content</div>
      </DetailModal>
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('should call onClose when Escape is pressed', () => {
    const onClose = jest.fn();
    render(
      <DetailModal isOpen={true} onClose={onClose} title="Test">
        <div>Content</div>
      </DetailModal>
    );
    
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when overlay is clicked', () => {
    const onClose = jest.fn();
    const { container } = render(
      <DetailModal isOpen={true} onClose={onClose} title="Test">
        <div>Content</div>
      </DetailModal>
    );
    
    const overlay = container.querySelector('.absolute.inset-0');
    fireEvent.click(overlay!);
    expect(onClose).toHaveBeenCalled();
  });
});
```

### Hook Tests

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useDetailNavigation } from '@/components/ui/detail-modal';

describe('useDetailNavigation', () => {
  const items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ];

  it('should return correct navigation state for middle item', () => {
    const { result } = renderHook(() =>
      useDetailNavigation(items, items[1])
    );
    
    expect(result.current.canNavigatePrev).toBe(true);
    expect(result.current.canNavigateNext).toBe(true);
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.totalItems).toBe(3);
  });

  it('should return correct navigation state for first item', () => {
    const { result } = renderHook(() =>
      useDetailNavigation(items, items[0])
    );
    
    expect(result.current.canNavigatePrev).toBe(false);
    expect(result.current.canNavigateNext).toBe(true);
  });

  it('should navigate to previous item', () => {
    const { result } = renderHook(() =>
      useDetailNavigation(items, items[1])
    );
    
    const prev = result.current.navigatePrev();
    expect(prev).toEqual(items[0]);
  });
});
```

---

## 🔒 ACCESSIBILITY

### ARIA Attributes

```typescript
// Modal container
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  {/* Header */}
  <h2 id="modal-title">{title}</h2>
  {subtitle && <p id="modal-description">{subtitle}</p>}
  
  {/* Close button */}
  <button
    aria-label="Fermer la modal"
    onClick={onClose}
  >
    <X />
  </button>
  
  {/* Navigation */}
  <button
    aria-label="Item précédent"
    disabled={!canNavigatePrev}
    onClick={onNavigatePrev}
  >
    <ChevronLeft />
  </button>
</div>
```

### Focus Management

```typescript
// TODO: Implémenter focus trap
useEffect(() => {
  if (isOpen) {
    // Focus premier élément focusable
    const firstFocusable = modalRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    (firstFocusable as HTMLElement)?.focus();
  }
}, [isOpen]);
```

### Screen Reader Support

```typescript
// Annoncer les changements de navigation
<div
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {`Item ${currentIndex + 1} sur ${totalItems}`}
</div>
```

---

## 🐛 TROUBLESHOOTING

### Issue: Modal ne se ferme pas

**Cause** : `onClose` non défini ou ne met pas à jour `isOpen`

**Solution** :
```typescript
// ❌ BAD
<DetailModal isOpen={detailOpen} onClose={() => {}} />

// ✅ GOOD
<DetailModal
  isOpen={detailOpen}
  onClose={() => setDetailOpen(false)}
/>
```

### Issue: Navigation ne fonctionne pas

**Cause** : `selectedItem` non mis à jour dans `onNavigatePrev/Next`

**Solution** :
```typescript
// ❌ BAD
const handleNavigatePrev = () => {
  navigatePrev();  // Retourne l'item mais ne l'assigne pas
};

// ✅ GOOD
const handleNavigatePrev = () => {
  const prev = navigatePrev();
  if (prev) setSelectedItem(prev);
};
```

### Issue: Scroll ne fonctionne pas

**Cause** : Contenu pas dans un conteneur scrollable

**Solution** :
```typescript
// ❌ BAD
<DetailModal>
  <div>Beaucoup de contenu...</div>
</DetailModal>

// ✅ GOOD
<DetailModal>
  <div className="overflow-y-auto">
    <div className="p-6">Beaucoup de contenu...</div>
  </div>
</DetailModal>
```

### Issue: Z-index conflicts

**Cause** : Autres éléments avec z-index élevé

**Solution** :
```typescript
// Modal utilise z-[9999]
// Assurez-vous qu'aucun autre élément n'a un z-index > 9999

// Si nécessaire, ajuster dans detail-modal.tsx:
'fixed inset-0 z-[99999]'  // Augmenter si conflit
```

---

## 📦 DEPENDENCIES

```json
{
  "react": "^18.x",
  "lucide-react": "^0.x",
  "tailwindcss": "^3.x",
  "clsx": "^2.x",
  "tailwind-merge": "^2.x"
}
```

### Utility: cn()

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Emplacement** : `src/lib/utils.ts` ou `lib/utils.ts`

---

## 🔄 VERSIONS

### v1.0.0 (10 Jan 2026)
- ✅ Initial release
- ✅ DetailModal component
- ✅ useDetailNavigation hook
- ✅ Keyboard shortcuts
- ✅ Body scroll lock
- ✅ TypeScript support

### Roadmap v1.1.0
- ⏸️ Focus trap
- ⏸️ ARIA improvements
- ⏸️ Animation options
- ⏸️ Mobile gestures (swipe)
- ⏸️ Deep linking support

---

## 📄 LICENSE

Propriétaire Yesselate  
© 2026 Tous droits réservés

---

**Créé** : 10 Janvier 2026  
**Version** : 1.0.0  
**Status** : ✅ Production Ready  
**Mainteneur** : Équipe Frontend Yesselate

