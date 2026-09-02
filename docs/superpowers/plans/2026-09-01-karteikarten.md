# Karteikarten Implementierungsplan

> **Für agentische Ausführung:** ERFORDERLICHE SUB-SKILL: `superpowers:subagent-driven-development` (empfohlen) oder `superpowers:executing-plans`, um diesen Plan Aufgabe für Aufgabe abzuarbeiten. Die Schritte nutzen Checkbox-Syntax (`- [ ]`).

**Ziel:** Das Repo bekommt einen zweiten Bereich: Karteikarten unter `karten/`, die Themen aus Mathematik 2 mit durchgerechneten, illustrierten Beispielen erklären — mit Querlinks zum Flächenrechner in beide Richtungen.

**Architektur:** Wie bisher reines HTML/CSS/JS ohne Build. Karten sind statisches HTML: eine Datei je Thema, jede Karte ein `<article>` mit Anker. Formeln als MathML, Bilder als Inline-SVG, beides ohne Bibliothek. Ein kleiner Baustein `MT.abfrage` verdeckt Formel und Beispiel auf Knopfdruck, ohne etwas zu speichern. Vorab werden vier klassenlose Selektoren in `shared/ui.css` auf Klassen umgestellt, damit Karten das Element `<figure>` benutzen können, ohne ungefragt wie eine Werkzeug-Tafel auszusehen.

**Tech Stack:** HTML5, MathML, Inline-SVG, CSS Custom Properties, ES5-JavaScript (`var`, IIFE, `"use strict"`). Keine Abhängigkeiten. Prüfung mit Playwright über die `mcp__playwright-edge__*`-Werkzeuge.

**Spec:** `docs/superpowers/specs/2026-09-01-karteikarten-design.md`
**Repoweite Regeln:** `CLAUDE.md` im Wurzelverzeichnis — bindend für jede Aufgabe.

---

## Globale Randbedingungen

Gelten für **jede** Aufgabe. Die Langfassung steht in `CLAUDE.md`.

- **Kein Build.** Kein npm, kein Bundler, keine `package.json`.
- **Keine ES-Module.** Klassische `<script src="…">` ohne `type="module"`; Browser blockieren Modul-Importe über `file://`.
- **Doppelklick muss funktionieren**, gleichrangig neben GitHub Pages.
- **Keine externen Abhängigkeiten**, keine CDN-Ressourcen, keine Fremdschriften.
- **Alle Pfade relativ**, niemals mit führendem `/`. Links zeigen auf `index.html`, nie auf ein Verzeichnis.
- **ES5-artiger Stil:** `var`, IIFE, `"use strict"`. Kein `let`, kein `const`, keine Pfeilfunktionen, keine Template-Literale.
- **Deutsch:** Oberfläche, Kommentare, Bezeichner, Commit-Nachrichten.
- **Keine Farbliterale** in einer Seite; Farben kommen als CSS-Variable aus `shared/theme.css`. Das gilt auch **im SVG** (`stroke="var(--gold)"`).
- **Namensraum:** `.karte` = Karteikarte, `.kachel` = Katalogeintrag der Startseite, `.tafel` = Zeichentafel eines Werkzeugs, `.ansichten` = deren Raster. Nicht vermischen.
- **Keine Testdateien, keine CI.** Geprüft wird am laufenden Bild, siehe unten.
- **Kein URL-Zustand.** Kein `?f=…`, auch nicht für Querlinks.
- **Commit-Nachrichten** enden mit:
  ```
  Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_016ra8LtfH4uUnzFZLtRKBJp
  ```

## Kürzel

Dieser Plan nennt keine absoluten Pfade — das war in der vorigen Runde ein kritischer Fund. Die Ausführung bekommt die Werte im Auftrag genannt.

| Kürzel | Bedeutung |
|---|---|
| REPO | das Repo-Verzeichnis |
| ORIGINAL | die unveränderte Ausgangsdatei des Flächenrechners, außerhalb des Repos |
| SHOTS | ein temporäres Verzeichnis für die Vergleichsbilder |

## Prüfroutine P

Der Bildvergleich des Flächenrechners, vollständig beschrieben im Fundament-Plan `2026-09-01-mathe-tools-fundament.md`, Abschnitt „Prüfroutine P". 21 Zustände als Screenshots, Konsolenprüfung, Vergleich gegen Referenzbilder.

**Die Referenzbilder existieren nicht mehr** — sie lagen im Sitzungsspeicher der vorigen Runde. Aufgabe 1 nimmt sie aus ORIGINAL neu auf. Vor Aufgabe 1 darf nichts an `shared/ui.css` oder am Flächenrechner geändert werden.

Zwei Werkzeug-Eigenheiten aus der vorigen Runde gelten weiter: `browser_navigate` weist `file://`-URLs ab (stattdessen `browser_run_code_unsafe` mit `await page.goto(URL)`), und `browser_take_screenshot` legt die Bilder im Arbeitsverzeichnis des MCP-Servers ab, von wo sie nach SHOTS zu verschieben sind.

## Kartenprüfung K

Der Testzyklus für alles Neue. Karten sind statischer Inhalt — es gibt nichts zu rechnen und daher nichts, was gegen Referenzbilder zu vergleichen wäre. Geprüft wird, dass die Seite hält, was sie verspricht.

Mit den `mcp__playwright-edge__*`-Werkzeugen, für die zu prüfende Kartenseite:

