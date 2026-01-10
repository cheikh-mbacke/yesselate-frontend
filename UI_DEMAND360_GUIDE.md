# 🎨 Guide Demand360Panel - Interface Utilisateur

**Composant UI complet** pour gérer les stakeholders, tâches et risques directement depuis l'interface.

---

## 📦 Qu'est-ce que Demand360Panel ?

Un **panneau interactif** qui affiche et permet de gérer :
- ✅ **Parties prenantes** (Stakeholders)
- ✅ **Tâches** (Tasks)
- ✅ **Risques & Opportunités** (Risks)

Le tout dans une interface **Fluent Design** moderne et réactive.

---

## 🚀 Utilisation

### 1. Accéder au panneau

```bash
# Lancer l'application
npm run dev

# Naviguer vers la page des demandes
http://localhost:3000/maitre-ouvrage/demandes

# Ouvrir une demande (exemple : REQ-2024-001)
# Le panneau Demand360 s'affiche automatiquement
```

---

### 2. Onglets disponibles

#### 👥 Parties prenantes

**Affichage** :
- Liste de toutes les parties prenantes
- Rôle (OWNER, APPROVER, REVIEWER, CONTRIBUTOR, INFORMED)
- Statut "requis" ou non

**Actions** :
1. **Ajouter** : Remplir Person ID, Nom, Rôle → Cliquer "Ajouter"
2. **Retirer** : Cliquer sur "Retirer" à côté d'un stakeholder

**Exemple** :
```
Person ID: USR-999
Nom: François DUBOIS
Rôle: CONTRIBUTOR

→ Cliquer "Ajouter"
```

---

#### 📋 Tâches

**Affichage** :
- Liste de toutes les tâches
- Statut (OPEN, IN_PROGRESS, DONE, BLOCKED)

**Actions** :
1. **Ajouter** : Saisir titre → Cliquer "Ajouter"
2. **Terminer/Réouvrir** : Basculer entre DONE et OPEN
3. **Supprimer** : Retirer une tâche

**Exemple** :
```
Nouvelle tâche… : Préparer le dossier de présentation

→ Cliquer "Ajouter"
→ La tâche apparaît avec statut OPEN
→ Cliquer "Terminer" pour passer en DONE
```

---

#### ⚠️ Risques & Opportunités

**Affichage** :
- Liste de tous les risques/opportunités
- Score de criticité (Probabilité × Impact)
- Risque principal affiché en haut du panneau

**Actions** :
1. **Ajouter** : Saisir Catégorie, Probabilité (1..5), Impact (1..5)
2. Le score est calculé automatiquement et affiché

**Exemple** :
```
Catégorie: Technique
Probabilité: 4
Impact: 5

→ Score affiché : 20 (CRITIQUE)
→ Cliquer "Ajouter (score 20)"
```

**Calcul du score** :
- 1-3 : FAIBLE (risque mineur)
- 4-8 : MOYEN (surveillance)
- 9-15 : ÉLEVÉ (action requise)
- 16-25 : CRITIQUE (urgence)

---

## 🎯 Features Clés

### Récapitulatif en Temps Réel

```
Dossier 360 — Pilotage
Risque principal : Budget (score 20)
```

Le **risque principal** (score le plus élevé) est affiché en permanence en haut du panneau.

### Compteurs Dynamiques

Les onglets affichent le **nombre d'éléments** en temps réel :
- Parties prenantes (5)
- Tâches (4)
- Risques/Opportunités (5)

### Bouton Rafraîchir

Recharge toutes les données depuis l'API pour synchroniser l'affichage.

---

## 📐 Architecture du Composant

### Structure

```typescript
<Demand360Panel demandId="REQ-2024-001" />
  ├── Récapitulatif (risque principal)
  ├── Onglets (Stakeholders, Tasks, Risks)
  ├── Formulaire d'ajout
  └── Liste des éléments avec actions
```

### État Local

```typescript
const [tab, setTab] = useState<'stakeholders' | 'tasks' | 'risks'>('stakeholders');
const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
const [tasks, setTasks] = useState<Task[]>([]);
const [risks, setRisks] = useState<Risk[]>([]);
```

### Chargement des Données

```typescript
const load = async () => {
  const [s, t, r] = await Promise.all([
    fetch(`/api/demands/${demandId}/stakeholders`).then(res => res.json()),
    fetch(`/api/demands/${demandId}/tasks`).then(res => res.json()),
    fetch(`/api/demands/${demandId}/risks`).then(res => res.json()),
  ]);
  setStakeholders(s.rows ?? []);
  setTasks(t.rows ?? []);
  setRisks(r.rows ?? []);
};
```

Chargement **parallèle** des 3 endpoints pour optimiser les performances.

---

## 🎨 Design Fluent

### Composants Utilisés

- ✅ `FluentCard` : Conteneur principal avec effet mica/acrylic
- ✅ `FluentButton` : Boutons avec variants (primary, secondary, destructive)
- ✅ `Input` : Champs de saisie avec design Fluent

### Couleurs & Effets

```css
/* Bordures semi-transparentes */
border-[rgb(var(--border)/0.5)]

/* Surfaces avec backdrop blur */
bg-[rgb(var(--surface)/0.55)]

/* Texte muted */
text-[rgb(var(--muted))]
```

### Responsive

```typescript
// Grid responsive pour formulaires
className="grid grid-cols-1 md:grid-cols-3 gap-2"

// Flex wrap pour boutons
className="flex flex-wrap gap-2"
```

