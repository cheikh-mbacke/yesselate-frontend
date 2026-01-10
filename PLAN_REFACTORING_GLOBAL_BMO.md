# 🎯 PLAN DE REFACTORING GLOBAL - BMO

## Vue d'ensemble

**Objectif:** Appliquer le même niveau de sophistication que la page "Dossiers Bloqués" à **TOUTES** les pages du BMO.

**Pages totales:** 35 pages  
**Temps estimé:** ~2-3 jours de travail intensif  
**Résultat:** Interface de pilotage enterprise-grade uniforme

---

## 📊 Analyse des pages existantes

### 🏆 **Niveau 5 - Excellence (déjà fait)**
| Page | Lignes | État | Notes |
|------|--------|------|-------|
| `blocked` | 980 | ✅ Terminé | Modèle de référence |
| `demandes` | ~600 | ✅ Bon | Workspace sophistiqué |
| `demandes-rh` | ~636 | ✅ Bon | Workspace sophistiqué |
| `calendrier` | ~983 | ✅ Bon | Workspace sophistiqué |

### ⭐ **Niveau 4 - Avancé (amélioration modérée)**
| Page | Lignes | État | À faire |
|------|--------|------|---------|
| `arbitrages-vivants` | 1676 | ⚠️ Complexe | Workspace + WebSocket |
| `delegations` | 2404 | ⚠️ Très complexe | Refactoring architecture |
| `governance` | ~800 | ⚠️ Avancé | Command Palette + Audit |
| `alerts` | 915 | ⚠️ Avancé | WebSocket + Push |
| `analytics` | 454 | ⚠️ Avancé | Temps réel |

### 🔧 **Niveau 3 - Intermédiaire (refactoring significatif)**
| Page | Lignes | État | À faire |
|------|--------|------|---------|
| `litiges` | 691 | 🔶 Moyen | Workspace complet |
| `finances` | 511 | 🔶 Moyen | Workspace + Rapports |
| `projets-en-cours` | 261 | 🔶 Basique | Refonte totale |
| `validation-bc` | 1034 | 🔶 Moyen | Workspace + Audit |
| `tickets-clients` | ~500 | 🔶 Moyen | Workspace complet |

### 🔴 **Niveau 2 - Basique (refonte majeure)**
| Page | Lignes | État | À faire |
|------|--------|------|---------|
| `depenses` | ~300 | 🔶 Basique | Refonte totale |
| `missions` | ~300 | 🔶 Basique | Refonte totale |
| `recouvrements` | ~300 | 🔶 Basique | Refonte totale |
| `paie-avances` | ~300 | 🔶 Basique | Refonte totale |
| `evaluations` | ~200 | 🔶 Basique | Refonte totale |
| `clients` | ~250 | 🔶 Basique | Refonte totale |
| `employes` | ~250 | 🔶 Basique | Refonte totale |
| `deplacements` | ~200 | 🔶 Basique | Refonte totale |

### ⚪ **Niveau 1 - Placeholder (création from scratch)**
| Page | État | À faire |
|------|------|---------|
| `validation-contrats` | 🔴 Placeholder | Création complète |
| `validation-paiements` | 🔴 Placeholder | Création complète |
| `conferences` | 🔴 Placeholder | Création complète |
| `echanges-bureaux` | 🔴 Placeholder | Création complète |
| `echanges-structures` | 🔴 Placeholder | Création complète |
| `messages-externes` | 🔴 Placeholder | Création complète |
| `organigramme` | 🔴 Placeholder | Création complète |
| `substitution` | 🔴 Placeholder | Création complète |
| `decisions` | 🔴 Placeholder | Création complète |
| `audit` | 🔴 Placeholder | Création complète |
| `logs` | 🔴 Placeholder | Création complète |
| `system-logs` | 🔴 Placeholder | Création complète |
| `parametres` | 🔴 Placeholder | Création complète |
| `ia` | 🔴 Placeholder | Création complète |
| `api` | 🔴 Placeholder | Création complète |

---

## 🎯 Fonctionnalités à implémenter par page

### **Package standard (toutes les pages)**

```
✅ Workspace tabs dynamiques
✅ Command Palette (⌘K)
✅ Zustand store dédié
✅ Live counters avec stats
✅ Toast notifications
✅ Filtres avancés + recherche
✅ Tri multi-colonnes
✅ Pagination
✅ Export (JSON, CSV, XLSX, PDF)
✅ Modal statistiques
✅ Raccourcis clavier
✅ Auto-refresh
✅ Dark mode complet
✅ Responsive
```

### **Package avancé (pages critiques)**

```
✅ WebSocket temps réel
✅ Push notifications navigateur
✅ Rapports automatiques programmés
✅ Audit trail SHA-256
✅ Actions en lot (bulk)
✅ Wizard multi-étapes
✅ Vues multiples (inbox, detail, matrix, timeline, etc.)
✅ Centre de décision dédié
✅ Templates prédéfinis
✅ Watchlist (favoris)
✅ Filtres sauvegardés
✅ Predictive analytics
```

