
  // ===== 6 てんつなぎ =====
  // 形は 0〜100 の座標(上が 0)。点が足りないときは長い辺のまん中に点を足す
  const SHAPES = {
    house: [[50, 6], [92, 44], [80, 44], [80, 94], [20, 94], [20, 44], [8, 44]],
    star: Array.from({ length: 10 }, (_, i) => {
      const a = i * Math.PI / 5, r = i % 2 ? 20 : 48;
      return [50 + r * Math.sin(a), 54 - r * Math.cos(a)];
    }),
    fish: [[8, 50], [30, 26], [62, 22], [80, 40], [96, 24], [92, 50], [96, 76], [80, 60], [62, 78], [30, 74]],
    heart: Array.from({ length: 16 }, (_, i) => {
      const t = i / 16 * 2 * Math.PI;
      return [50 + 2.75 * 16 * Math.sin(t) ** 3, 46 - 2.75 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))];
    }),
    tree: [[50, 4], [74, 32], [62, 32], [84, 58], [70, 58], [92, 82], [56, 82], [56, 96], [44, 96], [44, 82], [8, 82], [30, 58], [16, 58], [38, 32], [26, 32]],
    boat: [[50, 6], [50, 62], [92, 62], [78, 88], [22, 88], [8, 62], [44, 62], [44, 18]],
    rocket: [[50, 2], [66, 26], [66, 66], [82, 84], [62, 80], [58, 92], [42, 92], [38, 80], [18, 84], [34, 66], [34, 26]],
    crown: [[8, 86], [8, 30], [28, 56], [50, 18], [72, 56], [92, 30], [92, 86]],
    diamond: [[50, 6], [90, 50], [50, 94], [10, 50]],
    kite: [[50, 4], [86, 40], [50, 96], [14, 40]],
    tulip: [[30, 20], [40, 36], [50, 14], [60, 36], [70, 20], [72, 50], [54, 66], [54, 94], [46, 94], [46, 66], [28, 50]],
    cup: [[14, 18], [86, 18], [78, 70], [62, 70], [62, 86], [76, 94], [24, 94], [38, 86], [38, 70], [22, 70]]
  };
  const SHAPE_NAME = { house: "いえ", star: "ほし", fish: "さかな", heart: "ハート", tree: "き", boat: "ヨット", rocket: "ロケット", crown: "おうかん", diamond: "ひしがた", kite: "たこ", tulip: "チューリップ", cup: "トロフィー" };
  function withPoints(pts, n) {
    const out = pts.map((q) => q.slice());
    while (out.length < n) {
      let best = 0, bl = -1;
      for (let i = 0; i < out.length; i++) {
        const a = out[i], b = out[(i + 1) % out.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (l > bl) {
          bl = l;
          best = i;
        }
      }
      const a = out[best], b = out[(best + 1) % out.length];
      out.splice(best + 1, 0, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
    }
    return out;
  }
  const yDots = {
    id: "y.dots",
    instruction: null,
    defaults: { shapes: ["house", "diamond", "kite", "crown"], max: 8 },
    levels: {
      basic: { shapes: ["house", "diamond", "kite", "crown", "boat"], max: 8, example: false },
      normal: { shapes: ["star", "fish", "boat", "crown", "house", "tulip"], max: 12, example: false },
      challenge: { shapes: ["star", "fish", "heart", "tree", "rocket", "tulip", "boat"], max: 20, example: false }
    },
    generate(rng, p, ctx) {
      const name = rng.pick(p.shapes), base = SHAPES[name];
      if (base.length > p.max) return this.generate(rng, { ...p, shapes: p.shapes.filter((s) => SHAPES[s].length <= p.max) }, ctx);
      const n = Math.min(p.max, Math.max(base.length, rng.int(Math.max(base.length, p.max - 3), p.max)));
      const pts = withPoints(base, n);
      // 1ばんの点をずらして始まりを変える
      const off = rng.int(0, n - 1), seq = pts.slice(off).concat(pts.slice(0, off));
      const SZ = 88, X0 = (W - SZ) / 2, Y0 = 9;
      const P = seq.map(([x, y]) => [X0 + x / 100 * SZ, Y0 + y / 100 * SZ]);
      const cx = P.reduce((a, q) => a + q[0], 0) / n, cy = P.reduce((a, q) => a + q[1], 0) / n;
      const items = [];
      P.forEach(([x, y], i) => {
        const dx = x - cx, dy = y - cy, l = Math.hypot(dx, dy) || 1;
        items.push({ t: "dot", x, y, r: 1.3, num: i + 1 });
        items.push(txt(x + dx / l * 5, y + dy / l * 5 + 1.6, i + 1, i === 0 ? 5.4 : 4.6, { halo: true, bold: i === 0 }));
      });
      // 1ばんは目立たせる
      items.push(ring(P[0][0], P[0][1], 2.6, INK, 0.5));
      const l0 = Math.hypot(P[0][0] - cx, P[0][1] - cy) || 1;
      items.push(txt(P[0][0] + (P[0][0] - cx) / l0 * 11, P[0][1] + (P[0][1] - cy) / l0 * 11 + 5.5, "スタート", 3.4, { color: "#555", halo: true }));
      return made(rng, p, ctx, {
        key: `yd:${name}:${n}:${off}`,
        softKey: name,
        text: "1から じゅんに せんで つなぎましょう。",
        w: W, h: SZ + 22, items,
        ans: (c) => P.map((q, i) => ({ t: "line", x1: q[0], y1: q[1], x2: P[(i + 1) % n][0], y2: P[(i + 1) % n][1], w: 0.9, color: c, lead: true, cap: "round" })).concat([txt(X0 + SZ, Y0 + SZ + 4, SHAPE_NAME[name], 5, { anchor: "end", color: c })]),
        meta: { name, n }
      });
    },
    verify(pr, p) {
      const dots = pr.figure.items.filter((it) => it.t === "dot");
      if (dots.length !== pr.meta.n || pr.meta.n > p.max) return "点の数が違う";
      if (dots.some((d, i) => d.num !== i + 1)) return "番号がとんでいる";
      for (let i = 0; i < dots.length; i++) for (let j = 0; j < i; j++) if (Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y) < 4) return "点が近すぎる";
      const lines = pr.answer.figure.items.filter((it) => it.t === "line" && it.color === RED);
      if (lines.length !== dots.length) return "線の数が違う";
      return null;
    }
  };

  // ===== 7 なんばんめ =====
  const yOrdinal = {
    id: "y.ordinal",
    instruction: null,
    defaults: { n: 5, back: false, group: false },
    levels: lv({ n: 5 }, { n: 7, back: true }, { n: 8, back: true, group: true }),
    generate(rng, p, ctx) {
      const animals = Array.from({ length: p.n }, () => rng.pick(ANIMALS));
      const fromBack = p.back && rng.chance(0.4);
      const group = p.group && rng.chance(0.5);
      const k = rng.int(group ? 2 : 1, group ? p.n - 2 : p.n);
      const S = 16, P = 19.5, X0 = 30, CY = 15;
      const items = [];
      items.push({ t: "path", d: `M4 ${CY}L14 ${CY - 6}L14 ${CY - 2.5}L24 ${CY - 2.5}L24 ${CY + 2.5}L14 ${CY + 2.5}L14 ${CY + 6}Z`, w: 0.5, fill: "light", lead: true });
      items.push(txt(14, CY + 13, "まえ", 4.6, { bold: true }));
      const xs = animals.map((_, i) => X0 + P / 2 + i * P);
      animals.forEach((a, i) => items.push(...pic(a, xs[i], CY, S, i)));
      items.push(txt(xs[p.n - 1], CY + 13, "うしろ", 4.2));
      const idx = fromBack ? p.n - k : k - 1;
      const from = fromBack ? "うしろ" : "まえ";
      const text = group ? `${from}から ${k}ひきを ○で かこみましょう。` : `${from}から ${k}ばんめの どうぶつに ○を つけましょう。`;
      const ans = (c) => {
        if (!group) return [ring(xs[idx], CY, 10, c, 1.1)];
        const a = fromBack ? p.n - k : 0, b = fromBack ? p.n - 1 : k - 1;
        return [{ ...frame(xs[a] - P / 2 + 0.5, CY - 10.5, (b - a + 1) * P - 1, 21, 8), w: 1.1, color: c, span: [xs[a] - P / 2 + 0.5, xs[b] + P / 2 - 0.5] }];
      };
      return made(rng, p, ctx, {
        key: `yo:${animals.join(",")}:${k}:${fromBack}:${group}`,
        text, w: W, h: CY + 17, items, ans,
        meta: { n: p.n, k, fromBack, group, xs }
      });
    },
    verify(pr) {
      const { n, k, fromBack, group, xs } = pr.meta;
      if (tagsOf(pr.figure.items).size !== n) return "どうぶつの数が違う";
      if (group) {
        const f = pr.answer.figure.items.find((it) => it.color === RED);
        const [x0, x1] = f.span;
        const cnt = xs.filter((x) => x > x0 && x < x1).length;
        if (cnt !== k) return "かこんだ数が違う";
        const firstIn = xs.findIndex((x) => x > x0 && x < x1);
        if (fromBack ? firstIn !== n - k : firstIn !== 0) return "かこんだ場所が違う";
        return null;
      }
      const r = redRings(pr.answer.figure)[0];
      const i = xs.findIndex((x) => Math.abs(x - r.cx) < 1);
      return i === (fromBack ? n - k : k - 1) ? null : "○の場所が違う";
    }
  };

  // ===== 8 うえ・した・みぎ・ひだり =====
  const yPosition = {
    id: "y.position",
    instruction: null,
    defaults: { mode: "updown" },
    levels: lv({ mode: "updown" }, { mode: "leftright" }, { mode: "grid" }),
    generate(rng, p, ctx) {
      const all = THINGS2.concat(ANIMALS);
      const S = 17, P = 23, items = [];
      let text, target, cells = [], X0 = 10, Y0 = 4, h;
      if (p.mode === "updown") {
        // 2だんの たな。同じものが うえと したに 1つずつ
        const k = rng.pick(all), rest = rng.shuffle(all.filter((x) => x !== k)).slice(0, 4);
        const top = rng.shuffle([k, rest[0], rest[1]]), bot = rng.shuffle([k, rest[2], rest[3]]);
        const up = rng.chance(0.5);
        [top, bot].forEach((row, r) => {
          const y = Y0 + r * (P + 6);
          items.push({ t: "line", x1: X0 - 4, y1: y + P, x2: X0 + 3 * (P + 8), y2: y + P, w: 1.2, lead: true });
          row.forEach((kk, c) => {
            const cx = X0 + P / 2 + c * (P + 8), cy = y + P / 2;
            items.push(...pic(kk, cx, cy, S, `${r}:${c}`));
            cells.push({ r, c, cx, cy, kk });
          });
        });
        target = cells.find((q) => q.kk === k && q.r === (up ? 0 : 1));
        text = `${up ? "うえ" : "した"}の たなの ${nameOf(k)}に ○を つけましょう。`;
        h = Y0 + 2 * (P + 6);
      } else if (p.mode === "leftright") {
        const row = rng.shuffle(all).slice(0, 5);
        const i = rng.int(1, 3), right = rng.chance(0.5);
        row.forEach((kk, c) => {
          const cx = X0 + P / 2 + c * (P + 6), cy = Y0 + P / 2;
          items.push(...pic(kk, cx, cy, S, `0:${c}`));
          cells.push({ r: 0, c, cx, cy, kk });
        });
        items.push(txt(X0 - 4, Y0 + P + 9, "← ひだり", 4.4, { anchor: "start" }), txt(X0 + 5 * (P + 6) - 2, Y0 + P + 9, "みぎ →", 4.4, { anchor: "end" }));
        target = cells[right ? i + 1 : i - 1];
        text = `${nameOf(row[i])}の すぐ ${right ? "みぎ" : "ひだり"}に ある ものに ○を つけましょう。`;
        h = Y0 + P + 12;
      } else {
        const g = rng.shuffle(all).slice(0, 9);
        for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
          const x = X0 + c * P, y = Y0 + r * P;
          items.push(rect(x, y, P, P, { w: 0.5 }));
          items.push(...pic(g[r * 3 + c], x + P / 2, y + P / 2, S, `${r}:${c}`));
          cells.push({ r, c, cx: x + P / 2, cy: y + P / 2, kk: g[r * 3 + c] });
        }
        target = rng.pick(cells);
        const fromTop = rng.chance(0.6), fromLeft = rng.chance(0.6);
        const rn = fromTop ? target.r + 1 : 3 - target.r, cn = fromLeft ? target.c + 1 : 3 - target.c;
        text = `${fromTop ? "うえ" : "した"}から ${rn}ばんめ、${fromLeft ? "ひだり" : "みぎ"}から ${cn}ばんめに ある ものに ○を つけましょう。`;
        h = Y0 + 3 * P + 2;
      }
      return made(rng, p, ctx, {
        key: `yp:${p.mode}:${cells.map((q) => q.kk).join(",")}:${target.r}${target.c}:${text}`,
        text, w: W, h, items,
        ans: (c) => [ring(target.cx, target.cy, 11.5, c, 1.1)],
        meta: { mode: p.mode, cells, target, text }
      });
    },
    verify(pr) {
      const { mode, cells, target, text } = pr.meta;
      const r = redRings(pr.answer.figure)[0];
      const hit = cells.find((q) => Math.abs(q.cx - r.cx) < 1 && Math.abs(q.cy - r.cy) < 1);
      if (!hit || hit !== target && !(hit.r === target.r && hit.c === target.c)) return "○の場所が違う";
      if (mode === "updown") {
        const same = cells.filter((q) => q.kk === hit.kk);
        if (same.length !== 2 || same[0].r === same[1].r) return "うえとしたに1つずつでない";
        if ((hit.r === 0) !== text.startsWith("うえ")) return "だんが違う";
      }
      if (mode === "leftright") {
        const ref = cells.find((q) => text.startsWith(nameOf(q.kk) + "の"));
        if (!ref || Math.abs(ref.c - hit.c) !== 1 || (hit.c > ref.c) !== text.includes("みぎに")) return "となりが違う";
      }
      if (mode === "grid") {
        const m = text.match(/(うえ|した)から (\d)ばんめ、(ひだり|みぎ)から (\d)ばんめ/);
        const rr = m[1] === "うえ" ? Number(m[2]) - 1 : 3 - Number(m[2]), cc = m[3] === "ひだり" ? Number(m[4]) - 1 : 3 - Number(m[4]);
        if (hit.r !== rr || hit.c !== cc) return "ます目の場所が違う";
      }
      return null;
    }
  };

  // ===== 9 いくつと いくつ =====
  const yCompose = {
    id: "y.compose",
    instruction: null,
    defaults: { totals: [5], bag: false },
    levels: lv({ totals: [3, 4, 5] }, { totals: [5, 6, 7, 8, 9, 10] }, { totals: [6, 7, 8, 9, 10], bag: true }),
    generate(rng, p, ctx) {
      const n = rng.pick(p.totals), a = rng.int(1, n - 1), b = n - a;
      const kind = rng.pick(THINGS2);
      const items = [];
      const S = 13, P = 15.5;
      const bs = 22;
      let text, bx, by;
      if (!p.bag) {
        // ●(ぬったもの)と ○(ぬっていないもの)
        for (let i = 0; i < n; i++) items.push({ t: "circle", cx: 10 + i * P, cy: 11, r: 6.2, w: 0.7, fill: i < a ? "#555" : "white", lead: true, g: i, kind: i < a ? "full" : "empty" });
        items.push(txt(2, 33, `${n}は`, 8, { anchor: "start" }), txt(26, 33, `${a}と`, 8, { anchor: "start" }));
        bx = 46;
        by = 18;
        text = `あわせて ${n}こ。○は いくつ ありますか。`;
      } else {
        // ふくろの なかに かくれている かず
        for (let i = 0; i < a; i++) items.push(...pic(kind, 10 + (i % 5) * P, 11 + Math.floor(i / 5) * P, S, i));
        const fx = 10 + 5 * P + 6;
        items.push({ t: "path", d: `M${fx + 4} ${4}L${fx + 26} ${4}L${fx + 22} ${10}C${fx + 36} ${14} ${fx + 36} ${32} ${fx + 15} ${34}C${fx - 6} ${32} ${fx - 6} ${14} ${fx + 8} ${10}Z`, w: 0.7, fill: "light", lead: true });
        items.push(txt(fx + 15, 26, "?", 10, { bold: true }));
        bx = 10 + 5 * P + 50;
        by = 8;
        text = `ぜんぶで ${n}こ。ふくろの なかは なんこですか。`;
      }
      items.push(box(bx, by, bs));
      return made(rng, p, ctx, {
        key: `ycm:${n}:${a}:${p.bag ? kind : ""}`,
        text, w: W, h: by + bs + 2, items,
        ans: (c) => [numIn(bx, by, bs, b, c)],
        meta: { n, a, b, bag: p.bag, kind }
      });
    },
    verify(pr) {
      const { n, a, b, bag, kind } = pr.meta;
      if (a + b !== n || a < 1 || b < 1) return "合わない";
      const shown = bag ? tagsOf(pr.figure.items, kind).size : tagsOf(pr.figure.items, "full").size;
      if (shown !== a) return "見えている数が違う";
      if (!bag && tagsOf(pr.figure.items, "empty").size !== b) return "○の数が違う";
      return redNums(pr.answer.figure).join() === String(b) ? null : "答えが合わない";
    }
  };

  // ===== 10 あわせて いくつ / ふえると いくつ =====
  function plate(items, kind, n, x, y, w, h, tagPre) {
    items.push({ t: "path", d: `M${x} ${y + h / 2}A${w / 2} ${h / 2} 0 1 0 ${x + w} ${y + h / 2}A${w / 2} ${h / 2} 0 1 0 ${x} ${y + h / 2}Z`, w: 0.6, fill: "white", lead: true });
    const per = n > 4 ? Math.ceil(n / 2) : n, rows = n > 4 ? 2 : 1, S = 10.5, P = 12;
    for (let i = 0; i < n; i++) {
      const r = Math.floor(i / per), c = i % per, inRow = r === rows - 1 ? n - per * (rows - 1) : per;
      items.push(...pic(kind, x + w / 2 + (c - (inRow - 1) / 2) * P, y + h / 2 + (r - (rows - 1) / 2) * P, S, `${tagPre}${i}`));
    }
  }
  const yAdd = {
    id: "y.add",
    instruction: null,
    defaults: { max: 5, grow: false },
    levels: lv({ max: 5 }, { max: 10 }, { max: 10, grow: true }),
    generate(rng, p, ctx) {
      let a, b;
      do {
        a = rng.int(1, p.max - 1);
        b = rng.int(1, p.max - 1);
      } while (a + b > p.max || a > 5 || b > 5);
      const grow = p.grow && rng.chance(0.5);
      const kind = grow ? rng.pick(ANIMALS) : rng.pick(THINGS2);
      const items = [];
      const PW = 50, PH = 32, bs = 24;
      plate(items, kind, a, 1, 1, PW, PH, "a");
      items.push(txt(PW + 8, PH / 2 + 4, grow ? "" : "と", 8));
      if (grow) {
        items.push({ t: "path", d: `M${PW + 3} ${PH / 2}L${PW + 11} ${PH / 2 - 5}L${PW + 11} ${PH / 2 + 5}Z`, w: 0, fill: "black", lead: true });
        items.push({ t: "line", x1: PW + 10, y1: PH / 2, x2: PW + 16, y2: PH / 2, w: 1.2, lead: true });
      }
      plate(items, kind, b, PW + 17, 1, PW - 6, PH, "b");
      items.push(txt(2 * PW + 21, PH / 2 + 4, "で", 8), box(2 * PW + 30, PH / 2 - bs / 2 + 1, bs));
      items.push(txt(2 * PW + 30 + bs + 3, PH / 2 + 6, ICONS[kind].counter, 7, { anchor: "start" }));
      const bx = 2 * PW + 30, by = PH / 2 - bs / 2 + 1;
      return made(rng, p, ctx, {
        key: `ya:${kind}:${a}:${b}:${grow}`,
        softKey: kind,
        text: grow ? `${b}${ctr(kind, b)} きました。ぜんぶで なん${ICONS[kind].counter === "わ" ? "わ" : "びき"}ですか。` : "あわせると なんこですか。",
        w: W, h: PH + 4, items,
        ans: (c) => [numIn(bx, by, bs, a + b, c)],
        meta: { kind, a, b }
      });
    },
    verify(pr, p) {
      const { kind, a, b } = pr.meta;
      const tags = [...tagsOf(pr.figure.items, kind)];
      if (tags.filter((g) => g.startsWith("a")).length !== a || tags.filter((g) => g.startsWith("b")).length !== b) return "絵の数が違う";
      if (a + b > p.max) return "こたえが大きすぎる";
      return redNums(pr.answer.figure).join() === String(a + b) ? null : "答えが合わない";
    }
  };

  // ===== 11 のこりは いくつ =====
  const ySub = {
    id: "y.sub",
    instruction: null,
    defaults: { max: 5, cross: true },
    levels: lv({ max: 5, cross: true }, { max: 10, cross: true }, { max: 10, cross: false }),
    generate(rng, p, ctx) {
      const n = rng.int(3, p.max), k = rng.int(1, n - 1);
      const kind = rng.pick(THINGS2.filter((x) => ICONS[x].counter === "こ"));
      const S = 13.5, P = 16.5, items = [];
      const per = 5;
      const take = new Set(rng.shuffle(Array.from({ length: n }, (_, i) => i)).slice(0, k));
      for (let i = 0; i < n; i++) {
        const cx = 10 + (i % per) * P, cy = 10 + Math.floor(i / per) * P;
        items.push(...pic(kind, cx, cy, S, i));
        if (p.cross && take.has(i)) items.push({ t: "line", x1: cx - 6.5, y1: cy - 6.5, x2: cx + 6.5, y2: cy + 6.5, w: 1.1, lead: true, cross: i }, { t: "line", x1: cx + 6.5, y1: cy - 6.5, x2: cx - 6.5, y2: cy + 6.5, w: 1.1, lead: true });
      }
      const rows = Math.ceil(n / per), bs = 24, bx = 10 + per * P + 14, by = Math.max(1, (rows * P) / 2 - bs / 2 + 1);
      items.push(box(bx, by, bs), txt(bx + bs + 3, by + bs * 0.75, "こ", 8, { anchor: "start" }));
      return made(rng, p, ctx, {
        key: `ysb:${kind}:${n}:${k}:${[...take].join(",")}`,
        softKey: kind,
        text: p.cross ? "のこりは なんこですか。" : `${k}こ たべると、のこりは なんこですか。`,
        w: W, h: Math.max(rows * P + 6, by + bs + 2), items,
        ans: (c) => [numIn(bx, by, bs, n - k, c)],
        meta: { kind, n, k }
      });
    },
    verify(pr, p) {
      const { kind, n, k } = pr.meta;
      if (tagsOf(pr.figure.items, kind).size !== n) return "絵の数が違う";
      if (p.cross && pr.figure.items.filter((it) => it.cross !== void 0).length !== k) return "×の数が違う";
      return redNums(pr.answer.figure).join() === String(n - k) ? null : "答えが合わない";
    }
  };
