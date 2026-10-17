
  // ===== 12 かたちを みつけよう =====
  function shapeItem(kind, cx, cy, r, rot, tag) {
    const o = { w: 0.8, fill: "white", lead: true, g: tag, kind };
    const poly = (k, phase) => ({ t: "poly", pts: Array.from({ length: k }, (_, i) => {
      const a = phase + rot + i * 2 * Math.PI / k;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    }), ...o });
    if (kind === "circle") return { t: "circle", cx, cy, r: r * 0.85, ...o };
    if (kind === "tri") return poly(3, -Math.PI / 2);
    if (kind === "square") return poly(4, Math.PI / 4);
    if (kind === "diamond") return { ...poly(4, 0), pts: poly(4, -Math.PI / 2).pts.map(([x, y]) => [cx + (x - cx) * 0.7, y]) };
    return null;
  }
  const SHAPE_KIND = { circle: "まる(○)", tri: "さんかく(△)", square: "しかく(□)", diamond: "ひしがた(◇)" };
  const yShape = {
    id: "y.shape",
    instruction: null,
    defaults: { kinds: 2, total: [6, 8], rot: false },
    levels: lv({ kinds: 2, total: [5, 8] }, { kinds: 3, total: [8, 12] }, { kinds: 4, total: [11, 15], rot: true }),
    generate(rng, p, ctx) {
      const kinds = rng.shuffle(Object.keys(SHAPE_KIND)).slice(0, p.kinds);
      const total = rng.int(p.total[0], p.total[1]);
      const target = kinds[0];
      const list = rng.shuffle([...kinds, ...Array.from({ length: total - kinds.length }, () => rng.pick(kinds))]);
      const n = list.filter((k) => k === target).length;
      const PW = 120, PH = 62, items = [panel(1, 1, PW, PH)];
      const placed = [];
      list.forEach((k, i) => {
        for (let t = 0; t < 400; t++) {
          const r = p.rot ? rng.int(5, 9) : rng.int(6, 8), cx = rng.int(4 + r, PW - 2 - r), cy = rng.int(4 + r, PH - 2 - r);
          if (placed.some((q) => Math.hypot(q[0] - cx, q[1] - cy) < q[2] + r + 2.5)) continue;
          placed.push([cx, cy, r]);
          items.push(shapeItem(k, cx, cy, r, p.rot ? rng.next() * Math.PI : 0, i));
          return;
        }
      });
      if (placed.length !== list.length) return this.generate(rng, p, ctx);
      const bs = 24, bx = PW + 12, by = PH / 2 - bs / 2;
      items.push(box(bx, by, bs), txt(bx + bs + 3, by + bs * 0.75, "こ", 8, { anchor: "start" }));
      return made(rng, p, ctx, {
        key: `ysh:${list.join(",")}:${placed.map((q) => q.join(".")).join(",")}`,
        softKey: target,
        text: `${SHAPE_KIND[target]}は いくつ ありますか。`,
        w: W, h: PH + 3, items,
        ans: (c) => [numIn(bx, by, bs, n, c)],
        meta: { target, n }
      });
    },
    verify(pr) {
      const { target, n } = pr.meta;
      if (tagsOf(pr.figure.items, target).size !== n) return "形の数が違う";
      return redNums(pr.answer.figure).join() === String(n) ? null : "答えが合わない";
    }
  };

  // ===== 13 ながさくらべ =====
  function pencil(x, y, len, h) {
    return [
      { t: "poly", pts: [[x, y], [x + len - 9, y], [x + len, y + h / 2], [x + len - 9, y + h], [x, y + h]], w: 0.7, fill: "white", lead: true },
      { t: "line", x1: x + len - 9, y1: y, x2: x + len - 9, y2: y + h, w: 0.5, lead: true },
      { t: "poly", pts: [[x + len - 3.2, y + h / 2 - 1.3], [x + len, y + h / 2], [x + len - 3.2, y + h / 2 + 1.3]], w: 0, fill: "black", lead: true },
      { t: "poly", pts: [[x, y], [x + 5, y], [x + 5, y + h], [x, y + h]], w: 0.5, fill: "gray", lead: true }
    ];
  }
  const yLength = {
    id: "y.length",
    instruction: null,
    defaults: { k: 2, grid: false },
    levels: lv({ k: 2 }, { k: 3, short: true }, { k: 3, grid: true, short: true }),
    generate(rng, p, ctx) {
      const items = [], CELL = 10;
      const askShort = p.short && rng.chance(0.4);
      let lens;
      do lens = Array.from({ length: p.k }, () => rng.int(p.grid ? 4 : 5, p.grid ? 11 : 12));
      while (new Set(lens).size !== p.k || (p.grid ? false : Math.max(...lens) - Math.min(...lens) < 2));
      const starts = p.grid ? lens.map((l) => rng.int(0, 13 - l)) : lens.map(() => 0);
      const X0 = 26, RH = 17, boxes = [];
      if (p.grid) for (let r = 0; r <= p.k * 1; r++) {
        // ます目
        for (let c = 0; c <= 13; c++) items.push({ t: "line", x1: X0 + c * CELL, y1: 2, x2: X0 + c * CELL, y2: 2 + p.k * RH, w: 0.2, color: "#999", lead: true });
        break;
      }
      if (p.grid) for (let r = 0; r <= p.k; r++) items.push({ t: "line", x1: X0, y1: 2 + r * RH, x2: X0 + 13 * CELL, y2: 2 + r * RH, w: 0.2, color: "#999", lead: true });
      lens.forEach((l, i) => {
        const y = 2 + i * RH + 3.5;
        items.push(box(4, y - 1, 13));
        boxes.push([10.5, y + 5.5]);
        if (p.grid) items.push({ ...rect(X0 + starts[i] * CELL, y, l * CELL, 10, { fill: "light", w: 0.8 }), len: l });
        else items.push(...pencil(X0, y, l * CELL, 10).map((it, j) => j === 0 ? { ...it, len: l } : it));
      });
      const pick = askShort ? lens.indexOf(Math.min(...lens)) : lens.indexOf(Math.max(...lens));
      const what = p.grid ? "テープ" : "えんぴつ";
      return made(rng, p, ctx, {
        key: `yl:${lens.join(",")}:${starts.join(",")}:${askShort}`,
        text: p.k === 2 ? `ながい ほうに ○を つけましょう。` : `いちばん ${askShort ? "みじかい" : "ながい"} ものに ○を つけましょう。`,
        w: W, h: p.k * RH + 4, items,
        ans: (c) => [ring(boxes[pick][0], boxes[pick][1], 5.4, c, 1.1)],
        meta: { lens, askShort, pick }
      });
    },
    verify(pr) {
      const { lens, askShort } = pr.meta;
      const read = pr.figure.items.filter((it) => it.len !== void 0).map((it) => Math.round((Math.max(...it.pts.map((q) => q[0])) - Math.min(...it.pts.map((q) => q[0]))) / 10));
      if (read.join() !== lens.join()) return "長さが違う";
      const want = askShort ? read.indexOf(Math.min(...read)) : read.indexOf(Math.max(...read));
      const r = redRings(pr.answer.figure)[0];
      const row = Math.round((r.cy - 2 - 3.5 - 5.5) / 17);
      return row === want ? null : "○の場所が違う";
    }
  };

  // ===== 14 とけい(なんじ・なんじはん) =====
  function clock(cx, cy, R, h, m) {
    const items = [{ t: "circle", cx, cy, r: R, w: 1, fill: "white", lead: true }];
    for (let i = 0; i < 60; i++) {
      const a = i * Math.PI / 30, big = i % 5 === 0;
      items.push({ t: "line", x1: cx + (R - (big ? 3 : 1.4)) * Math.sin(a), y1: cy - (R - (big ? 3 : 1.4)) * Math.cos(a), x2: cx + R * Math.sin(a), y2: cy - R * Math.cos(a), w: big ? 0.6 : 0.25, lead: true });
    }
    for (let k = 1; k <= 12; k++) {
      const a = k * Math.PI / 6;
      items.push(txt(cx + (R - 7) * Math.sin(a), cy - (R - 7) * Math.cos(a) + 2, k, 5.4));
    }
    const ha = (h % 12 + m / 60) * Math.PI / 6, ma = m * Math.PI / 30;
    items.push({ t: "line", x1: cx, y1: cy, x2: cx + R * 0.5 * Math.sin(ha), y2: cy - R * 0.5 * Math.cos(ha), w: 2.2, lead: true, cap: "round", hand: "h" });
    items.push({ t: "line", x1: cx, y1: cy, x2: cx + R * 0.8 * Math.sin(ma), y2: cy - R * 0.8 * Math.cos(ma), w: 1.2, lead: true, cap: "round", hand: "m" });
    items.push({ t: "circle", cx, cy, r: 1.3, w: 0, fill: "black", lead: true });
    return items;
  }
  const yClock = {
    id: "y.clock",
    instruction: null,
    defaults: { k: 2, half: false },
    levels: lv({ k: 2 }, { k: 3 }, { k: 3, half: true }),
    generate(rng, p, ctx) {
      const hs = rng.shuffle(Array.from({ length: 12 }, (_, i) => i + 1)).slice(0, p.k);
      const ms = hs.map(() => p.half && rng.chance(0.5) ? 30 : 0);
      const R = 23, colW = W / p.k, items = [], boxes = [];
      hs.forEach((h, i) => {
        const cx = colW * i + colW / 2;
        items.push(...clock(cx, R + 2, R, h, ms[i]));
        const bs = 16, bx = cx - (ms[i] ? 20 : 12), by = 2 * R + 7;
        items.push(box(bx, by, bs), txt(bx + bs + 2.5, by + bs * 0.75, ms[i] ? "じはん" : "じ", 7, { anchor: "start" }));
        boxes.push([bx, by, bs]);
      });
      return made(rng, p, ctx, {
        key: `yk:${hs.join(",")}:${ms.join(",")}`,
        text: "なんじ ですか。",
        w: W, h: 2 * R + 27, items,
        ans: (c) => hs.map((h, i) => numIn(boxes[i][0], boxes[i][1], boxes[i][2], h, c)),
        meta: { hs, ms }
      });
    },
    verify(pr) {
      const { hs, ms } = pr.meta;
      const hands = pr.figure.items.filter((it) => it.hand);
      for (let i = 0; i < hs.length; i++) {
        const [hh, mm] = [hands[2 * i], hands[2 * i + 1]];
        const ang = (l) => (Math.atan2(l.x2 - l.x1, -(l.y2 - l.y1)) + 2 * Math.PI) % (2 * Math.PI);
        const m = Math.round(ang(mm) / (2 * Math.PI) * 60) % 60, hourF = ang(hh) / (2 * Math.PI) * 12;
        if (m !== ms[i]) return "長いはりが違う";
        const h = Math.floor(hourF + 0.01) || 12;
        if (h !== hs[i]) return "短いはりが違う";
      }
      return redNums(pr.answer.figure).join() === hs.join() ? null : "答えが合わない";
    }
  };

  return [yCount, yTrace, yTrace10, yMatch, yCompare, ySeq, yDots, yOrdinal, yPosition, yCompose, yAdd, ySub, yShape, yLength, yClock];
})();
var yojiGrade = {
  grade: 0,
  note: "幼児向け(3〜6さい)。すらぷり・ちびむすドリルを参考に、絵と字を大きく、1まいの問題を少なくしたもの。",
  units: [
    ["y-01", "かずを かぞえよう", "かず", "y.count"],
    ["y-02", "すうじを かこう（3こ）", "かず", "y.trace"],
    ["y-02b", "すうじを かこう（10こ）", "かず", "y.trace10"],
    ["y-03", "おなじ かずを むすぼう", "かず", "y.match"],
    ["y-04", "どちらが おおい", "くらべる", "y.compare"],
    ["y-05", "かずの じゅんばん", "かず", "y.seq"],
    ["y-06", "てんつなぎ", "かず", "y.dots"],
    ["y-07", "なんばんめ", "かず", "y.ordinal"],
    ["y-08", "うえ・した・みぎ・ひだり", "いち", "y.position"],
    ["y-09", "いくつと いくつ", "けいさんの じゅんび", "y.compose"],
    ["y-10", "あわせて いくつ", "けいさんの じゅんび", "y.add"],
    ["y-11", "のこりは いくつ", "けいさんの じゅんび", "y.sub"],
    ["y-12", "かたちを みつけよう", "かたち", "y.shape"],
    ["y-13", "ながさくらべ", "くらべる", "y.length"],
    ["y-14", "とけい なんじ", "とけい", "y.clock"]
  ].map(([id, name, domain, gen], i) => ({ id, order: i + 1, name, domain, topics: [{ label: name, generator: gen, kinds: ["yoji"] }], ...gen === "y.trace" ? { per: 3, starts: Array.from({ length: 100 }, (_, i) => i + 1), defaultCount: 1 } : gen === "y.trace10" ? { per: 10, starts: Array.from({ length: 10 }, (_, i) => i * 10 + 1), defaultCount: 1 } : gen === "y.seq" ? { starts: ["", ...Array.from({ length: 95 }, (_, i) => i + 1)] } : {} }))
};
