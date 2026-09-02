# Extremwerte Implementierungsplan

> **Für agentische Ausführung:** ERFORDERLICHE SUB-SKILL: `superpowers:subagent-driven-development` (empfohlen) oder `superpowers:executing-plans`, um diesen Plan Aufgabe für Aufgabe abzuarbeiten. Die Schritte nutzen Checkbox-Syntax (`- [ ]`).

**Ziel:** Kapitel 4 des Skripts abschließen — ein Baustein `shared/extrema.js` findet stationäre Stellen und ordnet sie über die Hesse-Matrix ein, der Flächenrechner zeigt das Ergebnis, und eine Themendatei `karten/extremwerte.html` erklärt beides.

**Architektur:** Wie bisher reines HTML/CSS/JS ohne Build. Der Baustein hängt an `MT`, ist von den übrigen `shared/*.js` unabhängig und wird vom Werkzeug nur aufgerufen. Gesucht wird mit gedämpftem Levenberg–Marquardt von einem Raster aus Startpunkten; eingeordnet wird über die Determinante der numerischen Hesse-Matrix.

**Tech Stack:** HTML5, MathML, Inline-SVG, CSS Custom Properties, ES5-JavaScript (`var`, IIFE, `"use strict"`). Keine Abhängigkeiten. Prüfung mit Playwright über die `mcp__playwright-edge__*`-Werkzeuge.

**Spec:** `docs/superpowers/specs/2026-09-02-extremwerte-design.md` — bindend, vor der ersten Aufgabe zu lesen.
**Repoweite Regeln:** `CLAUDE.md` im Wurzelverzeichnis — bindend für jede Aufgabe.

---

## Globale Randbedingungen

Gelten für **jede** Aufgabe. Die Langfassung steht in `CLAUDE.md`.

- **Kein Build.** Kein npm, kein Bundler, keine `package.json`.
- **Keine ES-Module.** Klassische `<script src="…">` ohne `type="module"`.
- **Doppelklick muss funktionieren**, gleichrangig neben GitHub Pages.
- **Keine externen Abhängigkeiten**, keine CDN-Ressourcen, keine Fremdschriften.
- **Alle Pfade relativ**, niemals mit führendem `/`. Links zeigen auf `index.html`, nie auf ein Verzeichnis.
- **ES5-artiger Stil:** `var`, IIFE, `"use strict"`. Kein `let`, kein `const`, keine Pfeilfunktionen, keine Template-Literale.
- **Deutsch** in Oberfläche, Kommentaren, lokalen Namen und Commit-Nachrichten. **Nicht** an der geteilten Schnittstelle: dort gilt die eingeführte Schreibweise (`MT.extrema.finde`).
- **Keine Farbliterale** in einer Seite, auch nicht im SVG und nicht auf einem Canvas — Farben kommen über `MT.canvas.colors()` beziehungsweise als `var(--…)`.
- **Namensraum:** `.karte` = Karteikarte, `.kachel` = Katalogeintrag, `.tafel` = Zeichentafel eines Werkzeugs, `.ansichten` = deren Raster, `.regler` = Textklasse für einen Reglernamen auf einer Karte.
- **Keine Testdateien, keine CI.** Geprüft wird am laufenden Bild.
- **Kein URL-Zustand.** Kein `?f=…`.
- **Commit-Nachrichten** enden mit:
  ```
  Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_015eu53ekZCtxxweevNNDJa6
  ```

## Kürzel

Dieser Plan nennt keine absoluten Pfade — das war in einer früheren Runde ein kritischer Fund. Die Ausführung bekommt die Werte im Auftrag genannt.

| Kürzel | Bedeutung |
|---|---|
| REPO | das Repo-Verzeichnis |
| ORIGINAL | die unveränderte Ausgangsdatei des Flächenrechners, außerhalb des Repos |
| SHOTS | das Verzeichnis mit den Vergleichsbildern; enthält bereits 21 `referenz-*.png` |
| SCRATCH | ein Arbeitsverzeichnis außerhalb des Repos |

## Prüfroutine P

Der Bildvergleich des Flächenrechners, vollständig beschrieben im Fundament-Plan `2026-09-01-mathe-tools-fundament.md`, Abschnitt „Prüfroutine P": 21 Zustände als Screenshots, Konsolenprüfung, Vergleich gegen die Referenzbilder.

**Die 21 Referenzbilder liegen bereits in SHOTS** und sind in zwei Runden gegengeprüft. Sie werden **nicht** neu aufgenommen.

