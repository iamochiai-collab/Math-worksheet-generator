// 「測定」:はかりや 計量カップの はりや 水の高さを そのまま読む(「1めもりは何g」は きかない)。
// ★1 は数字の書いてある目もりちょうど、★2 は そのあいだ(50ごと/とちゅうの目もり)、★3 は どの目もりでも。
// 小単元の設定「はりの いち」でも えらべる。特別支援の「測定」(GRADES[29])で使う
var sokutei = (() => {
  const txt = (x, y, s, size, o = {}) => ({ t: "text", x, y, s: String(s), size, halo: false, ...o });
  const rr = (x, y, w, h, r) => ({ t: "path", d: `M${x + r} ${y} H${x + w - r} A${r} ${r} 0 0 1 ${x + w} ${y + r} V${y + h - r} A${r} ${r} 0 0 1 ${x + w - r} ${y + h} H${x + r} A${r} ${r} 0 0 1 ${x} ${y + h - r} V${y + r} A${r} ${r} 0 0 1 ${x + r} ${y} Z`, w: 0.6, fill: "white", lead: true });
  // どの目もりに はりを おくか:label=数字の目もりだけ / half=数字のあいだの まん中 / any=ほかの目もり
  function pickValue(rng, max, minor, label, where) {
    const all = [];
    for (let v = minor; v < max; v += minor) all.push(v);
    const pool = all.filter((v) => where === "label" ? v % label === 0 : where === "half" ? v % (label / 2) === 0 && v % label !== 0 : v % (label / 2) !== 0);
    return rng.pick(pool.length ? pool : all);
  }

  // ===== はかり(1kg まで)=====
  const OBJ = ["apple", "mikan", "strawberry", "fish", "acorn", "candy"];
  function scaleFig(value, max, objKind) {
    const R = 25, cx = 36, cy = 50, items = [];
    const minor = max / 100, label = max / 10;
    // 皿と ささえ
    items.push({ t: "path", d: `M${cx - 30} ${cy - 37} H${cx + 30} L${cx + 26} ${cy - 33} H${cx - 26} Z`, w: 0.6, fill: "gray", lead: true });
    items.push({ t: "path", d: `M${cx - 4} ${cy - 33} H${cx + 4} V${cy - 30} H${cx - 4} Z`, w: 0.5, fill: "white", lead: true });
    if (objKind) items.push(...icon(objKind, cx, cy - 44, 13));
    items.push(rr(cx - 32, cy - 30, 64, 63, 6));
    items.push({ t: "circle", cx, cy, r: R + 1.2, w: 0.7, fill: "white" });
    const at = (v, r) => [cx + r * Math.sin(v / max * 2 * Math.PI), cy - r * Math.cos(v / max * 2 * Math.PI)];
    for (let v = 0; v < max; v += minor) {
      const big = v % label === 0, mid = !big && v % (label / 2) === 0;
      const [x1, y1] = at(v, R), [x2, y2] = at(v, R - (big ? 3.6 : mid ? 2.6 : 1.6));
      items.push({ t: "line", x1, y1, x2, y2, w: big ? 0.45 : mid ? 0.32 : 0.2, lead: true });
      if (big) {
        const [tx, ty] = at(v, R - 7.4);
        items.push(txt(tx, ty + 1.3, v === 0 ? "0" : String(v), 3.6));
      }
    }
    items.push(txt(cx, cy + R + 5.6, "g", 3.6));
    // はり(細い まっすぐな はり。先を少し とがらせる)
    const [nx, ny] = at(value, R - 1), [bx, by] = at(value, -3);
    items.push({ t: "line", x1: bx, y1: by, x2: nx, y2: ny, w: 0.7, lead: true, cap: "round", tag: "needle", value });
    items.push({ t: "circle", cx, cy, r: 1.5, w: 0, fill: "black" });
    return { type: "draw", w: cx * 2, h: cy + 34, items, scaleK: 1, meta: { value, max } };
  }
  const tScale = {
    id: "t.scaleDial",
    instruction: "はりが さして いる {重|おも}さを {読|よ}みましょう。",
    defaults: { where: "label", max: 1000 },
    levels: { basic: { where: "label" }, normal: { where: "half" }, challenge: { where: "any" } },
    generate(rng, p) {
      const max = p.max || 1000, value = pickValue(rng, max, max / 100, max / 10, p.where);
      const obj = rng.pick(OBJ);
      return {
        key: `sd:${value}`,
        softKey: `sd${Math.round(value / 100)}`,
        text: "",
        cols: 2,
        figure: scaleFig(value, max, obj),
        answer: { display: `${value}g`, value },
        meta: { value, max, where: p.where }
      };
    },
    verify(pr, p) {
      const { value, max } = pr.meta;
      const nd = pr.figure.items.find((it) => it.tag === "needle");
      if (!nd || nd.value !== value) return "はりが合わない";
      const ang = (Math.atan2(nd.x2 - 36, -(nd.y2 - 50)) / (2 * Math.PI) * max + max) % max;
      if (Math.abs(ang - value) > 0.01) return `はりの むきが ちがう ${ang}`;
      if (pr.answer.display !== `${value}g`) return "答えが合わない";
      const lab = max / 10;
      if (p.where === "label" && value % lab) return "数字の目もりでない";
      if (p.where === "half" && (value % (lab / 2) || value % lab === 0)) return "あいだの目もりでない";
      if (p.where === "any" && value % (lab / 2) === 0) return "どの目もりでも(数字・まん中いがい)でない";
      return null;
    }
  };

  // ===== 計量カップ =====
  function cupFig(value, max) {
    const minor = 10, label = max <= 200 ? 50 : 100;
    const top = 10, bot = 74, H = 60; // 0 は カップの そこ(bot)、max は bot-H
    const xl = (y) => 22 + (bot - y) * 0.06, xr = (y) => 58 - (bot - y) * 0.06; // 少し上が広い。数字は カップの 左の 外に
    const Y = (v) => bot - v / max * H;
    const items = [];
    // 水
    const yw = Y(value);
    items.push({ t: "poly", pts: [[xl(bot), bot], [xr(bot), bot], [xr(yw), yw], [xl(yw), yw]], w: 0, fill: "#d6e4f0", lead: true });
    items.push({ t: "line", x1: xl(yw), y1: yw, x2: xr(yw), y2: yw, w: 0.5, lead: true, tag: "water", value });
    // カップと とって
    items.push({ t: "path", d: `M${xl(top)} ${top} L${xl(bot)} ${bot} H${xr(bot)} L${xr(top)} ${top}`, w: 0.7, fill: "none", lead: true });
    items.push(txt(xl(bot) - 1.6, bot + 1.3, "0", 3.6, { anchor: "end" }));
    items.push({ t: "path", d: `M${xr(22)} 22 C${xr(22) + 13} 22 ${xr(22) + 13} 52 ${xr(52)} 52`, w: 0.7, fill: "none", lead: true });
    items.push({ t: "path", d: `M${xr(26)} 26.5 C${xr(26) + 8.5} 26.5 ${xr(26) + 8.5} 47.5 ${xr(48)} 47.5`, w: 0.5, fill: "none", lead: true });
    // 目もり(左の かべから 内がわへ)と 数字
    for (let v = minor; v <= max; v += minor) {
      const y = Y(v), big = v % label === 0, mid = !big && v % (label / 2) === 0;
      items.push({ t: "line", x1: xl(y) + 0.3, y1: y, x2: xl(y) + (big ? 7 : mid ? 5 : 3), y2: y, w: big ? 0.45 : mid ? 0.32 : 0.2, lead: true });
      if (big) items.push(txt(xl(y) - 1.6, y + 1.3, String(v), 3.6, { anchor: "end" }));
    }
    items.push(txt(xl(top) - 1.6, top + 1, "(mL)", 3, { anchor: "end" }));
    return { type: "draw", w: 78, h: bot + 4, items, scaleK: 1.1, meta: { value, max } };
  }
  const tCup = {
    id: "t.cupRead",
    instruction: "{水|みず}は {何|なん}mL {入|はい}って いますか。",
    defaults: { where: "label", max: 200 },
    // 200mL のカップは 50ごとに数字(まん中の目もりはない)。★3 は 500mL のカップ(100ごとに数字、50 に中くらいの目もり)
    levels: { basic: { where: "label", max: 200 }, normal: { where: "any", max: 200 }, challenge: { where: "any", max: 500 } },
    generate(rng, p) {
      const max = p.max || 200, label = max <= 200 ? 50 : 100;
      const value = pickValue(rng, max + 10, 10, label, p.where === "half" && max <= 200 ? "any" : p.where);
      const v = Math.min(value, max);
      return {
        key: `cr:${max}:${v}`,
        softKey: `cr${Math.round(v / 50)}`,
        text: "",
        cols: 2,
        figure: cupFig(v, max),
        answer: { display: `${v}mL`, value: v },
        meta: { value: v, max }
      };
    },
    verify(pr, p) {
      const { value, max } = pr.meta;
      const w = pr.figure.items.find((it) => it.tag === "water");
      if (!w || w.value !== value) return "水の高さが合わない";
      if (Math.abs((74 - w.y1) / 60 * max - value) > 0.01) return "水の高さの いちが ちがう";
      if (pr.answer.display !== `${value}mL`) return "答えが合わない";
      const lab = max <= 200 ? 50 : 100;
      if (value <= 0 || value > max) return "目もりの外";
      if (p.where === "label" && value % lab) return "数字の目もりでない";
      const wh = p.where === "half" && max <= 200 ? "any" : p.where;
      if (wh === "half" && (value % (lab / 2) || value % lab === 0)) return "あいだの目もりでない";
      if (wh === "any" && value % (lab / 2) === 0) return "どの目もりでも でない";
      return null;
    }
  };
  return [tScale, tCup];
})();
// 「測定」のまとまり(メニューのボタン「測定」= GRADES[29])。生徒が じっさいに読む力をつける プリントだけを あつめる
var sokuteiStage = (() => {
  const where = { key: "where", label: "はりの いち", choices: [["auto", "★に合わせる"], ["label", "数字の ところ ちょうど"], ["half", "数字の あいだ(まん中)"], ["any", "どの 目もりでも"]] };
  const lvl = { basic: { where: "label" }, normal: { where: "half" }, challenge: { where: "any" } };
  return {
    key: 29, name: "測定", ruby: "{測定|そくてい}", short: "", btn: "測定", part: "測定", styleGrade: 2,
    note: "長さ・重さ・かさ・時計を、ものさし・はかり・計量カップ・時計で じっさいに読む練習(「1目もりは何g」ではなく、さしている数を読む)",
    units: [
      { name: "{長|なが}さ", domain: "ものさし", from: [
        ["g2-04:5", { basic: { from: "zero", unit: "cm" }, normal: { from: "zero" }, challenge: { from: "cm" } }, { label: "ものさしで テープを はかろう", kinds: ["figure"] }],
        ["t.unitMatch", null, { label: "たんいを せんで むすぼう", kinds: ["yoji"], options: [{ key: "set", label: "たんい", choices: [["auto", "★に合わせる"], ["cm_m", "cm・m"], ["mm_cm_m", "mm・cm・m"], ["all", "mm・cm・m・km"]] }] }]
      ] },
      { name: "{重|おも}さ", domain: "はかり", from: [["t.scaleDial", lvl, { label: "はかりを よもう", kinds: ["figure"], options: [where] }], ["t.weightMatch", null, { label: "たんいを せんで むすぼう", kinds: ["yoji"], options: [{ key: "set", label: "たんい", choices: [["auto", "★に合わせる"], ["g_kg", "g・kg"], ["all", "g・kg・t"]] }] }]] },
      { name: "かさ", domain: "計量カップ", from: [["t.cupRead", null, { label: "計量カップを よもう", kinds: ["figure"], options: [{ key: "where", label: "水の 高さ", choices: [["auto", "★に合わせる"], ["label", "数字の ところ ちょうど"], ["any", "数字の あいだの 目もり"]] }, { key: "max", label: "カップ", num: true, choices: [["auto", "★に合わせる"], ["200", "200mL"], ["500", "500mL"]] }] }], ["t.volMatch", null, { label: "たんいを せんで むすぼう", kinds: ["yoji"], options: [{ key: "set", label: "たんい", choices: [["auto", "★に合わせる"], ["dL_L", "dL・L"], ["all", "mL・dL・L"]] }] }]] },
      { name: "とけい", domain: "時計", from: [["g1-08:1", null, "なんじ・なんじはんを よむ"], ["g1-08:2", null, "なんじ・なんじはんの はりを かく"], ["g1-16:1", null, "なんじなんぷんを よむ"], ["g1-16:2", null, "なんじなんぷんの はりを かく"], ["g1-08:3", null, "とけいと よみかたを むすぶ"], ["g1-16:3", null, "なんじなんぷんを むすぶ"]] }
    ]
  };
})();
