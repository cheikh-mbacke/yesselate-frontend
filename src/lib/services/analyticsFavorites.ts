/**
 * Système de favoris pour Analytics
 * Permet aux utilisateurs de sauvegarder leurs KPIs, rapports et vues préférées
 */

// ============================================
// TYPES
// ============================================

export type FavoriteType = 'kpi' | 'report' | 'dashboard' | 'view' | 'filter';

export interface Favorite {
  id: string;
  userId: string;
  type: FavoriteType;
  resourceId: string;
  resourceName: string;
  resourceData?: Record<string, unknown>;
  order: number;
  tags?: string[];
  notes?: string;
  createdAt: string;
  lastAccessedAt?: string;
}

export interface FavoriteGroup {
  id: string;
  userId: string;
  name: string;
  description?: string;
  favorites: string[]; // IDs de favoris
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// SERVICE DE FAVORIS
// ============================================

export class AnalyticsFavoritesService {
  private static instance: AnalyticsFavoritesService;
  private favorites: Map<string, Favorite[]> = new Map();
  private groups: Map<string, FavoriteGroup[]> = new Map();

  public static getInstance(): AnalyticsFavoritesService {
    if (!this.instance) {
      this.instance = new AnalyticsFavoritesService();
    }
    return this.instance;
  }

  /**
   * Ajouter un favori
   */
  async addFavorite(params: {
    userId: string;
    type: FavoriteType;
    resourceId: string;
    resourceName: string;
    resourceData?: Record<string, unknown>;
    tags?: string[];
    notes?: string;
  }): Promise<Favorite> {
    const userFavorites = this.favorites.get(params.userId) || [];
    
    // Vérifier si déjà en favoris
    const existing = userFavorites.find(
      (f) => f.resourceId === params.resourceId && f.type === params.type
    );
    if (existing) {
      throw new Error('Déjà dans les favoris');
    }

    const favorite: Favorite = {
      id: this.generateId(),
      userId: params.userId,
      type: params.type,
      resourceId: params.resourceId,
      resourceName: params.resourceName,
      resourceData: params.resourceData,
      order: userFavorites.length,
      tags: params.tags,
      notes: params.notes,
      createdAt: new Date().toISOString(),
    };

    userFavorites.push(favorite);
    this.favorites.set(params.userId, userFavorites);

    await this.persistFavorite(favorite);

    return favorite;
  }

  /**
   * Retirer un favori
   */
  async removeFavorite(userId: string, favoriteId: string): Promise<void> {
    const userFavorites = this.favorites.get(userId) || [];
    const filtered = userFavorites.filter((f) => f.id !== favoriteId);
    this.favorites.set(userId, filtered);

    await this.deleteFavorite(favoriteId);
  }

  /**
   * Obtenir tous les favoris d'un utilisateur
   */
  async getFavorites(userId: string, type?: FavoriteType): Promise<Favorite[]> {
    const userFavorites = this.favorites.get(userId) || [];
    
    if (type) {
      return userFavorites.filter((f) => f.type === type);
    }

    return userFavorites.sort((a, b) => a.order - b.order);
  }

  /**
   * Vérifier si une ressource est en favoris
   */
  async isFavorite(userId: string, type: FavoriteType, resourceId: string): Promise<boolean> {
    const userFavorites = this.favorites.get(userId) || [];
    return userFavorites.some((f) => f.type === type && f.resourceId === resourceId);
  }

  /**
   * Mettre à jour un favori
   */
  async updateFavorite(
    userId: string,
    favoriteId: string,
    updates: Partial<Pick<Favorite, 'resourceName' | 'tags' | 'notes' | 'order'>>
  ): Promise<Favorite> {
    const userFavorites = this.favorites.get(userId) || [];
    const favorite = userFavorites.find((f) => f.id === favoriteId);

    if (!favorite) {
      throw new Error('Favori non trouvé');
    }

    Object.assign(favorite, updates);

    await this.persistFavorite(favorite);

    return favorite;
  }

