
  // ============================================================
  // 図の道具(画面の座標:y は下向き)
  // ============================================================
  const nrm = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  // 頂点 V で P1→P2 の小さいほうの角に弧と文字
  function angMark(V0, P1, P2, label, { r = 5, color, lab = 3.4, size = 3.4 } = {}) {
    const a1 = Math.atan2(P1[1] - V0[1], P1[0] - V0[0]), a2 = Math.atan2(P2[1] - V0[1], P2[0] - V0[0]);
    const d = nrm(a2 - a1), sweep = d > 0 ? 1 : 0;
    const p = (a, rr) => [V0[0] + rr * Math.cos(a), V0[1] + rr * Math.sin(a)];
    const [x1, y1] = p(a1, r), [x2, y2] = p(a1 + d, r);
    const out = [{ t: "path", d: `M${x1.toFixed(2)} ${y1.toFixed(2)}A${r} ${r} 0 0 ${sweep} ${x2.toFixed(2)} ${y2.toFixed(2)}`, w: 0.35, color }];
    if (label) {
      const [lx, ly] = p(a1 + d / 2, r + lab + (String(label).length > 2 ? 1.6 : 0));
      out.push(T_(lx, ly + 1.2, label, size, { color, bold: label === "x" || label === "[[v:x]]" }));
    }
    return out;
  }
  const rightMark = (V0, P1, P2, s = 2.6) => {
    const u = (P) => {
      const dx = P[0] - V0[0], dy = P[1] - V0[1], l = Math.hypot(dx, dy);
      return [dx / l * s, dy / l * s];
    };
    const [ax, ay] = u(P1), [bx, by] = u(P2);
    return { t: "poly", open: true, pts: [[V0[0] + ax, V0[1] + ay], [V0[0] + ax + bx, V0[1] + ay + by], [V0[0] + bx, V0[1] + by]], w: 0.3 };
  };
  // 等しい辺のしるし(n 本)
  const ticks = (P1, P2, n = 1) => {
    const mx = (P1[0] + P2[0]) / 2, my = (P1[1] + P2[1]) / 2, dx = P2[0] - P1[0], dy = P2[1] - P1[1], l = Math.hypot(dx, dy);
    const ux = dx / l, uy = dy / l, out = [];
    for (let i = 0; i < n; i++) {
      const o = (i - (n - 1) / 2) * 1.3;
      out.push(L_(mx + ux * o - uy * 2, my + uy * o + ux * 2, mx + ux * o + uy * 2, my + uy * o - ux * 2, { w: 0.4 }));
    }
    return out;
  };
  const seg = (P1, P2, o = {}) => L_(P1[0], P1[1], P2[0], P2[1], { w: 0.6, ...o });
  const vLabel = (P, cen, s, d = 3.4, o = {}) => {
    const dx = P[0] - cen[0], dy = P[1] - cen[1], l = Math.hypot(dx, dy) || 1;
    return T_(P[0] + dx / l * d, P[1] + dy / l * d + 1.3, s, 3.6, { bold: true, ...o });
  };
  const sideLabel = (P1, P2, cen, s, d = 3.6) => {
    const mx = (P1[0] + P2[0]) / 2, my = (P1[1] + P2[1]) / 2, dx = mx - cen[0], dy = my - cen[1], l = Math.hypot(dx, dy) || 1;
    return T_(mx + dx / l * d, my + dy / l * d + 1.2, s, 3.3);
  };
  const centroid = (Ps) => [Ps.reduce((a, p) => a + p[0], 0) / Ps.length, Ps.reduce((a, p) => a + p[1], 0) / Ps.length];
  const fitDraw = (items, m = 5, o = {}) => {
    const { W, H, dx, dy } = fitBox(items, m);
    return draw(W, H, items.map((it) => shiftItem(it, dx, dy)), o);
  };
  // 2本の半直線の交点(画面の座標で角度 deg)
  const rayX = (P, a1, Qp, a2) => {
    const d1 = [Math.cos(rad(a1)), Math.sin(rad(a1))], d2 = [Math.cos(rad(a2)), Math.sin(rad(a2))];
    const den = d1[0] * d2[1] - d1[1] * d2[0], t = ((Qp[0] - P[0]) * d2[1] - (Qp[1] - P[1]) * d2[0]) / den;
    return [P[0] + d1[0] * t, P[1] + d1[1] * t];
  };
  const XL = V("x"), deg = (v) => `${v}°`;
  Object.assign(RUBY, { 大きさ: "{大|おお}きさ", 多角形: "たかくけい", 角形: "かくけい", 一つ: "{1|ひと}つ" });

  // ============================================================
  // 4 平行と合同
  // ============================================================
  const parallelAngle = {
    id: "c2.parallelAngle",
    instruction: null,
    defaults: { types: ["one"] },
    levels: lv({ types: ["one", "one", "zig"] }, { types: ["one", "zig"] }, { types: ["zig", "zigInv", "one"] }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx);
      const yl = 14, ym = 50, x0 = 4, x1 = 116;
      const base = [L_(x0, yl, x1, yl, { w: 0.6 }), L_(x0, ym, x1, ym, { w: 0.6 }), T_(x1 + 3, yl + 1.3, "ℓ", 3.8, { bold: true }), T_(x1 + 3, ym + 1.3, "[[v:m]]", 3.8)];
      if (type === "one") {
        for (let t = 0; t < 50; t++) {
          const th = rng.pick([40, 45, 50, 55, 60, 65, 70, 75, 105, 110, 115, 120, 125, 130, 135]);
          const P1 = [rng.int(45, 70), yl], tt = (ym - yl) / Math.sin(rad(th)), P2 = [P1[0] - Math.cos(rad(th)) * tt, ym];
          const U = [Math.cos(rad(th)), -Math.sin(rad(th))], dirs = { R: [1, 0], U, L: [-1, 0], D: [-U[0], -U[1]] };
          const REG = [["R", "U", th], ["U", "L", 180 - th], ["L", "D", th], ["D", "R", 180 - th]];
          const g = rng.pick(REG), tg = rng.pick(REG);
          const at = (P, r) => [P[0] + dirs[r][0] * 10, P[1] + dirs[r][1] * 10];
          const items = [...base, L_(P1[0] + U[0] * 12, P1[1] + U[1] * 12, P2[0] - U[0] * 12, P2[1] - U[1] * 12, { w: 0.6 })];
          items.push(...angMark(P1, at(P1, g[0]), at(P1, g[1]), deg(g[2])), ...angMark(P2, at(P2, tg[0]), at(P2, tg[1]), XL));
          return { key: `pa:o:${th}:${P1[0]}:${g[0]}:${tg[0]}`, text: `ℓ∥${V("m")}${R("のとき、")}∠${XL}${R("の大きさを求めましょう。")}`, figure: fitDraw(items), answer: { display: deg(tg[2]) }, workspace: { type: "none" }, meta: { th, g: g[2], x: tg[2] } };
        }
      }
      for (let t = 0; t < 200; t++) {
        const a = rng.int(5, 12) * 5, b = rng.int(5, 12) * 5;
        const A = [rng.int(15, 35), yl], B = [rng.int(15, 35), ym];
        const P = rayX(A, a, B, -b);
        if (P[0] < 50 || P[0] > 100 || P[1] < yl + 8 || P[1] > ym - 8) continue;
        const items = [...base, seg(A, P), seg(B, P)];
        const AR = [A[0] + 10, A[1]], BR = [B[0] + 10, B[1]];
        const inv = type === "zigInv";
        items.push(...angMark(A, AR, P, deg(a)), ...angMark(B, BR, P, inv ? XL : deg(b)), ...angMark(P, A, B, inv ? deg(a + b) : XL, { r: 5 }));
        return { key: `pa:z:${a}:${b}:${A}:${B}:${inv}`, text: `ℓ∥${V("m")}${R("のとき、")}∠${XL}${R("の大きさを求めましょう。")}`, figure: fitDraw(items), answer: { display: deg(inv ? b : a + b) }, workspace: { type: "none" }, meta: { a, b } };
      }
      throw new Error("平行線と角の問題が作れない");
    },
    verify(pr) {
      return /^\d+°$/.test(pr.answer.display) ? null : "答えの形";
    }
  };

  const KAN = { 3: ["三", "さん"], 4: ["四", "し"], 5: ["五", "ご"], 6: ["六", "ろっ"], 8: ["八", "はっ"], 9: ["九", "きゅう"], 10: ["十", "じゅっ"], 12: ["十二", "じゅうに"], 15: ["十五", "じゅうご"], 18: ["十八", "じゅうはち"], 20: ["二十", "にじゅっ"] };
  const polyName = (n, reg) => `{${reg ? "正" : ""}${KAN[n][0]}角形|${reg ? "せい" : ""}${KAN[n][1]}かくけい}`;
  const polygonAngle = {
    id: "c2.polygonAngle",
    instruction: R("次の問いに答えましょう。"),
    defaults: { types: ["sum", "regInt"] },
    levels: lv({ types: ["sum", "regExt", "extSum"] }, { types: ["sum", "regInt", "regExt", "nFromSum"] }, { types: ["regInt", "nFromSum", "nFromExt", "nFromInt"] }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx);
      const ns = Object.keys(KAN).map(Number).filter((n) => n >= 5 || type === "sum");
      const n = rng.pick(type === "regInt" || type === "nFromInt" || type === "regExt" || type === "nFromExt" ? ns.filter((k) => 360 % k === 0) : ns);
      const T = {
        sum: [`${polyName(n)}${R("の内角の和")}`, deg(180 * (n - 2))],
        extSum: [`${polyName(n)}${R("の外角の和")}`, "360°"],
        regInt: [`${polyName(n, true)}${R("の1つの内角の大きさ")}`, deg(180 - 360 / n)],
        regExt: [`${polyName(n, true)}${R("の1つの外角の大きさ")}`, deg(360 / n)],
        nFromSum: [`${R(`内角の和が${180 * (n - 2)}°である多角形`)}`, polyName(n)],
        nFromExt: [`${R(`1つの外角の大きさが${360 / n}°である正多角形`)}`, polyName(n, true)],
        nFromInt: [`${R(`1つの内角の大きさが${180 - 360 / n}°である正多角形`)}`, polyName(n, true)]
      }[type];
      return { key: `pg:${type}:${n}`, text: T[0], answer: { display: T[1] }, workspace: { type: "none" }, meta: { type, n } };
    }
  };
  Object.assign(RUBY, { 正多角形: "せいたかくけい" });

  const triAngle = {
    id: "c2.triAngle",
    instruction: null,
    defaults: { types: ["interior", "exterior"] },
    levels: lv({ types: ["interior", "exterior"] }, { types: ["interior", "exterior", "extInv"] }, { types: ["exterior", "extInv", "dart", "dart"] }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx);
      for (let t = 0; t < 200; t++) {
        if (type === "dart") {
          const B0 = rng.int(9, 14) * 5, C0 = rng.int(9, 14) * 5, a = 180 - B0 - C0;
          if (a < 30) continue;
          const b = rng.int(3, B0 / 5 - 3) * 5, c = rng.int(3, C0 / 5 - 3) * 5;
          const B = [0, 0], C = [70, 0], A = rayX(B, -B0, C, -(180 - C0));
          const Dp = rayX(B, -(B0 - b), C, -(180 - (C0 - c)));
          if (A[1] > -25 || Dp[1] > -6 || Dp[1] < A[1] + 8) continue;
          const cen = centroid([A, B, C]);
          const items = [seg(A, B), seg(A, C), seg(B, Dp), seg(C, Dp), vLabel(A, cen, "A"), vLabel(B, cen, "B"), vLabel(C, cen, "C"), vLabel(Dp, [Dp[0], Dp[1] - 5], "D", 3.6)];
          items.push(...angMark(A, B, C, deg(a), { r: 6 }), ...angMark(B, A, Dp, deg(b), { r: 9 }), ...angMark(C, A, Dp, deg(c), { r: 9 }), ...angMark(Dp, B, C, XL, { r: 4 }));
          return { key: `ta:d:${a}:${b}:${c}`, text: `${R("下の図で、")}∠${XL}${R("の大きさを求めましょう。")}`, figure: fitDraw(items), answer: { display: deg(a + b + c) }, workspace: { type: "none" }, meta: { type } };
        }
        const be = rng.int(7, 14) * 5, ga = rng.int(7, 14) * 5, al = 180 - be - ga;
        if (al < 30) continue;
        const B = [0, 0], C = [70, 0], A = rayX(B, -be, C, -(180 - ga));
        if (A[1] < -55) continue;
        const cen = centroid([A, B, C]);
        const items = [seg(A, B), seg(B, C), seg(C, A), vLabel(A, cen, "A"), vLabel(B, cen, "B"), vLabel(C, cen, "C")];
        let ans;
        if (type === "interior") {
          items.push(...angMark(B, A, C, deg(be), { r: 6 }), ...angMark(C, A, B, deg(ga), { r: 6 }), ...angMark(A, B, C, XL, { r: 5 }));
          ans = al;
        } else {
          const D = [C[0] + 24, 0];
          items.push(seg(C, D), vLabel(D, [D[0] - 5, -5], "D", 2.8));
          if (type === "exterior") {
            items.push(...angMark(A, B, C, deg(al), { r: 5 }), ...angMark(B, A, C, deg(be), { r: 6 }), ...angMark(C, A, D, XL, { r: 6 }));
            ans = al + be;
          } else {
            items.push(...angMark(C, A, D, deg(al + be), { r: 6 }), ...angMark(B, A, C, deg(be), { r: 6 }), ...angMark(A, B, C, XL, { r: 5 }));
            ans = al;
          }
        }
        return { key: `ta:${type}:${be}:${ga}`, text: `${R("下の図で、")}∠${XL}${R("の大きさを求めましょう。")}`, figure: fitDraw(items), answer: { display: deg(ans) }, workspace: { type: "none" }, meta: { type } };
      }
      throw new Error("三角形の角の問題が作れない");
    }
  };
  Object.assign(RUBY, { 図で: "{図|ず}で" });

  const LETTERS = ["DEF", "PQR", "GHI", "LMN"];
  const congCorr = {
    id: "c2.congCorr",
    instruction: R("次の問いに答えましょう。"),
    defaults: {},
    levels: lv({ perm: false }, { perm: true }, { perm: true }),
    generate(rng, p) {
      const L = rng.pick(LETTERS), order = p.perm ? rng.shuffle([0, 1, 2]) : [0, 1, 2];
      const map = { A: L[order[0]], B: L[order[1]], C: L[order[2]] };
      const tri2 = "ABC".split("").map((c) => map[c]).join("");
      const kind = rng.pick(["side", "angle"]);
      if (kind === "side") {
        const sd = rng.pick(["AB", "BC", "CA"]);
        const ans = `${map[sd[0]]}${map[sd[1]]}`;
        return { key: `cc:${tri2}:${sd}`, text: `△ABC≡△${tri2}${R("のとき、辺")}${sd}${R("に対応する辺")}`, answer: { display: `${R("辺")}${ans}` }, workspace: { type: "none" }, meta: {} };
      }
      const v = rng.pick(["A", "B", "C"]);
      return { key: `cc:${tri2}:${v}`, text: `△ABC≡△${tri2}${R("のとき、")}∠${v}${R("に対応する角")}`, answer: { display: `∠${map[v]}` }, workspace: { type: "none" }, meta: {} };
    }
  };

  const COND = {
    sss: "3組の辺がそれぞれ等しい",
    sas: "2組の辺とその間の角がそれぞれ等しい",
    asa: "1組の辺とその両端の角がそれぞれ等しい"
  };
  // 三角形 ABC(画面の座標、cm → mm は ×7)
  function triFromSides(a, b, c) {
    // BC＝a, CA＝b, AB＝c
    const B = [0, 0], C = [a * 7, 0], x = (c * c - b * b + a * a) / (2 * a), y = Math.sqrt(Math.max(0, c * c - x * x));
    return [[x * 7, -y * 7], B, C];
  }
  const congCond = {
    id: "c2.congCond",
    instruction: null,
    defaults: {},
    levels: lv({}, {}, {}),
    generate(rng) {
      for (let t = 0; t < 200; t++) {
        const kind = rng.pick(["sss", "sas", "asa"]);
        let A, B, C, ann;
        if (kind === "sss") {
          const a = rng.int(5, 8), b = rng.int(4, 8), c = rng.int(4, 8);
          if (a >= b + c || b >= a + c || c >= a + b || new Set([a, b, c]).size < 3) continue;
          [A, B, C] = triFromSides(a, b, c);
          ann = { sides: { BC: a, CA: b, AB: c } };
        } else if (kind === "sas") {
          const b = rng.int(4, 7), c = rng.int(4, 7), al = rng.int(8, 20) * 5;
          if (b === c) continue;
          A = [0, 0];
          B = [c * 7 * Math.cos(rad(180 - al / 2 - 90 + 90)), 0];
          B = [-c * 7 * Math.sin(rad(al / 2)), c * 7 * Math.cos(rad(al / 2))];
          C = [b * 7 * Math.sin(rad(al / 2)), b * 7 * Math.cos(rad(al / 2))];
          ann = { sides: { CA: b, AB: c }, angles: { A: al } };
        } else {
          const a = rng.int(5, 8), be = rng.int(7, 14) * 5, ga = rng.int(7, 14) * 5;
          if (be + ga > 140 || be === ga) continue;
          B = [0, 0];
          C = [a * 7, 0];
          A = rayX(B, -be, C, -(180 - ga));
          ann = { sides: { BC: a }, angles: { B: be, C: ga } };
        }
        // 2つめは回したり裏返したりする
        const th = rad(rng.int(0, 359)), flip = rng.chance(0.5);
        const tf = ([x, y]) => {
          const x2 = flip ? -x : x;
          return [x2 * Math.cos(th) - y * Math.sin(th), x2 * Math.sin(th) + y * Math.cos(th)];
        };
        const L2 = rng.pick(LETTERS), order = rng.shuffle([0, 1, 2]);
        const map = { A: L2[order[0]], B: L2[order[1]], C: L2[order[2]] };
        const draw1 = (P, names, dx) => {
          const Pm = Object.fromEntries(Object.entries(P).map(([k, v]) => [k, [v[0] + dx, v[1]]]));
          const cen = centroid(Object.values(Pm)), it = [];
          it.push(seg(Pm.A, Pm.B), seg(Pm.B, Pm.C), seg(Pm.C, Pm.A));
          for (const k of "ABC") it.push(vLabel(Pm[k], cen, names[k]));
          for (const [sd, v] of Object.entries(ann.sides || {})) it.push(sideLabel(Pm[sd[0]], Pm[sd[1]], cen, `${v}cm`));
          for (const [k, v] of Object.entries(ann.angles || {})) {
            const o = "ABC".replace(k, "");
            it.push(...angMark(Pm[k], Pm[o[0]], Pm[o[1]], deg(v), { r: 5, size: 3.1 }));
          }
          return it;
        };
        const P1 = { A, B, C }, P2r = { A: tf(A), B: tf(B), C: tf(C) };
        const w1 = fitBox(draw1(P1, { A: "A", B: "B", C: "C" }, 0), 0), w2 = fitBox(draw1(P2r, map, 0), 0);
        if (w1.H > 62 || w2.H > 62) continue;
        const it1 = draw1(P1, { A: "A", B: "B", C: "C" }, 0).map((i) => shiftItem(i, w1.dx, w1.dy + (62 - w1.H) / 2));
        const it2 = draw1(P2r, map, 0).map((i) => shiftItem(i, w2.dx + w1.W + 16, w2.dy + (62 - w2.H) / 2));
        const tri2 = "ABC".split("").map((c) => map[c]).join("");
        return {
          key: `cd:${kind}:${tri2}:${JSON.stringify(ann)}`,
          softKey: kind,
          text: `${R("下の2つの三角形は合同です。")}[[br]](1) ${R("合同であることを、記号≡を使って表しましょう。")}[[br]](2) ${R("使われている三角形の合同条件を答えましょう。")}`,
          figure: fitDraw([...it1, ...it2], 4),
          answer: { display: `(1) △ABC≡△${tri2}　(2) ${R(COND[kind])}` },
          workspace: { type: "lines", labels: ["(1)", "(2)"] },
          meta: { kind }
        };
      }
      throw new Error("合同条件の問題が作れない");
    }
  };
  Object.assign(RUBY, { 記号: "きごう", 使われている: "{使|つか}われている", 三角形: "さんかくけい" });

  const HYPO = [
    ["△ABC≡△DEF ならば、AB＝DE である。", "△ABC≡△DEF", "AB＝DE"],
    ["xが6の倍数ならば、xは3の倍数である。", "xが6の倍数", "xは3の倍数"],
    ["ℓ∥mならば、同位角は等しい。", "ℓ∥m", "同位角は等しい"],
    ["四角形ABCDが正方形ならば、AC＝BDである。", "四角形ABCDが正方形", "AC＝BD"],
    ["a＞0，b＞0ならば、a＋b＞0である。", "a＞0，b＞0", "a＋b＞0"],
    ["2直線が平行ならば、錯角は等しい。", "2直線が平行", "錯角は等しい"],
    ["△ABCで、AB＝ACならば、∠B＝∠Cである。", "AB＝AC", "∠B＝∠C"],
    ["x＝3ならば、2x＋1＝7である。", "x＝3", "2x＋1＝7"],
    ["四角形ABCDが平行四辺形ならば、AB＝DCである。", "四角形ABCDが平行四辺形", "AB＝DC"],
    ["aもbも偶数ならば、a＋bは偶数である。", "aもbも偶数", "a＋bは偶数"]
  ];
  const vSmall = (s) => s.replace(/(^|[^a-zA-Z])([abxm])(?![a-zA-Z])/g, (_, pre, L) => pre + V(L));
  const hypothesis = {
    id: "c2.hypothesis",
    instruction: null,
    defaults: {},
    levels: lv({ max: 6 }, { max: 10 }, { max: 10 }),
    generate(rng, p, ctx) {
      const pool = HYPO.slice(0, p.max);
      const i = ctx && Number.isInteger(ctx.index) ? (ctx.index * 3 + rng.int(0, pool.length - 1)) % pool.length : rng.int(0, pool.length - 1);
      const h = pool[i];
      return { key: `hy:${i}`, softKey: String(i), text: `${R("次のことがらの仮定と結論を答えましょう。")}[[br]]「${R(vSmall(h[0]))}」`, answer: { display: `${R("仮定")} ${R(vSmall(h[1]))}　${R("結論")} ${R(vSmall(h[2]))}` }, workspace: { type: "lines", labels: [R("仮定"), R("結論")] }, meta: { i } };
    }
  };
  Object.assign(RUBY, { 等しい: "{等|ひと}しい", 偶数: "ぐうすう", 倍数: "ばいすう" });

  // 証明の穴うめ
  const PROOF_FILL = [
    {
      t: "下の図で、線分ABとCDが点Oで交わり、AO＝BO，CO＝DOです。このとき、△AOC≡△BODであることを証明します。［ア］〜［エ］にあてはまるものを答えましょう。",
      body: ["〔証明〕△AOCと△BODで、", "仮定から　AO＝［ア］…①", "仮定から　CO＝DO…②", "［イ］は等しいから　∠AOC＝∠BOD…③", "①，②，③より、［ウ］がそれぞれ等しいから", "△AOC≡［エ］"],
      a: ["BO", "対頂角", "2組の辺とその間の角", "△BOD"],
      fig: () => {
        const O = [50, 35], A = [16, 12], B = [84, 58], C = [18, 56], D = [82, 14];
        return [seg(A, B), seg(C, D), seg(A, C), seg(B, D), vLabel(A, O, "A"), vLabel(B, O, "B"), vLabel(C, O, "C"), vLabel(D, O, "D"), T_(O[0], O[1] - 3.2, "O", 3.6, { bold: true }), ...ticks(A, O, 1), ...ticks(O, B, 1), ...ticks(C, O, 2), ...ticks(O, D, 2)];
      }
    },
    {
      t: "下の図で、AB＝AD，CB＝CDです。このとき、△ABC≡△ADCであることを証明します。［ア］〜［エ］にあてはまるものを答えましょう。",
      body: ["〔証明〕△ABCと△ADCで、", "仮定から　AB＝AD…①", "仮定から　CB＝［ア］…②", "［イ］は共通…③", "①，②，③より、［ウ］がそれぞれ等しいから", "△ABC≡［エ］"],
      a: ["CD", "AC", "3組の辺", "△ADC"],
      fig: () => {
        const A = [50, 6], B = [22, 30], D = [78, 30], C = [50, 64], cen = [50, 32];
        return [seg(A, B), seg(A, D), seg(C, B), seg(C, D), seg(A, C), vLabel(A, cen, "A"), vLabel(B, cen, "B"), vLabel(C, cen, "C"), vLabel(D, cen, "D"), ...ticks(A, B, 1), ...ticks(A, D, 1), ...ticks(B, C, 2), ...ticks(D, C, 2)];
      }
    },
    {
      t: "下の図で、AB∥CDで、点Oは線分ADの中点です。このとき、△ABO≡△DCOであることを証明します。［ア］〜［エ］にあてはまるものを答えましょう。",
      body: ["〔証明〕△ABOと△DCOで、", "仮定から　AO＝［ア］…①", "AB∥CDより、［イ］は等しいから　∠OAB＝∠ODC…②", "［ウ］は等しいから　∠AOB＝∠DOC…③", "①，②，③より、［エ］がそれぞれ等しいから", "△ABO≡△DCO"],
      a: ["DO", "錯角", "対頂角", "1組の辺とその両端の角"],
      fig: () => {
        const A = [14, 10], B = [60, 10], D = [86, 60], C = [40, 60], O = [50, 35];
        return [seg(A, B), seg(C, D), seg(A, D), seg(B, C), vLabel(A, O, "A"), vLabel(B, O, "B"), vLabel(C, O, "C"), vLabel(D, O, "D"), T_(O[0] + 4.4, O[1] + 1.4, "O", 3.6, { bold: true }), ...ticks(A, O, 1), ...ticks(O, D, 1)];
      }
    }
  ];
  Object.assign(RUBY, { 交わり: "{交|まじ}わり", 中点: "ちゅうてん", 線分: "せんぶん", 共通: "きょうつう", 証明します: "{証明|しょうめい}します", あてはまる: "あてはまる", 仮定から: "{仮定|かてい}から" });
  const proofFill = {
    id: "c2.proofFill",
    instruction: null,
    defaults: {},
    levels: lv({}, {}, {}),
    generate(rng, p, ctx) {
      const i = ctx && Number.isInteger(ctx.index) ? (ctx.index + rng.int(0, 2)) % 3 : rng.int(0, 2), flip = rng.chance(0.5);
      const pf = PROOF_FILL[i];
      let items = pf.fig();
      if (flip) items = items.map((it) => it.t === "line" ? { ...it, x1: 100 - it.x1, x2: 100 - it.x2 } : it.t === "text" ? { ...it, x: 100 - it.x } : it);
      return {
        key: `pf:${i}:${flip}`,
        softKey: String(i),
        text: `${R(pf.t)}[[br]]${pf.body.map((l) => R(l)).join("[[br]]")}`,
        figure: fitDraw(items, 5),
        answer: { display: ["ア", "イ", "ウ", "エ"].map((k, j) => `${k} ${R(pf.a[j])}`).join("　") },
        workspace: { type: "lines", labels: ["ア", "イ", "ウ", "エ"] },
        side: true,
        meta: { i }
      };
    }
  };

  // ============================================================
  // 5 三角形と四角形
  // ============================================================
  const isosceles = {
    id: "c2.isosceles",
    instruction: null,
    defaults: { types: ["apex", "base"] },
    levels: lv({ types: ["apex", "base"] }, { types: ["apex", "base", "ext"] }, { types: ["ext", "ext2", "base"] }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx);
      const b = rng.int(7, 15) * 5 - (rng.chance(0.3) ? 2 : 0), apex = 180 - 2 * b;
      if (apex <= 10) return this.generate(rng, p, ctx && { index: ctx.index + 1 });
      const B = [0, 0], C = [56, 0], A = rayX(B, -b, C, -(180 - b)), D = [C[0] + 22, 0], cen = centroid([A, B, C]);
      const items = [seg(A, B), seg(B, C), seg(C, A), vLabel(A, cen, "A"), vLabel(B, cen, "B"), vLabel(C, cen, "C"), ...ticks(A, B, 1), ...ticks(A, C, 1)];
      let ans;
      if (type === "apex") {
        items.push(...angMark(A, B, C, deg(apex), { r: 6 }), ...angMark(B, A, C, XL, { r: 6 }));
        ans = b;
      } else if (type === "base") {
        items.push(...angMark(C, A, B, deg(b), { r: 6 }), ...angMark(A, B, C, XL, { r: 6 }));
        ans = apex;
      } else if (type === "ext") {
        items.push(seg(C, D), vLabel(D, [D[0] - 5, -5], "D", 2.8), ...angMark(A, B, C, deg(apex), { r: 6 }), ...angMark(C, A, D, XL, { r: 6 }));
        ans = 180 - b;
      } else {
        items.push(seg(C, D), vLabel(D, [D[0] - 5, -5], "D", 2.8), ...angMark(C, A, D, deg(180 - b), { r: 6 }), ...angMark(A, B, C, XL, { r: 6 }));
        ans = apex;
      }
      return { key: `is:${type}:${b}`, text: `${R("下の図で、AB＝ACです。")}∠${XL}${R("の大きさを求めましょう。")}`, figure: fitDraw(items), answer: { display: deg(ans) }, workspace: { type: "none" }, meta: { b, apex } };
    }
  };

  // 線分 PQ の長さの文字を、点 S のある側に少しずらしておく
  const aoLabel = (P, Qp, S, s) => {
    const mx = (P[0] + Qp[0]) / 2, my = (P[1] + Qp[1]) / 2, dx = Qp[0] - P[0], dy = Qp[1] - P[1], l = Math.hypot(dx, dy);
    let nx = -dy / l, ny = dx / l;
    if ((S[0] - mx) * nx + (S[1] - my) * ny < 0) nx = -nx, ny = -ny;
    return T_(mx + nx * 3, my + ny * 3 + 1.2, s, 3.1);
  };
  const paraProps = {
    id: "c2.paraProps",
    instruction: null,
    defaults: {},
    levels: lv({ n: 3 }, { n: 3 }, { n: 4 }),
    generate(rng, p) {
      const ab = rng.int(3, 6), bc = rng.int(ab + 1, 9), be = rng.int(10, 15) * 5, ao = rng.int(3, 6);
      const B = [0, 0], C = [bc * 7, 0], A = [ab * 7 * Math.cos(rad(be)), -ab * 7 * Math.sin(rad(be))], D = [A[0] + bc * 7, A[1]], O = [(A[0] + C[0]) / 2, (A[1] + C[1]) / 2];
      const cen = O, items = [seg(A, B), seg(B, C), seg(C, D), seg(D, A), seg(A, C, { w: 0.35 }), seg(B, D, { w: 0.35 })];
      for (const [P, s] of [[A, "A"], [B, "B"], [C, "C"], [D, "D"]]) items.push(vLabel(P, cen, s));
      items.push(T_(O[0], O[1] + 4.6, "O", 3.4, { bold: true }), sideLabel(A, B, cen, `${ab}cm`), sideLabel(B, C, cen, `${bc}cm`), ...angMark(B, A, C, deg(be), { r: 6 }), aoLabel(A, O, B, `${ao}cm`));
      const Qs = rng.shuffle([["辺ADの長さ", `${bc}cm`], ["辺CDの長さ", `${ab}cm`], ["∠ADCの大きさ", deg(be)], ["∠BCDの大きさ", deg(180 - be)], ["線分OCの長さ", `${ao}cm`]]).slice(0, p.n);
      return {
        key: `pp:${ab}:${bc}:${be}:${ao}:${Qs.map((q) => q[0])}`,
        text: `${R("下の図の四角形ABCDは平行四辺形で、点Oは対角線の交点です。次の長さや角の大きさを求めましょう。")}[[br]]${Qs.map((q, i) => `(${i + 1}) ${R(q[0])}`).join("　")}`,
        figure: fitDraw(items),
        answer: { display: Qs.map((q, i) => `(${i + 1}) ${q[1]}`).join("　") },
        workspace: { type: "lines", labels: Qs.map((_, i) => `(${i + 1})`) },
        side: true,
        meta: {}
      };
    }
  };
  Object.assign(RUBY, { 長さ: "{長|なが}さ" });

  const PARA_ST = [
    [true, "AB∥DC，AD∥BC"], [true, "AB＝DC，AD＝BC"], [true, "∠A＝∠C，∠B＝∠D"], [true, "AO＝CO，BO＝DO"], [true, "AB∥DC，AB＝DC"],
    [false, "AB∥DC，AD＝BC"], [false, "AB＝AD，CB＝CD"], [false, "∠A＝∠B，∠C＝∠D"], [false, "AO＝BO，CO＝DO"]
  ];
  const SPECIAL = [["AC＝BD", "長方形"], ["∠A＝90°", "長方形"], ["AB＝BC", "ひし形"], ["AC⊥BD", "ひし形"], ["AC＝BD，AC⊥BD", "正方形"], ["AB＝BC，∠A＝90°", "正方形"], ["∠A＝∠B", "長方形"], ["AB＝AD", "ひし形"]];
  const KANA4 = ["ア", "イ", "ウ", "エ"];
  const quadCond = {
    id: "c2.quadCond",
    instruction: R("次の問いに答えましょう。"),
    defaults: { types: ["special", "para"] },
    levels: lv({ types: ["special"] }, { types: ["special", "para"] }, { types: ["para", "special"] }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx);
      if (type === "special") {
        const s = rng.pick(SPECIAL);
        return { key: `qc:s:${s[0]}`, text: `${R("平行四辺形ABCDに、")}${s[0]}${R("という条件を加えると、何という四角形になりますか。")}`, wide: true, answer: { display: R(s[1]) }, workspace: { type: "none" }, meta: {} };
      }
      for (;;) {
        const pick = rng.shuffle(PARA_ST.map((_, i) => i)).slice(0, 4).sort((a, b) => a - b);
        const sts = rng.shuffle(pick).map((i) => PARA_ST[i]);
        if (!sts.some((s) => s[0]) || !sts.some((s) => !s[0])) continue;
        const ans = KANA4.filter((_, i) => sts[i][0]).join("，");
        return {
          key: `qc:p:${sts.map((s) => s[1])}`,
          text: `${R("四角形ABCDで、いつでも平行四辺形になるものを、次のア〜エから全部選びましょう。(Oは対角線の交点)")}[[br]]${sts.map((s, i) => `${KANA4[i]} ${s[1]}`).join("　　")}`,
          wide: true,
          answer: { display: ans },
          workspace: { type: "none" },
          meta: {}
        };
      }
    }
  };
  Object.assign(RUBY, { 何という: "{何|なん}という", 全部: "ぜんぶ", 交点: "こうてん" });

  const equalArea = {
    id: "c2.equalArea",
    instruction: null,
    defaults: {},
    levels: lv({ area: false }, { area: false }, { area: true }),
    generate(rng, p) {
      const ad = rng.int(3, 6), bc = rng.int(ad + 2, 10), h = rng.int(3, 6), off = rng.int(-1, bc - ad + 1);
      const B = [0, 0], C = [bc * 7, 0], A = [off * 7, -h * 7], D = [(off + ad) * 7, -h * 7];
      const t = (D[0] - A[0]) / ((D[0] - A[0]) + (C[0] - B[0])), O = [A[0] + (C[0] - A[0]) * t, A[1] + (C[1] - A[1]) * t];
      const cen = centroid([A, B, C, D]);
      const items = [seg(A, B), seg(B, C), seg(C, D), seg(D, A), seg(A, C, { w: 0.35 }), seg(B, D, { w: 0.35 }), T_(O[0], O[1] + 4.6, "O", 3.4, { bold: true })];
      for (const [P, s] of [[A, "A"], [B, "B"], [C, "C"], [D, "D"]]) items.push(vLabel(P, cen, s));
      const Qs = rng.shuffle([["△ABCと面積が等しい三角形", "△DBC"], ["△ABDと面積が等しい三角形", "△ACD"], ["△ABOと面積が等しい三角形", "△DCO"]]).slice(0, 2);
      if (p.area) {
        items.push(sideLabel(A, D, cen, `${ad}cm`), sideLabel(B, C, cen, `${bc}cm`));
        Qs.push([`高さが${h}cmのとき、△ABCの面積`, `${bc * h / 2}cm²`]);
      }
      return {
        key: `ea:${ad}:${bc}:${h}:${off}:${Qs.map((q) => q[0])}`,
        text: `${R("下の図の四角形ABCDは、AD∥BCの台形で、点Oは対角線の交点です。")}[[br]]${Qs.map((q, i) => `(${i + 1}) ${R(q[0])}`).join("[[br]]")}`,
        figure: fitDraw(items),
        answer: { display: Qs.map((q, i) => `(${i + 1}) ${q[1]}`).join("　") },
        workspace: { type: "lines", labels: Qs.map((_, i) => `(${i + 1})`) },
        side: true,
        meta: {}
      };
    }
  };
  Object.assign(RUBY, { 面積: "めんせき", 高さが: "{高|たか}さが" });
