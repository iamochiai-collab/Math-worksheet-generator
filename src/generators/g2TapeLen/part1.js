// 2年「長さのたんい」:テープの長さをものさしではかる(何cm何mm)。
// テープは灰色のおびで、ものさしのふちにぴったりのせる。はしから点線を目もりまでおろして、どこからどこまでかを見やすくする。
// ★1 は0から、★2 は0でない cm の目もりから、★3 は mm の目もりから(ものさしも8cm)
var g2TapeLen = (() => {
  const cmmm = (v) => `${Math.floor(v / 10)}cm${v % 10}mm`;
  function figure(start, len, maxCm) {
    const K = maxCm > 6 ? 1.75 : 2.2; // 1mm を何mmでかくか
    const L = 6, R = maxCm * 10;
    const X = (v) => L + 4 + v * K;
    const tapeY = 3, tapeH = 7.5, top = tapeY + tapeH, rulerH = 17;
    const W = X(R) + 12;
    const items = [];
    // ものさし
    items.push({ t: "poly", pts: [[L, top], [X(R) + 5, top], [X(R) + 5, top + rulerH], [L, top + rulerH]], fill: "#fffdf3", w: 0.5, lead: true });
    for (let v = 0; v <= R; v++) {
      const len = v % 10 === 0 ? 6.5 : v % 5 === 0 ? 4.6 : 3;
      items.push({ t: "line", x1: X(v), y1: top, x2: X(v), y2: top + len, w: v % 10 === 0 ? 0.45 : v % 5 === 0 ? 0.3 : 0.2, lead: true });
      if (v % 10 === 0) items.push({ t: "text", x: X(v), y: top + 12.2, s: String(v / 10), size: 4.4, halo: false });
    }
    items.push({ t: "text", x: X(R) + 3.6, y: top + 15.2, s: "cm", size: 3.2, anchor: "end", halo: false });
    // テープ(灰色のおび)と、はしからおろす点線
    const x1 = X(start), x2 = X(start + len);
    items.push({ t: "poly", pts: [[x1, tapeY], [x2, tapeY], [x2, top], [x1, top]], fill: "#cfcfcf", w: 0.6, lead: true });
    for (const x of [x1, x2]) items.push({ t: "line", x1: x, y1: tapeY - 2, x2: x, y2: top + 6.5, w: 0.4, dash: "1.2 0.9", color: "#333", lead: true });
    return { type: "draw", w: W, h: top + rulerH + 1.5, items, meta: { start, len, maxCm } };
  }
  const gen = {
    id: "g2.tapeLen",
    grade: 2,
    instruction: "テープの{長|なが}さは、{何|なん}cm{何|なん}mmですか。",
    defaults: { from: "zero", maxCm: 6 },
    levels: {
      basic: { from: "zero", maxCm: 6 },
      normal: { from: "cm", maxCm: 6 },
      challenge: { from: "mm", maxCm: 8 }
    },
    generate(rng, p) {
      const R = p.maxCm * 10;
      for (let t = 0; t < 500; t++) {
        const start = p.from === "zero" ? 0 : p.from === "cm" ? rng.int(1, 4) * 10 : rng.int(3, 45);
        if (p.from === "mm" && start % 10 === 0) continue;
        const len = rng.int(12, R - start);
        if (len % 10 === 0 || start + len > R) continue;
        return {
          key: `tl:${start}:${len}`,
          softKey: `tl${len}`,
          text: "",
          ansBox: "□cm□mm",
          sideNo: true,
          wide: true,
          figure: figure(start, len, p.maxCm),
          answer: { display: cmmm(len), value: len },
          meta: { start, len }
        };
      }
      throw new Error("テープの問題が作れない");
    },
    verify(pr, p) {
      const { start, len } = pr.figure.meta;
      if (pr.answer.display !== cmmm(len) || pr.answer.value !== len) return "答えが合わない";
      if (len % 10 === 0) return "mm が0";
      if (start + len > p.maxCm * 10) return "ものさしからはみ出す";
      if (p.from === "zero" && start !== 0) return "0からでない";
      if (p.from === "cm" && (start === 0 || start % 10)) return "cm の目もりからでない";
      if (p.from === "mm" && start % 10 === 0) return "mm の目もりからでない";
      return null;
    }
  };
  return [gen];
})();
