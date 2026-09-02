# Schwingungsrechner — Design

Datum: 2026-09-02
Status: freigegeben

## Zweck

Kapitel 2 des Skripts abschließen: lineare Differentialgleichungen zweiter
Ordnung mit konstanten Koeffizienten. Elf der fünfzehn Übungsaufgaben hängen
daran, und die drei Fälle des charakteristischen Polynoms kommen allein
dreimal als Schwingkreis wieder.

Es entstehen ein Baustein `shared/dgl.js`, ein zweites Werkzeug unter
`tools/schwingung/` und eine Themendatei `karten/differentialgleichungen.html`
mit drei Karten.

**Zweck des Werkzeugteils ist wie beim Flächenrechner die Kontrolle.** Der
Nutzer rechnet von Hand und will wissen, ob er den richtigen Fall erkannt, den
richtigen Ansatz gewählt und die Resonanz nicht übersehen hat.

Erfolgskriterium: Jede Aufgabe des Übungsblattes lässt sich eingeben, und der
Baustein liefert für die von Hand nachgerechneten Fälle exakt die
Handrechnung — einschließlich beider Resonanzfälle.

## Randbedingungen

Es gelten unverändert die Randbedingungen aus
`2026-09-01-mathe-tools-design.md` und die harten Regeln der `CLAUDE.md`:
kein Build, keine ES-Module, keine externen Abhängigkeiten, alle Pfade
relativ, ES5-artiger Stil am Namensraum `MT`, Deutsch, keine Farbliterale in
einer Seite, kein URL-Zustand, keine Testdateien und keine CI.

**Eine zusätzliche Randbedingung dieser Runde: nirgends wird numerisch
differenziert.** Alle Ableitungen liegen in geschlossener Form vor und werden
auch so gerechnet. Die vorige Runde hat gezeigt, was numerische Ableitungen
an Rauschen und an Fallunterscheidungen nach sich ziehen; hier ist das
vermeidbar, also wird es vermieden.

## Der Baustein `shared/dgl.js`

### Schnittstelle

```js
MT.dgl.loese(a, b, glieder, anfang)
```

`a` und `b` sind die Koeffizienten von `y'' + a·y' + b·y = s(x)`.

`glieder` ist ein Array; die rechte Seite ist die Summe seiner Glieder. Ein
leeres Array bedeutet die homogene Gleichung. Jedes Glied ist eines von:

```js
{ art: 'polyexp', koeff: [c0, c1, …, cn], mu: μ }
```
für `(c₀ + c₁x + … + cₙxⁿ)·e^(μx)`. Mit `mu: 0` ist das ein reines Polynom,
mit `koeff: [c]` eine reine Exponentialfunktion.

```js
{ art: 'harmonisch', c: c, d: d, omega: ω }
```
für `c·cos(ωx) + d·sin(ωx)`.

`anfang` ist `{ y0: …, y0strich: … }` oder `null`.

Rückgabe:

```js
{
  polynom:   { a: a, b: b, diskriminante: D },
  fall:      'zwei-reelle' | 'doppelt' | 'komplex',
  wurzeln:   …,
  homogen:   { basis: [f1, f2], ableitung: [f1s, f2s] },
  teile:     [ { glied, k, ansatz, koeff, fn, fnAbleitung } ],
  konstanten: [C1, C2] | null,
  yh: fn, yp: fn, y: fn
}
```

`teile` enthält je Glied der rechten Seite die Resonanz-Vielfachheit `k`, die
Ansatzform und die berechneten Koeffizienten. Das Werkzeug zeigt genau diese
Zwischenschritte an — sie sind der Gegenstand der Aufgabe, nicht nur ein
Rechenweg.

### Der homogene Teil

Mit `p(λ) = λ² + aλ + b` und `D = a² − 4b`:

| Fall | Bedingung | Wurzeln | Basis |
|---|---|---|---|
| zwei-reelle | `D > 0` | `λ₁,₂ = (−a ± √D)/2` | `e^(λ₁x)`, `e^(λ₂x)` |
| doppelt | `D = 0` | `λ = −a/2` | `e^(λx)`, `x·e^(λx)` |
| komplex | `D < 0` | `−δ ± iω` mit `δ = a/2`, `ω = √(−D)/2` | `e^(−δx)cos(ωx)`, `e^(−δx)sin(ωx)` |

