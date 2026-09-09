// Run with local app on port 80. PLAYWRIGHT_MODULE and PLAYWRIGHT_BROWSER_PATH identify installed Playwright.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_BROWSER_PATH});const page=await browser.newPage();
const mark=(id,date,timeMs,number)=>({id,athleteNumber:number,activityDate:date,timeMs});
const ranking=Array.from({length:7},(_,i)=>({athleteNumber:i+1,publicName:`Atleta ${i+1}`,categoryAge:9,gender:'FEMALE',timeMs:300000,firstTime:'05:00.00',bestTime:'04:30.00',percent:i===6?null:10-i,history:i===6?[mark('only','2026-08-01',300000,i+1)]:[mark('a'+i,'2026-08-01',300000,i+1),mark('b'+i,'2026-08-02',270000,i+1)]}));
ranking[5].history=[mark('a','2026-08-01',300000,6),mark('b','2026-08-01',310000,6),mark('c','2026-08-12',320000,6),mark('d','2026-09-06',285000,6)];
try{
 await page.route('**/api/circuito-virtual/ranking?**',route=>new URL(route.request().url()).searchParams.get('mode')==='evolution'?route.fulfill({json:{ranking}}):route.continue());await page.goto('http://127.0.0.1/projetos/circuito-virtual-11run',{waitUntil:'networkidle'});const section=page.locator('#evolucao');const select=section.getByLabel('Atleta no gráfico');await select.waitFor();
 assert.equal(await section.getByRole('button',{name:/Nº/}).count(),5);
 await select.selectOption('6');assert.equal(await section.locator('.recharts-line-dots circle').count(),4);assert.match(await section.innerText(),/4 marcas em 3 datas/);
 await section.getByText('Ver todos os valores do gráfico',{exact:true}).click();assert.equal(await section.locator('details').first().locator('tbody tr').count(),4);
 await select.selectOption('7');assert.equal(await section.locator('.recharts-line-dots circle').count(),1);assert.match(await section.innerText(),/Sem comparação/);
 await select.selectOption('');assert.equal(await section.getByRole('button',{name:/Nº/}).count(),5);
 for(const width of [1440,768,390]){await page.setViewportSize({width,height:960});await select.selectOption('6');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);}
 console.log('PASS: atleta fora do top 5, quatro marcas incluindo mesma data, sem comparação e responsividade');
}finally{await browser.close();}
