import { NextRequest, NextResponse } from 'next/server';

export interface Budget {
  id: string;
  bureau: string;
  annee: number;
  categories: {
    deplacements: {
      alloue: number;
      utilise: number;
      restant: number;
      pourcentage: number;
      lignes: Array<{
        id: string;
        date: string;
        description: string;
        montant: number;
        beneficiaire: string;
      }>;
    };
    formations: {
      alloue: number;
      utilise: number;
      restant: number;
      pourcentage: number;
      lignes: Array<{
        id: string;
        date: string;
        description: string;
        montant: number;
        beneficiaire: string;
      }>;
    };
    depenses: {
      alloue: number;
      utilise: number;
      restant: number;
      pourcentage: number;
      lignes: Array<{
        id: string;
        date: string;
        description: string;
        montant: number;
        beneficiaire: string;
      }>;
    };
    salaires: {
      alloue: number;
      utilise: number;
      restant: number;
      pourcentage: number;
    };
  };
  alertes: Array<{
    type: 'warning' | 'danger';
    categorie: string;
    message: string;
    pourcentage: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Données simulées
let budgets: Budget[] = [
  {
    id: 'BUD-ALG-2026',
    bureau: 'Alger',
    annee: 2026,
    categories: {
      deplacements: {
        alloue: 500000,
        utilise: 342000,
        restant: 158000,
        pourcentage: 68.4,
        lignes: [
          {
            id: 'DEP-001',
            date: '2026-01-05',
            description: 'Mission Constantine',
            montant: 12000,
            beneficiaire: 'Ahmed Kaci',
          },
        ],
      },
      formations: {
        alloue: 300000,
        utilise: 145000,
        restant: 155000,
        pourcentage: 48.3,
        lignes: [],
      },
      depenses: {
        alloue: 800000,
        utilise: 534000,
        restant: 266000,
        pourcentage: 66.8,
        lignes: [],
      },
      salaires: {
        alloue: 5000000,
        utilise: 3750000,
        restant: 1250000,
        pourcentage: 75.0,
      },
    },
    alertes: [
      {
        type: 'warning',
        categorie: 'deplacements',
        message: 'Budget déplacements atteint 68% - surveillance recommandée',
        pourcentage: 68.4,
      },
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'BUD-ORA-2026',
    bureau: 'Oran',
    annee: 2026,
    categories: {
      deplacements: {
        alloue: 300000,
        utilise: 278000,
        restant: 22000,
        pourcentage: 92.7,
        lignes: [],
      },
      formations: {
        alloue: 200000,
        utilise: 98000,
        restant: 102000,
        pourcentage: 49.0,
        lignes: [],
      },
      depenses: {
        alloue: 500000,
        utilise: 423000,
        restant: 77000,
        pourcentage: 84.6,
        lignes: [],
      },
      salaires: {
        alloue: 3000000,
        utilise: 2250000,
        restant: 750000,
        pourcentage: 75.0,
      },
    },
    alertes: [
      {
        type: 'danger',
        categorie: 'deplacements',
        message: 'ALERTE : Budget déplacements presque épuisé (93%)',
        pourcentage: 92.7,
      },
      {
        type: 'warning',
        categorie: 'depenses',
        message: 'Budget dépenses atteint 85% - attention',
        pourcentage: 84.6,
      },
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
];

// GET /api/rh/budgets - Récupérer les budgets
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bureau = searchParams.get('bureau');
    const annee = searchParams.get('annee');
    const id = searchParams.get('id');

    let filtered = [...budgets];

    if (id) {
      const budget = filtered.find((b) => b.id === id);
      if (!budget) {
        return NextResponse.json(
          { error: 'Budget non trouvé' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: budget, success: true });
    }

    if (bureau) {
      filtered = filtered.filter((b) => b.bureau === bureau);
    }
    if (annee) {
      filtered = filtered.filter((b) => b.annee === parseInt(annee));
    }

    return NextResponse.json({
      data: filtered,
      total: filtered.length,
      success: true,
    });
  } catch (error) {
    console.error('Erreur GET /api/rh/budgets:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// POST /api/rh/budgets - Créer un nouveau budget
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.bureau || !body.annee) {
      return NextResponse.json(
        { error: 'Bureau et année requis', success: false },
        { status: 400 }
      );
    }

    // Vérifier si un budget existe déjà pour ce bureau/année
    if (budgets.some((b) => b.bureau === body.bureau && b.annee === body.annee)) {
      return NextResponse.json(
        { error: 'Un budget existe déjà pour ce bureau et cette année', success: false },
        { status: 400 }
      );
    }

    const newBudget: Budget = {
      id: `BUD-${body.bureau.substring(0, 3).toUpperCase()}-${body.annee}`,
      bureau: body.bureau,
      annee: body.annee,
      categories: {
        deplacements: {
          alloue: body.deplacements || 0,
          utilise: 0,
          restant: body.deplacements || 0,
          pourcentage: 0,
          lignes: [],
        },
        formations: {
          alloue: body.formations || 0,
          utilise: 0,
          restant: body.formations || 0,
          pourcentage: 0,
          lignes: [],
        },
        depenses: {
          alloue: body.depenses || 0,
          utilise: 0,
          restant: body.depenses || 0,
          pourcentage: 0,
          lignes: [],
        },
        salaires: {
          alloue: body.salaires || 0,
          utilise: 0,
          restant: body.salaires || 0,
          pourcentage: 0,
        },
      },
      alertes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    budgets.push(newBudget);

    return NextResponse.json(
      {
        data: newBudget,
        message: 'Budget créé avec succès',
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur POST /api/rh/budgets:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// PUT /api/rh/budgets - Mettre à jour un budget
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID du budget requis', success: false },
        { status: 400 }
      );
    }

    const index = budgets.findIndex((b) => b.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Budget non trouvé', success: false },
        { status: 404 }
      );
    }

    // Action spécifique : ajouter une dépense
    if (action === 'add_expense') {
      const { categorie, montant, description, beneficiaire } = body;
      
      if (!categorie || !montant) {
        return NextResponse.json(
          { error: 'Catégorie et montant requis', success: false },
          { status: 400 }
        );
      }

      const budget = budgets[index];
      const cat = budget.categories[categorie as keyof typeof budget.categories];
      
      if (cat && 'lignes' in cat) {
        cat.utilise += montant;
        cat.restant = cat.alloue - cat.utilise;
        cat.pourcentage = (cat.utilise / cat.alloue) * 100;

        cat.lignes.push({
          id: `EXP-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          description: description || '',
          montant,
          beneficiaire: beneficiaire || '',
        });

        // Mettre à jour les alertes
        if (cat.pourcentage >= 90) {
          budget.alertes.push({
            type: 'danger',
            categorie,
            message: `ALERTE : Budget ${categorie} presque épuisé (${cat.pourcentage.toFixed(1)}%)`,
            pourcentage: cat.pourcentage,
          });
        } else if (cat.pourcentage >= 75) {
          budget.alertes.push({
            type: 'warning',
            categorie,
            message: `Budget ${categorie} atteint ${cat.pourcentage.toFixed(1)}% - surveillance recommandée`,
            pourcentage: cat.pourcentage,
          });
        }
      }

      budget.updatedAt = new Date().toISOString();
      budgets[index] = budget;

      return NextResponse.json({
        data: budget,
        message: 'Dépense ajoutée avec succès',
        success: true,
      });
    }

    // Mise à jour standard
    budgets[index] = {
      ...budgets[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      data: budgets[index],
      message: 'Budget mis à jour avec succès',
      success: true,
    });
  } catch (error) {
    console.error('Erreur PUT /api/rh/budgets:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/rh/budgets?id=BUD-ALG-2026
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID du budget requis', success: false },
        { status: 400 }
      );
    }

    const index = budgets.findIndex((b) => b.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Budget non trouvé', success: false },
        { status: 404 }
      );
    }

    budgets.splice(index, 1);

    return NextResponse.json({
      message: 'Budget supprimé avec succès',
      success: true,
    });
  } catch (error) {
    console.error('Erreur DELETE /api/rh/budgets:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

