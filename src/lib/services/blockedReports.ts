/**
 * ====================================================================
 * SERVICE: Rapports Automatiques - Blocked Dossiers
 * ====================================================================
 * 
 * Génération et envoi automatique de rapports programmés.
 */

import { blockedApi } from './blockedApiService';
import type { BlockedFilter, BlockedStats } from './blockedApiService';

export interface ScheduledReport {
  id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number; // 0-6 pour weekly
  dayOfMonth?: number; // 1-31 pour monthly
  time: string; // Format "HH:mm"
  recipients: string[];
  format: 'pdf' | 'excel' | 'email_html';
  filters: BlockedFilter;
  includeGraphs: boolean;
  includeDetails: boolean;
  enabled: boolean;
  lastRun?: string;
  nextRun: string;
  createdAt: string;
  createdBy: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  filters: BlockedFilter;
  includeGraphs: boolean;
  includeDetails: boolean;
}

// Templates prédéfinis
export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'tpl-daily-critical',
    name: 'Rapport quotidien - Blocages critiques',
    description: 'Tous les blocages critiques avec détails complets',
    filters: { impact: 'critical' },
    includeGraphs: true,
    includeDetails: true,
  },
  {
    id: 'tpl-weekly-all',
    name: 'Rapport hebdomadaire - Vue d\'ensemble',
    description: 'Synthèse complète de tous les blocages',
    filters: {},
    includeGraphs: true,
    includeDetails: false,
  },
  {
    id: 'tpl-monthly-stats',
    name: 'Rapport mensuel - Statistiques',
    description: 'KPIs et tendances du mois',
    filters: {},
    includeGraphs: true,
    includeDetails: false,
  },
  {
    id: 'tpl-sla-breach',
    name: 'Rapport SLA - Dépassements',
    description: 'Tous les dossiers hors délai',
    filters: { minDelay: 14 },
    includeGraphs: true,
    includeDetails: true,
  },
  {
    id: 'tpl-by-bureau',
    name: 'Rapport par bureau',
    description: 'Répartition des blocages par bureau',
    filters: {},
    includeGraphs: true,
    includeDetails: true,
  },
];

class BlockedReportsService {
  private storageKey = 'blocked:scheduled-reports';

