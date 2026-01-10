# 🗺️ Guide de Navigation - Page Calendrier Refactorisée

## 🎯 Vue d'Ensemble

La page **Calendrier** utilise maintenant une **architecture workspace moderne** avec des onglets dynamiques, une command palette, et des raccourcis clavier professionnels.

---

## 🏠 Dashboard (Écran d'Accueil)

Quand vous ouvrez la page calendrier **sans onglets ouverts**, vous voyez :

```
┌─────────────────────────────────────────────────────────┐
│  📅 Console métier — Calendrier                         │
│  [v2.0] [2 retard SLA] [1 conflit]                     │
│                                                         │
│  [➕ Nouveau] | [📅 Aujourd'hui] [📆 Semaine]          │
│  [⏰ Retard SLA] [⚠️ Conflits] [✅ Terminés]           │
│  | [📊 Stats] [⬇️ Exporter] [🔄] [?]                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ⚠️ ALERTES                                             │
│  [⏰ En retard SLA (2)] [⚠️ Conflits (1)]              │
│                                                         │
│  📊 ÉTAT DU CALENDRIER                                 │
│  ┌────┬────┬────┬────┬────┐                           │
│  │📅 3│📆12│⏰ 2│⚠️ 1│✅29│                           │
│  │Auj.│Sem.│SLA │Conf│Ter.│                           │
│  └────┴────┴────┴────┴────┘                           │
│                                                         │
│  🎯 ACTIONS RAPIDES                                    │
│  [➕ Nouvel événement] [📊 Statistiques]               │
│  [⬇️ Exporter]         [📄 Rapport]                    │
│                                                         │
│  ⌨️ RACCOURCIS CLAVIER                                 │
│  Ctrl+K    Palette de commandes                        │
│  Ctrl+N    Nouvel événement                            │
│  Ctrl+1    Aujourd'hui                                 │
│  Ctrl+2    Cette semaine                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📑 Navigation par Onglets

### Ouvrir un Onglet

**Méthode 1 : Clic sur les boutons**
- Cliquez sur **"Aujourd'hui"** → Ouvre l'onglet "📅 Aujourd'hui"
- Cliquez sur **"Semaine"** → Ouvre l'onglet "📆 Cette semaine"
- Cliquez sur **"Retard SLA"** → Ouvre l'onglet "⏰ En retard SLA"

**Méthode 2 : Raccourcis clavier**
- `Ctrl+1` → Aujourd'hui
- `Ctrl+2` → Cette semaine
- `Ctrl+3` → Retard SLA
- `Ctrl+4` → Conflits
- `Ctrl+5` → Terminés

**Méthode 3 : Command Palette**
- `Ctrl+K` → Ouvrir la palette
- Taper "aujourd" → Enter

### Naviguer entre Onglets

```
Ctrl+Tab       → Onglet suivant
Ctrl+Shift+Tab → Onglet précédent
Ctrl+W         → Fermer l'onglet actif
```

### Exemple d'État avec Onglets

```
┌─────────────────────────────────────────────────────────┐
│  📅 Console métier — Calendrier                         │
├─────────────────────────────────────────────────────────┤
│  ONGLETS                                                │
│  ┌──────────┬──────────┬──────────┐ [X Tout fermer]   │
│  │📅 Auj.   │📆 Sem.   │⏰ SLA    │                    │
│  │  (actif) │          │          │                    │
│  └──────────┴──────────┴──────────┘                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CONTENU DE L'ONGLET                                   │
│  (Liste des événements d'aujourd'hui)                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Command Palette (Ctrl+K)

La **palette de commandes** est votre outil principal de navigation.

### Ouvrir
```
Ctrl+K  ou  Cmd+K (Mac)
```

