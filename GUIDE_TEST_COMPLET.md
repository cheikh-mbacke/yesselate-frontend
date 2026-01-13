# 🧪 GUIDE DE TEST COMPLET - MODULE BLOCKED

**Date** : 2026-01-10  
**Module** : Dossiers Bloqués  
**Version** : 1.0  

---

## 🚀 DÉMARRAGE RAPIDE

### Option A : Script automatique (Recommandé)

```powershell
# Exécuter le script d'initialisation complet
.\scripts\init-blocked-complete.ps1
```

Ce script fait tout automatiquement :
- ✅ Migration Prisma
- ✅ Génération du client
- ✅ Création de 50 dossiers de test
- ✅ Vérification des tables

### Option B : Étape par étape

```powershell
# 1. Migration
npx prisma migrate dev --name add-blocked-dossiers

# 2. Génération client
npx prisma generate

# 3. Données de test (50 dossiers)
node scripts/seed-blocked-test-data.js

# 4. Lancer le serveur
npm run dev
```

---

## 🧪 TESTS À EFFECTUER

### 1. ✅ **TEST INTERFACE (Frontend)**

#### Accès à la page
```
URL: http://localhost:3000/maitre-ouvrage/blocked
```

**À vérifier** :
- [ ] La page charge sans erreur
- [ ] Le sidebar s'affiche avec 8 catégories
- [ ] La KPI Bar montre les statistiques
- [ ] La sub-navigation affiche les sous-onglets
- [ ] Les badges affichent les bons compteurs

#### Navigation Niveau 1 (8 catégories)
- [ ] **Overview** - Dashboard complet avec KPIs
- [ ] **Queue** - Liste des dossiers filtrable
- [ ] **Critical** - Blocages critiques avec alert banner
- [ ] **Matrix** - Matrice Impact × Délai
- [ ] **Bureaux** - Stats par bureau avec progress bars
- [ ] **Timeline** - Vue chronologique
- [ ] **Decisions** - Liste des décisions
- [ ] **Audit** - Journal d'audit avec hash

#### Navigation Niveau 2 (31 sous-onglets)
Tester quelques sous-onglets :
- [ ] Overview → Summary
- [ ] Queue → Critical (doit filtrer les critiques)
- [ ] Critical → SLA (doit afficher SLA dépassés)
- [ ] Matrix → Combined (matrice complète)
- [ ] Bureaux → Most (bureaux les plus impactés)

#### Modales (9)
Tester l'ouverture de chaque modale :
- [ ] **Stats** : Clic sur icône stats → Modal avec graphiques
- [ ] **Decision Center** : Clic sur bouton "Traiter" → Centre de décision
- [ ] **Export** : Clic sur export → Choix de formats
- [ ] **Shortcuts** : Taper `?` → Liste des raccourcis
- [ ] **Settings** : Clic sur settings → Config KPI Bar
- [ ] **KPI Detail** : Clic sur un KPI → Modal enrichi avec 4 onglets
- [ ] **Alert Detail** : Clic sur une alerte SLA → Gestion complète
- [ ] **Dossier Detail** : Clic sur un dossier → Détails complets
- [ ] **Confirm** : Action de suppression → Modal de confirmation

#### Filters Panel
- [ ] Clic sur bouton "Filtres" → Panel slide-in s'ouvre
- [ ] Sélectionner Impact : Critical → Compteur s'incrémente
- [ ] Sélectionner Bureau : BF → Compteur +1
- [ ] Clic "Appliquer" → Liste filtrée
- [ ] Clic "Réinitialiser" → Filtres effacés

#### Keyboard Shortcuts
- [ ] `⌘K` ou `Ctrl+K` → Command Palette
- [ ] `⌘B` → Toggle Sidebar
- [ ] `⌘F` → Filters Panel
- [ ] `⌘D` → Decision Center
- [ ] `⌘I` → Stats Modal
- [ ] `⌘E` → Export Modal
- [ ] `?` → Shortcuts Modal
- [ ] `Esc` → Fermer la modale active

---

### 2. ✅ **TEST API (Backend)**

