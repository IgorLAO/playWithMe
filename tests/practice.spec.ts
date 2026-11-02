import { createTestGpWithBassTrack } from './fixtures/demo-score';
import { test, expect } from '@playwright/test';
test('demo renders a real score, accepts microphone permission and shows note colors', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.score-canvas svg').first()).toBeVisible();
  await expect(page.locator('.under-score strong').first()).toHaveText('E1');
  await page.getByRole('button', { name: /Conectar microfone/ }).click();
  await expect(
    page.getByRole('button', { name: /Microfone ativo/ }),
  ).toBeVisible();
  await page.getByLabel('Canal da interface').selectOption('1');
  await expect(page.getByLabel('Canal da interface')).toHaveValue('1');
  await page.getByLabel('Walkthrough').check();
  await expect(page.locator('.mode-chip')).toHaveText('Walkthrough');
  await page.getByLabel('Walkthrough').uncheck();
  await page.getByRole('button', { name: 'Reproduzir' }).click();
  await expect(page.getByRole('button', { name: 'Pausar' })).toBeVisible();
  await page.getByRole('button', { name: 'Pausar' }).click();
  // A deterministic state is injected only inside this UI test to verify the renderer wiring.
  await page.evaluate(async () => {
    // @ts-ignore Vite browser module path is resolved at runtime
    const { useApp } = await import('/src/practice/store.ts');
    const score = useApp.getState().score!;
    const states = Object.fromEntries(
      score.events.map((e: { id: string }, i: number) => [
        e.id,
        i === 0 ? 'CORRECT' : i === 1 ? 'INCORRECT' : 'PENDING',
      ]),
    );
    useApp
      .getState()
      .set({
        evaluation: {
          states,
          restart: false,
          currentId: null,
          correct: 1,
          incorrect: 1,
          missed: 0,
        },
      });
  });
  await expect
    .poll(() =>
      page
        .locator('.score-canvas')
        .evaluate(
          (e) =>
            e.innerHTML.includes('#626747') && e.innerHTML.includes('#B52B24'),
        ),
    )
    .toBe(true);
});

