# Module Validation Paiements - Documentation

## 📋 Vue d'ensemble

Module sophistiqué de validation des paiements avec traçabilité audit-grade, workflow de double validation BF→DG, et conformité RACI.

## 🏗️ Architecture

```
validation-paiements/
├── app/(portals)/maitre-ouvrage/validation-paiements/
│   └── page.tsx                    # Page principale (workspace)
│
├── app/api/payments/
│   ├── export/route.ts            # API export (CSV, JSON, Evidence Pack)
│   └── stats/route.ts             # API statistiques temps réel
│
├── components/features/payments/workspace/
│   ├── PaymentToast.tsx           # Notifications toast
│   ├── PaymentWorkspaceTabs.tsx   # Gestion onglets
│   ├── PaymentWorkspaceContent.tsx # Router contenu
│   ├── PaymentCommandPalette.tsx   # ⌘K commandes rapides
│   ├── PaymentWorkflowModal.tsx    # Modal workflow BF→DG
│   ├── PaymentDecisionCenter.tsx   # Centre décision direction
│   ├── PaymentAlertsBanner.tsx     # Bannière alertes temps réel
│   ├── PaymentStatsModal.tsx       # Modal analytics détaillés
│   ├── PaymentExportModal.tsx      # Modal export multi-format
│   └── index.ts                    # Exports centralisés
│
└── lib/stores/
    └── paymentValidationWorkspaceStore.ts  # État global Zustand
```

## 🎯 Fonctionnalités principales

### 1. Workflow de double validation (BF → DG)
- **Seuil critique** : 5 000 000 FCFA
- **Étape 1 (BF)** : Bureau Finance valide (R = Responsible)
- **Étape 2 (DG)** : Direction Générale autorise (A = Accountable)
- **Traçabilité** : Hash SHA-256 à chaque étape

### 2. Système d'alertes intelligent
- 🚨 **Paiements en retard** (échéance dépassée)
- 🔐 **Paiements critiques** (≥5M FCFA, double validation)
- ⚠️ **Paiements à risque** (score ≥65)
- ⏰ **Échéances 7 jours** (planification anticipée)

### 3. Score de risque automatisé
```
Score = f(jours_restants, montant, facture_matchée)

- Retard : +55 points base + 2×jours_retard
- Échéance 0-3j : +25 points
- Échéance 0-7j : +12 points
- Montant ≥5M : +18 points
- Montant ≥20M : +8 points
- Pas de facture : +12 points

Niveaux:
- [85-100] : CRITIQUE
- [65-84]  : ÉLEVÉ
- [35-64]  : MOYEN
- [0-34]   : FAIBLE
```

### 4. Matching automatique facture ↔ paiement
- **Heuristique** : Fournisseur + Référence BC + Chantier + Montant
- **Qualité** : `strong` (≥75%), `weak` (≥45%), `none`

### 5. Traçabilité audit-grade
- **Hash canonique** : SHA-256 de payload trié
- **Chaîne append-only** : `chainHead = SHA256(prevChainHead | actionHash)`
- **Immutabilité** : LocalStorage persistant
- **Preuve exportable** : Evidence Pack JSON

### 6. Exports multi-formats
- **CSV** : Compatible Excel/Google Sheets
- **JSON** : Audit-grade avec métadonnées RACI
- **Evidence Pack** : Preuve complète pour audit

### 7. Command Palette (⌘K)
- Navigation ultra-rapide
- Actions contextuelles
- Gestion onglets
- Raccourcis clavier

## ⌨️ Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `⌘K` ou `Ctrl+K` | Ouvrir Command Palette |
| `⌘S` ou `Ctrl+S` | Statistiques |
| `⌘D` ou `Ctrl+D` | Centre de décision |
| `⌘E` ou `Ctrl+E` | Export rapide JSON |
| `Ctrl+1` | Paiements à 7 jours |
| `Ctrl+2` | Paiements en retard |
| `Ctrl+3` | Paiements critiques |
| `Ctrl+4` | Paiements à risque |
| `Shift+?` | Aide |
| `Escape` | Fermer modals |

## 🔍 Langage de requête

Syntaxe puissante pour filtrer les paiements :

```
Champs :
  id:PAY-2025-001
  type:Situation
  ref:BC-2025-042
  beneficiary:"SEN-ELEC"
  project:CH-02
  bureau:BF
  status:pending
  due:15/02/2025
  risk:85
  amount:5000000
  facture:FACT-001

Opérateurs :
  -term           # Négation
  field:"value"   # Phrase exacte
  query1 || query2 # OU logique

Exemples :
  beneficiary:"SEN-ELEC" -status:validated
  risk:8 || due:15/02/2025
  project:CH-02 amount:>5000000
  -pending type:Situation
```

## 📊 API Endpoints

### GET `/api/payments/export`
Export paiements.

**Query params** :
- `format` : `csv` | `json` | `evidence`
- `queue` : `all` | `pending` | `7days` | `late` | `critical` | `validated` | `blocked`
- `paymentId` (optionnel) : Pour Evidence Pack spécifique

**Réponse** :
- CSV : `text/csv` avec en-têtes
- JSON : Objet avec `meta` + `payments[]`
- Evidence : Pack complet avec hash