#### Stats globales
```powershell
curl http://localhost:3000/api/bmo/blocked/stats
```

**Résultat attendu** :
```json
{
  "total": 50,
  "critical": ~12,
  "high": ~12,
  "medium": ~13,
  "low": ~13,
  "avgDelay": ~30,
  "overdueSLA": ~15,
  "resolvedToday": 0,
  "escalatedToday": 0,
  "byBureau": [...],
  "byType": [...]
}
```

#### Liste des dossiers
```powershell
# Tous les dossiers (page 1)
curl http://localhost:3000/api/bmo/blocked

# Filtrer par impact
curl "http://localhost:3000/api/bmo/blocked?impact=critical"

# Filtrer par bureau
curl "http://localhost:3000/api/bmo/blocked?bureau=BF"

# Filtrer par statut
curl "http://localhost:3000/api/bmo/blocked?status=pending"

# Pagination
curl "http://localhost:3000/api/bmo/blocked?page=2&limit=10"
```

#### Détail d'un dossier
```powershell
# Remplacer {ID} par un ID réel
curl http://localhost:3000/api/bmo/blocked/{ID}
```

#### Créer un dossier
```powershell
curl -X POST http://localhost:3000/api/bmo/blocked `
  -H "Content-Type: application/json" `
  -d '{
    "subject": "Test API - Nouveau blocage",
    "description": "Test depuis PowerShell",
    "impact": "high",
    "priority": "urgent",
    "type": "paiement",
    "bureau": "BCG",
    "assignedToName": "Test User",
    "amount": 1000000
  }'
```

#### Résoudre un dossier
```powershell
# Remplacer {ID}
curl -X POST http://localhost:3000/api/bmo/blocked/{ID}/resolve `
  -H "Content-Type: application/json" `
  -d '{
    "resolution": "Validation obtenue",
    "actorId": "user1",
    "actorName": "Marie Dupont"
  }'
```

#### Escalader un dossier
```powershell
# Remplacer {ID}
curl -X POST http://localhost:3000/api/bmo/blocked/{ID}/escalate `
  -H "Content-Type: application/json" `
  -d '{
    "reason": "Dépassement SLA critique",
    "escalatedTo": "Direction Générale",
    "actorId": "user1",
    "actorName": "Marie Dupont"
  }'
```

#### Matrice urgence
```powershell
curl http://localhost:3000/api/bmo/blocked/matrix
```

#### Stats par bureau
```powershell
curl http://localhost:3000/api/bmo/blocked/bureaux
```

#### Timeline
```powershell
curl http://localhost:3000/api/bmo/blocked/timeline
```

---

### 3. ✅ **TEST REACT QUERY (Cache)**

#### Test du cache
1. Ouvrir la page Blocked
2. Ouvrir DevTools → Network
3. Naviguer entre les onglets
4. **Vérifier** : Pas de nouvel appel API si données en cache

#### Test d'invalidation
1. Créer un nouveau dossier (via API ou interface)
2. **Vérifier** : La liste se rafraîchit automatiquement
3. Les stats se mettent à jour

#### Test optimistic update
1. Résoudre un dossier
2. **Vérifier** : L'UI se met à jour immédiatement
3. Même si l'API prend du temps

---

### 4. ✅ **TEST PRISMA STUDIO**

```powershell
npx prisma studio
```

**À vérifier** :
- [ ] Table `BlockedDossier` existe avec ~50 entrées
- [ ] Table `BlockedAuditLog` existe avec des logs
- [ ] Table `BlockedComment` existe avec des commentaires
- [ ] Les relations fonctionnent (clic sur un dossier → voir ses logs)

---

## 📊 CHECKLIST COMPLÈTE

### Frontend (15 points)
- [ ] Page charge sans erreur
- [ ] Sidebar (8 catégories)
- [ ] Sub-navigation (31 sous-onglets)
- [ ] KPI Bar (4 KPIs avec sparklines)
- [ ] Filters Panel (12 filtres)
- [ ] 9 modales fonctionnelles
- [ ] Command Palette (⌘K)
- [ ] Keyboard shortcuts (10)
- [ ] Breadcrumbs navigation
- [ ] Back button
- [ ] Badges dynamiques
- [ ] Toasts notifications
- [ ] Loading states
- [ ] Empty states
- [ ] Error handling

