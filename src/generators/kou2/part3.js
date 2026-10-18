  // ============================================================
  // 6 微分法 ・ 7 積分法
  // ============================================================
var kou2c = (() => {
  const K = kouLib;
  const { Q, qa, qs, qm, qd, qneg, qeq, isInt, qv, num, absTex, gcd, lv, nz, X, V, evalH, near, sameH, pTex, pmul, padd, pscale, pdiv, trim, sg, sgQ, gen, redo, pickN, ptQ, planeR, curve, dotAt, draw, T_, RED } = K;
  const H = K.k2.H;
  const der = (cs) => cs.slice(0, -1).map((c, i) => qm(c, Q(cs.length - 1 - i)));
  const integ = (cs) => [...cs.map((c, i) => qd(c, Q(cs.length - i))), Q(0)];
  const pe = (cs, x) => cs.reduce((a, c) => qa(qm(a, x), c), Q(0));
  const yEq = (cs) => `${V("y")}＝${pTex(cs)}`;
  const fx = (cs) => `${V("f")}(${V("x")})＝${pTex(cs)}`;
  const randPoly = (rng, d, M = 5) => {
    const cs = [Q(nz(rng, -3, 3))];
    for (let i = 0; i < d; i++) cs.push(Q(rng.int(-M, M)));
    return cs;
  };

  // ============================================================
  // 6 微分法
  // ============================================================
  const deriv = gen("k2.deriv", "次の問いに答えましょう。", lv({ types: ["poly", "poly", "val"] }, { types: ["poly", "prod", "val"] }, { types: ["prod", "cube", "coef"] }), (rng, type) => {
    if (type === "poly" || type === "val") {
      const cs = randPoly(rng, rng.int(2, 3));
      if (type === "val") {
        const a = rng.int(-3, 3), v = pe(der(cs), Q(a));
        return { text: `${fx(cs)} のとき、${V("f")}′(${num(Q(a))}) の値`, ans: num(v), meta: { f: pTex(cs), a, v: qv(v) } };
      }
      return { text: `関数 ${yEq(cs)} を微分する`, ans: `${V("y")}′＝${pTex(der(cs))}`, meta: { f: pTex(cs), d: pTex(der(cs)) } };
    }
    if (type === "prod") {
      const A = [Q(rng.int(1, 3)), Q(nz(rng, -4, 4))], B = [Q(1), Q(rng.int(-4, 4)), Q(rng.int(-4, 4))];
      const P = pmul(A, B);
      return { text: `関数 ${V("y")}＝(${pTex(A)})(${pTex(B)}) を微分する`, ans: `${V("y")}′＝${pTex(der(P))}`, meta: { f: `(${pTex(A)})(${pTex(B)})`, d: pTex(der(P)) } };
    }
    if (type === "cube") {
      const a = rng.int(1, 3), b = nz(rng, -3, 3), P = pmul(pmul([Q(a), Q(b)], [Q(a), Q(b)]), [Q(a), Q(b)]);
      return { text: `関数 ${V("y")}＝(${pTex([Q(a), Q(b)])})³ を微分する`, ans: `${V("y")}′＝${pTex(der(P))}`, meta: { f: `(${pTex([Q(a), Q(b)])})³`, d: pTex(der(P)) } };
    }
    // f(x)＝x³＋ax²＋bx で f′(1)＝p, f′(－1)＝q
    const a = rng.int(-4, 4), b = rng.int(-6, 6), f = [Q(1), Q(a), Q(b), Q(0)], d = der(f);
    const p = pe(d, Q(1)), q = pe(d, Q(-1));
    return { text: `${V("f")}(${V("x")})＝${V("x")}³＋[[v:a]]${V("x")}²＋[[v:b]]${V("x")} が ${V("f")}′(1)＝${num(p)}，${V("f")}′(－1)＝${num(q)} を満たすとき、定数 [[v:a]]，[[v:b]] の値`, ans: `${V("a")}＝${a}，${V("b")}＝${b}`, meta: { a, b, p: qv(p), q: qv(q) } };
  }, (pr) => {
    const m = pr.meta, h = 1e-5;
    if (m.d) {
      for (const x of [-1.3, 0.4, 2.1]) if (Math.abs((evalH(m.f, { x: x + h }) - evalH(m.f, { x: x - h })) / (2 * h) - evalH(m.d, { x })) > 1e-4) return "導関数が合わない";
      return null;
    }
    if (m.v !== undefined) return Math.abs((evalH(m.f, { x: m.a + h }) - evalH(m.f, { x: m.a - h })) / (2 * h) - m.v) < 1e-4 ? null : "微分係数が合わない";
    const d = (x) => 3 * x * x + 2 * m.a * x + m.b;
    return d(1) === m.p && d(-1) === m.q ? null : "係数が合わない";
  }, { work: 24 });

  const tangent = gen("k2.tangent", "次の接線の方程式を求めましょう。", lv({ types: ["at", "at"] }, { types: ["at", "slope"] }, { types: ["slope", "from", "at"] }), (rng, type) => {
    if (type === "at") {
      const cs = randPoly(rng, rng.int(2, 3), 4), a = rng.int(-2, 2);
      const m = pe(der(cs), Q(a)), b = pe(cs, Q(a));
      return { text: `曲線 ${yEq(cs)} 上の点 (${a}, ${num(b)}) における接線`, ans: `${V("y")}＝${pTex([m, qs(b, qm(m, Q(a)))])}`, meta: { cs: pTex(cs), lines: [[qv(m), qv(qs(b, qm(m, Q(a))))]] } };
    }
    if (type === "slope") {
      // y＝x²＋bx＋c で傾き m の接線
      const b = rng.int(-4, 4), c = rng.int(-5, 5), m = rng.int(-4, 4), x0 = Q(m - b, 2);
      const cs = [Q(1), Q(b), Q(c)], y0 = pe(cs, x0), n = qs(y0, qm(Q(m), x0));
      return { text: `放物線 ${yEq(cs)} の接線で、傾きが ${m} のもの`, ans: `${V("y")}＝${pTex([Q(m), n])}`, meta: { cs: pTex(cs), lines: [[m, qv(n)]] } };
    }
    // 点 (p, q) から放物線 y＝x² に引いた接線(2本)
    const p = rng.int(-2, 2), t1 = rng.int(-3, 2), t2 = rng.int(t1 + 1, 4);
    // 接点 t:y＝2t x － t²。点(p,q)を通る:q ＝ 2tp － t² → t² － 2pt ＋ q ＝ 0 の解 t1, t2
    if (t1 + t2 !== 2 * p) return null;
    const q = t1 * t2;
    if (q >= p * p) return null;
    return { text: `点 (${p}, ${num(Q(q))}) から放物線 ${V("y")}＝${V("x")}² に引いた接線`, ans: [t1, t2].map((t) => `${V("y")}＝${pTex([Q(2 * t), Q(-t * t)])}`).join("，"), meta: { cs: `${V("x")}²`, lines: [t1, t2].map((t) => [2 * t, -t * t]), P: [p, q] } };
  }, (pr) => {
    const m = pr.meta, h = 1e-5;
    for (const [s, n] of m.lines) {
      // 接点:曲線との差が重根
      let ok = false;
      for (let x = -10; x <= 10; x += 1 / 16) {
        const d = evalH(m.cs, { x }) - (s * x + n), dd = (evalH(m.cs, { x: x + h }) - evalH(m.cs, { x: x - h })) / (2 * h) - s;
        if (Math.abs(d) < 1e-9 && Math.abs(dd) < 1e-4) ok = true;
      }
      if (!ok) return "接線になっていない";
      if (m.P && Math.abs(s * m.P[0] + n - m.P[1]) > 1e-9) return "点を通らない";
    }
    return null;
  }, { work: 30 });

  // 極値をもつ3次関数(f′＝3a(x－p)(x－q))
  const cubicWith = (rng) => {
    for (let t = 0; t < 50; t++) {
      const a = rng.pick([1, 1, -1, 2, -2]), p = rng.int(-3, 2), q = rng.int(p + 1, 3), c = rng.int(-5, 5);
      if ((3 * a * (p + q)) % 2) continue;
      const cs = [Q(a), Q(-3 * a * (p + q) / 2), Q(3 * a * p * q), Q(c)];
      return { cs, a, p, q };
    }
    return null;
  };
  const extremum = gen("k2.extremum", "次の関数の極値を求めましょう。", lv({ types: [0] }, { types: [0] }, { types: [0, "none"] }), (rng, type) => {
    if (type === "none") {
      const a = rng.pick([1, -1]), b = rng.int(-3, 3), c = rng.int(-2, 2), d = rng.int(-5, 5);
      // f′＝3ax²＋2bx＋c で判別式 ≦ 0
      if (4 * b * b - 12 * a * c > 0) return null;
      const cs = [Q(a), Q(b), Q(c), Q(d)];
      return { text: yEq(cs), ans: "極値をもたない", meta: { cs, none: true } };
    }
    const r = cubicWith(rng);
    if (!r) return null;
    const { cs, a, p, q } = r, fp = pe(cs, Q(p)), fq = pe(cs, Q(q));
    const [xM, vM, xm, vm] = a > 0 ? [p, fp, q, fq] : [q, fq, p, fp];
    return { text: yEq(cs), ans: `${V("x")}＝${xM} で極大値 ${num(vM)}，${V("x")}＝${xm} で極小値 ${num(vm)}`, meta: { cs, xM, xm, vM: qv(vM), vm: qv(vm) } };
  }, (pr) => {
    const m = pr.meta, f = (x) => qv(pe(m.cs, Q(Math.round(x * 64), 64))), g = (x) => m.cs.reduce((acc, c) => acc * x + qv(c), 0);
    if (m.none) {
      for (let x = -6; x < 6; x += 0.01) if (g(x + 0.01) < g(x) !== (qv(m.cs[0]) < 0) && Math.abs(g(x + 0.01) - g(x)) > 1e-9) return "極値がある";
      return null;
    }
    const h = 0.01;
    const isMax = (x) => g(x) > g(x - h) && g(x) > g(x + h), isMin = (x) => g(x) < g(x - h) && g(x) < g(x + h);
    return isMax(m.xM) && isMin(m.xm) && near(g(m.xM), m.vM) && near(g(m.xm), m.vm) ? null : "極値が合わない";
  }, { work: 40 });

  const maxminD = gen("k2.maxminD", "次の関数の、[ ] 内の範囲での最大値と最小値を求めましょう。", lv({ types: [0] }, { types: [0] }, { types: [0] }), (rng) => {
    const r = cubicWith(rng);
    if (!r) return null;
    const { cs, p, q } = r, s = rng.int(p - 2, p), t = rng.int(q, q + 2);
    if (s === t) return null;
    const xs = [s, t, p, q].filter((x, i, a) => a.indexOf(x) === i && x >= s && x <= t), vs = xs.map((x) => qv(pe(cs, Q(x))));
    const M = Math.max(...vs), mn = Math.min(...vs);
    const at = (v) => xs.filter((x, i) => vs[i] === v).sort((u, w) => u - w).join(", ");
    return { text: `${yEq(cs)}　[${num(Q(s))}≦${V("x")}≦${num(Q(t))}]`, ans: `${V("x")}＝${at(M)} で最大値 ${num(Q(M))}，${V("x")}＝${at(mn)} で最小値 ${num(Q(mn))}`, wide: true, meta: { cs, s, t, M, mn } };
  }, (pr) => {
    const m = pr.meta;
    let M = -Infinity, mn = Infinity;
    for (let x = m.s; x <= m.t + 1e-9; x += 1 / 64) {
      const v = m.cs.reduce((a, c) => a * x + qv(c), 0);
      M = Math.max(M, v), mn = Math.min(mn, v);
    }
    return near(M, m.M) && near(mn, m.mn) ? null : "最大・最小が合わない";
  }, { work: 40 });

  // 3次関数のグラフ(図)
  const CUB = [[1, 0, -3, 0], [-1, 3, 0, 0], [1, -3, 0, 2], [1, -6, 9, 0], [-1, 0, 3, 1], [-1, 3, 0, -2], [1, 3, 0, -1], [1, 0, -3, 1], [-1, 6, -9, 3], [1, -3, 0, 0]];
  const cubicGraph = gen("k2.cubicGraph", null, lv({ types: [0] }, { types: [0] }, { types: [0] }), (rng) => {
    const c = rng.pick(CUB), cs = c.map((v) => Q(v));
    const f = (x) => c[0] * x ** 3 + c[1] * x ** 2 + c[2] * x + c[3];
    const d = der(cs), D = qv(d[1]) ** 2 - 4 * qv(d[0]) * qv(d[2]);
    const r1 = (-qv(d[1]) - Math.sqrt(D)) / (2 * qv(d[0])), r2 = (-qv(d[1]) + Math.sqrt(D)) / (2 * qv(d[0]));
    const ex = [r1, r2].sort((u, w) => u - w);
    if (ex.some((x) => !Number.isInteger(Math.round(x * 1e9) / 1e9)) || ex.some((x) => Math.abs(f(x)) > 5)) return null;
    const pl = planeR(-3, 5, -5, 5, 6);
    const cv = curve(pl, f, -3.3, 5.3, { color: RED, tag: c.join(",") });
    const [xM, xm] = c[0] > 0 ? ex : [ex[1], ex[0]];
    return { text: `関数 ${yEq(cs)} の増減を調べて、グラフをかきましょう。また、極値を求めましょう。`, fig: draw(pl.w, pl.h, pl.items), ans: `図のとおり。${V("x")}＝${Math.round(xM)} で極大値 ${Math.round(f(xM))}，${V("x")}＝${Math.round(xm)} で極小値 ${Math.round(f(xm))}`, ansFig: draw(pl.w, pl.h, [...pl.items, cv, dotAt(pl, xM, f(xM), { color: RED }), dotAt(pl, xm, f(xm), { color: RED })]), side: true, key: `cg:${c}`, meta: { c } };
  }, (pr) => pr.answer.figure.items.some((it) => it.tag === pr.meta.c.join(",")) ? null : "グラフが合わない");

  // 微分の利用(文章題)
  const DIFW = {
    box: (rng) => {
      const a = rng.pick([6, 12, 18, 24, 30]), x = a / 6, Vv = x * (a - 2 * x) ** 2;
      return { t: `1辺の長さが ${a}cm の正方形の厚紙の四すみから、1辺の長さが [[v:x]]cm の正方形を切り取り、残りを折り曲げてふたのない箱を作ります。箱の容積が最大になるときの [[v:x]] の値と、そのときの容積を求めましょう。`, a: `[[v:x]]＝${x} のとき 最大 ${Vv}cm³`, chk: () => {
        let best = 0;
        for (let t = 0; t <= a / 2; t += a / 6000) best = Math.max(best, t * (a - 2 * t) ** 2);
        return near(best, Vv, 1e-5);
      } };
    },
    rect: (rng) => {
      const [a, b, x, Vv] = rng.pick([[16, 10, 2, 144], [24, 9, 2, 200], [8, 5, 1, 18], [48, 18, 4, 1600], [30, 14, 3, 576]]);
      return { t: `縦 ${b}cm、横 ${a}cm の長方形の厚紙の四すみから、1辺の長さが [[v:x]]cm の正方形を切り取り、残りを折り曲げてふたのない箱を作ります。箱の容積が最大になるときの [[v:x]] の値と、そのときの容積を求めましょう。`, a: `[[v:x]]＝${x} のとき 最大 ${Vv}cm³`, chk: () => {
        let best = 0;
        for (let t = 0; t <= b / 2; t += b / 20000) best = Math.max(best, t * (a - 2 * t) * (b - 2 * t));
        return near(best, Vv, 1e-5);
      } };
    },
    roots: (rng) => {
      const p = rng.int(1, 2), k = 2 * p ** 3, ask = rng.int(0, 2);
      const T = [[`異なる3つの実数解をもつ`, `－${k}＜${V("k")}＜${k}`], [`異なる2つの実数解をもつ`, `${V("k")}＝±${k}`], [`ただ1つの実数解をもつ`, `${V("k")}＜－${k}, ${k}＜${V("k")}`]][ask];
      return { t: `${V("x")} の方程式 ${V("x")}³－${3 * p * p}${V("x")}－${V("k")}＝0 が${T[0]}ような、定数 [[v:k]] の値の範囲(または値)を求めましょう。`, a: T[1], chk: () => {
        const cnt = (kk) => {
          let n = 0;
          const f = (x) => x ** 3 - 3 * p * p * x - kk;
          for (let x = -20; x < 20; x += 0.001) if (f(x) === 0 || f(x) * f(x + 0.001) < 0) n++;
          return n;
        };
        return cnt(0) === 3 && cnt(k + 1) === 1 && cnt(-k - 1) === 1;
      } };
    },
    cyl: (rng) => {
      // 表面積が一定の…は難しいので、半径 R の球に内接する円柱の体積
      const R = rng.pick([3, 6]), h = 2 * R / Math.sqrt(3), r2 = R * R - h * h / 4, Vv = Math.PI * r2 * h;
      const ans = K.k1.surdAns("", Vv / Math.PI);
      return { t: `半径 ${R} の球に内接する円柱の体積の最大値を求めましょう。`, a: `${ans}π`, chk: () => {
        let best = 0;
        for (let t = 0; t <= 2 * R; t += R / 5000) best = Math.max(best, Math.PI * (R * R - t * t / 4) * t);
        return near(best, Vv, 1e-5);
      } };
    }
  };
  const diffWord = gen("k2.diffWord", null, lv({ types: ["box", "rect"] }, { types: ["box", "rect", "roots"] }, { types: ["roots", "cyl", "rect", "box"] }), (rng, type) => {
    const r = DIFW[type](rng);
    return { text: r.t, ans: r.a, softKey: type, meta: { chk: r.chk }, ws: { type: "lines", labels: ["答え"] }, work: 60 };
  }, (pr) => pr.meta.chk() ? null : "答えが合わない");
  H["k2.deriv"] = "(x[[^n]])′＝nx[[^n－1]]、定数の微分は 0。積は展開してから微分します。";
  H["k2.tangent"] = "曲線 y＝f(x) 上の点 (a, f(a)) における接線は y－f(a)＝f′(a)(x－a)。接点がわからないときは、接点を (t, f(t)) とおきます。";
  H["k2.extremum"] = "f′(x)＝0 となる x を求め、増減表をかきます。f′ の符号が ＋ から － に変わるところが極大、－ から ＋ が極小です。";
  H["k2.maxminD"] = "増減表をかき、極値と区間の両端の値を比べます。";
  H["k2.cubicGraph"] = "f′(x) の符号で増減表をかき、極大・極小の点と y 軸との交点をとってなめらかに結びます。";
  H["k2.diffWord"] = "求める量を x の関数で表し、x のとりうる範囲で増減表をかきます。方程式 f(x)＝k の実数解の個数は、y＝f(x) と y＝k の共有点の個数です。";

  // ============================================================
  // 7 積分法
  // ============================================================
  const indef = gen("k2.indef", "次の不定積分を求めましょう。", lv({ types: ["poly", "poly"] }, { types: ["poly", "prod"] }, { types: ["prod", "cond", "poly"] }), (rng, type) => {
    if (type === "cond") {
      // F′(x)＝f(x), F(a)＝b
      const cs = randPoly(rng, 2), a = rng.int(-2, 2), b = rng.int(-5, 5), F = integ(cs), C0 = qs(Q(b), pe(F, Q(a)));
      const Fc = padd(F, [C0]);
      return { text: `${V("F")}′(${V("x")})＝${pTex(cs)}，${V("F")}(${a})＝${b} を満たす関数 ${V("F")}(${V("x")})`, ans: `${V("F")}(${V("x")})＝${pTex(Fc)}`, meta: { f: pTex(cs), F: pTex(Fc), a, b } };
    }
    if (type === "prod") {
      const A = [Q(1), Q(nz(rng, -4, 4))], B = [Q(rng.int(1, 3)), Q(nz(rng, -4, 4))], cs = pmul(A, B);
      return { text: `[[int::]](${pTex(A)})(${pTex(B)})d${V("x")}`, ans: `${pTex(integ(cs))}＋[[v:C]]`, meta: { f: `(${pTex(A)})(${pTex(B)})`, F: pTex(integ(cs)) } };
    }
    const cs = randPoly(rng, rng.int(1, 3)), q = pTex(cs), F = integ(cs), tx = `[[int::]](${q})d${V("x")}`;
    return { text: tx, ans: `${pTex(F)}＋[[v:C]]`, meta: { f: q, F: pTex(F) } };
  }, (pr) => {
    const m = pr.meta, h = 1e-5;
    for (const x of [-1.7, 0.3, 1.9]) if (Math.abs((evalH(m.F, { x: x + h }) - evalH(m.F, { x: x - h })) / (2 * h) - evalH(m.f, { x })) > 1e-4) return "不定積分が合わない";
    if (m.a !== undefined && !near(evalH(m.F, { x: m.a }), m.b)) return "条件に合わない";
    return null;
  }, { work: 24 });

  // 定積分
  const intTex = (a, b) => `[[int:${a}:${b}]]`;
  const defint = gen("k2.defint", "次の定積分を求めましょう。", lv({ types: ["poly", "poly"] }, { types: ["poly", "sixth", "split"] }, { types: ["sixth", "abs", "split"] }), (rng, type) => {
    if (type === "abs") {
      const c = rng.int(-1, 2), a = rng.int(c - 3, c - 1), b = rng.int(c + 1, c + 3);
      const v = Q((c - a) ** 2 + (b - c) ** 2, 2);
      const inner = c === 0 ? V("x") : `${V("x")}${c < 0 ? "＋" : "－"}${Math.abs(c)}`;
      return { text: `${intTex(num(Q(a)), num(Q(b)))}|${inner}|d${V("x")}`, ans: num(v), meta: { g: (x) => Math.abs(x - c), a, b, v: qv(v) } };
    }
    if (type === "sixth") {
      const al = rng.int(-3, 1), be = rng.int(al + 1, 4);
      const v = Q(-((be - al) ** 3), 6);
      return { text: `${intTex(num(Q(al)), num(Q(be)))}(${pTex([Q(1), Q(-al)])})(${pTex([Q(1), Q(-be)])})d${V("x")}`, ans: num(v), meta: { g: (x) => (x - al) * (x - be), a: al, b: be, v: qv(v) } };
    }
    if (type === "split") {
      // ∫a^c f ＋ ∫c^b f ＝ ∫a^b f
      const cs = randPoly(rng, 2, 4), a = rng.int(-2, 0), c = rng.int(1, 2), b = rng.int(3, 4), F = integ(cs);
      const v = qs(pe(F, Q(b)), pe(F, Q(a)));
      return { text: `${intTex(num(Q(a)), c)}(${pTex(cs)})d${V("x")}＋${intTex(c, b)}(${pTex(cs)})d${V("x")}`, ans: num(v), meta: { cs, a, b, v: qv(v) } };
    }
    const cs = randPoly(rng, rng.int(1, 3), 4), a = rng.int(-2, 1), b = rng.int(a + 1, 3), F = integ(cs);
    const v = qs(pe(F, Q(b)), pe(F, Q(a)));
    return { text: `${intTex(num(Q(a)), b)}(${pTex(cs)})d${V("x")}`, ans: num(v), meta: { cs, a, b, v: qv(v) } };
  }, (pr) => {
    const m = pr.meta, f = m.g || ((x) => m.cs.reduce((acc, c) => acc * x + qv(c), 0));
    // シンプソンの公式
    const n = 2000, hh = (m.b - m.a) / n;
    let s = f(m.a) + f(m.b);
    for (let i = 1; i < n; i++) s += f(m.a + i * hh) * (i % 2 ? 4 : 2);
    const I0 = s * hh / 3;
    return Math.abs(I0 - m.v) < 1e-6 && near(evalH(pr.answer.display), m.v) ? null : "定積分の値が合わない";
  }, { work: 30 });

  // 面積
  const areaQ = gen("k2.area", "次の面積 [[v:S]] を求めましょう。", lv({ types: ["xaxis", "xaxis"] }, { types: ["xaxis", "line"] }, { types: ["line", "two", "range"] }), (rng, type) => {
    if (type === "xaxis") {
      const al = rng.int(-3, 1), be = rng.int(al + 1, 4), a = rng.pick([1, -1, 2]);
      const cs = [Q(a), Q(-a * (al + be)), Q(a * al * be)];
      const v = Q(Math.abs(a) * (be - al) ** 3, 6);
      return { text: `放物線 ${yEq(cs)} と [[v:x]] 軸で囲まれた部分`, ans: `${V("S")}＝${num(v)}`, meta: { f: (x) => Math.abs(a * (x - al) * (x - be)), a: al, b: be, v: qv(v) } };
    }
    if (type === "line") {
      const al = rng.int(-3, 1), be = rng.int(al + 1, 4), m = rng.int(-3, 3), n = rng.int(-3, 3);
      const cs = [Q(1), Q(-(al + be) + m), Q(al * be + n)];
      const v = Q((be - al) ** 3, 6);
      return { text: `放物線 ${yEq(cs)} と直線 ${V("y")}＝${pTex([Q(m), Q(n)])} で囲まれた部分`, ans: `${V("S")}＝${num(v)}`, meta: { f: (x) => Math.abs((x - al) * (x - be)), a: al, b: be, v: qv(v) } };
    }
    if (type === "two") {
      // y＝x²＋… と y＝－x²＋…:差 2(x－α)(x－β)
      const al = rng.int(-2, 1), be = rng.int(al + 1, 3), b2 = rng.int(-2, 2), c2 = rng.int(-3, 3);
      const g = [Q(-1), Q(b2), Q(c2)], f = padd(g, [Q(2), Q(-2 * (al + be)), Q(2 * al * be)]);
      const v = Q(2 * (be - al) ** 3, 6);
      return { text: `2つの放物線 ${yEq(f)}，${yEq(g)} で囲まれた部分`, ans: `${V("S")}＝${num(v)}`, wide: true, meta: { f: (x) => Math.abs(2 * (x - al) * (x - be)), a: al, b: be, v: qv(v) } };
    }
    // y＝x²－k と x軸、および x＝0, x＝c(符号が変わる)
    const r = rng.int(1, 2), c = rng.int(r + 1, r + 2);
    const v = qa(Q(2 * r ** 3, 3), Q(c ** 3 - 3 * r * r * c + 2 * r ** 3, 3));
    return { text: `放物線 ${V("y")}＝${V("x")}²－${r * r} と [[v:x]] 軸、および2直線 [[v:x]]＝0，[[v:x]]＝${c} で囲まれた2つの部分の面積の和`, ans: `${V("S")}＝${num(v)}`, wide: true, meta: { f: (x) => Math.abs(x * x - r * r), a: 0, b: c, v: qv(v) } };
  }, (pr) => {
    const m = pr.meta, n = 4000, hh = (m.b - m.a) / n;
    let s = 0;
    for (let i = 0; i < n; i++) s += m.f(m.a + (i + 0.5) * hh) * hh;
    return Math.abs(s - m.v) < 1e-4 && near(evalH(pr.answer.display.replace(/^.*＝/, "")), m.v) ? null : "面積が合わない";
  }, { work: 36 });

  // 面積(図)
  const areaFig = gen("k2.areaFig", null, lv({ types: ["xaxis"] }, { types: ["xaxis", "line"] }, { types: ["line", "line"] }), (rng, type) => {
    const al = rng.int(-2, 1), be = rng.int(al + 2, 4), m = type === "line" ? rng.int(-1, 1) : 0, n = type === "line" ? rng.int(-1, 2) : 0;
    const f = (x) => (x - al) * (x - be) + m * x + n, g = (x) => m * x + n;
    const vmin = f((al + be) / 2);
    if (vmin < -5 || f(-3) > 7 && f(5) > 7 && false) return null;
    const pl = planeR(-3, 5, Math.min(-5, Math.floor(vmin) - 1), 5, 5.5);
    const pts = [];
    for (let i = 0; i <= 60; i++) {
      const x = al + (be - al) * i / 60;
      pts.push([pl.X(x), pl.Y(f(x))]);
    }
    for (let i = 60; i >= 0; i--) {
      const x = al + (be - al) * i / 60;
      pts.push([pl.X(x), pl.Y(g(x))]);
    }
    const cs = [Q(1), Q(-(al + be) + m), Q(al * be + n)];
    const items = [...pl.items];
    items.splice(1, 0, { t: "poly", pts, fill: "#d9d9d9", w: 0 });
    items.push(curve(pl, f, -3.3, 5.3), ...type === "line" ? [curve(pl, g, -3.3, 5.3, { w: 0.5 })] : []);
    items.push(T_(pl.X(be + 0.6) + 2, pl.Y(Math.min(f(be + 0.6), pl.y1 - 0.4)), `[[v:y]]＝${pTex(cs)}`, 3, { anchor: "start" }));
    if (type === "line" && (m || n)) items.push(T_(pl.X(-2.6), pl.Y(g(-2.6)) - 2, `[[v:y]]＝${pTex([Q(m), Q(n)])}`, 3, { anchor: "start" }));
    const v = Q((be - al) ** 3, 6);
    return { text: "右の図の灰色の部分の面積を求めましょう。", fig: draw(pl.w + 18, pl.h, items), ans: num(v), side: true, key: `af:${type}:${al}:${be}:${m}:${n}`, meta: { f: (x) => Math.abs(f(x) - g(x)), a: al, b: be, v: qv(v) } };
  }, (pr) => {
    const m = pr.meta, nn = 4000, hh = (m.b - m.a) / nn;
    let s = 0;
    for (let i = 0; i < nn; i++) s += m.f(m.a + (i + 0.5) * hh) * hh;
    return Math.abs(s - m.v) < 1e-4 ? null : "面積が合わない";
  });

  // 定積分で表された関数
  const intFunc = gen("k2.intFunc", "次の問いに答えましょう。", lv({ types: ["diff"] }, { types: ["diff", "const"] }, { types: ["const", "find", "find"] }), (rng, type) => {
    if (type === "diff") {
      const cs = randPoly(rng, 2), a = rng.int(-2, 2);
      return { text: `${V("x")} の関数 ${intTex(a, V("x"))}(${pTex(cs, "t")})d${V("t")} を ${V("x")} で微分する`, ans: pTex(cs), meta: { cs, a } };
    }
    if (type === "const") {
      // f(x) ＝ g(x) ＋ ∫0^2 f(t)dt → k ＝ G ＋ 2k → k ＝ －G
      const g = [Q(rng.int(1, 3)), Q(rng.int(-4, 4)), Q(0)], G = qs(pe(integ(g), Q(2)), Q(0)), k = qneg(G);
      const f = padd(g, [k]);
      return { text: `等式 ${V("f")}(${V("x")})＝${pTex(g)}＋${intTex(0, 2)}${V("f")}(${V("t")})d${V("t")} を満たす関数 ${V("f")}(${V("x")})`, ans: `${V("f")}(${V("x")})＝${pTex(f)}`, meta: { f, g } };
    }
    // ∫a^x f(t)dt ＝ x²＋bx＋c → f(x)＝2x＋b、a は x²＋bx＋c ＝ 0 の解
    const r1 = rng.int(-3, 1), r2 = rng.int(r1 + 1, 4), b = -(r1 + r2), c = r1 * r2;
    return { text: `等式 ${intTex(V("a"), V("x"))}${V("f")}(${V("t")})d${V("t")}＝${pTex([Q(1), Q(b), Q(c)])} を満たす関数 ${V("f")}(${V("x")}) と定数 [[v:a]] の値`, ans: `${V("f")}(${V("x")})＝${pTex([Q(2), Q(b)])}，${V("a")}＝${r1}, ${r2}`, wide: true, meta: { r: [r1, r2], b, c } };
  }, (pr) => {
    const m = pr.meta;
    if (m.a !== undefined) return null;
    if (m.f) {
      // f(x) ＝ g(x) ＋ ∫0^2 f
      const I0 = qs(pe(integ(m.f), Q(2)), Q(0));
      return [0, 1, 2.5].every((x) => near(qv(pe(m.f, K.toQ(x))), qv(pe(m.g, K.toQ(x))) + qv(I0))) ? null : "関数が合わない";
    }
    return m.r.every((a) => a * a + m.b * a + m.c === 0) ? null : "a が合わない";
  }, { work: 36 });
  H["k2.indef"] = "∫x[[^n]]dx＝[[f:1/n＋1]]x[[^n＋1]]＋C。積は展開してから積分します。";
  H["k2.defint"] = "[[int:a:b]]f(x)dx＝F(b)－F(a)。[[int:α:β]](x－α)(x－β)dx＝－[[f:1/6]](β－α)³。絶対値は場合分けします。";
  H["k2.area"] = "2つのグラフの交点の x 座標を求め、(上の式)－(下の式) を積分します。放物線と直線の間は [[f:1/6]](β－α)³ も使えます。";
  H["k2.areaFig"] = "囲まれた部分の両端の x 座標(交点)を求め、上のグラフの式から下のグラフの式を引いて積分します。";
  H["k2.intFunc"] = "[[f:d/dx]][[int:a:x]]f(t)dt＝f(x)。[[int:0:2]]f(t)dt は定数なので k とおきます。";

  for (const [k, v] of Object.entries(H)) K.hints[k] = X(v);
  return [deriv, tangent, extremum, maxminD, cubicGraph, diffWord, indef, defint, areaQ, areaFig, intFunc];
})();
kou2.push(...kou2c);