`D = 0` wird gegen eine Schwelle geprüft, nicht auf Gleichheit: `|D|` unter
`1e-9 · max(1, a², |b|)` gilt als null. Ohne das fiele der aperiodische
Grenzfall bei getippten Zahlen fast nie.

### Der partikuläre Teil, Glied für Glied

**Superposition.** Jedes Glied wird für sich gelöst, die Ergebnisse werden
addiert. Das ist kein Kunstgriff, sondern der Satz, den die Karte lehrt.

**`polyexp`.** Die Substitution `y = u(x)·e^(μx)` führt auf

```
u'' + p'(μ)·u' + p(μ)·u = P(x)
```

mit `p'(λ) = 2λ + a` und `P` dem Polynomfaktor des Glieds. Die
Resonanz-Vielfachheit `k` ist die Vielfachheit von `μ` als Wurzel: `k = 0`
falls `p(μ) ≠ 0`, `k = 1` falls `p(μ) = 0` und `p'(μ) ≠ 0`, `k = 2` falls
beide null sind. Der Ansatz ist ein Polynom `v` vom Grad `n + k`, dessen
unterste `k` Koeffizienten null gesetzt sind. Einsetzen und Koeffizienten
vergleichen ergibt ein lineares Gleichungssystem in den `n + 1` Unbekannten;
es ist gestaffelt und wird mit einem kleinen Gauß-Verfahren gelöst.

**`harmonisch`.** Resonanz genau dann, wenn `a = 0` **und** `b = ω²` — nur
dann sind `±iω` Wurzeln. Beide Bedingungen gegen dieselbe Schwelle wie oben.

Ohne Resonanz ist `y_p = A·cos(ωx) + B·sin(ωx)` mit

```
(b − ω²)·A + a·ω·B = c
(b − ω²)·B − a·ω·A = d
```

Mit Resonanz ist `y_p = x·(A·cos(ωx) + B·sin(ωx))` mit `A = −d/(2ω)` und
`B = c/(2ω)`.

### Anfangswerte

`y = y_h + y_p`. Aus `y(0) = y₀` und `y'(0) = y₀'` folgt ein 2×2-System für
`C₁` und `C₂`, dessen rechte Seite `y₀ − y_p(0)` und `y₀' − y_p'(0)` ist. Die
Werte der Basisfunktionen und ihrer Ableitungen bei null sind je Fall
bekannt und werden nicht gerechnet:

| Fall | `f₁(0), f₂(0)` | `f₁'(0), f₂'(0)` |
|---|---|---|
| zwei-reelle | `1, 1` | `λ₁, λ₂` |
| doppelt | `1, 0` | `λ, 1` |
| komplex | `1, 0` | `−δ, ω` |

Ohne Anfangswerte bleibt `konstanten` null, `yh` ist dann nicht bestimmt und
das Werkzeug zeigt `y_h` mit den Symbolen `C₁` und `C₂` statt mit Zahlen.

### Grenzen, die der Baustein meldet

Ein Glied, dessen Bauart der Baustein nicht kennt, wird **nicht geraten**.
`loese` wirft dann, mit einer deutschen Meldung, die das Glied benennt. Das
Werkzeug fängt sie und schreibt sie hin.

Ebenso bei `ω ≤ 0` in einem harmonischen Glied und bei einem leeren
Koeffizientenarray.

### Ein kleines Gauß-Verfahren, zum zweiten Mal

`tools/flaechenrechner/flaechenrechner.js` enthält bereits ein `solve` für
kleine lineare Systeme. Es wird **nicht** geteilt: es aus der Werkzeugdatei
zu ziehen hieße, die Seite anzufassen, die unter Bildvergleich steht, und
`dgl.js` braucht ohnehin eine Fassung, die auf gestaffelten Systemen sauber
arbeitet. Rund fünfzehn Zeilen Dopplung, bewusst in Kauf genommen; sobald ein
drittes Werkzeug ein lineares System löst, gehört ein gemeinsamer Baustein
gezogen.

