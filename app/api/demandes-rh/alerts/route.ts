import { NextRequest, NextResponse } from 'next/server';
import { demandesRH } from '@/lib/data/bmo-mock-2';

// Helper: Check if demand is urgent
function isUrgent(demande: any): boolean {
  if (demande.statut === 'en_attente') {
    const dateDebut = new Date(demande.dateDebut);
    const today = new Date();
    const diffDays = Math.ceil((dateDebut.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 3 && diffDays >= 0) return true;
    if (demande.type === 'Dépense' && demande.montant && demande.montant > 500000) return true;
  }
  
  return false;
}

// GET /api/demandes-rh/alerts - Alertes critiques
export async function GET(request: NextRequest) {
  try {
    const alerts: any[] = [];
    const today = new Date();
    
    demandesRH.forEach((demande: any) => {
      // Demandes urgentes non traitées
      if (demande.statut === 'en_attente' && isUrgent(demande)) {
        const dateDebut = new Date(demande.dateDebut);
        const diffDays = Math.ceil((dateDebut.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        alerts.push({
          id: `urgent-${demande.id}`,
          type: 'critical',
          message: `${demande.type} de ${demande.agent} commence dans ${diffDays} jour(s)`,
          demandeId: demande.id,
          demandType: demande.type,
          agent: demande.agent,
          action: 'Traiter',
          createdAt: new Date().toISOString(),
        });
      }
      
      // Demandes avec montant élevé
      if (demande.type === 'Dépense' && demande.montant && demande.montant > 500000 && demande.statut === 'en_attente') {
        alerts.push({
          id: `high-amount-${demande.id}`,
          type: 'warning',
          message: `Dépense de ${new Intl.NumberFormat('fr-FR').format(demande.montant)} FCFA en attente`,
          demandeId: demande.id,
          demandType: demande.type,
          agent: demande.agent,
          action: 'Valider',
          createdAt: new Date().toISOString(),
        });
      }
      
      // Demandes en attente depuis plus de 7 jours
      const dateCreation = new Date(demande.dateCreation);
      const daysSinceCreation = Math.ceil((today.getTime() - dateCreation.getTime()) / (1000 * 60 * 60 * 24));
      
      if (demande.statut === 'en_attente' && daysSinceCreation > 7) {
        alerts.push({
          id: `old-pending-${demande.id}`,
          type: 'warning',
          message: `${demande.type} de ${demande.agent} en attente depuis ${daysSinceCreation} jours`,
          demandeId: demande.id,
          demandType: demande.type,
          agent: demande.agent,
          action: 'Traiter',
          createdAt: new Date().toISOString(),
        });
      }
    });
    
    // Trier par criticité puis par date
    alerts.sort((a, b) => {
      if (a.type === 'critical' && b.type !== 'critical') return -1;
      if (a.type !== 'critical' && b.type === 'critical') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    return NextResponse.json({
      alerts: alerts.slice(0, 20),
      count: alerts.length,
    });
  } catch (error) {
    console.error('Erreur GET /api/demandes-rh/alerts:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des alertes' },
      { status: 500 }
    );
  }
}

