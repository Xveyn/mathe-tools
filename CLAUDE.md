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
- **Deutsch.** Oberfläche, Fließtext, Kommentare, README,
  Commit-Nachrichten — und die Namen, die man beim Lesen einer Datei
  ständig vor sich hat: lokale Variablen, Funktionen, CSS-Klassen,
  `id`-Werte, Dateinamen. **Nicht** die geteilte Schnittstelle an `MT`:
  dort stehen seit dem Fundament kurze, eingeführte Namen
  (`MT.expr.compile`, `MT.canvas.fit/linear/tickStep/colors`,
  `MT.plot2d.contour/segments/polyline`,
  `MT.scene3d.camera/project/enableDrag`), und `MT.abfrage.start()` folgt
  ihnen mit Absicht. Wer etwas Neues an `MT` hängt, bleibt bei dieser
  Schreibweise, statt eine zweite Konvention danebenzustellen.
- **ES5-artiger Stil.** `var`, IIFE, `"use strict"`. Kein `let`, kein
  `const`, keine Pfeilfunktionen, keine Template-Literale.
- **Farben und Grundformen kommen aus `shared/`.** Keine Farbliterale in
  einer Seite. Wer eine Farbe braucht, nimmt eine CSS-Variable; fehlt sie,
  kommt sie nach `shared/theme.css`. Für neuen Code gilt das ohne Ausnahme.
  Bestehende Ausnahmen gibt es, sie sind unter „Bekannte Grenzen" gezählt
  und aufgeführt — sie sind Bestand, kein Vorbild.

## Aufbau

```
index.html            Startseite: Abschnitt Werkzeuge, Abschnitt Karten
favicon.svg           Seitensymbol, von jeder Seite relativ verlinkt
shared/               gemeinsame Bausteine, alle am globalen Objekt MT
tools/<name>/         ein Ordner je Werkzeug, mit index.html
karten/index.html     Überblick über alle Kartenthemen
karten/<thema>.html   eine Datei je Thema, mit mehreren Karten darin
docs/superpowers/     Design- und Planungsdokumente
```

## Die geteilten Bausteine

