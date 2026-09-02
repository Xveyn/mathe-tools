# Karteikarten — Design

Datum: 2026-09-01
Status: freigegeben

## Zweck

Eine Sammlung von Karteikarten im Geist einer Formelsammlung — aber jede
Karte zeigt zu ihrem Fall ein durchgerechnetes und illustriertes Beispiel.
Ziel ist, Themen aus Mathematik 2 sichtbar zu machen und damit zu lernen.

Karten und Werkzeuge sind zwei Gattungen desselben Repos. Sie teilen die
Optik aus `shared/`, verlinken sich gegenseitig und hängen an einer
gemeinsamen Startseite.

Erfolgskriterium der ersten Ausbaustufe: Drei Karten stehen, die Querlinks
tragen in beide Richtungen, und eine vierte Karte ließe sich nach der
`CLAUDE.md` ohne Rückfrage schreiben.

## Randbedingungen

Es gelten unverändert die Randbedingungen aus
`2026-09-01-mathe-tools-design.md`: kein Build, keine ES-Module (sonst
bricht `file://`), keine externen Abhängigkeiten und keine Fremdschriften,
alles auf Deutsch, ES5-artiger Stil am Namensraum `MT`, Farben und
Bausteine aus `shared/theme.css` und `shared/ui.css`.

Dazu kommt:

- **Eine Karte ist ohne JavaScript vollständig lesbar.** Der Abfragemodus
  ist Zugabe, keine Voraussetzung.
- **Formeln stehen als MathML im HTML**, nicht als Bild und nicht als Text
  mit Sonderzeichen.
- **Illustrationen sind Inline-SVG**, von Hand gezeichnet.
- **URL-Zustände bleiben ausgeschlossen.** Siehe „Querverlinkung".

## Struktur

```
mathe-tools/
├─ index.html                       zwei Abschnitte: Werkzeuge · Karten
├─ shared/
│  ├─ karten.css                    Kartenbausteine und Druck-Stylesheet
│  └─ abfrage.js                    MT.abfrage
└─ karten/
   ├─ index.html                    Übersicht der Themen
   ├─ partielle-ableitungen.html
   ├─ gradient.html
   └─ extrema-mit-nebenbedingung.html
```

Karten liegen in `karten/`, auf gleicher Höhe wie `tools/` — sie sind eine
eigene Gattung, kein Werkzeug. Ein Werkzeug ist eine Seite, die rechnet;
eine Kartenseite erklärt.

Eine Datei ist ein Thema und enthält mehrere Karten. Dateinamen sind
deutsch, klein, mit Bindestrich verbunden und ohne Umlaute
(`extrema-mit-nebenbedingung.html`). Jede Karte trägt ein `id` in
derselben Schreibweise und ist damit einzeln verlinkbar
(`karten/gradient.html#richtungsableitung`).

Der Inhalt steht als HTML in der Datei — keine Datenstruktur, aus der zur
Laufzeit gerendert wird. Gründe: MathML in JavaScript-Zeichenketten wäre
unlesbar zu schreiben und zu pflegen, und eine Karte soll ohne JavaScript
dastehen, auch im Druck.

## Anatomie einer Karte

Vier Abschnitte sind Pflicht, zwei sind Kür. Die Kür kommt dazu, wo sie
etwas trägt — ein erfundener Merksatz ist schlechter als keiner.

| Abschnitt | Klasse | Pflicht | Inhalt |
|---|---|---|---|
| Bezeichnung | `<h3>` | ja | Wie der Fall heißt |
| Voraussetzungen | `.voraussetzung` | ja | Wann der Satz gilt |
| Formel | `.formel` | ja | MathML |
| Beispiel | `.beispiel` | ja | Durchgerechnet, mit Bild |
| Merksatz | `.merksatz` | nein | Ein Satz, der hängen bleibt |
| Typischer Fehler | `.fehler` | nein | Was schiefgeht, und warum |
| Querlink | `.querlink` | nein | Zum passenden Werkzeug |

