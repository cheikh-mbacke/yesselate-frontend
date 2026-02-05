import { NextRequest, NextResponse } from 'next/server';

export interface ResponseTemplate {
  id: string;
  name: string;
  description: string;
  category: 'validation' | 'rejection' | 'request_info' | 'follow_up' | 'notification' | 'other';
  type: 'congé' | 'dépense' | 'déplacement' | 'paie' | 'maladie' | 'all';
  subject?: string;
  content: string;
  variables: string[];
  isActive: boolean;
  usageCount: number;
  lastUsedAt?: string;
  createdBy: {
    id: string;
    name: string;
  };
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Données simulées
let templates: ResponseTemplate[] = [
  {
    id: 'TPL-001',
    name: 'Validation congés standard',
    description: 'Réponse standard pour validation de congés',
    category: 'validation',
    type: 'congé',
    subject: 'Validation de votre demande de congé',
    content: `Bonjour {{agent_name}},

Votre demande de congé du {{date_debut}} au {{date_fin}} ({{nb_jours}} jours) a été validée.

Votre nouveau solde de congés est de {{solde_restant}} jours.

Cordialement,
{{validator_name}}
Service RH`,
    variables: ['agent_name', 'date_debut', 'date_fin', 'nb_jours', 'solde_restant', 'validator_name'],
    isActive: true,
    usageCount: 156,
    lastUsedAt: '2026-01-10T10:30:00Z',
    createdBy: {
      id: 'USR-001',
      name: 'Sarah Martin',
    },
    tags: ['congé', 'validation', 'standard'],
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2026-01-10T10:30:00Z',
  },
  {
    id: 'TPL-002',
    name: 'Refus congés - Période haute activité',
    description: 'Refus pour période de forte charge',
    category: 'rejection',
    type: 'congé',
    subject: 'Concernant votre demande de congé',
    content: `Bonjour {{agent_name}},

Votre demande de congé du {{date_debut}} au {{date_fin}} ne peut malheureusement pas être acceptée.

Motif : La période demandée correspond à une période de forte activité et plusieurs membres de l'équipe sont déjà absents.

Nous vous invitons à :
- Proposer des dates alternatives
- Ou réduire la durée demandée

N'hésitez pas à me contacter pour en discuter.

Cordialement,
{{validator_name}}
Service RH`,
    variables: ['agent_name', 'date_debut', 'date_fin', 'validator_name'],
    isActive: true,
    usageCount: 23,
    lastUsedAt: '2026-01-09T15:00:00Z',
    createdBy: {
      id: 'USR-001',
      name: 'Sarah Martin',
    },
    tags: ['congé', 'refus', 'période haute'],
    createdAt: '2025-06-15T00:00:00Z',
    updatedAt: '2026-01-09T15:00:00Z',
  },
  {
    id: 'TPL-003',
    name: 'Demande de justificatifs',
    description: 'Demande de pièces justificatives manquantes',
    category: 'request_info',
    type: 'all',
    subject: 'Documents manquants pour votre demande',
    content: `Bonjour {{agent_name}},

Concernant votre demande {{demande_id}} du {{date_demande}}, nous avons besoin des documents suivants pour poursuivre le traitement :

{{liste_documents}}

Merci de nous transmettre ces éléments dans les meilleurs délais.

Sans réponse sous {{delai_jours}} jours, votre demande sera automatiquement classée sans suite.

Cordialement,
{{validator_name}}
Service RH`,
    variables: ['agent_name', 'demande_id', 'date_demande', 'liste_documents', 'delai_jours', 'validator_name'],
    isActive: true,
    usageCount: 89,
    lastUsedAt: '2026-01-10T11:00:00Z',
    createdBy: {
      id: 'USR-001',
      name: 'Sarah Martin',
    },
    tags: ['documents', 'relance', 'tous types'],
    createdAt: '2025-07-01T00:00:00Z',
    updatedAt: '2026-01-10T11:00:00Z',
  },
  {
    id: 'TPL-004',
    name: 'Validation dépense avec remarques',
    description: 'Validation de remboursement avec observations',
    category: 'validation',
    type: 'dépense',
    subject: 'Validation de votre demande de remboursement',
    content: `Bonjour {{agent_name}},

Votre demande de remboursement de {{montant}} DZD a été validée.

{{#remarques}}
Remarques : {{remarques}}
{{/remarques}}

Le virement sera effectué sous {{delai_virement}} jours ouvrés.

Cordialement,
{{validator_name}}
Service RH`,
    variables: ['agent_name', 'montant', 'remarques', 'delai_virement', 'validator_name'],
    isActive: true,
    usageCount: 67,
    lastUsedAt: '2026-01-10T09:15:00Z',
    createdBy: {
      id: 'USR-002',
      name: 'Thomas Dubois',
    },
    tags: ['dépense', 'validation', 'remboursement'],
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2026-01-10T09:15:00Z',
  },
  {
    id: 'TPL-005',
    name: 'Relance validation manager',
    description: 'Rappel pour validation en attente',
    category: 'follow_up',
    type: 'all',
    subject: '[RELANCE] Demande en attente de validation',
    content: `Bonjour {{manager_name}},

La demande suivante est en attente de votre validation depuis {{nb_jours_attente}} jours :

- Demande : {{demande_id}}
- Agent : {{agent_name}}
- Type : {{type_demande}}
- Date de soumission : {{date_soumission}}

Merci de bien vouloir la traiter dans les meilleurs délais.

Cordialement,
Système RH`,
    variables: ['manager_name', 'demande_id', 'agent_name', 'type_demande', 'date_soumission', 'nb_jours_attente'],
    isActive: true,
    usageCount: 34,
    lastUsedAt: '2026-01-10T07:00:00Z',
    createdBy: {
      id: 'SYS',
      name: 'Système',
    },
    tags: ['relance', 'manager', 'automatique'],
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2026-01-10T07:00:00Z',
  },
];

// GET /api/rh/templates
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');