### Interface
```
┌─────────────────────────────────────────────────────────┐
│  🔍 Rechercher une commande...              [Esc]       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CRÉATION                                               │
│  ✚  Nouvel événement                      Ctrl+N       │
│                                                         │
│  NAVIGATION                                             │
│  📅 Événements d'aujourd'hui              Ctrl+1       │
│  📆 Cette semaine                         Ctrl+2       │
│  ⏰ En retard SLA                         Ctrl+3       │
│  ⚠️ Conflits détectés                    Ctrl+4       │
│  ✅ Événements terminés                   Ctrl+5       │
│  📊 Vue Gantt                             Ctrl+G       │
│                                                         │
│  ACTIONS                                                │
│  📊 Statistiques                          Ctrl+S       │
│  ⬇️ Exporter le calendrier                Ctrl+E       │
│  🖨️ Imprimer                              Ctrl+P       │
│                                                         │
│  PARAMÈTRES                                             │
│  🌙 Activer le mode sombre                             │
│  ⌨️ Raccourcis clavier                    Shift+?      │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  15 commandes          [↑↓] Naviguer  [↵] Sélectionner │
└─────────────────────────────────────────────────────────┘
```

### Navigation
- `↑` `↓` : Naviguer dans les résultats
- `Enter` : Exécuter la commande sélectionnée
- `Esc` : Fermer la palette
- Tapez pour filtrer (recherche fuzzy)

---

## 📊 Viewer d'Événement

Quand vous ouvrez un événement (clic sur un événement dans une liste), vous obtenez le **Viewer** avec **Explorer**.

### Structure
```
┌────────────────────────────────────────────────────────────────┐
│  📅 Console métier — Calendrier                                │
├────────────────────────────────────────────────────────────────┤
│  [📅 Auj.] [📆 Sem.] [📌 Réunion suivi projet] ← onglets     │
├──────────────┬─────────────────────────────────────────────────┤
│ EXPLORER     │  CONTENU                                       │
│              │                                                │
│ [📄 Vue]     │  📌 Réunion de suivi projet                   │
│ [📝 Détails] │  Revue d'avancement mensuelle                 │
│ [👥 Partic.] │                                                │
│ [📍 Logist.] │  [✏️ Modifier] [📅 Déplacer] [❌ Annuler]     │
│ [⚠️ Conflits]│                                                │
│ [⏰ SLA]     │  VUE D'ENSEMBLE                                │
│ [📜 Historiq]│  Type:       Réunion                          │
│              │  Bureau:     BMO                               │
│ [⊲ Replier]  │  Début:      09/01/2026 14:00                 │
│              │  Fin:        09/01/2026 15:00                 │
│              │  Statut:     Ouvert                            │
│              │                                                │
└──────────────┴─────────────────────────────────────────────────┘
```

### Navigation dans l'Explorer
Cliquez sur les sections pour naviguer :
- **📄 Vue d'ensemble** : Infos principales
- **📝 Détails** : Description complète, notes
- **👥 Participants** : Liste des participants
- **📍 Logistique** : Lieu, équipement, budget
- **⚠️ Conflits** : Conflits de planning détectés
- **⏰ SLA** : État des échéances
- **📜 Historique** : Modifications, audit trail

### Actions Rapides
- **✏️ Modifier** : Ouvre modal d'édition
- **📅 Déplacer** : Ouvre modal pour changer date/heure
- **❌ Annuler** : Ouvre modal d'annulation

---

## ⚡ Raccourcis Clavier (Cheatsheet)

### Navigation
```
Ctrl+1         Aujourd'hui
Ctrl+2         Cette semaine
Ctrl+3         En retard SLA
Ctrl+4         Conflits
Ctrl+5         Terminés
Ctrl+G         Vue Gantt
```

### Actions
```
Ctrl+N         Nouvel événement
Ctrl+K         Command Palette
Ctrl+S         Statistiques
Ctrl+E         Export
Ctrl+P         Imprimer
Shift+?        Aide
```

### Onglets
```
Ctrl+Tab       Onglet suivant
Ctrl+Shift+Tab Onglet précédent
Ctrl+W         Fermer onglet actif
```