Das Gerüst:

```html
<article class="karte" id="kettenregel">
  <h3>Kettenregel für f(x(t), y(t))</h3>

  <div class="voraussetzung">…</div>

  <div class="formel" data-verdeckbar>
    <math>…</math>
  </div>

  <div class="beispiel" data-verdeckbar>
    <p>…Rechenschritte…</p>
    <figure class="bild">
      <svg viewBox="0 0 240 160">…</svg>
      <figcaption>…</figcaption>
    </figure>
  </div>

  <p class="merksatz">…</p>
  <p class="fehler">…</p>

  <a class="querlink" href="../tools/flaechenrechner/index.html">
    Selbst durchfahren → Flächenrechner
  </a>
</article>
```

`data-verdeckbar` ist der einzige Haken, an dem der Abfragemodus hängt.
Eine Karte ohne ihn funktioniert vollständig, sie lässt sich nur nicht
abfragen.

## Formelsatz

Formeln stehen als MathML direkt im HTML. Browser setzen das von Haus aus
— Chromium seit Version 109, Firefox und Safari ohnehin. Das kostet keine
Abhängigkeit, nutzt Systemschriften, druckt scharf, lässt sich markieren
und vorlesen.

Der Preis ist eine geschwätzige Quelle. Das ist bewusst in Kauf genommen:
Die Alternativen wären handgebautes CSS, das bei Doppelintegralen,
Summengrenzen und Matrizen zusammenbricht, oder eine mitgelieferte
Bibliothek samt eigener Schriftdateien — was der Zusage „keine externen
Abhängigkeiten, nur Systemschriften" dem Sinn nach widerspräche.

Regeln:

- Abgesetzte Formeln: `<math display="block">`. Im Fließtext: `<math>`.
- Variablen als `<mi>`, Operatoren als `<mo>`, Zahlen als `<mn>`. Nicht
  alles in `<mi>` werfen — davon hängen Abstände und Kursivsatz ab.
- Keine Formel als Bild, keine als Unicode-Bastelei (`∂f/∂x` als Text).

## Illustrationen

Jedes Bild ist von Hand gezeichnetes Inline-SVG in der Karte.

- Immer mit `viewBox`, nie mit festen Pixelmaßen für `width`/`height` —
  sonst skaliert es nicht und druckt schlecht.
- Farben kommen aus den vorhandenen CSS-Variablen
  (`stroke="var(--gold)"`), nicht als Literale. Sonst bleiben sie im
  Druck-Stylesheet auf ihren Bildschirmwerten stehen.
- Beschriftungen als `<text>` im SVG, nicht ins Bild gemalt.
- Ein Bild, das gerechnet sein müsste, um ehrlich zu sein, wird nicht von
  Hand geschätzt. Dann rechnet man die Punkte einmal aus und trägt sie
  ein — oder die Karte verlinkt auf das Werkzeug, das es live zeigt.

Bewegung bauen Karten nicht nach. Dafür gibt es die Werkzeuge, und dorthin
verlinkt die Karte.

## Abfragemodus

`shared/abfrage.js` stellt `MT.abfrage` bereit. Ein Schalter am Kopf der
Seite setzt die Klasse `abfrage` auf `<body>`; das CSS verdeckt daraufhin
jedes Element mit `data-verdeckbar` und blendet neben ihm einen Knopf zum
Aufdecken ein. Aufgedeckte Karten bleiben aufgedeckt, bis der Schalter
umgelegt wird.

Es wird **nichts gespeichert**. Kein `localStorage`, keine URL, kein
Cookie. Damit entfällt die gesamte Frage, ob Speicherzugriff über `file://`
funktioniert — und die Seite kann in diesem Punkt nicht kaputtgehen. Der
Preis: Nach dem Neuladen ist der Schalter wieder aus.

Ohne JavaScript ist schlicht alles sichtbar.

