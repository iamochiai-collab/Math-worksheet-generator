// 数学Ⅰ(学習指導要領の内容の順:数と式 → 図形と計量 → 二次関数 → データの分析。教科書の章立てに合わせて 8 単元)
var kou1 = (() => {
  const K = kouLib;
  const { Q, qa, qs, qm, qd, qneg, qeq, qabs, isInt, qv, num, absTex, gcd, lv, typeOf, nz, X, V, evalH, near, sameH, pTex, pmul, padd, sg, sgQ, quadRoots, rootTex, surdTex, sqFree, gen, redo, pickN, clean, pAdd, pScale, pMul, polyTex } = K;
  const H = {};

  // ============================================================
  // 1 数と式(式の計算)
  // ============================================================
  // 多項式(文字 x, y)。キーは文字の並び("xxy" ＝ x²y)
  const P = (terms) => clean(Object.fromEntries(Object.entries(terms).map(([k, v]) => [k, Array.isArray(v) ? v : Q(v)])));
  const pt = (p) => polyTex(p);
  const randP2 = (rng, lead = 3) => P({ xx: nz(rng, -lead, lead), x: rng.int(-6, 6), "": rng.int(-7, 7) });
  const polyCalc = gen("k1.polyCalc", "次の式を計算しましょう。", lv({ types: ["add", "sub"] }, { types: ["lin", "lin", "sub"] }, { types: ["lin", "desc", "nest"] }), (rng, type) => {
    if (type === "desc") {
      // x について降べきの順に整理
      const a = nz(rng, -3, 3), b = nz(rng, -4, 4), c = rng.int(-5, 5), d = nz(rng, -3, 3), e = rng.int(-5, 5), f = rng.int(-6, 6);
      const p = P({ xx: a, xy: b, x: c, yy: d, y: e, "": f });
      const terms = rng.shuffle(Object.keys(p));
      const qtx = polyTex(p, { order: terms });
      const lin = (cy, c0) => {
        const s = polyTex(P({ y: cy, "": c0 }));
        return s;
      };
      const coefX = lin(b, c), cst = polyTex(P({ yy: d, y: e, "": f }));
      const xx = (a === 1 ? "" : a === -1 ? "－" : String(a).replace("-", "－")) + V("x") + "²";
      const mono = c ? null : polyTex(P({ xy: b }));
      const xPart = mono ? (mono.startsWith("－") ? mono : "＋" + mono) : `＋(${coefX})${V("x")}`;
      const cPart = cst === "0" ? "" : cst.startsWith("－") ? cst : "＋" + cst;
      const ans = xx + xPart + cPart;
      return { text: `${qtx} を [[v:x]] について降べきの順に整理`, ans, wide: true, meta: { q: qtx, a: ans, L: ["x", "y"] } };
    }
    const A = randP2(rng), B = randP2(rng);
    if (Object.keys(A).length < 3 || Object.keys(B).length < 2) return null;
    let k1 = 1, k2 = type === "add" ? 1 : -1;
    if (type === "lin") k1 = rng.pick([2, 3, -2]), k2 = rng.pick([-1, 2, -3, 3]);
    if (type === "nest") k1 = rng.pick([2, 3]), k2 = rng.pick([-1, -2]);
    const R = pAdd(pScale(A, Q(k1)), pScale(B, Q(k2)));
    const co = (k, first) => (k < 0 ? "－" : first ? "" : "＋") + (Math.abs(k) === 1 ? "" : Math.abs(k));
    let expr = `${co(k1, true)}[[v:A]]${co(k2)}[[v:B]]`;
    let res = R;
    if (type === "nest") {
      // 3A－{2B－(A－B)} の形
      expr = `${k1}[[v:A]]－｛${-k2 === 1 ? "" : -k2}[[v:B]]－([[v:A]]－[[v:B]])｝`;
      res = pAdd(pScale(A, Q(k1 + 1)), pScale(B, Q(k2 - 1)));
    }
    return { text: `[[v:A]]＝${pt(A)}，[[v:B]]＝${pt(B)} のとき、${expr}`, ans: pt(res), wide: true, meta: { A: pt(A), B: pt(B), k1, k2, nest: type === "nest", a: pt(res), L: ["x"] } };
  }, (pr) => {
    const m = pr.meta;
    if (m.q) return sameH(m.q, m.a, m.L) ? null : "整理が合わない";
    const want = m.nest ? `${m.k1}(${m.A})－(${-m.k2}(${m.B})－((${m.A})－(${m.B})))` : `${m.k1}(${m.A})＋(${m.k2})(${m.B})`;
    return sameH(want, m.a, ["x"]) ? null : "計算が合わない";
  });

  // 一次式(ax＋by＋c)を (…) で書く
  const linF = (a, b, c = 0, L1 = "x", L2 = "y") => {
    const terms = {};
    if (a) terms[L1] = Q(a);
    if (b) terms[L2] = Q(b);
    if (c) terms[""] = Q(c);
    return polyTex(clean(terms), { order: [L1, L2, ""].filter((k) => terms[k]) });
  };
  const expand = gen("k1.expand", "次の式を展開しましょう。", lv({ types: ["sq", "prod", "prod2"] }, { types: ["tri", "cube", "sumCube", "prod2v"] }, { types: ["four", "cube", "tri", "sumCube", "conj"] }), (rng, type) => {
    let q, L = ["x"];
    const a = rng.int(1, 4), b = nz(rng, -6, 6), c = rng.int(1, 3), d = nz(rng, -6, 6);
    if (type === "sq") q = `(${linF(a, 0, b)})²`;
    else if (type === "prod") q = `(${linF(1, 0, b)})(${linF(1, 0, d)})`;
    else if (type === "prod2") {
      if (a === 1 && c === 1) return null;
      q = `(${linF(a, 0, b)})(${linF(c, 0, d)})`;
    } else if (type === "prod2v") {
      L = ["x", "y"];
      q = `(${linF(a, b)})(${linF(c, d)})`;
    } else if (type === "tri") {
      L = ["x", "y"];
      q = `(${linF(1, nz(rng, -3, 3), nz(rng, -4, 4))})²`;
    } else if (type === "cube") {
      const s = rng.chance(0.5) ? 1 : -1;
      q = rng.chance(0.5) ? `(${linF(1, 0, s * rng.int(1, 4))})³` : (L = ["x", "y"], `(${linF(rng.int(1, 3), s * rng.int(1, 3))})³`);
    } else if (type === "sumCube") {
      const k = rng.int(1, 5), m = rng.int(1, 3), s = rng.chance(0.5) ? 1 : -1;
      // (mx＋sk)(m²x²－smkx＋k²)
      q = `(${linF(m, 0, s * k)})(${pTex([Q(m * m), Q(-s * m * k), Q(k * k)])})`;
    } else if (type === "conj") {
      L = ["x", "y"];
      const k = nz(rng, -5, 5);
      q = `(${linF(1, 1, k)})(${linF(1, 1, -k)})`;
    } else {
      // (x＋p)(x＋q)(x＋r)(x＋s) で p＋s＝q＋r
      const p0 = rng.int(-4, 4), q0 = rng.int(-4, 4), r0 = rng.int(-4, 4), s0 = q0 + r0 - p0;
      if (new Set([p0, q0, r0, s0]).size < 4 || Math.abs(s0) > 6 || !p0 || !q0 || !r0 || !s0) return null;
      q = [p0, q0, r0, s0].map((v) => `(${linF(1, 0, v)})`).join("");
    }
    const ans = expandTex(q, L);
    return { text: q, ans, meta: { q, L } };
  }, (pr) => sameH(pr.meta.q, pr.answer.display, pr.meta.L) && !/\(/.test(pr.answer.display) ? null : "展開が合わない");
  // 式を展開した形(係数を数値で求める:x, y について 4次まで)
  function expandTex(q, L) {
    const vals = {};
    const deg = 4;
    // 係数を、いろいろな値を入れた連立方程式で求める代わりに、多項式のかけ算で計算する
    const toks = q.match(/\([^()]*\)[²³]?/g);
    let r = P({ "": 1 });
    for (const t of toks) {
      const e = t.endsWith("²") ? 2 : t.endsWith("³") ? 3 : 1;
      const inner = t.replace(/^\(|\)[²³]?$/g, "");
      const f = parseLin(inner);
      for (let i = 0; i < e; i++) r = pMul(r, f);
    }
    return polyTex(r);
  }
  // [[v:x]] などの文字を含む多項式の文字列を読む(係数は整数、x² まで)
  function parseLin(s) {
    const out = {};
    const re = /([＋－]?)(\d*)((?:\[\[v:[a-z]\]\][²³]?)*)/g;
    let m;
    while ((m = re.exec(s)) && m[0] !== "") {
      const sign = m[1] === "－" ? -1 : 1, c = m[2] ? Number(m[2]) : 1;
      let key = "";
      for (const mm of m[3].matchAll(/\[\[v:([a-z])\]\]([²³]?)/g)) key += mm[1].repeat(mm[2] === "²" ? 2 : mm[2] === "³" ? 3 : 1);
      key = [...key].sort().join("");
      out[key] = qa(out[key] || Q(0), Q(sign * c));
    }
    return clean(out);
  }

  // 因数分解
  const fac = (a, b, L = "x", L2 = null) => `(${L2 ? linF(a, b, 0, L, L2) : linF(a, 0, b, L)})`;
  const facPair = (f1, f2) => f1 === f2 ? `${f1}²` : f1 + f2;
  const factor = gen("k1.factor", "次の式を因数分解しましょう。", lv({ types: ["tasuki", "tasuki", "common"] }, { types: ["tasuki", "twoVar", "cube", "sub"] }, { types: ["quart", "arrange", "cube", "sub", "twoVar"] }), (rng, type) => {
    if (type === "tasuki" || type === "twoVar") {
      const two = type === "twoVar";
      const a = rng.int(1, 4), c = rng.int(1, 4), b = nz(rng, -7, 7), d = nz(rng, -7, 7);
      if (a * c === 1 || gcd(a, b) !== 1 || gcd(c, d) !== 1) return null;
      const f1 = fac(a, b, "x", two ? "y" : null), f2 = fac(c, d, "x", two ? "y" : null);
      const q = two ? polyTex(P({ xx: a * c, xy: a * d + b * c, yy: b * d })) : pTex([Q(a * c), Q(a * d + b * c), Q(b * d)]);
      if (/\[\[v:x\]\]²$/.test(q) || !q.includes("[[v:x]]＋") && !q.includes("[[v:x]]－") && !two) return null;
      return { text: q, ans: facPair(f1, f2), meta: { q, L: two ? ["x", "y"] : ["x"] } };
    }
    if (type === "common") {
      const k = rng.int(2, 5), p = rng.int(1, 6), s = rng.int(0, 2);
      const q = s === 0 ? pTex([Q(k), Q(0), Q(-k * p * p)]) : s === 1 ? pTex([Q(k), Q(2 * k * p), Q(k * p * p)]) : pTex([Q(k), Q(-k * (p + 1)), Q(k * p)]);
      const ans = s === 0 ? `${k}${fac(1, p)}${fac(1, -p)}` : s === 1 ? `${k}${fac(1, p)}²` : p === 1 ? `${k}${fac(1, -1)}²` : `${k}${fac(1, -1)}${fac(1, -p)}`;
      return { text: q, ans, meta: { q, L: ["x"] } };
    }
    if (type === "cube") {
      const m = rng.int(1, 3), k = rng.int(1, 5), s = rng.chance(0.5) ? 1 : -1;
      if (m === k && m > 1) return null;
      const q = pTex([Q(m ** 3), Q(0), Q(0), Q(s * k ** 3)]);
      const ans = `${fac(m, s * k)}(${pTex([Q(m * m), Q(-s * m * k), Q(k * k)])})`;
      return { text: q, ans, meta: { q, L: ["x"] } };
    }
    if (type === "sub") {
      // (x＋y)²＋p(x＋y)＋q を、x＋y ＝ t と置いて
      const r1 = nz(rng, -6, 6), r2 = nz(rng, -6, 6);
      if (r1 === r2 || r1 === -r2) return null;
      const k = nz(rng, -3, 3), inner = linF(1, 1, 0) + (rng.chance(0.4) ? "" : sg(k));
      const B = -(r1 + r2), Cc = r1 * r2;
      const q = `(${inner})²${B ? (B < 0 ? "－" : "＋") + (Math.abs(B) === 1 ? "" : Math.abs(B)) + `(${inner})` : ""}${sg(Cc)}`;
      if (!B) return null;
      const f = (r) => `(${inner}${sg(-r)})`;
      const simp = (s2) => s2.replace(/([＋－]\d+)([＋－]\d+)\)/g, (_, a1, a2) => {
        const v = Number(a1.replace("＋", "").replace("－", "-")) + Number(a2.replace("＋", "").replace("－", "-"));
        return v === 0 ? ")" : (v < 0 ? "－" : "＋") + Math.abs(v) + ")";
      });
      return { text: q, ans: simp(f(r1)) + simp(f(r2)), meta: { q, L: ["x", "y"] } };
    }
    if (type === "quart") {
      // x⁴＋bx²＋c で x² ＝ t
      if (rng.chance(0.3)) {
        const k = rng.int(1, 3);
        // x⁴＋k²x²＋k⁴ ＝ (x²＋kx＋k²)(x²－kx＋k²)
        const q = pTex([Q(1), Q(0), Q(k * k), Q(0), Q(k ** 4)]);
        return { text: q, ans: `(${pTex([Q(1), Q(k), Q(k * k)])})(${pTex([Q(1), Q(-k), Q(k * k)])})`, meta: { q, L: ["x"] } };
      }
      const a = rng.int(1, 3), b = rng.int(a + 1, 5);
      const q = pTex([Q(1), Q(0), Q(-(a * a + b * b)), Q(0), Q(a * a * b * b)]);
      return { text: q, ans: `${fac(1, a)}${fac(1, -a)}${fac(1, b)}${fac(1, -b)}`, meta: { q, L: ["x"] } };
    }
    // x² ＋ (y の式)x ＋ … を x について整理して (x＋py＋q)(x＋ry＋s)
    const p1 = nz(rng, -2, 2), q1 = nz(rng, -4, 4), r1 = nz(rng, -2, 2), s1 = nz(rng, -4, 4);
    if (p1 === r1 && q1 === s1) return null;
    const prod = pMul(P({ x: 1, y: p1, "": q1 }), P({ x: 1, y: r1, "": s1 }));
    if (Object.keys(prod).length < 6) return null;
    const q = polyTex(prod);
    return { text: q, ans: `(${linF(1, p1, q1)})(${linF(1, r1, s1)})`, wide: true, meta: { q, L: ["x", "y"] } };
  }, (pr) => {
    const a = pr.answer.display;
    if (!/^[^()]*\(/.test(a)) return "因数分解の形でない";
    return sameH(pr.meta.q, a, pr.meta.L) ? null : "因数分解が合わない";
  });
  H["k1.polyCalc"] = "かっこをはずし、同類項(文字の部分が同じ項)をまとめます。";
  H["k1.expand"] = "(a＋b)³＝a³＋3a²b＋3ab²＋b³、(a＋b)(a²－ab＋b²)＝a³＋b³。4つのかけ算は、組み合わせを工夫して同じ式を作ります。";
  H["k1.factor"] = "まず共通因数をくくり出します。たすきがけ、a³＋b³＝(a＋b)(a²－ab＋b²)、置きかえ(x＋y＝t など)を使います。";

  // ============================================================
  // 2 実数・一次不等式
  // ============================================================
  const DOT = "̇";
  const recurDec = (intPart, pre, rep) => `${intPart}.${pre}${[...rep].map((d, i) => i === 0 || i === rep.length - 1 ? `[[dot:${d}]]` : d).join("")}`;
  const realNum = gen("k1.realNum", "次の問いに答えましょう。", lv({ types: ["recur", "abs"] }, { types: ["recur", "abs", "absSurd"] }, { types: ["recur2", "absSurd", "absSum"] }), (rng, type) => {
    if (type === "recur" || type === "recur2") {
      const len = type === "recur" ? rng.int(1, 2) : rng.int(2, 3), preLen = type === "recur2" ? rng.int(0, 1) : 0;
      const rep = Array.from({ length: len }, () => rng.int(0, 9)).join(""), pre = preLen ? String(rng.int(1, 9)) : "";
      if (/^(\d)\1*$/.test(rep) && len > 1 || rep === "0" || rep === "9" || /^0+$/.test(rep) || /^9+$/.test(rep)) return null;
      const ip = rng.chance(0.3) ? rng.int(1, 3) : 0;
      // 値 ＝ ip ＋ (pre rep − pre)/(10^preLen (10^len − 1))
      const numr = Number(pre + rep) - Number(pre || 0), den = 10 ** preLen * (10 ** len - 1);
      const v = qa(Q(ip), Q(numr, den));
      if (v[1] === 1) return null;
      return { text: `循環小数 ${recurDec(ip, pre, rep)} を分数で表す`, ans: num(v), meta: { v: qv(v), s: { ip, pre, rep } } };
    }
    if (type === "abs") {
      const a = rng.int(-12, 12), b = rng.int(-9, 9);
      const q = rng.chance(0.5) ? `|${num(Q(a))}|` : `|${num(Q(a))}${sg(b)}|－|${num(Q(b))}|`;
      return { text: `${q} の値`, ans: num(Q(Math.round(evalH(q)))), meta: { q } };
    }
    if (type === "absSurd") {
      const n = rng.pick([2, 3, 5, 6, 7, 10]), k = rng.int(1, 4);
      const q = `|√{${n}}－${k}|`;
      const ans = Math.sqrt(n) > k ? `√{${n}}－${k}` : `${k}－√{${n}}`;
      return { text: `${q} の値`, ans, meta: { q } };
    }
    const n = rng.pick([2, 3, 5]), k1 = Math.floor(Math.sqrt(n)), k2 = k1 + 1;
    const q = `|√{${n}}－${k1}|＋|√{${n}}－${k2}|`;
    return { text: `${q} の値`, ans: "1", meta: { q } };
  }, (pr) => {
    const m = pr.meta;
    if (m.s) {
      // 循環小数を長く書いて比べる
      const { ip, pre, rep } = m.s;
      const v = Number(`${ip}.${pre}${rep.repeat(12)}`);
      return near(v, evalH(pr.answer.display), 1e-9) ? null : "循環小数の値が合わない";
    }
    return near(evalH(m.q), evalH(pr.answer.display)) ? null : "値が合わない";
  });

  // 根号をふくむ式の計算・分母の有理化・二重根号
  const NS = [2, 3, 5, 6, 7];
  const surd2 = gen("k1.surd", "次の式を計算しましょう。", lv({ types: ["rat1", "sqsum", "prod"] }, { types: ["rat2", "rat3", "sqsum", "prod"] }, { types: ["rat3", "double", "double", "ratSum"] }), (rng, type) => {
    const [m, n] = pickN(rng, NS, 2).sort((u, v) => v - u);
    let q;
    if (type === "rat1") {
      const k = rng.int(1, 4), s = rng.chance(0.5) ? "＋" : "－";
      const c = rng.int(1, 3);
      if (c * c === m) return null;
      q = `[[f:${k}/√{${m}}${s}${c}]]`;
    } else if (type === "rat2") q = `[[f:1/√{${m}}${rng.chance(0.5) ? "＋" : "－"}√{${n}}]]`;
    else if (type === "rat3") {
      const s = rng.chance(0.5);
      q = `[[f:√{${m}}${s ? "＋" : "－"}√{${n}}/√{${m}}${s ? "－" : "＋"}√{${n}}]]`;
    } else if (type === "ratSum") q = `[[f:1/√{${m}}＋√{${n}}]]＋[[f:1/√{${m}}－√{${n}}]]`;
    else if (type === "sqsum") {
      const a = rng.int(1, 3);
      q = `(${a === 1 ? "" : a}√{${m}}${rng.chance(0.5) ? "＋" : "－"}√{${n}})²`;
    } else if (type === "prod") {
      const a = rng.int(1, 3), b = nz(rng, -4, 4), c = rng.int(1, 3), d = nz(rng, -4, 4);
      q = `(${a === 1 ? "" : a}√{${m}}${sg(b)})(${c === 1 ? "" : c}√{${m}}${sg(d)})`;
    } else {
      // √{(a＋b)±2√{ab}} ＝ √a ± √b
      const s = rng.chance(0.5);
      const a = rng.int(2, 7), b = rng.int(1, a - 1), prod = a * b;
      if (Number.isInteger(Math.sqrt(prod))) return null;
      q = `√{${a + b}${s ? "＋" : "－"}${rootTex(4 * prod)}}`;
      return { text: q, ans: `√{${a}}${s ? "＋" : "－"}${b === 1 ? "1" : `√{${b}}`}`, meta: { q } };
    }
    const v = evalH(q);
    const ans = surdAns(q, v);
    if (!ans) return null;
    return { text: q, ans, meta: { q } };
  }, (pr) => {
    if (/\[\[f:[^\]]*\/[^\]]*√/.test(pr.answer.display)) return "分母に√が残っている";
    return near(evalH(pr.meta.q), evalH(pr.answer.display)) ? null : "値が合わない";
  });
  // 値 v を、p＋q√r(＋s√t)(p, q は有理数)の形で探す
  function surdAns(q, v) {
    const R = [1, 2, 3, 5, 6, 7, 10, 14, 15, 21, 30, 35, 42];
    for (const d of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) for (const r of R.slice(1)) for (let qq = -150; qq <= 150; qq++) {
      if (!qq) continue;
      const p = Math.round((v - qq / d * Math.sqrt(r)) * d);
      if (Math.abs(p / d + qq / d * Math.sqrt(r) - v) < 1e-9) return surdTex(Q(p, d), Q(qq, d), r);
    }
    // √a ＋ √b の形
    for (const d of [1, 2, 3, 4, 5, 6]) for (const a of [2, 3, 5, 6, 7]) for (const b of [2, 3, 5, 6, 7]) for (const ka of [-3, -2, -1, 1, 2, 3]) for (const kb of [-3, -2, -1, 1, 2, 3]) {
      if (a >= b || gcd(gcd(ka, kb), d) !== 1) continue;
      if (Math.abs((ka * Math.sqrt(a) + kb * Math.sqrt(b)) / d - v) < 1e-9) {
        const body = `${ka < 0 ? "－" : ""}${Math.abs(ka) === 1 ? "" : Math.abs(ka)}√{${a}}${kb < 0 ? "－" : "＋"}${Math.abs(kb) === 1 ? "" : Math.abs(kb)}√{${b}}`;
        if (d === 1) return body;
        if (ka < 0 && kb < 0) return `－[[f:${body.replace(/^－/, "").replace(/－/g, "＋")}/${d}]]`;
        return ka < 0 ? `[[f:${body.replace(/^－/, "").replace(/^(.*?)([＋－])(.*)$/, (m0, x1, op, x2) => `${x2}－${x1}`)}/${d}]]` : `[[f:${body}/${d}]]`;
      }
    }
    const iv = toQ(v);
    return iv ? num(iv) : null;
  }
  const toQ = K.toQ;

  // 対称式の値
  const symm = gen("k1.symm", "次の問いに答えましょう。", lv({ types: ["sumprod", "sq"] }, { types: ["sq", "cube", "frac"] }, { types: ["recip", "cube", "frac", "recip2"] }), (rng, type) => {
    if (type === "recip" || type === "recip2") {
      const k = rng.int(3, 7);
      const x = (k + Math.sqrt(k * k - 4)) / 2;
      const ask = type === "recip" ? ["x²＋[[f:1/x²]]", "x³＋[[f:1/x³]]"] : ["x⁴＋[[f:1/x⁴]]", "(x－[[f:1/x]])²"];
      const e = rng.pick(ask);
      const v = evalH(e, { x });
      return { text: X(`x＋[[f:1/x]]＝${k} のとき、${e} の値`), ans: String(Math.round(v)), meta: { x, e: X(e) } };
    }
    const m = rng.pick([2, 3, 5, 6, 7]), n = rng.pick([1, 2, 3, 5].filter((u) => u !== m && u < m));
    const xs = n === 1 ? `√{${m}}＋1` : `√{${m}}＋√{${n}}`, ys = n === 1 ? `√{${m}}－1` : `√{${m}}－√{${n}}`;
    const x = Math.sqrt(m) + Math.sqrt(n), y = Math.sqrt(m) - Math.sqrt(n);
    const pool = { sumprod: ["x＋y", "xy"], sq: ["x²＋y²", "x²－xy＋y²", "x²y＋xy²"], cube: ["x³＋y³", "x²＋y²", "x³y＋xy³"], frac: ["[[f:y/x]]＋[[f:x/y]]", "[[f:1/x]]＋[[f:1/y]]"] }[type];
    const e = rng.pick(pool), v = evalH(X(e), { x, y });
    const ans = surdAns(e, v);
    if (!ans) return null;
    return { text: X(`x＝${xs}，y＝${ys} のとき、${e} の値`), ans, meta: { x, y, e: X(e) } };
  }, (pr) => {
    const m = pr.meta;
    return near(evalH(m.e, m.y === undefined ? { x: m.x } : { x: m.x, y: m.y }), evalH(pr.answer.display)) ? null : "値が合わない";
  }, { work: 35 });
  H["k1.realNum"] = "循環小数は 10ⁿ 倍して引き算します。|a| は a≧0 なら a、a＜0 なら －a です。";
  H["k1.surd"] = "分母が √a＋√b なら、√a－√b を分母・分子にかけます。√{(a＋b)＋2√{ab}}＝√a＋√b です。";
  H["k1.symm"] = "x＋y と xy を先に求め、x²＋y²＝(x＋y)²－2xy、x³＋y³＝(x＋y)³－3xy(x＋y) を使います。";

  // 一次不等式
  // 解の表し方:{ op: "<"|"<="|">"|">=", v: Q } または 2つの区切り
  const OPS = { "<": "＜", "<=": "≦", ">": "＞", ">=": "≧" };
  const flip = { "<": ">", "<=": ">=", ">": "<", ">=": "<=" };
  const test = (op, x, v) => op === "<" ? x < v - 1e-12 : op === "<=" ? x <= v + 1e-12 : op === ">" ? x > v + 1e-12 : x >= v - 1e-12;
  const ineq1 = gen("k1.ineq", "次の不等式を解きましょう。", lv({ types: ["simple", "simple", "paren"] }, { types: ["paren", "frac", "simul"] }, { types: ["frac", "simul", "simul", "intCount"] }), (rng, type) => {
    const ops = ["<", "<=", ">", ">="];
    const one = () => {
      // ax＋b op cx＋d
      for (;;) {
        const a = nz(rng, -6, 6), c = rng.int(-5, 5), b = rng.int(-12, 12), d = rng.int(-12, 12);
        if (a === c) continue;
        const op = rng.pick(ops);
        const xv = Q(d - b, a - c);
        if (Math.abs(xv[1]) > 6) continue;
        const L = lin(a, b), Rt = lin(c, d);
        return { tex: `${L}${OPS[op]}${Rt}`, f: (x) => test(op, a * x + b, c * x + d), op: a - c > 0 ? op : flip[op], v: xv };
      }
    };
    const lin = (a, b) => pTex([Q(a), Q(b)]);
    let s;
    if (type === "simple") s = one();
    else if (type === "paren") {
      const a = rng.int(2, 4), b = nz(rng, -5, 5), c = nz(rng, -6, 6), d = rng.int(-9, 9), op = rng.pick(ops);
      const lhs = `${a}(${lin(1, b)})`, rhs = `${lin(c, d)}`;
      const A = a - c, B = d - a * b;
      if (!A) return null;
      s = { tex: `${lhs}${OPS[op]}${rhs}`, f: (x) => test(op, a * (x + b), c * x + d), op: A > 0 ? op : flip[op], v: Q(B, A) };
    } else if (type === "frac") {
      const p = rng.pick([2, 3, 4]), q = rng.pick([3, 4, 6].filter((u) => u !== p)), a = nz(rng, -4, 4), b = rng.int(1, 5), op = rng.pick(ops);
      const tex = `[[f:${lin(1, a)}/${p}]]－[[f:${lin(2, -b)}/${q}]]${OPS[op]}1`;
      const f = (x) => test(op, (x + a) / p - (2 * x - b) / q, 1);
      // 係数 1/p－2/q
      const A = qs(Q(1, p), Q(2, q)), B = qs(Q(1), qa(Q(a, p), Q(b, q)));
      if (!A[0]) return null;
      s = { tex, f, op: A[0] > 0 ? op : flip[op], v: qd(B, A) };
    }
    if (type === "simul" || type === "intCount") {
      const s1 = one(), s2 = one();
      const lo = (o) => o === ">" || o === ">=";
      if (lo(s1.op) === lo(s2.op)) return null;
      const [L1, U1] = lo(s1.op) ? [s1, s2] : [s2, s1];
      const tex = `[[sys:${s1.tex}||${s2.tex}:sys]]`;
      const f = (x) => s1.f(x) && s2.f(x);
      if (qv(L1.v) >= qv(U1.v) && !(qeq(L1.v, U1.v) && L1.op === ">=" && U1.op === "<=")) {
        if (type === "intCount") return null;
        return { text: tex, ans: "解はない", meta: { f, sol: { none: true } } };
      }
      if (qeq(L1.v, U1.v)) return { text: tex, ans: X(`x＝${num(L1.v)}`), meta: { f, sol: { eq: qv(L1.v) } } };
      const sol = `${num(L1.v)}${L1.op === ">" ? "＜" : "≦"}${V("x")}${U1.op === "<" ? "＜" : "≦"}${num(U1.v)}`;
      if (type === "intCount") {
        let n = 0;
        for (let x = -60; x <= 60; x++) if (f(x)) n++;
        if (n < 1 || n > 12) return null;
        return { text: `${tex} を満たす整数 [[v:x]] の個数`, ans: `${n}個`, meta: { f, cnt: n } };
      }
      return { text: tex, ans: sol, meta: { f, sol: { lo: [L1.op, qv(L1.v)], hi: [U1.op, qv(U1.v)] } } };
    }
    return { text: s.tex, ans: `${V("x")}${OPS[s.op]}${num(s.v)}`, meta: { f: s.f, sol: { one: [s.op, qv(s.v)] } } };
  }, (pr) => {
    const m = pr.meta;
    if (m.cnt !== undefined) {
      let n = 0;
      for (let x = -60; x <= 60; x++) if (m.f(x)) n++;
      return n === m.cnt ? null : "整数の個数が合わない";
    }
    // 解の範囲と、もとの不等式が、いろいろな x で一致するか
    const inSol = (x) => m.sol.none ? false : m.sol.eq !== undefined ? Math.abs(x - m.sol.eq) < 1e-9 : m.sol.one ? test(m.sol.one[0], x, m.sol.one[1]) : test(m.sol.lo[0], x, m.sol.lo[1]) && test(m.sol.hi[0], x, m.sol.hi[1]);
    const ends = [m.sol.one?.[1], m.sol.lo?.[1], m.sol.hi?.[1], m.sol.eq].filter((v) => v !== undefined);
    const xs = [];
    for (let x = -40; x <= 40; x += 0.25) xs.push(x);
    for (const e of ends) xs.push(e, e - 1e-6, e + 1e-6);
    for (const x of xs) if (inSol(x) !== m.f(x)) return `解がちがう x=${x}`;
    return null;
  });

  // 絶対値をふくむ方程式・不等式
  const absEq = gen("k1.absEq", "次の方程式・不等式を解きましょう。", lv({ types: ["eq", "lt", "gt"] }, { types: ["eq", "lt", "gt", "eq2"] }, { types: ["eqx", "ltx", "eq2", "gt"] }), (rng, type) => {
    const a = nz(rng, -6, 6), b = rng.int(1, 8), k = type === "eq2" ? rng.int(2, 3) : 1;
    const inner = pTex([Q(k), Q(-a)]);
    if (type === "eq" || type === "eq2") {
      const r1 = Q(a - b, k), r2 = Q(a + b, k);
      return { text: `|${inner}|＝${b}`, ans: X(`x＝${num(r1)}, ${num(r2)}`), meta: { f: (x) => Math.abs(Math.abs(k * x - a) - b) < 1e-9, pts: [qv(r1), qv(r2)] } };
    }
    if (type === "lt") return { text: `|${inner}|＜${b}`, ans: `${num(Q(a - b))}＜${V("x")}＜${num(Q(a + b))}`, meta: { f: (x) => Math.abs(x - a) < b, rng: [a - b, a + b, "in"] } };
    if (type === "gt") return { text: `|${inner}|≧${b}`, ans: `${V("x")}≦${num(Q(a - b))}, ${num(Q(a + b))}≦${V("x")}`, meta: { f: (x) => Math.abs(x - a) >= b, rng: [a - b, a + b, "outEq"] } };
    // |x－a| ＝ cx＋d(場合分け)
    const c = rng.pick([2, 3, -2]), d = rng.int(-6, 6);
    const f = (x) => Math.abs(Math.abs(x - a) - (c * x + d)) < 1e-9;
    if (type === "eqx") {
      const sols = [];
      // x≧a: x－a ＝ cx＋d → x ＝ (a＋d)/(1－c)
      const s1 = Q(a + d, 1 - c);
      if (qv(s1) >= a) sols.push(s1);
      const s2 = Q(a - d, 1 + c);
      if (qv(s2) < a) sols.push(s2);
      if (!sols.length) return null;
      sols.sort((u, v) => qv(u) - qv(v));
      return { text: `|${pTex([Q(1), Q(-a)])}|＝${pTex([Q(c), Q(d)])}`, ans: X(`x＝${sols.map(num).join(", ")}`), meta: { f, pts: sols.map(qv) } };
    }
    // |x－a| ＜ 2x＋d:x≧a と x＜a に分けると、解は x ＞ (a－d)/3(d＞－2a のとき)、x ＞ －a－d(それ以外)
    const cc = 2;
    const g = (x) => Math.abs(x - a) < cc * x + d;
    const lo = d > -2 * a ? Q(a - d, 3) : Q(-a - d);
    return { text: `|${pTex([Q(1), Q(-a)])}|＜${pTex([Q(cc), Q(d)])}`, ans: `${V("x")}＞${num(lo)}`, meta: { f: g, rng: [qv(lo), null, "gt"] } };
  }, (pr) => {
    const m = pr.meta;
    if (m.pts) {
      for (let x = -30; x <= 30; x += 0.125) {
        const isP = m.pts.some((p) => Math.abs(p - x) < 1e-9);
        if (m.f(x) !== isP) return `解がちがう x=${x}`;
      }
      return m.pts.every((p) => m.f(p)) ? null : "解が式を満たさない";
    }
    const [lo, hi, kind] = m.rng;
    for (let x = -30; x <= 30; x += 0.125) {
      const want = kind === "in" ? x > lo && x < hi : kind === "outEq" ? x <= lo || x >= hi : x > lo;
      if (m.f(x) !== want) return `解がちがう x=${x}`;
    }
    return null;
  });

  // 不等式の文章題
  const INEQW = {
    buy: (rng) => {
      const pa = rng.pick([120, 150, 180, 200]), pb = rng.pick([60, 80, 90, 100].filter((v) => v < pa)), n = rng.int(10, 20), lo = Math.ceil(pb * n / 100) + 3, hi = Math.floor(pa * n / 100) - 2;
      if (lo > hi) return null;
      const lim = rng.int(lo, hi) * 100;
      // x 個を pa、残りを pb: pa x ＋ pb(n－x) ≦ lim
      const x = Math.floor((lim - pb * n) / (pa - pb));
      if (x < 1 || x >= n) return null;
      return { t: `1個${pa}円のりんごと1個${pb}円のみかんを合わせて${n}個買い、代金の合計を${lim}円以下にしたい。りんごをできるだけ多く買うとき、りんごは何個買えますか。`, e: X(`${pa}x＋${pb}(${n}－x)≦${lim}`), a: `${x}個`, v: x };
    },
    plan: (rng) => {
      const fee = rng.pick([500, 800, 1000, 1200]), per = rng.pick([150, 200, 250]), alt = per + rng.pick([50, 100, 150]);
      // 会員 fee ＋ per x ＜ alt x → x ＞ fee/(alt－per)
      const x = Math.floor(fee / (alt - per)) + 1;
      if (x > 30) return null;
      return { t: `プールの入場料は1回${alt}円です。年会費${fee}円を払って会員になると、1回${per}円で入場できます。会員になったほうが安くなるのは、1年に何回以上入場するときですか。`, e: X(`${fee}＋${per}x＜${alt}x`), a: `${x}回以上`, v: x };
    },
    walk: (rng) => {
      const d = rng.pick([2000, 2400, 3000, 3600]), v1 = rng.pick([60, 70, 80]), v2 = rng.pick([150, 180, 200, 240]), lo = Math.ceil(d / v2) + 2, hi = Math.floor(d / v1) - 1;
      if (lo > hi) return null;
      const T = rng.int(lo, hi);
      // x m を走り、残りを歩く: x/v2 ＋ (d－x)/v1 ≦ T → x ≧ (d/v1 －T)·v1v2/(v2－v1)
      const xmin = (d / v1 - T) * v1 * v2 / (v2 - v1);
      if (xmin <= 0) return null;
      const ans = Math.ceil(xmin);
      if (Math.abs(xmin - Math.round(xmin)) > 1e-9 && ans % 10 !== 0) return null;
      return { t: `家から${d}m離れた駅まで行くのに、はじめは分速${v1}mで歩き、途中から分速${v2}mで走ります。${T}分以内に駅に着くには、走る道のりを何m以上にすればよいですか。`, e: X(`[[f:${d}－x/${v1}]]＋[[f:x/${v2}]]≦${T}`), a: `${ans}m以上`, v: ans };
    },
    salt: (rng) => {
      const w = rng.pick([200, 300, 400]), p = rng.pick([4, 5, 6]), q = rng.pick([10, 12, 15]), r = rng.int(p + 1, q - 1);
      // p% を w g と q% を x g 混ぜて r% 以上
      const xmin = w * (r - p) / (q - r);
      if (!Number.isInteger(xmin)) return null;
      return { t: `${p}%の食塩水${w}gに${q}%の食塩水を混ぜて、${r}%以上の食塩水を作りたい。${q}%の食塩水を何g以上混ぜればよいですか。`, e: X(`[[f:${p}/100]]×${w}＋[[f:${q}/100]]x≧[[f:${r}/100]](${w}＋x)`), a: `${xmin}g以上`, v: xmin };
    }
  };
  const ineqWord = gen("k1.ineqWord", null, lv({ types: ["buy", "plan"] }, { types: ["buy", "plan", "walk"] }, { types: ["walk", "salt", "buy"] }), (rng, type) => {
    const r = INEQW[type](rng);
    if (!r) return null;
    return { text: r.t, ans: `式 ${r.e}　答え ${r.a}`, softKey: type, meta: {}, ws: { type: "lines", labels: ["式", "", "答え"], wideLabel: true }, work: 50 };
  });
  H["k1.ineq"] = "不等式の両辺に負の数をかけたり、負の数でわったりすると、不等号の向きが変わります。連立不等式は、それぞれの解の共通な範囲です。";
  H["k1.absEq"] = "|X|＝c なら X＝±c、|X|＜c なら －c＜X＜c、|X|＞c なら X＜－c, c＜X。文字のある右辺は場合分けします。";
  H["k1.ineqWord"] = "求める数量を x として不等式をつくり、問題に合う(整数など)答えを選びます。";

  // ============================================================
  // 3 集合と命題
  // ============================================================
  const setTex = (s) => s.length ? `｛${s.join(", ")}｝` : "∅";
  const setOps = gen("k1.setOps", "次の問いに答えましょう。", lv({ types: ["and", "or", "comp"] }, { types: ["and", "or", "compAnd", "deMorgan"] }, { types: ["compAnd", "deMorgan", "deMorgan2", "solve"] }), (rng, type) => {
    const N = rng.pick([10, 12]), U = Array.from({ length: N }, (_, i) => i + 1);
    const k = rng.pick([2, 3]), A = U.filter((x) => x % k === 0);
    const B = U.filter(() => rng.chance(0.45));
    if (B.length < 3 || B.length > 7) return null;
    const Ac = U.filter((x) => !A.includes(x)), Bc = U.filter((x) => !B.includes(x));
    const and = A.filter((x) => B.includes(x)), or = U.filter((x) => A.includes(x) || B.includes(x));
    const lead = `全体集合 [[v:U]]＝｛${V("x")} ｜ ${V("x")} は ${N} 以下の自然数｝，[[v:A]]＝｛${V("x")} ｜ ${V("x")} は ${k} の倍数｝，[[v:B]]＝${setTex(B)} のとき、`;
    const ask = { and: ["[[v:A]]∩[[v:B]]", and], or: ["[[v:A]]∪[[v:B]]", or], comp: ["[[bar:[[v:A]]]]", Ac], compAnd: ["[[bar:[[v:A]]]]∩[[v:B]]", Ac.filter((x) => B.includes(x))], deMorgan: ["[[bar:[[v:A]]∪[[v:B]]]]", U.filter((x) => !or.includes(x))], deMorgan2: ["[[bar:[[v:A]]]]∪[[bar:[[v:B]]]]", U.filter((x) => !and.includes(x))] };
    if (type === "solve") {
      // A∩B̄ の要素の個数など
      const s = Ac.filter((x) => !B.includes(x));
      return { text: `${lead}[[bar:[[v:A]]]]∩[[bar:[[v:B]]]] を、要素を書き並べて表す`, ans: setTex(s), wide: true, meta: { want: s, got: s } };
    }
    const [e, s] = ask[type];
    return { text: `${lead}${e} を、要素を書き並べて表す`, ans: setTex(s), wide: true, softKey: type, meta: { want: s } };
  }, (pr) => {
    const m = pr.meta;
    return setTex(m.want) === pr.answer.display ? null : "集合が合わない";
  }, { work: 20 });

  // 必要条件・十分条件
  const COND = [
    // [p, q, p⇒q, q⇒p]
    (rng) => {
      const a = rng.int(1, 6);
      return [X(`x＝${a}`), X(`x²＝${a * a}`), true, false];
    },
    (rng) => {
      const a = rng.int(1, 5), b = rng.int(a + 1, 8);
      return [X(`x＞${b}`), X(`x＞${a}`), true, false];
    },
    (rng) => {
      const a = rng.int(1, 6);
      return [X(`x²＝${a}x`), X(`x＝${a}`), false, true];
    },
    (rng) => {
      const a = rng.int(1, 6);
      return [X(`|x|＜${a}`), X(`－${a}＜x＜${a}`), true, true];
    },
    () => [X("xy＝0"), X("x＝0"), false, true],
    () => [X("x＞0 かつ y＞0"), X("x＋y＞0 かつ xy＞0"), true, true],
    () => [X("x＞0 かつ y＞0"), X("x＋y＞0"), true, false],
    () => [X("x²＋y²＝0"), X("x＝y＝0"), true, true],
    (rng) => {
      const a = rng.int(2, 5);
      return [X(`x²＜${a * a}`), X(`x＜${a}`), true, false];
    },
    (rng) => {
      const a = rng.pick([2, 3]), b = a * rng.pick([2, 3]);
      return [`自然数 [[v:n]] が ${b} の倍数である`, `自然数 [[v:n]] が ${a} の倍数である`, true, false];
    },
    () => ["四角形が正方形である", "四角形がひし形である", true, false],
    () => ["四角形が平行四辺形である", "四角形の2本の対角線がそれぞれの中点で交わる", true, true],
    () => ["△ABC が正三角形である", "△ABC が二等辺三角形である", true, false],
    (rng) => {
      const a = rng.int(1, 4);
      return [X(`x＞${a}`), X(`x²＞${a * a}`), true, false];
    },
    () => [X("x＝1 または y＝1"), X("(x－1)(y－1)＝0"), true, true],
    () => [X("xy＞1"), X("x＞1"), false, false],
    () => [X("x＋y が有理数"), X("x と y がともに有理数"), false, true]
  ];
  const CHOICE = ["ア", "イ", "ウ", "エ"];
  const necSuf = gen("k1.necSuf", "[[v:p]] は [[v:q]] であるための何条件ですか。ア 必要十分条件、イ 必要条件であるが十分条件でない、ウ 十分条件であるが必要条件でない、エ 必要条件でも十分条件でもない、から選びましょう。", lv({ types: [0] }, { types: [0] }, { types: [0] }), (rng) => {
    const i = rng.int(0, COND.length - 1), [p, q, pq, qp] = COND[i](rng);
    const sw = rng.chance(0.4);
    const [P1, Q1, a, b] = sw ? [q, p, qp, pq] : [p, q, pq, qp];
    const c = a && b ? 0 : b ? 1 : a ? 2 : 3;
    return { text: `[[v:p]]：${P1}，[[v:q]]：${Q1}`, ans: CHOICE[c], key: `ns:${P1}:${Q1}`, softKey: String(i), wide: true, meta: { i, c, a, b } };
  }, (pr) => {
    const { a, b, c } = pr.meta;
    return CHOICE[a && b ? 0 : b ? 1 : a ? 2 : 3] === pr.answer.display && CHOICE[c] === pr.answer.display ? null : "条件の種類が合わない";
  });

  // 逆・裏・対偶と否定
  const PROP = [
    (rng) => {
      const a = rng.int(1, 5);
      return { p: X(`x＝${a}`), q: X(`x²＝${a * a}`), np: X(`x≠${a}`), nq: X(`x²≠${a * a}`), pq: true, qp: false };
    },
    (rng) => {
      const a = rng.int(1, 4);
      return { p: X(`x＞${a}`), q: X(`x＞0`), np: X(`x≦${a}`), nq: X("x≦0"), pq: true, qp: false };
    },
    () => ({ p: X("x＞0 かつ y＞0"), q: X("xy＞0"), np: X("x≦0 または y≦0"), nq: X("xy≦0"), pq: true, qp: false }),
    () => ({ p: X("x＋y＞2"), q: X("x＞1 または y＞1"), np: X("x＋y≦2"), nq: X("x≦1 かつ y≦1"), pq: true, qp: false }),
    () => ({ p: "[[v:n]] が偶数", q: "[[v:n]]² が偶数", np: "[[v:n]] が奇数", nq: "[[v:n]]² が奇数", pq: true, qp: true }),
    () => ({ p: X("xy＝0"), q: X("x＝0"), np: X("xy≠0"), nq: X("x≠0"), pq: false, qp: true })
  ];
  const contra = gen("k1.contra", "次の問いに答えましょう。", lv({ types: ["conv", "contra"] }, { types: ["conv", "inv", "contra", "neg"] }, { types: ["contra", "neg", "negAll", "conv"] }), (rng, type) => {
    if (type === "negAll") {
      const T = rng.pick([["すべての実数 [[v:x]] について [[v:x]]²≧0", "ある実数 [[v:x]] について [[v:x]]²＜0"], ["ある自然数 [[v:n]] について [[v:n]]²＝2[[v:n]]", "すべての自然数 [[v:n]] について [[v:n]]²≠2[[v:n]]"], ["すべての実数 [[v:x]] について [[v:x]]²－2[[v:x]]＋1＞0", "ある実数 [[v:x]] について [[v:x]]²－2[[v:x]]＋1≦0"], ["ある実数 [[v:x]] について [[v:x]]＞3", "すべての実数 [[v:x]] について [[v:x]]≦3"]]);
      return { text: `命題「${T[0]}」の否定を答えましょう。`, ans: `${T[1]}`, wide: true, meta: {} };
    }
    const i = rng.int(0, PROP.length - 1), P2 = PROP[i](rng);
    if (type === "neg") return { text: `条件「${P2.p}」の否定を答えましょう。`, ans: P2.np, wide: true, softKey: String(i), meta: {} };
    const name = { conv: "逆", inv: "裏", contra: "対偶" }[type];
    const [hp, hq, tv] = type === "conv" ? [P2.q, P2.p, P2.qp] : type === "inv" ? [P2.np, P2.nq, P2.qp] : [P2.nq, P2.np, P2.pq];
    return { text: `命題「${P2.p} ならば ${P2.q}」の${name}を書き、その真偽を答えましょう。`, ans: `${hp} ならば ${hq}(${tv ? "真" : "偽"})`, wide: true, softKey: `${i}:${type}`, meta: {} };
  }, null, { work: 20 });
  H["k1.setOps"] = "ド・モルガンの法則:[[bar:A∪B]]＝[[bar:A]]∩[[bar:B]]、[[bar:A∩B]]＝[[bar:A]]∪[[bar:B]]。ベン図をかいて考えます。";
  H["k1.necSuf"] = "p ⇒ q が真のとき、p は q であるための十分条件、q は p であるための必要条件です。偽を示すには反例を1つあげます。";
  H["k1.contra"] = "「p ならば q」の逆は「q ならば p」、裏は「[[bar:p]] ならば [[bar:q]]」、対偶は「[[bar:q]] ならば [[bar:p]]」。命題と対偶の真偽は一致します。「かつ」の否定は「または」です。";

  K.k1 = { P, linF, parseLin, surdAns, OPS, flip, test, H };
  return [polyCalc, expand, factor, realNum, surd2, symm, ineq1, absEq, ineqWord, setOps, necSuf, contra];
})();
