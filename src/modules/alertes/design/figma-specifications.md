# 🎨 Spécifications Figma - Module Alertes & Risques

## 📋 Vue d'ensemble

Ce document fournit les spécifications détaillées pour créer le système de composants Figma du module "Alertes & Risques", cohérent avec YESSALATE BMO V1.0 BETA et Analytics BTP.

---

## 🎯 FOUNDATION (Design Tokens)

### 1. Couleurs

#### Palette principale
```
Primary: #2563EB (bleu YESSALATE)
Primary Dark: #1D4ED8
Background: #0B1120 (fond sombre type BMO)
Surface: #020617 / #111827 (cards / panels)
Border: #1F2937
```

#### Couleurs sémantiques
```
Success: #22C55E
Warning: #FACC15
Critical: #EF4444
Info: #0EA5E9
Muted: #6B7280
```

#### Couleurs de texte
```
Primary: #F9FAFB
Secondary: #D1D5DB
Tertiary: #9CA3AF
Disabled: #6B7280
```

### 2. Typographie

**Police principale**: Inter

| Style | Taille | Poids | Line Height | Usage |
|-------|--------|-------|-------------|-------|
| Title | 20-24px | Semi-bold (600) | 1.2 | Titres de sections |
| Subtitle | 16-18px | Medium (500) | 1.5 | Sous-titres |
| Body | 14-16px | Regular (400) | 1.5 | Texte principal |
| Caption | 12-13px | Regular (400) | 1.5 | Métadonnées, labels |

### 3. Spacing

**Échelle**: 4, 8, 12, 16, 20, 24, 32px

- **Padding interne cards**: 16px
- **Gutter entre colonnes**: 16-24px
- **Espacement entre éléments**: 8-12px

### 4. Border Radius & Ombres

- **Border radius**: 6-8px (cards et boutons)
- **Shadow légère**: `0 10px 30px rgba(0,0,0,0.35)` (modales/panneaux flottants)

---

## 🧱 COMPOSANTS À CRÉER

### 1. Sidebar / Navigation

#### Structure
```
Sidebar / Alertes
├── Header (64px height)
│   ├── Logo/Icon (24x24px)
│   ├── Title "Alertes & Risques"
│   └── Collapse button
├── Search Bar (40px height, 16px padding)
└── Navigation Items
    ├── Section Title (32px height)
    └── Nav Items
        ├── NavItem (40px height)
        ├── NavItemNested (40px height, 16px indent)
        └── NavItemNested2 (40px height, 32px indent)
```

#### Variantes NavItem

**État Default**
- Background: Transparent
- Text: #D1D5DB
- Icon: #9CA3AF
- Border: None
- Padding: 12px 16px

**État Hover**
- Background: rgba(31, 41, 55, 0.5)
- Text: #F9FAFB
- Icon: #D1D5DB
- Scale: 1.01

**État Active**
- Background: rgba(37, 99, 235, 0.1)
- Border Left: 2px solid #2563EB
- Text: #F9FAFB
- Icon: #2563EB
- Scale: 1.02

**État Disabled**
- Opacity: 0.5
- Cursor: not-allowed

#### Spécifications NavItem
- **Height**: 40px
- **Padding**: 12px 16px
- **Icon size**: 20x20px
- **Icon margin right**: 12px
- **Badge position**: Right, 8px from edge
- **Font**: 14px, Medium

#### Spécifications NavItemNested
- **Indent**: 16px from left
- **Font**: 14px, Regular
- **Icon**: Optional, 16x16px

#### Spécifications NavItemNested2
- **Indent**: 32px from left
- **Font**: 13px, Regular
- **Icon**: Optional, 16x16px

---

### 2. Badge / Count

#### Structure
```
Badge / Count
├── Background (rounded)
├── Text (centered)
└── Optional: Icon (left)
```

#### Variantes

**Type Critique**
- Background: #FEE2E2 (rgba(239, 68, 68, 0.1))
- Text: #B91C1C
- Border: 1px solid rgba(239, 68, 68, 0.3)

**Type Avertissement**
- Background: #FEF9C3 (rgba(250, 204, 21, 0.1))
- Text: #A16207
- Border: 1px solid rgba(250, 204, 21, 0.3)

**Type Info**
- Background: #E0F2FE (rgba(14, 165, 233, 0.1))
- Text: #0284C7
- Border: 1px solid rgba(14, 165, 233, 0.3)

**Type Muted**
- Background: rgba(107, 114, 128, 0.1)
- Text: #6B7280
- Border: 1px solid rgba(107, 114, 128, 0.3)

#### Tailles

**Small**
- Height: 20px
- Padding: 4px 8px
- Font: 11px, Semi-bold
- Border radius: 10px

