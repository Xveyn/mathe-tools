# Formelsammlung — Design

> **Stand 2026-09-03, freigegeben.** Diese Spec legt die **Bauform** fest. **Was**
> hineinkommt, steht in `2026-09-03-formelsammlung-inhalt.md` (144 Einträge mit
> Skriptseite, Aufgabennummern und Priorität); diese Spec setzt jene Aufnahme
> voraus und wiederholt sie nicht.

## Die Gattung

Das Repo kennt bisher zwei Gattungen: **Werkzeuge** unter `tools/` rechnen etwas
vor, **Karten** unter `karten/` erklären etwas. Dazu kommt jetzt eine dritte:
die **Formelsammlung** unter `formeln/` hält alles zum Nachschlagen bereit.

Sie erklärt nichts. Eine Karte führt zum Verständnis — Voraussetzung, Formel,
durchgerechnetes Beispiel, Bild, typischer Fehler. Die Sammlung setzt Verständnis
voraus und liefert die Formel: man weiß, was man sucht, und will es in Sekunden
haben. Wo eine Karte existiert, verweist der Eintrag auf sie.

Beide decken denselben Stoff, aus zwei Richtungen. Eine Formel, die schon auf
einer Karte steht, kommt trotzdem in die Sammlung — ein Nachschlagewerk mit
Lücken ist keins.

## Fünf Entscheidungen

Sie sind getroffen und begründet; wer sie ändern will, ändert diese Spec.

1. **Schnitt nach Abschnitten, nicht nach Kapiteln.** 14 Themen, je 4 bis 18
   Einträge. Nach den vier Skriptkapiteln geschnitten trüge die Datei zur
   linearen Algebra allein 71 Einträge — eine Seite, durch die man scrollt statt
   in ihr zu finden.
2. **Ein Eintrag ist Formel plus Bedingung.** Name, Voraussetzung in einer Zeile,
   Formel, Skriptseite. Kein Beispiel: eine Formel ohne ihre Bedingung ist eine
   Falle (Ansatztabellen, Partialbruchtypen, der Satz über implizite Funktionen),
   ein Beispiel dagegen ist der Stoff der Karte.
3. **Verzeichnis und Filterfeld je Seite.** Sprungmarken zum Überfliegen, ein
   Feld zum Eintippen. Keine Suche über alle Dateien — die bräuchte einen Index,
   also dieselbe Formel an zwei Stellen im Repo.
4. **Druck einspaltig, je Thema.** Formeln brechen nicht um; eine halbe Spalte
   kann die Ansatztabellen der DGL, die Hesse-Matrix oder eine 4×4-Matrix nicht
   aufnehmen. Zweispaltig wäre dichter und würde genau an den wichtigsten
   Einträgen über den Rand treten.
5. **Der Inhalt steht als MathML im HTML.** Nicht als Datenstruktur in
   JavaScript: MathML in JS-Zeichenketten ist unlesbar, und eine Seite, die sich
   erst durch ein Skript füllt, ist ohne JavaScript leer — das bricht die harte
   Regel aus `CLAUDE.md`. Der geteilte Baustein macht nur Verzeichnis und Filter.

## Ort und Dateien

```
formeln/index.html              Übersicht, 14 Kacheln unter vier Überschriften
formeln/<thema>.html            eine Datei je Thema
shared/formeln.css              Eintrag, Verzeichnis, Filterzeile, Druck
shared/formeln.js               MT.formeln.start() — Verzeichnis und Filter
```

Dateinamen deutsch, klein, mit Bindestrich, ohne Umlaute — wie bei den Karten.

