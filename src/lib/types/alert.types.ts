/**
 * Standard Alert Types
 * ===================
 * Core type definitions for the alerts system
 * 
 * These types are the canonical definitions used across the application.
 */

export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertStatus = 'open' | 'in-progress' | 'blocked' | 'ack' | 'resolved';
export type AlertCategory =
  | 'overview'
  | 'critical'
  | 'warning'
  | 'sla'
  | 'blocked'
  | 'ack'
  | 'resolved'
  | 'history'
  | 'watchlist';

export interface AlertItem {
  id: string;
  title: string;
  description?: string;
  amount?: number;
  currency?: string;
  ageDays?: number;
  agency?: string;
  site?: string;
  owner?: string;
  domain: string;   // finance | project | procurement | ...
  entity?: string;  // milestone | lot | po | vendor | ...
  flow?: string;    // payment | recovery | ...
  flag?: string;    // missing-docs | overspend | ...
  severity: AlertSeverity;
  status: AlertStatus;
  sla?: 'ok' | 'at-risk' | 'breached';
  isWatched?: boolean;
}

