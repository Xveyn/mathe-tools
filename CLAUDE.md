# Arbeitsregeln für dieses Repo

Kleine Browser-Seiten, die Begriffe aus der Vorlesung sichtbar machen.
Drei Gattungen: **Werkzeuge** unter `tools/` rechnen etwas vor, **Karten**
unter `karten/` erklären etwas, die **Formelsammlung** unter `formeln/`
schlägt etwas nach. Alle drei teilen sich die Bausteine in `shared/`.

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
  `MT.scene3d.camera/project/enableDrag`), und `MT.abfrage.start()` sowie
  `MT.formeln.start()` folgen ihnen mit Absicht. Wer etwas Neues an `MT`
  hängt, bleibt bei dieser Schreibweise, statt eine zweite Konvention
  danebenzustellen.
- **ES5-artiger Stil.** `var`, IIFE, `"use strict"`. Kein `let`, kein
  `const`, keine Pfeilfunktionen, keine Template-Literale.
- **Farben und Grundformen kommen aus `shared/`.** Keine Farbliterale in
  einer Seite. Wer eine Farbe braucht, nimmt eine CSS-Variable; fehlt sie,
  kommt sie nach `shared/theme.css`. Für neuen Code gilt das ohne Ausnahme.
  Bestehende Ausnahmen gibt es, sie sind unter „Bekannte Grenzen" gezählt
  und aufgeführt — sie sind Bestand, kein Vorbild.

## Aufbau

```
index.html            Startseite: Abschnitt Werkzeuge, Abschnitt Karten,
                       Abschnitt Formelsammlung
favicon.svg           Seitensymbol, von jeder Seite relativ verlinkt
shared/               gemeinsame Bausteine, alle am globalen Objekt MT
tools/<name>/         ein Ordner je Werkzeug, mit index.html
karten/index.html     Überblick über alle Kartenthemen
karten/<thema>.html   eine Datei je Thema, mit mehreren Karten darin
formeln/index.html    Überblick über alle Themen der Formelsammlung
formeln/<thema>.html  eine Datei je Thema, mit mehreren Formeleinträgen
                       darin
docs/superpowers/     Design- und Planungsdokumente
```

## Die geteilten Bausteine

| Datei | Was drin ist |
|---|---|
| `shared/theme.css` | Farbtokens, Grundtypografie, dazu die Druckpalette (heller Blattfarben-Satz im `@media print`-Block, gilt für jede Seite) |
| `shared/ui.css` | Panels, die Schieberegler-Bedienelemente der Werkzeuge selbst (nicht zu verwechseln mit der Textklasse `.regler`, die in `shared/karten.css` steht — siehe „Eine Karte schreiben"), Chips, Raster — dazu die Katalog-Kacheln (`.katalog`, `.kachel`), die Verweiszeilen (`.querlink`, `.seitenfuss`), die Abschnittsüberschrift `h2.abschnitt` und die handbemessenen Matrixklammern (`.matrix-rahmen`, `.matrix-klammer`, `.matrix-klammer-3z`, `.matrix-klammer-4z`, `.matrix-klammer-flach`, `.matrix-klammer-2z-ober`, `.matrix-klammer-4z-tief`, `.matrix-strich-2z-index`), dazu `.klammer-hoch` für eine Klammer um eine hohe Zeile und `.operator-gross` für Integral-, Summen- und Produktzeichen (beide siehe „Formeln"). Das brauchen auch Startseite, Kartenübersicht und Formelübersicht, also Seiten, die keine Werkzeuge sind |
| `shared/karten.css` | Bausteine der Karten, samt Druck-Stylesheet |
| `shared/formeln.css` | Bausteine der Formelsammlung: der Eintrag `.eintrag`, Verzeichnis und Filterzeile, samt Druck-Stylesheet — lädt nie zusammen mit `karten.css` |
| `shared/expr.js` | `MT.expr.compile(term, vars)` — Terme in Funktionen |
| `shared/canvas.js` | `MT.canvas` — Zeichenflächen, Achsen, Farben |
| `shared/plot2d.js` | `MT.plot2d` — Höhenlinien, Linienzüge |
| `shared/scene3d.js` | `MT.scene3d` — Projektion, Drehen, Zoomen. Die Höhe wird normiert, siehe „Bekannte Grenzen“ |
| `shared/abfrage.js` | `MT.abfrage` — Verdecken und Aufdecken auf Karten |
| `shared/extrema.js` | `MT.extrema` — stationäre Stellen suchen und einordnen |
| `shared/dgl.js` | `MT.dgl.loese(a, b, glieder, anfang)` — lineare Differentialgleichungen zweiter Ordnung mit konstanten Koeffizienten, geschlossen gelöst |
| `shared/formeln.js` | `MT.formeln.start()` — Verzeichnis und Filter einer Formelseite, aus dem Markup selbst gelesen |

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
`.ansichten`, ein Eintrag der Formelsammlung `.eintrag`. Diese fünf Namen
nicht vermischen.

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

