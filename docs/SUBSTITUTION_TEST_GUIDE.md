# ✅ Guide de Test - Page Substitution Refactorisée

## 🎯 Objectif

Ce guide permet de valider que tous les composants et fonctionnalités de la page Substitution refactorisée fonctionnent correctement.

---

## 🧪 Tests Fonctionnels

### 1. Navigation Sidebar

#### Test 1.1 - Affichage initial
- [ ] La sidebar est visible à gauche
- [ ] L'icône 🔄 et le titre "Substitution" sont affichés
- [ ] La barre de recherche avec "⌘K" est visible
- [ ] Les 9 catégories sont listées
- [ ] Les badges sont affichés correctement
- [ ] "Vue d'ensemble" est active par défaut

#### Test 1.2 - Navigation entre catégories
- [ ] Cliquer sur "Critiques" → catégorie devient active
- [ ] L'indicateur bleu apparaît à gauche de l'item actif
- [ ] Les sous-catégories se mettent à jour
- [ ] Le breadcrumb se met à jour
- [ ] Le contenu principal change

#### Test 1.3 - Collapse/Expand
- [ ] Cliquer sur le bouton `<` → sidebar se réduit (w-16)
- [ ] Les labels disparaissent, seules les icônes restent
- [ ] Les badges deviennent des pastilles flottantes
- [ ] Cliquer sur `>` → sidebar s'étend (w-64)
- [ ] Les labels réapparaissent
- [ ] Transition fluide (300ms)

#### Test 1.4 - Badges
- [ ] Badge "Critiques" est rouge (critical)
- [ ] Badge "En Attente" est ambre (warning)
- [ ] Autres badges sont gris (default)
- [ ] En mode collapsed, badges sont des pastilles

#### Test 1.5 - Recherche
- [ ] Cliquer sur la barre de recherche ouvre la palette
- [ ] Raccourci ⌘K ouvre la palette
- [ ] En mode collapsed, icône 🔍 ouvre la palette

---

### 2. SubNavigation

#### Test 2.1 - Breadcrumb
- [ ] Format: "Substitution > Catégorie > Sous-catégorie"
- [ ] Les chevrons `>` séparent correctement
- [ ] La catégorie principale est en gras
- [ ] Change dynamiquement selon la navigation

#### Test 2.2 - Sous-onglets
- [ ] Les sous-catégories s'affichent pour chaque catégorie
- [ ] L'onglet actif a un fond indigo et une bordure
- [ ] Les badges s'affichent sur les onglets
- [ ] Cliquer sur un onglet le rend actif
- [ ] Scale 1.05 sur l'onglet actif

#### Test 2.3 - Filtres (si présents)
- [ ] La ligne de filtres s'affiche sous les onglets
- [ ] "Tous" est actif par défaut
- [ ] Cliquer sur un filtre le rend actif
- [ ] Un seul filtre actif à la fois

#### Test 2.4 - Scroll horizontal
- [ ] Sur petit écran, les onglets scrollent horizontalement
- [ ] Pas de scrollbar visible (scrollbar-hide)

---

### 3. KPI Bar

#### Test 3.1 - Affichage
- [ ] 8 KPIs sont affichés en une ligne (desktop)
- [ ] Header "INDICATEURS EN TEMPS RÉEL" visible
- [ ] Timestamp "MAJ: X min" affiché
- [ ] Boutons refresh et collapse présents

#### Test 3.2 - Contenu des KPIs
**Pour chaque KPI:**
- [ ] Label affiché en petit (text-slate-500)
- [ ] Valeur affichée en grand et gras
- [ ] Trend (↑↓→) affiché si présent
- [ ] Valeur de trend affichée (ex: +2, -1)
- [ ] Sparkline affichée si présente (7 barres)
- [ ] Couleur sémantique correcte (success/warning/critical)

**KPIs spécifiques:**
1. [ ] Substitutions Actives: 38, stable, neutral
2. [ ] Critiques: 3↓-1, sparkline, critical (rouge)
3. [ ] En Attente: 12↑+2, warning (ambre)
4. [ ] Absences J: 8, sparkline, neutral
5. [ ] Délégations: 15↑+3, neutral
6. [ ] Taux Complétion: 94%↑+2%, sparkline, success (vert)
7. [ ] Temps Réponse: 2.4h↓-0.3h, success
8. [ ] Satisfaction: 4.7/5, stable, success