    let filtered = [...templates];

    if (id) {
      const template = filtered.find((t) => t.id === id);
      if (!template) {
        return NextResponse.json(
          { error: 'Template non trouvé' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: template, success: true });
    }

    if (category) {
      filtered = filtered.filter((t) => t.category === category);
    }
    if (type) {
      filtered = filtered.filter((t) => t.type === type || t.type === 'all');
    }
    if (isActive !== null) {
      const active = isActive === 'true';
      filtered = filtered.filter((t) => t.isActive === active);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Trier par usage
    filtered.sort((a, b) => b.usageCount - a.usageCount);

    return NextResponse.json({
      data: filtered,
      total: filtered.length,
      success: true,
    });
  } catch (error) {
    console.error('Erreur GET /api/rh/templates:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// POST /api/rh/templates - Créer un template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.content || !body.category) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants', success: false },
        { status: 400 }
      );
    }

    // Extraire les variables du contenu
    const variableRegex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;
    while ((match = variableRegex.exec(body.content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    const newTemplate: ResponseTemplate = {
      id: `TPL-${Date.now()}`,
      name: body.name,
      description: body.description || '',
      category: body.category,
      type: body.type || 'all',
      subject: body.subject,
      content: body.content,
      variables,
      isActive: body.isActive !== false,
      usageCount: 0,
      createdBy: body.createdBy || { id: 'unknown', name: 'Unknown' },
      tags: body.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    templates.push(newTemplate);

    return NextResponse.json(
      {
        data: newTemplate,
        message: 'Template créé avec succès',
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur POST /api/rh/templates:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// PUT /api/rh/templates - Mettre à jour ou utiliser un template
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID du template requis', success: false },
        { status: 400 }
      );
    }

    const index = templates.findIndex((t) => t.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Template non trouvé', success: false },
        { status: 404 }
      );
    }

    // Action "use" : incrémenter le compteur d'utilisation
    if (action === 'use') {
      templates[index].usageCount += 1;
      templates[index].lastUsedAt = new Date().toISOString();
      
      return NextResponse.json({
        data: templates[index],
        message: 'Template utilisé',
        success: true,
      });
    }

    // Action "render" : remplacer les variables
    if (action === 'render') {
      const { variables: vars } = body;
      let renderedContent = templates[index].content;
      let renderedSubject = templates[index].subject || '';

      Object.entries(vars || {}).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        renderedContent = renderedContent.replace(regex, String(value));
        renderedSubject = renderedSubject.replace(regex, String(value));
      });

      // Gérer les blocs conditionnels {{#variable}}...{{/variable}}
      const conditionalRegex = /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
      renderedContent = renderedContent.replace(conditionalRegex, (_, key, content) => {
        const val = (vars as Record<string, unknown>)?.[key];
        return val ? content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(val)) : '';
      });

      return NextResponse.json({
        data: {
          subject: renderedSubject,
          content: renderedContent,
        },
        success: true,
      });
    }

    // Mise à jour standard
    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Recalculer les variables si le contenu a changé
    if (updates.content) {
      const variableRegex = /\{\{(\w+)\}\}/g;
      const variables: string[] = [];
      let match;
      while ((match = variableRegex.exec(updates.content)) !== null) {
        if (!variables.includes(match[1])) {
          variables.push(match[1]);
        }
      }
      templates[index].variables = variables;
    }

    return NextResponse.json({
      data: templates[index],
      message: 'Template mis à jour avec succès',
      success: true,
    });
  } catch (error) {
    console.error('Erreur PUT /api/rh/templates:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/rh/templates?id=TPL-001
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID du template requis', success: false },
        { status: 400 }
      );
    }

    const index = templates.findIndex((t) => t.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Template non trouvé', success: false },
        { status: 404 }
      );
    }

    templates.splice(index, 1);

    return NextResponse.json({
      message: 'Template supprimé avec succès',
      success: true,
    });
  } catch (error) {
    console.error('Erreur DELETE /api/rh/templates:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

