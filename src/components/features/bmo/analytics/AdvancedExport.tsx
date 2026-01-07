'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, FileSpreadsheet, FileJson, Calendar } from 'lucide-react';

interface AdvancedExportProps {
  data: any;
  type: 'analytics' | 'comparison' | 'anomalies';
  fileName?: string;
}

export function AdvancedExport({ data, type, fileName }: AdvancedExportProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [exporting, setExporting] = useState(false);

  const exportToPDF = async () => {
    setExporting(true);
    addToast('Génération du PDF en cours...', 'info');
    
    // Simulation de génération PDF
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // En production, utiliser une librairie comme jsPDF ou react-pdf
    const blob = new Blob(['PDF Content'], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName || 'export'}-${new Date().toISOString().split('T')[0]}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    
    setExporting(false);
    addToast('PDF exporté avec succès !', 'success');
  };

  const exportToExcel = async () => {
    setExporting(true);
    addToast('Génération du fichier Excel en cours...', 'info');
    
    // Convertir les données en CSV (format Excel-compatible)
    let csvContent = '';
    
    if (Array.isArray(data)) {
      // Headers
      if (data.length > 0) {
        csvContent += Object.keys(data[0]).join(',') + '\n';
        // Rows
        data.forEach(row => {
          csvContent += Object.values(row).join(',') + '\n';
        });
      }
    } else {
      // Objet simple
      csvContent = JSON.stringify(data, null, 2);
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName || 'export'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    setExporting(false);
    addToast('Fichier Excel exporté avec succès !', 'success');
  };

  const exportToJSON = async () => {
    setExporting(true);
    addToast('Génération du JSON en cours...', 'info');
    
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName || 'export'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setExporting(false);
    addToast('JSON exporté avec succès !', 'success');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export avancé
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={exportToPDF}
            disabled={exporting}
            className="flex flex-col items-center gap-2 h-auto py-4"
          >
            <FileText className="w-5 h-5" />
            <span className="text-xs">PDF</span>
          </Button>
          <Button
            variant="outline"
            onClick={exportToExcel}
            disabled={exporting}
            className="flex flex-col items-center gap-2 h-auto py-4"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span className="text-xs">Excel</span>
          </Button>
          <Button
            variant="outline"
            onClick={exportToJSON}
            disabled={exporting}
            className="flex flex-col items-center gap-2 h-auto py-4"
          >
            <FileJson className="w-5 h-5" />
            <span className="text-xs">JSON</span>
          </Button>
        </div>
        {exporting && (
          <div className="mt-3 text-center">
            <Badge variant="info" className="text-xs">
              ⏳ Export en cours...
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

