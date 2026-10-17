
  // ============================================================
  // 6 データの分布(四分位数・箱ひげ図)
  // ============================================================
  const med = (a) => a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2;
  const quart = (vals) => {
    const s = vals.slice().sort((a, b) => a - b), n = s.length, h = Math.floor(n / 2);
    return { min: s[0], q1: med(s.slice(0, h)), q2: med(s), q3: med(s.slice(n - h)), max: s[n - 1] };
  };
  const fnum = (v) => Number.isInteger(v) ? String(v) : v.toFixed(1);
  const QK = { q1: "第1四分位数", q2: "第2四分位数", q3: "第3四分位数", iqr: "四分位範囲", range: "範囲" };
  Object.assign(RUBY, { 第2四分位数: "{第|だい}2{四分位数|しぶんいすう}", 第3四分位数: "{第|だい}3{四分位数|しぶんいすう}", 範囲: "はんい", 中央値: "ちゅうおうち" });
  const quartile = {
    id: "c2.quartile",
    instruction: R("次のデータについて、〔　〕の中の値を求めましょう。"),
    defaults: { kinds: ["q1", "q2", "q3", "iqr"], n: [7, 9] },
    levels: lv({ kinds: ["q2", "q1", "q3"], n: [7, 9] }, { kinds: ["q1", "q3", "iqr", "q2"], n: [8, 11] }, { kinds: ["q1", "q3", "iqr", "range"], n: [10, 12] }),
    generate(rng, p, ctx) {
      const kind = ctx && Number.isInteger(ctx.index) ? p.kinds[ctx.index % p.kinds.length] : rng.pick(p.kinds);
      const TH = THEMES5;
      for (let t = 0; t < 200; t++) {
        const th = rng.pick(TH), n = rng.int(p.n[0], p.n[1]);
        const vals = Array.from({ length: n }, () => rng.int(th.range[0], th.range[1]));
        if (new Set(vals).size < 4) continue;
        const q = quart(vals), v = { q1: q.q1, q2: q.q2, q3: q.q3, iqr: q.q3 - q.q1, range: q.max - q.min }[kind];
        return { key: `qt:${kind}:${vals}`, softKey: th.id, text: `〔${R(QK[kind])}〕　${vals.join("、")}(${th.unit})`, wide: true, answer: { display: `${fnum(v)}${th.unit}` }, workspace: { type: "none" }, meta: { vals, kind, v } };
      }
      throw new Error("四分位数の問題が作れない");
    },
    verify(pr) {
      const s = pr.meta.vals.slice().sort((a, b) => a - b), n = s.length, h = Math.floor(n / 2);
      const lo = s.slice(0, h), hi = s.slice(n - h);
      if (lo.length + hi.length + n % 2 !== n) return "半分の分け方";
      return null;
    }
  };

  // 数直線の目もりと箱ひげ図
  function axisOf(lo, hi) {
    const span = hi - lo, step = span <= 20 ? 1 : span <= 40 ? 2 : 5, lab = span <= 20 ? 5 : 10;
    return { lo, hi, step, lab, u: 118 / span };
  }
  function axisItems(ax, y, unit) {
    const X = (v) => 8 + (v - ax.lo) * ax.u, items = [L_(X(ax.lo), y, X(ax.hi), y, { w: 0.5 })];
    for (let v = ax.lo; v <= ax.hi; v += ax.step) {
      const big = v % ax.lab === 0;
      items.push(L_(X(v), y, X(v), y + (big ? 2 : 1.2), { w: 0.3 }));
      if (big) items.push(T_(X(v), y + 5.4, String(v), 3.1));
    }
    items.push(T_(X(ax.hi) + 5, y + 5.4, `(${unit})`, 3.1, { anchor: "start" }));
    return { items, X };
  }
  function boxItems(X, s, y, o = {}) {
    const h = 9, t = y - h / 2, b = y + h / 2, w = 0.6;
    return [
      L_(X(s.min), y, X(s.q1), y, { w, ...o }), L_(X(s.q3), y, X(s.max), y, { w, ...o }),
      L_(X(s.min), t + 2, X(s.min), b - 2, { w, ...o }), L_(X(s.max), t + 2, X(s.max), b - 2, { w, ...o }),
      { t: "poly", pts: [[X(s.q1), t], [X(s.q3), t], [X(s.q3), b], [X(s.q1), b]], w, fill: "none", ...o },
      L_(X(s.q2), t, X(s.q2), b, { w, ...o })
    ];
  }
  const randSummary = (rng, lo, hi) => {
    for (;;) {
      const v = Array.from({ length: 5 }, () => rng.int(lo, hi)).sort((a, b) => a - b);
      if (new Set(v).size === 5 && v[4] - v[0] >= (hi - lo) * 0.5 && v[3] - v[1] >= 3) return { min: v[0], q1: v[1], q2: v[2], q3: v[3], max: v[4] };
    }
  };
  const BOX_THEMES = THEMES5.filter((t) => t.range[1] - t.range[0] >= 12);
  const boxplot = {
    id: "c2.boxplot",
    instruction: null,
    defaults: { types: ["read", "draw"] },
    levels: lv({ types: ["read", "draw"] }, { types: ["read", "draw"] }, { types: ["draw", "read"] }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx);
      for (let t = 0; t < 200; t++) {
        const th = rng.pick(BOX_THEMES);
        if (type === "read") {
          const s = randSummary(rng, th.range[0], th.range[1]);
          const ax = axisOf(Math.floor(th.range[0] / 5) * 5, Math.ceil(th.range[1] / 5) * 5), A = axisItems(ax, 24, R(th.unit));
          const items = [...A.items, ...boxItems(A.X, s, 12)];
          const ans = [`${s.q2}${th.unit}`, `${s.q3 - s.q1}${th.unit}`, `${s.max - s.min}${th.unit}`];
          return {
            key: `bp:r:${th.id}:${Object.values(s)}`,
            softKey: th.id,
            text: `${R("下の箱ひげ図は、あるクラスの")}${th.title}${R("を表したものです。")}[[br]](1) ${R("中央値を求めましょう。")}[[br]](2) ${R("四分位範囲を求めましょう。")}[[br]](3) ${R("範囲を求めましょう。")}`,
            figure: draw(150, 32, items),
            answer: { display: ans.map((a, i) => `(${i + 1}) ${a}`).join("　") },
            workspace: { type: "lines", labels: ["(1)", "(2)", "(3)"] },
            meta: { s }
          };
        }
        const n = rng.int(9, 12), vals = Array.from({ length: n }, () => rng.int(th.range[0], th.range[1]));
        if (new Set(vals).size < 6) continue;
        const s = quart(vals), ax = axisOf(Math.floor(th.range[0] / 5) * 5, Math.ceil(th.range[1] / 5) * 5), A = axisItems(ax, 24, R(th.unit));
        return {
          key: `bp:d:${vals}`,
          softKey: th.id,
          text: `${R("下のデータは、あるクラスの")}${th.title}${R("です。箱ひげ図をかきましょう。")}[[br]]${vals.join("、")}(${th.unit})`,
          figure: draw(150, 32, A.items),
          answer: { display: `${R("図のとおり")}(${R("最小値")} ${fnum(s.min)}，${R("第1四分位数")} ${fnum(s.q1)}，${R("中央値")} ${fnum(s.q2)}，${R("第3四分位数")} ${fnum(s.q3)}，${R("最大値")} ${fnum(s.max)})`, figure: draw(150, 32, [...A.items, ...boxItems(A.X, s, 12, { color: RED })]) },
          workspace: { type: "none" },
          meta: { vals, s }
        };
      }
      throw new Error("箱ひげ図の問題が作れない");
    },
    verify(pr) {
      const s = pr.meta.s;
      return s.min <= s.q1 && s.q1 <= s.q2 && s.q2 <= s.q3 && s.q3 <= s.max ? null : "順がおかしい";
    }
  };
  Object.assign(RUBY, { 下の: "{下|した}の", あるクラス: "あるクラス", 表した: "{表|あらわ}した", データ: "データ" });

  const boxCompare = {
    id: "c2.boxCompare",
    instruction: null,
    defaults: { half: false },
    levels: lv({ half: false }, { half: false }, { half: true }),
    generate(rng, p) {
      for (let t = 0; t < 500; t++) {
        const S = [0, 1, 2].map(() => randSummary(rng, 30, 100));
        const uniq = (f) => new Set(S.map(f)).size === 3;
        if (!uniq((s) => s.q2) || !uniq((s) => s.q3 - s.q1) || !uniq((s) => s.max - s.min)) continue;
        const arg = (f, best) => S.map(f).indexOf(best(...S.map(f)));
        const names = ["1組", "2組", "3組"];
        const ax = axisOf(30, 100), A = axisItems(ax, 64, R("点"));
        const items = [...A.items];
        S.forEach((s, i) => items.push(...boxItems(A.X, s, 12 + i * 17), T_(4, 12 + i * 17 + 1.2, R(names[i]), 3.4, { anchor: "end" })));
        const qs2 = [["中央値がいちばん大きいのは、どの組ですか。", names[arg((s) => s.q2, Math.max)]], ["四分位範囲がいちばん大きいのは、どの組ですか。", names[arg((s) => s.q3 - s.q1, Math.max)]], ["範囲がいちばん小さいのは、どの組ですか。", names[arg((s) => s.max - s.min, Math.min)]]];
        if (p.half) {
          const th = rng.int(5, 18) * 5, ok = names.filter((_, i) => S[i].q2 >= th);
          if (!ok.length || ok.length === 3 || S.some((s) => s.q2 === th)) continue;
          qs2.push([`${th}点以上の生徒が、その組の半数以上いるといえるのは、どの組ですか。全部答えましょう。`, ok.join("，")]);
        }
        return {
          key: `bc:${S.map((s) => Object.values(s))}`,
          text: `${R("下の図は、ある学年の1組〜3組の数学のテストの得点を、箱ひげ図に表したものです。")}[[br]]${qs2.map((q, i) => `(${i + 1}) ${R(q[0])}`).join("[[br]]")}`,
          figure: draw(162, 72, items.map((it) => shiftItem(it, 10, 0))),
          answer: { display: qs2.map((q, i) => `(${i + 1}) ${R(q[1])}`).join("　") },
          workspace: { type: "lines", labels: qs2.map((_, i) => `(${i + 1})`) },
          meta: { S }
        };
      }
      throw new Error("箱ひげ図の比較の問題が作れない");
    }
  };
  Object.assign(RUBY, { 組: "くみ", 学年: "がくねん", 数学: "すうがく", 得点: "とくてん", いちばん: "いちばん", 生徒: "せいと", 半数: "はんすう", いえる: "いえる" });

  // ============================================================
  // 7 確率
  // ============================================================
  const probTex = (c, n) => c === 0 ? "0" : c === n ? "1" : num(Q(c, n));
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const isPrime = (n) => n > 1 && range(2, n - 1).every((d) => n % d);
  const OMOTE = "{表|おもて}", URA = "{裏|うら}";
  const DICE = {
    one: (rng) => {
      const ev = rng.pick([["偶数の目が出る", (a) => a % 2 === 0], ["3の倍数の目が出る", (a) => a % 3 === 0], [`${rng.int(2, 5)}以下の目が出る`, null], ["6の約数の目が出る", (a) => 6 % a === 0], ["素数の目が出る", isPrime], ["1の目が出ない", (a) => a !== 1], ["奇数の目が出る", (a) => a % 2 === 1], ["4の約数の目が出る", (a) => 4 % a === 0], [`${rng.int(2, 5)}以上の目が出る`, null, true]]);
      if (!ev[1]) {
        const k = Number(ev[0][0]);
        ev[1] = ev[2] ? (a) => a >= k : (a) => a <= k;
      }
      const c = range(1, 6).filter(ev[1]).length;
      return { t: `1個のさいころを投げるとき、${ev[0]}確率`, c, n: 6 };
    },
    two: (rng) => {
      const k = rng.int(3, 11), d = rng.int(1, 4), m = rng.int(4, 9);
      const ev = rng.pick([[`出る目の和が${k}になる`, (a, b) => a + b === k], [`出る目の和が${m}以下になる`, (a, b) => a + b <= m], ["出る目の積が奇数になる", (a, b) => a * b % 2 === 1], ["同じ目が出る", (a, b) => a === b], [`出る目の差が${d}になる`, (a, b) => Math.abs(a - b) === d], ["少なくとも1個は1の目が出る", (a, b) => a === 1 || b === 1], ["出る目の和が5の倍数になる", (a, b) => (a + b) % 5 === 0]]);
      let c = 0;
      for (const a of range(1, 6)) for (const b of range(1, 6)) if (ev[1](a, b)) c++;
      return { t: `大小2個のさいころを同時に投げるとき、${ev[0]}確率`, c, n: 36 };
    },
    coin: (rng) => {
      const n = rng.pick([2, 3]);
      const evs = n === 2 ? [[`2枚とも${OMOTE}になる`, (h) => h === 2], [`1枚は${OMOTE}で1枚は${URA}になる`, (h) => h === 1], [`少なくとも1枚は${OMOTE}になる`, (h) => h >= 1]] : [[`3枚とも${OMOTE}になる`, (h) => h === 3], [`2枚が${OMOTE}で1枚が${URA}になる`, (h) => h === 2], [`少なくとも1枚は${URA}になる`, (h) => h < 3], [`${OMOTE}が1枚だけになる`, (h) => h === 1]];
      const ev = rng.pick(evs);
      let c = 0;
      for (let m = 0; m < 2 ** n; m++) {
        let h = 0;
        for (let i = 0; i < n; i++) if (m >> i & 1) h++;
        if (ev[1](h)) c++;
      }
      return { t: `${n}枚の硬貨を同時に投げるとき、${ev[0]}確率`, c, n: 2 ** n };
    }
  };
  const PICK = {
    card1: (rng) => {
      const N = rng.pick([10, 12, 15, 20]), k = rng.int(Math.floor(N / 2), N - 2);
      const ev = rng.pick([["偶数である", (a) => a % 2 === 0], ["3の倍数である", (a) => a % 3 === 0], ["素数である", isPrime], [`${k}以上である`, (a) => a >= k], ["4の倍数である", (a) => a % 4 === 0]]);
      return { t: `1から${N}までの整数が1つずつ書かれた${N}枚のカードから1枚引くとき、カードの数が${ev[0]}確率`, c: range(1, N).filter(ev[1]).length, n: N };
    },
    card2: (rng) => {
      const N = rng.pick([4, 5]), ds = range(1, N), k = rng.int(2, N) * 10;
      const ev = rng.pick([["偶数になる", (v) => v % 2 === 0], ["3の倍数になる", (v) => v % 3 === 0], [`${k}以上になる`, (v) => v >= k]]);
      let c = 0, n = 0;
      for (const a of ds) for (const b of ds) if (a !== b) {
        n++;
        if (ev[1](10 * a + b)) c++;
      }
      return { t: `${ds.join("，")}の${N}枚のカードから、続けて2枚引きます。1枚目を十の位、2枚目を一の位として2けたの整数をつくるとき、その整数が${ev[0]}確率`, c, n };
    },
    balls: (rng) => {
      const r = rng.int(2, 4), w = rng.int(2, 3), N = r + w;
      const ev = rng.pick([["2個とも赤玉である", (k) => k === 2], ["1個は赤玉で1個は白玉である", (k) => k === 1], ["少なくとも1個は白玉である", (k) => k < 2]]);
      let c = 0, n = 0;
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
        n++;
        if (ev[1]((i < r) + (j < r))) c++;
      }
      return { t: `赤玉${r}個と白玉${w}個が入っている袋から、同時に2個の玉を取り出すとき、${ev[0]}確率`, c, n };
    },
    people: (rng) => {
      const N = rng.pick([4, 5, 6]), names = ALPHA.slice(0, N);
      const ev = rng.pick([["Aが選ばれる", (s) => s.includes("A")], ["AとBの2人が選ばれる", (s) => s.includes("A") && s.includes("B")], ["Aが選ばれない", (s) => !s.includes("A")]]);
      let c = 0, n = 0;
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
        n++;
        if (ev[1](names[i] + names[j])) c++;
      }
      return { t: `${names.join("，")}の${N}人の中から、くじで2人の係を選ぶとき、${ev[0]}確率`, c, n };
    },
    lots: (rng) => {
      const N = rng.int(4, 6), k = rng.int(1, 2);
      const ev = rng.pick([["Bが当たる", (a, b) => b], ["2人とも当たる", (a, b) => a && b], ["Aだけが当たる", (a, b) => a && !b]]);
      if (k === 1 && ev[0] === "2人とも当たる") return null;
      let c = 0, n = 0;
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (i !== j) {
        n++;
        if (ev[1](i < k, j < k)) c++;
      }
      return { t: `${N}本のうち${k}本が当たりのくじがあります。このくじを、A，Bの2人がこの順に1本ずつ引くとき(引いたくじはもどさない)、${ev[0]}確率`, c, n };
    }
  };
  Object.assign(RUBY, { 出ない: "{出|で}ない", 大小: "だいしょう", 個: "こ", 枚: "まい", 書かれた: "{書|か}かれた", 引く: "{引|ひ}く", 引きます: "{引|ひ}きます", 引いた: "{引|ひ}いた", 一つずつ: "{1|ひと}つずつ", 玉: "たま", 入っている: "{入|はい}っている", 中: "なか", 本: "ほん", 選ばれる: "{選|えら}ばれる", 選ばれない: "{選|えら}ばれない", 選ぶ: "{選|えら}ぶ", 当たり: "{当|あ}たり", 当たる: "{当|あ}たる", 人: "にん", 確率: "かくりつ", 投げる: "{投|な}げる", 素数: "そすう" });
  const probGen = (id, M, levels) => ({
    id,
    instruction: R("次の確率を求めましょう。"),
    defaults: levels.basic,
    levels,
    generate(rng, p, ctx) {
      for (let t = 0; t < 200; t++) {
        const type = rng.pick(p.types);
        const r = M[type](rng);
        if (!r) continue;
        const text = R(r.t).replace(/1つずつ/, "{1|ひと}つずつ").replace("2{人|にん}", "{2人|ふたり}");
        return { key: `${id}:${text}`, text, wide: true, answer: { display: probTex(r.c, r.n) }, workspace: { type: "none" }, meta: { c: r.c, n: r.n } };
      }
      throw new Error("確率の問題が作れない");
    },
    verify(pr) {
      const { c, n } = pr.meta;
      return c >= 0 && c <= n ? null : "確率が0〜1の外";
    }
  });
  const probDice = probGen("c2.probDice", DICE, lv({ types: ["one", "coin"] }, { types: ["one", "two", "coin"] }, { types: ["two", "two", "coin"] }));
  const probPick = probGen("c2.probPick", PICK, lv({ types: ["card1", "people"] }, { types: ["card1", "card2", "balls", "people"] }, { types: ["card2", "balls", "lots", "people"] }));

  // ===== ヒント =====
  Object.assign(RUBY, { 分配法則: "ぶんぱいほうそく", 項: "こう", 同類項: "どうるいこう", 符号: "ふごう", 代入: "だいにゅう", 加減法: "かげんほう", 代入法: "だいにゅうほう", 消去: "しょうきょ", 両辺: "りょうへん", 移項: "いこう", 左辺: "さへん", 求め: "{求|もと}め", 未知数: "みちすう", 確かめ: "{確|たし}かめ", 単位: "たんい", 決めて: "{決|き}めて", 対応: "たいおう", 順に: "{順|じゅん}に", 書き: "{書|か}き", 書きます: "{書|か}きます", 調べ: "{調|しら}べ", 起こり: "{起|お}こり", 場合: "ばあい", 全部で: "{全部|ぜんぶ}で", 同様に確からしい: "{同様|どうよう}に{確|たし}からしい", 半分: "はんぶん", 箱: "はこ", 長い: "{長|なが}い", 部分: "ぶぶん", 散らばり: "{散|ち}らばり", 大きい: "{大|おお}きい", 等しく: "{等|ひと}しく", 外側: "そとがわ", 合わせる: "{合|あ}わせる", 使います: "{使|つか}います", 底角: "ていかく", 頂角: "ちょうかく", 平行線: "へいこうせん", 底辺: "ていへん", 共通な: "{共通|きょうつう}な", 等しい: "{等|ひと}しい", 樹形図: "じゅけいず", 表や: "{表|ひょう}や", 表: "ひょう", 数え: "{数|かぞ}え", 起こらない: "{起|お}こらない", 交わる: "{交|まじ}わる", 変わります: "{変|か}わります", 変えて: "{変|か}えて", 逆数: "ぎゃくすう", 一定: "いってい", 速さ: "{速|はや}さ", 道のり: "{道|みち}のり", 時間: "じかん", 増える: "{増|ふ}える", 読み: "{読|よ}み" });
  const H = {
    "c2.polyDegree": "単項式の次数は、かけ合わされている文字の個数です。多項式の次数は、各項の次数のうちでいちばん大きいものです。",
    "c2.polyAddSub": "かっこをはずして(－( )は符号を変えて)、同類項をまとめます。分数の式は通分してから計算しましょう。",
    "c2.monoMulDiv": "係数どうし、文字どうしをかけます。わり算は逆数をかけるかけ算になおすとまちがえにくくなります。",
    "c2.exprValue2": "先に式を簡単にしてから代入すると、計算が楽になります。負の数はかっこをつけて代入しましょう。",
    "c2.solveFor": "解く文字の項だけを左辺に残し、ほかの項は移項します。最後に両辺を係数でわります。",
    "c2.proofExpr": "連続する整数は n，n＋1，n＋2、偶数は 2m、奇数は 2n＋1 のように表します。",
    "c2.simulSolve": "係数をそろえて、たすかひくかして1つの文字を消去します(加減法)。y＝… の形があれば代入法が便利です。",
    "c2.simulCoef": "わかっている x，y の値を代入して、a，b についての方程式をつくります。",
    "c2.simulWord": "わからない2つの数量を x，y として、等しい関係を2つ見つけて式にします。答えが問題に合うか確かめましょう。",
    "c2.linGraph": "切片(y軸との交点)をとり、そこから傾きのとおりに右へ1(分母の数)、上へ傾き(分子の数)進んだ点をとって結びます。",
    "c2.linFormula": "y＝ax＋b の a は傾き(変化の割合)、b は切片です。わかっている x，y の値を代入して求めます。",
    "c2.rateChange": "変化の割合＝(yの増加量)÷(xの増加量)。一次関数では一定で、傾き a に等しくなります。",
    "c2.intersection": "2つの直線の式を連立方程式として解くと、その解が交点の座標です。",
    "c2.eqLine": "y について解いて y＝ax＋b の形にします。y＝k は x軸に平行、x＝h は y軸に平行な直線です。",
    "c2.linWord": "はじめの量が切片、1分(1kmなど)あたりに変わる量が傾きになります。",
    "c2.parallelAngle": "平行線の同位角・錯角は等しくなります。折れ線のときは、折れた点を通る平行線をひいて考えます。",
    "c2.polygonAngle": "n角形の内角の和は 180°×(n－2)、外角の和はいつも 360°です。",
    "c2.triAngle": "三角形の1つの外角は、そのとなりにない2つの内角の和に等しくなります。",
    "c2.congCorr": "≡の記号では、対応する頂点を同じ順に書きます。",
    "c2.congCond": "3組の辺／2組の辺とその間の角／1組の辺とその両端の角、のどれにあてはまるか調べます。",
    "c2.hypothesis": "「○○ならば□□」の○○が仮定、□□が結論です。",
    "c2.proofFill": "仮定・共通な辺・対頂角・平行線の錯角などから等しいものを見つけ、合同条件にあてはめます。",
    "c2.isosceles": "二等辺三角形の底角は等しくなります。頂角＋底角×2＝180°です。",
    "c2.paraProps": "平行四辺形は、2組の対辺・対角がそれぞれ等しく、対角線はそれぞれの中点で交わります。となり合う角の和は180°です。",
    "c2.quadCond": "長方形は4つの角が等しい、ひし形は4つの辺が等しい、正方形はその両方です。",
    "c2.equalArea": "底辺が共通で、平行線の間にある三角形は高さが等しいので、面積も等しくなります。",
    "c2.quartile": "データを小さい順に並べ、半分に分けます。前半の中央値が第1四分位数、後半の中央値が第3四分位数です。",
    "c2.boxplot": "箱の左はしが第1四分位数、箱の中の線が中央値、右はしが第3四分位数、ひげのはしが最小値と最大値です。",
    "c2.boxCompare": "箱の長さが四分位範囲です。中央値より上には、データの半分があります。",
    "c2.probDice": "起こりうる場合を表や樹形図で全部数え、確率＝(あることがらの起こる場合の数)÷(全部の場合の数)で求めます。",
    "c2.probPick": "「同時に取り出す」ときは順番を考えない組み合わせで数えます。樹形図をかいて数えもれがないようにしましょう。"
  };
  Object.assign(RUBY, { 合わされて: "{合|あ}わされて", 先に: "{先|さき}に", 便利: "べんり", 変わる: "{変|か}わる", 見つけ: "{見|み}つけ", 両方: "りょうほう", 単項式: "たんこうしき", 多項式: "たこうしき", 各項: "かくこう", 通分: "つうぶん", 係数: "けいすう", 楽に: "{楽|らく}に", 残し: "{残|のこ}し", 最後: "さいご", 見つけて: "{見|み}つけて", 分母: "ぶんぼ", 分子: "ぶんし", 進んだ: "{進|すす}んだ", 結びます: "{結|むす}びます", 折れ線: "{折|お}れ{線|せん}", 折れた: "{折|お}れた", 考えます: "{考|かんが}えます", 頂点: "ちょうてん", 対辺: "たいへん", 対角: "たいかく", 前半: "ぜんはん", 後半: "こうはん", 並べ: "{並|なら}べ", 左はし: "{左|ひだり}はし", 右はし: "{右|みぎ}はし", 線: "せん", 組み合わせ: "{組|く}み{合|あ}わせ", 数えもれ: "{数|かぞ}えもれ", 起こる: "{起|お}こる", 起こりうる: "{起|お}こりうる", 順番: "じゅんばん", 考えない: "{考|かんが}えない", 間: "あいだ", 合う: "{合|あ}う", 量: "りょう", 中の: "{中|なか}の" });
  for (const [k, v] of Object.entries(H)) chuLib.hints[k] = R(v);

  Object.assign(chuLib, { nz2, lcm, clean, pAdd, pScale, pMul, keyOrder, lettersTex, monoTex, polyTex, degOf, mono, mTex, mMul, mDiv, LET2, polyOf, lin2, sys, vTex, lineTex, segOf, ptTex, nrm, angMark, rightMark, ticks, seg, vLabel, sideLabel, centroid, fitDraw, rayX, XL, deg, aoLabel, probTex, range, med, fnum });
  return [polyDegree, polyAddSub, monoMulDiv, exprValue2, solveFor, proofExpr, simulSolve, simulCoef, simulWord, linFormula, rateChange, intersection, eqLine, linGraph, linWord, parallelAngle, polygonAngle, triAngle, congCorr, congCond, hypothesis, proofFill, isosceles, paraProps, quadCond, equalArea, quartile, boxplot, boxCompare, probDice, probPick];
})();
var chu2Grade = (() => {
  const T = (label, generator, kinds, o = {}) => ({ label, generator, kinds, ...o });
  const D = ["drill", "test"], W = ["word", "test"], F = ["figure", "test"];
  const units = [
    ["c2-01", "式の計算", "{式|しき}の{計算|けいさん}", "数と式", [T("単項式と多項式", "c2.polyDegree", D), T("多項式の加法・減法", "c2.polyAddSub", D, { weight: 2 }), T("単項式の乗法・除法", "c2.monoMulDiv", D, { weight: 2 }), T("式の値", "c2.exprValue2", D), T("等式の変形", "c2.solveFor", D), T("文字式の利用", "c2.proofExpr", W)], { drill: [12, 5], word: [2, 20] }],
    ["c2-02", "連立方程式", "{連立方程式|れんりつほうていしき}", "数と式", [T("連立方程式を解く", "c2.simulSolve", D, { weight: 3 }), T("解から係数を求める", "c2.simulCoef", D), T("連立方程式の文章題", "c2.simulWord", W)], { drill: [12, 5], word: [4, 10] }],
    ["c2-03", "一次関数", "{一次関数|いちじかんすう}", "関数", [T("一次関数の式", "c2.linFormula", D), T("変化の割合", "c2.rateChange", D), T("2直線の交点", "c2.intersection", D), T("方程式とグラフ", "c2.eqLine", D), T("一次関数のグラフ", "c2.linGraph", F), T("一次関数の利用", "c2.linWord", W)], { drill: [8, 5], figure: [2, 15], word: [3, 10] }],
    ["c2-04", "平行と合同", "{平行|へいこう}と{合同|ごうどう}", "図形", [T("平行線と角", "c2.parallelAngle", F), T("多角形の角", "c2.polygonAngle", D), T("三角形の角", "c2.triAngle", F), T("合同な図形の対応", "c2.congCorr", D), T("三角形の合同条件", "c2.congCond", F), T("仮定と結論", "c2.hypothesis", W), T("証明", "c2.proofFill", W)], { drill: [6, 5], figure: [4, 10], word: [2, 15] }],
    ["c2-05", "三角形と四角形", "{三角形|さんかくけい}と{四角形|しかくけい}", "図形", [T("二等辺三角形", "c2.isosceles", F), T("平行四辺形の性質", "c2.paraProps", F), T("平行四辺形になる条件", "c2.quadCond", W), T("平行線と面積", "c2.equalArea", F)], { word: [3, 10], figure: [5, 14] }],
    ["c2-06", "データの分布", "データの{分布|ぶんぷ}", "データの活用", [T("四分位数と四分位範囲", "c2.quartile", W), T("箱ひげ図", "c2.boxplot", F), T("箱ひげ図の比較", "c2.boxCompare", F)], { word: [4, 10], figure: [3, 20] }],
    ["c2-07", "確率", "{確率|かくりつ}", "データの活用", [T("さいころ・硬貨の確率", "c2.probDice", D), T("カード・玉・くじの確率", "c2.probPick", D)], { drill: [10, 10] }]
  ];
  return {
    grade: 8,
    note: "中学2年。学習指導要領(平成29年告示)の内容の順。問題文はすべてこのファイルで作ったもの。",
    units: units.map(([id, name, rubyName, domain, topics, testPlan], i) => ({ id, order: i + 1, name, rubyName, domain, topics, testPlan }))
  };
})();
