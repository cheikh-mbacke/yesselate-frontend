// Version française des services API pour compatibilité
export { 
  listDemands, 
  getDemand, 
  transitionDemand, 
  batchTransition,
  getStats, 
  exportDemands 
} from './demands';

export type { 
  Queue, 
  TransitionPayload, 
  BatchTransitionResult 
} from './demands';
