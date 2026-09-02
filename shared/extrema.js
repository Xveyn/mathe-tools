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

    /* Die Zusammenfass-Toleranz darf nicht schärfer sein als die
       Auflösung der numerischen Differentiation: an einer entarteten
       Stelle (z. B. x^4 + y^4, wo der Gradient wie x^3 verschwindet)
       bricht der Lauf schon ab, wenn der Gradient unterhalb der
       Konvergenzschwelle liegt, und das kann je nach Startpunkt an
       leicht verschiedenen Stellen sein, die aber alle näher beieinander
       liegen als h — Positionen feiner als h aufzulösen ist mit
       Differenzenquotienten der Schrittweite h ohnehin nicht möglich. */
    var eps = h, stellen = [], k, m, neu, e;
    for (k = 0; k < roh.length; k++) {
      neu = true;
      for (m = 0; m < stellen.length; m++) {
        if (Math.abs(stellen[m].x - roh[k].x) < eps &&
            Math.abs(stellen[m].y - roh[k].y) < eps) { neu = false; break; }
      }
      if (!neu) continue;
      e = einordnen(roh[k].d);
      stellen.push({
        x: roh[k].x, y: roh[k].y, z: roh[k].d.f,
        fxx: roh[k].d.fxx, fxy: roh[k].d.fxy, fyy: roh[k].d.fyy,
        det: e.det, art: e.art
      });
    }

    stellen.sort(function(p, q){ return (p.x - q.x) || (p.y - q.y); });

    var kurvenfall = stellen.length > 8;
    if (kurvenfall) stellen = stellen.slice(0, 8);

    var amRand = false;
    for (k = 0; k < stellen.length; k++) {
      if (r - Math.abs(stellen[k].x) < 0.1 * r ||
          r - Math.abs(stellen[k].y) < 0.1 * r) amRand = true;
    }

    return { stellen: stellen, bereich: r, amRand: amRand, kurvenfall: kurvenfall };
  }

  MT.extrema = { finde: finde };
})();
