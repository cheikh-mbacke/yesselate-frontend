# 🚀 BMO Portal Updates - Instructions d'intégration

## 📁 Structure des fichiers

```
bmo-updates/
├── types/
│   └── bmo.types.ts          → Remplacer src/lib/types/bmo.types.ts
├── stores/
│   └── bmo-store.ts          → Remplacer src/lib/stores/bmo-store.ts
├── data/
│   ├── bmo-mock-3.ts         → Remplacer src/lib/data/bmo-mock-3.ts
│   └── index.ts              → Remplacer src/lib/data/index.ts
├── sidebar/
│   └── Sidebar.tsx           → Remplacer src/components/features/bmo/Sidebar.tsx
├── components/modals/
│   ├── SubstitutionModal.tsx → Créer src/components/features/bmo/modals/SubstitutionModal.tsx
│   ├── BlocageModal.tsx      → Créer src/components/features/bmo/modals/BlocageModal.tsx
│   └── BureauDetailsModal.tsx→ Créer src/components/features/bmo/modals/BureauDetailsModal.tsx
└── pages/
    ├── parametres/page.tsx   → Créer app/(portals)/maitre-ouvrage/parametres/page.tsx
    ├── stats-clients/page.tsx→ Créer app/(portals)/maitre-ouvrage/stats-clients/page.tsx
    ├── visio/page.tsx        → Créer app/(portals)/maitre-ouvrage/visio/page.tsx
    └── logs/page.tsx         → Créer app/(portals)/maitre-ouvrage/logs/page.tsx
```

---

## 📋 Checklist d'intégration

### 1. Types (src/lib/types/bmo.types.ts)
- [x] Ajout de `BureauDetails`, `BureauPlatform`, `BureauOrgMember`
- [x] Ajout de `ProjectBudget`, `BudgetHistoryItem`, `BudgetAlert`
- [x] Ajout de `ActionLog`, `ActionLogType`
- [x] Ajout de `SubstitutionAction`, `SubstitutionActionType`
- [x] Ajout de `UserSettings` (profile, preferences, notifications, security)
- [x] Ajout de `ClientStats`, `ClientsGlobalStats`, `ClientProjectSummary`, `Client`

### 2. Store (src/lib/stores/bmo-store.ts)
- [x] Ajout du système de logs (`actionLogs`, `addActionLog`, `getLogsByModule`, etc.)
- [x] Ajout de `substitutionModalData` et ses méthodes
- [x] Ajout de `blocageModalData` et ses méthodes
- [x] Ajout de `bureauDetailsModalData` et ses méthodes

### 3. Données mock (src/lib/data/bmo-mock-3.ts)
- [x] Ajout de `clientsStats` (statistiques par client)
- [x] Ajout de `clientsGlobalStats` (stats globales)
- [x] Ajout de `defaultUserSettings` (paramètres par défaut)
- [x] Ajout de `bureauxDetails` (détails des bureaux)
- [x] Ajout de `budgetAlerts` et `projectBudgets`
- [x] Mise à jour de `navSections` avec les nouveaux onglets

### 4. Navigation (src/lib/data/bmo-mock-3.ts + Sidebar.tsx)
- [x] Ajout section "Clients & Stats" avec `stats-clients`
- [x] Ajout onglet `visio` dans "Communication"
- [x] Ajout onglet `logs` dans "Gouvernance"
- [x] Ajout section "Compte" avec `parametres`
- [x] Mise à jour `routeMapping` dans Sidebar.tsx

### 5. Nouvelles pages
- [x] `/maitre-ouvrage/parametres` - Paramètres utilisateur
- [x] `/maitre-ouvrage/stats-clients` - Statistiques clients
- [x] `/maitre-ouvrage/visio` - Visio Conférence (placeholder)
- [x] `/maitre-ouvrage/logs` - Journal des actions

