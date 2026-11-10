// 2年「長さのたんい」:テープの長さをものさしではかる(何cm何mm/何cm)。
// テープは灰色のおびで、ものさしのふちにぴったりのせる。はしから点線を目もりまでおろして、どこからどこまでかを見やすくする。
// ★1 は0から、★2 は0でない cm の目もりから、★3 は mm の目もりから(ものさしも8cm)。
// 小単元のプリントでは「テープのはじまり」「答え(何cm何mm/何cmだけ)」「1ページの問題数(3〜6)」をえらべる(topic.options)
var g2TapeLen = (() => {
  const cmmm = (v) => `${Math.floor(v / 10)}cm${v % 10}mm`;
  const cmOnly = (v) => `${v / 10}cm`;
  // 1ページの問題数ごとの大きさ(K:1mm を何mmでかくか、テープ・ものさしの高さ、数字の大きさ)
  const SIZE = {
    3: { K: 2.4, tapeH: 9, rulerH: 19, num: 5, gap: 1.12 },
    4: { K: 2.2, tapeH: 7.5, rulerH: 17, num: 4.4, gap: 1 },
    // 5・6問は ものさしを ひくくして、答えの四角も少しひくく(compact)
    5: { K: 2.2, tapeH: 6.5, rulerH: 14, num: 4.2, gap: 0.86 },
    6: { K: 2.2, tapeH: 5, rulerH: 11.5, num: 3.8, gap: 0.72 }
  };
  function figure(start, len, maxCm, per) {
    const S = SIZE[per] || SIZE[4];
    const K = maxCm > 6 ? S.K * 0.8 : S.K;
    const L = 6, R = maxCm * 10;
    const X = (v) => L + 4 + v * K;
    const tapeY = 3, top = tapeY + S.tapeH, g = S.gap;
    const items = [];
    // ものさし
    items.push({ t: "poly", pts: [[L, top], [X(R) + 9, top], [X(R) + 9, top + S.rulerH], [L, top + S.rulerH]], fill: "#fffdf3", w: 0.5, lead: true });
    for (let v = 0; v <= R; v++) {
      const len = (v % 10 === 0 ? 6.5 : v % 5 === 0 ? 4.6 : 3) * g;
      items.push({ t: "line", x1: X(v), y1: top, x2: X(v), y2: top + len, w: v % 10 === 0 ? 0.45 : v % 5 === 0 ? 0.3 : 0.2, lead: true });
      if (v % 10 === 0) items.push({ t: "text", x: X(v), y: top + 6.5 * g + S.num * 1.15, s: String(v / 10), size: S.num, halo: false });
    }
    // 「cm」は さいごの数字の右に(数字とかさならないように)
    items.push({ t: "text", x: X(R) + S.num * 0.45, y: top + 6.5 * g + S.num * 1.15, s: "cm", size: S.num * 0.7, anchor: "start", halo: false });
    // テープ(灰色のおび)と、はしからおろす点線
    const x1 = X(start), x2 = X(start + len);
    items.push({ t: "poly", pts: [[x1, tapeY], [x2, tapeY], [x2, top], [x1, top]], fill: "#cfcfcf", w: 0.6, lead: true });
    for (const x of [x1, x2]) items.push({ t: "line", x1: x, y1: tapeY - 2, x2: x, y2: top + 6.5 * g, w: 0.4, dash: "1.2 0.9", color: "#333", lead: true });
    return { type: "draw", w: X(R) + 15, h: top + S.rulerH + 1.5, items, meta: { start, len, maxCm } };
  }
  const gen = {
    id: "g2.tapeLen",
    grade: 2,
    instruction: "テープの{長|なが}さは、{何|なん}cm{何|なん}mmですか。",
    instructionFor: (p) => p.unit === "cm" ? "テープの{長|なが}さは、{何|なん}cmですか。" : "テープの{長|なが}さは、{何|なん}cm{何|なん}mmですか。",
    defaults: { from: "zero", maxCm: 6, unit: "cmmm", per: 4 },
    levels: {
      basic: { from: "zero", maxCm: 6 },
      normal: { from: "cm", maxCm: 6 },
      challenge: { from: "mm", maxCm: 8 }
    },
    generate(rng, p, ctx) {
      const R = p.maxCm * 10, cm = p.unit === "cm";
      for (let t = 0; t < 500; t++) {
        // まぜる:0からと とちゅう(cm の目もり)から。★3 は mm の目もりからも
        const from = p.from !== "mix" ? p.from : rng.pick(p.maxCm > 6 ? ["zero", "cm", "mm"] : ["zero", "cm"]);
        const start = from === "zero" ? 0 : from === "cm" ? rng.int(1, Math.min(4, p.maxCm - 2)) * 10 : rng.int(3, Math.min(45, R - 15));
        if (from === "mm" && start % 10 === 0) continue;
        const len = cm ? rng.int(1, Math.floor((R - start) / 10)) * 10 : rng.int(12, R - start);
        if (!cm && len % 10 === 0 || start + len > R || len < 10) continue;
        return {
          key: `tl:${start}:${len}`,
          softKey: `tl${len}`,
          text: "",
          ansBox: cm ? "□cm" : "□cm□mm",
          sideNo: true,
          compact: p.per >= 5,
          wide: true,
          figure: figure(start, len, p.maxCm, p.per),
          answer: { display: cm ? cmOnly(len) : cmmm(len), value: len },
          meta: { start, len, from }
        };
      }
      throw new Error("テープの問題が作れない");
    },
    verify(pr, p) {
      const { start, len } = pr.figure.meta, from = pr.meta.from;
      const cm = p.unit === "cm";
      if (pr.answer.display !== (cm ? cmOnly(len) : cmmm(len)) || pr.answer.value !== len) return "答えが合わない";
      if (cm ? len % 10 : len % 10 === 0) return cm ? "cm だけでない" : "mm が0";
      if (start + len > p.maxCm * 10) return "ものさしからはみ出す";
      if (p.from !== "mix" && from !== p.from) return "はじまりがちがう";
      if (from === "zero" && start !== 0) return "0からでない";
      if (from === "cm" && (start === 0 || start % 10)) return "cm の目もりからでない";
      if (from === "mm" && start % 10 === 0) return "mm の目もりからでない";
      return null;
    }
  };
  return [gen];
})();