var kou2Grade = (() => {
  const T = (label, generator, kinds, o = {}) => ({ label, generator, kinds, ...o });
  const D = ["drill", "test"], W = ["word", "test"], F = ["figure", "test"];
  const units = [
    ["k2-01", "式と証明", "いろいろな式", [T("二項定理", "k2.binom", D), T("整式の割り算", "k2.polyDiv", D), T("分数式", "k2.fracExpr", D), T("恒等式", "k2.identity", D), T("相加平均と相乗平均", "k2.amgm", D)], { drill: [10, 10] }],
    ["k2-02", "複素数と方程式", "いろいろな式", [T("複素数の計算", "k2.complex", D, { weight: 2 }), T("二次方程式の解", "k2.quadC", D), T("解と係数の関係", "k2.vieta", D), T("剰余の定理・因数定理", "k2.remThm", D), T("高次方程式", "k2.highEq", D)], { drill: [10, 10] }],
    ["k2-03", "図形と方程式", "図形と方程式", [T("点の座標", "k2.points", D), T("直線の方程式", "k2.lines", D, { weight: 2 }), T("円の方程式", "k2.circleEq", D), T("円と直線", "k2.circleLine", D), T("軌跡", "k2.locus", D), T("不等式の表す領域", "k2.region", F), T("領域と最大・最小", "k2.lp", W)], { drill: [8, 10], figure: [1, 10], word: [1, 10] }],
    ["k2-04", "三角関数", "三角関数", [T("弧度法", "k2.radian", D), T("三角関数の値", "k2.trigVal", D), T("三角関数のグラフ", "k2.trigGraph", F), T("加法定理", "k2.addForm", D, { weight: 2 }), T("三角関数の方程式・不等式", "k2.trigEq", D), T("三角関数の合成", "k2.synth", D)], { drill: [8, 10], figure: [2, 10] }],
    ["k2-05", "指数関数と対数関数", "指数関数・対数関数", [T("指数の計算", "k2.expCalc", D), T("指数方程式・不等式", "k2.expEq", D), T("対数の計算", "k2.logCalc", D, { weight: 2 }), T("対数方程式・不等式", "k2.logEq", D), T("大小比較", "k2.compare", D), T("常用対数の利用", "k2.logWord", W)], { drill: [8, 10], word: [2, 10] }],
    ["k2-06", "微分法", "微分・積分の考え", [T("導関数", "k2.deriv", D), T("接線", "k2.tangent", D), T("極値", "k2.extremum", D), T("最大値・最小値", "k2.maxminD", D), T("3次関数のグラフ", "k2.cubicGraph", F), T("微分の利用", "k2.diffWord", W)], { drill: [6, 10], figure: [2, 10], word: [2, 10] }],
    ["k2-07", "積分法", "微分・積分の考え", [T("不定積分", "k2.indef", D), T("定積分", "k2.defint", D, { weight: 2 }), T("面積", "k2.area", D, { weight: 2 }), T("面積(図)", "k2.areaFig", F), T("定積分で表された関数", "k2.intFunc", D)], { drill: [8, 10], figure: [2, 10] }]
  ];
  return {
    grade: 12,
    note: "高校 数学Ⅱ。学習指導要領(平成30年告示)の内容。問題文はすべてこのファイルで作ったもの。",
    units: units.map(([id, name, domain, topics, testPlan], i) => ({ id, order: i + 1, name, rubyName: name, domain, topics, testPlan }))
  };
})();