| Datei | Was drin ist |
|---|---|
| `shared/theme.css` | Farbtokens, Grundtypografie |
| `shared/ui.css` | Panels, die Schieberegler-Bedienelemente der Werkzeuge selbst (nicht zu verwechseln mit der Textklasse `.regler`, die in `shared/karten.css` steht — siehe „Eine Karte schreiben"), Chips, Raster — dazu die Katalog-Kacheln (`.katalog`, `.kachel`) und die Verweiszeilen (`.querlink`, `.seitenfuss`). Beides brauchen auch Startseite und Kartenübersicht, also Seiten, die keine Werkzeuge sind |
| `shared/karten.css` | Bausteine der Karten, samt Druck-Stylesheet |
| `shared/expr.js` | `MT.expr.compile(term, vars)` — Terme in Funktionen |
| `shared/canvas.js` | `MT.canvas` — Zeichenflächen, Achsen, Farben |
| `shared/plot2d.js` | `MT.plot2d` — Höhenlinien, Linienzüge |
| `shared/scene3d.js` | `MT.scene3d` — Projektion, Drehen, Zoomen. Die Höhe wird normiert, siehe „Bekannte Grenzen“ |
| `shared/abfrage.js` | `MT.abfrage` — Verdecken und Aufdecken auf Karten |
| `shared/extrema.js` | `MT.extrema` — stationäre Stellen suchen und einordnen |
| `shared/dgl.js` | `MT.dgl.loese(a, b, glieder, anfang)` — lineare Differentialgleichungen zweiter Ordnung mit konstanten Koeffizienten, geschlossen gelöst |

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
`karten/<thema>.html`. Ins `<head>` jeder neuen Datei gehört
`<link rel="icon" href="../favicon.svg">`; fehlt er, fragt der Browser von
sich aus `/favicon.ico` an und die Konsole trägt einen 404. Dateinamen deutsch, klein, mit Bindestrich, ohne
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

**Nennt der Text eine Einstellung im verlinkten Werkzeug**, etwa „stelle
den Regler `<span class="regler">Höhe c</span>` auf 5", bekommt der Name
diese Klasse. Bewusst kein `<code>`: das steht auf den Karten für etwas,
das man eintippt, ein Regler wird gezogen. `.regler` ist in
`shared/karten.css` definiert, nicht in `shared/ui.css` — dort stehen nur
die Schieberegler-Bedienelemente der Werkzeuge selbst.

**`data-verdeckbar`** ist der Haken für den Abfragemodus. Er gehört an
Formel und Beispiel, an sonst nichts. Eine Karte ohne ihn funktioniert,
sie lässt sich nur nicht abfragen.

**Eintragen — an zwei Stellen.** Eine neue Themendatei ist sonst von
nirgends aus erreichbar; man kommt nur hin, wenn man den Dateinamen
kennt. Also:

1. Eine `.kachel` im Abschnitt Karten von `index.html` (Pfad
   `karten/<thema>.html`).
2. Eine `.kachel` in `karten/index.html` (Pfad `<thema>.html`, weil die
   Übersicht im selben Ordner liegt).

Beide Kacheln nutzen denselben Baustein aus `shared/ui.css`. Der
Kacheltitel ist auf der Startseite ein `h3` (er steht unter der
Abschnittsüberschrift `h2`), in der Übersicht ein `h2` (er steht direkt
unter der `h1`). Dazu gehört am Fuß der neuen Seite die
`.seitenfuss`-Zeile zurück zur Übersicht, wie sie die bestehenden Karten
tragen.

Eine neue **Karte** in einer schon eingetragenen Themendatei braucht das
nicht — nur eine neue **Datei**.

## Formeln

MathML, direkt im HTML, ohne Bibliothek.

- Abgesetzt: `<math display="block">`. Im Fließtext: `<math>`.
- Variablen `<mi>`, Operatoren `<mo>`, Zahlen `<mn>`. Nicht alles in
  `<mi>` werfen — Abstände und Kursivsatz hängen daran.
- Brüche `<mfrac>`, Indizes `<msub>`, Exponenten `<msup>`, Wurzeln
  `<msqrt>`.

**Punkte schreiben sich `(0 | 0)`**, mit senkrechtem Strich, nicht
`(0, 0)` — in Fließtext, MathML, SVG-Beschriftung und `figcaption`
gleichermaßen. So gibt der Flächenrechner sie aus, und er kann es nicht
leicht anders. Eine Karte, die daneben eine zweite Schreibweise stellt,
macht aus einer Kleinigkeit eine Frage; `karten/extremwerte.html` tat das
eine Runde lang auf einer einzigen Seite. Alle Karten sind inzwischen
durchgehend in der Strichform gesetzt.

**Das Komma bleibt, wo kein Punkt steht.** Ein Funktionsargument schreibt
sich weiter `f(2, 1)`, ein Vektor `∇f = (2, 4)`, eine Richtung
`v = (3/5, 4/5)`. Der Strich ist die Marke des Punktes in der Ebene, nicht
ein Ersatz für jedes Komma zwischen zwei Klammern — wer ihn überall setzt,
nimmt ihm genau die Unterscheidung, wegen der er da ist. Die
aria-Beschreibungen der Bilder bleiben ebenfalls in der Sprechform
(„im Punkt x gleich 1, y gleich 1“): dort wäre der Strich ein vorgelesenes
Sonderzeichen.

Zu bedenken beim Umstellen: die Strichform ist knapp drei Pixel breiter
als die Kommaform. In `gradient.html` reichte das, um eine
SVG-Beschriftung, die 3,02 px Abstand hatte, auf 0,06 px an die
Achsenbeschriftung heranzuschieben. Eine umgestellte Beschriftung ist
deshalb nachzumessen, siehe „Illustrationen“.

**Eine zu breite Formel scrollt, sie bricht nicht.** MathML kennt keinen
Umbruch, den Chromium umsetzt, und eine `mtable` bricht ohnehin nie. Ist
eine Zeile breiter als die Karte, bekommt sie in `shared/karten.css` einen
eigenen Scrollkasten — auf `math[display="block"]` und auf `.karte p`,
nicht auf `.formel`/`.beispiel`, deren Abfrage-Rahmen ein Scrollkasten
abschneiden würde. Auf dem Papier ist der Kasten wieder aufgehoben.

Das ist eine Auffanglinie, kein Freibrief: eine Formel, die auf dem
Telefon zur Hälfte hinter dem Rand steht, ist schlecht lesbar, auch wenn
die Seite darum herum heil bleibt. Wer eine breite Zeile schreibt, prüft
sie bei 390 px — oft lässt sie sich in zwei abgesetzte Formeln teilen.

**Verboten:** Formeln als Bild. Formeln als Text mit Sonderzeichen
(`∂f/∂x` hingeschrieben). Eine Formelbibliothek ins Repo legen.

## Illustrationen

Inline-SVG, von Hand gezeichnet, direkt in der Karte.

- Immer `viewBox`, nie feste Pixelmaße für `width`/`height`.
- Farben als `stroke="var(--gold)"`, nie als Literal — sonst bleiben sie
  im Druck auf ihren Bildschirmwerten stehen.
- Beschriftungen als `<text>` im SVG. **Eine Beschriftung wird gegen
  *jedes* andere Element im selben SVG gerechnet**, nicht nur gegen das,
  woran man gerade denkt: Achsen, Teilstriche und deren Zahlen, alle
  Kurven, Marken und die anderen Beschriftungen. Ihr Kasten steht in
  `getBBox()`; eine 9-px-Zeile ist gut 12 px hoch und reicht damit weiter
  unter die Basislinie, als man schätzt. Das war auf zwei Karten
  nacheinander derselbe Fehler — und eine Beschriftung, die aus einer
  Kollision heraus- und in die nächste hineingerückt wird, ist nicht
  behoben. Eine, die frei steht, aber gleich weit von zwei Kurven,
  ebenfalls nicht: sie muss näher an ihrer eigenen stehen.
- Was gerechnet sein müsste, um ehrlich zu sein, wird nicht geschätzt.
  Entweder die Punkte einmal ausrechnen und eintragen, oder auf das
  Werkzeug verlinken, das es live zeigt.

**Karten bauen keine Bewegung nach.** Dafür gibt es die Werkzeuge. Eine
Karte, die interaktiv sein will, verlinkt stattdessen.

## Querverlinkung

Karte → Werkzeug als `.querlink` am Fuß der Karte. Werkzeug → Karte als
`.querlink`-Zeile am **Fuß der Werkzeugseite**, hinter dem Analysebereich.
Direkt unter den Ansichten stünde sie zwischen Bild und Erklärung; am
Seitenfuß steht sie dort, wo man mit dem Werkzeug fertig ist.

Jede Kartenseite trägt außerdem am Fuß eine `.seitenfuss`-Zeile zurück zum
Überblick `karten/index.html`. Ohne sie ist eine Kartenseite eine
Sackgasse: der einzige Weg hinaus führte ins Werkzeug.

**Kein vorbelegter Term.** Kein `?f=…`, kein URL-Zustand. Die Karte
schreibt hin, welchen Term man eingeben soll. Das ist eine bewusste
Entscheidung, keine Lücke — siehe
`docs/superpowers/specs/2026-09-01-karteikarten-design.md`.

## Ein Werkzeug ergänzen

1. `tools/<name>/index.html` anlegen, `shared/theme.css` und
   `shared/ui.css` einbinden, dazu die gebrauchten `shared/*.js`. Ins
   `<head>` gehört auch `<link rel="icon" href="../../favicon.svg">` —
   ohne ihn fragt der Browser von sich aus `/favicon.ico` an und die
   Konsole trägt auf dieser einen Seite dauerhaft einen 404.
2. Werkzeug-eigenes JavaScript nach `tools/<name>/<name>.js`.
3. Eine **Kachel** im Abschnitt Werkzeuge der Startseite ergänzen —
   `.kachel`, nicht `.karte`; siehe die Namensregel weiter oben.

## Bevor du „fertig" sagst

Es gibt in diesem Repo **kein Test-Framework** — das ist Absicht, nicht
Nachlässigkeit. Geprüft wird stattdessen am laufenden Bild:

- Die Seite über `file://` öffnen. Konsole ohne Fehler.
- Bei Karten: Sind die Formeln gesetzt oder steht da Quelltext? Zwei
  Schritte, und ein dritter nur, wenn die Karte einen Bruch hat:

  1. **Kennt der Browser MathML?** `typeof window.MathMLElement` muss
     `'function'` sein.
  2. **Setzt er die Formeln als Formeln?**
     `getComputedStyle(document.querySelector('math')).display` muss
     `math` enthalten — `math` im Fließtext, `block math` bei
     `display="block"`. Steht dort `inline`, ist `<math>` für den Browser
     ein unbekanntes Element und der Inhalt läuft als Text durch.
  3. **Nur wenn die Karte ein `<mfrac>` hat:** Es muss höher sein als
     `1.8 ×` sein eigener Zähler. Wird der Bruch nicht gesetzt, stehen
     Zähler und Nenner nebeneinander, und der Quotient fällt auf etwa 1.

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

  **Eine Karte ohne Bruch ist kein Fehlerfall.** `extrema-mit-nebenbedingung`
  ist die erste solche Karte: kein `<mfrac>`, kein `<msqrt>`, kein
  `<msub>`. Schritt 3 entfällt dann, `bruchquotient` meldet das
  ausdrücklich, und `gesetzt` bleibt trotzdem `true`. Der frühere
  Maßstab — irgendein `<mfrac>`, gemessen gegen die Körpergröße der
  Seite — schlug hier blind Alarm und schlug ihn auch auf
  `gradient.html`, wo der erste Bruch `3/5` nur 20,4 px hoch ist. Der
  Quotient gegen den eigenen Zähler ist maßstabsfrei: über alle 16
  Brüche des Repos liegt er zwischen 1,89 und 2,63.
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

**Für die 3D-Tafel gilt dieser Vergleich nicht mehr.** Seit der Normierung
der Höhe (siehe unten) zeichnet das Werkzeug die Fläche absichtlich anders
als das Original, und zwar in jedem der 21 Zustände. Ein Pixelvergleich der
Tafel `#c3d` gegen das Original meldet ab jetzt dauerhaft Unterschiede, die
keine Fehler sind. Die übrigen drei Tafeln — Höhenlinien und die beiden
Schnitte — sind von der Änderung nicht berührt und bleiben vergleichbar.
Wer die Routine fährt, vergleicht `#c3d` gegen eine **neue** Grundlage aus
dem heutigen Stand, nicht gegen das Original.

## Bekannte Grenzen

Kein Fehler, sondern geprüft und so gelassen. Wer eine davon „entdeckt",
hat sie hier schon gefunden.

- **Das 3D-Bild ist in z nicht maßstabstreu, und das ist Absicht.**
  `MT.scene3d.camera` bildet die z-Spanne auf eine feste Kastenhöhe ab
  (`KASTEN` mal Grundfläche mal der eingestellten Überhöhung), statt z mit
  demselben Maßstab wie x und y zu zeichnen. Grund: die z-Spanne wächst bei
  quadratischen Funktionen mit dem Quadrat des Bereichs, die Grundfläche nur
  linear — also bestimmte früher allein z den Maßstab. Gemessen an den sechs
  Beispielen des Flächenrechners bei 620 px Leinwand: die Fläche füllte
  zwischen 6 % und 94 % der Breite, `-4xy` bei Bereich 4 noch 38 px und bei
  Bereich 8 noch 19 px; fünf der sechs waren durch z begrenzt statt durch die
  Bildbreite. Nach der Normierung sind es konstant 450 px (73 %) bei jeder
  Funktion und jedem Bereich. Mathematica (`BoxRatios -> {1,1,0.4}`),
  matplotlib (4:4:3) und gnuplot normieren aus demselben Grund; Desmos 3D und
  GeoGebra gehen den anderen Weg und schneiden die Fläche an einem
  gezeichneten Quader ab — das setzt einen sichtbaren Kasten voraus, den
  `draw3D` nicht zeichnet. Der Preis der Normierung: das Bild sagt nicht mehr,
  wie steil etwas ist, und sieht für jede Funktion gleich dramatisch aus.
  Dagegen stehen zwei Dinge, die zusammen mit ihr eingebaut wurden und die
  **nicht** entfernt werden dürfen, ohne den Einwand wieder zu öffnen: die
  z-Spanne steht als Zahl unter dem Bild (`#zbereich`), und die Überhöhung
  ist ein Regler.

- **Der Druck erreicht die vier Zeichentafeln nicht.** `@media print` in
  `shared/karten.css` definiert die Farbtokens hell um, und Inline-SVG
  zieht mit. Ein `<canvas>` nicht: `shared/canvas.js` liest die Tokens
  einmal beim Zeichnen (`MT.canvas.colors()`) und brennt die Werte in die
  Bitmap. Die vier Ansichten des Flächenrechners kommen deshalb in ihren
  Bildschirmfarben aufs Papier. Keine Verschlechterung — vor dieser Runde
  hatte das Werkzeug überhaupt kein Druck-Stylesheet. Wer es beheben will,
  müsste bei `beforeprint` neu zeichnen; das rührt an
  `shared/canvas.js`, also an einer Datei, die diese Runde nicht anfasst.
- **Zwanzig Farbliterale bestehen fort, und die Regel oben gilt trotzdem.**
  Sie ist eine Regel für neuen Code; der Bestand ist geprüft und so
  gelassen. Wer eines davon „entdeckt", hat es hier schon gefunden:

  - **Die Druckpalette** im `@media print`-Block von `shared/karten.css`
    (sechs Zeilen). Die einzige Stelle im Repo, an der Farbtokens außerhalb
    von `theme.css` definiert werden. Sie steht dort, weil sie zum
    Druck-Stylesheet der Karten gehört und mit ihm gelesen wird.
  - **Acht in `shared/ui.css`**: die beiden Fehlerfarben `#E06C5A` und
    `#E89383` an `.term.bad` und `.err`, dazu sechs `rgba()`-Werte für
    Trennlinien, Reglerschienen und den Feldgrund. Sie sind Aufhellungen
    und Abtönungen derselben Tokenfamilie; als Token hätte jede einen
    eigenen Namen gebraucht, den nur eine einzige Regel benutzt.
  - **Sechs in `tools/flaechenrechner/flaechenrechner.js`**: die
    Flächenschattierung der 3D-Ansicht (dort wird die Farbe je Kachel aus
    Tiefe und Beleuchtung gerechnet, sie ist gar kein fester Wert), die
    Schnittebene, die Kachelkanten, die Höhenlinienschar und zwei
    Goldabstufungen. Ein `canvas` liest keine CSS-Variablen; `shared/canvas.js`
    reicht mit `MT.canvas.colors()` genau die Tokens durch, die es kennt.

  Der Grund, warum das hier steht und nicht behoben ist: die Regel schützt
  den **Druck** (siehe den Eintrag darüber), und keiner der fünfzehn Werte
  erreicht das Papier anders, als er es ohnehin täte.
- **Die Klammern der Hesse-Matrix sind von Hand bemessen, nicht
  gestreckt.** Chromium und Edge rendern `<mtable>` nur über den
  UA-Fallback `display: inline-table`, und in diesem Fallback greift die
  Streck-Mechanik für `<mo>` nicht — `minsize`/`maxsize` bleiben innerhalb
  von `article.karte` wirkungslos, die Klammern wachsen also nicht mit der
  Matrix mit. Die Größe steht deshalb fest, `font-size:3.8em` in der
  Klasse `.matrix-klammer` (`shared/karten.css`), abgestimmt auf eine
  zweizeilige Matrix. Eine dritte Zeile oder eine geänderte Schriftgröße
  der Umgebung verstimmt die Klammern lautlos gegen die Matrix — dann muss
  neu vermessen werden.
- **Prüfroutine P sagt nicht, wie der Term für ihre 21 Zustände gesetzt
  wird — das ist nicht egal.** Ein angeklickter Beispiel-Chip bleibt aktiv
  markiert (Goldrand); derselbe Term von Hand ins Feld getippt markiert
  keinen Chip. Der Unterschied zeigt sich in der Chip-Zeile von 20 der 21
  Bilder und hat mit dem eigentlich geprüften Verhalten nichts zu tun —
  das kostete einmal einen vollen Vergleichslauf dieses Plans. Wer die
  Routine erneut laufen lässt, muss den Term auf demselben Weg setzen wie
  die Referenzaufnahme.
- **Die Akzeptanzschwelle in `shared/extrema.js` liegt bei der
  Auslöschung, und die hängt weiterhin an `|f|`.** `nahGenug` prüft
  `|g| < max(1e-10, 4·eps·|f|/h)`. Der zweite Term ist kein Rest des
  früheren Fehlers, sondern seine Reparatur: unterhalb von `eps·|f|/h` ist
  am berechneten Gradienten überhaupt kein Wert mehr, die Differenz springt
  dort in Stufen. Eine Schwelle darunter wäre nur mit exakt null zu
  treffen, und ein Lauf, der sie verfehlt, meldete „keine Stelle“.

  Gemessen bei Bereich 4 an `x^2 + y^2 + c` (die Ziffern ausgeschrieben):
  bis `c = 3·10¹¹` bleibt es die eine Stelle, bei `10¹²` zerfällt sie in
  acht. Vor der Umstellung stand diese Wand bei `10⁸`. Ab etwa `10¹⁰`
  meldet die Stelle „unentschieden“ statt „Minimum“ — dort verliert die
  zweite Differenz die Hesse-Matrix, `2h² = 5·10⁻⁷` gegen einen
  Zahlenabstand von `2·10⁻⁶`, und „unentschieden“ ist die richtige
  Auskunft.

  Wer große Werte prüft, muss die Ziffern ausschreiben: **`MT.expr` kennt
  keine Exponentialschreibweise.** `e` ist die Euler'sche Zahl, `1e8` wird
  also als `1 · e · 8 = 21,746` gelesen, nicht als 100 000 000 — eine
  Prüfung genau dieser Grenze meldete einmal „bestanden“, weil sie als
  `1e8` eingetippt war und damit eine völlig andere Funktion maß.

## Ton

Nüchtern und deutsch. Keine Werbesprache, keine Ausrufezeichen. Eine
Karte erklärt einer Person, die den Stoff gerade lernt — nicht einer, die
ihn schon kann, und nicht einer, die beeindruckt werden soll.
