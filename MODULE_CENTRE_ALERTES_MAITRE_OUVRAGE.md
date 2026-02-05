# Module Centre d'Alertes - Maître d'Ouvrage

**Route fonctionnelle :** `maitre-ouvrage/centre-alertes`  
**Catégorie :** MAÎTRE D'OUVRAGE  
**Nature :** Supervision transversale des alertes, risques, anomalies  
**Version :** 1.0  
**Date :** Janvier 2025

---

## 1) RÔLE DU MODULE

Le module **Centre d'Alertes** est le poste de supervision transversale dédié au maître d'ouvrage pour centraliser, classifier et gérer toutes les alertes provenant de l'ensemble des modules opérationnels de l'ERP BTP Yessalate BMO. Sa mission est de fournir une vue consolidée des risques opérationnels en temps réel, de détecter les alertes critiques et bloquantes, et de permettre leur traitement coordonné via filtrage, priorisation, escalade et assignation.

**Mission de supervision :**
Le module centralise toutes les alertes opérationnelles (critiques, urgentes, bloquantes) provenant des modules Exécution (Demandes, Validations, Paiements, Dossiers bloqués, Substitution, Arbitrages), Projets & Clients (Tickets, Retards projets, Non-conformités chantier), RH & Ressources (Absences critiques, Missions bloquées, Évaluations en retard), Finance & Contentieux (Recouvrements, Impayés, Anomalies financières, Litiges), Communication (Échanges critiques, Messages externes urgents), Système (Audit, Logs, Observabilité, IA), et Calendrier (SLA dépassés, SLA en risque). Il permet de classifier les alertes par criticité, origine, impact, de filtrer et prioriser, d'escalader vers la Gouvernance si nécessaire, d'assigner des responsables, et d'ouvrir les modules sources pour traitement.

**Ce qu'il centralise :**
Le module agrège exclusivement les alertes opérationnelles : alertes critiques (paiements bloqués, validations bloquées, dossiers bloqués, arbitrages critiques, tickets critiques, litiges à haut risque, incidents QSE, incidents système), alertes opérationnelles (demandes, BC/Factures, contrats, paiements, substitution), alertes SLA & délais (SLA dépassés, SLA en risque, SLA du jour), alertes financières (recouvrements, impayés, dépassements budgétaires, anomalies financières), alertes RH & ressources (absences critiques, missions bloquées, évaluations en retard, délégations expirées), alertes projets & chantiers (retards projets, non-conformités chantier, risques techniques, incidents QSE), et alertes système & sécurité (audit & conformité, logs système, observabilité & sécurité, IA).

