
  // ============================================================
  // 7 データの活用
  // ============================================================
  const HIST = THEMES5.filter((t) => t.hist);
  const STAT_KIND = { range: "範囲", median: "中央値", mean: "平均値", mode: "最頻値" };
  const stats = {
    id: "c1.stats",
    instruction: R("次のデータについて、〔　〕の中の値を求めましょう。"),
    defaults: { kinds: ["range", "median", "mean", "mode"], n: [7, 9], meanPlaces: 0 },
    levels: lv({ kinds: ["range", "median", "mean", "mode"], n: [7, 9], meanPlaces: 0 }, { kinds: ["range", "median", "mean", "mode"], n: [8, 10], meanPlaces: 1 }, { kinds: ["range", "median", "mean"], n: [10, 12], meanPlaces: 1 }),
    generate(rng, p, ctx) {
      const kind = ctx && Number.isInteger(ctx.index) ? p.kinds[ctx.index % p.kinds.length] : rng.pick(p.kinds);
      for (let t = 0; t < 500; t++) {
        const th = rng.pick(THEMES5);
        const [lo, hi] = th.range, n = rng.int(p.n[0], p.n[1]);
        const vals = Array.from({ length: n }, () => bell(rng, lo, hi, th.center, Math.ceil((hi - lo) / 2)));
        if (new Set(vals).size < 3) continue;
        let ans;
        if (kind === "range") ans = String(Math.max(...vals) - Math.min(...vals));
        else if (kind === "median") ans = medianText(vals);
        else if (kind === "mean") ans = meanText(vals, p.meanPlaces);
        else {
          const m = modeOf(vals);
          ans = m === null ? null : String(m);
        }
        if (ans === null) continue;
        return { key: `st:${kind}:${vals}`, softKey: th.id, text: `〔${R(STAT_KIND[kind])}〕　${vals.join("、")}(${th.unit})`, wide: true, answer: { display: `${ans}${th.unit}` }, workspace: { type: "none" }, meta: { kind, vals, ans } };
      }
      throw new Error("代表値の問題が作れない");
    },
    verify(pr) {
      const { kind, vals, ans } = pr.meta, s = vals.slice().sort((a, b) => a - b), n = s.length;
      if (kind === "range") return Number(ans) === s[n - 1] - s[0] ? null : "範囲";
      if (kind === "median") return Math.abs(Number(ans) - (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2)) < 1e-9 ? null : "中央値";
      if (kind === "mean") return Math.abs(Number(ans) - s.reduce((a, b) => a + b, 0) / n) < 1e-9 ? null : "平均値";
      const cnt = (v) => s.filter((x) => x === v).length, top = Math.max(...s.map(cnt));
      return cnt(Number(ans)) === top && new Set(s.filter((v) => cnt(v) === top)).size === 1 ? null : "最頻値";
    }
  };

  // 度数分布のデータ(各階級の度数)をつくる
  function makeFreq(rng, th, n) {
    const { w, from, k } = th.hist;
    for (let t = 0; t < 400; t++) {
      const vals = Array.from({ length: n }, () => bell(rng, Math.max(from, th.range[0]), Math.min(from + w * k - 1, th.range[1]), th.center, Math.ceil(w * k / 2)));
      const f = Array(k).fill(0);
      vals.forEach((v) => f[Math.floor((v - from) / w)]++);
      const mx = Math.max(...f);
      if (f.filter((x) => x === mx).length !== 1 || mx > 12) continue;
      if (f.filter((x) => x === 0).length > 1 || f.slice(1, -1).includes(0)) continue;
      // 中央値が入る階級が1つに決まるように
      const s = vals.slice().sort((a, b) => a - b);
      const c1 = Math.floor((s[Math.floor((n - 1) / 2)] - from) / w), c2 = Math.floor((s[Math.floor(n / 2)] - from) / w);
      if (c1 !== c2) continue;
      return { vals, f, modeCls: f.indexOf(mx), medCls: c1 };
    }
    return null;
  }
  const fix2 = (v) => (Math.round(v * 100) / 100).toFixed(2);
  const clsText = (th, i, unit) => {
    const { w, from } = th.hist;
    return unit ? R(`${from + i * w}${th.unit}以上${from + (i + 1) * w}${th.unit}未満`) : R(`${from + i * w}以上～${from + (i + 1) * w}未満`);
  };
  const clsValue = (th, i) => {
    const v = th.hist.from + (i + 0.5) * th.hist.w;
    return Number.isInteger(v) ? String(v) : v.toFixed(1);
  };
  const freqTable = {
    id: "c1.freqTable",
    instruction: null,
    defaults: { Ns: [20], hideF: 0, cumRel: false, askMed: false },
    levels: lv({ Ns: [20, 25], hideF: 0, cumRel: false, askMed: false }, { Ns: [20, 25, 50], hideF: 1, cumRel: false, askMed: true }, { Ns: [25, 50], hideF: 1, cumRel: true, askMed: true }),
    generate(rng, p) {
      for (let t = 0; t < 200; t++) {
        const th = rng.pick(HIST), n = rng.pick(p.Ns);
        const d = makeFreq(rng, th, n);
        if (!d) continue;
        const { f } = d, k = f.length;
        const cum = f.map((_, i) => f.slice(0, i + 1).reduce((a, b) => a + b, 0));
        const head = [R(`階級（${th.unit}）`), R("度数（人）"), R("相対度数"), R("累積度数（人）"), ...p.cumRel ? [R("累積相対度数")] : []];
        const full = f.map((x, i) => [clsText(th, i), String(x), fix2(x / n), String(cum[i]), ...p.cumRel ? [fix2(cum[i] / n)] : []]);
        full.push([R("合計"), String(n), "1.00", "", ...p.cumRel ? [""] : []]);
        const rows = full.map((r) => r.slice());
        const cells = [];
        for (let i = 0; i < k; i++) for (let j = 2; j < head.length; j++) cells.push([i, j]);
        const hideN = p.cumRel ? 6 : 4;
        for (const [i, j] of rng.shuffle(cells).slice(0, hideN)) rows[i][j] = "";
        if (p.hideF) {
          const i = rng.int(0, k - 1);
          rows[i][1] = "";
          rows[i][3] = String(cum[i]);
        }
        const qs2 = [R("表のあいているところに数を入れましょう。"), R("最頻値を求めましょう。")];
        const ans = [R("表のとおり"), `${clsValue(th, d.modeCls)}${th.unit}`];
        if (p.askMed) {
          qs2.push(R("中央値がふくまれる階級を答えましょう。"));
          ans.push(clsText(th, d.medCls, true));
        }
        return {
          key: `ft:${th.id}:${f}`,
          softKey: th.id,
          text: `${R(`下の度数分布表は、ある中学校の1年生${n}人の`)}${th.title}${R("をまとめたものです。")}[[br]]${qs2.map((q, i) => `(${i + 1}) ${q}`).join("[[br]]")}`,
          figure: { type: "table", head, rows },
          answer: { display: ans.map((a, i) => `(${i + 1}) ${a}`).join("　"), figure: { type: "table", head, rows: full } },
          workspace: { type: "lines", labels: qs2.slice(1).map((_, i) => `(${i + 2})`) },
          meta: { f, n, cum }
        };
      }
      throw new Error("度数分布表の問題が作れない");
    },
    verify(pr) {
      const { f, n, cum } = pr.meta;
      if (f.reduce((a, b) => a + b, 0) !== n) return "度数の合計";
      if (cum[cum.length - 1] !== n) return "累積度数";
      const blanks = pr.figure.rows.flat().filter((c) => c === "").length;
      return blanks >= 4 ? null : "あいているところが少ない";
    }
  };

  function histFig(th, f, unit) {
    const { w, from } = th.hist, k = f.length, bw2 = 12, mx = Math.max(...f), top = mx + (mx % 2 ? 1 : 2);
    const hu = Math.min(4, 46 / top), ML = 14, MT = 8, x0 = ML, yb = MT + top * hu, items = [];
    const step = top > 10 ? 2 : 1;
    for (let v = 0; v <= top; v += step) {
      items.push(L_(x0, yb - v * hu, x0 + k * bw2 + 4, yb - v * hu, { w: v ? 0.15 : 0.5, color: v ? "#999" : void 0 }));
      items.push(T_(x0 - 1.6, yb - v * hu + 1.2, String(v), 3.2, { anchor: "end" }));
    }
    f.forEach((c, i) => c && items.push({ t: "poly", pts: [[x0 + i * bw2, yb], [x0 + i * bw2, yb - c * hu], [x0 + (i + 1) * bw2, yb - c * hu], [x0 + (i + 1) * bw2, yb]], w: 0.5, fill: "light", bar: i, val: c }));
    for (let i = 0; i <= k; i++) items.push(T_(x0 + i * bw2, yb + 4.6, String(from + i * w), 3.2));
    items.push(L_(x0, yb, x0, MT - 3, { w: 0.5 }), T_(x0 - 1, MT - 4.4, R("（人）"), 3.2));
    items.push(T_(x0 + k * bw2 + 8, yb + 4.6, `（${unit}）`, 3.2, { anchor: "start" }));
    return draw(x0 + k * bw2 + 22, yb + 9, items, { meta: { hu, bw2, yb } });
  }
  const histRead = {
    id: "c1.histRead",
    instruction: null,
    defaults: { Ns: [20, 25], askOver: false, askRel: false },
    levels: lv({ Ns: [20, 25, 30], askOver: false, askRel: false }, { Ns: [20, 25, 30, 35], askOver: true, askRel: false }, { Ns: [20, 25, 50], askOver: true, askRel: true }),
    generate(rng, p) {
      for (let t = 0; t < 200; t++) {
        const th = rng.pick(HIST), n = rng.pick(p.Ns), d = makeFreq(rng, th, n);
        if (!d) continue;
        const { f } = d, k = f.length, { w, from } = th.hist;
        const qs2 = [R("階級の幅は何") + th.unit + R("ですか。"), R("度数の合計は何人ですか。"), R("最頻値を求めましょう。")];
        const ans = [`${w}${th.unit}`, `${n}${R("人")}`, `${clsValue(th, d.modeCls)}${th.unit}`];
        const meta = { f, n };
        if (p.askOver) {
          const c = rng.int(2, k - 2), over = f.slice(c).reduce((a, b) => a + b, 0);
          qs2.push(R(`${from + c * w}`) + th.unit + R("以上の人は何人ですか。"));
          ans.push(`${over}${R("人")}`);
          Object.assign(meta, { c, over });
        }
        if (p.askRel) {
          const c = rng.int(0, k - 1);
          if (!f[c]) continue;
          qs2.push(`${clsText(th, c, true)}${R("の階級の相対度数を求めましょう。")}`);
          ans.push(fix2(f[c] / n));
        }
        return {
          key: `hr:${th.id}:${f}`,
          softKey: th.id,
          text: `${R(`下のヒストグラムは、ある中学校の1年生の`)}${th.title}${R("を調べた結果です。")}[[br]]${qs2.map((q, i) => `(${i + 1}) ${q}`).join("[[br]]")}`,
          figure: histFig(th, f, th.unit),
          answer: { display: ans.map((a, i) => `(${i + 1}) ${a}`).join("　") },
          workspace: { type: "lines", labels: qs2.map((_, i) => `(${i + 1})`) },
          meta
        };
      }
      throw new Error("ヒストグラムの問題が作れない");
    },
    verify(pr) {
      const bars = pr.figure.items.filter((it) => it.bar !== void 0);
      const { hu, yb } = pr.figure.meta;
      for (const b of bars) if (Math.abs((yb - b.pts[1][1]) / hu - pr.meta.f[b.bar]) > 1e-6) return "棒の高さ";
      return bars.reduce((a, b) => a + b.val, 0) === pr.meta.n ? null : "合計が合わない";
    }
  };

  const PROB_THEMES = [
    { what: "ペットボトルのキャップ", ev: "上向きになった", ev2: "上向きになる", p: [0.3, 0.45] },
    { what: "画びょう", ev: "針が上を向いた", ev2: "針が上を向く", p: [0.55, 0.7] },
    { what: "紙コップ", ev: "横向きになった", ev2: "横向きになる", p: [0.6, 0.75] }
  ];
  Object.assign(RUBY, { 向いた: "{向|む}いた", 向く: "{向|む}く", 横向き: "{横向|よこむ}き", 上を: "{上|うえ}を", 考えられますか: "{考|かんが}えられますか" });
  const probability = {
    id: "c1.probability",
    instruction: null,
    defaults: { askTimes: false },
    levels: lv({ askTimes: false }, { askTimes: false }, { askTimes: true }),
    generate(rng, p) {
      const th = rng.pick(PROB_THEMES), pr = th.p[0] + (th.p[1] - th.p[0]) * rng.next();
      const Ns = [100, 200, 500, 1000, 2000];
      const cs = [];
      let prev = 0, prevN = 0;
      for (const N of Ns) {
        const dN = N - prevN, g = (rng.next() + rng.next() + rng.next() - 1.5) * 2;
        const c = prev + Math.max(0, Math.min(dN, Math.round(dN * pr + g * Math.sqrt(dN * pr * (1 - pr)))));
        cs.push(c);
        prev = c;
        prevN = N;
      }
      const rel = cs.map((c, i) => fix2(c / Ns[i]));
      const est = rel[rel.length - 1];
      const head = [R("投げた回数（回）"), ...Ns.map(String)];
      const row1 = [R(`${th.ev}回数（回）`), ...cs.map(String)];
      const blank = [R("相対度数"), ...Ns.map(() => "")];
      const full = [R("相対度数"), ...rel];
      const qs2 = [R("相対度数を、小数第3位を四捨五入して求め、表に書きましょう。"), R(`この${th.what}が${th.ev2}確率は、およそいくつと考えられますか。小数第2位までの数で答えましょう。`)];
      const ans = [R("表のとおり"), est];
      if (p.askTimes) {
        const T = rng.pick([3000, 4000, 5000]);
        qs2.push(R(`この${th.what}を${T}回投げると、${th.ev2}のはおよそ何回と考えられますか。`).replace("{投|な}げると", "{投|な}げると"));
        ans.push(`${Math.round(Number(est) * T)}${R("回")}`);
      }
      return {
        key: `pb:${th.what}:${cs}`,
        softKey: th.what,
        text: `${R(`下の表は、${th.what}を投げる実験をした結果です。`)}[[br]]${qs2.map((q, i) => `(${i + 1}) ${q}`).join("[[br]]")}`,
        figure: { type: "table", head, rows: [row1, blank] },
        answer: { display: ans.map((a, i) => `(${i + 1}) ${a}`).join("　"), figure: { type: "table", head, rows: [row1, full] } },
        workspace: { type: "lines", labels: qs2.slice(1).map((_, i) => `(${i + 2})`) },
        meta: { Ns, cs, rel }
      };
    },
    verify(pr) {
      const { Ns, cs, rel } = pr.meta;
      for (let i = 0; i < Ns.length; i++) {
        if (cs[i] > Ns[i] || i && cs[i] < cs[i - 1]) return "回数がおかしい";
        if (Math.abs(Number(rel[i]) - cs[i] / Ns[i]) > 0.005 + 1e-9) return "相対度数";
      }
      return null;
    }
  };

  // ヒント(「ヒントをつける」のとき)
  Object.assign(RUBY, { 累乗: "るいじょう", 指数: "しすう", 符号: "ふごう", 偶数: "ぐうすう", 奇数: "きすう", 一方: "いっぽう", 性質: "せいしつ", 確かめ: "{確|たし}かめ", 変えて: "{変|か}えて", 変わります: "{変|か}わります", 加法: "かほう", 減法: "げんぽう", 乗法: "じょうほう", 除法: "じょほう", 順: "じゅん", 順に: "{順|じゅん}に", 注意: "ちゅうい", 省き: "{省|はぶ}き", 代入: "だいにゅう", 分配法則: "ぶんぱいほうそく", 単位: "たんい", 左辺: "さへん", 右辺: "うへん", 両辺: "りょうへん", 集め: "{集|あつ}め", 外側: "そとがわ", 内側: "うちがわ", 一定: "いってい", 左右: "さゆう", 上下: "じょうげ", 増える: "{増|ふ}える", 読み: "{読|よ}み", 移して: "{移|うつ}して", 消さずに: "{消|け}さずに", 残して: "{残|のこ}して", 柱体: "ちゅうたい", 錐体: "すいたい", 最大値: "さいだいち", 最小値: "さいしょうち", 真ん中: "{真|ま}ん{中|なか}", 並べた: "{並|なら}べた", 最初: "さいしょ", 近づき: "{近|ちか}づき", 使い: "{使|つか}い", 書き: "{書|か}き", 移項する: "{移項|いこう}する", 形: "かたち", 増えると: "{増|ふ}えると", 数の項: "{数|かず}の{項|こう}", 長方形: "ちょうほうけい", 直角三角形: "ちょっかくさんかくけい", 半円: "はんえん", 表します: "{表|あらわ}します", 求めます: "{求|もと}めます", 解きます: "{解|と}きます", 決め: "{決|き}め", 小さく: "{小|ちい}さく", 考えましょう: "{考|かんが}えましょう", 考えます: "{考|かんが}えます", 目もり: "{目|め}もり", 算: "ざん", 問題: "もんだい", 結びます: "{結|むす}びます", 交わった: "{交|まじ}わった", 交わらない: "{交|まじ}わらない", 多く: "{多|おお}く" });
  const H = {
    "c1.signWord": "反対の性質をもつ量は、一方を正の数、もう一方を負の数で表します。",
    "c1.compare": "数直線で右にある数ほど大きくなります。負の数は、絶対値が大きいほど小さくなります。",
    "c1.absValue": "絶対値は、数直線上で0からその数までの距離です。符号をとった数と考えましょう。",
    "c1.numLine": "0より右が正の数、左が負の数です。1目もりがいくつかを確かめましょう。",
    "c1.addSub": "ひき算は、ひく数の符号を変えてたし算になおします。同じ符号どうしは絶対値の和、ちがう符号どうしは絶対値の差に、絶対値の大きいほうの符号をつけます。",
    "c1.mulDiv": "負の数が偶数個なら＋、奇数個なら－になります。(－3)²＝9、－3²＝－9 のちがいに注意しましょう。",
    "c1.fourOps": "累乗 → かっこの中 → 乗法・除法 → 加法・減法 の順に計算します。",
    "c1.primeFactor": "小さい素数(2，3，5，7…)で順にわっていきます。同じ数の積は、累乗の指数を使って表します。",
    "c1.avgDiff": "平均は「基準＋差の平均」で求められます。差の平均＝差の合計÷人数です。",
    "c1.notation": "×は省き、数は文字の前に書きます。同じ文字の積は累乗の指数を使い、÷は分数の形で書きます。",
    "c1.exprValue": "負の数を代入するときは、かっこをつけて代入しましょう。",
    "c1.linear": "文字の項どうし、数の項どうしをまとめます。かっこは分配法則ではずしましょう。",
    "c1.exprWrite": "ことばの式をつくってから、文字や数をあてはめましょう。単位もわすれずに。",
    "c1.relation": "「＝」は等しい、「＜」「＞」は大小、「≦」「≧」は以下・以上を表します。",
    "c1.eqSolve": "移項すると符号が変わります。文字の項を左辺、数の項を右辺に集めましょう。小数や分数は、両辺を何倍かして整数にしてから解きます。",
    "c1.solutionCheck": "xに数を代入して、左辺と右辺が等しくなるかを確かめましょう。",
    "c1.ratioEq": "a：b＝c：d ならば ad＝bc(外側の積＝内側の積)です。",
    "c1.eqWord": "求めたいものをxとして、等しい関係にある2つの数量を式に表しましょう。答えが問題に合うかも確かめます。",
    "c1.propFormula": "比例は y＝ax、反比例は y＝[[f:a/x]]。わかっている x，y の値を代入して a を求めます。",
    "c1.propTable": "比例では y÷x、反比例では x×y が一定(比例定数)になります。",
    "c1.coord": "(x座標, y座標)の順に書きます。x座標は左右、y座標は上下の位置です。",
    "c1.graphEq": "比例のグラフは原点を通る直線です。x が1増えると y がいくつ増えるかを読みましょう。",
    "c1.propWord": "x が2倍、3倍…になると y も2倍、3倍…になれば比例、[[f:1/2]]倍、[[f:1/3]]倍…になれば反比例です。",
    "c1.planeTerms": "直線・線分・半直線のちがいや、記号 ⊥(垂直)、∥(平行)を確かめましょう。",
    "c1.move": "対応する点を1つずつ移してから結びます。回転移動では、中心からの距離が等しくなります。",
    "c1.construction": "コンパスで等しい長さをとり、交わった点を結びます。かいた線は消さずに残しておきましょう。",
    "c1.sector": "弧の長さ＝2πr×[[f:a/360]]、面積＝πr²×[[f:a/360]] です(aは中心角)。",
    "c1.polyhedron": "n角柱は 面 n＋2、辺 3n、頂点 2n。n角錐は 面 n＋1、辺 2n、頂点 n＋1 です。",
    "c1.cuboidRelation": "ねじれの位置は、平行でなく、交わらない2つの直線の位置関係です。",
    "c1.rotationSolid": "長方形は円柱、直角三角形は円錐、半円は球になります。",
    "c1.solidVol": "角柱・円柱は 底面積×高さ、角錐・円錐は [[f:1/3]]×底面積×高さ、球は [[f:4/3]]πr³ です。",
    "c1.solidSurf": "表面積＝底面積の合計＋側面積。円錐の側面積は π×半径×母線 です。",
    "c1.stats": "範囲＝最大値－最小値。中央値は、小さい順に並べたときの真ん中の値です。",
    "c1.freqTable": "相対度数＝その階級の度数÷度数の合計。累積度数は、最初の階級からその階級までの度数の合計です。",
    "c1.histRead": "最頻値は、度数が最も多い階級の階級値(階級の真ん中の値)です。",
    "c1.probability": "投げる回数を多くすると、相対度数はある値に近づきます。その値を確率と考えます。"
  };
  for (const [k, v] of Object.entries(H)) chu1Hints[k] = R(v);
  Object.assign(chuLib, { RED, RUBY, R, fun, hon, gcd, Q, qa, qs, qm, qd, qneg, qeq, qpow, qabs, isInt, qv, decPl, decStr, absTex, num, sgn, par, SUP, SUPR, evalQ, sameExpr, V, coefTex, lin, linPlain, poly, nz, lv, typeOf, ALPHA, MARU, L_, T_, arrowHead, numberLine, plane, draw, I, I2, F, D, xs, ys, propTex, invTex, rad, arc, ang, circX, ptLabel, fitBox, shiftItem, piTex, pickR, HIST, makeFreq, clsText, clsValue, fix2, ptMark, coordTex, hints: chu1Hints });
  return [signWord, compare, absValue, numLine, addSub, mulDiv, fourOps, primeFactor, avgDiff, notation, exprValue, linear, exprWrite, relation, eqSolve, solutionCheck, ratioEq, eqWord, propFormula, propTable, coord, graphEq, propWord, planeTerms, move, construction, sector, polyhedron, cuboidRelation, rotationSolid, solidVol, solidSurf, stats, freqTable, histRead, probability];
})();
var chu1Grade = (() => {
  const T = (label, generator, kinds, o = {}) => ({ label, generator, kinds, ...o });
  const D = ["drill", "test"], W = ["word", "test"], F = ["figure", "test"];
  const units = [
    ["c1-01", "正の数・負の数", "{正|せい}の{数|すう}・{負|ふ}の{数|すう}", "数と式", [T("正の数・負の数で表す", "c1.signWord", D), T("数の大小", "c1.compare", D), T("絶対値", "c1.absValue", D), T("数直線", "c1.numLine", F), T("加法・減法", "c1.addSub", D, { weight: 2 }), T("乗法・除法", "c1.mulDiv", D, { weight: 2 }), T("四則の混じった計算", "c1.fourOps", D, { weight: 2 }), T("素因数分解", "c1.primeFactor", D), T("基準との差と平均", "c1.avgDiff", W)], { drill: [10, 4], figure: [2, 15], word: [2, 15] }],
    ["c1-02", "文字と式", "{文字|もじ}と{式|しき}", "数と式", [T("文字式の表し方", "c1.notation", D), T("式の値", "c1.exprValue", D), T("一次式の計算", "c1.linear", D, { weight: 2 }), T("数量を文字式で表す", "c1.exprWrite", W), T("関係を等式・不等式で表す", "c1.relation", W)], { drill: [13, 4], word: [6, 8] }],
    ["c1-03", "一次方程式", "{一次方程式|いちじほうていしき}", "数と式", [T("方程式を解く", "c1.eqSolve", D, { weight: 3 }), T("方程式の解", "c1.solutionCheck", D), T("比例式", "c1.ratioEq", D), T("方程式の文章題", "c1.eqWord", W)], { drill: [12, 5], word: [4, 10] }],
    ["c1-04", "比例と反比例", "{比例|ひれい}と{反比例|はんぴれい}", "関数", [T("比例・反比例の式", "c1.propFormula", W), T("比例・反比例の表", "c1.propTable", F), T("座標", "c1.coord", F), T("比例・反比例のグラフ", "c1.graphEq", F), T("比例・反比例の利用", "c1.propWord", W)], { word: [5, 10], figure: [5, 10] }],
    ["c1-05", "平面図形", "{平面図形|へいめんずけい}", "図形", [T("直線と角・円の用語", "c1.planeTerms", W), T("図形の移動", "c1.move", F), T("基本の作図", "c1.construction", F), T("おうぎ形の弧と面積", "c1.sector", D)], { drill: [6, 5], word: [4, 5], figure: [5, 10] }],
    ["c1-06", "空間図形", "{空間図形|くうかんずけい}", "図形", [T("いろいろな立体", "c1.polyhedron", D), T("直線や平面の位置関係", "c1.cuboidRelation", F), T("回転体", "c1.rotationSolid", F), T("立体の体積", "c1.solidVol", D), T("立体の表面積", "c1.solidSurf", D)], { drill: [12, 5], figure: [4, 10] }],
    ["c1-07", "データの活用", "データの{活用|かつよう}", "データの活用", [T("代表値と範囲", "c1.stats", W), T("度数分布表", "c1.freqTable", F), T("ヒストグラム", "c1.histRead", F), T("相対度数と確率", "c1.probability", F)], { word: [4, 10], figure: [3, 20] }]
  ];
  return {
    grade: 7,
    note: "中学1年。学習指導要領(平成29年告示)の内容の順。問題文はすべてこのファイルで作ったもの。",
    units: units.map(([id, name, rubyName, domain, topics, testPlan], i) => ({ id, order: i + 1, name, rubyName, domain, topics, testPlan }))
  };
})();