**Medium**
- Height: 24px
- Padding: 6px 12px
- Font: 12px, Semi-bold
- Border radius: 12px

---

### 3. Card / Alerte

#### Structure
```
Card / Alerte
├── Border Left (4px, colored)
├── Content (16px padding)
│   ├── Header Row
│   │   ├── Title (16px, Semi-bold)
│   │   └── Badge Type
│   ├── Description (14px, Regular, 2 lines max)
│   ├── Meta Row (3-4 items)
│   │   ├── Bureau (Icon + Text)
│   │   ├── Responsable (Icon + Text)
│   │   ├── Projet (Icon + Text)
│   │   └── Montant (Icon + Text)
│   └── Actions Row
│       └── Button "Traiter maintenant"
└── Hover Overlay
```

#### Variantes par Type

**Critique**
- Border Left: 4px solid #EF4444
- Background: rgba(239, 68, 68, 0.05)
- Hover: rgba(239, 68, 68, 0.1)

**Avertissement**
- Border Left: 4px solid #FACC15
- Background: rgba(250, 204, 21, 0.05)
- Hover: rgba(250, 204, 21, 0.1)

**SLA**
- Border Left: 4px solid #0EA5E9
- Background: rgba(14, 165, 233, 0.05)
- Hover: rgba(14, 165, 233, 0.1)

**Bloqué**
- Border Left: 4px solid #F97316
- Background: rgba(249, 115, 22, 0.05)
- Hover: rgba(249, 115, 22, 0.1)

#### Spécifications
- **Width**: 100% (flex)
- **Min Height**: 140px
- **Border Radius**: 8px
- **Border**: 1px solid #1F2937
- **Padding**: 16px
- **Gap between rows**: 12px

#### Meta Row Items
- **Icon size**: 16x16px
- **Icon color**: #9CA3AF
- **Text size**: 13px
- **Text color**: #D1D5DB
- **Gap**: 16px between items

---

### 4. Header / Module

#### Structure
```
Header / Module
├── Left Section
│   ├── Back Button (optional)
│   ├── Icon (24x24px)
│   ├── Title "Alertes & Risques"
│   └── Version Badge "v1.0"
├── Center Section (optional)
│   └── Breadcrumb
└── Right Section
    ├── Search Button
    ├── Notifications Button
    └── Actions Menu
```

#### Spécifications
- **Height**: 56px
- **Background**: #111827
- **Border Bottom**: 1px solid #1F2937
- **Padding**: 0 20px
- **Gap**: 12px between items

#### Breadcrumb Component
```
Breadcrumb
├── Item (14px, #9CA3AF)
├── Separator ">" (12px, #6B7280)
├── Item (14px, #D1D5DB)
├── Separator ">"
└── Current Item (14px, #F9FAFB, Medium)
```

---

### 5. KPI / Card

#### Structure
```
KPI / Card
├── Header
│   ├── Icon (24x24px, colored)
│   └── Title (13px, #9CA3AF)
├── Value (24px, Bold, colored)
├── Variation (optional)
│   ├── Icon (arrow up/down, 12px)
│   └── Text (12px)
└── Footer (optional)
    └── Subtitle (12px, #6B7280)
```

#### Variantes par Type

**Critiques**
- Icon: AlertTriangle, #EF4444
- Value: #EF4444
- Background: rgba(239, 68, 68, 0.1)

**Avertissements**
- Icon: AlertCircle, #FACC15
- Value: #FACC15
- Background: rgba(250, 204, 21, 0.1)

**SLA**
- Icon: Clock, #0EA5E9
- Value: #0EA5E9
- Background: rgba(14, 165, 233, 0.1)

**Résolues**
- Icon: CheckCircle, #22C55E
- Value: #22C55E
- Background: rgba(34, 197, 94, 0.1)

#### Spécifications
- **Width**: Flexible (grid)
- **Min Height**: 120px
- **Padding**: 20px
- **Border Radius**: 8px
- **Border**: 1px solid #1F2937
- **Gap**: 12px between elements

---

### 6. Table / Alertes

#### Structure
```
Table / Alertes
├── Header (48px height)
│   ├── Column 1: Titre (flex: 2)
│   ├── Column 2: Type (flex: 1)
│   ├── Column 3: Bureau (flex: 1)
│   ├── Column 4: Responsable (flex: 1)
│   ├── Column 5: Montant (flex: 1)
│   ├── Column 6: Statut (flex: 1)
│   ├── Column 7: Âge (flex: 1)
│   └── Column 8: Actions (flex: 0.5)
└── Rows (56px height each)
    └── Row Content
```

#### Variantes Row

**Normal**
- Background: Transparent
- Border Bottom: 1px solid #1F2937
- Text: #D1D5DB

