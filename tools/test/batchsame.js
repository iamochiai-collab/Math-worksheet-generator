// まとめて 作った ときの けんさ:2まいめ いこうの プリントが 1まいめと おなじ ならび(ページごとの 問題の 数・れつの 数)か
// 使い方: node tools/test/batchsame.js docs/index.html out.json [grades] [N=5]
//  - 1まいの プリントが 2ページ いじょうの ときは、プリントごとに くらべる
//  - さいごの プリントが ページ数で とちゅうで きれる ときや、40回 ためしても おなじに ならない ときは 出る(2026/11:863 ケース 中 8)
// まとめて 作った ページの レイアウトが 1ページめと おなじか
const { chromium } = require('playwright');
(async () => {
  const [file0, out, only, N='4'] = process.argv.slice(2);
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1000, height: 1200 } });
  const errs=[]; pg.on('pageerror',e=>errs.push(String(e)));
  await pg.addInitScript(() => { window.print = () => {}; });
  await pg.goto('file://' + require('path').resolve(file0)); await pg.waitForTimeout(400);
  await pg.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
  const grades = only ? only.split(',') : await pg.$$eval('#grade option', os => os.map(o => o.value));
  const rows=[]; let n=0;
  for (const g of grades) {
    const combos = await pg.evaluate((g) => { const set=(id,v)=>{const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('change'));};
      set('grade',g); const o=[]; for (const uo of [...document.getElementById('unit').options].filter(x=>!x.disabled)) { set('unit',uo.value);
        for (const k of [...document.getElementById('kind').options].filter(x=>!x.disabled)) o.push([uo.value,k.value]); } return o; }, g);
    for (const [u,k] of combos) {
      await pg.evaluate(({g,u,k,N}) => { const set=(id,v)=>{const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('change'));};
        set('grade',g);set('unit',u);set('kind',k);document.getElementById('level').value='normal';document.getElementById('seed').value='11';document.getElementById('btnMake').click();
        window.__single = [...document.querySelectorAll('#preview article.sheet:not(.answers)')].length;
        document.getElementById('btnBatch').click();document.getElementById('batchN').value=N;
        document.querySelector('input[name=bAns][value=none]')?.click();document.querySelector('input[name=bOut][value=view]').click();document.getElementById('batchGo').click();},{g,u,k,N});
      await pg.waitForFunction(() => !document.getElementById('batchDlg').open, null, { timeout: 90000 }).catch(()=>{});
      const r = await pg.evaluate(() => {
        const sig = (sh) => [...sh.querySelectorAll('.body > .block')].map(bl => {
          const ol = bl.querySelector('ol.items, .items'); const cols = ol ? getComputedStyle(ol).gridTemplateColumns.split(' ').filter(Boolean).length : 0;
          const ins = (bl.querySelector('.instr, .instruction, h3, .q-head')?.textContent || '').trim().slice(0, 12);
          return `${ins}×${bl.querySelectorAll('li.item').length}c${cols}`; }).join(' / ');
        const pages = [...document.querySelectorAll('#preview article.sheet:not(.answers)')];
        return { single: window.__single, sigs: pages.map(sig), items: pages.map(p=>p.querySelectorAll('li.item').length) };
      });
      n++;
      const per = r.single || 1;
      const bad = r.sigs.some((s, i) => s !== r.sigs[i % per]);
      if (bad) { rows.push({ id: `${g}/${u}/${k}`, ...r }); console.log(`${g}/${u}/${k} per${per} items ${r.items.join(',')}`); }
    }
    console.error('grade', g, n, rows.length);
  }
  require('fs').writeFileSync(out, JSON.stringify(rows, null, 1));
  console.log('cases', n, 'bad', rows.length, 'errs', errs.slice(0,3));
  await b.close();
})();
