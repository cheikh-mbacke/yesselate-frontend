# Tests - Validation Paiements

## 📋 Plan de tests

### 1. Tests unitaires (Jest + React Testing Library)

#### `PaymentExportModal.test.tsx`
```typescript
describe('PaymentExportModal', () => {
  it('devrait afficher le modal quand open=true', () => {
    render(<PaymentExportModal open={true} onClose={jest.fn()} />);
    expect(screen.getByText('Exporter les paiements')).toBeInTheDocument();
  });

  it('devrait appeler l\'API avec le bon format', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, blob: () => Promise.resolve(new Blob()) })
    );
    
    const { getByRole } = render(<PaymentExportModal open={true} onClose={jest.fn()} />);
    
    fireEvent.click(getByRole('button', { name: /CSV/ }));
    fireEvent.click(getByRole('button', { name: /Télécharger/ }));
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('format=csv'));
    });
  });

  it('devrait gérer les erreurs API gracieusement', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: false }));
    
    // Test error handling
  });
});
```

#### `PaymentWorkflowModal.test.tsx`
```typescript
describe('PaymentWorkflowModal', () => {
  const mockPayment = {
    id: 'PAY-001',
    amount: 6_000_000,
    requiresDoubleValidation: true,
    // ...
  };

  it('devrait afficher l\'étape BF pour montant critique', () => {
    render(<PaymentWorkflowModal open={true} payment={mockPayment} onClose={jest.fn()} />);
    expect(screen.getByText(/Bureau Finance \(R\)/)).toBeInTheDocument();
  });

  it('devrait bloquer DG tant que BF n\'a pas validé', () => {
    const { getByRole } = render(<PaymentWorkflowModal open={true} payment={mockPayment} />);
    
    const authorizeBtn = getByRole('button', { name: /Autoriser/ });
    expect(authorizeBtn).toBeDisabled();
  });

  it('devrait activer DG après validation BF', async () => {
    const { getByRole } = render(<PaymentWorkflowModal open={true} payment={mockPayment} />);
    
    fireEvent.click(getByRole('button', { name: /Simuler validation BF/ }));
    
    await waitFor(() => {
      expect(getByRole('button', { name: /Autoriser/ })).not.toBeDisabled();
    });
  });
});
```

#### `utils.test.ts`
```typescript
describe('parseMoney', () => {
  it('devrait parser les formats FCFA', () => {
    expect(parseMoney('5 000 000 FCFA')).toBe(5_000_000);
    expect(parseMoney('5.000.000')).toBe(5_000_000);
    expect(parseMoney('5,000,000')).toBe(5_000_000);
  });

  it('devrait retourner 0 pour input invalide', () => {
    expect(parseMoney('')).toBe(0);
    expect(parseMoney('abc')).toBe(0);
    expect(parseMoney(null)).toBe(0);
  });
});

describe('computeRisk', () => {
  it('devrait calculer score critique pour retard + montant élevé', () => {
    const { score, label } = computeRisk({
      daysToDue: -10,
      amountNum: 10_000_000,
      requiresDoubleValidation: true,
      matchedFacture: null,
    });
    
    expect(score).toBeGreaterThanOrEqual(85);
    expect(label).toBe('critical');
  });

  it('devrait calculer score faible pour échéance lointaine + petit montant', () => {
    const { score, label } = computeRisk({
      daysToDue: 30,
      amountNum: 500_000,
      requiresDoubleValidation: false,
      matchedFacture: { id: 'F-001' },
    });
    
    expect(score).toBeLessThan(35);
    expect(label).toBe('low');
  });
});

describe('matchQuery', () => {
  const payment = {
    id: 'PAY-001',
    type: 'Facture',
    beneficiary: 'SEN-ELEC',
    project: 'CH-02',
    status: 'pending',
  };

  it('devrait matcher champ simple', () => {
    expect(matchQuery(payment, 'type:Facture')).toBe(true);
    expect(matchQuery(payment, 'type:Situation')).toBe(false);
  });

  it('devrait supporter négation', () => {
    expect(matchQuery(payment, '-status:validated')).toBe(true);
    expect(matchQuery(payment, '-status:pending')).toBe(false);
  });

  it('devrait supporter OU logique', () => {
    expect(matchQuery(payment, 'type:Situation || status:pending')).toBe(true);
  });

  it('devrait supporter guillemets pour phrase exacte', () => {
    expect(matchQuery(payment, 'beneficiary:"SEN-ELEC"')).toBe(true);
    expect(matchQuery(payment, 'beneficiary:"AUTRE"')).toBe(false);
  });
});
```

### 2. Tests d'intégration

