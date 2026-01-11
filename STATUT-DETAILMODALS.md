# 📊 STATUT DES DETAILMODALS

**Date**: 10 janvier 2026

---

## ✅ DETAILMODALS EXISTANTS

1. ✅ **EventDetailModal** (Calendrier)
   - Fichier: `app/(portals)/maitre-ouvrage/calendrier/EventDetailModal.tsx`
   - Utilise: GenericDetailModal ✅
   - Navigation: prev/next ✅
   - Tabs: Infos, Participants, Documents, Historique ✅
   - Status: COMPLET

2. ⚠️ **ContratDetailModal** (Validation Contrats)
   - Fichier: `src/components/features/bmo/validation-contrats/modals/ContratDetailModal.tsx`
   - Utilise: Dialog (pas GenericDetailModal) ⚠️
   - Navigation: prev/next props mais pas implémenté ⚠️
   - Tabs: Détails, Clauses, Documents, Workflow, Commentaires, Historique ✅
   - Status: À AMÉLIORER (utiliser GenericDetailModal)

---

## ❌ DETAILMODALS MANQUANTS

1. ❌ **BlockedDossierDetailModal** (Dossiers Bloqués)
   - Status: N'existe pas
   - Besoin: Créer avec GenericDetailModal
   - Tabs: Détails, Cause, Actions, Historique, Documents, Résolution

2. ❌ **AlertDetailModal** (Alertes)
   - Status: N'existe pas
   - Besoin: Créer avec GenericDetailModal
   - Tabs: Détails, Actions, Historique, Documents

3. ❌ **EmployeeDetailModal** (Employés)
   - Status: N'existe pas
   - Besoin: Créer avec GenericDetailModal
   - Tabs: Infos, Contrats, Performance, Historique, Documents

4. ❌ **PaiementDetailModal** (Validation Paiements)
   - Status: À vérifier (PaiementDetailsModal existe ?)
   - Besoin: Améliorer avec GenericDetailModal si existe
   - Tabs: Détails, Validation, Historique, Documents, Justificatifs

5. ❌ **ArbitrageDetailModal** (Arbitrages Vivants)
   - Status: N'existe pas
   - Besoin: Créer avec GenericDetailModal
   - Tabs: Détails, Conflit, Résolution, Historique, Documents

6. ⚠️ **ProjetDetailModal** (Projets en Cours)
   - Status: À vérifier (GenericDetailModal utilisé ?)
   - Besoin: Vérifier complétude
   - Tabs: Détails, Tâches, Budget, Équipe, Documents, Historique

---

## 🎯 PLAN D'ACTION

### Phase 1: Créer les modals manquants (5 modals)
1. BlockedDossierDetailModal
2. AlertDetailModal
3. EmployeeDetailModal
4. PaiementDetailModal (créer ou améliorer)
5. ArbitrageDetailModal

### Phase 2: Améliorer les modals existants (2 modals)
1. ContratDetailModal (utiliser GenericDetailModal)
2. ProjetDetailModal (vérifier complétude)

---

## ✅ PROGRESSION

- ✅ Existe et complet: 1/8 (EventDetailModal)
- ⚠️ Existe mais à améliorer: 2/8 (ContratDetailModal, ProjetDetailModal)
- ❌ Manquants: 5/8

**Total**: 1 complet, 2 à améliorer, 5 à créer

