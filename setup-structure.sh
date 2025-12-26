#!/bin/bash

echo "🚀 Configuration de l'architecture NICE RÉNOVATION..."

# ===== SRC STRUCTURE =====
echo "📁 Création de la structure src/..."

# Créer les dossiers principaux
mkdir -p src/components/{ui,shared,features}
mkdir -p src/lib/{api,auth,stores,types,utils,constants,providers}
mkdir -p src/hooks

# Composants shared
mkdir -p src/components/shared/{layouts,forms,modals,guards}

# Composants features
mkdir -p src/components/features/{projects,devis,chantiers,payments,documents}

# API structure
mkdir -p src/lib/api/{endpoints,hooks,mutations}

# Types
mkdir -p src/lib/types/entities

# ===== APP ROUTES STRUCTURE =====
echo "📁 Création des routes app/..."

# Auth routes
mkdir -p app/\(auth\)/{login,register}

# Portal routes
mkdir -p app/\(portals\)/client/{projets,devis,paiements}
mkdir -p app/\(portals\)/client/projets/\[id\]

mkdir -p app/\(portals\)/architecte/{demandes,plans,validations}

mkdir -p app/\(portals\)/technicien/{visites,chantiers,devis}
mkdir -p app/\(portals\)/technicien/chantiers/\[id\]

mkdir -p app/\(portals\)/bureau-controle/{validations,jalons,rapports}

mkdir -p app/\(portals\)/comptable/{paiements,relances,rapports,echeanciers}

mkdir -p app/\(portals\)/ouvrier/{pointages,planning,profil,paies}

mkdir -p app/\(portals\)/maitre-ouvrage/{projets,achats,validations}

mkdir -p app/\(portals\)/juriste/{contrats,mediations,procedures}

mkdir -p app/\(portals\)/dg/{dashboard,kpis,decisions}

mkdir -p app/\(portals\)/admin/{utilisateurs,parametres,systeme}

# API routes
mkdir -p app/api/{health,webhook}

# ===== PUBLIC ASSETS =====
echo "📁 Création des assets publics..."
mkdir -p public/{icons,images,fonts}

# ===== FICHIERS INDEX.TS =====
echo "📝 Création des fichiers index.ts..."

# API exports
cat > src/lib/api/endpoints/index.ts << 'EOF'
export * from './projects';
export * from './devis';
export * from './users';
export * from './chantiers';
export * from './payments';
EOF

cat > src/lib/api/hooks/index.ts << 'EOF'
export * from './useProjects';
export * from './useDevis';
export * from './useAuth';
export * from './useChantiers';
export * from './usePayments';
EOF

cat > src/lib/types/entities/index.ts << 'EOF'
export * from './project';
export * from './devis';
export * from './user';
export * from './chantier';
export * from './payment';
EOF

cat > src/hooks/index.ts << 'EOF'
export * from './useRole';
export * from './usePermission';
export * from './useOfflineSync';
export * from './useNotifications';
EOF

# Stores exports
cat > src/lib/stores/index.ts << 'EOF'
export * from './authStore';
export * from './notificationStore';
export * from './offlineStore';
EOF

echo "✅ Structure créée avec succès!"
echo ""
echo "📦 Prochaines étapes:"
echo "1. Installer les dépendances: npm install"
echo "2. Créer le fichier .env.local"
echo "3. Configurer les providers et le client API"