// app/(bmo)/layout.tsx
"use client";

import { BMOAppShell } from "@/components/bmo/BMOAppShell";

export default function RootBMOLayout({ children }: { children: React.ReactNode }) {
  return <BMOAppShell>{children}</BMOAppShell>;
}