Zwei Werkzeug-Eigenheiten gelten weiter: `browser_navigate` weist `file://`-URLs ab (stattdessen `browser_run_code_unsafe` mit `await page.goto(URL)`), und `browser_take_screenshot` legt die Bilder im Arbeitsverzeichnis des MCP-Servers ab, von wo sie nach SHOTS zu verschieben sind.

**Der Bereichsvergleich läuft über alle 21 Zustände, nicht als Stichprobe.** Das ist die Lehre der vorigen Runde: dort wurden drei Zustände geprüft und auf alle geschlossen, und drei andere wichen sehr wohl ab. Weicht ein Bereich oberhalb des neuen Blocks ab, ist die **Größenordnung** zu messen: ein maximaler Kanalunterschied von 1 ist Rasterungsrauschen der Canvas-Darstellung und harmlos, alles Größere ist ein Fund.

## Rechenprobe R

Der Testzyklus für den neuen Baustein, weil hier zum ersten Mal etwas rechnet, dessen falsches Ergebnis nicht falsch aussieht. Keine Testdatei — geprüft wird am laufenden Bild.

Jede der folgenden Funktionen wird ausgewertet und das Ergebnis gegen die Handrechnung gehalten:

| Nr | Term (so einzugeben) | Aufgabe | Erwartet |
|---|---|---|---|
| R1 | `x^3 + y^3 - 3*x*y` | MV 24a, 29a | (0\|0) Sattel, `det = −9`; (1\|1) Minimum, `det = 27`, `fxx = 6`, `z = −1` |
| R2 | `x^2 + x*y + y^2 + x + y + 1` | MV 24c, 29c | (−0,3333\|−0,3333) Minimum, `det = 3`, `z = 0,6667` |
| R3 | `x^2 + y^2 - 2*x*y + 1` | MV 24b, 29b | `kurvenfall` wahr; alle Treffer auf der Geraden `y = x`, alle `det = 0` → `unentschieden` |
| R4 | `(x^2 + y^2)*exp(-x)` | MV 26a | (0\|0) Minimum, `det = 4`; (2\|0) Sattel, `det ≈ −0,0733` |
| R5 | `x^4 + y^4` | MV 28a | genau **eine** Stelle nahe (0\|0), `det ≈ 0` → `unentschieden`. Die Lage ist wegen der Entartung nur auf wenige Stellen genau — das ist richtig so |
| R6 | `-x*exp(-x^2-y^2)` | MV 31 | (0,7071\|0) Minimum; (−0,7071\|0) Maximum |
| R7 | `4*x^3 - 0.5*y^3 + 3*x*y` | MV 30 | (0\|0) Sattel, `det = −9`; (0,5\|−1) Minimum, `det = 27`, `fxx = 12` |

**R3 und R5 sind die wichtigsten Zeilen.** Bei beiden lautet die richtige Antwort „das Kriterium entscheidet hier nicht". Ein Baustein, der dort ein Urteil fällt, ist schlechter als einer, der schweigt — und ein Verfahren, das bei R3 „keine Stelle gefunden" meldet, ist der Fehler, wegen dem die Spec Levenberg–Marquardt statt Newton vorschreibt.

Alle Läufe mit `bereich = 4`, sofern nicht anders vermerkt.

---

### Aufgabe 1: Referenzbilder sichern

Ziel: Prüfroutine P ist in Aufgabe 5 lauffähig, ohne dass dort erst etwas fehlt.

**Dateien:** keine. Diese Aufgabe ändert nichts am Repo.

**Schnittstellen:**
- Liefert: 21 überprüfte `referenz-*.png` in SHOTS

- [ ] **Schritt 1: Bestand prüfen**

```bash
ls "<SHOTS>"/referenz-*.png | wc -l
```

Erwartet: `21`. Erscheint eine andere Zahl, **halte an und melde es** — dann sind die Referenzbilder neu aus ORIGINAL aufzunehmen, und das ist eine eigene Aufgabe, keine Nebenbei-Reparatur.

- [ ] **Schritt 2: Gegenprobe gegen den heutigen Stand**

Nimm mit Prüfroutine P einen Durchlauf mit dem Präfix `v1` vom **unveränderten** Repo-Stand auf und vergleiche ihn gegen `referenz`. Der Vergleich muss ohne Abweichung durchgehen.

Das ist die Probe darauf, dass die Referenz noch zum heutigen Repo passt — seit ihrer Aufnahme hat die vorige Runde die Werkzeugseite zweimal angefasst.

