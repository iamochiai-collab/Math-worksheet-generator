  // ============================================================
  // 3 微分法 ・ 4 微分法の応用
  // ============================================================
var kou3b = (() => {
  const K = kouLib;
  const { Q, qa, qs, qm, qd, qv, num, gcd, lv, nz, X, V, evalH, near, pTex, sg, sgQ, rootTex, gen, redo, pickN, sup, fnum } = K;
  const H = K.k3.H, fr = K.k3.fr, lin = K.k3.lin;
  const x = V("x"), y = V("y"), t = V("t");
  const co = (a) => a === 1 ? "" : a === -1 ? "－" : num(Q(a));
  const ex = (e) => e === 1 ? "" : sup(e);
  // 数値微分
  const dnum = (f, t0, h = 1e-5) => (f(t0 + h) - f(t0 - h)) / (2 * h);
  const fH = (e, L = "x") => (t0) => evalH(e, { [L]: t0 });
  const chkDeriv = (e, d, pts = [0.37, 0.81, 1.43, 2.1]) => pts.every((t0) => {
    const a = dnum(fH(e), t0), b = evalH(d, { x: t0 });
    return Math.abs(a - b) < 1e-4 * Math.max(1, Math.abs(b));
  });

  // ============================================================
  // 3 微分法
  // ============================================================
  const DR = {
    pow: (rng) => {
      const a = rng.int(1, 4), b = nz(rng, -5, 5), n = rng.int(2, 5);
      return [`(${lin(a, b)})${sup(n)}`, `${n * a}(${lin(a, b)})${ex(n - 1)}`];
    },
    quot: (rng) => {
      const p = rng.int(-4, 4), q = rng.int(-4, 4);
      if (p === q) return null;
      return [fr(lin(1, p), lin(1, q)), `${q - p < 0 ? "－" : ""}${fr(Math.abs(q - p), `(${lin(1, q)})²`)}`];
    },
    quot2: (rng) => {
      const k = rng.int(1, 6);
      return [fr(x, `${x}²＋${k}`), fr(`${k}－${x}²`, `(${x}²＋${k})²`)];
    },
    sqrt2: (rng) => {
      const k = rng.int(1, 9);
      return [`√{${x}²＋${k}}`, fr(x, `√{${x}²＋${k}}`)];
    },
    sqrt1: (rng) => {
      const a = rng.int(1, 4), b = rng.int(1, 6), c = Q(a, 2);
      return [`√{${lin(a, b)}}`, c[1] === 1 ? fr(c[0], `√{${lin(a, b)}}`) : fr(a, `2√{${lin(a, b)}}`)];
    },
    prod: (rng) => {
      const a = nz(rng, -3, 3);
      // x²(x＋a)³ → x(x＋a)²(5x＋2a)
      return [`${x}²(${lin(1, a)})³`, `${x}(${lin(1, a)})²(${lin(5, 2 * a)})`];
    }
  };
  const diffRules = gen("k3.diffRules", "次の関数を微分しましょう。", lv({ types: ["pow", "quot", "sqrt1"] }, { types: ["pow", "quot", "quot2", "sqrt2"] }, { types: ["quot2", "sqrt2", "prod", "sqrt1"] }), (rng, type) => {
    const r = DR[type](rng);
    if (!r) return null;
    return { text: `${y}＝${r[0]}`, ans: `${y}′＝${r[1]}`, meta: { e: r[0], d: r[1] } };
  }, (pr) => chkDeriv(pr.meta.e, pr.meta.d) ? null : "導関数が合わない", { work: 30 });

  const TR = {
    sin: (rng) => {
      const a = rng.int(2, 5);
      return [`sin ${a}${x}`, `${a}cos ${a}${x}`];
    },
    cos: (rng) => {
      const a = rng.int(2, 5);
      return [`cos ${a}${x}`, `－${a}sin ${a}${x}`];
    },
    tan: (rng) => {
      const a = rng.int(1, 4);
      return [`tan ${co(a)}${x}`, fr(a, `cos²${co(a)}${x}`)];
    },
    exp: (rng) => {
      const a = nz(rng, -3, 4);
      return [`e[[^${co(a)}${x}]]`, `${co(a)}e[[^${co(a)}${x}]]`];
    },
    xexp: (rng) => rng.chance(0.5) ? [`${x}e[[^${x}]]`, `(${x}＋1)e[[^${x}]]`] : [`${x}²e[[^${x}]]`, `(${x}²＋2${x})e[[^${x}]]`],
    log: (rng) => {
      const a = rng.int(1, 4), b = rng.int(1, 5);
      return [`log(${lin(a, b)})`, fr(a, lin(a, b))];
    },
    log2: (rng) => {
      const k = rng.int(1, 6);
      return [`log(${x}²＋${k})`, fr(`2${x}`, `${x}²＋${k}`)];
    },
    xlog: () => [`${x}log ${x}`, `log ${x}＋1`],
    ax: (rng) => {
      const a = rng.pick([2, 3, 5, 10]);
      return [`${a}[[^${x}]]`, `${a}[[^${x}]]log ${a}`];
    },
    logsq: (rng) => {
      const k = rng.int(2, 4);
      return [`(log ${x})${sup(k)}`, fr(`${k}(log ${x})${k - 1 === 1 ? "" : sup(k - 1)}`, x)];
    },
    esin: (rng) => {
      const a = rng.int(1, 3), b = rng.int(1, 3), cs = rng.chance(0.5);
      const ea = `e[[^${co(a)}${x}]]`, sb = `sin ${co(b)}${x}`, cb = `cos ${co(b)}${x}`;
      return cs ? [`${ea}${sb}`, `${ea}(${co(a)}${sb}＋${co(b)}${cb})`] : [`${ea}${cb}`, `${ea}(${co(a)}${cb}－${co(b)}${sb})`];
    },
    sinsq: (rng) => {
      const a = rng.int(1, 3);
      return [`sin²${co(a)}${x}`, `${co(a)}sin ${2 * a}${x}`];
    }
  };
  const diffTrans = gen("k3.diffTrans", "次の関数を微分しましょう。", lv({ types: ["sin", "cos", "exp", "log", "xlog"] }, { types: ["tan", "xexp", "log2", "ax", "sin", "exp"] }, { types: ["logsq", "esin", "sinsq", "xexp", "log2", "ax"] }), (rng, type) => {
    const r = TR[type](rng);
    return { text: `${y}＝${r[0]}`, ans: `${y}′＝${r[1]}`, meta: { e: r[0], d: r[1] } };
  }, (pr) => chkDeriv(pr.meta.e, pr.meta.d) ? null : "導関数が合わない", { work: 26 });

  const diff2 = gen("k3.diff2", "次の問いに答えましょう。", lv({ types: ["second", "second"] }, { types: ["second", "implicit", "param"] }, { types: ["implicit", "param", "second"] }), (rng, type) => {
    if (type === "second") {
      if (rng.chance(0.4)) {
        const cs = [Q(nz(rng, -2, 2)), Q(rng.int(-4, 4)), Q(rng.int(-5, 5)), Q(rng.int(-6, 6)), Q(rng.int(-5, 5))];
        const d2 = [qm(cs[0], Q(12)), qm(cs[1], Q(6)), qm(cs[2], Q(2))];
        return { text: `関数 ${y}＝${pTex(cs)} の第2次導関数`, ans: `${y}″＝${pTex(d2)}`, meta: { e: pTex(cs), d2: pTex(d2) } };
      }
      const T = rng.pick([[`${x}e[[^${x}]]`, `(${x}＋2)e[[^${x}]]`], [`${x}log ${x}`, fr(1, x)], [`sin²${x}`, `2cos 2${x}`], [`e[[^${x}]]cos ${x}`, `－2e[[^${x}]]sin ${x}`], [`log(${x}²＋1)`, fr(`2(1－${x}²)`, `(${x}²＋1)²`)], [`${x}³－3${x}²＋${rng.int(1, 5)}${x}`, `6${x}－6`]]);
      return { text: `関数 ${y}＝${T[0]} の第2次導関数`, ans: `${y}″＝${T[1]}`, meta: { e: T[0], d2: T[1] } };
    }
    if (type === "implicit") {
      const T = rng.pick([[`${x}²＋${y}²＝${rng.pick([4, 9, 25])}`, `－${fr(x, y)}`, (X0, Y0) => -X0 / Y0], [`${y}²＝${rng.pick([4, 8, 12])}${x}`, null, null], [`[[f:${x}²/4]]＋[[f:${y}²/9]]＝1`, `－${fr(`9${x}`, `4${y}`)}`, (X0, Y0) => -9 * X0 / (4 * Y0)], [`${x}²－${y}²＝1`, fr(x, y), (X0, Y0) => X0 / Y0]]);
      if (!T[1]) {
        const k = Number(T[0].match(/＝(\d+)/)[1]);
        return { text: `${T[0]} のとき、[[f:d${y}/d${x}]] を ${x}，${y} で表す`, ans: `[[f:d${y}/d${x}]]＝${fr(k / 2, y)}`, meta: { imp: (X0, Y0) => k / (2 * Y0), d: fr(k / 2, y) } };
      }
      return { text: `${T[0]} のとき、[[f:d${y}/d${x}]] を ${x}，${y} で表す`, ans: `[[f:d${y}/d${x}]]＝${T[1]}`, meta: { imp: T[2], d: T[1] } };
    }
    const T = rng.pick([[`${x}＝${t}²，${y}＝${t}³`, fr(`3${t}`, 2), (T0) => 3 * T0 / 2], [`${x}＝cos ${t}，${y}＝sin ${t}`, `－${fr(`cos ${t}`, `sin ${t}`)}`, (T0) => -Math.cos(T0) / Math.sin(T0)], [`${x}＝${t}＋1，${y}＝${t}²－${t}`, `2${t}－1`, (T0) => 2 * T0 - 1], [`${x}＝e[[^${t}]]，${y}＝e[[^2${t}]]`, `2e[[^${t}]]`, (T0) => 2 * Math.exp(T0)], [`${x}＝2cos ${t}，${y}＝3sin ${t}`, `－${fr(`3cos ${t}`, `2sin ${t}`)}`, (T0) => -3 * Math.cos(T0) / (2 * Math.sin(T0))]]);
    return { text: `${T[0]} のとき、[[f:d${y}/d${x}]] を ${t} で表す`, ans: `[[f:d${y}/d${x}]]＝${T[1]}`, meta: { par: T[2], d: T[1] } };
  }, (pr) => {
    const m = pr.meta;
    if (m.d2) {
      const f = fH(m.e);
      return [0.6, 1.3, 2.2].every((t0) => Math.abs((f(t0 + 1e-3) - 2 * f(t0) + f(t0 - 1e-3)) / 1e-6 - evalH(m.d2, { x: t0 })) < 1e-3 * Math.max(1, Math.abs(evalH(m.d2, { x: t0 })))) ? null : "第2次導関数が合わない";
    }
    if (m.imp) return [[0.6, 1.7], [1.1, -0.9]].every(([a, b]) => near(evalH(m.d, { x: a, y: b }), m.imp(a, b))) ? null : "導関数が合わない";
    return [0.4, 1.2].every((t0) => near(evalH(m.d, { t: t0 }), m.par(t0))) ? null : "導関数が合わない";
  }, { work: 30 });
  H["k3.diffRules"] = "積 (fg)′＝f′g＋fg′、商 ([[f:f/g]])′＝[[f:f′g－fg′/g²]]、合成関数 {f(g(x))}′＝f′(g(x))g′(x)。";
  H["k3.diffTrans"] = "(sin x)′＝cos x、(cos x)′＝－sin x、(tan x)′＝[[f:1/cos²x]]、(e[[^x]])′＝e[[^x]]、(log x)′＝[[f:1/x]]、(a[[^x]])′＝a[[^x]]log a。";
  H["k3.diff2"] = "y を x の関数と考えて両辺を x で微分します(陰関数)。媒介変数では [[f:dy/dx]]＝[[f:dy/dt]]÷[[f:dx/dt]]。";

  // ============================================================
  // 4 微分法の応用
  // ============================================================
  const tangent3 = gen("k3.tangent", "次の曲線上の点における接線の方程式を求めましょう。", lv({ types: ["exp", "log", "sqrt", "recip"] }, { types: ["exp", "log", "sqrt", "recip"] }, { types: ["sqrt", "recip", "origin", "log"] }), (rng, type) => {
    if (type === "exp") {
      const a = rng.int(-1, 2), ea = a === 0 ? "1" : a === 1 ? "e" : `e[[^${num(Q(a))}]]`;
      const slope = ea, icpt = 1 - a;
      const ans = a === 0 ? `${y}＝${x}＋1` : a === 1 ? `${y}＝e${x}` : `${y}＝${ea}${x}${icpt < 0 ? "－" : "＋"}${Math.abs(icpt) === 1 ? "" : Math.abs(icpt)}${ea}`;
      return { text: `曲線 ${y}＝e[[^${x}]] 上の点 (${a}, ${ea})`, ans, meta: { f: (t0) => Math.exp(t0), a, line: ans } };
    }
    if (type === "log") {
      const a = rng.pick([1, 2, 3, "e"]), av = a === "e" ? Math.E : a;
      const ans = a === 1 ? `${y}＝${x}－1` : a === "e" ? `${y}＝${fr(1, "e")}${x}` : `${y}＝${fr(1, a)}${x}－1＋log ${a}`;
      return { text: `曲線 ${y}＝log ${x} 上の点 (${a}, ${a === 1 ? 0 : a === "e" ? 1 : `log ${a}`})`, ans, meta: { f: Math.log, a: av, line: ans } };
    }
    if (type === "sqrt") {
      const a = rng.int(1, 4);
      return { text: `曲線 ${y}＝√{${x}} 上の点 (${a * a}, ${a})`, ans: `${y}＝${fr(1, 2 * a)}${x}＋${num(Q(a, 2))}`, meta: { f: Math.sqrt, a: a * a, line: `${y}＝${fr(1, 2 * a)}${x}＋${num(Q(a, 2))}` } };
    }
    if (type === "recip") {
      const a = nz(rng, -3, 3), sl = Q(-1, a * a), ic = Q(2, a);
      return { text: `曲線 ${y}＝${fr(1, x)} 上の点 (${a}, ${num(Q(1, a))})`, ans: `${y}＝${num(sl)}${x}${sgQ(ic)}`, meta: { f: (t0) => 1 / t0, a, line: `${y}＝${num(sl)}${x}${sgQ(ic)}` } };
    }
    return { text: `原点から曲線 ${y}＝e[[^${x}]] に引いた接線の方程式と、接点の座標`, ans: `${y}＝e${x}，接点 (1, e)`, meta: { f: (t0) => Math.exp(t0), a: 1, line: `${y}＝e${x}` } };
  }, (pr) => {
    const m = pr.meta, rhs = m.line.split("＝")[1];
    const g = (t0) => evalH(rhs, { x: t0 });
    return near(g(m.a), m.f(m.a)) && Math.abs(dnum(g, m.a) - dnum(m.f, m.a)) < 1e-4 ? null : "接線が合わない";
  }, { work: 30 });

  const EXT = [
    (rng) => {
      const a = rng.int(1, 3);
      return [`${x}e[[^${a === 1 ? "－" : "－" + a}${x}]]`, `${x}＝${fr(1, a).replace("[[f:1/1]]", "1")} で極大値 ${fr(1, `${a === 1 ? "" : a}e`)}`, [[1 / a, 1 / (a * Math.E), "max"]]];
    },
    () => [`${x}²e[[^－${x}]]`, `${x}＝0 で極小値 0，${x}＝2 で極大値 ${fr(4, "e²")}`, [[0, 0, "min"], [2, 4 / Math.E ** 2, "max"]]],
    (rng) => {
      const k = rng.int(1, 3), xt = k === 1 ? "e" : k === 2 ? "√{e}" : "e[[^1/3]]";
      return [fr(`log ${x}`, k === 1 ? x : `${x}${sup(k)}`), `${x}＝${xt} で極大値 ${fr(1, `${k === 1 ? "" : k}e`)}`, [[Math.exp(1 / k), 1 / (k * Math.E), "max"]]];
    },
    (rng) => {
      const k = rng.int(1, 3), xt = k === 1 ? fr(1, "e") : k === 2 ? fr(1, "√{e}") : "e[[^－1/3]]";
      return [`${x}${k === 1 ? "" : sup(k)}log ${x}`, `${x}＝${xt} で極小値 －${fr(1, `${k === 1 ? "" : k}e`)}`, [[Math.exp(-1 / k), -1 / (k * Math.E), "min"]]];
    },
    (rng) => {
      const a = rng.int(-3, 3);
      return [a ? `(${lin(1, -a)})e[[^${x}]]` : `${x}e[[^${x}]]`, `${x}＝${a - 1} で極小値 ${a - 1 === 0 ? "－1" : a - 1 === 1 ? "－e" : `－e[[^${num(Q(a - 1))}]]`}`, [[a - 1, -Math.exp(a - 1), "min"]]];
    },
    (rng) => {
      const a = rng.pick([2, 3, 4, 5]);
      return [`e[[^${x}]]－${a}${x}`, `${x}＝log ${a} で極小値 ${a}－${a}log ${a}`, [[Math.log(a), a - a * Math.log(a), "min"]]];
    },
    () => [`${x}＋2cos ${x}（0≦${x}≦2π）`, `${x}＝[[f:π/6]] で極大値 [[f:π/6]]＋√{3}，${x}＝[[f:5/6]]π で極小値 [[f:5/6]]π－√{3}`, [[Math.PI / 6, Math.PI / 6 + Math.sqrt(3), "max"], [5 * Math.PI / 6, 5 * Math.PI / 6 - Math.sqrt(3), "min"]], `${x}＋2cos ${x}`],
    (rng) => {
      const a = rng.int(1, 5);
      return [`${x}＋${fr(a * a, x)}`, `${x}＝－${a} で極大値 －${2 * a}，${x}＝${a} で極小値 ${2 * a}`, [[-a, -2 * a, "max"], [a, 2 * a, "min"]]];
    },
    (rng) => {
      const a = rng.int(1, 3);
      return [fr(x, `${x}²＋${a * a}`), `${x}＝－${a} で極小値 －${fr(1, 2 * a)}，${x}＝${a} で極大値 ${fr(1, 2 * a)}`, [[-a, -1 / (2 * a), "min"], [a, 1 / (2 * a), "max"]]];
    },
    () => [`${x}－2sin ${x}（0≦${x}≦2π）`, `${x}＝[[f:π/3]] で極小値 [[f:π/3]]－√{3}，${x}＝[[f:5/3]]π で極大値 [[f:5/3]]π＋√{3}`, [[Math.PI / 3, Math.PI / 3 - Math.sqrt(3), "min"], [5 * Math.PI / 3, 5 * Math.PI / 3 + Math.sqrt(3), "max"]], `${x}－2sin ${x}`]
  ];
  const extreme3 = gen("k3.extreme", "次の関数の極値を求めましょう。", lv({ types: [0, 4, 5, 7, 8] }, { types: [0, 2, 3, 4, 5, 7, 8] }, { types: [1, 2, 3, 4, 5, 6, 8, 9] }), (rng, i) => {
    const r = EXT[i](rng);
    return { text: `${y}＝${r[0]}`, ans: r[1], key: `ex3:${r[0]}`, meta: { e: r[3] || r[0], pts: r[2] } };
  }, (pr) => {
    const m = pr.meta, f = fH(m.e);
    for (const [p, v, kind] of m.pts) {
      if (!near(f(p), v)) return "極値が合わない";
      const h = 1e-3, isMax = f(p) > f(p - h) && f(p) > f(p + h), isMin = f(p) < f(p - h) && f(p) < f(p + h);
      if (kind === "max" ? !isMax : !isMin) return "極大・極小が合わない";
    }
    return null;
  }, { work: 40 });

  // 速度・加速度、近似式
  const motion = gen("k3.motion", null, lv({ types: ["line"] }, { types: ["line", "plane"] }, { types: ["plane", "line"] }), (rng, type) => {
    if (type === "line") {
      const p = rng.int(1, 3), q = rng.int(p + 1, 5);
      // x ＝ t³ － (3/2)(p＋q)t² ＋ 3pq t(v ＝ 3(t－p)(t－q))
      if ((3 * (p + q)) % 2) return null;
      const c2 = 3 * (p + q) / 2, c1 = 3 * p * q, t0 = rng.int(0, 6);
      const v = 3 * (t0 - p) * (t0 - q), a = 6 * t0 - 3 * (p + q);
      return { text: `数直線上を動く点 P の、時刻 ${t} における座標が ${x}＝${t}³－${c2}${t}²＋${c1}${t} で表されるとき、${t}＝${t0} における点 P の速度と加速度を求めましょう。また、点 P が運動の向きを変える時刻を求めましょう。`, ans: `速度 ${v}，加速度 ${a}，時刻 ${t}＝${p}, ${q}`, meta: { chk: () => {
        const X0 = (s) => s ** 3 - c2 * s * s + c1 * s;
        return Math.abs(dnum(X0, t0) - v) < 1e-4 && Math.abs((X0(t0 + 1e-3) - 2 * X0(t0) + X0(t0 - 1e-3)) / 1e-6 - a) < 1e-3;
      } }, ws: { type: "lines", labels: ["答え"] }, work: 50 };
    }
    const r = rng.int(2, 5), w = rng.int(1, 3);
    return { text: `座標平面上を動く点 P の、時刻 ${t} における座標が (${r}cos ${w === 1 ? "" : w}${t}, ${r}sin ${w === 1 ? "" : w}${t}) で表されるとき、点 P の速さと加速度の大きさを求めましょう。`, ans: `速さ ${r * w}，加速度の大きさ ${r * w * w}`, meta: { chk: () => true }, ws: { type: "lines", labels: ["答え"] }, work: 50 };
  }, (pr) => pr.meta.chk() ? null : "速度・加速度が合わない");

  const approx = gen("k3.approx", "1次の近似式を用いて、次の数の近似値を求めましょう。", lv({ types: ["sqrt", "pow"] }, { types: ["sqrt", "pow", "cbrt", "exp"] }, { types: ["cbrt", "exp", "sin", "log"] }), (rng, type) => {
    const h = rng.pick([1, 2, 3, 4]) / 1000 * rng.pick([1, 10]);
    let q, v;
    if (type === "sqrt") q = `√{${fnum(1 + h, 4)}}`, v = 1 + h / 2;
    else if (type === "pow") {
      const n = rng.int(2, 6);
      q = `${fnum(1 + h, 4)}[[^${n}]]`, v = 1 + n * h;
    } else if (type === "cbrt") q = `∛{${fnum(1 + h, 4)}}`, v = 1 + h / 3;
    else if (type === "exp") q = `e[[^${fnum(h, 4)}]]`, v = 1 + h;
    else if (type === "sin") q = `sin ${fnum(h, 4)}`, v = h;
    else q = `log ${fnum(1 + h, 4)}`, v = h;
    return { text: q, ans: fnum(v, 5), meta: { q, v, h } };
  }, (pr) => Math.abs(evalH(pr.meta.q) - pr.meta.v) < 20 * pr.meta.h ** 2 + 1e-12 ? null : "近似値が合わない", { work: 22 });
  H["k3.tangent"] = "曲線 y＝f(x) 上の点 (a, f(a)) における接線は y－f(a)＝f′(a)(x－a)。";
  H["k3.extreme"] = "f′(x)＝0 となる x の前後で f′(x) の符号を調べ、増減表をかきます。";
  H["k3.motion"] = "速度 v＝[[f:dx/dt]]、加速度 α＝[[f:dv/dt]]。平面では速さ √{(dx/dt)²＋(dy/dt)²}。";
  H["k3.approx"] = "|h| が小さいとき f(a＋h)≒f(a)＋f′(a)h。(1＋h)[[^p]]≒1＋ph、e[[^h]]≒1＋h、sin h≒h、log(1＋h)≒h。";

  return [diffRules, diffTrans, diff2, tangent3, extreme3, motion, approx];
})();
kou3.push(...kou3b);