#### Test 3.3 - Interactions
- [ ] Hover sur KPI → fond change (hover:bg-slate-800/40)
- [ ] Cliquer refresh → animation spin
- [ ] Message de confirmation après refresh
- [ ] Timestamp se met à jour

#### Test 3.4 - Collapse
- [ ] Cliquer sur `∧` → KPIs disparaissent
- [ ] Seul le header reste visible
- [ ] Icône devient `∨`
- [ ] Cliquer sur `∨` → KPIs réapparaissent

#### Test 3.5 - Responsive
- [ ] Desktop (>1024px): 8 colonnes
- [ ] Tablet (768-1024px): 4 colonnes
- [ ] Mobile (<768px): 2 colonnes

---

### 4. Header

#### Test 4.1 - Affichage
- [ ] Bouton retour visible si historique non vide
- [ ] Icône 🔄 et titre "Substitution" affichés
- [ ] Badge "v1.0" présent
- [ ] Boutons d'actions alignés à droite

#### Test 4.2 - Recherche globale
- [ ] Bouton "Rechercher ⌘K" visible
- [ ] Cliquer ouvre la palette de commandes
- [ ] ⌘K ouvre la palette

#### Test 4.3 - Notifications
- [ ] Icône 🔔 avec badge rouge visible
- [ ] Cliquer ouvre le panneau de notifications
- [ ] Panneau s'affiche à droite avec overlay
- [ ] Cliquer overlay ferme le panneau
- [ ] Escape ferme le panneau

#### Test 4.4 - Refresh
- [ ] Icône ↻ visible
- [ ] Cliquer lance le rafraîchissement
- [ ] Animation spin pendant le refresh
- [ ] Toast "Actualisation..." puis "Actualisées"
- [ ] ⌘R fonctionne

#### Test 4.5 - Panneau de pilotage
- [ ] Icône panneau (▣) visible
- [ ] Cliquer ouvre le panneau à droite
- [ ] Icône devient ▣ fermé quand ouvert
- [ ] Fond indigo quand actif
- [ ] Re-cliquer ferme le panneau

#### Test 4.6 - Plein écran
- [ ] Icône ⛶ visible
- [ ] Cliquer active le mode plein écran
- [ ] Icône devient ⛶ réduit
- [ ] F11 fonctionne
- [ ] Re-cliquer/F11 désactive

#### Test 4.7 - Menu Actions
- [ ] Icône ⋮ (trois points) visible
- [ ] Cliquer ouvre le dropdown
- [ ] Options: Statistiques, Exporter, Paramètres
- [ ] Raccourcis affichés (⌘I, ⌘E)
- [ ] Cliquer une option exécute l'action

---

### 5. Status Bar

#### Test 5.1 - Affichage
- [ ] Barre en bas de l'écran
- [ ] Texte gris (text-slate-500)
- [ ] Informations côté gauche
- [ ] Statut côté droit

#### Test 5.2 - Contenu
- [ ] "Dernière mise à jour: il y a X min"
- [ ] "38 substitutions actives"
- [ ] Point vert avec pulse animation
- [ ] Texte "Connecté"

---

### 6. Navigation avancée

#### Test 6.1 - Historique
- [ ] Cliquer sur plusieurs catégories
- [ ] Bouton retour apparaît dans le header
- [ ] Alt+← retourne à la catégorie précédente
- [ ] Breadcrumb se met à jour
- [ ] Historique est maintenu

#### Test 6.2 - Navigation complète
**Scenario: Vue d'ensemble → Critiques → Urgentes**
- [ ] Cliquer "Critiques" dans sidebar
- [ ] Breadcrumb: "Substitution > Critiques"
- [ ] Sous-onglets: Toutes, Urgentes, Haute priorité
- [ ] Cliquer "Urgentes"
- [ ] Breadcrumb: "Substitution > Critiques > Urgentes"
- [ ] Alt+← retourne à "Critiques"
- [ ] Alt+← retourne à "Vue d'ensemble"

---

### 7. Raccourcis clavier

#### Test 7.1 - Palette de commandes
- [ ] ⌘K (Mac) ouvre la palette
- [ ] Ctrl+K (Windows) ouvre la palette
- [ ] Escape ferme la palette

#### Test 7.2 - Sidebar
- [ ] ⌘B toggle la sidebar
- [ ] Ctrl+B toggle la sidebar
- [ ] Animation fluide