```python
# Vergleich, mit Pillow
import os
from PIL import Image, ImageChops
SH = r"<SHOTS>"
for r in sorted(f for f in os.listdir(SH) if f.startswith("referenz-")):
    z = r[len("referenz-"):]
    a = Image.open(os.path.join(SH, r)).convert("RGB")
    b = Image.open(os.path.join(SH, "v1-" + z)).convert("RGB")
    if a.size != b.size:
        print(z, "GROESSE", a.size, b.size); continue
    d = ImageChops.difference(a, b).getbbox()
    print(z, "identisch" if d is None else ("ABWEICHUNG " + str(d)))
print("Vergleich fertig")
```

Erwartet: 21 Zeilen `identisch`.

**Weicht etwas ab**, miss die Größenordnung (maximaler Kanalunterschied) und melde sie, bevor du weitergehst. Ein Maximum von 1 ist Rasterungsrauschen und kein Hindernis; alles Größere heißt, dass die Referenz nicht mehr passt.

- [ ] **Schritt 3: Nichts committen**

Diese Aufgabe erzeugt keinen Commit. `git status --short` muss leer sein.

---

### Aufgabe 2: Der Baustein `shared/extrema.js`

Ziel: Ein geprüfter Baustein, der stationäre Stellen findet und einordnet — ohne dass eine Seite des Repos ihn schon benutzt.

**Dateien:**
- Anlegen: `shared/extrema.js`
- Anlegen (außerhalb des Repos, wird nicht committet): `<SCRATCH>/probe.html`

**Schnittstellen:**
- Nutzt: `MT.expr.compile(term, vars)` aus `shared/expr.js`
- Liefert: `MT.extrema.finde(f, bereich)` → `{ stellen, bereich, amRand, kurvenfall }`, wobei jede Stelle `{ x, y, z, fxx, fxy, fyy, det, art }` ist und `art` einer von `'minimum'`, `'maximum'`, `'sattel'`, `'unentschieden'`

- [ ] **Schritt 1: `shared/extrema.js` schreiben**

Vollständiger Inhalt:

```js
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

    var eps = 1e-6 * (1 + r), stellen = [], k, m, neu, e;
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
```

- [ ] **Schritt 2: Probeseite außerhalb des Repos anlegen**

Das Repo bekommt **keine** Testdatei. Die Probeseite liegt in SCRATCH und wird nie committet. Sie lädt die beiden Bausteine über absolute `file://`-Pfade auf REPO.

`<SCRATCH>/probe.html`:

```html
<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><title>Probe extrema</title></head>
<body>
<script src="<REPO>/shared/expr.js"></script>
<script src="<REPO>/shared/extrema.js"></script>
</body>
</html>
```

- [ ] **Schritt 3: Rechenprobe R durchführen**

Seite über `browser_run_code_unsafe` mit `await page.goto(...)` laden, dann je Zeile der Tabelle auswerten:

```js
() => {
  var terme = [
    ['R1', 'x^3 + y^3 - 3*x*y'],
    ['R2', 'x^2 + x*y + y^2 + x + y + 1'],
    ['R3', 'x^2 + y^2 - 2*x*y + 1'],
    ['R4', '(x^2 + y^2)*exp(-x)'],
    ['R5', 'x^4 + y^4'],
    ['R6', '-x*exp(-x^2-y^2)'],
    ['R7', '4*x^3 - 0.5*y^3 + 3*x*y']
  ];
  return terme.map(function(t){
    var f = MT.expr.compile(t[1], ['x', 'y']);
    var e = MT.extrema.finde(f, 4);
    return {
      nr: t[0], term: t[1],
      kurvenfall: e.kurvenfall, amRand: e.amRand,
      stellen: e.stellen.map(function(s){
        return { x: +s.x.toFixed(4), y: +s.y.toFixed(4), z: +s.z.toFixed(4),
                 fxx: +s.fxx.toFixed(4), det: +s.det.toFixed(4), art: s.art };
      })
    };
  });
}
```

Vergleiche jede Zeile gegen die Tabelle der Rechenprobe R oben und **zitiere die Ausgabe wörtlich im Bericht**. Runde Zahlen beim Vergleich sinnvoll: die Determinanten entstehen aus numerischen Ableitungen und treffen den Sollwert nicht auf die letzte Stelle.

- [ ] **Schritt 4: Bei Abweichung nachjustieren**

Schlägt eine Zeile fehl, sind Schrittweite `h`, die Toleranzen oder die Rasterweite anzupassen — **nicht** die erwarteten Werte. Die Sollwerte sind von Hand nachgerechnet und stehen fest.

Die endgültig verwendeten Zahlenwerte gehören in den Bericht, auch wenn sie unverändert blieben.

Zwei Zeilen verdienen besondere Aufmerksamkeit:
- **R3** muss `kurvenfall: true` liefern und Treffer auf `y = x`. Kommt `stellen: []` zurück, ist das Verfahren fehlerhaft implementiert.
- **R5** muss **genau eine** Stelle liefern. Kommen mehrere, ist die Zusammenfass-Toleranz `eps` zu klein für diesen entarteten Fall — melde das, statt `eps` blind zu vergrößern.

