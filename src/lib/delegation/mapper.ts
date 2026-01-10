/**
 * Mappers Prisma <-> Domain
 * =========================
 * 
 * Convertit les données Prisma en objets du domaine métier et vice-versa.
 */

import type {
  DelegationFull,
  DelegationPolicy,
  DelegationActor,
  DelegationEngagement,
  DelegationCategory,
  DelegationStatus,
  DelegationAction,
  DelegationActorRole,
  EngagementType,
  Criticality,
  ScopeMode,
  Currency,
  WeekDay,
  ReportingFrequency,
  RequiredDocument,
  Person,
} from './types';

// ============================================
// HELPERS
// ============================================

function parseJsonArray<T>(json: string | null | undefined): T[] | undefined {
  if (!json) return undefined;
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function toJsonString<T>(arr: T[] | undefined): string | null {
  if (!arr || arr.length === 0) return null;
  return JSON.stringify(arr);
}

function intToBool(val: number | null | undefined): boolean {
  return val === 1;
}

function boolToInt(val: boolean): number {
  return val ? 1 : 0;
}

// ============================================
// PRISMA -> DOMAIN
// ============================================

type PrismaDelegation = {
  id: string;
  code: string | null;
  title: string;
  category: string;
  status: string;
  object: string;
  description: string | null;
  legalBasis: string | null;
  
  grantorId: string;
  grantorName: string;
  grantorRole: string | null;
  grantorEmail: string | null;
  
  delegateId: string;
  delegateName: string;
  delegateRole: string | null;
  delegateEmail: string | null;
  delegatePhone: string | null;
  
  bureau: string;
  
  startsAt: Date;
  endsAt: Date;
  extendable: number;
  maxExtensions: number;
  extensionDays: number;
  
  projectScopeMode: string;
  projectScopeList: string | null;
  bureauScopeMode: string;
  bureauScopeList: string | null;
  supplierScopeMode: string;
  supplierScopeList: string | null;
  categoryScopeList: string | null;
  
  maxAmount: number | null;
  maxTotalAmount: number | null;
  currency: string;
  maxDailyOps: number | null;
  maxMonthlyOps: number | null;
  allowedHoursStart: number | null;
  allowedHoursEnd: number | null;
  allowedDays: string | null;
  
  requiresDualControl: number;
  requiresLegalReview: number;
  requiresFinanceCheck: number;
  requiresStepUpAuth: number;
  requiresDocumentation: number;
  
  usageCount: number;
  usageTotalAmount: number;
  lastUsedAt: Date | null;
  
  decisionHash: string | null;
  headHash: string | null;
  decisionRef: string | null;
  decisionDate: Date | null;
  
  createdAt: Date;
  updatedAt: Date;
  
  policies?: PrismaDelegationPolicy[];
  actors?: PrismaDelegationActor[];
  engagements?: PrismaDelegationEngagement[];
};

type PrismaDelegationPolicy = {
  id: string;
  action: string;
  maxAmount: number | null;
  currency: string;
  allowedProjects: string | null;
  allowedBureaux: string | null;
  allowedSuppliers: string | null;
  excludedSuppliers: string | null;
  allowedCategories: string | null;
  requiresDualControl: number;
  requiresLegalReview: number;
  requiresFinanceCheck: number;
  requiresStepUpAuth: number;
  stepUpThreshold: number | null;
  enabled: number;
};

type PrismaDelegationActor = {
  id: string;
  userId: string;
  userName: string;
  userRole: string | null;
  userEmail: string | null;
  roleType: string;
  required: number;
  canApprove: number;
  canRevoke: number;
  mustBeNotified: number;
  notes: string | null;
};

type PrismaDelegationEngagement = {
  id: string;
  engagementType: string;
  title: string;
  description: string;
  criticality: string;
  requiredDocs: string | null;
  frequency: string | null;
  enabled: number;
};

export function mapPrismaPolicy(p: PrismaDelegationPolicy): DelegationPolicy {
  return {
    id: p.id,
    action: p.action as DelegationAction,
    maxAmount: p.maxAmount ?? undefined,
    currency: (p.currency || 'XOF') as Currency,
    allowedProjects: parseJsonArray<string>(p.allowedProjects),
    allowedBureaux: parseJsonArray<string>(p.allowedBureaux),
    allowedSuppliers: parseJsonArray<string>(p.allowedSuppliers),
    excludedSuppliers: parseJsonArray<string>(p.excludedSuppliers),
    allowedCategories: parseJsonArray<string>(p.allowedCategories),
    requiresDualControl: intToBool(p.requiresDualControl),
    requiresLegalReview: intToBool(p.requiresLegalReview),
    requiresFinanceCheck: intToBool(p.requiresFinanceCheck),
    requiresStepUpAuth: intToBool(p.requiresStepUpAuth),
    stepUpThreshold: p.stepUpThreshold ?? undefined,
    enabled: intToBool(p.enabled),
  };
}

export function mapPrismaActor(a: PrismaDelegationActor): DelegationActor {
  return {
    id: a.id,
    user: {
      id: a.userId,
      name: a.userName,
      role: a.userRole ?? undefined,
      email: a.userEmail ?? undefined,
    },
    roleType: a.roleType as DelegationActorRole,
    required: intToBool(a.required),
    canApprove: intToBool(a.canApprove),
    canRevoke: intToBool(a.canRevoke),
    mustBeNotified: intToBool(a.mustBeNotified),
    notes: a.notes ?? undefined,
  };
}

export function mapPrismaEngagement(e: PrismaDelegationEngagement): DelegationEngagement {
  return {
    id: e.id,
    engagementType: e.engagementType as EngagementType,
    title: e.title,
    description: e.description,
    criticality: (e.criticality || 'MEDIUM') as Criticality,
    requiredDocs: parseJsonArray<RequiredDocument>(e.requiredDocs),
    frequency: e.frequency as ReportingFrequency | undefined,
    enabled: intToBool(e.enabled),
  };
}

export function mapPrismaToDelegation(d: PrismaDelegation): DelegationFull {
  return {
    id: d.id,
    code: d.code ?? undefined,
    title: d.title,
    category: d.category as DelegationCategory,
    status: d.status as DelegationStatus,
    object: d.object,
    description: d.description ?? undefined,
    legalBasis: d.legalBasis ?? undefined,
    
    grantor: {
      id: d.grantorId,
      name: d.grantorName,
      role: d.grantorRole ?? undefined,
      email: d.grantorEmail ?? undefined,
    },
    
    delegate: {
      id: d.delegateId,
      name: d.delegateName,
      role: d.delegateRole ?? undefined,
      email: d.delegateEmail ?? undefined,
      phone: d.delegatePhone ?? undefined,
    },
    
    bureau: d.bureau,
    
    startsAt: d.startsAt,
    endsAt: d.endsAt,
    extendable: intToBool(d.extendable),
    maxExtensions: d.maxExtensions,
    extensionDays: d.extensionDays,
    
    projectScopeMode: (d.projectScopeMode || 'ALL') as ScopeMode,
    projectScopeList: parseJsonArray<string>(d.projectScopeList),
    bureauScopeMode: (d.bureauScopeMode || 'ALL') as ScopeMode,
    bureauScopeList: parseJsonArray<string>(d.bureauScopeList),
    supplierScopeMode: (d.supplierScopeMode || 'ALL') as ScopeMode,
    supplierScopeList: parseJsonArray<string>(d.supplierScopeList),
    categoryScopeList: parseJsonArray<string>(d.categoryScopeList),
    
    maxAmount: d.maxAmount ?? undefined,
    maxTotalAmount: d.maxTotalAmount ?? undefined,
    currency: (d.currency || 'XOF') as Currency,
    maxDailyOps: d.maxDailyOps ?? undefined,
    maxMonthlyOps: d.maxMonthlyOps ?? undefined,
    allowedHoursStart: d.allowedHoursStart ?? undefined,
    allowedHoursEnd: d.allowedHoursEnd ?? undefined,
    allowedDays: parseJsonArray<WeekDay>(d.allowedDays),
    
    requiresDualControl: intToBool(d.requiresDualControl),
    requiresLegalReview: intToBool(d.requiresLegalReview),
    requiresFinanceCheck: intToBool(d.requiresFinanceCheck),
    requiresStepUpAuth: intToBool(d.requiresStepUpAuth),
    requiresDocumentation: intToBool(d.requiresDocumentation),
    
    usageCount: d.usageCount,
    usageTotalAmount: d.usageTotalAmount,
    lastUsedAt: d.lastUsedAt ?? undefined,
    
    decisionHash: d.decisionHash ?? undefined,
    headHash: d.headHash ?? undefined,
    decisionRef: d.decisionRef ?? undefined,
    decisionDate: d.decisionDate ?? undefined,
    
    policies: d.policies?.map(mapPrismaPolicy) ?? [],
    actors: d.actors?.map(mapPrismaActor) ?? [],
    engagements: d.engagements?.map(mapPrismaEngagement) ?? [],
    
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

// ============================================
// DOMAIN -> PRISMA (pour création/mise à jour)
// ============================================

export function mapDelegationToPrisma(d: Partial<DelegationFull>) {
  const result: Record<string, unknown> = {};
  
  if (d.id !== undefined) result.id = d.id;
  if (d.code !== undefined) result.code = d.code || null;
  if (d.title !== undefined) result.title = d.title;
  if (d.category !== undefined) result.category = d.category;
  if (d.status !== undefined) result.status = d.status;
  if (d.object !== undefined) result.object = d.object;
  if (d.description !== undefined) result.description = d.description || null;
  if (d.legalBasis !== undefined) result.legalBasis = d.legalBasis || null;
  
  if (d.grantor !== undefined) {
    result.grantorId = d.grantor.id;
    result.grantorName = d.grantor.name;
    result.grantorRole = d.grantor.role || null;
    result.grantorEmail = d.grantor.email || null;
  }
  
  if (d.delegate !== undefined) {
    result.delegateId = d.delegate.id;
    result.delegateName = d.delegate.name;
    result.delegateRole = d.delegate.role || null;
    result.delegateEmail = d.delegate.email || null;
    result.delegatePhone = d.delegate.phone || null;
  }
  
  if (d.bureau !== undefined) result.bureau = d.bureau;
  
  if (d.startsAt !== undefined) result.startsAt = d.startsAt;
  if (d.endsAt !== undefined) result.endsAt = d.endsAt;
  if (d.extendable !== undefined) result.extendable = boolToInt(d.extendable);
  if (d.maxExtensions !== undefined) result.maxExtensions = d.maxExtensions;
  if (d.extensionDays !== undefined) result.extensionDays = d.extensionDays;
  
  if (d.projectScopeMode !== undefined) result.projectScopeMode = d.projectScopeMode;
  if (d.projectScopeList !== undefined) result.projectScopeList = toJsonString(d.projectScopeList);
  if (d.bureauScopeMode !== undefined) result.bureauScopeMode = d.bureauScopeMode;
  if (d.bureauScopeList !== undefined) result.bureauScopeList = toJsonString(d.bureauScopeList);
  if (d.supplierScopeMode !== undefined) result.supplierScopeMode = d.supplierScopeMode;
  if (d.supplierScopeList !== undefined) result.supplierScopeList = toJsonString(d.supplierScopeList);
  if (d.categoryScopeList !== undefined) result.categoryScopeList = toJsonString(d.categoryScopeList);
  
  if (d.maxAmount !== undefined) result.maxAmount = d.maxAmount ?? null;
  if (d.maxTotalAmount !== undefined) result.maxTotalAmount = d.maxTotalAmount ?? null;
  if (d.currency !== undefined) result.currency = d.currency;
  if (d.maxDailyOps !== undefined) result.maxDailyOps = d.maxDailyOps ?? null;
  if (d.maxMonthlyOps !== undefined) result.maxMonthlyOps = d.maxMonthlyOps ?? null;
  if (d.allowedHoursStart !== undefined) result.allowedHoursStart = d.allowedHoursStart ?? null;
  if (d.allowedHoursEnd !== undefined) result.allowedHoursEnd = d.allowedHoursEnd ?? null;
  if (d.allowedDays !== undefined) result.allowedDays = toJsonString(d.allowedDays);
  
  if (d.requiresDualControl !== undefined) result.requiresDualControl = boolToInt(d.requiresDualControl);
  if (d.requiresLegalReview !== undefined) result.requiresLegalReview = boolToInt(d.requiresLegalReview);
  if (d.requiresFinanceCheck !== undefined) result.requiresFinanceCheck = boolToInt(d.requiresFinanceCheck);
  if (d.requiresStepUpAuth !== undefined) result.requiresStepUpAuth = boolToInt(d.requiresStepUpAuth);
  if (d.requiresDocumentation !== undefined) result.requiresDocumentation = boolToInt(d.requiresDocumentation);
  
  return result;
}

export function mapPolicyToPrisma(p: Partial<DelegationPolicy>, delegationId: string) {
  const result: Record<string, unknown> = {
    delegationId,
  };
  
  if (p.id !== undefined) result.id = p.id;
  if (p.action !== undefined) result.action = p.action;
  if (p.maxAmount !== undefined) result.maxAmount = p.maxAmount ?? null;
  if (p.currency !== undefined) result.currency = p.currency;
  if (p.allowedProjects !== undefined) result.allowedProjects = toJsonString(p.allowedProjects);
  if (p.allowedBureaux !== undefined) result.allowedBureaux = toJsonString(p.allowedBureaux);
  if (p.allowedSuppliers !== undefined) result.allowedSuppliers = toJsonString(p.allowedSuppliers);
  if (p.excludedSuppliers !== undefined) result.excludedSuppliers = toJsonString(p.excludedSuppliers);
  if (p.allowedCategories !== undefined) result.allowedCategories = toJsonString(p.allowedCategories);
  if (p.requiresDualControl !== undefined) result.requiresDualControl = boolToInt(p.requiresDualControl);
  if (p.requiresLegalReview !== undefined) result.requiresLegalReview = boolToInt(p.requiresLegalReview);
  if (p.requiresFinanceCheck !== undefined) result.requiresFinanceCheck = boolToInt(p.requiresFinanceCheck);
  if (p.requiresStepUpAuth !== undefined) result.requiresStepUpAuth = boolToInt(p.requiresStepUpAuth);
  if (p.stepUpThreshold !== undefined) result.stepUpThreshold = p.stepUpThreshold ?? null;
  if (p.enabled !== undefined) result.enabled = boolToInt(p.enabled);
  
  return result;
}

