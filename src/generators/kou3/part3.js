  // ============================================================
  // 5 積分法 ・ 6 積分法の応用
  // ============================================================
var kou3c = (() => {
  const K = kouLib;
  const { Q, qa, qs, qm, qd, qv, num, gcd, lv, nz, X, V, evalH, near, pTex, sg, sgQ, rootTex, gen, redo, pickN, sup, fnum } = K;
  const H = K.k3.H, fr = K.k3.fr, lin = K.k3.lin;
  const x = V("x"), C = "＋[[v:C]]";
  const co = (a) => a === 1 ? "" : a === -1 ? "－" : num(Q(a));
  const coQ = (q) => q[0] === q[1] ? "" : q[0] === -q[1] ? "－" : num(q);
  const dnum = (f, t0, h = 1e-5) => (f(t0 + h) - f(t0 - h)) / (2 * h);
  // 不定積分の検算:答えを微分すると被積分関数になる
  const chkInt = (f, F, pts = [0.37, 0.83, 1.41, 2.2]) => pts.every((t0) => {
    const a = dnum((u) => evalH(F, { x: u }), t0), b = evalH(f, { x: t0 });
    return Math.abs(a - b) < 1e-4 * Math.max(1, Math.abs(b));
  });
  // 数値積分(シンプソン)
  const simpson = (f, a, b, n = 2000) => {
    const h = (b - a) / n;
    let s = f(a) + f(b);
    for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
    return s * h / 3;
  };

  // ============================================================
  // 5 積分法
  // ============================================================
  const IB = {
    pow: (rng) => {
      const n = rng.int(3, 6);
      return rng.pick([
        [fr(1, `${x}²`), `－${fr(1, x)}`],
        [fr(1, `${x}³`), `－${fr(1, `2${x}²`)}`],
        [`√{${x}}`, `[[f:2/3]]${x}√{${x}}`],
        [fr(1, `√{${x}}`), `2√{${x}}`],
        [`${x}√{${x}}`, `[[f:2/5]]${x}²√{${x}}`],
        [`${x}[[^1/3]]`, `[[f:3/4]]${x}[[^4/3]]`],
        [`${x}${sup(n)}`, `${fr(1, n + 1)}${x}${sup(n + 1)}`]
      ]);
    },
    recip: () => [fr(1, x), `log|${x}|`],
    exp: (rng) => {
      const a = nz(rng, -3, 4);
      return [`e[[^${co(a)}${x}]]`, `${coQ(Q(1, a))}e[[^${co(a)}${x}]]`];
    },
    sin: (rng) => {
      const a = rng.int(1, 4);
      return [`sin ${co(a)}${x}`, `－${coQ(Q(1, a))}cos ${co(a)}${x}`];
    },
    cos: (rng) => {
      const a = rng.int(2, 4);
      return [`cos ${a}${x}`, `${coQ(Q(1, a))}sin ${a}${x}`];
    },
    sec2: () => [fr(1, `cos²${x}`), `tan ${x}`],
    ax: (rng) => {
      const a = rng.pick([2, 3, 5]);
      return [`${a}[[^${x}]]`, fr(`${a}[[^${x}]]`, `log ${a}`)];
    },
    mix: (rng) => {
      const a = rng.int(1, 3);
      return [fr(`(${x}＋${a})²`, x), `[[f:1/2]]${x}²＋${2 * a}${x}＋${a * a}log|${x}|`];
    }
  };
  const intBasic = gen("k3.intBasic", "次の不定積分を求めましょう。", lv({ types: ["pow", "recip", "exp", "sin"] }, { types: ["pow", "exp", "cos", "sec2", "ax"] }, { types: ["mix", "ax", "pow", "sec2", "exp"] }), (rng, type) => {
    const r = IB[type](rng);
    return { text: `[[int::]]${r[0]}d${x}`, ans: `${r[1]}${C}`, meta: { f: r[0], F: r[1] } };
  }, (pr) => chkInt(pr.meta.f, pr.meta.F) ? null : "不定積分が合わない", { work: 26 });

  const IS = {
    lin: (rng) => {
      const a = rng.int(2, 4), b = nz(rng, -5, 5), n = rng.int(2, 5), k = Q(1, a * (n + 1));
      return [`(${lin(a, b)})${sup(n)}`, `${coQ(k)}(${lin(a, b)})${sup(n + 1)}`];
    },
    xpow: (rng) => {
      const n = rng.int(2, 4), k = rng.int(1, 5), c = Q(1, 2 * (n + 1));
      return [`${x}(${x}²＋${k})${sup(n)}`, `${coQ(c)}(${x}²＋${k})${sup(n + 1)}`];
    },
    xfrac: (rng) => {
      const k = rng.int(1, 6);
      return [fr(x, `${x}²＋${k}`), `[[f:1/2]]log(${x}²＋${k})`];
    },
    sincos: (rng) => {
      const n = rng.int(2, 4);
      return [`sin ${x}cos${sup(n)}${x}`, `－${fr(1, n + 1)}cos${sup(n + 1)}${x}`];
    },
    eFrac: () => [fr(`e[[^${x}]]`, `e[[^${x}]]＋1`), `log(e[[^${x}]]＋1)`],
    logx: () => [fr(`log ${x}`, x), `[[f:1/2]](log ${x})²`],
    sqrt: (rng) => {
      const a = rng.int(1, 3), b = rng.int(1, 5);
      // ∫√(ax＋b) ＝ 2/(3a)(ax＋b)^(3/2)
      return [`√{${lin(a, b)}}`, `${coQ(Q(2, 3 * a))}(${lin(a, b)})√{${lin(a, b)}}`];
    }
  };
  const intSub = gen("k3.intSub", "次の不定積分を求めましょう。", lv({ types: ["lin", "xfrac", "lin"] }, { types: ["lin", "xpow", "xfrac", "sincos", "sqrt"] }, { types: ["xpow", "sincos", "eFrac", "logx", "sqrt"] }), (rng, type) => {
    const r = IS[type](rng);
    return { text: `[[int::]]${r[0]}d${x}`, ans: `${r[1]}${C}`, meta: { f: r[0], F: r[1] } };
  }, (pr) => chkInt(pr.meta.f, pr.meta.F) ? null : "不定積分が合わない", { work: 32 });

  const IP = [
    (rng) => {
      const a = rng.int(1, 3), b = rng.int(-2, 2);
      if (a === 1) return [b ? `(${lin(1, b)})e[[^${x}]]` : `${x}e[[^${x}]]`, b - 1 ? `(${lin(1, b - 1)})e[[^${x}]]` : `${x}e[[^${x}]]`];
      return [`${x}e[[^${a}${x}]]`, `${fr(1, a * a)}(${lin(a, -1)})e[[^${a}${x}]]`];
    },
    (rng) => {
      const a = rng.int(1, 3);
      return a === 1 ? [`${x}sin ${x}`, `－${x}cos ${x}＋sin ${x}`] : [`${x}sin ${a}${x}`, `－${fr(1, a)}${x}cos ${a}${x}＋${fr(1, a * a)}sin ${a}${x}`];
    },
    (rng) => {
      const a = rng.int(1, 3);
      return a === 1 ? [`${x}cos ${x}`, `${x}sin ${x}＋cos ${x}`] : [`${x}cos ${a}${x}`, `${fr(1, a)}${x}sin ${a}${x}＋${fr(1, a * a)}cos ${a}${x}`];
    },
    () => [`log ${x}`, `${x}log ${x}－${x}`],
    (rng) => {
      const n = rng.int(1, 4);
      return [`${x}${n === 1 ? "" : sup(n)}log ${x}`, `${fr(1, n + 1)}${x}${sup(n + 1)}log ${x}－${fr(1, (n + 1) ** 2)}${x}${sup(n + 1)}`];
    },
    () => [`${x}²e[[^${x}]]`, `(${x}²－2${x}＋2)e[[^${x}]]`],
    (rng) => {
      const k = rng.int(1, 3);
      return [`log(${x}＋${k})`, `(${x}＋${k})log(${x}＋${k})－${x}`];
    },
    () => [`e[[^${x}]]sin ${x}`, `[[f:1/2]]e[[^${x}]](sin ${x}－cos ${x})`],
    () => [`e[[^${x}]]cos ${x}`, `[[f:1/2]]e[[^${x}]](sin ${x}＋cos ${x})`]
  ];
  const intParts = gen("k3.intParts", "部分積分法を用いて、次の不定積分を求めましょう。", lv({ types: [0, 1, 2, 3, 4] }, { types: [0, 1, 2, 4, 6] }, { types: [4, 5, 6, 7, 8, 0] }), (rng, i) => {
    const r = IP[i](rng);
    return { text: `[[int::]]${r[0]}d${x}`, ans: `${r[1]}${C}`, meta: { f: r[0], F: r[1] } };
  }, (pr) => chkInt(pr.meta.f, pr.meta.F) ? null : "不定積分が合わない", { work: 34 });

  // 定積分
  const DI = [
    (rng) => {
      const k = rng.int(1, 3);
      return [`[[int:0:${k}]]e[[^${x}]]d${x}`, `e${k === 1 ? "" : sup(k)}－1`, (u) => Math.exp(u), 0, k];
    },
    (rng) => {
      const k = rng.int(1, 3);
      return [`[[int:1:e${k === 1 ? "" : sup(k)}]]${fr(1, x)}d${x}`, String(k), (u) => 1 / u, 1, Math.E ** k];
    },
    () => [`[[int:0:π]]sin ${x}d${x}`, "2", Math.sin, 0, Math.PI],
    () => [`[[int:0:[[f:π/2]]]]cos ${x}d${x}`, "1", Math.cos, 0, Math.PI / 2],
    () => [`[[int:1:e]]log ${x}d${x}`, "1", Math.log, 1, Math.E],
    () => [`[[int:0:1]]${x}e[[^${x}]]d${x}`, "1", (u) => u * Math.exp(u), 0, 1],
    () => [`[[int:0:π]]${x}sin ${x}d${x}`, "π", (u) => u * Math.sin(u), 0, Math.PI],
    () => [`[[int:0:1]]${fr(x, `${x}²＋1`)}d${x}`, "[[f:1/2]]log 2", (u) => u / (u * u + 1), 0, 1],
    (rng) => {
      const k = rng.int(2, 5);
      return [`[[int:1:${k}]]${fr(1, x)}d${x}`, `log ${k}`, (u) => 1 / u, 1, k];
    },
    () => [`[[int:0:[[f:π/4]]]]${fr(1, `cos²${x}`)}d${x}`, "1", (u) => 1 / Math.cos(u) ** 2, 0, Math.PI / 4],
    () => [`[[int:0:[[f:π/2]]]]sin²${x}d${x}`, "[[f:π/4]]", (u) => Math.sin(u) ** 2, 0, Math.PI / 2],
    (rng) => {
      const k = rng.pick([1, 4, 9]);
      return [`[[int:0:${k}]]√{${x}}d${x}`, num(Q(2 * k * Math.sqrt(k), 3)), Math.sqrt, 0, k];
    },
    () => [`[[int:0:1]]√{1－${x}²}d${x}`, "[[f:π/4]]", (u) => Math.sqrt(Math.max(0, 1 - u * u)), 0, 1],
    () => [`[[int:0:1]]${fr(1, `1＋${x}²`)}d${x}`, "[[f:π/4]]", (u) => 1 / (1 + u * u), 0, 1],
    (rng) => {
      const a = rng.int(1, 5), b = rng.int(a + 1, 8), q = Q(b, a);
      return [`[[int:${a}:${b}]]${fr(1, x)}d${x}`, q[1] === 1 ? `log ${q[0]}` : `log ${fr(q[0], q[1])}`, (u) => 1 / u, a, b];
    },
    (rng) => {
      const k = rng.int(1, 4);
      return [`[[int:0:${k}π]]|sin ${x}|d${x}`.replace(":1π]]", ":π]]"), String(2 * k), (u) => Math.abs(Math.sin(u)), 0, k * Math.PI];
    },
    (rng) => {
      const n = rng.int(1, 4);
      return [`[[int:0:1]]${x}(1－${x})${sup(n)}d${x}`.replace("[[^1]]", ""), num(Q(1, (n + 1) * (n + 2))), (u) => u * (1 - u) ** n, 0, 1];
    },
    (rng) => {
      const a = rng.int(1, 4);
      return [`[[int:0:${a}]]√{${a * a}－${x}²}d${x}`, `${num(Q(a * a, 4))}π`.replace(/^1π$/, "π"), (u) => Math.sqrt(Math.max(0, a * a - u * u)), 0, a];
    },
    (rng) => {
      const k = rng.int(1, 4);
      return [`[[int:0:1]]${fr(1, `${x}＋${k}`)}d${x}`, `log ${fr(k + 1, k)}`.replace("[[f:2/1]]", "2"), (u) => 1 / (u + k), 0, 1];
    },
    (rng) => {
      const k = rng.int(2, 3);
      return [`[[int:1:${k}]]log ${x}d${x}`, `${k}log ${k}－${k - 1}`, Math.log, 1, k];
    }
  ];
  const defInt3 = gen("k3.defInt", "次の定積分を求めましょう。", lv({ types: [0, 1, 2, 3, 8, 11, 14, 15] }, { types: [0, 1, 4, 5, 6, 7, 8, 9, 10, 14, 15, 16, 19] }, { types: [5, 6, 7, 9, 10, 12, 13, 16, 17, 18, 19] }), (rng, i) => {
    const r = DI[i](rng);
    return { text: r[0], ans: r[1], meta: { v: evalH(r[1]), f: r[2], a: r[3], b: r[4] } };
  }, (pr) => {
    const m = pr.meta, I0 = simpson(m.f, m.a, m.b, 20000);
    return Math.abs(I0 - m.v) < 1e-5 ? null : "定積分が合わない";
  }, { work: 30 });
  H["k3.intBasic"] = "∫x[[^α]]dx＝[[f:x[[^α＋1]]/α＋1]]＋C(α≠－1)、∫[[f:1/x]]dx＝log|x|＋C、∫e[[^x]]dx＝e[[^x]]＋C、∫sin x dx＝－cos x＋C。";
  H["k3.intSub"] = "中身を t とおく(置換積分)。∫[[f:g′(x)/g(x)]]dx＝log|g(x)|＋C、∫f(ax＋b)dx＝[[f:1/a]]F(ax＋b)＋C。";
  H["k3.intParts"] = "∫f(x)g′(x)dx＝f(x)g(x)－∫f′(x)g(x)dx。微分すると簡単になる方を f にします(log x は f に)。";
  H["k3.defInt"] = "原始関数を求めて上端と下端の値の差をとります。√{1－x²} は半円の面積、[[f:1/1＋x²]] は x＝tan θ と置換します。";

  // ============================================================
  // 6 積分法の応用
  // ============================================================
  const AR = [
    (rng) => {
      const k = rng.int(1, 3);
      return [`曲線 ${V("y")}＝e[[^${x}]] と ${x} 軸、および2直線 ${x}＝0，${x}＝${k} で囲まれた部分の面積`, `e${k === 1 ? "" : sup(k)}－1`, (u) => Math.exp(u), 0, k];
    },
    () => [`曲線 ${V("y")}＝sin ${x}（0≦${x}≦π）と ${x} 軸で囲まれた部分の面積`, "2", Math.sin, 0, Math.PI],
    () => [`曲線 ${V("y")}＝log ${x} と ${x} 軸、および直線 ${x}＝e で囲まれた部分の面積`, "1", Math.log, 1, Math.E],
    (rng) => {
      const k = rng.int(2, 4);
      return [`曲線 ${V("y")}＝√{${x}} と直線 ${V("y")}＝[[f:${x}/${k}]] で囲まれた部分の面積`, num(Q(k ** 3, 6)), (u) => Math.sqrt(u) - u / k, 0, k * k];
    },
    (rng) => {
      const k = rng.int(2, 7);
      return [`曲線 ${V("y")}＝${fr(1, x)} と ${x} 軸、および2直線 ${x}＝1，${x}＝${k} で囲まれた部分の面積`, `log ${k}`, (u) => 1 / u, 1, k];
    },
    () => [`2曲線 ${V("y")}＝sin ${x}，${V("y")}＝cos ${x}（[[f:π/4]]≦${x}≦[[f:5/4]]π）で囲まれた部分の面積`, "2√{2}", (u) => Math.sin(u) - Math.cos(u), Math.PI / 4, 5 * Math.PI / 4],
    (rng) => {
      const a = rng.pick([2, 3]), b = rng.pick([1, 2]);
      return [`楕円 [[f:${x}²/${a * a}]]＋[[f:${V("y")}²/${b * b}]]＝1 で囲まれた部分の面積`, `${a * b}π`, (u) => 2 * b * Math.sqrt(Math.max(0, 1 - u * u / (a * a))), -a, a];
    },
    (rng) => {
      const k = rng.int(2, 4);
      return [`曲線 ${V("y")}＝sin ${k}${x}（0≦${x}≦[[f:π/${k}]]）と ${x} 軸で囲まれた部分の面積`, fr(2, k).replace("[[f:2/2]]", "1"), (u) => Math.sin(k * u), 0, Math.PI / k];
    },
    (rng) => {
      const a = rng.int(2, 5);
      return [`曲線 ${V("y")}＝${fr(a, x)} と ${x} 軸、および2直線 ${x}＝1，${x}＝e で囲まれた部分の面積`, String(a), (u) => a / u, 1, Math.E];
    },
    (rng) => {
      const k = rng.int(1, 3);
      return [`曲線 ${V("y")}＝e[[^${x}]] と ${V("y")} 軸、および直線 ${V("y")}＝e${k === 1 ? "" : sup(k)} で囲まれた部分の面積`, k === 1 ? "1" : `${k - 1 === 1 ? "" : k - 1}e${sup(k)}＋1`, (u) => Math.exp(k) - Math.exp(u), 0, k];
    },
    (rng) => {
      const k = rng.int(1, 3);
      return [`曲線 ${V("y")}＝log ${x} と ${x} 軸、および直線 ${x}＝e${k === 1 ? "" : sup(k)} で囲まれた部分の面積`, k === 1 ? "1" : `${k - 1 === 1 ? "" : k - 1}e${sup(k)}＋1`, Math.log, 1, Math.exp(k)];
    },
    (rng) => {
      const k = rng.int(1, 4);
      return [`曲線 ${V("y")}＝√{${x}} と ${x} 軸、および直線 ${x}＝${k * k} で囲まれた部分の面積`, num(Q(2 * k ** 3, 3)), Math.sqrt, 0, k * k];
    }
  ];
  const area3 = gen("k3.area", "次の面積を求めましょう。", lv({ types: [0, 1, 2, 4, 7, 8, 11] }, { types: [0, 2, 3, 4, 5, 7, 8, 9, 10, 11] }, { types: [3, 5, 6, 7, 9, 8, 10] }), (rng, i) => {
    const r = AR[i](rng);
    return { text: r[0], ans: r[1], wide: true, meta: { v: evalH(r[1]), f: r[2], a: r[3], b: r[4] } };
  }, (pr) => {
    const m = pr.meta;
    return Math.abs(simpson(m.f, m.a, m.b, 20000) - m.v) < 1e-4 ? null : "面積が合わない";
  }, { work: 36 });

  const VO = [
    (rng) => {
      const k = rng.int(1, 2);
      return [`曲線 ${V("y")}＝${x}²（0≦${x}≦${k}）と ${x} 軸、直線 ${x}＝${k} で囲まれた部分を、${x} 軸のまわりに1回転してできる立体の体積`, `${num(Q(k ** 5, 5))}π`, (u) => Math.PI * u ** 4, 0, k];
    },
    (rng) => {
      const k = rng.int(1, 4);
      return [`曲線 ${V("y")}＝√{${x}}（0≦${x}≦${k}）と ${x} 軸、直線 ${x}＝${k} で囲まれた部分を、${x} 軸のまわりに1回転してできる立体の体積`, `${num(Q(k * k, 2))}π`, (u) => Math.PI * u, 0, k];
    },
    () => [`曲線 ${V("y")}＝sin ${x}（0≦${x}≦π）と ${x} 軸で囲まれた部分を、${x} 軸のまわりに1回転してできる立体の体積`, "[[f:π²/2]]", (u) => Math.PI * Math.sin(u) ** 2, 0, Math.PI],
    (rng) => {
      const r = rng.int(1, 4);
      return [`半径 ${r} の球の体積を、積分を用いて求める`, `${num(Q(4 * r ** 3, 3))}π`, (u) => Math.PI * (r * r - u * u), -r, r];
    },
    () => [`曲線 ${V("y")}＝e[[^${x}]]（0≦${x}≦1）と ${x} 軸、${V("y")} 軸、直線 ${x}＝1 で囲まれた部分を、${x} 軸のまわりに1回転してできる立体の体積`, "[[f:π/2]](e²－1)", (u) => Math.PI * Math.exp(2 * u), 0, 1],
    (rng) => {
      const r = rng.int(1, 3), h = rng.int(2, 6);
      return [`底面の半径 ${r}、高さ ${h} の円錐の体積を、積分を用いて求める`, `${num(Q(r * r * h, 3))}π`, (u) => Math.PI * (r * u / h) ** 2, 0, h];
    },
    (rng) => {
      const k = rng.int(2, 5);
      return [`曲線 ${V("y")}＝${fr(1, x)}（1≦${x}≦${k}）と ${x} 軸、2直線 ${x}＝1，${x}＝${k} で囲まれた部分を、${x} 軸のまわりに1回転してできる立体の体積`, `${num(Q(k - 1, k))}π`, (u) => Math.PI / (u * u), 1, k];
    },
    (rng) => {
      const a = rng.int(1, 3), b = rng.int(a + 1, 4);
      return [`直線 ${V("y")}＝${x} と ${x} 軸、2直線 ${x}＝${a}，${x}＝${b} で囲まれた部分を、${x} 軸のまわりに1回転してできる立体の体積`, `${num(Q(b ** 3 - a ** 3, 3))}π`, (u) => Math.PI * u * u, a, b];
    }
  ];
  const volume = gen("k3.volume", "次の体積を求めましょう。", lv({ types: [0, 1, 3, 5, 6] }, { types: [0, 1, 2, 3, 5, 6] }, { types: [2, 4, 5, 0, 6, 1] }), (rng, i) => {
    const r = VO[i](rng);
    return { text: r[0], ans: r[1], wide: true, meta: { v: evalH(r[1]), f: r[2], a: r[3], b: r[4] } };
  }, (pr) => {
    const m = pr.meta;
    return Math.abs(simpson(m.f, m.a, m.b, 20000) - m.v) < 1e-4 * Math.max(1, m.v) ? null : "体積が合わない";
  }, { work: 36 });

  // 道のり・曲線の長さ(文章題)
  const LW = {
    dist: (rng) => {
      const p = rng.int(1, 2), q = rng.int(p + 1, 4), T = q + rng.int(0, 2);
      // v ＝ (t－p)(t－q)
      const f = (u) => (u - p) * (u - q), d = simpson((u) => Math.abs(f(u)), 0, T, 60000), s = simpson(f, 0, T, 60000);
      const dq = K.toQ(Math.round(d * 6) / 6), sq = K.toQ(Math.round(s * 6) / 6);
      return { t: `数直線上を動く点 P の、時刻 ${V("t")} における速度が ${V("v")}＝${pTex([Q(1), Q(-(p + q)), Q(p * q)], "t")} であるとき、${V("t")}＝0 から ${V("t")}＝${T} までの点 P の位置の変化量と、道のりを求めましょう。`, a: `位置の変化量 ${num(sq)}，道のり ${num(dq)}`, chk: () => Math.abs(qv(dq) - d) < 1e-6 && Math.abs(qv(sq) - s) < 1e-6 };
    },
    arc: (rng) => {
      const a = rng.pick([3, 8, 15]), L = 2 / 3 * ((1 + a) ** 1.5 - 1);
      return { t: `曲線 ${V("y")}＝[[f:2/3]]${x}[[^3/2]]（0≦${x}≦${a}）の長さを求めましょう。`, a: num(K.toQ(Math.round(L * 3) / 3)), chk: () => Math.abs(simpson((u) => Math.sqrt(1 + u), 0, a, 20000) - L) < 1e-6 && Number.isInteger(Math.round(L * 3)) && Math.abs(L * 3 - Math.round(L * 3)) < 1e-9 };
    },
    cyc: () => ({ t: `曲線 ${x}＝${V("t")}－sin ${V("t")}，${V("y")}＝1－cos ${V("t")}（0≦${V("t")}≦2π）の長さを求めましょう。`, a: "8", chk: () => Math.abs(simpson((u) => Math.sqrt((1 - Math.cos(u)) ** 2 + Math.sin(u) ** 2), 0, 2 * Math.PI, 40000) - 8) < 1e-5 }),
    tank: (rng) => {
      const r = rng.int(2, 5), h = rng.int(1, r - 1);
      // 半径 r の球形の容器に深さ h まで水:π(r h² － h³/3)
      const Vv = Q(3 * r * h * h - h ** 3, 3);
      return { t: `半径 ${r} の球の形をした容器に、深さ ${h} まで水が入っています。水の体積を求めましょう。`, a: `${num(Vv)}π`, chk: () => Math.abs(simpson((u) => Math.PI * (r * r - (u - r) ** 2), 0, h, 20000) - qv(Vv) * Math.PI) < 1e-6 };
    }
  };
  const lenWord = gen("k3.lenWord", null, lv({ types: ["dist", "tank"] }, { types: ["dist", "arc", "tank"] }, { types: ["arc", "cyc", "dist", "tank"] }), (rng, type) => {
    const r = LW[type](rng);
    return { text: r.t, ans: r.a, softKey: type, meta: { chk: r.chk }, ws: { type: "lines", labels: ["答え"] }, work: 55 };
  }, (pr) => pr.meta.chk() ? null : "答えが合わない");
  H["k3.area"] = "上の曲線から下の曲線を引いて積分します。x 軸より下の部分は符号に注意します。";
  H["k3.volume"] = "x 軸のまわりの回転体の体積 V＝π[[int:a:b]]y²dx。断面積 S(x) がわかれば V＝[[int:a:b]]S(x)dx。";
  H["k3.lenWord"] = "道のりは [[int:a:b]]|v|dt。曲線の長さは [[int:a:b]]√{1＋(y′)²}dx、媒介変数なら [[int:a:b]]√{(dx/dt)²＋(dy/dt)²}dt。";

  for (const [k, v] of Object.entries(H)) K.hints[k] = X(v);
  return [intBasic, intSub, intParts, defInt3, area3, volume, lenWord];
})();
kou3.push(...kou3c);

