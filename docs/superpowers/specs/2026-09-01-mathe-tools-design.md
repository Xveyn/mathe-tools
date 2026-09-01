# mathe-tools — Design

Datum: 2026-09-01
Status: freigegeben

## Zweck

Eine öffentliche Sammlung kleiner Browser-Werkzeuge, die Konzepte aus
Mathematik 2 sichtbar machen. Jedes Werkzeug ist eine eigenständige
Seite; eine Startseite führt sie zusammen. Der bereits vorhandene
Flächenrechner für `f(x, y)` ist das erste Werkzeug und liefert das
Muster für alle weiteren.

Erfolgskriterium der ersten Ausbaustufe: Der Flächenrechner läuft
unverändert im Verhalten, aber auf geteilten Bausteinen, ist von einer
Startseite aus erreichbar und öffentlich unter
`https://xveyn.github.io/mathe-tools/` abrufbar.

## Randbedingungen

- **Kein Build.** Kein npm, kein Bundler, kein Node zum Entwickeln.
- **Doppelklick muss funktionieren.** Jede Seite läuft unverändert über
  `file://` und über HTTP. Daraus folgt: klassische `<script src>`-Tags,
  **keine** ES-Module (`type="module"`) — die blockieren Browser bei
  `file://` als Cross-Origin.
- **Keine externen Abhängigkeiten.** Keine CDN-Bibliotheken, keine
  Schriftarten von fremden Servern. Nur Systemschriften.
- **Sprache.** Oberfläche, Kommentare, README und Commit-Nachrichten auf
  Deutsch.
- **Stil.** Der vorhandene Code ist ES5-artig (`var`, IIFE, `"use strict"`).
  Der Umzug ändert den Stil nicht.

## Repo-Struktur

```
mathe-tools/
├─ index.html                      Startseite: Katalog der Werkzeuge
├─ README.md
├─ LICENSE                         MIT
├─ .nojekyll                       Pages soll nichts wegfiltern
├─ docs/superpowers/specs/         Design- und Planungsdokumente
├─ shared/
│  ├─ theme.css                    Farbtokens, Typografie
│  ├─ ui.css                       Panels, figure, Regler, Chips, Analyse-Raster
│  ├─ expr.js                      MT.expr
│  ├─ canvas.js                    MT.canvas
│  ├─ plot2d.js                    MT.plot2d
│  └─ scene3d.js                   MT.scene3d
└─ tools/
   └─ flaechenrechner/
      ├─ index.html
      └─ flaechenrechner.js
```

Ein Werkzeug ist immer ein Ordner unter `tools/` mit einer
`index.html`. Ein neues Werkzeug entsteht durch Kopieren des Ordners,
Einbinden der benötigten `shared/`-Dateien und eine zusätzliche Karte
auf der Startseite.

Der ursprüngliche `import files/flaechenrechner.html` liegt außerhalb
dieses Repos und bleibt unverändert als Vergleichsreferenz liegen. Er
wird nicht committet.

## Namensraum

Alle geteilten Bausteine hängen an einem einzigen globalen Objekt `MT`.
Jede `shared/*.js` ist eine IIFE, die ihren Teilbereich anlegt, ohne
einen bestehenden zu überschreiben:

```js
var MT = MT || {};
MT.expr = (function () {
  "use strict";
  /* ... */
  return { compile: compile };
})();
```

Die Reihenfolge der `<script>`-Tags ist damit egal, solange alle vor dem
Tool-Skript stehen.

## Die geteilten Module

### `shared/expr.js` → `MT.expr`

Der vollständige Term-Parser aus dem Flächenrechner: Tokenizer mit
impliziter Multiplikation, rekursiver Abstieg (`expr` → `term` →
`unary` → `power` → `atom`), Funktionstabelle (`sin`, `cos`, `tan`,
`asin`, `acos`, `atan`, `sinh`, `cosh`, `tanh`, `exp`, `ln`, `log`,
`sqrt`, `abs`, `sign`) und Konstanten (`pi`, `e`).