#### `PaymentValidationWorkflow.integration.test.tsx`
```typescript
describe('Workflow complet BF→DG', () => {
  it('devrait valider un paiement critique de bout en bout', async () => {
    // 1. Render page principale
    render(<PaymentValidationPage />);
    
    // 2. Ouvrir paiement critique
    fireEvent.click(screen.getByText('PAY-CRITICAL-001'));
    
    // 3. Vérifier modal workflow s'ouvre
    expect(screen.getByText(/Workflow BF→DG/)).toBeInTheDocument();
    
    // 4. Simuler validation BF
    fireEvent.click(screen.getByRole('button', { name: /Simuler validation BF/ }));
    
    await waitFor(() => {
      expect(screen.getByText(/✓ Validé/)).toBeInTheDocument();
    });
    
    // 5. Autoriser par DG
    fireEvent.click(screen.getByRole('button', { name: /Autoriser/ }));
    
    // 6. Vérifier toast succès + log audit
    await waitFor(() => {
      expect(screen.getByText(/Paiement .* autorisé/)).toBeInTheDocument();
    });
    
    // 7. Vérifier chainHead mis à jour
    const chainHead = localStorage.getItem('bmo.validationPaiements.chainHead.v1');
    expect(chainHead).not.toBe('GENESIS');
  });
});
```

#### `ExportFlow.integration.test.tsx`
```typescript
describe('Export flows', () => {
  it('devrait exporter CSV avec filtres', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        blob: () => Promise.resolve(new Blob(['csv data'], { type: 'text/csv' })),
      })
    );
    
    render(<PaymentValidationPage />);
    
    // 1. Ouvrir modal export
    fireEvent.click(screen.getByTitle(/Exporter/));
    
    // 2. Sélectionner queue
    fireEvent.change(screen.getByLabelText(/Sélection des paiements/), {
      target: { value: 'late' },
    });
    
    // 3. Sélectionner format CSV
    fireEvent.click(screen.getByText(/CSV \(Excel\)/));
    
    // 4. Télécharger
    fireEvent.click(screen.getByRole('button', { name: /Télécharger/ }));
    
    // 5. Vérifier appel API
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('format=csv&queue=late')
      );
    });
  });
});
```

### 3. Tests E2E (Playwright)

#### `payment-validation.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Validation Paiements E2E', () => {
  test('utilisateur peut filtrer et valider un paiement', async ({ page }) => {
    // 1. Accéder à la page
    await page.goto('/maitre-ouvrage/validation-paiements');
    
    // 2. Attendre le chargement
    await expect(page.locator('text=Validation des Paiements')).toBeVisible();
    
    // 3. Ouvrir Command Palette (⌘K)
    await page.keyboard.press('Meta+K');
    await expect(page.locator('text=Recherche rapide')).toBeVisible();
    
    // 4. Rechercher paiements en retard
    await page.keyboard.type('retard');
    await page.keyboard.press('Enter');
    
    // 5. Vérifier liste filtrée
    await expect(page.locator('[data-testid="payment-table"]')).toBeVisible();
    
    // 6. Sélectionner un paiement
    await page.locator('input[type="checkbox"]').first().click();
    
    // 7. Cliquer Autoriser
    await page.locator('button:has-text("Autoriser")').click();
    
    // 8. Vérifier toast succès
    await expect(page.locator('text=autorisé')).toBeVisible({ timeout: 5000 });
  });

  test('workflow BF→DG pour montant critique', async ({ page }) => {
    await page.goto('/maitre-ouvrage/validation-paiements');
    
    // 1. Ouvrir paiement critique
    await page.locator('text=PAY-CRITICAL-001').click();
    
    // 2. Vérifier modal workflow
    await expect(page.locator('text=Workflow BF→DG')).toBeVisible();
    
    // 3. Valider étape BF
    await page.locator('button:has-text("Simuler validation BF")').click();
    await expect(page.locator('text=✓ Validé')).toBeVisible();
    
    // 4. Autoriser étape DG
    await page.locator('button:has-text("✓ Autoriser")').click();
    
    // 5. Vérifier succès
    await expect(page.locator('text=autorisé')).toBeVisible();
  });

  test('export CSV avec filtres', async ({ page }) => {
    await page.goto('/maitre-ouvrage/validation-paiements');
    
    // 1. Ouvrir menu Actions
    await page.locator('[aria-label="Actions rapides"]').hover();
    
    // 2. Cliquer Exporter
    await page.locator('text=Exporter').click();
    
    // 3. Sélectionner queue "late"
    await page.selectOption('select', 'late');
    
    // 4. Cliquer CSV
    await page.locator('text=CSV (Excel)').click();
    
    // 5. Télécharger (attendre download)
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('button:has-text("Télécharger")').click(),
    ]);
    
    // 6. Vérifier nom fichier
    expect(download.suggestedFilename()).toMatch(/paiements_late_\d+\.csv/);
  });

  test('Command Palette (⌘K)', async ({ page }) => {
    await page.goto('/maitre-ouvrage/validation-paiements');
    
    // 1. Ouvrir palette
    await page.keyboard.press('Meta+K');
    
    // 2. Vérifier visible
    await expect(page.locator('text=Recherche rapide')).toBeVisible();
    
    // 3. Taper commande
    await page.keyboard.type('stats');
    
    // 4. Vérifier suggestions filtrées
    await expect(page.locator('text=Statistiques')).toBeVisible();
    
    // 5. Enter pour exécuter
    await page.keyboard.press('Enter');
    
    // 6. Vérifier modal stats s'ouvre
    await expect(page.locator('text=Statistiques et Analytics')).toBeVisible();
  });
});
```

### 4. Tests de performance

#### `performance.test.ts`
```typescript
describe('Performance', () => {
  it('devrait charger 150 paiements en <2s', async () => {
    const start = performance.now();
    
    render(<PaymentValidationPage />);
    
    await waitFor(() => {
      expect(screen.getAllByRole('row')).toHaveLength(151); // +1 header
    });
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(2000);
  });

  it('devrait filtrer 150 paiements en <100ms', () => {
    const payments = generateMockPayments(150);
    
    const start = performance.now();
    const filtered = payments.filter(p => matchQuery(p, 'status:pending'));
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(100);
  });

  it('devrait calculer stats pour 1000 paiements en <500ms', () => {
    const payments = generateMockPayments(1000);
    
    const start = performance.now();
    const stats = calculateStats(payments);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(500);
    expect(stats.total).toBe(1000);
  });
});
```

### 5. Tests d'accessibilité (a11y)

#### `a11y.test.tsx`
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibilité', () => {
  it('page principale devrait être accessible', async () => {
    const { container } = render(<PaymentValidationPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('modal export devrait être accessible', async () => {
    const { container } = render(<PaymentExportModal open={true} onClose={jest.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('devrait supporter navigation clavier', () => {
    render(<PaymentValidationPage />);
    
    // Tab pour focus premier élément
    userEvent.tab();
    expect(document.activeElement).toHaveAttribute('role', 'button');
    
    // Tab suivant
    userEvent.tab();
    // ...
  });

  it('devrait avoir labels aria appropriés', () => {
    render(<PaymentValidationPage />);
    
    expect(screen.getByLabelText('Sélectionner PAY-001')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Autoriser/ })).toBeInTheDocument();
  });
});
```

