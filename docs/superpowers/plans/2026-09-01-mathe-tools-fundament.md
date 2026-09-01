# mathe-tools Fundament — Implementierungsplan

> **Für agentische Ausführung:** ERFORDERLICHE SUB-SKILL: `superpowers:subagent-driven-development` (empfohlen) oder `superpowers:executing-plans`, um diesen Plan Aufgabe für Aufgabe abzuarbeiten. Die Schritte nutzen Checkbox-Syntax (`- [ ]`).

**Ziel:** Aus der Einzeldatei `flaechenrechner.html` wird ein öffentliches Repo `Xveyn/mathe-tools` mit Startseite, geteilten Bausteinen unter `shared/` und dem Flächenrechner als erstem Werkzeug — bei unverändertem Verhalten.

**Architektur:** Reines HTML/CSS/JS ohne Build. Geteilte Bausteine hängen als IIFE-Module an einem globalen Objekt `MT` und werden über klassische `<script src>`-Tags eingebunden, damit jede Seite sowohl per Doppelklick (`file://`) als auch über GitHub Pages läuft. Der Umbau ist ein reiner Umzug: erst wird das Original als lauffähige Kopie an seinen Zielort gelegt, dann wandert Modul für Modul nach `shared/`, und nach jedem Schritt wird gegen Referenz-Screenshots des Originals verglichen.

**Tech Stack:** HTML5, CSS Custom Properties, ES5-JavaScript (`var`, IIFE, `"use strict"`), Canvas 2D. Keine Abhängigkeiten. Prüfung mit Playwright über die `mcp__playwright-edge__*`-Werkzeuge. Veröffentlichung mit `gh` (eingeloggt als `Xveyn`).

**Spec:** `docs/superpowers/specs/2026-09-01-mathe-tools-design.md`

---

## Globale Randbedingungen

Diese Punkte gelten für **jede** Aufgabe:

- **Kein Build.** Kein npm, kein Bundler, keine `package.json`, kein Node-Schritt zum Betrieb.
- **Keine ES-Module.** Ausschließlich `<script src="...">` ohne `type="module"`. Grund: Browser blockieren Modul-Importe über `file://` als Cross-Origin.
- **Keine externen Abhängigkeiten.** Keine CDN-Skripte, keine Web-Fonts von fremden Servern. Nur Systemschriften.
- **Relative Pfade.** Alle `src`/`href`/Links relativ (`../../shared/expr.js`), niemals absolut mit führendem `/` — sonst bricht `file://` oder Pages.
- **Sprache:** Oberfläche, Codekommentare, README und Commit-Nachrichten auf Deutsch.
- **Stil:** ES5-artig — `var`, IIFE, `"use strict"`. Kein `let`/`const`/Pfeilfunktionen, damit der Code zum Bestand passt.
- **Namensraum:** Jede `shared/*.js` beginnt mit `var MT = MT || {};` und hängt genau einen Teilbereich an. Die Reihenfolge der Script-Tags darf keine Rolle spielen.
- **Verhalten bleibt gleich.** Dies ist ein Refactoring. Jede sichtbare Abweichung ist ein Fehler, außer sie ist in diesem Plan ausdrücklich als Änderung benannt.
- **Original nicht anfassen.** `../import files/flaechenrechner.html` liegt außerhalb des Repos, bleibt unverändert und wird nie committet.
- **Commit-Nachrichten** enden mit den beiden Zeilen:
  ```
  Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_016ra8LtfH4uUnzFZLtRKBJp
  ```

## Feste Pfade

| Kürzel | Pfad |
|---|---|
| REPO | `F:\Einige_Dateien\TH_Koeln\Mathematik 2\Tools\mathe-tools` |
| ORIGINAL | `F:\Einige_Dateien\TH_Koeln\Mathematik 2\Tools\import files\flaechenrechner.html` |
| SHOTS | `C:\Users\<NUTZER>\AppData\Local\Temp\claude\F--Einige-Dateien-TH-Koeln-Mathematik-2-Tools\83a2610e-7078-4633-a91f-4c692215577c\scratchpad\shots` |
| URL_ORIGINAL | `file:///F:/Einige_Dateien/TH_Koeln/Mathematik%202/Tools/import%20files/flaechenrechner.html` |
| URL_TOOL | `file:///F:/Einige_Dateien/TH_Koeln/Mathematik%202/Tools/mathe-tools/tools/flaechenrechner/index.html` |
| URL_START | `file:///F:/Einige_Dateien/TH_Koeln/Mathematik%202/Tools/mathe-tools/index.html` |

## Prüfroutine P

Weil es keine automatisierten Tests gibt und die Ausgabe visuell ist, ist **Prüfroutine P** der Testzyklus dieses Plans. Sie ist hier einmal vollständig beschrieben; die Aufgaben verweisen darauf mit „Prüfroutine P gegen `<name>` laufen lassen".

Die Zustände sind deterministisch: der Zufallsgenerator in `fitQuadratic` läuft mit festem Startwert `12345`, die Startwinkel der 3D-Ansicht sind fest (`az=-0.62`, `el=0.58`). Gleiche Eingaben ergeben also pixelgleiche Ausgaben.

Ablauf mit den `mcp__playwright-edge__*`-Werkzeugen:

1. `browser_resize` auf Breite `1400`, Höhe `1000`.
2. Seite laden. **`browser_navigate` weist `file://`-URLs ab**; nimm dafür `browser_run_code_unsafe` mit `await page.goto(URL)`. Bei `https://`-URLs (Aufgabe 8) arbeitet `browser_navigate` normal.
3. `browser_wait_for` mit `time: 1` (Layout und erstes Zeichnen abwarten).
4. `browser_console_messages` — **es darf keine Meldung vom Typ `error` geben.** Eine einzige Fehlermeldung lässt die Prüfung durchfallen.
5. `browser_take_screenshot` mit `fullPage: true`, Dateiname `<name>-01-start.png` in SHOTS.
6. Für jeden der sechs Beispiel-Chips, in dieser Reihenfolge — `(a)`, `(b)`, `(c)`, `(d)`, `(e)`, `(f)`: `browser_click` auf den Chip, `browser_wait_for` mit `time: 1`, dann `browser_take_screenshot` mit `fullPage: true` als `<name>-02-chip-a.png` … `<name>-07-chip-f.png`.
7. Zurück auf den Ausgangsterm: `browser_evaluate` mit
   ```js
   () => { const i = document.getElementById('fx'); i.value = '-x^2/4 - y^2/9'; i.dispatchEvent(new Event('input')); }
   ```
8. Regler prüfen. Für jede der vier IDs `sH`, `sY`, `sX`, `sR` nacheinander Minimum, Mitte und Maximum setzen, per `browser_evaluate`:
   ```js
   (id, anteil) => {
     const s = document.getElementById(id);
     const lo = parseFloat(s.min), hi = parseFloat(s.max);
     s.value = lo + (hi - lo) * anteil;
     s.dispatchEvent(new Event('input'));
   }
   ```
   Nach jedem Setzen `browser_take_screenshot` mit `fullPage: true` als `<name>-08-<id>-<anteil>.png` (Anteil als `0`, `50`, `100`). Danach jeden Regler wieder auf die Mitte stellen, damit der nächste Schritt vergleichbar bleibt — außer `sR`, der zurück auf den Wert `4` geht.
9. 3D-Ansicht drehen: `browser_evaluate` mit
   ```js
   () => {
     const c = document.getElementById('c3d');
     const r = c.getBoundingClientRect();
     const mk = (t, dx, dy) => c.dispatchEvent(new PointerEvent(t, {
       bubbles: true, pointerId: 1,
       clientX: r.left + r.width / 2 + dx,
       clientY: r.top + r.height / 2 + dy
     }));
     mk('pointerdown', 0, 0); mk('pointermove', 90, -40); mk('pointerup', 90, -40);
   }
   ```
   Danach `browser_take_screenshot` mit `fullPage: true` als `<name>-09-gedreht.png`.
10. Kaputter Term: `browser_evaluate` mit
    ```js
    () => {
      const i = document.getElementById('fx');
      i.value = 'sin(x';
      i.dispatchEvent(new Event('input'));
      return { rot: i.classList.contains('bad'), text: document.getElementById('err').textContent };
    }
    ```
    Erwartet: `rot` ist `true` und `text` ist nicht leer. Dann `browser_take_screenshot` als `<name>-10-fehler.png`.
11. `browser_console_messages` erneut — weiterhin keine `error`-Meldung. Ein abgefangener Parserfehler darf **nicht** in der Konsole landen.

Das ergibt **21 Bilder je Durchlauf** (1 Start + 6 Chips + 12 Reglerstellungen + 1 gedreht + 1 Fehler).

`browser_take_screenshot` legt seine Dateien nicht in SHOTS ab, sondern im Arbeitsverzeichnis des MCP-Servers (`…\Tools`). Verschiebe sie danach mit den vorgesehenen Namen nach SHOTS; entscheidend ist nur, dass dort am Ende genau die 21 benannten Dateien des Durchlaufs liegen.

**Vergleich:** Nach dem ersten Durchlauf (Aufgabe 1) sind die Bilder unter dem Namen `referenz` die Wahrheit. Jeder spätere Durchlauf erzeugt Bilder unter einem eigenen Namen und wird bildweise dagegen gehalten. Der Vergleich läuft über die Dateigröße als Vorfilter und, wo diese abweicht, über das Betrachten beider Bilder:

