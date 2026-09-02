# Schwingungsrechner Implementierungsplan

> **Für agentische Ausführung:** ERFORDERLICHE SUB-SKILL: `superpowers:subagent-driven-development` (empfohlen) oder `superpowers:executing-plans`, um diesen Plan Aufgabe für Aufgabe abzuarbeiten. Die Schritte nutzen Checkbox-Syntax (`- [ ]`).

**Ziel:** Kapitel 2 abschließen — ein Baustein `shared/dgl.js` löst `y'' + a·y' + b·y = s(x)` geschlossen, ein zweites Werkzeug unter `tools/schwingung/` zeigt Rechenweg und Kurven, und `karten/differentialgleichungen.html` erklärt die drei Fälle, den Ansatz und die Resonanz.

**Architektur:** Wie bisher reines HTML/CSS/JS ohne Build. Der Baustein hängt an `MT`, ist von den übrigen `shared/*.js` unabhängig und wird vom Werkzeug nur aufgerufen. Alles ist geschlossen lösbar; **nirgends wird numerisch differenziert oder integriert**.

**Tech Stack:** HTML5, MathML, Inline-SVG, Canvas, CSS Custom Properties, ES5-JavaScript (`var`, IIFE, `"use strict"`). Keine Abhängigkeiten. Prüfung mit Playwright über die `mcp__playwright-edge__*`-Werkzeuge und mit Node für die Rechenprobe.

**Spec:** `docs/superpowers/specs/2026-09-02-schwingung-design.md` — bindend, vor der ersten Aufgabe zu lesen.
**Repoweite Regeln:** `CLAUDE.md` im Wurzelverzeichnis — bindend für jede Aufgabe.

---

## Globale Randbedingungen

Gelten für **jede** Aufgabe. Die Langfassung steht in `CLAUDE.md`.

- **Kein Build.** Kein npm, kein Bundler, keine `package.json`.
- **Keine ES-Module.** Klassische `<script src="…">` ohne `type="module"`.
- **Doppelklick muss funktionieren**, gleichrangig neben GitHub Pages.
- **Keine externen Abhängigkeiten**, keine CDN-Ressourcen, keine Fremdschriften.
- **Alle Pfade relativ**, niemals mit führendem `/`. Links zeigen auf `index.html`, nie auf ein Verzeichnis.
- **ES5-artiger Stil:** `var`, IIFE, `"use strict"`. Kein `let`, kein `const`, keine Pfeilfunktionen, keine Template-Literale — auch nicht in Kommentaren.
- **Deutsch** in Oberfläche, Kommentaren, lokalen Namen und Commit-Nachrichten. **Nicht** an der geteilten Schnittstelle: dort gilt die eingeführte Schreibweise (`MT.dgl.loese`).
- **Keine Farbliterale** in einer Seite, auch nicht im SVG und nicht auf einem Canvas — Farben kommen über `MT.canvas.colors()` beziehungsweise als `var(--…)`.
- **Namensraum:** `.karte` = Karteikarte, `.kachel` = Katalogeintrag, `.tafel` = Zeichentafel eines Werkzeugs, `.ansichten` = deren Raster, `.regler` = Textklasse für einen Reglernamen auf einer Karte.
- **Nirgends numerisch differenzieren.** Jede Ableitung liegt geschlossen vor.
- **Keine Testdateien, keine CI.** Geprüft wird am laufenden Bild und mit Node über eine Probedatei außerhalb des Repos.
- **Kein URL-Zustand.** Kein `?f=…`.
- **Commit-Nachrichten** enden mit:
  ```
  Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_015eu53ekZCtxxweevNNDJa6
  ```

## Kürzel

| Kürzel | Bedeutung |
|---|---|
| REPO | das Repo-Verzeichnis |
| SCRATCH | ein Arbeitsverzeichnis außerhalb des Repos |

**Der Flächenrechner wird in dieser Runde nicht angefasst.** Prüfroutine P entfällt vollständig.

## Rechenprobe D

Der Testzyklus für den Baustein. Keine Testdatei im Repo — geprüft wird mit Node über eine Probedatei in SCRATCH, weil `shared/dgl.js` keine DOM-Abhängigkeit hat.

Alle Sollwerte sind von Hand gerechnet und jede partikuläre Lösung wurde durch Einsetzen bestätigt.

