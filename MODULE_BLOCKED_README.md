# 📦 MODULE: DOSSIERS BLOQUÉS - BMO

> **Interface de pilotage stratégique des blocages pour le Maître d'Ouvrage**

---

## 🎯 Vue d'ensemble

Le module **Dossiers Bloqués** est l'interface centrale pour gérer, arbitrer et résoudre tous les blocages de l'entreprise (BTP).

C'est un **Command Center** temps réel permettant au BMO de :

- 🔍 **Identifier** les blocages critiques instantanément
- ⚡ **Décider** rapidement (escalade, substitution, résolution)
- 📊 **Piloter** avec des KPIs temps réel
- 🔐 **Tracer** toutes les décisions (SHA-256)
- 📈 **Anticiper** avec des alertes SLA
- 📧 **Rapporter** automatiquement aux stakeholders

---

## 🏗️ Architecture

```
blocked/
├── page.tsx                          # Page principale
├── components/
│   ├── BlockedWorkspaceTabs          # Navigation onglets
│   ├── BlockedWorkspaceContent       # Rendu contenu
│   ├── BlockedLiveCounters          # Compteurs temps réel
│   ├── BlockedCommandPalette        # ⌘K interface
│   ├── BlockedStatsModal            # Modal statistiques
│   ├── BlockedDecisionCenter        # Centre de décision BMO
│   ├── BlockedToast                 # Système notifications
│   └── views/
│       ├── BlockedInboxView         # Liste + filtres
│       ├── BlockedDetailView        # Détail dossier
│       ├── BlockedMatrixView        # Matrice Impact×Délai
│       ├── BlockedTimelineView      # Timeline chronologique
│       ├── BlockedBureauView        # Vue par bureau
│       ├── BlockedResolutionWizard  # Wizard résolution
│       └── BlockedAuditView         # Registre d'audit
├── services/
│   ├── blockedApiService.ts         # API CRUD + business
│   ├── blockedWebSocket.ts          # WebSocket temps réel
│   ├── blockedNotifications.ts      # Push notifications
│   └── blockedReports.ts            # Rapports automatiques
└── stores/
    └── blockedWorkspaceStore.ts     # État global Zustand
```

---

## ✨ Fonctionnalités principales

### 🎛️ **1. Workspace multi-vues**

- **Inbox** : Liste avec filtres avancés, tri, recherche
- **Matrix** : Visualisation 2D Impact × Délai
- **Timeline** : Historique chronologique
- **Bureau** : Statistiques par département
- **Detail** : Vue complète d'un dossier
- **Audit** : Registre des décisions avec SHA-256
- **Wizard** : Résolution guidée en 5 étapes

### ⚡ **2. Centre de décision BMO**

Interface dédiée pour actions stratégiques :

- ✅ **Résolution** avec templates prédéfinis
- 📈 **Escalade CODIR** (simple ou massive)
- 🛡️ **Substitution BMO** (pouvoir hiérarchique)
- 🔄 **Réassignation** entre bureaux
- 📦 **Actions en lot** (bulk escalate/resolve)

### 📊 **3. KPIs temps réel**

- Total blocages
- Critiques / Élevés / Moyens / Faibles
- Délai moyen
- Montant total bloqué (FCFA)
- Taux hors SLA
- Résolutions du jour
- Répartition par bureau/type

### 🔔 **4. Alertes & Notifications**

- **Toast in-app** : Success/Error/Warning/Info
- **Push navigateur** : Alertes SLA critiques
- **Sons personnalisés** : Par niveau de priorité
- **WebSocket** : Événements temps réel
  - Nouveaux blocages
  - SLA breach
  - Résolutions
  - Escalades

### 📈 **5. Rapports automatiques**

- **Programmation** : Quotidien / Hebdo / Mensuel
- **Templates** : 8 scénarios prédéfinis
- **Formats** : PDF, Excel, HTML email
- **Destinataires multiples**
- **Filtres personnalisés**
- **Envoi auto** : Vérification toutes les 5 min

### 🔐 **6. Traçabilité cryptographique**

- **SHA-256 hashing** : Chaque décision critique
- **Audit trail immuable** : Historique complet
- **Export** : CSV/JSON du registre
- **Vérification** : Hash consultable et copiable

### 🎯 **7. UX avancées**

- **Command Palette** (`⌘K`) : Recherche universelle
- **Raccourcis clavier** : Navigation rapide
- **Watchlist** : Favoris persistés
- **Filtres sauvegardés** : Réutilisables
- **Auto-refresh** : Données toujours à jour
- **Dark mode** : Support complet

---

## 🚀 Démarrage rapide

### **1. Accès**

```
http://localhost:3000/maitre-ouvrage/blocked
```

### **2. Raccourcis essentiels**

| Raccourci | Action |
|-----------|--------|
| `⌘K` | Ouvrir command palette |
| `⌘D` | Centre de décision |
| `⌘I` | Statistiques |
| `⌘X` | Export |
| `?` | Aide raccourcis |

### **3. Workflow typique**

1. **Identifier** : Consulter les compteurs "Critiques"
2. **Prioriser** : Vue Matrice pour vision 2D
3. **Décider** : Centre de décision → Escalade/Résolution
4. **Tracer** : Audit → Vérifier le hash SHA-256
5. **Rapporter** : Config rapport auto quotidien

---

## 📊 Formule de priorité

```
Priorité = (Impact × 1000) + (Délai × 100) + (Montant_M × 10)

Impact :
- Critical : 10
- High : 7
- Medium : 4
- Low : 1
```

