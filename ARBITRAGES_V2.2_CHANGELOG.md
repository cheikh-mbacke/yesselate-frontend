# 🚀 Arbitrages v2.2 - Changelog Complet

## ✅ Nouvelle Version Refactor

### 1. Page Refactorisée (`page.tsx`)

**Nouvelles Fonctionnalités :**
- ✅ **Dashboard en 6+1 blocs** : Vue synthétique et lisible
- ✅ **Mode Dashboard / Workspace** : Persisté en localStorage
- ✅ **Fullscreen mode** : F11 ou Ctrl+Shift+F
- ✅ **Auto-refresh intelligent** : 
  - Intervalle configurable (30s, 60s, 120s)
  - Pause automatique quand onglet masqué
  - Indicateur visuel dans badges
- ✅ **Rail d'escalade** : Top 5 décisions critiques triées par score
- ✅ **Raccourcis clavier robustes** :
  - Ignorent les inputs (typing safe)
  - Ctrl/⌘ + 1-4 : Ouvrir files
  - Ctrl/⌘ + N : Nouvel arbitrage
  - Ctrl/⌘ + K : Palette de commandes
  - Ctrl/⌘ + S : Stats
  - Ctrl/⌘ + E : Export
  - F11 : Fullscreen
  - ? : Aide
  - Esc : Ferme modales et fullscreen
- ✅ **StatCards cliquables** : Ouvrent directement les files
- ✅ **Persistance UI** : Mode, fullscreen, auto-refresh stockés
- ✅ **Événements custom** : `arbitrages:open-stats`, etc.

### 2. Nouvelle API Escalade

**`GET /api/arbitrages/escalade`**
- Retourne les Top 5 arbitrages à traiter en priorité
- Score calculé : criticité × retard × exposition
- Tri décroissant par score

### 3. API Stats Améliorée

**`GET /api/arbitrages/stats`**
- Nouveau champ `enRetard` : Compte les arbitrages en retard
- Nouveau champ `expositionTotale` : Somme des expositions financières
- Champs existants maintenus

### 4. Corrections Next.js 15+

Tous les fichiers API avec paramètres dynamiques mis à jour :
- `params: Promise<{ id: string }>` au lieu de `params: { id: string }`
- `await params` pour accéder aux valeurs

**Fichiers corrigés :**
- `app/api/arbitrages/[id]/route.ts`
- `app/api/arbitrages/[id]/timeline/route.ts`
- `app/api/arbitrages/[id]/trancher/route.ts`
- `app/api/arbitrages/[id]/reporter/route.ts`
- `app/api/arbitrages/[id]/complement/route.ts`
- `app/api/arbitrages/notifications/[id]/route.ts`
- `app/api/bureaux/[code]/route.ts`

### 5. Corrections de Types

**`src/lib/types/bmo.types.ts`**
- Ajout de nouveaux ActionLogType :
  - `generate_ordre_mission`, `approve`, `reject`
  - `respond`, `forward`, `archive`, `transfer`
  - `view_profile`, `view`, `update`, `delete`
  - `assign`, `unassign`, `activate`, `deactivate`
  - `send`, `receive`, `complete`, `cancel`, `schedule`, `reschedule`

**`app/(portals)/maitre-ouvrage/calendrier/types.ts`**
- Nouveau fichier de types partagés pour le calendrier
- Export : `CalendarItem`, `Priority`, `Severity`, `Status`, `CalendarKind`

### 6. Corrections Diverses

- `app/(portals)/maitre-ouvrage/echanges-structures/page.tsx` : Cast TypeFilter corrigé
- `app/(portals)/maitre-ouvrage/litiges/page.tsx` : Référence circulaire résolue
- `app/(portals)/maitre-ouvrage/logs/page.tsx` : Partial<Record> pour actionConfig
- `app/(portals)/maitre-ouvrage/messages-externes/page.tsx` : Type addToast corrigé

---

## 📁 Fichiers Créés

```
app/api/arbitrages/escalade/route.ts       # Nouvelle API escalade
app/(portals)/maitre-ouvrage/calendrier/types.ts  # Types partagés calendrier
```

