'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockEmployes } from '@/lib/mocks';
import type { User } from '@/lib/types';

// ============================================
// TYPES
// ============================================

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: User | null;
}

export function AuthProvider({ children, initialUser = null }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(true);

  // Initialiser l'utilisateur au chargement (depuis localStorage ou session)
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // En production: vérifier session/token
        const storedUser = localStorage.getItem('yesselate_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // Pour dev: utiliser un utilisateur mock par défaut
          const defaultUser = mockEmployes.find((e) => e.id === 'USR-001');
          if (defaultUser) {
            const user: User = {
              id: defaultUser.id,
              nom: defaultUser.nom,
              prenom: defaultUser.prenom,
              email: defaultUser.email,
              telephone: defaultUser.telephone,
              role: 'manager',
              avatar: defaultUser.avatar,
              bureauId: defaultUser.bureauId,
              isActive: defaultUser.statut === 'actif',
              createdAt: defaultUser.createdAt,
              updatedAt: defaultUser.updatedAt,
            };
            setUser(user);
            localStorage.setItem('yesselate_user', JSON.stringify(user));
          }
        }
      } catch (error) {
        console.error('Erreur initialisation auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void initializeAuth();
  }, []);

  /**
   * Connexion utilisateur
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // En production: appel API réel
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   body: JSON.stringify({ email, password }),
      // });
      // const data = await response.json();

      // Mock: simuler délai réseau
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock: trouver utilisateur par email
      const employe = mockEmployes.find((e) => e.email === email);

      if (employe && password === 'password') {
        // Mock: mot de passe accepté si "password"
        const user: User = {
          id: employe.id,
          nom: employe.nom,
          prenom: employe.prenom,
          email: employe.email,
          telephone: employe.telephone,
          role: employe.fonction.includes('Directeur') ? 'admin' : employe.fonction.includes('Chef') ? 'manager' : 'employee',
          avatar: employe.avatar,
          bureauId: employe.bureauId,
          isActive: employe.statut === 'actif',
          createdAt: employe.createdAt,
          updatedAt: employe.updatedAt,
        };

        setUser(user);
        localStorage.setItem('yesselate_user', JSON.stringify(user));
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Erreur login:', error);
      setIsLoading(false);
      return false;
    }
  };

  /**
   * Déconnexion utilisateur
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('yesselate_user');
    // En production: invalider token côté serveur
    // await fetch('/api/auth/logout', { method: 'POST' });
  };

  /**
   * Mettre à jour les infos utilisateur
   */
  const updateUser = (updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() };
    setUser(updatedUser);
    localStorage.setItem('yesselate_user', JSON.stringify(updatedUser));

    // En production: mettre à jour côté serveur
    // await fetch(`/api/users/${user.id}`, {
    //   method: 'PATCH',
    //   body: JSON.stringify(updates),
    // });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// ============================================
// HOOKS SPÉCIALISÉS
// ============================================

/**
 * Hook pour vérifier si l'utilisateur a un rôle spécifique
 */
export function useRole(role: string | string[]): boolean {
  const { user } = useAuth();
  if (!user) return false;

  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(user.role);
}

/**
 * Hook pour vérifier si l'utilisateur est authentifié
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Rediriger vers login
      window.location.href = '/login';
    }
  }, [isAuthenticated, isLoading]);

  return { isAuthenticated, isLoading };
}

// ============================================
// COMPOSANT PROTECTED ROUTE
// ============================================

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string | string[];
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, requiredRole, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const hasRole = useRole(requiredRole || []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-200 mb-2">Accès non autorisé</h2>
            <p className="text-slate-400 mb-4">Vous devez être connecté pour accéder à cette page.</p>
            <a href="/login" className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600">
              Se connecter
            </a>
          </div>
        </div>
      )
    );
  }

  if (requiredRole && !hasRole) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-200 mb-2">Permission insuffisante</h2>
            <p className="text-slate-400">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