1. `browser_resize` auf Breite `1400`, Höhe `1000`.
2. Seite laden mit `browser_run_code_unsafe` und `await page.goto(URL)`.
3. `browser_wait_for` mit `time: 1`.
4. `browser_console_messages` — **keine** Meldung vom Typ `error`.
5. **Setzt der Browser die Formeln wirklich?** Zwei Schritte, die auf jeder Karte tragen, plus einen dritten nur für Karten mit Bruch. Wird MathML nicht unterstützt, ist `<math>` ein unbekanntes Inline-Element und der Inhalt läuft als Text durch.
   ```js
   () => {
     var kennt = typeof window.MathMLElement === 'function';
     var m = document.querySelector('math');
     var anzeige = m ? getComputedStyle(m).display : null;
     var bruch = document.querySelector('mfrac');
     var q = null;
     if (bruch) {
       q = bruch.getBoundingClientRect().height /
           bruch.firstElementChild.getBoundingClientRect().height;
     }
     return {
       mathml: kennt,
       anzeige: anzeige,
       bruchquotient: bruch ? q : 'kein Bruch auf dieser Karte',
       gesetzt: kennt && !!anzeige && anzeige.indexOf('math') >= 0 &&
                (q === null || q > 1.8)
     };
   }
   ```
   Erwartet: `gesetzt` ist `true`, `anzeige` ist `math` bzw. `block math`.

   **Eine Karte ohne Bruch ist kein Fehlerfall.** `extrema-mit-nebenbedingung` trägt weder `<mfrac>` noch `<msqrt>` noch `<msub>`; der dritte Schritt entfällt dort. Der frühere Maßstab — ein `<mfrac>` gegen die Körpergröße der Seite, Schwelle `1.6` — fand auf dieser Karte gar kein Element und hätte auf `gradient.html` einen Fehlalarm ausgelöst: der erste Bruch dort (`3/5` im Beispielfeld) ist 20,4 px hoch, die Schwelle läge bei 24 px. Der Quotient gegen den eigenen Zähler ist maßstabsfrei — über alle 16 Brüche des Repos liegt er zwischen 1,89 und 2,63, während er ohne Bruchsatz auf etwa 1 fällt.
6. **Verdeckt der Abfragemodus?**
   Der Mechanismus setzt **keine** Klasse auf das verdeckte Feld — er blendet dessen Kinder per `visibility` aus. Also wird genau das gemessen:
   ```js
   () => {
     const feld = document.querySelector('[data-verdeckbar]');
     const inhalt = feld.querySelector(':scope > *:not(.aufdecken)');
     const schalter = document.querySelector('#abfrage-schalter');
     const vorher = getComputedStyle(inhalt).visibility;
     schalter.click();
     const imModus = getComputedStyle(inhalt).visibility;
     const knopf = feld.querySelector('.aufdecken');
     const knopfSichtbar = knopf && getComputedStyle(knopf).display !== 'none';
     knopf.click();
     const nachAufdecken = getComputedStyle(inhalt).visibility;
     schalter.click();
     return { vorher, imModus, knopfSichtbar, nachAufdecken };
   }
   ```
   Erwartet: `vorher` ist `visible`, `imModus` ist `hidden`, `knopfSichtbar` ist `true`, `nachAufdecken` ist wieder `visible`. Weicht der gebaute Aufbau davon ab, formuliere die Abfrage auf ihn um und berichte, wie und warum.
7. **Läuft die Seite ohne JavaScript?** Neu laden mit abgeschaltetem JavaScript und prüfen, dass Formel und Beispiel sichtbar sind:
   ```js
   await page.context().addInitScript(() => {});
   const ctx = await page.context();
   await ctx.setJavaScriptEnabled ? null : null;
   ```
   Falls das Abschalten über die verfügbaren Werkzeuge nicht geht, ersatzweise prüfen, dass ohne den Schalterklick alles sichtbar ist und dass keine Karte im HTML von vornherein eine `verdeckt`-Klasse trägt. Berichte, welchen der beiden Wege du gegangen bist.
8. **Druckbild.** Mit `browser_run_code_unsafe`:
   ```js
   await page.emulateMedia({ media: 'print' });
   ```
   Dann Screenshot `fullPage: true` als `<name>-druck.png` in SHOTS und ansehen. Erwartet: heller Grund, dunkle Schrift, kein verdeckter Bereich, Schalter und Aufdeck-Knöpfe ausgeblendet, keine Karte mitten durchgeschnitten. Danach `await page.emulateMedia({ media: 'screen' });`.
9. **Jeder Link trägt.** Für jeden `.querlink` auf der Seite: anklicken, `browser_wait_for` mit `time: 1`, prüfen, dass die Zielseite geladen ist und ihre Überschrift stimmt, dann zurück.
10. `browser_console_messages` erneut — weiterhin keine `error`-Meldung.

## Dateiübersicht

| Datei | Verantwortung | Entsteht in |
|---|---|---|
| `shared/ui.css` | vier klassenlose Selektoren auf Klassen umgestellt | Aufgabe 2 |
| `tools/flaechenrechner/index.html` | Klassen `tafel`/`ansichten` ergänzt, Rücklink zu den Karten | Aufgabe 2, 6 |
| `shared/karten.css` | Kartenbausteine und Druck-Stylesheet | Aufgabe 3 |
| `shared/abfrage.js` | `MT.abfrage` — Verdecken und Aufdecken | Aufgabe 3 |
| `karten/partielle-ableitungen.html` | erste Karte, etabliert das Muster | Aufgabe 3 |
| `karten/gradient.html` | zweite Karte | Aufgabe 4 |
| `karten/extrema-mit-nebenbedingung.html` | dritte Karte, Härtetest | Aufgabe 5 |
| `karten/index.html` | Übersicht der Themen | Aufgabe 6 |
| `index.html` | zwei Abschnitte, `.karte` → `.kachel` | Aufgabe 6 |
| `README.md` | Karten erwähnt, Bausteintabelle ergänzt | Aufgabe 7 |

---

### Aufgabe 1: Referenzbilder neu aufnehmen

Ziel: Der Bildvergleich für den Flächenrechner ist wieder benutzbar. **Vor dieser Aufgabe darf nichts an `shared/ui.css` oder am Werkzeug geändert werden** — sonst misst die Referenz bereits den Umbau mit und ist wertlos.

**Dateien:** keine. Diese Aufgabe ändert nichts am Repo.

**Schnittstellen:**
- Nutzt: ORIGINAL, die unveränderte Ausgangsdatei außerhalb des Repos
- Liefert: 21 Bilder `referenz-*.png` in SHOTS, Vergleichsgrundlage für Aufgabe 2

