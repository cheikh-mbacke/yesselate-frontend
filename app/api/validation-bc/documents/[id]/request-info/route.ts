// API Route: POST /api/validation-bc/documents/[id]/request-info
// Demande des informations complémentaires

import { NextRequest, NextResponse } from 'next/server';

interface RequestInfoBody {
  comment: string;
  requestedFields: string[];
  deadline: string;
  recipientId: string;
}

const REQUESTABLE_FIELDS: Record<string, string> = {
  facture_proforma: 'Facture proforma',
  bon_livraison: 'Bon de livraison',
  pv_reception: 'PV de réception',
  justification_technique: 'Justification technique',
  devis_comparatif: 'Devis comparatif',
  autorisation_marche: 'Autorisation marché',
  autre: 'Autre document',
};

const DELAY_HOURS: Record<string, number> = {
  '24h': 24,
  '48h': 48,
  '72h': 72,
  '1w': 168,
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: RequestInfoBody = await request.json();

    // Validation des champs
    if (!body.comment || !body.requestedFields || body.requestedFields.length === 0) {
      return NextResponse.json(
        { error: 'Comment and requestedFields are required' },
        { status: 400 }
      );
    }

    if (!body.recipientId || !body.deadline) {
      return NextResponse.json(
        { error: 'RecipientId and deadline are required' },
        { status: 400 }
      );
    }

    // Vérifier les champs demandés
    const invalidFields = body.requestedFields.filter(
      field => !Object.keys(REQUESTABLE_FIELDS).includes(field)
    );

    if (invalidFields.length > 0) {
      return NextResponse.json(
        { error: `Invalid fields: ${invalidFields.join(', ')}` },
        { status: 400 }
      );
    }

    // TODO: Récupérer l'utilisateur courant
    // TODO: Vérifier les permissions
    // TODO: Mettre à jour le statut du document
    // TODO: Créer la demande d'info en DB
    // TODO: Créer l'entrée dans la timeline
    // TODO: Notifier le destinataire
    // TODO: Créer un rappel automatique avant l'échéance
    // TODO: Envoyer email

    // Calculer la date limite
    const deadlineHours = DELAY_HOURS[body.deadline] || 48;
    const deadlineDate = new Date();
    deadlineDate.setHours(deadlineDate.getHours() + deadlineHours);

    // Mapper les champs demandés
    const requestedFieldsLabels = body.requestedFields.map(
      field => REQUESTABLE_FIELDS[field] || field
    );

    // Mock response
    const infoRequest = {
      id: `req-${Date.now()}`,
      documentId: id,
      requestedBy: {
        id: 'val-2',
        name: 'M. KANE',
        fonction: 'DAF',
      },
      recipientId: body.recipientId,
      recipient: body.recipientId === 'demandeur' ? {
        id: 'user-1',
        name: 'Amadou DIALLO',
        fonction: 'Chef de Service',
      } : {
        id: body.recipientId,
        name: 'Destinataire',
        fonction: 'Fonction',
      },
      requestedFields: body.requestedFields,
      requestedFieldsLabels,
      comment: body.comment,
      deadline: deadlineDate.toISOString(),
      deadlineLabel: body.deadline,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Mock document status
    const updatedDocument = {
      id,
      status: 'info_requested',
      infoRequest,
      workflow: {
        status: 'paused',
        pausedAt: new Date().toISOString(),
        pausedBy: 'M. KANE',
        reason: 'En attente d\'informations complémentaires',
        resumeWhen: 'Informations fournies',
      },
    };

    // Log de l'action
    console.log(`[validation-bc/documents/${id}/request-info] Info requested`, {
      requestedBy: 'M. KANE',
      recipient: body.recipientId,
      fields: requestedFieldsLabels,
      deadline: deadlineDate.toISOString(),
    });

    // Créer notification
    // await createNotification({
    //   type: 'info_requested',
    //   documentId: id,
    //   userId: body.recipientId,
    //   message: `Informations demandées pour ${id}`,
    //   priority: 'high',
    //   deadline: deadlineDate,
    // });

    // Créer rappel automatique
    // await createReminder({
    //   type: 'info_request_deadline',
    //   documentId: id,
    //   userId: body.recipientId,
    //   scheduledAt: new Date(deadlineDate.getTime() - 24 * 60 * 60 * 1000), // 24h avant
    //   message: 'Rappel : informations demandées à fournir avant demain',
    // });

    return NextResponse.json({
      success: true,
      message: 'Demande d\'informations envoyée avec succès',
      infoRequest,
      document: updatedDocument,
      deadlineFormatted: deadlineDate.toLocaleString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      notifications: {
        email: true,
        sms: false,
        push: true,
        reminder24h: true,
      },
      ts: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[validation-bc/documents/[id]/request-info] Error:`, error);
    return NextResponse.json(
      { 
        error: 'Failed to request information',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

