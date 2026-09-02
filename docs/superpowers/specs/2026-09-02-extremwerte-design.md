# Extremwerte — Design

Datum: 2026-09-02
Status: freigegeben

## Zweck

Kapitel 4 des Skripts zu Ende bringen. Der aufgabenreichste Abschnitt —
Extremwerte über die Hesse-Matrix, neun Übungsaufgaben — hat bisher weder
Karte noch Werkzeugunterstützung.

Zwei Dinge entstehen: ein Baustein `shared/extrema.js`, der stationäre
Stellen einer Funktion zweier Veränderlicher findet und einordnet, und eine
Themendatei `karten/extremwerte.html` mit zwei Karten. Der Flächenrechner
ruft den Baustein auf und zeigt das Ergebnis.

**Zweck des Werkzeugteils ist Kontrolle, nicht Anschauung.** Der Nutzer
rechnet die stationären Stellen von Hand und will wissen, ob er alle
gefunden und richtig eingeordnet hat. Daraus folgt die Messlatte: Zahlen
statt Bilder, und lieber eine ehrliche Grenze als eine unbelegte Aussage.

Erfolgskriterium: Die sieben Extremwertfunktionen des Übungsblattes werden
im Werkzeug richtig ausgewertet — einschließlich der beiden Fälle, in denen
die richtige Antwort „das Kriterium versagt hier" lautet.

## Randbedingungen

Es gelten unverändert die Randbedingungen aus
`2026-09-01-mathe-tools-design.md` und die harten Regeln der `CLAUDE.md`:
kein Build, keine ES-Module, keine externen Abhängigkeiten, alle Pfade
relativ, ES5-artiger Stil am Namensraum `MT`, Deutsch, keine Farbliterale in
einer Seite, kein URL-Zustand, keine Testdateien und keine CI.

## Was heute schon da ist

Der Flächenrechner rechnet die Hesse-Bedingung bereits — unter anderem Namen
und nur für einen Fall, der in den Aufgaben nicht vorkommt.

`analyse()` in `tools/flaechenrechner/flaechenrechner.js` löst für
quadratische Funktionen das System `[[2A, B], [B, 2C]] · x = [−D, −E]`. Das
ist genau „Gradient gleich null". Die Fallunterscheidung über
`disc = B² − 4AC` ist bis aufs Vorzeichen die Determinante der Hesse-Matrix:
`disc < 0` bedeutet `det H > 0` und damit ein Extremum, `disc > 0` bedeutet
einen Sattel.

Der Haken liegt in `fitQuadratic()`: die Funktion prüft an 200 Stellen nach
und liefert `null`, sobald die Eingabe nicht **exakt** quadratisch ist. Keine
der sieben Extremwertfunktionen des Übungsblattes ist quadratisch. Für die
Aufgaben, um die es geht, sagt das Werkzeug heute nichts.

Die Lücke ist also nicht die Rechnung, sondern ihre Reichweite.

## Der Baustein `shared/extrema.js`

### Schnittstelle

```js
MT.extrema.finde(f, bereich)
```

`f` ist eine Funktion `(x, y) → Zahl`, wie `MT.expr.compile` sie liefert.
`bereich` ist eine positive Zahl `r`; durchsucht wird das Quadrat
`[−r, r] × [−r, r]`.

Rückgabe:

```js
{
  stellen: [
    { x: 1, y: 1, z: -1,
      fxx: 6, fxy: -3, fyy: 6,
      det: 27,
      art: 'minimum' }
  ],
  bereich: 4,
  amRand: false,
  kurvenfall: false
}
```

`art` ist einer von vier Werten: `'minimum'`, `'maximum'`, `'sattel'`,
`'unentschieden'`.

Der Baustein hängt an `MT` wie die übrigen, beginnt mit `var MT = MT || {};`
und ist von den anderen `shared/*.js` unabhängig.

### Verfahren

