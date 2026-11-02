# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: practice.spec.ts >> automatic download opens a bass score and persists it without leaving the app
- Location: tests/practice.spec.ts:191:1

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator: getByLabel('Trilha', { exact: true })
Expected: "1"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveValue" getByLabel('Trilha', { exact: true }) with timeout 5000ms
  - waiting for getByLabel('Trilha', { exact: true })

```

```yaml
- link "Ir para a partitura":
  - /url: "#pratica"
- banner:
  - text: OFICINA DE MÚSICA · EDIÇÃO PARA CONTRABAIXO EST. 1945 SÉRIE Nº 01
  - img "PlayWithMe"
  - text: THE MUSIC WORKSHOP LEITURA / ESCUTA / PRÁTICA
  - navigation "Navegação da oficina":
    - link "01 Prática":
      - /url: "#pratica"
    - link "02 Acervo":
      - /url: "#biblioteca"
    - link "03 Ajustes":
      - /url: "#configuracao"
  - text: TOMADA 01 · EM ESPERA ♩ 80 BPM Strict Mode
  - button "Conectar microfone"
- main:
  - text: CADERNO DE EXERCÍCIOS
  - heading "Prática de baixo" [level=1]
  - paragraph: Leia a partitura. Toque. Observe sua execução.
  - text: Visualização
  - combobox "Visualização":
    - option "Página" [selected]
    - option "Horizontal"
  - text: Zoom
  - combobox "Zoom":
    - option "75%"
    - option "100%" [selected]
    - option "125%"
    - option "150%"
  - status: GUIA DE PRÁTICA Toque a nota indicada. Confira sua execução abaixo.
  - text: EM ESTUDO
  - strong: Primeiros passos no baixo
  - text: PlayWithMe FOLHA 001 Atual Correta Incorreta Próxima
  - region "Partitura e tablatura, use as setas para rolar":
    - img: Bass Standard Tuning
    - img:      = 80 1   0 Baixo elét  
  - text: NOTA ESPERADA
  - strong: E1
  - text: Compasso 1 · tempo 1.0 SUA NOTA
  - strong: —
  - text: Conecte o baixo ACERTOS
  - strong: "0"
  - text: 0 erros · 0 perdidas DIAGRAMA / 04
  - heading "Mapa das cordas" [level=2]
  - text: 0–24 trastes
  - region "Diagrama do braço do baixo, role para ver os trastes": G2 D2 A1 E1 0 3 5 7 9 12 15 17 19 21 24
  - text: ○ Nota esperada ● Nota detectada
  - paragraph: Posições sugeridas pela afinação; o microfone identifica a nota, não a corda tocada.
  - complementary:
    - region "Afinador e diagnóstico":
      - text: INSTRUMENTO DE MEDIÇÃO / A–01
      - heading "Escuta ao vivo" [level=2]
      - text: GRAVE SEM LEITURA AGUDO
      - strong: —
      - text: — Hz FREQUÊNCIA
      - paragraph: AGUARDANDO SINAL
      - text: Confiança 0% Volume 0% Latência estimada 0 ms Filtro de ruído
      - slider "Filtro de ruído 0.008": "0.008"
      - text: 0.008 PWM / 1945 — FREQUENCY METER
    - text: 02 / ARQUIVO MUSICAL
    - heading "Selecione sua partitura" [level=2]
    - button "⌕ Buscar no catálogo"
    - text: + Importar partitura
    - button "Importar partitura local"
    - textbox "Buscar na biblioteca":
      - /placeholder: Buscar música...
    - button "♫ Espresso GP · Sabrina Carpenter":
      - text: ♫
      - strong: Espresso
      - text: GP · Sabrina Carpenter
    - text: MusicXML e Guitar Pro via alphaTab. PDF requer reconhecimento óptico e não é importado. 03 / CONFIGURAÇÃO DA ESTAÇÃO
    - heading "Ajustes de precisão" [level=2]
    - text: Entrada de áudio
    - button "Atualizar lista"
    - combobox "Entrada de áudio":
      - option "Padrão do sistema" [selected]
      - option "Fake Default Audio Input"
      - option "Fake Audio Input 1"
      - option "Fake Audio Input 2"
    - text: Canal da interface
    - combobox "Canal da interface":
      - option "Automático (mais forte)" [selected]
      - option "Canal 1"
      - option "Canal 2"
    - text: Afinação
    - combobox "Afinação":
      - option "4 cordas · E A D G" [selected]
      - option "5 cordas · B E A D G"
      - option "Drop D · D A D G"
      - option "Personalizada"
    - text: Trilha
    - combobox "Trilha":
      - option "Guitarra"
      - option "Baixo elétrico" [selected]
    - checkbox "Silenciar baixo virtual"
    - text: Silenciar baixo virtual
    - checkbox "Reinício automático" [checked]
    - text: Reinício automático Volume virtual
    - slider "Volume virtual": "70"