---

## 🔧 Personnalisation

### Changer l'onglet par défaut

```typescript
const [tab, setTab] = useState<'stakeholders' | 'tasks' | 'risks'>('tasks'); // Par défaut : Tasks
```

### Modifier les valeurs initiales des formulaires

```typescript
// Stakeholders
const [pRole, setPRole] = useState<Stakeholder['role']>('OWNER'); // Par défaut : OWNER

// Risks
const [riskP, setRiskP] = useState(4); // Probabilité par défaut : 4
const [riskI, setRiskI] = useState(4); // Impact par défaut : 4
```

### Ajouter des champs au formulaire

```typescript
// Exemple : Ajouter une date d'échéance pour les tâches
const [taskDueAt, setTaskDueAt] = useState('');

<Input 
  type="date" 
  value={taskDueAt} 
  onChange={(e) => setTaskDueAt(e.target.value)} 
  placeholder="Date d'échéance" 
/>

// Dans le POST
body: JSON.stringify({ 
  title: taskTitle.trim(),
  dueAt: taskDueAt ? new Date(taskDueAt).toISOString() : null,
}),
```

---

## 🧪 Tests Manuels

### Scénario 1 : Ajouter un stakeholder

1. Ouvrir une demande
2. Aller sur l'onglet "Parties prenantes"
3. Remplir : `USR-TEST`, `Test User`, `INFORMED`
4. Cliquer "Ajouter"
5. ✅ Vérifier que le stakeholder apparaît dans la liste

### Scénario 2 : Gérer des tâches

1. Aller sur l'onglet "Tâches"
2. Ajouter une tâche : `Tester l'API`
3. Cliquer "Terminer" → Status passe à DONE
4. Cliquer "Réouvrir" → Status repasse à OPEN
5. Cliquer "Suppr." → Tâche supprimée
6. ✅ Vérifier l'audit trail dans le journal d'audit

### Scénario 3 : Analyser les risques

1. Aller sur l'onglet "Risques/Opportunités"
2. Ajouter un risque : `Technique`, P=5, I=5 → Score 25 (CRITIQUE)
3. Vérifier que le risque principal est mis à jour en haut
4. Ajouter un risque moyen : `Logistique`, P=2, I=3 → Score 6 (MOYEN)
5. ✅ Vérifier que le risque principal reste "Technique (score 25)"

---

## 📊 Intégration avec DemandTab

Le composant est intégré dans `DemandTab` :

```typescript
// src/components/features/bmo/workspace/tabs/DemandTab.tsx

import { Demand360Panel } from '@/components/features/bmo/workspace/tabs/Demand360Panel';

export function DemandTab({ id }: { id: string }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-4">
      <FluentCard>
        {/* Résumé de la demande */}
        
        {/* Panneau 360 */}
        <Demand360Panel demandId={id} />
      </FluentCard>

      <FluentCard>
        {/* Journal d'audit */}
      </FluentCard>
    </div>
  );
}
```

---

## 🎯 Prochaines Améliorations

### Court terme
- [ ] Validation côté client (formats, champs requis)
- [ ] Messages de confirmation/erreur (toasts)
- [ ] Loading states individuels par action
- [ ] Filtres et tri pour les listes

### Moyen terme
- [ ] Glisser-déposer pour réorganiser les tâches
- [ ] Matrice visuelle 5×5 pour les risques
- [ ] Assignation de tâches à des stakeholders
- [ ] Notifications en temps réel (WebSocket)

### Long terme
- [ ] Édition inline des éléments
- [ ] Historique des modifications
- [ ] Export PDF du dossier 360
- [ ] Dashboard analytics (graphiques)

---

## 🐛 Debugging

### Aucun élément ne s'affiche

**Cause** : Routes API incorrectes ou demande inexistante

**Solution** :
```bash
# Vérifier que l'API répond
curl http://localhost:3000/api/demands/REQ-2024-001/stakeholders

# Vérifier que la demande existe
curl http://localhost:3000/api/demands/REQ-2024-001
```

### Erreur "required is not a boolean"

**Cause** : SQLite stocke les booléens comme 0/1 (Int)

**Solution** : Le composant gère déjà ça avec `required: number` dans le type TypeScript.

### Le risque principal ne se met pas à jour

**Cause** : Le calcul `riskSummary` utilise `useMemo` et se met à jour uniquement si `risks` change.

**Solution** : Appeler `load()` après ajout d'un risque pour rafraîchir les données.

---

## ✅ Checklist d'Intégration

- [x] Composant `Demand360Panel` créé
- [x] Intégré dans `DemandTab`
- [x] 0 erreurs de lint
- [x] Routes API fonctionnelles
- [x] Types TypeScript corrects (SQLite Int pour boolean)
- [x] Design Fluent appliqué
- [x] Documentation complète

---

## 📖 Documentation Complémentaire

| Document | Contenu |
|----------|---------|
| [QUICKSTART_API.md](./QUICKSTART_API.md) | Guide API avec exemples curl |
| [API_TASKS_RISKS.md](./API_TASKS_RISKS.md) | Documentation détaillée API |
| [API_DELIVERY_SUMMARY.md](./API_DELIVERY_SUMMARY.md) | Récapitulatif de livraison |

---

**🎉 Interface utilisateur complète et fonctionnelle pour la gestion 360° des demandes !** 🚀✨

---

**Version** : 1.2.0  
**Date** : 2025-01-09  
**Status** : ✅ Production-Ready

