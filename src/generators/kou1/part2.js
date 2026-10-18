  // ============================================================
  // 4 二次関数(つづき:kou1 の中)
  // ============================================================
var kou1b = (() => {
  const K = kouLib;
  const { Q, qa, qs, qm, qd, qneg, qeq, qabs, isInt, qv, num, absTex, gcd, lv, nz, X, V, evalH, near, sameH, pTex, sg, sgQ, vertexTex, quadRoots, rootTex, surdTex, gen, redo, planeR, curve, dotAt, T_, RED, draw, ptQ } = K;
  const H = K.k1.H;
  const AS = { basic: [[1], [2], [-1], [-2]], normal: [[1], [2], [-1], [-2], [3], [-3]], challenge: [[1], [2], [-1], [-3], [1, 2], [-1, 2], [3]] };
  // y＝ax²＋bx＋c の係数(a, p, q から)
  const std = (a, p, q) => [a, qm(Q(-2), qm(a, p)), qa(qm(a, qm(p, p)), q)];
  const yEq = (cs) => `${V("y")}＝${pTex(cs)}`;
  const vertex = gen("k1.vertex", "次の問いに答えましょう。", lv({ types: ["complete", "vertex"] }, { types: ["complete", "vertex", "frac"] }, { types: ["frac", "complete", "vertex", "fracA"] }), (rng, type, p) => {
    let a, pp, q;
    if (type === "frac") {
      // 係数は整数で、頂点が分数になるもの
      const A = rng.pick([1, -1, 2, -2]), B = nz(rng, -7, 7), Cc = rng.int(-6, 6);
      a = Q(A), pp = Q(-B, 2 * A), q = Q(4 * A * Cc - B * B, 4 * A);
      if (isInt(pp)) return null;
    } else if (type === "fracA") {
      a = Q(rng.pick([1, -1]), 2), pp = Q(nz(rng, -4, 4)), q = Q(rng.int(-6, 6));
    } else {
      a = Q(...rng.pick(AS[p.set || "basic"])), pp = Q(nz(rng, -5, 5)), q = Q(rng.int(-9, 9));
    }
    const cs = std(a, pp, q);
    const eq = yEq(cs);
    if (type === "vertex" || rng.chance(0.25) && type !== "complete") return { text: `二次関数 ${eq} のグラフの頂点と軸を求めましょう。`, ans: `頂点 ${ptQ(pp, q)}，軸 直線 ${V("x")}＝${num(pp)}`, meta: { cs, pp, q } };
    return { text: `${eq} を [[v:y]]＝[[v:a]]([[v:x]]－[[v:p]])²＋[[v:q]] の形に変形しましょう。`, ans: `${V("y")}＝${vertexTex(a, pp, q)}`, meta: { cs, pp, q, vf: vertexTex(a, pp, q) } };
  }, (pr) => {
    const m = pr.meta, f = pTex(m.cs);
    if (m.vf) return sameH(f, m.vf) ? null : "平方完成が合わない";
    const h = 1e-4, x0 = qv(m.pp), d = (evalH(f, { x: x0 + h }) - evalH(f, { x: x0 - h })) / (2 * h);
    return Math.abs(d) < 1e-6 && near(evalH(f, { x: x0 }), qv(m.q)) ? null : "頂点が合わない";
  }, { work: 26 });

  // グラフ(図)
  const GA = [[1], [-1], [2], [-2], [1, 2], [-1, 2]];
  const graphQ = gen("k1.graph", null, lv({ types: ["read", "draw"], set: 4 }, { types: ["read", "draw"], set: 6 }, { types: ["read", "read", "draw"], set: 6 }), (rng, type, p) => {
    const a = Q(...rng.pick(GA.slice(0, p.set))), pp = rng.int(-3, 3), q = rng.int(-4, 4);
    const f = (x) => qv(a) * (x - pp) ** 2 + q;
    // 頂点以外に、格子点を2つ以上通る(図から読める)
    const lat = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].filter((d) => Math.abs(pp + d) <= 5 && Number.isInteger(f(pp + d)) && Math.abs(f(pp + d)) <= 5);
    if (lat.length < 2) return null;
    const pl = planeR(-5, 5, -5, 5, 6);
    const cv = curve(pl, f, -5.4, 5.4, { tag: `${qv(a)}:${pp}:${q}` });
    const cs = std(a, Q(pp), Q(q));
    if (type === "draw") {
      const ansItems = [...pl.items, { ...cv, color: RED }, dotAt(pl, pp, q, { color: RED })];
      return { text: `二次関数 ${yEq(cs)} のグラフをかきましょう。また、頂点の座標を答えましょう。`, fig: draw(pl.w, pl.h, pl.items), ans: `図のとおり。頂点 ${ptQ(Q(pp), Q(q))}`, ansFig: draw(pl.w, pl.h, ansItems), side: true, meta: { a: qv(a), pp, q } };
    }
    return { key: `gr:r:${qv(a)}:${pp}:${q}`, text: `右の図の放物線は、二次関数のグラフです。この二次関数を [[v:y]]＝[[v:a]][[v:x]]²＋[[v:b]][[v:x]]＋[[v:c]] の形で表しましょう。`, fig: draw(pl.w, pl.h, [...pl.items, cv, dotAt(pl, pp, q)]), ans: yEq(cs), side: true, meta: { a: qv(a), pp, q, cs } };
  }, (pr) => {
    const m = pr.meta;
    const fig = pr.answer.figure || pr.figure;
    const path = fig.items.find((it) => it.tag);
    if (!path || path.tag !== `${m.a}:${m.pp}:${m.q}`) return "グラフが合わない";
    if (m.cs) {
      const f = pTex(m.cs);
      for (const x of [-2, 0, 1, 3]) if (!near(evalH(f, { x }), m.a * (x - m.pp) ** 2 + m.q)) return "式がグラフと合わない";
    }
    return null;
  });

  // 最大・最小
  const maxmin = gen("k1.maxmin", "次の問いに答えましょう。", lv({ types: ["all", "inside", "edge"] }, { types: ["inside", "edge", "inside"] }, { types: ["inside", "edge", "findC", "findC"] }), (rng, type) => {
    const a = Q(rng.pick([1, 2, -1, -2])), pp = rng.int(-3, 3), q = rng.int(-6, 6);
    const cs = std(a, Q(pp), Q(q)), fs = pTex(cs), f = (x) => qv(a) * (x - pp) ** 2 + q;
    if (type === "all") {
      const mx = a[0] < 0;
      return { text: `二次関数 ${V("y")}＝${fs} の最大値または最小値を求めましょう。`, ans: `${V("x")}＝${pp} で${mx ? "最大値" : "最小値"} ${num(Q(q))}(${mx ? "最小値" : "最大値"}はない)`, meta: { f, all: true, mx, pp, q } };
    }
    let s, t;
    if (type === "inside" || type === "findC") {
      s = pp - rng.int(1, 3), t = pp + rng.int(1, 3);
    } else {
      s = rng.chance(0.5) ? pp + rng.int(1, 2) : pp - rng.int(3, 5);
      t = s + rng.int(1, 3);
      if (s <= pp && pp <= t) return null;
    }
    const xs = [s, t, ...(s <= pp && pp <= t ? [pp] : [])], vs = xs.map(f);
    const M = Math.max(...vs), m0 = Math.min(...vs);
    const at = (v) => [...new Set(xs.filter((x) => f(x) === v))].sort((u, w) => u - w).map((x) => num(Q(x))).join(", ");
    const dom = `(${num(Q(s))}≦${V("x")}≦${num(Q(t))})`;
    if (type === "findC") {
      // y＝ax²＋bx＋c の c を、最大値(または最小値)から
      const mx = rng.chance(0.5), target = mx ? M : m0;
      const c0 = qv(cs[2]);
      const fc = pTex([cs[0], cs[1], Q(0)]) + "＋" + V("c");
      return { text: `二次関数 ${V("y")}＝${fc} ${dom} の${mx ? "最大値" : "最小値"}が ${num(Q(target))} であるとき、定数 [[v:c]] の値を求めましょう。`, ans: `${V("c")}＝${num(Q(c0))}`, wide: true, meta: { chk: { cs, s, t, mx, target, c: c0 } } };
    }
    return { text: `二次関数 ${V("y")}＝${fs} ${dom} の最大値と最小値を求めましょう。`, ans: `${V("x")}＝${at(M)} で最大値 ${num(Q(M))}，${V("x")}＝${at(m0)} で最小値 ${num(Q(m0))}`, wide: true, meta: { f, s, t, M, m0 } };
  }, (pr) => {
    const m = pr.meta;
    if (m.chk) {
      const { cs, s, t, mx, target, c } = m.chk;
      let best = mx ? -Infinity : Infinity;
      for (let x = s; x <= t + 1e-9; x += 1 / 64) {
        const v = qv(cs[0]) * x * x + qv(cs[1]) * x + c;
        best = mx ? Math.max(best, v) : Math.min(best, v);
      }
      return near(best, target, 1e-6) ? null : "定数が合わない";
    }
    if (m.all) return null;
    let M = -Infinity, mn = Infinity;
    for (let x = m.s; x <= m.t + 1e-9; x += 1 / 64) M = Math.max(M, m.f(x)), mn = Math.min(mn, m.f(x));
    return near(M, m.M, 1e-6) && near(mn, m.m0, 1e-6) ? null : "最大・最小が合わない";
  }, { work: 30 });

  // 二次関数の決定
  const determine = gen("k1.determine", "次の問いに答えましょう。", lv({ types: ["vertexPt", "axis2"] }, { types: ["vertexPt", "three", "xInt"] }, { types: ["three", "xInt", "axis2", "three"] }), (rng, type) => {
    const a = nz(rng, -3, 3), b = rng.int(-6, 6), c = rng.int(-8, 8);
    const f = (x) => a * x * x + b * x + c;
    const cs = [Q(a), Q(b), Q(c)];
    const P2 = (x) => ptQ(Q(x), Q(f(x)));
    let cond;
    if (type === "vertexPt") {
      const pp = Q(-b, 2 * a);
      if (!isInt(pp)) return null;
      const x1 = qv(pp) + rng.pick([-2, -1, 1, 2, 3]);
      cond = `頂点が点 ${ptQ(pp, Q(f(qv(pp))))} で、点 ${P2(x1)} を通る`;
    } else if (type === "axis2") {
      const pp = Q(-b, 2 * a);
      if (!isInt(pp)) return null;
      const [x1, x2] = [qv(pp) + rng.pick([-2, -1]), qv(pp) + rng.pick([1, 3])];
      cond = `軸が直線 ${V("x")}＝${num(pp)} で、2点 ${P2(x1)}，${P2(x2)} を通る`;
    } else if (type === "three") {
      const xs = rng.shuffle([-2, -1, 0, 1, 2, 3]).slice(0, 3).sort((u, v) => u - v);
      cond = `3点 ${xs.map(P2).join("，")} を通る`;
    } else {
      const D = b * b - 4 * a * c, sd = Math.round(Math.sqrt(Math.max(D, 0)));
      if (D <= 0 || sd * sd !== D || (-b - sd) % (2 * a) || (-b + sd) % (2 * a)) return null;
      const r1 = (-b - sd) / (2 * a), r2 = (-b + sd) / (2 * a), x3 = rng.pick([-1, 0, 1, 2].filter((x) => x !== r1 && x !== r2));
      cond = `[[v:x]] 軸と2点 ${ptQ(Q(Math.min(r1, r2)), Q(0))}，${ptQ(Q(Math.max(r1, r2)), Q(0))} で交わり、点 ${P2(x3)} を通る`;
    }
    return { text: `グラフが次の条件を満たす二次関数を求めましょう。[[br]]${cond}`, ans: yEq(cs), wide: true, softKey: type, meta: { cs } };
  }, (pr) => {
    // 条件に出てくる点をすべて通るか
    const f = pTex(pr.meta.cs);
    for (const m of pr.text.matchAll(/\(([－\d]+), ([－\d]+)\)/g)) {
      const x = Number(m[1].replace("－", "-")), y = Number(m[2].replace("－", "-"));
      if (!near(evalH(f, { x }), y)) return "点を通らない";
    }
    return null;
  }, { work: 40 });

  // 平行移動・対称移動
  const move = gen("k1.move", "次の問いに答えましょう。", lv({ types: ["shift", "sym"] }, { types: ["shift", "sym", "symO"] }, { types: ["shift", "symO", "which"] }), (rng, type) => {
    const a = Q(nz(rng, -2, 2)), pp = rng.int(-3, 3), q = rng.int(-5, 5);
    const cs = std(a, Q(pp), Q(q)), fs = yEq(cs);
    if (type === "shift") {
      const h = nz(rng, -4, 4), k = nz(rng, -4, 4);
      const r = std(a, Q(pp + h), Q(q + k));
      return { text: `放物線 ${fs} を、[[v:x]] 軸方向に ${num(Q(h))}，[[v:y]] 軸方向に ${num(Q(k))} だけ平行移動した放物線の方程式を求めましょう。`, ans: yEq(r), wide: true, meta: { f: (x) => qv(a) * (x - pp - h) ** 2 + q + k, r } };
    }
    if (type === "sym" || type === "symO") {
      const ax = type === "symO" ? "原点" : rng.pick(["[[v:x]] 軸", "[[v:y]] 軸"]);
      const f = ax === "原点" ? (x) => -(qv(a) * (-x - pp) ** 2 + q) : ax.includes("x") ? (x) => -(qv(a) * (x - pp) ** 2 + q) : (x) => qv(a) * (-x - pp) ** 2 + q;
      const r = ax === "原点" ? std(qneg(a), Q(-pp), Q(-q)) : ax.includes("x") ? std(qneg(a), Q(pp), Q(-q)) : std(a, Q(-pp), Q(q));
      return { text: `放物線 ${fs} を、${ax}に関して対称移動した放物線の方程式を求めましょう。`, ans: yEq(r), wide: true, meta: { f, r } };
    }
    const h = nz(rng, -4, 4), k = nz(rng, -4, 4), r = std(a, Q(pp + h), Q(q + k));
    return { text: `放物線 ${yEq(r)} は、放物線 ${fs} をどのように平行移動したものですか。`, ans: `[[v:x]] 軸方向に ${num(Q(h))}，[[v:y]] 軸方向に ${num(Q(k))}`, wide: true, meta: { f: (x) => qv(a) * (x - pp - h) ** 2 + q + k, r } };
  }, (pr) => {
    const m = pr.meta, f = pTex(m.r);
    for (const x of [-2, -0.5, 1, 2.5]) if (!near(evalH(f, { x }), m.f(x))) return "移動した式が合わない";
    return null;
  }, { work: 32 });

  // 最大・最小の文章題
  const MAXW = {
    fence: (rng) => {
      const L = rng.pick([20, 24, 30, 36, 40, 48, 60]);
      // 壁を1辺に:x(L－2x)
      const x = L / 4, S = x * (L - 2 * x);
      return { t: `長さ ${L}m のロープで、まっすぐな壁を1辺とする長方形の囲いを作ります(壁の部分にはロープを使いません)。壁に垂直な辺の長さを [[v:x]]m とするとき、囲いの面積の最大値と、そのときの [[v:x]] の値を求めましょう。`, a: `[[v:x]]＝${num(Q(L, 4))} のとき 最大値 ${num(Q(S * 2, 2))}m²`, chk: () => {
        let best = 0;
        for (let t = 0; t <= L / 2; t += 0.01) best = Math.max(best, t * (L - 2 * t));
        return near(best, S, 1e-4);
      } };
    },
    price: (rng) => {
      const p0 = rng.pick([100, 200, 300]), n0 = rng.pick([200, 300, 400, 500]), dp = 10, dn = rng.pick([5, 10, 20]);
      // 売上 (p0＋10x)(n0－dn x)、最大は x ＝ (n0·10 － dn·p0)/(2·10·dn)
      const xs = (n0 * dp - dn * p0) / (2 * dp * dn);
      if (!Number.isInteger(xs) || xs <= 0 || n0 - dn * xs <= 0) return null;
      const price = p0 + dp * xs, S = price * (n0 - dn * xs);
      return { t: `ある品物を1個 ${p0}円で売ると、1日に ${n0}個売れます。1個につき ${dp}円値上げするごとに、1日の売れる個数は ${dn}個ずつ減ります。1日の売り上げ金額を最大にするには、1個の値段をいくらにすればよいですか。また、そのときの売り上げ金額を求めましょう。`, a: `${price}円，${S}円`, chk: () => {
        let best = 0, bp = 0;
        for (let k = 0; k * dn <= n0; k++) {
          const v = (p0 + dp * k) * (n0 - dn * k);
          if (v > best) best = v, bp = p0 + dp * k;
        }
        return best === S && bp === price;
      } };
    },
    rect: (rng) => {
      const a = rng.pick([6, 8, 10, 12]);
      // 直角をはさむ2辺が a の直角二等辺三角形に内接する長方形:x(a－x) の最大
      const S = a * a / 4;
      return { t: `直角をはさむ2辺の長さが ${a}cm の直角二等辺三角形 ABC(∠C＝90°)があります。辺 AC，BC 上と辺 AB 上に頂点をもち、2辺が AC，BC に重なる長方形の面積の最大値を求めましょう。`, a: `${num(Q(S * 4, 4))}cm²`, chk: () => {
        let best = 0;
        for (let x = 0; x <= a; x += 0.001) best = Math.max(best, x * (a - x));
        return near(best, S, 1e-4);
      } };
    },
    sum: (rng) => {
      const s = rng.pick([6, 8, 10, 12, 14]);
      // x＋y＝s(x, y ≧ 0)で x²＋y² の最小
      const m = s * s / 2;
      return { t: `[[v:x]]＋[[v:y]]＝${s}，[[v:x]]≧0，[[v:y]]≧0 のとき、[[v:x]]²＋[[v:y]]² の最大値と最小値を求めましょう。`, a: `[[v:x]]＝0, ${s} のとき最大値 ${s * s}，[[v:x]]＝${num(Q(s, 2))} のとき最小値 ${num(Q(m * 2, 2))}`, chk: () => {
        let mx = 0, mn = Infinity;
        for (let x = 0; x <= s + 1e-9; x += s / 1000) mx = Math.max(mx, x * x + (s - x) ** 2), mn = Math.min(mn, x * x + (s - x) ** 2);
        return near(mx, s * s, 1e-6) && near(mn, m, 1e-6);
      } };
    }
  };
  const maxWord = gen("k1.maxWord", null, lv({ types: ["fence", "sum"] }, { types: ["fence", "price", "sum"] }, { types: ["price", "rect", "fence"] }), (rng, type) => {
    const r = MAXW[type](rng);
    if (!r) return null;
    return { text: r.t, ans: r.a, softKey: type, meta: { chk: r.chk }, ws: { type: "lines", labels: ["答え"] }, work: 55 };
  }, (pr) => pr.meta.chk() ? null : "最大・最小が合わない");
  H["k1.vertex"] = "[[v:x]]² の係数でくくり、([[v:x]]＋[[f:b/2a]])² を作ります。頂点は (p, q)、軸は直線 x＝p です。";
  H["k1.graph"] = "頂点と、グラフが通る目もりの交点を読み取り、y＝a(x－p)²＋q に代入します。";
  H["k1.maxmin"] = "平方完成して頂点を求め、定義域の中に軸があるか、端の値と比べて考えます。";
  H["k1.determine"] = "頂点や軸がわかるときは y＝a(x－p)²＋q、3点がわかるときは y＝ax²＋bx＋c に代入して連立方程式を解きます。";
  H["k1.move"] = "x 軸方向に p、y 軸方向に q 平行移動すると、x を x－p、y を y－q に。x 軸に関して対称なら y を －y、y 軸なら x を －x にします。";
  H["k1.maxWord"] = "求める量を x の二次関数で表し、x の変域に注意して最大・最小を考えます。";

  // ============================================================
  // 5 二次方程式と二次不等式
  // ============================================================
  // 「x＝…」の答えから、解の値を取り出す
  const rootsOf = (d) => String(d).replace(/^\[\[v:x\]\]＝/, "").split(", ").flatMap((s) => s.includes("±") ? [evalH(s.replace("±", "＋")), evalH(s.replace("±", "－"))] : [evalH(s)]);
  const quadEq = gen("k1.quadEq", "次の二次方程式を解きましょう。", lv({ types: ["fact", "fact", "formula"] }, { types: ["fact", "formula", "formula2", "frac"] }, { types: ["formula2", "frac", "rearr", "formula"] }), (rng, type) => {
    let a, b, c, tex;
    if (type === "fact") {
      const p1 = rng.int(1, 3), q1 = nz(rng, -7, 7), p2 = rng.int(1, 3), q2 = nz(rng, -7, 7);
      if (gcd(p1, q1) !== 1 || gcd(p2, q2) !== 1) return null;
      a = p1 * p2, b = p1 * q2 + p2 * q1, c = q1 * q2;
    } else if (type === "formula" || type === "formula2") {
      a = type === "formula" ? 1 : rng.int(2, 4), b = rng.int(-7, 7), c = nz(rng, -6, 6);
      const D = b * b - 4 * a * c;
      if (D <= 0 || Number.isInteger(Math.sqrt(D)) || gcd(gcd(a, b), c) !== 1) return null;
    } else if (type === "frac") {
      // 係数に分数: x²/p ＋ … の形
      const P2 = rng.pick([2, 3, 4, 6]), A = rng.int(1, 2), B = rng.int(-5, 5), Cc = nz(rng, -5, 5);
      const D = B * B - 4 * A * Cc;
      if (D < 0 || gcd(gcd(A, B), Cc) !== 1) return null;
      a = A, b = B, c = Cc;
      tex = `[[f:${A === 1 ? "" : A}x²/${P2}]]${B ? (B < 0 ? "－" : "＋") + `[[f:${Math.abs(B) === 1 ? "" : Math.abs(B)}x/${P2}]]` : ""}${Cc < 0 ? "－" : "＋"}[[f:${Math.abs(Cc)}/${P2}]]＝0`;
      tex = X(tex);
    } else {
      // x(x＋p)＝qx＋r の形
      const p1 = nz(rng, -5, 5), q1 = nz(rng, -5, 5), r1 = nz(rng, -9, 9);
      a = 1, b = p1 - q1, c = -r1;
      if (b * b - 4 * a * c < 0) return null;
      tex = `${V("x")}(${pTex([Q(1), Q(p1)])})＝${pTex([Q(q1), Q(r1)])}`;
    }
    const R = quadRoots(a, b, c);
    tex = tex || `${pTex([Q(a), Q(b), Q(c)])}＝0`;
    return { text: tex, ans: `${V("x")}＝${R.tex}`, meta: { a, b, c } };
  }, (pr) => {
    const { a, b, c } = pr.meta, rs = rootsOf(pr.answer.display);
    const D = b * b - 4 * a * c;
    if (rs.length !== (D === 0 ? 1 : 2)) return "解の個数が合わない";
    return rs.every((x) => Math.abs(a * x * x + b * x + c) < 1e-7 * Math.max(1, Math.abs(a * x * x))) ? null : "解が合わない";
  }, { work: 34 });

  const discrim = gen("k1.discrim", "次の問いに答えましょう。", lv({ types: ["count", "range"] }, { types: ["count", "range", "rangeMid"] }, { types: ["range", "rangeMid", "double", "allPos"] }), (rng, type) => {
    if (type === "count") {
      const a = nz(rng, -4, 4), b = rng.int(-8, 8), c = rng.int(-8, 8), D = b * b - 4 * a * c;
      const n = D > 0 ? 2 : D === 0 ? 1 : 0;
      if (n === 1 && rng.chance(0.5)) return null;
      return { text: `二次方程式 ${pTex([Q(a), Q(b), Q(c)])}＝0 の実数解の個数を求めましょう。`, ans: `${n}個`, meta: { a, b, c, n } };
    }
    if (type === "range") {
      // ax²＋bx＋k ＝ 0
      const a = rng.int(1, 3), b = nz(rng, -6, 6), kind = rng.int(0, 2);
      const t = Q(b * b, 4 * a); // D＝b²－4ak ＞ 0 ⇔ k ＜ b²/4a
      const ask = ["異なる2つの実数解をもつ", "実数解をもたない", "実数解をもつ"][kind];
      const ans = [`${V("k")}＜${num(t)}`, `${V("k")}＞${num(t)}`, `${V("k")}≦${num(t)}`][kind];
      return { text: `二次方程式 ${pTex([Q(a), Q(b), Q(0)])}＋${V("k")}＝0 が${ask}ような定数 [[v:k]] の値の範囲を求めましょう。`, ans, wide: true, meta: { chk: [a, b, kind, qv(t)] } };
    }
    if (type === "rangeMid") {
      // x²＋kx＋c ＝ 0(c＝m²)
      const m = rng.int(1, 5), kind = rng.int(0, 1);
      const ans = kind ? `－${2 * m}＜${V("k")}＜${2 * m}` : `${V("k")}＜－${2 * m}, ${2 * m}＜${V("k")}`;
      return { text: `二次方程式 ${V("x")}²＋${V("k")}${V("x")}＋${m * m}＝0 が${kind ? "実数解をもたない" : "異なる2つの実数解をもつ"}ような定数 [[v:k]] の値の範囲を求めましょう。`, ans, wide: true, meta: { chk2: [m, kind] } };
    }
    if (type === "double") {
      // x²－2kx＋(k＋s)＝0 が重解:k²－k－s＝0 → k＝r1, r2
      const r1 = rng.int(-4, -1), r2 = rng.int(2, 5), s = -r1 * r2;
      if (r1 + r2 !== 1) return null;
      return { text: `二次方程式 ${V("x")}²－2${V("k")}${V("x")}＋${V("k")}＋${s}＝0 が重解をもつような定数 [[v:k]] の値と、そのときの重解を求めましょう。`, ans: `${V("k")}＝${r1} のとき 重解 ${V("x")}＝${r1}，${V("k")}＝${r2} のとき 重解 ${V("x")}＝${r2}`, wide: true, meta: { dbl: [s, r1, r2] } };
    }
    // すべての x で x²＋kx＋k＋m ＞ 0
    const t = rng.pick([2, 4, 6, 8]), m = (t * t - 4) / 4;
    return { text: `すべての実数 [[v:x]] について、${V("x")}²＋${V("k")}${V("x")}＋${V("k")}${m ? sg(m) : ""}＞0 が成り立つような定数 [[v:k]] の値の範囲を求めましょう。`, ans: `${2 - t}＜${V("k")}＜${2 + t}`, wide: true, meta: { pos: [m, 2 - t, 2 + t] } };
  }, (pr) => {
    const m = pr.meta;
    if (m.n !== undefined) {
      const D = m.b * m.b - 4 * m.a * m.c;
      return (D > 0 ? 2 : D === 0 ? 1 : 0) === m.n ? null : "個数が合わない";
    }
    if (m.chk) {
      const [a, b, kind, t] = m.chk;
      for (const k of [t - 1, t - 0.01, t, t + 0.01, t + 1]) {
        const D = b * b - 4 * a * k, want = [D > 0, D < 0, D >= 0][kind], got = [k < t, k > t, k <= t][kind];
        if (want !== got) return "範囲が合わない";
      }
      return null;
    }
    if (m.chk2) {
      const [mm, kind] = m.chk2;
      for (const k of [-3 * mm, -2 * mm, -mm, 0, mm, 2 * mm, 3 * mm]) {
        const D = k * k - 4 * mm * mm, want = kind ? D < 0 : D > 0, got = kind ? Math.abs(k) < 2 * mm : Math.abs(k) > 2 * mm;
        if (want !== got) return "範囲が合わない";
      }
      return null;
    }
    if (m.dbl) {
      const [s, r1, r2] = m.dbl;
      return [r1, r2].every((k) => 4 * k * k - 4 * (k + s) === 0) ? null : "重解の k が合わない";
    }
    const [mm, lo, hi] = m.pos;
    for (let k = lo - 3; k <= hi + 3; k += 0.5) {
      const D = k * k - 4 * (k + mm), want = D < 0, got = k > lo && k < hi;
      if (want !== got) return "範囲が合わない";
    }
    return null;
  }, { work: 30 });

  const xInter = gen("k1.xInter", "次の問いに答えましょう。", lv({ types: ["points", "points", "line"] }, { types: ["points", "length", "line"] }, { types: ["length", "line", "length"] }), (rng, type) => {
    if (type === "line") {
      const r1 = rng.int(-4, 3), r2 = rng.int(r1 + 1, 5), a = rng.pick([1, 1, 2, -1]);
      const m = rng.int(-3, 3), n = rng.int(-4, 4);
      // 放物線 y ＝ a(x－r1)(x－r2) ＋ mx ＋ n と 直線 y ＝ mx＋n
      const cs = [Q(a), Q(-a * (r1 + r2) + m), Q(a * r1 * r2 + n)];
      const ln = pTex([Q(m), Q(n)]);
      return { text: `放物線 ${yEq(cs)} と直線 ${V("y")}＝${ln} の共有点の座標を求めましょう。`, ans: `${ptQ(Q(r1), Q(m * r1 + n))}，${ptQ(Q(r2), Q(m * r2 + n))}`, wide: true, meta: { cs, m, n } };
    }
    const a = rng.pick([1, 1, 2, -1, -2]), b = rng.int(-8, 8), c = rng.int(-9, 9), R = quadRoots(a, b, c);
    if (!R.real || R.double) return null;
    if (type === "points") {
      if (!R.list) return null;
      return { text: `放物線 ${yEq([Q(a), Q(b), Q(c)])} と [[v:x]] 軸の共有点の [[v:x]] 座標を求めましょう。`, ans: R.tex.replace(", ", "，"), meta: { a, b, c, pts: true } };
    }
    const D = b * b - 4 * a * c, L = Math.sqrt(D) / Math.abs(a);
    const ans = Number.isInteger(Math.sqrt(D)) ? num(Q(Math.sqrt(D), Math.abs(a))) : surdTex(Q(0), Q(1, Math.abs(a)), D);
    return { text: `放物線 ${yEq([Q(a), Q(b), Q(c)])} が [[v:x]] 軸から切り取る線分の長さを求めましょう。`, ans, meta: { L } };
  }, (pr) => {
    const m = pr.meta;
    if (m.L !== undefined) return near(evalH(pr.answer.display), m.L) ? null : "長さが合わない";
    if (m.pts) return pr.answer.display.split("，").every((s) => Math.abs(evalH(`${m.a}×(${s})²＋(${m.b})×(${s})＋(${m.c})`)) < 1e-9) ? null : "共有点が合わない";
    for (const pt of pr.answer.display.matchAll(/\(([^,]+), ([^)]+)\)/g)) {
      const x = evalH(pt[1]), y = evalH(pt[2]);
      if (!near(qv(m.cs[0]) * x * x + qv(m.cs[1]) * x + qv(m.cs[2]), y) || !near(m.m * x + m.n, y)) return "共有点が合わない";
    }
    return null;
  }, { work: 30 });

  // 二次不等式:解を区間で持って、文字にする
  const OPS2 = { "<": "＜", "<=": "≦", ">": "＞", ">=": "≧" };
  const holds = (op, v) => op === "<" ? v < -1e-12 : op === "<=" ? v <= 1e-12 : op === ">" ? v > 1e-12 : v >= -1e-12;
  // f(x) op 0 の解(a≠0, 根 r1＜r2 の文字)
  function quadSol(a, b, c, op) {
    if (a < 0) a = -a, b = -b, c = -c, op = { "<": ">", "<=": ">=", ">": "<", ">=": "<=" }[op];
    const R = quadRoots(a, b, c), x = V("x");
    if (R.D < 0) return op[0] === ">" ? "すべての実数" : "解はない";
    if (R.D === 0) {
      const r = R.tex;
      return op === ">" ? `${r} 以外のすべての実数` : op === ">=" ? "すべての実数" : op === "<" ? "解はない" : `${x}＝${r}`;
    }
    let lo, hi;
    if (R.list) [lo, hi] = R.list.map(num);
    else {
      // p±q の形 → p－q, p＋q
      const t = R.tex;
      lo = t.replace("±", "－");
      hi = t.replace("±", "＋");
    }
    const st = op.length === 2 ? "≦" : "＜";
    return op[0] === ">" ? `${x}${st}${lo}, ${hi}${st}${x}` : `${lo}${st}${x}${st}${hi}`;
  }
  // 解の文字を、もう一度読んで、x の値で真偽を決める(検算用)
  function solPred(s) {
    if (s === "すべての実数") return () => true;
    if (s === "解はない") return () => false;
    let m;
    if (m = /^(.*) 以外のすべての実数$/.exec(s)) {
      const r = evalH(m[1]);
      return (x) => Math.abs(x - r) > 1e-9;
    }
    if (m = /^\[\[v:x\]\]＝(.*)$/.exec(s)) {
      const r = evalH(m[1]);
      return (x) => Math.abs(x - r) < 1e-9;
    }
    const cmp = (o, u, v) => o === "＜" ? u < v : u <= v + 1e-12;
    if (m = /^\[\[v:x\]\]([＜≦])(.*), (.*)([＜≦])\[\[v:x\]\]$/.exec(s)) {
      const lo = evalH(m[2]), hi = evalH(m[3]);
      return (x) => cmp(m[1], x, lo) || cmp(m[4], hi, x);
    }
    if (m = /^(.*?)([＜≦])\[\[v:x\]\]([＜≦])(.*)$/.exec(s)) {
      const lo = evalH(m[1]), hi = evalH(m[4]);
      return (x) => cmp(m[2], lo, x) && cmp(m[3], x, hi);
    }
    throw new Error("解の形が読めない " + s);
  }
  const quadIneq = gen("k1.quadIneq", "次の二次不等式を解きましょう。", lv({ types: ["fact", "fact", "neg"] }, { types: ["fact", "irr", "neg", "special"] }, { types: ["irr", "special", "simul", "neg"] }), (rng, type) => {
    const op = rng.pick(["<", "<=", ">", ">="]);
    if (type === "special") {
      const p0 = rng.int(-5, 5), kind = rng.int(0, 1);
      // (x－p)² op 0 、または D＜0
      const [a, b, c] = kind ? [1, -2 * p0, p0 * p0] : [1, rng.int(-4, 4), 0];
      if (!kind) {
        const cc = Math.floor(b * b / 4) + rng.int(1, 5);
        return { text: `${pTex([Q(1), Q(b), Q(cc)])}${OPS2[op]}0`, ans: quadSol(1, b, cc, op), meta: { f: [1, b, cc], op } };
      }
      return { text: `${pTex([Q(a), Q(b), Q(c)])}${OPS2[op]}0`, ans: quadSol(a, b, c, op), meta: { f: [a, b, c], op } };
    }
    if (type === "simul") {
      // 一次不等式と二次不等式の連立
      const r1 = rng.int(-4, 1), r2 = rng.int(r1 + 2, 6), k = rng.int(r1 + 1, r2 + 2);
      const f = [1, -(r1 + r2), r1 * r2], g = [0, 1, -k];
      const pred = (x) => x * x + f[1] * x + f[2] < 0 && x - k > 0;
      const lo = Math.max(r1, k), hi = r2;
      if (lo >= hi) return null;
      return { text: `[[sys:${pTex(f.map((v) => Q(v)))}＜0||${pTex([Q(1), Q(-k)])}＞0:sys]]`, ans: `${lo}＜${V("x")}＜${hi}`, meta: { pred } };
    }
    let a, b, c;
    if (type === "irr") {
      a = 1, b = 2 * rng.int(-3, 3), c = nz(rng, -6, 6);
      const D = b * b - 4 * c;
      if (D <= 0 || Number.isInteger(Math.sqrt(D))) return null;
    } else {
      const r1 = rng.int(-5, 4), r2 = rng.int(r1 + 1, 6), k = type === "neg" ? -1 : rng.pick([1, 1, 2]);
      a = k, b = -k * (r1 + r2), c = k * r1 * r2;
      if (type === "fact" && k === 2 && rng.chance(0.5)) {
        // (2x－1)(x－3) のように分数の解
        const p2 = rng.pick([1, 3, 5]), r = rng.int(-3, 4);
        a = 2, b = -(p2 + 2 * r), c = p2 * r;
        if (b * b - 4 * a * c <= 0) return null;
      }
    }
    return { text: `${pTex([Q(a), Q(b), Q(c)])}${OPS2[op]}0`, ans: quadSol(a, b, c, op), meta: { f: [a, b, c], op } };
  }, (pr) => {
    const m = pr.meta, P2 = solPred(pr.answer.display);
    const want = m.pred || ((x) => holds(m.op, m.f[0] * x * x + m.f[1] * x + m.f[2]));
    const xs = [];
    for (let x = -12; x <= 12; x += 0.125) xs.push(x);
    // 端の点(解の端)も調べる
    for (const r of [...pr.answer.display.matchAll(/[－\d√{}\[\]f:\/＋]+/g)].map((s) => s[0])) {
      try {
        const v = evalH(r);
        xs.push(v, v - 1e-4, v + 1e-4);
      } catch (e) {}
    }
    for (const x of xs) if (P2(x) !== want(x)) return `解がちがう x=${x}`;
    return null;
  }, { work: 30 });
  H["k1.quadEq"] = "因数分解できなければ解の公式 x＝[[f:－b±√{b²－4ac}/2a]] を使います。係数に分数があれば、両辺に分母の最小公倍数をかけます。";
  H["k1.discrim"] = "判別式 D＝b²－4ac。D＞0 なら異なる2つの実数解、D＝0 なら重解、D＜0 なら実数解なし。";
  H["k1.xInter"] = "y＝0 とおいた二次方程式の解が、x 軸との共有点の x 座標です。放物線と直線は、y を消去して x の二次方程式にします。";
  H["k1.quadIneq"] = "二次方程式の解 α＜β を求め、ax²＋bx＋c＞0(a＞0)なら x＜α, β＜x、＜0 なら α＜x＜β。グラフをかいて考えます。";

  K.k1b = { std, yEq, quadSol, solPred, rootsOf };
  return [vertex, graphQ, maxmin, determine, move, maxWord, quadEq, discrim, xInter, quadIneq];
})();
kou1.push(...kou1b);
