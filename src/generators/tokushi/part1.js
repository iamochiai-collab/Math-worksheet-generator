// 特別支援学校(知的障害)の算数・数学「段階」用。
// 小学部1段階など、いちばんはじめの段階のための絵のプリント(ある・ない、おなじもの、なかまあつめ、おおきい・ちいさい)。
// つくりは幼児のプリント(yoji)とおなじ:1まいの問題を少なく、絵と字を大きく。答えのページは答えを赤で書きこんだプリント。
var tokushi = (() => {
  const W = 172;
  const RED = "#d7263d", GRAY = "#c2c2c2", INK = "#000";
  const txt = (x, y, s, size, o = {}) => ({ t: "text", x, y, s: String(s), size, halo: false, ...o });
  const ring = (cx, cy, r, color, w = 0.9) => ({ t: "circle", cx, cy, r, w, color, lead: true });
  const panel = (x, y, w, h, r = 4) => ({ ...frame(x, y, w, h, r), w: 0.5 });
  const pic = (kind, cx, cy, s, tag) => icon(kind, cx, cy, s).map((it) => ({ ...it, g: tag, kind }));
  const dot = (x, y) => ({ t: "dot", x, y, r: 1.7 });
  const EX = { basic: { example: true }, normal: { example: true }, challenge: { example: false } };
  const lv = (b, n, c) => ({ basic: { ...EX.basic, ...b }, normal: { ...EX.normal, ...n }, challenge: { ...EX.challenge, ...c } });
  const nameOf = (k) => ICONS[k].name;
  // 問題の図と答えの図をまとめて作る(れいは灰色の答え、答えのページは赤)
  function made(p, ctx, { key, text, h, items, ans, meta }) {
    const example = p.example && ctx && ctx.index === 0;
    const fig = (extra) => ({ type: "draw", w: W + 4, h: h + 3, items: [...items, ...extra], scaleK: 1 });
    return {
      key: (example ? "ex:" : "") + key,
      text,
      figure: fig(example ? ans(GRAY) : []),
      answer: { display: "", figure: fig(ans(RED)) },
      workspace: { type: "none" },
      example,
      meta
    };
  }
  const redRings = (fig) => fig.items.filter((it) => it.t === "circle" && it.color === RED);
  const redLines = (fig) => fig.items.filter((it) => it.t === "line" && it.color === RED);
  const ALL = () => THINGS2.concat(ANIMALS);

  // ===== ある・ない(おさらに ある ほうに ○) =====
  const tAri = {
    id: "t.ari",
    instruction: null,
    defaults: { rows: 2, many: false },
    levels: lv({ rows: 2 }, { rows: 3 }, { rows: 3, many: true }),
    generate(rng, p, ctx) {
      const kinds = rng.shuffle(THINGS2).slice(0, p.rows);
      const RH = 48, items = [], has = [];
      kinds.forEach((k, i) => {
        const y = 2 + i * RH, left = rng.chance(0.5);
        has.push(left ? 0 : 1);
        [0, 1].forEach((side) => {
          const cx = side === 0 ? 50 : 126;
          items.push({ t: "path", d: `M${cx - 30},${y + 30} Q${cx},${y + 40} ${cx + 30},${y + 30} L${cx + 24},${y + 35} Q${cx},${y + 41} ${cx - 24},${y + 35} Z`, w: 0.6, fill: "white", lead: true });
          if ((side === 0) === left) {
            const n = p.many ? rng.int(1, 3) : 1;
            for (let j = 0; j < n; j++) items.push(...pic(k, cx + (j - (n - 1) / 2) * 15, y + 22, n > 1 ? 13 : 17, `${i}:${j}`));
          }
        });
      });
      return made(p, ctx, {
        key: `ta:${kinds.join(",")}:${has.join("")}`,
        text: `${kinds.map(nameOf).join("や ")}が ある おさらに ○を つけましょう。`,
        h: p.rows * RH,
        items,
        ans: (c) => has.map((s, i) => ring(s === 0 ? 50 : 126, 2 + i * RH + 25, 21, c, 1.1)),
        meta: { has, kinds }
      });
    },
    verify(pr) {
      const { has, kinds } = pr.meta;
      const rings = redRings(pr.answer.figure);
      if (rings.length !== has.length) return "○の数が違う";
      for (let i = 0; i < has.length; i++) {
        const side = rings[i].cx < 88 ? 0 : 1;
        const there = pr.figure.items.some((it) => it.kind === kinds[i] && String(it.g).startsWith(`${i}:`));
        if (!there || side !== has[i]) return "○の場所が違う";
      }
      return null;
    }
  };

  // ===== おなじ ものを せんで むすぼう =====
  const tSame = {
    id: "t.same",
    instruction: null,
    defaults: { k: 2 },
    levels: lv({ k: 2 }, { k: 3 }, { k: 4 }),
    generate(rng, p, ctx) {
      const kinds = rng.shuffle(ALL()).slice(0, p.k);
      let right;
      do right = rng.shuffle(kinds.slice());
      while (p.k > 1 && right.every((k, i) => k === kinds[i]));
      const RH = 30, items = [], lDot = [], rDot = [];
      kinds.forEach((k, i) => {
        const y = 2 + i * RH + 12;
        items.push(panel(10, y - 12, 34, 24, 3), ...pic(k, 27, y, 18, `L${i}`), dot(52, y));
        lDot.push([52, y]);
      });
      right.forEach((k, i) => {
        const y = 2 + i * RH + 12;
        items.push(panel(W - 44, y - 12, 34, 24, 3), ...pic(k, W - 27, y, 18, `R${i}`), dot(W - 52, y));
        rDot.push([W - 52, y]);
      });
      return made(p, ctx, {
        key: `ts:${kinds.join(",")}:${right.join(",")}`,
        text: "おなじ ものを せんで むすびましょう。",
        h: p.k * RH,
        items,
        ans: (c) => kinds.map((k, i) => ({ t: "line", x1: lDot[i][0], y1: lDot[i][1], x2: rDot[right.indexOf(k)][0], y2: rDot[right.indexOf(k)][1], w: 1, color: c, lead: true, cap: "round", from: i, to: right.indexOf(k) })),
        meta: { kinds, right }
      });
    },
    verify(pr) {
      const { kinds, right } = pr.meta;
      const lines = redLines(pr.answer.figure);
      if (lines.length !== kinds.length) return "線の数が違う";
      for (const ln of lines) if (kinds[ln.from] !== right[ln.to]) return "ちがう ものを むすんでいる";
      return null;
    }
  };

  // ===== なかまあつめ(おなじ ものに ぜんぶ ○) =====
  const tSort = {
    id: "t.sort",
    instruction: null,
    defaults: { kinds: 2, total: [5, 6], target: [2, 3] },
    levels: lv({ kinds: 2, total: [4, 6], target: [2, 3] }, { kinds: 2, total: [6, 8], target: [2, 4] }, { kinds: 3, total: [8, 10], target: [3, 4] }),
    generate(rng, p, ctx) {
      const kinds = rng.shuffle(ALL()).slice(0, p.kinds);
      const total = rng.int(p.total[0], p.total[1]);
      const nT = Math.min(total - (p.kinds - 1), rng.int(p.target[0], p.target[1]));
      const bag = [...Array(nT).fill(kinds[0])];
      while (bag.length < total) bag.push(kinds[1 + (bag.length % (p.kinds - 1))]);
      const order = rng.shuffle(bag);
      const cols = total > 6 ? 5 : total > 4 ? 3 : 2, rows = Math.ceil(total / cols);
      const CW = Math.min(32, (W - 8) / cols), RH = 28, items = [], pos = [];
      order.forEach((k, i) => {
        const r = Math.floor(i / cols), c = i % cols;
        const cx = (W - cols * CW) / 2 + c * CW + CW / 2 + (r % 2 ? 4 : -4), cy = 2 + r * RH + RH / 2;
        items.push(...pic(k, cx, cy, 17, `${i}`));
        pos.push([cx, cy, k]);
      });
      return made(p, ctx, {
        key: `tso:${order.join(",")}`,
        text: `${nameOf(kinds[0])}に ぜんぶ ○を つけましょう。`,
        h: rows * RH,
        items,
        ans: (c) => pos.filter((q) => q[2] === kinds[0]).map((q) => ring(q[0], q[1], 12, c, 1.1)),
        meta: { target: kinds[0], order }
      });
    },
    verify(pr) {
      const { target, order } = pr.meta;
      const n = order.filter((k) => k === target).length;
      return redRings(pr.answer.figure).length === n && n >= 1 && n < order.length ? null : "○の数が違う";
    }
  };

  // ===== おおきい・ちいさい(おおきい ほうに ○) =====
  const tBigger = {
    id: "t.bigger",
    instruction: null,
    defaults: { rows: 2, k: 2, small: false },
    levels: lv({ rows: 2, k: 2 }, { rows: 3, k: 2, small: true }, { rows: 3, k: 3, small: true }),
    generate(rng, p, ctx) {
      const askSmall = p.small && rng.chance(0.4);
      const kinds = rng.shuffle(ALL()).slice(0, p.rows);
      const RH = 36, items = [], pick = [], sizesAll = [];
      const SZ = p.k === 3 ? [12, 20, 30] : [14, 30];
      kinds.forEach((k, i) => {
        const sizes = rng.shuffle(SZ.slice());
        sizesAll.push(sizes);
        const y = 2 + i * RH + RH / 2;
        sizes.forEach((s, j) => items.push(...pic(k, 30 + j * (p.k === 3 ? 56 : 92), y, s, `${i}:${j}`)));
        pick.push(sizes.indexOf(askSmall ? Math.min(...sizes) : Math.max(...sizes)));
      });
      return made(p, ctx, {
        key: `tb:${kinds.join(",")}:${sizesAll.map((s) => s.join("-")).join(",")}:${askSmall}`,
        text: p.k === 3 ? `いちばん ${askSmall ? "ちいさい" : "おおきい"} ものに ○を つけましょう。` : `${askSmall ? "ちいさい" : "おおきい"} ほうに ○を つけましょう。`,
        h: p.rows * RH,
        items,
        ans: (c) => pick.map((j, i) => ring(30 + j * (p.k === 3 ? 56 : 92), 2 + i * RH + RH / 2, Math.max(9, sizesAll[i][j] * 0.62), c, 1.1)),
        meta: { sizesAll, pick, askSmall }
      });
    },
    verify(pr) {
      const { sizesAll, pick, askSmall } = pr.meta;
      for (let i = 0; i < pick.length; i++) {
        const s = sizesAll[i], want = s.indexOf(askSmall ? Math.min(...s) : Math.max(...s));
        if (want !== pick[i]) return "○の場所が違う";
      }
      return redRings(pr.answer.figure).length === pick.length ? null : "○の数が違う";
    }
  };

  return [tAri, tSame, tSort, tBigger];
})();

