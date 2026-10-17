
  // ============================================================
  // 5 平面図形
  // ============================================================
  const TERMS = [
    [1, "2点A，Bを通り、両方向に限りなくまっすぐにのびた線を何といいますか。", "直線AB"],
    [1, "直線ABのうち、点Aから点Bまでの部分を何といいますか。", "線分AB"],
    [1, "点Aを端として、点Bの方向にだけ限りなくのびた線を何といいますか。", "半直線AB"],
    [1, "直線ℓと直線mが垂直であることを、記号を使って表しましょう。", "ℓ⊥m"],
    [1, "直線ℓと直線mが平行であることを、記号を使って表しましょう。", "ℓ∥m"],
    [1, "円周の一部分を何といいますか。", "弧"],
    [1, "円周上の2点を結ぶ線分を何といいますか。", "弦"],
    [1, "円と1点だけで交わる直線を何といいますか。", "接線"],
    [2, "円の接線は、接点を通る半径とどのように交わりますか。", "垂直に交わる"],
    [2, "線分の中点を通り、その線分に垂直な直線を何といいますか。", "垂直二等分線"],
    [2, "1つの角を2等分する半直線を何といいますか。", "角の二等分線"],
    [2, "2つの半径と弧で囲まれた図形を何といいますか。", "おうぎ形"],
    [2, "おうぎ形で、2つの半径がつくる角を何といいますか。", "中心角"],
    [3, "点Pから直線ℓに垂線をひき、ℓとの交点をHとします。線分PHの長さを何といいますか。", "点Pと直線ℓとの距離"],
    [3, "線分ABの垂直二等分線上の点から、2点A，Bまでの距離について、どんなことがいえますか。", "等しい"],
    [3, "角の二等分線上の点から、角をつくる2辺までの距離について、どんなことがいえますか。", "等しい"],
    [3, "平行な2直線ℓ，mがあります。ℓ{上|じょう}のどこに点をとっても、その点とmとの距離について、どんなことがいえますか。", "どこでも等しい"]
  ];
  Object.assign(RUBY, { 円周上: "えんしゅうじょう", 垂直二等分線上: "すいちょくにとうぶんせんじょう", 角の二等分線上: "{角|かく}の{二等分線上|にとうぶんせんじょう}", 周上: "しゅうじょう", 向き: "{向|む}き" });
  const planeTerms = {
    id: "c1.planeTerms",
    instruction: R("次の問いに答えましょう。"),
    defaults: { max: 1 },
    levels: lv({ max: 1 }, { max: 2 }, { max: 3 }),
    generate(rng, p, ctx) {
      const pool = TERMS.filter((q) => q[0] <= p.max && (p.max === 1 || q[0] >= p.max - 1));
      const q = ctx && Number.isInteger(ctx.index) ? pool[(ctx.index + rng.int(0, pool.length - 1)) % pool.length] : rng.pick(pool);
      return { key: `tm:${q[1]}`, text: R(q[1]), wide: true, answer: { display: R(q[2]) }, workspace: { type: "none" }, meta: {} };
    }
  };

  // ---- 図形の移動(方眼。数学の座標で考えて、mm になおす) ----
  const PR = "′";
  function gridBox(cols, rows, c) {
    const m = 7;
    return { m, c, cols, rows, X: (x) => m + x * c, Y: (y) => m + (rows - y) * c, w: 2 * m + cols * c, h: 2 * m + rows * c, items: [{ t: "grid", x: m, y: m, cols, rows, cell: c }] };
  }
  const area2 = ([a, b, c]) => Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]));
  function triLabels(g, P, names, color) {
    const cx = (P[0][0] + P[1][0] + P[2][0]) / 3, cy = (P[0][1] + P[1][1] + P[2][1]) / 3;
    return P.map(([x, y], i) => {
      const dx = x - cx, dy = y - cy, l = Math.hypot(dx, dy) || 1;
      return T_(g.X(x + dx / l * 0.75), g.Y(y + dy / l * 0.75) + 1.3, names[i], 3.4, { bold: true, color });
    });
  }
  const MOVES = {
    para: (P, rng) => {
      const v = [nz(rng, -7, 7), nz(rng, -4, 4)];
      return { f: ([x, y]) => [x + v[0], y + v[1]], v };
    },
    rot180: (P, rng) => {
      const O = [rng.int(5, 13), rng.int(3, 9)];
      return { f: ([x, y]) => [2 * O[0] - x, 2 * O[1] - y], O };
    },
    rot90: (P, rng) => {
      const O = [rng.int(5, 13), rng.int(3, 9)];
      return { f: ([x, y]) => [O[0] - (y - O[1]), O[1] + (x - O[0])], O };
    },
    sym: (P, rng) => {
      if (rng.chance(0.6)) {
        const k = rng.int(5, 13);
        return { f: ([x, y]) => [2 * k - x, y], line: [[k, 0], [k, 12]] };
      }
      const k = rng.int(3, 9);
      return { f: ([x, y]) => [x, 2 * k - y], line: [[0, k], [18, k]] };
    },
    symDiag: (P, rng) => {
      const b = rng.int(-6, 2);
      // y ＝ x ＋ b に対して対称
      const f = ([x, y]) => [y - b, x + b];
      const pts = [];
      for (let x = 0; x <= 18; x++) if (x + b >= 0 && x + b <= 12) pts.push([x, x + b]);
      return { f, line: [pts[0], pts[pts.length - 1]] };
    }
  };
  const MOVE_TEXT = {
    para: "△ABCを、矢印の方向に、矢印の長さだけ平行移動した△A′B′C′をかきましょう。",
    rot180: "△ABCを、点Oを中心として180°回転移動した△A′B′C′をかきましょう。",
    rot90: "△ABCを、点Oを中心として、時計の針の回転と反対の向きに90°回転移動した△A′B′C′をかきましょう。",
    sym: "△ABCを、直線ℓを対称の軸として対称移動した△A′B′C′をかきましょう。",
    symDiag: "△ABCを、直線ℓを対称の軸として対称移動した△A′B′C′をかきましょう。"
  };
  const move = {
    id: "c1.move",
    instruction: null,
    defaults: { types: ["para", "sym"] },
    levels: lv({ types: ["para", "sym"] }, { types: ["para", "rot180", "sym"] }, { types: ["rot90", "rot180", "symDiag", "para"] }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx);
      const g = gridBox(18, 12, 5);
      const inside = ([x, y]) => x >= 0 && x <= 18 && y >= 0 && y <= 12;
      for (let t = 0; t < 2000; t++) {
        const P = [0, 1, 2].map(() => [rng.int(1, 17), rng.int(1, 11)]);
        const a2 = area2(P);
        if (a2 < 8 || a2 > 30) continue;
        // つぶれた三角形にしない(どの辺の高さも 2 ます以上)
        if ([[0, 1], [1, 2], [0, 2]].some(([i, j]) => a2 / Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]) < 2)) continue;
        if (P.some((a, i) => P.some((b, j) => i < j && Math.hypot(a[0] - b[0], a[1] - b[1]) < 2.5))) continue;
        const mv = MOVES[type](P, rng);
        const P2 = P.map(mv.f);
        if (!P2.every(inside)) continue;
        // 2つの三角形がかさならないように(中心どうしをはなす)
        const cen = (S) => [(S[0][0] + S[1][0] + S[2][0]) / 3, (S[0][1] + S[1][1] + S[2][1]) / 3];
        const c1 = cen(P), c2 = cen(P2);
        if (Math.hypot(c1[0] - c2[0], c1[1] - c2[1]) < 4.5) continue;
        if (mv.O) {
          // 回転の中心は三角形からはなす
          const O = mv.O, segD = (A, B) => {
            const dx = B[0] - A[0], dy = B[1] - A[1], t = Math.max(0, Math.min(1, ((O[0] - A[0]) * dx + (O[1] - A[1]) * dy) / (dx * dx + dy * dy)));
            return Math.hypot(A[0] + t * dx - O[0], A[1] + t * dy - O[1]);
          };
          if (Math.min(segD(P[0], P[1]), segD(P[1], P[2]), segD(P[0], P[2])) < 1.5) continue;
          const s1 = area2([O, P[0], P[1]]) + area2([O, P[1], P[2]]) + area2([O, P[0], P[2]]);
          if (Math.abs(s1 - a2) < 1e-9) continue;
        }
        const items = [...g.items];
        items.push({ t: "poly", pts: P.map(([x, y]) => [g.X(x), g.Y(y)]), w: 0.7, fill: "none" }, ...triLabels(g, P, ["A", "B", "C"]));
        if (mv.v) {
          const s = [rng.int(1, 17 - Math.max(0, mv.v[0])), 0];
          s[0] = Math.max(1 - Math.min(0, mv.v[0]), Math.min(17 - Math.max(0, mv.v[0]), s[0]));
          let placed = null;
          for (let k = 0; k < 200 && !placed; k++) {
            const sx = rng.int(0, 18), sy = rng.int(0, 12), ex = sx + mv.v[0], ey = sy + mv.v[1];
            if (!inside([ex, ey])) continue;
            const near = (q) => [...P, ...P2].some((r) => Math.hypot(r[0] - q[0], r[1] - q[1]) < 1.6);
            if (near([sx, sy]) || near([ex, ey]) || near([(sx + ex) / 2, (sy + ey) / 2])) continue;
            placed = [sx, sy, ex, ey];
          }
          if (!placed) continue;
          const [sx, sy, ex, ey] = placed;
          items.push(L_(g.X(sx), g.Y(sy), g.X(ex), g.Y(ey), { w: 0.6 }), arrowHead(g.X(ex), g.Y(ey), g.X(ex) - g.X(sx), g.Y(ey) - g.Y(sy), 2.4));
        }
        if (mv.O) items.push({ t: "dot", x: g.X(mv.O[0]), y: g.Y(mv.O[1]), r: 0.9 }, T_(g.X(mv.O[0]) - 2.4, g.Y(mv.O[1]) + 3.6, "O", 3.4, { bold: true }));
        if (mv.line) {
          const [[x1, y1], [x2, y2]] = mv.line;
          items.push(L_(g.X(x1), g.Y(y1), g.X(x2), g.Y(y2), { w: 0.6 }), T_(g.X(x2) + (x1 === x2 ? 2.4 : -1.5), g.Y(y2) + (x1 === x2 ? 3.4 : -1.4), "ℓ", 3.8, { bold: true }));
        }
        const red = [{ t: "poly", pts: P2.map(([x, y]) => [g.X(x), g.Y(y)]), w: 0.7, fill: "none", color: RED }, ...triLabels(g, P2, ["A" + PR, "B" + PR, "C" + PR], RED)];
        return {
          key: `mv:${type}:${P}:${P2}`,
          text: R(MOVE_TEXT[type]),
          figure: draw(g.w, g.h, items),
          answer: { display: R("図のとおり"), figure: draw(g.w, g.h, [...items, ...red]) },
          workspace: { type: "none" },
          meta: { type, P, P2 }
        };
      }
      throw new Error("図形の移動の問題が作れない");
    },
    verify(pr) {
      const { type, P, P2 } = pr.meta;
      const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
      for (const [i, j] of [[0, 1], [1, 2], [0, 2]]) if (Math.abs(d(P[i], P[j]) - d(P2[i], P2[j])) > 1e-9) return "形が変わっている";
      const red = pr.answer.figure.items.find((it) => it.t === "poly" && it.color === RED);
      return red && red.pts.length === 3 ? null : "答えの三角形がない";
    }
  };

  // ---- 作図(コンパスのあとを赤で) ----
  const rad = (d) => d * Math.PI / 180;
  const arc = (cx, cy, r, th, span = 14, o = {}) => {
    const a1 = th - rad(span), a2 = th + rad(span);
    return { t: "path", d: `M${(cx + r * Math.cos(a1)).toFixed(2)} ${(cy + r * Math.sin(a1)).toFixed(2)}A${r.toFixed(2)} ${r.toFixed(2)} 0 0 1 ${(cx + r * Math.cos(a2)).toFixed(2)} ${(cy + r * Math.sin(a2)).toFixed(2)}`, w: 0.35, color: RED, ...o };
  };
  const ang = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);
  // 2つの円の交点
  function circX(c1, r1, c2, r2) {
    const dx = c2[0] - c1[0], dy = c2[1] - c1[1], d = Math.hypot(dx, dy);
    const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, r1 * r1 - a * a));
    const mx = c1[0] + a * dx / d, my = c1[1] + a * dy / d;
    return [[mx + h * dy / d, my - h * dx / d], [mx - h * dy / d, my + h * dx / d]];
  }
  const ptLabel = (P, s, dx = -2.5, dy = -1.8) => [{ t: "dot", x: P[0], y: P[1], r: 0.8 }, T_(P[0] + dx, P[1] + dy, s, 3.6, { bold: true })];
  // 図の部品の位置をずらす・はみ出さない大きさを求める
  const pathNums = (d) => d.match(/[MLAZ]|-?[\d.]+/g);
  function pathMap(d, f) {
    const tk = pathNums(d), out = [];
    let cmd = "", buf = [];
    const flush = () => {
      if (!cmd) return;
      if (cmd === "A") for (let i = 0; i < buf.length; i += 7) out.push(...buf.slice(i, i + 5), ...f(buf[i + 5], buf[i + 6]));
      else for (let i = 0; i < buf.length; i += 2) out.push(...f(buf[i], buf[i + 1]));
    };
    const res = [];
    for (const t of tk) {
      if (/[MLAZ]/.test(t)) {
        flush();
        if (cmd) res.push(cmd + out.splice(0).map((v) => typeof v === "number" ? +v.toFixed(2) : v).join(" "));
        cmd = t;
        buf = [];
        if (t === "Z") {
          res.push("Z");
          cmd = "";
        }
      } else buf.push(Number(t));
    }
    flush();
    if (cmd) res.push(cmd + out.splice(0).map((v) => +Number(v).toFixed(2)).join(" "));
    return res.join("");
  }
  function itemPts(it) {
    if (it.t === "line") return [[it.x1, it.y1], [it.x2, it.y2]];
    if (it.t === "dot") return [[it.x, it.y]];
    if (it.t === "text") return [[it.x - 2.5, it.y - 3.5], [it.x + 2.5, it.y + 1]];
    if (it.t === "circle") return [[it.cx - it.r, it.cy - it.r], [it.cx + it.r, it.cy + it.r]];
    if (it.t === "poly") return it.pts;
    if (it.t === "path") {
      const pts = [];
      pathMap(it.d, (x, y) => (pts.push([x, y]), [x, y]));
      return pts;
    }
    return [];
  }
  function fitBox(items, m) {
    const pts = items.flatMap(itemPts), xs2 = pts.map((p2) => p2[0]), ys2 = pts.map((p2) => p2[1]);
    const x0 = Math.min(...xs2), y0 = Math.min(...ys2);
    return { W: Math.max(...xs2) - x0 + 2 * m, H: Math.max(...ys2) - y0 + 2 * m, dx: m - x0, dy: m - y0 };
  }
  function shiftItem(it, dx, dy) {
    if (it.t === "line") return { ...it, x1: it.x1 + dx, y1: it.y1 + dy, x2: it.x2 + dx, y2: it.y2 + dy };
    if (it.t === "dot" || it.t === "text") return { ...it, x: it.x + dx, y: it.y + dy };
    if (it.t === "circle") return { ...it, cx: it.cx + dx, cy: it.cy + dy };
    if (it.t === "poly") return { ...it, pts: it.pts.map(([x, y]) => [x + dx, y + dy]) };
    if (it.t === "path") return { ...it, d: pathMap(it.d, (x, y) => [x + dx, y + dy]) };
    return it;
  }
  // P を通り方向 th の直線を、はばいっぱい(len の長さ)に
  const longLine = (P, th, len, o = {}) => L_(P[0] - Math.cos(th) * len, P[1] - Math.sin(th) * len, P[0] + Math.cos(th) * len, P[1] + Math.sin(th) * len, { w: 0.5, color: RED, ...o });
  const CONS = {
    bisector: (rng) => {
      const th = rad(rng.int(-25, 25)), L = rng.int(42, 58), M = [60, 36];
      const A = [M[0] - Math.cos(th) * L / 2, M[1] - Math.sin(th) * L / 2], B = [M[0] + Math.cos(th) * L / 2, M[1] + Math.sin(th) * L / 2];
      const r = L * 0.66, [X1, X2] = circX(A, r, B, r);
      return {
        text: "線分ABの垂直二等分線を作図しましょう。",
        items: [L_(A[0], A[1], B[0], B[1], { w: 0.6 }), ...ptLabel(A, "A", -4, 1.2), ...ptLabel(B, "B", 2, 1.2)],
        red: [arc(A[0], A[1], r, ang(A, X1)), arc(A[0], A[1], r, ang(A, X2)), arc(B[0], B[1], r, ang(B, X1)), arc(B[0], B[1], r, ang(B, X2)), longLine(M, ang(X1, X2), 30)],
        check: { M, dir: th + Math.PI / 2 }
      };
    },
    angleBis: (rng) => {
      const O = [44, 62], t1 = rad(-rng.int(0, 15)), t2 = t1 - rad(rng.int(50, 110));
      const r1 = 22, P = [O[0] + r1 * Math.cos(t1), O[1] + r1 * Math.sin(t1)], Qp = [O[0] + r1 * Math.cos(t2), O[1] + r1 * Math.sin(t2)];
      const r2 = 18, X = circX(P, r2, Qp, r2).sort((a, b) => Math.hypot(b[0] - O[0], b[1] - O[1]) - Math.hypot(a[0] - O[0], a[1] - O[1]))[0];
      const bis = ang(O, X), L = 62;
      return {
        text: "∠XOYの二等分線を作図しましょう。",
        items: [L_(O[0], O[1], O[0] + L * Math.cos(t1), O[1] + L * Math.sin(t1), { w: 0.6 }), L_(O[0], O[1], O[0] + L * Math.cos(t2), O[1] + L * Math.sin(t2), { w: 0.6 }), T_(O[0] - 3.5, O[1] + 1.5, "O", 3.6, { bold: true }), T_(O[0] + (L + 3) * Math.cos(t1), O[1] + (L + 3) * Math.sin(t1) + 1.3, "X", 3.6, { bold: true }), T_(O[0] + (L + 3) * Math.cos(t2), O[1] + (L + 3) * Math.sin(t2) + 1.3, "Y", 3.6, { bold: true })],
        red: [arc(O[0], O[1], r1, t1, 10), arc(O[0], O[1], r1, t2, 10), arc(P[0], P[1], r2, ang(P, X)), arc(Qp[0], Qp[1], r2, ang(Qp, X)), L_(O[0], O[1], O[0] + 66 * Math.cos(bis), O[1] + 66 * Math.sin(bis), { w: 0.5, color: RED })],
        check: { M: O, dir: (t1 + t2) / 2 }
      };
    },
    perpFrom: (rng) => {
      const y0 = 44, P = [rng.int(45, 75), y0 - rng.int(18, 28)];
      const r = (y0 - P[1]) * 1.35, dx = Math.sqrt(r * r - (y0 - P[1]) ** 2);
      const A = [P[0] - dx, y0], B = [P[0] + dx, y0], r2 = r, [X1, X2] = circX(A, r2, B, r2);
      const below = X1[1] > X2[1] ? X1 : X2;
      return {
        text: "点Pを通り、直線ℓに垂直な直線を作図しましょう。",
        items: [L_(8, y0, 115, y0, { w: 0.6 }), T_(118, y0 + 1.3, "ℓ", 3.8, { bold: true }), ...ptLabel(P, "P", 2.2, -1.5)],
        red: [arc(P[0], P[1], r, ang(P, A), 8), arc(P[0], P[1], r, ang(P, B), 8), arc(A[0], A[1], r2, ang(A, below)), arc(B[0], B[1], r2, ang(B, below)), L_(P[0], P[1] - 8, P[0], below[1] + 5, { w: 0.5, color: RED })],
        check: { M: [P[0], y0], dir: Math.PI / 2 }
      };
    },
    perpOn: (rng) => {
      const y0 = 48, P = [rng.int(45, 75), y0], r = 15, A = [P[0] - r, y0], B = [P[0] + r, y0], r2 = 24, [X1, X2] = circX(A, r2, B, r2);
      const above = X1[1] < X2[1] ? X1 : X2;
      return {
        text: "直線ℓ{上|じょう}の点Pを通り、ℓに垂直な直線を作図しましょう。",
        items: [L_(8, y0, 115, y0, { w: 0.6 }), T_(118, y0 + 1.3, "ℓ", 3.8, { bold: true }), ...ptLabel(P, "P", 1.6, 4.6)],
        red: [arc(P[0], P[1], r, Math.PI, 10), arc(P[0], P[1], r, 0, 10), arc(A[0], A[1], r2, ang(A, above)), arc(B[0], B[1], r2, ang(B, above)), L_(P[0], y0, P[0], y0 - 40, { w: 0.5, color: RED })],
        check: { M: P, dir: Math.PI / 2 }
      };
    },
    tangent: (rng) => {
      const O = [55, 38], r0 = 17, th = rad(rng.int(-60, 20)), P = [O[0] + r0 * Math.cos(th), O[1] + r0 * Math.sin(th)];
      const s = 9, A = [P[0] - s * Math.cos(th), P[1] - s * Math.sin(th)], B = [P[0] + s * Math.cos(th), P[1] + s * Math.sin(th)], r2 = 14, [X1, X2] = circX(A, r2, B, r2);
      return {
        text: "円Oの周上の点Pを通る、円Oの接線を作図しましょう。",
        items: [{ t: "circle", cx: O[0], cy: O[1], r: r0, w: 0.6 }, ...ptLabel(O, "O", -2.8, 4.2), ...ptLabel(P, "P", 2.2 * Math.cos(th) + 1.2, 2.2 * Math.sin(th) - 1.2)],
        red: [L_(O[0], O[1], P[0] + 16 * Math.cos(th), P[1] + 16 * Math.sin(th), { w: 0.4, color: RED }), arc(P[0], P[1], s, th + Math.PI, 12), arc(P[0], P[1], s, th, 12), arc(A[0], A[1], r2, ang(A, X1)), arc(A[0], A[1], r2, ang(A, X2)), arc(B[0], B[1], r2, ang(B, X1)), arc(B[0], B[1], r2, ang(B, X2)), longLine(P, th + Math.PI / 2, 24)],
        check: { M: P, dir: th + Math.PI / 2 }
      };
    }
  };
  const construction = {
    id: "c1.construction",
    instruction: null,
    defaults: { types: ["bisector", "angleBis", "perpFrom"] },
    levels: lv({ types: ["bisector", "angleBis", "perpFrom"] }, { types: ["bisector", "angleBis", "perpFrom", "perpOn"] }, { types: ["angleBis", "perpFrom", "perpOn", "tangent"] }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx);
      const c = CONS[type](rng);
      const { W, H, dx, dy } = fitBox([...c.items, ...c.red], 5);
      c.items = c.items.map((it) => shiftItem(it, dx, dy));
      c.red = c.red.map((it) => shiftItem(it, dx, dy));
      c.check = { M: [c.check.M[0] + dx, c.check.M[1] + dy], dir: c.check.dir };
      return {
        key: `cs:${type}:${JSON.stringify(c.check).slice(0, 40)}`,
        softKey: type,
        text: R(c.text),
        figure: draw(W, H, c.items, { scaleK: 1.2 }),
        answer: { display: R("図のとおり"), figure: draw(W, H, [...c.items, ...c.red], { scaleK: 1.2 }) },
        workspace: { type: "none" },
        meta: { type, check: c.check }
      };
    },
    verify(pr) {
      const { M, dir } = pr.meta.check;
      const lines = pr.answer.figure.items.filter((it) => it.t === "line" && it.color === RED && it.w === 0.5);
      if (!lines.length) return "作図の線がない";
      const l = lines[lines.length - 1];
      const th = Math.atan2(l.y2 - l.y1, l.x2 - l.x1);
      const diff = Math.abs(Math.sin(th - dir));
      if (diff > 0.02) return `向きが合わない ${diff}`;
      const dist = Math.abs((l.x2 - l.x1) * (l.y1 - M[1]) - (l.x1 - M[0]) * (l.y2 - l.y1)) / Math.hypot(l.x2 - l.x1, l.y2 - l.y1);
      return dist < 0.05 ? null : `通る点が合わない ${dist}`;
    }
  };

  // π を使った長さ・面積
  const piTex = (q) => qeq(q, Q(1)) ? "π" : `${absTex(q)}π`;
  const ANGLES = [30, 45, 60, 72, 90, 120, 135, 150, 210, 240, 270, 300];
  const sector = {
    id: "c1.sector",
    instruction: R("次の問いに答えましょう。円周率は") + "π" + R("とします。"),
    defaults: { types: ["circ", "circA", "arc", "area"] },
    levels: lv({ types: ["circ", "circA", "arc", "area"] }, { types: ["arc", "area", "angleArc", "angleArea"] }, { types: ["angleArc", "angleArea", "radius", "arc", "area"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 300; t++) {
        const type = typeOf(rng, p, ctx && { index: ctx.index + t });
        const r = rng.int(2, 12), a = rng.pick(ANGLES);
        const arcQ = Q(r * a, 180), areaQ = Q(r * r * a, 360);
        let text, ans;
        if (type === "circ") [text, ans] = [`半径${r}cmの円の周の長さ`, `${piTex(Q(2 * r))}cm`];
        else if (type === "circA") [text, ans] = [`半径${r}cmの円の面積`, `${piTex(Q(r * r))}cm²`];
        else if (type === "arc") [text, ans] = [`半径${r}cm、中心角${a}°のおうぎ形の弧の長さ`, `${piTex(arcQ)}cm`];
        else if (type === "area") [text, ans] = [`半径${r}cm、中心角${a}°のおうぎ形の面積`, `${piTex(areaQ)}cm²`];
        else if (type === "angleArc") [text, ans] = [`半径${r}cm、弧の長さ${piTex(arcQ)}cmのおうぎ形の中心角`, `${a}°`];
        else if (type === "angleArea") [text, ans] = [`半径${r}cm、面積${piTex(areaQ)}cm²のおうぎ形の中心角`, `${a}°`];
        else [text, ans] = [`中心角${a}°、面積${piTex(areaQ)}cm²のおうぎ形の半径`, `${r}cm`];
        if ((type === "angleArc" || type === "arc") && arcQ[1] > 6) continue;
        if ((type === "angleArea" || type === "area" || type === "radius") && areaQ[1] > 6) continue;
        const T2 = R(text);
        return { key: `sc:${T2}`, text: T2, answer: { display: ans }, workspace: { type: "none" }, meta: { type, r, a } };
      }
      throw new Error("おうぎ形の問題が作れない");
    },
    verify(pr) {
      const { type, r, a } = pr.meta;
      const coef = (s) => {
        const m = /^(.*)π/.exec(s);
        return m[1] === "" ? Q(1) : evalQ(m[1]);
      };
      const d = pr.answer.display;
      if (type === "circ") return qeq(coef(d), Q(2 * r)) ? null : "円周";
      if (type === "circA") return qeq(coef(d), Q(r * r)) ? null : "円の面積";
      if (type === "arc") return qeq(coef(d), Q(r * a, 180)) ? null : "弧";
      if (type === "area") return qeq(coef(d), Q(r * r * a, 360)) ? null : "おうぎ形の面積";
      return null;
    }
  };

  // ============================================================
  // 6 空間図形
  // ============================================================
  const KNUM = { 3: ["三", "さん"], 4: ["四", "し"], 5: ["五", "ご"], 6: ["六", "ろっ"], 7: ["七", "なな"], 8: ["八", "はっ"] };
  const MEN = { 4: ["四", "し"], 5: ["五", "ご"], 6: ["六", "ろく"], 7: ["七", "しち"], 8: ["八", "はち"], 9: ["九", "きゅう"], 10: ["十", "じゅう"] };
  const solidName = (n, pyr) => `{${KNUM[n][0]}角${pyr ? "錐" : "柱"}|${KNUM[n][1]}かく${pyr ? "すい" : "ちゅう"}}`;
  const REG = [["四", "し", 4, 6, 4, "正三角形", 3], ["六", "ろく", 6, 12, 8, "正方形", 3], ["八", "はち", 8, 12, 6, "正三角形", 4], ["十二", "じゅうに", 12, 30, 20, "正五角形", 3], ["二十", "にじゅう", 20, 30, 12, "正三角形", 5]];
  const regName = (r) => `{正${r[0]}面体|せい${r[1]}めんたい}`;
  Object.assign(RUBY, { 正五角形: "せいごかくけい", 集まる: "{集|あつ}まる" });
  const polyhedron = {
    id: "c1.polyhedron",
    instruction: R("次の問いに答えましょう。"),
    defaults: { types: ["prism", "pyramid"] },
    levels: lv({ types: ["prism", "pyramid"] }, { types: ["prism", "pyramid", "reg", "hedron"] }, { types: ["reg", "hedron", "regFace", "regVertex", "pyramid"] }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx);
      const what = rng.pick(["面", "辺", "頂点"]);
      if (type === "prism" || type === "pyramid") {
        const n = rng.int(3, 8), pyr = type === "pyramid";
        const v = pyr ? { 面: n + 1, 辺: 2 * n, 頂点: n + 1 }[what] : { 面: n + 2, 辺: 3 * n, 頂点: 2 * n }[what];
        return { key: `ph:${type}:${n}:${what}`, text: `${solidName(n, pyr)}${R(`の${what}の数`)}`, answer: { display: String(v) }, workspace: { type: "none" }, meta: { type, n, what, v } };
      }
      if (type === "reg") {
        const r = rng.pick(REG), v = { 面: r[2], 辺: r[3], 頂点: r[4] }[what];
        return { key: `ph:reg:${r[0]}:${what}`, text: `${regName(r)}${R(`の${what}の数`)}`, answer: { display: String(v) }, workspace: { type: "none" }, meta: { type, what, v } };
      }
      if (type === "hedron") {
        const n = rng.int(3, 8), pyr = rng.chance(0.5), f = pyr ? n + 1 : n + 2;
        return { key: `ph:h:${n}:${pyr}`, text: `${solidName(n, pyr)}${R("は何面体ですか。")}`, answer: { display: `{${MEN[f][0]}面体|${MEN[f][1]}めんたい}` }, workspace: { type: "none" }, meta: { type, n, pyr, f } };
      }
      if (type === "regFace") {
        const shape = rng.pick(["正三角形", "正方形", "正五角形"]);
        const list = REG.filter((r) => r[5] === shape).map(regName);
        return { key: `ph:rf:${shape}`, text: R(`面の形が${shape}である正多面体を全部`), answer: { display: list.join("，") }, workspace: { type: "none" }, meta: { type } };
      }
      const k = rng.pick([3, 4, 5]);
      const list = REG.filter((r) => r[6] === k).map(regName);
      return { key: `ph:rv:${k}`, text: R(`1つの頂点に集まる面の数が${k}である正多面体を全部`), answer: { display: list.join("，") }, workspace: { type: "none" }, meta: { type } };
    },
    verify(pr) {
      const m = pr.meta;
      if (m.type === "prism" || m.type === "pyramid") {
        const F = m.type === "prism" ? m.n + 2 : m.n + 1, E = m.type === "prism" ? 3 * m.n : 2 * m.n, Vt = m.type === "prism" ? 2 * m.n : m.n + 1;
        if (F - E + Vt !== 2) return "オイラーの式";
        return { 面: F, 辺: E, 頂点: Vt }[m.what] === m.v ? null : "数が合わない";
      }
      return null;
    }
  };

  // 直方体 ABCD-EFGH(上の面 ABCD、A の真下が E)
  const CUBE = { A: [0, 0, 1], B: [1, 0, 1], C: [1, 1, 1], D: [0, 1, 1], E: [0, 0, 0], F: [1, 0, 0], G: [1, 1, 0], H: [0, 1, 0] };
  const EDGES = ["AB", "BC", "CD", "AD", "EF", "FG", "GH", "EH", "AE", "BF", "CG", "DH"];
  const FACES = ["ABCD", "EFGH", "ABFE", "BCGF", "CDHG", "ADHE"];
  const vsub = (a, b) => a.map((v, i) => v - b[i]);
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const isZero = (v) => v.every((x) => Math.abs(x) < 1e-9);
  const edir = (e) => vsub(CUBE[e[1]], CUBE[e[0]]);
  const fnorm = (f) => cross(vsub(CUBE[f[1]], CUBE[f[0]]), vsub(CUBE[f[3]], CUBE[f[0]]));
  const shares = (e1, e2) => [...e1].some((c) => e2.includes(c));
  const inFace = (e, f) => [...e].every((c) => f.includes(c));
  const REL = {
    parEdge: { t: (e) => `辺${e}と平行な辺`, f: (e) => EDGES.filter((x) => x !== e && isZero(cross(edir(x), edir(e)))), lv: 1, kind: "e" },
    perpEdge: { t: (e) => `辺${e}と垂直に交わる辺`, f: (e) => EDGES.filter((x) => x !== e && shares(x, e) && Math.abs(dot3(edir(x), edir(e))) < 1e-9), lv: 1, kind: "e" },
    skew: { t: (e) => `辺${e}とねじれの位置にある辺`, f: (e) => EDGES.filter((x) => !shares(x, e) && !isZero(cross(edir(x), edir(e)))), lv: 2, kind: "e" },
    faceParEdge: { t: (f) => `面${f}と平行な辺`, f: (f) => EDGES.filter((x) => !inFace(x, f) && Math.abs(dot3(edir(x), fnorm(f))) < 1e-9 && ![...x].some((c) => f.includes(c))), lv: 2, kind: "f" },
    facePerpEdge: { t: (f) => `面${f}と垂直な辺`, f: (f) => EDGES.filter((x) => isZero(cross(edir(x), fnorm(f)))), lv: 1, kind: "f" },
    parFace: { t: (f) => `面${f}と平行な面`, f: (f) => FACES.filter((x) => x !== f && isZero(cross(fnorm(x), fnorm(f)))), lv: 1, kind: "f", face: true },
    perpFace: { t: (f) => `面${f}と垂直な面`, f: (f) => FACES.filter((x) => Math.abs(dot3(fnorm(x), fnorm(f))) < 1e-9), lv: 3, kind: "f", face: true }
  };
  function cuboidFig() {
    const W = 46, Dp = 26, Hh = 30, k = 0.5, th = rad(35);
    const P = (c) => {
      const [x, y, z] = CUBE[c];
      return [10 + x * W + y * Dp * k * Math.cos(th), 8 + Dp * k * Math.sin(th) + (1 - z) * Hh - y * Dp * k * Math.sin(th)];
    };
    const items = [];
    for (const e of EDGES) {
      const [a, b] = [P(e[0]), P(e[1])], hidden = e.includes("H");
      items.push(L_(a[0], a[1], b[0], b[1], { w: 0.55, dash: hidden ? "dash" : void 0 }));
    }
    const OFF = { A: [-3.4, 1.3], B: [2.6, 4.4], C: [3.2, -1], D: [-3, -1.2], E: [-3.4, 3.4], F: [1, 5.2], G: [3.4, 2.4], H: [2.8, -1.4] };
    for (const c of Object.keys(CUBE)) {
      const [x, y] = P(c);
      items.push(T_(x + OFF[c][0], y + OFF[c][1], c, 3.6, { bold: true }));
    }
    return draw(10 + W + Dp * k * Math.cos(th) + 10, 8 + Dp * k * Math.sin(th) + Hh + 8, items);
  }
  const cuboidRelation = {
    id: "c1.cuboidRelation",
    instruction: null,
    defaults: { max: 1 },
    levels: lv({ max: 1 }, { max: 2 }, { max: 3 }),
    generate(rng, p) {
      const kinds = rng.shuffle(Object.keys(REL).filter((k) => REL[k].lv <= p.max));
      const chosen = [];
      for (const k of kinds) {
        if (chosen.length === 3) break;
        if (chosen.some((c) => REL[c].face && REL[k].face)) continue;
        chosen.push(k);
      }
      const qs2 = [], ans = [], meta = [];
      for (const k of chosen) {
        const r = REL[k], ref = r.kind === "e" ? rng.pick(EDGES) : rng.pick(FACES);
        const res = r.f(ref).map((x) => (r.face ? "面" : "辺") + x);
        qs2.push(R(r.t(ref)));
        ans.push(R(res.join("，")));
        meta.push({ k, ref, n: res.length });
      }
      return {
        key: `cr:${meta.map((m) => m.k + m.ref).join()}`,
        text: `${R("下の直方体について、次の辺や面を全部答えましょう。")}[[br]]${qs2.map((q, i) => `(${i + 1}) ${q}`).join("[[br]]")}`,
        figure: cuboidFig(),
        answer: { display: ans.map((a, i) => `(${i + 1}) ${a}`).join("　") },
        workspace: { type: "lines", labels: qs2.map((_, i) => `(${i + 1})`) },
        side: true,
        meta
      };
    },
    verify(pr) {
      const want = { parEdge: 3, perpEdge: 4, skew: 4, faceParEdge: 4, facePerpEdge: 4, parFace: 1, perpFace: 4 };
      for (const m of pr.meta) if (m.n !== want[m.k]) return `数が合わない ${m.k} ${m.ref} ${m.n}`;
      return null;
    }
  };

  const TRIPLES = [[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13]];
  const rotationSolid = {
    id: "c1.rotationSolid",
    instruction: null,
    defaults: { surf: false },
    levels: lv({ surf: false }, { surf: false }, { surf: true }),
    generate(rng, p, ctx) {
      const type = ctx && Number.isInteger(ctx.index) ? ["rect", "tri", "semi"][(ctx.index + rng.int(0, 2)) % 3] : rng.pick(["rect", "tri", "semi"]);
      const ax = 24, top = 8, sc = 3.2, items = [];
      let r, h, l, name, vol, surf, H;
      if (type === "rect") {
        r = rng.int(2, 6);
        h = rng.int(3, 9);
        name = "円柱";
        vol = Q(r * r * h);
        surf = Q(2 * r * r + 2 * r * h);
      } else if (type === "tri") {
        [r, h, l] = rng.pick(TRIPLES);
        name = "円錐";
        vol = Q(r * r * h, 3);
        surf = Q(r * r + r * l);
      } else {
        r = rng.int(2, 6);
        h = 2 * r;
        name = "球";
        vol = Q(4 * r * r * r, 3);
        surf = Q(4 * r * r);
      }
      const k = Math.min(44 / h, 32 / r);
      H = h * k;
      const R2 = r * k, bot = top + H;
      items.push(L_(ax, top - 6, ax, bot + 6, { w: 0.4, dash: "dashdot" }), T_(ax - 3, top - 3, "ℓ", 3.8, { bold: true }));
      if (type === "rect") {
        items.push({ t: "poly", pts: [[ax, top], [ax + R2, top], [ax + R2, bot], [ax, bot]], w: 0.7, fill: "light" });
        items.push(T_(ax + R2 / 2, bot + 5, `${r}cm`, 3.4), T_(ax + R2 + 2, (top + bot) / 2 + 1.2, `${h}cm`, 3.4, { anchor: "start" }));
      } else if (type === "tri") {
        items.push({ t: "poly", pts: [[ax, top], [ax + R2, bot], [ax, bot]], w: 0.7, fill: "light" });
        items.push({ t: "poly", open: true, pts: [[ax, bot - 2.4], [ax + 2.4, bot - 2.4], [ax + 2.4, bot]], w: 0.3 });
        items.push(T_(ax + R2 / 2, bot + 5, `${r}cm`, 3.4), T_(ax - 2, (top + bot) / 2 + 1.2, `${h}cm`, 3.4, { anchor: "end" }));
        if (p.surf) items.push(T_(ax + R2 / 2 + 2.5, (top + bot) / 2, `${l}cm`, 3.4, { anchor: "start" }));
      } else {
        items.push({ t: "path", d: `M${ax} ${top}A${R2} ${R2} 0 0 1 ${ax} ${bot}Z`, w: 0.7, fill: "light" });
        items.push(L_(ax, (top + bot) / 2, ax + R2, (top + bot) / 2, { w: 0.35 }), T_(ax + R2 / 2, (top + bot) / 2 + 4.6, `${r}cm`, 3.4));
      }
      const qs2 = [R("何という立体ができますか。"), R("体積を求めましょう。")];
      const ans = [R(name), `${piTex(vol)}cm³`];
      if (p.surf) {
        qs2.push(R("表面積を求めましょう。"));
        ans.push(`${piTex(surf)}cm²`);
      }
      return {
        key: `rs:${type}:${r}:${h}`,
        softKey: type,
        text: `${R("下の図形を、直線ℓを軸として1回転させてできる立体について答えましょう。円周率はπとします。")}[[br]]${qs2.map((q, i) => `(${i + 1}) ${q}`).join("[[br]]")}`.replace("1{回転|かいてん}", "{1回転|いっかいてん}"),
        figure: draw(ax + R2 + 18, bot + 9, items),
        answer: { display: ans.map((a, i) => `(${i + 1}) ${a}`).join("　") },
        workspace: { type: "lines", labels: qs2.map((_, i) => `(${i + 1})`) },
        side: true,
        meta: { type, r, h, l, vol, surf }
      };
    },
    verify(pr) {
      const { type, r, h, l, vol } = pr.meta;
      if (type === "tri" && r * r + h * h !== l * l) return "三平方";
      const want = type === "rect" ? r * r * h : type === "tri" ? r * r * h / 3 : 4 * r ** 3 / 3;
      return Math.abs(qv(vol) - want) < 1e-9 ? null : "体積";
    }
  };
  Object.assign(RUBY, { 半球: "はんきゅう", 何という: "{何|なん}という" });
  const VOLS = {
    prism: (rng) => {
      const S = rng.int(6, 40), h = rng.int(3, 12), n = rng.int(3, 6);
      return [`底面積が${S}cm²、高さが${h}cmの${solidName(n, false)}`, Q(S * h), false];
    },
    cyl: (rng) => {
      const r = rng.int(2, 8), h = rng.int(2, 12);
      return [`底面の半径が${r}cm、高さが${h}cmの円柱`, Q(r * r * h), true];
    },
    triPyr: (rng) => {
      const S = rng.int(4, 30), h = rng.int(3, 12);
      if (S * h % 3) return null;
      return [`底面積が${S}cm²、高さが${h}cmの${solidName(3, true)}`, Q(S * h, 3), false];
    },
    cone: (rng) => {
      const r = rng.int(2, 9), h = rng.int(3, 12);
      return [`底面の半径が${r}cm、高さが${h}cmの円錐`, Q(r * r * h, 3), true];
    },
    sqPyr: (rng) => {
      const a = rng.int(2, 10), h = rng.int(3, 12);
      if (a * a * h % 3) return null;
      return [`底面が1辺${a}cmの正方形で、高さが${h}cmの正四角錐`, Q(a * a * h, 3), false];
    },
    sphere: (rng) => {
      const r = rng.int(1, 9);
      return [`半径${r}cmの球`, Q(4 * r ** 3, 3), true];
    },
    hemi: (rng) => {
      const r = rng.int(2, 9);
      return [`半径${r}cmの半球`, Q(2 * r ** 3, 3), true];
    }
  };
  const solidVol = {
    id: "c1.solidVol",
    instruction: R("次の立体の体積を求めましょう。円周率は") + "π" + R("とします。"),
    defaults: { types: ["prism", "cyl", "triPyr", "cone"] },
    levels: lv({ types: ["prism", "cyl", "triPyr", "cone"] }, { types: ["cyl", "cone", "sqPyr", "sphere"] }, { types: ["cone", "sphere", "hemi", "sqPyr"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 200; t++) {
        const type = typeOf(rng, p, ctx && { index: ctx.index + t });
        const r = VOLS[type](rng);
        if (!r) continue;
        const [txt, v, pi] = r;
        const text = R(txt.replace("1辺", "1{辺|ぺん}"));
        return { key: `sv:${text}`, text, wide: true, answer: { display: `${pi ? piTex(v) : absTex(v)}cm³` }, workspace: { type: "none" }, meta: { type, v } };
      }
      throw new Error("体積の問題が作れない");
    }
  };
  const SURFS = {
    cube: (rng) => {
      const a = rng.int(2, 9);
      return [`1辺が${a}cmの立方体`, Q(6 * a * a), false];
    },
    cuboid: (rng) => {
      const a = rng.int(2, 9), b = rng.int(2, 9), c = rng.int(2, 9);
      if (a === b || b === c) return null;
      return [`縦${a}cm、横${b}cm、高さ${c}cmの直方体`, Q(2 * (a * b + b * c + c * a)), false];
    },
    cyl: (rng) => {
      const r = rng.int(2, 7), h = rng.int(2, 10);
      return [`底面の半径が${r}cm、高さが${h}cmの円柱`, Q(2 * r * r + 2 * r * h), true];
    },
    sqPyr: (rng) => {
      const a = rng.int(2, 10), s = rng.int(3, 12);
      return [`底面が1辺${a}cmの正方形で、側面の三角形の高さが${s}cmの正四角錐`, Q(a * a + 2 * a * s), false];
    },
    cone: (rng) => {
      const r = rng.int(2, 6), l = rng.int(r + 2, 15);
      return [`底面の半径が${r}cm、母線の長さが${l}cmの円錐`, Q(r * r + r * l), true];
    },
    sphere: (rng) => {
      const r = rng.int(1, 9);
      return [`半径${r}cmの球`, Q(4 * r * r), true];
    },
    coneLat: (rng) => {
      const r = rng.int(2, 6), l = rng.int(r + 2, 15);
      return [`底面の半径が${r}cm、母線の長さが${l}cmの円錐の側面積`, Q(r * l), true, true];
    },
    coneAngle: (rng) => {
      const r = rng.int(2, 6), l = rng.int(r + 2, 15);
      if (360 * r % l) return null;
      return [`底面の半径が${r}cm、母線の長さが${l}cmの円錐の展開図で、側面のおうぎ形の中心角`, Q(360 * r / l), false, true, "°"];
    }
  };
  const solidSurf = {
    id: "c1.solidSurf",
    instruction: R("次の問いに答えましょう。円周率は") + "π" + R("とします。"),
    defaults: { types: ["cube", "cuboid", "cyl"] },
    levels: lv({ types: ["cube", "cuboid", "cyl"] }, { types: ["cyl", "sqPyr", "cone", "sphere"] }, { types: ["cone", "coneLat", "coneAngle", "sqPyr", "sphere"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 200; t++) {
        const type = typeOf(rng, p, ctx && { index: ctx.index + t });
        const r = SURFS[type](rng);
        if (!r) continue;
        const [txt, v, pi, own, unit] = r;
        const text = R((own ? txt : `${txt}の表面積`).replace("1辺", "1{辺|ぺん}"));
        return { key: `ss:${text}`, text, wide: true, answer: { display: `${pi ? piTex(v) : absTex(v)}${unit || "cm²"}` }, workspace: { type: "none" }, meta: { type, v } };
      }
      throw new Error("表面積の問題が作れない");
    }
  };
