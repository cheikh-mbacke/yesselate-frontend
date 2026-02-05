# 🏗️ Architecture Layouts BMO - Route Groups Next.js

**Date:** Janvier 2025  
**Version:** 1.0

---

## 📋 Vue d'ensemble

Nouvelle architecture avec route groups Next.js pour séparer clairement les responsabilités :

```
app/
  (bmo)/
    layout.tsx                    ✅ Sidebar BMO globale
    maitre-ouvrage/
      (mo)/
        layout.tsx                ✅ Shell panneau métier 3 niveaux
        analytics/page.tsx        ✅ Page Analytics
        governance/page.tsx       ✅ Page Governance
        calendrier/page.tsx       ✅ Page Calendrier
        ...
```

---

## 🎯 Structure en 3 sections

### SECTION 1: Sidebar BMO (`app/(bmo)/layout.tsx`)

**Responsabilité:** Navigation principale latérale globale

- ✅ Sidebar BMO (`BMOSidebar`)
- ✅ Header BMO (`BMOHeader`)
- ✅ Notifications globales
- ✅ AI Assistant
- ✅ Toast Container
- ✅ AutoSync Provider

**Utilisation:**
```tsx
// app/(bmo)/layout.tsx
export default function BMOGobalLayout({ children }) {
  return (
    <FluentProviderClient>
      <BMOLayout>
        {children}
      </BMOLayout>
    </FluentProviderClient>
  );
}
```

---

### SECTION 2: Panneau métier 3 niveaux (`app/(bmo)/maitre-ouvrage/(mo)/layout.tsx`)

**Responsabilité:** Shell pour panneau métier contextuel

- ✅ Wrapper pour panneau métier
- ✅ Structure 3 niveaux :
  - **Niveau 1:** Catégories principales (dans sidebar métier)
  - **Niveau 2:** Sous-catégories (dans SubNavigation)
  - **Niveau 3:** Vues + Filtres (dans ViewSelector)

**Utilisation:**
```tsx
// app/(bmo)/maitre-ouvrage/(mo)/layout.tsx
export default function MOLayout({ children }) {
  return (
    <div className="flex h-full w-full flex-col">
      {/* Le panneau métier est géré par chaque page */}
      {children}
    </div>
  );
}
```

---

### SECTION 3: Contenu page (`app/(bmo)/maitre-ouvrage/(mo)/analytics/page.tsx`)

**Responsabilité:** Panneau métier spécifique + Contenu

Chaque page (analytics, governance, etc.) gère son propre panneau métier :

```tsx
// app/(bmo)/maitre-ouvrage/(mo)/analytics/page.tsx
export default function AnalyticsPage() {
  return (
    <div className="flex h-screen">
      {/* Sidebar métier (Niveau 1) */}
      <AnalyticsCommandSidebar />
      
      {/* Panneau métier (Niveaux 2 + 3) */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header>...</header>
        
        {/* SubNavigation (Niveau 2) */}
        <AnalyticsSubNavigation />
        
        {/* ViewSelector + Filtres (Niveau 3) */}
        <ViewSelector />
        
        {/* KPIBar (optionnel) */}
        <AnalyticsKPIBar />
        
        {/* Contenu */}
        <main>
          <AnalyticsContentRouter />
        </main>
        
        {/* Footer */}
        <footer>...</footer>
      </div>
    </div>
  );
}
```

---

## 🔄 Migration depuis l'ancienne structure

### Avant (`app/(portals)/maitre-ouvrage/analytics/page.tsx`)

```tsx
// Tout dans une seule page
export default function AnalyticsPage() {
  return (
    <div>
      {/* Sidebar BMO */}
      <BMOSidebar />
      
      {/* Panneau métier + Contenu */}
      <div>
        <AnalyticsCommandSidebar />
        <Header />
        <SubNavigation />
        <Content />
      </div>
    </div>
  );
}
```

### Après (nouvelle structure)

```tsx
// app/(bmo)/layout.tsx
export default function BMOGobalLayout({ children }) {
  return <BMOLayout>{children}</BMOLayout>;
}

// app/(bmo)/maitre-ouvrage/(mo)/layout.tsx
export default function MOLayout({ children }) {
  return <div>{children}</div>;
}

// app/(bmo)/maitre-ouvrage/(mo)/analytics/page.tsx
export default function AnalyticsPage() {
  return (
    <div>
      {/* Panneau métier + Contenu seulement */}
      <AnalyticsCommandSidebar />
      <Header />
      <SubNavigation />
      <Content />
    </div>
  );
}
```

---

## ✅ Avantages

1. **Séparation des responsabilités**
   - Sidebar BMO globale → Layout `(bmo)`
   - Panneau métier → Layout `(mo)`
   - Contenu spécifique → Pages individuelles

2. **Réutilisabilité**
   - Layout `(bmo)` partagé par toutes les pages
   - Layout `(mo)` pour pages avec panneau métier 3 niveaux

3. **Maintenabilité**
   - Code mieux organisé
   - Plus facile à comprendre et modifier

4. **Performance**
   - Layouts mis en cache par Next.js
   - Re-render optimisé

---

## 📝 Notes importantes

- ⚠️ La page complète `app/(portals)/maitre-ouvrage/analytics/page.tsx` reste active pour le moment
- ✅ La nouvelle structure est prête à être utilisée
- 🔄 Migration progressive possible (les deux structures peuvent coexister)

---

## 🚀 Prochaines étapes

1. Migrer `analytics/page.tsx` vers la nouvelle structure
2. Migrer `governance/page.tsx` vers la nouvelle structure
3. Migrer `calendrier/page.tsx` vers la nouvelle structure
4. Supprimer l'ancienne structure `(portals)` une fois la migration complète