| Nr | Gleichung | Aufgabe | Erwartet |
|---|---|---|---|
| D1 | `y'' − y = 0` | D 14a | `D = 4`, `zwei-reelle`, `λ = ±1` |
| D2 | `y'' + 4y' + 13y = 0` | D 14g | `D = −36`, `komplex`, Realteil `−2`, `ω = 3` |
| D3 | `y'' + 2y' + y = 0` | D 14c | `D = 0`, `doppelt`, `λ = −1` |
| D4 | `y'' + 4y' + 5y = 5x² − 32x + 5` | D 15b | `k = 0`, `y_p = x² − 8x + 7` |
| D5 | `y'' + 2y' + 5y = sin 2x` | D 15c | keine Resonanz, `A = −4/17 ≈ −0,23529`, `B = 1/17 ≈ 0,05882` |
| D6 | `y'' + 2y' + y = 6x·e^(−x)` | D 15a | **`k = 2`**, `y_p = x³·e^(−x)` |
| D7 | `y'' + y' − 2y = −x·e^x` | D 2g | **`k = 1`**, `y_p = (x/9 − x²/6)·e^x` |
| D8 | `y'' + 9y = sin 3x` | D 9, ω₀=3, c=1 | **harmonische Resonanz**, `y_p = −(1/6)·x·cos 3x` |
| D9 | `y'' + 10y' + 25y = cos 5x + 2` | D 10 | **Summe zweier Glieder**, `y_p = (1/50)·sin 5x + 2/25` |
| D10 | `y'' + 7y' + 10y = 6e^(−4x)` | D 12 | `k = 0`, `y_p = −3e^(−4x)` |
| D11 | `y'' + 10y' + 10000y = 0` | D 5 | `komplex`, Realteil `−5`, `ω = √9975 ≈ 99,875` |

**D6, D7 und D8 sind die wichtigsten Zeilen.** Sie sind die drei Resonanzfälle — doppelt, einfach, harmonisch. Eine Fassung, die sie nicht trifft, ist unbrauchbar, auch wenn alle übrigen stimmen.

**Zusätzlich die Einsetzprobe für jede Zeile.** Für jede berechnete partikuläre Lösung wird

```
y_p''(x) + a·y_p'(x) + b·y_p(x) − s(x)
```

an mindestens neun Stellen im Bereich −2 … 2 ausgewertet; der Betrag muss unter `1e-9` liegen. Das prüft die Ansatz**form** mit, nicht nur die Koeffizienten, und taugt auch für Fälle außerhalb der Tabelle.

---

### Aufgabe 1: Der Baustein `shared/dgl.js`

Ziel: Ein geprüfter Löser, den noch keine Seite benutzt.

**Dateien:**
- Anlegen: `shared/dgl.js`
- Anlegen (außerhalb des Repos, nie committet): `<SCRATCH>/probe-dgl.js`

**Schnittstellen:**
- Nutzt: nichts. Der Baustein ist von den übrigen `shared/*.js` unabhängig.
- Liefert: `MT.dgl.loese(a, b, glieder, anfang)` → siehe Rückgabe unten.

- [ ] **Schritt 1: `shared/dgl.js` schreiben**

Vollständiger Inhalt:

```js
/* MT.dgl — lineare Differentialgleichungen zweiter Ordnung mit konstanten
   Koeffizienten: y'' + a·y' + b·y = s(x).

   Alles hier ist geschlossen lösbar. Es wird nirgends numerisch
   differenziert und nirgends integriert -- das ist eine Randbedingung der
   Spec, keine Vorliebe: eine Ableitung, die man ausrechnen kann, wird
   ausgerechnet. */
var MT = MT || {};
(function(){
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

  /* Was als null gilt. Ohne eine Schwelle traefe man den aperiodischen
     Grenzfall mit getippten Zahlen so gut wie nie. */
  function schwelle(a, b){
    return 1e-9 * Math.max(1, a * a, Math.abs(b));
  }

  function homogen(a, b){
    var D = a * a - 4 * b;
    if (Math.abs(D) < schwelle(a, b)) D = 0;

    if (D > 0){
      var w = Math.sqrt(D), l1 = (-a + w) / 2, l2 = (-a - w) / 2;
      return {
        fall: 'zwei-reelle', diskriminante: D, wurzeln: [l1, l2],
        basis: [ function(x){ return Math.exp(l1 * x); },
                 function(x){ return Math.exp(l2 * x); } ],
        beiNull: [[1, 1], [l1, l2]]
      };
    }
    if (D === 0){
      var l = -a / 2;
      return {
        fall: 'doppelt', diskriminante: 0, wurzeln: [l],
        basis: [ function(x){ return Math.exp(l * x); },
                 function(x){ return x * Math.exp(l * x); } ],
        beiNull: [[1, 0], [l, 1]]
      };
    }
    var delta = a / 2, om = Math.sqrt(-D) / 2;
    return {
      fall: 'komplex', diskriminante: D, wurzeln: { re: -delta, im: om },
      basis: [ function(x){ return Math.exp(-delta * x) * Math.cos(om * x); },
               function(x){ return Math.exp(-delta * x) * Math.sin(om * x); } ],
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
    var mu = glied.mu, P = glied.koeff;
    if (!P || !P.length) throw new Error('Das ' + nummer + '. Glied hat keine Koeffizienten.');

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
    if (!A) throw new Error('Das ' + nummer + '. Glied fuehrt auf ein unloesbares System.');

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
    if (!(om > 0)) throw new Error('Das ' + nummer + '. Glied braucht ein omega groesser null.');

    var s = schwelle(a, b);
    var A, B, k;

    if (Math.abs(a) < s && Math.abs(b - om * om) < s){
      k = 1;
      A = -d / (2 * om);
      B =  c / (2 * om);
      return {
        art: 'harmonisch', k: k, omega: om, koeff: [A, B],
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
    if (det < 1e-300) throw new Error('Das ' + nummer + '. Glied fuehrt auf ein unloesbares System.');
    A = (c * e - d * f) / det;
    B = (c * f + d * e) / det;
    return {
      art: 'harmonisch', k: k, omega: om, koeff: [A, B],
      fn: function(x){ return A * Math.cos(om * x) + B * Math.sin(om * x); },
      fnEins: function(x){ return om * (B * Math.cos(om * x) - A * Math.sin(om * x)); },
      fnZwei: function(x){ return -om * om * (A * Math.cos(om * x) + B * Math.sin(om * x)); }
    };
  }

  function loese(a, b, glieder, anfang){
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
      basis: h.basis,
      teile: teile,
      konstanten: konstanten,
      yh: yh,
      yp: yp,
      ypEins: ypEins,
      ypZwei: ypZwei,
      y: function(x){ return yh(x) + yp(x); }
    };
  }

  MT.dgl = { loese: loese };
})();
```

