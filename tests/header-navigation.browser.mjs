// Read-only regression for open menus. Set BASE_URL and Playwright paths as needed.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_BROWSER_PATH});
const page=await browser.newPage();const base=process.env.BASE_URL||'http://127.0.0.1';
mkdirSync('artifacts/navigation',{recursive:true});
// Exercise the wider signed-in label from the reported screenshot; no real account is used.
await page.route('**/api/members/session',r=>r.fulfill({json:{loggedIn:true}}));
async function checkPanel(panel){
 const failures=await panel.evaluate(el=>{
   const box=el.getBoundingClientRect();const errors=[];
   if(box.left < -1 || box.right > innerWidth+1)errors.push(`panel outside viewport ${box.left}..${box.right}/${innerWidth}`);
   const links=el.classList.contains('mobile-nav')?el.querySelectorAll('a, summary'):el.querySelectorAll(':scope > a, :scope > .nav-submenu > button');
   for(const link of links){
     if(!link.getClientRects().length)continue;
     const rect=link.getBoundingClientRect(),span=link.querySelector('span');
     if(rect.left<box.left-1||rect.right>box.right+1)errors.push(`link outside panel: ${link.textContent}`);
     if(span){const range=document.createRange();range.selectNodeContents(span);for(const text of range.getClientRects()){if(text.left<rect.left-1||text.right>rect.right+1)errors.push(`text outside link: ${span.textContent}`);}}
     if(link.scrollWidth>link.clientWidth+1)errors.push(`link overflow: ${link.textContent}`);
   }
   return errors;
 });assert.deepEqual(failures,[]);
}
try{
 for(const route of ['/', '/circuito-cross-country-ivcl-11run']){
  await page.goto(base+route,{waitUntil:'networkidle'});
  for(const width of [1061,1100,1280,1440,1920]){
   await page.setViewportSize({width,height:1000});
   const groups=page.locator('.desktop-nav > .nav-dropdown');
   for(let i=0;i<await groups.count();i++){
    const group=groups.nth(i);await group.locator(':scope > button').hover();await page.waitForTimeout(180);
    const menu=group.locator(':scope > .nav-dropdown-menu');await checkPanel(menu);
    const nested=menu.locator(':scope > .nav-submenu');
    for(let j=0;j<await nested.count();j++){
     const item=nested.nth(j);await item.locator(':scope > button').hover();await page.waitForTimeout(180);await checkPanel(item.locator('.nav-nested-menu'));
    }
    if(i===0&&width===1440)await page.screenshot({path:`artifacts/navigation/${route==='/'?'home':'cross'}-desktop.jpg`,type:'jpeg',quality:70});
   }
  }
  for(const width of [320,390,768,1060]){
   await page.setViewportSize({width,height:900});await page.getByRole('button',{name:'Abrir menu',exact:true}).click();
   const menu=page.locator('#mobile-navigation');
   for(const details of await menu.locator('details').all()){await details.locator('summary').click();}
   await checkPanel(menu);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);
   if(width===390)await page.screenshot({path:`artifacts/navigation/${route==='/'?'home':'cross'}-mobile.jpg`,type:'jpeg',quality:70});
   await page.keyboard.press('Escape');await menu.waitFor({state:'hidden'});
  }
 }
 console.log('PASS: todos os menus e submenus abertos, textos dentro dos links, painéis dentro da tela, home/Cross, 9 larguras, menu mobile e Escape.');
}finally{await browser.close();}
