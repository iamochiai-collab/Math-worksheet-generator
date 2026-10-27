// ===== くらしの数学:記録シート(自分の記録・自分で調べて書く) =====
// 答えが人によってちがうので、答えのページには「自分で書く」と出す(収納のパズルなどは れい の答え)。
// 種類は "record"(記録シート)。1まいに 1つずつ、その単元の記録シートをぜんぶ出す。
(() => {
  const { K, NAMES, sum, lv, P, T, rect, abox, line, round, table, draw } = kurashiLib;
  const SELF = "{自分|じぶん}の{記録|きろく}を{書|か}きます", SELF2 = "{自分|じぶん}で{調|しら}べて{書|か}きます", SELF3 = "{自分|じぶん}で{考|かんが}えて{書|か}きます";
  const L = lv({}, {}, {});
  // 書くための線(ことば ＿＿＿＿ たんい)
  const wline = (x, y, w, label, unit = "", size = 4) => {
    // ふりがなの漢字は かなで出ることもあるので、長いほう(よみ)で はばを見る
    const len = (t) => [...K(t).replace(/\{([^|{}]+)\|([^{}]*)\}/g, (m, a, b) => b.length > a.length ? b : a)].length;
    const lw = label ? len(label) * size * 0.98 + 3 : 0, uw = unit ? len(unit) * size + 2 : 0;
    const x1 = Math.min(x + lw, x + w - uw - 16);
    return [...label ? [T(x, y, label, size, { anchor: "start" })] : [], line(x1, y + 1.2, x + w - uw, y + 1.2, 0.4), ...unit ? [T(x + w, y, unit, size, { anchor: "end" })] : []];
  };
  // 方眼(グラフ用)
  const gridLines = (x, y, cols, rows, cw, rh, strongEvery = 0) => {
    const it = [];
    for (let i = 0; i <= cols; i++) it.push(line(x + i * cw, y, x + i * cw, y + rows * rh, i === 0 || i === cols ? 0.5 : 0.2));
    for (let j = 0; j <= rows; j++) it.push(line(x, y + j * rh, x + cols * cw, y + j * rh, j === 0 || j === rows || (strongEvery && j % strongEvery === 0) ? 0.45 : 0.18));
    return it;
  };
  const rec = (id, text, figure, ans = SELF, extra = {}) => ({
    id,
    instruction: null,
    defaults: {},
    levels: L,
    generate() {
      const pr = P({ key: `rec:${id}`, text, figure: typeof figure === "function" ? figure() : figure, ans, noBox: true, meta: {} });
      if (extra.answerFigure) pr.answer.figure = extra.answerFigure();
      return pr;
    },
    verify: () => null
  });
  const cellRow = (n, s = "") => Array(n).fill(s);

  // ----- Ⅰ-1 健康的な生活 -----
  const rWeek = rec("t.rWeek", "1週間、毎日の生活を記録しましょう。起きた時刻・寝た時刻・睡眠時間・朝の体温を、下の表に書きます。", () => {
    const tb = table(0.5, 0.5, [36, ...Array(7).fill(19)], [9, 15, 15, 15, 15], [["", ..."月火水木金土日".split("").map((w) => ({ s: `{${w}|${{ 月: "げつ", 火: "か", 水: "すい", 木: "もく", 金: "きん", 土: "ど", 日: "にち" }[w]}}`, size: 4 }))], [{ s: "起きた時刻", size: 3.6 }, ...cellRow(7, ":")], [{ s: "寝た時刻", size: 3.6 }, ...cellRow(7, ":")], [{ s: "睡眠時間", size: 3.6 }, ...cellRow(7, "")], [{ s: "体温(℃)", size: 3.6 }, ...cellRow(7, ".")]], { head: 1, headCol: 1 });
    const y = tb.h + 10;
    return draw(170, y + 24, [...tb.items, T(1, y, "気づいたこと(よく眠れた日、体温が高かった日など)", 3.8, { anchor: "start" }), ...wline(1, y + 10, 168, ""), ...wline(1, y + 20, 168, "")]);
  });
  const BAND_EX = [[0, 6.5, "睡眠", 1], [6.5, 7.5, "ごはん", 0], [7.5, 9, "しゅくだい", 1], [9, 12, "部活動", 0], [12, 13, "ごはん", 1], [13, 16, "ゲーム", 0], [16, 17.5, "さんぽ", 1], [17.5, 18.5, "てつだい", 0], [18.5, 19.5, "ごはん", 1], [19.5, 21, "テレビ", 0], [21, 22, "おふろ", 1], [22, 24, "睡眠", 0]];
  const band = (y, segs, ticks) => {
    const x0 = 4, W = 162, k = W / 24, H = 14, it = [];
    for (const [a, b, s, sh] of segs) {
      it.push(rect(x0 + a * k, y, (b - a) * k, H, { w: 0.3, fill: sh ? "#d6d6d6" : "#f0f0f0" }));
      if (s) {
        const w = (b - a) * k, ch = [...s];
        if (w >= ch.length * 3.6 + 1) it.push(T(x0 + (a + b) / 2 * k, y + H / 2 + 1.3, s, 3.4));
        else ch.forEach((c, i) => it.push(T(x0 + (a + b) / 2 * k, y + 3.6 + i * (H - 3) / Math.max(1, ch.length - 0.4), c, 3, {})));
      }
    }
    for (let h = 0; h <= 24; h++) it.push(line(x0 + h * k, y + H, x0 + h * k, y + H + (h % 6 ? 1.2 : 2.2), 0.3));
    for (const h of ticks) it.push(T(x0 + h * k, y - 1.5, `${h}:00`, 2.9));
    it.push(rect(x0, y, W, H, { w: 0.6 }));
    return it;
  };
  const rHoliday = rec("t.rHoliday", "(例)を見て、自分の休日の過ごし方を、下の帯に書き入れましょう。また、寝た時刻・起きた時刻・睡眠時間を書きましょう。", () => draw(170, 92, [
    T(85, 5, "(例)ある高校生の休日の過ごし方", 3.6), ...band(11, BAND_EX.map((s) => [...s]), [0, 6, 9, 12, 16, 19, 22, 24]),
    T(85, 41, "わたしの休日の過ごし方", 3.8, { bold: true }), ...band(47, [[0, 24, "", 0]], [0, 3, 6, 9, 12, 15, 18, 21, 24]),
    ...[...Array(48).keys()].map((i) => line(4 + (i / 2) * 6.75, 47, 4 + (i / 2) * 6.75, 61, 0.15, { dash: "dot" })),
    ...wline(4, 76, 52, "寝た時刻", ""), ...wline(60, 76, 52, "起きた時刻", ""), ...wline(116, 76, 52, "睡眠時間", ""), T(4, 88, "＊帯の1目もりは30分です。", 3, { anchor: "start" })
  ]));
  const rMenu = rec("t.rMenu", "昨日食べたものを思い出して、カロリーを調べ、表に書きましょう。食品のパッケージやインターネットで調べられます。", () => {
    const tb = table(0.5, 0.5, [28, 100, 41], [9, 26, 26, 26, 18, 12], [["", "食べたもの", "カロリー(kcal)"], [{ s: "朝食" }, "", ""], [{ s: "昼食" }, "", ""], [{ s: "夕食" }, "", ""], [{ s: "おやつ" }, "", ""], [{ s: "合計", bold: true }, { s: "", fill: "#f4f4f4" }, ""]], { head: 1, headCol: 1 });
    return draw(170, tb.h + 22, [...tb.items, T(1, tb.h + 10, "1日の合計は、{約|やく}", 4, { anchor: "start" }), line(38, tb.h + 11, 90, tb.h + 11, 0.4), T(92, tb.h + 10, "kcalでした。", 4, { anchor: "start" })]);
  });

  // ----- Ⅰ-2 身体計測の結果 -----
  const rGrowth = rec("t.rGrowth", "自分の身長と体重を測って表に書き、折れ線グラフに表しましょう。グラフの目もりの数は、自分の記録に合わせて書きます。", () => {
    const tb = table(0.5, 0.5, [30, 28, 28, 28, 28, 28], [9, 12, 12], [["", "4月", "6月", "9月", "12月", "3月"], [{ s: "身長(cm)", size: 3.6 }, ...cellRow(5)], [{ s: "体重(kg)", size: 3.6 }, ...cellRow(5)]], { head: 1, headCol: 1 });
    const gy = tb.h + 12, gx = 22, cw = 26, rh = 3.2;
    const it = [...tb.items, ...gridLines(gx, gy, 5, 40, cw, rh, 5), T(gx - 2, gy - 3, "(cm)", 3, { anchor: "end" }), T(gx + 5 * cw + 2, gy - 3, "(kg)", 3, { anchor: "start" })];
    for (let j = 0; j <= 40; j += 5) it.push(line(gx - 12, gy + j * rh, gx - 2, gy + j * rh, 0.25, { dash: "dot" }), line(gx + 5 * cw + 2, gy + j * rh, gx + 5 * cw + 12, gy + j * rh, 0.25, { dash: "dot" }));
    ["4月", "6月", "9月", "12月", "3月"].forEach((m, i) => it.push(T(gx + (i + 0.5) * cw, gy + 40 * rh + 5, m, 3.4)));
    it.push(T(1, gy + 40 * rh + 12, "＊身長は ━━(実線)、体重は - - -(点線)でかきましょう。", 3.2, { anchor: "start" }));
    return draw(170, gy + 40 * rh + 15, it);
  });

  // ----- Ⅰ-3 サイズについて知ろう -----
  const SZ_M = [["S", "80〜88", "68〜76"], ["M", "88〜96", "76〜84"], ["L", "96〜104", "84〜94"], ["LL", "104〜112", "94〜104"], ["3L", "112〜120", "104〜114"]];
  const SZ_W = [["S", "72〜80", "58〜64"], ["M", "79〜87", "64〜70"], ["L", "86〜94", "69〜77"], ["LL", "93〜101", "77〜85"], ["3L", "100〜108", "85〜93"]];
  const rSize = rec("t.rSize", "自分の胸囲(チェスト・バスト)とウエストを測りましょう。下のサイズ表で、自分に合うところを○で囲み、自分のサイズを書きましょう。", () => {
    const head = [["サイズ", "チェスト", "ウエスト", "サイズ", "バスト", "ウエスト"]];
    const tb = table(0.5, 22, [20, 32, 32, 20, 32, 32], [9, 12, 12, 12, 12, 12], [...head, ...SZ_M.map((r, i) => [...r, ...SZ_W[i]])], { head: 1 });
    const cap = [T(42.5, 19, "メンズ(男性用)", 3.6, { bold: true }), T(126.5, 19, "レディース(女性用)", 3.6, { bold: true })];
    return draw(170, 22 + tb.h + 26, [...wline(1, 8, 80, "胸囲", "cm"), ...wline(88, 8, 80, "ウエスト", "cm"), T(169, 14, "(単位:cm)", 3, { anchor: "end" }), ...cap, ...tb.items, ...wline(60, 22 + tb.h + 14, 108, "自分のサイズは", "です。"), T(1, 22 + tb.h + 22, "＊JIS(日本の規格)のサイズ表をもとにしています。お店によって少しちがうことがあります。", 2.9, { anchor: "start" })]);
  });

  // ----- Ⅰ-4 スポーツテスト -----
  const rSport = rec("t.rSport", "スポーツテストで、自分の記録を測って表に書きましょう。2回測るものは、よいほうの記録に○をつけます。", () => {
    const rows = [["ハンドボール投げ", "m", "m"], ["立ち幅跳び", "m　　cm", "m　　cm"], ["50m走", "秒", ""], ["握力(右)", "kg", "kg"], ["握力(左)", "kg", "kg"], ["上体起こし", "回", ""], ["反復横とび", "点", "点"], ["持久走・シャトルラン", "", ""]];
    const tb = table(0.5, 0.5, [52, 40, 40, 37], [9, ...Array(rows.length).fill(14)], [["種目", "1回目", "2回目", "前の記録"], ...rows.map(([n, a, b]) => [{ s: n, size: 3.6 }, { s: a, anchor: "end", size: 3.4 }, { s: b, anchor: "end", size: 3.4 }, ""])], { head: 1, headCol: 1 });
    return draw(170, tb.h + 26, [...tb.items, T(1, tb.h + 10, "前の記録とくらべて、のびた種目", 3.8, { anchor: "start" }), ...wline(1, tb.h + 21, 168, "")]);
  });

  // ----- Ⅱ-1 天気予報 -----
  const rWeather = rec("t.rWeather", "自分の住んでいる地域の、今週の天気予報を調べて、表に書きましょう。また、明日の持ち物や服装を考えましょう。", () => {
    const tb = table(0.5, 0.5, [30, ...Array(7).fill(20)], [9, 9, 16, 11, 11, 11], [["", ...cellRow(7, "　月　日")].map((x) => x ? { s: x, size: 3 } : ""), [{ s: "曜日", size: 3.6 }, ...cellRow(7)], [{ s: "天気", size: 3.6 }, ...cellRow(7)], [{ s: "最高気温(℃)", size: 3.2 }, ...cellRow(7)], [{ s: "最低気温(℃)", size: 3.2 }, ...cellRow(7)], [{ s: "降水確率(%)", size: 3.2 }, ...cellRow(7)]], { head: 1, headCol: 1 });
    const y = tb.h + 12;
    return draw(170, y + 42, [...tb.items, ...wline(1, y, 168, "明日の持ち物:"), ...wline(1, y + 12, 168, "明日の服装:"), ...wline(1, y + 24, 168, "そう考えた理由:"), ...wline(1, y + 36, 168, "")]);
  });

  // ----- Ⅱ-2 季節と気温 -----
  const rEvent = rec("t.rEvent", "自分が住んでいる地域の行事(イベント)を調べて、表に書きましょう。", () => {
    const tb = table(0.5, 0.5, [32, 50, 87], [9, 15, ...Array(5).fill(22)], [["日にち", "行事(イベント)", "内容"], [{ s: "(例)8月15日", size: 3.4 }, { s: "川原の花火大会", size: 3.6 }, { s: "夜7時から川原で花火が上がる。\n屋台も出て、家族や友達と見に行く。", size: 3.2, anchor: "start" }], ...Array(5).fill(cellRow(3))], { head: 1 });
    return draw(170, tb.h + 2, tb.items);
  }, SELF2);
  const rTemp = rec("t.rTemp", "校庭の日なたで、1時間ごとに気温を測って表に書きましょう。また、折れ線グラフに表しましょう。", () => {
    const tb = table(0.5, 0.5, [30, ...Array(7).fill(19.8)], [9, 13], [["時刻(時)", "9", "10", "11", "12", "13", "14", "15"], [{ s: "気温(℃)", size: 3.6 }, ...cellRow(7)]], { head: 1, headCol: 1 });
    const gy = tb.h + 12, gx = 18, cw = 21, rh = 4.2, it = [...tb.items, ...gridLines(gx, gy, 7, 35, cw, rh, 5), T(gx - 3, gy - 3, "(℃)", 3, { anchor: "end" })];
    for (let j = 0; j <= 35; j += 5) it.push(T(gx - 2, gy + (35 - j) * rh + 1.2, j, 3.2, { anchor: "end" }));
    for (let i = 0; i < 7; i++) it.push(T(gx + (i + 0.5) * cw, gy + 35 * rh + 5, 9 + i, 3.4));
    it.push(T(gx + 3.5 * cw, gy + 35 * rh + 11, "時刻(時)", 3.4));
    return draw(170, gy + 35 * rh + 13, it);
  });

  // ----- Ⅱ-3 買い物をしよう -----
  const rNetShop = rec("t.rNetShop", "インターネットで買い物をするとしたら、どんなものを買ってみたいですか。値段や送料、届く日も調べて、表に書きましょう。", () => {
    const tb = table(0.5, 0.5, [64, 32, 32, 41], [9, ...Array(6).fill(17), 12], [["買ってみたいもの", "値段", "送料", "届くまでの日数"], ...Array(6).fill([{ s: "" }, { s: "円", anchor: "end" }, { s: "円", anchor: "end" }, { s: "日", anchor: "end" }]), [{ s: "合計", bold: true }, { s: "円", anchor: "end" }, { s: "円", anchor: "end" }, { s: "", fill: "#f4f4f4" }]], { head: 1 });
    return draw(170, tb.h + 2, tb.items);
  }, SELF2);
  const rNetCare = rec("t.rNetCare", "インターネットで買い物をするときに、気をつけなければならないことを考えて、書きましょう。友達とも話し合ってみましょう。", () => draw(170, 120, [
    round(0.5, 0.5, 169, 119, 3, { w: 0.5 }), T(5, 9, "気をつけること", 4, { anchor: "start", bold: true }), ...[0, 1, 2, 3, 4, 5, 6, 7].flatMap((i) => [T(5, 24 + i * 12.5, "・", 4, { anchor: "start" }), line(10, 25 + i * 12.5, 164, 25 + i * 12.5, 0.3, { dash: "dot" })])
  ]), "({例|れい}){信頼|しんらい}できるお{店|みせ}か{確|たし}かめる/{値段|ねだん}と{送料|そうりょう}・{届|とど}く{日|ひ}を{確|たし}かめる/{個人情報|こじんじょうほう}やパスワードを{守|まも}る/{買|か}いすぎない");

  // ----- Ⅱ-5 週の予定・年間の予定 -----
  const rCalendar = rec("t.rCalendar", "今月のカレンダー(手帳)を作って、自分の予定を書き入れましょう。日にちも自分で書きます。", () => {
    const head = ["日", "月", "火", "水", "木", "金", "土"].map((w) => ({ s: `{${w}|${{ 日: "にち", 月: "げつ", 火: "か", 水: "すい", 木: "もく", 金: "きん", 土: "ど" }[w]}}`, size: 4 }));
    const tb = table(0.5, 14, Array(7).fill(24), [8, ...Array(6).fill(22)], [head, ...Array(6).fill(cellRow(7))], { head: 1 });
    const y = 14 + tb.h + 10;
    return draw(170, y + 26, [line(2, 10, 20, 10, 0.4), T(22, 9, "年", 4.4, { anchor: "start" }), line(30, 10, 44, 10, 0.4), T(46, 9, "月", 4.4, { anchor: "start" }), ...tb.items, T(1, y, "今月、いちばん楽しみな予定", 3.8, { anchor: "start" }), ...wline(1, y + 12, 168, ""), T(1, y + 22, "＊仕事・学校・遊び・病院など、いろいろな予定を書いてみよう。", 3.2, { anchor: "start" })]);
  });

  // ----- Ⅲ-1 遊びに行こう -----
  const rTrip = rec("t.rTrip", "行きたい場所(目的地)を決めて、必要なことを調べて書きましょう。インターネット(地図アプリなど)で調べられます。", () => {
    const top = [...wline(1, 7, 168, "目的地:"), ...wline(1, 19, 80, "休館日(休みの日):", "曜日"), T(88, 19, "(第2月曜日などもあるので注意)", 2.9, { anchor: "start" }), ...wline(1, 31, 110, "開いている時間(営業時間):", "〜"), ...wline(112, 31, 30, ""), ...wline(1, 43, 80, "料金:", "円"), ...wline(88, 43, 80, "着きたい時刻:", "")];
    const rows = [["家", "", ":", "→", ":", "", ""], ...Array(3).fill(["", "", ":", "→", ":", "", ""]), [{ s: "", fill: "#f4f4f4" }, { s: "", fill: "#f4f4f4" }, { s: "", fill: "#f4f4f4" }, { s: "", fill: "#f4f4f4" }, { s: "合計", bold: true }, { s: "", fill: "#f4f4f4" }, { s: "分", anchor: "end" }]];
    const tb = table(0.5, 52, [26, 22, 21, 8, 21, 40, 31], [10, ...Array(5).fill(13)], [["出発地", "手段", "出発時刻", "", "到着時刻", "到着地", "かかる時間"], ...rows.map((r, i) => i < 4 ? r.map((c, j) => j === 6 ? { s: "分", anchor: "end" } : c) : r)], { head: 1 });
    const y = 52 + tb.h + 11;
    return draw(170, y + 15, [...top, ...tb.items, ...wline(1, y, 168, "家に18時に着くには、目的地を出る時刻は"), T(169, y + 9, "(帰りも同じ時間がかかるとします。)", 3, { anchor: "end" })]);
  }, SELF2);

  // ----- Ⅲ-5 カタログや広告 -----
  const rRoom = rec("t.rRoom", "部屋に、どのように、どのくらいの大きさの家具や電化製品を置いたらよいか、(例)を参考にして、右のマスにかいてみましょう。1マスは50cm×50cmです。", () => {
    const c = 7, ex = [[0, 0, 2, 2, "冷蔵庫"], [2, 0, 5, 1.4, "キッチン"], [4, 2.6, 2.6, 2, "ダイニング"], [2, 6, 4.5, 1.8, "ソファ"], [2.6, 8.6, 3, 1.4, "テーブル"], [0, 10.4, 3, 1.6, "パソコン机"], [4, 10.6, 3, 1.4, "テレビ台"]];
    const it = [T(1, 5, "(例)", 3.6, { anchor: "start" }), ...gridLines(1, 8, 7, 12, c, c)];
    for (const [x, y, w, h, s] of ex) it.push(rect(1 + x * c, 8 + y * c, w * c, h * c, { w: 0.5, fill: "#d0d0d0" }), T(1 + (x + w / 2) * c, 8 + (y + h / 2) * c + 1.2, s, 2.6));
    it.push(...gridLines(62, 8, 9, 15, 12, 12));
    return draw(172, 8 + 15 * 12 + 2, it);
  }, SELF3);

  // ----- Ⅲ-6 物を整理して収納しよう(パズル。答えは れい) -----
  const BLK = [["ア", 4, 5, 0, 0], ["イ", 4, 3, 0, 5], ["ウ", 4, 4, 4, 0], ["エ", 4, 2, 4, 4], ["オ", 2, 2, 4, 6], ["カ", 2, 2, 6, 6]];
  const blockPic = (x, y, w, h, s, cell = 3.6) => {
    const it = [rect(x, y, w * cell, h * cell, { w: 0.5, fill: "#e4e4e4" })];
    for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) it.push({ t: "circle", cx: x + (i + 0.5) * cell, cy: y + (j + 0.5) * cell, r: cell * 0.3, w: 0.25, fill: "white" });
    return it;
  };
  const boxGrid = (filled) => {
    const x0 = 37, y0 = 44, c = 12, it = [];
    for (const [s, w, h, x, y] of BLK) if (filled || s === "ア") {
      it.push(rect(x0 + x * c, y0 + y * c, w * c, h * c, { w: filled ? 1 : 0.8, fill: s === "ア" ? "#cfcfcf" : "#ececec" }));
      it.push(T(x0 + (x + w / 2) * c, y0 + (y + h / 2) * c + 2.5, s === "ア" && !filled ? "(例)ア" : s, 7, { bold: true, ...filled && s !== "ア" ? { color: "#ef7d00" } : {} }));
    }
    it.push(...gridLines(x0, y0, 8, 8, c, c));
    let x = 4;
    for (const [s, w, h] of BLK) {
      it.push(T(x + w * 1.8, 6, `${w}cm×${h}cm`, 2.8), ...blockPic(x, 9, w, h, s), T(x + w * 1.8, 9 + h * 3.6 + 5, s, 4.4, { bold: true }));
      x += w * 3.6 + 10;
    }
    it.push(T(85, y0 + 8 * c + 7, "1マス＝1cm×1cm(箱の大きさ 8cm×8cm)", 3.2));
    return draw(170, y0 + 8 * c + 10, it);
  };
  const rBlocks = rec("t.rBlocks", "平たい箱に、ア〜カのブロックをすべて収納します。どのように配置したらよいですか。(例)に続けて、マスにそれぞれの枠と記号を書きましょう。ブロックは向きを変えてもかまいません。", () => boxGrid(false), "({例|れい})の{答|こた}え。ほかの{並|なら}べ{方|かた}でも、すき{間|ま}なく{入|はい}っていれば{正解|せいかい}です。", { answerFigure: () => boxGrid(true) });

  // ----- Ⅳ-1 1か月の生活費 -----
  const rWantList = rec("t.rWantList", "自分の欲しい物を、表に書き出してみましょう。今の気持ちと決断は、当てはまるものを○で囲みます。値段は2つのお店でくらべて、買いたいほうを○で囲みましょう。", () => {
    const row = [{ s: "" }, { s: "絶対欲しい\n欲しい", size: 3.3 }, { s: "　　　店　　　　　円\n　　　店　　　　　円", size: 3.3, anchor: "start" }, { s: "買う\n貯金して買う\nあきらめる", size: 3.1 }];
    const tb = table(0.5, 0.5, [40, 30, 62, 37], [11, ...Array(5).fill(22)], [["欲しい物", "今の気持ち", "値段のくらべ", "決断"], ...Array(5).fill(row)], { head: 1 });
    return draw(170, tb.h + 2, tb.items);
  }, SELF3);
  const rWantCalc = rec("t.rWantCalc", "前の表で「絶対欲しい」にした物の値段を書いて、小遣いから順に引いていきましょう。残りのお金がなくなったら買えません。", () => {
    const it = [];
    const rowAt = (y, a, n) => [T(1, y + 9, n, 4.4, { anchor: "start" }), T(18, y + 1, a, 3, {}), rect(8, y + 3, 28, 10, { w: 0.5 }), T(39, y + 10, "円", 3.6, { anchor: "start" }), T(48, y + 10, "−", 5), T(80, y + 1, "(欲しい物)", 3), rect(56, y + 3, 48, 10, { w: 0.9 }), T(107, y + 10, "円", 3.6, { anchor: "start" }), T(116, y + 10, "＝", 5), T(140, y + 1, "(残ったお金)", 3), rect(124, y + 3, 32, 10, { w: 0.5 }), T(159, y + 10, "円", 3.6, { anchor: "start" })];
    ["①", "②", "③", "④", "⑤"].forEach((n, i) => it.push(...rowAt(4 + i * 22, i ? "(残ったお金)" : "(小遣い)", n)));
    return draw(170, 4 + 5 * 22 + 2, it);
  }, SELF3);

  // ----- Ⅳ-2 計画的な支出 -----
  const ILLUST = [["カラオケ", 900], ["おにぎり", 150], ["スマホ代", 2800], ["水族館", 2400], ["ラーメン", 780], ["くつ下", 500], ["バス代", 230], ["電車代", 260], ["パーカー", 3200], ["ジュース", 130], ["Tシャツ", 1500], ["マンガ本", 550]];
  const rPlan = rec("t.rPlan", "小遣い5000円をこえないように、下の中から使いたい物を選んで、表に書きましょう。残高(残っているお金)も計算します。", () => {
    const it = [];
    ILLUST.forEach(([n, v], i) => {
      const x = 0.5 + (i % 6) * 28.2, y = 0.5 + Math.floor(i / 6) * 17;
      it.push(round(x, y, 26.5, 15, 2, { w: 0.4, fill: "#f4f4f4" }), T(x + 13.25, y + 6, n, n.length > 5 ? 2.8 : 3.4), T(x + 13.25, y + 12, `${v}円`, 3.8, { bold: true }));
    });
    const tb = table(0.5, 38, [70, 49, 50], [9, 11, ...Array(7).fill(13)], [["使いたい物", "支出(円)", "残高(円)"], [{ s: "(はじめ)", size: 3.4 }, { s: "", fill: "#f4f4f4" }, "5000"], ...Array(7).fill(cellRow(3))], { head: 1 });
    return draw(170, 38 + tb.h + 2, [...it, ...tb.items]);
  }, SELF3);
  const rLedger = rec("t.rLedger", "自分で使った1週間分のレシートを集めて、小遣い帳に書きましょう。項目は、食費・被服費・交通費・娯楽費・通信費などです。", () => {
    const tb = table(0.5, 0.5, [18, 24, 49, 26, 26, 26], [9, ...Array(14).fill(11.5)], [["日付", "項目", "ことがら(品目)", "収入(円)", "支出(円)", "残高(円)"], ...Array(14).fill(["/", "", "", "", "", ""])], { head: 1, size: 3.6 });
    return draw(170, tb.h + 2, tb.items);
  });

  // ----- Ⅳ-3 荷物を送ろう -----
  const rPost = rec("t.rPost", "郵便や宅配便の料金を調べて書きましょう。郵便の料金は、日本郵便のホームページなどで調べられます(料金は変わることがあります)。", () => draw(170, 118, [
    T(1, 6, "郵便", 4.2, { anchor: "start", bold: true }),
    ...wline(6, 18, 162, "手紙(定形郵便物・50g以内)を送る料金", "円"), ...wline(6, 30, 162, "はがきを送る料金", "円"), ...wline(6, 42, 162, "速達にするときに足す料金(250gまで)", "円"),
    T(1, 58, "宅配便(近くのお店やコンビニで調べよう)", 4.2, { anchor: "start", bold: true }), ...wline(6, 70, 162, "会社の名前:"),
    ...wline(6, 82, 162, "60サイズ(A+B+Cが60cmまで)を同じ都道府県へ送る料金", "円"), ...wline(6, 94, 162, "窓口に持ち込むときの割引", "円"), ...wline(6, 106, 162, "わかったこと:")
  ]), "{自分|じぶん}で{調|しら}べて{書|か}きます(2024{年|ねん}10{月|がつ}の{料金|りょうきん}:{手紙|てがみ}110{円|えん}・はがき85{円|えん}・{速達|そくたつ}は300{円|えん}を{足|た}す)");

  // ----- Ⅳ-4 住居 -----
  const AMPS = [["エアコン(暖房)", "6.5A"], ["エアコン(冷房)", "5.5A"], ["冷蔵庫", "2.5A"], ["パソコン", "1.5A"], ["テレビ", "2A"], ["掃除機", "10A"], ["電子レンジ", "15A"], ["炊飯器", "13A"], ["アイロン", "14A"], ["ヘアドライヤー", "12A"], ["電気ケトル", "13A"], ["こたつ", "5A"]];
  const rAmp = rec("t.rAmp", "家で契約しているアンペアを、電気の「ご使用量のお知らせ」やアプリで調べましょう。また、同時に使いそうな電気機器のアンペアを足して、使えるかどうか確かめましょう。", () => {
    const tb = table(0.5, 16, [52, 32, 52, 32], [8, ...Array(6).fill(8.5)], [["電気機器", "アンペアの目安", "電気機器", "アンペアの目安"], ...[0, 1, 2, 3, 4, 5].map((i) => [AMPS[i][0], AMPS[i][1], AMPS[i + 6][0], AMPS[i + 6][1]].map((s) => ({ s, size: 3.4 })))], { head: 1 });
    const y = 16 + tb.h + 8, it = [...wline(1, 8, 100, "家で契約しているアンペア", "A"), ...tb.items, T(1, y + 2, "★記入欄(電気機器の名前とアンペアを書こう)", 3.8, { anchor: "start", bold: true })];
    for (let i = 0; i < 5; i++) {
      const x = 1 + (i % 3) * 57, yy = y + 8 + Math.floor(i / 3) * 30;
      it.push(rect(x, yy, 46, 10, { w: 0.5 }), T(x + 1.5, yy + 3.5, "(電気機器)", 2.6, { anchor: "start" }), rect(x, yy + 12, 46, 10, { w: 0.5 }), T(x + 44, yy + 19, "A", 3.6, { anchor: "end" }), T(x + 51.5, yy + 13, i === 4 ? "＝" : "＋", 5));
    }
    it.push(rect(120, y + 50, 46, 10, { w: 0.9 }), T(164, y + 57, "A", 3.6, { anchor: "end" }));
    it.push(T(1, y + 74, "使えるか:　使える　・　使えない　(どちらかを○で囲もう)", 4, { anchor: "start" }), T(1, y + 84, "＊合計のアンペアが、家で契約しているアンペアより小さければ使えます。", 3, { anchor: "start" }));
    return draw(170, y + 87, it);
  }, SELF2);

  // ----- Ⅴ-1 現場実習 -----
  const rIntern = rec("t.rIntern", "自分の現場実習先について調べて書きましょう。行き方は、ルート検索アプリを使って調べます。", () => {
    const top = [...wline(1, 7, 168, "実習先:"), ...wline(1, 19, 82, "1日の実習が始まる時刻:"), ...wline(87, 19, 82, "到着しておきたい時刻:")];
    const rows = [["家", ":", "→", ":", "", "", "分", "円"], ...Array(4).fill(["", ":", "→", ":", "", "", "分", "円"])].map((r) => r.map((s, j) => j >= 6 ? { s, anchor: "end" } : s));
    const tb = table(0.5, 28, [26, 19, 7, 19, 30, 18, 22, 28], [10, ...Array(5).fill(13), 12], [["出発地", "出発時刻", "", "到着時刻", "到着地", "手段", "かかる時間", "料金"], ...rows, [{ s: "", fill: "#f4f4f4" }, { s: "", fill: "#f4f4f4" }, { s: "", fill: "#f4f4f4" }, { s: "", fill: "#f4f4f4" }, { s: "", fill: "#f4f4f4" }, { s: "合計", bold: true }, { s: "分", anchor: "end" }, { s: "円", anchor: "end" }]], { head: 1 });
    const y = 28 + tb.h + 11;
    return draw(170, y + 40, [...top, ...tb.items, ...wline(1, y, 168, "往復の交通費", "円"), ...wline(1, y + 12, 168, "実習が5日間のときの交通費", "円"), ...wline(1, y + 24, 168, "家を出る時刻", ""), T(1, y + 34, "＊電車が遅れたときは、実習先に電話で連絡します。電話番号も調べておこう。", 3.2, { anchor: "start" })]);
  }, SELF2);

  // ----- Ⅴ-2 作業速度 -----
  const rFlex = rec("t.rFlex", "ある会社は、1日に7時間働き、1時間の休憩をとるならば、朝7時から10時までの間で、何時に出社してもかまわないという制度があります。もし、あなただったら、何時に出社したいですか。そうしたい理由も書きましょう。", () => draw(170, 112, [
    round(0.5, 0.5, 169, 111, 3, { w: 0.5 }), T(6, 13, "わたしは、", 4.4, { anchor: "start" }), line(30, 14, 52, 14, 0.4), T(54, 13, "時に出社したいです。", 4.4, { anchor: "start" }), T(6, 27, "なぜなら、", 4.4, { anchor: "start" }),
    ...[0, 1, 2, 3, 4, 5].map((i) => line(6, 40 + i * 12, 164, 40 + i * 12, 0.3, { dash: "dot" })), T(6, 108, "＊その時刻に出社すると、何時に退社することになるかも書いてみよう。", 3.2, { anchor: "start" })
  ]), "({例|れい})8{時|じ}に{出社|しゅっしゃ}すると16{時|じ}に{退社|たいしゃ}できる。{朝|あさ}の{電車|でんしゃ}がすいていて、{夕方|ゆうがた}の{時間|じかん}を{使|つか}えるから。");

  kurashiGens.push(rWeek, rHoliday, rMenu, rGrowth, rSize, rSport, rWeather, rEvent, rTemp, rNetShop, rNetCare, rCalendar, rTrip, rRoom, rBlocks, rWantList, rWantCalc, rPlan, rLedger, rPost, rAmp, rIntern, rFlex);
})();
