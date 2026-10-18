  // ============================================================
  // 6 三角比 ・ 7 図形の計量
  // ============================================================
var kou1c = (() => {
  const K = kouLib;
  const { Q, qa, qs, qm, qd, qneg, qeq, isInt, qv, num, gcd, lv, nz, X, V, evalH, near, sg, rootTex, surdTex, sqFree, gen, redo, draw, T_, L_, rightMark, angMark, vLabel, sideLabel, centroid, fitDraw, fnum } = K;
  const H = K.k1.H, surdAns = K.k1.surdAns;
  const D2R = Math.PI / 180;
  // 特別な角の三角比(教科書の書き方:sin45°＝1/√2)
  const SIN = { 0: "0", 30: "[[f:1/2]]", 45: "[[f:1/√{2}]]", 60: "[[f:√{3}/2]]", 90: "1", 120: "[[f:√{3}/2]]", 135: "[[f:1/√{2}]]", 150: "[[f:1/2]]", 180: "0" };
  const COS = { 0: "1", 30: "[[f:√{3}/2]]", 45: "[[f:1/√{2}]]", 60: "[[f:1/2]]", 90: "0", 120: "－[[f:1/2]]", 135: "－[[f:1/√{2}]]", 150: "－[[f:√{3}/2]]", 180: "－1" };
  const TAN = { 0: "0", 30: "[[f:1/√{3}]]", 45: "1", 60: "√{3}", 120: "－√{3}", 135: "－1", 150: "－[[f:1/√{3}]]", 180: "0" };
  const ANG = [0, 30, 45, 60, 90, 120, 135, 150, 180];
  const fnOf = { sin: Math.sin, cos: Math.cos, tan: Math.tan };

  // 直角三角形の図から三角比
  const TRI = [[3, 4], [5, 12], [8, 15], [7, 24], [1, 2], [2, 3], [1, 3], [2, 5], [1, 1], [3, 5], [4, 5]];
  const trigFig = gen("k1.trigFig", null, lv({ types: ["legs"], hard: false }, { types: ["legs", "hyp"], hard: true }, { types: ["hyp", "legs"], hard: true }), (rng, type, p) => {
    const pool = p.hard ? TRI : TRI.slice(0, 4);
    const [a0, b0] = rng.pick(pool), k = rng.pick([1, 1, 2]);
    const [a, b] = rng.chance(0.5) ? [a0 * k, b0 * k] : [b0 * k, a0 * k];
    const c2 = a * a + b * b;
    // A は左、B は右下、C は直角(右下)。BC＝a(縦)、AC＝b(横)
    const s = Math.min(46 / b, 32 / a);
    const C0 = [10 + b * s, 6 + a * s], A0 = [10, 6 + a * s], B0 = [10 + b * s, 6];
    const cen = centroid([A0, B0, C0]);
    const shown = type === "hyp" ? (rng.chance(0.5) ? ["c", "a"] : ["c", "b"]) : ["a", "b"];
    const lab = { a: String(a), b: String(b), c: rootTex(c2) };
    const items = [{ t: "poly", pts: [A0, B0, C0], w: 0.5 }, rightMark(C0, A0, B0), vLabel(A0, cen, "A"), vLabel(B0, cen, "B"), vLabel(C0, cen, "C")];
    if (shown.includes("a")) items.push(sideLabel(B0, C0, cen, lab.a));
    if (shown.includes("b")) items.push(sideLabel(A0, C0, cen, lab.b));
    if (shown.includes("c")) items.push(sideLabel(A0, B0, cen, lab.c.replace(/√\{(\d+)\}/, "√$1")));
    const at = rng.chance(0.65) ? "A" : "B";
    // A の向かいは BC＝a
    const opp = at === "A" ? a : b, adj = at === "A" ? b : a, c = Math.sqrt(c2);
    const fr = (u, v) => surdAns("", u / v);
    const ans = `sin ${at}＝${fr(opp, c)}，cos ${at}＝${fr(adj, c)}，tan ${at}＝${fr(opp, adj)}`;
    if (/null/.test(ans)) return null;
    return { text: `右の直角三角形 ABC で、${X(`sin ${at}，cos ${at}，tan ${at}`)} の値を求めましょう。`, fig: fitDraw(items, 4), ans: X(ans), side: true, key: `tf:${a}:${b}:${type}:${at}:${shown}`, meta: { opp, adj, c } };
  }, (pr) => {
    const m = pr.meta, parts = pr.answer.display.split("，").map((s) => evalH(s.split("＝")[1]));
    return near(parts[0], m.opp / m.c) && near(parts[1], m.adj / m.c) && near(parts[2], m.opp / m.adj) ? null : "三角比が合わない";
  }, { work: 20 });

  // 特別な角の値・式の値・鋭角への変換
  const trigVal = gen("k1.trigVal", "次の問いに答えましょう。", lv({ types: ["val", "val", "expr"] }, { types: ["val", "expr", "conv"] }, { types: ["expr", "conv", "expr2"] }), (rng, type) => {
    if (type === "val") {
      const f = rng.pick(["sin", "cos", "tan"]), a = rng.pick(ANG.filter((x) => !(f === "tan" && x === 90)));
      const tb = { sin: SIN, cos: COS, tan: TAN }[f];
      return { text: `${f} ${a}° の値を求めましょう。`, ans: tb[a], key: `tv:${f}${a}`, meta: { q: `${f}${a}°` } };
    }
    if (type === "conv") {
      const f = rng.pick(["sin", "cos", "tan"]), a = rng.pick([100, 110, 115, 125, 130, 140, 145, 155, 160, 165, 170, 50, 55, 65, 70, 75, 80]);
      let sgn = 1, g = f, b = a, inv = false;
      if (b > 90) {
        b = 180 - b;
        if (f !== "sin") sgn = -1;
      }
      if (b > 45) {
        b = 90 - b;
        if (g === "sin") g = "cos";
        else if (g === "cos") g = "sin";
        else inv = true;
      }
      const body = inv ? `[[f:1/tan ${b}°]]` : `${g} ${b}°`;
      return { text: `${f} ${a}° を、0° 以上 45° 以下の角の三角比で表しましょう。`, ans: (sgn < 0 ? "－" : "") + body, key: `tc:${f}${a}`, meta: { q: `${f}${a}°` } };
    }
    const T = type === "expr" ? [
      () => `sin ${rng.pick([30, 60, 150])}°＋cos ${rng.pick([60, 120, 30])}°`,
      () => `sin 45°cos 45°＋tan ${rng.pick([45, 135])}°`,
      () => `tan ${rng.pick([60, 120])}°－tan ${rng.pick([30, 150])}°`,
      () => `cos ${rng.pick([0, 180])}°＋sin ${rng.pick([90, 30, 150])}°`
    ] : [
      () => `sin²${rng.pick([30, 45, 60, 120, 135, 150])}°＋cos²${rng.pick([30, 60, 120, 135])}°`,
      () => `sin 120°cos 150°－cos 120°sin 150°`,
      () => `(sin 135°＋cos 135°)²＋tan²${rng.pick([30, 60, 120])}°`,
      () => `[[f:1/tan 30°]]－tan ${rng.pick([60, 150])}°`
    ];
    const q = rng.pick(T)();
    const v = evalH(q), ans = surdAns(q, v);
    if (!ans) return null;
    return { text: `${q} の値を求めましょう。`, ans, meta: { q } };
  }, (pr) => near(evalH(pr.meta.q), evalH(pr.answer.display)) ? null : "値が合わない", { work: 16 });

  // 三角比の相互関係
  const REL = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [1, 0, 3], [2, 0, 3], [1, 0, 4], [3, 0, 4], [2, 0, 5]];
  const trigRel = gen("k1.trigRel", "次の問いに答えましょう。", lv({ types: ["sin", "cos"] }, { types: ["sin", "cos", "tan"] }, { types: ["tan", "cos", "sin", "tan"] }), (rng, type) => {
    // sin θ ＝ p/r(鋭角または鈍角)
    const [p0, q0, r] = rng.pick(REL), sq = q0 ? null : r * r - p0 * p0;
    const obt = rng.chance(type === "sin" ? 0.5 : 0.6);
    const sinv = p0 / r, cosv = (obt ? -1 : 1) * (q0 ? q0 / r : Math.sqrt(sq) / r);
    if (type === "tan" && !q0) return null;
    const th = Math.atan2(sinv, cosv);
    const range = obt ? "90°＜θ＜180°" : "0°＜θ＜90°";
    let given, want;
    if (type === "sin") given = `sin θ＝[[f:${p0}/${r}]]（${range}）`, want = ["cos θ", "tan θ"];
    else if (type === "cos") {
      const ct = surdAns("", cosv);
      given = `cos θ＝${ct}`, want = ["sin θ", "tan θ"];
    } else given = `tan θ＝${surdAns("", Math.tan(th))}`, want = ["sin θ", "cos θ"];
    if (/null/.test(given)) return null;
    const vals = { "sin θ": Math.sin(th), "cos θ": Math.cos(th), "tan θ": Math.tan(th) };
    const parts = want.map((w) => `${w}＝${surdAns("", vals[w])}`);
    if (parts.some((s2) => /null/.test(s2))) return null;
    const cond = type === "sin" ? "" : `（0°≦θ≦180°）`;
    return { text: `${given}${cond} のとき、${want.join("，")} の値を求めましょう。`, ans: parts.join("，"), key: `tr:${given}`, meta: { th } };
  }, (pr) => {
    const th = pr.meta.th;
    for (const part of pr.answer.display.split("，")) {
      const [f, v] = part.split("＝"), want = fnOf[f.trim().slice(0, 3)](th);
      if (!near(evalH(v), want)) return `${f} が合わない`;
    }
    return null;
  }, { work: 30 });

  // 三角比の方程式・不等式(0°≦θ≦180°)
  const EQV = { sin: [["0", 0], ["[[f:1/2]]", 0.5], ["[[f:1/√{2}]]", Math.SQRT1_2], ["[[f:√{3}/2]]", Math.sqrt(3) / 2], ["1", 1]], cos: [["[[f:1/2]]", 0.5], ["－[[f:1/2]]", -0.5], ["[[f:1/√{2}]]", Math.SQRT1_2], ["－[[f:1/√{2}]]", -Math.SQRT1_2], ["[[f:√{3}/2]]", Math.sqrt(3) / 2], ["－[[f:√{3}/2]]", -Math.sqrt(3) / 2], ["0", 0], ["－1", -1]], tan: [["1", 1], ["－1", -1], ["√{3}", Math.sqrt(3)], ["－√{3}", -Math.sqrt(3)], ["[[f:1/√{3}]]", 1 / Math.sqrt(3)], ["－[[f:1/√{3}]]", -1 / Math.sqrt(3)], ["0", 0]] };
  const fdeg = (f, d) => f === "tan" && d === 90 ? NaN : fnOf[f](d * D2R);
  const trigEq = gen("k1.trigEq", "0°≦θ≦180° のとき、次の等式・不等式を満たす θ を求めましょう。", lv({ types: ["sin", "cos"] }, { types: ["sin", "cos", "tan"] }, { types: ["ineq", "ineq", "tan", "quad"] }), (rng, type) => {
    if (type === "quad") {
      // 2sin²θ－3sinθ＋1＝0 など:sinθ＝1/2, 1
      const T = rng.pick([["2sin²θ－3sin θ＋1＝0", (d) => 2 * Math.sin(d * D2R) ** 2 - 3 * Math.sin(d * D2R) + 1], ["2cos²θ－cos θ－1＝0", (d) => 2 * Math.cos(d * D2R) ** 2 - Math.cos(d * D2R) - 1], ["2sin²θ＋cos θ－1＝0", (d) => 2 * Math.sin(d * D2R) ** 2 + Math.cos(d * D2R) - 1]]);
      const sol = ANG.filter((d) => Math.abs(T[1](d)) < 1e-9);
      return { text: T[0], ans: `θ＝${sol.map((d) => d + "°").join(", ")}`, meta: { eq: T[1], sol } };
    }
    if (type === "ineq") {
      const f = rng.pick(["sin", "cos", "tan"]), [vt, v] = rng.pick(EQV[f].filter((e) => e[1] !== 0 && Math.abs(e[1]) !== 1 || f === "tan")), op = rng.pick(["＞", "≧", "＜", "≦"]);
      if (f === "sin" && (op === "＜" || op === "≦") && rng.chance(0.5)) return null;
      const ok = (d) => {
        const y = fdeg(f, d);
        if (!Number.isFinite(y)) return false;
        return op === "＞" ? y > v + 1e-12 : op === "≧" ? y >= v - 1e-12 : op === "＜" ? y < v - 1e-12 : y <= v + 1e-12;
      };
      // 0〜180 を 0.5°ずつ見て区間にする
      const ivs = [];
      let cur = null;
      for (let d2 = 0; d2 <= 360; d2++) {
        const d = d2 / 2, y = ok(d);
        if (y && !cur) cur = { a: d, b: d };
        else if (y) cur.b = d;
        else if (cur) ivs.push(cur), cur = null;
      }
      if (cur) ivs.push(cur);
      if (!ivs.length || ivs.length > 2) return null;
      const edge = (d, isStart) => {
        // 端の値が入るか(等号・90°の tan)
        const inc = ok(d);
        return { d, inc };
      };
      const txt = ivs.map(({ a, b }) => {
        // a, b は 0.5°単位。端は特別な角
        const A = ANG.reduce((u, w) => Math.abs(w - a) < Math.abs(u - a) ? w : u), B = ANG.reduce((u, w) => Math.abs(w - b) < Math.abs(u - b) ? w : u);
        const ia = ok(A), ib = ok(B);
        if (A === B) return `θ＝${A}°`;
        return `${A}°${ia ? "≦" : "＜"}θ${ib ? "≦" : "＜"}${B}°`;
      }).join(", ");
      return { text: `${f} θ${op}${vt}`, ans: txt, meta: { ok } };
    }
    const f = type, [vt, v] = rng.pick(EQV[f]);
    const sol = ANG.filter((d) => Math.abs(fdeg(f, d) - v) < 1e-9);
    return { text: `${f} θ＝${vt}`, ans: `θ＝${sol.map((d) => d + "°").join(", ")}`, meta: { eq: (d) => fdeg(f, d) - v, sol } };
  }, (pr) => {
    const m = pr.meta;
    if (m.eq) {
      const got = [];
      for (let d = 0; d <= 180; d += 0.25) if (Math.abs(m.eq(d)) < 1e-9) got.push(d);
      return got.join() === m.sol.join() && pr.answer.display === `θ＝${m.sol.map((d) => d + "°").join(", ")}` ? null : "解が合わない";
    }
    // 不等式:答えの文字を読み直して比べる
    const parts = pr.answer.display.split(", ");
    const inAns = (d) => parts.some((s) => {
      let mm;
      if (mm = /^θ＝(\d+)°$/.exec(s)) return d === Number(mm[1]);
      mm = /^(\d+)°([＜≦])θ([＜≦])(\d+)°$/.exec(s);
      const a = Number(mm[1]), b = Number(mm[4]);
      return (mm[2] === "≦" ? d >= a : d > a) && (mm[3] === "≦" ? d <= b : d < b);
    });
    for (let d = 0; d <= 180; d += 0.25) if (inAns(d) !== m.ok(d)) return `解がちがう θ=${d}`;
    return null;
  }, { work: 24 });

  // 三角比の利用(文章題):値は表から
  const t4 = (v) => v.toFixed(4);
  const TRW = {
    tree: (rng) => {
      const d = rng.pick([10, 12, 15, 20, 25]), a = rng.pick([20, 25, 28, 32, 35, 38, 40]), eye = rng.pick([1.5, 1.6]);
      const t = Number(t4(Math.tan(a * D2R))), h = Math.round((d * t + eye) * 10) / 10;
      return { t: `木の根もとから水平に ${d}m 離れた地点で、木の先端を見上げた角(仰角)は ${a}° でした。目の高さを ${eye}m とすると、木の高さは約何 m ですか。小数第2位を四捨五入して答えましょう。ただし、tan ${a}°＝${t4(Math.tan(a * D2R))} とします。`, a: `約 ${h}m`, v: h, chk: () => Math.abs(d * t + eye - h) <= 0.05 + 1e-9 };
    },
    slope: (rng) => {
      const L = rng.pick([100, 200, 300, 500]), a = rng.pick([5, 8, 10, 12, 15]);
      const s = Number(t4(Math.sin(a * D2R))), c = Number(t4(Math.cos(a * D2R)));
      const up = Math.round(L * s * 10) / 10, side = Math.round(L * c * 10) / 10;
      return { t: `傾斜角 ${a}° のまっすぐな坂道を ${L}m 進みました。水平方向に約何 m 進み、鉛直方向に約何 m 上がりましたか。小数第2位を四捨五入して答えましょう。ただし、sin ${a}°＝${t4(Math.sin(a * D2R))}，cos ${a}°＝${t4(Math.cos(a * D2R))} とします。`, a: `水平方向 約 ${side}m，鉛直方向 約 ${up}m`, chk: () => Math.abs(L * s - up) <= 0.05 + 1e-9 && Math.abs(L * c - side) <= 0.05 + 1e-9 };
    },
    angle: (rng) => {
      // 高さ h の塔を d m 離れて見上げると、仰角はおよそ何度か(表から近い角)
      const deg = rng.int(15, 40), d = rng.pick([30, 40, 50, 60]), h = Math.round(d * Math.tan(deg * D2R));
      const tbl = [deg - 1, deg, deg + 1].map((x) => `tan ${x}°＝${t4(Math.tan(x * D2R))}`).join("，");
      const best = [deg - 1, deg, deg + 1].reduce((u, w) => Math.abs(Math.tan(w * D2R) - h / d) < Math.abs(Math.tan(u * D2R) - h / d) ? w : u);
      return { t: `高さ ${h}m のビルの屋上を、ビルから水平に ${d}m 離れた地面の地点から見上げました。見上げた角はおよそ何度ですか。${tbl} を使い、最も近い整数で答えましょう。`, a: `約 ${best}°`, chk: () => true };
    }
  };
  const trigWord = gen("k1.trigWord", null, lv({ types: ["tree", "slope"] }, { types: ["tree", "slope", "angle"] }, { types: ["slope", "angle", "tree"] }), (rng, type) => {
    const r = TRW[type](rng);
    return { text: r.t, ans: r.a, softKey: type, meta: { chk: r.chk }, ws: { type: "lines", labels: ["答え"] }, work: 45 };
  }, (pr) => pr.meta.chk() ? null : "答えが合わない");
  H["k1.trigFig"] = "sin A＝[[f:対辺/斜辺]]，cos A＝[[f:底辺/斜辺]]，tan A＝[[f:対辺/底辺]]。たりない辺は三平方の定理で求めます。";
  H["k1.trigVal"] = "sin(180°－θ)＝sin θ，cos(180°－θ)＝－cos θ，tan(180°－θ)＝－tan θ、sin(90°－θ)＝cos θ。単位円をかいて考えます。";
  H["k1.trigRel"] = "sin²θ＋cos²θ＝1，tan θ＝[[f:sin θ/cos θ]]，1＋tan²θ＝[[f:1/cos²θ]]。θ が鈍角なら cos θ＜0、tan θ＜0 です。";
  H["k1.trigEq"] = "半径1の半円をかき、y 座標が sin θ、x 座標が cos θ になる点を探します。";
  H["k1.trigWord"] = "直角三角形を見つけ、tan(高さ÷水平の距離)・sin・cos を使います。";

  // ============================================================
  // 7 図形の計量
  // ============================================================
  const SPA = [30, 45, 60, 90, 120, 135, 150];
  const sv = (a) => Math.sin(a * D2R);
  const pa = (a) => `${a}°`;
  const sineLaw = gen("k1.sineLaw", "△ABC において、次のものを求めましょう。", lv({ types: ["side", "R"] }, { types: ["side", "R", "angle"] }, { types: ["side", "angle", "R2"] }), (rng, type) => {
    if (type === "side") {
      const A = rng.pick(SPA), B = rng.pick(SPA.filter((b) => A + b < 180 && b !== A)), a = rng.int(2, 8);
      const b = a * sv(B) / sv(A), ans = surdAns("", b);
      if (!ans) return null;
      return { text: X(`a＝${a}，A＝${A}°，B＝${B}° のとき、b`), ans, meta: { v: b } };
    }
    if (type === "R" || type === "R2") {
      const A = rng.pick(SPA), a = rng.int(2, 9);
      const R = a / (2 * sv(A)), ans = surdAns("", R);
      if (!ans) return null;
      if (type === "R2") {
        // b と B から外接円の半径、続けて a
        const B = rng.pick(SPA.filter((b) => b + A < 180 && b !== A)), b = 2 * R * sv(B), bt = surdAns("", b);
        if (!bt) return null;
        return { text: X(`b＝${bt}，B＝${B}°，A＝${A}° のとき、外接円の半径 R と a`), ans: X(`R＝${ans}，a＝${a}`), meta: { R, a } };
      }
      return { text: X(`a＝${a}，A＝${A}° のとき、外接円の半径 R`), ans: X(`R＝${ans}`), meta: { v: R } };
    }
    // a, b, A から B(2通りもある)
    const A = rng.pick([30, 45, 60]), B0 = rng.pick([30, 45, 60, 90].filter((b) => b !== A)), a = rng.int(2, 6);
    const b = a * sv(B0) / sv(A), bt = surdAns("", b);
    if (!bt) return null;
    const Bs = [B0, 180 - B0].filter((B) => A + B < 180 && B > 0).filter((x, i, arr) => arr.indexOf(x) === i);
    return { text: X(`a＝${a}，b＝${bt}，A＝${A}° のとき、B`), ans: X(`B＝${Bs.map(pa).join(", ")}`), meta: { a, b, A, Bs } };
  }, (pr) => {
    const m = pr.meta, d = pr.answer.display;
    if (m.v !== undefined) return near(evalH(d.replace(/^.*＝/, "")), m.v) ? null : "値が合わない";
    if (m.R !== undefined) return near(evalH(d.split("，")[0].replace(/^.*＝/, "")), m.R) ? null : "R が合わない";
    // B の候補をすべて調べる
    const got = [];
    for (let B = 1; B < 180; B++) if (Math.abs(m.a / sv(m.A) - m.b / sv(B)) < 1e-9 && m.A + B < 180) got.push(B);
    return got.join() === m.Bs.join() ? null : "B が合わない";
  }, { work: 30 });

  const COSS = { 60: 0.5, 120: -0.5, 90: 0 };
  const cosLaw = gen("k1.cosLaw", "△ABC において、次のものを求めましょう。", lv({ types: ["side", "side", "angle"] }, { types: ["side", "angle", "side45"] }, { types: ["angle", "side45", "judge", "angleMax"] }), (rng, type) => {
    if (type === "side" || type === "side45") {
      const b = rng.int(2, 8), k = rng.int(1, 5);
      let A, c, ct, a2;
      if (type === "side") {
        A = rng.pick([60, 120, 90]), c = rng.int(2, 9);
        if (b === c && A === 60) return null;
        ct = String(c), a2 = b * b + c * c - 2 * b * c * COSS[A];
      } else {
        // c ＝ k√2 で 45°・135°、c ＝ k√3 で 30°・150°
        if (rng.chance(0.5)) A = rng.pick([45, 135]), ct = `${k === 1 ? "" : k}√{2}`, a2 = b * b + 2 * k * k - 2 * b * k * (A === 45 ? 1 : -1);
        else A = rng.pick([30, 150]), ct = `${k === 1 ? "" : k}√{3}`, a2 = b * b + 3 * k * k - 3 * b * k * (A === 30 ? 1 : -1);
      }
      if (a2 <= 0) return null;
      return { text: X(`b＝${b}，c＝${ct}，A＝${A}° のとき、a`), ans: X(`a＝${rootTex(a2)}`), meta: { v: Math.sqrt(a2) } };
    }
    if (type === "judge") {
      const s = [rng.int(3, 9), rng.int(3, 9), rng.int(3, 12)].sort((u, v) => u - v);
      if (s[2] >= s[0] + s[1]) return null;
      const d = s[0] ** 2 + s[1] ** 2 - s[2] ** 2;
      const kind = d > 0 ? "鋭角三角形" : d === 0 ? "直角三角形" : "鈍角三角形";
      return { text: `${X(`a＝${s[0]}，b＝${s[1]}，c＝${s[2]}`)} のとき、△ABC は鋭角三角形・直角三角形・鈍角三角形のどれか`, ans: kind, meta: { s, kind } };
    }
    // 3辺から角
    const A = rng.pick([60, 120]), b = rng.int(2, 8), c = rng.int(2, 8), a2 = b * b + c * c - 2 * b * c * COSS[A];
    if (b === c) return null;
    const at = rootTex(a2);
    if (type === "angleMax") {
      if (A !== 120) return null;
      return { text: X(`a＝${at}，b＝${b}，c＝${c} のとき、最も大きい角の大きさ`), ans: X(`A＝120°`), meta: { cosA: (b * b + c * c - a2) / (2 * b * c), want: 120 } };
    }
    return { text: X(`a＝${at}，b＝${b}，c＝${c} のとき、A`), ans: X(`A＝${A}°`), meta: { cosA: (b * b + c * c - a2) / (2 * b * c), want: A } };
  }, (pr) => {
    const m = pr.meta;
    if (m.v !== undefined) return near(evalH(pr.answer.display.replace(/^.*＝/, "")), m.v) ? null : "辺が合わない";
    if (m.kind) {
      const d = m.s[0] ** 2 + m.s[1] ** 2 - m.s[2] ** 2;
      return (d > 0 ? "鋭角三角形" : d === 0 ? "直角三角形" : "鈍角三角形") === pr.answer.display ? null : "種類が合わない";
    }
    return near(Math.cos(m.want * D2R), m.cosA) ? null : "角が合わない";
  }, { work: 30 });

  const triArea = gen("k1.triArea", "△ABC の面積 S を求めましょう。", lv({ types: ["sas", "sas"] }, { types: ["sas", "sss"] }, { types: ["sss", "inr", "circ"] }), (rng, type) => {
    if (type === "sas") {
      const A = rng.pick(SPA.filter((a) => a !== 90)), b = rng.int(2, 9), c = rng.int(2, 9);
      const S = 0.5 * b * c * sv(A), ans = surdAns("", S);
      if (!ans) return null;
      return { text: X(`b＝${b}，c＝${c}，A＝${A}°`), ans: X(`S＝${ans}`), meta: { S } };
    }
    const s = [rng.int(3, 9), rng.int(3, 9), rng.int(3, 9)].sort((u, v) => u - v);
    if (s[2] >= s[0] + s[1] || s[0] === s[2]) return null;
    const [a, b, c] = rng.shuffle(s);
    const N = (a + b + c) * (-a + b + c) * (a - b + c) * (a + b - c), S = Math.sqrt(N) / 4;
    const St = surdTex(Q(0), Q(1, 4), N);
    if (type === "sss") return { text: X(`a＝${a}，b＝${b}，c＝${c}`), ans: X(`S＝${St}`), meta: { S } };
    if (type === "inr") {
      const r = 2 * S / (a + b + c), rt = surdAns("", r);
      if (!rt) return null;
      return { text: X(`a＝${a}，b＝${b}，c＝${c}。また、内接円の半径 r も求めましょう。`), ans: X(`S＝${St}，r＝${rt}`), meta: { S, r } };
    }
    const R = a * b * c / (4 * S), Rt = surdAns("", R);
    if (!Rt) return null;
    return { text: X(`a＝${a}，b＝${b}，c＝${c}。また、外接円の半径 R も求めましょう。`), ans: X(`S＝${St}，R＝${Rt}`), meta: { S, R } };
  }, (pr) => {
    const m = pr.meta, parts = pr.answer.display.split("，").map((s) => evalH(s.replace(/^.*＝/, "")));
    if (!near(parts[0], m.S)) return "面積が合わない";
    if (m.r !== undefined && !near(parts[1], m.r)) return "内接円の半径が合わない";
    if (m.R !== undefined && !near(parts[1], m.R)) return "外接円の半径が合わない";
    return null;
  }, { work: 34 });

  // 図形の計量の文章題(測量・空間図形)
  const MEW = {
    river: (rng) => {
      // AB＝d、∠A＝α、∠B＝β(α＋β＝120 か 135)で AC
      const [al, be] = rng.pick([[75, 45], [45, 75], [60, 75], [75, 60], [105, 30], [30, 105], [45, 90]]), d = rng.pick([20, 30, 40, 50, 60, 100]);
      const C = 180 - al - be, AC = d * sv(be) / sv(C), ans = surdAns("", AC);
      if (!ans) return null;
      return { t: `川の両岸にある2地点 A，C の距離を求めるために、A と同じ岸に地点 B をとって測ったところ、AB＝${d}m，∠CAB＝${al}°，∠ABC＝${be}° でした。2地点 A，C の間の距離を求めましょう。`, a: `${ans}m`, v: AC };
    },
    cuboid: (rng) => {
      const [a, b, c] = [rng.int(1, 4), rng.int(1, 4), rng.int(1, 4)];
      if (a === b && b === c && rng.chance(0.7)) return null;
      const N = a * a * b * b + b * b * c * c + c * c * a * a;
      return { t: `直方体 ABCD-EFGH で、AB＝${a}，AD＝${b}，AE＝${c} です。3点 A，F，C を頂点とする △AFC の面積を求めましょう。`, a: surdTex(Q(0), Q(1, 2), N), v: Math.sqrt(N) / 2 };
    },
    tetra: (rng) => {
      // 1辺 a の正四面体の高さ・体積
      const a = rng.pick([2, 3, 4, 6]), ask = rng.int(0, 1);
      const h = a * Math.sqrt(6) / 3, V0 = a ** 3 * Math.sqrt(2) / 12;
      return ask ? { t: `1辺の長さが ${a} の正四面体 ABCD の体積を求めましょう。`, a: surdAns("", V0), v: V0 } : { t: `1辺の長さが ${a} の正四面体 ABCD で、頂点 A から △BCD に下ろした垂線の長さ(高さ)を求めましょう。`, a: surdAns("", h), v: h };
    }
  };
  const measWord = gen("k1.measWord", null, lv({ types: ["river", "cuboid"] }, { types: ["river", "cuboid", "tetra"] }, { types: ["tetra", "cuboid", "river"] }), (rng, type) => {
    const r = MEW[type](rng);
    if (!r || !r.a) return null;
    return { text: r.t, ans: r.a, softKey: type, meta: { v: r.v }, ws: { type: "lines", labels: ["答え"] }, work: 55 };
  }, (pr) => near(evalH(pr.answer.display.replace(/m$/, "")), pr.meta.v) ? null : "答えが合わない");
  H["k1.sineLaw"] = "正弦定理 [[f:a/sin A]]＝[[f:b/sin B]]＝[[f:c/sin C]]＝2R。sin B の値から B を求めるときは、鋭角と鈍角の2つを考えます。";
  H["k1.cosLaw"] = "余弦定理 a²＝b²＋c²－2bc cos A、cos A＝[[f:b²＋c²－a²/2bc]]。最大の辺の向かいの角が最大の角です。";
  H["k1.triArea"] = "S＝[[f:1/2]]bc sin A。3辺がわかるときは cos A → sin A を求めます。内接円の半径 r は S＝[[f:1/2]]r(a＋b＋c)。";
  H["k1.measWord"] = "求めたい長さをふくむ三角形を取り出し、正弦定理・余弦定理・三平方の定理を使います。";

  return [trigFig, trigVal, trigRel, trigEq, trigWord, sineLaw, cosLaw, triArea, measWord];
})();
kou1.push(...kou1c);
