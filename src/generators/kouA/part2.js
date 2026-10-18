  // ============================================================
  // 3 図形の性質 ・ 4 数学と人間の活動(整数)
  // ============================================================
var kouAb = (() => {
  const K = kouLib;
  const { Q, qv, num, gcd, lcm, lv, nz, X, V, evalH, near, gen, redo, pickN, draw, T_, L_, angMark, rightMark, vLabel, sideLabel, centroid, fitDraw, ticks } = K;
  const H = K.kA.H;
  const D2R = Math.PI / 180;
  const deg = (v) => `${v}°`;
  const P2 = (x, y) => [x, y];
  // 3辺から三角形(画面の座標:B 左下、C 右下、A 上)
  const triSides = (a, b, c) => {
    const x = (c * c + a * a - b * b) / (2 * a), y = Math.sqrt(Math.max(0, c * c - x * x));
    return { A: [x, -y], B: [0, 0], C: [a, 0] };
  };
  // 2つの角から三角形
  const triAngles = (Bd, Cd, base = 50) => {
    const tB = Math.tan(Bd * D2R), tC = Math.tan(Cd * D2R), x = base * tC / (tB + tC);
    return { A: [x, -x * tB], B: [0, 0], C: [base, 0] };
  };
  const scaleTo = (pts, W, Hh) => {
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const k = Math.min(W / (Math.max(...xs) - Math.min(...xs)), Hh / (Math.max(...ys) - Math.min(...ys)));
    return pts.map(([x, y]) => [(x - Math.min(...xs)) * k, (y - Math.min(...ys)) * k]);
  };
  const seg = (P, Q2, o = {}) => L_(P[0], P[1], Q2[0], Q2[1], { w: 0.5, ...o });
  const lerp = (P, Q2, t) => [P[0] + (Q2[0] - P[0]) * t, P[1] + (Q2[1] - P[1]) * t];
  const dot = (P) => ({ t: "dot", x: P[0], y: P[1], r: 0.8 });
  const lab = (P, cen, s, d = 3.4) => vLabel(P, cen, s, d);
  const lineX = (P1, P2, P3, P4) => {
    const d = (P2[0] - P1[0]) * (P4[1] - P3[1]) - (P2[1] - P1[1]) * (P4[0] - P3[0]);
    const t = ((P3[0] - P1[0]) * (P4[1] - P3[1]) - (P3[1] - P1[1]) * (P4[0] - P3[0])) / d;
    return lerp(P1, P2, t);
  };
  const angleAt = (V0, P, Q2) => {
    const a1 = Math.atan2(P[1] - V0[1], P[0] - V0[0]), a2 = Math.atan2(Q2[1] - V0[1], Q2[0] - V0[0]);
    let d = Math.abs(a1 - a2) * 180 / Math.PI;
    return d > 180 ? 360 - d : d;
  };

  // ============================================================
  // 3 図形の性質
  // ============================================================
  // 外心・内心・重心
  const centers = gen("kA.centers", null, lv({ types: ["circ", "inc"] }, { types: ["circ", "inc", "circ2", "inc2"] }, { types: ["circ2", "inc2", "cent", "inc"] }), (rng, type) => {
    const Bd = rng.int(5, 15) * 5, Cd = rng.int(5, 15) * 5, Ad = 180 - Bd - Cd;
    if (Ad < 35 || Ad > 85 || Bd >= 90 || Cd >= 90) return null;
    const T = triAngles(Bd, Cd);
    const [A, B, C] = scaleTo([T.A, T.B, T.C], 52, 40).map(([x, y]) => [x + 8, y + 8]);
    const cen = centroid([A, B, C]);
    const items = [{ t: "poly", pts: [A, B, C], w: 0.5 }, lab(A, cen, "A"), lab(B, cen, "B"), lab(C, cen, "C")];
    let text, ans, want, got;
    if (type === "circ" || type === "circ2") {
      // 外心 O
      const d = 2 * (A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1]));
      const n2 = (P) => P[0] ** 2 + P[1] ** 2;
      const O = [(n2(A) * (B[1] - C[1]) + n2(B) * (C[1] - A[1]) + n2(C) * (A[1] - B[1])) / d, (n2(A) * (C[0] - B[0]) + n2(B) * (A[0] - C[0]) + n2(C) * (B[0] - A[0])) / d];
      items.push(seg(O, B, { w: 0.4 }), seg(O, C, { w: 0.4 }), dot(O), T_(O[0], O[1] - 2.2, "O", 3.4, { bold: true }));
      if (type === "circ") {
        items.push(...angMark(A, B, C, deg(Ad), { r: 5 }), ...angMark(O, B, C, "[[v:x]]", { r: 4 }));
        text = "点 O は △ABC の外心です。角 [[v:x]] の大きさを求めましょう。", want = 2 * Ad, got = angleAt(O, B, C);
      } else {
        items.push(seg(O, A, { w: 0.4 }), ...angMark(B, O, C, deg(90 - Ad), { r: 7 }), ...angMark(A, B, C, "[[v:x]]", { r: 5 }));
        text = "点 O は △ABC の外心です。角 [[v:x]] の大きさを求めましょう。", want = Ad, got = angleAt(A, B, C);
        if (Math.abs(angleAt(B, O, C) - (90 - Ad)) > 1e-6) return null;
      }
    } else if (type === "inc" || type === "inc2") {
      const a = Math.hypot(B[0] - C[0], B[1] - C[1]), b = Math.hypot(A[0] - C[0], A[1] - C[1]), c = Math.hypot(A[0] - B[0], A[1] - B[1]);
      const I = [(a * A[0] + b * B[0] + c * C[0]) / (a + b + c), (a * A[1] + b * B[1] + c * C[1]) / (a + b + c)];
      items.push(seg(I, B, { w: 0.4 }), seg(I, C, { w: 0.4 }), dot(I), T_(I[0], I[1] - 2.4, "I", 3.4, { bold: true }));
      if (type === "inc") {
        items.push(...angMark(A, B, C, deg(Ad), { r: 5 }), ...angMark(I, B, C, "[[v:x]]", { r: 4 }));
        want = 90 + Ad / 2, got = angleAt(I, B, C);
        text = "点 I は △ABC の内心です。角 [[v:x]] の大きさを求めましょう。";
      } else {
        items.push(...angMark(B, A, C, deg(Bd), { r: 6 }), ...angMark(C, A, B, deg(Cd), { r: 6 }), ...angMark(I, B, C, "[[v:x]]", { r: 4 }));
        want = 180 - (Bd + Cd) / 2, got = angleAt(I, B, C);
        text = "点 I は △ABC の内心です。角 [[v:x]] の大きさを求めましょう。";
      }
      if (!Number.isInteger(want)) return null;
    } else {
      // 重心 G と中線 AD
      const D = lerp(B, C, 0.5), G = lerp(A, D, 2 / 3), m = rng.pick([6, 9, 12, 15]), ask = rng.int(0, 1);
      items.push(seg(A, D, { w: 0.4 }), dot(D), dot(G), T_(D[0], D[1] + 4.2, "D", 3.4, { bold: true }), T_(G[0] + 2.6, G[1] - 1, "G", 3.4, { bold: true }), ...ticks(B, D, 1), ...ticks(D, C, 1));
      text = `点 G は △ABC の重心で、AD は中線です。AD＝${m} のとき、${ask ? "GD" : "AG"} の長さを求めましょう。`;
      return { text, fig: fitDraw(items, 4), ans: String(ask ? m / 3 : 2 * m / 3), side: true, key: `cn:g:${m}:${ask}:${Bd}:${Cd}`, meta: { want: ask ? m / 3 : 2 * m / 3, got: ask ? m / 3 : 2 * m / 3 } };
    }
    return { text, fig: fitDraw(items, 4), ans: deg(want), side: true, key: `cn:${type}:${Bd}:${Cd}`, meta: { want, got } };
  }, (pr) => Math.abs(pr.meta.want - pr.meta.got) < 1e-6 && pr.answer.display.replace("°", "") === String(pr.meta.want) ? null : "角が図と合わない", { work: 26 });

  // 角の二等分線と比・チェバの定理
  const ratioFig = gen("kA.ratio", null, lv({ types: ["bis"] }, { types: ["bis", "ceva"] }, { types: ["ceva", "ceva", "aubel", "bis"] }), (rng, type) => {
    if (type === "bis") {
      const b = rng.int(3, 9), c = rng.int(3, 9), a = rng.int(Math.abs(b - c) + 2, b + c - 2);
      if (b === c) return null;
      const T = triSides(a, b, c), [A, B, C] = scaleTo([T.A, T.B, T.C], 58, 36).map(([x, y]) => [x + 8, y + 8]);
      const D = lerp(B, C, c / (b + c)), cen = centroid([A, B, C]);
      const BD = Q(a * c, b + c);
      const items = [{ t: "poly", pts: [A, B, C], w: 0.5 }, seg(A, D, { w: 0.4 }), dot(D), lab(A, cen, "A"), lab(B, cen, "B"), lab(C, cen, "C"), T_(D[0], D[1] + 4.4, "D", 3.4, { bold: true }), sideLabel(A, B, cen, String(c)), sideLabel(A, C, cen, String(b)), T_((B[0] + C[0]) / 2, B[1] + 9, `BC＝${a}`, 3.2), ...angMark(A, B, D, "", { r: 6 }), ...angMark(A, D, C, "", { r: 7 })];
      return { text: "△ABC で、AD は ∠A の二等分線です。線分 BD の長さを求めましょう。", fig: fitDraw(items, 4), ans: num(BD), side: true, key: `rf:b:${a}:${b}:${c}`, meta: { v: qv(BD), chk: Math.hypot(D[0] - B[0], D[1] - B[1]) / Math.hypot(C[0] - B[0], C[1] - B[1]) * a } };
    }
    // チェバ:BD:DC＝p:q、CE:EA＝r:s → AF:FB
    const [p, q, r, s] = [rng.int(1, 4), rng.int(1, 4), rng.int(1, 4), rng.int(1, 4)];
    if (p === q && r === s) return null;
    const T = triAngles(rng.int(50, 70), rng.int(50, 70)), [A, B, C] = scaleTo([T.A, T.B, T.C], 58, 44).map(([x, y]) => [x + 8, y + 8]);
    const D = lerp(B, C, p / (p + q)), E = lerp(C, A, r / (r + s)), P = lineX(A, D, B, E), F = lineX(C, P, A, B);
    const cen = centroid([A, B, C]);
    const g = (u, v) => [u / gcd(u, v), v / gcd(u, v)];
    const [af, fb] = g(q * s, p * r);
    const items = [{ t: "poly", pts: [A, B, C], w: 0.5 }, seg(A, D, { w: 0.4 }), seg(B, E, { w: 0.4 }), seg(C, F, { w: 0.4 }), lab(A, cen, "A"), lab(B, cen, "B"), lab(C, cen, "C"), T_(D[0], D[1] + 4.4, "D", 3.4, { bold: true }), lab(E, cen, "E"), lab(F, cen, "F"), dot(P), T_(P[0] + 2.2, P[1] + 3.6, "P", 3.2, { bold: true })];
    if (type === "aubel") {
      // AP:PD ＝ (AF/FB ＋ AE/EC):1
      const v = Q(q * s * r + p * r * s, p * r * r);
      const ap = Q(q * s, p * r), ae = Q(s, r), sum = K.qa(ap, ae);
      const [x, y] = g(sum[0], sum[1]);
      return { text: `△ABC で、3本の線分 AD，BE，CF は1点 P で交わり、BD：DC＝${p}：${q}，CE：EA＝${r}：${s} です。AP：PD を求めましょう。`, fig: fitDraw(items, 4), ans: `${x}：${y}`, side: true, key: `rf:a:${p}${q}${r}${s}`, meta: { v: x / y, chk: Math.hypot(P[0] - A[0], P[1] - A[1]) / Math.hypot(D[0] - P[0], D[1] - P[1]) } };
    }
    return { text: `△ABC で、3本の線分 AD，BE，CF は1点 P で交わり、BD：DC＝${p}：${q}，CE：EA＝${r}：${s} です。AF：FB を求めましょう。`, fig: fitDraw(items, 4), ans: `${af}：${fb}`, side: true, key: `rf:c:${p}${q}${r}${s}`, meta: { v: af / fb, chk: Math.hypot(F[0] - A[0], F[1] - A[1]) / Math.hypot(B[0] - F[0], B[1] - F[1]) } };
  }, (pr) => near(pr.meta.v, pr.meta.chk, 1e-6) ? null : "比が図と合わない", { work: 30 });

  // 円の性質(内接四角形・接弦定理・方べきの定理)
  const circ = (cx, cy, r) => ({ t: "circle", cx, cy, r, w: 0.5 });
  const onC = (O, r, a) => [O[0] + r * Math.cos(a * D2R), O[1] - r * Math.sin(a * D2R)];
  const circleFig = gen("kA.circle", null, lv({ types: ["quad", "tan"] }, { types: ["quad", "tan", "powIn", "powOut"] }, { types: ["powOut", "powTan", "quad2", "tan"] }), (rng, type) => {
    const O = [30, 28], r = 20;
    const items = [circ(O[0], O[1], r)];
    if (type === "quad" || type === "quad2") {
      // 弧(度):AB, BC, CD, DA。内接四角形 ABCD
      let arcs;
      for (;;) {
        arcs = [rng.int(25, 60) * 2, rng.int(25, 60) * 2, rng.int(25, 60) * 2];
        const last = 360 - arcs.reduce((a, b) => a + b, 0);
        if (last >= 50 && last <= 140) {
          arcs.push(last);
          break;
        }
      }
      const st = rng.int(0, 3) * 10 + 100;
      const angs = [st, st + arcs[0], st + arcs[0] + arcs[1], st + arcs[0] + arcs[1] + arcs[2]];
      const [A, B, C, Dd] = angs.map((a) => onC(O, r, a));
      const angA = (arcs[1] + arcs[2]) / 2, angC = 180 - angA;
      items.push({ t: "poly", pts: [A, B, C, Dd], w: 0.5 }, ...[[A, "A"], [B, "B"], [C, "C"], [Dd, "D"]].map(([P, s]) => vLabel(P, O, s, 3.4)));
      if (type === "quad") {
        items.push(...angMark(A, B, Dd, deg(angA), { r: 5 }), ...angMark(C, B, Dd, "[[v:x]]", { r: 5 }));
        return { text: "四角形 ABCD は円に内接しています。角 [[v:x]] の大きさを求めましょう。", fig: fitDraw(items, 4), ans: deg(angC), side: true, key: `cf:q:${arcs}`, meta: { want: angC, got: angleAt(C, B, Dd) } };
      }
      // 外角:辺 BC の延長
      const Ext = lerp(B, C, 1.45);
      items.push(seg(C, Ext, { w: 0.4 }), T_(Ext[0] + 1, Ext[1] + 3, "E", 3.2, { bold: true }), ...angMark(A, B, Dd, deg(angA), { r: 5 }), ...angMark(C, Ext, Dd, "[[v:x]]", { r: 5 }));
      return { text: "四角形 ABCD は円に内接し、E は辺 BC の延長上の点です。角 [[v:x]] の大きさを求めましょう。", fig: fitDraw(items, 4), ans: deg(angA), side: true, key: `cf:q2:${arcs}`, meta: { want: angA, got: angleAt(C, Ext, Dd) } };
    }
    if (type === "tan") {
      // A で接線。∠ACB ＝ θ → 接線と AB のなす角 ＝ θ
      const aA = 270, arcAB = rng.int(30, 70) * 2, aB = aA + arcAB, aC = aB + rng.int(40, 80) * 2;
      if (aC - aA > 330) return null;
      const A = onC(O, r, aA), B = onC(O, r, aB), C = onC(O, r, aC);
      const th = arcAB / 2;
      const T1 = [A[0] - 26, A[1]], T2 = [A[0] + 26, A[1]];
      // 接線 T1T2 のうち、B のある側
      const Tside = B[0] > A[0] ? T2 : T1;
      items.push(seg(T1, T2, { w: 0.45 }), { t: "poly", pts: [A, B, C], w: 0.5 }, vLabel(A, O, "A", 3.6), vLabel(B, O, "B", 3.4), vLabel(C, O, "C", 3.4), T_(Tside[0], Tside[1] + 4, "T", 3.2, { bold: true }), ...angMark(C, A, B, deg(th), { r: 5 }), ...angMark(A, B, Tside, "[[v:x]]", { r: 6 }));
      return { text: "直線 AT は点 A で円に接しています。角 [[v:x]] の大きさを求めましょう。", fig: fitDraw(items, 4), ans: deg(th), side: true, key: `cf:t:${arcAB}:${aC}`, meta: { want: th, got: angleAt(A, B, Tside) } };
    }
    // 方べきの定理(長さは図の数字で)
    if (type === "powIn") {
      const pa = rng.int(2, 8), pb = rng.int(2, 9), pc = rng.int(2, 8), pd = pa * pb / pc;
      if (!Number.isInteger(pd) || pc === pa) return null;
      const a1 = rng.int(100, 160), a2 = a1 + 180 + rng.int(-20, 20), b1 = rng.int(20, 70), b2 = b1 + 180 + rng.int(-20, 20);
      const A = onC(O, r, a1), B = onC(O, r, a2), C = onC(O, r, b1), Dd = onC(O, r, b2), P = lineX(A, B, C, Dd);
      items.push(seg(A, B), seg(C, Dd), dot(P), T_(P[0] + 2, P[1] + 4.2, "P", 3.2, { bold: true }), ...[[A, "A"], [B, "B"], [C, "C"], [Dd, "D"]].map(([Pt, s]) => vLabel(Pt, O, s, 3.4)), sideLabel(P, A, [P[0] + 1, P[1] + 6], String(pa), 2.6), sideLabel(P, B, [P[0] - 1, P[1] - 6], String(pb), 2.6), sideLabel(P, C, [P[0] - 2, P[1] + 6], String(pc), 2.6), sideLabel(P, Dd, [P[0] + 2, P[1] - 6], "[[v:x]]", 2.6));
      return { text: "2つの弦 AB，CD が点 P で交わっています。[[v:x]] の値を求めましょう。", fig: fitDraw(items, 4), ans: String(pd), side: true, key: `cf:pi:${pa}:${pb}:${pc}`, meta: { want: pa * pb, got: pc * pd } };
    }
    // 円の外の点 P から2本の割線(または接線)
    const P = [O[0] + 48, O[1] + 4];
    const hit = (ang) => {
      // P から角 ang の方向の直線と円の交点(近い方, 遠い方)
      const dx = Math.cos(ang * D2R), dy = -Math.sin(ang * D2R), fx = P[0] - O[0], fy = P[1] - O[1];
      const bb = fx * dx + fy * dy, cc = fx * fx + fy * fy - r * r, disc = bb * bb - cc;
      if (disc <= 0) return null;
      const t1 = -bb - Math.sqrt(disc), t2 = -bb + Math.sqrt(disc);
      return [[P[0] + dx * t1, P[1] + dy * t1], [P[0] + dx * t2, P[1] + dy * t2]];
    };
    if (type === "powTan") {
      const pa = rng.int(2, 6), ab = rng.int(2, 8), pt2 = pa * (pa + ab), pt = Math.sqrt(pt2);
      if (!Number.isInteger(pt) && rng.chance(0.6)) return null;
      const h = hit(rng.int(178, 186)), d0 = Math.hypot(P[0] - O[0], P[1] - O[1]), tA = Math.asin(r / d0) / D2R, base = Math.atan2(-(O[1] - P[1]), O[0] - P[0]) / D2R;
      const Tt = (() => {
        const ang = base - tA, L = Math.sqrt(d0 * d0 - r * r);
        return [P[0] + L * Math.cos(ang * D2R), P[1] - L * Math.sin(ang * D2R)];
      })();
      if (!h) return null;
      const [A, B] = h;
      items.push(seg(P, B), seg(P, Tt), dot(P), T_(P[0] + 3, P[1] + 1.2, "P", 3.4, { bold: true }), vLabel(A, O, "A", 3.4), vLabel(B, O, "B", 3.4), vLabel(Tt, O, "T", 3.4), sideLabel(P, A, [P[0] - 2, P[1] - 6], String(pa), 2.6), sideLabel(A, B, [O[0], O[1] - 6], String(ab), 2.6), sideLabel(P, Tt, [P[0] - 6, P[1] + 8], "[[v:x]]", 2.8));
      const ans = K.rootTex(pt2);
      return { text: "直線 PT は点 T で円に接しています。[[v:x]] の値を求めましょう。", fig: fitDraw(items, 4), ans, side: true, key: `cf:pt:${pa}:${ab}`, meta: { want: pt2, got: evalH(ans) ** 2 } };
    }
    const pa = rng.int(2, 6), ab = rng.int(2, 8), pc = rng.int(2, 6), all = pa * (pa + ab), pd = all / pc;
    if (!Number.isInteger(pd) || pd <= pc || pc === pa) return null;
    const h1 = hit(rng.int(170, 176)), h2 = hit(rng.int(186, 194));
    if (!h1 || !h2) return null;
    const [A, B] = h1, [C, Dd] = h2;
    items.push(seg(P, B), seg(P, Dd), dot(P), T_(P[0] + 3, P[1] + 1.2, "P", 3.4, { bold: true }), ...[[A, "A"], [B, "B"], [C, "C"], [Dd, "D"]].map(([Pt, s]) => vLabel(Pt, O, s, 3.4)), sideLabel(P, A, [P[0] - 2, P[1] + 6], String(pa), 2.6), sideLabel(A, B, [O[0], O[1] + 6], String(ab), 2.6), sideLabel(P, C, [P[0] - 2, P[1] - 6], String(pc), 2.6), sideLabel(C, Dd, [O[0], O[1] - 6], "[[v:x]]", 2.6));
    return { text: "点 P を通る2本の直線が、円と点 A，B および C，D で交わっています。[[v:x]] の値を求めましょう。", fig: fitDraw(items, 4), ans: String(pd - pc), side: true, key: `cf:po:${pa}:${ab}:${pc}`, meta: { want: pa * (pa + ab), got: pc * pd } };
  }, (pr) => Math.abs(pr.meta.want - pr.meta.got) < 1e-6 ? null : "図と答えが合わない", { work: 26 });

  // 2円の位置関係・多面体
  const twoCircles = gen("kA.solid", "次の問いに答えましょう。", lv({ types: ["circ", "euler"] }, { types: ["circ", "euler", "tangents"] }, { types: ["tangents", "regular", "circ", "euler", "tangents", "circ"] }), (rng, type) => {
    if (type === "circ" || type === "tangents") {
      const r1 = rng.int(2, 8), r2 = rng.int(1, r1), kind = rng.int(0, 4);
      const d = [r1 + r2 + rng.int(1, 4), r1 + r2, rng.int(r1 - r2 + 1, r1 + r2 - 1), r1 - r2, rng.int(0, r1 - r2 - 1)][kind];
      if (d < 0 || kind === 2 && r1 + r2 - 1 < r1 - r2 + 1 || kind === 4 && r1 - r2 - 1 < 0 || kind === 3 && r1 === r2) return null;
      const name = d > r1 + r2 ? "離れている" : d === r1 + r2 ? "外接する" : d > r1 - r2 ? "2点で交わる" : d === r1 - r2 ? "内接する" : "一方が他方の内部にある";
      const tn = d > r1 + r2 ? 4 : d === r1 + r2 ? 3 : d > r1 - r2 ? 2 : d === r1 - r2 ? 1 : 0;
      if (type === "tangents") return { text: `半径 ${r1}，${r2} の2つの円の中心間の距離が ${d} のとき、2つの円の共通接線は何本ありますか。`, ans: `${tn}本`, meta: { r1, r2, d, tn } };
      return { text: `半径 ${r1}，${r2} の2つの円の中心間の距離が ${d} のとき、2つの円の位置関係を答えましょう。`, ans: name, meta: { r1, r2, d, name } };
    }
    if (type === "regular") {
      const S = rng.pick([["正四面体", 4, 3, 3], ["正六面体", 6, 4, 3], ["正八面体", 8, 3, 4], ["正十二面体", 12, 5, 3], ["正二十面体", 20, 3, 5]]);
      const [nm, f, sides, meet] = S, e = f * sides / 2, v = e * 2 / meet;
      if (rng.chance(0.5)) return { text: `${nm}の1つの頂点に集まる面の数と、辺の数 [[v:e]] を求めましょう。`, ans: `${meet}，[[v:e]]＝${e}`, meta: { v, e, f } };
      return { text: `${nm}の頂点の数 [[v:v]]、辺の数 [[v:e]] を求めましょう(面の数 [[v:f]]＝${f})。`, ans: `[[v:v]]＝${v}，[[v:e]]＝${e}`, meta: { v, e, f } };
    }
    const f = rng.int(5, 12), e = rng.int(f + 3, 2 * f + 4), v = 2 - f + e;
    if (v < 4 || 2 * e < 3 * v || 2 * e < 3 * f || e > 3 * v - 6 || e > 3 * f - 6) return null;
    return { text: `面の数が ${f}、辺の数が ${e} の凸多面体の頂点の数を求めましょう。`, ans: `${v}`, meta: { v, e, f } };
  }, (pr) => {
    const m = pr.meta;
    if (m.e !== undefined) return m.v - m.e + m.f === 2 ? null : "オイラーの多面体定理に合わない";
    if (m.tn !== undefined) return null;
    return null;
  }, { work: 18 });
  H["kA.centers"] = "外心 O:∠BOC＝2∠A(中心角)。内心 I:∠BIC＝90°＋[[f:1/2]]∠A。重心 G は中線を 2：1 に分けます。";
  H["kA.ratio"] = "角の二等分線:BD：DC＝AB：AC。チェバの定理:[[f:AF/FB]]×[[f:BD/DC]]×[[f:CE/EA]]＝1。";
  H["kA.circle"] = "円に内接する四角形の対角の和は 180°、外角はとなりの内角の対角に等しい。接弦定理:接線と弦のつくる角は、その内部の弧に対する円周角に等しい。方べきの定理:PA×PB＝PC×PD＝PT²。";
  H["kA.solid"] = "2円(半径 r＞r′、中心間の距離 d):d＞r＋r′ 離れる、d＝r＋r′ 外接、r－r′＜d＜r＋r′ 2点で交わる、d＝r－r′ 内接。オイラーの多面体定理 v－e＋f＝2。";

  // ============================================================
  // 4 数学と人間の活動(整数の性質)
  // ============================================================
  const factorize = (n) => {
    const out = [];
    for (let p = 2; p * p <= n; p++) {
      let e = 0;
      while (n % p === 0) n /= p, e++;
      if (e) out.push([p, e]);
    }
    if (n > 1) out.push([n, 1]);
    return out;
  };
  const facTex = (n) => factorize(n).map(([p, e]) => `${p}${e > 1 ? K.sup(e) : ""}`).join("×");
  const gcdlcm = gen("kA.gcdlcm", "次の問いに答えましょう。", lv({ types: ["two", "fac"] }, { types: ["two", "three", "fac"] }, { types: ["three", "find", "fac"] }), (rng, type) => {
    if (type === "fac") {
      const n = rng.pick([2, 3, 5, 7]) ** rng.int(1, 3) * rng.pick([2, 3, 5, 7, 11]) ** rng.int(1, 2) * rng.pick([1, 3, 5]);
      if (n < 30 || n > 3000 || factorize(n).length < 2) return null;
      return { text: `${n} を素因数分解しましょう。`, ans: facTex(n), meta: { n } };
    }
    if (type === "find") {
      // 最大公約数 g、最小公倍数 l の2つの自然数(a＜b)
      const g = rng.int(2, 12), [x, y] = pickN(rng, [1, 2, 3, 4, 5, 7], 2).sort((u, v) => u - v);
      if (gcd(x, y) !== 1) return null;
      const a = g * x, b = g * y, l = g * x * y;
      return { text: `最大公約数が ${g}、最小公倍数が ${l} である2つの自然数 [[v:a]]，[[v:b]](${V("a")}＜${V("b")})の組をすべて求めましょう。`, ans: (() => {
        const out = [];
        for (let u = 1; u <= l / g; u++) for (let v = u + 1; v <= l / g; v++) if (gcd(u, v) === 1 && u * v * g === l) out.push(`(${g * u}, ${g * v})`);
        return out.join("，");
      })(), meta: { g, l } };
    }
    const ns = type === "two" ? [rng.int(12, 120), rng.int(12, 120)] : [rng.int(12, 90), rng.int(12, 90), rng.int(12, 90)];
    if (new Set(ns).size < ns.length) return null;
    const G = ns.reduce(gcd), L = ns.reduce(lcm);
    if (G === 1 || L > 5000) return null;
    return { text: `${ns.join("，")} の最大公約数と最小公倍数`, ans: `最大公約数 ${G}，最小公倍数 ${L}`, meta: { ns, G, L } };
  }, (pr) => {
    const m = pr.meta;
    if (m.n) return evalH(pr.answer.display) === m.n ? null : "素因数分解が合わない";
    if (m.ns) return m.ns.reduce(gcd) === m.G && m.ns.reduce(lcm) === m.L ? null : "最大公約数・最小公倍数が合わない";
    const pairs = [...pr.answer.display.matchAll(/\((\d+), (\d+)\)/g)].map((x) => [+x[1], +x[2]]);
    return pairs.length && pairs.every(([a, b]) => gcd(a, b) === m.g && lcm(a, b) === m.l) ? null : "組が合わない";
  }, { work: 22 });

  const divisors = gen("kA.divisors", "次の問いに答えましょう。", lv({ types: ["count"] }, { types: ["count", "sum"] }, { types: ["count", "sum", "square"] }), (rng, type) => {
    if (type === "square") {
      // n に最小の自然数をかけて平方数に
      const n = rng.pick([2, 3, 5, 7]) ** rng.int(1, 3) * rng.pick([3, 5, 7, 11]) ** rng.int(1, 2) * rng.pick([1, 2]);
      if (n > 3000 || n < 20) return null;
      const k = factorize(n).filter(([, e]) => e % 2).reduce((a, [p]) => a * p, 1);
      if (k === 1) return null;
      return { text: `${n} にできるだけ小さい自然数 [[v:k]] をかけて、ある自然数の2乗にしたい。[[v:k]] を求めましょう。`, ans: `${V("k")}＝${k}`, meta: { n, k } };
    }
    const n = rng.pick([2, 3]) ** rng.int(1, 4) * rng.pick([3, 5, 7]) ** rng.int(1, 2) * rng.pick([1, 1, 5]);
    if (n > 2000 || n < 24) return null;
    let cnt = 0, sum = 0;
    for (let d = 1; d <= n; d++) if (n % d === 0) cnt++, sum += d;
    if (type === "count") return { text: `${n} の正の約数の個数`, ans: `${cnt}個`, meta: { n, cnt } };
    return { text: `${n} の正の約数の総和`, ans: String(sum), meta: { n, sum } };
  }, (pr) => {
    const m = pr.meta;
    if (m.k) return Number.isInteger(Math.sqrt(m.n * m.k)) && ![...Array(m.k).keys()].slice(1).some((j) => Number.isInteger(Math.sqrt(m.n * j))) ? null : "k が合わない";
    let cnt = 0, sum = 0;
    for (let d = 1; d <= m.n; d++) if (m.n % d === 0) cnt++, sum += d;
    return m.cnt !== undefined ? cnt === m.cnt ? null : "個数が合わない" : sum === m.sum ? null : "総和が合わない";
  }, { work: 22 });

  const euclid = gen("kA.euclid", "互除法を用いて、次の2つの数の最大公約数を求めましょう。", lv({ types: [0] }, { types: [0] }, { types: [0] }), (rng, _t, p) => {
    const g = rng.int(3, 41), a = rng.int(11, 60), b = rng.int(11, 60);
    if (gcd(a, b) !== 1 || a === b) return null;
    const x = g * a, y = g * b;
    if (x < 100 || y < 100) return null;
    return { text: `${Math.max(x, y)}，${Math.min(x, y)}`, ans: String(g), meta: { x, y, g } };
  }, (pr) => gcd(pr.meta.x, pr.meta.y) === pr.meta.g ? null : "最大公約数が合わない", { work: 30 });

  const diophant = gen("kA.diophant", "次の方程式の整数解をすべて求めましょう。", lv({ types: ["zero"] }, { types: ["zero", "c"] }, { types: ["c", "c", "pos"] }), (rng, type) => {
    const a = rng.int(2, 11), b = rng.int(2, 13);
    if (gcd(a, b) !== 1 || a === b) return null;
    const sa = rng.chance(0.5) ? 1 : -1;
    const A = a, B = sa * b;
    // A x ＋ B y ＝ c
    const c = type === "zero" ? 0 : nz(rng, -12, 15);
    // 特殊解
    let x0 = null, y0 = null;
    for (let x = -30; x <= 30 && x0 === null; x++) if ((c - A * x) % B === 0) x0 = x, y0 = (c - A * x) / B;
    // 一般解 x ＝ x0 ＋ B k、y ＝ y0 － A k(x0 をできるだけ小さく)
    const st = Math.abs(B);
    x0 = ((x0 % st) + st) % st;
    y0 = (c - A * x0) / B;
    const kx = B / gcd(A, B) * (B < 0 ? -1 : 1), ky = -A / gcd(A, B) * (B < 0 ? -1 : 1);
    const term = (k0, coef) => {
      const k = coef === 1 ? "" : coef === -1 ? "－" : num(Q(coef));
      return `${k}[[v:k]]${k0 ? (k0 < 0 ? "－" : "＋") + Math.abs(k0) : ""}`;
    };
    const eq = `${A}${V("x")}${B < 0 ? "－" : "＋"}${Math.abs(B)}${V("y")}＝${num(Q(c))}`;
    if (type === "pos") {
      // 正の整数解の組
      const c2 = rng.int(A + Math.abs(B) + 1, 60);
      if (B < 0) return null;
      const sols = [];
      for (let x = 1; x <= c2; x++) if ((c2 - A * x) % B === 0 && (c2 - A * x) / B > 0) sols.push(`(${x}, ${(c2 - A * x) / B})`);
      if (!sols.length || sols.length > 4) return null;
      return { text: `${A}${V("x")}＋${B}${V("y")}＝${c2} を満たす正の整数 [[v:x]]，[[v:y]] の組`, ans: sols.join("，"), meta: { A, B, c: c2, pos: true, n: sols.length } };
    }
    return { text: eq, ans: `${V("x")}＝${term(x0, kx)}，${V("y")}＝${term(y0, ky)}(${V("k")} は整数)`, meta: { A, B, c, x0, y0, kx, ky } };
  }, (pr) => {
    const m = pr.meta;
    if (m.pos) {
      const prs = [...pr.answer.display.matchAll(/\((\d+), (\d+)\)/g)].map((x) => [+x[1], +x[2]]);
      return prs.length === m.n && prs.every(([x, y]) => m.A * x + m.B * y === m.c) ? null : "解が合わない";
    }
    // どの k でも満たし、ステップが最小
    for (let k = -3; k <= 3; k++) if (m.A * (m.x0 + m.kx * k) + m.B * (m.y0 + m.ky * k) !== m.c) return "一般解が合わない";
    return Math.abs(m.kx) === Math.abs(m.B) && Math.abs(m.ky) === Math.abs(m.A) ? null : "一般解の間かくが合わない";
  }, { work: 36 });

  const baseN = gen("kA.base", "次の問いに答えましょう。", lv({ types: ["to10", "from10"] }, { types: ["to10", "from10", "toN"] }, { types: ["frac", "toN", "from10", "add2"] }), (rng, type) => {
    const sub2 = (b) => `[[_(${b})]]`;
    if (type === "to10") {
      const b = rng.pick([2, 2, 3, 5]), n = rng.int(b === 2 ? 9 : 10, b === 2 ? 60 : 200);
      return { text: `${n.toString(b)}${sub2(b)} を10進法で表す`, ans: String(n), meta: { s: n.toString(b), b, v: n } };
    }
    if (type === "from10" || type === "toN") {
      const b = type === "from10" ? 2 : rng.pick([3, 4, 5, 7]), n = rng.int(10, b === 2 ? 100 : 300);
      return { text: `10進法の数 ${n} を ${b}進法で表す`, ans: `${n.toString(b)}${sub2(b)}`, meta: { s: n.toString(b), b, v: n } };
    }
    if (type === "add2") {
      const a = rng.int(5, 30), c = rng.int(5, 30);
      return { text: `${a.toString(2)}${sub2(2)}＋${c.toString(2)}${sub2(2)} を計算し、2進法で答える`, ans: `${(a + c).toString(2)}${sub2(2)}`, meta: { s: (a + c).toString(2), b: 2, v: a + c } };
    }
    // 2進法の小数
    const k = rng.int(2, 4), n = rng.int(1, 2 ** k - 1);
    if (n % 2 === 0) return null;
    const s = "0." + n.toString(2).padStart(k, "0");
    return { text: `${s}${sub2(2)} を10進法の小数で表す`, ans: String(n / 2 ** k), meta: { s, b: 2, v: n / 2 ** k } };
  }, (pr) => {
    const m = pr.meta, [ip, fp = ""] = m.s.split(".");
    const v = parseInt(ip, m.b) + [...fp].reduce((a, d, i) => a + Number(d) * m.b ** -(i + 1), 0);
    return Math.abs(v - m.v) < 1e-12 ? null : "n進法が合わない";
  }, { work: 22 });

  const modQ = gen("kA.mod", "次の問いに答えましょう。", lv({ types: ["sum", "prod"] }, { types: ["sum", "prod", "sq"] }, { types: ["pow", "sq", "pow", "prod"] }), (rng, type) => {
    const m = rng.pick([5, 6, 7, 9, 11]), r1 = rng.int(1, m - 1), r2 = rng.int(1, m - 1);
    if (type === "pow") {
      const a = rng.pick([2, 3, 5]), n = rng.int(20, 120);
      if (gcd(a, m) !== 1) return null;
      let r = 1;
      for (let i = 0; i < n; i++) r = r * a % m;
      return { text: `${a}[[^${n}]] を ${m} で割ったときの余り`, ans: String(r), meta: { a, n, m, r } };
    }
    const lead = `整数 [[v:a]] を ${m} で割ると ${r1} 余り、整数 [[v:b]] を ${m} で割ると ${r2} 余る。`;
    const T = { sum: [`[[v:a]]＋[[v:b]]`, (r1 + r2) % m], prod: [`[[v:a]][[v:b]]`, r1 * r2 % m], sq: [`[[v:a]]²＋[[v:b]]²`, (r1 * r1 + r2 * r2) % m] }[type];
    return { text: `${lead}${T[0]} を ${m} で割ったときの余り`, ans: String(T[1]), wide: true, meta: { m, r1, r2, e: T[0], r: T[1] } };
  }, (pr) => {
    const m = pr.meta;
    if (m.a) {
      let r = 1;
      for (let i = 0; i < m.n; i++) r = r * m.a % m.m;
      return r === m.r ? null : "余りが合わない";
    }
    const a = m.m * 7 + m.r1, b = m.m * 3 + m.r2, v = evalH(m.e, { a, b });
    return ((v % m.m) + m.m) % m.m === m.r ? null : "余りが合わない";
  }, { work: 24 });
  H["kA.gcdlcm"] = "素因数分解して、共通な素因数の積が最大公約数、すべての素因数を最大の指数でかけたものが最小公倍数。a＝ga′，b＝gb′ とおきます。";
  H["kA.divisors"] = "n＝p[[^a]]q[[^b]] なら、約数の個数は (a＋1)(b＋1)、総和は (1＋p＋…＋p[[^a]])(1＋q＋…＋q[[^b]])。";
  H["kA.euclid"] = "a を b で割った余りを r とすると、a と b の最大公約数は b と r の最大公約数に等しい。余りが 0 になるまでくり返します。";
  H["kA.diophant"] = "まず1つの解(特殊解)を見つけ、もとの式から引いて ax＝by の形にします。a と b が互いに素なら x は b の倍数です。";
  H["kA.base"] = "n進法の各位は 1, n, n², … を表します。10進法からは n で割った余りを下から並べます。";
  H["kA.mod"] = "a≡r(mod m) なら、a＋b、ab、a[[^n]] の余りは、余りどうしで計算できます。";

  for (const [k, v] of Object.entries(H)) K.hints[k] = X(v);
  return [centers, ratioFig, circleFig, twoCircles, gcdlcm, divisors, euclid, diophant, baseN, modQ];
})();
kouA.push(...kouAb);

