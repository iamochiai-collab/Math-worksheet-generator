// 数学Ⅲ(学習指導要領の内容の順:極限 → 微分法 → 積分法。教科書の章立てに合わせて 6 単元)
var kou3 = (() => {
  const K = kouLib;
  const { Q, qa, qs, qm, qd, qneg, qeq, qabs, isInt, qv, num, absTex, gcd, lv, nz, X, V, evalH, near, sameH, pTex, pmul, sg, sgQ, rootTex, surdTex, gen, redo, pickN, ptQ, sup } = K;
  const H = {};
  const surdAns = K.k1.surdAns;
  const x = V("x"), y = V("y"), n = V("n");
  const lin = (a, b, L = "x") => pTex([Q(a), Q(b)], L);
  const fr = (p, q) => `[[f:${p}/${q}]]`;

  // ============================================================
  // 1 関数(分数関数・無理関数・逆関数・合成関数)
  // ============================================================
  const fracFunc = gen("k3.fracFunc", "次の問いに答えましょう。", lv({ types: ["asym", "asym"] }, { types: ["asym", "std", "range"] }, { types: ["std", "range", "inter"] }), (rng, type) => {
    // y ＝ k/(x－p) ＋ q
    const k = nz(rng, -6, 6), p = rng.int(-4, 4), q = rng.int(-4, 4);
    const f = (t) => k / (t - p) + q;
    const base = `${y}＝${k < 0 ? "－" : ""}${fr(Math.abs(k), lin(1, -p))}${q ? sg(q) : ""}`;
    if (type === "asym") return { text: `関数 ${base} のグラフの漸近線`, ans: `直線 ${x}＝${p}，${y}＝${q}`, meta: { f, p, q } };
    if (type === "std") {
      // (qx ＋ (k－pq))/(x－p) の形で出す
      const numr = lin(q, k - p * q), e = `${y}＝${fr(numr, lin(1, -p))}`;
      if (!q) return null;
      return { text: `関数 ${e} のグラフの漸近線`, ans: `直線 ${x}＝${p}，${y}＝${q}`, meta: { f, p, q, e: fr(numr, lin(1, -p)) } };
    }
    if (type === "range") {
      // 定義域 a≦x≦b(p をふくまない)での値域
      const a = p + rng.int(1, 3), b = a + rng.int(1, 3);
      const vs = [f(a), f(b)].sort((u, w) => u - w), [lo, hi] = vs.map((v) => K.toQ(v));
      if (!lo || !hi) return null;
      return { text: `関数 ${base}（${a}≦${x}≦${b}）の値域`, ans: `${num(lo)}≦${y}≦${num(hi)}`, meta: { f, a, b, lo: qv(lo), hi: qv(hi) } };
    }
    // y＝k/(x－p)＋q と直線 y＝x＋c の共有点
    for (let t = 0; t < 40; t++) {
      const r1 = rng.int(-4, 4), r2 = rng.int(-4, 4);
      if (r1 === r2 || r1 === p || r2 === p) continue;
      // 共有点の x 座標が r1, r2 になる直線 y＝mx＋c:f(r1), f(r2) を通る
      const m = Q(f(r2) * (r2 - p) - f(r1) * (r2 - p), 1);
      const sl = (f(r2) - f(r1)) / (r2 - r1), c = f(r1) - sl * r1;
      if (!Number.isInteger(sl) || !Number.isInteger(c) || !Number.isInteger(f(r1)) || !Number.isInteger(f(r2)) || sl === 0) continue;
      const pts = [r1, r2].sort((u, w) => u - w);
      return { text: `関数 ${base} のグラフと直線 ${y}＝${lin(sl, c)} の共有点の座標`, ans: pts.map((t2) => ptQ(Q(t2), Q(f(t2)))).join("，"), wide: true, meta: { f, sl, c, pts } };
    }
    return null;
  }, (pr) => {
    const m = pr.meta;
    if (m.e) {
      for (const t of [m.p + 0.5, m.p - 1.3, m.p + 2.7]) if (!near(evalH(m.e, { x: t }), m.f(t))) return "式の変形が合わない";
    }
    if (m.lo !== undefined) {
      let lo = Infinity, hi = -Infinity;
      for (let t = m.a; t <= m.b + 1e-9; t += 1 / 64) lo = Math.min(lo, m.f(t)), hi = Math.max(hi, m.f(t));
      return near(lo, m.lo) && near(hi, m.hi) ? null : "値域が合わない";
    }
    if (m.pts) return m.pts.every((t) => near(m.f(t), m.sl * t + m.c)) ? null : "共有点が合わない";
    return Math.abs(m.f(m.p + 1e-7)) > 1e5 && Math.abs(m.f(1e9) - m.q) < 1e-6 ? null : "漸近線が合わない";
  }, { work: 30 });

  const invFunc = gen("k3.invFunc", "次の問いに答えましょう。", lv({ types: ["lin", "comp"] }, { types: ["lin", "frac", "comp"] }, { types: ["frac", "sqrt", "comp", "exp"] }), (rng, type) => {
    if (type === "lin") {
      const a = nz(rng, -4, 4), b = rng.int(-6, 6);
      if (Math.abs(a) === 1 && !b) return null;
      const inv = a === 1 ? lin(1, -b) : a === -1 ? lin(-1, b) : `${fr(lin(1, -b), a < 0 ? `－${-a}` : a)}`.replace(`[[f:${lin(1, -b)}/－${-a}]]`, `－${fr(lin(1, -b), -a)}`);
      return { text: `関数 ${y}＝${lin(a, b)} の逆関数`, ans: `${y}＝${inv}`, meta: { f: (t) => a * t + b, g: inv } };
    }
    if (type === "frac") {
      // y ＝ (ax＋b)/(x＋c) → 逆関数 y ＝ (－cx＋b)/(x－a)
      const a = nz(rng, -3, 3), b = rng.int(-5, 5), c = rng.int(-4, 4);
      if (a * c === b) return null;
      const g = fr(lin(-c, b), lin(1, -a));
      return { text: `関数 ${y}＝${fr(lin(a, b), lin(1, c))} の逆関数`, ans: `${y}＝${g}`, meta: { f: (t) => (a * t + b) / (t + c), g } };
    }
    if (type === "sqrt") {
      // y ＝ √(x－a)(x≧a)→ y ＝ x²＋a(x≧0)
      const a = rng.int(-4, 4);
      return { text: `関数 ${y}＝√{${lin(1, -a)}} の逆関数`, ans: `${y}＝${x}²${a ? sg(a) : ""}（${x}≧0）`, meta: { f: (t) => Math.sqrt(t - a), g: `${x}²${a ? sg(a) : ""}`, dom: a } };
    }
    if (type === "exp") {
      const b = rng.pick([2, 3]);
      return { text: `関数 ${y}＝${b}[[^${x}]] の逆関数`, ans: `${y}＝log[[_${b}]]${x}`, meta: { f: (t) => b ** t, g: `log[[_${b}]]${x}` } };
    }
    // 合成関数
    const a = nz(rng, -3, 3), b = rng.int(-4, 4), c = rng.int(-3, 3);
    const which = rng.int(0, 1);
    const fT = lin(a, b), gT = `${x}²${c ? sg(c) : ""}`;
    const res = which ? `(${fT})²${c ? sg(c) : ""}` : `${a === 1 ? "" : a === -1 ? "－" : a}${x}²${a * c + b ? sg(a * c + b) : ""}`;
    return { text: `${V("f")}(${x})＝${fT}，${V("g")}(${x})＝${gT} のとき、(${which ? "g∘f" : "f∘g"})(${x})`.replace("g∘f", `${V("g")}∘${V("f")}`).replace("f∘g", `${V("f")}∘${V("g")}`), ans: res, meta: { comp: true, F: (t) => a * t + b, G: (t) => t * t + c, which, res } };
  }, (pr) => {
    const m = pr.meta;
    if (m.comp) {
      for (const t of [-1.2, 0.4, 2.3]) {
        const want = m.which ? m.G(m.F(t)) : m.F(m.G(t));
        if (!near(evalH(m.res, { x: t }), want)) return "合成関数が合わない";
      }
      return null;
    }
    // g(f(t)) ＝ t
    for (const t of [0.37, 1.9, 3.3, 5.1]) {
      if (m.dom !== undefined && t < m.dom) continue;
      const v = m.f(t);
      if (!Number.isFinite(v)) continue;
      if (!near(evalH(m.g, { x: v }), t)) return "逆関数が合わない";
    }
    return null;
  }, { work: 30 });
  H["k3.fracFunc"] = "y＝[[f:k/x－p]]＋q のグラフは、y＝[[f:k/x]] を平行移動したもので、漸近線は x＝p，y＝q。[[f:ax＋b/cx＋d]] は割り算でこの形にします。";
  H["k3.invFunc"] = "y＝f(x) を x について解き、x と y を入れかえます。定義域と値域も入れかわります。(f∘g)(x)＝f(g(x))。";

  // ============================================================
  // 2 極限
  // ============================================================
  const LN = `[[lim:${n}→∞]]`, LX = (a) => `[[lim:${x}→${a}]]`;
  const seqLim = gen("k3.seqLim", "次の極限を求めましょう。", lv({ types: ["rat", "rat", "geo"] }, { types: ["rat", "root", "geo"] }, { types: ["root", "geo", "ratInf", "sumLim"] }), (rng, type) => {
    if (type === "rat" || type === "ratInf") {
      const d1 = type === "ratInf" ? 2 : rng.int(1, 2), d2 = type === "ratInf" ? 1 : d1;
      const a = nz(rng, -5, 5), c = rng.int(1, 4), b = rng.int(-5, 5), dd = rng.int(-5, 5);
      const nume = d1 === 2 ? pTex([Q(a), Q(b), Q(rng.int(-3, 3))], "n") : lin(a, b, "n"), deno = d2 === 2 ? pTex([Q(c), Q(0), Q(dd)], "n") : lin(c, dd, "n");
      if (type === "ratInf") return { text: `${LN}[[f:${nume}/${deno}]]`, ans: a > 0 ? "∞" : "－∞", meta: { e: `[[f:${nume}/${deno}]]`, inf: a > 0 ? 1 : -1 } };
      return { text: `${LN}[[f:${nume}/${deno}]]`, ans: num(Q(a, c)), meta: { e: `[[f:${nume}/${deno}]]`, v: a / c } };
    }
    if (type === "root") {
      // √(n²＋an) － n → a/2
      const a = nz(rng, -6, 6), k = rng.chance(0.5);
      if (k) return { text: `${LN}(√{${n}²${a < 0 ? "－" : "＋"}${Math.abs(a) === 1 ? "" : Math.abs(a)}${n}}－${n})`, ans: num(Q(a, 2)), meta: { e: `√{${n}²${a < 0 ? "－" : "＋"}${Math.abs(a)}${n}}－${n}`, v: a / 2 } };
      const b = rng.int(1, 9);
      return { text: `${LN}[[f:1/√{${n}＋${b}}－√{${n}}]]`, ans: "∞", meta: { e: `[[f:1/√{${n}＋${b}}－√{${n}}]]`, inf: 1 } };
    }
    if (type === "geo") {
      const [p, q] = rng.pick([[2, 3], [3, 4], [2, 5], [3, 5], [4, 5]]), sw = rng.chance(0.5);
      // (p^n ＋ q^n)/(q^n － p^n) → 1、(q^(n＋1) ＋ p^n)/q^n → q
      if (sw) return { text: `${LN}[[f:${p}[[^${n}]]＋${q}[[^${n}]]/${q}[[^${n}]]－${p}[[^${n}]]]]`, ans: "1", meta: { e: `[[f:${p}[[^${n}]]＋${q}[[^${n}]]/${q}[[^${n}]]－${p}[[^${n}]]]]`, v: 1 } };
      return { text: `${LN}[[f:${q}[[^${n}＋1]]－${p}[[^${n}]]/${q}[[^${n}]]＋${p}[[^${n}]]]]`, ans: String(q), meta: { e: `[[f:${q}[[^${n}＋1]]－${p}[[^${n}]]/${q}[[^${n}]]＋${p}[[^${n}]]]]`, v: q } };
    }
    // Σ k / n² など:1＋2＋…＋n / n²
    return { text: `${LN}[[f:1＋2＋3＋…＋${n}/${n}²]]`, ans: "[[f:1/2]]", meta: { f: (N) => N * (N + 1) / 2 / (N * N), v: 0.5 } };
  }, (pr) => {
    const m = pr.meta;
    const at0 = (N) => m.f ? m.f(N) : evalH(m.e, { n: N });
    const at = (N) => Number.isFinite(at0(N)) ? at0(N) : at0(N > 1e5 ? 300 : N);
    if (m.inf) return Math.sign(at(1e6)) === m.inf && Math.abs(at(1e6)) > Math.abs(at(1e3)) ? null : "∞ にならない";
    return Math.abs(at(1e7) - m.v) < 1e-3 && near(evalH(pr.answer.display), m.v) ? null : "極限が合わない";
  }, { work: 26 });

  const series = gen("k3.series", "次の問いに答えましょう。", lv({ types: ["geoSum", "geoSum"] }, { types: ["geoSum", "cond", "tele"] }, { types: ["cond", "tele", "geoX"] }), (rng, type) => {
    if (type === "geoSum") {
      const a = nz(rng, -6, 8), r = rng.pick([Q(1, 2), Q(-1, 2), Q(1, 3), Q(-1, 3), Q(2, 3), Q(1, 4), Q(3, 4)]);
      const terms = [0, 1, 2].map((k) => qm(Q(a), K.qpow(r, k)));
      const S = qd(Q(a), qs(Q(1), r));
      return { text: `無限等比級数 ${terms.map(num).join("＋").replace(/＋－/g, "－")}＋… の和`, ans: num(S), meta: { a, r: qv(r), S: qv(S) } };
    }
    if (type === "cond") {
      // Σ (x－c)^(n－1) が収束する x の範囲 → |x－c|＜1
      const c = rng.int(-3, 3), k = rng.pick([1, 2]);
      const rr = k === 1 ? lin(1, -c) : fr(lin(1, -c), 2);
      const lo = c - k, hi = c + k;
      return { text: `無限等比級数 1＋(${rr})＋(${rr})²＋… が収束するような [[v:x]] の値の範囲`, ans: `${lo}＜${x}＜${hi}`, meta: { lo, hi, c, k } };
    }
    if (type === "geoX") {
      // 収束するとき x(初項) と公比 (1－x) で、和
      return { text: `無限級数 [[sum:[[v:n]]＝1:∞]][[f:1/[[v:n]]([[v:n]]＋1)]] の和`, ans: "1", meta: { tele: (N) => 1 / (N * (N + 1)), S: 1 } };
    }
    const d = rng.pick([1, 2]);
    if (d === 2) return { text: `無限級数 [[sum:[[v:n]]＝1:∞]][[f:1/(2[[v:n]]－1)(2[[v:n]]＋1)]] の和`, ans: "[[f:1/2]]", meta: { tele: (N) => 1 / ((2 * N - 1) * (2 * N + 1)), S: 0.5 } };
    return { text: `無限級数 [[sum:[[v:n]]＝1:∞]][[f:1/[[v:n]]([[v:n]]＋2)]] の和`, ans: "[[f:3/4]]", meta: { tele: (N) => 1 / (N * (N + 2)), S: 0.75 } };
  }, (pr) => {
    const m = pr.meta;
    if (m.tele) {
      let s = 0;
      for (let N = 1; N <= 200000; N++) s += m.tele(N);
      return Math.abs(s - m.S) < 1e-4 && near(evalH(pr.answer.display), m.S) ? null : "和が合わない";
    }
    if (m.lo !== undefined) {
      for (let t = m.lo - 2; t <= m.hi + 2; t += 0.25) {
        const r = (t - m.c) / m.k, want = Math.abs(r) < 1, got = t > m.lo && t < m.hi;
        if (want !== got) return "範囲が合わない";
      }
      return null;
    }
    let s = 0;
    for (let k = 0; k < 400; k++) s += m.a * m.r ** k;
    return Math.abs(s - m.S) < 1e-9 && near(evalH(pr.answer.display), m.S) ? null : "和が合わない";
  }, { work: 26 });

  const funcLim = gen("k3.funcLim", "次の極限を求めましょう。", lv({ types: ["fact", "fact", "root"] }, { types: ["fact", "root", "trig", "inf"] }, { types: ["trig", "trig2", "root", "e"] }), (rng, type) => {
    if (type === "fact") {
      const a = rng.int(-3, 3), b = nz(rng, -4, 4);
      if (a === -b) return null;
      // (x－a)(x＋b)/(x－a) → a＋b
      const e = fr(pTex([Q(1), Q(b - a), Q(-a * b)]), lin(1, -a));
      return { text: `${LX(a)}${e}`, ans: num(Q(a + b)), meta: { e, at: a, v: a + b } };
    }
    if (type === "root") {
      const c = rng.pick([1, 4, 9]), r = Math.sqrt(c);
      // (√(x＋c)－√c)/x → 1/(2√c)
      const e = fr(`√{${x}＋${c}}－${r}`, x);
      return { text: `${LX(0)}${e}`, ans: num(Q(1, 2 * r)), meta: { e, at: 0, v: 1 / (2 * r) } };
    }
    if (type === "inf") {
      const a = nz(rng, -6, 6);
      const e = `√{${x}²${a < 0 ? "－" : "＋"}${Math.abs(a)}${x}}－${x}`;
      return { text: `[[lim:${x}→∞]](${e})`, ans: num(Q(a, 2)), meta: { e, at: Infinity, v: a / 2 } };
    }
    if (type === "trig") {
      const a = rng.int(2, 6), b = rng.int(1, 5);
      if (a === b) return null;
      const e = rng.chance(0.5) ? fr(`sin ${a}${x}`, `${b === 1 ? "" : b}${x}`) : fr(`sin ${a}${x}`, `sin ${b}${x}`);
      return { text: `${LX(0)}${e}`, ans: num(Q(a, b)), meta: { e, at: 0, v: a / b } };
    }
    if (type === "trig2") {
      const a = rng.int(1, 3);
      const e = fr(`1－cos ${a === 1 ? "" : a}${x}`, `${x}²`);
      return { text: `${LX(0)}${e}`, ans: num(Q(a * a, 2)), meta: { e, at: 0, v: a * a / 2 } };
    }
    // (1＋1/x)^x 型: lim (1＋a/x)^x ＝ e^a、lim (e^x－1)/x ＝ 1
    const a = rng.int(2, 3);
    if (rng.chance(0.5)) return { text: `${LX(0)}${fr(`e[[^${a}${x}]]－1`, x)}`, ans: String(a), meta: { e: fr(`e[[^${a}${x}]]－1`, x), at: 0, v: a } };
    return { text: `[[lim:${x}→∞]](1＋${fr(a, x)})[[^${x}]]`, ans: `e[[^${a}]]`, meta: { e: `(1＋${fr(a, x)})[[^${x}]]`, at: Infinity, v: Math.E ** a } };
  }, (pr) => {
    const m = pr.meta;
    const t = m.at === Infinity ? 1e7 : m.at + 1e-5;
    const t2 = m.at === Infinity ? 1e7 : m.at - 1e-5;
    const v1 = evalH(m.e, { x: t }), v2 = evalH(m.e, { x: t2 });
    return Math.abs(v1 - m.v) < 1e-3 * Math.max(1, Math.abs(m.v)) && Math.abs(v2 - m.v) < 1e-3 * Math.max(1, Math.abs(m.v)) && near(evalH(pr.answer.display), m.v) ? null : "極限が合わない";
  }, { work: 26 });

  const limCoef = gen("k3.limCoef", "次の等式が成り立つように、定数 [[v:a]]，[[v:b]] の値を定めましょう。", lv({ types: [0] }, { types: [0] }, { types: [0, 1] }), (rng, type) => {
    if (type === 1) {
      // lim (a√(x＋c) － b)/(x－1) ＝ v(x→1)
      const c = rng.pick([3, 8, 15]), r = Math.sqrt(c + 1), a = rng.int(1, 3), b = a * r, v = Q(a, 2 * r);
      return { text: `${LX(1)}${fr(`[[v:a]]√{${x}＋${c}}－[[v:b]]`, lin(1, -1))}＝${num(v)}`, ans: `${V("a")}＝${a}，${V("b")}＝${b}`, meta: { e: fr(`${a}√{${x}＋${c}}－${b}`, lin(1, -1)), at: 1, v: qv(v) } };
    }
    // lim (x²＋ax＋b)/(x－p) ＝ v → p²＋ap＋b＝0、2p＋a＝v
    const p = rng.int(-3, 3), v = rng.int(-6, 6), a = v - 2 * p, b = -p * p - a * p;
    return { text: `${LX(p)}${fr(`${x}²＋[[v:a]]${x}＋[[v:b]]`, lin(1, -p))}＝${v}`, ans: `${V("a")}＝${a}，${V("b")}＝${b}`, meta: { e: fr(pTex([Q(1), Q(a), Q(b)]), lin(1, -p)), at: p, v } };
  }, (pr) => {
    const m = pr.meta;
    return Math.abs(evalH(m.e, { x: m.at + 1e-6 }) - m.v) < 1e-4 && Math.abs(evalH(m.e, { x: m.at - 1e-6 }) - m.v) < 1e-4 ? null : "極限が合わない";
  }, { work: 30 });
  H["k3.seqLim"] = "分母の最高次の項で分母・分子をわります。√ の差は有理化、指数は底の大きい方でわります。";
  H["k3.series"] = "無限等比級数 a＋ar＋ar²＋… は |r|＜1 のとき収束し、和は [[f:a/1－r]]。部分分数に分けて部分和を求め、極限をとります。";
  H["k3.funcLim"] = "約分・有理化して [[f:0/0]] の形をなくします。[[lim:x→0]][[f:sin x/x]]＝1，[[lim:x→0]][[f:e[[^x]]－1/x]]＝1，[[lim:x→∞]](1＋[[f:1/x]])[[^x]]＝e。";
  H["k3.limCoef"] = "分母 → 0 なので、極限が存在するには分子 → 0 が必要です。これで a，b の関係を出してから、約分して極限を計算します。";

  K.k3 = { H, LX, fr, lin };
  return [fracFunc, invFunc, seqLim, series, funcLim, limCoef];
})();
