/* MT.extrema — stationäre Stellen einer Funktion zweier Veränderlicher
   suchen und über die Hesse-Matrix einordnen.

   Gesucht wird mit gedämpftem Levenberg-Marquardt, nicht mit Newton:
   bei f(x,y) = x² + y² - 2xy + 1 ist die Hesse-Matrix überall exakt
   singulär, obwohl der Gradient auf der ganzen Geraden y = x
   verschwindet. Newton bräche dort an jedem Startpunkt ab und meldete
   fälschlich, es gebe keine stationäre Stelle.

   Zwei Zahlen tragen dieses Modul, und beide hängen an der
   Differenzenschrittweite h: der Gradient wird nach Richardson
   extrapoliert (siehe ableitungen), und zwei Treffer gelten als dieselbe
   Stelle, wenn sie näher als 2h beieinanderliegen (siehe finde). Feiner
   als h kann dieses Verfahren nicht auflösen — was es feiner behauptet,
   ist erfunden. */
var MT = MT || {};
(function(){
  "use strict";

  /* Zentrale Differenzen. Liefert null, sobald ein Wert nicht endlich
     ist — das ist der Polstellenfall.

     Der GRADIENT wird zusätzlich nach Richardson extrapoliert, und das
     ist keine Verfeinerung, sondern notwendig. Die zentrale Differenz
     liefert nicht f_x, sondern f_x + h²·f_xxx/6 + … Dieser Rest ist kein
     Rauschen um null herum, sondern ein fester Sockel, und die Suche
     unten treibt genau diese Größe gegen null. Zwei Folgen, beide
     gemessen:

     - f = x³ + y³: die genäherte Ableitung ist 3x² + h² und hat gar
       keine Nullstelle. Jeder Startpunkt läuft ins Leere, das Werkzeug
       meldete „keine Stelle“ — obwohl (0|0) stationär ist. Beim
       Kontrollieren ist das die schädlichste aller Antworten.
     - f = x³ − 3xy², der Affensattel aus MV 14c: die genäherte
       Ableitung verschwindet bei y = ±h/√3 — an zwei Stellen, die es
       nicht gibt. Das Werkzeug erfand dort zwei Sattelpunkte.

     Aus D(h) und D(h/2) fällt das h²-Glied heraus:
     (4·D(h/2) − D(h)) / 3 = f_x + O(h⁴). Bei f = x³ ist das Ergebnis
     wieder exakt 3x². Kosten: vier weitere Funktionsauswertungen je
     Stelle, 13 statt 9 — gemessen ein Aufschlag von rund einem Drittel
     auf die Laufzeit der Suche, im langsamsten geprüften Fall von 42 auf
     58 ms.

     Die ZWEITEN Ableitungen bleiben schlichte zentrale Differenzen. Sie
     werden nirgends gegen null getrieben; ihr h²-Glied verfälscht keine
     Entscheidung, sondern nur die letzte angezeigte Stelle. */
  function ableitungen(f, x, y, h){
    var f0  = f(x, y);
    var fpx = f(x + h, y),     fmx = f(x - h, y);
    var fpy = f(x, y + h),     fmy = f(x, y - h);
    var fpp = f(x + h, y + h), fpm = f(x + h, y - h);
    var fmp = f(x - h, y + h), fmm = f(x - h, y - h);
    var hh  = h / 2;
    var hpx = f(x + hh, y),    hmx = f(x - hh, y);
    var hpy = f(x, y + hh),    hmy = f(x, y - hh);
    var d = {
      f:   f0,
      gx:  (4 * (hpx - hmx) / h - (fpx - fmx) / (2 * h)) / 3,
      gy:  (4 * (hpy - hmy) / h - (fpy - fmy) / (2 * h)) / 3,
      fxx: (fpx - 2 * f0 + fmx) / (h * h),
      fyy: (fpy - 2 * f0 + fmy) / (h * h),
      fxy: (fpp - fpm - fmp + fmm) / (4 * h * h)
    };
    var k;
    for (k in d) { if (!isFinite(d[k])) return null; }
    return d;
  }

  function betrag(d){ return Math.sqrt(d.gx * d.gx + d.gy * d.gy); }

  /* Wann gilt ein Gradient als null? Nicht relativ zum FUNKTIONSWERT — das
     war er bis hierher, und es ist der falsche Maßstab: eine große additive
     Konstante ändert am Gradienten nichts, hob aber die Schwelle mit sich.
     Bei x² + y² + 10⁸ stand sie bei 1e-2, und das Werkzeug nahm acht
     Stellen an, verstreut um rund 3·10⁻³ um den Ursprung, statt des einen
     Minimums; bei 10¹⁰ lagen sie bei ±0,4 und wurden teils als Maximum
     eingeordnet.

     Der richtige Maßstab ist die Auslöschung in der Differenz selbst. Die
     Funktionswerte tragen einen relativen Fehler von rund eps; ihre
     Differenz durch 2h teilt diesen Fehler durch h. Was am Gradienten
     unterhalb von eps·|f|/h liegt, ist deshalb kein kleiner Wert, sondern
     gar kein Wert — bei 10⁸ und h = 5·10⁻⁴ springt der berechnete Gradient
     in Stufen von rund 1,5·10⁻⁵, dazwischen gibt es nichts.

     Der Faktor 4 hält Abstand zu genau dieser Stufe: eine Schwelle unter
     einer Stufenhöhe wäre nur zu treffen, wenn die Differenz exakt null
     wird, und ein Lauf, der sie verfehlt, meldete „keine Stelle“ — die
     schädlichste aller Antworten, siehe oben. Der Sockel 1e-10 gilt, wo die
     Auslöschung nichts kostet, und ist die alte Schwelle für f = 0.

     Die Grenze verschiebt sich damit, sie verschwindet nicht: |f| geht
     weiterhin ein, nur eps-fach statt voll. Nachgemessen bei Bereich 4 mit
     x² + y² + c: bis c = 3·10¹¹ bleibt es eine Stelle, bei 10¹² zerfällt sie
     in acht — die Wand steht jetzt rund dreitausendmal weiter draußen als
     die 10⁸ von vorher.

     Ab etwa 10¹⁰ meldet die Stelle „unentschieden“ statt „Minimum“. Das ist
     kein Rest des alten Fehlers, sondern dieselbe Auslöschung eine Ebene
     tiefer: die zweiten Differenzen zählen 2h² = 5·10⁻⁷ gegen einen
     Zahlenabstand von rund 2·10⁻⁶ bei 10¹⁰, die Hesse-Matrix ist damit
     nicht mehr zu haben. „Unentschieden“ ist dort die richtige Auskunft. */
  var EPS = 2.220446049250313e-16;

  function nahGenug(d, h){
    return betrag(d) < Math.max(1e-10, 4 * EPS * Math.abs(d.f) / h);
  }

  /* Ein Lauf von einem Startpunkt aus. Liefert null, wenn er nicht
     konvergiert oder auf eine Polstelle trifft. Ob der Treffer noch im
     Suchbereich liegt, prüft dieser Lauf NICHT — das tut finde() beim
     Einsammeln. */
  function laufe(f, x, y, r, h){
    var lambda = 1e-3, schritt = 0;
    var d = ableitungen(f, x, y, h);
    if (!d) return null;
    var norm = betrag(d);

    while (schritt < 60) {
      if (nahGenug(d, h)) return { x: x, y: y, d: d };

      /* (H² + λI) · δ = −H · g, mit H symmetrisch, also HᵀH = H². */
      var a = d.fxx, b = d.fxy, c = d.fyy;
      var m11 = a * a + b * b + lambda;
      var m12 = a * b + b * c;
      var m22 = b * b + c * c + lambda;
      var r1  = -(a * d.gx + b * d.gy);
      var r2  = -(b * d.gx + c * d.gy);
      var nenner = m11 * m22 - m12 * m12;
      if (!isFinite(nenner) || Math.abs(nenner) < 1e-300) return null;

      var dx = ( m22 * r1 - m12 * r2) / nenner;
      var dy = (-m12 * r1 + m11 * r2) / nenner;
      var laenge = Math.sqrt(dx * dx + dy * dy);
      if (!isFinite(laenge)) return null;
      if (laenge > r / 2) { dx *= (r / 2) / laenge; dy *= (r / 2) / laenge; }

      var nd = ableitungen(f, x + dx, y + dy, h);
      var nnorm = nd ? betrag(nd) : Infinity;

      if (nd && nnorm < norm) {
        x = x + dx; y = y + dy; d = nd; norm = nnorm;
        lambda = lambda / 10;
        if (lambda < 1e-12) lambda = 1e-12;
      } else {
        lambda = lambda * 10;
        if (lambda > 1e12) return null;
      }
      schritt++;
    }
    return nahGenug(d, h) ? { x: x, y: y, d: d } : null;
  }

  /* Das Schulkriterium. Die Schwelle wird zuerst geprüft: eine
     Determinante nahe null entscheidet nichts, auch wenn ihr Vorzeichen
     zufällig positiv ist. */
  function einordnen(d){
    var det = d.fxx * d.fyy - d.fxy * d.fxy;
    var skala = Math.max(1, d.fxx * d.fxx, d.fyy * d.fyy, d.fxy * d.fxy);
    if (Math.abs(det) < 1e-7 * skala) return { det: det, art: 'unentschieden' };
    if (det > 0) return { det: det, art: d.fxx > 0 ? 'minimum' : 'maximum' };
    return { det: det, art: 'sattel' };
  }

  function finde(f, bereich){
    var r = bereich, h = 1e-4 * (1 + r);
    var roh = [], i, j, t;

    for (i = 1; i <= 13; i++) {
      for (j = 1; j <= 13; j++) {
        t = laufe(f, -r + 2 * r * i / 14, -r + 2 * r * j / 14, r, h);
        if (!t) continue;
        if (t.x < -r || t.x > r || t.y < -r || t.y > r) continue;
        roh.push(t);
      }
    }

    /* Zusammenfassen nach echtem Abstand, nicht nach Kästchen um jeden
       Punkt — über die Diagonale wäre ein Kästchenvergleich um den
       Faktor Wurzel 2 zu großzügig.

       Die Toleranz ist 2h, die doppelte Differenzenschrittweite, und
       sonst nichts. Weiter reicht die Aussagekraft dieser Rechnung nicht:
       unterhalb von h sind alle Ableitungen über diese Länge gemittelt,
       zwei Stellen darunter kann das Verfahren nicht trennen. Die Spec
       hält genau das unter „Grenzen“ fest.

       Eine feinere Toleranz behauptet eine Genauigkeit, die es nicht
       gibt, und sie kostet etwas: an einer entarteten Stelle — x⁴ + y⁴,
       x³ + y³, x³ − 3xy² — ist die Hesse-Matrix im Nullpunkt selbst
       null, der Gradient fällt nur kubisch, und die Läufe bleiben über
       einen ganzen Ball vom Radius einiger h verstreut stehen. Mit der
       früheren festen Toleranz 1e-6·(1+r), hundertmal feiner als h,
       zerfiel eine solche Stelle in bis zu acht angebliche Stellen.

       Früher stand hier zusätzlich eine aus den Eigenwerten von H
       geschätzte Unschärfe, gedeckelt bei 2h. Sie ist entfallen: die
       Schätzung konnte die Toleranz nur UNTER 2h drücken, gebraucht wird
       aber genau die andere Richtung — bei x⁴ + y⁴ schätzte sie 9e-5,
       während die Treffer 7e-4 auseinanderlagen. Neben 2h wäre sie ohne
       jede Wirkung geblieben.

       Von zwei Treffern, die als dieselbe Stelle gelten, gewinnt der mit
       dem kleineren Gradientenbetrag, nicht der zuerst gefundene: trifft
       das Raster die Stelle selbst, wie bei x⁴ + y⁴ den Startpunkt
       (0|0), überlebt dieser exakte Treffer. */
    var eps = 2 * h, gewaehlt = [], k, m, treffer, dx, dy, abstand;
    for (k = 0; k < roh.length; k++) {
      treffer = -1;
      for (m = 0; m < gewaehlt.length; m++) {
        dx = gewaehlt[m].x - roh[k].x;
        dy = gewaehlt[m].y - roh[k].y;
        abstand = Math.sqrt(dx * dx + dy * dy);
        if (abstand < eps) { treffer = m; break; }
      }
      if (treffer < 0) {
        gewaehlt.push(roh[k]);
      } else if (betrag(roh[k].d) < betrag(gewaehlt[treffer].d)) {
        gewaehlt[treffer] = roh[k];
      }
    }

    var stellen = [], e;
    for (k = 0; k < gewaehlt.length; k++) {
      e = einordnen(gewaehlt[k].d);
      stellen.push({
        x: gewaehlt[k].x, y: gewaehlt[k].y, z: gewaehlt[k].d.f,
        fxx: gewaehlt[k].d.fxx, fxy: gewaehlt[k].d.fxy, fyy: gewaehlt[k].d.fyy,
        det: e.det, art: e.art
      });
    }

    stellen.sort(function(p, q){ return (p.x - q.x) || (p.y - q.y); });

    /* amRand vor dem Abschneiden auf acht Stellen prüfen — sonst kann
       eine weggeschnittene Stelle die Randwarnung nicht mehr auslösen. */
    var amRand = false;
    for (k = 0; k < stellen.length; k++) {
      if (r - Math.abs(stellen[k].x) < 0.1 * r ||
          r - Math.abs(stellen[k].y) < 0.1 * r) amRand = true;
    }

    var kurvenfall = stellen.length > 8;
    if (kurvenfall) stellen = stellen.slice(0, 8);

    return { stellen: stellen, bereich: r, amRand: amRand, kurvenfall: kurvenfall };
  }

  MT.extrema = { finde: finde };
})();
