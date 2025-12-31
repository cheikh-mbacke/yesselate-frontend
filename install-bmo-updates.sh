#!/bin/bash

# ============================================
# Script d'installation des mises à jour BMO
# ============================================
# Usage: ./install-bmo-updates.sh
# Exécuter depuis la racine du projet (où se trouve bmo-updates/)

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Vérifier qu'on est bien à la racine du projet
if [ ! -d "bmo-updates" ]; then
    echo -e "${RED}❌ Erreur: Le dossier 'bmo-updates' n'existe pas dans le répertoire courant.${NC}"
    echo -e "${YELLOW}Assurez-vous d'exécuter ce script depuis la racine du projet.${NC}"
    exit 1
fi

if [ ! -d "src" ]; then
    echo -e "${RED}❌ Erreur: Le dossier 'src' n'existe pas. Êtes-vous à la racine du projet Next.js ?${NC}"
    exit 1
fi

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Installation des mises à jour BMO Portal  ${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Compteur de fichiers
count=0

# --- 1. Types ---
echo -e "${YELLOW}📦 Installation des types...${NC}"
if [ -f "bmo-updates/types/bmo.types.ts" ]; then
    cp bmo-updates/types/bmo.types.ts src/lib/types/bmo.types.ts
    echo -e "${GREEN}   ✓ bmo.types.ts → src/lib/types/${NC}"
    ((count++))
fi

# --- 2. Store ---
echo -e "${YELLOW}📦 Installation du store...${NC}"
if [ -f "bmo-updates/stores/bmo-store.ts" ]; then
    cp bmo-updates/stores/bmo-store.ts src/lib/stores/bmo-store.ts
    echo -e "${GREEN}   ✓ bmo-store.ts → src/lib/stores/${NC}"
    ((count++))
fi

# --- 3. Données mock ---
echo -e "${YELLOW}📦 Installation des données mock...${NC}"
if [ -f "bmo-updates/data/bmo-mock-3.ts" ]; then
    cp bmo-updates/data/bmo-mock-3.ts src/lib/data/bmo-mock-3.ts
    echo -e "${GREEN}   ✓ bmo-mock-3.ts → src/lib/data/${NC}"
    ((count++))
fi

if [ -f "bmo-updates/data/index.ts" ]; then
    cp bmo-updates/data/index.ts src/lib/data/index.ts
    echo -e "${GREEN}   ✓ index.ts → src/lib/data/${NC}"
    ((count++))
fi

# --- 4. Sidebar ---
echo -e "${YELLOW}📦 Installation de la Sidebar...${NC}"
if [ -f "bmo-updates/sidebar/Sidebar.tsx" ]; then
    cp bmo-updates/sidebar/Sidebar.tsx src/components/features/bmo/Sidebar.tsx
    echo -e "${GREEN}   ✓ Sidebar.tsx → src/components/features/bmo/${NC}"
    ((count++))
fi

# --- 5. Composants Modals ---
echo -e "${YELLOW}📦 Installation des composants modals...${NC}"

# Créer le dossier modals s'il n'existe pas
mkdir -p src/components/features/bmo/modals

if [ -f "bmo-updates/components/modals/SubstitutionModal.tsx" ]; then
    cp bmo-updates/components/modals/SubstitutionModal.tsx src/components/features/bmo/modals/
    echo -e "${GREEN}   ✓ SubstitutionModal.tsx → src/components/features/bmo/modals/${NC}"
    ((count++))
fi

if [ -f "bmo-updates/components/modals/BlocageModal.tsx" ]; then
    cp bmo-updates/components/modals/BlocageModal.tsx src/components/features/bmo/modals/
    echo -e "${GREEN}   ✓ BlocageModal.tsx → src/components/features/bmo/modals/${NC}"
    ((count++))
fi

if [ -f "bmo-updates/components/modals/BureauDetailsModal.tsx" ]; then
    cp bmo-updates/components/modals/BureauDetailsModal.tsx src/components/features/bmo/modals/
    echo -e "${GREEN}   ✓ BureauDetailsModal.tsx → src/components/features/bmo/modals/${NC}"
    ((count++))
fi

# --- 6. Pages ---
echo -e "${YELLOW}📦 Installation des nouvelles pages...${NC}"

# Page Paramètres
if [ -f "bmo-updates/pages/parametres/page.tsx" ]; then
    mkdir -p "app/(portals)/maitre-ouvrage/parametres"
    cp bmo-updates/pages/parametres/page.tsx "app/(portals)/maitre-ouvrage/parametres/"
    echo -e "${GREEN}   ✓ page.tsx → app/(portals)/maitre-ouvrage/parametres/${NC}"
    ((count++))
fi

# Page Stats Clients
if [ -f "bmo-updates/pages/stats-clients/page.tsx" ]; then
    mkdir -p "app/(portals)/maitre-ouvrage/stats-clients"
    cp bmo-updates/pages/stats-clients/page.tsx "app/(portals)/maitre-ouvrage/stats-clients/"
    echo -e "${GREEN}   ✓ page.tsx → app/(portals)/maitre-ouvrage/stats-clients/${NC}"
    ((count++))
fi

# Page Visio
if [ -f "bmo-updates/pages/visio/page.tsx" ]; then
    mkdir -p "app/(portals)/maitre-ouvrage/visio"
    cp bmo-updates/pages/visio/page.tsx "app/(portals)/maitre-ouvrage/visio/"
    echo -e "${GREEN}   ✓ page.tsx → app/(portals)/maitre-ouvrage/visio/${NC}"
    ((count++))
fi

# Page Logs
if [ -f "bmo-updates/pages/logs/page.tsx" ]; then
    mkdir -p "app/(portals)/maitre-ouvrage/logs"
    cp bmo-updates/pages/logs/page.tsx "app/(portals)/maitre-ouvrage/logs/"
    echo -e "${GREEN}   ✓ page.tsx → app/(portals)/maitre-ouvrage/logs/${NC}"
    ((count++))
fi

# --- Résumé ---
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}✅ Installation terminée !${NC}"
echo -e "${BLUE}   ${count} fichiers installés${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# --- Rappel des modifications manuelles ---
echo -e "${YELLOW}⚠️  RAPPEL: Modifications manuelles requises${NC}"
echo ""
echo -e "${YELLOW}1. Dans src/components/shared/layouts/BMOLayout.tsx :${NC}"
echo "   Ajouter les imports et composants des modales :"
echo ""
echo "   // Imports à ajouter"
echo "   import { SubstitutionModal } from '@/components/features/bmo/modals/SubstitutionModal';"
echo "   import { BlocageModal } from '@/components/features/bmo/modals/BlocageModal';"
echo "   import { BureauDetailsModal } from '@/components/features/bmo/modals/BureauDetailsModal';"
echo ""
echo "   // Dans le return, ajouter après les autres overlays :"
echo "   <SubstitutionModal />"
echo "   <BlocageModal />"
echo "   <BureauDetailsModal />"
echo ""
echo -e "${YELLOW}2. Dans app/(portals)/maitre-ouvrage/bureaux/page.tsx :${NC}"
echo "   Connecter le bouton 'Détails' à la modale"
echo ""
echo -e "${YELLOW}3. Dans app/(portals)/maitre-ouvrage/page.tsx (Dashboard) :${NC}"
echo "   Connecter les boutons de blocage/substitution aux modales"
echo ""
echo -e "${BLUE}📖 Voir README.md dans bmo-updates/ pour plus de détails${NC}"
echo ""

# Demander si on veut supprimer le dossier bmo-updates
echo -e "${YELLOW}Voulez-vous supprimer le dossier bmo-updates ? (y/N)${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    rm -rf bmo-updates
    echo -e "${GREEN}✓ Dossier bmo-updates supprimé${NC}"
else
    echo -e "${BLUE}ℹ️  Le dossier bmo-updates a été conservé${NC}"
fi

echo ""
echo -e "${GREEN}🚀 Vous pouvez maintenant lancer 'npm run dev' pour tester${NC}"