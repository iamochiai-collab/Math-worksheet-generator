
  // ============================================================
  // 2 文字と式
  // ============================================================
  // 分数の中に書く一次式(文字は [[v:]] にしない。表示のときにななめの字になる)
  const linPlain = (a, b, L = "x") => lin(a, b, L).replace(/\[\[v:([a-z])\]\]/g, "$1");
  const NOTATION = {
    numVar: (rng) => {
      const L = rng.pick(["a", "x", "y"]), n = nz(rng, -9, 9);
      if (Math.abs(n) === 1) return null;
      const f = n < 0 ? `(－${-n})` : String(n);
      return { q: rng.chance(0.5) ? `${V(L)}×${f}` : `${f}×${V(L)}`, a: `${n < 0 ? "－" : ""}${-n > 0 ? -n : n}${V(L)}`, L: [L] };
    },
    one: (rng) => {
      const L = rng.pick(["a", "b", "x"]);
      return rng.chance(0.5) ? { q: `${V(L)}×(－1)`, a: `－${V(L)}`, L: [L] } : { q: `1×${V(L)}`, a: V(L), L: [L] };
    },
    twoVars: (rng) => {
      const [A, B] = rng.pick([["a", "b"], ["x", "y"]]), n = nz(rng, -8, 8);
      if (Math.abs(n) === 1) return null;
      const f = n < 0 ? `(－${-n})` : String(n);
      const fs = rng.shuffle([V(B), V(A), f]);
      return { q: fs.join("×"), a: `${n}${V(A)}${V(B)}`.replace(/^-/, "－"), L: [A, B] };
    },
    power: (rng) => {
      const [A, B] = rng.pick([["a", "b"], ["x", "y"]]), k = rng.int(2, 3);
      const n = rng.pick([1, 1, -1, 2, -3, 5]);
      const fs = [...Array(k).fill(V(A)), V(B)];
      if (Math.abs(n) !== 1) fs.push(n < 0 ? `(－${-n})` : String(n));
      else if (n === -1) fs.push("(－1)");
      const q = rng.shuffle(fs).join("×");
      const c = n === 1 ? "" : n === -1 ? "－" : String(n).replace("-", "－");
      return { q, a: `${c}${V(A)}${SUP[k]}${V(B)}`, L: [A, B] };
    },
    cube: (rng) => {
      const L = rng.pick(["a", "x"]), k = rng.int(2, 3), n = nz(rng, -5, 5);
      const fs = [...Array(k).fill(V(L)), n < 0 ? `(－${-n})` : String(n)];
      const c = n === 1 ? "" : n === -1 ? "－" : String(n).replace("-", "－");
      return { q: rng.shuffle(fs).join("×"), a: `${c}${V(L)}${SUP[k]}`, L: [L] };
    },
    div: (rng) => {
      const L = rng.pick(["a", "x", "y"]), n = rng.int(2, 9);
      return rng.chance(0.6) ? { q: `${V(L)}÷${n}`, a: `[[f:${L}/${n}]]`, L: [L] } : { q: `${V(L)}÷(－${n})`, a: `－[[f:${L}/${n}]]`, L: [L] };
    },
    divSum: (rng) => {
      const [A, B] = rng.pick([["a", "b"], ["x", "y"]]), n = rng.int(2, 9), op = rng.pick(["＋", "－"]);
      return { q: `(${V(A)}${op}${V(B)})÷${n}`, a: `[[f:${A}${op}${B}/${n}]]`, L: [A, B] };
    },
    mulDiv: (rng) => {
      const L = rng.pick(["a", "x"]), m = rng.int(2, 7), n = rng.int(2, 9);
      if (gcd(m, n) !== 1) return null;
      return { q: `${V(L)}×${m}÷${n}`, a: `[[f:${m}${L}/${n}]]`, L: [L] };
    },
    divVar: (rng) => {
      const [A, B] = rng.pick([["a", "b"], ["x", "y"]]), n = rng.int(2, 7);
      return { q: `${V(A)}÷${V(B)}×${n}`, a: `[[f:${n}${A}/${B}]]`, L: [A, B] };
    },
    mix: (rng) => {
      const [A, B] = rng.pick([["a", "b"], ["x", "y"]]), m = rng.int(2, 9), n = rng.int(2, 9), op = rng.pick(["＋", "－"]);
      return rng.chance(0.5) ? { q: `${V(A)}×${m}${op}${V(B)}÷${n}`, a: `${m}${V(A)}${op}[[f:${B}/${n}]]`, L: [A, B] } : { q: `${V(A)}×(－${m})${op}${V(B)}×${n}`, a: `－${m}${V(A)}${op}${n}${V(B)}`, L: [A, B] };
    },
    parMul: (rng) => {
      const [A, B] = rng.pick([["a", "b"], ["x", "y"]]), n = rng.int(2, 9), op = rng.pick(["＋", "－"]);
      return { q: `(${V(A)}${op}${V(B)})×${n}`, a: `${n}(${V(A)}${op}${V(B)})`, L: [A, B] };
    }
  };
  const notation = {
    id: "c1.notation",
    instruction: R("次の式を、文字式の表し方にしたがって書きましょう。"),
    defaults: { types: ["numVar", "one", "twoVars", "div"] },
    levels: lv({ types: ["numVar", "one", "twoVars", "div"] }, { types: ["twoVars", "power", "cube", "div", "divSum", "parMul"] }, { types: ["power", "divSum", "mulDiv", "divVar", "mix", "parMul"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 200; t++) {
        const type = typeOf(rng, p, ctx && { index: ctx.index + t });
        const r = NOTATION[type](rng);
        if (!r) continue;
        return { key: `nt:${r.q}`, text: r.q, answer: { display: r.a }, workspace: { type: "none" }, meta: { type, q: r.q, L: r.L } };
      }
      throw new Error("文字式の表し方の問題が作れない");
    },
    verify(pr) {
      const { q, L } = pr.meta;
      if (/×|÷/.test(pr.answer.display)) return "答えに×÷が残っている";
      return sameExpr(q, pr.answer.display, L) ? null : `答えが合わない ${q} ${pr.answer.display}`;
    }
  };

  const EXPRV = {
    lin: (rng) => ({ e: lin(Q(nz(rng, -6, 6)), Q(nz(rng, -9, 9))), vars: { x: Q(nz(rng, -6, 6)) } }),
    rev: (rng) => ({ e: `${rng.int(2, 12)}－${rng.int(2, 6)}${V("x")}`, vars: { x: Q(nz(rng, -6, -1)) } }),
    negx: (rng) => ({ e: `－${V("x")}`, vars: { x: Q(nz(rng, -12, -1)) } }),
    sq: (rng) => ({ e: `${V("x")}²`, vars: { x: Q(nz(rng, -9, -2)) } }),
    negSq: (rng) => ({ e: `－${V("x")}²`, vars: { x: Q(nz(rng, -6, -2)) } }),
    sqLin: (rng) => ({ e: `${V("x")}²${rng.pick(["＋", "－"])}${rng.int(2, 5)}${V("x")}`, vars: { x: Q(nz(rng, -5, -1)) } }),
    inv: (rng) => {
      const x = nz(rng, -6, -1), k = rng.int(1, 4) * x * rng.pick([1, -1]);
      return { e: `[[f:${Math.abs(k) * (k < 0 ? 1 : 1)}/x]]`.replace(/^/, k < 0 ? "－" : ""), vars: { x: Q(x) } };
    },
    sq2: (rng) => ({ e: `${rng.int(2, 4)}${V("x")}²${rng.pick(["＋", "－"])}${rng.int(1, 9)}`, vars: { x: Q(nz(rng, -4, -1)) } }),
    two: (rng) => ({ e: `${rng.int(2, 6)}${V("x")}${rng.pick(["＋", "－"])}${rng.int(2, 6)}${V("y")}`, vars: { x: Q(nz(rng, -5, 5)), y: Q(nz(rng, -5, 5)) } }),
    xy: (rng) => ({ e: `${V("x")}²${rng.pick(["＋", "－"])}${V("x")}${V("y")}`, vars: { x: Q(nz(rng, -5, 5)), y: Q(nz(rng, -5, 5)) } }),
    fracX: (rng) => ({ e: lin(Q(rng.pick([2, 4, 6, -4, -6])), Q(nz(rng, -5, 5))), vars: { x: Q(rng.pick([-1, 1]), 2) } }),
    fracSq: (rng) => ({ e: `${rng.pick([9, 18, -9])}${V("x")}²`.replace("-", "－"), vars: { x: Q(rng.pick([-1, 1, -2]), 3) } })
  };
  const exprValue = {
    id: "c1.exprValue",
    instruction: R("式の値を求めましょう。"),
    defaults: { types: ["lin", "rev", "negx", "sq"] },
    levels: lv({ types: ["lin", "rev", "negx", "sq"] }, { types: ["negSq", "sqLin", "inv", "sq2", "lin"] }, { types: ["two", "xy", "fracX", "fracSq", "negSq"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 200; t++) {
        const type = typeOf(rng, p, ctx && { index: ctx.index + t });
        const { e, vars } = EXPRV[type](rng);
        let v;
        try {
          v = evalQ(e, vars);
        } catch (er) {
          continue;
        }
        if (!isInt(v) || Math.abs(v[0]) > 200) continue;
        const cond = Object.entries(vars).map(([L, q]) => `${V(L)}＝${num(q)}`).join("，");
        return { key: `ev:${e}:${cond}`, text: `${e}　(${cond})`, answer: { display: num(v) }, workspace: { type: "none" }, meta: { e, vars } };
      }
      throw new Error("式の値の問題が作れない");
    },
    verify(pr) {
      return qeq(evalQ(pr.meta.e, pr.meta.vars), evalQ(pr.answer.display)) ? null : "式の値が合わない";
    }
  };

  // 一次式の計算:答えは (式の x＝0, 1 の値) から a x ＋ b を出す
  const LINF = {
    like2: (rng, L) => poly([[Q(nz(rng, -9, 9)), V(L)], [Q(nz(rng, -9, 9)), V(L)]]),
    like4: (rng, L) => poly(rng.shuffle([[Q(nz(rng, -8, 8)), V(L)], [Q(nz(rng, -9, 9)), ""], [Q(nz(rng, -8, 8)), V(L)], [Q(nz(rng, -9, 9)), ""]])),
    mulC: (rng, L) => rng.chance(0.5) ? `${nz(rng, -6, 6)}×(${coefTex(Q(nz(rng, -6, 6)))}${V(L)})`.replace(/^-/, "－") : `(${coefTex(Q(nz(rng, -6, 6)))}${V(L)})×${par(Q(nz(rng, -6, 6)))}`,
    divC: (rng, L) => {
      const k = nz(rng, -6, 6), c = nz(rng, -5, 5) * k;
      return `${num(Q(c))}${V(L)}÷${par(Q(k))}`;
    },
    addP: (rng, L) => `(${lin(Q(nz(rng, -7, 7)), Q(nz(rng, -9, 9)), L)})＋(${lin(Q(nz(rng, -7, 7)), Q(nz(rng, -9, 9)), L)})`,
    subP: (rng, L) => `(${lin(Q(nz(rng, -7, 7)), Q(nz(rng, -9, 9)), L)})－(${lin(Q(nz(rng, -7, 7)), Q(nz(rng, -9, 9)), L)})`,
    dist: (rng, L) => `${num(Q(nz(rng, -6, 6))).replace(/^1$/, "").replace(/^－1$/, "－")}(${lin(Q(nz(rng, -6, 6)), Q(nz(rng, -9, 9)), L)})`,
    divP: (rng, L) => {
      const k = nz(rng, -5, 5);
      if (Math.abs(k) === 1) return null;
      return `(${lin(Q(nz(rng, -5, 5) * k), Q(nz(rng, -5, 5) * k), L)})÷${par(Q(k))}`;
    },
    dist2: (rng, L) => `${rng.int(2, 6)}(${lin(Q(nz(rng, -5, 5)), Q(nz(rng, -9, 9)), L)})${rng.pick(["＋", "－"])}${rng.int(2, 6)}(${lin(Q(nz(rng, -5, 5)), Q(nz(rng, -9, 9)), L)})`,
    fracMul: (rng, L) => {
      const d = rng.pick([2, 3, 4, 5]), m = d * rng.pick([1, 2, 3]) * rng.pick([1, -1]);
      return `[[f:${linPlain(Q(nz(rng, -5, 5)), Q(nz(rng, -7, 7)), L)}/${d}]]×${par(Q(m))}`;
    },
    coefFrac: (rng, L) => {
      const d = rng.pick([2, 3, 4]), n = nz(rng, -3, 3);
      const c = Q(n, d);
      if (isInt(c)) return null;
      return `${num(c)}(${lin(Q(d * nz(rng, -3, 3)), Q(d * nz(rng, -4, 4)), L)})`;
    },
    fracLike: (rng, L) => {
      const a = Q(nz(rng, -5, 5), rng.pick([2, 3, 4])), b = Q(nz(rng, -5, 5), rng.pick([2, 3, 6]));
      if (isInt(a) || isInt(b)) return null;
      return `${coefTex(a)}${V(L)}${b[0] < 0 ? "－" : "＋"}${coefTex(qabs(b))}${V(L)}`;
    },
    fracSub: (rng, L) => {
      const p = rng.pick([2, 3, 4]), q = rng.pick([2, 3, 4, 6]);
      if (p === q) return null;
      return `[[f:${linPlain(Q(1), Q(nz(rng, -5, 5)), L)}/${p}]]${rng.pick(["＋", "－"])}[[f:${linPlain(Q(rng.int(1, 3)), Q(nz(rng, -5, 5)), L)}/${q}]]`;
    },
    divFrac: (rng, L) => {
      const f = Q(rng.int(1, 4) * rng.pick([1, -1]), rng.pick([2, 3, 4]));
      if (isInt(f)) return null;
      return `(${lin(Q(f[0] * rng.int(1, 4)), Q(f[0] * nz(rng, -4, 4)), L)})÷${par(f)}`;
    }
  };
  const linear = {
    id: "c1.linear",
    instruction: R("次の計算をしましょう。"),
    defaults: { types: ["like2", "like4", "mulC", "divC"] },
    levels: lv({ types: ["like2", "like4", "mulC", "divC"] }, { types: ["addP", "subP", "dist", "divP", "like4"] }, { types: ["dist2", "fracMul", "coefFrac", "fracLike", "fracSub", "divFrac"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 300; t++) {
        const type = typeOf(rng, p, ctx && { index: ctx.index + t });
        const L = rng.pick(["x", "x", "a", "y"]);
        const q = LINF[type](rng, L);
        if (!q) continue;
        let a, b;
        try {
          b = evalQ(q, { [L]: Q(0) });
          a = qs(evalQ(q, { [L]: Q(1) }), b);
        } catch (e) {
          continue;
        }
        if (a[0] === 0) continue;
        if (a[1] > 12 || b[1] > 12 || Math.abs(qv(a)) > 60 || Math.abs(qv(b)) > 90) continue;
        let ans = lin(a, b, L);
        if (type === "fracSub" && (a[1] > 1 || b[1] > 1)) {
          const D2 = a[1] * b[1] / gcd(a[1], b[1]);
          ans = `[[f:${linPlain(qm(a, Q(D2)), qm(b, Q(D2)), L)}/${D2}]]`;
        }
        return { key: `ln:${q}`, text: `${q}＝`, inline: true, answer: { display: ans }, workspace: { type: "none" }, meta: { q, L } };
      }
      throw new Error("一次式の計算の問題が作れない");
    },
    verify(pr) {
      return sameExpr(pr.meta.q, pr.answer.display, [pr.meta.L]) ? null : `答えが合わない ${pr.meta.q} → ${pr.answer.display}`;
    }
  };

  // 数量を文字の式で:t は文({a}{x}{y} は文字、{n}{c}{k}{p}{m} は数)、e は式、u は単位、f は検算
  const SCENES = [
    { id: 1, t: "1個{a}円のパンを{n}個買ったときの代金", e: "{n}a", u: "円", n: [3, 9], f: (v, o) => o.n * v.a },
    { id: 2, t: "1冊{a}円のノートを{n}冊買って、1000円出したときのおつり", e: "1000－{n}a", u: "円", n: [2, 6], f: (v, o) => 1e3 - o.n * v.a },
    { id: 3, t: "{x}kmの道のりを、時速{n}kmで歩いたときにかかる時間", e: "[[f:x/{n}]]", u: "時間", n: [3, 5], f: (v, o) => v.x / o.n },
    { id: 4, t: "1{辺|ぺん}が{a}cmの正方形の周りの長さ", e: "4a", u: "cm", f: (v) => 4 * v.a },
    { id: 5, t: "{a}mのリボンを{n}等分したときの1{本分|ぽんぶん}の長さ", e: "[[f:a/{n}]]", u: "m", n: [3, 8], f: (v, o) => v.a / o.n },
    { id: 6, t: "{x}人が{1人|ひとり}{n}円ずつ出したときの金額の合計", e: "{n}x", u: "円", n: [100, 500, 100], f: (v, o) => o.n * v.x },
    { id: 7, t: "定価{a}円の品物を、{k}割引きで買ったときの代金", e: "K", u: "円", k: [1, 5], f: (v, o) => v.a * (10 - o.k) / 10 },
    { id: 8, t: "{a}gの{p}%の重さ", e: "P", u: "g", p: [10, 90, 10], f: (v, o) => v.a * o.p / 100 },
    { id: 9, t: "十の位の数が{a}、一の位の数が{b}である2けたの自然数", e: "10a＋b", u: "", f: (v) => 10 * v.a + v.b },
    { id: 10, t: "{x}円の品物と{y}円の品物を1個ずつ買ったときの代金", e: "x＋y", u: "円", f: (v) => v.x + v.y },
    { id: 11, t: "底辺が{a}cm、高さが{h}cmの三角形の面積", e: "[[f:ah/2]]", u: "cm²", f: (v) => v.a * v.h / 2 },
    { id: 12, t: "分速{a}mで{n}M歩いたときに進む道のり", e: "{n}a", u: "m", n: [5, 30, 5], f: (v, o) => o.n * v.a },
    { id: 13, t: "{a}枚の色紙を{n}人で同じ数ずつ分けたときの{1人分|ひとりぶん}の枚数", e: "[[f:a/{n}]]", u: "枚", n: [3, 8], f: (v, o) => v.a / o.n },
    { id: 14, t: "1本{x}円の鉛筆{n}H と、1冊{y}円のノート{m}冊を買ったときの代金", e: "{n}x＋{m}y", u: "円", n: [2, 6], m: [2, 4], f: (v, o) => o.n * v.x + o.m * v.y },
    { id: 15, t: "1個{x}gの品物{n}個を、{c}gの箱に入れたときの全体の重さ", e: "{n}x＋{c}", u: "g", n: [3, 9], c: [100, 500, 50], f: (v, o) => o.n * v.x + o.c }
  ];
  const pickR = (rng, r) => r ? r[0] + (r[2] || 1) * rng.int(0, Math.floor((r[1] - r[0]) / (r[2] || 1))) : 0;
  const fracCoef = (num2, den, L) => {
    const g = gcd(num2, den), n2 = num2 / g, d2 = den / g;
    return d2 === 1 ? `${n2 === 1 ? "" : n2}${V(L)}` : `[[f:${n2 === 1 ? "" : n2}${L}/${d2}]]`;
  };
  const exprWrite = {
    id: "c1.exprWrite",
    instruction: R("次の数量を、文字を使った式で表しましょう。"),
    defaults: { ids: [1, 4, 6, 10, 12, 15] },
    levels: lv({ ids: [1, 4, 6, 10, 12, 15] }, { ids: [2, 3, 5, 9, 13, 14, 15] }, { ids: [2, 3, 7, 8, 9, 11, 14] }),
    generate(rng, p, ctx) {
      const sc = SCENES.find((s) => s.id === (ctx && Number.isInteger(ctx.index) ? p.ids[ctx.index % p.ids.length] : rng.pick(p.ids)));
      const o = { n: pickR(rng, sc.n), c: pickR(rng, sc.c), m: pickR(rng, sc.m), k: pickR(rng, sc.k), p: pickR(rng, sc.p) };
      let e = sc.e.replace(/\{(\w)\}/g, (_, k) => o[k]);
      if (e === "K") e = fracCoef(10 - o.k, 10, "a");
      if (e === "P") e = fracCoef(o.p, 100, "a");
      const eTex = e.split(/(\[\[[^\]]*\]\])/).map((seg, i) => i % 2 ? seg : seg.replace(/([a-z])/g, (_, L) => V(L))).join("");
      const text = R(sc.t.replace(/\{([a-z])\}/g, (m, k) => /[ahxyb]/.test(k) && !(k in o && o[k]) ? V(k) : String(o[k])).replace("M", `${fun(o.n)}{間|かん}`).replace("H ", hon(o.n)));
      const top = /[＋－]/.test(eTex.replace(/\[\[[^\]]*\]\]/g, ""));
      const disp = sc.u ? `${top ? `(${eTex})` : eTex}${R(sc.u)}` : eTex;
      return { key: `ew:${sc.id}:${text}`, softKey: String(sc.id), text, answer: { display: disp }, workspace: { type: "none" }, meta: { id: sc.id, o, e: eTex } };
    },
    verify(pr) {
      const sc = SCENES.find((s) => s.id === pr.meta.id);
      const vals = { a: 7, b: 3, x: 11, y: 5, h: 6 };
      const qv2 = Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, Q(v)]));
      const got = qv(evalQ(pr.meta.e, qv2)), want = sc.f(vals, pr.meta.o);
      return Math.abs(got - want) < 1e-9 ? null : `式が合わない ${pr.meta.e}`;
    }
  };

  const RELS = [
    { id: 1, t: "1個{a}円のパン{n}個と、{b}円の牛乳1本の代金は{c}円です。", r: "{n}a＋b＝{c}", n: [2, 5], c: [400, 900, 50] },
    { id: 2, t: "{x}人に{n}枚ずつ紙を配ると、{c}枚余りました。紙は全部で{y}枚です。", r: "y＝{n}x＋{c}", n: [2, 6], c: [2, 15] },
    { id: 3, t: "{a}mのひもから{b}mを切り取ると、残りは{c}mより短くなりました。", r: "a－b＜{c}", c: [2, 5] },
    { id: 4, t: "1個{x}gのボール{n}個の重さは、{c}g以上です。", r: "{n}x≧{c}", n: [3, 9], c: [200, 900, 100] },
    { id: 5, t: "{a}円持っていて、1冊{b}円のノートを{n}冊買うと、残りは{c}円でした。", r: "a－{n}b＝{c}", n: [2, 5], c: [50, 300, 50] },
    { id: 6, t: "ある数{x}の{n}倍に{c}をたすと、{d}より大きくなります。", r: "{n}x＋{c}＞{d}", n: [2, 7], c: [2, 9], d: [20, 60, 5] },
    { id: 7, t: "{x}kmの道のりを時速{n}kmで歩くと、{y}時間かかります。", r: "[[f:x/{n}]]＝y", n: [3, 5] },
    { id: 8, t: "{c}円で、1個{a}円の品物{n}個と、{b}円の品物1個を買うことができます。", r: "{n}a＋b≦{c}", n: [2, 5], c: [1000, 3000, 500] },
    { id: 9, t: "{a}人の子どもにあめを{n}個ずつ配ろうとすると、{c}個足りません。あめは{b}個あります。", r: "b＝{n}a－{c}", n: [3, 6], c: [2, 12] },
    { id: 10, t: "{x}の{n}倍は、{y}の{m}倍より小さいです。", r: "{n}x＜{m}y", n: [2, 5], m: [3, 7] }
  ];
  const relation = {
    id: "c1.relation",
    instruction: R("次の数量の関係を、等式か不等式で表しましょう。"),
    defaults: { ids: [1, 2, 5, 7, 9] },
    levels: lv({ ids: [1, 2, 5, 7, 9] }, { ids: [3, 4, 6, 8, 10, 1, 2] }, { ids: [2, 3, 4, 6, 8, 9, 10] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 50; t++) {
        const sc = RELS.find((s) => s.id === (ctx && Number.isInteger(ctx.index) ? p.ids[(ctx.index + t) % p.ids.length] : rng.pick(p.ids)));
        const o = { n: pickR(rng, sc.n), c: pickR(rng, sc.c), m: pickR(rng, sc.m), d: pickR(rng, sc.d) };
        if (sc.id === 10 && o.n === o.m) continue;
        const r = sc.r.replace(/\{(\w)\}/g, (_, k) => o[k]);
        const rTex = r.split(/(\[\[[^\]]*\]\])/).map((seg, i) => i % 2 ? seg : seg.replace(/([a-z])/g, (_, L) => V(L))).join("");
        const text = R(sc.t.replace(/\{([a-z])\}/g, (_, k) => o[k] ? String(o[k]) : V(k)));
        return { key: `rl:${sc.id}:${text}`, softKey: String(sc.id), text, answer: { display: rTex }, workspace: { type: "none" }, meta: { id: sc.id, r: rTex } };
      }
      throw new Error("関係を式に表す問題が作れない");
    },
    verify(pr) {
      const parts = pr.meta.r.split(/[＝＜＞≦≧]/);
      if (parts.length !== 2) return "等号・不等号がない";
      const vars = { a: Q(3), b: Q(2), c: Q(5), x: Q(4), y: Q(7) };
      try {
        parts.forEach((s) => evalQ(s, vars));
      } catch (e) {
        return "式が読めない " + e.message;
      }
      return null;
    }
  };

  // ============================================================
  // 3 一次方程式
  // ============================================================
  const xs = V("x");
  // 解 s の方程式 [左辺, 右辺]
  const EQF = {
    add: (rng, s) => {
      const a = nz(rng, -9, 9);
      return [lin(Q(1), Q(a)), num(Q(s + a))];
    },
    mul: (rng, s) => {
      const a = nz(rng, -9, 9);
      if (Math.abs(a) === 1) return null;
      return [lin(Q(a), Q(0)), num(Q(a * s))];
    },
    frac: (rng, s) => {
      const a = rng.int(2, 6);
      if (s % a) return null;
      return [`[[f:x/${a}]]`, num(Q(s / a))];
    },
    axb: (rng, s) => {
      const a = nz(rng, -7, 7), b = nz(rng, -12, 12);
      if (Math.abs(a) === 1) return null;
      return [lin(Q(a), Q(b)), num(Q(a * s + b))];
    },
    both: (rng, s) => {
      const a = nz(rng, -8, 8), c = nz(rng, -8, 8), b = nz(rng, -15, 15);
      if (a === c) return null;
      return [lin(Q(a), Q(b)), lin(Q(c), Q((a - c) * s + b))];
    },
    xOnly: (rng, s) => {
      const a = nz(rng, -8, 8), c = nz(rng, -8, 8);
      if (a === c) return null;
      const d = (a - c) * s;
      if (!d) return null;
      return [lin(Q(a), Q(0)), lin(Q(c), Q(d))];
    },
    rev: (rng, s) => {
      const a = rng.int(2, 8), c = nz(rng, -6, 6), b = rng.int(2, 20);
      if (-a === c) return null;
      return [`${b}－${a}${xs}`, lin(Q(c), Q(b - a * s - c * s))];
    },
    par: (rng, s) => {
      const k = nz(rng, -6, 6), b = nz(rng, -9, 9);
      if (Math.abs(k) === 1) return null;
      return [`${num(Q(k))}(${lin(Q(1), Q(b))})`, num(Q(k * (s + b)))];
    },
    par2: (rng, s) => {
      const k = rng.int(2, 6), b = nz(rng, -9, 9), c = nz(rng, -8, 8);
      if (k === c) return null;
      return [`${k}(${lin(Q(1), Q(b))})`, lin(Q(c), Q(k * (s + b) - c * s))];
    },
    par3: (rng, s) => {
      const k = rng.int(2, 5), b = nz(rng, -6, 6), m = rng.int(2, 4), c = nz(rng, -6, 6);
      const lhs = `${k}(${lin(Q(1), Q(b))})－${m === 1 ? "" : m}(${lin(Q(1), Q(c))})`;
      if (k === m) return null;
      return [lhs, num(Q(k * (s + b) - m * (s + c)))];
    },
    dec: (rng, s) => {
      const a = nz(rng, -9, 9), c = nz(rng, -9, 9), b = nz(rng, -30, 30);
      if (a === c) return null;
      const d = (a - c) * s + b;
      if (Math.abs(d) > 60) return null;
      return [lin(Q(a, 10), Q(b, 10), "x", true), lin(Q(c, 10), Q(d, 10), "x", true)];
    },
    frac1: (rng, s) => {
      const p = rng.pick([2, 3, 4]), q = rng.pick([2, 3, 4, 6]);
      if (p === q || s % p || s % q) return null;
      const b = nz(rng, -6, 6), d = s / p + b - s / q;
      return [`[[f:x/${p}]]${b < 0 ? "－" : "＋"}${Math.abs(b)}`, d ? `[[f:x/${q}]]${d < 0 ? "－" : "＋"}${Math.abs(d)}` : `[[f:x/${q}]]`];
    },
    frac2: (rng, s) => {
      const p = rng.pick([2, 3, 4, 5]), q = rng.pick([2, 3, 4, 6]);
      if (p === q) return null;
      for (let a = -8; a <= 8; a++) {
        if (!a || (s + a) % p) continue;
        if (rng.chance(0.6)) continue;
        const Lv = (s + a) / p, b = s - q * Lv;
        if (!b || Math.abs(b) > 12) continue;
        return [`[[f:${linPlain(Q(1), Q(a))}/${p}]]`, `[[f:${linPlain(Q(1), Q(-b))}/${q}]]`];
      }
      return null;
    }
  };
  const makeEq = (rng, form, sRange) => {
    for (let t = 0; t < 60; t++) {
      const s = rng.pick(sRange), e = EQF[form](rng, s);
      if (e) return { e, s };
    }
    return null;
  };
  const checkEq = ([l, r], s) => qeq(evalQ(l, { x: Q(s) }), evalQ(r, { x: Q(s) })) && !qeq(evalQ(l, { x: Q(s + 1) }), evalQ(r, { x: Q(s + 1) }));
  const S_ALL = [-9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12];
  const eqSolve = {
    id: "c1.eqSolve",
    instruction: R("次の方程式を解きましょう。"),
    defaults: { types: ["add", "mul", "frac", "axb"] },
    levels: lv({ types: ["add", "mul", "frac", "axb", "axb"] }, { types: ["both", "xOnly", "rev", "par", "par2"] }, { types: ["par3", "dec", "frac1", "frac2", "both"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 100; t++) {
        const form = typeOf(rng, p, ctx && { index: ctx.index + t });
        const r = makeEq(rng, form, form === "frac1" ? [-12, -6, 6, 12, 18, 24] : S_ALL);
        if (!r || !checkEq(r.e, r.s)) continue;
        const text = `${r.e[0]}＝${r.e[1]}`;
        return { key: `eq:${text}`, text, answer: { display: `${xs}＝${num(Q(r.s))}` }, workspace: { type: "none" }, meta: { e: r.e, s: r.s, form } };
      }
      throw new Error("方程式の問題が作れない");
    },
    verify(pr) {
      return checkEq(pr.meta.e, pr.meta.s) ? null : `解が合わない ${pr.text}`;
    }
  };
  const solutionCheck = {
    id: "c1.solutionCheck",
    instruction: R("－2，－1，0，1，2のうち、次の方程式の解を答えましょう。"),
    defaults: { types: ["add", "axb"] },
    levels: lv({ types: ["add", "axb", "mul"] }, { types: ["axb", "both", "rev"] }, { types: ["both", "par2", "rev", "frac2"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 100; t++) {
        const form = typeOf(rng, p, ctx && { index: ctx.index + t });
        const r = makeEq(rng, form, [-2, -1, 0, 1, 2]);
        if (!r || !checkEq(r.e, r.s)) continue;
        if ([-2, -1, 0, 1, 2].filter((v) => qeq(evalQ(r.e[0], { x: Q(v) }), evalQ(r.e[1], { x: Q(v) }))).length !== 1) continue;
        const text = `${r.e[0]}＝${r.e[1]}`;
        return { key: `sc:${text}`, text, answer: { display: num(Q(r.s)) }, workspace: { type: "none" }, meta: { e: r.e, s: r.s } };
      }
      throw new Error("解をさがす問題が作れない");
    },
    verify(pr) {
      return checkEq(pr.meta.e, pr.meta.s) && evalQ(pr.answer.display)[0] === pr.meta.s ? null : "解が合わない";
    }
  };
  const RATIO = {
    a: (rng, s) => {
      const c = rng.int(2, 9), b = rng.int(1, 9), A = s * c / b;
      if (!Number.isInteger(A) || gcd(b, c) !== 1 || A > 60) return null;
      return [xs, A, b, c];
    },
    b: (rng, s) => {
      const b = rng.int(2, 9), c = rng.int(1, 9), A = s * b / c;
      if (!Number.isInteger(A) || gcd(b, c) !== 1 || A > 60) return null;
      return [A, xs, b, c];
    },
    c: (rng, s) => {
      const a = rng.int(2, 9), b = rng.int(1, 9), c = s * b / a;
      if (!Number.isInteger(c) || gcd(a, b) !== 1 || c > 60) return null;
      return [a, b, xs, c];
    },
    pl: (rng, s) => {
      const k = nz(rng, -5, 5), v = s + k, c = rng.int(2, 9), b = rng.int(1, 9), A = v * c / b;
      if (v <= 0 || !Number.isInteger(A) || gcd(b, c) !== 1 || A > 60) return null;
      return [`(${lin(Q(1), Q(k))})`, A, b, c];
    },
    pr: (rng, s) => {
      const k = nz(rng, -5, 5), v = s + k, b = rng.int(1, 9), c = rng.int(2, 9), A = v * b / c;
      if (v <= 0 || !Number.isInteger(A) || gcd(b, c) !== 1 || A > 60) return null;
      return [A, `(${lin(Q(1), Q(k))})`, b, c];
    },
    xx: (rng, s) => {
      const k = rng.int(1, 8), b = rng.int(1, 6), c = rng.int(b + 1, 9);
      if (s * (c - b) !== b * k || gcd(b, c) !== 1) return null;
      return [xs, `(${lin(Q(1), Q(k))})`, b, c];
    }
  };
  const ratioEq = {
    id: "c1.ratioEq",
    instruction: R("次の比例式を解きましょう。"),
    defaults: { types: ["a", "b", "c"] },
    levels: lv({ types: ["a", "b", "c"] }, { types: ["a", "b", "pl", "pr"] }, { types: ["pl", "pr", "xx"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 600; t++) {
        const form = typeOf(rng, p, ctx && { index: ctx.index + t });
        const s = rng.int(1, 20), r = RATIO[form](rng, s);
        if (!r) continue;
        const text = `${r[0]}：${r[1]}＝${r[2]}：${r[3]}`;
        return { key: `rq:${text}`, text, answer: { display: `${xs}＝${s}` }, workspace: { type: "none" }, meta: { r: r.map(String), s } };
      }
      throw new Error("比例式の問題が作れない");
    },
    verify(pr) {
      const [a, b, c, d] = pr.meta.r.map((v) => evalQ(v, { x: Q(pr.meta.s) }));
      return qeq(qm(a, d), qm(b, c)) ? null : "比例式が成り立たない";
    }
  };

  // 方程式の文章題
  const EQW = {
    pay: (rng) => {
      const a = rng.int(5, 15) * 10, b = rng.int(3, 12) * 10, n = rng.int(6, 15), x = rng.int(1, n - 1);
      if (a === b) return null;
      const T = a * x + b * (n - x);
      return { t: `1個${a}円のりんごと1個${b}円のみかんを合わせて${n}個買ったら、代金は${T}円でした。りんごを何個買いましたか。`, e: [`${a}x＋${b}(${n}－x)`, `${T}`], x, u: "個" };
    },
    give: (rng) => {
      const x = rng.int(5, 20), a = rng.int(2, 5), c = a + rng.int(1, 3), b = rng.int(1, 15), d = (c - a) * x - b;
      if (d <= 0) return null;
      return { t: `何人かの子どもに色紙を配ります。{1人|ひとり}に${a}枚ずつ配ると${b}枚余り、{1人|ひとり}に${c}枚ずつ配ると${d}枚足りません。子どもの人数を求めましょう。`, e: [`${a}x＋${b}`, `${c}x－${d}`], x, u: "人" };
    },
    age: (rng) => {
      const B = rng.int(4, 14), k = rng.int(2, 4), x = rng.int(1, 20), A = k * (B + x) - x;
      if (A < 28 || A > 52) return null;
      return { t: `現在、父は${A}歳、子どもは${B}歳です。父の年齢が子どもの年齢の${k}倍になるのは何年後ですか。`, e: [`${A}＋x`, `${k}(${B}＋x)`], x, u: "年後" };
    },
    chase: (rng) => {
      const a = rng.int(5, 8) * 10, b = rng.int(a / 10 + 2, 25) * 10, t = rng.int(3, 15), x = a * t / (b - a);
      if (!Number.isInteger(x) || x < 2 || x > 30) return null;
      return { t: `弟は家を出発して、分速${a}mで歩いて行きました。その${t}${fun(t)}{後|ご}に、兄が家を出発して、分速${b}mで同じ道を追いかけました。兄は出発してから何分後に弟に追いつきますか。`, e: [`${b}x`, `${a}(x＋${t})`], x, u: `${fun(x)}{後|ご}` };
    },
    num: (rng) => {
      const x = rng.int(2, 20), a = rng.int(3, 7), c = rng.int(2, a - 1), b = rng.int(1, 20), d = (a - c) * x - b;
      if (d <= 0) return null;
      return { t: `ある数の${a}倍から${b}をひいた数は、ある数の${c}倍に${d}をたした数と等しくなります。ある数を求めましょう。`, e: [`${a}x－${b}`, `${c}x＋${d}`], x, u: "" };
    },
    rect: (rng) => {
      const x = rng.int(3, 15), d = rng.int(1, 6), L = 2 * (2 * x + d);
      return { t: `周りの長さが${L}cmの長方形があります。縦は横より${d}cm長いです。横の長さを求めましょう。`, e: [`2(x＋x＋${d})`, `${L}`], x, u: "cm" };
    },
    spend: (rng) => {
      const x = rng.int(5, 30) * 10, k = rng.int(2, 3), r = rng.int(3, 20) * 10, B = x + r, A = k * r + x;
      return { t: `兄は${A}円、弟は${B}円持っています。{2人|ふたり}とも同じ値段のお菓子を1個ずつ買ったところ、兄の残金は弟の残金の${k}倍になりました。お菓子の値段を求めましょう。`, e: [`${A}－x`, `${k}(${B}－x)`], x, u: "円" };
    },
    pen: (rng) => {
      const a = rng.int(6, 15) * 10, b = rng.int(10, 25) * 10, x = rng.int(2, 9), T = a * x + b;
      return { t: `1本${a}円の鉛筆を何本かと、${b}円のノートを1冊買ったら、代金は${T}円でした。鉛筆は何本買いましたか。`, e: [`${a}x＋${b}`, `${T}`], x, u: "H" };
    }
  };
  const eqWord = {
    id: "c1.eqWord",
    instruction: null,
    defaults: { types: ["pen", "num", "rect", "pay"] },
    levels: lv({ types: ["pen", "num", "rect", "pay"] }, { types: ["pay", "give", "age", "rect", "spend"] }, { types: ["give", "age", "chase", "spend", "pay"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 300; t++) {
        const type = typeOf(rng, p, ctx && { index: ctx.index + t });
        const r = EQW[type](rng);
        if (!r) continue;
        const eTex = r.e.map((s) => s.replace(/x/g, xs));
        const unit = r.u === "H" ? hon(r.x) : R(r.u);
        return {
          key: `ew2:${r.t}`,
          softKey: type,
          text: R(r.t),
          answer: { display: `${R("式")} ${eTex[0]}＝${eTex[1]}　${R("答え")} ${r.x}${unit}` },
          workspace: { type: "lines", labels: [R("式"), R("答え")], wideLabel: true },
          meta: { e: r.e, x: r.x }
        };
      }
      throw new Error("方程式の文章題が作れない");
    },
    verify(pr) {
      return checkEq(pr.meta.e, pr.meta.x) ? null : "方程式の解が合わない";
    }
  };