| # | Datei | Titel | Einträge aus der Aufnahme | Anzahl |
|---|---|---|---|---|
| 1 | `integral-grundlagen.html` | Integralrechnung — Grundlagen und Hauptsatz | 1.1–1.13, 1.23 | 14 |
| 2 | `integral-verfahren.html` | Integralrechnung — Verfahren und Partialbrüche | 1.14–1.22 | 9 |
| 3 | `dgl-erster-ordnung.html` | Differentialgleichungen erster Ordnung | 2.1–2.4, 2.14 | 5 |
| 4 | `dgl-zweiter-ordnung.html` | Differentialgleichungen zweiter Ordnung | 2.5–2.13 | 9 |
| 5 | `endliche-koerper.html` | Endliche Körper und Restklassen | 3.1–3.7 | 7 |
| 6 | `vektorraeume-rang.html` | Vektorräume, lineare Abbildungen, Rang | 3.8–3.21d | 18 |
| 7 | `skalarprodukt.html` | Skalarprodukt und Orthogonalität | 3.22–3.26 | 5 |
| 8 | `determinante-inverse.html` | Determinante und Inverse | 3.27–3.34 | 8 |
| 9 | `drehungen-spiegelungen.html` | Drehungen und Spiegelungen | 3.35–3.42 | 9 |
| 10 | `eigenwerte.html` | Eigenwerte und Eigenvektoren | 3.43–3.52 | 10 |
| 11 | `basiswechsel-zerlegungen.html` | Basiswechsel und Zerlegungen | 3.53–3.63 | 12 |
| 12 | `homogene-koordinaten.html` | Homogene Koordinaten | 3.64–3.69 | 6 |
| 13 | `ableitungen-gradient.html` | Partielle Ableitungen und Gradient | 4.1–4.12 | 14 |
| 14 | `extrema-fehler.html` | Extrema, Fehlerfortpflanzung, kleinste Quadrate | 4.13–4.26, Z.1–Z.4 | 18 |

Summe 144 — die Aufnahme geht vollständig auf. Die vier Einträge zu den
kleinsten Quadraten stehen bei den Extrema, weil sie eine Extremwertaufgabe
sind; alles andere ohne Skriptkapitel ist in seinem Kapitel eingeordnet und dort
gekennzeichnet.

**Die Zahl 136 aus einer früheren Fassung war falsch.** Eine Prüfung der
Aufnahme gegen das Skript am 2026-09-03 hat drei doppelt gezählte Einträge
gefunden und elf fehlende ergänzt.

## Die Übersichtsseite `formeln/index.html`

Aufbau wie `karten/index.html`: `h1`, eine `.lede`-Zeile, dann die Kacheln. Neu
ist die Gruppierung — 14 Kacheln ungeordnet nebeneinander wären eine Wand, also
stehen sie unter vier `h2.abschnitt` nach den Skriptkapiteln (die Regel dazu kommt aus `ui.css`, siehe Vorbereitung):

```
Integralrechnung          → Kacheln 1, 2
Differentialgleichungen   → Kacheln 3, 4
Lineare Algebra           → Kacheln 5 bis 12
Funktionen mehrerer Variablen → Kacheln 13, 14
```

Jede Kachel ist eine `.kachel` aus `shared/ui.css` — derselbe Baustein wie auf
Startseite und Kartenübersicht, kein neuer. Kacheltitel als `h3` (sie stehen
unter einer `h2`). Der Text unter dem Titel nennt in einer Zeile, was drinsteht,
und die Zahl der Einträge.

Am Fuß eine `.seitenfuss`-Zeile zurück zur Startseite.

## Aufbau einer Themenseite

```html
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="../favicon.svg">
<title>Drehungen und Spiegelungen</title>
<link rel="stylesheet" href="../shared/theme.css">
<link rel="stylesheet" href="../shared/ui.css">
<link rel="stylesheet" href="../shared/formeln.css">
</head>
<body>
<div class="wrap">

  <h1>Drehungen und Spiegelungen</h1>
  <p class="lede">…ein Satz, was das Thema umfasst…</p>

  <!-- hier setzt MT.formeln.start() Filterzeile und Verzeichnis ein -->

  <article class="eintrag" id="drehmatrix">…</article>
  <article class="eintrag" id="spiegelung-an-geneigter-achse">…</article>
  …

  <p class="seitenfuss"><a href="index.html">← Alle Themen im Überblick</a></p>

</div>
<script src="../shared/formeln.js"></script>
<script>MT.formeln.start();</script>
</body>
</html>
```