- [ ] **Schritt 1: Sicherstellen, dass das Original unverändert ist**

```bash
cd "<REPO>" && git log --oneline -1 && git status --short && echo "(leer = sauber)"
```

Und die Ausgangsdatei selbst: sie liegt außerhalb des Repos und ist nie getrackt worden. Prüfe ihre Größe — sie muss `34715` Bytes betragen. Weicht sie ab, **halte an und melde es**: dann ist die Vergleichsgrundlage nicht mehr die, gegen die das Fundament geprüft wurde.

- [ ] **Schritt 2: Prüfroutine P auf ORIGINAL, Präfix `referenz`**

Vollständige Beschreibung im Fundament-Plan. Es entstehen 21 Bilder. Es gibt in diesem Durchlauf nichts zu vergleichen — er erzeugt die Vergleichsbasis.

Die Konsolenprüfung gilt trotzdem: Wirft schon das Original Fehler, muss das jetzt auffallen, sonst schreibt man sie später fälschlich dem Umbau zu.

- [ ] **Schritt 3: Gegenprobe mit dem heutigen Werkzeug, Präfix `v0`**

Prüfroutine P auf `tools/flaechenrechner/index.html` im heutigen, noch unveränderten Zustand, danach der Vergleichsbefehl gegen `referenz`.

Erwartet: genau `Vergleich fertig`. Das belegt, dass die frisch aufgenommene Referenz zum ausgelieferten Werkzeug passt — und damit, dass sie als Maßstab für Aufgabe 2 taugt. Weicht hier etwas ab, stimmt etwas an der Aufnahme nicht, **nicht** am Code; halte an und melde es.

- [ ] **Schritt 4: Kein Commit**

Diese Aufgabe erzeugt keine Repo-Änderung. Berichte nur, dass 21 Referenzbilder stehen und die Gegenprobe sauber war.

---

### Aufgabe 2: `shared/ui.css` entschärfen

Ziel: Die vier klassenlosen Selektoren in `shared/ui.css` treffen nur noch das, was sie treffen sollen. Damit kann eine Karte `<figure>` für ihre Illustration benutzen, ohne wie eine Werkzeug-Tafel auszusehen.

**Dateien:**
- Ändern: `shared/ui.css`
- Ändern: `tools/flaechenrechner/index.html`

**Schnittstellen:**
- Nutzt: die Referenzbilder aus Aufgabe 1
- Liefert: die Klassen `.tafel`, `.ansichten` als Vokabular der Werkzeug-Oberfläche; `figure`, `canvas`, `figcaption` sind wieder frei

- [ ] **Schritt 1: Selektoren umstellen**

In `shared/ui.css`, vier Ersetzungen. Die Regelkörper bleiben **Zeichen für Zeichen** gleich, nur der Selektor ändert sich:

| Zeile (heute) | wird zu |
|---|---|
| `.grid{display:grid;grid-template-columns:1.2fr 1fr;gap:14px}` | `.ansichten{display:grid;grid-template-columns:1.2fr 1fr;gap:14px}` |
| `figure{` | `.tafel{` |
| `canvas{width:100%;display:block;touch-action:none}` | `.tafel canvas{width:100%;display:block;touch-action:none}` |
| `figcaption{` | `.tafel figcaption{` |
| `figcaption em{…}` | `.tafel figcaption em{…}` |

Achte auf die Medienabfrage direkt unter `.grid` — sie lautet `@media (max-width:900px){.grid{grid-template-columns:1fr}}` und muss ebenfalls auf `.ansichten` umgestellt werden. Prüfe mit `grep -n "\.grid\|^figure\|^canvas\|^figcaption" shared/ui.css`, dass kein Vorkommen übersehen wurde.

- [ ] **Schritt 2: Markup nachziehen**

In `tools/flaechenrechner/index.html`:
- Das Element mit `class="grid"` bekommt `class="ansichten"`.
- Alle vier `<figure>` bekommen `class="tafel"`.

Die `<figcaption>` bleiben, wie sie sind — sie werden jetzt über `.tafel figcaption` getroffen.

- [ ] **Schritt 3: Auf Reste prüfen**

```bash
cd "<REPO>" && grep -rn "class=\"grid\"\|\.grid{" shared/ tools/ index.html ; echo "Suche beendet"
```

Erwartet: nur `Suche beendet`.

- [ ] **Schritt 4: Prüfroutine P, Präfix `t2`**

Danach der Vergleich gegen `referenz`. Erwartet: genau `Vergleich fertig`.

Das ist der eigentliche Beweis dieser Aufgabe: Eine reine Umbenennung von Selektoren darf **kein Pixel** verändern. Weicht etwas ab, ist eine Regel nicht mehr angekommen — am wahrscheinlichsten die Medienabfrage oder eine der `figcaption`-Regeln.

- [ ] **Schritt 5: Commit**

```bash
cd "<REPO>" && git add shared/ui.css tools/flaechenrechner/index.html && git commit -m "Klassenlose Selektoren in ui.css auf Klassen umstellen" -m "figure, canvas, figcaption und .grid trafen jedes solche Element jeder
Seite. Damit haette eine Karteikarte, die <figure> fuer ihre Illustration
benutzt, ungefragt wie eine Werkzeug-Tafel ausgesehen. Die Regeln heissen
jetzt .tafel und .ansichten und sagen damit, was sie meinen.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016ra8LtfH4uUnzFZLtRKBJp"
```

---

### Aufgabe 3: Kartenmaschinerie und die erste Karte

Ziel: Die Bausteine für Karten stehen, und die erste Karte beweist sie. Alles, was hier entsteht, ist das Muster für die Aufgaben 4 und 5.

**Dateien:**
- Anlegen: `shared/karten.css`
- Anlegen: `shared/abfrage.js`
- Anlegen: `karten/partielle-ableitungen.html`

