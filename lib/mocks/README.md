# 📦 Mock Data - Documentation

Ce dossier contient des **données mock réalistes** pour le développement et les tests du système BMO.

---

## 📁 Fichiers Disponibles

### 1. `projets.mock.ts`
**Données de projets BTP sénégalais**

- ✅ **8 projets complets** avec données réalistes
- Types: Routes, ponts, autoroutes, infrastructures
- Statuts: En cours, planifié, complété, bloqué
- Budgets réalistes en FCFA
- Phases de projet détaillées
- Risques identifiés

**Exemples**:
- Construction Route Nationale RN7 (850M FCFA)
- Pont Sénégal-Gambie (2.5Mds FCFA)
- Autoroute Dakar-Thiès (5.2Mds FCFA)
- Corniche Dakar (terminé)
- Échangeur Liberté 6 (bloqué)

### 2. `clients.mock.ts`
**Données de clients du secteur BTP**

- ✅ **12 clients variés** (publics et privés)
- Organismes gouvernementaux (AGEROUTE, Ministère TP, APIX)
- Collectivités (Ville de Dakar, Conseil Kaolack)
- Secteur privé (Sonatel, CBAO, Auchan)
- Indicateurs: CA, satisfaction, taux paiement
- Contacts détaillés

**Secteurs couverts**:
- Infrastructure, Administration, Collectivités
- Éducation, Énergie, Télécommunications
- Finance, Commerce, Immobilier

### 3. `employes.mock.ts`
**Données d'employés d'entreprise BTP**

- ✅ **12 employés types** avec profils variés
- Ingénieurs (Civil, Géotechnique, Méthodes)
- Architecte, Topographe, Conducteur travaux
- Direction, QSE, Support
- Compétences techniques détaillées
- Certifications professionnelles
- Identification employés SPOF (Single Point of Failure)

**Fonctions**:
- Direction de projet
- Études techniques
- Exécution chantier
- Qualité & Sécurité
- Support & Administration

### 4. `index.ts`
**Export centralisé + Utilitaires**

Fonctions helper pour manipuler les mocks:
- `mockDelay()` - Simule délai réseau
- `mockSearch()` - Recherche dans données
- `mockPaginate()` - Pagination
- `mockSort()` - Tri
- `mockApiResponse()` - Simule réponse API complète

---

## 🎯 Comment Utiliser

### Import Simple

```typescript
import {
  mockProjets,
  mockClients,
  mockEmployes,
  mockProjetsStats,
} from '@/lib/mocks';

// Utiliser les données
const projets = mockProjets;
const stats = mockProjetsStats;
```

### Import avec Utilitaires

```typescript
import {
  mockProjets,
  mockSearch,
  mockPaginate,
  mockApiResponse,
} from '@/lib/mocks';

// Recherche
const results = mockSearch(
  mockProjets,
  'route',
  ['titre', 'client', 'localisation']
);

// Pagination
const page1 = mockPaginate(mockProjets, 1, 10);

// Simule API
const data = await mockApiResponse(mockProjets, {
  delay: 500,
  errorProbability: 0.1,
});
```

### Dans un Service

```typescript
// lib/services/projetsApiService.ts
import { mockProjets, mockProjetsStats, mockDelay } from '@/lib/mocks';
import { configManager } from '@/lib/config/serviceConfig';

class ProjetsApiService {
  async getQueue(): Promise<Projet[]> {
    // Utiliser mocks en dev, vraie API en prod
    if (configManager.isMockEnabled()) {
      await mockDelay(400);
      return mockProjets;
    }

    // Vraie API
    const response = await fetch(`${this.baseUrl}/projets`);
    return response.json();
  }

  async getStats(): Promise<ProjetsStats> {
    if (configManager.isMockEnabled()) {
      await mockDelay(300);
      return mockProjetsStats;
    }

    const response = await fetch(`${this.baseUrl}/projets/stats`);
    return response.json();
  }
}
```

---

## 🔧 Configuration

### Activer/Désactiver les Mocks

```typescript
// lib/config/serviceConfig.ts
import { configManager } from '@/lib/config/serviceConfig';

// Vérifier si mocks activés
if (configManager.isMockEnabled()) {
  // Utiliser données mock
}

// Désactiver manuellement
configManager.updateServiceConfig({
  enableMocks: false,
});
```

### Variables d'Environnement

```env
# .env.local
NODE_ENV=development          # Mocks activés par défaut
NEXT_PUBLIC_ENABLE_MOCKS=true # Force activation
```

---

## ✨ Avantages des Mocks

### 1. Développement Découplé
- Pas besoin du backend pour développer le frontend
- Travail parallèle des équipes

### 2. Tests Facilitées
- Données cohérentes et prévisibles
- Scénarios d'erreur simulables
- Tests rapides sans appels réseau

### 3. Démos & Présentations
- Données réalistes et professionnelles
- Pas de dépendance à des environnements externes
- Performances optimales

### 4. Documentation Vivante
- Exemples concrets de structures de données
- Référence pour l'intégration backend

---

## 🔄 Migration vers API Réelle

### Étape 1: Garder le Pattern

```typescript
// Le pattern reste identique
class MyService {
  async getData() {
    // Dev: mocks
    if (configManager.isMockEnabled()) {
      return mockData;
    }

    // Prod: vraie API
    return await fetchWithRetry('/api/endpoint');
  }
}
```

### Étape 2: Tester avec Mocks OFF

```typescript
// Tester en désactivant les mocks
configManager.updateServiceConfig({
  enableMocks: false,
});
```

### Étape 3: Supprimer Progressivement

Une fois l'API stable:
1. Désactiver mocks en production
2. Garder mocks pour tests automatisés
3. Optionnel: supprimer mocks si non utilisés

---

## 📊 Statistiques des Mocks

| Type | Fichiers | Entités | Lignes |
|------|----------|---------|--------|
| Projets | 1 | 8 projets | ~400 |
| Clients | 1 | 12 clients | ~350 |
| Employés | 1 | 12 employés | ~450 |
| Utilitaires | 1 | - | ~150 |
| **Total** | **4** | **32** | **~1,350** |

---

## 🎨 Personnalisation

### Ajouter des Mocks

```typescript
// lib/mocks/nouveauModule.mock.ts
export const mockNouveauModule = [
  {
    id: 'NEW-001',
    // ... vos données
  },
];

export const mockNouveauModuleStats = {
  total: 10,
  // ... vos stats
};
```

### Mettre à Jour l'Index

```typescript
// lib/mocks/index.ts
export * from './nouveauModule.mock';
export { mockNouveauModule, mockNouveauModuleStats } from './nouveauModule.mock';
```

---

## 🔍 Données Réalistes

Toutes les données mock sont inspirées de:
- Vrais projets BTP au Sénégal
- Organismes et entreprises existants
- Budgets et délais réalistes
- Noms sénégalais authentiques
- Secteurs d'activité pertinents

---

## ⚠️ Notes Importantes

1. **Données Fictives**: Bien que réalistes, toutes les données sont fictives
2. **Contacts**: Les emails et téléphones sont des exemples
3. **Montants**: Budgets en FCFA basés sur des ordres de grandeur réels
4. **Noms**: Noms sénégalais courants mais personnages fictifs

---

## 📚 Ressources

- [Documentation Services](../services/README.md)
- [Configuration](../config/serviceConfig.ts)
- [Guide Utilisation](../../GUIDE_UTILISATION.md)

---

**Version 2.0.0 - 10 Janvier 2026**  
**4 fichiers | 32 entités | ~1,350 lignes**

