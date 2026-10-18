// 数学B(学習指導要領の内容の順:数列 → 統計的な推測。教科書の章立てに合わせて 3 単元)
var kouB = (() => {
  const K = kouLib;
  const { Q, qa, qs, qm, qd, qneg, qeq, qpow, isInt, qv, num, absTex, gcd, lv, nz, X, V, evalH, near, sameH, pTex, pmul, padd, pscale, sg, sgQ, rootTex, surdTex, gen, redo, pickN, nCr, fnum, sup } = K;
  const H = {};
  const surdAns = K.k1.surdAns;
  const N = V("n");
  const an = `[[v:a]][[_[[v:n]]]]`, a_ = (k) => `[[v:a]][[_${k}]]`;
  // n の整式(係数 Q、高い次数から)
  const nTex = (cs) => pTex(cs, "n");
  const pow = (b, e) => `${b}[[^${e}]]`;
  // a·r^(n－1)(a が数のときは「·」をはさむ)
  const geoTex = (a, r, ex = "[[v:n]]－1") => `${a === 1 ? "" : a === -1 ? "－" : num(Q(a)) + (r > 0 ? "·" : "")}${r < 0 ? `(${num(Q(r))})` : r}[[^${ex}]]`;

  // ============================================================
  // 1 数列
  // ============================================================
  const arith = gen("kB.arith", "次の問いに答えましょう。", lv({ types: ["gen", "sum"] }, { types: ["gen", "two", "sum", "sumR"] }, { types: ["two", "sumR", "first", "maxSum"] }), (rng, type) => {
    const a = rng.int(-10, 15), d = nz(rng, -5, 6);
    if (type === "gen") return { text: `初項 ${a}，公差 ${d} の等差数列 {${an}} の一般項`, ans: `${an}＝${nTex([Q(d), Q(a - d)])}`, meta: { f: (n) => a + (n - 1) * d, e: nTex([Q(d), Q(a - d)]) } };
    if (type === "two") {
      const p = rng.int(2, 6), q = rng.int(p + 2, 15);
      return { text: `第${p}項が ${a + (p - 1) * d}，第${q}項が ${a + (q - 1) * d} である等差数列 {${an}} の一般項`, ans: `${an}＝${nTex([Q(d), Q(a - d)])}`, meta: { f: (n) => a + (n - 1) * d, e: nTex([Q(d), Q(a - d)]) } };
    }
    if (type === "sum") {
      const n = rng.int(10, 30);
      return { text: `初項 ${a}，公差 ${d} の等差数列の、初項から第${n}項までの和`, ans: String(n * (2 * a + (n - 1) * d) / 2), meta: { v: n * (2 * a + (n - 1) * d) / 2, chk: () => {
        let s = 0;
        for (let k = 0; k < n; k++) s += a + k * d;
        return s;
      } } };
    }
    if (type === "sumR") {
      // 初項から第 n 項までの和を n の式で
      const S = [Q(d, 2), Q(2 * a - d, 2), Q(0)];
      return { text: `初項 ${a}，公差 ${d} の等差数列の、初項から第 ${N} 項までの和 [[v:S]][[_[[v:n]]]]`, ans: `[[v:S]][[_[[v:n]]]]＝${nTex(S)}`, meta: { S: nTex(S), f: (n) => a + (n - 1) * d } };
    }
    if (type === "first") {
      // 初めて負になる項
      const a0 = rng.int(50, 150), d0 = -rng.int(3, 9);
      const n = Math.floor(a0 / -d0) + 2 - (a0 % -d0 === 0 ? 0 : 0);
      let k = 1;
      while (a0 + (k - 1) * d0 >= 0) k++;
      return { text: `初項 ${a0}，公差 ${d0} の等差数列で、初めて負の数になるのは第何項か`, ans: `第${k}項`, meta: { k, a0, d0 } };
    }
    // 和の最大
    const a0 = rng.int(40, 100), d0 = -rng.int(3, 8);
    let s = 0, best = -Infinity, at = 0;
    for (let k = 1; k <= 200; k++) {
      s += a0 + (k - 1) * d0;
      if (s > best) best = s, at = k;
    }
    return { text: `初項 ${a0}，公差 ${d0} の等差数列の、初項から第 ${N} 項までの和が最大になる ${N} の値と、そのときの和`, ans: `${N}＝${at} のとき 最大値 ${best}`, wide: true, meta: { best, at, a0, d0 } };
  }, (pr) => {
    const m = pr.meta;
    if (m.e) return [1, 2, 5, 9].every((n) => evalH(m.e, { n }) === m.f(n)) ? null : "一般項が合わない";
    if (m.chk) return m.chk() === m.v ? null : "和が合わない";
    if (m.S) {
      let s = 0;
      for (let n = 1; n <= 6; n++) {
        s += m.f(n);
        if (!near(evalH(m.S, { n }), s)) return "和の式が合わない";
      }
      return null;
    }
    if (m.k) return m.a0 + (m.k - 1) * m.d0 < 0 && m.a0 + (m.k - 2) * m.d0 >= 0 ? null : "項が合わない";
    return null;
  }, { work: 28 });

  const geom = gen("kB.geom", "次の問いに答えましょう。", lv({ types: ["gen", "sum"] }, { types: ["gen", "two", "sum"] }, { types: ["two", "sumR", "sum"] }), (rng, type) => {
    const a = nz(rng, -4, 5), r = rng.pick([2, 3, -2, -3, 2, 3]);
    const gtex = geoTex(a, r);
    if (type === "gen") return { text: `初項 ${a}，公比 ${r} の等比数列 {${an}} の一般項`, ans: `${an}＝${gtex}`, meta: { e: gtex, f: (n) => a * r ** (n - 1) } };
    if (type === "two") {
      const p = rng.int(2, 3), q = p + rng.int(2, 3);
      const rr = Math.abs(r);
      // 正の公比にして一意に(q－p が偶数だと ± の2通り)
      const r2 = (q - p) % 2 ? r : rr;
      const g2 = geoTex(a, r2);
      return { text: `第${p}項が ${a * r2 ** (p - 1)}，第${q}項が ${a * r2 ** (q - 1)} である等比数列 {${an}} の一般項(公比は実数)`, ans: `${an}＝${g2}`, meta: { e: g2, f: (n) => a * r2 ** (n - 1), uniq: (q - p) % 2 === 1 } };
    }
    if (type === "sum") {
      const n = rng.int(5, 8), s = a * (r ** n - 1) / (r - 1);
      return { text: `初項 ${a}，公比 ${r} の等比数列の、初項から第${n}項までの和`, ans: String(s), meta: { v: s, chk: () => {
        let t = 0;
        for (let k = 0; k < n; k++) t += a * r ** k;
        return t;
      } } };
    }
    // S_n を n の式で
    if (r < 0) return null;
    const c = Q(a, r - 1);
    const S = `${num(c).replace(/^1$/, "").replace(/^－1$/, "－")}(${r}[[^[[v:n]]]]－1)`;
    return { text: `初項 ${a}，公比 ${r} の等比数列の、初項から第 ${N} 項までの和 [[v:S]][[_[[v:n]]]]`, ans: `[[v:S]][[_[[v:n]]]]＝${S}`, meta: { S, f: (n) => a * r ** (n - 1) } };
  }, (pr) => {
    const m = pr.meta;
    if (m.e) return [1, 2, 3, 6].every((n) => near(evalH(m.e, { n }), m.f(n))) ? null : "一般項が合わない";
    if (m.chk) return m.chk() === m.v ? null : "和が合わない";
    let s = 0;
    for (let n = 1; n <= 6; n++) {
      s += m.f(n);
      if (!near(evalH(m.S, { n }), s)) return "和の式が合わない";
    }
    return null;
  }, { work: 28 });

  // Σ
  const SUM = (k, n) => `[[sum:[[v:k]]＝1:${n}]]`;
  const sigma = gen("kB.sigma", "次の和を求めましょう。", lv({ types: ["num", "lin"] }, { types: ["lin", "quad", "num"] }, { types: ["quad", "frac", "kpow", "lin"] }), (rng, type) => {
    if (type === "num") {
      const n = rng.int(8, 20), kind = rng.int(0, 2);
      const e = ["[[v:k]]", "[[v:k]]²", "(2[[v:k]]－1)"][kind];
      let s = 0;
      for (let k = 1; k <= n; k++) s += [k, k * k, 2 * k - 1][kind];
      return { text: `${SUM("k", n)}${e}`, ans: String(s), meta: { v: s, e, n } };
    }
    if (type === "lin" || type === "quad") {
      const a = type === "quad" ? nz(rng, -2, 3) : 0, b = nz(rng, -4, 4), c = rng.int(-5, 5);
      // Σ(ak²＋bk＋c) ＝ n{2a n² ＋ (3a＋3b)n ＋ (a＋3b＋6c)}/6
      const inner = [Q(2 * a), Q(3 * a + 3 * b), Q(a + 3 * b + 6 * c)];
      const g = Math.abs([2 * a, 3 * a + 3 * b, a + 3 * b + 6 * c].reduce((u, w) => gcd(u, w), 0)) || 1;
      const lead = Q(g, 6), body = inner.map((x) => qd(x, Q(g)));
      const bt = K.trim(body);
      const ans = `${qeq(lead, Q(1)) ? "" : num(lead)}${N}(${nTex(bt)})`;
      const e = pTex(type === "quad" ? [Q(a), Q(b), Q(c)] : [Q(b), Q(c)], "k");
      return { text: `${SUM("k", N)}(${e})`, ans: bt.length === 1 ? `${num(qm(lead, bt[0]))}${N}` : ans, meta: { e, ans2: bt.length === 1 ? `${num(qm(lead, bt[0]))}${N}` : ans } };
    }
    if (type === "frac") {
      const d = rng.pick([1, 2, 3, 4]);
      if (d === 3) return { text: `${SUM("k", N)}[[f:1/([[v:k]]＋1)([[v:k]]＋2)]]`, ans: `[[f:${N}/2(${N}＋2)]]`, meta: { f: (k) => 1 / ((k + 1) * (k + 2)), e2: `[[f:${N}/2(${N}＋2)]]` } };
      if (d === 4) return { text: `${SUM("k", N)}[[f:1/(3[[v:k]]－2)(3[[v:k]]＋1)]]`, ans: `[[f:${N}/3${N}＋1]]`, meta: { f: (k) => 1 / ((3 * k - 2) * (3 * k + 1)), e2: `[[f:${N}/3${N}＋1]]` } };
      // Σ 1/(k(k＋d))(d＝1 または 2)…d＝1 のみきれい
      if (d === 2) return { text: `${SUM("k", N)}[[f:1/(2[[v:k]]－1)(2[[v:k]]＋1)]]`, ans: `[[f:${N}/2${N}＋1]]`, meta: { f: (k) => 1 / ((2 * k - 1) * (2 * k + 1)), e2: `[[f:${N}/2${N}＋1]]` } };
      return { text: `${SUM("k", N)}[[f:1/[[v:k]]([[v:k]]＋1)]]`, ans: `[[f:${N}/${N}＋1]]`, meta: { f: (k) => 1 / (k * (k + 1)), e2: `[[f:${N}/${N}＋1]]` } };
    }
    // Σ k·2^(k－1) ＝ (n－1)2^n ＋ 1、Σ k·3^(k－1) ＝ {(2n－1)3^n ＋ 1}/4
    if (rng.chance(0.5)) return { text: `${SUM("k", N)}[[v:k]]·3[[^[[v:k]]－1]]`, ans: `[[f:(2${N}－1)·3[[^[[v:n]]]]＋1/4]]`, meta: { f: (k) => k * 3 ** (k - 1), e2: `[[f:(2${N}－1)·3[[^[[v:n]]]]＋1/4]]` } };
    return { text: `${SUM("k", N)}[[v:k]]·2[[^[[v:k]]－1]]`, ans: `(${N}－1)·2[[^[[v:n]]]]＋1`, meta: { f: (k) => k * 2 ** (k - 1), e2: `(${N}－1)·2[[^[[v:n]]]]＋1` } };
  }, (pr) => {
    const m = pr.meta;
    if (m.v !== undefined) return String(m.v) === pr.answer.display ? null : "和が合わない";
    const term = m.f || ((k) => evalH(m.e, { k }));
    const ans = m.e2 || m.ans2;
    let s = 0;
    for (let n = 1; n <= 7; n++) {
      s += term(n);
      if (!near(evalH(ans, { n }), s)) return `和の式が合わない n=${n}`;
    }
    return null;
  }, { work: 30 });

  // 階差数列
  const diffSeq = gen("kB.diffSeq", "次の数列 {[[v:a]][[_[[v:n]]]]} の一般項を求めましょう。", lv({ types: ["lin"] }, { types: ["lin", "geo"] }, { types: ["geo", "lin", "quad"] }), (rng, type) => {
    const a1 = rng.int(-3, 5);
    let f, e;
    if (type === "lin") {
      // 階差 b_k ＝ pk＋q → a_n ＝ a1 ＋ Σ_{k=1}^{n-1}(pk＋q) ＝ a1 ＋ p(n－1)n/2 ＋ q(n－1)
      const p = rng.pick([1, 2, 3, 4]), q = rng.int(-3, 3);
      if (p % 2 && rng.chance(0.5)) return null;
      f = (n) => a1 + p * (n - 1) * n / 2 + q * (n - 1);
      e = nTex([Q(p, 2), qs(Q(q), Q(p, 2)), Q(a1 - q)]);
    } else if (type === "geo") {
      const r = rng.pick([2, 3]), c = rng.pick([1, 2]);
      // 階差 c·r^(k－1) → a_n ＝ a1 ＋ c(r^(n－1)－1)/(r－1)
      f = (n) => a1 + c * (r ** (n - 1) - 1) / (r - 1);
      const k = Q(c, r - 1), cst = qs(Q(a1), k);
      e = `${qeq(k, Q(1)) ? "" : num(k) + "·"}${r}[[^[[v:n]]－1]]${cst[0] ? sgQ(cst) : ""}`;
    } else {
      // 階差が 2次(k²)
      f = (n) => a1 + (n - 1) * n * (2 * n - 1) / 6;
      e = `[[f:1/6]](${nTex([Q(2), Q(-3), Q(1)])})${N}${a1 ? sg(a1) : ""}`.replace(`(${nTex([Q(2), Q(-3), Q(1)])})${N}`, `${N}(${N}－1)(2${N}－1)`);
    }
    const terms = [1, 2, 3, 4, 5, 6].map(f);
    if (terms.some((t) => !Number.isInteger(t))) return null;
    return { text: `${terms.join(", ")}, …`, ans: `${an}＝${e}`, meta: { terms, e } };
  }, (pr) => pr.meta.terms.every((t, i) => near(evalH(pr.meta.e, { n: i + 1 }), t)) ? null : "一般項が合わない", { work: 30 });

  // 数列の文章題
  const SEQW = {
    seats: (rng) => {
      const a = rng.int(10, 20), d = rng.int(2, 4), n = rng.int(10, 20);
      return { t: `劇場の座席は、最前列が ${a}席で、後ろの列ほど ${d}席ずつ多くなっています。全部で ${n}列あるとき、座席は全部で何席ありますか。`, a: `${n * (2 * a + (n - 1) * d) / 2}席` };
    },
    save: (rng) => {
      const m = rng.pick([10, 12, 20]), n = 10;
      // 年利 1%、毎年初めに m 万円、10年後の元利合計:m·1.01(1.01^10－1)/0.01、1.01^10 ＝ 1.1046
      const v = m * 1.01 * (1.1046 - 1) / 0.01;
      return { t: `毎年初めに ${m}万円ずつ積み立て、年利 1%、1年ごとの複利で計算します。10年目の終わりの元利合計は約何万円ですか。ただし、1.01[[^10]]＝1.1046 とし、小数第1位を四捨五入して答えましょう。`, a: `約 ${Math.round(v)}万円` };
    },
    pile: (rng) => {
      const n = rng.int(5, 12);
      return { t: `ボールを、1段目に1個、2段目に3個、3段目に6個、…と、${N} 段目には 1＋2＋…＋${N} 個になるように積みます。${n}段積むとき、ボールは全部で何個必要ですか。`, a: `${n * (n + 1) * (n + 2) / 6}個` };
    },
    paper: (rng) => {
      const t = rng.pick([0.1, 0.08]), k = rng.int(10, 20);
      return { t: `厚さ ${t}mm の紙を半分に折ることを ${k}回くり返すと、厚さは何 mm になりますか。`, a: `${fnum(t * 2 ** k, 2)}mm` };
    }
  };
  const seqWord = gen("kB.seqWord", null, lv({ types: ["seats", "paper"] }, { types: ["seats", "pile", "paper"] }, { types: ["save", "pile", "seats"] }), (rng, type) => {
    const r = SEQW[type](rng);
    return { text: r.t, ans: r.a, softKey: type, ws: { type: "lines", labels: ["答え"] }, work: 45 };
  });
  H["kB.arith"] = "等差数列 a[[_n]]＝a＋(n－1)d、和 S[[_n]]＝[[f:1/2]]n{2a＋(n－1)d}。2つの項から a と d の連立方程式を作ります。";
  H["kB.geom"] = "等比数列 a[[_n]]＝ar[[^n－1]]、和 S[[_n]]＝[[f:a(r[[^n]]－1)/r－1]](r≠1)。";
  H["kB.sigma"] = "[[sum:k＝1:n]]k＝[[f:1/2]]n(n＋1)、[[sum:k＝1:n]]k²＝[[f:1/6]]n(n＋1)(2n＋1)、[[sum:k＝1:n]]c＝cn。分数は部分分数に分けます。";
  H["kB.diffSeq"] = "階差数列 b[[_n]]＝a[[_n＋1]]－a[[_n]] を求め、n≧2 のとき a[[_n]]＝a[[_1]]＋[[sum:k＝1:n－1]]b[[_k]]。n＝1 でも成り立つか確かめます。";
  H["kB.seqWord"] = "何が等差・等比になっているかを見つけ、和の公式を使います。";

  // ============================================================
  // 2 漸化式と数学的帰納法
  // ============================================================
  const a1t = `${a_(1)}`, an1 = `[[v:a]][[_[[v:n]]＋1]]`;
  const recur = gen("kB.recur", "次の条件によって定められる数列 {[[v:a]][[_[[v:n]]]]} の一般項を求めましょう。", lv({ types: ["arith", "geom"] }, { types: ["arith", "geom", "lin", "diff"] }, { types: ["lin", "diff", "lin"] }), (rng, type) => {
    const a1 = rng.int(-3, 6);
    let rec, e, f;
    if (type === "arith") {
      const d = nz(rng, -5, 5);
      rec = `${an1}＝${an}${sg(d)}`, f = (n) => a1 + (n - 1) * d, e = nTex([Q(d), Q(a1 - d)]);
    } else if (type === "geom") {
      const r = rng.pick([2, 3, -2, -3]);
      if (!a1) return null;
      rec = `${an1}＝${r < 0 ? "－" + -r : r}${an}`, f = (n) => a1 * r ** (n - 1), e = geoTex(a1, r);
    } else if (type === "lin") {
      // a_{n+1} ＝ p a_n ＋ q、α ＝ q/(1－p)
      const p = rng.pick([2, 3, -1, -2]), al = rng.int(-3, 3), q = al * (1 - p), c = a1 - al;
      if (!c || !q) return null;
      rec = `${an1}＝${p < 0 ? "－" + (p === -1 ? "" : -p) : p}${an}${sg(q)}`;
      f = (n) => c * p ** (n - 1) + al;
      e = `${geoTex(c, p)}${al ? sg(al) : ""}`;
    } else {
      // a_{n+1} ＝ a_n ＋ (pn＋q)
      const p = rng.pick([2, 4, 6]), q = rng.int(-3, 3);
      rec = q ? `${an1}＝${an}＋(${pTex([Q(p), Q(q)], "n")})` : `${an1}＝${an}＋${pTex([Q(p), Q(0)], "n")}`;
      f = (n) => a1 + p * (n - 1) * n / 2 + q * (n - 1);
      e = nTex([Q(p, 2), qs(Q(q), Q(p, 2)), Q(a1 - q)]);
    }
    return { text: `${a1t}＝${a1}，${rec}`, ans: `${an}＝${e}`, meta: { e, f } };
  }, (pr) => [1, 2, 3, 4, 7].every((n) => near(evalH(pr.meta.e, { n }), pr.meta.f(n))) ? null : "一般項が合わない", { work: 34 });

  const recurTerms = gen("kB.recurTerms", "次の条件によって定められる数列 {[[v:a]][[_[[v:n]]]]} の第2項から第5項までを書きましょう。", lv({ types: ["lin"] }, { types: ["lin", "nlin"] }, { types: ["nlin", "frac"] }), (rng, type) => {
    const a1 = rng.int(1, 4);
    let rec, step;
    if (type === "lin") {
      const p = rng.pick([2, 3, -1]), q = rng.int(-3, 3);
      rec = `${an1}＝${p < 0 ? "－" : p}${an}${q ? sg(q) : ""}`, step = (a) => p * a + q;
    } else if (type === "nlin") {
      const k = rng.int(1, 3);
      rec = `${an1}＝${an}＋${k === 1 ? "" : k}${N}`;
      return { text: `${a1t}＝${a1}，${rec}`, ans: (() => {
        const t = [a1];
        for (let n = 1; n < 5; n++) t.push(t[n - 1] + k * n);
        return t.slice(1).join(", ");
      })(), meta: { a1, k, nlin: true } };
    } else {
      rec = `${an1}＝[[f:${an}/${an}＋1]]`, step = (a) => qd(a, qa(a, Q(1)));
      const t = [Q(a1)];
      for (let n = 1; n < 5; n++) t.push(step(t[n - 1]));
      return { text: `${a1t}＝${a1}，${rec}`, ans: t.slice(1).map(num).join(", "), meta: { a1, frac: true } };
    }
    const t = [a1];
    for (let n = 1; n < 5; n++) t.push(step(t[n - 1]));
    return { text: `${a1t}＝${a1}，${rec}`, ans: t.slice(1).join(", "), meta: { a1, step } };
  }, (pr) => {
    const m = pr.meta, got = pr.answer.display.split(", ").map((s) => evalH(s));
    let a = m.a1;
    for (let n = 1; n < 5; n++) {
      a = m.nlin ? a + m.k * n : m.frac ? a / (a + 1) : m.step(a);
      if (!near(a, got[n - 1])) return "項が合わない";
    }
    return null;
  }, { work: 24 });

  // 数学的帰納法(証明の問題。答えは証明のあらすじ)
  const IND = [
    ["1＋3＋5＋…＋(2[[v:n]]－1)＝[[v:n]]²", "[[v:n]]＝1 のとき 左辺＝1，右辺＝1 で成り立つ。[[v:n]]＝[[v:k]] のとき成り立つと仮定すると、[[v:n]]＝[[v:k]]＋1 のとき 左辺＝[[v:k]]²＋(2[[v:k]]＋1)＝([[v:k]]＋1)² となり成り立つ。よって、すべての自然数 [[v:n]] で成り立つ。"],
    ["1＋2＋2²＋…＋2[[^[[v:n]]－1]]＝2[[^[[v:n]]]]－1", "[[v:n]]＝1 のとき 両辺とも 1。[[v:n]]＝[[v:k]] で成り立つと仮定すると、[[v:n]]＝[[v:k]]＋1 のとき 左辺＝2[[^[[v:k]]]]－1＋2[[^[[v:k]]]]＝2[[^[[v:k]]＋1]]－1 で成り立つ。"],
    ["[[v:n]]³－[[v:n]] は 6 の倍数である", "[[v:n]]＝1 のとき 0 で成り立つ。[[v:n]]＝[[v:k]] のとき [[v:k]]³－[[v:k]]＝6[[v:m]] と仮定すると、([[v:k]]＋1)³－([[v:k]]＋1)＝6[[v:m]]＋3[[v:k]]([[v:k]]＋1)。[[v:k]]([[v:k]]＋1) は偶数なので 6 の倍数。"],
    ["[[v:n]]≧4 のとき 2[[^[[v:n]]]]＞3[[v:n]]", "[[v:n]]＝4 のとき 16＞12 で成り立つ。[[v:n]]＝[[v:k]]([[v:k]]≧4)で 2[[^[[v:k]]]]＞3[[v:k]] と仮定すると、2[[^[[v:k]]＋1]]＞6[[v:k]]＝3([[v:k]]＋1)＋3[[v:k]]－3＞3([[v:k]]＋1)。"],
    ["1·2＋2·3＋…＋[[v:n]]([[v:n]]＋1)＝[[f:1/3]][[v:n]]([[v:n]]＋1)([[v:n]]＋2)", "[[v:n]]＝1 のとき 両辺とも 2。[[v:n]]＝[[v:k]] で成り立つと仮定し、両辺に ([[v:k]]＋1)([[v:k]]＋2) を加えると [[f:1/3]]([[v:k]]＋1)([[v:k]]＋2)([[v:k]]＋3) となり、[[v:n]]＝[[v:k]]＋1 でも成り立つ。"],
    ["4[[^[[v:n]]]]－1 は 3 の倍数である", "[[v:n]]＝1 のとき 3 で成り立つ。4[[^[[v:k]]]]－1＝3[[v:m]] と仮定すると、4[[^[[v:k]]＋1]]－1＝4(3[[v:m]]＋1)－1＝3(4[[v:m]]＋1) で 3 の倍数。"],
    ["5[[^[[v:n]]]]－1 は 4 の倍数である", "[[v:n]]＝1 のとき 4 で成り立つ。5[[^[[v:k]]]]－1＝4[[v:m]] と仮定すると、5[[^[[v:k]]＋1]]－1＝5(4[[v:m]]＋1)－1＝4(5[[v:m]]＋1) で 4 の倍数。"],
    ["[[f:1/1·2]]＋[[f:1/2·3]]＋…＋[[f:1/[[v:n]]([[v:n]]＋1)]]＝[[f:[[v:n]]/[[v:n]]＋1]]", "[[v:n]]＝1 のとき 両辺とも [[f:1/2]]。[[v:n]]＝[[v:k]] で成り立つと仮定すると、[[f:[[v:k]]/[[v:k]]＋1]]＋[[f:1/([[v:k]]＋1)([[v:k]]＋2)]]＝[[f:[[v:k]]＋1/[[v:k]]＋2]] となり成り立つ。"],
    ["1²＋2²＋…＋[[v:n]]²＝[[f:1/6]][[v:n]]([[v:n]]＋1)(2[[v:n]]＋1)", "[[v:n]]＝1 のとき 両辺とも 1。[[v:n]]＝[[v:k]] で成り立つと仮定し、両辺に ([[v:k]]＋1)² を加えると [[f:1/6]]([[v:k]]＋1)([[v:k]]＋2)(2[[v:k]]＋3) となり、[[v:n]]＝[[v:k]]＋1 でも成り立つ。"]
  ];
  const induction = gen("kB.induction", null, lv({ types: [0, 1, 4, 5, 6] }, { types: [0, 1, 4, 5, 6, 7, 8] }, { types: [2, 3, 7, 8, 4, 6] }), (rng, i) => ({ text: `${i === 3 ? "" : "[[v:n]] は自然数とする。"}次の命題を、数学的帰納法を用いて証明しましょう。[[br]]${IND[i][0]}`, ans: IND[i][1], key: `ind:${i}`, softKey: String(i), meta: {}, ws: { type: "lines", labels: [""] }, work: 70 }));
  // 漸化式の利用(文章題)
  const RECW = {
    lines: (rng) => {
      const k = rng.int(5, 12), f = (n) => (n * n + n + 2) / 2;
      return { t: `平面上に、どの2本も平行でなく、どの3本も1点で交わらない ${N} 本の直線があります。これらの直線で平面が分けられる部分の個数を [[v:a]][[_[[v:n]]]] とします。[[v:a]][[_[[v:n]]]] を ${N} の式で表し、${k}本のときの個数を求めましょう。`, a: `[[v:a]][[_[[v:n]]]]＝[[f:1/2]](${nTex([Q(1), Q(1), Q(2)])})，${f(k)}個`, chk: () => {
        let a = 2;
        for (let n = 1; n < k; n++) a += n + 1;
        return a === f(k);
      } };
    },
    circles: (rng) => {
      const k = rng.int(4, 10), f = (n) => n * n - n + 2;
      return { t: `平面上に、どの2つも2点で交わり、どの3つも1点で交わらない ${N} 個の円があります。これらの円で平面が分けられる部分の個数を [[v:a]][[_[[v:n]]]] とします。[[v:a]][[_[[v:n]]]] を ${N} の式で表し、${k}個のときの個数を求めましょう。`, a: `[[v:a]][[_[[v:n]]]]＝${nTex([Q(1), Q(-1), Q(2)])}，${f(k)}個`, chk: () => {
        let a = 2;
        for (let n = 1; n < k; n++) a += 2 * n;
        return a === f(k);
      } };
    },
    hanoi: (rng) => {
      const k = rng.int(5, 12);
      return { t: `3本の棒と、大きさの異なる ${N} 枚の円盤を使うハノイの塔で、すべての円盤を別の棒に移すのに必要な最少の回数を [[v:a]][[_[[v:n]]]] とすると、[[v:a]][[_[[v:n]]＋1]]＝2[[v:a]][[_[[v:n]]]]＋1，[[v:a]][[_1]]＝1 です。[[v:a]][[_[[v:n]]]] を ${N} の式で表し、${k}枚のときの回数を求めましょう。`, a: `[[v:a]][[_[[v:n]]]]＝2[[^[[v:n]]]]－1，${2 ** k - 1}回`, chk: () => {
        let a = 1;
        for (let n = 1; n < k; n++) a = 2 * a + 1;
        return a === 2 ** k - 1;
      } };
    },
    tiles: (rng) => {
      const k = rng.int(6, 12), fib = [1, 2];
      while (fib.length < k) fib.push(fib[fib.length - 1] + fib[fib.length - 2]);
      return { t: `縦2、横 ${N} の長方形を、縦2横1(または縦1横2)のタイルですき間なくしきつめる方法の数を [[v:a]][[_[[v:n]]]] とすると、[[v:a]][[_[[v:n]]＋2]]＝[[v:a]][[_[[v:n]]＋1]]＋[[v:a]][[_[[v:n]]]] が成り立ちます。[[v:a]][[_${k}]] を求めましょう。`, a: `${fib[k - 1]}通り`, chk: () => true };
    }
  };
  const recurWord = gen("kB.recurWord", null, lv({ types: ["hanoi", "lines", "tiles"] }, { types: ["lines", "circles", "hanoi", "tiles"] }, { types: ["circles", "lines", "tiles", "hanoi"] }), (rng, type) => {
    const r = RECW[type](rng);
    return { text: r.t, ans: r.a, softKey: type, meta: { chk: r.chk }, ws: { type: "lines", labels: ["答え"] }, work: 50 };
  }, (pr) => pr.meta.chk() ? null : "答えが合わない");
  H["kB.recurWord"] = "n と n＋1 の関係(1つ増えると何が増えるか)を考えて漸化式を作り、一般項を求めます。";
  H["kB.recur"] = "a[[_n＋1]]＝pa[[_n]]＋q は、α＝pα＋q となる α を使って a[[_n＋1]]－α＝p(a[[_n]]－α) と変形します。a[[_n＋1]]－a[[_n]]＝f(n) は階差数列です。";
  H["kB.recurTerms"] = "n＝1, 2, 3, … を順に代入して求めます。";
  H["kB.induction"] = "(Ⅰ) n＝1 のとき成り立つことを示す。(Ⅱ) n＝k のとき成り立つと仮定して、n＝k＋1 のときも成り立つことを示します。";

  // ============================================================
  // 3 統計的な推測
  // ============================================================
  // 確率分布の表
  const DIST = {
    dice2max: () => {
      const cnt = {};
      for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) cnt[Math.max(a, b)] = (cnt[Math.max(a, b)] || 0) + 1;
      return { name: "2個のさいころを投げたときの大きい方の目", xs: Object.keys(cnt).map(Number), ps: Object.values(cnt).map((c) => Q(c, 36)) };
    },
    coins: () => ({ name: "3枚の硬貨を投げたときの表の枚数", xs: [0, 1, 2, 3], ps: [Q(1, 8), Q(3, 8), Q(3, 8), Q(1, 8)] }),
    balls: (rng) => {
      const r = rng.int(2, 4), w = rng.int(2, 4), n = r + w, tot = nCr(n, 2);
      return { name: `赤玉 ${r}個、白玉 ${w}個の入った袋から2個取り出したときの赤玉の個数`, xs: [0, 1, 2], ps: [Q(nCr(w, 2), tot), Q(r * w, tot), Q(nCr(r, 2), tot)] };
    },
    die: () => ({ name: "1個のさいころの出る目", xs: [1, 2, 3, 4, 5, 6], ps: Array(6).fill(Q(1, 6)) }),
    coin2: () => ({ name: "2枚の硬貨を投げたときの表の枚数", xs: [0, 1, 2], ps: [Q(1, 4), Q(1, 2), Q(1, 4)] }),
    coins4: () => ({ name: "4枚の硬貨を投げたときの表の枚数", xs: [0, 1, 2, 3, 4], ps: [Q(1, 16), Q(4, 16), Q(6, 16), Q(4, 16), Q(1, 16)] }),
    diff: () => {
      const cnt = {};
      for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) cnt[Math.abs(a - b)] = (cnt[Math.abs(a - b)] || 0) + 1;
      return { name: "2個のさいころを投げたときの目の差(大きい方から小さい方を引いた数)", xs: Object.keys(cnt).map(Number), ps: Object.values(cnt).map((c) => Q(c, 36)) };
    }
  };
  const stats = (d) => {
    const E = d.xs.reduce((a, x, i) => qa(a, qm(Q(x), d.ps[i])), Q(0)), E2 = d.xs.reduce((a, x, i) => qa(a, qm(Q(x * x), d.ps[i])), Q(0));
    return { E, Vv: qs(E2, qm(E, E)) };
  };
  const sdTex = (Vq) => surdTex(Q(0), Q(1, Vq[1]), Vq[0] * Vq[1]);
  const randVar = gen("kB.randVar", null, lv({ types: ["coins", "die", "coin2", "coins4", "balls"] }, { types: ["coins", "balls", "die", "coins4", "diff"] }, { types: ["balls", "dice2max", "diff", "coins4"] }), (rng, type) => {
    const d = DIST[type](rng), { E, Vv } = stats(d);
    const fig = { type: "table", head: ["[[v:X]]", ...d.xs.map(String), "計"], rows: [["[[v:P]]", ...d.ps.map(num), "1"]] };
    return { text: `確率変数 [[v:X]] を「${d.name}」とします。[[v:X]] の確率分布は下の表のとおりです。[[v:X]] の期待値 [[v:E]]([[v:X]])、分散 [[v:V]]([[v:X]])、標準偏差 σ([[v:X]]) を求めましょう。`, fig, ans: `[[v:E]]([[v:X]])＝${num(E)}，[[v:V]]([[v:X]])＝${num(Vv)}，σ([[v:X]])＝${sdTex(Vv)}`, key: `rv:${d.name}`, softKey: type, meta: { d, E: qv(E), V: qv(Vv) }, work: 45 };
  }, (pr) => {
    const m = pr.meta, d = m.d;
    const sum = d.ps.reduce((a, p) => a + qv(p), 0);
    if (!near(sum, 1)) return "確率の和が1でない";
    const E = d.xs.reduce((a, x, i) => a + x * qv(d.ps[i]), 0), Vv = d.xs.reduce((a, x, i) => a + (x - E) ** 2 * qv(d.ps[i]), 0);
    const parts = pr.answer.display.split("，").map((s) => evalH(s.split("＝")[1]));
    return near(parts[0], E) && near(parts[1], Vv) && near(parts[2], Math.sqrt(Vv)) ? null : "期待値・分散が合わない";
  });

  const binomDist = gen("kB.binomDist", "次の問いに答えましょう。", lv({ types: ["EV", "lin"] }, { types: ["EV", "lin", "prob"] }, { types: ["prob", "lin", "EVinv"] }), (rng, type) => {
    if (type === "lin") {
      const E = rng.int(2, 20), Vv = rng.pick([4, 9, 16, 25, 2, 5]), a = nz(rng, -4, 4), b = rng.int(-10, 10);
      return { text: `確率変数 [[v:X]] の期待値が ${E}、分散が ${Vv} のとき、[[v:Y]]＝${pTex([Q(a), Q(b)], "X")} の期待値 [[v:E]]([[v:Y]])、分散 [[v:V]]([[v:Y]])、標準偏差 σ([[v:Y]])`, ans: `[[v:E]]([[v:Y]])＝${a * E + b}，[[v:V]]([[v:Y]])＝${a * a * Vv}，σ([[v:Y]])＝${rootTex(a * a * Vv)}`, wide: true, meta: { v: [a * E + b, a * a * Vv, Math.abs(a) * Math.sqrt(Vv)] } };
    }
    const p = rng.pick([Q(1, 2), Q(1, 3), Q(1, 4), Q(1, 5), Q(1, 6), Q(2, 3), Q(3, 4), Q(2, 5)]), n = p[1] * rng.int(4, 40);
    const E = qm(Q(n), p), Vv = qm(E, qs(Q(1), p));
    const desc = qeq(p, Q(1, 6)) ? `1個のさいころを ${n}回投げるとき、1の目が出る回数 [[v:X]]` : qeq(p, Q(1, 2)) ? `1枚の硬貨を ${n}回投げるとき、表が出る回数 [[v:X]]` : `二項分布 [[v:B]](${n}, ${num(p)}) に従う確率変数 [[v:X]]`;
    if (type === "EV") return { text: `${desc} の期待値 [[v:E]]([[v:X]]) と標準偏差 σ([[v:X]])`, ans: `[[v:E]]([[v:X]])＝${num(E)}，σ([[v:X]])＝${sdTex(Vv)}`, wide: true, meta: { v: [qv(E), Math.sqrt(qv(Vv))] } };
    if (type === "EVinv") {
      return { text: `二項分布 [[v:B]]([[v:n]], [[v:p]]) に従う確率変数 [[v:X]] の期待値が ${num(E)}、分散が ${num(Vv)} のとき、[[v:n]] と [[v:p]] の値`, ans: `[[v:n]]＝${n}，[[v:p]]＝${num(p)}`, wide: true, meta: { np: [n, qv(p), qv(E), qv(Vv)] } };
    }
    // P(X＝k)(小さい n)
    const n2 = rng.int(4, 6), p2 = rng.pick([Q(1, 2), Q(1, 3), Q(1, 6)]), k = rng.int(1, n2 - 1);
    const P2 = qm(Q(nCr(n2, k)), qm(K.qpow(p2, k), K.qpow(qs(Q(1), p2), n2 - k)));
    return { text: `確率変数 [[v:X]] が二項分布 [[v:B]](${n2}, ${num(p2)}) に従うとき、[[v:P]]([[v:X]]＝${k})`, ans: num(P2), meta: { v: [qv(P2)] } };
  }, (pr) => {
    const m = pr.meta;
    if (m.np) {
      const [n, p, E, Vv] = m.np;
      return near(n * p, E) && near(n * p * (1 - p), Vv) ? null : "n, p が合わない";
    }
    const parts = pr.answer.display.split("，").map((s) => evalH(s.includes("＝") ? s.split("＝")[1] : s));
    return m.v.every((v, i) => near(parts[i], v)) ? null : "値が合わない";
  }, { work: 30 });

  // 正規分布・推定・検定(文章題)
  const ZT = { 0.5: 0.1915, 1: 0.3413, 1.5: 0.4332, 2: 0.4772, 2.5: 0.4938, 3: 0.4987, 1.96: 0.475 };
  const STW = {
    normal: (rng) => {
      const m = rng.pick([50, 60, 165, 170, 500]), s = rng.pick([5, 10, 4, 8, 20]), z = rng.pick([0.5, 1, 1.5, 2]), up = rng.chance(0.5);
      const x = up ? m + z * s : m - z * s, p = 0.5 - ZT[z];
      return { t: `ある集団の身長(または得点) [[v:X]] は、平均 ${m}、標準偏差 ${s} の正規分布に従うとします。[[v:X]]${up ? "≧" : "≦"}${x} となる確率を求めましょう。ただし、標準正規分布で P(0≦[[v:Z]]≦${z})＝${ZT[z]} とします。`, a: fnum(p, 4) };
    },
    count: (rng) => {
      const N = rng.pick([1000, 2000, 500]), m = 60, s = 10, z = rng.pick([1, 1.5, 2]), x = m + z * s, p = 0.5 - ZT[z];
      return { t: `${N}人の生徒の数学のテストの得点は、平均 ${m}点、標準偏差 ${s}点の正規分布に従うとします。${x}点以上の生徒はおよそ何人いると考えられますか。ただし、P(0≦[[v:Z]]≦${z})＝${ZT[z]} とします。`, a: `およそ ${Math.round(N * p)}人` };
    },
    est: (rng) => {
      const n = rng.pick([100, 400, 900, 1600]), s = rng.pick([10, 20, 30, 40]), xb = rng.int(50, 200);
      const w = 1.96 * s / Math.sqrt(n);
      return { t: `ある工場の製品から ${n}個を無作為に抽出して重さを調べたところ、平均は ${xb}g でした。母標準偏差を ${s}g とするとき、母平均 [[v:m]] に対する信頼度 95% の信頼区間を求めましょう。小数第2位を四捨五入して答えましょう。`, a: `${fnum(Math.round((xb - w) * 10) / 10, 1)}≦[[v:m]]≦${fnum(Math.round((xb + w) * 10) / 10, 1)}` };
    },
    test: (rng) => {
      const n = rng.pick([100, 400, 900]), half = n / 2, sd = Math.sqrt(n) / 2, k = rng.pick([1.5, 2, 2.5, 3]), x = half + k * sd;
      if (!Number.isInteger(x)) return null;
      const rej = k > 1.96;
      return { t: `1枚の硬貨を ${n}回投げたところ、表が ${x}回出ました。この硬貨は表と裏の出やすさにかたよりがあると判断してよいですか。有意水準 5% で検定しましょう。ただし、表の出る回数は正規分布で近似でき、P(|[[v:Z]]|≦1.96)＝0.95 とします。`, a: `[[v:Z]]＝[[f:${x}－${half}/${sd}]]＝${k}${rej ? "＞" : "＜"}1.96 より、${rej ? "帰無仮説は棄却され、かたよりがあると判断してよい" : "帰無仮説は棄却されず、かたよりがあるとは判断できない"}` };
    },
    meanSd: (rng) => {
      const m = rng.int(40, 80), s = rng.pick([12, 15, 20, 18]), n = rng.pick([9, 16, 25, 36, 100]);
      return { t: `母平均 ${m}、母標準偏差 ${s} の母集団から、大きさ ${n} の標本を無作為に抽出するとき、標本平均 [[v:X]] の期待値と標準偏差を求めましょう。`.replace("[[v:X]]", "[[bar:[[v:X]]]]"), a: `期待値 ${m}，標準偏差 ${surdAns("", s / Math.sqrt(n))}` };
    }
  };
  const statWord = gen("kB.stat", null, lv({ types: ["normal", "meanSd"] }, { types: ["normal", "count", "est", "meanSd"] }, { types: ["est", "test", "count"] }), (rng, type) => {
    const r = STW[type](rng);
    if (!r) return null;
    return { text: r.t, ans: r.a, softKey: type, ws: { type: "lines", labels: ["答え"] }, work: 45 };
  });
  H["kB.randVar"] = "E(X)＝Σx[[_k]]p[[_k]]、V(X)＝E(X²)－{E(X)}²、σ(X)＝√{V(X)}。";
  H["kB.binomDist"] = "二項分布 B(n, p) では E(X)＝np、V(X)＝np(1－p)。Y＝aX＋b なら E(Y)＝aE(X)＋b、V(Y)＝a²V(X)。";
  H["kB.stat"] = "Z＝[[f:X－m/σ]] で標準正規分布に。標本平均の標準偏差は [[f:σ/√{n}]]。信頼度 95% の信頼区間は [[bar:X]]±1.96×[[f:σ/√{n}]]。";

  for (const [k, v] of Object.entries(H)) K.hints[k] = X(v);
  return [arith, geom, sigma, diffSeq, seqWord, recur, recurTerms, induction, recurWord, randVar, binomDist, statWord];
})();