**Schnittstellen:**
- Nutzt: `shared/theme.css` (Farbtokens)
- Liefert:
  - CSS-Klassen `.karte`, `.voraussetzung`, `.formel`, `.beispiel`, `.bild`, `.merksatz`, `.fehler`, `.querlink`, `.abfrage-leiste`
  - `MT.abfrage.start()` — verdrahtet den Schalter mit der Seite
  - das Aufbaumuster einer Kartenseite

- [ ] **Schritt 1: `shared/abfrage.js` anlegen**

```js
/* MT.abfrage — verdeckt auf Karteikarten Formel und Beispiel, damit man
   sich selbst abfragen kann. Speichert nichts: der Zustand lebt nur,
   solange die Seite offen ist. Ohne dieses Skript bleibt alles sichtbar. */

var MT = MT || {};

MT.abfrage = (function(){
"use strict";

function start(){
  var schalter = document.getElementById('abfrage-schalter');
  if(!schalter) return;

  schalter.addEventListener('click', function(){
    var an = document.body.classList.toggle('abfrage');
    schalter.setAttribute('aria-pressed', an ? 'true' : 'false');
    schalter.textContent = an ? 'Abfragen beenden' : 'Abfragen';
    if(!an){
      var offen = document.querySelectorAll('.aufgedeckt');
      for(var i=0;i<offen.length;i++) offen[i].classList.remove('aufgedeckt');
    }
  });

  var felder = document.querySelectorAll('[data-verdeckbar]');
  for(var i=0;i<felder.length;i++){
    (function(feld){
      var knopf = document.createElement('button');
      knopf.type = 'button';
      knopf.className = 'aufdecken';
      knopf.textContent = 'aufdecken';
      knopf.addEventListener('click', function(){ feld.classList.add('aufgedeckt'); });
      feld.appendChild(knopf);
    })(felder[i]);
  }
}

return { start: start };
})();
```

Der Knopf wird **von JavaScript erzeugt**, nicht ins HTML geschrieben. Grund: Ohne JavaScript soll gar kein Knopf dastehen, der nichts tut.

- [ ] **Schritt 2: `shared/karten.css` anlegen**

Die Datei hat drei Teile. Halte dich an die vorhandenen Farbtokens und an den Ton von `shared/ui.css` — schmale Rahmen, gedämpfte Flächen, Georgia für Formelhaftes.

**Teil 1, die Kartenbausteine.** `.karte` ist ein Block mit Panelhintergrund (`--panel-a`/`--panel-b`), dünnem Rahmen (`--edge`) und Innenabstand; darin `h3` in Serifenschrift, `.voraussetzung` klein und gedämpft (`--dim`), `.formel` abgesetzt und zentriert, `.beispiel` als Fließtext mit den Rechenschritten, `.bild` mittig mit Bildunterschrift in `--dim`, `.merksatz` mit einem farbigen Balken links (`--gold`), `.fehler` ebenso in `--rose`, `.querlink` als abgesetzte Zeile am Fuß.

**Teil 2, der Abfragemodus.**

```css
body.abfrage [data-verdeckbar]{ position:relative; }
body.abfrage [data-verdeckbar] > *:not(.aufdecken){ visibility:hidden; }
body.abfrage [data-verdeckbar].aufgedeckt > *{ visibility:visible; }
body.abfrage [data-verdeckbar].aufgedeckt .aufdecken{ display:none; }
.aufdecken{ display:none; }
body.abfrage [data-verdeckbar] .aufdecken{ display:inline-block; }
```

`visibility:hidden` statt `display:none` ist Absicht: Der Platz bleibt stehen, die Seite springt beim Aufdecken nicht.

**Teil 3, der Druck.**

```css
@media print{
  body{ background:#fff; color:#111; }
  .karte{ break-inside:avoid; border-color:#bbb; background:none; }
  .abfrage-leiste, .aufdecken{ display:none !important; }
  body.abfrage [data-verdeckbar] > *{ visibility:visible !important; }
  .querlink::after{ content:" (" attr(href) ")"; font-size:.85em; color:#555; }
}
```

Die vierte Regel ist die wichtige: **Im Druck wird nie verdeckt**, auch wenn der Abfragemodus gerade an ist. Sonst druckt jemand ein Blatt mit leeren Kästen.

- [ ] **Schritt 3: `karten/partielle-ableitungen.html` anlegen**

Aufbau der Seite: `<head>` bindet `../shared/theme.css`, `../shared/ui.css` und `../shared/karten.css` ein. Im `<body>` ein `.wrap`, darin `h1`, ein `.lede`-Absatz, die Abfrage-Leiste, dann die Karten. Am Ende des `<body>`:

```html
<script src="../shared/abfrage.js"></script>
<script>MT.abfrage.start();</script>
```

Die Abfrage-Leiste:

```html
<div class="abfrage-leiste">
  <button type="button" id="abfrage-schalter" aria-pressed="false">Abfragen</button>
</div>
```

**Diese Seite enthält eine Karte.** Inhalt, exakt so:

**Bezeichnung:** Partielle Ableitung

**Voraussetzungen:** `f` ist in einer Umgebung von (x₀, y₀) definiert, und der Grenzwert existiert.

**Formel** (abgesetzt, MathML):

> f_x(x₀,y₀) = ∂f/∂x = lim (h→0) [ f(x₀+h, y₀) − f(x₀, y₀) ] / h

Darunter, als zweiter Absatz derselben Formelgruppe, die geometrische Lesart in Worten: *Die partielle Ableitung nach x ist die Steigung der Schnittkurve z = f(x, y₀) an der Stelle x₀. Die andere Variable wird festgehalten.*

**Beispiel** — durchgerechnet, jeder Schritt sichtbar:

> f(x, y) = x²y + 3y²
>
> f_x = 2xy   (y ist eine Zahl, 3y² fällt weg)
> f_y = x² + 6y   (x ist eine Zahl)
>
> An der Stelle (2, 1):
> f_x(2,1) = 2·2·1 = 4
> f_y(2,1) = 2² + 6·1 = 10
>
> Gegenprobe über die Schnittkurven:
> Schnitt y = 1:  z = x² + 3,  z′ = 2x,  bei x = 2 also 4. ✓
> Schnitt x = 2:  z = 4y + 3y²,  z′ = 4 + 6y,  bei y = 1 also 10. ✓

