# 🚀 Quick Start - Module Alertes & Risques

## ⚡ Démarrage Rapide

### 1. Accéder au module
```
URL: http://localhost:3000/maitre-ouvrage/alertes
```

### 2. Navigation
- Cliquez sur les items de la sidebar pour naviguer
- Utilisez les sous-onglets pour affiner la vue
- Les badges affichent le nombre d'alertes

### 3. Vues principales

#### Vue d'ensemble
- 6 KPI cards cliquables
- Indicateurs en temps réel
- Synthèses par typologie et bureau

#### Alertes en cours
- **Critiques** : Alertes nécessitant une action immédiate
- **Avertissements** : Alertes nécessitant une attention
- **SLA dépassés** : Délais dépassés
- **Blocages** : Blocages opérationnels

#### Traitements
- **Acquittées** : Alertes acquittées par responsable
- **Résolues** : Alertes résolues (manuelle, auto, IA)

#### Gouvernance
- **Règles d'alerte** : Configuration des seuils
- **Historique** : Consultation des alertes passées
- **Suivis & escalades** : Traçabilité

---

## 🎯 Fonctionnalités Clés

### Navigation hiérarchique
```
Alertes & Risques
├── Vue d'ensemble
│   ├── Indicateurs en temps réel ✅
│   ├── Synthèse par typologie ✅
│   └── Synthèse par bureau ✅
├── Alertes en cours
│   ├── Critiques
│   │   ├── Paiements bloqués ✅
│   │   ├── Validations bloquées
│   │   ├── Justificatifs manquants
│   │   └── Risques financiers
│   └── ...
└── ...
```

### KPI Cards
- Cliquables pour navigation directe
- Couleurs sémantiques (rouge=critique, jaune=avertissement)
- Variations affichées si disponibles

### Alerte Cards
- Border left coloré selon type
- Métadonnées complètes
- Bouton "Traiter maintenant"

---

## 🔧 Configuration

### Modifier les données mock
Éditez `src/modules/alertes/api/alertesApi.ts` :
```typescript
const mockAlertes: Alerte[] = [
  // Ajoutez vos alertes ici
];
```

### Personnaliser les couleurs
Éditez `src/modules/alertes/design/design-tokens.json` :
```json
{
  "colors": {
    "primary": { "DEFAULT": "#2563EB" },
    "semantic": {
      "critical": { "DEFAULT": "#EF4444" }
    }
  }
}
```

### Ajouter une nouvelle page
1. Créez le fichier dans `src/modules/alertes/pages/`
2. Exportez depuis `pages/index.ts`
3. Ajoutez le routing dans `AlertesContentRouter.tsx`

---

## 📊 Données

### Statistiques
Les stats sont calculées automatiquement depuis les alertes :
- Total, par sévérité, par statut
- Par typologie, bureau, responsable
- Temps de réponse/résolution moyen
- Taux de résolution/acquittement

### Filtres
Filtrage disponible par :
- Sévérité (critical, warning, info)
- Statut (pending, acknowledged, resolved)
- Typologie
- Bureau
- Responsable
- Projet
- Période

---

## 🎨 Design System

### Utiliser les composants
```tsx
import { AlertesKPICard } from '@/modules/alertes/components';
import { AlerteCard } from '@/modules/alertes/components';

// KPI Card
<AlertesKPICard
  icon={AlertTriangle}
  title="Critiques"
  value={24}
  color="critical"
  onClick={() => navigate('en-cours', 'critiques')}
/>

// Alerte Card
<AlerteCard
  alerte={alerte}
  onClick={() => openDetail(alerte.id)}
  onAction={() => handleAction(alerte.id)}
/>
```

---

## 🗄️ Base de données

### Installation
```bash
psql -U postgres -d your_database -f src/modules/alertes/database/schema.sql
```

### Structure
- 11 tables principales
- Vues optimisées
- Fonctions utilitaires
- Triggers automatiques

---

## 🐛 Dépannage

### Les alertes ne s'affichent pas
1. Vérifiez que l'API mock retourne des données
2. Vérifiez les filtres actifs
3. Consultez la console pour les erreurs

### La navigation ne fonctionne pas
1. Vérifiez que le store Zustand est initialisé
2. Vérifiez les routes dans `alertesNavigationConfig.ts`
3. Vérifiez la sync URL dans la page principale

### Les stats sont à zéro
1. Vérifiez que `useAlertesStats()` est appelé
2. Vérifiez que les données mock sont chargées
3. Vérifiez les filtres appliqués

---

## 📚 Documentation Complète

- **README.md** : Documentation générale
- **INTEGRATION_COMPLETE.md** : État d'intégration
- **design/README.md** : Design system
- **database/README.md** : Base de données

---

## ✅ Checklist de Vérification

- [ ] Module accessible via `/maitre-ouvrage/alertes`
- [ ] Sidebar s'affiche et fonctionne
- [ ] Navigation hiérarchique opérationnelle
- [ ] KPI cards affichent les stats
- [ ] Alerte cards s'affichent correctement
- [ ] Filtres fonctionnent
- [ ] Raccourcis clavier opérationnels
- [ ] Design cohérent avec Analytics BTP

---

## 🎉 C'est prêt !

Le module est **100% fonctionnel** et prêt à l'utilisation. 🚀