## Einen Formeleintrag schreiben

**Ort und Name.** Wie Karten liegt die Formelsammlung thematisch gebündelt
in `formeln/<thema>.html`, Dateiname deutsch, klein, mit Bindestrich, ohne
Umlaute. Ins `<head>` gehört `<link rel="icon" href="../favicon.svg">`.

**Gerüst.** Zwei Teile sind Pflicht, drei sind Kür:

```html
<article class="eintrag" id="drehung-in-der-ebene"
         data-suche="drehmatrix rotation winkel alpha">
  <h3>Drehung in der Ebene <span class="quelle">Skript S. 67, 83</span></h3>

  <p class="bedingung">Drehung um den Ursprung, gegen den Uhrzeigersinn,
    um den Winkel α</p>

  <math display="block">…</math>

  <a class="querlink" href="../tools/…/index.html">…</a>
</article>
```

Pflicht sind die Überschrift `h3` mit ihrer Quellenangabe `.quelle` und
mindestens eine Formel. Kür sind `.bedingung` (eine Zeile, unter welcher
Voraussetzung die Formel gilt), `data-suche` (Suchbegriffe, die im Titel
oder in `.bedingung` nicht vorkommen, aber jemand eintippen könnte — etwa
Synonyme) und `.querlink` an ein Werkzeug oder eine Karte. Für eine
zusätzliche Bemerkung unter einer Formel, etwa einen Sonderfall, gibt es
`.fall`.

**Eine Zeile Bedingung, kein Beispiel.** `.bedingung` sagt in einem Satz,
wann die Formel gilt — sie rechnet nichts vor. Ein durchgerechnetes
Beispiel gehört auf die Karte, nicht in die Formelsammlung; wer eines
sucht, findet es über `.querlink`.

**`karten.css` wird von keiner Formelseite geladen.** Eine Formelseite
bindet `shared/theme.css`, `shared/ui.css` und `shared/formeln.css` ein,
nicht `shared/karten.css`. `.formel` und `.beispiel` sind deshalb auf
einer Formelseite tabu — sie gehören den Karten; der Baustein hier heißt
`.eintrag`.

**Eintragen — an einer Stelle.** Anders als bei einer Karte reicht das:
eine `.kachel` in `formeln/index.html` (Pfad `<thema>.html`). Es gibt
keine zweite Formelübersicht und keine eigene Formel-Kachel je Thema auf
der Startseite — die Startseite verlinkt insgesamt nur auf
`formeln/index.html`.

**Ein Gerüst zur gefüllten Seite machen.** Ein noch leeres Thema ist eine
`formeln/<thema>.html` mit `.lede`, einer `p.leer` dahinter
(„Dieses Thema ist noch nicht gefüllt …") und sonst nichts. Beim Füllen:

1. Die `p.leer`-Zeile entfernen — die Einträge treten an ihre Stelle.
2. Die `.lede` umschreiben und dabei den Satz zur Reichweite der Suche
   ergänzen, den die Spec in der `.lede` **jeder** Themenseite verlangt:
   „Gesucht wird nur auf dieser Seite — was in einem anderen Thema steht,
   findet das Feld nicht." (Wortlaut aus `drehungen-spiegelungen.html`,
   der Seite, die das Muster gesetzt hat.)
