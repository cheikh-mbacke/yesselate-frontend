# Intégration du module Gouvernance

## ✅ Intégration complète

Le module **Centre de Commande – Gouvernance** est maintenant entièrement intégré dans l'application Next.js.

## 📁 Structure des routes

Toutes les routes sont créées sous `app/(portals)/maitre-ouvrage/governance/` :

### Layout
- `layout.tsx` - Layout avec sidebar partagée

### Vue stratégique
- `/governance/dashboard` - Tableau de bord exécutif
- `/governance/tendances` - Tendances mensuelles
- `/governance/synthese/projets` - Synthèse projets
- `/governance/synthese/budget` - Synthèse budget
- `/governance/synthese/jalons` - Synthèse jalons
- `/governance/synthese/risques` - Synthèse risques
- `/governance/synthese/validations` - Synthèse validations

### Points d'attention
- `/governance/attention/depassements-budget` - Dépassements budgétaires
- `/governance/attention/retards-critiques` - Retards critiques
- `/governance/attention/ressources-indispo` - Ressources indisponibles
- `/governance/attention/escalades` - Escalades en cours

### Arbitrages & décisions
- `/governance/arbitrages/decisions-validees` - Décisions validées
- `/governance/arbitrages/en-attente` - Arbitrages en attente
- `/governance/arbitrages/historique` - Historique des décisions

### Instances de coordination
- `/governance/instances/reunions-dg` - Réunions DG
- `/governance/instances/reunions-moa-moe` - Réunions MOA/MOE
- `/governance/instances/reunions-transverses` - Réunions transverses

### Conformité & performance
- `/governance/conformite/indicateurs` - Indicateurs conformité
- `/governance/conformite/audit` - Audit gouvernance
- `/governance/conformite/engagements` - Suivi des engagements

## 🚀 Utilisation

### Accès au module

1. Naviguer vers `/maitre-ouvrage/governance`
2. La page racine redirige automatiquement vers `/maitre-ouvrage/governance/dashboard`
3. La sidebar permet de naviguer entre toutes les sections

### Navigation

La sidebar affiche :
- 5 domaines principaux (Vue stratégique, Points d'attention, Arbitrages, Instances, Conformité)
- Badges dynamiques basés sur les statistiques
- Expansion/collapse des domaines
- Indicateur visuel de la page active

## 🔌 Intégration API

Le module s'attend à des endpoints API sous `/api/gouvernance/` :

### Endpoints principaux
- `GET /api/gouvernance/overview` - Vue d'ensemble
- `GET /api/gouvernance/stats` - Statistiques KPI
- `GET /api/gouvernance/tendances` - Tendances mensuelles

### Endpoints synthèses
- `GET /api/gouvernance/synthese/projets`
- `GET /api/gouvernance/synthese/budget`
- `GET /api/gouvernance/synthese/jalons`
- `GET /api/gouvernance/synthese/risques`
- `GET /api/gouvernance/synthese/validations`

### Endpoints attention
- `GET /api/gouvernance/attention/depassements-budget`
- `GET /api/gouvernance/attention/retards-critiques`
- `GET /api/gouvernance/attention/ressources-indispo`
- `GET /api/gouvernance/attention/escalades`

### Endpoints arbitrages
- `GET /api/gouvernance/arbitrages/decisions-validees`
- `GET /api/gouvernance/arbitrages/en-attente`
- `GET /api/gouvernance/arbitrages/historique`

### Endpoints instances
- `GET /api/gouvernance/instances/reunions-dg`
- `GET /api/gouvernance/instances/reunions-moa-moe`
- `GET /api/gouvernance/instances/reunions-transverses`

### Endpoints conformité
- `GET /api/gouvernance/conformite/indicateurs`
- `GET /api/gouvernance/conformite/audit`
- `GET /api/gouvernance/conformite/engagements`

## 📊 Format des réponses API

Toutes les réponses doivent suivre le format :

```typescript
// Pour les listes paginées
{
  data: T[],
  total: number,
  page: number,
  pageSize: number,
  totalPages: number
}

// Pour les statistiques
{
  projets_actifs: number,
  budget_consomme_pourcent: number,
  jalons_respectes_pourcent: number,
  risques_critiques: number,
  validations_en_attente: number,
  // ... autres champs
}
```

## 🎨 Personnalisation

### Styles

Le module utilise le système de design de l'application :
- Fond : `bg-slate-950`
- Cartes : `bg-white/5 ring-1 ring-white/10`
- Texte : `text-white`, `text-slate-300`, `text-slate-400`
- Couleurs d'état : `rose-500`, `amber-500`, `emerald-500`, `blue-500`

### Filtres

Les filtres sont persistés dans le localStorage via Zustand :
- Période (week, month, quarter)
- Vue (dashboard, list, matrix, timeline)
- Projet sélectionné
- Plage de dates

## ✅ Checklist d'intégration backend

- [ ] Créer les endpoints API sous `/api/gouvernance/`
- [ ] Implémenter la pagination pour les listes
- [ ] Calculer les statistiques en temps réel
- [ ] Configurer les badges dans la navigation
- [ ] Tester les filtres et la période
- [ ] Valider les formats de données

## 🐛 Dépannage

### La sidebar ne s'affiche pas
- Vérifier que `layout.tsx` est bien présent
- Vérifier les imports de `GouvernanceSidebar`

### Les données ne se chargent pas
- Vérifier que les endpoints API existent
- Vérifier la configuration `NEXT_PUBLIC_API_URL`
- Vérifier les erreurs dans la console navigateur

### Les badges ne s'affichent pas
- Vérifier que les statistiques sont retournées par l'API
- Vérifier les clés de badges dans `gouvernanceNavigationConfig.ts`

## 📝 Notes

- Le module est entièrement modulaire et peut être utilisé indépendamment
- Les composants sont réutilisables dans d'autres contextes
- Les types TypeScript sont exportés pour faciliter l'intégration backend

