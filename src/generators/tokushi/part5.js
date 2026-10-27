// ===== くらしの数学 Ⅳ 生活を豊かに・Ⅴ 将来の生活に向けて =====
(() => {
  const { BX, K, plain, fun, md, nin, tm, dur, NAMES, sum, comma, SA, lv, P, hasAns, T, rect, abox, line, round, table, draw, htable } = kurashiLib;
  const pickAsk = (rng, p, ctx) => Number.isInteger(ctx?.index) ? p.asks[ctx.index % p.asks.length] : rng.pick(p.asks);
  const tmA = (t) => `${Math.floor(t / 60) % 24}{時|じ}${t % 60 ? `${t % 60}${fun(t % 60)}` : ""}`;

  // ----- 1か月の小遣いを小分けにする -----
  const kAllowance = {
    id: "t.kAllowance",
    instruction: null,
    defaults: { mode: "third" },
    levels: lv({ mode: "third" }, { mode: "both" }, { mode: "week" }),
    generate(rng, p) {
      if (p.mode === "week") {
        const per = rng.int(10, 40) * 10, w = rng.pick([4, 5]);
        const total = per * 7 * w + rng.int(0, 9) * 100;
        const rest = total - per * 7 * w;
        return P({ key: `kal:w:${total}:${per}`, text: `1か月の小遣いが${total}円あります。1日に${per}円ずつ使うと、${w}週間(${w * 7}日)で何円使いますか。また、何円残りますか。`, labels: ["使う金額", "残る金額"], ans: `{使|つか}う{金額|きんがく} ${per * 7 * w}円　{残|のこ}る{金額|きんがく} ${rest}円`, meta: { total, per, w } });
      }
      const ten = rng.int(10, 40) * 100, total = ten * 3;
      if (p.mode === "third") return P({ key: `kal:t:${total}`, text: `毎月${total}円の小遣いをもらいます。1か月を30日として、10日ずつ3つに分けて使うことにします。10日間で何円使えますか。`, lines: true, ans: SA(`${total}÷3＝${ten}`, `${ten}円`), meta: { total, ten } });
      return P({ key: `kal:b:${total}`, text: `毎月${total}円の小遣いをもらいます。1か月を30日として、10日ずつ3つに分けて使うことにします。[[br]]10日間で${BX(24)}円使えます。1日あたりでは${BX(20)}円使えます。`, ans: `${ten}　${ten / 10}`, noBox: true, meta: { total, ten } });
    },
    verify(pr) {
      const m = pr.meta;
      if (m.w) return hasAns(pr, `${m.per * 7 * m.w}円`, `${m.total - m.per * 7 * m.w}円`);
      return m.total / 3 === m.ten && Number.isInteger(m.ten / 10) ? hasAns(pr, m.ten) : "小分けが合わない";
    }
  };

  // ----- 欲しい物を買っていく -----
  const WANTS = [["ゲームソフト", 2480, 5980], ["本", 600, 1500], ["ランチ", 800, 1500], ["映画", 1200, 1900], ["Tシャツ", 1290, 2490], ["イヤホン", 980, 2980], ["マンガ本", 480, 700], ["カラオケ", 600, 1200]];
  const kWants = {
    id: "t.kWants",
    instruction: null,
    defaults: { n: 2, last: false },
    levels: lv({ n: 2, last: false }, { n: 3, last: false }, { n: 4, last: true }),
    generate(rng, p) {
      for (let t = 0; t < 300; t++) {
        const money = rng.int(30, 80) * 100;
        const its = rng.shuffle(WANTS.slice()).slice(0, p.n).map(([nm, lo, hi]) => [nm, rng.int(lo / 10, hi / 10) * 10]);
        let rest = money;
        const rests = its.map(([, v]) => (rest -= v));
        if (!p.last && rest <= 0) continue;
        if (p.last && (rests[p.n - 2] <= 0 || rest >= 0)) continue;
        const list = its.map(([n, v]) => `${n}(${v}円)`).join("、");
        if (!p.last) return P({ key: `kwn:${money}:${its.flat().join(",")}`, text: `小遣いが${money}円あります。${list}を、この順に買います。全部買うと、残りは何円ですか。`, lines: true, ans: SA(`${money}－${its.map((x) => x[1]).join("－")}＝${rest}`, `${rest}円`), meta: { money, its, val: rest } });
        const last = its[p.n - 1];
        return P({ key: `kwn2:${money}:${its.flat().join(",")}`, text: `小遣いが${money}円あります。${list}を、この順に買おうと思います。お金が足りなくなるのは、どれを買うときですか。また、何円足りませんか。`, labels: ["買えない物", "足りない金額"], ans: `{買|か}えない{物|もの} ${last[0]}　{足|た}りない{金額|きんがく} ${-rest}円`, meta: { money, its, val: rest } });
      }
      throw new Error("欲しい物の問題が作れない");
    },
    verify(pr) {
      const { money, its, val } = pr.meta;
      if (money - sum(its.map((x) => x[1])) !== val) return "残りが合わない";
      return val > 0 ? hasAns(pr, `${val}円`) : hasAns(pr, `${-val}円`, its[its.length - 1][0]);
    }
  };

  // ----- 支出を項目に分ける -----
  const CAT = {
    食費: [["おにぎり", 120, 180], ["ハンバーガー", 300, 450], ["お茶", 130, 160], ["ラーメン", 650, 900], ["パン", 150, 250], ["ジュース", 130, 180]],
    被服費: [["Tシャツ", 990, 1980], ["くつ下", 300, 600], ["帽子", 980, 1980], ["ジャンパー", 2480, 4980], ["パーカー", 1980, 3980]],
    交通費: [["電車の運賃", 160, 420], ["バスの運賃", 180, 260]],
    娯楽費: [["映画", 1200, 1900], ["カラオケ", 600, 1200], ["ボウリング", 600, 900], ["遊園地", 2500, 4800], ["マンガ本", 480, 700]],
    通信費: [["携帯電話代", 2200, 4800]]
  };
  const CATR = { 食費: "{食費|しょくひ}", 被服費: "{被服費|ひふくひ}", 交通費: "{交通費|こうつうひ}", 娯楽費: "{娯楽費|ごらくひ}", 通信費: "{通信費|つうしんひ}" };
  const kCategory = {
    id: "t.kCategory",
    instruction: null,
    defaults: { asks: ["cat"] },
    levels: lv({ asks: ["cat"] }, { asks: ["cat", "most"] }, { asks: ["most", "two"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 300; t++) {
        const cats = Object.keys(CAT);
        const its = [];
        cats.forEach((c) => {
          const n = c === "通信費" ? rng.int(0, 1) : rng.int(1, c === "食費" ? 3 : 2);
          rng.shuffle(CAT[c].slice()).slice(0, n).forEach(([nm, lo, hi]) => its.push({ c, nm, v: rng.int(lo / 10, hi / 10) * 10 }));
        });
        const tot = Object.fromEntries(cats.map((c) => [c, sum(its.filter((x) => x.c === c).map((x) => x.v))]));
        const ask = pickAsk(rng, p, ctx);
        const order = rng.shuffle(its.slice());
        const fig = htable(["使ったもの", "金額(円)", "使ったもの", "金額(円)"], Array.from({ length: Math.ceil(order.length / 2) }, (_, i) => [order[2 * i].nm, order[2 * i].v, order[2 * i + 1]?.nm || "", order[2 * i + 1]?.v || ""]));
        const head = "下の表は、ある月に使ったお金です。支出の項目は、食費(食べ物・飲み物)、被服費(服・くつ・帽子など)、交通費(電車・バス)、娯楽費(遊び・しゅみ)、通信費(電話)です。[[br]]";
        if (ask === "cat") {
          const c = rng.pick(cats.filter((x) => its.filter((y) => y.c === x).length >= 2));
          if (!c) continue;
          const xs = its.filter((y) => y.c === c);
          return P({ key: `kcg:c:${JSON.stringify(order)}:${c}`, text: head + `${CATR[c]}は、合計で何円ですか。`, figure: fig, lines: true, ans: SA(`${xs.map((x) => x.v).join("＋")}＝${tot[c]}`, `${tot[c]}円`), meta: { its, ask, c, val: tot[c] } });
        }
        if (ask === "most") {
          const vals = cats.map((c) => tot[c]);
          if (vals.filter((v) => v === Math.max(...vals)).length !== 1) continue;
          const c = cats[vals.indexOf(Math.max(...vals))];
          return P({ key: `kcg:m:${JSON.stringify(order)}`, text: head + "いちばん多くお金を使った項目は何ですか。また、その合計は何円ですか。", figure: fig, labels: ["項目", "合計"], ans: `{項目|こうもく} ${CATR[c]}　{合計|ごうけい} ${tot[c]}円`, meta: { its, ask, c, val: tot[c] } });
        }
        const [a, b] = rng.shuffle(cats.filter((c) => tot[c] > 0)).slice(0, 2);
        if (!b || tot[a] === tot[b]) continue;
        const [hi, lo] = tot[a] > tot[b] ? [a, b] : [b, a];
        return P({ key: `kcg:2:${JSON.stringify(order)}:${hi}:${lo}`, text: head + `${CATR[hi]}は、${CATR[lo]}より何円多いですか。`, figure: fig, lines: true, ans: SA(`${tot[hi]}－${tot[lo]}＝${tot[hi] - tot[lo]}`, `${tot[hi] - tot[lo]}円`), meta: { its, ask, hi, lo, val: tot[hi] - tot[lo] } });
      }
      throw new Error("支出の項目の問題が作れない");
    },
    verify(pr) {
      const m = pr.meta, T2 = (c) => sum(m.its.filter((x) => x.c === c).map((x) => x.v));
      if (m.ask === "cat") return T2(m.c) === m.val ? hasAns(pr, `${m.val}円`) : "合計が合わない";
      if (m.ask === "most") return Object.keys(CAT).every((c) => c === m.c || T2(c) < T2(m.c)) ? hasAns(pr, m.c, `${m.val}円`) : "いちばん多い項目が合わない";
      return T2(m.hi) - T2(m.lo) === m.val ? hasAns(pr, `${m.val}円`) : "差が合わない";
    }
  };

  // ----- 家計簿(残高) -----
  const LEDGER = [["食費", "ハンバーガー", 340], ["食費", "ラーメン", 780], ["娯楽費", "映画", 1800], ["被服費", "ジャンパー", 2750], ["交通費", "バス代", 230], ["娯楽費", "カラオケ", 900], ["食費", "おにぎり", 150], ["被服費", "Tシャツ", 1200], ["交通費", "電車代", 310], ["娯楽費", "マンガ本", 550]];
  const kLedger = {
    id: "t.kLedger",
    instruction: null,
    defaults: { n: 3, income2: false },
    levels: lv({ n: 3, income2: false }, { n: 4, income2: false }, { n: 5, income2: true }),
    generate(rng, p) {
      for (let t = 0; t < 300; t++) {
        const start = rng.int(30, 80) * 100, m = rng.int(1, 12);
        const outs = rng.shuffle(LEDGER.slice()).slice(0, p.n).map(([c, n, v]) => ({ c, n, v: Math.max(100, v + rng.int(-5, 5) * 10) }));
        const rows = [{ d: 1, c: "", n: "小遣い", inc: start }];
        let d = 1;
        outs.forEach((o) => {
          d += rng.int(1, 5);
          rows.push({ d, c: o.c, n: o.n, out: o.v });
        });
        if (p.income2) {
          const at = rng.int(2, rows.length - 1);
          rows.splice(at, 0, { d: rows[at - 1].d, c: "", n: "お手伝い", inc: rng.int(3, 10) * 100 });
        }
        let bal = 0;
        rows.forEach((r) => (r.bal = bal += (r.inc || 0) - (r.out || 0)));
        if (bal < 0 || rows.some((r) => r.bal < 0)) continue;
        const cells = [["日付", "項目", "ことがら", "収入(円)", "支出(円)", "残高(円)"], ...rows.map((r, i) => [`${m}/${r.d}`, r.c, r.n, r.inc || "", r.out || "", i === 0 ? r.bal : { ans: true }])];
        const tb = table(0.5, 0.5, [18, 22, 36, 26, 26, 28], [8, ...rows.map(() => 9)], cells.map((row, ri) => row.map((c) => typeof c === "object" ? c : { s: c === "" ? "" : K(String(c)), size: ri === 0 ? 3.5 : 4 })), { head: 1 });
        return P({
          key: `kld:${JSON.stringify(rows)}`,
          text: "下の表は、小遣いの使い方を記録した家計簿(小遣い帳)です。残高(残っているお金)を計算して、表の□に書きましょう。",
          figure: draw(157, tb.h + 1, tb.items),
          ans: rows.slice(1).map((r) => r.bal).join("　"),
          noBox: true,
          meta: { rows }
        });
      }
      throw new Error("家計簿の問題が作れない");
    },
    verify(pr) {
      let b = 0;
      const want = pr.meta.rows.map((r) => (b += (r.inc || 0) - (r.out || 0))).slice(1).join("　");
      return pr.answer.display === want ? null : "残高が合わない";
    }
  };

  // ----- 荷物を送る(宅配便) -----
  const FEE = [[60, 940], [80, 1240], [100, 1560], [120, 1890]];
  const DISC = [100, 150, 60];
  const feeOf = (s) => FEE.find(([L]) => s <= L)?.[1];
  const kParcel = {
    id: "t.kParcel",
    instruction: null,
    defaults: { asks: ["size"] },
    levels: lv({ asks: ["table", "size"] }, { asks: ["size", "disc"] }, { asks: ["disc", "two"] }),
    generate(rng, p, ctx) {
      const fig = { type: "multi", items: [htable(["A＋B＋Cの合計", "料金(同じ都道府県へ)"], FEE.map(([L, f]) => [`${L}cm以内`, `${f}円`])), htable(["窓口への持ち込み割引", "割引の金額"], DISC.map((d, i) => [`会社${"①②③"[i]}`, `${d}円`]))] };
      const ask = pickAsk(rng, p, ctx);
      const head = "宅配便の料金表です。箱のたて・よこ・高さ(A・B・C)の合計で料金が決まります。[[br]]";
      const dims = () => {
        for (;;) {
          const a = rng.int(15, 50), b = rng.int(10, 40), c = rng.int(5, 35), s = a + b + c;
          if (s <= 120 && !FEE.some(([L]) => L === s)) return [a, b, c, s];
        }
      };
      if (ask === "table") {
        const s = rng.pick([45, 55, 60, 70, 75, 80, 90, 95, 100, 110, 120]);
        return P({ key: `kpc:t:${s}`, text: head + `同じ都道府県へ送るとき、A＋B＋Cの合計が${s}cmの荷物の料金はいくらですか。`, figure: fig, ans: `${feeOf(s)}円`, meta: { ask, s, val: feeOf(s) } });
      }
      if (ask === "size") {
        const [a, b, c, s] = dims();
        return P({ key: `kpc:s:${a}:${b}:${c}`, text: head + `A＝${a}cm、B＝${b}cm、C＝${c}cmの箱を、同じ都道府県へ送ります。料金はいくらですか。`, figure: fig, lines: true, ans: SA(`${a}＋${b}＋${c}＝${s}(cm)`, `${feeOf(s)}円`), meta: { ask, dims: [a, b, c], val: feeOf(s) } });
      }
      if (ask === "disc") {
        const [a, b, c, s] = dims(), k = rng.int(0, 2), v = feeOf(s) - DISC[k];
        return P({ key: `kpc:d:${a}:${b}:${c}:${k}`, text: head + `A＝${a}cm、B＝${b}cm、C＝${c}cmの箱を、会社${"①②③"[k]}の窓口に持ち込んで、同じ都道府県へ送ります。料金はいくらですか。`, figure: fig, lines: true, ans: SA(`${a}＋${b}＋${c}＝${s}(cm)、${feeOf(s)}－${DISC[k]}＝${v}`, `${v}円`), meta: { ask, dims: [a, b, c], k, val: v } });
      }
      const x = dims(), y = dims(), k = rng.int(0, 2), v = feeOf(x[3]) + feeOf(y[3]) - DISC[k] * 2;
      return P({ key: `kpc:2:${x.join(",")}:${y.join(",")}:${k}`, text: head + `合計${x[3]}cmの箱と、合計${y[3]}cmの箱を、会社${"①②③"[k]}の窓口に持ち込んで、同じ都道府県へ送ります。割引は箱1つごとにあります。料金は全部でいくらですか。`, figure: fig, lines: true, ans: SA(`${feeOf(x[3])}＋${feeOf(y[3])}－${DISC[k]}×2＝${v}`, `${v}円`), meta: { ask, s2: [x[3], y[3]], k, val: v } });
    },
    verify(pr) {
      const m = pr.meta;
      const want = m.ask === "table" ? feeOf(m.s) : m.ask === "size" ? feeOf(sum(m.dims)) : m.ask === "disc" ? feeOf(sum(m.dims)) - DISC[m.k] : feeOf(m.s2[0]) + feeOf(m.s2[1]) - 2 * DISC[m.k];
      return want === m.val ? hasAns(pr, `${want}円`) : "料金が合わない";
    }
  };

  // ----- 電気(契約アンペア) -----
  const AMP = [["エアコン(暖房)", 65], ["エアコン(冷房)", 55], ["冷蔵庫", 25], ["パソコン", 15], ["テレビ", 20], ["掃除機", 100], ["電子レンジ", 150], ["炊飯器", 130], ["アイロン", 140], ["ヘアドライヤー", 120], ["電気ケトル", 130], ["こたつ", 50]];
  const a1 = (n) => n % 10 ? (n / 10).toFixed(1) : String(n / 10);
  const kAmp = {
    id: "t.kAmp",
    instruction: null,
    defaults: { n: 3, judge: false },
    levels: lv({ n: 3, judge: false }, { n: 4, judge: true }, { n: 5, judge: true }),
    generate(rng, p) {
      for (let t = 0; t < 300; t++) {
        const its = rng.shuffle(AMP.slice()).slice(0, p.n);
        if (its.filter((x) => /エアコン/.test(x[0])).length > 1) continue;
        const tot = sum(its.map((x) => x[1]));
        const fig = htable(["電気機器", "アンペアの目安", "電気機器", "アンペアの目安"], Array.from({ length: 6 }, (_, i) => [AMP[i][0], `${a1(AMP[i][1])}A`, AMP[i + 6][0], `${a1(AMP[i + 6][1])}A`]));
        const list = its.map((x) => x[0]).join("と");
        if (!p.judge) return P({ key: `kam:${its.map((x) => x[0]).join(",")}`, text: `契約アンペアは、同時に使える電気の量を表します(アンペアは「A」で表します)。${list}を同時に使うと、全部で何Aになりますか。下の目安の表を見て計算しましょう。`, figure: fig, lines: true, ans: SA(its.map((x) => a1(x[1])).join("＋") + "＝" + a1(tot), `${a1(tot)}A`), meta: { its, tot } });
        const con = rng.pick([20, 30, 40, 50]);
        if (Math.abs(con * 10 - tot) < 5) continue;
        const ok = tot <= con * 10;
        return P({ key: `kam2:${its.map((x) => x[0]).join(",")}:${con}`, text: `${con}Aで契約している家で、${list}を同時に使います。全部で何Aになりますか。また、ブレーカーが落ちずに使えますか。下の目安の表を見て答えましょう。`, figure: fig, labels: ["合計", "使えるか"], ans: `{合計|ごうけい} ${its.map((x) => a1(x[1])).join("＋")}＝${a1(tot)}　${a1(tot)}A　{使|つか}えるか ${ok ? "{使|つか}える" : "{使|つか}えない"}`, meta: { its, tot, con, ok } });
      }
      throw new Error("アンペアの問題が作れない");
    },
    verify(pr) {
      const m = pr.meta;
      if (sum(m.its.map((x) => x[1])) !== m.tot) return "合計が合わない";
      if (m.con && (m.tot <= m.con * 10) !== m.ok) return "使えるかが合わない";
      return hasAns(pr, `${a1(m.tot)}A`);
    }
  };

  // ----- 部屋を借りるときの初期費用 -----
  const kRent = {
    id: "t.kRent",
    instruction: null,
    defaults: { extra: false },
    levels: lv({ extra: false, simple: true }, { extra: false }, { extra: true }),
    generate(rng, p) {
      const rent = rng.int(40, 75) * 1000, shiki = rng.int(1, 2), rei = rng.int(1, 2), chu = rng.pick([0.5, 1]);
      if (p.simple) {
        const n = rng.int(2, 6);
        return P({ key: `krt:s:${rent}:${n}`, text: `家賃が1か月${rent}円の部屋を借りています。${n}か月分の家賃は、合わせていくらですか。`, lines: true, ans: SA(`${rent}×${n}＝${rent * n}`, `${rent * n}円`), meta: { rent, n, val: rent * n } });
      }
      const rows = [["敷金", `家賃の${shiki}か月分`, rent * shiki], ["礼金", `家賃の${rei}か月分`, rent * rei], ["仲介手数料", `家賃の${chu}か月分`, rent * chu], ["前家賃", "家賃の1か月分", rent]];
      if (p.extra) rows.push(["火災保険料", "決まった金額", rng.pick([15000, 18000, 20000])], ["鍵交換代", "決まった金額", rng.pick([11000, 16500, 22000])]);
      const tot = sum(rows.map((r) => r[2]));
      return P({ key: `krt:${rent}:${shiki}:${rei}:${chu}:${p.extra}:${rows.map((r) => r[2]).join(",")}`, text: `家賃が1か月${rent}円のアパートを借ります。入居するときに、下の表のお金(初期費用)がかかります。初期費用は、全部でいくらですか。`, figure: htable(["費用", "金額の決まり"], rows.map((r) => [r[0], r[1]])), lines: true, ans: SA(rows.map((r) => r[2]).join("＋") + "＝" + tot, `${tot}円`), meta: { rent, rows, tot } });
    },
    verify(pr) {
      const m = pr.meta;
      if (m.n) return hasAns(pr, `${m.rent * m.n}円`);
      return sum(m.rows.map((r) => r[2])) === m.tot ? hasAns(pr, `${m.tot}円`) : "初期費用が合わない";
    }
  };

  // ----- 通勤・現場実習の行き方 -----
  const STA = ["みどり駅", "さくら駅", "中央駅", "みなと駅", "ひかり駅", "あおば駅"];
  const kCommute = {
    id: "t.kCommute",
    instruction: null,
    defaults: { asks: ["time", "fare"] },
    levels: lv({ asks: ["time", "fare"] }, { asks: ["time", "round", "margin"] }, { asks: ["days", "margin", "round"] }),
    generate(rng, p, ctx) {
      const [s1, s2] = rng.shuffle(STA.slice()).slice(0, 2);
      const leave = rng.int(85, 100) * 5, by = rng.pick(["徒歩", "自転車"]), m1 = rng.int(1, 3) * 5, tr = rng.int(2, 8) * 5, bus = rng.int(1, 4) * 5;
      const w1 = rng.int(0, 3) * 2 + 1, w2 = rng.int(1, 3) * 2;
      const t1 = leave + m1, t2 = t1 + w1, t3 = t2 + tr, t4 = t3 + w2, t5 = t4 + bus;
      const fT = rng.int(15, 45) * 10, fB = rng.int(16, 30) * 10;
      const fig = htable(["出発地", "出発", "", "到着", "到着地", "手段", "料金"], [["家", tmA(leave), "→", tmA(t1), s1, by, "0円"], [s1, tmA(t2), "→", tmA(t3), s2, "電車", `${fT}円`], [`${s2}前`, tmA(t4), "→", tmA(t5), "実習先", "バス", `${fB}円`]]);
      const ask = pickAsk(rng, p, ctx), one = fT + fB;
      const head = "下の表は、ルート検索アプリで調べた、家から現場実習先までの行き方です。[[br]]";
      if (ask === "time") return P({ key: `kcm:t:${leave}:${m1}:${tr}:${bus}:${w1}:${w2}`, text: head + "家を出てから実習先に着くまで、全部で何分かかりますか。", figure: fig, lines: true, ans: SA(`${tmA(t5)}－${tmA(leave)}＝${t5 - leave}${fun(t5 - leave)}`, `${t5 - leave}${fun(t5 - leave)}`), meta: { ask, leave, t5, val: t5 - leave } });
      if (ask === "fare") return P({ key: `kcm:f:${fT}:${fB}`, text: head + "電車とバスの料金は、片道で合わせていくらですか。", figure: fig, lines: true, ans: SA(`${fT}＋${fB}＝${one}`, `${one}円`), meta: { ask, fT, fB, val: one } });
      if (ask === "round") return P({ key: `kcm:r:${fT}:${fB}`, text: head + "往復すると、交通費はいくらですか。", figure: fig, lines: true, ans: SA(`(${fT}＋${fB})×2＝${one * 2}`, `${one * 2}円`), meta: { ask, fT, fB, val: one * 2 } });
      if (ask === "days") {
        const n = rng.int(3, 10);
        return P({ key: `kcm:d:${fT}:${fB}:${n}`, text: head + `実習は${n}日間です。毎日往復するとき、交通費は全部でいくらですか。`, figure: fig, lines: true, ans: SA(`(${fT}＋${fB})×2×${n}＝${one * 2 * n}`, `${one * 2 * n}円`), meta: { ask, fT, fB, n, val: one * 2 * n } });
      }
      const start = Math.ceil((t5 + rng.int(3, 20)) / 5) * 5;
      return P({ key: `kcm:m:${leave}:${t5}:${start}`, text: head + `実習は${tm(start)}に始まります。実習先には、始まる何分前に着きますか。`, figure: fig, lines: true, ans: SA(`${tmA(start)}－${tmA(t5)}＝${start - t5}${fun(start - t5)}`, `${start - t5}${fun(start - t5)}{前|まえ}`), meta: { ask, start, t5, val: start - t5 } });
    },
    verify(pr) {
      const m = pr.meta;
      const want = m.ask === "time" ? m.t5 - m.leave : m.ask === "fare" ? m.fT + m.fB : m.ask === "round" ? (m.fT + m.fB) * 2 : m.ask === "days" ? (m.fT + m.fB) * 2 * m.n : m.start - m.t5;
      return want === m.val && want > 0 ? hasAns(pr, want) : "通勤の計算が合わない";
    }
  };

  // ----- 作業速度 -----
  const JOBS = [["クッキーの袋づめ", "袋", "ふくろ"], ["アクセサリー作り", "個", "こ"], ["部品の組み立て", "個", "こ"], ["封筒の宛名シール貼り", "枚", "まい"], ["タオルたたみ", "枚", "まい"]];
  const ctr = (j) => `{${j[1]}|${j[2]}}`;
  const kWork = {
    id: "t.kWork",
    instruction: null,
    defaults: { asks: ["time", "count"] },
    levels: lv({ asks: ["time", "count"] }, { asks: ["time", "count", "day", "pay"] }, { asks: ["day", "pay", "need", "two"] }),
    generate(rng, p, ctx) {
      const j = rng.pick(JOBS), c = ctr(j), a = rng.int(2, 6), name = rng.pick(NAMES);
      const ask = pickAsk(rng, p, ctx);
      const head = `${name}さんは、作業所で${j[0]}の仕事をしています。1${c}にかかる時間は、およそ${a}${fun(a)}です。`;
      if (ask === "time") {
        const n = rng.int(3, 15);
        return P({ key: `kwo:t:${a}:${n}:${j[0]}`, text: head + `${n}${c}作るには、およそ何分かかりますか。`, lines: true, ans: SA(`${a}×${n}＝${a * n}`, `${a * n}${fun(a * n)}`), meta: { ask, a, n, val: a * n } });
      }
      if (ask === "count") {
        const n = rng.int(5, 30), m = a * n;
        return P({ key: `kwo:c:${a}:${m}:${j[0]}`, text: head + `${m}${fun(m)}では、およそ何${c}できますか。`, lines: true, ans: SA(`${m}÷${a}＝${n}`, `${n}${c}`), meta: { ask, a, m, val: n } });
      }
      const h = rng.int(4, 7), per = (h * 60) / a;
      if (!Number.isInteger(per)) return this.generate(rng, p, ctx);
      if (ask === "day") return P({ key: `kwo:d:${a}:${h}:${j[0]}`, text: head + `1日に${h}時間(休憩はふくみません)仕事をします。1日でおよそ何${c}できますか。`, lines: true, ans: SA(`${h}×60÷${a}＝${per}`, `${per}${c}`), meta: { ask, a, h, val: per } });
      if (ask === "pay") {
        const yen = rng.pick([20, 30, 40, 50, 60, 80]);
        return P({ key: `kwo:p:${a}:${h}:${yen}:${j[0]}`, text: head + `1日に${h}時間仕事をします。1${c}につき${yen}円の工賃(給料)をもらえます。1日でおよそ何円もらえますか。`, lines: true, ans: SA(`${h}×60÷${a}＝${per}、${yen}×${per}＝${yen * per}`, `${yen * per}円`), meta: { ask, a, h, yen, val: yen * per } });
      }
      if (ask === "need") {
        const b = rng.int(1, a - 1 || 1), goal = (h * 60) / b;
        if (b >= a || !Number.isInteger(goal)) return this.generate(rng, p, ctx);
        return P({ key: `kwo:n:${a}:${h}:${b}:${j[0]}`, text: head + `明日は忙しく、1日${h}時間で${goal}${c}作らなければなりません。1${c}あたり何分で作ればよいですか。`, lines: true, ans: SA(`${h}×60÷${goal}＝${b}`, `${b}${fun(b)}`), meta: { ask, h, goal, val: b } });
      }
      const k = rng.pick([2, 3]), hh = rng.int(2, 4), mine = (hh * 60) / a;
      if (!Number.isInteger(mine)) return this.generate(rng, p, ctx);
      return P({ key: `kwo:2:${a}:${k}:${hh}:${j[0]}`, text: head + `明日は先輩が手伝いに来てくれます。先輩は${name}さんの${k}倍の速さで作ります。2人で${hh}時間働くと、およそ何${c}できますか。`, lines: true, ans: SA(`${hh}×60÷${a}＝${mine}、${mine}＋${mine}×${k}＝${mine * (k + 1)}`, `${mine * (k + 1)}${c}`), meta: { ask, a, k, hh, val: mine * (k + 1) } });
    },
    verify(pr) {
      const m = pr.meta;
      const want = { time: m.a * m.n, count: m.m / m.a, day: m.h * 60 / m.a, pay: m.h * 60 / m.a * m.yen, need: m.h * 60 / m.goal, two: m.hh * 60 / m.a * (m.k + 1) }[m.ask];
      return want === m.val && Number.isInteger(want) ? hasAns(pr, want) : "作業の計算が合わない";
    }
  };

  // ----- 勤務時間 -----
  const kShift = {
    id: "t.kShift",
    instruction: null,
    defaults: { asks: ["hours"] },
    levels: lv({ asks: ["hours", "out"] }, { asks: ["hours", "rate", "out"] }, { asks: ["rate", "flex", "week"] }),
    generate(rng, p, ctx) {
      const ask = pickAsk(rng, p, ctx), name = rng.pick(NAMES);
      const s = rng.int(16, 20) * 30, br = rng.pick([45, 60]), work = rng.int(5, 8) * 60, e = s + work + br;
      const job = rng.pick(["お弁当屋さん", "パン工場", "スーパー", "クリーニング工場", "物流センター"]);
      if (ask === "hours") return P({ key: `ksf:h:${s}:${e}:${br}`, text: `${name}さんは、${job}で働いています。勤務時間は${tm(s, true)}から${tm(e, true)}までで、途中に${br}${fun(br)}の休憩があります。休憩をのぞいて、1日に何時間働いていますか。`, lines: true, ans: SA(`${tmA(e)}－${tmA(s)}－${br}${fun(br)}＝${work / 60}{時間|じかん}`, `${work / 60}{時間|じかん}`), meta: { ask, s, e, br, val: work } });
      if (ask === "out") return P({ key: `ksf:o:${s}:${work}:${br}`, text: `${name}さんは、${job}で働いています。${tm(s, true)}から働き始めて、休憩は${br}${fun(br)}、働く時間は休憩をのぞいて${work / 60}時間です。仕事が終わるのは何時何分ですか。`, lines: true, ans: SA(`${tmA(s)}＋${work / 60}{時間|じかん}＋${br}${fun(br)}＝${tmA(e)}`, tm(e, true)), meta: { ask, s, e, br, val: work } });
      if (ask === "rate") {
        const per = rng.int(10, 30), n = per * work / 60;
        return P({ key: `ksf:r:${work}:${n}`, text: `${name}さんは、${job}で1日に${work / 60}時間(休憩はのぞく)働きます。1日に${n}個の商品を仕上げるには、1時間におよそ何個仕上げればよいですか。`, lines: true, ans: SA(`${n}÷${work / 60}＝${per}`, `${per}{個|こ}`), meta: { ask, n, work, val: per } });
      }
      if (ask === "week") {
        const d = rng.pick([3, 4, 5]);
        return P({ key: `ksf:w:${work}:${d}`, text: `${name}さんは、休憩をのぞいて1日${work / 60}時間、1週間に${d}日働きます。1週間で何時間働きますか。`, lines: true, ans: SA(`${work / 60}×${d}＝${(work / 60) * d}`, `${(work / 60) * d}{時間|じかん}`), meta: { ask, work, d, val: work * d } });
      }
      const st = rng.int(14, 20) * 30, w2 = 7 * 60, b2 = 60;
      return P({ key: `ksf:f:${st}`, text: `ある会社では、1日に7時間働き、1時間の休憩をとれば、朝7時から10時までの間で何時に出社してもかまいません。${tm(st)}に出社すると、何時何分に退社することになりますか。`, lines: true, ans: SA(`${tmA(st)}＋7{時間|じかん}＋1{時間|じかん}＝${tmA(st + w2 + b2)}`, tmA(st + w2 + b2)), meta: { ask, st, val: st + w2 + b2 } });
    },
    verify(pr) {
      const m = pr.meta;
      if (m.ask === "hours" || m.ask === "out") return m.e - m.s - m.br === m.val ? null : "勤務時間が合わない";
      if (m.ask === "rate") return m.n / (m.work / 60) === m.val ? hasAns(pr, `${m.val}個`) : "1時間の個数が合わない";
      if (m.ask === "week") return m.work * m.d === m.val ? null : "1週間の時間が合わない";
      return m.st + 480 === m.val ? null : "退社時刻が合わない";
    }
  };

  // ----- 求人票 -----
  const kJob = {
    id: "t.kJob",
    instruction: null,
    defaults: { asks: ["hours", "days", "year"] },
    levels: lv({ asks: ["hours", "days"] }, { asks: ["hours", "days", "year"] }, { asks: ["year", "month", "days"] }),
    generate(rng, p, ctx) {
      const s = rng.int(16, 19) * 30, br = rng.pick([45, 60]), work = rng.pick([7, 7.5, 8]) * 60, e = s + work + br;
      const pay = rng.int(150, 200) * 1000, hol = rng.pick([105, 110, 115, 120, 125]);
      const co = rng.pick(["〇〇物流株式会社", "〇〇食品株式会社", "〇〇クリーン株式会社", "〇〇製作所"]);
      const fig = htable(["求人票", ""], [["会社名", co], ["就業時間", `${tmA(s)}〜${tmA(e)}(休憩${br}${fun(br)})`], ["基本給", `月額 ${comma(pay)}円`], ["年間休日", `${hol}日`], ["年次有給休暇", "入社6か月後 10日"]]);
      const ask = pickAsk(rng, p, ctx);
      const head = "下の求人票を見て答えましょう。[[br]]";
      const wh = work / 60;
      if (ask === "hours") return P({ key: `kjb:h:${s}:${e}:${br}`, text: head + "休憩をのぞいて、1日に何時間働きますか。", figure: fig, lines: true, ans: SA(`${tmA(e)}－${tmA(s)}－${br}${fun(br)}＝${wh}{時間|じかん}`, `${wh}{時間|じかん}`), meta: { ask, s, e, br, val: work } });
      if (ask === "days") return P({ key: `kjb:d:${hol}`, text: head + "1年を365日とすると、1年間に出勤する日は何日ですか(年次有給休暇は考えません)。", figure: fig, lines: true, ans: SA(`365－${hol}＝${365 - hol}`, `${365 - hol}{日|にち}`), meta: { ask, hol, val: 365 - hol } });
      if (ask === "year") return P({ key: `kjb:y:${pay}`, text: head + "基本給の1年分(12か月分)は何円ですか。", figure: fig, lines: true, ans: SA(`${pay}×12＝${pay * 12}`, `${comma(pay * 12)}円`), meta: { ask, pay, val: pay * 12 } });
      const d = rng.int(19, 22);
      return P({ key: `kjb:m:${s}:${e}:${br}:${d}`, text: head + `ある月に${d}日出勤しました。この月に働いた時間は、休憩をのぞいて全部で何時間ですか。`, figure: fig, lines: true, ans: SA(`${wh}×${d}＝${wh * d}`, `${wh * d}{時間|じかん}`), meta: { ask, s, e, br, d, val: (work * d) / 60 } });
    },
    verify(pr) {
      const m = pr.meta;
      if (m.ask === "hours") return m.e - m.s - m.br === m.val ? null : "時間が合わない";
      if (m.ask === "days") return hasAns(pr, `${365 - m.hol}日`);
      if (m.ask === "year") return hasAns(pr, comma(m.pay * 12));
      return ((m.e - m.s - m.br) * m.d) / 60 === m.val ? hasAns(pr, `${m.val}時間`) : "働いた時間が合わない";
    }
  };

  // ----- 年次有給休暇(1日＝8時間) -----
  const dh = (h) => `${Math.floor(h / 8)}{日|にち}${h % 8 ? `${h % 8}{時間|じかん}` : ""}`;
  const kLeave = {
    id: "t.kLeave",
    instruction: null,
    defaults: { hours: false },
    levels: lv({ hours: false }, { hours: true }, { hours: true, more: true }),
    generate(rng, p) {
      for (let t = 0; t < 200; t++) {
        const start = rng.pick([10, 12, 15, 20]) * 8, n = p.more ? 4 : 3;
        const takes = [];
        let mo = 4, dd = rng.int(5, 25);
        for (let i = 0; i < n; i++) {
          const h = p.hours && rng.chance(0.6) ? rng.int(1, 7) : rng.int(1, 3) * 8;
          takes.push({ m: mo, d: dd, h });
          mo += rng.int(1, 2);
          dd = rng.int(1, 28);
        }
        const used = sum(takes.map((x) => x.h)), rest = start - used;
        if (rest <= 0) continue;
        const fig = htable(["取った日", "取った年休"], takes.map((x) => [`${x.m}月${x.d}日`, x.h % 8 ? `${x.h}時間` : `${x.h / 8}日`]));
        return P({ key: `klv:${start}:${JSON.stringify(takes)}`, text: `あやかさんの会社では、1年目は${start / 8}日の年次有給休暇(年休)が取れます。年休は1時間単位でも取れます。勤務時間は1日8時間なので、8時間で1日分と数えます。下の表のように年休を取りました。[[br]]今までに取った年休の合計(累計)と、残っている年休(残日数)を、それぞれ何日何時間かで書きましょう。`, figure: fig, labels: ["累計", "残日数"], ans: `{累計|るいけい} ${dh(used)}　{残日数|ざんにっすう} ${dh(rest)}`, meta: { start, takes, used, rest } });
      }
      throw new Error("年休の問題が作れない");
    },
    verify(pr) {
      const { start, takes, used, rest } = pr.meta;
      return sum(takes.map((x) => x.h)) === used && start - used === rest ? hasAns(pr, plain(dh(used)), plain(dh(rest))) : "年休の計算が合わない";
    }
  };

  // ----- 給与明細 -----
  const SLIP_R = { 勤怠: ["{勤|きん}", "{怠|たい}"], 支給: ["{支|し}", "{給|きゅう}"], 控除: ["{控|こう}", "{除|じょ}"], 合計: ["{合|ごう}", "{計|けい}"] };
  function slipFig(v, hide) {
    const h = (k) => hide === k ? "？" : comma(v[k]);
    const ot = `${Math.floor(v.ot / 60)}:${String(v.ot % 60).padStart(2, "0")}`;
    const secs = [
      ["勤怠", [["出勤日数", "欠勤日数", "有給日数", "残業時間", ""], [v.days, 0, v.paid, ot, ""]]],
      ["支給", [["基本給", "時間外手当", "通勤手当", "住居手当", "総支給額"], [h("base"), h("otPay"), h("commute"), h("house"), h("gross")]]],
      ["控除", [["健康保険", "厚生年金", "雇用保険", "所得税", "住民税"], [comma(v.hi), comma(v.pen), comma(v.emp), comma(v.inc), comma(v.res)], ["", "", "", "", "総控除額"], ["", "", "", "", h("ded")]]],
      ["合計", [["", "", "", "", "差引支給額"], ["", "", "", "", h("net")]]]
    ];
    const items = [T(78, 6, `${v.y}{年|ねん}${v.m}{月|がつ}　{給与明細書|きゅうよめいさいしょ}`, 4.4, { bold: true })];
    let y = 9;
    for (const [label, rows] of secs) {
      const hs = rows.map((_, i) => i % 2 === 0 ? 5.5 : 7.5), H = sum(hs);
      items.push(rect(0.5, y, 9, H, { w: 0.6, fill: "#555" }), ...SLIP_R[label].map((ch, i) => T(5, y + H / 2 + 1.5 + (i - 0.5) * 4.2, ch, 3.6, { color: "#fff", bold: true })));
      const cells = rows.map((r, i) => r.map((c) => ({ s: c === "" ? "" : K(String(c)), size: i % 2 === 0 ? 2.9 : 3.8, ...i % 2 === 0 ? { fill: "#e3e3e3" } : { anchor: "end" } })));
      items.push(...table(9.5, y, [29, 29, 29, 29, 29], hs, cells, { head: 0 }).items);
      y += H + 2;
    }
    return draw(156, y, items);
  }
  const kPayslip = {
    id: "t.kPayslip",
    instruction: null,
    defaults: { asks: ["days", "base", "net"] },
    levels: lv({ asks: ["days", "base", "net"] }, { asks: ["net", "allow", "gross"] }, { asks: ["ot", "net", "gross", "ded"] }),
    generate(rng, p, ctx) {
      const name = rng.pick(NAMES), ask = pickAsk(rng, p, ctx);
      const base = rng.int(150, 190) * 1000, rate = rng.int(130, 180) * 10, otH = rng.pick([60, 90, 120, 150, 180, 240, 300]);
      const otPay = Math.round(rate * otH / 60), commute = rng.int(30, 120) * 100, house = rng.pick([0, 5000, 8000, 10000]);
      const gross = base + otPay + commute + house;
      const hi = Math.round(gross * 0.05 / 10) * 10 + rng.int(0, 9), pen = Math.round(gross * 0.0915), emp = Math.round(gross * 0.006), inc = rng.int(25, 45) * 100 + rng.int(0, 99), res = rng.int(0, 60) * 100;
      const ded = hi + pen + emp + inc + res, net = gross - ded;
      const v = { y: 2026, m: rng.int(1, 12), days: rng.int(18, 22), paid: rng.int(0, 2), ot: otH, base, otPay, commute, house, gross, hi, pen, emp, inc, res, ded, net };
      const hide = { net: "net", gross: "gross", ded: "ded" }[ask];
      const head = `これは、${v.m}月に${name}さんが会社から受け取った給与明細書です。[[br]]`;
      const Q = {
        days: [`${name}さんは、この月に何日出勤しましたか。`, `${v.days}{日|にち}`, false],
        base: [`${name}さんの基本給はいくらですか。`, `${comma(base)}円`, false],
        net: ["実際に受け取れる金額(差引支給額)は、総支給額から総控除額を引いて求めます。差引支給額はいくらですか。", SA(`${comma(gross)}－${comma(ded)}＝${comma(net)}`, `${comma(net)}円`), true],
        gross: ["総支給額は、支給の欄の金額をすべて足して求めます。総支給額はいくらですか。", SA(`${[base, otPay, commute, house].map(comma).join("＋")}＝${comma(gross)}`, `${comma(gross)}円`), true],
        ded: ["総控除額は、控除の欄の金額をすべて足して求めます。総控除額はいくらですか。", SA(`${[hi, pen, emp, inc, res].map(comma).join("＋")}＝${comma(ded)}`, `${comma(ded)}円`), true],
        allow: ["通勤手当と住居手当を合わせると、いくらですか。", SA(`${comma(commute)}＋${comma(house)}＝${comma(commute + house)}`, `${comma(commute + house)}円`), true],
        ot: [`${name}さんは、この月に${Math.floor(otH / 60)}時間${otH % 60 ? `${otH % 60}分` : ""}の残業をしました。残業1時間あたりの時間外手当はいくらですか。`, SA(`${comma(otPay)}÷${otH / 60}＝${comma(rate)}`, `${comma(rate)}円`), true]
      }[ask];
      if (ask === "allow" && !house) return this.generate(rng, p, ctx);
      return P({ key: `kps:${ask}:${JSON.stringify(v)}`, text: head + Q[0], figure: slipFig(v, hide ? hide : null), lines: Q[2], ans: Q[1], meta: { v, ask, rate }, softKey: ask });
    },
    verify(pr) {
      const { v, ask, rate } = pr.meta;
      if (v.base + v.otPay + v.commute + v.house !== v.gross || v.hi + v.pen + v.emp + v.inc + v.res !== v.ded || v.gross - v.ded !== v.net) return "明細の計算が合わない";
      const want = { days: `${v.days}日`, base: comma(v.base), net: comma(v.net), gross: comma(v.gross), ded: comma(v.ded), allow: comma(v.commute + v.house), ot: comma(rate) }[ask];
      if (ask === "ot" && rate * v.ot / 60 !== v.otPay) return "時間外手当が合わない";
      return hasAns(pr, want);
    }
  };

  kurashiGens.push(kAllowance, kWants, kCategory, kLedger, kParcel, kAmp, kRent, kCommute, kWork, kShift, kJob, kLeave, kPayslip);
})();
