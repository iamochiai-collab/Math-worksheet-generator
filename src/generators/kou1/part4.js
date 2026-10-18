  // ============================================================
  // 8 データの分析
  // ============================================================
var kou1d = (() => {
  const K = kouLib;
  const { Q, qv, num, gcd, lv, nz, X, V, evalH, near, rootTex, surdTex, gen, redo, draw, T_, L_, fnum } = K;
  const H = K.k1.H, surdAns = K.k1.surdAns;
  const med = (a) => {
    const s = a.slice().sort((u, v) => u - v), n = s.length;
    return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
  };
  const quarts = (a) => {
    const s = a.slice().sort((u, v) => u - v), n = s.length, h = Math.floor(n / 2);
    return [med(s.slice(0, h)), med(s), med(s.slice(n - h))];
  };
  const dec = (v) => fnum(v, 2);
  const quart = gen("k1.quart", "次のデータについて、問いに答えましょう。", lv({ types: ["q", "q"], sorted: true }, { types: ["q", "q", "out"], sorted: false }, { types: ["q", "out", "out"], sorted: false }), (rng, type, p) => {
    const n = rng.int(8, 12), lo = rng.pick([0, 10, 20]);
    const xs = Array.from({ length: n }, () => lo + rng.int(0, 30));
    if (type === "out") xs[rng.int(0, n - 1)] = rng.chance(0.5) ? lo + rng.int(55, 70) : Math.max(0, lo - rng.int(25, 35)) + 0;
    const [q1, q2, q3] = quarts(xs), iqr = q3 - q1;
    const shown = p.sorted ? xs.slice().sort((u, v) => u - v) : xs;
    if (type === "out") {
      const L = q1 - 1.5 * iqr, U = q3 + 1.5 * iqr, out = xs.filter((x) => x < L || x > U).sort((u, v) => u - v);
      if (!out.length || iqr === 0) return null;
      return { text: `${shown.join(", ")}[[br]]第1四分位数 [[v:Q]][[_1]]、第3四分位数 [[v:Q]][[_3]] を求め、外れ値(Q[[_1]]－1.5×(Q[[_3]]－Q[[_1]]) 以下、または Q[[_3]]＋1.5×(Q[[_3]]－Q[[_1]]) 以上の値)をすべて答えましょう。`.replace(/Q\[\[_/g, "[[v:Q]][[_"), ans: `Q[[_1]]＝${dec(q1)}，Q[[_3]]＝${dec(q3)}，外れ値 ${out.join(", ")}`.replace(/Q\[\[_/g, "[[v:Q]][[_"), wide: true, meta: { xs, out } };
    }
    return { text: `${shown.join(", ")}[[br]]第1四分位数、中央値、第3四分位数、四分位範囲を求めましょう。`, ans: `第1四分位数 ${dec(q1)}，中央値 ${dec(q2)}，第3四分位数 ${dec(q3)}，四分位範囲 ${dec(iqr)}`, wide: true, meta: { xs } };
  }, (pr) => {
    const m = pr.meta, [q1, q2, q3] = quarts(m.xs);
    if (m.out) {
      const iqr = q3 - q1, out = m.xs.filter((x) => x <= q1 - 1.5 * iqr || x >= q3 + 1.5 * iqr).sort((u, v) => u - v);
      return out.join() === m.out.join() ? null : "外れ値が合わない";
    }
    return pr.answer.display === `第1四分位数 ${dec(q1)}，中央値 ${dec(q2)}，第3四分位数 ${dec(q3)}，四分位範囲 ${dec(q3 - q1)}` ? null : "四分位数が合わない";
  }, { work: 26 });

  // 分散と標準偏差
  const variance = gen("k1.variance", "次の問いに答えましょう。", lv({ types: ["data", "data"] }, { types: ["data", "formula"] }, { types: ["data", "formula", "trans"] }), (rng, type) => {
    if (type === "formula") {
      const m = rng.int(3, 12), v = rng.pick([4, 9, 16, 2, 5, 25]);
      return { text: `変量 [[v:x]] のデータの平均値が ${m}、[[v:x]]² のデータの平均値が ${m * m + v} であるとき、[[v:x]] の分散と標準偏差`, ans: `分散 ${v}，標準偏差 ${rootTex(v)}`, meta: { v } };
    }
    if (type === "trans") {
      const m = rng.int(3, 15), v = rng.pick([4, 9, 16, 25]), a = nz(rng, -3, 3), b = rng.int(-10, 10);
      const yT = `${a === 1 ? "" : a === -1 ? "－" : num(Q(a))}[[v:x]]${b ? (b < 0 ? "－" : "＋") + Math.abs(b) : ""}`;
      return { text: `変量 [[v:x]] のデータの平均値が ${m}、分散が ${v} であるとき、変量 [[v:y]]＝${yT} のデータの平均値、分散、標準偏差`, ans: `平均値 ${num(Q(a * m + b))}，分散 ${a * a * v}，標準偏差 ${Math.abs(a) * Math.sqrt(v)}`, meta: { v: a * a * v } };
    }
    // 偏差が整数になるデータ
    const n = rng.pick([5, 5, 6]), m = rng.int(4, 16);
    const dev = Array.from({ length: n - 1 }, () => rng.int(-5, 5));
    dev.push(-dev.reduce((a, b) => a + b, 0));
    if (Math.abs(dev[n - 1]) > 6) return null;
    const ss = dev.reduce((a, d) => a + d * d, 0);
    if (ss % n || !ss) return null;
    const v = ss / n, xs = dev.map((d) => m + d);
    if (xs.some((x) => x < 0)) return null;
    return { text: `データ ${rng.shuffle(xs).join(", ")} の平均値、分散、標準偏差`, ans: `平均値 ${m}，分散 ${v}，標準偏差 ${rootTex(v)}`, wide: true, meta: { xs, v } };
  }, (pr) => {
    const m = pr.meta;
    if (m.xs) {
      const mean = m.xs.reduce((a, b) => a + b, 0) / m.xs.length, v = m.xs.reduce((a, x) => a + (x - mean) ** 2, 0) / m.xs.length;
      return near(v, m.v) && near(evalH(pr.answer.display.split("標準偏差 ")[1]), Math.sqrt(v)) ? null : "分散が合わない";
    }
    return near(evalH(pr.answer.display.split("標準偏差 ")[1]), Math.sqrt(m.v)) ? null : "標準偏差が合わない";
  }, { work: 36 });

  // 相関係数
  const corr = gen("k1.corr", "次の問いに答えましょう。", lv({ types: ["summary"] }, { types: ["summary", "table"] }, { types: ["table", "table", "summary"] }), (rng, type) => {
    if (type === "summary") {
      const sx = rng.int(2, 9), sy = rng.int(2, 9), r = rng.pick([-0.8, -0.6, -0.5, -0.4, -0.2, 0.2, 0.4, 0.5, 0.6, 0.75, 0.8]);
      const c = Math.round(r * sx * sy * 100) / 100;
      if (Math.abs(c * 100 - Math.round(c * 100)) > 1e-9 || Math.abs(c / (sx * sy) - r) > 1e-9 || !Number.isInteger(c * 10)) return null;
      return { text: `2つの変量 [[v:x]]，[[v:y]] の標準偏差がそれぞれ ${sx}，${sy}、共分散が ${fnum(c, 2)} のとき、[[v:x]] と [[v:y]] の相関係数`, ans: fnum(r, 2), meta: { r } };
    }
    // 5組のデータ:偏差を整数にして、相関係数を小数第2位まで
    for (let t = 0; t < 50; t++) {
      const n = 5, mx = rng.int(3, 9), my = rng.int(3, 9);
      const dx = [-2, -1, 0, 1, 2], dy0 = rng.shuffle([-2, -1, 0, 1, 2]);
      const sgn = rng.chance(0.5) ? 1 : -1;
      // ほどよく相関があるように一部を並べかえ
      const dy = dx.map((d, i) => sgn * d + (rng.chance(0.4) ? rng.pick([-1, 1]) : 0));
      const sum = dy.reduce((a, b) => a + b, 0);
      if (sum) continue;
      const xs = dx.map((d) => mx + d), ys = dy.map((d) => my + d);
      const sxx = dx.reduce((a, d) => a + d * d, 0), syy = dy.reduce((a, d) => a + d * d, 0), sxy = dx.reduce((a, d, i) => a + d * dy[i], 0);
      if (!syy) continue;
      const r = sxy / Math.sqrt(sxx * syy);
      const rows = [["[[v:x]]", ...xs.map(String)], ["[[v:y]]", ...ys.map(String)]];
      return { text: `右の表の5組のデータについて、[[v:x]] と [[v:y]] の相関係数 [[v:r]] を求めましょう。小数第3位を四捨五入して答えましょう。`, fig: { type: "table", head: ["", "1", "2", "3", "4", "5"], rows }, ans: fnum(Math.round(r * 100) / 100, 2), side: true, key: `cr:${xs}:${ys}`, meta: { xs, ys, r } };
    }
    return null;
  }, (pr) => {
    const m = pr.meta;
    if (m.xs) {
      const mean = (a) => a.reduce((u, v) => u + v, 0) / a.length, ax = mean(m.xs), ay = mean(m.ys);
      const sxy = m.xs.reduce((u, x, i) => u + (x - ax) * (m.ys[i] - ay), 0), sxx = m.xs.reduce((u, x) => u + (x - ax) ** 2, 0), syy = m.ys.reduce((u, y) => u + (y - ay) ** 2, 0);
      return Math.abs(Math.round(sxy / Math.sqrt(sxx * syy) * 100) / 100 - evalH(pr.answer.display)) < 1e-9 ? null : "相関係数が合わない";
    }
    return near(evalH(pr.answer.display), m.r) ? null : "相関係数が合わない";
  }, { work: 36 });

  // 散布図(図)
  const RS = [0.9, 0.5, 0, -0.5, -0.9], RCH = ["ア", "イ", "ウ", "エ", "オ"];
  const scatter = gen("k1.scatter", null, lv({ types: [0.9, -0.9, 0] }, { types: [0.9, 0.5, 0, -0.5, -0.9] }, { types: [0.5, -0.5, 0, 0.9, -0.9] }), (rng, target) => {
    const n = 20;
    for (let t = 0; t < 200; t++) {
      const zx = Array.from({ length: n }, () => rng.int(-100, 100) / 50), e = Array.from({ length: n }, () => rng.int(-100, 100) / 50);
      const zy = zx.map((x, i) => target * x + Math.sqrt(1 - target * target) * e[i]);
      const m = (a) => a.reduce((u, v) => u + v, 0) / a.length, mx = m(zx), my = m(zy);
      const sxy = zx.reduce((u, x, i) => u + (x - mx) * (zy[i] - my), 0), sxx = zx.reduce((u, x) => u + (x - mx) ** 2, 0), syy = zy.reduce((u, y) => u + (y - my) ** 2, 0);
      const r = sxy / Math.sqrt(sxx * syy);
      if (Math.abs(r - target) > 0.06) continue;
      // 図:0〜100 の点数
      const toS = (a) => {
        const lo = Math.min(...a), hi = Math.max(...a);
        return a.map((v) => 10 + (v - lo) / (hi - lo) * 80);
      };
      const X0 = toS(zx), Y0 = toS(zy), W = 60, Hh = 50, ox = 12, oy = 6;
      const items = [L_(ox, oy, ox, oy + Hh, { w: 0.4 }), L_(ox, oy + Hh, ox + W, oy + Hh, { w: 0.4 })];
      for (let v = 0; v <= 100; v += 20) {
        items.push(L_(ox + v / 100 * W, oy + Hh, ox + v / 100 * W, oy + Hh + 1.2, { w: 0.3 }), T_(ox + v / 100 * W, oy + Hh + 4.4, String(v), 2.6));
        items.push(L_(ox - 1.2, oy + Hh - v / 100 * Hh, ox, oy + Hh - v / 100 * Hh, { w: 0.3 }), T_(ox - 2, oy + Hh - v / 100 * Hh + 0.9, String(v), 2.6, { anchor: "end" }));
      }
      X0.forEach((x, i) => items.push({ t: "dot", x: ox + x / 100 * W, y: oy + Hh - Y0[i] / 100 * Hh, r: 0.8 }));
      items.push(T_(ox + W + 1, oy + Hh + 4.4, "[[v:x]]", 3.2, { anchor: "start" }), T_(ox, oy - 2, "[[v:y]]", 3.2));
      const ci = RS.indexOf(target);
      return { text: `右の散布図は、ある20人の2つのテストの点数 [[v:x]]，[[v:y]] を表したものです。[[v:x]] と [[v:y]] の相関係数に最も近いものを、次から選びましょう。[[br]]ア 0.9　イ 0.5　ウ 0　エ －0.5　オ －0.9`, fig: draw(ox + W + 8, oy + Hh + 8, items), ans: RCH[ci], side: true, key: `sc:${zx.slice(0, 4)}:${target}`, softKey: String(target), meta: { r, target } };
    }
    return null;
  }, (pr) => {
    const m = pr.meta;
    // 選んだ値が、図の相関係数に最も近い
    const best = RS.reduce((u, w) => Math.abs(w - m.r) < Math.abs(u - m.r) ? w : u);
    return best === m.target && pr.answer.display === RCH[RS.indexOf(best)] ? null : "相関係数の選択が合わない";
  });

  // 仮説検定の考え方(文章題)
  const binomTable = (n) => {
    const out = [];
    for (let k = 0; k <= n; k++) {
      let c = 1;
      for (let i = 0; i < k; i++) c = c * (n - i) / (i + 1);
      out.push(Math.round(c / 2 ** n * 1000));
    }
    return out;
  };
  const hypTest = gen("k1.hypTest", null, lv({ types: [20] }, { types: [20, 30] }, { types: [30, 20] }), (rng, n) => {
    const tb = binomTable(n), lo = n === 20 ? 12 : 18, k0 = rng.int(n === 20 ? 13 : 19, n === 20 ? 16 : 22);
    const ks = [];
    for (let k = lo; k <= n; k++) ks.push(k);
    const cnt = ks.filter((k) => k >= k0).reduce((a, k) => a + tb[k], 0), pct = cnt / 10;
    const ok = pct < 5;
    const fig = { type: "table", head: ["表の回数", ...ks.map(String)], rows: [["回数", ...ks.map((k) => String(tb[k]))]] };
    const th = rng.pick([["新しいお菓子の味について", "おいしい"], ["新しい制服のデザインについて", "よい"], ["新しいアプリの使いやすさについて", "使いやすい"]]);
    return {
      text: `${th[0]}${n}人に聞いたところ、${k0}人が「${th[1]}」と答えた。この結果から「${th[1]}」と答える人の方が多いと判断してよいか、基準となる確率を 5% として考えましょう。ただし、公正なコインを ${n}回投げて表の出た回数を記録する実験を 1000回行ったところ、表が ${lo}回以上出たときの結果は下の表のようになったとします(${lo}回未満は省略)。`,
      fig,
      ans: `${k0}回以上表が出るのは ${cnt}回で、${fnum(pct, 1)}% ${ok ? "＜" : "≧"} 5%。${ok ? "多いと判断してよい" : "多いとは判断できない"}`,
      key: `ht:${n}:${k0}:${th[1]}`,
      meta: { tb, k0, n, cnt, ok },
      ws: { type: "lines", labels: ["答え"] },
      work: 45
    };
  }, (pr) => {
    const m = pr.meta;
    let c = 0;
    for (let k = m.k0; k <= m.n; k++) c += m.tb[k];
    return c === m.cnt && (c / 10 < 5) === m.ok ? null : "検定の判断が合わない";
  });
  H["k1.quart"] = "データを小さい順に並べ、中央値で前半・後半に分けて、それぞれの中央値を Q₁，Q₃ とします。四分位範囲は Q₃－Q₁。";
  H["k1.variance"] = "分散＝(偏差の2乗の平均)＝(x² の平均)－(x の平均)²。標準偏差は分散の正の平方根。y＝ax＋b なら平均は a倍して b、分散は a² 倍です。";
  H["k1.corr"] = "相関係数 r＝[[f:共分散/(x の標準偏差)×(y の標準偏差)]]。偏差の積の和を、偏差の2乗の和の積の平方根でわっても求められます。";
  H["k1.scatter"] = "右上がりに集まるほど 1 に近く、右下がりに集まるほど －1 に近くなります。";
  H["k1.hypTest"] = "「どちらとも言えない(半々)」と仮定して、その結果以上が起こる割合が基準(5%)より小さいかを調べます。";

  for (const [k, v] of Object.entries(H)) K.hints[k] = X(v);
  return [quart, variance, corr, scatter, hypTest];
})();
kou1.push(...kou1d);

var kou1Grade = (() => {
  const T = (label, generator, kinds, o = {}) => ({ label, generator, kinds, ...o });
  const D = ["drill", "test"], W = ["word", "test"], F = ["figure", "test"];
  const units = [
    ["k1-01", "式の計算", "数と式", [T("整式の加法・減法", "k1.polyCalc", D), T("式の展開", "k1.expand", D, { weight: 2 }), T("因数分解", "k1.factor", D, { weight: 2 })], { drill: [20, 5] }],
    ["k1-02", "実数と一次不等式", "数と式", [T("実数と絶対値", "k1.realNum", D), T("根号をふくむ式の計算", "k1.surd", D, { weight: 2 }), T("式の値", "k1.symm", D), T("一次不等式", "k1.ineq", D, { weight: 2 }), T("絶対値をふくむ方程式・不等式", "k1.absEq", D), T("一次不等式の利用", "k1.ineqWord", W)], { drill: [14, 5], word: [3, 10] }],
    ["k1-03", "集合と命題", "数と式", [T("集合", "k1.setOps", D), T("必要条件と十分条件", "k1.necSuf", D, { weight: 2 }), T("逆・裏・対偶と否定", "k1.contra", D)], { drill: [10, 10] }],
    ["k1-04", "二次関数とグラフ", "二次関数", [T("頂点と軸", "k1.vertex", D, { weight: 2 }), T("二次関数のグラフ", "k1.graph", F), T("最大値・最小値", "k1.maxmin", D, { weight: 2 }), T("二次関数の決定", "k1.determine", D), T("グラフの移動", "k1.move", D), T("最大・最小の利用", "k1.maxWord", W)], { drill: [10, 5], figure: [2, 15], word: [2, 10] }],
    ["k1-05", "二次方程式と二次不等式", "二次関数", [T("二次方程式", "k1.quadEq", D, { weight: 2 }), T("判別式", "k1.discrim", D), T("グラフと x 軸の共有点", "k1.xInter", D), T("二次不等式", "k1.quadIneq", D, { weight: 2 })], { drill: [10, 10] }],
    ["k1-06", "三角比", "図形と計量", [T("直角三角形と三角比", "k1.trigFig", F), T("三角比の値", "k1.trigVal", D, { weight: 2 }), T("三角比の相互関係", "k1.trigRel", D), T("三角比の方程式・不等式", "k1.trigEq", D), T("三角比の利用", "k1.trigWord", W)], { drill: [12, 5], figure: [2, 10], word: [2, 10] }],
    ["k1-07", "図形の計量", "図形と計量", [T("正弦定理", "k1.sineLaw", D), T("余弦定理", "k1.cosLaw", D), T("三角形の面積", "k1.triArea", D), T("図形の計量の利用", "k1.measWord", W)], { drill: [12, 5], word: [4, 10] }],
    ["k1-08", "データの分析", "データの分析", [T("四分位数と外れ値", "k1.quart", D), T("分散と標準偏差", "k1.variance", D), T("相関係数", "k1.corr", D), T("散布図と相関", "k1.scatter", F), T("仮説検定の考え方", "k1.hypTest", W)], { drill: [6, 10], figure: [2, 10], word: [2, 10] }]
  ];
  return {
    grade: 10,
    note: "高校 数学Ⅰ。学習指導要領(平成30年告示)の内容の順。問題文はすべてこのファイルで作ったもの。",
    units: units.map(([id, name, domain, topics, testPlan], i) => ({ id, order: i + 1, name, rubyName: name, domain, topics, testPlan }))
  };
})();
