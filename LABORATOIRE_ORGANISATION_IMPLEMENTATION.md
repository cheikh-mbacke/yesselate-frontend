# Laboratoire d'Organisation - Implémentation

## 📋 Vue d'ensemble

Transformation des pages "Alertes & Risques" et "Calendrier & Organisation" en véritable laboratoire d'organisation et de pilotage multi-bureaux pour le BMO.

---

## ✅ COMPOSANTS CRÉÉS

### 1. **Page Alertes & Risques** (Enrichie)

#### Composants ajoutés :

**`EscalateToBMOModal.tsx`**
- Modale d'escalade avec destinataire **BMO fixe et non modifiable**
- Message automatique prérempli avec contexte de l'alerte
- Pièces jointes
- Enregistrement dans le journal d'actions
- **Règle métier** : Toute escalade remonte obligatoirement vers le BMO

**`ResolveAlertModal.tsx`**
- Modale de résolution avec :
  - Historique du blocage
  - Causes probables (auto-détectées)
  - Actions recommandées :
    - Substituer un responsable
    - Relancer un bureau
    - Replanifier
    - Ajouter une note
    - Marquer comme résolu
- Note de résolution obligatoire
- Traçabilité complète

**Intégrations dans `page.tsx`** :
- Bouton "Résoudre" ajouté sur chaque alerte
- Gestion d'état pour modales
- Actions fonctionnelles avec journalisation

---

### 2. **Page Calendrier & Organisation** (En cours)

#### Composants créés :

**`ActivityDetailsPanel.tsx`**
- Panneau latéral pour détails d'activité
- Informations complètes :
  - Participants avec statut de confirmation
  - Conflits détectés
  - Dépendances
  - Notes (ajout/modification)
- Actions :
  - Modifier
  - Replanifier
  - Marquer terminé
  - Annuler

**`ActivityPlanningModal.tsx`**
- Modale de planification collaborative
- Formulaire complet :
  - Bureau concerné (obligatoire)
  - Type d'activité (réunion, intervention, audit, formation...)
  - Projet lié
  - Participants
  - Charge estimée
  - Dépendances
- Détection automatique des conflits
- Validation avec vérifications

---

## 🔧 TYPES ENRICHIS

### `CalendarEvent` (src/lib/types/bmo.types.ts)

Ajouts pour coordination multi-bureaux :
```typescript
- bureau?: string; // Bureau principal responsable
- involvedBureaux?: string[]; // Bureaux impliqués
- estimatedCharge?: number; // Charge estimée en heures
- dependencies?: string[]; // IDs d'événements dépendants
- participants?: ActivityParticipant[]; // Participants avec rôles
- documents?: string[]; // Documents liés
- risks?: string[]; // Risques associés
- notes?: ActivityNote[]; // Notes contextuelles
- status?: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
- conflicts?: ConflictDetection[]; // Conflits détectés automatiquement
```

### Nouveaux types :
- `ActivityParticipant` : Participant avec rôle et statut
- `ActivityNote` : Note avec auteur et type
- `ConflictDetection` : Détection de conflits (chevauchement, ressources, absences, surcharges, dépendances)

---

## 🎯 RÈGLES MÉTIER IMPLÉMENTÉES

### 1. Escalade obligatoire vers BMO
- ✅ Destinataire BMO fixe, non modifiable
- ✅ Message automatique prérempli
- ✅ Traçabilité complète
- ✅ Statut de l'alerte mis à jour : "Escaladée au BMO"

### 2. Actions fonctionnelles
- ✅ Aucun bouton décoratif
- ✅ Chaque action génère un log dans le journal
- ✅ Traçabilité complète des actions
- ✅ Notifications et toasts pour feedback utilisateur

### 3. Détection automatique
- ✅ Conflits dans la modale de planification
- ✅ Affichage des conflits dans le panneau de détails
- ✅ Surcharges calculées automatiquement

---

## 📦 À IMPLÉMENTER (Priorités)

### Priorité 1 : Composants calendrier manquants

1. **Timeline multi-bureaux** (`MultiBureauTimeline.tsx`)
   - Vue timeline par bureau (chaque ligne = un bureau)
   - Affichage des activités par bureau
   - Couleurs par type/priorité/statut
   - Zoom jour/semaine/mois
   - Détection visuelle des conflits

2. **Simulateur de replanification** (`RescheduleSimulator.tsx`)
   - Propose des créneaux alternatifs
   - Vérifie disponibilités des bureaux
   - Vérifie absences
   - Vérifie surcharges
   - Vérifie conflits de projet

3. **Journal d'organisation** (`OrganizationJournal.tsx`)
   - Historique complet des actions
   - Filtrable par bureau, projet, type d'action
   - Intégré dans la page calendrier

### Priorité 2 : Logique de détection avancée

