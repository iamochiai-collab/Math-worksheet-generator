
  // ============================================================
  // 3 一次関数
  // ============================================================
  const lineTex = (a, b) => `${ys}＝${lin(a, b)}`;
  const segOf = (a, b, n) => {
    const k = qv(a), c = qv(b);
    let lo = -n, hi = n;
    if (k !== 0) {
      const x1 = (-n - c) / k, x2 = (n - c) / k;
      lo = Math.max(lo, Math.min(x1, x2));
      hi = Math.min(hi, Math.max(x1, x2));
    }
    return [lo, hi];
  };
  const lineAB = (pl, a, b, n, o = {}) => {
    const [lo, hi] = segOf(a, b, n), k = qv(a), c = qv(b);
    return L_(pl.X(lo), pl.Y(k * lo + c), pl.X(hi), pl.Y(k * hi + c), { w: 0.7, ...o });
  };
  const labelAB = (pl, a, b, n, s, color) => {
    const [lo, hi] = segOf(a, b, n), k = qv(a), c = qv(b), x = lo + (hi - lo) * 0.85, l = Math.hypot(1, k);
    const sg = k >= 0 ? 1 : -1, nx = sg * k / l, ny = sg / l;
    return T_(pl.X(x) + nx * 4.2, pl.Y(k * x + c) + ny * 4.2 + 1.3, s, 3.8, { bold: true, color });
  };
  const SLOPES2 = { basic: [[1], [2], [3], [-1], [-2], [-3]], normal: [[1], [2], [-1], [-2], [1, 2], [-1, 2], [1, 3], [-1, 3], [3, 2], [-3, 2]], challenge: [[2, 3], [-2, 3], [3, 2], [-3, 2], [1, 2], [-1, 2], [3, 4], [-3, 4], [4, 3], [-4, 3]] };
  const linGraph = {
    id: "c2.linGraph",
    instruction: null,
    defaults: { types: ["read", "draw"], slopes: "basic" },
    levels: lv({ types: ["read", "draw"], slopes: "basic" }, { types: ["read", "draw"], slopes: "normal" }, { types: ["read", "draw", "cross"], slopes: "challenge" }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx), n = 5, pl = plane(n, 7);
      const pool = SLOPES2[p.slopes].map((s) => Q(...s));
      for (let t = 0; t < 400; t++) {
        const a1 = rng.pick(pool.filter((a) => a[0] > 0)), a2 = rng.pick(pool.filter((a) => a[0] < 0));
        const pair = rng.chance(0.5) ? [a1, a2] : [a2, a1];
        const bs = [nz(rng, -4, 4), nz(rng, -4, 4)].map((v) => Q(v));
        // 格子点を2つ以上通る(読み取れる)こと
        if (pair.some((a, i) => Math.abs(qv(bs[i]) + qv(a) * a[1]) > n || a[1] > n)) continue;
        if (pair.some((a, i) => {
          const [lo, hi] = segOf(a, bs[i], n);
          return hi - lo < 3;
        })) continue;
        const X0 = qd(qs(bs[1], bs[0]), qs(pair[0], pair[1])), Y0 = qa(qm(pair[0], X0), bs[0]);
        if (type === "cross" && (X0[1] > 6 || Y0[1] > 6 || isInt(X0) && isInt(Y0))) continue;
        const items = [...pl.items], red = [], placed = [];
        let okLab = true;
        pair.forEach((a, i) => {
          const [lo, hi] = segOf(a, bs[i], n), k = qv(a), c = qv(bs[i]);
          const f = [0.85, 0.15, 0.7, 0.3, 0.5].find((fr) => {
            const x = lo + (hi - lo) * fr, y = k * x + c;
            return Math.hypot(x - qv(X0), y - qv(Y0)) > 2 && placed.every(([px, py]) => Math.hypot(x - px, y - py) > 2.2);
          });
          if (f === void 0) okLab = false;
          const fr = f ?? 0.85, x = lo + (hi - lo) * fr, l = Math.hypot(1, k), sg = k >= 0 ? 1 : -1;
          placed.push([x, k * x + c]);
          const lab = T_(pl.X(x) + sg * k / l * 4.2, pl.Y(k * x + c) + sg / l * 4.2 + 1.3, MARU[i], 3.8, { bold: true, color: type === "draw" ? RED : void 0 });
          (type === "draw" ? red : items).push(lineAB(pl, a, bs[i], n, type === "draw" ? { color: RED } : {}), lab);
        });
        if (!okLab) continue;
        const eqs = pair.map((a, i) => lineTex(a, bs[i]));
        const meta = { type, as: pair, bs, X0, Y0 };
        if (type === "draw") {
          return { key: `lg:d:${eqs}`, text: `${R("次の一次関数のグラフをかきましょう。")}[[br]]${eqs.map((e, i) => `${MARU[i]} ${e}`).join("　　")}`, figure: draw(pl.w, pl.h, items), answer: { display: R("図のとおり"), figure: draw(pl.w, pl.h, [...items, ...red]) }, workspace: { type: "none" }, meta };
        }
        if (type === "cross") {
          return { key: `lg:c:${eqs}`, text: R("①，②の直線の式を求めましょう。また、2直線の交点の座標を求めましょう。"), figure: draw(pl.w, pl.h, items), answer: { display: `① ${eqs[0]}　② ${eqs[1]}　${R("交点")} (${num(X0)}, ${num(Y0)})` }, workspace: { type: "lines", labels: ["①", "②", R("交点")] }, side: true, meta };
        }
        return { key: `lg:r:${eqs}`, text: R("①，②の直線の式を求めましょう。"), figure: draw(pl.w, pl.h, items), answer: { display: eqs.map((e, i) => `${MARU[i]} ${e}`).join("　") }, workspace: { type: "lines", labels: ["①", "②"] }, side: true, meta };
      }
      throw new Error("一次関数のグラフの問題が作れない");
    },
    verify(pr) {
      const m = pr.meta, fig = m.type === "draw" ? pr.answer.figure : pr.figure;
      const lines = fig.items.filter((it) => it.t === "line" && it.w === 0.7);
      const O = 8 + 5 * 7;
      for (let i = 0; i < 2; i++) {
        const l = lines[i], k = -(l.y2 - l.y1) / (l.x2 - l.x1);
        if (Math.abs(k - qv(m.as[i])) > 1e-6) return "傾き";
        const xm = (l.x1 - O) / 7, ym = (O - l.y1) / 7;
        if (Math.abs(ym - (qv(m.as[i]) * xm + qv(m.bs[i]))) > 1e-6) return "切片";
      }
      return qeq(qa(qm(m.as[1], m.X0), m.bs[1]), m.Y0) ? null : "交点";
    }
  };

  const ptTex = (x, y) => `(${num(Q(x))}, ${num(Q(y))})`;
  const linFormula = {
    id: "c2.linFormula",
    instruction: R("次の一次関数の式を求めましょう。"),
    defaults: { types: ["intercept", "slopePt"] },
    levels: lv({ types: ["intercept", "slopePt", "slopePt"] }, { types: ["slopePt", "twoPts", "parallel"] }, { types: ["twoPts", "parallel", "fracTwo"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 300; t++) {
        const type = typeOf(rng, p, ctx && { index: ctx.index + t });
        const a = type === "fracTwo" ? Q(nz(rng, -4, 4), rng.pick([2, 3])) : Q(nz(rng, -5, 5)), b = Q(nz(rng, -9, 9));
        if (type === "fracTwo" && isInt(a)) continue;
        const f = (x) => qa(qm(a, Q(x)), b);
        let text;
        if (type === "intercept") text = `${R("傾きが")}${num(a)}${R("で、切片が")}${num(b)}`;
        else if (type === "slopePt") {
          const x0 = nz(rng, -5, 5);
          text = `${R("変化の割合が")}${num(a)}${R("で、")}${xs}＝${num(Q(x0))}${R("のとき")}${ys}＝${num(f(x0))}`;
        } else if (type === "parallel") {
          const x0 = nz(rng, -4, 4), b2 = Q(nz(rng, -6, 6));
          if (qeq(b2, b)) continue;
          text = `${R("グラフが直線")} ${lineTex(a, b2)} ${R("に平行で、点")}${ptTex(x0, qv(f(x0)))}${R("を通る")}`;
        } else {
          const d = a[1], x1 = d * nz(rng, -2, 2), x2 = x1 + d * rng.int(1, 3);
          if (Math.abs(qv(f(x1))) > 15 || Math.abs(qv(f(x2))) > 15) continue;
          text = `${R("グラフが2点")}${ptTex(x1, qv(f(x1)))}，${ptTex(x2, qv(f(x2)))}${R("を通る")}`;
        }
        return { key: `lf:${text}`, text, wide: true, answer: { display: lineTex(a, b) }, workspace: { type: "none" }, meta: { a, b } };
      }
      throw new Error("一次関数の式の問題が作れない");
    }
  };

  const rateChange = {
    id: "c2.rateChange",
    instruction: R("次の問いに答えましょう。"),
    defaults: { types: ["rate", "inc"] },
    levels: lv({ types: ["rate", "inc", "range"] }, { types: ["inc", "range", "yRange"] }, { types: ["range", "yRange", "invRate", "inc"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 300; t++) {
        const type = typeOf(rng, p, ctx && { index: ctx.index + t });
        const a = rng.chance(type === "inc" ? 0.5 : 0.2) ? Q(nz(rng, -5, 5), rng.pick([2, 3])) : Q(nz(rng, -6, 6)), b = Q(nz(rng, -9, 9));
        const f = (x) => qa(qm(a, Q(x)), b), fn = `${R("一次関数")} ${lineTex(a, b)} ${R("で、")}`;
        if (type === "rate") return { key: `rc:r:${a}:${b}`, text: `${R("一次関数")} ${lineTex(a, b)} ${R("の変化の割合")}`, answer: { display: num(a) }, workspace: { type: "none" }, meta: {} };
        if (type === "inc") {
          const dx = a[1] * rng.int(1, 4) * (isInt(a) ? rng.int(1, 3) : 1);
          return { key: `rc:i:${a}:${b}:${dx}`, text: `${fn}${xs}${R("の増加量が")}${dx}${R("のときの")}${ys}${R("の増加量")}`, wide: true, answer: { display: num(qm(a, Q(dx))) }, workspace: { type: "none" }, meta: {} };
        }
        if (type === "range") {
          const x1 = a[1] * nz(rng, -3, 2), x2 = x1 + a[1] * rng.int(1, 3);
          return { key: `rc:g:${a}:${b}:${x1}:${x2}`, text: `${fn}${xs}${R("が")}${num(Q(x1))}${R("から")}${num(Q(x2))}${R("まで増加するときの")}${ys}${R("の増加量")}`, wide: true, answer: { display: num(qs(f(x2), f(x1))) }, workspace: { type: "none" }, meta: {} };
        }
        if (type === "yRange") {
          if (!isInt(a)) continue;
          const x1 = nz(rng, -4, 1), x2 = x1 + rng.int(2, 5);
          const [y1, y2] = [f(x1), f(x2)].sort((u, v) => qv(u) - qv(v));
          return { key: `rc:y:${a}:${b}:${x1}:${x2}`, text: `${fn}${xs}${R("の変域が")} ${num(Q(x1))}≦${xs}≦${num(Q(x2))} ${R("のときの")}${ys}${R("の変域")}`, wide: true, answer: { display: `${num(y1)}≦${ys}≦${num(y2)}` }, workspace: { type: "none" }, meta: {} };
        }
        const k = rng.pick([6, 12, 24, -6, -12, -24]), x1 = rng.pick([1, 2, 3]), x2 = rng.pick([2, 3, 4, 6].filter((v) => v > x1));
        const r = qd(qs(Q(k, x2), Q(k, x1)), Q(x2 - x1));
        return { key: `rc:v:${k}:${x1}:${x2}`, text: `${R("反比例")} ${ys}＝${k < 0 ? "－" : ""}[[f:${Math.abs(k)}/x]] ${R("で、")}${xs}${R("が")}${x1}${R("から")}${x2}${R("まで増加するときの変化の割合")}`, wide: true, answer: { display: num(r) }, workspace: { type: "none" }, meta: {} };
      }
      throw new Error("変化の割合の問題が作れない");
    }
  };
  Object.assign(RUBY, { 増加する: "{増加|ぞうか}する", 増加: "ぞうか", 通る: "{通|とお}る", 直線: "ちょくせん", 点: "てん", 軸: "じく", 方程式: "ほうていしき", 一次関数: "いちじかんすう", 反比例: "はんぴれい", 変化: "へんか", 割合: "わりあい" });

  const intersection = {
    id: "c2.intersection",
    instruction: R("次の2つの直線の交点の座標を求めましょう。"),
    defaults: { types: ["slope"] },
    levels: lv({ types: ["slope"] }, { types: ["slope", "std"] }, { types: ["std", "frac"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 300; t++) {
        const type = typeOf(rng, p, ctx && { index: ctx.index + t });
        const X = nz(rng, -5, 5), Y = nz(rng, -6, 6);
        if (type === "slope") {
          const a1 = nz(rng, -4, 4), a2 = nz(rng, -4, 4);
          if (a1 === a2) continue;
          const b1 = Y - a1 * X, b2 = Y - a2 * X;
          if (Math.abs(b1) > 12 || Math.abs(b2) > 12) continue;
          const e = [lineTex(Q(a1), Q(b1)), lineTex(Q(a2), Q(b2))];
          return { key: `ix:${e}`, text: `${e[0]}，${e[1]}`, answer: { display: ptTex(X, Y) }, workspace: { type: "none" }, meta: { eqs: e.map((s) => s.split("＝")), X, Y } };
        }
        if (type === "frac") {
          const a1 = Q(nz(rng, -3, 3), 2), a2 = Q(nz(rng, -4, 4));
          if (isInt(a1) || X % 2) continue;
          const b1 = qs(Q(Y), qm(a1, Q(X))), b2 = qs(Q(Y), qm(a2, Q(X)));
          const e = [lineTex(a1, b1), lineTex(a2, b2)];
          return { key: `ix:${e}`, text: `${e[0]}，${e[1]}`, answer: { display: ptTex(X, Y) }, workspace: { type: "none" }, meta: { eqs: e.map((s) => s.split("＝")), X, Y } };
        }
        const a = nz(rng, -4, 4), b = nz(rng, -4, 4), c = nz(rng, -4, 4), d = nz(rng, -4, 4);
        if (a * d === b * c) continue;
        const e = [[lin2(a, b), num(Q(a * X + b * Y))], [lin2(c, d), num(Q(c * X + d * Y))]];
        return { key: `ix:${e}`, text: `${e[0].join("＝")}，${e[1].join("＝")}`, answer: { display: ptTex(X, Y) }, workspace: { type: "none" }, meta: { eqs: e, X, Y } };
      }
      throw new Error("交点の問題が作れない");
    },
    verify(pr) {
      const { eqs, X, Y } = pr.meta;
      for (const [l, r] of eqs) if (!qeq(evalQ(l, { x: Q(X), y: Q(Y) }), evalQ(r, { x: Q(X), y: Q(Y) }))) return "交点が合わない";
      return null;
    }
  };

  const eqLine = {
    id: "c2.eqLine",
    instruction: R("次の方程式のグラフについて答えましょう。"),
    defaults: { types: ["std"] },
    levels: lv({ types: ["std", "std", "horiz"] }, { types: ["std", "horiz", "vert"] }, { types: ["std", "std", "horiz", "vert"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 200; t++) {
        const type = typeOf(rng, p, ctx && { index: ctx.index + t });
        if (type === "std") {
          const a = nz(rng, -6, 6), b = nz(rng, -6, 6), c = nz(rng, -12, 12);
          if (Math.abs(b) === 1 && rng.chance(0.5)) continue;
          const eq = `${lin2(a, b)}＝${c}`;
          return { key: `el:${eq}`, text: `${eq} ${R("のグラフの傾きと切片")}`, answer: { display: `${R("傾き")} ${num(Q(-a, b))}，${R("切片")} ${num(Q(c, b))}` }, workspace: { type: "none" }, meta: { eq: [lin2(a, b), String(c)], a: Q(-a, b), b: Q(c, b) } };
        }
        const k = nz(rng, -5, 5), m = nz2(rng, -4, 4), v = type === "horiz" ? ys : xs;
        const eq = `${m < 0 ? "－" : ""}${Math.abs(m)}${v}＝${num(Q(k * m))}`;
        const ans = type === "horiz" ? `${R("点")}(0, ${num(Q(k))})${R("を通り、")}${xs}${R("軸に平行な直線")}` : `${R("点")}(${num(Q(k))}, 0)${R("を通り、")}${ys}${R("軸に平行な直線")}`;
        return { key: `el:${eq}`, text: `${eq} ${R("のグラフは、どんな直線ですか。")}`, wide: true, answer: { display: ans }, workspace: { type: "none" }, meta: {} };
      }
      throw new Error("方程式のグラフの問題が作れない");
    },
    verify(pr) {
      const m = pr.meta;
      if (!m.eq) return null;
      for (const x of [0, 3]) {
        const y = qa(qm(m.a, Q(x)), m.b);
        if (!qeq(evalQ(m.eq[0], { x: Q(x), y }), evalQ(m.eq[1]))) return "傾き・切片が合わない";
      }
      return null;
    }
  };

  const LW = {
    water: (rng) => {
      const a = rng.int(2, 10) * 5, b = rng.int(2, 8), t = rng.int(3, 12), t2 = rng.int(5, 20);
      return { t: `水が${a}L入っている水そうに、毎分${b}Lずつ水を入れます。水を入れ始めてから${xs}分後の水そうの水の量を${ys}Lとします。`, a: Q(b), b: Q(a), q2: [t, `${a + b * t}L`], q3: [`水の量が${a + b * t2}Lになるのは、水を入れ始めてから何分後ですか。`, `${t2}${fun(t2)}{後|ご}`] };
    },
    candle: (rng) => {
      const b = rng.pick([0.5, 1, 1.5, 2]), T = rng.int(6, 20), a = b * T, t = rng.int(1, T - 1);
      if (!Number.isInteger(a)) return null;
      const bq = Q(Math.round(b * 2), 2);
      return { t: `長さ${a}cmのろうそくに火をつけると、毎分${b}cmずつ短くなります。火をつけてから${xs}分後のろうそくの長さを${ys}cmとします。`, a: qneg(bq), b: Q(a), dec: true, q2: [t, `${+(a - b * t).toFixed(1)}cm`], q3: [`ろうそくが燃えつきるのは、火をつけてから何分後ですか。`, `${T}${fun(T)}{後|ご}`] };
    },
    spring: (rng) => {
      const s = rng.pick([0.1, 0.2, 0.25, 0.5]), L0 = rng.int(6, 15), w1 = rng.int(1, 4) * 10, w2 = w1 + rng.int(2, 5) * 10;
      const l1 = L0 + s * w1, l2 = L0 + s * w2;
      if (!Number.isInteger(l1 * 10) || !Number.isInteger(l2 * 10)) return null;
      const w3 = rng.int(5, 10) * 10;
      return { t: `ばねに${xs}gのおもりをつるしたときのばねの長さを${ys}cmとすると、${ys}は${xs}の一次関数になります。${w1}gのおもりをつるすと${+l1.toFixed(2)}cm、${w2}gのおもりをつるすと${+l2.toFixed(2)}cmになりました。`, a: Q(Math.round(s * 100), 100), b: Q(L0), dec: true, q2: [w3, `${+(L0 + s * w3).toFixed(2)}cm`], q3: [`おもりをつるさないときのばねの長さは何cmですか。`, `${L0}cm`] };
    },
    temp: (rng) => {
      const a = rng.int(15, 30), t = rng.int(1, 4), t2 = rng.int(4, 8);
      return { t: `地上の気温が${a}℃のとき、地上から${xs}kmの高さの気温を${ys}℃とします。高さが1km上がるごとに、気温は6℃ずつ下がります。`, a: Q(-6), b: Q(a), q2: [t, `${a - 6 * t}℃`], q3: [`気温が${a - 6 * t2}℃になるのは、地上から何kmの高さですか。`, `${t2}km`] };
    }
  };
  Object.assign(RUBY, { 何分後: "なんぷんご", 分後: "{分後|ふんご}", 水の量: "{水|みず}の{量|りょう}", 何cm: "{何|なん}cm", 何km: "{何|なん}km", ろうそく: "ろうそく", つるした: "つるした", 地上から: "{地上|ちじょう}から", 毎分: "まいふん", 長さ: "{長|なが}さ", 下がります: "{下|さ}がります", 上がる: "{上|あ}がる", ごとに: "ごとに" });
  const linWord = {
    id: "c2.linWord",
    instruction: null,
    defaults: { types: ["water", "candle", "temp"] },
    levels: lv({ types: ["water", "candle", "temp"] }, { types: ["water", "candle", "temp", "spring"] }, { types: ["spring", "candle", "temp", "water"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 100; t++) {
        const type = typeOf(rng, p, ctx && { index: ctx.index + t });
        const r = LW[type](rng);
        if (!r) continue;
        const qs2 = [R(`${ys}を${xs}の式で表しましょう。`), R(`${xs}＝${r.q2[0]}のときの${ys}の値を求めましょう。`), R(r.q3[0])];
        const ans = [`${ys}＝${lin(r.a, r.b, "x", r.dec)}`, R(r.q2[1]), R(r.q3[1])];
        return {
          key: `lw:${r.t}:${r.q2[0]}`,
          softKey: type,
          text: `${R(r.t)}[[br]]${qs2.map((q, i) => `(${i + 1}) ${q}`).join("[[br]]")}`,
          answer: { display: ans.map((a, i) => `(${i + 1}) ${a}`).join("　") },
          workspace: { type: "lines", labels: ["(1)", "(2)", "(3)"] },
          meta: { type }
        };
      }
      throw new Error("一次関数の利用の問題が作れない");
    }
  };
