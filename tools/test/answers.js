// 答えの けんさ:答えの ページに 答えが 出ない 問題が ないか
// 使い方: [SEED=3] node tools/test/answers.js [build/test.html] [結果.json] [学年(1 や 1,2)]
//  - 問題に 答えが 1つも ない(四角の 答え・答えの メモ・答えの 図 の どれも ない)
//  - 答えの 四角(□)に 答えが 入らない
const { chromium } = require('playwright');
(async () => {
  const [file0 = 'build/test.html', outJson, only] = process.argv.slice(2);
  const b = await chromium.launch();
  const pg = await b.newPage();
  const errs = []; pg.on('pageerror', (e) => errs.push(String(e)));
  await pg.goto('file://' + require('path').resolve(file0));
  await pg.waitForTimeout(300);
  const rows = await pg.evaluate(({ only, seed }) => {
    const T = window.__T, out = [];
    const RED = /#d7263d/i;
    const hasRed = (fig) => !!fig && (fig.type === 'multi' ? fig.items.some(hasRed) : (fig.items || []).some((it) => RED.test(it.color || '') || RED.test(it.fill || '')));
    const grades = only ? only.split(',') : Object.keys(T.GRADES);
    for (const g of grades) {
      const gd = T.GRADES[g];
      if (!gd) continue;
      for (const u of gd.units || []) {
        if (!u.topics || !u.topics.length) continue;
        const combos = [];
        u.topics.forEach((tp, i) => (tp.kinds || []).filter((k) => k !== 'test' && k !== 'matome').forEach((k) => combos.push([i + 1, k])));
        for (const k of ['test', 'matome']) if (u.topics.some((tp) => (tp.kinds || []).includes(k))) combos.push([0, k]);
        for (const [topicNo, kind] of combos) for (const level of ['basic', 'challenge']) {
          let sheet;
          try { sheet = T.buildSheet({ grade: Number(g), gradeData: gd, unitId: u.id, kind, level, count: null, seed, topicNo }); } catch (e) { continue; }
          const pol = T.makeKanjiPolicy(T.kanji_default, gd.grade ?? Number(g), {});
          const d = document.createElement('div');
          d.innerHTML = T.sheetHtml(sheet, { policy: pol, withAnswers: true, gradeLabel: '', hints: false, answerMode: 'key', trace: false });
          const P = [];
          for (const S of sheet.sections) {
            const sec = d.querySelector(`section.block[data-sec="${S.no}"]`);
            if (!sec) continue;
            const lis = [...sec.querySelectorAll(':scope ol.items > li')];
            S.problems.forEach((pr, k) => {
              if (pr.example) return;
              const node = lis.length ? lis[k] : sec;
              if (!node) return;
              const a = pr.answer || {};
              const keyTxt = [...node.querySelectorAll('.kv, .key-note, .key-line')].map((x) => x.textContent.trim()).join('');
              const keyFig = !!node.querySelector('.key-fig svg');
              const dataAns = hasRed(a.figure) || String(a.display ?? '').trim() !== '' || (a.fills || []).some((x) => String(x ?? '').trim() !== '');
              const domAns = keyTxt !== '' || keyFig;
              const yoji = kind === 'yoji' || sheet.filled || !node.querySelector('.key');
              if (!domAns && !(yoji && dataAns)) P.push(`(${k + 1}) 答えなし「${(pr.text || '').replace(/\[\[[^\]]*\]\]|\{([^|}]*)\|[^}]*\}/g, '$1').slice(0, 24)}」`);
              // 答えの 四角に 答えが 入らない
              const naked = [...node.querySelectorAll('.abox, .pbox, .tbox')].filter((bx) => !bx.closest('.kbox') && !bx.closest('.key'));
              if (!yoji && naked.length && !keyFig) P.push(`(${k + 1}) 四角に 答えが ない ${naked.length}こ「${(pr.text || '').slice(0, 20)}」`);
            });
          }
          out.push({ id: `${g}/${u.id}/${topicNo}/${kind}/${level}`, name: u.name, P });
        }
      }
    }
    return out;
  }, { only, seed: Number(process.env.SEED || 3) });
  if (outJson) require('fs').writeFileSync(outJson, JSON.stringify(rows));
  const bad = rows.filter((r) => r.P.length);
  console.log('cases', rows.length, 'problems', bad.length, 'pageerrors', errs.length);
  for (const r of bad.slice(0, 80)) console.log(' ', r.id, r.name, '|', r.P.slice(0, 3).join(' / '));
  await b.close();
})();
