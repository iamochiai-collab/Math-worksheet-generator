# 算数プリント

ようじ・小学校1〜6年・中学1〜3年・高校(数学Ⅰ・A・Ⅱ・B・Ⅲ・C)の算数・数学プリントを、ブラウザだけで作れるアプリです。
学年・単元・種類・難易度をえらぶと、そのたびに問題がかわるプリントと答えのページができます。
インターネットにつながっていなくても、`docs/index.html` を開くだけで動きます(1 ファイルで完結)。

**▶ アプリを開く:** https://iamochiai-collab.github.io/Math-worksheet-generator/

![メニュー](docs/screenshots/menu.png)

| 中1 図形の移動 | 中3 二次方程式 |
|---|---|
| ![図形の移動](docs/screenshots/print-c1-move.png) | ![二次方程式](docs/screenshots/print-c3-quad.png) |

| 数学Ⅱ 面積(図) | 数学C 図形とベクトル |
|---|---|
| ![面積](docs/screenshots/print-k2-area.png) | ![ベクトル](docs/screenshots/print-kC-vec.png) |

## できること

- **学年**:ようじ(3〜6さい)、小学校1〜6年(東京書籍『新編 新しい算数』の単元順)、中学1〜3年、高校の数学Ⅰ・数学A・数学Ⅱ・数学B・数学Ⅲ・数学C(中学・高校は学習指導要領の内容の順)
- **種類**:計算ドリル・文章題・図形/グラフ・単元まとめテスト(ようじは絵のプリント)
- **難易度**:★☆☆・★★☆・★★★
- **答え**:答えのページつき。シード番号が同じなら、同じプリントをもう一度作れます
- **漢字**:「習っていない漢字は使わない」「ふりがなをつける」「ヒントをつける」を切りかえられます
- **まとめて作る**:問題のページ数(1〜100ページ)を指定して、まとめて印刷、または PDF・JPG(zip)で保存できます。指定したページ数ちょうどになるように、最後のプリントは途中で区切ります(答えはそのぶんだけ)

## 使い方

1. `docs/index.html` をダウンロードして、Edge か Chrome で開きます。
2. メニューで学年と難易度をえらび、単元の「計算ドリル」などのボタンをおします。
3. 「印刷」で印刷します。「まとめて作る・保存」で、まとめて印刷・PDF・JPG にできます。

iPad では、「ファイル」アプリで `index.html` を長押し →「共有」→「Microsoft Edge」で開いてください。

### GitHub Pages で公開する

このリポジトリを GitHub にあげたあと、
**Settings → Pages → Build and deployment** で
「Source: Deploy from a branch」「Branch: `main`」「フォルダ: `/docs`」をえらんで保存します。
しばらくすると `https://<ユーザー名>.github.io/<リポジトリ名>/` で開けるようになります。

## フォルダの構成

```
.
├─ docs/
│  ├─ index.html          ← できあがったアプリ(これだけで動く。GitHub Pages の公開先)
│  └─ screenshots/        ← README 用の画像
├─ src/
│  ├─ template.html       ← アプリの本体(画面・プリントの組み立て・小学校の問題など)
│  └─ generators/         ← あとから足した問題をつくる部品
│     ├─ yoji/            ← ようじ
│     ├─ g4LineGraph/     ← 4年「折れ線グラフと表」(+ topics.json)
│     ├─ chu1/            ← 中学1年
│     ├─ chu2/            ← 中学2年
│     ├─ chu3/            ← 中学3年
│     ├─ kou0/            ← 高校の共通の道具(式の検算・グラフ・記号)
│     ├─ kou1/ kouA/      ← 数学Ⅰ・数学A
│     ├─ kou2/ kouB/      ← 数学Ⅱ・数学B
│     └─ kou3/ kouC/      ← 数学Ⅲ・数学C
├─ assets/chara/          ← メニューのキャラクター画像(webp)
├─ vendor/                ← PDF・JPG・zip 用の道具(html2canvas / jsPDF / JSZip)とライセンス
├─ tools/
│  ├─ build.py            ← 1 ファイルにまとめる
│  └─ test/               ← 検査(Playwright)
└─ .github/workflows/check.yml ← push したときの自動検査
```

