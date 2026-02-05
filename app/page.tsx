import Link from 'next/link';

type ModuleCard = {
  title: string;
  description: string;
  href: string;
  badge?: string;
};

const MODULES: ModuleCard[] = [
  {
    title: 'DMO',
    description: 'Pilotage global, suivi des dossiers et arbitrages.',
    href: '/dmo',
    badge: 'Direction',
  },
  {
    title: 'BMO',
    description: 'Demandes, validations, décisions, historisation et pièces.',
    href: '/bmo',
    badge: 'Exécution',
  },
  {
    title: 'Achats',
    description: 'Sourcing, consultations, marchés, fournisseurs, suivi.',
    href: '/achats',
    badge: 'Procurement',
  },
  {
    title: 'Projets',
    description: 'Planification, jalons, risques, livrables, coordination.',
    href: '/projets',
  },
  {
    title: 'Litiges',
    description: 'Précontentieux, contentieux, pénalités, preuves, stratégie.',
    href: '/litiges',
    badge: 'Risque',
  },
  {
    title: 'Paramètres',
    description: 'Profils, rôles, sécurité, modèles, référentiels.',
    href: '/settings',
  },
];

function BadgePill({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
      {children}
    </span>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Console Interne</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Organisation (6 grands blocs) — accès rapide aux espaces métier.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          >
            Se connecter
          </Link>
          <Link
            href="/bmo"
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Entrer (BMO)
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-10">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-5 flex items-start justify-between gap-6">
            <div className="space-y-1">
              <h2 className="text-base font-semibold">Espaces</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Clique sur un bloc pour ouvrir son interface dédiée.
              </p>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <BadgePill>Sécurisé</BadgePill>
              <BadgePill>Traçable</BadgePill>
              <BadgePill>Multi-bureaux</BadgePill>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map(m => (
              <Link
                key={m.href}
                href={m.href}
                className="group rounded-xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold tracking-tight">{m.title}</h3>
                      {m.badge ? <BadgePill>{m.badge}</BadgePill> : null}
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{m.description}</p>
                  </div>
                  <span className="mt-1 text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-zinc-700 dark:group-hover:text-zinc-200">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            Astuce : garde cette page comme "hub", et mets l'intelligence (command palette, raccourcis, notifications)
            dans chaque module, pour éviter un accueil trop chargé.
          </div>
        </section>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-400">
          <span>© {new Date().getFullYear()} Console interne</span>
          <div className="flex items-center gap-4">
            <Link href="/help" className="hover:text-zinc-900 dark:hover:text-zinc-200">
              Aide
            </Link>
            <Link href="/security" className="hover:text-zinc-900 dark:hover:text-zinc-200">
              Sécurité
            </Link>
            <Link href="/status" className="hover:text-zinc-900 dark:hover:text-zinc-200">
              Statut
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
