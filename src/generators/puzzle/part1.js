// 「計算・パズル」:マス計算・虫くい算・魔方陣・たし算クロス・上の数・数独。
// 計算プリントのソフト(F9)にある「形」を参考に、問題・図・答えは すべて ここで作りなおしている(データは使っていない)。
// 答えのページは、同じ図の あいているところに 答えの色で数を書きこむ(answer.figure)。どのパズルも 答えが1つに きまるものだけを出す
var puzzle = (() => {
  const KEY = "#ef7d00";
  const txt = (x, y, s, size, o = {}) => ({ t: "text", x, y, s: String(s), size, halo: false, ...o });
  const rect = (x, y, w, h, o = {}) => ({ t: "poly", pts: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], w: 0.35, fill: "white", lead: true, ...o });
  const line = (x1, y1, x2, y2, w = 0.35) => ({ t: "line", x1, y1, x2, y2, w, lead: true });
  // 問題の図と答えの図(答えは keyItems を 答えの色で 足したもの)
  function figs(w, h, items, keyItems, scaleK = 1) {
    const f = (extra) => ({ type: "draw", w, h, items: [...items, ...extra], scaleK });
    return { figure: f([]), answer: { display: "", figure: f(keyItems) } };
  }
  const keyNum = (x, y, s, size) => txt(x, y, s, size, { color: KEY, bold: true });
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const base = (p) => ({ noAnswerBox: true, workspace: { type: "none" } });

  // ===================== マス計算(25・49・100マス)=====================
  const MASU = {
    "+": { basic: [range(0, 9), range(0, 9)], normal: [range(10, 19), range(1, 9).concat([0])], challenge: [range(11, 99), range(11, 99)] },
    "-": { basic: [range(10, 19), range(0, 9)], normal: [range(20, 99), range(1, 9).concat([0])], challenge: [range(50, 99), range(10, 49)] },
    "×": { basic: [range(1, 10), range(1, 10)], normal: [range(1, 10), range(1, 10)], challenge: [range(11, 25), range(2, 9).concat([10, 11])] }
  };
  const masuOp = (op, a, b) => op === "+" ? a + b : op === "-" ? a - b : a * b;
  function masuGen(op, idSuffix) {
    return {
      id: `pz.masu${idSuffix}`,
      instruction: null,
      defaults: { size: 10, lv: "basic" },
      levels: { basic: { lv: "basic" }, normal: { lv: "normal" }, challenge: { lv: "challenge" } },
      generate(rng, p) {
        const n = p.size || 10, [topR, leftR] = MASU[op][p.lv];
        const top = rng.shuffle(topR.slice()).slice(0, n), left = rng.shuffle(leftR.slice()).slice(0, n);
        const C = n === 5 ? 22 : n === 7 ? 17 : 13.5, x0 = 2, y0 = 2, N = n + 1, W = N * C;
        const big = Math.max(...top.flatMap((a) => left.map((b) => masuOp(op, a, b))));
        const hs = (n === 5 ? 9 : n === 7 ? 7.5 : 5.6) * (Math.max(...top, ...left) >= 100 ? 0.8 : 1);
        const ks = (n === 5 ? 8 : n === 7 ? 6.6 : 5) * (big >= 1000 ? 0.7 : big >= 100 ? 0.82 : 1);
        // 左ききの 子むけ:たての 数を 右がわに おく(書く 手で 数が かくれない)
        const lefty = p.hand === "left", hc = lefty ? n : 0, dc = (c) => lefty ? c : c + 1;
        const side = lefty ? "{右|みぎ}" : "{左|ひだり}";
        const items = [], keys = [];
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) items.push(rect(x0 + c * C, y0 + r * C, C, C, { w: r === 0 || c === hc ? 0.5 : 0.3, fill: r === 0 || c === hc ? "#eef3f7" : "white" }));
        items.push(rect(x0, y0, W, W, { w: 0.9, fill: "none" }));
        const vx = x0 + (lefty ? n : 1) * C;
        items.push(line(vx, y0, vx, y0 + W, 0.9), line(x0, y0 + C, x0 + W, y0 + C, 0.9));
        items.push(txt(x0 + (hc + 0.5) * C, y0 + C / 2 + hs * 0.36, op === "-" ? "－" : op === "+" ? "＋" : "×", hs, { bold: true }));
        top.forEach((a, c) => items.push(txt(x0 + (dc(c) + 0.5) * C, y0 + C / 2 + hs * 0.36, a, hs, { bold: true })));
        left.forEach((b, r) => items.push(txt(x0 + (hc + 0.5) * C, y0 + (r + 1.5) * C + hs * 0.36, b, hs, { bold: true })));
        left.forEach((b, r) => top.forEach((a, c) => keys.push(keyNum(x0 + (dc(c) + 0.5) * C, y0 + (r + 1.5) * C + ks * 0.36, masuOp(op, a, b), ks))));
        // タイムと 点数を 書く らん(設定で けせる)
        const rec = p.rec === "off" ? "" : `　[[nw]]タイム(　　{分|ふん}　　{秒|びょう})[[/nw]]　[[nw]]{点|てん}(　　／${n * n})[[/nw]]`;
        return {
          key: `masu${op}:${n}:${top.join(",")}:${left.join(",")}`,
          softKey: `masu${op}:${top.slice(0, 3).join(",")}`,
          text: `{上|うえ}の {数|かず}${op === "-" ? `から ${side}の {数|かず}を ひいた` : op === "+" ? `と ${side}の {数|かず}を たした` : `と ${side}の {数|かず}を かけた`} {答|こた}えを {書|か}きましょう。${rec}`,
          wide: true,
          ...figs(W + 4, W + 4, items, keys, n === 10 ? 1.2 : 1.1),
          ...base(p),
          meta: { op, n, top, left }
        };
      },
      verify(pr, p) {
        const { op, n, top, left } = pr.meta;
        if (n !== (p.size || 10) || top.length !== n || left.length !== n) return "大きさがちがう";
        if (new Set(top).size !== n || new Set(left).size !== n) return "おなじ数がある";
        const ks = pr.answer.figure.items.filter((it) => it.color === KEY);
        if (ks.length !== n * n) return "答えの数がたりない";
        let k = 0;
        for (const b of left) for (const a of top) if (Number(ks[k++].s) !== masuOp(op, a, b)) return "答えがちがう";
        if (op === "-" && top.some((a) => left.some((b) => a < b))) return "ひけない";
        return null;
      }
    };
  }
  const sizeOpt = { key: "size", label: "マスの 数", num: true, choices: [["auto", "100マス"], ["5", "25マス"], ["7", "49マス"], ["10", "100マス"]] };

  // ===================== 虫くい算(筆算の □)=====================
  const digits = (n, len) => String(n).padStart(len, " ").split("");
  function hissanFig(rows, op, blanks, cw = 8.5) {
    // rows: [a, b, ans] の文字の列(右そろえ)、blanks: Set("r,c")(c は右から)
    const cols = Math.max(...rows.map((r) => r.length)) + 1, H = 9.5;
    const W = cols * cw + 2, items = [], keys = [];
    const X = (c) => 1 + (cols - 1 - c) * cw + cw / 2; // c=0 が一の位
    rows.forEach((r, ri) => {
      const y = 1 + ri * H + (ri === 2 ? 2.4 : 0);
      [...r].reverse().forEach((ch, c) => {
        if (ch === " ") return;
        if (blanks.has(`${ri},${c}`)) {
          items.push(rect(X(c) - 3.6, y + 0.8, 7.2, 7.8, { w: 0.5 }));
          keys.push(keyNum(X(c), y + 7, ch, 6.2));
        } else items.push(txt(X(c), y + 7, ch, 6.4));
      });
    });
    items.push(txt(1 + cw / 2, 1 + H + 7, op, 6.2));
    items.push(line(1, 1 + 2 * H + 1.2, W - 1, 1 + 2 * H + 1.2, 0.6));
    return { W, H: 3 * H + 4.5, items, keys };
  }
  // 虫くい:□の数字を ぜんぶ ためして、答えが1つだけかを しらべる
  function countSolutions(rows, op, blanks) {
    const cells = [...blanks].map((k) => k.split(",").map(Number));
    let count = 0;
    const cur = rows.map((r) => [...r]);
    const val = (ri) => Number(cur[ri].join("").trim());
    const rec = (i) => {
      if (count > 1) return;
      if (i === cells.length) {
        const [a, b, c] = [0, 1, 2].map(val);
        if (cur.some((r) => r.join("").trim()[0] === "0" && r.join("").trim().length > 1)) return;
        if ((op === "＋" ? a + b : op === "－" ? a - b : a * b) === c) count++;
        return;
      }
      const [ri, c] = cells[i], len = cur[ri].length;
      for (let d = 0; d <= 9; d++) {
        cur[ri][len - 1 - c] = String(d);
        rec(i + 1);
      }
    };
    rec(0);
    return count;
  }
  function mushiGen(kind) {
    const OPS = { add: "＋", sub: "－", mul: "×" };
    return {
      id: `pz.mushi.${kind}`,
      instruction: "□の {中|なか}に あてはまる {数|かず}を {書|か}きましょう。",
      defaults: { digits: 2, blanks: 1 },
      levels: kind === "mul"
        ? { basic: { digits: 2, blanks: 1 }, normal: { digits: 2, blanks: 2 }, challenge: { digits: 3, blanks: 2 } }
        : { basic: { digits: 2, blanks: 1 }, normal: { digits: 2, blanks: 2 }, challenge: { digits: 3, blanks: 3 } },
      generate(rng, p) {
        const op = OPS[kind], d = p.digits;
        for (let t = 0; t < 400; t++) {
          let a, b, c;
          if (kind === "mul") {
            a = rng.int(10 ** (d - 1) + 1, 10 ** d - 1); b = rng.int(2, 9); c = a * b;
          } else {
            a = rng.int(10 ** (d - 1), 10 ** d - 1); b = rng.int(10 ** (d - 1), 10 ** d - 1);
            if (kind === "sub") { if (a < b) [a, b] = [b, a]; if (a === b) continue; c = a - b; } else c = a + b;
          }
          const len = String(Math.max(a, c)).length;
          const rows = [digits(a, len).join(""), digits(b, len).join(""), digits(c, len).join("")];
          // □の場所:同じ位(たての列)に 2つ入れない
          const cand = [];
          rows.forEach((r, ri) => [...r].reverse().forEach((ch, ci) => { if (ch !== " " && (ri < 2 || p.blanks >= 3)) cand.push(`${ri},${ci}`); }));
          const pick = [], usedCol = new Set();
          for (const k of rng.shuffle(cand)) {
            const col = k.split(",")[1];
            if (usedCol.has(col)) continue;
            pick.push(k); usedCol.add(col);
            if (pick.length === p.blanks) break;
          }
          if (pick.length !== p.blanks) continue;
          const blanks = new Set(pick);
          if (countSolutions(rows, op, blanks) !== 1) continue;
          const f = hissanFig(rows, op, blanks);
          return {
            key: `mu:${kind}:${a}:${b}:${pick.sort().join("|")}`,
            softKey: `mu${a}`,
            text: "",
            cols: 4,
            ...figs(f.W, f.H, f.items, f.keys),
            ...base(p),
            meta: { rows, op, blanks: pick, a, b, c }
          };
        }
        throw new Error("虫くい算が作れない");
      },
      verify(pr, p) {
        const { rows, op, blanks, a, b, c } = pr.meta;
        if ((op === "＋" ? a + b : op === "－" ? a - b : a * b) !== c) return "式がちがう";
        if (blanks.length !== p.blanks) return "□の数がちがう";
        if (new Set(blanks.map((k) => k.split(",")[1])).size !== blanks.length) return "同じ位に□が2つ";
        if (countSolutions(rows, op, new Set(blanks)) !== 1) return "答えが1つにきまらない";
        const ks = pr.answer.figure.items.filter((it) => it.color === KEY);
        if (ks.length !== blanks.length) return "答えの数がちがう";
        return null;
      }
    };
  }

  // ===================== 魔方陣 =====================
  const LO_SHU = [[2, 7, 6], [9, 5, 1], [4, 3, 8]];
  const sym = (g, k) => { // 8とおりの 回転・うらがえし
    let m = g.map((r) => r.slice());
    for (let i = 0; i < k % 4; i++) m = m[0].map((_, c) => m.map((r) => r[c]).reverse());
    if (k >= 4) m = m.map((r) => r.slice().reverse());
    return m;
  };
  const isMagic = (g) => {
    const n = g.length, S = n * (n * n + 1) / 2;
    for (let i = 0; i < n; i++) {
      if (g[i].reduce((a, b) => a + b, 0) !== S) return false;
      if (g.reduce((a, r) => a + r[i], 0) !== S) return false;
    }
    return g.reduce((a, r, i) => a + r[i], 0) === S && g.reduce((a, r, i) => a + r[n - 1 - i], 0) === S;
  };
  function randomMagic4(rng) {
    const g = Array.from({ length: 4 }, () => Array(4).fill(0)), used = new Set(), S = 34;
    const order = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) order.push([r, c]);
    const nums = rng.shuffle(range(1, 16));
    const ok = (r, c) => {
      if (c === 3 && g[r].reduce((a, b) => a + b, 0) !== S) return false;
      if (r === 3 && g.reduce((a, row) => a + row[c], 0) !== S) return false;
      if (r === 3 && c === 3 && g.reduce((a, row, i) => a + row[i], 0) !== S) return false;
      if (r === 3 && c === 0 && g.reduce((a, row, i) => a + row[3 - i], 0) !== S) return false;
      return true;
    };
    let steps = 0;
    const rec = (i) => {
      if (++steps > 200000) return false;
      if (i === 16) return true;
      const [r, c] = order[i];
      for (const v of nums) {
        if (used.has(v)) continue;
        g[r][c] = v; used.add(v);
        if (ok(r, c) && rec(i + 1)) return true;
        used.delete(v); g[r][c] = 0;
      }
      return false;
    };
    return rec(0) ? g : null;
  }
  // あいているマスに のこりの数を入れて、魔方陣になる入れ方の数(2まで)
  function countFill(g, holes, check) {
    const n = g.length, all = range(1, n * n), given = new Set(g.flat().filter((v, i) => !holes.has(i)));
    const rest = all.filter((v) => !given.has(v)), m = g.map((r) => r.slice());
    const hs = [...holes];
    let count = 0;
    const used = new Set();
    const rec = (i) => {
      if (count > 1) return;
      if (i === hs.length) { if (check(m)) count++; return; }
      const r = Math.floor(hs[i] / n), c = hs[i] % n;
      for (const v of rest) {
        if (used.has(v)) continue;
        used.add(v); m[r][c] = v;
        rec(i + 1);
        used.delete(v);
      }
    };
    rec(0);
    return count;
  }
  function gridFig(g, holes, C, extra = {}) {
    const n = g.length, items = [], keys = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      const x = 2 + c * C, y = 2 + r * C, i = r * n + c;
      items.push(rect(x, y, C, C, { w: 0.4 }));
      if (holes.has(i)) keys.push(keyNum(x + C / 2, y + C / 2 + C * 0.17, g[r][c], C * 0.5));
      else items.push(txt(x + C / 2, y + C / 2 + C * 0.18, g[r][c], C * 0.52, { bold: true }));
    }
    items.push(rect(2, 2, n * C, n * C, { w: 0.9, fill: "none" }));
    return { items, keys, W: n * C + 4 };
  }
  const tMagic = {
    id: "pz.magic",
    instruction: "{たて|たて}・よこ・ななめ、どの {列|れつ}を たしても {同|おな}じ {数|かず}に なるように、あいている マスに {数|かず}を {書|か}きましょう。",
    instructionFor: (p) => `たて・よこ・ななめ、どの {列|れつ}を たしても {同|おな}じ {数|かず}に なるように、あいている マスに {数|かず}を {書|か}きましょう。(1〜${p.n * p.n}の {数|かず}を 1{回|かい}ずつ {使|つか}います)`,
    defaults: { n: 3, holes: 3 },
    levels: { basic: { n: 3, holes: 3 }, normal: { n: 3, holes: 5 }, challenge: { n: 4, holes: 7 } },
    generate(rng, p) {
      const n = p.n;
      for (let t = 0; t < 60; t++) {
        const g = n === 3 ? sym(LO_SHU, rng.int(0, 7)) : randomMagic4(rng);
        if (!g) continue;
        const nh = n === 3 ? Math.min(p.holes, 6) : Math.max(p.holes, 4);
        const holes = new Set(rng.shuffle(range(0, n * n - 1)).slice(0, nh));
        if (countFill(g, holes, isMagic) !== 1) continue;
        const C = n === 3 ? 16 : 14, f = gridFig(g, holes, C);
        return {
          key: `mg:${g.flat().join(",")}:${[...holes].sort((a, b) => a - b).join(",")}`,
          softKey: `mg${g.flat().join("")}`,
          text: `{合計|ごうけい}は ${n * (n * n + 1) / 2}`,
          ...figs(f.W, f.W, f.items, f.keys, 1.1),
          ...base(p),
          meta: { g, holes: [...holes] }
        };
      }
      throw new Error("魔方陣が作れない");
    },
    verify(pr, p) {
      const { g, holes } = pr.meta;
      if (g.length !== p.n || !isMagic(g)) return "魔方陣になっていない";
      if (new Set(g.flat()).size !== p.n * p.n) return "同じ数がある";
      if (countFill(g, new Set(holes), isMagic) !== 1) return "答えが1つにきまらない";
      return null;
    }
  };

  // ===================== たし算クロス(右・下・ななめの合計)=====================
  function crossCheck(sums) {
    return (m) => {
      const n = m.length;
      for (let i = 0; i < n; i++) {
        if (m[i].reduce((a, b) => a + b, 0) !== sums.row[i]) return false;
        if (m.reduce((a, r) => a + r[i], 0) !== sums.col[i]) return false;
      }
      return m.reduce((a, r, i) => a + r[i], 0) === sums.diag;
    };
  }
  const tCross = {
    id: "pz.cross",
    instructionFor: (p) => `□には 1〜${p.n * p.n}の {数|かず}が 1{回|かい}ずつ {入|はい}ります。{右|みぎ}と {下|した}の {数|かず}は その {列|れつ}の {合計|ごうけい}、{右下|みぎした}は ななめ(＼)の {合計|ごうけい}です。あいている マスに {数|かず}を {書|か}きましょう。`,
    instruction: "あいている マスに {数|かず}を {書|か}きましょう。",
    defaults: { n: 3, holes: 3 },
    levels: { basic: { n: 3, holes: 3 }, normal: { n: 3, holes: 5 }, challenge: { n: 4, holes: 7 } },
    generate(rng, p) {
      const n = p.n;
      for (let t = 0; t < 300; t++) {
        const flat = rng.shuffle(range(1, n * n)), g = range(0, n - 1).map((r) => flat.slice(r * n, r * n + n));
        const sums = { row: g.map((r) => r.reduce((a, b) => a + b, 0)), col: range(0, n - 1).map((c) => g.reduce((a, r) => a + r[c], 0)), diag: g.reduce((a, r, i) => a + r[i], 0) };
        const holes = new Set(rng.shuffle(range(0, n * n - 1)).slice(0, p.holes));
        if (countFill(g, holes, crossCheck(sums)) !== 1) continue;
        const C = n === 3 ? 14 : 12.5, f = gridFig(g, holes, C);
        const S = 2 + n * C;
        // 合計のマス(灰色)
        for (let i = 0; i < n; i++) {
          f.items.push(rect(S, 2 + i * C, C, C, { w: 0.4, fill: "#e4e4e4" }), txt(S + C / 2, 2 + i * C + C / 2 + C * 0.18, sums.row[i], C * 0.46, { bold: true }));
          f.items.push(rect(2 + i * C, S, C, C, { w: 0.4, fill: "#e4e4e4" }), txt(2 + i * C + C / 2, S + C / 2 + C * 0.18, sums.col[i], C * 0.46, { bold: true }));
        }
        f.items.push(rect(S, S, C, C, { w: 0.4, fill: "#e4e4e4" }), txt(S + C / 2, S + C / 2 + C * 0.18, sums.diag, C * 0.46, { bold: true }));
        f.items.push(line(S + 1.5, S + 1.5, S + 4.5, S + 4.5, 0.4));
        return {
          key: `cr:${flat.join(",")}:${[...holes].sort((a, b) => a - b).join(",")}`,
          softKey: `cr${flat.slice(0, 4).join("")}`,
          text: "",
          ...figs(S + C + 2, S + C + 2, f.items, f.keys, 1.1),
          ...base(p),
          meta: { g, holes: [...holes], sums }
        };
      }
      throw new Error("クロスが作れない");
    },
    verify(pr, p) {
      const { g, holes, sums } = pr.meta;
      if (g.length !== p.n || new Set(g.flat()).size !== p.n * p.n) return "数がちがう";
      if (!crossCheck(sums)(g)) return "合計がちがう";
      if (holes.length !== p.holes) return "あなの数がちがう";
      if (countFill(g, new Set(holes), crossCheck(sums)) !== 1) return "答えが1つにきまらない";
      return null;
    }
  };

  // ===================== 上の数(となりの2つをたすと 下の数)=====================
  function stackRows(top, k) {
    const rows = [top];
    for (let i = 1; i < k; i++) rows.push(rows[i - 1].slice(1).map((v, j) => v + rows[i - 1][j]));
    return rows;
  }
  // いちばん下の段と、上の段で見えている数から、上の段が1とおりに きまるか
  function countTop(bottom, k, given) {
    let count = 0;
    const N = 9;
    // 上の段の はじめの k-1 こを きめると、のこりは 下の段から きまる
    const rec = (pre) => {
      if (count > 1) return;
      if (pre.length < k - 1) { for (let v = 1; v <= 9; v++) if (!pre.includes(v)) rec([...pre, v]); return; }
      const t = pre.slice();
      for (let i = 0; t.length < N; i++) {
        // bottom[i] = Σ C(k-1,j) t[i+j]
        const binom = [1]; for (let j = 1; j < k; j++) binom.push(binom[j - 1] * (k - j) / j);
        let s = 0; for (let j = 0; j < k - 1; j++) s += binom[j] * t[i + j];
        const v = bottom[i] - s;
        if (v < 1 || v > 9 || t.includes(v)) return;
        t.push(v);
      }
      if (given.every(([i, v]) => t[i] === v)) count++;
    };
    rec([]);
    return count;
  }
  const tStack = {
    id: "pz.stack",
    instructionFor: (p) => `いちばん {上|うえ}の {段|だん}には 1〜9の {数|かず}が 1{回|かい}ずつ {入|はい}ります。{下|した}の {段|だん}は、{上|うえ}の となりあう 2つの {数|かず}の {合計|ごうけい}です。あいている □に {数|かず}を {書|か}きましょう。`,
    instruction: "あいている □に {数|かず}を {書|か}きましょう。",
    defaults: { k: 2, given: 3 },
    levels: { basic: { k: 2, given: 3 }, normal: { k: 2, given: 1 }, challenge: { k: 3, given: 1 } },
    generate(rng, p) {
      for (let t = 0; t < 300; t++) {
        const top = rng.shuffle(range(1, 9)), rows = stackRows(top, p.k);
        const gi = rng.shuffle(range(0, 8)).slice(0, p.given).map((i) => [i, top[i]]);
        if (countTop(rows[p.k - 1], p.k, gi) !== 1) continue;
        const CW = 15, CH = 10, items = [], keys = [];
        rows.forEach((row, ri) => row.forEach((v, i) => {
          const x = 2 + i * CW + ri * CW / 2, y = 2 + ri * CH;
          const shown = ri === p.k - 1 || ri === 0 && gi.some(([j]) => j === i);
          items.push(rect(x, y, CW, CH, { w: 0.45, fill: ri === p.k - 1 ? "#eef3f7" : "white" }));
          if (shown) items.push(txt(x + CW / 2, y + CH / 2 + 2, v, 5.4, { bold: ri === p.k - 1 }));
          else keys.push(keyNum(x + CW / 2, y + CH / 2 + 2, v, 5));
        }));
        return {
          key: `st:${p.k}:${top.join("")}:${gi.map(([i]) => i).join(",")}`,
          softKey: `st${top.join("")}`,
          text: "",
          wide: true,
          ...figs(9 * CW + 4, p.k * CH + 4, items, keys, 1.1),
          ...base(p),
          meta: { top, k: p.k, given: gi }
        };
      }
      throw new Error("上の数が作れない");
    },
    verify(pr, p) {
      const { top, k, given } = pr.meta;
      if (k !== p.k || [...top].sort((a, b) => a - b).join() !== "1,2,3,4,5,6,7,8,9") return "上の段が1〜9でない";
      if (countTop(stackRows(top, k)[k - 1], k, given) !== 1) return "答えが1つにきまらない";
      return null;
    }
  };

  // ===================== 数独(4×4・6×6・9×9)=====================
  const BOX = { 4: [2, 2], 6: [2, 3], 9: [3, 3] };
  function sudokuFull(rng, n) {
    const [br, bc] = BOX[n];
    // もとの形(ずらしてならべる)を、数・行・列・まとまりで いれかえる
    let g = range(0, n - 1).map((r) => range(0, n - 1).map((c) => ((r % br) * bc + Math.floor(r / br) + c) % n + 1));
    const perm = rng.shuffle(range(1, n));
    g = g.map((r) => r.map((v) => perm[v - 1]));
    const shuffleGroups = (groups, size) => rng.shuffle(range(0, groups - 1)).flatMap((b) => rng.shuffle(range(0, size - 1)).map((i) => b * size + i));
    const rows = shuffleGroups(n / br, br), cols = shuffleGroups(n / bc, bc);
    return rows.map((r) => cols.map((c) => g[r][c]));
  }
  function sudokuCount(g0, n, limit = 2) {
    const [br, bc] = BOX[n], g = g0.map((r) => r.slice());
    let count = 0;
    const can = (r, c, v) => {
      for (let i = 0; i < n; i++) if (g[r][i] === v || g[i][c] === v) return false;
      const r0 = r - r % br, c0 = c - c % bc;
      for (let i = 0; i < br; i++) for (let j = 0; j < bc; j++) if (g[r0 + i][c0 + j] === v) return false;
      return true;
    };
    const rec = () => {
      if (count >= limit) return;
      let best = null, bestOpts = null;
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (!g[r][c]) {
        const o = range(1, n).filter((v) => can(r, c, v));
        if (!best || o.length < bestOpts.length) { best = [r, c]; bestOpts = o; }
      }
      if (!best) { count++; return; }
      for (const v of bestOpts) { g[best[0]][best[1]] = v; rec(); g[best[0]][best[1]] = 0; }
    };
    rec();
    return count;
  }
  const tSudoku = {
    id: "pz.sudoku",
    instructionFor: (p) => {
      const [br, bc] = BOX[p.n];
      return `よこの {列|れつ}、たての {列|れつ}、{太|ふと}い {線|せん}で かこんだ ${br}×${bc}の まとまりの どれにも、1〜${p.n}の {数|かず}が 1{回|かい}ずつ {入|はい}るように、あいている マスに {数|かず}を {書|か}きましょう。`;
    },
    instruction: "あいている マスに {数|かず}を {書|か}きましょう。",
    defaults: { n: 4, holes: 8 },
    levels: { basic: { n: 4, holes: 8 }, normal: { n: 6, holes: 18 }, challenge: { n: 9, holes: 45 } },
    generate(rng, p) {
      const n = p.n, [br, bc] = BOX[n];
      for (let t = 0; t < 40; t++) {
        const sol = sudokuFull(rng, n), g = sol.map((r) => r.slice());
        const want = Math.min(p.holes, n === 4 ? 10 : n === 6 ? 22 : 52);
        let made = 0;
        for (const i of rng.shuffle(range(0, n * n - 1))) {
          if (made >= want) break;
          const r = Math.floor(i / n), c = i % n, keep = g[r][c];
          g[r][c] = 0;
          if (sudokuCount(g, n) !== 1) g[r][c] = keep; else made++;
        }
        if (made < want - (n === 9 ? 6 : 1)) continue;
        const holes = new Set(); g.forEach((r, ri) => r.forEach((v, ci) => { if (!v) holes.add(ri * n + ci); }));
        const C = n === 4 ? 15 : n === 6 ? 13 : 14.5, f = gridFig(sol, holes, C);
        for (let i = br; i < n; i += br) f.items.push(line(2, 2 + i * C, 2 + n * C, 2 + i * C, 1));
        for (let j = bc; j < n; j += bc) f.items.push(line(2 + j * C, 2, 2 + j * C, 2 + n * C, 1));
        return {
          key: `sd:${n}:${sol.flat().join("")}:${[...holes].join(",")}`,
          softKey: `sd${sol[0].join("")}`,
          text: "",
          ...(n === 9 ? { wide: true } : {}),
          ...figs(f.W, f.W, f.items, f.keys, n === 9 ? 1.15 : 1),
          ...base(p),
          meta: { sol, holes: [...holes], n }
        };
      }
      throw new Error("数独が作れない");
    },
    verify(pr, p) {
      const { sol, holes, n } = pr.meta;
      if (n !== p.n) return "大きさがちがう";
      const g = sol.map((r) => r.slice());
      if (sudokuCount(g, n) !== 1) return "答えが数独になっていない";
      for (const i of holes) g[Math.floor(i / n)][i % n] = 0;
      if (sudokuCount(g, n) !== 1) return "答えが1つにきまらない";
      return null;
    }
  };

  return [masuGen("+", "Add"), masuGen("-", "Sub"), masuGen("×", "Mul"), mushiGen("add"), mushiGen("sub"), mushiGen("mul"), tMagic, tCross, tStack, tSudoku];
})();
// 「計算・パズル」のまとまり(特別支援の画面の「分野べつ」→ ボタン「計算」= GRADES[30])
var puzzleStage = (() => {
  const size = { key: "size", label: "マスの 数", num: true, choices: [["auto", "100マス"], ["5", "25マス"], ["7", "49マス"], ["10", "100マス"]] };
  const hand = { key: "hand", label: "きき手", choices: [["auto", "右きき(数は 左)"], ["left", "左きき(数は 右)"]] };
  const recOpt = { key: "rec", label: "タイム・点数の らん", choices: [["auto", "あり"], ["off", "なし"]] };
  const nOpt = (lab, ch) => ({ key: "n", label: lab, num: true, choices: [["auto", "★に合わせる"], ...ch] });
  const F = ["figure"], D = ["drill"];
  return {
    key: 30, name: "計算・パズル", ruby: "{計算|けいさん}・パズル", short: "", btn: "計算", part: "分野べつ", styleGrade: 3,
    note: "マス計算(25・49・100マス)、虫くい算、魔方陣、たし算クロス、上の数、数独。くりかえし練習や、考える力をつけるプリント(数は毎回かわります)",
    units: [
      { name: "マス{計算|けいさん}", domain: "計算", from: [["pz.masuAdd", null, { label: "たし算の マス計算", kinds: F, options: [size, hand, recOpt] }], ["pz.masuSub", null, { label: "ひき算の マス計算", kinds: F, options: [size, hand, recOpt] }], ["pz.masuMul", null, { label: "かけ算の マス計算", kinds: F, options: [size, hand, recOpt] }]], unitProps: {} },
      { name: "{虫|むし}くい{算|ざん}", domain: "計算", from: [["pz.mushi.add", null, { label: "たし算の 虫くい算", kinds: D }], ["pz.mushi.sub", null, { label: "ひき算の 虫くい算", kinds: D }], ["pz.mushi.mul", null, { label: "かけ算の 虫くい算", kinds: D }]] },
      { name: "{魔方陣|まほうじん}", domain: "パズル", from: [["pz.magic", null, { label: "魔方陣", kinds: F, options: [nOpt("大きさ", [["3", "3×3"], ["4", "4×4"]])] }]] },
      { name: "たし{算|ざん}クロス", domain: "パズル", from: [["pz.cross", null, { label: "たし算クロス", kinds: F, options: [nOpt("大きさ", [["3", "3×3(1〜9)"], ["4", "4×4(1〜16)"]])] }]] },
      { name: "{上|うえ}の{数|かず}", domain: "パズル", from: [["pz.stack", null, { label: "上の数", kinds: F, options: [{ key: "k", label: "段", num: true, choices: [["auto", "★に合わせる"], ["2", "2段"], ["3", "3段"]] }] }]] },
      { name: "{数独|すうどく}", domain: "パズル", from: [["pz.sudoku", null, { label: "数独", kinds: F, options: [nOpt("大きさ", [["4", "4×4"], ["6", "6×6"], ["9", "9×9"]])] }]] }
    ]
  };
})();
