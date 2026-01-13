import { NextRequest, NextResponse } from 'next/server';

export interface Agent {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  bureau: string;
  service: string;
  poste: string;
  dateEmbauche: string;
  dateNaissance: string;
  salaire: number;
  statut: 'actif' | 'inactif' | 'suspendu';
  soldeConges: {
    annuel: number;
    maladie: number;
    exceptionnel: number;
    recuperation: number;
  };
  manager?: {
    id: string;
    nom: string;
  };
  historique: Array<{
    id: string;
    type: string;
    date: string;
    details: string;
  }>;
  documents: Array<{
    id: string;
    type: string;
    nom: string;
    url: string;
    dateAjout: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Données simulées
let agents: Agent[] = [
  {
    id: 'AGT-001',
    matricule: 'MAT-2020-001',
    nom: 'Kaci',
    prenom: 'Ahmed',
    email: 'ahmed.kaci@example.dz',
    telephone: '+213 555 123 456',
    bureau: 'Alger',
    service: 'Informatique',
    poste: 'Développeur Senior',
    dateEmbauche: '2020-03-15',
    dateNaissance: '1990-05-20',
    salaire: 150000,
    statut: 'actif',
    soldeConges: {
      annuel: 25,
      maladie: 15,
      exceptionnel: 5,
      recuperation: 3,
    },
    manager: {
      id: 'AGT-010',
      nom: 'Sarah Martin',
    },
    historique: [],
    documents: [],
    createdAt: '2020-03-15T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'AGT-002',
    matricule: 'MAT-2019-045',
    nom: 'Benali',
    prenom: 'Farid',
    email: 'farid.benali@example.dz',
    telephone: '+213 555 234 567',
    bureau: 'Oran',
    service: 'Finance',
    poste: 'Contrôleur de gestion',
    dateEmbauche: '2019-09-01',
    dateNaissance: '1988-11-12',
    salaire: 135000,
    statut: 'actif',
    soldeConges: {
      annuel: 28,
      maladie: 15,
      exceptionnel: 5,
      recuperation: 2,
    },
    historique: [],
    documents: [],
    createdAt: '2019-09-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
];

// GET /api/rh/agents - Récupérer tous les agents
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const matricule = searchParams.get('matricule');
    const bureau = searchParams.get('bureau');
    const service = searchParams.get('service');
    const statut = searchParams.get('statut');
    const search = searchParams.get('search');

    let filtered = [...agents];

    // Filtrer par ID
    if (id) {
      const agent = filtered.find((a) => a.id === id);
      if (!agent) {
        return NextResponse.json(
          { error: 'Agent non trouvé' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: agent, success: true });
    }

    // Filtrer par matricule
    if (matricule) {
      const agent = filtered.find((a) => a.matricule === matricule);
      if (!agent) {
        return NextResponse.json(
          { error: 'Agent non trouvé' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: agent, success: true });
    }

    // Autres filtres
    if (bureau) {
      filtered = filtered.filter((a) => a.bureau === bureau);
    }
    if (service) {
      filtered = filtered.filter((a) => a.service === service);
    }
    if (statut) {
      filtered = filtered.filter((a) => a.statut === statut);
    }

    // Recherche textuelle
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.nom.toLowerCase().includes(searchLower) ||
          a.prenom.toLowerCase().includes(searchLower) ||
          a.matricule.toLowerCase().includes(searchLower) ||
          a.email.toLowerCase().includes(searchLower)
      );
    }

    // Trier par nom
    filtered.sort((a, b) => a.nom.localeCompare(b.nom));

    return NextResponse.json({
      data: filtered,
      total: filtered.length,
      success: true,
    });
  } catch (error) {
    console.error('Erreur GET /api/rh/agents:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// POST /api/rh/agents - Créer un nouvel agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body.nom || !body.prenom || !body.email || !body.bureau) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants', success: false },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    if (agents.some((a) => a.email === body.email)) {
      return NextResponse.json(
        { error: 'Un agent avec cet email existe déjà', success: false },
        { status: 400 }
      );
    }

    const newAgent: Agent = {
      id: `AGT-${String(agents.length + 1).padStart(3, '0')}`,
      matricule: body.matricule || `MAT-${new Date().getFullYear()}-${String(agents.length + 1).padStart(3, '0')}`,
      nom: body.nom,
      prenom: body.prenom,
      email: body.email,
      telephone: body.telephone || '',
      bureau: body.bureau,
      service: body.service || '',
      poste: body.poste || '',
      dateEmbauche: body.dateEmbauche || new Date().toISOString().split('T')[0],
      dateNaissance: body.dateNaissance || '',
      salaire: body.salaire || 0,
      statut: 'actif',
      soldeConges: {
        annuel: 30,
        maladie: 15,
        exceptionnel: 5,
        recuperation: 0,
      },
      manager: body.manager,
      historique: [],
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    agents.push(newAgent);

    return NextResponse.json(
      {
        data: newAgent,
        message: 'Agent créé avec succès',
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur POST /api/rh/agents:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// PUT /api/rh/agents - Mettre à jour un agent
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de l\'agent requis', success: false },
        { status: 400 }
      );
    }

    const index = agents.findIndex((a) => a.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Agent non trouvé', success: false },
        { status: 404 }
      );
    }

    agents[index] = {
      ...agents[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      data: agents[index],
      message: 'Agent mis à jour avec succès',
      success: true,
    });
  } catch (error) {
    console.error('Erreur PUT /api/rh/agents:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/rh/agents?id=AGT-001
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID de l\'agent requis', success: false },
        { status: 400 }
      );
    }

    const index = agents.findIndex((a) => a.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Agent non trouvé', success: false },
        { status: 404 }
      );
    }

    // Soft delete : marquer comme inactif au lieu de supprimer
    agents[index].statut = 'inactif';
    agents[index].updatedAt = new Date().toISOString();

    return NextResponse.json({
      message: 'Agent désactivé avec succès',
      success: true,
    });
  } catch (error) {
    console.error('Erreur DELETE /api/rh/agents:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

