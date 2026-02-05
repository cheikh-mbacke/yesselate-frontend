# Base de données - Module Alertes & Risques

## 📋 Structure

```
database/
├── schema.sql                    # Schéma complet avec toutes les tables
├── migrations/
│   └── 001_initial_schema.sql    # Migration initiale
└── README.md                     # Documentation
```

## 🚀 Installation

### 1. Créer la base de données

```sql
CREATE DATABASE alertes_risques;
\c alertes_risques
```

### 2. Exécuter le schéma

```bash
psql -U postgres -d alertes_risques -f schema.sql
```

Ou via la migration :

```bash
psql -U postgres -d alertes_risques -f migrations/001_initial_schema.sql
```

## 📊 Tables principales

### Tables de référence
- `alert_types` : Typologies d'alertes (Critique, Avertissement, SLA, etc.)
- `alert_statuses` : Statuts possibles (En cours, Acquittée, Résolue, etc.)
- `alert_rules` : Règles de déclenchement (seuils, délais, SLA)
- `offices` : Bureaux / entités
- `users` : Utilisateurs / responsables
- `projects` : Projets
- `documents` : Documents liés (BC, Factures, Justificatifs)

### Table centrale
- `alerts` : Table principale des alertes

### Tables d'historique
- `alert_status_history` : Journal des changements de statut
- `alert_followups` : Suivis, commentaires et escalades
- `alert_rule_executions` : Log des exécutions de règles
- `alert_audit_log` : Log d'audit général

## 🔍 Vues disponibles

- `v_alerts_active` : Alertes actives avec tous les détails
- `v_alerts_stats_by_type` : Statistiques par type d'alerte
- `v_alerts_stats_by_office` : Statistiques par bureau

## ⚡ Fonctions utiles

- `fn_avg_resolution_time_hours()` : Temps de résolution moyen
- `fn_count_alerts_by_severity()` : Compte par niveau de sévérité

## 📈 Index

Le schéma inclut des index optimisés pour :
- Recherche par type, statut, bureau, responsable, projet
- Recherche textuelle (GIN)
- Recherche dans les métadonnées JSONB
- Filtrage par dates et SLA

## 🔐 Sécurité

Les permissions doivent être configurées selon votre politique de sécurité :

```sql
-- Exemple : Rôle utilisateur standard
CREATE ROLE alertes_user;
GRANT SELECT, INSERT, UPDATE ON alerts TO alertes_user;
GRANT SELECT ON alert_types, alert_statuses, offices, users, projects TO alertes_user;

-- Exemple : Rôle administrateur
CREATE ROLE alertes_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO alertes_admin;
```

## 🔄 Triggers automatiques

- **updated_at** : Mise à jour automatique de `updated_at` sur toutes les tables
- **status_history** : Enregistrement automatique des changements de statut dans `alert_status_history`

## 📝 Exemples de requêtes

### Alertes critiques en cours
```sql
SELECT * FROM v_alerts_active
WHERE alert_type_code = 'CRITIQUE'
ORDER BY occurred_at DESC;
```

### Statistiques par bureau
```sql
SELECT * FROM v_alerts_stats_by_office
ORDER BY critical_count DESC;
```

### Temps de résolution moyen
```sql
SELECT fn_avg_resolution_time_hours(
    p_alert_type_id => 1,
    p_date_from => NOW() - INTERVAL '30 days'
);
```

## 🎯 Caractéristiques

- ✅ Normalisé (3NF)
- ✅ Extensible (JSONB pour métadonnées)
- ✅ Traçable (historique complet)
- ✅ Performant (index optimisés)
- ✅ Audit complet (log de toutes les actions)
- ✅ Prêt pour PostgreSQL 12+

## 🔧 Maintenance

### Vérifier l'intégrité
```sql
-- Vérifier les contraintes
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'alerts'::regclass;
```

### Analyser les performances
```sql
-- Analyser les tables
ANALYZE alerts;
ANALYZE alert_status_history;
```

### Nettoyer les anciennes données (exemple)
```sql
-- Supprimer les logs d'audit de plus de 1 an
DELETE FROM alert_audit_log 
WHERE changed_at < NOW() - INTERVAL '1 year';
```