test('catalog search adds a CC0 MXL score to the local library', async ({
  page,
}) => {
  await page.route(
    'https://raw.githubusercontent.com/OpenScore/Lieder/**',
    async (route) => {
      await route.fulfill({
        path: 'tests/fixtures/just-for-today.mxl',
        contentType: 'application/octet-stream',
      });
    },
  );
  await page.goto('/');
  await page.getByRole('button', { name: /Buscar no catálogo/ }).click();
  await expect(
    page.getByRole('dialog', { name: 'Catálogo de partituras' }),
  ).toBeVisible();
  await page
    .getByRole('textbox', { name: 'Buscar no catálogo' })
    .fill('Just for Today Abbott');
  await expect(page.locator('.catalog-row')).toHaveCount(1);
  await page
    .locator('.catalog-row')
    .getByRole('button', { name: 'Adicionar' })
    .click();
  await expect(
    page.locator('.catalog-row').getByRole('button', { name: 'Adicionada' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Fechar catálogo' }).click();
  await expect(page.locator('.library-list')).toContainText('Just for Today');
  await expect(page.locator('.song-meta')).toContainText('Just');
  await expect(page.locator('.score-canvas svg').first()).toBeVisible();
});

test('a catalog score remains available from IndexedDB after reload', async ({
  page,
}) => {
  await page.route(
    'https://raw.githubusercontent.com/OpenScore/Lieder/**',
    async (route) => {
      await route.fulfill({
        path: 'tests/fixtures/just-for-today.mxl',
        contentType: 'application/octet-stream',
      });
    },
  );
  await page.goto('/');
  await page.getByRole('button', { name: /Buscar no catálogo/ }).click();
  await page
    .getByRole('textbox', { name: 'Buscar no catálogo' })
    .fill('Just for Today Abbott');
  await page
    .locator('.catalog-row')
    .getByRole('button', { name: 'Adicionar' })
    .click();
  await expect(
    page.locator('.catalog-row').getByRole('button', { name: 'Adicionada' }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator('.library-list')).toContainText('Just for Today');
  await page
    .locator('.library-list button')
    .filter({ hasText: 'Just for Today' })
    .click();
  await expect(page.locator('.song-meta')).toContainText('Just');
  await expect(page.locator('.score-canvas svg').first()).toBeVisible();
});

test('confirmed mistake displays both notes and clears on restart', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.score-canvas svg').first()).toBeVisible();
  await page.getByLabel('Walkthrough').check();
  // Exercise the real evaluator with deterministic pitch frames, without physical audio hardware.
  await page.evaluate(async () => {
    // @ts-ignore Vite browser module
    const { useApp } = await import('/src/practice/store.ts');
    // @ts-ignore Vite browser module
    const { PracticeEvaluator } = await import('/src/practice/evaluator.ts');
    const state = useApp.getState();
    const evaluator = new PracticeEvaluator(state.score.events, 'walkthrough');
    const frame = {
      hz: 49,
      midi: 31,
      confidence: 0.95,
      rms: 0.1,
      onset: true,
      timestamp: 0,
    };
    evaluator.update(0, frame);
    state.set({
      evaluation: evaluator.update(120, { ...frame, timestamp: 120 }),
    });
  });
  const feedback = page.locator('.practice-feedback');
  await expect(feedback).toContainText('Nota incorreta');
  await expect(feedback).toContainText('Esperada: E1');
  await expect(feedback).toContainText('Você tocou: G1');
  await expect(feedback).toContainText('Continue tocando');
  await expect(page.locator('.score-surface')).toHaveClass(/score-has-mistake/);
  await page.getByRole('button', { name: 'Reiniciar', exact: true }).click();
  await expect(feedback).not.toContainText('Nota incorreta');
  await expect(page.locator('.score-surface')).not.toHaveClass(
    /score-has-mistake/,
  );
});

test('vector search finds modern music with typos and filters by style', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Buscar no catálogo/ }).click();
  const search = page.getByRole('textbox', { name: 'Buscar no catálogo' });
  await search.fill('espreso sabrina');
  const row = page.locator('.catalog-row').first();
  await expect(row).toContainText('Espresso');
  await expect(row).toContainText('Sabrina Carpenter');
  await expect(row).toContainText('Busca e download automáticos');
  await expect(
    row.getByRole('button', { name: 'Buscar e baixar' }),
  ).toBeVisible();
  await expect(row.getByRole('link')).toHaveCount(0);
  await search.fill('');
  await page.getByLabel('Estilo', { exact: true }).selectOption('Mexicana');
  await expect(page.locator('.catalog-row')).toHaveCount(10);
  await expect(page.locator('.catalog-results')).toContainText(
    'Ella Baila Sola',
  );
  await page.getByLabel('Partitura', { exact: true }).selectOption('score');
  await expect(page.locator('.catalog-row')).toHaveCount(0);
  await expect(page.locator('.catalog-empty')).toBeVisible();
});