**Ableitungen.** Zentrale Differenzen mit einer Schrittweite
`h = 1e-4 · (1 + r)`. Daraus der Gradient `(f_x, f_y)` und die Hesse-Matrix
`[[f_xx, f_xy], [f_xy, f_yy]]`. Der gemischte Term wird einmal berechnet, nicht
zweimal — `f_xy` und `f_yx` sind für die hier auftretenden Funktionen gleich,
und wo sie es nicht sind (Satz von Schwarz, MV 25), ist die Funktion an der
Stelle ohnehin nicht zweimal stetig differenzierbar und das Kriterium nicht
anwendbar.

**Suche.** Von einem Raster aus 13 × 13 inneren Startpunkten über `[−r, r]²`
wird `|g|²` gedämpft nach Levenberg–Marquardt minimiert: der Schritt `δ` löst

```
(H² + λ·I) · δ = −H · g
```

und `λ` wird nach jedem Schritt angepasst — mal zehn, wenn `|g|` gewachsen
ist, geteilt durch zehn, wenn es gefallen ist. Startwert `λ = 1e-3`.
Höchstens 60 Schritte. Konvergiert bei `|g| < 1e-10 · (1 + |f|)`.

**Warum nicht schlicht Newton.** Ein Newton-Verfahren auf „Gradient gleich
null" müsste `H` invertieren. Bei `f(x,y) = x² + y² − 2xy + 1` (MV 24b) ist
`H = [[2, −2], [−2, 2]]` und damit **überall exakt singulär**, obwohl der
Gradient auf der ganzen Geraden `y = x` verschwindet. Newton bräche an jedem
Startpunkt ab, und das Werkzeug meldete „keine Stelle gefunden" — falsch, und
beim Kontrollieren die schädlichste aller Antworten. Der Dämpfungsterm `λ·I`
macht die Matrix regulär und führt den Lauf trotzdem zur Lösung. Denselben
Dienst leistet er bei `x⁴ + y⁴` (MV 28a), wo `H` im Nullpunkt selbst zur
Nullmatrix wird.

Da `H` symmetrisch ist, gilt `HᵀH = H²`; die Formel oben nutzt das aus.

Drei Sicherungen, ohne die das Verfahren an Polstellen davonläuft:

- Ein Schritt, der weiter als `r / 2` springt, wird auf diese Länge gekürzt.
- Ergibt `f` oder eine Ableitung keinen endlichen Wert, wird der Startpunkt
  aufgegeben.
- Ist `λ` über `1e12` gewachsen, ohne dass `|g|` fällt, wird der Startpunkt
  aufgegeben — dort ist keine Lösung.

**Entartete Stellen.** Wo `H` an der Lösung selbst singulär ist, fällt `|g|`
nur linear statt quadratisch; die gemeldete Lage kann in den letzten Stellen
ungenau sein. Bei `x⁴ + y⁴` liegt die gefundene Stelle deshalb nicht exakt
auf (0 | 0), sondern in dessen Nähe. Die Anzeige rundet auf vier
Nachkommastellen; die Rechenprobe akzeptiert das entsprechend.

**Einsammeln.** Verworfen wird ein Treffer, der außerhalb `[−r, r]²` liegt
oder nicht konvergiert ist. Zwei Treffer gelten als dieselbe Stelle, wenn ihr
Abstand kleiner ist als das Größere aus dem festen Wert `1e-6 · (1 + r)` und
der Unschärfe `tau / max(|f_xx|, |f_xy|, |f_yy|)` (mit
`tau = 1e-10 · (1 + |f|)`) beider Treffer — eine feste Zahl allein muss sich
zwischen einer entarteten Stelle, an der weit verstreute Läufe
zusammengehören, und zwei echten, nah beieinanderliegenden Stellen
entscheiden und liegt dann bei einer von beiden falsch, während die Lage
einer stationären Stelle ohnehin nur so genau bestimmt ist, wie die
Krümmung dort es zulässt. Behalten wird bei einer Kollision der Treffer mit
dem kleineren Gradientenbetrag. Die Liste wird nach `x` sortiert, bei
Gleichstand nach `y` — damit dieselbe Eingabe dieselbe Reihenfolge liefert.

