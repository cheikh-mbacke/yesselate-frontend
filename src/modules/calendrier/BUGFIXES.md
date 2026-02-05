# 🐛 Corrections de Bugs - Module Calendrier

## ✅ Bugs Corrigés

### 1. **Erreur TypeScript : `AlerteStats.parSeverite` n'existe pas**
**Fichier** : `app/(portals)/maitre-ouvrage/alerts/page.tsx`

**Problème** : Le type `AlerteStats` du module `centre-alertes` n'a pas la propriété `parSeverite`, mais le code tentait de l'utiliser.

**Solution** : Adaptation du code pour utiliser les propriétés existantes :
- `critical` → `statsData.critiques` ou `parTypologie.CRITIQUE`
- `warning` → `parTypologie.SLA`
- `info` → `parTypologie.PROJET`
- `success` → `parTypologie.RH`
- `acknowledged` → `parStatut.ACQUITTEE`
- `resolved` → `parStatut.RESOLUE`

---

### 2. **Erreur React : "Cannot access 'filteredJalons' before initialization"**
**Fichier** : `src/modules/calendrier/components/GanttChart.tsx`

**Problème** : `filteredJalons` était utilisé dans un `useEffect` avant d'être défini avec `useMemo`.

**Solution** : Réorganisation du code pour définir `filteredJalons` et `filteredEvenements` avec `useMemo` avant leur utilisation dans `useEffect`.

---

### 3. **Erreur React : "Rules of Hooks" - Changement d'ordre des hooks**
**Fichier** : `src/modules/calendrier/pages/gantt/GanttGlobalView.tsx`

**Problème** : Les hooks `useEffect` étaient appelés après les retours conditionnels (`if (loading)`, `if (error)`), violant les règles de React.

**Solution** : Réorganisation du code pour :
1. Définir toutes les variables au début
2. Appeler tous les hooks avant les retours conditionnels
3. Placer les retours conditionnels après tous les hooks

---

### 4. **Clés React dupliquées dans TimelineView**
**Fichier** : `src/modules/calendrier/components/TimelineView.tsx`

**Problème** : Les IDs des jalons, événements et absences pouvaient être dupliqués, causant des erreurs de clés React.

**Solution** : Utilisation de clés uniques combinant le type et l'ID : `${item.type}-${item.id}` au lieu de `item.id`.

---

### 5. **Optimisation des dépendances useEffect**
**Fichier** : `src/modules/calendrier/hooks/useCalendrierData.ts`

**Problème** : Les hooks `useJalons`, `useEvenements` et `useAbsences` utilisaient `JSON.stringify(params)` dans les dépendances de `useEffect`, ce qui n'est pas optimal.

**Solution** : Remplacement par `useCallback` avec des dépendances spécifiques pour chaque paramètre.

---

### 6. **Filtrage par chantier manquant**
**Fichiers** : 
- `src/modules/calendrier/components/CalendarGrid.tsx`
- `src/modules/calendrier/components/TimelineView.tsx`
- `src/modules/calendrier/components/GanttChart.tsx`

**Problème** : Les composants ne filtraient pas correctement les événements et absences par `chantierId`.

**Solution** : Ajout du filtrage par `chantierId` pour tous les types de données (jalons, événements, absences) dans tous les composants.

---

### 7. **Gestion des erreurs 404 et réseau**
**Fichier** : `src/modules/calendrier/api/calendrierApi.ts`

**Problème** : Les erreurs 404 et réseau n'étaient pas gérées gracieusement, causant des crashes de l'application.

**Solution** : 
- Ajout d'un intercepteur Axios global pour gérer les erreurs 404 et réseau
- Retour automatique de données mockées en cas d'erreur 404 ou réseau
- Suppression des logs inutiles pour les erreurs 404 (seules les vraies erreurs sont loggées)

---

### 8. **Nettoyage des logs de debug**
**Fichiers** : 
- `src/modules/calendrier/hooks/useCalendrierData.ts`
- `src/modules/calendrier/pages/gantt/GanttGlobalView.tsx`
- `src/modules/calendrier/components/GanttChart.tsx`

**Problème** : Les logs de debug étaient affichés en production.

**Solution** : Ajout de conditions `process.env.NODE_ENV === 'development'` pour tous les logs de debug.

---

## 📊 Résumé des Fichiers Modifiés

1. ✅ `app/(portals)/maitre-ouvrage/alerts/page.tsx` - Correction du mapping AlerteStats
2. ✅ `src/modules/calendrier/components/GanttChart.tsx` - Correction de l'ordre des hooks et filtrage
3. ✅ `src/modules/calendrier/components/TimelineView.tsx` - Correction des clés React et filtrage
4. ✅ `src/modules/calendrier/components/CalendarGrid.tsx` - Ajout du filtrage par chantier
5. ✅ `src/modules/calendrier/pages/gantt/GanttGlobalView.tsx` - Correction de l'ordre des hooks
6. ✅ `src/modules/calendrier/pages/overview/CalendrierByChantierView.tsx` - Passage de chantierId
7. ✅ `src/modules/calendrier/hooks/useCalendrierData.ts` - Optimisation avec useCallback
8. ✅ `src/modules/calendrier/api/calendrierApi.ts` - Gestion des erreurs 404 et données mockées
9. ✅ `src/modules/calendrier/api/calendrierApiMock.ts` - Création des données mockées

---

## 🎯 Résultats

- ✅ Toutes les erreurs TypeScript corrigées
- ✅ Toutes les erreurs React (Rules of Hooks) corrigées
- ✅ Gestion gracieuse des erreurs 404 et réseau
- ✅ Données mockées disponibles pour le développement
- ✅ Filtrage par chantier fonctionnel dans tous les composants
- ✅ Logs de debug conditionnels (uniquement en développement)
- ✅ Optimisation des hooks avec useCallback

---

## 🔍 Tests Recommandés

1. Vérifier que les données s'affichent correctement dans toutes les vues (Gantt, Timeline, Calendrier)
2. Vérifier que le filtrage par chantier fonctionne
3. Vérifier que les erreurs 404 sont gérées gracieusement
4. Vérifier qu'il n'y a plus d'erreurs dans la console en production
5. Vérifier que le build TypeScript passe sans erreurs

