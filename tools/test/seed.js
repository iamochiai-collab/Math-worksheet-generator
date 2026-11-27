// 番号(たね)の けんさ:おなじ 番号で「作成」を なんども おすと、おなじ 問題に なるか(ちがう 番号では ちがう 問題か)
// 使い方: node tools/test/seed.js [docs/index.html]
//  - 「下が あいたので ふやした」で 問題数が ふえて いき、おなじ 番号でも 問題が かわる バグ(2026/11)の けんさ
//  - 「ちがう番号で おなじ」は 字だけ くらべるので、絵だけの プリント・きろく用紙は 出ても よい
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1000, height: 1200 } });
  await pg.addInitScript(() => { window.print = () => {}; });
  await pg.goto('file://' + require('path').resolve(process.argv[2] || "docs/index.html")); await pg.waitForTimeout(400);
  const grades = await pg.$$eval('#grade option', os => os.map(o => o.value));
  let bad=0, n=0;
  for (const g of grades) {
    const r = await pg.evaluate((g) => { const set=(id,v)=>{const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('change'));};
      set('grade',g); const out=[];
      for (const uo of [...document.getElementById('unit').options].filter(x=>!x.disabled)) { set('unit',uo.value);
        for (const k of [...document.getElementById('kind').options].filter(x=>!x.disabled)) { set('kind',k.value);
          const txt=()=>[...document.querySelectorAll('#preview article.sheet')].map(a=>a.querySelector('.body').innerText).join('|');
          document.getElementById('seed').value='42'; document.getElementById('btnMake').click(); const a=txt();
          document.getElementById('seed').value='43'; document.getElementById('btnMake').click(); const c=txt();
          document.getElementById('seed').value='42'; document.getElementById('btnMake').click(); const a2=txt();
          out.push([uo.value,k.value,a===a2,a!==c]); } }
      return out; }, g);
    for (const [u,k,same,diff] of r) { n++; if(!same||!diff){ bad++; console.log(g,u,k, same?'':'おなじ番号で ちがう', diff?'':'ちがう番号で おなじ'); } }
  }
  console.log('cases', n, 'bad', bad); await b.close();
})();
