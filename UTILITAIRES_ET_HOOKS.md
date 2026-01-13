# 🛠️ Utilitaires et Hooks - Version 10.0

## ✅ Utilitaires de Formatage

### formatUtils.ts ✅
**Fichier**: `src/application/utils/formatUtils.ts`

Utilitaires pour formater différents types de données :

- ✅ `formatDate()` - Formatage de dates avec patterns
- ✅ `formatRelativeDate()` - Dates relatives (il y a X jours)
- ✅ `formatNumber()` - Nombres avec séparateurs
- ✅ `formatCurrency()` - Devises (FCFA par défaut)
- ✅ `formatPercent()` - Pourcentages
- ✅ `formatDuration()` - Durées (secondes, minutes, heures, jours)
- ✅ `formatFileSize()` - Tailles de fichiers
- ✅ `formatPhoneNumber()` - Numéros de téléphone
- ✅ `truncateText()` - Troncature de texte
- ✅ `capitalize()` / `capitalizeWords()` - Capitalisation

**Utilisation:**
```tsx
import { formatDate, formatCurrency, formatPercent } from '@/application/utils';

formatDate('2024-01-15', 'dd/MM/yyyy'); // "15/01/2024"
formatCurrency(1500000); // "1 500 000 FCFA"
formatPercent(85.5); // "85.5%"
```

## ✅ Utilitaires de Couleurs

### colorUtils.ts ✅
**Fichier**: `src/application/utils/colorUtils.ts`

Utilitaires pour manipuler les couleurs :

- ✅ `hexToRgb()` - Conversion hex vers RGB
- ✅ `rgbToHex()` - Conversion RGB vers hex
- ✅ `getLuminance()` - Calcul de luminosité
- ✅ `isLightColor()` - Détection couleur claire/sombre
- ✅ `darkenColor()` - Assombrir une couleur
- ✅ `lightenColor()` - Éclaircir une couleur
- ✅ `stringToColor()` - Générer couleur depuis string
- ✅ `getContrastColor()` - Couleur de contraste
- ✅ `getStatusColor()` - Couleurs de statut prédéfinies

**Utilisation:**
```tsx
import { getStatusColor, darkenColor } from '@/application/utils';

const color = getStatusColor('success'); // "#10B981"
const darker = darkenColor('#3B82F6', 0.2); // Version assombrie
```

## ✅ Nouveaux Hooks

### useLocalStorage ✅
**Fichier**: `src/application/hooks/useLocalStorage.ts`

Hook pour gérer localStorage avec synchronisation :

- ✅ Synchronisation entre onglets
- ✅ Validation automatique
- ✅ Gestion d'erreurs
- ✅ API similaire à useState

**Utilisation:**
```tsx
const [value, setValue, removeValue] = useLocalStorage('key', initialValue);
```

### useToggle ✅
**Fichier**: `src/application/hooks/useToggle.ts`

Hook simple pour toggle un booléen :

- ✅ API simple et intuitive
- ✅ Setter optionnel

**Utilisation:**
```tsx
const [isOpen, toggle, setToggle] = useToggle(false);
```

### usePrevious ✅
**Fichier**: `src/application/hooks/usePrevious.ts`

Hook pour obtenir la valeur précédente :

- ✅ Utile pour comparer les changements
- ✅ Performance optimisée

**Utilisation:**
```tsx
const previousValue = usePrevious(currentValue);
```

### useClickOutside ✅
**Fichier**: `src/application/hooks/useClickOutside.ts`

Hook pour détecter les clics en dehors :

- ✅ Support mouse et touch
- ✅ Gestion propre des événements

**Utilisation:**
```tsx
const ref = useRef<HTMLDivElement>(null);
useClickOutside(ref, () => setIsOpen(false));
```

### useMediaQuery ✅
**Fichier**: `src/application/hooks/useMediaQuery.ts`

Hook pour détecter les media queries :

- ✅ `useMediaQuery()` - Media query personnalisée
- ✅ `useIsMobile()` - Détection mobile
- ✅ `useIsTablet()` - Détection tablette
- ✅ `useIsDesktop()` - Détection desktop
- ✅ Synchronisation avec changements de taille

**Utilisation:**
```tsx
const isMobile = useIsMobile();
const isDark = useMediaQuery('(prefers-color-scheme: dark)');
```

## ✅ Système de Notifications

### NotificationSystem ✅
**Fichier**: `src/presentation/components/Notification/NotificationSystem.tsx`

Système de notifications amélioré :

- ✅ 5 types (success, error, warning, info, loading)
- ✅ Animations fluides (Framer Motion)
- ✅ Auto-dismiss configurable
- ✅ Actions personnalisées
- ✅ Position fixe (top-right)
- ✅ Gestion de multiples notifications

**Utilisation:**
```tsx
import { NotificationProvider, useNotification } from '@/presentation/components/Notification';

// Dans le provider
<NotificationProvider>
  <App />
</NotificationProvider>

// Dans un composant
const { showNotification } = useNotification();

showNotification({
  type: 'success',
  title: 'Opération réussie',
  message: 'Les données ont été sauvegardées',
  duration: 5000,
  action: {
    label: 'Voir',
    onClick: () => navigate('/details'),
  },
});
```

## 📊 Résumé des Hooks

| Hook | Description | Fichier |
|------|-------------|---------|
| `useLocalStorage` | Gestion localStorage | `useLocalStorage.ts` |
| `useToggle` | Toggle booléen | `useToggle.ts` |
| `usePrevious` | Valeur précédente | `usePrevious.ts` |
| `useClickOutside` | Détection clic extérieur | `useClickOutside.ts` |
| `useMediaQuery` | Media queries | `useMediaQuery.ts` |
| `useIsMobile` | Détection mobile | `useMediaQuery.ts` |
| `useIsTablet` | Détection tablette | `useMediaQuery.ts` |
| `useIsDesktop` | Détection desktop | `useMediaQuery.ts` |

## 🎯 Bénéfices

1. **Formatage**
   - Formatage cohérent dans toute l'application
   - Support de la locale française
   - Gestion des cas edge

2. **Couleurs**
   - Manipulation facile des couleurs
   - Couleurs de statut standardisées
   - Accessibilité (contraste)

3. **Hooks**
   - Réutilisables et testables
   - Performance optimisée
   - API intuitive

4. **Notifications**
   - Système unifié
   - Animations fluides
   - Expérience utilisateur améliorée

## 📝 Structure

```
src/application/
├── utils/
│   ├── formatUtils.ts    ✅ Formatage
│   ├── colorUtils.ts     ✅ Couleurs
│   └── searchUtils.ts    ✅ Recherche (déjà créé)
└── hooks/
    ├── useLocalStorage.ts    ✅
    ├── useToggle.ts           ✅
    ├── usePrevious.ts         ✅
    ├── useClickOutside.ts     ✅
    └── useMediaQuery.ts       ✅

src/presentation/components/
└── Notification/
    └── NotificationSystem.tsx ✅
```

## ✨ Résultats

**Utilitaires créés :**
- ✅ 10+ fonctions de formatage
- ✅ 10+ fonctions de manipulation de couleurs
- ✅ 5 nouveaux hooks utilitaires
- ✅ Système de notifications complet

**Le module analytics dispose maintenant d'une bibliothèque complète d'utilitaires et de hooks !** 🎉