## Das Werkzeug `tools/schwingung/`

### Eingabe

Zahlenfelder, kein Term: `a` und `b`; darunter die Glieder der rechten Seite,
je Glied eine Bauart mit ihren Zahlen; darunter `y(0)` und `y'(0)`.

Dazu Beispiel-Chips wie beim Flächenrechner, mit Aufgaben des Übungsblattes
vorbelegt — mindestens der Schwingkreis, ein Resonanzfall und ein Polynomfall.

**Ein Regler: die Dämpfung `a`.** Ihre Variation ist die Lehre — man zieht,
und die Diskriminante geht durch null, die Schwingung wird zum Kriechfall.
Der aperiodische Grenzfall `a = 2√b` wird auf dem Regler markiert. Der Regler
überschreibt das Zahlenfeld und umgekehrt.

### Ausgabe

Ein Textblock, der die Aufgabe der Reihe nach abarbeitet: charakteristisches
Polynom, Diskriminante, Fall, Wurzeln, `y_h`. Dann je Glied der rechten
Seite: Bauart, Resonanz-Vielfachheit **mit Begründung** (welche Wurzel, welche
Vielfachheit), Ansatz, Koeffizienten. Dann `y_p` als Summe, die Konstanten aus
den Anfangswerten und `y`.

Die Begründung der Resonanz ist der wichtigste Satz der ganzen Ausgabe: der
typische Fehler ist, den Ansatz zu wählen, ohne die Wurzeln angesehen zu
haben.

### Das Bild

Eine Zeichenfläche, Zeitachse ab null. Drei Kurven: `y` kräftig in `--gold`,
`y_h` und `y_p` dünner in `--mint` und `--rose`, dazu eine knappe Legende.
Bei abklingendem `y_h` sieht man die Kurve in den stationären Anteil
einlaufen — die Aussage der Aufgaben D 5, 6 und 7.

Ohne Anfangswerte ist `y_h` nicht bestimmt; dann werden nur `y_p` gezeichnet
und die Zeichnung sagt, dass die homogene Kurve von den Konstanten abhängt.

Das Zeichnen schreibt dieses Werkzeug selbst. `drawSection` des
Flächenrechners ist ähnlich, aber nicht gleich — dort ein symmetrischer
Bereich mit Höhenmarke, hier eine Zeitachse ab null mit drei Kurven und
Legende. Eine gemeinsame Achsen-Grundform aus zwei Beispielen zu entwerfen,
von denen eines gerade erst entsteht, hieße die Abstraktion zu raten.

## Die Karten `karten/differentialgleichungen.html`

Drei Karten in einer Datei.

**`charakteristisches-polynom`.** Die drei Fälle, mit dem Schwingkreis als
Beispiel. Bild: dieselbe Gleichung in allen drei Fällen, drei Kurven
nebeneinander — Schwingfall, aperiodischer Grenzfall, Kriechfall. Typischer
Fehler: bei doppelter Nullstelle den Faktor `x` vergessen.

**`ansatz`.** Die Bauarten der rechten Seite und ihre Ansätze als Tabelle,
durchgerechnet an `y'' + 4y' + 5y = 5x² − 32x + 5` (D 15b), wo
`y_p = x² − 8x + 7` herauskommt. Merksatz: die Superposition — eine Summe auf
der rechten Seite wird Glied für Glied gelöst. Typischer Fehler: den Ansatz
wählen, ohne vorher die Wurzeln anzusehen.

**`resonanz`.** Warum der Ansatz mit `x^k` zu multiplizieren ist, wenn er die
homogene Gleichung schon löst. Beispiel `y'' + 2y' + y = 6x·e^(−x)` (D 15a):
`μ = −1` ist doppelte Wurzel, also `k = 2`, und `y_p = x³e^(−x)`. Bild: die
aufschaukelnde Lösung des ungedämpften Falls. Typischer Fehler: Resonanz
übersehen — dann ist das Gleichungssystem für die Koeffizienten unlösbar,
und man sucht den Fehler an der falschen Stelle.

Querlink ins Werkzeug mit den Zahlen, **am laufenden Werkzeug nachgestellt**,
bevor sie hingeschrieben werden.

