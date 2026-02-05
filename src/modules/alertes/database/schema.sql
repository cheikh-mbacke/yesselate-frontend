-- ============================================================================
-- SCHÉMA SQL - MODULE ALERTES & RISQUES
-- ERP BMO/BTP - PostgreSQL
-- ============================================================================
-- 
-- Caractéristiques :
-- - Normalisé (3NF)
-- - Extensible
-- - Traçable (audit & historique complet)
-- - Optimisé pour PostgreSQL
-- 
-- Auteur : Module Alertes & Risques v1.0
-- Date : 2024
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Pour recherche textuelle optimisée

-- ============================================================================
-- TABLES DE RÉFÉRENCE
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Typologies d'alertes
-- ----------------------------------------------------------------------------
CREATE TABLE alert_types (
    id              SERIAL PRIMARY KEY,
    code            VARCHAR(50) UNIQUE NOT NULL,
    label           VARCHAR(100) NOT NULL,
    description     TEXT,
    severity_level  SMALLINT NOT NULL DEFAULT 1 CHECK (severity_level BETWEEN 1 AND 5),
    icon            VARCHAR(50),                    -- Nom de l'icône Lucide
    color           VARCHAR(20),                    -- Couleur UI (ex: 'red', 'amber')
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    display_order   SMALLINT DEFAULT 0,            -- Ordre d'affichage
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by_id   INTEGER,                        -- Référence users
    updated_by_id    INTEGER                         -- Référence users
);

COMMENT ON TABLE alert_types IS 'Typologies d''alertes (Critique, Avertissement, SLA, Blocage, Info)';
COMMENT ON COLUMN alert_types.severity_level IS 'Niveau de sévérité de 1 (info) à 5 (critique)';
COMMENT ON COLUMN alert_types.display_order IS 'Ordre d''affichage dans l''interface';