### 6. Modales
- [x] `SubstitutionModal` - Modal de substitution pour dossiers bloqués
- [x] `BlocageModal` - Modal détails d'un blocage
- [x] `BureauDetailsModal` - Modal détails bureau (plateformes + organigramme)

---

## 🔧 Modifications requises dans les fichiers existants

### BMOLayout.tsx
Ajouter les imports et composants des modales :

```tsx
// Ajouter ces imports
import { SubstitutionModal } from '@/components/features/bmo/modals/SubstitutionModal';
import { BlocageModal } from '@/components/features/bmo/modals/BlocageModal';
import { BureauDetailsModal } from '@/components/features/bmo/modals/BureauDetailsModal';

// Dans le return, ajouter après les autres overlays :
<SubstitutionModal />
<BlocageModal />
<BureauDetailsModal />
```

### Page Bureaux (bureaux/page.tsx)
Modifier le bouton "Détails" pour ouvrir la modale :

```tsx
import { useBMOStore } from '@/lib/stores';

// Dans le composant :
const { openBureauDetailsModal } = useBMOStore();

// Modifier le bouton "Détails" :
<Button 
  size="xs" 
  variant="secondary"
  onClick={() => openBureauDetailsModal(bureau.code)}
>
  Détails
</Button>
```

### Page Dashboard (page.tsx)
Ajouter les interactions pour blocage et substitution :

```tsx
import { useBMOStore } from '@/lib/stores';
import { blockedDossiers } from '@/lib/data';

// Dans le composant :
const { openBlocageModal, openSubstitutionModal } = useBMOStore();

// Pour le bouton "Intervenir" de l'alerte critique :
<Button
  size="sm"
  variant="destructive"
  onClick={() => {
    const dossierCritique = blockedDossiers.find(d => d.delay > 5);
    if (dossierCritique) openBlocageModal(dossierCritique);
  }}
>
  Intervenir
</Button>

// Pour le bouton "Substituer" de chaque substitution :
<Button
  size="xs"
  variant="warning"
  className="w-full mt-2"
  onClick={() => {
    const dossier = blockedDossiers.find(d => d.id === s.ref);
    if (dossier) openSubstitutionModal(dossier);
  }}
>
  ⚡ Substituer
</Button>
```

### Page Organigramme (organigramme/page.tsx)
Filtrer pour n'afficher que les rapports directs du BMO :

```tsx
// Filtrer les bureaux à afficher (BMO + rapports directs)
const directReportCodes = ['BMO', 'BF', 'BM', 'BA', 'BCT', 'BQC', 'BJ'];
const filteredBureaux = organigramme.bureaux.filter(
  b => directReportCodes.includes(b.code)
);
```

---

## 📝 Notes importantes

1. **Logging automatique** : Le système de logs est intégré dans le store. Utilisez `addActionLog()` après chaque action importante.

2. **Modales** : Les modales sont gérées via le store Zustand. Ouvrez-les avec `openXxxModal()` et fermez avec `closeXxxModal()`.

3. **Navigation** : Les nouvelles routes sont automatiquement gérées par le `routeMapping` dans Sidebar.tsx.

4. **Données clients** : Les stats clients dans `bmo-mock-3.ts` sont liées aux projets existants. Assurez-vous de la cohérence des IDs.

5. **Alertes budget** : Le système vérifie si `budgetActuel > budgetPrevisionnel` (budget réel + 5%).

---

## 🎯 Prochaines étapes suggérées

1. Intégrer les fichiers dans votre projet
2. Tester la navigation vers les nouvelles pages
3. Vérifier le fonctionnement des modales
4. Connecter au backend quand disponible
5. Ajouter les validations de formulaires manquantes

---

## ⚠️ Dépendances

Assurez-vous que ces imports existent dans votre projet :
- `@/lib/utils` (fonction `cn`)
- `@/lib/stores` (useAppStore, useBMOStore)
- `@/components/ui/*` (Badge, Button, Card, Input)
- `@/components/features/bmo/BureauTag`
- `recharts` (pour les graphiques)
