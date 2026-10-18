// 数学A(学習指導要領の内容の順:図形の性質・場合の数と確率・数学と人間の活動。教科書の章立てに合わせて 場合の数 → 確率 → 図形の性質 → 整数)
var kouA = (() => {
  const K = kouLib;
  const { Q, qa, qs, qm, qd, qv, num, gcd, lv, nz, X, V, evalH, near, gen, redo, fact, nPr, nCr, P_, C_, pickN } = K;
  const H = {};
  const fr = (a, b) => num(Q(a, b));

  // ============================================================
  // 1 場合の数
  // ============================================================
  const setCount = gen("kA.setCount", "次の問いに答えましょう。", lv({ types: ["or", "and"] }, { types: ["or", "neither", "only"] }, { types: ["neither", "only", "survey", "three"] }), (rng, type) => {
    if (type === "survey") {
      const N = rng.pick([40, 45, 50]), a = rng.int(15, 30), b = rng.int(12, 28), both = rng.int(5, Math.min(a, b) - 2);
      const none = N - (a + b - both);
      if (none < 0) return null;
      const ask = rng.int(0, 1);
      return { text: `${N}人の生徒のうち、本 A を読んだ人は ${a}人、本 B を読んだ人は ${b}人、両方読んだ人は ${both}人です。${ask ? "どちらも読んでいない人" : "少なくとも一方を読んだ人"}は何人ですか。`, ans: `${ask ? none : a + b - both}人`, wide: true, meta: { v: ask ? none : a + b - both } };
    }
    const N = rng.pick([100, 120, 150, 200, 300]), [a, b] = pickN(rng, [2, 3, 4, 5, 6, 7], 2).sort((u, v) => u - v);
    if (type === "three") {
      const c = rng.pick([2, 3, 5, 7].filter((x) => x !== a && x !== b && gcd(x, a) === 1 && gcd(x, b) === 1));
      if (!c || gcd(a, b) !== 1) return null;
      let cnt = 0;
      for (let x = 1; x <= N; x++) if (x % a === 0 || x % b === 0 || x % c === 0) cnt++;
      return { text: `1 から ${N} までの整数のうち、${a}，${b}，${c} の少なくとも1つで割り切れる数の個数`, ans: `${cnt}個`, meta: { v: cnt } };
    }
    const pred = { or: (x) => x % a === 0 || x % b === 0, and: (x) => x % a === 0 && x % b === 0, neither: (x) => x % a !== 0 && x % b !== 0, only: (x) => x % a === 0 !== (x % b === 0) }[type];
    const word = { or: `${a} または ${b} で割り切れる数`, and: `${a} と ${b} の両方で割り切れる数`, neither: `${a} でも ${b} でも割り切れない数`, only: `${a}，${b} のどちらか一方だけで割り切れる数` }[type];
    let cnt = 0;
    for (let x = 1; x <= N; x++) if (pred(x)) cnt++;
    return { text: `1 から ${N} までの整数のうち、${word}の個数`, ans: `${cnt}個`, meta: { v: cnt } };
  }, null, { work: 26 });

  const permCalc = gen("kA.permCalc", "次の値を求めましょう。", lv({ types: ["P", "C", "fact"] }, { types: ["P", "C", "C2", "fact"] }, { types: ["C2", "Cfrac", "P", "C"] }), (rng, type) => {
    if (type === "fact") {
      const n = rng.int(3, 9);
      if (rng.chance(0.6)) {
        const m = rng.int(1, n - 1);
        return { text: `[[f:${n}!/${m}!]]`, ans: String(fact(n) / fact(m)), meta: { v: fact(n) / fact(m) } };
      }
      if (n > 7) return null;
      return { text: `${n}!`, ans: String(fact(n)), meta: { v: fact(n) } };
    }
    const n = rng.int(4, 10), r = rng.int(2, Math.min(4, n - 1));
    if (type === "P") return { text: P_(n, r), ans: String(nPr(n, r)), meta: { v: nPr(n, r) } };
    if (type === "C") return { text: C_(n, r), ans: String(nCr(n, r)), meta: { v: nCr(n, r) } };
    if (type === "C2") {
      const m = rng.int(8, 15), k = m - rng.int(1, 2);
      return { text: C_(m, k), ans: String(nCr(m, k)), meta: { v: nCr(m, k) } };
    }
    return { text: `${C_(n, r)}×${C_(n - r, 1)}`, ans: String(nCr(n, r) * (n - r)), meta: { v: nCr(n, r) * (n - r) } };
  }, (pr) => {
    // [[_n]]P[[_r]] を計算しなおす
    const t = pr.text.replace(/\[\[_(\d+)\]\]([PC])\[\[_(\d+)\]\]/g, (m0, n, k, r) => String(k === "P" ? nPr(+n, +r) : nCr(+n, +r))).replace(/(\d+)!/g, (m0, n) => String(fact(+n)));
    return evalH(t) === pr.meta.v && String(pr.meta.v) === pr.answer.display ? null : "値が合わない";
  }, { work: 14 });

  // 並べ方(文章題)。小さいものは数え上げて確かめる
  const perms = (arr) => arr.length <= 1 ? [arr] : arr.flatMap((x, i) => perms([...arr.slice(0, i), ...arr.slice(i + 1)]).map((p) => [x, ...p]));
  const PERM = {
    line: (rng) => {
      const n = rng.int(5, 8), r = rng.int(3, 4);
      return { t: `${n}人の中から ${r}人を選んで1列に並べる方法は何通りありますか。`, v: nPr(n, r), chk: () => nPr(n, r) };
    },
    adj: (rng) => {
      const m = rng.int(2, 4), f = rng.int(2, 3);
      const n = m + f, all = perms([...Array(n).keys()]);
      const cnt = all.filter((p) => {
        const pos = p.map((x, i) => [x, i]).filter(([x]) => x >= m).map(([, i]) => i);
        return Math.max(...pos) - Math.min(...pos) === f - 1;
      }).length;
      return { t: `男子 ${m}人と女子 ${f}人が1列に並ぶとき、女子 ${f}人が隣り合う並び方は何通りありますか。`, v: fact(m + 1) * fact(f), chk: () => cnt };
    },
    ends: (rng) => {
      const m = rng.int(2, 4), f = rng.int(2, 3), n = m + f;
      const cnt = perms([...Array(n).keys()]).filter((p) => p[0] < m && p[n - 1] < m).length;
      return { t: `男子 ${m}人と女子 ${f}人が1列に並ぶとき、両端が男子になる並び方は何通りありますか。`, v: nPr(m, 2) * fact(n - 2), chk: () => cnt };
    },
    circle: (rng) => {
      const n = rng.int(4, 7);
      // 回転して同じものを1つに
      const seen = new Set();
      for (const p of perms([...Array(n).keys()])) {
        const k = p.indexOf(0);
        seen.add([...p.slice(k), ...p.slice(0, k)].join());
      }
      return { t: `${n}人が円形のテーブルのまわりに座る方法は何通りありますか。`, v: fact(n - 1), chk: () => seen.size };
    },
    digits: (rng) => {
      const mx = rng.int(4, 6), r = 3, even = rng.chance(0.5);
      // 0〜mx の異なる3つの数字で3けたの整数(偶数)
      let cnt = 0;
      for (let x = 100; x <= 999; x++) {
        const d = String(x).split("").map(Number);
        if (d.some((v) => v > mx) || new Set(d).size < 3) continue;
        if (even && x % 2) continue;
        cnt++;
      }
      return { t: `0，1，2，…，${mx} の ${mx + 1}個の数字から異なる3個を使ってできる3けたの${even ? "偶数" : "整数"}は何個ありますか。`, v: cnt, chk: () => cnt, unit: "個" };
    },
    rep: (rng) => {
      const n = rng.int(4, 6), k = rng.pick([2, 3]);
      return { t: `${n}人を ${k === 2 ? "2つの部屋 A，B" : "3つの部屋 A，B，C"} に入れる方法は何通りありますか。ただし、だれも入らない部屋があってもよいとします。`, v: k ** n, chk: () => k ** n };
    },
    same: (rng) => {
      const w = rng.pick(["AABBBC", "AAABBC", "AABBCC", "aaabbcc", "AABBBB"]);
      const seen = new Set(perms([...w]).map((p) => p.join("")));
      return { t: `${w.split("").join("，")} の ${w.length}文字を1列に並べる方法は何通りありますか。`, v: seen.size, chk: () => seen.size };
    },
    path: (rng) => {
      const a = rng.int(3, 6), b = rng.int(2, 4);
      return { t: `東西に ${a + 1}本、南北に ${b + 1}本の道が碁盤の目のように通っている町で、南西の角から北東の角まで最短の道順で行く方法は何通りありますか。`, v: nCr(a + b, a), chk: () => {
        const f = (x, y) => x === 0 || y === 0 ? 1 : f(x - 1, y) + f(x, y - 1);
        return f(a, b);
      } };
    }
  };
  const permWord = gen("kA.perm", null, lv({ types: ["line", "circle", "rep"] }, { types: ["adj", "ends", "digits", "same", "circle"] }, { types: ["adj", "digits", "same", "path", "ends"] }), (rng, type) => {
    const r = PERM[type](rng);
    return { text: r.t, ans: `${r.v}${r.unit || "通り"}`, softKey: type, meta: { chk: r.chk, v: r.v }, ws: { type: "lines", labels: ["答え"] }, work: 40 };
  }, (pr) => pr.meta.chk() === pr.meta.v ? null : "数え上げと合わない");

  // 組合せ(文章題)
  const subsets = (n, r) => {
    const out = [];
    const rec = (s, cur) => {
      if (cur.length === r) return out.push(cur.slice());
      for (let i = s; i < n; i++) cur.push(i), rec(i + 1, cur), cur.pop();
    };
    rec(0, []);
    return out;
  };
  const COMB = {
    choose: (rng) => {
      const n = rng.int(6, 12), r = rng.int(2, 4);
      return { t: `${n}人の中から ${r}人の委員を選ぶ方法は何通りありますか。`, v: nCr(n, r), chk: () => subsets(n, r).length };
    },
    mf: (rng) => {
      const m = rng.int(4, 7), f = rng.int(3, 6), a = rng.int(1, 3), b = rng.int(1, 2);
      return { t: `男子 ${m}人、女子 ${f}人の中から、男子 ${a}人、女子 ${b}人を選ぶ方法は何通りありますか。`, v: nCr(m, a) * nCr(f, b), chk: () => subsets(m, a).length * subsets(f, b).length };
    },
    poly: (rng) => {
      const n = rng.int(6, 10), ask = rng.int(0, 1);
      return ask ? { t: `正 ${n} 角形の対角線の本数を求めましょう。`, v: nCr(n, 2) - n, chk: () => subsets(n, 2).filter(([i, j]) => j - i !== 1 && !(i === 0 && j === n - 1)).length, unit: "本" } : { t: `正 ${n} 角形の頂点のうち3個を結んでできる三角形の個数を求めましょう。`, v: nCr(n, 3), chk: () => subsets(n, 3).length, unit: "個" };
    },
    incl: (rng) => {
      const n = rng.int(7, 10), r = rng.int(3, 4), inc = rng.chance(0.5);
      return { t: `A，B をふくむ ${n}人の中から ${r}人を選ぶとき、A，B ${inc ? "の2人をともにふくむ" : "のどちらもふくまない"}選び方は何通りありますか。`, v: inc ? nCr(n - 2, r - 2) : nCr(n - 2, r), chk: () => subsets(n, r).filter((s) => inc ? s.includes(0) && s.includes(1) : !s.includes(0) && !s.includes(1)).length };
    },
    atLeast: (rng) => {
      const m = rng.int(4, 6), f = rng.int(3, 5), r = rng.int(3, 4);
      return { t: `男子 ${m}人、女子 ${f}人の中から ${r}人を選ぶとき、女子を少なくとも1人ふくむ選び方は何通りありますか。`, v: nCr(m + f, r) - nCr(m, r), chk: () => subsets(m + f, r).filter((s) => s.some((x) => x >= m)).length };
    },
    group: (rng) => {
      const k = rng.pick([[6, 2, 3], [6, 3, 2], [4, 2, 2], [9, 3, 3], [8, 2, 4]]), [n, s, g] = k;
      const v = fact(n) / (fact(s) ** g * fact(g));
      return { t: `${n}人を ${s}人ずつの ${g}組に分ける方法は何通りありますか(組には区別がないとします)。`, v, chk: () => {
        // 組分けを数える:最小の人がいる組から順に決める
        const f = (rest) => {
          if (!rest.length) return 1;
          const [h, ...t] = rest;
          return subsets(t.length, s - 1).reduce((a, idx) => a + f(t.filter((_, i) => !idx.includes(i))), 0);
        };
        return f([...Array(n).keys()]);
      } };
    }
  };
  const combWord = gen("kA.comb", null, lv({ types: ["choose", "mf", "poly"] }, { types: ["mf", "poly", "incl", "atLeast"] }, { types: ["atLeast", "group", "incl", "poly"] }), (rng, type) => {
    const r = COMB[type](rng);
    return { text: r.t, ans: `${r.v}${r.unit || "通り"}`, softKey: type, meta: { chk: r.chk, v: r.v }, ws: { type: "lines", labels: ["答え"] }, work: 40 };
  }, (pr) => pr.meta.chk() === pr.meta.v ? null : "数え上げと合わない");
  H["kA.setCount"] = "n(A∪B)＝n(A)＋n(B)－n(A∩B)。「どちらでもない」は全体から引きます。";
  H["kA.permCalc"] = "[[_n]]P[[_r]]＝n(n－1)…(n－r＋1)、[[_n]]C[[_r]]＝[[f:[[_n]]P[[_r]]/r!]]、[[_n]]C[[_r]]＝[[_n]]C[[_n－r]]。";
  H["kA.perm"] = "隣り合うものは1つにまとめて並べ、中で並べかえます。円順列は (n－1)!、同じものをふくむ順列は [[f:n!/p!q!r!]]。";
  H["kA.comb"] = "選ぶだけなら組合せ [[_n]]C[[_r]]。「少なくとも」は全体から「1人もいない」を引きます。区別のない組は、組の数の階乗でわります。";

  // ============================================================
  // 2 確率
  // ============================================================
  // 数え上げ:さいころ・硬貨・玉
  const dice = (n) => {
    let out = [[]];
    for (let i = 0; i < n; i++) out = out.flatMap((a) => [1, 2, 3, 4, 5, 6].map((d) => [...a, d]));
    return out;
  };
  const coins = (n) => {
    let out = [[]];
    for (let i = 0; i < n; i++) out = out.flatMap((a) => [[...a, 1], [...a, 0]]);
    return out;
  };
  const PROB = {
    sum: (rng) => {
      const s = rng.int(4, 10), all = dice(2), k = all.filter(([a, b]) => a + b === s).length;
      return { t: `大小2個のさいころを同時に投げるとき、出る目の和が ${s} になる確率を求めましょう。`, p: [k, 36] };
    },
    prodEven: (rng) => {
      const ask = rng.int(0, 2), all = dice(2);
      const P2 = [([a, b]) => a * b % 2 === 0, ([a, b]) => Math.abs(a - b) <= 1, ([a, b]) => a > b][ask];
      const w = ["出る目の積が偶数になる", "出る目の差が1以下になる", "大きいさいころの目が小さいさいころの目より大きくなる"][ask];
      return { t: `大小2個のさいころを同時に投げるとき、${w}確率を求めましょう。`, p: [all.filter(P2).length, 36] };
    },
    coin: (rng) => {
      const n = rng.int(3, 5), k = rng.int(1, n - 1), all = coins(n);
      return { t: `${n}枚の硬貨を同時に投げるとき、表がちょうど ${k}枚出る確率を求めましょう。`, p: [all.filter((c) => c.reduce((a, b) => a + b, 0) === k).length, all.length] };
    },
    ball: (rng) => {
      const r = rng.int(2, 5), w = rng.int(2, 5), ask = rng.int(0, 2);
      const n = r + w, pairs = subsets(n, 2);
      const P2 = [(s) => s.every((x) => x < r), (s) => s.filter((x) => x < r).length === 1, (s) => s.every((x) => x >= r)][ask];
      const word = ["2個とも赤玉である", "赤玉と白玉が1個ずつである", "2個とも白玉である"][ask];
      return { t: `赤玉 ${r}個、白玉 ${w}個が入った袋から、同時に2個の玉を取り出すとき、${word}確率を求めましょう。`, p: [pairs.filter(P2).length, pairs.length] };
    },
    atLeast: (rng) => {
      const r = rng.int(2, 4), w = rng.int(3, 5), k = 3, n = r + w, sets = subsets(n, k);
      return { t: `赤玉 ${r}個、白玉 ${w}個が入った袋から、同時に ${k}個の玉を取り出すとき、少なくとも1個は赤玉である確率を求めましょう。`, p: [sets.filter((s) => s.some((x) => x < r)).length, sets.length] };
    },
    cards: (rng) => {
      const n = rng.pick([10, 12, 15, 20]), [a, b] = pickN(rng, [2, 3, 4, 5], 2);
      let k = 0;
      for (let x = 1; x <= n; x++) if (x % a === 0 || x % b === 0) k++;
      return { t: `1 から ${n} までの番号が書かれた ${n}枚のカードから1枚引くとき、番号が ${a} の倍数または ${b} の倍数である確率を求めましょう。`, p: [k, n] };
    },
    rep: (rng) => {
      // 反復試行:さいころを n 回投げて、k 回だけ(1 か 2 の目 など)
      const n = rng.int(3, 5), k = rng.int(1, n - 1), ev = rng.pick([[1, "1の目"], [2, "3の倍数の目"], [3, "偶数の目"]]);
      const all = dice(n), hit = (d) => ev[0] === 1 ? d === 1 : ev[0] === 2 ? d % 3 === 0 : d % 2 === 0;
      return { t: `1個のさいころを ${n}回投げるとき、${ev[1]}がちょうど ${k}回出る確率を求めましょう。`, p: [all.filter((d) => d.filter(hit).length === k).length, all.length] };
    },
    match: (rng) => {
      // A が先に2勝する確率(1回で A が勝つ確率 p)
      const [pn, pd] = rng.pick([[1, 2], [1, 3], [2, 3], [3, 5]]), w = rng.pick([2, 3]);
      // 先に w 勝:勝ち負けの列を数える
      const pq = Q(pn, pd), qq = Q(pd - pn, pd);
      let tot = Q(0);
      for (let lose = 0; lose < w; lose++) tot = qa(tot, qm(Q(nCr(w - 1 + lose, lose)), qm(K.qpow(pq, w), K.qpow(qq, lose))));
      return { t: `A，B の2人が試合をくり返し、先に ${w}勝した方を優勝とします。1回の試合で A が勝つ確率が ${fr(pn, pd)} のとき、A が優勝する確率を求めましょう。ただし、引き分けはないものとします。`, p: [tot[0], tot[1]], q: true };
    }
  };
  const probWord = gen("kA.prob", null, lv({ types: ["sum", "coin", "ball", "cards"] }, { types: ["prodEven", "ball", "atLeast", "rep"] }, { types: ["atLeast", "rep", "match", "prodEven"] }), (rng, type) => {
    const r = PROB[type](rng);
    return { text: r.t, ans: fr(r.p[0], r.p[1]), softKey: type, meta: { p: r.p }, ws: { type: "lines", labels: ["答え"] }, work: 45 };
  }, (pr) => near(evalH(pr.answer.display), pr.meta.p[0] / pr.meta.p[1]) ? null : "確率が合わない");

  // 条件付き確率・期待値
  const COND = {
    draw2: (rng) => {
      const r = rng.int(2, 5), w = rng.int(2, 5), n = r + w;
      // 順に2個(もどさない)。1個目が赤のとき、2個目も赤
      const seq = [];
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j) seq.push([i, j]);
      const A = seq.filter(([i]) => i < r), AB = A.filter(([, j]) => j < r);
      return { t: `赤玉 ${r}個、白玉 ${w}個が入った袋から、玉を1個ずつ2回取り出します(取り出した玉はもどしません)。1回目に赤玉が出たとき、2回目も赤玉である条件付き確率を求めましょう。`, p: [AB.length, A.length] };
    },
    lottery: (rng) => {
      const n = rng.int(8, 12), h = rng.int(2, 4);
      // 2人目が当たる確率は h/n
      const seq = [];
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j) seq.push([i, j]);
      return { t: `当たりくじ ${h}本をふくむ ${n}本のくじがあります。A，B の順に1本ずつ引くとき(引いたくじはもどしません)、B が当たる確率を求めましょう。`, p: [seq.filter(([, j]) => j < h).length, seq.length] };
    },
    both: (rng) => {
      const n = rng.int(8, 12), h = rng.int(2, 4);
      return { t: `当たりくじ ${h}本をふくむ ${n}本のくじを、A，B の順に1本ずつ引きます(引いたくじはもどしません)。2人とも当たる確率を求めましょう。`, p: [h * (h - 1), n * (n - 1)] };
    },
    test: (rng) => {
      // 2つの箱
      const a1 = rng.int(2, 4), b1 = rng.int(1, 4), a2 = rng.int(1, 3), b2 = rng.int(2, 5);
      // 箱を等確率で選び1個取り出す。赤だったとき箱 A の確率
      const pa = Q(a1, a1 + b1), pb = Q(a2, a2 + b2), red = qa(qm(Q(1, 2), pa), qm(Q(1, 2), pb)), post = qd(qm(Q(1, 2), pa), red);
      return { t: `箱 A には赤玉 ${a1}個と白玉 ${b1}個、箱 B には赤玉 ${a2}個と白玉 ${b2}個が入っています。どちらかの箱を等しい確率で選んで玉を1個取り出したところ、赤玉でした。それが箱 A から取り出したものである確率を求めましょう。`, p: [post[0], post[1]] };
    }
  };
  const condWord = gen("kA.cond", null, lv({ types: ["draw2", "both"] }, { types: ["draw2", "lottery", "both"] }, { types: ["lottery", "test", "draw2"] }), (rng, type) => {
    const r = COND[type](rng);
    return { text: r.t, ans: fr(r.p[0], r.p[1]), softKey: type, meta: { p: r.p }, ws: { type: "lines", labels: ["答え"] }, work: 50 };
  }, (pr) => near(evalH(pr.answer.display), pr.meta.p[0] / pr.meta.p[1]) ? null : "確率が合わない");

  const EXP = {
    die: (rng) => {
      const k = rng.pick([100, 50, 10]);
      return { t: `1個のさいころを投げて、出た目の ${k}倍の金額(円)をもらえるゲームがあります。もらえる金額の期待値を求めましょう。`, v: Q(k * 21, 6), unit: "円" };
    },
    coin: (rng) => {
      const n = rng.int(2, 4), k = rng.pick([100, 50]);
      const all = coins(n), e = Q(all.reduce((a, c) => a + c.reduce((u, v) => u + v, 0) * k, 0), all.length);
      return { t: `${n}枚の硬貨を同時に投げて、表が出た枚数1枚につき ${k}円もらえるとき、もらえる金額の期待値を求めましょう。`, v: e, unit: "円" };
    },
    lottery: (rng) => {
      const N = rng.pick([50, 100]), a = rng.int(1, 3), b = rng.int(3, 8), c = rng.int(10, 20), pa = rng.pick([1000, 2000, 5000]), pb = rng.pick([300, 500]), pc = rng.pick([50, 100]);
      const e = Q(a * pa + b * pb + c * pc, N);
      return { t: `${N}本のくじの中に、${pa}円が当たるくじが ${a}本、${pb}円が ${b}本、${pc}円が ${c}本あり、残りははずれです。このくじを1本引くときにもらえる金額の期待値を求めましょう。`, v: e, unit: "円" };
    },
    balls: (rng) => {
      const r = rng.int(2, 4), w = rng.int(2, 4), n = r + w, sets = subsets(n, 2);
      const e = Q(sets.reduce((a, s) => a + s.filter((x) => x < r).length, 0), sets.length);
      return { t: `赤玉 ${r}個、白玉 ${w}個が入った袋から同時に2個取り出すとき、取り出す赤玉の個数の期待値を求めましょう。`, v: e, unit: "個" };
    }
  };
  const expect = gen("kA.expect", null, lv({ types: ["die", "coin"] }, { types: ["coin", "lottery", "balls"] }, { types: ["lottery", "balls", "coin"] }), (rng, type) => {
    const r = EXP[type](rng);
    return { text: r.t, ans: `${num(r.v)}${r.unit}`, softKey: type, meta: { v: r.v }, ws: { type: "lines", labels: ["答え"] }, work: 45 };
  }, (pr) => near(evalH(pr.answer.display.replace(/[円個]$/, "")), qv(pr.meta.v)) ? null : "期待値が合わない");
  H["kA.prob"] = "起こりうる場合がどれも同様に確からしいとき、確率＝[[f:その事象の場合の数/全体の場合の数]]。「少なくとも」は余事象 1－P([[bar:A]]) を使います。反復試行は [[_n]]C[[_r]]p[[^r]](1－p)[[^n－r]]。";
  H["kA.cond"] = "条件付き確率 P[[_A]](B)＝[[f:P(A∩B)/P(A)]]。乗法定理 P(A∩B)＝P(A)P[[_A]](B)。";
  H["kA.expect"] = "期待値＝(値)×(その値をとる確率)の和です。";

  K.kA = { H, subsets, dice, coins };
  return [setCount, permCalc, permWord, combWord, probWord, condWord, expect];
})();
