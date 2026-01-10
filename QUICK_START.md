# ⚡ Quick Start - Démarrage en 5 Minutes

## 🎯 Objectif

Démarrer l'application avec la base de données complète en **5 minutes chrono**.

---

## 📋 Prérequis

- ✅ Node.js 18+
- ✅ npm/yarn/pnpm
- ✅ Terminal

---

## 🚀 Installation (3 commandes)

### 1️⃣ Installer Prisma

```bash
npm install @prisma/client
npm install -D prisma tsx
```

**Temps** : ~30 secondes

---

### 2️⃣ Initialiser la Base de Données

```bash
npx prisma generate
npx prisma db push
```

**Résultat** :
- ✅ Client Prisma généré dans `node_modules/@prisma/client`
- ✅ Fichier `prisma/bmo.db` créé
- ✅ Tables `Demand` et `DemandEvent` créées

**Temps** : ~20 secondes

---

### 3️⃣ Peupler avec Données Test

```bash
npx tsx scripts/seed.ts
```

**Résultat** :
- ✅ 8 demandes insérées
- ✅ 8 événements de création insérés

**Temps** : ~5 secondes

---

## ✅ Vérification (optionnel)

```bash
npx prisma studio
```

**Résultat** :
- 🌐 Interface web ouverte sur `http://localhost:5555`
- 👀 Voir les tables `Demand` et `DemandEvent`
- ✏️ Éditer les données directement

---

## 🎮 Lancer l'Application

```bash
npm run dev
```

**Résultat** :
- 🌐 Application ouverte sur `http://localhost:3000`
- 📄 Page principale : `http://localhost:3000/(portals)/maitre-ouvrage/demandes`

---

## 🧪 Tests Rapides

### Test 1 : Récupérer les stats

```bash
curl http://localhost:3000/api/demands/stats
```

**Résultat attendu** :
```json
{
  "total": 8,
  "pending": 5,
  "validated": 1,
  "rejected": 1,
  "urgent": 2,
  "high": 2,
  "overdue": 2,
  "avgDelay": 8,
  "ts": "2026-01-09T..."
}
```

---

### Test 2 : Lister les demandes en attente

```bash
curl http://localhost:3000/api/demands?queue=pending
```

**Résultat attendu** :
```json
{
  "rows": [
    {
      "id": "REQ-2024-001",
      "subject": "Demande de budget pour projet Alpha",
      "bureau": "FIN",
      "type": "Budget",
      "status": "pending",
      ...
    },
    ...
  ]
}
```

---

### Test 3 : Valider une demande

```bash
curl -X POST http://localhost:3000/api/demands/REQ-2024-001/actions \
  -H "Content-Type: application/json" \
  -d '{"action":"validate","actorId":"USR-001","actorName":"A. DIALLO"}'
```

**Résultat attendu** :
```json
{
  "demand": {
    "id": "REQ-2024-001",
    "status": "validated",
    ...
  }
}
```

---

### Test 4 : Actions en masse

```bash
curl -X POST http://localhost:3000/api/demands/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["REQ-2024-004", "REQ-2024-005"],
    "action": "validate",
    "actorId": "USR-001",
    "actorName": "A. DIALLO"
  }'
```

**Résultat attendu** :
```json
{
  "updated": ["REQ-2024-004", "REQ-2024-005"],
  "skipped": []
}
```

---

### Test 5 : Export CSV

```bash
curl http://localhost:3000/api/demands/export?format=csv&queue=pending \
  --output demandes.csv
```

**Résultat attendu** :
- ✅ Fichier `demandes.csv` téléchargé
- 📊 Ouverture dans Excel/Numbers

---

## 🎨 Test UI

### 1. Page Principale

**URL** : `http://localhost:3000/(portals)/maitre-ouvrage/demandes`

**Fonctionnalités à tester** :
- ☀️ Toggle dark/light mode (coin haut droite)
- 📥 Bouton "À traiter" → Ouvre onglet "File À Traiter"
- 🔥 Bouton "Urgentes" → Ouvre onglet "Urgences Critiques"
- ⏱️ Bouton "En retard" → Ouvre onglet "Retards SLA"
- 📊 Bouton "Stats Live" → Ouvre modal statistiques
- 📤 Bouton "Export" → Ouvre modal export

---

### 2. Onglets Workspace

**Fonctionnalités à tester** :
- ✅ Cliquer sur un onglet → Change de vue
- ❌ Cliquer sur `X` → Ferme l'onglet
- 🔄 Ouvrir le même onglet deux fois → Bascule juste dessus
- 🚀 Ouvrir plusieurs onglets → Barre d'onglets avec scroll

---

### 3. Modal Stats

**Bouton** : "📊 Stats Live"