`shared/karten.css` wird **nicht** eingebunden: die Sammlung ist keine Karte, und
`.formel`, `.beispiel`, `.karte` gehören dort hin. Die Themenseiten brauchen nur
`theme.css`, `ui.css` und `formeln.css`.

## Der Eintrag

```html
<article class="eintrag" id="partielle-integration" data-suche="produktregel umkehrung">
  <h3>Partielle Integration <span class="quelle">Skript S. 28</span></h3>
  <p class="bedingung">f, g stetig differenzierbar</p>
  <math display="block">…</math>
  <a class="querlink" href="../karten/…">Erklärt auf der Karte →</a>
</article>
```

**Pflicht** sind `h3` mit `.quelle` und die Formel. **Kür** sind `.bedingung`
(fehlt, wo es keine gibt), `data-suche` und der `.querlink`.

- **`id`** deutsch, klein, mit Bindestrich, ohne Umlaute — wie bei den Karten.
  Damit ist jeder Eintrag als `formeln/eigenwerte.html#charakteristisches-polynom`
  verlinkbar.
- **`.quelle`** nennt die Skriptseite, `Skript S. 28`. Einträge ohne Skriptstelle
  (die zwölf aus der Aufnahme) tragen stattdessen `nicht im Skript` und
  begründen das in der `.bedingung`-Zeile mit einem Halbsatz.
- **`.bedingung`** ist **eine** Zeile. Was länger wird, gehört auf die Karte.
- **`data-suche`** nimmt auf, wonach man sucht, was aber nicht im Titel steht:
  Abkürzungen (`PBZ`, `ONB`, `SVD`, `AWP`), Symbolnamen (`Nabla`, `lambda`),
  umlautfreie Schreibungen (`koerper`, `hoehenlinie`). Ohne diese Liste findet
  der Filter „Partialbruchzerlegung" nicht unter `pbz`.
- **`.querlink`** nur, wo es die Karte wirklich gibt. Ein Link ins Leere ist
  schlimmer als keiner.