**Zur zweiten Ableitung `ypZwei`:** Die Spec nennt sie in der Rückgabe nicht. Sie ist hier ergänzt, weil die Einsetzprobe sie braucht — und ohne sie müsste ausgerechnet die Prüfung numerisch differenzieren, was die Spec verbietet. Drei Zeilen je Bauart, im Bericht als Abweichung zu nennen.

- [ ] **Schritt 2: Probedatei in SCRATCH anlegen**

Das Repo bekommt **keine** Testdatei. `<SCRATCH>/probe-dgl.js` lädt den Baustein und rechnet:

```js
global.MT = {};
eval(require('fs').readFileSync('<REPO>/shared/dgl.js', 'utf8'));

function zeile(nr, a, b, glieder, s, beschreibung){
  var e = MT.dgl.loese(a, b, glieder, null);
  var maxAbw = 0, i, x, rest;
  for (i = 0; i < 9; i++){
    x = -2 + i * 0.5;
    rest = e.ypZwei(x) + a * e.ypEins(x) + b * e.yp(x) - s(x);
    if (Math.abs(rest) > maxAbw) maxAbw = Math.abs(rest);
  }
  console.log(nr.padEnd(4) + beschreibung.padEnd(26)
    + ' Fall=' + e.fall.padEnd(12)
    + ' D=' + e.polynom.diskriminante.toFixed(4).padStart(12)
    + ' k=' + e.teile.map(function(t){ return t.k; }).join(',')
    + ' Einsetzprobe=' + maxAbw.toExponential(2));
}
```

Für die homogenen Zeilen D1, D2, D3 und D11 entfällt die Einsetzprobe (keine Glieder); dort werden Fall, Diskriminante und Wurzeln geprüft.

- [ ] **Schritt 3: Rechenprobe D durchführen**

Alle elf Zeilen der Tabelle oben. Die Glieder je Zeile:

| Nr | `a`, `b` | `glieder` |
|---|---|---|
| D1 | `0, -1` | `[]` |
| D2 | `4, 13` | `[]` |
| D3 | `2, 1` | `[]` |
| D4 | `4, 5` | `[{art:'polyexp', koeff:[5,-32,5], mu:0}]` |
| D5 | `2, 5` | `[{art:'harmonisch', c:0, d:1, omega:2}]` |
| D6 | `2, 1` | `[{art:'polyexp', koeff:[0,6], mu:-1}]` |
| D7 | `1, -2` | `[{art:'polyexp', koeff:[0,-1], mu:1}]` |
| D8 | `0, 9` | `[{art:'harmonisch', c:0, d:1, omega:3}]` |
| D9 | `10, 25` | `[{art:'harmonisch', c:1, d:0, omega:5}, {art:'polyexp', koeff:[2], mu:0}]` |
| D10 | `7, 10` | `[{art:'polyexp', koeff:[6], mu:-4}]` |
| D11 | `10, 10000` | `[]` |