**Bild** — Inline-SVG, zwei kleine Diagramme nebeneinander in einem `<figure class="bild">`:

- Links: Achsenkreuz x/z, die Parabel z = x² + 3 über x ∈ [0, 3], der Punkt (2, 7) markiert, dazu die Tangente mit Steigung 4 als kurzes gerades Stück durch diesen Punkt. Beschriftung `Schnitt y = 1` und an der Tangente `Steigung 4`.
- Rechts: Achsenkreuz y/z, die Kurve z = 4y + 3y² über y ∈ [0, 2], der Punkt (1, 7) markiert, Tangente mit Steigung 10. Beschriftung `Schnitt x = 2` und `Steigung 10`.

Beide Kurven sind exakt berechenbar; setze genügend Stützpunkte, dass die Kurve rund wirkt. Farben: die Kurven in `var(--mint)` beziehungsweise `var(--rose)` — dieselben Farben, die der Flächenrechner für diese beiden Schnitte benutzt, damit die Zuordnung ohne Erklärung sitzt. Achsen in `var(--axis)`, Beschriftung in `var(--dim)`.

Bildunterschrift: *Dieselbe Fläche, zweimal geschnitten. Jede partielle Ableitung ist die Steigung einer dieser beiden Kurven.*

**Merksatz:** Beim partiellen Ableiten ist die andere Variable eine Zahl.

**Typischer Fehler:** `∂/∂x` von `3y²` ist `0`, nicht `6y`. Wer die falsche Variable festhält, bekommt beide Ableitungen vertauscht.

**Querlink:** auf `../tools/flaechenrechner/index.html`, Text: *Selbst durchfahren → Flächenrechner.* Dazu ein Satz davor: *Gib dort `x^2*y + 3y^2` ein; die beiden unteren Ansichten sind genau diese Schnittkurven.*

- [ ] **Schritt 4: Kartenprüfung K**

Vollständig, wie oben beschrieben, auf `karten/partielle-ableitungen.html`. Alle zehn Punkte. Berichte jedes Ergebnis wörtlich.

Punkt 5 ist hier besonders wichtig: Es ist der erste MathML-Satz im Repo. Steht statt eines Bruchstrichs der Quelltext da, stimmt der Aufbau des `<math>`-Elements nicht.

- [ ] **Schritt 5: Commit**

```bash
cd "<REPO>" && git add shared/karten.css shared/abfrage.js karten && git commit -m "Kartenbausteine und erste Karte: partielle Ableitungen" -m "shared/karten.css bringt die Kartenbausteine samt Druck-Stylesheet,
shared/abfrage.js das Verdecken ohne gespeicherten Zustand. Die erste
Karte etabliert das Muster: MathML fuer die Formel, Inline-SVG fuer das
Bild, Querlink statt nachgebauter Interaktion.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016ra8LtfH4uUnzFZLtRKBJp"
```

---

### Aufgabe 4: Karte Gradient und Richtungsableitung

Ziel: Die zweite Karte, nach dem Muster aus Aufgabe 3. Sie hängt an der Höhenlinienansicht des Flächenrechners.

**Dateien:**
- Anlegen: `karten/gradient.html`

**Schnittstellen:**
- Nutzt: `shared/karten.css`, `shared/abfrage.js`, das Aufbaumuster aus Aufgabe 3
- Liefert: nichts, worauf spätere Aufgaben aufbauen — außer einem Eintrag für die Übersicht in Aufgabe 6

- [ ] **Schritt 1: Seite anlegen**

Gleicher Aufbau wie `partielle-ableitungen.html` — dieselben Stylesheets, dieselbe Abfrage-Leiste, dasselbe Skript am Ende. **Zwei Karten** auf dieser Seite.

**Karte 1, `id="gradient"`:**

*Bezeichnung:* Gradient

*Voraussetzungen:* f ist partiell differenzierbar.

*Formel:* ∇f(x, y) = ( f_x(x,y), f_y(x,y) ) — ein Vektor, kein Skalar.

*Beispiel:*
> f(x, y) = x² + y²
> f_x = 2x,  f_y = 2y
> ∇f(1, 2) = (2, 4)
>
> Betrag: |∇f| = √(4 + 16) = √20 = 2√5 ≈ 4,47
> Das ist die größte Steigung, die es an dieser Stelle gibt — und sie zeigt in Richtung (2, 4).

*Bild:* Höhenlinien von f als konzentrische Kreise um den Ursprung (x² + y² = c für c = 1, 5, 9), der Punkt (1, 2) markiert, der Gradientenpfeil von dort in Richtung (2, 4) — radial nach außen, also senkrecht auf dem Kreis durch den Punkt. Zusätzlich ein kurzes Stück der Tangente an die Höhenlinie, um den rechten Winkel sichtbar zu machen; einen Winkelhaken zeichnen. Kreise in `var(--dim)`, aktive Höhenlinie durch den Punkt in `var(--gold)`, Gradientenpfeil in `var(--rose)`.

*Merksatz:* Der Gradient zeigt bergauf und steht senkrecht auf der Höhenlinie.

*Typischer Fehler:* Den Gradienten für einen Skalar halten. Er ist ein Vektor — die Zahl daran ist sein Betrag.

*Querlink:* auf den Flächenrechner, mit dem Hinweis, dort `x^2 + y^2` einzugeben und die Ansicht von oben zu betrachten.

**Karte 2, `id="richtungsableitung"`:**

*Bezeichnung:* Richtungsableitung

*Voraussetzungen:* f partiell differenzierbar, **v ein Einheitsvektor** (|v| = 1).

*Formel:* D_v f = ∇f · v

