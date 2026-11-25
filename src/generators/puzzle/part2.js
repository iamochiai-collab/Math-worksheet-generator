// 「計算・パズル」の つづき:ピラミッド(△の数)・市松・5つのマーク・時間の筆算・つるかめ算。
// F9(計算プリントのソフト)にある「形」を参考に、問題・図・答えは ここで作りなおしている(データは使っていない)。
// パズルは どれも 答えが1つに きまるものだけを出す
puzzle.push(...(() => {
  const KEY = "#ef7d00";
  const txt = (x, y, s, size, o = {}) => ({ t: "text", x, y, s: String(s), size, halo: false, ...o });
  const keyNum = (x, y, s, size) => txt(x, y, s, size, { color: KEY, bold: true });
  const rect = (x, y, w, h, o = {}) => ({ t: "poly", pts: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], w: 0.35, fill: "white", lead: true, ...o });
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  function figs(w, h, items, keyItems, scaleK = 1) {
    const f = (extra) => ({ type: "draw", w, h, items: [...items, ...extra], scaleK });
    return { figure: f([]), answer: { display: "", figure: f(keyItems) } };
  }
  const base = { noAnswerBox: true, workspace: { type: "none" } };
  // あいている ところに 数を 入れる パズルの 答えの数を かぞえる(2つ 見つけたら やめる)
  // cells: あいている 場所の 番号、cands: 使える 数、check(vals): ここまでで むじゅんが ないか
  function countFill(cells, cands, check, limit = 2) {
    const vals = new Map(), used = new Set();
    let count = 0;
    const rec = (k) => {
      if (count >= limit) return;
      if (k === cells.length) { count++; return; }
      for (const v of cands) {
        if (used.has(v)) continue;
        vals.set(cells[k], v); used.add(v);
        if (check(vals)) rec(k + 1);
        vals.delete(cells[k]); used.delete(v);
      }
    };
    rec(0);
    return count;
  }
  // あける マスを 1つずつ ふやして、答えが 1つの ままの ところまで あける
  function digHoles(rng, n, want, unique) {
    const holes = [];
    for (const i of rng.shuffle(range(0, n - 1))) {
      if (holes.length >= want) break;
      holes.push(i);
      if (!unique(holes)) holes.pop();
    }
    return holes;
  }

  // ===================== ピラミッド(△の数)=====================
  // 上むきの △ に 1〜N が 1回ずつ。下むきの △(色つき)の 数は、となりの 上むき △ 3つの 合計
  function pyrShape(k) {
    const ups = [], downs = [];
    for (let r = 0; r < k; r++) {
      for (let i = 0; i <= r; i++) ups.push([r, i]);
      for (let i = 0; i < r; i++) downs.push([r, i]);
    }
    const upIdx = (r, i) => r * (r + 1) / 2 + i;
    const nb = downs.map(([r, i]) => [upIdx(r, i), upIdx(r, i + 1), upIdx(r - 1, i)]);
    return { ups, downs, nb, N: ups.length };
  }
  function pyrUnique(sh, vals, holes) {
    const sums = sh.nb.map((t) => t.reduce((a, j) => a + vals[j], 0));
    const known = vals.map((v, j) => holes.includes(j) ? 0 : v);
    const cands = holes.map((j) => vals[j]);
    const check = (m) => sh.nb.every((t, d) => {
      let s = 0;
      for (const j of t) {
        const v = known[j] || m.get(j);
        if (!v) return true;
        s += v;
      }
      return s === sums[d];
    });
    return countFill(holes, cands, check) === 1;
  }
  const tPyramid = {
    id: "pz.pyramid",
    instructionFor: (p) => `{色|いろ}の ついた △の {数|かず}は、まわりの △ 3つの {数|かず}の {合計|ごうけい}です。{白|しろ}い △には 1〜${p.k * (p.k + 1) / 2}の {数|かず}が 1{回|かい}ずつ {入|はい}ります。あいている △に {数|かず}を {書|か}きましょう。`,
    instruction: "あいている △に {数|かず}を {書|か}きましょう。",
    defaults: { k: 3, holes: 3 },
    levels: { basic: { k: 3, holes: 3 }, normal: { k: 4, holes: 6 }, challenge: { k: 4, holes: 10 } },
    generate(rng, p) {
      const sh = pyrShape(p.k);
      for (let t = 0; t < 40; t++) {
        const vals = rng.shuffle(range(1, sh.N));
        const holes = digHoles(rng, sh.N, p.holes, (hs) => pyrUnique(sh, vals, hs));
        if (holes.length < Math.min(p.holes, sh.N) - (p.k >= 4 ? 3 : 1)) continue;
        const S = p.k === 3 ? 24 : 20, H = S * Math.sqrt(3) / 2, W = p.k * S + 4, X = W / 2, Y0 = 2;
        const items = [], keys = [];
        const fsz = S * 0.3;
        sh.ups.forEach(([r, i], j) => {
          const xl = X - (r + 1) * S / 2 + i * S, yt = Y0 + r * H, yb = yt + H;
          items.push({ t: "poly", pts: [[xl, yb], [xl + S, yb], [xl + S / 2, yt]], w: 0.45, fill: "white", lead: true });
          const cy = yt + H * 2 / 3 + fsz * 0.36;
          if (holes.includes(j)) keys.push(keyNum(xl + S / 2, cy, vals[j], fsz));
          else items.push(txt(xl + S / 2, cy, vals[j], fsz));
        });
        sh.downs.forEach(([r, i], d) => {
          const xl = X - (r + 1) * S / 2 + i * S, yt = Y0 + r * H, yb = yt + H;
          items.push({ t: "poly", pts: [[xl + S / 2, yt], [xl + S * 1.5, yt], [xl + S, yb]], w: 0.45, fill: "#dfe7ef", lead: true });
          items.push(txt(xl + S, yt + H / 3 + fsz * 0.4, sh.nb[d].reduce((a, q) => a + vals[q], 0), fsz * 1.05, { bold: true }));
        });
        return {
          key: `py:${p.k}:${vals.join(",")}:${holes.join(",")}`,
          softKey: `py${vals.slice(0, 3).join("")}`,
          text: "",
          ...figs(W, p.k * H + 4, items, keys, 1.15),
          ...base,
          meta: { k: p.k, vals, holes }
        };
      }
      throw new Error("ピラミッドが作れない");
    },
    verify(pr, p) {
      const { k, vals, holes } = pr.meta, sh = pyrShape(k);
      if (k !== p.k || [...vals].sort((a, b) => a - b).join() !== range(1, sh.N).join()) return "1〜Nが1回ずつでない";
      if (!pyrUnique(sh, vals, holes)) return "答えが1つにきまらない";
      return null;
    }
  };

  // ===================== 市松 =====================
  // 白い マスに 1〜N が 1回ずつ。色の マスの 数は、上下左右の 白い マスの 合計
  function ichiShape(R, C) {
    const light = [], dark = [];
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) ((r + c) % 2 ? dark : light).push([r, c]);
    const li = new Map(light.map(([r, c], j) => [`${r},${c}`, j]));
    const nb = dark.map(([r, c]) => [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].map(([a, b]) => li.get(`${a},${b}`)).filter((j) => j !== void 0));
    return { light, dark, nb, N: light.length };
  }
  function ichiUnique(sh, vals, holes) {
    const sums = sh.nb.map((t) => t.reduce((a, j) => a + vals[j], 0));
    const known = vals.map((v, j) => holes.includes(j) ? 0 : v);
    const check = (m) => sh.nb.every((t, d) => {
      let s = 0;
      for (const j of t) {
        const v = known[j] || m.get(j);
        if (!v) return true;
        s += v;
      }
      return s === sums[d];
    });
    return countFill(holes, holes.map((j) => vals[j]), check) === 1;
  }
  const ICHI = { basic: [3, 4, 3], normal: [4, 5, 6], challenge: [4, 5, 9] };
  const tIchi = {
    id: "pz.ichimatsu",
    instructionFor: (p) => {
      const [R, C] = ICHI[p.lv];
      return `{色|いろ}の マスの {数|かず}は、{上下左右|じょうげさゆう}の {白|しろ}い マスの {合計|ごうけい}です。{白|しろ}い マスには 1〜${Math.ceil(R * C / 2)}の {数|かず}が 1{回|かい}ずつ {入|はい}ります。あいている マスに {数|かず}を {書|か}きましょう。`;
    },
    instruction: "あいている マスに {数|かず}を {書|か}きましょう。",
    defaults: { lv: "basic" },
    levels: { basic: { lv: "basic" }, normal: { lv: "normal" }, challenge: { lv: "challenge" } },
    generate(rng, p) {
      const [R, C, want] = ICHI[p.lv], sh = ichiShape(R, C);
      for (let t = 0; t < 40; t++) {
        const vals = rng.shuffle(range(1, sh.N));
        const holes = digHoles(rng, sh.N, want, (hs) => ichiUnique(sh, vals, hs));
        if (holes.length < want - 1) continue;
        const S = 16, items = [], keys = [];
        sh.light.forEach(([r, c], j) => {
          const x = 2 + c * S, y = 2 + r * S;
          items.push(rect(x, y, S, S, { w: 0.4 }));
          if (holes.includes(j)) keys.push(keyNum(x + S / 2, y + S / 2 + 2, vals[j], 6));
          else items.push(txt(x + S / 2, y + S / 2 + 2.2, vals[j], 6.2));
        });
        sh.dark.forEach(([r, c], d) => {
          const x = 2 + c * S, y = 2 + r * S;
          items.push(rect(x, y, S, S, { w: 0.4, fill: "#dfe7ef" }));
          items.push(txt(x + S / 2, y + S / 2 + 2.2, sh.nb[d].reduce((a, q) => a + vals[q], 0), 6.2, { bold: true }));
        });
        items.push(rect(2, 2, C * S, R * S, { w: 0.9, fill: "none" }));
        return {
          key: `ic:${p.lv}:${vals.join(",")}:${holes.join(",")}`,
          softKey: `ic${vals.slice(0, 3).join("")}`,
          text: "",
          ...figs(C * S + 4, R * S + 4, items, keys, 1.1),
          ...base,
          meta: { lv: p.lv, vals, holes }
        };
      }
      throw new Error("市松が作れない");
    },
    verify(pr, p) {
      const { lv, vals, holes } = pr.meta, [R, C] = ICHI[lv], sh = ichiShape(R, C);
      if (lv !== p.lv || [...vals].sort((a, b) => a - b).join() !== range(1, sh.N).join()) return "1〜Nが1回ずつでない";
      if (!ichiUnique(sh, vals, holes)) return "答えが1つにきまらない";
      return null;
    }
  };

  // ===================== 5つのマーク =====================
  // マークは 1〜9の ちがう 数。しきから どの マークが いくつかを あてる
  const MARKS = { 3: ["○", "△", "☆"], 5: ["○", "△", "◇", "♡", "☆"] };
  const ANIMALS = ["いぬ", "ねこ", "うま", "ひつじ", "うし"];
  function marksSolutions(n, eqs, limit = 2) {
    const sols = [];
    const cur = [];
    const rec = () => {
      if (sols.length >= limit) return;
      if (cur.length === n) {
        if (eqs.every(([ix, s]) => ix.reduce((a, i) => a + cur[i], 0) === s)) sols.push(cur.slice());
        return;
      }
      for (let v = 1; v <= 9; v++) if (!cur.includes(v)) { cur.push(v); rec(); cur.pop(); }
    };
    rec();
    return sols;
  }
  const tMarks = {
    id: "pz.marks",
    instructionFor: (p) => p.animal ? "{動物|どうぶつ}は それぞれ 1〜9の ちがう {数|かず}です。しきを よく {見|み}て、それぞれの {数|かず}を あてましょう。" : `${MARKS[p.n].join("、")}は それぞれ 1〜9の ちがう {数|かず}です。しきを よく {見|み}て、それぞれの {数|かず}を あてましょう。`,
    instruction: "それぞれの {数|かず}を あてましょう。",
    defaults: { n: 3, k: 2, animal: false },
    levels: { basic: { n: 3, k: 2, animal: false }, normal: { n: 5, k: 2, animal: false }, challenge: { n: 5, k: 3, animal: true } },
    generate(rng, p) {
      const n = p.n, names = p.animal ? ANIMALS : MARKS[n];
      for (let t = 0; t < 200; t++) {
        const vals = rng.shuffle(range(1, 9)).slice(0, n);
        const subsets = [];
        for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
          if (p.k === 2) subsets.push([a, b]);
          else for (let c = b + 1; c < n; c++) subsets.push([a, b, c]);
        }
        const eqs = [[range(0, n - 1), vals.reduce((x, y) => x + y, 0)]];
        for (const ix of rng.shuffle(subsets)) {
          if (eqs.length >= n) break;
          eqs.push([ix, ix.reduce((x, i) => x + vals[i], 0)]);
        }
        if (marksSolutions(n, eqs).length !== 1) continue;
        const sep = p.animal ? " ＋ " : "＋";
        const lines = eqs.map(([ix, s]) => `${ix.map((i) => names[i]).join(sep)} ＝ ${s}`);
        return {
          key: `mk:${p.animal}:${n}:${vals.join(",")}:${eqs.map((e) => e[0].join("")).join("|")}`,
          softKey: `mk${vals.join("")}`,
          text: lines.join("[[br]]") + "[[br]]",
          wide: true,
          ansBox: names.map((nm) => `${nm}＝□`).join("　"),
          ansBoxW: 11,
          answer: { display: names.map((nm, i) => `${nm}＝${vals[i]}`).join("　"), fills: vals.map(String) },
          workspace: { type: "none" },
          meta: { n, vals, eqs, animal: !!p.animal }
        };
      }
      throw new Error("マークの問題が作れない");
    },
    verify(pr, p) {
      const { n, vals, eqs } = pr.meta;
      if (new Set(vals).size !== n || vals.some((v) => v < 1 || v > 9)) return "1〜9のちがう数でない";
      const s = marksSolutions(n, eqs);
      if (s.length !== 1 || s[0].join() !== vals.join()) return "答えが1つにきまらない";
      return null;
    }
  };

  // ===================== 時間の筆算 =====================
  const tTime = {
    id: "pz.timeCalc",
    instructionFor: (p) => p.op === "-" ? "{時間|じかん}の ひき{算|ざん}を しましょう。" : p.op === "+" ? "{時間|じかん}の たし{算|ざん}を しましょう。" : "{時間|じかん}の {計算|けいさん}を しましょう。",
    instruction: "{時間|じかん}の {計算|けいさん}を しましょう。",
    defaults: { op: "+", carry: false },
    levels: { basic: { op: "+", carry: false }, normal: { op: "+", carry: true }, challenge: { op: "-", carry: true } },
    generate(rng, p) {
      const op = p.op === "mix" ? rng.pick(["+", "-"]) : p.op;
      for (let t = 0; t < 200; t++) {
        const step = 5;
        const h1 = rng.int(1, 5), m1 = rng.int(0, 11) * step, h2 = rng.int(1, 4), m2 = rng.int(0, 11) * step;
        let a = h1 * 60 + m1, b = h2 * 60 + m2;
        if (op === "-" && a < b) [a, b] = [b, a];
        const ma = a % 60, mb = b % 60;
        const carry = op === "+" ? ma + mb >= 60 : ma < mb;
        if (p.carry === false && carry || p.carry === true && !carry) continue;
        const r = op === "+" ? a + b : a - b;
        if (r < 60) continue;
        // 図:たて書き(時間と分の 位を そろえる)
        const items = [], keys = [];
        const xH = 14, xHu = 22, xM = 40, xMu = 47, y1 = 7, y2 = 16, yL = 19.5, y3 = 28, fs = 5.6;
        const row = (y, v) => {
          items.push(txt(xH, y, Math.floor(v / 60), fs, { anchor: "end" }), txt(xHu, y, "{時間|じかん}", 3.8), txt(xM, y, v % 60, fs, { anchor: "end" }), txt(xMu, y, "{分|ふん}", 3.8));
        };
        row(y1, a);
        items.push(txt(3, y2, op === "+" ? "＋" : "－", fs));
        row(y2, b);
        items.push({ t: "line", x1: 2, y1: yL, x2: 52, y2: yL, w: 0.6, lead: true });
        items.push(rect(4, y3 - 6.2, 11, 8.6, { w: 0.4 }), txt(xHu, y3, "{時間|じかん}", 3.8), rect(30, y3 - 6.2, 11, 8.6, { w: 0.4 }), txt(xMu, y3, "{分|ふん}", 3.8));
        keys.push(keyNum(9.5, y3, Math.floor(r / 60), fs), keyNum(35.5, y3, r % 60, fs));
        return {
          key: `tc:${op}:${a}:${b}`,
          softKey: `tc${op}${a}`,
          text: "",
          cols: 3,
          ...figs(54, 32, items, keys, 1.1),
          ...base,
          meta: { op, a, b, r }
        };
      }
      throw new Error("時間の計算が作れない");
    },
    verify(pr, p) {
      const { op, a, b, r } = pr.meta;
      if ((op === "+" ? a + b : a - b) !== r) return "答えがちがう";
      const carry = op === "+" ? a % 60 + b % 60 >= 60 : a % 60 < b % 60;
      if (p.carry === false && carry || p.carry === true && !carry) return "くり上がり・くり下がりが ちがう";
      return null;
    }
  };

  // ===================== つるかめ算 =====================
  const TK_SETS = [
    { mk: (pa, pb, n, T) => `1こ ${pa}{円|えん}の みかんと 1こ ${pb}{円|えん}の りんごを あわせて ${n}こ {買|か}ったら、{代金|だいきん}は ${T}{円|えん}でした。みかんと りんごを それぞれ {何|なん}こ {買|か}いましたか。`, A: "みかん", B: "りんご", u: "こ", price: [[30, 60], [70, 120]] },
    { mk: (pa, pb, n, T) => `1さつ ${pa}{円|えん}の ノートと 1さつ ${pb}{円|えん}の ノートを あわせて ${n}さつ {買|か}ったら、{代金|だいきん}は ${T}{円|えん}でした。${pa}{円|えん}の ノートと ${pb}{円|えん}の ノートを それぞれ {何|なん}さつ {買|か}いましたか。`, A: "{安|やす}い ノート", B: "{高|たか}い ノート", u: "さつ", price: [[60, 100], [110, 160]] },
    { mk: (pa, pb, n, T) => `プールの {入場料|にゅうじょうりょう}は、こどもが ${pa}{円|えん}、おとなが ${pb}{円|えん}です。あわせて ${n}{人|にん} {入|はい}ったら、{入場料|にゅうじょうりょう}は ${T}{円|えん}でした。こどもと おとなは それぞれ {何人|なんにん} {入|はい}りましたか。`, A: "こども", B: "おとな", u: "{人|にん}", price: [[100, 150], [180, 300]] },
    { mk: (pa, pb, n, T) => `つるが {何|なん}わかと かめが {何|なん}びきか います。{頭|あたま}の {数|かず}は あわせて ${n}、{足|あし}の {数|かず}は あわせて ${T}{本|ほん}です。つると かめは それぞれ いくつ いますか。`, A: "つる", B: "かめ", u: "", legs: true, price: [[2, 2], [4, 4]] }
  ];
  const tTsuru = {
    id: "pz.tsurukame",
    instruction: "{問題|もんだい}を よく {読|よ}んで {答|こた}えましょう。",
    defaults: { nMax: 10 },
    levels: { basic: { nMax: 8 }, normal: { nMax: 12 }, challenge: { nMax: 20 } },
    generate(rng, p, ctx) {
      for (let t = 0; t < 200; t++) {
        const S = ctx && Number.isInteger(ctx.index) ? TK_SETS[ctx.index % TK_SETS.length] : rng.pick(TK_SETS);
        const step = S.legs ? 1 : 10;
        const pa = S.legs ? 2 : rng.int(S.price[0][0] / step, S.price[0][1] / step) * step, pb = S.legs ? 4 : rng.int(S.price[1][0] / step, S.price[1][1] / step) * step;
        if (pa >= pb) continue;
        const n = rng.int(4, p.nMax), y = rng.int(1, n - 1), x = n - y; // x:安い方 y:高い方
        const T = pa * x + pb * y;
        const unitA = S.legs ? "わ" : S.u, unitB = S.legs ? "ひき" : S.u;
        const shiki = `${pa}×${n}＝${pa * n}　${T}－${pa * n}＝${T - pa * n}　${T - pa * n}÷(${pb}－${pa})＝${y}　${n}－${y}＝${x}`;
        return {
          key: `tk:${S.A}:${pa}:${pb}:${n}:${y}`,
          softKey: `tk${S.A}`,
          text: S.mk(pa, pb, n, T),
          answer: { display: `{式|しき} ${shiki}　{答|こた}え ${S.A} ${x}${unitA}、${S.B} ${y}${unitB}`, value: { x, y } },
          workspace: { type: "lines", labels: ["{式|しき}", "{答|こた}え"] },
          meta: { pa, pb, n, T, x, y }
        };
      }
      throw new Error("つるかめ算が作れない");
    },
    verify(pr) {
      const { pa, pb, n, T, x, y } = pr.meta;
      if (x < 1 || y < 1 || x + y !== n || pa * x + pb * y !== T) return "数が合わない";
      return null;
    }
  };

  return [tPyramid, tIchi, tMarks, tTime, tTsuru];
})());
// 「計算・パズル」に 単元を たす
puzzleStage.units.push(
  { name: "ピラミッド(△の{数|かず})", domain: "パズル", from: [["pz.pyramid", null, { label: "ピラミッド", kinds: ["figure"], options: [{ key: "k", label: "段", num: true, choices: [["auto", "★に合わせる"], ["3", "3段(1〜6)"], ["4", "4段(1〜10)"]] }] }]] },
  { name: "{市松|いちまつ}", domain: "パズル", from: [["pz.ichimatsu", null, { label: "市松", kinds: ["figure"] }]] },
  { name: "5つの マーク", domain: "パズル", from: [["pz.marks", null, { label: "マークの 数を あてよう", kinds: ["word"] }]] },
  { name: "{時間|じかん}の {筆算|ひっさん}", domain: "計算", from: [["pz.timeCalc", null, { label: "時間の たし算・ひき算", kinds: ["figure"], options: [{ key: "op", label: "しき", choices: [["auto", "★に合わせる"], ["+", "たし算"], ["-", "ひき算"], ["mix", "まぜる"]] }] }]] },
  { name: "つるかめ{算|ざん}", domain: "計算", from: [["pz.tsurukame", null, { label: "つるかめ算", kinds: ["word"] }]] }
);
puzzleStage.note += "。ピラミッド、市松、5つのマーク、時間の筆算、つるかめ算";