## Druck

`@media print` in `shared/karten.css`:

- Heller Grund, dunkle Schrift. Der Bildschirm ist dunkel; ungebremst
  gedruckt ergäbe das schwarze Seiten.
- `break-inside: avoid` auf `.karte` — nie ein Seitenumbruch mitten in
  einer Karte.
- Schalter, Aufdeck-Knöpfe und Seitennavigation ausgeblendet.
- Querlinks mit ausgeschriebener Adresse hinter dem Text.
- **Im Druck wird nie verdeckt**, auch wenn der Abfragemodus gerade an
  ist. Sonst druckt jemand ein Blatt mit grauen Balken.

## Querverlinkung

**Karte → Werkzeug:** ein `.querlink` am Fuß der Karte.

**Werkzeug → Karte:** Der Flächenrechner bekommt am **Fuß der Seite**,
hinter dem Analysebereich, eine Zeile, die auf die passenden Karten
zeigt. Unmittelbar unter den Ansichten stünde sie zwischen Bild und
Erklärung und trennte beides; am Seitenfuß steht sie da, wo man mit dem
Werkzeug fertig ist.

**Kein vorbelegter Term.** Ein Link wie `?f=x^2-y^2` würde URL-Zustand
einführen, den die vorige Ausbaustufe ausdrücklich ausschließt, und er
gäbe eine fremde Zeichenkette an den Term-Parser weiter — mit allem, was
an Prüfung und Fehlerbehandlung daran hängt. Die Karte schreibt
stattdessen hin, welchen Term man eingeben soll. Diese Entscheidung ist
bewusst getroffen, nicht vergessen worden.

## Eine Altlast, die diese Runde behebt

`shared/ui.css` gestaltet `figure` und `canvas` **ohne Klasse**, mit
Panel-Hintergrund und Rahmen. Solange nur der Flächenrechner existierte,
war das harmlos. Eine Karte, die `<figure>` für ihre Illustration nutzt —
das semantisch richtige Element —, bekäme ungefragt das Aussehen einer
Werkzeug-Tafel.

Die Regeln werden deshalb auf eine Klasse eingeschränkt, statt Karten um
das richtige Element herumbauen zu lassen. Konkret in `shared/ui.css`:

| heute | künftig |
|---|---|
| `figure { … }` | `.tafel { … }` |
| `canvas { … }` | `.tafel canvas { … }` |
| `figcaption { … }` | `.tafel figcaption { … }` |
| `.grid { … }` | `.ansichten { … }` |

`.tafel` ist die Zeichentafel eines Werkzeugs — Rahmen, Panelhintergrund,
Bildunterschrift. `.ansichten` ist das Raster, in dem mehrere davon
liegen. Beide Namen sagen, was die Sache ist, statt welches Element sie
zufällig benutzt. Im Markup des Flächenrechners bekommen die vier
`<figure>` die Klasse `tafel` und ihr Elternelement die Klasse
`ansichten`.

**Namenskollision, die dabei mit aufzulösen ist:** Die Startseite nennt
ihre Katalogeinträge heute `.karte` — und `.karte` ist künftig die
Karteikarte. Die Startseite wird in dieser Runde ohnehin umgebaut; ihre
Einträge heißen danach `.kachel`. Damit gehört `.karte` eindeutig den
Karteikarten, auch wenn das Kachel-CSS eines Tages nach `shared/` wandert.

Das berührt den Flächenrechner und verlangt eine erneute Prüfung gegen
Referenzbilder. Die alten Referenzbilder lagen im Sitzungsspeicher und
sind verloren; sie werden aus dem unveränderten Original neu aufgenommen,
das außerhalb des Repos liegt und nie verändert wurde.

## Startseite

`index.html` bekommt zwei Abschnitte mit Überschriften: **Werkzeuge** zum
Durchfahren, **Karten** zum Nachschlagen. Der Kartenabschnitt listet
Themen, nicht einzelne Karten — sonst platzt die Seite beim zwanzigsten
Eintrag.

