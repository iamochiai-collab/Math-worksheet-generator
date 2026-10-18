// 高校(数学Ⅰ・A・Ⅱ・B・Ⅲ・C)の共通の道具。中学の道具(chuLib)をもとにする。
// 高校はふりがなをつけない。式の中の英字は X() で [[v:x]](斜体)にする(sin・cos・tan・log・lim はそのまま)。
// 新しい記号:[[_n]] 添字、[[^n]] 指数、[[vec:a]] ベクトル、[[bar:z]] 共役、[[int:下端:上端]] 積分、[[sum:k＝1:n]] Σ、[[lim:n→∞]] 極限
var kouLib = {};
var kou0 = (() => {
  const C = chuLib;
  const { Q, qa, qs, qm, qd, qneg, qeq, qabs, qpow, isInt, qv, num, absTex, sgn, gcd, lv, typeOf, nz, L_, arrowHead, draw, SUP } = C;
  const RED = "#d7263d";

  // ===== 式の英字を斜体に =====
  const FUNCS = ["sin", "cos", "tan", "log", "lim", "max", "min", "arg", "Re", "Im", "cm", "km", "kg", "dx", "dt", "dθ", "dy"];
  const WORDKEEP = new Set(["sin", "cos", "tan", "log", "lim", "max", "min", "arg"]);
  function X(s) {
    s = String(s);
    let out = "";
    for (let i = 0; i < s.length; ) {
      if (s.startsWith("[[v:", i)) {
        const j = s.indexOf("]]", i);
        out += s.slice(i, j + 2);
        i = j + 2;
        continue;
      }
      if (s.startsWith("[[", i)) {
        // [[f: [[_ [[^ [[vec: [[bar: [[int: [[sum: [[lim: [[sys: などの頭はそのまま
        const m = /^\[\[(?:[a-z]+:|_|\^)/.exec(s.slice(i));
        if (m) {
          out += m[0];
          i += m[0].length;
          continue;
        }
        // [[abox:..]] などの答えの欄
        const j = s.indexOf("]]", i);
        out += s.slice(i, j + 2);
        i = j + 2;
        continue;
      }
      if (s.startsWith(":sys]]", i)) {
        out += ":sys]]";
        i += 6;
        continue;
      }
      const ch = s[i];
      if (/[a-zA-Z]/.test(ch)) {
        let j = i;
        while (j < s.length && /[a-zA-Z]/.test(s[j])) j++;
        const w = s.slice(i, j);
        // 関数の名前は立体のまま。続く文字(sinx の x)は斜体
        let k = 0, body = "";
        while (k < w.length) {
          const f = [...WORDKEEP].find((f2) => w.startsWith(f2, k));
          if (f) body += f, k += f.length;
          else body += `[[v:${w[k]}]]`, k++;
        }
        out += body;
        i = j;
        continue;
      }
      out += ch;
      i++;
    }
    return out;
  }

  // ===== 小数で式の値を計算する(検算用) =====
  // 分数 [[f:a/b]]・√{}・[[^n]]・²・[[v:x]]・π・e・sin cos tan log(底は [[_2]])・|x|・°・記号を省いたかけ算
  const close = (s, i, open, shut) => {
    let d = 0;
    for (let j = i; j < s.length; j++) {
      if (s.startsWith(open, j)) d++, j += open.length - 1;
      else if (s.startsWith(shut, j)) {
        d--;
        if (!d) return j;
        j += shut.length - 1;
      }
    }
    throw new Error("かっこが閉じない " + s);
  };
  const splitTop = (body, sep) => {
    let d = 0;
    for (let j = body.length - 1; j >= 0; j--) {
      if (body.startsWith("]]", j - 1) && j >= 1) {
        d++;
        j--;
        continue;
      }
      if (body.startsWith("[[", j)) {
        d--;
        continue;
      }
      if (!d && body[j] === sep) return j;
    }
    return -1;
  };
  function lexH(s) {
    s = String(s).replace(/\{([^{}|]+)\|[^{}|]*\}/g, "$1");
    const tk = [];
    for (let i = 0; i < s.length; ) {
      const ch = s[i];
      if (s.startsWith("[[f:", i)) {
        const j = close(s, i, "[[", "]]"), body = s.slice(i + 4, j), k = splitTop(body, "/");
        tk.push({ k: "frac", n: body.slice(0, k), d: body.slice(k + 1) });
        i = j + 2;
      } else if (s.startsWith("[[^", i)) {
        const j = close(s, i, "[[", "]]");
        tk.push({ k: "pow", e: s.slice(i + 3, j) });
        i = j + 2;
      } else if (s.startsWith("[[_", i)) {
        const j = close(s, i, "[[", "]]");
        tk.push({ k: "sub", e: s.slice(i + 3, j) });
        i = j + 2;
      } else if (s.startsWith("[[v:", i)) {
        tk.push({ k: "var", v: s[i + 4] });
        i += 7;
      } else if (s.startsWith("√{", i)) {
        const j = close(s, i + 1, "{", "}");
        tk.push({ k: "sqrt", e: s.slice(i + 2, j) });
        i = j + 1;
      } else if (s.startsWith("∛{", i)) {
        const j = close(s, i + 1, "{", "}");
        tk.push({ k: "cbrt", e: s.slice(i + 2, j) });
        i = j + 1;
      } else if (/[0-9.]/.test(ch)) {
        let j = i;
        while (j < s.length && /[0-9.]/.test(s[j])) j++;
        tk.push({ k: "num", v: Number(s.slice(i, j)) });
        i = j;
      } else if (/[a-zA-Z]/.test(ch)) {
        const f = ["sin", "cos", "tan", "log"].find((f2) => s.startsWith(f2, i));
        if (f) tk.push({ k: "fn", f }), i += 3;
        else tk.push({ k: "var", v: ch }), i++;
      } else if ("θαβγφ".includes(ch)) tk.push({ k: "var", v: ch }), i++;
      else if (ch === "π") tk.push({ k: "num", v: Math.PI }), i++;
      else if (ch === "°") tk.push({ k: "deg" }), i++;
      else if ("＋+".includes(ch)) tk.push({ k: "+" }), i++;
      else if ("－-−".includes(ch)) tk.push({ k: "-" }), i++;
      else if ("×·".includes(ch)) tk.push({ k: "*" }), i++;
      else if (ch === "÷" || ch === "/") tk.push({ k: "/" }), i++;
      else if ("（(".includes(ch)) tk.push({ k: "(" }), i++;
      else if ("）)".includes(ch)) tk.push({ k: ")" }), i++;
      else if (ch === "|") tk.push({ k: "|" }), i++;
      else if (SUPR[ch]) tk.push({ k: "pow", e: String(SUPR[ch]) }), i++;
      else if (/[\s　]/.test(ch)) i++;
      else throw new Error(`式に読めない字: ${ch} in ${s}`);
    }
    return tk;
  }
  const SUPR = { "²": 2, "³": 3, "⁴": 4, "⁵": 5, "⁶": 6, "⁷": 7, "⁸": 8, "⁹": 9 };
  function evalH(s, vars = {}) {
    const tk = lexH(s);
    let i = 0;
    const peek = () => tk[i];
    const starts = (t) => t && ["num", "var", "frac", "sqrt", "cbrt", "("].includes(t.k);
    const expr = () => {
      let v = term();
      while (peek() && (peek().k === "+" || peek().k === "-")) v = tk[i++].k === "+" ? v + term() : v - term();
      return v;
    };
    const term = () => {
      let v = iprod();
      while (peek() && (peek().k === "*" || peek().k === "/")) v = tk[i++].k === "*" ? v * iprod() : v / iprod();
      return v;
    };
    const iprod = () => {
      let v = unary();
      while (starts(peek()) || peek() && peek().k === "fn") v *= peek().k === "fn" ? fnApp() : power();
      return v;
    };
    const unary = () => peek() && peek().k === "-" ? (i++, -unary()) : peek() && peek().k === "+" ? (i++, unary()) : peek() && peek().k === "fn" ? fnApp() : power();
    const fnApp = () => {
      const f = tk[i++].f;
      let base = null, ex = 1;
      if (peek() && peek().k === "sub") base = evalH(tk[i++].e, vars);
      if (peek() && peek().k === "pow") ex = evalH(tk[i++].e, vars);
      // 引数:次の数・文字のかけ算(sin2x ＝ sin(2x))。符号もよい
      let neg = 1;
      if (peek() && peek().k === "-") i++, neg = -1;
      let a = power();
      while (starts(peek())) a *= power();
      a *= neg;
      const v = f === "sin" ? Math.sin(a) : f === "cos" ? Math.cos(a) : f === "tan" ? Math.tan(a) : base ? Math.log(a) / Math.log(base) : Math.log(a);
      return v ** ex;
    };
    const power = () => {
      let v = primary();
      for (;;) {
        if (peek() && peek().k === "deg") i++, v *= Math.PI / 180;
        else if (peek() && peek().k === "pow") v = v ** evalH(tk[i++].e, vars);
        else break;
      }
      return v;
    };
    const primary = () => {
      const t = tk[i++];
      if (!t) throw new Error("式が途中で終わる " + s);
      if (t.k === "num") return t.v;
      if (t.k === "var") {
        if (t.v in vars) return vars[t.v];
        if (t.v === "e") return Math.E;
        throw new Error("文字の値がない " + t.v + " in " + s);
      }
      if (t.k === "frac") return evalH(t.n, vars) / evalH(t.d, vars);
      if (t.k === "sqrt") return Math.sqrt(evalH(t.e, vars));
      if (t.k === "cbrt") return Math.cbrt(evalH(t.e, vars));
      if (t.k === "(") {
        const v = expr();
        if (!peek() || peek().k !== ")") throw new Error("かっこが閉じない " + s);
        i++;
        return v;
      }
      if (t.k === "|") {
        const v = expr();
        if (!peek() || peek().k !== "|") throw new Error("絶対値が閉じない " + s);
        i++;
        return Math.abs(v);
      }
      throw new Error("式の形がおかしい " + s);
    };
    const v = expr();
    if (i !== tk.length) throw new Error("式の後ろに余り " + s);
    return v;
  }
  const near = (a, b, e = 1e-7) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= e * Math.max(1, Math.abs(a), Math.abs(b));
  // 2つの式が等しいか(いくつかの値で調べる)
  const PTS = [0.37, 1.73, -0.61, 2.29, -1.41, 0.83];
  function sameH(a, b, letters = ["x"], o = {}) {
    let ok = 0;
    for (let k = 0; k < PTS.length; k++) {
      const vars = { ...o.fixed || {} };
      letters.forEach((L, j) => vars[L] = (o.shift || 0) + PTS[(k + j * 2) % PTS.length] * (o.scale || 1));
      let u, w;
      try {
        u = evalH(a, vars);
        w = evalH(b, vars);
      } catch (e) {
        throw e;
      }
      if (!Number.isFinite(u) && !Number.isFinite(w)) continue;
      if (!near(u, w, 1e-6)) return false;
      ok++;
    }
    return ok >= 3;
  }

  // ===== 数・式の書き方 =====
  const V = (L) => `[[v:${L}]]`;
  const sup = (n) => SUP[n] ? SUP[n] : `[[^${n}]]`;
  const sub = (n) => `[[_${n}]]`;
  // 1変数の整式(係数 Q の配列、高い次数から)。L は文字
  function pTex(cs, L = "x") {
    const d = cs.length - 1;
    let s = "";
    cs.forEach((c, i) => {
      const e = d - i;
      if (!c || c[0] === 0) return;
      const one = qeq(qabs(c), Q(1));
      const body = e === 0 ? absTex(c) : (one ? "" : absTex(c)) + V(L) + (e > 1 ? sup(e) : "");
      s += (c[0] < 0 ? "－" : s ? "＋" : "") + body;
    });
    return s || "0";
  }
  const pEval = (cs, x) => cs.reduce((a, c) => a * x + qv(c), 0);
  const pQ = (...ns) => ns.map((n) => Array.isArray(n) ? n : Q(n));
  // 整式のかけ算・たし算(係数 Q の配列、高い次数から)
  const pmul = (a, b) => {
    const r = Array(a.length + b.length - 1).fill(0).map(() => Q(0));
    a.forEach((x, i) => b.forEach((y, j) => r[i + j] = qa(r[i + j], qm(x, y))));
    return r;
  };
  const padd = (a, b) => {
    const n = Math.max(a.length, b.length), A = Array(n - a.length).fill(Q(0)).concat(a), B = Array(n - b.length).fill(Q(0)).concat(b);
    return trim(A.map((x, i) => qa(x, B[i])));
  };
  const pscale = (a, q) => a.map((x) => qm(x, q));
  const trim = (a) => {
    let k = 0;
    while (k < a.length - 1 && a[k][0] === 0) k++;
    return a.slice(k);
  };
  // 割り算 a ÷ b → [商, 余り]
  const pdiv = (a, b) => {
    a = trim(a.slice());
    b = trim(b);
    const qn = Math.max(0, a.length - b.length + 1), qq = Array(qn).fill(0).map(() => Q(0));
    let r = a.slice();
    for (let i = 0; i < qn; i++) {
      const c = qd(r[i], b[0]);
      qq[i] = c;
      b.forEach((y, j) => r[i + j] = qs(r[i + j], qm(c, y)));
    }
    r = trim(r.slice(qn));
    return [qn ? qq : [Q(0)], r.length ? r : [Q(0)]];
  };
  // 符号つきの項 ＋3、－2(先頭でなければ)
  const sg = (n, first = false) => n < 0 ? `－${Math.abs(n)}` : first ? String(n) : `＋${n}`;
  const sgQ = (q, first = false) => q[0] < 0 ? `－${absTex(q)}` : first ? absTex(q) : `＋${absTex(q)}`;
  // (x－p) の形(p＝0 なら x)
  const shiftTex = (p, L = "x") => p[0] === 0 ? V(L) : `(${V(L)}${p[0] < 0 ? "＋" : "－"}${absTex(p)})`;
  const shiftIn = (p, L = "x") => p[0] === 0 ? V(L) : `${V(L)}${p[0] < 0 ? "＋" : "－"}${absTex(p)}`;
  // a(x－p)²＋q
  function vertexTex(a, p, q, L = "x") {
    const one = qeq(a, Q(1)), mone = qeq(a, Q(-1));
    const head = (one ? "" : mone ? "－" : num(a)) + (p[0] === 0 ? V(L) + "²" : `(${shiftIn(p, L)})²`);
    return head + (q[0] === 0 ? "" : sgQ(q));
  }
  // 座標
  const ptQ = (x, y) => `(${num(x)}, ${num(y)})`;
  const ptN = (x, y) => `(${num(Q(x))}, ${num(Q(y))})`;

  // 二次方程式 ax²＋bx＋c＝0(整数係数)の解。{ real, roots(文字), vals(小数) }
  function quadRoots(a, b, c, L = "x") {
    if (a < 0) a = -a, b = -b, c = -c;
    const D = b * b - 4 * a * c;
    if (D === 0) {
      const r = Q(-b, 2 * a);
      return { D, real: true, double: true, tex: num(r), vals: [qv(r)], list: [r] };
    }
    const sd = Math.round(Math.sqrt(Math.abs(D)));
    if (D > 0 && sd * sd === D) {
      const r1 = Q(-b - sd, 2 * a), r2 = Q(-b + sd, 2 * a);
      return { D, real: true, tex: `${num(r1)}, ${num(r2)}`, vals: [qv(r1), qv(r2)], list: [r1, r2] };
    }
    // √ の中を簡単に
    let k = 1, m = Math.abs(D);
    for (let d = 2; d * d <= m; d++) while (m % (d * d) === 0) m /= d * d, k *= d;
    let P = -b, K = k, Dn = 2 * a;
    const g = gcd(gcd(Math.abs(P), K), Dn);
    P /= g;
    K /= g;
    Dn /= g;
    const im = D < 0 ? V("i") : "";
    const rad = m === 1 ? "" : `√{${m}}`;
    const kpart = (K === 1 && (rad || im) ? "" : String(K)) + rad + im;
    const numer = (P === 0 ? "" : num(Q(P))) + "±" + kpart;
    const tex = Dn === 1 ? numer : `[[f:${numer}/${Dn}]]`;
    const re = -b / (2 * a), w = Math.sqrt(Math.abs(D)) / (2 * a);
    return { D, real: D > 0, tex, vals: D > 0 ? [re - w, re + w] : [], re, im: D < 0 ? w : 0 };
  }
  // √n を a√b に
  const sqFree = (n) => {
    let a = 1, b = n;
    for (let d = 2; d * d <= b; d++) while (b % (d * d) === 0) b /= d * d, a *= d;
    return [a, b];
  };
  const rootTex = (n) => {
    if (n === 0) return "0";
    const [a, b] = sqFree(n);
    return b === 1 ? String(a) : `${a === 1 ? "" : a}√{${b}}`;
  };
  // p＋q√r(p,q は Q)
  const surdTex = (p, q, r) => {
    if (q[0] === 0 || r === 1) return num(r === 1 ? qa(p, q) : p);
    const [a, b] = sqFree(r);
    q = qm(q, Q(a));
    if (b === 1) return num(qa(p, q));
    const D = p[1] * q[1] / gcd(p[1], q[1]);
    const pn = qm(p, Q(D)), qn = qm(q, Q(D));
    const qq = (x, first) => (x[0] < 0 ? "－" : first ? "" : "＋") + (Math.abs(x[0]) === 1 ? "" : Math.abs(x[0])) + `√{${b}}`;
    const body = pn[0] === 0 ? qq(qn, true) : `${num(pn)}${qq(qn, false)}`;
    if (D === 1) return body;
    if (pn[0] === 0 && qn[0] < 0) return `－[[f:${qq(qneg(qn), true)}/${D}]]`;
    return `[[f:${body}/${D}]]`;
  };

  // 組合せ
  const fact = (n) => n <= 1 ? 1 : n * fact(n - 1);
  const nPr = (n, r) => {
    let v = 1;
    for (let i = 0; i < r; i++) v *= n - i;
    return v;
  };
  const nCr = (n, r) => r < 0 || r > n ? 0 : Math.round(nPr(n, r) / fact(r));
  const P_ = (n, r) => `[[_${n}]]P[[_${r}]]`;
  const C_ = (n, r) => `[[_${n}]]C[[_${r}]]`;
  const lcm = (a, b) => a / gcd(a, b) * b;
  const fnum = (v, d = 3) => {
    const r = Math.round(v * 10 ** d) / 10 ** d;
    return (r < 0 ? "－" : "") + String(Math.abs(r));
  };
  // 有理数 v(小数)を分数の形に(分母 1000 まで)
  const toQ = (v) => {
    for (let d = 1; d <= 1000; d++) {
      const n = Math.round(v * d);
      if (Math.abs(n / d - v) < 1e-9) return Q(n, d);
    }
    return null;
  };

  // ===== 座標平面(範囲を自由に) =====
  // x0〜x1, y0〜y1(整数), c: 1目もりの mm。every: 目もりの数字の間かく
  function planeR(x0, x1, y0, y1, c, { grid = true, every = 1, labels = true, xName = "x", yName = "y", m = 8 } = {}) {
    const W = (x1 - x0) * c, H = (y1 - y0) * c;
    const X = (x) => m + (x - x0) * c, Y = (y) => m + (y1 - y) * c;
    const items = [];
    if (grid) items.push({ t: "grid", x: m, y: m, cols: x1 - x0, rows: y1 - y0, cell: c });
    const ox = Math.min(Math.max(0, x0), x1), oy = Math.min(Math.max(0, y0), y1);
    items.push(L_(m - 2, Y(oy), m + W + 3, Y(oy), { w: 0.5 }), arrowHead(m + W + 4, Y(oy), 1, 0, 2));
    items.push(L_(X(ox), m + H + 2, X(ox), m - 3, { w: 0.5 }), arrowHead(X(ox), m - 4, 0, -1, 2));
    items.push(T_(m + W + 4.6, Y(oy) + 4.4, `[[v:${xName}]]`, 3.6), T_(X(ox) - 3.4, m - 3, `[[v:${yName}]]`, 3.6));
    if (ox === 0 && oy === 0) items.push(T_(X(0) - 1.6, Y(0) + 3.4, "O", 3, { anchor: "end" }));
    if (labels) {
      for (let v = x0; v <= x1; v++) if (v && v % every === 0) items.push(T_(X(v) + (v < 0 ? -0.9 : 0), Y(oy) + 3.6, v < 0 ? `－${-v}` : String(v), 2.5));
      for (let v = y0; v <= y1; v++) if (v && v % every === 0) items.push(T_(X(ox) - 1, Y(v) + 0.9, v < 0 ? `－${-v}` : String(v), 2.5, { anchor: "end" }));
    }
    return { items, X, Y, w: W + 2 * m + 2, h: H + 2 * m, x0, x1, y0, y1, c };
  }
  const T_ = (x, y, s, size = 3.6, o = {}) => ({ t: "text", x, y, s: String(s), size, ...o });
  // 曲線(範囲の外は切る)
  function curve(pl, f, a, b, o = {}) {
    const n = o.n || 160;
    let d = "", pen = false;
    const ylo = pl.y0 - 0.05, yhi = pl.y1 + 0.05;
    for (let i = 0; i <= n; i++) {
      const x = a + (b - a) * i / n, y = f(x);
      if (!Number.isFinite(y) || y < ylo || y > yhi) {
        pen = false;
        continue;
      }
      d += `${pen ? "L" : "M"}${pl.X(x).toFixed(2)} ${pl.Y(y).toFixed(2)}`;
      pen = true;
    }
    return { t: "path", d, w: o.w || 0.7, ...o.color ? { color: o.color } : {}, ...o.dash ? { dash: o.dash } : {}, ...o.tag ? { tag: o.tag } : {} };
  }
  const dotAt = (pl, x, y, o = {}) => ({ t: "dot", x: pl.X(x), y: pl.Y(y), r: o.r || 0.9, ...o.color ? { color: o.color } : {} });

  // ===== 問題を作る部品の形 =====
  // make(rng, type, p) → { text, ans, key?, fig?, ansFig?, wide?, work?, meta? } か null(作り直し)
  function gen(id, instruction, levels, make, verify, o = {}) {
    return {
      id,
      instruction,
      defaults: levels.basic,
      levels,
      generate(rng, p, ctx) {
        for (let t = 0; t < 500; t++) {
          // 種類は順番に回す(ときどき乱数で選ぶので、同じ問題ばかりにならない。シードが同じなら同じ結果)
          const type = p.types ? ctx && Number.isInteger(ctx.index) && t < 40 && rng.chance(0.7) ? p.types[(ctx.index + t) % p.types.length] : rng.pick(p.types) : null;
          let r;
          try {
            r = make(rng, type, p, ctx);
          } catch (e) {
            if (/作り直し/.test(e.message)) continue;
            throw e;
          }
          if (!r) continue;
          // 数の前の半角の「-」は全角の「－」に
          const fm = (v) => typeof v === "string" ? v.replace(/(^|[^A-Za-z])-(?=\d)/g, "$1－") : v;
          const out = {
            key: r.key ?? `${id}:${r.text}`,
            text: fm(r.text),
            answer: { display: fm(r.ans), ...r.ansFig ? { figure: r.ansFig } : {} },
            workspace: r.ws || { type: "none" },
            meta: { type, ...r.meta || {} }
          };
          for (const k of ["figure", "wide", "side", "inline", "softKey", "work", "cols"]) if (r[k] !== void 0) out[k] = r[k];
          if (r.fig) out.figure = r.fig;
          if (o.wide && out.wide === void 0) out.wide = true;
          if (o.work !== void 0 && out.work === void 0) out.work = o.work;
          return out;
        }
        throw new Error(`${id} の問題が作れない`);
      },
      verify: verify || (() => null)
    };
  }
  const redo = () => {
    throw new Error("作り直し");
  };
  const pickN = (rng, arr, n) => rng.shuffle(arr.slice()).slice(0, n);
  const H = {};

  Object.assign(kouLib, { ...C, RED, X, evalH, near, sameH, V, sup, sub, pTex, pEval, pQ, pmul, padd, pscale, trim, pdiv, sg, sgQ, shiftTex, shiftIn, vertexTex, ptQ, ptN, quadRoots, sqFree, rootTex, surdTex, fact, nPr, nCr, P_, C_, lcm, fnum, toQ, planeR, T_, curve, dotAt, gen, redo, pickN, hints: C.hints, lv, typeOf, nz });
  return [];
})();