- [ ] **Schritt 5: Controller-Kontrolle**

```bash
cd "<REPO>" && grep -n "let \|const \|=>\|\`" shared/extrema.js ; echo "ES5-Kontrolle beendet"
```

Erwartet: nur `Suche beendet`-artige Leerausgabe. Treffer auf `=>` innerhalb eines Kommentars sind zu prüfen und gegebenenfalls umzuformulieren.

- [ ] **Schritt 6: Commit**

```bash
cd "<REPO>" && git add shared/extrema.js && git commit -m "Baustein extrema: stationaere Stellen finden und einordnen" -m "Levenberg-Marquardt statt Newton, weil die Hesse-Matrix bei zwei der
sieben Pruefaufgaben singulaer ist.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015eu53ekZCtxxweevNNDJa6"
```

`<SCRATCH>/probe.html` wird **nicht** committet. `git status --short` muss danach leer sein.

---

### Aufgabe 3: Der neue Block im Flächenrechner

Ziel: Das Werkzeug zeigt die stationären Stellen mit Zahlen — und sagt, wo seine Aussage endet.

**Dateien:**
- Ändern: `tools/flaechenrechner/index.html` (ein `<script>`-Tag)
- Ändern: `tools/flaechenrechner/flaechenrechner.js`

**Schnittstellen:**
- Nutzt: `MT.extrema.finde(f, bereich)` aus Aufgabe 2
- Liefert: den sichtbaren Block, den Aufgabe 5 im Bild vergleicht

- [ ] **Schritt 1: Baustein einbinden**

In `tools/flaechenrechner/index.html` ein `<script src="../../shared/extrema.js"></script>` zu den übrigen `shared`-Skripten am Ende des `<body>` ergänzen, **vor** dem seiteneigenen `flaechenrechner.js`.

- [ ] **Schritt 2: Suche an `rebuild()` hängen**

Die Suche läuft bei Termwechsel und bei Änderung des Bereichsreglers — also in `rebuild()`, **nicht** in `drawAll()`. Am Höhen- oder an den Schnittreglern zu ziehen darf keine neue Suche auslösen; das wäre bei jedem Mausbewegungsschritt ein voller Rasterlauf.

Ergebnis in einer Modulvariablen neben dem übrigen Zustand ablegen, etwa `var stellen = null;`, und in `rebuild()` mit `MT.extrema.finde(f, RANGE)` füllen. Den vorhandenen Namen für den Bereichsregler aus der Datei übernehmen, nicht erfinden.

- [ ] **Schritt 3: Den Block ausgeben**

Unter der vorhandenen Analyse, mit der Überschrift **Stationäre Stellen**. Die vorhandene Formbeschreibung bleibt Zeile für Zeile unverändert — die Doppelung bei quadratischen Funktionen ist gewollt und in der Spec begründet.

Der Block erscheint **immer**, auch wenn `fitQuadratic` `null` liefert. Das ist der Kern der Änderung: heute hängt die gesamte Ausgabe daran, dass die Eingabe quadratisch ist.

Inhalt je Stelle, in einer Zeile lesbar:
- der Punkt als `(x | y)`, vier Nachkommastellen
- der Funktionswert
- die Hesse-Matrix über ihre drei Einträge `fxx`, `fxy`, `fyy`
- die Determinante
- das Urteil in Worten: `Minimum`, `Maximum`, `Sattelpunkt`

Bei `art === 'unentschieden'` steht statt eines Urteils:

> Die Determinante ist null — das Kriterium entscheidet hier nicht. Die Art der Stelle ist von Hand zu klären.

Vier Sätze zum Rahmen. Der Wortlaut ist Oberflächentext und damit Teil der Anforderung — nimm ihn wörtlich, `r` durch den Zahlenwert ersetzt:

- **immer**, als letzte Zeile des Blocks:
  > Gesucht wurde in −r bis r. Außerhalb dieses Bereichs kann es weitere Stellen geben.
- **bei `amRand`**, davor:
  > Eine Stelle liegt dicht am Rand des durchsuchten Bereichs. Zieh den Bereich weiter auf, sonst entgeht dir womöglich eine Stelle knapp außerhalb.
- **bei `kurvenfall`**, statt der Liste einleitend:
  > Die Bedingung ist hier nicht in einzelnen Punkten erfüllt, sondern entlang einer ganzen Kurve. Unten stehen die ersten Treffer, nicht alle.
