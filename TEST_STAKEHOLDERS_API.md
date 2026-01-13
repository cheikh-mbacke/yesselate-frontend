# 🧪 Test API Stakeholders

## Prérequis

```bash
npm run dev
```

Le serveur doit tourner sur `http://localhost:3000`

---

## Tests

### 1. GET - Liste des stakeholders

```bash
curl http://localhost:3000/api/demands/REQ-2024-001/stakeholders
```

**Résultat attendu** :
```json
{
  "rows": [
    {
      "id": "clx...",
      "demandId": "REQ-2024-001",
      "personId": "USR-001",
      "personName": "Alice DUPONT",
      "role": "OWNER",
      "required": 1,
      "note": "Chef de projet, pilote le dossier",
      "createdAt": "2024-..."
    },
    // ... 4 autres stakeholders
  ]
}
```

---

### 2. POST - Ajouter un stakeholder

```bash
curl -X POST http://localhost:3000/api/demands/REQ-2024-001/stakeholders \
  -H "Content-Type: application/json" \
  -d '{
    "personId": "USR-999",
    "personName": "Test USER",
    "role": "INFORMED",
    "required": false,
    "note": "Test stakeholder"
  }'
```

**Résultat attendu** :
```json
{
  "row": {
    "id": "clx...",
    "demandId": "REQ-2024-001",
    "personId": "USR-999",
    "personName": "Test USER",
    "role": "INFORMED",
    "required": 0,
    "note": "Test stakeholder",
    "createdAt": "2024-..."
  }
}
```

**Vérification audit** :
```bash
# L'événement doit avoir été créé
curl http://localhost:3000/api/demands/REQ-2024-001 | jq '.demand.events'
```

---

### 3. DELETE - Supprimer un stakeholder

```bash
# D'abord, récupérer un ID
STAKEHOLDER_ID=$(curl -s http://localhost:3000/api/demands/REQ-2024-001/stakeholders | jq -r '.rows[0].id')

# Ensuite, supprimer
curl -X DELETE http://localhost:3000/api/demands/REQ-2024-001/stakeholders/$STAKEHOLDER_ID
```

**Résultat attendu** :
```json
{
  "ok": true
}
```

---

## Tests d'erreur

### 1. POST sans champs requis

```bash
curl -X POST http://localhost:3000/api/demands/REQ-2024-001/stakeholders \
  -H "Content-Type: application/json" \
  -d '{"personId": "USR-123"}'
```

**Résultat attendu** :
```json
{
  "error": "personId/personName/role requis"
}
```

**Status** : `400 Bad Request`

---

### 2. GET demande inexistante

```bash
curl http://localhost:3000/api/demands/REQ-9999/stakeholders
```

**Résultat attendu** :
```json
{
  "rows": []
}
```

---

## Vérifications complètes

### 1. Ordre de tri

Les stakeholders doivent être triés par :
1. `required` DESC (requis en premier)
2. `role` ASC (ordre alphabétique)
3. `createdAt` ASC (plus ancien en premier)

```bash
curl -s http://localhost:3000/api/demands/REQ-2024-001/stakeholders | jq '.rows | map({name: .personName, role: .role, required: .required})'
```

Ordre attendu :
1. OWNER (required=1)
2. APPROVER (required=1)
3. REVIEWER (required=1)
4. CONTRIBUTOR (required=0)
5. INFORMED (required=0)

---

### 2. Audit trail

Chaque ajout/suppression doit créer un événement :

```bash
curl -s http://localhost:3000/api/demands/REQ-2024-001 | jq '.demand.events | map(select(.action | contains("stakeholder"))) | length'
```

---

## Test avec service client

```typescript
import { listStakeholders, addStakeholder, removeStakeholder } from '@/lib/api/stakeholdersClient';

// Liste
const stakeholders = await listStakeholders('REQ-2024-001');
console.log(`${stakeholders.length} stakeholders`);

// Ajouter
const newStakeholder = await addStakeholder('REQ-2024-001', {
  personId: 'USR-999',
  personName: 'Test USER',
  role: 'INFORMED',
  required: false,
  note: 'Test',
});
console.log('Ajouté:', newStakeholder.id);

// Supprimer
await removeStakeholder('REQ-2024-001', newStakeholder.id);
console.log('Supprimé');
```

---

## ✅ Checklist

- [ ] GET retourne liste correcte
- [ ] POST crée stakeholder avec tous les champs
- [ ] POST crée événement audit
- [ ] POST valide les champs requis
- [ ] DELETE supprime stakeholder
- [ ] DELETE crée événement audit
- [ ] Tri correct (required DESC, role ASC, createdAt ASC)
- [ ] Service client fonctionne
- [ ] Hook React fonctionne

---

## 🎯 Status

**Version** : 1.1.0  
**API Stakeholders** : ✅ Fonctionnelle

