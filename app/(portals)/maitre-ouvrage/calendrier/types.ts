// Types partagés pour le module calendrier

export type Priority = 'basse' | 'normale' | 'haute' | 'critique';
export type Severity = 'info' | 'warning' | 'error' | 'success';
export type Status = 'pending' | 'open' | 'in_progress' | 'completed' | 'cancelled' | 'blocked';
export type CalendarKind = 'meeting' | 'deadline' | 'milestone' | 'event' | 'task' | 'reminder';

export type CalendarItem = {
  id: string;
  title: string;
  description?: string;
  kind: CalendarKind;
  bureau?: string;
  assignees?: { id: string; name: string }[];
  start: Date | string;
  end?: Date | string;
  allDay?: boolean;
  priority: Priority;
  severity?: Severity;
  status: Status;
  project?: string;
  recurrence?: string;
  notation?: number;
  notes?: string;
  tags?: string[];
  color?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CalendarStats = {
  total: number;
  today: number;
  thisWeek: number;
  overdueSLA: number;
  conflicts: number;
  completed: number;
  ts: string;
};

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'quarterly';

export type EventFormData = {
  title: string;
  description: string;
  kind: CalendarKind;
  bureau?: string;
  assignees: { id: string; name: string }[];
  start: Date;
  end: Date;
  priority: Priority;
  severity: Severity;
  status: Status;
  project?: string;
  recurrence: RecurrenceType;
  recurrenceEnd?: Date;
  notation?: number;
  notes?: string;
};

