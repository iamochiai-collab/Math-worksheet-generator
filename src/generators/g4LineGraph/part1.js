// 4年「折れ線グラフと表」をふやした生成器(見本)。題材(THEMES)・グラフ描画(chart)・問題の生成器。
var g4LineGraph = (() => {
  // ===== グラフ(mm 単位。値はすべて整数。小数は dp 桁ぶん 10 倍して持つ) =====
  const TICK = 1.8;
  const AIUEO = ["ア", "イ", "ウ", "エ", "オ"];
  const fmtV = (v, dp) => dp ? (v / 10 ** dp).toFixed(dp) : String(v);
  function chart(o) {
    const labels = o.labels, n = labels.length, dp = o.dp || 0;
    const yMin = o.yMin || 0, step = o.step, major = o.major;
    const nTicks = Math.round((o.yMax - yMin) / step);
    const numbers = o.numbers !== false;
    const lw = Math.max(fmtV(o.yMax, dp).length, 2) * 0.58 * 3.4;
    const ML = Math.max(13, lw + 5), MT = o.legend ? 15 : 9, MB = 13, MR = o.bars ? 16 : 4;
    const colW = Math.min(9, (o.maxW || 112) / n);
    const waveGap = yMin > 0 ? 6 : 0;
    const tick = o.tick || (nTicks <= 14 ? 2.8 : nTicks <= 22 ? 2.2 : TICK);
    const plotH = nTicks * tick, plotW = n * colW;
    const x0 = ML, yBase = MT + plotH, yZero = yBase + waveGap;
    const yOf = (v) => yBase - (v - yMin) / step * tick;
    const xOf = (i) => x0 + (i + 0.5) * colW;
    const items = [];
    for (let k = 0; k <= nTicks; k++) {
      const v = yMin + k * step, y = yBase - k * tick, isMajor = v % (step * major) === 0;
      items.push({ t: "line", x1: x0, y1: y, x2: x0 + plotW, y2: y, w: isMajor ? 0.3 : 0.12, lead: true });
      if (numbers && isMajor) items.push({ t: "text", x: x0 - 1.6, y: y + 1.3, s: fmtV(v, dp), size: 3.4, anchor: "end" });
      if (o.bars && numbers && k % o.bars.major === 0) items.push({ t: "text", x: x0 + plotW + 1.6, y: y + 1.3, s: String(k * o.bars.per), size: 3.4, anchor: "start" });
    }
    if (o.bars) {
      o.bars.v.forEach((v, i) => {
        const y = yBase - v / o.bars.per * tick, hw = colW * 0.3;
        items.push({ t: "poly", pts: [[xOf(i) - hw, yBase], [xOf(i) - hw, y], [xOf(i) + hw, y], [xOf(i) + hw, yBase]], fill: "light", w: 0.3, lead: true, bar: i, val: v });
      });
      items.push({ t: "line", x1: x0 + plotW, y1: MT - 2, x2: x0 + plotW, y2: yBase, w: 0.5, lead: true });
      if (numbers || o.showUnit) items.push({ t: "text", x: x0 + plotW + 2, y: MT - 3.6, s: `(${o.bars.unit})`, size: 3.4, anchor: "middle" });
    }
    items.push({ t: "line", x1: x0, y1: MT - 2, x2: x0, y2: yZero, w: 0.5, lead: true });
    items.push({ t: "line", x1: x0, y1: yZero, x2: x0 + plotW, y2: yZero, w: 0.5, lead: true });
    if (waveGap) {
      const ym = yBase + waveGap / 2;
      items.push({ t: "path", d: `M${x0 - 2.2} ${ym - 1.2}q1.1 -1.3 2.2 0t2.2 0M${x0 - 2.2} ${ym + 0.6}q1.1 -1.3 2.2 0t2.2 0`, w: 0.4, fill: "white", lead: true });
      if (numbers) items.push({ t: "text", x: x0 - 1.6, y: yZero + 1.3, s: "0", size: 3.4, anchor: "end" });
    }
    if (numbers || o.showUnit) items.push({ t: "text", x: x0 - 1, y: MT - 3.6, s: `(${o.unit})`, size: 3.4, anchor: "middle" });
    labels.forEach((l, i) => items.push({ t: "text", x: xOf(i), y: yZero + 4.6, s: l, size: 3.2 }));
    if (o.xTitle) items.push({ t: "text", x: x0 + plotW + (o.bars ? 14 : 1), y: yZero + 9.4, s: `(${o.xTitle})`, size: 3.2, anchor: "end" });
    if (o.legend) {
      let lx = x0 + 4;
      for (const lg of o.legend) {
        if (lg.bar) items.push({ t: "poly", pts: [[lx, 2.6], [lx + 5, 2.6], [lx + 5, 6.2], [lx, 6.2]], fill: "light", w: 0.3, lead: true });
        else items.push({ t: "line", x1: lx, y1: 4.4, x2: lx + 6, y2: 4.4, w: 0.6, dash: lg.dash ? "dash" : void 0, lead: true });
        items.push({ t: "text", x: lx + 7.5, y: 5.6, s: lg.name, size: 3.4, anchor: "start" });
        lx += 12 + [...lg.name.replace(/\{([^|}]*)\|[^}]*\}/g, "$1")].length * 3.6;
      }
    }
    (o.series || []).forEach((s, sid) => {
      if (s.hidden) return;
      const pts = s.v.map((v, i) => v === null ? null : [xOf(i), yOf(v)]);
      for (let i = 0; i + 1 < pts.length; i++) if (pts[i] && pts[i + 1]) items.push({ t: "line", x1: pts[i][0], y1: pts[i][1], x2: pts[i + 1][0], y2: pts[i + 1][1], w: 0.6, dash: s.dash ? "dash" : void 0, lead: true });
      pts.forEach((p, i) => p && items.push({ t: "dot", x: p[0], y: p[1], r: 0.8, sid, i }));
    });
    for (const sl of o.segLabels || []) {
      const v = o.series[0].v, xa = xOf(sl.i), xb = xOf(sl.i + 1), ya = yOf(v[sl.i]), yb = yOf(v[sl.i + 1]);
      const dx = xb - xa, dy = yb - ya, len = Math.hypot(dx, dy) || 1;
      let nx = dy / len, ny = -dx / len;
      if (ny > 0) {
        nx = -nx;
        ny = -ny;
      }
      items.push({ t: "text", x: (xa + xb) / 2 + nx * 3.4, y: (ya + yb) / 2 + ny * 3.4 + 1.3, s: sl.s, size: 3.6, bold: true });
    }
    return { type: "draw", w: ML + plotW + MR, h: MT + plotH + waveGap + MB, items, meta: { x0, colW, yBase, yMin, step, tick } };
  }
  // 図から値を読み直す(検算用)
  function readSeries(fig, sid = 0) {
    const { x0, colW, yBase, yMin, step, tick } = fig.meta;
    const out = [];
    for (const d of fig.items) if (d.t === "dot" && d.sid === sid) out[Math.round((d.x - x0) / colW - 0.5)] = yMin + Math.round((yBase - d.y) / tick) * step;
    return out;
  }
  function readBars(fig, per) {
    const { yBase, tick } = fig.meta, out = [];
    for (const b of fig.items) if (b.t === "poly" && b.bar !== void 0) out[b.bar] = Math.round((yBase - b.pts[1][1]) / tick) * per;
    return out;
  }
  function yMaxFor(values, th) {
    const us = th.step * th.major, max = Math.max(...values);
    return Math.max((th.wave || 0) + us * 2, Math.ceil((max + th.step) / us) * us);
  }

  // ===== ことば =====
  const W_TEMP = { up: "{上|あ}がり{方|かた}", down: "{下|さ}がり{方|かた}", upS: "{上|あ}がっている", downS: "{下|さ}がっている", hi: "{高|たか}い", lo: "{低|ひく}い", upBig: "いちばん{大|おお}きく{上|あ}がっている", downBig: "いちばん{大|おお}きく{下|さ}がっている" };
  const W_COUNT = { up: "ふえ{方|かた}", down: "へり{方|かた}", upS: "ふえている", downS: "へっている", hi: "{多|おお}い", lo: "{少|すく}ない", upBig: "いちばん{大|おお}きくふえている", downBig: "いちばん{大|おお}きくへっている" };
  const W_GROW = { up: "のび{方|かた}", down: "{短|みじか}くなり{方|かた}", upS: "のびている", downS: "{短|みじか}くなっている", hi: "{長|なが}い", lo: "{短|みじか}い", upBig: "いちばん{大|おお}きくのびている", downBig: "いちばん{大|おお}きく{短|みじか}くなっている" };
  const W_SHADOW = { up: "{長|なが}くなり{方|かた}", down: "{短|みじか}くなり{方|かた}", upS: "{長|なが}くなっている", downS: "{短|みじか}くなっている", hi: "{長|なが}い", lo: "{短|みじか}い", upBig: "いちばん{大|おお}きく{長|なが}くなっている", downBig: "いちばん{大|おお}きく{短|みじか}くなっている" };
  const W_WEIGHT = { up: "ふえ{方|かた}", down: "へり{方|かた}", upS: "ふえている", downS: "へっている", hi: "{重|おも}い", lo: "{軽|かる}い", upBig: "いちばん{大|おお}きくふえている", downBig: "いちばん{大|おお}きくへっている" };
  const W_DEPTH = { up: "{深|ふか}くなり{方|かた}", down: "{浅|あさ}くなり{方|かた}", upS: "{深|ふか}くなっている", downS: "{浅|あさ}くなっている", hi: "{深|ふか}い", lo: "{浅|あさ}い", upBig: "いちばん{大|おお}きく{深|ふか}くなっている", downBig: "いちばん{大|おお}きく{浅|あさ}くなっている" };
  const W_HEIGHT = { up: "のび{方|かた}", down: "", upS: "のびている", downS: "", hi: "{高|たか}い", lo: "{低|ひく}い", upBig: "いちばん{大|おお}きくのびている", downBig: "" };
  const W_DIST = { up: "ふえ{方|かた}", down: "", upS: "ふえている", downS: "", hi: "{長|なが}い", lo: "{短|みじか}い", upBig: "いちばん{大|おお}きくふえている", downBig: "" };
  const FLAT = "{変|か}わっていない";

  // ===== 題材 =====
  const MONTH_L = ["4", "5", "6", "7", "8", "9", "10", "11", "12", "1", "2", "3"].map((m) => `${m}{月|がつ}`);
  const hour = (h) => h === 12 ? "{正午|しょうご}" : h < 12 ? `{午前|ごぜん}${h}{時|じ}` : `{午後|ごご}${h - 12}{時|じ}`;
  const hourHalf = (h) => h < 12 ? `{午前|ごぜん}${h}{時|じ}30{分|ぷん}` : `{午後|ごご}${h - 12}{時|じ}30{分|ぷん}`;
  const hourLabels = (hs) => hs.map((h, i) => {
    if (h === 12) return "{正午|しょうご}";
    const pm = h > 12, hh = pm ? h - 12 : h;
    if (i === 0 || pm && hs[i - 1] <= 12) return `${pm ? "{午後|ごご}" : "{午前|ごぜん}"}${hh}`;
    return String(hh);
  });
  const minLabel = (m) => m === 0 ? "0" : String(m);
  const afterMin = (m, zero) => m === 0 ? zero : `${m}{分後|ふんご}`;
  const H9_4 = [9, 10, 11, 12, 13, 14, 15, 16];
  const H6_18 = [6, 8, 10, 12, 14, 16, 18];
  const H6_21 = [6, 9, 12, 15, 18, 21];
  const H9_15 = [9, 10, 11, 12, 13, 14, 15];
  const range = (a, b, s = 1) => Array.from({ length: Math.floor((b - a) / s) + 1 }, (_, i) => a + i * s);
  const smooth = (rng, base, top, peak, width, n) => Array.from({ length: n }, (_, i) => Math.round(base + top * Math.max(0, 1 - Math.abs(i - peak) / width)) + rng.int(0, 1));
  const THEMES = [
    {
      id: "monthTemp", title: "ある{町|まち}の{月|つき}ごとの{気温|きおん}", q: "{気温|きおん}", unit: "{度|ど}", xHead: "{月|つき}", xName: "{月|つき}", xTitle: "{月|がつ}",
      labels: MONTH_L, items: MONTH_L, step: 1, major: 5, wave: 0, w: W_TEMP, cont: true,
      make: (rng) => {
        const mean = rng.int(14, 17), amp = rng.int(9, 11), peak = 4 + rng.int(0, 1);
        return MONTH_L.map((_, i) => Math.round(mean + amp * Math.cos((i - peak) * Math.PI / 6) + rng.int(-1, 1)));
      }
    },
    {
      id: "dayTemp", title: "ある{日|ひ}の1{日|にち}の{気温|きおん}", q: "{気温|きおん}", unit: "{度|ど}", xHead: "{時|じ}こく", xName: "{時|じ}こく", xTitle: "{時|じ}",
      labels: hourLabels(H9_4), items: H9_4.map(hour), mids: H9_4.slice(0, -1).map(hourHalf), step: 1, major: 5, wave: 10, w: W_TEMP, cont: true,
      make: (rng) => smooth(rng, rng.int(14, 20), rng.int(5, 9), rng.int(4, 5), 5, 8)
    },
    {
      id: "summerTemp", title: "{夏|なつ}のある{日|ひ}の{気温|きおん}", q: "{気温|きおん}", unit: "{度|ど}", xHead: "{時|じ}こく", xName: "{時|じ}こく", xTitle: "{時|じ}",
      labels: hourLabels(H6_18), items: H6_18.map(hour), mids: H6_18.slice(0, -1).map((h) => hour(h + 1)), step: 1, major: 5, wave: 20, w: W_TEMP, cont: true,
      make: (rng) => smooth(rng, rng.int(23, 26), rng.int(7, 9), rng.int(3, 4), 4.5, 7)
    },
    {
      id: "groundTemp", title: "ある{日|ひ}の{地面|じめん}の{温度|おんど}", q: "{地面|じめん}の{温度|おんど}", unit: "{度|ど}", xHead: "{時|じ}こく", xName: "{時|じ}こく", xTitle: "{時|じ}",
      labels: hourLabels(H9_4), items: H9_4.map(hour), mids: H9_4.slice(0, -1).map(hourHalf), step: 1, major: 5, wave: 10, w: W_TEMP, cont: true,
      make: (rng) => smooth(rng, rng.int(14, 18), rng.int(12, 16), rng.int(3, 4), 5, 8)
    },
    {
      id: "bodyTemp", title: "かぜをひいた{日|ひ}の{体温|たいおん}", q: "{体温|たいおん}", unit: "{度|ど}", xHead: "{時|じ}こく", xName: "{時|じ}こく", xTitle: "{時|じ}",
      labels: hourLabels(H6_21), items: H6_21.map(hour), mids: H6_21.slice(0, -1).map((h) => h + 1 < 12 ? `{午前|ごぜん}${h + 1}{時|じ}30{分|ぷん}` : `{午後|ごご}${h + 1 - 12}{時|じ}30{分|ぷん}`), dp: 1, step: 1, major: 5, wave: 360, w: W_TEMP, cont: true,
      make: (rng) => {
        const s = rng.int(365, 369), pk = rng.int(2, 3), pv = rng.int(382, 390), e = rng.int(368, 374);
        return H6_21.map((_, i) => i <= pk ? Math.round(s + (pv - s) * i / pk) + (i && i < pk ? rng.int(-2, 2) : 0) : Math.round(pv + (e - pv) * (i - pk) / (5 - pk)) + (i < 5 ? rng.int(-2, 2) : 0));
      }
    },
    {
      id: "plant", title: "ヘチマのくきの{長|なが}さ", q: "ヘチマのくきの{長|なが}さ", unit: "cm", xHead: "{週|しゅう}", xName: "{週|しゅう}", xTitle: "{週|しゅう}",
      labels: range(1, 8).map((s) => `${s}{週|しゅう}`), items: range(1, 8).map((s) => `${s}{週目|しゅうめ}`), step: 10, major: 5, wave: 0, w: W_GROW, mono: 1, upN: "くきののび{方|かた}",
      make: (rng) => {
        let v = rng.int(1, 3) * 10;
        return range(1, 8).map(() => {
          const x = v;
          v += rng.pick([10, 20, 30, 40, 50, 30, 20]);
          return x;
        });
      }
    },
    {
      id: "asagao", title: "アサガオのつるの{長|なが}さ", q: "つるの{長|なが}さ", unit: "cm", xHead: "{週|しゅう}", xName: "{週|しゅう}", xTitle: "{週|しゅう}",
      labels: range(1, 7).map((s) => `${s}{週|しゅう}`), items: range(1, 7).map((s) => `${s}{週目|しゅうめ}`), step: 5, major: 4, wave: 0, w: W_GROW, mono: 1, upN: "つるののび{方|かた}",
      make: (rng) => {
        let v = rng.int(1, 3) * 5;
        return range(1, 7).map(() => {
          const x = v;
          v += rng.pick([5, 10, 15, 20, 25, 15, 10]);
          return x;
        });
      }
    },
    {
      id: "waterHeat", title: "{水|みず}をあたためたときの{温度|おんど}", q: "{水|みず}の{温度|おんど}", unit: "{度|ど}", xHead: "{時間|じかん}({分|ふん})", xName: "あたためた{時間|じかん}", xTitle: "{分|ふん}",
      labels: range(0, 10).map(minLabel), items: range(0, 10).map((m) => afterMin(m, "あたためる{前|まえ}")), mids: range(0, 9).map((m) => m === 0 ? "30{秒後|びょうご}" : `${m}{分|ふん}30{秒後|びょうご}`), step: 5, major: 4, wave: 0, w: W_TEMP, cont: true,
      make: (rng) => {
        let v = rng.pick([15, 20, 25]);
        const out = [];
        for (let i = 0; i <= 10; i++) {
          out.push(Math.min(v, 100));
          v += rng.pick([5, 10, 10, 15]);
        }
        const top = out.indexOf(100);
        return top >= 6 && top <= 9 ? out : null;
      }
    },
    {
      id: "coolWater", title: "お{湯|ゆ}がさめるときの{温度|おんど}", q: "お{湯|ゆ}の{温度|おんど}", unit: "{度|ど}", xHead: "{時間|じかん}({分|ふん})", xName: "{時間|じかん}", xTitle: "{分|ふん}",
      labels: range(0, 40, 5).map(minLabel), items: range(0, 40, 5).map((m) => afterMin(m, "はじめ")), step: 5, major: 4, wave: 0, w: W_TEMP, mono: -1, cont: true,
      make: (rng) => {
        const drops = Array.from({ length: 8 }, () => rng.pick([5, 5, 5, 10, 10, 15, 20])).sort((a, b) => b - a);
        let v = rng.pick([80, 85, 90]);
        const out = [v];
        for (const d of drops) out.push(v -= d);
        return out[8] >= 20 ? out : null;
      }
    },
    {
      id: "candle", title: "ろうそくがもえるときの{長|なが}さ", q: "ろうそくの{長|なが}さ", unit: "cm", xHead: "{時間|じかん}({分|ふん})", xName: "{時間|じかん}", xTitle: "{分|ふん}",
      labels: range(0, 30, 5).map(minLabel), items: range(0, 30, 5).map((m) => afterMin(m, "{火|ひ}をつけたとき")), mids: range(0, 25, 5).map((m) => `${m + 2}{分|ふん}30{秒後|びょうご}`), step: 1, major: 5, wave: 0, w: W_GROW, mono: -1, cont: true, downN: "ろうそくの{短|みじか}くなり{方|かた}",
      make: (rng) => {
        let v = rng.int(16, 20);
        return range(0, 30, 5).map((_, i) => i === 0 ? v : v -= rng.int(1, 3));
      }
    },
    {
      id: "shadow", title: "1mのぼうのかげの{長|なが}さ", q: "かげの{長|なが}さ", unit: "cm", xHead: "{時|じ}こく", xName: "{時|じ}こく", xTitle: "{時|じ}",
      labels: hourLabels(H9_15), items: H9_15.map(hour), mids: H9_15.slice(0, -1).map(hourHalf), step: 10, major: 5, wave: 0, w: W_SHADOW, cont: true,
      make: (rng) => {
        const c = rng.int(7, 11) * 10, L = [rng.pick([10, 20, 30]), rng.pick([30, 40, 50]), rng.pick([50, 60, 70, 80])], R = [rng.pick([10, 20, 30]), rng.pick([30, 40, 50]), rng.pick([60, 70, 80, 90])];
        return [c + L[0] + L[1] + L[2], c + L[0] + L[1], c + L[0], c, c + R[0], c + R[0] + R[1], c + R[0] + R[1] + R[2]];
      }
    },
    {
      id: "library", title: "{図書室|としょしつ}で{借|か}りられた{本|ほん}の{数|かず}", q: "{借|か}りられた{本|ほん}の{数|かず}", unit: "{冊|さつ}", xHead: "{月|つき}", xName: "{月|つき}", xTitle: "{月|がつ}",
      labels: MONTH_L, items: MONTH_L, step: 10, major: 5, wave: 0, w: W_COUNT,
      make: (rng) => MONTH_L.map((_, i) => i === 4 ? rng.int(2, 6) * 10 : i === 11 ? rng.int(6, 12) * 10 : rng.int(9, 24) * 10)
    },
    {
      id: "pool", title: "{夏休|なつやす}みにプールに{来|き}た{人|ひと}の{数|かず}", q: "プールに{来|き}た{人|ひと}の{数|かず}", unit: "{人|にん}", xHead: "{週|しゅう}", xName: "{週|しゅう}", xTitle: "{週|しゅう}",
      labels: range(1, 6).map((s) => `${s}{週|しゅう}`), items: range(1, 6).map((s) => `${s}{週目|しゅうめ}`), step: 10, major: 5, wave: 0, w: W_COUNT,
      make: (rng) => [rng.int(5, 9), rng.int(10, 16), rng.int(17, 24), rng.int(17, 25), rng.int(11, 16), rng.int(5, 10)].map((x) => x * 10)
    },
    {
      id: "puppy", title: "{子犬|こいぬ}の{体重|たいじゅう}", q: "{体重|たいじゅう}", unit: "kg", xHead: "{生|う}まれてからの{月数|つきすう}", xName: "{生|う}まれてからの{月数|つきすう}", xTitle: "か{月|げつ}",
      labels: range(1, 8).map(String), items: range(1, 8).map((m) => `{生|う}まれて${m}か{月|げつ}`), step: 1, major: 5, wave: 0, w: W_WEIGHT, mono: 1,
      make: (rng) => {
        const gains = Array.from({ length: 7 }, () => rng.pick([1, 1, 2, 2, 3, 3, 4])).sort((a, b) => b - a);
        let v = rng.int(1, 3);
        return [v, ...gains.map((g) => v += g)];
      }
    },
    {
      id: "height", title: "お{兄|にい}さんの{身長|しんちょう}(4{月|がつ}にはかったもの)", q: "{身長|しんちょう}", unit: "cm", xHead: "{学年|がくねん}", xName: "{学年|がくねん}", xTitle: "{年|ねん}",
      labels: range(1, 6).map((g) => `${g}{年|ねん}`), items: range(1, 6).map((g) => `${g}{年生|ねんせい}のとき`), step: 2, major: 5, wave: 100, w: W_HEIGHT, mono: 1, upN: "{身長|しんちょう}ののび{方|かた}",
      make: (rng) => {
        let v = rng.pick([114, 116, 118, 120]);
        return range(1, 6).map((_, i) => i === 0 ? v : v += rng.pick([4, 6, 6, 8]));
      }
    },
    {
      id: "waterDepth", title: "{水|みず}そうに{水|みず}を{入|い}れたときの{水|みず}の{深|ふか}さ", q: "{水|みず}の{深|ふか}さ", unit: "cm", xHead: "{時間|じかん}({分|ふん})", xName: "{水|みず}を{入|い}れた{時間|じかん}", xTitle: "{分|ふん}",
      labels: range(0, 8).map(minLabel), items: range(0, 8).map((m) => afterMin(m, "{入|い}れる{前|まえ}")), step: 1, major: 5, wave: 0, w: W_DEPTH, cont: true,
      make: (rng) => {
        const a = rng.pick([2, 3, 4]), b = rng.pick([1, 2, 5, 6]), s1 = rng.int(2, 4), s2 = rng.int(s1 + 2, 7);
        let v = 0;
        return range(0, 8).map((_, i) => i === 0 ? 0 : v += i <= s1 ? a : i <= s2 ? b : 0);
      }
    },
    {
      id: "walk", title: "{家|いえ}から{公園|こうえん}まで{歩|ある}いたときの{道|みち}のり", q: "{歩|ある}いた{道|みち}のり", unit: "m", xHead: "{時間|じかん}({分|ふん})", xName: "{歩|ある}いた{時間|じかん}", xTitle: "{分|ふん}",
      labels: range(0, 10).map(minLabel), items: range(0, 10).map((m) => afterMin(m, "{家|いえ}を{出|で}たとき")), step: 50, major: 4, wave: 0, w: W_DIST, mono: 1,
      make: (rng) => {
        const stop = rng.int(3, 8);
        let v = 0;
        return range(0, 10).map((_, i) => i === 0 ? 0 : v += i === stop ? 0 : rng.pick([50, 50, 100, 100, 150]));
      }
    },
    {
      id: "freezer", title: "{冷|れい}とう{庫|こ}に{入|い}れた{水|みず}の{温度|おんど}", q: "{水|みず}の{温度|おんど}", unit: "{度|ど}", xHead: "{時間|じかん}({分|ふん})", xName: "{入|い}れてからの{時間|じかん}", xTitle: "{分|ふん}",
      labels: range(0, 80, 10).map(minLabel), items: range(0, 80, 10).map((m) => afterMin(m, "{入|い}れたとき")), step: 1, major: 5, wave: 0, w: W_TEMP, mono: -1, cont: true,
      make: (rng) => {
        let v = rng.int(18, 25);
        const out = [v];
        for (let i = 1; i <= 8; i++) out.push(v = Math.max(0, v - Math.max(1, Math.round(v * rng.pick([0.3, 0.35, 0.4])))));
        const z = out.indexOf(0);
        return z >= 4 && z <= 7 ? out : null;
      }
    },
    {
      id: "icecream", title: "ある{店|みせ}でアイスクリームが{売|う}れた{数|かず}", q: "{売|う}れた{数|かず}", unit: "こ", xHead: "{月|つき}", xName: "{月|つき}", xTitle: "{月|がつ}",
      labels: MONTH_L, items: MONTH_L, step: 10, major: 5, wave: 0, w: W_COUNT,
      make: (rng) => MONTH_L.map((_, i) => Math.max(20, Math.round((60 + 180 * Math.max(0, Math.cos((i - 4 + rng.int(-1, 1) * 0.3) * Math.PI / 6)) + rng.int(-2, 2) * 10) / 10) * 10))
    }
  ];
  // 値をつくる(値が目もりの上にのる・範囲内・ねらいの条件をみたすまでやり直す)
  function makeValues(rng, th, ok = () => true) {
    for (let t = 0; t < 200; t++) {
      const v = th.make(rng);
      if (!v || v.length !== th.labels.length) continue;
      if (v.some((x) => x % th.step !== 0 || x < (th.wave ? th.wave + th.step : 0))) continue;
      const yMax = yMaxFor(v, th);
      if ((yMax - (th.wave || 0)) / th.step > 46) continue;
      if (!ok(v)) continue;
      return { v, yMax };
    }
    return null;
  }
  const lineOf = (th, d, extra = {}) => chart({ labels: th.labels, series: [{ v: d.v }], yMax: d.yMax, yMin: th.wave || 0, step: th.step, major: th.major, dp: th.dp, unit: th.unit, xTitle: th.xTitle, ...extra });
  const val = (th, x) => `${fmtV(x, th.dp)}${th.unit}`;
  const diffsOf = (v) => v.slice(1).map((x, i) => x - v[i]);
  const uniqueIdx = (arr, x) => arr.filter((y) => y === x).length === 1 ? arr.indexOf(x) : -1;
  const between = (th, i, j = i + 1) => `${th.items[i]}から${th.items[j]}の{間|あいだ}`;
  const upN = (th) => th.upN || `${th.q}の${th.w.up}`;
  const downN = (th) => th.downN || `${th.q}の${th.w.down}`;
  const plain = (s) => String(s).replace(/\{([^|}]*)\|[^}]*\}/g, "$1");
  const pickThemes = (p) => THEMES.filter((t) => p.themes === "all" || p.themes.includes(t.id));