test('automatic download opens a bass score and persists it without leaving the app', async ({
  page,
}) => {
  let downloads = 0;
  await page.route('**/api/catalog/*/score', (route) => {
    downloads++;
    return route.fulfill({
      body: Buffer.from(createTestGpWithBassTrack()),
      contentType: 'application/octet-stream',
      headers: {
        'X-Score-Source': 'https://guitarprotabs.org/tabs/test/exercise',
      },
    });
  });
  await page.goto('/');
  await page.getByRole('button', { name: /Buscar no catálogo/ }).click();
  await page
    .getByRole('textbox', { name: 'Buscar no catálogo' })
    .fill('espresso sabrina');
  await expect(page.locator('.catalog-row')).toHaveCount(1);
  await page
    .getByRole('button', { name: 'Buscar e baixar', exact: true })
    .click();
  await expect(
    page.locator('.catalog-row').getByRole('button', { name: 'Adicionada' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Fechar catálogo' }).click();
  await expect(page.locator('.library-list')).toContainText('Espresso');
  await expect(page.locator('.library-list')).toContainText(
    'Sabrina Carpenter',
  );
  await expect(page.getByLabel('Trilha', { exact: true })).toHaveValue('1');
  await expect(page.locator('.score-canvas')).toContainText('Baixo elétrico');
  await expect(page.locator('.score-canvas svg').first()).toBeVisible();
  await page.reload();
  await expect(page.locator('.library-list')).toContainText('Espresso');
  await page
    .locator('.library-list button')
    .filter({ hasText: 'Espresso' })
    .click();
  await expect(page.getByLabel('Trilha', { exact: true })).toHaveValue('1');
  await expect(page.locator('.score-canvas')).toContainText('Baixo elétrico');
  await expect(page.locator('.score-canvas svg').first()).toBeVisible();
  expect(downloads).toBe(1);
});

test('missing automatic download is explained inside the catalog and can be retried', async ({
  page,
}) => {
  await page.route('**/api/catalog/*/score', (route) =>
    route.fulfill({
      status: 404,
      json: {
        error:
          'Nenhuma partitura compatível foi encontrada para esta música na fonte atual.',
      },
    }),
  );
  await page.goto('/');
  await page.getByRole('button', { name: /Buscar no catálogo/ }).click();
  await page
    .getByRole('textbox', { name: 'Buscar no catálogo' })
    .fill('espresso sabrina');
  await expect(page.locator('.catalog-row')).toHaveCount(1);
  await page
    .getByRole('button', { name: 'Buscar e baixar', exact: true })
    .click();
  await expect(page.locator('.catalog-error')).toContainText(
    'Nenhuma partitura compatível',
  );
  await expect(
    page.getByRole('button', { name: 'Buscar e baixar', exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole('button', { name: 'Importar partitura', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Fechar catálogo' }).click();
  await expect(page.locator('.library-list')).not.toContainText('Espresso');
});

test('workshop supports keyboard navigation, modal focus and reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.score-canvas svg').first()).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Ir para a partitura' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#pratica')).toBeFocused();
  const open = page.getByRole('button', { name: /Buscar no catálogo/ });
  await open.focus();
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('textbox', { name: 'Buscar no catálogo' }),
  ).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(
    page.getByRole('button', { name: 'Fechar catálogo' }),
  ).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(
    page.getByRole('link', { name: 'OpenScore Lieder', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('button', { name: 'Fechar catálogo' }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(open).toBeFocused();
  await expect(page.locator('.gauge-needle')).toHaveCSS(
    'transition-duration',
    '0s',
  );
});

test('paper workshop stays readable on narrow screens and labels uncertain audio', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.score-canvas svg').first()).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator('.score-canvas')).toHaveCSS(
    'background-color',
    'rgb(245, 237, 221)',
  );
  await page.locator('.score-canvas').focus();
  await expect(page.locator('.score-canvas')).toBeFocused();
  await page.evaluate(async () => {
    // @ts-ignore Vite browser module
    const { useApp } = await import('/src/practice/store.ts');
    useApp
      .getState()
      .set({
        frame: {
          midi: null,
          hz: null,
          confidence: 0,
          rms: 0.02,
          timestamp: 0,
          onset: false,
        },
      });
  });
  await expect(page.locator('.signal-label')).toHaveText('SINAL INCERTO');
  await expect(page.locator('.signal-label')).toHaveCSS(
    'background-color',
    'rgb(214, 163, 58)',
  );
  await page.getByRole('button', { name: /Buscar no catálogo/ }).click();
  const dialog = page.getByRole('dialog');
  expect(await dialog.evaluate((e) => e.scrollWidth <= e.clientWidth)).toBe(
    true,
  );
  await page.getByRole('button', { name: 'Fechar catálogo' }).click();
  await page.setViewportSize({ width: 320, height: 740 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