3. An der Kachel des Themas in `formeln/index.html` das
   `<em>noch nicht gefüllt</em>` entfernen und durch eine `<em>`-Zeile mit
   Stichworten ersetzen, wie es Startseite und Kartenübersicht halten
   (etwa „Stationäre Stellen — Hesse-Kriterium").
4. **Drei handgepflegte Zähler nachziehen**, sonst stehen sie nach dieser
   Runde falsch: die `<em>`-Zeile der Formelsammlung-Kachel auf der
   Startseite („von vierzehn Themen sind bisher … gefüllt"), die
   Kachel in `formeln/index.html` selbst und die Zeile in `README.md`
   („bisher sind … gefüllt", mit der Aufzählung der gefüllten Themen
   dahinter). Alle drei zählen von Hand; keiner davon wird gerechnet.

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
abschneiden würde. Dieselbe Regel steht in `shared/formeln.css` für
`.eintrag math[display="block"]` und `.eintrag p` — ein Eintrag hat keinen
Abfrage-Rahmen, der Selektor ist dort deshalb einfacher. Auf dem Papier
ist der Kasten wieder aufgehoben.

Das ist eine Auffanglinie, kein Freibrief: eine Formel, die auf dem
Telefon zur Hälfte hinter dem Rand steht, ist schlecht lesbar, auch wenn
die Seite darum herum heil bleibt. Wer eine breite Zeile schreibt, prüft
sie bei 390 px — oft lässt sie sich in zwei abgesetzte Formeln teilen.

**Eine Klammer um eine hohe Zeile bekommt `.klammer-hoch`.** Dasselbe
Problem wie bei den Matrixklammern, aber ohne `<mtable>`: eine runde Klammer
um einen Bruch — etwa im Gradienten `(∂f/∂x₁, …, ∂f/∂xₙ)` — bleibt auf
Textgröße und ist 15 px hoch, während der Bruch 32 bis 38 px misst. Die
`.matrix-klammer`-Klassen sind dafür **nicht** zu nehmen: sie sind an
`mtable`-Höhen gemessen und heißen so. `.klammer-hoch` (2,7em) ist an beiden
Bruchhöhen gemessen, die auf `ableitungen-gradient.html` vorkommen; sie steht
an keiner zu kurz.

**Ein grosses Operatorzeichen bekommt `.operator-gross`.** Georgia hat das
Integral-, Summen- und Produktzeichen, setzt sie aber auf Textgröße — ein
`∫` ist so nur 15 px hoch gegen eine 21-px-Zeile und wirkt neben `f(x) dx`
gedrückt. Die Klasse in `shared/ui.css` (1,9em, also 30 px) hebt es auf
Anzeigegröße. Anders als bei den Matrixklammern hängt die richtige Größe hier
**nicht** vom Inhalt ab — ein abgesetztes Integralzeichen ist immer gleich
groß. Eine Klasse genügt deshalb für immer, und sie ist nie nachzumessen.

**Eine `<mtable>` schaltet `displaystyle` ab.** In MathML ist der
Vorgabewert an `mtable` `false`, auch innerhalb eines
`<math display="block">`. Brüche in den Zellen schrumpfen dadurch auf
Skriptgröße und werden unleserlich; die Tabelle der Grundintegrale sah
zunächst genau so aus. Abhilfe: `<mtable displaystyle="true">`. Bei einer
reinen Zahlen- oder Buchstabenmatrix fällt es nicht auf — sobald eine Zelle
einen Bruch, eine Wurzel oder ein Integral trägt, schon.

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

**Die beiden Übersichten verweisen aufeinander.** `karten/index.html` und
`formeln/index.html` tragen je eine `.querlink`-Zeile über der Fußzeile, die
zur anderen Übersicht führt — dieselbe Gattung, andere Richtung: die Karten
erklären, die Sammlung schlägt nach. **Eintrag → Karte** kommt dazu, sobald
ein Thema gefüllt ist und es zu seinen Einträgen wirklich eine Karte gibt;
ein Link auf ein leeres Thema ist ein Versprechen ohne Deckung.

**Seit dem 2026-09-04 gibt es diese Richtung wirklich**, und zwar auf den
beiden DGL-Seiten der Formelsammlung: sieben `.querlink`-Zeilen führen von
einem Eintrag auf `karten/differentialgleichungen.html` (samt Sprungmarke
`#charakteristisches-polynom`, `#ansatz`, `#resonanz`) und auf
`tools/schwingung/index.html`. Das ist das Muster für die übrigen Themen.
Zwei Regeln dazu: die Sprungmarke muss auf der Zielkarte wirklich
existieren — sonst landet man lautlos am Seitenanfang —, und der Linktext
sagt, was einen dort erwartet („Durchgerechnet auf der Karte", „Selbst
durchfahren"), nicht bloß den Dateinamen.

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
- Bei Karten **und bei Formelseiten**: Sind die Formeln gesetzt oder steht
  da Quelltext? Zwei Schritte, und ein dritter nur, wenn eine Formel einen
  Bruch hat:

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
- Abfragemodus an und aus (nur Karten — die Formelsammlung kennt keinen
  Abfragemodus). Mit abgeschaltetem JavaScript ist bei beiden alles
  sichtbar: bei Karten, weil der Abfragemodus selbst fehlt; bei
  Formelseiten, weil ohne `shared/formeln.js` nur Verzeichnis und
  Filterzeile fehlen, die Einträge im HTML aber vollständig stehen.
- Druckvorschau: heller Grund, nichts verdeckt, kein Umbruch mitten in
  einer Karte.
- Jeden neuen Link anklicken, über `file://` **und** über HTTP.

**Wer am laufenden Bild nachmisst, stößt auf zwei Cache-Fallen.** Beide
haben in dieser Runde je einen Prüflauf gekostet:

1. **Der Stylesheet-Cache.** Edge und Chromium behalten `shared/*.css` im
   Speicher, auch wenn die Datei auf der Platte längst neu ist. Nach jeder
   CSS-Änderung im schon geöffneten Dokument die `link`-Hrefs mit einem
   Zeitstempel neu setzen, sonst misst man den alten Stand.
2. **Der Dokument-Cache.** Ein zweites `page.goto()` auf **dieselbe** URL
   liefert in Chromium auch das HTML aus dem Speicher, nicht nur die
   Stylesheets. Das erzeugte einmal eine falsche, unsymmetrische
   Klammermessung, die erst nach einem Wechsel auf `?nocache=<Nummer>` in
   der Navigations-URL sauber wurde. Bei jeder erneuten Navigation also
   die URL selbst variieren, nicht nur die Stylesheet-Hrefs.

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
  `shared/theme.css` definiert die Farbtokens hell um, und Inline-SVG
  zieht mit. Ein `<canvas>` nicht: `shared/canvas.js` liest die Tokens
  einmal beim Zeichnen (`MT.canvas.colors()`) und brennt die Werte in die
  Bitmap. Die vier Ansichten des Flächenrechners kommen deshalb in ihren
  Bildschirmfarben aufs Papier. Keine Verschlechterung — vor dieser Runde
  hatte das Werkzeug überhaupt kein Druck-Stylesheet. Wer es beheben will,
  müsste bei `beforeprint` neu zeichnen; das rührt an
  `shared/canvas.js`, also an einer Datei, die diese Runde nicht anfasst.
- **Siebenundzwanzig Farbliterale bestehen fort, und die Regel oben gilt
  trotzdem.** Sie ist eine Regel für neuen Code; der Bestand ist geprüft
  und so gelassen. Wer eines davon „entdeckt", hat es hier schon gefunden.
  Gezählt wird **jedes Literal**, nicht nur jede Tokendefinition — die
  frühere Zählung („Zwanzig") zählte an der Druckpalette nur die sechs
  Tokennamen ihrer damaligen Fassung und übersah dadurch `#fff`/`#111` im
  `body`-Block, `#bbb` an `.karte` und, seit dem Verschieben der
  Druckregeln in Aufgabe 5, `#555` in `shared/ui.css` — vier Literale, die
  keinem der drei Posten zugeordnet waren. Die Formelsammlung-Runde übersah
  dabei selbst noch `#0C2E3E` im `body`-Verlauf von `shared/theme.css`.

  - **Elf in `shared/theme.css`**: der `@media print`-Block (sieben
    Zeilen), die einzige Stelle im Repo, an der Farbtokens außerhalb der
    eigentlichen Palette umdefiniert werden — `--ink`, `--dim`, `--edge`,
    `--grid`, `--axis`, `--gold`, `--mint`, `--rose` als helle Gegenwerte,
    dazu `#fff` und `#111` direkt an `body{background;color}` im
    Druckblock, ohne Umweg über ein Token. Dazu, außerhalb des
    Druckblocks, `#0C2E3E` am hellen Ende des radialen `body`-Verlaufs.
    Der Druckblock steht seit Aufgabe 0 hier, weil er für jede Seite gilt:
    Karten, Werkzeuge, die beiden Übersichten und die Formelsammlung.
  - **Neun in `shared/ui.css`**: die beiden Fehlerfarben `#E06C5A` und
    `#E89383` an `.term.bad` und `.err`, sechs `rgba()`-Werte für
    Trennlinien, Reglerschienen und den Feldgrund, dazu `#555` an
    `a.querlink::after` im Druckblock — hierher gezogen, weil `.querlink`
    seit Aufgabe 0 aus `karten.css` hierher gehört. Die Fehlerfarben und
    `rgba()`-Werte sind Aufhellungen und Abtönungen derselben
    Tokenfamilie; als Token hätte jede einen eigenen Namen gebraucht, den
    nur eine einzige Regel benutzt.
  - **Eine in `shared/karten.css`**: `#bbb` an `.karte{border-color:#bbb}`
    im Druckblock. Ein Rest, der beim Verschieben der Palette nach
    `theme.css` nicht mitgezogen wurde, weil er keine Tokendefinition ist,
    sondern ein eigener Wert an genau dieser Regel.
  - **Sechs in `tools/flaechenrechner/flaechenrechner.js`**: die
    Flächenschattierung der 3D-Ansicht (dort wird die Farbe je Kachel aus
    Tiefe und Beleuchtung gerechnet, sie ist gar kein fester Wert), die
    Schnittebene, die Kachelkanten, die Höhenlinienschar und zwei
    Goldabstufungen. Ein `canvas` liest keine CSS-Variablen; `shared/canvas.js`
    reicht mit `MT.canvas.colors()` genau die Tokens durch, die es kennt.
  - **Null in `shared/formeln.css`.** Die Formelsammlung bringt keine
    einzige Ausnahme mit, geprüft mit
    `grep -nE "#[0-9a-fA-F]{3,8}\b|rgba?\(" shared/formeln.css`.

  Der Grund, warum das hier steht und nicht behoben ist: die Druckpalette
  und die Ausnahme in `karten.css` schützen den **Druck** (siehe den
  Eintrag darüber), und keiner der übrigen Werte erreicht das Papier
  anders, als er es ohnehin täte.
- **Die Matrixklammern sind von Hand bemessen, nicht gestreckt.** Chromium
  und Edge rendern `<mtable>` nur über den UA-Fallback
  `display: inline-table`, und in diesem Fallback greift die
  Streck-Mechanik für `<mo>` nicht — `minsize`/`maxsize` bleiben
  wirkungslos, eine Klammer wächst also nicht von selbst mit ihrer Matrix
  mit. Die Klassen stehen seit der Formelsammlung in `shared/ui.css`
  (vorher, für die Hesse-Matrix allein, in `shared/karten.css`), und es
  sind sieben Größen, nicht mehr eine:

  - `.matrix-klammer` (3,8em) — zweizeilig, an der Hesse-Matrix gemessen
    (ihre Zellen tragen Brüche und sind deshalb hoch): Verhältnis 1,03.
  - `.matrix-klammer-3z` (4,6em) — dreizeilig, an den Drehmatrizen des
    Raums gemessen: Verhältnis 1,07, Überstand 2,2 px.
  - `.matrix-klammer-4z` (5,3em) — vierzeilig, an der DFT-Matrix gemessen:
    Verhältnis 1,06, Überstand 2,3 px.
  - `.matrix-klammer-flach` (2,4em) — zweizeilig, ohne Brüche und ohne
    Winkelbuchstaben (reine Zahlenmatrizen wie `Sx`/`Sy`), an ihnen
    gemessen: Verhältnis 1,04, Überstand 0,7 px.
  - `.matrix-klammer-2z-ober` (2,9em) — zweizeilig, Zellenhöhe um 40 px.
    Zwei Fälle fallen darunter: Buchstaben mit Oberlänge, aber ohne
    Unterlänge (`a`, `b`; 39,7 px — Georgias Ziffern 0 und 1 bleiben auf
    x-Höhe, das `b` steigt darüber, deshalb 39,7 statt 33,7 px), und
    Zellen mit Indizes `a_ij` (39,5 px). Gemessen am 2026-09-04 an
    `(a, −b; b, a)`: Verhältnis 1,08, Überstand 1,7 px; an der Inversen
    der 2×2-Matrix: 1,09. **Der Klassenname nennt den ersten Fall,
    gemeint ist die Höhe.**
  - `.matrix-klammer-4z-tief` (6,4em) — vierzeilig mit tiefergestellten
    Indizes (`b₁`, `b₂`, `b₃`), die jede Zeile höher machen als bei der
    DFT-Matrix: 90,1 px statt 73,4 px. Am 2026-09-04 an der
    Zeilenstufenform gemessen: Verhältnis 1,05, Überstand 2,4 px.
  - `.matrix-strich-2z-index` (2,9em) — die **Determinantenstriche** über
    zwei Zeilen mit Indizes. Eigene Klasse trotz derselben em-Zahl wie
    `.matrix-klammer-2z-ober`, weil der Strich bei gleicher Schriftgröße
    höher baut als die runde Klammer: 45 px gegen 43 px. Am 2026-09-04 an
    den vier Determinanten von `determinante-inverse.html` gemessen:
    Verhältnis 1,03 bis 1,14.

  **Nicht die Zeilenzahl allein bestimmt die passende Klammer, sondern die
  Höhe der Zelle — und die sieben Größen decken die häufigen Fälle, nicht
  jede Zellenhöhe.** Die beiden Größen vom 2026-09-04 sind genau daran
  entstanden: dieselbe Zeilenzahl, andere Zellen, und die vorhandene
  Klasse stand **zu kurz** — die Matrix ragte oben und unten aus ihrer
  Klammer heraus (0,87 bzw. 0,88). Eine neue Matrix wird deshalb
  nachgemessen, bevor sie als fertig gilt; die Klasse nach Zeilenzahl zu
  raten reicht nicht. Eine Zelle mit einem Bruch ist höher als eine mit
  `cos(α)`, und eine mit `cos(α)` ist höher als eine mit einer bloßen
  Zahl; die Anwesenheit eines Buchstabens allein entscheidet nichts.
  `.matrix-klammer` ist an der bruchtragenden Hesse-Matrix gemessen; an
  den flacheren Rotationsmatrizen `Dα` und `Sα` (nur `cos`/`sin`, kein
  Bruch) liegt dieselbe Klasse bei 1,195 — außerhalb des Bandes der
  übrigen Messungen, der Eintrag bleibt aber lesbar. Deutlicher zeigt es
  `.matrix-klammer-3z`, an den (ebenfalls `cos`/`sin`-haltigen)
  Drehmatrizen des Raums gemessen: an der reinen Zahlenmatrix
  `diag(1,−1,1)`, deren Zellen noch flacher sind, liegt das Verhältnis
  bei 1,346. Beide Fälle sind bekannt und so gelassen, nicht übersehen.
  Eine geänderte Schriftgröße der Umgebung verstimmt jede der vier
  Klammern lautlos gegen ihre Matrix — dann muss neu vermessen werden.
- **Ein Überstrich streckt sich nicht — er passt nur über ein einzelnes
  Zeichen.** Dieselbe Ursache wie bei den Matrixklammern, an anderer
  Stelle: der Strich in `<mover>` wächst nicht mit seiner Grundlage mit,
  weil die Seiten Georgia setzen und Georgia keine OpenType-MATH-Tabelle
  hat, aus der Chromium eine gestreckte Fassung des Zeichens bauen könnte.
  `stretchy="true"` bleibt wirkungslos. Gemessen am 2026-09-04 in
  `endliche-koerper.html`: der Strich ist konstant **7,4 px** breit — über
  `x` (9,0 px), `0` (10,0 px), `1` (7,0 px) und `2` (9,1 px) sitzt er
  richtig, über `n − 1` (33,6 px) deckt er 22 % der Breite und steht
  sichtbar falsch. **Wer eine Restklasse eines zusammengesetzten Ausdrucks
  schreiben will, formt die Formel um**, statt am Zeichen zu drehen: aus
  `Z_n = {0̄, 1̄, 2̄, …, n−1‾}` (Skript S. 56) wurde
  `Z_n = {x̄ | x = 0, 1, 2, …, n − 1}` — derselbe Inhalt, jeder Strich über
  genau einem Zeichen.
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
