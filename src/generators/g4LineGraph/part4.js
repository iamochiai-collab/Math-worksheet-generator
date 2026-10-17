
  // ===== 二次元表 =====
  // A・B の2つのことについて「はい/いいえ」を調べた場面。pa: 行の見出しの助詞、po: 「だけ」のあとの助詞、pm: 「も」の前の助詞
  const YN = [
    { who: "4{年|ねん}1{組|くみ}", A: "{犬|いぬ}", B: "ねこ", pa: "を", po: "を", pm: "", yes: "かっている", no: "かっていない" },
    { who: "4{年|ねん}2{組|くみ}", A: "{自転車|じてんしゃ}", B: "{一輪車|いちりんしゃ}", pa: "に", po: "に", pm: "に", yes: "{乗|の}れる", no: "{乗|の}れない" },
    { who: "4{年生|ねんせい}", A: "{兄|あに}", B: "{姉|あね}", pa: "が", po: "が", pm: "", yes: "いる", no: "いない" },
    { who: "4{年生|ねんせい}", A: "{弟|おとうと}", B: "{妹|いもうと}", pa: "が", po: "が", pm: "", yes: "いる", no: "いない" },
    { who: "4{年|ねん}3{組|くみ}", A: "さか{上|あ}がり", B: "{前回|まえまわ}り", pa: "が", po: "が", pm: "", yes: "できる", no: "できない" },
    { who: "4{年|ねん}1{組|くみ}", A: "{二|に}{重|じゅう}とび", B: "あやとび", pa: "が", po: "が", pm: "", yes: "できる", no: "できない" },
    { who: "4{年|ねん}2{組|くみ}", A: "ピアノ", B: "{水泳|すいえい}", pa: "を", po: "を", pm: "", yes: "{習|なら}っている", no: "{習|なら}っていない" },
    { who: "4{年|ねん}1{組|くみ}", A: "トマト", B: "ピーマン", pa: "が", po: "が", pm: "", yes: "{好|す}き", no: "{好|す}きではない" },
    { who: "4{年|ねん}3{組|くみ}", A: "{算数|さんすう}", B: "{国語|こくご}", pa: "が", po: "が", pm: "", yes: "{好|す}き", no: "{好|す}きではない" },
    { who: "4{年生|ねんせい}", A: "{海|うみ}", B: "{山|やま}", pa: "に", po: "に", pm: "に", yes: "{夏休|なつやす}みに{行|い}った", no: "{夏休|なつやす}みに{行|い}かなかった", yesP: "{夏休|なつやす}みに", yesV: "{行|い}った", noV: "{行|い}かなかった" },
    { who: "4{年|ねん}2{組|くみ}", A: "{金魚|きんぎょ}", B: "カメ", pa: "を", po: "を", pm: "", yes: "かっている", no: "かっていない" },
    { who: "4{年|ねん}1{組|くみ}", A: "サッカー", B: "{野球|やきゅう}", pa: "を", po: "を", pm: "", yes: "したことがある", no: "したことがない" },
    { who: "4{年|ねん}3{組|くみ}", A: "{竹|たけ}うま", B: "{一輪車|いちりんしゃ}", pa: "に", po: "に", pm: "に", yes: "{乗|の}れる", no: "{乗|の}れない" },
    { who: "4{年生|ねんせい}", A: "{家|いえ}のさらあらい", B: "せんたくものたたみ", pa: "を", po: "を", pm: "", yes: "{手伝|てつだ}っている", no: "{手伝|てつだ}っていない" },
    { who: "4{年|ねん}2{組|くみ}", A: "{犬|いぬ}", B: "{小鳥|ことり}", pa: "を", po: "を", pm: "", yes: "かっている", no: "かっていない" },
    { who: "4{年|ねん}1{組|くみ}", A: "{読書|どくしょ}", B: "{外|そと}で{遊|あそ}ぶの", pa: "が", po: "が", pm: "", yes: "{好|す}き", no: "{好|す}きではない" },
    { who: "4{年|ねん}3{組|くみ}", A: "けん{玉|だま}", B: "こま{回|まわ}し", pa: "が", po: "が", pm: "", yes: "できる", no: "できない" },
    { who: "4{年|ねん}2{組|くみ}", A: "{動物園|どうぶつえん}", B: "{水族館|すいぞくかん}", pa: "に", po: "に", pm: "に", yes: "{行|い}ったことがある", no: "{行|い}ったことがない" },
    { who: "4{年生|ねんせい}", A: "{祖父|そふ}", B: "{祖母|そぼ}", pa: "と", po: "と", pm: "と", yes: "いっしょにくらしている", no: "いっしょにくらしていない" },
    { who: "4{年|ねん}1{組|くみ}", A: "カレーライス", B: "ハンバーグ", pa: "が", po: "が", pm: "", yes: "{好|す}き", no: "{好|す}きではない" }
  ];
  // 海・山のように「夏休みに」が前につく場面は、ことばの順を入れかえる
  const ynRow = (s, x, yes) => s.yesP ? `${s.yesP}${x}${s.pa}${yes ? s.yesV : s.noV}` : `${x}${s.pa}${yes ? s.yes : s.no}`;
  const ynHead = (s) => [[ynRow(s, s.A, true), ynRow(s, s.A, false)], [ynRow(s, s.B, true), ynRow(s, s.B, false)]];
  const ynAsk = (s, cell) => {
    const [r, c] = cell, pre = s.yesP || "", yes = s.yesP ? s.yesV : s.yes, no = s.yesP ? s.noV : s.no;
    if (r === 0 && c === 0) return `${pre}${s.A}${s.pm}も${s.B}${s.pm}も${yes}`;
    if (r === 1 && c === 1) return `${pre}${s.A}${s.pm}も${s.B}${s.pm}も${no}`;
    return `${pre}${r === 0 ? s.A : s.B}だけ${s.po}${yes}`;
  };
  function ynTable(s, T3, known) {
    const [rows, cols] = ynHead(s);
    const cell = (r, c) => !known || known[r][c] ? String(T3[r][c]) : "";
    return { type: "table", head: ["", ...cols, "{合計|ごうけい}"], rows: [[rows[0], cell(0, 0), cell(0, 1), cell(0, 2)], [rows[1], cell(1, 0), cell(1, 1), cell(1, 2)], ["{合計|ごうけい}", cell(2, 0), cell(2, 1), cell(2, 2)]] };
  }
  function ynData(rng, lo = 20, hi = 36) {
    for (let t = 0; t < 200; t++) {
      const a = rng.int(3, 12), b = rng.int(3, 12), c = rng.int(3, 12), d = rng.int(2, 10);
      const T3 = [[a, b, a + b], [c, d, c + d], [a + c, b + d, a + b + c + d]];
      if (T3[2][2] >= lo && T3[2][2] <= hi) return T3;
    }
    return null;
  }
  function solvable3(known) {
    const k = known.map((r) => r.slice());
    for (let changed = true; changed; ) {
      changed = false;
      for (let i = 0; i < 3; i++) for (const line of [[[i, 0], [i, 1], [i, 2]], [[0, i], [1, i], [2, i]]]) {
        const u = line.filter(([r, c]) => !k[r][c]);
        if (u.length === 1) {
          k[u[0][0]][u[0][1]] = true;
          changed = true;
        }
      }
    }
    return k.every((r) => r.every(Boolean));
  }
  function checkSums(T3) {
    for (let i = 0; i < 3; i++) if (T3[i][0] + T3[i][1] !== T3[i][2] || T3[0][i] + T3[1][i] !== T3[2][i]) return false;
    return true;
  }
  const ASK_CELLS = [[0, 0], [0, 1], [1, 0], [1, 1]];
  const crossFill = {
    id: "g4.crossFill",
    grade: 4,
    instruction: null,
    defaults: { blanks: 3 },
    levels: { basic: { blanks: 3 }, normal: { blanks: 4 }, challenge: { blanks: 5 } },
    generate(rng, p) {
      for (let t = 0; t < 500; t++) {
        const s = rng.pick(YN), T3 = ynData(rng);
        if (!T3) continue;
        const cells = [];
        for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) cells.push([r, c]);
        const hide = rng.shuffle(cells).slice(0, p.blanks);
        const known = T3.map((row, r) => row.map((_, c) => !hide.some(([x, y]) => x === r && y === c)));
        if (!solvable3(known)) continue;
        const ask = rng.pick(ASK_CELLS);
        const hidden = cells.filter(([r, c]) => !known[r][c]);
        const table = ynTable(s, T3, known);
        return {
          key: `cf:${YN.indexOf(s)}:${T3.flat().join(",")}:${hidden.map((h) => h.join("")).join(",")}:${ask.join("")}`,
          softKey: `s${YN.indexOf(s)}`,
          text: `${s.who}で、${s.A}と${s.B}について{調|しら}べて、{下|した}の{表|ひょう}にまとめました。({単位|たんい}は{人|にん})[[br]](1) {表|ひょう}のあいているところに{数|かず}を{書|か}きましょう。[[br]](2) ${ynAsk(s, ask)}{人|ひと}は{何人|なんにん}ですか。（　　　　）`,
          figure: table,
          answer: { display: `(1) ${hidden.map(([r, c]) => T3[r][c]).join("、")}　(2) ${T3[ask[0]][ask[1]]}{人|にん}`, value: T3, figure: ynTable(s, T3) },
          workspace: { type: "none" },
          meta: { s: YN.indexOf(s), hidden, ask }
        };
      }
      throw new Error("二次元表の問題が作れない");
    },
    verify(pr, p) {
      const T3 = pr.answer.value;
      if (!checkSums(T3)) return "合計が合わない";
      const rows = pr.figure.rows.map((r) => r.slice(1));
      const known = rows.map((r) => r.map((c) => c !== ""));
      for (const [i, r] of rows.entries()) for (const [c, x] of r.entries()) if (x !== "" && Number(x) !== T3[i][c]) return "表の数が違う";
      if (!solvable3(known)) return "あいているところが決まらない";
      if (known.flat().filter((x) => !x).length !== p.blanks) return "空きの数が違う";
      const want = `(1) ${pr.meta.hidden.map(([r, c]) => T3[r][c]).join("、")}　(2) ${T3[pr.meta.ask[0]][pr.meta.ask[1]]}{人|にん}`;
      if (pr.answer.display !== want) return "答えが合わない";
      // 問いのことばと表の場所が合っている
      const s = YN[pr.meta.s], [r, c] = pr.meta.ask;
      const phrase = plain(ynAsk(s, [r, c]));
      if (r !== c && !phrase.includes(plain(r === 0 ? s.A : s.B) + "だけ")) return "問いのことばが違う";
      return null;
    }
  };
  const crossRead = {
    id: "g4.crossRead",
    grade: 4,
    instruction: null,
    defaults: { asks: ["cell", "rowTotal"], n: 2 },
    levels: {
      basic: { asks: ["cell", "rowTotal"], n: 2 },
      normal: { asks: ["cell", "rowTotal", "colTotal", "all"], n: 3 },
      challenge: { asks: ["cell", "colTotal", "all", "cmp"], n: 3 }
    },
    generate(rng, p) {
      for (let t = 0; t < 300; t++) {
        const s = rng.pick(YN), T3 = ynData(rng);
        if (!T3) continue;
        const [rows, cols] = ynHead(s);
        const used = new Set();
        const can = {
          cell: () => {
            const c = rng.pick(ASK_CELLS);
            return { q: `${ynAsk(s, c)}{人|ひと}は{何人|なんにん}ですか。`, a: `${T3[c[0]][c[1]]}{人|にん}`, m: { kind: "cell", c } };
          },
          rowTotal: () => ({ q: `${rows[0]}{人|ひと}は、{全部|ぜんぶ}で{何人|なんにん}ですか。`, a: `${T3[0][2]}{人|にん}`, m: { kind: "rowTotal" } }),
          colTotal: () => ({ q: `${cols[1]}{人|ひと}は、{全部|ぜんぶ}で{何人|なんにん}ですか。`, a: `${T3[2][1]}{人|にん}`, m: { kind: "colTotal" } }),
          all: () => ({ q: "{調|しら}べた{人|ひと}は、{全部|ぜんぶ}で{何人|なんにん}ですか。", a: `${T3[2][2]}{人|にん}`, m: { kind: "all" } }),
          cmp: () => T3[0][2] === T3[2][0] ? null : { q: `${rows[0]}{人|ひと}と、${cols[0]}{人|ひと}では、どちらが{何人|なんにん}{多|おお}いですか。`, a: `${T3[0][2] > T3[2][0] ? rows[0] : cols[0]}{人|ひと}が${Math.abs(T3[0][2] - T3[2][0])}{人|にん}{多|おお}い`, m: { kind: "cmp" } }
        };
        const asks = [];
        for (const k of ["cell", ...rng.shuffle(p.asks.filter((x) => x !== "cell"))]) {
          if (asks.length >= p.n || used.has(k)) continue;
          const a = can[k]();
          if (a) {
            asks.push(a);
            used.add(k);
          }
        }
        if (asks.length < p.n) continue;
        return {
          key: `cr:${YN.indexOf(s)}:${T3.flat().join(",")}:${asks.map((a) => JSON.stringify(a.m)).join("|")}`,
          softKey: `s${YN.indexOf(s)}`,
          text: `{下|した}の{表|ひょう}は、${s.who}で、${s.A}と${s.B}について{調|しら}べたものです。({単位|たんい}は{人|にん})[[br]]${numberQs(asks.map((a) => a.q)).join("[[br]]")}`,
          figure: ynTable(s, T3),
          answer: { display: asks.map((a, i) => `(${i + 1}) ${a.a}`).join("　"), value: T3 },
          workspace: linesWs(asks.length),
          meta: { s: YN.indexOf(s), asks: asks.map((a) => a.m) }
        };
      }
      throw new Error("二次元表を読む問題が作れない");
    },
    verify(pr) {
      const s = YN[pr.meta.s], [rows, cols] = ynHead(s);
      const T3 = pr.figure.rows.map((r) => r.slice(1).map(Number));
      if (!checkSums(T3)) return "合計が合わない";
      const parts = pr.answer.display.split("　").map((x) => x.replace(/^\(\d+\) /, ""));
      for (const [n, m] of pr.meta.asks.entries()) {
        let want;
        if (m.kind === "cell") want = `${T3[m.c[0]][m.c[1]]}{人|にん}`;
        if (m.kind === "rowTotal") want = `${T3[0][2]}{人|にん}`;
        if (m.kind === "colTotal") want = `${T3[2][1]}{人|にん}`;
        if (m.kind === "all") want = `${T3[2][2]}{人|にん}`;
        if (m.kind === "cmp") want = `${T3[0][2] > T3[2][0] ? rows[0] : cols[0]}{人|ひと}が${Math.abs(T3[0][2] - T3[2][0])}{人|にん}{多|おお}い`;
        if (parts[n] !== want) return `答えが合わない(${m.kind})`;
      }
      return null;
    }
  };
  // ○×の記録を二次元表に整理する
  const crossTally = {
    id: "g4.crossTally",
    grade: 4,
    instruction: null,
    defaults: { n: 12 },
    levels: { basic: { n: 12 }, normal: { n: 16 }, challenge: { n: 20 } },
    generate(rng, p) {
      for (let t = 0; t < 300; t++) {
        const s = rng.pick(YN);
        const recs = Array.from({ length: p.n }, () => [rng.chance(0.55), rng.chance(0.5)]);
        const T3 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
        for (const [a, b] of recs) T3[a ? 0 : 1][b ? 0 : 1]++;
        for (let i = 0; i < 2; i++) {
          T3[i][2] = T3[i][0] + T3[i][1];
          T3[2][i] = T3[0][i] + T3[1][i];
        }
        T3[2][2] = p.n;
        if ([T3[0][0], T3[0][1], T3[1][0], T3[1][1]].some((x) => x === 0)) continue;
        const ask = rng.pick(ASK_CELLS);
        const half = Math.ceil(p.n / 2);
        const mark = (x) => x ? "○" : "×";
        const recRows = Array.from({ length: half }, (_, r) => [0, 1].flatMap((g) => {
          const i = r + g * half, a = recs[i];
          return a ? [String(i + 1), mark(a[0]), mark(a[1])] : ["", "", ""];
        }));
        const recTable = { type: "table", head: [0, 1].flatMap(() => ["{番号|ばんごう}", s.A, s.B]), rows: recRows };
        const yes = s.yesP ? `${s.yesP}${s.yesV}` : s.yes, no = s.yesP ? `${s.yesP}${s.noV}` : s.no;
        return {
          key: `ctl:${YN.indexOf(s)}:${recs.map(([a, b]) => +a * 2 + +b).join("")}:${ask.join("")}`,
          softKey: `s${YN.indexOf(s)}`,
          text: `{次|つぎ}の{表|ひょう}は、${s.who}の${p.n}{人|にん}に、${s.A}と${s.B}について{聞|き}いた{結果|けっか}です。○は「${yes}」、×は「${no}」を{表|あらわ}しています。[[br]](1) {人数|にんずう}を、その{下|した}の{表|ひょう}に{整理|せいり}しましょう。[[br]](2) ${ynAsk(s, ask)}{人|ひと}は{何人|なんにん}ですか。（　　　　）`,
          figure: { type: "multi", items: [recTable, ynTable(s, T3, [[false, false, false], [false, false, false], [false, false, false]])] },
          answer: { display: `(1) {下|した}の{表|ひょう}　(2) ${T3[ask[0]][ask[1]]}{人|にん}`, value: T3, figure: ynTable(s, T3) },
          workspace: { type: "none" },
          meta: { s: YN.indexOf(s), ask }
        };
      }
      throw new Error("○×の記録を整理する問題が作れない");
    },
    verify(pr, p) {
      const rows = pr.figure.items[0].rows, recs = [];
      for (let g = 0; g < 2; g++) for (const r of rows) if (r[g * 3]) recs.push([r[g * 3 + 1] === "○", r[g * 3 + 2] === "○"]);
      if (recs.length !== p.n) return "記録の数が違う";
      const T3 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
      for (const [a, b] of recs) {
        T3[a ? 0 : 1][b ? 0 : 1]++;
        T3[a ? 0 : 1][2]++;
        T3[2][b ? 0 : 1]++;
        T3[2][2]++;
      }
      const ans = pr.answer.figure.rows.map((r) => r.slice(1).map(Number));
      if (ans.flat().join() !== T3.flat().join()) return "答えの表が記録と合わない";
      if (pr.figure.items[1].rows.some((r) => r.slice(1).some((c) => c !== ""))) return "問題の表に数が入っている";
      if (!pr.answer.display.endsWith(`${T3[pr.meta.ask[0]][pr.meta.ask[1]]}{人|にん}`)) return "答えが合わない";
      return null;
    }
  };
  // 2つの観点で記録を分類・整理する
  const CLASSIFY = [
    { intro: "けがをした{人|ひと}の{記録|きろく}", hA: "{場所|ばしょ}", hB: "{種類|しゅるい}", A: ["{教室|きょうしつ}", "ろうか", "{校庭|こうてい}", "{体育館|たいいくかん}"], B: ["すりきず", "{切|き}りきず", "{打|だ}ぼく", "ねんざ"], ask: "どこで、どんなけがをした{人|ひと}がいちばん{多|おお}いですか。（　　　　　で　　　　　　）", fmt: (a, b) => `${a}で${b}`, unit: "{人|にん}", what: "けがをした{人|ひと}" },
    { intro: "{学校|がっこう}の{落|お}とし{物|もの}の{記録|きろく}", hA: "{場所|ばしょ}", hB: "{品物|しなもの}", A: ["{教室|きょうしつ}", "ろうか", "{体育館|たいいくかん}", "{校庭|こうてい}"], B: ["えんぴつ", "{消|け}しゴム", "ハンカチ", "ぼうし"], ask: "どこで、{何|なに}の{落|お}とし{物|もの}がいちばん{多|おお}いですか。（　　　　　で　　　　　）", fmt: (a, b) => `${a}で${b}`, unit: "こ", what: "{落|お}とし{物|もの}" },
    { intro: "{図書室|としょしつ}で{借|か}りられた{本|ほん}の{記録|きろく}", hA: "{学年|がくねん}", hB: "{本|ほん}の{種類|しゅるい}", A: ["3{年|ねん}", "4{年|ねん}", "5{年|ねん}", "6{年|ねん}"], B: ["{物語|ものがたり}", "{図|ず}かん", "{伝記|でんき}", "{詩|し}の{本|ほん}"], ask: "どの{学年|がくねん}で、どの{種類|しゅるい}の{本|ほん}がいちばん{多|おお}く{借|か}りられましたか。（　　　　の　　　　　）", fmt: (a, b) => `${a}の${b}`, unit: "{冊|さつ}", what: "{借|か}りられた{本|ほん}" },
    { intro: "{休|やす}み{時間|じかん}にしていた{遊|あそ}びの{記録|きろく}", hA: "{組|くみ}", hB: "{遊|あそ}び", A: ["1{組|くみ}", "2{組|くみ}", "3{組|くみ}", "4{組|くみ}"], B: ["ドッジボール", "おにごっこ", "なわとび", "サッカー"], ask: "どの{組|くみ}の、どの{遊|あそ}びをしていた{人|ひと}がいちばん{多|おお}いですか。（　　　　の　　　　　　）", fmt: (a, b) => `${a}の${b}`, unit: "{人|にん}", what: "{遊|あそ}んでいた{人|ひと}" },
    { intro: "{学校|がっこう}で{見|み}つけた{生|い}き{物|もの}の{記録|きろく}", hA: "{場所|ばしょ}", hB: "{生|い}き{物|もの}", A: ["{花|か}だん", "{池|いけ}", "{校庭|こうてい}", "{畑|はたけ}"], B: ["チョウ", "バッタ", "ダンゴムシ", "トンボ"], ask: "どこで、{何|なに}をいちばん{多|おお}く{見|み}つけましたか。（　　　　で　　　　　）", fmt: (a, b) => `${a}で${b}`, unit: "ひき", what: "{見|み}つけた{生|い}き{物|もの}" },
    { intro: "けがをした{人|ひと}の{記録|きろく}", hA: "{時間|じかん}", hB: "{種類|しゅるい}", A: ["{休|やす}み{時間|じかん}", "{体育|たいいく}", "{放課後|ほうかご}", "そうじ"], B: ["すりきず", "{切|き}りきず", "{打|だ}ぼく", "ねんざ"], ask: "いつ、どんなけがをした{人|ひと}がいちばん{多|おお}いですか。（　　　　　に　　　　　）", fmt: (a, b) => `${a}に${b}`, unit: "{人|にん}", what: "けがをした{人|ひと}" },
    { intro: "{好|す}きな{給食|きゅうしょく}のアンケートの{記録|きろく}", hA: "{学年|がくねん}", hB: "メニュー", A: ["1{年|ねん}", "2{年|ねん}", "3{年|ねん}", "4{年|ねん}"], B: ["カレーライス", "あげパン", "ラーメン", "やきそば"], ask: "どの{学年|がくねん}で、どのメニューが{好|す}きな{人|ひと}がいちばん{多|おお}いですか。（　　　　の　　　　　　）", fmt: (a, b) => `${a}の${b}`, unit: "{人|にん}", what: "{答|こた}えた{人|ひと}" }
  ];
  const classifyMore = {
    id: "g4.classifyMore",
    grade: 4,
    instruction: null,
    defaults: { n: 12, a: 3, b: 3, total: false },
    levels: { basic: { n: 12, a: 3, b: 3, total: false }, normal: { n: 15, a: 4, b: 3, total: false }, challenge: { n: 18, a: 4, b: 4, total: true } },
    generate(rng, p) {
      for (let t = 0; t < 400; t++) {
        const sc = rng.pick(CLASSIFY), si = CLASSIFY.indexOf(sc);
        const A = sc.A.slice(0, p.a), B = sc.B.slice(0, p.b);
        const recs = Array.from({ length: p.n }, () => [rng.int(0, A.length - 1), rng.int(0, B.length - 1)]);
        const cnt = A.map((_, i) => B.map((_, j) => recs.filter(([x, y]) => x === i && y === j).length));
        const flat = cnt.flat(), max = Math.max(...flat);
        if (flat.filter((x) => x === max).length !== 1) continue;
        const at = flat.indexOf(max), mi = Math.floor(at / B.length), mj = at % B.length;
        const rowSum = cnt.map((r) => r.reduce((s, x) => s + x, 0));
        const rMax = Math.max(...rowSum);
        if (p.total && rowSum.filter((x) => x === rMax).length !== 1) continue;
        const per = Math.ceil(p.n / 3);
        const recRows = Array.from({ length: per }, (_, r) => [0, 1, 2].flatMap((g) => {
          const i = r + g * per, a = recs[i];
          return a ? [String(i + 1), A[a[0]], B[a[1]]] : ["", "", ""];
        }));
        const recTable = { type: "table", head: [0, 1, 2].flatMap(() => ["{番号|ばんごう}", sc.hA, sc.hB]), rows: recRows };
        const head = [`${sc.hA}＼${sc.hB}`, ...B, "{合計|ごうけい}"];
        const sum = { type: "table", head, rows: [...A.map((x) => [x, ...B.map(() => ""), ""]), ["{合計|ごうけい}", ...B.map(() => ""), ""]] };
        const ans = { type: "table", head, rows: [...A.map((x, i) => [x, ...cnt[i].map(String), String(rowSum[i])]), ["{合計|ごうけい}", ...B.map((_, j) => String(cnt.reduce((s, r) => s + r[j], 0))), String(p.n)]] };
        const q3 = p.total ? `[[br]](3) ${sc.what}がいちばん{多|おお}い${sc.hA}はどれですか。また、それは{何|なん}${sc.unit}ですか。（　　　　　　　）` : "";
        return {
          key: `clm:${si}:${recs.map((r) => r.join("")).join(",")}`,
          softKey: `c${si}`,
          text: `{次|つぎ}の{表|ひょう}は、${sc.intro}です。[[br]](1) ${sc.hA}と${sc.hB}で、その{下|した}の{表|ひょう}に{数|かず}を{整理|せいり}しましょう。[[br]](2) ${sc.ask}${q3}`,
          figure: { type: "multi", items: [recTable, sum] },
          answer: { display: `(1) {下|した}の{表|ひょう}　(2) ${sc.fmt(A[mi], B[mj])}${p.total ? `　(3) ${A[rowSum.indexOf(rMax)]}で${rMax}${sc.unit}` : ""}`, value: cnt, figure: ans },
          workspace: { type: "none" },
          meta: { si }
        };
      }
      throw new Error("記録の整理の問題が作れない");
    },
    verify(pr, p) {
      const sc = CLASSIFY[pr.meta.si];
      const rows = pr.figure.items[0].rows, recs = [];
      for (let g = 0; g < 3; g++) for (const r of rows) if (r[g * 3]) recs.push([r[g * 3 + 1], r[g * 3 + 2]]);
      if (recs.length !== p.n) return "記録の数が違う";
      const ans = pr.answer.figure;
      const A = ans.rows.slice(0, -1).map((r) => r[0]), B = ans.head.slice(1, -1);
      const cnt = A.map((a) => B.map((b) => recs.filter(([x, y]) => x === a && y === b).length));
      for (const [i] of A.entries()) for (const [j] of B.entries()) if (String(cnt[i][j]) !== ans.rows[i][j + 1]) return "数が違う";
      const flat = cnt.flat(), max = Math.max(...flat);
      if (flat.filter((x) => x === max).length !== 1) return "いちばん多いものが1つでない";
      const at = flat.indexOf(max);
      const parts = pr.answer.display.split("　");
      if (parts[1] !== `(2) ${sc.fmt(A[Math.floor(at / B.length)], B[at % B.length])}`) return "(2) の答えが合わない";
      if (p.total) {
        const rs = cnt.map((r) => r.reduce((s, x) => s + x, 0)), rm = Math.max(...rs);
        if (parts[2] !== `(3) ${A[rs.indexOf(rm)]}で${rm}${sc.unit}`) return "(3) の答えが合わない";
      }
      return null;
    }
  };

  return [lgRead, lgChange, lgAxis, lgSlope, lgEstimate, lgDraw, lgDrawScale, lgTwo, lgCombo, lgWhich, lgShape, crossFill, crossRead, crossTally, classifyMore];
})();
