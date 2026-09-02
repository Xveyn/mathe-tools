/* Schwingungsrechner: Eingaben einlesen, MT.dgl.loese aufrufen, den
   Rechenweg als Text ausgeben und die Lösung auf die Tafel zeichnen.
   Dazu ein Dämpfungsregler für a, dessen Bereich sich nach b richtet. */
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

/* Der Exponentialfaktor e^(vx): weggelassen, wenn v praktisch 0 ist (der
   Faktor ist dann 1 und trüge nur Rauschen bei -- etwa bei Chip (d), wo
   a = 0 und damit der Realteil der Wurzel 0 ist), ohne die führende 1
   vor dem x, wenn |v| = 1 ist ("e^(x)", "e^(−x)" statt "e^(1x)",
   "e^(−1x)"). Eine Anzeige, die Zeile für Zeile mit der Handrechnung
   verglichen wird, darf diese beiden Fälle nicht als Sonderfall des
   Lesers behandeln. */
function expFaktor(v){
  var betrag, kern;
  if (Math.abs(v) < 1e-10) return '';
  betrag = Math.abs(v);
  kern = (Math.abs(betrag - 1) < 1e-12) ? 'x' : (num(betrag) + 'x');
  return 'e^(' + (v < 0 ? '−' : '') + kern + ')';
}

/* ==================== Koeffizientenliste parsen ====================
   parseFloat statt Number: Number('') ist 0, nicht NaN. Ein leeres
   Element in "1, , 3" würde mit Number/map(Number) zu [1, 0, 3] --
   einer still falschen Liste, statt eines Fehlers, den der Baustein
   melden könnte. Deshalb wird ein leeres Element hier selbst geprüft,
   nicht erst dem Baustein überlassen.

   parseFloat allein reicht aber nicht: es liest bis zum ersten
   unpassenden Zeichen und liefert klaglos, was es hat -- aus "2x" wird
   2, aus "2 3" ebenfalls 2. Ein Element muss deshalb VOR der Umwandlung
   ganz auf eine Zahl passen, sonst löst dieselbe Lücke, die "1, , 3"
   schließen sollte, sich einen Buchstaben weiter wieder auf. */