## 📁 Fichiers Modifiés

```
app/(portals)/maitre-ouvrage/arbitrages-vivants/page.tsx  # Refactoring complet
app/api/arbitrages/stats/route.ts           # Ajout enRetard, expositionTotale
app/api/arbitrages/[id]/route.ts            # Next.js 15+ params
app/api/arbitrages/[id]/timeline/route.ts   # Next.js 15+ params
app/api/arbitrages/[id]/trancher/route.ts   # Next.js 15+ params
app/api/arbitrages/[id]/reporter/route.ts   # Next.js 15+ params
app/api/arbitrages/[id]/complement/route.ts # Next.js 15+ params
app/api/arbitrages/notifications/[id]/route.ts  # Next.js 15+ params
app/api/bureaux/[code]/route.ts             # Next.js 15+ params
src/lib/types/bmo.types.ts                  # Nouveaux ActionLogType
app/(portals)/maitre-ouvrage/echanges-structures/page.tsx  # TypeFilter fix
app/(portals)/maitre-ouvrage/litiges/page.tsx              # Ref circulaire fix
app/(portals)/maitre-ouvrage/logs/page.tsx                 # Partial Record fix
app/(portals)/maitre-ouvrage/messages-externes/page.tsx    # addToast type fix
app/(portals)/maitre-ouvrage/calendrier/EventModal.tsx     # Import types fix
```

---

## 🎯 Architecture Dashboard (6+1 blocs)

### Bloc 1 — Intro / Posture
Titre + description + boutons "Nouvel arbitrage" et "Aller au workspace"

### Bloc 2 — Compteurs Live
`<ArbitragesLiveCounters />` + indication raccourcis

### Bloc 3 — Synthèse Risques (4 cards)
- Ouverts (cliquable)
- Critiques (cliquable)
- Urgents (cliquable)
- Tranchés (cliquable)

### Bloc 4 — Rail d'Escalade 🆕
Top 5 décisions à trancher avec score pondéré

### Bloc 5 — Pilotage & Direction
`<ArbitragesDirectionPanel />`

### Bloc 6 — Charge, Goulots, Exposition
- En retard
- Bureaux surcharge (cliquable)
- Exposition totale

### Bloc 7 — Aide & Gouvernance
Auto-refresh toggle + intervalle + boutons Rafraîchir/Aide

---

## 📊 Calcul Score Escalade

```
score = riskMultiplier × overdueMultiplier × (1 + exposureScore)

riskMultiplier:
  - critique: 4
  - élevé: 3
  - modéré: 2
  - faible: 1

overdueMultiplier = 1 + (daysOverdue × 0.1)

exposureScore = log10(max(exposure, 1000)) / 10
```

---

## 🎹 Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl/⌘ + 1` | File Ouverts |
| `Ctrl/⌘ + 2` | File Critiques |
| `Ctrl/⌘ + 3` | File Urgents |
| `Ctrl/⌘ + 4` | File Tranchés |
| `Ctrl/⌘ + N` | Nouvel arbitrage |
| `Ctrl/⌘ + K` | Palette de commandes |
| `Ctrl/⌘ + S` | Stats |
| `Ctrl/⌘ + E` | Export |
| `F11` | Fullscreen |
| `Ctrl/⌘ + Shift + F` | Fullscreen |
| `?` | Aide |
| `Esc` | Fermer modales/fullscreen |

---

## 🔧 Persistance LocalStorage

**Clé :** `bmo.arbitrages.ui.v1`

```json
{
  "mode": "dashboard" | "workspace",
  "fullscreen": boolean,
  "autoRefresh": boolean,
  "refreshMs": number
}
```

---

## ✅ Status Final

- **Lint Errors :** 0 ✅ (dans les fichiers arbitrages)
- **API Endpoints :** 14 (10 arbitrages + 3 bureaux + 1 escalade)
- **Composants :** 10+ workspace
- **Vues :** 3 (Inbox, Arbitrage, Bureau)
- **Version :** v2.2

---

*Date : 10 janvier 2026*  
*Status : Production Ready (module arbitrages)*