```bash
cd "<SHOTS>" && for f in referenz-*.png; do n="${f#referenz-}"; a=$(stat -c%s "$f"); b=$(stat -c%s "<name>-$n" 2>/dev/null || echo 0); d=$(( a > b ? a-b : b-a )); if [ "$b" = "0" ]; then echo "FEHLT: $n"; elif [ "$d" -gt $(( a / 100 )) ]; then echo "ABWEICHUNG >1%: $n ($a vs $b)"; fi; done; echo "Vergleich fertig"
```

Ausgabe nur `Vergleich fertig` heißt: bestanden. Jede gemeldete Zeile muss angeschaut und erklärt werden, bevor die Aufgabe als fertig gilt. Eine Abweichung, die sich nicht aus einer im Plan benannten Änderung erklärt, ist ein Fehler und wird behoben, nicht wegdiskutiert.

## Dateiübersicht

| Datei | Verantwortung | Entsteht in |
|---|---|---|
| `.gitattributes` | Zeilenenden im Repo auf LF festnageln | Aufgabe 1 |
| `.nojekyll` | Pages soll nichts wegfiltern | Aufgabe 1 |
| `LICENSE` | MIT | Aufgabe 1 |
| `tools/flaechenrechner/index.html` | Markup, Einbindung, Verdrahtung des Werkzeugs | Aufgabe 1, danach fortlaufend erleichtert |
| `shared/theme.css` | Farbtokens und Grundtypografie | Aufgabe 2 |
| `shared/ui.css` | Wiederverwendbare Bausteine (Panels, Regler, Chips, Raster) | Aufgabe 2 |
| `shared/expr.js` | `MT.expr` — Term-Parser über beliebige Variablenlisten | Aufgabe 3 |
| `shared/canvas.js` | `MT.canvas` — Zeichenflächen-Grundlagen, Skalen, Farben | Aufgabe 4 |
| `shared/plot2d.js` | `MT.plot2d` — Höhenlinien und Linienzüge | Aufgabe 5 |
| `shared/scene3d.js` | `MT.scene3d` — Kamera, Projektion, Drehen per Maus | Aufgabe 6 |
| `tools/flaechenrechner/flaechenrechner.js` | Nur noch Werkzeug-Eigenes: quadratische Analyse, Zeichenlogik, Verdrahtung | Aufgabe 3, danach fortlaufend erleichtert |
| `index.html` | Startseite mit Werkzeug-Katalog | Aufgabe 7 |
| `README.md` | Worum es geht, wie man ein Werkzeug ergänzt | Aufgabe 7 |

## Abweichungen von der Spec

Beim Lesen des Originalcodes haben sich drei Signaturen der Spec als unpraktisch erwiesen. Der Plan setzt stattdessen um:

1. **`MT.canvas.mapper(bereich, breite, hoehe)` → `MT.canvas.linear(vonMin, vonMax, nachMin, nachMax)`.** Die beiden 2D-Ansichten bilden unterschiedlich ab (die Karte quadratisch und zentriert, der Schnitt mit vier verschiedenen Rändern). Eine einzelne lineare Abbildung deckt beide Achsen beider Ansichten ab; ein Bereichsobjekt hätte für keine der beiden gepasst. `toWorld` braucht kein Aufrufer und entfällt (YAGNI).
2. **`MT.canvas.grid(...)` / `MT.canvas.axes(...)` entfallen.** Karte und Schnitt zeichnen inhaltlich verschiedene Gitter — die Karte ein x-y-Gitter mit ganzzahligen Linien, der Schnitt ein x-z-Gitter mit berechneter z-Schrittweite. Gemeinsam ist nur die Schrittweitenrechnung; die zieht als `MT.canvas.tickStep(spanne)` nach `shared/canvas.js`, das Zeichnen bleibt beim Werkzeug. Eine Funktion mit einem Dutzend Parametern wäre schlechter als zwei ehrliche Schleifen.
3. **`MT.scene3d.camera(breite, hoehe, azimut, elevation)` → `MT.scene3d.camera(opt)`** mit einem Objekt, weil die Kamera zusätzlich `range`, `zMin` und `zMax` braucht, um die Fläche einzupassen. Sieben Stellungsparameter wären nicht lesbar.

Diese drei Punkte sind Verfeinerungen desselben Schnitts, keine neue Architektur.

---

### Aufgabe 1: Repo-Gerüst und Referenzaufnahme

Ziel: Das Repo hat seine Rahmendateien, der Flächenrechner liegt als unveränderte, lauffähige Kopie an seinem Zielort, und die Referenz-Screenshots des Originals stehen. Ab hier ist jeder weitere Schritt messbar.

**Dateien:**
- Anlegen: `.gitattributes`
- Anlegen: `.nojekyll`
- Anlegen: `LICENSE`
- Anlegen: `tools/flaechenrechner/index.html` (byte-gleiche Kopie des Originals)

**Schnittstellen:**
- Nutzt: nichts
- Liefert: die Referenzbilder `referenz-*.png` in SHOTS, gegen die alle späteren Aufgaben prüfen

- [ ] **Schritt 1: `.gitattributes` anlegen**

Ohne diese Datei schreibt Git unter Windows CRLF in die Arbeitskopie und der erste Push sieht aus, als sei jede Zeile geändert.

```
* text=auto eol=lf
*.png binary
```

- [ ] **Schritt 2: `.nojekyll` anlegen**

Leere Datei. GitHub Pages schickt den Inhalt sonst durch Jekyll, das Ordner und Dateien mit führendem Unterstrich verschluckt.

```bash
cd "<REPO>" && : > .nojekyll && ls -la .nojekyll
```

- [ ] **Schritt 3: `LICENSE` anlegen**

MIT-Lizenz, Jahr `2026`, Rechteinhaber `Xveyn`. Der amtliche Wortlaut:

```
MIT License

Copyright (c) 2026 Xveyn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Schritt 4: Original an seinen Zielort kopieren**

Unverändert, Byte für Byte. Der Umbau beginnt von einem lauffähigen Zustand aus.

```bash
cd "<REPO>" && mkdir -p tools/flaechenrechner shared && cp "../import files/flaechenrechner.html" tools/flaechenrechner/index.html && wc -c tools/flaechenrechner/index.html
```

Erwartet: `34715 tools/flaechenrechner/index.html`

- [ ] **Schritt 5: Referenzbilder vom Original aufnehmen**

```bash
mkdir -p "<SHOTS>"
```

Dann **Prüfroutine P** auf URL_ORIGINAL laufen lassen, Bildname-Präfix `referenz`. Es gibt in diesem Durchlauf nichts zu vergleichen — er *erzeugt* die Vergleichsbasis. Die Konsolen-Prüfung (Schritte 4 und 11 der Routine) gilt trotzdem: Wenn das Original schon Fehler wirft, muss das jetzt auffallen und dokumentiert werden, sonst erklärt man sie später fälschlich dem Umbau zu.

Erwartet: 21 Dateien `referenz-*.png` in SHOTS, keine `error`-Meldung.

- [ ] **Schritt 6: Die Kopie prüfen**

**Prüfroutine P** auf URL_TOOL laufen lassen, Präfix `t1`, danach den Vergleichsbefehl aus der Routine.

Erwartet: Ausgabe genau `Vergleich fertig`. Die Kopie ist byte-gleich, also müssen die Bilder es auch sein. Weicht hier etwas ab, stimmt etwas an der Prüfroutine nicht — nicht am Code.

- [ ] **Schritt 7: Commit**

```bash
cd "<REPO>" && git add .gitattributes .nojekyll LICENSE tools && git commit -m "Repo-Gerüst und Flächenrechner als Ausgangsstand" -m "Rahmendateien, MIT-Lizenz und der unveränderte Flächenrechner an seinem
Zielort unter tools/. Referenz-Screenshots des Originals sind aufgenommen.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016ra8LtfH4uUnzFZLtRKBJp"
```

---

### Aufgabe 2: CSS nach `shared/` ziehen

Ziel: Der `<style>`-Block der Seite verschwindet, das Aussehen bleibt exakt gleich. Farbtokens und wiederverwendbare Bausteine liegen getrennt, damit die Startseite und spätere Werkzeuge sie einbinden können.

**Dateien:**
- Anlegen: `shared/theme.css`
- Anlegen: `shared/ui.css`
- Ändern: `tools/flaechenrechner/index.html` (Zeilen 7–117, der `<style>`-Block)

**Schnittstellen:**
- Nutzt: nichts
- Liefert: die CSS-Variablen `--abyss`, `--panel-a`, `--panel-b`, `--edge`, `--ink`, `--dim`, `--gold`, `--mint`, `--rose`, `--grid`, `--axis` auf `:root`; die Klassen `.wrap`, `.chips`, `.chip`, `.entry`, `.fxlabel`, `.err`, `.grid`, `.sliders`, `.sl`, `.analysis`

- [ ] **Schritt 1: `shared/theme.css` anlegen**

Die Variablen aus dem `:root`-Block des Originals, plus zwei neue: `--grid` und `--axis` tragen die Farbwerte, die heute doppelt im JS-Objekt `COL` stehen. Ab Aufgabe 4 liest das JS sie von hier.

```css
/* Farbtokens und Grundtypografie für alle Werkzeuge. */

