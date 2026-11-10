// 5年「帯グラフと円グラフ」:円グラフを読む(すらすらぷりんと風の1ページ1問)
// 大きな円グラフ(まわりに1%ごとの目もり、10ごとの数、上に100%)、項目名はおうぎ形の中(小さいものは外に線でつなぐ)。
// 下に ①②③ の問いと、右に「%」の入った かっこの答えらん(workspace type "qa")
var g5PieRead = (() => {
  const W = 172;
  const OTHER = "その{他|た}";
  const THEMES = [
    { title: "{好|す}きな{給食|きゅうしょく}のメニュー", items: ["カレーライス", "あげパン", "ハンバーグ", "からあげ", "スパゲッティ", "ラーメン"], small: ["わかめご{飯|はん}", "やきそば", "シチュー"] },
    { title: "{好|す}きなスポーツ", items: ["サッカー", "ドッジボール", "{野球|やきゅう}", "{水泳|すいえい}", "バスケットボール"], small: ["テニス", "{卓球|たっきゅう}", "なわとび"] },
    { title: "{図書室|としょしつ}でかりた{本|ほん}の{種類|しゅるい}", items: ["{物語|ものがたり}", "{図|ず}かん", "{伝記|でんき}", "{科学|かがく}の{本|ほん}"], small: ["{詩|し}の{本|ほん}", "{辞典|じてん}"] },
    { title: "{保健室|ほけんしつ}に{来|き}た{人|ひと}のけがの{種類|しゅるい}", items: ["すりきず", "{打|だ}ぼく", "{切|き}りきず", "ねんざ"], small: ["つき{指|ゆび}", "やけど"] },
    { title: "{学校|がっこう}の{土地|とち}の{使|つか}われ{方|かた}", items: ["{校庭|こうてい}", "{校舎|こうしゃ}", "{体育館|たいいくかん}", "プール"], small: ["{花|か}だん", "{畑|はたけ}"] },
    { title: "{家|いえ}から{出|で}るごみの{種類|しゅるい}", items: ["{燃|も}えるごみ", "{紙|かみ}", "プラスチック", "{生|なま}ごみ"], small: ["びん", "かん"] },
    { title: "{好|す}きな{季節|きせつ}", items: ["{夏|なつ}", "{春|はる}", "{秋|あき}", "{冬|ふゆ}"], small: [] },
    { title: "{好|す}きな{動物|どうぶつ}", items: ["{犬|いぬ}", "ねこ", "うさぎ", "パンダ"], small: ["ハムスター", "{小鳥|ことり}"] }
  ];
  // 5年では題材の漢字はほぼ習っているので、漢字のはばで見つもる
  const plainK = (s) => String(s).replace(/\{([^{}|]+)\|([^{}]*)\}/g, "$1");
  const textW = (s, fs) => [...plainK(s)].reduce((a, ch) => a + (ch.charCodeAt(0) < 8192 ? 0.58 : 1), 0) * fs;
  const txt = (x, y, s, size, o = {}) => ({ t: "text", x, y, s: String(s), size, halo: false, ...o });
  // 2行に分ける(カレー/ライス のように)。ふりがなのまとまりはこわさない
  function split2(s) {
    const atoms = String(s).match(/\{[^{}|]+\|[^{}]*\}|[\s\S]/gu) || [];
    if (atoms.length < 5) return [s];
    const n = Math.ceil(atoms.length / 2);
    return [atoms.slice(0, n).join(""), atoms.slice(n).join("")];
  }

  // 割合を作る:大きい順の項目(のこりは「その他」)。
  // step 10 … みんな10ごと(小さい項目なし)/ step 5 … 5ごと(小さい項目は5%)/ step 1 … 1ごと(小さい項目は2〜6%)
  function makeSegs(rng, p, th) {
    for (let t = 0; t < 2000; t++) {
      const useSmall = p.small && th.small.length > 0;
      const k = rng.int(p.k[0], Math.min(p.k[1], th.items.length));
      const other = p.step >= 10 ? 10 : p.step === 5 ? rng.pick([10, 15]) : useSmall ? rng.int(8, 12) : rng.int(6, 12);
      const smallV = !useSmall ? 0 : p.step === 5 ? 5 : rng.int(2, 6);
      const rest = 100 - other - smallV;
      const vals = [];
      for (let i = 0; i < k - 1; i++) vals.push(rng.int(Math.ceil(p.min / p.step), Math.floor(rest / p.step / 2)) * p.step);
      const last = rest - vals.reduce((a, b) => a + b, 0);
      if (last < p.min || last % p.step) continue;
      vals.push(last);
      vals.sort((a, b) => b - a);
      if (p.step < 10 && new Set(vals).size !== vals.length) continue;
      if (vals[0] > 50) continue;
      if (useSmall && smallV >= other) continue;
      const names = rng.shuffle(th.items.slice()).slice(0, k);
      const segs = names.map((n, i) => ({ label: n, pct: vals[i] }));
      if (useSmall) segs.push({ label: rng.pick(th.small), pct: smallV, small: true });
      segs.push({ label: OTHER, pct: other, other: true });
      return segs;
    }
    throw new Error("円グラフの割合が作れない");
  }

  // 円グラフの図(mm)
  function pieFigure(th, segs, withIntro) {
    const items = [];
    let y0 = 0;
    if (withIntro) {
      // 「下の図のようなグラフを円グラフといいます。」(上と下に点線)
      items.push({ t: "line", x1: 14, y1: 2, x2: W - 14, y2: 2, w: 0.35, dash: "0.4 1.2", color: "#777" });
      // 「円グラフ」だけ大きく
      const parts = [["{下|した}の{図|ず}のようなグラフを", 5.2], ["{円|えん}グラフ", 7], ["といいます。", 5.2]];
      const kw = (s2, f) => [...String(s2).replace(/\{([^{}|]+)\|[^{}]*\}/g, "$1")].length * f; // どれも5年までに習う漢字
      let x = W / 2 - parts.reduce((a, [s2, f]) => a + kw(s2, f), 0) / 2;
      for (const [s2, f] of parts) {
        items.push(txt(x, 11.8, s2, f, { anchor: "start" }));
        x += kw(s2, f);
      }
      items.push({ t: "line", x1: 14, y1: 16, x2: W - 14, y2: 16, w: 0.35, dash: "0.4 1.2", color: "#777" });
      y0 = 20;
    }
    const r = withIntro ? 46 : 52, cx = W / 2, cy = y0 + 31 + r;
    items.push(txt(cx, y0 + 6, th.title, 5.2));
    const at = (pct, rad) => {
      const a = pct / 100 * 2 * Math.PI - Math.PI / 2;
      return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
    };
    // 目もり(円の内がわへ)
    for (let i = 0; i < 100; i++) {
      const len = i % 10 === 0 ? 4.2 : i % 5 === 0 ? 3 : 1.8;
      const [x1, y1] = at(i, r), [x2, y2] = at(i, r - len);
      items.push({ t: "line", x1, y1, x2, y2, w: i % 5 === 0 ? 0.35 : 0.22 });
      if (i % 10 === 0) {
        const [tx, ty] = at(i, r + 6.2);
        items.push(txt(tx, ty + 1.6, i, 4.4));
      }
    }
    items.push(txt(cx, cy - r - 11.5, "100%", 4.4));
    items.push({ t: "circle", cx, cy, r, w: 1.1, fill: "none" });
    // 区切りの線と項目名
    let acc = 0;
    for (const s of segs) {
      const [bx, by] = at(acc, r);
      items.push({ t: "line", x1: cx, y1: cy, x2: bx, y2: by, w: acc === 0 ? 0.7 : 0.4 });
      const mid = acc + s.pct / 2;
      if (s.small) {
        // 外に出して線でつなぐ
        const [ax, ay] = at(mid, r * 0.8), [ex, ey] = at(mid, r + 13);
        const left = ex < cx;
        items.push({ t: "line", x1: ax, y1: ay, x2: ex, y2: ey, w: 0.3 });
        items.push({ t: "line", x1: ex, y1: ey, x2: ex + (left ? -4 : 4), y2: ey, w: 0.3 });
        items.push(txt(ex + (left ? -5 : 5), ey + 1.7, s.label, 4.8, { anchor: left ? "end" : "start" }));
      } else {
        // 字の四角がおうぎ形の中(目もりより内がわ・区切りの線から少しはなれる)に入る 大きさ・位置をさがす
        const a0 = acc, a1 = acc + s.pct;
        const inside = (x, y) => {
          const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy);
          if (d > r - 5) return false;
          const ang = ((Math.atan2(dy, dx) + Math.PI / 2) / (2 * Math.PI) * 100 + 100) % 100;
          if (d > 0.5 && !(ang > a0 && ang < a1)) return false;
          for (const e of [a0, a1]) {
            const [ux, uy] = at(e, 1);
            const ux2 = ux - cx, uy2 = uy - cy;
            if (ux2 * dx + uy2 * dy > 0 && Math.abs(ux2 * dy - uy2 * dx) < 1) return false;
          }
          return true;
        };
        const fits = (ls, f, x, y) => ls.every((l, i) => {
          const w = textW(l, f) / 2, by = y + 1.8 + (i - (ls.length - 1) / 2) * f * 1.2;
          return [[x - w, by - f * 0.85], [x + w, by - f * 0.85], [x - w, by + f * 0.2], [x + w, by + f * 0.2], [x, by - f * 0.85], [x, by + f * 0.2]].every(([px, py]) => inside(px, py));
        });
        const two = split2(s.label);
        let best = null;
        search: for (let f = 5.6; f >= 4.2; f -= 0.2) {
          for (const ls of two.length > 1 ? [[s.label], two] : [[s.label]]) {
            for (const k of [0.55, 0.62, 0.5, 0.68, 0.45, 0.74, 0.4, 0.8]) {
              const [x, y] = at(a0 + s.pct / 2, r * k);
              if (fits(ls, f, x, y)) { best = { ls, f, x, y }; break search; }
            }
          }
        }
        if (!best) {
          const [x, y] = at(a0 + s.pct / 2, r * 0.62);
          best = { ls: two, f: 4.2, x, y };
        }
        const { ls: lines, f: fs, x: lx, y: ly } = best;
        lines.forEach((l, i) => items.push(txt(lx, ly + 1.8 + (i - (lines.length - 1) / 2) * fs * 1.2, l, fs)));
      }
      acc += s.pct;
    }
    return { type: "draw", w: W, h: cy + r + 11, items };
  }

  const gen = {
    id: "g5.pieRead",
    instruction: null,
    // ★1 は10ごと・★2 は5ごと(わかりやすい)、★3 は1ごと(36%・19% など)。★1・★2 は「円グラフとは」の説明とヒントつき
    defaults: { step: 5, min: 10, k: [3, 4], small: true, intro: true, hint: true, combine: false },
    levels: {
      basic: { step: 10, min: 10, k: [3, 4], small: false, intro: true, hint: true, combine: false },
      normal: { step: 5, min: 10, k: [3, 4], small: true, intro: true, hint: true, combine: false },
      challenge: { step: 1, min: 8, k: [3, 4], small: true, intro: false, hint: false, combine: false }
    },
    generate(rng, p, ctx) {
      const th = THEMES[ctx && Number.isInteger(ctx.index) && rng.chance(0.6) ? ((ctx.index + rng.int(0, THEMES.length - 1)) % THEMES.length) : rng.int(0, THEMES.length - 1)];
      const segs = makeSegs(rng, p, th);
      const cum = [];
      segs.reduce((a, s) => (cum.push(a), a + s.pct), 0);
      const named = segs.filter((s) => !s.other);
      const qs = [], notes = [], ans = [];
      const ask = (i, note) => {
        qs.push(`${"①②③④"[qs.length]} 「${segs[i].label}」は{全体|ぜんたい}の{何|なん}%ですか。`);
        notes.push(note || "");
        ans.push(`${"①②③④"[ans.length]} ${segs[i].pct}%`);
      };
      const smallI = segs.findIndex((s) => s.small);
      if (!p.combine) {
        ask(0);
        ask(1, p.hint ? `${cum[1]}から${cum[1] + segs[1].pct}の{目|め}もりまでで{区切|くぎ}られているから…` : "");
        ask(smallI >= 0 ? smallI : 2);
      } else {
        ask(1);
        ask(2);
        const [a, b] = rng.shuffle([0, 1, 2]).slice(0, 2).sort((x, y) => x - y);
        qs.push(`③ 「${segs[a].label}」と「${segs[b].label}」をあわせると、{全体|ぜんたい}の{何|なん}%ですか。`);
        notes.push("");
        ans.push(`③ ${segs[a].pct + segs[b].pct}%`);
      }
      return {
        key: `pie:${THEMES.indexOf(th)}:${segs.map((s) => s.pct).join(",")}:${segs.map((s) => s.label).join(",")}`,
        softKey: `pie${THEMES.indexOf(th)}`,
        text: "{下|した}の{円|えん}グラフを{見|み}て{答|こた}えましょう。",
        figure: pieFigure(th, segs, p.intro),
        answer: { display: ans.join("　"), value: { segs: segs.map((s) => s.pct) } },
        workspace: { type: "qa", labels: qs, notes, unit: "%" },
        wide: true,
        meta: { segs, ans }
      };
    },
    verify(pr, p) {
      const { segs, ans } = pr.meta;
      if (segs.reduce((a, s) => a + s.pct, 0) !== 100) return "合計が100%でない";
      if (!segs[segs.length - 1].other) return "その他が最後でない";
      const big = segs.filter((s) => !s.other && !s.small).map((s) => s.pct);
      for (let i = 1; i < big.length; i++) if (big[i] > big[i - 1]) return "大きい順でない";
      if (big.some((x) => x % p.step || x < p.min)) return "きざみ・大きさが合わない";
      const sm = segs.find((s) => s.small);
      if (sm && (sm.pct > 6 || sm.pct >= segs[segs.length - 1].pct)) return "小さい項目の大きさ";
      if (p.step > 1 && segs.some((s) => s.pct % p.step)) return "10ごと・5ごとになっていない";
      // 答えを図(目もり)から読みなおす
      const cum = [];
      segs.reduce((a, s) => (cum.push(a), a + s.pct), 0);
      for (const a of ans) {
        const n = Number(a.match(/(\d+)%$/)[1]);
        if (!(n > 0 && n < 100)) return "答えが変";
      }
      return null;
    }
  };
  return [gen];
})();