var ZAHL_MUSTER = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;
function parseKoeffliste(text, bezeichnung){
  var roh = text, teile, ergebnis = [], i, t, w;
  if (roh.trim() === '') throw new Error(bezeichnung + ': Koeffizienten fehlen.');
  teile = roh.split(',');
  for (i = 0; i < teile.length; i++){
    t = teile[i].trim();
    if (t === '') throw new Error(bezeichnung + ': leeres Element in der Liste "' + roh + '".');
    if (!ZAHL_MUSTER.test(t)) throw new Error(bezeichnung + ': "' + t + '" ist keine Zahl.');
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
  return 'Diskriminante D = a² − 4b = ' + klammer(a) + '² − 4·' + klammer(b) + ' = ' + num(D);
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
  var w = res.wurzeln, f1, f2, fre;
  if (res.fall === 'zwei-reelle'){
    f1 = expFaktor(w[0]); f2 = expFaktor(w[1]);
    return 'λ₁ = ' + num(w[0]) + ', λ₂ = ' + num(w[1]) + '. y_h = C₁' +
           (f1 ? '·' + f1 : '') + ' + C₂' + (f2 ? '·' + f2 : '') + '.';
  }
  if (res.fall === 'doppelt'){
    f1 = expFaktor(w[0]);
    return 'λ = ' + num(w[0]) + ' (doppelt). y_h = (C₁ + C₂x)' + (f1 ? '·' + f1 : '') + '.';
  }
  fre = expFaktor(w.re);
  return 'λ = ' + num(w.re) + ' ± ' + num(w.im) + 'i. y_h = ' + (fre ? fre + '·' : '') +
         '(C₁cos(' + num(w.im) + 'x) + C₂sin(' + num(w.im) + 'x)).';
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
  if (n === 2) return 'A₀ + A₁x + A₂x²';
  return 'A₀ + A₁x + … + A' + tief(n) + 'x' + hoch(n);
}
function ansatzSymbolisch(teil){
  var n, ef;
  if (teil.art === 'polyexp'){
    n = teil.ansatzGrad - teil.k;
    ef = expFaktor(teil.mu);
    return 'y_p = ' + xhoch(teil.k) + '(' + polynomSymbolisch(n) + ')' + (ef ? '·' + ef : '');
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

/* Zwei benannte Summanden A·cos(ωx) + B·sin(ωx) mit echten Zahlen: ein
   Summand mit A bzw. B praktisch 0 fällt weg (statt als "+ 0·sin(3x)"
   mitgeschleppt zu werden), wie polynomNumerisch es für ein Polynom
   schon tut. */
function harmonischNumerisch(A, B, omega){
  var glieder = [], i, g, betrag, kern, out;
  if (Math.abs(A) >= 1e-12) glieder.push({ c: A, name: 'cos(' + num(omega) + 'x)' });
  if (Math.abs(B) >= 1e-12) glieder.push({ c: B, name: 'sin(' + num(omega) + 'x)' });
  if (glieder.length === 0) return '0';
  out = '';
  for (i = 0; i < glieder.length; i++){
    g = glieder[i];
    betrag = Math.abs(g.c);
    kern = (Math.abs(betrag - 1) < 1e-12) ? '' : num(betrag) + '·';
    kern += g.name;
    out += (i === 0) ? ((g.c < 0 ? '−' : '') + kern) : ((g.c < 0 ? ' − ' : ' + ') + kern);
  }
  return out;
}

/* Die tatsächlich berechnete Teillösung, mit Zahlen statt A0..An. Bei
   polyexp steckt der Faktor x^k schon in den führenden Nullen von v --
   das ergibt "x³·e^(−x)" statt des unhandlicheren "x²·x·e^(−x)". */
function termNumerisch(teil){
  var v, poly, kern, ef, i;
  if (teil.art === 'polyexp'){
    v = [];
    for (i = 0; i < teil.k; i++) v.push(0);
    for (i = 0; i < teil.koeff.length; i++) v.push(teil.koeff[i]);
    poly = polynomNumerisch(v);
    kern = poly.mehrfach ? '(' + poly.text + ')' : poly.text;
    ef = expFaktor(teil.mu);
    return kern + (ef ? '·' + ef : '');
  }
  return xhoch(teil.k) + '(' + harmonischNumerisch(teil.koeff[0], teil.koeff[1], teil.omega) + ')';
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

/* ==================== Die Zeichnung ====================
   Eine Tafel mit drei Kurven: y (gold), y_h (mint), y_p (rose) über der
   Zeit x ab 0. Ohne Anfangswerte ist y_h nicht bestimmt (MT.dgl.loese
   liefert dann yh ≡ 0 und y = y_p) -- gezeichnet wird in dem Fall nur
   y_p, mit einem Hinweis in der figcaption. */

var elCy = document.getElementById('cy'), gCy = elCy.getContext('2d');
var elCyHinweis = document.getElementById('cyHinweis');
var letztesErgebnis = null;

/* Das Zeitfenster T: fünffache Abkling- bzw. Kriechzeit, mindestens
   fünf Perioden eines Schwingungs- oder harmonischen Störgliedes,
   mindestens die fünffache Abklingzeit 1/|μ| eines polyexp-Störgliedes,
   gedeckelt bei 100. wurzeln.re/wurzeln[i] gehen hier immer durch
   Math.abs() -- so spielt das Vorzeichen von re (das bei a = 0 als −0
   vorliegt) nirgends eine Rolle.

   Jeder Kandidat, der auf einer Abklingzeit beruht (delta, lmin, μ),
   nimmt nur teil, wenn er > 0 ist -- eine Abklingzeit von 1/0 ist
   *undefiniert*, kein sehr großer, aber gültiger Wert. Vorher stand hier
   Infinity, und Infinity gewinnt jedes Math.max: bei Chip (d) (a = 0,
   also δ = 0) verschluckte das den wohldefinierten Fünf-Perioden-Kandidaten
   und drückte T bis an den Deckel -- 48 Schwingungen statt der
   verlangten fünf. Erst wenn am Ende gar kein Kandidat etwas Positives
   geliefert hat (T ist dann noch 0), tritt der Deckel selbst als
   Ersatzwert ein. */
function berechneT(res){
  var w = res.wurzeln, T = 0, delta, l1, l2, lmin, i, teil, periode, mu;
  if (res.fall === 'komplex'){
    delta = Math.abs(w.re);
    if (delta > 0) T = Math.max(T, 5 / delta);
    periode = 2 * Math.PI / w.im;
    T = Math.max(T, 5 * periode);
  } else if (res.fall === 'zwei-reelle'){
    l1 = Math.abs(w[0]); l2 = Math.abs(w[1]);
    lmin = Math.min(l1, l2);
    if (lmin > 0) T = Math.max(T, 5 / lmin);
  } else {
    lmin = Math.abs(w[0]);
    if (lmin > 0) T = Math.max(T, 5 / lmin);
  }
  for (i = 0; i < res.teile.length; i++){
    teil = res.teile[i];
    if (teil.art === 'harmonisch'){
      periode = 2 * Math.PI / teil.omega;
      T = Math.max(T, 5 * periode);
    } else if (teil.art === 'polyexp'){
      mu = Math.abs(teil.mu);
      if (mu > 0) T = Math.max(T, 5 / mu);
    }
  }
  if (!(T > 0)) T = 100;
  return Math.min(T, 100);
}

/* Passt die Höhe der Tafel an ihre Breite an -- ein <canvas> ohne
   eigenes CSS-Seitenverhältnis bliebe sonst bei der Browser-Vorgabe
   von 150px stehen. */
function groesseCy(){
  elCy.style.height = Math.max(220, Math.min(420, elCy.clientWidth * 0.4)) + 'px';
}

function zeichneY(res){
  var COL = MT.canvas.colors();
  var masse = MT.canvas.fit(elCy, gCy), w = masse.w, h = masse.h;
  var T = berechneT(res);
  var n = 400, dx = T / (n - 1), mitYh = !!res.konstanten;
  var werteY = [], werteYh = [], werteYp = [], maxAbs = 0, i, x, v;

  for (i = 0; i < n; i++){
    x = i * dx;
    v = res.yp(x); werteYp.push(v);
    if (isFinite(v) && Math.abs(v) > maxAbs) maxAbs = Math.abs(v);
    if (mitYh){
      v = res.y(x); werteY.push(v);
      if (isFinite(v) && Math.abs(v) > maxAbs) maxAbs = Math.abs(v);
      v = res.yh(x); werteYh.push(v);
      if (isFinite(v) && Math.abs(v) > maxAbs) maxAbs = Math.abs(v);
    }
  }
  if (!(maxAbs > 0)) maxAbs = 1;
  var yGrenze = maxAbs * 1.12, yMin = -yGrenze, yMax = yGrenze;

  var padL = 16, padR = 14, padT = 14, padB = 22;
  var X = MT.canvas.linear(0, T, padL, w - padR);
  var Y = MT.canvas.linear(yMin, yMax, h - padB, padT);

  gCy.strokeStyle = COL.grid; gCy.lineWidth = 1;
  var xstep = MT.canvas.tickStep(T), xt;
  for (xt = 0; xt <= T + 1e-9; xt += xstep){
    gCy.beginPath(); gCy.moveTo(X(xt), padT); gCy.lineTo(X(xt), h - padB); gCy.stroke();
  }
  var ystep = MT.canvas.tickStep(yMax - yMin), yt;
  for (yt = Math.ceil(yMin / ystep) * ystep; yt <= yMax; yt += ystep){
    gCy.beginPath(); gCy.moveTo(padL, Y(yt)); gCy.lineTo(w - padR, Y(yt)); gCy.stroke();
  }

  gCy.strokeStyle = COL.axis; gCy.lineWidth = 1.1;
  gCy.beginPath(); gCy.moveTo(padL, Y(0)); gCy.lineTo(w - padR, Y(0)); gCy.stroke();
  gCy.beginPath(); gCy.moveTo(X(0), padT); gCy.lineTo(X(0), h - padB); gCy.stroke();
  gCy.fillStyle = COL.dim; gCy.font = 'italic 12px Georgia, serif';
  gCy.fillText('x', w - padR - 8, Y(0) - 6);
  gCy.fillText('y', X(0) + 6, padT + 11);

  function punkte(werte){
    var out = [], j, val;
    for (j = 0; j < werte.length; j++){
      val = werte[j];
      if (!isFinite(val) || val < yMin || val > yMax) out.push(null);
      else out.push({ x: X(j * dx), y: Y(val) });
    }
    return out;
  }

  if (mitYh){
    gCy.strokeStyle = COL.mint; gCy.lineWidth = 1.2;
    MT.plot2d.polyline(gCy, punkte(werteYh));
    gCy.strokeStyle = COL.rose; gCy.lineWidth = 1.2;
    MT.plot2d.polyline(gCy, punkte(werteYp));
    gCy.strokeStyle = COL.gold; gCy.lineWidth = 2.4;
    MT.plot2d.polyline(gCy, punkte(werteY));
  } else {
    gCy.strokeStyle = COL.rose; gCy.lineWidth = 1.2;
    MT.plot2d.polyline(gCy, punkte(werteYp));
  }

  /* Der Hinweis ohne Anfangswerte steht nicht auf der Leinwand: fillText
     bricht nicht um, und der Satz ist bei schmalen Fenstern länger als
     die Tafel breit ist -- er stünde abgeschnitten da. Er wohnt deshalb
     als eigenes, standardmäßig verstecktes Element in der figcaption
     (siehe index.html) und wird hier nur ein- oder ausgeblendet. */
  elCyHinweis.hidden = mitYh;
}

/* ==================== Formularzugriff ==================== */

var elFa = document.getElementById('fa'), elFb = document.getElementById('fb');
var elFanfang = document.getElementById('fanfang'),
    elFy0 = document.getElementById('fy0'), elFy0s = document.getElementById('fy0s');
var elAna = document.getElementById('ana');
var elRa = document.getElementById('ra'), elGrenzfall = document.getElementById('grenzfall');

/* Der exakte Grenzwert 2*sqrt(b) der zuletzt aufgebauten Beschriftung --
   null, wenn b <= 0 und es also keinen gibt. Der Klick auf die Zahl in
   der Beschriftung (siehe die Bedienung weiter unten) braucht den vollen
   Wert, nicht die auf drei Stellen gerundete Anzeige. */
var grenzwertAktuell = null;

/* Der Daempfungsregler: Bereich und Schrittweite haengen von b ab und
   muessen bei jeder Neurechnung neu bestimmt werden -- ein einmal aus
   dem Start-b berechneter Bereich waere falsch, sobald jemand ein
   anderes b eintippt. Fuer b > 0 laeuft der Regler von 0 bis 3·√b in 300
   Schritten -- absichtlich durch drei teilbar, denn der Grenzfall 2·√b
   liegt immer bei zwei Dritteln der Strecke; bei 300 Schritten ist er
   damit genau der 200. Gitterpunkt, statt zwischen zwei Schritten zu
   verschwinden (das war bei 400 Schritten der Fall -- 2/3 von 400 ist
   266,667, nie ganzzahlig). Fuer b <= 0 gibt es keinen Grenzfall (die
   Nullstellen sind dann immer reell, siehe MT.dgl), der Regler wird
   deshalb abgeschaltet statt mit einem erfundenen Bereich
   weiterzulaufen.

   Die Gegenrichtung -- a stellt den Reglerstand nach -- braucht hier
   keine eigene Klammerung: liegt a ausserhalb von [0, 3·√b], klemmt ein
   <input type="range"> beim Setzen von .value von selbst auf seine
   Grenze. */
function aktualisiereRegler(a, b){
  var max, krit;
  if (b > 0){
    max = 3 * Math.sqrt(b);
    krit = 2 * Math.sqrt(b);
    elRa.min = 0;
    elRa.max = max;
    elRa.step = max / 300;
    elRa.disabled = false;
    if (isFinite(a)) elRa.value = a;
    grenzwertAktuell = krit;
    elGrenzfall.innerHTML = 'Aperiodischer Grenzfall bei a = 2√b = ' +
      '<button type="button" class="grenzwert" aria-label="a auf den Grenzfall setzen">' +
      num(krit) + '</button>.';
  } else {
    elRa.disabled = true;
    grenzwertAktuell = null;
    elGrenzfall.textContent = 'Für b ≤ 0 gibt es keinen Grenzfall; die Nullstellen sind stets reell.';
  }
}

/* Klick (oder Enter/Leertaste, wie bei jeder <button>) auf die Zahl in
   der Beschriftung: a wird exakt auf den Grenzwert gesetzt, Regler und
   Zahlenfeld ziehen mit, denn das laeuft ueber denselben Weg wie jede
   Eingabe in fa. Delegiert auf elGrenzfall, weil aktualisiereRegler()
   die <button> bei jeder Neurechnung neu aufbaut (innerHTML) -- eine
   Bindung direkt am Element waere nach der ersten Neurechnung verwaist. */
elGrenzfall.addEventListener('click', function(e){
  if (!e.target.classList || !e.target.classList.contains('grenzwert')) return;
  if (grenzwertAktuell === null) return;
  elFa.value = grenzwertAktuell;
  neuRechnen();
});

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
  aktualisiereRegler(a, b);
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
    letztesErgebnis = res;
    zeichneY(res);
  } catch(e){
    elAna.innerHTML = '<p class="err">' + e.message + '</p>';
    letztesErgebnis = null;
    MT.canvas.fit(elCy, gCy);
  }
}

/* ==================== Beispiel-Chips ==================== */

var BEISPIELE = [
  { label: '(a) Schwingkreis', a: 10, b: 10000, glied1: null, glied2: null, anfang: true, y0: 0.005, y0s: 0 },
  { label: '(b) Kriechfall', a: 250, b: 10000, glied1: null, glied2: null, anfang: true, y0: 0.005, y0s: 0 },
  { label: '(c) Grenzfall', a: 200, b: 10000, glied1: null, glied2: null, anfang: true, y0: 0.005, y0s: 0 },
  { label: '(d) Resonanz', a: 0, b: 9, glied1: { art: 'harmonisch', c: 0, d: 1, omega: 3 }, glied2: null, anfang: false },
  { label: '(e) doppelte Resonanz', a: 2, b: 1, glied1: { art: 'polyexp', mu: -1, koeff: '0, 6' }, glied2: null, anfang: false },
  /* Der einzige Chip, bei dem alle drei Kurven gezeichnet werden UND sich
     unterscheiden: (a)-(c) haben y_p = 0 (y deckt sich mit y_h), (d) und
     (e) laufen ohne Anfangswerte (nur y_p). Ohne diesen Chip zeigt kein
     einziges Beispiel die Kernaussage der Seite -- der homogene Anteil
     klingt ab, der partikuläre bleibt. */
  { label: '(f) erzwungene Schwingung', a: 1, b: 4, glied1: { art: 'harmonisch', c: 1, d: 0, omega: 1 }, glied2: null, anfang: true, y0: 2, y0s: 0 }
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
elRa.addEventListener('input', function(){
  elFa.value = this.value;
  neuRechnen();
});
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

window.addEventListener('resize', function(){
  groesseCy();
  if (letztesErgebnis) zeichneY(letztesErgebnis);
});

groesseCy();
setzeBeispiel(BEISPIELE[0]);
})();