- contentinfo "Controles de reprodução":
  - text: MESA DE TRANSPORTE
  - button "Reiniciar": REINICIAR
  - button "Reproduzir": REPRODUZIR
  - text: 00:00
  - slider "Posição": "0"
  - text: 00:24
  - checkbox "Metrônomo"
  - text: Metrônomo Tempo
  - slider "Tempo": "80"
  - text: "80"
  - button "A–B"
  - text: Fonte
  - combobox "Fonte":
    - option "Instrumentos virtuais" [selected]
    - option "YouTube"
  - checkbox "Walkthrough"
  - text: Walkthrough
  - button "Esperar nota"
- status: Espresso baixada e pronta para praticar
```

# Test source

```ts
  122 |   await expect(page.locator('.score-canvas svg').first()).toBeVisible();
  123 | });
  124 | 
  125 | test('confirmed mistake displays both notes and clears on restart', async ({
  126 |   page,
  127 | }) => {
  128 |   await page.goto('/');
  129 |   await expect(page.locator('.score-canvas svg').first()).toBeVisible();
  130 |   await page.getByLabel('Walkthrough').check();
  131 |   // Exercise the real evaluator with deterministic pitch frames, without physical audio hardware.
  132 |   await page.evaluate(async () => {
  133 |     // @ts-ignore Vite browser module
  134 |     const { useApp } = await import('/src/practice/store.ts');
  135 |     // @ts-ignore Vite browser module
  136 |     const { PracticeEvaluator } = await import('/src/practice/evaluator.ts');
  137 |     const state = useApp.getState();
  138 |     const evaluator = new PracticeEvaluator(state.score.events, 'walkthrough');
  139 |     const frame = {
  140 |       hz: 49,
  141 |       midi: 31,
  142 |       confidence: 0.95,
  143 |       rms: 0.1,
  144 |       onset: true,
  145 |       timestamp: 0,
  146 |     };
  147 |     evaluator.update(0, frame);
  148 |     state.set({
  149 |       evaluation: evaluator.update(120, { ...frame, timestamp: 120 }),
  150 |     });
  151 |   });
  152 |   const feedback = page.locator('.practice-feedback');
  153 |   await expect(feedback).toContainText('Nota incorreta');
  154 |   await expect(feedback).toContainText('Esperada: E1');
  155 |   await expect(feedback).toContainText('Você tocou: G1');
  156 |   await expect(feedback).toContainText('Continue tocando');
  157 |   await expect(page.locator('.score-surface')).toHaveClass(/score-has-mistake/);
  158 |   await page.getByRole('button', { name: 'Reiniciar', exact: true }).click();
  159 |   await expect(feedback).not.toContainText('Nota incorreta');
  160 |   await expect(page.locator('.score-surface')).not.toHaveClass(
  161 |     /score-has-mistake/,
  162 |   );
  163 | });
  164 | 
  165 | test('vector search finds modern music with typos and filters by style', async ({
  166 |   page,
  167 | }) => {
  168 |   await page.goto('/');
  169 |   await page.getByRole('button', { name: /Buscar no catálogo/ }).click();
  170 |   const search = page.getByRole('textbox', { name: 'Buscar no catálogo' });
  171 |   await search.fill('espreso sabrina');
  172 |   const row = page.locator('.catalog-row').first();
  173 |   await expect(row).toContainText('Espresso');
  174 |   await expect(row).toContainText('Sabrina Carpenter');
  175 |   await expect(row).toContainText('Busca e download automáticos');
  176 |   await expect(
  177 |     row.getByRole('button', { name: 'Buscar e baixar' }),
  178 |   ).toBeVisible();
  179 |   await expect(row.getByRole('link')).toHaveCount(0);
  180 |   await search.fill('');
  181 |   await page.getByLabel('Estilo', { exact: true }).selectOption('Mexicana');
  182 |   await expect(page.locator('.catalog-row')).toHaveCount(10);
  183 |   await expect(page.locator('.catalog-results')).toContainText(
  184 |     'Ella Baila Sola',
  185 |   );
  186 |   await page.getByLabel('Partitura', { exact: true }).selectOption('score');
  187 |   await expect(page.locator('.catalog-row')).toHaveCount(0);
  188 |   await expect(page.locator('.catalog-empty')).toBeVisible();
  189 | });
  190 | 
  191 | test('automatic download opens a bass score and persists it without leaving the app', async ({
  192 |   page,
  193 | }) => {
  194 |   let downloads = 0;
  195 |   await page.route('**/api/catalog/*/score', (route) => {
  196 |     downloads++;
  197 |     return route.fulfill({
  198 |       body: Buffer.from(createTestGpWithBassTrack()),
  199 |       contentType: 'application/octet-stream',
  200 |       headers: {
  201 |         'X-Score-Source': 'https://guitarprotabs.org/tabs/test/exercise',
  202 |       },
  203 |     });
  204 |   });
  205 |   await page.goto('/');
  206 |   await page.getByRole('button', { name: /Buscar no catálogo/ }).click();
  207 |   await page
  208 |     .getByRole('textbox', { name: 'Buscar no catálogo' })
  209 |     .fill('espresso sabrina');
  210 |   await expect(page.locator('.catalog-row')).toHaveCount(1);
  211 |   await page
  212 |     .getByRole('button', { name: 'Buscar e baixar', exact: true })
  213 |     .click();
  214 |   await expect(
  215 |     page.locator('.catalog-row').getByRole('button', { name: 'Adicionada' }),
  216 |   ).toBeVisible();
  217 |   await page.getByRole('button', { name: 'Fechar catálogo' }).click();
  218 |   await expect(page.locator('.library-list')).toContainText('Espresso');
  219 |   await expect(page.locator('.library-list')).toContainText(
  220 |     'Sabrina Carpenter',
  221 |   );
> 222 |   await expect(page.getByLabel('Trilha', { exact: true })).toHaveValue('1');
      |                                                            ^ Error: expect(locator).toHaveValue(expected) failed
  223 |   await expect(page.locator('.score-canvas')).toContainText('Baixo elétrico');
  224 |   await expect(page.locator('.score-canvas svg').first()).toBeVisible();
  225 |   await page.reload();
  226 |   await expect(page.locator('.library-list')).toContainText('Espresso');
  227 |   await page
  228 |     .locator('.library-list button')
  229 |     .filter({ hasText: 'Espresso' })
  230 |     .click();
  231 |   await expect(page.getByLabel('Trilha', { exact: true })).toHaveValue('1');
  232 |   await expect(page.locator('.score-canvas')).toContainText('Baixo elétrico');
  233 |   await expect(page.locator('.score-canvas svg').first()).toBeVisible();
  234 |   expect(downloads).toBe(1);
  235 | });
  236 | 
  237 | test('missing automatic download is explained inside the catalog and can be retried', async ({
  238 |   page,
  239 | }) => {
  240 |   await page.route('**/api/catalog/*/score', (route) =>
  241 |     route.fulfill({
  242 |       status: 404,
  243 |       json: {
  244 |         error:
  245 |           'Nenhuma partitura compatível foi encontrada para esta música na fonte atual.',
  246 |       },
  247 |     }),
  248 |   );
  249 |   await page.goto('/');
  250 |   await page.getByRole('button', { name: /Buscar no catálogo/ }).click();
  251 |   await page
  252 |     .getByRole('textbox', { name: 'Buscar no catálogo' })
  253 |     .fill('espresso sabrina');
  254 |   await expect(page.locator('.catalog-row')).toHaveCount(1);
  255 |   await page
  256 |     .getByRole('button', { name: 'Buscar e baixar', exact: true })
  257 |     .click();
  258 |   await expect(page.locator('.catalog-error')).toContainText(
  259 |     'Nenhuma partitura compatível',
  260 |   );
  261 |   await expect(
  262 |     page.getByRole('button', { name: 'Buscar e baixar', exact: true }),
  263 |   ).toBeEnabled();
  264 |   await expect(
  265 |     page.getByRole('button', { name: 'Importar partitura', exact: true }),
  266 |   ).toHaveCount(0);
  267 |   await page.getByRole('button', { name: 'Fechar catálogo' }).click();
  268 |   await expect(page.locator('.library-list')).not.toContainText('Espresso');
  269 | });
  270 | 
  271 | test('workshop supports keyboard navigation, modal focus and reduced motion', async ({
  272 |   page,
  273 | }) => {
  274 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  275 |   await page.goto('/');
  276 |   await expect(page.locator('.score-canvas svg').first()).toBeVisible();
  277 |   await page.keyboard.press('Tab');
  278 |   await expect(
  279 |     page.getByRole('link', { name: 'Ir para a partitura' }),
  280 |   ).toBeFocused();
  281 |   await page.keyboard.press('Enter');
  282 |   await expect(page.locator('#pratica')).toBeFocused();
  283 |   const open = page.getByRole('button', { name: /Buscar no catálogo/ });
  284 |   await open.focus();
  285 |   await page.keyboard.press('Enter');
  286 |   await expect(
  287 |     page.getByRole('textbox', { name: 'Buscar no catálogo' }),
  288 |   ).toBeFocused();
  289 |   await page.keyboard.press('Shift+Tab');
  290 |   await expect(
  291 |     page.getByRole('button', { name: 'Fechar catálogo' }),
  292 |   ).toBeFocused();
  293 |   await page.keyboard.press('Shift+Tab');
  294 |   await expect(
  295 |     page.getByRole('link', { name: 'OpenScore Lieder', exact: true }),
  296 |   ).toBeFocused();
  297 |   await page.keyboard.press('Tab');
  298 |   await expect(
  299 |     page.getByRole('button', { name: 'Fechar catálogo' }),
  300 |   ).toBeFocused();
  301 |   await page.keyboard.press('Escape');
  302 |   await expect(page.getByRole('dialog')).toHaveCount(0);
  303 |   await expect(open).toBeFocused();
  304 |   await expect(page.locator('.gauge-needle')).toHaveCSS(
  305 |     'transition-duration',
  306 |     '0s',
  307 |   );
  308 | });
  309 | 
  310 | test('paper workshop stays readable on narrow screens and labels uncertain audio', async ({
  311 |   page,
  312 | }) => {
  313 |   await page.setViewportSize({ width: 390, height: 844 });
  314 |   await page.goto('/');
  315 |   await expect(page.locator('.score-canvas svg').first()).toBeVisible();
  316 |   expect(
  317 |     await page.evaluate(
  318 |       () => document.documentElement.scrollWidth <= innerWidth,
  319 |     ),
  320 |   ).toBe(true);
  321 |   await expect(page.locator('.score-canvas')).toHaveCSS(
  322 |     'background-color',
```