# 📖 Guide d'Utilisation - Version 10.0

## 🚀 Démarrage Rapide

### Installation des dépendances

```bash
npm install
```

### Structure du projet

Le module analytics suit une architecture en couches :

```
src/
├── domain/analytics/          # Logique métier
├── infrastructure/api/         # Accès aux données
├── application/               # Hooks et utilitaires
└── presentation/              # Composants UI
```

## 🎣 Utilisation des Hooks

### useTrendAnalysis

Analyse les tendances de données :

```tsx
import { useTrendAnalysis } from '@/application/hooks';

const { analysis, isLoading } = useTrendAnalysis(periodData);
// analysis contient : trends, recommendations, statistics
```

### useDebounce / useThrottle

Optimise les performances :

```tsx
import { useDebounce, useThrottle } from '@/application/hooks';

const debouncedValue = useDebounce(value, 300);
const throttledValue = useThrottle(value, 1000);
```

### usePagination

Gère la pagination :

```tsx
import { usePagination } from '@/application/hooks';

const {
  currentPage,
  totalPages,
  goToPage,
  nextPage,
  previousPage,
} = usePagination({
  totalItems: 100,
  itemsPerPage: 10,
});
```

## 🧩 Utilisation des Composants

### Charts

```tsx
import { ChartWrapper, ChartTooltip } from '@/presentation/components/Charts';

<ChartWrapper
  title="Évolution des KPIs"
  isLoading={isLoading}
  height={400}
>
  <BarChart data={data}>
    <Tooltip content={<ChartTooltip formatter={tooltipFormatters.currency} />} />
    <Bar dataKey="value" />
  </BarChart>
</ChartWrapper>
```

### Modal

```tsx
import { EnhancedModal } from '@/presentation/components/Modal';

<EnhancedModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Titre"
  size="lg"
>
  <p>Contenu du modal</p>
</EnhancedModal>
```

### Form

```tsx
import {
  FormField,
  FormInput,
  FormSelect,
  FormCheckbox,
} from '@/presentation/components/Form';

<FormField label="Email" error={errors.email}>
  <FormInput
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</FormField>
```

### Layout

```tsx
import { Container, Stack, Grid } from '@/presentation/components/Layout';

<Container size="lg">
  <Stack spacing={4}>
    <Grid cols={3} gap={4}>
      <Card>Item 1</Card>
      <Card>Item 2</Card>
      <Card>Item 3</Card>
    </Grid>
  </Stack>
</Container>
```

## 🛠️ Utilisation des Utilitaires

### Format

```tsx
import {
  formatCurrency,
  formatNumber,
  formatDate,
  formatPercent,
} from '@/application/utils';

const price = formatCurrency(1000000); // "1 000 000 FCFA"
const number = formatNumber(1234.56, 2); // "1 234,56"
const date = formatDate(new Date(), 'dd/MM/yyyy'); // "01/01/2024"
const percent = formatPercent(0.75); // "75%"
```

### Validation

```tsx
import {
  isValidEmail,
  isValidPhone,
  validatePasswordStrength,
} from '@/application/utils';

const emailValid = isValidEmail('user@example.com');
const phoneValid = isValidPhone('+229 12345678');
const pwdStrength = validatePasswordStrength('MyP@ssw0rd');
```

### Statistics

```tsx
import {
  calculateMean,
  calculateMedian,
  calculateStatistics,
} from '@/application/utils';

const mean = calculateMean([10, 20, 30, 40, 50]); // 30
const median = calculateMedian([10, 20, 30, 40, 50]); // 30
const stats = calculateStatistics([10, 20, 30, 40, 50]);
```

### Arrays

```tsx
import { groupBy, sortBy, chunk } from '@/application/utils';

const grouped = groupBy(users, u => u.role);
const sorted = sortBy(users, u => u.name, 'asc');
const chunks = chunk(items, 10);
```

### Storage

```tsx
import {
  LocalStorageWithExpiry,
  CookieStorage,
} from '@/application/utils';

// LocalStorage avec expiration (1 heure)
LocalStorageWithExpiry.setItem('token', 'abc123', 60);
const token = LocalStorageWithExpiry.getItem<string>('token');

// Cookies
CookieStorage.setItem('theme', 'dark', { expiresInDays: 30 });
const theme = CookieStorage.getItem('theme');
```

### Export

```tsx
import {
  exportToCSV,
  exportToJSON,
  generateFilename,
} from '@/application/utils';

const data = [{ name: 'John', age: 30 }];
const filename = generateFilename('users', 'csv');
exportToCSV(data, filename);
```

## 🎨 Personnalisation

### Thèmes et Couleurs

```tsx
import {
  getStatusColor,
  darken,
  lighten,
  generatePalette,
} from '@/application/utils';

const color = getStatusColor('success');
const darker = darken('#3B82F6', 20);
const lighter = lighten('#3B82F6', 20);
const palette = generatePalette('#3B82F6');
```

### Animations

```tsx
import {
  easing,
  lerp,
  animateValue,
} from '@/application/utils';

const animatedValue = animateValue(
  0,
  100,
  1000,
  easing.easeOut,
  (value) => setProgress(value)
);
```

## 📝 Bonnes Pratiques

### 1. Utiliser les hooks personnalisés

Préférez les hooks personnalisés aux hooks React de base quand disponibles :

```tsx
// ✅ Bon
const debouncedValue = useDebounce(value, 300);

// ❌ Moins bon
const [debouncedValue, setDebouncedValue] = useState(value);
useEffect(() => {
  const timer = setTimeout(() => setDebouncedValue(value), 300);
  return () => clearTimeout(timer);
}, [value]);
```

### 2. Utiliser les composants réutilisables

Utilisez les composants de la bibliothèque plutôt que de créer les vôtres :

```tsx
// ✅ Bon
import { Badge } from '@/presentation/components/Badge';
<Badge variant="success">Actif</Badge>

// ❌ Moins bon
<span className="bg-green-500 text-white px-2 py-1 rounded">Actif</span>
```

### 3. Valider les données

Utilisez les fonctions de validation :

```tsx
// ✅ Bon
if (isValidEmail(email)) {
  // Traiter l'email
}

// ❌ Moins bon
if (email.includes('@')) {
  // Pas assez robuste
}
```

### 4. Gérer les erreurs

Utilisez les Error Boundaries :

```tsx
import { AnalyticsErrorBoundary } from '@/presentation/components/ErrorBoundary';

<AnalyticsErrorBoundary>
  <YourComponent />
</AnalyticsErrorBoundary>
```

## 🔧 Configuration

### Variables d'environnement

```env
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_USE_MOCKS=true
```

### Types TypeScript

Tous les composants et utilitaires sont typés. Utilisez TypeScript pour une meilleure expérience de développement.

## 📚 Ressources

- **Documentation complète** : Voir `RESUME_FINAL_COMPLET_V10.md`
- **Exemples** : Voir les fichiers de composants pour des exemples d'utilisation
- **Types** : Tous les types sont exportés et documentés

## 🆘 Support

Pour toute question ou problème :
1. Consultez la documentation
2. Vérifiez les exemples dans le code
3. Utilisez les types TypeScript pour l'autocomplétion

---

**Version 10.0 - Guide d'Utilisation** 📖

