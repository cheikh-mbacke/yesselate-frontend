/**
 * Service d'Export de Données
 * =============================
 * 
 * Gère l'export des données en différents formats (Excel, PDF, CSV)
 */

// ============================================
// TYPES
// ============================================

export type ExportFormat = 'excel' | 'pdf' | 'csv' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  columns?: string[];
  filters?: Record<string, unknown>;
  dateRange?: {
    start: string;
    end: string;
  };
  includeHeaders?: boolean;
  sheetName?: string; // Pour Excel
  orientation?: 'portrait' | 'landscape'; // Pour PDF
}

export interface ExportResult {
  success: boolean;
  filename: string;
  size: number;
  recordCount: number;
  downloadUrl?: string;
  error?: string;
}

// ============================================
// SERVICE
// ============================================

class ExportService {
  /**
   * Exporte des données selon le format spécifié
   */
  async exportData<T = unknown>(
    data: T[],
    options: ExportOptions
  ): Promise<ExportResult> {
    const filename = options.filename || `export_${Date.now()}`;

    try {
      switch (options.format) {
        case 'excel':
          return await this.exportToExcel(data, { ...options, filename });
        case 'csv':
          return await this.exportToCSV(data, { ...options, filename });
        case 'pdf':
          return await this.exportToPDF(data, { ...options, filename });
        case 'json':
          return await this.exportToJSON(data, { ...options, filename });
        default:
          throw new Error(`Format non supporté: ${options.format}`);
      }
    } catch (error) {
      return {
        success: false,
        filename,
        size: 0,
        recordCount: 0,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  /**
   * Export vers Excel (XLSX)
   */
  private async exportToExcel<T>(
    data: T[],
    options: ExportOptions
  ): Promise<ExportResult> {
    // Simulation - En production, utiliser une lib comme 'xlsx' ou 'exceljs'
    await this.delay(800);

    const content = this.prepareDataForExport(data, options);
    const blob = new Blob([JSON.stringify(content)], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = URL.createObjectURL(blob);
    this.downloadBlob(url, `${options.filename}.xlsx`);

    return {
      success: true,
      filename: `${options.filename}.xlsx`,
      size: blob.size,
      recordCount: data.length,
      downloadUrl: url,
    };
  }

  /**
   * Export vers CSV
   */
  private async exportToCSV<T>(
    data: T[],
    options: ExportOptions
  ): Promise<ExportResult> {
    await this.delay(400);

    const content = this.prepareDataForExport(data, options);
    const csv = this.convertToCSV(content, options.includeHeaders !== false);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    this.downloadBlob(url, `${options.filename}.csv`);

    return {
      success: true,
      filename: `${options.filename}.csv`,
      size: blob.size,
      recordCount: data.length,
      downloadUrl: url,
    };
  }

  /**
   * Export vers PDF
   */
  private async exportToPDF<T>(
    data: T[],
    options: ExportOptions
  ): Promise<ExportResult> {
    // Simulation - En production, utiliser 'jspdf' + 'jspdf-autotable'
    await this.delay(1000);

    const content = this.prepareDataForExport(data, options);
    const pdfContent = JSON.stringify(content);

    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    this.downloadBlob(url, `${options.filename}.pdf`);

    return {
      success: true,
      filename: `${options.filename}.pdf`,
      size: blob.size,
      recordCount: data.length,
      downloadUrl: url,
    };
  }

  /**
   * Export vers JSON
   */
  private async exportToJSON<T>(
    data: T[],
    options: ExportOptions
  ): Promise<ExportResult> {
    await this.delay(200);

    const content = this.prepareDataForExport(data, options);
    const json = JSON.stringify(content, null, 2);

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    this.downloadBlob(url, `${options.filename}.json`);

    return {
      success: true,
      filename: `${options.filename}.json`,
      size: blob.size,
      recordCount: data.length,
      downloadUrl: url,
    };
  }

  /**
   * Prépare les données pour l'export (filtre colonnes, applique filtres)
   */
  private prepareDataForExport<T>(data: T[], options: ExportOptions): unknown[] {
    let prepared = [...data];

    // Filtrer par plage de dates si spécifié
    if (options.dateRange) {
      // Logique de filtrage par date
      // prepared = prepared.filter(...)
    }

    // Filtrer par colonnes si spécifié
    if (options.columns && options.columns.length > 0) {
      prepared = prepared.map((item) => {
        const filtered: Record<string, unknown> = {};
        options.columns!.forEach((col) => {
          if (col in (item as object)) {
            filtered[col] = (item as Record<string, unknown>)[col];
          }
        });
        return filtered as T;
      });
    }

    return prepared;
  }

  /**
   * Convertit des données en format CSV
   */
  private convertToCSV(data: unknown[], includeHeaders: boolean): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0] as object);
    let csv = '';

    if (includeHeaders) {
      csv += headers.join(',') + '\n';
    }

    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = (row as Record<string, unknown>)[header];
        // Échapper les virgules et guillemets
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csv += values.join(',') + '\n';
    });

    return csv;
  }

  /**
   * Déclenche le téléchargement d'un blob
   */
  private downloadBlob(url: string, filename: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Libérer l'URL après un délai
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  /**
   * Délai artificiel pour simulation
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Export rapide vers Excel (méthode helper)
   */
  async exportToExcelQuick<T>(
    data: T[],
    filename: string,
    sheetName?: string
  ): Promise<ExportResult> {
    return this.exportData(data, {
      format: 'excel',
      filename,
      sheetName: sheetName || 'Data',
    });
  }

  /**
   * Export rapide vers CSV (méthode helper)
   */
  async exportToCSVQuick<T>(data: T[], filename: string): Promise<ExportResult> {
    return this.exportData(data, {
      format: 'csv',
      filename,
    });
  }

  /**
   * Export rapide vers PDF (méthode helper)
   */
  async exportToPDFQuick<T>(
    data: T[],
    filename: string,
    orientation?: 'portrait' | 'landscape'
  ): Promise<ExportResult> {
    return this.exportData(data, {
      format: 'pdf',
      filename,
      orientation: orientation || 'portrait',
    });
  }
}

export const exportService = new ExportService();

