
  const piTex = L.piTex;
  const PY_APPLY = {
    sqDiag: (rng) => {
      const a = rng.int(2, 12);
      return [`1辺が${a}cmの正方形の対角線の長さ`, `${sTex(S(Q(a), 2))}cm`, a * Math.SQRT2];
    },
    triH: (rng) => {
      const a = rng.int(2, 12);
      return [`1辺が${a}cmの正三角形の高さ`, `${sTex(S(Q(a, 2), 3))}cm`, a * Math.sqrt(3) / 2];
    },
    triArea: (rng) => {
      const a = rng.int(2, 10);
      return [`1辺が${a}cmの正三角形の面積`, `${sTex(S(Q(a * a, 4), 3))}cm²`, a * a * Math.sqrt(3) / 4];
    },
    rectDiag: (rng) => {
      const a = rng.int(1, 9), b = rng.int(2, 12);
      return [`縦${a}cm、横${b}cmの長方形の対角線の長さ`, `${sqrtTex(a * a + b * b)}cm`, Math.hypot(a, b)];
    },
    dist: (rng) => {
      const x1 = rng.int(-5, 5), y1 = rng.int(-5, 5), x2 = rng.int(-5, 5), y2 = rng.int(-5, 5);
      if (x1 === x2 || y1 === y2) return null;
      return [`2点A${ptTex(x1, y1)}，B${ptTex(x2, y2)}の間の距離`, sqrtTex((x1 - x2) ** 2 + (y1 - y2) ** 2), Math.hypot(x1 - x2, y1 - y2)];
    },
    cuboid: (rng) => {
      const a = rng.int(2, 8), b = rng.int(2, 8), c = rng.int(2, 8);
      return [`縦${a}cm、横${b}cm、高さ${c}cmの直方体の対角線の長さ`, `${sqrtTex(a * a + b * b + c * c)}cm`, Math.sqrt(a * a + b * b + c * c)];
    },
    coneH: (rng) => {
      const r = rng.int(2, 8), l = rng.int(r + 1, 13);
      return [`底面の半径が${r}cm、母線の長さが${l}cmの円錐の高さ`, `${sqrtTex(l * l - r * r)}cm`, Math.sqrt(l * l - r * r)];
    },
    coneV: (rng) => {
      const [r, h, l] = rng.pick([[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [9, 12, 15]]);
      return [`底面の半径が${r}cm、母線の長さが${l}cmの円錐の体積(円周率はπ)`, `${piTex(Q(r * r * h, 3))}cm³`, Math.PI * r * r * h / 3];
    },
    chord: (rng) => {
      const r = rng.int(3, 10), d = rng.int(1, r - 1);
      return [`半径${r}cmの円で、中心からの距離が${d}cmである弦の長さ`, `${sTex(S(Q(2), r * r - d * d))}cm`, 2 * Math.sqrt(r * r - d * d)];
    }
  };
  Object.assign(RUBY, { 対角線: "たいかくせん", 正三角形: "せいさんかくけい", 間: "あいだ", 距離: "きょり", 直方体: "ちょくほうたい", 底面: "ていめん", 半径: "はんけい", 母線: "ぼせん", 円錐: "えんすい", 円周率: "えんしゅうりつ", 弦: "げん", 中心から: "{中心|ちゅうしん}から", 高さ: "{高|たか}さ", 縦: "たて", 横: "よこ", 長方形: "ちょうほうけい", 正方形: "せいほうけい" });
  const pythagApply = {
    id: "c3.pythagApply",
    instruction: R("次の長さや面積・体積を求めましょう。"),
    defaults: { types: ["sqDiag", "triH", "rectDiag"] },
    levels: lv({ types: ["sqDiag", "triH", "rectDiag", "dist"] }, { types: ["triArea", "dist", "cuboid", "coneH", "chord"] }, { types: ["cuboid", "coneV", "chord", "triArea", "dist"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 200; t++) {
        const type = typeOf(rng, p, ctx && { index: ctx.index + t });
        const r = PY_APPLY[type](rng);
        if (!r) continue;
        const text = R(r[0].replace("1辺", "1{辺|ぺん}"));
        return { key: `pa:${text}`, text, wide: true, answer: { display: r[1] }, workspace: { type: "none" }, meta: { v: r[2] } };
      }
      throw new Error("三平方の定理の利用の問題が作れない");
    },
    verify(pr) {
      const v = evalF(pr.answer.display.replace(/(cm[²³]?)$/, ""));
      return near(v, pr.meta.v) ? null : `値が合わない ${pr.answer.display}`;
    }
  };

  const CHECK = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [7, 24, 25], [9, 12, 15], [4, 5, 6], [5, 6, 8], [2, 3, 4], [6, 7, 9], [7, 8, 11]];
  const pythagCheck = {
    id: "c3.pythagCheck",
    instruction: R("3辺の長さが次のような三角形のうち、直角三角形であるものには○、そうでないものには×を書きましょう。"),
    defaults: {},
    levels: lv({ root: false }, { root: true }, { root: true }),
    generate(rng, p) {
      if (p.root && rng.chance(0.4)) {
        const sets = [[[1, 1], [1, 1], [1, 2]], [[1, 1], [1, 3], [2, 1]], [[1, 2], [1, 3], [1, 5]], [[1, 3], [1, 2], [1, 4]], [[2, 1], [1, 5], [3, 1]], [[1, 5], [1, 6], [1, 10]]];
        const st = rng.pick(sets), txt = st.map(([a, b]) => `${ab(a, b)}cm`).join("，");
        const sq = st.map(([a, b]) => a * a * b).sort((u, v) => u - v), ok = sq[0] + sq[1] === sq[2];
        return { key: `pc:r:${txt}`, text: txt, answer: { display: ok ? "○" : "×" }, workspace: { type: "none" }, meta: { sq, ok } };
      }
      const st = rng.pick(CHECK), k = rng.pick([1, 1, 2]), sides = rng.shuffle(st.map((v) => v * k));
      const sq = sides.map((v) => v * v).sort((u, v) => u - v), ok = sq[0] + sq[1] === sq[2];
      return { key: `pc:${sides}`, text: sides.map((v) => `${v}cm`).join("，"), answer: { display: ok ? "○" : "×" }, workspace: { type: "none" }, meta: { sq, ok } };
    },
    verify(pr) {
      const { sq, ok } = pr.meta;
      return (sq[0] + sq[1] === sq[2]) === ok ? null : "判定が合わない";
    }
  };
  Object.assign(RUBY, { そうでない: "そうでない", 書きましょう: "{書|か}きましょう" });

  // ============================================================
  // 8 標本調査
  // ============================================================
  const ZEN = ["学校で行う健康診断", "国勢調査", "高校の入学試験", "クラス全員の通学時間の調査", "飛行機に乗る前の手荷物検査", "学校の生徒全員の体力テスト", "クラスで行う進路希望調査", "学校の生徒全員の身長測定"];
  const HYO = ["テレビ番組の視聴率調査", "工場でつくった電球の寿命の検査", "缶詰の品質検査", "選挙のときの世論調査", "湖にいる魚の数の調査", "川の水質検査", "全国の中学生の睡眠時間の調査", "工場で作ったお菓子の味の検査", "新聞社が行う内閣支持率の調査", "海水浴場の水質調査"];
  Object.assign(RUBY, { 進路希望: "しんろきぼう", 身長測定: "しんちょうそくてい", お菓子: "お{菓子|かし}", 味: "あじ", 新聞社: "しんぶんしゃ", 内閣支持率: "ないかくしじりつ", 海水浴場: "かいすいよくじょう", 対象: "たいしょう", 集団全体: "しゅうだんぜんたい", 一部: "いちぶ", 資料: "しりょう", 抽出する: "{抽出|ちゅうしゅつ}する", 何といいますか: "{何|なん}といいますか", 全数調査: "ぜんすうちょうさ", 標本調査: "ひょうほんちょうさ", 調査: "ちょうさ", 適して: "{適|てき}して", 学校: "がっこう", 行う: "{行|おこな}う", 健康診断: "けんこうしんだん", 国勢調査: "こくせいちょうさ", 高校: "こうこう", 入学試験: "にゅうがくしけん", 全員: "ぜんいん", 通学時間: "つうがくじかん", 飛行機: "ひこうき", 乗る: "{乗|の}る", 前: "まえ", 手荷物検査: "てにもつけんさ", 体力: "たいりょく",
    番組: "ばんぐみ", 視聴率: "しちょうりつ", 工場: "こうじょう", 電球: "でんきゅう", 寿命: "じゅみょう", 検査: "けんさ", 缶詰: "かんづめ", 品質: "ひんしつ", 選挙: "せんきょ", 世論: "よろん", 湖: "みずうみ", 魚: "さかな", 川: "かわ", 水質: "すいしつ", 全国: "ぜんこく", 中学生: "ちゅうがくせい", 睡眠時間: "すいみんじかん",
    母集団: "ぼしゅうだん", 標本: "ひょうほん", 標本の大きさ: "{標本|ひょうほん}の{大|おお}きさ", 無作為: "むさくい", 選んで: "{選|えら}んで", 生徒: "せいと", 中学校: "ちゅうがっこう", 人: "にん", どちら: "どちら" });
  const sampleTerms = {
    id: "c3.sampleTerms",
    instruction: R("次の問いに答えましょう。"),
    defaults: { types: ["which", "which", "pop", "term"] },
    levels: lv({ types: ["which", "which", "pop", "term"] }, { types: ["which", "pop", "term"] }, { types: ["which", "pop", "term"] }),
    generate(rng, p, ctx) {
      const type = rng.pick(p.types);
      if (type === "term") {
        const i = rng.int(0, 3), T = [["調査の対象となる集団全体を何といいますか。", "母集団"], ["母集団から取り出した一部の資料を何といいますか。", "標本"], ["標本にふくまれる資料の個数を何といいますか。", "標本の大きさ"], ["かたよりなく標本を取り出すことを何といいますか。", "無作為に抽出する"]][i];
        return { key: `st:t:${i}`, text: R(T[0]), wide: true, answer: { display: R(T[1]) }, workspace: { type: "none" }, meta: {} };
      }
      if (type === "which") {
        const zen = rng.chance(0.45), item = rng.pick(zen ? ZEN : HYO);
        return { key: `st:w:${item}`, text: R(`${item}は、全数調査と標本調査のどちらが適していますか。`), wide: true, answer: { display: R(zen ? "全数調査" : "標本調査") }, workspace: { type: "none" }, meta: {} };
      }
      const N = rng.pick([300, 400, 450, 500, 600, 720]), n = rng.pick([30, 40, 50, 60, 80, 100]), ask = rng.int(0, 1);
      const lead = `ある中学校の生徒${N}人から、${n}人を無作為に選んで調査しました。`;
      return ask ? { key: `st:p:${N}:${n}:1`, text: R(`${lead}標本の大きさを答えましょう。`), wide: true, answer: { display: R(`${n}人`) }, workspace: { type: "none" }, meta: {} } : { key: `st:p:${N}:${n}:0`, text: R(`${lead}母集団は何ですか。`), wide: true, answer: { display: R(`ある中学校の生徒${N}人`) }, workspace: { type: "none" }, meta: {} };
    }
  };

  const SAMPLE = {
    fish: (rng) => {
      const M = rng.pick([30, 40, 50, 60]), k = rng.int(3, 8), n = rng.pick([30, 40, 50]), N = M * n / k;
      if (!Number.isInteger(N / 10)) return null;
      return { t: `池にいる魚の数を調べるために、${M}匹の魚をつかまえて印をつけ、池にもどしました。数日後に${n}匹の魚をつかまえたところ、印のついた魚が${k}匹いました。この池にいる魚は、およそ何匹と考えられますか。`, e: `${M}：${V("x")}＝${k}：${n}`, ans: `およそ${N}匹` };
    },
    stone: (rng) => {
      const M = rng.pick([20, 30, 40, 50]), k = rng.int(2, 6), n = rng.pick([30, 40, 50, 60]), T = M * n / k;
      if (!Number.isInteger(T / 10) || T <= M) return null;
      return { t: `白い碁石がたくさん入った箱に、黒い碁石${M}個を入れてよくかき混ぜ、そこから${n}個を取り出したところ、黒い碁石が${k}個ふくまれていました。箱の中の白い碁石は、およそ何個と考えられますか。`, e: `${M}：${V("x")}＝${k}：${n - k}`, ans: `およそ${T - M}個` };
    },
    defect: (rng) => {
      const N = rng.pick([3000, 5000, 8000, 10000, 12000]), n = rng.pick([100, 200, 250, 400, 500]), k = rng.int(1, 6), D = N * k / n;
      if (!Number.isInteger(D)) return null;
      return { t: `ある工場で作った製品${N}個から、${n}個を無作為に取り出して調べたところ、不良品が${k}個ありました。この工場で作った製品${N}個の中には、不良品がおよそ何個あると考えられますか。`, e: `${N}×[[f:${k}/${n}]]`, ans: `およそ${D}個` };
    },
    words: (rng) => {
      const pg = rng.pick([800, 1200, 1500, 2000]), s = rng.pick([10, 20, 25, 40]), avg = rng.int(20, 40), w = s * avg;
      return { t: `ある辞典の見出し語の数を調べるために、${pg}ページの中から${s}ページを無作為に選び、そのページの見出し語を数えたところ、合計で${w}語でした。この辞典の見出し語は、およそ何語と考えられますか。`, e: `${pg}×[[f:${w}/${s}]]`, ans: `およそ${pg * avg}語` };
    }
  };
  Object.assign(RUBY, { 選び: "{選|えら}び", 池: "いけ", 匹: "ひき", 何匹: "なんびき", 印: "しるし", 数日後: "すうじつご", 白い: "{白|しろ}い", 黒い: "{黒|くろ}い", 碁石: "ごいし", 入った: "{入|はい}った", 入れて: "{入|い}れて", 混ぜ: "{混|ま}ぜ", 取り出した: "{取|と}り{出|だ}した", 取り出して: "{取|と}り{出|だ}して", 中: "なか", 作った: "{作|つく}った", 製品: "せいひん", 不良品: "ふりょうひん", 辞典: "じてん", 見出し語: "{見出|みだ}し{語|ご}", 語: "ご", 何語: "なんご", 数えた: "{数|かぞ}えた", 合計: "ごうけい", 考えられますか: "{考|かんが}えられますか", 調べる: "{調|しら}べる", 調べた: "{調|しら}べた", 数: "かず", 何個: "なんこ" });
  const sampleEst = {
    id: "c3.sampleEst",
    instruction: null,
    defaults: { types: ["defect", "fish"] },
    levels: lv({ types: ["defect", "words"] }, { types: ["defect", "fish", "words"] }, { types: ["fish", "stone", "defect"] }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx);
      for (let t = 0; t < 300; t++) {
        const r = SAMPLE[type](rng);
        if (!r) continue;
        const text = R(r.t).replace(/(\d+)\{匹\|ひき\}/g, (m, n) => `${n}{匹|${[1, 6, 8, 0].includes(n % 10) ? "ぴき" : n % 10 === 3 ? "びき" : "ひき"}}`);
        return { key: `se:${r.t}`, softKey: type, text, answer: { display: `${R("式")} ${r.e}　${R("答え")} ${R(r.ans).replace(/(\d+)\{匹\|ひき\}/g, (m, n) => `${n}{匹|${[1, 6, 8, 0].includes(n % 10) ? "ぴき" : n % 10 === 3 ? "びき" : "ひき"}}`)}` }, workspace: { type: "lines", labels: [R("式"), "", R("答え")], wideLabel: true }, meta: {} };
      }
      throw new Error("標本調査の問題が作れない");
    }
  };

  // ===== ヒント =====
  const H = {
    "c3.sqrtBasic": "正の数の平方根は＋と－の2つあります。√{a²}＝a(aは正の数)、(√{a})²＝aです。",
    "c3.sqrtCompare": "それぞれ2乗して比べます。a√{b}は√{a²b}になおすと比べやすくなります。",
    "c3.sqrtSimplify": "根号の中の数を素因数分解して、2乗になっている数を根号の外に出します。",
    "c3.rationalize": "分母と分子に同じ√をかけて、分母に√がない形にします。",
    "c3.sqrtCalc": "√{a}×√{b}＝√{ab}。たし算・ひき算は、根号の中を同じ数にしてからまとめます。展開の公式も使えます。",
    "c3.sqrtProps": "√をふくむ数は2乗して考えます。根号の中が(自然数)²になれば、√は自然数になります。",
    "c3.expand": "(x＋a)(x＋b)＝x²＋(a＋b)x＋ab、(x±a)²＝x²±2ax＋a²、(x＋a)(x－a)＝x²－a² を使います。",
    "c3.factor": "まず共通な因数をくくり出し、そのあとで乗法公式を逆に使います。",
    "c3.exprUse": "100＋3 のように分けて、乗法公式を使うと計算が楽になります。",
    "c3.proofFactor": "式を展開・因数分解して、説明したい形(4×(整数) など)を作ります。",
    "c3.quadSolve": "x²＝k なら x＝±√{k}。因数分解できなければ解の公式 x＝[[f:－b±√{b²－4ac}/2a]] を使います。",
    "c3.quadCoef": "わかっている解を方程式に代入して、まず a を求めます。",
    "c3.quadWord": "求める数量を x として方程式をつくり、解が問題に合うか(正の数か、長さとして使えるか)を確かめます。",
    "c3.sqFormula": "y＝ax² に、わかっている x，y の値を代入して a を求めます。",
    "c3.sqRate": "変化の割合＝(yの増加量)÷(xの増加量)。y＝ax²では一定ではありません。xの変域に0がふくまれるときに注意します。",
    "c3.sqGraph": "グラフが通る、x，y がどちらも整数の点を見つけて、y＝ax² に代入します。",
    "c3.sqWord": "y＝ax² の a を求めてから、x や y の値を代入します。",
    "c3.simRatio": "対応する辺の長さの比が相似比です。比例式をつくって長さを求めます。",
    "c3.simLines": "DE∥BC なら AD：AB＝AE：AC＝DE：BC。中点を結んだ線分の長さは、残りの辺の半分です。",
    "c3.areaVolRatio": "相似比が m：n のとき、面積比は m²：n²、体積比は m³：n³ です。",
    "c3.simProof": "三角形の相似条件は、3組の辺の比／2組の辺の比とその間の角／2組の角、です。",
    "c3.inscribed": "円周角は、同じ弧に対する中心角の半分です。同じ弧に対する円周角は等しく、半円の弧に対する円周角は90°です。",
    "c3.inscribedCalc": "円周角＝中心角÷2。弧の長さと円周角の大きさは比例します。",
    "c3.pythag": "直角三角形で、斜辺を c とすると a²＋b²＝c² です。",
    "c3.specialTri": "30°・60°の直角三角形の辺の比は 1：2：√{3}、45°の直角二等辺三角形は 1：1：√{2} です。",
    "c3.pythagApply": "直角三角形を見つけて、三平方の定理を使います。",
    "c3.pythagCheck": "いちばん長い辺の2乗が、ほかの2辺の2乗の和に等しければ直角三角形です。",
    "c3.sampleTerms": "全部を調べる必要があるもの・できるものは全数調査、時間や費用がかかったり調べると製品がこわれたりするものは標本調査です。",
    "c3.sampleEst": "標本での割合と、母集団での割合が等しいと考えて、比例式をつくります。"
  };
  Object.assign(RUBY, { くくり出し: "くくり{出|だ}し", 使う: "{使|つか}う", 等しければ: "{等|ひと}しければ", 正の数: "{正|せい}の{数|すう}", 比べます: "{比|くら}べます", 比べやすく: "{比|くら}べやすく", 素因数分解: "そいんすうぶんかい", 外: "そと", 出します: "{出|だ}します", 分子: "ぶんし", 公式: "こうしき", 共通な: "{共通|きょうつう}な", 因数: "いんすう", 乗法公式: "じょうほうこうしき", 逆に: "{逆|ぎゃく}に", 分けて: "{分|わ}けて", 楽に: "{楽|らく}に", 説明したい: "{説明|せつめい}したい", 作ります: "{作|つく}ります", 解の公式: "{解|かい}の{公式|こうしき}", 代入して: "{代入|だいにゅう}して", 代入します: "{代入|だいにゅう}します", 求める: "{求|もと}める", 数量: "すうりょう", 確かめます: "{確|たし}かめます", 使える: "{使|つか}える", 一定: "いってい", 増加量: "ぞうかりょう", 注意します: "{注意|ちゅうい}します", 通る: "{通|とお}る", 見つけて: "{見|み}つけて", 対応する: "{対応|たいおう}する", 比例式: "ひれいしき", 結んだ: "{結|むす}んだ", 半分: "はんぶん", 相似条件: "そうじじょうけん", 斜辺: "しゃへん", 直角二等辺三角形: "ちょっかくにとうへんさんかくけい", 三平方の定理: "{三平方|さんへいほう}の{定理|ていり}", 必要: "ひつよう", 調べる: "{調|しら}べる", 費用: "ひよう", 割合: "わりあい", 等しい: "{等|ひと}しい", 等しく: "{等|ひと}しく", 長い: "{長|なが}い", 使います: "{使|つか}います", 使えます: "{使|つか}えます", 考えて: "{考|かんが}えて", 考えます: "{考|かんが}えます", 全部: "ぜんぶ", 時間: "じかん", 変化の割合: "{変化|へんか}の{割合|わりあい}", 根号: "こんごう", 分母: "ぶんぼ", 同じ: "{同|おな}じ", 形: "かたち", 数: "かず", 展開: "てんかい", 因数分解: "いんすうぶんかい", 弧: "こ", 中心角: "ちゅうしんかく", 円周角: "えんしゅうかく", 長さ: "{長|なが}さ", 比例します: "{比例|ひれい}します", 大きさ: "{大|おお}きさ", 相似比: "そうじひ", 面積比: "めんせきひ", 体積比: "たいせきひ", 変域: "へんいき", 方程式: "ほうていしき" });
  for (const [k, v] of Object.entries(H)) L.hints[k] = R(v);

  return [sqrtBasic, sqrtCompare, sqrtSimplify, rationalize, sqrtCalc, sqrtProps, expand, factor, exprUse, proofFactor, quadSolve, quadCoef, quadWord, sqFormula, sqRate, sqGraph, sqWord, simRatio, simLines, areaVolRatio, simProof, inscribed, inscribedCalc, pythag, specialTri, pythagApply, pythagCheck, sampleTerms, sampleEst];
})();
var chu3Grade = (() => {
  const T = (label, generator, kinds, o = {}) => ({ label, generator, kinds, ...o });
  const D = ["drill", "test"], W = ["word", "test"], F = ["figure", "test"];
  const units = [
    ["c3-01", "平方根", "{平方根|へいほうこん}", "数と式", [T("平方根", "c3.sqrtBasic", D), T("平方根の大小", "c3.sqrtCompare", D), T("根号の中を簡単にする", "c3.sqrtSimplify", D), T("分母の有理化", "c3.rationalize", D), T("根号をふくむ式の計算", "c3.sqrtCalc", D, { weight: 3 }), T("平方根の性質の利用", "c3.sqrtProps", D)], { drill: [20, 5] }],
    ["c3-02", "式の展開と因数分解", "{式|しき}の{展開|てんかい}と{因数分解|いんすうぶんかい}", "数と式", [T("式の展開", "c3.expand", D, { weight: 2 }), T("因数分解", "c3.factor", D, { weight: 2 }), T("式の計算の利用", "c3.exprUse", D), T("式による説明", "c3.proofFactor", W)], { drill: [16, 5], word: [2, 10] }],
    ["c3-03", "二次方程式", "{二次方程式|にじほうていしき}", "数と式", [T("二次方程式を解く", "c3.quadSolve", D, { weight: 3 }), T("解から係数を求める", "c3.quadCoef", D), T("二次方程式の文章題", "c3.quadWord", W)], { drill: [12, 5], word: [4, 10] }],
    ["c3-04", "関数 y＝ax²", "{関数|かんすう} [[v:y]]＝[[v:a]][[v:x]]²", "関数", [T("y＝ax²の式", "c3.sqFormula", D), T("変化の割合と変域", "c3.sqRate", D), T("y＝ax²のグラフ", "c3.sqGraph", F), T("y＝ax²の利用", "c3.sqWord", W)], { drill: [8, 5], figure: [2, 15], word: [3, 10] }],
    ["c3-05", "相似な図形", "{相似|そうじ}な{図形|ずけい}", "図形", [T("相似な図形と相似比", "c3.simRatio", F), T("平行線と線分の比", "c3.simLines", F), T("面積比と体積比", "c3.areaVolRatio", D), T("相似の証明", "c3.simProof", W)], { drill: [6, 5], figure: [4, 10], word: [2, 15] }],
    ["c3-06", "円", "{円|えん}", "図形", [T("円周角の定理", "c3.inscribed", F, { weight: 2 }), T("円周角と中心角", "c3.inscribedCalc", D)], { drill: [6, 5], figure: [7, 10] }],
    ["c3-07", "三平方の定理", "{三平方|さんへいほう}の{定理|ていり}", "図形", [T("三平方の定理", "c3.pythag", F), T("特別な直角三角形", "c3.specialTri", F), T("三平方の定理の利用", "c3.pythagApply", D, { weight: 2 }), T("直角三角形かどうか", "c3.pythagCheck", D)], { drill: [10, 5], figure: [5, 10] }],
    ["c3-08", "標本調査", "{標本調査|ひょうほんちょうさ}", "データの活用", [T("全数調査と標本調査", "c3.sampleTerms", D), T("標本調査の利用", "c3.sampleEst", W)], { drill: [6, 5], word: [7, 10] }]
  ];
  return {
    grade: 9,
    note: "中学3年。学習指導要領(平成29年告示)の内容の順。問題文はすべてこのファイルで作ったもの。",
    units: units.map(([id, name, rubyName, domain, topics, testPlan], i) => ({ id, order: i + 1, name, rubyName, domain, topics, testPlan }))
  };
})();