1. **Détection de conflits automatique**
   - Chevauchements temporels
   - Conflits de ressources
   - Absences simultanées
   - Surcharges (trop d'événements/jour)
   - Dépendances non respectées

2. **Détection de surcharges**
   - Calcul par bureau
   - Seuil configurable (ex: >3 événements/jour)
   - Alertes visuelles

3. **Détection d'absences**
   - Vérification lors de la planification
   - Alertes si participants absents
   - Suggestions de substitution

---

## 🔄 INTÉGRATION DANS LA PAGE CALENDRIER

### Structure proposée :

```typescript
// app/(portals)/maitre-ouvrage/calendrier/page.tsx

1. Vue par onglets :
   - Vue d'ensemble (actuelle)
   - Timeline multi-bureaux (nouveau)
   - Journal d'organisation (nouveau)

2. Modale planification intégrée :
   - Bouton "+ Ajouter" ouvre ActivityPlanningModal
   - Validation déclenche :
     - Détection de conflits
     - Notification aux bureaux
     - Ajout au calendrier global

3. Panneau de détails :
   - Clic sur événement → ActivityDetailsPanel
   - Actions contextuelles

4. Simulateur de replanification :
   - Bouton "Replanifier" dans ActivityDetailsPanel
   - Ouvre RescheduleSimulator
```

---

## 📊 EXEMPLES D'UTILISATION

### Exemple 1 : Escalade d'alerte

```
1. Utilisateur clique sur "Escalader" sur une alerte critique
2. Modale EscalateToBMOModal s'ouvre
3. Destinataire : BMO (fixe, non modifiable)
4. Message prérempli avec contexte
5. Utilisateur ajoute justification
6. Clic "Escalader au BMO"
7. Action loggée
8. Statut alerte : "Escaladée au BMO"
9. Notification envoyée au BMO
```

### Exemple 2 : Planification d'activité

```
1. Utilisateur clique "+ Ajouter"
2. ActivityPlanningModal s'ouvre
3. Remplit formulaire :
   - Bureau : BF
   - Type : Réunion
   - Date : 2025-12-30
   - Participants : ...
4. Système détecte conflit (surcharge BF)
5. Affiche warning dans modale
6. Utilisateur peut :
   - Continuer (avec warning)
   - Modifier date
   - Utiliser simulateur de replanification
7. Validation :
   - Activité ajoutée au calendrier
   - Bureaux notifiés
   - Conflits signalés
```

### Exemple 3 : Résolution d'alerte

```
1. Utilisateur clique "Résoudre" sur alerte bloquée
2. ResolveAlertModal s'ouvre
3. Affiche :
   - Historique du blocage
   - Causes probables
   - Actions recommandées
4. Utilisateur choisit action (ex: Substituer)
5. Ou ajoute note et marque résolu
6. Action loggée
7. Alerte mise à jour
```

---

## 🎨 DESIGN & UX

### Principes respectés :
- ✅ Cohérence avec design existant
- ✅ Thème sombre préservé
- ✅ Logique de couleurs (orange=alertes, rouge=critique, bleu=neutre)
- ✅ Modales et panneaux latéraux uniformes
- ✅ Feedback visuel (toasts, badges, états)

---

## 📝 PROCHAINES ÉTAPES

1. **Compléter la page Calendrier** :
   - Intégrer ActivityPlanningModal
   - Intégrer ActivityDetailsPanel
   - Ajouter vue Timeline multi-bureaux
   - Créer RescheduleSimulator

2. **Améliorer la détection automatique** :
   - Algorithme de détection de conflits
   - Calcul des surcharges
   - Vérification des absences

3. **Journal d'organisation** :
   - Composant dédié
   - Filtres avancés
   - Export possible

4. **Tests et validation** :
   - Tester tous les flux
   - Valider règles métier
   - Vérifier traçabilité

---

## ✅ RÉSUMÉ DES LIVRABLES

### Composants créés :
- ✅ `EscalateToBMOModal.tsx` - Escalade vers BMO (fixe)
- ✅ `ResolveAlertModal.tsx` - Résolution avec historique
- ✅ `ActivityDetailsPanel.tsx` - Panneau détails activité
- ✅ `ActivityPlanningModal.tsx` - Planification collaborative
- ✅ Types enrichis (`CalendarEvent`, `ActivityParticipant`, etc.)

### Pages enrichies :
- ✅ `app/(portals)/maitre-ouvrage/alerts/page.tsx` - Modales intégrées
- 🔄 `app/(portals)/maitre-ouvrage/calendrier/page.tsx` - À compléter

### Fonctionnalités :
- ✅ Escalade BMO (règle métier stricte)
- ✅ Résolution d'alertes avec actions
- ✅ Planification avec détection de conflits
- 🔄 Timeline multi-bureaux (à créer)
- 🔄 Simulateur de replanification (à créer)
- 🔄 Journal d'organisation (à créer)

---

**Note** : La structure est en place. Les composants restants suivent la même architecture et peuvent être ajoutés progressivement.

