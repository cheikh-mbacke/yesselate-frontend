# Architecture Complète des Logiques d'Affichage - Module Analytics ERP BTP

## Vue d'ensemble

Document exhaustif décrivant toutes les logiques d'affichage dynamique, de navigation, de données, d'actions, de comportements intelligents et de contextes métier pour l'architecture analytique ERP BTP.

---

# 🟦 1. LOGIQUE D'AFFICHAGE PAR NIVEAU DE NAVIGATION

## 1.1. Clic sur un Domaine

### 1.1.1. Affichage Principal

**Bloc Header du Domaine**
- Titre du domaine avec icône
- Description du domaine
- Badge de statut global (Actif, En cours, Critique)
- Indicateur de dernière mise à jour
- Bouton d'actions rapides (Export, Partage, Configuration)

**Bloc KPIs Globaux du Domaine**
- **KPI 1 : Performance Globale**
  - Valeur actuelle avec unité
  - Évolution vs période précédente (%, flèche directionnelle)
  - Cible/objectif si applicable
  - Mini graphique sparkline
  - Clic → Modale d'analyse détaillée du KPI

- **KPI 2 : Volume d'Activité**
  - Nombre total d'éléments (chantiers, factures, ressources, etc.)
  - Répartition par statut (graphique en donut)
  - Évolution temporelle (graphique linéaire)
  - Clic → Vue détaillée avec filtres

- **KPI 3 : Rentabilité Globale**
  - Marge globale
  - Évolution vs budget
  - Comparaison avec période précédente
  - Indicateur de santé (vert/jaune/rouge)
  - Clic → Analyse financière approfondie

- **KPI 4 : Risques et Alertes**
  - Nombre d'alertes actives
  - Répartition par criticité (critical, high, medium, low)
  - Alertes critiques en évidence
  - Clic → Vue des alertes du domaine

**Bloc Alertes Globales du Domaine**
- Liste des 5 alertes les plus critiques
- Pour chaque alerte :
  - Type et criticité (badge coloré)
  - Titre et description courte
  - Impact estimé
  - Date de détection
  - Bouton "Voir détail" → Modale d'alerte
  - Bouton "Résoudre" → Modale de résolution