Vergleiche jede Zeile gegen die Sollwerte und **zitiere die Ausgabe wörtlich im Bericht**. Die Einsetzprobe muss überall unter `1e-9` liegen.

Zusätzlich für D4, D6, D7, D8, D9, D10: die berechneten Koeffizienten gegen die Sollwerte der Tabelle halten. Bei D6 muss `k = 2` und der Ansatz `x²·(A₀ + A₁x)` sein, also `koeff = [0, 1]`.

- [ ] **Schritt 4: Anfangswerte prüfen**

Für D3 mit `anfang = {y0: 2, y0strich: -1}`: `y_h = (C₁ + C₂x)e^(−x)` mit `y(0) = C₁ = 2` und `y'(0) = −C₁ + C₂ = −1`, also `C₂ = 1`. Erwartet: `konstanten = [2, 1]`.

Für D10 mit `anfang = {y0: 0, y0strich: 0}`: `y_p(0) = −3`, `y_p'(0) = 12`. Also `C₁ + C₂ = 3` und `−2C₁ − 5C₂ = −12` (Wurzeln −2 und −5). Daraus `C₁ = 1`, `C₂ = 2`. Erwartet: `konstanten = [1, 2]` — **die Reihenfolge folgt der Reihenfolge der Wurzeln**, also `λ₁ = −2` zuerst, weil `(−a + √D)/2` die größere Wurzel liefert.

Prüfe zusätzlich, dass `y(0)` und die Ableitung bei null die Anfangswerte treffen: `e.y(0)` muss `y0` sein.

- [ ] **Schritt 5: Fehlerfälle prüfen**

Jeder muss werfen, mit deutscher Meldung:

```js
MT.dgl.loese(1, 1, [{art:'unfug'}], null)                          // unbekannte Bauart
MT.dgl.loese(1, 1, [{art:'polyexp', koeff:[], mu:0}], null)        // leere Koeffizienten
MT.dgl.loese(1, 1, [{art:'harmonisch', c:1, d:0, omega:0}], null)  // omega nicht positiv
```

- [ ] **Schritt 6: Controller-Kontrolle**

```bash
cd "<REPO>" && grep -nE "(^|[^a-zA-Z_.])(let|const)[ (]|=>|\`" shared/dgl.js ; echo "ES5-Kontrolle beendet"
```

Erwartet: keine Treffer.

- [ ] **Schritt 7: Commit**

```bash
cd "<REPO>" && git add shared/dgl.js && git commit -m "Baustein dgl: lineare DGL zweiter Ordnung geschlossen loesen" -m "Die rechte Seite ist eine Summe von Gliedern q(x)*e^(mu x) oder
c*cos+d*sin. Die Resonanz-Vielfachheit faellt aus der Substitution
y = u*e^(mu x) heraus: k ist die Vielfachheit von mu als Wurzel.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015eu53ekZCtxxweevNNDJa6"
```

`<SCRATCH>/probe-dgl.js` wird **nicht** committet. `git status --short` muss danach leer sein.

---

### Aufgabe 2: Werkzeugseite mit Eingaben und Textausgabe

Ziel: Man kann eine Gleichung eingeben und sieht den vollständigen Rechenweg als Text. Noch ohne Bild.

**Dateien:**
- Anlegen: `tools/schwingung/index.html`
- Anlegen: `tools/schwingung/schwingung.js`

**Schnittstellen:**
- Nutzt: `MT.dgl.loese` aus Aufgabe 1
- Liefert: die Seite, in die Aufgabe 3 die Zeichnung und Aufgabe 4 den Regler einhängt

- [ ] **Schritt 1: Seitengerüst**

`tools/schwingung/index.html` nach dem Muster von `tools/flaechenrechner/index.html`: `../../shared/theme.css`, `../../shared/ui.css`, `../../shared/karten.css` (für `.querlink` und `.seitenfuss`), Skripte am Ende des `<body>` — `../../shared/canvas.js`, `../../shared/plot2d.js`, `../../shared/dgl.js`, dann `schwingung.js`.

Lies die Werkzeugseite des Flächenrechners und übernimm ihren Aufbau: `.wrap`, `.lede`, die Bedienleiste, `.ansichten` mit `.tafel`, der Analysebereich, am Fuß die `.querlink`-Zeile.

- [ ] **Schritt 2: Eingaben**

Zahlenfelder mit `id` und Beschriftung:

- `a` und `b` der Gleichung
- die Glieder der rechten Seite: ein Auswahlfeld für die Bauart (`keine`, `polyexp`, `harmonisch`) und die zugehörigen Zahlenfelder. **Zwei Glieder genügen** — mehr braucht keine Aufgabe des Blattes, und D 10 ist das einzige mit zweien.
  - `polyexp`: μ und die Koeffizienten als Textfeld mit Komma getrennt, etwa `0, 6` für `6x`
  - `harmonisch`: c, d, ω
