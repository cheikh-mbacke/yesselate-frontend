import { NextRequest, NextResponse } from 'next/server';

export interface RHSettings {
  userId: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: 'fr' | 'en' | 'ar';
    timezone: string;
    dateFormat: string;
    notificationsEnabled: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    soundEnabled: boolean;
    autoRefresh: boolean;
    refreshInterval: number; // en secondes
  };
  dashboard: {
    defaultView: 'overview' | 'calendar' | 'history' | 'favorites';
    showSidebar: boolean;
    sidebarPosition: 'left' | 'right';
    compactMode: boolean;
    showTips: boolean;
    defaultExportFormat: 'pdf' | 'excel' | 'csv';
  };
  workspace: {
    defaultQueue: string;
    itemsPerPage: number;
    sortField: string;
    sortOrder: 'asc' | 'desc';
    columnsVisible: string[];
    showPreview: boolean;
  };
  notifications: {
    urgentOnly: boolean;
    digestFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
    quietHoursEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
    subscribedCategories: string[];
  };
  shortcuts: {
    enabled: boolean;
    customBindings: Record<string, string>;
  };
  updatedAt: string;
}

// Paramètres par défaut
const DEFAULT_SETTINGS: Omit<RHSettings, 'userId'> = {
  preferences: {
    theme: 'system',
    language: 'fr',
    timezone: 'Africa/Algiers',
    dateFormat: 'dd/MM/yyyy',
    notificationsEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    soundEnabled: true,
    autoRefresh: true,
    refreshInterval: 30,
  },
  dashboard: {
    defaultView: 'overview',
    showSidebar: true,
    sidebarPosition: 'right',
    compactMode: false,
    showTips: true,
    defaultExportFormat: 'pdf',
  },
  workspace: {
    defaultQueue: 'pending',
    itemsPerPage: 20,
    sortField: 'createdAt',
    sortOrder: 'desc',
    columnsVisible: ['id', 'agent', 'type', 'status', 'date', 'actions'],
    showPreview: true,
  },
  notifications: {
    urgentOnly: false,
    digestFrequency: 'realtime',
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    subscribedCategories: ['demande', 'validation', 'deadline', 'system'],
  },
  shortcuts: {
    enabled: true,
    customBindings: {},
  },
  updatedAt: new Date().toISOString(),
};

// Store des paramètres par utilisateur
const userSettings: Map<string, RHSettings> = new Map();

// GET /api/rh/settings
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId requis', success: false },
        { status: 400 }
      );
    }

    let settings = userSettings.get(userId);
    
    if (!settings) {
      // Créer les paramètres par défaut pour ce user
      settings = {
        userId,
        ...DEFAULT_SETTINGS,
        updatedAt: new Date().toISOString(),
      };
      userSettings.set(userId, settings);
    }

    return NextResponse.json({
      data: settings,
      success: true,
    });
  } catch (error) {
    console.error('Erreur GET /api/rh/settings:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// PUT /api/rh/settings - Mettre à jour les paramètres
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...updates } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId requis', success: false },
        { status: 400 }
      );
    }

    let settings = userSettings.get(userId);
    
    if (!settings) {
      settings = {
        userId,
        ...DEFAULT_SETTINGS,
        updatedAt: new Date().toISOString(),
      };
    }

    // Fusionner les mises à jour
    if (updates.preferences) {
      settings.preferences = { ...settings.preferences, ...updates.preferences };
    }
    if (updates.dashboard) {
      settings.dashboard = { ...settings.dashboard, ...updates.dashboard };
    }
    if (updates.workspace) {
      settings.workspace = { ...settings.workspace, ...updates.workspace };
    }
    if (updates.notifications) {
      settings.notifications = { ...settings.notifications, ...updates.notifications };
    }
    if (updates.shortcuts) {
      settings.shortcuts = { ...settings.shortcuts, ...updates.shortcuts };
    }

    settings.updatedAt = new Date().toISOString();
    userSettings.set(userId, settings);

    return NextResponse.json({
      data: settings,
      message: 'Paramètres mis à jour',
      success: true,
    });
  } catch (error) {
    console.error('Erreur PUT /api/rh/settings:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// POST /api/rh/settings/reset - Réinitialiser les paramètres
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, section } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId requis', success: false },
        { status: 400 }
      );
    }

    let settings = userSettings.get(userId);
    
    if (!settings) {
      settings = {
        userId,
        ...DEFAULT_SETTINGS,
        updatedAt: new Date().toISOString(),
      };
    }

    // Réinitialiser une section ou tout
    if (section) {
      switch (section) {
        case 'preferences':
          settings.preferences = { ...DEFAULT_SETTINGS.preferences };
          break;
        case 'dashboard':
          settings.dashboard = { ...DEFAULT_SETTINGS.dashboard };
          break;
        case 'workspace':
          settings.workspace = { ...DEFAULT_SETTINGS.workspace };
          break;
        case 'notifications':
          settings.notifications = { ...DEFAULT_SETTINGS.notifications };
          break;
        case 'shortcuts':
          settings.shortcuts = { ...DEFAULT_SETTINGS.shortcuts };
          break;
      }
    } else {
      // Réinitialiser tout
      settings = {
        userId,
        ...DEFAULT_SETTINGS,
        updatedAt: new Date().toISOString(),
      };
    }

    settings.updatedAt = new Date().toISOString();
    userSettings.set(userId, settings);

    return NextResponse.json({
      data: settings,
      message: section ? `Section ${section} réinitialisée` : 'Tous les paramètres réinitialisés',
      success: true,
    });
  } catch (error) {
    console.error('Erreur POST /api/rh/settings:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

