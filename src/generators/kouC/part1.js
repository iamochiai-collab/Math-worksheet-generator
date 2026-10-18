// 数学C(学習指導要領の内容の順:ベクトル → 平面上の曲線と複素数平面。教科書の章立てに合わせて 4 単元)
var kouC = (() => {
  const K = kouLib;
  const { Q, qa, qs, qm, qd, qneg, qeq, qabs, isInt, qv, num, absTex, gcd, lv, nz, X, V, evalH, near, sameH, pTex, sg, sgQ, rootTex, surdTex, gen, redo, pickN, ptN, ptQ, draw, T_, L_, arrowHead, fitDraw, centroid, vLabel, planeR, curve, dotAt, RED, sup } = K;
  const H = {};
  const surdAns = K.k1.surdAns, radTex = K.k2.radTex;
  const va = "[[vec:[[v:a]]]]", vb = "[[vec:[[v:b]]]]", vc = "[[vec:[[v:c]]]]";
  const vec = (s) => `[[vec:${s}]]`;
  const cmp2 = (v) => `(${v.map((t) => num(Q(t))).join(", ")})`;
  // 係数つきの和 p a ＋ q b
  const lc = (p, q, A = va, B = vb) => {
    const t = (c, s, first) => c[0] === 0 ? "" : (c[0] < 0 ? "－" : first ? "" : "＋") + (qeq(qabs(c), Q(1)) ? "" : absTex(c)) + s;
    const s = t(p, A, true) + t(q, B, p[0] === 0);
    return s || `[[vec:0]]`;
  };
  // 係数を取り出す(a, b に数を入れる)
  const coefOf = (s, A = "a", B = "b") => {
    const plain = s.replace(/\[\[vec:\[\[v:([a-z])\]\]\]\]/g, "[[v:$1]]");
    const f = (va0, vb0) => evalH(plain, { [A]: va0, [B]: vb0 });
    return [f(1, 0), f(0, 1)];
  };

  // ============================================================
  // 1 平面上のベクトル
  // ============================================================
  const vecCalc = gen("kC.vecCalc", "次の問いに答えましょう。", lv({ types: ["lin", "norm", "ab"] }, { types: ["lin", "norm", "unit", "ab"] }, { types: ["unit", "decomp", "norm", "lin"] }), (rng, type) => {
    const a = [rng.int(-5, 5), rng.int(-5, 5)], b = [rng.int(-5, 5), rng.int(-5, 5)];
    const lead = `${va}＝${cmp2(a)}，${vb}＝${cmp2(b)} のとき、`;
    if (type === "lin") {
      const p = nz(rng, -3, 3), q = nz(rng, -3, 3), r = [p * a[0] + q * b[0], p * a[1] + q * b[1]];
      return { text: `${lead}${lc(Q(p), Q(q))} の成分`, ans: cmp2(r), meta: { r } };
    }
    if (type === "norm") {
      const p = nz(rng, -2, 2), q = nz(rng, -2, 2), r = [p * a[0] + q * b[0], p * a[1] + q * b[1]], n2 = r[0] ** 2 + r[1] ** 2;
      if (!n2) return null;
      return { text: `${lead}|${lc(Q(p), Q(q))}| の値`, ans: rootTex(n2), meta: { v: Math.sqrt(n2) } };
    }
    if (type === "ab") {
      const A = [rng.int(-5, 5), rng.int(-5, 5)], B = [rng.int(-5, 5), rng.int(-5, 5)];
      if (A[0] === B[0] && A[1] === B[1]) return null;
      const d = [B[0] - A[0], B[1] - A[1]];
      return { text: `2点 A${ptN(...A)}，B${ptN(...B)} について、${vec("AB")} の成分と大きさ`, ans: `${cmp2(d)}，|${vec("AB")}|＝${rootTex(d[0] ** 2 + d[1] ** 2)}`, meta: { r: d, v: Math.hypot(...d) } };
    }
    if (type === "unit") {
      const T = rng.pick([[3, 4], [5, 12], [8, 15], [1, 1], [1, 2], [2, 1], [1, 3]]).map((t) => t * (rng.chance(0.5) ? 1 : -1));
      const n2 = T[0] ** 2 + T[1] ** 2, nn = rootTex(n2);
      const comp = T.map((t) => surdAns("", t / Math.sqrt(n2)));
      return { text: `${va}＝${cmp2(T)} と同じ向きの単位ベクトル`, ans: `(${comp.join(", ")})`, meta: { u: T.map((t) => t / Math.sqrt(n2)) } };
    }
    // c ＝ s a ＋ t b となる s, t
    const s = nz(rng, -3, 3), t = nz(rng, -3, 3), c = [s * a[0] + t * b[0], s * a[1] + t * b[1]];
    if (a[0] * b[1] - a[1] * b[0] === 0) return null;
    return { text: `${lead}${vc}＝${cmp2(c)} を [[v:s]]${va}＋[[v:t]]${vb} の形に表す`, ans: lc(Q(s), Q(t)), wide: true, meta: { st: [s, t] } };
  }, (pr) => {
    const m = pr.meta, d = pr.answer.display;
    if (m.st) return coefOf(d).every((v, i) => near(v, m.st[i])) ? null : "係数が合わない";
    if (m.u) {
      const mm = /^\((.*), (.*)\)$/.exec(d);
      return mm && near(evalH(mm[1]), m.u[0]) && near(evalH(mm[2]), m.u[1]) ? null : "単位ベクトルが合わない";
    }
    if (m.r) {
      const mm = /^\(([^,]+), ([^)]+)\)/.exec(d);
      if (!mm || !near(evalH(mm[1]), m.r[0]) || !near(evalH(mm[2]), m.r[1])) return "成分が合わない";
    }
    if (m.v !== undefined) return near(evalH(d.split("＝").pop()), m.v) ? null : "大きさが合わない";
    return null;
  }, { work: 24 });

  const COS = { 0: "1", 30: "[[f:√{3}/2]]", 45: "[[f:1/√{2}]]", 60: "[[f:1/2]]", 90: "0", 120: "－[[f:1/2]]", 135: "－[[f:1/√{2}]]", 150: "－[[f:√{3}/2]]", 180: "－1" };
  const dot = gen("kC.dot", "次の問いに答えましょう。", lv({ types: ["comp", "angle"] }, { types: ["comp", "angle", "normAng"] }, { types: ["normAng", "expand", "angle"] }), (rng, type) => {
    if (type === "comp") {
      const a = [rng.int(-5, 5), rng.int(-5, 5)], b = [rng.int(-5, 5), rng.int(-5, 5)];
      return { text: `${va}＝${cmp2(a)}，${vb}＝${cmp2(b)} のとき、内積 ${va}·${vb}`, ans: String(a[0] * b[0] + a[1] * b[1]), meta: { v: a[0] * b[0] + a[1] * b[1] } };
    }
    if (type === "angle") {
      // なす角が特別な角になる2つのベクトル
      const P = rng.pick([[[1, 0], [1, 1], 45], [[1, 2], [3, 1], 45], [[1, 0], [-1, Math.sqrt(3)], 120], [[2, 1], [-1, 3], 45], [[1, 1], [1, -1], 90], [[1, 3], [2, -1], 0], [[3, 1], [-2, 1], 135], [[1, -2], [3, 1], 0], [[2, -1], [1, 3], 0], [[1, 2], [-3, -1], 135], [[2, 4], [-1, 3], 45], [[1, 3], [-2, -6], 180], [[1, 0], [0, 1], 90], [[2, 0], [1, 1], 45], [[1, 1], [0, -2], 135], [[1, 2], [2, -1], 90], [[2, 1], [1, 3], 45], [[3, 1], [1, 2], 45], [[1, -1], [-2, 0], 135], [[1, 2], [-2, -4], 180]]);
      let [a, b, ang] = P;
      if (b.some((t) => !Number.isInteger(t))) return null;
      const c = (a[0] * b[0] + a[1] * b[1]) / Math.hypot(...a) / Math.hypot(...b), th = Math.round(Math.acos(Math.max(-1, Math.min(1, c))) * 180 / Math.PI);
      if (!COS[th]) return null;
      return { text: `${va}＝${cmp2(a)}，${vb}＝${cmp2(b)} のなす角 θ`, ans: `θ＝${th}°`, meta: { a, b, th } };
    }
    if (type === "normAng") {
      const A = rng.int(1, 6), B = rng.int(1, 6), th = rng.pick([60, 120, 45, 135, 30, 150, 90]);
      const d = A * B * Math.cos(th * Math.PI / 180), dt = surdAns("", d);
      if (!dt) return null;
      return { text: `|${va}|＝${A}，|${vb}|＝${B} で、${va} と ${vb} のなす角が ${th}° のとき、内積 ${va}·${vb}`, ans: dt, meta: { v: d } };
    }
    // |a＋b|、|2a－b| など:|a|, |b|, a·b から
    const A = rng.int(1, 5), B = rng.int(1, 5), ab = rng.int(-A * B + 1, A * B - 1), p = rng.pick([1, 2]), q = rng.pick([1, -1, 2, -3]);
    const n2 = p * p * A * A + 2 * p * q * ab + q * q * B * B;
    if (n2 <= 0) return null;
    return { text: `|${va}|＝${A}，|${vb}|＝${B}，${va}·${vb}＝${ab} のとき、|${lc(Q(p), Q(q))}|`, ans: rootTex(n2), meta: { v: Math.sqrt(n2) } };
  }, (pr) => {
    const m = pr.meta;
    if (m.th !== undefined) {
      const c = (m.a[0] * m.b[0] + m.a[1] * m.b[1]) / Math.hypot(...m.a) / Math.hypot(...m.b);
      return near(c, Math.cos(m.th * Math.PI / 180)) ? null : "なす角が合わない";
    }
    return near(evalH(pr.answer.display), m.v) ? null : "内積が合わない";
  }, { work: 26 });

  const vecPara = gen("kC.vecPara", "次の問いに答えましょう。", lv({ types: ["para", "perp"] }, { types: ["para", "perp", "perpUnit"] }, { types: ["perpUnit", "minNorm", "para"] }), (rng, type) => {
    if (type === "para" || type === "perp") {
      const a = [nz(rng, -5, 5), nz(rng, -5, 5)], k = nz(rng, -6, 6);
      // b ＝ (k, x):a ∥ b → x ＝ k a1/a0、a ⊥ b → x ＝ －k a0/a1
      const xv = type === "para" ? Q(k * a[1], a[0]) : Q(-k * a[0], a[1]);
      return { text: `${va}＝${cmp2(a)}，${vb}＝(${k}, [[v:x]]) が${type === "para" ? "平行" : "垂直"}になるような [[v:x]] の値`, ans: `${V("x")}＝${num(xv)}`, meta: { a, k, x: qv(xv), pp: type } };
    }
    if (type === "perpUnit") {
      const a = rng.pick([[3, 4], [4, -3], [5, 12], [1, 2], [2, -1], [1, 1], [1, -3]]);
      const n = Math.hypot(...a), u = [-a[1] / n, a[0] / n];
      return { text: `${va}＝${cmp2(a)} に垂直な単位ベクトル`, ans: `(${surdAns("", u[0])}, ${surdAns("", u[1])})，(${surdAns("", -u[0])}, ${surdAns("", -u[1])})`, meta: { a } };
    }
    // |a＋tb| の最小値
    const a = [rng.int(-4, 4), rng.int(-4, 4)], b = [nz(rng, -3, 3), rng.int(-3, 3)];
    const bb = b[0] ** 2 + b[1] ** 2, ab = a[0] * b[0] + a[1] * b[1], t0 = Q(-ab, bb), aa = a[0] ** 2 + a[1] ** 2;
    const m2 = qs(Q(aa), Q(ab * ab, bb));
    if (m2[0] <= 0) return null;
    return { text: `${va}＝${cmp2(a)}，${vb}＝${cmp2(b)} のとき、|${va}＋[[v:t]]${vb}| の最小値と、そのときの実数 [[v:t]] の値`, ans: `${V("t")}＝${num(t0)} のとき 最小値 ${surdTex(Q(0), Q(1, m2[1]), m2[0] * m2[1])}`, wide: true, meta: { a, b, t0: qv(t0), m: Math.sqrt(qv(m2)) } };
  }, (pr) => {
    const m = pr.meta;
    if (m.pp) {
      const b = [m.k, m.x];
      return m.pp === "para" ? (Math.abs(m.a[0] * b[1] - m.a[1] * b[0]) < 1e-9 ? null : "平行でない") : (Math.abs(m.a[0] * b[0] + m.a[1] * b[1]) < 1e-9 ? null : "垂直でない");
    }
    if (m.t0 !== undefined) {
      const f = (t) => Math.hypot(m.a[0] + t * m.b[0], m.a[1] + t * m.b[1]);
      return near(f(m.t0), m.m) && f(m.t0 + 0.01) > f(m.t0) && f(m.t0 - 0.01) > f(m.t0) ? null : "最小値が合わない";
    }
    const vs = [...pr.answer.display.matchAll(/\(([^,]+), ([^)]+)\)/g)].map((x) => [evalH(x[1]), evalH(x[2])]);
    return vs.length === 2 && vs.every((u) => near(Math.hypot(...u), 1) && Math.abs(u[0] * m.a[0] + u[1] * m.a[1]) < 1e-9) ? null : "垂直な単位ベクトルが合わない";
  }, { work: 28 });

  // 図形とベクトル(図)。図の中のベクトルの文字は、上に小さい矢印をかく
  const vlab = (x0, y0, L) => [T_(x0, y0, `[[v:${L}]]`, 3.8), L_(x0 - 1.3, y0 - 3.9, x0 + 1.1, y0 - 3.9, { w: 0.25 }), arrowHead(x0 + 1.7, y0 - 3.9, 1, 0, 1)];
  const vecFig = gen("kC.vecFig", null, lv({ types: ["para", "tri"] }, { types: ["para", "tri", "hex"] }, { types: ["tri", "cross", "hex"] }), (rng, type) => {
    const items = [];
    const arr = (P, Qp, o = {}) => {
      const d = [Qp[0] - P[0], Qp[1] - P[1]], l = Math.hypot(...d);
      return [L_(P[0], P[1], Qp[0] - d[0] / l * 1.6, Qp[1] - d[1] / l * 1.6, { w: 0.55, ...o }), arrowHead(Qp[0], Qp[1], d[0], d[1], 2.2, o.color ? { color: o.color } : {})];
    };
    if (type === "para") {
      // 平行四辺形 ABCD、AB＝a、AD＝b。M は辺 ? の中点など
      const A = [8, 34], B = [52, 34], D = [20, 8], C = [B[0] + D[0] - A[0], B[1] + D[1] - A[1]];
      const ask = rng.pick([["BC の中点 M", [Q(1), Q(1, 2)], "M", 0.5, [B, C]], ["CD の中点 N", [Q(1, 2), Q(1)], "N", 0.5, [C, D]], ["対角線の交点 O", [Q(1, 2), Q(1, 2)], "O", 0.5, [A, C]], ["辺 BC を 1：2 に内分する点 P", [Q(1), Q(1, 3)], "P", 1 / 3, [B, C]], ["辺 CD を 2：1 に内分する点 Q", [Q(1, 3), Q(1)], "Q", 2 / 3, [C, D]]]);
      const P = [ask[4][0][0] + (ask[4][1][0] - ask[4][0][0]) * ask[3], ask[4][0][1] + (ask[4][1][1] - ask[4][0][1]) * ask[3]];
      const cen = centroid([A, B, C, D]);
      items.push({ t: "poly", pts: [A, B, C, D], w: 0.45 }, ...arr(A, B), ...arr(A, D), L_(A[0], A[1], P[0], P[1], { w: 0.4, dash: "dash" }), { t: "dot", x: P[0], y: P[1], r: 0.8 }, T_(P[0] + 2.4, P[1] - 1.4, ask[2], 3.4, { bold: true }), vLabel(A, cen, "A"), vLabel(B, cen, "B"), vLabel(C, cen, "C"), vLabel(D, cen, "D"), ...vlab((A[0] + B[0]) / 2, A[1] + 6, "a"), ...vlab((A[0] + D[0]) / 2 - 4, (A[1] + D[1]) / 2, "b"));
      return { text: `平行四辺形 ABCD で、${vec("AB")}＝${va}，${vec("AD")}＝${vb} とします。${ask[0]} について、${vec(`A${ask[2]}`)} を ${va}，${vb} で表しましょう。`, fig: fitDraw(items, 4), ans: lc(...ask[1]), side: true, key: `vf:p:${ask[2]}:${ask[0]}`, meta: { st: ask[1].map(qv), P, A, B, D } };
    }
    if (type === "tri" || type === "cross") {
      // △OAB、OA＝a、OB＝b。AB を m：n に内分する点 P、重心 G
      const O = [8, 36], A = [56, 36], B = [26, 6];
      const m = rng.int(1, 3), n = rng.int(1, 3);
      if (type === "cross") {
        // OA を p：(1－p) に分ける C、OB を q に分ける D、AD と BC の交点 P
        const [pa, pb] = rng.pick([[[1, 2], [1, 3]], [[1, 1], [1, 2]], [[2, 1], [1, 1]], [[1, 2], [2, 1]], [[1, 1], [1, 1]], [[1, 3], [1, 1]]]);
        const p = pa[0] / (pa[0] + pa[1]), q = pb[0] / (pb[0] + pb[1]);
        // OP ＝ s a ＋ t b:A＋u(D－A) ＝ B＋v(C－B)、D ＝ q b、C ＝ p a
        // (1－u) a ＋ u q b ＝ v p a ＋ (1－v) b → 1－u ＝ v p，u q ＝ 1－v
        const u = (1 - p) / (1 - p * q), s = 1 - u, t = u * q;
        const sQ = K.toQ(s), tQ = K.toQ(t);
        const C = [O[0] + (A[0] - O[0]) * p, O[1] + (A[1] - O[1]) * p], D = [O[0] + (B[0] - O[0]) * q, O[1] + (B[1] - O[1]) * q];
        const P = [A[0] + (D[0] - A[0]) * u, A[1] + (D[1] - A[1]) * u];
        const cen = centroid([O, A, B]);
        items.push({ t: "poly", pts: [O, A, B], w: 0.45 }, L_(A[0], A[1], D[0], D[1], { w: 0.4 }), L_(B[0], B[1], C[0], C[1], { w: 0.4 }), { t: "dot", x: P[0], y: P[1], r: 0.8 }, T_(P[0] + 0.5, P[1] - 2.4, "P", 3.4, { bold: true }), vLabel(O, cen, "O"), vLabel(A, cen, "A"), vLabel(B, cen, "B"), T_(C[0], C[1] + 4.4, "C", 3.4, { bold: true }), T_(D[0] - 3.2, D[1], "D", 3.4, { bold: true }));
        return { text: `△OAB で、辺 OA を ${pa[0]}：${pa[1]} に内分する点を C、辺 OB を ${pb[0]}：${pb[1]} に内分する点を D とし、線分 AD と BC の交点を P とします。${vec("OA")}＝${va}，${vec("OB")}＝${vb} とするとき、${vec("OP")} を ${va}，${vb} で表しましょう。`, fig: fitDraw(items, 4), ans: lc(sQ, tQ), side: true, key: `vf:c:${pa}:${pb}`, meta: { st: [s, t] } };
      }
      const g = rng.chance(0.3);
      const cen = centroid([O, A, B]);
      items.push({ t: "poly", pts: [O, A, B], w: 0.45 }, ...arr(O, A), ...arr(O, B), vLabel(O, cen, "O"), vLabel(A, cen, "A"), vLabel(B, cen, "B"), ...vlab((O[0] + A[0]) / 2, O[1] + 6, "a"), ...vlab((O[0] + B[0]) / 2 - 4, (O[1] + B[1]) / 2, "b"));
      if (g) {
        const G = centroid([O, A, B]);
        items.push({ t: "dot", x: G[0], y: G[1], r: 0.8 }, T_(G[0] + 2.4, G[1] - 1, "G", 3.4, { bold: true }), L_(O[0], O[1], G[0], G[1], { w: 0.4, dash: "dash" }));
        return { text: `△OAB の重心を G とします。${vec("OA")}＝${va}，${vec("OB")}＝${vb} とするとき、${vec("OG")} を ${va}，${vb} で表しましょう。`, fig: fitDraw(items, 4), ans: lc(Q(1, 3), Q(1, 3)), side: true, key: "vf:g", meta: { st: [1 / 3, 1 / 3] } };
      }
      const P = [A[0] + (B[0] - A[0]) * m / (m + n), A[1] + (B[1] - A[1]) * m / (m + n)];
      items.push({ t: "dot", x: P[0], y: P[1], r: 0.8 }, T_(P[0] + 2.4, P[1] - 1, "P", 3.4, { bold: true }), L_(O[0], O[1], P[0], P[1], { w: 0.4, dash: "dash" }));
      return { text: `△OAB で、辺 AB を ${m}：${n} に内分する点を P とします。${vec("OA")}＝${va}，${vec("OB")}＝${vb} とするとき、${vec("OP")} を ${va}，${vb} で表しましょう。`, fig: fitDraw(items, 4), ans: lc(Q(n, m + n), Q(m, m + n)), side: true, key: `vf:t:${m}:${n}`, meta: { st: [n / (m + n), m / (m + n)] } };
    }
    // 正六角形 ABCDEF、AB＝a、AF＝b
    const c = [32, 24], R = 18, pts = [0, 1, 2, 3, 4, 5].map((k) => [c[0] + R * Math.cos(Math.PI * (2 / 3 + k / 3)), c[1] + R * Math.sin(Math.PI * (2 / 3 + k / 3))]);
    const names = ["A", "B", "C", "D", "E", "F"];
    // 頂点 X の位置ベクトル(A 基準)を a, b で:AB＝a, AF＝b, AO ＝ a＋b
    const coef = { B: [1, 0], C: [2, 1], D: [2, 2], E: [1, 2], F: [0, 1] }, to = rng.pick(["C", "D", "E"]), from = rng.pick(["A", "B", "F"].filter((s) => s !== to));
    const co = [coef[to][0] - (coef[from] || [0, 0])[0], coef[to][1] - (coef[from] || [0, 0])[1]];
    items.push({ t: "poly", pts, w: 0.45 }, ...arr(pts[0], pts[1]), ...arr(pts[0], pts[5]), ...pts.map((P, i) => vLabel(P, c, names[i])), ...vlab((pts[0][0] + pts[1][0]) / 2 + 3, (pts[0][1] + pts[1][1]) / 2 + 2, "a"), ...vlab((pts[0][0] + pts[5][0]) / 2 - 4, (pts[0][1] + pts[5][1]) / 2, "b"));
    return { text: `正六角形 ABCDEF で、${vec("AB")}＝${va}，${vec("AF")}＝${vb} とします。${vec(from + to)} を ${va}，${vb} で表しましょう。`, fig: fitDraw(items, 4), ans: lc(Q(co[0]), Q(co[1])), side: true, key: `vf:h:${from}${to}`, meta: { st: co } };
  }, (pr) => coefOf(pr.answer.display).every((v, i) => near(v, pr.meta.st[i])) ? null : "係数が合わない", { work: 26 });

  const divPos = gen("kC.divPos", "次の問いに答えましょう。", lv({ types: ["in", "in", "line", "g"] }, { types: ["in", "ex", "line", "g"] }, { types: ["ex", "line", "in"] }), (rng, type) => {
    const m = rng.int(1, 4), n = rng.int(1, 4);
    if (m === n && type === "ex") return null;
    const a = "[[vec:[[v:a]]]]", b = "[[vec:[[v:b]]]]";
    if (type === "in") return { text: `2点 A(${a})，B(${b}) を結ぶ線分 AB を ${m}：${n} に内分する点の位置ベクトル`, ans: lc(Q(n, m + n), Q(m, m + n)), meta: { st: [n / (m + n), m / (m + n)] } };
    if (type === "ex") return { text: `2点 A(${a})，B(${b}) を結ぶ線分 AB を ${m}：${n} に外分する点の位置ベクトル`, ans: lc(Q(-n, m - n), Q(m, m - n)), meta: { st: [-n / (m - n), m / (m - n)] } };
    if (type === "g") return { text: `3点 A(${a})，B(${b})，C(${vc}) を頂点とする △ABC の重心 G の位置ベクトル`, ans: `[[f:1/3]](${a}＋${b}＋${vc})`, meta: { g: true } };
    // 3点が一直線上
    const A = [rng.int(-3, 3), rng.int(-3, 3)], d = [nz(rng, -3, 3), nz(rng, -3, 3)], k = nz(rng, -3, 3), B = [A[0] + d[0], A[1] + d[1]], Cx = A[0] + k * d[0], Cy = A[1] + k * d[1];
    return { text: `3点 A${ptN(...A)}，B${ptN(...B)}，C(${Cx}, [[v:y]]) が一直線上にあるような [[v:y]] の値`, ans: `${V("y")}＝${Cy}`, meta: { A, B, C: [Cx, Cy] } };
  }, (pr) => {
    const m = pr.meta;
    if (m.st) return coefOf(pr.answer.display).every((v, i) => near(v, m.st[i])) ? null : "係数が合わない";
    if (m.C) {
      const [A, B, C2] = [m.A, m.B, m.C];
      return Math.abs((B[0] - A[0]) * (C2[1] - A[1]) - (B[1] - A[1]) * (C2[0] - A[0])) < 1e-9 ? null : "一直線上にない";
    }
    return null;
  }, { work: 24 });
  H["kC.vecCalc"] = "成分ごとに計算します。|(x, y)|＝√{x²＋y²}。単位ベクトルは [[f:[[vec:a]]/|[[vec:a]]|]]。";
  H["kC.dot"] = "[[vec:a]]·[[vec:b]]＝|[[vec:a]]||[[vec:b]]|cos θ＝a₁b₁＋a₂b₂。|[[vec:a]]＋[[vec:b]]|² を展開して内積を使います。";
  H["kC.vecPara"] = "平行:[[vec:b]]＝k[[vec:a]](a₁b₂－a₂b₁＝0)。垂直:[[vec:a]]·[[vec:b]]＝0。|[[vec:a]]＋t[[vec:b]]|² は t の二次関数。";
  H["kC.vecFig"] = "始点をそろえて、平行なベクトルや分点の公式 [[f:n[[vec:a]]＋m[[vec:b]]/m＋n]] を使います。交点は2通りに表して係数を比べます。";
  H["kC.divPos"] = "m：n に内分する点は [[f:n[[vec:a]]＋m[[vec:b]]/m＋n]]、外分は n を －n に。重心は [[f:[[vec:a]]＋[[vec:b]]＋[[vec:c]]/3]]。";

  // ============================================================
  // 2 空間のベクトル
  // ============================================================
  const cmp3 = (v) => `(${v.map((t) => num(Q(t))).join(", ")})`;
  const space = gen("kC.space", "次の問いに答えましょう。", lv({ types: ["dist", "mid", "norm"] }, { types: ["dist", "dot", "angle", "perp"] }, { types: ["angle", "perp", "sphere", "area"] }), (rng, type) => {
    const r3 = () => [rng.int(-4, 4), rng.int(-4, 4), rng.int(-4, 4)];
    const A = r3(), B = r3();
    if (type === "dist") {
      const d2 = A.reduce((s, t, i) => s + (t - B[i]) ** 2, 0);
      if (!d2) return null;
      return { text: `2点 A${cmp3(A)}，B${cmp3(B)} 間の距離`, ans: rootTex(d2), meta: { v: Math.sqrt(d2) } };
    }
    if (type === "mid") {
      const m = rng.int(1, 3), n = rng.int(1, 3), P = A.map((t, i) => Q(n * t + m * B[i], m + n));
      return { text: `2点 A${cmp3(A)}，B${cmp3(B)} を結ぶ線分を ${m}：${n} に内分する点の座標`, ans: `(${P.map(num).join(", ")})`, meta: { P: P.map(qv) } };
    }
    if (type === "norm") {
      const a = r3(), n2 = a.reduce((s, t) => s + t * t, 0);
      if (!n2) return null;
      return { text: `${va}＝${cmp3(a)} の大きさ`, ans: rootTex(n2), meta: { v: Math.sqrt(n2) } };
    }
    if (type === "dot") {
      const a = r3(), b = r3();
      return { text: `${va}＝${cmp3(a)}，${vb}＝${cmp3(b)} の内積`, ans: String(a.reduce((s, t, i) => s + t * b[i], 0)), meta: { v: a.reduce((s, t, i) => s + t * b[i], 0) } };
    }
    if (type === "angle") {
      const P = rng.pick([[[1, 0, 1], [0, 1, 1], 60], [[1, 1, 0], [1, 0, 1], 60], [[1, -1, 0], [0, 1, -1], 120], [[1, 2, 2], [2, 1, -2], 90], [[1, 0, -1], [1, 1, 0], 60], [[2, 1, 1], [1, -1, 2], 60], [[1, 1, 1], [-1, -1, 2], 90], [[0, 1, 1], [1, 0, -1], 120], [[1, 1, 0], [0, 0, 1], 90], [[1, 2, -1], [-1, -2, 1], 180], [[1, 0, 0], [1, 1, 0], 45], [[0, 1, 1], [0, 0, 1], 45], [[1, 1, 1], [1, 1, -2], 90], [[2, 2, 1], [1, -2, 2], 90], [[1, -1, 0], [1, 0, 0], 45], [[1, 0, 1], [-1, 0, 0], 135], [[1, 1, 0], [-1, 0, -1], 120], [[0, 2, 2], [1, 1, 0], 60]]);
      return { text: `${va}＝${cmp3(P[0])}，${vb}＝${cmp3(P[1])} のなす角 θ`, ans: `θ＝${P[2]}°`, meta: { a: P[0], b: P[1], th: P[2] } };
    }
    if (type === "perp") {
      const a = [nz(rng, -3, 3), nz(rng, -3, 3), nz(rng, -3, 3)], b0 = rng.int(-4, 4), b1 = rng.int(-4, 4);
      // a·(b0, b1, x) ＝ 0
      const xv = Q(-(a[0] * b0 + a[1] * b1), a[2]);
      return { text: `${va}＝${cmp3(a)}，${vb}＝(${b0}, ${b1}, [[v:x]]) が垂直になるような [[v:x]] の値`, ans: `${V("x")}＝${num(xv)}`, meta: { a, b: [b0, b1, qv(xv)] } };
    }
    if (type === "sphere") {
      const c = r3(), r2 = rng.pick([1, 4, 9, 16, 5, 10]);
      const sq = (p, L) => p === 0 ? `${V(L)}²` : `(${V(L)}${p < 0 ? "＋" : "－"}${Math.abs(p)})²`;
      const g = `${V("x")}²＋${V("y")}²＋${V("z")}²${[["x", c[0]], ["y", c[1]], ["z", c[2]]].map(([L, p]) => p ? (-2 * p < 0 ? "－" : "＋") + Math.abs(2 * p) + V(L) : "").join("")}${c.reduce((s, t) => s + t * t, 0) - r2 ? sg(c.reduce((s, t) => s + t * t, 0) - r2) : ""}＝0`;
      return { text: `方程式 ${g} が表す球面の中心の座標と半径`, ans: `中心 ${cmp3(c)}，半径 ${rootTex(r2)}`, meta: { c, r2, g } };
    }
    // 三角形の面積 1/2 √(|a|²|b|²－(a·b)²)
    const a = r3(), b = r3();
    const aa = a.reduce((s, t) => s + t * t, 0), bb = b.reduce((s, t) => s + t * t, 0), ab = a.reduce((s, t, i) => s + t * b[i], 0), N = aa * bb - ab * ab;
    if (N <= 0) return null;
    return { text: `${vec("OA")}＝${cmp3(a)}，${vec("OB")}＝${cmp3(b)} のとき、△OAB の面積`, ans: surdTex(Q(0), Q(1, 2), N), meta: { v: Math.sqrt(N) / 2 } };
  }, (pr) => {
    const m = pr.meta, d = pr.answer.display;
    if (m.v !== undefined) return near(evalH(d), m.v) ? null : "値が合わない";
    if (m.P) {
      const mm = /^\((.*), (.*), (.*)\)$/.exec(d);
      return mm && [1, 2, 3].every((i) => near(evalH(mm[i]), m.P[i - 1])) ? null : "座標が合わない";
    }
    if (m.th !== undefined) {
      const dt = m.a.reduce((s, t, i) => s + t * m.b[i], 0), c = dt / Math.hypot(...m.a) / Math.hypot(...m.b);
      return near(c, Math.cos(m.th * Math.PI / 180)) ? null : "なす角が合わない";
    }
    if (m.b) return Math.abs(m.a.reduce((s, t, i) => s + t * m.b[i], 0)) < 1e-9 ? null : "垂直でない";
    const [l, r] = m.g.split("＝"), f = (x, y, z) => evalH(l, { x, y, z });
    return Math.abs(f(m.c[0] + Math.sqrt(m.r2), m.c[1], m.c[2])) < 1e-9 && Math.abs(f(m.c[0], m.c[1], m.c[2] - Math.sqrt(m.r2))) < 1e-9 ? null : "球面が合わない";
  }, { work: 26 });
  H["kC.space"] = "空間でも成分ごとに計算します。2点間の距離 √{(x₂－x₁)²＋(y₂－y₁)²＋(z₂－z₁)²}。△OAB の面積 [[f:1/2]]√{|[[vec:a]]|²|[[vec:b]]|²－([[vec:a]]·[[vec:b]])²}。";

  K.kC = { H, lc, coefOf, cmp2, cmp3 };
  return [vecCalc, dot, vecPara, vecFig, divPos, space];
})();