**Einordnung.** Mit `det = f_xx · f_yy − f_xy²`:

| Bedingung | `art` |
|---|---|
| `det > 0` und `f_xx > 0` | `minimum` |
| `det > 0` und `f_xx < 0` | `maximum` |
| `det < 0` | `sattel` |
| `\|det\| < 1e-7 · max(1, f_xx², f_yy², f_xy²)` | `unentschieden` |

Die Schwelle wird **zuerst** geprüft: eine Determinante nahe null entscheidet
nichts, auch wenn ihr Vorzeichen zufällig positiv ist.

### Grenzen, die der Baustein selbst meldet

Ein Werkzeug zur Kontrolle muss sagen, wo seine Aussage endet. Drei Angaben
gehören deshalb zur Rückgabe, nicht in die Dokumentation:

- **`bereich`** — was durchsucht wurde. Außerhalb kann es weitere Stellen
  geben; der Baustein behauptet nie Vollständigkeit.
- **`amRand`** — wahr, wenn eine gefundene Stelle näher als `0,1 · r` am Rand
  des Suchbereichs liegt. Dann ist der Bereich vermutlich zu klein gewählt.
- **`kurvenfall`** — wahr, wenn mehr als acht Stellen gefunden wurden. Das
  bedeutet in aller Regel, dass die Bedingung nicht in Punkten, sondern
  entlang einer ganzen Kurve erfüllt ist. `f(x,y) = x² + y² − 2xy + 1`
  (MV 24b) ist dieser Fall: der Gradient verschwindet auf der ganzen Geraden
  `y = x`. Im Kurvenfall werden höchstens acht Stellen zurückgegeben; die
  Anzeige sagt, dass es eine Kurve ist, statt eine willkürliche Auswahl zu
  präsentieren.

Zusätzlich trägt jede einzelne Stelle mit `art: 'unentschieden'` ihre eigene
Grenze.

### Warum kein `shared/numerik.js`

Eine allgemeine Schicht für Ableitungen, Newton und Nullstellensuche hätte
heute genau einen Nutzer. Der Grundsatz des Repos ist, einen Baustein zu
ziehen, wenn ein zweites Werkzeug ihn braucht — nicht vorher. Bei `extrema`
ist dieser zweite Abnehmer bereits benannt: der Ausgleichsrechner für die
kleinsten Quadrate minimiert `S(a, b)`, und MV 32 verlangt wörtlich die
notwendige Bedingung für dieses Minimum. Bei `numerik` ist er es nicht.

## Der Flächenrechner

### Der neue Block

Unter der vorhandenen Analyse, mit der Überschrift **Stationäre Stellen**.

Je Stelle eine Zeile mit: dem Punkt, dem Funktionswert, den drei Einträgen
der Hesse-Matrix, der Determinante und dem Urteil. Bei `unentschieden` steht
statt eines Urteils der Satz, dass die Determinante null ist und die Art der
Stelle von Hand geklärt werden muss.

Immer darunter, unabhängig vom Ergebnis: in welchem Bereich gesucht wurde und
dass außerhalb weitere Stellen liegen können. Bei `amRand` zusätzlich der
Hinweis, den Bereich zu vergrößern. Bei `kurvenfall` der Hinweis, dass die
Bedingung entlang einer Kurve erfüllt ist.

Wurde keine Stelle gefunden, sagt der Block das ausdrücklich — Schweigen wäre
beim Kontrollieren die schlechteste Antwort.

**Der Block erscheint immer**, auch wenn `fitQuadratic` `null` liefert. Das
ist der Kern der Änderung: heute hängt die gesamte Ausgabe daran, dass die
Eingabe quadratisch ist.

### Zweisprachigkeit ist gewollt