### Backend (13 points)
- [ ] GET /api/bmo/blocked
- [ ] POST /api/bmo/blocked
- [ ] GET /api/bmo/blocked/[id]
- [ ] PATCH /api/bmo/blocked/[id]
- [ ] DELETE /api/bmo/blocked/[id]
- [ ] GET /api/bmo/blocked/stats
- [ ] POST /api/bmo/blocked/[id]/resolve
- [ ] POST /api/bmo/blocked/[id]/escalate
- [ ] GET /api/bmo/blocked/[id]/comment
- [ ] POST /api/bmo/blocked/[id]/comment
- [ ] GET /api/bmo/blocked/matrix
- [ ] GET /api/bmo/blocked/bureaux
- [ ] GET /api/bmo/blocked/timeline

### Database (3 points)
- [ ] BlockedDossier table créée
- [ ] BlockedAuditLog table créée
- [ ] BlockedComment table créée

---

## 🐛 RÉSOLUTION DE PROBLÈMES

### Erreur : "table does not exist"
```powershell
# Relancer la migration
npx prisma migrate dev --name add-blocked-dossiers

# Ou utiliser db push
npx prisma db push
```

### Erreur : "Cannot find module @prisma/client"
```powershell
npx prisma generate
```

### Erreur : "Port 3000 déjà utilisé"
```powershell
# Trouver le processus
netstat -ano | findstr :3000

# Tuer le processus (remplacer PID)
taskkill /PID <PID> /F
```

### Les données de test ne s'affichent pas
```powershell
# Regénérer les données
node scripts/seed-blocked-test-data.js

# Vérifier dans Prisma Studio
npx prisma studio
```

### Cache React Query ne fonctionne pas
1. Ouvrir DevTools
2. Onglet "Application" → "Storage" → "Clear site data"
3. Recharger la page

---

## 📈 MÉTRIQUES DE SUCCÈS

### Performance
- [ ] Page charge en < 2 secondes
- [ ] Transitions fluides (< 300ms)
- [ ] API répond en < 500ms

### UX
- [ ] Navigation intuitive
- [ ] Pas d'erreur console
- [ ] États de chargement visibles
- [ ] Messages d'erreur clairs

### Fonctionnalité
- [ ] Toutes les modales s'ouvrent
- [ ] Tous les filtres fonctionnent
- [ ] Toutes les APIs répondent
- [ ] Les données se mettent à jour

---

## 🎯 SCÉNARIOS DE TEST COMPLETS

### Scénario 1 : Traiter un blocage critique
1. Aller sur la page Blocked
2. Clic sur "Critical" dans le sidebar
3. Sélectionner un dossier critique
4. Clic sur "Traiter" → Decision Center s'ouvre
5. Clic sur "Résoudre"
6. Remplir la résolution
7. Valider
8. **Vérifier** : Dossier passe en "Résolu" et disparaît de la liste

### Scénario 2 : Escalader un dossier
1. Aller sur "Queue" → "All"
2. Sélectionner un dossier avec délai > 30j
3. Clic sur "Decision Center"
4. Clic sur "Escalader"
5. Remplir la raison d'escalade
6. Valider
7. **Vérifier** : Log d'audit créé avec hash

### Scénario 3 : Filtrer et exporter
1. Clic sur bouton "Filtres"
2. Sélectionner Impact: Critical + Bureau: BF
3. Clic "Appliquer"
4. **Vérifier** : Liste filtrée
5. Clic sur "Export"
6. Choisir format XLSX
7. **Vérifier** : Fichier téléchargé

---

## ✅ VALIDATION FINALE

Une fois tous les tests passés :
- [ ] Tous les tests Frontend ✅
- [ ] Tous les tests Backend ✅
- [ ] Tous les tests Database ✅
- [ ] Aucune erreur console
- [ ] Performance acceptable
- [ ] UX fluide

**🎉 Le module est validé et prêt pour la production !**

---

**Bon test ! 🚀**

