# Réfonte Module Calendrier & Planification

**Route :** `/maitre-ouvrage/calendrier`  
**Catégorie :** MAÎTRE D'OUVRAGE  
**Nature :** Pilotage temporel, SLA, échéances, conflits, planification  
**Date :** Janvier 2025

---

## 1) RÔLE DU MODULE

Le module "Calendrier & Planification" est un outil de **pilotage temporel transversal** dédié au maître d'ouvrage. Sa mission est de centraliser toutes les échéances provenant des autres modules opérationnels (Exécution, Projets, RH, Finance, Communication) et de fournir une vision unifiée du temps pour la prise de décision stratégique et opérationnelle.

Le module centralise les échéances, les SLA, les conflits temporels, les jalons projets, les réunions, et les absences. Il détecte automatiquement les retards, les SLA dépassés, et les conflits de planification. Il synchronise les informations temporelles de tous les modules sources sans dupliquer leur contenu métier. Il propose une planification intelligente assistée par IA pour optimiser l'utilisation du temps et des ressources.

Le module **ne remplace pas** les modules Analytics (qui fournissent des analyses détaillées), Gouvernance (qui gère la stratégie et les décisions), Centre d'alertes (qui gère les alertes opérationnelles), ni les modules d'exécution métier (Demandes, Projets, RH, Finance). Il se positionne comme un **point de convergence temporel** permettant d'accéder rapidement aux modules sources pour traiter les éléments.

**Différence avec les autres modules :**

- **Analytics BTP** : Analytics fournit des analyses détaillées, tendances, comparatifs, graphiques. Le Calendrier se concentre uniquement sur le pilotage temporel (échéances, SLA, conflits, planification) sans analyses approfondies.

- **Gouvernance** : Gouvernance gère la stratégie, les décisions, les escalades. Le Calendrier se concentre uniquement sur la dimension temporelle (quand ? combien de temps ? quels retards ? quels conflits ?).

- **Centre d'alertes** : Le Centre d'alertes gère toutes les alertes opérationnelles (risques, blocages, problèmes). Le Calendrier se concentre uniquement sur les alertes temporelles (SLA dépassés, retards, conflits de planification).

- **Exécution** : Les modules d'exécution (Demandes, Validations, Paiements) gèrent le contenu métier. Le Calendrier se contente d'afficher les échéances et de rediriger vers les modules sources pour le traitement.

- **Projets & Clients** : Le module Projets gère le contenu détaillé des projets. Le Calendrier n'affiche que les jalons critiques et les échéances, redirigeant vers le module Projets pour le détail.

- **RH & Ressources** : Le module RH gère le contenu détaillé des employés, missions, évaluations. Le Calendrier n'affiche que les absences, missions terrain, et délégations pour identifier les périodes sensibles.

- **Communication** : Le module Communication gère le contenu des échanges et réunions. Le Calendrier n'affiche que les instances et réunions planifiées, redirigeant vers le module Communication pour le détail.

---

## 2) STRUCTURE UX (ONGLETS)

Le module est structuré en **8 onglets principaux** obligatoires :

1. **Vue d'ensemble**
2. **SLA & Retards**
3. **Conflits**
4. **Échéances opérationnelles**
5. **Jalons Projets**
6. **RH & Absences**
7. **Instances & Réunions**
8. **Planification IA**

Chaque onglet regroupe des informations temporelles spécifiques, propose des KPIs synthétiques (uniquement pour le pilotage), et permet d'ouvrir les modules sources pour traiter les éléments.

---

## 3) DÉTAIL PAR ONGLET

### a) VUE D'ENSEMBLE

**Objectif :** Fournir une vision consolidée de la situation temporelle globale (jour, semaine, mois) avec les éléments nécessitant une attention immédiate.

**Sections :**

1. **KPIs synthétiques**
   - Événements aujourd'hui (nombre)
   - Événements cette semaine (nombre)
   - Retards SLA (nombre)
   - Conflits actifs (nombre)
   - Événements terminés aujourd'hui (nombre)
   - Total événements ce mois (nombre)

2. **Bloc "Alertes nécessitant attention"**
   - SLA dépassés nécessitant traitement immédiat
   - Conflits critiques non résolus
   - Échéances critiques du jour
   - Jalons projets en retard