- **bei leerer Liste**, statt der Liste:
  > Im Bereich −r bis r liegt keine Stelle mit waagerechter Tangentialebene.

Schweigen ist beim Kontrollieren die schlechteste Antwort — jeder dieser Fälle bekommt sichtbaren Text.

Nutze die vorhandenen Bausteine der Analyseausgabe (`renderAnalysis`, die `block`-Hilfsfunktion) statt neuer CSS-Klassen. Braucht der Block doch eine eigene Klasse, gehört sie nach `shared/ui.css` und der Name ist deutsch.

- [ ] **Schritt 4: Rechenprobe R über die Oberfläche**

Werkzeug über `file://` laden, `browser_resize` auf 1400 × 1000. Für jede der sieben Zeilen der Rechenprobe R den Term ins Termfeld eingeben, den Bereichsregler auf 4 stellen und den angezeigten Block gegen die Tabelle halten.

Diesmal wird nicht die Rückgabe des Bausteins gelesen, sondern **das, was auf der Seite steht** — die Formatierung ist Teil der Prüfung. Zitiere den Text des Blocks für R1, R3 und R5 wörtlich im Bericht.

`browser_console_messages`: keine Meldung vom Typ `error`.

- [ ] **Schritt 5: Reglerprobe**

Am Höhenregler und an beiden Schnittreglern ziehen und belegen, dass **keine** neue Suche läuft. Nachweis: eine Zählvariable im Modul oder eine `performance.now()`-Messung, die zeigt, dass `MT.extrema.finde` dabei nicht aufgerufen wird. Beschreibe im Bericht, wie du es gemessen hast.

Am Bereichsregler ziehen: die Liste muss sich ändern, weil ein anderer Bereich durchsucht wird.

- [ ] **Schritt 6: Commit**

```bash
cd "<REPO>" && git add tools/flaechenrechner/index.html tools/flaechenrechner/flaechenrechner.js && git commit -m "Flaechenrechner zeigt stationaere Stellen samt Hesse-Kriterium" -m "Der Block erscheint auch fuer nichtquadratische Funktionen -- bisher
schwieg die Analyse dort ganz.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015eu53ekZCtxxweevNNDJa6"
```

---

### Aufgabe 4: Marken im Höhenlinienbild

Ziel: Man sieht die Stellen dort, wo man die Funktion ansieht.

**Dateien:**
- Ändern: `tools/flaechenrechner/flaechenrechner.js` (`draw2Dmap`)

**Schnittstellen:**
- Nutzt: die Modulvariable mit den Stellen aus Aufgabe 3

- [ ] **Schritt 1: Marken zeichnen**

Am Ende von `draw2Dmap()`, nach den Höhenlinien, damit die Marken obenauf liegen.

| `art` | Marke | Farbe |
|---|---|---|
| `minimum` | gefüllter Kreis | `mint` |
| `maximum` | offener Kreis (nur Rand) | `rose` |
| `sattel` | Kreuz aus zwei Strichen | `gold` |
| `unentschieden` | offenes Quadrat | `dim` |

**Über die Form und zusätzlich über die Farbe** — damit die Marken im Druck und bei Farbenblindheit tragen. Die Farben kommen aus `MT.canvas.colors()`, nicht als Literal; nimm die Namen, die dort schon vergeben sind, und lege keine neuen an.

Der Radius ist fest in Bildschirmpunkten (Vorschlag: 4 px, Strichstärke 1,5), **nicht** in Weltkoordinaten: die Marke bezeichnet eine Stelle und ist kein Objekt der Zeichnung, sie darf beim Zoomen nicht mitwachsen.

Die Umrechnung von Welt- in Bildkoordinaten gibt es in der Datei bereits — nutze sie, statt eine zweite zu schreiben.

Nur im Höhenlinienbild. **Nicht** in der 3D-Ansicht: dort ist die Ansicht drehbar, die Marken müssten mitprojiziert werden, und die Aussage würde davon nicht klarer.

- [ ] **Schritt 2: Sichtprüfung**

Für R1 (`x^3 + y^3 - 3*x*y`) das Höhenlinienbild ansehen: ein Kreuz bei (0|0), ein gefüllter Kreis bei (1|1). Für R6 (`-x*exp(-x^2-y^2)`) ein gefüllter und ein offener Kreis, spiegelbildlich zur y-Achse.

Belege im Bericht, was du gesehen hast, und rechne für eine Marke nach, dass ihre Bildposition zum Maßstab passt.

- [ ] **Schritt 3: Konsole**

`browser_console_messages`: keine Meldung vom Typ `error`.

- [ ] **Schritt 4: Commit**

