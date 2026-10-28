// くらしの数学(特別支援 GRADES[28])の検査:ふりがなのない漢字がないか、まとめて作ったときに重複でとまらないか
// 使い方: node tools/test/kurashi.js [build/test.html]
const { chromium } = require('playwright');
(async () => {
  const file = process.argv[2] || 'build/test.html';
  const b = await chromium.launch(); const pg = await b.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(String(e)));
  await pg.goto('file://' + require('path').resolve(file));
  const res = await pg.evaluate(() => {
    const T = window.__T, out = { raw: {}, build: [], ex: {} };
    const isK = (ch) => /[一-鿿々]/.test(ch);
    const g = T.GRADES[28];
    const col = (pr) => {
      const a = [pr.text, pr.answer?.display, ...(pr.workspace?.labels || [])];
      const walk = (f) => { if (!f) return; if (f.type === 'multi') f.items.forEach(walk); if (f.type === 'draw') f.items.forEach(it => it.t === 'text' && a.push(String(it.s))); if (f.type === 'table') a.push(...f.head, ...f.rows.flat()); if (f.type === 'clocks') f.clocks.forEach(c => c.caption && a.push(c.caption)); };
      walk(pr.figure); walk(pr.answer?.figure);
      return a;
    };
    for (const unit of g.units) {
      [unit.rubyName || unit.name, ...unit.topics.map(t => t.rubyLabel || t.label)].forEach(s => { for (const ch of String(s).replace(/\{[^{}|]+\|[^{}]*\}/g, '')) if (isK(ch)) out.raw[ch] = (out.raw[ch] || 0) + 1; });
      for (const topic of unit.topics) for (const level of ['basic', 'normal', 'challenge']) {
        const gen = T.getGenerator(topic.generator), p = T.topicParams(topic, level);
        for (let i = 0; i < 80; i++) {
          const pr = gen.generate(T.makeRng(500 + i * 7919), p, { index: i });
          for (const s of col(pr)) for (const ch of String(s ?? '').replace(/\{[^{}|]+\|[^{}]*\}/g, '')) if (isK(ch)) { out.raw[ch] = (out.raw[ch] || 0) + 1; if (!out.ex[ch]) out.ex[ch] = String(s).slice(0, 70); }
        }
      }
      // いちばん多い問題数で作ってみる
      for (const kind of ['drill', 'word', 'figure', 'test', 'record', 'matome']) {
        if (!unit.topics.some(t => t.kinds.includes(kind))) continue;
        const counts = { drill: 30, word: 10, figure: 10, test: null, record: null, matome: null }[kind];
        for (const level of ['basic', 'normal', 'challenge']) for (const seed of [1, 2, 3]) {
          try { T.buildSheet({ gradeData: g, unitId: unit.id, kind, level, count: counts, seed, extra: kind === 'matome' ? 6 : 0 }); }
          catch (e) { out.build.push(`${unit.id} ${kind} ${level} ${seed}: ${e.message}`); }
        }
        unit.topics.forEach((tp, ti) => { if (!tp.kinds.includes(kind) || kind === 'test' || kind === 'matome' || unit.topics.length < 2) return; for (const level of ['basic', 'normal', 'challenge']) { try { T.buildSheet({ gradeData: g, unitId: unit.id, kind, level, count: counts, seed: 9, topicNo: ti + 1 }); } catch (e) { out.build.push(`${unit.id}:${ti + 1} ${kind} ${level}: ${e.message}`); } } });
      }
    }
    return out;
  });
  const raw = Object.entries(res.raw);
  console.log('ふりがなのない漢字:', raw.length ? raw.map(([k, n]) => `${k}(${n}) ${res.ex[k] || ''}`).join('\n') : 'なし');
  console.log('作れなかったプリント:', res.build.length ? '\n' + res.build.join('\n') : 'なし');
  console.log('pageerrors', errs.slice(0, 3));
  await b.close();
  if (raw.length || res.build.length || errs.length) process.exitCode = 1;
})();
