# Intégration Architecture BTP - Module Analytics

## Vue d'ensemble

L'architecture analytique complète BTP a été intégrée dans le module Analytics du portail maître-ouvrage. Cette intégration permet de basculer entre la navigation classique et la nouvelle navigation BTP structurée selon l'architecture en 5 couches.

---

## Structure Créée

### 1. Configuration Architecture BTP

**Fichier :** `src/lib/config/analyticsBTPArchitecture.ts`

- ✅ Configuration complète des 10 domaines analytiques
- ✅ 40+ modules organisés par domaine
- ✅ 150+ sous-modules détaillés
- ✅ Helpers pour la navigation (findDomain, findModule, findSubModule)
- ✅ Types TypeScript complets

### 2. Store de Navigation BTP

**Fichier :** `src/lib/stores/analyticsBTPNavigationStore.ts`

- ✅ Store Zustand pour la navigation hiérarchique (Domaine > Module > Sous-module)
- ✅ Historique de navigation
- ✅ Helpers pour obtenir le domaine/module/sous-module courant
- ✅ Persistance avec localStorage

### 3. Composants de Navigation

**Dossier :** `src/components/features/bmo/analytics/btp-navigation/`

#### BTPSidebar.tsx
- ✅ Sidebar hiérarchique avec expansion/collapse
- ✅ Navigation par domaine, module et sous-module
- ✅ Indication visuelle de l'élément actif
- ✅ Support du mode collapsed

#### BTPContentRouter.tsx
- ✅ Router de contenu selon la navigation BTP
- ✅ Lazy loading des vues par domaine
- ✅ Vues de fallback (Welcome, NotFound)
- ✅ Suspense avec LoadingSkeleton

#### Views/ChantiersView.tsx
- ✅ Vue exemple pour le domaine Chantiers
- ✅ Affichage hiérarchique (domaine > module > sous-module)
- ✅ Placeholders pour les autres domaines

---

## Intégration dans la Page Analytics

**Fichier :** `app/(portals)/maitre-ouvrage/analytics/page.tsx`

### Modifications Apportées

1. **Import des composants BTP**
   ```typescript
   import { BTPSidebar, BTPContentRouter } from '@/components/features/bmo/analytics/btp-navigation';
   ```

2. **État de bascule**
   ```typescript
   const [useBTPNavigation, setUseBTPNavigation] = useState(false);
   ```

3. **Sidebar conditionnelle**
   - Affiche `BTPSidebar` si `useBTPNavigation === true`
   - Affiche `AnalyticsCommandSidebar` sinon

4. **Router conditionnel**
   - Affiche `BTPContentRouter` si `useBTPNavigation === true`
   - Affiche le router classique sinon

5. **Bouton de bascule**
   - Ajouté dans le header pour basculer entre les deux modes
   - Audit logging pour le suivi

---

## Architecture des 10 Domaines

### 1. Gestion de Chantiers
- Suivi de Chantiers
- Analyse des Lots et Corps d'État
- Analyse Géographique
- Analyse Temporelle

### 2. Gestion Financière
- Analyse Budgétaire
- Analyse des Coûts
- Analyse des Marges
- Trésorerie et Cash-Flow
- Facturation et Encaissements
- Analyse des Dépenses

### 3. Ressources Humaines
- Analyse de la Main d'Œuvre
- Analyse des Absences et Congés
- Analyse des Compétences
- Analyse de la Performance RH

### 4. Sous-traitants
- Performance des Sous-traitants
- Analyse des Contrats de Sous-traitance
- Risques Sous-traitance

### 5. Matériel et Équipements
- Analyse du Matériel
- Maintenance et Entretien
- Location vs Achat
- Stocks et Approvisionnements

### 6. Commercial et Appels d'Offres
- Analyse Commerciale
- Analyse des Appels d'Offres
- Analyse des Clients
- Analyse des Marchés

### 7. Qualité, Sécurité, Environnement (QSE)
- Analyse Qualité
- Analyse Sécurité
- Analyse Environnementale
- Analyse QSE Intégrée