```bash
cd "<REPO>" && git add tools/flaechenrechner/flaechenrechner.js && git commit -m "Stationaere Stellen im Hoehenlinienbild markieren" -m "Form UND Farbe, damit die Marken im Druck und bei Farbenblindheit tragen.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015eu53ekZCtxxweevNNDJa6"
```

---

### Aufgabe 5: Prüfroutine P

Ziel: Belegen, dass sich am Werkzeug nichts geändert hat außer dem, was sich ändern sollte.

**Dateien:** keine. Reine Messung, kein Commit.

- [ ] **Schritt 1: Durchlauf aufnehmen**

Prüfroutine P mit dem Präfix `e1` (`k6` und `k7` sind aus der vorigen Runde belegt, `t1` bis `t8` aus der Fundament-Runde). Keine vorhandene Datei in SHOTS überschreiben.

- [ ] **Schritt 2: Vergleich über alle 21 Zustände**

Zwei erwartete Abweichungen, beide zu belegen statt anzunehmen:

1. **Der neue Block verlängert die Seite.** Bei `fullPage: true` ändert das die Bildhöhe in allen 21 Zuständen, und zwar um einen ähnlichen Betrag. Weicht ein Bild deutlich stärker ab als die anderen, ist das ein Fund.
2. **Die Marken erscheinen im Höhenlinienbild.** Das ist eine Abweichung *innerhalb* des Bildbereichs, also oberhalb der Fußzeile — anders als in der vorigen Runde. Sie tritt nur in den Zuständen auf, in denen der Term stationäre Stellen im Bereich hat.

Der Bereichsvergleich läuft deshalb **zweigeteilt**: der Bereich oberhalb der vier Zeichenflächen muss in allen 21 Zuständen identisch sein; im Bereich der Zeichenflächen sind Marken zu erwarten, aber sonst nichts.

Miss bei jeder Abweichung die Größenordnung (maximaler Kanalunterschied). Ein Maximum von 1 ist Rasterungsrauschen. Alles Größere außerhalb der Markenpositionen ist ein Fund.

Sieh dir zwei Bilder an und beschreibe, was du siehst — nicht, was du erwartest.

- [ ] **Schritt 3: Arbeitsbaum**

`git status --short` muss leer sein. Kein Commit.

---

### Aufgabe 6: Die Karte `karten/extremwerte.html`

Ziel: Zwei Karten, die dieselbe Funktion durchrechnen — Kandidaten finden, dann einordnen.

**Dateien:**
- Anlegen: `karten/extremwerte.html`

**Schnittstellen:**
- Nutzt: `shared/theme.css`, `shared/ui.css`, `shared/karten.css`, `shared/abfrage.js`
- Liefert: die Datei, die Aufgabe 7 an zwei Stellen einträgt

Aufbau, Formelsatz, Illustrationen, Abfragemodus, Druck, Querlink und Seitenfuß **genau nach `CLAUDE.md`, Abschnitt „Eine Karte schreiben"**. Nimm eine der drei bestehenden Kartendateien als Muster und weiche nicht ohne Grund davon ab.

Beide Karten rechnen `f(x, y) = x³ + y³ − 3xy`.

- [ ] **Schritt 1: Karte 1 — `id="stationaere-stellen"`**

Überschrift: *Stationäre Stellen finden*

Voraussetzung: f einmal partiell differenzierbar.

Formel: der Gradient wird null gesetzt, beide Gleichungen.

Beispiel, Schritt für Schritt und vollständig:
- `f_x = 3x² − 3y = 0` ⟹ `y = x²`
- `f_y = 3y² − 3x = 0` ⟹ `x = y²`
- Einsetzen: `x = (x²)² = x⁴`, also `x⁴ − x = 0`, also `x(x³ − 1) = 0`
- `x = 0` oder `x = 1`
- Dazu `y = x²`: die Stellen sind **(0 | 0)** und **(1 | 1)**

Bild: die beiden Parabeln `y = x²` und `x = y²` in einem Achsenkreuz; ihre beiden Schnittpunkte sind die gesuchten Stellen. Beide Schnittpunkte markiert und beschriftet. **Alle Punkte gerechnet, keiner geschätzt** — und jede Beschriftung gegen jedes andere Element im SVG geprüft, wie es `CLAUDE.md` verlangt.

Typischer Fehler (`.fehler`): `x⁴ = x` durch `x` geteilt — damit geht die Lösung `x = 0` verloren, und die Hälfte der Aufgabe fehlt.

- [ ] **Schritt 2: Karte 2 — `id="hesse-kriterium"`**

Überschrift: *Hesse-Matrix: Minimum, Maximum oder Sattel*

Voraussetzung: f zweimal stetig partiell differenzierbar, `(x₀ | y₀)` stationär.

