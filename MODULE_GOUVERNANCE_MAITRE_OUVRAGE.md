# Module Gouvernance - Maître d'Ouvrage

**Route fonctionnelle :** `maitre-ouvrage/governance`  
**Catégorie :** MAÎTRE D'OUVRAGE  
**Nature :** Gouvernance stratégique, arbitrage, supervision  
**Version :** 1.0  
**Date :** Janvier 2025

---

## 1) RÔLE DU MODULE

Le module **Gouvernance** est le centre de supervision stratégique dédié au maître d'ouvrage et à la direction générale de l'ERP BTP Yessalate BMO. Sa mission est de consolider les signaux stratégiques provenant de l'ensemble des modules opérationnels et de fournir une vision transverse permettant la prise de décision éclairée au plus haut niveau.

**Mission stratégique :**
Le module centralise les décisions transverses à fort impact, gère les escalades critiques multi-modules, suit les projets sensibles nécessitant une attention de la direction, supervise les risques majeurs consolidés (projets, QSE, litiges, système), assure le suivi de la conformité globale (SLA, audit, sécurité), coordonne les instances décisionnelles (conférences, échanges structurés), et fournit une synthèse consolidée pour la direction générale et la direction BMO.

**Ce qu'il centralise :**
Le module agrège exclusivement les éléments stratégiques : décisions stratégiques (tag stratégique) du Registre Décisions, escalades critiques multi-modules (Centre d'alertes, Dossiers bloqués, Substitution, Arbitrages, Tickets critiques, Litiges), projets sensibles (retards critiques, dépassements budgétaires, projets VIP/image, projets en litige), risques majeurs consolidés (projets, litiges, QSE, système), conformité globale (SLA, réglementaire, audits), et instances de coordination (conférences critiques, échanges escaladés, messages externes stratégiques).

**Ce qu'il ne fait pas :**
Le module ne traite pas les éléments opérationnels (pas d'exécution de demandes, pas de validation de BC/Factures/Contrats/Paiements, pas de gestion de tickets, missions, ou demandes RH). Il n'affiche pas d'analyses détaillées (pas de tendances, comparatifs, graphiques analytiques). Il ne remplace pas le Centre d'alertes (qui gère toutes les alertes opérationnelles avec workflow complet), le Calendrier (qui gère SLA, retards, conflits avec vue calendaire), le module Analytics (qui fournit des analyses détaillées par domaine), ni les modules opérationnels (Demandes, Validations, Projets, RH, Finance, Litiges).

**Différence avec les autres modules :**
- **Centre d'alertes** : Le Centre d'alertes gère toutes les alertes opérationnelles avec workflow complet. La Gouvernance agrège uniquement les escalades critiques issues du Centre d'alertes pour la direction.
- **Calendrier** : Le Calendrier gère les SLA, retards, conflits, échéances avec vue calendaire. La Gouvernance agrège uniquement les informations critiques de conformité pour la direction.
- **Analytics BTP** : Le module Analytics fournit des analyses détaillées avec drill-down par domaine. La Gouvernance agrège uniquement les KPIs stratégiques consolidés sans analyses détaillées.
- **Modules opérationnels** : Les modules Exécution, Projets, RH, Finance gèrent l'opérationnel complet. La Gouvernance agrège uniquement les éléments critiques nécessitant une décision de la direction.
- **Registre Décisions** : Le Registre Décisions (module Système) trace toutes les décisions. La Gouvernance centralise uniquement les décisions stratégiques en attente pour la direction.

---

## 2) STRUCTURE UX (ONGLETS)

Le module `maitre-ouvrage/governance` est structuré en **8 onglets obligatoires** :

### Onglet 1 : Vue stratégique
**Objectif :** Tableau de bord consolidé offrant une vision d'ensemble immédiate de la situation stratégique de l'entreprise.

**Sections :**
- KPIs stratégiques consolidés (8 indicateurs clés)
- Bloc "Décisions à prendre" (extrait du Registre Décisions)
- Bloc "Escalades actives" (multi-modules)
- Bloc "Projets à surveiller" (extrait Projets en cours)
- Actions rapides (ouvrir décision, traiter escalade, ouvrir projet sensible)

**KPIs :**
- Projets actifs (nombre total, santé globale)
- Budget consommé (pourcentage, montant engagé)
- Jalons en retard (nombre critiques)
- Risques critiques (nombre majeurs, exposition financière)
- Validations en attente (nombre bloquées > SLA, montant bloqué)
- Taux utilisation (ressources RH, matériel)
- Alertes non lues (nombre critiques, escaladées)
- Conformité SLA (taux global, nombre dépassements)

**Actions possibles :**
- Ouvrir décision (navigation vers Registre Décisions)
- Traiter escalade (modale de traitement)
- Ouvrir projet sensible (navigation vers Projets en cours)
- Générer synthèse (génération rapide pour direction)

---

### Onglet 2 : Décisions & Arbitrages
**Objectif :** Centraliser toutes les décisions stratégiques en attente, les arbitrages à fort impact, et l'historique des validations critiques.

**Sections :**
- Décisions stratégiques (tag stratégique du Registre Décisions)
- Décisions bloquées (temps > SLA)
- Arbitrages à fort impact (extrait Arbitrages & Goulots)
- Historique des validations critiques

**KPIs :**
- Décisions en attente (nombre stratégiques)
- Décisions bloquées (nombre > SLA, temps moyen)
- Arbitrages critiques (nombre, montant total)
- Validations critiques (nombre période, montant total)

**Actions possibles :**
- Valider (approuver décision avec commentaire)
- Refuser (rejeter avec justification)
- Escalader (vers niveau supérieur, ex: DG)
- Convoquer conférence (créer conférence décisionnelle)
- Différer (reporter avec nouvelle échéance)
- Ajouter commentaire
- Ouvrir module source (navigation vers module d'origine)

---

### Onglet 3 : Escalades & Blocages critiques
**Objectif :** Agréger toutes les escalades critiques provenant des différents modules opérationnels et permettre leur traitement coordonné.

**Sections :**
- Escalades Centre d'alertes
- Escalades Dossiers bloqués
- Escalades Substitution
- Escalades Arbitrages
- Escalades Tickets critiques
- Escalades Litiges à haut risque

**KPIs :**
- Escalades actives (nombre total en cours)
- Escalades critiques (nombre niveau critique)
- Durée moyenne (temps moyen de traitement)
- Taux de résolution (pourcentage résolues dans SLA)

**Actions possibles :**
- Traiter (ouvrir modale de traitement)
- Réassigner (réassigner à autre responsable)
- Escalader DG (escalader vers Direction Générale)
- Ouvrir module source (navigation vers module d'origine)
- Ajouter commentaire
- Marquer résolu
- Créer décision (créer décision liée à escalade)

---

### Onglet 4 : Projets sensibles & Priorités
**Objectif :** Surveiller les projets nécessitant une attention particulière de la direction (retards critiques, dépassements budgétaires, projets VIP, projets en litige).

**Sections :**
- Projets en retard > seuil
- Dépassements budgétaires > seuil
- Projets VIP / image
- Projets en litige

**KPIs :**
- Projets en retard (nombre > seuil, pourcentage total)
- Dépassements budgétaires (nombre > seuil, montant total)
- Projets VIP (nombre, indicateurs santé)
- Projets en litige (nombre, enjeu financier total)

**Actions possibles :**
- Ouvrir projet (navigation vers Projets en cours)
- Convoquer revue (créer conférence revue projet)
- Simuler impact (modale simulation financier, planning, ressources)
- Déclencher plan de rattrapage
- Demander révision budgétaire
- Assigner ressources prioritaires

---

### Onglet 5 : Risques majeurs & Exposition
**Objectif :** Consolider la vision des risques majeurs (projets, litiges, QSE, système) et calculer l'exposition globale (financière, réputationnelle).

**Sections :**
- Risques projets critiques
- Litiges à fort enjeu
- Incidents QSE majeurs
- Incidents système critiques
- Exposition financière consolidée
- Exposition réputationnelle consolidée

**KPIs :**
- Risques critiques (nombre, probabilité/impact élevés)
- Litiges à fort enjeu (nombre, montant total)
- Incidents QSE (nombre majeurs)
- Incidents système (nombre critiques)
- Exposition financière (montant total consolidé)
- Exposition réputationnelle (niveau consolidé)

**Actions possibles :**
- Lancer audit (créer demande audit)
- Escalader (vers niveau supérieur, ex: DG, CA)
- Déclencher cellule de crise
- Créer plan de mitigation
- Créer plan d'action
- Créer plan de continuité
- Ouvrir module source (navigation vers module d'origine)

---

### Onglet 6 : Conformité & Engagement global
**Objectif :** Suivre la conformité globale de l'entreprise (SLA, réglementaire, audits, processus) et identifier les écarts nécessitant une action.

**Sections :**
- Taux de conformité SLA
- Taux de conformité réglementaire
- Alertes audit & sécurité
- Processus / bureaux non conformes

**KPIs :**
- Taux conformité SLA (pourcentage global, par type, par module)
- Taux conformité réglementaire (QSE, financière, RH, RGPD)
- Alertes audit (nombre critiques)
- Alertes sécurité (nombre critiques)
- Non-conformités (processus, bureaux)

**Actions possibles :**
- Lancer plan d'action (créer plan correction non-conformité)
- Ouvrir audit (navigation vers module Audit)
- Notifier bureau (envoyer notification non-conformité)
- Convoquer revue (créer conférence revue conformité)
- Générer rapport conformité

---

### Onglet 7 : Instances & Coordination
**Objectif :** Coordonner les instances décisionnelles critiques (conférences, échanges structurés, messages externes stratégiques).

**Sections :**
- Conférences décisionnelles critiques
- Échanges structurés escaladés
- Messages externes à impact stratégique

**KPIs :**
- Conférences critiques (nombre, en attente)
- Échanges escaladés (nombre, en attente)
- Messages stratégiques (nombre, impact)

**Actions possibles :**
- Convoquer (créer nouvelle conférence)
- Replanifier (modifier date/heure conférence)
- Assigner (assigner responsable échange/message)
- Archiver (archiver instance traitée)
- Ouvrir conférence (navigation vers module Communication)
- Ouvrir échange (navigation vers module Communication)
- Ouvrir message (navigation vers module Communication)

---

### Onglet 8 : Synthèse DG / BMO
**Objectif :** Fournir des synthèses périodiques (hebdomadaire, mensuelle) et des rapports consolidés pour la direction générale et la direction BMO.

**Sections :**
- Synthèse hebdomadaire / mensuelle
- Rapports consolidés (projets, RH, finances, risques, décisions)
- Recommandations IA stratégiques

**KPIs :**
- Synthèse période (KPIs, décisions, escalades, projets, risques, conformité)
- Rapports disponibles (nombre par type)
- Recommandations IA (nombre, priorité)

**Actions possibles :**
- Générer rapport (générer rapport consolidé personnalisé)
- Exporter (PDF, Excel, PowerPoint)
- Planifier export (planifier envoi automatique périodique)
- Simuler scénario (modale simulation what-if)
- Partager (partager avec destinataires)
- Archiver (archiver rapport généré)

---

## 3) DÉTAIL PAR ONGLET

### a) VUE STRATÉGIQUE

**Objectif :** Tableau de bord consolidé offrant une vision d'ensemble immédiate de la situation stratégique de l'entreprise.

#### KPIs stratégiques consolidés

Affichage de 8 indicateurs clés en temps réel :

1. **Projets actifs**
   - Nombre total de projets en cours
   - Indicateur de santé global (On-track / At-risk / Late)

2. **Budget consommé**
   - Pourcentage du budget total consommé
   - Montant total engagé

3. **Jalons en retard**
   - Nombre de jalons en retard critique (> seuil configurable)

4. **Risques critiques**
   - Nombre de risques majeurs actifs
   - Exposition financière totale

5. **Validations en attente**
   - Nombre de validations bloquées > SLA
   - Montant total bloqué

6. **Taux utilisation**
   - Taux d'utilisation des ressources (RH, matériel)

7. **Alertes non lues**
   - Nombre d'alertes critiques non traitées
   - Alertes escaladées

8. **Conformité SLA**
   - Taux de conformité global aux SLA
   - Nombre de SLA en dépassement

#### Bloc "Décisions à prendre"

Extrait du Registre Décisions (module Système) :
- Liste des décisions stratégiques en attente (tag stratégique)
- Décisions bloquées (temps > SLA)
- Décisions urgentes (échéance < 48h)
- Actions rapides : ouvrir décision, traiter, escalader

#### Bloc "Escalades actives"

Extrait multi-modules :
- Escalades provenant du Centre d'alertes
- Escalades provenant des Dossiers bloqués
- Escalades provenant de la Substitution
- Escalades provenant des Arbitrages
- Escalades provenant des Tickets critiques
- Escalades provenant des Litiges
- Actions rapides : traiter escalade, réassigner, ouvrir module source

#### Bloc "Projets à surveiller"

Extrait du module Projets en cours :
- Projets en retard > seuil configurable
- Projets en dépassement budgétaire > seuil configurable
- Projets VIP / image
- Projets en litige
- Actions rapides : ouvrir projet, convoquer revue, simuler impact

#### Actions rapides

Boutons d'action contextuels :
- **Ouvrir décision** : Navigation vers la décision dans le Registre Décisions
- **Traiter escalade** : Ouverture de la modale de traitement d'escalade
- **Ouvrir projet sensible** : Navigation vers le projet dans Projets en cours
- **Générer synthèse** : Génération d'une synthèse rapide pour la Direction

---

### b) DÉCISIONS & ARBITRAGES

**Objectif :** Centraliser toutes les décisions stratégiques en attente, les arbitrages à fort impact, et l'historique des validations critiques.

#### Décisions stratégiques

Liste des décisions du Registre Décisions (module Système) avec tag stratégique :
- Filtres : type, impact, statut, échéance
- Tri : urgence, impact, date de création
- Colonnes : sujet, type, impact, statut, échéance, porteur, actions
- Actions : valider, refuser, différer, convoquer conférence, ajouter commentaire

#### Décisions bloquées

Décisions dont le temps de traitement dépasse le SLA :
- Temps de blocage affiché
- Raison du blocage (si disponible)
- Impact estimé
- Actions : débloquer, escalader, réassigner

#### Arbitrages à fort impact

Extrait du module Arbitrages & Goulots (Exécution) :
- Arbitrages nécessitant une décision de la Direction
- Impact financier > seuil configurable
- Impact opérationnel > seuil configurable
- Actions : valider arbitrage, refuser, demander complément, convoquer conférence

#### Historique des validations critiques

Historique des validations ayant eu un impact majeur :
- Validations de montant > seuil
- Validations ayant débloqué des situations critiques
- Validations ayant généré des escalades
- Filtres : période, type, impact, validateur

#### Actions disponibles

- **Valider** : Approuver la décision avec commentaire optionnel
- **Refuser** : Rejeter la décision avec justification obligatoire
- **Escalader** : Escalader vers un niveau supérieur (ex: DG)
- **Convoquer conférence** : Créer une conférence décisionnelle pour traiter la décision
- **Différer** : Reporter la décision avec nouvelle échéance
- **Ajouter commentaire** : Ajouter un commentaire à la décision
- **Ouvrir module source** : Navigation vers le module d'origine de la décision

---

### c) ESCALADES & BLOCAGES CRITIQUES

**Objectif :** Agréger toutes les escalades critiques provenant des différents modules opérationnels et permettre leur traitement coordonné.

#### Sources d'escalades

Escalades provenant de :

1. **Centre d'alertes**
   - Alertes critiques non résolues
   - Alertes escaladées automatiquement
   - Alertes nécessitant une intervention de la Direction

2. **Dossiers bloqués**
   - Dossiers bloqués > seuil de temps
   - Dossiers bloqués avec impact financier majeur
   - Dossiers nécessitant un arbitrage de la Direction

3. **Substitution**
   - Substitutions critiques non résolues
   - Conflits de délégation nécessitant une décision

4. **Arbitrages**
   - Arbitrages non résolus nécessitant une décision de la Direction
   - Goulots d'étranglement critiques

5. **Tickets critiques**
   - Tickets clients critiques non résolus
   - Tickets avec impact réputationnel

6. **Litiges à haut risque**
   - Litiges avec enjeu financier majeur
   - Litiges avec impact réputationnel
   - Litiges nécessitant une stratégie de la Direction

#### KPIs d'escalades

- **Escalades actives** : Nombre total d'escalades en cours
- **Escalades critiques** : Nombre d'escalades de niveau critique
- **Durée moyenne** : Temps moyen de traitement des escalades
- **Taux de résolution** : Pourcentage d'escalades résolues dans les SLA

#### Affichage des escalades

Tableau avec colonnes :
- Source (module d'origine)
- Type d'escalade
- Objet / Description
- Criticité
- Date d'escalade
- Durée
- Porteur
- Statut
- Actions

Filtres disponibles :
- Source (module)
- Type
- Criticité
- Statut
- Période

#### Actions disponibles

- **Traiter** : Ouvrir la modale de traitement d'escalade
- **Réassigner** : Réassigner l'escalade à un autre responsable
- **Escalader DG** : Escalader vers la Direction Générale
- **Ouvrir module source** : Navigation vers le module d'origine pour contexte complet
- **Ajouter commentaire** : Ajouter un commentaire à l'escalade
- **Marquer résolu** : Marquer l'escalade comme résolue
- **Créer décision** : Créer une décision liée à l'escalade

---

### d) PROJETS SENSIBLES & PRIORITÉS

**Objectif :** Surveiller les projets nécessitant une attention particulière de la Direction (retards critiques, dépassements budgétaires, projets VIP, projets en litige).

#### Projets en retard > seuil

Projets dont le retard dépasse un seuil configurable :
- Seuil par défaut : 15% de retard sur le planning
- Affichage : nom projet, retard (%), impact financier, impact réputationnel
- Actions : ouvrir projet, convoquer revue, simuler impact, déclencher plan de rattrapage

#### Dépassements budgétaires > seuil

Projets dont le dépassement budgétaire dépasse un seuil configurable :
- Seuil par défaut : 10% de dépassement
- Affichage : nom projet, dépassement (%), montant, tendance
- Actions : ouvrir projet, convoquer revue, simuler impact, demander révision budgétaire

#### Projets VIP / image

Projets marqués comme VIP ou ayant un impact image majeur :
- Critères : client stratégique, projet phare, projet médiatique
- Affichage : nom projet, statut, indicateurs de santé, alertes
- Actions : ouvrir projet, convoquer revue, assigner ressources prioritaires

#### Projets en litige

Projets ayant un litige actif :
- Affichage : nom projet, litige, enjeu financier, statut litige
- Actions : ouvrir projet, ouvrir litige, convoquer revue, simuler impact

#### Indicateurs de santé

Pour chaque projet sensible :
- **On-track** : Projet dans les clous (vert)
- **At-risk** : Projet à risque (orange)
- **Late** : Projet en retard (rouge)

#### Actions disponibles

- **Ouvrir projet** : Navigation vers le projet dans Projets en cours
- **Convoquer revue** : Créer une conférence de revue projet
- **Simuler impact** : Ouvrir la modale de simulation d'impact (financier, planning, ressources)
- **Déclencher plan de rattrapage** : Créer un plan d'action de rattrapage
- **Demander révision budgétaire** : Créer une demande de révision budgétaire
- **Assigner ressources prioritaires** : Ouvrir la modale d'assignation de ressources

---

### e) RISQUES MAJEURS & EXPOSITION

**Objectif :** Consolider la vision des risques majeurs (projets, litiges, QSE, système) et calculer l'exposition globale (financière, réputationnelle).

#### Risques projets critiques

Risques de projets avec probabilité et impact élevés :
- Matrice Probabilité/Impact
- Risques non mitigés
- Risques nécessitant une action immédiate
- Actions : lancer audit, escalader, déclencher cellule de crise, créer plan de mitigation

#### Litiges à fort enjeu

Litiges (module Finance & Contentieux) avec enjeu financier ou réputationnel majeur :
- Enjeu financier > seuil configurable
- Impact réputationnel élevé
- Litiges stratégiques
- Actions : ouvrir litige, convoquer revue stratégique, déclencher cellule de crise

#### Incidents QSE majeurs

Incidents Qualité, Sécurité, Environnement majeurs :
- Accidents graves
- Non-conformités critiques
- Incidents environnementaux majeurs
- Actions : lancer audit, escalader, déclencher cellule de crise, créer plan d'action

#### Incidents système critiques

Incidents système ayant un impact majeur :
- Pannes critiques
- Fuites de données
- Cyberattaques
- Actions : lancer audit, escalader, déclencher cellule de crise, créer plan de continuité

#### Exposition financière consolidée

Calcul de l'exposition financière totale :
- Exposition projets (risques, dépassements)
- Exposition litiges (montants en jeu)
- Exposition QSE (coûts potentiels)
- Exposition système (coûts de remédiation)
- Total consolidé

#### Exposition réputationnelle consolidée

Évaluation de l'exposition réputationnelle :
- Indicateurs de réputation par domaine
- Alertes réputationnelles

#### Actions disponibles

- **Lancer audit** : Créer une demande d'audit pour un risque/incident
- **Escalader** : Escalader vers un niveau supérieur (ex: DG, Conseil d'administration)
- **Déclencher cellule de crise** : Créer une cellule de crise pour gérer un risque/incident majeur
- **Créer plan de mitigation** : Créer un plan d'action de mitigation d'un risque
- **Créer plan d'action** : Créer un plan d'action pour un incident QSE
- **Créer plan de continuité** : Créer un plan de continuité pour un incident système
- **Ouvrir module source** : Navigation vers le module d'origine (projet, litige, etc.)

---

### f) CONFORMITÉ & ENGAGEMENT GLOBAL

**Objectif :** Suivre la conformité globale de l'entreprise (SLA, réglementaire, audits, processus) et identifier les écarts nécessitant une action.

#### Taux de conformité SLA

Indicateurs de conformité aux SLA :
- Taux de conformité global
- Taux par type de SLA (validation, traitement, réponse)
- Taux par module
- SLA en dépassement avec détails

#### Taux de conformité réglementaire

Indicateurs de conformité réglementaire :
- Conformité QSE (Qualité, Sécurité, Environnement)
- Conformité financière
- Conformité RH
- Conformité données personnelles (RGPD)
- Alertes de non-conformité

#### Alertes audit & sécurité

Alertes provenant du module Audit & Conformité (Système) :
- Alertes audit critiques
- Alertes sécurité critiques
- Non-conformités majeures
- Actions : ouvrir audit, lancer plan d'action, notifier bureau

#### Processus / bureaux non conformes

Identification des processus ou bureaux non conformes :
- Processus non conformes
- Bureaux non conformes
- Raisons de non-conformité
- Actions : lancer plan d'action, notifier bureau, convoquer revue

#### Actions disponibles

- **Lancer plan d'action** : Créer un plan d'action pour corriger une non-conformité
- **Ouvrir audit** : Navigation vers l'audit dans le module Audit & Conformité
- **Notifier bureau** : Envoyer une notification à un bureau pour une non-conformité
- **Convoquer revue** : Créer une conférence de revue de conformité
- **Générer rapport conformité** : Générer un rapport de conformité consolidé

---

### g) INSTANCES & COORDINATION

**Objectif :** Coordonner les instances décisionnelles critiques (conférences, échanges structurés, messages externes stratégiques).

#### Conférences décisionnelles critiques

Conférences (module Communication) marquées comme critiques :
- Conférences avec décisions stratégiques
- Conférences avec arbitrages majeurs
- Conférences avec escalades critiques
- Affichage : titre, date, participants, ordre du jour, statut
- Actions : convoquer, replanifier, assigner, archiver, ouvrir conférence

#### Échanges structurés escaladés

Échanges (module Communication) escaladés vers la Direction :
- Échanges nécessitant une intervention de la Direction
- Échanges avec enjeu stratégique
- Affichage : objet, source, date, statut, actions
- Actions : traiter, réassigner, convoquer conférence, archiver

#### Messages externes à impact stratégique

Messages externes (module Communication) ayant un impact stratégique :
- Messages de clients stratégiques
- Messages avec enjeu financier majeur
- Messages avec impact réputationnel
- Affichage : expéditeur, objet, date, impact, statut
- Actions : traiter, assigner, convoquer conférence, archiver

#### Actions disponibles

- **Convoquer** : Créer une nouvelle conférence décisionnelle
- **Replanifier** : Modifier la date/heure d'une conférence
- **Assigner** : Assigner un responsable pour traiter un échange/message
- **Archiver** : Archiver une instance traitée
- **Ouvrir conférence** : Navigation vers la conférence dans le module Communication
- **Ouvrir échange** : Navigation vers l'échange dans le module Communication
- **Ouvrir message** : Navigation vers le message dans le module Communication

---

### h) SYNTHÈSE DG / BMO

**Objectif :** Fournir des synthèses périodiques (hebdomadaire, mensuelle) et des rapports consolidés pour la direction générale et la direction BMO.

#### Synthèse hebdomadaire / mensuelle

Synthèses automatiques générées :
- **Synthèse hebdomadaire** : Vue consolidée de la semaine écoulée
- **Synthèse mensuelle** : Vue consolidée du mois écoulé
- Contenu : KPIs, décisions prises, escalades traitées, projets sensibles, risques majeurs, conformité

#### Rapports consolidés

Rapports détaillés par domaine :
- **Rapport projets** : État des projets, retards, dépassements, santé globale
- **Rapport RH** : Effectifs, missions, compétences, alertes RH
- **Rapport finances** : Trésorerie, facturation, recouvrements, litiges
- **Rapport risques** : Risques majeurs, exposition, mitigation
- **Rapport décisions** : Décisions prises, en attente, bloquées

#### Recommandations IA stratégiques

Recommandations générées par l'IA (module Système) :
- Recommandations de décisions
- Recommandations d'arbitrages
- Recommandations de priorités
- Recommandations d'optimisation
- Actions : appliquer recommandation, ignorer, demander complément

#### Actions disponibles

- **Générer rapport** : Générer un rapport consolidé personnalisé
- **Exporter** : Exporter le rapport (PDF, Excel, PowerPoint)
- **Planifier export** : Planifier l'envoi automatique d'un rapport périodique
- **Simuler scénario** : Ouvrir la modale de simulation de scénario (what-if)
- **Partager** : Partager le rapport avec des destinataires
- **Archiver** : Archiver un rapport généré

---

## 4) RÈGLES DE NON-REDONDANCE

### Ce que le module Gouvernance NE fait pas

Le module Gouvernance **NE traite PAS** les éléments suivants :

#### Traitement opérationnel
- ❌ Il ne traite pas les demandes opérationnelles (géré par le module **Exécution** > Demandes)
- ❌ Il ne valide pas les BC/Factures/Contrats/Paiements (géré par le module **Exécution** > Validation BC/Factures, Validation Contrats, Validation Paiements)
- ❌ Il ne gère pas les tickets clients opérationnels (géré par le module **Projets & Clients** > Tickets)
- ❌ Il ne gère pas les missions RH opérationnelles (géré par le module **RH & Ressources** > Missions)
- ❌ Il ne gère pas les demandes RH opérationnelles (géré par le module **RH & Ressources** > Demandes RH)

#### Écrans détaillés
- ❌ Il ne gère pas les écrans projets détaillés (géré par le module **Projets & Clients** > Projets en cours)
- ❌ Il ne gère pas les écrans RH détaillés (géré par le module **RH & Ressources** > Employés, Missions, Évaluations, etc.)
- ❌ Il ne gère pas les écrans finance détaillés (géré par le module **Finance & Contentieux** > Finances, Recouvrements)
- ❌ Il ne gère pas les écrans litiges détaillés (géré par le module **Finance & Contentieux** > Litiges)
- ❌ Il ne gère pas les écrans clients détaillés (géré par le module **Projets & Clients** > Clients)

#### Remplacement de modules
- ❌ Il ne remplace pas le **Centre d'alertes** (qui gère toutes les alertes opérationnelles avec workflow complet)
- ❌ Il ne remplace pas le **Calendrier** (qui gère SLA, retards, conflits, échéances avec vue calendaire)
- ❌ Il ne refait pas l'**Analytics BTP** (qui fournit des analyses détaillées par domaine avec drill-down)

#### Gestion opérationnelle
- ❌ Il ne gère pas les dossiers bloqués opérationnels (géré par le module **Exécution** > Dossiers bloqués)
- ❌ Il ne gère pas la substitution opérationnelle (géré par le module **Exécution** > Substitution)
- ❌ Il ne gère pas les arbitrages opérationnels (géré par le module **Exécution** > Arbitrages & Goulots)

#### Analyses détaillées
- ❌ Il n'affiche pas d'analyses détaillées (pas de tendances, comparatifs, graphiques analytiques)
- ❌ Il n'affiche pas de données opérationnelles complètes (uniquement les éléments critiques)
- ❌ Il n'affiche pas de drill-down analytique (réservé au module Analytics)

### Ce que le module Gouvernance fait

Le module Gouvernance se concentre **exclusivement** sur :

#### Synthèse stratégique
- ✅ Synthèse consolidée de tous les modules pour la Direction
- ✅ KPIs stratégiques agrégés (projets, budget, risques, conformité) - uniquement synthétiques, pas analytiques
- ✅ Vision transverse de l'ensemble des activités

#### Arbitrage
- ✅ Arbitrages nécessitant une décision de la Direction (impact > seuil)
- ✅ Arbitrages à fort impact financier ou opérationnel
- ✅ Coordination des arbitrages multi-modules

#### Décision
- ✅ Décisions stratégiques (tag stratégique du Registre Décisions)
- ✅ Décisions bloquées nécessitant une intervention
- ✅ Historique des validations critiques

#### Escalade
- ✅ Agrégation des escalades critiques provenant de tous les modules
- ✅ Traitement coordonné des escalades multi-modules
- ✅ Escalade vers la Direction Générale si nécessaire

#### Coordination DG/BMO
- ✅ Coordination des instances décisionnelles (conférences critiques)
- ✅ Coordination des échanges structurés escaladés
- ✅ Coordination des messages externes stratégiques

#### Vision transverse consolidée
- ✅ Projets sensibles nécessitant une attention de la Direction
- ✅ Risques majeurs consolidés (projets, litiges, QSE, système)
- ✅ Conformité globale (SLA, réglementaire, audits)
- ✅ Synthèses périodiques pour la Direction Générale et la Direction BMO

### Pourquoi il n'est pas un module Analytics

- ❌ Il n'affiche **pas** de tendances, comparatifs, graphiques analytiques
- ❌ Il n'affiche **pas** d'analyses détaillées avec drill-down
- ❌ Il n'affiche **pas** d'insights analytiques
- ✅ Il affiche **uniquement** des KPIs stratégiques consolidés (synthétiques)
- ✅ Il affiche **uniquement** des données critiques agrégées
- ✅ Il est **complémentaire** au module Analytics qui fournit les analyses détaillées

### Pourquoi il n'est pas un module opérationnel

- ❌ Il ne **traite pas** les demandes, validations, paiements, tickets, missions
- ❌ Il ne **gère pas** les écrans opérationnels complets
- ❌ Il ne **remplace pas** les modules Exécution, Projets, RH, Finance
- ✅ Il **agrège** uniquement les éléments critiques nécessitant une décision de la Direction
- ✅ Il **consolide** uniquement les signaux stratégiques
- ✅ Il est **complémentaire** aux modules opérationnels qui gèrent l'exécution complète

### Pourquoi il doit rester dans maitre-ouvrage/governance

- ✅ Il est dédié au **maître d'ouvrage** et à la **direction générale**
- ✅ Il fournit une vision **stratégique** et **transverse**
- ✅ Il coordonne les **instances décisionnelles** de haut niveau
- ✅ Il ne doit **pas** être dans analytics/ (pas d'analyses détaillées)
- ✅ Il ne doit **pas** être dans pilotage/ (vision stratégique, pas opérationnelle)
- ✅ Il ne doit **pas** être dans systeme/ (gouvernance métier, pas technique)
- ✅ Il ne doit **pas** être dans execution/ (pas d'exécution opérationnelle)
- ✅ Il ne doit **pas** être dans projets/, rh/, finance/, communication/ (vision transverse, pas module spécifique)

---

## RÉSUMÉ

Le module **Gouvernance** (`maitre-ouvrage/governance`) est le centre de supervision stratégique dédié au maître d'ouvrage et à la direction générale de l'ERP BTP Yessalate BMO. Il centralise la vision consolidée de l'ensemble des activités pour permettre aux dirigeants de prendre des décisions éclairées et de coordonner les actions transverses.

**8 onglets obligatoires** structurent le module :
1. Vue stratégique (tableau de bord consolidé avec KPIs stratégiques)
2. Décisions & Arbitrages (décisions stratégiques, arbitrages à fort impact)
3. Escalades & Blocages critiques (agrégation multi-modules)
4. Projets sensibles & Priorités (surveillance projets critiques)
5. Risques majeurs & Exposition (consolidation risques, exposition globale)
6. Conformité & Engagement global (SLA, réglementaire, audits)
7. Instances & Coordination (conférences, échanges, messages stratégiques)
8. Synthèse DG / BMO (rapports consolidés, recommandations IA)

Le module **ne remplace pas** les modules opérationnels (Exécution, Projets, RH, Finance, etc.), le Centre d'alertes, le Calendrier, ni le module Analytics. Il **les agrège** pour fournir une vision stratégique consolidée à la Direction, en affichant uniquement les éléments critiques et les KPIs synthétiques (pas d'analyses détaillées).

---

**Document généré : Module Gouvernance - Maître d'Ouvrage**  
**Version : 1.0**  
**Date : Janvier 2025**  
**Route : maitre-ouvrage/governance**  
**Catégorie : MAÎTRE D'OUVRAGE**  
**Nature : Gouvernance stratégique, arbitrage, supervision**