  /**
   * Mettre à jour la date de dernier accès
   */
  async updateLastAccessed(userId: string, favoriteId: string): Promise<void> {
    const userFavorites = this.favorites.get(userId) || [];
    const favorite = userFavorites.find((f) => f.id === favoriteId);

    if (favorite) {
      favorite.lastAccessedAt = new Date().toISOString();
      await this.persistFavorite(favorite);
    }
  }

  /**
   * Réorganiser les favoris
   */
  async reorderFavorites(userId: string, favoriteIds: string[]): Promise<void> {
    const userFavorites = this.favorites.get(userId) || [];

    favoriteIds.forEach((id, index) => {
      const favorite = userFavorites.find((f) => f.id === id);
      if (favorite) {
        favorite.order = index;
      }
    });

    this.favorites.set(userId, userFavorites);

    // Persister tous
    await Promise.all(userFavorites.map((f) => this.persistFavorite(f)));
  }

  /**
   * Créer un groupe de favoris
   */
  async createGroup(params: {
    userId: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
  }): Promise<FavoriteGroup> {
    const userGroups = this.groups.get(params.userId) || [];

    const group: FavoriteGroup = {
      id: this.generateId(),
      userId: params.userId,
      name: params.name,
      description: params.description,
      favorites: [],
      color: params.color,
      icon: params.icon,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    userGroups.push(group);
    this.groups.set(params.userId, userGroups);

    await this.persistGroup(group);

    return group;
  }

  /**
   * Ajouter un favori à un groupe
   */
  async addToGroup(userId: string, groupId: string, favoriteId: string): Promise<void> {
    const userGroups = this.groups.get(userId) || [];
    const group = userGroups.find((g) => g.id === groupId);

    if (!group) {
      throw new Error('Groupe non trouvé');
    }

    if (!group.favorites.includes(favoriteId)) {
      group.favorites.push(favoriteId);
      group.updatedAt = new Date().toISOString();
      await this.persistGroup(group);
    }
  }

  /**
   * Retirer un favori d'un groupe
   */
  async removeFromGroup(userId: string, groupId: string, favoriteId: string): Promise<void> {
    const userGroups = this.groups.get(userId) || [];
    const group = userGroups.find((g) => g.id === groupId);

    if (group) {
      group.favorites = group.favorites.filter((id) => id !== favoriteId);
      group.updatedAt = new Date().toISOString();
      await this.persistGroup(group);
    }
  }

  /**
   * Obtenir tous les groupes
   */
  async getGroups(userId: string): Promise<FavoriteGroup[]> {
    return this.groups.get(userId) || [];
  }

  /**
   * Obtenir les favoris d'un groupe
   */
  async getGroupFavorites(userId: string, groupId: string): Promise<Favorite[]> {
    const userGroups = this.groups.get(userId) || [];
    const group = userGroups.find((g) => g.id === groupId);

    if (!group) {
      return [];
    }

    const userFavorites = this.favorites.get(userId) || [];
    return userFavorites.filter((f) => group.favorites.includes(f.id));
  }

  /**
   * Supprimer un groupe
   */
  async deleteGroup(userId: string, groupId: string): Promise<void> {
    const userGroups = this.groups.get(userId) || [];
    const filtered = userGroups.filter((g) => g.id !== groupId);
    this.groups.set(userId, filtered);

    await this.deleteGroupPersisted(groupId);
  }

  /**
   * Rechercher dans les favoris
   */
  async searchFavorites(userId: string, query: string): Promise<Favorite[]> {
    const userFavorites = this.favorites.get(userId) || [];
    const lowerQuery = query.toLowerCase();

    return userFavorites.filter((f) => {
      const nameMatch = f.resourceName.toLowerCase().includes(lowerQuery);
      const tagsMatch = f.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery));
      const notesMatch = f.notes?.toLowerCase().includes(lowerQuery);

      return nameMatch || tagsMatch || notesMatch;
    });
  }

  /**
   * Obtenir les favoris récemment accédés
   */
  async getRecentlyAccessed(userId: string, limit: number = 10): Promise<Favorite[]> {
    const userFavorites = this.favorites.get(userId) || [];

    return userFavorites
      .filter((f) => f.lastAccessedAt)
      .sort((a, b) => {
        const dateA = new Date(a.lastAccessedAt!).getTime();
        const dateB = new Date(b.lastAccessedAt!).getTime();
        return dateB - dateA;
      })
      .slice(0, limit);
  }