var kouBGrade = (() => {
  const T = (label, generator, kinds, o = {}) => ({ label, generator, kinds, ...o });
  const D = ["drill", "test"], W = ["word", "test"], F = ["figure", "test"];
  const units = [
    ["kB-01", "数列", "数列", [T("等差数列", "kB.arith", D, { weight: 2 }), T("等比数列", "kB.geom", D, { weight: 2 }), T("和の記号 Σ", "kB.sigma", D, { weight: 2 }), T("階差数列", "kB.diffSeq", D), T("数列の利用", "kB.seqWord", W)], { drill: [14, 5], word: [3, 10] }],
    ["kB-02", "漸化式と数学的帰納法", "数列", [T("漸化式と一般項", "kB.recur", D, { weight: 2 }), T("漸化式と項", "kB.recurTerms", D), T("数学的帰納法", "kB.induction", W), T("漸化式の利用", "kB.recurWord", W)], { drill: [8, 10], word: [2, 10] }],
    ["kB-03", "統計的な推測", "統計的な推測", [T("確率分布と期待値・分散", "kB.randVar", W), T("二項分布と期待値", "kB.binomDist", D, { weight: 2 }), T("正規分布・推定・検定", "kB.stat", W, { weight: 2 })], { drill: [6, 10], word: [4, 10] }]
  ];
  return {
    grade: 13,
    note: "高校 数学B。学習指導要領(平成30年告示)の内容。問題文はすべてこのファイルで作ったもの。",
    units: units.map(([id, name, domain, topics, testPlan], i) => ({ id, order: i + 1, name, rubyName: name, domain, topics, testPlan }))
  };
})();
