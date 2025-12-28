import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes publiques accessibles sans authentification
const publicRoutes = ["/", "/login", "/register"];

// Mapping des rôles vers leurs portails
const roleBasePaths: Record<string, string> = {
  client: "/client",
  architecte: "/architecte",
  technicien: "/technicien",
  "bureau-controle": "/bureau-controle",
  comptable: "/comptable",
  ouvrier: "/ouvrier",
  "maitre-ouvrage": "/maitre-ouvrage",
  juriste: "/juriste",
  dg: "/dg",
  admin: "/admin",
};

export function middleware(request: NextRequest) {
  // 🔓 AUTHENTIFICATION DÉSACTIVÉE TEMPORAIREMENT
  // Pour réactiver l'authentification, décommentez le code ci-dessous

  /*
  const { pathname } = request.nextUrl;

  // Récupérer le token et le rôle depuis les cookies
  const token = request.cookies.get(
    process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "nice-auth-token"
  )?.value;
  const userRole = request.cookies.get(
    process.env.NEXT_PUBLIC_ROLE_COOKIE_NAME || "user-role"
  )?.value;

  // Autoriser les routes publiques
  if (publicRoutes.includes(pathname)) {
    // Si déjà connecté, rediriger vers le portail approprié
    if (token && userRole && roleBasePaths[userRole]) {
      return NextResponse.redirect(
        new URL(roleBasePaths[userRole], request.url)
      );
    }
    return NextResponse.next();
  }

  // Bloquer l'accès aux routes protégées sans token
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Vérifier l'accès basé sur le rôle
  if (userRole && roleBasePaths[userRole]) {
    const authorizedPath = roleBasePaths[userRole];

    // Vérifier si l'utilisateur accède à son portail autorisé
    const isAccessingOwnPortal = pathname.startsWith(authorizedPath);

    if (!isAccessingOwnPortal) {
      // Vérifier si c'est un accès à un autre portail
      const isAccessingOtherPortal = Object.values(roleBasePaths).some((path) =>
        pathname.startsWith(path)
      );

      if (isAccessingOtherPortal) {
        // Rediriger vers son propre portail
        return NextResponse.redirect(new URL(authorizedPath, request.url));
      }
    }
  }
  */

  // Laisser passer toutes les requêtes sans vérification
  return NextResponse.next();
}

// Configuration du matcher pour exclure les fichiers statiques
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api|.*\\..*|icons|images).*)",
  ],
};