- `y(0)` und `y'(0)`, dazu ein Kästchen „Anfangswerte verwenden"

Beispiel-Chips wie beim Flächenrechner, mit mindestens diesen fünf:

| Beschriftung | Werte |
|---|---|
| (a) Schwingkreis | `a=10, b=10000`, keine Glieder, `y(0)=0.005`, `y'(0)=0` |
| (b) Kriechfall | `a=250, b=10000`, keine Glieder, `y(0)=0.005`, `y'(0)=0` |
| (c) Grenzfall | `a=200, b=10000`, keine Glieder, `y(0)=0.005`, `y'(0)=0` |
| (d) Resonanz | `a=0, b=9`, harmonisch `c=0, d=1, ω=3` |
| (e) doppelte Resonanz | `a=2, b=1`, polyexp `μ=−1`, Koeffizienten `0, 6` |

- [ ] **Schritt 3: Textausgabe**

Der Block arbeitet die Aufgabe der Reihe nach ab. Wortlaut ist Oberflächentext und damit Teil der Anforderung — diese Sätze wörtlich, Zahlen eingesetzt:

- **Charakteristisches Polynom:** `λ² + aλ + b`, dann `Diskriminante D = a² − 4b = …`
- **Der Fall**, je nach `fall`:
  - `zwei-reelle`: „Zwei verschiedene reelle Nullstellen — der Kriechfall. Die Lösung klingt ab, ohne zu schwingen."
  - `doppelt`: „Eine doppelte Nullstelle — der aperiodische Grenzfall. Der Faktor x gehört zur zweiten Basislösung."
  - `komplex`: „Ein Paar konjugiert komplexer Nullstellen — der Schwingfall. Der Realteil bestimmt das Abklingen, der Imaginärteil die Frequenz."
- **Die Wurzeln** mit Zahlenwerten, und `y_h` in der zum Fall passenden Form.
- **Je Glied der rechten Seite**, mit `k` aus `teile[i].k`:
  - bei `k = 0`: „Keine Resonanz: μ ist keine Nullstelle des charakteristischen Polynoms."
  - bei `k = 1`: „Einfache Resonanz: μ ist eine einfache Nullstelle. Der Ansatz wird mit x multipliziert."
  - bei `k = 2`: „Doppelte Resonanz: μ ist die doppelte Nullstelle. Der Ansatz wird mit x² multipliziert."
  - für ein harmonisches Glied mit `k = 1`: „Resonanz: ±iω sind Nullstellen, denn a = 0 und b = ω². Der Ansatz wird mit x multipliziert."
  - dazu die Ansatzform und die berechneten Koeffizienten
- **`y_p`** als Summe der Glieder
- **Die Konstanten** aus den Anfangswerten, oder ohne sie: „Ohne Anfangswerte bleiben C₁ und C₂ unbestimmt."

Wirft `MT.dgl.loese`, wird die Meldung im Analysebereich angezeigt und nichts gezeichnet.

Nutze die Bausteine aus `shared/ui.css`; braucht der Block eine eigene Klasse, gehört sie dorthin und der Name ist deutsch.

- [ ] **Schritt 4: Prüfen**

Seite über `file://` laden, `browser_resize` auf 1400 × 1000. Jeden der fünf Chips anklicken und den Text gegen die Rechenprobe D halten. **Zitiere den Text für die Chips (d) und (e) wörtlich im Bericht** — das sind die Resonanzfälle.

`browser_console_messages`: keine Meldung vom Typ `error`.

Zusätzlich einen Fehlerfall auslösen (ω auf 0 setzen) und belegen, dass die Meldung erscheint statt einer stillen leeren Ausgabe.

- [ ] **Schritt 5: Commit**

```bash
cd "<REPO>" && git add tools/schwingung/index.html tools/schwingung/schwingung.js && git commit -m "Schwingungsrechner: Eingaben und Rechenweg als Text" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015eu53ekZCtxxweevNNDJa6"
```

---

### Aufgabe 3: Die Zeichnung

Ziel: Man sieht, wie der homogene Anteil abklingt und der partikuläre bleibt.

**Dateien:**
- Ändern: `tools/schwingung/index.html` (die Zeichenfläche)
- Ändern: `tools/schwingung/schwingung.js`

- [ ] **Schritt 1: Achsen und Gitter**

Eine `.tafel` mit einem `<canvas>`. Zeitachse von `0` bis `T`, senkrechte Achse automatisch nach dem größten Betrag der drei Kurven im Zeitfenster, mit etwas Luft.

