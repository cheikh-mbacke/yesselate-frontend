/**
 * TESTS UNITAIRES - WEBHOOKS & CACHE
 * 
 * Tests pour :
 * - WebhookService
 * - CacheService
 * - RateLimiter
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { WebhookService } from '@/lib/services/webhookService';
import { CacheService } from '@/lib/services/cacheService';
import { RateLimiter } from '@/lib/middleware/rateLimiter';

// ============================================
// WEBHOOK SERVICE TESTS
// ============================================

describe('WebhookService', () => {
  let webhookService: WebhookService;

  beforeEach(() => {
    webhookService = WebhookService.getInstance();
  });

  describe('registerWebhook', () => {
    it('devrait enregistrer un webhook', async () => {
      const config = {
        url: 'https://example.com/webhook',
        secret: 'test-secret',
        events: ['calendar.event.created' as const],
        enabled: true,
      };

      const webhookId = await webhookService.registerWebhook(config);
      
      expect(webhookId).toBeDefined();
      expect(webhookId).toContain('webhook-');
    });
  });

  describe('send', () => {
    it('devrait envoyer un webhook', async () => {
      const event = 'calendar.event.created' as const;
      const data = {
        eventId: '123',
        title: 'Test Event',
      };

      await expect(
        webhookService.send(event, data)
      ).resolves.not.toThrow();
    });

    it('devrait gérer les webhooks non configurés', async () => {
      const event = 'calendar.event.deleted' as const;
      const data = { eventId: '456' };

      // Ne devrait pas throw même si pas de webhook configuré
      await expect(
        webhookService.send(event, data)
      ).resolves.not.toThrow();
    });
  });

  describe('signature', () => {
    it('devrait générer une signature HMAC valide', () => {
      const payload = {
        event: 'calendar.event.created' as const,
        timestamp: new Date().toISOString(),
        data: { test: true },
      };

      const secret = 'test-secret';
      
      // Accéder à la méthode privée via reflection pour tester
      const signature1 = (webhookService as any).generateSignature(payload, secret);
      const signature2 = (webhookService as any).generateSignature(payload, secret);

      expect(signature1).toBeDefined();
      expect(signature1).toBe(signature2); // Déterministe
      expect(signature1.length).toBe(64); // SHA-256 = 64 chars hex
    });
  });

  describe('testWebhook', () => {
    it('devrait tester un webhook', async () => {
      const result = await webhookService.testWebhook('webhook-123');
      
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });
  });
});

// ============================================
// CACHE SERVICE TESTS
// ============================================

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = CacheService.getInstance();
    // Vider cache avant chaque test
    cacheService.flush();
  });

  describe('set and get', () => {
    it('devrait stocker et récupérer une valeur', async () => {
      const key = 'test:key';
      const value = { data: 'test' };

      await cacheService.set(key, value);
      const retrieved = await cacheService.get(key);

      expect(retrieved).toEqual(value);
    });

    it('devrait respecter le TTL', async () => {
      const key = 'test:ttl';
      const value = 'test';

      await cacheService.set(key, value, { ttl: 1 }); // 1 seconde
      
      // Immédiatement : devrait exister
      let retrieved = await cacheService.get(key);
      expect(retrieved).toBe(value);

      // Après 1.5 secondes : devrait être expiré
      await new Promise(resolve => setTimeout(resolve, 1500));
      retrieved = await cacheService.get(key);
      expect(retrieved).toBeNull();
    });

    it('devrait retourner null pour clé inexistante', async () => {
      const value = await cacheService.get('non:existent');
      expect(value).toBeNull();
    });
  });

  describe('getOrSet', () => {
    it('devrait utiliser le cache si disponible', async () => {
      const key = 'test:getOrSet';
      const fn = vi.fn(async () => 'computed');

      // Premier appel : devrait exécuter fn
      const result1 = await cacheService.getOrSet(key, fn);
      expect(result1).toBe('computed');
      expect(fn).toHaveBeenCalledTimes(1);

      // Deuxième appel : devrait utiliser cache
      const result2 = await cacheService.getOrSet(key, fn);
      expect(result2).toBe('computed');
      expect(fn).toHaveBeenCalledTimes(1); // Pas appelé à nouveau
    });

    it('devrait calculer si cache expiré', async () => {
      const key = 'test:expired';
      let callCount = 0;
      const fn = async () => ++callCount;

      // Premier appel
      await cacheService.getOrSet(key, fn, { ttl: 1 });
      expect(callCount).toBe(1);

      // Attendre expiration
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Deuxième appel : devrait recalculer
      await cacheService.getOrSet(key, fn, { ttl: 1 });
      expect(callCount).toBe(2);
    });
  });

  describe('invalidate', () => {
    it('devrait supprimer une clé', async () => {
      const key = 'test:delete';
      await cacheService.set(key, 'value');
      
      await cacheService.del(key);
      
      const retrieved = await cacheService.get(key);
      expect(retrieved).toBeNull();
    });

    it('devrait invalider par tag', async () => {
      await cacheService.set('test:1', 'value1', { tags: ['calendar'] });
      await cacheService.set('test:2', 'value2', { tags: ['calendar'] });
      await cacheService.set('test:3', 'value3', { tags: ['delegation'] });

      const count = await cacheService.invalidateByTag('calendar');
      
      expect(count).toBe(2);
      expect(await cacheService.get('test:1')).toBeNull();
      expect(await cacheService.get('test:2')).toBeNull();
      expect(await cacheService.get('test:3')).toBe('value3');
    });

    it('devrait invalider par pattern', async () => {
      await cacheService.set('user:1:profile', 'data1');
      await cacheService.set('user:2:profile', 'data2');
      await cacheService.set('calendar:stats', 'data3');

      const count = await cacheService.invalidateByPattern('user:*');
      
      expect(count).toBeGreaterThanOrEqual(2);
      expect(await cacheService.get('calendar:stats')).toBe('data3');
    });
  });

  describe('flush', () => {
    it('devrait vider tout le cache', async () => {
      await cacheService.set('key1', 'value1');
      await cacheService.set('key2', 'value2');
      
      await cacheService.flush();
      
      expect(await cacheService.get('key1')).toBeNull();
      expect(await cacheService.get('key2')).toBeNull();
    });
  });

  describe('stats', () => {
    it('devrait retourner des statistiques', async () => {
      await cacheService.set('key1', 'value1');
      await cacheService.set('key2', 'value2');

      const stats = await cacheService.getStats();
      
      expect(stats).toBeDefined();
      expect(stats.keys).toBeGreaterThanOrEqual(2);
    });
  });
});

// ============================================
// RATE LIMITER TESTS
// ============================================

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = RateLimiter.getInstance();
  });

  describe('check', () => {
    it('devrait autoriser les requêtes sous la limite', async () => {
      const config = {
        windowMs: 60000,
        maxRequests: 5,
      };

      // Faire 3 requêtes
      for (let i = 0; i < 3; i++) {
        const result = await rateLimiter.check('test-key', config);
        expect(result.allowed).toBe(true);
        expect(result.info.remaining).toBe(5 - (i + 1));
      }
    });

    it('devrait bloquer après limite atteinte', async () => {
      const config = {
        windowMs: 60000,
        maxRequests: 3,
      };

      // Faire 3 requêtes (max)
      for (let i = 0; i < 3; i++) {
        await rateLimiter.check('test-limit', config);
      }

      // 4ème requête devrait être bloquée
      const result = await rateLimiter.check('test-limit', config);
      expect(result.allowed).toBe(false);
      expect(result.info.remaining).toBe(0);
      expect(result.info.retryAfter).toBeDefined();
    });

    it('devrait réinitialiser après expiration de la fenêtre', async () => {
      const config = {
        windowMs: 100, // 100ms
        maxRequests: 2,
      };

      // Atteindre la limite
      await rateLimiter.check('test-reset', config);
      await rateLimiter.check('test-reset', config);

      // Devrait être bloqué
      let result = await rateLimiter.check('test-reset', config);
      expect(result.allowed).toBe(false);

      // Attendre expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      // Devrait être autorisé à nouveau
      result = await rateLimiter.check('test-reset', config);
      expect(result.allowed).toBe(true);
    });
  });

  describe('whitelist/blacklist', () => {
    it('devrait autoriser les IPs whitelistées', () => {
      const ip = '192.168.1.1';
      
      rateLimiter.addToWhitelist(ip);
      expect(rateLimiter.isWhitelisted(ip)).toBe(true);
    });

    it('devrait bloquer les IPs blacklistées', () => {
      const ip = '10.0.0.1';
      
      rateLimiter.addToBlacklist(ip);
      expect(rateLimiter.isBlacklisted(ip)).toBe(true);
    });
  });

  describe('reset', () => {
    it('devrait réinitialiser la limite pour une clé', async () => {
      const config = {
        windowMs: 60000,
        maxRequests: 2,
      };

      // Atteindre limite
      await rateLimiter.check('test-reset-key', config);
      await rateLimiter.check('test-reset-key', config);

      // Reset
      const reset = rateLimiter.reset('test-reset-key');
      expect(reset).toBe(true);

      // Devrait être autorisé
      const result = await rateLimiter.check('test-reset-key', config);
      expect(result.allowed).toBe(true);
    });
  });

  describe('stats', () => {
    it('devrait retourner des statistiques', async () => {
      await rateLimiter.check('key1', { windowMs: 60000, maxRequests: 10 });
      await rateLimiter.check('key2', { windowMs: 60000, maxRequests: 10 });

      const stats = rateLimiter.getStats();
      
      expect(stats).toBeDefined();
      expect(stats.totalKeys).toBeGreaterThanOrEqual(2);
    });
  });
});

// ============================================
// INTEGRATION TESTS
// ============================================

describe('Services Integration', () => {
  it('devrait intégrer cache + rate limiting', async () => {
    const cache = CacheService.getInstance();
    const limiter = RateLimiter.getInstance();

    const key = 'integration:test';
    const limitKey = 'user:123';

    // Vérifier rate limit
    const limitResult = await limiter.check(limitKey, {
      windowMs: 60000,
      maxRequests: 10,
    });

    if (limitResult.allowed) {
      // Essayer cache
      const cached = await cache.getOrSet(
        key,
        async () => {
          // Simuler query coûteuse
          await new Promise(resolve => setTimeout(resolve, 10));
          return { data: 'expensive' };
        },
        { ttl: 300 }
      );

      expect(cached).toBeDefined();
    }
  });
});

