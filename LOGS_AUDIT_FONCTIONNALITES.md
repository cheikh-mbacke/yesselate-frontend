# Audit Fonctionnalités Logs - Manquantes

## 🔍 État Actuel

### ✅ Ce qui existe déjà
1. **Store** (`logsCommandCenterStore.ts`) - ✅ Complet
2. **Sidebar** (`LogsCommandSidebar.tsx`) - ✅ Complet
3. **SubNavigation** (`LogsSubNavigation.tsx`) - ✅ Complet
4. **KPIBar** (`LogsKPIBar.tsx`) - ✅ Complet (mais appelle `openDetailPanel` qui n'existe pas)
5. **ActionsMenu** (`ActionsMenu.tsx`) - ✅ Complet
6. **ContentRouter** (`LogsContentRouter.tsx`) - ⚠️ Basique (utilise l'ancien workspace)
7. **Page principale** - ⚠️ Utilise encore les anciennes modals

### ❌ Ce qui manque

#### 1. **LogsDetailPanel** (Panneau latéral)
- **Status**: ❌ N'existe pas
- **Besoin**: Panneau latéral pour vue rapide des détails de logs
- **Pattern**: Comme `AnalyticsDetailPanel`
- **Usage**: Clic sur un KPI → Panneau latéral → Bouton "Voir plus" → Modal complète

#### 2. **LogsModals** (Router de modals)
- **Status**: ⚠️ Existe mais template générique, pas intégré au store
- **Besoin**: Router de modals qui utilise `useLogsCommandCenterStore`
- **Pattern**: Comme `AnalyticsModals`
- **Modals nécessaires**:
  - `stats` → LogsStatsModal ✅ (existe mais pas intégré)
  - `export` → LogsExportModal ❌ (template générique seulement)
  - `log-detail` → LogDetailModal ❌ (n'existe pas)
  - `filters` → LogsFiltersPanel ❌ (n'existe pas)
  - `settings` → LogsSettingsModal ❌ (template générique seulement)
  - `shortcuts` → LogsShortcutsModal ❌ (template générique seulement)
  - `help` → LogsHelpModal ❌ (n'existe pas)

#### 3. **LogDetailModal** (Modal overlay pour détails de logs)
- **Status**: ❌ N'existe pas
- **Besoin**: Modal overlay complète pour voir un log en détail
- **Pattern**: Comme `SubstitutionDetailModal`, `DelegationDetailModal`
- **Caractéristiques**:
  - Overlay fullscreen avec backdrop blur
  - Tabs: Détails, Métadonnées, Contexte, Historique
  - Actions: Export, Archive, Marquer comme résolu
  - Navigation prev/next

#### 4. **LogsFiltersPanel** (Panneau de filtres)
- **Status**: ❌ N'existe pas
- **Besoin**: Panneau de filtres avancés
- **Pattern**: Comme `AnalyticsFiltersPanel`
- **Filtres**:
  - Date range
  - Levels (error, warning, info, debug)
  - Sources (system, api, database, auth, business)
  - Modules
  - Recherche texte

#### 5. **LogsExportModal** (Modal d'export)
- **Status**: ⚠️ Template générique seulement
- **Besoin**: Modal d'export spécifique aux logs
- **Formats**: CSV, JSON, TXT, PDF
- **Options**: Filtres appliqués, Date range, Format

#### 6. **LogsSettingsModal** (Paramètres)
- **Status**: ⚠️ Template générique seulement
- **Besoin**: Paramètres de la page logs
- **Options**: 
  - Refresh interval
  - Auto-refresh
  - Affichage KPIs
  - Notifications

#### 7. **NotificationsPanel** (Panneau de notifications)
- **Status**: ⚠️ Utilise LogsDirectionPanel comme placeholder
- **Besoin**: Panneau latéral dédié aux notifications
- **Pattern**: Comme dans Analytics page
- **Fonctionnalités**:
  - Liste des notifications récentes
  - Filtres par type
  - Marquer comme lu/non-lu

#### 8. **API Services** (Mocks nécessaires)
- **Status**: ⚠️ Existe (`logsApiService`) mais basique
- **APIs manquantes**:
  - `getLogById(id: string)` → LogEntry détaillé
  - `getLogContext(id: string)` → Contexte du log (logs précédents/suivants)
  - `getLogHistory(id: string)` → Historique des actions sur ce log
  - `exportLogs(filters, format)` → Export des logs
  - `markLogAsRead(id: string)` → Marquer comme lu
  - `archiveLog(id: string)` → Archiver un log
  - `getNotifications()` → Notifications de logs

#### 9. **LogsContentRouter** (Router de contenu par catégorie)
- **Status**: ⚠️ Basique (utilise l'ancien workspace)
- **Besoin**: Vues spécifiques par catégorie
- **Catégories à implémenter**:
  - `overview` → Vue d'ensemble avec graphiques
  - `errors` → Liste des erreurs avec filtres
  - `warnings` → Liste des warnings
  - `system` → Logs système
  - `api` → Logs API
  - `security` → Logs sécurité
  - `audit` → Logs audit
  - `user-actions` → Actions utilisateur
  - `analysis` → Analyse des logs

#### 10. **Batch Actions** (Actions groupées)
- **Status**: ❌ N'existe pas
- **Besoin**: Barre d'actions pour sélection multiple
- **Actions**: Export, Archive, Marquer comme lu, Supprimer

## 📋 Priorités

### 🔴 Critique (Bloquant UX)
1. **LogsDetailPanel** - Nécessaire pour les KPIs cliquables
2. **LogsModals** (router) - Nécessaire pour toutes les modals
3. **LogDetailModal** - Nécessaire pour voir les détails

### 🟠 Important (UX complète)
4. **LogsFiltersPanel** - Filtres avancés
5. **LogsExportModal** - Export fonctionnel
6. **NotificationsPanel** - Notifications dédiées

### 🟡 Optionnel (Nice to have)
7. **LogsSettingsModal** - Paramètres
8. **LogsContentRouter** vues spécifiques - Vues par catégorie
9. **Batch Actions** - Actions groupées

## 🔧 Prochaines Étapes

1. Créer `LogsDetailPanel.tsx`
2. Créer `LogsModals.tsx` (router utilisant le store)
3. Créer `LogDetailModal.tsx` (modal overlay)
4. Créer `LogsFiltersPanel.tsx`
5. Créer `LogsExportModal.tsx` (spécifique aux logs)
6. Créer `NotificationsPanel.tsx` (dédié aux logs)
7. Intégrer tout dans la page principale
8. Ajouter les APIs manquantes (mocks)
9. Créer les vues spécifiques par catégorie dans `LogsContentRouter`

