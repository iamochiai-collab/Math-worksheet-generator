// ===== くらしの数学(特別支援学校 高等部むけ) =====
// 買い物・料理・予定・時間・お金の使い方・荷物・電気・通勤・仕事・給与明細など、くらしや働く場面の問題。
// 数や場面は毎回かわる。part2〜part5 に部品、part6 で段階(GRADES[28]「くらしの数学」)に入れる。
// 文の漢字は K() で辞書(DICT)から {漢字|かな} にする(ふりがな・習っていない漢字をひらがなにするため)。
var kurashiGens = [];
var kurashiLib = (() => {
  // ===== ふりがな辞書(長いことばから先に当てる) =====
  const DICT = {
    // 人・生活
    健康: "けんこう", 生活: "せいかつ", 体温: "たいおん", 睡眠: "すいみん", 記録: "きろく", 食事: "しょくじ", 献立: "こんだて", 摂取: "せっしゅ",
    朝食: "ちょうしょく", 昼食: "ちゅうしょく", 夕食: "ゆうしょく", 間食: "かんしょく", 寝た: "{寝|ね}た", 寝て: "{寝|ね}て", 寝る: "{寝|ね}る", 起きた: "{起|お}きた", 起きて: "{起|お}きて", 起きる: "{起|お}きる", 起きました: "{起|お}きました",
    次の日: "{次|つぎ}の{日|ひ}", 平日: "へいじつ", 休日: "きゅうじつ", 午前: "ごぜん", 午後: "ごご", 身長: "しんちょう", 体重: "たいじゅう", 身体計測: "しんたいけいそく", 結果: "けっか",
    表: "ひょう", 下の: "{下|した}の", 上の: "{上|うえ}の", 何月: "なんがつ", 何日: "なんにち", 何時: "なんじ", 何時間: "なんじかん", 何分: "なんぷん", 何円: "なんえん", 何人: "なんにん", 何個: "なんこ", 何本: "なんぼん", 何枚: "なんまい", 何回: "なんかい", 何杯: "なんばい", 何曜日: "なんようび", 何袋: "なんふくろ", 何箱: "なんはこ",
    何: "なん", 一年間: "{一年間|いちねんかん}", 年間: "ねんかん", 年: "ねん", 月: "がつ", 毎月: "まいつき", 毎日: "まいにち", 毎週: "まいしゅう", 週: "しゅう", 曜日: "ようび",
    日曜日: "にちようび", 月曜日: "げつようび", 火曜日: "かようび", 水曜日: "すいようび", 木曜日: "もくようび", 金曜日: "きんようび", 土曜日: "どようび",
    重かった: "{重|おも}かった", 軽かった: "{軽|かる}かった", 減った: "{減|へ}った", 増えた: "{増|ふ}えた", 減りました: "{減|へ}りました", 増えました: "{増|ふ}えました", 伸びました: "{伸|の}びました",
    間: "あいだ", 胸囲: "きょうい", 洋服: "ようふく", 男性: "だんせい", 女性: "じょせい", 選ぶ: "{選|えら}ぶ", 選びます: "{選|えら}びます", 選べば: "{選|えら}べば", 大きい: "{大|おお}きい", 小さい: "{小|ちい}さい", 大きいほう: "{大|おお}きいほう",
    合う: "{合|あ}う", 合わせる: "{合|あ}わせる", 単位: "たんい", 立ち幅跳び: "{立|た}ち{幅跳|はばと}び", 幅: "はば", 跳んだ: "{跳|と}んだ", 班: "はん", 遠く: "{遠|とお}く", 遠い: "{遠|とお}い", 近い: "{近|ちか}い",
    差: "さ", 合計: "ごうけい", 平均: "へいきん", 走: "そう", 細かい: "{細|こま}かい", 切り上げ: "{切|き}り{上|あ}げ", 切り上げます: "{切|き}り{上|あ}げます", 表示: "ひょうじ", 秒: "びょう", 表しましょう: "{表|あらわ}しましょう", 表す: "{表|あらわ}す",
    // 天気・季節
    天気予報: "てんきよほう", 天気: "てんき", 晴れ: "{晴|は}れ", 雨: "あめ", 時々: "ときどき", 気温: "きおん", 最高気温: "さいこうきおん", 最低気温: "さいていきおん", 最高: "さいこう", 最低: "さいてい",
    降水確率: "こうすいかくりつ", 以上: "いじょう", 以下: "いか", 今日: "きょう", 明日: "あした", 昨日: "きのう", 今週: "こんしゅう", 調べました: "{調|しら}べました", 調べて: "{調|しら}べて", 調べた: "{調|しら}べた",
    低い: "{低|ひく}い", 高い: "{高|たか}い", 低かった: "{低|ひく}かった", 高かった: "{高|たか}かった", 上がった: "{上|あ}がった", 大きく: "{大|おお}きく", 季節: "きせつ", 校庭: "こうてい", 測った: "{測|はか}った", 測りました: "{測|はか}りました", 時刻: "じこく",
    // 買い物
    買い物: "{買|か}い{物|もの}", 買います: "{買|か}います", 買いました: "{買|か}いました", 買う: "{買|か}う", 買って: "{買|か}って", 買える: "{買|か}える", 買えます: "{買|か}えます", 買えるのは: "{買|か}えるのは", 買った: "{買|か}った",
    支払い: "{支払|しはら}い", 支払う: "{支払|しはら}う", 支払います: "{支払|しはら}います", 払う: "{払|はら}う", 払いました: "{払|はら}いました", 払います: "{払|はら}います", 払えます: "{払|はら}えます", 払え: "{払|はら}え", 払って: "{払|はら}って", 払えない: "{払|はら}えない",
    金額: "きんがく", 金: "かね", 代金: "だいきん", 消費税: "しょうひぜい", 税込: "ぜいこみ", 税込み: "{税込|ぜいこ}み", 税抜: "ぜいぬき", 税抜き: "{税抜|ぜいぬ}き", 本体: "ほんたい", 小計: "しょうけい", 対象: "たいしょう", 軽減税率: "けいげんぜいりつ", 品目: "ひんもく",
    合計金額: "ごうけいきんがく", 預り: "あずかり", 釣り: "{釣|つ}り", 領収書: "りょうしゅうしょ", 出しました: "{出|だ}しました", 出した: "{出|だ}した", 現金: "げんきん", 財布: "さいふ", 入って: "{入|はい}って", 入っています: "{入|はい}っています", 入れて: "{入|い}れて", 入れる: "{入|い}れる", 入ります: "{入|はい}ります", 入る: "{入|はい}る",
    分割払い: "{分割払|ぶんかつばら}い", 手数料: "てすうりょう", 一括: "いっかつ", 商品: "しょうひん", 弁当: "べんとう", 本屋: "ほんや", 雑誌: "ざっし", 店: "みせ", 店員: "てんいん", 使えません: "{使|つか}えません", 使えない: "{使|つか}えない", 使えます: "{使|つか}えます", 使う: "{使|つか}う", 使って: "{使|つか}って", 使った: "{使|つか}った", 使い: "{使|つか}い",
    決済: "けっさい", 両方: "りょうほう", 足りません: "{足|た}りません", 足りない: "{足|た}りない", 足りる: "{足|た}りる", 円: "えん", 回払い: "{回払|かいばら}い", 回: "かい", 全部: "ぜんぶ", 残り: "{残|のこ}り", 残った: "{残|のこ}った", 残金: "ざんきん",
    // 料理
    調理: "ちょうり", 料理: "りょうり", 材料: "ざいりょう", 人分: "にんぶん", 必要: "ひつよう", 分量: "ぶんりょう", 作ります: "{作|つく}ります", 作る: "{作|つく}る", 作り: "{作|つく}り", 作れ: "{作|つく}れ", 作った: "{作|つく}った", 家族: "かぞく", 当番: "とうばん", 実習: "じっしゅう",
    割引: "わりびき", 半額: "はんがく", 値段: "ねだん", 売って: "{売|う}って", 売られて: "{売|う}られて", 鶏: "とり", 豚: "ぶた", 牛: "ぎゅう", 肉: "にく", 玉: "たま", 大根: "だいこん", 長: "なが", 卵: "たまご", 牛乳: "ぎゅうにゅう", 小麦粉: "こむぎこ", 砂糖: "さとう", 油: "あぶら", 水: "みず", 米: "こめ",
    大さじ: "{大|おお}さじ", 小さじ: "{小|こ}さじ", 杯: "はい", 個: "こ", 本: "ほん", 枚: "まい", 食品: "しょくひん", 表示ラベル: "{表示|ひょうじ}ラベル", 貼られて: "{貼|は}られて", 国産: "こくさん", 消費期限: "しょうひきげん", 保存: "ほぞん", 正味量: "しょうみりょう", 当り: "あたり", 加工者: "かこうしゃ", 生鮮: "せいせん",
    食べる: "{食|た}べる", 食べた: "{食|た}べた", 食べました: "{食|た}べました", 食べ: "{食|た}べ", 何g: "{何|なん}g", 何kcal: "{何|なん}kcal", 何mL: "{何|なん}mL", "何℃": "{何|なん}℃", 書いてあります: "{書|か}いてあります", 書いてありました: "{書|か}いてありました",
    // 予定
    予定: "よてい", 手帳: "てちょう", 週間後: "しゅうかんご", 仕事: "しごと", 休み: "{休|やす}み", 行きます: "{行|い}きます", 行く: "{行|い}く", 行きました: "{行|い}きました", 祝日: "しゅくじつ", 考えない: "{考|かんが}えない", 貯金箱: "ちょきんばこ", 貯金: "ちょきん", 始めます: "{始|はじ}めます", 始めました: "{始|はじ}めました", 始め: "{始|はじ}め",
    最後: "さいご", 風邪: "かぜ", 病院: "びょういん", 薬: "くすり", 錠: "じょう", 夜: "よる", 朝: "あさ", 昼: "ひる", 飲み始めます: "{飲|の}み{始|はじ}めます", 飲み始め: "{飲|の}み{始|はじ}め", 飲み終わる: "{飲|の}み{終|お}わる", 飲みます: "{飲|の}みます", 誕生日: "たんじょうび", 第: "だい",
    // 時間・おでかけ
    遊び: "{遊|あそ}び", 目的地: "もくてきち", 出発: "しゅっぱつ", 到着: "とうちゃく", 到着地: "とうちゃくち", 出発地: "しゅっぱつち", 着きます: "{着|つ}きます", 着く: "{着|つ}く", 着いた: "{着|つ}いた", 着きたい: "{着|つ}きたい", 家: "いえ", 駅: "えき", 駅前: "えきまえ", 徒歩: "とほ", 電車: "でんしゃ", 自転車: "じてんしゃ",
    時計: "とけい", 左: "ひだり", 右: "みぎ", 時間: "じかん", 計算: "けいさん", 早く: "{早|はや}く", 遅く: "{遅|おそ}く", 部活動: "ぶかつどう", 朝練習: "あされんしゅう", 練習: "れんしゅう", 出ました: "{出|で}ました", 出る: "{出|で}る", 出て: "{出|で}て", 後: "ご", 前: "まえ",
    友達: "ともだち", 待ち合わせ: "{待|ま}ち{合|あ}わせ", 待ち合わせる: "{待|ま}ち{合|あ}わせる", 映画: "えいが", 映画館: "えいがかん", 開始: "かいし", 準備: "じゅんび", 乗る: "{乗|の}る", 乗ります: "{乗|の}ります", 乗って: "{乗|の}って", 乗りました: "{乗|の}りました", 乗った: "{乗|の}った", 時刻表: "じこくひょう", 小遣い: "{小遣|こづか}い",
    整理券: "せいりけん", 運賃: "うんちん", 運賃表: "うんちんひょう", 行き: "{行|い}き", 帰り: "{帰|かえ}り", 帰ります: "{帰|かえ}ります", 帰る: "{帰|かえ}る", 同じ: "{同|おな}じ", 映画代: "えいがだい", 昼食代: "ちゅうしょくだい", 終わりました: "{終|お}わりました", 終わる: "{終|お}わる", 終わった: "{終|お}わった", 歩いて: "{歩|ある}いて", 歩きます: "{歩|ある}きます",
    // ショッピングセンター・レストラン
    日: "にち", 時: "じ", 分: "ふん", 分間: "ふんかん", 書きましょう: "{書|か}きましょう", 求めましょう: "{求|もと}めましょう", 数: "かず", 当てはまる: "{当|あ}てはまる", 針: "はり", 雑貨: "ざっか", 電器: "でんき", 書店: "しょてん",
    残高: "ざんだか", 千円: "せんえん", 単位で: "{単位|たんい}で", 少なく: "{少|すく}なく", 少ない: "{少|すく}ない", 中: "なか", 外食: "がいしょく", 伝票: "でんぴょう", 品名: "ひんめい", 数量: "すうりょう", 割り勘: "{割|わ}り{勘|かん}", 人数: "にんずう", 一人: "{一人|ひとり}", 一人ひとり: "{一人|ひとり}ひとり", 自分: "じぶん",
    中華丼: "ちゅうかどん", 親子丼: "おやこどん", 定食: "ていしょく", 焼き: "{焼|や}き", 焼き魚: "{焼|や}き{魚|ざかな}", 魚: "さかな", 野菜: "やさい", 炒め: "{炒|いた}め", 野菜炒め: "{野菜炒|やさいいた}め", 豚汁: "とんじる", 汁: "しる", 茶: "ちゃ", 緑茶: "りょくちゃ", 乾電池: "かんでんち", 電池: "でんち",
    // カタログ・収納
    広告: "こうこく", 家具: "かぐ", 本棚: "ほんだな", 棚: "たな", 机: "つくえ", 奥行き: "{奥行|おくゆ}き", 高さ: "{高|たか}さ", 長さ: "{長|なが}さ", 価格: "かかく", 送料無料: "そうりょうむりょう", 送料: "そうりょう", 届け: "{届|とど}け", 届きます: "{届|とど}きます", 注文: "ちゅうもん", 置けます: "{置|お}けます", 置けません: "{置|お}けません", 置く: "{置|お}く", 置き: "{置|お}き",
    部屋: "へや", 壁: "かべ", 理由: "りゆう", 箱: "はこ", 収納: "しゅうのう", 整理: "せいり", 並べ: "{並|なら}べ", 並べます: "{並|なら}べます", 並べられ: "{並|なら}べられ", 内側: "うちがわ", 横: "よこ", 縦: "たて", 列: "れつ", 余り: "{余|あま}り", 余ります: "{余|あま}ります", 段: "だん",
    // お金の使い方
    生活費: "せいかつひ", 等分: "とうぶん", 日間: "にちかん", 一日: "いちにち", 欲しい: "{欲|ほ}しい", 物: "もの", 項目: "こうもく", 食費: "しょくひ", 被服費: "ひふくひ", 交通費: "こうつうひ", 娯楽費: "ごらくひ", 通信費: "つうしんひ", 支出: "ししゅつ", 収入: "しゅうにゅう", 家計簿: "かけいぼ", 日付: "ひづけ", 携帯電話代: "けいたいでんわだい",
    電車代: "でんしゃだい", 遊園地: "ゆうえんち", 帽子: "ぼうし", 本代: "ほんだい", 多く: "{多|おお}く", 多い: "{多|おお}い", 使い道: "{使|つか}い{道|みち}",
    // 荷物・住居
    荷物: "にもつ", 送ろう: "{送|おく}ろう", 送る: "{送|おく}る", 送ります: "{送|おく}ります", 宅配便: "たくはいびん", 料金: "りょうきん", 料金表: "りょうきんひょう", 都道府県: "とどうふけん", 配送: "はいそう", 取扱い: "{取扱|とりあつか}い", 窓口: "まどぐち", 持ち込み: "{持|も}ち{込|こ}み", 持ち込む: "{持|も}ち{込|こ}む", 持ち込んで: "{持|も}ち{込|こ}んで", 会社: "かいしゃ", 段ボール: "{段|だん}ボール", 以内: "いない",
    住居: "じゅうきょ", 家賃: "やちん", 初期費用: "しょきひよう", 敷金: "しききん", 礼金: "れいきん", 仲介手数料: "ちゅうかいてすうりょう", 前家賃: "まえやちん", 火災保険料: "かさいほけんりょう", 鍵交換代: "かぎこうかんだい", 入居: "にゅうきょ", 借ります: "{借|か}ります", 借りる: "{借|か}りる", か月分: "か{月分|げつぶん}", 決まり: "{決|き}まり",
    電気: "でんき", 契約: "けいやく", 同時: "どうじ", 電子レンジ: "{電子|でんし}レンジ", 冷蔵庫: "れいぞうこ", 炊飯器: "すいはんき", 掃除機: "そうじき", 洗濯機: "せんたくき", 暖房: "だんぼう", 冷房: "れいぼう", 電気ケトル: "{電気|でんき}ケトル", 目安: "めやす", 落ちず: "{落|お}ちず", 落ちる: "{落|お}ちる",
    // 仕事
    現場実習: "げんばじっしゅう", 実習先: "じっしゅうさき", 通勤: "つうきん", 手段: "しゅだん", 片道: "かたみち", 往復: "おうふく", 始まります: "{始|はじ}まります", 作業: "さぎょう", 速度: "そくど", 作業所: "さぎょうしょ", 袋: "ふくろ", 袋づめ: "{袋|ふくろ}づめ", 給料: "きゅうりょう", 休憩: "きゅうけい", 休憩時間: "きゅうけいじかん", 歯みがき: "{歯|は}みがき",
    忙しく: "{忙|いそが}しく", 働く: "{働|はたら}く", 働き: "{働|はたら}き", 働いて: "{働|はたら}いて", 働きます: "{働|はたら}きます", 働くと: "{働|はたら}くと", 勤務時間: "きんむじかん", 勤務: "きんむ", 途中: "とちゅう", 工場: "こうじょう", 先輩: "せんぱい", 倍: "ばい", 速さ: "{速|はや}さ", 手伝い: "{手伝|てつだ}い", 出社: "しゅっしゃ", 退社: "たいしゃ", 制度: "せいど",
    求人票: "きゅうじんひょう", 就業時間: "しゅうぎょうじかん", 基本給: "きほんきゅう", 年間休日: "ねんかんきゅうじつ", 休日数: "きゅうじつすう", 出勤: "しゅっきん", 月額: "げつがく", 年次有給休暇: "ねんじゆうきゅうきゅうか", 年休: "ねんきゅう", 有給: "ゆうきゅう", 取りました: "{取|と}りました", 取れます: "{取|と}れます", 取る: "{取|と}る", 時点: "じてん", 累計: "るいけい", 残日数: "ざんにっすう",
    給与明細: "きゅうよめいさい", 給与明細書: "きゅうよめいさいしょ", 給与: "きゅうよ", 支給: "しきゅう", 総支給額: "そうしきゅうがく", 控除: "こうじょ", 総控除額: "そうこうじょがく", 差引支給額: "さしひきしきゅうがく", 実際: "じっさい", 受け取れる: "{受|う}け{取|と}れる", 受け取った: "{受|う}け{取|と}った", 手当: "てあて",
    時間外手当: "じかんがいてあて", 通勤手当: "つうきんてあて", 住居手当: "じゅうきょてあて", 残業: "ざんぎょう", 健康保険: "けんこうほけん", 厚生年金: "こうせいねんきん", 雇用保険: "こようほけん", 所得税: "しょとくぜい", 住民税: "じゅうみんぜい", 社会保険料: "しゃかいほけんりょう", 欠勤: "けっきん", 勤怠: "きんたい",
    // そのほか
    次: "つぎ", 答え: "{答|こた}え", 式: "しき", 図: "ず", 名前: "なまえ", 人: "にん", 見て: "{見|み}て", 見ながら: "{見|み}ながら", 書いて: "{書|か}いて", 書く: "{書|か}く", 考えて: "{考|かんが}えて", 確かめ: "{確|たし}かめ", 場合: "ばあい", 方: "かた", 全員: "ぜんいん", 中から: "{中|なか}から", 一番: "いちばん",
    今: "いま", 場所: "ばしょ", 決め: "{決|き}め", 来て: "{来|き}て", 来ます: "{来|き}ます", 気持ち: "{気持|きも}ち", 計: "けい", 位: "くらい", 小数第: "{小数|しょうすう}{第|だい}", 四捨五入: "ししゃごにゅう", 概数: "がいすう", 約: "やく", 位までの: "{位|くらい}までの", 百の位: "{百|ひゃく}の{位|くらい}",
    連絡: "れんらく", 遅れ: "{遅|おく}れ", 送る: "{送|おく}る", 父: "ちち", 母: "はは", 兄: "あに", 姉: "あね", 弟: "おとうと", 妹: "いもうと", 家の人: "{家|いえ}の{人|ひと}", 一週間: "{一週間|いっしゅうかん}", 週間: "しゅうかん", 合わせると: "{合|あ}わせると", 合わせて: "{合|あ}わせて", 同時に: "{同時|どうじ}に", 使用: "しよう"
  };

  Object.assign(DICT, {
    十の位: "{十|じゅう}の{位|くらい}", 起きます: "{起|お}きます", 伸び: "{伸|の}び", 下: "した", 用: "よう", 対象額: "たいしょうがく", 入れた: "{入|い}れた", 洗剤: "せんざい", 歯: "は", 切り捨て: "{切|き}り{捨|す}て",
    地図: "ちず", 手袋: "てぶくろ", 幕の内: "{幕|まく}の{内|うち}", 使えず: "{使|つか}えず", 支払えません: "{支払|しはら}えません", 粉: "こ", 半玉: "はんたま", 株: "かぶ", 揚げ: "{揚|あ}げ", 求めます: "{求|もと}めます", 求めて: "{求|もと}めて",
    水族館: "すいぞくかん", 乗りかえ: "{乗|の}りかえ", 図書館: "としょかん", 中央: "ちゅうおう", 公園: "こうえん", 博物館: "はくぶつかん", 動物園: "どうぶつえん", 停: "てい", 待つ: "{待|ま}つ", 出た: "{出|で}た", 学校: "がっこう", 見に: "{見|み}に",
    始まる: "{始|はじ}まる", 土曜: "どよう", 区間: "くかん", 文房具: "ぶんぼうぐ", 払い: "{払|はら}い", 飲んだ: "{飲|の}んだ", 台: "だい", 木: "き", 衣装: "いしょう", 残る: "{残|のこ}る", 全体: "ぜんたい", 順: "じゅん", 思います: "{思|おも}います",
    足りなく: "{足|た}りなく", 服: "ふく", 電話: "でんわ", 帳: "ちょう", 代: "だい", 量: "りょう", 機器: "きき", 借りて: "{借|か}りて", 費用: "ひよう", 決まった: "{決|き}まった", 検索: "けんさく", 先: "さき", 部品: "ぶひん", 組み立て: "{組|く}み{立|た}て",
    封筒: "ふうとう", 宛名: "あてな", 貼り: "{貼|は}り", 工賃: "こうちん", 作: "つく", 物流: "ぶつりゅう", 屋: "や", 仕上げ: "{仕上|しあ}げ", 入社: "にゅうしゃ", 考えません: "{考|かんが}えません", 製作所: "せいさくしょ", 働いた: "{働|はたら}いた", 年目: "ねんめ",
    取り: "{取|と}り", 取った: "{取|と}った", 引いて: "{引|ひ}いて", 欄: "らん", 表します: "{表|あらわ}します", 合計: "ごうけい", 入れ: "{入|い}れ", 見る: "{見|み}る", 読む: "{読|よ}む", 買え: "{買|か}え", 切れ: "{切|ぎ}れ", 出れば: "{出|で}れば", 書かれた: "{書|か}かれた", 使える: "{使|つか}える", 飲み: "{飲|の}み", 残って: "{残|のこ}って", 名: "めい", 足して: "{足|た}して", 買お: "{買|か}お", 下がった: "{下|さ}がった", 日数: "にっすう", 出勤日数: "しゅっきんにっすう", 欠勤日数: "けっきんにっすう", 有給日数: "ゆうきゅうにっすう"
  });
  const PRE = [[/(?<![\d０-９])1人分/g, "{1人分|ひとりぶん}"], [/(?<![\d０-９])2人分/g, "{2人分|ふたりぶん}"], [/(?<![\d０-９{])1人(?!分)/g, "{1人|ひとり}"], [/(?<![\d０-９{])2人(?!分)/g, "{2人|ふたり}"], [/か月分/g, "か{月分|げつぶん}"], [/か月/g, "か{月|げつ}"], [/(ある|この|その)月/g, "$1{月|つき}"], [/最後の日/g, "{最後|さいご}の{日|ひ}"], [/大きく伸/g, "{大|おお}きく{伸|の}"]];
  const MAXK = 8;
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
        if (DICT[w] !== void 0) {
          hit = w;
          break;
        }
      }
      if (!hit) {
        out += s[i++];
        continue;
      }
      const v = DICT[hit];
      out += v.includes("{") ? v : `{${hit}|${v}}`;
      i += hit.length;
    }
    return out;
  }
  // すでに {漢字|かな} や [[...]] になっているところはそのまま
  const K = (s) => PRE.reduce((x, [re, to]) => x.replace(re, to), String(s)).split(/(\{[^{}|]+\|[^{}|]*\}|\[\[[^\]]*\]\])/).map((seg, i) => i % 2 ? seg : conv(seg)).join("");
  const plain = (s) => String(s ?? "").replace(/\{([^{}|]+)\|[^{}]*\}/g, "$1").replace(/\[\[br\]\]/g, "");

  // ===== 数による読みのちがい =====
  const fun = (n) => `{分|${[2, 5, 7, 9].includes(n % 10) ? "ふん" : "ぷん"}}`;
  const DAY_RD = { 1: "ついたち", 2: "ふつか", 3: "みっか", 4: "よっか", 5: "いつか", 6: "むいか", 7: "なのか", 8: "ようか", 9: "ここのか", 10: "とおか", 14: "じゅうよっか", 20: "はつか", 24: "にじゅうよっか" };
  const DUR_RD = { 1: "いちにち", 2: "ふつか", 3: "みっか", 4: "よっか", 5: "いつか", 6: "むいか", 7: "なのか", 8: "ようか", 9: "ここのか", 10: "とおか", 14: "じゅうよっか", 20: "はつか" };
  const dayOf = (d) => DAY_RD[d] ? `{${d}日|${DAY_RD[d]}}` : `${d}{日|にち}`;
  const days = (n) => DUR_RD[n] ? `{${n}日|${DUR_RD[n]}}` : `${n}{日|にち}`;
  const md = (m, d) => `${m}{月|がつ}${dayOf(d)}`;
  const nin = (n) => n === 1 ? "{1人|ひとり}" : n === 2 ? "{2人|ふたり}" : `${n}{人|にん}`;
  const hon = (n) => `{本|${[1, 6, 8, 0].includes(n % 10) ? "ぽん" : n % 10 === 3 ? "ぼん" : "ほん"}}`;
  const hai = (n) => `{杯|${[1, 6, 8, 0].includes(n % 10) ? "ぱい" : n % 10 === 3 ? "ばい" : "はい"}}`;
  const ko = (n) => `${n}{個|こ}`;
  // 時刻(1日の何分め)。ampm で「午前・午後」をつける
  const tm = (t, ampm = false) => {
    t = ((t % 1440) + 1440) % 1440;
    let h = Math.floor(t / 60);
    const m = t % 60;
    let pre = "";
    if (ampm) {
      pre = h < 12 ? "{午前|ごぜん}" : "{午後|ごご}";
      h = h % 12;
    }
    return `${pre}${h}{時|じ}${m ? `${m}${fun(m)}` : ""}`;
  };
  const tmBox = (t) => `${Math.floor((((t % 1440) + 1440) % 1440) / 60)}{時|じ}${t % 60}${fun(t % 60 || 10)}`;
  // 時間の長さ(分)
  const dur = (min) => {
    const h = Math.floor(min / 60), m = min % 60;
    return `${h ? `${h}{時間|じかん}` : ""}${m || !h ? `${m}${fun(m || 10)}` : ""}`;
  };
  const clock = (t) => `${String(Math.floor(t / 60)).padStart(1, "0")}:${String(t % 60).padStart(2, "0")}`;
  const WD = ["日", "月", "火", "水", "木", "金", "土"];
  const WDR = ["{日曜日|にちようび}", "{月曜日|げつようび}", "{火曜日|かようび}", "{水曜日|すいようび}", "{木曜日|もくようび}", "{金曜日|きんようび}", "{土曜日|どようび}"];
  const WD1 = ["{日|にち}", "{月|げつ}", "{火|か}", "{水|すい}", "{木|もく}", "{金|きん}", "{土|ど}"];
  const NAMES = ["ゆうき", "さくら", "はると", "あおい", "そうた", "みお", "たくみ", "ひなた", "けんた", "ゆい", "りく", "めい", "かいと", "ことね"];
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const comma = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // ===== 問題のかたち =====
  const LINES = ["{式|しき}", "{答|こた}え"];
  const SA = (shiki, ans) => `{式|しき} ${shiki}　{答|こた}え ${ans}`;
  // 答えの四角(はばは mm)。四角を文に書いたときは noBox にする
  const BX = (w = 16) => `[[abox:${w}]]`;
  const lv = (b, n, c) => ({ basic: b, normal: n, challenge: c });
  // o: key, text, ans(答え), figure, lines(true なら 式・答え の線), labels(線のことば), meta, noBox, softKey
  function P(o) {
    const pr = {
      key: o.key,
      text: K(o.text),
      answer: { display: K(o.ans) },
      workspace: o.lines || o.labels ? { type: "lines", labels: (o.labels || LINES).map(K), ...(o.labels || []).some((l) => [...plain(l)].length > 2) ? { wideLabel: true } : {} } : { type: "none" },
      meta: o.meta || {}
    };
    if (o.figure) pr.figure = o.figure;
    if (o.noBox) pr.noAnswerBox = true;
    if (o.softKey) pr.softKey = o.softKey;
    if (o.value !== void 0) pr.answer.value = o.value;
    return pr;
  }
  // 答えの文に、その値が入っているか(検査用)
  const hasAns = (pr, ...vals) => {
    const d = plain(pr.answer.display);
    for (const v of vals) if (!d.includes(String(v))) return `答えに ${v} がない(${d})`;
    return null;
  };

  // ===== 図の部品(単位は mm) =====
  const T = (x, y, s, size = 4, o = {}) => ({ t: "text", x, y, s: K(String(s)), size, halo: false, ...o });
  const rect = (x, y, w, h, o = {}) => ({ t: "poly", pts: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], w: o.w ?? 0.4, fill: o.fill || "none", ...o.dash ? { dash: o.dash } : {} });
  const abox = (x, y, w, h) => ({ t: "poly", pts: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], w: 0.6, fill: "white", lead: true });
  const line = (x1, y1, x2, y2, w = 0.35, o = {}) => ({ t: "line", x1, y1, x2, y2, w, ...o });
  // 角の丸い四角(わく)
  const round = (x, y, w, h, r = 3, o = {}) => ({ t: "path", d: `M${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x + r}Q${x},${y + h} ${x},${y + h - r}V${y + r}Q${x},${y} ${x + r},${y}Z`, w: o.w ?? 0.5, fill: o.fill || "none" });
  // 表(セルは 文字 か {s, ans, fill, bold, anchor, size})。head の行は灰色
  function table(x0, y0, colW, rowH, cells, o = {}) {
    const items = [], lines2 = [];
    const W = sum(colW), size = o.size || 4;
    let y = y0;
    cells.forEach((row, r) => {
      const h = Array.isArray(rowH) ? rowH[r] : rowH;
      let x = x0;
      row.forEach((cell, c) => {
        const w = colW[c];
        const sp = cell && typeof cell === "object" ? cell : { s: cell };
        const head = r < (o.head ?? 1) || c < (o.headCol ?? 0);
        if (sp.fill || head) items.push(rect(x, y, w, h, { w: 0, fill: sp.fill || "#e3e3e3" }));
        if (sp.ans) items.push(abox(x + 1.2, y + 1.1, w - 2.4, h - 2.2));
        else if (sp.s != null && sp.s !== "") {
          const an = sp.anchor || "middle", fs = sp.size || size;
          const tx = an === "start" ? x + 1.6 : an === "end" ? x + w - 1.6 : x + w / 2;
          const ls = String(sp.s).split("\n");
          ls.forEach((ln, i) => items.push(T(tx, y + h / 2 + fs * 0.36 + (i - (ls.length - 1) / 2) * fs * 1.15, ln, fs, { anchor: an, ...sp.bold ? { bold: true } : {} })));
        }
        x += w;
      });
      y += h;
    });
    const H = y - y0;
    let x = x0;
    colW.slice(0, -1).forEach((w) => {
      x += w;
      lines2.push(line(x, y0, x, y0 + H, 0.3));
    });
    let yy = y0;
    cells.slice(0, -1).forEach((_, r) => {
      yy += Array.isArray(rowH) ? rowH[r] : rowH;
      lines2.push(line(x0, yy, x0 + W, yy, 0.3));
    });
    return { items: [...items, ...lines2, rect(x0, y0, W, H, { w: 0.6 })], w: W, h: H };
  }
  const draw = (w, h, items) => ({ type: "draw", w, h, items });
  const htable = (head, rows) => ({ type: "table", head: head.map(K), rows: rows.map((r) => r.map((c) => K(String(c)))) });

  // ===== お金の絵(本物と同じ形の絵があれば使う) =====
  const COIN_R = { 1: 10, 5: 11, 10: 11.75, 50: 10.5, 100: 11.3, 500: 13.25 };
  const BILL = { 1000: [50, 25.4], 5000: [52, 25.5], 10000: [53.3, 25.5] };
  const hasImg = (v) => typeof MONEY_IMG !== "undefined" && MONEY_IMG[v] && !/^\{\{/.test(MONEY_IMG[v]);
  function money(v, cx, cy, k = 1) {
    if (v >= 1000) {
      const [w0, h0] = BILL[v], w = w0 * k, h = h0 * k, x = cx - w / 2, y = cy - h / 2;
      if (hasImg(v)) return [{ t: "image", href: MONEY_IMG[v], x, y, w, h }, { ...rect(x, y, w, h, { w: 0 }), money: v }];
      return [{ ...rect(x, y, w, h, { w: 0.5, fill: "#eef3ea" }), money: v }, T(cx, cy + 2, `${v}円`, 6 * k, { bold: true })];
    }
    const r = COIN_R[v] * k;
    if (hasImg(v)) return [{ t: "image", href: MONEY_IMG[v], x: cx - r, y: cy - r, w: r * 2, h: r * 2 }, { t: "circle", cx, cy, r, w: 0, fill: "none", money: v }];
    return [{ t: "circle", cx, cy, r, w: 0.5, fill: "#e8e8e8", money: v }, T(cx, cy + r * 0.3, v, r * 0.8, { bold: true })];
  }
  const moneySize = (v, k) => v >= 1000 ? [BILL[v][0] * k, BILL[v][1] * k] : [COIN_R[v] * 2 * k, COIN_R[v] * 2 * k];
  // 財布(お金をしゅるいごとにならべる)
  function wallet(list, x0, y0, wMax, k = 0.72) {
    const items = [];
    let x = x0 + 4, y = y0 + 4, rowH = 0, right = x0;
    list.forEach((v, i) => {
      const [w, h] = moneySize(v, k);
      if (x + w > x0 + wMax - 4) {
        x = x0 + 4;
        y += rowH + 2;
        rowH = 0;
      }
      if (i > 0 && list[i - 1] !== v && x > x0 + 4) x += 2;
      items.push(...money(v, x + w / 2, y + h / 2, k));
      x += w + 1.5;
      right = Math.max(right, x);
      rowH = Math.max(rowH, h);
    });
    const H = y + rowH + 4 - y0, W = Math.min(wMax, right - x0 + 3);
    return { items: [round(x0, y0, W, H, 4, { w: 0.7, fill: "#f6f6f6" }), ...items], w: W, h: H };
  }

  return { BX, K, plain, fun, dayOf, days, md, nin, hon, hai, ko, tm, tmBox, dur, clock, WD, WDR, WD1, NAMES, sum, comma, LINES, SA, lv, P, hasAns, T, rect, abox, line, round, table, draw, htable, money, wallet };
})();

