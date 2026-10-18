// 数学Ⅱ(学習指導要領の内容の順:いろいろな式 → 図形と方程式 → 指数関数・対数関数 → 三角関数 → 微分・積分の考え。教科書の章立てに合わせて 7 単元)
var kou2 = (() => {
  const K = kouLib;
  const { Q, qa, qs, qm, qd, qneg, qeq, qabs, qpow, isInt, qv, num, absTex, gcd, lcm, lv, nz, X, V, evalH, near, sameH, pTex, pmul, padd, pscale, pdiv, trim, sg, sgQ, quadRoots, rootTex, surdTex, gen, redo, nCr, pickN, ptQ, ptN, sup } = K;
  const H = {};
  const surdAns = K.k1.surdAns;

  // ============================================================
  // 1 式と証明
  // ============================================================
  const binom = gen("k2.binom", "次の問いに答えましょう。", lv({ types: ["full", "coef"] }, { types: ["coef", "coef", "full"] }, { types: ["coef", "const", "multi"] }), (rng, type) => {
    if (type === "full") {
      const n = rng.int(3, 5), b = nz(rng, -2, 2), a = rng.int(1, 2);
      const q = `(${pTex([Q(a), Q(b)])})${sup(n)}`;
      const cs = [];
      for (let k = 0; k <= n; k++) cs.push(Q(nCr(n, k) * a ** (n - k) * b ** k));
      return { text: `${q} を展開`, ans: pTex(cs), meta: { q, a: pTex(cs) } };
    }
    if (type === "coef") {
      const n = rng.int(5, 8), a = rng.int(1, 3), b = nz(rng, -3, 3), r = rng.int(2, n - 1);
      // (ax＋b)^n の x^r の係数 ＝ nCr a^r b^(n－r)
      const c = nCr(n, r) * a ** r * b ** (n - r);
      return { text: `(${pTex([Q(a), Q(b)])})${sup(n)} の展開式における ${V("x")}${sup(r) === "[[^1]]" ? "" : r > 1 ? sup(r) : ""} の係数`, ans: num(Q(c)), meta: { n, a, b, r, c } };
    }
    if (type === "const") {
      // (x² ＋ b/x)^n の定数項:x^(2(n－k)－k)
      const n = rng.pick([3, 6, 9]), b = nz(rng, -3, 3);
      const k = 2 * n / 3, c = nCr(n, k) * b ** k;
      return { text: `(${V("x")}²${b < 0 ? "－" : "＋"}[[f:${Math.abs(b)}/${V("x")}]])${sup(n)} の展開式における定数項`, ans: num(Q(c)), meta: { c, n, b, k } };
    }
    // (a＋b＋c)^n の a^p b^q c^r の係数
    const n = rng.int(4, 6), p0 = rng.int(1, n - 2), q0 = rng.int(1, n - p0 - 1), r0 = n - p0 - q0;
    const f = K.fact, c = f(n) / (f(p0) * f(q0) * f(r0));
    const mono = (L, e) => V(L) + (e > 1 ? sup(e) : "");
    return { text: `([[v:a]]＋[[v:b]]＋[[v:c]])${sup(n)} の展開式における ${mono("a", p0)}${mono("b", q0)}${mono("c", r0)} の係数`, ans: String(c), meta: { c } };
  }, (pr) => {
    const m = pr.meta;
    if (m.q) return sameH(m.q, m.a) ? null : "展開が合わない";
    if (m.r !== undefined) {
      // 数値で x^r の係数を取り出す(多項式の補間)
      const cs = [];
      for (let k = 0; k <= m.n; k++) cs.push(nCr(m.n, k) * m.a ** k * m.b ** (m.n - k));
      return cs[m.r] === m.c ? null : "係数が合わない";
    }
    return null;
  }, { work: 26 });

  const polyDiv = gen("k2.polyDiv", "次の整式 [[v:A]] を整式 [[v:B]] で割ったときの商と余りを求めましょう。", lv({ types: ["lin"] }, { types: ["lin", "quad"] }, { types: ["quad", "quad", "find"] }), (rng, type) => {
    if (type === "find") {
      // A を B で割ると商 Q、余り R → B を求める
      const B = [Q(1), Q(nz(rng, -3, 3)), Q(rng.int(-4, 4))], Qt = [Q(rng.int(1, 2)), Q(nz(rng, -4, 4))], R = [Q(nz(rng, -5, 5)), Q(rng.int(-5, 5))];
      const A = padd(pmul(B, Qt), R);
      return { text: `[[v:A]]＝${pTex(A)} を、ある整式 [[v:B]] で割ると、商が ${pTex(Qt)}，余りが ${pTex(trim(R))} である。[[v:B]] を求めましょう。`, ans: `[[v:B]]＝${pTex(B)}`, wide: true, meta: { A: pTex(A), B: pTex(B), Qt: pTex(Qt), R: pTex(trim(R)) } };
    }
    const B = type === "lin" ? [Q(1), Q(nz(rng, -4, 4))] : [Q(1), Q(rng.int(-3, 3)), Q(nz(rng, -4, 4))];
    const Qt = type === "lin" ? [Q(rng.int(1, 3)), Q(rng.int(-5, 5)), Q(rng.int(-5, 5))] : [Q(rng.int(1, 2)), Q(rng.int(-4, 4))];
    const R = type === "lin" ? [Q(rng.int(-9, 9))] : [Q(rng.int(-5, 5)), Q(rng.int(-6, 6))];
    const A = padd(pmul(B, Qt), R);
    const [q2, r2] = pdiv(A, B);
    return { text: `[[v:A]]＝${pTex(A)}，[[v:B]]＝${pTex(B)}`, ans: `商 ${pTex(q2)}，余り ${pTex(r2)}`, wide: true, meta: { A: pTex(A), B: pTex(B), Qt: pTex(q2), R: pTex(r2), deg: B.length - 1, rdeg: trim(r2).length - 1 } };
  }, (pr) => {
    const m = pr.meta;
    if (!sameH(m.A, `(${m.B})(${m.Qt})＋(${m.R})`)) return "A＝BQ＋R にならない";
    if (m.deg !== undefined && m.rdeg >= m.deg && m.R !== "0") return "余りの次数が大きい";
    return null;
  }, { work: 40 });

  // 分数式
  const lf = (a, b) => `${V("x")}${b < 0 ? "－" : "＋"}${Math.abs(b)}`;
  const fracExpr = gen("k2.fracExpr", "次の式を計算しましょう。", lv({ types: ["red", "mul"] }, { types: ["add", "mul", "red"] }, { types: ["add", "add3", "mul"] }), (rng, type) => {
    const a = nz(rng, -5, 5), b = nz(rng, -5, 5), c = nz(rng, -5, 5);
    if (a === b || b === c || a === c) return null;
    let q, ans;
    if (type === "red") {
      // (x＋a)(x＋b)/((x＋a)(x＋c)) を約分
      q = `[[f:${pTex([Q(1), Q(a + b), Q(a * b)])}/${pTex([Q(1), Q(a + c), Q(a * c)])}]]`;
      ans = `[[f:${lf(1, b)}/${lf(1, c)}]]`;
    } else if (type === "mul") {
      q = `[[f:${lf(1, a)}/${lf(1, b)}]]×[[f:${pTex([Q(1), Q(b + c), Q(b * c)])}/${pTex([Q(1), Q(a + c), Q(a * c)])}]]`;
      ans = "1";
      // (x＋a)/(x＋b) × (x＋b)(x＋c)/((x＋a)(x＋c)) ＝ 1 は簡単すぎるので、分子を変える
      q = `[[f:${lf(1, a)}/${lf(1, b)}]]×[[f:${pTex([Q(1), Q(b + c), Q(b * c)])}/${pTex([Q(1), Q(2 * a), Q(a * a)])}]]`;
      ans = `[[f:${lf(1, c)}/${lf(1, a)}]]`;
    } else if (type === "add") {
      // 1/(x＋a) ± 1/(x＋b)
      const s = rng.chance(0.5) ? 1 : -1;
      q = `[[f:1/${lf(1, a)}]]${s > 0 ? "＋" : "－"}[[f:1/${lf(1, b)}]]`;
      const numr = s > 0 ? pTex([Q(2), Q(a + b)]) : num(Q(b - a));
      ans = `[[f:${numr}/(${lf(1, a)})(${lf(1, b)})]]`;
      if (s < 0 && b - a < 0) ans = `－[[f:${num(Q(a - b))}/(${lf(1, a)})(${lf(1, b)})]]`;
    } else if (type === "add3") {
      // 部分分数の和 1/((x＋a)(x＋a＋1)) ＋ 1/((x＋a＋1)(x＋a＋2)) ＝ 2/((x＋a)(x＋a＋2))
      const d = a;
      if (d + 2 === 0 || d + 1 === 0 || d === 0) return null;
      q = `[[f:1/(${lf(1, d)})(${lf(1, d + 1)})]]＋[[f:1/(${lf(1, d + 1)})(${lf(1, d + 2)})]]`;
      ans = `[[f:2/(${lf(1, d)})(${lf(1, d + 2)})]]`;
    } else {
      // 繁分数 (1－1/x)/(x－1/x) ＝ 1/(x＋1)
      const k = rng.int(1, 4);
      q = `[[f:1－[[f:${k}/x]]/x－[[f:${k * k}/x]]]]`;
      return null;
    }
    return { text: X(q), ans: X(ans), meta: { q: X(q), a: X(ans) } };
  }, (pr) => sameH(pr.meta.q, pr.meta.a, ["x"], { shift: 0.123, scale: 3.1 }) ? null : "分数式が合わない", { work: 30 });

  // 恒等式
  const identity = gen("k2.identity", "次の等式が [[v:x]] についての恒等式となるように、定数 [[v:a]]，[[v:b]]，[[v:c]] の値を定めましょう。", lv({ types: ["shift"] }, { types: ["shift", "part"] }, { types: ["part", "shift3", "part"] }), (rng, type) => {
    if (type === "shift" || type === "shift3") {
      const p = nz(rng, -3, 3), A = nz(rng, -3, 3), B = rng.int(-5, 5), Cc = rng.int(-6, 6);
      // a(x－p)²＋b(x－p)＋c ＝ A x² ＋ … → a＝A
      const left = `${V("a")}(${pTex([Q(1), Q(-p)])})²＋${V("b")}(${pTex([Q(1), Q(-p)])})＋${V("c")}`;
      const right = pTex(padd(padd(pscale(pmul([Q(1), Q(-p)], [Q(1), Q(-p)]), Q(A)), pscale([Q(0), Q(1), Q(-p)], Q(B))), [Q(Cc)]));
      return { text: `${left}＝${right}`, ans: `${V("a")}＝${A}，${V("b")}＝${B}，${V("c")}＝${Cc}`, wide: true, meta: { l: left, r: right, v: { a: A, b: B, c: Cc } } };
    }
    // 部分分数:(px＋q)/((x＋s)(x＋t)) ＝ a/(x＋s) ＋ b/(x＋t)
    const s = nz(rng, -4, 4), t = nz(rng, -4, 4), A = nz(rng, -4, 4), B = nz(rng, -4, 4);
    if (s === t) return null;
    const numr = pTex([Q(A + B), Q(A * t + B * s)]);
    const left = X(`[[f:${numr}/(${lf(1, s)})(${lf(1, t)})]]`), right = X(`[[f:a/${lf(1, s)}]]＋[[f:b/${lf(1, t)}]]`);
    return { text: `${left}＝${right}`, ans: `${V("a")}＝${A}，${V("b")}＝${B}`, wide: true, meta: { l: left, r: right, v: { a: A, b: B } } };
  }, (pr) => {
    const m = pr.meta;
    return sameH(m.l.replace(/\[\[v:([abc])\]\]/g, (x0, L) => `(${m.v[L]})`), m.r.replace(/\[\[v:([abc])\]\]/g, (x0, L) => `(${m.v[L]})`), ["x"], { shift: 0.37 }) ? null : "恒等式にならない";
  }, { work: 34 });

  // 相加平均と相乗平均
  const amgm = gen("k2.amgm", "次の問いに答えましょう。", lv({ types: ["basic"] }, { types: ["basic", "shift"] }, { types: ["shift", "prod"] }), (rng, type) => {
    if (type === "basic") {
      const a = rng.int(1, 4), b = rng.pick([1, 4, 9, 16, 25, 36].map((v) => v * a));
      // ax ＋ b/x の最小(x＞0):2√(ab)、x ＝ √(b/a)
      const m = 2 * Math.sqrt(a * b), x0 = Math.sqrt(b / a);
      if (!Number.isInteger(m) || !Number.isInteger(x0)) return null;
      return { text: `[[v:x]]＞0 のとき、${a === 1 ? "" : a}[[v:x]]＋[[f:${b}/x]] の最小値と、そのときの [[v:x]] の値`.replace(/f:(\d+)\/x/, "f:$1/[[v:x]]"), ans: `${V("x")}＝${x0} のとき 最小値 ${m}`, meta: { f: (x) => a * x + b / x, m, x0 } };
    }
    if (type === "shift") {
      // x ＋ k/(x－c) (x＞c) の最小
      const k = rng.pick([1, 4, 9, 16, 25]), c = rng.int(1, 3), r = Math.sqrt(k);
      return { text: `[[v:x]]＞${c} のとき、[[v:x]]＋[[f:${k}/[[v:x]]－${c}]] の最小値と、そのときの [[v:x]] の値`, ans: `${V("x")}＝${c + r} のとき 最小値 ${2 * r + c}`, meta: { f: (x) => x + k / (x - c), m: 2 * r + c, x0: c + r, lo: c } };
    }
    // (a＋p/b)(b＋q/a) の最小:p＋q＋2√(pq)
    const [p0, q0] = rng.pick([[1, 4], [1, 9], [2, 8], [1, 16], [4, 9], [2, 18], [3, 12], [1, 25], [4, 1], [9, 1], [8, 2]]), r = Math.sqrt(p0 * q0);
    return { text: `[[v:a]]＞0，[[v:b]]＞0 のとき、([[v:a]]＋[[f:${p0}/[[v:b]]]])([[v:b]]＋[[f:${q0}/[[v:a]]]]) の最小値`, ans: `${p0 + q0 + 2 * r}`, meta: { m: p0 + q0 + 2 * r, two: true, p0, q0 } };
  }, (pr) => {
    const m = pr.meta;
    if (m.two) {
      let best = Infinity;
      for (let t = 0.01; t < 60; t += 0.01) best = Math.min(best, t + m.q0 + m.p0 + m.p0 * m.q0 / t);
      return Math.abs(best - m.m) < 0.01 ? null : "最小値が合わない";
    }
    let best = Infinity;
    for (let x = (m.lo || 0) + 0.001; x < 40; x += 0.001) best = Math.min(best, m.f(x));
    return Math.abs(best - m.m) < 1e-4 && Math.abs(m.f(m.x0) - m.m) < 1e-9 ? null : "最小値が合わない";
  }, { work: 30 });
  H["k2.binom"] = "(a＋b)[[^n]] の一般項は [[_n]]C[[_r]]a[[^n－r]]b[[^r]]。求める次数になる r を決めます。";
  H["k2.polyDiv"] = "筆算で、次数の高い項から順に割ります。A＝BQ＋R(R の次数は B より低い)。";
  H["k2.fracExpr"] = "分母・分子を因数分解して約分します。たし算・ひき算は通分します。";
  H["k2.identity"] = "両辺を展開して係数を比べるか、x に都合のよい値を代入します(数値代入法)。";
  H["k2.amgm"] = "a＞0，b＞0 のとき [[f:a＋b/2]]≧√{ab}。等号は a＝b のとき。積が一定になる2つの項に分けます。";

  // ============================================================
  // 2 複素数と方程式
  // ============================================================
  const C = (a, b) => [Array.isArray(a) ? a : Q(a), Array.isArray(b) ? b : Q(b)];
  const cadd = (u, v) => [qa(u[0], v[0]), qa(u[1], v[1])];
  const cmul = (u, v) => [qs(qm(u[0], v[0]), qm(u[1], v[1])), qa(qm(u[0], v[1]), qm(u[1], v[0]))];
  const cconj = (u) => [u[0], qneg(u[1])];
  const cdiv = (u, v) => {
    const d = qa(qm(v[0], v[0]), qm(v[1], v[1])), n = cmul(u, cconj(v));
    return [qd(n[0], d), qd(n[1], d)];
  };
  const I = V("i");
  const cTex = (u) => {
    const [a, b] = u;
    if (b[0] === 0) return num(a);
    const bi = (qeq(qabs(b), Q(1)) ? "" : absTex(b)) + I;
    if (a[0] === 0) return (b[0] < 0 ? "－" : "") + bi;
    return `${num(a)}${b[0] < 0 ? "－" : "＋"}${bi}`;
  };
  const cParen = (u) => `(${cTex(u)})`;
  const randC = (rng, m = 5) => C(rng.int(-m, m), nz(rng, -m, m));
  const complex = gen("k2.complex", "次の計算をし、[[v:a]]＋[[v:b]][[v:i]] の形で答えましょう。", lv({ types: ["add", "mul", "sq"] }, { types: ["mul", "div", "sq", "pow"] }, { types: ["div", "div2", "pow", "mixed"] }), (rng, type) => {
    const u = randC(rng), v = randC(rng, 4);
    let q, r;
    if (type === "add") q = `${cParen(u)}${rng.chance(0.5) ? "＋" : "－"}${cParen(v)}`, r = q.includes("＋(") ? cadd(u, v) : cadd(u, [qneg(v[0]), qneg(v[1])]);
    else if (type === "mul") q = `${cParen(u)}${cParen(v)}`, r = cmul(u, v);
    else if (type === "sq") q = `${cParen(u)}²`, r = cmul(u, u);
    else if (type === "div") q = `[[f:${cTex(u)}/${cTex(v)}]]`, r = cdiv(u, v);
    else if (type === "div2") {
      const w = randC(rng, 3);
      q = `[[f:${cTex(u)}/${cTex(v)}]]＋[[f:${cTex(w)}/${cTex(cconj(v))}]]`, r = cadd(cdiv(u, v), cdiv(w, cconj(v)));
      if (r[0][1] > 30 || r[1][1] > 30) return null;
    } else if (type === "pow") {
      const n = rng.int(5, 40), s = rng.chance(0.5);
      const base = s ? C(0, 1) : C(1, 1);
      if (!s && n > 12) return null;
      let p = C(1, 0);
      for (let k = 0; k < n; k++) p = cmul(p, base);
      q = s ? `${I}[[^${n}]]` : `(1＋${I})[[^${n}]]`, r = p;
    } else {
      // (2－i)(3＋i)－i³
      q = `${cParen(u)}${cParen(v)}－${I}³`, r = cadd(cmul(u, v), C(0, 1));
    }
    if (r[0][1] > 30 || r[1][1] > 30) return null;
    return { text: q, ans: cTex(r), meta: { r: [qv(r[0]), qv(r[1])] } };
  }, (pr) => {
    const d = pr.answer.display, re = evalH(d, { i: 0 }), im = evalH(d, { i: 1 }) - re;
    return near(re, pr.meta.r[0]) && near(im, pr.meta.r[1]) ? null : "複素数の答えが合わない";
  }, { work: 26 });

  const quadC = gen("k2.quadC", "次の問いに答えましょう。", lv({ types: ["solve", "solve"] }, { types: ["solve", "kind", "range"] }, { types: ["solve", "range", "common"] }), (rng, type) => {
    if (type === "solve") {
      const a = rng.int(1, 3), b = rng.int(-6, 6), c = rng.int(1, 9), D = b * b - 4 * a * c;
      if (D >= 0 || gcd(gcd(a, b), c) !== 1) return null;
      const R = quadRoots(a, b, c);
      return { text: `二次方程式 ${pTex([Q(a), Q(b), Q(c)])}＝0 を解く`, ans: `${V("x")}＝${R.tex}`, meta: { a, b, c } };
    }
    if (type === "kind") {
      const a = nz(rng, -3, 3), b = rng.int(-6, 6), c = rng.int(-6, 6), D = b * b - 4 * a * c;
      const k = D > 0 ? "異なる2つの実数解" : D === 0 ? "重解" : "異なる2つの虚数解";
      return { text: `二次方程式 ${pTex([Q(a), Q(b), Q(c)])}＝0 の解の種類を判別する`, ans: k, meta: { D, k } };
    }
    if (type === "range") {
      // x² ＋ 2kx ＋ (k＋m) ＝ 0 が虚数解:D/4 ＝ k²－k－m ＜ 0
      const r1 = rng.int(-4, -1), r2 = rng.int(1, 5), s = -(r1 + r2), p = r1 * r2;
      // k² ＋ s k ＋ p ＜ 0 ⇔ r1 ＜ k ＜ r2。x² ＋ 2kx ＋ (－s k － p) ＝ 0
      const e = `${V("x")}²＋2${V("k")}${V("x")}${-s === 0 ? "" : (-s > 0 ? "＋" : "－") + (Math.abs(s) === 1 ? "" : Math.abs(s)) + V("k")}${sg(-p)}＝0`;
      return { text: `二次方程式 ${e} が虚数解をもつような定数 [[v:k]] の値の範囲`, ans: `${r1}＜${V("k")}＜${r2}`, wide: true, meta: { s, p, r1, r2 } };
    }
    // 2つの方程式が共通解
    const al = rng.int(-3, 3), b1 = rng.int(-4, 4), b2 = rng.int(-4, 4);
    if (b1 === b2) return null;
    // x² ＋ b1x ＋ c1 ＝ 0, x² ＋ b2x ＋ c2 ＝ 0 が x＝α を共有
    const c1 = -(al * al + b1 * al), c2 = -(al * al + b2 * al);
    const k = c1;
    return { text: `2つの二次方程式 ${V("x")}²${b1 ? (b1 < 0 ? "－" : "＋") + (Math.abs(b1) === 1 ? "" : Math.abs(b1)) + V("x") : ""}＋${V("k")}＝0，${pTex([Q(1), Q(b2), Q(c2)])}＝0 がただ1つの共通解をもつとき、定数 [[v:k]] の値と共通解`, ans: `${V("k")}＝${num(Q(k))}，共通解 ${V("x")}＝${al}`, wide: true, meta: { al, b1, b2, c2, k } };
  }, (pr) => {
    const m = pr.meta;
    if (m.a !== undefined) {
      const R = quadRoots(m.a, m.b, m.c), d = pr.answer.display;
      return d.includes("±") && d.includes("[[v:i]]") && near(R.re, -m.b / (2 * m.a)) ? null : "虚数解の形が合わない";
    }
    if (m.k && m.D !== undefined) return (m.D > 0 ? "異なる2つの実数解" : m.D === 0 ? "重解" : "異なる2つの虚数解") === m.k ? null : "解の種類が合わない";
    if (m.r1 !== undefined) {
      for (let k = m.r1 - 2; k <= m.r2 + 2; k += 0.25) {
        const D4 = k * k - (-m.s * k - m.p), want = D4 < 0, got = k > m.r1 && k < m.r2;
        if (want !== got) return "範囲が合わない";
      }
      return null;
    }
    const f1 = (x) => x * x + m.b1 * x + m.k, f2 = (x) => x * x + m.b2 * x + m.c2;
    return Math.abs(f1(m.al)) < 1e-9 && Math.abs(f2(m.al)) < 1e-9 ? null : "共通解が合わない";
  }, { work: 30 });

  // 解と係数の関係
  const vieta = gen("k2.vieta", "次の問いに答えましょう。", lv({ types: ["sum", "sq"] }, { types: ["sq", "cube", "recip", "make"] }, { types: ["cube", "diff", "make2", "recip"] }), (rng, type) => {
    if (type === "make" || type === "make2") {
      // 2数を解とする二次方程式
      if (type === "make") {
        const p = rng.int(-3, 4), q = rng.int(1, 3), r = rng.pick([2, 3, 5]);
        return { text: `2数 ${p}＋${q === 1 ? "" : q}√{${r}}，${p}－${q === 1 ? "" : q}√{${r}} を解とする二次方程式を1つ作る`, ans: `${pTex([Q(1), Q(-2 * p), Q(p * p - q * q * r)])}＝0`, meta: { roots: [p + q * Math.sqrt(r), p - q * Math.sqrt(r)] } };
      }
      const a = nz(rng, -3, 3), b = rng.int(1, 3);
      return { text: `2数 ${a}＋${b === 1 ? "" : b}${I}，${a}－${b === 1 ? "" : b}${I} を解とする二次方程式を1つ作る`, ans: `${pTex([Q(1), Q(-2 * a), Q(a * a + b * b)])}＝0`, meta: { cplx: [a, b] } };
    }
    const a = rng.int(1, 3), b = nz(rng, -7, 7), c = nz(rng, -6, 6);
    const s = Q(-b, a), p = Q(c, a);
    const eq = `${pTex([Q(a), Q(b), Q(c)])}＝0`;
    const T = {
      sum: [`α＋β，αβ`, `α＋β＝${num(s)}，αβ＝${num(p)}`, null],
      sq: [`α²＋β²`, num(qs(qm(s, s), qm(Q(2), p))), qs(qm(s, s), qm(Q(2), p))],
      cube: [`α³＋β³`, num(qs(qpow(s, 3), qm(Q(3), qm(p, s)))), qs(qpow(s, 3), qm(Q(3), qm(p, s)))],
      recip: [`[[f:1/α]]＋[[f:1/β]]`, null, p[0] ? qd(s, p) : null],
      diff: [`(α－β)²`, num(qs(qm(s, s), qm(Q(4), p))), qs(qm(s, s), qm(Q(4), p))]
    }[type];
    if (type === "recip") {
      if (!T[2]) return null;
      T[1] = num(T[2]);
    }
    return { text: `二次方程式 ${eq} の2つの解を α，β とするとき、${T[0]} の値`, ans: T[1], meta: { a, b, c, type } };
  }, (pr) => {
    const m = pr.meta;
    if (m.roots) {
      const eq = pr.answer.display.replace(/＝0$/, "");
      return m.roots.every((x) => Math.abs(evalH(eq, { x })) < 1e-9) ? null : "方程式が合わない";
    }
    if (m.cplx) {
      // x＝a＋bi を代入して 0(実部・虚部を手で)
      const [a, b] = m.cplx, eq = pr.answer.display.replace(/＝0$/, "");
      const B = evalH(eq, { x: 0 }), A1 = evalH(eq, { x: 1 }) - B - 1; // x² ＋ A1 x ＋ B
      const re = a * a - b * b + A1 * a + B, im = 2 * a * b + A1 * b;
      return Math.abs(re) < 1e-9 && Math.abs(im) < 1e-9 ? null : "方程式が合わない";
    }
    // 解を数値で(複素数もある)
    const { a, b, c } = m, D = b * b - 4 * a * c;
    let r1, r2;
    if (D >= 0) r1 = [(-b + Math.sqrt(D)) / (2 * a), 0], r2 = [(-b - Math.sqrt(D)) / (2 * a), 0];
    else r1 = [-b / (2 * a), Math.sqrt(-D) / (2 * a)], r2 = [-b / (2 * a), -Math.sqrt(-D) / (2 * a)];
    const mul = (u, v) => [u[0] * v[0] - u[1] * v[1], u[0] * v[1] + u[1] * v[0]], add = (u, v) => [u[0] + v[0], u[1] + v[1]];
    const sq = (u) => mul(u, u), cu = (u) => mul(u, sq(u)), inv = (u) => [u[0] / (u[0] ** 2 + u[1] ** 2), -u[1] / (u[0] ** 2 + u[1] ** 2)];
    const want = { sq: add(sq(r1), sq(r2)), cube: add(cu(r1), cu(r2)), recip: add(inv(r1), inv(r2)), diff: sq(add(r1, [-r2[0], -r2[1]])) }[m.type];
    if (!want) return null;
    return Math.abs(want[1]) < 1e-9 && near(want[0], evalH(pr.answer.display)) ? null : "値が合わない";
  }, { work: 30 });

  // 剰余の定理・因数定理
  const remThm = gen("k2.remThm", "次の問いに答えましょう。", lv({ types: ["rem", "rem"] }, { types: ["rem", "findK", "two"] }, { types: ["two", "findK", "two"] }), (rng, type) => {
    if (type === "rem") {
      const P = [Q(rng.int(1, 3)), Q(rng.int(-5, 5)), Q(rng.int(-6, 6)), Q(rng.int(-9, 9))], a = nz(rng, -3, 3);
      const r = K.pEval(P, a);
      return { text: `整式 [[v:P]]([[v:x]])＝${pTex(P)} を ${pTex([Q(1), Q(-a)])} で割ったときの余り`, ans: num(Q(r)), meta: { P: pTex(P), a, r } };
    }
    if (type === "findK") {
      const P0 = [Q(1), Q(0), Q(rng.int(-4, 4)), Q(rng.int(-8, 8))], a = nz(rng, -3, 3), r = rng.int(-6, 6);
      // x² の係数を k として、x－a で割った余りが r
      const k = Q(r - K.pEval(P0, a), a * a);
      if (!isInt(k)) return null;
      const P = pTex(P0).replace(/(\[\[v:x\]\]³)/, `$1＋${V("k")}${V("x")}²`);
      return { text: `整式 ${P} を ${pTex([Q(1), Q(-a)])} で割った余りが ${r} となるように、定数 [[v:k]] の値を定める`, ans: `${V("k")}＝${num(k)}`, wide: true, meta: { P, a, r, k: qv(k) } };
    }
    // (x－a)(x－b) で割った余り:P(a)＝r1, P(b)＝r2
    const a = rng.int(-3, 3), b = rng.int(-3, 3), r1 = rng.int(-8, 8), r2 = rng.int(-8, 8);
    if (a === b) return null;
    const m = Q(r1 - r2, a - b), n = qs(Q(r1), qm(m, Q(a)));
    return { text: `整式 [[v:P]]([[v:x]]) を ${pTex([Q(1), Q(-a)])} で割ると余りが ${r1}，${pTex([Q(1), Q(-b)])} で割ると余りが ${r2} である。[[v:P]]([[v:x]]) を (${pTex([Q(1), Q(-a)])})(${pTex([Q(1), Q(-b)])}) で割ったときの余り`, ans: pTex([m, n]), wide: true, meta: { a, b, r1, r2, m: qv(m), n: qv(n) } };
  }, (pr) => {
    const m = pr.meta;
    if (m.P && m.k === undefined) return near(evalH(m.P, { x: m.a }), m.r) ? null : "余りが合わない";
    if (m.k !== undefined) return near(evalH(m.P, { x: m.a, k: m.k }), m.r) ? null : "k が合わない";
    const f = pr.answer.display;
    return near(evalH(f, { x: m.a }), m.r1) && near(evalH(f, { x: m.b }), m.r2) ? null : "余りが合わない";
  }, { work: 30 });

  // 高次方程式
  const highEq = gen("k2.highEq", "次の方程式を解きましょう。", lv({ types: ["cube3", "cube3"] }, { types: ["cube3", "cube1", "quart"] }, { types: ["cube1", "cubeK", "quart", "xcube"] }), (rng, type) => {
    if (type === "cube3") {
      const rs = pickN(rng, [-3, -2, -1, 1, 2, 3, 4], 3).sort((u, v) => u - v);
      const P = rs.reduce((acc, r) => pmul(acc, [Q(1), Q(-r)]), [Q(1)]);
      return { text: `${pTex(P)}＝0`, ans: `${V("x")}＝${rs.join(", ")}`, meta: { P: pTex(P), sols: rs } };
    }
    if (type === "cube1" || type === "xcube") {
      if (type === "xcube") {
        const a = rng.int(1, 4), s = rng.chance(0.5) ? 1 : -1;
        // x³ ＝ s a³ → x ＝ s a, (－1±√3 i)/2 × s a
        const R = quadRoots(1, s * a, a * a);
        return { text: `${V("x")}³＝${num(Q(s * a ** 3))}`, ans: `${V("x")}＝${s * a}, ${R.tex}`, meta: { P: pTex([Q(1), Q(0), Q(0), Q(-s * a ** 3)]), cx: true } };
      }
      const r = nz(rng, -3, 3), b = rng.int(-4, 4), c = rng.int(1, 6);
      if (b * b - 4 * c >= 0) return null;
      const P = pmul([Q(1), Q(-r)], [Q(1), Q(b), Q(c)]);
      const R = quadRoots(1, b, c);
      return { text: `${pTex(P)}＝0`, ans: `${V("x")}＝${r}, ${R.tex}`, meta: { P: pTex(P), cx: true } };
    }
    if (type === "quart") {
      // x⁴ ＋ (b)x² ＋ c ＝ 0 で x² ＝ t
      const p = rng.int(1, 4), q = rng.pick([1, 4, 9, 2, 3]);
      // (x²－q)(x²＋p)
      const P = [Q(1), Q(0), Q(p - q), Q(0), Q(-p * q)];
      const rq = rootTex(q), rp = rootTex(p);
      return { text: `${pTex(P)}＝0`, ans: `${V("x")}＝±${rq}, ±${rp === "1" ? "" : rp}${I}`, meta: { P: pTex(P), cx: true } };
    }
    // x³ ＋ kx ＋ m ＝ 0 が x＝a を解にもつとき、k と他の解
    const a = nz(rng, -3, 3), m0 = rng.int(-6, 6), k = Q(-(a ** 3 + m0), a);
    if (!isInt(k)) return null;
    const P = [Q(1), Q(0), k, Q(m0)], [q2] = pdiv(P, [Q(1), Q(-a)]);
    const R = quadRoots(1, qv(q2[1]), qv(q2[2]));
    if (R.double) return null;
    return { text: `方程式 ${V("x")}³＋${V("k")}${V("x")}${sg(m0)}＝0 の1つの解が ${a} であるとき、定数 [[v:k]] の値と他の解を求める`, ans: `${V("k")}＝${num(k)}，他の解 ${V("x")}＝${R.tex}`, meta: { P: pTex(P), cx: true, kOnly: true } };
  }, (pr) => {
    const m = pr.meta;
    if (m.sols) return m.sols.every((x) => Math.abs(evalH(m.P, { x })) < 1e-9) ? null : "解が合わない";
    // 実数解を確かめる(虚数解は形だけ)
    const reals = pr.answer.display.replace(/^.*?＝/, "").split(", ").filter((s) => !s.includes("[[v:i]]") && !s.includes("＝"));
    for (const s of reals) for (const v of s.includes("±") ? [evalH(s.replace("±", "")), -evalH(s.replace("±", ""))] : [evalH(s)]) if (Math.abs(evalH(m.P, { x: v })) > 1e-7) return "解が合わない";
    return null;
  }, { work: 34 });
  H["k2.complex"] = "i²＝－1 として計算します。割り算は、分母と共役な複素数を分母・分子にかけます。";
  H["k2.quadC"] = "判別式 D＜0 のとき、異なる2つの虚数解。√{－a}＝√{a}i。";
  H["k2.vieta"] = "ax²＋bx＋c＝0 の2つの解 α，β について、α＋β＝－[[f:b/a]]，αβ＝[[f:c/a]]。α²＋β²＝(α＋β)²－2αβ。";
  H["k2.remThm"] = "P(x) を x－a で割った余りは P(a)。2次式で割った余りは px＋q とおいて、P(a)，P(b) の条件を使います。";
  H["k2.highEq"] = "P(a)＝0 となる a(定数項の約数など)を見つけ、x－a で割って因数分解します。";

  // ============================================================
  // 3 図形と方程式
  // ============================================================
  const pts = gen("k2.points", "次の問いに答えましょう。", lv({ types: ["dist", "mid", "div"] }, { types: ["dist", "div", "ext", "cent"] }, { types: ["ext", "cent", "para", "sym"] }), (rng, type) => {
    const A = [rng.int(-6, 6), rng.int(-6, 6)], B = [rng.int(-6, 6), rng.int(-6, 6)];
    if (A[0] === B[0] && A[1] === B[1]) return null;
    const AB = `A${ptN(...A)}，B${ptN(...B)}`;
    if (type === "dist") {
      const d2 = (A[0] - B[0]) ** 2 + (A[1] - B[1]) ** 2;
      return { text: `2点 ${AB} 間の距離`, ans: rootTex(d2), meta: { v: Math.sqrt(d2) } };
    }
    if (type === "mid") return { text: `2点 ${AB} を結ぶ線分の中点の座標`, ans: ptQ(Q(A[0] + B[0], 2), Q(A[1] + B[1], 2)), meta: { want: [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2] } };
    if (type === "div" || type === "ext") {
      const m = rng.int(1, 3), n = rng.int(1, 3);
      if (m === n) return null;
      const ext = type === "ext", d = ext ? m - n : m + n;
      const P = [Q(ext ? -n * A[0] + m * B[0] : n * A[0] + m * B[0], d), Q(ext ? -n * A[1] + m * B[1] : n * A[1] + m * B[1], d)];
      return { text: `2点 ${AB} を結ぶ線分 AB を ${m}：${n} に${ext ? "外分" : "内分"}する点の座標`, ans: ptQ(...P), meta: { want: P.map(qv) } };
    }
    if (type === "cent") {
      const Cc = [rng.int(-6, 6), rng.int(-6, 6)];
      const G = [Q(A[0] + B[0] + Cc[0], 3), Q(A[1] + B[1] + Cc[1], 3)];
      return { text: `3点 ${AB}，C${ptN(...Cc)} を頂点とする △ABC の重心の座標`, ans: ptQ(...G), meta: { want: G.map(qv) } };
    }
    if (type === "para") {
      const Cc = [rng.int(-6, 6), rng.int(-6, 6)];
      const D = [A[0] + Cc[0] - B[0], A[1] + Cc[1] - B[1]];
      return { text: `3点 ${AB}，C${ptN(...Cc)} について、四角形 ABCD が平行四辺形となる点 D の座標`, ans: ptN(...D), meta: { want: D } };
    }
    // 点 A に関して B と対称な点
    const S = [2 * A[0] - B[0], 2 * A[1] - B[1]];
    return { text: `点 A${ptN(...A)} に関して、点 B${ptN(...B)} と対称な点の座標`, ans: ptN(...S), meta: { want: S } };
  }, (pr) => {
    const m = pr.meta, d = pr.answer.display;
    if (m.v !== undefined) return near(evalH(d), m.v) ? null : "距離が合わない";
    const mm = /^\((.+), (.+)\)$/.exec(d);
    return mm && near(evalH(mm[1]), m.want[0]) && near(evalH(mm[2]), m.want[1]) ? null : "座標が合わない";
  }, { work: 24 });

  // 直線の方程式(y＝mx＋n または ax＋by＋c＝0)
  const lineTex = (a, b, c) => {
    // ax＋by＋c＝0 を、y について解けるなら y＝… で
    if (b === 0) return `${V("x")}＝${num(Q(-c, a))}`;
    return `${V("y")}＝${pTex([Q(-a, b), Q(-c, b)])}`;
  };
  const lines = gen("k2.lines", "次の問いに答えましょう。", lv({ types: ["two", "slope"] }, { types: ["two", "para", "perp"] }, { types: ["perp", "dist", "sym"] }), (rng, type) => {
    const A = [rng.int(-5, 5), rng.int(-5, 5)];
    if (type === "slope") {
      const m = nz(rng, -4, 4);
      return { text: `点 ${ptN(...A)} を通り、傾きが ${m} の直線の方程式`, ans: lineTex(-m, 1, m * A[0] - A[1]), meta: { pts: [A], slope: m } };
    }
    if (type === "two") {
      const B = [rng.int(-5, 5), rng.int(-5, 5)];
      if (A[0] === B[0] && A[1] === B[1]) return null;
      // (y2－y1)(x－x1) ＝ (x2－x1)(y－y1)
      const a = B[1] - A[1], b = -(B[0] - A[0]), c = -(a * A[0] + b * A[1]);
      return { text: `2点 ${ptN(...A)}，${ptN(...B)} を通る直線の方程式`, ans: lineTex(a, b, c), meta: { pts: [A, B] } };
    }
    const a = nz(rng, -4, 4), b = nz(rng, -4, 4), c = rng.int(-6, 6);
    if (gcd(a, b) !== 1) return null;
    const L = `${pTex([Q(a), Q(0)])}${b < 0 ? "－" : "＋"}${Math.abs(b) === 1 ? "" : Math.abs(b)}${V("y")}${c ? sg(c) : ""}＝0`;
    if (type === "para") return { text: `点 ${ptN(...A)} を通り、直線 ${L} に平行な直線の方程式`, ans: lineTex(a, b, -(a * A[0] + b * A[1])), meta: { pts: [A], dir: [a, b], para: true } };
    if (type === "perp") return { text: `点 ${ptN(...A)} を通り、直線 ${L} に垂直な直線の方程式`, ans: lineTex(b, -a, -(b * A[0] - a * A[1])), meta: { pts: [A], dir: [a, b], para: false } };
    if (type === "dist") {
      const d = Math.abs(a * A[0] + b * A[1] + c) / Math.sqrt(a * a + b * b);
      const ans = surdAns("", d);
      if (!ans || d === 0) return null;
      return { text: `点 ${ptN(...A)} と直線 ${L} の距離`, ans, meta: { v: d } };
    }
    // 直線に関して対称な点
    const t = Q(-2 * (a * A[0] + b * A[1] + c), a * a + b * b);
    const S = [qa(Q(A[0]), qm(t, Q(a))), qa(Q(A[1]), qm(t, Q(b)))];
    if (!isInt(S[0]) || !isInt(S[1]) || qeq(t, Q(0))) return null;
    return { text: `直線 ${L} に関して、点 ${ptN(...A)} と対称な点の座標`, ans: ptQ(...S), meta: { sym: [a, b, c, A, S.map(qv)] } };
  }, (pr) => {
    const m = pr.meta, d = pr.answer.display;
    if (m.v !== undefined) return near(evalH(d), m.v) ? null : "距離が合わない";
    if (m.sym) {
      const [a, b, c, A, S] = m.sym, M = [(A[0] + S[0]) / 2, (A[1] + S[1]) / 2];
      return Math.abs(a * M[0] + b * M[1] + c) < 1e-9 && Math.abs((S[0] - A[0]) * b - (S[1] - A[1]) * a) < 1e-9 ? null : "対称な点が合わない";
    }
    // 直線の式:y＝… か x＝…
    const f = d.startsWith("[[v:y]]＝") ? (x, y) => y - evalH(d.slice(8), { x }) : (x) => x - evalH(d.slice(8));
    for (const P of m.pts) if (Math.abs(f(P[0], P[1])) > 1e-9) return "点を通らない";
    if (m.slope !== undefined && !near(f(1, 0) - f(0, 0), -m.slope)) return "傾きが合わない";
    if (m.dir) {
      // 直線上の2点から方向ベクトル
      const y0 = (x) => d.startsWith("[[v:y]]＝") ? evalH(d.slice(8), { x }) : null;
      const dv = y0(0) === null ? [0, 1] : [1, y0(1) - y0(0)];
      const dot = dv[0] * m.dir[0] + dv[1] * m.dir[1];
      return m.para ? (Math.abs(dot) < 1e-9 ? null : "平行でない") : (Math.abs(dv[0] * m.dir[1] - dv[1] * m.dir[0]) < 1e-9 ? null : "垂直でない");
    }
    return null;
  }, { work: 30 });

  // 円の方程式
  const circleEq = gen("k2.circleEq", "次の問いに答えましょう。", lv({ types: ["std", "cr"] }, { types: ["std", "cr", "diam", "pass"] }, { types: ["diam", "three", "tangentAxis", "std"] }), (rng, type) => {
    const a = rng.int(-4, 4), b = rng.int(-4, 4), r2 = rng.pick([1, 4, 9, 16, 2, 5, 8, 10, 13, 25]);
    const sq = (p, L) => p === 0 ? `${V(L)}²` : `(${V(L)}${p < 0 ? "＋" : "－"}${Math.abs(p)})²`;
    const stdT = `${sq(a, "x")}＋${sq(b, "y")}＝${r2}`;
    if (type === "std") {
      const gen2 = `${V("x")}²＋${V("y")}²${-2 * a ? (-2 * a < 0 ? "－" : "＋") + Math.abs(2 * a) + V("x") : ""}${-2 * b ? (-2 * b < 0 ? "－" : "＋") + Math.abs(2 * b) + V("y") : ""}${a * a + b * b - r2 ? sg(a * a + b * b - r2) : ""}＝0`;
      return { text: `方程式 ${gen2} が表す円の中心の座標と半径`, ans: `中心 ${ptN(a, b)}，半径 ${rootTex(r2)}`, meta: { a, b, r2, gen2 } };
    }
    if (type === "cr") return { text: `中心 ${ptN(a, b)}，半径 ${rootTex(r2)} の円の方程式`, ans: stdT, meta: { c: [a, b, r2] } };
    if (type === "pass") {
      const P = [a + rng.int(-4, 4), b + rng.int(-4, 4)], rr = (P[0] - a) ** 2 + (P[1] - b) ** 2;
      if (!rr) return null;
      return { text: `中心が点 ${ptN(a, b)} で、点 ${ptN(...P)} を通る円の方程式`, ans: `${sq(a, "x")}＋${sq(b, "y")}＝${rr}`, meta: { c: [a, b, rr], P } };
    }
    if (type === "diam") {
      const A = [a + rng.int(-4, 4), b + rng.int(-4, 4)], B = [2 * a - A[0], 2 * b - A[1]], rr = (A[0] - a) ** 2 + (A[1] - b) ** 2;
      if (!rr) return null;
      return { text: `2点 A${ptN(...A)}，B${ptN(...B)} を直径の両端とする円の方程式`, ans: `${sq(a, "x")}＋${sq(b, "y")}＝${rr}`, meta: { c: [a, b, rr], P: A } };
    }
    if (type === "tangentAxis") {
      // 中心 (a,b) で x 軸に接する
      if (!b) return null;
      return { text: `中心が点 ${ptN(a, b)} で、[[v:x]] 軸に接する円の方程式`, ans: `${sq(a, "x")}＋${sq(b, "y")}＝${b * b}`, meta: { c: [a, b, b * b], P: [a, 0] } };
    }
    // 3点を通る円(x²＋y²＋lx＋my＋n＝0)
    const ps = [];
    for (let t = 0; t < 60 && ps.length < 3; t++) {
      const x = rng.int(-6, 6), y = rng.int(-6, 6);
      if ((x - a) ** 2 + (y - b) ** 2 === r2 && !ps.some((p) => p[0] === x && p[1] === y)) ps.push([x, y]);
    }
    // 格子点を全部さがす
    const all = [];
    for (let x = a - 5; x <= a + 5; x++) for (let y = b - 5; y <= b + 5; y++) if ((x - a) ** 2 + (y - b) ** 2 === r2) all.push([x, y]);
    if (all.length < 3) return null;
    const ch = K.pickN(rng, all, 3);
    const gen2 = `${V("x")}²＋${V("y")}²${-2 * a ? (-2 * a < 0 ? "－" : "＋") + Math.abs(2 * a) + V("x") : ""}${-2 * b ? (-2 * b < 0 ? "－" : "＋") + Math.abs(2 * b) + V("y") : ""}${a * a + b * b - r2 ? sg(a * a + b * b - r2) : ""}＝0`;
    return { text: `3点 ${ch.map((p) => ptN(...p)).join("，")} を通る円の方程式`, ans: gen2, wide: true, meta: { three: ch, gen2 } };
  }, (pr) => {
    const m = pr.meta, d = pr.answer.display;
    const lhs = (s) => {
      const [l, r] = s.split("＝");
      return (x, y) => evalH(l, { x, y }) - evalH(r, { x, y });
    };
    if (m.gen2 && m.a !== undefined) {
      const f = lhs(m.gen2);
      // 中心から半径だけ離れた点が円の上
      return Math.abs(f(m.a + Math.sqrt(m.r2), m.b)) < 1e-9 && Math.abs(f(m.a, m.b - Math.sqrt(m.r2))) < 1e-9 ? null : "中心・半径が合わない";
    }
    const f = lhs(d);
    if (m.three) return m.three.every((p) => Math.abs(f(...p)) < 1e-9) ? null : "3点を通らない";
    const [a, b, r2] = m.c;
    if (Math.abs(f(a + Math.sqrt(r2), b)) > 1e-9 || Math.abs(f(a, b + Math.sqrt(r2))) > 1e-9) return "円が合わない";
    if (m.P && Math.abs(f(...m.P)) > 1e-9) return "点を通らない";
    return null;
  }, { work: 30 });

  // 円と直線
  const circleLine = gen("k2.circleLine", "次の問いに答えましょう。", lv({ types: ["tan0", "rel"] }, { types: ["tan0", "rel", "chord"] }, { types: ["chord", "tanK", "rel"] }), (rng, type) => {
    if (type === "tan0") {
      // x² ＋ y² ＝ r² 上の点 (p,q) での接線
      const P = rng.pick([[3, 4], [4, 3], [-3, 4], [3, -4], [5, 12], [1, 2], [2, 1], [-1, 2], [1, 3], [2, -3], [-2, -1], [-4, 3], [1, -1]]);
      const r2 = P[0] ** 2 + P[1] ** 2;
      const lin = `${P[0] ? num(Q(P[0])).replace(/^1$/, "").replace(/^－1$/, "－") + V("x") : ""}${P[1] ? (P[1] < 0 ? "－" : P[0] ? "＋" : "") + (Math.abs(P[1]) === 1 ? "" : Math.abs(P[1])) + V("y") : ""}＝${r2}`;
      return { text: `円 ${V("x")}²＋${V("y")}²＝${r2} 上の点 ${ptN(...P)} における接線の方程式`, ans: lin, meta: { P, r2 } };
    }
    if (type === "rel") {
      const r2 = rng.pick([5, 8, 9, 10, 13, 16, 20, 25]), a = nz(rng, -3, 3), b = rng.int(-8, 8);
      // y＝ax＋b と x²＋y²＝r2:距離 |b|/√(1＋a²)
      const d2 = Q(b * b, 1 + a * a);
      const rel = qv(d2) < r2 ? "異なる2点で交わる(共有点 2個)" : qv(d2) === r2 ? "接する(共有点 1個)" : "共有点をもたない(共有点 0個)";
      return { text: `円 ${V("x")}²＋${V("y")}²＝${r2} と直線 ${V("y")}＝${pTex([Q(a), Q(b)])} の位置関係`, ans: rel, meta: { a, b, r2, rel } };
    }
    if (type === "chord") {
      const r = rng.int(3, 7), a = nz(rng, -3, 3), b = rng.int(-6, 6), d2 = b * b / (1 + a * a);
      if (d2 >= r * r) return null;
      const L2 = Q(4 * (r * r * (1 + a * a) - b * b), 1 + a * a);
      const ans = surdTex(Q(0), Q(1, L2[1]), L2[0] * L2[1]);
      return { text: `円 ${V("x")}²＋${V("y")}²＝${r * r} が直線 ${V("y")}＝${pTex([Q(a), Q(b)])} から切り取る線分の長さ`, ans, meta: { v: 2 * Math.sqrt(r * r - d2) } };
    }
    // 直線 y＝mx＋k が円に接する k
    const r2 = rng.pick([2, 4, 5, 8, 9, 10]), m = nz(rng, -3, 3);
    const k2 = r2 * (1 + m * m);
    return { text: `直線 ${V("y")}＝${pTex([Q(m), Q(0)])}＋${V("k")} が円 ${V("x")}²＋${V("y")}²＝${r2} に接するような定数 [[v:k]] の値`, ans: `${V("k")}＝±${rootTex(k2)}`, meta: { m, r2, k: Math.sqrt(k2) } };
  }, (pr) => {
    const m = pr.meta, d = pr.answer.display;
    if (m.P) {
      const [l, r] = d.split("＝"), f = (x, y) => evalH(l, { x, y }) - evalH(r);
      if (Math.abs(f(...m.P)) > 1e-9) return "接点を通らない";
      // 接線の方向と半径が垂直
      const g0 = f(0, 0), gx = f(1, 0) - g0, gy = f(0, 1) - g0;
      return Math.abs(gx * m.P[1] - gy * m.P[0]) < 1e-9 ? null : "接線でない";
    }
    if (m.rel) {
      const d2 = m.b * m.b / (1 + m.a * m.a);
      return (d2 < m.r2 ? "異なる2点で交わる(共有点 2個)" : d2 === m.r2 ? "接する(共有点 1個)" : "共有点をもたない(共有点 0個)") === m.rel ? null : "位置関係が合わない";
    }
    if (m.v !== undefined) return near(evalH(d), m.v) ? null : "長さが合わない";
    return near(Math.abs(m.k) / Math.sqrt(1 + m.m * m.m), Math.sqrt(m.r2)) && near(evalH(d.replace(/^.*±/, "")), m.k) ? null : "k が合わない";
  }, { work: 30 });

  // 軌跡
  const locus = gen("k2.locus", "次の点 P の軌跡を求めましょう。", lv({ types: ["equi"] }, { types: ["equi", "mid"] }, { types: ["apol", "mid", "apol"] }), (rng, type) => {
    const A = [rng.int(-4, 4), rng.int(-4, 4)], B = [rng.int(-4, 4), rng.int(-4, 4)];
    if (A[0] === B[0] && A[1] === B[1]) return null;
    if (type === "equi") {
      // 2点から等距離:垂直二等分線 (B－A)·(P－M)＝0
      const a = 2 * (B[0] - A[0]), b = 2 * (B[1] - A[1]), c = A[0] ** 2 + A[1] ** 2 - B[0] ** 2 - B[1] ** 2;
      const g = gcd(gcd(a, b), c);
      return { text: `2点 A${ptN(...A)}，B${ptN(...B)} から等距離にある点 P`, ans: `直線 ${lineTex(a / g, b / g, c / g)}`, meta: { f: (x, y) => (x - A[0]) ** 2 + (y - A[1]) ** 2 - (x - B[0]) ** 2 - (y - B[1]) ** 2 } };
    }
    if (type === "mid") {
      // 円 x²＋y²＝r² 上の点 Q と点 A の中点 P
      const r = rng.int(2, 6), Ax = rng.int(-6, 6), Ay = rng.int(-6, 6);
      if (!Ax && !Ay) return null;
      const cx = Q(Ax, 2), cy = Q(Ay, 2), rr = Q(r, 2);
      const sq = (p, L) => p[0] === 0 ? `${V(L)}²` : `(${V(L)}${p[0] < 0 ? "＋" : "－"}${absTex(p)})²`;
      return { text: `点 A${ptN(Ax, Ay)} と、円 ${V("x")}²＋${V("y")}²＝${r * r} 上を動く点 Q を結ぶ線分 AQ の中点 P`, ans: `円 ${sq(cx, "x")}＋${sq(cy, "y")}＝${num(qm(rr, rr))}`, wide: true, meta: { f: (x, y) => (2 * x - Ax) ** 2 + (2 * y - Ay) ** 2 - r * r } };
    }
    // AP：BP ＝ 2：1 → アポロニウスの円
    const Ao = [0, 0], Bo = [rng.pick([3, 6, -3, -6]), 0];
    // AP² ＝ 4BP² → x²＋y² ＝ 4((x－b)²＋y²) → 3x²－8bx＋4b²＋3y²＝0 → (x－4b/3)²＋y² ＝ (2b/3)²
    const b0 = Bo[0], cx = Q(4 * b0, 3), rr = Q(2 * Math.abs(b0), 3);
    return { text: `2点 A(0, 0)，B${ptN(...Bo)} からの距離の比が AP：BP＝2：1 である点 P`, ans: `中心 ${ptQ(cx, Q(0))}，半径 ${num(rr)} の円`, wide: true, meta: { f: (x, y) => x * x + y * y - 4 * ((x - b0) ** 2 + y * y), c: [qv(cx), 0, qv(rr)] } };
  }, (pr) => {
    const m = pr.meta, d = pr.answer.display;
    // 答えの図形上の点で条件 f＝0
    let pts2 = [];
    if (m.c) for (const t of [0.3, 1.1, 2.5]) pts2.push([m.c[0] + m.c[2] * Math.cos(t), m.c[1] + m.c[2] * Math.sin(t)]);
    else if (d.startsWith("直線 ")) {
      const e = d.slice(3);
      if (e.startsWith("[[v:y]]＝")) pts2 = [0, 1.7, -2.3].map((x) => [x, evalH(e.slice(8), { x })]);
      else pts2 = [0, 1.7, -2.3].map((y) => [evalH(e.slice(8)), y]);
    } else {
      // 円 (x－a)²＋(y－b)²＝r²:中心と半径を数値で読む
      const e = d.slice(2), [l, r] = e.split("＝"), R = Math.sqrt(evalH(r));
      // 中心:l を最小にする点(x, y それぞれ二次)
      const cx = (evalH(l, { x: -1, y: 0 }) - evalH(l, { x: 1, y: 0 })) / 4, cy = (evalH(l, { x: 0, y: -1 }) - evalH(l, { x: 0, y: 1 })) / 4;
      pts2 = [0.3, 1.1, 2.5].map((t) => [cx + R * Math.cos(t), cy + R * Math.sin(t)]);
    }
    return pts2.every(([x, y]) => Math.abs(m.f(x, y)) < 1e-7) ? null : "軌跡が合わない";
  }, { work: 40 });
  H["k2.points"] = "2点間の距離 √{(x₂－x₁)²＋(y₂－y₁)²}。m：n に内分する点 ([[f:nx₁＋mx₂/m＋n]], [[f:ny₁＋my₂/m＋n]])、外分は n を －n に。重心は3点の座標の平均。";
  H["k2.lines"] = "点 (x₁, y₁) を通り傾き m の直線は y－y₁＝m(x－x₁)。平行なら傾きが等しく、垂直なら傾きの積が －1。点と直線の距離は [[f:|ax₁＋by₁＋c|/√{a²＋b²}]]。";
  H["k2.circleEq"] = "中心 (a, b)、半径 r の円は (x－a)²＋(y－b)²＝r²。一般形は平方完成して中心と半径を読みます。";
  H["k2.circleLine"] = "円の中心と直線の距離 d と半径 r を比べます。円 x²＋y²＝r² 上の点 (x₁, y₁) における接線は x₁x＋y₁y＝r²。";
  H["k2.locus"] = "P(x, y) とおき、条件を x，y の式で表して整理します。中点などは、動く点の座標を x，y で表して、もとの条件に代入します。";

  K.k2 = { H, cTex, C, cadd, cmul, cdiv, lineTex };
  return [binom, polyDiv, fracExpr, identity, amgm, complex, quadC, vieta, remThm, highEq, pts, lines, circleEq, circleLine, locus];
})();
