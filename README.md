# Mathe-Werkzeuge

Kleine Browser-Seiten, die Begriffe aus der Vorlesung sichtbar machen.
Entstanden neben der Vorlesung Mathematik 2. Drei Gattungen: Werkzeuge
rechnen etwas vor, Karten erklären etwas, die Formelsammlung schlägt
etwas nach.

**→ [xveyn.github.io/mathe-tools](https://xveyn.github.io/mathe-tools/)**

## Was drin ist

**Werkzeuge**

| Werkzeug | Worum es geht |
|---|---|
| [Flächenrechner](tools/flaechenrechner/index.html) | Eine Funktion `z = f(x, y)` als Fläche im Raum, ihre Höhenlinien und die beiden senkrechten Schnitte — gleichzeitig und farblich verknüpft. Dazu sucht er die stationären Stellen im gezeigten Bereich, ordnet sie über die Hesse-Matrix ein (Determinante und Urteil im Klartext) und markiert sie im Höhenlinienbild. |
| [Schwingungsrechner](tools/schwingung/index.html) | Eine lineare Differentialgleichung zweiter Ordnung mit konstanten Koeffizienten `y'' + a·y' + b·y = s(x)`: charakteristisches Polynom, homogene Lösung, Ansatz für die rechte Seite samt Resonanzprüfung und, mit Anfangswerten, die Konstanten C₁ und C₂. |

**Karten**

| Karte | Worum es geht |
|---|---|
| [Partielle Ableitungen](karten/partielle-ableitungen.html) | Eine Funktion zweier Veränderlicher wird nach einer Variablen abgeleitet, während die andere festgehalten wird. |
| [Gradient und Richtungsableitung](karten/gradient.html) | Der Gradient bündelt beide partiellen Ableitungen zu einem Vektor; die Richtungsableitung fragt nach der Steigung in einer beliebigen anderen Richtung. |
| [Extrema mit Nebenbedingung](karten/extrema-mit-nebenbedingung.html) | Extrema, die nur auf einer Nebenbedingung gesucht sind — der Multiplikator von Lagrange liefert die Kandidaten. |
| [Extremwerte](karten/extremwerte.html) | Erst liefert der Gradient die stationären Stellen, dann entscheidet die Hesse-Matrix, ob jede davon ein Minimum, ein Maximum oder ein Sattelpunkt ist. |
| [Lineare Differentialgleichungen zweiter Ordnung](karten/differentialgleichungen.html) | Charakteristisches Polynom und die drei Fälle seiner Nullstellen, der Ansatz vom Typ der rechten Seite und die Resonanz, die ihn um den Faktor x erweitert. |

Alle fünf sind auch von der Startseite aus erreichbar, dazu über
[karten/index.html](karten/index.html), das alle Kartenthemen im Überblick
zeigt.

**Formelsammlung**

| Thema | Worum es geht |
|---|---|
| [Integralrechnung — Grundlagen und Hauptsatz](formeln/integral-grundlagen.html) | Ober- und Untersumme, Hauptsatz, Grundintegrale-Tabelle, uneigentliche Integrale. |
| [Integralrechnung — Verfahren und Partialbrüche](formeln/integral-verfahren.html) | Partielle Integration, Substitutionsregel, Partialbruchzerlegung, Polynomdivision. |
| [Differentialgleichungen erster Ordnung](formeln/dgl-erster-ordnung.html) | Anfangswertproblem, trennbare Variablen, lineare DGL erster Ordnung, Ansatztabelle. |
| [Differentialgleichungen zweiter Ordnung](formeln/dgl-zweiter-ordnung.html) | Charakteristische Gleichung, die drei Fälle der Diskriminante, Ansatztabelle mit Resonanz, drei Schreibweisen nebeneinander. |
| [Endliche Körper und Restklassen](formeln/endliche-koerper.html) | Gruppen- und Körperaxiome, Restklassen, GF(p), Inversentabellen. |
| [Vektorräume, lineare Abbildungen, Rang](formeln/vektorraeume-rang.html) | UVR-Kriterium, Abbildungsmatrix, Kern und Bild, Rang, die Äquivalenzkette der Regularität. |
| [Skalarprodukt und Orthogonalität](formeln/skalarprodukt.html) | Skalarprodukt, komplexes Skalarprodukt, Orthonormalbasis, Projektion, Vektorprodukt. |
| [Determinante und Inverse](formeln/determinante-inverse.html) | Determinante von 2×2- und 3×3-Matrizen, Laplace-Entwicklung, Rechenregeln, Inverse. |
| [Drehungen und Spiegelungen](formeln/drehungen-spiegelungen.html) | Orthogonale und unitäre Matrizen, Drehmatrizen in Ebene und Raum, Spiegelungen, unitäre Beispiele. |
| [Eigenwerte und Eigenvektoren](formeln/eigenwerte.html) | Eigenwerte und Eigenvektoren, charakteristisches Polynom, symmetrische und hermitesche Matrizen. |
| [Basiswechsel und Zerlegungen](formeln/basiswechsel-zerlegungen.html) | Transformationsmatrix, Diagonalisierung, Spektralzerlegung, SVD und Pseudoinverse. |
| [Homogene Koordinaten](formeln/homogene-koordinaten.html) | Einbettung in homogene Koordinaten, Verschiebungsmatrix, Drehung um einen Punkt, Skalierung mit Fixpunkt. |
| [Partielle Ableitungen und Gradient](formeln/ableitungen-gradient.html) | Höhenlinien, partielle Ableitung, Gradient, Jacobi-Matrix, Rotation und Divergenz. |
| [Extrema, Fehlerfortpflanzung, kleinste Quadrate](formeln/extrema-fehler.html) | Stationäre Stellen, Hesse-Matrix, Taylorpolynom, Fehlerfortpflanzung, kleinste Quadrate. |

Vierzehn Themen, 144 Einträge insgesamt; bisher sind zwei gefüllt —
[Drehungen und Spiegelungen](formeln/drehungen-spiegelungen.html) mit neun
Einträgen, das als Muster für die übrigen dient, und
[Endliche Körper und Restklassen](formeln/endliche-koerper.html) mit
sieben. Erreichbar ist die Sammlung von der Startseite aus, dazu über
[formeln/index.html](formeln/index.html), das alle Formelthemen im
Überblick zeigt.

## Wie es gebaut ist

Reines HTML, CSS und JavaScript. Kein Build, keine Abhängigkeiten, kein
npm. Jede Seite läuft genauso gut per Doppelklick aus dem Dateisystem
wie über den Link oben.

```
shared/     gemeinsame Bausteine, hängen am globalen Objekt MT
tools/      ein Ordner je Werkzeug, jeder mit eigener index.html
karten/     eine Datei je Thema, jede mit mehreren Karten darin
formeln/    eine Datei je Thema, jede mit mehreren Formeleinträgen darin
index.html  die Startseite
CLAUDE.md   Arbeitsregeln und Bauplan für Werkzeuge, Karten und
            Formeleinträge
```

Die gemeinsamen Bausteine:

| Baustein | Wofür |
|---|---|
| `shared/expr.js` | `MT.expr.compile(term, vars)` — Terme wie `-x^2/4 - y^2/9` in aufrufbare Funktionen übersetzen |
| `shared/canvas.js` | `MT.canvas` — scharfe Zeichenflächen, lineare Achsen, Farben aus dem Stylesheet |
| `shared/plot2d.js` | `MT.plot2d` — Höhenlinien nach Marching Squares, unterbrochene Linienzüge |
| `shared/scene3d.js` | `MT.scene3d` — Projektion in den Raum, Drehen und Zoomen per Maus oder Regler; die Höhe wird normiert statt im Maßstab von x und y gezeichnet |
| `shared/abfrage.js` | `MT.abfrage` — Verdecken und Aufdecken auf Karten |
| `shared/extrema.js` | `MT.extrema` — stationäre Stellen suchen und einordnen |
| `shared/dgl.js` | `MT.dgl.loese(a, b, glieder, anfang)` — lineare Differentialgleichungen zweiter Ordnung mit konstanten Koeffizienten, geschlossen gelöst |
| `shared/theme.css` | Farbtokens und Grundtypografie, dazu die Druckpalette (heller Blattfarben-Satz im `@media print`-Block, gilt für jede Seite) |
| `shared/ui.css` | Panels, Regler, Chips, Raster, dazu die Katalog-Kacheln, die Ansichtsregler-Gruppe `.blick` an einer Zeichentafel, die Abschnittsüberschrift `h2.abschnitt` und die handbemessenen Matrixklammern (`.matrix-klammer` und ihre drei Geschwister) — die Startseite, die Kartenübersicht und die Formelübersicht teilen sich diese Bausteine |
| `shared/karten.css` | Bausteine der Karten, samt Druck-Stylesheet |
| `shared/formeln.css` | Bausteine der Formelsammlung: der Eintrag `.eintrag`, Verzeichnis und Filterzeile, samt Druck-Stylesheet — lädt nie zusammen mit `karten.css` |
| `shared/formeln.js` | `MT.formeln.start()` — Verzeichnis und Filter einer Formelseite, aus dem Markup selbst gelesen |

Eingebunden wird mit klassischen `<script src="…">`-Tags, absichtlich
ohne `type="module"`: Browser blockieren Modul-Importe über `file://`,
und die Seiten sollen ohne Server laufen.

## Ein Werkzeug ergänzen

1. `tools/<name>/index.html` anlegen, `shared/theme.css` und
   `shared/ui.css` einbinden, dazu die gebrauchten `shared/*.js`.
2. Werkzeug-eigenes JavaScript nach `tools/<name>/<name>.js`. Die
   `<script>`-Tags gehören ans Ende des `<body>`, nicht in den `<head>`:
   der Werkzeugcode greift ohne DOM-Ready-Schutz sofort auf Elemente
   der Seite zu, im `<head>` eingebunden gäbe es die noch nicht.
3. Eine Kachel im Abschnitt Werkzeuge der Startseite ergänzen.

## Eine Karte ergänzen

1. Die Karte in `karten/<thema>.html` anlegen — thematisch gebündelt,
   mehrere Karten teilen sich eine Datei.
2. Eine Kachel im Abschnitt Karten der Startseite ergänzen, dazu im
   Überblick unter `karten/index.html`.
3. Den Bauplan für Gerüst, Formeln, Illustrationen und Abfragemodus
   beschreibt `CLAUDE.md`.

Alle Pfade relativ halten — ein führender `/` bricht sowohl den
Doppelklick als auch die Veröffentlichung.

## Lizenz

MIT, siehe [LICENSE](LICENSE).
