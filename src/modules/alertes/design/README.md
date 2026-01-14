# 🎨 Design System - Module Alertes & Risques

## 📁 Structure

```
design/
├── design-tokens.json          # Tokens JSON (couleurs, typo, spacing)
├── figma-specifications.md     # Spécifications détaillées pour Figma
├── visual-style-guide.md       # Guide de style visuel complet
└── README.md                   # Ce fichier
```

## 🎯 Objectif

Créer un système de composants Figma cohérent avec :
- **YESSALATE BMO V1.0 BETA**
- **Analytics BTP**
- Approche ERP professionnelle orientée pilotage

## 📋 Fichiers

### 1. `design-tokens.json`
Fichier JSON contenant tous les design tokens :
- Couleurs (primary, semantic, background, text)
- Typographie (font, size, weight, line-height)
- Spacing (scale, gutter, padding)
- Border radius
- Shadows
- Composants (mesures spécifiques)

**Usage**: 
- Import dans Figma via plugin "Design Tokens"
- Utilisation dans le code via variables CSS/SCSS
- Documentation pour les développeurs

### 2. `figma-specifications.md`
Spécifications détaillées pour créer les composants dans Figma :
- Structure de chaque composant
- Variantes (états, types)
- Mesures précises
- Guidelines de cohérence
- Checklist de création

**Usage**:
- Guide pour le designer Figma
- Référence pendant la création
- Documentation des décisions de design

### 3. `visual-style-guide.md`
Guide de style visuel complet :
- Grille & Layout
- Palette de couleurs détaillée
- Typographie complète
- Composants visuels
- États interactifs
- Animations & transitions
- Responsive breakpoints

**Usage**:
- Référence visuelle complète
- Guide pour les développeurs
- Documentation des patterns

## 🚀 Utilisation

### Pour les Designers (Figma)

1. **Lire** `figma-specifications.md` pour comprendre la structure
2. **Importer** `design-tokens.json` dans Figma (plugin Design Tokens)
3. **Créer** les composants selon les spécifications
4. **Vérifier** avec la checklist dans `figma-specifications.md`
5. **Documenter** les composants dans Figma

### Pour les Développeurs

1. **Lire** `visual-style-guide.md` pour les styles
2. **Utiliser** `design-tokens.json` pour générer les variables CSS
3. **Implémenter** les composants selon les spécifications
4. **Tester** la cohérence avec Analytics BTP

## 🧱 Composants à créer

### Foundation
- [x] Design Tokens
- [x] Couleurs
- [x] Typographie
- [x] Spacing
- [x] Shadows & Radius

### Components
- [ ] Sidebar / Alertes
- [ ] Badge / Count
- [ ] Card / Alerte
- [ ] Header / Module
- [ ] KPI / Card
- [ ] Table / Alertes
- [ ] Breadcrumb
- [ ] Button (variants)
- [ ] Input
- [ ] Modal

### Screens
- [ ] Vue d'ensemble
- [ ] Vue Critiques
- [ ] Vue Avertissements
- [ ] Vue SLA dépassés
- [ ] Vue Règles & Historique

## 📐 Standards

### Couleurs
- **Primary**: #2563EB (bleu YESSALATE)
- **Background**: #0B1120 (fond sombre)
- **Surface**: #020617 / #111827

### Typographie
- **Font**: Inter
- **Sizes**: 12, 13, 14, 16, 18, 20, 24px
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semi-bold)

### Spacing
- **Scale**: 4, 8, 12, 16, 20, 24, 32px
- **Card Padding**: 16px
- **Gutter**: 16-24px

### Border Radius
- **Cards**: 6-8px
- **Buttons**: 6px
- **Badges**: 10-12px

## ✅ Checklist de Cohérence

### Avec Analytics BTP
- [x] Même palette de couleurs
- [x] Même structure sidebar
- [x] Même style KPI cards
- [x] Même système de grille
- [x] Même approche typographique

### Qualité
- [x] Tokens bien définis
- [x] Spécifications complètes
- [x] Guide visuel détaillé
- [x] Documentation claire

## 🔄 Prochaines étapes

1. **Créer les composants dans Figma** selon les spécifications
2. **Tester la cohérence** avec Analytics BTP
3. **Documenter** les usages dans Figma
4. **Implémenter** les composants React
5. **Valider** avec les utilisateurs

## 📚 Références

- YESSALATE BMO V1.0 BETA
- Analytics BTP (module existant)
- Standards ERP professionnels
- WCAG AA (accessibilité)

