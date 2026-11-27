// 図の 大きさの けんさ:まとめて作る(3まい)で、おなじ 種類の 図が ページごとに 大きく なったり 小さく なったり しないか
// 使い方: node tools/test/figsize.js [docs/index.html] [結果.json] [学年(1 や 1,2)] [まい数=3]
//  - おなじ 問題(data-gen)の 図の「1マス(viewBox 1)あたりの 大きさ」が 8% いじょう ちがうと 出す
//  - 2026/11 の けんさ:146 → 0(unifyFigs で そろえた)
const { chromium } = require('playwright');
(async () => {
  const [file0 = 'docs/index.html', outJson, only, nb = '3'] = process.argv.slice(2);
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1000, height: 1200 } });
  const errs = []; pg.on('pageerror', (e) => errs.push(String(e)));
  await pg.addInitScript(() => { window.print = () => {}; });
  await pg.goto('file://' + require('path').resolve(file0));
  await pg.waitForTimeout(400);
  const grades = only ? only.split(',') : await pg.$$eval('#grade option', (os) => os.map((o) => o.value));
  const rows = [];
  for (const g of grades) {
    const combos = await pg.evaluate((g) => {
      const set = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change')); };
      set('grade', g);
      const out = [];
      for (const uo of [...document.getElementById('unit').options].filter((o) => !o.disabled)) {
        set('unit', uo.value);
        const subs = !document.getElementById('subWrap').hidden ? ['0', ...[...document.getElementById('subunit').options].map((x) => x.value).filter((v) => v !== '0')] : ['0'];
        for (const s of subs) {
          set('subunit', s);
          for (const k of [...document.getElementById('kind').options].filter((x) => !x.disabled)) out.push([uo.value, s, k.value]);
        }
      }
      return out;
    }, g);
    for (const [u, s, k] of combos) {
      const has = await pg.evaluate(({ g, u, s, k }) => {
        const set = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change')); };
        set('grade', g); set('unit', u); if (!document.getElementById('subWrap').hidden) set('subunit', s); set('kind', k);
        document.getElementById('level').value = 'normal'; document.getElementById('seed').value = '7';
        document.getElementById('btnMake').click();
        return !!document.querySelector('#preview article.sheet:not(.answers) svg[viewBox]');
      }, { g, u, s, k });
      if (!has) continue;
      await pg.evaluate((nb) => {
        document.getElementById('btnBatch').click();
        document.getElementById('batchN').value = nb;
        document.querySelector('input[name=bAns][value=none]')?.click();
        document.querySelector('input[name=bOut][value=view]').click();
        document.getElementById('batchGo').click();
      }, nb);
      await pg.waitForFunction(() => !document.getElementById('batchDlg').open, null, { timeout: 60000 }).catch(() => {});
      const r = await pg.evaluate(() => {
        const G = new Map();
        document.querySelectorAll('#preview article.sheet:not(.answers)').forEach((sh, pi) => {
          for (const svg of sh.querySelectorAll('.body svg[viewBox]')) {
            if (svg.closest('.key, .key-fig')) continue;
            const vb = svg.getAttribute('viewBox').split(/\s+/).map(Number), w = svg.getBoundingClientRect().width;
            if (!(vb[2] > 0) || w < 4) continue;
            const holder = svg.closest('[data-gen]');
            const key = (holder?.dataset.gen || '?') + ':' + (svg.getAttribute('class') || 'svg');
            if (!G.has(key)) G.set(key, []);
            let z = 1;
            for (let e = svg; e && e !== sh; e = e.parentElement) z *= Number(e.style?.zoom) || 1;
            G.get(key).push({ s: w / vb[2], z, p: pi + 1 });
          }
        });
        const P = [];
        for (const [key, a] of G) {
          const mn = Math.min(...a.map((x) => x.s)), mx = Math.max(...a.map((x) => x.s));
          if (mx / mn <= 1.08) continue;
          // ページの 拡大・縮小(zoom)の ちがい か、図の はばが 入りきらずに ちぢんだ ちがい か
          const zs = a.map((x) => x.z), zmn = Math.min(...zs), zmx = Math.max(...zs);
          const why = zmx / zmn > 1.04 ? 'ページの拡大縮小' : '図のはば';
          // 角・三角形・立体 などの 形の 図は 1問ごとに 形が ちがうので、はばの ちがいは そのままで よい(アプリの FIG_SHAPE と おなじ)
          if (why === '図のはば' && /angle|Angle|tri[A-Z]|triClassify|quad|Quad|poly|Poly|area\.figure|areaComposite|prism|Prism|cuboid|Cuboid|cong|Cong|circle\.|proof|Proof|trig|setSquare|diagonal|volFigure|solid|Solid|boxFaces|route|approx|Sym|sym|scale|Scale/.test(key)) continue;
          P.push(`${key} ${why} ${Math.round(mn * 100) / 100}〜${Math.round(mx * 100) / 100} (p${a.find((x) => x.s === mn).p}/p${a.find((x) => x.s === mx).p})`);
        }
        return { P, pages: document.querySelectorAll('#preview article.sheet').length };
      });
      rows.push({ id: `${g}/${u}/${s}/${k}`, ...r });
    }
  }
  if (outJson) require('fs').writeFileSync(outJson, JSON.stringify(rows));
  const bad = rows.filter((r) => r.P.length);
  console.log('cases', rows.length, 'problems', bad.length, 'pageerrors', errs.length);
  for (const r of bad.slice(0, 80)) console.log(' ', r.id, '|', r.P.slice(0, 2).join(' / '));
  await b.close();
})();
