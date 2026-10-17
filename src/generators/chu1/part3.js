
  // ============================================================
  // 4 比例と反比例
  // ============================================================
  const ys = V("y");
  const propTex = (a) => `${ys}＝${coefTex(a)}${xs}`;
  const invTex = (a) => `${ys}＝${a < 0 ? "－" : ""}[[f:${Math.abs(a)}/x]]`;
  const INV_A = [6, 8, 12, 18, 24, 36, -6, -8, -12, -18, -24, -36];
  const divisorsOf = (a) => {
    const out = [];
    for (let d = 1; d <= Math.abs(a); d++) if (a % d === 0) out.push(d, -d);
    return out;
  };
  const propFormula = {
    id: "c1.propFormula",
    instruction: R("次の問いに答えましょう。"),
    defaults: { types: ["prop", "inv"] },
    levels: lv({ types: ["prop", "inv", "propVal"] }, { types: ["prop", "inv", "propVal", "invVal"] }, { types: ["frac", "invVal", "xFromY", "propVal", "inv"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 200; t++) {
        const type = typeOf(rng, p, ctx && { index: ctx.index + t });
        const inv = type === "inv" || type === "invVal";
        let a, x0, y0, x1, y1;
        if (inv) {
          a = rng.pick(INV_A);
          x0 = rng.pick(divisorsOf(a).filter((d) => Math.abs(d) < Math.abs(a)));
          y0 = a / x0;
          x1 = rng.pick(divisorsOf(a).filter((d) => d !== x0));
          y1 = a / x1;
        } else {
          a = type === "frac" ? Q(nz(rng, -5, 5), rng.pick([2, 3, 4, 5])) : Q(nz(rng, -6, 6));
          if (type === "frac" && isInt(a)) continue;
          const den = a[1];
          x0 = den * nz(rng, -4, 4);
          y0 = qv(qm(a, Q(x0)));
          x1 = den * nz(rng, -5, 5);
          y1 = qv(qm(a, Q(x1)));
          if (x0 === x1) continue;
        }
        const given = `${xs}＝${num(Q(x0))}のとき${ys}＝${num(Q(y0))}`;
        const rel = inv ? R("反比例し") : R("比例し");
        let ask, ans;
        if (type === "prop" || type === "frac") {
          ask = R(`${ys}を${xs}の式で表しましょう。`);
          ans = propTex(a);
        } else if (type === "inv") {
          ask = R(`${ys}を${xs}の式で表しましょう。`);
          ans = invTex(a);
        } else if (type === "xFromY") {
          ask = R(`${ys}＝${num(Q(y1))}のときの${xs}の値を求めましょう。`);
          ans = `${xs}＝${num(Q(x1))}`;
          if (!y1) continue;
        } else {
          ask = R(`${xs}＝${num(Q(x1))}のときの${ys}の値を求めましょう。`);
          ans = `${ys}＝${num(Q(y1))}`;
        }
        const text = `${ys}${R("は")}${xs}${R("に")}${rel}、${given}${R("です。")}${ask}`;
        return { key: `pf:${text}`, text, wide: true, answer: { display: ans }, workspace: { type: "none" }, meta: { type, inv, a, x0, y0, x1, y1 } };
      }
      throw new Error("比例・反比例の式の問題が作れない");
    },
    verify(pr) {
      const m = pr.meta, a = m.inv ? Q(m.a) : m.a;
      const f = (x) => m.inv ? Q(m.a, x) : qm(a, Q(x));
      if (!qeq(f(m.x0), Q(m.y0))) return "与えた値が合わない";
      if (/値/.test(pr.text) && !qeq(f(m.x1), Q(m.y1))) return "答えの値が合わない";
      return null;
    }
  };

  const propTable = {
    id: "c1.propTable",
    instruction: null,
    defaults: { types: ["prop"], frac: false },
    levels: lv({ types: ["prop"], frac: false }, { types: ["prop", "inv"], frac: false }, { types: ["prop", "inv"], frac: true }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx);
      for (let t = 0; t < 200; t++) {
        let xsv, f, a, formula;
        if (type === "inv") {
          a = rng.pick([12, 24, -12, -24]);
          xsv = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
          f = (x) => x === 0 ? null : a / x;
          formula = invTex(a);
        } else if (p.frac && rng.chance(0.6)) {
          a = Q(nz(rng, -5, 5), 3);
          if (isInt(a)) continue;
          xsv = [-9, -6, -3, 0, 3, 6, 9];
          f = (x) => qv(qm(a, Q(x)));
          formula = propTex(a);
        } else {
          a = Q(nz(rng, -5, 5));
          xsv = [-3, -2, -1, 0, 1, 2, 3];
          f = (x) => qv(qm(a, Q(x)));
          formula = propTex(a);
        }
        const ysv = xsv.map(f);
        const idx = xsv.map((x, i) => i).filter((i) => xsv[i] !== 0);
        const show = new Set(rng.shuffle(idx).slice(0, type === "inv" ? 1 : 2));
        if (type !== "inv" && rng.chance(0.5)) show.add(xsv.indexOf(0));
        const cell = (v) => v === null ? "×" : num(Q(v));
        const head = [xs, ...xsv.map((x) => num(Q(x)))];
        const row = [ys, ...ysv.map((v, i) => v === null ? "×" : show.has(i) ? cell(v) : "")];
        const full = [ys, ...ysv.map(cell)];
        const text = R(`${ys}は${xs}に${type === "inv" ? "反比例" : "比例"}しています。表のあいているところに数を入れ、${ys}を${xs}の式で表しましょう。`);
        return {
          key: `pt:${type}:${row.join(",")}`,
          text,
          figure: { type: "table", head, rows: [row] },
          answer: { display: `${R("式")} ${formula}`, figure: { type: "table", head, rows: [full] } },
          workspace: { type: "lines", labels: [R("式")] },
          meta: { type, a, xsv, ysv }
        };
      }
      throw new Error("比例の表の問題が作れない");
    },
    verify(pr) {
      const m = pr.meta;
      for (let i = 0; i < m.xsv.length; i++) {
        const x = m.xsv[i], y = m.ysv[i];
        if (m.type === "inv" ? x === 0 ? y !== null : x * y !== m.a : Math.abs(y - qv(m.a) * x) > 1e-9) return "表の値が合わない";
        if (y !== null && !Number.isInteger(y)) return "整数でない";
      }
      return null;
    }
  };

  const coordTex = ([x, y]) => `(${num(Q(x))}, ${num(Q(y))})`;
  const ptMark = (P, X, Y, label, color) => [{ t: "dot", x: X(P[0]), y: Y(P[1]), r: 1, color }, T_(X(P[0]) + 2.6, Y(P[1]) - 1.6, label, 3.4, { bold: true, color })];
  const coord = {
    id: "c1.coord",
    instruction: null,
    defaults: { types: ["read", "plot"], axis: false, sym: false },
    levels: lv({ types: ["read", "plot"], axis: false, sym: false }, { types: ["read", "plot"], axis: true, sym: false }, { types: ["read", "plot"], axis: true, sym: true }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx);
      const pl = plane(5, 7);
      for (let t = 0; t < 300; t++) {
        const n = p.sym && type === "read" ? 3 : 4;
        const pts = [];
        const quads = rng.shuffle([[1, 1], [-1, 1], [-1, -1], [1, -1]]);
        for (let i = 0; i < n; i++) {
          if (p.axis && i === n - 1 && rng.chance(0.7)) {
            const v = nz(rng, -5, 5);
            pts.push(rng.chance(0.5) ? [v, 0] : [0, v]);
          } else {
            const [sx, sy] = quads[i % 4];
            pts.push([sx * rng.int(1, 5), sy * rng.int(1, 5)]);
          }
        }
        if (new Set(pts.map(String)).size < n) continue;
        // 点の名前が他の点にかさならないように
        if (pts.some((a, i) => pts.some((b, j) => i !== j && Math.abs(a[0] - b[0]) <= 1 && Math.abs(a[1] - b[1]) <= 1))) continue;
        const names = ALPHA.slice(0, n);
        if (type === "read") {
          let text = R("座標平面上の点A，B，C") + (n === 4 ? R("，Dの座標を答えましょう。") : R("の座標を答えましょう。"));
          const labels = names.slice();
          const ans = pts.map((P, i) => `${names[i]}${coordTex(P)}`);
          let sym = null;
          if (p.sym) {
            const kind = rng.pick(["x", "y", "o"]);
            sym = kind === "x" ? [pts[0][0], -pts[0][1]] : kind === "y" ? [-pts[0][0], pts[0][1]] : [-pts[0][0], -pts[0][1]];
            text += `[[br]]${R(`また、点Aと${kind === "o" ? "原点" : `${V(kind)}軸`}について対称な点Dの座標を答えましょう。`)}`;
            labels.push("D");
            ans.push(`D${coordTex(sym)}`);
          }
          return {
            key: `co:r:${pts}`,
            text,
            figure: draw(pl.w, pl.h, [...pl.items, ...pts.flatMap((P, i) => ptMark(P, pl.X, pl.Y, names[i]))]),
            answer: { display: ans.join("　") },
            workspace: { type: "lines", labels },
            side: true,
            meta: { type, pts, sym }
          };
        }
        return {
          key: `co:p:${pts}`,
          text: `${R("次の点を、座標平面上にかきましょう。")}[[br]]${pts.map((P, i) => `${names[i]}${coordTex(P)}`).join("　")}`,
          figure: draw(pl.w, pl.h, pl.items),
          answer: { display: R("図のとおり"), figure: draw(pl.w, pl.h, [...pl.items, ...pts.flatMap((P, i) => ptMark(P, pl.X, pl.Y, names[i], RED))]) },
          workspace: { type: "none" },
          meta: { type, pts }
        };
      }
      throw new Error("座標の問題が作れない");
    },
    verify(pr) {
      const fig = pr.meta.type === "read" ? pr.figure : pr.answer.figure;
      const dots = fig.items.filter((it) => it.t === "dot");
      const O = 8 + 5 * 7;
      for (let i = 0; i < dots.length; i++) {
        const [x, y] = pr.meta.pts[i];
        if (Math.abs((dots[i].x - O) / 7 - x) > 1e-6 || Math.abs((O - dots[i].y) / 7 - y) > 1e-6) return "点の位置がずれている";
      }
      return null;
    }
  };

  // グラフ:比例は格子点を通る直線、反比例は双曲線
  const SLOPES = { basic: [1, 2, 3, -1, -2, -3], normal: [1, 2, 3, -1, -2, -3, [1, 2], [-1, 2], [1, 3], [-1, 3]], challenge: [[2, 3], [-2, 3], [3, 2], [-3, 2], [1, 2], [-1, 2], [3, 4], [-3, 4], [4, 3], [-4, 3]] };
  function lineItems(pl, a, n, o = {}) {
    const k = qv(a), xm = Math.min(n, n / Math.abs(k));
    return [L_(pl.X(-xm), pl.Y(-k * xm), pl.X(xm), pl.Y(k * xm), { w: 0.7, ...o })];
  }
  function hypItems(pl, a, n, o = {}) {
    const lim = n + 0.4, out = [];
    for (const sg of [1, -1]) {
      let d = "";
      const x0 = Math.abs(a) / lim;
      for (let i = 0; i <= 60; i++) {
        const x = sg * (x0 + (lim - x0) * i / 60), y = a / x;
        d += `${i ? "L" : "M"}${pl.X(x).toFixed(2)} ${pl.Y(y).toFixed(2)}`;
      }
      out.push({ t: "path", d, w: 0.7, ...o });
    }
    return out;
  }
  // 直線の名前(①など)を、線の右はしの近くで線からはなしておく
  function lineLabel(pl, a, n, s, color) {
    const k = qv(a), xm = Math.min(n, n / Math.abs(k)) * 0.78, l = Math.hypot(1, k);
    const px = pl.X(xm), py = pl.Y(k * xm), nx = (k > 0 ? 1 : -1) * k / l, ny = (k > 0 ? 1 : -1) * 1 / l;
    return T_(px + nx * 4.2, py + ny * 4.2 + 1.3, s, 3.8, { bold: true, color });
  }
  const graphEq = {
    id: "c1.graphEq",
    instruction: null,
    defaults: { types: ["read", "draw"], slopes: "basic" },
    levels: lv({ types: ["read", "draw"], slopes: "basic" }, { types: ["read", "draw"], slopes: "normal" }, { types: ["read", "draw", "readInv"], slopes: "challenge" }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx), n = 5, pl = plane(n, 7);
      const pool = SLOPES[p.slopes].map((s) => Array.isArray(s) ? Q(s[0], s[1]) : Q(s));
      for (let t = 0; t < 200; t++) {
        const a1 = rng.pick(pool.filter((a) => a[0] > 0)), a2 = rng.pick(pool.filter((a) => a[0] < 0));
        const pair = rng.chance(0.5) ? [a1, a2] : [a2, a1];
        if (type === "readInv") {
          const a = rng.pick([4, 6, -4, -6, 8, -8]), la = pair[0];
          const lab = (k, x, y) => T_(pl.X(x), pl.Y(y), k, 3.8, { bold: true });
          const hx = a > 0 ? 4.4 : -4.4;
          const items = [...pl.items, ...lineItems(pl, la, n), ...hypItems(pl, a, n), lineLabel(pl, la, n, "①"), lab("②", hx, a / hx + (a > 0 ? 1 : -1) * 0.9)];
          return {
            key: `ge:i:${la}:${a}`,
            text: R("①は比例、②は反比例のグラフです。それぞれ") + `${ys}${R("を")}${xs}${R("の式で表しましょう。")}`,
            figure: draw(pl.w, pl.h, items),
            answer: { display: `① ${propTex(la)}　② ${invTex(a)}` },
            workspace: { type: "lines", labels: ["①", "②"] },
            side: true,
            meta: { type, as: [la], inv: a }
          };
        }
        if (type === "read") {
          const items = [...pl.items];
          pair.forEach((a, i) => {
            items.push(...lineItems(pl, a, n), lineLabel(pl, a, n, MARU[i]));
          });
          return {
            key: `ge:r:${pair}`,
            text: `${R("①，②のグラフの式を求めましょう。")}`,
            figure: draw(pl.w, pl.h, items),
            answer: { display: pair.map((a, i) => `${MARU[i]} ${propTex(a)}`).join("　") },
            workspace: { type: "lines", labels: ["①", "②"] },
            side: true,
            meta: { type, as: pair }
          };
        }
        const red = [];
        pair.forEach((a, i) => {
          red.push(...lineItems(pl, a, n, { color: RED }), lineLabel(pl, a, n, MARU[i], RED));
        });
        return {
          key: `ge:d:${pair}`,
          text: `${R("次のグラフをかきましょう。")}[[br]]${pair.map((a, i) => `${MARU[i]} ${propTex(a)}`).join("　　")}`,
          figure: draw(pl.w, pl.h, pl.items),
          answer: { display: R("図のとおり"), figure: draw(pl.w, pl.h, [...pl.items, ...red]) },
          workspace: { type: "none" },
          meta: { type, as: pair }
        };
      }
      throw new Error("グラフの問題が作れない");
    },
    verify(pr) {
      const fig = pr.meta.type === "draw" ? pr.answer.figure : pr.figure;
      const lines = fig.items.filter((it) => it.t === "line" && it.w === 0.7);
      if (lines.length !== pr.meta.as.length) return "直線の数";
      const O = 43;
      for (let i = 0; i < lines.length; i++) {
        const l = lines[i], k = -(l.y2 - l.y1) / (l.x2 - l.x1);
        if (Math.abs(k - qv(pr.meta.as[i])) > 1e-6) return "かたむきが合わない";
        if (Math.abs((l.x1 + l.x2) / 2 - O) > 1e-6 || Math.abs((l.y1 + l.y2) / 2 - O) > 1e-6) return "原点を通らない";
      }
      return null;
    }
  };

  const PW = [
    { k: "prop", t: "1mの重さが{a}gの針金があります。この針金{x}mの重さを{y}gとします。", a: [20, 25, 30, 40, 50] },
    { k: "prop", t: "水そうに毎分{a}Lずつ水を入れます。水を入れ始めてから{x}分後の水の量を{y}Lとします。", a: [2, 3, 4, 5, 6, 8] },
    { k: "prop", t: "時速{a}kmで走る自動車が、{x}時間に進む道のりを{y}kmとします。", a: [40, 50, 60, 80] },
    { k: "prop", t: "1{本|ぽん}{a}円の鉛筆を{x}本買ったときの代金を{y}円とします。", a: [60, 70, 80, 90, 110, 120, 150] },
    { k: "inv", t: "面積が{a}cm²の長方形の縦の長さを{x}cm、横の長さを{y}cmとします。", a: [12, 18, 24, 36, 48] },
    { k: "inv", t: "{a}kmの道のりを、時速{x}kmで進むときにかかる時間を{y}時間とします。", a: [60, 120, 180, 240] },
    { k: "inv", t: "{a}個のあめを、{x}人で同じ数ずつ分けるときの{1人分|ひとりぶん}の個数を{y}個とします。", a: [24, 36, 48, 60] },
    { k: "inv", t: "容積が{a}Lの水そうに、毎分{x}Lずつ水を入れていっぱいにするのにかかる時間を{y}分とします。", a: [60, 120, 240, 360] }
  ];
  const propWord = {
    id: "c1.propWord",
    instruction: null,
    defaults: { askX: false },
    levels: lv({ askX: false }, { askX: false }, { askX: true }),
    generate(rng, p, ctx) {
      const sc = ctx && Number.isInteger(ctx.index) ? PW[(ctx.index * 3 + rng.int(0, 1)) % PW.length] : rng.pick(PW);
      const a = rng.pick(sc.a);
      const f = (x) => sc.k === "inv" ? a / x : a * x;
      const xc = sc.k === "inv" ? divisorsOf(a).filter((d) => d > 1 && d < a) : [2, 3, 4, 5, 6, 7, 8, 9, 10, 12];
      const x1 = rng.pick(xc);
      const x2 = rng.pick(xc.filter((v) => v !== x1));
      const qs2 = [R(`${ys}を${xs}の式で表しましょう。`), R(`${ys}は${xs}に比例しますか、反比例しますか。`), R(`${xs}＝${x1}のときの${ys}の値を求めましょう。`)];
      const ans = [sc.k === "inv" ? invTex(a) : propTex(Q(a)), R(sc.k === "inv" ? "反比例する" : "比例する"), `${ys}＝${f(x1)}`];
      if (p.askX) {
        qs2.push(R(`${ys}＝${f(x2)}のときの${xs}の値を求めましょう。`));
        ans.push(`${xs}＝${x2}`);
      }
      const text = R(sc.t.replace("{a}", a).replace("{x}", xs).replace("{y}", ys));
      return {
        key: `pw:${text}:${x1}:${x2}`,
        softKey: sc.t.slice(0, 6),
        text: `${text}[[br]]${qs2.map((q, i) => `(${i + 1}) ${q}`).join("[[br]]")}`,
        answer: { display: ans.map((s, i) => `(${i + 1}) ${s}`).join("　") },
        workspace: { type: "lines", labels: qs2.map((_, i) => `(${i + 1})`) },
        meta: { k: sc.k, a, x1, x2 }
      };
    },
    verify(pr) {
      const m = pr.meta;
      return m.k === "inv" && a_mod(m.a, m.x1) ? "わり切れない" : null;
    }
  };
  const a_mod = (a, x) => a % x !== 0;