:root{
  --abyss:#061821;
  --panel-a:rgba(16,58,76,.55);
  --panel-b:rgba(6,24,33,.55);
  --edge:rgba(94,158,182,.22);
  --ink:#D6E8EF;
  --dim:#7FA6B6;
  --gold:#F0B429;
  --mint:#5FD1BE;
  --rose:#E58BB5;
  /* Nur vom Canvas gelesen, siehe MT.canvas.colors() */
  --grid:rgba(94,158,182,.14);
  --axis:rgba(150,200,216,.55);
}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{
  background:radial-gradient(120% 90% at 50% 0%, #0C2E3E 0%, var(--abyss) 70%) fixed;
  color:var(--ink);
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  font-size:15px;line-height:1.55;min-height:100vh;
  padding:clamp(16px,3vw,40px);
}
h1{
  font-family:Georgia,"Iowan Old Style",serif;font-weight:400;
  font-size:clamp(1.3rem,3vw,1.9rem);margin:0 0 .35rem;line-height:1.2;
}
.lede{margin:0 0 22px;color:var(--dim);max-width:66ch;font-size:.92rem}
```

- [ ] **Schritt 2: `shared/ui.css` anlegen**

Alles übrige aus dem `<style>`-Block, in unveränderter Reihenfolge und mit unveränderten Werten. Übernimm aus `tools/flaechenrechner/index.html` wörtlich die Regeln von `.wrap{...}` bis einschließlich `.analysis .case.rose span:first-child{...}`, **ohne** die Regeln, die schon in `theme.css` stehen (`:root`, `*`, `html,body`, `body`, `h1`, `.lede`).

Die Datei beginnt mit:

```css
/* Wiederverwendbare Bausteine: Panels, Eingabe, Regler, Analyse-Raster. */
```

Nichts umformatieren, nichts zusammenfassen, keine Werte anfassen. Jede Änderung hier ist eine Abweichung, die die Prüfroutine finden wird.

- [ ] **Schritt 3: `<style>`-Block in der Seite ersetzen**

In `tools/flaechenrechner/index.html` den kompletten `<style>...</style>`-Block löschen und an seiner Stelle einsetzen:

```html
<link rel="stylesheet" href="../../shared/theme.css">
<link rel="stylesheet" href="../../shared/ui.css">
```

- [ ] **Schritt 4: Prüfen**

**Prüfroutine P** auf URL_TOOL laufen lassen, Präfix `t2`, danach den Vergleichsbefehl.

Erwartet: `Vergleich fertig` ohne weitere Zeilen. Meldet der Vergleich etwas, fehlt eine CSS-Regel oder eine ist beim Verschieben verändert worden.

- [ ] **Schritt 5: Commit**

```bash
cd "<REPO>" && git add shared/theme.css shared/ui.css tools/flaechenrechner/index.html && git commit -m "CSS in shared/theme.css und shared/ui.css aufteilen" -m "Farbtokens und Grundtypografie getrennt von den wiederverwendbaren
Bausteinen. Neu sind --grid und --axis; sie lösen ab Aufgabe 4 die
doppelte Farbpflege im JS ab.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016ra8LtfH4uUnzFZLtRKBJp"
```

---

### Aufgabe 3: `shared/expr.js` — der Parser, über beliebige Variablen

Ziel: Der Term-Parser liegt als `MT.expr` in `shared/` und ist nicht mehr auf `x` und `y` festgenagelt. Gleichzeitig wandert das restliche JavaScript aus der HTML-Datei in `tools/flaechenrechner/flaechenrechner.js`, damit die folgenden Aufgaben in einer Skriptdatei arbeiten können.

Dies ist die einzige Aufgabe mit einer inhaltlichen Codeänderung. Die Knotenfunktionen des Parsers nehmen künftig ein Werte-Array statt zweier benannter Argumente entgegen; `compile` verpackt das nach außen so, dass Aufrufer weiterhin `f(x, y)` schreiben.

**Dateien:**
- Anlegen: `shared/expr.js`
- Anlegen: `tools/flaechenrechner/flaechenrechner.js`
- Ändern: `tools/flaechenrechner/index.html` (`<script>`-Block am Ende)

**Schnittstellen:**
- Nutzt: nichts
- Liefert:
  - `MT.expr.compile(term, vars)` → Funktion; `vars` ist ein Array von Variablennamen, Vorgabe `['x','y']`. Die zurückgegebene Funktion nimmt so viele Argumente wie `vars` Einträge hat, in derselben Reihenfolge. Wirft `Error` mit deutscher Meldung bei ungültigem Term.
  - `MT.expr.FUNCS` → Objekt Name → Funktion
  - `MT.expr.CONSTS` → Objekt Name → Zahl

- [ ] **Schritt 1: `shared/expr.js` anlegen**

```js
/* MT.expr — Parser für Funktionsterme über einer frei wählbaren
   Variablenliste. Tokenizer mit impliziter Multiplikation, danach
   rekursiver Abstieg. Die Knotenfunktionen nehmen ein Werte-Array
   entgegen; compile() verpackt sie zu einer Funktion mit
   Stellungsargumenten. */

var MT = MT || {};

MT.expr = (function(){
"use strict";

var FUNCS = {
  sin:Math.sin, cos:Math.cos, tan:Math.tan,
  asin:Math.asin, acos:Math.acos, atan:Math.atan,
  sinh:Math.sinh, cosh:Math.cosh, tanh:Math.tanh,
  exp:Math.exp, ln:Math.log, log:Math.log,
  sqrt:Math.sqrt, abs:Math.abs, sign:Math.sign
};
var CONSTS = { pi:Math.PI, e:Math.E };
var NAMES = Object.keys(FUNCS).concat(Object.keys(CONSTS)).sort(function(a,b){return b.length-a.length;});

function tokenize(src, vars){
  var t=[], i=0, s=src.replace(/\s+/g,'').replace(/,/g,'.');
  while(i<s.length){
    var ch=s[i];
    if(/[0-9.]/.test(ch)){
      var n=''; while(i<s.length && /[0-9.]/.test(s[i])) n+=s[i++];
      if(isNaN(parseFloat(n))) throw new Error('Ungültige Zahl "'+n+'"');
      t.push({t:'num',v:parseFloat(n)}); continue;
    }
    if(/[a-zA-Z]/.test(ch)){
      var run=''; while(i<s.length && /[a-zA-Z]/.test(s[i])) run+=s[i++];
      while(run.length){
        var hit=null;
        for(var k=0;k<NAMES.length;k++){
          if(run.indexOf(NAMES[k])===0){ hit=NAMES[k]; break; }
        }
        if(hit && FUNCS[hit]){ t.push({t:'func',v:hit}); run=run.slice(hit.length); continue; }
        if(hit && CONSTS[hit]){ t.push({t:'const',v:CONSTS[hit]}); run=run.slice(hit.length); continue; }
        var c=run[0], vi=vars.indexOf(c);
        if(vi>=0){ t.push({t:'var',v:c,i:vi}); run=run.slice(1); continue; }
        throw new Error('Unbekannter Name "'+c+'" — erlaubt sind '+vars.join(', ')+', e, pi und die üblichen Funktionen');
      }
      continue;
    }
    if('+-*/^()'.indexOf(ch)>=0){ t.push({t:ch}); i++; continue; }
    throw new Error('Zeichen "'+ch+'" wird nicht verstanden');
  }
  // implizite Multiplikation
  var out=[];
  for(var j=0;j<t.length;j++){
    if(j>0){
      var p=t[j-1], q=t[j];
      var pEnd = (p.t==='num'||p.t==='var'||p.t==='const'||p.t===')');
      var qStart = (q.t==='num'||q.t==='var'||q.t==='const'||q.t==='func'||q.t==='(');
      if(pEnd && qStart) out.push({t:'*'});
    }
    out.push(t[j]);
  }
  return out;
}

function parse(tokens){
  var pos=0;
  function peek(){ return tokens[pos]; }
  function eat(type){
    var tk=tokens[pos];
    if(!tk || tk.t!==type) throw new Error('Erwartet: "'+type+'"');
    pos++; return tk;
  }
  function expr(){
    var node=term();
    while(peek() && (peek().t==='+'||peek().t==='-')){
      var op=tokens[pos++].t, rhs=term(), l=node;
      node = op==='+' ? function(a,b){return function(v){return a(v)+b(v);};}(l,rhs)
                      : function(a,b){return function(v){return a(v)-b(v);};}(l,rhs);
    }
    return node;
  }
  function term(){
    var node=unary();
    while(peek() && (peek().t==='*'||peek().t==='/')){
      var op=tokens[pos++].t, rhs=unary(), l=node;
      node = op==='*' ? function(a,b){return function(v){return a(v)*b(v);};}(l,rhs)
                      : function(a,b){return function(v){return a(v)/b(v);};}(l,rhs);
    }
    return node;
  }
  function unary(){
    if(peek() && peek().t==='-'){ pos++; var u=unary(); return function(v){return -u(v);}; }
    if(peek() && peek().t==='+'){ pos++; return unary(); }
    return power();
  }
  function power(){
    var base=atom();
    if(peek() && peek().t==='^'){
      pos++; var ex=unary();
      return function(v){return Math.pow(base(v),ex(v));};
    }
    return base;
  }
  function atom(){
    var tk=peek();
    if(!tk) throw new Error('Term endet unerwartet');
    if(tk.t==='num'||tk.t==='const'){ pos++; var c=tk.v; return function(){return c;}; }
    if(tk.t==='var'){ pos++; var idx=tk.i; return function(v){return v[idx];}; }
    if(tk.t==='func'){
      pos++; var fn=FUNCS[tk.v]; eat('('); var a=expr(); eat(')');
      return function(v){return fn(a(v));};
    }
    if(tk.t==='('){ pos++; var e=expr(); eat(')'); return e; }
    throw new Error('Unerwartetes Zeichen im Term');
  }
  var root=expr();
  if(pos<tokens.length) throw new Error('Der Term hat einen Rest, der nicht dazugehört');
  return root;
}

function compile(src, vars){
  vars = vars || ['x','y'];
  var root = parse(tokenize(src, vars));
  // arguments ist array-artig; die Knoten greifen nur per Index zu.
  var fn = function(){ return root(arguments); };
  var probeA=[], probeB=[];
  for(var i=0;i<vars.length;i++){ probeA.push(0.31+i*0.16); probeB.push(1.1-i*0.4); }
  if(!isFinite(fn.apply(null,probeA)) && !isFinite(fn.apply(null,probeB)))
    throw new Error('Die Funktion liefert keine Zahlenwerte');
  return fn;
}

return { compile:compile, FUNCS:FUNCS, CONSTS:CONSTS };
})();
```

Zur Probeauswertung: Das Original prüft mit `f(0.31,0.47)` und `f(1.1,0.7)`. Die Formeln `0.31+i*0.16` und `1.1-i*0.4` treffen für `vars=['x','y']` drei dieser vier Werte exakt; `1.1-0.4` ergibt in Gleitkomma `0.7000000000000001` statt `0.7`. Das ist folgenlos, weil an den Proben nur `isFinite` geprüft wird — aber es ist nicht dieselbe Zahl, und diese Zeile sagt das lieber, als Exaktheit zu behaupten, die nicht besteht.

`vars` ist kein beliebiges Array: Variablennamen sind einzelne Buchstaben und dürfen nicht mit einer Funktion oder Konstante kollidieren. `compile` prüft das und wirft sonst. Ohne diese Prüfung verschluckt der Tokenizer eine Variable namens `e` stillschweigend und rechnet mit der Eulerschen Zahl weiter.

- [ ] **Schritt 2: Restliches JavaScript in eine eigene Datei ziehen**

Den gesamten Inhalt des `<script>`-Blocks aus `tools/flaechenrechner/index.html` — also von `(function(){` bis `})();` — nach `tools/flaechenrechner/flaechenrechner.js` verschieben, **ohne** den Parser-Abschnitt (`/* ==== Parser ==== */` bis zum Ende von `compile`, im Original die Zeilen 178–292). Der lebt jetzt in `shared/expr.js`.

Die Datei beginnt mit:

```js
/* Flächenrechner: quadratische Analyse, Zeichnen der vier Ansichten
   und die Verdrahtung der Bedienelemente. */

(function(){
"use strict";
```

An der Stelle, wo `rebuild()` bisher `compile(src)` aufruft, steht künftig:

```js
    f=MT.expr.compile(src);
```

Sonst ändert sich in dieser Datei nichts.

- [ ] **Schritt 3: Skripte einbinden**

In `tools/flaechenrechner/index.html` den leeren `<script>`-Block ersetzen durch:

```html
<script src="../../shared/expr.js"></script>
<script src="flaechenrechner.js"></script>
```

Reihenfolge beachten: `expr.js` steht vor `flaechenrechner.js`.

- [ ] **Schritt 4: Parser gezielt prüfen**

Der Parser ist die einzige Stelle mit echter Logikänderung und lässt sich unmittelbar prüfen. `browser_navigate` auf URL_TOOL, dann `browser_evaluate` mit:

```js
() => {
  const c = MT.expr.compile;
  const nah = (a, b) => Math.abs(a - b) < 1e-9;
  const faelle = [
    ['x+y',            [2, 3],    5],
    ['x*y',            [2, 3],    6],
    ['x-y',            [2, 3],   -1],
    ['x/y',            [3, 2],    1.5],
    ['-x^2/4 - y^2/9', [2, 3],   -2],
    ['2x',             [3, 0],    6],
    ['2(x+y)',         [1, 2],    6],
    ['x^2',            [-3, 0],   9],
    ['-x^2',           [3, 0],   -9],
    ['2^3^2',          [0, 0],    512],
    ['sin(0)',         [0, 0],    0],
    ['exp(0)',         [0, 0],    1],
    ['pi',             [0, 0],    Math.PI],
    ['e',              [0, 0],    Math.E],
    ['3x - 4y',        [2, 1],    2],
    ['-4xy',           [2, 3],   -24],
    ['1,5x',           [2, 0],    3]
  ];
  const schlecht = faelle.filter(([t, a, e]) => !nah(c(t)(...a), e))
                         .map(([t, a, e]) => `${t} bei ${a} → ${c(t)(...a)}, erwartet ${e}`);

  // Variablenliste frei wählbar
  const g = c('a*b + t', ['a', 'b', 't']);
  if (!nah(g(2, 3, 4), 10)) schlecht.push('freie Variablenliste: ' + g(2, 3, 4) + ', erwartet 10');
  const h = c('u^2', ['u']);
  if (!nah(h(5), 25)) schlecht.push('eine Variable: ' + h(5) + ', erwartet 25');

  // Fehlerfälle
  const wirft = (t, v) => { try { c(t, v); return false; } catch (e) { return true; } };
  if (!wirft('sin(x')) schlecht.push('sin(x sollte werfen');
  if (!wirft('x$y')) schlecht.push('x$y sollte werfen');
  if (!wirft('x + q')) schlecht.push('unbekannte Variable q sollte werfen');
  if (!wirft('x', ['u'])) schlecht.push('x sollte bei vars=[u] werfen');
  if (wirft('x + q', ['x', 'q'])) schlecht.push('q sollte bei vars=[x,q] gültig sein');

  return schlecht.length ? schlecht : 'alle Parserfälle bestanden';
}
```

Erwartet: die Zeichenkette `alle Parserfälle bestanden`. Eine Liste von Abweichungen ist ein Fehlschlag — beheben und erneut ausführen.

Zwei Fälle sind bewusst dabei: `2^3^2` prüft die Rechtsassoziativität der Potenz (512, nicht 64), `1,5x` das Komma als Dezimaltrennzeichen.

- [ ] **Schritt 5: Prüfroutine**

**Prüfroutine P** auf URL_TOOL laufen lassen, Präfix `t3`, danach den Vergleichsbefehl.

Erwartet: `Vergleich fertig` ohne weitere Zeilen.

- [ ] **Schritt 6: Commit**

```bash
cd "<REPO>" && git add shared/expr.js tools/flaechenrechner && git commit -m "Term-Parser als MT.expr auslagern, über freier Variablenliste" -m "Die Knotenfunktionen nehmen jetzt ein Werte-Array entgegen, compile()
verpackt sie zu einer Funktion mit Stellungsargumenten. Damit können
spätere Werkzeuge denselben Parser mit einer oder drei Variablen nutzen.
Das übrige Skript liegt nun in flaechenrechner.js.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016ra8LtfH4uUnzFZLtRKBJp"
```

---

### Aufgabe 4: `shared/canvas.js` — Zeichenflächen-Grundlagen

Ziel: Das dreifach kopierte HiDPI-Setup, die lineare Achsenabbildung und die Farbwerte liegen an einer Stelle. Die doppelte Farbpflege in CSS und JS endet.

**Dateien:**
- Anlegen: `shared/canvas.js`
- Ändern: `tools/flaechenrechner/flaechenrechner.js` (`COL`, `draw3D`, `draw2Dmap`, `drawSection`)
- Ändern: `tools/flaechenrechner/index.html` (Script-Tag ergänzen)

**Schnittstellen:**
- Nutzt: nichts
- Liefert:
  - `MT.canvas.fit(cv, ctx)` → `{w, h}` — passt die Pixelgröße an CSS-Breite und `devicePixelRatio` an, setzt die Transformation, leert die Fläche und liefert die Maße in CSS-Pixeln.
  - `MT.canvas.linear(vonMin, vonMax, nachMin, nachMax)` → `function(v)` — lineare Abbildung. `nachMin > nachMax` ist zulässig und kehrt die Achse um.
  - `MT.canvas.tickStep(spanne)` → Zahl — Schrittweite für etwa fünf Gitterlinien über die Spanne.
  - `MT.canvas.colors()` → `{gold, mint, rose, dim, grid, axis, ink}` — die Farbwerte aus den CSS-Variablen.

- [ ] **Schritt 1: `shared/canvas.js` anlegen**

```js
/* MT.canvas — was jede Zeichenfläche braucht: scharfe Auflösung,
   lineare Achsen, Gitterschritte und die Farben aus dem Stylesheet. */

var MT = MT || {};

MT.canvas = (function(){
"use strict";

function fit(cv, ctx){
  var w=cv.clientWidth, h=cv.clientHeight, dpr=window.devicePixelRatio||1;
  if(cv.width!==Math.round(w*dpr)){ cv.width=Math.round(w*dpr); cv.height=Math.round(h*dpr); }
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,w,h);
  return {w:w,h:h};
}

function linear(vonMin, vonMax, nachMin, nachMax){
  var k=(nachMax-nachMin)/(vonMax-vonMin);
  return function(v){ return nachMin+(v-vonMin)*k; };
}

function tickStep(spanne){
  return Math.pow(10, Math.round(Math.log10(spanne/5)));
}

var zwischenspeicher=null;
function colors(){
  if(zwischenspeicher) return zwischenspeicher;
  var s=getComputedStyle(document.documentElement);
  function v(name){ return s.getPropertyValue(name).trim(); }
  zwischenspeicher={
    gold:v('--gold'), mint:v('--mint'), rose:v('--rose'),
    dim:v('--dim'), grid:v('--grid'), axis:v('--axis'), ink:v('--ink')
  };
  return zwischenspeicher;
}

return { fit:fit, linear:linear, tickStep:tickStep, colors:colors };
})();
```

Der Zwischenspeicher ist bewusst: `getComputedStyle` bei jedem Zeichnen aufzurufen kostet ein Layout. Die Farben ändern sich zur Laufzeit nicht.

- [ ] **Schritt 2: Script-Tag ergänzen**

In `tools/flaechenrechner/index.html`, vor `flaechenrechner.js`:

```html
<script src="../../shared/canvas.js"></script>
```

- [ ] **Schritt 3: `COL` ersetzen**

In `flaechenrechner.js` die Zeile

```js
var COL={gold:'#F0B429',mint:'#5FD1BE',rose:'#E58BB5',dim:'#7FA6B6',grid:'rgba(94,158,182,.14)',axis:'rgba(150,200,216,.55)'};
```

ersetzen durch

```js
var COL=MT.canvas.colors();
```

- [ ] **Schritt 4: HiDPI-Setup an drei Stellen ersetzen**

In `draw3D` die vier Zeilen

```js
  var w=C3.clientWidth,h=C3.clientHeight,dpr=window.devicePixelRatio||1;
  if(C3.width!==Math.round(w*dpr)){C3.width=Math.round(w*dpr);C3.height=Math.round(h*dpr);}
  G3.setTransform(dpr,0,0,dpr,0,0); G3.clearRect(0,0,w,h);
```

ersetzen durch

```js
  var masse=MT.canvas.fit(C3,G3), w=masse.w, h=masse.h;
```

In `draw2Dmap` entsprechend mit `CM`/`GM`:

```js
  var masse=MT.canvas.fit(CM,GM), w=masse.w, h=masse.h;
```

In `drawSection` entsprechend mit den Parametern `cv`/`ctx`:

```js
  var masse=MT.canvas.fit(cv,ctx), w=masse.w, h=masse.h;
```

- [ ] **Schritt 5: Achsenabbildungen ersetzen**

In `draw2Dmap` die Zeilen

```js
  var cx=w/2, cy=h/2;
  var X=function(v){return cx+v*s;}, Y=function(v){return cy-v*s;};
```

ersetzen durch

```js
  var cx=w/2, cy=h/2;
  var X=MT.canvas.linear(-RANGE,RANGE,cx-RANGE*s,cx+RANGE*s);
  var Y=MT.canvas.linear(-RANGE,RANGE,cy+RANGE*s,cy-RANGE*s);
```

In `drawSection` die Zeilen

```js
  var sx=(w-padL-padR)/(2*RANGE), sy=(h-padT-padB)/(zMax-zMin);
  var X=function(v){return padL+(v+RANGE)*sx;}, Y=function(v){return h-padB-(v-zMin)*sy;};
```

ersetzen durch

```js
  var X=MT.canvas.linear(-RANGE,RANGE,padL,w-padR);
  var Y=MT.canvas.linear(zMin,zMax,h-padB,padT);
```

Die Variablen `sx` und `sy` werden danach nirgends mehr gebraucht und entfallen mit. Prüfe das mit `grep -n "sx\|sy" tools/flaechenrechner/flaechenrechner.js` — es darf kein Treffer übrig bleiben.

- [ ] **Schritt 6: Gitterschrittweite ersetzen**

In `drawSection` die Zeile

```js
  var zstep=Math.pow(10,Math.round(Math.log10((zMax-zMin)/5)));
```

ersetzen durch

```js
  var zstep=MT.canvas.tickStep(zMax-zMin);
```

- [ ] **Schritt 7: Prüfen**

**Prüfroutine P** auf URL_TOOL laufen lassen, Präfix `t4`, danach den Vergleichsbefehl.

Erwartet: `Vergleich fertig` ohne weitere Zeilen. Die Farbwerte kommen jetzt als CSS-Zeichenketten aus `getComputedStyle` statt als Literale — der Browser normalisiert `#F0B429` möglicherweise zu `rgb(240, 180, 41)`. Das ist derselbe Farbwert und darf keinen Bildunterschied ergeben. Tut es das doch, stimmt der Variablenname nicht.

- [ ] **Schritt 8: Commit**

```bash
cd "<REPO>" && git add shared/canvas.js tools/flaechenrechner && git commit -m "Zeichenflächen-Grundlagen als MT.canvas auslagern" -m "HiDPI-Setup, lineare Achsenabbildung und Gitterschrittweite lagen
dreifach kopiert in den Zeichenfunktionen. Die Farben liest MT.canvas
jetzt aus den CSS-Variablen, statt sie ein zweites Mal im JS zu führen.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016ra8LtfH4uUnzFZLtRKBJp"
```

---

### Aufgabe 5: `shared/plot2d.js` — Höhenlinien und Linienzüge

Ziel: Die Marching-Squares-Berechnung und das Zeichnen unterbrochener Linienzüge stehen als geteilte Bausteine bereit. `contour` bekommt sein Gitter als Argument, statt es aus dem Modulzustand zu ziehen.

**Dateien:**
- Anlegen: `shared/plot2d.js`
- Ändern: `tools/flaechenrechner/flaechenrechner.js` (`contour` entfernen, drei Aufrufstellen, zwei Kurvenschleifen)
- Ändern: `tools/flaechenrechner/index.html` (Script-Tag ergänzen)

**Schnittstellen:**
- Nutzt: nichts
- Liefert:
  - `MT.plot2d.contour(gitter, niveau)` → Array von Segmenten `[[x1,y1],[x2,y2]]` in Weltkoordinaten. `gitter` ist `{n, vals, min, max}`: `n` Zellen je Achse, `vals` ein `Float64Array` der Länge `(n+1)²` mit `vals[i*(n+1)+j]` als Wert bei `x = min + (max-min)*i/n`, `y = min + (max-min)*j/n`. `NaN`-Werte lassen die betroffene Zelle aus.
  - `MT.plot2d.segments(ctx, segs, X, Y)` — zeichnet die Segmente als ein Pfad. `X` und `Y` bilden Welt- auf Pixelkoordinaten ab. Setzt weder Farbe noch Strichstärke; das macht der Aufrufer vorher.
  - `MT.plot2d.polyline(ctx, punkte)` — zeichnet einen Linienzug. `punkte` ist ein Array aus `{x, y}` und `null`; jedes `null` unterbricht den Zug. Setzt weder Farbe noch Strichstärke.

- [ ] **Schritt 1: `shared/plot2d.js` anlegen**

```js
/* MT.plot2d — Höhenlinien nach Marching Squares und Linienzüge, die an
   undefinierten Stellen unterbrechen. */

var MT = MT || {};

MT.plot2d = (function(){
"use strict";

function contour(gitter, niveau){
  var segs=[], n=gitter.n, vals=gitter.vals, min=gitter.min, spanne=gitter.max-gitter.min;
  function w(i){ return min+spanne*i/n; }
  function val(i,j){ return vals[i*(n+1)+j]; }
  for(var i=0;i<n;i++){
    for(var j=0;j<n;j++){
      var v=[val(i,j),val(i+1,j),val(i+1,j+1),val(i,j+1)];
      if(v.some(isNaN)) continue;
      var p=[[w(i),w(j)],[w(i+1),w(j)],[w(i+1),w(j+1)],[w(i),w(j+1)]];
      var idx=0;
      for(var k=0;k<4;k++) if(v[k]>niveau) idx|=(1<<k);
      if(idx===0||idx===15) continue;
      var ip=function(a,b){
        var t=(niveau-v[a])/(v[b]-v[a]);
        return [p[a][0]+t*(p[b][0]-p[a][0]), p[a][1]+t*(p[b][1]-p[a][1])];
      };
      var e=[];
      if(((idx>>0)&1)!==((idx>>1)&1)) e.push(ip(0,1));
      if(((idx>>1)&1)!==((idx>>2)&1)) e.push(ip(1,2));
      if(((idx>>2)&1)!==((idx>>3)&1)) e.push(ip(2,3));
      if(((idx>>3)&1)!==((idx>>0)&1)) e.push(ip(3,0));
      for(var m=0;m+1<e.length;m+=2) segs.push([e[m],e[m+1]]);
    }
  }
  return segs;
}

function segments(ctx, segs, X, Y){
  ctx.beginPath();
  for(var i=0;i<segs.length;i++){
    var s=segs[i];
    ctx.moveTo(X(s[0][0]),Y(s[0][1]));
    ctx.lineTo(X(s[1][0]),Y(s[1][1]));
  }
  ctx.stroke();
}

function polyline(ctx, punkte){
  ctx.beginPath();
  var begonnen=false;
  for(var i=0;i<punkte.length;i++){
    var p=punkte[i];
    if(!p){ begonnen=false; continue; }
    if(begonnen) ctx.lineTo(p.x,p.y);
    else { ctx.moveTo(p.x,p.y); begonnen=true; }
  }
  ctx.stroke();
}

return { contour:contour, segments:segments, polyline:polyline };
})();
```

Gegenüber dem Original ist `function ip(...)` innerhalb der Schleife zu `var ip = function(...)` geworden. Funktionsdeklarationen in Blöcken sind im strikten Modus blockgebunden und damit zwar zulässig, aber unnötig heikel; das Verhalten ist identisch.

- [ ] **Schritt 2: Script-Tag ergänzen**

In `tools/flaechenrechner/index.html`, vor `flaechenrechner.js`:

```html
<script src="../../shared/plot2d.js"></script>
```

- [ ] **Schritt 3: `contour` aus dem Werkzeug entfernen und Gitter bereitstellen**

Die komplette Funktion `contour(level)` samt dem Kommentar `/* ---------- Marching Squares ---------- */` aus `flaechenrechner.js` löschen.

In `sampleGrid()` die letzte Zeile

```js
  samples={n:n,vals:vals};
```

ersetzen durch

```js
  samples={n:n,vals:vals,min:-RANGE,max:RANGE};
```

Danach eine kleine Hilfsfunktion direkt hinter `gx` einsetzen, damit die drei Aufrufstellen kurz bleiben:

```js
function hoehenlinie(niveau){ return MT.plot2d.contour(samples,niveau); }
```

Die drei Aufrufe `contour(cH)` in `draw3D`, `contour(lv)` und `contour(cH)` in `draw2Dmap` werden zu `hoehenlinie(cH)` beziehungsweise `hoehenlinie(lv)`.

Prüfe mit `grep -n "contour" tools/flaechenrechner/flaechenrechner.js`, dass kein Aufruf übersehen wurde — es darf nur noch die Zeile in `hoehenlinie` übrig sein.

- [ ] **Schritt 4: Segmentzeichnen ersetzen**

In `draw2Dmap` die Schar-Schleife: aus

```js
    GM.strokeStyle='rgba(94,158,182,.36)'; GM.lineWidth=1; GM.beginPath();
    sg.forEach(function(sm){ GM.moveTo(X(sm[0][0]),Y(sm[0][1])); GM.lineTo(X(sm[1][0]),Y(sm[1][1])); });
    GM.stroke();
```

wird

```js
    GM.strokeStyle='rgba(94,158,182,.36)'; GM.lineWidth=1;
    MT.plot2d.segments(GM,sg,X,Y);
```

Und die aktive Höhenlinie: aus

```js
  GM.strokeStyle=COL.gold; GM.lineWidth=2.6; GM.beginPath();
  act.forEach(function(sm){ GM.moveTo(X(sm[0][0]),Y(sm[0][1])); GM.lineTo(X(sm[1][0]),Y(sm[1][1])); });
  GM.stroke();
```

wird

```js
  GM.strokeStyle=COL.gold; GM.lineWidth=2.6;
  MT.plot2d.segments(GM,act,X,Y);
```

In `draw3D` zeichnet die Höhenlinie über die 3D-Projektion, nicht über `X`/`Y`. Dort wird aus

```js
  var segs=contour(cH);
  G3.strokeStyle=COL.gold; G3.lineWidth=2.4; G3.beginPath();
  segs.forEach(function(s){
    var p1=P(s[0][0],s[0][1],cH), p2=P(s[1][0],s[1][1],cH);
    G3.moveTo(p1.x,p1.y); G3.lineTo(p2.x,p2.y);
  });
  G3.stroke();
```

das hier. `MT.plot2d.segments` passt an dieser Stelle **nicht**: es bildet x und y getrennt ab, die 3D-Projektion braucht aber beide Koordinaten gleichzeitig. Also `polyline` mit einer Unterbrechung nach jedem Segment:

```js
  var segs=hoehenlinie(cH);
  var punkte=[];
  segs.forEach(function(s){
    punkte.push(P(s[0][0],s[0][1],cH));
    punkte.push(P(s[1][0],s[1][1],cH));
    punkte.push(null);
  });
  G3.strokeStyle=COL.gold; G3.lineWidth=2.4;
  MT.plot2d.polyline(G3,punkte);
```

`P` liefert `{x, y, d}`; `polyline` liest nur `x` und `y`, das zusätzliche `d` stört nicht.

- [ ] **Schritt 5: Kurvenzüge ersetzen**

In `draw3D`, Funktion `ridge`: aus

```js
  function ridge(fixY, val, color){
    G3.strokeStyle=color; G3.lineWidth=2.2; G3.beginPath();
    var started=false;
    for(var t=0;t<=120;t++){
      var u=-RANGE+2*RANGE*t/120;
      var z=fixY? f(u,val) : f(val,u);
      if(!isFinite(z)||z<zMin||z>zMax){ started=false; continue; }
      var p=fixY? P(u,val,z) : P(val,u,z);
      if(started) G3.lineTo(p.x,p.y); else { G3.moveTo(p.x,p.y); started=true; }
    }
    G3.stroke();
  }
```

wird

```js
  function ridge(fixY, val, color){
    var punkte=[];
    for(var t=0;t<=120;t++){
      var u=-RANGE+2*RANGE*t/120;
      var z=fixY? f(u,val) : f(val,u);
      if(!isFinite(z)||z<zMin||z>zMax){ punkte.push(null); continue; }
      punkte.push(fixY? P(u,val,z) : P(val,u,z));
    }
    G3.strokeStyle=color; G3.lineWidth=2.2;
    MT.plot2d.polyline(G3,punkte);
  }
```

In `drawSection` die Schlusskurve: aus

```js
  ctx.strokeStyle=color; ctx.lineWidth=2.4; ctx.beginPath();
  var started=false;
  for(var t=0;t<=260;t++){
    var u=-RANGE+2*RANGE*t/260;
    var v=fixY? f(u,val) : f(val,u);
    if(!isFinite(v)||v<zMin-0.5||v>zMax+0.5){ started=false; continue; }
    var px=X(u), py=Y(Math.max(zMin,Math.min(zMax,v)));
    if(started) ctx.lineTo(px,py); else { ctx.moveTo(px,py); started=true; }
  }
  ctx.stroke();
```

wird

```js
  var punkte=[];
  for(var t=0;t<=260;t++){
    var u=-RANGE+2*RANGE*t/260;
    var v=fixY? f(u,val) : f(val,u);
    if(!isFinite(v)||v<zMin-0.5||v>zMax+0.5){ punkte.push(null); continue; }
    punkte.push({x:X(u), y:Y(Math.max(zMin,Math.min(zMax,v)))});
  }
  ctx.strokeStyle=color; ctx.lineWidth=2.4;
  MT.plot2d.polyline(ctx,punkte);
```

Achtung: `drawSection` nutzt seit Aufgabe 4 den Bezeichner `masse` für die Maße der Zeichenfläche. Der Name `punkte` ist neu und kollidiert mit nichts; prüfe das mit `grep -n "punkte" tools/flaechenrechner/flaechenrechner.js`.

- [ ] **Schritt 6: Prüfen**

**Prüfroutine P** auf URL_TOOL laufen lassen, Präfix `t5`, danach den Vergleichsbefehl.

Erwartet: `Vergleich fertig` ohne weitere Zeilen. Achte besonders auf `t5-01-start.png` und `t5-02-chip-a.png`: dort sind Höhenlinien, Schar und beide Schnittkurven gleichzeitig sichtbar.

- [ ] **Schritt 7: Commit**

```bash
cd "<REPO>" && git add shared/plot2d.js tools/flaechenrechner && git commit -m "Höhenlinien und Linienzüge als MT.plot2d auslagern" -m "contour bekommt sein Gitter jetzt als Argument statt aus dem
Modulzustand. Das Zeichnen von Segmenten und unterbrochenen Linienzügen
lag fünffach kopiert in den Zeichenfunktionen.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016ra8LtfH4uUnzFZLtRKBJp"
```

---

### Aufgabe 6: `shared/scene3d.js` — Kamera, Projektion, Drehen

Ziel: Die 3D-Projektion und das Drehen per Maus liegen als geteilte Bausteine bereit. Die Blickwinkel wandern aus freien Modulvariablen in ein Zustandsobjekt, das die Kamera mitführt.

**Dateien:**
- Anlegen: `shared/scene3d.js`
- Ändern: `tools/flaechenrechner/flaechenrechner.js` (`az`/`el`, `proj`, `makeCam`, `draw3D`, Drag-Verdrahtung)
- Ändern: `tools/flaechenrechner/index.html` (Script-Tag ergänzen)

**Schnittstellen:**
- Nutzt: nichts
- Liefert:
  - `MT.scene3d.camera(opt)` → Kameraobjekt `{cx, cy, s, az, el}`. `opt` ist `{w, h, az, el, range, zMin, zMax}`; die Kamera wird so skaliert, dass der Quader `[-range,range]² × [zMin,zMax]` mit 18 Pixeln Rand hineinpasst.
  - `MT.scene3d.project(x, y, z, cam)` → `{x, y, d}` — Bildkoordinaten und Tiefe. Größeres `d` heißt weiter hinten; zum Sortieren absteigend nach `d` zeichnen.
  - `MT.scene3d.enableDrag(cv, winkel, beiAenderung)` — Drehen per Zeiger. `winkel` ist ein Objekt mit `az` und `el`, das an Ort und Stelle geändert wird; `beiAenderung` wird nach jeder Änderung ohne Argumente gerufen. `el` wird auf `[0.12, 1.45]` begrenzt.

- [ ] **Schritt 1: `shared/scene3d.js` anlegen**

```js
/* MT.scene3d — schiefe Parallelprojektion für Flächen über der x-y-Ebene,
   samt Drehen per Zeiger. */

var MT = MT || {};

MT.scene3d = (function(){
"use strict";

function project(x, y, z, cam){
  var ca=Math.cos(cam.az), sa=Math.sin(cam.az);
  var ce=Math.cos(cam.el), se=Math.sin(cam.el);
  var x1=x*ca-y*sa, y1=x*sa+y*ca;
  return { x:cam.cx+x1*cam.s, y:cam.cy-(y1*se+z*ce)*cam.s, d:y1*ce-z*se };
}

function camera(opt){
  var cam={cx:0, cy:0, s:1, az:opt.az, el:opt.el};
  var R=opt.range, Z=[opt.zMin,opt.zMax], pts=[];
  for(var i=0;i<2;i++) for(var j=0;j<2;j++) for(var k=0;k<2;k++)
    pts.push(project(i?R:-R, j?R:-R, Z[k], cam));
  var a=1e9,b=-1e9,c=1e9,d=-1e9;
  pts.forEach(function(p){ a=Math.min(a,p.x); b=Math.max(b,p.x); c=Math.min(c,p.y); d=Math.max(d,p.y); });
  var pad=18;
  cam.s=Math.min((opt.w-2*pad)/(b-a),(opt.h-2*pad)/(d-c));
  cam.cx=opt.w/2-((a+b)/2)*cam.s;
  cam.cy=opt.h/2+((c+d)/2)*cam.s;
  return cam;
}

function enableDrag(cv, winkel, beiAenderung){
  var zug=null;
  cv.addEventListener('pointerdown', function(e){
    zug={x:e.clientX, y:e.clientY, az:winkel.az, el:winkel.el};
    cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener('pointermove', function(e){
    if(!zug) return;
    winkel.az = zug.az+(e.clientX-zug.x)*0.008;
    winkel.el = Math.max(0.12, Math.min(1.45, zug.el+(e.clientY-zug.y)*0.006));
    beiAenderung();
  });
  ['pointerup','pointercancel'].forEach(function(ev){
    cv.addEventListener(ev, function(){ zug=null; });
  });
}

return { camera:camera, project:project, enableDrag:enableDrag };
})();
```

Die Skalierung im Original ruft `proj` mit einer Kamera auf, deren `s` noch `1` und deren `cx`/`cy` noch `0` sind, und misst daran die Ausdehnung. Das bleibt hier genauso — `camera` gibt sich die Zwischenkamera selbst.

- [ ] **Schritt 2: Script-Tag ergänzen**

In `tools/flaechenrechner/index.html`, vor `flaechenrechner.js`:

```html
<script src="../../shared/scene3d.js"></script>
```

- [ ] **Schritt 3: Blickwinkel als Objekt führen**

In `flaechenrechner.js` die Zeile

```js
var az=-0.62, el=0.58;
```

ersetzen durch

```js
var blick={az:-0.62, el:0.58};
```

- [ ] **Schritt 4: `proj` und `makeCam` entfernen**

Die Funktionen `proj`, `makeCam` und den Kommentar `/* ---------- 3D ---------- */` aus `flaechenrechner.js` löschen. `clampZ` bleibt — die gehört zur Darstellungslogik des Werkzeugs.

- [ ] **Schritt 5: `draw3D` umstellen**

Die Zeile

```js
  var cam=makeCam(w,h), P=function(x,y,z){return proj(x,y,z,cam);};
```

ersetzen durch

```js
  var cam=MT.scene3d.camera({w:w, h:h, az:blick.az, el:blick.el,
                             range:RANGE, zMin:zMin, zMax:zMax});
  var P=function(x,y,z){ return MT.scene3d.project(x,y,z,cam); };
```

- [ ] **Schritt 6: Drag-Verdrahtung ersetzen**

Den ganzen Block

```js
var drag=null;
C3.addEventListener('pointerdown',function(e){ drag={x:e.clientX,y:e.clientY,az:az,el:el}; C3.setPointerCapture(e.pointerId); });
C3.addEventListener('pointermove',function(e){
  if(!drag) return;
  az=drag.az+(e.clientX-drag.x)*0.008;
  el=Math.max(0.12,Math.min(1.45,drag.el+(e.clientY-drag.y)*0.006));
  draw3D();
});
['pointerup','pointercancel'].forEach(function(ev){ C3.addEventListener(ev,function(){drag=null;}); });
```

ersetzen durch

```js
MT.scene3d.enableDrag(C3, blick, draw3D);
```

- [ ] **Schritt 7: Auf verwaiste Bezeichner prüfen**

```bash
cd "<REPO>" && grep -n "\baz\b\|\bel\b\|makeCam\|\bproj\b\|\bdrag\b" tools/flaechenrechner/flaechenrechner.js
```

Erwartet: **genau zwei** Treffer — die Definition `var blick={az:-0.62, el:0.58};` und ihre Verwendung in `draw3D`. Der Punkt in `blick.az` ist für `grep` eine Wortgrenze, deshalb greift `\baz\b` auch dort; das sind die vorgesehenen Feldnamen, keine Reste. Jeder weitere Treffer ist ein übersehener Rest. Schärfer prüfen, ob wirklich nichts liegenblieb, tut:

```bash
cd "<REPO>" && grep -n "makeCam\|\bdrag\b\|function proj" tools/flaechenrechner/flaechenrechner.js
```

Hier ist keine Ausgabe erwartet.

- [ ] **Schritt 8: Prüfen**

**Prüfroutine P** auf URL_TOOL laufen lassen, Präfix `t6`, danach den Vergleichsbefehl.

Erwartet: `Vergleich fertig` ohne weitere Zeilen. Schritt 9 der Routine (Drehen) ist hier der wichtigste: `t6-09-gedreht.png` muss `referenz-09-gedreht.png` entsprechen. Weicht nur dieses eine Bild ab, stimmt die Winkelrechnung in `enableDrag` nicht.

- [ ] **Schritt 9: Commit**

```bash
cd "<REPO>" && git add shared/scene3d.js tools/flaechenrechner && git commit -m "Kamera, Projektion und Drehen als MT.scene3d auslagern" -m "Die Blickwinkel liegen nicht mehr als freie Modulvariablen herum,
sondern in einem Zustandsobjekt, das die Kamera mitführt und das
enableDrag verändert.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016ra8LtfH4uUnzFZLtRKBJp"
```

---

### Aufgabe 7: Startseite und README

Ziel: Das Repo hat ein Gesicht. Wer die Adresse öffnet, sieht, was es gibt, und kommt mit einem Klick ins Werkzeug.

**Dateien:**
- Anlegen: `index.html`
- Anlegen: `README.md`

**Schnittstellen:**
- Nutzt: `shared/theme.css`, `shared/ui.css`
- Liefert: die Klassen `.katalog` und `.karte`, an denen sich spätere Werkzeug-Karten orientieren

- [ ] **Schritt 1: `index.html` anlegen**

```html
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mathe-Werkzeuge</title>
<link rel="stylesheet" href="shared/theme.css">
<link rel="stylesheet" href="shared/ui.css">
<style>
  .katalog{
    display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));
    gap:14px;margin-top:24px;
  }
  .karte{
    display:block;text-decoration:none;color:inherit;
    background:linear-gradient(180deg,var(--panel-a),var(--panel-b));
    border:1px solid var(--edge);border-radius:3px;padding:16px 17px 14px;
  }
  .karte:hover,.karte:focus-visible{border-color:var(--gold);outline:none}
  .karte h2{
    font-family:Georgia,"Iowan Old Style",serif;font-weight:400;
    font-size:1.05rem;margin:0 0 6px;color:var(--ink);
  }
  .karte p{margin:0 0 12px;color:var(--dim);font-size:.88rem}
  .karte em{
    font-family:Georgia,serif;font-style:italic;font-size:.95rem;color:var(--gold);
  }
</style>
</head>
<body>
<div class="wrap">

  <h1>Mathe-Werkzeuge</h1>
  <p class="lede">Kleine Seiten, die Begriffe aus der Analysis sichtbar machen. Jede läuft im Browser, ohne Installation, und lässt sich mit Reglern durchfahren, bis der Zusammenhang klar wird.</p>

  <div class="katalog">
    <a class="karte" href="tools/flaechenrechner/index.html">
      <h2>Flächenrechner</h2>
      <p>Eine Funktion zweier Veränderlicher als Fläche im Raum, dazu die Höhenlinien von oben und die Schnitte mit den beiden senkrechten Ebenen — alle vier Ansichten gleichzeitig und farblich verknüpft.</p>
      <em>z = f(x, y)</em>
    </a>
  </div>

</div>
</body>
</html>
```

Der Karten-Link zeigt auf `index.html` und **nicht** auf das Verzeichnis. Über HTTP wäre beides gleichwertig, weil der Server ein Verzeichnis selbst zur Indexdatei auflöst — über `file://` tut der Browser das nicht, sondern zeigt seine eigene Verzeichnisliste. Da die Doppelklick-Tauglichkeit eine bindende Randbedingung ist, entscheidet der schwächere der beiden Fälle. Im README darf der Link weiterhin auf das Verzeichnis zeigen: den rendert GitHub, und dort ist die Verzeichnisansicht das Gewollte.

- [ ] **Schritt 2: `README.md` anlegen**

```markdown
# Mathe-Werkzeuge

Kleine Browser-Seiten, die Begriffe aus der Analysis sichtbar machen.
Entstanden neben der Vorlesung Mathematik 2.

**→ [xveyn.github.io/mathe-tools](https://xveyn.github.io/mathe-tools/)**

## Was drin ist

| Werkzeug | Worum es geht |
|---|---|
| [Flächenrechner](tools/flaechenrechner/) | Eine Funktion `z = f(x, y)` als Fläche im Raum, ihre Höhenlinien und die beiden senkrechten Schnitte — gleichzeitig und farblich verknüpft. |

## Wie es gebaut ist

Reines HTML, CSS und JavaScript. Kein Build, keine Abhängigkeiten, kein
npm. Jede Seite läuft genauso gut per Doppelklick aus dem Dateisystem
wie über den Link oben.

```
shared/     gemeinsame Bausteine, hängen am globalen Objekt MT
tools/      ein Ordner je Werkzeug, jeder mit eigener index.html
index.html  die Startseite
```

Die gemeinsamen Bausteine:

| Baustein | Wofür |
|---|---|
| `shared/expr.js` | `MT.expr.compile(term, vars)` — Terme wie `-x^2/4 - y^2/9` in aufrufbare Funktionen übersetzen |
| `shared/canvas.js` | `MT.canvas` — scharfe Zeichenflächen, lineare Achsen, Farben aus dem Stylesheet |
| `shared/plot2d.js` | `MT.plot2d` — Höhenlinien nach Marching Squares, unterbrochene Linienzüge |
| `shared/scene3d.js` | `MT.scene3d` — Projektion in den Raum und Drehen per Maus |
| `shared/theme.css` | Farbtokens und Grundtypografie |
| `shared/ui.css` | Panels, Regler, Chips, Raster |

Eingebunden wird mit klassischen `<script src="…">`-Tags, absichtlich
ohne `type="module"`: Browser blockieren Modul-Importe über `file://`,
und die Seiten sollen ohne Server laufen.

## Ein Werkzeug ergänzen

1. `tools/<name>/index.html` anlegen, `shared/theme.css` und
   `shared/ui.css` einbinden, dazu die gebrauchten `shared/*.js`.
2. Werkzeug-eigenes JavaScript nach `tools/<name>/<name>.js`.
3. Eine Karte in `index.html` ergänzen.

Alle Pfade relativ halten — ein führender `/` bricht sowohl den
Doppelklick als auch die Veröffentlichung.

## Lizenz

MIT, siehe [LICENSE](LICENSE).
```

- [ ] **Schritt 3: Startseite prüfen**

`browser_resize` auf `1400`×`1000`, `browser_navigate` auf URL_START, `browser_wait_for` mit `time: 1`.

Dann `browser_console_messages` — keine `error`-Meldung.

Dann `browser_click` auf die Karte „Flächenrechner", `browser_wait_for` mit `time: 1`, danach `browser_evaluate`:

```js
() => ({
  adresse: location.pathname,
  ueberschrift: document.querySelector('h1')?.textContent ?? '(keine)',
  flaechen: document.querySelectorAll('canvas').length
})
```

Erwartet: `adresse` endet auf `tools/flaechenrechner/index.html`, `ueberschrift` beginnt mit `Flächenrechner für Funktionen`, `flaechen` ist `4`. Damit ist belegt, dass der relative Link trägt.

`browser_take_screenshot` mit `fullPage: true` als `start-01.png` in SHOTS, zur Ansicht.

- [ ] **Schritt 4: Commit**

```bash
cd "<REPO>" && git add index.html README.md && git commit -m "Startseite mit Werkzeug-Katalog und README" -m "Die Startseite trägt dieselbe Optik wie die Werkzeuge und verlinkt sie
über Karten. Das README erklärt den Aufbau und wie ein weiteres Werkzeug
dazukommt.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016ra8LtfH4uUnzFZLtRKBJp"
```

---

### Aufgabe 8: Veröffentlichen und Endabnahme

Ziel: Das Repo liegt öffentlich unter `Xveyn/mathe-tools`, GitHub Pages liefert es aus, und die veröffentlichte Fassung ist dieselbe wie die geprüfte.

Diese Aufgabe geht nach außen. **Vor dem ersten Push die Zustimmung des Nutzers einholen** — ein öffentliches Repo lässt sich nicht ungeschehen machen, und der Nutzer hat zwei GitHub-Konten im Zugriff (`Xveyn` ist aktiv, `Xveyn-MH` nicht).

**Dateien:** keine neuen

**Schnittstellen:**
- Nutzt: das Ergebnis aller vorigen Aufgaben
- Liefert: `https://xveyn.github.io/mathe-tools/`

- [ ] **Schritt 1: Arbeitsstand kontrollieren**

```bash
cd "<REPO>" && git status --short && echo "--- Verlauf ---" && git log --oneline && echo "--- Dateien im Repo ---" && git ls-files
```

Erwartet: `git status --short` gibt nichts aus. In `git ls-files` stehen genau die geplanten Dateien — insbesondere **keine** Kopie des Originals außerhalb von `tools/`, keine Screenshots, keine Ordner mit Zwischenständen.

- [ ] **Schritt 2: Zustimmung einholen**

Dem Nutzer nennen: Kontoname `Xveyn`, Repo `mathe-tools`, Sichtbarkeit öffentlich, Dateiliste aus Schritt 1. Fragen, ob gepusht werden soll. **Ohne ausdrückliches Ja hier anhalten.**

- [ ] **Schritt 3: Repo anlegen und pushen**

```bash
cd "<REPO>" && gh repo create Xveyn/mathe-tools --public --source=. --push --description "Kleine Browser-Werkzeuge, die Begriffe aus der Analysis sichtbar machen"
```

- [ ] **Schritt 4: GitHub Pages einschalten**

```bash
cd "<REPO>" && gh api -X POST repos/Xveyn/mathe-tools/pages -f "source[branch]=main" -f "source[path]=/" ; gh api repos/Xveyn/mathe-tools/pages --jq '.html_url, .status'
```

Der erste Aufruf antwortet mit `409`, falls Pages schon läuft — das ist in Ordnung, der zweite Aufruf zeigt dann den Zustand. Erwartet: `https://xveyn.github.io/mathe-tools/` und ein Status, der auf `built` zuläuft. Der erste Bau dauert typischerweise ein bis zwei Minuten.

- [ ] **Schritt 5: Endabnahme auf der veröffentlichten Seite**

Warten, bis `gh api repos/Xveyn/mathe-tools/pages --jq '.status'` den Wert `built` liefert.

**Prüfroutine P** auf `https://xveyn.github.io/mathe-tools/tools/flaechenrechner/` laufen lassen, Präfix `live`, danach den Vergleichsbefehl.

Erwartet: `Vergleich fertig` ohne weitere Zeilen. Hier zeigt sich, ob ein Pfad doch absolut war — dann fehlt über HTTP ein Stylesheet oder ein Skript, und die Bilder weichen deutlich ab.

Zusätzlich `browser_navigate` auf `https://xveyn.github.io/mathe-tools/`, `browser_click` auf die Karte, und prüfen, dass das Werkzeug lädt.

- [ ] **Schritt 6: Doppelklick-Abnahme**

```bash
cd "<REPO>" && start "" "tools\flaechenrechner\index.html"
```

Der Nutzer bestätigt von Hand: Die Seite zeigt alle vier Ansichten, die Chips wechseln den Term, die Regler bewegen die Bilder, die 3D-Ansicht dreht sich beim Ziehen. Das ist der eine Punkt, den kein Werkzeug für uns prüfen kann — die Playwright-Läufe über `file://` decken ihn zwar ab, aber die Zusage „läuft per Doppelklick" verdient eine echte Bestätigung.

- [ ] **Schritt 7: Plan und Spec nachziehen**

Falls sich unterwegs etwas an den Modulschnitten geändert hat, den Abschnitt „Abweichungen von der Spec" in diesem Plan ergänzen, damit der nächste Leser den Ist-Zustand vorfindet.

```bash
cd "<REPO>" && git add docs && git commit -m "Plan und Spec auf den umgesetzten Stand ziehen" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016ra8LtfH4uUnzFZLtRKBJp" ; git push
```

Gibt es nichts nachzuziehen, entfällt der Commit — dann meldet `git commit` „nothing to commit" und das ist das erwartete Ergebnis.
