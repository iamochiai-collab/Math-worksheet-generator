// 中学3年(学習指導要領の内容の順)。√ は「√{3}」と書く(画面では根号の上に横線)。
var chu3 = (() => {
  const L = chuLib;
  const { RED, RUBY, R, fun, hon, gcd, Q, qa, qs, qm, qd, qneg, qeq, qabs, isInt, qv, absTex, num, sgn, SUP, evalQ, sameExpr, V, coefTex, lin, linPlain, nz, nz2, lv, typeOf, ALPHA, MARU, L_, T_, plane, draw, xs, ys, rad, fitBox, shiftItem, clean, pAdd, pScale, pMul, polyTex, monoTex, polyOf, lcm, vTex, angMark, rightMark, ticks, seg, vLabel, sideLabel, centroid, fitDraw, rayX, XL, deg, ptTex, sys } = L;
  Object.assign(RUBY, {
    平方根: "へいほうこん", 根号: "こんごう", 整数部分: "せいすうぶぶん", 有理化: "ゆうりか", 分母: "ぶんぼ", 自然数: "しぜんすう", 満たす: "{満|み}たす", 個数: "こすう", 最も: "{最|もっと}も", 形: "かたち", 次: "つぎ", 問い: "{問|と}い", 答えましょう: "{答|こた}えましょう",
    小さい: "{小|ちい}さい", 大きい: "{大|おお}きい", 大小: "だいしょう", 不等号: "ふとうごう", 使って: "{使|つか}って", 表しましょう: "{表|あらわ}しましょう", 計算: "けいさん", 値: "あたい", 中: "なか", 展開: "てんかい", 因数分解: "いんすうぶんかい", 式: "しき", 求めましょう: "{求|もと}めましょう"
  });

  // ===== 小数で計算する式の値(√ をふくむ式の検算用) =====
  function evalF(s, vars = {}) {
    s = String(s).replace(/\{([^{}|]+)\|[^{}|]*\}/g, "$1");
    const tk = [];
    for (let i = 0; i < s.length; ) {
      const ch = s[i];
      if (s.startsWith("[[f:", i)) {
        let depth = 0, j = i;
        for (; j < s.length; j++) {
          if (s.startsWith("[[", j)) depth++, j++;
          else if (s.startsWith("]]", j)) {
            depth--;
            j++;
            if (!depth) break;
          }
        }
        const body = s.slice(i + 4, j - 1), k = body.lastIndexOf("/");
        tk.push({ k: "val", f: () => evalF(body.slice(0, k), vars) / evalF(body.slice(k + 1), vars) });
        i = j + 1;
      } else if (s.startsWith("√{", i)) {
        let depth = 0, j = i + 1;
        for (; j < s.length; j++) {
          if (s[j] === "{") depth++;
          else if (s[j] === "}" && !--depth) break;
        }
        const body = s.slice(i + 2, j);
        tk.push({ k: "val", f: () => Math.sqrt(evalF(body, vars)) });
        i = j + 1;
      } else if (s.startsWith("[[v:", i)) {
        const v = s[i + 4];
        tk.push({ k: "val", f: () => vars[v] });
        i += 7;
      } else if (/[0-9.]/.test(ch)) {
        let j = i;
        while (j < s.length && /[0-9.]/.test(s[j])) j++;
        const v = Number(s.slice(i, j));
        tk.push({ k: "val", f: () => v });
        i = j;
      } else if (ch === "π") tk.push({ k: "val", f: () => Math.PI }), i++;
      else if (/[a-zA-Z]/.test(ch)) tk.push({ k: "val", f: () => vars[ch] }), i++;
      else if ("＋+".includes(ch)) tk.push({ k: "+" }), i++;
      else if ("－-−".includes(ch)) tk.push({ k: "-" }), i++;
      else if (ch === "×") tk.push({ k: "*" }), i++;
      else if (ch === "÷") tk.push({ k: "/" }), i++;
      else if ("（(".includes(ch)) tk.push({ k: "(" }), i++;
      else if ("）)".includes(ch)) tk.push({ k: ")" }), i++;
      else if ("²³⁴".includes(ch)) tk.push({ k: "pow", e: "²³⁴".indexOf(ch) + 2 }), i++;
      else if (/[\s　]/.test(ch)) i++;
      else throw new Error(`式に読めない字: ${ch} in ${s}`);
    }
    let i = 0;
    const peek = () => tk[i], prim = (t) => t && (t.k === "val" || t.k === "(");
    const expr = () => {
      let v = term();
      while (peek() && (peek().k === "+" || peek().k === "-")) v = tk[i++].k === "+" ? v + term() : v - term();
      return v;
    };
    const term = () => {
      let v = iprod();
      while (peek() && (peek().k === "*" || peek().k === "/")) v = tk[i++].k === "*" ? v * iprod() : v / iprod();
      return v;
    };
    const iprod = () => {
      let v = unary();
      while (prim(peek())) v *= power();
      return v;
    };
    const unary = () => peek() && peek().k === "-" ? (i++, -unary()) : peek() && peek().k === "+" ? (i++, unary()) : power();
    const power = () => {
      let v = primary();
      while (peek() && peek().k === "pow") v = v ** tk[i++].e;
      return v;
    };
    const primary = () => {
      const t = tk[i++];
      if (!t) throw new Error("式が途中で終わる " + s);
      if (t.k === "val") {
        const v = t.f();
        if (v === void 0 || Number.isNaN(v)) throw new Error("値がない " + s);
        return v;
      }
      if (t.k === "(") {
        const v = expr();
        i++;
        return v;
      }
      throw new Error("式の形 " + s);
    };
    const v = expr();
    if (i !== tk.length) throw new Error("式の後ろ " + s);
    return v;
  }
  const near = (a, b) => Math.abs(a - b) < 1e-7 * Math.max(1, Math.abs(a));
  // 「±」をふくむ答えを、2つの値にする
  const pmVals = (s) => s.includes("±") ? [evalF(s.replace("±", "＋")), evalF(s.replace("±", "－"))] : [evalF(s)];

  // ===== √ をふくむ数(根号の中 → 係数) =====
  const sqFree = (n) => {
    let a = 1, b = n;
    for (let d = 2; d * d <= b; d++) while (b % (d * d) === 0) b /= d * d, a *= d;
    return [a, b];
  };
  const S = (q, r = 1) => {
    const [a, b] = sqFree(r);
    return q[0] === 0 ? {} : { [b]: qm(q, Q(a)) };
  };
  const sClean = (s) => Object.fromEntries(Object.entries(s).filter(([, v]) => v[0] !== 0));
  const sAdd = (a, b) => {
    const r = { ...a };
    for (const [k, v] of Object.entries(b)) r[k] = r[k] ? qa(r[k], v) : v;
    return sClean(r);
  };
  const sMul = (a, b) => {
    let r = {};
    for (const [k1, v1] of Object.entries(a)) for (const [k2, v2] of Object.entries(b)) r = sAdd(r, S(qm(v1, v2), Number(k1) * Number(k2)));
    return r;
  };
  const sScale = (a, q) => sMul(a, S(q));
  // 1つの項(k√c)でわる
  const sDivTerm = (a, k, c) => sMul(a, S(Q(1, k * c), c));
  const sVal = (s) => Object.entries(s).reduce((t, [k, v]) => t + qv(v) * Math.sqrt(Number(k)), 0);
  const rt = (n) => `√{${n}}`;
  const termTex = (q, r, first) => {
    const sign = q[0] < 0 ? "－" : first ? "" : "＋";
    if (r === 1) return sign + absTex(q);
    const c = Math.abs(q[0]);
    return sign + (c === 1 ? "" : c) + rt(r);
  };
  // 係数が分数のときは、1つの分数にまとめる
  function sTex(s) {
    const keys = Object.keys(s).map(Number).sort((a, b) => a - b);
    if (!keys.length) return "0";
    let D = 1;
    for (const k of keys) D = lcm(D, s[k][1]);
    if (D === 1) return keys.map((k, i) => termTex(s[k], k, i === 0)).join("");
    const nums = keys.map((k) => qm(s[k], Q(D)));
    if (keys.length === 1 && nums[0][0] < 0) return `－[[f:${termTex(qneg(nums[0]), keys[0], true)}/${D}]]`;
    return `[[f:${keys.map((k, i) => termTex(nums[i], k, i === 0)).join("")}/${D}]]`;
  }
  // 問題の中に書く a√b
  const ab = (a, b) => b === 1 ? String(a) : `${a === 1 ? "" : a}${rt(b)}`;
  const NONSQ = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19, 21, 22, 23];

  // ============================================================
  // 1 平方根
  // ============================================================
  const sqrtBasic = {
    id: "c3.sqrtBasic",
    instruction: R("次の問いに答えましょう。"),
    defaults: { types: ["roots", "val", "sq"] },
    levels: lv({ types: ["roots", "val", "sq"] }, { types: ["roots", "rootsNon", "val", "sq", "into"] }, { types: ["rootsFrac", "rootsNon", "into", "sq", "val"] }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx);
      const n = rng.int(2, 15);
      if (type === "roots") return { key: `sb:r:${n}`, text: `${n * n}${R("の平方根")}`, answer: { display: `±${n}` }, workspace: { type: "none" }, meta: { v: n * n, a: [n, -n] } };
      if (type === "rootsNon") {
        const m = rng.pick(NONSQ.concat([30, 35]));
        return { key: `sb:n:${m}`, text: `${m}${R("の平方根")}`, answer: { display: `±${rt(m)}` }, workspace: { type: "none" }, meta: { v: m } };
      }
      if (type === "rootsFrac") {
        if (rng.chance(0.5)) {
          const a = rng.int(1, 9), b = rng.int(2, 12);
          if (gcd(a, b) !== 1) return this.generate(rng, p, ctx && { index: ctx.index + 1 });
          return { key: `sb:f:${a}/${b}`, text: `[[f:${a * a}/${b * b}]]${R("の平方根")}`, answer: { display: `±[[f:${a}/${b}]]` }, workspace: { type: "none" }, meta: { v: a * a / (b * b) } };
        }
        const a = rng.int(1, 9);
        return { key: `sb:d:${a}`, text: `0.${String(a * a).padStart(2, "0")}${R("の平方根")}`, answer: { display: `±0.${a}` }, workspace: { type: "none" }, meta: { v: a * a / 100 } };
      }
      if (type === "val") {
        const neg = rng.chance(0.4);
        return { key: `sb:v:${n}:${neg}`, text: `${neg ? "－" : ""}${rt(n * n)}`, answer: { display: num(Q(neg ? -n : n)) }, workspace: { type: "none" }, meta: { q: `${neg ? "－" : ""}${rt(n * n)}` } };
      }
      if (type === "sq") {
        const m = rng.int(2, 15), f = rng.int(0, 2);
        const q = f === 0 ? `(${rt(m)})²` : f === 1 ? `(－${rt(m)})²` : `${rt(`(－${m})²`)}`;
        return { key: `sb:s:${q}`, text: q, answer: { display: String(f === 2 ? m : m) }, workspace: { type: "none" }, meta: { q } };
      }
      const a = rng.int(2, 6), b = rng.pick([2, 3, 5, 6, 7]);
      return { key: `sb:i:${a}:${b}`, text: `${ab(a, b)}${R("を")}${rt(V("a"))}${R("の形に")}`, answer: { display: rt(a * a * b) }, workspace: { type: "none" }, meta: { q: ab(a, b) } };
    },
    verify(pr) {
      const m = pr.meta, d = pr.answer.display;
      if (m.q) return near(evalF(m.q), evalF(d.replace("±", ""))) ? null : `値が合わない ${m.q} ${d}`;
      return pmVals(d).every((v) => near(v * v, m.v)) ? null : "平方根が合わない";
    }
  };

  const randSurd = (rng, kind) => {
    if (kind === "int") return [rng.int(2, 7), 1];
    if (kind === "root") return [1, rng.int(2, 50)];
    return [rng.int(2, 5), rng.pick([2, 3, 5, 6, 7])];
  };
  const surdText = ([a, b]) => b === 1 ? String(a) : a === 1 ? rt(b) : `${a}${rt(b)}`;
  const sqrtCompare = {
    id: "c3.sqrtCompare",
    instruction: R("次の数の大小を、不等号を使って表しましょう。"),
    defaults: { types: ["intRoot"] },
    levels: lv({ types: ["intRoot", "intRoot", "neg"] }, { types: ["intRoot", "neg", "coef"] }, { types: ["coef", "coef", "neg"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 200; t++) {
        const type = typeOf(rng, p, ctx && { index: ctx.index + t });
        let vs;
        if (type === "intRoot") vs = [[1, rng.int(2, 60)], [rng.int(2, 7), 1]];
        else if (type === "neg") vs = [[1, rng.int(2, 60)], [rng.int(2, 7), 1]].map((v) => [...v, true]);
        else if (type === "coef") vs = [randSurd(rng, "coef"), rng.chance(0.5) ? randSurd(rng, "coef") : randSurd(rng, "root")];
        else vs = rng.shuffle([randSurd(rng, "coef"), randSurd(rng, "root"), randSurd(rng, "int")]);
        const val = (v) => (v[2] ? -1 : 1) * v[0] * Math.sqrt(v[1]);
        const txt = (v) => (v[2] ? "－" : "") + surdText(v);
        if (vs.some((v) => Number.isInteger(Math.sqrt(v[1])) && v[1] > 1)) continue;
        if (new Set(vs.map((v) => val(v).toFixed(9))).size < vs.length) continue;
        if (vs.length === 2) {
          if (Math.abs(val(vs[0]) - val(vs[1])) > 3) continue;
          return { key: `scp:${vs}`, text: `${txt(vs[0])}　□　${txt(vs[1])}`, answer: { display: val(vs[0]) < val(vs[1]) ? "＜" : "＞" }, workspace: { type: "none" }, meta: { vs: vs.map(val) } };
        }
        const sorted = vs.slice().sort((a, b) => val(a) - val(b));
        return { key: `scp:${vs}`, text: vs.map(txt).join("，"), answer: { display: sorted.map(txt).join("＜") }, workspace: { type: "none" }, meta: { vs: vs.map(val) } };
      }
      throw new Error("平方根の大小の問題が作れない");
    },
    verify(pr) {
      const d = pr.answer.display, vs = pr.meta.vs;
      if (vs.length === 2) return d === "＜" === vs[0] < vs[1] ? null : "不等号が逆";
      const parts = d.split("＜").map((x) => evalF(x));
      return parts.every((v, i) => !i || parts[i - 1] < v) ? null : "順がちがう";
    }
  };

  const sqrtSimplify = {
    id: "c3.sqrtSimplify",
    instruction: R("根号の中をできるだけ小さい自然数にしましょう。"),
    defaults: { types: ["int"] },
    levels: lv({ types: ["int"] }, { types: ["int", "int", "frac"] }, { types: ["int", "frac", "dec"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 100; t++) {
        const type = typeOf(rng, p, ctx && { index: ctx.index + t });
        const a = rng.int(2, type === "int" ? 10 : 5), b = rng.pick([2, 3, 5, 6, 7, 10, 11]);
        if (a * a * b > 300) continue;
        if (type === "int") return { key: `ss:${a * a * b}`, text: rt(a * a * b), answer: { display: ab(a, b) }, workspace: { type: "none" }, meta: { q: rt(a * a * b) } };
        if (type === "frac") {
          if (gcd(b, a) !== 1) continue;
          const q = `${rt(`[[f:${b}/${a * a}]]`)}`;
          return { key: `ss:f:${b}/${a}`, text: q, answer: { display: `[[f:${rt(b)}/${a}]]` }, workspace: { type: "none" }, meta: { q } };
        }
        // 小数: √0.12 ＝ √(12/100)
        const n = rng.int(2, 5) ** 2 * b;
        if (n >= 100) continue;
        const [c, d] = sqFree(n), g = gcd(c, 10);
        const q = rt(`0.${String(n).padStart(2, "0")}`);
        const ans = 10 / g === 1 ? ab(c / g, d) : `[[f:${ab(c / g, d)}/${10 / g}]]`;
        return { key: `ss:d:${n}`, text: q, answer: { display: ans }, workspace: { type: "none" }, meta: { q } };
      }
      throw new Error("根号の変形の問題が作れない");
    },
    verify(pr) {
      return near(evalF(pr.meta.q), evalF(pr.answer.display)) ? null : `値が合わない ${pr.meta.q} ${pr.answer.display}`;
    }
  };

  const rationalize = {
    id: "c3.rationalize",
    instruction: R("分母を有理化しましょう。"),
    defaults: { types: ["a"] },
    levels: lv({ types: ["a"] }, { types: ["a", "b"] }, { types: ["b", "c"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 200; t++) {
        const type = typeOf(rng, p, ctx && { index: ctx.index + t });
        const c = rng.pick([2, 3, 5, 6, 7]);
        let q, val;
        if (type === "a") {
          const a = rng.int(1, 12);
          q = `[[f:${a}/${rt(c)}]]`;
          val = sDivTerm(S(Q(a)), 1, c);
        } else if (type === "b") {
          const a = rng.pick([2, 3, 5, 6, 7, 10]);
          if (a === c) continue;
          q = `[[f:${rt(a)}/${rt(c)}]]`;
          val = sDivTerm(S(Q(1), a), 1, c);
        } else {
          const a = rng.int(1, 12), k = rng.int(2, 4);
          q = `[[f:${a}/${k}${rt(c)}]]`;
          val = sDivTerm(S(Q(a)), k, c);
        }
        return { key: `rz:${q}`, text: q, answer: { display: sTex(val) }, workspace: { type: "none" }, meta: { q } };
      }
      throw new Error("有理化の問題が作れない");
    },
    verify(pr) {
      if (/\/[^\]]*√/.test(pr.answer.display)) return "分母に√が残っている";
      return near(evalF(pr.meta.q), evalF(pr.answer.display)) ? null : "値が合わない";
    }
  };

  // √ の計算:式の文字列と値を同時につくる
  const rnd = (rng, lo, hi) => rng.int(lo, hi);
  const CALC = {
    mul: (rng) => {
      const a = rng.pick([2, 3, 5, 6, 7, 10]), b = rng.pick([2, 3, 6, 8, 12, 15]);
      return [`${rt(a)}×${rt(b)}`, sMul(S(Q(1), a), S(Q(1), b))];
    },
    div: (rng) => {
      const b = rng.pick([2, 3, 5, 6]), k = rng.pick([2, 3, 4, 5, 6, 8, 9]);
      return [`${rt(b * k)}÷${rt(b)}`, S(Q(1), k)];
    },
    like: (rng) => {
      const c = rng.pick([2, 3, 5, 6, 7]), a = rnd(rng, 1, 7), b = rnd(rng, 1, 7), op = rng.pick(["＋", "－"]);
      return [`${ab(a, c)}${op}${ab(b, c)}`, S(Q(op === "＋" ? a + b : a - b), c)];
    },
    simpAdd: (rng) => {
      const c = rng.pick([2, 3, 5]), a = rnd(rng, 1, 4), b = rnd(rng, 2, 5), op = rng.pick(["＋", "－"]);
      if (a === b) return null;
      return [`${rt(a * a * c)}${op}${rt(b * b * c)}`, S(Q(op === "＋" ? a + b : a - b), c)];
    },
    three: (rng) => {
      const c = rng.pick([2, 3]), a = rnd(rng, 2, 5), b = rnd(rng, 2, 4), d = rnd(rng, 1, 3);
      return [`${rt(a * a * c)}－${rt(b * b * c)}＋${ab(d, c)}`, S(Q(a - b + d), c)];
    },
    coefMul: (rng) => {
      const a = rnd(rng, 2, 4), b = rng.pick([2, 3, 5]), c = rng.pick([2, 3, 6, 10]);
      return [`${a}${rt(b)}×${rt(c)}`, sMul(S(Q(a), b), S(Q(1), c))];
    },
    ratSub: (rng) => {
      const c = rng.pick([2, 3]), a = rnd(rng, 2, 4), k = rnd(rng, 1, 3) * c;
      return [`${rt(a * a * c)}－[[f:${k}/${rt(c)}]]`, sAdd(S(Q(a), c), S(Q(-k / c), c))];
    },
    sq: (rng) => {
      const a = rng.pick([1, 2, 3]), c = rng.pick([2, 3, 5, 6, 7]), b = nz(rng, -4, 4);
      const x = S(Q(a), c), y = S(Q(b));
      return [`(${ab(a, c)}${b < 0 ? "－" : "＋"}${Math.abs(b)})²`, sMul(sAdd(x, y), sAdd(x, y))];
    },
    conj: (rng) => {
      const a = rng.pick([3, 5, 6, 7, 10]), b = rng.pick([2, 3, 5]);
      if (a === b) return null;
      return [`(${rt(a)}＋${rt(b)})(${rt(a)}－${rt(b)})`, S(Q(a - b))];
    },
    binom: (rng) => {
      const c = rng.pick([2, 3, 5, 6, 7]), p = nz(rng, -4, 4), q2 = nz(rng, -4, 4);
      if (p === -q2) return null;
      return [`(${rt(c)}${p < 0 ? "－" : "＋"}${Math.abs(p)})(${rt(c)}${q2 < 0 ? "－" : "＋"}${Math.abs(q2)})`, sMul(sAdd(S(Q(1), c), S(Q(p))), sAdd(S(Q(1), c), S(Q(q2))))];
    },
    dist: (rng) => {
      const a = rng.pick([2, 3, 5]), b = rng.pick([2, 3, 6, 10]), c = rng.pick([2, 3, 5]);
      return [`${rt(a)}(${rt(b)}－${rt(c)})`, sMul(S(Q(1), a), sAdd(S(Q(1), b), S(Q(-1), c)))];
    }
  };
  const sqrtCalc = {
    id: "c3.sqrtCalc",
    instruction: R("次の計算をしましょう。"),
    defaults: { types: ["mul", "div", "like"] },
    levels: lv({ types: ["mul", "div", "like"] }, { types: ["simpAdd", "three", "coefMul", "ratSub", "mul"] }, { types: ["sq", "conj", "binom", "dist", "ratSub"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 300; t++) {
        const type = typeOf(rng, p, ctx && { index: ctx.index + t });
        const r = CALC[type](rng);
        if (!r || !Object.keys(r[1]).length) continue;
        return { key: `sc:${r[0]}`, text: `${r[0]}＝`, inline: true, answer: { display: sTex(r[1]) }, workspace: { type: "none" }, meta: { q: r[0] } };
      }
      throw new Error("√の計算の問題が作れない");
    },
    verify(pr) {
      return near(evalF(pr.meta.q), evalF(pr.answer.display)) ? null : `値が合わない ${pr.meta.q} → ${pr.answer.display}`;
    }
  };

  const sqrtProps = {
    id: "c3.sqrtProps",
    instruction: R("次の問いに答えましょう。"),
    defaults: { types: ["intPart", "minN"] },
    levels: lv({ types: ["intPart", "count"] }, { types: ["intPart", "count", "minN"] }, { types: ["count", "minN", "minN2"] }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx);
      if (type === "intPart") {
        const n = rng.pick(Array.from({ length: 140 }, (_, i) => i + 2).filter((v) => !Number.isInteger(Math.sqrt(v))));
        return { key: `sp:i:${n}`, text: `${rt(n)}${R("の整数部分")}`, answer: { display: String(Math.floor(Math.sqrt(n))) }, workspace: { type: "none" }, meta: {} };
      }
      if (type === "count") {
        const a = rng.int(2, 6), b = a + rng.int(1, 2);
        return { key: `sp:c:${a}:${b}`, text: `${a}＜${rt(V("x"))}＜${b}${R("を満たす自然数")}${V("x")}${R("の個数")}`, answer: { display: `${b * b - a * a - 1}${R("個")}` }, workspace: { type: "none" }, meta: {} };
      }
      if (type === "minN") {
        const k = rng.pick([2, 3, 5, 6, 7]) * rng.pick([1, 4, 9]) * rng.pick([1, 1, 4]);
        const [, b] = sqFree(k);
        if (b === 1) return this.generate(rng, p, ctx && { index: ctx.index + 1 });
        return { key: `sp:m:${k}`, text: `${rt(`${k}${V("n")}`)}${R("が自然数となるような、最も小さい自然数")}${V("n")}`, wide: true, answer: { display: String(b) }, workspace: { type: "none" }, meta: { k, b } };
      }
      const N = rng.pick([24, 40, 54, 60, 72, 96, 108]), [, b] = sqFree(N);
      // √(N/n) が自然数:n は N の約数で N/n が平方数。いちばん小さい n
      let best = null;
      for (let n = 1; n <= N; n++) if (N % n === 0 && Number.isInteger(Math.sqrt(N / n))) {
        best = n;
        break;
      }
      return { key: `sp:m2:${N}`, text: `${rt(`[[f:${N}/n]]`)}${R("が自然数となるような、最も小さい自然数")}${V("n")}`, wide: true, answer: { display: String(best) }, workspace: { type: "none" }, meta: { b } };
    },
    verify(pr) {
      const m = pr.meta;
      if (m.k) return Number.isInteger(Math.sqrt(m.k * m.b)) ? null : "自然数にならない";
      return null;
    }
  };
  Object.assign(RUBY, { 個: "こ", 次の計算: "{次|つぎ}の{計算|けいさん}", 数: "かず" });

  // ============================================================
  // 2 式の展開と因数分解
  // ============================================================
  const P1 = (a, b, Lx = "x") => clean({ [Lx]: Q(a), "": Q(b) });
  const P2 = (a, Lx, b, Ly) => clean({ [Lx]: Q(a), [Ly]: Q(b) });
  const pt = (p) => polyTex(p);
  const fac = (p) => `(${pt(p)})`;
  const EXP = {
    mono: (rng) => {
      const k = nz2(rng, -5, 5), a = nz(rng, -6, 6), b = nz(rng, -9, 9);
      return { q: `${k < 0 ? "－" : ""}${Math.abs(k)}${xs}${fac(P1(a, b))}`, L: ["x", "y"] };
    },
    sum: (rng) => ({ q: `${fac(P1(1, nz(rng, -9, 9)))}${fac(P1(1, nz(rng, -9, 9)))}`, L: ["x", "y"] }),
    sqp: (rng) => ({ q: `${fac(P1(1, rng.int(1, 9)))}²`, L: ["x", "y"] }),
    sqm: (rng) => ({ q: `${fac(P1(1, -rng.int(1, 9)))}²`, L: ["x", "y"] }),
    conj: (rng) => {
      const a = rng.int(1, 9);
      return { q: `${fac(P1(1, a))}${fac(P1(1, -a))}`, L: ["x", "y"] };
    },
    gen: (rng) => ({ q: `${fac(P1(nz2(rng, -4, 4), nz(rng, -7, 7)))}${fac(P1(nz(rng, -4, 4), nz(rng, -7, 7)))}`, L: ["x", "y"] }),
    sq2: (rng) => {
      const [A, B] = rng.pick([["x", "y"], ["a", "b"]]);
      return { q: `${fac(P2(rng.int(1, 4), A, nz(rng, -5, 5), B))}²`, L: [A, B] };
    },
    conj2: (rng) => {
      const [A, B] = rng.pick([["x", "y"], ["a", "b"]]), a = rng.int(1, 5), b = rng.int(1, 5);
      return { q: `${fac(P2(a, A, b, B))}${fac(P2(a, A, -b, B))}`, L: [A, B] };
    },
    divP: (rng) => {
      const k = nz2(rng, -4, 4), a = nz(rng, -5, 5), b = nz(rng, -5, 5);
      const pol = pMul(P1(a, b), clean({ x: Q(k) }));
      return { q: `${fac(pol)}÷${k < 0 ? "(－" : ""}${Math.abs(k)}${xs}${k < 0 ? ")" : ""}`, L: ["x", "y"], ans: P1(a, b) };
    },
    diff: (rng) => {
      const a = nz(rng, -6, 6), b = nz(rng, -6, 6), c = nz(rng, -6, 6);
      return { q: `${fac(P1(1, a))}²－${fac(P1(1, b))}${fac(P1(1, c))}`, L: ["x", "y"] };
    },
    diff2: (rng) => {
      const a = rng.int(1, 6), b = nz(rng, -6, 6);
      return { q: `${fac(P1(1, a))}${fac(P1(1, -a))}－${fac(P1(1, b))}²`, L: ["x", "y"] };
    },
    subst: (rng) => {
      const a = rng.int(1, 6);
      return { q: `(${xs}＋${ys}＋${a})(${xs}＋${ys}－${a})`, L: ["x", "y"] };
    }
  };
  const expand = {
    id: "c3.expand",
    instruction: R("次の式を展開しましょう。"),
    defaults: { types: ["mono", "sum", "sqp", "sqm", "conj"] },
    levels: lv({ types: ["mono", "sum", "sqp", "sqm", "conj"] }, { types: ["gen", "sq2", "conj2", "divP", "sum"] }, { types: ["diff", "diff2", "subst", "sq2", "gen"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 200; t++) {
        const type = typeOf(rng, p, ctx && { index: ctx.index + t });
        const r = EXP[type](rng), pol = r.ans || polyOf(r.q, r.L);
        if (!Object.keys(pol).length) continue;
        return { key: `ex:${r.q}`, text: `${r.q}＝`, inline: true, answer: { display: pt(pol) }, workspace: { type: "none" }, meta: { q: r.q, L: r.L } };
      }
      throw new Error("展開の問題が作れない");
    },
    verify(pr) {
      return sameExpr(pr.meta.q, pr.answer.display, pr.meta.L) ? null : `展開が合わない ${pr.meta.q} → ${pr.answer.display}`;
    }
  };

  const FAC = {
    common: (rng) => {
      const k = rng.int(2, 6), a = nz(rng, -5, 5), b = nz(rng, -5, 5);
      if (gcd(a, b) !== 1) return null;
      const ans = `${k}${xs}${fac(P1(a, b))}`;
      return { ans, L: ["x", "y"] };
    },
    sum: (rng) => {
      const a = nz(rng, -9, 9), b = nz(rng, -9, 9);
      if (a === b || a === -b) return null;
      const [p, q] = [a, b].sort((u, v) => v - u);
      return { ans: `${fac(P1(1, p))}${fac(P1(1, q))}`, L: ["x", "y"] };
    },
    sq: (rng) => ({ ans: `${fac(P1(1, nz(rng, -9, 9)))}²`, L: ["x", "y"] }),
    diff: (rng) => {
      const a = rng.int(1, 12);
      return { ans: `${fac(P1(1, a))}${fac(P1(1, -a))}`, L: ["x", "y"] };
    },
    diff2: (rng) => {
      const [A, B] = rng.pick([["x", "y"], ["a", "b"]]), a = rng.int(1, 5), b = rng.int(1, 5);
      if (gcd(a, b) !== 1 || a === 1 && b === 1) return null;
      return { ans: `${fac(P2(a, A, b, B))}${fac(P2(a, A, -b, B))}`, L: [A, B] };
    },
    sq2: (rng) => {
      const a = rng.int(2, 4), b = nz(rng, -5, 5);
      if (gcd(a, b) !== 1) return null;
      return { ans: `${fac(P1(a, b))}²`, L: ["x", "y"] };
    },
    sumxy: (rng) => {
      const a = nz(rng, -6, 6), b = nz(rng, -6, 6);
      if (a === b || a === -b) return null;
      const [p, q] = [a, b].sort((u, v) => v - u);
      return { ans: `${fac(P2(1, "x", p, "y"))}${fac(P2(1, "x", q, "y"))}`, L: ["x", "y"] };
    },
    outer: (rng) => {
      const k = rng.int(2, 5), a = nz(rng, -6, 6), b = nz(rng, -6, 6);
      if (a === -b) return null;
      const [p, q] = [a, b].sort((u, v) => v - u);
      return { ans: `${k}${fac(P1(1, p))}${fac(P1(1, q))}`, L: ["x", "y"] };
    },
    outerDiff: (rng) => {
      const k = rng.int(2, 5), a = rng.int(1, 6);
      return { ans: `${k}${fac(P1(1, a))}${fac(P1(1, -a))}`, L: ["x", "y"] };
    },
    yDiff: (rng) => {
      const a = rng.int(1, 6);
      return { q: pt(clean({ xxy: Q(1), y: Q(-a * a) })), ans: `${ys}${fac(P1(1, a))}${fac(P1(1, -a))}`, L: ["x", "y"] };
    },
    subst: (rng) => {
      const s = rng.int(1, 4), a = nz(rng, -5, 5), b = nz(rng, -5, 5);
      if (a === b || a + s === 0 || b + s === 0) return null;
      // (x＋s)² ＋ (a＋b)(x＋s) ＋ ab ＝ (x＋s＋a)(x＋s＋b)
      const M = `(${xs}＋${s})`;
      const q = `${M}²${a + b === 0 ? "" : `${a + b < 0 ? "－" : "＋"}${Math.abs(a + b) === 1 ? "" : Math.abs(a + b)}${M}`}${a * b < 0 ? "－" : "＋"}${Math.abs(a * b)}`;
      const [p1, p2] = [s + a, s + b].sort((u, v) => v - u);
      return { q, ans: `${fac(P1(1, p1))}${fac(P1(1, p2))}`, L: ["x", "y"] };
    }
  };
  const factor = {
    id: "c3.factor",
    instruction: R("次の式を因数分解しましょう。"),
    defaults: { types: ["common", "sum", "sq", "diff"] },
    levels: lv({ types: ["common", "sum", "sq", "diff", "sum"] }, { types: ["sum", "diff2", "sq2", "sumxy", "sq"] }, { types: ["outer", "outerDiff", "yDiff", "subst", "sumxy"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 300; t++) {
        const type = typeOf(rng, p, ctx && { index: ctx.index + t });
        const r = FAC[type](rng);
        if (!r) continue;
        const q = r.q || pt(polyOf(r.ans, r.L));
        return { key: `fc:${q}`, text: q, answer: { display: r.ans }, workspace: { type: "none" }, meta: { q, L: r.L } };
      }
      throw new Error("因数分解の問題が作れない");
    },
    verify(pr) {
      if (!pr.answer.display.includes("(")) return "因数分解になっていない";
      return sameExpr(pr.meta.q, pr.answer.display, pr.meta.L) ? null : `因数分解が合わない ${pr.meta.q} → ${pr.answer.display}`;
    }
  };

  const exprUse = {
    id: "c3.exprUse",
    instruction: R("くふうして計算しましょう。"),
    defaults: { types: ["sq", "prod", "diffSq"] },
    levels: lv({ types: ["sq", "prod", "diffSq"] }, { types: ["sq", "prod", "diffSq", "val"] }, { types: ["diffSq", "val", "valRoot", "prod"] }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx);
      const base = rng.pick([20, 30, 50, 100, 200]);
      if (type === "sq") {
        const n = base + nz(rng, -3, 3);
        return { key: `eu:s:${n}`, text: `${n}²`, answer: { display: String(n * n) }, workspace: { type: "none" }, meta: { q: `${n}²` } };
      }
      if (type === "prod") {
        const d = rng.int(1, 4), q = `${base - d}×${base + d}`;
        return { key: `eu:p:${q}`, text: q, answer: { display: String((base - d) * (base + d)) }, workspace: { type: "none" }, meta: { q } };
      }
      if (type === "diffSq") {
        const a = rng.int(31, 99), b = a - rng.int(1, 9) * 2, q = `${a}²－${b}²`;
        return { key: `eu:d:${q}`, text: q, answer: { display: String(a * a - b * b) }, workspace: { type: "none" }, meta: { q } };
      }
      if (type === "val") {
        const k = rng.int(1, 9), x = base - k, e = `${xs}²＋${2 * k}${xs}＋${k * k}`;
        return { key: `eu:v:${x}:${k}`, text: `${xs}＝${x}${R("のとき、")}${e}${R("の値")}`, wide: true, answer: { display: String((x + k) ** 2) }, workspace: { type: "none" }, meta: { e, x } };
      }
      const c = rng.pick([2, 3, 5, 6, 7]), k = rng.int(1, 5), e = `${xs}²－${2 * k}${xs}＋${k * k}`;
      return { key: `eu:r:${c}:${k}`, text: `${xs}＝${rt(c)}＋${k}${R("のとき、")}${e}${R("の値")}`, wide: true, answer: { display: String(c) }, workspace: { type: "none" }, meta: { e, xr: `${rt(c)}＋${k}` } };
    },
    verify(pr) {
      const m = pr.meta;
      if (m.q) return near(evalF(m.q), Number(pr.answer.display)) ? null : "値が合わない";
      const x = m.xr ? evalF(m.xr) : m.x;
      return near(evalF(m.e, { x }), Number(pr.answer.display)) ? null : "式の値が合わない";
    }
  };
  Object.assign(RUBY, { くふうして: "くふうして" });

  const n_ = V("n");
  const PROOF3 = [
    { t: `連続する2つの整数で、大きいほうの数の2乗から小さいほうの数の2乗をひいた差は、もとの2つの数の和に等しくなります。小さいほうの整数を${n_}とします。`, q: [`2乗の差を${n_}の式で表し、計算しましょう。`, `もとの2つの数の和を${n_}の式で表しましょう。`], a: [`(${n_}＋1)²－${n_}²＝2${n_}＋1`, `${n_}＋(${n_}＋1)＝2${n_}＋1`] },
    { t: `連続する2つの奇数の積に1をたすと、4の倍数になります。${n_}を整数として、2つの奇数を2${n_}－1，2${n_}＋1と表します。`, q: [`2つの奇数の積に1をたした数を${n_}の式で表し、計算しましょう。`, `その数が4の倍数であるわけを答えましょう。`], a: [`(2${n_}－1)(2${n_}＋1)＋1＝4${n_}²`, `${n_}²は整数だから、4${n_}²は4の倍数`] },
    { t: `連続する3つの整数で、まん中の数の2乗から1をひいた数は、残りの2つの数の積に等しくなります。まん中の数を${n_}とします。`, q: [`まん中の数の2乗から1をひいた数を、${n_}の式で表しましょう。`, `残りの2つの数の積を${n_}の式で表し、展開しましょう。`], a: [`${n_}²－1`, `(${n_}－1)(${n_}＋1)＝${n_}²－1`] },
    { t: `連続する2つの偶数の積に1をたすと、奇数の2乗になります。${n_}を整数として、2つの偶数を2${n_}，2${n_}＋2と表します。`, q: [`2つの偶数の積に1をたした数を${n_}の式で表し、計算しましょう。`, `その式を因数分解して、(　)²の形にしましょう。`], a: [`2${n_}(2${n_}＋2)＋1＝4${n_}²＋4${n_}＋1`, `(2${n_}＋1)²`] },
    { t: `連続する2つの奇数で、大きいほうの数の2乗から小さいほうの数の2乗をひいた差は、8の倍数になります。${n_}を整数として、2つの奇数を2${n_}＋1，2${n_}＋3と表します。`, q: [`2乗の差を${n_}の式で表し、計算しましょう。`, `その式を、8×(整数)の形にしましょう。`], a: [`(2${n_}＋3)²－(2${n_}＋1)²＝8${n_}＋8`, `8(${n_}＋1)`] },
    { t: `連続する2つの整数のそれぞれの2乗の和から1をひくと、偶数になります。小さいほうの整数を${n_}とします。`, q: [`2乗の和から1をひいた数を${n_}の式で表し、計算しましょう。`, `その式を、2×(整数)の形にしましょう。`], a: [`${n_}²＋(${n_}＋1)²－1＝2${n_}²＋2${n_}`, `2${n_}(${n_}＋1)`] },
    { t: `連続する2つの整数の積に大きいほうの数をたすと、大きいほうの数の2乗になります。小さいほうの整数を${n_}とします。`, q: [`積に大きいほうの数をたした数を${n_}の式で表し、計算しましょう。`, `その式を因数分解しましょう。`], a: [`${n_}(${n_}＋1)＋(${n_}＋1)＝${n_}²＋2${n_}＋1`, `(${n_}＋1)²`] }
  ];
  Object.assign(RUBY, { 連続する: "{連続|れんぞく}する", 大きいほう: "{大|おお}きいほう", 小さいほう: "{小|ちい}さいほう", 差: "さ", 和: "わ", 積: "せき", 奇数: "きすう", 偶数: "ぐうすう", 倍数: "ばいすう", 残り: "{残|のこ}り", 整数: "せいすう", 等しく: "{等|ひと}しく", 乗: "じょう", 数: "かず" });
  const proofFactor = {
    id: "c3.proofFactor",
    instruction: null,
    defaults: {},
    levels: lv({}, {}, {}),
    generate(rng, p, ctx) {
      const i = ctx && Number.isInteger(ctx.index) ? (ctx.index + rng.int(0, PROOF3.length - 1)) % PROOF3.length : rng.int(0, PROOF3.length - 1), s = PROOF3[i];
      return {
        key: `pq:${i}`,
        softKey: String(i),
        text: `${R(s.t)}[[br]]${s.q.map((q, j) => `(${j + 1}) ${R(q)}`).join("[[br]]")}`,
        answer: { display: s.a.map((a, j) => `(${j + 1}) ${R(a)}`).join("　") },
        workspace: { type: "lines", labels: ["(1)", "", "(2)", ""] },
        meta: { i }
      };
    }
  };
