// 3年「ぼうグラフと表」:組(月・曜日)ごとの3〜4つの表を、1つの表(二次元表)にまとめる
// 図は draw(mm)。上に元の表、矢印、下にまとめる表(左上にななめの線)。答えの図は、空らんにオレンジの数を書きこむ
var g3MergeTables = (() => {
  const KEY = "#ef7d00";
  const OTHER = "その{他|た}";
  const KUMI = ["1{組|くみ}", "2{組|くみ}", "3{組|くみ}", "4{組|くみ}"];
  const DAYS = ["{月曜日|げつようび}", "{火曜日|かようび}", "{水曜日|すいようび}"];
  // 習っていない漢字はひらがなになるので、漢字とかなの長いほうではばを見つもる
  let learned = null;
  const isLearned = (k) => {
    if (!learned) learned = new Set(typeof kanji_default !== "undefined" ? ["1", "2", "3"].map((g) => kanji_default[g] || "").join("") : "");
    return [...k].every((ch) => learned.has(ch));
  };
  const plain = (s) => String(s).replace(/\{([^{}|]+)\|([^{}]*)\}/g, (_, k, kana) => isLearned(k) ? k : kana);
  const textW = (s, fs) => [...plain(s)].reduce((a, ch) => a + (ch.charCodeAt(0) < 8192 ? 0.58 : 1), 0) * fs;
  const fitFs = (s, fs, w) => Math.min(fs, w / Math.max(1, textW(s, 1)));
  const NUM = ["", "1つ", "2つ", "3つ", "4つ"];

  // 組ごとに調べた題材(3年生全体)
  const kumi = (o) => ({
    kind: "kumi",
    m: "{人数|にんずう}",
    u: "{人|にん}",
    corner: "{組|くみ}",
    total: [26, 34],
    groupsOf: (n) => KUMI.slice(0, n),
    desc: (gs) => `{次|つぎ}の{表|ひょう}は、3{年生|ねんせい}(${gs.join("・")})の${o.title}をまとめたものです。`,
    caption: (g) => `${o.short || o.title}(3{年|ねん}${g})`,
    mtitle: `${o.title}(3{年生|ねんせい})`,
    cell: (g, x) => `3{年|ねん}${g}で、${o.ph(x)}`,
    row: (x) => `3{年生|ねんせい}{全体|ぜんたい}で、${o.ph(x)}`,
    col: (g) => `3{年|ねん}${g}の{人数|にんずう}の{合計|ごうけい}`,
    all: "3{年生|ねんせい}{全体|ぜんたい}の{人数|にんずう}の{合計|ごうけい}",
    ...o
  });
  const THEMES = [
    kumi({ title: "{町|まち}べつの{人数|にんずう}", head: "{町|まち}", items: ["{東町|ひがしまち}", "{西町|にしまち}", "{南町|みなみまち}", "{北町|きたまち}", "さくら{町|まち}", "もみじ{町|まち}"], other: "その{他|た}の{町|まち}", ph: (x) => `${x}に{住|す}んでいる{人数|にんずう}` }),
    kumi({ title: "{好|す}きなくだものべつの{人数|にんずう}", short: "{好|す}きなくだもの", head: "くだもの", items: ["りんご", "みかん", "いちご", "ぶどう", "バナナ", "もも"], other: "その{他|た}のくだもの", ph: (x) => `${x}が{好|す}きな{人数|にんずう}` }),
    kumi({ title: "{好|す}きなスポーツべつの{人数|にんずう}", short: "{好|す}きなスポーツ", head: "スポーツ", items: ["サッカー", "ドッジボール", "なわとび", "{水泳|すいえい}", "{野球|やきゅう}", "{一輪車|いちりんしゃ}"], other: "その{他|た}のスポーツ", ph: (x) => `${x}が{好|す}きな{人数|にんずう}` }),
    kumi({ title: "{図書室|としょしつ}でかりた{本|ほん}のしゅるいべつの{人数|にんずう}", short: "かりた{本|ほん}のしゅるい", head: "しゅるい", items: ["{物語|ものがたり}", "{図|ず}かん", "{伝記|でんき}", "{詩|し}の{本|ほん}"], other: "その{他|た}の{本|ほん}", ph: (x) => `${x}をかりた{人数|にんずう}` }),
    kumi({ title: "{好|す}きな{給食|きゅうしょく}べつの{人数|にんずう}", short: "{好|す}きな{給食|きゅうしょく}", head: "{給食|きゅうしょく}", items: ["カレーライス", "あげパン", "ハンバーグ", "スパゲッティ", "からあげ"], other: "その{他|た}の{給食|きゅうしょく}", ph: (x) => `${x}が{好|す}きな{人数|にんずう}` }),
    kumi({ title: "{好|す}きな{動物|どうぶつ}べつの{人数|にんずう}", short: "{好|す}きな{動物|どうぶつ}", head: "{動物|どうぶつ}", items: ["{犬|いぬ}", "ねこ", "うさぎ", "パンダ", "ライオン"], other: "その{他|た}の{動物|どうぶつ}", ph: (x) => `${x}が{好|す}きな{人数|にんずう}` }),
    kumi({ title: "{生|う}まれた{季節|きせつ}べつの{人数|にんずう}", short: "{生|う}まれた{季節|きせつ}", head: "{季節|きせつ}", items: ["{春|はる}", "{夏|なつ}", "{秋|あき}", "{冬|ふゆ}"], natural: true, ph: (x) => `${x}に{生|う}まれた{人数|にんずう}` }),
    kumi({ title: "{好|す}きな{教科|きょうか}べつの{人数|にんずう}", short: "{好|す}きな{教科|きょうか}", head: "{教科|きょうか}", items: ["{国語|こくご}", "{算数|さんすう}", "{理科|りか}", "{社会|しゃかい}", "{音楽|おんがく}", "{体育|たいいく}"], other: "その{他|た}の{教科|きょうか}", ph: (x) => `${x}が{好|す}きな{人数|にんずう}` }),
    kumi({ title: "{好|す}きな{色|いろ}べつの{人数|にんずう}", short: "{好|す}きな{色|いろ}", head: "{色|いろ}", items: ["{赤|あか}", "{青|あお}", "{黄色|きいろ}", "{緑|みどり}", "{白|しろ}"], other: "その{他|た}の{色|いろ}", ph: (x) => `${x}が{好|す}きな{人数|にんずう}` }),
    kumi({ title: "かってみたい{生|い}き{物|もの}べつの{人数|にんずう}", short: "かってみたい{生|い}き{物|もの}", head: "{生|い}き{物|もの}", items: ["{犬|いぬ}", "ねこ", "{金魚|きんぎょ}", "{小鳥|ことり}", "ハムスター"], other: "その{他|た}の{生|い}き{物|もの}", ph: (x) => `${x}をかってみたい{人数|にんずう}` }),
    {
      kind: "month", m: "{人数|にんずう}", u: "{人|にん}", corner: "{月|つき}", total: [15, 30],
      head: "しゅるい", items: ["すりきず", "{切|き}りきず", "{打|だ}ぼく", "ねんざ", "つき{指|ゆび}"], other: OTHER,
      groupsOf: () => ["4{月|がつ}", "5{月|がつ}", "6{月|がつ}"],
      desc: () => "{次|つぎ}の{表|ひょう}は、ほけん{室|しつ}に{来|き}た{人|ひと}のけがのしゅるいを、{月|つき}ごとにまとめたものです。",
      caption: (g) => `けがのしゅるい(${g})`,
      mtitle: "けがのしゅるいべつの{人数|にんずう}(4{月|がつ}〜6{月|がつ})",
      ph: (x) => `${x}のけがをした{人数|にんずう}`,
      cell: (g, x) => `${g}に、${x}のけがをした{人数|にんずう}`,
      row: (x) => `4{月|がつ}から6{月|がつ}までの3か{月|げつ}{間|かん}で、${x}のけがをした{人数|にんずう}`,
      col: (g) => `${g}にけがをした{人数|にんずう}の{合計|ごうけい}`,
      all: "4{月|がつ}から6{月|がつ}までの3か{月|げつ}{間|かん}にけがをした{人数|にんずう}の{合計|ごうけい}"
    },
    {
      kind: "month", m: "こ{数|すう}", u: "こ", corner: "{月|つき}", total: [20, 40],
      head: "しゅるい", items: ["えんぴつ", "{消|け}しゴム", "ハンカチ", "ぼうし", "{水|すい}とう"], other: "その{他|た}の{落|お}とし{物|もの}", otherRow: OTHER,
      groupsOf: () => ["9{月|がつ}", "10{月|がつ}", "11{月|がつ}"],
      desc: () => "{次|つぎ}の{表|ひょう}は、{学校|がっこう}で{見|み}つかった{落|お}とし{物|もの}のしゅるいを、{月|つき}ごとにまとめたものです。",
      caption: (g) => `{落|お}とし{物|もの}のこ{数|すう}(${g})`,
      mtitle: "{落|お}とし{物|もの}のしゅるいべつのこ{数|すう}(9{月|がつ}〜11{月|がつ})",
      cell: (g, x) => `${g}に{見|み}つかった${x}のこ{数|すう}`,
      row: (x) => `9{月|がつ}から11{月|がつ}までの3か{月|げつ}{間|かん}に{見|み}つかった${x}のこ{数|すう}`,
      col: (g) => `${g}に{見|み}つかった{落|お}とし{物|もの}のこ{数|すう}の{合計|ごうけい}`,
      all: "3か{月|げつ}{間|かん}に{見|み}つかった{落|お}とし{物|もの}のこ{数|すう}の{合計|ごうけい}"
    },
    {
      kind: "day", m: "{台数|だいすう}", u: "{台|だい}", corner: "{曜日|ようび}", total: [40, 70],
      head: "{乗|の}り{物|もの}", items: ["{乗用車|じょうようしゃ}", "トラック", "バス", "オートバイ", "{自転車|じてんしゃ}"], other: "その{他|た}の{乗|の}り{物|もの}", otherRow: OTHER,
      groupsOf: () => DAYS,
      desc: () => "{次|つぎ}の{表|ひょう}は、{学校|がっこう}の{前|まえ}を10{分間|ぷんかん}に{通|とお}った{乗|の}り{物|もの}の{台数|だいすう}を、{曜日|ようび}ごとにまとめたものです。",
      caption: (g) => `{通|とお}った{乗|の}り{物|もの}(${g})`,
      mtitle: "{学校|がっこう}の{前|まえ}を{通|とお}った{乗|の}り{物|もの}の{台数|だいすう}(10{分間|ぷんかん})",
      cell: (g, x) => `${g}に{通|とお}った${x}の{台数|だいすう}`,
      row: (x) => `{月曜日|げつようび}から{水曜日|すいようび}までの3{日間|にちかん}に{通|とお}った${x}の{台数|だいすう}`,
      col: (g) => `${g}に{通|とお}った{乗|の}り{物|もの}の{台数|だいすう}の{合計|ごうけい}`,
      all: "3{日間|にちかん}に{通|とお}った{乗|の}り{物|もの}の{台数|だいすう}の{合計|ごうけい}"
    },
    {
      kind: "day", m: "{人数|にんずう}", u: "{人|にん}", corner: "{曜日|ようび}", total: [30, 34], same: true,
      head: "{場所|ばしょ}", items: ["{校庭|こうてい}", "{体育館|たいいくかん}", "{教室|きょうしつ}", "{図書室|としょしつ}", "{中庭|なかにわ}"], other: "その{他|た}の{場所|ばしょ}", otherRow: OTHER,
      groupsOf: () => DAYS,
      desc: () => "{次|つぎ}の{表|ひょう}は、3{年|ねん}1{組|くみ}の{人|ひと}が{昼休|ひるやす}みに{遊|あそ}んだ{場所|ばしょ}を、{曜日|ようび}ごとにまとめたものです。",
      caption: (g) => `{遊|あそ}んだ{場所|ばしょ}(${g})`,
      mtitle: "{昼休|ひるやす}みに{遊|あそ}んだ{場所|ばしょ}べつの{人数|にんずう}(3{年|ねん}1{組|くみ})",
      cell: (g, x) => `${g}に${x}で{遊|あそ}んだ{人数|にんずう}`,
      row: (x) => `3{日間|にちかん}に${x}で{遊|あそ}んだ{人数|にんずう}をあわせた{数|かず}`,
      col: (g) => `${g}に{遊|あそ}んだ{人数|にんずう}の{合計|ごうけい}`,
      all: "3{日間|にちかん}に{遊|あそ}んだ{人数|にんずう}をあわせた{数|かず}"
    }
  ];

  // 合計 tot を k こに分ける(どれも 2 以上、半分以下)
  function split(rng, tot, k) {
    for (let t = 0; t < 400; t++) {
      const cuts = new Set();
      while (cuts.size < k - 1) cuts.add(rng.int(1, tot - 1));
      const c = [0, ...[...cuts].sort((a, b) => a - b), tot];
      const parts = c.slice(1).map((x, i) => x - c[i]);
      if (Math.min(...parts) >= 2 && Math.max(...parts) <= tot / 2) return parts;
    }
    return null;
  }

  // ===== 図 =====
  const W = 172;
  function drawFigure(th, groups, rows, F, show, marks, keyed) {
    const nG = groups.length, nR = rows.length;
    const items = [];
    const line = (x1, y1, x2, y2, w = 0.3) => items.push({ t: "line", x1, y1, x2, y2, w, lead: true });
    const text = (s, x, y, size, o = {}) => items.push({ t: "text", s: String(s), x, y, size, halo: false, ...o });
    const labels = [...rows, "{合計|ごうけい}"];
    // --- 元の表 ---
    const gap = nG === 4 ? 4 : 6, tw = (W - gap * (nG - 1)) / nG, lw = tw * 0.56, rh = 7.4, capY = 5.2, top0 = 7.2;
    for (let g = 0; g < nG; g++) {
      const x0 = g * (tw + gap);
      const cap = th.caption(groups[g]);
      text(cap, x0 + tw / 2, capY, fitFs(cap, 3.3, tw));
      const nRows = nR + 2, bottom = top0 + nRows * rh;
      for (let r = 0; r <= nRows; r++) line(x0, top0 + r * rh, x0 + tw, top0 + r * rh, r === 0 || r === nRows ? 0.35 : 0.25);
      for (const x of [x0, x0 + lw, x0 + tw]) line(x, top0, x, bottom, x === x0 + lw ? 0.25 : 0.35);
      items.push({ t: "poly", pts: [[x0, top0], [x0 + tw, top0], [x0 + tw, top0 + rh], [x0, top0 + rh]], fill: "#ebebeb", w: 0, lead: true });
      const hd = `${th.m}(${th.u})`;
      const cy = (r) => top0 + r * rh + rh / 2;
      text(th.head, x0 + lw / 2, cy(0) + 1.2, fitFs(th.head, 3.2, lw - 1.5));
      text(hd, x0 + lw + (tw - lw) / 2, cy(0) + 1.2, fitFs(hd, 3.2, tw - lw - 1.5));
      labels.forEach((lab, r) => {
        text(lab, x0 + lw / 2, cy(r + 1) + 1.25, fitFs(lab, 3.5, lw - 1.5));
        text(F[r][g], x0 + lw + (tw - lw) / 2, cy(r + 1) + 1.3, 3.8);
      });
    }
    // ふちどりの下に色がかくれないように、色ぬりは最初に
    items.sort((a, b) => (a.t === "poly" ? 0 : 1) - (b.t === "poly" ? 0 : 1));
    const srcBottom = top0 + (nR + 2) * rh;
    // --- 矢印 ---
    const aTop = srcBottom + 2, aBot = srcBottom + 10;
    const mlw = 30, cw = nG === 4 ? 23 : 25, MW = mlw + cw * (nG + 1), mx = (W - MW) / 2;
    for (let g = 0; g < nG; g++) {
      const sx = g * (tw + gap) + tw / 2, ex = W / 2 + (g - (nG - 1) / 2) * 12;
      line(sx, aTop, ex, aBot, 0.35);
      const ang = Math.atan2(aBot - aTop, ex - sx), L = 2.4;
      for (const s of [-1, 1]) line(ex, aBot, ex - L * Math.cos(ang + s * 0.5), aBot - L * Math.sin(ang + s * 0.5), 0.35);
    }
    // --- まとめる表 ---
    const tY = aBot + 7.5;
    text(th.mtitle, W / 2, tY, fitFs(th.mtitle, 3.8, MW - 16));
    text(`(${th.u})`, mx + MW, tY, 3.4, { anchor: "end" });
    const top = tY + 2.5, hh = 10, mrh = 9.4, nRows = nR + 1, bottom = top + hh + nRows * mrh;
    items.push({ t: "poly", pts: [[mx + mlw, top], [mx + MW, top], [mx + MW, top + hh], [mx + mlw, top + hh]], fill: "#ebebeb", w: 0, lead: true });
    line(mx, top, mx + MW, top, 0.4);
    for (let r = 0; r <= nRows; r++) line(mx, top + hh + r * mrh, mx + MW, top + hh + r * mrh, r === nRows ? 0.4 : 0.3);
    line(mx, top, mx, bottom, 0.4);
    for (let c = 0; c <= nG + 1; c++) line(mx + mlw + c * cw, top, mx + mlw + c * cw, bottom, c === nG + 1 ? 0.4 : 0.3);
    line(mx, top, mx + mlw, top + hh, 0.25);
    text(th.corner, mx + mlw - 1.4, top + 3.9, 3.0, { anchor: "end" });
    text(th.head, mx + 1.4, top + hh - 1.3, fitFs(th.head, 3.0, mlw * 0.55), { anchor: "start" });
    [...groups, "{合計|ごうけい}"].forEach((g, c) => text(g, mx + mlw + c * cw + cw / 2, top + hh / 2 + 1.6, fitFs(g, 4.2, cw - 2)));
    labels.forEach((lab, r) => {
      const cy = top + hh + r * mrh + mrh / 2;
      text(lab, mx + mlw / 2, cy + 1.5, fitFs(lab, 4.2, mlw - 2.5));
      for (let c = 0; c <= nG; c++) {
        const cx = mx + mlw + c * cw + cw / 2, mk = marks.find((m) => m.r === r && m.c === c);
        if (mk) {
          const ccx = mx + mlw + c * cw + 4;
          items.push({ t: "circle", cx: ccx, cy, r: 2.7, w: 0.35, lead: true });
          text(mk.mark, ccx, cy + 1.25, 3.5);
        }
        if (show[r][c]) text(F[r][c], cx, cy + 1.8, 5);
        else if (keyed) text(F[r][c], cx + (mk ? 1.5 : 0), cy + 1.8, 5, { color: KEY, bold: true });
      }
    });
    return { type: "draw", w: W, h: bottom + 1, scaleK: 1, items };
  }

  const ALL_KINDS = ["row", "col", "grand", "cell"];
  const mergeTables = {
    id: "g3.mergeTables",
    grade: 3,
    instruction: null,
    defaults: { items: 3, pre: 7, kinds: "basic", four: 0 },
    levels: {
      basic: { items: 3, pre: 7, kinds: "basic", four: 0 },
      normal: { items: 4, pre: 5, kinds: "any", four: 0 },
      challenge: { items: 4, pre: 3, kinds: "any", four: 0.4 }
    },
    generate(rng, p) {
      for (let t = 0; t < 300; t++) {
        const ti = rng.int(0, THEMES.length - 1), th = THEMES[ti];
        const nG = th.kind === "kumi" && rng.chance(p.four) ? 4 : 3;
        const groups = th.groupsOf(nG);
        const named = th.natural ? th.items.slice() : rng.shuffle(th.items).slice(0, p.items);
        const rows = th.natural ? named : [...named, th.otherRow || OTHER];
        const nR = rows.length;
        const same = th.same ? rng.int(th.total[0], th.total[1]) : 0;
        const cols = groups.map(() => split(rng, same || rng.int(th.total[0], th.total[1]), nR));
        if (cols.some((c) => !c)) continue;
        const F = rows.map((_, r) => cols.map((c) => c[r]));
        F.forEach((row) => row.push(row.reduce((a, b) => a + b, 0)));
        const tot = groups.map((_, g) => cols[g].reduce((a, b) => a + b, 0));
        F.push([...tot, tot.reduce((a, b) => a + b, 0)]);
        // ア・イの場所
        const kinds = p.kinds === "basic" ? rng.shuffle(["row", "col"]) : rng.shuffle(ALL_KINDS).slice(0, 2);
        const posOf = (k) => k === "row" ? { r: rng.int(0, nR - 1), c: nG } : k === "col" ? { r: nR, c: rng.int(0, nG - 1) } : k === "grand" ? { r: nR, c: nG } : { r: rng.int(0, nR - 1), c: rng.int(0, nG - 1) };
        const marks = kinds.map((k, i) => ({ kind: k, ...posOf(k), mark: ["ア", "イ"][i] }));
        if (marks[0].r === marks[1].r && marks[0].c === marks[1].c) continue;
        // はじめから書いてある数(合計の行から2つ、のこりは中から)
        const isMark = (r, c) => marks.some((m) => m.r === r && m.c === c);
        const inner = [], totRow = [];
        for (let r = 0; r < nR; r++) for (let c = 0; c < nG; c++) if (!isMark(r, c)) inner.push([r, c]);
        for (let c = 0; c < nG; c++) if (!isMark(nR, c)) totRow.push([nR, c]);
        const pre = [...rng.shuffle(totRow).slice(0, 2), ...rng.shuffle(inner).slice(0, p.pre - 2)];
        const show = F.map((row, r) => row.map((_, c) => pre.some(([a, b]) => a === r && b === c)));
        const nameOf = (r) => r < named.length ? named[r] : th.other || OTHER;
        const meaning = (m) => m.kind === "row" ? th.row(nameOf(m.r)) : m.kind === "col" ? th.col(groups[m.c]) : m.kind === "grand" ? th.all : th.cell(groups[m.c], nameOf(m.r));
        const ans = marks.map((m) => `${m.mark} ${meaning(m)}(${F[m.r][m.c]}${th.u})`);
        return {
          key: `mt:${ti}:${rows.join("/")}:${F.flat().join(",")}:${marks.map((m) => `${m.r}${m.c}`).join(",")}:${pre.map((x) => x.join("")).sort().join(",")}`,
          softKey: `t${ti}`,
          text: `${th.desc(groups)}${NUM[nG]}の{表|ひょう}を1つの{表|ひょう}に{整理|せいり}します。[[br]](1) {表|ひょう}の{空|くう}らんをうめましょう。[[br]](2) {表|ひょう}のア、イに{入|はい}る{数|かず}は、それぞれ{何|なに}を{表|あらわ}していますか。`,
          figure: drawFigure(th, groups, rows, F, show, marks, false),
          answer: { display: `(1) {下|した}の{表|ひょう}　${ans.join("　")}`, value: F, figure: drawFigure(th, groups, rows, F, show, marks, true) },
          workspace: { type: "lines", labels: ["ア", "イ"] },
          meta: { ti, nG, rows, named, marks: marks.map(({ kind, r, c }) => ({ kind, r, c })), pre }
        };
      }
      throw new Error("1つの表にまとめる問題が作れない");
    },
    verify(pr, p) {
      const F = pr.answer.value, { ti, nG, rows, named, marks, pre } = pr.meta, th = THEMES[ti], nR = rows.length;
      if (F.length !== nR + 1 || F.some((r) => r.length !== nG + 1)) return "表の大きさが違う";
      for (let r = 0; r <= nR; r++) if (F[r].slice(0, nG).reduce((a, b) => a + b, 0) !== F[r][nG]) return "よこの合計が合わない";
      for (let c = 0; c <= nG; c++) if (F.slice(0, nR).reduce((a, row) => a + row[c], 0) !== F[nR][c]) return "たての合計が合わない";
      if (F.slice(0, nR).some((row) => row.slice(0, nG).some((x) => x < 2))) return "1以下の数がある";
      for (let c = 0; c < nG; c++) if (F[nR][c] < th.total[0] || F[nR][c] > th.total[1]) return "合計が範囲外";
      if (th.same && new Set(F[nR].slice(0, nG)).size !== 1) return "毎日の人数がちがう";
      if (!th.natural && named.length !== p.items) return "項目の数が違う";
      if (nG === 4 && (!p.four || th.kind !== "kumi")) return "4つの表になっている";
      if (marks.length !== 2 || marks[0].r === marks[1].r && marks[0].c === marks[1].c) return "ア・イの場所が重なる";
      if (p.kinds === "basic" && marks.map((m) => m.kind).sort().join() !== "col,row") return "ア・イの種類が違う";
      for (const m of marks) {
        const ok = m.kind === "row" ? m.c === nG && m.r < nR : m.kind === "col" ? m.r === nR && m.c < nG : m.kind === "grand" ? m.r === nR && m.c === nG : m.r < nR && m.c < nG;
        if (!ok) return "ア・イの場所が種類と合わない";
        if (pre.some(([r, c]) => r === m.r && c === m.c)) return "ア・イのところに数が書いてある";
      }
      if (pre.length !== p.pre) return "はじめから書いてある数の数が違う";
      // 答えの図に、空らんの数だけオレンジの数がある
      const keyed = pr.answer.figure.items.filter((it) => it.t === "text" && it.color);
      if (keyed.length !== (nR + 1) * (nG + 1) - pre.length) return "答えの数が足りない";
      for (const [i, m] of marks.entries()) if (!pr.answer.display.includes(`(${F[m.r][m.c]}${th.u})`) || !pr.answer.display.includes(["ア ", "イ "][i])) return "ア・イの答えが合わない";
      return null;
    }
  };
  return [mergeTables];
})();
