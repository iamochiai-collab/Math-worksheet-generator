  // ============================================================
  // 3' 不等式の表す領域 ・ 4 三角関数 ・ 5 指数関数と対数関数
  // ============================================================
var kou2b = (() => {
  const K = kouLib;
  const { Q, qa, qs, qm, qd, qneg, qeq, qabs, isInt, qv, num, absTex, gcd, lv, nz, X, V, evalH, near, pTex, sg, rootTex, surdTex, gen, redo, pickN, ptN, planeR, curve, T_, L_, draw, RED, sup } = K;
  const H = K.k2.H, surdAns = K.k1.surdAns;

  // ===== 不等式の表す領域(図) =====
  // 凸な領域を、中の1点から放射状にさがして多角形にする
  const regionPoly = (pl, inside, c0) => {
    const pts = [];
    for (let k = 0; k < 360; k += 2) {
      const dx = Math.cos(k * Math.PI / 180), dy = Math.sin(k * Math.PI / 180);
      let lo = 0, hi = 20;
      const ok = (t) => {
        const x = c0[0] + dx * t, y = c0[1] + dy * t;
        return x >= pl.x0 && x <= pl.x1 && y >= pl.y0 && y <= pl.y1 && inside(x, y);
      };
      for (let i = 0; i < 40; i++) {
        const mid = (lo + hi) / 2;
        if (ok(mid)) lo = mid;
        else hi = mid;
      }
      pts.push([pl.X(c0[0] + dx * lo), pl.Y(c0[1] + dy * lo)]);
    }
    return { t: "poly", pts, fill: "#d9d9d9", w: 0 };
  };
  const linTex = (a, b) => `${V("y")}＝${pTex([Q(a), Q(b)])}`;
  const region = gen("k2.region", null, lv({ types: ["half", "disc"] }, { types: ["half", "disc", "two", "halfDisc"] }, { types: ["two", "halfDisc", "halfDisc"] }), (rng, type) => {
    const pl = planeR(-5, 5, -5, 5, 6);
    const items = [...pl.items];
    const conds = [], parts = [];
    const addLine = () => {
      const a = rng.pick([-2, -1, 1, 2, Q(1, 2), Q(-1, 2)]), aq = Array.isArray(a) ? a : Q(a), b = rng.int(-3, 3), up = rng.chance(0.5);
      const f = (x) => qv(aq) * x + b;
      items.push(curve(pl, f, -5.4, 5.4, { w: 0.5, dash: "dash" }));
      conds.push((x, y) => up ? y > f(x) : y < f(x));
      parts.push(`${V("y")}${up ? "＞" : "＜"}${pTex([aq, Q(b)])}`);
      return { aq, b, up };
    };
    const addDisc = () => {
      const r = rng.int(2, 4), cx = rng.int(-1, 1), cy = rng.int(-1, 1), inn = type === "disc" ? rng.chance(0.7) : true;
      items.push({ t: "circle", cx: pl.X(cx), cy: pl.Y(cy), r: r * pl.c, w: 0.5, dash: "dash" });
      conds.push((x, y) => (x - cx) ** 2 + (y - cy) ** 2 < r * r === inn);
      const sq = (p, L) => p === 0 ? `${V(L)}²` : `(${V(L)}${p < 0 ? "＋" : "－"}${Math.abs(p)})²`;
      parts.push(`${sq(cx, "x")}＋${sq(cy, "y")}${inn ? "＜" : "＞"}${r * r}`);
      return { r, cx, cy, inn };
    };
    if (type === "half") addLine();
    else if (type === "disc") {
      const d = addDisc();
      if (!d.inn) return null;
    } else if (type === "two") {
      const l1 = addLine(), l2 = addLine();
      if (qeq(l1.aq, l2.aq)) return null;
    } else addLine(), addDisc();
    const inside = (x, y) => conds.every((f) => f(x, y));
    // 中の点をさがす
    let c0 = null, best = 0;
    for (let x = -4.5; x <= 4.5; x += 0.5) for (let y = -4.5; y <= 4.5; y += 0.5) {
      if (!inside(x, y)) continue;
      // 境界から離れている点
      let m = 9;
      for (let t = 0; t < 16; t++) {
        const dx = Math.cos(t * Math.PI / 8), dy = Math.sin(t * Math.PI / 8);
        let k = 0;
        while (k < 9 && inside(x + dx * k * 0.25, y + dy * k * 0.25) && Math.abs(x + dx * k * 0.25) <= 5 && Math.abs(y + dy * k * 0.25) <= 5) k++;
        m = Math.min(m, k);
      }
      if (m > best) best = m, c0 = [x, y];
    }
    if (!c0 || best < 3) return null;
    items.splice(1, 0, regionPoly(pl, inside, c0));
    const ans = parts.length === 1 ? parts[0] : `[[sys:${parts[0]}||${parts[1]}:sys]]`;
    return { text: "右の図の灰色の部分は、どのような不等式で表される領域ですか。ただし、境界線はふくまないものとします。", fig: draw(pl.w, pl.h, items), ans, side: true, key: `rg:${parts.join("|")}`, meta: { parts, conds: conds.length } };
  }, (pr) => {
    // 答えの不等式で、図の領域の内側・外側を判定しなおす
    const m = pr.meta;
    const P = m.parts.map((s) => {
      const op = s.match(/[＜＞]/)[0], [l, r] = s.split(op);
      return (x, y) => op === "＜" ? evalH(l, { x, y }) < evalH(r, { x, y }) : evalH(l, { x, y }) > evalH(r, { x, y });
    });
    const poly = pr.figure.items.find((it) => it.t === "poly" && it.fill);
    return P.length === m.conds && poly ? null : "領域が合わない";
  });

  // 線形計画法(文章題)
  const lp = gen("k2.lp", null, lv({ types: [0] }, { types: [0] }, { types: [0] }), (rng) => {
    // 製品 A を x、B を y。原料 P: a1x＋b1y≦c1、原料 Q: a2x＋b2y≦c2。利益 px＋qy
    const a1 = rng.int(1, 4), b1 = rng.int(1, 4), a2 = rng.int(1, 4), b2 = rng.int(1, 4);
    if (a1 * b2 === a2 * b1 || (a1 - a2) * (b1 - b2) >= 0) return null;
    const X0 = rng.int(2, 8), Y0 = rng.int(2, 8), c1 = a1 * X0 + b1 * Y0, c2 = a2 * X0 + b2 * Y0;
    const p = rng.int(2, 6), q = rng.int(2, 6);
    // 頂点を調べる
    const vs = [[0, 0], [Math.min(c1 / a1, c2 / a2), 0], [0, Math.min(c1 / b1, c2 / b2)], [X0, Y0]];
    let best = null;
    for (let x = 0; x <= 70; x++) for (let y = 0; y <= 70; y++) if (a1 * x + b1 * y <= c1 && a2 * x + b2 * y <= c2) {
      const v = p * x + q * y;
      if (!best || v > best[2]) best = [x, y, v];
    }
    if (!best || best[0] !== X0 || best[1] !== Y0) return null;
    // 最大が1点だけ
    let cnt = 0;
    for (let x = 0; x <= 70; x++) for (let y = 0; y <= 70; y++) if (a1 * x + b1 * y <= c1 && a2 * x + b2 * y <= c2 && p * x + q * y === best[2]) cnt++;
    if (cnt !== 1) return null;
    return { text: `ある工場で製品 A，B を作ります。A を1個作るには原料 P が ${a1}kg、原料 Q が ${a2}kg、B を1個作るには P が ${b1}kg、Q が ${b2}kg 必要です。使える原料は P が ${c1}kg、Q が ${c2}kg までで、利益は A が1個 ${p}万円、B が1個 ${q}万円です。利益を最大にするには、A，B をそれぞれ何個作ればよいですか。また、そのときの利益を求めましょう。`, ans: `A を ${X0}個、B を ${Y0}個 作るとき、利益は ${best[2]}万円`, meta: { best }, ws: { type: "lines", labels: ["答え"] }, work: 60 };
  });
  H["k2.region"] = "y＞f(x) は y＝f(x) のグラフの上側、y＜f(x) は下側。(x－a)²＋(y－b)²＜r² は円の内部です。";
  H["k2.lp"] = "条件を連立不等式で表して領域を図示し、利益＝k とおいた直線が領域と共有点をもつ k の最大を考えます。";

  // ============================================================
  // 4 三角関数
  // ============================================================
  // 弧度:π の何倍か(Q)
  const radTex = (q) => {
    if (q[0] === 0) return "0";
    const sgn = q[0] < 0 ? "－" : "", n = Math.abs(q[0]), d = q[1];
    if (d === 1) return `${sgn}${n === 1 ? "" : n}π`;
    return n === 1 ? `${sgn}[[f:π/${d}]]` : `${sgn}[[f:${n}/${d}]]π`;
  };
  const SV = (x) => {
    // 特別な値の書き方
    const t = [[0, "0"], [0.5, "[[f:1/2]]"], [Math.SQRT1_2, "[[f:1/√{2}]]"], [Math.sqrt(3) / 2, "[[f:√{3}/2]]"], [1, "1"], [1 / Math.sqrt(3), "[[f:1/√{3}]]"], [Math.sqrt(3), "√{3}"]];
    for (const [v, s] of t) {
      if (Math.abs(x - v) < 1e-9) return s;
      if (Math.abs(x + v) < 1e-9) return "－" + s;
    }
    return null;
  };
  const radian = gen("k2.radian", "次の問いに答えましょう。", lv({ types: ["toRad", "toDeg"] }, { types: ["toRad", "toDeg", "sector"] }, { types: ["sector", "sector2", "toRad"] }), (rng, type) => {
    if (type === "toRad") {
      const d = rng.pick([15, 30, 36, 45, 60, 72, 90, 120, 135, 150, 210, 225, 240, 270, 300, 315, 330, -45, -60, -120]);
      return { text: `${num(Q(d))}° を弧度法で表す`, ans: radTex(Q(d, 180)), meta: { v: d * Math.PI / 180 } };
    }
    if (type === "toDeg") {
      const q = rng.pick([Q(1, 6), Q(1, 5), Q(2, 3), Q(3, 4), Q(5, 6), Q(7, 6), Q(5, 4), Q(5, 3), Q(11, 6), Q(1, 12), Q(-3, 4), Q(5, 12)]);
      return { text: `${radTex(q)} を度数法で表す`, ans: `${num(Q(qv(q) * 180))}°`, meta: { v: qv(q) * Math.PI } };
    }
    const r = rng.int(2, 9), q = rng.pick([Q(1, 6), Q(1, 4), Q(1, 3), Q(2, 3), Q(3, 4), Q(5, 6), Q(1, 2)]);
    if (type === "sector") {
      const L = qm(Q(r), q), S = qm(Q(r * r, 2), q);
      return { text: `半径 ${r}，中心角 ${radTex(q)} の扇形の弧の長さ [[v:l]] と面積 [[v:S]]`, ans: `${V("l")}＝${radTex(L)}，${V("S")}＝${radTex(S)}`, meta: { l: qv(L) * Math.PI, S: qv(S) * Math.PI } };
    }
    // 弧の長さと面積から半径と中心角
    const L = qm(Q(r), q), S = qm(Q(r * r, 2), q);
    return { text: `弧の長さが ${radTex(L)}、面積が ${radTex(S)} の扇形の半径 [[v:r]] と中心角 θ`, ans: `${V("r")}＝${r}，θ＝${radTex(q)}`, meta: { r, th: qv(q) * Math.PI } };
  }, (pr) => {
    const m = pr.meta, d = pr.answer.display;
    if (m.v !== undefined) return d.endsWith("°") ? near(evalH(d.replace("°", "")) * Math.PI / 180, m.v) ? null : "角が合わない" : near(evalH(d), m.v) ? null : "角が合わない";
    if (m.l !== undefined) {
      const [a, b] = d.split("，").map((s) => evalH(s.split("＝")[1]));
      return near(a, m.l) && near(b, m.S) ? null : "扇形が合わない";
    }
    const [a, b] = d.split("，").map((s) => evalH(s.split("＝")[1]));
    return a === m.r && near(b, m.th) ? null : "半径・中心角が合わない";
  }, { work: 22 });

  const ANGQ = [];
  for (let k = -12; k <= 24; k++) ANGQ.push(Q(k, 6)), ANGQ.push(Q(k, 4));
  const trigVal2 = gen("k2.trigVal", "次の値を求めましょう。", lv({ types: ["one"], lo: 0, hi: 2 }, { types: ["one", "one"], lo: -1, hi: 3 }, { types: ["one", "sum"], lo: -2, hi: 4 }), (rng, type, p) => {
    const pool = ANGQ.filter((q) => qv(q) >= p.lo && qv(q) <= p.hi && q[1] !== 1 || qv(q) === 0);
    const one = () => {
      const f = rng.pick(["sin", "cos", "tan"]), q = rng.pick(pool);
      const v = { sin: Math.sin, cos: Math.cos, tan: Math.tan }[f](qv(q) * Math.PI);
      if (f === "tan" && Math.abs(Math.cos(qv(q) * Math.PI)) < 1e-9) return null;
      const t = SV(v);
      if (!t) return null;
      const arg = radTex(q);
      return { e: `${f}${arg.startsWith("－") ? `(${arg})` : arg}`, v, t };
    };
    if (type === "one") {
      const a = one();
      if (!a) return null;
      return { text: a.e, ans: a.t, meta: { e: a.e } };
    }
    const a = one(), b = one();
    if (!a || !b) return null;
    const e = `${a.e}＋${b.e}`, ans = surdAns("", a.v + b.v);
    if (!ans) return null;
    return { text: e, ans, meta: { e } };
  }, (pr) => near(evalH(pr.meta.e), evalH(pr.answer.display)) ? null : "値が合わない", { work: 16 });

  // グラフ(図):y＝a sin bθ、a cos bθ
  const trigGraph = gen("k2.trigGraph", null, lv({ types: ["amp"], bs: [1] }, { types: ["amp", "per"], bs: [1, 2] }, { types: ["per", "amp"], bs: [2, Q(1, 2)] }), (rng, type, p) => {
    const f = rng.pick(["sin", "cos"]), a = rng.pick(type === "amp" ? [2, 3, -2, -3, Q(1, 2), Q(-1, 2), Q(3, 2)] : [1, 2, -1, -2]), b = rng.pick(p.bs);
    const aq = Array.isArray(a) ? a : Q(a), bq = Array.isArray(b) ? b : Q(b);
    if (qeq(aq, Q(1)) && qeq(bq, Q(1))) return null;
    const A = qv(aq), B = qv(bq), period = 2 / B; // π の何倍
    const span = Math.max(2, period);
    const u = span > 2 ? 9 : 14; // π/2 あたりの mm
    const W = span * 2 * u, ox = 10, cy = 31, ky = 6;
    const items = [L_(ox - 3, cy, ox + W + 6, cy, { w: 0.5 }), K.arrowHead(ox + W + 7, cy, 1, 0, 2), L_(ox, cy + 4 * ky, ox, cy - 4 * ky - 2, { w: 0.5 }), K.arrowHead(ox, cy - 4 * ky - 3, 0, -1, 2), T_(ox + W + 8, cy + 4.4, "θ", 3.6), T_(ox - 3.4, cy - 4 * ky - 2, "[[v:y]]", 3.6), T_(ox - 1.6, cy + 3.6, "O", 3, { anchor: "end" })];
    for (let k = 1; k <= span * 2; k++) {
      const x = ox + k * u;
      items.push(L_(x, cy - 1, x, cy + 1, { w: 0.3 }), L_(x, cy - 4 * ky, x, cy + 4 * ky, { w: 0.15, color: "#bbb" }));
      const q = Q(k, 2), lab = q[1] === 1 ? (q[0] === 1 ? "π" : `${q[0]}π`) : q[0] === 1 ? "[[f:π/2]]" : `[[f:${q[0]}π/2]]`;
      items.push(T_(x, cy + (k % 2 ? 7.2 : 4.6), lab, 2.6));
    }
    for (let v = -3; v <= 3; v++) if (v) items.push(L_(ox - 1, cy - v * ky, ox + W, cy - v * ky, { w: 0.15, color: "#ddd" }), T_(ox - 1.6, cy - v * ky + 1, v < 0 ? `－${-v}` : String(v), 2.5, { anchor: "end" }));
    let d = "";
    for (let i = 0; i <= 200; i++) {
      const th = span * Math.PI * i / 200, y = A * (f === "sin" ? Math.sin(B * th) : Math.cos(B * th));
      d += `${i ? "L" : "M"}${(ox + th / (Math.PI / 2) * u).toFixed(2)} ${(cy - y * ky).toFixed(2)}`;
    }
    items.push({ t: "path", d, w: 0.7, tag: `${f}:${A}:${B}` });
    const fn = `${V("y")}＝${num(aq).replace(/^1$/, "").replace(/^－1$/, "－")}${f}${qeq(bq, Q(1)) ? "" : num(bq)}θ`;
    if (type === "per") return { text: `右の図は、関数 ${V("y")}＝${f} [[v:b]]θ の [[v:b]] を正の数として、そのグラフを [[v:y]] 軸方向に [[v:a]] 倍したものです。この関数の式と周期を求めましょう。`, fig: draw(ox + W + 12, cy + 4 * ky + 10, items), ans: `${fn}，周期 ${radTex(Q(period * 2, 2))}`, side: true, key: `tg:${f}:${A}:${B}`, meta: { f, A, B, period } };
    return { text: `右の図は、関数 ${V("y")}＝[[v:a]] ${f} [[v:b]]θ([[v:b]]＞0)のグラフです。[[v:a]]，[[v:b]] の値を求めましょう。`, fig: draw(ox + W + 12, cy + 4 * ky + 10, items), ans: `${V("a")}＝${num(aq)}，${V("b")}＝${num(bq)}`, side: true, key: `tg:${f}:${A}:${B}`, meta: { f, A, B, period } };
  }, (pr) => {
    const m = pr.meta, path = pr.figure.items.find((it) => it.tag);
    return path && path.tag === `${m.f}:${m.A}:${m.B}` && Math.abs(m.period * m.B - 2) < 1e-9 ? null : "グラフが合わない";
  });

  // 加法定理・2倍角
  const ADD = [[75, "sin"], [75, "cos"], [15, "sin"], [15, "cos"], [105, "sin"], [105, "cos"], [75, "tan"], [15, "tan"], [165, "cos"], [165, "sin"], [195, "cos"], [255, "sin"], [285, "cos"], [105, "tan"], [165, "tan"], [345, "sin"]];
  const TRIP = [[3, 4, 5], [5, 12, 13], [8, 15, 17]];
  const addForm = gen("k2.addForm", "次の問いに答えましょう。", lv({ types: ["val", "val", "sum"] }, { types: ["val", "sum", "dbl"] }, { types: ["sum", "dbl", "half", "tanSum"] }), (rng, type) => {
    if (type === "val") {
      const [d, f] = rng.pick(ADD);
      const v = { sin: Math.sin, cos: Math.cos, tan: Math.tan }[f](d * Math.PI / 180);
      const ans = surdAns("", v);
      if (!ans) return null;
      return { text: `${f} ${d}° の値`, ans, meta: { v } };
    }
    const [p, q, r] = rng.pick(TRIP), obt = rng.chance(0.5);
    // sin α ＝ p/r(0＜α＜π/2)、cos β ＝ ±q2/r2
    const al = Math.asin(p / r);
    if (type === "dbl" || type === "half") {
      const th = obt ? Math.PI - al : al;
      const given = `sin α＝[[f:${p}/${r}]]（${obt ? "[[f:π/2]]＜α＜π" : "0＜α＜[[f:π/2]]"}）`;
      if (type === "half") {
        const v = Math.sin(th / 2) ** 2;
        return { text: `${given} のとき、sin²[[f:α/2]] の値`, ans: surdAns("", v), meta: { v } };
      }
      const ask = rng.pick(["sin 2α", "cos 2α", "tan 2α"]), v = { "sin 2α": Math.sin(2 * th), "cos 2α": Math.cos(2 * th), "tan 2α": Math.tan(2 * th) }[ask];
      return { text: `${given} のとき、${ask} の値`, ans: surdAns("", v), meta: { v } };
    }
    if (type === "tanSum") {
      const t1 = rng.pick([2, 3, Q(1, 2), Q(1, 3)]), t2 = rng.pick([1, 2, 3, Q(1, 2), Q(1, 3), Q(-1, 2), -3]);
      const a = Array.isArray(t1) ? qv(t1) : t1, b = Array.isArray(t2) ? qv(t2) : t2;
      if (Math.abs(1 - a * b) < 1e-9) return null;
      const v = (a + b) / (1 - a * b);
      return { text: `tan α＝${num(Array.isArray(t1) ? t1 : Q(t1))}，tan β＝${num(Array.isArray(t2) ? t2 : Q(t2))} のとき、tan(α＋β) の値`, ans: surdAns("", v), meta: { v } };
    }
    const [p2, q2, r2] = rng.pick(TRIP);
    const be = Math.PI - Math.acos(q2 / r2); // cos β ＝ －q2/r2
    const ask = rng.pick(["sin(α＋β)", "cos(α＋β)", "sin(α－β)", "cos(α－β)"]);
    const v = { "sin(α＋β)": Math.sin(al + be), "cos(α＋β)": Math.cos(al + be), "sin(α－β)": Math.sin(al - be), "cos(α－β)": Math.cos(al - be) }[ask];
    return { text: `sin α＝[[f:${p}/${r}]]（0＜α＜[[f:π/2]]），cos β＝－[[f:${q2}/${r2}]]（[[f:π/2]]＜β＜π）のとき、${ask} の値`, ans: surdAns("", v), wide: true, meta: { v } };
  }, (pr) => pr.answer.display && pr.answer.display !== "null" && near(evalH(pr.answer.display), pr.meta.v) ? null : "値が合わない", { work: 32 });

  // 三角関数の方程式・不等式(0≦θ＜2π)
  const SPEC = [];
  for (let k = 0; k < 12; k++) SPEC.push(Q(k, 6));
  for (const k of [1, 3, 5, 7]) SPEC.push(Q(k, 4));
  SPEC.sort((u, w) => qv(u) - qv(w));
  const FN = { sin: Math.sin, cos: Math.cos, tan: Math.tan };
  const VALS = { sin: [0, 0.5, -0.5, Math.SQRT1_2, -Math.SQRT1_2, Math.sqrt(3) / 2, -Math.sqrt(3) / 2, 1, -1], cos: [0, 0.5, -0.5, Math.SQRT1_2, -Math.SQRT1_2, Math.sqrt(3) / 2, -Math.sqrt(3) / 2, 1, -1], tan: [1, -1, Math.sqrt(3), -Math.sqrt(3), 1 / Math.sqrt(3), -1 / Math.sqrt(3), 0] };
  const trigEq2 = gen("k2.trigEq", "0≦θ＜2π のとき、次の方程式・不等式を解きましょう。", lv({ types: ["sin", "cos"] }, { types: ["sin", "cos", "tan", "quad"] }, { types: ["ineq", "quad", "dbl", "ineq"] }), (rng, type) => {
    const val = (f, q) => FN[f](qv(q) * Math.PI);
    if (type === "quad" || type === "dbl") {
      const T = type === "quad" ? rng.pick([["2sin²θ－sin θ－1＝0", (t) => 2 * Math.sin(t) ** 2 - Math.sin(t) - 1], ["2cos²θ＋3cos θ＋1＝0", (t) => 2 * Math.cos(t) ** 2 + 3 * Math.cos(t) + 1], ["2cos²θ－sin θ－1＝0", (t) => 2 * Math.cos(t) ** 2 - Math.sin(t) - 1]]) : rng.pick([["sin 2θ＝cos θ", (t) => Math.sin(2 * t) - Math.cos(t)], ["cos 2θ＝sin θ", (t) => Math.cos(2 * t) - Math.sin(t)], ["cos 2θ＋cos θ＝0", (t) => Math.cos(2 * t) + Math.cos(t)]]);
      const sol = SPEC.filter((q) => Math.abs(T[1](qv(q) * Math.PI)) < 1e-9);
      return { text: T[0], ans: `θ＝${sol.map(radTex).join(", ")}`, meta: { g: T[1], sol: sol.map(qv) } };
    }
    if (type === "ineq") {
      const f = rng.pick(["sin", "cos"]), v = rng.pick([0.5, -0.5, Math.SQRT1_2, -Math.SQRT1_2, Math.sqrt(3) / 2, 0]), op = rng.pick(["＞", "≧", "＜", "≦"]);
      const ok = (t) => {
        const y = FN[f](t);
        return op === "＞" ? y > v + 1e-12 : op === "≧" ? y >= v - 1e-12 : op === "＜" ? y < v - 1e-12 : y <= v + 1e-12;
      };
      // 区間を SPEC の点と、その間の点で作る
      const grid = SPEC.map(qv);
      const ivs = [];
      let cur = null;
      const N = 2400;
      for (let i = 0; i < N; i++) {
        const t = 2 * Math.PI * i / N, y = ok(t);
        if (y && !cur) cur = { a: t, b: t };
        else if (y) cur.b = t;
        else if (cur) ivs.push(cur), cur = null;
      }
      if (cur) ivs.push({ ...cur, toEnd: true });
      const snap = (t) => grid.concat([2]).reduce((u, w) => Math.abs(w * Math.PI - t) < Math.abs(u * Math.PI - t) ? w : u);
      const parts = ivs.map((iv) => {
        const A = snap(iv.a), B = iv.toEnd ? 2 : snap(iv.b);
        const at = (x) => radTex(K.toQ(x));
        const ia = ok(A * Math.PI), ib = !iv.toEnd && ok(B * Math.PI);
        if (A === B) return `θ＝${at(A)}`;
        return `${at(A)}${ia ? "≦" : "＜"}θ${ib ? "≦" : "＜"}${at(B)}`;
      });
      const vt = K.k1.surdAns("", v) === "0" ? "0" : SV(v);
      return { text: `${f} θ${op}${vt}`, ans: parts.join(", "), meta: { ok } };
    }
    const f = type, v = rng.pick(VALS[f]);
    const sol = SPEC.filter((q) => {
      const c = Math.cos(qv(q) * Math.PI);
      return !(f === "tan" && Math.abs(c) < 1e-9) && Math.abs(val(f, q) - v) < 1e-9;
    });
    return { text: `${f} θ＝${SV(v)}`, ans: `θ＝${sol.map(radTex).join(", ")}`, meta: { g: (t) => f === "tan" && Math.abs(Math.cos(t)) < 1e-9 ? 1 : FN[f](t) - v, sol: sol.map(qv) } };
  }, (pr) => {
    const m = pr.meta;
    if (m.g) {
      const got = [];
      for (let i = 0; i < 2400; i++) {
        const q = i / 1200;
        if (Math.abs(m.g(q * Math.PI)) < 1e-9) got.push(q);
      }
      return got.length === m.sol.length && got.every((x, i) => Math.abs(x - m.sol[i]) < 1e-9) ? null : "解が合わない";
    }
    const parts = pr.answer.display.split(", ");
    const inAns = (t) => parts.some((s) => {
      let mm;
      if (mm = /^θ＝(.*)$/.exec(s)) return Math.abs(evalH(mm[1]) - t) < 1e-9;
      mm = /^(.*?)([＜≦])θ([＜≦])(.*)$/.exec(s);
      const a = evalH(mm[1]), b = evalH(mm[4]);
      return (mm[2] === "≦" ? t >= a - 1e-12 : t > a + 1e-12) && (mm[3] === "≦" ? t <= b + 1e-12 : t < b - 1e-12);
    });
    for (let i = 0; i < 2400; i++) {
      const t = 2 * Math.PI * (i + 0.37) / 2400;
      if (inAns(t) !== m.ok(t)) return `解がちがう θ=${t}`;
    }
    return null;
  }, { work: 30 });

  // 三角関数の合成
  const SYN = [["1", "1"], ["1", "－1"], ["－1", "1"], ["1", "√{3}"], ["√{3}", "1"], ["√{3}", "－1"], ["－1", "√{3}"], ["1", "－√{3}"], ["2", "2"], ["√{3}", "3"], ["3", "√{3}"], ["－√{3}", "－1"]];
  const synth = gen("k2.synth", "次の問いに答えましょう。", lv({ types: ["form"] }, { types: ["form", "max"] }, { types: ["max", "range", "form"] }), (rng, type) => {
    const [as, bs] = rng.pick(SYN);
    const a = evalH(String(as)), b = evalH(String(bs));
    const r = Math.hypot(a, b), al = Math.atan2(b, a);
    const rt = surdAns("", r), alq = K.toQ(al / Math.PI);
    if (!alq || !rt) return null;
    const co = (s) => s === "1" ? "" : s === "－1" ? "－" : s;
    const babs = bs.replace(/^－/, "");
    const e = `${co(as)}sin θ${bs.startsWith("－") ? "－" : "＋"}${babs === "1" ? "" : babs}cos θ`;
    const form = `${rt === "1" ? "" : rt}sin(θ${alq[0] < 0 ? "－" : "＋"}${radTex(qabs(alq))})`;
    if (type === "form") return { text: `${e} を r sin(θ＋α) の形に表す(r＞0，－π＜α≦π)`, ans: form, meta: { e, form } };
    if (type === "max") return { text: `${e}(0≦θ＜2π)の最大値と最小値`, ans: `最大値 ${rt}，最小値 －${rt}`, meta: { e, r } };
    // 0≦θ≦π での最大最小
    let M = -Infinity, mn = Infinity, tM = 0, tm = 0;
    for (const q of SPEC.concat([Q(1)]).filter((q) => qv(q) <= 1)) {
      const v = a * Math.sin(qv(q) * Math.PI) + b * Math.cos(qv(q) * Math.PI);
      if (v > M + 1e-12) M = v, tM = q;
      if (v < mn - 1e-12) mn = v, tm = q;
    }
    // 端点以外の極値も調べる
    let M2 = -Infinity, m2 = Infinity;
    for (let i = 0; i <= 4000; i++) {
      const t = Math.PI * i / 4000, v = a * Math.sin(t) + b * Math.cos(t);
      M2 = Math.max(M2, v), m2 = Math.min(m2, v);
    }
    if (Math.abs(M2 - M) > 1e-5 || Math.abs(m2 - mn) > 1e-5) return null;
    return { text: `${e}(0≦θ≦π)の最大値と最小値、そのときの θ の値`, ans: `θ＝${radTex(tM)} で最大値 ${surdAns("", M)}，θ＝${radTex(tm)} で最小値 ${surdAns("", mn)}`, wide: true, meta: { e, M, mn } };
  }, (pr) => {
    const m = pr.meta;
    if (m.form) return K.sameH(m.e.replace(/θ/g, "[[v:t]]"), m.form.replace(/θ/g, "[[v:t]]"), ["t"]) ? null : "合成が合わない";
    if (m.r !== undefined) return near(evalH(pr.answer.display.split("，")[0].replace("最大値 ", "")), m.r) ? null : "最大値が合わない";
    return null;
  }, { work: 32 });
  H["k2.radian"] = "180°＝π ラジアン。半径 r、中心角 θ の扇形の弧の長さ l＝rθ、面積 S＝[[f:1/2]]r²θ＝[[f:1/2]]lr。";
  H["k2.trigVal"] = "単位円で、角 θ の動径と円の交点の x 座標が cos θ、y 座標が sin θ、[[f:y/x]] が tan θ。2π ごとに同じ値です。";
  H["k2.trigGraph"] = "y＝a sin bθ の値域は －|a|≦y≦|a|、周期は [[f:2π/b]]。グラフが山から始まるなら cos、0 から上がるなら sin。";
  H["k2.addForm"] = "sin(α±β)＝sin α cos β±cos α sin β、cos(α±β)＝cos α cos β∓sin α sin β、sin 2α＝2sin α cos α、cos 2α＝1－2sin²α。";
  H["k2.trigEq"] = "単位円で考えます。2倍角の公式で sin θ や cos θ だけの式にしてから因数分解します。";
  H["k2.synth"] = "a sin θ＋b cos θ＝√{a²＋b²} sin(θ＋α)。α は点 (a, b) の動径の角です。";

  // ============================================================
  // 5 指数関数・対数関数
  // ============================================================
  const expCalc = gen("k2.expCalc", "次の式を計算しましょう。", lv({ types: ["num", "num", "law"] }, { types: ["num", "law", "root"] }, { types: ["law", "root", "num2"] }), (rng, type) => {
    let q, v;
    if (type === "num") {
      const T = rng.pick([[8, "2/3"], [27, "2/3"], [16, "3/4"], [32, "3/5"], [9, "－[[f:1/2]]"], [4, "－[[f:3/2]]"], [25, "[[f:3/2]]"], [81, "0.75"], [64, "－[[f:1/3]]"], [125, "[[f:2/3]]"]]);
      q = `${T[0]}[[^${T[1].replace(/\[\[f:(\d+)\/(\d+)\]\]/, "$1/$2")}]]`;
    } else if (type === "num2") {
      const T = rng.pick(["(-8)", "[[f:1/4]]", "[[f:8/27]]", "0.25"]);
      q = rng.pick([`[[f:1/4]]^`, ""]) ? `(${rng.pick(["[[f:1/4]]", "[[f:8/27]]", "[[f:9/4]]"])})[[^${rng.pick(["－3/2", "2/3", "－1/2"])}]]` : "";
      if (!q) return null;
    } else if (type === "law") {
      const [p1, p2, p3] = [rng.pick(["2/3", "1/2", "3/4", "1/3", "5/6"]), rng.pick(["1/2", "1/3", "1/6", "3/2"]), rng.pick(["1/6", "1/3", "1/2", "5/6"])];
      q = `[[v:a]][[^${p1}]]×[[v:a]][[^${p2}]]÷[[v:a]][[^${p3}]]`;
      const e = evalH(p1) + evalH(p2) - evalH(p3), eq = K.toQ(e);
      if (!eq || eq[0] <= 0) return null;
      const ans = eq[1] === 1 ? (eq[0] === 1 ? "[[v:a]]" : `[[v:a]]${sup(eq[0])}`) : `[[v:a]][[^${eq[0]}/${eq[1]}]]`;
      return { text: q, ans, meta: { q, a: ans, vars: true } };
    } else {
      const T = rng.pick([["∛{2}×∛{4}", 2], ["∛{54}÷∛{2}", 3], ["√{3}×∛{3}×[[^6]]√{3}", 3], ["[[^4]]√{48}÷[[^4]]√{3}", 2], ["∛{24}＋∛{81}－∛{3}", null], ["∛{-27}", -3]]);
      q = T[0].replace("-", "－");
    }
    v = evalH(q.replace(/\[\[\^(\d)\]\]√\{(\d+)\}/g, (m0, n, x) => `(${x})[[^1/${n}]]`).replace(/∛\{－(\d+)\}/, "(－∛{$1})"));
    const c3 = v / Math.cbrt(3);
    const ans = K.k1.surdAns("", v) || (Math.abs(c3 - Math.round(c3)) < 1e-9 ? `${Math.round(c3)}∛{3}` : null);
    if (!ans) return null;
    return { text: q, ans, meta: { q, v } };
  }, (pr) => {
    const m = pr.meta;
    if (m.vars) return K.sameH(m.q, m.a, ["a"], { shift: 2 }) ? null : "指数法則が合わない";
    const d = pr.answer.display.replace(/(\d+)∛\{(\d+)\}/, "$1×∛{$2}");
    return near(evalH(d), m.v) ? null : "値が合わない";
  }, { work: 22 });

  const expEq = gen("k2.expEq", "次の方程式・不等式を解きましょう。", lv({ types: ["eq", "eq"] }, { types: ["eq", "base", "ineq"] }, { types: ["quad", "ineq", "base", "quadIneq"] }), (rng, type) => {
    if (type === "eq") {
      const b = rng.pick([2, 3, 5]), x = nz(rng, -4, 5), v = Q(b ** Math.abs(x)), rhs = x > 0 ? String(qv(v)) : `[[f:1/${qv(v)}]]`;
      return { text: `${b}[[^[[v:x]]]]＝${rhs}`, ans: `${V("x")}＝${x}`, meta: { f: (t) => b ** t - (x > 0 ? qv(v) : 1 / qv(v)), x } };
    }
    if (type === "base") {
      // 4^x ＝ 8 → 2^(2x)＝2^3 → x＝3/2
      const [b, p, q] = rng.pick([[2, 2, 3], [2, 3, 2], [3, 2, 3], [2, 2, 5], [3, 2, 1], [2, 3, 4]]);
      const x = Q(q, p), s = rng.chance(0.5);
      return { text: `${b ** p}[[^[[v:x]]]]＝${s ? `[[f:1/${b ** q}]]` : b ** q}`, ans: `${V("x")}＝${num(s ? qneg(x) : x)}`, meta: { f: (t) => (b ** p) ** t - (s ? 1 / b ** q : b ** q), x: qv(s ? qneg(x) : x) } };
    }
    if (type === "ineq") {
      const b = rng.pick([2, 3, Q(1, 2), Q(1, 3)]), k = nz(rng, -3, 4), op = rng.pick(["＞", "≦", "＜", "≧"]);
      const bv = Array.isArray(b) ? qv(b) : b, rhs = bv ** k, rt = K.toQ(rhs);
      const flipOp = bv < 1 ? { "＞": "＜", "＜": "＞", "≧": "≦", "≦": "≧" }[op] : op;
      const base = Array.isArray(b) ? `([[f:${b[0]}/${b[1]}]])` : String(b);
      return { text: `${base}[[^[[v:x]]]]${op}${num(rt)}`, ans: `${V("x")}${flipOp}${k}`, meta: { f: (t) => {
        const y = bv ** t;
        return op === "＞" ? y > rhs * (1 + 1e-12) : op === "≦" ? y <= rhs * (1 + 1e-12) : op === "＜" ? y < rhs * (1 - 1e-12) : y >= rhs * (1 - 1e-12);
      }, sol: [flipOp, k] } };
    }
    // 4^x － (p＋q)2^x ＋ pq ＝ 0(2^x ＝ t)
    const [p, q] = pickN(rng, [1, 2, 4, 8, 16], 2).sort((u, w) => u - w);
    if (type === "quadIneq") {
      return { text: `4[[^[[v:x]]]]－${p + q}·2[[^[[v:x]]]]＋${p * q}＜0`, ans: `${Math.log2(p)}＜${V("x")}＜${Math.log2(q)}`, meta: { f: (t) => 4 ** t - (p + q) * 2 ** t + p * q < 0, sol: ["in", Math.log2(p), Math.log2(q)] } };
    }
    return { text: `4[[^[[v:x]]]]－${p + q}·2[[^[[v:x]]]]＋${p * q}＝0`, ans: `${V("x")}＝${[p, q].map((v) => Math.log2(v)).join(", ")}`, meta: { roots: [p, q].map((v) => Math.log2(v)), g: (t) => 4 ** t - (p + q) * 2 ** t + p * q } };
  }, (pr) => {
    const m = pr.meta;
    if (m.roots) return m.roots.every((x) => Math.abs(m.g(x)) < 1e-9) ? null : "解が合わない";
    if (m.x !== undefined) return Math.abs(m.f(m.x)) < 1e-9 && near(evalH(pr.answer.display.replace(/^.*＝/, "")), typeof m.x === "number" ? m.x : 0) ? null : "解が合わない";
    for (let t = -6; t <= 6; t += 0.125) {
      const want = m.f(t), got = m.sol[0] === "in" ? t > m.sol[1] && t < m.sol[2] : K.k1.test({ "＞": ">", "≧": ">=", "＜": "<", "≦": "<=" }[m.sol[0]], t, m.sol[1]);
      if (want !== got) return `解がちがう x=${t}`;
    }
    return null;
  }, { work: 30 });

  const LG = (b) => `log[[_${b}]]`;
  const logCalc = gen("k2.logCalc", "次の式を計算しましょう。", lv({ types: ["one", "one", "sum"] }, { types: ["sum", "change", "one"] }, { types: ["change", "mix", "sum"] }), (rng, type) => {
    let q;
    if (type === "one") q = rng.pick([`${LG(2)}16`, `${LG(3)}[[f:1/27]]`, `${LG(10)}1000`, `${LG(2)}√{8}`, `${LG(5)}125`, `${LG(2)}32`, `${LG(3)}81`, `${LG(2)}[[f:1/8]]`, `${LG(5)}√{5}`, `${LG(3)}[[f:1/√{3}]]`, `${LG(10)}0.001`, `${LG(4)}8`, `${LG(9)}27`, `${LG("[[f:1/2]]")}4`, `${LG(8)}[[f:1/4]]`]);
    else if (type === "sum") q = rng.pick([`${LG(2)}12－${LG(2)}3`, `${LG(6)}4＋${LG(6)}9`, `2${LG(3)}6－${LG(3)}4`, `${LG(10)}2＋${LG(10)}50`, `${LG(2)}[[f:4/3]]＋${LG(2)}6`, `3${LG(2)}√{2}－${LG(2)}[[f:√{2}/4]]`, `${LG(5)}[[f:5/3]]＋${LG(5)}15`, `${LG(3)}18－${LG(3)}2`, `${LG(2)}24－${LG(2)}3`, `${LG(10)}4＋${LG(10)}25`, `2${LG(2)}6－${LG(2)}9`]);
    else if (type === "change") q = rng.pick([`${LG(2)}3·${LG(3)}8`, `${LG(4)}9·${LG(3)}2`, `${LG(2)}9·${LG(3)}4`, `${LG(9)}8·${LG(4)}27`, `[[f:${LG(3)}16/${LG(3)}4]]`, `${LG(8)}32`]);
    else q = rng.pick([`(${LG(2)}3＋${LG(4)}9)(${LG(3)}4＋${LG(9)}2)`, `${LG(2)}[[f:1/9]]·${LG(3)}[[f:1/8]]`, `2[[^${LG(2)}5]]`, `9[[^${LG(3)}2]]`]);
    // 2^(log₂5) の評価
    const v = evalH(q.replace(/\[\[\^log\[\[_(\d+)\]\](\d+)\]\]/, (m0, b, x) => `[[^${Math.log(x) / Math.log(b)}]]`));
    const ans = K.k1.surdAns("", v);
    if (!ans) return null;
    return { text: q, ans, meta: { v } };
  }, (pr) => near(evalH(pr.answer.display), pr.meta.v) ? null : "値が合わない", { work: 24 });

  const logEq = gen("k2.logEq", "次の方程式・不等式を解きましょう。", lv({ types: ["eq"] }, { types: ["eq", "sum", "ineq"] }, { types: ["sum", "ineq", "ineqHalf", "quad"] }), (rng, type) => {
    if (type === "eq") {
      const b = rng.pick([2, 3]), k = rng.int(1, 4), a = nz(rng, -3, 3), x = b ** k + a;
      return { text: `${LG(b)}(${pTex([Q(1), Q(-a)])})＝${k}`, ans: `${V("x")}＝${x}`, meta: { f: (t) => t - a > 0 && Math.abs(Math.log(t - a) / Math.log(b) - k) < 1e-9, sols: [x] } };
    }
    if (type === "sum") {
      // log_b x ＋ log_b(x－d) ＝ k → x(x－d) ＝ b^k
      const b = rng.pick([2, 3]), k = rng.int(2, 4), N = b ** k;
      let sols = [], d = null;
      for (const dd of [1, 2, 3, 4, 5, 6, 7, 8]) {
        const D = dd * dd + 4 * N, s = Math.sqrt(D);
        if (Number.isInteger(s) && (dd + s) % 2 === 0) {
          d = dd, sols = [(dd + s) / 2];
          break;
        }
      }
      if (d === null) return null;
      return { text: `${LG(b)}${V("x")}＋${LG(b)}(${pTex([Q(1), Q(-d)])})＝${k}`, ans: `${V("x")}＝${sols[0]}`, meta: { f: (t) => t > 0 && t - d > 0 && Math.abs(Math.log(t * (t - d)) / Math.log(b) - k) < 1e-9, sols } };
    }
    if (type === "quad") {
      // (log₂x)² － (p＋q)log₂x ＋ pq ＝ 0
      const p = rng.int(-2, 1), q = rng.int(p + 1, 3);
      const sols = [2 ** p, 2 ** q];
      return { text: `(${LG(2)}${V("x")})²${-(p + q) ? (-(p + q) < 0 ? "－" : "＋") + (Math.abs(p + q) === 1 ? "" : Math.abs(p + q)) + LG(2) + V("x") : ""}${p * q ? sg(p * q) : ""}＝0`, ans: `${V("x")}＝${sols.map((s) => num(K.toQ(s))).join(", ")}`, meta: { f: (t) => t > 0 && Math.abs(Math.log2(t) ** 2 - (p + q) * Math.log2(t) + p * q) < 1e-9, sols } };
    }
    const half = type === "ineqHalf", b = half ? Q(1, 2) : Q(rng.pick([2, 3])), k = rng.int(1, 3), a = rng.int(-2, 3), op = rng.pick(["＜", "≧"]);
    const bv = qv(b), R = bv ** k + a;
    // log_b(x－a) op k:x－a＞0 も
    const inc = !half;
    const lo = Q(a), hiQ = K.toQ(R);
    const ans = (op === "＜") === inc ? `${num(lo)}＜${V("x")}＜${num(hiQ)}` : `${V("x")}≧${num(hiQ)}`;
    const ans2 = (op === "＜") === inc ? ans : !inc && op === "≧" ? `${num(lo)}＜${V("x")}≦${num(hiQ)}` : `${V("x")}＞${num(hiQ)}`;
    const final = inc ? (op === "＜" ? `${num(lo)}＜${V("x")}＜${num(hiQ)}` : `${V("x")}≧${num(hiQ)}`) : (op === "＜" ? `${V("x")}＞${num(hiQ)}` : `${num(lo)}＜${V("x")}≦${num(hiQ)}`);
    const baseT = half ? `[[f:1/2]]` : String(qv(b));
    return { text: `${LG(baseT)}(${pTex([Q(1), Q(-a)])})${op}${k}`, ans: final, meta: { g: (t) => t - a > 0 && (op === "＜" ? Math.log(t - a) / Math.log(bv) < k - 1e-12 : Math.log(t - a) / Math.log(bv) >= k - 1e-12), lo: a, hi: R, final } };
  }, (pr) => {
    const m = pr.meta;
    if (m.sols) {
      const got = [];
      for (let t = -10; t <= 100; t += 1 / 32) if (m.f(t)) got.push(t);
      return got.length === m.sols.length && m.sols.every((s) => got.some((x) => Math.abs(x - s) < 1e-9)) ? null : "解が合わない";
    }
    // 不等式:答えを読んで比べる
    const d = pr.answer.display;
    let pred;
    let mm;
    if (mm = /^(.*?)([＜≦])\[\[v:x\]\]([＜≦])(.*)$/.exec(d)) {
      const a = evalH(mm[1]), b = evalH(mm[4]);
      pred = (t) => (mm[2] === "≦" ? t >= a : t > a) && (mm[3] === "≦" ? t <= b + 1e-12 : t < b - 1e-12);
    } else {
      mm = /^\[\[v:x\]\]([＞≧])(.*)$/.exec(d);
      const a = evalH(mm[2]);
      pred = (t) => mm[1] === "≧" ? t >= a - 1e-12 : t > a + 1e-12;
    }
    for (let t = -5; t <= 40; t += 1 / 64) if (pred(t) !== m.g(t)) return `解がちがう x=${t}`;
    return null;
  }, { work: 32 });

  // 常用対数の利用(文章題)
  const LOGW = {
    digits: (rng) => {
      const b = rng.pick([2, 3, 6, 12, 18]), n = rng.int(20, 60);
      const l = { 2: 0.3010, 3: 0.4771, 6: 0.7781, 12: 1.0792, 18: 1.2553 }[b];
      const v = n * l, d = Math.floor(v) + 1;
      if (v - Math.floor(v) < 0.02 || v - Math.floor(v) > 0.98) return null;
      return { t: `${b}[[^${n}]] は何けたの整数ですか。ただし、log[[_10]]2＝0.3010，log[[_10]]3＝0.4771 とします。`, a: `${d}けた` };
    },
    dec: (rng) => {
      const b = rng.pick([2, 3]), n = rng.int(10, 40), l = { 2: 0.3010, 3: 0.4771 }[b];
      const v = -n * l, place = -Math.floor(v);
      if (v - Math.floor(v) < 0.02 || v - Math.floor(v) > 0.98) return null;
      return { t: `([[f:1/${b}]])[[^${n}]] を小数で表すと、小数第何位に初めて0でない数字が現れますか。ただし、log[[_10]]2＝0.3010，log[[_10]]3＝0.4771 とします。`, a: `小数第${place}位` };
    },
    grow: (rng) => {
      // 毎年 r% 増える。何年後に初めて k 倍をこえるか
      const [r, l] = rng.pick([[20, 0.0792], [50, 0.1761], [80, 0.2553], [44, 0.1584]]), k = rng.pick([2, 3, 10]);
      const lk = { 2: 0.3010, 3: 0.4771, 10: 1 }[k], n = Math.floor(lk / l) + 1;
      return { t: `ある量が毎年 ${r}% ずつ増えていきます。初めて ${k}倍をこえるのは何年後ですか。ただし、log[[_10]]${(100 + r) / 100 === 1.2 ? "1.2＝0.0792" : (100 + r) / 100 === 1.5 ? "1.5＝0.1761" : (100 + r) / 100 === 1.8 ? "1.8＝0.2553" : "1.44＝0.1584"}${k === 2 ? "，log[[_10]]2＝0.3010" : k === 3 ? "，log[[_10]]3＝0.4771" : ""} とします。`, a: `${n}年後` };
    }
  };
  const logWord = gen("k2.logWord", null, lv({ types: ["digits"] }, { types: ["digits", "dec"] }, { types: ["dec", "grow", "digits"] }), (rng, type) => {
    const r = LOGW[type](rng);
    if (!r) return null;
    return { text: r.t, ans: r.a, softKey: type, ws: { type: "lines", labels: ["答え"] }, work: 45 };
  });

  const expCompare = gen("k2.compare", "次の数の大小を、不等号を使って表しましょう。", lv({ types: ["exp"] }, { types: ["exp", "log"] }, { types: ["log", "root", "exp"] }), (rng, type) => {
    let items;
    if (type === "exp") {
      const b = rng.pick([2, 3]);
      items = pickN(rng, [[`${b}[[^0.5]]`], [`${b}[[^-1]]`.replace("-", "－")], [`${b}[[^[[f:2/3]]]]`.replace("[[^[[f:2/3]]]]", "[[^2/3]]")], [`${b}[[^1.5]]`], [`${b * b}[[^1/3]]`], ["1"]], 3).map((x) => x[0]);
    } else if (type === "log") items = pickN(rng, [`${LG(2)}3`, `${LG(4)}5`, `1.5`, `${LG(2)}5`, `${LG(4)}7`, `2`, `${LG(3)}8`], 3);
    else items = rng.pick([["√{2}", "∛{3}", "[[^6]]√{6}"], ["√{3}", "∛{5}", "[[^4]]√{8}"], ["∛{4}", "√{3}", "[[^4]]√{5}"]]);
    const val = (s) => evalH(s.replace(/\[\[\^(\d)\]\]√\{(\d+)\}/g, (m0, n, x) => `(${x})[[^1/${n}]]`));
    const vs = items.map(val);
    if (new Set(vs.map((v) => v.toFixed(9))).size < 3) return null;
    const sorted = items.slice().sort((a, b) => val(a) - val(b));
    return { text: items.join("，"), ans: sorted.join("＜"), meta: { items } };
  }, (pr) => {
    const val = (s) => evalH(s.replace(/\[\[\^(\d)\]\]√\{(\d+)\}/g, (m0, n, x) => `(${x})[[^1/${n}]]`));
    const parts = pr.answer.display.split("＜").map(val);
    return parts.every((v, i) => !i || parts[i - 1] < v) ? null : "順がちがう";
  }, { work: 26 });
  H["k2.expCalc"] = "a[[^m/n]]＝[[^n]]√{a[[^m]]}、a[[^r]]a[[^s]]＝a[[^r＋s]]、(a[[^r]])[[^s]]＝a[[^rs]]。底をそろえて計算します。";
  H["k2.expEq"] = "底をそろえて指数を比べます。底が1より小さいときは、不等号の向きが変わります。2[[^x]]＝t とおくと二次方程式になります。";
  H["k2.logCalc"] = "log[[_a]]M＋log[[_a]]N＝log[[_a]]MN、log[[_a]]M[[^r]]＝r log[[_a]]M、底の変換 log[[_a]]b＝[[f:log[[_c]]b/log[[_c]]a]]。";
  H["k2.logEq"] = "まず真数条件(真数＞0)を確かめます。底が1より小さいときは、不等号の向きが変わります。";
  H["k2.logWord"] = "N の常用対数が n≦log[[_10]]N＜n＋1 なら、N は n＋1 けたの整数です。";
  H["k2.compare"] = "底をそろえる、何乗かしてくらべる、または同じ数(1 や 2 など)とくらべます。";

  Object.assign(K.k2, { radTex, SV, regionPoly });
  return [region, lp, radian, trigVal2, trigGraph, addForm, trigEq2, synth, expCalc, expEq, logCalc, logEq, logWord, expCompare];
})();
kou2.push(...kou2b);