**Contenu attendu** :
- 📊 Total : 8
- 📥 À traiter : 5
- 🔥 Urgentes : 2
- ⏱️ En retard : 2
- ✅ Validées : 1
- ❌ Rejetées : 1
- 📏 Délai moyen : ~8j
- 🕐 Dernière mise à jour

---

### 4. Modal Export

**Bouton** : "📤 Export"

**Fonctionnalités à tester** :
- 📋 Sélectionner format : CSV ou JSON
- 🎯 Sélectionner file : Pending, Urgent, Overdue, Validated, Rejected, All
- 📥 Cliquer "Exporter" → Téléchargement du fichier
- 🎨 Design Fluent moderne

---

## 🐛 Dépannage Rapide

### Erreur : "Cannot find module '@prisma/client'"

**Solution** :
```bash
npx prisma generate
```

---

### Erreur : "Table 'Demand' does not exist"

**Solution** :
```bash
npx prisma db push
```

---

### Erreur : "Database is empty"

**Solution** :
```bash
npx tsx scripts/seed.ts
```

---

### Port 3000 déjà utilisé

**Solution** :
```bash
PORT=3001 npm run dev
```

---

### Prisma Studio ne s'ouvre pas

**Solution** :
```bash
npx prisma studio --port 5556
```

---

## 📚 Prochaines Étapes

### Niveau 1 : Documentation de base
1. 📖 [`README_COMPLETE.md`](./README_COMPLETE.md) - Point d'entrée
2. 🏆 [`FINAL_FINAL_SUMMARY.md`](./FINAL_FINAL_SUMMARY.md) - Récap absolu
3. 🚀 [`INSTALLATION.md`](./INSTALLATION.md) - Installation détaillée

---

### Niveau 2 : Comprendre l'architecture
1. 🏗️ [`ARCHITECTURE.md`](./ARCHITECTURE.md) - Architecture 3 couches
2. 📚 [`API_REFERENCE.md`](./API_REFERENCE.md) - 10 endpoints documentés
3. 🔌 [`API_SERVICES.md`](./API_SERVICES.md) - 6 services universels

---

### Niveau 3 : Fonctionnalités avancées
1. 🚀 [`BULK_ACTIONS.md`](./BULK_ACTIONS.md) - Actions en masse
2. 🔧 [`API_ACTIONS.md`](./API_ACTIONS.md) - Actions unifiées
3. 📊 [`STATS_ENDPOINT.md`](./STATS_ENDPOINT.md) - Statistiques temps réel
4. 📤 [`EXPORT_ENDPOINT.md`](./EXPORT_ENDPOINT.md) - Export CSV/JSON
5. ⏱️ [`OVERDUE_SLA.md`](./OVERDUE_SLA.md) - File "Overdue" & SLA

---

### Niveau 4 : UI/UX
1. 🎭 [`FLUENT_MODALS.md`](./FLUENT_MODALS.md) - Guide des modals
2. 🗂️ [`WORKSPACE_STORE.md`](./WORKSPACE_STORE.md) - Gestion onglets

---

## 🎯 Checklist de Démarrage

- [ ] Node.js 18+ installé
- [ ] Dépendances Prisma installées (`@prisma/client`, `prisma`, `tsx`)
- [ ] Client Prisma généré (`npx prisma generate`)
- [ ] Base de données créée (`npx prisma db push`)
- [ ] Données test insérées (`npx tsx scripts/seed.ts`)
- [ ] Application lancée (`npm run dev`)
- [ ] Test API stats (`curl localhost:3000/api/demands/stats`)
- [ ] Test UI page principale
- [ ] Test onglets workspace
- [ ] Test modals (Stats, Export)
- [ ] Documentation lue (README_COMPLETE.md)

---

## 🎉 Félicitations !

Vous avez maintenant une application complète et fonctionnelle !

**Prochaine étape** : Lire [`README_COMPLETE.md`](./README_COMPLETE.md) pour explorer toutes les fonctionnalités.

---

## ⏱️ Récapitulatif Temps

| Étape | Temps | Cumulé |
|-------|-------|--------|
| 1. Installer Prisma | ~30s | 0:30 |
| 2. Initialiser DB | ~20s | 0:50 |
| 3. Peupler données | ~5s | 0:55 |
| 4. Lancer app | ~10s | 1:05 |
| 5. Tests API | ~1min | 2:05 |
| 6. Tests UI | ~2min | 4:05 |
| **TOTAL** | **~4min** | **🏁** |

---

# ⚡ **DÉMARRAGE COMPLET EN MOINS DE 5 MINUTES !**

**Version** : 1.0.0  
**Status** : ✅ **PRODUCTION READY**  
**Date** : Janvier 2026

