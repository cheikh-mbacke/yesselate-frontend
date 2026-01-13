/**
 * Storage Utilities
 * Helpers pour localStorage, sessionStorage et cookies
 */

/**
 * LocalStorage avec expiration
 */
export class LocalStorageWithExpiry {
  /**
   * Définit une valeur avec expiration
   */
  static setItem(key: string, value: any, expiryInMinutes: number): void {
    if (typeof window === 'undefined') return;

    const now = new Date();
    const item = {
      value,
      expiry: now.getTime() + expiryInMinutes * 60 * 1000,
    };
    localStorage.setItem(key, JSON.stringify(item));
  }

  /**
   * Obtient une valeur (retourne null si expirée)
   */
  static getItem<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    try {
      const item = JSON.parse(itemStr);
      const now = new Date();

      if (now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }

      return item.value as T;
    } catch {
      return null;
    }
  }

  /**
   * Supprime un item
   */
  static removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }

  /**
   * Vérifie si un item existe et n'est pas expiré
   */
  static hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }
}

/**
 * SessionStorage avec expiration
 */
export class SessionStorageWithExpiry {
  /**
   * Définit une valeur avec expiration
   */
  static setItem(key: string, value: any, expiryInMinutes: number): void {
    if (typeof window === 'undefined') return;

    const now = new Date();
    const item = {
      value,
      expiry: now.getTime() + expiryInMinutes * 60 * 1000,
    };
    sessionStorage.setItem(key, JSON.stringify(item));
  }

  /**
   * Obtient une valeur (retourne null si expirée)
   */
  static getItem<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    const itemStr = sessionStorage.getItem(key);
    if (!itemStr) return null;

    try {
      const item = JSON.parse(itemStr);
      const now = new Date();

      if (now.getTime() > item.expiry) {
        sessionStorage.removeItem(key);
        return null;
      }

      return item.value as T;
    } catch {
      return null;
    }
  }

  /**
   * Supprime un item
   */
  static removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(key);
  }

  /**
   * Vérifie si un item existe et n'est pas expiré
   */
  static hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }
}

/**
 * Cookies utilities
 */
export class CookieStorage {
  /**
   * Définit un cookie
   */
  static setItem(
    key: string,
    value: string,
    options?: {
      expiresInDays?: number;
      path?: string;
      domain?: string;
      secure?: boolean;
      sameSite?: 'strict' | 'lax' | 'none';
    }
  ): void {
    if (typeof document === 'undefined') return;

    const {
      expiresInDays = 365,
      path = '/',
      domain,
      secure = false,
      sameSite = 'lax',
    } = options || {};

    let cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;

    if (expiresInDays) {
      const date = new Date();
      date.setTime(date.getTime() + expiresInDays * 24 * 60 * 60 * 1000);
      cookie += `; expires=${date.toUTCString()}`;
    }

    cookie += `; path=${path}`;

    if (domain) {
      cookie += `; domain=${domain}`;
    }

    if (secure) {
      cookie += '; secure';
    }

    cookie += `; SameSite=${sameSite}`;

    document.cookie = cookie;
  }

  /**
   * Obtient un cookie
   */
  static getItem(key: string): string | null {
    if (typeof document === 'undefined') return null;

    const name = `${encodeURIComponent(key)}=`;
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(name) === 0) {
        return decodeURIComponent(cookie.substring(name.length));
      }
    }

    return null;
  }

  /**
   * Supprime un cookie
   */
  static removeItem(key: string, path: string = '/'): void {
    if (typeof document === 'undefined') return;
    this.setItem(key, '', { expiresInDays: -1, path });
  }

  /**
   * Vérifie si un cookie existe
   */
  static hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }

  /**
   * Obtient tous les cookies
   */
  static getAll(): Record<string, string> {
    if (typeof document === 'undefined') return {};

    const cookies: Record<string, string> = {};
    document.cookie.split(';').forEach(cookie => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        cookies[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    });
    return cookies;
  }
}

/**
 * Storage wrapper générique
 */
export class StorageWrapper {
  constructor(
    private storage: Storage,
    private prefix: string = ''
  ) {}

  private getKey(key: string): string {
    return this.prefix ? `${this.prefix}:${key}` : key;
  }

  setItem<T>(key: string, value: T): void {
    try {
      this.storage.setItem(this.getKey(key), JSON.stringify(value));
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const item = this.storage.getItem(this.getKey(key));
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    this.storage.removeItem(this.getKey(key));
  }

  clear(): void {
    if (this.prefix) {
      const keys = Object.keys(this.storage);
      keys.forEach(key => {
        if (key.startsWith(`${this.prefix}:`)) {
          this.storage.removeItem(key);
        }
      });
    } else {
      this.storage.clear();
    }
  }

  getAllKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key) {
        if (this.prefix) {
          if (key.startsWith(`${this.prefix}:`)) {
            keys.push(key.substring(this.prefix.length + 1));
          }
        } else {
          keys.push(key);
        }
      }
    }
    return keys;
  }
}

