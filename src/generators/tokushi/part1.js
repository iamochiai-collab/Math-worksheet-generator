// 特別支援学校(知的障害)の算数・数学「段階」用。
// 小学部1段階など、いちばんはじめの段階のための絵のプリント(ある・ない、おなじもの、なかまあつめ、おおきい・ちいさい)。
// つくりは幼児のプリント(yoji)とおなじ:1まいの問題を少なく、絵と字を大きく。答えのページは答えを赤で書きこんだプリント。
var tokushi = (() => {
  const W = 172;
  const RED = "#d7263d", GRAY = "#c2c2c2", INK = "#000";
  const txt = (x, y, s, size, o = {}) => ({ t: "text", x, y, s: String(s), size, halo: false, ...o });
  const ring = (cx, cy, r, color, w = 0.9) => ({ t: "circle", cx, cy, r, w, color, lead: true });
  const panel = (x, y, w, h, r = 4) => ({ ...frame(x, y, w, h, r), w: 0.5 });
  const pic = (kind, cx, cy, s, tag) => icon(kind, cx, cy, s).map((it) => ({ ...it, g: tag, kind }));
  const dot = (x, y) => ({ t: "dot", x, y, r: 1.7 });
  const EX = { basic: { example: true }, normal: { example: true }, challenge: { example: false } };
  const lv = (b, n, c) => ({ basic: { ...EX.basic, ...b }, normal: { ...EX.normal, ...n }, challenge: { ...EX.challenge, ...c } });
  const nameOf = (k) => ICONS[k].name;
  // 問題の図と答えの図をまとめて作る(れいは灰色の答え、答えのページは赤)
  function made(p, ctx, { key, text, h, items, ans, meta }) {
    const example = p.example && ctx && ctx.index === 0;
    const fig = (extra) => ({ type: "draw", w: W + 4, h: h + 3, items: [...items, ...extra], scaleK: 1 });
    return {
      key: (example ? "ex:" : "") + key,
      text,
      figure: fig(example ? ans(GRAY) : []),
      answer: { display: "", figure: fig(ans(RED)) },
      workspace: { type: "none" },
      example,
      meta
    };
  }
  const redRings = (fig) => fig.items.filter((it) => it.t === "circle" && it.color === RED);
  const redLines = (fig) => fig.items.filter((it) => it.t === "line" && it.color === RED);
  const ALL = () => THINGS2.concat(ANIMALS);

  // ===== ある・ない(おさらに ある ほうに ○) =====
  const tAri = {
    id: "t.ari",
    instruction: null,
    defaults: { rows: 2, many: false },
    levels: lv({ rows: 2 }, { rows: 3 }, { rows: 3, many: true }),
    generate(rng, p, ctx) {
      const kinds = rng.shuffle(THINGS2).slice(0, p.rows);
      const RH = 48, items = [], has = [];
      kinds.forEach((k, i) => {
        const y = 2 + i * RH, left = rng.chance(0.5);
        has.push(left ? 0 : 1);
        [0, 1].forEach((side) => {
          const cx = side === 0 ? 50 : 126;
          items.push({ t: "path", d: `M${cx - 30},${y + 30} Q${cx},${y + 40} ${cx + 30},${y + 30} L${cx + 24},${y + 35} Q${cx},${y + 41} ${cx - 24},${y + 35} Z`, w: 0.6, fill: "white", lead: true });
          if ((side === 0) === left) {
            const n = p.many ? rng.int(1, 3) : 1;
            for (let j = 0; j < n; j++) items.push(...pic(k, cx + (j - (n - 1) / 2) * 15, y + 22, n > 1 ? 13 : 17, `${i}:${j}`));
          }
        });
      });
      return made(p, ctx, {
        key: `ta:${kinds.join(",")}:${has.join("")}`,
        text: `${kinds.map(nameOf).join("や ")}が ある おさらに ○を つけましょう。`,
        h: p.rows * RH,
        items,
        ans: (c) => has.map((s, i) => ring(s === 0 ? 50 : 126, 2 + i * RH + 25, 21, c, 1.1)),
        meta: { has, kinds }
      });
    },
    verify(pr) {
      const { has, kinds } = pr.meta;
      const rings = redRings(pr.answer.figure);
      if (rings.length !== has.length) return "○の数が違う";
      for (let i = 0; i < has.length; i++) {
        const side = rings[i].cx < 88 ? 0 : 1;
        const there = pr.figure.items.some((it) => it.kind === kinds[i] && String(it.g).startsWith(`${i}:`));
        if (!there || side !== has[i]) return "○の場所が違う";
      }
      return null;
    }
  };

  // ===== おなじ ものを せんで むすぼう =====
  const tSame = {
    id: "t.same",
    instruction: null,
    defaults: { k: 2 },
    levels: lv({ k: 2 }, { k: 3 }, { k: 4 }),
    generate(rng, p, ctx) {
      const kinds = rng.shuffle(ALL()).slice(0, p.k);
      let right;
      do right = rng.shuffle(kinds.slice());
      while (p.k > 1 && right.every((k, i) => k === kinds[i]));
      const RH = 30, items = [], lDot = [], rDot = [];
      kinds.forEach((k, i) => {
        const y = 2 + i * RH + 12;
        items.push(panel(10, y - 12, 34, 24, 3), ...pic(k, 27, y, 18, `L${i}`), dot(52, y));
        lDot.push([52, y]);
      });
      right.forEach((k, i) => {
        const y = 2 + i * RH + 12;
        items.push(panel(W - 44, y - 12, 34, 24, 3), ...pic(k, W - 27, y, 18, `R${i}`), dot(W - 52, y));
        rDot.push([W - 52, y]);
      });
      return made(p, ctx, {
        key: `ts:${kinds.join(",")}:${right.join(",")}`,
        text: "おなじ ものを せんで むすびましょう。",
        h: p.k * RH,
        items,
        ans: (c) => kinds.map((k, i) => ({ t: "line", x1: lDot[i][0], y1: lDot[i][1], x2: rDot[right.indexOf(k)][0], y2: rDot[right.indexOf(k)][1], w: 1, color: c, lead: true, cap: "round", from: i, to: right.indexOf(k) })),
        meta: { kinds, right }
      });
    },
    verify(pr) {
      const { kinds, right } = pr.meta;
      const lines = redLines(pr.answer.figure);
      if (lines.length !== kinds.length) return "線の数が違う";
      for (const ln of lines) if (kinds[ln.from] !== right[ln.to]) return "ちがう ものを むすんでいる";
      return null;
    }
  };

  // ===== なかまあつめ(おなじ ものに ぜんぶ ○) =====
  const tSort = {
    id: "t.sort",
    instruction: null,
    defaults: { kinds: 2, total: [5, 6], target: [2, 3] },
    levels: lv({ kinds: 2, total: [4, 6], target: [2, 3] }, { kinds: 2, total: [6, 8], target: [2, 4] }, { kinds: 3, total: [8, 10], target: [3, 4] }),
    generate(rng, p, ctx) {
      const kinds = rng.shuffle(ALL()).slice(0, p.kinds);
      const total = rng.int(p.total[0], p.total[1]);
      const nT = Math.min(total - (p.kinds - 1), rng.int(p.target[0], p.target[1]));
      const bag = [...Array(nT).fill(kinds[0])];
      while (bag.length < total) bag.push(kinds[1 + (bag.length % (p.kinds - 1))]);
      const order = rng.shuffle(bag);
      const cols = total > 6 ? 5 : total > 4 ? 3 : 2, rows = Math.ceil(total / cols);
      const CW = Math.min(32, (W - 8) / cols), RH = 28, items = [], pos = [];
      order.forEach((k, i) => {
        const r = Math.floor(i / cols), c = i % cols;
        const cx = (W - cols * CW) / 2 + c * CW + CW / 2 + (r % 2 ? 4 : -4), cy = 2 + r * RH + RH / 2;
        items.push(...pic(k, cx, cy, 17, `${i}`));
        pos.push([cx, cy, k]);
      });
      return made(p, ctx, {
        key: `tso:${order.join(",")}`,
        text: `${nameOf(kinds[0])}に ぜんぶ ○を つけましょう。`,
        h: rows * RH,
        items,
        ans: (c) => pos.filter((q) => q[2] === kinds[0]).map((q) => ring(q[0], q[1], 12, c, 1.1)),
        meta: { target: kinds[0], order }
      });
    },
    verify(pr) {
      const { target, order } = pr.meta;
      const n = order.filter((k) => k === target).length;
      return redRings(pr.answer.figure).length === n && n >= 1 && n < order.length ? null : "○の数が違う";
    }
  };

  // ===== おおきい・ちいさい(1もんに 1つの くらべ) =====
  const tBigger = {
    id: "t.bigger",
    instruction: null,
    defaults: { k: 2, sizes: [16, 38], small: false },
    levels: lv({ k: 2, sizes: [16, 38] }, { k: 2, sizes: [22, 36], small: true }, { k: 3, sizes: [14, 25, 38], small: true }),
    generate(rng, p, ctx) {
      const askSmall = p.small && rng.chance(0.4);
      const kind = rng.pick(ALL());
      const sizes = rng.shuffle(p.sizes.slice(0, p.k));
      const H = 46, xs = p.k === 3 ? [36, 88, 140] : [52, 124];
      const items = [];
      sizes.forEach((sz, j) => items.push(...pic(kind, xs[j], H / 2 + 1, sz, `0:${j}`)));
      const pick = sizes.indexOf(askSmall ? Math.min(...sizes) : Math.max(...sizes));
      return made(p, ctx, {
        key: `tb:${kind}:${sizes.join("-")}:${askSmall}`,
        text: p.k === 3 ? `いちばん ${askSmall ? "ちいさい" : "おおきい"} ものに ○を つけましょう。` : `${askSmall ? "ちいさい" : "おおきい"} ほうに ○を つけましょう。`,
        h: H,
        items,
        ans: (c) => [ring(xs[pick], H / 2 + 1, Math.max(10, sizes[pick] * 0.62), c, 1.1)],
        meta: { sizes, pick, askSmall }
      });
    },
    verify(pr) {
      const { sizes, pick, askSmall } = pr.meta;
      const want = sizes.indexOf(askSmall ? Math.min(...sizes) : Math.max(...sizes));
      if (want !== pick) return "○の場所が違う";
      return redRings(pr.answer.figure).length === 1 ? null : "○の数が違う";
    }
  };

  // ===== お金 =====
  // お金の絵(本物ににせない、かんたんな図):こうかは まるい形に 金がく、5円・50円は あな。おさつは 四角に 金がく。
  // こうかの大きさは本物と同じ(直径 1円20mm・5円22mm・10円23.5mm・50円21mm・100円22.6mm・500円26.5mm。印刷の倍率100%のとき)
  const COIN = {
    1: { r: 10, fill: "#f2f2f2" }, 5: { r: 11, fill: "#ecd98a", hole: true }, 10: { r: 11.75, fill: "#d9a874" },
    50: { r: 10.5, fill: "#e4e4e4", hole: true }, 100: { r: 11.3, fill: "#e4e4e4" }, 500: { r: 13.25, fill: "#ece3b8" }
  };
  const BILL = { 1000: "#eef3ea", 5000: "#f1ecf4", 10000: "#f4efe4" };
  // おさつは本物(はば 1000円150mm・5000円156mm・10000円160mm)の 1/3 くらいの大きさ。たて:よこ は絵に合わせる
  const BILL_SIZE = { 1000: [50, 25.4], 5000: [52, 25.5], 10000: [53.3, 25.5] };
  const isBill = (v) => v >= 1000;
  const sizeOf = (v, k = 1) => isBill(v) ? { w: BILL_SIZE[v][0] * k, h: BILL_SIZE[v][1] * k } : { w: COIN[v].r * 2 * k, h: COIN[v].r * 2 * k };
  const hasImg = (v) => typeof MONEY_IMG !== "undefined" && MONEY_IMG[v] && !/^\{\{/.test(MONEY_IMG[v]);
  function money(v, cx, cy, k = 1, tag = "") {
    if (isBill(v)) {
      const { w, h } = sizeOf(v, k), x = cx - w / 2, y = cy - h / 2;
      if (hasImg(v)) return [
        { t: "poly", pts: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], w: 0, fill: "none", lead: true, money: v, g: tag },
        { t: "image", href: MONEY_IMG[v], x, y, w, h }
      ];
      return [
        { t: "poly", pts: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], w: 0.6, fill: BILL[v], lead: true, money: v, g: tag },
        { t: "poly", pts: [[x + 1.6 * k, y + 1.6 * k], [x + w - 1.6 * k, y + 1.6 * k], [x + w - 1.6 * k, y + h - 1.6 * k], [x + 1.6 * k, y + h - 1.6 * k]], w: 0.3, fill: "none", lead: true },
        { t: "circle", cx: x + w - 8 * k, cy, r: 5 * k, w: 0.3, fill: "white", lead: true },
        txt(cx - 4 * k, cy + 2.6 * k, `${v}円`, 6.4 * k, { bold: true })
      ];
    }
    const c = COIN[v], r = c.r * k;
    // こうかの絵があるときは絵をつかう(まるは 位置と金がくを おぼえておくための 見えない わく)
    if (hasImg(v)) return [
      { t: "circle", cx, cy, r, w: 0, fill: "none", lead: true, money: v, g: tag },
      { t: "image", href: MONEY_IMG[v], x: cx - r, y: cy - r, w: r * 2, h: r * 2 }
    ];
    const out = [
      { t: "circle", cx, cy, r, w: 0.6, fill: c.fill, lead: true, money: v, g: tag },
      { t: "circle", cx, cy, r: r - 1.2 * k, w: 0.25, fill: "none", lead: true }
    ];
    if (c.hole) out.push({ t: "circle", cx, cy: cy + r * 0.42, r: r * 0.2, w: 0.3, fill: "white", lead: true });
    out.push(txt(cx, cy + (c.hole ? -r * 0.05 : r * 0.28), v, r * (String(v).length >= 3 ? 0.62 : 0.85), { bold: true }));
    return out;
  }
  // 答えを書く四角(右に「円」)
  const yenBox = (x, y, s = 13) => [
    { t: "poly", pts: [[x, y], [x + s * 1.9, y], [x + s * 1.9, y + s], [x, y + s]], w: 0.8, fill: "white", lead: true, ans: true },
    txt(x + s * 1.9 + 6, y + s * 0.78, "円", s * 0.62)
  ];
  const yenAns = (x, y, n, c, s = 13) => [txt(x + s * 0.95, y + s * 0.8, n, String(n).length >= 4 ? s * 0.5 : s * 0.66, { color: c, bold: true })];
  const redNums = (fig) => fig.items.filter((it) => it.t === "text" && it.color === RED).map((it) => it.s);
  // お金をならべる(しゅるいごとに まとめて、はばに入らないときは つぎの行へ)
  function layoutMoney(list, x0, x1, y0) {
    const items = [], pos = [];
    let x = x0, y = y0, rowH = 0;
    list.forEach((v, i) => {
      const k = list.length > 12 ? 0.85 : 1, { w, h } = sizeOf(v, k);
      if (x + w > x1) {
        x = x0;
        y += rowH + 3;
        rowH = 0;
      }
      if (i > 0 && list[i - 1] !== v && x > x0) x += 3;
      items.push(...money(v, x + w / 2, y + h / 2, k, String(i)));
      pos.push([x + w / 2, y + h / 2, Math.max(w, h) / 2 + 1.8, v]);
      x += w + 2;
      rowH = Math.max(rowH, h);
    });
    return { items, pos, h: y + rowH - y0 };
  }

  // いくらかな(お金 1まい)
  const tCoin = {
    id: "t.coin",
    instruction: null,
    defaults: { values: [1, 10, 100] },
    levels: lv({ values: [1, 10, 100] }, { values: [1, 5, 10, 50, 100, 500] }, { values: [1, 5, 10, 50, 100, 500, 1000, 5000, 10000] }),
    generate(rng, p, ctx) {
      const v = ctx && Number.isInteger(ctx.index) && rng.chance(0.7) ? p.values[ctx.index % p.values.length] : rng.pick(p.values);
      const H = 34, k = isBill(v) ? 1.35 : 1.2, items = [...money(v, 50, H / 2 + 1, k)];
      items.push(...yenBox(102, H / 2 - 6));
      return made(p, ctx, {
        key: `tc:${v}`,
        text: "いくらですか。",
        h: H,
        items,
        ans: (c) => yenAns(102, H / 2 - 6, v, c),
        meta: { v }
      });
    },
    verify(pr) {
      return redNums(pr.answer.figure).join() === String(pr.meta.v) ? null : "答えが合わない";
    }
  };

  // ぜんぶで いくら
  const tCoinSum = {
    id: "t.coinSum",
    instruction: null,
    defaults: { values: [1], kinds: [1, 1], maxEach: 5, maxTotal: 10 },
    levels: lv({ values: [1, 10], kinds: [1, 1], maxEach: 5, maxTotal: 50 }, { values: [1, 10], kinds: [2, 2], maxEach: 6, maxTotal: 99 }, { values: [1, 5, 10, 50, 100], kinds: [2, 3], maxEach: 4, maxTotal: 999 }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 5000; t++) {
        const nk = rng.int(p.kinds[0], Math.min(p.kinds[1], p.values.length));
        const vals = rng.shuffle(p.values.slice()).slice(0, nk).sort((a, b) => b - a);
        const counts = vals.map(() => rng.int(1, p.maxEach));
        const total = vals.reduce((a, v, i) => a + v * counts[i], 0);
        if (total > p.maxTotal || total < 2) continue;
        const list = vals.flatMap((v, i) => Array(counts[i]).fill(v));
        const lay = layoutMoney(list, 4, 118, 2);
        const H = Math.max(26, lay.h + 4), items = [...lay.items, ...yenBox(124, H / 2 - 6.5)];
        return made(p, ctx, {
          key: `tcs:${vals.join(",")}:${counts.join(",")}`,
          text: "ぜんぶで いくらですか。",
          h: H,
          items,
          ans: (c) => yenAns(124, H / 2 - 6.5, total, c),
          meta: { total }
        });
      }
      throw new Error("お金の問題が作れない(ぜんぶで いくら)");
    },
    verify(pr) {
      const sum = pr.figure.items.filter((it) => it.money).reduce((a, it) => a + it.money, 0);
      if (sum !== pr.meta.total) return "合計が合わない";
      return redNums(pr.answer.figure).join() === String(sum) ? null : "答えが合わない";
    }
  };

  // ちょうど ○円に なるように ○を つける(つかう お金の くみあわせが 1とおりに なる ものだけ)
  const tCoinPick = {
    id: "t.coinPick",
    instruction: null,
    defaults: { values: [1, 10], kinds: 2, maxEach: 5 },
    levels: lv({ values: [1, 10], kinds: 1, maxEach: 6 }, { values: [1, 10], kinds: 2, maxEach: 5 }, { values: [1, 5, 10, 50, 100], kinds: 3, maxEach: 4 }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 5000; t++) {
        const vals = rng.shuffle(p.values.slice()).slice(0, p.kinds).sort((a, b) => b - a);
        const have = vals.map(() => rng.int(2, p.maxEach));
        const use = have.map((h) => rng.int(0, h));
        if (use.every((u) => u === 0) || use.every((u, i) => u === have[i])) continue;
        const target = vals.reduce((a, v, i) => a + v * use[i], 0);
        // くみあわせの数をしらべる
        let ways = 0;
        const rec = (i, rest) => {
          if (ways > 1) return;
          if (i === vals.length) {
            if (rest === 0) ways++;
            return;
          }
          for (let n = 0; n <= have[i] && n * vals[i] <= rest; n++) rec(i + 1, rest - n * vals[i]);
        };
        rec(0, target);
        if (ways !== 1) continue;
        const list = vals.flatMap((v, i) => Array(have[i]).fill(v));
        const lay = layoutMoney(list, 6, W - 6, 2);
        const pickIdx = [];
        let off = 0;
        vals.forEach((v, i) => {
          for (let n = 0; n < use[i]; n++) pickIdx.push(off + n);
          off += have[i];
        });
        return made(p, ctx, {
          key: `tcp:${vals.join(",")}:${have.join(",")}:${target}`,
          text: `ちょうど ${target}{円|えん}に なるように、お{金|かね}に ○を つけましょう。`,
          h: lay.h + 4,
          items: lay.items,
          ans: (c) => pickIdx.map((i) => ring(lay.pos[i][0], lay.pos[i][1], lay.pos[i][2], c, 1)),
          meta: { target, pickIdx, list }
        });
      }
      throw new Error("お金の問題が作れない(ちょうど はらう)");
    },
    verify(pr) {
      const { target, list } = pr.meta;
      const rings = redRings(pr.answer.figure);
      const coins = pr.figure.items.filter((it) => it.money);
      let sum = 0;
      for (const r of rings) {
        const c = coins.find((it) => (it.cx !== void 0 ? Math.hypot(it.cx - r.cx, it.cy - r.cy) < 0.5 : Math.abs((it.pts[0][0] + it.pts[1][0]) / 2 - r.cx) < 0.5 && Math.abs((it.pts[0][1] + it.pts[2][1]) / 2 - r.cy) < 0.5));
        if (!c) return "○が お金に ついていない";
        sum += c.money;
      }
      return sum === target && coins.length === list.length ? null : "○の合計が合わない";
    }
  };

  // かいもの(おつり)。ねだんの ふだと はらう お金
  const GOODS = ["ノート", "えんぴつ", "けしゴム", "パン", "ジュース", "おにぎり", "クッキー", "はさみ", "のり", "ボールペン"];
  const tChange = {
    id: "t.change",
    instruction: null,
    defaults: { pay: [100], step: 10, two: false },
    levels: { basic: { pay: [100], step: 10, two: false }, normal: { pay: [500, 1000], step: 10, two: false }, challenge: { pay: [1000], step: 10, two: true } },
    generate(rng, p, ctx) {
      for (let t = 0; t < 5000; t++) {
        const pay = rng.pick(p.pay);
        const items = p.two ? rng.shuffle(GOODS).slice(0, 2) : [rng.pick(GOODS)];
        const prices = items.map(() => rng.int(1, Math.floor((pay * (p.two ? 0.45 : 0.95)) / p.step)) * p.step);
        const cost = prices.reduce((a, b) => a + b, 0);
        if (cost >= pay || cost < p.step * 2) continue;
        const change = pay - cost;
        const tag = (x, name, price) => [
          { t: "poly", pts: [[x, 4], [x + 44, 4], [x + 44, 26], [x, 26]], w: 0.6, fill: "white", lead: true },
          txt(x + 22, 13, name, 5),
          txt(x + 22, 22.5, `${price}円`, 6.4, { bold: true })
        ];
        const fig = [...items.flatMap((nm, i) => tag(6 + i * 50, nm, prices[i])), txt(6 + items.length * 50 + 6, 18, "→", 7), ...money(pay, 6 + items.length * 50 + 46, 15, pay >= 1000 ? 1 : 1.15)];
        const what = items.length === 2 ? `${items[0]}と ${items[1]}を かって` : `${items[0]}を かって`;
        const shiki = items.length === 2 ? `${pay}－(${prices[0]}＋${prices[1]})＝${change}` : `${pay}－${prices[0]}＝${change}`;
        return {
          key: `tch:${items.join(",")}:${prices.join(",")}:${pay}`,
          text: `${what}、${pay}{円|えん}を はらいました。おつりは いくらですか。`,
          figure: { type: "draw", w: W, h: 30, items: fig },
          answer: { display: `{式|しき} ${shiki}　{答|こた}え ${change}{円|えん}`, value: change },
          workspace: { type: "lines", labels: ["{式|しき}", "{答|こた}え"] },
          meta: { pay, prices, change }
        };
      }
      throw new Error("お金の問題が作れない(おつり)");
    },
    verify(pr) {
      const { pay, prices, change } = pr.meta;
      return pay - prices.reduce((a, b) => a + b, 0) === change && change > 0 ? null : "おつりが合わない";
    }
  };

  return [tAri, tSame, tSort, tBigger, tCoin, tCoinSum, tCoinPick, tChange];
})();