var kouAGrade = (() => {
  const T = (label, generator, kinds, o = {}) => ({ label, generator, kinds, ...o });
  const D = ["drill", "test"], W = ["word", "test"], F = ["figure", "test"];
  const units = [
    ["kA-01", "場合の数", "場合の数と確率", [T("集合の要素の個数", "kA.setCount", D), T("順列・組合せの計算", "kA.permCalc", D, { weight: 2 }), T("順列の利用", "kA.perm", W, { weight: 2 }), T("組合せの利用", "kA.comb", W, { weight: 2 })], { drill: [8, 5], word: [6, 10] }],
    ["kA-02", "確率", "場合の数と確率", [T("確率", "kA.prob", W, { weight: 3 }), T("条件付き確率", "kA.cond", W), T("期待値", "kA.expect", W)], { word: [10, 10] }],
    ["kA-03", "図形の性質", "図形の性質", [T("三角形の外心・内心・重心", "kA.centers", F), T("線分の比(二等分線・チェバ)", "kA.ratio", F), T("円の性質", "kA.circle", F, { weight: 2 }), T("2円の関係と多面体", "kA.solid", D)], { drill: [4, 5], figure: [8, 10] }],
    ["kA-04", "数学と人間の活動", "数学と人間の活動", [T("最大公約数・最小公倍数", "kA.gcdlcm", D), T("約数", "kA.divisors", D), T("ユークリッドの互除法", "kA.euclid", D), T("一次不定方程式", "kA.diophant", D), T("n進法", "kA.base", D), T("余りによる分類", "kA.mod", D)], { drill: [10, 10] }]
  ];
  return {
    grade: 11,
    note: "高校 数学A。学習指導要領(平成30年告示)の内容。問題文はすべてこのファイルで作ったもの。",
    units: units.map(([id, name, domain, topics, testPlan], i) => ({ id, order: i + 1, name, rubyName: name, domain, topics, testPlan }))
  };
})();
