/**
 * Service client pour la gestion des tâches (DemandTask)
 */

export type Task = {
  id: string;
  demandId: string;
  title: string;
  description?: string | null;
  status: string; // "OPEN" | "IN_PROGRESS" | "DONE" | "BLOCKED"
  dueAt?: string | null;
  assignedToId?: string | null;
  assignedToName?: string | null;
  createdAt: string;
  completedAt?: string | null;
};

export type AddTaskPayload = {
  title: string;
  description?: string;
  status?: string;
  dueAt?: string;
  assignedToId?: string;
  assignedToName?: string;
};

export type UpdateTaskPayload = {
  title?: string;
  description?: string | null;
  status?: string;
  dueAt?: string | null;
  assignedToId?: string | null;
  assignedToName?: string | null;
  completedAt?: string | null;
};

/**
 * Liste toutes les tâches d'une demande
 */
export async function listTasks(demandId: string): Promise<Task[]> {
  const res = await fetch(`/api/demands/${demandId}/tasks`);
  if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.status}`);
  const data = await res.json();
  return data.rows;
}

/**
 * Ajoute une tâche à une demande
 */
export async function addTask(demandId: string, payload: AddTaskPayload): Promise<Task> {
  const res = await fetch(`/api/demands/${demandId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }
  const data = await res.json();
  return data.row;
}

/**
 * Met à jour une tâche
 */
export async function updateTask(
  demandId: string,
  taskId: string,
  payload: UpdateTaskPayload
): Promise<Task> {
  const res = await fetch(`/api/demands/${demandId}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }
  const data = await res.json();
  return data.row;
}

/**
 * Supprime une tâche
 */
export async function removeTask(demandId: string, taskId: string): Promise<boolean> {
  const res = await fetch(`/api/demands/${demandId}/tasks/${taskId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }
  return true;
}