3. **Bloc "Poste de contrôle Calendrier"**
   - Vue synthétique des modules synchronisés
   - Indicateurs de synchronisation (état, dernière mise à jour)
   - Éléments en attente de synchronisation

4. **Vue mensuelle (pilotage)**
   - Calendrier mensuel avec événements principaux
   - Vue hebdomadaire optionnelle
   - Vue journalière optionnelle
   - Navigation temporelle (précédent, suivant, aujourd'hui)

5. **Actions rapides**
   - Bouton "+ Nouvel événement" (créer événement ad hoc)
   - Bouton "Traiter SLA" (ouvrir onglet SLA & Retards)
   - Bouton "Résoudre conflits" (ouvrir onglet Conflits)
   - Bouton "Planification IA" (ouvrir onglet Planification IA)

**KPIs :** Uniquement synthétiques (nombres, pourcentages simples). Pas de graphiques complexes, pas de tendances, pas de comparatifs.

**Actions possibles :**
- Ouvrir un événement (rediriger vers module source)
- Créer un nouvel événement ad hoc
- Filtrer par période (jour, semaine, mois)
- Basculer entre vue mensuelle, hebdomadaire, journalière

---

### b) SLA & RETARDS

**Objectif :** Centraliser tous les SLA et délais provenant des modules opérationnels, identifier les retards et les SLA critiques, prioriser les actions.

**Synchronisation avec :**
- Validations (BC, Factures, Contrats, Paiements)
- Demandes
- Tickets clients
- Missions
- Contrats
- Dossiers bloqués
- Recouvrements
- Litiges

**Sections :**

1. **KPIs SLA**
   - SLA du jour (nombre)
   - SLA en retard (nombre)
   - SLA critiques (nombre)
   - % SLA respectés (pourcentage)

2. **Liste des éléments en retard**
   - Type d'élément (validation, demande, ticket, mission, etc.)
   - Module source (Demandes, Validation BC, etc.)
   - Échéance prévue
   - Retard (en jours/heures)
   - Impact (critique, majeur, mineur)
   - Statut (en cours, bloqué, à traiter)
   - Responsable

3. **Liste des SLA à traiter aujourd'hui**
   - Priorisation automatique par impact et retard
   - Filtres par module source, bureau, criticité

4. **Liste des SLA en risque (échéance proche)**
   - SLA dont l'échéance approche (configurable : 24h, 48h, 1 semaine)
   - Alerte préventive pour action rapide

**KPIs :** Nombres et pourcentages simples. Pas de graphiques temporels complexes.

**Actions possibles :**
- Traiter un SLA (ouvrir le module source avec l'élément pré-sélectionné)
- Replanifier un SLA (décaler l'échéance avec justification)
- Escalader un SLA (rediriger vers Centre d'alertes ou Gouvernance)
- Filtrer par module source, bureau, période, criticité

---

### c) CONFLITS

**Objectif :** Détecter et résoudre les conflits temporels (ressources, réunions, jalons, validations, missions).

**Types de conflits :**
- Conflits de ressources (personne assignée à plusieurs événements simultanés)
- Conflits de réunions (participant requis à plusieurs réunions simultanées)
- Conflits de jalons projets (jalons interdépendants avec dates incompatibles)
- Conflits de validations (validateur requis pour plusieurs validations simultanées)
- Conflits de missions (personne en mission terrain et réunion simultanée)

**Sections :**

1. **KPIs conflits**
   - Nombre de conflits actifs
   - Conflits critiques (nombre)
   - Délai moyen de résolution (jours)

2. **Liste des conflits**
   - Type de conflit
   - Éléments en conflit (avec liens vers modules sources)
   - Dates/heures en conflit
   - Impact (critique, majeur, mineur)
   - Suggestions de résolution (IA)

3. **Bloc "Résolution des conflits"**
   - Suggestions IA pour résoudre les conflits (déplacer, fusionner, désassigner)
   - Analyse charge/disponibilité pour proposer des créneaux alternatifs
   - Simulation d'impact temporel avant résolution

**KPIs :** Nombres et délais moyens. Pas d'analyses statistiques complexes.

**Actions possibles :**
- Déplacer un événement (replanifier avec nouveau créneau suggéré)
- Fusionner des événements (si compatible)
- Désassigner une ressource (retirer l'assignation d'un événement)
- Arbitrer un conflit (rediriger vers module Gouvernance pour arbitrage)
- Accepter une suggestion IA (appliquer automatiquement la résolution proposée)

---

### d) ÉCHÉANCES OPÉRATIONNELLES

**Objectif :** Centraliser toutes les échéances provenant des modules d'exécution et afficher une vue unifiée (liste + calendrier).

**Centralisation des échéances issues de :**
- Demandes
- Validation BC
- Validation Factures
- Validation Contrats
- Validation Paiements
- Dossiers bloqués
- Substitution
- Arbitrages & Goulots
- Tickets clients
- Recouvrements
- Litiges

**Sections :**

1. **Vue liste**
   - Liste chronologique des échéances
   - Colonnes : date, type, module source, élément, statut, responsable
   - Tri par date, module, statut
   - Filtres multiples (module, bureau, criticité, période)

2. **Vue calendrier**
   - Calendrier mensuel avec échéances positionnées
   - Navigation temporelle
   - Légende par type/module
   - Zoom jour/semaine/mois

3. **Filtres**
   - Par module source (Demandes, Validation BC, etc.)
   - Par bureau
   - Par criticité (critique, majeur, mineur)
   - Par période (aujourd'hui, cette semaine, ce mois, personnalisé)
   - Par statut (à traiter, en cours, terminé, en retard)

**KPIs :** Nombre d'échéances par période. Pas de graphiques temporels complexes.

**Actions possibles :**
- Ouvrir module source (rediriger vers le module avec l'élément pré-sélectionné)
- Replanifier une échéance (décaler avec justification)
- Marquer comme traité (mise à jour du statut)
- Filtrer et exporter la liste (pour reporting externe)

---

### e) JALONS PROJETS

**Objectif :** Afficher les jalons critiques, en retard, et du mois provenant du module Projets en cours.

**Synchronisation avec :** Module Projets en cours v3.0

**Sections :**

1. **KPIs jalons**
   - Nombre de jalons du mois (nombre)
   - % jalons à l'heure (pourcentage)
   - Nombre de jalons en retard (nombre)

2. **Jalons critiques**
   - Jalons avec impact critique sur le projet
   - Jalons bloquants pour d'autres jalons
   - Jalons avec enjeu client/contractuel

3. **Jalons en retard**
   - Liste des jalons dont la date est dépassée
   - Retard en jours
   - Impact sur le projet

4. **Jalons du mois**
   - Tous les jalons prévus pour le mois en cours
   - Vue chronologique
   - Filtres par projet, bureau, criticité

**KPIs :** Nombres et pourcentages. Pas d'analyses de performance projet.

**Actions possibles :**
- Ouvrir projet (rediriger vers module Projets avec le projet pré-sélectionné)
- Replanifier un jalon (décaler la date avec justification)
- Notifier l'équipe projet (notification depuis le Calendrier)

---

### f) RH & ABSENCES

**Objectif :** Afficher les absences, missions terrain, et délégations pour identifier les périodes sensibles et les surcharges.

**Synchronisation avec :**
- Module Employés
- Module Missions
- Module Congés (via RH)
- Module Délégations

**Sections :**

1. **Absences du jour / à venir**
   - Liste des absences (congés, arrêts maladie, formations)
   - Impact sur les validations, réunions, missions
   - Périodes sensibles identifiées

2. **Missions terrain**
   - Missions en cours et à venir
   - Personnes en mission terrain
   - Impact sur disponibilité pour réunions/validations

3. **Délégations actives**
   - Délégations actives (qui remplace qui, période)
   - Impact sur les validations et décisions

4. **Surcharges identifiées**
   - Périodes avec beaucoup d'absences simultanées
   - Personnes surchargées (nombre d'événements simultanés)
   - Alertes préventives

**KPIs :** Nombre d'absences, nombre de missions. Pas d'analyses RH détaillées.

**Actions possibles :**
- Replanifier une mission (rediriger vers module Missions)
- Ajuster une délégation (rediriger vers module Délégations)
- Voir détail employé (rediriger vers module Employés)
- Filtrer par bureau, période, type d'absence

---

### g) INSTANCES & RÉUNIONS

**Objectif :** Afficher les conférences critiques, réunions projet, et instances de crise provenant du module Communication.

**Synchronisation avec :**
- Module Conférences décisionnelles
- Module Échanges structurés
- Module Messages externes

**Sections :**

1. **Conférences critiques**
   - Conférences décisionnelles importantes
   - Réunions de direction
   - Instances de crise
   - Participants requis

2. **Réunions projet**
   - Réunions de revue projet
   - Points d'étape
   - Réunions techniques

3. **Instances en retard**
   - Réunions dont la date est dépassée (non tenues)
   - Conférences reportées
   - Instances à replanifier

**KPIs :** Nombre de réunions du jour/semaine. Pas d'analyses de participation.

**Actions possibles :**
- Convoquer une réunion (rediriger vers module Communication)
- Replanifier une réunion (décaler la date avec notification participants)
- Notifier les participants (notification depuis le Calendrier)
- Voir détail réunion (rediriger vers module Communication)

---

### h) PLANIFICATION IA

**Objectif :** Proposer une planification intelligente assistée par IA pour optimiser l'utilisation du temps et des ressources.

**Fonctionnalités :**

1. **Détection automatique des conflits**
   - Analyse continue des conflits potentiels
   - Alertes préventives avant que le conflit ne survienne

2. **Suggestions de créneaux optimaux**
   - Pour nouvelles réunions (en fonction des disponibilités)
   - Pour replanification d'événements
   - Pour nouvelles missions

3. **Analyse charge / disponibilité**
   - Charge de travail par personne
   - Disponibilité réelle (hors absences, missions)
   - Identification des surcharges

4. **Propositions de regroupements**
   - Regrouper des réunions similaires
   - Optimiser les déplacements (missions terrain)
   - Réduire les allers-retours

5. **Recommandations pour réduire retards**
   - Priorisation intelligente des tâches
   - Suggestions de réallocation
   - Optimisation des délais

6. **Simulation d'impact temporel**
   - Avant replanification : simuler l'impact sur autres événements
   - Avant nouvelle affectation : vérifier disponibilité
   - Scénarios "what-if"

**KPIs :** Nombre de suggestions, % suggestions acceptées. Pas d'analyses prédictives complexes.

**Actions possibles :**
- Accepter une suggestion (appliquer automatiquement la planification proposée)
- Ignorer une suggestion (masquer la suggestion)
- Ajuster une suggestion (modifier manuellement avant application)
- Voir justification IA (expliquer pourquoi cette suggestion)

---

## 4) RÈGLES DE NON-REDONDANCE

### Ce que le Calendrier NE fait PAS

Le module Calendrier **ne doit pas** :

1. **Afficher des analyses détaillées**
   - Pas de graphiques temporels complexes (tendances, comparatifs)
   - Pas d'analyses statistiques approfondies
   - Pas de drill-down analytique
   - → Analytics BTP le fait déjà

2. **Refaire les écrans métiers**
   - Pas d'écran de gestion de demandes
   - Pas d'écran de validation BC/Factures/Contrats/Paiements
   - Pas d'écran de gestion de projets détaillé
   - Pas d'écran de gestion RH détaillé
   - Pas d'écran de gestion finance détaillé
   - → Les modules d'exécution le font déjà

3. **Refaire le Centre d'alertes**
   - Pas de gestion d'alertes opérationnelles complètes
   - Pas d'alertes de risques, blocages, problèmes métier
   - → Centre d'alertes le fait déjà

4. **Refaire le module Gouvernance**
   - Pas de gestion de stratégie et décisions
   - Pas d'escalades et arbitrages stratégiques
   - → Gouvernance le fait déjà

5. **Refaire le Registre Décisions**
   - Pas de gestion des décisions prises
   - Pas d'historique décisionnel
   - → Module Système / Décisions le fait déjà

6. **Afficher des tendances, comparatifs, graphiques analytiques**
   - Pas de graphiques d'évolution temporelle
   - Pas de comparatifs période vs période
   - Pas d'insights analytiques
   - → Analytics BTP le fait déjà

7. **Gérer le contenu métier**
   - Pas de création/modification de demandes
   - Pas de validation de BC/Factures/Contrats/Paiements
   - Pas de gestion de projets
   - Pas de gestion RH
   - → Juste les échéances et redirections vers modules sources

### Ce que le Calendrier FAIT exactement

Le module Calendrier **fait uniquement** :

1. **Centraliser les échéances**
   - Agrège les échéances de tous les modules
   - Affiche une vue unifiée temporelle
   - Synchronise automatiquement avec les modules sources

2. **Détecter les problèmes temporels**
   - Retards (SLA dépassés, jalons en retard)
   - Conflits (ressources, réunions, validations)
   - Surcharges (charge/disponibilité)

3. **Afficher les événements critiques**
   - Événements du jour/semaine/mois
   - Éléments nécessitant attention immédiate
   - Vue mensuelle/hebdomadaire/journalière

4. **Synchroniser les jalons projets**
   - Jalons critiques, en retard, du mois
   - Redirection vers module Projets

5. **Proposer une planification intelligente**
   - Suggestions IA pour optimiser
   - Détection automatique de conflits
   - Analyse charge/disponibilité

6. **Permettre d'ouvrir les modules sources**
   - Redirection vers modules sources avec pré-sélection
   - Pas de gestion métier dans le Calendrier

### Pourquoi le Calendrier n'est pas un module Analytics

Le Calendrier se concentre sur le **pilotage temporel opérationnel** (quand ? combien de temps ? quels retards ?) alors qu'Analytics se concentre sur l'**analyse approfondie** (pourquoi ? comment ? tendances ? performance ?).

- **Calendrier** : Vue temporelle synthétique, échéances, SLA, conflits, planification
- **Analytics** : Analyses détaillées, tendances, comparatifs, graphiques, insights

Le Calendrier utilise des **KPIs synthétiques** (nombres, pourcentages simples) pour le pilotage, alors qu'Analytics utilise des **analyses complexes** (graphiques temporels, drill-down, statistiques).

### Pourquoi le Calendrier n'est pas un module opérationnel

Le Calendrier **ne gère pas le contenu métier** (demandes, validations, projets, RH, finance). Il se contente d'**afficher les échéances** et de **rediriger vers les modules sources** pour le traitement.

- **Calendrier** : Affichage échéances, détection problèmes temporels, planification
- **Modules opérationnels** : Gestion complète du contenu métier (CRUD, workflows, validation)

Le Calendrier est un **point de convergence temporel** qui permet d'accéder rapidement aux modules sources, mais ne les remplace pas.

### Pourquoi le Calendrier doit rester dans maitre-ouvrage/calendrier

Le Calendrier est un module **transversal** qui centralise les échéances de **tous** les modules (Exécution, Projets, RH, Finance, Communication). Il n'appartient à aucun module métier spécifique.

Le Calendrier est un outil de **pilotage maître d'ouvrage** qui permet de :
- Avoir une vision globale temporelle
- Détecter les problèmes transversaux (conflits, retards)
- Planifier de manière optimale

Il doit donc rester au niveau **maitre-ouvrage** pour être accessible depuis tous les modules et servir de point de convergence temporel.

---

## RÉSUMÉ

Le module "Calendrier & Planification" est un **outil de pilotage temporel transversal** qui centralise les échéances, détecte les retards et conflits, et propose une planification intelligente. Il se positionne comme un **point de convergence temporel** permettant d'accéder rapidement aux modules sources (Exécution, Projets, RH, Finance, Communication) sans dupliquer leur contenu métier.

Le module ne fait **pas** d'analytics détaillé, **pas** d'exécution métier, **pas** de gestion d'alertes complète, **pas** de gouvernance stratégique. Il fait **uniquement** du pilotage temporel (échéances, SLA, conflits, planification) avec redirection vers les modules sources pour le traitement.

**Route :** `/maitre-ouvrage/calendrier`  
**8 onglets obligatoires :** Vue d'ensemble, SLA & Retards, Conflits, Échéances opérationnelles, Jalons Projets, RH & Absences, Instances & Réunions, Planification IA