#### Test 7.3 - Rafraîchir
- [ ] ⌘R rafraîchit les données
- [ ] Ctrl+R rafraîchit
- [ ] Toast de confirmation

#### Test 7.4 - Statistiques
- [ ] ⌘I ouvre le modal statistiques
- [ ] Ctrl+I ouvre le modal

#### Test 7.5 - Export
- [ ] ⌘E lance l'export
- [ ] Ctrl+E lance l'export
- [ ] Toast de confirmation

#### Test 7.6 - Plein écran
- [ ] F11 toggle le plein écran
- [ ] Fonctionne dans les deux sens

#### Test 7.7 - Retour
- [ ] Alt+← retourne en arrière
- [ ] Fonctionne uniquement si historique non vide

#### Test 7.8 - Escape
- [ ] Escape ferme la palette si ouverte
- [ ] Escape ferme les notifications si ouvertes
- [ ] Escape ferme le panneau direction si ouvert
- [ ] Ordre de priorité respecté

---

### 8. Modales et Panels

#### Test 8.1 - Palette de commandes
- [ ] S'ouvre avec ⌘K ou bouton recherche
- [ ] Overlay semi-transparent
- [ ] Champ de recherche focusé
- [ ] Liste de commandes filtrée
- [ ] Fermeture: Escape ou clic overlay

#### Test 8.2 - Modal Statistiques
- [ ] S'ouvre avec ⌘I ou menu actions
- [ ] Contenu des statistiques affiché
- [ ] Bouton fermer fonctionne
- [ ] Escape ferme le modal
- [ ] Clic overlay ferme le modal

#### Test 8.3 - Panneau de pilotage
- [ ] S'ouvre avec bouton header
- [ ] Affichage latéral droit
- [ ] Largeur fixe (w-80 ou similaire)
- [ ] Contenu du panneau visible
- [ ] Fermeture: bouton X ou toggle header

#### Test 8.4 - Panneau notifications
- [ ] S'ouvre avec bouton 🔔
- [ ] Overlay semi-transparent
- [ ] Largeur fixe (w-96)
- [ ] Message "Aucune notification" si vide
- [ ] Fermeture: Escape, overlay, ou bouton

---

### 9. Responsive

#### Test 9.1 - Desktop (>1024px)
- [ ] Sidebar visible et étendue
- [ ] KPIs en 8 colonnes
- [ ] Tous les éléments visibles
- [ ] Pas de scroll horizontal

#### Test 9.2 - Tablet (768-1024px)
- [ ] Sidebar visible mais peut être collapsed
- [ ] KPIs en 4 colonnes (2 lignes)
- [ ] Sub-navigation avec scroll
- [ ] Layout fonctionnel

#### Test 9.3 - Mobile (<768px)
- [ ] Sidebar cachée par défaut ou collapsed
- [ ] KPIs en 2 colonnes (4 lignes)
- [ ] Boutons header adaptés
- [ ] Touch-friendly

---

### 10. Performance

#### Test 10.1 - Chargement initial
- [ ] Page charge en < 1s
- [ ] Composants s'affichent progressivement
- [ ] Pas de flash de contenu
- [ ] Animations fluides

#### Test 10.2 - Navigation
- [ ] Changement de catégorie instantané
- [ ] Pas de lag visible
- [ ] Transitions fluides (300ms)
- [ ] KPIs se mettent à jour rapidement

#### Test 10.3 - Interactions
- [ ] Hover réactif
- [ ] Clic responsif
- [ ] Keyboard navigation fluide
- [ ] Aucun freeze

---

### 11. Accessibilité

#### Test 11.1 - Keyboard navigation
- [ ] Tab parcourt tous les éléments interactifs
- [ ] Focus visible sur tous les éléments
- [ ] Enter active les boutons
- [ ] Escape ferme les modales

#### Test 11.2 - Contraste
- [ ] Texte lisible sur tous les fonds
- [ ] Ratio 4.5:1 minimum respecté
- [ ] États hover/focus distinguables
- [ ] Couleurs sémantiques claires

#### Test 11.3 - Screen readers
- [ ] Titres descriptifs sur les boutons
- [ ] Labels sur les inputs
- [ ] Landmarks HTML corrects
- [ ] ARIA si nécessaire

---

### 12. Intégrations

