
  // ============================================================
  // 3 二次方程式
  // ============================================================
  const quadTex = (a, b, c) => polyTex(clean({ xx: Q(a), x: Q(b), "": Q(c) }));
  // ax²＋bx＋c＝0 の解の書き方
  function rootsTex(a, b, c) {
    const D = b * b - 4 * a * c;
    if (D < 0) return null;
    const sd = Math.sqrt(D);
    if (Number.isInteger(sd)) {
      const rs = [...new Set([Q(-b - sd, 2 * a), Q(-b + sd, 2 * a)].map((q) => q.join("/")))].map((k) => Q(...k.split("/").map(Number))).sort((u, v) => qv(u) - qv(v));
      return { tex: rs.map((r) => `${xs}＝${num(r)}`).join("，"), n: rs.length };
    }
    const [s, d] = sqFree(D);
    let p = -b, den = 2 * a;
    const g = gcd(gcd(Math.abs(p), s), Math.abs(den)) || 1;
    p /= g;
    const s2 = s / g;
    den /= g;
    const pm = `${p === 0 ? "" : num(Q(p))}±${s2 === 1 ? "" : s2}${rt(d)}`;
    return { tex: `${xs}＝${den === 1 ? pm : `[[f:${pm}/${den}]]`}`, n: 2 };
  }
  const QS = {
    sqk: (rng) => {
      const k = rng.chance(0.6) ? rng.int(2, 12) ** 2 : rng.pick([2, 3, 5, 6, 7, 8, 12, 18, 20, 27]);
      return { e: [`${xs}²`, String(k)], abc: [1, 0, -k] };
    },
    asq: (rng) => {
      const a = rng.int(2, 5), k = rng.chance(0.5) ? rng.int(1, 6) ** 2 : rng.pick([2, 3, 5, 6]);
      return rng.chance(0.5) ? { e: [`${a}${xs}²`, String(a * k)], abc: [a, 0, -a * k] } : { e: [`${a}${xs}²－${a * k}`, "0"], abc: [a, 0, -a * k] };
    },
    shift: (rng) => {
      const pp = nz(rng, -6, 6), k = rng.chance(0.5) ? rng.int(1, 6) ** 2 : rng.pick([2, 3, 5, 6, 7, 8, 12]);
      return { e: [`(${xs}${pp < 0 ? "－" : "＋"}${Math.abs(pp)})²`, String(k)], abc: [1, 2 * pp, pp * pp - k] };
    },
    fact: (rng) => {
      const r1 = nz(rng, -9, 9), r2 = nz(rng, -9, 9);
      if (r1 === r2) return null;
      return { e: [quadTex(1, -(r1 + r2), r1 * r2), "0"], abc: [1, -(r1 + r2), r1 * r2] };
    },
    zero: (rng) => {
      const b = nz(rng, -9, 9);
      return { e: [quadTex(1, b, 0), "0"], abc: [1, b, 0] };
    },
    dbl: (rng) => {
      const r = nz(rng, -8, 8);
      return { e: [quadTex(1, -2 * r, r * r), "0"], abc: [1, -2 * r, r * r] };
    },
    formula: (rng) => {
      const a = rng.pick([1, 1, 2, 3]), b = nz(rng, -7, 7), c = nz(rng, -6, 6), D = b * b - 4 * a * c;
      if (D <= 0 || Number.isInteger(Math.sqrt(D))) return null;
      return { e: [quadTex(a, b, c), "0"], abc: [a, b, c] };
    },
    formulaQ: (rng) => {
      const a = rng.int(2, 4), b = nz(rng, -9, 9), c = nz(rng, -6, 6), D = b * b - 4 * a * c;
      if (D <= 0 || !Number.isInteger(Math.sqrt(D))) return null;
      const r = rootsTex(a, b, c);
      if (!/f:/.test(r.tex)) return null;
      return { e: [quadTex(a, b, c), "0"], abc: [a, b, c] };
    },
    rearr: (rng) => {
      const r1 = nz(rng, -7, 7), r2 = nz(rng, -7, 7);
      if (r1 === r2) return null;
      const b = -(r1 + r2), c = r1 * r2, m = nz(rng, -4, 4);
      // x² ＋ (b－m)x ＝ －c － m x  の形にする
      return { e: [quadTex(1, b - m, 0), polyTex(clean({ x: Q(-m), "": Q(-c) }))], abc: [1, b, c] };
    },
    prod: (rng) => {
      const r1 = nz(rng, -6, 6), r2 = nz(rng, -6, 6), pp = nz(rng, -5, 5);
      if (r1 === r2) return null;
      const qq = -(r1 + r2) - pp, k = pp * qq - r1 * r2;
      if (!k || !qq) return null;
      return { e: [`(${xs}${pp < 0 ? "－" : "＋"}${Math.abs(pp)})(${xs}${qq < 0 ? "－" : "＋"}${Math.abs(qq)})`, num(Q(k))], abc: [1, -(r1 + r2), r1 * r2] };
    },
    div: (rng) => {
      const k = rng.int(2, 5), r1 = nz(rng, -6, 6), r2 = nz(rng, -6, 6);
      if (r1 === r2) return null;
      return { e: [quadTex(k, -k * (r1 + r2), k * r1 * r2), "0"], abc: [k, -k * (r1 + r2), k * r1 * r2] };
    }
  };
  const quadSolve = {
    id: "c3.quadSolve",
    instruction: R("次の二次方程式を解きましょう。"),
    defaults: { types: ["sqk", "shift", "fact"] },
    levels: lv({ types: ["sqk", "asq", "shift", "fact", "zero", "fact"] }, { types: ["shift", "fact", "dbl", "formula", "formula", "zero"] }, { types: ["formula", "formulaQ", "rearr", "prod", "div"] }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx);
      for (let t = 0; t < 400; t++) {
        const r = QS[type](rng);
        if (!r) continue;
        const roots = rootsTex(...r.abc);
        if (!roots) continue;
        const text = `${r.e[0]}＝${r.e[1]}`;
        return { key: `qs:${text}`, text, answer: { display: roots.tex }, workspace: { type: "none" }, meta: { e: r.e, n: roots.n } };
      }
      throw new Error("二次方程式の問題が作れない");
    },
    verify(pr) {
      const vals = pr.answer.display.split("，").flatMap((s) => pmVals(s.replace(/^\[\[v:x\]\]＝/, "")));
      if (new Set(vals.map((v) => v.toFixed(8))).size !== pr.meta.n) return "解の個数";
      for (const x of vals) if (!near(evalF(pr.meta.e[0], { x }), evalF(pr.meta.e[1], { x }))) return `解が合わない ${pr.text} ${pr.answer.display}`;
      return null;
    }
  };
  Object.assign(RUBY, { 二次方程式: "にじほうていしき", 解: "かい", 解き方: "{解|と}き{方|かた}", 解きましょう: "{解|と}きましょう", もう1つ: "もう{1|ひと}つ" });

  const quadCoef = {
    id: "c3.quadCoef",
    instruction: R("次の問いに答えましょう。"),
    defaults: {},
    levels: lv({}, {}, {}),
    generate(rng) {
      for (;;) {
        const r1 = nz(rng, -7, 7), r2 = nz(rng, -7, 7);
        if (r1 === r2 || r1 + r2 === 0) continue;
        const c = r1 * r2, a = -(r1 + r2);
        const e = `${xs}²＋${V("a")}${xs}${c < 0 ? "－" : "＋"}${Math.abs(c)}＝0`;
        return { key: `qc:${e}:${r1}`, text: `${R("二次方程式")} ${e} ${R("の解の1つが")}${num(Q(r1))}${R("のとき、")}${V("a")}${R("の値と、もう1つの解を求めましょう。")}`.replace("1{つ|", "{1|ひと}{つ|"), wide: true, answer: { display: `${V("a")}＝${num(Q(a))}，${R("もう1つの解")} ${xs}＝${num(Q(r2))}` }, workspace: { type: "none" }, meta: { r1, r2, a, c } };
      }
    },
    verify(pr) {
      const { r1, r2, a, c } = pr.meta;
      return r1 * r1 + a * r1 + c === 0 && r2 * r2 + a * r2 + c === 0 ? null : "解が合わない";
    }
  };
  Object.assign(RUBY, { 解の1つ: "{解|かい}の{1|ひと}つ" });

  const QW = {
    num: (rng) => {
      const x = rng.int(3, 12), d = x * x - 2 * x;
      return { t: `ある正の数を2乗するところを、まちがえて2倍したため、正しい答えより${d}小さくなりました。ある正の数を求めましょう。`, e: [`${xs}²－${d}`, `2${xs}`], x, u: "" };
    },
    consec: (rng) => {
      const x = rng.int(3, 12), s = x * x + (x + 1) ** 2;
      return { t: `連続する2つの自然数があります。それぞれの2乗の和が${s}のとき、この2つの自然数を求めましょう。(小さいほうの数を${xs}とします。)`, e: [`${xs}²＋(${xs}＋1)²`, String(s)], x, ans: `${x}，${x + 1}` };
    },
    rect: (rng) => {
      const x = rng.int(3, 12), d = rng.int(2, 6), A = x * (x + d);
      return { t: `縦が横より${d}cm長い長方形があり、面積は${A}cm²です。横の長さを求めましょう。`, e: [`${xs}(${xs}＋${d})`, String(A)], x, u: "cm" };
    },
    road: (rng) => {
      const x = rng.int(1, 4), a = rng.int(10, 20), b = rng.int(a + 2, 30), Sz = (a - x) * (b - x);
      return { t: `縦${a}m、横${b}mの長方形の土地に、下の図のように同じ幅の道を縦と横に1本ずつつくり、残りの土地の面積を${Sz}m²にします。道の幅を求めましょう。`, e: [`(${a}－${xs})(${b}－${xs})`, String(Sz)], x, u: "m", fig: true };
    },
    box: (rng) => {
      const c = rng.int(2, 5), s = rng.int(4, 12), x = 2 * c + s, Vv = c * s * s;
      return { t: `正方形の紙の4すみから、1辺が${c}cmの正方形を切り取って、ふたのない箱をつくったところ、容積が${Vv}cm³になりました。もとの紙の1辺の長さを求めましょう。`, e: [`${c}(${xs}－${2 * c})²`, String(Vv)], x, u: "cm" };
    }
  };
  Object.assign(RUBY, { 正の数: "{正|せい}の{数|かず}", 乗する: "{乗|じょう}する", 倍した: "{倍|ばい}した", 正しい: "{正|ただ}しい", 縦: "たて", 横: "よこ", 土地: "とち", 幅: "はば", 道: "みち", 本ずつ: "{本|ぽん}ずつ", 紙: "かみ", 切り取って: "{切|き}り{取|と}って", 容積: "ようせき", 箱: "はこ", もとの: "もとの", 図: "ず", 面積: "めんせき", 長方形: "ちょうほうけい", 正方形: "せいほうけい", 辺: "へん", 長さ: "{長|なが}さ", 長い: "{長|なが}い", 乗: "じょう" });
  const quadWord = {
    id: "c3.quadWord",
    instruction: null,
    defaults: { types: ["num", "consec", "rect"] },
    levels: lv({ types: ["num", "consec", "rect"] }, { types: ["consec", "rect", "road", "num"] }, { types: ["road", "box", "consec", "rect"] }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx), r = QW[type](rng);
      const eTex = `${r.e[0]}＝${r.e[1]}`;
      let figure = null;
      if (r.fig) {
        const W = 80, H = 50, w = 6;
        figure = draw(W + 6, H + 6, [{ t: "poly", pts: [[3, 3], [W + 3, 3], [W + 3, H + 3], [3, H + 3]], w: 0.6 }, { t: "poly", pts: [[33, 3], [33 + w, 3], [33 + w, H + 3], [33, H + 3]], w: 0.3, fill: "light" }, { t: "poly", pts: [[3, 22], [W + 3, 22], [W + 3, 22 + w], [3, 22 + w]], w: 0.3, fill: "light" }]);
      }
      return {
        key: `qw:${r.t}`,
        softKey: type,
        text: R(r.t).replace("1{本|ほん}", "1{本|ぽん}").replace("1{辺|へん}", "1{辺|ぺん}"),
        figure,
        answer: { display: `${R("式")} ${eTex}　${R("答え")} ${r.ans || `${r.x}${R(r.u)}`}` },
        workspace: { type: "lines", labels: [R("式"), "", R("答え")], wideLabel: true },
        meta: { e: r.e, x: r.x }
      };
    },
    verify(pr) {
      const { e, x } = pr.meta;
      return near(evalF(e[0], { x }), evalF(e[1], { x })) ? null : "方程式が合わない";
    }
  };

  // ============================================================
  // 4 関数 y＝ax²
  // ============================================================
  const sqTex = (a) => `${ys}＝${coefTex(a)}${xs}²`;
  const A_INT = [1, 2, 3, 4, 5, -1, -2, -3, -4];
  const sqFormula = {
    id: "c3.sqFormula",
    instruction: R("次の問いに答えましょう。"),
    defaults: { types: ["formula", "val"] },
    levels: lv({ types: ["formula", "val"] }, { types: ["formula", "val", "xFromY", "frac"] }, { types: ["frac", "xFromY", "meet"] }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx);
      for (let t = 0; t < 200; t++) {
        const a = type === "frac" || type === "meet" && rng.chance(0.4) ? Q(nz(rng, -3, 3), rng.pick([2, 3, 4])) : Q(rng.pick(A_INT));
        if (type === "frac" && isInt(a)) continue;
        const f = (x) => qm(a, Q(x * x)), x0 = a[1] * nz(rng, -3, 3) / (a[1] > 2 ? 2 : 1);
        if (!Number.isInteger(x0) || !isInt(f(x0))) continue;
        const given = `${xs}＝${num(Q(x0))}${R("のとき")}${ys}＝${num(f(x0))}`;
        const lead = `${ys}${R("は")}${xs}${R("の2乗に比例し、")}${given}${R("です。")}`;
        if (type === "formula" || type === "frac") return { key: `sf:${a}:${x0}`, text: `${lead}${ys}${R("を")}${xs}${R("の式で表しましょう。")}`, wide: true, answer: { display: sqTex(a) }, workspace: { type: "none" }, meta: { a, x0 } };
        if (type === "val") {
          const x1 = nz(rng, -6, 6);
          if (Math.abs(x1) === Math.abs(x0)) continue;
          return { key: `sf:v:${a}:${x0}:${x1}`, text: `${lead}${xs}＝${num(Q(x1))}${R("のときの")}${ys}${R("の値を求めましょう。")}`, wide: true, answer: { display: `${ys}＝${num(f(x1))}` }, workspace: { type: "none" }, meta: { a, x0 } };
        }
        if (type === "xFromY") {
          const x1 = rng.int(1, 6);
          if (x1 === Math.abs(x0)) continue;
          return { key: `sf:x:${a}:${x0}:${x1}`, text: `${lead}${ys}＝${num(f(x1))}${R("となる")}${xs}${R("の値を求めましょう。")}`, wide: true, answer: { display: `${xs}＝±${x1}` }, workspace: { type: "none" }, meta: { a, x0 } };
        }
        // 放物線と直線の交点
        if (a[0] < 0 || a[1] > 2) continue;
        const pp = nz(rng, -4, 0), qq = rng.int(1, 4);
        const m = qm(a, Q(pp + qq)), k = qneg(qm(a, Q(pp * qq)));
        if (!isInt(m) || !isInt(k) || m[0] === 0) continue;
        return { key: `sf:m:${a}:${pp}:${qq}`, text: `${R("放物線")} ${sqTex(a)} ${R("と直線")} ${ys}＝${lin(m, k)} ${R("の交点の座標を求めましょう。")}`, wide: true, answer: { display: `(${num(Q(pp))}, ${num(f(pp))})，(${num(Q(qq))}, ${num(f(qq))})` }, workspace: { type: "none" }, meta: { a, x0: pp, m, k, qq } };
      }
      throw new Error("y＝ax²の式の問題が作れない");
    },
    verify(pr) {
      const m = pr.meta;
      if (m.m) for (const x of [m.x0, m.qq]) if (!qeq(qm(m.a, Q(x * x)), qa(qm(m.m, Q(x)), m.k))) return "交点が合わない";
      return null;
    }
  };
  Object.assign(RUBY, { 乗に比例し: "{乗|じょう}に{比例|ひれい}し", 放物線: "ほうぶつせん", 直線: "ちょくせん", 交点: "こうてん", 座標: "ざひょう", 関数: "かんすう", 変化の割合: "{変化|へんか}の{割合|わりあい}", 増加する: "{増|ぞう}{加|か}する", 変域: "へんいき", となる: "となる" });

  const sqRate = {
    id: "c3.sqRate",
    instruction: R("次の問いに答えましょう。"),
    defaults: { types: ["rate", "yRange"] },
    levels: lv({ types: ["rate", "yRange"] }, { types: ["rate", "yRange", "yRange"] }, { types: ["rate", "yRange", "findA"] }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx);
      for (let t = 0; t < 200; t++) {
        const a = rng.chance(0.3) ? Q(nz(rng, -3, 3), 2) : Q(rng.pick(A_INT));
        const x1 = rng.int(-5, 3), x2 = x1 + rng.int(1, 4), f = (x) => qm(a, Q(x * x));
        const fn = `${R("関数")} ${sqTex(a)} ${R("で、")}`;
        if (type === "rate") {
          const r = qm(a, Q(x1 + x2));
          if (!isInt(f(x1)) || !isInt(f(x2))) continue;
          return { key: `sr:r:${a}:${x1}:${x2}`, text: `${fn}${xs}${R("が")}${num(Q(x1))}${R("から")}${num(Q(x2))}${R("まで増加するときの変化の割合")}`, wide: true, answer: { display: num(r) }, workspace: { type: "none" }, meta: {} };
        }
        if (type === "yRange") {
          const vals = [f(x1), f(x2)];
          if (x1 < 0 && x2 > 0) vals.push(Q(0));
          if (!vals.every(isInt)) continue;
          vals.sort((u, v) => qv(u) - qv(v));
          return { key: `sr:y:${a}:${x1}:${x2}`, text: `${fn}${xs}${R("の変域が")} ${num(Q(x1))}≦${xs}≦${num(Q(x2))} ${R("のときの")}${ys}${R("の変域")}`, wide: true, answer: { display: `${num(vals[0])}≦${ys}≦${num(vals[vals.length - 1])}` }, workspace: { type: "none" }, meta: {} };
        }
        if (x1 + x2 === 0) continue;
        const r = qm(a, Q(x1 + x2));
        if (!isInt(r)) continue;
        return { key: `sr:a:${a}:${x1}:${x2}`, text: `${R("関数")} ${ys}＝${V("a")}${xs}² ${R("で、")}${xs}${R("が")}${num(Q(x1))}${R("から")}${num(Q(x2))}${R("まで増加するときの変化の割合が")}${num(r)}${R("です。")}${V("a")}${R("の値")}`, wide: true, answer: { display: `${V("a")}＝${num(a)}` }, workspace: { type: "none" }, meta: {} };
      }
      throw new Error("変化の割合の問題が作れない");
    }
  };

  // 放物線のグラフ
  const paraItems = (pl, a, n, o = {}) => {
    const k = qv(a), lim = Math.min(n + 0.3, Math.sqrt((n + 0.3) / Math.abs(k)));
    let d = "";
    for (let i = 0; i <= 80; i++) {
      const x = -lim + 2 * lim * i / 80;
      d += `${i ? "L" : "M"}${pl.X(x).toFixed(2)} ${pl.Y(k * x * x).toFixed(2)}`;
    }
    return { t: "path", d, w: 0.7, para: qv(a), ...o };
  };
  const PARA_A = { basic: [[1], [2], [-1], [-2], [1, 2], [-1, 2]], normal: [[1], [2], [-1], [-2], [1, 2], [-1, 2], [1, 4], [-1, 4], [3], [-3]], challenge: [[1, 2], [-1, 2], [1, 4], [-1, 4], [3, 2], [-3, 2], [2], [-2]] };
  const sqGraph = {
    id: "c3.sqGraph",
    instruction: null,
    defaults: { types: ["read", "draw"], set: "basic" },
    levels: lv({ types: ["read", "draw"], set: "basic" }, { types: ["read", "draw"], set: "normal" }, { types: ["read", "draw"], set: "challenge" }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx), n = 5, pl = plane(n, 7);
      const pool = PARA_A[p.set].map((s) => Q(...s));
      for (let t = 0; t < 100; t++) {
        const a1 = rng.pick(pool.filter((a) => a[0] > 0)), a2 = rng.pick(pool.filter((a) => a[0] < 0));
        // 格子点を通ること(x＝分母の倍数で y が整数、目もりの中)
        const lat = (a) => [1, 2, 3, 4].some((x) => isInt(qm(a, Q(x * x))) && Math.abs(qv(a) * x * x) <= n && x <= n);
        if (!lat(a1) || !lat(a2)) continue;
        const pair = [a1, a2];
        const col = type === "draw" ? RED : void 0;
        const curves = pair.flatMap((a, i) => {
          const k = qv(a), xl = Math.min(n, Math.sqrt(n / Math.abs(k))) * 0.92;
          return [paraItems(pl, a, n, col ? { color: col } : {}), T_(pl.X(xl) + 3.6, pl.Y(k * xl * xl) + (k > 0 ? 2 : 1.5), MARU[i], 3.8, { bold: true, color: col })];
        });
        const eqs = pair.map(sqTex);
        if (type === "draw") return { key: `sg:d:${eqs}`, text: `${R("次の関数のグラフをかきましょう。")}[[br]]${eqs.map((e, i) => `${MARU[i]} ${e}`).join("　　")}`, figure: draw(pl.w, pl.h, pl.items), answer: { display: R("図のとおり"), figure: draw(pl.w, pl.h, [...pl.items, ...curves]) }, workspace: { type: "none" }, meta: { pair } };
        return { key: `sg:r:${eqs}`, text: `①，②${R("は、")}${ys}＝${V("a")}${xs}²${R("のグラフです。それぞれの式を求めましょう。")}`, figure: draw(pl.w, pl.h, [...pl.items, ...curves]), answer: { display: eqs.map((e, i) => `${MARU[i]} ${e}`).join("　") }, workspace: { type: "lines", labels: ["①", "②"] }, side: true, meta: { pair } };
      }
      throw new Error("放物線のグラフの問題が作れない");
    },
    verify(pr) {
      const fig = pr.answer.figure || pr.figure;
      const ps = fig.items.filter((it) => it.para !== void 0);
      return ps.length === 2 && ps.every((it, i) => Math.abs(it.para - qv(pr.meta.pair[i])) < 1e-9) ? null : "グラフが合わない";
    }
  };
  Object.assign(RUBY, { それぞれ: "それぞれ" });

  const SQW = {
    ball: (rng) => {
      const a = rng.pick([1, 2, 3, 0.5]), t1 = rng.int(3, 6), t2 = rng.int(2, 8);
      const aq = a === 0.5 ? Q(1, 2) : Q(a);
      return { t: `斜面でボールを転がすとき、転がり始めてから${xs}秒間に進む距離を${ys}mとすると、${ys}は${xs}の2乗に比例します。2秒間で${4 * a}m進みました。`, a: aq, q2: [`${t1}秒間に進む距離は何mですか。`, `${a * t1 * t1}m`], q3: [`${a * t2 * t2}m進むのは、転がり始めてから何秒後ですか。`, `${t2}秒後`] };
    },
    brake: (rng) => {
      const v0 = rng.pick([20, 40, 60]), v1 = rng.pick([30, 50, 70, 80, 100].filter((v) => v !== v0)), v2 = rng.pick([20, 40, 60, 80].filter((v) => v !== v0));
      return { t: `自動車がブレーキをかけてから止まるまでに進む距離(制動距離)を${ys}mとすると、${ys}は速さ時速${xs}kmの2乗に比例します。時速${v0}kmのときの制動距離は${v0 * v0 / 200}mでした。`, a: Q(1, 200), q2: [`時速${v1}kmのときの制動距離は何mですか。`, `${v1 * v1 / 200}m`], q3: [`制動距離が${v2 * v2 / 200}mになるのは、時速何kmのときですか。`, `時速${v2}km`] };
    },
    fall: (rng) => {
      const t1 = rng.int(2, 6), t2 = rng.int(2, 9);
      return { t: `物を落とすとき、落ち始めてから${xs}秒間に落ちる距離を${ys}mとすると、${ys}は${xs}の2乗に比例し、1秒間に5m落ちます。`, a: Q(5), q2: [`${t1}秒間に落ちる距離は何mですか。`, `${5 * t1 * t1}m`], q3: [`${5 * t2 * t2}m落ちるのは、落ち始めてから何秒後ですか。`, `${t2}秒後`] };
    }
  };
  Object.assign(RUBY, { 斜面: "しゃめん", 転がす: "{転|ころ}がす", 転がり始めて: "{転|ころ}がり{始|はじ}めて", 秒間: "びょうかん", 秒後: "びょうご", 進む: "{進|すす}む", 進みました: "{進|すす}みました", 距離: "きょり", 自動車: "じどうしゃ", 止まる: "{止|と}まる", 制動距離: "せいどうきょり", 速さ: "{速|はや}さ", 時速: "じそく", 時速何km: "{時速何|じそくなん}km", 何m: "{何|なん}m", 何秒後: "なんびょうご", 物: "もの", 落とす: "{落|お}とす", 落ち始めて: "{落|お}ち{始|はじ}めて", 落ちる: "{落|お}ちる", 落ちます: "{落|お}ちます", 秒: "びょう" });
  const sqWord = {
    id: "c3.sqWord",
    instruction: null,
    defaults: { types: ["ball", "fall"] },
    levels: lv({ types: ["ball", "fall"] }, { types: ["ball", "fall", "brake"] }, { types: ["brake", "ball", "fall"] }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx), r = SQW[type](rng);
      const qs2 = [R(`${ys}を${xs}の式で表しましょう。`), R(r.q2[0]), R(r.q3[0])];
      const ans = [sqTex(r.a), R(r.q2[1]), R(r.q3[1])];
      return {
        key: `sw:${r.t}:${r.q2[0]}:${r.q3[0]}`,
        softKey: type,
        text: `${R(r.t)}[[br]]${qs2.map((q, i) => `(${i + 1}) ${q}`).join("[[br]]")}`,
        answer: { display: ans.map((a, i) => `(${i + 1}) ${a}`).join("　") },
        workspace: { type: "lines", labels: ["(1)", "(2)", "(3)"] },
        meta: { type }
      };
    }
  };
