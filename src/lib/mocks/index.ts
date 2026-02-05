/**
 * Mock Data - Index
 * =================
 * 
 * Re-export from root lib/mocks for compatibility with @/lib/mocks path alias
 * Using a path that goes outside src/ directory
 */

// Re-export all mocks from root lib/mocks
export * from '../../../lib/mocks/index';

// Also export specific commonly used items for better tree-shaking
export { 
  mockEmployes, 
  mockEmployesStats,
  mockProjets,
  mockProjetsStats,
  mockClients,
  mockClientsStats
} from '../../../lib/mocks/index';