  /**
   * Obtenir les statistiques des favoris
   */
  async getStatistics(userId: string): Promise<{
    total: number;
    byType: Record<FavoriteType, number>;
    totalGroups: number;
    mostUsed: Favorite[];
  }> {
    const userFavorites = this.favorites.get(userId) || [];
    const userGroups = this.groups.get(userId) || [];

    const byType: Record<string, number> = {};
    userFavorites.forEach((f) => {
      byType[f.type] = (byType[f.type] || 0) + 1;
    });

    const mostUsed = userFavorites
      .filter((f) => f.lastAccessedAt)
      .sort((a, b) => {
        const dateA = new Date(a.lastAccessedAt!).getTime();
        const dateB = new Date(b.lastAccessedAt!).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);

    return {
      total: userFavorites.length,
      byType: byType as Record<FavoriteType, number>,
      totalGroups: userGroups.length,
      mostUsed,
    };
  }

  /**
   * Générer un ID unique
   */
  private generateId(): string {
    return `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Persister un favori
   */
  private async persistFavorite(favorite: Favorite): Promise<void> {
    // TODO: Implémenter la persistance en DB
    console.log('[Favorites] Favorite persisted:', favorite.id);
  }

  /**
   * Supprimer un favori
   */
  private async deleteFavorite(favoriteId: string): Promise<void> {
    // TODO: Implémenter la suppression en DB
    console.log('[Favorites] Favorite deleted:', favoriteId);
  }

  /**
   * Persister un groupe
   */
  private async persistGroup(group: FavoriteGroup): Promise<void> {
    // TODO: Implémenter la persistance en DB
    console.log('[Favorites] Group persisted:', group.id);
  }

  /**
   * Supprimer un groupe
   */
  private async deleteGroupPersisted(groupId: string): Promise<void> {
    // TODO: Implémenter la suppression en DB
    console.log('[Favorites] Group deleted:', groupId);
  }
}

// ============================================
// EXPORT SINGLETON
// ============================================

export const analyticsFavorites = AnalyticsFavoritesService.getInstance();

// ============================================
// HOOKS
// ============================================

/**
 * Hook pour gérer les favoris
 */
export function useAnalyticsFavorites(userId: string) {
  const service = AnalyticsFavoritesService.getInstance();

  return {
    addFavorite: (params: Omit<Parameters<typeof service.addFavorite>[0], 'userId'>) =>
      service.addFavorite({ ...params, userId }),

    removeFavorite: (favoriteId: string) => service.removeFavorite(userId, favoriteId),

    getFavorites: (type?: FavoriteType) => service.getFavorites(userId, type),

    isFavorite: (type: FavoriteType, resourceId: string) =>
      service.isFavorite(userId, type, resourceId),

    updateFavorite: (favoriteId: string, updates: Parameters<typeof service.updateFavorite>[2]) =>
      service.updateFavorite(userId, favoriteId, updates),

    updateLastAccessed: (favoriteId: string) => service.updateLastAccessed(userId, favoriteId),

    reorderFavorites: (favoriteIds: string[]) => service.reorderFavorites(userId, favoriteIds),

    createGroup: (params: Omit<Parameters<typeof service.createGroup>[0], 'userId'>) =>
      service.createGroup({ ...params, userId }),

    addToGroup: (groupId: string, favoriteId: string) =>
      service.addToGroup(userId, groupId, favoriteId),

    removeFromGroup: (groupId: string, favoriteId: string) =>
      service.removeFromGroup(userId, groupId, favoriteId),

    getGroups: () => service.getGroups(userId),

    getGroupFavorites: (groupId: string) => service.getGroupFavorites(userId, groupId),

    deleteGroup: (groupId: string) => service.deleteGroup(userId, groupId),

    searchFavorites: (query: string) => service.searchFavorites(userId, query),

    getRecentlyAccessed: (limit?: number) => service.getRecentlyAccessed(userId, limit),

    getStatistics: () => service.getStatistics(userId),
  };
}