-- ----------------------------------------------------------------------------
-- 2. Statuts d'alertes
-- ----------------------------------------------------------------------------
CREATE TABLE alert_statuses (
    id              SERIAL PRIMARY KEY,
    code            VARCHAR(50) UNIQUE NOT NULL,
    label           VARCHAR(100) NOT NULL,
    description     TEXT,
    is_final        BOOLEAN NOT NULL DEFAULT FALSE, -- Statut final (résolu, ignoré)
    display_order   SMALLINT DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE alert_statuses IS 'Statuts possibles d''une alerte (EN_COURS, ACQUITTEE, RESOLUE, ESCALADEE, IGNOREE)';
COMMENT ON COLUMN alert_statuses.is_final IS 'Indique si le statut est final (pas de transition possible)';

-- ----------------------------------------------------------------------------
-- 3. Règles d'alerte (gouvernance)
-- ----------------------------------------------------------------------------
CREATE TABLE alert_rules (
    id                  SERIAL PRIMARY KEY,
    code                VARCHAR(100) UNIQUE NOT NULL,
    label               VARCHAR(200) NOT NULL,
    description         TEXT,
    alert_type_id       INTEGER NOT NULL REFERENCES alert_types(id) ON DELETE RESTRICT,
    
    -- Seuils financiers
    threshold_amount_min NUMERIC(18,2),
    threshold_amount_max NUMERIC(18,2),
    threshold_currency  VARCHAR(10) DEFAULT 'XOF',
    threshold_condition VARCHAR(20) CHECK (threshold_condition IN ('superieur', 'inferieur', 'egal', 'entre')),
    
    -- Seuils temporels
    threshold_delay_hours INTEGER,              -- Délai en heures
    threshold_delay_days   INTEGER,              -- Délai en jours
    
    -- SLA
    is_sla_related      BOOLEAN NOT NULL DEFAULT FALSE,
    sla_type            VARCHAR(50),            -- 'validation-bc', 'engagement-budgetaire', 'paiement-fournisseur'
    sla_delay_hours     INTEGER,                -- Délai SLA en heures
    
    -- Conditions supplémentaires
    applies_to_offices  INTEGER[],              -- Array d'IDs de bureaux (NULL = tous)
    applies_to_projects INTEGER[],              -- Array d'IDs de projets (NULL = tous)
    applies_to_doc_types VARCHAR(50)[],         -- Array de types de documents
    
    -- Configuration
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    priority            SMALLINT DEFAULT 0,     -- Priorité d'exécution
    execution_schedule  VARCHAR(50),            -- 'realtime', 'hourly', 'daily'
    
    -- Métadonnées
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by_id       INTEGER,
    updated_by_id        INTEGER,
    
    -- Contraintes
    CONSTRAINT chk_threshold CHECK (
        (threshold_amount_min IS NOT NULL OR threshold_amount_max IS NOT NULL OR 
         threshold_delay_hours IS NOT NULL OR threshold_delay_days IS NOT NULL)
    )
);

COMMENT ON TABLE alert_rules IS 'Règles de déclenchement d''alertes (seuils financiers, délais, SLA)';
COMMENT ON COLUMN alert_rules.applies_to_offices IS 'Liste des bureaux concernés (NULL = tous)';
COMMENT ON COLUMN alert_rules.applies_to_projects IS 'Liste des projets concernés (NULL = tous)';

-- ----------------------------------------------------------------------------
-- 4. Bureaux / Entités
-- ----------------------------------------------------------------------------
CREATE TABLE offices (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(50) UNIQUE NOT NULL,
    label       VARCHAR(150) NOT NULL,
    description TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE offices IS 'Bureaux / entités organisationnelles (BTP, BJ, BS, etc.)';

-- ----------------------------------------------------------------------------
-- 5. Utilisateurs / Responsables
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    matricule       VARCHAR(50) UNIQUE,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(200),
    phone           VARCHAR(50),
    role            VARCHAR(100),
    office_id       INTEGER REFERENCES offices(id),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE users IS 'Utilisateurs / responsables (référence au SI global)';
COMMENT ON COLUMN users.office_id IS 'Bureau d''affectation';

-- ----------------------------------------------------------------------------
-- 6. Projets
-- ----------------------------------------------------------------------------
CREATE TABLE projects (
    id              SERIAL PRIMARY KEY,
    code            VARCHAR(100) UNIQUE NOT NULL,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    budget_total    NUMERIC(18,2),
    currency        VARCHAR(10) DEFAULT 'XOF',
    start_date      DATE,
    end_date        DATE,
    office_id       INTEGER REFERENCES offices(id),
    project_manager_id INTEGER REFERENCES users(id),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

COMMENT ON TABLE projects IS 'Projets (référence au module Projets & Clients / BTP)';

-- ----------------------------------------------------------------------------
-- 7. Documents liés
-- ----------------------------------------------------------------------------
CREATE TABLE documents (
    id              SERIAL PRIMARY KEY,
    code            VARCHAR(100) UNIQUE NOT NULL,
    label           VARCHAR(255),
    doc_type        VARCHAR(50) NOT NULL,      -- 'BC', 'FACTURE', 'JUSTIFICATIF', 'CONTRAT'
    amount          NUMERIC(18,2),
    currency        VARCHAR(10) DEFAULT 'XOF',
    project_id      INTEGER REFERENCES projects(id),
    office_id       INTEGER REFERENCES offices(id),
    created_by_id   INTEGER REFERENCES users(id),
    status          VARCHAR(50),                -- 'draft', 'pending', 'validated', 'paid', 'blocked'
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    validated_at    TIMESTAMP,
    paid_at         TIMESTAMP
);

COMMENT ON TABLE documents IS 'Documents liés aux alertes (BC, Factures, Justificatifs)';
COMMENT ON COLUMN documents.status IS 'Statut du document dans le workflow';

-- ============================================================================
-- TABLE CENTRALE : ALERTES
-- ============================================================================

CREATE TABLE alerts (
    id                  SERIAL PRIMARY KEY,
    
    -- Identification
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    
    -- Classification
    alert_type_id       INTEGER NOT NULL REFERENCES alert_types(id) ON DELETE RESTRICT,
    alert_status_id     INTEGER NOT NULL REFERENCES alert_statuses(id) ON DELETE RESTRICT,
    alert_rule_id       INTEGER REFERENCES alert_rules(id) ON DELETE SET NULL,
    
    -- Contexte métier
    office_id           INTEGER REFERENCES offices(id) ON DELETE SET NULL,
    responsible_id      INTEGER REFERENCES users(id) ON DELETE SET NULL,
    project_id          INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    document_id         INTEGER REFERENCES documents(id) ON DELETE SET NULL,
    
    -- Données financières
    amount              NUMERIC(18,2),
    currency            VARCHAR(10) DEFAULT 'XOF',
    
    -- SLA
    is_sla_breached     BOOLEAN NOT NULL DEFAULT FALSE,
    sla_type            VARCHAR(50),            -- Type de SLA concerné
    sla_due_at          TIMESTAMP,              -- Date/heure limite théorique
    sla_delay_hours     INTEGER,                -- Délai SLA en heures
    
    -- Dates importantes
    occurred_at         TIMESTAMP NOT NULL,     -- Date de déclenchement
    acknowledged_at      TIMESTAMP,              -- Date d'acquittement
    acknowledged_by_id   INTEGER REFERENCES users(id),
    resolved_at         TIMESTAMP,              -- Date de résolution
    resolved_by_id       INTEGER REFERENCES users(id),
    resolution_type     VARCHAR(50),            -- 'manual', 'automatic', 'ai-assisted'
    
    -- Escalade
    escalation_level    SMALLINT DEFAULT 0,     -- 0 = none, 1 = N+1, 2 = N+2, etc.
    escalated_to_id     INTEGER REFERENCES users(id),
    escalated_at        TIMESTAMP,
    escalation_reason    TEXT,
    
    -- Récurrence
    is_recurring        BOOLEAN NOT NULL DEFAULT FALSE,
    recurring_pattern   VARCHAR(100),           -- Pattern de récurrence
    parent_alert_id     INTEGER REFERENCES alerts(id), -- Alerte parente si récurrente
    
    -- Métadonnées
    tags                VARCHAR(50)[],          -- Tags pour filtrage
    metadata            JSONB,                 -- Données additionnelles flexibles
    priority            SMALLINT DEFAULT 0,     -- Priorité calculée
    
    -- Audit
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by_id       INTEGER REFERENCES users(id),
    updated_by_id        INTEGER REFERENCES users(id),
    
    -- Contraintes
    CONSTRAINT chk_resolution CHECK (
        (resolved_at IS NULL AND resolved_by_id IS NULL) OR
        (resolved_at IS NOT NULL AND resolved_by_id IS NOT NULL)
    ),
    CONSTRAINT chk_acknowledgment CHECK (
        (acknowledged_at IS NULL AND acknowledged_by_id IS NULL) OR
        (acknowledged_at IS NOT NULL AND acknowledged_by_id IS NOT NULL)
    )
);

COMMENT ON TABLE alerts IS 'Table centrale des alertes';
COMMENT ON COLUMN alerts.metadata IS 'Données additionnelles au format JSON (extensible)';
COMMENT ON COLUMN alerts.tags IS 'Tags pour filtrage et recherche';
COMMENT ON COLUMN alerts.parent_alert_id IS 'Référence à l''alerte parente si récurrente';

-- ============================================================================
-- TABLES D'HISTORIQUE & TRAÇABILITÉ
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 8. Historique des statuts d'alerte
-- ----------------------------------------------------------------------------
CREATE TABLE alert_status_history (
    id              SERIAL PRIMARY KEY,
    alert_id        INTEGER NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    old_status_id   INTEGER REFERENCES alert_statuses(id),
    new_status_id   INTEGER NOT NULL REFERENCES alert_statuses(id),
    changed_by_id   INTEGER REFERENCES users(id),
    comment         TEXT,
    changed_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_status_change CHECK (old_status_id IS NULL OR old_status_id != new_status_id)
);

COMMENT ON TABLE alert_status_history IS 'Journal des changements de statut des alertes';

-- ----------------------------------------------------------------------------
-- 9. Suivis & escalades
-- ----------------------------------------------------------------------------
CREATE TABLE alert_followups (
    id              SERIAL PRIMARY KEY,
    alert_id        INTEGER NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    author_id       INTEGER REFERENCES users(id),
    note            TEXT NOT NULL,
    followup_type   VARCHAR(50) NOT NULL,      -- 'ESCALADE', 'COMMENTAIRE', 'RELANCE', 'RESOLUTION'
    is_internal     BOOLEAN NOT NULL DEFAULT FALSE, -- Note interne ou visible
    attachments     JSONB,                      -- Références aux fichiers joints
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_followup_type CHECK (
        followup_type IN ('ESCALADE', 'COMMENTAIRE', 'RELANCE', 'RESOLUTION', 'ACQUITTEMENT', 'AUTRE')
    )
);

COMMENT ON TABLE alert_followups IS 'Suivis, commentaires et escalades sur les alertes';
COMMENT ON COLUMN alert_followups.is_internal IS 'Note interne (non visible par tous)';

-- ----------------------------------------------------------------------------
-- 10. Log des exécutions de règles
-- ----------------------------------------------------------------------------
CREATE TABLE alert_rule_executions (
    id              SERIAL PRIMARY KEY,
    alert_rule_id   INTEGER NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
    executed_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    execution_type  VARCHAR(50) NOT NULL,       -- 'scheduled', 'manual', 'realtime'
    matched_count   INTEGER NOT NULL DEFAULT 0,
    alerts_created  INTEGER NOT NULL DEFAULT 0,
    duration_ms     INTEGER,
    status          VARCHAR(50) NOT NULL,       -- 'success', 'error', 'partial'
    error_message   TEXT,
    technical_log   JSONB,                     -- Log technique détaillé
    execution_params JSONB                      -- Paramètres d'exécution
);

COMMENT ON TABLE alert_rule_executions IS 'Log des exécutions de règles pour audit et tuning';
COMMENT ON COLUMN alert_rule_executions.technical_log IS 'Log technique au format JSON';

-- ----------------------------------------------------------------------------
-- 11. Table d'audit générale (optionnelle mais recommandée)
-- ----------------------------------------------------------------------------
CREATE TABLE alert_audit_log (
    id              SERIAL PRIMARY KEY,
    table_name      VARCHAR(100) NOT NULL,
    record_id       INTEGER NOT NULL,
    action          VARCHAR(20) NOT NULL,      -- 'INSERT', 'UPDATE', 'DELETE'
    old_values      JSONB,
    new_values      JSONB,
    changed_by_id   INTEGER REFERENCES users(id),
    changed_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    ip_address      INET,
    user_agent      TEXT
);

COMMENT ON TABLE alert_audit_log IS 'Log d''audit général pour toutes les tables du module';

-- ============================================================================
-- INDEX POUR PERFORMANCES
-- ============================================================================

-- Index sur alerts
CREATE INDEX idx_alerts_type_status ON alerts(alert_type_id, alert_status_id);
CREATE INDEX idx_alerts_status ON alerts(alert_status_id);
CREATE INDEX idx_alerts_office ON alerts(office_id) WHERE office_id IS NOT NULL;
CREATE INDEX idx_alerts_responsible ON alerts(responsible_id) WHERE responsible_id IS NOT NULL;
CREATE INDEX idx_alerts_project ON alerts(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_alerts_document ON alerts(document_id) WHERE document_id IS NOT NULL;
CREATE INDEX idx_alerts_occurred_at ON alerts(occurred_at);
CREATE INDEX idx_alerts_sla_due_at ON alerts(sla_due_at) WHERE sla_due_at IS NOT NULL;
CREATE INDEX idx_alerts_sla_breached ON alerts(is_sla_breached) WHERE is_sla_breached = TRUE;
CREATE INDEX idx_alerts_created_at ON alerts(created_at);
CREATE INDEX idx_alerts_resolved_at ON alerts(resolved_at) WHERE resolved_at IS NOT NULL;
CREATE INDEX idx_alerts_recurring ON alerts(is_recurring, parent_alert_id) WHERE is_recurring = TRUE;

-- Index GIN pour recherche textuelle et JSONB
CREATE INDEX idx_alerts_tags ON alerts USING GIN(tags);
CREATE INDEX idx_alerts_metadata ON alerts USING GIN(metadata);
CREATE INDEX idx_alerts_title_desc ON alerts USING GIN(to_tsvector('french', title || ' ' || COALESCE(description, '')));

-- Index sur alert_status_history
CREATE INDEX idx_status_history_alert ON alert_status_history(alert_id);
CREATE INDEX idx_status_history_changed_at ON alert_status_history(changed_at);

-- Index sur alert_followups
CREATE INDEX idx_followups_alert ON alert_followups(alert_id);
CREATE INDEX idx_followups_author ON alert_followups(author_id) WHERE author_id IS NOT NULL;
CREATE INDEX idx_followups_created_at ON alert_followups(created_at);

-- Index sur alert_rule_executions
CREATE INDEX idx_rule_exec_rule ON alert_rule_executions(alert_rule_id);
CREATE INDEX idx_rule_exec_executed_at ON alert_rule_executions(executed_at);
CREATE INDEX idx_rule_exec_status ON alert_rule_executions(status);

-- Index sur alert_audit_log
CREATE INDEX idx_audit_table_record ON alert_audit_log(table_name, record_id);
CREATE INDEX idx_audit_changed_at ON alert_audit_log(changed_at);
CREATE INDEX idx_audit_changed_by ON alert_audit_log(changed_by_id) WHERE changed_by_id IS NOT NULL;

-- ============================================================================
-- TRIGGERS POUR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Application des triggers
CREATE TRIGGER update_alert_types_updated_at BEFORE UPDATE ON alert_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_statuses_updated_at BEFORE UPDATE ON alert_statuses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_rules_updated_at BEFORE UPDATE ON alert_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offices_updated_at BEFORE UPDATE ON offices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TRIGGER POUR HISTORIQUE AUTOMATIQUE DES STATUTS
-- ============================================================================

CREATE OR REPLACE FUNCTION log_alert_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.alert_status_id IS DISTINCT FROM NEW.alert_status_id THEN
        INSERT INTO alert_status_history (
            alert_id,
            old_status_id,
            new_status_id,
            changed_by_id,
            changed_at
        ) VALUES (
            NEW.id,
            OLD.alert_status_id,
            NEW.alert_status_id,
            NEW.updated_by_id,
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_status_change AFTER UPDATE ON alerts
    FOR EACH ROW
    WHEN (OLD.alert_status_id IS DISTINCT FROM NEW.alert_status_id)
    EXECUTE FUNCTION log_alert_status_change();

-- ============================================================================
-- VUES UTILES
-- ============================================================================

-- Vue : Alertes actives avec détails
CREATE OR REPLACE VIEW v_alerts_active AS
SELECT
    a.id,
    a.title,
    a.description,
    a.occurred_at,
    a.amount,
    a.currency,
    a.is_sla_breached,
    a.sla_due_at,
    at.code AS alert_type_code,
    at.label AS alert_type_label,
    at.severity_level,
    as2.code AS status_code,
    as2.label AS status_label,
    o.code AS office_code,
    o.label AS office_label,
    u.first_name || ' ' || u.last_name AS responsible_name,
    p.code AS project_code,
    p.name AS project_name,
    d.code AS document_code,
    d.doc_type AS document_type
FROM alerts a
LEFT JOIN alert_types at ON a.alert_type_id = at.id
LEFT JOIN alert_statuses as2 ON a.alert_status_id = as2.id
LEFT JOIN offices o ON a.office_id = o.id
LEFT JOIN users u ON a.responsible_id = u.id
LEFT JOIN projects p ON a.project_id = p.id
LEFT JOIN documents d ON a.document_id = d.id
WHERE as2.is_final = FALSE
ORDER BY at.severity_level DESC, a.occurred_at DESC;

COMMENT ON VIEW v_alerts_active IS 'Vue des alertes actives (non finales) avec tous les détails';

-- Vue : Statistiques par type
CREATE OR REPLACE VIEW v_alerts_stats_by_type AS
SELECT
    at.id AS alert_type_id,
    at.code AS alert_type_code,
    at.label AS alert_type_label,
    COUNT(*) AS total_count,
    COUNT(*) FILTER (WHERE as2.code = 'EN_COURS') AS pending_count,
    COUNT(*) FILTER (WHERE as2.code = 'ACQUITTEE') AS acknowledged_count,
    COUNT(*) FILTER (WHERE as2.code = 'RESOLUE') AS resolved_count,
    COUNT(*) FILTER (WHERE a.is_sla_breached = TRUE) AS sla_breached_count,
    AVG(EXTRACT(EPOCH FROM (a.resolved_at - a.occurred_at)) / 3600) AS avg_resolution_hours
FROM alerts a
JOIN alert_types at ON a.alert_type_id = at.id
JOIN alert_statuses as2 ON a.alert_status_id = as2.id
GROUP BY at.id, at.code, at.label;

COMMENT ON VIEW v_alerts_stats_by_type IS 'Statistiques des alertes groupées par type';

-- Vue : Statistiques par bureau
CREATE OR REPLACE VIEW v_alerts_stats_by_office AS
SELECT
    o.id AS office_id,
    o.code AS office_code,
    o.label AS office_label,
    COUNT(*) AS total_count,
    COUNT(*) FILTER (WHERE at.severity_level >= 4) AS critical_count,
    COUNT(*) FILTER (WHERE a.is_sla_breached = TRUE) AS sla_breached_count,
    COUNT(*) FILTER (WHERE as2.code = 'RESOLUE') AS resolved_count
FROM alerts a
JOIN alert_types at ON a.alert_type_id = at.id
JOIN alert_statuses as2 ON a.alert_status_id = as2.id
LEFT JOIN offices o ON a.office_id = o.id
GROUP BY o.id, o.code, o.label;

COMMENT ON VIEW v_alerts_stats_by_office IS 'Statistiques des alertes groupées par bureau';

-- ============================================================================
-- FONCTIONS UTILES
-- ============================================================================

-- Fonction : Calculer le temps de résolution moyen
CREATE OR REPLACE FUNCTION fn_avg_resolution_time_hours(
    p_alert_type_id INTEGER DEFAULT NULL,
    p_office_id INTEGER DEFAULT NULL,
    p_date_from TIMESTAMP DEFAULT NULL,
    p_date_to TIMESTAMP DEFAULT NULL
)
RETURNS NUMERIC AS $$
DECLARE
    v_avg_hours NUMERIC;
BEGIN
    SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - occurred_at)) / 3600)
    INTO v_avg_hours
    FROM alerts
    WHERE resolved_at IS NOT NULL
        AND (p_alert_type_id IS NULL OR alert_type_id = p_alert_type_id)
        AND (p_office_id IS NULL OR office_id = p_office_id)
        AND (p_date_from IS NULL OR occurred_at >= p_date_from)
        AND (p_date_to IS NULL OR occurred_at <= p_date_to);
    
    RETURN COALESCE(v_avg_hours, 0);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_avg_resolution_time_hours IS 'Calcule le temps de résolution moyen en heures avec filtres optionnels';

-- Fonction : Compter les alertes par sévérité
CREATE OR REPLACE FUNCTION fn_count_alerts_by_severity(
    p_severity_level SMALLINT,
    p_status_code VARCHAR DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM alerts a
    JOIN alert_types at ON a.alert_type_id = at.id
    LEFT JOIN alert_statuses as2 ON a.alert_status_id = as2.id
    WHERE at.severity_level = p_severity_level
        AND (p_status_code IS NULL OR as2.code = p_status_code);
    
    RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_count_alerts_by_severity IS 'Compte les alertes par niveau de sévérité';

-- ============================================================================
-- DONNÉES INITIALES (SEED)
-- ============================================================================

-- Types d'alertes
INSERT INTO alert_types (code, label, description, severity_level, icon, color, display_order) VALUES
('CRITIQUE', 'Alerte critique', 'Alertes nécessitant une action immédiate', 5, 'AlertTriangle', 'red', 1),
('AVERTISSEMENT', 'Avertissement', 'Alertes nécessitant une attention', 3, 'AlertCircle', 'amber', 2),
('SLA', 'SLA dépassé', 'Délais SLA dépassés', 4, 'Clock', 'purple', 3),
('BLOCAGE', 'Blocage', 'Blocages opérationnels', 4, 'Ban', 'orange', 4),
('INFO', 'Information', 'Alertes informatives', 1, 'Info', 'blue', 5)
ON CONFLICT (code) DO NOTHING;

-- Statuts d'alertes
INSERT INTO alert_statuses (code, label, description, is_final, display_order) VALUES
('EN_COURS', 'En cours', 'Alerte en cours de traitement', FALSE, 1),
('ACQUITTEE', 'Acquittée', 'Alerte acquittée par le responsable', FALSE, 2),
('EN_TRAITEMENT', 'En traitement', 'Alerte en cours de résolution', FALSE, 3),
('RESOLUE', 'Résolue', 'Alerte résolue', TRUE, 4),
('ESCALADEE', 'Escaladée', 'Alerte escaladée à un niveau supérieur', FALSE, 5),
('IGNOREE', 'Ignorée', 'Alerte ignorée (justifiée)', TRUE, 6),
('RECURRENTE', 'Récurrente', 'Alerte récurrente', FALSE, 7)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- PERMISSIONS (à adapter selon votre politique de sécurité)
-- ============================================================================

-- Exemple : Rôle pour les utilisateurs standards
-- CREATE ROLE alertes_user;
-- GRANT SELECT, INSERT, UPDATE ON alerts TO alertes_user;
-- GRANT SELECT ON alert_types, alert_statuses, offices, users, projects TO alertes_user;

-- Exemple : Rôle pour les administrateurs
-- CREATE ROLE alertes_admin;
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO alertes_admin;

-- ============================================================================
-- FIN DU SCHÉMA
-- ============================================================================

