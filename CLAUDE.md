# Arbeitsregeln für dieses Repo

Kleine Browser-Seiten, die Begriffe aus der Analysis sichtbar machen.
Zwei Gattungen: **Werkzeuge** unter `tools/` rechnen etwas vor, **Karten**
unter `karten/` erklären etwas. Beide teilen sich die Bausteine in
`shared/`.

## Harte Regeln

Diese sind nicht verhandelbar. Eine Änderung, die eine davon bricht, ist
ein Fehler, kein Kompromiss.

- **Kein Build.** Kein npm, kein Bundler, keine `package.json`, kein
  Schritt zwischen Datei und Browser.
- **Doppelklick muss funktionieren.** Jede Seite läuft unverändert über
  `file://` und über HTTP. Daraus folgt zwingend: klassische
  `<script src="…">`-Tags, **niemals** `type="module"` — Browser blockieren
  Modul-Importe über `file://` als Cross-Origin.
- **Keine externen Abhängigkeiten.** Keine CDN-Skripte, keine Bibliotheken,
  keine Schriften von fremden Servern. Nur Systemschriften.
- **Alle Pfade relativ.** Ein führender `/` bricht entweder den
  Doppelklick oder die Veröffentlichung — und zwar unterschiedlich, deshalb
  fällt so ein Fehler leicht erst spät auf.
- **Ein Verzeichnis-Link ist kein Datei-Link.** `href="tools/x/"`
  funktioniert über HTTP, zeigt über `file://` aber eine
  Verzeichnisliste. Immer auf `index.html` verlinken.
- **Deutsch.** Oberfläche, Kommentare, Bezeichner, README,
  Commit-Nachrichten.
- **ES5-artiger Stil.** `var`, IIFE, `"use strict"`. Kein `let`, kein
  `const`, keine Pfeilfunktionen, keine Template-Literale.
- **Farben und Grundformen kommen aus `shared/`.** Keine Farbliterale in
  einer Seite. Wer eine Farbe braucht, nimmt eine CSS-Variable; fehlt sie,
  kommt sie nach `shared/theme.css`.

## Aufbau

```
index.html            Startseite: Abschnitt Werkzeuge, Abschnitt Karten
shared/               gemeinsame Bausteine, alle am globalen Objekt MT
tools/<name>/         ein Ordner je Werkzeug, mit index.html
karten/<thema>.html   eine Datei je Thema, mit mehreren Karten darin
docs/superpowers/     Design- und Planungsdokumente
```

## Die geteilten Bausteine

| Datei | Was drin ist |
|---|---|
| `shared/theme.css` | Farbtokens, Grundtypografie |
| `shared/ui.css` | Bausteine der Werkzeug-Oberfläche |
| `shared/karten.css` | Bausteine der Karten, samt Druck-Stylesheet |
| `shared/expr.js` | `MT.expr.compile(term, vars)` — Terme in Funktionen |
| `shared/canvas.js` | `MT.canvas` — Zeichenflächen, Achsen, Farben |
| `shared/plot2d.js` | `MT.plot2d` — Höhenlinien, Linienzüge |
| `shared/scene3d.js` | `MT.scene3d` — Projektion, Drehen |
| `shared/abfrage.js` | `MT.abfrage` — Verdecken und Aufdecken auf Karten |

Jede `shared/*.js` beginnt mit `var MT = MT || {};` und hängt genau einen
Teilbereich an. Damit ist ihre Ladereihenfolge untereinander egal — nur
das seiteneigene Skript kommt zuletzt. Alle `<script>`-Tags stehen am
**Ende des `<body>`**; der Seitencode greift ohne DOM-Ready-Schutz auf
Elemente zu.

`MT.expr.compile` nimmt Variablennamen nur als **einzelne Buchstaben**,
die nicht mit einer Funktion oder Konstante kollidieren und sich nicht
wiederholen. Sonst wirft es.

## Eine Karte schreiben

**Ort und Name.** Karten liegen thematisch gebündelt in
`karten/<thema>.html`. Dateinamen deutsch, klein, mit Bindestrich, ohne
Umlaute: `extrema-mit-nebenbedingung.html`. Jede Karte bekommt ein `id` in
derselben Schreibweise und ist damit als
`karten/gradient.html#richtungsableitung` verlinkbar.

**Gerüst.** Vier Abschnitte sind Pflicht, zwei sind Kür:

```html
<article class="karte" id="kettenregel">
  <h3>Kettenregel für f(x(t), y(t))</h3>

  <div class="voraussetzung">f partiell differenzierbar, x und y
    differenzierbar in t.</div>

  <div class="formel" data-verdeckbar>
    <math display="block">…</math>
  </div>

  <div class="beispiel" data-verdeckbar>
    <p>…Rechenschritte, Zeile für Zeile…</p>
    <figure class="bild">
      <svg viewBox="0 0 240 160">…</svg>
      <figcaption>…</figcaption>
    </figure>
  </div>

  <p class="merksatz">…</p>     <!-- Kür -->
  <p class="fehler">…</p>       <!-- Kür -->

  <a class="querlink" href="../tools/flaechenrechner/index.html">
    Selbst durchfahren → Flächenrechner
  </a>
</article>
```

