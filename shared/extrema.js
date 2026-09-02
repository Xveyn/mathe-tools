/* MT.extrema — stationäre Stellen einer Funktion zweier Veränderlicher
   suchen und über die Hesse-Matrix einordnen.

   Gesucht wird mit gedämpftem Levenberg-Marquardt, nicht mit Newton:
   bei f(x,y) = x² + y² - 2xy + 1 ist die Hesse-Matrix überall exakt
   singulär, obwohl der Gradient auf der ganzen Geraden y = x
   verschwindet. Newton bräche dort an jedem Startpunkt ab und meldete
   fälschlich, es gebe keine stationäre Stelle. */
var MT = MT || {};
(function(){
  "use strict";

  /* Zentrale Differenzen. Liefert null, sobald ein Wert nicht endlich
     ist — das ist der Polstellenfall. */
  function ableitungen(f, x, y, h){
    var f0  = f(x, y);
    var fpx = f(x + h, y),     fmx = f(x - h, y);
    var fpy = f(x, y + h),     fmy = f(x, y - h);
    var fpp = f(x + h, y + h), fpm = f(x + h, y - h);
    var fmp = f(x - h, y + h), fmm = f(x - h, y - h);
    var d = {
      f:   f0,
      gx:  (fpx - fmx) / (2 * h),
      gy:  (fpy - fmy) / (2 * h),
      fxx: (fpx - 2 * f0 + fmx) / (h * h),
      fyy: (fpy - 2 * f0 + fmy) / (h * h),
      fxy: (fpp - fpm - fmp + fmm) / (4 * h * h)
    };
    var k;
    for (k in d) { if (!isFinite(d[k])) return null; }
    return d;
  }

  function betrag(d){ return Math.sqrt(d.gx * d.gx + d.gy * d.gy); }

  function nahGenug(d){ return betrag(d) < 1e-10 * (1 + Math.abs(d.f)); }

  /* Ein Lauf von einem Startpunkt aus. Liefert null, wenn er nicht
     konvergiert, aus dem Bereich läuft oder auf eine Polstelle trifft. */
  function laufe(f, x, y, r, h){
    var lambda = 1e-3, schritt = 0;
    var d = ableitungen(f, x, y, h);
    if (!d) return null;
    var norm = betrag(d);

    while (schritt < 60) {
      if (nahGenug(d)) return { x: x, y: y, d: d };

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
    return nahGenug(d) ? { x: x, y: y, d: d } : null;
  }

  /* Wie unscharf die Lage einer gefundenen Stelle ist: die Konvergenz
     bricht ab, sobald der Gradient unter die Schranke tau fällt, und aus
     |g| < tau folgt über die Hesse-Matrix nur |Abstand zur wahren
     Stelle| ≲ tau / |Krümmung|. Maßgeblich ist dabei die WEICHSTE
     Richtung, also der betragskleinere der beiden Eigenwerte von H, nicht
     der größte Matrixeintrag — bei H = [[1,0],[0,1]] ist nichts weich,
     obwohl fxy = 0 wäre. Ist die weichste Richtung fast flach (entartete
     Stelle wie bei x^4 + y^4), wird die Unschärfe groß. Gedeckelt wird bei
     2h: jenseits der doppelten Differenzenschrittweite tastet der zweite
     Differenzenquotient gar nichts mehr über diese Stelle aus, seine Werte
     sind dort bedeutungslos — weiter darf keine Toleranz reichen, egal wie
     flach die Stelle ist. Ohne diese Deckelung würde bei einer exakt
     singulären Hesse-Matrix (der Geradenfall x² + y² − 2xy + 1, Eigenwerte
     4 und exakt 0) die Unschärfe unendlich, und die ganze Gerade schrumpfte
     fälschlich auf einen einzigen Punkt zusammen. */
  function unschaerfe(d, h){
    var a = d.fxx, b = d.fxy, c = d.fyy;
    var spur = a + c;
    var wurzel = Math.sqrt((a - c) * (a - c) + 4 * b * b);
    var ew1 = (spur + wurzel) / 2;
    var ew2 = (spur - wurzel) / 2;
    var weich = Math.min(Math.abs(ew1), Math.abs(ew2));
    var sehrKlein = 1e-300;
    var tau = 1e-10 * (1 + Math.abs(d.f));
    return Math.min(tau / Math.max(weich, sehrKlein), 2 * h);
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
       Faktor Wurzel 2 zu großzügig. Eine feste Toleranz kann nicht beide
       Fälle bedienen: bei einer entarteten Stelle (z. B. x^4 + y^4)
       bleiben Läufe weit verstreut stehen und müssen zusammengefasst
       werden; bei zwei echten, nahe beieinanderliegenden Stellen (Sattel
       zwischen zwei Minima) treffen die Läufe genau, und Zusammenfassen
       würde die eine oder andere verschlucken. Die Toleranz für ein
       Paar ist deshalb das Größere aus dem festen Spec-Wert eps und der
       Unschärfe beider Treffer — ist einer der beiden entartet, ist die
       Stelle unscharf, egal wie genau der andere sitzt. Von zwei
       Treffern, die so als dieselbe Stelle gelten, gewinnt der mit dem
       kleineren Gradientenbetrag, nicht der zuerst gefundene — sonst
       kann ein schlechter konvergierter Lauf einen exakten verdrängen,
       etwa wenn das Raster selbst die stationäre Stelle trifft, wie bei
       x^4 + y^4 den Startpunkt (0|0). */
    var eps = 1e-6 * (1 + r), gewaehlt = [], k, m, treffer, dx, dy, abstand, toleranz;
    for (k = 0; k < roh.length; k++) {
      treffer = -1;
      for (m = 0; m < gewaehlt.length; m++) {
        dx = gewaehlt[m].x - roh[k].x;
        dy = gewaehlt[m].y - roh[k].y;
        abstand = Math.sqrt(dx * dx + dy * dy);
        toleranz = Math.max(eps, unschaerfe(gewaehlt[m].d, h), unschaerfe(roh[k].d, h));
        if (abstand < toleranz) { treffer = m; break; }
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
