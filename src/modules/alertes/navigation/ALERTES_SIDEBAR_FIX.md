# 🔧 Correction de l'erreur "Change in the order of Hooks" dans AlertesSidebar

## ❌ Problème identifié

L'erreur "React has detected a change in the order of Hooks called by AlertesSidebar" se produit parce que `useEffect` était appelé dans `renderNavNode`, une fonction utilisée dans une boucle (`.map()`).

**Règle React** : Les hooks ne peuvent pas être appelés dans des fonctions qui ne sont pas des composants React ou des hooks personnalisés.

## ✅ Solution

### Avant (INCORRECT) :
```typescript
const renderNavNode = (node: AlerteNavItem, level: number = 0): React.ReactNode => {
  // ...
  
  // ❌ ERREUR : useEffect appelé dans une fonction de rendu
  React.useEffect(() => {
    if (isActive && hasChildren && !isExpanded) {
      setExpandedNodes((prev) => new Set(prev).add(node.id));
    }
  }, [isActive, hasChildren, isExpanded, node.id]);
  
  return <div>...</div>;
};

// Utilisé dans une boucle
{alertesNavigationConfig.map((node) => renderNavNode(node, 0))}
```

### Après (CORRECT) :
```typescript
// ✅ Composant React séparé qui peut utiliser des hooks
const NavNode = React.memo(function NavNode({
  node,
  level,
  isActive,
  isExpanded,
  hasChildren,
  // ... autres props
}: NavNodeProps) {
  // ✅ OK : useEffect dans un composant React
  React.useEffect(() => {
    if (isActive && hasChildren && !isExpanded) {
      onToggle();
    }
  }, [isActive, hasChildren, isExpanded]);
  
  return <div>...</div>;
});

const renderNavNode = (node: AlerteNavItem, level: number = 0): React.ReactNode => {
  // Calculer les props
  const isActive = isNodeActive(node);
  const isExpanded = expandedNodes.has(node.id);
  // ...
  
  // ✅ Retourner un composant React
  return (
    <NavNode
      key={node.id}
      node={node}
      level={level}
      isActive={isActive}
      // ... autres props
    />
  );
};

// Utilisé dans une boucle - maintenant OK car NavNode est un composant React
{alertesNavigationConfig.map((node) => renderNavNode(node, 0))}
```

## 🔧 Corrections effectuées

1. **Création du composant `NavNode`** :
   - Composant React séparé qui peut utiliser des hooks
   - Mémorisé avec `React.memo` pour optimiser les performances
   - Reçoit toutes les props nécessaires

2. **Stabilisation des callbacks** :
   - `toggleNode` mémorisé avec `useCallback`
   - Handlers créés avec `useCallback` pour éviter les re-renders

3. **Gestion des dépendances** :
   - `useEffect` avec dépendances correctes
   - Évite les re-renders infinis

## 📋 Structure finale

```
AlertesSidebar (composant principal)
├── useState (expandedNodes)
├── useCallback (toggleNode)
├── NavNode (composant enfant)
│   ├── useEffect (auto-expand)
│   └── Render JSX
└── renderNavNode (fonction helper)
    └── Retourne <NavNode />
```

## ✅ Résultat

- ✅ Plus d'erreur "Change in the order of Hooks"
- ✅ Hooks appelés correctement dans un composant React
- ✅ Performance optimisée avec `React.memo`
- ✅ Callbacks stabilisés avec `useCallback`

## 🎯 Règles importantes

1. **Les hooks doivent être appelés** :
   - Dans un composant React (fonction ou classe)
   - Dans un hook personnalisé
   - ❌ PAS dans une fonction de rendu utilisée dans une boucle

2. **Pour utiliser des hooks dans une boucle** :
   - Créer un composant React séparé
   - Utiliser ce composant dans la boucle
   - Passer les props nécessaires

3. **Optimisation** :
   - Utiliser `React.memo` pour éviter les re-renders inutiles
   - Utiliser `useCallback` pour stabiliser les callbacks

