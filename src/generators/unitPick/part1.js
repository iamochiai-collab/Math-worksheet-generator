// 長さのたんいをえらぶ:「先生の手の長さ 18(　)」のように、ものに合うたんい(mm・cm・m・km)を書く。
// 小単元の設定で「たんいのへんかん」をえらぶと、「mとcmで表すと □m□cm」(2・3年)や「mで表すと □m」(小数・4年〜)もつづけて出す。
// 2年「長いものの長さのたんい」(mm・cm・m)、3年「長いものの長さのはかり方と表し方」(km まで)、4年「小数のしくみ」(小数でへんかん)
var unitPick = (() => {
  // [ことば, たんい, 小さいほう, 大きいほう] 数のはんいは、ほかのたんいでは まずありえない大きさにしてある
  const ITEMS = [
    ["ノートのあつさ", "mm", 3, 8], ["ありの{体|からだ}の{長|なが}さ", "mm", 3, 9], ["{消|け}しゴムのあつさ", "mm", 10, 15], ["{本|ほん}のあつさ", "mm", 12, 25], ["ボタンのはば", "mm", 10, 18], ["{色|いろ}えんぴつの{太|ふと}さ", "mm", 6, 8],
    ["{先生|せんせい}の{手|て}の{長|なが}さ", "cm", 17, 20], ["{先生|せんせい}の{身長|しんちょう}", "cm", 150, 180], ["えんぴつの{長|なが}さ", "cm", 14, 18], ["{教科書|きょうかしょ}のたての{長|なが}さ", "cm", 25, 26], ["つくえの{高|たか}さ", "cm", 60, 70], ["{筆箱|ふでばこ}の{長|なが}さ", "cm", 20, 24], ["{上|うわ}ばきの{長|なが}さ", "cm", 18, 22], ["1{年生|ねんせい}の{身長|しんちょう}", "cm", 110, 125], ["{先生|せんせい}のつくえのよこの{長|なが}さ", "cm", 100, 120],
    ["プールのたての{長|なが}さ", "m", 25, 25], ["{教室|きょうしつ}のたての{長|なが}さ", "m", 8, 10], ["{校舎|こうしゃ}の{高|たか}さ", "m", 12, 20], ["バスの{長|なが}さ", "m", 10, 12], ["{校庭|こうてい}の{木|き}の{高|たか}さ", "m", 8, 15], ["ろうかの{長|なが}さ", "m", 40, 60], ["{運動場|うんどうじょう}を1しゅうする{長|なが}さ", "m", 150, 200], ["{富士山|ふじさん}の{高|たか}さ", "m", 3776, 3776, true],
    ["となり{町|まち}までの{道|みち}のり", "km", 3, 9], ["{遠足|えんそく}で{歩|ある}いた{道|みち}のり", "km", 4, 8], ["{東京|とうきょう}から{大阪|おおさか}までのきょり", "km", 400, 500], ["マラソンで{走|はし}る{道|みち}のり", "km", 42, 42], ["{車|くるま}で1{時間|じかん}に{進|すす}む{道|みち}のり", "km", 40, 60]
  ];
  const UNITS = { mmcm: ["mm", "cm"], mmcmm: ["mm", "cm", "m"], all: ["mm", "cm", "m", "km"] };
  const dec = (n, d) => { // n / 10^d を小数で(0 をのぞく)
    const s = String(n).padStart(d + 1, "0");
    const v = `${s.slice(0, s.length - d)}.${s.slice(s.length - d)}`.replace(/\.?0+$/, "");
    return v;
  };
  // へんかんの問い:[ことば, 答えの四角, 答え] か null
  function convOf(unit, n, mode, units) {
    const hasK = units.includes("km");
    const T = (u) => `${u}で{表|あらわ}すと`;
    if (mode === "dec") {
      if (unit === "mm") return n >= 10 ? [T("cm"), "□cm", `${dec(n, 1)}cm`] : null;
      if (unit === "cm") return [T("m"), "□m", `${dec(n, 2)}m`];
      if (unit === "m") return hasK ? [T("km"), "□km", `${dec(n, 3)}km`] : [T("cm"), "□cm", `${n * 100}cm`];
      return [T("m"), "□m", `${n * 1000}m`];
    }
    if (unit === "mm") return n >= 10 ? n % 10 ? ["cmとmmで{表|あらわ}すと", "□cm□mm", `${Math.floor(n / 10)}cm${n % 10}mm`] : [T("cm"), "□cm", `${n / 10}cm`] : null;
    if (unit === "cm") return n >= 100 ? n % 100 ? ["mとcmで{表|あらわ}すと", "□m□cm", `${Math.floor(n / 100)}m${n % 100}cm`] : [T("m"), "□m", `${n / 100}m`] : [T("mm"), "□mm", `${n * 10}mm`];
    if (unit === "m") return n >= 1000 ? (hasK ? ["kmとmで{表|あらわ}すと", "□km□m", `${Math.floor(n / 1000)}km${n % 1000}m`] : null) : [T("cm"), "□cm", `${n * 100}cm`];
    return [T("m"), "□m", `${n * 1000}m`];
  }
  const gen = {
    id: "u.unitPick",
    instruction: "（　）にあてはまる{長|なが}さのたんいを{書|か}きましょう。",
    instructionFor: (p) => {
      const us = UNITS[p.units] || UNITS.all;
      return `（　）にあてはまる{長|なが}さのたんいを、［ ${us.join("・")} ］からえらんで{書|か}きましょう。${p.conv && p.conv !== "none" ? "また、→ のたんいで{表|あらわ}しましょう。" : ""}`;
    },
    defaults: { units: "all", conv: "none", noMm: false },
    levels: { basic: { noMm: true }, normal: {}, challenge: {} },
    generate(rng, p, ctx) {
      const us = UNITS[p.units] || UNITS.all;
      const pool = ITEMS.filter(([, u, , , needK]) => us.includes(u) && !(needK && !us.includes("km")) && !(p.noMm && u === "mm" && us.length > 2));
      const conv = p.conv && p.conv !== "none";
      // たんいがかたよらないように、たんいを先にえらぶ
      const ux = [...new Set(pool.map((x) => x[1]))];
      const u0 = ux[((ctx?.index ?? 0) + rng.int(0, ux.length - 1)) % ux.length];
      for (let t = 0; t < 200; t++) {
        const it = rng.pick(pool.filter((x) => x[1] === u0 || t > 100));
        const [label, unit, lo, hi] = it;
        const n = rng.int(lo, hi);
        const cv = conv ? convOf(unit, n, p.conv, us) : null;
        if (conv && !cv && t < 150) continue;
        const text = `${label}　${n}（　　）` + (cv ? `[[br]]→ ${cv[0]}　${cv[1]}` : "");
        return {
          key: `up:${label}:${n}`,
          softKey: `up:${label}`,
          text,
          // 四角の順の答え(たんい、へんかんの数)
          answer: { display: cv ? `${unit}　${cv[2]}` : unit, value: unit, fills: [unit, ...(cv ? cv[2].match(/[\d.]+/g) : [])] },
          meta: { label, unit, n, cv }
        };
      }
      throw new Error("たんいの問題が作れない");
    },
    verify(pr, p) {
      const { label, unit, n, cv } = pr.meta;
      const it = ITEMS.find((x) => x[0] === label);
      if (!it || it[1] !== unit || n < it[2] || n > it[3]) return "ものとたんいが合わない";
      const us = UNITS[p.units] || UNITS.all;
      if (!us.includes(unit)) return "えらべないたんい";
      if (cv) {
        // へんかんの答えを mm になおして、もとの長さと同じか
        const MM = { mm: 1, cm: 10, m: 1000, km: 1e6 };
        const mmOf = (s) => [...s.matchAll(/([\d.]+)(km|mm|cm|m)/g)].reduce((a, m) => a + Number(m[1]) * MM[m[2]], 0);
        if (Math.abs(mmOf(cv[2]) - n * MM[unit]) > 1e-6) return `へんかんがちがう ${cv[2]}`;
        if (p.conv !== "dec" && /\./.test(cv[2])) return "小数が出た";
      }
      if ((p.conv === "none" || !p.conv) && cv) return "へんかんなしなのに出た";
      return null;
    }
  };
  return [gen];
})();
