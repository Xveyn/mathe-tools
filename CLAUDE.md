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
| `shared/scene3d.js` | `MT.scene3d` — Projektion, Drehen |
| `shared/abfrage.js` | `MT.abfrage` — Verdecken und Aufdecken auf Karten |
| `shared/extrema.js` | `MT.extrema` — stationäre Stellen suchen und einordnen |

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
eine Runde lang auf einer einzigen Seite. Sie ist jetzt durchgehend in der
Strichform gesetzt. Die drei älteren Karten —
`partielle-ableitungen.html`, `gradient.html`,
`extrema-mit-nebenbedingung.html` — tragen noch die Kommaform; sie
umzustellen ist eine eigene, noch offene Aufgabe und war nicht Teil der
Extremwert-Runde.

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
   `shared/ui.css` einbinden, dazu die gebrauchten `shared/*.js`.
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

## Bekannte Grenzen

Kein Fehler, sondern geprüft und so gelassen. Wer eine davon „entdeckt",
hat sie hier schon gefunden.

- **Der Druck erreicht die vier Zeichentafeln nicht.** `@media print` in
  `shared/karten.css` definiert die Farbtokens hell um, und Inline-SVG
  zieht mit. Ein `<canvas>` nicht: `shared/canvas.js` liest die Tokens
  einmal beim Zeichnen (`MT.canvas.colors()`) und brennt die Werte in die
  Bitmap. Die vier Ansichten des Flächenrechners kommen deshalb in ihren
  Bildschirmfarben aufs Papier. Keine Verschlechterung — vor dieser Runde
  hatte das Werkzeug überhaupt kein Druck-Stylesheet. Wer es beheben will,
  müsste bei `beforeprint` neu zeichnen; das rührt an
  `shared/canvas.js`, also an einer Datei, die diese Runde nicht anfasst.
- **Fünfzehn Farbliterale bestehen fort, und die Regel oben gilt trotzdem.**
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

## Ton

Nüchtern und deutsch. Keine Werbesprache, keine Ausrufezeichen. Eine
Karte erklärt einer Person, die den Stoff gerade lernt — nicht einer, die
ihn schon kann, und nicht einer, die beeindruckt werden soll.
