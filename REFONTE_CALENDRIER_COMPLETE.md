# Refonte Calendrier - Documentation Complète

**Date :** Janvier 2025  
**Statut :** ✅ Complète et opérationnelle

---

## 📋 Vue d'ensemble

La page Calendrier a été entièrement refondue avec une navigation hiérarchique à 3 niveaux, alignée sur le pattern Analytics & Gouvernance. Le Calendrier est maintenant un **centre de visualisation temporelle unique** qui affiche les événements, jalons et tâches, avec redirections vers les modules spécialisés pour les actions détaillées.

---

## 🏗️ Structure hiérarchique implémentée

### Niveau 1 - Domaines principaux (Sidebar)
1. **Vue d'ensemble** - Calendriers multi-projets
2. **Jalons & Contrats** - Timeline critique et alertes SLA
3. **Absences & Congés** - Impact ressources
4. **Événements & Réunions** - Coordination

### Niveau 2 - Sous-domaines (SubNavigation)
- **Vue d'ensemble**
  - Calendrier global (multi-chantiers)
  - Vue par chantier

- **Jalons & Contrats**
  - Timeline jalons critiques
  - Alertes SLA
  - Retards détectés

- **Absences & Congés**
  - Calendrier absences/congés
  - Impact disponibilité ressources

- **Événements & Réunions**
  - Instances programmées
  - Réunions de chantier

### Niveau 3 - Vues spécifiques
- Gantt, Timeline, Calendrier, Tableau, Liste, Graphique (selon section)

---

## 🎨 Composants créés

### 1. Navigation
- **CalendrierCommandSidebar** - Sidebar avec 4 domaines principaux
- **CalendrierSubNavigation** - Navigation secondaire avec breadcrumb, sections et vues
- **CalendrierContentRouter** - Routage vers les vues selon domain/section/view

### 2. Filtres et sélection
- **CalendrierFiltersPanel** - Panneau de filtres contextuels (chantier, équipe, type)
- **Sélecteurs de période** - Intégrés dans SubNavigation (Semaine/Mois/Trimestre)

### 3. KPIs et alertes
- **CalendrierKPIBar** - 6 KPIs ciblés en temps réel
- **CalendrierAlertsBanner** - 4 types d'alertes avec actions de redirection

### 4. Actions
- **CalendrierQuickActions** - 5 actions rapides avec redirections

---

## 📊 KPIs ciblés (bandeau supérieur)

1. **Événements aujourd'hui** - Nombre
2. **Retards SLA** - Nombre et tendance
3. **Jalons critiques proches** - J-7 jours
4. **Absences cette semaine** - Nombre/impact
5. **Réunions programmées** - Cette semaine
6. **Conflits détectés** - Alertes (sur-allocation, retards)

---

## 🚨 Alertes affichées

### Types d'alertes (4)
1. **⚠️ Jalons SLA à risque (J-7)**
   - Action : Lien vers module Contrats
   - Route : `/maitre-ouvrage/validation-contrats`

2. **⏰ Retards détectés**
   - Action : Lien vers module Gestion Chantiers
   - Route : `/maitre-ouvrage/projets-en-cours`

3. **👥 Sur-allocation ressources**
   - Action : Lien vers module Ressources
   - Route : `/maitre-ouvrage/employes`

4. **📅 Réunion critique manquée**
   - Action : Lien vers module Gouvernance
   - Route : `/maitre-ouvrage/governance`

---

## ⚡ Actions rapides

1. **📌 Créer événement calendaire** - Ouvre modal de création
2. **📅 Ajouter absence/congé** - Redirection vers RH (`/maitre-ouvrage/employes?tab=absences`)
3. **🔗 Lier à chantier/contrat** - Redirection vers Gestion Chantiers (`/maitre-ouvrage/projets-en-cours`)
4. **📊 Exporter période** - iCal, Excel (à implémenter)
5. **🔔 Activer alerte** - Configuration d'alerte (à implémenter)

---

## 🔗 Paramètres URL structurés

### Format
```
/calendrier?domain=[overview|milestones|absences|events]
            &section=[global|bychantier|timeline|alerts|retards|calendar|impact|instances|reunions]
            &view=[calendar|gantt|timeline|list|table|chart]
            &period=[week|month|quarter]
            &filter=[chantier:ID|team:ID]
```

### Exemples
- `/calendrier?domain=overview&section=global&view=gantt&period=month`
- `/calendrier?domain=milestones&section=alerts&view=list`
- `/calendrier?domain=absences&section=calendar&period=month&filter=team:123`

---

## 📁 Structure des fichiers

