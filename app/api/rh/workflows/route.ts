import { NextRequest, NextResponse } from 'next/server';

export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  active: boolean;
  priority: number;
  trigger: {
    type: 'on_submit' | 'on_status_change' | 'on_date' | 'on_amount' | 'on_duration';
    conditions: Array<{
      field: string;
      operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in_range';
      value: any;
    }>;
  };
  actions: Array<{
    type: 'auto_validate' | 'auto_reject' | 'assign_to' | 'notify' | 'add_comment' | 'set_priority' | 'request_documents';
    params: Record<string, any>;
  }>;
  stats: {
    executionCount: number;
    lastExecuted?: string;
    successRate: number;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Données simulées
let workflows: WorkflowRule[] = [
  {
    id: 'wf-1',
    name: 'Validation automatique congés courts',
    description: 'Valide automatiquement les demandes de congé ≤ 3 jours si solde suffisant',
    active: true,
    priority: 1,
    trigger: {
      type: 'on_submit',
      conditions: [
        { field: 'type', operator: 'equals', value: 'Congés' },
        { field: 'duration', operator: 'less_than', value: 4 },
        { field: 'balance', operator: 'greater_than', value: 0 },
      ],
    },
    actions: [
      { type: 'auto_validate', params: { reason: 'Auto-validation (durée courte + solde suffisant)' } },
      { type: 'notify', params: { to: 'agent', message: 'Votre demande a été validée automatiquement' } },
      { type: 'add_comment', params: { text: '✅ Validation automatique par workflow' } },
    ],
    stats: {
      executionCount: 156,
      lastExecuted: '2026-01-10T10:30:00Z',
      successRate: 98.7,
    },
    createdBy: 'admin',
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2026-01-10T10:30:00Z',
  },
];

// GET /api/rh/workflows - Récupérer tous les workflows
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const active = searchParams.get('active');
    const id = searchParams.get('id');

    let filtered = [...workflows];

    if (id) {
      const workflow = filtered.find((w) => w.id === id);
      if (!workflow) {
        return NextResponse.json(
          { error: 'Workflow non trouvé' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: workflow, success: true });
    }

    if (active !== null) {
      const isActive = active === 'true';
      filtered = filtered.filter((w) => w.active === isActive);
    }

    // Trier par priorité puis par nom
    filtered.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({
      data: filtered,
      total: filtered.length,
      success: true,
    });
  } catch (error) {
    console.error('Erreur GET /api/rh/workflows:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// POST /api/rh/workflows - Créer un nouveau workflow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.trigger || !body.actions) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants', success: false },
        { status: 400 }
      );
    }

    const newWorkflow: WorkflowRule = {
      id: `wf-${Date.now()}`,
      name: body.name,
      description: body.description || '',
      active: body.active !== undefined ? body.active : true,
      priority: body.priority || 5,
      trigger: body.trigger,
      actions: body.actions,
      stats: {
        executionCount: 0,
        successRate: 0,
      },
      createdBy: body.createdBy || 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    workflows.push(newWorkflow);

    return NextResponse.json(
      {
        data: newWorkflow,
        message: 'Workflow créé avec succès',
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur POST /api/rh/workflows:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// PUT /api/rh/workflows - Mettre à jour un workflow
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID du workflow requis', success: false },
        { status: 400 }
      );
    }

    const index = workflows.findIndex((w) => w.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Workflow non trouvé', success: false },
        { status: 404 }
      );
    }

    workflows[index] = {
      ...workflows[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      data: workflows[index],
      message: 'Workflow mis à jour avec succès',
      success: true,
    });
  } catch (error) {
    console.error('Erreur PUT /api/rh/workflows:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/rh/workflows?id=wf-1
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID du workflow requis', success: false },
        { status: 400 }
      );
    }

    const index = workflows.findIndex((w) => w.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Workflow non trouvé', success: false },
        { status: 404 }
      );
    }

    workflows.splice(index, 1);

    return NextResponse.json({
      message: 'Workflow supprimé avec succès',
      success: true,
    });
  } catch (error) {
    console.error('Erreur DELETE /api/rh/workflows:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

