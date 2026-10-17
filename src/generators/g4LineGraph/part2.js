
  // ===== 生成器 =====
  const LG_TEXT = (th) => `{下|した}の{折|お}れ{線|せん}グラフは、${th.title}を{表|あらわ}したものです。`;
  const numberQs = (qs) => qs.map((q, i) => `(${i + 1}) ${q}`);
  const linesWs = (n) => ({ type: "lines", labels: Array.from({ length: n }, (_, i) => `(${i + 1})`) });
  // 1つの折れ線についての問い(読む・変わり方・目もり)。kind ごとに作れるかを調べ、作れたら {q, a, m} を返す
  function askOf(kind, th, v, rng) {
    const d = diffsOf(v), max = Math.max(...v), min = Math.min(...v);
    switch (kind) {
      case "value": {
        const k = rng.int(0, v.length - 1);
        return { q: `${th.items[k]}の${th.q}は{何|なん}${th.unit}ですか。`, a: val(th, v[k]), m: { kind, k } };
      }
      case "max": {
        const k = uniqueIdx(v, max);
        if (k < 0 || th.mono) return null;
        return { q: `${th.q}がいちばん${th.w.hi}のはいつですか。また、それは{何|なん}${th.unit}ですか。`, a: `${th.items[k]}で${val(th, max)}`, m: { kind, k } };
      }
      case "min": {
        const k = uniqueIdx(v, min);
        if (k < 0 || th.mono) return null;
        return { q: `${th.q}がいちばん${th.w.lo}のはいつですか。また、それは{何|なん}${th.unit}ですか。`, a: `${th.items[k]}で${val(th, min)}`, m: { kind, k } };
      }
      case "diff": {
        const a = rng.int(0, v.length - 2), b = rng.int(a + 1, v.length - 1);
        if (v[a] === v[b]) return null;
        return { q: `${th.items[a]}と${th.items[b]}の${th.q}のちがいは{何|なん}${th.unit}ですか。`, a: val(th, Math.abs(v[a] - v[b])), m: { kind, a, b } };
      }
      case "which": {
        const ks = v.map((_, i) => i).filter((i) => v.filter((x) => x === v[i]).length === 1);
        if (!ks.length) return null;
        const k = rng.pick(ks);
        return { q: `${th.q}が${val(th, v[k])}だったのはいつですか。`, a: th.items[k], m: { kind, k } };
      }
      case "range":
        if (th.mono) return null;
        return { q: `${th.q}がいちばん${th.w.hi}ときと、いちばん${th.w.lo}ときのちがいは{何|なん}${th.unit}ですか。`, a: val(th, max - min), m: { kind } };
      case "upMax": {
        const i = uniqueIdx(d, Math.max(...d));
        if (i < 0 || d[i] <= 0 || !th.w.up) return null;
        return { q: `${upN(th)}がいちばん{大|おお}きいのは、どこからどこの{間|あいだ}ですか。`, a: between(th, i), m: { kind, i } };
      }
      case "downMax": {
        const i = uniqueIdx(d, Math.min(...d));
        if (i < 0 || d[i] >= 0 || !th.w.down) return null;
        return { q: `${downN(th)}がいちばん{大|おお}きいのは、どこからどこの{間|あいだ}ですか。`, a: between(th, i), m: { kind, i } };
      }
      case "flat": {
        const runs = flatRuns(v);
        if (runs.length !== 1) return null;
        const [s, e] = runs[0];
        return { q: `${th.q}が${FLAT}のは、どこからどこまでの{間|あいだ}ですか。`, a: between(th, s, e), m: { kind, s, e } };
      }
      case "state": {
        const i = rng.int(0, d.length - 1);
        const opts = [th.w.upS, th.w.downS, FLAT].filter(Boolean);
        const ans = d[i] > 0 ? th.w.upS : d[i] < 0 ? th.w.downS : FLAT;
        if (!ans) return null;
        return { q: `${th.items[i]}から${th.items[i + 1]}までの{間|あいだ}、${th.q}はどうなっていますか。（${opts.join("・")}）から{選|えら}びましょう。`, a: ans, m: { kind, i } };
      }
      case "step":
        return { q: `たてのじくの1{目|め}もりは、{何|なん}${th.unit}を{表|あらわ}していますか。`, a: val(th, th.step), m: { kind } };
      case "yWhat":
        return { q: "たてのじくは、{何|なに}を{表|あらわ}していますか。", a: `${th.q}(${th.unit})`, m: { kind } };
      case "xWhat":
        return { q: "よこのじくは、{何|なに}を{表|あらわ}していますか。", a: th.xName, m: { kind } };
      case "wave":
        if (!th.wave) return null;
        return { q: "たてのじくの「≈」のしるしは、{何|なに}を{表|あらわ}していますか。", a: `0から${val(th, th.wave)}までの{目|め}もりを{省|はぶ}いている`, m: { kind } };
      case "offValue": {
        const ks = v.map((_, i) => i).filter((i) => v[i] % (th.step * th.major) !== 0);
        if (!ks.length || th.step === 1 && !th.dp) return null;
        const k = rng.pick(ks);
        return { q: `${th.items[k]}の${th.q}は{何|なん}${th.unit}ですか。`, a: val(th, v[k]), m: { kind: "value", k } };
      }
    }
    return null;
  }
  // 値が同じまま続く区間 [始め, 終わり] の一覧
  function flatRuns(v) {
    const runs = [];
    for (let i = 0; i + 1 < v.length; i++) {
      if (v[i] !== v[i + 1]) continue;
      const s = i;
      while (i + 1 < v.length && v[i] === v[i + 1]) i++;
      runs.push([s, i]);
    }
    return runs;
  }
  // 検算: 図から読んだ値で答えを作り直してくらべる
  function checkAsk(m, th, v, got) {
    const d = diffsOf(v);
    const want = (() => {
      switch (m.kind) {
        case "value":
          return val(th, v[m.k]);
        case "max":
        case "min": {
          const x = m.kind === "max" ? Math.max(...v) : Math.min(...v);
          if (v.filter((y) => y === x).length !== 1 || v[m.k] !== x) return "×";
          return `${th.items[m.k]}で${val(th, x)}`;
        }
        case "diff":
          return val(th, Math.abs(v[m.a] - v[m.b]));
        case "which":
          return v.filter((y) => y === v[m.k]).length === 1 ? th.items[m.k] : "×";
        case "range":
          return val(th, Math.max(...v) - Math.min(...v));
        case "upMax":
        case "downMax": {
          const x = m.kind === "upMax" ? Math.max(...d) : Math.min(...d);
          if (d.filter((y) => y === x).length !== 1 || d[m.i] !== x || (m.kind === "upMax" ? x <= 0 : x >= 0)) return "×";
          return between(th, m.i);
        }
        case "flat": {
          for (let i = 0; i + 1 < v.length; i++) if ((v[i] === v[i + 1]) !== (i >= m.s && i < m.e)) return "×";
          return between(th, m.s, m.e);
        }
        case "state":
          return d[m.i] > 0 ? th.w.upS : d[m.i] < 0 ? th.w.downS : FLAT;
        case "step":
          return val(th, th.step);
        case "yWhat":
          return `${th.q}(${th.unit})`;
        case "xWhat":
          return th.xName;
        case "wave":
          return `0から${val(th, th.wave)}までの{目|め}もりを{省|はぶ}いている`;
      }
      return "?";
    })();
    return plain(got) === plain(want);
  }
  // 問いの種類のリストから、作れる問いを n こ(先頭の must は必ず)集める
  function collectAsks(rng, th, v, must, pool, n) {
    const out = [];
    for (const k of must) {
      const a = askOf(k, th, v, rng);
      if (!a) return null;
      out.push(a);
    }
    for (const k of rng.shuffle(pool)) {
      if (out.length >= n) break;
      if (out.some((o) => o.m.kind === k)) continue;
      const a = askOf(k, th, v, rng);
      if (a) out.push(a);
    }
    return out.length >= n ? out : null;
  }
  function verifyAsks(pr, th) {
    const v = readSeries(pr.figure);
    if (v.join() !== pr.meta.v.join()) return "図の点と値が合わない";
    const parts = pr.answer.display.split("　");
    for (const [i, m] of pr.meta.asks.entries()) {
      const got = parts[i].replace(/^\(\d+\) /, "");
      if (!checkAsk(m, th, v, got)) return `答えが合わない(${m.kind})`;
    }
    return null;
  }
  function askProblem(rng, p, id, { must, pool, n, intro = LG_TEXT, chartExtra = () => ({}) }) {
    const themes = pickThemes(p);
    for (let t = 0; t < 300; t++) {
      const th = rng.pick(themes);
      const d = makeValues(rng, th);
      if (!d) continue;
      const asks = collectAsks(rng, th, d.v, must, pool, n);
      if (!asks) continue;
      const qs = numberQs(asks.map((a) => a.q));
      return {
        key: `${id}:${th.id}:${d.v.join(",")}:${asks.map((a) => JSON.stringify(a.m)).join("|")}`,
        softKey: th.id,
        text: `${intro(th)}[[br]]${qs.join("[[br]]")}`,
        figure: lineOf(th, d, chartExtra(th, d)),
        answer: { display: asks.map((a, i) => `(${i + 1}) ${a.a}`).join("　"), value: d.v },
        workspace: linesWs(asks.length),
        side: true,
        meta: { theme: th.id, v: d.v, asks: asks.map((a) => a.m) }
      };
    }
    throw new Error(`${id}: 問題が作れない`);
  }
  const themeOf = (id) => THEMES.find((t) => t.id === id);

  const lgRead = {
    id: "g4.lgRead",
    grade: 4,
    instruction: null,
    defaults: { themes: "all", must: ["value"], pool: ["max", "min"], n: 2 },
    levels: {
      basic: { must: ["value"], pool: ["max", "min", "diff"], n: 2 },
      normal: { must: ["value"], pool: ["max", "min", "diff", "which"], n: 3 },
      challenge: { must: ["value"], pool: ["max", "min", "diff", "which", "range"], n: 3 }
    },
    generate(rng, p) {
      return askProblem(rng, p, "lgr", p);
    },
    verify(pr, p) {
      if (pr.meta.asks[0].kind !== "value") return "はじめの問いが値でない";
      return verifyAsks(pr, themeOf(pr.meta.theme));
    }
  };
  const lgChange = {
    id: "g4.lgChange",
    grade: 4,
    instruction: null,
    defaults: { themes: "all", must: [], pool: ["upMax", "downMax", "state"], n: 2 },
    levels: {
      basic: { must: [], pool: ["upMax", "downMax", "state"], n: 2 },
      normal: { must: [], pool: ["upMax", "downMax", "state", "flat"], n: 3 },
      challenge: { must: [], pool: ["upMax", "downMax", "state", "flat", "range"], n: 3 }
    },
    generate(rng, p) {
      return askProblem(rng, p, "lgc", p);
    },
    verify(pr) {
      if (!pr.meta.asks.some((a) => ["upMax", "downMax", "flat", "state"].includes(a.kind))) return "変わり方の問いがない";
      return verifyAsks(pr, themeOf(pr.meta.theme));
    }
  };
  const lgAxis = {
    id: "g4.lgAxis",
    grade: 4,
    instruction: null,
    defaults: { themes: "all", must: ["step"], pool: ["offValue", "xWhat"], n: 2 },
    levels: {
      basic: { must: ["step"], pool: ["offValue", "value"], n: 2 },
      normal: { must: ["step"], pool: ["offValue", "xWhat", "yWhat"], n: 3 },
      challenge: { must: ["step"], pool: ["offValue", "xWhat", "yWhat", "wave"], n: 3 }
    },
    generate(rng, p) {
      return askProblem(rng, p, "lga", p);
    },
    verify(pr) {
      return verifyAsks(pr, themeOf(pr.meta.theme));
    }
  };
  // 4つの区間にア〜エをつけて、線のかたむきをくらべる
  const lgSlope = {
    id: "g4.lgSlope",
    grade: 4,
    instruction: null,
    defaults: { asks: ["upBig", "down"], n: 2 },
    levels: {
      basic: { asks: ["upBig", "down", "flat"], n: 2 },
      normal: { asks: ["upBig", "down", "flat", "downBig"], n: 3 },
      challenge: { asks: ["upBig", "down", "flat", "downBig"], n: 3 }
    },
    generate(rng, p) {
      for (let t = 0; t < 400; t++) {
        const th = rng.pick(THEMES);
        const d = makeValues(rng, th);
        if (!d) continue;
        const diffs = diffsOf(d.v);
        const segs = rng.shuffle(diffs.map((_, i) => i)).slice(0, 4).sort((a, b) => a - b);
        const dv = segs.map((i) => diffs[i]);
        const asks = [];
        const lettersWhere = (f) => segs.map((_, j) => j).filter((j) => f(dv[j])).map((j) => AIUEO[j]);
        const can = {
          upBig: () => {
            const mx = Math.max(...dv);
            return mx > 0 && dv.filter((x) => x === mx).length === 1 && th.w.upBig ? { q: `${th.q}が${th.w.upBig}のはどれですか。`, a: AIUEO[dv.indexOf(mx)], m: { kind: "upBig" } } : null;
          },
          downBig: () => {
            const mn = Math.min(...dv);
            return mn < 0 && dv.filter((x) => x === mn).length === 1 && dv.filter((x) => x < 0).length >= 2 && th.w.downBig ? { q: `${th.q}が${th.w.downBig}のはどれですか。`, a: AIUEO[dv.indexOf(mn)], m: { kind: "downBig" } } : null;
          },
          down: () => {
            const ls = lettersWhere((x) => x < 0);
            return ls.length && th.w.downS ? { q: `${th.q}が${th.w.downS}のはどれですか。{全部|ぜんぶ}{答|こた}えましょう。`, a: ls.join("、"), m: { kind: "down" } } : null;
          },
          flat: () => {
            const ls = lettersWhere((x) => x === 0);
            return ls.length === 1 ? { q: `${th.q}が${FLAT}のはどれですか。`, a: ls[0], m: { kind: "flat" } } : null;
          }
        };
        for (const k of ["upBig", ...rng.shuffle(p.asks.filter((x) => x !== "upBig"))]) {
          if (asks.length >= p.n) break;
          if (!p.asks.includes(k)) continue;
          const a = can[k]();
          if (a) asks.push(a);
        }
        if (asks.length < p.n) continue;
        const fig = lineOf(th, d, { segLabels: segs.map((i, j) => ({ i, s: AIUEO[j] })) });
        return {
          key: `lgs:${th.id}:${d.v.join(",")}:${segs.join(",")}`,
          softKey: th.id,
          text: `${LG_TEXT(th)}グラフの{線|せん}のア〜エの{部分|ぶぶん}について{答|こた}えましょう。[[br]]${numberQs(asks.map((a) => a.q)).join("[[br]]")}`,
          figure: fig,
          answer: { display: asks.map((a, i) => `(${i + 1}) ${a.a}`).join("　"), value: d.v },
          workspace: linesWs(asks.length),
          side: true,
          meta: { theme: th.id, v: d.v, segs, asks: asks.map((a) => a.m.kind) }
        };
      }
      throw new Error("線のかたむきの問題が作れない");
    },
    verify(pr) {
      const th = themeOf(pr.meta.theme), v = readSeries(pr.figure);
      if (v.join() !== pr.meta.v.join()) return "図の点と値が合わない";
      const labels = pr.figure.items.filter((it) => it.t === "text" && AIUEO.includes(it.s) && it.bold);
      if (labels.length !== 4) return "ア〜エのしるしが4つでない";
      const segs = pr.meta.segs, dv = segs.map((i) => v[i + 1] - v[i]);
      const parts = pr.answer.display.split("　").map((s) => s.replace(/^\(\d+\) /, ""));
      for (const [n, k] of pr.meta.asks.entries()) {
        let want;
        if (k === "upBig") want = AIUEO[dv.indexOf(Math.max(...dv))];
        if (k === "downBig") want = AIUEO[dv.indexOf(Math.min(...dv))];
        if (k === "down") want = dv.map((x, j) => x < 0 ? AIUEO[j] : null).filter(Boolean).join("、");
        if (k === "flat") want = dv.map((x, j) => x === 0 ? AIUEO[j] : null).filter(Boolean).join("、");
        if (parts[n] !== want) return `答えが合わない(${k})`;
      }
      // しるしは区間のまん中の近くにある
      for (const [j, i] of segs.entries()) {
        const lb = labels.find((l) => l.s === AIUEO[j]);
        const { x0, colW } = pr.figure.meta;
        const mid = x0 + (i + 1) * colW;
        if (Math.abs(lb.x - mid) > colW) return "しるしの場所がずれている";
      }
      return null;
    }
  };
  // 測っていない時こくの値を考える
  const EST_THEMES = THEMES.filter((t) => t.mids);
  const lgEstimate = {
    id: "g4.lgEstimate",
    grade: 4,
    instruction: null,
    defaults: { n: 2 },
    levels: { basic: { n: 2 }, normal: { n: 2 }, challenge: { n: 3 } },
    generate(rng, p) {
      for (let t = 0; t < 300; t++) {
        const th = rng.pick(EST_THEMES);
        const d = makeValues(rng, th);
        if (!d) continue;
        const v = d.v;
        const cand = v.slice(0, -1).map((_, i) => i).filter((i) => v[i] !== v[i + 1] && (v[i] + v[i + 1]) % 2 === 0 && ((v[i] + v[i + 1]) / 2) % th.step === 0);
        if (cand.length < p.n - 1) continue;
        const picks = rng.shuffle(cand).slice(0, p.n - 1).sort((a, b) => a - b);
        const asks = picks.map((i) => ({ q: `${th.mids[i]}の${th.q}は、およそ{何|なん}${th.unit}だったと{考|かんが}えられますか。`, a: `およそ${val(th, (v[i] + v[i + 1]) / 2)}`, m: { kind: "mid", i } }));
        const k = rng.int(0, v.length - 1);
        asks.unshift({ q: `${th.items[k]}の${th.q}は{何|なん}${th.unit}ですか。`, a: val(th, v[k]), m: { kind: "value", k } });
        return {
          key: `lge:${th.id}:${v.join(",")}:${picks.join(",")}:${k}`,
          softKey: th.id,
          text: `${LG_TEXT(th)}はかったのはグラフの{点|てん}の{時|とき}だけです。[[br]]${numberQs(asks.map((a) => a.q)).join("[[br]]")}`,
          figure: lineOf(th, d),
          answer: { display: asks.map((a, i) => `(${i + 1}) ${a.a}`).join("　"), value: v },
          workspace: linesWs(asks.length),
          side: true,
          meta: { theme: th.id, v, asks: asks.map((a) => a.m) }
        };
      }
      throw new Error("間の値を考える問題が作れない");
    },
    verify(pr) {
      const th = themeOf(pr.meta.theme), v = readSeries(pr.figure);
      if (v.join() !== pr.meta.v.join()) return "図の点と値が合わない";
      const parts = pr.answer.display.split("　").map((s) => s.replace(/^\(\d+\) /, ""));
      for (const [n, m] of pr.meta.asks.entries()) {
        const want = m.kind === "value" ? val(th, v[m.k]) : `およそ${val(th, (v[m.i] + v[m.i + 1]) / 2)}`;
        if (plain(parts[n]) !== plain(want)) return "答えが合わない";
        if (m.kind === "mid" && !pr.text.includes(th.mids[m.i])) return "時こくが問題にない";
      }
      return null;
    }
  };
  // 表から折れ線グラフをかく(目もりの数あり / なし)
  const DRAW_LV = {
    basic: ["monthTemp", "plant", "library", "pool", "puppy", "icecream", "candle"],
    normal: ["monthTemp", "plant", "library", "pool", "puppy", "icecream", "candle", "dayTemp", "summerTemp", "groundTemp", "asagao", "shadow", "waterDepth", "freezer", "coolWater", "waterHeat"],
    challenge: "all"
  };
  function tablesOf(th, v) {
    const half = Math.ceil(th.labels.length / 2);
    const tbl = (a, b) => ({ type: "table", head: [th.xHead, ...th.labels.slice(a, b)], rows: [[`${th.q}(${th.unit})`, ...v.slice(a, b).map((x) => fmtV(x, th.dp))]] });
    return th.labels.length <= 8 ? [tbl(0)] : [tbl(0, half), tbl(half)];
  }
  function verifyDraw(pr) {
    const th = themeOf(pr.meta.theme);
    const ans = readSeries(pr.answer.figure);
    const tables = pr.figure.items.filter((it) => it.type === "table");
    const rows = tables.flatMap((tb) => tb.rows[0].slice(1)).map((s) => Math.round(Number(s) * 10 ** (th.dp || 0)));
    if (ans.join() !== rows.join() || rows.join() !== pr.meta.v.join()) return "答えのグラフが表と合わない";
    const blank = pr.figure.items.find((it) => it.type === "draw");
    if (blank.items.some((it) => it.t === "dot")) return "問題のグラフに点がある";
    return null;
  }
  const lgDraw = {
    id: "g4.lgDraw",
    grade: 4,
    instruction: null,
    defaults: { themes: DRAW_LV.basic },
    levels: { basic: { themes: DRAW_LV.basic }, normal: { themes: DRAW_LV.normal }, challenge: { themes: DRAW_LV.challenge } },
    generate(rng, p) {
      for (let t = 0; t < 200; t++) {
        const th = rng.pick(pickThemes(p));
        const d = makeValues(rng, th);
        if (!d) continue;
        return {
          key: `lgd:${th.id}:${d.v.join(",")}`,
          softKey: th.id,
          text: `{下|した}の{表|ひょう}は、${th.title}を{調|しら}べたものです。{折|お}れ{線|せん}グラフに{表|あらわ}しましょう。`,
          figure: { type: "multi", items: [...tablesOf(th, d.v), lineOf(th, d, { series: [{ v: d.v, hidden: true }] })] },
          answer: { display: "{右|みぎ}のグラフ", value: d.v, figure: lineOf(th, d) },
          workspace: { type: "none" },
          meta: { theme: th.id, v: d.v }
        };
      }
      throw new Error("折れ線グラフをかく問題が作れない");
    },
    verify: verifyDraw
  };
  const lgDrawScale = {
    id: "g4.lgDrawScale",
    grade: 4,
    instruction: null,
    defaults: { themes: DRAW_LV.basic },
    levels: { basic: { themes: DRAW_LV.basic }, normal: { themes: DRAW_LV.normal }, challenge: { themes: DRAW_LV.challenge } },
    generate(rng, p) {
      for (let t = 0; t < 200; t++) {
        const th = rng.pick(pickThemes(p));
        const d = makeValues(rng, th);
        if (!d) continue;
        const waveNote = th.wave ? `（「≈」は、0から${val(th, th.wave)}までの{目|め}もりを{省|はぶ}いたしるしです。）` : "";
        return {
          key: `lgds:${th.id}:${d.v.join(",")}`,
          softKey: th.id,
          text: `{下|した}の{表|ひょう}は、${th.title}を{調|しら}べたものです。たてのじくの1{目|め}もりを${val(th, th.step)}にして、たてのじくに{目|め}もりの{数|かず}と{単位|たんい}を{書|か}き{入|い}れてから、{折|お}れ{線|せん}グラフに{表|あらわ}しましょう。${waveNote}`,
          figure: { type: "multi", items: [...tablesOf(th, d.v), lineOf(th, d, { series: [{ v: d.v, hidden: true }], numbers: false })] },
          answer: { display: "{右|みぎ}のグラフ", value: d.v, figure: lineOf(th, d) },
          workspace: { type: "none" },
          meta: { theme: th.id, v: d.v }
        };
      }
      throw new Error("目もりを決めてかく問題が作れない");
    },
    verify(pr) {
      const e = verifyDraw(pr);
      if (e) return e;
      const blank = pr.figure.items.find((it) => it.type === "draw");
      if (blank.items.some((it) => it.t === "text" && /^\d/.test(it.s) && it.anchor === "end" && it.x < blank.meta.x0)) return "目もりの数が書いてある";
      return null;
    }
  };