// ===== 特別支援学校(知的障害)の算数・数学の段階 =====
// 学習指導要領(平成29年告示)の段階と内容(A〜D)に合わせて、いまある学年の単元・小単元の問題をならべなおしたもの。
// key は GRADES に入れる番号(21〜27)。styleGrade は字の大きさ・漢字の範囲に使う学年。
// units の from は「単元id」(全部の小単元)か「単元id:番号」(その小単元だけ)。levels は ★ごとの数の範囲などのしぼりこみ。
var tokushiStages = [
  {
    key: 21, name: "小学部1段階", ruby: "{小学部|しょうがくぶ}1{段階|だんかい}", short: "1", part: "小学部", styleGrade: 1,
    note: "ものの有無、対応、3までの数(数唱は5まで)、形の区別、大きさ・長さの違い",
    units: [
      { name: "ものの ある・ない", domain: "A 数量の基礎", from: [["t.ari"]] },
      { name: "おなじ ものを むすぼう", domain: "A 数量の基礎", from: [["t.same"]] },
      { name: "なかまあつめ", domain: "A 数量の基礎", from: [["t.sort", { basic: { kinds: 2, total: [4, 5], target: [2, 2] }, normal: { kinds: 2, total: [4, 6], target: [2, 3] }, challenge: { kinds: 2, total: [6, 8], target: [2, 4] } }]] },
      { name: "3までの かず", domain: "B 数と計算", from: [["y-01", { basic: { min: 1, max: 3 }, normal: { min: 1, max: 3, scatter: true }, challenge: { min: 1, max: 5 } }]] },
      { name: "どちらが おおい", domain: "B 数と計算", from: [["y-04", { basic: { max: 4, minDiff: 2 }, normal: { max: 5, minDiff: 2 }, challenge: { max: 5, minDiff: 1 } }]] },
      { name: "おなじ かたちを みつけよう", domain: "C 図形", from: [["y-12", { basic: { kinds: 2, total: [4, 6] }, normal: { kinds: 2, total: [5, 8] }, challenge: { kinds: 3, total: [6, 9] } }]] },
      { name: "おおきい・ちいさい", domain: "D 測定", from: [["t.bigger"]] },
      { name: "ながい・みじかい", domain: "D 測定", from: [["y-13", { basic: { k: 2 }, normal: { k: 2 }, challenge: { k: 3, short: true } }]] }
    ]
  },
  {
    key: 22, name: "小学部2段階", ruby: "{小学部|しょうがくぶ}2{段階|だんかい}", short: "2", part: "小学部", styleGrade: 1,
    note: "10までの数(数え方・読み書き・順序・0・合成と分解)、○△□、長さ・重さなどの比べ方、分類と絵グラフ",
    units: [
      { name: "10までの かず", domain: "A 数と計算", from: [["y-01"], ["y-03"]] },
      { name: "すうじを かこう", domain: "A 数と計算", from: [["y-02b"]], unitProps: { per: 10, starts: [1], defaultCount: 1 } },
      { name: "かずの じゅんばん", domain: "A 数と計算", from: [["y-05", { basic: { len: 5, lo: 1, hi: 7, blanks: [1, 2] }, normal: { len: 5, lo: 0, hi: 10, blanks: [1, 2] }, challenge: { len: 6, lo: 0, hi: 10, blanks: [2, 3], down: true } }], ["g1-01:4"]] },
      { name: "どちらが おおい", domain: "A 数と計算", from: [["y-04"], ["g1-01:2"], ["g1-01:5"]] },
      { name: "いくつと いくつ", domain: "A 数と計算", from: [["y-09"], ["g1-01:3"]] },
      { name: "お金", domain: "A 数と計算", from: [["t.coin", { basic: { values: [1, 10] }, normal: { values: [1, 10, 100] }, challenge: { values: [1, 5, 10] } }, "いくらかな"], ["t.coinSum", { basic: { values: [1], kinds: [1, 1], maxEach: 5, maxTotal: 5 }, normal: { values: [1], kinds: [1, 1], maxEach: 10, maxTotal: 10 }, challenge: { values: [1, 5], kinds: [1, 2], maxEach: 5, maxTotal: 10 } }, "ぜんぶで いくら"]] },
      { name: "かたちの なかま", domain: "B 図形", from: [["y-12"], ["g1-12:1"]] },
      { name: "ながさ・かさ・ひろさくらべ", domain: "C 測定", from: [["y-13"], ["g1-05:1"], ["g1-10:1"], ["g1-15:1"]] },
      { name: "なかまわけと えグラフ", domain: "D データの活用", from: [["t.sort"], ["g1-06"]] }
    ]
  },
  {
    key: 23, name: "小学部3段階", ruby: "{小学部|しょうがくぶ}3{段階|だんかい}", short: "3", part: "小学部", styleGrade: 1,
    note: "100までの数、20までのたし算・ひき算、身の回りの形と位置、長さ・広さ・かさ、時刻、絵や図での整理",
    units: [
      { name: "20までの かず", domain: "A 数と計算", from: [["g1-07"]] },
      { name: "100までの かず", domain: "A 数と計算", from: [["g1-14"]] },
      { name: "たしざん(10まで)", domain: "A 数と計算", from: [["g1-03"]] },
      { name: "ひきざん(10まで)", domain: "A 数と計算", from: [["g1-04"]] },
      { name: "3つの かずの けいさん", domain: "A 数と計算", from: [["g1-09"]] },
      { name: "くりあがりの ある たしざん", domain: "A 数と計算", from: [["g1-11"]] },
      { name: "くりさがりの ある ひきざん", domain: "A 数と計算", from: [["g1-13"]] },
      { name: "お金", domain: "A 数と計算", from: [["t.coin", { basic: { values: [1, 10, 100] }, normal: { values: [1, 5, 10, 50, 100] }, challenge: { values: [1, 5, 10, 50, 100, 500] } }, "いくらかな"], ["t.coinSum", { basic: { values: [10], kinds: [1, 1], maxEach: 9, maxTotal: 90 }, normal: { values: [1, 10], kinds: [2, 2], maxEach: 6, maxTotal: 99 }, challenge: { values: [1, 5, 10, 50], kinds: [2, 3], maxEach: 4, maxTotal: 100 } }, "ぜんぶで いくら"], ["t.coinPick", { basic: { values: [10], kinds: 1, maxEach: 6 }, normal: { values: [1, 10], kinds: 2, maxEach: 5 }, challenge: { values: [1, 5, 10], kinds: 2, maxEach: 4 } }, "ちょうど はらおう"]] },
      { name: "まえ・うしろ・うえ・した", domain: "B 図形", from: [["g1-02"], ["y-08"]] },
      { name: "かたちあそび・かたちづくり", domain: "B 図形", from: [["g1-12"], ["g1-18"]] },
      { name: "ながさ・かさ・ひろさ", domain: "C 測定", from: [["g1-05"], ["g1-10"], ["g1-15"]] },
      { name: "とけい", domain: "C 測定", from: [["g1-08"], ["g1-16"]] },
      { name: "えグラフ", domain: "D データの活用", from: [["g1-06"]] }
    ]
  },
  {
    key: 24, name: "中学部1段階", ruby: "{中学部|ちゅうがくぶ}1{段階|だんかい}", short: "1", part: "中学部", styleGrade: 3,
    note: "3位数までの数、2位数のたし算・ひき算と筆算、かけ算(九九)、三角形・四角形と箱の形、長さ・かさ・重さ、時刻と時間、表とグラフ",
    units: [
      { name: "3けたの数", domain: "A 数と計算", from: [["g2-05"]] },
      { name: "たし算の筆算", domain: "A 数と計算", from: [["g2-02"]] },
      { name: "ひき算の筆算", domain: "A 数と計算", from: [["g2-03"]] },
      { name: "たし算とひき算の筆算(3けた)", domain: "A 数と計算", from: [["g2-09"]] },
      { name: "かけ算(九九)", domain: "A 数と計算", from: [["g2-11"], ["g2-12"]] },
      { name: "お金と かいもの", domain: "A 数と計算", from: [["t.coinSum", { basic: { values: [10, 100], kinds: [2, 2], maxEach: 5, maxTotal: 999 }, normal: { values: [1, 10, 50, 100], kinds: [2, 3], maxEach: 4, maxTotal: 999 }, challenge: { values: [1, 5, 10, 50, 100, 500], kinds: [3, 4], maxEach: 3, maxTotal: 999 } }, "ぜんぶで いくら"], ["t.coinPick", { basic: { values: [10, 100], kinds: 2, maxEach: 5 }, normal: { values: [1, 10, 100], kinds: 3, maxEach: 4 }, challenge: { values: [1, 5, 10, 50, 100], kinds: 3, maxEach: 4 } }, "ちょうど はらおう"], ["t.change", null, { label: "おつり", kinds: ["word", "test"] }]] },
      { name: "三角形と四角形", domain: "B 図形", from: [["g2-10"]] },
      { name: "はこの形", domain: "B 図形", from: [["g2-17"]] },
      { name: "長さ", domain: "C 測定", from: [["g2-04"], ["g2-14"]] },
      { name: "かさ", domain: "C 測定", from: [["g2-06"]] },
      { name: "重さ", domain: "C 測定", from: [["g3-14"]] },
      { name: "時こくと時間", domain: "C 測定", from: [["g2-07"], ["g3-02"]] },
      { name: "表とグラフ", domain: "D データの活用", from: [["g2-01"], ["g3-06"]] }
    ]
  },
  {
    key: 25, name: "中学部2段階", ruby: "{中学部|ちゅうがくぶ}2{段階|だんかい}", short: "2", part: "中学部", styleGrade: 4,
    note: "4位数までの数、3・4位数のたし算・ひき算、かけ算のきまり、わり算とあまり、小数・分数のはじめ、□を使った式、三角形・角・円、面積、変わり方、棒グラフ・折れ線グラフ",
    units: [
      { name: "4けたの数・大きい数", domain: "A 数と計算", from: [["g2-13"], ["g3-09"]] },
      { name: "たし算とひき算の筆算", domain: "A 数と計算", from: [["g3-04"]] },
      { name: "かけ算のきまり", domain: "A 数と計算", from: [["g3-01"]] },
      { name: "わり算", domain: "A 数と計算", from: [["g3-03"], ["g3-08"]] },
      { name: "小数", domain: "A 数と計算", from: [["g3-13"]] },
      { name: "分数", domain: "A 数と計算", from: [["g2-16"], ["g3-15"]] },
      { name: "□を使った式", domain: "A 数と計算", from: [["g3-16"]] },
      { name: "かいもの", domain: "A 数と計算", from: [["t.coinSum", { basic: { values: [10, 100, 1000], kinds: [2, 3], maxEach: 4, maxTotal: 9999 }, normal: { values: [10, 50, 100, 500, 1000], kinds: [3, 4], maxEach: 3, maxTotal: 9999 }, challenge: { values: [1, 10, 100, 500, 1000, 5000], kinds: [3, 4], maxEach: 3, maxTotal: 9999 } }, "ぜんぶで いくら"], ["t.change", { basic: { pay: [500, 1000] }, normal: { pay: [1000], two: true }, challenge: { pay: [1000, 5000], two: true } }, { label: "おつり", kinds: ["word", "test"] }]] },
      { name: "三角形と角", domain: "B 図形", from: [["g3-18"], ["g4-04"]] },
      { name: "円と球", domain: "B 図形", from: [["g3-12"]] },
      { name: "垂直・平行と四角形", domain: "B 図形", from: [["g4-09"]] },
      { name: "面積", domain: "B 図形", from: [["g4-12"]] },
      { name: "変わり方", domain: "C 変化と関係", from: [["g4-11"], ["g4-06b"]] },
      { name: "棒グラフと折れ線グラフ", domain: "D データの活用", from: [["g3-06"], ["g4-02"]] }
    ]
  },
  {
    key: 26, name: "高等部1段階", ruby: "{高等部|こうとうぶ}1{段階|だんかい}", short: "1", part: "高等部", styleGrade: 5,
    note: "整数のかけ算・わり算、小数・分数の計算、概数、合同・多角形・面積、比例、単位量あたり、百分率、帯グラフ・円グラフ、平均",
    units: [
      { name: "わり算の筆算", domain: "A 数と計算", from: [["g4-03"], ["g4-06"]] },
      { name: "小数のしくみと計算", domain: "A 数と計算", from: [["g4-05"], ["g4-13"]] },
      { name: "小数のかけ算・わり算", domain: "A 数と計算", from: [["g5-04"], ["g5-05"]] },
      { name: "分数のたし算・ひき算", domain: "A 数と計算", from: [["g4-10"], ["g5-10"]] },
      { name: "がい数", domain: "A 数と計算", from: [["g4-07"]] },
      { name: "計算のきまり", domain: "A 数と計算", from: [["g4-08"]] },
      { name: "合同な図形", domain: "B 図形", from: [["g5-06"]] },
      { name: "図形の角", domain: "B 図形", from: [["g5-07"]] },
      { name: "面積", domain: "B 図形", from: [["g5-13"]] },
      { name: "比例", domain: "C 変化と関係", from: [["g5-03"]] },
      { name: "単位量あたりの大きさ", domain: "C 変化と関係", from: [["g5-12"]] },
      { name: "割合", domain: "C 変化と関係", from: [["g5-14"]] },
      { name: "帯グラフと円グラフ", domain: "D データの活用", from: [["g5-15"]] },
      { name: "平均", domain: "D データの活用", from: [["g5-11"]] }
    ]
  },
  {
    key: 27, name: "高等部2段階", ruby: "{高等部|こうとうぶ}2{段階|だんかい}", short: "2", part: "高等部", styleGrade: 6,
    note: "整数の性質、分数の計算、文字を使った式、拡大図と縮図、円の面積、体積、比例と反比例、比、データの分布",
    units: [
      { name: "倍数と約数", domain: "A 数と計算", from: [["g5-08"]] },
      { name: "分数と小数", domain: "A 数と計算", from: [["g5-09"]] },
      { name: "分数のかけ算・わり算", domain: "A 数と計算", from: [["g6-03"], ["g6-04"]] },
      { name: "文字と式", domain: "A 数と計算", from: [["g6-02"]] },
      { name: "拡大図と縮図", domain: "B 図形", from: [["g6-06"]] },
      { name: "円の面積", domain: "B 図形", from: [["g6-08"]] },
      { name: "体積", domain: "B 図形", from: [["g5-02"], ["g6-09"]] },
      { name: "比例と反比例", domain: "C 変化と関係", from: [["g6-11"]] },
      { name: "比", domain: "C 変化と関係", from: [["g6-05"]] },
      { name: "データの調べ方", domain: "D データの活用", from: [["g6-07"]] }
    ]
  }
];
