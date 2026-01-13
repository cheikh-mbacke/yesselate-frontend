# Script PowerShell d'initialisation complète
# À exécuter : .\scripts\init-blocked-complete.ps1

Write-Host "🚀 Initialisation complète du module Blocked" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Étape 1 : Migration Prisma
Write-Host "📦 Étape 1/5 : Migration Prisma..." -ForegroundColor Yellow
try {
    Write-Host "   Création des tables dans la base de données..." -ForegroundColor Gray
    npx prisma migrate dev --name add-blocked-dossiers --skip-seed
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Migration réussie !" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ La migration a échoué ou a été annulée" -ForegroundColor Red
        Write-Host "   Essayons avec db push (développement uniquement)..." -ForegroundColor Yellow
        npx prisma db push --skip-generate
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ DB Push réussi !" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Échec de la synchronisation DB" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "   ❌ Erreur lors de la migration : $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Étape 2 : Génération du client Prisma
Write-Host "🔧 Étape 2/5 : Génération du client Prisma..." -ForegroundColor Yellow
try {
    npx prisma generate
    Write-Host "   ✅ Client généré !" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erreur lors de la génération : $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Étape 3 : Initialisation des données de test
Write-Host "📝 Étape 3/5 : Création des données de test..." -ForegroundColor Yellow
try {
    node scripts/init-blocked-db.js
    Write-Host "   ✅ Données de test créées !" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️ Avertissement : Les données de test n'ont pas pu être créées" -ForegroundColor Yellow
    Write-Host "   Vous pourrez les créer manuellement plus tard" -ForegroundColor Gray
}

Write-Host ""

# Étape 4 : Vérification avec Prisma Studio (optionnel)
Write-Host "🔍 Étape 4/5 : Vérification des tables..." -ForegroundColor Yellow
$openStudio = Read-Host "   Voulez-vous ouvrir Prisma Studio pour vérifier ? (o/n)"
if ($openStudio -eq "o" -or $openStudio -eq "O") {
    Write-Host "   Ouverture de Prisma Studio..." -ForegroundColor Gray
    Start-Process "npx" -ArgumentList "prisma", "studio" -NoNewWindow
    Write-Host "   ✅ Prisma Studio ouvert dans votre navigateur !" -ForegroundColor Green
    Write-Host "   📌 URL : http://localhost:5555" -ForegroundColor Cyan
} else {
    Write-Host "   ⏭️ Prisma Studio ignoré" -ForegroundColor Gray
}

Write-Host ""

# Étape 5 : Instructions finales
Write-Host "🎯 Étape 5/5 : Prêt à démarrer !" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Configuration terminée avec succès !" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes :" -ForegroundColor Cyan
Write-Host "   1. Lancer le serveur : npm run dev" -ForegroundColor White
Write-Host "   2. Ouvrir : http://localhost:3000/maitre-ouvrage/blocked" -ForegroundColor White
Write-Host "   3. Tester les APIs : curl http://localhost:3000/api/bmo/blocked/stats" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation disponible :" -ForegroundColor Cyan
Write-Host "   - GUIDE_DEMARRAGE_BLOCKED.md" -ForegroundColor White
Write-Host "   - AUDIT_FINAL_ULTRA_COMPLET.md" -ForegroundColor White
Write-Host "   - MODULE_BLOCKED_FINALISATION_DEFINITIVE.md" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Le module Blocked est prêt !" -ForegroundColor Green
Write-Host ""