Formel: die Hesse-Matrix und das Kriterium mit allen vier Fällen, einschließlich `det H = 0` als „keine Aussage".

Beispiel, dieselbe Funktion weiter:
- `f_xx = 6x`, `f_yy = 6y`, `f_xy = −3`
- `H = [[6x, −3], [−3, 6y]]`, also `det H = 36xy − 9`
- Bei (0 | 0): `det H = −9 < 0` ⟹ **Sattelpunkt**
- Bei (1 | 1): `det H = 27 > 0` und `f_xx = 6 > 0` ⟹ **Minimum**, mit `f(1, 1) = −1`

Bild: Höhenlinien von `f` mit beiden Stellen, markiert wie im Werkzeug (Kreuz für den Sattel, gefüllter Kreis für das Minimum). Die Höhenlinien sind zu rechnen, nicht zu skizzieren; wenn das zu aufwendig wird, zeige stattdessen die beiden Schnittkurven `z = f(x, 1)` und `z = f(1, y)` durch das Minimum — auch die sind zu rechnen.

Merksatz (`.merksatz`): `det H > 0` heißt Extremum, und erst dann entscheidet das Vorzeichen von `f_xx` zwischen Minimum und Maximum.

Typischer Fehler (`.fehler`): eine stationäre Stelle für ein Extremum halten. Waagerechte Tangentialebene heißt nur, dass die Fläche dort nicht steigt — bei (0 | 0) fällt sie in der einen Richtung und steigt in der anderen.

- [ ] **Schritt 3: Querlink mit Reglerangaben**

Am Fuß der zweiten Karte, `.querlink` auf `../tools/flaechenrechner/index.html`. Der Text nennt den Term `x^3 + y^3 - 3*x*y` und die nötigen Reglerstellungen; Reglernamen bekommen die Klasse `.regler`.

**Die Angaben sind am laufenden Werkzeug nachzustellen, bevor du sie hinschreibst.** In der vorigen Runde behaupteten drei Karten Reglerstellungen, die nicht stimmten — bei einer zeigte das Werkzeug in der Grundstellung überhaupt nichts. Öffne das Werkzeug, gib den Term ein, stelle die Regler und sieh nach, was dasteht.

- [ ] **Schritt 4: Seitenfuß**

`.seitenfuss`-Zeile zurück zu `index.html` im selben Ordner, wie bei den drei bestehenden Kartenseiten.

- [ ] **Schritt 5: Kartenprüfung K**

Vollständig nach `CLAUDE.md`, Abschnitt „Bevor du ‚fertig' sagst":
- Seite über `file://`, Konsole ohne `error`
- MathML-Prüfung mit dem dort abgedruckten dreistufigen Ausdruck; `gesetzt` muss `true` sein
- Abfragemodus an und aus; jedes verdeckbare Feld einzeln aufdecken und belegen, dass die anderen verdeckt bleiben
- ohne JavaScript ist alles sichtbar
- Druckvorschau: heller Grund, nichts verdeckt, kein Umbruch mitten in einer Karte

- [ ] **Schritt 6: Controller-Kontrolle**

```bash
cd "<REPO>" && grep -n "#[0-9a-fA-F]\{3,6\}\|rgb(" karten/extremwerte.html ; echo "Farbliteral-Kontrolle beendet"
```

Erwartet: keine Treffer.

- [ ] **Schritt 7: Commit**

```bash
cd "<REPO>" && git add karten/extremwerte.html && git commit -m "Karten: stationaere Stellen und das Hesse-Kriterium" -m "Beide Karten rechnen dieselbe Funktion durch, weil das Uebungsblatt das
auch tut: erst die Kandidaten, dann die Einordnung.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015eu53ekZCtxxweevNNDJa6"
```

---

### Aufgabe 7: Eintragen und Wege gehen

Ziel: Die neue Seite ist erreichbar, die Dokumente beschreiben das Repo richtig.

**Dateien:**
- Ändern: `index.html`
- Ändern: `karten/index.html`
- Ändern: `CLAUDE.md`
- Ändern: `README.md`

- [ ] **Schritt 1: Kachel auf der Startseite**

Im Abschnitt Karten von `index.html` eine `.kachel` mit Pfad `karten/extremwerte.html`. Kacheltitel als `h3` (er steht unter der Abschnittsüberschrift `h2`). Wortlaut und Aufbau wie bei den drei vorhandenen Kacheln.

- [ ] **Schritt 2: Kachel in der Übersicht**

In `karten/index.html` eine `.kachel` mit Pfad `extremwerte.html` (gleicher Ordner). Kacheltitel als `h2` (er steht direkt unter der `h1`).