Öffentlich:

- `MT.expr.compile(term, vars)` → Funktion mit so vielen Argumenten wie
  `vars` Einträge hat, in genau dieser Reihenfolge. `vars` ist optional
  und steht per Vorgabe auf `['x', 'y']`.
- `MT.expr.FUNCS`, `MT.expr.CONSTS` — für Werkzeuge, die dem Nutzer
  anzeigen wollen, was erlaubt ist.

**Änderung gegenüber dem Original:** Heute sind die Variablennamen `x`
und `y` fest in Tokenizer und Auswertung verdrahtet. Künftig prüft der
Tokenizer gegen die übergebene `vars`-Liste, und `compile` baut die
Argumentliste daraus. Das ist die einzige inhaltliche Änderung am
Parser; sie erlaubt späteren Werkzeugen mit einer oder drei Variablen
denselben Parser statt einer Kopie.

Fehler werden weiterhin als `Error` mit deutschem Text geworfen
(`Unbekannter Name "..."`, `Zeichen "..." wird nicht verstanden`,
`Erwartet: "..."`). Der Wortlaut bleibt unverändert.

### `shared/canvas.js` → `MT.canvas`

Alles, was jede Zeichenfläche braucht:

- `MT.canvas.fit(canvas, ctx, hoehe)` — Größe an die CSS-Breite und das
  `devicePixelRatio` anpassen.
- `MT.canvas.mapper(bereich, breite, hoehe)` — Welt→Pixel-Abbildung für
  einen rechteckigen Bereich, liefert `toPx(x, y)` und `toWorld(px, py)`.
- `MT.canvas.grid(...)` und `MT.canvas.axes(...)` — Gitter und Achsen im
  gemeinsamen Stil.
- `MT.canvas.colors()` — liest die Farbwerte per `getComputedStyle` aus
  den CSS-Variablen und liefert sie als Objekt (`gold`, `mint`, `rose`,
  `dim`, `grid`, `axis`).

`MT.canvas.colors()` ersetzt das heutige `COL`-Objekt und beseitigt die
doppelte Pflege der Farben in CSS und JS.

### `shared/plot2d.js` → `MT.plot2d`

- `MT.plot2d.contour(gitter, niveau)` — Höhenlinien nach Marching
  Squares, liefert Liniensegmente.
- `MT.plot2d.curve(ctx, punkte, farbe)` — Kurvenzug mit Unterbrechung an
  undefinierten Stellen (`NaN`, `Infinity`).

### `shared/scene3d.js` → `MT.scene3d`

- `MT.scene3d.camera(breite, hoehe, azimut, elevation)` — Kameraobjekt.
- `MT.scene3d.project(x, y, z, kamera)` — Punkt auf Bildkoordinaten.
- `MT.scene3d.enableDrag(canvas, zustand, beiAenderung)` — Rotation per
  Zeiger, kapselt die `pointerdown`/`pointermove`/`pointerup`-Logik
  inklusive `setPointerCapture`.

### `shared/theme.css` und `shared/ui.css`

`theme.css` enthält ausschließlich die Variablen aus `:root` (`--abyss`,
`--panel-a`, `--panel-b`, `--edge`, `--ink`, `--dim`, `--gold`,
`--mint`, `--rose`) sowie Grundtypografie und Seitenhintergrund.

`ui.css` enthält die wiederverwendbaren Bausteine: `.wrap`, `figure` /
`canvas` / `figcaption`, `.chips` / `.chip`, `.entry`, `.err`,
`.sliders` / `.sl`, das Analyse-Raster.

Werkzeugspezifisches CSS bleibt in der jeweiligen `index.html` in einem
`<style>`-Block.

## Was beim Flächenrechner bleibt

`tools/flaechenrechner/flaechenrechner.js` behält alles, was nur diese
Aufgabe betrifft, unverändert in Logik und Wortlaut:

- `solve` — Gauß-Elimination, nur von `fitQuadratic` benutzt.
- `fitQuadratic` — Anpassung einer quadratischen Form an die Funktion.
- `isRadial` — Erkennung von Rotationssymmetrie.
- `analyse` — die Fallunterscheidung (Paraboloid, Sattel, Rinne und so
  weiter) und die daraus erzeugten deutschen Beschreibungstexte.
- `renderAnalysis`, `sampleGrid`, `draw3D`, `draw2Dmap`, `drawSection`,
  `drawAll`, `refreshSliders`, `rebuild`.
- Die Beispielterme der Chips und die Verdrahtung der vier Regler
  (`Höhe c`, `y = c`, `x = c`, `Bereich`).

Die Zeichenfunktionen rufen künftig `MT.canvas`, `MT.plot2d` und
`MT.scene3d` auf, statt die Berechnungen selbst zu enthalten. Sichtbares
Ergebnis: identisch.

## Startseite

`index.html` im Wurzelverzeichnis, in derselben Optik wie die Werkzeuge:
Titel, ein Satz Einleitung, darunter ein Raster aus Karten. Jede Karte
zeigt Namen, einen Satz zum Inhalt und die zugehörige Formel in
Serifen-Kursiv als visuellen Anker (`z = f(x, y)`), und verlinkt auf
`tools/<name>/`.

Die Karten stehen als statisches HTML in der Datei. Es gibt keine
Registry-Datei und keine Erzeugung zur Laufzeit — bei einer Handvoll
Werkzeugen ist eine Karte von Hand schneller geschrieben als jede
Automatik.

## Fehlerbehandlung

Unverändert gegenüber heute: Ein nicht parsbarer Term färbt das
Eingabefeld rot (`#fx.bad`), schreibt die Fehlermeldung in `.err` und
lässt die zuletzt gültige Zeichnung stehen. Werte, die zu `NaN` oder
`Infinity` auswerten, unterbrechen den Kurvenzug, statt die Zeichnung
abzubrechen.

## Verifikation

Es gibt keine automatisierten Tests, und die Ausgabe ist visuell.
Deshalb wird gegen das unveränderte Original verglichen, mit Playwright
im Edge, jeweils vor und nach dem Umbau:

1. Startzustand mit dem voreingestellten Term `-x^2/4 - y^2/9`:
   Screenshots aller vier Zeichenflächen.
2. Jeder Beispiel-Chip einmal angeklickt, danach dieselben vier
   Screenshots.
3. Jeder der vier Regler an beide Anschläge und in die Mitte.
4. Die 3D-Ansicht per Drag auf einen festen Winkel gedreht.
5. Kaputter Term `sin(x`: Eingabefeld rot, Fehlertext sichtbar, letzte
   Zeichnung steht noch.
6. Konsole ohne Fehler und Warnungen.

Vorher- und Nachher-Screenshots müssen visuell übereinstimmen. Abweichungen
sind erklärbar oder sie sind Fehler.

Zusätzlich von Hand:

- `tools/flaechenrechner/index.html` per Doppelklick aus dem
  Dateisystem geöffnet — funktioniert vollständig.
- Dieselbe Seite über GitHub Pages — funktioniert vollständig.
- Die Startseite verlinkt korrekt, aus beiden Kontexten.

## Veröffentlichung

- `gh repo create Xveyn/mathe-tools --public --source=. --push`
- GitHub Pages aus Branch `main`, Wurzelverzeichnis.
- Ergebnis: `https://xveyn.github.io/mathe-tools/`
- Lizenz: MIT.
- Das Repo enthält keinen Bezug auf Prüfungs- oder Kursmaterial, nur
  eigenen Code.

## Bewusst nicht Teil dieser Ausbaustufe

- Ein zweites Werkzeug. Kommt in einer eigenen Runde, wenn das Muster
  steht.
- Automatisierte Tests im Repo oder eine CI-Pipeline.
- Speichern oder Teilen von Zuständen über die URL.
- Ein Umbau des Parsers über die Variablenliste hinaus.
