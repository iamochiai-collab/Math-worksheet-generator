
  // ============================================================
  // 5 相似な図形
  // ============================================================
  const triSides = (a, b, c, k) => {
    // BC＝a, CA＝b, AB＝c(画面の座標、上向きが負)
    const x = (c * c - b * b + a * a) / (2 * a), y = Math.sqrt(Math.max(0, c * c - x * x));
    return { A: [x * k, -y * k], B: [0, 0], C: [a * k, 0] };
  };
  const transform = (P, th, flip, dx) => {
    const out = {};
    for (const [k, [x, y]] of Object.entries(P)) {
      const x2 = flip ? -x : x;
      out[k] = [x2 * Math.cos(th) - y * Math.sin(th) + dx, x2 * Math.sin(th) + y * Math.cos(th)];
    }
    return out;
  };
  const RATIOS = [[1, 2], [2, 3], [3, 4], [3, 5], [2, 5], [4, 5]];
  Object.assign(RUBY, { 相似比: "そうじひ", 相似: "そうじ", 面積比: "めんせきひ", 体積比: "たいせきひ", 立体: "りったい", 図形: "ずけい", 値: "あたい", 下の図: "{下|した}の{図|ず}" });
  const simRatio = {
    id: "c3.simRatio",
    instruction: null,
    defaults: {},
    levels: lv({ n: 2 }, { n: 3 }, { n: 3 }),
    generate(rng, p) {
      for (let t = 0; t < 300; t++) {
        const [pp, qq] = rng.pick(RATIOS), s = [rng.int(2, 5), rng.int(2, 5), rng.int(2, 5)];
        if (s[0] >= s[1] + s[2] || s[1] >= s[0] + s[2] || s[2] >= s[0] + s[1] || new Set(s).size < 3) continue;
        const L1 = s.map((v) => v * pp), L2 = s.map((v) => v * qq);
        const k2 = 46 / Math.max(...L2), k1 = Math.max(k2, 28 / Math.max(...L1));
        const T1 = triSides(L1[0], L1[1], L1[2], k1), T2 = transform(triSides(L2[0], L2[1], L2[2], k2), rad(rng.int(-30, 30)), rng.chance(0.4), 0);
        const lab1 = { BC: `${L1[0]}cm`, AB: `${L1[2]}cm`, CA: p.n === 3 ? `${V("y")}cm` : null };
        const lab2 = { BC: `${XL}cm`, AB: `${L2[2]}cm`, CA: p.n === 3 ? `${L2[1]}cm` : null };
        const names2 = { A: "D", B: "E", C: "F" };
        const mk = (P, labs, names) => {
          const cen = centroid(Object.values(P)), it = [seg(P.A, P.B), seg(P.B, P.C), seg(P.C, P.A)];
          for (const k of "ABC") it.push(vLabel(P[k], cen, names ? names[k] : k));
          for (const [sd, v] of Object.entries(labs)) if (v) it.push(sideLabel(P[sd[0]], P[sd[1]], cen, v));
          return it;
        };
        const i1 = mk(T1, lab1), i2 = mk(T2, lab2, names2), b1 = fitBox(i1, 0), b2 = fitBox(i2, 0);
        const items = [...i1.map((it) => shiftItem(it, b1.dx, b1.dy)), ...i2.map((it) => shiftItem(it, b2.dx + b1.W + 14, b2.dy))];
        const g = gcd(pp, qq);
        const qs2 = [[R("△ABCと△DEFの相似比を求めましょう。"), `${pp / g}：${qq / g}`], [`${XL}${R("の値を求めましょう。")}`, `${XL}＝${L2[0]}`]];
        if (p.n === 3) qs2.push([`${V("y")}${R("の値を求めましょう。")}`, `${V("y")}＝${L1[1]}`]);
        return {
          key: `sr:${pp}:${qq}:${s}`,
          text: `${R("下の図で、△ABC∽△DEFです。")}[[br]]${qs2.map((q, i) => `(${i + 1}) ${q[0]}`).join("[[br]]")}`,
          figure: fitDraw(items, 5),
          answer: { display: qs2.map((q, i) => `(${i + 1}) ${q[1]}`).join("　") },
          workspace: { type: "lines", labels: qs2.map((_, i) => `(${i + 1})`) },
          meta: { pp, qq, L1, L2 }
        };
      }
      throw new Error("相似の問題が作れない");
    },
    verify(pr) {
      const { pp, qq, L1, L2 } = pr.meta;
      return L1.every((v, i) => v * qq === L2[i] * pp) ? null : "相似比が合わない";
    }
  };

  const simLines = {
    id: "c3.simLines",
    instruction: null,
    defaults: { types: ["tri", "mid"] },
    levels: lv({ types: ["tri", "mid"] }, { types: ["tri", "tri2", "three", "mid"] }, { types: ["tri2", "three", "mid", "tri"] }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx);
      for (let t = 0; t < 300; t++) {
        if (type === "three") {
          const a = rng.int(2, 6), b = rng.int(2, 8), m = rng.pick([1, 1.5, 2, 2.5, 3]);
          const c = a * m, x = b * m;
          if (!Number.isInteger(c) || !Number.isInteger(x) || a === b) continue;
          const ys3 = [0, 18, 18 + 18 * b / a];
          const P1 = ys3.map((y) => [20 + y * 0.35, y]), P2 = ys3.map((y) => [70 + y * 0.9, y]);
          const items = [];
          ys3.forEach((y, i) => items.push(L_(5, y, 120, y, { w: 0.5 }), T_(123, y + 1.3, ["ℓ", V("m"), V("n")][i], 3.8, { bold: true })));
          items.push(L_(P1[0][0] - 3, -6, P1[2][0] + 3, ys3[2] + 6, { w: 0.6 }), L_(P2[0][0] - 6, -6, P2[2][0] + 6, ys3[2] + 6, { w: 0.6 }));
          items.push(T_(P1[0][0] + 3.5, ys3[1] / 2 + 1.2, `${a}cm`, 3.3, { anchor: "start" }), T_(P1[1][0] + 4, (ys3[1] + ys3[2]) / 2 + 1.2, `${b}cm`, 3.3, { anchor: "start" }));
          items.push(T_(P2[0][0] + 9, ys3[1] / 2 + 1.2, `${c}cm`, 3.3, { anchor: "start" }), T_(P2[1][0] + 12, (ys3[1] + ys3[2]) / 2 + 1.2, `${XL}cm`, 3.3, { anchor: "start" }));
          return { key: `sl:3:${a}:${b}:${c}`, text: `${R("下の図で、")}ℓ∥${V("m")}∥${V("n")}${R("のとき、")}${XL}${R("の値を求めましょう。")}`, figure: fitDraw(items, 6), answer: { display: `${XL}＝${x}` }, workspace: { type: "none" }, meta: { a, b, c, x } };
        }
        const B = [0, 0], C = [rng.int(60, 80), 0], A = [rng.int(10, 50), -rng.int(40, 55)];
        if (type === "mid") {
          const k = rng.int(3, 9), half = rng.chance(0.5);
          const M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], N = [(A[0] + C[0]) / 2, (A[1] + C[1]) / 2], cen = centroid([A, B, C]);
          const items = [seg(A, B), seg(B, C), seg(C, A), seg(M, N), vLabel(A, cen, "A"), vLabel(B, cen, "B"), vLabel(C, cen, "C"), T_(M[0] - 3.4, M[1] + 1.3, "M", 3.6, { bold: true }), T_(N[0] + 3.4, N[1] + 1.3, "N", 3.6, { bold: true }), ...ticks(A, M, 1), ...ticks(M, B, 1), ...ticks(A, N, 2), ...ticks(N, C, 2)];
          items.push(T_((B[0] + C[0]) / 2, 5.4, half ? `${2 * k}cm` : `${XL}cm`, 3.3), T_((M[0] + N[0]) / 2, M[1] - 2, half ? `${XL}cm` : `${k}cm`, 3.3));
          return { key: `sl:m:${k}:${half}:${A}`, text: `${R("下の図で、点M，Nはそれぞれ辺AB，ACの中点です。")}${XL}${R("の値を求めましょう。")}`, figure: fitDraw(items), answer: { display: `${XL}＝${half ? k : 2 * k}` }, workspace: { type: "none" }, meta: {} };
        }
        const ad = rng.int(2, 6), db = rng.int(2, 6), tt = ad / (ad + db);
        const D = [A[0] + (B[0] - A[0]) * tt, A[1] + (B[1] - A[1]) * tt], E = [A[0] + (C[0] - A[0]) * tt, A[1] + (C[1] - A[1]) * tt], cen = centroid([A, B, C]);
        const items = [seg(A, B), seg(B, C), seg(C, A), seg(D, E), vLabel(A, cen, "A"), vLabel(B, cen, "B"), vLabel(C, cen, "C"), T_(D[0] - 3.4, D[1] + 1.3, "D", 3.6, { bold: true }), T_(E[0] + 3.4, E[1] + 1.3, "E", 3.6, { bold: true })];
        const sl = (P1, P2, s) => {
          const mx = (P1[0] + P2[0]) / 2, my = (P1[1] + P2[1]) / 2, dx = mx - cen[0], dy = my - cen[1], l = Math.hypot(dx, dy);
          return T_(mx + dx / l * 4.4, my + dy / l * 4.4 + 1.2, s, 3.3);
        };
        if (type === "tri") {
          const m = rng.pick([1, 2, 3]), ae = ad * m, ec = db * m;
          items.push(sl(A, D, `${ad}cm`), sl(D, B, `${db}cm`), sl(A, E, `${ae}cm`), sl(E, C, `${XL}cm`));
          return { key: `sl:t:${ad}:${db}:${m}:${A}`, text: `${R("下の図で、")}DE∥BC${R("のとき、")}${XL}${R("の値を求めましょう。")}`, figure: fitDraw(items), answer: { display: `${XL}＝${ec}` }, workspace: { type: "none" }, meta: {} };
        }
        const bc = (ad + db) * rng.int(1, 3), de = bc * ad / (ad + db);
        if (!Number.isInteger(de)) continue;
        items.push(sl(A, D, `${ad}cm`), sl(D, B, `${db}cm`), T_((B[0] + C[0]) / 2, 5.4, `${bc}cm`, 3.3), T_((D[0] + E[0]) / 2, D[1] - 2, `${XL}cm`, 3.3));
        return { key: `sl:t2:${ad}:${db}:${bc}:${A}`, text: `${R("下の図で、")}DE∥BC${R("のとき、")}${XL}${R("の値を求めましょう。")}`, figure: fitDraw(items), answer: { display: `${XL}＝${de}` }, workspace: { type: "none" }, meta: {} };
      }
      throw new Error("平行線と線分の比の問題が作れない");
    }
  };
  Object.assign(RUBY, { 中点: "ちゅうてん", 点: "てん", 辺: "へん", それぞれ: "それぞれ" });

  const areaVolRatio = {
    id: "c3.areaVolRatio",
    instruction: R("次の問いに答えましょう。"),
    defaults: { types: ["area", "vol"] },
    levels: lv({ types: ["area", "vol", "surf"] }, { types: ["area", "vol", "fromArea", "areaCalc", "surf"] }, { types: ["fromArea", "areaCalc", "volCalc", "fromVol"] }),
    generate(rng, p, ctx) {
      const type = rng.pick(p.types);
      for (let t = 0; t < 200; t++) {
        const [a, b] = rng.pick(RATIOS.concat([[1, 3], [5, 6], [3, 7], [1, 4], [2, 7], [3, 8], [5, 7], [4, 7], [5, 8]]));
        if (type === "surf") return { key: `av:s:${a}:${b}`, text: R(`相似比が${a}：${b}の2つの立体の表面積の比`), answer: { display: `${a * a}：${b * b}` }, workspace: { type: "none" }, meta: {} };
        if (type === "area") return { key: `av:a:${a}:${b}`, text: R(`相似比が${a}：${b}の2つの図形の面積比`), answer: { display: `${a * a}：${b * b}` }, workspace: { type: "none" }, meta: {} };
        if (type === "vol") return { key: `av:v:${a}:${b}`, text: R(`相似比が${a}：${b}の2つの立体の体積比`), answer: { display: `${a ** 3}：${b ** 3}` }, workspace: { type: "none" }, meta: {} };
        if (type === "fromArea") return { key: `av:fa:${a}:${b}`, text: R(`面積比が${a * a}：${b * b}である相似な2つの図形の相似比`), answer: { display: `${a}：${b}` }, workspace: { type: "none" }, meta: {} };
        if (type === "fromVol") return { key: `av:fv:${a}:${b}`, text: R(`体積比が${a ** 3}：${b ** 3}である相似な2つの立体の相似比`), answer: { display: `${a}：${b}` }, workspace: { type: "none" }, meta: {} };
        if (type === "areaCalc") {
          const S1 = a * a * rng.int(1, 5);
          return { key: `av:ac:${a}:${b}:${S1}`, text: R(`相似比が${a}：${b}の2つの三角形で、小さいほうの面積が${S1}cm²のとき、大きいほうの面積`), wide: true, answer: { display: `${S1 / (a * a) * b * b}cm²` }, workspace: { type: "none" }, meta: {} };
        }
        const V1 = a ** 3 * rng.int(1, 3);
        return { key: `av:vc:${a}:${b}:${V1}`, text: R(`相似比が${a}：${b}の2つの立体で、小さいほうの体積が${V1}cm³のとき、大きいほうの体積`), wide: true, answer: { display: `${V1 / a ** 3 * b ** 3}cm³` }, workspace: { type: "none" }, meta: {} };
      }
      throw new Error("面積比の問題が作れない");
    }
  };
  Object.assign(RUBY, { 表面積: "ひょうめんせき", 三角形: "さんかくけい", 小さいほう: "{小|ちい}さいほう", 大きいほう: "{大|おお}きいほう", 面積: "めんせき", 体積: "たいせき" });

  const SIM_PROOF = [
    {
      t: "下の図で、DE∥BCのとき、△ADE∽△ABCであることを証明します。［ア］〜［エ］にあてはまるものを答えましょう。",
      body: ["〔証明〕△ADEと△ABCで、", "DE∥BCより、［ア］は等しいから　∠ADE＝∠ABC…①", "［イ］は共通…②", "①，②より、［ウ］がそれぞれ等しいから", "△ADE∽［エ］"],
      a: ["同位角", "∠A", "2組の角", "△ABC"],
      fig: () => {
        const A = [40, 4], B = [8, 60], C = [86, 60], D = [24, 32], E = [63, 32], cen = [45, 40];
        return [seg(A, B), seg(B, C), seg(C, A), seg(D, E), vLabel(A, cen, "A"), vLabel(B, cen, "B"), vLabel(C, cen, "C"), T_(D[0] - 3.4, D[1] + 1.3, "D", 3.6, { bold: true }), T_(E[0] + 3.4, E[1] + 1.3, "E", 3.6, { bold: true })];
      }
    },
    {
      t: "下の図で、点Dは辺AB上の点で、∠ACD＝∠ABCです。このとき、△ACD∽△ABCであることを証明します。［ア］〜［エ］にあてはまるものを答えましょう。",
      body: ["〔証明〕△ACDと△ABCで、", "仮定から　∠ACD＝［ア］…①", "∠Aは［イ］…②", "①，②より、［ウ］がそれぞれ等しいから", "△ACD∽［エ］"],
      a: ["∠ABC", "共通", "2組の角", "△ABC"],
      fig: () => {
        const A = [10, 58], B = [90, 58], C = [34, 12], D = [33, 58], cen = [45, 42];
        return [seg(A, B), seg(B, C), seg(C, A), seg(C, D), vLabel(A, cen, "A"), vLabel(B, cen, "B"), vLabel(C, cen, "C"), T_(D[0], D[1] + 5, "D", 3.6, { bold: true })];
      }
    },
    {
      t: "下の図で、線分ACとBDが点Oで交わり、AO：CO＝BO：DOです。このとき、△AOB∽△CODであることを証明します。［ア］〜［エ］にあてはまるものを答えましょう。",
      body: ["〔証明〕△AOBと△CODで、", "仮定から　AO：CO＝［ア］…①", "［イ］は等しいから　∠AOB＝∠COD…②", "①，②より、［ウ］がそれぞれ等しいから", "△AOB∽［エ］"],
      a: ["BO：DO", "対頂角", "2組の辺の比とその間の角", "△COD"],
      fig: () => {
        const O = [42, 30], A = [10, 8], B = [8, 46], C = [90, 62], D = [92, 6];
        return [seg(A, B), seg(C, D), seg(A, C), seg(B, D), vLabel(A, O, "A"), vLabel(B, O, "B"), vLabel(C, O, "C"), vLabel(D, O, "D"), T_(O[0] + 4.6, O[1] + 1.3, "O", 3.6, { bold: true })];
      }
    }
  ];
  Object.assign(RUBY, { 証明します: "{証明|しょうめい}します", 証明: "しょうめい", 仮定から: "{仮定|かてい}から", 共通: "きょうつう", 同位角: "どういかく", 対頂角: "たいちょうかく", 組: "くみ", 角: "かく", 比: "ひ", 間: "あいだ", 交わり: "{交|まじ}わり", 線分: "せんぶん", 上: "じょう", 等しい: "{等|ひと}しい", あてはまる: "あてはまる" });
  const simProof = {
    id: "c3.simProof",
    instruction: null,
    defaults: {},
    levels: lv({}, {}, {}),
    generate(rng, p, ctx) {
      const i = ctx && Number.isInteger(ctx.index) ? (ctx.index + rng.int(0, 2)) % 3 : rng.int(0, 2), flip = rng.chance(0.5), pf = SIM_PROOF[i];
      let items = pf.fig();
      if (flip) items = items.map((it) => it.t === "line" ? { ...it, x1: 100 - it.x1, x2: 100 - it.x2 } : it.t === "text" ? { ...it, x: 100 - it.x } : it);
      return {
        key: `sp:${i}:${flip}`,
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
  // 6 円
  // ============================================================
  const OC = [40, 40], RC = 28;
  const onC = (deg2) => [OC[0] + RC * Math.cos(rad(deg2)), OC[1] + RC * Math.sin(rad(deg2))];
  const circleBase = () => [{ t: "circle", cx: OC[0], cy: OC[1], r: RC, w: 0.6 }];
  const cLabel = (P, s) => vLabel(P, OC, s, 3.6);
  const inscribed = {
    id: "c3.inscribed",
    instruction: null,
    defaults: { types: ["central", "inscribed", "same", "diam"] },
    levels: lv({ types: ["central", "inscribed", "same"] }, { types: ["central", "inscribed", "same", "diam"] }, { types: ["diam", "cross", "inscribed", "cross"] }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx);
      for (let t = 0; t < 200; t++) {
        const items = circleBase(), base = rng.int(0, 359);
        const dotO = [{ t: "dot", x: OC[0], y: OC[1], r: 0.8 }, T_(OC[0] + 2.4, OC[1] + 4.2, "O", 3.4, { bold: true })];
        if (type === "central" || type === "inscribed" || type === "same") {
          const x = rng.int(5, 14) * 5, A = onC(base), B = onC(base + 2 * x), cAng = base + 2 * x + (360 - 2 * x) * (0.35 + 0.3 * rng.next()), C = onC(cAng);
          items.push(seg(C, A), seg(C, B), cLabel(A, "A"), cLabel(B, "B"), cLabel(C, "C"));
          if (type === "same") {
            const D = onC(base + 2 * x + (360 - 2 * x) * (cAng - base - 2 * x > (360 - 2 * x) / 2 ? 0.2 : 0.8));
            items.push(seg(D, A), seg(D, B), cLabel(D, "D"), ...angMark(C, A, B, deg(x), { r: 6 }), ...angMark(D, A, B, XL, { r: 6 }));
            return { key: `ic:s:${base}:${x}`, text: `${R("下の図で、")}∠${XL}${R("の大きさを求めましょう。")}`, figure: fitDraw(items), answer: { display: deg(x) }, workspace: { type: "none" }, meta: { x } };
          }
          items.push(seg(OC, A), seg(OC, B), ...dotO);
          if (type === "central") items.push(...angMark(OC, A, B, deg(2 * x), { r: 5 }), ...angMark(C, A, B, XL, { r: 6 }));
          else items.push(...angMark(OC, A, B, XL, { r: 5 }), ...angMark(C, A, B, deg(x), { r: 6 }));
          return { key: `ic:${type}:${base}:${x}`, text: `${R("下の図で、点Oは円の中心です。")}∠${XL}${R("の大きさを求めましょう。")}`, figure: fitDraw(items), answer: { display: deg(type === "central" ? x : 2 * x) }, workspace: { type: "none" }, meta: { x } };
        }
        if (type === "diam") {
          const a = rng.int(4, 13) * 5, A = onC(base), B = onC(base + 180), C = onC(base + 180 + 2 * a * (rng.chance(0.5) ? 1 : -1));
          items.push(seg(A, B), seg(A, C), seg(B, C), cLabel(A, "A"), cLabel(B, "B"), cLabel(C, "C"), ...dotO, ...angMark(A, B, C, deg(a), { r: 7 }), ...angMark(B, A, C, XL, { r: 7 }));
          return { key: `ic:d:${base}:${a}`, text: `${R("下の図で、線分ABは円Oの直径です。")}∠${XL}${R("の大きさを求めましょう。")}`, figure: fitDraw(items), answer: { display: deg(90 - a) }, workspace: { type: "none" }, meta: {} };
        }
        // 弦 AC と BD の交点 P
        const a = rng.int(5, 12) * 5, b = rng.int(5, 12) * 5;
        if (a + b > 150) continue;
        const A = onC(base), B = onC(base + 2 * b + 15 + rng.int(0, 30));
        const angB = Math.atan2(B[1] - OC[1], B[0] - OC[0]) * 180 / Math.PI;
        // ∠BAC＝a なので 弧BC＝2a、∠ABD＝b なので 弧AD＝2b(A から見て B と反対まわり)
        const C = onC(angB + 2 * a), D = onC(base - 2 * b);
        const P = rayX(A, Math.atan2(C[1] - A[1], C[0] - A[0]) * 180 / Math.PI, B, Math.atan2(D[1] - B[1], D[0] - B[0]) * 180 / Math.PI);
        const inside = Math.hypot(P[0] - OC[0], P[1] - OC[1]) < RC - 3;
        if (!inside) continue;
        items.push(seg(A, C), seg(B, D), seg(A, B), seg(D, C), cLabel(A, "A"), cLabel(B, "B"), cLabel(C, "C"), cLabel(D, "D"), T_(P[0] + 3, P[1] - 1.6, "P", 3.4, { bold: true }));
        items.push(...angMark(D, B, C, deg(a), { r: 6 }), ...angMark(B, A, D, deg(b), { r: 6 }), ...angMark(P, B, C, XL, { r: 4 }));
        return { key: `ic:c:${base}:${a}:${b}`, text: `${R("下の図で、")}∠${XL}${R("の大きさを求めましょう。")}`, figure: fitDraw(items), answer: { display: deg(a + b) }, workspace: { type: "none" }, meta: {} };
      }
      throw new Error("円周角の問題が作れない");
    }
  };
  Object.assign(RUBY, { 円: "えん", 中心: "ちゅうしん", 直径: "ちょっけい", 大きさ: "{大|おお}きさ", 円周角: "えんしゅうかく", 中心角: "ちゅうしんかく", 弧: "こ", 半円: "はんえん", 等分した: "{等分|とうぶん}した", となり合う: "となり{合|あ}う", 両端: "りょうたん", 長さ: "{長|なが}さ" });

  const inscribedCalc = {
    id: "c3.inscribedCalc",
    instruction: R("次の問いに答えましょう。"),
    defaults: { types: ["c2i", "i2c", "half"] },
    levels: lv({ types: ["c2i", "i2c", "c2i", "i2c", "half"] }, { types: ["c2i", "i2c", "div", "arc"] }, { types: ["div", "arc", "c2i", "i2c"] }),
    generate(rng, p, ctx) {
      const type = rng.pick(p.types);
      if (type === "half") {
        const i = rng.int(0, 2);
        if (i === 2) return { key: "icc:h:2", text: R("円周角の大きさは、同じ弧に対する中心角の大きさの何倍ですか。"), wide: true, answer: { display: `[[f:1/2]]${R("倍")}` }, workspace: { type: "none" }, meta: {} };
        const tx = ["半円の弧に対する円周角の大きさ", "直径を1辺とする三角形で、直径に向かい合う角の大きさ"][i];
        return { key: `icc:h:${i}`, text: R(tx).replace("1{辺|へん}", "1{辺|ぺん}"), answer: { display: "90°" }, workspace: { type: "none" }, meta: {} };
      }
      if (type === "c2i") {
        const c = rng.int(4, 34) * 10;
        return { key: `icc:c:${c}`, text: R(`中心角が${c}°の弧に対する円周角の大きさ`), answer: { display: deg(c / 2) }, workspace: { type: "none" }, meta: {} };
      }
      if (type === "i2c") {
        const a = rng.int(4, 17) * 5;
        return { key: `icc:i:${a}`, text: R(`円周角が${a}°のとき、同じ弧に対する中心角の大きさ`), answer: { display: deg(2 * a) }, workspace: { type: "none" }, meta: {} };
      }
      if (type === "div") {
        const n = rng.pick([4, 5, 6, 8, 9, 10, 12, 15, 18, 20]), k = rng.int(1, Math.min(4, Math.floor(n / 2) - 1) || 1);
        return { key: `icc:d:${n}:${k}`, text: R(`円周を${n}等分した点のうち、${k === 1 ? "となり合う2点" : `間に${k - 1}個の点をはさむ2点`}を両端とする弧(小さいほう)に対する円周角の大きさ`), wide: true, answer: { display: deg(+(180 * k / n).toFixed(1)) }, workspace: { type: "none" }, meta: {} };
      }
      const a = rng.int(3, 14) * 5, k = rng.pick([2, 3]);
      return { key: `icc:a:${a}:${k}`, text: R(`弧ABの長さは弧CDの長さの${k}倍です。弧CDに対する円周角が${a}°のとき、弧ABに対する円周角の大きさ`), wide: true, answer: { display: deg(a * k) }, workspace: { type: "none" }, meta: {} };
    }
  };
  Object.assign(RUBY, { 向かい合う: "{向|む}かい{合|あ}う", 何倍: "なんばい", 倍: "ばい", 円周: "えんしゅう", 間: "あいだ", 個: "こ", 対する: "{対|たい}する" });

  // ============================================================
  // 7 三平方の定理
  // ============================================================
  const sqrtTex = (n) => {
    const [a, b] = sqFree(n);
    return ab(a, b);
  };
  const pythag = {
    id: "c3.pythag",
    instruction: null,
    defaults: { types: ["hyp", "leg"] },
    levels: lv({ types: ["hyp", "leg"] }, { types: ["hyp", "leg", "hyp"] }, { types: ["hyp", "leg", "two"] }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx);
      for (let t = 0; t < 300; t++) {
        if (type === "two") {
          const ad = rng.int(3, 8), bd = rng.int(2, 7), dc = rng.int(2, 8), ab2 = ad * ad + bd * bd, ac2 = ad * ad + dc * dc;
          if (!Number.isInteger(Math.sqrt(ab2))) continue;
          const s = 50 / Math.max(bd + dc, ad);
          const Bp = [0, 0], D = [bd * s, 0], C = [(bd + dc) * s, 0], A = [bd * s, -ad * s], cen = centroid([A, Bp, C]);
          const items = [seg(A, Bp), seg(Bp, C), seg(C, A), seg(A, D), rightMark(D, A, C), vLabel(A, cen, "A"), vLabel(Bp, cen, "B"), vLabel(C, cen, "C"), T_(D[0], 5.2, "D", 3.6, { bold: true })];
          items.push(sideLabel(A, Bp, cen, `${Math.sqrt(ab2)}cm`), T_(bd * s / 2, 5.2, `${bd}cm`, 3.3), T_(D[0] + dc * s / 2, 5.2, `${dc}cm`, 3.3), sideLabel(A, C, cen, `${XL}cm`));
          return { key: `py:2:${ad}:${bd}:${dc}`, text: `${R("下の図で、")}AD⊥BC${R("です。")}${XL}${R("の値を求めましょう。")}`, figure: fitDraw(items), answer: { display: `${XL}＝${sqrtTex(ac2)}` }, workspace: { type: "none" }, meta: { v: Math.sqrt(ac2) } };
        }
        const a = rng.int(1, 9), b = rng.int(1, 9);
        if (type === "leg" && a === b) continue;
        if (Math.max(a, b) > 3 * Math.min(a, b)) continue;
        let leg1, leg2, hyp2;
        if (type === "hyp") [leg1, leg2, hyp2] = [a, b, a * a + b * b];
        else {
          const [h, l] = [Math.max(a, b), Math.min(a, b)];
          [leg1, leg2, hyp2] = [l, Math.sqrt(h * h - l * l), h * h];
        }
        const s = 48 / Math.max(leg1, leg2);
        const Cc = [0, 0], Bp = [leg2 * s, 0], A = [0, -leg1 * s], cen = centroid([A, Bp, Cc]);
        const items = [seg(A, Bp), seg(Bp, Cc), seg(Cc, A), rightMark(Cc, A, Bp)];
        let ans, val;
        if (type === "hyp") {
          items.push(sideLabel(Cc, A, cen, `${leg1}cm`), sideLabel(Cc, Bp, cen, `${leg2}cm`), sideLabel(A, Bp, cen, `${XL}cm`));
          ans = sqrtTex(hyp2);
          val = Math.sqrt(hyp2);
        } else {
          items.push(sideLabel(Cc, A, cen, `${leg1}cm`), sideLabel(A, Bp, cen, `${Math.sqrt(hyp2)}cm`), sideLabel(Cc, Bp, cen, `${XL}cm`));
          ans = sqrtTex(hyp2 - leg1 * leg1);
          val = Math.sqrt(hyp2 - leg1 * leg1);
        }
        return { key: `py:${type}:${leg1}:${leg2}:${hyp2}`, text: `${R("下の直角三角形で、")}${XL}${R("の値を求めましょう。")}`, figure: fitDraw(items), answer: { display: `${XL}＝${ans}` }, workspace: { type: "none" }, meta: { v: val } };
      }
      throw new Error("三平方の定理の問題が作れない");
    },
    verify(pr) {
      return near(evalF(pr.answer.display.split("＝")[1]), pr.meta.v) ? null : "長さが合わない";
    }
  };
  Object.assign(RUBY, { 直角三角形: "ちょっかくさんかくけい" });

  const specialTri = {
    id: "c3.specialTri",
    instruction: null,
    defaults: { types: ["t30h", "t45l"] },
    levels: lv({ types: ["t30s", "t45l"] }, { types: ["t30s", "t30h", "t45l", "t45h"] }, { types: ["t30h", "t30s", "t45h"] }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx), k = rng.int(2, 8);
      // 30°・60°の三角形:短い辺 s、斜辺 2s、長い辺 s√3。45°:辺 a、斜辺 a√2
      let sides, given, items;
      const C = [0, 0];
      if (type.startsWith("t30")) {
        const s0 = 24, A = [0, -s0 * Math.sqrt(3)], B = [s0, 0], cen = centroid([A, B, C]);
        // 短い辺(CB)、長い辺(CA)、斜辺(AB)
        let sh, lo, hy;
        if (type === "t30s") [sh, lo, hy] = [S(Q(k)), S(Q(k), 3), S(Q(2 * k))];
        else if (type === "t30h") [sh, lo, hy] = [S(Q(k)), S(Q(k), 3), S(Q(2 * k))];
        else [sh, lo, hy] = [S(Q(k, 3), 3), S(Q(k)), S(Q(2 * k, 3), 3)];
        const show = type === "t30s" ? "sh" : type === "t30h" ? "hy" : "lo";
        const vals = { sh, lo, hy }, unk = ["sh", "lo", "hy"].filter((s) => s !== show);
        const nm = { [unk[0]]: XL, [unk[1]]: V("y") };
        const lab = (key) => key === show ? `${sTex(vals[key])}cm` : `${nm[key]}cm`;
        items = [seg(A, B), seg(B, C), seg(C, A), rightMark(C, A, B), ...angMark(B, A, C, "60°", { r: 6 }), ...angMark(A, B, C, "30°", { r: 8 }), sideLabel(C, B, cen, lab("sh")), sideLabel(C, A, cen, lab("lo")), sideLabel(A, B, cen, lab("hy"))];
        return { key: `st:${type}:${k}`, text: `${R("下の図で、")}${XL}，${V("y")}${R("の値を求めましょう。")}`, figure: fitDraw(items), answer: { display: `${XL}＝${sTex(vals[unk[0]])}，${V("y")}＝${sTex(vals[unk[1]])}` }, workspace: { type: "lines", labels: [XL, V("y")] }, side: true, meta: { vals: unk.map((u) => sVal(vals[u])), k, type } };
      }
      const s0 = 40, A = [0, -s0], B = [s0, 0], cen = centroid([A, B, C]);
      const leg = type === "t45l" ? S(Q(k)) : S(Q(k, 2), 2), hyp = type === "t45l" ? S(Q(k), 2) : S(Q(k));
      items = [seg(A, B), seg(B, C), seg(C, A), rightMark(C, A, B), ...angMark(B, A, C, "45°", { r: 7 }), ...angMark(A, B, C, "45°", { r: 7 })];
      if (type === "t45l") items.push(sideLabel(C, A, cen, `${k}cm`), sideLabel(C, B, cen, `${V("y")}cm`), sideLabel(A, B, cen, `${XL}cm`));
      else items.push(sideLabel(A, B, cen, `${k}cm`), sideLabel(C, A, cen, `${XL}cm`), sideLabel(C, B, cen, `${V("y")}cm`));
      const xv = type === "t45l" ? hyp : leg;
      return { key: `st:${type}:${k}`, text: `${R("下の図で、")}${XL}，${V("y")}${R("の値を求めましょう。")}`, figure: fitDraw(items), answer: { display: `${XL}＝${sTex(xv)}，${V("y")}＝${sTex(leg)}` }, workspace: { type: "lines", labels: [XL, V("y")] }, side: true, meta: { vals: [sVal(xv), sVal(leg)], k, type } };
    },
    verify(pr) {
      const [x, y] = pr.answer.display.split("，").map((s) => evalF(s.split("＝")[1]));
      return near(x, pr.meta.vals[0]) && near(y, pr.meta.vals[1]) ? null : "辺の長さが合わない";
    }
  };
