// タブレットで とく の けんさ:
//  1) 正しい 答えを 入れたら ちゃんと ○(せいかい)に なるか(ぜんぶの 単元・ぜんぶの 問題)
//  2) 問題が 出た とき、もう 答え(赤い 線・○・数、答えの 字)が 見えて いないか(LEAK と 出る)
// 使い方: node tools/test/tablet.js docs/index.html 1 2 3 …(学年の 番号。0 は ようじ、21〜26 は ステージ)
//  - 2026/11:大きい数(9けた)が 7けたまでしか 入らない バグ と、えの プリントの 6問めから 答えの ページが 出て いた バグを この けんさで 見つけた
//  - アプリの SV を 見るため、window.__SV を 足した コピーを 作って ひらく
// タブレットで とく:正しい 答えを 入れたら ちゃんと ○に なるか(ぜんぶの 単元・ぜんぶの 問題)
const { chromium } = require('playwright');
(async () => {
  const [src0, ...grades] = process.argv.slice(2);
  const fs = require('fs'), os = require('os'), path = require('path');
  const file0 = path.join(os.tmpdir(), 'tablet-test.html');
  fs.writeFileSync(file0, fs.readFileSync(src0, 'utf8').replace('var SV = { qs:', 'var SV = window.__SV = { qs:'));
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1180, height: 820 } });
  const errs = []; pg.on('pageerror', (e) => errs.push(String(e)));
  await pg.addInitScript(() => { const st = window.setTimeout; window.setTimeout = (f, d, ...a) => st(f, Math.min(d || 0, 5), ...a); });
  await pg.goto('file://' + require('path').resolve(file0)); await pg.waitForTimeout(600);
  await pg.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
  await pg.click('#modeSw button[data-mode="tablet"]');
  const stat = { q: 0, ok: 0, keypad: 0, num: 0, ring: 0, line: 0, self: 0, skip: 0 }, bad = [];
  for (const g of grades) {
    const btns = await pg.evaluate((g) => { const tab = Number(g) >= 21 && Number(g) <= 26 ? 'stage' : 'grade';
      document.querySelector(`[data-tab="${tab}"]`)?.click(); [...document.querySelectorAll(`[data-grade="${g}"]`)].find((x) => x.offsetParent)?.click();
      return [...document.querySelectorAll('.home-units .uk, .home-units .usb')].map((x) => [x.dataset.unit, x.dataset.kind, x.dataset.sub || '0', x.classList.contains('usb'), x.textContent.trim()]); }, g);
    for (const [u, k, sub, isSub, label] of btns) {
      const opened = await pg.evaluate(({ g, u, k, sub, isSub }) => { const tab = Number(g) >= 21 && Number(g) <= 26 ? 'stage' : 'grade';
        document.querySelector(`[data-tab="${tab}"]`)?.click(); [...document.querySelectorAll(`[data-grade="${g}"]`)].find((x) => x.offsetParent)?.click();
        const btn = document.querySelector(isSub ? `.home-units .usb[data-unit="${u}"][data-sub="${sub}"][data-kind="${k}"]` : `.home-units .uk[data-unit="${u}"][data-kind="${k}"]`);
        if (!btn) return false; btn.click(); return true; }, { g, u, k, sub, isSub });
      if (!opened) continue;
      await pg.waitForTimeout(80);
      for (let n = 0; n < 12; n++) {
        await pg.waitForTimeout(30);
        const r = await pg.evaluate(() => {
          const SV = window.__SV; if (!document.getElementById('svEnd').hidden || !SV.qs.length) return { end: true };
          const idx = SV.i, q = SV.qs[idx], st = document.getElementById('svStage');
          const text = st.innerText.replace(/\s+/g, ' ').slice(0, 60);
          const redq = [...st.querySelectorAll('svg *')].filter((e) => /d7263d|215,\s*38,\s*61/i.test((e.getAttribute('stroke')||'') + (e.getAttribute('fill')||'') + getComputedStyle(e).stroke + getComputedStyle(e).fill) && e.getBoundingClientRect().width > 0).length + [...st.querySelectorAll('.key, .key-fig, .kv, .key-line')].filter((e) => e.getBoundingClientRect().width > 0).length;
          if (redq) window.__leak = (window.__leak || []).concat([`${idx}:${redq}:${text.slice(0,30)}`]);
          const click = (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          let mode;
          if (q.keys) {
            mode = q.tg?.type === 'num' ? 'num' : 'keypad';
            if (q.keys.some((x) => /[^0-9.]/.test(String(x)))) { mode = 'skip'; }
            else {
              const slots = [...st.querySelectorAll('.sv-slot, .sv-fslot')].sort((a, b) => a.dataset.i - b.dataset.i);
              if (slots.length !== q.keys.length) return { idx, mode, text, err: `slots ${slots.length} keys ${q.keys.length}` };
              slots.forEach((s, i) => { click(s); for (const ch of String(q.keys[i])) click(document.querySelector(`.sv-pad button[data-k="${ch}"]`)); });
              const typed = slots.map((s) => s.classList.contains('sv-fslot') ? s.querySelector('text').textContent : s.textContent);
              click(document.getElementById('svGo'));
              return { idx, mode, text, ok: SV.res[idx], keys: q.keys, typed };
            }
          } else if (q.tg) {
            mode = q.tg.type;
            const svg = st.querySelector('svg.sv-touch'); const m = svg.getScreenCTM();
            const scr = (x, y) => { const p = new DOMPoint(x, y).matrixTransform(m); return [p.x, p.y]; };
            const pe = (type, x, y) => { const [cx, cy] = scr(x, y); svg.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: cx, clientY: cy, pointerId: 1 })); };
            if (mode === 'ring') for (const r of q.tg.rings) pe('pointerdown', r.x, r.y);
            else for (const [i, j] of q.tg.pairs) { if (q.tg.given.some(([a, b]) => (a === i && b === j) || (a === j && b === i))) continue; const D = q.tg.dots; pe('pointerdown', D[i].x, D[i].y); pe('pointerup', D[j].x, D[j].y); }
            click(document.getElementById('svGo'));
            return { idx, mode, text, ok: SV.res[idx], n: (q.tg.rings || q.tg.pairs).length };
          } else mode = 'self';
          // self / skip:こたえを みる → できた
          document.getElementById('svShow') && click(document.getElementById('svShow'));
          document.querySelector('[data-self="1"]') && click(document.querySelector('[data-self="1"]'));
          if (mode === 'skip') { SV.busy = false; }
          return { idx, mode, text, ok: true, self: true };
        });
        if (r.end) break;
        stat.q++; stat[r.mode]++;
        if (r.ok) stat.ok++; else { bad.push(`${g}/${u}/${sub}/${k} 「${label}」 q${r.idx + 1} ${r.mode} ${r.err || ''} keys=${JSON.stringify(r.keys)} typed=${JSON.stringify(r.typed)} n=${r.n ?? ''} | ${r.text}`); 
          // まちがい あつかいの とき:2回め → こたえ → つぎへ
          await pg.evaluate(() => { const c = (el) => el?.dispatchEvent(new MouseEvent('click', { bubbles: true })); c(document.getElementById('svGo')); c(document.getElementById('svGo')); c(document.getElementById('svNextBtn')); });
        }
        await pg.waitForTimeout(40);
        await pg.evaluate(() => document.getElementById('svNextBtn')?.dispatchEvent(new MouseEvent('click', { bubbles: true })));
      }
      const lk = await pg.evaluate(() => { const l = window.__leak || []; window.__leak = []; return l; });
      if (lk.length) { bad.push(`LEAK ${g}/${u}/${sub}/${k} 「${label}」 ${lk.join(' | ')}`); }
      await pg.evaluate(() => document.getElementById('svBack')?.click());
    }
    console.error('grade', g, JSON.stringify(stat), bad.length);
  }
  console.log(JSON.stringify(stat)); bad.forEach((x) => console.log(' ', x)); console.log(errs.slice(0, 5));
  await b.close();
})();
