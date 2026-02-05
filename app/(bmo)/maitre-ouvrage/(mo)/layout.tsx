// app/(bmo)/maitre-ouvrage/(mo)/layout.tsx
"use client";

import { MaitreOuvrageShell } from "@/components/mo/MaitreOuvrageShell";
import { navMaitreOuvrage } from "@/components/mo/nav.maitre-ouvrage";

export default function MaitreOuvrageLayout({ children }: { children: React.ReactNode }) {
  return (
    <MaitreOuvrageShell nav={navMaitreOuvrage}>
      {children}
    </MaitreOuvrageShell>
  );
}