`docs/index.html` は `tools/build.py` で作るファイルです。直接は書きかえず、`src/` などを直してから作り直してください。

## 作り直し方

Python 3 があれば作れます(追加のパッケージはいりません)。

```sh
python3 tools/build.py
```

- `docs/index.html`(公開用)と `build/test.html`(検査用。git には入れない)ができます。
- `src/template.html` の `{{CHARA:名前}}` に `assets/chara/名前.webp` が、`{{VENDOR:ファイル名}}` に `vendor/` のファイルが入ります。
- `src/generators/<名前>/*.js` は、フォルダ名の順・ファイル名の順につないで入れます。

## 検査

Node.js 20 以上と Playwright を使います。

```sh
npm install
npx playwright install chromium
npm test                 # 問題の検査(答えが合うか・重複しないか・ふりがなのない漢字がないか)
npm run test:layout      # 全部の組み合わせでプリントを作り、はみ出し・番号のずれがないか(時間がかかります)
npm run test:clip        # 図の中の文字のはみ出し(参考)
```

1つの単元だけ調べるときは、たとえば次のようにします。

```sh
node tools/test/generators.js build/test.html c3-03 200
node tools/test/render.js build/test.html c3-03 drill normal 20 5 out/c3-03-   # 画像にして見る
```

## 問題の部品を足すとき

`src/generators/<名前>/` に JavaScript を置きます。中学の部品は次の形です(例:`chu1/part1.js`)。

```js
var chu1 = (() => {
  const gen = {
    id: "c1.addSub",                         // 部品の名前
    instruction: "次の計算をしましょう。",     // 大問の指示(文章題は null)
    defaults: { ... },
    levels: { basic: { ... }, normal: { ... }, challenge: { ... } },
    generate(rng, p, ctx) { return { key, text, answer: { display }, workspace: { type: "none" }, meta }; },
    verify(pr, p) { return null; }            // 答えが正しければ null、まちがいならその理由
  };
  return [gen];
})();
var chu1Grade = { grade: 7, units: [ ... ] };  // 学年と単元(src/template.html の GRADES に入る)
```

- 漢字は `{漢字|かんじ}` の形で書くと、ふりがなをつけられます(中学は `R()` で辞書から自動でつけています)。
- 文字は `[[v:x]]`、分数は `[[f:2/3]]`、根号は `√{3}`、連立方程式は `[[sys:式1||式2:sys]]` と書きます。
- 高校では、添字 `[[_n]]`、指数 `[[^n]]`、ベクトル `[[vec:a]]`、共役(上線) `[[bar:z]]`、積分 `[[int:0:1]]`、Σ `[[sum:k＝1:n]]`、極限 `[[lim:n→∞]]`、循環小数の点 `[[dot:3]]` も使えます。式の中の英字は `kouLib.X()` でまとめて斜体にできます。
- 高校の部品は `kouLib.gen()` で作り、答えは `kouLib.evalH()`(小数で式の値を計算する)などで検算します。
- 新しい部品を足したら `npm test` で検査してください。

## 著作権・ライセンス

算数プリントの著作権は、落合聡一にあります(© 2026 落合聡一)。

- プログラムと問題の部品は [MIT ライセンス](LICENSE) です。だれでも自由に使う・コピーする・書きかえる・配ることができます(著作権表示と LICENSE の文はのこしてください)。
- `assets/chara/` のキャラクター画像は MIT ライセンスにふくまれません。著作権は落合聡一にあり、許可なく使うことはできません。
- `vendor/` の html2canvas(MIT)・jsPDF(MIT)・JSZip(MIT または GPLv3)は落合聡一の作ったものではないため、それぞれの作者のライセンスにしたがいます(`vendor/licenses/`)。