#### Test 12.1 - Store Substitution
- [ ] States persistés correctement
- [ ] commandPaletteOpen fonctionne
- [ ] statsModalOpen fonctionne
- [ ] directionPanelOpen fonctionne

#### Test 12.2 - Store BMO
- [ ] addToast affiche les notifications
- [ ] addActionLog enregistre les actions
- [ ] currentUser accessible
- [ ] Logs contiennent les bonnes infos

#### Test 12.3 - Composants Workspace
- [ ] SubstitutionWorkspaceContent s'affiche
- [ ] SubstitutionCommandPalette fonctionne
- [ ] SubstitutionStatsModal fonctionne
- [ ] SubstitutionDirectionPanel fonctionne

---

## 🐛 Bugs connus à vérifier

### À surveiller
- [ ] Scroll horizontal indésirable
- [ ] Sidebar qui ne collapse pas
- [ ] KPIs qui débordent
- [ ] Breadcrumb trop long
- [ ] Modales qui ne se ferment pas
- [ ] Raccourcis qui ne fonctionnent pas
- [ ] Transitions saccadées
- [ ] Badges mal positionnés

---

## 📊 Checklist de validation finale

### Composants
- [ ] SubstitutionCommandSidebar fonctionne
- [ ] SubstitutionSubNavigation fonctionne
- [ ] SubstitutionKPIBar fonctionne
- [ ] Pas d'erreurs console
- [ ] Pas d'avertissements React

### Navigation
- [ ] 9 catégories accessibles
- [ ] 3 niveaux de navigation fonctionnels
- [ ] Historique fonctionne
- [ ] Breadcrumb correct

### UI/UX
- [ ] Design cohérent avec Analytics/Gouvernance
- [ ] Palette de couleurs respectée
- [ ] Animations fluides
- [ ] Responsive fonctionnel
- [ ] Dark mode natif

### Fonctionnalités
- [ ] 8 raccourcis clavier fonctionnent
- [ ] KPIs affichent les bonnes données
- [ ] Tous les boutons fonctionnent
- [ ] Toasts s'affichent correctement
- [ ] Modales/Panels s'ouvrent/ferment

### Qualité
- [ ] Aucune erreur de linter
- [ ] TypeScript satisfait
- [ ] Pas de console.error
- [ ] Pas de warnings
- [ ] Code propre et commenté

---

## 🎯 Critères de succès

### Obligatoire (Must Have)
✅ Tous les composants s'affichent  
✅ Navigation fonctionne sur 3 niveaux  
✅ KPIs affichent les bonnes valeurs  
✅ Raccourcis clavier fonctionnent  
✅ Responsive fonctionne  
✅ Aucune erreur de linter  

### Important (Should Have)
⭕ Animations fluides  
⭕ Historique de navigation  
⭕ Tous les panels fonctionnent  
⭕ Toasts appropriés  
⭕ Performance optimale  

### Souhaitable (Nice to Have)
⚪ Tooltips sur tous les éléments  
⚪ Feedback visuel sur toutes les actions  
⚪ Accessibilité parfaite  
⚪ Documentation complète  

---

## 📝 Template de rapport de bug

```markdown
### Bug: [Titre court]

**Composant affecté**: SubstitutionCommandSidebar / SubstitutionSubNavigation / SubstitutionKPIBar / Page

**Sévérité**: Critique / Majeure / Mineure

**Description**:
[Description détaillée du problème]

**Steps to reproduce**:
1. [Étape 1]
2. [Étape 2]
3. [Étape 3]

**Comportement attendu**:
[Ce qui devrait se passer]

**Comportement actuel**:
[Ce qui se passe réellement]

**Environnement**:
- Browser: [Chrome/Firefox/Safari/Edge]
- Version: [xx.x]
- OS: [Windows/Mac/Linux]
- Screen size: [1920x1080 / etc]

**Screenshots**:
[Si applicable]

**Console errors**:
```
[Erreurs de console si présentes]
```

**Priorité**: P0 / P1 / P2 / P3
```

---

## ✅ Validation finale

Une fois tous les tests passés :

```
╔══════════════════════════════════════════╗
║  ✅ TOUS LES TESTS SONT VALIDÉS        ║
║                                          ║
║  🎉 La page Substitution est prête     ║
║     pour la production !                ║
║                                          ║
║  Prochaine étape: Déploiement          ║
╚══════════════════════════════════════════╝
```

---

**Bon testing ! 🧪✨**

