import { NextRequest, NextResponse } from 'next/server';

export interface RHDocument {
  id: string;
  demandeId: string;
  name: string;
  originalName: string;
  type: 'justificatif' | 'facture' | 'certificat' | 'contrat' | 'autre';
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: {
    id: string;
    name: string;
  };
  status: 'pending' | 'validated' | 'rejected';
  validatedBy?: {
    id: string;
    name: string;
  };
  validatedAt?: string;
  rejectionReason?: string;
  metadata?: {
    pageCount?: number;
    extractedText?: string;
    ocrConfidence?: number;
    expirationDate?: string;
  };
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Données simulées
let documents: RHDocument[] = [
  {
    id: 'DOC-001',
    demandeId: 'RH-2026-001',
    name: 'certificat_medical.pdf',
    originalName: 'Certificat_Medical_Ahmed_Kaci.pdf',
    type: 'certificat',
    mimeType: 'application/pdf',
    size: 245678,
    url: '/uploads/rh/DOC-001.pdf',
    uploadedBy: {
      id: 'AGT-001',
      name: 'Ahmed Kaci',
    },
    status: 'validated',
    validatedBy: {
      id: 'USR-001',
      name: 'Sarah Martin',
    },
    validatedAt: '2026-01-10T10:00:00Z',
    metadata: {
      pageCount: 1,
      extractedText: 'Certificat médical - Dr. Mohamed Benali...',
      ocrConfidence: 95.5,
    },
    tags: ['médical', 'congé maladie'],
    createdAt: '2026-01-09T14:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'DOC-002',
    demandeId: 'RH-2026-002',
    name: 'facture_deplacement.pdf',
    originalName: 'Facture_Hotel_Constantine.pdf',
    type: 'facture',
    mimeType: 'application/pdf',
    size: 125890,
    url: '/uploads/rh/DOC-002.pdf',
    uploadedBy: {
      id: 'AGT-002',
      name: 'Farid Benali',
    },
    status: 'pending',
    metadata: {
      pageCount: 2,
      extractedText: 'Hotel El Mountazah - Facture N° 2026-0145...',
      ocrConfidence: 92.3,
    },
    tags: ['facture', 'hébergement', 'mission'],
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 'DOC-003',
    demandeId: 'RH-2026-002',
    name: 'billet_avion.pdf',
    originalName: 'E-Ticket_Air_Algerie.pdf',
    type: 'justificatif',
    mimeType: 'application/pdf',
    size: 89456,
    url: '/uploads/rh/DOC-003.pdf',
    uploadedBy: {
      id: 'AGT-002',
      name: 'Farid Benali',
    },
    status: 'validated',
    validatedBy: {
      id: 'USR-001',
      name: 'Sarah Martin',
    },
    validatedAt: '2026-01-10T11:00:00Z',
    metadata: {
      pageCount: 1,
    },
    tags: ['transport', 'avion'],
    createdAt: '2026-01-10T08:30:00Z',
    updatedAt: '2026-01-10T11:00:00Z',
  },
];

// GET /api/rh/documents
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const demandeId = searchParams.get('demandeId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const uploadedById = searchParams.get('uploadedById');

    let filtered = [...documents];

    if (id) {
      const doc = filtered.find((d) => d.id === id);
      if (!doc) {
        return NextResponse.json(
          { error: 'Document non trouvé' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: doc, success: true });
    }

    if (demandeId) {
      filtered = filtered.filter((d) => d.demandeId === demandeId);
    }
    if (type) {
      filtered = filtered.filter((d) => d.type === type);
    }
    if (status) {
      filtered = filtered.filter((d) => d.status === status);
    }
    if (uploadedById) {
      filtered = filtered.filter((d) => d.uploadedBy.id === uploadedById);
    }

    // Statistiques
    const stats = {
      total: filtered.length,
      totalSize: filtered.reduce((sum, d) => sum + d.size, 0),
      byType: {
        justificatif: filtered.filter((d) => d.type === 'justificatif').length,
        facture: filtered.filter((d) => d.type === 'facture').length,
        certificat: filtered.filter((d) => d.type === 'certificat').length,
        contrat: filtered.filter((d) => d.type === 'contrat').length,
        autre: filtered.filter((d) => d.type === 'autre').length,
      },
      byStatus: {
        pending: filtered.filter((d) => d.status === 'pending').length,
        validated: filtered.filter((d) => d.status === 'validated').length,
        rejected: filtered.filter((d) => d.status === 'rejected').length,
      },
    };

    return NextResponse.json({
      data: filtered,
      stats,
      total: filtered.length,
      success: true,
    });
  } catch (error) {
    console.error('Erreur GET /api/rh/documents:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// POST /api/rh/documents - Upload d'un document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.demandeId || !body.name || !body.uploadedBy) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants', success: false },
        { status: 400 }
      );
    }

    const newDoc: RHDocument = {
      id: `DOC-${Date.now()}`,
      demandeId: body.demandeId,
      name: body.name,
      originalName: body.originalName || body.name,
      type: body.type || 'autre',
      mimeType: body.mimeType || 'application/octet-stream',
      size: body.size || 0,
      url: body.url || `/uploads/rh/${body.name}`,
      thumbnailUrl: body.thumbnailUrl,
      uploadedBy: body.uploadedBy,
      status: 'pending',
      metadata: body.metadata,
      tags: body.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    documents.push(newDoc);

    return NextResponse.json(
      {
        data: newDoc,
        message: 'Document uploadé avec succès',
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur POST /api/rh/documents:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// PUT /api/rh/documents - Valider/Rejeter un document
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID du document requis', success: false },
        { status: 400 }
      );
    }

    const index = documents.findIndex((d) => d.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Document non trouvé', success: false },
        { status: 404 }
      );
    }

    // Action de validation
    if (action === 'validate') {
      documents[index].status = 'validated';
      documents[index].validatedBy = updates.validatedBy;
      documents[index].validatedAt = new Date().toISOString();
    }

    // Action de rejet
    if (action === 'reject') {
      documents[index].status = 'rejected';
      documents[index].validatedBy = updates.validatedBy;
      documents[index].validatedAt = new Date().toISOString();
      documents[index].rejectionReason = updates.rejectionReason;
    }

    // Mise à jour standard
    if (!action) {
      documents[index] = {
        ...documents[index],
        ...updates,
      };
    }

    documents[index].updatedAt = new Date().toISOString();

    return NextResponse.json({
      data: documents[index],
      message: action ? `Document ${action === 'validate' ? 'validé' : 'rejeté'}` : 'Document mis à jour',
      success: true,
    });
  } catch (error) {
    console.error('Erreur PUT /api/rh/documents:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/rh/documents?id=DOC-001
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID du document requis', success: false },
        { status: 400 }
      );
    }

    const index = documents.findIndex((d) => d.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Document non trouvé', success: false },
        { status: 404 }
      );
    }

    documents.splice(index, 1);

    return NextResponse.json({
      message: 'Document supprimé avec succès',
      success: true,
    });
  } catch (error) {
    console.error('Erreur DELETE /api/rh/documents:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

