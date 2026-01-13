// ============================================
// Hook pour le mode impression
// ============================================

import { useEffect } from 'react';

/**
 * Hook pour activer le mode impression optimisé
 */
export function usePrintMode(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    // Ajouter des styles d'impression
    const style = document.createElement('style');
    style.id = 'print-mode-styles';
    style.textContent = `
      @media print {
        /* Masquer les éléments non nécessaires */
        nav, header, footer, button, .no-print {
          display: none !important;
        }
        
        /* Optimiser les couleurs pour l'impression */
        * {
          background: white !important;
          color: black !important;
        }
        
        /* Forcer les sauts de page */
        .page-break {
          page-break-after: always;
        }
        
        /* Optimiser les tableaux */
        table {
          border-collapse: collapse;
          width: 100%;
        }
        
        th, td {
          border: 1px solid #000;
          padding: 8px;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById('print-mode-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [enabled]);

  const print = () => {
    window.print();
  };

  return { print };
}