Die vorhandene Formbeschreibung bleibt Zeile für Zeile unverändert. Bei einer
quadratischen Funktion sagt das Werkzeug damit dasselbe zweimal: einmal
geometrisch („elliptisches Paraboloid, nach oben geöffnet") und einmal als
Prüfschema („det H > 0 und f_xx > 0, also Minimum"). Das ist keine Redundanz,
die zu beseitigen wäre, sondern der Brückenschlag — man sieht, dass beide
Beschreibungen dasselbe meinen.

### Marken im Höhenlinienbild

Die gefundenen Stellen werden in `draw2Dmap()` markiert, **über die Form und
zusätzlich über die Farbe**:

| Art | Marke | Farbe |
|---|---|---|
| Minimum | gefüllter Kreis | `--mint` |
| Maximum | offener Kreis | `--rose` |
| Sattel | Kreuz | `--gold` |
| unentschieden | offenes Quadrat | `--dim` |

Über die Form, weil die Marken damit im Druck und bei Farbenblindheit tragen.
Der Radius ist fest in Bildschirmpunkten, nicht in Weltkoordinaten — die
Marke bezeichnet eine Stelle und ist kein Objekt der Zeichnung.

Nur im Höhenlinienbild, nicht in der 3D-Ansicht. Dort ist die Ansicht drehbar
und die Marken müssten mitprojiziert werden, ohne dass die Aussage klarer
würde.

### Wann gerechnet wird

Die Suche läuft bei einer Änderung des Terms und bei einer Änderung des
Bereichsreglers — also in `rebuild()`, nicht in `drawAll()`. Am Höhen- und an
den Schnittreglern zu ziehen darf keine neue Suche auslösen.

## Die Karte `karten/extremwerte.html`

Zwei Karten in einer Datei, wie bei den bestehenden Themendateien. Beide
rechnen **dieselbe** Funktion durch, weil das Übungsblatt das auch tut:
MV 24a sucht die Kandidaten, MV 29a ordnet sie ein.

`f(x, y) = x³ + y³ − 3xy`

**Karte 1 — Stationäre Stellen finden.** Gradient null setzen:
`f_x = 3x² − 3y` und `f_y = 3y² − 3x`, also `y = x²` und `x = y²`, daraus
`x⁴ = x`. Zwei Stellen: (0 | 0) und (1 | 1). Das Bild zeigt beide Parabeln im
selben Achsenkreuz; ihre Schnittpunkte sind die Lösungen.

Typischer Fehler: `x⁴ = x` durch `x` geteilt und damit die Lösung `x = 0`
verloren.

**Karte 2 — Hesse-Matrix: Minimum, Maximum oder Sattel.** Dieselbe Funktion
weiter: `H = [[6x, −3], [−3, 6y]]`. Bei (0 | 0) ist `det H = −9 < 0`, also
Sattel. Bei (1 | 1) ist `det H = 27 > 0` und `f_xx = 6 > 0`, also Minimum,
mit `f(1,1) = −1`. Das Bild zeigt die Höhenlinien mit beiden Stellen,
markiert wie im Werkzeug.

Typischer Fehler: eine stationäre Stelle für ein Extremum halten.

Beide Karten folgen dem Bauplan der `CLAUDE.md` ohne Abweichung: Anatomie,
MathML, Inline-SVG mit gerechneten Punkten, Abfragemodus, Druckverhalten,
Querlink, Seitenfuß.

**Der Querlink nennt die Reglerstellungen** und ist vor der Freigabe am
laufenden Werkzeug nachzustellen — die Lehre der vorigen Runde, in der drei
Karten Reglerangaben behaupteten, die nicht stimmten.

## Verifikation

**Kartenprüfung K** auf `karten/extremwerte.html`, wie in der `CLAUDE.md`
beschrieben.

**Prüfroutine P** auf dem Flächenrechner. Erwartete Abweichung: der neue
Block verlängert die Seite. Der Bereichsvergleich oberhalb des Blocks ist für
**alle 21 Zustände** zu führen, nicht als Stichprobe, und eine Abweichung ist
mit ihrer Größenordnung zu belegen — ein maximaler Kanalunterschied von 1 ist
Rasterungsrauschen, alles Größere ist ein Fund.

**Rechenprobe R** — neu, und der Grund dafür gehört in die Spec: Zum ersten
Mal rechnet in diesem Repo etwas, dessen falsches Ergebnis nicht falsch
aussieht. Ein schiefes Bild fällt auf, eine falsch eingeordnete stationäre
Stelle nicht.

Keine Testdatei. Geprüft wird wie alles andere am laufenden Bild: jede der
folgenden Funktionen wird im Werkzeug eingegeben und das Ergebnis gegen die
Handrechnung gehalten. Die Werte unten sind die erwarteten.

| Term (so einzugeben) | Aufgabe | Erwartet |
|---|---|---|
| `x^3 + y^3 - 3*x*y` | MV 24a, 29a | (0\|0) Sattel, `det = −9`; (1\|1) Minimum, `det = 27`, `f_xx = 6`, `f = −1` |
| `x^2 + x*y + y^2 + x + y + 1` | MV 24c, 29c | (−0,3333\|−0,3333) Minimum, `det = 3`, `f = 0,6667` |
| `x^2 + y^2 - 2*x*y + 1` | MV 24b, 29b | `kurvenfall`: der Gradient verschwindet auf der ganzen Geraden `y = x`. Viele Treffer, alle mit `det = 0` → `unentschieden`. Die Anzeige nennt die Kurve, nicht acht willkürliche Punkte |
| `(x^2 + y^2)*exp(-x)` | MV 26a | (0\|0) Minimum, `det = 4`; (2\|0) Sattel, `det = −4e⁻⁴ ≈ −0,0733` |
| `x^4 + y^4` | MV 28a | Eine Stelle bei (0\|0) — wegen der Entartung nur auf wenige Nachkommastellen genau —, `det ≈ 0` → `unentschieden`. In Wahrheit ein Minimum; das Kriterium kann es nicht entscheiden, und genau das muss das Werkzeug sagen |
| `-x*exp(-x^2-y^2)` | MV 31 | (0,7071\|0) Minimum; (−0,7071\|0) Maximum |
| `4*x^3 - 0.5*y^3 + 3*x*y` | MV 30 | (0\|0) Sattel, `det = −9`; (0,5\|−1) Minimum, `det = 27`, `f_xx = 12` |

Die beiden Zeilen mit `unentschieden` sind die wichtigsten der Tabelle. Ein
Werkzeug, das dort ein Urteil fällt, ist schlimmer als eines, das gar nichts
sagt.

Die tatsächlich verwendeten Zahlenwerte für Schrittweite, Toleranzen und
Rasterweite sind an dieser Tabelle zu validieren. Schlägt ein Fall fehl, sind
die Werte anzupassen und die endgültigen im Bericht zu nennen.

## Bewusst nicht Teil dieser Ausbaustufe

- **Funktionen von drei Veränderlichen.** MV 26d hat drei; das bleibt
  Handarbeit. Der Flächenrechner zeichnet Flächen über der Ebene.
- **Extrema unter Nebenbedingungen.** Kommt im Skript nicht vor, siehe die
  vorhandene Karte, die als „über den Stoff hinaus" gekennzeichnet bleibt.
- **Ein allgemeines `shared/numerik.js`.** Siehe oben.
- **Marken in der 3D-Ansicht.**
- **Änderungen an der vorhandenen Formbeschreibung.**
- **Ein Eingabefeld zum Prüfen einer selbst gerechneten Stelle.** Wurde
  erwogen und verworfen: es beantwortet die halbe Aufgabe („bestimmen Sie
  alle Punkte") nicht und verdoppelt die Oberfläche eines Werkzeugs, das
  schon vier Ansichten hat.
