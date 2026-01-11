import Image from "next/image";
import Link from "next/link";

// ================================
// Constants
// ================================

const COPY = {
  title: "To get started, edit the page.tsx file.",
  descriptionPrefix: "Looking for a starting point or more instructions? Head over to",
  templates: "Templates",
  learning: "Learning",
  deployNow: "Deploy Now",
  documentation: "Documentation",
} as const;

const LINKS = {
  templates:
    "https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app",
  learning:
    "https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app",
  deploy:
    "https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app",
  docs:
    "https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app",
} as const;

const IMAGES = {
  nextLogo: {
    src: "/next.svg",
    alt: "Next.js logo",
    width: 100,
    height: 20,
    sizes: "100px",
  },
  vercelLogo: {
    src: "/vercel.svg",
    alt: "Vercel logomark",
    width: 16,
    height: 16,
    sizes: "16px",
  },
} as const;

// ================================
// Component
// ================================

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src={IMAGES.nextLogo.src}
          alt={IMAGES.nextLogo.alt}
          width={IMAGES.nextLogo.width}
          height={IMAGES.nextLogo.height}
          sizes={IMAGES.nextLogo.sizes}
          priority
        />

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            {COPY.title}
          </h1>

          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {COPY.descriptionPrefix}{" "}
            <Link
              href={LINKS.templates}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Vercel Templates in a new tab"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              {COPY.templates}
            </Link>{" "}
            or the{" "}
            <Link
              href={LINKS.learning}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Next.js Learning Center in a new tab"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              {COPY.learning}
            </Link>{" "}
            center.
          </p>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Link
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href={LINKS.deploy}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Vercel Deploy in a new tab"
          >
            <Image
              className="dark:invert"
              src={IMAGES.vercelLogo.src}
              alt={IMAGES.vercelLogo.alt}
              width={IMAGES.vercelLogo.width}
              height={IMAGES.vercelLogo.height}
              sizes={IMAGES.vercelLogo.sizes}
            />
            {COPY.deployNow}
          </Link>

          <Link
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href={LINKS.docs}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Next.js Documentation in a new tab"
          >
            {COPY.documentation}
          </Link>
        </div>
      </main>
    </div>
  );
}
