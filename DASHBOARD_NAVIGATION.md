# Navigation du Dashboard - Documentation

## Structure du Dashboard

Le dashboard est organisé en **5 sections logiques** :

1. **Performance Globale** - KPIs principaux
2. **Risques & Santé Organisationnelle** - Monitoring des risques et bureaux
3. **Actions Prioritaires** - Actions recommandées
4. **Décisions & Timeline** - Historique des décisions
5. **Indicateurs Temps Réel** - Métriques en direct

---

## Routes et Paramètres de Navigation

### 📊 Section Performance Globale

#### Carte "Demandes"
- **Route** : `/maitre-ouvrage/demandes`
- **Filtres disponibles** :
  - `?filter=urgent` - Demandes urgentes
  - `?filter=high` - Priorité haute
  - `?filter=normal` - Priorité normale
  - `?filter=low` - Priorité basse
  - `?filter=all` - Toutes les demandes (défaut)

#### Carte "Validations"
- **Route** : `/maitre-ouvrage/demandes?filter=validated`
- **Action** : Ouvre la page Demandes avec filtre sur les validations

#### Carte "Rejets"
- **Route** : `/maitre-ouvrage/demandes?filter=rejected`
- **Action** : Ouvre la page Demandes avec filtre sur les rejets

#### Carte "Budget traité"
- **Route** : `/maitre-ouvrage/finances`
- **Action** : Ouvre la page Finance complète

---

### ⚠️ Section Risques & Santé Organisationnelle

#### Carte "Santé organisationnelle"
- **Route principale** : `/maitre-ouvrage/arbitrages-vivants?tab=bureaux`
- **Clic sur un bureau** : `/maitre-ouvrage/arbitrages-vivants?bureau={CODE_BUREAU}`
- **Exemples** :
  - `?bureau=BMO` - Vue du bureau BMO
  - `?bureau=BF` - Vue du bureau BF
  - `?bureau=BJ` - Vue du bureau BJ

#### Carte "Top risques"
- **Route principale** : `/maitre-ouvrage/alerts`
- **Clic sur un risque de type "blocked"** :
  - Ouvre la modal de détail du dossier bloqué (via `openBlocageModal`)
- **Clic sur un risque de type "alert"** :
  - Redirige vers `/maitre-ouvrage/alerts`

---

### ⚡ Section Actions Prioritaires

#### Action #1 - Dossiers bloqués (Critical)
- **Route** : `/maitre-ouvrage/substitution?id={DOSSIER_ID}`
- **Paramètres** :
  - `id` : ID du dossier bloqué à traiter
- **Exemple** : `/maitre-ouvrage/substitution?id=PAY-2025-0041`

#### Action #2 - Paiements urgents (High)
- **Route** : `/maitre-ouvrage/validation-paiements?urgent=true`
- **Paramètres** :
  - `urgent=true` - Affiche uniquement les paiements urgents (< 5 jours)

#### Action #3 - Contrats à signer (Medium)
- **Route** : `/maitre-ouvrage/validation-contrats?status=pending`
- **Paramètres** :
  - `status=pending` - Filtre sur les contrats en attente de signature

---

### ⚖️ Section Décisions & Timeline

#### Carte "Timeline des décisions"
- **Route principale** : `/maitre-ouvrage/decisions`
- **Clic sur une décision** : `/maitre-ouvrage/decisions?id={DECISION_ID}`
- **Paramètres** :
  - `id` : ID de la décision à afficher en détail
- **Exemple** : `/maitre-ouvrage/decisions?id=DEC-2025-001`

---

### 📈 Section Indicateurs Temps Réel

#### Carte "Taux validation"
- **Route** : `/maitre-ouvrage/analytics`
- **Action** : Ouvre la page Analytics avec vue d'ensemble

#### Carte "Temps moyen réponse"
- **Route** : `/maitre-ouvrage/analytics`
- **Action** : Ouvre la page Analytics avec vue d'ensemble

#### Carte "Validations aujourd'hui"
- **Route** : `/maitre-ouvrage/analytics?period=today`
- **Paramètres** :
  - `period=today` - Filtre sur les données du jour

#### Carte "Montant traité"
- **Route** : `/maitre-ouvrage/finances`
- **Action** : Ouvre la page Finance complète

---

## Implémentation dans les Pages Cibles

Pour que les pages respectent les filtres passés via l'URL, utilisez `useSearchParams` de Next.js :

```typescript
'use client';

import { useSearchParams } from 'next/navigation';

export default function DemandesPage() {
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') || 'all';
  
  // Appliquer le filtre
  const filteredDemands = useMemo(() => {
    if (filter === 'all') return demands;
    if (filter === 'validated') return demands.filter(d => d.status === 'validated');
    if (filter === 'rejected') return demands.filter(d => d.status === 'rejected');
    return demands.filter(d => d.priority === filter);
  }, [filter]);
  
  // ...
}
```

---

## Style et Comportement des Cartes

### Composant DashboardCard
Toutes les cartes utilisent le composant `DashboardCard` qui garantit :

- **Style cohérent** : Bordure top colorée, fond adapté au thème
- **Hover effect** : Légère élévation et zoom au survol (`hover:scale-[1.01]`)
- **Indicateur visuel** : Flèche droite apparaît si la carte est cliquable
- **Badge** : Compteur optionnel avec variantes (urgent, warning, success, info)

### Effets visuels
- **Transition** : `transition-all duration-200` pour animations fluides
- **Cursor** : `cursor-pointer` sur les cartes cliquables
- **Shadow** : `hover:shadow-lg` pour effet de profondeur

---

## Exemples d'Utilisation

### Navigation simple
```typescript
<DashboardCard
  title="Demandes"
  href="/maitre-ouvrage/demandes"
  icon="📋"
>
  {/* Contenu */}
</DashboardCard>
```

### Navigation avec paramètres
```typescript
const buildUrl = (base: string, params?: Record<string, string>) => {
  if (!params) return base;
  const searchParams = new URLSearchParams(params);
  return `${base}?${searchParams.toString()}`;
};

<DashboardCard
  title="Paiements urgents"
  href={buildUrl('/maitre-ouvrage/validation-paiements', { urgent: 'true' })}
  icon="💳"
>
  {/* Contenu */}
</DashboardCard>
```

### Action onClick personnalisée
```typescript
<DashboardCard
  title="Risque"
  onClick={() => openBlocageModal(dossier)}
  icon="🚨"
>
  {/* Contenu */}
</DashboardCard>
```

---

## Notes Importantes

1. **Tous les liens sont cliquables** : Les cartes entières sont des liens, pas seulement des boutons internes
2. **Filtres persistants** : Les paramètres d'URL permettent de préserver les filtres lors du rafraîchissement
3. **Modal vs Navigation** : Les dossiers bloqués ouvrent une modal (pas de navigation), les autres éléments naviguent
4. **Thème adaptatif** : Toutes les cartes s'adaptent automatiquement au thème sombre/clair

