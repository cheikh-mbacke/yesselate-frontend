/**
 * Common Components Index
 * =======================
 * 
 * Export centralisé de tous les composants communs
 */

// Error Boundary
export { ErrorBoundary, useErrorHandler } from './ErrorBoundary';

// Toast System
export { ToastProvider, useToast } from './Toast';
export type { Toast, ToastType } from './Toast';

// Loading States
export {
  Spinner,
  LoadingOverlay,
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonList,
  SkeletonGrid,
  LoadingButton,
  LoadingCard,
  LoadingPage,
} from './LoadingStates';

// Empty States
export {
  EmptyState,
  EmptyList,
  EmptySearch,
  EmptyFilter,
  EmptyData,
  ErrorState,
  NotFound,
  EmptyFolder,
  NoPermissions,
  NoUsers,
  AllDone,
  EmptyCard,
} from './EmptyStates';

