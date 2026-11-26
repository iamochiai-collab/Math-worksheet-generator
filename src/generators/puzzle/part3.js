// 「計算・パズル」の つづき 3:数の めいろ・計算ビンゴ・てんびん(重さくらべ)。
// ほかの プリントサイトに あって 算数プリントに なかった もの(26/11/26 先生と そうだん)。
// どれも 答えが 1つに きまるものだけを 出す
puzzle.push(...(() => {
  const KEY = "#d7263d";
  const txt = (x, y, s, size, o = {}) => ({ t: "text", x, y, s: String(s), size, halo: false, ...o });
  const rect = (x, y, w, h, o = {}) => ({ t: "poly", pts: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], w: 0.35, fill: "white", lead: true, ...o });
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  function figs(w, h, items, keyItems, scaleK = 1) {
    const f = (extra) => ({ type: "draw", w, h, items: [...items, ...extra], scaleK });
    return { figure: f([]), answer: { display: "", figure: f(keyItems) } };
  }
  const base = { noAnswerBox: true, workspace: { type: "none" } };

  // ===================== 数の めいろ =====================
  // スタートの 数から じゅんばんに(または 2とび・5とび・10とびで)たて・よこの となりへ すすむ。
  // じゅんばんに 入らない 数だけを まわりに おくので、すすみかたは 1つに きまる
  const MAZE = {
    t10: { s: 1, d: 1, n: 10, R: 4, C: 4 },
    t20: { s: 1, d: 1, n: 20, R: 5, C: 5 },
    t30: { s: 1, d: 1, n: 30, R: 6, C: 6 },
    s2: { s: 2, d: 2, n: 15, R: 5, C: 5 },
    s5: { s: 5, d: 5, n: 10, R: 4, C: 4 },
    s10: { s: 10, d: 10, n: 10, R: 4, C: 4 }
  };
  // R×C の マスに 長さ n の 道(となりどうし・同じ マスは 1回)を ランダムに つくる
  function mazePath(rng, R, C, n) {
    for (let t = 0; t < 300; t++) {
      const start = [rng.int(0, R - 1), rng.int(0, C - 1)];
      const path = [start], seen = new Set([start.join()]);
      const rec = () => {
        if (path.length === n) return true;
        const [r, c] = path[path.length - 1];
        for (const [dr, dc] of rng.shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]])) {
          const q = [r + dr, c + dc];
          if (q[0] < 0 || q[1] < 0 || q[0] >= R || q[1] >= C || seen.has(q.join())) continue;
          path.push(q); seen.add(q.join());
          if (rec()) return true;
          path.pop(); seen.delete(q.join());
        }
        return false;
      };
      if (rec()) {
        // まっすぐ すぎる 道は つかわない(まがり角が 3つ 以上)
        let turns = 0;
        for (let i = 2; i < n; i++) {
          const a = path[i - 2], b = path[i - 1], c2 = path[i];
          if (b[0] - a[0] !== c2[0] - b[0] || b[1] - a[1] !== c2[1] - b[1]) turns++;
        }
        if (turns >= 3) return path;
      }
    }
    return null;
  }
  const tMaze = {
    id: "pz.numMaze",
    instructionFor: (p) => {
      const m = MAZE[p.seq] || MAZE.t10;
      const how = m.d === 1 ? "1つずつ じゅんばんに" : `${m.d}とびで`;
      return `スタートの ${m.s}から、${how} たてか よこの となりの マスへ すすみます。ゴールまで せんを ひきましょう。(ななめには すすめません)`;
    },
    instruction: "スタートから じゅんばんに すすんで、ゴールまで せんを ひきましょう。",
    defaults: { seq: "t10" },
    levels: { basic: { seq: "t10" }, normal: { seq: "t20" }, challenge: { seq: "s2" } },
    generate(rng, p) {
      const m = MAZE[p.seq] || MAZE.t10, { s, d, n, R, C } = m;
      const path = mazePath(rng, R, C, n);
      if (!path) throw new Error("めいろが つくれない");
      const seqVals = range(0, n - 1).map((i) => s + i * d), seqSet = new Set(seqVals), last = seqVals[n - 1];
      // まわりの 数:じゅんばんに 入らない 数(とびの ときは あいだの 数、1つずつの ときは ゴールより 大きい 数)
      const pool = d === 1 ? range(last + 1, last + R * C) : range(Math.max(1, s - d + 1), last + d - 1).filter((v) => !seqSet.has(v));
      const others = rng.shuffle(pool).slice(0, R * C - n);
      if (others.length < R * C - n) throw new Error("数が たりない");
      const grid = Array.from({ length: R }, () => Array(C).fill(null));
      path.forEach(([r, c], i) => grid[r][c] = seqVals[i]);
      let k = 0;
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (grid[r][c] === null) grid[r][c] = others[k++];
      const cs = R >= 6 ? 13 : R === 5 ? 15 : 17, x0 = 2, y0 = 2, fs = cs * (last >= 100 ? 0.34 : 0.42);
      const items = [], texts = [];
      const [sr, sc] = path[0], [gr, gc] = path[n - 1];
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
        const isS = r === sr && c === sc, isG = r === gr && c === gc;
        items.push(rect(x0 + c * cs, y0 + r * cs, cs, cs, { w: isS || isG ? 0.9 : 0.4, fill: isS ? "#fff1b8" : isG ? "#dff3e4" : "white" }));
        if (isS || isG) texts.push(txt(x0 + (c + 0.5) * cs, y0 + r * cs + cs * 0.2, isS ? "スタート" : "ゴール", cs * 0.15, { bold: true, color: "#555" }));
        texts.push(txt(x0 + (c + 0.5) * cs, y0 + (r + 0.5) * cs + fs * 0.36 + (isS || isG ? cs * 0.08 : 0), grid[r][c], fs, { bold: true, halo: true }));
      }
      items.push(rect(x0, y0, C * cs, R * cs, { w: 0.9, fill: "none" }));
      const ctr = ([r, c]) => [x0 + (c + 0.5) * cs, y0 + (r + 0.5) * cs];
      const keys = [];
      for (let i = 1; i < n; i++) {
        const [x1, y1] = ctr(path[i - 1]), [x2, y2] = ctr(path[i]);
        keys.push({ t: "line", x1, y1, x2, y2, w: 1.1, color: KEY, cap: "round", path: i });
      }
      // 答えの 線は 数の 下に(数が 読めるように)。数には 白い ふちどり
      const f = (extra) => ({ type: "draw", w: C * cs + 4, h: R * cs + 4, items: [...items, ...extra, ...texts], scaleK: 1.05 });
      return {
        key: `maze:${p.seq}:${path.map((q) => q.join(".")).join("-")}`,
        softKey: `maze:${p.seq}:${path[0].join(".")}:${path[n - 1].join(".")}`,
        text: "",
        figure: f([]),
        answer: { display: "", figure: f(keys) },
        ...base,
        meta: { seq: p.seq, grid, path, seqVals }
      };
    },
    verify(pr) {
      const { grid, path, seqVals } = pr.meta;
      const set = new Set(seqVals);
      for (let i = 0; i < path.length; i++) {
        if (grid[path[i][0]][path[i][1]] !== seqVals[i]) return "道の 数が ちがう";
        if (i && Math.abs(path[i][0] - path[i - 1][0]) + Math.abs(path[i][1] - path[i - 1][1]) !== 1) return "となりで ない";
      }
      let cnt = 0;
      const all = grid.flat();
      for (const v of all) if (set.has(v)) cnt++;
      if (cnt !== seqVals.length) return "じゅんばんの 数が ほかにも ある";
      if (new Set(all).size !== all.length) return "おなじ 数が ある";
      return null;
    }
  };

  // ===================== 計算ビンゴ =====================
  // 6問 とく。答えの 数に ○を つけると、4つが たて・よこ・ななめの 1れつに ならぶ(ビンゴ)。
  // ぜんぶ 正しく とけたかを じぶんで たしかめられる
  const BINGO = {
    "+": {
      basic: (rng) => { const a = rng.int(1, 8); return [a, rng.int(1, 10 - a)]; },
      normal: (rng) => { const a = rng.int(2, 9); return [a, rng.int(Math.max(2, 11 - a), 9)]; },
      challenge: (rng) => [rng.int(12, 68), rng.int(5, 29)],
      lo: { basic: 0, normal: 5, challenge: 15 }, hi: { basic: 18, normal: 25, challenge: 99 }
    },
    "-": {
      basic: (rng) => { const a = rng.int(3, 10); return [a, rng.int(1, a - 1)]; },
      normal: (rng) => { const b = rng.int(2, 9); return [rng.int(11, b + 9), b]; },
      challenge: (rng) => { const a = rng.int(30, 99); return [a, rng.int(11, a - 5)]; },
      lo: { basic: 0, normal: 0, challenge: 1 }, hi: { basic: 18, normal: 20, challenge: 90 }
    },
    "×": {
      basic: (rng) => [rng.pick([2, 3, 5]), rng.int(1, 9)],
      normal: (rng) => [rng.int(2, 9), rng.int(2, 9)],
      challenge: (rng) => [rng.int(11, 29), rng.int(2, 6)],
      lo: { basic: 2, normal: 4, challenge: 22 }, hi: { basic: 45, normal: 81, challenge: 174 }
    }
  };
  const bOp = (op, a, b) => op === "+" ? a + b : op === "-" ? a - b : a * b;
  const LINES4 = [...range(0, 3).map((r) => range(0, 3).map((c) => r * 4 + c)), ...range(0, 3).map((c) => range(0, 3).map((r) => r * 4 + c)), [0, 5, 10, 15], [3, 6, 9, 12]];
  function bingoGen(op, suffix) {
    return {
      id: `pz.bingo${suffix}`,
      instruction: "けいさんして、{答|こた}えの {数|かず}を カードで さがして ○を つけましょう。たて・よこ・ななめに 4つ ならんだら ビンゴ！",
      defaults: { lv: "basic" },
      levels: { basic: { lv: "basic" }, normal: { lv: "normal" }, challenge: { lv: "challenge" } },
      generate(rng, p) {
        const B = BINGO[op], lv = p.lv;
        let probs = [];
        for (let t = 0; probs.length < 6 && t < 500; t++) {
          const [a, b] = B[lv](rng), v = bOp(op, a, b);
          if (v < 0 || probs.some((q) => q.v === v)) continue;
          probs.push({ a, b, v });
        }
        if (probs.length < 6) throw new Error("問題が つくれない");
        const ans = new Set(probs.map((q) => q.v));
        // まわりの 数:答えに にた 数(1ちがい・10ちがい など)を まぜる
        const near = [...new Set(probs.flatMap((q) => [q.v + 1, q.v - 1, q.v + 2, q.v - 2, q.v + 10, q.v - 10]))].filter((v) => v >= B.lo[lv] && v <= B.hi[lv] && !ans.has(v));
        const rest = range(B.lo[lv], B.hi[lv]).filter((v) => !ans.has(v) && !near.includes(v));
        const nr = rng.shuffle(near), others = [...nr.slice(0, 7), ...rng.shuffle(rest), ...nr.slice(7)].slice(0, 10);
        if (others.length < 10) throw new Error("数が たりない");
        const line = rng.pick(LINES4), restCells = rng.shuffle(range(0, 15).filter((i) => !line.includes(i)));
        const card = Array(16).fill(null);
        const order = rng.shuffle(range(0, 5));
        order.slice(0, 4).forEach((pi, k) => card[line[k]] = probs[pi].v);
        order.slice(4).forEach((pi, k) => card[restCells[k]] = probs[pi].v);
        let k2 = 0;
        for (let i = 0; i < 16; i++) if (card[i] === null) card[i] = others[k2++];
        const opS = op === "+" ? "＋" : op === "-" ? "－" : "×";
        const items = [], keys = [];
        const fs = 5.6, rowH = 10.5, bx = 40, bw = 15;
        probs.forEach((q, i) => {
          const y = 4 + i * rowH + rowH / 2;
          items.push(txt(2, y + fs * 0.36, `${"①②③④⑤⑥"[i]} ${q.a} ${opS} ${q.b} ＝`, fs, { anchor: "start" }));
          items.push(rect(bx, y - 4.2, bw, 8.4, { w: 0.4 }));
          keys.push(txt(bx + bw / 2, y + fs * 0.36, q.v, fs, { color: KEY, bold: true }));
        });
        const cx0 = 64, cy0 = 4, cs = 14.5, cfs = q2fs(Math.max(...card));
        function q2fs(m) { return m >= 100 ? 5 : 6; }
        items.push(txt(cx0 + cs * 2, cy0 - 0.2, "ビンゴ カード", 3.6, { bold: true, color: "#555" }));
        card.forEach((v, i) => {
          const r = Math.floor(i / 4), c = i % 4;
          items.push(rect(cx0 + c * cs, cy0 + 1.5 + r * cs, cs, cs, { w: 0.4, fill: (r + c) % 2 ? "#f6f8fb" : "white" }));
          items.push(txt(cx0 + (c + 0.5) * cs, cy0 + 1.5 + (r + 0.5) * cs + cfs * 0.36, v, cfs, { bold: true }));
          if (ans.has(v)) keys.push({ t: "circle", cx: cx0 + (c + 0.5) * cs, cy: cy0 + 1.5 + (r + 0.5) * cs, r: cs * 0.36, w: 0.9, color: KEY, fill: "none", ansCell: i });
        });
        items.push(rect(cx0, cy0 + 1.5, cs * 4, cs * 4, { w: 0.9, fill: "none" }));
        const ctr = (i) => [cx0 + (i % 4 + 0.5) * cs, cy0 + 1.5 + (Math.floor(i / 4) + 0.5) * cs];
        const [lx1, ly1] = ctr(line[0]), [lx2, ly2] = ctr(line[3]);
        keys.push({ t: "line", x1: lx1, y1: ly1, x2: lx2, y2: ly2, w: 0.8, color: KEY, cap: "round", bingo: true });
        const H = Math.max(4 + 6 * rowH + 2, cy0 + 1.5 + cs * 4 + 2);
        return {
          key: `bingo${op}:${probs.map((q) => `${q.a},${q.b}`).join(";")}`,
          softKey: `bingo${op}:${probs.slice(0, 2).map((q) => `${q.a},${q.b}`).join(";")}`,
          text: "",
          wide: true,
          ...figs(cx0 + cs * 4 + 2, H, items, keys, 1.3),
          ...base,
          meta: { op, probs, card, line }
        };
      },
      verify(pr) {
        const { op: o, probs, card, line } = pr.meta;
        if (new Set(card).size !== 16) return "カードに おなじ 数";
        for (const q of probs) if (bOp(o, q.a, q.b) !== q.v || q.v < 0) return "答えが ちがう";
        const pos = probs.map((q) => card.indexOf(q.v));
        if (pos.some((i) => i < 0)) return "答えが カードに ない";
        const full = LINES4.filter((L) => L.every((i) => pos.includes(i)));
        if (full.length !== 1 || full[0].join() !== line.join()) return "ビンゴが 1つで ない";
        return null;
      }
    };
  }

  // ===================== てんびん(重さくらべ)=====================
  // さがった ほうが おもい。もの の 重さは じっさいに 近い じゅんに して、くらしの かんかくと ずれないように する
  const WT = { watermelon: 5000, ricebag: 5000, bigbottle: 2000, kettle: 1500, randoseru: 1200, milkpack: 1000, petbottle: 500, soccerball: 450, grape: 400, can: 350, apple: 300, textbook: 300, cup: 200, orange: 200, pencase: 200, juicepack: 200, banana: 150, onigiri: 110, mikan: 100, notebook: 100, dango: 80, egg: 60, donut: 60, spoon: 30, eraser: 20, strawberry: 15, cookie: 10, pencil: 5, candy: 5, acorn: 3, clip: 1 };
  function pickObjs(rng, k) {
    const names = Object.keys(WT).filter((n) => typeof ILLUST !== "undefined" && ILLUST[n]);
    for (let t = 0; t < 400; t++) {
      const os = rng.shuffle(names.slice()).slice(0, k).sort((a, b) => WT[b] - WT[a]);
      // となりどうし 1.5ばい いじょう ちがう ものに する
      if (os.every((n, i) => i === 0 || WT[os[i - 1]] >= WT[n] * 1.5)) return os;
    }
    throw new Error("ものが えらべない");
  }
  // てんびん 1つ:left/right の もの、leftHeavy なら 左が さがる。答えの 四角の ばしょも かえす
  function balance(cx, py, left, right, leftHeavy, withBox) {
    const items = [], th = 10 * Math.PI / 180, Lh = 28, sgn = leftHeavy ? 1 : -1;
    const ends = [[cx - Lh * Math.cos(th), py + sgn * Lh * Math.sin(th)], [cx + Lh * Math.cos(th), py - sgn * Lh * Math.sin(th)]];
    const by = py + 30;
    items.push({ t: "poly", pts: [[cx - 12, by], [cx + 12, by], [cx + 8, by - 2.5], [cx - 8, by - 2.5]], w: 0.5, fill: "#d9dee7", lead: true });
    items.push({ t: "line", x1: cx, y1: by - 2.5, x2: cx, y2: py, w: 1.3, lead: true });
    items.push({ t: "line", x1: ends[0][0], y1: ends[0][1], x2: ends[1][0], y2: ends[1][1], w: 1.3, lead: true, cap: "round" });
    items.push({ t: "circle", cx, cy: py, r: 1.5, w: 0, fill: "black" });
    const boxes = [];
    [left, right].forEach((name, i) => {
      const [ex, ey] = ends[i], dy = ey + 9;
      items.push({ t: "line", x1: ex, y1: ey, x2: ex - 11, y2: dy, w: 0.4, lead: true }, { t: "line", x1: ex, y1: ey, x2: ex + 11, y2: dy, w: 0.4, lead: true });
      items.push({ t: "poly", pts: [[ex - 13, dy], [ex + 13, dy], [ex + 9, dy + 3], [ex - 9, dy + 3]], w: 0.5, fill: "#e8eef5", lead: true });
      const im = illust(name, ex, dy - 9, 17);
      if (im) items.push({ ...im, y: dy - 0.4 - im.h, obj: name });
      if (withBox) {
        const bx = ex - 4.5, bY = Math.max(ends[0][1], ends[1][1]) + 9 + 6;
        items.push(rect(bx, bY, 9, 9, { w: 0.5 }));
        boxes.push([ex, bY + 4.5]);
      }
    });
    return { items, boxes };
  }
  const maru = ([x, y]) => ({ t: "circle", cx: x, cy: y, r: 3.2, w: 0.9, color: KEY, fill: "none", maru: true });
  const tBalance = {
    id: "pz.balance",
    instructionFor: (p) => p.mode === "three" ? "いちばん おもいのは どれですか。□に ○を {書|か}きましょう。" : p.light ? "てんびんで くらべました。おもい ほうか、かるい ほうか、よく {読|よ}んで □に ○を {書|か}きましょう。" : "てんびんで くらべました。おもい ほうの □に ○を {書|か}きましょう。",
    instruction: "てんびんで くらべました。□に ○を {書|か}きましょう。",
    defaults: { mode: "two", light: false },
    levels: { basic: { mode: "two", light: false }, normal: { mode: "two", light: true }, challenge: { mode: "three", light: false } },
    generate(rng, p, ctx) {
      if (p.mode === "three") {
        const os = pickObjs(rng, 3); // おもい じゅん
        const pairs = rng.pick([[[0, 1], [1, 2]], [[0, 1], [0, 2]]]);
        const items = [];
        const bals = pairs.map(([i, j], k) => {
          const sw = rng.chance(0.5);
          const L = sw ? j : i, Rr = sw ? i : j;
          const b = balance(45 + k * 92, 26, os[L], os[Rr], L < Rr, false);
          items.push(...b.items);
          return [L, Rr];
        });
        // 下に 3つ ならべて、いちばん おもい ものに ○
        const order = rng.shuffle([0, 1, 2]), keys = [];
        order.forEach((oi, k) => {
          const x = 46 + k * 46, y = 76;
          const im = illust(os[oi], x, y, 16);
          if (im) items.push({ ...im, obj: os[oi] });
          items.push(rect(x - 4.5, y + 10, 9, 9, { w: 0.5 }));
          if (oi === 0) keys.push(maru([x, y + 14.5]));
        });
        items.push({ t: "line", x1: 4, y1: 64, x2: 180, y2: 64, w: 0.25, dash: "1.2 1.2", color: "#999" });
        return {
          key: `bal3:${os.join(",")}:${pairs.flat().join("")}`,
          softKey: `bal3:${os[0]}`,
          text: "",
          wide: true,
          ...figs(184, 98, items, keys, 1),
          ...base,
          meta: { mode: "three", os, bals, order }
        };
      }
      const os = pickObjs(rng, 2), sw = rng.chance(0.5);
      const left = sw ? os[1] : os[0], right = sw ? os[0] : os[1];
      const light = !!p.light && rng.chance(0.5);
      const b = balance(45, 24, left, right, !sw, true);
      const target = light ? (sw ? 0 : 1) : (sw ? 1 : 0); // ○を つける がわ(0=左)
      return {
        key: `bal2:${left},${right}:${light ? "L" : "H"}`,
        softKey: `bal2:${[...os].sort().join(",")}`,
        // おもい・かるいを まぜる ときだけ 1問ずつ 書く
        text: !p.light ? "" : light ? "「かるい」 ほうは どっち?" : "「おもい」 ほうは どっち?",
        ...figs(90, 68, b.items, [maru(b.boxes[target])], 1),
        ...base,
        meta: { mode: "two", left, right, light, target, leftDown: !sw }
      };
    },
    verify(pr) {
      const m = pr.meta;
      if (m.mode === "three") {
        const w = m.os.map((n) => WT[n]);
        if (!(w[0] > w[1] && w[1] > w[2])) return "おもさの じゅんが ちがう";
        // てんびんの むきから いちばん おもい ものが きまるか
        const beats = new Set(m.bals.map(([L, R]) => (w[L] > w[R] ? R : L)));
        const cand = [0, 1, 2].filter((i) => !beats.has(i));
        if (cand.length !== 1 || cand[0] !== 0) return "いちばん おもい ものが きまらない";
        return null;
      }
      if ((WT[m.left] > WT[m.right]) !== m.leftDown) return "てんびんの むきが ちがう";
      const heavySide = m.leftDown ? 0 : 1;
      if (m.target !== (m.light ? 1 - heavySide : heavySide)) return "○の ばしょが ちがう";
      return null;
    }
  };

  return [tMaze, bingoGen("+", "Add"), bingoGen("-", "Sub"), bingoGen("×", "Mul"), tBalance];
})());

puzzleStage.units.push(
  { name: "{数|かず}の めいろ", domain: "パズル", from: [["pz.numMaze", null, { label: "数の めいろ", kinds: ["figure"], options: [{ key: "seq", label: "数の ならび", choices: [["auto", "★に合わせる"], ["t10", "1〜10"], ["t20", "1〜20"], ["t30", "1〜30"], ["s2", "2とび(2〜30)"], ["s5", "5とび(5〜50)"], ["s10", "10とび(10〜100)"]] }] }]] },
  { name: "{計算|けいさん}ビンゴ", domain: "計算", from: [["pz.bingoAdd", null, { label: "たし算ビンゴ", kinds: ["figure"] }], ["pz.bingoSub", null, { label: "ひき算ビンゴ", kinds: ["figure"] }], ["pz.bingoMul", null, { label: "かけ算ビンゴ", kinds: ["figure"] }]] },
  { name: "てんびん(おもさくらべ)", domain: "測定", from: [["pz.balance", null, { label: "どちらが おもい", kinds: ["figure"] }]] }
);
puzzleStage.note += "。数の めいろ、計算ビンゴ、てんびん";
