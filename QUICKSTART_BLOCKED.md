# ⚡ GUIDE DE DÉMARRAGE RAPIDE - BLOCKED

## 🚀 Utilisation immédiate (Frontend)

### 1. **Accéder à la page**

```
http://localhost:3000/maitre-ouvrage/blocked
```

### 2. **Fonctionnalités disponibles SANS backend**

Toutes les fonctionnalités sont fonctionnelles avec des **données mockées** :

✅ Liste des blocages avec filtres  
✅ Détail d'un dossier  
✅ Matrice Impact × Délai  
✅ Timeline chronologique  
✅ Vue par bureau  
✅ Wizard de résolution  
✅ Centre de décision  
✅ Registre d'audit  
✅ Statistiques  
✅ Export (JSON/CSV simulé)  
✅ Command Palette ⌘K  
✅ Toast notifications  
✅ Auto-refresh  
✅ Watchlist  
✅ Filtres sauvegardés  

### 3. **Mode dev : Événements WebSocket simulés**

En mode dev, des événements sont générés automatiquement toutes les 30s :

- 🔴 SLA breach alert
- 🆕 Nouveau blocage
- ✅ Résolution
- 📈 Escalade

**Voir la console** pour les logs.

---

## 🎯 Tester les fonctionnalités

### **A. Command Palette**

1. Appuyer sur `⌘K` (Mac) ou `Ctrl+K` (Windows)
2. Taper "critique" → Voir les dossiers critiques
3. Taper "matrice" → Ouvrir la matrice
4. `↑` `↓` pour naviguer, `Enter` pour ouvrir

### **B. Centre de décision**

1. Cliquer sur le bouton **"Décider"** (header)
2. Ou `⌘D` / `Ctrl+D`
3. Onglets : En attente / Critiques / Actions rapides
4. Sélectionner dossiers + escalader/résoudre en lot

### **C. Wizard de résolution**

1. Command Palette → "Wizard résolution"
2. Ou Centre de décision → "Résoudre" sur un dossier
3. 5 étapes guidées :
   - Sélection dossier
   - Template résolution
   - Rédaction note
   - Vérification
   - Confirmation

### **D. Matrice Impact × Délai**

1. Command Palette → "Matrice"
2. Voir les 4 quadrants colorés
3. Hover sur une bulle → Tooltip détaillé
4. Cliquer → Ouvre le détail

### **E. Vue Bureau**

1. Command Palette → "Vue bureau"
2. Stats par département
3. Cliquer sur un bureau → Expand détails
4. Contact rapide (email)

### **F. Timeline**

1. Command Palette → "Timeline"
2. Basculer Semaine / Mois
3. Naviguer avec `< >`
4. Filtrer par type d'événement

### **G. Audit**

1. Command Palette → "Audit"
2. Voir toutes les décisions avec hash SHA-256
3. Copier un hash
4. Filtrer par action/utilisateur
5. Export CSV/JSON

### **H. Notifications**

1. Cliquer sur l'icône 🔔 (header)
2. Accepter les permissions navigateur
3. Un toast confirme l'activation
4. Attendre ~30s pour recevoir une notification de test

### **I. Rapports (en localStorage)**

```javascript
// Ouvrir console navigateur
const { blockedReports } = await import('@/lib/services/blockedReports');

// Créer un rapport quotidien
await blockedReports.createScheduledReport({
  name: 'Test rapport',
  frequency: 'daily',
  time: '08:00',
  recipients: ['test@company.sn'],
  format: 'pdf',
  filters: { impact: 'critical' },
  includeGraphs: true,
  includeDetails: true,
  enabled: true,
  createdBy: 'USR-001',
});

// Générer immédiatement
const reports = await blockedReports.getScheduledReports();
const blob = await blockedReports.generateReportNow(reports[0]);
console.log(blob);
```

### **J. Watchlist**

1. Ouvrir un dossier
2. Cliquer sur l'étoile ⭐ (à ajouter dans le DetailView)
3. Command Palette → "Mes favoris"

### **K. Filtres sauvegardés**