---

## 📋 Plan de travail par priorité

### 🔥 **PRIORITÉ 1 - Pages critiques métier** (Jour 1)

Ces pages sont essentielles pour le pilotage BMO.

#### 1.1 `validation-bc` → Validation des Bons de Commande
```
- Workspace complet (Inbox, Detail, Matrix, Audit)
- Actions: Valider, Rejeter, Demander info, Escalader
- WebSocket pour nouvelles validations
- Rapports quotidiens
- Audit SHA-256
```

#### 1.2 `validation-contrats` → Validation des Contrats
```
- Création from scratch
- Même architecture que validation-bc
- Vues: Liste, Détail, Comparaison, Timeline
- Actions: Valider, Négocier, Rejeter, Escalader
```

#### 1.3 `validation-paiements` → Validation des Paiements
```
- Création from scratch
- Vues: En attente, Validés, Rejetés, Échéancier
- Actions: Valider, Bloquer, Planifier, Escalader
- Alertes trésorerie
```

#### 1.4 `finances` → Tableau de bord financier
```
- Refactoring complet
- Vues: Gains, Pertes, Trésorerie, Prévisions
- Charts interactifs temps réel
- Alertes budget
```

---

### ⚡ **PRIORITÉ 2 - Pages opérationnelles** (Jour 1-2)

#### 2.1 `projets-en-cours` → Gestion des projets
```
- Refonte totale
- Vues: Kanban, Liste, Gantt, Matrix
- Indicateurs avancement
- Alertes retard
```

#### 2.2 `litiges` → Gestion des litiges
```
- Amélioration significative
- Vues: Liste, Détail, Calendrier audiences, Risques
- Actions: Escalader, Négocier, Clôturer
- Audit juridique
```

#### 2.3 `recouvrements` → Gestion des recouvrements
```
- Refonte
- Vues: Créances, Échéancier, Relances, Stats
- Actions: Relancer, Négocier, Contentieux
- Alertes impayés
```

#### 2.4 `depenses` → Gestion des dépenses
```
- Refonte
- Vues: Par catégorie, Par projet, Par période
- Analyse comparative
- Alertes dépassement
```

---

### 📊 **PRIORITÉ 3 - Pages analytiques** (Jour 2)

#### 3.1 `analytics` → Analytics avancée
```
- Amélioration
- Dashboards temps réel
- Drill-down interactif
- Rapports personnalisés
- Prédictif ML
```

#### 3.2 `alerts` → Centre d'alertes
```
- Amélioration
- WebSocket pour alertes live
- Push notifications
- Catégorisation intelligente
- Historique et stats
```

#### 3.3 `governance` → Gouvernance
```
- Amélioration
- Vues: Processus, Conformité, Risques
- Audit trail complet
- Tableaux de bord
```

---

### 👥 **PRIORITÉ 4 - Pages RH/Personnel** (Jour 2)

#### 4.1 `employes` → Gestion des employés
```
- Refonte
- Vues: Liste, Organigramme, Compétences
- Profils détaillés
- Historique actions
```

#### 4.2 `evaluations` → Évaluations
```
- Refonte
- Vues: En cours, Terminées, Planifiées
- Workflow validation
- Rapports synthétiques
```

#### 4.3 `missions` → Gestion des missions
```
- Refonte
- Vues: Actives, Terminées, Planifiées
- Suivi temps
- Facturation
```

#### 4.4 `deplacements` → Gestion des déplacements
```
- Refonte
- Vues: Demandes, Validations, Historique
- Workflow approbation
- Rapports frais
```

#### 4.5 `paie-avances` → Paie et avances
```
- Refonte
- Vues: Demandes, Validées, Historique
- Workflow BMO
- Traçabilité
```

---

### 💬 **PRIORITÉ 5 - Pages communication** (Jour 2-3)

#### 5.1 `echanges-bureaux` → Échanges inter-bureaux
```
- Création
- Messagerie interne sophistiquée
- Fils de discussion
- Pièces jointes
```

#### 5.2 `echanges-structures` → Échanges inter-structures
```
- Création
- Communication officielle
- Validation hiérarchique
- Archivage
```

#### 5.3 `messages-externes` → Messages externes
```
- Création
- Courrier entrant/sortant
- Suivi réponses
- Templates
```

#### 5.4 `conferences` → Gestion des conférences
```
- Création
- Planning réunions
- Visioconférence intégrée
- Comptes-rendus
```

---

### 🔧 **PRIORITÉ 6 - Pages système** (Jour 3)

#### 6.1 `audit` → Journal d'audit global
```
- Création
- Vue exhaustive toutes actions
- Filtres avancés
- Export compliance
```

#### 6.2 `logs` → Logs applicatifs
```
- Création
- Monitoring temps réel
- Alertes erreurs
- Stats performance
```

#### 6.3 `system-logs` → Logs système
```
- Création
- Infrastructure monitoring
- Alertes critiques
```

#### 6.4 `parametres` → Paramètres
```
- Création
- Configuration générale
- Préférences utilisateur
- Intégrations
```