// ===== 特別支援学校(知的障害)の算数・数学の段階 =====
// 学習指導要領(平成29年告示)の段階と内容(A〜D)に合わせて、いまある学年の単元・小単元の問題をならべなおしたもの。
// key は GRADES に入れる番号(21〜27)。styleGrade は字の大きさ・漢字の範囲に使う学年。
// units の from は「単元id」(全部の小単元)か「単元id:番号」(その小単元だけ)。levels は ★ごとの数の範囲などのしぼりこみ。
var tokushiStages = [
  {
    key: 21, name: "小学部1段階", ruby: "{小学部|しょうがくぶ}1{段階|だんかい}", short: "1", part: "小学部", styleGrade: 1,
    note: "ものの有無、対応、3までの数(数唱は5まで)、形の区別、大きさ・長さの違い",
    units: [
      { name: "ものの ある・ない", domain: "A 数量の基礎", from: [["t.ari"]] },
      { name: "おなじ ものを むすぼう", domain: "A 数量の基礎", from: [["t.same"]] },
      { name: "なかまあつめ", domain: "A 数量の基礎", from: [["t.sort", { basic: { kinds: 2, total: [4, 5], target: [2, 2] }, normal: { kinds: 2, total: [4, 6], target: [2, 3] }, challenge: { kinds: 2, total: [6, 8], target: [2, 4] } }]] },
      { name: "3までの かず", domain: "B 数と計算", from: [["y-01", { basic: { min: 1, max: 3 }, normal: { min: 1, max: 3, scatter: true }, challenge: { min: 1, max: 5 } }]] },
      { name: "どちらが おおい", domain: "B 数と計算", from: [["y-04", { basic: { max: 4, minDiff: 2 }, normal: { max: 5, minDiff: 2 }, challenge: { max: 5, minDiff: 1 } }]] },
      { name: "おなじ かたちを みつけよう", domain: "C 図形", from: [["y-12", { basic: { kinds: 2, total: [4, 6] }, normal: { kinds: 2, total: [5, 8] }, challenge: { kinds: 3, total: [6, 9] } }]] },
      { name: "おおきい・ちいさい", domain: "D 測定", from: [["t.bigger"]] },
      { name: "ながい・みじかい", domain: "D 測定", from: [["y-13", { basic: { k: 2 }, normal: { k: 2 }, challenge: { k: 3, short: true } }]] }
    ]
  },
  {
    key: 22, name: "小学部2段階", ruby: "{小学部|しょうがくぶ}2{段階|だんかい}", short: "2", part: "小学部", styleGrade: 1,
    note: "10までの数(数え方・読み書き・順序・0・合成と分解)、○△□、長さ・重さなどの比べ方、分類と絵グラフ",
    units: [
      { name: "10までの かず", domain: "A 数と計算", from: [["y-01"], ["y-03"]] },
      { name: "すうじを かこう", domain: "A 数と計算", from: [["y-02b"]], unitProps: { per: 10, starts: [1], defaultCount: 1 } },
      { name: "かずの じゅんばん", domain: "A 数と計算", from: [["y-05", { basic: { len: 5, lo: 1, hi: 7, blanks: [1, 2] }, normal: { len: 5, lo: 0, hi: 10, blanks: [1, 2] }, challenge: { len: 6, lo: 0, hi: 10, blanks: [2, 3], down: true } }], ["g1-01:4"]] },
      { name: "どちらが おおい", domain: "A 数と計算", from: [["y-04"], ["g1-01:2"], ["g1-01:5"]] },
      { name: "いくつと いくつ", domain: "A 数と計算", from: [["y-09"], ["g1-01:3"]] },
      { name: "かたちの なかま", domain: "B 図形", from: [["y-12"], ["g1-12:1"]] },
      { name: "ながさ・かさ・ひろさくらべ", domain: "C 測定", from: [["y-13"], ["g1-05:1"], ["g1-10:1"], ["g1-15:1"]] },
      { name: "なかまわけと えグラフ", domain: "D データの活用", from: [["t.sort"], ["g1-06"]] }
    ]
  },
  {
    key: 23, name: "小学部3段階", ruby: "{小学部|しょうがくぶ}3{段階|だんかい}", short: "3", part: "小学部", styleGrade: 1,
    note: "100までの数、20までのたし算・ひき算、身の回りの形と位置、長さ・広さ・かさ、時刻、絵や図での整理",
    units: [
      { name: "20までの かず", domain: "A 数と計算", from: [["g1-07"]] },
      { name: "100までの かず", domain: "A 数と計算", from: [["g1-14"]] },
      { name: "たしざん(10まで)", domain: "A 数と計算", from: [["g1-03"]] },
      { name: "ひきざん(10まで)", domain: "A 数と計算", from: [["g1-04"]] },
      { name: "3つの かずの けいさん", domain: "A 数と計算", from: [["g1-09"]] },
      { name: "くりあがりの ある たしざん", domain: "A 数と計算", from: [["g1-11"]] },
      { name: "くりさがりの ある ひきざん", domain: "A 数と計算", from: [["g1-13"]] },
      { name: "まえ・うしろ・うえ・した", domain: "B 図形", from: [["g1-02"], ["y-08"]] },
      { name: "かたちあそび・かたちづくり", domain: "B 図形", from: [["g1-12"], ["g1-18"]] },
      { name: "ながさ・かさ・ひろさ", domain: "C 測定", from: [["g1-05"], ["g1-10"], ["g1-15"]] },
      { name: "とけい", domain: "C 測定", from: [["g1-08"], ["g1-16"]] },
      { name: "えグラフ", domain: "D データの活用", from: [["g1-06"]] }
    ]
  },
  {
    key: 24, name: "中学部1段階", ruby: "{中学部|ちゅうがくぶ}1{段階|だんかい}", short: "1", part: "中学部", styleGrade: 3,
    note: "3位数までの数、2位数のたし算・ひき算と筆算、かけ算(九九)、三角形・四角形と箱の形、長さ・かさ・重さ、時刻と時間、表とグラフ",
    units: [
      { name: "3けたの数", domain: "A 数と計算", from: [["g2-05"]] },
      { name: "たし算の筆算", domain: "A 数と計算", from: [["g2-02"]] },
      { name: "ひき算の筆算", domain: "A 数と計算", from: [["g2-03"]] },
      { name: "たし算とひき算の筆算(3けた)", domain: "A 数と計算", from: [["g2-09"]] },
      { name: "かけ算(九九)", domain: "A 数と計算", from: [["g2-11"], ["g2-12"]] },
      { name: "三角形と四角形", domain: "B 図形", from: [["g2-10"]] },
      { name: "はこの形", domain: "B 図形", from: [["g2-17"]] },
      { name: "長さ", domain: "C 測定", from: [["g2-04"], ["g2-14"]] },
      { name: "かさ", domain: "C 測定", from: [["g2-06"]] },
      { name: "重さ", domain: "C 測定", from: [["g3-14"]] },
      { name: "時こくと時間", domain: "C 測定", from: [["g2-07"], ["g3-02"]] },
      { name: "表とグラフ", domain: "D データの活用", from: [["g2-01"], ["g3-06"]] }
    ]
  },
  {
    key: 25, name: "中学部2段階", ruby: "{中学部|ちゅうがくぶ}2{段階|だんかい}", short: "2", part: "中学部", styleGrade: 4,
    note: "4位数までの数、3・4位数のたし算・ひき算、かけ算のきまり、わり算とあまり、小数・分数のはじめ、□を使った式、三角形・角・円、面積、変わり方、棒グラフ・折れ線グラフ",
    units: [
      { name: "4けたの数・大きい数", domain: "A 数と計算", from: [["g2-13"], ["g3-09"]] },
      { name: "たし算とひき算の筆算", domain: "A 数と計算", from: [["g3-04"]] },
      { name: "かけ算のきまり", domain: "A 数と計算", from: [["g3-01"]] },
      { name: "わり算", domain: "A 数と計算", from: [["g3-03"], ["g3-08"]] },
      { name: "小数", domain: "A 数と計算", from: [["g3-13"]] },
      { name: "分数", domain: "A 数と計算", from: [["g2-16"], ["g3-15"]] },
      { name: "□を使った式", domain: "A 数と計算", from: [["g3-16"]] },
      { name: "三角形と角", domain: "B 図形", from: [["g3-18"], ["g4-04"]] },
      { name: "円と球", domain: "B 図形", from: [["g3-12"]] },
      { name: "垂直・平行と四角形", domain: "B 図形", from: [["g4-09"]] },
      { name: "面積", domain: "B 図形", from: [["g4-12"]] },
      { name: "変わり方", domain: "C 変化と関係", from: [["g4-11"], ["g4-06b"]] },
      { name: "棒グラフと折れ線グラフ", domain: "D データの活用", from: [["g3-06"], ["g4-02"]] }
    ]
  },
  {
    key: 26, name: "高等部1段階", ruby: "{高等部|こうとうぶ}1{段階|だんかい}", short: "1", part: "高等部", styleGrade: 5,
    note: "整数のかけ算・わり算、小数・分数の計算、概数、合同・多角形・面積、比例、単位量あたり、百分率、帯グラフ・円グラフ、平均",
    units: [
      { name: "わり算の筆算", domain: "A 数と計算", from: [["g4-03"], ["g4-06"]] },
      { name: "小数のしくみと計算", domain: "A 数と計算", from: [["g4-05"], ["g4-13"]] },
      { name: "小数のかけ算・わり算", domain: "A 数と計算", from: [["g5-04"], ["g5-05"]] },
      { name: "分数のたし算・ひき算", domain: "A 数と計算", from: [["g4-10"], ["g5-10"]] },
      { name: "がい数", domain: "A 数と計算", from: [["g4-07"]] },
      { name: "計算のきまり", domain: "A 数と計算", from: [["g4-08"]] },
      { name: "合同な図形", domain: "B 図形", from: [["g5-06"]] },
      { name: "図形の角", domain: "B 図形", from: [["g5-07"]] },
      { name: "面積", domain: "B 図形", from: [["g5-13"]] },
      { name: "比例", domain: "C 変化と関係", from: [["g5-03"]] },
      { name: "単位量あたりの大きさ", domain: "C 変化と関係", from: [["g5-12"]] },
      { name: "割合", domain: "C 変化と関係", from: [["g5-14"]] },
      { name: "帯グラフと円グラフ", domain: "D データの活用", from: [["g5-15"]] },
      { name: "平均", domain: "D データの活用", from: [["g5-11"]] }
    ]
  },
  {
    key: 27, name: "高等部2段階", ruby: "{高等部|こうとうぶ}2{段階|だんかい}", short: "2", part: "高等部", styleGrade: 6,
    note: "整数の性質、分数の計算、文字を使った式、拡大図と縮図、円の面積、体積、比例と反比例、比、データの分布",
    units: [
      { name: "倍数と約数", domain: "A 数と計算", from: [["g5-08"]] },
      { name: "分数と小数", domain: "A 数と計算", from: [["g5-09"]] },
      { name: "分数のかけ算・わり算", domain: "A 数と計算", from: [["g6-03"], ["g6-04"]] },
      { name: "文字と式", domain: "A 数と計算", from: [["g6-02"]] },
      { name: "拡大図と縮図", domain: "B 図形", from: [["g6-06"]] },
      { name: "円の面積", domain: "B 図形", from: [["g6-08"]] },
      { name: "体積", domain: "B 図形", from: [["g5-02"], ["g6-09"]] },
      { name: "比例と反比例", domain: "C 変化と関係", from: [["g6-11"]] },
      { name: "比", domain: "C 変化と関係", from: [["g6-05"]] },
      { name: "データの調べ方", domain: "D データの活用", from: [["g6-07"]] }
    ]
  }
];
