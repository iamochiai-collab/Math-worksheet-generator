// 幼児向けプリント(3〜6さい)。すらぷり・ちびむすドリルのつくりを参考に、1まいの問題を少なく、絵と字を大きく。
// 答えのページは「答えを赤で書きこんだプリント」。★☆☆・★★☆ は1問目を「れい」(うすい字をなぞるお手本)にする。
var yoji = (() => {
  const W = 172;
  const RED = "#d7263d", GRAY = "#c2c2c2", INK = "#000";
  const FONT_NUM = "inherit";
  const rect = (x, y, w, h, o = {}) => ({ t: "poly", pts: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], w: 0.6, fill: "white", lead: true, ...o });
  const box = (x, y, s, o = {}) => rect(x, y, s, s, { w: 0.8, ...o });
  const txt = (x, y, s, size, o = {}) => ({ t: "text", x, y, s: String(s), size, halo: false, ...o });
  const numIn = (x, y, s, n, color) => txt(x + s / 2, y + s * 0.79, n, s * 0.74, { color, font: FONT_NUM });
  const ring = (cx, cy, r, color, w = 0.9) => ({ t: "circle", cx, cy, r, w, color, lead: true });
  const panel = (x, y, w, h, r = 4) => ({ ...frame(x, y, w, h, r), w: 0.5 });
  const pic = (kind, cx, cy, s, tag, o) => icon(kind, cx, cy, s, o).map((it) => ({ ...it, g: tag, kind }));
  // 十字の点線が入ったマス(数字を書くところ)
  function masu(x, y, s) {
    return [
      box(x, y, s),
      { t: "line", x1: x + s / 2, y1: y + 1, x2: x + s / 2, y2: y + s - 1, w: 0.25, dash: "dot", color: "#999", lead: true },
      { t: "line", x1: x + 1, y1: y + s / 2, x2: x + s - 1, y2: y + s / 2, w: 0.25, dash: "dot", color: "#999", lead: true }
    ];
  }
  const tagsOf = (items, kind) => new Set(items.filter((it) => it.g !== void 0 && (!kind || it.kind === kind)).map((it) => it.g));
  // 問題の図と答えの図をまとめて作る。ans(color) は答えの部分(れいは灰色、答えのページは赤)
  function made(rng, p, ctx, { key, softKey, text, w: w0, h: h0, items, ans, meta, noExample }) {
    let w = w0, h = h0;
    const example = !noExample && p.example && ctx && ctx.index === 0;
    
    // 字が切れないように、まわりに少しよゆうをとる
    w = Math.min(W + 4, w + 4);
    h = h + 3;
    const fig = (extra) => ({ type: "draw", w, h, items: [...items, ...extra], scaleK: 1 });
    return {
      key: (example ? "ex:" : "") + key,
      softKey,
      text,
      figure: fig(example ? ans(GRAY) : []),
      answer: { display: "", figure: fig(ans(RED)) },
      workspace: { type: "none" },
      example,
      meta
    };
  }
  const EX = { basic: { example: true }, normal: { example: true }, challenge: { example: false } };
  const lv = (b, n, c) => ({ basic: { ...EX.basic, ...b }, normal: { ...EX.normal, ...n }, challenge: { ...EX.challenge, ...c } });
  const nameOf = (k) => ICONS[k].name;
  const ctr = (k, n) => counterOf(n, ICONS[k].counter);
  // 答えの図の中の赤い数字を読む(検算用)
  const redNums = (fig) => fig.items.filter((it) => it.t === "text" && it.color === RED).map((it) => it.s);
  const redRings = (fig) => fig.items.filter((it) => it.t === "circle" && it.color === RED);

  // ===== 1 かずを かぞえよう =====
  const yCount = {
    id: "y.count",
    instruction: null,
    defaults: { min: 1, max: 5, scatter: false, mix: false, example: true },
    levels: lv({ min: 1, max: 5 }, { min: 3, max: 10 }, { min: 4, max: 10, scatter: true, mix: true }),
    generate(rng, p, ctx) {
      const kind = rng.pick(THINGS2.concat(ANIMALS)), n = rng.int(p.min, p.max);
      const other = p.mix ? rng.pick(THINGS2.concat(ANIMALS).filter((k) => k !== kind)) : null;
      const m = other ? rng.int(2, 4) : 0;
      const S = 16, P = 21, PW = 5 * P + 10;
      let pos;
      if (!p.scatter) pos = Array.from({ length: n }, (_, i) => [7 + P / 2 + i % 5 * P, 6 + P / 2 + Math.floor(i / 5) * P]);
      else {
        const slots = [];
        for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) slots.push([7 + P / 2 + c * P + (r % 2) * (P / 2) - P / 4, 6 + P / 2 + r * P]);
        pos = rng.shuffle(slots).slice(0, n + m);
      }
      const kinds = rng.shuffle([...Array(n).fill(kind), ...Array(m).fill(other)]);
      const rows = p.scatter ? 3 : Math.ceil(n / 5);
      const PH = rows * P + 12;
      const items = [panel(1, 1, PW, PH)];
      pos.forEach(([x, y], i) => items.push(...pic(kinds[i], x + 1, y + 1, S, i)));
      const bs = 26, bx = PW + 14, by = 1 + PH / 2 - bs / 2;
      items.push(box(bx, by, bs), txt(bx + bs + 3, by + bs * 0.75, ICONS[kind].counter === "ほん" ? "ほん" : ICONS[kind].counter === "ひき" ? "ひき" : ICONS[kind].counter, 9, { anchor: "start" }));
      return made(rng, p, ctx, {
        key: `yc:${kind}:${n}:${other}:${m}:${pos.length}`,
        softKey: kind,
        text: other ? `${nameOf(kind)}だけ かぞえましょう。` : `${nameOf(kind)}は いくつ ありますか。`,
        w: bx + bs + 22, h: PH + 3, items,
        ans: (c) => [numIn(bx, by, bs, n, c)],
        meta: { kind, n }
      });
    },
    verify(pr, p) {
      const { kind, n } = pr.meta;
      if (tagsOf(pr.figure.items, kind).size !== n) return "絵の数が合わない";
      if (redNums(pr.answer.figure).join() !== String(n)) return "答えが合わない";
      if (n < p.min || n > p.max) return "数が範囲外";
      return null;
    }
  };

  // ===== 2 すうじを かこう =====
  // ていねいに(1まいに 3こ)と 10こずつ(1まいに 10こ)。どちらも「はじめの かず」から じゅんばんに 100まで。
  // ★☆☆ ぜんぶ なぞる、★★☆ はんぶん なぞる、★★★ 1つ なぞって あとは じぶんで
  const traceNum = (d, x, y, s2, color) => {
    const k = String(d).length;
    return txt(x + s2 / 2, y + s2 * (k === 1 ? 0.79 : k === 2 ? 0.74 : 0.7), d, s2 * (k === 1 ? 0.74 : k === 2 ? 0.6 : 0.44), { color, font: FONT_NUM, row: d });
  };
  // 100をこえたら 1から くりかえす(じゅんばんが くずれないように、100で くぎる)
  const upTo100 = (arr) => {
    const m = arr.map((d) => (d - 1) % 100 + 1), out = [m[0]];
    for (let i = 1; i < m.length && m[i] === out[out.length - 1] + 1; i++) out.push(m[i]);
    return out;
  };
  function traceProblem(nums, p, rowFn, w, h) {
    const items = [], reds = [];
    nums.forEach((d, r) => rowFn(d, r, items, reds));
    const fig = (extra) => ({ type: "draw", w, h, items: [...items, ...extra], scaleK: 1 });
    return {
      key: `yt:${nums.join(",")}`,
      text: "すうじを かきましょう。",
      figure: fig([]),
      answer: { display: "", figure: fig(reds) },
      workspace: { type: "none" },
      meta: { nums, gray: p.gray, cells: p.cells }
    };
  }
  function traceVerify(pr, p) {
    const { nums } = pr.meta;
    for (let i = 1; i < nums.length; i++) if (nums[i] !== nums[i - 1] + 1) return "じゅんばんに なっていない";
    if (nums[0] < 1 || nums[nums.length - 1] > 100) return "数字が範囲外";
    const blacks = pr.figure.items.filter((it) => it.t === "text" && it.color === INK).map((it) => Number(it.s));
    if (blacks.join() !== nums.join()) return "お手本の数字が違う";
    const grays = pr.figure.items.filter((it) => it.t === "text" && it.color === GRAY);
    if (grays.length !== p.gray * nums.length || grays.some((g) => g.s !== String(g.row))) return "なぞりの数字が違う";
    const reds = pr.answer.figure.items.filter((it) => it.t === "text" && it.color === RED);
    if (reds.length !== (p.cells - p.gray) * nums.length || reds.some((g) => g.s !== String(g.row))) return "答えの数字が違う";
    return null;
  }
  // ていねいに: 大きな お手本と、その かずだけの まる(10まで)、マス 5つ
  const yTrace = {
    id: "y.trace",
    instruction: null,
    defaults: { gray: 5, cells: 5 },
    levels: { basic: { gray: 5, cells: 5 }, normal: { gray: 3, cells: 5 }, challenge: { gray: 1, cells: 5 } },
    generate(rng, p, ctx) {
      const from = Math.max(1, Math.min(100, ctx?.from || 1)), first = from + 3 * (ctx?.index || 0);
      const nums = upTo100([first, first + 1, first + 2]);
      const S = 25, GAP = 3.5, X0 = 46, RH = 60;
      return traceProblem(nums, p, (d, r, items, reds) => {
        const y = 1 + r * RH;
        items.push(box(1, y, 36, { w: 1.1 }), traceNum(d, 1, y, 36, INK));
        if (d <= 10) for (let i = 0; i < d; i++) items.push({ t: "circle", cx: 4 + (i % 5) * 7, cy: y + 42 + Math.floor(i / 5) * 7, r: 2.6, w: 0.4, fill: "white", lead: true });
        for (let i = 0; i < p.cells; i++) {
          const x = X0 + i * (S + GAP);
          items.push(...masu(x, y + 5, S));
          if (i < p.gray) items.push(traceNum(d, x, y + 5, S, GRAY));
          else reds.push(traceNum(d, x, y + 5, S, RED));
        }
      }, X0 + p.cells * (S + GAP), nums.length * RH - 4);
    },
    verify: traceVerify
  };
  // 10こずつ: 1まいに 10この かず(1〜10、11〜20 …)
  const yTrace10 = {
    id: "y.trace10",
    instruction: null,
    defaults: { gray: 4, cells: 4 },
    levels: { basic: { gray: 4, cells: 4 }, normal: { gray: 2, cells: 4 }, challenge: { gray: 1, cells: 4 } },
    generate(rng, p, ctx) {
      const from = Math.max(1, Math.min(100, ctx?.from || 1)), first = from + 10 * (ctx?.index || 0);
      const nums = upTo100(Array.from({ length: 10 }, (_, i) => first + i));
      const S = 17, GAP = 4, X0 = 31, RH = S + 4;
      return traceProblem(nums, p, (d, r, items, reds) => {
        const y = 1 + r * RH;
        items.push(box(1, y, S + 2, { w: 1.1 }), traceNum(d, 1, y, S + 2, INK));
        for (let i = 0; i < p.cells; i++) {
          const x = X0 + i * (S + GAP);
          items.push(...masu(x, y + 1, S));
          if (i < p.gray) items.push(traceNum(d, x, y + 1, S, GRAY));
          else reds.push(traceNum(d, x, y + 1, S, RED));
        }
      }, X0 + p.cells * (S + GAP), nums.length * RH + 2);
    },
    verify: traceVerify
  };

  // ===== 3 おなじ かずを せんで むすぼう =====
  const yMatch = {
    id: "y.match",
    instruction: null,
    defaults: { k: 3, max: 5 },
    levels: lv({ k: 3, max: 5 }, { k: 4, max: 10 }, { k: 4, max: 10, near: true }),
    generate(rng, p, ctx) {
      let nums;
      for (let t = 0; t < 100; t++) {
        nums = rng.shuffle(Array.from({ length: p.max }, (_, i) => i + 1)).slice(0, p.k);
        if (!p.near) break;
        const s = nums.slice().sort((a, b) => a - b);
        if (s.slice(1).some((x, i) => x - s[i] === 1)) break;
      }
      const kinds = rng.shuffle(THINGS2.concat(ANIMALS)).slice(0, p.k);
      const right = rng.shuffle(nums.slice());
      const RH = 31, CW = 78, items = [];
      const lDot = [], rDot = [];
      nums.forEach((n, i) => {
        const y = 1 + i * RH;
        items.push(panel(1, y, CW, RH - 5, 3));
        const s = n > 5 ? 9.5 : 12, pitch = n > 5 ? 11.5 : 14;
        for (let j = 0; j < n; j++) {
          const cx = 8 + (j % 5) * pitch + (n > 5 ? 0 : 2), cy = y + (n > 5 ? 7 + Math.floor(j / 5) * 11 : (RH - 5) / 2);
          items.push(...pic(kinds[i], cx, cy, s, `${i}:${j}`));
        }
        lDot.push([CW + 6, y + (RH - 5) / 2]);
        items.push({ t: "dot", x: CW + 6, y: y + (RH - 5) / 2, r: 1.6 });
      });
      right.forEach((n, i) => {
        const y = 1 + i * RH + (RH - 5) / 2;
        items.push(ring(W - 26, y, 10.5, INK, 0.7), txt(W - 26, y + 4.6, n, 13));
        rDot.push([W - 44, y]);
        items.push({ t: "dot", x: W - 44, y, r: 1.6 });
      });
      return made(rng, p, ctx, {
        key: `ym:${nums.join(",")}:${right.join(",")}:${kinds.join(",")}`,
        text: "おなじ かずを せんで むすびましょう。",
        w: W, h: p.k * RH - 2, items,
        ans: (c) => nums.map((n, i) => ({ t: "line", x1: lDot[i][0], y1: lDot[i][1], x2: rDot[right.indexOf(n)][0], y2: rDot[right.indexOf(n)][1], w: 1, color: c, lead: true, cap: "round", from: i, to: right.indexOf(n) })),
        meta: { nums, right, kinds }
      });
    },
    verify(pr) {
      const { nums, right, kinds } = pr.meta;
      if (new Set(nums).size !== nums.length) return "数がかぶっている";
      const lines = pr.answer.figure.items.filter((it) => it.t === "line" && it.color === RED);
      if (lines.length !== nums.length) return "線の数が違う";
      for (const ln of lines) {
        const cnt = tagsOf(pr.figure.items, kinds[ln.from]).size;
        if (cnt !== right[ln.to]) return "つないだ数が合わない";
      }
      return null;
    }
  };

  // ===== 4 どちらが おおい =====
  const yCompare = {
    id: "y.compare",
    instruction: null,
    defaults: { max: 5, minDiff: 2 },
    levels: lv({ max: 5, minDiff: 2 }, { max: 10, minDiff: 1 }, { max: 10, minDiff: 1, spread: true, fewer: true }),
    generate(rng, p, ctx) {
      const [ka, kb] = rng.shuffle(THINGS2.concat(ANIMALS)).slice(0, 2);
      let a, b;
      do {
        a = rng.int(2, p.max);
        b = rng.int(2, p.max);
      } while (Math.abs(a - b) < p.minDiff);
      const askFew = p.fewer && rng.chance(0.5);
      const S = 12.5, P = 14.6, X0 = 24, RH = 22;
      const pitch = [P, P];
      if (p.spread) {
        const few = a < b ? 0 : 1, nm = Math.max(a, b), nf = Math.min(a, b);
        pitch[few] = Math.min((nm * P) / nf * 1.1, P * 2.2, (W - X0 - 4) / nf);
      }
      const items = [];
      const rows = [[ka, a], [kb, b]];
      const boxes = [];
      rows.forEach(([k, n], r) => {
        const cy = 1 + RH / 2 + r * (RH + 5);
        items.push(box(2, cy - 8, 16));
        boxes.push([10, cy]);
        items.push(panel(X0 - 3, cy - RH / 2, W - X0 + 1, RH, 3));
        for (let i = 0; i < n; i++) items.push(...pic(k, X0 + pitch[r] / 2 + i * pitch[r], cy, S, `${r}:${i}`));
      });
      const win = askFew ? (a < b ? 0 : 1) : a > b ? 0 : 1;
      return made(rng, p, ctx, {
        key: `ycp:${ka}${a}:${kb}${b}:${askFew}`,
        softKey: `${ka}${kb}`,
        text: askFew ? "すくない ほうに ○を つけましょう。" : "おおい ほうに ○を つけましょう。",
        w: W, h: 2 * RH + 8, items,
        ans: (c) => [ring(boxes[win][0], boxes[win][1], 5.6, c, 1.1)],
        meta: { ka, kb, a, b, askFew }
      });
    },
    verify(pr) {
      const { ka, kb, a, b, askFew } = pr.meta;
      const na = [...tagsOf(pr.figure.items, ka)].filter((g) => g.startsWith("0:")).length, nb = [...tagsOf(pr.figure.items, kb)].filter((g) => g.startsWith("1:")).length;
      if (na !== a || nb !== b || a === b) return "絵の数が合わない";
      const rr = redRings(pr.answer.figure);
      if (rr.length !== 1) return "○が1つでない";
      const row = rr[0].cy < 1 + 22 + 2.5 ? 0 : 1;
      const want = askFew ? (a < b ? 0 : 1) : a > b ? 0 : 1;
      return row === want ? null : "○の場所が違う";
    }
  };

  // ===== 5 かずの じゅんばん(でんしゃ) =====
  function train(x0, y0, n, cw) {
    const items = [];
    // せんとうの車(左)
    items.push({ t: "path", d: `M${x0} ${y0 + 4}L${x0 + 6} ${y0 + 4}L${x0 + 6} ${y0 - 4}L${x0 + 14} ${y0 - 4}L${x0 + 14} ${y0 + 4}L${x0 + 20} ${y0 + 4}L${x0 + 20} ${y0 + cw}L${x0} ${y0 + cw}Z`, w: 0.6, fill: "light", lead: true });
    items.push({ t: "poly", pts: [[x0 + 1.5, y0 + 7], [x0 + 6, y0 + 7], [x0 + 6, y0 + 12], [x0 + 1.5, y0 + 12]], w: 0.4, fill: "white", lead: true });
    items.push(ring(x0 + 5, y0 + cw + 2.5, 2.5, INK, 0.6), ring(x0 + 15, y0 + cw + 2.5, 2.5, INK, 0.6));
    const cells = [];
    for (let i = 0; i < n; i++) {
      const x = x0 + 23 + i * (cw + 3);
      items.push(rect(x, y0, cw, cw, { w: 0.8 }), ring(x + 4.5, y0 + cw + 2.5, 2.5, INK, 0.6), ring(x + cw - 4.5, y0 + cw + 2.5, 2.5, INK, 0.6));
      items.push({ t: "line", x1: x - 3, y1: y0 + cw - 3, x2: x, y2: y0 + cw - 3, w: 0.8, lead: true });
      cells.push(x);
    }
    return { items, cells };
  }
  const ySeq = {
    id: "y.seq",
    instruction: null,
    defaults: { len: 5, lo: 1, hi: 5, blanks: [1, 2], down: false },
    levels: lv({ len: 5, lo: 1, hi: 7, blanks: [1, 2] }, { len: 6, lo: 1, hi: 10, blanks: [2, 3] }, { len: 6, lo: 1, hi: 20, blanks: [2, 3], down: true }),
    generate(rng, p, ctx) {
      // 「はじめの かず」を えらんだときは、そこから じゅんばんに つづける(100まで)
      const from = ctx && ctx.from > 0 ? ctx.from : 0;
      const down = !from && p.down && rng.chance(0.4);
      const start = from ? Math.min(from + (ctx.index || 0) * p.len, 101 - p.len) : p.hi - p.lo + 1 <= p.len ? p.lo : rng.int(p.lo, p.hi - p.len + 1);
      let seq = Array.from({ length: p.len }, (_, i) => start + i);
      if (down) seq = seq.reverse();
      const nb = rng.pick(p.blanks);
      const blanks = rng.shuffle(seq.map((_, i) => i).slice(1)).slice(0, nb).sort((a, b) => a - b);
      const cw = 20;
      const { items, cells } = train(2, 8, p.len, cw);
      seq.forEach((v, i) => {
        if (!blanks.includes(i)) items.push(numIn(cells[i], 8, cw, v, INK));
      });
      return made(rng, p, ctx, {
        key: `ys:${seq.join(",")}:${blanks.join(",")}`,
        text: "あいて いる ところに かずを かきましょう。",
        w: cells[p.len - 1] + cw + 2, h: 8 + cw + 7, items,
        ans: (c) => blanks.map((i) => numIn(cells[i], 8, cw, seq[i], c)),
        meta: { seq, blanks }
      });
    },
    verify(pr) {
      const { seq, blanks } = pr.meta;
      const step = seq[1] - seq[0];
      if (Math.abs(step) !== 1 || seq.some((v, i) => i && v - seq[i - 1] !== step)) return "1ずつ変わっていない";
      const shown = pr.figure.items.filter((it) => it.t === "text" && it.color === INK).map((it) => Number(it.s));
      if (shown.length !== seq.length - blanks.length) return "見える数の数が違う";
      if (redNums(pr.answer.figure).join() !== blanks.map((i) => seq[i]).join()) return "答えが合わない";
      if (blanks.includes(0)) return "はじめが空いている";
      return null;
    }
  };
