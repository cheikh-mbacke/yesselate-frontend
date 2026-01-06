#!/bin/bash

# Script d'installation des mises à jour BMO
# Exécuter depuis la racine du projet : ./install-bmo-updates.sh

# Créer les dossiers nécessaires
mkdir -p src/components/features/bmo/modals
mkdir -p "app/(portals)/maitre-ouvrage/parametres"
mkdir -p "app/(portals)/maitre-ouvrage/stats-clients"
mkdir -p "app/(portals)/maitre-ouvrage/visio"
mkdir -p "app/(portals)/maitre-ouvrage/logs"

# Déplacer les fichiers
mv bmo-updates/types/bmo.types.ts src/lib/types/bmo.types.ts
mv bmo-updates/stores/bmo-store.ts src/lib/stores/bmo-store.ts
mv bmo-updates/data/bmo-mock-3.ts src/lib/data/bmo-mock-3.ts
mv bmo-updates/data/index.ts src/lib/data/index.ts
mv bmo-updates/sidebar/Sidebar.tsx src/components/features/bmo/Sidebar.tsx
mv bmo-updates/components/modals/SubstitutionModal.tsx src/components/features/bmo/modals/
mv bmo-updates/components/modals/BlocageModal.tsx src/components/features/bmo/modals/
mv bmo-updates/components/modals/BureauDetailsModal.tsx src/components/features/bmo/modals/
mv bmo-updates/pages/parametres/page.tsx "app/(portals)/maitre-ouvrage/parametres/"
mv bmo-updates/pages/stats-clients/page.tsx "app/(portals)/maitre-ouvrage/stats-clients/"
mv bmo-updates/pages/visio/page.tsx "app/(portals)/maitre-ouvrage/visio/"
mv bmo-updates/pages/logs/page.tsx "app/(portals)/maitre-ouvrage/logs/"

# Supprimer le dossier bmo-updates
rm -rf bmo-updates

echo "✅ Installation terminée !"