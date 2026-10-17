// 中学2年(学習指導要領の内容の順)。道具(ふりがな辞書・分数・式の計算・図)は中1(chuLib)のものを使う。
var chu2 = (() => {
  const { RED, RUBY, R, fun, hon, gcd, Q, qa, qs, qm, qd, qneg, qeq, qpow, qabs, isInt, qv, decPl, absTex, num, sgn, par, SUP, evalQ, sameExpr, V, coefTex, lin, linPlain, nz, lv, typeOf, ALPHA, MARU, L_, T_, arrowHead, plane, draw, xs, ys, rad, ang, fitBox, shiftItem, pickR, coordTex, ptMark } = chuLib;
  Object.assign(RUBY, {
    単項式: "たんこうしき", 多項式: "たこうしき", 次数: "じすう", 次式: "じしき", 何次式: "なんじしき", 同類項: "どうるいこう", 連続する: "{連続|れんぞく}する", 倍数: "ばいすう", 偶数: "ぐうすう", 奇数: "きすう",
    入れかえた: "{入|い}れかえた", 入れかえると: "{入|い}れかえると", 形: "かたち", 解く: "{解|と}く", 解いて: "{解|と}いて", 解きましょう: "{解|と}きましょう", 連立方程式: "れんりつほうていしき", 方程式: "ほうていしき",
    美術館: "びじゅつかん", 入館料: "にゅうかんりょう", 入館: "にゅうかん", 大人: "おとな", 中学生: "ちゅうがくせい", 町: "まち", 峠: "とうげ", 越えて: "{越|こ}えて", 全体: "ぜんたい", 昨年: "さくねん", 今年: "ことし", 男子: "だんし", 女子: "じょし",
    生徒数: "せいとすう", 生徒: "せいと", 自然数: "しぜんすう", 一次関数: "いちじかんすう", 関数: "かんすう", 変化の割合: "{変化|へんか}の{割合|わりあい}", 増加量: "ぞうかりょう", 傾き: "{傾|かたむ}き", 切片: "せっぺん", 変域: "へんいき", 交点: "こうてん",
    水そう: "{水|すい}そう", 入っている: "{入|はい}っている", 入れ始めて: "{入|い}れ{始|はじ}めて", 火: "ひ", 短く: "{短|みじか}く", 燃えつきる: "{燃|も}えつきる", 長く: "{長|なが}く", 地上: "ちじょう", 高さ: "{高|たか}さ", 気温: "きおん", 下がります: "{下|さ}がります", 上がる: "{上|あ}がる",
    平行: "へいこう", 同位角: "どういかく", 錯角: "さっかく", 対頂角: "たいちょうかく", 内角: "ないかく", 外角: "がいかく", 和: "わ", 正: "せい", 合同: "ごうどう", 合同条件: "ごうどうじょうけん", 条件: "じょうけん", 対応する: "{対応|たいおう}する", 仮定: "かてい", 結論: "けつろん", 証明: "しょうめい",
    共通: "きょうつう", 組: "くみ", 両端: "りょうたん", 間: "あいだ", 二等辺三角形: "にとうへんさんかくけい", 底角: "ていかく", 頂角: "ちょうかく", 平行四辺形: "へいこうしへんけい", 四角形: "しかくけい", 対角線: "たいかくせん", ひし形: "ひし{形|がた}", 長方形: "ちょうほうけい", 正方形: "せいほうけい", 台形: "だいけい",
    加える: "{加|くわ}える", 加えると: "{加|くわ}えると", 選びましょう: "{選|えら}びましょう", 選ぶ: "{選|えら}ぶ", 四分位数: "しぶんいすう", 第1四分位数: "{第|だい}1{四分位数|しぶんいすう}", 四分位範囲: "しぶんいはんい", 箱ひげ図: "{箱|はこ}ひげ{図|ず}", 最小値: "さいしょうち", 最大値: "さいだいち",
    組: "くみ", 半数: "はんすう", 確率: "かくりつ", 目: "め", 出る: "{出|で}る", 硬貨: "こうか", 同時に: "{同時|どうじ}に", 約数: "やくすう", 少なくとも: "{少|すく}なくとも", 袋: "ふくろ", 赤玉: "あかだま", 白玉: "しろだま", 取り出す: "{取|と}り{出|だ}す", 取り出すとき: "{取|と}り{出|だ}すとき",
    係: "かかり", 当たり: "{当|あ}たり", 当たる: "{当|あ}たる", 引く: "{引|ひ}く", 引いた: "{引|ひ}いた", 順: "じゅん", 先頭: "せんとう", 並ぶ: "{並|なら}ぶ", 決めて: "{決|き}めて", 整数: "せいすう", 枚: "まい", 続けて: "{続|つづ}けて", 作る: "{作|つく}る", 戻さない: "{戻|もど}さない",
    簡単: "かんたん", 簡単にして: "{簡単|かんたん}にして", 値: "あたい", 求めましょう: "{求|もと}めましょう", 答えましょう: "{答|こた}えましょう", 表しましょう: "{表|あらわ}しましょう", 使って: "{使|つか}って", 次: "つぎ", 問い: "{問|と}い", 何: "なん"
  });
  const nz2 = (rng, lo, hi) => {
    for (;;) {
      const v = rng.int(lo, hi);
      if (v && Math.abs(v) !== 1) return v;
    }
  };
  const lcm = (a, b) => a / gcd(a, b) * b;

  // ===== 多項式 { "xxy": 係数, "": 定数 }(文字はアルファベット順) =====
  const clean = (p) => Object.fromEntries(Object.entries(p).filter(([, v]) => v[0] !== 0));
  const pAdd = (a, b) => {
    const r = { ...a };
    for (const [k, v] of Object.entries(b)) r[k] = r[k] ? qa(r[k], v) : v;
    return clean(r);
  };
  const pScale = (a, q) => clean(Object.fromEntries(Object.entries(a).map(([k, v]) => [k, qm(v, q)])));
  const pMul = (a, b) => {
    let r = {};
    for (const [k1, v1] of Object.entries(a)) for (const [k2, v2] of Object.entries(b)) r = pAdd(r, { [[...k1 + k2].sort().join("")]: qm(v1, v2) });
    return r;
  };
  const keyOrder = (p, q) => q.length - p.length || (p < q ? -1 : p > q ? 1 : 0);
  const lettersTex = (k, plain) => {
    const cnt = {};
    for (const ch of k) cnt[ch] = (cnt[ch] || 0) + 1;
    return Object.keys(cnt).sort().map((L) => (plain ? L : V(L)) + (cnt[L] > 1 ? SUP[cnt[L]] : "")).join("");
  };
  const monoTex = (c, k, { first = true, plain = false, dec = false } = {}) => {
    const body = (k && qeq(qabs(c), Q(1)) ? "" : absTex(c, dec)) + lettersTex(k, plain);
    return (c[0] < 0 ? "－" : first ? "" : "＋") + body;
  };
  const polyTex = (p, { plain = false, dec = false, order = null } = {}) => {
    const keys = order || Object.keys(p).sort(keyOrder);
    const s = keys.filter((k) => p[k] && p[k][0] !== 0).map((k, i) => monoTex(p[k], k, { first: i === 0, plain, dec })).join("");
    return s || "0";
  };
  const degOf = (p) => Math.max(0, ...Object.keys(p).map((k) => k.length));
  // 単項式 {c, k}
  const mono = (c, k) => ({ c, k: [...k].sort().join("") });
  const mTex = (m, first = true) => {
    const s = monoTex(m.c, m.k);
    return !first && (m.c[0] < 0) ? `(${s})` : s;
  };
  const mMul = (a, b) => mono(qm(a.c, b.c), a.k + b.k);
  const mDiv = (a, b) => {
    let k = a.k;
    for (const ch of b.k) {
      const i = k.indexOf(ch);
      if (i < 0) return null;
      k = k.slice(0, i) + k.slice(i + 1);
    }
    return mono(qd(a.c, b.c), k);
  };
  const LET2 = [["x", "y"], ["a", "b"]];
  const randKey = (rng, [A, B], maxDeg) => {
    const d = rng.int(1, maxDeg);
    let k = "";
    for (let i = 0; i < d; i++) k += rng.pick([A, B]);
    return [...k].sort().join("");
  };

  // ============================================================
  // 1 式の計算
  // ============================================================
  const polyDegree = {
    id: "c2.polyDegree",
    instruction: R("次の問いに答えましょう。"),
    defaults: { types: ["mono", "poly"] },
    levels: lv({ types: ["mono", "poly"] }, { types: ["mono", "poly"] }, { types: ["poly", "poly", "mono"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 100; t++) {
        const type = typeOf(rng, p, ctx && { index: ctx.index + t });
        const L = rng.pick(LET2);
        if (type === "mono") {
          const k = randKey(rng, L, 4), c = Q(nz(rng, -9, 9));
          const s = monoTex(c, k);
          return { key: `pd:${s}`, text: `${s}${R("の次数")}`, answer: { display: String(k.length) }, workspace: { type: "none" }, meta: { k } };
        }
        const n = rng.int(2, 3), keys = new Set();
        while (keys.size < n) keys.add(rng.chance(0.25) ? "" : randKey(rng, L, 3));
        const pol = {};
        for (const k of keys) pol[k] = Q(nz(rng, -9, 9));
        const s = polyTex(pol), d = degOf(pol);
        if (d < 1) continue;
        return { key: `pd:${s}`, text: `${s}${R("は何次式ですか。")}`, answer: { display: `${d}{次式|じしき}` }, workspace: { type: "none" }, meta: { d } };
      }
      throw new Error("次数の問題が作れない");
    }
  };

  // いくつかの (係数, 多項式) を足した式
  const linP = (rng, [A, B], M = 9) => clean({ [A]: Q(nz(rng, -M, M)), [B]: Q(nz(rng, -M, M)) });
  const quadP = (rng, A, M = 7) => clean({ [A + A]: Q(nz(rng, -M, M)), [A]: Q(nz(rng, -M, M)), "": Q(nz(rng, -9, 9)) });
  const pieceTex = (c, pol, first) => {
    const inner = polyTex(pol);
    if (qeq(c, Q(1))) return `${first ? "" : "＋"}(${inner})`;
    if (qeq(c, Q(-1))) return `－(${inner})`;
    return `${c[0] < 0 ? "－" : first ? "" : "＋"}${absTex(c)}(${inner})`;
  };
  const ADDSUB = {
    like: (rng, L) => {
      const terms = rng.shuffle([[L[0], nz(rng, -9, 9)], [L[1], nz(rng, -9, 9)], [L[0], nz(rng, -9, 9)], [L[1], nz(rng, -9, 9)]]);
      const q = terms.map(([k, c], i) => monoTex(Q(c), k, { first: i === 0 })).join("");
      return { q };
    },
    add: (rng, L) => ({ q: `${pieceTex(Q(1), linP(rng, L), true)}＋${pieceTex(Q(1), linP(rng, L), false).slice(1)}` }),
    sub: (rng, L) => ({ q: `${pieceTex(Q(1), linP(rng, L), true)}${pieceTex(Q(-1), linP(rng, L), false)}` }),
    quad: (rng, L) => ({ q: `${pieceTex(Q(1), quadP(rng, L[0]), true)}${rng.chance(0.5) ? "－" : "＋"}(${polyTex(quadP(rng, L[0]))})` }),
    dist: (rng, L) => ({ q: `${pieceTex(Q(nz2(rng, -5, 5)), linP(rng, L, 6), true)}${pieceTex(Q(nz2(rng, -5, 5)), linP(rng, L, 6), false)}` }),
    divP: (rng, L) => {
      const k = rng.int(2, 6), pol = pScale(linP(rng, L, 5), Q(k));
      return { q: `(${polyTex(pol)})÷${k}` };
    },
    frac: (rng, L) => {
      const d1 = rng.pick([2, 3, 4]), d2 = rng.pick([2, 3, 4, 6]);
      if (d1 === d2) return null;
      const p1 = linP(rng, L, 5), p2 = linP(rng, L, 5), op = rng.pick(["＋", "－"]);
      return { q: `[[f:${polyTex(p1, { plain: true })}/${d1}]]${op}[[f:${polyTex(p2, { plain: true })}/${d2}]]`, frac: true };
    },
    distFrac: (rng, L) => {
      const d = rng.pick([2, 3, 4]);
      const p2 = pScale(linP(rng, L, 4), Q(d));
      return { q: `${pieceTex(Q(nz2(rng, -4, 4)), linP(rng, L, 6), true)}${rng.chance(0.5) ? "－" : "＋"}[[f:1/${d}]](${polyTex(p2)})` };
    }
  };
  // 式の値から多項式を取り出す(2文字の2次までの式)
  function polyOf(q, [A, B]) {
    const f = (a, b) => evalQ(q, { [A]: Q(a), [B]: Q(b) });
    const c = f(0, 0), fa = qs(f(1, 0), c), fma = qs(f(-1, 0), c), fb = qs(f(0, 1), c), fmb = qs(f(0, -1), c);
    const AA = qd(qa(fa, fma), Q(2)), Ac = qd(qs(fa, fma), Q(2)), BB = qd(qa(fb, fmb), Q(2)), Bc = qd(qs(fb, fmb), Q(2));
    const AB = qs(qs(qs(f(1, 1), c), qa(AA, Ac)), qa(BB, Bc));
    return clean({ [A + A]: AA, [A]: Ac, [[A, B].sort().join("") ]: AB, [B + B]: BB, [B]: Bc, "": c });
  }
  const polyAddSub = {
    id: "c2.polyAddSub",
    instruction: R("次の計算をしましょう。"),
    defaults: { types: ["like", "add", "sub"] },
    levels: lv({ types: ["like", "add", "sub"] }, { types: ["sub", "quad", "dist", "divP"] }, { types: ["dist", "frac", "distFrac", "quad"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 300; t++) {
        const type = typeOf(rng, p, ctx && { index: ctx.index + t });
        const L = rng.pick(LET2), r = ADDSUB[type](rng, L);
        if (!r) continue;
        const pol = polyOf(r.q, L);
        if (!Object.keys(pol).length || Object.values(pol).some((v) => v[1] > 12)) continue;
        let ans = polyTex(pol);
        if (Object.values(pol).some((v) => !isInt(v))) {
          let D2 = 1;
          for (const v of Object.values(pol)) D2 = lcm(D2, v[1]);
          const numer = pScale(pol, Q(D2));
          ans = `[[f:${polyTex(numer, { plain: true })}/${D2}]]`;
        }
        return { key: `pa:${r.q}`, text: `${r.q}＝`, inline: true, answer: { display: ans }, workspace: { type: "none" }, meta: { q: r.q, L } };
      }
      throw new Error("多項式の計算の問題が作れない");
    },
    verify(pr) {
      return sameExpr(pr.meta.q, pr.answer.display, pr.meta.L) ? null : `答えが合わない ${pr.meta.q} → ${pr.answer.display}`;
    }
  };

  const rMono = (rng, L, maxDeg, M = 6, frac = false) => {
    const c = frac && rng.chance(0.6) ? Q(nz(rng, -M, M), rng.pick([2, 3, 4, 5])) : Q(nz(rng, -M, M));
    return mono(c, randKey(rng, L, maxDeg));
  };
  const MONO = {
    mul: (rng, L) => {
      const a = rMono(rng, L, 1), b = rMono(rng, L, 2);
      return { q: `${mTex(a)}×${mTex(b, false)}`, r: mMul(a, b) };
    },
    pow: (rng, L) => {
      const a = rMono(rng, L, 2, 4), k = rng.chance(0.75) ? 2 : 3;
      return { q: `(${mTex(a)})${SUP[k]}`, r: k === 2 ? mMul(a, a) : mMul(mMul(a, a), a) };
    },
    div: (rng, L) => {
      const r = rMono(rng, L, 2), b = rMono(rng, L, 2);
      const a = mMul(r, b);
      return { q: `${mTex(a)}÷${mTex(b, false)}`, r };
    },
    mulDiv: (rng, L) => {
      const a = rMono(rng, L, 2), b = rMono(rng, L, 2), c = rMono(rng, L, 2, 4);
      const ab = mMul(a, b), r = mDiv(ab, c);
      if (!r || !isInt(r.c)) return null;
      return { q: `${mTex(a)}×${mTex(b, false)}÷${mTex(c, false)}`, r };
    },
    powMul: (rng, L) => {
      const a = rMono(rng, L, 1, 4), b = rMono(rng, L, 2);
      return { q: `(${mTex(a)})²×${mTex(b, false)}`, r: mMul(mMul(a, a), b) };
    },
    fracDiv: (rng, L) => {
      const r = rMono(rng, L, 2, 5, true), b = rMono(rng, L, 2, 5, true);
      const a = mMul(r, b);
      if (a.c[1] > 12 || isInt(a.c) && isInt(b.c)) return null;
      return { q: `${mTex(a)}÷${mTex(b, false)}`, r };
    },
    fracMulDiv: (rng, L) => {
      const a = rMono(rng, L, 2, 5, true), b = rMono(rng, L, 1, 5, true), c = rMono(rng, L, 2, 4, true);
      const r = mDiv(mMul(a, b), c);
      if (!r || r.c[1] > 6) return null;
      return { q: `${mTex(a)}×${mTex(b, false)}÷${mTex(c, false)}`, r };
    },
    powDiv: (rng, L) => {
      const a = rMono(rng, L, 1, 4), b = rMono(rng, L, 2, 6, true), r = mDiv(mMul(a, a), b);
      if (!r || r.c[1] > 6) return null;
      return { q: `(${mTex(a)})²÷${mTex(b, false)}`, r };
    }
  };
  const monoMulDiv = {
    id: "c2.monoMulDiv",
    instruction: R("次の計算をしましょう。"),
    defaults: { types: ["mul", "div", "pow"] },
    levels: lv({ types: ["mul", "div", "pow"] }, { types: ["mul", "div", "mulDiv", "powMul"] }, { types: ["fracDiv", "fracMulDiv", "powDiv", "mulDiv"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 300; t++) {
        const type = typeOf(rng, p, ctx && { index: ctx.index + t });
        const L = rng.pick(LET2), r = MONO[type](rng, L);
        if (!r || Math.abs(qv(r.r.c)) > 200) continue;
        return { key: `mm:${r.q}`, text: `${r.q}＝`, inline: true, answer: { display: r.r.k ? monoTex(r.r.c, r.r.k) : num(r.r.c) }, workspace: { type: "none" }, meta: { q: r.q, L } };
      }
      throw new Error("単項式の乗除の問題が作れない");
    },
    verify(pr) {
      return sameExpr(pr.meta.q, pr.answer.display, pr.meta.L) ? null : `答えが合わない ${pr.meta.q} → ${pr.answer.display}`;
    }
  };

  const EV2 = {
    lin: (rng, L) => `${pieceTex(Q(nz2(rng, -4, 4)), linP(rng, L, 5), true)}${pieceTex(Q(nz(rng, -4, 4)), linP(rng, L, 5), false)}`,
    div: (rng, L) => {
      const r = rMono(rng, L, 2, 4), b = rMono(rng, L, 1, 4);
      return `${mTex(mMul(r, b))}÷${mTex(b, false)}`;
    },
    mulDiv: (rng, L) => {
      const a = rMono(rng, L, 1, 3), b = rMono(rng, L, 2, 4), c = rMono(rng, L, 2, 3);
      const r = mDiv(mMul(mMul(a, a), b), c);
      if (!r || !isInt(r.c)) return null;
      return `(${mTex(a)})²×${mTex(b, false)}÷${mTex(c, false)}`;
    }
  };
  const exprValue2 = {
    id: "c2.exprValue2",
    instruction: R("式を簡単にしてから、式の値を求めましょう。"),
    defaults: { types: ["lin"] },
    levels: lv({ types: ["lin"] }, { types: ["lin", "div"] }, { types: ["lin", "div", "mulDiv"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 300; t++) {
        const type = typeOf(rng, p, ctx && { index: ctx.index + t });
        const L = rng.pick(LET2), q = EV2[type](rng, L);
        if (!q) continue;
        const vals = { [L[0]]: Q(nz(rng, -4, 4)), [L[1]]: rng.chance(0.3) ? Q(nz(rng, -3, 3), 2) : Q(nz(rng, -4, 4)) };
        let v;
        try {
          v = evalQ(q, vals);
        } catch (e) {
          continue;
        }
        if (!isInt(v) || Math.abs(v[0]) > 150) continue;
        const cond = L.map((k) => `${V(k)}＝${num(vals[k])}`).join("，");
        return { key: `e2:${q}:${cond}`, text: `${q}　(${cond})`, answer: { display: num(v) }, workspace: { type: "none" }, meta: { q, vals } };
      }
      throw new Error("式の値の問題が作れない");
    },
    verify(pr) {
      return qeq(evalQ(pr.meta.q, pr.meta.vals), evalQ(pr.answer.display)) ? null : "式の値が合わない";
    }
  };

  // 等式の変形:[式, 解く文字, 答えの右辺, 使う文字]
  const FORMULAS = [
    ["S＝ah", "a", "[[f:S/h]]", ["S", "h"]],
    ["S＝[[f:1/2]]ah", "h", "[[f:2S/a]]", ["S", "a"]],
    ["V＝[[f:1/3]]Sh", "h", "[[f:3V/S]]", ["V", "S"]],
    ["m＝[[f:a＋b/2]]", "b", "2m－a", ["m", "a"]],
    ["L＝2(a＋b)", "b", "[[f:L/2]]－a", ["L", "a"]],
    ["V＝abc", "c", "[[f:V/ab]]", ["V", "a", "b"]],
    ["S＝[[f:1/2]](a＋b)h", "h", "[[f:2S/a＋b]]", ["S", "a", "b"]]
  ];
  const vTex = (s) => s.split(/(\[\[[^\]]*\]\])/).map((seg, i) => i % 2 ? seg : seg.replace(/([a-zA-Z])/g, (_, L) => V(L))).join("");
  const solveFor = {
    id: "c2.solveFor",
    instruction: R("次の等式を、〔　〕の中の文字について解きましょう。"),
    defaults: { types: ["linY", "linX"] },
    levels: lv({ types: ["linY", "linX", "simple"] }, { types: ["linY", "linX", "formula"] }, { types: ["formula", "linY", "formula"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 200; t++) {
        const type = typeOf(rng, p, ctx && { index: ctx.index + t });
        if (type === "formula") {
          const f = rng.pick(FORMULAS);
          return { key: `sf:${f[0]}`, text: `${vTex(f[0])}　〔${V(f[1])}〕`, answer: { display: `${V(f[1])}＝${vTex(f[2])}` }, workspace: { type: "none" }, meta: { eq: f[0].split("＝"), t: f[1], rhs: f[2], others: f[3] } };
        }
        if (type === "simple") {
          const a = nz2(rng, -6, 6), b = nz(rng, -9, 9);
          // y＝ax＋b を x について
          const eq = `y＝${linPlain(Q(a), Q(b))}`;
          return { key: `sf:${eq}`, text: `${vTex(eq)}　〔${xs}〕`, answer: { display: `${xs}＝[[f:${linPlain(Q(1), Q(-b), "y")}/${a}]]`.replace(/\[\[f:([^\/]*)\/-(\d+)\]\]/, "－[[f:$1/$2]]") }, workspace: { type: "none" }, meta: { eq: eq.split("＝"), t: "x", rhs: null, others: ["y"] } };
        }
        const a = nz(rng, -6, 6), b = nz2(rng, -6, 6), c = nz(rng, -12, 12);
        const eq = `${linPlain(Q(a), Q(0))}${b < 0 ? "－" : "＋"}${Math.abs(b) === 1 ? "" : Math.abs(b)}y＝${c}`;
        if (type === "linY") return { key: `sf:${eq}:y`, text: `${vTex(eq)}　〔${ys}〕`, answer: { display: `${ys}＝${lin(Q(-a, b), Q(c, b))}` }, workspace: { type: "none" }, meta: { eq: eq.split("＝"), t: "y", others: ["x"] } };
        if (Math.abs(a) === 1) continue;
        return { key: `sf:${eq}:x`, text: `${vTex(eq)}　〔${xs}〕`, answer: { display: `${xs}＝${lin(Q(-b, a), Q(c, a), "y")}` }, workspace: { type: "none" }, meta: { eq: eq.split("＝"), t: "x", others: ["y"] } };
      }
      throw new Error("等式の変形の問題が作れない");
    },
    verify(pr) {
      const m = pr.meta, rhs = pr.answer.display.split("＝").slice(1).join("＝");
      for (const vals0 of [[2, 3, 5], [7, 2, 3], [4, 9, 1]]) {
        const vars = {};
        m.others.forEach((k, i) => vars[k] = Q(vals0[i]));
        let tv;
        try {
          tv = evalQ(rhs, vars);
        } catch (e) {
          return "答えが読めない " + e.message;
        }
        vars[m.t] = tv;
        if (!qeq(evalQ(m.eq[0], vars), evalQ(m.eq[1], vars))) return `解き方が合わない ${pr.text} ${pr.answer.display}`;
      }
      return null;
    }
  };

  // 文字式の利用(説明)
  const n_ = V("n"), m_ = V("m"), a_ = V("a"), b_ = V("b");
  const PROOFS = [
    { t: `連続する3つの整数の和は、3の倍数になります。いちばん小さい整数を${n_}とします。`, q: [`3つの整数を、${n_}を使って表しましょう。`, `3つの整数の和を${n_}を使って表し、3×(整数)の形にしましょう。`], a: [`${n_}，${n_}＋1，${n_}＋2`, `3${n_}＋3＝3(${n_}＋1)`] },
    { t: `連続する5つの整数の和は、5の倍数になります。まん中の整数を${n_}とします。`, q: [`いちばん小さい整数といちばん大きい整数を、${n_}を使って表しましょう。`, `5つの整数の和を${n_}を使って表しましょう。`], a: [`${n_}－2，${n_}＋2`, `5${n_}`] },
    { t: `2けたの自然数と、その数の十の位の数と一の位の数を入れかえた数の和は、11の倍数になります。もとの数の十の位の数を${a_}、一の位の数を${b_}とします。`, q: [`もとの数と、入れかえた数を、${a_}，${b_}を使って表しましょう。`, `2つの数の和を、11×(整数)の形にしましょう。`], a: [`10${a_}＋${b_}，10${b_}＋${a_}`, `11(${a_}＋${b_})`] },
    { t: `2けたの自然数から、その数の十の位の数と一の位の数を入れかえた数をひいた差は、9の倍数になります。もとの数の十の位の数を${a_}、一の位の数を${b_}とします。`, q: [`もとの数と、入れかえた数を、${a_}，${b_}を使って表しましょう。`, `2つの数の差を、9×(整数)の形にしましょう。`], a: [`10${a_}＋${b_}，10${b_}＋${a_}`, `9(${a_}－${b_})`] },
    { t: `偶数と奇数の和は、奇数になります。${m_}，${n_}を整数とします。`, q: [`偶数と奇数を、${m_}，${n_}を使って表しましょう。`, `2つの数の和を、2×(整数)＋1の形にしましょう。`], a: [`2${m_}，2${n_}＋1`, `2(${m_}＋${n_})＋1`] },
    { t: `2つの奇数の和は、偶数になります。${m_}，${n_}を整数とします。`, q: [`2つの奇数を、${m_}，${n_}を使って表しましょう。`, `2つの奇数の和を、2×(整数)の形にしましょう。`], a: [`2${m_}＋1，2${n_}＋1`, `2(${m_}＋${n_}＋1)`] },
    { t: `連続する2つの奇数の和は、4の倍数になります。${n_}を整数として、小さいほうの奇数を2${n_}＋1とします。`, q: [`大きいほうの奇数を、${n_}を使って表しましょう。`, `2つの奇数の和を、4×(整数)の形にしましょう。`], a: [`2${n_}＋3`, `4(${n_}＋1)`] }
  ];
  Object.assign(RUBY, { 小さいほう: "{小|ちい}さいほう", 大きいほう: "{大|おお}きいほう", 差: "さ", 位: "くらい" });
  const proofExpr = {
    id: "c2.proofExpr",
    instruction: null,
    defaults: {},
    levels: lv({ max: 7 }, { max: 7 }, { max: 7 }),
    generate(rng, p, ctx) {
      const pool = PROOFS.slice(0, p.max || 7);
      const i = ctx && Number.isInteger(ctx.index) ? (ctx.index + rng.int(0, pool.length - 1)) % pool.length : rng.int(0, pool.length - 1);
      const s = pool[i];
      return {
        key: `pe:${i}`,
        softKey: String(i),
        text: `${R(s.t)}[[br]]${s.q.map((q, j) => `(${j + 1}) ${R(q)}`).join("[[br]]")}`,
        answer: { display: s.a.map((a, j) => `(${j + 1}) ${a}`).join("　") },
        workspace: { type: "lines", labels: ["(1)", "(2)", ""] },
        meta: { i }
      };
    }
  };

  // ============================================================
  // 2 連立方程式
  // ============================================================
  const lin2 = (a, b, dec) => polyTex(clean({ x: Q(...[].concat(a)), y: Q(...[].concat(b)) }), { order: ["x", "y"], dec });
  const sys = (e1, e2) => `[[sys:${e1}||${e2}:sys]]`;
  const S_VALS = [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6];
  const SIMUL = {
    add: (rng, x, y) => {
      const a = nz(rng, -6, 6), b = nz(rng, -6, 6), d = nz(rng, -6, 6), s = rng.pick([1, -1]);
      if (a === s * d) return null;
      return [[lin2(a, b), num(Q(a * x + b * y))], [lin2(d, s * b), num(Q(d * x + s * b * y))]];
    },
    subst: (rng, x, y) => {
      const p = nz(rng, -4, 4), q = y - p * x, a = nz(rng, -6, 6), b = nz(rng, -6, 6);
      if (a + b * p === 0 || Math.abs(q) > 15) return null;
      return [[ys, lin(Q(p), Q(q))], [lin2(a, b), num(Q(a * x + b * y))]];
    },
    mul1: (rng, x, y) => {
      const a = nz(rng, -5, 5), b = nz(rng, -5, 5), k = rng.pick([2, 3, -2, -3]), d = nz(rng, -6, 6);
      if (d === k * a) return null;
      const e2 = rng.chance(0.5) ? [lin2(d, k * b), num(Q(d * x + k * b * y))] : [lin2(k * a, d), num(Q(k * a * x + d * y))];
      if (e2[0].startsWith("0")) return null;
      return [[lin2(a, b), num(Q(a * x + b * y))], e2];
    },
    mul2: (rng, x, y) => {
      const a = nz2(rng, -7, 7), b = nz2(rng, -7, 7), c = nz2(rng, -7, 7), d = nz2(rng, -7, 7);
      if (a * d - b * c === 0 || a % c === 0 || c % a === 0 || b % d === 0 || d % b === 0) return null;
      return [[lin2(a, b), num(Q(a * x + b * y))], [lin2(c, d), num(Q(c * x + d * y))]];
    },
    subst2: (rng, x, y) => {
      const p = nz(rng, -4, 4), q = x - p * y, a = nz(rng, -6, 6), b = nz(rng, -6, 6);
      if (a * p + b === 0 || Math.abs(q) > 15) return null;
      return [[xs, lin(Q(p), Q(q), "y")], [lin2(a, b), num(Q(a * x + b * y))]];
    },
    paren: (rng, x, y) => {
      const k = rng.int(2, 4), a = nz(rng, -3, 3), b = nz(rng, -3, 3);
      const e1 = `${k}(${lin2(1, a)})${b < 0 ? "－" : "＋"}${Math.abs(b) === 1 ? "" : Math.abs(b)}${ys}`;
      const c = nz(rng, -4, 4), d = nz(rng, -3, 3);
      const e2 = `${xs}${c < 0 ? "－" : "＋"}${Math.abs(c) === 1 ? "" : Math.abs(c)}(${lin2(1, d)})`;
      return [[e1, num(evalQ(e1, { x: Q(x), y: Q(y) }))], [e2, num(evalQ(e2, { x: Q(x), y: Q(y) }))]];
    },
    dec: (rng, x, y) => {
      const a = nz(rng, -9, 9), b = nz(rng, -9, 9), c = nz(rng, -5, 5), d = nz(rng, -5, 5);
      if (a * d - b * c === 0) return null;
      return [[lin2([a, 10], [b, 10], true), num(Q(a * x + b * y, 10), true)], [lin2(c, d), num(Q(c * x + d * y))]];
    },
    frac: (rng, x0, y0) => {
      const p = rng.pick([2, 3, 4]), q = rng.pick([2, 3, 5]);
      if (p === q) return null;
      const x = p * nz(rng, -2, 2), y = q * nz(rng, -2, 2);
      const c = nz(rng, -3, 3), d = nz(rng, -4, 4);
      return [[`[[f:x/${p}]]＋[[f:y/${q}]]`, num(Q(x / p + y / q))], [lin2(c, d), num(Q(c * x + d * y))], false, x, y];
    },
    abc: (rng, x, y) => {
      const a = nz(rng, -5, 5), b = nz(rng, -5, 5), C = a * x + b * y, pp = nz(rng, -5, 5);
      if ((C - pp * x) % y) return null;
      const qq = (C - pp * x) / y;
      if (!qq || Math.abs(qq) > 9 || a * qq - b * pp === 0 || a === pp && b === qq) return null;
      return [[lin2(a, b), num(Q(C))], [lin2(pp, qq), num(Q(C))], true];
    }
  };
  const detOK = (eqs) => {
    const g = (e, x, y) => qs(evalQ(e[0], { x: Q(x), y: Q(y) }), evalQ(e[1], { x: Q(x), y: Q(y) }));
    const c = eqs.map((e) => [qs(g(e, 1, 0), g(e, 0, 0)), qs(g(e, 0, 1), g(e, 0, 0))]);
    return !qeq(qm(c[0][0], c[1][1]), qm(c[0][1], c[1][0]));
  };
  const simulSolve = {
    id: "c2.simulSolve",
    instruction: R("次の連立方程式を解きましょう。"),
    defaults: { types: ["add", "subst"] },
    levels: lv({ types: ["add", "add", "subst"] }, { types: ["mul1", "mul2", "subst2", "mul1"] }, { types: ["paren", "dec", "frac", "abc", "mul2"] }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx);
      for (let t = 0; t < 2000; t++) {
        const x = rng.pick(S_VALS), y = rng.pick(S_VALS), r = SIMUL[type](rng, x, y);
        if (!r) continue;
        const eqs = r[2] ? [[r[0][0], r[1][1]], [r[1][0], r[1][1]]] : [r[0], r[1]];
        const [X, Y] = r[3] !== void 0 ? [r[3], r[4]] : [x, y];
        const big = (s) => !/[a-zA-Z]/.test(s) && Math.abs(qv(evalQ(s))) > 60;
        if (big(eqs[0][1]) || big(eqs[1][1]) || !detOK(eqs)) continue;
        const text = r[2] ? `${r[0][0]}＝${r[1][0]}＝${r[1][1]}` : sys(`${r[0][0]}＝${r[0][1]}`, `${r[1][0]}＝${r[1][1]}`);
        return { key: `ss:${text}`, text, answer: { display: `${xs}＝${num(Q(X))}，${ys}＝${num(Q(Y))}` }, workspace: { type: "none" }, meta: { eqs, x: X, y: Y } };
      }
      throw new Error("連立方程式の問題が作れない");
    },
    verify(pr) {
      const { eqs, x, y } = pr.meta;
      for (const e of eqs) if (!qeq(evalQ(e[0], { x: Q(x), y: Q(y) }), evalQ(e[1], { x: Q(x), y: Q(y) }))) return "解が合わない";
      return detOK(eqs) ? null : "解が1つに決まらない";
    }
  };

  const simulCoef = {
    id: "c2.simulCoef",
    instruction: R("次の問いに答えましょう。"),
    defaults: { types: ["one"] },
    levels: lv({ types: ["one"] }, { types: ["one", "two"] }, { types: ["two"] }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx);
      const x = rng.pick(S_VALS), y = rng.pick(S_VALS), a = nz(rng, -6, 6), b = nz(rng, -6, 6);
      const sol = `${xs}＝${num(Q(x))}，${ys}＝${num(Q(y))}`;
      if (type === "one") {
        const c = nz(rng, -6, 6);
        const eq = `${a_}${xs}${c < 0 ? "－" : "＋"}${Math.abs(c) === 1 ? "" : Math.abs(c)}${ys}＝${num(Q(a * x + c * y))}`;
        return { key: `sc:${eq}:${x}:${y}`, text: `${sol}${R("が、方程式")} ${eq} ${R("の解であるとき、")}${a_}${R("の値を求めましょう。")}`, wide: true, answer: { display: `${a_}＝${num(Q(a))}` }, workspace: { type: "none" }, meta: { a, x, y, c } };
      }
      const e1 = `${a_}${xs}＋${b_}${ys}＝${num(Q(a * x + b * y))}`, e2 = `${b_}${xs}－${a_}${ys}＝${num(Q(b * x - a * y))}`;
      return { key: `sc2:${e1}:${e2}`, text: `${R("連立方程式")} ${sys(e1, e2)} ${R("の解が")} ${sol} ${R("であるとき、")}${a_}，${b_}${R("の値を求めましょう。")}`, wide: true, answer: { display: `${a_}＝${num(Q(a))}，${b_}＝${num(Q(b))}` }, workspace: { type: "none" }, meta: { a, b, x, y } };
    },
    verify(pr) {
      const m = pr.meta;
      if (m.c !== void 0) return null;
      return m.x * m.x + m.y * m.y ? null : "解が1つに決まらない";
    }
  };

  const SW = {
    fee: (rng) => {
      const a = rng.int(6, 12) * 100, b = rng.int(2, a / 100 - 2) * 100, x = rng.int(2, 12), y = rng.int(2, 15);
      return { t: `ある美術館の入館料は、大人1人${a}円、中学生1人${b}円です。大人と中学生を合わせて${x + y}人で入館したところ、入館料の合計は${a * x + b * y}円でした。大人と中学生は、それぞれ何人ですか。`, e: [`x＋y＝${x + y}`, `${a}x＋${b}y＝${a * x + b * y}`], ans: `大人 ${x}人，中学生 ${y}人`, x, y };
    },
    fruit: (rng) => {
      const a = rng.int(10, 20) * 10, b = rng.int(5, 15) * 10, x = rng.int(2, 9), y = rng.int(2, 9);
      if (a === b) return null;
      return { t: `1個${a}円のりんごと1個${b}円のなしを、合わせて${x + y}個買ったところ、代金は${a * x + b * y}円でした。りんごとなしを、それぞれ何個買いましたか。`, e: [`x＋y＝${x + y}`, `${a}x＋${b}y＝${a * x + b * y}`], ans: `りんご ${x}個，なし ${y}個`, x, y };
    },
    two: (rng) => {
      const x = rng.int(6, 15) * 10, y = rng.int(10, 25) * 10, a = rng.int(2, 5), b = rng.int(1, 4), c = rng.int(1, 5), d = rng.int(1, 4);
      if (a * d === b * c) return null;
      return { t: `鉛筆${a}${hon(a)}とノート${b}冊の代金は${a * x + b * y}円、鉛筆${c}${hon(c)}とノート${d}冊の代金は${c * x + d * y}円です。鉛筆1{本|ぽん}とノート1冊の値段は、それぞれ何円ですか。`, e: [`${a}x＋${b === 1 ? "" : b}y＝${a * x + b * y}`, `${c === 1 ? "" : c}x＋${d === 1 ? "" : d}y＝${c * x + d * y}`], ans: `鉛筆 ${x}円，ノート ${y}円`, x, y };
    },
    speed: (rng) => {
      const v1 = rng.pick([2, 3, 4]), v2 = rng.pick([4, 5, 6]);
      if (v1 >= v2) return null;
      const x = v1 * rng.int(1, 3), y = v2 * rng.int(1, 3), T = x / v1 + y / v2;
      return { t: `A町から峠を越えてB町まで、${x + y}kmの道のりを歩きます。A町から峠までは時速${v1}km、峠からB町までは時速${v2}kmで歩いたところ、全体で${T}時間かかりました。A町から峠まで、峠からB町までの道のりは、それぞれ何kmですか。`, e: [`x＋y＝${x + y}`, `[[f:x/${v1}]]＋[[f:y/${v2}]]＝${T}`], ans: `A町から峠 ${x}km，峠からB町 ${y}km`, x, y };
    },
    digits: (rng) => {
      const x = rng.int(1, 7), y = rng.int(x + 1, 9), s = x + y, d = 9 * (y - x);
      return { t: `2けたの自然数があります。十の位の数と一の位の数の和は${s}です。また、十の位の数と一の位の数を入れかえてできる数は、もとの数より${d}大きくなります。もとの自然数を求めましょう。(十の位の数を${xs}、一の位の数を${ys}とします。)`, e: [`x＋y＝${s}`, `10y＋x＝10x＋y＋${d}`], ans: `${10 * x + y}`, x, y };
    },
    percent: (rng) => {
      const pp = rng.pick([5, 10, 20]), qq = rng.pick([5, 10, 20]), x = rng.int(5, 12) * 20, y = rng.int(5, 12) * 20, k = x * pp / 100 - y * qq / 100;
      if (k <= 0) return null;
      return { t: `ある中学校の昨年の生徒数は${x + y}人でした。今年は、男子が${pp}%増え、女子が${qq}%減ったので、全体では${k}人増えました。昨年の男子と女子の生徒数は、それぞれ何人ですか。`, e: [`x＋y＝${x + y}`, `[[f:${pp}/100]]x－[[f:${qq}/100]]y＝${k}`], ans: `男子 ${x}人，女子 ${y}人`, x, y };
    }
  };
  Object.assign(RUBY, { 鉛筆: "えんぴつ", 値段: "ねだん", 道のり: "{道|みち}のり", 時速: "じそく", 歩きます: "{歩|ある}きます", 歩いた: "{歩|ある}いた", 時間: "じかん", 町: "まち", 増え: "{増|ふ}え", 減った: "{減|へ}った", 個: "こ", 冊: "さつ", 円: "えん", 人: "にん", 何人: "なんにん", 何個: "なんこ", 何円: "なんえん", 何km: "{何|なん}km", 代金: "だいきん", 合計: "ごうけい", 買った: "{買|か}った", 買いました: "{買|か}いました", 合わせて: "{合|あ}わせて", 数: "かず", 十の位: "{十|じゅう}の{位|くらい}", 一の位: "{一|いち}の{位|くらい}", 大きく: "{大|おお}きく", 中学校: "ちゅうがっこう", 全体では: "{全体|ぜんたい}では" });
  const simulWord = {
    id: "c2.simulWord",
    instruction: null,
    defaults: { types: ["fruit", "fee", "two"] },
    levels: lv({ types: ["fruit", "fee", "two"] }, { types: ["fee", "two", "digits", "speed"] }, { types: ["speed", "digits", "percent", "two"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 300; t++) {
        const type = typeOf(rng, p, ctx && { index: ctx.index + t });
        const r = SW[type](rng);
        if (!r) continue;
        const eTex = r.e.map(vTex);
        return {
          key: `sw:${r.t}`,
          softKey: type,
          text: R(r.t),
          answer: { display: `${R("式")} ${sys(eTex[0], eTex[1])}　${R("答え")} ${R(r.ans)}` },
          workspace: { type: "lines", labels: [R("式"), "", R("答え")], wideLabel: true },
          meta: { e: r.e, x: r.x, y: r.y }
        };
      }
      throw new Error("連立方程式の文章題が作れない");
    },
    verify(pr) {
      const { e, x, y } = pr.meta;
      for (const s of e) {
        const [l, r] = s.split("＝");
        if (!qeq(evalQ(l, { x: Q(x), y: Q(y) }), evalQ(r, { x: Q(x), y: Q(y) }))) return "式が合わない " + s;
      }
      return null;
    }
  };
