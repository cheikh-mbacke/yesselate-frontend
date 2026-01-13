/**
 * Advanced Export Utilities
 * Helpers pour exporter des données (CSV, Excel, PDF)
 */

/**
 * Exporte des données en CSV (version simple)
 * Note: exportToCSV existe déjà dans exportUtils.ts avec plus d'options
 */
export function exportToCSVSimple(
  data: Record<string, any>[],
  filename: string = 'export.csv',
  headers?: string[]
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const csvHeaders = headers || Object.keys(data[0]);
  const csvRows: string[] = [];

  // Headers
  csvRows.push(csvHeaders.join(','));

  // Data rows
  data.forEach(row => {
    const values = csvHeaders.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      // Escape commas and quotes
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    });
    csvRows.push(values.join(','));
  });

  // Create blob and download
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exporte des données en JSON (version simple)
 * Note: exportToJSON existe déjà dans exportUtils.ts avec plus d'options
 */
export function exportToJSONSimple(
  data: any,
  filename: string = 'export.json',
  pretty: boolean = true
): void {
  const jsonContent = pretty
    ? JSON.stringify(data, null, 2)
    : JSON.stringify(data);

  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exporte des données en Excel (XLSX) - Format simple HTML
 * Note: exportToExcel existe déjà dans exportUtils.ts avec plus d'options
 * Pour un vrai export Excel, utiliser une librairie comme xlsx
 */
export function exportToExcelSimple(
  data: Record<string, any>[],
  filename: string = 'export.xlsx',
  sheetName: string = 'Sheet1',
  headers?: string[]
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Create HTML table
  const csvHeaders = headers || Object.keys(data[0]);
  let html = `
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${csvHeaders.map(h => `<th>${escapeHtml(String(h))}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row =>
              `<tr>${csvHeaders.map(h => `<td>${escapeHtml(String(row[h] || ''))}</td>`).join('')}</tr>`
            ).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exporte des données en PDF (format simple HTML)
 * Note: Pour un vrai export PDF, utiliser une librairie comme jsPDF ou pdfmake
 */
export function exportToPDF(
  data: Record<string, any>[],
  filename: string = 'export.pdf',
  title: string = 'Export',
  headers?: string[]
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const csvHeaders = headers || Object.keys(data[0]);
  
  let html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <table>
          <thead>
            <tr>
              ${csvHeaders.map(h => `<th>${escapeHtml(String(h))}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row =>
              `<tr>${csvHeaders.map(h => `<td>${escapeHtml(String(row[h] || ''))}</td>`).join('')}</tr>`
            ).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  // Open in new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
}

/**
 * Escape HTML characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Formate des données pour export
 */
export function formatDataForExport(
  data: Record<string, any>[],
  formatters?: Record<string, (value: any) => string>
): Record<string, any>[] {
  if (!formatters) return data;

  return data.map(row => {
    const formatted: Record<string, any> = {};
    Object.keys(row).forEach(key => {
      const formatter = formatters[key];
      formatted[key] = formatter ? formatter(row[key]) : row[key];
    });
    return formatted;
  });
}

/**
 * Génère un nom de fichier avec timestamp
 */
export function generateFilename(
  prefix: string,
  extension: string,
  includeTimestamp: boolean = true
): string {
  const timestamp = includeTimestamp
    ? `_${new Date().toISOString().split('T')[0].replace(/-/g, '')}`
    : '';
  return `${prefix}${timestamp}.${extension}`;
}

