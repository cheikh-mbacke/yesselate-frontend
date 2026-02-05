# 📋 Alignement avec le Schéma SQL

Ce document décrit l'alignement du module Calendrier & Planification v3.0 avec le schéma de base de données PostgreSQL.

## ✅ Tables Supportées

### 1. `chantiers`
- ✅ `id` (number)
- ✅ `code` (string)
- ✅ `nom` (string)
- ✅ `description` (string | null)
- ✅ `date_debut` (DATE → string | null)
- ✅ `date_fin` (DATE → string | null)
- ✅ `budget` (NUMERIC(18,2) → number | null)
- ✅ `created_at` (TIMESTAMP → string)

### 2. `jalons`
- ✅ `id` (number)
- ✅ `chantier_id` (INTEGER → number | null)
- ✅ `libelle` (string)
- ✅ `type` ('SLA' | 'CONTRAT' | 'INTERNE' | null)
- ✅ `date_debut` (DATE → string | null)
- ✅ `date_fin` (DATE → string | null)
- ✅ `est_retard` (BOOLEAN → boolean)
- ✅ `est_sla_risque` (BOOLEAN → boolean)
- ✅ `statut` ('À venir' | 'En cours' | 'Terminé' | null)
- ✅ `created_at` (TIMESTAMP → string)

### 3. `evenements`
- ✅ `id` (number)
- ✅ `type` ('EVENEMENT' | 'REUNION_PROJET' | 'REUNION_DECISIONNELLE' | null)
- ✅ `titre` (string | null)
- ✅ `description` (TEXT → string | null)
- ✅ `date_debut` (TIMESTAMP → string | null)
- ✅ `date_fin` (TIMESTAMP → string | null)
- ✅ `chantier_id` (INTEGER → number | null)
- ✅ `created_at` (TIMESTAMP → string)

### 4. `absences`
- ✅ `id` (number)
- ✅ `user_id` (INTEGER → number)
- ✅ `chantier_id` (INTEGER → number | null)
- ✅ `type` ('CONGÉ' | 'MISSION' | 'ABSENCE' | null)
- ✅ `date_debut` (DATE → string | null)
- ✅ `date_fin` (DATE → string | null)
- ✅ `motif` (TEXT → string | null)
- ✅ `created_at` (TIMESTAMP → string)

**Champs calculés/joins (non dans la table) :**
- `employe_nom` (string) - À récupérer via JOIN avec `users`
- `equipe_id` (number | null) - À récupérer via JOIN avec `users`
- `statut` ('DEMANDE' | 'VALIDE' | 'REFUSE') - À gérer côté backend

### 5. `affectations`
- ✅ `id` (number)
- ✅ `user_id` (INTEGER → number)
- ✅ `chantier_id` (INTEGER → number)
- ✅ `role` (VARCHAR(100) → string | null)
- ✅ `date_debut` (DATE → string | null)
- ✅ `date_fin` (DATE → string | null)
- ✅ `est_suralloue` (BOOLEAN → boolean)
- ✅ `created_at` (TIMESTAMP → string)

**Champs calculés/joins :**
- `user_nom` (string) - À récupérer via JOIN
- `chantier_nom` (string) - À récupérer via JOIN

### 6. `calendrier_sync`
- ✅ `id` (number)
- ✅ `module` ('DEMANDES' | 'VALIDATIONS' | 'PROJETS' | 'RH')
- ✅ `statut` ('OK' | 'WARNING' | 'ERROR')
- ✅ `derniere_sync` (TIMESTAMP → string)
- ✅ `created_at` (TIMESTAMP → string)

### 7. `calendrier_alertes`
- ✅ `id` (number)
- ✅ `type` ('SLA_RISQUE' | 'RETARD' | 'SURALLOCATION')
- ✅ `jalon_id` (INTEGER → number | null)
- ✅ `chantier_id` (INTEGER → number | null)
- ✅ `user_id` (INTEGER → number | null)
- ✅ `date_declenchement` (TIMESTAMP → string)
- ✅ `est_resolue` (BOOLEAN → boolean)
- ✅ `resolue_at` (TIMESTAMP → string | null)
- ✅ `created_at` (TIMESTAMP → string)

**Champs calculés/joins :**
- `jalon_libelle` (string) - À récupérer via JOIN
- `chantier_nom` (string) - À récupérer via JOIN
- `user_nom` (string) - À récupérer via JOIN

## 🔄 Mapping API

Tous les appels API utilisent les noms de champs **snake_case** conformément au schéma SQL :

```typescript
// ✅ Correct
getJalons({ chantier_id: 1, est_retard: true })
getEvenements({ chantier_id: 1, date_debut: '2024-01-01' })
getAbsences({ user_id: 1, equipe_id: 2 })

// ❌ Incorrect (ne pas utiliser)
getJalons({ chantierId: 1, estEnRetard: true })
```

## 📝 Notes Importantes

1. **Types d'événements** : Le schéma SQL utilise `REUNION_PROJET` et `REUNION_DECISIONNELLE`, pas `REUNION` seul.

2. **Types d'absences** : Le schéma SQL utilise `CONGÉ` (avec accent), `MISSION`, et `ABSENCE`.

3. **Champs optionnels** : Tous les champs DATE/TIMESTAMP peuvent être `null` dans le schéma SQL, donc le code gère ces cas.

4. **Champs calculés** : Certains champs comme `employe_nom` ne sont pas dans la table `absences` mais doivent être récupérés via JOIN côté backend.

5. **Statut des absences** : Le champ `statut` n'existe pas dans le schéma SQL de la table `absences`. Il doit être géré côté backend ou ajouté au schéma si nécessaire.

## 🚀 Endpoints API Attendus

Le module attend les endpoints suivants (base: `/api/calendrier`) :

- `GET /overview` - Vue d'ensemble avec stats
- `GET /jalons` - Liste des jalons (avec filtres)
- `GET /jalons/a-venir` - Jalons à venir (J-7, J+30)
- `GET /evenements` - Liste des événements
- `GET /absences` - Liste des absences
- `GET /affectations` - Liste des affectations
- `GET /sync-status` - Statut de synchronisation
- `GET /alertes` - Liste des alertes

Tous les endpoints acceptent des paramètres de filtrage en **snake_case**.

