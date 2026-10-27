// ===== くらしの数学 Ⅲ 楽しむ(余暇):時間・待ち合わせ・ショッピング・レストラン・カタログ・収納 =====
(() => {
  const { BX, K, plain, fun, md, nin, tm, dur, NAMES, sum, SA, lv, P, hasAns, T, rect, abox, line, round, table, draw, htable, wallet } = kurashiLib;
  const pickAsk = (rng, p, ctx) => Number.isInteger(ctx?.index) ? p.asks[ctx.index % p.asks.length] : rng.pick(p.asks);
  const hm = (t) => [Math.floor(t / 60) % 24, t % 60];
  const tmA = (t) => `${Math.floor(t / 60) % 24}{時|じ}${t % 60 ? `${t % 60}${fun(t % 60)}` : ""}`;

  // ----- 時計の時刻と、たった時間 -----
  const kClockSpan = {
    id: "t.kClockSpan",
    instruction: null,
    defaults: { span: [5, 55], step: 5, cross: false },
    levels: lv({ span: [5, 50], step: 5, cross: false }, { span: [5, 55], step: 1, cross: true }, { span: [65, 170], step: 1, cross: true }),
    generate(rng, p) {
      for (let t = 0; t < 300; t++) {
        const a = rng.int(60, 11 * 60 + 59), s = rng.int(Math.ceil(p.span[0] / p.step), Math.floor(p.span[1] / p.step)) * p.step;
        if (a % p.step || a % 60 === 0) continue;
        const b = a + s;
        if (b % 60 === 0 || b >= 12 * 60 + 60) continue;
        if (!p.cross && Math.floor(a / 60) !== Math.floor(b / 60)) continue;
        if (p.cross && s < 60 && Math.floor(a / 60) === Math.floor(b / 60) && rng.chance(0.6)) continue;
        const [ah, am] = hm(a), [bh, bm] = hm(b);
        const big = s >= 60;
        return P({
          key: `kcs:${a}:${b}`,
          text: `左の時計から右の時計まで、時間がたちました。2つの時計の時刻と、たった時間を書きましょう。[[br]]左の時計　${BX(14)}時${BX(16)}分[[br]]右の時計　${BX(14)}時${BX(16)}分[[br]]たった時間　${big ? `${BX(14)}時間${BX(16)}分` : `${BX(16)}分間`}`,
          noBox: true,
          figure: { type: "clocks", clocks: [{ t: a, caption: "{左|ひだり}" }, { t: b, caption: "{右|みぎ}" }] },
          ans: [ah, am, bh, bm, ...big ? [Math.floor(s / 60), s % 60] : [s]].join("　"),
          meta: { a, b, s }
        });
      }
      throw new Error("時計の問題が作れない");
    },
    verify(pr) {
      const { a, b, s } = pr.meta;
      if (b - a !== s) return "時間が合わない";
      const want = [Math.floor(a / 60), a % 60, Math.floor(b / 60), b % 60, ...s >= 60 ? [Math.floor(s / 60), s % 60] : [s]].join("　");
      return pr.answer.display === want ? null : "時刻の答えが合わない";
    }
  };

  // ----- 行き方を調べる(乗りかえ) -----
  const STA = ["みどり駅", "さくら駅", "中央駅", "みなと駅", "ひかり駅", "あおば駅"];
  const PLACES = ["水族館", "動物園", "図書館", "プール", "博物館", "公園"];
  const kTravel = {
    id: "t.kTravel",
    instruction: null,
    defaults: { asks: ["total"] },
    levels: lv({ asks: ["total"] }, { asks: ["total", "back"] }, { asks: ["back", "wait"] }),
    generate(rng, p, ctx) {
      const [s1, s2] = rng.shuffle(STA.slice()).slice(0, 2), place = rng.pick(PLACES);
      const dep = rng.int(96, 126) * 5;
      const walk = rng.int(1, 3) * 5, w1 = rng.int(0, 2) * 2 + 2, ride = rng.int(3, 9) * 5 + rng.pick([0, 2, 4]), w2 = rng.int(1, 3) * 2, bus = rng.int(2, 5) * 5;
      const t1 = dep + walk, t2 = t1 + w1, t3 = t2 + ride, t4 = t3 + w2, t5 = t4 + bus;
      const rows = [["家", tmA(dep), "→", tmA(t1), s1, "徒歩"], [s1, tmA(t2), "→", tmA(t3), s2, "電車"], [`${s2}前`, tmA(t4), "→", tmA(t5), place, "バス"]];
      const fig = htable(["出発地", "出発時刻", "", "到着時刻", "到着地", "手段"], rows);
      const total = t5 - dep;
      const ask = pickAsk(rng, p, ctx);
      const head = `${place}に行きます。下の表は、乗りかえアプリで調べた行き方です。[[br]]`;
      if (ask === "total") return P({ key: `ktv:t:${dep}:${walk}:${w1}:${ride}:${w2}:${bus}`, text: head + `家を出てから${place}に着くまで、全部で何分かかりますか。`, figure: fig, lines: true, ans: SA(`${tmA(t5)}－${tmA(dep)}＝${total}${fun(total)}`, dur(total)), meta: { dep, t5, ask, val: total } });
      if (ask === "wait") {
        const wt = w1 + w2;
        return P({ key: `ktv:w:${dep}:${walk}:${w1}:${ride}:${w2}:${bus}`, text: head + "乗りかえのために駅やバス停で待つ時間は、合わせて何分ですか。", figure: fig, lines: true, ans: SA(`${w1}＋${w2}＝${wt}`, `${wt}${fun(wt)}`), meta: { ask, w1, w2, val: wt, t: [dep, t1, t2, t3, t4, t5] } });
      }
      const home = rng.int(34, 38) * 30, leave = home - total;
      return P({ key: `ktv:b:${dep}:${walk}:${w1}:${ride}:${w2}:${bus}:${home}`, text: head + `帰りも同じ時間(${total}${fun(total)})かかるとします。家に${tm(home)}に着くには、${place}を何時何分に出発すればよいですか。`, figure: fig, lines: true, ans: SA(`${tm(home)}－${total}${fun(total)}＝${tmA(leave)}`, tmA(leave)), meta: { dep, t5, ask, home, val: leave } });
    },
    verify(pr) {
      const m = pr.meta;
      if (m.ask === "total") return m.t5 - m.dep === m.val ? null : "時間が合わない";
      if (m.ask === "wait") return m.t[2] - m.t[1] + m.t[4] - m.t[3] === m.val ? null : "待ち時間が合わない";
      return m.home - (m.t5 - m.dep) === m.val ? null : "出発時刻が合わない";
    }
  };

  // ----- 時間の たし算・ひき算 -----
  const HM = (h, m) => `${h}{時間|じかん}${String(m).padStart(2, "0")}${fun(m || 10)}`;
  const kHMcalc = {
    id: "t.kHMcalc",
    instruction: "計算しましょう。",
    defaults: { mode: "easy" },
    levels: lv({ mode: "easy" }, { mode: "carry" }, { mode: "days" }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 300; t++) {
        const sub = p.mode !== "days" && rng.chance(0.45);
        const a = rng.int(p.mode === "days" ? 10 : 5, p.mode === "days" ? 40 : 55) * 60 + rng.int(1, 59), b = rng.int(1, 30) * 60 + rng.int(1, 59);
        const am = a % 60, bm = b % 60;
        if (sub && a <= b) continue;
        const carry = sub ? am < bm : am + bm >= 60;
        if (p.mode === "easy" && carry) continue;
        if (p.mode === "carry" && !carry && rng.chance(0.7)) continue;
        const r = sub ? a - b : a + b;
        if (p.mode === "days" && r < 24 * 60) continue;
        const left = `${HM(Math.floor(a / 60), am)}${sub ? "－" : "＋"}${HM(Math.floor(b / 60), bm)}`;
        if (p.mode === "days") {
          const d = Math.floor(r / 1440), h = Math.floor((r % 1440) / 60), m = r % 60;
          return { key: `khm:${a}:${b}:d`, text: K(`${left}＝${BX(12)}{日|にち}と${BX(14)}{時間|じかん}${BX(14)}${fun(m || 10)}`), answer: { display: `${d}　${h}　${m}` }, workspace: { type: "none" }, noAnswerBox: true, meta: { a, b, sub, r }, cols: 1 };
        }
        return { key: `khm:${a}:${b}:${sub}`, text: K(`${left}＝${BX(16)}{時間|じかん}${BX(14)}${fun(r % 60 || 10)}`), answer: { display: `${Math.floor(r / 60)}　${r % 60}` }, workspace: { type: "none" }, noAnswerBox: true, meta: { a, b, sub, r }, cols: 1 };
      }
      throw new Error("時間の計算が作れない");
    },
    verify(pr) {
      const { a, b, sub, r } = pr.meta;
      if ((sub ? a - b : a + b) !== r) return "計算が合わない";
      const d = pr.answer.display.split("　").map(Number);
      const back = d.length === 3 ? d[0] * 1440 + d[1] * 60 + d[2] : d[0] * 60 + d[1];
      return back === r && d[d.length - 1] < 60 ? null : "答えが合わない";
    }
  };

  // ----- 起きる時刻・家を出る時刻 -----
  const kWake = {
    id: "t.kWake",
    instruction: null,
    defaults: { asks: ["diff", "after"] },
    levels: lv({ asks: ["diff", "after"] }, { asks: ["diff", "after", "before"] }, { asks: ["after", "before", "diff"] }),
    generate(rng, p, ctx) {
      const ask = pickAsk(rng, p, ctx), name = rng.pick(NAMES);
      const step = p.asks.length === 2 ? 5 : 1;
      for (let t = 0; t < 200; t++) {
        if (ask === "diff") {
          const a = rng.int(72, 96) * 5, b = a - rng.int(2, 11) * 5;
          if (Math.floor(a / 60) === Math.floor(b / 60) && rng.chance(0.7)) continue;
          return P({ key: `kwk:d:${a}:${b}`, text: `${name}さんは、昨日は${tm(a)}に起きました。今日は部活動の朝練習があるので、${tm(b)}に起きました。今日は、昨日より何分早く起きましたか。`, lines: true, ans: SA(`${tmA(a)}－${tmA(b)}＝${a - b}${fun(a - b)}`, `${a - b}${fun(a - b)}`), meta: { ask, a, b, val: a - b } });
        }
        if (ask === "after") {
          const a = rng.int(330 / step, 450 / step) * step, n = rng.int(4, 11) * 5;
          if (Math.floor(a / 60) === Math.floor((a + n) / 60) && rng.chance(0.6)) continue;
          return P({ key: `kwk:a:${a}:${n}`, text: `朝${tm(a)}に起きて、${n}${fun(n)}後に家を出ました。家を出た時刻は何時何分ですか。`, lines: true, ans: SA(`${tmA(a)}＋${n}${fun(n)}＝${tmA(a + n)}`, tmA(a + n)), meta: { ask, a, n, val: a + n } });
        }
        const g = rng.int(96, 102) * 5, n = rng.int(3, 11) * 5;
        if (Math.floor(g / 60) === Math.floor((g - n) / 60) && rng.chance(0.6)) continue;
        return P({ key: `kwk:b:${g}:${n}`, text: `家から学校まで${n}${fun(n)}かかります。${tm(g)}に学校に着くには、家を何時何分に出ればよいですか。`, lines: true, ans: SA(`${tmA(g)}－${n}${fun(n)}＝${tmA(g - n)}`, tmA(g - n)), meta: { ask, g, n, val: g - n } });
      }
      throw new Error("起きる時刻の問題が作れない");
    },
    verify(pr) {
      const m = pr.meta;
      const want = m.ask === "diff" ? m.a - m.b : m.ask === "after" ? m.a + m.n : m.g - m.n;
      return want === m.val && want > 0 ? null : "時刻が合わない";
    }
  };

  // ----- 友達との待ち合わせ(時刻表) -----
  const kMeet = {
    id: "t.kMeet",
    instruction: null,
    defaults: { step: 10 },
    levels: lv({ step: 10 }, { step: 5 }, { step: 5 }),
    generate(rng, p) {
      for (let t = 0; t < 300; t++) {
        const start = rng.int(600 / p.step, 900 / p.step) * p.step, prep = rng.pick([10, 15, 20]), bus = rng.int(5, 11) * 5, walk = rng.int(1, 3) * 5 + (p.step === 5 ? rng.pick([0, 3]) : 0);
        const meet = start - prep, latest = meet - bus;
        const H = Math.floor(latest / 60);
        const tt = {};
        for (let h = H - 1; h <= H + 1; h++) tt[h] = rng.shuffle([...Array(12).keys()].map((x) => x * 5)).slice(0, rng.int(2, 3)).sort((a, b) => a - b);
        const deps = Object.entries(tt).flatMap(([h, ms]) => ms.map((m) => Number(h) * 60 + m)).filter((x) => x <= latest);
        if (!deps.length) continue;
        const ride = Math.max(...deps);
        if (latest - ride > 30) continue;
        const leave = ride - walk;
        const fig = htable(["時", "平日", "土曜・休日"], Object.entries(tt).map(([h, ms]) => [h, rng.shuffle([...Array(12).keys()].map((x) => String(x * 5).padStart(2, "0"))).slice(0, 3).sort().join(" "), ms.map((m) => String(m).padStart(2, "0")).join(" ")]));
        return P({
          key: `kmt:${start}:${prep}:${bus}:${walk}:${JSON.stringify(tt)}`,
          text: `土曜日に、友達と映画を見に行きます。映画は${tm(start)}に始まります。映画館では、映画が始まる${prep}${fun(prep)}前に待ち合わせます。家からバス停まで歩いて${walk}${fun(walk)}、バスに乗って映画館まで${bus}${fun(bus)}かかります。下のバス停の時刻表(土曜・休日)を見て、それぞれの時刻を書きましょう。[[br]]Ⓐ待ち合わせる時刻　${BX(34)}[[br]]Ⓑ乗るバスの時刻(待ち合わせに間に合う、いちばんおそいバス)　${BX(34)}[[br]]Ⓒ家を出る時刻　${BX(34)}`,
          noBox: true,
          figure: fig,
          ans: [tmA(meet), tmA(ride), tmA(leave)].join("　"),
          meta: { start, prep, bus, walk, tt, meet, ride, leave }
        });
      }
      throw new Error("待ち合わせの問題が作れない");
    },
    verify(pr) {
      const m = pr.meta;
      const deps = Object.entries(m.tt).flatMap(([h, ms]) => ms.map((x) => Number(h) * 60 + x)).filter((x) => x + m.bus <= m.start - m.prep);
      return m.meet === m.start - m.prep && m.ride === Math.max(...deps) && m.leave === m.ride - m.walk ? null : "待ち合わせの時刻が合わない";
    }
  };

  // ----- バス代と昼食代 -----
  const kBusFare = {
    id: "t.kBusFare",
    instruction: null,
    defaults: { two: false },
    levels: lv({ two: false }, { two: true }, { two: true }),
    generate(rng, p) {
      for (let t = 0; t < 200; t++) {
        const fares = [];
        let f = rng.int(46, 56) * 10;
        for (let i = 1; i <= 8; i++) {
          fares.push(f);
          f -= rng.int(3, 7) * 10;
        }
        if (fares[7] < 120) continue;
        const k = rng.int(1, 8), movie = rng.pick([800, 1000, 1200, 1500]), money = rng.pick([2500, 3000, 3500, 4000]);
        const fare = fares[k - 1], lunch = money - (fare * 2 + movie);
        if (lunch < 300) continue;
        const fig = htable(["整理券", "運賃(円)", "整理券", "運賃(円)"], [0, 1, 2, 3].map((i) => [i + 1, fares[i], i + 5, fares[i + 4]]));
        if (!p.two) return P({ key: `kbf1:${fares.join(",")}:${k}`, text: `バスに乗るとき、「${k}」と書かれた整理券を取りました。下の運賃表を見て、映画館の前でおりるときに払う運賃はいくらですか。`, figure: fig, ans: `${fare}円`, meta: { fares, k, fare } });
        return P({ key: `kbf:${fares.join(",")}:${k}:${movie}:${money}`, text: `小遣いが${money}円あります。バスで映画を見に行きます。バスに乗るとき、「${k}」と書かれた整理券を取りました。帰りも同じ区間に乗るので、運賃は行きと同じです。映画代は${movie}円です。下の運賃表を見て、昼食にいくら使えるかを求めましょう。`, figure: fig, lines: true, ans: SA(`${money}－(${fare}＋${movie}＋${fare})＝${lunch}`, `${lunch}円`), meta: { fares, k, fare, movie, money, lunch } });
      }
      throw new Error("運賃の問題が作れない");
    },
    verify(pr) {
      const m = pr.meta;
      if (m.fares[m.k - 1] !== m.fare) return "運賃が合わない";
      if (m.lunch === void 0) return hasAns(pr, `${m.fare}円`);
      return m.money - m.fare * 2 - m.movie === m.lunch ? hasAns(pr, `${m.lunch}円`) : "昼食代が合わない";
    }
  };

  // ----- 時間の単位 -----
  const kUnitTime = {
    id: "t.kUnitTime",
    instruction: "□に当てはまる数を書きましょう。",
    defaults: { types: ["h2m", "d2h"] },
    levels: lv({ types: ["h2m", "d2h", "m2h", "w2d"] }, { types: ["h2m", "d2h", "m2hm", "hm2m"] }, { types: ["m2hm", "h2dh", "hm2m"] }),
    generate(rng, p, ctx) {
      const ty = Number.isInteger(ctx?.index) ? p.types[ctx.index % p.types.length] : rng.pick(p.types);
      let text, ans, v;
      if (ty === "h2m") {
        v = rng.int(1, 12);
        text = `${v}{時間|じかん}＝${BX(16)}{分|ふん}`;
        ans = `${v * 60}`;
      } else if (ty === "m2h") {
        v = rng.int(2, 12);
        text = `${v * 60}${fun(v * 60)}＝${BX(16)}{時間|じかん}`;
        ans = `${v}`;
      } else if (ty === "w2d") {
        v = rng.int(1, 8);
        text = `${v}{週間|しゅうかん}＝${BX(16)}{日|にち}`;
        ans = `${v * 7}`;
      } else if (ty === "d2h") {
        v = rng.int(1, 10);
        text = `${v}{日|にち}＝${BX(16)}{時間|じかん}`;
        ans = `${v * 24}`;
      } else if (ty === "m2hm") {
        v = rng.int(61, 299);
        if (v % 60 === 0) v++;
        text = `${v}${fun(v)}＝${BX(16)}{時間|じかん}${BX(16)}${fun(v % 60 || 10)}`;
        ans = `${Math.floor(v / 60)}　${v % 60}`;
      } else if (ty === "h2dh") {
        v = rng.int(25, 95);
        if (v % 24 === 0) v++;
        text = `${v}{時間|じかん}＝${BX(16)}{日|にち}${BX(16)}{時間|じかん}`;
        ans = `${Math.floor(v / 24)}　${v % 24}`;
      } else {
        const h = rng.int(1, 4), m = rng.int(1, 59);
        v = h * 60 + m;
        text = `${h}{時間|じかん}${m}${fun(m)}＝${BX(16)}${fun(v)}`;
        ans = `${v}`;
      }
      return { key: `kut:${ty}:${v}`, text, answer: { display: ans }, workspace: { type: "none" }, noAnswerBox: true, meta: { ty, v } };
    },
    verify(pr) {
      const { ty, v } = pr.meta, d = pr.answer.display.split("　").map(Number);
      const ok = ty === "m2h" ? d[0] === v : ty === "w2d" ? d[0] === v * 7 : ty === "h2m" ? d[0] === v * 60 : ty === "d2h" ? d[0] === v * 24 : ty === "m2hm" ? d[0] * 60 + d[1] === v && d[1] < 60 : ty === "h2dh" ? d[0] * 24 + d[1] === v && d[1] < 24 : d[0] === v;
      return ok ? null : "単位のなおし方が合わない";
    }
  };

  // ----- 何分後・何分前の時刻(時計) -----
  const kClockAfter = {
    id: "t.kClockAfter",
    instruction: null,
    defaults: { step: 5, before: false },
    levels: lv({ step: 5, before: false }, { step: 5, before: true }, { step: 1, before: true }),
    generate(rng, p) {
      for (let t = 0; t < 200; t++) {
        const a = rng.int(60 / p.step, (11 * 60 + 55) / p.step) * p.step, n = rng.int(2, 11) * 5 + (p.step === 1 ? rng.int(1, 4) : 0);
        const before = p.before && rng.chance(0.5), b = before ? a - n : a + n;
        if (b < 60 || b >= 12 * 60 + 60) continue;
        if (Math.floor(a / 60) === Math.floor(b / 60) && rng.chance(0.5)) continue;
        return P({
          key: `kca:${a}:${n}:${before}`,
          text: `時計は午後の時刻です。この時刻の${n}${fun(n)}${before ? "前" : "後"}は、午後何時何分ですか。`,
          figure: { type: "clocks", clocks: [{ t: a }] },
          ans: `{午後|ごご}${tmA(b)}`,
          meta: { a, n, before, b }
        });
      }
      throw new Error("時計の問題が作れない");
    },
    verify(pr) {
      const { a, n, before, b } = pr.meta;
      return (before ? a - n : a + n) === b ? hasAns(pr, `${Math.floor(b / 60)}時`) : "時刻が合わない";
    }
  };

  // ----- ICカードにチャージ -----
  const SHOP = [["イヤホン", 1500, 3980], ["ノート", 150, 480], ["ケーキ", 300, 650], ["くつ", 2500, 5980], ["本", 600, 1800], ["コーヒー", 250, 520], ["Tシャツ", 990, 2490], ["かばん", 1980, 4980]];
  const kCharge = {
    id: "t.kCharge",
    instruction: null,
    defaults: { n: 2 },
    levels: lv({ n: 2 }, { n: 3 }, { n: 3 }),
    generate(rng, p) {
      for (let t = 0; t < 200; t++) {
        const its = rng.shuffle(SHOP.slice()).slice(0, p.n).map(([nm, lo, hi]) => [nm, rng.int(lo / 10, hi / 10) * 10]);
        const total = sum(its.map((x) => x[1])), bal = rng.int(3, 30) * 100;
        if (total <= bal) continue;
        const need = total - bal, ch = Math.ceil(need / 1000) * 1000;
        return P({
          key: `kch:${its.flat().join(",")}:${bal}`,
          text: `ショッピングセンターで、${its.map(([n, v]) => `${n}(${v}円)`).join("と")}を買います。ICカードには${bal}円分入っています。ICカードで払うには、少なくともいくらチャージすればよいですか。チャージは1000円単位でします。`,
          lines: true,
          ans: SA(`${its.map((x) => x[1]).join("＋")}－${bal}＝${need}`, `${ch}円`),
          meta: { its, bal, ch }
        });
      }
      throw new Error("チャージの問題が作れない");
    },
    verify(pr) {
      const { its, bal, ch } = pr.meta, need = sum(its.map((x) => x[1])) - bal;
      return ch % 1000 === 0 && ch >= need && ch - need < 1000 ? hasAns(pr, `${ch}円`) : "チャージが合わない";
    }
  };

  // ----- 財布のお金で払う(お釣りが少なくなるように) -----
  const DEN = [1000, 500, 100, 50, 10, 5, 1];
  function bestPay(have, price) {
    let best = null;
    const rec = (i, used) => {
      if (i === DEN.length) {
        const tot = sum(used.map((n, j) => n * DEN[j]));
        if (tot >= price && (best === null || tot < best)) best = tot;
        return;
      }
      for (let n = 0; n <= have[i]; n++) rec(i + 1, [...used, n]);
    };
    rec(0, []);
    return best;
  }
  const GOODS = ["くつ", "ラーメン", "トートバッグ", "ハンバーガーセット", "ぼうし", "Tシャツ", "文房具", "おかし"];
  const kWallet = {
    id: "t.kWallet",
    instruction: null,
    defaults: { coins: 7, small: false },
    levels: lv({ coins: 6, small: false }, { coins: 8, small: true }, { coins: 10, small: true }),
    generate(rng, p) {
      for (let t = 0; t < 500; t++) {
        const have = DEN.map((v) => v === 1000 ? rng.int(1, 3) : v === 1 || v === 5 ? (p.small ? rng.int(0, 2) : 0) : rng.int(0, 4));
        const n = sum(have);
        if (n < p.coins - 2 || n > p.coins + 1) continue;
        const total = sum(have.map((c, i) => c * DEN[i]));
        const price = rng.int(Math.ceil(total * 0.3), total - 1);
        if (!p.small && price % 10) continue;
        const pay = bestPay(have, price);
        if (pay === null || pay - price >= 500) continue;
        const list = DEN.flatMap((v, i) => Array(have[i]).fill(v));
        const W = wallet(list, 40, 1, 128);
        const g = rng.pick(GOODS);
        const items = [round(1, 3, 34, 20, 3, { w: 0.5, fill: "white" }), T(18, 11, g, g.length > 5 ? 3.2 : 4), T(18, 19.5, `${price}円`, 5, { bold: true }), ...W.items];
        return P({
          key: `kwl:${have.join(",")}:${price}`,
          text: `財布の中のお金を使って、お釣りが少なくなるように支払います。支払う金額とお釣りを書きましょう。[[br]]支払う金額　${BX(26)}円　　お釣り　${BX(22)}円`,
          noBox: true,
          figure: draw(170, Math.max(25, W.h + 2), items),
          ans: `${pay}　${pay - price}`,
          meta: { have, price, pay }
        });
      }
      throw new Error("財布の問題が作れない");
    },
    verify(pr) {
      const { have, price, pay } = pr.meta;
      return bestPay(have, price) === pay ? hasAns(pr, pay, pay - price) : "支払いが合わない";
    }
  };

  // ----- レストラン(割り勘) -----
  const MENU = [["ラーメン", 650, 850], ["チャーハン", 600, 780], ["オムライス", 750, 900], ["カレーライス", 700, 880], ["ハンバーグ", 850, 1100], ["中華丼", 700, 850], ["オニオンサラダ", 350, 520], ["パスタ", 800, 980]];
  const DRINK = [["ウーロン茶", 200, 250], ["オレンジジュース", 220, 300], ["コーラ", 200, 280]];
  const SHARE = [["ぎょうざ", 390, 600], ["フライドポテト", 390, 570], ["からあげ", 450, 690], ["ピザ", 900, 1500]];
  const kSplit = {
    id: "t.kSplit",
    instruction: null,
    defaults: { mode: "share" },
    levels: lv({ mode: "share" }, { mode: "one" }, { mode: "two" }),
    generate(rng, p) {
      for (let t = 0; t < 300; t++) {
        const names = rng.shuffle(NAMES.slice()).slice(0, 3);
        const own = names.map(() => {
          const [m, lo, hi] = rng.pick(MENU), [d, dl, dh] = rng.pick(DRINK);
          return [[m, rng.int(lo / 10, hi / 10) * 10], [d, rng.int(dl / 10, dh / 10) * 10]];
        });
        const ns = p.mode === "two" ? 2 : 1;
        const sh = rng.shuffle(SHARE.slice()).slice(0, ns).map(([nm, lo, hi]) => [nm, rng.int(Math.ceil(lo / 30), Math.floor(hi / 30)) * 30]);
        const per = sum(sh.map((x) => x[1] / 3));
        if (p.mode === "share") {
          const [nm, v] = sh[0];
          return P({ key: `ksp:s:${nm}:${v}`, text: `レストランで、${nm}(${v}円)を3人で分けて食べました。${nm}の代金を3人で割り勘にすると、1人いくらですか。`, lines: true, ans: SA(`${v}÷3＝${v / 3}`, `${v / 3}円`), meta: { sh, own: [], who: -1, val: v / 3 } });
        }
        const who = rng.int(0, 2);
        const fig = htable(["", "食べたもの・飲んだもの", "金額(円)"], [...names.flatMap((nm, i) => own[i].map(([it, v], j) => [j === 0 ? `${nm}さん` : "", it, v])), ...sh.map(([it, v], j) => [j === 0 ? "3人で分けた" : "", it, v])]);
        const tot = sum(own[who].map((x) => x[1])) + per;
        const shiki = `${own[who].map((x) => x[1]).join("＋")}${sh.map(([, v]) => `＋${v}÷3`).join("")}＝${tot}`;
        return P({ key: `ksp:${p.mode}:${JSON.stringify(own)}:${JSON.stringify(sh)}:${who}`, text: `3人でレストランに行きました。下の表は、それぞれが注文したものです。自分のものは自分で払い、「3人で分けた」ものは3人で割り勘にします。${names[who]}さんが払う金額はいくらですか。`, figure: fig, lines: true, ans: SA(shiki, `${tot}円`), meta: { sh, own, who, val: tot } });
      }
      throw new Error("割り勘の問題が作れない");
    },
    verify(pr) {
      const { sh, own, who, val } = pr.meta;
      if (sh.some(([, v]) => v % 3)) return "割り切れない";
      const want = (who < 0 ? 0 : sum(own[who].map((x) => x[1]))) + sum(sh.map(([, v]) => v / 3));
      return want === val ? hasAns(pr, `${val}円`) : "割り勘が合わない";
    }
  };

  // ----- カタログや広告 -----
  const FURN = [["木の本棚(5段)", [60, 90], [25, 35], [150, 190]], ["テレビ台", [80, 150], [35, 45], [35, 55]], ["パソコン机", [80, 120], [45, 60], [70, 75]], ["カラーボックス(3段)", [40, 45], [28, 30], [85, 90]], ["衣装ケース", [40, 45], [50, 75], [20, 30]]];
  function adFig(v) {
    const W = 150;
    return draw(W, 34, [
      round(0.5, 0.5, W - 1, 33, 3, { w: 0.6, fill: "white" }),
      rect(6, 5, 22, 25, { w: 0.5, fill: "#e8e8e8" }), line(6, 13.3, 28, 13.3, 0.4), line(6, 21.6, 28, 21.6, 0.4),
      T(34, 9.5, v.name, 5, { anchor: "start", bold: true }),
      T(34, 16.5, `サイズ:{幅|はば}${v.w}cm × {奥行|おくゆ}き${v.d}cm × {高|たか}さ${v.h}cm`, 3.7, { anchor: "start" }),
      T(34, 23.5, `価格:${v.price}円(税込・送料無料)`, 4, { anchor: "start", bold: true }),
      T(34, 30, `お届け:ご注文の日から${v.days}日後に到着`, 3.7, { anchor: "start" })
    ]);
  }
  const kFit = {
    id: "t.kFit",
    instruction: null,
    defaults: { asks: ["fit", "date", "two"] },
    levels: lv({ asks: ["size", "two"] }, { asks: ["fit", "date", "two"] }, { asks: ["fit", "date", "rest"] }),
    generate(rng, p, ctx) {
      const [name, wr, dr, hr] = rng.pick(FURN);
      const v = { name, w: rng.int(wr[0], wr[1]), d: rng.int(dr[0], dr[1]), h: rng.int(hr[0], hr[1]), price: rng.int(198, 1598) * 10 - 20, days: rng.int(2, 9) };
      const ask = pickAsk(rng, p, ctx);
      const head = "次の広告を見て答えましょう。[[br]]";
      if (ask === "size") return P({ key: `kft:s:${JSON.stringify(v)}`, text: head + `${name}の幅は何cmですか。`, figure: adFig(v), ans: `${v.w}cm`, meta: { v, ask } });
      if (ask === "two") return P({ key: `kft:2:${JSON.stringify(v)}`, text: head + `${name}を2つ買うと、合計でいくらになりますか。`, figure: adFig(v), lines: true, ans: SA(`${v.price}×2＝${v.price * 2}`, `${v.price * 2}円`), meta: { v, ask } });
      if (ask === "fit") {
        const gap = v.w + rng.pick([-6, -4, -3, -2, 2, 3, 5, 8]);
        const ok = v.w <= gap;
        return P({ key: `kft:f:${JSON.stringify(v)}:${gap}`, text: head + `部屋のかべとたなの間に、幅${gap}cmのすき間があります。この${name}を、このすき間に置くことができますか。`, figure: adFig(v), labels: ["{答|こた}え", "{理由|りゆう}"], ans: `{答|こた}え ${ok ? "{置|お}けます" : "{置|お}けません"}　{理由|りゆう} {幅|はば}${v.w}cmは、すき{間|ま}の${gap}cmより${ok ? "{小|ちい}さい" : "{大|おお}きい"}から`, meta: { v, ask, gap, ok } });
      }
      if (ask === "rest") {
        const room = v.w + rng.int(10, 80);
        return P({ key: `kft:r:${JSON.stringify(v)}:${room}`, text: head + `幅${room}cmのかべぎわに、この${name}を置きます。となりに残るすき間の幅は何cmですか。`, figure: adFig(v), lines: true, ans: SA(`${room}－${v.w}＝${room - v.w}`, `${room - v.w}cm`), meta: { v, ask, room } });
      }
      const m = rng.int(1, 12), d = rng.int(1, 28), dt = new Date(2026, m - 1, d + v.days);
      return P({ key: `kft:d:${JSON.stringify(v)}:${m}:${d}`, text: head + `${md(m, d)}に注文すると、${name}は何月何日に届きますか。`, figure: adFig(v), ans: md(dt.getMonth() + 1, dt.getDate()), meta: { v, ask, m, d, val: [dt.getMonth() + 1, dt.getDate()] } });
    },
    verify(pr) {
      const m = pr.meta, v = m.v;
      if (m.ask === "size") return hasAns(pr, `${v.w}cm`);
      if (m.ask === "two") return hasAns(pr, `${v.price * 2}円`);
      if (m.ask === "fit") return (v.w <= m.gap) === m.ok ? hasAns(pr, m.ok ? "置けます" : "置けません") : "置けるかが合わない";
      if (m.ask === "rest") return hasAns(pr, `${m.room - v.w}cm`);
      const dt = new Date(2026, m.m - 1, m.d);
      dt.setDate(dt.getDate() + v.days);
      return dt.getMonth() + 1 === m.val[0] && dt.getDate() === m.val[1] ? null : "届く日が合わない";
    }
  };

  // ----- 収納(たなに箱を並べる) -----
  const kShelf = {
    id: "t.kShelf",
    instruction: null,
    defaults: { rows: false },
    levels: lv({ rows: false, exact: true }, { rows: false, exact: false }, { rows: true, exact: false }),
    generate(rng, p) {
      for (let t = 0; t < 200; t++) {
        const w = rng.pick([12, 15, 18, 20, 24, 25, 26, 28, 30, 35]), n = rng.int(2, 7), rest = p.exact ? 0 : rng.int(1, w - 1), W = w * n + rest;
        if (W > 180) continue;
        if (!p.rows) return P({
          key: `ksh:${w}:${W}`,
          text: p.exact ? `内側の幅が${W}cmのたなに、幅${w}cmの箱を横に並べます。箱は何個並べられますか。` : `内側の幅が${W}cmのたなに、幅${w}cmの箱を横に並べます。箱は何個並べられて、何cm余りますか。[[br]]${BX(14)}個並べられて、${BX(16)}cm余ります。`,
          noBox: !p.exact,
          lines: p.exact,
          ans: p.exact ? SA(`${W}÷${w}＝${n}`, `${n}{個|こ}`) : `${n}　${rest}`,
          meta: { w, W, n, rest }
        });
        const dan = rng.int(2, 5);
        return P({ key: `ksh2:${w}:${W}:${dan}`, text: `内側の幅が${W}cmで、${dan}段のたながあります。それぞれの段に、幅${w}cmの箱を横に並べます。たな全体で、箱は何個入りますか。`, lines: true, ans: SA(`${W}÷${w}＝${n}${rest ? `あまり${rest}` : ""}、${n}×${dan}＝${n * dan}`, `${n * dan}{個|こ}`), meta: { w, W, n, rest, dan } });
      }
      throw new Error("収納の問題が作れない");
    },
    verify(pr) {
      const { w, W, n, rest, dan } = pr.meta;
      if (Math.floor(W / w) !== n || W % w !== rest) return "個数が合わない";
      return dan ? hasAns(pr, `${n * dan}個`) : hasAns(pr, n);
    }
  };

  kurashiGens.push(kClockSpan, kTravel, kHMcalc, kWake, kMeet, kBusFare, kUnitTime, kClockAfter, kCharge, kWallet, kSplit, kFit, kShelf);
})();