`T` wird aus der Aufgabe bestimmt, nicht geraten: im Schwingfall das Fünffache der Abklingzeit `1/δ`, mindestens fünf Perioden `2π/ω`; im Kriechfall das Fünffache von `1/|λ|` der betragskleineren Wurzel; bei doppelter Wurzel entsprechend. Enthält die rechte Seite ein harmonisches Glied, mindestens fünf seiner Perioden. Deckel bei `T = 100`.

Gitter, Achsen und Teilstriche über `MT.canvas.fit`, `MT.canvas.linear` und `MT.canvas.tickStep`, Farben über `MT.canvas.colors()` — wie in `drawSection` des Flächenrechners, aber als eigener Code in dieser Datei.

- [ ] **Schritt 2: Die drei Kurven**

- `y` in `gold`, Strichstärke 2,4
- `y_h` in `mint`, Strichstärke 1,2
- `y_p` in `rose`, Strichstärke 1,2

Gezeichnet mit `MT.plot2d.polyline`, 400 Stützstellen, Werte außerhalb des Fensters als `null` übergeben, damit die Linie unterbrochen wird.

Ohne Anfangswerte ist `y_h` nicht bestimmt: dann nur `y_p` zeichnen, und in die Zeichenfläche schreiben „Ohne Anfangswerte hängt der homogene Anteil von C₁ und C₂ ab und wird nicht gezeichnet."

- [ ] **Schritt 3: Legende**

Drei kurze Einträge unter der Zeichnung, jeweils ein Farbstrich und die Beschriftung `y`, `y_h`, `y_p`. Farben aus denselben Tokens. Keine Farbliterale.

- [ ] **Schritt 4: Sichtprüfung**

Chip (a), der Schwingkreis: die Kurve muss eine abklingende Schwingung sein, `y_h` deckt sich mit `y`, weil `y_p` null ist. Chip (d), die Resonanz: die Amplitude muss **wachsen**. Chip (b), der Kriechfall: keine Nulldurchgänge außer höchstens einem.

Rechne für eine Stelle nach, dass der gezeichnete Wert zum Maßstab passt, und beschreibe im Bericht, was du gesehen hast — nicht, was du erwartest.

- [ ] **Schritt 5: Commit**

```bash
cd "<REPO>" && git add tools/schwingung/index.html tools/schwingung/schwingung.js && git commit -m "Schwingungsrechner zeichnet Gesamtloesung, homogenen und partikulaeren Anteil" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015eu53ekZCtxxweevNNDJa6"
```

---

### Aufgabe 4: Der Dämpfungsregler

Ziel: Man zieht an der Dämpfung und sieht die Diskriminante durch null gehen.

**Dateien:**
- Ändern: `tools/schwingung/index.html`
- Ändern: `tools/schwingung/schwingung.js`

- [ ] **Schritt 1: Der Regler**

Ein `<input type="range">` für `a`, Bereich von `0` bis `3·√b` (also deutlich über den Grenzfall hinaus), Schrittweite `(3·√b)/400`. Er wird neu bemessen, sobald `b` sich ändert.

Regler und Zahlenfeld halten denselben Wert: Ziehen schreibt ins Feld, Tippen stellt den Regler.

- [ ] **Schritt 2: Die Marke des Grenzfalls**

Unter dem Regler eine Beschriftung, die den aperiodischen Grenzfall nennt: „Aperiodischer Grenzfall bei a = 2√b = …" mit dem Zahlenwert. Bei `b ≤ 0` gibt es keinen Grenzfall — dann steht dort „Für b ≤ 0 gibt es keinen Grenzfall; die Nullstellen sind stets reell."

- [ ] **Schritt 3: Prüfen**

Chip (a) wählen, dann den Regler von 0 nach oben ziehen und belegen, dass der angezeigte Fall in dieser Reihenfolge wechselt: `komplex` → `doppelt` → `zwei-reelle`. Den Wert notieren, bei dem `doppelt` erscheint, und gegen `2√b` halten.

Belegen, dass Ziehen am Regler die Rechnung neu auslöst und dass Tippen ins Feld den Regler mitzieht.

`browser_console_messages`: keine Meldung vom Typ `error`.

- [ ] **Schritt 4: Commit**

```bash
cd "<REPO>" && git add tools/schwingung/index.html tools/schwingung/schwingung.js && git commit -m "Daempfungsregler mit Marke des aperiodischen Grenzfalls" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015eu53ekZCtxxweevNNDJa6"
```

---

### Aufgabe 5: Die Karten `karten/differentialgleichungen.html`

Ziel: Drei Karten, die die drei Fälle, den Ansatz und die Resonanz erklären.

**Dateien:**
- Anlegen: `karten/differentialgleichungen.html`

