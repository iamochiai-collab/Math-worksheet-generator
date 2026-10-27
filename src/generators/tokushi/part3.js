// ===== くらしの数学 Ⅱ 毎日の生活(天気・気温・買い物・調理・予定) =====
(() => {
  const { BX, K, plain, fun, md, days, dayOf, nin, hon, hai, NAMES, WD, WDR, WD1, sum, SA, lv, P, hasAns, T, rect, abox, line, round, table, draw, htable } = kurashiLib;
  const pickAsk = (rng, p, ctx) => Number.isInteger(ctx?.index) ? p.asks[ctx.index % p.asks.length] : rng.pick(p.asks);
  const uniqueMax = (a) => a.filter((x) => x === Math.max(...a)).length === 1;
  const uniqueMin = (a) => a.filter((x) => x === Math.min(...a)).length === 1;

  // ----- 週間天気予報 -----
  const WX = [["晴れ", 0, 20], ["くもり", 20, 40], ["雨", 60, 90], ["晴れのち雨", 50, 70], ["くもりのち晴れ", 10, 30], ["雨のちくもり", 50, 70], ["くもりのち雨", 50, 70], ["晴れのちくもり", 10, 30]];
  const SEASON = [[4, 14], [14, 24], [28, 35], [16, 26]];
  const kWeather = {
    id: "t.kWeather",
    instruction: null,
    defaults: { asks: ["low", "rain"] },
    levels: lv({ asks: ["low", "rain", "high"] }, { asks: ["low", "diff", "rain", "cmp"] }, { asks: ["diff", "cmp", "rain"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 400; t++) {
        const [lo, hi] = rng.pick(SEASON);
        const wx = WD.map(() => rng.pick(WX));
        const highs = wx.map(() => rng.int(lo, hi));
        const lows = highs.map((h) => h - rng.int(3, 10));
        const prob = wx.map((w, i) => i === 0 ? null : rng.int(w[1] / 10, w[2] / 10) * 10);
        const ask = pickAsk(rng, p, ctx);
        const diffs = highs.map((h, i) => h - lows[i]);
        const fut = [1, 2, 3, 4, 5, 6];
        let q, ans, val, opt = {};
        if (ask === "low" || ask === "high") {
          const f = ask === "low" ? uniqueMin : uniqueMax;
          if (!f(highs)) continue;
          val = highs.indexOf(ask === "low" ? Math.min(...highs) : Math.max(...highs));
          q = `最高気温がいちばん${ask === "low" ? "低い" : "高い"}のは何曜日ですか。`;
          ans = WDR[val];
        } else if (ask === "diff") {
          if (!uniqueMax(diffs)) continue;
          val = diffs.indexOf(Math.max(...diffs));
          q = `最高気温と最低気温の差がいちばん大きいのは${BX(14)}曜日で、その差は${BX(16)}℃です。□に当てはまる曜日と数を書きましょう。`;
          opt.noBox = true;
          ans = `${WD1[val]}　${diffs[val]}`;
        } else if (ask === "rain") {
          val = fut.filter((i) => prob[i] >= 50).length;
          if (!val) continue;
          q = "今日(月曜日)から土曜日までで、降水確率が50%以上の日は何日ありますか。";
          ans = `${val}{日|にち}`;
        } else {
          const [a, b] = rng.shuffle(fut.slice()).slice(0, 2).sort((x, y) => x - y);
          if (highs[a] === highs[b]) continue;
          val = Math.abs(highs[b] - highs[a]);
          const up = highs[b] > highs[a];
          q = `${WDR[b]}の最高気温は、${WDR[a]}より何℃${up ? "高い" : "低い"}ですか。`;
          ans = SA(`${Math.max(highs[a], highs[b])}－${Math.min(highs[a], highs[b])}＝${val}`, `${val}℃`);
          opt = { lines: true };
          opt.meta2 = { a, b };
        }
        const two = (w) => w.replace(/(のち|時々)/, "\n$1");
        const tb = table(0.5, 0.5, [30, ...Array(7).fill(20)], [7, 13, 8, 8, 8], [["", ...WD1.map((x) => ({ s: x, size: 3.8 }))], [{ s: "天気", size: 3.6 }, ...wx.map((w) => ({ s: two(w[0]), size: 3.2 }))], [{ s: "最高気温(℃)", size: 3.2 }, ...highs.map((x) => ({ s: x, size: 3.8 }))], [{ s: "最低気温(℃)", size: 3.2 }, ...lows.map((x) => ({ s: x, size: 3.8 }))], [{ s: "降水確率(%)", size: 3.2 }, ...prob.map((x) => ({ s: x == null ? "—" : x, size: 3.8 }))]], { head: 1, headCol: 1 });
        const fig = draw(172, tb.h + 1, tb.items);
        return P({
          key: `kw:${ask}:${highs.join(",")}:${lows.join(",")}:${prob.join(",")}`,
          text: "今日は月曜日です。下の表は、スマートフォンで調べた今週の天気予報です。[[br]]" + q,
          figure: fig,
          ans,
          meta: { highs, lows, prob, ask, val, ...opt.meta2 || {} },
          softKey: ask,
          lines: opt.lines,
          noBox: opt.noBox
        });
      }
      throw new Error("天気予報の問題が作れない");
    },
    verify(pr) {
      const { highs, lows, prob, ask, val, a, b } = pr.meta;
      if (ask === "low") return highs[val] === Math.min(...highs) && uniqueMin(highs) ? null : "最低が合わない";
      if (ask === "high") return highs[val] === Math.max(...highs) && uniqueMax(highs) ? null : "最高が合わない";
      if (ask === "diff") {
        const d = highs.map((h, i) => h - lows[i]);
        return d[val] === Math.max(...d) && uniqueMax(d) ? hasAns(pr, d[val]) : "差が合わない";
      }
      if (ask === "rain") return prob.slice(1).filter((x) => x >= 50).length === val ? null : "日数が合わない";
      return Math.abs(highs[b] - highs[a]) === val ? hasAns(pr, `${val}℃`) : "気温の差が合わない";
    }
  };

  // ----- 1日の気温の変わり方 -----
  const h1 = (n) => (n / 2).toFixed(1);
  const kTemp = {
    id: "t.kTemp",
    instruction: null,
    defaults: { asks: ["max", "diff", "rise"] },
    levels: lv({ asks: ["max", "diff"] }, { asks: ["max", "diff", "rise"] }, { asks: ["diff", "rise", "fall"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 400; t++) {
        const peak = rng.int(3, 5), v = [rng.int(16, 44)];
        for (let i = 1; i < 7; i++) v.push(v[i - 1] + (i <= peak ? rng.int(1, 6) : -rng.int(1, 5)));
        const rise = v.slice(1).map((x, i) => x - v[i]);
        const ask = pickAsk(rng, p, ctx);
        if (!uniqueMax(v)) continue;
        if (ask === "rise" && !uniqueMax(rise)) continue;
        if (ask === "fall" && !uniqueMin(rise)) continue;
        let q, ans, val, lines = false;
        if (ask === "max") {
          val = 9 + v.indexOf(Math.max(...v));
          q = "気温がいちばん高かったのは何時ですか。";
          ans = `${val}{時|じ}`;
        } else if (ask === "diff") {
          val = Math.max(...v) - Math.min(...v);
          q = "いちばん高い気温と、いちばん低い気温の差は何℃ですか。";
          ans = SA(`${h1(Math.max(...v))}－${h1(Math.min(...v))}＝${h1(val)}`, `${h1(val)}℃`);
          lines = true;
        } else if (ask === "rise") {
          val = 9 + rise.indexOf(Math.max(...rise));
          q = "1時間で気温がいちばん大きく上がったのは、何時から何時の間ですか。";
          ans = `${val}{時|じ}から${val + 1}{時|じ}`;
        } else {
          val = 9 + rise.indexOf(Math.min(...rise));
          q = "1時間で気温がいちばん大きく下がったのは、何時から何時の間ですか。";
          ans = `${val}{時|じ}から${val + 1}{時|じ}`;
        }
        const fig = htable(["時刻(時)", "9", "10", "11", "12", "13", "14", "15"], [["気温(℃)", ...v.map(h1)]]);
        return P({ key: `kt:${ask}:${v.join(",")}`, text: "下の表は、ある晴れた日に、校庭で1時間ごとに気温を測った記録です。[[br]]" + q, figure: fig, ans, lines, meta: { v, ask, val }, softKey: ask });
      }
      throw new Error("気温の問題が作れない");
    },
    verify(pr) {
      const { v, ask, val } = pr.meta, rise = v.slice(1).map((x, i) => x - v[i]);
      if (ask === "max") return 9 + v.indexOf(Math.max(...v)) === val ? null : "時刻が合わない";
      if (ask === "diff") return hasAns(pr, `${h1(Math.max(...v) - Math.min(...v))}℃`);
      if (ask === "rise") return rise[val - 9] === Math.max(...rise) && uniqueMax(rise) ? null : "上がり方が合わない";
      return rise[val - 9] === Math.min(...rise) && uniqueMin(rise) ? null : "下がり方が合わない";
    }
  };

  // ----- レシート -----
  const FOOD8 = [["おにぎり", 110, 180], ["パン", 100, 260], ["お茶", 100, 160], ["サンドイッチ", 250, 390], ["牛乳", 150, 260], ["ヨーグルト", 100, 180], ["お弁当", 400, 650], ["バナナ", 120, 220]];
  const GOODS10 = [["ノート", 120, 260], ["乾電池", 300, 520], ["ボールペン", 100, 220], ["ティッシュ", 200, 360], ["歯ブラシ", 150, 300], ["洗剤", 250, 460]];
  function receiptFig(rows, v, hide) {
    // v: {sub8, tax8, sub10, tax10, total, pay, change}
    const W = 78, items = [];
    let y = 7;
    items.push(T(W / 2, y, "スーパー〇〇", 5, { bold: true }));
    y += 6;
    items.push(T(4, y, v.date, 3.2, { anchor: "start" }), T(W - 4, y, "{領収書|りょうしゅうしょ}", 3.2, { anchor: "end" }));
    y += 6;
    rows.forEach((r) => {
      items.push(T(5, y, (r.food ? "＊" : "　") + r.name, 3.8, { anchor: "start" }), T(W - 5, y, `¥${r.price}`, 3.8, { anchor: "end" }));
      y += 5.4;
    });
    items.push(line(4, y - 2.6, W - 4, y - 2.6, 0.3, { dash: "dot" }));
    y += 2.4;
    const row = (label, key, size = 3.5, bold = false) => {
      if (hide.includes(key)) {
        items.push(T(5, y, label, size, { anchor: "start", ...bold ? { bold: true } : {} }), T(W - 31, y, "¥", size, { anchor: "end" }), abox(W - 30, y - size - 1.2, 25, size + 3));
        y += size + 3.6;
      } else {
        items.push(T(5, y, label, size, { anchor: "start", ...bold ? { bold: true } : {} }), T(W - 5, y, `¥${v[key]}`, size, { anchor: "end", ...bold ? { bold: true } : {} }));
        y += size + 1.8;
      }
    };
    if (v.sub8) {
      row("小計 8%対象額(税抜)", "sub8", 3.3);
      row("　消費税 8%", "tax8", 3.3);
    }
    if (v.sub10) {
      row("小計 10%対象額(税抜)", "sub10", 3.3);
      row("　消費税 10%", "tax10", 3.3);
    }
    items.push(line(4, y - 2.4, W - 4, y - 2.4, 0.3, { dash: "dot" }));
    y += 3;
    row("{合|ごう}　{計|けい}", "total", 4.4, true);
    row("お預り", "pay", 3.8);
    row("お釣り", "change", 4.2, true);
    items.push(T(5, y, "＊は軽減税率(8%)の品目です。", 2.9, { anchor: "start" }));
    y += 3;
    items.unshift(rect(0.5, 0.5, W - 1, y, { w: 0.5, fill: "white" }));
    return draw(W + 1, y + 1.5, items);
  }
  const kReceipt = {
    id: "t.kReceipt",
    instruction: null,
    defaults: { n: 3, step: 10, hide: [] },
    levels: lv({ n: 3, step: 10, hide: [] }, { n: 4, step: 10, hide: ["total", "change"] }, { n: 5, step: 1, hide: ["tax8", "tax10", "total", "change"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 200; t++) {
        const nf = rng.int(Math.max(1, p.n - 2), p.n - 1);
        const pickItems = (pool, n) => rng.shuffle(pool.slice()).slice(0, n).map(([name, lo, hi]) => ({ name, price: rng.int(Math.ceil(lo / p.step), Math.floor(hi / p.step)) * p.step }));
        const rows = rng.shuffle([...pickItems(FOOD8, nf).map((r) => ({ ...r, food: true })), ...pickItems(GOODS10, p.n - nf)]);
        const sub8 = sum(rows.filter((r) => r.food).map((r) => r.price)), sub10 = sum(rows.filter((r) => !r.food).map((r) => r.price));
        const tax8 = Math.floor(sub8 * 8 / 100), tax10 = Math.floor(sub10 / 10), total = sub8 + tax8 + sub10 + tax10;
        const unit = rng.pick([500, 1000, 1000]), pay = Math.ceil((total + 1) / unit) * unit;
        if (pay <= total) continue;
        const v = { sub8, tax8, sub10, tax10, total, pay, change: pay - total, date: `2026年${rng.int(1, 12)}月${rng.int(1, 28)}日 ${rng.int(9, 20)}:${String(rng.int(0, 59)).padStart(2, "0")}` };
        const fig = receiptFig(rows, v, p.hide);
        if (p.hide.length) {
          return P({
            key: `kr:${rows.map((r) => r.name + r.price).join(",")}:${pay}`,
            text: "買い物をしたときのレシートです。レシートの□に当てはまる金額を書きましょう。消費税は、1円より細かいところを切り捨てます。",
            figure: fig,
            ans: p.hide.map((k) => v[k]).join("　"),
            noBox: true,
            meta: { rows, v, hide: p.hide }
          });
        }
        const asks = ["item", "tax", "total", "pay", "change"];
        const ask = Number.isInteger(ctx?.index) ? asks[ctx.index % asks.length] : rng.pick(asks);
        const it = rng.pick(rows);
        const Q = { item: [`${it.name}はいくらでしたか。`, `${it.price}円`], tax: ["消費税は、合計でいくらでしたか。", SA(`${tax8}＋${tax10}＝${tax8 + tax10}`, `${tax8 + tax10}円`)], total: ["消費税も入れた合計金額は、いくらでしたか。", `${total}円`], pay: ["支払いのとき、いくら出しましたか。", `${pay}円`], change: ["お釣りはいくらでしたか。", `${pay - total}円`] }[ask];
        if (ask === "tax" && (!tax8 || !tax10)) continue;
        return P({ key: `kr:${ask}:${rows.map((r) => r.name + r.price).join(",")}:${pay}:${ask === "item" ? it.name : ""}`, text: "買い物をしたときのレシートです。レシートを見て答えましょう。[[br]]" + Q[0], figure: fig, ans: Q[1], lines: ask === "tax", meta: { rows, v, hide: [], ask, item: it.name }, softKey: ask });
      }
      throw new Error("レシートの問題が作れない");
    },
    verify(pr) {
      const { rows, v, hide, ask, item } = pr.meta;
      const s8 = sum(rows.filter((r) => r.food).map((r) => r.price)), s10 = sum(rows.filter((r) => !r.food).map((r) => r.price));
      const t8 = Math.floor(s8 * 0.08 + 1e-9), t10 = Math.floor(s10 * 0.1 + 1e-9), tot = s8 + s10 + t8 + t10;
      if (t8 !== v.tax8 || t10 !== v.tax10 || tot !== v.total || v.pay - tot !== v.change || v.change <= 0) return "レシートの計算が合わない";
      if (hide.length) return pr.answer.display === hide.map((k) => v[k]).join("　") ? null : "□の答えが合わない";
      if (ask === "item") return hasAns(pr, `${rows.find((r) => r.name === item).price}円`);
      if (ask === "tax") return hasAns(pr, `${t8 + t10}円`);
      return hasAns(pr, `${{ total: tot, pay: v.pay, change: v.change }[ask]}円`);
    }
  };

  // ----- ポイントカード -----
  const kPoint = {
    id: "t.kPoint",
    instruction: null,
    defaults: { asks: ["get"] },
    levels: lv({ asks: ["get"] }, { asks: ["get", "need"] }, { asks: ["odd", "need", "use"] }),
    generate(rng, p, ctx) {
      const rate = rng.pick([1, 2, 3, 5]);
      const ask = pickAsk(rng, p, ctx);
      const head = `100円の買い物をするごとに${rate}ポイントたまるポイントカードがあります。`;
      if (ask === "get") {
        const s = rng.int(5, 60) * 100;
        return P({ key: `kp:g:${rate}:${s}`, text: head + `${s}円の買い物をすると、何ポイントたまりますか。`, lines: true, ans: SA(`${s}÷100×${rate}＝${s / 100 * rate}`, `${s / 100 * rate}ポイント`), meta: { rate, ask, s, val: s / 100 * rate } });
      }
      if (ask === "need") {
        const n = rng.int(10, 80), pt = n * rate;
        return P({ key: `kp:n:${rate}:${pt}`, text: head + `${pt}ポイントためるには、全部でいくらの買い物をすればよいですか。`, lines: true, ans: SA(`${pt}÷${rate}×100＝${n * 100}`, `${n * 100}円`), meta: { rate, ask, pt, val: n * 100 } });
      }
      if (ask === "odd") {
        const s = rng.int(500, 6000);
        if (s % 100 === 0) return this.generate(rng, p, ctx);
        const v = Math.floor(s / 100) * rate;
        return P({ key: `kp:o:${rate}:${s}`, text: head + `100円に足りない分には、ポイントはつきません。${s}円の買い物をすると、何ポイントたまりますか。`, lines: true, ans: SA(`${Math.floor(s / 100)}×${rate}＝${v}`, `${v}ポイント`), meta: { rate, ask, s, val: v } });
      }
      const s = rng.int(8, 60) * 100 + rng.pick([0, 50, 80]), use = rng.int(2, 30) * 10;
      return P({ key: `kp:u:${s}:${use}`, text: `ためたポイントは、1ポイントを1円として使えます。${s}円の買い物で${use}ポイントを使うと、いくら払えばよいですか。`, lines: true, ans: SA(`${s}－${use}＝${s - use}`, `${s - use}円`), meta: { ask, s, use, val: s - use } });
    },
    verify(pr) {
      const m = pr.meta;
      const want = m.ask === "get" ? m.s / 100 * m.rate : m.ask === "need" ? m.pt / m.rate * 100 : m.ask === "odd" ? Math.floor(m.s / 100) * m.rate : m.s - m.use;
      return want === m.val && Number.isInteger(want) ? hasAns(pr, want) : "ポイントが合わない";
    }
  };

  // ----- 分割払い -----
  const kInstall = {
    id: "t.kInstall",
    instruction: null,
    defaults: { ns: [2, 3, 4], total: false },
    levels: lv({ ns: [2, 3, 4, 5], total: false }, { ns: [3, 4, 5, 6, 10, 12], total: false }, { ns: [3, 5, 6, 10, 12], total: true }),
    generate(rng, p) {
      const n = rng.pick(p.ns), per = rng.int(n >= 10 ? 5 : 10, n >= 10 ? 30 : 60) * 100, price = per * n, fee = rng.pick([100, 150, 200, 300]);
      const pay1 = per + fee;
      const head = `${price}円の商品を${n}回の分割払いで買います。手数料は1回あたり${fee}円です。`;
      if (!p.total) return P({ key: `ki:${price}:${n}:${fee}`, text: head + "1回に支払う金額は、手数料を入れていくらですか。", lines: true, ans: SA(`${price}÷${n}＋${fee}＝${pay1}`, `${pay1}円`), meta: { price, n, fee, val: pay1, total: false } });
      return P({ key: `kit:${price}:${n}:${fee}`, text: head + "全部でいくら支払うことになりますか。また、一括(1回)で払うときより何円多くなりますか。", labels: ["全部で", "多くなる金額"], ans: `{全部|ぜんぶ}で ${pay1 * n}円　{多|おお}くなる{金額|きんがく} ${fee * n}円`, meta: { price, n, fee, val: pay1 * n, total: true } });
    },
    verify(pr) {
      const { price, n, fee, val, total } = pr.meta;
      if (price % n) return "わりきれない";
      return total ? (val === (price / n + fee) * n ? hasAns(pr, `${val}円`, `${fee * n}円`) : "合計が合わない") : val === price / n + fee ? hasAns(pr, `${val}円`) : "1回分が合わない";
    }
  };

  // ----- どれが買える(現金・ICカード) -----
  const PAIRS = [["ハンバーグ弁当", "焼き魚弁当", "からあげ弁当", "のり弁当", "幕の内弁当"], ["雑誌", "カレンダー", "まんが", "手帳", "地図"], ["Tシャツ", "くつ下", "帽子", "ハンカチ", "手袋"]];
  const kCanBuy = {
    id: "t.kCanBuy",
    instruction: null,
    defaults: { both: false },
    levels: lv({ both: false }, { both: false }, { both: true }),
    generate(rng, p) {
      for (let t = 0; t < 300; t++) {
        const pool = rng.pick(PAIRS), [a, b] = rng.shuffle(pool.slice()).slice(0, 2);
        const pa = rng.int(30, 160) * 10, pb = rng.int(30, 160) * 10;
        const cash = rng.int(30, 160) * 10, ic = rng.int(50, 300) * 10;
        if (!p.both) {
          if ((pa <= cash) === (pb <= cash) || ic < Math.max(pa, pb)) continue;
          const ok = pa <= cash ? a : b;
          return P({ key: `kb:${a}${pa}:${b}${pb}:${cash}`, text: `お店で、${a}(${pa}円)か${b}(${pb}円)のどちらかを買います。財布には現金が${cash}円、ICカードには${ic}円分入っています。このお店ではキャッシュレス決済が使えませんでした。どちらを買えばよいですか。`, ans: ok, meta: { pa, pb, cash, ok: ok === a ? 0 : 1 } });
        }
        if (pa + pb <= ic) continue;
        const need = pa + pb - ic;
        return P({ key: `kb2:${pa}:${pb}:${ic}`, text: `このお店は現金が使えず、ICカードでしか支払えません。${a}(${pa}円)と${b}(${pb}円)を両方買います。ICカードには${ic}円分入っています。あと何円足りませんか。`, lines: true, ans: SA(`${pa}＋${pb}－${ic}＝${need}`, `${need}円`), meta: { pa, pb, ic, need, both: true } });
      }
      throw new Error("買える物の問題が作れない");
    },
    verify(pr) {
      const m = pr.meta;
      if (m.both) return m.pa + m.pb - m.ic === m.need && m.need > 0 ? hasAns(pr, `${m.need}円`) : "足りない金額が合わない";
      const okA = m.pa <= m.cash, okB = m.pb <= m.cash;
      return okA !== okB && (okA ? 0 : 1) === m.ok ? null : "買える物が合わない";
    }
  };

  // ----- レシピの分量 -----
  const RECIPES = [
    { dish: "カレー", items: [["豚肉", 100, 1, "g"], ["玉ねぎ", 1, 1, "個"], ["にんじん", 1, 2, "本"], ["じゃがいも", 1, 1, "個"], ["水", 300, 1, "mL"], ["カレールウ", 1, 4, "箱"]] },
    { dish: "親子丼", items: [["鶏もも肉", 150, 1, "g"], ["玉ねぎ", 1, 2, "個"], ["卵", 3, 1, "個"], ["めんつゆ", 3, 1, "大さじ"]] },
    { dish: "野菜炒め", items: [["豚肉", 100, 1, "g"], ["にんじん", 1, 2, "本"], ["ピーマン", 1, 1, "個"], ["キャベツ", 1, 4, "玉"]] },
    { dish: "豚汁", items: [["豚こま肉", 80, 1, "g"], ["大根", 1, 4, "本"], ["にんじん", 1, 4, "本"], ["長ねぎ", 1, 2, "本"], ["みそ", 2, 1, "大さじ"]] },
    { dish: "ホットケーキ", items: [["ホットケーキミックス", 150, 1, "g"], ["卵", 1, 1, "個"], ["牛乳", 100, 1, "mL"]] },
    { dish: "ハンバーグ", items: [["ひき肉", 200, 1, "g"], ["玉ねぎ", 1, 2, "個"], ["卵", 1, 1, "個"], ["パン粉", 4, 1, "大さじ"]] }
  ];
  const qty = (n, d, u) => u === "大さじ" ? `大さじ${d === 1 ? n : `${n}/${d}`}` : `${d === 1 ? n : `${n}/${d}`}${u}`;
  const ask = (name, u, v) => u === "大さじ" ? [`${name}は、大さじ何杯必要ですか。`, `{大|おお}さじ${v}${hai(v)}`] : u === "本" ? [`${name}は何本必要ですか。`, `${v}${hon(v)}`] : u === "箱" ? [`${name}は何箱必要ですか。`, `${v}{箱|はこ}`] : u === "玉" ? [`${name}は{何玉|なんたま}必要ですか。`, `${v}{玉|たま}`] : u === "個" ? [`${name}は何個必要ですか。`, `${v}{個|こ}`] : [`${name}は何${u}必要ですか。`, `${v}${u}`];
  function recipeCard(r, people) {
    const W = 82, items = [round(0.5, 0.5, W - 1, 10 + r.items.length * 6.2 + 4, 3, { w: 0.5, fill: "white" }), round(4, 2.5, W - 8, 6.5, 3, { w: 0, fill: "#e3e3e3" }), T(W / 2, 7.3, `${r.dish} レシピ(${people}人分)`, 3.9)];
    items.push(T(W / 2, 13.5, "■材料■", 3.6, { bold: true }));
    r.items.forEach(([name, n, d, u], i) => {
      const y = 19.5 + i * 6.2;
      items.push(T(5, y, name, 3.8, { anchor: "start" }), line(5 + [...plain(K(name))].length * 3.9 + 2, y - 0.6, W - 22, y - 0.6, 0.35, { dash: "dot" }), T(W - 5, y, qty(n, d, u), 3.8, { anchor: "end" }));
    });
    return draw(W, 10 + r.items.length * 6.2 + 5.5, items);
  }
  const kRecipe = {
    id: "t.kRecipe",
    instruction: null,
    defaults: { mults: [2], two: false },
    levels: lv({ mults: [2], two: false }, { mults: [2, 3, 4], two: false }, { mults: [3, 4, 5], two: true }),
    generate(rng, p) {
      for (let t = 0; t < 300; t++) {
        const r = rng.pick(RECIPES), m = rng.pick(p.mults);
        const ok = r.items.filter(([, n, d]) => (n * m) % d === 0);
        if (ok.length < (p.two ? 2 : 1)) continue;
        const pick = rng.shuffle(ok.slice()).slice(0, p.two ? 2 : 1);
        const name = rng.pick(NAMES), people = 2 * m;
        const head = `${name}さんは、${r.dish}を${people}人分作ります。レシピには2人分の材料しか書いてありません。`;
        const vals = pick.map(([, n, d]) => (n * m) / d);
        if (!p.two) {
          const [q, a] = ask(pick[0][0], pick[0][3], vals[0]);
          return P({ key: `krc:${r.dish}:${m}:${pick[0][0]}`, text: head + q, figure: recipeCard(r, 2), ans: a, meta: { m, pick, vals } });
        }
        const blank = (it, v) => it[3] === "大さじ" ? `${it[0]}は大さじ${BX(16)}${hai(v)}` : `${it[0]}は${BX(18)}${it[3] === "本" ? hon(v) : it[3] === "個" ? "{個|こ}" : it[3] === "箱" ? "{箱|はこ}" : it[3] === "玉" ? "{玉|たま}" : it[3]}`;
        return P({ key: `krc2:${r.dish}:${m}:${pick.map((x) => x[0]).join(",")}`, text: head + `必要な分量を□に書きましょう。[[br]]${blank(pick[0], vals[0])}、${blank(pick[1], vals[1])}必要です。`, figure: recipeCard(r, 2), ans: vals.join("　"), noBox: true, meta: { m, pick, vals } });
      }
      throw new Error("レシピの問題が作れない");
    },
    verify(pr) {
      const { m, pick, vals } = pr.meta;
      for (let i = 0; i < pick.length; i++) if ((pick[i][1] * m) / pick[i][2] !== vals[i] || !Number.isInteger(vals[i])) return "分量が合わない";
      return hasAns(pr, ...vals);
    }
  };

  // ----- 割引 -----
  const SALE = [["豚こま肉 100g", 180, 320], ["キャベツ 半玉", 100, 200], ["にんじん 1本", 40, 90], ["鶏もも肉 100g", 100, 220], ["牛乳 1本", 180, 260], ["ピーマン 3個", 100, 180], ["トマト 1個", 80, 160], ["たまご 1パック", 200, 300]];
  const OFF = { half: ["半額", 50], 10: ["10%OFF", 10], 20: ["20%OFF", 20], 30: ["30%OFF", 30] };
  function saleTag(name, price, off) {
    const W = 78, lab = OFF[off][0];
    return draw(W, 30, [
      rect(1, 7, W - 16, 21, { w: 0.6, fill: "white" }),
      T(5, 15.5, name, 4.4, { anchor: "start" }),
      T(5, 24, `¥${price}(税込)`, 4.6, { anchor: "start", bold: true }),
      { t: "circle", cx: W - 14, cy: 9, r: 8.5, w: 0, fill: "#333" },
      T(W - 14, off === "half" ? 10.6 : 8.3, off === "half" ? "{半額|はんがく}" : lab.replace("OFF", ""), off === "half" ? 4.4 : 4, { color: "#fff", bold: true }),
      ...off === "half" ? [] : [T(W - 14, 12.8, "OFF", 3.4, { color: "#fff", bold: true })]
    ]);
  }
  const kDiscount = {
    id: "t.kDiscount",
    instruction: null,
    defaults: { offs: ["half", 10], qty: [1, 1], grams: false },
    levels: lv({ offs: ["half", 10], qty: [1, 1], grams: false }, { offs: [10, 20, 30, "half"], qty: [1, 3], grams: false }, { offs: [10, 20, 30], qty: [1, 1], grams: true }),
    generate(rng, p) {
      for (let t = 0; t < 300; t++) {
        const off = rng.pick(p.offs), rate = OFF[off][1];
        if (p.grams) {
          const [nm, lo, hi] = rng.pick(SALE.filter((s) => /100g/.test(s[0])));
          const price = rng.int(lo / 10, hi / 10) * 10, g = rng.pick([200, 300, 400, 500, 250, 350]);
          const full = price * g / 100, after = full * (100 - rate) / 100;
          if (!Number.isInteger(full) || !Number.isInteger(after)) continue;
          return P({ key: `kd:g:${nm}:${price}:${off}:${g}`, text: `スーパーで、肉が割引で売られていました。この肉を${g}g買うと、いくらになりますか。`, figure: saleTag(nm, price, off), lines: true, ans: SA(`${price}×${g / 100}×${(100 - rate) / 100}＝${after}`, `${after}円`), meta: { price, rate, g, n: 1, after } });
        }
        const [nm, lo, hi] = rng.pick(SALE.filter((s) => !/100g/.test(s[0])));
        const price = rng.int(Math.ceil(lo / 10), Math.floor(hi / 10)) * 10, n = rng.int(p.qty[0], p.qty[1]);
        const one = price * (100 - rate) / 100;
        if (!Number.isInteger(one)) continue;
        const item = nm.split(" ")[0];
        const shiki = rate === 50 ? `${price}÷2${n > 1 ? `×${n}` : ""}＝${one * n}` : `${price}×${(100 - rate) / 100}${n > 1 ? `×${n}` : ""}＝${one * n}`;
        return P({ key: `kd:${nm}:${price}:${off}:${n}`, text: `スーパーで、${item}が割引で売られていました。この${item}を${n > 1 ? n + "つ" : ""}買うと、いくらになりますか。`, figure: saleTag(nm, price, off), lines: true, ans: SA(shiki, `${one * n}円`), meta: { price, rate, g: 100, n, after: one * n } });
      }
      throw new Error("割引の問題が作れない");
    },
    verify(pr) {
      const { price, rate, g, n, after } = pr.meta;
      return price * g / 100 * (100 - rate) / 100 * n === after ? hasAns(pr, `${after}円`) : "割引の計算が合わない";
    }
  };

  // ----- 1人分のカロリー -----
  const kKcal = {
    id: "t.kKcal",
    instruction: null,
    defaults: { mode: "one" },
    levels: lv({ mode: "one" }, { mode: "many" }, { mode: "from4" }),
    generate(rng, p) {
      const dish = rng.pick(["野菜炒め", "カレー", "親子丼", "豚汁", "ハンバーグ"]);
      if (p.mode === "from4") {
        const one = rng.int(15, 45) * 10, n = rng.pick([2, 3, 6]);
        return P({ key: `kk4:${dish}:${one}:${n}`, text: `${dish}のレシピに、4人分で${one * 4}kcalと書いてありました。${n}人分は何kcalですか。`, lines: true, ans: SA(`${one * 4}÷4×${n}＝${one * n}`, `${one * n}kcal`), meta: { tot: one * 4, base: 4, n, val: one * n } });
      }
      const one = rng.int(15, 45) * 10;
      if (p.mode === "one") return P({ key: `kk1:${dish}:${one}`, text: `${dish}のレシピに、2人分で${one * 2}kcalと書いてありました。1人分は何kcalですか。`, lines: true, ans: SA(`${one * 2}÷2＝${one}`, `${one}kcal`), meta: { tot: one * 2, base: 2, n: 1, val: one } });
      const n = rng.pick([3, 4, 5, 6, 8]);
      return P({ key: `kkn:${dish}:${one}:${n}`, text: `${dish}のレシピに、2人分で${one * 2}kcalと書いてありました。${n}人分は何kcalですか。`, lines: true, ans: SA(`${one * 2}÷2×${n}＝${one * n}`, `${one * n}kcal`), meta: { tot: one * 2, base: 2, n, val: one * n } });
    },
    verify(pr) {
      const { tot, base, n, val } = pr.meta;
      return tot / base * n === val ? hasAns(pr, `${val}kcal`) : "カロリーが合わない";
    }
  };

  // ----- 食品表示ラベル -----
  const MEATS = ["【国産】豚ロース しょうが焼き用", "【国産】牛かたロース", "【国産】鶏もも肉 から揚げ用", "【国産】豚ひき肉", "【国産】豚こま切れ"];
  function labelFig(v, hide) {
    const W = 120, items = [round(0.5, 0.5, W - 1, 40, 3, { w: 0.6, fill: "white" })];
    items.push(T(5, 8, v.name, 4.8, { anchor: "start", bold: true }));
    items.push(T(5, 15, `消費期限 ${v.y % 100}.${v.m}.${v.d}`, 4.2, { anchor: "start", bold: true }), T(62, 15, `${v.temp}℃以下で保存`, 3.4, { anchor: "start" }));
    for (let i = 0; i < 26; i++) items.push(rect(5 + i * 1.5, 19, i % 3 === 0 ? 0.9 : 0.5, 11, { w: 0, fill: "#111" }));
    items.push(T(5, 33.5, "1 234567 891231", 2.6, { anchor: "start" }));
    items.push(T(46, 22.5, "100g当り(円)", 2.6, { anchor: "start" }), T(46, 28.5, "正味量(g)", 2.6, { anchor: "start" }));
    items.push(T(74, 23.5, v.u, 4.6, { anchor: "end", bold: true }), T(74, 29.8, v.g, 4.6, { anchor: "end", bold: true }));
    if (hide) {
      items.push(T(80, 20.5, "(本体)", 2.8, { anchor: "start" }), abox(92, 16.5, 24, 6.2));
      items.push(abox(80, 23.5, 30, 7.5), T(113, 29.5, "円", 3.6, { anchor: "middle" }));
    } else {
      items.push(T(115, 19.5, `${v.base}円(本体)`, 2.8, { anchor: "end" }), T(110, 29.5, v.tax, 8, { anchor: "end", bold: true }), T(114, 29.5, "円", 3.6, { anchor: "middle" }));
    }
    items.push(rect(80, 31.5, 34, 4, { w: 0, fill: "#333" }), T(97, 34.6, "お値段(税込)", 2.8, { color: "#fff" }));
    items.push(line(4, 37, W - 4, 37, 0.3), T(5, 39.6, "加工者 スーパー〇〇(株) 生鮮食品センター", 2.4, { anchor: "start" }));
    return draw(W, 42, items);
  }
  const kLabel = {
    id: "t.kLabel",
    instruction: null,
    defaults: { asks: ["g", "tax", "date", "temp"], calc: false },
    levels: lv({ asks: ["g", "tax", "date", "temp"], calc: false }, { asks: ["g", "tax", "u", "date", "temp"], calc: false }, { asks: ["calc"], calc: true }),
    generate(rng, p, ctx) {
      const u = rng.int(98, 698), g = rng.int(15, 45) * 10, base = Math.floor(u * g / 100), tax = Math.floor(base * 108 / 100);
      const v = { name: rng.pick(MEATS), u, g, base, tax, y: rng.pick([2026, 2027]), m: rng.int(1, 12), d: rng.int(1, 28), temp: rng.pick([4, 4, 10]) };
      const head = "肉のパックに貼られている食品表示ラベルを見て答えましょう。[[br]]";
      if (p.calc) return P({ key: `kl:c:${u}:${g}`, text: head + "本体の値段は、100gあたりの値段に正味量をかけて求めます(1円より細かいところは切り捨て)。税込みの値段は、本体の値段の1.08倍です(1円より細かいところは切り捨て)。ラベルの□に当てはまる数を書きましょう。", figure: labelFig(v, true), ans: `${base}　${tax}`, noBox: true, meta: { v, ask: "calc" } });
      const ask = pickAsk(rng, p, ctx);
      const Q = { g: ["このパックには、肉が何g入っていますか。", `${g}g`], tax: ["このパックは、税込みでいくらですか。", `${tax}円`], u: ["この肉は、100gあたりいくら(税抜き)ですか。", `${u}円`], date: ["この肉は、いつまでに食べる必要がありますか。", `${v.y}{年|ねん}${md(v.m, v.d)}`], temp: ["この肉は、何℃以下で保存する必要がありますか。", `${v.temp}℃{以下|いか}`] }[ask];
      return P({ key: `kl:${ask}:${u}:${g}:${v.y}${v.m}${v.d}:${v.temp}`, text: head + Q[0], figure: labelFig(v, false), ans: Q[1], meta: { v, ask }, softKey: ask });
    },
    verify(pr) {
      const { v, ask } = pr.meta;
      if (Math.floor(v.u * v.g / 100) !== v.base || Math.floor(v.base * 1.08 + 1e-9) !== v.tax) return "ラベルの値段が合わない";
      if (ask === "calc") return pr.answer.display === `${v.base}　${v.tax}` ? null : "□の答えが合わない";
      return hasAns(pr, { g: `${v.g}g`, tax: `${v.tax}円`, u: `${v.u}円`, date: `${v.y}年${v.m}月`, temp: `${v.temp}℃` }[ask]);
    }
  };

  // ----- カレンダー(手帳)-----
  const lastDay = (y, m) => new Date(y, m, 0).getDate();
  const wdOf = (y, m, d) => new Date(y, m - 1, d).getDay();
  function calFig(y, m) {
    const first = wdOf(y, m, 1), L = lastDay(y, m), rows = Math.ceil((first + L) / 7);
    const CW = 24, RH = 10.5, cells = [WD1.map((w) => ({ s: w, size: 3.6 }))];
    for (let r = 0; r < rows; r++) cells.push(WD.map((_, c) => {
      const d = r * 7 + c - first + 1;
      return d >= 1 && d <= L ? { s: d, anchor: "start", size: 3.6 } : "";
    }));
    const tb = table(0.5, 7, Array(7).fill(CW), [6, ...Array(rows).fill(RH)], cells, { head: 1 });
    // 日にちは 左上に
    const items = tb.items.map((it) => it.t === "text" && it.anchor === "start" ? { ...it, y: it.y - RH / 2 + 4.5 } : it);
    return draw(7 * CW + 1, 7 + tb.h + 1, [T(1, 5, `${y}{年|ねん}${m}{月|がつ}`, 4.4, { anchor: "start", bold: true }), ...items]);
  }
  const addDays = (y, m, d, n) => {
    const dt = new Date(y, m - 1, d + n);
    return [dt.getMonth() + 1, dt.getDate()];
  };
  const kCalendar = {
    id: "t.kCalendar",
    instruction: null,
    defaults: { asks: ["week", "nextSat", "count"] },
    levels: lv({ asks: ["week", "nextSat", "count"] }, { asks: ["week", "work", "save", "nthSat"] }, { asks: ["work", "save", "medicine", "nthSat"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 300; t++) {
        const y = rng.pick([2026, 2027]), m = rng.int(1, 12), L = lastDay(y, m);
        const ask = pickAsk(rng, p, ctx);
        let q, ans, meta = { y, m, ask };
        if (ask === "week") {
          const d = rng.int(1, L - 7);
          q = `${md(m, d)}(${WDR[wdOf(y, m, d)]})の1週間後は、何月何日ですか。`;
          ans = md(m, d + 7);
          meta = { ...meta, d, val: d + 7 };
        } else if (ask === "nextSat") {
          const d = rng.int(1, L - 7);
          if (wdOf(y, m, d) === 6) continue;
          const val = d + ((6 - wdOf(y, m, d) + 7) % 7);
          q = `${md(m, d)}(${WDR[wdOf(y, m, d)]})の次の土曜日は、何月何日ですか。`;
          ans = md(m, val);
          meta = { ...meta, d, val };
        } else if (ask === "count") {
          const w = rng.int(0, 6), val = Array.from({ length: L }, (_, i) => i + 1).filter((d) => wdOf(y, m, d) === w).length;
          q = `この月に、${WDR[w]}は何回ありますか。`;
          ans = `${val}{回|かい}`;
          meta = { ...meta, w, val };
        } else if (ask === "work") {
          const val = Array.from({ length: L }, (_, i) => i + 1).filter((d) => wdOf(y, m, d) >= 1 && wdOf(y, m, d) <= 5).length;
          const name = rng.pick(NAMES);
          q = `${name}さんは、月曜日から金曜日まで仕事で、土曜日と日曜日は休みです。${name}さんは、この月に何日仕事に行きますか。(祝日は考えないことにします。)`;
          ans = `${val}{日|にち}`;
          meta = { ...meta, val, name };
        } else if (ask === "save") {
          const d = rng.int(1, 12), per = rng.pick([10, 20, 50, 100]), n = L - d + 1;
          q = `${md(m, d)}から、毎日${per}円ずつ貯金箱に入れて貯金を始めます。この月の最後の日(${md(m, L)})には、貯金は何円になっていますか。`;
          ans = SA(`${per}×${n}＝${per * n}`, `${per * n}円`);
          meta = { ...meta, d, per, val: per * n, lines: true };
        } else if (ask === "medicine") {
          const d = rng.int(L - 8, L), n = rng.pick([3, 5, 7, 10, 14]);
          const [m2, d2] = addDays(y, m, d, n - 1);
          q = `${md(m, d)}に風邪をひいて病院に行き、薬を${days(n)}{分|ぶん}(1日1錠・${n}錠)もらいました。その日の夜から飲み始めると、薬を飲み終わるのは何月何日ですか。`;
          ans = md(m2, d2);
          meta = { ...meta, d, n, val: [m2, d2] };
        } else {
          const k = rng.int(1, 4), w = rng.pick([6, 0, 3]);
          const ds = Array.from({ length: L }, (_, i) => i + 1).filter((d) => wdOf(y, m, d) === w);
          q = `この月の第${k}${WDR[w]}は、何月何日ですか。`;
          ans = md(m, ds[k - 1]);
          meta = { ...meta, k, w, val: ds[k - 1] };
        }
        return P({ key: `kcl:${ask}:${y}:${m}:${JSON.stringify(meta)}`, text: "下の手帳(カレンダー)を見て答えましょう。[[br]]" + q, figure: calFig(y, m), ans, lines: !!meta.lines, meta, softKey: ask });
      }
      throw new Error("カレンダーの問題が作れない");
    },
    verify(pr) {
      const m = pr.meta, L = lastDay(m.y, m.m);
      const cnt = (f) => Array.from({ length: L }, (_, i) => i + 1).filter(f).length;
      switch (m.ask) {
        case "week": return m.val === m.d + 7 && m.val <= L ? null : "1週間後が合わない";
        case "nextSat": return wdOf(m.y, m.m, m.val) === 6 && m.val > m.d && m.val - m.d <= 7 ? null : "次の土曜日が合わない";
        case "count": return cnt((d) => wdOf(m.y, m.m, d) === m.w) === m.val ? null : "回数が合わない";
        case "work": return cnt((d) => wdOf(m.y, m.m, d) % 6 !== 0) === m.val ? hasAns(pr, `${m.val}日`) : "仕事の日数が合わない";
        case "save": return m.per * (L - m.d + 1) === m.val ? hasAns(pr, `${m.val}円`) : "貯金が合わない";
        case "medicine": {
          const dt = new Date(m.y, m.m - 1, m.d);
          dt.setDate(dt.getDate() + m.n - 1);
          return dt.getMonth() + 1 === m.val[0] && dt.getDate() === m.val[1] ? null : "飲み終わる日が合わない";
        }
        default: return wdOf(m.y, m.m, m.val) === m.w && Math.ceil(m.val / 7) === m.k ? null : "第○曜日が合わない";
      }
    }
  };

  kurashiGens.push(kWeather, kTemp, kReceipt, kPoint, kInstall, kCanBuy, kRecipe, kDiscount, kKcal, kLabel, kCalendar);
})();