### Palette
```
↑ ↓            Naviguer
Enter          Exécuter
Esc            Fermer
```

---

## 🎨 Modales

### Statistiques (Ctrl+S)
```
┌─────────────────────────────────────────┐
│  📊 Statistiques — Calendrier           │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────┬─────────┐                 │
│  │    3    │   12    │                 │
│  │ Auj.    │ Semaine │                 │
│  └─────────┴─────────┘                 │
│  ┌─────────┬─────────┐                 │
│  │    2    │    1    │                 │
│  │ SLA     │ Conflits│                 │
│  └─────────┴─────────┘                 │
│                                         │
│  ☑ Actualiser automatiquement (60s)    │
│                                         │
│  [🔄 Actualiser] [Fermer]              │
└─────────────────────────────────────────┘
```

### Export (Ctrl+E)
```
┌─────────────────────────────────────────┐
│  ⬇️ Exporter le calendrier              │
├─────────────────────────────────────────┤
│                                         │
│  Période:                               │
│  [▼ Cette semaine                    ]  │
│      Aujourd'hui                        │
│      Cette semaine                      │
│      Ce mois                            │
│      Tous les événements                │
│                                         │
│  Format:                                │
│  [▼ iCal (Outlook, Google Calendar)  ]  │
│      iCal (Outlook, Google Calendar)    │
│      CSV (Excel)                        │
│      JSON (données structurées)         │
│      PDF (document imprimable)          │
│                                         │
│  [Annuler] [⬇️ Télécharger]            │
└─────────────────────────────────────────┘
```

---

## 🎯 Workflows Typiques

### 1. Créer un Nouvel Événement
```
1. Ctrl+N (ou clic sur "Nouveau")
2. Remplir le formulaire
3. Valider
```

### 2. Voir les Événements du Jour
```
1. Ctrl+1 (ou clic sur "Aujourd'hui")
2. Consulter la liste
3. Clic sur un événement pour détails
```

### 3. Résoudre un Conflit
```
1. Ctrl+4 (ou clic sur badge "1 conflit")
2. Voir les événements en conflit
3. Clic sur événement
4. Section "Conflits" → détails
5. "Déplacer" pour résoudre
```

### 4. Exporter le Planning de la Semaine
```
1. Ctrl+E
2. Période: "Cette semaine"
3. Format: "iCal" (pour Outlook/Google)
4. Télécharger
```

### 5. Navigation Multi-Onglets
```
1. Ctrl+1 → Onglet "Aujourd'hui"
2. Ctrl+2 → Onglet "Semaine"
3. Ctrl+Tab → Alterner entre onglets
4. Ctrl+W → Fermer onglet actif
```

---

## 💡 Conseils Pro

### 🚀 Vitesse
- **Apprenez 3 raccourcis** : `Ctrl+K`, `Ctrl+1`, `Ctrl+N`
- Utilisez la **Command Palette** pour tout
- Naviguez avec **Ctrl+Tab** entre onglets

### 📊 Organisation
- **Aujourd'hui** (Ctrl+1) : focus quotidien
- **Semaine** (Ctrl+2) : planification
- **Retard SLA** (Ctrl+3) : urgences

### 🎨 Personnalisation
- Mode sombre : Ctrl+K → "mode sombre"
- Auto-refresh : Stats → cocher la case

### 🔍 Recherche Rapide
- Ctrl+K → taper quelques lettres
- Exemple : "conf" trouve "Conflits détectés"

---

## 🆘 Aide

### En Cas de Doute
```
1. Appuyez sur Shift+?  → Voir tous les raccourcis
2. Appuyez sur Ctrl+K   → Rechercher une commande
3. Cliquez sur [?]      → Aide contextuelle
```

### Support
Les composants affichent des **tooltips** au survol des boutons.

---

**🎉 Vous êtes maintenant prêt à naviguer comme un pro dans la nouvelle page Calendrier !**

*"Moins de clics, plus de productivité."* 🚀