## Verifikation

**Kartenprüfung K** auf der neuen Kartenseite, nach `CLAUDE.md`.

**Kartenprüfung K auch auf der Werkzeugseite**, soweit anwendbar: Konsole,
Wege, Druckbild.

**Kein Bildvergleich.** Der Flächenrechner wird nicht angefasst. Prüfroutine P
entfällt in dieser Runde vollständig.

**Rechenprobe D** am Baustein, ohne Oberfläche, bevor das Werkzeug ihn
benutzt. Alle Sollwerte von Hand gerechnet:

| Nr | Gleichung | Aufgabe | Erwartet |
|---|---|---|---|
| D1 | `y'' − y = 0` | D 14a | `D = 4`, zwei-reelle, `λ = ±1` |
| D2 | `y'' + 4y' + 13y = 0` | D 14g | `D = −36`, komplex, `δ = 2`, `ω = 3` |
| D3 | `y'' + 2y' + y = 0` | D 14c | `D = 0`, doppelt, `λ = −1` |
| D4 | `y'' + 4y' + 5y = 5x² − 32x + 5` | D 15b | `k = 0`, `y_p = x² − 8x + 7` |
| D5 | `y'' + 2y' + 5y = sin 2x` | D 15c | keine Resonanz, `A = −4/17`, `B = 1/17` |
| D6 | `y'' + 2y' + y = 6x·e^(−x)` | D 15a | **`k = 2`**, `y_p = x³·e^(−x)` |
| D7 | `y'' + y' − 2y = −x·e^x` | D 2g | **`k = 1`**, `y_p = (x/9 − x²/6)·e^x` |
| D8 | `y'' + ω₀²y = c·sin(ω₀x)` | D 9 | **harmonische Resonanz**, `y_p = −(c/(2ω₀))·x·cos(ω₀x)` |
| D9 | `y'' + 10y' + 25y = cos 5x + 2` | D 10 | **Summe**, `y_p = (1/50)·sin 5x + 2/25` |
| D10 | `y'' + 7y' + 10y = 6e^(−4x)` | D 12 | `k = 0`, `y_p = −3e^(−4x)` |
| D11 | `y'' + 10y' + 10000y = 0` | D 5 | komplex, `δ = 5`, `ω = √9975 ≈ 99,875` |

**D6, D7 und D8 sind die wichtigsten Zeilen.** Sie sind die drei
Resonanzfälle — doppelt, einfach, harmonisch — und dort liegt der Fehler, den
das Werkzeug finden soll. Eine Fassung, die sie nicht trifft, ist unbrauchbar,
auch wenn alle übrigen Zeilen stimmen.

**Zusätzlich eine Gegenprobe je Zeile: einsetzen.** Für jede berechnete
Lösung wird `y'' + a·y' + b·y − s(x)` an mehreren Stellen ausgewertet; das
Ergebnis muss null sein. Die Ableitungen dafür liegen geschlossen vor. Das
prüft nicht nur die Koeffizienten, sondern auch, dass die Ansatzform stimmt —
und es ist eine Probe, die keine Handrechnung braucht und deshalb auch für
Fälle taugt, die nicht in der Tabelle stehen.

## Bewusst nicht Teil dieser Ausbaustufe

- **Differentialgleichungen erster Ordnung** und Richtungsfelder. Eigenes
  Werkzeug, eigene Runde — anderes Bild, andere Rechnung.
- **Rechte Seiten mit Produkt aus Polynom und Winkelfunktion**
  (`x·cos(ωx)`). Kommt auf dem Übungsblatt nicht vor. Der allgemeine Fall
  `e^(μx)(P(x)cos ωx + Q(x)sin ωx)` wäre die saubere Verallgemeinerung; sie
  wird gebaut, wenn eine Aufgabe sie verlangt.
- **Systeme von Differentialgleichungen.**
- **Numerische Integration.** Alles hier ist geschlossen lösbar.
- **Ein gemeinsamer Achsen-Baustein** mit dem Flächenrechner.
- **Ein gemeinsamer Löser für lineare Systeme** mit dem Flächenrechner.