1. Appliquer des filtres (impact, bureau, délai)
2. Cliquer "Sauvegarder ces filtres" (à ajouter dans InboxView)
3. Donner un nom
4. Réutiliser via le menu déroulant

---

## 🔧 Connecter au backend réel

### **1. Configuration URLs**

Créer `.env.local` :

```env
NEXT_PUBLIC_API_URL=https://api.company.sn
NEXT_PUBLIC_WS_URL=wss://api.company.sn/ws/bmo/blocked
```

### **2. Modifier `blockedApiService.ts`**

Remplacer les fonctions mock par des vrais fetch :

```typescript
// Avant (mock)
async getAllBlockedDossiers(filters?: any): Promise<BlockedDossier[]> {
  await delay(300);
  return blockedDossiers as unknown as BlockedDossier[];
}

// Après (production)
async getAllBlockedDossiers(filters?: any): Promise<BlockedDossier[]> {
  const queryParams = new URLSearchParams(filters).toString();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bmo/blocked?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const { data } = await response.json();
  return data;
}
```

**Répéter pour tous les endpoints.**

### **3. Activer WebSocket réel**

Dans `blockedWebSocket.ts`, l'URL est déjà configurable :

```typescript
const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws/bmo/blocked';
```

Pas de modification nécessaire, juste configurer `.env.local`.

---

## 📋 Checklist backend

Voir `BLOCKED_API_SPECS.md` pour les détails complets.

### **Endpoints critiques**

- [ ] `GET /api/bmo/blocked` (liste)
- [ ] `GET /api/bmo/blocked/:id` (détail)
- [ ] `GET /api/bmo/blocked/stats` (statistiques)
- [ ] `POST /api/bmo/blocked/:id/resolve` (résolution)
- [ ] `POST /api/bmo/blocked/:id/escalate` (escalade)
- [ ] `POST /api/bmo/blocked/:id/substitute` (substitution BMO)
- [ ] `POST /api/bmo/blocked/bulk/escalate` (escalade massive)
- [ ] `GET /api/bmo/blocked/export` (export)
- [ ] `GET /api/bmo/blocked/audit` (audit log)

### **WebSocket**

- [ ] Connexion `ws://api/ws/bmo/blocked`
- [ ] Authentification JWT
- [ ] Événements : `new_blocking`, `sla_breach`, `resolution`, `escalation`
- [ ] Heartbeat ping/pong

### **Rapports**

- [ ] `GET /api/bmo/blocked/reports/scheduled`
- [ ] `POST /api/bmo/blocked/reports/scheduled`
- [ ] `POST /api/bmo/blocked/reports/generate-now`
- [ ] Service email (Nodemailer/SendGrid)
- [ ] Cron job vérification toutes les 5 min

---

## 🎨 Personnalisation

### **Modifier les couleurs**

Dans `tailwind.config.ts` :

```typescript
theme: {
  extend: {
    colors: {
      // Changer les couleurs sémantiques
      'critical': '#dc2626',  // red-600
      'high': '#f59e0b',      // amber-500
      'medium': '#3b82f6',    // blue-500
      'low': '#94a3b8',       // slate-400
    }
  }
}
```

### **Modifier les seuils SLA**

Dans `blockedApiService.ts` :

```typescript
async getSlaAlerts(): Promise<BlockedDossier[]> {
  const allDossiers = await this.getAllBlockedDossiers();
  
  // Modifier ces seuils
  return allDossiers.filter(d => 
    (d.delay ?? 0) > 7 &&  // ← Changer 7 jours
    d.impact !== 'low'      // ← Modifier la règle
  );
}
```

### **Ajouter des templates de résolution**

Dans `blockedApiService.ts` :

```typescript
const RESOLUTION_TEMPLATES = [
  // ... templates existants
  { 
    id: 'temp-009', 
    name: 'Votre nouveau template', 
    content: 'Texte prédéfini...' 
  },
];
```

### **Modifier la formule de priorité**

Dans `blockedApiService.ts` :