**Hover**
- Background: rgba(31, 41, 55, 0.5)
- Cursor: pointer

**Selected**
- Background: rgba(37, 99, 235, 0.1)
- Border Left: 2px solid #2563EB

#### Spécifications Header
- **Height**: 48px
- **Background**: #111827
- **Text**: 12px, Medium, #9CA3AF
- **Padding**: 0 16px
- **Border Bottom**: 1px solid #1F2937

#### Spécifications Row
- **Height**: 56px
- **Padding**: 0 16px
- **Text**: 14px, Regular
- **Gap**: 16px between columns

---

## 📱 SCREENS À CRÉER

### 1. Vue d'ensemble

**Layout**
```
┌─────────────────────────────────────────┐
│ Header / Module                         │
├─────────────────────────────────────────┤
│ Sub Navigation                          │
├─────────────────────────────────────────┤
│ KPI Row (6 cards)                       │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌──┐│
│ │KPI1│ │KPI2│ │KPI3│ │KPI4│ │KPI5│ │K6││
│ └────┘ └────┘ └────┘ └────┘ └────┘ └──┘│
├─────────────────────────────────────────┤
│ Section: Alertes critiques              │
│ ┌─────────────────────────────────────┐ │
│ │ Card / Alerte (Critique)            │ │
│ │ Card / Alerte (Critique)            │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ Section: Par typologie                  │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐            │
│ │Cat1│ │Cat2│ │Cat3│ │Cat4│            │
│ └────┘ └────┘ └────┘ └────┘            │
└─────────────────────────────────────────┘
```

### 2. Vue Critiques

**Layout**
```
┌─────────────────────────────────────────┐
│ Header / Module                         │
├─────────────────────────────────────────┤
│ Sub Navigation (Critiques > Paiements)  │
├─────────────────────────────────────────┤
│ Filters Bar                              │
├─────────────────────────────────────────┤
│ Table / Alertes                          │
│ (ou Cards en grille)                    │
└─────────────────────────────────────────┘
```

### 3. Vue Avertissements

Même structure que Vue Critiques, avec couleurs Warning.

### 4. Vue SLA dépassés

Même structure, avec focus sur colonne "SLA dépassé" et indicateurs de délai.

### 5. Vue Règles & Historique

**Layout**
```
┌─────────────────────────────────────────┐
│ Header / Module                         │
├─────────────────────────────────────────┤
│ Sub Navigation (Gouvernance > Règles)  │
├─────────────────────────────────────────┤
│ Section: Règles actives                 │
│ ┌─────────────────────────────────────┐ │
│ │ Card / Règle                        │ │
│ │ Card / Règle                        │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ Section: Historique                      │
│ └─ Table / Historique                    │
└─────────────────────────────────────────┘
```

---

## 🎨 GUIDELINES DE COHÉRENCE

### Alignement avec Analytics BTP

1. **Sidebar**: Même largeur (256px expanded), même style
2. **KPI Cards**: Même hauteur (120px), même padding (20px)
3. **Palette**: Même fond (#0B1120), mêmes couleurs primaires
4. **Grille**: Même système de grille (16px gutter)

### Hiérarchie visuelle

1. **Critique** = Rouge → Toujours en haut, toujours visible
2. **Avertissement** = Jaune → Attention requise
3. **SLA** = Bleu → Information temporelle
4. **Résolu** = Vert → Confirmation positive

### Responsive

- **Mobile**: Sidebar collapsée, cards en colonne unique
- **Tablet**: Sidebar collapsée, grille 2 colonnes
- **Desktop**: Sidebar expanded, grille 3-4 colonnes

---

## 📐 MESURES PRÉCISES

### Sidebar
- Expanded: 256px
- Collapsed: 64px
- Item height: 40px
- Nested indent: 16px par niveau

### Cards
- Padding: 16px
- Border radius: 8px
- Gap: 16px
- Min height: 140px (Alerte), 120px (KPI)

### Table
- Header height: 48px
- Row height: 56px
- Column padding: 16px

### Header
- Height: 56px
- Padding: 0 20px

---

## ✅ CHECKLIST FIGMA

- [ ] Créer page "Module / Alertes & Risques"
- [ ] Section "Foundations" avec couleurs, typo, spacing
- [ ] Section "Components" avec tous les composants
- [ ] Section "Screens" avec toutes les vues
- [ ] Variantes pour chaque composant (états, types)
- [ ] Auto-layout configuré
- [ ] Components avec variants
- [ ] Styles de texte et couleurs créés
- [ ] Documentation inline sur les composants

---

## 🚀 PROCHAINES ÉTAPES

1. Créer les composants de base dans Figma
2. Configurer les variants
3. Créer les screens
4. Tester la cohérence avec Analytics BTP
5. Documenter les usages dans Figma

