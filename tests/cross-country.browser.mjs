// Run only against a local server using a disposable SQLITE_PATH.
// PLAYWRIGHT_MODULE, PLAYWRIGHT_BROWSER_PATH, ADMIN_USER and ADMIN_PASSWORD are required.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({headless:true, executablePath:process.env.PLAYWRIGHT_BROWSER_PATH});
const base = 'http://127.0.0.1';
const slug = 'circuito-cross-country-ivcl-11run';
const page = await browser.newPage({viewport:{width:1440,height:1000},httpCredentials:{username:process.env.ADMIN_USER,password:process.env.ADMIN_PASSWORD}});
const errors=[];page.on('pageerror',error=>errors.push(error.message));
mkdirSync('artifacts/cross-country',{recursive:true});
try {
  assert.equal((await fetch(base+'/admin/cross-country')).status,401);
  await page.goto(base+'/'+slug,{waitUntil:'networkidle'});
  assert.equal(await page.locator('#categorias article').count(),9);
  assert.equal(await page.locator('#programacao ol li').count(),20);
  assert.match(await page.locator('#programacao').innerText(),/Sub 14.*1.500 m/);
  for(const width of [1440,768,390]) {
    await page.setViewportSize({width,height:1000});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width,`public overflow ${width}`);
    await page.screenshot({path:`artifacts/cross-country/public-${width}.jpg`,type:'jpeg',quality:65,fullPage:true});
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.getByRole('button',{name:'Inscrever atleta',exact:true}).first().click();
  const dialog=page.getByRole('dialog',{name:'Sua primeira largada no Cross'});
  await dialog.waitFor();
  await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
  await page.getByRole('button',{name:'Inscrever atleta',exact:true}).first().click();
  for(const width of [1440,390]) {
    await page.setViewportSize({width,height:1000});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width,`form overflow ${width}`);
    assert.ok(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1));
    await page.screenshot({path:`artifacts/cross-country/form-${width}.jpg`,type:'jpeg',quality:65});
  }
  const fields={name:'Responsável QA Cross',email:'cross-qa@example.test',phone:'19999999999',city:'Campinas',state:'SP',athlete_name:'Atleta QA Cross '+Date.now(),birth_date:'2013-12-31',team:'Equipe QA',term_acceptor_name:'Responsável QA Cross',term_acceptor_cpf:'52998224725'};
  for(const [name,value] of Object.entries(fields)) await dialog.locator(`[name="${name}"]`).fill(value);
  await dialog.locator('[name="gender"]').selectOption('Feminino');
  assert.match(await dialog.getByRole('status').innerText(),/Sub 14.*1.500 m/);
  await dialog.locator('[name="accepted_terms"]').check();await dialog.locator('[name="accepted_contact"]').check();
  const responsePromise=page.waitForResponse(r=>r.url().endsWith('/api/leads')&&r.request().method()==='POST');
  await dialog.getByRole('button',{name:'Solicitar inscrição · 15 de novembro'}).click();
  const response=await responsePromise;const result=await response.json();assert.equal(response.status(),200,JSON.stringify(result));
  await page.waitForURL('**/obrigado');
  const authData=await (await page.request.get(base+'/api/admin/leads')).json();
  const saved=authData.leads.find(l=>l.id===result.id);assert.ok(saved);assert.equal(saved.category,'Sub 14');assert.equal(saved.age,'13');
  const payload=JSON.parse(saved.payload_json);assert.equal(payload.race_event,'1.500 m');assert.equal(payload.event_edition,'1ª edição · 15/11/2026');assert.ok(saved.term_snapshot);
  const valid={...fields,gender:'Feminino',project_type:slug,accepted_terms:true,accepted_contact:true};
  for(const bad of [{birth_date:'2018-01-01'},{birth_date:'2013-02-29'},{gender:'outro'},{accepted_terms:false},{term_acceptor_cpf:'11111111111'}]) {
    const invalid=await page.request.post(base+'/api/leads',{data:{...valid,...bad}});assert.equal(invalid.status(),400,JSON.stringify(bad));
  }
  const badEdit=await page.request.patch(base+'/api/admin/leads',{data:{id:result.id,profile:{birth_date:'2018-01-01'}}});assert.equal(badEdit.status(),400);
  await page.goto(base+'/admin/cross-country',{waitUntil:'networkidle'});
  await page.getByLabel('Buscar atleta, responsável, cidade ou categoria').fill(fields.athlete_name);
  await page.getByRole('button',{name:'Ver dados completos',exact:true}).click();
  const details=page.getByRole('dialog',{name:`Cadastro de ${fields.athlete_name}`});
  await details.getByRole('button',{name:'Editar perfil',exact:true}).click();
  await details.locator('[name="birth_date"]').fill('2009-12-31');
  await details.locator('[name="gender"]').selectOption('Masculino');
  await details.getByRole('button',{name:'Salvar alterações',exact:true}).click();
  await details.getByText('Perfil atualizado com sucesso.').waitFor();
  await details.getByRole('button',{name:'Fechar cadastro',exact:true}).click();
  await page.getByText('Sub 18 · 3.000 m · Masculino',{exact:true}).waitFor();
  await page.locator('.admin-status select').selectOption('Aceitas');
  await page.getByText('Nenhum cadastro nesta etapa.',{exact:true}).waitFor();
  await page.getByRole('tab',{name:/^Aceitas/}).click();
  await page.getByRole('heading',{name:fields.athlete_name,exact:true}).waitFor();
  await page.reload({waitUntil:'networkidle'});await page.getByLabel('Buscar atleta, responsável, cidade ou categoria').fill(fields.athlete_name);await page.getByRole('tab',{name:/^Aceitas/}).click();
  await page.getByRole('heading',{name:fields.athlete_name,exact:true}).waitFor();
  for(const width of [1440,768,390]) {
    await page.setViewportSize({width,height:1000});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width,`admin overflow ${width}`);
    await page.screenshot({path:`artifacts/cross-country/admin-${width}.jpg`,type:'jpeg',quality:65,fullPage:true});
  }
  await page.goto(base+'/circuito-futuro-11',{waitUntil:'networkidle'});
  assert.match(await page.locator('main').innerText(),/Sub 18/);assert.match(await page.locator('main').innerText(),/3.000 m/);
  await page.goto(base+'/cadastro/circuito-futuro-11',{waitUntil:'networkidle'});
  assert.equal(await page.locator('[name="race_event"] option').count(),10);assert.equal(await page.locator('[name="birth_date"]').getAttribute('min'),'2010-01-01');
  const legacy=await page.request.post(base+'/api/leads',{data:{...valid,project_type:'circuito-futuro-11',birth_date:'2010-12-31',race_event:'Sub 18 - 17 anos no ano - 3.000m',guardian_name:'Responsável QA',guardian_cpf:'52998224725',guardian_rg:'123456',guardian_email:'qa@example.test',guardian_phone:'19999999999',athlete_cpf:'52998224725',athlete_rg:'123456',payment_plan:'Inscrição por etapa - valor a confirmar'}});assert.equal(legacy.status(),200,await legacy.text());
  assert.deepEqual(errors,[]);
  console.log('PASS: inscrição, categoria automática, validações, edição, confirmação, persistência, circuito 2027 e layouts 1440/768/390.');
} finally { await browser.close(); }