// ===== Ⅰ 自分の身の回りのこと =====
(() => {
  const { K, fun, dur, tm, NAMES, sum, SA, lv, P, hasAns, T, round, table, draw, htable } = kurashiLib;

  // ----- 1日の摂取カロリー -----
  const FOODS = {
    朝食: [["トーストと{目玉焼|めだまや}き", 380, 470], ["ごはんとみそ{汁|しる}", 330, 440], ["シリアルと{牛乳|ぎゅうにゅう}", 290, 380], ["おにぎり2こ", 340, 410], ["パンとサラダ", 300, 390]],
    昼食: [["カレーライス", 600, 780], ["ラーメン", 480, 620], ["ハンバーグ{定食|ていしょく}", 700, 860], ["{親子丼|おやこどん}", 610, 720], ["{焼|や}きそば", 520, 650], ["きつねうどん", 420, 520]],
    夕食: [["{焼|や}き{魚|ざかな}{定食|ていしょく}", 540, 680], ["からあげ{定食|ていしょく}", 780, 920], ["スパゲッティ", 570, 700], ["{肉|にく}じゃがとごはん", 600, 730], ["ぎょうざとごはん", 620, 770], ["{野菜炒|やさいいた}めとごはん", 560, 690]],
    間食: [["プリン", 120, 180], ["ポテトチップス", 300, 340], ["バナナ", 80, 95], ["アイスクリーム", 150, 260], ["クッキー", 130, 190]]
  };
  const MEAL_R = { 朝食: "{朝食|ちょうしょく}", 昼食: "{昼食|ちゅうしょく}", 夕食: "{夕食|ゆうしょく}", 間食: "おやつ" };
  const kCalorie = {
    id: "t.kCalorie",
    instruction: null,
    defaults: { snack: false, round: false, step: 10 },
    levels: lv({ snack: false, round: false, step: 10 }, { snack: true, round: false, step: 1 }, { snack: true, round: true, step: 1 }),
    generate(rng, p) {
      const meals = p.snack ? ["朝食", "昼食", "間食", "夕食"] : ["朝食", "昼食", "夕食"];
      const list = meals.map((m) => {
        const [name, lo, hi] = rng.pick(FOODS[m]);
        return { m, name, k: rng.int(Math.ceil(lo / p.step), Math.floor(hi / p.step)) * p.step };
      });
      const n = list.length, CW = (172 - (n - 1) * 3) / n, items = [];
      list.forEach((f, i) => {
        const x = i * (CW + 3);
        items.push(round(x + 0.5, 0.5, CW - 1, 25, 3, { w: 0.5 }), round(x + CW / 2 - 9, 2.5, 18, 6, 2, { w: 0, fill: "#e3e3e3" }), T(x + CW / 2, 7, MEAL_R[f.m], 3.6));
        items.push(T(x + CW / 2, 15, f.name, f.name.replace(/\{([^|]*)\|[^}]*\}/g, "$1").length > 8 ? 3.3 : 3.8), T(x + CW / 2, 22.5, `${f.k}kcal`, 4.6, { bold: true }));
      });
      const ks = list.map((f) => f.k), total = sum(ks);
      if (p.round) {
        const r = ks.map((k) => Math.round(k / 100) * 100), tr = sum(r);
        return P({
          key: `kc:r:${ks.join(",")}`,
          text: "ある日に食べたものと、そのカロリーです。それぞれのカロリーを、十の位で四捨五入して百の位までの概数にしてから、1日の摂取カロリーがおよそ何kcalかを求めましょう。",
          figure: draw(172, 26, items),
          lines: true,
          ans: SA(r.join("＋") + "＝" + tr, `{約|やく}${tr}kcal`),
          meta: { ks, round: true, ans: tr }
        });
      }
      return P({
        key: `kc:${ks.join(",")}`,
        text: "ある日に食べたものと、そのカロリーです。1日の摂取カロリーは、合計で何kcalですか。",
        figure: draw(172, 26, items),
        lines: true,
        ans: SA(ks.join("＋") + "＝" + total, `${total}kcal`),
        meta: { ks, round: false, ans: total }
      });
    },
    verify(pr) {
      const { ks, round: r, ans } = pr.meta;
      const want = r ? sum(ks.map((k) => Math.round(k / 100) * 100)) : sum(ks);
      return want !== ans ? "合計が合わない" : hasAns(pr, `${ans}kcal`);
    }
  };

  // ----- 睡眠時間 -----
  const kSleep = {
    id: "t.kSleep",
    instruction: null,
    defaults: { step: 30, two: false },
    levels: lv({ step: 30, two: false }, { step: 5, two: false }, { step: 5, two: true }),
    generate(rng, p) {
      const one = () => {
        const bed = rng.int(Math.ceil(1260 / p.step), Math.floor(1435 / p.step)) * p.step;
        const wake = rng.int(Math.ceil(330 / p.step), Math.floor(480 / p.step)) * p.step;
        return { bed, wake, s: wake + 1440 - bed };
      };
      if (!p.two) {
        const a = one();
        return P({
          key: `ks:${a.bed}:${a.wake}`,
          text: `${tm(a.bed, true)}に寝て、次の日の${tm(a.wake, true)}に起きました。睡眠時間は何時間何分ですか。`,
          ans: dur(a.s),
          meta: { list: [a], ans: a.s }
        });
      }
      for (let t = 0; t < 100; t++) {
        const a = one(), b = one();
        if (b.s <= a.s || b.s - a.s > 180) continue;
        return P({
          key: `ks2:${a.bed}:${a.wake}:${b.bed}:${b.wake}`,
          text: `平日は${tm(a.bed, true)}に寝て、${tm(a.wake, true)}に起きます。休日は${tm(b.bed, true)}に寝て、${tm(b.wake, true)}に起きました。休日の睡眠時間は、平日より何時間何分長いですか。`,
          ans: dur(b.s - a.s),
          meta: { list: [a, b], ans: b.s - a.s }
        });
      }
      throw new Error("睡眠時間の問題が作れない");
    },
    verify(pr) {
      const L = pr.meta.list.map((x) => x.wake + 1440 - x.bed);
      const want = L.length === 1 ? L[0] : L[1] - L[0];
      return want === pr.meta.ans && want > 0 ? null : "睡眠時間が合わない";
    }
  };

  // ----- 身長と体重の記録 -----
  const MONTHS = [4, 6, 9, 12, 3];
  const f1 = (n) => (n / 10).toFixed(1);
  const kGrowth = {
    id: "t.kGrowth",
    instruction: null,
    defaults: { asks: ["grow", "heavy", "down"] },
    levels: lv({ asks: ["grow", "heavy"] }, { asks: ["grow", "heavy", "down"] }, { asks: ["grow", "down", "most", "wdiff"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 300; t++) {
        const hs = [rng.int(1480, 1680)];
        for (let i = 1; i < 5; i++) hs.push(hs[i - 1] + rng.int(2, 18));
        const ws = [rng.int(400, 620)];
        const down = rng.int(1, 4);
        for (let i = 1; i < 5; i++) ws.push(ws[i - 1] + (i === down ? -rng.int(2, 9) : rng.int(2, 14)));
        const ask = Number.isInteger(ctx?.index) ? p.asks[ctx.index % p.asks.length] : rng.pick(p.asks);
        const inc = hs.slice(1).map((h, i) => h - hs[i]);
        if (ask === "heavy" && ws.filter((w) => w === Math.max(...ws)).length !== 1) continue;
        if (ask === "most" && inc.filter((d) => d === Math.max(...inc)).length !== 1) continue;
        const name = rng.pick(NAMES);
        const fig = htable(["", ...MONTHS.map((m) => `${m}月`)], [["身長(cm)", ...hs.map(f1)], ["体重(kg)", ...ws.map(f1)]]);
        const lead = `下の表は、${name}さんの1年間の身長と体重の記録です。`;
        let q, ans, val;
        if (ask === "grow") {
          val = hs[4] - hs[0];
          q = "4月から3月までに、身長は何cm伸びましたか。";
          ans = SA(`${f1(hs[4])}－${f1(hs[0])}＝${f1(val)}`, `${f1(val)}cm`);
        } else if (ask === "heavy") {
          val = MONTHS[ws.indexOf(Math.max(...ws))];
          q = "体重がいちばん重かったのは何月ですか。";
          ans = `${val}{月|がつ}`;
        } else if (ask === "down") {
          val = down;
          q = "体重が減ったのは、何月から何月の間ですか。";
          ans = `${MONTHS[down - 1]}{月|がつ}から${MONTHS[down]}{月|がつ}`;
        } else if (ask === "most") {
          val = inc.indexOf(Math.max(...inc)) + 1;
          q = "身長がいちばん大きく伸びたのは、何月から何月の間ですか。";
          ans = `${MONTHS[val - 1]}{月|がつ}から${MONTHS[val]}{月|がつ}`;
        } else {
          val = ws[4] - ws[0];
          q = "4月と3月の体重の差は何kgですか。";
          ans = SA(`${f1(ws[4])}－${f1(ws[0])}＝${f1(val)}`, `${f1(val)}kg`);
        }
        return P({ key: `kg:${ask}:${hs.join(",")}:${ws.join(",")}`, text: lead + "[[br]]" + q, figure: fig, lines: ask === "grow" || ask === "wdiff", ans, meta: { hs, ws, ask, val }, softKey: ask });
      }
      throw new Error("身体計測の問題が作れない");
    },
    verify(pr) {
      const { hs, ws, ask, val } = pr.meta;
      const inc = hs.slice(1).map((h, i) => h - hs[i]);
      const wd = ws.slice(1).map((w, i) => w - ws[i]);
      if (ask === "grow") return val === hs[4] - hs[0] ? hasAns(pr, `${f1(val)}cm`) : "のびが合わない";
      if (ask === "wdiff") return val === ws[4] - ws[0] ? hasAns(pr, `${f1(val)}kg`) : "差が合わない";
      if (ask === "heavy") return MONTHS[ws.indexOf(Math.max(...ws))] === val ? null : "重い月が合わない";
      if (ask === "down") return wd.filter((d) => d < 0).length === 1 && wd[val - 1] < 0 ? null : "減った月が合わない";
      return inc.indexOf(Math.max(...inc)) + 1 === val ? null : "いちばんのびた月が合わない";
    }
  };

  // ----- サイズ表 -----
  // [サイズ, 胸, ウエスト] の はんい(cm)。答えが1つにきまる はんい(uq)も持つ
  const SIZES = {
    men: { chest: "チェスト", rows: [["S", [80, 88], [68, 76]], ["M", [88, 96], [76, 84]], ["L", [96, 104], [84, 94]], ["LL", [104, 112], [94, 104]], ["3L", [112, 120], [104, 114]]] },
    women: { chest: "バスト", rows: [["S", [72, 80], [58, 64]], ["M", [79, 87], [64, 70]], ["L", [86, 94], [69, 77]], ["LL", [93, 101], [77, 85]], ["3L", [100, 108], [85, 93]]] }
  };
  const inR = (v, r) => v >= r[0] && v <= r[1];
  const sizeOf = (tb, v, col) => tb.rows.filter((r) => inR(v, r[col])).map((r) => r[0]);
  const kSize = {
    id: "t.kSize",
    instruction: null,
    defaults: { sets: ["men"], differ: false },
    levels: lv({ sets: ["men"], differ: false }, { sets: ["men", "women"], differ: false }, { sets: ["men", "women"], differ: true }),
    generate(rng, p) {
      for (let t = 0; t < 500; t++) {
        const set = rng.pick(p.sets), tb = SIZES[set];
        const i = rng.int(0, 4), j = p.differ ? rng.pick([0, 1, 2, 3, 4].filter((x) => x !== i)) : i;
        const c = rng.int(tb.rows[i][1][0], tb.rows[i][1][1]), w = rng.int(tb.rows[j][2][0], tb.rows[j][2][1]);
        const sc = sizeOf(tb, c, 1), sw = sizeOf(tb, w, 2);
        if (sc.length !== 1 || sw.length !== 1) continue;
        const name = rng.pick(NAMES);
        const fig = htable(["サイズ", `${tb.chest}`, "ウエスト"], tb.rows.map((r) => [r[0], `${r[1][0]}〜${r[1][1]}`, `${r[2][0]}〜${r[2][1]}`]));
        const who = set === "men" ? "男性" : "女性";
        const head = `下は${set === "men" ? "メンズ(男性用)" : "レディース(女性用)"}の洋服のサイズ表です(単位はcm)。${who}の${name}さんの${tb.chest}は${c}cm、ウエストは${w}cmです。`;
        if (!p.differ) return P({ key: `kz:${set}:${c}:${w}`, text: head + "[[br]]" + `${name}さんに合うのは何サイズですか。`, figure: fig, ans: `${sc[0]}サイズ`, meta: { set, c, w, differ: false, ans: sc[0] } });
        const big = [sc[0], sw[0]].sort((a, b) => tb.rows.findIndex((r) => r[0] === b) - tb.rows.findIndex((r) => r[0] === a))[0];
        return P({ key: `kz2:${set}:${c}:${w}`, text: head + "[[br]]" + `${tb.chest}とウエストでサイズがちがうときは、大きいほうのサイズを選びます。何サイズを選べばよいですか。`, figure: fig, ans: `${big}サイズ`, meta: { set, c, w, differ: true, ans: big } });
      }
      throw new Error("サイズの問題が作れない");
    },
    verify(pr) {
      const { set, c, w, differ, ans } = pr.meta, tb = SIZES[set];
      const sc = sizeOf(tb, c, 1), sw = sizeOf(tb, w, 2);
      if (sc.length !== 1 || sw.length !== 1) return "サイズが1つに決まらない";
      const idx = (s) => tb.rows.findIndex((r) => r[0] === s);
      if (!differ) return sc[0] === sw[0] && ans === sc[0] ? null : "サイズが合わない";
      return sc[0] !== sw[0] && idx(ans) === Math.max(idx(sc[0]), idx(sw[0])) ? null : "大きいほうのサイズが合わない";
    }
  };

  // ----- 立ち幅跳びの記録 -----
  const mcm = (cm) => `${Math.floor(cm / 100)}m${String(cm % 100).padStart(2, "0")}cm`;
  const kJump = {
    id: "t.kJump",
    instruction: null,
    defaults: { asks: ["far", "diff"] },
    levels: lv({ asks: ["far", "diff"] }, { asks: ["far", "diff", "total"] }, { asks: ["diff", "avg"] }),
    generate(rng, p, ctx) {
      for (let t = 0; t < 300; t++) {
        const names = rng.shuffle(NAMES.slice()).slice(0, 4);
        const rec = names.map(() => rng.int(135, 235));
        if (new Set(rec).size !== 4) continue;
        const ask = Number.isInteger(ctx?.index) ? p.asks[ctx.index % p.asks.length] : rng.pick(p.asks);
        if (ask === "avg" && sum(rec) % 4) continue;
        const fig = htable(["名前", ...names], [["記録", ...rec.map(mcm)]]);
        const lead = "下の表は、ある班の立ち幅跳びの記録です。";
        const mx = Math.max(...rec), mn = Math.min(...rec);
        let q, ans, opt = {};
        if (ask === "far") {
          q = "いちばん遠くまで跳んだのはだれですか。";
          ans = `${names[rec.indexOf(mx)]}さん`;
        } else if (ask === "diff") {
          q = "いちばん遠い記録と、いちばん近い記録の差は何cmですか。";
          ans = SA(`${mx}－${mn}＝${mx - mn}`, `${mx - mn}cm`);
          opt.lines = true;
        } else if (ask === "total") {
          q = "4人の記録を合計すると、何m何cmですか。";
          ans = SA(`${rec.join("＋")}＝${sum(rec)}`, mcm(sum(rec)));
          opt.lines = true;
        } else {
          q = "4人の記録の平均は何cmですか。";
          ans = SA(`(${rec.join("＋")})÷4＝${sum(rec) / 4}`, `${sum(rec) / 4}cm`);
          opt.lines = true;
        }
        return P({ key: `kj:${ask}:${rec.join(",")}`, text: lead + "[[br]]" + q, figure: fig, ans, meta: { rec, names, ask }, softKey: ask, ...opt });
      }
      throw new Error("立ち幅跳びの問題が作れない");
    },
    verify(pr) {
      const { rec, names, ask } = pr.meta, mx = Math.max(...rec), mn = Math.min(...rec);
      if (ask === "far") return hasAns(pr, names[rec.indexOf(mx)]);
      if (ask === "diff") return hasAns(pr, `${mx - mn}cm`);
      if (ask === "total") return hasAns(pr, mcm(sum(rec)));
      return sum(rec) % 4 ? "平均がわりきれない" : hasAns(pr, `${sum(rec) / 4}cm`);
    }
  };

  // ----- ストップウォッチ(0.1秒より細かいところは切り上げ) -----
  const kStopwatch = {
    id: "t.kStopwatch",
    instruction: "ストップウォッチの表示を、秒で表しましょう。0.1秒より細かいところは切り上げます。",
    defaults: { lo: 600, hi: 999, long: false },
    levels: lv({ lo: 650, hi: 999, long: false }, { lo: 600, hi: 1299, long: false }, { lo: 600, hi: 1299, long: true }),
    generate(rng, p, ctx) {
      const long = p.long && ctx && ctx.index % 3 === 2;
      let cs = long ? rng.int(6000, 8999) : rng.int(p.lo, p.hi);
      if (rng.chance(0.15)) cs = Math.floor(cs / 10) * 10;
      const sec = Math.floor(cs / 100), m = Math.floor(sec / 60), s = sec % 60, c = cs % 100;
      const disp = `${m}:${String(s).padStart(2, "0")}:${String(c).padStart(2, "0")}`;
      const tenth = Math.ceil(cs / 10);
      const ans = `${Math.floor(tenth / 10)}.${tenth % 10}`;
      return { key: `ksw:${cs}`, text: K(`${disp} → □秒`), answer: { display: ans, value: tenth / 10 }, workspace: { type: "none" }, meta: { cs, tenth } };
    },
    verify(pr) {
      const { cs, tenth } = pr.meta;
      return tenth * 10 >= cs && tenth * 10 - cs < 10 && pr.answer.display === `${Math.floor(tenth / 10)}.${tenth % 10}` ? null : "切り上げが合わない";
    }
  };

  kurashiGens.push(kCalorie, kSleep, kGrowth, kSize, kJump, kStopwatch);
})();