Die Karten der Übersicht sind weiterhin statisches HTML, aus demselben
Grund wie bisher.

## Die ersten drei Karten

**`partielle-ableitungen.html`** — Was eine partielle Ableitung ist,
geometrisch als Steigung der Schnittkurve. Bild: die beiden Schnittkurven
durch einen Punkt. Querlink zum Flächenrechner, der genau diese beiden
Schnitte zeigt.

**`gradient.html`** — Gradient und Richtungsableitung. Bild: Höhenlinien
mit dem Gradientenpfeil senkrecht darauf. Typischer Fehler: der Gradient
zeigt bergauf, nicht entlang der Höhenlinie. Querlink zur
Höhenlinienansicht des Flächenrechners.

**`extrema-mit-nebenbedingung.html`** — Lagrange. Das ist der Härtetest
für den Bauplan: formellastig, wenig zu zeichnen, mit einem berüchtigten
typischen Fehler (die Nebenbedingung am Ende nicht eingesetzt). Wenn der
Bauplan diese Karte trägt, trägt er auch die nächsten zwanzig.

## Verifikation

Karten sind statischer Inhalt; es gibt nichts zu berechnen und daher
nichts, was gegen Referenzbilder zu vergleichen wäre. Geprüft wird:

1. Jede Kartenseite lädt ohne Konsolenfehler, über `file://` und über
   HTTP.
2. Die MathML-Formeln werden gesetzt, nicht als Quelltext angezeigt.
   Prüfbar in zwei Schritten, die auf jeder Karte tragen, plus einem
   dritten, der nur greift, wenn die Karte einen Bruch hat:
   `typeof window.MathMLElement === 'function'`; die `display`-Eigenschaft
   eines `<math>` enthält `math` (`math` im Fließtext, `block math` bei
   `display="block"`) und nicht `inline`; und ein vorhandenes `<mfrac>`
   ist höher als `1.8 ×` sein eigener Zähler.
   **Eine Karte ohne Bruch ist kein Fehlerfall** —
   `extrema-mit-nebenbedingung` ist die erste solche Karte und trägt
   weder `<mfrac>` noch `<msqrt>` noch `<msub>`; der dritte Schritt
   entfällt dort, das Urteil ruht auf den ersten beiden. Der frühere
   Maßstab — irgendein `<mfrac>` gegen die Körpergröße der Seite
   gemessen — fand auf dieser Karte kein Element und schlug blind Alarm;
   auf `gradient.html` schlug er ihn ebenfalls, weil der erste Bruch dort
   nur 20,4 px hoch ist. Der Quotient gegen den eigenen Zähler ist
   maßstabsfrei: über alle 16 Brüche des Repos liegt er zwischen 1,89
   und 2,63. Der ausführliche Ausdruck steht in `CLAUDE.md`.
3. Der Abfragemodus verdeckt und deckt auf; mit abgeschaltetem JavaScript
   ist alles sichtbar.
4. Die Druckansicht zeigt hellen Grund, keine verdeckten Stellen und
   keinen Umbruch mitten in einer Karte.
5. Jeder Querlink trägt, in beide Richtungen, über `file://` und über
   HTTP.
6. Der Flächenrechner ist nach dem Umbau von `shared/ui.css` unverändert
   — geprüft mit der Prüfroutine aus dem Fundament-Plan, gegen neu
   aufgenommene Referenzbilder.

## Bewusst nicht Teil dieser Ausbaustufe

- Mischen, Fortschritt, „kann ich"-Markierung.
- Suche oder Filter über die Karten.
- URL-Zustände, auch nicht für vorbelegte Terme.
- Weitere Themen über die drei genannten hinaus.
- Ausschneidbare Karteikarten fester Größe. Ein durchgerechnetes Beispiel
  mit Illustration passt nicht auf A6; entweder verliert der Inhalt oder
  das Format.
