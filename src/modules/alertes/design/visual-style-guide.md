# 🎨 Guide de Style Visuel - Alertes & Risques

## 📐 Grille & Layout

### Grille de base
- **Gutter**: 16px (mobile), 24px (desktop)
- **Columns**: 12 colonnes
- **Max width**: 1440px (centré)

### Espacements standards
```
Petit:    4px   (espacement minimal)
Moyen:    8px   (espacement entre éléments proches)
Standard: 16px  (padding interne cards, espacement standard)
Grand:    24px  (espacement entre sections)
XL:       32px  (espacement entre grandes sections)
```

---

## 🎨 Palette de Couleurs Détaillée

### Couleurs Principales

#### Primary (Bleu YESSALATE)
```
#2563EB - Primary
#1D4ED8 - Primary Dark
#1E40AF - Primary Darker
```

**Usage**: 
- Liens actifs
- Boutons primaires
- Indicateurs d'état actif
- Bordures de focus

#### Background
```
#0B1120 - Background Base (fond principal)
#020617 - Surface (cards, panels)
#111827 - Surface Elevated (hover states)
#1F2937 - Border
```

### Couleurs Sémantiques

#### Critical (Rouge)
```
#EF4444 - Critical 500
#DC2626 - Critical 600
#B91C1C - Critical 700
#FEE2E2 - Critical 50 (background)
```

**Usage**:
- Alertes critiques
- Erreurs
- Actions destructives
- Badges critiques

#### Warning (Jaune)
```
#FACC15 - Warning 500
#EAB308 - Warning 600
#A16207 - Warning 700
#FEF9C3 - Warning 50 (background)
```

**Usage**:
- Alertes d'avertissement
- Avertissements
- États d'attention

#### Success (Vert)
```
#22C55E - Success 500
#16A34A - Success 600
#15803D - Success 700
#DCFCE7 - Success 50 (background)
```

**Usage**:
- Alertes résolues
- Confirmations
- États positifs

#### Info (Bleu clair)
```
#0EA5E9 - Info 500
#0284C7 - Info 600
#0369A1 - Info 700
#E0F2FE - Info 50 (background)
```

**Usage**:
- Alertes SLA
- Informations
- États neutres

---

## 📝 Typographie

### Hiérarchie

#### H1 - Titre Principal
```
Font: Inter
Size: 24px
Weight: Semi-bold (600)
Line Height: 1.2
Color: #F9FAFB
```

#### H2 - Titre Section
```
Font: Inter
Size: 20px
Weight: Semi-bold (600)
Line Height: 1.3
Color: #F9FAFB
```

#### H3 - Sous-titre
```
Font: Inter
Size: 18px
Weight: Medium (500)
Line Height: 1.4
Color: #D1D5DB
```

#### Body - Texte principal
```
Font: Inter
Size: 14px
Weight: Regular (400)
Line Height: 1.5
Color: #D1D5DB
```

#### Caption - Métadonnées
```
Font: Inter
Size: 12px
Weight: Regular (400)
Line Height: 1.5
Color: #9CA3AF
```

#### Small - Labels
```
Font: Inter
Size: 11px
Weight: Regular (400)
Line Height: 1.4
Color: #6B7280
```

---

## 🧱 Composants Visuels

### Sidebar - États Visuels

#### Item Normal
```
Background: Transparent
Text: #D1D5DB
Icon: #9CA3AF
Padding: 12px 16px
Border: None
```

#### Item Hover
```
Background: rgba(31, 41, 55, 0.5)
Text: #F9FAFB
Icon: #D1D5DB
Transform: scale(1.01)
Transition: 200ms ease
```

#### Item Active
```
Background: rgba(37, 99, 235, 0.1)
Border Left: 2px solid #2563EB
Text: #F9FAFB
Icon: #2563EB
Transform: scale(1.02)
```

### Badge - Styles

#### Badge Critique
```
Background: #FEE2E2
Text: #B91C1C
Border: 1px solid rgba(239, 68, 68, 0.3)
Padding: 4px 8px (small) / 6px 12px (medium)
Border Radius: 10px (small) / 12px (medium)
Font: 11px (small) / 12px (medium), Semi-bold
```

#### Badge Avertissement
```
Background: #FEF9C3
Text: #A16207
Border: 1px solid rgba(250, 204, 21, 0.3)
```

#### Badge Info
```
Background: #E0F2FE
Text: #0284C7
Border: 1px solid rgba(14, 165, 233, 0.3)
```

### Card Alerte - Structure Visuelle