Aufbau, Formelsatz, Illustrationen, Abfragemodus, Druck, Querlink und Seitenfuß **genau nach `CLAUDE.md`, Abschnitt „Eine Karte schreiben"**. Nimm eine der vier bestehenden Kartendateien als Muster.

- [ ] **Schritt 1: Karte `charakteristisches-polynom`**

Überschrift *Charakteristisches Polynom — drei Fälle*.

Voraussetzung: `y'' + ay' + by = 0` mit konstanten reellen a und b.

Formel: der Ansatz `y = e^(λx)` führt auf `λ² + aλ + b = 0`, dazu die drei Fälle mit ihren Lösungsformen.

Beispiel, vollständig durchgerechnet: `y'' + 4y' + 13y = 0` (D 14g). `D = 16 − 52 = −36`, also `λ = −2 ± 3i`, also `y = e^(−2x)(C₁cos 3x + C₂sin 3x)`.

Bild: drei kleine Achsenkreuze nebeneinander, je eine Kurve — Schwingfall, aperiodischer Grenzfall, Kriechfall, alle mit `y(0) = 1`, `y'(0) = 0`. **Punkte gerechnet, nicht geschätzt**, und jede Beschriftung gegen jedes andere Element im selben SVG geprüft.

Typischer Fehler: bei doppelter Nullstelle den Faktor `x` vergessen — dann hat man nur eine Basislösung und kann die Anfangswerte nicht erfüllen.

- [ ] **Schritt 2: Karte `ansatz`**

Überschrift *Ansatz vom Typ der rechten Seite*.

Voraussetzung: `y_h` ist bereits bestimmt.

Formel: eine Tabelle der Bauarten und ihrer Ansätze — Polynom vom Grad n, `c·e^(μx)`, `c·cos(ωx) + d·sin(ωx)` — jeweils mit dem Faktor `x^k`.

Beispiel: `y'' + 4y' + 5y = 5x² − 32x + 5` (D 15b), Schritt für Schritt bis `y_p = x² − 8x + 7`. Die Koeffizientenvergleiche einzeln hinschreiben: `5A₂ = 5`, `8A₂ + 5A₁ = −32`, `2A₂ + 4A₁ + 5A₀ = 5`.

Merksatz: **Superposition** — steht rechts eine Summe, wird jeder Summand für sich gelöst und die Ergebnisse addiert.

Typischer Fehler: den Ansatz wählen, ohne vorher die Nullstellen anzusehen.

- [ ] **Schritt 3: Karte `resonanz`**

Überschrift *Resonanz: wann der Ansatz mit x zu multiplizieren ist*.

Formel: `k` ist die Vielfachheit von `μ` als Nullstelle des charakteristischen Polynoms; der Ansatz bekommt den Faktor `x^k`.

Beispiel: `y'' + 2y' + y = 6x·e^(−x)` (D 15a). `λ² + 2λ + 1 = (λ + 1)²`, also ist `μ = −1` **doppelte** Nullstelle, also `k = 2`. Ansatz `x²(A₀ + A₁x)e^(−x)`, und aus dem Koeffizientenvergleich `A₀ = 0`, `A₁ = 1`, also `y_p = x³e^(−x)`.

Bild: die ungedämpfte Resonanz `y'' + 9y = sin 3x` mit `y_p = −(1/6)x·cos 3x` — die aufschaukelnde Amplitude. Punkte gerechnet.

Typischer Fehler: die Resonanz übersehen. Dann ist das Gleichungssystem für die Koeffizienten unlösbar, und man sucht den Fehler in der Rechnung statt im Ansatz.

- [ ] **Schritt 4: Querlink und Seitenfuß**

`.querlink` auf `../tools/schwingung/index.html`, mit den einzugebenden Zahlen. **Am laufenden Werkzeug nachstellen**, bevor du sie hinschreibst — in einer früheren Runde behaupteten drei Karten Einstellungen, die nicht stimmten.

`.seitenfuss` zurück zu `index.html` im selben Ordner.

- [ ] **Schritt 5: Kartenprüfung K**

Vollständig nach `CLAUDE.md`, Abschnitt „Bevor du ‚fertig' sagst".

- [ ] **Schritt 6: Controller-Kontrolle**

```bash
cd "<REPO>" && grep -nE "#[0-9a-fA-F]{3,6}|rgb\(" karten/differentialgleichungen.html ; echo "Farbliteral-Kontrolle beendet"
```

Erwartet: keine Treffer.

- [ ] **Schritt 7: Commit**

```bash
cd "<REPO>" && git add karten/differentialgleichungen.html && git commit -m "Karten: drei Faelle, Ansatz und Resonanz" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015eu53ekZCtxxweevNNDJa6"
```

---

### Aufgabe 6: Eintragen, Dokumente, Wege