**Mehrere Formeln in einem Eintrag** sind erlaubt und bei den Ansatztabellen und
den Fallunterscheidungen der Normalfall — mehrere `math display="block"`
untereinander, dazwischen eine `p.fall`-Zeile, die den Fall benennt („`D > 0` —
zwei reelle Nullstellen"). Diese Bauform ist auf `karten/differentialgleichungen.html`
bereits erprobt: Prosa gehört **nicht** als `<mtext>` in das MathML, sonst bricht
die Zeile bei schmalem Fenster nicht um.

Die Regeln aus `CLAUDE.md` gelten unverändert: MathML direkt im HTML, Punkte in
der Strichform `(0 | 0)`, Komma bei Funktionsargumenten und Vektoren, keine
Farbliterale, keine Formel als Bild.

## `shared/formeln.js`

Ein Baustein nach dem Muster von `shared/abfrage.js`: `var MT = MT || {};`,
IIFE, `"use strict"`, ES5-Stil. Schnittstelle:

```js
MT.formeln.start()
```

Aufgerufen am Ende der Seite. Er tut drei Dinge:

1. **Filterzeile bauen.** Ein `input type="search"` mit Beschriftung, eingesetzt
   vor den ersten `article.eintrag`.
2. **Verzeichnis bauen.** Aus den `h3` der Einträge eine Liste von Sprunglinks
   auf ihre `id`. Das Verzeichnis entsteht damit aus dem, was auf der Seite
   steht, und kann nicht veralten.
3. **Filtern.** Bei jeder Eingabe wird kleingeschrieben verglichen: Titeltext,
   Bedingungstext und `data-suche`. Was nicht passt, wird ausgeblendet — der
   Eintrag **und** seine Zeile im Verzeichnis. Passt nichts, erscheint eine Zeile
   „Kein Eintrag passt zu …". Leeres Feld zeigt wieder alles.

**Ohne JavaScript** fehlen Filterzeile und Verzeichnis; alle Einträge stehen
vollständig da. Das ist der Grund, warum beide vom Skript erzeugt werden und
nicht im HTML stehen: ein Filterfeld, das nichts tut, ist schlimmer als keins,
und ein von Hand gepflegtes Verzeichnis veraltet.

Kein Zustand in der URL, kein `localStorage`, keine Tastenkürzel.

## Vorbereitung: drei geteilte Dinge kommen nach `shared/`

Eine kritische Durchsicht des Ist-Zustands am 2026-09-03 hat drei Stellen gefunden,
an denen die Formelsammlung etwas verdoppeln müsste, das es schon gibt. Alle drei
werden **vorher** an ihren richtigen Platz gehoben; erst danach entsteht die neue
Gattung. Das ist kein Beiwerk, sondern die Voraussetzung dafür, dass die Sammlung
ohne Doppelpflege auskommt.

**1. Die Druckpalette gehört nach `theme.css`.** Der ursprüngliche Entwurf wollte
die sechs Zeilen aus dem `@media print`-Block von `karten.css` in `formeln.css`
wiederholen, mit der Begründung, die Werkzeugseiten dürften nichts abbekommen. Die
Begründung ist falsch: **beide Werkzeugseiten laden `karten.css` bereits**
(`tools/flaechenrechner/index.html:10`, `tools/schwingung/index.html:10`) und
nutzen daraus keine einzige Klasse — der einzige Treffer, `.querlink`, steht in
`ui.css`. Sie binden `karten.css` ausschließlich wegen des Druckblocks ein. Die
Palette ist also längst gattungsübergreifend und gehört dorthin, wo alle Tokens
stehen: in einen `@media print`-Block in `theme.css`. Das behebt nebenbei einen
bestehenden Mangel — `index.html` und `karten/index.html` laden `karten.css`
nicht und drucken heute hellblauen Text auf weißem Grund.

Was gattungseigen ist, bleibt gattungseigen: `.karte`, `.abfrage-leiste` und der
Abfragemodus in `karten.css`, `.eintrag` und `.filterzeile` in `formeln.css`. Die
Druckregel für `.seitenfuss` wandert zu `.seitenfuss` selbst, also nach `ui.css`.

**2. Die Matrixklammern gehören nach `ui.css`.** `karten.css` definiert heute
`.matrix-rahmen` und `.matrix-klammer`; die Formelsammlung braucht dieselbe
Mechanik für zwei-, drei- und vierzeilige Matrizen. Statt eine zweite
Namensfamilie danebenzustellen, ziehen beide Klassen nach `ui.css` und bekommen
dort zwei Geschwister: `.matrix-klammer-3z` und `.matrix-klammer-4z`.
`karten/extremwerte.html` bleibt unverändert und benutzt weiter
`.matrix-rahmen` und `.matrix-klammer`.

**3. Die Abschnittsüberschrift gehört nach `ui.css`.** Die Startseite gestaltet
`h2.abschnitt` in einem seitenlokalen `<style>`-Block (`index.html:10-15`). Die
Formelübersicht braucht genau dieselbe Überschrift für ihre vier Kapitel. Ein
blankes `<h2>` gibt es im Repo nirgends gestaltet — es fiele auf die
Browservorgabe zurück und sähe in derselben Rolle anders aus als die Startseite.
Also wandert die Regel nach `ui.css`, und die Startseite verliert ihren
`<style>`-Block.

## `shared/formeln.css`

Neue Klassen, alle bisher unbenutzt — geprüft gegen `ui.css` und `karten.css`,
null Treffer im ganzen Repo: `.eintrag`, `.quelle`, `.bedingung`, `.fall`,
`.verzeichnis`, `.filterzeile`, `.leer`. **`.formel` und `.beispiel` sind tabu**,
die gehören den Karten. Die Matrixklammern kommen aus `ui.css` (siehe
Vorbereitung), nicht aus dieser Datei.

Gestaltung: ein Eintrag ist eine Fläche wie eine Karte, nur flacher — Rahmen aus
`--edge`, Grund aus `--panel-b`, weniger Polsterung. Titel in Georgia wie die
Kartenüberschriften, `.quelle` klein und in `--dim`, rechtsbündig in derselben
Zeile. Formeln zentriert.

**Breiten: was `karten.css` mitbringt, fehlt hier.** `.wrap` aus `ui.css` ist
1320 px breit — das ist die Breite der Werkzeugseiten und der Kachelraster. Auf
den Kartenseiten begrenzt nicht `.wrap` die Spalte, sondern `.karte` mit
`max-width:46rem`, und `karten.css` gibt derselben Regel auch die `.seitenfuss`
mit. Die Formelseiten laden `karten.css` nicht. Also muss `formeln.css` die
Spaltenbreite selbst setzen:

- `.eintrag` bekommt `max-width:46rem` — dieselbe Spalte wie eine Karte, sonst
  laufen die Einträge über die volle Fensterbreite.
- `.seitenfuss` und die `.filterzeile` bekommen sie ebenfalls, damit sie unter
  der Spalte enden und nicht quer über die Seite laufen. `.querlink` braucht sie
  **nicht**: die 46 rem stehen für ihn schon in `ui.css:151` und gelten auf
  Formelseiten von selbst.
- Im Druck ist `.seitenfuss` auszublenden — auch diese Regel steht heute in
  `karten.css` und gilt nicht mit.

**Der Scrollkasten muss mit.** Die Regel aus `shared/karten.css` gilt hier
genauso und wird sinngemäß übernommen:

```css
.eintrag math[display="block"], .eintrag p{
  overflow:auto hidden; scrollbar-width:thin; scrollbar-color:var(--dim) transparent;
}
```

Beide Achsen ausdrücklich — steht nur `overflow-x`, macht CSS aus dem übrigen
`visible` ein `auto`, und jede Zeile legt sich 10 px für einen senkrechten Balken
zurecht, den niemand braucht. Das ist am 2026-09-03 auf den Karten passiert und
dort dokumentiert.

## Druck

`@media print` in `formeln.css`, nach dem Vorbild von `karten.css`:

- Die hellen Farbtokens kommen aus `theme.css` (siehe Vorbereitung) und gelten
  hier von selbst; `formeln.css` definiert **keine** eigene Palette.
- `.filterzeile` und `.seitenfuss` verschwinden.
- **Das Verzeichnis bleibt** — auf Papier ist es das Inhaltsverzeichnis des
  Blattes.
- `.eintrag { break-inside: avoid; }` — kein Eintrag wird zwischen zwei Seiten
  zerrissen.
- Der Scrollkasten wird aufgehoben (`overflow:visible`), sonst schneidet er
  lautlos ab.
- `.querlink` bekommt seine URL angehängt, wie auf den Karten.

Einspaltig. Nachzumessen im Druckmodus: keine Formel tritt über den Rand des
Satzspiegels.

## Eintragen und Wege

1. **Startseite `index.html`** bekommt einen dritten Abschnitt „Formelsammlung"
   mit **einer** `.kachel` auf `formeln/index.html`. Nicht vierzehn — die
   Sammlung hat ihre eigene Übersicht, und die Startseite bleibt ein Überblick.
2. **Jede Themenseite** trägt am Fuß die `.seitenfuss`-Zeile zurück zu
   `formeln/index.html`.
3. **Querlinks von den Karten in die Sammlung** kommen in einer späteren Runde.
   Diese Runde verlinkt nur in die eine Richtung.
4. `CLAUDE.md` und `README.md` sind nachzuziehen: die Gattung ist neu, der
   `Aufbau`-Block nennt sie noch nicht, und der Bauplan „Eine Karte schreiben"
   bekommt ein Gegenstück „Einen Formeleintrag schreiben".

## Prüfung, bevor etwas „fertig" ist

Zusätzlich zu den Regeln aus `CLAUDE.md`:

- **Formelsatz** wie bei den Karten: `window.MathMLElement` vorhanden, `display`
  enthält `math`, ein `mfrac` ist höher als das 1,8-fache seines Zählers.
- **Bei 390 px**: Die Seite scrollt nicht seitlich. Jeder Scrollkasten, der
  entsteht, fängt links bündig an und lässt sich bis zum letzten Zeichen fahren.
  Kein Eintrag legt sich einen senkrechten Balken zurecht.
- **Filter**: Ein Wort tippen, das nur einen Eintrag trifft — Eintrag und
  Verzeichniszeile bleiben, alles andere verschwindet. Ein Wort tippen, das
  nichts trifft — die `.leer`-Zeile erscheint. Feld leeren — alles ist wieder da.
- **Ohne JavaScript**: Alle Einträge sichtbar, Filterzeile und Verzeichnis fehlen
  spurlos (kein leerer Kasten, keine tote Zeile).
- **Sprungmarken**: Jede Verzeichniszeile führt zu ihrem Eintrag, über `file://`
  und über HTTP.
- **Druckvorschau**: hell, einspaltig, Verzeichnis vorhanden, Filterzeile weg,
  kein Eintrag zerrissen, keine Formel über dem Rand.
- **Konsole ohne Fehler** auf jeder neuen Seite.

## Diese Runde

0. Die Vorbereitung: Druckpalette nach `theme.css`, Matrixklammern und
   `h2.abschnitt` nach `ui.css` (siehe oben). Danach sieht jede bestehende
   Seite am Bildschirm unveraendert aus und druckt richtig.
1. `shared/formeln.css` und `shared/formeln.js`.
2. `formeln/index.html` mit allen 14 Kacheln.
3. Alle 14 Themendateien als Gerüst: Kopf, `h1`, `.lede`, Seitenfuß,
   Skripteinbindung — **ohne** Einträge.
4. **Ein Thema vollständig: `drehungen-spiegelungen.html`**, neun Einträge
   (3.35 bis 3.42, einschließlich 3.40a). Begründung: laut Inhaltsaufnahme der meistgesuchte Block der
   linearen Algebra, er besteht fast nur aus Matrizen — also aus dem breitesten
   und heikelsten Satzfall — und er hat noch keine Karte, an der man sich
   entlanghangeln könnte. Trägt die Form dort, trägt sie überall.
5. Eintragen auf der Startseite, `CLAUDE.md` und `README.md` nachziehen.

Die Formeln dieses einen Themas werden **von den Skriptseiten abgelesen, nicht
aus dem extrahierten Text abgetippt** — die Textextraktion verstümmelt Formeln.
Betroffen sind die Seiten 67 sowie 82 bis 85.

## Bewusst nicht in dieser Runde

- Die übrigen dreizehn Themen. Sie folgen, wenn die Form am Muster geprüft ist.
- Eine Suche über alle Dateien.
- Beispiele in den Einträgen.
- Querlinks von den Karten zurück in die Sammlung.
- Ein Werkzeug zur Sammlung (etwa ein Matrixrechner). Eigene Runde, eigene Spec.

## Bekannte Risiken

- **Acht Matrizen auf einer Seite sind der Härtefall für den Satz.** Die
  handbemessene Klammer der Hesse-Matrix (`font-size:3.8em`) ist auf zwei Zeilen
  abgestimmt; die Drehmatrizen im Raum haben drei, die homogenen Koordinaten
  vier. Die zwei neuen Größen werden gemessen, nicht geschaetzt — Verhältnis von
  Klammerhöhe zu Matrixhöhe zwischen 1,00 und 1,15.
- **14 Gerüstdateien ohne Inhalt sind vierzehn Sackgassen.** Bis ein Thema
  gefüllt ist, muss seine Seite das sagen — eine Zeile „Dieses Thema ist noch
  nicht gefüllt", nicht eine leere Fläche. Die Kachel in der Übersicht sagt es
  ebenfalls.
- **Der Filter kennt nur, was auf der Seite steht.** Wer „Determinante" auf der
  Eigenwertseite eintippt, findet nichts, obwohl es einen Eintrag dazu gibt —
  eine Datei weiter. Das ist der Preis der Entscheidung gegen die globale Suche
  und in der `.lede` jeder Seite zu erwähnen.