*Beispiel:*
> f(x, y) = x² + y²,  ∇f(1, 2) = (2, 4)
> Richtung v = (3/5, 4/5).  Probe: (3/5)² + (4/5)² = 9/25 + 16/25 = 1 ✓
>
> D_v f = 2·(3/5) + 4·(4/5) = 6/5 + 16/5 = 22/5 = 4,4
>
> Zum Vergleich: die größte mögliche Steigung ist |∇f| ≈ 4,47.
> 4,4 liegt knapp darunter — v zeigt fast, aber nicht ganz bergauf.

*Bild:* Kann entfallen — die Karte teilt sich das Bild der ersten Karte, worauf ein Satz hinweist. Wenn du eines zeichnest, dann den Punkt (1,2) mit beiden Pfeilen: ∇f und v, mit dem Winkel dazwischen.

*Merksatz:* Die Richtungsableitung ist die Projektion des Gradienten auf die Richtung — am größten, wenn beide gleich zeigen.

*Typischer Fehler:* v nicht normieren. Mit v = (3, 4) statt (3/5, 4/5) käme 22 heraus statt 4,4 — das Fünffache, weil |(3,4)| = 5.

*Querlink:* wie oben.

- [ ] **Schritt 2: Kartenprüfung K**

Vollständig auf `karten/gradient.html`. Zusätzlich zu den zehn Punkten: Prüfe, dass **beide** Karten je einen eigenen Aufdeck-Knopf bekommen und unabhängig voneinander aufgedeckt werden können.

- [ ] **Schritt 3: Commit**

```bash
cd "<REPO>" && git add karten/gradient.html && git commit -m "Karte: Gradient und Richtungsableitung" -m "Zwei Karten auf einer Seite. Die Richtungsableitung teilt sich das Bild
mit dem Gradienten; der typische Fehler ist die fehlende Normierung.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016ra8LtfH4uUnzFZLtRKBJp"
```

---

### Aufgabe 5: Karte Extrema mit Nebenbedingung

Ziel: Die dritte Karte — und der Härtetest für den Bauplan. Sie ist formellastig, hat viel Rechnung und wenig zu zeichnen. Wenn der Bauplan sie trägt, trägt er auch die nächsten zwanzig.

**Dateien:**
- Anlegen: `karten/extrema-mit-nebenbedingung.html`

**Schnittstellen:**
- Nutzt: `shared/karten.css`, `shared/abfrage.js`, das Muster aus Aufgabe 3
- Liefert: die Erkenntnis, ob der Bauplan ohne bildreiches Thema hält

- [ ] **Schritt 1: Seite anlegen**

Gleicher Aufbau. **Eine Karte**, `id="lagrange"`.

*Bezeichnung:* Extrema mit Nebenbedingung — Multiplikator von Lagrange

*Voraussetzungen:* f und g stetig differenzierbar; ∇g ≠ 0 auf der Menge g = 0.

*Formel:* Gesucht sind die Stellen mit
> ∇f(x, y) = λ · ∇g(x, y)   **und**   g(x, y) = 0
>
> Das sind drei Gleichungen für drei Unbekannte: x, y und λ.

Der Hinweis „drei Gleichungen für drei Unbekannte" gehört mit in die Formelgruppe, nicht in den Fließtext — er ist der Kern der Sache und die Abwehr gegen den typischen Fehler.

*Beispiel:*
> Maximiere f(x, y) = x·y unter der Nebenbedingung x + y = 10.
>
> Nebenbedingung auf Null bringen:  g(x, y) = x + y − 10
>
> Gradienten:  ∇f = (y, x),  ∇g = (1, 1)
>
> Ansatz ∇f = λ∇g liefert:
>   y = λ
>   x = λ
> also  x = y.
>
> **Jetzt die dritte Gleichung:**  g = 0, also x + y = 10.
> Mit x = y:  2x = 10,  x = 5,  y = 5,  λ = 5.
>
> Ergebnis:  f(5, 5) = 25.
>
> Probe, dass es wirklich das Maximum ist: f(1, 9) = 9, f(4, 6) = 24, f(5, 5) = 25.

*Bild:* Sparsam, aber möglich. Ein Achsenkreuz x/y; die Gerade x + y = 10 von (0,10) nach (10,0); drei Höhenlinien von f, also Hyperbeln x·y = c für c = 16, 25, 36. Die Hyperbel für c = 25 **berührt** die Gerade in (5,5) — genau dort liegt das Optimum; die für c = 16 schneidet sie zweimal, die für c = 36 verfehlt sie. Der Berührpunkt markiert. Gerade in `var(--mint)`, Hyperbeln in `var(--dim)`, die berührende in `var(--gold)`.

Rechne die Hyperbelpunkte aus, statt sie zu schätzen: y = c/x. Für c = 25 etwa (2, 12.5), (2.5, 10), (4, 6.25), (5, 5), (6.25, 4), (10, 2.5), (12.5, 2) — davon liegt im gezeichneten Bereich, was hineinpasst.

Bildunterschrift: *Im Optimum berühren sich Höhenlinie und Nebenbedingung. Wo sie sich kreuzen, kann man auf der Nebenbedingung noch weiterlaufen und f verbessern.*

*Merksatz:* Im Optimum sind Höhenlinie und Nebenbedingung parallel — sonst könnte man weiterlaufen und gewinnen.

*Typischer Fehler:* Nur ∇f = λ∇g lösen und die Nebenbedingung vergessen. Man kommt bis x = y und hat damit **keine** Lösung, sondern eine ganze Gerade davon. Erst g = 0 macht daraus einen Punkt.

*Querlink:* auf den Flächenrechner, mit dem Hinweis, dort `x*y` einzugeben — die Höhenlinien sind die Hyperbeln aus dem Bild.

- [ ] **Schritt 2: Kartenprüfung K**

Vollständig auf `karten/extrema-mit-nebenbedingung.html`.

- [ ] **Schritt 3: Den Härtetest auswerten**

Diese Aufgabe hat einen zweiten Zweck. Beantworte im Bericht ausdrücklich:

- Hat der Bauplan aus `CLAUDE.md` getragen, oder musstest du an einer Stelle davon abweichen?
- Waren die vier Pflichtabschnitte für dieses Thema die richtigen, oder hat einer sich gequält angefühlt?
- War die Kür (Merksatz, typischer Fehler) hier hilfreich oder Füllsel?
- Fehlt dem Bauplan etwas, das dieses Thema gebraucht hätte?

Melde das als Beobachtung, ändere die `CLAUDE.md` **nicht** von dir aus.

- [ ] **Schritt 4: Commit**

```bash
cd "<REPO>" && git add karten/extrema-mit-nebenbedingung.html && git commit -m "Karte: Extrema mit Nebenbedingung" -m "Der Haertetest fuer den Bauplan: formellastig, wenig zu zeichnen. Der
typische Fehler ist die vergessene dritte Gleichung.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016ra8LtfH4uUnzFZLtRKBJp"
```

---

### Aufgabe 6: Übersicht, Startseite, Rücklink

Ziel: Die Karten sind auffindbar. Die Startseite zeigt beide Gattungen, und der Flächenrechner verweist zurück auf die Karten, die ihn erklären.

**Dateien:**
- Anlegen: `karten/index.html`
- Ändern: `index.html`
- Ändern: `tools/flaechenrechner/index.html`

**Schnittstellen:**
- Nutzt: die drei Kartenseiten
- Liefert: `.kachel` als Klasse der Katalogeinträge

- [ ] **Schritt 1: `karten/index.html` anlegen**

Gleiche Optik wie die übrigen Seiten: `../shared/theme.css`, `../shared/ui.css`, dazu ein eigener `<style>`-Block für das Kachelraster. Titel *Karten*, ein Satz Einleitung, darunter ein Raster aus drei `.kachel` — je Thema eine, mit Themenname, einem Satz und den Namen der enthaltenen Karten. Verlinkt auf die jeweilige Datei.

Am Fuß eine Zeile zurück zur Startseite.

- [ ] **Schritt 2: Startseite umbauen**

In `index.html`:

- Die Klasse `.karte` in `.kachel` umbenennen — im `<style>`-Block **und** im Markup. Prüfe mit `grep -n "karte" index.html`, dass kein Vorkommen übrig bleibt.
- Das Katalograster in zwei Abschnitte teilen, jeder mit einer `<h2>`: **Werkzeuge** und **Karten**.
- Unter Werkzeuge die vorhandene Flächenrechner-Kachel.
- Unter Karten drei Kacheln, eine je Thema, verlinkt auf `karten/<thema>.html`.

Der Einleitungssatz der Seite wird angepasst: Er nennt jetzt beide Gattungen.

- [ ] **Schritt 3: Rücklink im Werkzeug**

In `tools/flaechenrechner/index.html`, unter dem Analyse-Bereich, eine Zeile ergänzen, die auf die passenden Karten verweist — auf `../../karten/partielle-ableitungen.html` und `../../karten/gradient.html`. Nutze dafür die Klasse `.querlink` aus `shared/karten.css`; binde `../../shared/karten.css` dafür im `<head>` mit ein.

Prüfe, dass das zusätzliche Stylesheet **nichts** am bestehenden Aussehen ändert: `karten.css` definiert nur Klassen, die im Werkzeug nicht vorkommen — außer `.querlink`, das dort neu ist. Sollte doch etwas kollidieren, melde es, statt es zu überschreiben.

- [ ] **Schritt 4: Prüfroutine P, Präfix `t6`**

Weil `tools/flaechenrechner/index.html` ein Stylesheet mehr lädt und eine Zeile mehr enthält, muss der Bildvergleich erneut laufen. Vergleich gegen `referenz`.

**Achtung:** Der neue Rücklink steht unter dem Analysebereich und verlängert die Seite. Bei `fullPage: true` ändert das die Bildhöhe und damit die Dateigröße — der Vergleich wird also **abweichen**, und zwar zu Recht. Das ist die eine erwartete Abweichung dieses Plans.

Gehe deshalb so vor: Führe den Vergleich aus und melde, welche Bilder abweichen. Erwartet ist, dass **alle** abweichen, und zwar um einen ähnlichen Betrag. Sieh dir zwei davon an und belege, dass der Unterschied ausschließlich die zusätzliche Zeile am Fuß ist und die vier Zeichenflächen unverändert sind. Weicht ein Bild deutlich stärker ab als die anderen, ist das ein Fund.

- [ ] **Schritt 5: Kartenprüfung K auf `karten/index.html`**

Punkte 1 bis 4 und 9 bis 10 der Routine (die Übersicht hat keine Formeln und keine verdeckbaren Felder). Zusätzlich: Jede der drei Kacheln anklicken und prüfen, dass die Zielseite lädt.

- [ ] **Schritt 6: Alle Wege einmal gehen**

Von der Startseite aus: zu jedem Thema, von dort ins Werkzeug, vom Werkzeug zurück zu einer Karte, von der Karte zurück. Über `file://`. Jeder Weg muss tragen.

- [ ] **Schritt 7: Commit**

```bash
cd "<REPO>" && git add karten/index.html index.html tools/flaechenrechner/index.html && git commit -m "Kartenuebersicht, Startseite mit zwei Abschnitten, Ruecklink im Werkzeug" -m "Die Startseite zeigt jetzt beide Gattungen. Ihre Katalogeintraege heissen
.kachel, damit .karte eindeutig der Karteikarte gehoert.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016ra8LtfH4uUnzFZLtRKBJp"
```

---

### Aufgabe 7: README, Aufräumen, Veröffentlichen

Ziel: Das Repo beschreibt sich richtig, der leere Nachbarordner ist weg, und alles ist live.

**Dateien:**
- Ändern: `README.md`

**Schnittstellen:**
- Nutzt: das Ergebnis aller vorigen Aufgaben
- Liefert: den veröffentlichten Stand

- [ ] **Schritt 1: README nachziehen**