Ziel: Beides ist erreichbar, die Dokumente beschreiben das Repo richtig.

**Dateien:**
- Ändern: `index.html`, `karten/index.html`, `CLAUDE.md`, `README.md`
- Ändern: `tools/schwingung/index.html` (Rücklink zur neuen Karte)

- [ ] **Schritt 1: Startseite**

Im Abschnitt **Werkzeuge** eine `.kachel` auf `tools/schwingung/index.html`, im Abschnitt **Karten** eine auf `karten/differentialgleichungen.html`. Kacheltitel als `h3`.

- [ ] **Schritt 2: Kartenübersicht**

In `karten/index.html` eine `.kachel` auf `differentialgleichungen.html`, Titel als `h2`.

- [ ] **Schritt 3: Rücklink im neuen Werkzeug**

`.querlink` am Fuß von `tools/schwingung/index.html` auf `../../karten/differentialgleichungen.html`. **Der Flächenrechner bleibt unangetastet** — sein Rücklink nennt weiterhin seine vier Karten.

- [ ] **Schritt 4: `CLAUDE.md`**

Die Tabelle „Die geteilten Bausteine" bekommt eine Zeile für `shared/dgl.js`. Der `Aufbau`-Block nennt bereits `tools/<name>/`; prüfe, ob eine Anpassung nötig ist.

- [ ] **Schritt 5: `README.md`**

Zeile für das neue Werkzeug, Zeile für die neue Kartendatei, Zeile für `shared/dgl.js`. Lies die Datei, statt aus diesem Plan zu schreiben.

- [ ] **Schritt 6: Datensuche**

Das Suchmuster steht **nicht** im Repo — es deckt den Klarnamen des Eigners, seine Mailadresse und lokale Pfadfragmente ab und wird außerhalb zusammengestellt. Ein Muster, das sich selbst verschleiert, blendet die Suche; genau daran ist eine frühere Runde gescheitert.

Stelle ein unverschleiertes Muster in SCRATCH zusammen, prüfe es an einer Positivkontrolle, und fahre es über `git ls-files -z | xargs -0 grep -niEf …`. Erwartet: kein Treffer. Zitiere die Ausgabe.

- [ ] **Schritt 7: Alle Wege gehen**

Über `file://`, in beide Richtungen: Startseite → neues Werkzeug → neue Karte → Übersicht → neue Karte → Werkzeug. Konsole auf jeder Seite ohne `error`.

- [ ] **Schritt 8: Commit**

```bash
cd "<REPO>" && git add index.html karten/index.html CLAUDE.md README.md tools/schwingung/index.html && git commit -m "Schwingungsrechner und Karten eintragen, Dokumente nachziehen" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015eu53ekZCtxxweevNNDJa6"
```

- [ ] **Schritt 9: Push ist nicht Teil dieser Aufgabe**

Der Push veröffentlicht auf ein öffentliches Remote und geht an den Nutzer, sobald alle Aufgaben geprüft sind.

---

## Selbstprüfung dieses Plans

**Spec-Abdeckung.** Schnittstelle und Verfahren des Bausteins → 1; Grenzen, die er meldet → 1, Schritt 5; kein geteiltes Gauß-Verfahren → in 1 als eigene Fassung; Eingabe und Ausgabe des Werkzeugs → 2; das Bild → 3; der Dämpfungsregler → 4; die drei Karten → 5; Verifikation (K, Rechenprobe D, Einsetzprobe) → 5, 1; kein Bildvergleich → in den Randbedingungen festgehalten.

**Typkonsistenz.** `MT.dgl.loese(a, b, glieder, anfang)` liefert `{ polynom, fall, wurzeln, basis, teile, konstanten, yh, yp, ypEins, ypZwei, y }`; jedes Element von `teile` trägt `art, k, koeff, fn, fnEins, fnZwei`. Diese Namen werden in Aufgabe 1 definiert und in den Aufgaben 2, 3 und 4 unter genau diesen Namen benutzt.

**Abweichung von der Spec, benannt.** Die Rückgabe enthält zusätzlich `ypEins` und `ypZwei`. Die Spec nennt nur Funktion und erste Ableitung je Glied; die Einsetzprobe braucht die zweite, und ohne sie müsste ausgerechnet die Prüfung numerisch differenzieren — was dieselbe Spec verbietet.

**Bekannte Lücke.** Aufgabe 3, Schritt 1 legt die Zeitspanne `T` nach einer Regel fest, die bei ungewöhnlichen Eingaben zu kurz oder zu lang ausfallen kann. Der Deckel bei 100 verhindert das Schlimmste. Der Ausführende berichtet, wie die Kurven der fünf Chips im gewählten Fenster aussehen.
