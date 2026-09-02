/* MT.dgl — lineare Differentialgleichungen zweiter Ordnung mit konstanten
   Koeffizienten: y'' + a·y' + b·y = s(x).

   Alles hier ist geschlossen lösbar. Es wird nirgends numerisch
   differenziert und nirgends integriert -- das ist eine Randbedingung der
   Spec, keine Vorliebe: eine Ableitung, die man ausrechnen kann, wird
   ausgerechnet. */
var MT = MT || {};
MT.dgl = (function(){
  "use strict";

  /* Ein Polynom ist ein Koeffizientenarray: [c0, c1, c2] meint
     c0 + c1*x + c2*x^2. */
  function ableiten(p){
    var q = [], i;
    for (i = 1; i < p.length; i++) q.push(i * p[i]);
    if (!q.length) q = [0];
    return q;
  }

  function werten(p, x){
    var s = 0, i;
    for (i = p.length - 1; i >= 0; i--) s = s * x + p[i];
    return s;
  }

  /* Gauss mit Spaltenpivotisierung. n bleibt klein (hoechstens sechs).
     Eigene Fassung: das solve des Flaechenrechners wird nicht geteilt,
     weil das die Seite anfassen hiesse, die unter Bildvergleich steht --
     siehe Spec, Abschnitt "Ein kleines Gauss-Verfahren, zum zweiten Mal". */
  function loeseSystem(M, r, n){
    var i, j, k, gross, tausch, faktor, x = [], summe;
    for (i = 0; i < n; i++){
      gross = i;
      for (j = i + 1; j < n; j++){
        if (Math.abs(M[j][i]) > Math.abs(M[gross][i])) gross = j;
      }
      if (Math.abs(M[gross][i]) < 1e-12) return null;
      tausch = M[i]; M[i] = M[gross]; M[gross] = tausch;
      tausch = r[i]; r[i] = r[gross]; r[gross] = tausch;
      for (j = i + 1; j < n; j++){
        faktor = M[j][i] / M[i][i];
        for (k = i; k < n; k++) M[j][k] -= faktor * M[i][k];
        r[j] -= faktor * r[i];
      }
    }
    for (i = n - 1; i >= 0; i--){
      summe = r[i];
      for (j = i + 1; j < n; j++) summe -= M[i][j] * x[j];
      x[i] = summe / M[i][i];
    }
    return x;
  }

  /* Ein leeres Zahlenfeld im Werkzeug liefert NaN, und NaN faellt an jeder
     Vergleichsoperation stillschweigend durch -- ohne diese Wache landet
     es zum Beispiel im komplexen Fall, mit selbstbewusstem D=NaN. Darum
     wird hier geprueft statt gerechnet. */
  function pruefeZahl(x, bezeichnung){
    if (!isFinite(x)) throw new Error(bezeichnung + ' muss eine endliche Zahl sein.');
  }
  function pruefeGliedZahl(x, name, nummer){
    if (!isFinite(x)) throw new Error('Das ' + nummer + '. Glied hat kein endliches ' + name + '.');
  }

  /* Was als null gilt. Ohne eine Schwelle traefe man den aperiodischen
     Grenzfall mit getippten Zahlen so gut wie nie. */
  function schwelle(a, b){
    return 1e-9 * Math.max(1, a * a, Math.abs(b));
  }

  function homogen(a, b){
    var D = a * a - 4 * b;
    if (Math.abs(D) < schwelle(a, b)) D = 0;

    if (D > 0){
      /* Mitternachtsformel loescht aus, wenn a und die Wurzel fast gleich
         gross sind. Die nicht-ausloeschende Wurzel direkt rechnen, die
         andere ueber Vieta (l1*l2=b) -- und dabei l1 immer die groessere
         Wurzel bleiben lassen, denn die Reihenfolge traegt (Anfangswerte,
         siehe MT.dgl Aufgabe D10). */
      var w = Math.sqrt(D), l1, l2;
      if (a <= 0){ l1 = (-a + w) / 2; l2 = b / l1; }
      else       { l2 = (-a - w) / 2; l1 = b / l2; }
      return {
        fall: 'zwei-reelle', diskriminante: D, wurzeln: [l1, l2],
        basis: [ function(x){ return Math.exp(l1 * x); },
                 function(x){ return Math.exp(l2 * x); } ],
        ableitung: [ function(x){ return l1 * Math.exp(l1 * x); },
                     function(x){ return l2 * Math.exp(l2 * x); } ],
        beiNull: [[1, 1], [l1, l2]]
      };
    }
    if (D === 0){
      var l = -a / 2;
      return {
        fall: 'doppelt', diskriminante: 0, wurzeln: [l],
        basis: [ function(x){ return Math.exp(l * x); },
                 function(x){ return x * Math.exp(l * x); } ],
        ableitung: [ function(x){ return l * Math.exp(l * x); },
                     function(x){ return (1 + l * x) * Math.exp(l * x); } ],
        beiNull: [[1, 0], [l, 1]]
      };
    }
    var delta = a / 2, om = Math.sqrt(-D) / 2;
    return {
      fall: 'komplex', diskriminante: D, wurzeln: { re: -delta, im: om },
      basis: [ function(x){ return Math.exp(-delta * x) * Math.cos(om * x); },
               function(x){ return Math.exp(-delta * x) * Math.sin(om * x); } ],
      ableitung: [
        function(x){
          return Math.exp(-delta * x) * (-delta * Math.cos(om * x) - om * Math.sin(om * x));
        },
        function(x){
          return Math.exp(-delta * x) * (om * Math.cos(om * x) - delta * Math.sin(om * x));
        }
      ],
      beiNull: [[1, 0], [-delta, om]]
    };
  }

  /* Ein Glied der Bauart q(x)*e^(mu*x).

     Die Substitution y = u(x)*e^(mu*x) fuehrt auf
        u'' + p'(mu)*u' + p(mu)*u = P(x)
     mit p(lambda) = lambda^2 + a*lambda + b. Die Resonanz-Vielfachheit k
     ist die Vielfachheit von mu als Wurzel: p(mu) = 0 heisst mindestens
     einfach, zusaetzlich p'(mu) = 0 heisst doppelt. */
  function teilPolyexp(a, b, glied, nummer){
    var mu = glied.mu, P = glied.koeff, idx;
    if (!P || !P.length) throw new Error('Das ' + nummer + '. Glied hat keine Koeffizienten.');
    pruefeGliedZahl(mu, 'μ', nummer);
    for (idx = 0; idx < P.length; idx++){
      if (!isFinite(P[idx])) throw new Error('Das ' + nummer + '. Glied hat im ' + (idx + 1) + '. Koeffizienten keine endliche Zahl.');
    }

    var s = schwelle(a, b);
    var pMu = mu * mu + a * mu + b;
    var pStrich = 2 * mu + a;
    var k = 0;
    if (Math.abs(pMu) < s) k = (Math.abs(pStrich) < s) ? 2 : 1;

    var n = P.length - 1;      // Grad des Polynomfaktors
    var anzahl = n + 1;        // Unbekannte: A_k bis A_(n+k)
    var M = [], r = [], g, i, j;
    for (g = 0; g < anzahl; g++){
      M.push([]);
      for (i = 0; i < anzahl; i++) M[g].push(0);
      r.push(g < P.length ? P[g] : 0);
    }
    /* Spalte i gehoert zu A_(k+i), Zeile g zum Koeffizienten von x^g. */
    for (i = 0; i < anzahl; i++){
      j = k + i;
      if (j < anzahl)               M[j][i]     += pMu;
      if (j - 1 >= 0 && j - 1 < anzahl) M[j - 1][i] += pStrich * j;
      if (j - 2 >= 0 && j - 2 < anzahl) M[j - 2][i] += j * (j - 1);
    }
    var A = loeseSystem(M, r, anzahl);
    if (!A) throw new Error('Das ' + nummer + '. Glied führt auf ein unlösbares System.');

    var v = [];
    for (g = 0; g < k; g++) v.push(0);
    for (i = 0; i < anzahl; i++) v.push(A[i]);
    var vs = ableiten(v), vss = ableiten(vs);

    return {
      art: 'polyexp', k: k, mu: mu, koeff: A, ansatzGrad: n + k,
      fn: function(x){ return werten(v, x) * Math.exp(mu * x); },
      fnEins: function(x){
        return (werten(vs, x) + mu * werten(v, x)) * Math.exp(mu * x);
      },
      fnZwei: function(x){
        return (werten(vss, x) + 2 * mu * werten(vs, x) + mu * mu * werten(v, x))
               * Math.exp(mu * x);
      }
    };
  }

  /* Ein Glied der Bauart c*cos(omega*x) + d*sin(omega*x).
     Resonanz genau dann, wenn a = 0 UND b = omega^2 -- nur dann sind
     +-i*omega Wurzeln. */
  function teilHarmonisch(a, b, glied, nummer){
    var om = glied.omega, c = glied.c, d = glied.d;
    if (!(isFinite(om) && om > 0)) throw new Error('Das ' + nummer + '. Glied braucht ein endliches ω größer null.');
    pruefeGliedZahl(c, 'c', nummer);
    pruefeGliedZahl(d, 'd', nummer);

    var s = schwelle(a, b);
    var A, B, k;

    if (Math.abs(a) < s && Math.abs(b - om * om) < s){
      k = 1;
      A = -d / (2 * om);
      B =  c / (2 * om);
      return {
        art: 'harmonisch', k: k, omega: om, koeff: [A, B], ansatzGrad: k,
        fn: function(x){
          return x * (A * Math.cos(om * x) + B * Math.sin(om * x));
        },
        fnEins: function(x){
          return (A * Math.cos(om * x) + B * Math.sin(om * x))
               + x * om * (B * Math.cos(om * x) - A * Math.sin(om * x));
        },
        fnZwei: function(x){
          return 2 * om * (B * Math.cos(om * x) - A * Math.sin(om * x))
               - x * om * om * (A * Math.cos(om * x) + B * Math.sin(om * x));
        }
      };
    }

    k = 0;
    var e = b - om * om, f = a * om, det = e * e + f * f;
    if (det < 1e-300) throw new Error('Das ' + nummer + '. Glied führt auf ein unlösbares System.');
    A = (c * e - d * f) / det;
    B = (c * f + d * e) / det;
    return {
      art: 'harmonisch', k: k, omega: om, koeff: [A, B], ansatzGrad: k,
      fn: function(x){ return A * Math.cos(om * x) + B * Math.sin(om * x); },
      fnEins: function(x){ return om * (B * Math.cos(om * x) - A * Math.sin(om * x)); },
      fnZwei: function(x){ return -om * om * (A * Math.cos(om * x) + B * Math.sin(om * x)); }
    };
  }

  function loese(a, b, glieder, anfang){
    pruefeZahl(a, 'a');
    pruefeZahl(b, 'b');

    var h = homogen(a, b), teile = [], i, g;
    glieder = glieder || [];
    for (i = 0; i < glieder.length; i++){
      g = glieder[i];
      if (g.art === 'polyexp')          teile.push(teilPolyexp(a, b, g, i + 1));
      else if (g.art === 'harmonisch')  teile.push(teilHarmonisch(a, b, g, i + 1));
      else throw new Error('Unbekannte Bauart "' + g.art + '" im ' + (i + 1) + '. Glied.');
    }

    function summe(name){
      return function(x){
        var s = 0, j;
        for (j = 0; j < teile.length; j++) s += teile[j][name](x);
        return s;
      };
    }
    var yp = summe('fn'), ypEins = summe('fnEins'), ypZwei = summe('fnZwei');

    var konstanten = null;
    if (anfang){
      pruefeZahl(anfang.y0, "Der Anfangswert y(0)");
      pruefeZahl(anfang.y0strich, "Der Anfangswert y'(0)");
      konstanten = loeseSystem(
        [[h.beiNull[0][0], h.beiNull[0][1]], [h.beiNull[1][0], h.beiNull[1][1]]],
        [anfang.y0 - yp(0), anfang.y0strich - ypEins(0)], 2);
    }

    function yh(x){
      if (!konstanten) return 0;
      return konstanten[0] * h.basis[0](x) + konstanten[1] * h.basis[1](x);
    }

    return {
      polynom: { a: a, b: b, diskriminante: h.diskriminante },
      fall: h.fall,
      wurzeln: h.wurzeln,
      homogen: { basis: h.basis, ableitung: h.ableitung },
      teile: teile,
      konstanten: konstanten,
      yh: yh,
      yp: yp,
      ypEins: ypEins,
      ypZwei: ypZwei,
      y: function(x){ return yh(x) + yp(x); }
    };
  }

  return { loese: loese };
})();
