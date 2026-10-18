  // ============================================================
  // 3 複素数平面 ・ 4 平面上の曲線
  // ============================================================
var kouCb = (() => {
  const K = kouLib;
  const { Q, qa, qs, qm, qd, qneg, qeq, qabs, isInt, qv, num, absTex, gcd, lv, nz, X, V, evalH, near, pTex, sg, rootTex, surdTex, gen, redo, pickN, ptN, ptQ, draw, T_, L_, planeR, curve, dotAt, RED, sup } = K;
  const H = K.kC.H, surdAns = K.k1.surdAns, radTex = K.k2.radTex;
  const I = V("i"), z = V("z");
  // a＋bi(a, b は小数):値から √ もふくむ形にする
  const cStr = (re, im) => {
    const zr = Math.abs(re) < 1e-12, zi = Math.abs(im) < 1e-12;
    const r = zr ? "" : surdAns("", re), m = zi ? "" : surdAns("", Math.abs(im));
    if (!zr && !r || !zi && !m) return null;
    if (zr && zi) return "0";
    const compound = m && !/^\[\[f:/.test(m) && /[＋－]/.test(m.slice(1));
    const mt = m ? (m === "1" ? I : compound ? `(${m})${I}` : `${m}${I}`) : "";
    if (!r) return (im < 0 ? "－" : "") + mt;
    return r + (m ? (im < 0 ? "－" : "＋") + mt : "");
  };
  // 複素数の答え(文字)を値に:i に 0 と 1 を入れる
  const cVal = (s) => {
    const a = evalH(s, { i: 0 });
    return [a, evalH(s, { i: 1 }) - a];
  };
  // 特別な複素数(値と書き方)
  const ZS = [
    ["1＋[[v:i]]", 1, 1], ["1－[[v:i]]", 1, -1], ["－1＋[[v:i]]", -1, 1], ["－1－[[v:i]]", -1, -1],
    ["√{3}＋[[v:i]]", Math.sqrt(3), 1], ["1＋√{3}[[v:i]]", 1, Math.sqrt(3)], ["－√{3}＋[[v:i]]", -Math.sqrt(3), 1], ["1－√{3}[[v:i]]", 1, -Math.sqrt(3)], ["－1－√{3}[[v:i]]", -1, -Math.sqrt(3)], ["√{3}－[[v:i]]", Math.sqrt(3), -1],
    ["2[[v:i]]", 0, 2], ["－3", -3, 0], ["2－2[[v:i]]", 2, -2], ["－2＋2√{3}[[v:i]]", -2, 2 * Math.sqrt(3)], ["3[[v:i]]", 0, 3], ["4", 4, 0]
  ];
  const argQ = (re, im) => {
    let t = Math.atan2(im, re) / Math.PI;
    if (t < 0) t += 2;
    return K.toQ(t);
  };
  const polarTex = (r, aq) => `${r === "1" ? "" : r}(cos ${radTex(aq)}＋${I}sin ${radTex(aq)})`;

  const cplxAbs = gen("kC.cplxAbs", "次の問いに答えましょう。", lv({ types: ["abs", "conj", "dist"] }, { types: ["abs", "dist", "prod", "conjCalc"] }, { types: ["prod", "pow", "conjCalc", "dist"] }), (rng, type) => {
    const a = rng.int(-5, 5), b = nz(rng, -5, 5);
    const zt = K.k2.cTex([Q(a), Q(b)]);
    if (type === "abs") return { text: `|${zt}|`, ans: rootTex(a * a + b * b), meta: { v: Math.hypot(a, b) } };
    if (type === "conj") return { text: `${z}＝${zt} のとき、共役な複素数 [[bar:[[v:z]]]]`, ans: K.k2.cTex([Q(a), Q(-b)]), meta: { c: [a, -b] } };
    if (type === "dist") {
      const c = rng.int(-5, 5), d = rng.int(-5, 5), d2 = (a - c) ** 2 + (b - d) ** 2;
      if (!d2) return null;
      return { text: `複素数平面上の2点 A(${zt})，B(${K.k2.cTex([Q(c), Q(d)])}) 間の距離`, ans: rootTex(d2), meta: { v: Math.sqrt(d2) } };
    }
    if (type === "conjCalc") {
      // z＋z̄ と z z̄
      return { text: `${z}＝${zt} のとき、${z}＋[[bar:[[v:z]]]] と ${z}[[bar:[[v:z]]]] の値`, ans: `${z}＋[[bar:[[v:z]]]]＝${2 * a}，${z}[[bar:[[v:z]]]]＝${a * a + b * b}`, meta: { two: [2 * a, a * a + b * b], a, b } };
    }
    if (type === "prod") {
      const c = nz(rng, -4, 4), d = nz(rng, -4, 4);
      return { text: `|(${zt})(${K.k2.cTex([Q(c), Q(d)])})|`, ans: rootTex((a * a + b * b) * (c * c + d * d)), meta: { v: Math.hypot(a, b) * Math.hypot(c, d) } };
    }
    const n = rng.int(3, 6);
    return { text: `|(${zt})[[^${n}]]|`, ans: (() => {
      const n2 = (a * a + b * b) ** n;
      return rootTex(n2);
    })(), meta: { v: Math.hypot(a, b) ** n } };
  }, (pr) => {
    const m = pr.meta, d = pr.answer.display;
    if (m.v !== undefined) return near(evalH(d), m.v) ? null : "絶対値が合わない";
    if (m.c) {
      const [re, im] = cVal(d);
      return near(re, m.c[0]) && near(im, m.c[1]) ? null : "共役が合わない";
    }
    return m.two[0] === 2 * m.a && m.two[1] === m.a ** 2 + m.b ** 2 ? null : "値が合わない";
  }, { work: 20 });

  const polar = gen("kC.polar", "次の複素数を極形式で表しましょう。ただし、偏角 θ は 0≦θ＜2π とします。", lv({ types: [0] }, { types: [0] }, { types: [0, 1] }), (rng, type) => {
    if (type === 1) {
      // z ＝ cos α － i sin α などを極形式に
      const aq = rng.pick([Q(1, 6), Q(1, 4), Q(1, 3), Q(2, 3)]);
      const t = qs(Q(2), aq);
      return { text: `cos ${radTex(aq)}－${I}sin ${radTex(aq)}`, ans: polarTex("1", t), meta: { re: Math.cos(qv(aq) * Math.PI), im: -Math.sin(qv(aq) * Math.PI) } };
    }
    const [s, re, im] = rng.pick(ZS), r = rootTex(Math.round(re * re + im * im)), aq = argQ(re, im);
    return { text: s, ans: polarTex(r, aq), meta: { re, im } };
  }, (pr) => {
    const m = pr.meta, d = pr.answer.display;
    const mm = /^(.*?)\(cos (.*)＋\[\[v:i\]\]sin (.*)\)$/.exec(d);
    if (!mm || mm[2] !== mm[3]) return "極形式の形でない";
    const r = mm[1] ? evalH(mm[1]) : 1, th = evalH(mm[2]);
    if (th < 0 || th >= 2 * Math.PI) return "偏角の範囲";
    return near(r * Math.cos(th), m.re) && near(r * Math.sin(th), m.im) ? null : "極形式が合わない";
  }, { work: 26 });

  const deMoivre = gen("kC.deMoivre", "次の式を計算しましょう。", lv({ types: ["pow"] }, { types: ["pow", "pow", "unit"] }, { types: ["pow", "unit", "neg"] }), (rng, type) => {
    if (type === "unit") {
      const aq = rng.pick([Q(1, 6), Q(1, 4), Q(1, 3), Q(1, 12), Q(1, 8)]), n = rng.int(2, 8);
      const th = qv(aq) * Math.PI * n, re = Math.cos(th), im = Math.sin(th);
      const ans = cStr(re, im);
      if (!ans) return null;
      return { text: `(cos ${radTex(aq)}＋${I}sin ${radTex(aq)})[[^${n}]]`, ans, meta: { re, im } };
    }
    const [s, a, b] = rng.pick(ZS.slice(0, 10)), n = type === "neg" ? -rng.int(2, 4) : rng.int(3, 8);
    let re = 1, im = 0;
    const r = Math.hypot(a, b), th = Math.atan2(b, a);
    re = r ** n * Math.cos(n * th), im = r ** n * Math.sin(n * th);
    const ans = cStr(re, im);
    if (!ans || Math.abs(re) > 600 || Math.abs(im) > 600) return null;
    return { text: `(${s})[[^${num(Q(n))}]]`, ans, meta: { re, im } };
  }, (pr) => {
    const [re, im] = cVal(pr.answer.display);
    return near(re, pr.meta.re) && near(im, pr.meta.im) ? null : "計算が合わない";
  }, { work: 30 });

  const rot = gen("kC.rot", "次の問いに答えましょう。", lv({ types: ["orig"] }, { types: ["orig", "center"] }, { types: ["center", "tri", "orig"] }), (rng, type) => {
    const aq = rng.pick([Q(1, 2), Q(1, 3), Q(1, 6), Q(1, 4), Q(1), Q(-1, 2), Q(2, 3)]);
    const th = qv(aq) * Math.PI;
    const a = rng.int(-4, 4), b = rng.int(-4, 4);
    if (!a && !b) return null;
    const zt = K.k2.cTex([Q(a), Q(b)]);
    const dir = aq[0] < 0 ? `原点のまわりに ${radTex(qabs(aq))} だけ時計の針と逆の向きに` : `原点のまわりに ${radTex(aq)} だけ`;
    if (type === "orig") {
      const re = a * Math.cos(th) - b * Math.sin(th), im = a * Math.sin(th) + b * Math.cos(th);
      const ans = cStr(re, im);
      if (!ans) return null;
      return { text: `点 ${zt} を、原点のまわりに ${radTex(aq)} だけ回転した点を表す複素数`, ans, meta: { re, im } };
    }
    if (type === "center") {
      const c = [rng.int(-3, 3), rng.int(-3, 3)];
      if (c[0] === a && c[1] === b) return null;
      const dx = a - c[0], dy = b - c[1];
      const re = c[0] + dx * Math.cos(th) - dy * Math.sin(th), im = c[1] + dx * Math.sin(th) + dy * Math.cos(th);
      const ans = cStr(re, im);
      if (!ans) return null;
      return { text: `点 ${zt} を、点 ${K.k2.cTex([Q(c[0]), Q(c[1])])} を中心として ${radTex(aq)} だけ回転した点を表す複素数`, ans, wide: true, meta: { re, im } };
    }
    // 正三角形の第3の頂点
    const c = [a + rng.int(1, 3), b + rng.int(-2, 2)];
    const dx = c[0] - a, dy = c[1] - b, t3 = Math.PI / 3;
    const out = [1, -1].map((s) => [a + dx * Math.cos(s * t3) - dy * Math.sin(s * t3), b + dx * Math.sin(s * t3) + dy * Math.cos(s * t3)]);
    const ts = out.map(([u, w]) => cStr(u, w));
    if (ts.some((x) => !x)) return null;
    return { text: `複素数平面上の2点 A(${zt})，B(${K.k2.cTex([Q(c[0]), Q(c[1])])}) に対して、△ABC が正三角形となるような点 C を表す複素数`, ans: ts.join("，"), wide: true, meta: { tri: [[a, b], c, out] } };
  }, (pr) => {
    const m = pr.meta;
    if (m.tri) {
      const [A, B, out] = m.tri, d = (P, Q2) => Math.hypot(P[0] - Q2[0], P[1] - Q2[1]);
      const got = pr.answer.display.split("，").map(cVal);
      return got.length === 2 && got.every((C) => near(d(A, C), d(A, B)) && near(d(B, C), d(A, B))) ? null : "正三角形にならない";
    }
    const [re, im] = cVal(pr.answer.display);
    return near(re, m.re) && near(im, m.im) ? null : "回転が合わない";
  }, { work: 30 });

  const rootsZ = gen("kC.roots", "次の方程式を解きましょう。", lv({ ns: [2, 3], Rs: [1, 2] }, { ns: [2, 3, 4], Rs: [1, 2] }, { ns: [3, 4, 6], Rs: [1, 2, 3] }), (rng, type, p) => {
    // z^n ＝ R^n(cos φ ＋ i sin φ)
    const n = rng.pick(p.ns), R = rng.pick(p.Rs), phq = rng.pick([Q(0), Q(1, 2), Q(1), Q(3, 2), Q(1, 3), Q(2, 3), Q(4, 3), Q(5, 3)]);
    if (R ** n > 100) return null;
    const ph = qv(phq) * Math.PI, wr = R ** n * Math.cos(ph), wi = R ** n * Math.sin(ph);
    const wt = cStr(wr, wi);
    if (!wt) return null;
    const sols = [];
    for (let k = 0; k < n; k++) {
      const t = (ph + 2 * Math.PI * k) / n, s2 = cStr(R * Math.cos(t), R * Math.sin(t));
      if (!s2) return null;
      sols.push(s2);
    }
    return { text: `${z}[[^${n}]]＝${wt}`, ans: `${z}＝${sols.join(", ")}`, meta: { n, w: [wr, wi] } };
  }, (pr) => {
    const m = pr.meta, sols = pr.answer.display.replace(/^\[\[v:z\]\]＝/, "").split(", ").map(cVal);
    if (sols.length !== m.n) return "解の個数が合わない";
    for (const [a, b] of sols) {
      const r = Math.hypot(a, b) ** m.n, t = Math.atan2(b, a) * m.n;
      if (!near(r * Math.cos(t), m.w[0]) || !near(r * Math.sin(t), m.w[1])) return "解が合わない";
    }
    return null;
  }, { work: 34 });

  const locusC = gen("kC.locusC", "次の等式を満たす点 [[v:z]] 全体は、どのような図形ですか。", lv({ types: ["circle", "bis"] }, { types: ["circle", "bis", "circle2"] }, { types: ["apol", "circle2", "bis"] }), (rng, type) => {
    const a = rng.int(-3, 3), b = rng.int(-3, 3), al = K.k2.cTex([Q(a), Q(b)]);
    if (type === "circle") {
      const r = rng.int(1, 5);
      const inner = !a && !b ? z : `${z}－(${al})`;
      return { text: `|${inner}|＝${r}`, ans: `点 ${al} を中心とする半径 ${r} の円`, meta: { f: (x, y) => Math.hypot(x - a, y - b) - r, c: [a, b, r] } };
    }
    if (type === "circle2") {
      // |2z－α'|＝r → 中心 α'/2、半径 r/2
      const r = rng.int(2, 6), a2 = 2 * a, b2 = 2 * b;
      return { text: `|2${z}－(${K.k2.cTex([Q(a2), Q(b2)])})|＝${r}`, ans: `点 ${al} を中心とする半径 ${num(Q(r, 2))} の円`, meta: { f: (x, y) => Math.hypot(2 * x - a2, 2 * y - b2) - r, c: [a, b, r / 2] } };
    }
    if (type === "bis") {
      const c = rng.int(-3, 3), d = rng.int(-3, 3);
      if (c === a && d === b) return null;
      const be = K.k2.cTex([Q(c), Q(d)]);
      return { text: `|${z}－(${al})|＝|${z}－(${be})|`, ans: `2点 ${al}，${be} を結ぶ線分の垂直二等分線`, meta: { f: (x, y) => Math.hypot(x - a, y - b) - Math.hypot(x - c, y - d), line: [[a, b], [c, d]] } };
    }
    // |z|＝2|z－k| → 中心 4k/3、半径 2|k|/3
    const k = rng.pick([3, -3, 6, 3]);
    return { text: `|${z}|＝2|${z}－${k < 0 ? `(${k})`.replace("-", "－") : k}|`, ans: `点 ${num(Q(4 * k, 3))} を中心とする半径 ${num(Q(2 * Math.abs(k), 3))} の円`, meta: { f: (x, y) => Math.hypot(x, y) - 2 * Math.hypot(x - k, y), c: [4 * k / 3, 0, 2 * Math.abs(k) / 3] } };
  }, (pr) => {
    const m = pr.meta;
    if (m.c) {
      const [cx, cy, r] = m.c;
      return [0.3, 1.9, 4.1].every((t) => Math.abs(m.f(cx + r * Math.cos(t), cy + r * Math.sin(t))) < 1e-9) ? null : "円が合わない";
    }
    const [[a, b], [c, d]] = m.line, M = [(a + c) / 2, (b + d) / 2], dir = [-(d - b), c - a];
    return [0, 1.3, -2.1].every((t) => Math.abs(m.f(M[0] + dir[0] * t, M[1] + dir[1] * t)) < 1e-9) ? null : "垂直二等分線が合わない";
  }, { work: 26 });
  H["kC.cplxAbs"] = "|a＋bi|＝√{a²＋b²}、z の共役 [[bar:z]]＝a－bi、z[[bar:z]]＝|z|²。2点 α，β 間の距離は |β－α|。";
  H["kC.polar"] = "z＝r(cos θ＋i sin θ)、r＝|z|。点 (a, b) を複素数平面にとって、偏角 θ を読みます。";
  H["kC.deMoivre"] = "ド・モアブルの定理 (cos θ＋i sin θ)[[^n]]＝cos nθ＋i sin nθ。まず極形式に直します。";
  H["kC.rot"] = "原点のまわりに θ 回転するには cos θ＋i sin θ をかけます。点 α のまわりなら z－α を回転してから α を加えます。";
  H["kC.roots"] = "z＝r(cos θ＋i sin θ) とおき、両辺の絶対値と偏角を比べます。偏角は 2π の整数倍のずれも考えます。";
  H["kC.locusC"] = "|z－α|＝r は点 α を中心とする半径 r の円、|z－α|＝|z－β| は2点を結ぶ線分の垂直二等分線です。";

  // ============================================================
  // 4 平面上の曲線
  // ============================================================
  const xx = V("x"), yy = V("y");
  const ell = (a2, b2, sgn = "＋") => `[[f:${xx}²/${a2}]]${sgn}[[f:${yy}²/${b2}]]＝1`;
  const conic = gen("kC.conic", "次の問いに答えましょう。", lv({ types: ["para", "ell"] }, { types: ["para", "ell", "hyp"] }, { types: ["ell", "hyp", "make", "para"] }), (rng, type) => {
    if (type === "para") {
      const p = nz(rng, -4, 4), vert = rng.chance(0.4);
      if (vert) return { text: `放物線 ${xx}²＝${4 * p}${yy} の焦点と準線`, ans: `焦点 (0, ${num(Q(p))})，準線 直線 ${yy}＝${num(Q(-p))}`, meta: { para: [p, true] } };
      return { text: `放物線 ${yy}²＝${4 * p}${xx} の焦点と準線`, ans: `焦点 (${num(Q(p))}, 0)，準線 直線 ${xx}＝${num(Q(-p))}`, meta: { para: [p, false] } };
    }
    const [a, b, c] = rng.pick([[5, 4, 3], [5, 3, 4], [3, 2, null], [4, 2, null], [13, 12, 5], [10, 6, 8], [4, 3, null], [3, 1, null]]);
    if (type === "ell") {
      const sw = rng.chance(0.4);
      const cc = rootTex(a * a - b * b);
      const [A2, B2] = sw ? [b * b, a * a] : [a * a, b * b];
      return { text: `楕円 ${ell(A2, B2)} の焦点の座標と、長軸・短軸の長さ`, ans: sw ? `焦点 (0, ${cc})，(0, －${cc})，長軸 ${2 * a}，短軸 ${2 * b}` : `焦点 (${cc}, 0)，(－${cc}, 0)，長軸 ${2 * a}，短軸 ${2 * b}`, wide: true, meta: { ell: [A2, B2] } };
    }
    if (type === "hyp") {
      const cc = rootTex(a * a + b * b), k = Q(b, a);
      return { text: `双曲線 ${ell(a * a, b * b, "－")} の焦点の座標と漸近線の方程式`, ans: `焦点 (${cc}, 0)，(－${cc}, 0)，漸近線 ${yy}＝${num(k)}${xx}，${yy}＝－${num(k)}${xx}`.replace(/＝1\[\[v:x\]\]/g, "＝[[v:x]]").replace(/＝－1\[\[v:x\]\]/g, "＝－[[v:x]]"), wide: true, meta: { hyp: [a, b] } };
    }
    // 2つの焦点と、長軸の長さから楕円の方程式
    const c2 = rng.int(1, 4), a2 = rng.int(c2 + 1, 6);
    return { text: `2点 (${c2}, 0)，(－${c2}, 0) を焦点とし、長軸の長さが ${2 * a2} の楕円の方程式`, ans: ell(a2 * a2, a2 * a2 - c2 * c2), meta: { make: [a2, c2] } };
  }, (pr) => {
    const m = pr.meta, d = pr.answer.display;
    const pts = [...d.matchAll(/\(([^,()]+), ([^,()]+)\)/g)].map((x) => [evalH(x[1]), evalH(x[2])]);
    if (m.para) {
      const [p, vert] = m.para;
      // 放物線上の点で、焦点までの距離 ＝ 準線までの距離
      for (const t of [0.7, 1.9, -2.3]) {
        const P = vert ? [t, t * t / (4 * p)] : [t * t / (4 * p), t];
        const dF = Math.hypot(P[0] - pts[0][0], P[1] - pts[0][1]), dL = vert ? Math.abs(P[1] + p) : Math.abs(P[0] + p);
        if (!near(dF, dL)) return "焦点・準線が合わない";
      }
      return null;
    }
    if (m.ell) {
      const [A2, B2] = m.ell;
      for (const t of [0.4, 1.7, 3]) {
        const P = [Math.sqrt(A2) * Math.cos(t), Math.sqrt(B2) * Math.sin(t)], s = Math.hypot(P[0] - pts[0][0], P[1] - pts[0][1]) + Math.hypot(P[0] - pts[1][0], P[1] - pts[1][1]);
        if (!near(s, 2 * Math.sqrt(Math.max(A2, B2)))) return "焦点が合わない";
      }
      return null;
    }
    if (m.hyp) {
      const [a, b] = m.hyp;
      for (const t of [0.4, 1.1, -0.8]) {
        const P = [a * Math.cosh(t), b * Math.sinh(t)], s = Math.abs(Math.hypot(P[0] - pts[0][0], P[1] - pts[0][1]) - Math.hypot(P[0] - pts[1][0], P[1] - pts[1][1]));
        if (!near(s, 2 * a)) return "焦点が合わない";
      }
      return null;
    }
    const [a2, c2] = m.make, f = (x, y) => evalH(d.split("＝")[0], { x, y }) - 1;
    for (const t of [0.4, 1.7, 3]) {
      const b = Math.sqrt(a2 * a2 - c2 * c2), P = [a2 * Math.cos(t), b * Math.sin(t)];
      if (Math.abs(f(...P)) > 1e-9) return "楕円が合わない";
    }
    return null;
  }, { work: 26 });

  // 2次曲線のグラフ(図)
  const conicFig = gen("kC.conicFig", null, lv({ types: ["ell", "para"] }, { types: ["ell", "hyp", "para"] }, { types: ["hyp", "ell", "para"] }), (rng, type) => {
    const pl = planeR(-6, 6, -5, 5, 5);
    const items = [...pl.items];
    let ans, tag;
    if (type === "ell") {
      const a = rng.int(2, 6), b = rng.int(1, 4);
      if (a === b || b > 5) return null;
      let d = "";
      for (let i = 0; i <= 120; i++) {
        const t = 2 * Math.PI * i / 120;
        d += `${i ? "L" : "M"}${pl.X(a * Math.cos(t)).toFixed(2)} ${pl.Y(b * Math.sin(t)).toFixed(2)}`;
      }
      items.push({ t: "path", d, w: 0.7 });
      ans = ell(a * a, b * b), tag = `e${a}${b}`;
    } else if (type === "hyp") {
      const a = rng.int(1, 3), b = rng.int(1, 3);
      for (const s of [1, -1]) items.push(curve(pl, (u) => Math.abs(u) < a ? NaN : s * b * Math.sqrt(u * u / (a * a) - 1), -6.2, 6.2, { n: 400 }));
      items.push(curve(pl, (u) => b / a * u, -6.2, 6.2, { w: 0.35, dash: "dash" }), curve(pl, (u) => -b / a * u, -6.2, 6.2, { w: 0.35, dash: "dash" }));
      ans = ell(a * a, b * b, "－"), tag = `h${a}${b}`;
      return { text: "右の図は、双曲線とその漸近線(点線)です。この双曲線の方程式を求めましょう。", fig: draw(pl.w, pl.h, items), ans, side: true, key: `cf:${tag}`, meta: { a, b, kind: "h" } };
    } else {
      const p = nz(rng, -2, 2) / (rng.chance(0.5) ? 1 : 2);
      // y² ＝ 4px:焦点を点で
      let d = "";
      for (let i = 0; i <= 160; i++) {
        const yv = -5 + 10 * i / 160, xv = yv * yv / (4 * p);
        if (Math.abs(xv) > 6.1) continue;
        d += `${d ? "L" : "M"}${pl.X(xv).toFixed(2)} ${pl.Y(yv).toFixed(2)}`;
      }
      items.push({ t: "path", d, w: 0.7 }, dotAt(pl, p, 0), T_(pl.X(p) + 1, pl.Y(0) - 2, "F", 3.2, { bold: true }));
      const pq = K.toQ(p);
      return { text: `右の図は、焦点が F(${num(pq)}, 0) の放物線です。この放物線の方程式を求めましょう。`, fig: draw(pl.w, pl.h, items), ans: `${yy}²＝${num(qm(Q(4), pq))}${xx}`, side: true, key: `cf:p${p}`, meta: { p, kind: "p" } };
    }
    return { text: "右の図の楕円の方程式を求めましょう。", fig: draw(pl.w, pl.h, items), ans, side: true, key: `cf:${tag}`, meta: { tag, kind: "e" } };
  });

  const paramEq = gen("kC.param", "次の媒介変数表示は、どのような曲線を表しますか。[[v:x]]，[[v:y]] の方程式で答えましょう。", lv({ types: ["lin", "para"] }, { types: ["para", "circle", "ell"] }, { types: ["circle", "ell", "hyp", "para"] }), (rng, type) => {
    const t = V("t"), th = "θ";
    if (type === "lin") {
      const a = nz(rng, -3, 3), b = rng.int(-4, 4), c = nz(rng, -3, 3), d = rng.int(-4, 4);
      // x ＝ a t ＋ b, y ＝ c t ＋ d → y ＝ (c/a)(x－b)＋d
      const sl = Q(c, a), ic = qs(Q(d), qm(sl, Q(b)));
      return { text: `${xx}＝${pTex([Q(a), Q(b)], "t")}，${yy}＝${pTex([Q(c), Q(d)], "t")}`, ans: `直線 ${yy}＝${pTex([sl, ic])}`, meta: { P: (s) => [a * s + b, c * s + d] } };
    }
    if (type === "para") {
      const a = rng.int(-3, 3), b = rng.int(-4, 4), k = rng.pick([1, 2]);
      return { text: `${xx}＝${pTex([Q(1), Q(a)], "t")}，${yy}＝${k === 1 ? "" : k}${t}²${b ? sg(b) : ""}`, ans: `放物線 ${yy}＝${k === 1 ? "" : k}(${pTex([Q(1), Q(-a)])})²${b ? sg(b) : ""}`.replace("(" + V("x") + ")²", V("x") + "²"), meta: { P: (s) => [s + a, k * s * s + b] } };
    }
    if (type === "circle") {
      const r = rng.int(1, 5), p = rng.int(-3, 3), q = rng.int(-3, 3);
      const sq = (c, L) => c === 0 ? `${V(L)}²` : `(${V(L)}${c < 0 ? "＋" : "－"}${Math.abs(c)})²`;
      return { text: `${xx}＝${r === 1 ? "" : r}cos ${th}${p ? sg(p) : ""}，${yy}＝${r === 1 ? "" : r}sin ${th}${q ? sg(q) : ""}`, ans: `円 ${sq(p, "x")}＋${sq(q, "y")}＝${r * r}`, meta: { P: (s) => [r * Math.cos(s) + p, r * Math.sin(s) + q] } };
    }
    if (type === "ell") {
      const a = rng.int(2, 5), b = rng.int(1, 4);
      if (a === b) return null;
      return { text: `${xx}＝${a}cos ${th}，${yy}＝${b === 1 ? "" : b}sin ${th}`, ans: `楕円 ${ell(a * a, b * b)}`, meta: { P: (s) => [a * Math.cos(s), b * Math.sin(s)] } };
    }
    const a = rng.int(1, 3), b = rng.int(1, 3);
    return { text: `${xx}＝[[f:${a}/cos ${th}]]，${yy}＝${b === 1 ? "" : b}tan ${th}`, ans: `双曲線 ${ell(a * a, b * b, "－")}`, meta: { P: (s) => [a / Math.cos(s), b * Math.tan(s)] } };
  }, (pr) => {
    const m = pr.meta, d = pr.answer.display.replace(/^[^ ]+ /, ""), [l, r] = d.split("＝");
    for (const s of [0.3, 1.1, 2.2]) {
      const [X0, Y0] = m.P(s);
      if (Math.abs(evalH(l, { x: X0, y: Y0 }) - evalH(r, { x: X0, y: Y0 })) > 1e-7) return "曲線が合わない";
    }
    return null;
  }, { work: 28 });

  const polarCoord = gen("kC.polarCoord", "次の問いに答えましょう。", lv({ types: ["toXY", "toPolar"] }, { types: ["toXY", "toPolar", "eq"] }, { types: ["eq", "eq2", "toPolar"] }), (rng, type) => {
    if (type === "toXY") {
      const r = rng.int(1, 6), aq = rng.pick([Q(1, 6), Q(1, 4), Q(1, 3), Q(1, 2), Q(2, 3), Q(3, 4), Q(5, 6), Q(1), Q(7, 6), Q(5, 4), Q(4, 3), Q(3, 2), Q(5, 3), Q(7, 4), Q(11, 6)]);
      const th = qv(aq) * Math.PI, X0 = r * Math.cos(th), Y0 = r * Math.sin(th);
      const xs = surdAns("", X0) ?? "0", ys = surdAns("", Y0) ?? "0";
      return { text: `極座標が (${r}, ${radTex(aq)}) である点の直交座標`, ans: `(${Math.abs(X0) < 1e-12 ? "0" : xs}, ${Math.abs(Y0) < 1e-12 ? "0" : ys})`, meta: { P: [X0, Y0], toXY: true } };
    }
    if (type === "toPolar") {
      const [s, re, im] = rng.pick(ZS.filter((u) => u[1] || u[2]));
      const r = rootTex(Math.round(re * re + im * im)), aq = (() => {
        let t = Math.atan2(im, re) / Math.PI;
        if (t < 0) t += 2;
        return K.toQ(t);
      })();
      const xs = surdAns("", re) ?? "0", ys = surdAns("", im) ?? "0";
      return { text: `直交座標が (${Math.abs(re) < 1e-12 ? "0" : xs}, ${Math.abs(im) < 1e-12 ? "0" : ys}) である点の極座標 (${V("r")}, θ)(0≦θ＜2π)`, ans: `(${r}, ${radTex(aq)})`, meta: { P: [re, im] } };
    }
    if (type === "eq") {
      const T = rng.pick([[`${V("r")}＝${rng.int(2, 5)}`, (m) => `${xx}²＋${yy}²＝${m * m}`], [`${V("r")}cos θ＝${rng.int(1, 4)}`, (m) => `${xx}＝${m}`], [`${V("r")}sin θ＝${rng.int(1, 4)}`, (m) => `${yy}＝${m}`]]);
      const m = Number(T[0].match(/＝(\d+)$/)[1]);
      return { text: `極方程式 ${T[0]} を直交座標の方程式で表す`, ans: T[1](m), meta: { pe: T[0], m } };
    }
    // r ＝ 2a cos θ → (x－a)²＋y²＝a²
    const a = rng.int(1, 4), sinV = rng.chance(0.5);
    return { text: `極方程式 ${V("r")}＝${2 * a}${sinV ? "sin" : "cos"} θ を直交座標の方程式で表す`, ans: sinV ? `${xx}²＋(${yy}－${a})²＝${a * a}` : `(${xx}－${a})²＋${yy}²＝${a * a}`, meta: { circ: [a, sinV] } };
  }, (pr) => {
    const m = pr.meta, d = pr.answer.display;
    if (m.P) {
      const mm = /^\((.*), (.*)\)$/.exec(d);
      if (!mm) return "形が合わない";
      if (!m.toXY) {
        const r = evalH(mm[1]), th = evalH(mm[2]);
        return near(r * Math.cos(th), m.P[0]) && near(r * Math.sin(th), m.P[1]) && th >= 0 && th < 2 * Math.PI ? null : "極座標が合わない";
      }
      return near(evalH(mm[1]), m.P[0]) && near(evalH(mm[2]), m.P[1]) ? null : "直交座標が合わない";
    }
    const [l, r] = d.split("＝"), f = (x, y) => evalH(l, { x, y }) - evalH(r, { x, y });
    if (m.circ) {
      const [a, sinV] = m.circ;
      return [0.3, 1.1, 2.6].every((th) => {
        const rr = 2 * a * (sinV ? Math.sin(th) : Math.cos(th));
        return Math.abs(f(rr * Math.cos(th), rr * Math.sin(th))) < 1e-9;
      }) ? null : "直交座標の方程式が合わない";
    }
    const m0 = m.m;
    return [0.3, 1.1, 2.6].every((th) => {
      const rr = /cos/.test(m.pe) ? m0 / Math.cos(th) : /sin/.test(m.pe) ? m0 / Math.sin(th) : m0;
      return Math.abs(f(rr * Math.cos(th), rr * Math.sin(th))) < 1e-7;
    }) ? null : "直交座標の方程式が合わない";
  }, { work: 24 });
  H["kC.conic"] = "放物線 y²＝4px:焦点 (p, 0)、準線 x＝－p。楕円 [[f:x²/a²]]＋[[f:y²/b²]]＝1(a＞b):焦点 (±√{a²－b²}, 0)。双曲線 [[f:x²/a²]]－[[f:y²/b²]]＝1:焦点 (±√{a²＋b²}, 0)、漸近線 y＝±[[f:b/a]]x。";
  H["kC.conicFig"] = "楕円は x 軸・y 軸との交点から a，b を読みます。双曲線は頂点と漸近線の傾き、放物線は焦点の位置から式を作ります。";
  H["kC.param"] = "t(θ)を消去します。cos²θ＋sin²θ＝1、1＋tan²θ＝[[f:1/cos²θ]] を使います。";
  H["kC.polarCoord"] = "x＝r cos θ，y＝r sin θ，r²＝x²＋y²。極方程式の両辺に r をかけると変形しやすくなることがあります。";

  for (const [k, v] of Object.entries(H)) K.hints[k] = X(v);
  return [cplxAbs, polar, deMoivre, rot, rootsZ, locusC, conic, conicFig, paramEq, polarCoord];
})();
kouC.push(...kouCb);

var kouCGrade = (() => {
  const T = (label, generator, kinds, o = {}) => ({ label, generator, kinds, ...o });
  const D = ["drill", "test"], W = ["word", "test"], F = ["figure", "test"];
  const units = [
    ["kC-01", "平面上のベクトル", "ベクトル", [T("ベクトルの成分と計算", "kC.vecCalc", D), T("内積となす角", "kC.dot", D, { weight: 2 }), T("平行・垂直", "kC.vecPara", D), T("位置ベクトル", "kC.divPos", D), T("図形とベクトル", "kC.vecFig", F)], { drill: [8, 10], figure: [2, 10] }],
    ["kC-02", "空間のベクトル", "ベクトル", [T("空間のベクトル", "kC.space", D)], { drill: [10, 10] }],
    ["kC-03", "複素数平面", "平面上の曲線と複素数平面", [T("絶対値と共役", "kC.cplxAbs", D), T("極形式", "kC.polar", D), T("ド・モアブルの定理", "kC.deMoivre", D), T("回転", "kC.rot", D), T("方程式 zⁿ＝α", "kC.roots", D), T("複素数平面上の図形", "kC.locusC", D)], { drill: [10, 10] }],
    ["kC-04", "平面上の曲線", "平面上の曲線と複素数平面", [T("2次曲線", "kC.conic", D, { weight: 2 }), T("2次曲線のグラフ", "kC.conicFig", F), T("媒介変数表示", "kC.param", D), T("極座標と極方程式", "kC.polarCoord", D)], { drill: [8, 10], figure: [2, 10] }]
  ];
  return {
    grade: 15,
    note: "高校 数学C。学習指導要領(平成30年告示)の内容。問題文はすべてこのファイルで作ったもの。",
    units: units.map(([id, name, domain, topics, testPlan], i) => ({ id, order: i + 1, name, rubyName: name, domain, topics, testPlan }))
  };
})();