var kou3Grade = (() => {
  const T = (label, generator, kinds, o = {}) => ({ label, generator, kinds, ...o });
  const D = ["drill", "test"], W = ["word", "test"];
  const units = [
    ["k3-01", "関数", "極限", [T("分数関数", "k3.fracFunc", D), T("逆関数と合成関数", "k3.invFunc", D)], { drill: [10, 10] }],
    ["k3-02", "極限", "極限", [T("数列の極限", "k3.seqLim", D, { weight: 2 }), T("無限級数", "k3.series", D), T("関数の極限", "k3.funcLim", D, { weight: 2 }), T("極限と係数", "k3.limCoef", D)], { drill: [10, 10] }],
    ["k3-03", "微分法", "微分法", [T("積・商・合成関数の微分", "k3.diffRules", D, { weight: 2 }), T("いろいろな関数の微分", "k3.diffTrans", D, { weight: 2 }), T("第2次導関数・陰関数・媒介変数", "k3.diff2", D)], { drill: [10, 10] }],
    ["k3-04", "微分法の応用", "微分法", [T("接線", "k3.tangent", D), T("極値", "k3.extreme", D, { weight: 2 }), T("近似式", "k3.approx", D), T("速度と加速度", "k3.motion", W)], { drill: [8, 10], word: [2, 10] }],
    ["k3-05", "積分法", "積分法", [T("いろいろな不定積分", "k3.intBasic", D), T("置換積分法", "k3.intSub", D), T("部分積分法", "k3.intParts", D), T("定積分", "k3.defInt", D, { weight: 2 })], { drill: [10, 10] }],
    ["k3-06", "積分法の応用", "積分法", [T("面積", "k3.area", D), T("体積", "k3.volume", D), T("道のり・曲線の長さ", "k3.lenWord", W)], { drill: [8, 10], word: [2, 10] }]
  ];
  return {
    grade: 14,
    note: "高校 数学Ⅲ。学習指導要領(平成30年告示)の内容。問題文はすべてこのファイルで作ったもの。",
    units: units.map(([id, name, domain, topics, testPlan], i) => ({ id, order: i + 1, name, rubyName: name, domain, topics, testPlan }))
  };
})();