**Bloc Tendances et Évolutions**
- Graphique temporel principal (ligne ou barres)
  - Évolution sur les 12 derniers mois
  - Comparaison avec année précédente (ligne en pointillés)
  - Projections (ligne en pointillés avec zone d'incertitude)
- Graphique de répartition (camembert ou barres empilées)
  - Répartition par catégorie/module
  - Clic sur segment → Drill-down vers module
- Indicateurs de tendance
  - Flèches directionnelles avec pourcentages
  - Badges de performance (excellent, bon, à améliorer)

**Bloc Actions Rapides**
- Bouton "Nouveau [élément]" (ex: Nouveau chantier, Nouvelle facture)
- Bouton "Analyse comparative"
- Bouton "Export complet"
- Bouton "Simulation"
- Bouton "Rapport personnalisé"
- Bouton "Vue géographique" (si applicable)

**Bloc Modules Internes**
- Grille de cartes pour chaque module du domaine
- Pour chaque carte de module :
  - Titre du module
  - Icône représentative
  - KPI principal du module
  - Nombre de sous-modules
  - Badge d'alerte si alertes actives
  - Indicateur de performance (couleur)
  - Clic → Navigation vers le module

**Bloc Résumé Exécutif**
- Tableau récapitulatif des indicateurs clés
- Colonnes : Indicateur, Valeur actuelle, Objectif, Écart, Statut
- Tri et filtrage disponibles
- Export possible

### 1.1.2. Données Chargées

**Requêtes API**
- `GET /api/analytics/domains/{domainId}/summary`
  - KPIs globaux
  - Métriques agrégées
  - Tendances calculées
- `GET /api/analytics/domains/{domainId}/alerts`
  - Alertes actives
  - Alertes récentes
  - Alertes critiques
- `GET /api/analytics/domains/{domainId}/trends`
  - Données temporelles (12 mois)
  - Données comparatives (année précédente)
  - Projections
- `GET /api/analytics/domains/{domainId}/modules`
  - Liste des modules avec métriques
  - Performance par module
  - Alertes par module

**Filtres Appliqués**
- Période temporelle (par défaut : 12 derniers mois)
- Agences/Bureaux (si multi-agences)
- Statuts (si applicable)
- Filtres personnalisés sauvegardés

**Agrégations**
- Sommes, moyennes, médianes par période
- Comparaisons inter-périodes
- Calculs de tendances (croissance, décroissance)
- Détection d'anomalies

### 1.1.3. Visualisations Utilisées

- **Graphique linéaire temporel** : Évolution principale
- **Graphique en barres** : Comparaisons périodiques
- **Graphique en donut** : Répartitions
- **Graphique sparkline** : Mini tendances dans les KPIs
- **Heatmap** : Performance par module (si applicable)
- **Carte géographique** : Répartition spatiale (si applicable)

### 1.1.4. Actions Disponibles

- **Actions Analytiques**
  - "Analyser en profondeur" → Modale d'analyse avancée
  - "Comparer avec période" → Modale de comparaison
  - "Exporter les données" → Modale d'export
  - "Créer un rapport" → Modale de création de rapport

- **Actions de Simulation**
  - "Simuler un scénario" → Modale de simulation
  - "Projeter les tendances" → Modale de projection

- **Actions IA**
  - "Recommandations IA" → Modale de recommandations
  - "Détecter les anomalies" → Analyse IA automatique
  - "Prédire les risques" → Modale de prédiction

### 1.1.5. Modales Accessibles

- **Modale "Analyse Détaillée du Domaine"**
  - Onglets : Vue d'ensemble, KPIs, Tendances, Alertes, Modules
  - Graphiques interactifs
  - Tableaux de données détaillées
  - Filtres avancés
  - Export

- **Modale "Configuration du Domaine"**
  - Paramétrage des KPIs affichés
  - Configuration des alertes
  - Personnalisation des vues
  - Sauvegarde de préférences

---

## 1.2. Clic sur un Module

### 1.2.1. Affichage Principal

**Bloc Header du Module**
- Titre du module avec icône
- Breadcrumb : Domaine > Module
- Description du module
- Statut global du module
- Actions rapides spécifiques au module

**Bloc Tableaux de Données**
- **Tableau Principal**
  - Colonnes configurables selon le module
  - Tri multi-colonnes
  - Recherche globale
  - Filtres par colonne
  - Pagination (20, 50, 100 éléments par page)
  - Sélection multiple
  - Actions batch sur sélection
  - Export des données filtrées
  - Clic sur ligne → Fiche détaillée de l'élément

- **Tableau de Synthèse**
  - Agrégations par catégorie
  - Totaux et sous-totaux
  - Groupement possible
  - Drill-down disponible

**Bloc Cartes d'Éléments**
- Grille de cartes pour les éléments principaux
- Pour chaque carte :
  - Titre et identifiant
  - KPIs clés (2-3 indicateurs)
  - Statut visuel (badge coloré)
  - Progression si applicable (barre de progression)
  - Alertes actives (badge)
  - Actions rapides (menu contextuel)
  - Clic → Fiche détaillée

**Bloc Timeline**
- Timeline interactive des événements
- Filtres par type d'événement
- Zoom temporel (jour, semaine, mois)
- Clic sur événement → Détail de l'événement
- Ajout d'événement possible

**Bloc Indicateurs Spécifiques**
- KPIs spécialisés du module
- Graphiques de performance
- Indicateurs de qualité
- Métriques de productivité
- Comparaisons avec objectifs

**Bloc Alertes Liées au Module**
- Liste filtrée des alertes du module
- Tri par criticité et date
- Filtres par type d'alerte
- Actions de résolution groupées
- Clic sur alerte → Modale de détail

**Bloc Actions Disponibles**
- Actions contextuelles selon le module
- Actions de création
- Actions d'analyse
- Actions d'export
- Actions de reporting

### 1.2.2. Données Chargées

**Requêtes API**
- `GET /api/analytics/modules/{moduleId}/data`
  - Liste des éléments du module
  - Métriques agrégées
  - Données détaillées
- `GET /api/analytics/modules/{moduleId}/indicators`
  - KPIs du module
  - Indicateurs de performance
- `GET /api/analytics/modules/{moduleId}/alerts`
  - Alertes spécifiques
- `GET /api/analytics/modules/{moduleId}/timeline`
  - Événements et historique

**Filtres Appliqués**
- Filtres du domaine (hérités)
- Filtres spécifiques au module
- Filtres de recherche
- Filtres de période
- Filtres de statut

### 1.2.3. Visualisations Utilisées

- **Tableaux interactifs** : Données principales
- **Graphiques en barres** : Comparaisons
- **Graphiques linéaires** : Évolutions temporelles
- **Graphiques en aires** : Cumuls et tendances
- **Graphiques en radar** : Performance multi-critères
- **Timeline** : Chronologie des événements
- **Cartes** : Visualisation géographique (si applicable)

### 1.2.4. Actions Disponibles

- **Actions sur les Données**
  - Créer un nouvel élément
  - Modifier un élément (sélection)
  - Supprimer (sélection multiple)
  - Dupliquer
  - Exporter

- **Actions Analytiques**
  - Analyser les tendances
  - Comparer les éléments
  - Détecter les anomalies
  - Générer des insights

- **Actions de Reporting**
  - Créer un rapport
  - Exporter en PDF/Excel
  - Programmer un rapport récurrent

### 1.2.5. Modales Accessibles

- **Modale "Création d'Élément"**
  - Formulaire complet
  - Validation en temps réel
  - Aide contextuelle
  - Prévisualisation

- **Modale "Analyse Comparative"**
  - Sélection d'éléments à comparer
  - Critères de comparaison
  - Visualisations comparatives
  - Export des résultats

- **Modale "Configuration du Module"**
  - Paramétrage des colonnes
  - Configuration des KPIs
  - Personnalisation des vues

---

## 1.3. Clic sur un Sous-Module

### 1.3.1. Affichage Principal

**Bloc Header du Sous-Module**
- Breadcrumb : Domaine > Module > Sous-Module
- Titre et description
- Contexte métier
- Actions spécifiques

**Bloc Visualisations Adaptées**
- **Graphique Principal**
  - Type adapté au sous-module
  - Interactivité (zoom, pan, drill-down)
  - Légende interactive
  - Export d'image
  - Partage

- **Graphiques Secondaires**
  - Graphiques complémentaires
  - Analyses croisées
  - Corrélations

**Bloc Analyses Détaillées**
- Analyse approfondie des données
- Détection de patterns
- Identification de tendances
- Calculs statistiques avancés
- Interprétations métier

**Bloc KPIs Spécialisés**
- KPIs spécifiques au sous-module
- Calculs en temps réel
- Comparaisons avec références
- Évolutions temporelles
- Clic → Analyse détaillée du KPI

**Bloc Dérives Détectées**
- Liste des écarts détectés
- Analyse des causes
- Impact estimé
- Recommandations
- Actions correctives proposées

**Bloc Actions Analytiques**
- Actions d'analyse avancée
- Simulations
- Scénarios
- Projections

### 1.3.2. Données Chargées

**Requêtes API**
- `GET /api/analytics/submodules/{subModuleId}/analysis`
  - Données d'analyse
  - Métriques calculées
  - Agrégations
- `GET /api/analytics/submodules/{subModuleId}/deviations`
  - Dérives détectées
  - Écarts aux objectifs
- `GET /api/analytics/submodules/{subModuleId}/recommendations`
  - Recommandations IA
  - Actions suggérées

### 1.3.3. Visualisations Utilisées

- **Graphiques spécialisés** selon le type d'analyse
- **Graphiques de corrélation** : Relations entre variables
- **Graphiques de distribution** : Répartitions statistiques
- **Graphiques de comparaison** : Benchmarks
- **Tableaux croisés dynamiques** : Analyses multi-dimensionnelles

### 1.3.4. Actions Disponibles

- **Actions de Simulation**
  - Modifier des paramètres
  - Simuler des scénarios
  - Projeter des résultats

- **Actions IA**
  - Demander des insights
  - Générer des recommandations
  - Détecter des anomalies

### 1.3.5. Modales Accessibles

- **Modale "Simulation"**
  - Paramètres modifiables
  - Scénarios multiples
  - Comparaison des résultats
  - Export des simulations

- **Modale "Analyse IA"**
  - Insights générés
  - Recommandations
  - Explications
  - Actions proposées

---

## 1.4. Clic sur un Élément (Chantier, Lot, Facture, Ressource…)

### 1.4.1. Affichage Principal

**Fiche Détaillée de l'Élément**
- **Section Informations Générales**
  - Identifiant et nom
  - Statut actuel (badge)
  - Dates clés (création, début, fin prévue, fin réelle)
  - Responsable(s)
  - Localisation
  - Tags et catégories

- **Section KPIs Individuels**
  - KPIs spécifiques à l'élément
  - Valeurs actuelles vs objectifs
  - Évolutions temporelles
  - Comparaisons avec références
  - Clic sur KPI → Analyse détaillée

- **Section Données Détaillées**
  - Tableaux de données
  - Documents associés
  - Historique des modifications
  - Commentaires et notes

- **Section Analyses**
  - Analyses de performance
  - Analyses de rentabilité
  - Analyses de risques
  - Analyses de qualité

- **Section Timeline**
  - Chronologie des événements
  - Jalons importants
  - Modifications majeures
  - Alertes et incidents

- **Section Relations**
  - Éléments liés
  - Dépendances
  - Hiérarchie
  - Navigation vers éléments connexes

### 1.4.2. Données Chargées

**Requêtes API**
- `GET /api/analytics/elements/{elementId}`
  - Données complètes de l'élément
- `GET /api/analytics/elements/{elementId}/kpis`
  - KPIs de l'élément
- `GET /api/analytics/elements/{elementId}/timeline`
  - Historique et événements
- `GET /api/analytics/elements/{elementId}/relations`
  - Éléments liés

### 1.4.3. Actions Disponibles

- **Actions sur l'Élément**
  - Modifier
  - Dupliquer
  - Archiver
  - Supprimer
  - Exporter

- **Actions Analytiques**
  - Analyser en profondeur
  - Comparer avec d'autres
  - Simuler des modifications
  - Générer un rapport

- **Actions de Navigation**
  - Voir les éléments liés
  - Naviguer vers le parent
  - Naviguer vers les enfants
  - Voir dans le contexte global

### 1.4.4. Modales Accessibles

- **Modale "Détail Complet"**
  - Toutes les informations
  - Onglets organisés
  - Actions contextuelles
  - Export possible

- **Modale "Modification"**
  - Formulaire d'édition
  - Validation
  - Historique des modifications
  - Prévisualisation

- **Modale "Analyse Comparative"**
  - Sélection d'éléments à comparer
  - Critères de comparaison
  - Visualisations comparatives

---

## 1.5. Clic sur un KPI

### 1.5.1. Affichage Principal

**Modale "Analyse du KPI"**

**Onglet "Vue d'Ensemble"**
- Valeur actuelle du KPI
- Objectif et écart
- Évolution récente (graphique)
- Statut (atteint, en cours, à risque, non atteint)
- Indicateur de santé

**Onglet "Historique"**
- Graphique temporel complet
- Données historiques détaillées
- Périodes de référence
- Comparaisons inter-périodes
- Tendance calculée
- Projections

**Onglet "Comparaisons"**
- Comparaison avec autres éléments
- Comparaison avec références
- Benchmarking
- Classements
- Graphiques comparatifs

**Onglet "Causes"**
- Analyse des facteurs influençant le KPI
- Corrélations identifiées
- Facteurs positifs
- Facteurs négatifs
- Impact de chaque facteur
- Graphiques de contribution

**Onglet "Paramétrage"**
- Configuration du KPI
- Formule de calcul
- Sources de données
- Période de calcul
- Seuils d'alerte
- Fréquence de mise à jour

**Onglet "Recommandations IA"**
- Recommandations générées par IA
- Actions proposées
- Impact estimé
- Priorisation
- Plan d'action suggéré

### 1.5.2. Données Chargées

**Requêtes API**
- `GET /api/analytics/kpis/{kpiId}`
  - Données du KPI
- `GET /api/analytics/kpis/{kpiId}/history`
  - Historique complet
- `GET /api/analytics/kpis/{kpiId}/comparisons`
  - Données comparatives
- `GET /api/analytics/kpis/{kpiId}/causes`
  - Analyse des causes
- `GET /api/analytics/kpis/{kpiId}/recommendations`
  - Recommandations IA

### 1.5.3. Visualisations Utilisées

- **Graphique linéaire** : Évolution temporelle
- **Graphique en barres** : Comparaisons
- **Graphique en radar** : Performance multi-critères
- **Graphique de contribution** : Facteurs d'influence
- **Heatmap** : Corrélations
- **Graphique de distribution** : Répartition des valeurs

### 1.5.4. Actions Disponibles

- **Actions Analytiques**
  - Analyser les tendances
  - Identifier les causes
  - Comparer avec références
  - Projeter l'évolution

- **Actions de Configuration**
  - Modifier les paramètres
  - Ajuster les seuils
  - Configurer les alertes
  - Personnaliser l'affichage

- **Actions IA**
  - Générer des insights
  - Obtenir des recommandations
  - Détecter des anomalies
  - Prédire l'évolution

---

## 1.6. Clic sur une Alerte

### 1.6.1. Affichage Principal

**Modale "Détail de l'Alerte"**

**Section Informations**
- Type d'alerte
- Criticité (badge coloré)
- Titre et description
- Date de détection
- Date d'expiration (si applicable)
- Statut (active, en cours de résolution, résolue)

**Section Impact**
- Impact estimé (quantifié)
- Éléments affectés
- Coûts associés (si applicable)
- Délais impactés (si applicable)
- Risques identifiés
- Visualisation de l'impact

**Section Causes**
- Causes identifiées
- Analyse des causes racines
- Facteurs contributifs
- Graphiques de causalité
- Historique des causes similaires

**Section Actions Recommandées**
- Liste des actions proposées
- Priorisation
- Impact estimé de chaque action
- Coût estimé
- Délai de mise en œuvre
- Responsable suggéré
- Clic sur action → Modale de planification

**Section Résolution**
- Formulaire de résolution
- Actions prises
- Résultats obtenus
- Documents justificatifs
- Validation et clôture

**Section Historique**
- Timeline de l'alerte
- Événements associés
- Modifications de statut
- Commentaires et notes
- Actions entreprises

### 1.6.2. Données Chargées

**Requêtes API**
- `GET /api/analytics/alerts/{alertId}`
  - Données complètes de l'alerte
- `GET /api/analytics/alerts/{alertId}/impact`
  - Analyse d'impact
- `GET /api/analytics/alerts/{alertId}/causes`
  - Analyse des causes
- `GET /api/analytics/alerts/{alertId}/recommendations`
  - Actions recommandées
- `GET /api/analytics/alerts/{alertId}/history`
  - Historique complet

### 1.6.3. Actions Disponibles

- **Actions de Résolution**
  - Marquer comme "En cours"
  - Assigner un responsable
  - Planifier une action
  - Résoudre l'alerte
  - Reporter l'alerte

- **Actions Analytiques**
  - Analyser l'impact
  - Identifier les causes
  - Comparer avec alertes similaires
  - Générer un rapport

- **Actions Préventives**
  - Créer une règle préventive
  - Configurer une alerte préventive
  - Mettre en place un monitoring

---

## 1.7. Clic sur un Filtre

### 1.7.1. Affichage Principal

**Panel de Filtres**
- Filtres disponibles organisés par catégorie
- Filtres actifs affichés en évidence
- Compteur de résultats
- Bouton "Réinitialiser"
- Bouton "Sauvegarder la sélection"

**Mise à Jour Dynamique**
- Recalcul automatique des données
- Mise à jour des KPIs
- Actualisation des graphiques
- Rafraîchissement des tableaux
- Mise à jour des alertes affichées

**Indicateurs de Filtrage**
- Badge "X filtres actifs"
- Liste des filtres appliqués
- Possibilité de retirer individuellement
- Impact visible sur les résultats

### 1.7.2. Données Recalculées

**Requêtes API Relancées**
- Toutes les requêtes sont relancées avec les nouveaux filtres
- Cache invalidé si nécessaire
- Données recalculées côté serveur
- Agrégations mises à jour

**Recalculs Locaux**
- KPIs recalculés
- Graphiques mis à jour
- Tableaux filtrés
- Alertes filtrées

### 1.7.3. Visualisations Impactées

- Tous les graphiques sont mis à jour
- Échelles ajustées si nécessaire
- Légendes mises à jour
- Tooltips avec nouvelles données

### 1.7.4. Actions Supplémentaires

- **Actions sur les Filtres**
  - Sauvegarder la combinaison
  - Partager les filtres
  - Réinitialiser
  - Exporter avec filtres

- **Actions Analytiques**
  - Comparer avec/sans filtres
  - Analyser l'impact des filtres
  - Créer une vue personnalisée

---

## 1.8. Clic sur "Comparatif"

### 1.8.1. Affichage Principal

**Modale "Analyse Comparative"**

**Section Sélection**
- Sélection des éléments à comparer
- Critères de comparaison
- Périodes de comparaison
- Options d'affichage

**Section Matrice Comparative**
- Tableau comparatif multi-dimensions
- Colonnes : Critères de comparaison
- Lignes : Éléments comparés
- Cellules : Valeurs et indicateurs
- Tri et filtrage disponibles
- Export possible

**Section Graphiques Radar**
- Graphique radar pour chaque élément
- Comparaison visuelle
- Superposition possible
- Légende interactive

**Section Tableaux Multi-Dimensions**
- Tableaux croisés dynamiques
- Groupements multiples
- Agrégations configurables
- Drill-down disponible

**Section Actions de Comparaison**
- Exporter les résultats
- Créer un rapport comparatif
- Sauvegarder la comparaison
- Partager la comparaison

### 1.8.2. Données Chargées

**Requêtes API**
- `POST /api/analytics/comparisons`
  - Données comparatives
  - Métriques calculées
  - Agrégations

### 1.8.3. Visualisations Utilisées

- **Matrice comparative** : Tableau multi-dimensions
- **Graphiques radar** : Performance multi-critères
- **Graphiques en barres groupées** : Comparaisons directes
- **Graphiques linéaires superposés** : Évolutions comparées
- **Heatmap** : Différences visuelles

---

# 🟩 2. LOGIQUE D'ACTIONS PROPOSÉES

## 2.1. Actions Analytiques

### 2.1.1. Par Contexte

**Contexte : Domaine**
- Analyser les tendances globales
- Identifier les points critiques
- Comparer avec périodes précédentes
- Générer un rapport exécutif
- Exporter les données complètes

**Contexte : Module**
- Analyser les performances du module
- Comparer les éléments du module
- Détecter les anomalies
- Identifier les meilleures pratiques
- Générer des insights

**Contexte : Sous-Module**
- Analyser en profondeur
- Simuler des scénarios
- Projeter les tendances
- Identifier les corrélations
- Générer des recommandations

**Contexte : Élément**
- Analyser la performance individuelle
- Comparer avec références
- Identifier les points d'amélioration
- Simuler des modifications
- Générer un rapport détaillé

**Contexte : KPI**
- Analyser l'évolution
- Identifier les causes
- Comparer avec objectifs
- Projeter l'évolution
- Générer des recommandations

**Contexte : Alerte**
- Analyser l'impact
- Identifier les causes
- Comparer avec alertes similaires
- Générer un plan d'action
- Créer des règles préventives

### 2.1.2. Types d'Actions

**Analyse de Tendances**
- Calcul de tendances
- Détection de patterns
- Identification de cycles
- Projections

**Analyse Comparative**
- Comparaison multi-éléments
- Benchmarking
- Analyse de variance
- Classements

**Analyse de Causes**
- Analyse des causes racines
- Identification des facteurs
- Calcul de corrélations
- Analyse d'impact

**Détection d'Anomalies**
- Détection automatique
- Analyse des anomalies
- Classification
- Recommandations

---

## 2.2. Actions de Simulation

### 2.2.1. Simulations Disponibles

**Simulation Budgétaire**
- Modifier les budgets
- Simuler les impacts
- Comparer les scénarios
- Projeter les résultats

**Simulation de Planning**
- Modifier les délais
- Simuler les impacts
- Optimiser les ressources
- Analyser les risques

**Simulation de Ressources**
- Modifier les allocations
- Simuler les impacts
- Optimiser l'utilisation
- Analyser les contraintes

**Simulation de Coûts**
- Modifier les coûts
- Simuler les impacts
- Analyser la rentabilité
- Optimiser les marges

### 2.2.2. Modales de Simulation

**Modale "Simulation"**
- Paramètres modifiables
- Scénarios multiples
- Visualisations comparatives
- Export des résultats
- Sauvegarde des scénarios

---

## 2.3. Actions de Comparaison

### 2.3.1. Comparaisons Disponibles

**Comparaison Temporelle**
- Comparer avec période précédente
- Comparer avec année précédente
- Comparer avec moyenne
- Comparer avec objectifs

**Comparaison Multi-Éléments**
- Comparer plusieurs éléments
- Classements
- Benchmarks
- Analyses de variance

**Comparaison Multi-Dimensions**
- Comparaisons croisées
- Analyses multi-critères
- Matrices comparatives
- Visualisations radar

### 2.3.2. Modales de Comparaison

**Modale "Comparaison"**
- Sélection des éléments
- Critères de comparaison
- Visualisations comparatives
- Export des résultats

---

## 2.4. Actions de Filtrage

### 2.4.1. Filtres Disponibles

**Filtres Temporels**
- Périodes prédéfinies
- Périodes personnalisées
- Comparaisons de périodes
- Périodes glissantes

**Filtres Géographiques**
- Régions
- Départements
- Zones personnalisées
- Rayons

**Filtres Hiérarchiques**
- Arborescence complète
- Sélection multi-niveaux
- Filtres inclusifs/exclusifs

**Filtres Multi-Critères**
- Combinaisons complexes
- Opérateurs logiques
- Filtres conditionnels
- Filtres sauvegardés

### 2.4.2. Actions sur les Filtres

- Sauvegarder la combinaison
- Charger une combinaison sauvegardée
- Partager les filtres
- Réinitialiser
- Exporter avec filtres

---

## 2.5. Actions de Reporting

### 2.5.1. Types de Rapports

**Rapports Exécutifs**
- Synthèse globale
- KPIs principaux
- Tendances majeures
- Alertes critiques
- Recommandations

**Rapports Opérationnels**
- Données détaillées
- Analyses approfondies
- Tableaux complets
- Graphiques détaillés

**Rapports Personnalisés**
- Configuration libre
- Sélection des éléments
- Personnalisation des graphiques
- Mise en page personnalisée

### 2.5.2. Actions de Reporting

- Créer un rapport
- Modifier un rapport
- Dupliquer un rapport
- Programmer un rapport
- Exporter un rapport
- Partager un rapport

---

## 2.6. Actions IA

### 2.6.1. Actions IA Disponibles

**Génération d'Insights**
- Analyse automatique
- Identification de patterns
- Détection d'anomalies
- Génération d'hypothèses

**Recommandations**
- Recommandations contextuelles
- Actions proposées
- Priorisation
- Impact estimé

**Prédictions**
- Prévisions de tendances
- Prédictions de risques
- Projections de résultats
- Scénarios probables

**Optimisation**
- Suggestions d'optimisation
- Identification d'opportunités
- Recommandations d'amélioration
- Plans d'action

### 2.6.2. Modales IA

**Modale "Insights IA"**
- Insights générés
- Explications
- Visualisations
- Actions proposées

**Modale "Recommandations IA"**
- Liste des recommandations
- Priorisation
- Impact estimé
- Plan d'action

---

# 🟧 3. LOGIQUE DES MODALES

## 3.1. Modales de Détail

### 3.1.1. Modale "Détail d'Élément"
- Informations complètes
- Onglets organisés
- Actions contextuelles
- Navigation vers éléments liés
- Export possible

### 3.1.2. Modale "Détail de KPI"
- Analyse complète du KPI
- Historique
- Comparaisons
- Causes
- Recommandations

### 3.1.3. Modale "Détail d'Alerte"
- Informations complètes
- Impact
- Causes
- Actions recommandées
- Résolution

---

## 3.2. Modales d'Analyse

### 3.2.1. Modale "Analyse Avancée"
- Outils d'analyse
- Visualisations interactives
- Filtres avancés
- Export des résultats

### 3.2.2. Modale "Analyse Comparative"
- Sélection des éléments
- Critères de comparaison
- Visualisations comparatives
- Export

### 3.2.3. Modale "Analyse de Causes"
- Analyse des causes racines
- Facteurs identifiés
- Corrélations
- Graphiques de causalité

---

## 3.3. Modales de Simulation

### 3.3.1. Modale "Simulation"
- Paramètres modifiables
- Scénarios multiples
- Visualisations comparatives
- Export des résultats

### 3.3.2. Modale "Projection"
- Paramètres de projection
- Scénarios
- Visualisations projetées
- Intervalles de confiance

---

## 3.4. Modales IA

### 3.4.1. Modale "Insights IA"
- Insights générés
- Explications
- Visualisations
- Actions proposées

### 3.4.2. Modale "Recommandations IA"
- Liste des recommandations
- Priorisation
- Impact estimé
- Plan d'action

### 3.4.3. Modale "Prédictions IA"
- Prévisions générées
- Scénarios probables
- Intervalles de confiance
- Facteurs d'influence

---

## 3.5. Modales de Paramétrage

### 3.5.1. Modale "Configuration"
- Paramètres configurables
- Sauvegarde des préférences
- Personnalisation
- Export/Import de configuration

### 3.5.2. Modale "Paramétrage de KPI"
- Configuration du KPI
- Formule de calcul
- Sources de données
- Seuils d'alerte

### 3.5.3. Modale "Paramétrage d'Alerte"
- Configuration de l'alerte
- Conditions
- Seuils
- Notifications

---

# 🟥 4. LOGIQUE DES POP-UPS ET ALERTES

## 4.1. Alertes Critiques

### 4.1.1. Affichage
- Notification toast en haut à droite
- Badge rouge sur l'icône alertes
- Son d'alerte (optionnel)
- Notification push (si autorisé)
- Affichage prioritaire dans la liste

### 4.1.2. Contenu
- Titre de l'alerte
- Description courte
- Impact estimé
- Action recommandée
- Bouton "Voir détail"
- Bouton "Résoudre"

### 4.1.3. Actions
- Voir le détail → Modale d'alerte
- Résoudre → Modale de résolution
- Reporter → Modale de report
- Ignorer → Confirmation requise

---

## 4.2. Alertes Préventives

### 4.2.1. Affichage
- Notification toast (couleur orange)
- Badge orange sur l'icône alertes
- Affichage dans la liste des alertes

### 4.2.2. Contenu
- Titre de l'alerte
- Description
- Risque identifié
- Action préventive recommandée
- Délai avant impact

### 4.2.3. Actions
- Voir le détail
- Planifier une action
- Configurer une alerte préventive
- Ignorer

---

## 4.3. Alertes IA

### 4.3.1. Affichage
- Notification toast (couleur bleue)
- Badge avec icône IA
- Affichage dans la liste des alertes

### 4.3.2. Contenu
- Titre de l'alerte IA
- Description
- Confiance de la détection
- Explication de la détection
- Recommandation IA

### 4.3.3. Actions
- Voir le détail
- Voir l'explication IA
- Appliquer la recommandation
- Ignorer

---

## 4.4. Alertes Métier

### 4.4.1. Types d'Alertes Métier

**Alertes Budget**
- Dépassement de budget
- Risque de dépassement
- Écart significatif
- Budget non alloué

**Alertes Délai**
- Retard détecté
- Risque de retard
- Délai critique
- Chemin critique impacté

**Alertes QSE**
- Incident détecté
- Non-conformité
- Risque sécurité
- Risque environnemental

**Alertes Qualité**
- Non-conformité qualité
- Défaut détecté
- Risque qualité
- Action corrective requise

### 4.4.2. Affichage
- Notification selon criticité
- Badge coloré selon type
- Affichage dans la liste
- Filtrage par type disponible

---

## 4.5. Alertes Opportunités

### 4.5.1. Affichage
- Notification toast (couleur verte)
- Badge vert sur l'icône alertes
- Affichage dans la liste

### 4.5.2. Contenu
- Titre de l'opportunité
- Description
- Potentiel estimé
- Action recommandée
- Délai d'action

### 4.5.3. Actions
- Voir le détail
- Saisir l'opportunité
- Planifier une action
- Ignorer

---

# 🟪 5. LOGIQUE DES DONNÉES AFFICHÉES

## 5.1. Chargement des Données

### 5.1.1. Stratégie de Chargement
- Chargement initial : Données essentielles
- Chargement progressif : Données secondaires
- Lazy loading : Données au scroll
- Prefetching : Données anticipées

### 5.1.2. Cache et Performance
- Cache des données fréquentes
- Invalidation intelligente
- Mise à jour incrémentale
- Optimisation des requêtes

### 5.1.3. Gestion des Erreurs
- Affichage d'erreurs utilisateur
- Retry automatique
- Fallback sur données en cache
- Messages d'erreur contextuels

---

## 5.2. Filtrage des Données

### 5.2.1. Filtres Appliqués
- Filtres hérités du niveau supérieur
- Filtres spécifiques au niveau
- Filtres utilisateur
- Filtres sauvegardés

### 5.2.2. Application des Filtres
- Filtrage côté serveur (recommandé)
- Filtrage côté client (si nécessaire)
- Combinaison de filtres
- Validation des filtres

---

## 5.3. Agrégation des Données

### 5.3.1. Types d'Agrégations
- Sommes
- Moyennes
- Médianes
- Min/Max
- Comptages
- Agrégations personnalisées

### 5.3.2. Niveaux d'Agrégation
- Agrégation globale
- Agrégation par catégorie
- Agrégation temporelle
- Agrégation multi-dimensions

---

## 5.4. Visualisation des Données

### 5.4.1. Choix des Visualisations
- Type de données → Type de graphique
- Contexte métier → Visualisation adaptée
- Préférences utilisateur
- Meilleures pratiques

### 5.4.2. Personnalisation
- Couleurs configurables
- Échelles ajustables
- Légendes personnalisables
- Tooltips enrichis

---

## 5.5. Mise à Jour des Données

### 5.5.1. Mise à Jour Automatique
- Polling périodique
- WebSocket pour temps réel
- Invalidation sur événements
- Refresh manuel disponible

### 5.5.2. Indicateurs de Mise à Jour
- Badge "Mise à jour en cours"
- Timestamp de dernière mise à jour
- Indicateur de données en cache
- Bouton de refresh

---

# 🟫 6. LOGIQUE DE COHÉRENCE GLOBALE

## 6.1. Cohérence Navigation ↔ Affichage

### 6.1.1. Correspondance Parfaite
- Chaque niveau de navigation → Affichage spécifique
- Chaque module → Données et visualisations adaptées
- Chaque sous-module → Analyses spécialisées
- Navigation fluide entre niveaux

### 6.1.2. Continuité Logique
- Breadcrumb toujours visible
- Historique de navigation
- Retour arrière fonctionnel
- Contexte préservé

---

## 6.2. Cohérence Données ↔ Modules

### 6.2.1. Correspondance Métier
- Données pertinentes pour chaque module
- KPIs adaptés au contexte
- Alertes spécifiques au module
- Actions contextuelles

### 6.2.2. Cohérence Transversale
- Données partagées cohérentes
- Calculs identiques partout
- Références communes
- Synchronisation des données

---

## 6.3. Cohérence Actions ↔ Contexte

### 6.3.1. Actions Contextuelles
- Actions adaptées au contexte
- Actions disponibles selon permissions
- Actions pertinentes métier
- Actions cohérentes entre modules

### 6.3.2. Workflows Cohérents
- Flux logiques entre actions
- Validation cohérente
- Messages d'erreur contextuels
- Confirmations appropriées

---

## 6.4. Cohérence Visualisations ↔ Données

### 6.4.1. Visualisations Adaptées
- Type de graphique adapté aux données
- Échelles appropriées
- Légendes claires
- Tooltips informatifs

### 6.4.2. Cohérence Visuelle
- Style uniforme
- Couleurs cohérentes
- Interactions similaires
- Responsive design

---

## 6.5. Cohérence Métier BTP

### 6.5.1. Pertinence Métier
- Terminologie BTP
- Concepts métier corrects
- Calculs métier validés
- Workflows métier respectés

### 6.5.2. Spécificités BTP
- Gestion des chantiers
- Gestion des lots
- Gestion des sous-traitants
- Gestion QSE
- Gestion multi-agences

---

## 6.6. Validation et Tests

### 6.6.1. Validation Fonctionnelle
- Tous les clics fonctionnent
- Toutes les données s'affichent
- Toutes les actions sont disponibles
- Toutes les modales s'ouvrent

### 6.6.2. Validation Métier
- Calculs corrects
- Logique métier respectée
- Cohérence des données
- Pertinence des alertes

---

# 📋 RÉSUMÉ DES LOGIQUES PAR DOMAINE

## Domaine : Gestion de Chantiers

### Clic sur Domaine "Chantiers"
- **KPIs** : Nombre de chantiers actifs, CA total, Marge globale, Taux d'avancement moyen
- **Alertes** : Chantiers en retard, Chantiers à risque, Dérives budgétaires
- **Tendances** : Évolution du nombre de chantiers, Évolution du CA, Évolution des marges
- **Actions** : Nouveau chantier, Analyse comparative, Export, Simulation
- **Modules affichés** : Suivi de Chantiers, Analyse des Lots, Analyse Géographique, Analyse Temporelle

### Clic sur Module "Suivi de Chantiers"
- **Tableaux** : Liste des chantiers avec colonnes (Nom, Statut, Avancement, Budget, Réalisé, Marge, Responsable)
- **Cartes** : Carte par chantier avec KPIs clés
- **Timeline** : Chronologie des événements par chantier
- **Indicateurs** : Taux d'avancement, Respect des délais, Performance budgétaire
- **Alertes** : Alertes par chantier (retard, dérive budgétaire, risque)
- **Actions** : Créer chantier, Modifier, Dupliquer, Archiver, Analyser, Comparer
- **Modales** : Détail chantier, Création chantier, Analyse comparative, Simulation

### Clic sur Sous-Module "Tableau de bord chantiers"
- **Visualisations** : Graphique de répartition par statut, Graphique d'avancement global, Carte géographique
- **Analyses** : Analyse de performance globale, Détection de patterns, Identification de tendances
- **KPIs** : Nombre total, En cours, Terminés, En retard, Taux de réussite
- **Dérives** : Chantiers en dérive budgétaire, Chantiers en retard, Chantiers à risque
- **Actions** : Analyser en profondeur, Simuler des scénarios, Générer des recommandations
- **Modales** : Analyse approfondie, Simulation, Recommandations IA

### Clic sur Élément "Chantier"
- **Fiche** : Informations générales, KPIs individuels, Données détaillées, Analyses, Timeline, Relations
- **Sections** : Général, Financier, Planning, Ressources, QSE, Documents
- **KPIs** : Avancement, Budget vs Réalisé, Marge, Délai, Qualité, Sécurité
- **Actions** : Modifier, Dupliquer, Archiver, Analyser, Comparer, Exporter
- **Modales** : Détail complet, Modification, Analyse comparative, Simulation

---

## Domaine : Gestion Financière

### Clic sur Domaine "Financier"
- **KPIs** : CA total, Trésorerie, BFR, Marge globale, Dépenses totales
- **Alertes** : Trésorerie critique, Dépassement budgétaire, Retard paiement
- **Tendances** : Évolution CA, Évolution trésorerie, Évolution marges
- **Actions** : Nouvelle facture, Nouveau budget, Analyse financière, Export
- **Modules affichés** : Analyse Budgétaire, Analyse des Coûts, Analyse des Marges, Trésorerie, Facturation, Dépenses

### Clic sur Module "Analyse Budgétaire"
- **Tableaux** : Budgets par centre de coût, Écarts budgétaires, Révisions
- **Cartes** : Carte par centre de coût avec performance budgétaire
- **Timeline** : Chronologie des révisions budgétaires
- **Indicateurs** : Taux de consommation, Écarts, Performance budgétaire
- **Alertes** : Dépassements, Risques de dépassement, Budgets non alloués
- **Actions** : Créer budget, Réviser, Analyser écarts, Simuler
- **Modales** : Création budget, Révision, Analyse écarts, Simulation

### Clic sur Sous-Module "Budgets prévisionnels vs réalisés"
- **Visualisations** : Graphique comparatif budget/réalisé, Graphique d'écarts, Graphique d'évolution
- **Analyses** : Analyse des écarts, Identification des causes, Calcul de variances
- **KPIs** : Écart global, Taux de réalisation, Performance budgétaire
- **Dérives** : Centres de coût en dérive, Postes en dérive, Tendances négatives
- **Actions** : Analyser les écarts, Identifier les causes, Simuler des ajustements
- **Modales** : Analyse des écarts, Simulation budgétaire, Recommandations

---

## Domaine : Ressources Humaines

### Clic sur Domaine "RH"
- **KPIs** : Effectif total, Heures travaillées, Coûts main d'œuvre, Taux d'absentéisme, Productivité
- **Alertes** : Absentéisme élevé, Surcharge, Compétences manquantes
- **Tendances** : Évolution effectifs, Évolution coûts, Évolution productivité
- **Actions** : Nouveau personnel, Analyse RH, Export, Simulation
- **Modules affichés** : Main d'Œuvre, Absences, Compétences, Performance RH

### Clic sur Module "Analyse de la Main d'Œuvre"
- **Tableaux** : Liste du personnel, Heures par personne, Coûts par personne, Productivité
- **Cartes** : Carte par équipe avec métriques
- **Timeline** : Chronologie des affectations
- **Indicateurs** : Taux d'utilisation, Productivité, Coûts unitaires
- **Alertes** : Surcharge, Sous-utilisation, Coûts élevés
- **Actions** : Affecter, Réaffecter, Analyser, Optimiser
- **Modales** : Affectation, Analyse productivité, Optimisation

---

## Domaine : Sous-traitants

### Clic sur Domaine "Sous-traitants"
- **KPIs** : Nombre de sous-traitants, CA sous-traitance, Performance moyenne, Taux de satisfaction
- **Alertes** : Sous-traitants en retard, Performance faible, Risques contractuels
- **Tendances** : Évolution CA sous-traitance, Évolution performance, Évolution coûts
- **Actions** : Nouveau contrat, Analyse performance, Export, Simulation
- **Modules affichés** : Performance, Contrats, Risques

### Clic sur Module "Performance des Sous-traitants"
- **Tableaux** : Liste des sous-traitants, Performance par critère, Historique
- **Cartes** : Carte par sous-traitant avec évaluation
- **Timeline** : Chronologie des prestations
- **Indicateurs** : Score global, Respect délais, Qualité, Coûts
- **Alertes** : Performance faible, Retards, Non-conformités
- **Actions** : Évaluer, Renouveler contrat, Résilier, Analyser
- **Modales** : Évaluation, Analyse performance, Gestion contrat

---

## Domaine : Matériel et Équipements

### Clic sur Domaine "Matériel"
- **KPIs** : Taux d'utilisation, Coûts maintenance, Disponibilité, ROI équipements
- **Alertes** : Pannes, Maintenance due, Disponibilité faible
- **Tendances** : Évolution utilisation, Évolution coûts, Évolution disponibilité
- **Actions** : Nouvel équipement, Planification maintenance, Analyse, Export
- **Modules affichés** : Utilisation, Maintenance, Location/Achat, Stocks

### Clic sur Module "Analyse du Matériel"
- **Tableaux** : Liste des équipements, Utilisation, Coûts, Disponibilité
- **Cartes** : Carte par équipement avec métriques
- **Timeline** : Chronologie des utilisations et maintenances
- **Indicateurs** : Taux d'utilisation, Coûts d'utilisation, Disponibilité
- **Alertes** : Pannes, Maintenance due, Disponibilité faible
- **Actions** : Planifier maintenance, Réparer, Analyser, Optimiser
- **Modales** : Planification maintenance, Analyse utilisation, Optimisation

---

## Domaine : Commercial et Appels d'Offres

### Clic sur Domaine "Commercial"
- **KPIs** : Pipeline commercial, Taux de conversion, CA prévisionnel, Nombre d'appels d'offres
- **Alertes** : Opportunités à risque, Appels d'offres à répondre, Clients à risque
- **Tendances** : Évolution pipeline, Évolution conversion, Évolution CA
- **Actions** : Nouveau devis, Nouvel appel d'offres, Analyse commerciale, Export
- **Modules affichés** : Pipeline, Appels d'Offres, Clients, Marchés

### Clic sur Module "Analyse Commerciale"
- **Tableaux** : Pipeline par étape, Devis en cours, Contrats signés
- **Cartes** : Carte par opportunité avec probabilité
- **Timeline** : Chronologie des opportunités
- **Indicateurs** : Taux de conversion, Cycle de vente, CA par commercial
- **Alertes** : Opportunités à risque, Devis expirés, Clients inactifs
- **Actions** : Créer devis, Suivre opportunité, Analyser, Optimiser
- **Modales** : Création devis, Suivi opportunité, Analyse pipeline

---

## Domaine : QSE

### Clic sur Domaine "QSE"
- **KPIs** : Indicateurs qualité, Indicateurs sécurité, Indicateurs environnement, Taux d'incidents
- **Alertes** : Incidents, Non-conformités, Risques QSE
- **Tendances** : Évolution qualité, Évolution sécurité, Évolution environnement
- **Actions** : Nouvel incident, Nouvelle non-conformité, Analyse QSE, Export
- **Modules affichés** : Qualité, Sécurité, Environnement, QSE Intégré

### Clic sur Module "Analyse Qualité"
- **Tableaux** : Non-conformités, Actions correctives, Certifications
- **Cartes** : Carte par chantier avec indicateurs qualité
- **Timeline** : Chronologie des non-conformités et actions
- **Indicateurs** : Taux de non-conformité, Taux de résolution, Coûts non-qualité
- **Alertes** : Non-conformités critiques, Actions en retard, Certifications expirées
- **Actions** : Créer non-conformité, Planifier action, Analyser, Améliorer
- **Modales** : Création non-conformité, Planification action, Analyse qualité

---

## Domaine : Planification

### Clic sur Domaine "Planification"
- **KPIs** : Respect des délais, Charge de travail, Optimisation planning, Chemin critique
- **Alertes** : Retards, Surcharges, Chemin critique impacté
- **Tendances** : Évolution respect délais, Évolution charge, Évolution optimisation
- **Actions** : Nouveau planning, Optimiser, Analyser, Simuler
- **Modules affichés** : Planning, Ressources, Chemin Critique

### Clic sur Module "Analyse de Planification"
- **Tableaux** : Planning par ressource, Tâches, Jalons
- **Cartes** : Carte par ressource avec charge
- **Timeline** : Gantt interactif
- **Indicateurs** : Taux de respect délais, Charge moyenne, Optimisation
- **Alertes** : Retards, Surcharges, Conflits
- **Actions** : Modifier planning, Réallouer, Optimiser, Simuler
- **Modales** : Modification planning, Optimisation, Simulation

---

## Domaine : Multi-Agences

### Clic sur Domaine "Multi-Agences"
- **KPIs** : Performance par agence, Consolidation, Synergies, Gouvernance
- **Alertes** : Agences sous-performantes, Incohérences, Risques gouvernance
- **Tendances** : Évolution par agence, Évolution consolidation
- **Actions** : Analyse comparative, Consolidation, Export, Reporting
- **Modules affichés** : Performance Agences, Consolidation, Gouvernance

### Clic sur Module "Analyse Multi-Agences"
- **Tableaux** : Performance par agence, Comparaisons, Synergies
- **Cartes** : Carte par agence avec performance
- **Timeline** : Chronologie des performances
- **Indicateurs** : Performance relative, Synergies, Gouvernance
- **Alertes** : Agences sous-performantes, Incohérences
- **Actions** : Analyser, Comparer, Optimiser, Partager bonnes pratiques
- **Modales** : Analyse comparative, Optimisation, Partage

---

## Domaine : Performance Opérationnelle

### Clic sur Domaine "Performance"
- **KPIs** : Performance globale, Rentabilité, Efficacité, Satisfaction
- **Alertes** : Performances faibles, Risques stratégiques
- **Tendances** : Évolution performance, Évolution rentabilité
- **Actions** : Analyse stratégique, Benchmarking, Prédictions, Export
- **Modules affichés** : Tableaux de Bord Exécutifs, Analyse Prédictive, Benchmarking, Rentabilité

### Clic sur Module "Tableaux de Bord Exécutifs"
- **Tableaux** : KPIs stratégiques, Synthèse globale
- **Cartes** : Cartes exécutives avec métriques clés
- **Timeline** : Évolution stratégique
- **Indicateurs** : Performance globale, Rentabilité, Efficacité
- **Alertes** : Alertes stratégiques, Risques majeurs
- **Actions** : Analyser, Comparer, Projeter, Décider
- **Modales** : Analyse stratégique, Projections, Décisions

---

# 🎯 RÈGLES DE COHÉRENCE GLOBALE

## Règle 1 : Navigation → Affichage
Chaque clic sur un élément de navigation déclenche un affichage spécifique et cohérent avec le niveau et le contexte.

## Règle 2 : Données → Contexte
Les données affichées sont toujours pertinentes et adaptées au contexte métier BTP.

## Règle 3 : Actions → Permissions
Les actions disponibles dépendent des permissions utilisateur et du contexte.

## Règle 4 : Visualisations → Données
Le type de visualisation est toujours adapté au type de données et au contexte métier.

## Règle 5 : Alertes → Criticité
Les alertes sont affichées selon leur criticité et leur pertinence dans le contexte.

## Règle 6 : Filtres → Cohérence
Les filtres s'appliquent de manière cohérente à tous les éléments affichés.

## Règle 7 : Modales → Contexte
Les modales s'ouvrent avec le contexte approprié et les données pertinentes.

## Règle 8 : IA → Pertinence
Les recommandations et insights IA sont toujours pertinents et actionnables.

---

**Document généré : Architecture Complète des Logiques d'Affichage**  
**Version : 1.0**  
**Date : Janvier 2025**  
**Statut : ✅ Architecture complète et exhaustive**