- Die Tabelle „Was drin ist" bekommt einen zweiten Teil für die Karten, mit je einer Zeile pro Thema.
- Der Verzeichnisblock bekommt `karten/` und `CLAUDE.md`.
- Die Bausteintabelle bekommt `shared/karten.css` und `shared/abfrage.js`.
- Der Abschnitt „Ein Werkzeug ergänzen" bekommt einen Nachbarn: „Eine Karte ergänzen", drei Zeilen, mit Verweis auf `CLAUDE.md` für den Bauplan.

- [ ] **Schritt 2: Leeren Nachbarordner löschen**

Der Ordner `Cheat-Sheets` liegt **außerhalb** des Repos, neben ihm. Prüfe zuerst, dass er wirklich leer ist:

```bash
find "<ELTERNVERZEICHNIS>/Cheat-Sheets" -mindepth 1 | head ; echo "Inhalt geprueft"
```

Nur wenn keine Datei erscheint, den Ordner entfernen. Erscheint irgendetwas, **halte an und melde es** — dann ist er nicht mehr leer und die Annahme des Nutzers überholt.

- [ ] **Schritt 3: Vollständigkeit prüfen**

```bash
cd "<REPO>" && git status --short && echo "---" && git ls-files && echo "---" && git ls-files -z | xargs -0 grep -niE "<MUSTER>" ; echo "Suche beendet"
```

Erwartet: sauberes Arbeitsverzeichnis, die erwartete Dateiliste, und nur `Suche beendet` — keine privaten Daten. Das war in der vorigen Runde der kritische Fund.

Zum Muster, vier Punkte:

1. **Das Muster steht nicht in diesem Repo.** `<MUSTER>` ist ein Platzhalter;
   die ausgeschriebene Alternativenliste hält der Ausführende außerhalb des
   Repos und setzt sie beim Lauf ein. Ein Suchmuster für private Daten, das
   selbst im Repo liegt, ist eine Veröffentlichung genau der Daten, die es
   schützen soll.
2. **Es deckt drei Kategorien ab:** den Klarnamen des Eigentümers (Vor- und
   Nachname **getrennt**, dazu die Hochschule und ihren Ort in Umlaut- wie
   Ersatzschreibweise), seine Mailadresse (Kontoname und Anbieter je für sich)
   und Fragmente lokaler Pfade (Laufwerksordner der Arbeitskopie, das
   Notizverzeichnis der Sitzung). Gesucht wird mit `-i`. Ein Muster, das nur
   zusammengeschriebene Kennungen kennt, fängt einen Namen mit Leerzeichen
   nicht — genau daran ist die Suche einer früheren Runde vorbeigelaufen,
   während der ausgeschriebene Klarname in einem Plan stehen blieb.
3. **Ein Muster, das sich selbst verschleiert, blendet jede Suche.** Der
   naheliegende Ausweg, das Muster im Repo zu lassen und den letzten
   Buchstaben jedes Wortes in eine Zeichenklasse zu setzen, damit die
   Musterzeile sich nicht selbst findet, ist genau falsch: er nimmt der Suche
   auch die Fähigkeit, dieselben Daten irgendwo **sonst** im Repo zu finden.
   Zwei Sweeps meldeten so nacheinander „sauber“, obwohl die Klardaten
   getrennt durch Klammern in zwei Plandateien standen. Deshalb Punkt 1.
4. **Gesucht wird über `git ls-files`**, nicht über eine von Hand gepflegte
   Pfadliste: eine neu angelegte Datei wäre sonst von Anfang an aus der
   Prüfung heraus.

- [ ] **Schritt 4: Commit und Push**

```bash
cd "<REPO>" && git add README.md && git commit -m "README um die Karten ergaenzen" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016ra8LtfH4uUnzFZLtRKBJp" ; git push
```

Der Anmeldespeicher dieses Repos ist lokal auf `gh` umgestellt; ein Push mit dem falschen Konto sollte nicht mehr vorkommen. Scheitert er doch mit `403`, melde es, statt die Einstellung zu ändern.

- [ ] **Schritt 5: Live-Abnahme**

Warten, bis GitHub Pages `built` meldet. Dann über `https://` — dort funktioniert `browser_navigate` normal:

- Startseite laden, beide Abschnitte sichtbar, keine Konsolenfehler.
- Jede der drei Kartenseiten laden: keine Konsolenfehler, Formeln gesetzt (Punkt 5 der Kartenprüfung), Abfragemodus funktioniert.
- Jeden Querlink in beide Richtungen anklicken.
- `browser_network_requests` auf einer Kartenseite: **alle** Anfragen müssen von der eigenen Adresse kommen. Kein Fremdserver.

Melde jede Abweichung. Ein Pfad, der lokal trägt und über HTTP nicht, zeigt sich genau hier.

---

## Selbstprüfung dieses Plans

**Spec-Abdeckung.** Jeder Abschnitt der Spec hat eine Aufgabe: Struktur → 3 bis 6; Anatomie → 3; Formelsatz → 3 bis 5; Illustrationen → 3 bis 5; Abfragemodus → 3; Druck → 3 (Teil 3 von `karten.css`) und in jeder Kartenprüfung; Querverlinkung → 3 bis 6; Altlast → 2; Startseite → 6; erste drei Karten → 3 bis 5; Verifikation → Kartenprüfung K und Prüfroutine P.

**Bekannte Lücke.** Die Spec verlangt in ihrer Verifikation, dass die Seite ohne JavaScript vollständig lesbar ist. Punkt 7 der Kartenprüfung beschreibt zwei Wege dorthin und überlässt dem Ausführenden die Wahl, weil nicht sicher ist, ob die verfügbaren Werkzeuge JavaScript abschalten können. Das ist bewusst offen und im Bericht zu benennen — es ist der einzige Punkt dieses Plans, der nicht vorab entschieden ist.

**Erwartete Abweichung.** Aufgabe 6 verändert den Flächenrechner sichtbar (Rücklink am Fuß). Der Bildvergleich wird dort abweichen, und das ist richtig so; Schritt 4 dieser Aufgabe beschreibt, wie die Abweichung zu belegen ist.