### GET `/api/payments/stats`
Statistiques temps réel.

**Réponse** :
```json
{
  "total": 156,
  "pending": 42,
  "validated": 98,
  "blocked": 16,
  "in7Days": 23,
  "late": 8,
  "critical": 12,
  "totalAmount": 450000000,
  "risky": 15,
  "byBureau": [...],
  "byType": [...],
  "byRisk": [...],
  "timestamp": "2025-01-10T..."
}
```

## 🎨 Design System

### Principes
✅ **Minimalisme** : Fond neutre (blanc/slate)  
✅ **Icônes en couleur** : Seuls les éléments visuels importants  
✅ **Actions regroupées** : Menu déroulant pour raccourcis  
✅ **Hiérarchie claire** : Titre > Métriques > Actions > Contenu  

### Palette couleurs (icônes uniquement)
- 🔵 Bleu (`blue-500`) : Informations générales
- 🟢 Émeraude (`emerald-500`) : Succès, validations
- 🟡 Ambre (`amber-500`) : Avertissements, échéances
- 🔴 Rouge (`red-500`) : Critiques, retards
- 🟣 Violet (`purple-500`) : Double validation, audit
- 🔷 Indigo (`indigo-500`) : Centre décision

### Composants
- **MetricCard** : Carte métrique avec icône colorée
- **FluentButton** : Bouton style Microsoft Fluent
- **Badge** : Étiquette état (`success`, `warning`, `urgent`, etc.)

## 🔄 Workflow développement

### Ajouter un filtre de paiement
1. Définir `ViewMode` dans `page.tsx`
2. Implémenter logique filtrage dans `filteredPayments`
3. Ajouter bouton/métrique dans dashboard
4. Créer action Command Palette

### Ajouter une colonne tableau
1. Ajouter `<th>` dans `<thead>`
2. Ajouter `<td>` correspondant dans `<tbody>`
3. Mettre à jour fonction export CSV
4. Documenter dans Evidence Pack

### Créer un nouveau modal
1. Créer composant dans `components/features/payments/workspace/`
2. Utiliser `FluentModal` comme wrapper
3. Exporter dans `index.ts`
4. Ajouter état `useState` dans page principale
5. Connecter bouton d'ouverture

## 📦 Dépendances

```json
{
  "zustand": "État global workspace",
  "framer-motion": "Animations toast/modals",
  "lucide-react": "Icônes",
  "tailwindcss": "Styles utility-first",
  "next": "Framework React"
}
```

## 🧪 Tests recommandés

### Scénarios critiques
- [ ] Workflow BF→DG pour montant 5M+ FCFA
- [ ] Calcul score risque avec différents inputs
- [ ] Export Evidence Pack + vérification hash
- [ ] Matching facture avec fournisseur similaire
- [ ] Chaîne append-only après 100+ actions
- [ ] Command Palette avec 50+ paiements
- [ ] Filtrage multi-critères complexe

### Performance
- [ ] Chargement initial <2s (150 paiements)
- [ ] Filtrage temps réel <100ms
- [ ] Export CSV/JSON <3s (1000 paiements)
- [ ] Calcul stats <500ms

## 🔒 Sécurité & Conformité

### RACI
- **R (Responsible)** : Bureau Finance (BF) - validation technique
- **A (Accountable)** : Direction Générale (DG) - autorisation finale
- **C (Consulted)** : Bureaux métiers (projets/chantiers)
- **I (Informed)** : Contrôleur interne, CAC

### Audit Trail
- ✅ Chaque action loguée avec timestamp ISO
- ✅ Hash SHA-256 canonique (clés triées)
- ✅ Chaîne append-only (immutable)
- ✅ Identité acteur (id, nom, rôle, bureau)
- ✅ Détails complets (décision, montant, projet)

### Conservation
- LocalStorage : `bmo.validationPaiements.chainHead.v1`
- Production : Migrer vers BD Write-Once-Read-Many (WORM)
- Recommandation : AWS S3 Object Lock ou Azure Immutable Blob

## 📚 Ressources

- [Spec RACI](https://en.wikipedia.org/wiki/Responsibility_assignment_matrix)
- [SHA-256](https://en.wikipedia.org/wiki/SHA-2)
- [Audit Logging Best Practices](https://csrc.nist.gov/publications)
- [Microsoft Fluent Design](https://www.microsoft.com/design/fluent/)

## 🚀 Roadmap

### Phase 1 (Actuel)
- ✅ Workflow BF→DG
- ✅ Score risque
- ✅ Export multi-format
- ✅ Command Palette

### Phase 2 (Q1 2025)
- [ ] Signature électronique (PKI)
- [ ] Notifications push temps réel
- [ ] Dashboard analytics avancés
- [ ] API REST complète
- [ ] Mobile responsive

### Phase 3 (Q2 2025)
- [ ] Intégration ERP (SAP, Oracle)
- [ ] OCR factures automatique
- [ ] ML pour matching prédictif
- [ ] Blockchain pour chaîne immuable
- [ ] Rapports CAC automatisés

---

**Maintenu par** : Équipe BMO  
**Version** : 1.0.0  
**Dernière mise à jour** : 10 janvier 2025

