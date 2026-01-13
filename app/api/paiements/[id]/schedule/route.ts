// API Route: POST /api/paiements/[id]/schedule
// Planifie l'exécution d'un paiement à une date/heure précise
// ⭐ UNIQUE à Paiements (n'existe pas dans ValidationBC)

import { NextRequest, NextResponse } from 'next/server';

export interface SchedulePaiementBody {
  scheduledDate: string; // ISO date
  scheduledTime?: string; // HH:mm
  paymentMethod: 'virement' | 'cheque' | 'especes' | 'carte';
  bankAccount?: string;
  autoExecute?: boolean; // Exécution automatique ou manuelle
  notifyBefore?: number; // Heures avant pour notifier (ex: 24h)
  comment?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: SchedulePaiementBody = await request.json();

    // Validations
    if (!body.scheduledDate || !body.paymentMethod) {
      return NextResponse.json(
        { error: 'scheduledDate and paymentMethod are required' },
        { status: 400 }
      );
    }

    // Vérifier que la date est dans le futur
    const scheduledDateTime = new Date(`${body.scheduledDate}${body.scheduledTime ? `T${body.scheduledTime}` : ''}`);
    const now = new Date();
    
    if (scheduledDateTime <= now) {
      return NextResponse.json(
        { error: 'Scheduled date must be in the future' },
        { status: 400 }
      );
    }

    // TODO: Récupérer paiement
    const existingPaiement = {
      id,
      status: 'validated',
      montant: 10000000,
      fournisseur: 'SENELEC',
    };

    if (!existingPaiement) {
      return NextResponse.json(
        { error: 'Paiement not found' },
        { status: 404 }
      );
    }

    // Vérifier que le paiement peut être planifié
    if (existingPaiement.status !== 'validated' && existingPaiement.status !== 'pending') {
      return NextResponse.json(
        { error: 'Paiement must be validated before scheduling' },
        { status: 400 }
      );
    }

    // TODO: Vérifier permissions (trésorier ou admin)
    // TODO: Vérifier que la trésorerie sera suffisante à la date prévue
    // TODO: Vérifier que le compte bancaire existe et est actif

    const notifyBefore = body.notifyBefore || 24; // 24h par défaut
    const notifyDate = new Date(scheduledDateTime.getTime() - (notifyBefore * 60 * 60 * 1000));

    // TODO: Mettre à jour paiement en DB
    // await prisma.paiement.update({
    //   where: { id },
    //   data: {
    //     status: 'scheduled',
    //     scheduledDate: body.scheduledDate,
    //     scheduledTime: body.scheduledTime,
    //     paymentMethod: body.paymentMethod,
    //     bankAccount: body.bankAccount,
    //     autoExecute: body.autoExecute,
    //   }
    // });

    // TODO: Créer job planifié pour exécution (ex: Bull/BeeQueue)
    // TODO: Créer rappel notification avant exécution
    // TODO: Créer timeline entry
    // TODO: Notifier trésorier et validateurs

    const scheduledPaiement = {
      id,
      status: 'scheduled',
      scheduledDate: body.scheduledDate,
      scheduledTime: body.scheduledTime,
      scheduledDateTime: scheduledDateTime.toISOString(),
      paymentMethod: body.paymentMethod,
      bankAccount: body.bankAccount || 'default',
      autoExecute: body.autoExecute !== false,
      notifyDate: notifyDate.toISOString(),
      jobId: `job-${Date.now()}`, // ID du job planifié
      updatedAt: new Date().toISOString(),
    };

    console.log(`[paiements/${id}/schedule] Paiement planifié:`, {
      id,
      scheduledDate: body.scheduledDate,
      paymentMethod: body.paymentMethod,
    });

    return NextResponse.json({
      success: true,
      message: 'Paiement planifié avec succès',
      paiement: scheduledPaiement,
      reminder: {
        date: notifyDate.toISOString(),
        hoursBefore: notifyBefore,
      },
    });
  } catch (error) {
    console.error(`[paiements/${params.id}/schedule] Error:`, error);
    return NextResponse.json(
      { error: 'Failed to schedule paiement', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE pour annuler une planification
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // TODO: Récupérer paiement
    const existingPaiement = {
      id,
      status: 'scheduled',
      jobId: 'job-123',
    };

    if (existingPaiement.status !== 'scheduled') {
      return NextResponse.json(
        { error: 'Paiement is not scheduled' },
        { status: 400 }
      );
    }

    // TODO: Annuler job planifié
    // await bullQueue.remove(existingPaiement.jobId);

    // TODO: Mettre à jour statut
    // await prisma.paiement.update({
    //   where: { id },
    //   data: {
    //     status: 'validated',
    //     scheduledDate: null,
    //     scheduledTime: null,
    //     jobId: null,
    //   }
    // });

    console.log(`[paiements/${id}/schedule] Planification annulée`);

    return NextResponse.json({
      success: true,
      message: 'Planification annulée avec succès',
      paiement: {
        id,
        status: 'validated',
        cancelledScheduleAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(`[paiements/${params.id}/schedule] Cancel error:`, error);
    return NextResponse.json(
      { error: 'Failed to cancel schedule' },
      { status: 500 }
    );
  }
}