- [ ] **Schritt 3: `CLAUDE.md` nachziehen**

Die Tabelle „Die geteilten Bausteine" bekommt eine Zeile für `shared/extrema.js`. Beschreibung in derselben knappen Form wie die übrigen Zeilen, mit der Schnittstelle: `MT.extrema` — stationäre Stellen suchen und einordnen.

- [ ] **Schritt 4: `README.md` nachziehen**

Die Kartentabelle bekommt eine Zeile für das neue Thema, die Bausteintabelle eine für `shared/extrema.js`. Lies die Datei, statt aus diesem Plan zu schreiben — sie beschreibt den Ist-Stand und muss ihn weiter beschreiben.

- [ ] **Schritt 5: Datensuche**

```bash
cd "<REPO>" && git status --short && echo "---" && git ls-files && echo "---" && git ls-files -z | xargs -0 grep -niE "<MUSTER>" ; echo "Suche beendet"
```

`<MUSTER>` ist ein Platzhalter. Die ausgeschriebene Alternativenliste gehört
**nicht** ins Repo — sie deckt Klarnamen, Mailadresse und lokale Pfadfragmente
des Eigentümers ab und wäre, hier hingeschrieben, selbst der Fund. Wie sie
gebaut wird und warum ein sich selbst verschleierndes Muster jede Suche
blendet, steht in `2026-09-01-karteikarten.md`, Aufgabe 7, Schritt 3.

Erwartet: sauberer Arbeitsbaum, die erwartete Dateiliste, und nur
`Suche beendet` — kein einziger Treffer. Erscheint irgendetwas, **halte an und
melde es** — das ist der Fund, der in einer früheren Runde erst die
Gesamtprüfung fand.

Der absolute Pfad zur Probeseite aus Aufgabe 2 darf nirgends im Repo stehen.

- [ ] **Schritt 6: Alle Wege gehen**

Über `file://`, jeden Weg in beide Richtungen:
- Startseite → neue Kartenseite → zurück zur Übersicht → neue Kartenseite
- Übersicht → neue Kartenseite
- neue Kartenseite → Werkzeug
- Werkzeug → jede der drei alten Kartenseiten (der Rücklink bleibt unverändert bei dreien; die neue Seite kommt dort **nicht** dazu, weil der Flächenrechner sie nicht zeigt — er zeichnet die Fläche, die Karte erklärt das Kriterium)

Konsole auf jeder Seite ohne `error`.

- [ ] **Schritt 7: Commit**

```bash
cd "<REPO>" && git add index.html karten/index.html CLAUDE.md README.md && git commit -m "Extremwert-Karten eintragen, Dokumente nachziehen" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015eu53ekZCtxxweevNNDJa6"
```

- [ ] **Schritt 8: Push und Live-Abnahme sind NICHT Teil dieser Aufgabe**

Der Push veröffentlicht auf ein öffentliches Remote. Er geht an den Nutzer, sobald alle Aufgaben abgeschlossen und geprüft sind.

---

## Selbstprüfung dieses Plans

**Spec-Abdeckung.** Jeder Abschnitt der Spec hat eine Aufgabe: Schnittstelle und Verfahren des Bausteins → 2; Grenzen, die der Baustein meldet → 2 und 3; kein `numerik.js` → in Aufgabe 2 ist nur eine Datei anzulegen; der neue Block und die Zweisprachigkeit → 3; Marken → 4; wann gerechnet wird → 3, Schritt 5; die Karte → 6; Verifikation (K, P, R) → 6, 5, 2 und 3.

**Typkonsistenz.** `MT.extrema.finde(f, bereich)` liefert `{ stellen, bereich, amRand, kurvenfall }`; jede Stelle trägt `x, y, z, fxx, fxy, fyy, det, art`. Diese Namen werden in Aufgabe 2 definiert und in den Aufgaben 3 und 4 unter genau diesen Namen benutzt.

**Bekannte Lücke.** Aufgabe 6, Schritt 2 lässt für das Bild der zweiten Karte zwei Wege zu — gerechnete Höhenlinien oder gerechnete Schnittkurven —, weil sich vorab nicht sagen lässt, wie aufwendig die Höhenlinien von `x³ + y³ − 3xy` von Hand werden. Beide Wege verlangen gerechnete Punkte; geschätzt wird keiner. Der Ausführende berichtet, welchen er ging und warum.

**Erwartete Abweichung.** Aufgabe 4 verändert das Bild der vier Zeichenflächen sichtbar — zum ersten Mal in diesem Repo. Der Bildvergleich in Aufgabe 5 wird deshalb zweigeteilt geführt, und das ist dort beschrieben.
