/* Schwingungsrechner: Eingaben einlesen, MT.dgl.loese aufrufen und den
   Rechenweg als Text ausgeben. Die Zeichnung und der Dämpfungsregler
   kommen in späteren Aufgaben dazu -- diese Datei zeichnet noch nichts
   auf die Tafel. */
(function(){
"use strict";

/* ==================== Zahlen als Text ==================== */

/* Wie im Flächenrechner: drei signifikante Stellen, deutsches Komma,
   echtes Minuszeichen -- mit einer Ergänzung, die der Flächenrechner
   nicht braucht: eine ganze Zahl wird immer ausgeschrieben, nie in
   Exponentialschreibweise. toPrecision(3) allein würde aus b = 10000
   sonst "1,00e+4" machen, denn bei drei signifikanten Stellen reicht
   der Exponent von 10000 (4) schon an die Genauigkeit (3) heran --
   ein Fall, den der Flächenrechner nie sieht, weil seine Werte immer
   im Koordinatenbereich der Zeichenfläche liegen. Eigene Fassung des
   Ganzen, weil keine der beiden Dateien die andere kennt. */
function num(v){
  if (Math.abs(v) < 1e-10) return '0';
  var s;
  if (v === Math.round(v) && Math.abs(v) < 1e15) s = String(Math.round(v));
  else s = (Math.abs(v) >= 100 || Math.abs(v) < 0.01) ? v.toPrecision(3) : v.toFixed(2);
  return s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')
          .replace('.', ',').replace(/-/g, '−');
}
/* Für "a² − 4b": eine negative Zahl bekommt Klammern, sonst läse sich
   "−5² − 4·3" wie "minus fünf hoch zwei". */
function klammer(v){ return v < 0 ? '(' + num(v) + ')' : num(v); }

var TIEF = ['₀','₁','₂','₃','₄','₅','₆','₇','₈','₉'];
var HOCH = ['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹'];
function tief(n){
  var s = String(n), out = '', i;
  for (i = 0; i < s.length; i++) out += TIEF[+s.charAt(i)];
  return out;
}
function hoch(n){
  var s = String(n), out = '', i;
  for (i = 0; i < s.length; i++) out += HOCH[+s.charAt(i)];
  return out;
}
/* Der Faktor x^k vor einem Ansatz -- k ist bei polyexp 0, 1 oder 2, bei
   harmonisch 0 oder 1. */
function xhoch(k){
  if (k === 0) return '';
  if (k === 1) return 'x·';
  return 'x' + hoch(k) + '·';
}

/* ==================== Koeffizientenliste parsen ====================
   parseFloat statt Number: Number('') ist 0, nicht NaN. Ein leeres
   Element in "1, , 3" würde mit Number/map(Number) zu [1, 0, 3] --
   einer still falschen Liste, statt eines Fehlers, den der Baustein
   melden könnte. Deshalb wird ein leeres Element hier selbst geprüft,
   nicht erst dem Baustein überlassen. */
function parseKoeffliste(text, bezeichnung){
  var roh = text, teile, ergebnis = [], i, t, w;
  if (roh.trim() === '') throw new Error(bezeichnung + ': Koeffizienten fehlen.');
  teile = roh.split(',');
  for (i = 0; i < teile.length; i++){
    t = teile[i].trim();
    if (t === '') throw new Error(bezeichnung + ': leeres Element in der Liste "' + roh + '".');
    w = parseFloat(t);
    if (!isFinite(w)) throw new Error(bezeichnung + ': "' + t + '" ist keine Zahl.');
    ergebnis.push(w);
  }
  return ergebnis;
}

/* ==================== Formeltexte ==================== */

function vorzeichenTerm(v, variable){
  return (v >= 0 ? ' + ' : ' − ') + num(Math.abs(v)) + variable;
}
function polynomZeile(a, b){
  return 'λ²' + vorzeichenTerm(a, 'λ') + vorzeichenTerm(b, '');
}
function diskriminanteZeile(a, b, D){
  return 'D = a² − 4b = ' + klammer(a) + '² − 4·' + klammer(b) + ' = ' + num(D);
}

function fallSatz(fall){
  if (fall === 'zwei-reelle') return 'Zwei verschiedene reelle Nullstellen — der Kriechfall. Die Lösung klingt ab, ohne zu schwingen.';
  if (fall === 'doppelt') return 'Eine doppelte Nullstelle — der aperiodische Grenzfall. Der Faktor x gehört zur zweiten Basislösung.';
  return 'Ein Paar konjugiert komplexer Nullstellen — der Schwingfall. Der Realteil bestimmt das Abklingen, der Imaginärteil die Frequenz.';
}

/* wurzeln.re ist −0, wenn a = 0 -- num() rundet das ohnehin auf "0"
   herunter (Schwelle 1e-10), es wird hier also nirgends auf das
   Vorzeichen von re getestet. */
function wurzelnUndYh(res){
  var w = res.wurzeln;
  if (res.fall === 'zwei-reelle'){
    return 'λ₁ = ' + num(w[0]) + ', λ₂ = ' + num(w[1]) +
           '. y_h = C₁·e^(' + num(w[0]) + 'x) + C₂·e^(' + num(w[1]) + 'x).';
  }
  if (res.fall === 'doppelt'){
    return 'λ = ' + num(w[0]) + ' (doppelt). y_h = (C₁ + C₂x)·e^(' + num(w[0]) + 'x).';
  }
  return 'λ = ' + num(w.re) + ' ± ' + num(w.im) + 'i. y_h = e^(' + num(w.re) +
         'x)·(C₁cos(' + num(w.im) + 'x) + C₂sin(' + num(w.im) + 'x)).';
}

function resonanzSatz(teil){
  if (teil.art === 'polyexp'){
    if (teil.k === 0) return 'Keine Resonanz: μ ist keine Nullstelle des charakteristischen Polynoms.';
    if (teil.k === 1) return 'Einfache Resonanz: μ ist eine einfache Nullstelle. Der Ansatz wird mit x multipliziert.';
    return 'Doppelte Resonanz: μ ist die doppelte Nullstelle. Der Ansatz wird mit x² multipliziert.';
  }
  if (teil.k === 1) return 'Resonanz: ±iω sind Nullstellen, denn a = 0 und b = ω². Der Ansatz wird mit x multipliziert.';
  return 'Keine Resonanz: a = 0 und b = ω² sind nicht beide erfüllt.';
}

/* Symbolischer Ansatz, mit A0..An bzw. A/B als Platzhalter -- der
   Rechenweg zeigt erst den Ansatz, dann die gelösten Koeffizienten. */
function polynomSymbolisch(n){
  if (n === 0) return 'A₀';
  if (n === 1) return 'A₀ + A₁x';
  return 'A₀ + A₁x + … + A' + tief(n) + 'x' + hoch(n);
}
function ansatzSymbolisch(teil){
  if (teil.art === 'polyexp'){
    var n = teil.ansatzGrad - teil.k;
    var emu = (teil.mu === 0) ? '' : '·e^(' + num(teil.mu) + 'x)';
    return 'y_p = ' + xhoch(teil.k) + '(' + polynomSymbolisch(n) + ')' + emu;
  }
  return 'y_p = ' + xhoch(teil.k) + '(A·cos(' + num(teil.omega) + 'x) + B·sin(' + num(teil.omega) + 'x))';
}
function koeffizientenText(teil){
  var i, teileArr = [];
  if (teil.art === 'polyexp'){
    for (i = 0; i < teil.koeff.length; i++) teileArr.push('A' + tief(i) + ' = ' + num(teil.koeff[i]));
    return teileArr.join(', ');
  }
  return 'A = ' + num(teil.koeff[0]) + ', B = ' + num(teil.koeff[1]);
}

/* Ein Koeffizientenarray [c0, c1, ..., cn] (ci gehört zu x^i) als
   Text mit echten Zahlen, absteigend nach Grad, Nullen ausgelassen.
   "mehrfach" sagt, ob mehr als ein Summand übrig blieb -- nur dann
   braucht eine Multiplikation von außen Klammern. */
function polynomNumerisch(koeff){
  var glieder = [], i, c, g, betrag, kern, out;
  for (i = koeff.length - 1; i >= 0; i--){
    c = koeff[i];
    if (Math.abs(c) < 1e-12) continue;
    glieder.push({ c: c, exp: i });
  }
  if (glieder.length === 0) return { text: '0', mehrfach: false };
  out = '';
  for (i = 0; i < glieder.length; i++){
    g = glieder[i];
    betrag = Math.abs(g.c);
    if (g.exp === 0) kern = num(betrag);
    else {
      kern = (Math.abs(betrag - 1) < 1e-12) ? '' : num(betrag);
      kern += (g.exp === 1) ? 'x' : 'x' + hoch(g.exp);
    }
    out += (i === 0) ? ((g.c < 0 ? '−' : '') + kern) : ((g.c < 0 ? ' − ' : ' + ') + kern);
  }
  return { text: out, mehrfach: glieder.length > 1 };
}

/* Die tatsächlich berechnete Teillösung, mit Zahlen statt A0..An. Bei
   polyexp steckt der Faktor x^k schon in den führenden Nullen von v --
   das ergibt "x³·e^(−1x)" statt des unhandlicheren "x²·x·e^(−1x)". */
function termNumerisch(teil){
  var v, poly, kern, emu, i;
  if (teil.art === 'polyexp'){
    v = [];
    for (i = 0; i < teil.k; i++) v.push(0);
    for (i = 0; i < teil.koeff.length; i++) v.push(teil.koeff[i]);
    poly = polynomNumerisch(v);
    kern = poly.mehrfach ? '(' + poly.text + ')' : poly.text;
    emu = (teil.mu !== 0) ? '·e^(' + num(teil.mu) + 'x)' : '';
    return kern + emu;
  }
  return xhoch(teil.k) + '(' + num(teil.koeff[0]) + '·cos(' + num(teil.omega) +
         'x) + ' + num(teil.koeff[1]) + '·sin(' + num(teil.omega) + 'x))';
}
function ypZeile(teile){
  var i, teileTexte = [];
  if (teile.length === 0) return null;
  for (i = 0; i < teile.length; i++) teileTexte.push(termNumerisch(teile[i]));
  return 'y_p = ' + teileTexte.join(' + ') + '.';
}

function konstantenZeile(res){
  if (!res.konstanten) return 'Ohne Anfangswerte bleiben C₁ und C₂ unbestimmt.';
  return 'C₁ = ' + num(res.konstanten[0]) + ', C₂ = ' + num(res.konstanten[1]) + '.';
}

/* ==================== Ausgabe ==================== */

function block(list){
  var out = '', i;
  for (i = 0; i < list.length; i++){
    out += '<div class="case"><span>' + list[i][0] + '</span><span>' + list[i][1] + '</span></div>';
  }
  return out;
}

function darstellen(res){
  var zeilen = [], i, teil, yp;
  zeilen.push(['Charakteristisches Polynom',
    polynomZeile(res.polynom.a, res.polynom.b) + '. ' +
    diskriminanteZeile(res.polynom.a, res.polynom.b, res.polynom.diskriminante) + '.']);
  zeilen.push(['Der Fall', fallSatz(res.fall)]);
  zeilen.push(['Die Wurzeln', wurzelnUndYh(res)]);

  for (i = 0; i < res.teile.length; i++){
    teil = res.teile[i];
    zeilen.push([(i + 1) + '. Glied',
      resonanzSatz(teil) + ' ' + ansatzSymbolisch(teil) + '. Koeffizienten: ' + koeffizientenText(teil) + '.']);
  }

  yp = ypZeile(res.teile);
  if (yp) zeilen.push(['Partikuläre Lösung', yp]);

  zeilen.push(['Die Konstanten', konstantenZeile(res)]);

  document.getElementById('ana').innerHTML = block(zeilen);
}

/* ==================== Formularzugriff ==================== */

var elFa = document.getElementById('fa'), elFb = document.getElementById('fb');
var elFanfang = document.getElementById('fanfang'),
    elFy0 = document.getElementById('fy0'), elFy0s = document.getElementById('fy0s');
var elAna = document.getElementById('ana');

function gliedFelder(nr){
  return {
    nr: nr,
    art: document.getElementById('g' + nr + 'art'),
    polyexpBox: document.getElementById('g' + nr + '-polyexp'),
    harmonischBox: document.getElementById('g' + nr + '-harmonisch'),
    mu: document.getElementById('g' + nr + 'mu'),
    koeff: document.getElementById('g' + nr + 'koeff'),
    c: document.getElementById('g' + nr + 'c'),
    d: document.getElementById('g' + nr + 'd'),
    omega: document.getElementById('g' + nr + 'omega')
  };
}
var g1 = gliedFelder('1'), g2 = gliedFelder('2');

function schalteGliedFelder(g){
  var art = g.art.value;
  g.polyexpBox.hidden = (art !== 'polyexp');
  g.harmonischBox.hidden = (art !== 'harmonisch');
}

function gliedAusFeldern(g){
  var art = g.art.value;
  if (art === 'keine') return null;
  if (art === 'polyexp'){
    return {
      art: 'polyexp',
      mu: parseFloat(g.mu.value),
      koeff: parseKoeffliste(g.koeff.value, g.nr + '. Glied')
    };
  }
  return {
    art: 'harmonisch',
    c: parseFloat(g.c.value),
    d: parseFloat(g.d.value),
    omega: parseFloat(g.omega.value)
  };
}

function neuRechnen(){
  var a = parseFloat(elFa.value), b = parseFloat(elFb.value);
  var glieder = [], teil, anfang, res;
  try{
    teil = gliedAusFeldern(g1); if (teil) glieder.push(teil);
    teil = gliedAusFeldern(g2); if (teil) glieder.push(teil);

    anfang = null;
    if (elFanfang.checked){
      anfang = { y0: parseFloat(elFy0.value), y0strich: parseFloat(elFy0s.value) };
    }

    res = MT.dgl.loese(a, b, glieder, anfang);
    darstellen(res);
  } catch(e){
    elAna.innerHTML = '<p class="err">' + e.message + '</p>';
  }
}

/* ==================== Beispiel-Chips ==================== */

var BEISPIELE = [
  { label: '(a) Schwingkreis', a: 10, b: 10000, glied1: null, glied2: null, anfang: true, y0: 0.005, y0s: 0 },
  { label: '(b) Kriechfall', a: 250, b: 10000, glied1: null, glied2: null, anfang: true, y0: 0.005, y0s: 0 },
  { label: '(c) Grenzfall', a: 200, b: 10000, glied1: null, glied2: null, anfang: true, y0: 0.005, y0s: 0 },
  { label: '(d) Resonanz', a: 0, b: 9, glied1: { art: 'harmonisch', c: 0, d: 1, omega: 3 }, glied2: null, anfang: false },
  { label: '(e) doppelte Resonanz', a: 2, b: 1, glied1: { art: 'polyexp', mu: -1, koeff: '0, 6' }, glied2: null, anfang: false }
];

function setzeGlied(g, def){
  if (!def){
    g.art.value = 'keine';
  } else if (def.art === 'polyexp'){
    g.art.value = 'polyexp';
    g.mu.value = def.mu;
    g.koeff.value = def.koeff;
  } else {
    g.art.value = 'harmonisch';
    g.c.value = def.c;
    g.d.value = def.d;
    g.omega.value = def.omega;
  }
  schalteGliedFelder(g);
}

function setzeBeispiel(bsp){
  elFa.value = bsp.a;
  elFb.value = bsp.b;
  setzeGlied(g1, bsp.glied1);
  setzeGlied(g2, bsp.glied2);
  elFanfang.checked = !!bsp.anfang;
  if (bsp.anfang){
    elFy0.value = bsp.y0;
    elFy0s.value = bsp.y0s;
  } else {
    elFy0.value = '';
    elFy0s.value = '';
  }
  neuRechnen();
}

var chipsEl = document.getElementById('chips');
BEISPIELE.forEach(function(bsp){
  var btn = document.createElement('button');
  btn.className = 'chip'; btn.type = 'button';
  btn.textContent = bsp.label;
  btn.addEventListener('click', function(){ setzeBeispiel(bsp); });
  chipsEl.appendChild(btn);
});

/* ==================== Bedienung ==================== */

elFa.addEventListener('input', neuRechnen);
elFb.addEventListener('input', neuRechnen);
elFanfang.addEventListener('change', neuRechnen);
elFy0.addEventListener('input', neuRechnen);
elFy0s.addEventListener('input', neuRechnen);

[g1, g2].forEach(function(g){
  g.art.addEventListener('change', function(){ schalteGliedFelder(g); neuRechnen(); });
  g.mu.addEventListener('input', neuRechnen);
  g.koeff.addEventListener('input', neuRechnen);
  g.c.addEventListener('input', neuRechnen);
  g.d.addEventListener('input', neuRechnen);
  g.omega.addEventListener('input', neuRechnen);
});

setzeBeispiel(BEISPIELE[0]);
})();