**Ce qu'il ne fait pas :**
Le module ne traite pas les éléments métier (pas d'exécution de demandes, pas de validation de BC/Factures/Contrats/Paiements, pas de gestion de tickets, missions, ou demandes RH). Il n'affiche pas d'analyses détaillées (pas de tendances, comparatifs, graphiques analytiques, pas d'insights analytiques). Il ne remplace pas le module Analytics BTP (qui fournit des analyses détaillées par domaine), le module Gouvernance (qui gère les décisions stratégiques et escalades critiques pour la direction), le Calendrier (qui gère SLA, retards, conflits avec vue calendaire), ni les modules opérationnels (Demandes, Validations, Projets, RH, Finance, Litiges qui gèrent l'exécution complète).

**Différence avec les autres modules :**
- **Gouvernance** : La Gouvernance gère les décisions stratégiques et agrège uniquement les escalades critiques issues du Centre d'alertes pour la direction. Le Centre d'alertes gère toutes les alertes opérationnelles avec workflow complet (acquittement, résolution, escalade, assignation).
- **Calendrier** : Le Calendrier gère les SLA, retards, conflits, échéances avec vue calendaire. Le Centre d'alertes affiche uniquement les alertes SLA dépassés et en risque pour supervision.
- **Analytics BTP** : Le module Analytics fournit des analyses détaillées avec drill-down par domaine. Le Centre d'alertes affiche uniquement les alertes opérationnelles sans analyses détaillées.
- **Modules opérationnels** : Les modules Exécution, Projets, RH, Finance gèrent l'opérationnel complet. Le Centre d'alertes centralise uniquement les alertes issues de ces modules pour supervision transversale.
- **Registre Décisions** : Le Registre Décisions (module Système) trace toutes les décisions. Le Centre d'alertes peut créer des alertes liées à des décisions en attente mais ne gère pas les décisions elles-mêmes.

---

## 2) STRUCTURE UX (ONGLETS)

Le module `maitre-ouvrage/centre-alertes` est structuré en **9 onglets obligatoires** :

### Onglet 1 : Vue d'ensemble
**Objectif :** Tableau de bord consolidé offrant une vision d'ensemble immédiate de toutes les alertes actives et leur état global.

**Sections :**
- KPIs synthétiques (8 indicateurs clés)
- Bloc "Alertes critiques" (liste des alertes critiques prioritaires)
- Bloc "Alertes urgentes" (liste des alertes urgentes)
- Bloc "Alertes par domaine" (répartition par module source)
- Actions rapides (traiter maintenant, escalader, filtrer)

**KPIs :**
- Critiques (nombre d'alertes critiques actives)
- Avertissements (nombre d'alertes avertissement actives)
- SLA dépassés (nombre d'alertes avec SLA dépassé)
- Bloqués (nombre d'alertes bloquantes)
- Acquittées (nombre d'alertes acquittées aujourd'hui)
- Résolues (nombre d'alertes résolues aujourd'hui)
- Temps réponse (temps moyen de réponse aux alertes)
- Temps résolution (temps moyen de résolution des alertes)

**Actions possibles :**
- Traiter maintenant (ouvrir modale de traitement rapide)
- Escalader (escalader vers Gouvernance ou direction)
- Filtrer (appliquer filtres rapides)

---

### Onglet 2 : Alertes critiques
**Objectif :** Centraliser toutes les alertes critiques nécessitant une intervention immédiate.

**Sections :**
- Alertes provenant de Paiements bloqués
- Alertes provenant de Validations bloquées
- Alertes provenant de Dossiers bloqués
- Alertes provenant d'Arbitrages critiques
- Alertes provenant de Tickets critiques
- Alertes provenant de Litiges à haut risque
- Alertes provenant d'Incidents QSE
- Alertes provenant d'Incidents système

**KPIs :**
- Nombre critiques (nombre total d'alertes critiques actives)
- Durée moyenne (temps moyen depuis création)
- Impact financier (montant total impacté)

**Actions possibles :**
- Traiter (ouvrir modale de traitement)
- Escalader DG (escalader vers Direction Générale)
- Ouvrir module source (navigation vers module d'origine)

---

### Onglet 3 : Alertes opérationnelles
**Objectif :** Centraliser les alertes issues des processus opérationnels quotidiens.

**Sections :**
- Alertes issues de Demandes
- Alertes issues de BC/Factures
- Alertes issues de Contrats
- Alertes issues de Paiements
- Alertes issues de Substitution

**KPIs :**
- En attente (nombre d'alertes en attente)
- Urgentes (nombre d'alertes urgentes)
- Bloquées (nombre d'alertes bloquantes)

**Actions possibles :**
- Ouvrir (navigation vers module source)
- Assigner (assigner responsable)
- Acquitter (acquitter l'alerte)

---

### Onglet 4 : Alertes SLA & délais
**Objectif :** Synchroniser avec le Calendrier et afficher les alertes liées aux SLA et délais.

**Sections :**
- SLA dépassés (alertes avec SLA dépassé)
- SLA en risque (alertes avec SLA en risque de dépassement)
- SLA du jour (alertes avec SLA échéant aujourd'hui)

**KPIs :**
- % SLA respectés (pourcentage de SLA respectés)
- Nombre SLA critiques (nombre de SLA critiques)

**Actions possibles :**
- Traiter (ouvrir modale de traitement)
- Replanifier (replanifier échéance)
- Escalader (escalader vers responsable)

---

### Onglet 5 : Alertes financières
**Objectif :** Centraliser les alertes issues du domaine Finance & Contentieux.

**Sections :**
- Alertes issues de Recouvrements
- Alertes issues d'Impayés
- Alertes issues de Dépassements budgétaires
- Alertes issues d'Anomalies financières

**KPIs :**
- Montant total (montant total des alertes financières)
- Montant critique (montant des alertes critiques)
- Nombre alertes (nombre total d'alertes financières)

**Actions possibles :**
- Ouvrir finance (navigation vers module Finance)
- Escalader (escalader vers responsable)
- Notifier (notifier responsable)

---

### Onglet 6 : Alertes RH & ressources
**Objectif :** Centraliser les alertes issues du domaine RH & Ressources.

**Sections :**
- Alertes issues d'Absences critiques
- Alertes issues de Missions bloquées
- Alertes issues d'Évaluations en retard
- Alertes issues de Délégations expirées

**KPIs :**
- Nombre alertes RH (nombre total d'alertes RH)
- Criticité (niveau de criticité moyen)

**Actions possibles :**
- Ouvrir RH (navigation vers module RH)
- Replanifier (replanifier mission/évaluation)
- Assigner (assigner responsable)

---

### Onglet 7 : Alertes projets & chantiers
**Objectif :** Centraliser les alertes issues du domaine Projets & Clients.

**Sections :**
- Alertes issues de Retards projets
- Alertes issues de Non-conformités chantier
- Alertes issues de Risques techniques
- Alertes issues d'Incidents QSE

**KPIs :**
- Nombre alertes projet (nombre total d'alertes projet)
- Nombre chantiers impactés (nombre de chantiers avec alertes)

**Actions possibles :**
- Ouvrir projet (navigation vers module Projets)
- Notifier équipe (notifier équipe projet)
- Escalader (escalader vers responsable)

---

### Onglet 8 : Alertes système & sécurité
**Objectif :** Centraliser les alertes issues du domaine Système & Sécurité.

**Sections :**
- Alertes issues d'Audit & conformité
- Alertes issues de Logs système
- Alertes issues d'Observabilité & sécurité
- Alertes issues d'IA (anomalies détectées)

**KPIs :**
- Nombre alertes sécurité (nombre total d'alertes sécurité)
- Criticité (niveau de criticité moyen)
- Incidents (nombre d'incidents actifs)

**Actions possibles :**
- Ouvrir audit (navigation vers module Audit)
- Ouvrir logs (navigation vers module Logs)
- Escalader (escalader vers responsable sécurité)

---

### Onglet 9 : Historique & traçabilité
**Objectif :** Fournir l'historique complet des alertes et permettre leur consultation avec filtres avancés.

**Sections :**
- Historique complet des alertes (toutes les alertes passées)
- Filtres avancés (date, criticité, module, bureau)
- Recherche (recherche textuelle dans les alertes)

**KPIs :**
- Aucun KPI (onglet historique uniquement)

**Actions possibles :**
- Exporter (exporter historique)
- Filtrer (appliquer filtres avancés)
- Rechercher (recherche textuelle)

---

## 3) DÉTAIL PAR ONGLET

### a) VUE D'ENSEMBLE

**Objectif :** Tableau de bord consolidé offrant une vision d'ensemble immédiate de toutes les alertes actives et leur état global.

#### KPIs synthétiques

Affichage de 8 indicateurs clés en temps réel :

1. **Critiques**
   - Nombre d'alertes critiques actives
   - Indicateur visuel (rouge si > seuil)

2. **Avertissements**
   - Nombre d'alertes avertissement actives
   - Indicateur visuel (orange si > seuil)

3. **SLA dépassés**
   - Nombre d'alertes avec SLA dépassé
   - Indicateur visuel (rouge)

4. **Bloqués**
   - Nombre d'alertes bloquantes
   - Indicateur visuel (rouge)

5. **Acquittées**
   - Nombre d'alertes acquittées aujourd'hui
   - Indicateur visuel (vert)

6. **Résolues**
   - Nombre d'alertes résolues aujourd'hui
   - Indicateur visuel (vert)

7. **Temps réponse**
   - Temps moyen de réponse aux alertes (en heures)
   - Indicateur visuel (vert si < SLA, orange si proche, rouge si > SLA)

8. **Temps résolution**
   - Temps moyen de résolution des alertes (en heures)
   - Indicateur visuel (vert si < SLA, orange si proche, rouge si > SLA)

#### Bloc "Alertes critiques"

Liste des alertes critiques prioritaires :
- Affichage des 10 alertes critiques les plus urgentes
- Colonnes : module source, type, description, criticité, date création, durée, actions
- Actions rapides : traiter, escalader, ouvrir module source
- Tri par défaut : criticité décroissante, puis date création croissante

#### Bloc "Alertes urgentes"

Liste des alertes urgentes :
- Affichage des 10 alertes urgentes (non critiques mais nécessitant attention)
- Colonnes : module source, type, description, criticité, date création, durée, actions
- Actions rapides : traiter, assigner, acquitter
- Tri par défaut : date création croissante

#### Bloc "Alertes par domaine"

Répartition des alertes par module source :
- Graphique synthétique (camembert ou barres horizontales) montrant la répartition
- Modules affichés : Exécution, Projets, RH, Finance, Communication, Système, Calendrier
- Clic sur un module : filtre automatique vers l'onglet correspondant
- Affichage du nombre d'alertes par module

#### Actions rapides

Boutons d'action contextuels :
- **Traiter maintenant** : Ouverture d'une modale de traitement rapide pour les alertes sélectionnées
- **Escalader** : Escalade des alertes sélectionnées vers la Gouvernance ou la direction
- **Filtrer** : Ouverture d'un panneau de filtres rapides (criticité, module, période)

---

### b) ALERTES CRITIQUES

**Objectif :** Centraliser toutes les alertes critiques nécessitant une intervention immédiate.

#### Sources d'alertes critiques

Alertes provenant de :

1. **Paiements bloqués**
   - Paiements bloqués nécessitant une intervention
   - Montant bloqué affiché
   - Actions : ouvrir paiement, débloquer, escalader

2. **Validations bloquées**
   - Validations bloquées (BC, Factures, Contrats) nécessitant une intervention
   - Montant bloqué affiché
   - Actions : ouvrir validation, débloquer, escalader

3. **Dossiers bloqués**
   - Dossiers bloqués nécessitant un arbitrage
   - Impact financier affiché
   - Actions : ouvrir dossier, débloquer, escalader

4. **Arbitrages critiques**
   - Arbitrages nécessitant une décision urgente
   - Impact financier/opérationnel affiché
   - Actions : ouvrir arbitrage, traiter, escalader DG

5. **Tickets critiques**
   - Tickets clients critiques non résolus
   - Impact réputationnel affiché
   - Actions : ouvrir ticket, traiter, escalader

6. **Litiges à haut risque**
   - Litiges avec enjeu financier ou réputationnel majeur
   - Enjeu financier affiché
   - Actions : ouvrir litige, traiter, escalader DG

7. **Incidents QSE**
   - Incidents Qualité, Sécurité, Environnement majeurs
   - Gravité affichée
   - Actions : ouvrir incident, traiter, escalader

8. **Incidents système**
   - Incidents système critiques (pannes, sécurité)
   - Impact affiché
   - Actions : ouvrir incident, traiter, escalader

#### KPIs d'alertes critiques

- **Nombre critiques** : Nombre total d'alertes critiques actives
- **Durée moyenne** : Temps moyen depuis création (en heures)
- **Impact financier** : Montant total impacté par les alertes critiques

#### Affichage des alertes critiques

Tableau avec colonnes :
- Module source (icône + nom)
- Type d'alerte
- Description / Objet
- Criticité (badge visuel)
- Date création
- Durée (temps depuis création)
- Impact (financier, opérationnel, réputationnel)
- Statut
- Actions

Filtres disponibles :
- Module source
- Type d'alerte
- Criticité
- Statut
- Période

#### Actions disponibles

- **Traiter** : Ouvrir la modale de traitement d'alerte
- **Escalader DG** : Escalader vers la Direction Générale
- **Ouvrir module source** : Navigation vers le module d'origine pour contexte complet
- **Assigner** : Assigner un responsable pour traitement
- **Acquitter** : Acquitter l'alerte (marquer comme prise en compte)
- **Ajouter commentaire** : Ajouter un commentaire à l'alerte

---

### c) ALERTES OPÉRATIONNELLES

**Objectif :** Centraliser les alertes issues des processus opérationnels quotidiens.

#### Sources d'alertes opérationnelles

Alertes issues de :

1. **Demandes**
   - Demandes en attente > SLA
   - Demandes bloquées
   - Demandes nécessitant une action
   - Actions : ouvrir demande, traiter, assigner

2. **BC/Factures**
   - BC/Factures en attente de validation > SLA
   - BC/Factures bloquées
   - BC/Factures avec anomalies
   - Actions : ouvrir BC/Facture, valider, rejeter

3. **Contrats**
   - Contrats en attente de validation > SLA
   - Contrats bloqués
   - Contrats avec clauses à revoir
   - Actions : ouvrir contrat, valider, rejeter

4. **Paiements**
   - Paiements en attente > SLA
   - Paiements bloqués
   - Paiements avec anomalies
   - Actions : ouvrir paiement, valider, rejeter

5. **Substitution**
   - Substitutions en attente
   - Conflits de délégation
   - Substitutions nécessitant une validation
   - Actions : ouvrir substitution, valider, rejeter

#### KPIs d'alertes opérationnelles

- **En attente** : Nombre d'alertes en attente de traitement
- **Urgentes** : Nombre d'alertes urgentes
- **Bloquées** : Nombre d'alertes bloquantes

#### Affichage des alertes opérationnelles

Tableau avec colonnes :
- Module source (icône + nom)
- Type d'alerte
- Description / Objet
- Criticité (badge visuel)
- Date création
- Durée (temps depuis création)
- Statut
- Actions

Filtres disponibles :
- Module source
- Type d'alerte
- Criticité
- Statut
- Période

#### Actions disponibles

- **Ouvrir** : Navigation vers le module source pour traitement
- **Assigner** : Assigner un responsable pour traitement
- **Acquitter** : Acquitter l'alerte (marquer comme prise en compte)
- **Traiter** : Ouvrir la modale de traitement d'alerte
- **Escalader** : Escalader vers responsable supérieur
- **Ajouter commentaire** : Ajouter un commentaire à l'alerte

---

### d) ALERTES SLA & DÉLAIS

**Objectif :** Synchroniser avec le Calendrier et afficher les alertes liées aux SLA et délais.

#### Synchronisation avec Calendrier

Le module Centre d'alertes se synchronise avec le module Calendrier pour afficher :
- Les SLA dépassés (alertes avec SLA dépassé)
- Les SLA en risque (alertes avec SLA en risque de dépassement dans les 24h)
- Les SLA du jour (alertes avec SLA échéant aujourd'hui)

#### SLA dépassés

Alertes avec SLA dépassé :
- Affichage du temps de dépassement
- Impact du dépassement (financier, opérationnel)
- Actions : traiter, replanifier, escalader

#### SLA en risque

Alertes avec SLA en risque de dépassement :
- Affichage du temps restant avant dépassement
- Actions préventives : traiter, replanifier, notifier

#### SLA du jour

Alertes avec SLA échéant aujourd'hui :
- Affichage de l'heure d'échéance
- Actions : traiter, replanifier, notifier

#### KPIs SLA & délais

- **% SLA respectés** : Pourcentage de SLA respectés (calculé sur période)
- **Nombre SLA critiques** : Nombre de SLA critiques (dépassés ou en risque)

#### Affichage des alertes SLA

Tableau avec colonnes :
- Module source (icône + nom)
- Type d'alerte
- Description / Objet
- SLA (date/heure échéance)
- Statut (dépassé, en risque, du jour)
- Temps restant / dépassement
- Actions

Filtres disponibles :
- Module source
- Statut SLA (dépassé, en risque, du jour)
- Période

#### Actions disponibles

- **Traiter** : Ouvrir la modale de traitement d'alerte
- **Replanifier** : Replanifier l'échéance SLA
- **Escalader** : Escalader vers responsable
- **Notifier** : Notifier le responsable du SLA
- **Ouvrir calendrier** : Navigation vers le Calendrier pour contexte complet

---

### e) ALERTES FINANCIÈRES

**Objectif :** Centraliser les alertes issues du domaine Finance & Contentieux.

#### Sources d'alertes financières

Alertes issues de :

1. **Recouvrements**
   - Recouvrements en retard
   - Recouvrements à risque
   - Montant en jeu affiché
   - Actions : ouvrir recouvrement, traiter, notifier

2. **Impayés**
   - Impayés critiques
   - Impayés anciens
   - Montant impayé affiché
   - Actions : ouvrir impayé, traiter, escalader

3. **Dépassements budgétaires**
   - Dépassements budgétaires projets
   - Dépassements budgétaires opérationnels
   - Montant dépassement affiché
   - Actions : ouvrir projet/finance, traiter, escalader

4. **Anomalies financières**
   - Anomalies détectées dans les données financières
   - Anomalies de facturation
   - Impact financier affiché
   - Actions : ouvrir finance, traiter, escalader

#### KPIs d'alertes financières

- **Montant total** : Montant total des alertes financières (en euros)
- **Montant critique** : Montant des alertes critiques (en euros)
- **Nombre alertes** : Nombre total d'alertes financières actives

#### Affichage des alertes financières

Tableau avec colonnes :
- Module source (icône + nom)
- Type d'alerte
- Description / Objet
- Montant (en euros)
- Criticité (badge visuel)
- Date création
- Durée (temps depuis création)
- Statut
- Actions

Filtres disponibles :
- Module source
- Type d'alerte
- Criticité
- Montant (seuil min/max)
- Statut
- Période

#### Actions disponibles

- **Ouvrir finance** : Navigation vers le module Finance pour traitement
- **Escalader** : Escalader vers responsable financier
- **Notifier** : Notifier le responsable financier
- **Traiter** : Ouvrir la modale de traitement d'alerte
- **Assigner** : Assigner un responsable pour traitement
- **Ajouter commentaire** : Ajouter un commentaire à l'alerte

---

### f) ALERTES RH & RESSOURCES

**Objectif :** Centraliser les alertes issues du domaine RH & Ressources.

#### Sources d'alertes RH

Alertes issues de :

1. **Absences critiques**
   - Absences non planifiées critiques
   - Absences impactant des projets
   - Impact opérationnel affiché
   - Actions : ouvrir RH, replanifier, assigner remplaçant

2. **Missions bloquées**
   - Missions en attente de validation
   - Missions avec conflits
   - Impact projet affiché
   - Actions : ouvrir mission, valider, rejeter

3. **Évaluations en retard**
   - Évaluations en retard
   - Évaluations nécessitant une action
   - Actions : ouvrir évaluation, traiter, notifier

4. **Délégations expirées**
   - Délégations expirées nécessitant renouvellement
   - Délégations à renouveler
   - Impact opérationnel affiché
   - Actions : ouvrir délégation, renouveler, notifier

#### KPIs d'alertes RH

- **Nombre alertes RH** : Nombre total d'alertes RH actives
- **Criticité** : Niveau de criticité moyen (calculé)

#### Affichage des alertes RH

Tableau avec colonnes :
- Module source (icône + nom)
- Type d'alerte
- Description / Objet
- Criticité (badge visuel)
- Date création
- Durée (temps depuis création)
- Impact (opérationnel, projet)
- Statut
- Actions

Filtres disponibles :
- Module source
- Type d'alerte
- Criticité
- Statut
- Période

#### Actions disponibles

- **Ouvrir RH** : Navigation vers le module RH pour traitement
- **Replanifier** : Replanifier mission/évaluation
- **Assigner** : Assigner un responsable pour traitement
- **Traiter** : Ouvrir la modale de traitement d'alerte
- **Notifier** : Notifier le responsable RH
- **Ajouter commentaire** : Ajouter un commentaire à l'alerte

---

### g) ALERTES PROJETS & CHANTIERS

**Objectif :** Centraliser les alertes issues du domaine Projets & Clients.

#### Sources d'alertes projets

Alertes issues de :

1. **Retards projets**
   - Projets en retard > seuil
   - Retards critiques
   - Impact financier/réputationnel affiché
   - Actions : ouvrir projet, notifier équipe, escalader

2. **Non-conformités chantier**
   - Non-conformités détectées
   - Non-conformités critiques
   - Impact QSE affiché
   - Actions : ouvrir projet, traiter, escalader

3. **Risques techniques**
   - Risques techniques identifiés
   - Risques nécessitant une action
   - Impact projet affiché
   - Actions : ouvrir projet, traiter, escalader

4. **Incidents QSE**
   - Incidents QSE sur chantier
   - Incidents nécessitant une action
   - Gravité affichée
   - Actions : ouvrir projet, traiter, escalader

#### KPIs d'alertes projets

- **Nombre alertes projet** : Nombre total d'alertes projet actives
- **Nombre chantiers impactés** : Nombre de chantiers avec alertes actives

#### Affichage des alertes projets

Tableau avec colonnes :
- Module source (icône + nom)
- Type d'alerte
- Projet / Chantier
- Description / Objet
- Criticité (badge visuel)
- Date création
- Durée (temps depuis création)
- Impact (financier, réputationnel, QSE)
- Statut
- Actions

Filtres disponibles :
- Module source
- Type d'alerte
- Projet
- Chantier
- Criticité
- Statut
- Période

#### Actions disponibles

- **Ouvrir projet** : Navigation vers le module Projets pour traitement
- **Notifier équipe** : Notifier l'équipe projet
- **Escalader** : Escalader vers responsable projet
- **Traiter** : Ouvrir la modale de traitement d'alerte
- **Assigner** : Assigner un responsable pour traitement
- **Ajouter commentaire** : Ajouter un commentaire à l'alerte

---

### h) ALERTES SYSTÈME & SÉCURITÉ

**Objectif :** Centraliser les alertes issues du domaine Système & Sécurité.

#### Sources d'alertes système

Alertes issues de :

1. **Audit & conformité**
   - Alertes audit critiques
   - Non-conformités système
   - Actions : ouvrir audit, traiter, escalader

2. **Logs système**
   - Erreurs système critiques
   - Anomalies détectées dans les logs
   - Actions : ouvrir logs, traiter, escalader

3. **Observabilité & sécurité**
   - Alertes sécurité critiques
   - Tentatives d'intrusion
   - Actions : ouvrir sécurité, traiter, escalader

4. **IA (anomalies détectées)**
   - Anomalies détectées par l'IA
   - Patterns suspects identifiés
   - Actions : ouvrir IA, traiter, escalader

#### KPIs d'alertes système

- **Nombre alertes sécurité** : Nombre total d'alertes sécurité actives
- **Criticité** : Niveau de criticité moyen (calculé)
- **Incidents** : Nombre d'incidents système actifs

#### Affichage des alertes système

Tableau avec colonnes :
- Module source (icône + nom)
- Type d'alerte
- Description / Objet
- Criticité (badge visuel)
- Date création
- Durée (temps depuis création)
- Impact (système, sécurité, données)
- Statut
- Actions

Filtres disponibles :
- Module source
- Type d'alerte
- Criticité
- Statut
- Période

#### Actions disponibles

- **Ouvrir audit** : Navigation vers le module Audit pour traitement
- **Ouvrir logs** : Navigation vers le module Logs pour traitement
- **Escalader** : Escalader vers responsable sécurité
- **Traiter** : Ouvrir la modale de traitement d'alerte
- **Assigner** : Assigner un responsable pour traitement
- **Ajouter commentaire** : Ajouter un commentaire à l'alerte

---

### i) HISTORIQUE & TRAÇABILITÉ

**Objectif :** Fournir l'historique complet des alertes et permettre leur consultation avec filtres avancés.

#### Historique complet des alertes

Affichage de toutes les alertes passées (résolues, acquittées, archivées) :
- Tableau avec toutes les alertes historiques
- Colonnes : module source, type, description, criticité, date création, date résolution, durée, statut, actions
- Pagination pour gérer le volume
- Tri par défaut : date création décroissante

#### Filtres avancés

Panneau de filtres permettant de filtrer l'historique :
- **Date** : Période (aujourd'hui, cette semaine, ce mois, personnalisé)
- **Criticité** : Critiques, Urgentes, Avertissements, Info
- **Module** : Exécution, Projets, RH, Finance, Communication, Système, Calendrier
- **Bureau** : Filtre par bureau (si applicable)
- **Statut** : Résolues, Acquittées, Archivées, Toutes
- **Type** : Type d'alerte spécifique

#### Recherche

Recherche textuelle dans les alertes :
- Recherche dans description, objet, commentaires
- Recherche avec autocomplétion
- Recherche avec filtres combinés

#### Actions disponibles

- **Exporter** : Exporter l'historique filtré (CSV, Excel, PDF)
- **Filtrer** : Appliquer les filtres avancés
- **Rechercher** : Recherche textuelle dans les alertes
- **Réinitialiser** : Réinitialiser les filtres
- **Ouvrir alerte** : Ouvrir une alerte historique pour consultation

---

## 4) RÈGLES DE NON-REDONDANCE

### Ce que le module Centre d'Alertes NE fait pas

Le module Centre d'Alertes **NE traite PAS** les éléments suivants :

#### Traitement opérationnel
- ❌ Il ne traite pas les demandes opérationnelles (géré par le module **Exécution** > Demandes)
- ❌ Il ne valide pas les BC/Factures/Contrats/Paiements (géré par le module **Exécution** > Validation BC/Factures, Validation Contrats, Validation Paiements)
- ❌ Il ne gère pas les tickets clients opérationnels (géré par le module **Projets & Clients** > Tickets)
- ❌ Il ne gère pas les missions RH opérationnelles (géré par le module **RH & Ressources** > Missions)
- ❌ Il ne gère pas les demandes RH opérationnelles (géré par le module **RH & Ressources** > Demandes RH)
- ❌ Il ne gère pas les projets opérationnels (géré par le module **Projets & Clients** > Projets en cours)
- ❌ Il ne gère pas les finances opérationnelles (géré par le module **Finance & Contentieux** > Finances, Recouvrements)

#### Écrans détaillés
- ❌ Il ne gère pas les écrans projets détaillés (géré par le module **Projets & Clients** > Projets en cours)
- ❌ Il ne gère pas les écrans RH détaillés (géré par le module **RH & Ressources** > Employés, Missions, Évaluations, etc.)
- ❌ Il ne gère pas les écrans finance détaillés (géré par le module **Finance & Contentieux** > Finances, Recouvrements)
- ❌ Il ne gère pas les écrans litiges détaillés (géré par le module **Finance & Contentieux** > Litiges)
- ❌ Il ne gère pas les écrans clients détaillés (géré par le module **Projets & Clients** > Clients)

#### Remplacement de modules
- ❌ Il ne remplace pas le **module Gouvernance** (qui gère les décisions stratégiques et escalades critiques pour la direction)
- ❌ Il ne remplace pas le **Calendrier** (qui gère SLA, retards, conflits, échéances avec vue calendaire)
- ❌ Il ne refait pas l'**Analytics BTP** (qui fournit des analyses détaillées par domaine avec drill-down)
- ❌ Il ne remplace pas les **modules opérationnels** (Exécution, Projets, RH, Finance qui gèrent l'exécution complète)

#### Gestion opérationnelle
- ❌ Il ne gère pas les dossiers bloqués opérationnels (géré par le module **Exécution** > Dossiers bloqués)
- ❌ Il ne gère pas la substitution opérationnelle (géré par le module **Exécution** > Substitution)
- ❌ Il ne gère pas les arbitrages opérationnels (géré par le module **Exécution** > Arbitrages & Goulots)

#### Analyses détaillées
- ❌ Il n'affiche pas d'analyses détaillées (pas de tendances, comparatifs, graphiques analytiques)
- ❌ Il n'affiche pas d'insights analytiques (pas de drill-down analytique)
- ❌ Il n'affiche pas de données opérationnelles complètes (uniquement les alertes)

### Ce que le module Centre d'Alertes fait

Le module Centre d'Alertes se concentre **exclusivement** sur :

#### Supervision transversale
- ✅ Centralisation de toutes les alertes provenant de tous les modules
- ✅ Classification des alertes par criticité, origine, impact
- ✅ Détection des alertes critiques, urgentes, bloquantes
- ✅ Vue consolidée des risques opérationnels

#### Gestion des alertes
- ✅ Filtrage des alertes (par module, criticité, période, statut)
- ✅ Priorisation des alertes (tri par criticité, urgence)
- ✅ Escalade des alertes (vers Gouvernance, direction)
- ✅ Assignation des alertes (assigner responsable)
- ✅ Acquittement des alertes (marquer comme prise en compte)
- ✅ Résolution des alertes (marquer comme résolue)

#### Navigation vers modules sources
- ✅ Ouverture des modules sources pour traitement complet
- ✅ Navigation contextuelle vers l'élément source (demande, validation, projet, etc.)

#### Traçabilité
- ✅ Historique complet des alertes
- ✅ Traçabilité des actions (acquittement, résolution, escalade, assignation)
- ✅ Export de l'historique

### Pourquoi il n'est pas un module Analytics

- ❌ Il n'affiche **pas** de tendances, comparatifs, graphiques analytiques
- ❌ Il n'affiche **pas** d'analyses détaillées avec drill-down
- ❌ Il n'affiche **pas** d'insights analytiques
- ✅ Il affiche **uniquement** des KPIs synthétiques (nombre d'alertes, temps moyen, etc.)
- ✅ Il affiche **uniquement** des alertes opérationnelles sans analyses
- ✅ Il est **complémentaire** au module Analytics qui fournit les analyses détaillées

### Pourquoi il n'est pas un module opérationnel

- ❌ Il ne **traite pas** les demandes, validations, paiements, tickets, missions
- ❌ Il ne **gère pas** les écrans opérationnels complets
- ❌ Il ne **remplace pas** les modules Exécution, Projets, RH, Finance
- ✅ Il **centralise** uniquement les alertes issues des modules opérationnels
- ✅ Il **supervise** uniquement les alertes sans traiter le contenu métier
- ✅ Il est **complémentaire** aux modules opérationnels qui gèrent l'exécution complète

### Pourquoi il n'est pas le module Gouvernance

- ❌ Il ne **gère pas** les décisions stratégiques (géré par Gouvernance)
- ❌ Il ne **coordonne pas** les instances décisionnelles (géré par Gouvernance)
- ❌ Il ne **fournit pas** de synthèses stratégiques pour la direction (géré par Gouvernance)
- ✅ Il **gère** toutes les alertes opérationnelles avec workflow complet
- ✅ Il **escalade** vers la Gouvernance si nécessaire (les alertes critiques escaladées deviennent des escalades pour la Gouvernance)
- ✅ Il est **complémentaire** à la Gouvernance qui agrège uniquement les escalades critiques

### Pourquoi il doit rester dans maitre-ouvrage/centre-alertes

- ✅ Il est dédié au **maître d'ouvrage** pour supervision transversale
- ✅ Il fournit une vision **transverse** de toutes les alertes opérationnelles
- ✅ Il **supervise** les alertes sans traiter le contenu métier
- ✅ Il ne doit **pas** être dans analytics/ (pas d'analyses détaillées)
- ✅ Il ne doit **pas** être dans pilotage/ (supervision opérationnelle, pas stratégique)
- ✅ Il ne doit **pas** être dans systeme/ (supervision métier, pas technique)
- ✅ Il ne doit **pas** être dans execution/ (supervision, pas exécution)
- ✅ Il ne doit **pas** être dans projets/, rh/, finance/, communication/ (vision transverse, pas module spécifique)

---

## RÉSUMÉ

Le module **Centre d'Alertes** (`maitre-ouvrage/centre-alertes`) est le poste de supervision transversale dédié au maître d'ouvrage pour centraliser, classifier et gérer toutes les alertes provenant de l'ensemble des modules opérationnels de l'ERP BTP Yessalate BMO. Il fournit une vue consolidée des risques opérationnels en temps réel, détecte les alertes critiques et bloquantes, et permet leur traitement coordonné via filtrage, priorisation, escalade et assignation.

**9 onglets obligatoires** structurent le module :
1. Vue d'ensemble (tableau de bord consolidé avec KPIs synthétiques)
2. Alertes critiques (alertes nécessitant intervention immédiate)
3. Alertes opérationnelles (alertes issues des processus quotidiens)
4. Alertes SLA & délais (synchronisé avec Calendrier)
5. Alertes financières (alertes issues de Finance & Contentieux)
6. Alertes RH & ressources (alertes issues de RH & Ressources)
7. Alertes projets & chantiers (alertes issues de Projets & Clients)
8. Alertes système & sécurité (alertes issues de Système & Sécurité)
9. Historique & traçabilité (historique complet avec filtres avancés)

Le module **ne remplace pas** les modules opérationnels (Exécution, Projets, RH, Finance, etc.), le module Gouvernance (qui gère les décisions stratégiques), le Calendrier (qui gère SLA avec vue calendaire), ni le module Analytics (qui fournit les analyses détaillées). Il **les supervise** en centralisant uniquement les alertes opérationnelles pour supervision transversale, sans traiter le contenu métier et sans afficher d'analyses détaillées.

---

**Document généré : Module Centre d'Alertes - Maître d'Ouvrage**  
**Version : 1.0**  
**Date : Janvier 2025**  
**Route : maitre-ouvrage/centre-alertes**  
**Catégorie : MAÎTRE D'OUVRAGE**  
**Nature : Supervision transversale des alertes, risques, anomalies**

