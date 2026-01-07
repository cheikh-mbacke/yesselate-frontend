# Logique Métier des Couleurs - Résumé des Changements

## 🎨 Palette de Couleurs par Rôle Métier

### **Bleu (Neutre)**
- **Usage** : Fond neutre, structure, cartes, barres, éléments neutres
- **Couleurs** : `#3B82F6`, `#2563EB`, `#6366F1`, `#06B6D4`, `#0891B2`, `#64748B`
- **Exemples** :
  - Cartes neutres du dashboard
  - Indicateurs temps réel (sans signification particulière)
  - Graphiques (différenciation visuelle des bureaux)
  - Bordures de cartes normales

### **Orange/Amber (Alertes / Priorités / Actions)**
- **Usage** : Uniquement pour alertes, priorités, actions à traiter
- **Couleurs** : `#F97316`, `#F59E0B`, `#FB923C`
- **Exemples** :
  - "Top risques" (carte et badges)
  - "Actions prioritaires" (carte)
  - Dossiers bloqués (warning)
  - Décisions en attente (pending)
  - Bouton "Substitution"
  - Badges d'alerte/attention

### **Vert (États Positifs)**
- **Usage** : Validations réussies, OK, bon taux, succès
- **Couleurs** : `#10B981`, `#059669`
- **Exemples** :
  - KPI "Validations" (taux de validation)
  - KPI "Taux validation" (indicateur temps réel)
  - Décisions exécutées
  - Bureaux avec santé "good"
  - Graphiques : projets "En cours"

### **Rouge (Rejets / Erreurs / Blocages)**
- **Usage** : Rejets, erreurs critiques, blocages critiques
- **Couleurs** : `#EF4444`, `#DC2626`
- **Exemples** :
  - KPI "Rejets"
  - Dossiers bloqués critiques (critical)
  - Alertes critiques
  - Graphiques : projets "Bloqués"
  - Bureaux avec santé "critical"

---

## ✅ Corrections Appliquées

### 1. **Dashboard (`page.tsx`)**

#### ❌ Avant (Couleurs décoratives)
- Montant traité : `text-orange-400` + `borderColor="#D4AF37"` (or)
- Validations aujourd'hui : `text-amber-400` + `borderColor="#F59E0B"`
- ID de décision : `text-orange-400`
- Montant dans actions : `text-amber-400`

#### ✅ Après (Couleurs métier)
- **Montant traité** : Texte neutre (`text-slate-200` ou `text-gray-800`) + Bordure bleue (`#6366F1`)
- **Validations aujourd'hui** : Texte bleu (`text-blue-400`) + Bordure bleue (`#3B82F6`)
- **ID de décision** : Texte neutre (`text-slate-400` ou `text-gray-500`)
- **Montant dans actions** : Texte neutre (selon thème)

### 2. **Graphique Pie Chart (`bmo-mock-3.ts`)**

#### ❌ Avant
- BMO : Orange (`#F97316`) - couleur décorative
- BCT : Rouge (`#EF4444`) - couleur décorative (non liée à un problème)

#### ✅ Après
- Tous les bureaux : Nuances de bleu/gris-bleu neutres
- BMO : `#3B82F6` (bleu principal)
- BCT : `#64748B` (slate neutre)
- Différenciation visuelle conservée avec couleurs neutres

### 3. **Couleurs des Bureaux (`bmo-mock.ts`)**

#### ❌ Avant
- BMO : Orange (`#F97316`)
- BMCM : Vert (`#10B981`) - vert décoratif, pas un état positif
- BCT : Rouge (`#EF4444`) - rouge décoratif

#### ✅ Après
- Tous les bureaux : Nuances de bleu/gris-bleu neutres
- BMO : `#3B82F6`
- BMCM : `#6366F1` (indigo)
- BCT : `#64748B` (slate)

---

## 🎯 Éléments Conservés (Usage Approprié)

Les éléments suivants conservent l'orange car ils sont liés à des **alertes/priorités/actions** :

✅ **Top risques** - Bordure et badges orange (correct)
✅ **Actions prioritaires** - Bordure orange (correct)
✅ **Dossiers bloqués** - Badges orange/amber pour warning (correct)
✅ **Décisions pending** - Bordure amber (correct)
✅ **Substitution** - Badge orange pour action (correct)

---

## 📊 Harmonisation des Graphiques

### Pie Chart Bureaux
- **Avant** : Mélange orange/rouge/vert décoratifs
- **Après** : Nuances de bleu uniquement (neutre pour différenciation visuelle)

### Pie Chart Statut Projets
- **En cours** : Vert (`#10B981`) ✅ - État positif
- **Bloqués** : Rouge (`#EF4444`) ✅ - Problème
- **Terminés** : Bleu (`#3B82F6`) ✅ - Neutre

---

## 🔍 Règles de Base

1. **Orange** = Alertes, priorités, actions à traiter UNIQUEMENT
2. **Vert** = États positifs (validations, OK, succès)
3. **Rouge** = Rejets, erreurs, blocages critiques
4. **Bleu/Gris** = Neutre (structure, cartes normales, différenciation visuelle)
5. **Pas d'orange décoratif** sur les éléments neutres

---

## 📝 Checklist de Vérification

- [x] Montant traité : Neutre (bleu/gris)
- [x] Validations aujourd'hui : Bleu (neutre)
- [x] IDs et références : Neutres (gris)
- [x] Graphiques bureaux : Tous bleus (neutres)
- [x] Couleurs bureaux : Toutes neutres
- [x] Top risques : Orange conservé (correct)
- [x] Actions prioritaires : Orange conservé (correct)
- [x] Dossiers bloqués : Orange/rouge selon sévérité (correct)