**`.karte` gehört den Karteikarten.** Die Katalogeinträge der Startseite
heißen `.kachel`, die Zeichentafel eines Werkzeugs `.tafel`, ihr Raster
`.ansichten`. Diese vier Namen nicht vermischen.

**Merksatz und typischer Fehler sind Kür.** Sie kommen dazu, wo sie
tragen. Ein Merksatz, der erfunden wird, um ein Feld zu füllen, ist
schlechter als kein Merksatz. Lieber weglassen.

**Das Beispiel ist durchgerechnet**, nicht angedeutet. Jeder Schritt
sichtbar, bis zum Ergebnis. Dazu ein Bild.

**`data-verdeckbar`** ist der Haken für den Abfragemodus. Er gehört an
Formel und Beispiel, an sonst nichts. Eine Karte ohne ihn funktioniert,
sie lässt sich nur nicht abfragen.

## Formeln

MathML, direkt im HTML, ohne Bibliothek.

- Abgesetzt: `<math display="block">`. Im Fließtext: `<math>`.
- Variablen `<mi>`, Operatoren `<mo>`, Zahlen `<mn>`. Nicht alles in
  `<mi>` werfen — Abstände und Kursivsatz hängen daran.
- Brüche `<mfrac>`, Indizes `<msub>`, Exponenten `<msup>`, Wurzeln
  `<msqrt>`.

**Verboten:** Formeln als Bild. Formeln als Text mit Sonderzeichen
(`∂f/∂x` hingeschrieben). Eine Formelbibliothek ins Repo legen.

## Illustrationen

Inline-SVG, von Hand gezeichnet, direkt in der Karte.

- Immer `viewBox`, nie feste Pixelmaße für `width`/`height`.
- Farben als `stroke="var(--gold)"`, nie als Literal — sonst bleiben sie
  im Druck auf ihren Bildschirmwerten stehen.
- Beschriftungen als `<text>` im SVG.
- Was gerechnet sein müsste, um ehrlich zu sein, wird nicht geschätzt.
  Entweder die Punkte einmal ausrechnen und eintragen, oder auf das
  Werkzeug verlinken, das es live zeigt.

**Karten bauen keine Bewegung nach.** Dafür gibt es die Werkzeuge. Eine
Karte, die interaktiv sein will, verlinkt stattdessen.

## Querverlinkung

Karte → Werkzeug als `.querlink` am Fuß der Karte. Werkzeug → Karte als
Zeile unter den Ansichten.

**Kein vorbelegter Term.** Kein `?f=…`, kein URL-Zustand. Die Karte
schreibt hin, welchen Term man eingeben soll. Das ist eine bewusste
Entscheidung, keine Lücke — siehe
`docs/superpowers/specs/2026-09-01-karteikarten-design.md`.

## Ein Werkzeug ergänzen

1. `tools/<name>/index.html` anlegen, `shared/theme.css` und
   `shared/ui.css` einbinden, dazu die gebrauchten `shared/*.js`.
2. Werkzeug-eigenes JavaScript nach `tools/<name>/<name>.js`.
3. Eine Karte im Abschnitt Werkzeuge der Startseite ergänzen.

## Bevor du „fertig" sagst

Es gibt in diesem Repo **kein Test-Framework** — das ist Absicht, nicht
Nachlässigkeit. Geprüft wird stattdessen am laufenden Bild:

- Die Seite über `file://` öffnen. Konsole ohne Fehler.
- Bei Karten: Sind die Formeln gesetzt oder steht da Quelltext? Ein
  `<mfrac>` muss einen Bruchstrich zeichnen.
- Abfragemodus an und aus. Mit abgeschaltetem JavaScript ist alles
  sichtbar.
- Druckvorschau: heller Grund, nichts verdeckt, kein Umbruch mitten in
  einer Karte.
- Jeden neuen Link anklicken, über `file://` **und** über HTTP.

**Wird ein Werkzeug geändert**, ist die Prüfung schärfer: Der
Fundament-Plan unter `docs/superpowers/plans/` beschreibt eine Routine,
die 21 Zustände als Screenshots aufnimmt und gegen Referenzbilder des
unveränderten Originals vergleicht. Das Original liegt außerhalb des Repos
und wird nie verändert; die Referenzbilder lassen sich daraus jederzeit
neu aufnehmen.

## Ton

Nüchtern und deutsch. Keine Werbesprache, keine Ausrufezeichen. Eine
Karte erklärt einer Person, die den Stoff gerade lernt — nicht einer, die
ihn schon kann, und nicht einer, die beeindruckt werden soll.