```typescript
function computePriority(dossier: BlockedDossier): number {
  const impactScore = impactScores[dossier.impact] || 1;
  const delay = dossier.delay ?? 0;
  const amountMillions = parseAmountFCFA(dossier.amount) / 1_000_000;
  
  // Modifier les poids ici
  return (impactScore * 1000) + (delay * 100) + (amountMillions * 10);
}
```

---

## 🐛 Troubleshooting

### **1. Notifications ne marchent pas**

**Causes possibles :**
- HTTPS requis en production (localhost OK)
- Permissions refusées → Réinitialiser dans paramètres navigateur
- Bloqueur de pubs actif

**Solution :**
```javascript
// Vérifier support
console.log('Notifications supported:', 'Notification' in window);

// Vérifier permission
console.log('Permission:', Notification.permission);
```

### **2. WebSocket ne connecte pas**

**Causes possibles :**
- URL incorrecte dans `.env.local`
- Backend pas démarré
- Firewall bloque port

**Solution :**
```javascript
// Vérifier statut
const { blockedWebSocket } = await import('@/lib/services/blockedWebSocket');
console.log('WS status:', blockedWebSocket.getStatus());
```

### **3. Données mockées ne s'affichent pas**

**Cause :** Import path incorrect.

**Solution :**
Vérifier dans `blockedApiService.ts` :
```typescript
import { blockedDossiers } from '@/lib/data';
```

Le fichier `src/lib/data/index.ts` doit exporter `blockedDossiers`.

### **4. Erreurs TypeScript**

**Cause :** Types manquants.

**Solution :**
Vérifier que `src/lib/types/bmo.types.ts` contient :
```typescript
export interface BlockedDossier { ... }
export interface BlockedStats { ... }
export interface BlockedDecisionEntry { ... }
```

---

## 📚 Ressources

### **Fichiers clés**

| Fichier | Description |
|---------|-------------|
| `BLOCKED_API_SPECS.md` | Specs API backend complètes |
| `REFONTE_BLOCKED_COMPLETE.md` | Récapitulatif implémentation |
| `AMELIORATIONS_BLOCKED.md` | Comparaison avec pages référence |
| `src/lib/services/blockedApiService.ts` | Service API principal |
| `src/lib/stores/blockedWorkspaceStore.ts` | Store Zustand |
| `app/(portals)/maitre-ouvrage/blocked/page.tsx` | Page principale |

### **Commandes utiles**

```bash
# Démarrer dev
npm run dev

# Build production
npm run build

# Vérifier types
npm run type-check

# Linter
npm run lint

# Tests (si configurés)
npm run test
```

---

## 🎯 Prochaines étapes recommandées

### **Frontend**

1. ✅ Tester toutes les vues en local
2. ✅ Activer notifications et tester
3. ⬜ Ajouter fichiers sons (`/public/sounds/`)
4. ⬜ Tests E2E (Playwright)
5. ⬜ Optimisations perfs (React.memo)

### **Backend**

1. ⬜ Implémenter les 16 endpoints REST
2. ⬜ Configurer WebSocket server
3. ⬜ Setup queue (Bull/RabbitMQ)
4. ⬜ Service email pour rapports
5. ⬜ Cron job vérification rapports

### **DevOps**

1. ⬜ CI/CD pipeline
2. ⬜ Monitoring (Sentry/Datadog)
3. ⬜ Logs centralisés (ELK)
4. ⬜ Cache Redis pour stats
5. ⬜ HTTPS pour notifications

---

## ✅ Validation

Pour valider que tout fonctionne :

1. ✅ Page charge sans erreur console
2. ✅ Compteurs affichent des chiffres
3. ✅ Command Palette s'ouvre avec ⌘K
4. ✅ Matrice affiche des bulles
5. ✅ Centre de décision s'ouvre
6. ✅ Wizard résolution fonctionne
7. ✅ Export génère un fichier
8. ✅ Notifications navigateur demandent permission
9. ✅ Tous les onglets sont cliquables
10. ✅ Pas d'erreur TypeScript/linter

---

**Prêt à démarrer ! 🚀**

Si problème, ouvrir une issue avec :
- Screenshot de l'erreur
- Console logs
- Version navigateur
- Environnement (dev/prod)