```
┌─────────────────────────────────────┐
│ [4px Red Border]                    │
│ ┌─────────────────────────────────┐ │
│ │ 🔴 Paiement bloqué - Facture    │ │ ← Title + Badge
│ │    #12345                        │ │
│ │                                  │ │
│ │ Le paiement de la facture...    │ │ ← Description
│ │                                  │ │
│ │ 🏢 BTP  👤 Jean Dupont          │ │ ← Meta Row
│ │ 💰 50 000 XOF  ⏱️ 5 jours      │ │
│ │                                  │ │
│ │ [Traiter maintenant]            │ │ ← Action Button
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Spécifications**:
- Border Left: 4px solid (couleur selon type)
- Background: rgba(couleur, 0.05)
- Border: 1px solid #1F2937
- Border Radius: 8px
- Padding: 16px
- Gap: 12px entre lignes

### KPI Card - Structure Visuelle

```
┌─────────────────────┐
│ ⚠️  [Icon]          │ ← Header
│ Critiques           │
│                     │
│ 24                  │ ← Value (24px, Bold)
│                     │
│ ↑ +12% vs hier      │ ← Variation (optional)
│                     │
│ 5 en attente        │ ← Footer (optional)
└─────────────────────┘
```

**Spécifications**:
- Min Height: 120px
- Padding: 20px
- Border Radius: 8px
- Border: 1px solid #1F2937
- Background: rgba(couleur, 0.1)

---

## 🎯 États Interactifs

### Boutons

#### Primary Button
```
Normal:
  Background: #2563EB
  Text: #FFFFFF
  Border: None
  Padding: 10px 20px
  Border Radius: 6px

Hover:
  Background: #1D4ED8
  Transform: scale(1.02)

Active:
  Background: #1E40AF
  Transform: scale(0.98)

Disabled:
  Background: #374151
  Text: #6B7280
  Opacity: 0.5
  Cursor: not-allowed
```

#### Secondary Button
```
Normal:
  Background: Transparent
  Text: #D1D5DB
  Border: 1px solid #1F2937
  Padding: 10px 20px

Hover:
  Background: rgba(31, 41, 55, 0.5)
  Border: 1px solid #374151
```

### Inputs

```
Normal:
  Background: #111827
  Border: 1px solid #1F2937
  Text: #F9FAFB
  Padding: 10px 12px
  Border Radius: 6px

Focus:
  Border: 2px solid #2563EB
  Outline: None
  Box Shadow: 0 0 0 3px rgba(37, 99, 235, 0.1)

Error:
  Border: 1px solid #EF4444
  Background: rgba(239, 68, 68, 0.05)
```

---

## 📊 Table - Styles

### Header
```
Background: #111827
Text: 12px, Medium, #9CA3AF
Height: 48px
Border Bottom: 1px solid #1F2937
Padding: 0 16px
```

### Row Normal
```
Background: Transparent
Text: 14px, Regular, #D1D5DB
Height: 56px
Border Bottom: 1px solid #1F2937
Padding: 0 16px
```

### Row Hover
```
Background: rgba(31, 41, 55, 0.5)
Cursor: pointer
```

### Row Selected
```
Background: rgba(37, 99, 235, 0.1)
Border Left: 2px solid #2563EB
```

---

## 🎨 Animations & Transitions

### Transitions standards
```
Duration: 200ms
Easing: ease-in-out
Properties: background, color, transform, border
```

### Hover effects
```
Scale: 1.01 - 1.02
Duration: 200ms
Easing: ease-out
```

### Loading states
```
Skeleton: 
  Background: linear-gradient(90deg, #111827 25%, #1F2937 50%, #111827 75%)
  Background Size: 200% 100%
  Animation: shimmer 1.5s infinite
```

---

## 📱 Responsive Breakpoints

### Mobile (< 640px)
- Sidebar: Collapsed par défaut
- Cards: Colonne unique
- Table: Scroll horizontal
- Padding: 12px

### Tablet (640px - 1024px)
- Sidebar: Collapsible
- Cards: 2 colonnes
- Table: Scroll horizontal si nécessaire
- Padding: 16px

### Desktop (> 1024px)
- Sidebar: Expanded par défaut
- Cards: 3-4 colonnes
- Table: Pleine largeur
- Padding: 20px

---

## ✅ Checklist de Cohérence

### Vérifications visuelles
- [ ] Couleurs alignées avec Analytics BTP
- [ ] Typographie cohérente (Inter, mêmes tailles)
- [ ] Espacements harmonieux (multiples de 4)
- [ ] Border radius cohérents (6-8px)
- [ ] Ombres subtiles et cohérentes
- [ ] États hover/active bien définis
- [ ] Hiérarchie visuelle claire
- [ ] Contrastes accessibles (WCAG AA minimum)

### Vérifications fonctionnelles
- [ ] Sidebar collapsible fonctionnelle
- [ ] Navigation hiérarchique claire
- [ ] Badges dynamiques visibles
- [ ] Cards cliquables avec feedback
- [ ] Table triable et filtrable
- [ ] Responsive sur tous breakpoints

---

## 🚀 Export pour Développement

### Assets à exporter
- Icônes: SVG, 24x24px (sidebar), 16x16px (inline)
- Illustrations: SVG ou PNG @2x
- Logos: SVG

### Spécifications à fournir
- Mesures précises (px)
- Couleurs (hex + rgba)
- Typographie (font, size, weight, line-height)
- Espacements (padding, margin, gap)
- Border radius
- Shadows (box-shadow CSS)
- Transitions (duration, easing)

---

## 📚 Références

- **YESSALATE BMO V1.0 BETA**: Palette principale
- **Analytics BTP**: Structure sidebar, KPI cards
- **ERP Standards**: Hiérarchie, navigation, tables

