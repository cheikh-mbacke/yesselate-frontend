/**
 * ====================================================================
 * SERVICE: Absences API
 * Service complet pour la gestion des absences
 * ====================================================================
 */

import type {
  Absence,
  AbsenceFilter,
  AbsenceCreateData,
  AbsenceUpdateData,
  AbsenceStats,
  CalendarEvent,
  Conflict,
  PaginatedResponse,
} from '@/lib/types/substitution.types';

class AbsencesApiService {
  private baseUrl = '/api/bmo/absences';

  // ================================
  // CRUD Operations
  // ================================

  async getAll(
    filter?: AbsenceFilter,
    sort = 'startDate',
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<Absence>> {
    await this.delay(300);
    
    const { mockAbsences } = await import('@/lib/data/absences-mock-data');
    let data = [...mockAbsences];

    // Apply filters
    if (filter) {
      if (filter.type) {
        data = data.filter(a => a.type === filter.type);
      }
      if (filter.status) {
        data = data.filter(a => a.status === filter.status);
      }
      if (filter.bureau) {
        data = data.filter(a => a.employee.bureau === filter.bureau);
      }
      if (filter.employeeId) {
        data = data.filter(a => a.employeeId === filter.employeeId);
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        data = data.filter(a =>
          a.reason.toLowerCase().includes(q) ||
          a.employee.name.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q)
        );
      }
      if (filter.dateFrom) {
        data = data.filter(a => new Date(a.startDate) >= new Date(filter.dateFrom!));
      }
      if (filter.dateTo) {
        data = data.filter(a => new Date(a.endDate) <= new Date(filter.dateTo!));
      }
    }

    // Apply sort
    data.sort((a, b) => {
      if (sort === 'startDate') {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
      return 0;
    });

    // Pagination
    const start = (page - 1) * pageSize;
    const paginatedData = data.slice(start, start + pageSize);

    return {
      data: paginatedData,
      total: data.length,
      page,
      pageSize,
      totalPages: Math.ceil(data.length / pageSize),
    };
  }

  async getById(id: string): Promise<Absence> {
    await this.delay(200);
    const { mockAbsences } = await import('@/lib/data/absences-mock-data');
    const absence = mockAbsences.find(a => a.id === id);
    if (!absence) throw new Error(`Absence ${id} not found`);
    return absence;
  }

  async create(data: AbsenceCreateData): Promise<Absence> {
    await this.delay(500);
    
    const { mockEmployees } = await import('@/lib/data/employees-mock-data');
    const employee = mockEmployees.find(e => e.id === data.employeeId);
    if (!employee) throw new Error('Employee not found');

    const newAbsence: Absence = {
      id: `ABS-${Date.now()}`,
      employeeId: data.employeeId,
      employee,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      status: 'pending',
      reason: data.reason,
      description: data.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('[API] Absence created:', newAbsence);
    return newAbsence;
  }

  async update(id: string, data: AbsenceUpdateData): Promise<Absence> {
    await this.delay(400);
    const absence = await this.getById(id);
    
    const updated: Absence = {
      ...absence,
      ...data,
      updatedAt: new Date(),
    };

    console.log('[API] Absence updated:', updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.delay(300);
    console.log('[API] Absence deleted:', id);
  }

  // ================================
  // Workflow Actions
  // ================================

  async approve(id: string, approverId: string): Promise<Absence> {
    await this.delay(400);
    const absence = await this.getById(id);
    
    const approved: Absence = {
      ...absence,
      status: 'approved',
      approvedBy: approverId,
      approvedAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('[API] Absence approved:', approved);
    return approved;
  }

  async reject(id: string, reason: string): Promise<Absence> {
    await this.delay(400);
    const absence = await this.getById(id);
    
    const rejected: Absence = {
      ...absence,
      status: 'rejected',
      updatedAt: new Date(),
    };

    console.log('[API] Absence rejected:', rejected, 'Reason:', reason);
    return rejected;
  }

  // ================================
  // Calendar & Conflicts
  // ================================

  async getCalendar(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    await this.delay(300);
    const { mockAbsences } = await import('@/lib/data/absences-mock-data');
    
    return mockAbsences
      .filter(a => {
        const absStart = new Date(a.startDate);
        const absEnd = new Date(a.endDate);
        return absStart <= endDate && absEnd >= startDate;
      })
      .map(a => ({
        id: a.id,
        type: 'absence' as const,
        title: `${a.employee.name} - ${this.getTypeLabel(a.type)}`,
        start: a.startDate,
        end: a.endDate,
        employee: a.employee,
        color: this.getColorForType(a.type),
        allDay: true,
        data: a,
      }));
  }

  async getConflicts(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Conflict[]> {
    await this.delay(200);
    const { detectAbsenceConflicts } = await import('@/lib/data/absences-mock-data');
    
    const allConflicts = detectAbsenceConflicts();
    
    // Filter conflicts for this employee and date range
    return allConflicts.filter(conflict => {
      const conflictStart = new Date(conflict.startDate);
      const conflictEnd = new Date(conflict.endDate);
      return conflictStart <= endDate && conflictEnd >= startDate;
    });
  }

  // ================================
  // Statistics
  // ================================

  async getStats(filter?: AbsenceFilter): Promise<AbsenceStats> {
    await this.delay(300);
    const { data } = await this.getAll(filter, 'startDate', 1, 1000);

    const byType = data.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = data.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const durations = data.map(a => {
      const days = Math.ceil(
        (new Date(a.endDate).getTime() - new Date(a.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
      );
      return days;
    });

    const averageDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;

    const today = new Date();
    const currentAbsences = data.filter(a =>
      a.status === 'approved' &&
      new Date(a.startDate) <= today &&
      new Date(a.endDate) >= today
    ).length;

    const upcomingAbsences = data.filter(a =>
      new Date(a.startDate) > today
    ).length;

    return {
      total: data.length,
      byType,
      byStatus,
      averageDuration: Math.round(averageDuration * 10) / 10,
      currentAbsences,
      upcomingAbsences,
    };
  }

  // ================================
  // Helpers
  // ================================

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getColorForType(type: string): string {
    const colors = {
      maladie: '#ef4444',
      conge: '#3b82f6',
      formation: '#8b5cf6',
      autre: '#64748b',
    };
    return colors[type as keyof typeof colors] || colors.autre;
  }

  getTypeLabel(type: string): string {
    const labels = {
      maladie: 'Maladie',
      conge: 'Congés',
      formation: 'Formation',
      autre: 'Autre',
    };
    return labels[type as keyof typeof labels] || type;
  }

  getStatusLabel(status: string): string {
    const labels = {
      pending: 'En attente',
      approved: 'Approuvée',
      rejected: 'Rejetée',
    };
    return labels[status as keyof typeof labels] || status;
  }
}

export const absencesApiService = new AbsencesApiService();
export type { AbsencesApiService };