#### 6.5 `organigramme` → Organigramme
```
- Création
- Visualisation hiérarchique
- Édition drag & drop
- Export PDF
```

---

### 🤖 **PRIORITÉ 7 - Pages avancées** (Jour 3)

#### 7.1 `ia` → Module IA
```
- Création
- Suggestions automatiques
- Analyse prédictive
- Chatbot interne
```

#### 7.2 `api` → Gestion API
```
- Création
- Documentation interactive
- Monitoring endpoints
- Clés API
```

#### 7.3 `decisions` → Centre de décisions
```
- Création
- Historique décisions BMO
- Impact analysis
- Workflow validation
```

#### 7.4 `substitution` → Substitutions BMO
```
- Création ou fusion avec blocked
- Actions de substitution
- Audit trail
- Notifications
```

---

## 🏗️ Architecture par page

### Structure type pour chaque page

```
app/(portals)/maitre-ouvrage/{page}/
└── page.tsx                           # Page principale intégrée

src/lib/stores/
└── {page}WorkspaceStore.ts            # Store Zustand dédié

src/lib/services/
├── {page}ApiService.ts                # Service API CRUD + business
├── {page}WebSocket.ts                 # WebSocket temps réel (si besoin)
├── {page}Notifications.ts             # Push notifications (si besoin)
└── {page}Reports.ts                   # Rapports automatiques (si besoin)

src/components/features/bmo/workspace/{page}/
├── {Page}WorkspaceTabs.tsx            # Navigation onglets
├── {Page}WorkspaceContent.tsx         # Rendu contenu
├── {Page}LiveCounters.tsx             # Compteurs temps réel
├── {Page}CommandPalette.tsx           # Interface ⌘K
├── {Page}StatsModal.tsx               # Modal statistiques
├── {Page}DecisionCenter.tsx           # Centre de décision (si besoin)
├── {Page}Toast.tsx                    # Système notifications
├── views/
│   ├── {Page}InboxView.tsx            # Vue liste
│   ├── {Page}DetailView.tsx           # Vue détail
│   ├── {Page}MatrixView.tsx           # Vue matrice (si pertinent)
│   ├── {Page}TimelineView.tsx         # Vue timeline (si pertinent)
│   ├── {Page}AuditView.tsx            # Vue audit (si besoin)
│   └── {Page}WizardView.tsx           # Wizard (si besoin)
└── index.ts                           # Exports centralisés

docs/api/
└── {PAGE}_API_SPECS.md                # Documentation API backend
```

---

## 📊 Estimation effort

### Par niveau de page

| Niveau | Pages | Effort/page | Total |
|--------|-------|-------------|-------|
| Niveau 5 (déjà fait) | 4 | 0h | 0h |
| Niveau 4 (amélioration) | 5 | 2-3h | 12h |
| Niveau 3 (refactoring) | 5 | 3-4h | 18h |
| Niveau 2 (refonte) | 8 | 4-5h | 36h |
| Niveau 1 (création) | 13 | 5-6h | 72h |
| **TOTAL** | **35** | - | **~138h** |

### Planning recommandé

| Jour | Focus | Pages | Heures |
|------|-------|-------|--------|
| Jour 1 | Validations + Finances | 4 | 16h |
| Jour 2 | Opérationnel + Analytique | 8 | 18h |
| Jour 3 | RH + Communication | 8 | 16h |
| Jour 4 | Système + Avancé | 7 | 14h |
| Jour 5 | Tests + Corrections | - | 8h |
| **TOTAL** | | **31** | **~72h** |

*Note: Avec parallélisation et réutilisation de code, le temps peut être réduit de 30-40%.*

---

## 🎯 Livrables par page

### Chaque page aura :

1. **Code source**
   - Page principale refactorisée
   - Store Zustand dédié
   - Service API complet
   - Composants workspace (5-10)

2. **Documentation**
   - Specs API backend
   - Guide utilisation

3. **Qualité**
   - 0 erreur linter/TypeScript
   - Types stricts
   - Performance optimisée

---

## ✅ Checklist globale

### Infrastructure
- [ ] Créer template de base réutilisable
- [ ] Standardiser les services API
- [ ] Unifier les stores Zustand
- [ ] Créer composants partagés

### Par page
- [ ] Store Zustand
- [ ] Service API
- [ ] Composants workspace
- [ ] Page intégrée
- [ ] Documentation API
- [ ] Tests

---

## 🚀 Voulez-vous que je commence ?

**Options:**

1. **Option A - Tout d'un coup**  
   Je refactore toutes les 31 pages restantes en une session marathon.

2. **Option B - Par priorité**  
   Je commence par les pages critiques (Priorité 1) et vous validez avant de continuer.

3. **Option C - Par lot**  
   Je traite un groupe de pages à la fois (ex: toutes les validations, puis finances, etc.)

4. **Option D - Page spécifique**  
   Vous me dites quelle page vous voulez que je fasse en premier.

---

**Quelle option préférez-vous ?** 🎯