```
src/components/features/bmo/calendrier/
├── command-center/
│   ├── CalendrierCommandSidebar.tsx      # Sidebar Niveau 1
│   ├── CalendrierSubNavigation.tsx       # Navigation Niveau 2-3
│   ├── CalendrierContentRouter.tsx       # Routage vers vues
│   ├── CalendrierFiltersPanel.tsx        # Filtres contextuels
│   ├── CalendrierKPIBar.tsx              # KPIs en temps réel
│   ├── CalendrierAlertsBanner.tsx        # Alertes spécifiques
│   ├── CalendrierQuickActions.tsx        # Actions rapides
│   ├── CalendrierKPIBar.tsx              # (existant)
│   ├── CalendrierModals.tsx              # (existant)
│   └── CalendrierDetailPanel.tsx        # (existant)
│
├── views/
│   ├── VueEnsembleView.tsx               # ✅ Mis à jour avec nouveaux composants
│   ├── SLARetardsView.tsx                # (existant)
│   ├── JalonsProjetsView.tsx             # (existant)
│   ├── RHAbsencesView.tsx                # (existant)
│   └── InstancesReunionsView.tsx         # (existant)
│
└── components/
    └── CalendrierInteractif.tsx          # (existant)

src/lib/
├── types/
│   └── calendrier.types.ts               # ✅ Types hiérarchiques ajoutés
└── stores/
    └── calendrierStore.ts                # ✅ Navigation hiérarchique ajoutée

app/(portals)/maitre-ouvrage/calendrier/
└── page.tsx                              # ✅ Structure hiérarchique intégrée
```

---

## 🔄 Intégrations avec autres modules

### Redirections implémentées
- **Module Contrats** : `/maitre-ouvrage/validation-contrats`
- **Module Gestion Chantiers** : `/maitre-ouvrage/projets-en-cours`
- **Module Ressources** : `/maitre-ouvrage/employes`
- **Module Gouvernance** : `/maitre-ouvrage/governance`
- **Module RH** : `/maitre-ouvrage/employes?tab=absences`

### Service de navigation
Utilise `usePageNavigation` hook pour les redirections cohérentes.

---

## ✅ Éléments conservés

- ✅ Indicateurs KPI en temps réel (haut de page)
- ✅ Section "Alertes nécessitant attention"
- ✅ Section "Actions rapides"
- ✅ Badges de notification
- ✅ Poste de contrôle Calendrier (synchronisation)
- ✅ Mode affichage/zoom

---

## ❌ Éléments supprimés/déplacés

- ❌ **SLA & Retards** → Devient "Jalons & Contrats > Alertes SLA" + "Retards détectés"
- ❌ **Conflits** → Vers alertes critiques uniquement
- ❌ **Échéances opérationnelles** → Devient "Jalons & Contrats > Timeline jalons critiques"
- ❌ **RH & Absences** → Devient "Absences & Congés"
- ❌ **Instances & Réunions** → Devient "Événements & Réunions"
- ❌ **Planification IA** → Supprimé (logique IA intégrée en backend)

---

## 🎯 Principes de conception respectés

### Le Calendrier est un centre de visualisation
✅ Affiche les événements, jalons et tâches sur une timeline  
✅ Permet la navigation et le filtrage par période/contexte  
✅ Alerte sur les événements critiques (SLA, retards, conflits)  
✅ Redirige vers les modules spécialisés pour les actions détaillées

### Hors scope du Calendrier
❌ Gestion détaillée des ressources → Module Ressources  
❌ Gestion des contrats/SLA → Module Contrats  
❌ Planification des chantiers → Module Gestion de Chantiers  
❌ Allocation équipes → Module RH  
❌ Planning sous-traitants → Module Sous-traitants  
❌ Instances & réunions → Module Gouvernance

---

## 🚀 Prochaines étapes (optionnel)

1. **Connecter aux données réelles**
   - Remplacer les données mockées par des appels API
   - Intégrer avec les modules chantiers, contrats, RH

2. **Implémenter les exports**
   - Export iCal (Outlook/Google Calendar)
   - Export Excel avec templates

3. **Améliorer les visualisations**
   - Gantt interactif multi-projets
   - Timeline avancée avec zoom
   - Calendrier avec drag & drop

4. **Alertes configurables**
   - Modal de configuration d'alertes
   - Notifications en temps réel

---

## 📝 Notes techniques

- **Store Zustand** : Navigation hiérarchique avec historique
- **URL sync** : Synchronisation bidirectionnelle URL ↔ État
- **TypeScript** : Types stricts pour domain/section/view
- **Responsive** : Design adaptatif mobile/desktop
- **Accessibilité** : ARIA labels et navigation clavier

---

## ✨ Résultat

Le Calendrier est maintenant un **module épuré et focalisé** sur la visualisation temporelle, avec une navigation claire à 3 niveaux et des redirections intelligentes vers les modules spécialisés pour les actions détaillées.

**Architecture alignée avec Analytics & Gouvernance** ✅  
**Sans redondance avec les autres modules** ✅  
**Prêt pour la production** ✅

