// 中学1年(学習指導要領の内容の順:数と式 → 関数 → 図形 → データの活用 のうち、教科書の章立てに近い7単元)。
// 文の漢字は R() で辞書(RUBY)から {漢字|かな} にする(ふりがなをつけられるように)。辞書にない漢字は検査で見つける。
var chu1Hints = {};
var chuLib = {};
var chu1 = (() => {
  const RED = "#d7263d";
  // ===== ふりがな辞書(長いことばから先に当てる) =====
  const RUBY = {
    正の数: "{正|せい}の{数|すう}", 負の数: "{負|ふ}の{数|すう}", 自然数: "しぜんすう", 整数: "せいすう", 小数: "しょうすう", 分数: "ぶんすう",
    絶対値: "ぜったいち", 数直線: "すうちょくせん", 不等号: "ふとうごう", 等号: "とうごう", 素因数分解: "そいんすうぶんかい", 素数: "そすう",
    基準: "きじゅん", 平均: "へいきん", 得点: "とくてん", 身長: "しんちょう", 記録: "きろく", 表: "ひょう", 差: "さ",
    最も: "{最|もっと}も", 高い: "{高|たか}い", 低い: "{低|ひく}い", 計算: "けいさん", 次: "つぎ", 問い: "{問|と}い", 答え: "{答|こた}え", 答: "こたえ",
    東: "ひがし", 西: "にし", 進む: "{進|すす}む", 利益: "りえき", 損失: "そんしつ", 増える: "{増|ふ}える", 減る: "{減|へ}る", 上がる: "{上|あ}がる", 下がる: "{下|さ}がる",
    重い: "{重|おも}い", 軽い: "{軽|かる}い", 時間後: "じかんご", 時間前: "じかんまえ", 収入: "しゅうにゅう", 支出: "ししゅつ", 多い: "{多|おお}い", 少ない: "{少|すく}ない",
    北: "きた", 南: "みなみ", 点: "てん", 人: "にん", 円: "えん", 個: "こ", 冊: "さつ", 枚: "まい", 回: "かい", 歳: "さい", 年後: "ねんご",
    使って: "{使|つか}って", 使わずに: "{使|つか}わずに", 表しましょう: "{表|あらわ}しましょう", 表す: "{表|あらわ}す", 表すと: "{表|あらわ}すと", 表した: "{表|あらわ}した",
    大小: "だいしょう", 数: "かず", 何個: "なんこ", 何点: "なんてん", 何人: "なんにん", 求めましょう: "{求|もと}めましょう", 求め: "{求|もと}め",
    場合: "ばあい", 上: "うえ", 下: "した", 点数: "てんすう", 合計: "ごうけい", 以上: "いじょう", 以下: "いか", 未満: "みまん", 小さい: "{小|ちい}さい", 大きい: "{大|おお}きい",
    文字: "もじ", 式: "しき", 値: "あたい", 代金: "だいきん", 買った: "{買|か}った", 買う: "{買|か}う", 買って: "{買|か}って", 出した: "{出|だ}した", 出して: "{出|だ}して",
    道のり: "{道|みち}のり", 時速: "じそく", 分速: "ふんそく", 秒速: "びょうそく", 歩いた: "{歩|ある}いた", 歩く: "{歩|ある}く", 歩いて: "{歩|ある}いて", 時間: "じかん",
    正方形: "せいほうけい", 長方形: "ちょうほうけい", 三角形: "さんかくけい", 周り: "{周|まわ}り", 長さ: "{長|なが}さ", 等分: "とうぶん", 本: "ほん", 定価: "ていか", 割引き: "{割|わり}{引|び}き",
    十の位: "{十|じゅう}の{位|くらい}", 一の位: "{一|いち}の{位|くらい}", 百の位: "{百|ひゃく}の{位|くらい}", 品物: "しなもの", 底辺: "ていへん", 高さ: "{高|たか}さ", 面積: "めんせき", 色紙: "いろがみ",
    同じ: "{同|おな}じ", 分けた: "{分|わ}けた", 分ける: "{分|わ}ける", 鉛筆: "えんぴつ", 冊数: "さっすう", 関係: "かんけい", 等式: "とうしき", 不等式: "ふとうしき",
    配る: "{配|くば}る", 配ると: "{配|くば}ると", 余り: "{余|あま}り", 余りました: "{余|あま}りました", 紙: "かみ", 重さ: "{重|おも}さ", 切り取る: "{切|き}り{取|と}る", 切り取ると: "{切|き}り{取|と}ると", 残り: "{残|のこ}り",
    持って: "{持|も}って", 倍: "ばい", 方程式: "ほうていしき", 解: "かい", 解きましょう: "{解|と}きましょう", 比例式: "ひれいしき", 比例: "ひれい", 反比例: "はんぴれい",
    合わせて: "{合|あ}わせて", 何人か: "{何人|なんにん}か", 子ども: "{子|こ}ども", 足りません: "{足|た}りません", 現在: "げんざい", 父: "ちち", 年齢: "ねんれい", 何年後: "なんねんご",
    弟: "おとうと", 兄: "あに", 家: "いえ", 出発して: "{出発|しゅっぱつ}して", 道: "みち", 追いかけました: "{追|お}いかけました", 追いつきます: "{追|お}いつきます", 何分後: "なんぷんご",
    縦: "たて", 横: "よこ", 金額: "きんがく", 菓子: "かし", 残金: "ざんきん", 値段: "ねだん", 等しく: "{等|ひと}しく", 等しい: "{等|ひと}しい",
    中: "なか", 方向: "ほうこう", 部分: "ぶぶん", 毎分: "まいふん", 水: "みず", 量: "りょう", 自動車: "じどうしゃ", 走る: "{走|はし}る", 針金: "はりがね", 容積: "ようせき", 水そう: "{水|すい}そう",
    座標: "ざひょう", 座標平面: "ざひょうへいめん", 原点: "げんてん", 軸: "じく", 対称: "たいしょう", グラフ: "グラフ", 書きましょう: "{書|か}きましょう", 書いて: "{書|か}いて",
    直線: "ちょくせん", 線分: "せんぶん", 半直線: "はんちょくせん", 両方向: "りょうほうこう", 限りなく: "{限|かぎ}りなく", 線: "せん", 端: "はし", 垂直: "すいちょく", 平行: "へいこう", 記号: "きごう",
    円周: "えんしゅう", 一部分: "いちぶぶん", 弧: "こ", 弦: "げん", 接線: "せっせん", 接点: "せってん", 半径: "はんけい", 交わる: "{交|まじ}わる", 交わります: "{交|まじ}わります", 交わり: "{交|まじ}わり",
    中点: "ちゅうてん", 垂直二等分線: "すいちょくにとうぶんせん", 角の二等分線: "{角|かく}の{二等分線|にとうぶんせん}", 二等分線: "にとうぶんせん", 等分する: "{等分|とうぶん}する", 角: "かく",
    囲まれた: "{囲|かこ}まれた", 図形: "ずけい", 図: "ず", 中心角: "ちゅうしんかく", 中心: "ちゅうしん", 垂線: "すいせん", 交点: "こうてん", 距離: "きょり", 辺: "へん", 点と直線: "{点|てん}と{直線|ちょくせん}",
    移動: "いどう", 平行移動: "へいこういどう", 回転移動: "かいてんいどう", 対称移動: "たいしょういどう", 回転: "かいてん", 矢印: "やじるし", 時計: "とけい", 針: "はり", 反対: "はんたい",
    作図: "さくず", 円周率: "えんしゅうりつ", 周の長さ: "{周|まわ}りの{長|なが}さ", 円: "えん", 立体: "りったい", 面: "めん", 頂点: "ちょうてん", 正多面体: "せいためんたい", 多面体: "ためんたい",
    角柱: "かくちゅう", 角錐: "かくすい", 円柱: "えんちゅう", 円錐: "えんすい", 球: "きゅう", 直方体: "ちょくほうたい", 立方体: "りっぽうたい", 底面: "ていめん", 側面: "そくめん", 体積: "たいせき", 表面積: "ひょうめんせき", 側面積: "そくめんせき",
    母線: "ぼせん", 展開図: "てんかいず", 回転体: "かいてんたい", 一回転: "いっかいてん", 位置: "いち", 正四角錐: "せいしかくすい", 正三角形: "せいさんかくけい", 形: "かたち",
    範囲: "はんい", 中央値: "ちゅうおうち", 平均値: "へいきんち", 最頻値: "さいひんち", 度数: "どすう", 度数分布表: "どすうぶんぷひょう", 階級: "かいきゅう", 階級値: "かいきゅうち", 階級の幅: "{階級|かいきゅう}の{幅|はば}",
    相対度数: "そうたいどすう", 累積度数: "るいせきどすう", 累積相対度数: "るいせきそうたいどすう", 確率: "かくりつ", 投げた: "{投|な}げた", 投げる: "{投|な}げる", 投げると: "{投|な}げると", 回数: "かいすう", 上向き: "{上|うわ}{向|む}き",
    中学校: "ちゅうがっこう", 年生: "ねんせい", 生徒: "せいと", 調べた: "{調|しら}べた", 結果: "けっか", 割合: "わりあい", 四捨五入: "ししゃごにゅう", 小数第: "{小数|しょうすう}{第|だい}", 位: "い", 程度: "ていど", 考えられます: "{考|かんが}えられます",
    含まれる: "{含|ふく}まれる", 何: "なん", 何回: "なんかい", 実験: "じっけん", 画びょう: "{画|が}びょう", 針が: "{針|はり}が", 部: "ぶ",
    答えましょう: "{答|こた}えましょう", 何ですか: "{何|なん}ですか", 何といいますか: "{何|なん}といいますか", 全部: "ぜんぶ", 考えて: "{考|かんが}えて",
    号: "ごう", 数学: "すうがく", 気温: "きおん", 温度: "おんど", 前: "まえ", 後: "ご", 名前: "なまえ", 読んだ: "{読|よ}んだ", 日: "にち", 文: "ぶん",
    入れる: "{入|い}れる", 入れて: "{入|い}れて", 入れた: "{入|い}れた", 入れ: "{入|い}れ", 全体: "ぜんたい", 図のとおり: "{図|ず}のとおり", 表のとおり: "{表|ひょう}のとおり", 数量: "すうりょう",
    方: "ほう", 片方: "かたほう", 和: "わ", 積: "せき", 商: "しょう", 二乗: "にじょう", 乗: "じょう", 一次式: "いちじしき", 項: "こう", 係数: "けいすう", 手: "て", 枚数: "まいすう",
    一つ: "{一|ひと}つ", 二つ: "{二|ふた}つ", 一: "いち", 二: "に", 中央: "ちゅうおう", 通る: "{通|とお}る", 通り: "{通|とお}り", 示す: "{示|しめ}す", 対応: "たいおう", 変化: "へんか", 変数: "へんすう",
    比例定数: "ひれいていすう", 左: "ひだり", 右: "みぎ", 当てはまる: "{当|あ}てはまる", 部屋: "へや", 長い: "{長|なが}い", 短い: "{短|みじか}い", 合う: "{合|あ}う", 合った: "{合|あ}った",
    結ぶ: "{結|むす}ぶ", 結んだ: "{結|むす}んだ", 一辺: "{一辺|いっぺん}", 地点: "ちてん", 毎時: "まいじ", 速さ: "{速|はや}さ", 出発: "しゅっぱつ", 同時: "どうじ", 列: "れつ", 並べる: "{並|なら}べる",
    教室: "きょうしつ", 学校: "がっこう", 通学時間: "つうがくじかん", 握力: "あくりょく", 反復横とび: "{反復横|はんぷくよこ}とび", 上体起こし: "{上体起|じょうたいお}こし", 家庭学習: "かていがくしゅう",
    分: "ふん", 秒: "びょう", 時: "じ", 平面: "へいめん", 空間: "くうかん", 活用: "かつよう", 正: "せい", 負: "ふ", 文章題: "ぶんしょうだい",
    折れ線: "{折|お}れ{線|せん}", 柱状: "ちゅうじょう", 求める: "{求|もと}める", 求めた: "{求|もと}めた", 一次方程式: "いちじほうていしき", 移項: "いこう"
  };
  Object.assign(RUBY, { 箱: "はこ", 牛乳: "ぎゅうにゅう", 配ろう: "{配|くば}ろう", 配ります: "{配|くば}ります", 短く: "{短|みじか}く", 大きく: "{大|おお}きく", 買いました: "{買|か}いました", 買ったら: "{買|か}ったら", 買い: "{買|か}い", 行きました: "{行|い}きました", 始め: "{始|はじ}め", 何面体: "なんめんたい" });
  Object.assign(RUBY, { 高い人: "{高|たか}い{人|ひと}", 低い人: "{低|ひく}い{人|ひと}", 多い人: "{多|おお}い{人|ひと}", 少ない人: "{少|すく}ない{人|ひと}", 人の割合: "{人|ひと}の{割合|わりあい}" });
  const MAXK = 10;
  const isK = (ch) => /[一-鿿々]/.test(ch);
  function conv(s) {
    let out = "";
    for (let i = 0; i < s.length; ) {
      if (!isK(s[i])) {
        out += s[i++];
        continue;
      }
      let hit = null;
      for (let L = Math.min(MAXK, s.length - i); L >= 1; L--) {
        const w = s.substr(i, L);
        if (RUBY[w] !== void 0) {
          hit = w;
          break;
        }
      }
      if (!hit) {
        out += s[i++];
        continue;
      }
      const v = RUBY[hit];
      out += v.includes("{") ? v : `{${hit}|${v}}`;
      i += hit.length;
    }
    return out;
  }
  // すでに {漢字|かな} や [[...]] になっているところはそのまま
  const R = (s) => String(s).split(/(\{[^{}|]+\|[^{}|]*\}|\[\[[^\]]*\]\])/).map((seg, i) => i % 2 ? seg : conv(seg)).join("");
  // 数による読みのちがい
  const fun = (n) => `{分|${[2, 5, 7, 9].includes(n % 10) ? "ふん" : "ぷん"}}`;
  const hon = (n) => `{本|${[1, 6, 8, 0].includes(n % 10) ? "ぽん" : n % 10 === 3 ? "ぼん" : "ほん"}}`;

  // ===== 有理数(分数) [分子, 分母] =====
  const gcd = (a, b) => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a || 1;
  };
  const Q = (n, d = 1) => {
    if (d < 0) {
      n = -n;
      d = -d;
    }
    const g = gcd(n, d);
    return [n / g + 0, d / g];
  };
  const qa = (a, b) => Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
  const qs = (a, b) => Q(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
  const qm = (a, b) => Q(a[0] * b[0], a[1] * b[1]);
  const qd = (a, b) => {
    if (b[0] === 0) throw new Error("0でわる");
    return Q(a[0] * b[1], a[1] * b[0]);
  };
  const qneg = (a) => Q(-a[0], a[1]);
  const qeq = (a, b) => a[0] === b[0] && a[1] === b[1];
  const qpow = (a, k) => {
    let r = Q(1);
    for (let i = 0; i < k; i++) r = qm(r, a);
    return r;
  };
  const qabs = (a) => Q(Math.abs(a[0]), a[1]);
  const isInt = (a) => a[1] === 1;
  const qv = (a) => a[0] / a[1];
  // 有限小数なら小数のけた数、そうでなければ -1
  const decPl = (a) => {
    let d = a[1], k2 = 0, k5 = 0;
    while (d % 2 === 0) d /= 2, k2++;
    while (d % 5 === 0) d /= 5, k5++;
    return d === 1 ? Math.max(k2, k5) : -1;
  };
  const decStr = (a) => {
    const k = decPl(a), n = Math.abs(a[0]) * 10 ** k / a[1];
    if (k <= 0) return String(Math.round(n));
    const s = String(Math.round(n)).padStart(k + 1, "0");
    return `${s.slice(0, -k)}.${s.slice(-k)}`;
  };
  // 数の書き方。dec: 小数で書く。符号「－」は全角。
  const absTex = (a, dec) => isInt(a) ? String(Math.abs(a[0])) : dec && decPl(a) > 0 ? decStr(a) : `[[f:${Math.abs(a[0])}/${a[1]}]]`;
  const num = (a, dec) => (a[0] < 0 ? "－" : "") + absTex(a, dec);
  const sgn = (a, dec) => a[0] === 0 ? "0" : (a[0] < 0 ? "－" : "＋") + absTex(a, dec);
  const par = (a, dec) => `(${sgn(a, dec)})`;
  const SUP = { 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  const SUPR = Object.fromEntries(Object.entries(SUP).map(([k, v]) => [v, Number(k)]));

  // ===== 式の値を計算する(検算用)。全角の ＋－×÷()、²³、[[f:a/b]]、[[v:x]]、1文字の文字、かけ算の記号の省略に対応 =====
  function tokenize(s) {
    const out = [];
    s = String(s).replace(/\{([^{}|]+)\|[^{}|]*\}/g, "$1");
    for (let i = 0; i < s.length; ) {
      const ch = s[i];
      if (s.startsWith("[[f:", i)) {
        let depth = 0, j = i;
        for (; j < s.length; j++) {
          if (s.startsWith("[[", j)) depth++, j++;
          else if (s.startsWith("]]", j)) {
            depth--;
            j++;
            if (!depth) break;
          }
        }
        const body = s.slice(i + 4, j - 1);
        const k = body.lastIndexOf("/");
        out.push({ k: "frac", n: body.slice(0, k), d: body.slice(k + 1) });
        i = j + 1;
      } else if (s.startsWith("[[v:", i)) {
        out.push({ k: "var", v: s[i + 4] });
        i += 7;
      } else if (/[0-9.]/.test(ch)) {
        let j = i;
        while (j < s.length && /[0-9.]/.test(s[j])) j++;
        const t = s.slice(i, j), p = (t.split(".")[1] || "").length;
        out.push({ k: "num", q: Q(Math.round(Number(t) * 10 ** p), 10 ** p) });
        i = j;
      } else if (/[a-zA-Z]/.test(ch)) {
        out.push({ k: "var", v: ch });
        i++;
      } else if ("＋+".includes(ch)) out.push({ k: "+" }), i++;
      else if ("－-−".includes(ch)) out.push({ k: "-" }), i++;
      else if ("×".includes(ch)) out.push({ k: "*" }), i++;
      else if ("÷".includes(ch)) out.push({ k: "/" }), i++;
      else if ("（(".includes(ch)) out.push({ k: "(" }), i++;
      else if ("）)".includes(ch)) out.push({ k: ")" }), i++;
      else if (SUPR[ch]) out.push({ k: "pow", e: SUPR[ch] }), i++;
      else if (/[\s　]/.test(ch)) i++;
      else throw new Error(`式に読めない字: ${ch} in ${s}`);
    }
    return out;
  }
  function evalQ(s, vars = {}) {
    const tk = tokenize(s);
    let i = 0;
    const peek = () => tk[i];
    const startsPrimary = (t) => t && (t.k === "num" || t.k === "frac" || t.k === "var" || t.k === "(");
    function expr() {
      let v = term();
      while (peek() && (peek().k === "+" || peek().k === "-")) {
        const op = tk[i++].k, r = term();
        v = op === "+" ? qa(v, r) : qs(v, r);
      }
      return v;
    }
    // ×・÷ は左から。記号を省いたかけ算(3ab など)はひとまとまり(12a²b÷4ab ＝ 12a²b÷(4ab))
    function term() {
      let v = iprod();
      for (;;) {
        const t = peek();
        if (t && (t.k === "*" || t.k === "/")) {
          i++;
          const r = iprod();
          v = t.k === "*" ? qm(v, r) : qd(v, r);
        } else break;
      }
      return v;
    }
    function iprod() {
      let v = unary();
      while (startsPrimary(peek())) v = qm(v, power());
      return v;
    }
    function unary() {
      const t = peek();
      if (t && t.k === "-") return i++, qneg(unary());
      if (t && t.k === "+") return i++, unary();
      return power();
    }
    function power() {
      let v = primary();
      while (peek() && peek().k === "pow") v = qpow(v, tk[i++].e);
      return v;
    }
    function primary() {
      const t = tk[i++];
      if (!t) throw new Error(`式が途中で終わる: ${s}`);
      if (t.k === "num") return t.q;
      if (t.k === "frac") return qd(evalQ(t.n, vars), evalQ(t.d, vars));
      if (t.k === "var") {
        if (!vars[t.v]) throw new Error(`文字の値がない: ${t.v}`);
        return vars[t.v];
      }
      if (t.k === "(") {
        const v = expr();
        if (!tk[i] || tk[i].k !== ")") throw new Error(`かっこが閉じない: ${s}`);
        i++;
        return v;
      }
      throw new Error(`式の形がおかしい: ${s}`);
    }
    const v = expr();
    if (i !== tk.length) throw new Error(`式の後ろに余り: ${s}`);
    return v;
  }
  // 2つの式が(文字にいろいろな値を入れても)等しいか
  const TRY = [Q(2), Q(-3), Q(5, 2), Q(7), Q(-1, 3)];
  function sameExpr(a, b, letters = ["x"]) {
    for (let k = 0; k < TRY.length; k++) {
      const vars = {};
      letters.forEach((L, j) => vars[L] = TRY[(k + j * 2) % TRY.length]);
      if (!qeq(evalQ(a, vars), evalQ(b, vars))) return false;
    }
    return true;
  }

  // ===== 文字式の書き方 =====
  const V = (L) => `[[v:${L}]]`;
  // 係数 a の項(a＝1 なら x、a＝－1 なら －x)
  const coefTex = (a, dec) => qeq(a, Q(1)) ? "" : qeq(a, Q(-1)) ? "－" : num(a, dec);
  // a x ＋ b(x がないときは b だけ)
  function lin(a, b, L = "x", dec) {
    const parts = [];
    if (a[0] !== 0) parts.push(coefTex(a, dec) + V(L));
    if (b[0] !== 0 || !parts.length) parts.push(parts.length ? (b[0] < 0 ? "－" : "＋") + absTex(b, dec) : num(b, dec));
    return parts.join("");
  }
  // いくつかの項(係数と文字の組)を並べる [[a, "x"], [b, ""]]
  function poly(terms, dec) {
    let s = "";
    for (const [c, L] of terms) {
      if (c[0] === 0) continue;
      const body = L ? (qeq(qabs(c), Q(1)) ? "" : absTex(c, dec)) + L : absTex(c, dec);
      s += (c[0] < 0 ? "－" : s ? "＋" : "") + body;
    }
    return s || "0";
  }
  const nz = (rng, lo, hi) => {
    for (;;) {
      const v = rng.int(lo, hi);
      if (v) return v;
    }
  };
  const lv = (basic, normal, challenge) => ({ basic, normal, challenge });
  const typeOf = (rng, p, ctx) => ctx && Number.isInteger(ctx.index) ? p.types[ctx.index % p.types.length] : rng.pick(p.types);
  const ALPHA = ["A", "B", "C", "D", "E", "F", "G"];
  const MARU = ["①", "②", "③", "④"];

  // ===== 図(mm) =====
  const L_ = (x1, y1, x2, y2, o = {}) => ({ t: "line", x1, y1, x2, y2, w: 0.4, ...o });
  const T_ = (x, y, s, size = 3.6, o = {}) => ({ t: "text", x, y, s: R(String(s)), size, ...o });
  const arrowHead = (x, y, dx, dy, s = 2, o = {}) => {
    const l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
    return { t: "poly", pts: [[x, y], [x - ux * s - uy * s * 0.45, y - uy * s + ux * s * 0.45], [x - ux * s + uy * s * 0.45, y - uy * s - ux * s * 0.45]], fill: o.color || "black", w: 0.2, ...o };
  };
  // 数直線 lo〜hi(整数)。u: 1 あたりの mm。half: 0.5 の目もりも
  function numberLine(lo, hi, u, { half = false, y = 12, left = 6 } = {}) {
    const items = [], xOf = (v) => left + (v - lo) * u;
    items.push(L_(xOf(lo) - 3, y, xOf(hi) + 5, y, { w: 0.5 }), arrowHead(xOf(hi) + 6, y, 1, 0, 2.2));
    for (let v = lo; v <= hi; v++) {
      items.push(L_(xOf(v), y - 2, xOf(v), y + 2, { w: v === 0 ? 0.6 : 0.35 }));
      items.push(T_(xOf(v), y + 6.2, v < 0 ? `－${-v}` : String(v), 3.3, { halo: false }));
      if (half && v < hi) items.push(L_(xOf(v + 0.5), y - 1.1, xOf(v + 0.5), y + 1.1, { w: 0.3 }));
    }
    return { items, xOf, w: xOf(hi) + 9, h: y + 9 };
  }
  // 座標平面 -n〜n。c: 1目もりの mm
  function plane(n, c, { labels = true } = {}) {
    const m = 8, O = m + n * c, items = [];
    const X = (x) => O + x * c, Y = (y) => O - y * c;
    items.push({ t: "grid", x: m, y: m, cols: 2 * n, rows: 2 * n, cell: c });
    items.push(L_(m - 2, O, X(n) + 3, O, { w: 0.5 }), arrowHead(X(n) + 4, O, 1, 0, 2));
    items.push(L_(O, Y(-n) + 2, O, m - 3, { w: 0.5 }), arrowHead(O, m - 4, 0, -1, 2));
    items.push(T_(X(n) + 4.5, O + 4.4, "[[v:x]]", 3.6), T_(O - 3.4, m - 3, "[[v:y]]", 3.6), T_(O - 1.6, O + 3.4, "O", 3, { anchor: "end" }));
    if (labels) for (let v = -n; v <= n; v++) {
      if (!v) continue;
      const s = v < 0 ? `－${-v}` : String(v);
      if (Math.abs(v) % (n > 6 ? 2 : 1) === 0) {
        items.push(T_(X(v) + (v < 0 ? -0.9 : 0), O + 3.6, s, 2.5));
        items.push(T_(O - 1, Y(v) + 0.9, s, 2.5, { anchor: "end" }));
      }
    }
    return { items, X, Y, w: 2 * O + 2, h: 2 * O, O, m };
  }
  const draw = (w, h, items, o = {}) => ({ type: "draw", w, h, items, ...o });

  // ============================================================
  // 1 正の数・負の数
  // ============================================================
  // [正の側, 負の側, 単位, 正の側のことば]
  const PAIRS = [
    ["{東|ひがし}へ{a}km{進|すす}む", "{西|にし}へ{a}km{進|すす}む", "km", "{東|ひがし}へ{進|すす}む"],
    ["{a}{円|えん}の{利益|りえき}", "{a}{円|えん}の{損失|そんしつ}", "{円|えん}", "{利益|りえき}"],
    ["{a}{人|にん}{増|ふ}える", "{a}{人|にん}{減|へ}る", "{人|にん}", "{増|ふ}える"],
    ["{a}℃{上|あ}がる", "{a}℃{下|さ}がる", "℃", "{上|あ}がる"],
    ["{a}kg{重|おも}い", "{a}kg{軽|かる}い", "kg", "{重|おも}い"],
    ["{a}{時間後|じかんご}", "{a}{時間前|じかんまえ}", "{時間|じかん}", "{後|あと}"],
    ["{a}m{高|たか}い", "{a}m{低|ひく}い", "m", "{高|たか}い"],
    ["{a}{点|てん}{多|おお}い", "{a}{点|てん}{少|すく}ない", "{点|てん}", "{多|おお}い"],
    ["{a}{個|こ}{多|おお}い", "{a}{個|こ}{少|すく}ない", "{個|こ}", "{多|おお}い"]
  ];
  const sizeOf = (u) => u === "{円|えん}" ? [100, 900, 100] : u === "{人|にん}" || u === "{個|こ}" || u === "{点|てん}" ? [2, 30, 1] : u === "m" ? [10, 90, 10] : [1, 12, 1];
  const pickStep = (rng, [lo, hi, st]) => lo + st * rng.int(0, Math.floor((hi - lo) / st));
  const signWord = {
    id: "c1.signWord",
    instruction: R("正の数・負の数を使って表しましょう。"),
    defaults: { types: ["neg", "pos"] },
    levels: lv({ types: ["neg", "pos"] }, { types: ["neg", "pos", "flip"] }, { types: ["neg", "flip", "flip"] }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx);
      const pr = rng.pick(PAIRS), rg = sizeOf(pr[2]);
      const a = pickStep(rng, rg), b = pickStep(rng, rg);
      if (a === b) return this.generate(rng, p, ctx && { index: ctx.index + 1 });
      const pos = (n) => pr[0].replace("{a}", n), neg = (n) => pr[1].replace("{a}", n);
      let text, ans;
      if (type === "neg") {
        text = `「${pos(a)}」を＋${a}${pr[2]}と${R("表すと")}、「${neg(b)}」は`;
        ans = `－${b}${pr[2]}`;
      } else if (type === "pos") {
        text = `「${neg(a)}」を－${a}${pr[2]}と${R("表すと")}、「${pos(b)}」は`;
        ans = `＋${b}${pr[2]}`;
      } else {
        // 「3kg軽い」を「重い」を使って → －3kg重い
        text = `「${neg(b)}」を、「${pr[3]}」を${R("使って")}`;
        ans = pos(`－${b}`);
      }
      return { key: `sw:${type}:${text}`, text, answer: { display: ans }, workspace: { type: "none" }, meta: { type, a, b } };
    },
    verify(pr) {
      return /[＋－]\d+/.test(pr.answer.display) ? null : "符号がない";
    }
  };

  const randQ = (rng, kind, M = 9) => {
    if (kind === "int") return Q(rng.int(-M, M));
    if (kind === "dec") return Q(rng.int(-M * 10, M * 10), 10);
    const d = rng.pick([2, 3, 4, 5, 6]);
    return Q(nz(rng, -M, M), d);
  };
  const compare = {
    id: "c1.compare",
    instruction: R("数の大小を、不等号を使って表しましょう。"),
    defaults: { kinds: ["int"], three: false },
    levels: lv({ kinds: ["int"], three: false }, { kinds: ["int", "dec"], three: false }, { kinds: ["dec", "frac"], three: true }),
    generate(rng, p) {
      for (let t = 0; t < 200; t++) {
        const n = p.three ? 3 : 2;
        const vs = Array.from({ length: n }, () => randQ(rng, rng.pick(p.kinds)));
        if (new Set(vs.map(String)).size < n) continue;
        if (!vs.some((v) => v[0] < 0)) continue;
        if (n === 3 && !vs.some((v) => !isInt(v))) continue;
        const dec = (v) => decPl(v) > 0 && decPl(v) <= 1;
        const show = (v) => sgn(v, dec(v));
        if (n === 2) {
          const [a, b] = vs, s = qv(a) < qv(b) ? "＜" : "＞";
          return { key: `cp:${vs}`, text: `${show(a)}　□　${show(b)}`, answer: { display: s }, workspace: { type: "none" }, meta: { vs } };
        }
        const sorted = vs.slice().sort((x, y) => qv(x) - qv(y));
        return { key: `cp:${vs}`, text: vs.map(show).join("，"), answer: { display: sorted.map(show).join("＜") }, workspace: { type: "none" }, meta: { vs } };
      }
      throw new Error("大小の問題が作れない");
    },
    verify(pr) {
      if (pr.meta.vs.length === 2) {
        const [a, b] = pr.meta.vs, s = pr.answer.display;
        return s === "＜" === qv(a) < qv(b) ? null : "不等号が逆";
      }
      const parts = pr.answer.display.split("＜").map((x) => evalQ(x));
      for (let i = 1; i < parts.length; i++) if (!(qv(parts[i - 1]) < qv(parts[i]))) return "順がちがう";
      return null;
    }
  };

  const absValue = {
    id: "c1.absValue",
    instruction: R("次の問いに答えましょう。"),
    defaults: { types: ["abs", "both"] },
    levels: lv({ types: ["abs", "abs", "both"] }, { types: ["abs", "both", "list"] }, { types: ["both", "list", "count", "absFrac"] }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx);
      if (type === "abs") {
        const v = rng.chance(0.25) ? Q(nz(rng, -99, 99), 10) : Q(nz(rng, -15, 15));
        return { key: `av:a:${v}`, text: `${sgn(v, true)}${R("の絶対値")}`, answer: { display: absTex(v, true) }, workspace: { type: "none" }, meta: { type, v } };
      }
      if (type === "absFrac") {
        const v = Q(nz(rng, -9, 9), rng.pick([2, 3, 4, 5, 7]));
        if (isInt(v)) return this.generate(rng, { types: ["abs"] });
        return { key: `av:f:${v}`, text: `${sgn(v)}${R("の絶対値")}`, answer: { display: absTex(v) }, workspace: { type: "none" }, meta: { type, v } };
      }
      if (type === "both") {
        const v = rng.chance(0.25) ? Q(rng.int(11, 59), 10) : Q(rng.int(1, 12));
        return { key: `av:b:${v}`, text: R(`絶対値が${absTex(v, true)}である数`), answer: { display: `＋${absTex(v, true)}，－${absTex(v, true)}` }, workspace: { type: "none" }, meta: { type, v } };
      }
      const k = rng.int(2, 4), half = rng.chance(0.5);
      const lim = half ? `${k}.5` : String(k);
      const rel = rng.pick(half ? ["以下", "より小さい"] : ["以下", "より小さい", "未満"]);
      const ok = (n) => half ? Math.abs(n) <= k : rel === "以下" ? Math.abs(n) <= k : Math.abs(n) < k;
      const list = [];
      for (let n = -k; n <= k; n++) if (ok(n)) list.push(n);
      if (type === "count") return { key: `av:c:${lim}:${rel}`, text: R(`絶対値が${lim}${rel}の整数は何個`), answer: { display: `${list.length}${R("個")}` }, workspace: { type: "none" }, meta: { type, list } };
      return { key: `av:l:${lim}:${rel}`, text: R(`絶対値が${lim}${rel}の整数を全部`), answer: { display: list.map((n) => n < 0 ? `－${-n}` : n ? `＋${n}` : "0").join("，") }, workspace: { type: "none" }, meta: { type, list } };
    },
    verify(pr) {
      const m = pr.meta;
      if (m.type === "abs" || m.type === "absFrac") return qeq(evalQ(pr.answer.display), qabs(m.v)) ? null : "絶対値が合わない";
      if (m.type === "both") return null;
      if (m.type === "count") return parseInt(pr.answer.display) === m.list.length ? null : "個数";
      return pr.answer.display.split("，").length === m.list.length ? null : "数の個数";
    }
  };

  const numLine = {
    id: "c1.numLine",
    instruction: null,
    defaults: { half: false, types: ["read", "plot"] },
    levels: lv({ half: false, types: ["read", "plot"] }, { half: true, types: ["read", "plot"] }, { half: true, frac: true, types: ["read", "plot"] }),
    generate(rng, p, ctx) {
      const type = typeOf(rng, p, ctx);
      const u = 11, nl = numberLine(-6, 6, u, { half: p.half, y: 13 });
      const n = 4;
      const cand = [];
      for (let v = -11; v <= 11; v++) if (p.half || v % 2 === 0) cand.push(Q(v, 2));
      for (let t = 0; t < 100; t++) {
        const vs = rng.shuffle(cand).slice(0, n);
        if (vs.some((v) => Math.abs(qv(v)) > 5.5)) continue;
        if (!vs.some((v) => v[0] < 0) || !vs.some((v) => v[0] > 0)) continue;
        const sorted = vs.slice().sort((a, b) => qv(a) - qv(b));
        if (sorted.some((v, i) => i && qv(v) - qv(sorted[i - 1]) < 1)) continue;
        if (p.half && !vs.some((v) => !isInt(v))) continue;
        const useFrac = p.frac && type === "plot";
        const show = (v) => sgn(v, !useFrac);
        const pts = (color) => vs.flatMap((v, i) => [{ t: "dot", x: nl.xOf(qv(v)), y: 13, r: 1.1, color }, T_(nl.xOf(qv(v)), 7.4, ALPHA[i], 3.6, { bold: true, color })]);
        if (type === "read") {
          return {
            key: `nl:r:${vs}`,
            text: R("数直線上の点A，B，C，Dにあたる数を答えましょう。"),
            figure: draw(nl.w, nl.h, [...nl.items, ...pts()]),
            answer: { display: vs.map((v, i) => `${ALPHA[i]} ${show(v)}`).join("　") },
            workspace: { type: "lines", labels: ALPHA.slice(0, n) },
            meta: { type, vs }
          };
        }
        return {
          key: `nl:p:${vs}`,
          text: `${R("次の数を表す点を、数直線上にかきましょう。")}[[br]]${vs.map((v, i) => `${ALPHA[i]}　${show(v)}`).join("　　")}`,
          figure: draw(nl.w, nl.h, nl.items),
          answer: { display: R("図のとおり"), figure: draw(nl.w, nl.h, [...nl.items, ...pts(RED)]) },
          workspace: { type: "none" },
          meta: { type, vs }
        };
      }
      throw new Error("数直線の問題が作れない");
    },
    verify(pr) {
      const fig = pr.meta.type === "read" ? pr.figure : pr.answer.figure;
      const dots = fig.items.filter((it) => it.t === "dot");
      if (dots.length !== pr.meta.vs.length) return "点の数";
      const x0 = fig.items.find((it) => it.t === "text" && it.s === "0").x;
      for (let i = 0; i < dots.length; i++) if (Math.abs((dots[i].x - x0) / 11 - qv(pr.meta.vs[i])) > 1e-6) return "点の位置";
      return null;
    }
  };

  // 計算問題の共通部分:式をつくる関数 make(rng) → 式の文字列。答えが条件に合うまでくりかえす。
  function calcGen(id, instruction, levels, makers, opts = {}) {
    return {
      id,
      instruction: R(instruction),
      defaults: levels.basic,
      levels,
      generate(rng, p, ctx) {
        for (let t = 0; t < 400; t++) {
          const form = typeOf(rng, { types: p.forms }, ctx && { index: ctx.index + t });
          const ex = makers[form](rng, p);
          if (!ex) continue;
          let v;
          try {
            v = evalQ(ex.q ?? ex);
          } catch (e) {
            continue;
          }
          const maxD = p.maxDen ?? 1;
          if (v[1] > maxD) continue;
          if (Math.abs(qv(v)) > (p.maxAbs ?? 200)) continue;
          if (opts.notZero && v[0] === 0) continue;
          const dec = ex.dec ?? false;
          if (dec && decPl(v) < 0) continue;
          const text = ex.q ?? ex;
          return { key: `${id}:${text}`, text: `${text}＝`, inline: true, answer: { display: num(v, dec) }, workspace: { type: "none" }, meta: { form, q: text } };
        }
        throw new Error(`${id} の問題が作れない`);
      },
      verify(pr) {
        return qeq(evalQ(pr.meta.q), evalQ(pr.answer.display)) ? null : `答えが合わない ${pr.meta.q} → ${pr.answer.display}`;
      }
    };
  }
  const I = (rng, M = 12) => Q(nz(rng, -M, M));
  const I2 = (rng, M = 12) => {
    for (;;) {
      const v = nz(rng, -M, M);
      if (Math.abs(v) > 1) return Q(v);
    }
  };
  const F = (rng, M = 7) => {
    for (;;) {
      const v = Q(nz(rng, -M, M), rng.pick([2, 3, 4, 5, 6, 8]));
      if (!isInt(v)) return v;
    }
  };
  const D = (rng, M = 9) => {
    for (;;) {
      const v = Q(nz(rng, -M * 10, M * 10), 10);
      if (!isInt(v)) return v;
    }
  };
  // 項を並べる(かっこなし):－3＋8－5
  const chain = (vs, dec) => vs.map((v, i) => i === 0 ? num(v, dec) : (v[0] < 0 ? "－" : "＋") + absTex(v, dec)).join("");
  const addSub = calcGen("c1.addSub", "次の計算をしましょう。", lv({ forms: ["pp", "pm"], maxAbs: 40 }, { forms: ["pm3", "chain3", "chain4", "pm"], maxAbs: 40 }, { forms: ["decChain", "fracPm", "fracChain", "pm3"], maxDen: 24, maxAbs: 40 }), {
    pp: (rng) => `${par(I(rng))}＋${par(I(rng))}`,
    pm: (rng) => `${par(I(rng))}－${par(I(rng))}`,
    pm3: (rng) => `${par(I(rng))}${rng.pick(["＋", "－"])}${par(I(rng))}${rng.pick(["＋", "－"])}${par(I(rng))}`,
    chain3: (rng) => chain([I(rng, 15), I(rng, 15), I(rng, 15)]),
    chain4: (rng) => chain([I(rng, 12), I(rng, 12), I(rng, 12), I(rng, 12)]),
    decChain: (rng) => ({ q: chain([D(rng, 5), D(rng, 5), rng.chance(0.5) ? I(rng, 5) : D(rng, 5)], true), dec: true }),
    fracPm: (rng) => `${par(F(rng, 5))}${rng.pick(["＋", "－"])}${par(F(rng, 5))}`,
    fracChain: (rng) => chain([F(rng, 5), F(rng, 5), I(rng, 3)])
  }, {});
  const divisible = (rng, M = 9) => {
    const b = I2(rng, M), q = I(rng, M);
    return [qm(b, q), b];
  };
  const mulDiv = calcGen("c1.mulDiv", "次の計算をしましょう。", lv({ forms: ["mul", "div", "mul", "div"], maxAbs: 200 }, { forms: ["mul3", "pow", "powNeg", "mulDiv", "powMul"], maxAbs: 400 }, { forms: ["fracMul", "fracDiv", "fracMulDiv", "fracPow", "powMul"], maxDen: 30, maxAbs: 300 }), {
    mul: (rng) => `${par(I2(rng))}×${par(I2(rng))}`,
    div: (rng) => {
      const [a, b] = divisible(rng);
      return `${par(a)}÷${par(b)}`;
    },
    mul3: (rng) => `${num(I2(rng, 6))}×${par(I2(rng, 6))}×${par(I2(rng, 6))}`,
    pow: (rng) => `${par(Q(nz(rng, -5, -2)))}${rng.pick(["²", "³"])}`,
    powNeg: (rng) => `－${rng.int(2, 6)}²`,
    mulDiv: (rng) => {
      const [a, b] = divisible(rng, 8);
      return `${num(a)}÷${par(b)}×${par(I(rng, 6))}`;
    },
    powMul: (rng) => rng.chance(0.5) ? `${par(Q(nz(rng, -4, -2)))}²×${par(I(rng, 5))}` : `－${rng.int(2, 4)}²÷${par(I(rng, 4))}`,
    fracMul: (rng) => `${par(F(rng, 9))}×${par(F(rng, 9))}`,
    fracDiv: (rng) => `${par(F(rng, 9))}÷${par(F(rng, 9))}`,
    fracMulDiv: (rng) => `${num(F(rng, 9))}÷${par(F(rng, 9))}×${par(I(rng, 6))}`,
    fracPow: (rng) => `${par(Q(-rng.int(1, 4), rng.int(2, 5)))}${rng.pick(["²", "³"])}×${par(I(rng, 9))}`
  });
  const fourOps = calcGen("c1.fourOps", "次の計算をしましょう。", lv({ forms: ["addMul", "divSub", "mulSub"], maxAbs: 100 }, { forms: ["powMul", "divPow", "paren", "cube"], maxAbs: 150 }, { forms: ["dist", "fracMix", "powDiv", "paren2"], maxDen: 12, maxAbs: 150 }), {
    addMul: (rng) => `${num(I(rng, 15))}＋${rng.int(2, 9)}×${par(I(rng, 9))}`,
    divSub: (rng) => {
      const [a, b] = divisible(rng, 9);
      return `${num(a)}÷${par(b)}${rng.pick(["＋", "－"])}${rng.int(2, 15)}`;
    },
    mulSub: (rng) => `${par(I(rng, 9))}×${rng.int(2, 9)}－${par(I(rng, 15))}`,
    powMul: (rng) => `${par(Q(nz(rng, -5, -2)))}²×${rng.int(2, 5)}${rng.pick(["＋", "－"])}${rng.int(2, 20)}`,
    divPow: (rng) => {
      const k = rng.int(2, 4), m = rng.int(1, 5) * k * k;
      return `${m * rng.pick([1, -1])}÷${rng.chance(0.5) ? `(－${k}²)` : `(－${k})²`}`.replace(/^(-)/, "－");
    },
    paren: (rng) => `${num(I(rng, 6))}×(${rng.int(1, 9)}－${rng.int(5, 15)})${rng.pick(["＋", "－"])}${rng.int(2, 20)}`,
    cube: (rng) => `${par(Q(nz(rng, -3, -1)))}³${rng.pick(["＋", "－"])}${rng.int(2, 6)}×${par(I(rng, 5))}`,
    dist: (rng) => {
      const d1 = rng.pick([2, 3, 4, 6]), d2 = rng.pick([2, 3, 4, 6]);
      const L = d1 * d2 / gcd(d1, d2) * rng.pick([1, 2]);
      return `(${num(Q(1 + rng.int(0, d1 - 2), d1))}－${num(Q(1 + rng.int(0, d2 - 2), d2))})×${par(Q(-L))}`;
    },
    fracMix: (rng) => `${num(F(rng, 5))}＋${par(F(rng, 5))}×${rng.int(2, 6)}`,
    powDiv: (rng) => `－${rng.int(2, 4)}²÷[[f:${rng.int(1, 4)}/${rng.int(2, 5)}]]${rng.pick(["＋", "－"])}${par(Q(-1))}³`,
    paren2: (rng) => `${rng.int(2, 20)}－(${num(I(rng, 6))}＋${rng.int(2, 9)})²÷${rng.pick([2, 3, 4, 5])}`
  });

  const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19];
  const factorTex = (n) => {
    const out = [];
    for (const pr of PRIMES) {
      let k = 0;
      while (n % pr === 0) n /= pr, k++;
      if (k > 9) return null;
      if (k) out.push(pr + (k > 1 ? SUP[k] : ""));
    }
    if (n !== 1) return null;
    return out.join("×");
  };
  const primeFactor = {
    id: "c1.primeFactor",
    instruction: R("素因数分解しましょう。"),
    defaults: { lo: 12, hi: 100, maxP: 7 },
    levels: lv({ lo: 12, hi: 100, maxP: 7 }, { lo: 60, hi: 400, maxP: 11 }, { lo: 200, hi: 2000, maxP: 13 }),
    generate(rng, p) {
      for (let t = 0; t < 400; t++) {
        const n = rng.int(p.lo, p.hi), f = factorTex(n);
        if (!f) continue;
        if (PRIMES.some((pr) => pr > p.maxP && n % pr === 0)) continue;
        let cnt = 0, m = n;
        for (const pr of PRIMES) while (m % pr === 0) m /= pr, cnt++;
        if (cnt < 3) continue;
        return { key: `pf:${n}`, text: String(n), answer: { display: f }, workspace: { type: "none" }, meta: { n } };
      }
      throw new Error("素因数分解の問題が作れない");
    },
    verify(pr) {
      const parts = pr.answer.display.split("×");
      let prod = 1;
      for (const s of parts) {
        const m = /^(\d+)([²³⁴⁵⁶⁷⁸⁹]?)$/.exec(s);
        if (!m || !PRIMES.includes(Number(m[1]))) return "素数でない";
        prod *= Number(m[1]) ** (m[2] ? SUPR[m[2]] : 1);
      }
      return prod === pr.meta.n ? null : "積が合わない";
    }
  };

  const DIFF_THEMES = [
    { what: "数学のテストの得点", unit: "点", bases: [60, 65, 70, 75], spread: 15, hi: "高い", lo: "低い" },
    { what: "身長", unit: "cm", bases: [150, 155, 160], spread: 12, hi: "高い", lo: "低い" },
    { what: "1日に読んだ本のページ数", unit: "ページ", bases: [30, 40, 50], spread: 18, hi: "多い", lo: "少ない" }
  ];
  const avgDiff = {
    id: "c1.avgDiff",
    instruction: null,
    defaults: { n: 5, askOne: false, givenMean: false },
    levels: lv({ n: 5, askOne: true, givenMean: false }, { n: 6, askOne: true, givenMean: false }, { n: 6, askOne: false, givenMean: true }),
    generate(rng, p) {
      for (let t = 0; t < 300; t++) {
        const th = rng.pick(DIFF_THEMES), base = rng.pick(th.bases), n = p.n;
        const ds = Array.from({ length: n }, () => rng.int(-th.spread, th.spread));
        const sum = ds.reduce((a, b) => a + b, 0);
        if (sum % n) continue;
        if (new Set(ds).size < n || !ds.some((d) => d < 0) || !ds.some((d) => d > 0) || ds.includes(0) && rng.chance(0.5)) continue;
        const mean = base + sum / n, mx = Math.max(...ds), mn = Math.min(...ds);
        const names = ALPHA.slice(0, n), u = R(th.unit);
        const sd = (d) => d === 0 ? "0" : d < 0 ? `－${-d}` : `＋${d}`;
        const qs2 = [], ans = [];
        let hide = -1;
        if (p.givenMean) hide = rng.int(0, n - 1);
        const row = ds.map((d, i) => i === hide ? "" : sd(d));
        if (p.givenMean) {
          qs2.push(R(`${n}人の平均が${mean}${th.unit}のとき、${names[hide]}さんの${th.what}は何${th.unit}ですか。`));
          ans.push(`${base + ds[hide]}${u}`);
        }
        if (p.askOne) {
          const k = rng.int(0, n - 1);
          qs2.push(R(`${names[k]}さんの${th.what}は何${th.unit}ですか。`));
          ans.push(`${base + ds[k]}${u}`);
        }
        qs2.push(R(`${th.what}が最も${th.hi}人と最も${th.lo}人の差は何${th.unit}ですか。`));
        ans.push(`${mx - mn}${u}`);
        if (!p.givenMean) {
          qs2.push(R(`${n}人の${th.what}の平均は何${th.unit}ですか。`));
          ans.push(`${mean}${u}`);
        }
        const lead = R(`下の表は、${n}人の${th.what}を、${base}${th.unit}を基準にして、それより${th.hi}場合を正の数、${th.lo}場合を負の数で表したものです。`);
        return {
          key: `ad:${th.what}:${base}:${ds}:${hide}`,
          softKey: th.what,
          text: `${lead}[[br]]${qs2.map((q, i) => `(${i + 1}) ${q}`).join("[[br]]")}`,
          figure: { type: "table", head: ["", ...names], rows: [[R(`基準との差（${th.unit}）`), ...row]] },
          answer: { display: ans.map((a, i) => `(${i + 1}) ${a}`).join("　") },
          workspace: { type: "lines", labels: qs2.map((_, i) => `(${i + 1})`) },
          meta: { base, ds, mean, hide }
        };
      }
      throw new Error("基準との差の問題が作れない");
    },
    verify(pr) {
      const { base, ds, mean } = pr.meta;
      return base + ds.reduce((a, b) => a + b, 0) / ds.length === mean ? null : "平均が合わない";
    }
  };
