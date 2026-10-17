
  // ===== 2本の折れ線 =====
  const TWO = [
    {
      id: "cities", title: "A{市|し}とB{市|し}の{月|つき}ごとの{気温|きおん}", names: ["A{市|し}", "B{市|し}"], q: "{気温|きおん}", unit: "{度|ど}", labels: MONTH_L, items: MONTH_L, step: 1, major: 5, wave: 0, hi: "{高|たか}い", xTitle: "{月|がつ}",
      make: (rng) => {
        const pk = 4, ma = rng.int(15, 17), aa = rng.int(8, 10), mb = rng.int(11, 13), ab = rng.int(11, 13);
        const A = MONTH_L.map((_, i) => Math.round(ma + aa * Math.cos((i - pk) * Math.PI / 6)) + rng.int(-1, 1));
        const B = MONTH_L.map((_, i) => Math.round(mb + ab * Math.cos((i - pk) * Math.PI / 6)) + rng.int(-1, 1));
        return [A, B];
      }
    },
    {
      id: "plants", title: "ヘチマとゴーヤのくきの{長|なが}さ", names: ["ヘチマ", "ゴーヤ"], q: "くきの{長|なが}さ", unit: "cm", labels: range(1, 8).map((s) => `${s}{週|しゅう}`), items: range(1, 8).map((s) => `${s}{週目|しゅうめ}`), step: 10, major: 5, wave: 0, hi: "{長|なが}い", xTitle: "{週|しゅう}",
      make: (rng) => {
        const grow = (a, picks) => {
          let v = a;
          return range(1, 8).map((_, i) => i === 0 ? v : v += rng.pick(picks));
        };
        return [grow(rng.int(1, 3) * 10, [20, 30, 40, 40, 50]), grow(rng.int(1, 3) * 10, [10, 20, 30, 40, 50, 60])];
      }
    },
    {
      id: "classes", title: "1{組|くみ}と2{組|くみ}が{図書室|としょしつ}で{借|か}りた{本|ほん}の{数|かず}", names: ["1{組|くみ}", "2{組|くみ}"], q: "{借|か}りた{本|ほん}の{数|かず}", unit: "{冊|さつ}", labels: MONTH_L.filter((_, i) => i !== 4), items: MONTH_L.filter((_, i) => i !== 4), step: 5, major: 4, wave: 0, hi: "{多|おお}い", xTitle: "{月|がつ}",
      make: (rng) => [Array.from({ length: 11 }, () => rng.int(4, 12) * 5), Array.from({ length: 11 }, () => rng.int(4, 12) * 5)]
    },
    {
      id: "weather", title: "{晴|は}れた{日|ひ}とくもった{日|ひ}の{気温|きおん}", names: ["{晴|は}れた{日|ひ}", "くもった{日|ひ}"], q: "{気温|きおん}", unit: "{度|ど}", labels: hourLabels(H9_4), items: H9_4.map(hour), step: 1, major: 5, wave: 10, hi: "{高|たか}い", xTitle: "{時|じ}",
      make: (rng) => [smooth(rng, rng.int(15, 18), rng.int(8, 11), rng.int(4, 5), 5, 8), smooth(rng, rng.int(15, 18), rng.int(1, 3), rng.int(3, 5), 6, 8)]
    }
  ];
  const lgTwo = {
    id: "g4.lgTwo",
    grade: 4,
    instruction: null,
    defaults: { asks: ["cmp", "value"], n: 2 },
    levels: {
      basic: { asks: ["cmp", "value"], n: 2 },
      normal: { asks: ["cmp", "value", "gap", "same"], n: 3 },
      challenge: { asks: ["cmp", "gap", "same", "gapAt"], n: 3 }
    },
    generate(rng, p) {
      for (let t = 0; t < 400; t++) {
        const th = rng.pick(TWO);
        const [A, B] = th.make(rng);
        const all = [...A, ...B];
        if (all.some((x) => x % th.step !== 0 || x <= (th.wave ? th.wave : -1))) continue;
        const yMax = yMaxFor(all, th);
        if ((yMax - th.wave) / th.step > 46) continue;
        const gaps = A.map((a, i) => Math.abs(a - B[i]));
        const can = {
          cmp: () => {
            const ks = A.map((_, i) => i).filter((i) => A[i] !== B[i]);
            if (!ks.length) return null;
            const k = rng.pick(ks);
            return { q: `${th.items[k]}の${th.q}が${th.hi}のは、${th.names[0]}と${th.names[1]}のどちらですか。`, a: th.names[A[k] > B[k] ? 0 : 1], m: { kind: "cmp", k } };
          },
          value: () => {
            const k = rng.int(0, A.length - 1), s = rng.int(0, 1);
            return { q: `${th.items[k]}の${th.names[s]}の${th.q}は{何|なん}${th.unit}ですか。`, a: `${[A, B][s][k]}${th.unit}`, m: { kind: "value", k, s } };
          },
          gap: () => {
            const mx = Math.max(...gaps), k = uniqueIdx(gaps, mx);
            if (k < 0 || mx === 0) return null;
            return { q: `${th.q}のちがいがいちばん{大|おお}きいのはいつですか。また、{何|なん}${th.unit}ちがいますか。`, a: `${th.items[k]}で${mx}${th.unit}`, m: { kind: "gap", k } };
          },
          same: () => {
            const ks = gaps.map((g, i) => g === 0 ? i : -1).filter((i) => i >= 0);
            if (ks.length !== 1) return null;
            return { q: `${th.names[0]}と${th.names[1]}の${th.q}が{同|おな}じなのはいつですか。`, a: th.items[ks[0]], m: { kind: "same", k: ks[0] } };
          },
          gapAt: () => {
            const ks = gaps.map((g, i) => g > 0 ? i : -1).filter((i) => i >= 0);
            if (!ks.length) return null;
            const k = rng.pick(ks);
            return { q: `${th.items[k]}の${th.q}のちがいは{何|なん}${th.unit}ですか。`, a: `${gaps[k]}${th.unit}`, m: { kind: "gapAt", k } };
          }
        };
        const asks = [];
        for (const k of rng.shuffle(p.asks)) {
          if (asks.length >= p.n) break;
          const a = can[k]();
          if (a) asks.push(a);
        }
        if (asks.length < p.n) continue;
        const fig = chart({ labels: th.labels, series: [{ v: A }, { v: B, dash: true }], legend: [{ name: th.names[0] }, { name: th.names[1], dash: true }], yMax, yMin: th.wave, step: th.step, major: th.major, unit: th.unit, xTitle: th.xTitle });
        return {
          key: `lg2:${th.id}:${A.join(",")}:${B.join(",")}`,
          softKey: th.id,
          text: `${LG_TEXT(th)}[[br]]${numberQs(asks.map((a) => a.q)).join("[[br]]")}`,
          figure: fig,
          answer: { display: asks.map((a, i) => `(${i + 1}) ${a.a}`).join("　"), value: [A, B] },
          workspace: linesWs(asks.length),
          side: th.labels.length <= 8,
          meta: { theme: th.id, A, B, asks: asks.map((a) => a.m) }
        };
      }
      throw new Error("2本の折れ線の問題が作れない");
    },
    verify(pr) {
      const th = TWO.find((x) => x.id === pr.meta.theme);
      const A = readSeries(pr.figure, 0), B = readSeries(pr.figure, 1);
      if (A.join() !== pr.meta.A.join() || B.join() !== pr.meta.B.join()) return "図の点と値が合わない";
      if (!pr.figure.items.some((it) => it.t === "line" && it.dash)) return "点線がない";
      const gaps = A.map((a, i) => Math.abs(a - B[i]));
      const parts = pr.answer.display.split("　").map((s) => s.replace(/^\(\d+\) /, ""));
      for (const [n, m] of pr.meta.asks.entries()) {
        let want;
        if (m.kind === "cmp") want = A[m.k] === B[m.k] ? "×" : th.names[A[m.k] > B[m.k] ? 0 : 1];
        if (m.kind === "value") want = `${[A, B][m.s][m.k]}${th.unit}`;
        if (m.kind === "gap") want = gaps.filter((g) => g === Math.max(...gaps)).length === 1 && gaps[m.k] === Math.max(...gaps) ? `${th.items[m.k]}で${gaps[m.k]}${th.unit}` : "×";
        if (m.kind === "same") want = gaps.filter((g) => g === 0).length === 1 && gaps[m.k] === 0 ? th.items[m.k] : "×";
        if (m.kind === "gapAt") want = `${gaps[m.k]}${th.unit}`;
        if (plain(parts[n]) !== plain(want)) return `答えが合わない(${m.kind})`;
      }
      return null;
    }
  };

  // ===== 棒グラフと折れ線グラフを合わせたグラフ =====
  const DAYS = ["{月|げつ}", "{火|か}", "{水|すい}", "{木|もく}", "{金|きん}", "{土|ど}", "{日|にち}"];
  const DAY_ITEMS = ["{月曜日|げつようび}", "{火曜日|かようび}", "{水曜日|すいようび}", "{木曜日|もくようび}", "{金曜日|きんようび}", "{土曜日|どようび}", "{日曜日|にちようび}"];
  const COMBO = [
    {
      id: "rain", title: "ある{市|し}の{月|つき}ごとの{気温|きおん}と{降水量|こうすいりょう}", labels: MONTH_L, items: MONTH_L, xTitle: "{月|がつ}",
      line: { name: "{気温|きおん}", unit: "{度|ど}", step: 1, major: 5, hi: "{高|たか}い", lo: "{低|ひく}い" },
      bars: { name: "{降水量|こうすいりょう}", unit: "mm", per: 10, major: 5, hi: "{多|おお}い", lo: "{少|すく}ない" },
      make: (rng) => {
        const T = MONTH_L.map((_, i) => Math.round(15 + rng.int(9, 11) * Math.cos((i - 4) * Math.PI / 6)) + rng.int(-1, 1));
        const R = MONTH_L.map((_, i) => (i === 2 || i === 5 ? rng.int(18, 28) : i === 3 || i === 4 ? rng.int(10, 18) : i >= 8 ? rng.int(4, 9) : rng.int(8, 15)) * 10);
        return [T, R];
      }
    },
    {
      id: "ice", title: "ある{店|みせ}の{月|つき}ごとの{気温|きおん}とアイスクリームの{売|う}れた{数|かず}", labels: MONTH_L, items: MONTH_L, xTitle: "{月|がつ}",
      line: { name: "{気温|きおん}", unit: "{度|ど}", step: 1, major: 5, hi: "{高|たか}い", lo: "{低|ひく}い" },
      bars: { name: "{売|う}れた{数|かず}", unit: "こ", per: 10, major: 5, hi: "{多|おお}い", lo: "{少|すく}ない" },
      make: (rng) => {
        const T = MONTH_L.map((_, i) => Math.round(15 + rng.int(9, 11) * Math.cos((i - 4) * Math.PI / 6)) + rng.int(-1, 1));
        const S = T.map((x) => Math.max(3, Math.min(29, Math.round(x - 3 + rng.int(-3, 3)))) * 10);
        return [T, S];
      }
    },
    {
      id: "poolWeek", title: "ある{週|しゅう}の{気温|きおん}と、プールに{来|き}た{人|ひと}の{数|かず}", labels: DAYS, items: DAY_ITEMS, xTitle: "{曜日|ようび}",
      line: { name: "{気温|きおん}", unit: "{度|ど}", step: 1, major: 5, hi: "{高|たか}い", lo: "{低|ひく}い" },
      bars: { name: "{来|き}た{人|ひと}の{数|かず}", unit: "{人|にん}", per: 10, major: 5, hi: "{多|おお}い", lo: "{少|すく}ない" },
      make: (rng) => {
        const T = DAYS.map(() => rng.int(24, 34));
        const P = T.map((x, i) => Math.max(5, Math.min(34, (x - 22) * 2 + (i >= 5 ? 6 : 0) + rng.int(-2, 2))) * 10);
        return [T, P];
      }
    }
  ];
  const lgCombo = {
    id: "g4.lgCombo",
    grade: 4,
    instruction: null,
    defaults: { asks: ["barMax", "lineVal", "barVal"], n: 2 },
    levels: {
      basic: { asks: ["barMax", "lineVal", "barVal"], n: 2 },
      normal: { asks: ["barMax", "lineVal", "barVal", "lineMax"], n: 3 },
      challenge: { asks: ["barMax", "barVal", "lineMax", "lineMaxBar", "barMin"], n: 3 }
    },
    generate(rng, p) {
      for (let t = 0; t < 400; t++) {
        const th = rng.pick(COMBO);
        const [T, B] = th.make(rng);
        const L = th.line, R = th.bars;
        const yMax = Math.ceil((Math.max(...T) + 1) / 5) * 5;
        if (B.some((x) => x % R.per !== 0 || x > yMax * R.per || x <= 0) || T.some((x) => x <= 0)) continue;
        const iMaxB = uniqueIdx(B, Math.max(...B)), iMinB = uniqueIdx(B, Math.min(...B)), iMaxT = uniqueIdx(T, Math.max(...T));
        const can = {
          barMax: () => iMaxB < 0 ? null : { q: `${R.name}がいちばん${R.hi}のはいつですか。`, a: th.items[iMaxB], m: { kind: "barMax" } },
          barMin: () => iMinB < 0 ? null : { q: `${R.name}がいちばん${R.lo}のはいつですか。`, a: th.items[iMinB], m: { kind: "barMin" } },
          lineMax: () => iMaxT < 0 ? null : { q: `${L.name}がいちばん${L.hi}のはいつですか。`, a: th.items[iMaxT], m: { kind: "lineMax" } },
          lineVal: () => {
            const k = rng.int(0, T.length - 1);
            return { q: `${th.items[k]}の${L.name}は{何|なん}${L.unit}ですか。`, a: `${T[k]}${L.unit}`, m: { kind: "lineVal", k } };
          },
          barVal: () => {
            const k = rng.int(0, B.length - 1);
            return { q: `${th.items[k]}の${R.name}は{何|なん}${R.unit}ですか。`, a: `${B[k]}${R.unit}`, m: { kind: "barVal", k } };
          },
          lineMaxBar: () => iMaxT < 0 ? null : { q: `${L.name}がいちばん${L.hi}ときの${R.name}は{何|なん}${R.unit}ですか。`, a: `${B[iMaxT]}${R.unit}`, m: { kind: "lineMaxBar" } }
        };
        const asks = [];
        for (const k of rng.shuffle(p.asks)) {
          if (asks.length >= p.n) break;
          const a = can[k]();
          if (a) asks.push(a);
        }
        if (asks.length < p.n) continue;
        const fig = chart({ labels: th.labels, series: [{ v: T }], bars: { v: B, per: R.per, major: R.major, unit: R.unit }, legend: [{ name: L.name }, { name: R.name, bar: true }], yMax, yMin: 0, step: L.step, major: L.major, unit: L.unit, xTitle: th.xTitle });
        return {
          key: `lgx:${th.id}:${T.join(",")}:${B.join(",")}`,
          softKey: th.id,
          text: `{下|した}のグラフは、${th.title}を{表|あらわ}したものです。${L.name}は{折|お}れ{線|せん}グラフで{左|ひだり}の{目|め}もり、${R.name}は{棒|ぼう}グラフで{右|みぎ}の{目|め}もりを{見|み}ます。[[br]]${numberQs(asks.map((a) => a.q)).join("[[br]]")}`,
          figure: fig,
          answer: { display: asks.map((a, i) => `(${i + 1}) ${a.a}`).join("　"), value: [T, B] },
          workspace: linesWs(asks.length),
          side: false,
          meta: { theme: th.id, T, B, asks: asks.map((a) => a.m) }
        };
      }
      throw new Error("合わせたグラフの問題が作れない");
    },
    verify(pr) {
      const th = COMBO.find((x) => x.id === pr.meta.theme), L = th.line, R = th.bars;
      const T = readSeries(pr.figure), B = readBars(pr.figure, R.per);
      if (T.join() !== pr.meta.T.join() || B.join() !== pr.meta.B.join()) return "図と値が合わない";
      const idx = (arr, f) => {
        const x = f(...arr);
        return arr.filter((y) => y === x).length === 1 ? arr.indexOf(x) : -1;
      };
      const parts = pr.answer.display.split("　").map((s) => s.replace(/^\(\d+\) /, ""));
      for (const [n, m] of pr.meta.asks.entries()) {
        let want;
        if (m.kind === "barMax") want = th.items[idx(B, Math.max)];
        if (m.kind === "barMin") want = th.items[idx(B, Math.min)];
        if (m.kind === "lineMax") want = th.items[idx(T, Math.max)];
        if (m.kind === "lineVal") want = `${T[m.k]}${L.unit}`;
        if (m.kind === "barVal") want = `${B[m.k]}${R.unit}`;
        if (m.kind === "lineMaxBar") want = `${B[idx(T, Math.max)]}${R.unit}`;
        if (!want || plain(parts[n]) !== plain(want)) return `答えが合わない(${m.kind})`;
      }
      return null;
    }
  };

  // ===== 折れ線グラフと棒グラフ、どちらを使うか =====
  const WHICH_LINE = [
    "ある{町|まち}の1{年間|ねんかん}の{気温|きおん}の{変|か}わり{方|かた}",
    "{植|う}えたヒマワリの{高|たか}さの、{週|しゅう}ごとの{変|か}わり{方|かた}",
    "{夏|なつ}のある{日|ひ}の、1{日|にち}の{気温|きおん}の{変|か}わり{方|かた}",
    "{子犬|こいぬ}の{体重|たいじゅう}の、{月|つき}ごとの{変|か}わり{方|かた}",
    "{自分|じぶん}の{身長|しんちょう}の、{毎年|まいとし}の{変|か}わり{方|かた}",
    "{水|みず}をあたためたときの、{温度|おんど}の{変|か}わり{方|かた}",
    "ろうそくがもえていくときの、{長|なが}さの{変|か}わり{方|かた}",
    "{池|いけ}の{水|みず}の{温度|おんど}の、{月|つき}ごとの{変|か}わり{方|かた}",
    "かぜをひいたときの、{体温|たいおん}の{変|か}わり{方|かた}",
    "{町|まち}の{人口|じんこう}の、10{年|ねん}ごとの{変|か}わり{方|かた}",
    "1{日|にち}のかげの{長|なが}さの{変|か}わり{方|かた}",
    "{図書室|としょしつ}で{借|か}りられた{本|ほん}の{数|かず}の、{月|つき}ごとの{変|か}わり{方|かた}",
    "{冷|れい}とう{庫|こ}に{入|い}れた{水|みず}の、{温度|おんど}の{変|か}わり{方|かた}",
    "アサガオのつるの{長|なが}さの、{日|ひ}ごとの{変|か}わり{方|かた}",
    "1{週間|しゅうかん}の、{毎朝|まいあさ}の{気温|きおん}の{変|か}わり{方|かた}",
    "{店|みせ}でアイスクリームが{売|う}れた{数|かず}の、{月|つき}ごとの{変|か}わり{方|かた}",
    "{水|みず}そうに{水|みず}を{入|い}れたときの、{深|ふか}さの{変|か}わり{方|かた}",
    "お{湯|ゆ}がさめていくときの、{温度|おんど}の{変|か}わり{方|かた}"
  ];
  const WHICH_BAR = [
    "クラスの{人|ひと}の{好|す}きな{果物|くだもの}と、その{人数|にんずう}",
    "4{年生|ねんせい}の、{組|くみ}ごとの{人数|にんずう}",
    "{好|す}きなスポーツを{調|しら}べた{結果|けっか}",
    "{学校|がっこう}にある{木|き}の、{種類|しゅるい}ごとの{本数|ほんすう}",
    "いくつかの{山|やま}の{高|たか}さくらべ",
    "4{月|がつ}に{借|か}りられた{本|ほん}の、{種類|しゅるい}ごとの{数|かず}",
    "{家族|かぞく}みんなの{身長|しんちょう}くらべ",
    "{町|まち}ごとの{子|こ}どもの{人数|にんずう}",
    "けがをした{場所|ばしょ}ごとの{人数|にんずう}",
    "いろいろな{動物|どうぶつ}の{体重|たいじゅう}くらべ",
    "{好|す}きな{給食|きゅうしょく}のメニューと、その{人数|にんずう}",
    "{学年|がくねん}ごとの、{図書室|としょしつ}を{使|つか}った{人|ひと}の{数|かず}",
    "{色|いろ}ごとのおはじきの{数|かず}",
    "クラスで{好|す}きな{色|いろ}を{調|しら}べた{結果|けっか}",
    "{乗|の}り{物|もの}ごとの、{遠足|えんそく}で{使|つか}った{人|ひと}の{数|かず}",
    "{校庭|こうてい}で{見|み}つけた{生|い}き{物|もの}の、{種類|しゅるい}ごとの{数|かず}"
  ];
  const LINE_G = "{折|お}れ{線|せん}グラフ", BAR_G = "{棒|ぼう}グラフ";
  const lgWhich = {
    id: "g4.lgWhich",
    grade: 4,
    instruction: null,
    defaults: { n: 3 },
    levels: { basic: { n: 3 }, normal: { n: 4 }, challenge: { n: 5 } },
    generate(rng, p) {
      const nl = rng.int(1, p.n - 1);
      const items = rng.shuffle([...rng.shuffle(WHICH_LINE.map((s) => [s, "line"])).slice(0, nl), ...rng.shuffle(WHICH_BAR.map((s) => [s, "bar"])).slice(0, p.n - nl)]);
      return {
        key: `lgw:${items.map(([s]) => s).sort().join("|")}`,
        text: `{次|つぎ}のことをグラフに{表|あらわ}すとき、${LINE_G}と${BAR_G}のどちらを{使|つか}うとよいですか。[[br]]${items.map(([s], i) => `(${i + 1}) ${s}　（　　　　　　　　）`).join("[[br]]")}`,
        answer: { display: items.map(([, k], i) => `(${i + 1}) ${k === "line" ? LINE_G : BAR_G}`).join("　"), value: items.map(([, k]) => k) },
        workspace: { type: "none" },
        meta: { items }
      };
    },
    verify(pr, p) {
      const { items } = pr.meta;
      if (items.length !== p.n) return "問いの数が違う";
      if (!items.some(([, k]) => k === "line") || !items.some(([, k]) => k === "bar")) return "どちらかしかない";
      for (const [s, k] of items) if (!(k === "line" ? WHICH_LINE : WHICH_BAR).includes(s)) return "答えの種類が違う";
      const parts = pr.answer.display.split("　");
      if (parts.some((a, i) => a !== `(${i + 1}) ${items[i][1] === "line" ? LINE_G : BAR_G}`)) return "答えが合わない";
      return null;
    }
  };

  // ===== 変わり方とグラフの形 =====
  const SHAPES = {
    up: [[0, 0.1], [1, 0.9]],
    down: [[0, 0.9], [1, 0.1]],
    upFlat: [[0, 0.1], [0.55, 0.85], [1, 0.85]],
    upDown: [[0, 0.15], [0.5, 0.85], [1, 0.15]],
    downFlat: [[0, 0.85], [0.55, 0.15], [1, 0.15]],
    downUp: [[0, 0.85], [0.5, 0.15], [1, 0.85]]
  };
  const SHAPE_SCENES = [
    ["up", "{植|う}えてから8{週間|しゅうかん}の、ヘチマのくきの{長|なが}さ"],
    ["up", "{毎日|まいにち}10{円|えん}ずつ{貯金|ちょきん}したときの、{貯金|ちょきん}の{合計|ごうけい}"],
    ["up", "{休|やす}まずに{歩|ある}きつづけたときの、{歩|ある}いた{道|みち}のり"],
    ["down", "ろうそくをもやしつづけたときの、ろうそくの{長|なが}さ"],
    ["down", "{水|みず}そうの{水|みず}をぬいていくときの、{水|みず}の{深|ふか}さ"],
    ["down", "100{枚|まい}の{色紙|いろがみ}を{毎日|まいにち}{同|おな}じ{数|かず}ずつ{使|つか}うときの、のこりの{枚数|まいすう}"],
    ["upFlat", "{水|みず}をあたためて、ふっとうしたあともしばらくはかったときの{温度|おんど}"],
    ["upFlat", "{水|みず}そうに{水|みず}を{入|い}れて、とちゅうで{水|みず}を{止|と}めたときの{水|みず}の{深|ふか}さ"],
    ["upFlat", "{生|う}まれてから{大人|おとな}になったあとまでの、{人|ひと}の{身長|しんちょう}"],
    ["upDown", "{夏|なつ}の1{日|にち}の{気温|きおん}({朝|あさ}から{夕方|ゆうがた}まで)"],
    ["upDown", "1{年間|ねんかん}の{気温|きおん}(1{月|がつ}から12{月|がつ}まで)"],
    ["upDown", "ボールを{真上|まうえ}に{投|な}げたときの、ボールの{高|たか}さ"],
    ["downFlat", "{冷|れい}とう{庫|こ}に{入|い}れた{水|みず}の{温度|おんど}(こおりになるまで)"],
    ["downFlat", "{熱|あつ}いお{湯|ゆ}が、{部屋|へや}の{温度|おんど}と{同|おな}じになるまでさめていくときの{温度|おんど}"],
    ["downUp", "{晴|は}れた{日|ひ}の、ぼうのかげの{長|なが}さ({朝|あさ}から{夕方|ゆうがた}まで)"],
    ["downUp", "1{年間|ねんかん}の{気温|きおん}(7{月|がつ}から{次|つぎ}の{年|とし}の6{月|がつ}まで)"]
  ];
  function shapePanel(shapeKeys) {
    const PW = 28, PH = 18, GAP = 8, items = [];
    shapeKeys.forEach((k, j) => {
      const ox = 4 + j * (PW + GAP), oy = 3;
      items.push({ t: "line", x1: ox, y1: oy, x2: ox, y2: oy + PH, w: 0.4, lead: true });
      items.push({ t: "line", x1: ox, y1: oy + PH, x2: ox + PW, y2: oy + PH, w: 0.4, lead: true });
      items.push({ t: "poly", open: true, pts: SHAPES[k].map(([x, y]) => [ox + 2 + x * (PW - 4), oy + PH - y * PH]), w: 0.7, lead: true, shape: k });
      items.push({ t: "text", x: ox + PW / 2, y: oy + PH + 6, s: AIUEO[j], size: 4, bold: true, halo: false });
    });
    return { type: "draw", w: 8 + shapeKeys.length * (PW + GAP) - GAP, h: 30, items };
  }
  const lgShape = {
    id: "g4.lgShape",
    grade: 4,
    instruction: null,
    defaults: { n: 2 },
    levels: { basic: { n: 2 }, normal: { n: 3 }, challenge: { n: 3 } },
    generate(rng, p) {
      const kinds = rng.shuffle(Object.keys(SHAPES)).slice(0, 4);
      const asked = rng.shuffle(kinds).slice(0, p.n);
      const scenes = asked.map((k) => rng.pick(SHAPE_SCENES.filter(([s]) => s === k)));
      return {
        key: `lgsh:${kinds.join(",")}:${scenes.map(([, s]) => s).join("|")}`,
        softKey: scenes[0][1],
        text: `{次|つぎ}の${p.n === 2 ? "(1)、(2)" : "(1)〜(3)"}の{変|か}わり{方|かた}を{折|お}れ{線|せん}グラフに{表|あらわ}すと、ア〜エのどれに{近|ちか}い{形|かたち}になりますか。[[br]]${scenes.map(([, s], i) => `(${i + 1}) ${s}　（　　　）`).join("[[br]]")}`,
        figure: shapePanel(kinds),
        answer: { display: scenes.map(([k], i) => `(${i + 1}) ${AIUEO[kinds.indexOf(k)]}`).join("　"), value: kinds },
        workspace: { type: "none" },
        meta: { kinds, scenes }
      };
    },
    verify(pr, p) {
      const polys = pr.figure.items.filter((it) => it.t === "poly");
      const kinds = polys.map((it) => it.shape);
      if (new Set(kinds).size !== 4) return "グラフの形が4つでない";
      const parts = pr.answer.display.split("　");
      for (const [i, [k, s]] of pr.meta.scenes.entries()) {
        if (!SHAPE_SCENES.some(([k2, s2]) => k2 === k && s2 === s)) return "場面と形の組が違う";
        // 形の向きを点から確かめる(上がる=y が減る)
        const pts = polys[kinds.indexOf(k)].pts, ys = pts.map((q) => q[1]);
        const trend = ys.slice(1).map((y, j) => y < ys[j] - 1 ? "u" : y > ys[j] + 1 ? "d" : "f").join("");
        const want = { up: "u", down: "d", upFlat: "uf", upDown: "ud", downFlat: "df", downUp: "du" }[k];
        if (trend !== want) return `形が違う ${k}`;
        if (parts[i] !== `(${i + 1}) ${AIUEO[kinds.indexOf(k)]}`) return "答えが合わない";
      }
      if (pr.meta.scenes.length !== p.n) return "問いの数が違う";
      return null;
    }
  };
