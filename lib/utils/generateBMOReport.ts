// =============== GÉNÉRATION PDF RAPPORT MENSUEL BMO ===============
// ⚠️ Ce code fonctionne côté client (via jsPDF + html2canvas)
// Pour production, préfère un service côté serveur (Next.js API route)

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { BMODecision } from '@/lib/types/bmo.types';

interface DecisionWithAmount extends BMODecision {
  type?: string;
  montant?: number;
}

export const generateBMOReport = async (
  month: string, // ex: "Janvier 2026"
  decisions: DecisionWithAmount[],
  addToast: (msg: string, variant: string) => void
) => {
  try {
    // Créer un élément temporaire pour le rendu PDF
    const container = document.createElement('div');
    container.innerHTML = `
      <div id="bmo-report" style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px;">
        <header style="text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px;">
          <h1 style="color: #1e40af; font-size: 24px;">📊 Rapport Mensuel BMO</h1>
          <p style="font-size: 16px; color: #64748b;">${month}</p>
          <p style="font-size: 14px; color: #94a3b8;">Pilotage • Coordination • Contrôle</p>
        </header>

        <section style="margin-bottom: 20px;">
          <h2 style="color: #0f766e; font-size: 18px; margin-bottom: 10px;">Résumé des décisions</h2>
          <p><strong>Nombre total :</strong> ${decisions.length}</p>
          <p><strong>Décisions BMO (Accountable) :</strong> ${decisions.filter(d => d.validatorRole === 'A').length}</p>
          <p><strong>Montant total piloté :</strong> ${decisions.reduce((a, d) => a + (d.montant || 0), 0).toLocaleString('fr-FR')} FCFA</p>
        </section>

        <section>
          <h2 style="color: #0f766e; font-size: 18px; margin-bottom: 10px;">Détail des décisions</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background-color: #dbeafe;">
                <th style="border: 1px solid #93c5fd; padding: 6px;">ID</th>
                <th style="border: 1px solid #93c5fd; padding: 6px;">Type</th>
                <th style="border: 1px solid #93c5fd; padding: 6px;">Montant</th>
                <th style="border: 1px solid #93c5fd; padding: 6px;">Rôle</th>
                <th style="border: 1px solid #93c5fd; padding: 6px;">Hash</th>
              </tr>
            </thead>
            <tbody>
              ${decisions.map(d => `
                <tr>
                  <td style="border: 1px solid #bfdbfe; padding: 6px;">${d.decisionId}</td>
                  <td style="border: 1px solid #bfdbfe; padding: 6px;">${d.type}</td>
                  <td style="border: 1px solid #bfdbfe; padding: 6px;">${(d.montant || 0).toLocaleString('fr-FR')} FCFA</td>
                  <td style="border: 1px solid #bfdbfe; padding: 6px;">${d.validatorRole === 'A' ? 'BMO (A)' : 'BM (R)'}</td>
                  <td style="border: 1px solid #bfdbfe; padding: 6px; font-family: monospace; font-size: 10px;">${d.hash.slice(0, 20)}...</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>

        <footer style="margin-top: 30px; text-align: center; font-size: 12px; color: #64748b;">
          <p>Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
          <p>⚠️ Ce document est valide uniquement avec son hash de traçabilité</p>
        </footer>
      </div>
    `;

    document.body.appendChild(container);
    const element = document.getElementById('bmo-report')!;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const filename = `Rapport_BMO_${month.replace(/\s+/g, '_')}.pdf`;
    pdf.save(filename);

    document.body.removeChild(container);
    addToast('✅ Rapport PDF généré (traçabilité incluse)', 'success');
  } catch (error) {
    addToast('❌ Erreur génération PDF', 'error');
    console.error(error);
  }
};