### 8. Planification et Ordonnancement
- Analyse de Planification
- Analyse des Ressources
- Analyse de la Chaîne Critique

### 9. Multi-Agences
- Analyse Multi-Agences
- Consolidation
- Gouvernance Multi-Agences

### 10. Performance Opérationnelle
- Tableaux de Bord Exécutifs
- Analyse Prédictive
- Benchmarking
- Analyse de Rentabilité

---

## Utilisation

### Basculer vers la Navigation BTP

1. Cliquer sur le bouton "BTP" dans le header
2. La sidebar change pour afficher la hiérarchie BTP
3. Naviguer : Domaine → Module → Sous-module

### Basculer vers la Navigation Classique

1. Cliquer sur le bouton "Classique" dans le header
2. Retour à la navigation classique

---

## Prochaines Étapes

### À Implémenter

1. **Vues Complètes par Domaine**
   - Créer les vues détaillées pour chaque domaine
   - Implémenter les composants spécifiques à chaque module
   - Ajouter les graphiques et tableaux de données

2. **Composants Interactifs**
   - Fenêtres avancées (détail chantier, analyse comparative)
   - Modales intelligentes (configuration, export)
   - Pop-ups contextuels (infobulles, alertes)
   - Drill-down/drill-through fonctionnels
   - Filtres intelligents

3. **Intégration Data**
   - Connecter aux sources de données réelles
   - Implémenter le pipeline ETL/ELT
   - Créer les data marts
   - Mettre en place le semantic layer
   - Configurer le moteur de règles
   - Configurer le moteur d'alertes
   - Intégrer le moteur IA prédictif

4. **Tests et Documentation**
   - Tests unitaires pour les composants
   - Tests d'intégration pour la navigation
   - Documentation utilisateur
   - Guide de développement

---

## Fichiers Créés/Modifiés

### Nouveaux Fichiers

- `src/lib/config/analyticsBTPArchitecture.ts` - Configuration architecture
- `src/lib/stores/analyticsBTPNavigationStore.ts` - Store navigation BTP
- `src/components/features/bmo/analytics/btp-navigation/BTPSidebar.tsx` - Sidebar BTP
- `src/components/features/bmo/analytics/btp-navigation/BTPContentRouter.tsx` - Router BTP
- `src/components/features/bmo/analytics/btp-navigation/views/ChantiersView.tsx` - Vue Chantiers
- `src/components/features/bmo/analytics/btp-navigation/views/index.ts` - Exports vues
- `src/components/features/bmo/analytics/btp-navigation/index.ts` - Exports navigation
- `ARCHITECTURE_ANALYTICS_BTP_COMPLETE.md` - Documentation architecture
- `INTEGRATION_ARCHITECTURE_BTP.md` - Ce document

### Fichiers Modifiés

- `app/(portals)/maitre-ouvrage/analytics/page.tsx` - Intégration navigation BTP

---

## Architecture Technique

### Hiérarchie de Navigation

```
Domaine (10)
  └── Module (40+)
      └── Sous-module (150+)
          └── Fonctionnalités
```

### Store State

```typescript
{
  navigation: {
    domainId: string | null,
    moduleId: string | null,
    subModuleId: string | null
  },
  navigationHistory: BTPNavigationHistory[]
}
```

### Composants

- **BTPSidebar** : Navigation hiérarchique avec expansion/collapse
- **BTPContentRouter** : Routing conditionnel vers les vues appropriées
- **ChantiersView** : Vue exemple avec structure hiérarchique

---

## Statut

✅ **Configuration Architecture** - Complète  
✅ **Store Navigation** - Implémenté  
✅ **Composants Navigation** - Créés  
✅ **Intégration Page** - Terminée  
⏳ **Vues Complètes** - En cours (ChantiersView créée, autres à faire)  
⏳ **Composants Interactifs** - À implémenter  
⏳ **Intégration Data** - À configurer  

---

**Date :** Janvier 2025  
**Version :** 1.0  
**Statut :** ✅ Intégration de base terminée