**Exemple :**  
Critique + 18 jours + 45M FCFA = `(10×1000) + (18×100) + (45×10)` = **12 250**

---

## 🔌 APIs Backend requises

### **REST Endpoints (16)**

- `GET /api/bmo/blocked` - Liste
- `GET /api/bmo/blocked/:id` - Détail
- `GET /api/bmo/blocked/stats` - Statistiques
- `POST /api/bmo/blocked/:id/resolve` - Résolution
- `POST /api/bmo/blocked/:id/escalate` - Escalade
- `POST /api/bmo/blocked/:id/substitute` - Substitution
- `POST /api/bmo/blocked/bulk/*` - Actions en lot
- `GET /api/bmo/blocked/export` - Export
- `GET /api/bmo/blocked/audit` - Audit log
- `POST /api/bmo/blocked/reports/*` - Rapports

**Détails complets** : Voir `BLOCKED_API_SPECS.md`

### **WebSocket**

```
ws://api.company.sn/ws/bmo/blocked
```

**Événements** :
- `new_blocking` : Nouveau blocage
- `sla_breach` : Dépassement SLA
- `resolution` : Blocage résolu
- `escalation` : Escalade effectuée

---

## 🎨 Design System

### **Couleurs sémantiques**

- 🔴 **Critical** : `red-500` - Alerte maximale
- 🟠 **High** : `amber-500` - Priorité élevée
- 🔵 **Medium** : `blue-500` - Attention requise
- ⚪ **Low** : `slate-400` - Surveillance

### **Principes**

- ✅ Textes neutres (`slate`)
- ✅ Couleurs uniquement pour états/actions critiques
- ✅ Espacement cohérent (4/8/12/16/24px)
- ✅ Hover states clairs
- ✅ Loading states partout

---

## 📦 Technologies

- **Framework** : Next.js 15 App Router
- **UI** : React 19 + TailwindCSS
- **State** : Zustand (persist)
- **Types** : TypeScript strict
- **Icons** : Lucide React
- **Temps réel** : WebSocket + Push API
- **Exports** : CSV/JSON/XLSX/PDF (mock)

---

## 📚 Documentation complète

| Document | Description |
|----------|-------------|
| `BLOCKED_API_SPECS.md` | 📡 Spécifications API backend complètes |
| `REFONTE_BLOCKED_COMPLETE.md` | ✅ Récapitulatif implémentation |
| `AMELIORATIONS_BLOCKED.md` | 🔥 Comparaison vs pages référence |
| `QUICKSTART_BLOCKED.md` | ⚡ Guide démarrage rapide |

---

## 🧪 Tests

### **Fonctionnalités testables sans backend**

✅ Toutes les vues (données mockées)  
✅ Command Palette  
✅ Centre de décision  
✅ Wizard résolution  
✅ Notifications navigateur  
✅ WebSocket (événements simulés)  
✅ Rapports (localStorage)  
✅ Export (mock)  

### **Mode dev**

- Événements WebSocket simulés toutes les 30s
- Console logs détaillés
- LocalStorage persisté

---

## 🐛 Troubleshooting

### **Notifications ne marchent pas**

✅ Vérifier HTTPS (requis en prod, localhost OK)  
✅ Permissions navigateur  
✅ Bloqueur de pubs désactivé  

### **WebSocket ne connecte pas**

✅ Vérifier `.env.local` : `NEXT_PUBLIC_WS_URL`  
✅ Backend démarré  
✅ Port non bloqué par firewall  

### **Données mockées absentes**

✅ Vérifier `src/lib/data/index.ts` exporte `blockedDossiers`  

---

## 🎯 Roadmap

### **Phase 1 : MVP** ✅ (Actuel)

- [x] Architecture workspace complète
- [x] Toutes les vues (7)
- [x] Services mock complets
- [x] WebSocket + Notifications
- [x] Rapports automatiques
- [x] Audit SHA-256
- [x] Documentation API

### **Phase 2 : Backend**

- [ ] Implémenter 16 endpoints REST
- [ ] WebSocket server (Socket.io)
- [ ] Queue (Bull/RabbitMQ)
- [ ] Service email (Nodemailer)
- [ ] Cache Redis
- [ ] Logs centralisés

### **Phase 3 : Production**

- [ ] Tests E2E (Playwright)
- [ ] CI/CD pipeline
- [ ] Monitoring (Sentry)
- [ ] Optimisations perfs
- [ ] Accessibilité (WCAG)
- [ ] Mobile app (React Native)

---

## 🤝 Contribution

### **Structure des commits**

```
feat(blocked): ajout vue timeline
fix(blocked): correction calcul priorité
docs(blocked): mise à jour API specs
refactor(blocked): optimisation useMemo
```

### **Conventions**

- ✅ Types TypeScript stricts partout
- ✅ Composants fonctionnels + hooks
- ✅ Services séparés de l'UI
- ✅ Props interfaces documentées
- ✅ Error boundaries

---

## 📞 Support

**Documentation** : Voir fichiers `.md` racine  
**Issues** : GitHub Issues  
**Chat** : Slack #bmo-blocked  

---

## 📄 Licence

Propriétaire - Tous droits réservés © 2026 Company

---

## 🏆 Crédits

**Développement** : Équipe Frontend BMO  
**Design** : Basé sur les pages Demandes/RH/Calendrier  
**Innovations** : WebSocket, Push notifications, Rapports auto, Audit SHA-256  

---

**Version** : 1.0.0  
**Dernière mise à jour** : 10 janvier 2026  
**Statut** : ✅ Production Ready (frontend) / ⏳ Backend en cours

