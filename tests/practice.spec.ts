import {test,expect} from '@playwright/test';
test('demo renders a real score, accepts microphone permission and shows note colors',async({page})=>{await page.goto('/');await expect(page.locator('.score-canvas svg').first()).toBeVisible();await expect(page.locator('.under-score strong').first()).toHaveText('E1');await page.getByRole('button',{name:/Conectar microfone/}).click();await expect(page.getByRole('button',{name:/Microfone ativo/})).toBeVisible();await page.getByLabel('Canal da interface').selectOption('1');await expect(page.getByLabel('Canal da interface')).toHaveValue('1');await page.getByLabel('Walkthrough').check();await expect(page.locator('.mode-chip')).toHaveText('Walkthrough');await page.getByLabel('Walkthrough').uncheck();await page.getByRole('button',{name:'Reproduzir'}).click();await expect(page.getByRole('button',{name:'Pausar'})).toBeVisible();await page.getByRole('button',{name:'Pausar'}).click();
 // A deterministic state is injected only inside this UI test to verify the renderer wiring.
 await page.evaluate(async()=>{
 // @ts-ignore Vite browser module path is resolved at runtime
 const {useApp}=await import('/src/practice/store.ts');const score=useApp.getState().score!;const states=Object.fromEntries(score.events.map((e:{id:string},i:number)=>[e.id,i===0?'CORRECT':i===1?'INCORRECT':'PENDING']));useApp.getState().set({evaluation:{states,restart:false,currentId:null,correct:1,incorrect:1,missed:0}})});
 await expect.poll(()=>page.locator('.score-canvas').evaluate(e=>e.innerHTML.includes('#4ED5A0')&&e.innerHTML.includes('#FF6B72'))).toBe(true);
});

test('catalog search adds a CC0 MXL score to the local library',async({page})=>{await page.route('https://raw.githubusercontent.com/OpenScore/Lieder/**',async route=>{await route.fulfill({path:'tests/fixtures/just-for-today.mxl',contentType:'application/octet-stream'});});await page.goto('/');await page.getByRole('button',{name:/Buscar no catálogo aberto/}).click();await expect(page.getByRole('dialog',{name:'Catálogo de partituras'})).toBeVisible();await page.getByRole('textbox',{name:'Buscar no catálogo'}).fill('Just for Today Abbott');await expect(page.locator('.catalog-row')).toHaveCount(1);await page.locator('.catalog-row').getByRole('button',{name:'Adicionar'}).click();await expect(page.locator('.catalog-row').getByRole('button',{name:'Adicionada'})).toBeVisible();await page.getByRole('button',{name:'Fechar catálogo'}).click();await expect(page.locator('.library-list')).toContainText('Just for Today');await expect(page.locator('.song-meta')).toContainText('Just');await expect(page.locator('.score-canvas svg').first()).toBeVisible();});

test('a catalog score remains available from IndexedDB after reload',async({page})=>{await page.route('https://raw.githubusercontent.com/OpenScore/Lieder/**',async route=>{await route.fulfill({path:'tests/fixtures/just-for-today.mxl',contentType:'application/octet-stream'});});await page.goto('/');await page.getByRole('button',{name:/Buscar no catálogo aberto/}).click();await page.getByRole('textbox',{name:'Buscar no catálogo'}).fill('Just for Today Abbott');await page.locator('.catalog-row').getByRole('button',{name:'Adicionar'}).click();await expect(page.locator('.catalog-row').getByRole('button',{name:'Adicionada'})).toBeVisible();await page.reload();await expect(page.locator('.library-list')).toContainText('Just for Today');await page.locator('.library-list button').filter({hasText:'Just for Today'}).click();await expect(page.locator('.song-meta')).toContainText('Just');await expect(page.locator('.score-canvas svg').first()).toBeVisible();});

test('confirmed mistake displays both notes and clears on restart',async({page})=>{
 await page.goto('/');
 await expect(page.locator('.score-canvas svg').first()).toBeVisible();
 await page.getByLabel('Walkthrough').check();
 // Exercise the real evaluator with deterministic pitch frames, without physical audio hardware.
 await page.evaluate(async()=>{
  // @ts-ignore Vite browser module
  const {useApp}=await import('/src/practice/store.ts');
  // @ts-ignore Vite browser module
  const {PracticeEvaluator}=await import('/src/practice/evaluator.ts');
  const state=useApp.getState();const evaluator=new PracticeEvaluator(state.score.events,'walkthrough');
  const frame={hz:49,midi:31,confidence:.95,rms:.1,onset:true,timestamp:0};
  evaluator.update(0,frame);
  state.set({evaluation:evaluator.update(120,{...frame,timestamp:120})});
 });
 const feedback=page.locator('.practice-feedback');
 await expect(feedback).toContainText('Nota incorreta');
 await expect(feedback).toContainText('Esperada: E1');
 await expect(feedback).toContainText('Você tocou: G1');
 await expect(feedback).toContainText('Continue tocando');
 await expect(page.locator('.score-surface')).toHaveClass(/score-has-mistake/);
 await page.getByRole('button',{name:'Reiniciar',exact:true}).click();
 await expect(feedback).not.toContainText('Nota incorreta');
 await expect(page.locator('.score-surface')).not.toHaveClass(/score-has-mistake/);
});
