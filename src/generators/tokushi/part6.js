// 特別支援:長さ・重さ・かさの たんいを 絵と せんで むすぶ(あり ― mm、えんぴつ ― cm、くるま ― m、やまへの みち ― km/たまご ― g …/コップ ― dL …)。
// 左に ものの絵と名前、右に たんい。どちらも おなじ数で、つかわない たんいは 出さない(まよわないように)。
// ★1 は cm・m、★2 は mm・cm・m、★3 は km まで。小単元の設定「たんい」でも えらべる。
(() => {
  const W = 172, RED = "#d7263d", GRAY = "#c2c2c2";
  const SETS = { cm_m: ["cm", "m"], mm_cm_m: ["mm", "cm", "m"], all: ["mm", "cm", "m", "km"] };
  // たんいごとの もの(絵の名前)
  const THINGS = {
    mm: [["ant", "あり"], ["ladybug", "てんとうむし"]],
    cm: [["pencil", "えんぴつ"], ["eraser", "けしゴム"]],
    m: [["car", "くるま"], ["bus", "バス"]],
    km: [["mountain", "やままでの みち"], ["towns", "となりの まちまで"]]
  };
  // 絵(-50〜50 の中に かいて、s の大きさにする)。どれも 線と 白・灰色・黒の ぬりだけ
  function lenIcon(kind, cx, cy, s) {
    const { path, ell } = pen(cx, cy, s);
    const w = Math.max(0.35, s * 0.045), it = [];
    const P = (d, fill = "white", o = {}) => it.push({ t: "path", d: path(d), w, fill, ...o });
    const E = (u, v, rx, ry, fill = "white", o = {}) => it.push({ t: "path", d: ell(u, v, rx, ry), w, fill, ...o });
    const B = (u, v, r) => it.push({ t: "path", d: ell(u, v, r, r), w: 0, fill: "black" });
    switch (kind) {
      case "ant":
        for (const d of ["M-12,3 L-24,14 L-34,24", "M-9,5 L-12,18 L-18,30", "M-5,4 L4,16 L10,30", "M-12,-3 L-24,-14 L-34,-22", "M-9,-5 L-10,-18 L-16,-28", "M-5,-4 L6,-16 L12,-26", "M-36,-5 L-44,-15 L-49,-12", "M-36,3 L-44,11 L-49,9"]) P(d, "none");
        E(-31, -1, 8, 7.5, "black");
        E(-11, 0, 9, 6.5, "black");
        E(19, 1, 17, 12.5, "black");
        break;
      case "ladybug":
        for (const d of ["M-22,-8 L-36,-14", "M-24,8 L-38,8", "M-20,22 L-32,32", "M22,-8 L36,-14", "M24,8 L38,8", "M20,22 L32,32", "M-5,-36 L-12,-46", "M5,-36 L12,-46"]) P(d, "none");
        E(0, -29, 13, 10, "black");
        E(0, 6, 30, 32);
        P("M0,-25 L0,38", "none");
        for (const [u, v, r] of [[-14, -8, 5.5], [14, -8, 5.5], [-17, 14, 5], [17, 14, 5], [-9, 28, 4.5], [9, 28, 4.5]]) B(u, v, r);
        break;
      case "pencil":
        P("M-48,-9 L-38,-9 L-38,9 L-48,9 Z", "gray");
        P("M-38,-9 L24,-9 L24,9 L-38,9 Z");
        P("M-38,-3 L24,-3 M-38,3 L24,3", "none");
        P("M24,-9 L47,0 L24,9 Z");
        P("M39,-3 L47,0 L39,3 Z", "black");
        break;
      case "eraser":
        P("M-36,-16 L36,-16 Q40,-16 40,-12 L40,12 Q40,16 36,16 L-36,16 Q-40,16 -40,12 L-40,-12 Q-40,-16 -36,-16 Z");
        P("M-8,-16 L40,-16 L40,16 L-8,16 Z", "gray");
        break;
      case "car":
        P("M-46,12 L-46,-2 Q-46,-6 -40,-6 L-30,-7 L-18,-24 L16,-24 L30,-7 L42,-5 Q47,-4 47,2 L47,12 Z");
        P("M-14,-20 L-2,-20 L-2,-8 L-25,-8 Z", "gray");
        P("M2,-20 L14,-20 L25,-8 L2,-8 Z", "gray");
        P("M-46,2 L-40,2 M41,0 L47,0", "none");
        for (const u of [-26, 26]) {
          E(u, 12, 10, 10, "black");
          E(u, 12, 4, 4, "white");
        }
        break;
      case "bus":
        P("M-46,14 L-46,-22 Q-46,-28 -40,-28 L42,-28 Q48,-28 48,-22 L48,14 Z");
        for (const u of [-40, -22, -4, 14]) P(`M${u},-22 L${u + 14},-22 L${u + 14},-8 L${u},-8 Z`, "gray");
        P("M32,-22 L43,-22 L43,8 L32,8 Z");
        P("M-46,0 L32,0", "none");
        for (const u of [-28, 28]) {
          E(u, 14, 9, 9, "black");
          E(u, 14, 3.5, 3.5, "white");
        }
        break;
      case "mountain":
        P("M-48,-4 L-26,-36 L-10,-14 L8,-40 L34,-4 Z");
        P("M2,-31 L8,-40 L14,-31 L10,-28 L8,-31 L5,-28 Z", "gray");
        P("M-48,-4 L48,-4", "none");
        P("M-3,-4 L3,-4 L30,44 L-30,44 Z", "gray");
        for (const [a, b] of [[0, 6], [12, 20], [28, 38]]) P(`M0,${a} L0,${b}`, "none", { color: "white", w: w * 1.6 });
        break;
      case "towns":
        for (const u of [-36, 36]) {
          P(`M${u - 11},2 L${u + 11},2 L${u + 11},22 L${u - 11},22 Z`);
          P(`M${u - 14},3 L${u},-12 L${u + 14},3 Z`, "gray");
          P(`M${u - 3},12 L${u + 3},12 L${u + 3},22 L${u - 3},22 Z`, "white");
        }
        P("M-24,30 L24,30", "none", { dash: "2.5 2" });
        P("M-24,30 L-18,26 M-24,30 L-18,34 M24,30 L18,26 M24,30 L18,34", "none");
        break;
    }
    return it;
  }
  // 長さ・重さ・かさ:左に ものの絵(イラスト。ないときは 線の絵)、右に たんい
  const DIMS = {
    len: {
      id: "t.unitMatch", what: "ながさを はかる", order: ["mm", "cm", "m", "km"],
      sets: SETS, levels: { basic: "cm_m", normal: "mm_cm_m", challenge: "all" },
      things: {
        mm: [["ant", "あり"], ["ladybug", "てんとうむし"], ["button", "ボタン"]],
        cm: [["pencil", "えんぴつ"], ["eraser", "けしゴム"], ["hand", "手"], ["textbook", "きょうかしょ"], ["uwabaki", "うわばき"], ["pencase", "ふでばこ"]],
        m: [["car", "くるま"], ["bus", "バス"], ["pool", "プール"], ["tree", "大きな 木"], ["train", "でんしゃ"], ["schoolbuilding", "こうしゃ"]],
        km: [["mountainroad", "やまへの みち"], ["towns", "となりの まちまで"], ["marathon", "マラソンで 走る みち"], ["shinkansen", "しんかんせんで 行く みち"]]
      }
    },
    wt: {
      id: "t.weightMatch", what: "おもさを はかる", order: ["g", "kg", "t"],
      sets: { g_kg: ["g", "kg"], all: ["g", "kg", "t"] }, levels: { basic: "g_kg", normal: "all", challenge: "all" },
      things: {
        g: [["clip", "クリップ"], ["egg", "たまご"], ["strawberry", "いちご"], ["mikan", "みかん"]],
        kg: [["randoseru", "ランドセル"], ["ricebag", "おこめの ふくろ"], ["watermelon", "すいか"], ["child", "子ども"]],
        t: [["truck", "トラック"], ["elephant", "ぞう"], ["bus", "バス"]]
      }
    },
    vol: {
      id: "t.volMatch", what: "かさを はかる", order: ["mL", "dL", "L"],
      sets: { dL_L: ["dL", "L"], all: ["mL", "dL", "L"] }, levels: { basic: "dL_L", normal: "all", challenge: "all" },
      things: {
        mL: [["spoon", "スプーン"], ["eyedrops", "めぐすり"], ["petbottle", "ペットボトル(小)"]],
        dL: [["glass", "コップ"], ["juicepack", "ジュースの パック"], ["smallbottle", "ぎゅうにゅうびん"]],
        L: [["milkpack", "ぎゅうにゅうパック"], ["bigbottle", "大きい ペットボトル"], ["bucket", "バケツ"], ["bathtub", "おふろ"], ["aquarium", "すいそう"]]
      }
    }
  };
  function makeMatch(D) {
    return {
      id: D.id,
      instruction: null,
      defaults: { set: D.levels.challenge, example: false },
      levels: {
        basic: { set: D.levels.basic, example: true },
        normal: { set: D.levels.normal, example: true },
        challenge: { set: D.levels.challenge, example: false }
      },
      generate(rng, p, ctx) {
        const us = D.sets[p.set] || D.order;
        const left = rng.shuffle(us.map((u) => [u, ...rng.pick(D.things[u])]));
        // 右は 小さい たんいから じゅんに(さがしやすい)。左が おなじ じゅんに ならないように
        if (left.every(([u], i) => u === us[i])) left.reverse();
        const RH = us.length > 3 ? 34 : 38, items = [], lDot = [], rDot = [];
        left.forEach(([u, kind, name], i) => {
          const y = 2 + i * RH + RH / 2 - 2;
          items.push({ ...frame(6, y - 15, 70, 30, 4), w: 0.5 });
          const pic = ILLUST[kind] ? [illust(kind, 24, y, 27)] : lenIcon(kind, 25, y, 30);
          items.push(...pic.map((x) => ({ ...x, g: `L${i}`, kind })));
          // 名前(すきまが あれば 2行に)
          const ls = name.split(" ");
          const fs = Math.max(...ls.map((l) => [...l].length)) > 6 ? 4.2 : 5;
          ls.forEach((l, j) => items.push({ t: "text", x: 58, y: y + 1.6 + (j - (ls.length - 1) / 2) * fs * 1.25, s: l, size: fs, halo: false }));
          items.push({ t: "dot", x: 82, y, r: 1.9 });
          lDot.push([82, y]);
        });
        us.forEach((u, i) => {
          const y = 2 + i * RH + RH / 2 - 2;
          items.push({ ...frame(W - 44, y - 12, 36, 24, 4), w: 0.5 });
          items.push({ t: "text", x: W - 26, y: y + 3.6, s: u, size: 10, halo: false });
          items.push({ t: "dot", x: W - 52, y, r: 1.9 });
          rDot.push([W - 52, y]);
        });
        const example = p.example && ctx && ctx.index === 0;
        const ans = (c) => left.map(([u], i) => ({ t: "line", x1: lDot[i][0], y1: lDot[i][1], x2: rDot[us.indexOf(u)][0], y2: rDot[us.indexOf(u)][1], w: 1, color: c, lead: true, cap: "round", from: i, to: us.indexOf(u) }));
        const h = us.length * RH;
        const fig = (extra) => ({ type: "draw", w: W + 4, h: h + 3, items: [...items, ...extra], scaleK: 1 });
        return {
          key: (example ? "ex:" : "") + `${D.id}:${left.map((x) => x[1]).join(",")}`,
          softKey: `${D.id}:${left.map((x) => x[1]).sort().join(",")}`,
          text: `${D.what} とき、どの たんいを つかうかな。せんで むすびましょう。`,
          figure: fig(example ? ans(GRAY) : []),
          answer: { display: "", figure: fig(ans(RED)) },
          workspace: { type: "none" },
          example,
          meta: { left, us }
        };
      },
      verify(pr, p) {
        const { left, us } = pr.meta;
        if (us.join() !== (D.sets[p.set] || D.order).join()) return "たんいの組が ちがう";
        if (left.length !== us.length || new Set(left.map((x) => x[0])).size !== us.length) return "つかわない たんいが ある";
        for (const [u, kind] of left) if (!D.things[u].some(([k]) => k === kind)) return "ものと たんいが 合わない";
        const lines = pr.answer.figure.items.filter((it) => it.t === "line" && it.color === RED);
        if (lines.length !== us.length) return "線の数が違う";
        for (const ln of lines) if (left[ln.from][0] !== us[ln.to]) return "ちがう たんいに むすんでいる";
        return null;
      }
    };
  }
  tokushi.push(makeMatch(DIMS.len), makeMatch(DIMS.wt), makeMatch(DIMS.vol));
})();