  /**
   * Récupérer tous les rapports programmés
   */
  async getScheduledReports(): Promise<ScheduledReport[]> {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      
      const reports: ScheduledReport[] = JSON.parse(stored);
      
      // Mettre à jour nextRun si nécessaire
      return reports.map(report => ({
        ...report,
        nextRun: this.calculateNextRun(report),
      }));
    } catch (error) {
      console.error('[Reports] Failed to load:', error);
      return [];
    }
  }

  /**
   * Créer un nouveau rapport programmé
   */
  async createScheduledReport(data: Omit<ScheduledReport, 'id' | 'createdAt' | 'nextRun'>): Promise<ScheduledReport> {
    const report: ScheduledReport = {
      ...data,
      id: `RPT-${Date.now()}`,
      createdAt: new Date().toISOString(),
      nextRun: this.calculateNextRun(data as ScheduledReport),
    };

    const reports = await this.getScheduledReports();
    reports.push(report);
    
    this.saveReports(reports);
    return report;
  }

  /**
   * Mettre à jour un rapport programmé
   */
  async updateScheduledReport(id: string, updates: Partial<ScheduledReport>): Promise<ScheduledReport | null> {
    const reports = await this.getScheduledReports();
    const index = reports.findIndex(r => r.id === id);
    
    if (index === -1) return null;

    reports[index] = {
      ...reports[index],
      ...updates,
      nextRun: this.calculateNextRun({ ...reports[index], ...updates }),
    };

    this.saveReports(reports);
    return reports[index];
  }

  /**
   * Supprimer un rapport programmé
   */
  async deleteScheduledReport(id: string): Promise<boolean> {
    const reports = await this.getScheduledReports();
    const filtered = reports.filter(r => r.id !== id);
    
    if (filtered.length === reports.length) return false;

    this.saveReports(filtered);
    return true;
  }

  /**
   * Activer/désactiver un rapport
   */
  async toggleReport(id: string, enabled: boolean): Promise<boolean> {
    const result = await this.updateScheduledReport(id, { enabled });
    return result !== null;
  }

  /**
   * Générer un rapport immédiatement
   */
  async generateReportNow(report: ScheduledReport): Promise<Blob | null> {
    try {
      // Récupérer les données
      const { data } = await blockedApi.getAll(report.filters, undefined, 1, 1000);
      const stats = await blockedApi.getStats();

      // Générer le rapport selon le format
      switch (report.format) {
        case 'pdf':
          return await this.generatePDFReport(report, data, stats);
        
        case 'excel':
          return await this.generateExcelReport(report, data, stats);
        
        case 'email_html':
          return await this.generateHTMLReport(report, data, stats);
        
        default:
          throw new Error(`Unknown format: ${report.format}`);
      }
    } catch (error) {
      console.error('[Reports] Generation failed:', error);
      return null;
    }
  }

  /**
   * Envoyer un rapport par email
   */
  async sendReport(report: ScheduledReport): Promise<boolean> {
    try {
      const blob = await this.generateReportNow(report);
      if (!blob) return false;

      // En production, appeler l'API backend pour envoyer l'email
      console.log(`[Reports] Would send to: ${report.recipients.join(', ')}`);
      
      // Mock envoi
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mettre à jour lastRun
      await this.updateScheduledReport(report.id, {
        lastRun: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('[Reports] Send failed:', error);
      return false;
    }
  }

  /**
   * Calculer le prochain run
   */
  private calculateNextRun(report: ScheduledReport): string {
    const now = new Date();
    const [hours, minutes] = report.time.split(':').map(Number);
    
    let next = new Date(now);
    next.setHours(hours, minutes, 0, 0);

    switch (report.frequency) {
      case 'daily':
        if (next <= now) {
          next.setDate(next.getDate() + 1);
        }
        break;

      case 'weekly':
        const targetDay = report.dayOfWeek ?? 1; // Lundi par défaut
        const currentDay = next.getDay();
        let daysUntilTarget = targetDay - currentDay;
        
        if (daysUntilTarget <= 0 || (daysUntilTarget === 0 && next <= now)) {
          daysUntilTarget += 7;
        }
        
        next.setDate(next.getDate() + daysUntilTarget);
        break;

      case 'monthly':
        const targetDate = report.dayOfMonth ?? 1;
        next.setDate(targetDate);
        
        if (next <= now) {
          next.setMonth(next.getMonth() + 1);
        }
        break;
    }

    return next.toISOString();
  }

  /**
   * Sauvegarder les rapports
   */
  private saveReports(reports: ScheduledReport[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(reports));
    } catch (error) {
      console.error('[Reports] Failed to save:', error);
    }
  }

  /**
   * Générer PDF
   */
  private async generatePDFReport(
    report: ScheduledReport,
    data: any[],
    stats: BlockedStats
  ): Promise<Blob> {
    // En production, utiliser une lib comme @react-pdf/renderer ou jsPDF
    const html = await this.generateHTMLReport(report, data, stats);
    
    // Pour l'instant, retourner le HTML comme PDF mockup
    return new Blob([await html.text()], { type: 'application/pdf' });
  }

  /**
   * Générer Excel
   */
  private async generateExcelReport(
    report: ScheduledReport,
    data: any[],
    stats: BlockedStats
  ): Promise<Blob> {
    // En production, utiliser xlsx ou exceljs
    const csv = await blockedApi.exportData('csv', report.filters);
    return new Blob([await csv.text()], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }

  /**
   * Générer HTML pour email
   */
  private async generateHTMLReport(
    report: ScheduledReport,
    data: any[],
    stats: BlockedStats
  ): Promise<Blob> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${report.name}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: 20px; }
    h1 { color: #ea580c; border-bottom: 3px solid #ea580c; padding-bottom: 10px; }
    h2 { color: #64748b; margin-top: 30px; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
    .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; }
    .stat-value { font-size: 32px; font-weight: bold; color: #0f172a; }
    .stat-label { font-size: 14px; color: #64748b; text-transform: uppercase; }
    .critical { color: #dc2626; }
    .high { color: #f59e0b; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f8fafc; font-weight: 600; color: #475569; }
    .impact-critical { background: #fef2f2; color: #dc2626; font-weight: bold; }
    .impact-high { background: #fef3c7; color: #d97706; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <h1>${report.name}</h1>
  <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}</p>
  
  <div class="stats">
    <div class="stat-card">
      <div class="stat-label">Total</div>
      <div class="stat-value">${stats.total}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Critiques</div>
      <div class="stat-value critical">${stats.critical}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Délai moyen</div>
      <div class="stat-value">${stats.avgDelay}j</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Hors SLA</div>
      <div class="stat-value high">${stats.overdueSLA}</div>
    </div>
  </div>

  ${report.includeDetails ? `
    <h2>Détails des blocages</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Sujet</th>
          <th>Impact</th>
          <th>Bureau</th>
          <th>Délai</th>
        </tr>
      </thead>
      <tbody>
        ${data.slice(0, 50).map(d => `
          <tr class="${d.impact === 'critical' ? 'impact-critical' : d.impact === 'high' ? 'impact-high' : ''}">
            <td><code>${d.id}</code></td>
            <td>${d.subject}</td>
            <td><strong>${d.impact.toUpperCase()}</strong></td>
            <td>${d.bureau}</td>
            <td>J+${d.delay}</td>
          </tr>
        `).join('')}
        ${data.length > 50 ? `<tr><td colspan="5"><em>... et ${data.length - 50} autres blocages</em></td></tr>` : ''}
      </tbody>
    </table>
  ` : ''}

  <div class="footer">
    <p>Ce rapport a été généré automatiquement par le système BMO - Dossiers Bloqués.</p>
    <p>Pour plus de détails, connectez-vous à l'interface BMO.</p>
  </div>
</body>
</html>
    `;

    return new Blob([html], { type: 'text/html' });
  }

  /**
   * Vérifier et exécuter les rapports dus
   */
  async checkAndRunScheduledReports(): Promise<void> {
    const reports = await this.getScheduledReports();
    const now = new Date();

    for (const report of reports) {
      if (!report.enabled) continue;

      const nextRun = new Date(report.nextRun);
      if (nextRun <= now) {
        console.log(`[Reports] Running scheduled report: ${report.name}`);
        await this.sendReport(report);
      }
    }
  }
}

// Export singleton
export const blockedReports = new BlockedReportsService();

// Auto-check toutes les 5 minutes en production
if (typeof window !== 'undefined') {
  setInterval(() => {
    blockedReports.checkAndRunScheduledReports();
  }, 5 * 60 * 1000);
}