### 6. Tests de sécurité

#### `security.test.ts`
```typescript
describe('Sécurité', () => {
  it('devrait générer hash SHA-256 déterministe', async () => {
    const payload = { v: 1, id: 'PAY-001', amount: 5000000 };
    
    const hash1 = await sha256Hex(stableStringify(payload));
    const hash2 = await sha256Hex(stableStringify(payload));
    
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 = 64 hex chars
  });

  it('devrait chaîner correctement (append-only)', async () => {
    const prev = 'abc123';
    const action = 'def456';
    
    const newHead = await sha256Hex(`${prev}|${action}`);
    
    expect(newHead).not.toBe(prev);
    expect(newHead).toHaveLength(64);
  });

  it('devrait empêcher XSS dans recherche', () => {
    const maliciousQuery = '<script>alert("XSS")</script>';
    
    render(<PaymentValidationPage />);
    const input = screen.getByPlaceholderText(/Recherche/);
    
    fireEvent.change(input, { target: { value: maliciousQuery } });
    
    // Vérifier pas d'exécution script
    expect(document.querySelector('script')).not.toBeInTheDocument();
  });

  it('devrait valider montants (pas de négatifs)', () => {
    const result = parseMoney('-5000000');
    
    // parseMoney devrait rejeter négatifs en prod
    expect(result).toBeGreaterThanOrEqual(0);
  });
});
```

## 🎯 Couverture cible

| Catégorie | Cible | Priorité |
|-----------|-------|----------|
| **Fonctions utils** | 95% | 🔴 Haute |
| **Composants UI** | 80% | 🟡 Moyenne |
| **Workflow métier** | 100% | 🔴 Haute |
| **APIs routes** | 90% | 🔴 Haute |
| **Accessibilité** | 100% WCAG AA | 🔴 Haute |
| **Performance** | Benchmarks OK | 🟡 Moyenne |

## 🚀 Commandes

```bash
# Tests unitaires
npm run test
npm run test:coverage

# Tests E2E
npm run test:e2e
npm run test:e2e:ui

# Tests a11y
npm run test:a11y

# Tests performance
npm run test:perf

# Tous les tests
npm run test:all
```

## 📝 Notes

### Priorités
1. **Workflow BF→DG** : Critique, doit être 100% testé
2. **Calcul risque** : Logique métier essentielle
3. **Traçabilité** : Hash, chaînage, audit
4. **Export** : CSV, JSON, Evidence Pack
5. **Accessibilité** : WCAG AA minimum

### Mocks recommandés
- `paymentsN1` : Dataset test (50-150 paiements)
- `facturesRecues` : Factures pour matching
- `localStorage` : Mock pour chainHead
- `crypto.subtle` : Polyfill pour SHA-256 en Node
- `fetch` : Mock pour APIs

### CI/CD
- **GitHub Actions** : Run tests sur PR
- **Codecov** : Rapport couverture
- **Lighthouse CI** : Performance + a11y
- **SonarQube** : Qualité code

---

**Maintenu par** : Équipe BMO  
**Version** : 1.0.0  
**Dernière mise à jour** : 10 janvier 2025

