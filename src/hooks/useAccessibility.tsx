import { useEffect, useState } from 'react';

/**
 * Hook pour annoncer les messages aux lecteurs d'écran via une région ARIA live
 */
export function useAriaAnnounce() {
  const [message, setMessage] = useState('');
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite');

  const announce = (text: string, level: 'polite' | 'assertive' = 'polite') => {
    // Effacer d'abord pour forcer une nouvelle annonce même si le texte est identique
    setMessage('');
    setPoliteness(level);
    
    // Petit délai pour s'assurer que le changement est détecté
    setTimeout(() => {
      setMessage(text);
    }, 100);

    // Auto-clear après 5 secondes
    setTimeout(() => {
      setMessage('');
    }, 5000);
  };

  return { message, politeness, announce };
}

/**
 * Hook pour détecter le mode de navigation (clavier vs souris)
 * Utile pour adapter les styles de focus
 */
export function useKeyboardNavigation() {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
        document.documentElement.classList.add('keyboard-navigation');
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
      document.documentElement.classList.remove('keyboard-navigation');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isKeyboardUser;
}

/**
 * Hook pour gérer le piège de focus (focus trap) dans les modales
 * Empêche le focus de sortir de la modale
 */
export function useFocusTrap(isActive: boolean) {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = document.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      const focusableArray = Array.from(focusableElements);
      const firstFocusable = focusableArray[0];
      const lastFocusable = focusableArray[focusableArray.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab seul
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);
}

/**
 * Hook pour gérer les régions "skip to content"
 * Améliore la navigation au clavier pour les longues pages
 */
export function useSkipToContent() {
  const skipToMain = () => {
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
    if (mainContent instanceof HTMLElement) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const skipToNav = () => {
    const nav = document.querySelector('nav') || document.querySelector('[role="navigation"]');
    if (nav instanceof HTMLElement) {
      nav.focus();
      nav.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return { skipToMain, skipToNav };
}

/**
 * Composant VisuallyHidden pour cacher visuellement mais garder accessible
 * aux lecteurs d'écran
 */
export function VisuallyHidden({ children, as: Component = 'span', ...props }: {
  children: React.ReactNode;
  as?: 'span' | 'div' | 'p';
  [key: string]: any;
}) {
  return (
    <Component
      {...props}
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        borderWidth: 0,
      }}
    >
      {children}
    </Component>
  );
}

/**
 * Hook pour générer des IDs uniques et stables pour l'accessibilité
 * Utile pour relier les labels aux inputs (aria-labelledby, aria-describedby)
 */
let idCounter = 0;

export function useId(prefix = 'id') {
  const [id] = useState(() => {
    idCounter += 1;
    return `${prefix}-${idCounter}`;
  });

  return id;
}

