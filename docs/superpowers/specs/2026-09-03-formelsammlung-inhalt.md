# Formelsammlung Mathematik 2 — was hineingehört

> **Stand 2026-09-03.** Dies ist die Inhaltsaufnahme, nicht der Bauplan. Sie hält
> fest, **welche** Formeln die Sammlung tragen muss und **warum** — abgeleitet aus
> dem Vorlesungsskript und allen vier Übungsblättern. Wie die Seite aussieht,
> entscheidet ein eigenes Design-Dokument.

## Abgrenzung: Karte gegen Formelsammlung

Eine **Karte** erklärt einen Begriff: Voraussetzung, Formel, durchgerechnetes
Beispiel, Bild, typischer Fehler. Sie ist zum Lernen da und darf ausführlich sein.

Die **Formelsammlung** erklärt nichts. Sie hält jede Formel, die man beim Rechnen
braucht, in der Schreibweise des Skripts bereit, und zwar vollständig. Ihr Maßstab
ist nicht Verständnis, sondern Nachschlagbarkeit: Man weiß, was man sucht, und will
es in Sekunden finden. Deshalb steht neben jedem Eintrag, wo er im Skript steht —
wer mehr braucht als die Formel, geht dorthin oder auf die Karte.

Beide Gattungen decken denselben Stoff, aus zwei Richtungen. Eine Formel, die schon
auf einer Karte steht, kommt trotzdem in die Sammlung; ein Nachschlagewerk mit
Lücken ist keins.

## Quellen

Alle fünf PDFs liegen in `Mathematik 2/Tools/import files`, außerhalb des Repos.

| Datei | Inhalt | Umfang |
|---|---|---|
| `math_ss26.pdf` | Vorlesungsskript, Prof. Knospe, SS 2026 | 138 Seiten, 4 Kapitel |
| `math_uebss26.pdf` | Übungen Integralrechnung | 22 Aufgaben |
| `MA2_ueb_DGL-3.pdf` | Übungen Differentialgleichungen | 15 Aufgaben |
| `math_ueb-la26.pdf` | Übungen lineare Algebra | 60 Aufgaben |
| `Uebungsaufgaben_AnalysisMA2-1.pdf` | Übungen mehrvariablige Funktionen | 46 Aufgaben |

Zusammen **143 Aufgaben**. Der Text ist aus allen fünf PDFs sauber extrahierbar
(LaTeX, keine Scans); die Formeln kommen dabei verstümmelt heraus. Für diese
Aufnahme genügte das. **Beim Abschreiben der Formeln sind die betreffenden
Skriptseiten noch einmal als Bild zu lesen** — eine aus verstümmeltem Text
abgetippte Formel ist geraten, nicht abgeschrieben.

## Sechs Befunde, die die Auswahl bestimmen

1. **Lineare Algebra ist das Kapitel.** 60 von 143 Aufgaben, 52 von 130
   Skriptseiten. Und die Aufgaben rechnen laufend über endliche Körper — GF(2),
   GF(3), GF(5), GF(7), GF(11) — nicht nur über ℝ und ℂ. Eine Formelsammlung, die
   Restklassenrechnung und die Inversentabellen unterschlägt, verfehlt einen
   großen Teil des Blattes.

2. **Die kleinsten Quadrate stehen in den Aufgaben, aber nicht im Skript.**
   Aufgaben 32 bis 37 des Analysis-Blattes (sechs Stück, Ausgleichsgerade,
   Ausgleichsparabel, `f(x) = a·x`, `f(t) = A·cos(ωt)`) verlangen die
   Normalgleichungen. Im Skript kommt „Ausgleichsrechnung" **einmal** vor, auf
   Seite 101, und dort als Beispiel zur Pseudoinversen. Die Sammlung muss die
   Normalgleichungen aus `∂S/∂a = ∂S/∂b = 0` selbst führen und als „über das
   Skript hinaus, aber Aufgabenstoff" kennzeichnen.

3. **Die mehrdimensionale Integration hat keine einzige Aufgabe.** Skript
   Seiten 130–134 (Doppelintegral, Satz von Fubini); in allen vier Blättern kein
   Treffer für „dy dx", „Doppelintegral" oder „Fubini". Kommt der Vollständigkeit
   halber hinein, mit niedrigster Priorität, und bekommt keine Karte.

4. **Lagrange kommt weiterhin nirgends vor.** „Lagrange" und „Nebenbedingung"
   haben null Treffer auf 138 Skriptseiten und in allen vier Blättern. Die
   bestehende Karte `extrema-mit-nebenbedingung.html` bleibt stehen und bleibt
   als „über den Stoff hinaus" gekennzeichnet; in die Formelsammlung gehört das
   Verfahren **nicht** — sie bildet den Prüfungsstoff ab.

5. **Drehungen und Spiegelungen sind der Arbeitspferd-Stoff der linearen
   Algebra.** Die Aufgaben 17, 18, 32 bis 35, 49, 50, 53 und 58 bis 60 verlangen
   Abbildungsmatrizen: Drehung in der Ebene, Spiegelung an einer um α geneigten
   Achse, Drehung um jede der drei Achsen im Raum, Drehspiegelung, Drehung um
   einen **Punkt** (homogene Koordinaten), Skalierung mit Fixpunkt. Diese Matrizen
   gehören vollständig und geschlossen an eine Stelle — sie sind der meistgesuchte
   Block der ganzen Sammlung.

6. **Die Physik-Schreibweise der DGL-Aufgaben weicht vom Skript ab.** Das Skript
   schreibt `y'' + αy' + βy = γ(x)` mit `D = (α/2)² − β`. Die Aufgaben 4 bis 7 und
   9 des DGL-Blattes rechnen mit `ÿ + (1/τ)·ẏ + ω₀²·y = …`, mit Punkt-Notation für
   die Zeitableitung und der Abkürzung `ω = √(ω₀² − 1/(4τ²))`. Beide
   Schreibweisen müssen nebeneinander stehen, sonst erkennt man die eigene
   Aufgabe nicht wieder. **Achtung:** Die bestehende Karte
   `karten/differentialgleichungen.html` schreibt die Diskriminante als
   `D = a² − 4b`; das ist dieselbe Aussage in anderer Normierung, aber nicht die
   Schreibweise des Skripts. Die Sammlung folgt dem Skript, und die Abweichung
   der Karte ist beim nächsten Anfassen anzugleichen.

## Priorität

- **A** — kommt in den Aufgaben ständig vor; ohne diesen Eintrag ist die Sammlung
  im Übungsbetrieb unbrauchbar.
- **B** — kommt in den Aufgaben vor.
- **C** — steht im Skript, wird von keiner Aufgabe verlangt; der Vollständigkeit
  halber.

---

## Kapitel 1 — Integralrechnung (Skript 5–40, 22 Aufgaben)

| # | Eintrag | Skript | Aufgaben | Prio |
|---|---|---|---|---|
| 1.1 | Ober- und Untersumme `U(Z)`, `O(Z)`, Abschätzung `U ≤ ∫ ≤ O` | 8, 13 | 1, 3 | B |
| 1.2 | Summierte Sehnentrapezformel `(b−a)/n · (½f(a) + f(x₁) + … + ½f(b))` | 15 | 3 | B |
| 1.3 | Additivität, vertauschte Grenzen, `∫ₐᵃ = 0` | 15–16 | 18b, 21 | A |
| 1.4 | Linearität: Summenregel, Faktorregel | 16 | 9 | A |
| 1.5 | Monotonie des Integrals | 17 | 4 | B |
| 1.6 | Mittelwertsatz `∫ₐᵇ f = f(ξ)(b−a)` | 17 | — | C |
| 1.7 | Fläche: `∫\|f\|` bzw. `∫\|f−g\|`, dazu das Rezept (Nullstellen suchen, abschnittsweise integrieren, Betrag zuletzt) | 19 | 1, 10, 11, 18b | A |
| 1.8 | Hauptsatz `∫ₐᵇ f = F(b) − F(a)`, Schreibweise `[F(x)]ₐᵇ` | 23–24 | alle | A |
| 1.9 | **Grundintegrale-Tabelle**: `xˢ`, `1/x`, `eᵅˣ`, `sin`, `cos`, `1/(1+x²)`, `1/√x`, `ln x`, `1/sin²x` | 24, verstreut | 5, 9, 17, 19 | A |
| 1.10 | Unbestimmtes Integral, `+C` | 25 | 5, 17, 19 | A |
| 1.11 | Uneigentliche Integrale, unendliche Grenze — Definition über den Grenzwert, konvergent/divergent | 26 | 12, 13, 21 | A |
| 1.12 | Uneigentliche Integrale, Polstelle im Intervall — die drei Fälle `x₀ = a`, `x₀ = b`, `x₀ ∈ ]a,b[` | 27 | 12, 21 | A |
| 1.13 | **Nicht über Polstellen hinweg integrieren** (mit dem Gegenbeispiel `∫₋₁¹ 1/x² dx`) | 27, 39 | 12h, 21 | A |
| 1.14 | Partielle Integration, bestimmt und unbestimmt | 28 | 14, 15, 18d, 18f, 19b | A |
| 1.15 | Der Trick: zweimal partiell integrieren und nach dem Integral auflösen (`∫sin²`, `∫e⁻ˣcos x`) | 29–30 | 15, 19a | A |
| 1.16 | `∫sin²x dx` und `∫cos²x dx` als fertige Ergebnisse | 30 | 15, 19 | B |
| 1.17 | Substitutionsregel; Grenzen mitsubstituieren; bei unbestimmten Integralen zurücksubstituieren | 30–32 | 16, 18, 19c, 19d, 22c | A |
| 1.18 | **Die vier Standardformen**: `∫f(ax+b)`, `∫f·f′`, `∫f′/f`, `∫f(g)·g′` | 35 | 16, 18, 19 | A |
| 1.19 | Partialbruchzerlegung: die fünf Typen a–e, Ansatz, Anzahl der Summanden = Grad des Nenners | 37 | 20, 21, 22 | A |
| 1.20 | Die vier Grundintegrale der Partialbruchtypen: `1/(x−a)`, `1/(x−a)ⁿ`, `1/((x−a)²+b)`, `(x−a)/((x−a)²+b)` | 35–36 | 20, 22 | A |
| 1.21 | Koeffizientenbestimmung: Einsetzen geeigneter x-Werte **oder** Koeffizientenvergleich | 38 | 20, 22 | A |

## Kapitel 2 — Differentialgleichungen (Skript 41–54, 15 Aufgaben)

| # | Eintrag | Skript | Aufgaben | Prio |
|---|---|---|---|---|
| 2.1 | Explizite DGL erster Ordnung `y′ = f(x,y)`, Anfangswertproblem | 41 | 1, 13 | A |
| 2.2 | Trennbare Variablen: `∫dy/g(y) = ∫f(x)dx`, danach nach y auflösen, Konstante aus dem Anfangswert | 42 | 1a, 1b, 13 | A |
| 2.3 | Lineare DGL erster Ordnung, homogen: `y = C·e^{αx}`; AWP: `y = y₀·e^{α(x−x₀)}` | 45 | 1c–1g | A |
| 2.4 | **Ansatztabelle erster Ordnung** (Polynom / Polynom·e^{ux} mit Fallunterscheidung `u ≠ α`, `u = α` / cos / sin) | 45 | 1d–1g | A |
| 2.5 | Lineare DGL zweiter Ordnung `y″ + αy′ + βy = γ(x)`, AWP mit `y(x₀)=y₀`, `y′(x₀)=v₀` | 47 | 2, 14, 15 | A |
| 2.6 | Charakteristische Gleichung `λ² + αλ + β = 0`, Diskriminante `D = (α/2)² − β` | 47 | 2, 14 | A |
| 2.7 | **Die drei Fälle** `D>0`, `D<0`, `D=0` mit ihren Lösungen — dazu `e^{λx} = e^{ax}cos(bx) + i·e^{ax}sin(bx)` als Begründung der reellen Form | 48 | 2, 3, 14 | A |
| 2.8 | Harmonischer Oszillator `y″ + ω²y = 0` → `y = y₀cos(ωx) + (v₀/ω)sin(ωx)` | 49 | 2d, 9, 14e | B |
| 2.9 | **Ansatztabelle zweiter Ordnung** samt Resonanz: Polynom (`β≠0` / `β=0,α≠0` / `α=β=0`), Polynom·e^{ux} (`u≠λ₁,λ₂` / `u=λ₁≠λ₂` / `u=λ₁=λ₂`), `a·cos+b·sin` (`iω≠λ` / `iω=λ`) | 50 | 2e–2i, 15 | A |
| 2.10 | Das Vier-Schritt-Verfahren (homogen lösen, spezielle Lösung, Summe, Anfangswerte einsetzen) | 53 | alle | A |
| 2.11 | Superposition: Summe mehrerer Störglieder → jeder Summand einzeln, Ergebnisse addieren | 50 (implizit) | 10, 11 | A |
| 2.12 | **Physik-Schreibweise**: `ÿ + (1/τ)ẏ + ω₀²y = 0`, Abkürzung `ω = √(ω₀² − 1/(4τ²))`, Punkt-Notation für Zeitableitungen | — (nur Aufgaben) | 4–7, 9, 12 | A |
| 2.13 | Schwingkreis: `U′ = LI″ + RI′ + I/C` bzw. `I″ + (R/L)I′ + I/(LC) = 0` | 46 | 3, 5, 6 | B |

## Kapitel 3 — Lineare Algebra (Skript 55–106, 60 Aufgaben)

### 3a Rechnen in endlichen Körpern

| # | Eintrag | Skript | Aufgaben | Prio |
|---|---|---|---|---|
| 3.1 | Gruppenaxiome, abelsch | 55 | 1–4 | B |
| 3.2 | Körperaxiome; Ring gegen Körper | 57–58 | 5, 6 | B |
| 3.3 | Restklassen `x ≡ y mod n`, Standardrepräsentant aus `{0,…,n−1}`; Rechnen mit beliebigen Repräsentanten | 56 | 2, 5, 6, 7 | A |
| 3.4 | `Zp` ist genau für Primzahlen ein Körper, Bezeichnung `GF(p)` | 59 | 5, 6 | A |
| 3.5 | `GF(2)`: `+` ist XOR, `·` ist AND, mit Verknüpfungstafeln | 59–60 | 8, 13, 20, 44 | A |
| 3.6 | **Inversentabellen** für `GF(5)`, `GF(7)`, `GF(11)`; invertierbar ⟺ teilerfremd | 59–60 | 6, 11, 25e, 44 | A |
| 3.7 | Warnung: Brüche sind keine Repräsentanten von Restklassen | 60 | 25e | B |

### 3b Vektorräume, Abbildungen, Rang

| # | Eintrag | Skript | Aufgaben | Prio |
|---|---|---|---|---|
| 3.8 | Vektorraumaxiome | 61 | 9 | C |
| 3.9 | **UVR-Kriterium**: abgeschlossen gegen `+` und gegen skalare Vielfache; Nullvektor liegt zwingend drin | 62 | 8, 9, 10, 11 | A |
| 3.10 | Lineare Hülle `<v₁,…,vₙ>`, Erzeugendensystem | 63 | 10, 11, 12, 19c, 20 | A |
| 3.11 | Lineare Abbildung: `f(v₁+v₂) = f(v₁)+f(v₂)`, `f(λv) = λf(v)` | 64 | 13, 16 | A |
| 3.12 | **Abbildungsmatrix**: die Bilder der Einheitsvektoren in die Spalten | 65 | 13, 16–19, 21 | A |
| 3.13 | `A·x` als Linearkombination der Spaltenvektoren | 63 | 14 | B |
| 3.14 | `ker(f)` = Lösungsmenge von `Ax = O`; `im(f)` = lineare Hülle der Spalten | 67 | 16, 19, 20, 23 | A |
| 3.15 | `ker = {0}` ⟺ injektiv; `im = W` ⟺ surjektiv; beides ⟺ bijektiv | 65 | 16, 19d, 20 | A |
| 3.16 | Komposition = Matrixprodukt | 70 | 21, 35d | A |
| 3.17 | Lineare Unabhängigkeit über `Ax = 0`; `n > m` ⟹ stets abhängig | 70–71 | 22, 23, 27 | A |
| 3.18 | Basis, Dimension, `dim(Kⁿ) = n` | 71–72 | 22, 23, 51a | A |
| 3.19 | Rang: Zeilenrang = Spaltenrang = `dim(im f)`; über Zeilenstufenform ablesen; Umformungen ändern ihn nicht | 72–73 | 23, 24 | A |
| 3.20 | Regulär ⟺ `rg(A) = n`, sonst singulär | 73 | 24 | A |
| 3.21 | **Die Äquivalenzkette**: bijektiv ⟺ invertierbar ⟺ regulär ⟺ Spalten unabhängig ⟺ Zeilen unabhängig ⟺ `ker = {O}` ⟺ `im = Kⁿ` | 74 | 24, 25, 46 | A |

### 3c Skalarprodukt und Orthogonalität

| # | Eintrag | Skript | Aufgaben | Prio |
|---|---|---|---|---|
| 3.22 | Skalarprodukt im `ℝⁿ`; Norm `‖v‖ = √(v·v)`; orthogonal ⟺ `v·w = 0` | 75 | 27, 36, 38 | A |
| 3.23 | **Komplexes Skalarprodukt** mit Konjugation in der zweiten Komponente | 75 | 28, 39 | A |
| 3.24 | Orthonormalbasis; Normieren durch Teilen durch die Norm | 76–77 | 27c, 28, 37, 53 | A |
| 3.25 | Orthogonale Projektion auf einen Vektor bzw. auf eine Ebene (Summe der Projektionen) | — (MA1) | 38 | B |
| 3.26 | Vektorprodukt als Weg zum dritten, senkrechten Vektor | — (MA1) | 27b, 53b | B |

### 3d Determinante und Inverse

| # | Eintrag | Skript | Aufgaben | Prio |
|---|---|---|---|---|
| 3.27 | `det` einer 2×2-Matrix | 78 | 29, 30, 31 | A |
| 3.28 | `det` einer 3×3-Matrix (Entwicklung; Sarrus **nur** für 3×3) | 78 | 29, 30 | A |
| 3.29 | Laplace-Entwicklung nach beliebiger Zeile/Spalte, Schachbrett-Vorzeichen | 79 | 30 | A |
| 3.30 | Regulär ⟺ `det ≠ 0` | 79 | 29, 30 | A |
| 3.31 | **Rechenregeln**: Zeilenaddition ändert nichts, Vertauschung dreht das Vorzeichen, Faktor c, `det(cA) = cⁿdet(A)`, `det(AB)`, `det(A⁻¹)`, `det(Aᵀ)`, Dreiecksmatrix = Produkt der Diagonale | 80 | 30 | A |
| 3.32 | Geometrisch: `\|det\|` ist Fläche des Parallelogramms bzw. Volumen des Spats | 81 | 31 | B |
| 3.33 | **Inverse der 2×2-Matrix** über die Determinante | 81 | 25, 29, 33 | A |
| 3.34 | Inverse über Gauß (`[A\|E] → [E\|A⁻¹]`) — im Skript nicht ausgeschrieben, in den Aufgaben verlangt | — | 25f–25h, 26 | A |

### 3e Orthogonale und unitäre Matrizen, Drehungen, Spiegelungen

| # | Eintrag | Skript | Aufgaben | Prio |
|---|---|---|---|---|
| 3.35 | Orthogonal `A⁻¹ = Aᵀ`; unitär `A⁻¹ = Āᵀ`; Prüfung über `AAᵀ = E` ohne Invertieren | 82 | 34–36, 39, 40 | A |
| 3.36 | Orthogonal ⟺ Spalten (und Zeilen) bilden eine ONB | 82 | 36, 37, 40 | A |
| 3.37 | Orthogonale Abbildungen erhalten Skalarprodukt, Norm und rechte Winkel | 83 | 40h | B |
| 3.38 | **Drehmatrix in der Ebene** `Dα` | 67, 83 | 17, 32, 34, 47, 50 | A |
| 3.39 | **Spiegelungen in der Ebene**: an der x-Achse, an der y-Achse, an einer um α geneigten Achse `Sα` | 83 | 17, 32, 34, 49 | A |
| 3.40 | **Drehungen im Raum** um die z-, y- und x-Achse, dazu die Drehspiegelung | 84 | 18, 35, 53, 60 | A |
| 3.41 | `det` einer reellen orthogonalen Matrix ist `±1` | — (Folgerung) | 40j, 40k | B |
| 3.42 | Beispiel unitär: `(e^{iα})` als 1×1-Drehung; DFT-Matrix in Dimension 4 | 84–85 | 39 | C |

### 3f Eigenwerte

| # | Eintrag | Skript | Aufgaben | Prio |
|---|---|---|---|---|
| 3.43 | `Av = λv`, `v ≠ O`; Eigenraum | 86 | 41–48, 52 | A |
| 3.44 | **Charakteristisches Polynom** `p(λ) = det(A − λE)`, Grad n, `p(0) = det(A)` | 87 | 41, 45, 47, 48, 52 | A |
| 3.45 | Das Verfahren: erst `p(λ) = 0` lösen, dann je Eigenwert `(A − λE)x = O` — die Lösungsmenge muss mindestens eindimensional sein | 87–88 | 41, 43, 48, 52 | A |
| 3.46 | **Warnung**: Gauß-Umformungen ändern Eigenwerte und Eigenvektoren | 89 | 48c | A |
| 3.47 | Dreiecksmatrix: Eigenwerte sind die Diagonaleinträge | 89 | 41d, 30 | A |
| 3.48 | Algebraische ≥ geometrische Vielfachheit | 89 | 41d | B |
| 3.49 | Symmetrische reelle Matrix: n reelle Eigenwerte, ONB aus Eigenvektoren | 90 | 43, 48, 52, 55 | A |
| 3.50 | Hermitesch `A = Āᵀ`: reelle Eigenwerte, ONB aus Eigenvektoren | 91 | 41b | B |
| 3.51 | `λ = 0` ⟺ singulär; Eigenraum zu 0 ist der Kern | 86 | 46a, 46b | A |
| 3.52 | Kleine Sätze der Aufgabe 46: Eigenwerte von `cA`, von `A⁻¹`, Betrag 1 bei orthogonalen/unitären Matrizen, reelle 3×3 hat stets einen reellen Eigenwert | — (Aufgaben) | 46 | B |

### 3g Basiswechsel, Diagonalisierung, Zerlegungen

| # | Eintrag | Skript | Aufgaben | Prio |
|---|---|---|---|---|
| 3.53 | Koordinaten bezüglich einer Basis | 92 | 49–51 | A |
| 3.54 | **Transformationsmatrix** `T` (Basisvektoren von `B₂` in die Spalten); `T·v` und `T⁻¹·w` — welche Richtung welche ist | 93 | 49–51 | A |
| 3.55 | Abbildungsmatrix nach Basiswechsel `T⁻¹AT`; Ähnlichkeit | 94 | 52, 53d, 54, 55 | A |
| 3.56 | Ähnliche Matrizen: gleiche Determinante, Eigenwerte, charakteristisches Polynom | 94 | 54 | B |
| 3.57 | Diagonalisierung: `T` aus Eigenvektoren ⟹ `T⁻¹AT` = Diagonalmatrix der Eigenwerte | 95 | 52c, 55, 56 | A |
| 3.58 | Symmetrisch ⟹ orthogonal diagonalisierbar, `T⁻¹ = Tᵀ` | 97 | 52, 55 | A |
| 3.59 | **Spektralzerlegung** `A = λ₁v₁v₁ᵀ + … + λₙvₙvₙᵀ` | 97 | 52d | A |
| 3.60 | **SVD** `A = USVᵀ`, Singulärwerte absteigend, `r = rg(A)`, `A = σ₁u₁v₁ᵀ + …` | 99 | 57 | A |
| 3.61 | **Pseudoinverse** `A⁺ = VS⁺Uᵀ`; links- oder rechtsinvers je nach Rang; `x = A⁺b` löst das Ausgleichsproblem | 100 | 57c–57e | A |
| 3.62 | Residuenvektor `r = Ax − b` und `‖r‖` | 101 | 57e | A |
| 3.63 | Hauptkomponenten: Spalten von `V`, Eigenvektoren von `AᵀA`; erste Hauptkomponente = Richtung größter Streuung | 99–102 | — | C |

### 3h Homogene Koordinaten

| # | Eintrag | Skript | Aufgaben | Prio |
|---|---|---|---|---|
| 3.64 | Einbettung `(x,y) ↦ [x,y,1]`; letzte Zeile der Matrix ist `(0 … 0 1)` | 103 | 58, 59, 60 | A |
| 3.65 | **Verschiebungsmatrix** in Ebene und Raum | 103, 105 | 58, 59, 60 | A |
| 3.66 | Lineare Abbildung als 3×3-Matrix mit Nullrand | 104 | 58, 59 | A |
| 3.67 | **Drehung um einen Punkt** = Verschiebung, Drehung, Rückverschiebung (Matrizen multiplizieren) | 104 | 58c, 59c, 60b | A |
| 3.68 | Skalierung mit Fixpunkt — in den Aufgaben verlangt, im Skript nicht ausgeschrieben | — | 59b | A |
| 3.69 | Roboter-Deutung: erste Spalten = Orientierung, letzte Spalte = Position | 106 | — | C |

## Kapitel 4 — Funktionen mehrerer Variablen (Skript 107–134, 46 Aufgaben)

| # | Eintrag | Skript | Aufgaben | Prio |
|---|---|---|---|---|
| 4.1 | Skalarfeld gegen Vektorfeld | 107 | 4, 18 | C |
| 4.2 | Norm im `ℝⁿ`, ε-Umgebung; innerer Punkt, Randpunkt, offen, abgeschlossen | 109–110 | — | C |
| 4.3 | Grenzwert komponentenweise; Stetigkeit `lim f(x) = f(a)` | 110–112 | 5, 10, 11 | B |
| 4.4 | **Unstetigkeit nachweisen**: zwei Folgen mit verschiedenen Grenzwerten (Standardbeispiel `xy/(x²+y²)`) | 112–113 | 5, 8, 9, 10 | A |
| 4.5 | **Partielle Ableitung**: andere Variablen als Konstanten behandeln; Definition über den Grenzwert für Sonderstellen | 113 | 6, 13–17, 21 | A |
| 4.6 | **Gradient** `grad f = (∂f/∂x₁, …, ∂f/∂xₙ)`, auch `∇f`; zeigt in Richtung des steilsten Anstiegs | 114 | 12, 22, 27 | A |
| 4.7 | Näherung `Δz ≈ grad f(a)·Δx` | 115 | 38, 39, 42, 43 | A |
| 4.8 | Gradientenabstieg `a₁ = a₀ − γ·grad f(a₀)` | 115 | — | C |
| 4.9 | **Linearisierung / Tangentialebene** `z = f(a) + grad f(a)·(x−a)`, dazu die Koordinatendarstellung | 116 | 21, 22 | A |
| 4.10 | **Jacobi-Matrix** (Gradienten in die Zeilen); Linearisierung eines Vektorfeldes `z = f(a) + J_f(a)(x−a)` | 117–118 | — | B |
| 4.11 | **Rotation** und **Divergenz** | 119 | 18, 19 | A |
| 4.12 | Höhere partielle Ableitungen, Schreibweisen; Vertauschbarkeit bei stetigen Ableitungen (Satz von Schwarz) | 120–121 | 21, 25 | A |
| 4.13 | Lokales Extremum, **stationäre Stelle** `grad f = 0` als notwendige Bedingung | 121 | 2, 23, 24, 26, 30, 31, 40 | A |
| 4.14 | **Hesse-Matrix**, für `n = 2` ausgeschrieben | 123 | 27–31, 40 | A |
| 4.15 | Positiv / negativ definit / indefinit über die Eigenwerte | 122 | 28, 29 | A |
| 4.16 | **Hinreichendes Kriterium**: positiv definit → Minimum, negativ definit → Maximum, indefinit → Sattelpunkt; keine Aussage sonst | 124 | 28–31, 40 | A |
| 4.17 | Für `n = 2` das Schulkriterium über `det H` und `f_xx` — im Skript nur über Eigenwerte, in den Aufgaben der schnellere Weg | — | 29–31, 40 | A |
| 4.18 | **Taylorpolynom zweiter Ordnung** `z = f(a) + grad f(a)(x−a) + ½(x−a)ᵀH_f(a)(x−a)` | 123 | 27, 41 | A |
| 4.19 | Fehlerfortpflanzung eindimensional `Δz_max = \|f′(x)\|Δx` | 126–127 | 39, 43 | B |
| 4.20 | **Lineare Fehlerfortpflanzung** (Summe der Beträge) | 127 | 39, 43 | A |
| 4.21 | **Gaußsche Fehlerfortpflanzung** (Wurzel aus der Quadratsumme) | 127 | 39, 43 | A |
| 4.22 | Relativer und prozentualer Fehler; bei `x/y` addieren sich die relativen Fehler | 128 | 39, 43 | B |
| 4.23 | Totales Differential `df` — in den Aufgaben verlangt, im Skript nur als `Δz`-Näherung | — | 38, 42 | A |
| 4.24 | **Implizite Funktionen**: Voraussetzung `∂F/∂y ≠ 0`, Ableitung `f′ = −(∂F/∂x)/(∂F/∂y)`, Tangentengleichung | 129–130 | 44, 45 | A |
| 4.25 | Doppelintegral, Riemann-Integral in zwei Variablen | 130–132 | — | C |
| 4.26 | **Satz von Fubini**: iterierte Integration, Reihenfolge vertauschbar | 133 | — | C |

## Über das Skript hinaus, aber Aufgabenstoff

Diese Einträge hat kein Skriptkapitel; die Aufgaben verlangen sie trotzdem. Sie
werden in der Sammlung **als solche gekennzeichnet**.

| # | Eintrag | Aufgaben | Prio |
|---|---|---|---|
| Z.1 | **Prinzip der kleinsten Quadrate**: `S(a,b) = Σ(yₖ − b − a·xₖ)²`, notwendige Bedingung `∂S/∂a = ∂S/∂b = 0` | Ana 32, 33 | A |
| Z.2 | **Normalgleichungen der Ausgleichsgeraden**, aufgelöst nach `a` und `b` | Ana 32, 33 | A |
| Z.3 | Kleinste Quadrate für andere Ansätze: `f(x) = ax` (ein Parameter), `f(x) = ax²+bx+c`, `f(t) = A·cos(ωt)` | Ana 34–37 | A |
| Z.4 | Nachweis, dass die gefundene Stelle wirklich ein Minimum ist (Hesse-Matrix von `S`) | Ana 32 | B |
| Z.5 | Inverse über den Gauß-Algorithmus (`[A\|E] → [E\|A⁻¹]`) | LA 25, 26 | A |
| Z.6 | Skalierungsmatrix mit Fixpunkt in homogenen Koordinaten | LA 59b | A |
| Z.7 | Physik-Schreibweise der Schwingungs-DGL (siehe Befund 6) | DGL 4–7, 9 | A |

## Was nicht hineinkommt

- **Beweise.** Das Skript führt sie; eine Formelsammlung nicht.
- **Definitionen ohne Rechenwert.** Innerer Punkt, Randpunkt, ε-Umgebung, die
  Gruppen- und Körperaxiome in voller Länge, Ring gegen Körper — das steht in der
  Sammlung höchstens als Einzeiler, wo eine Aufgabe es verlangt.
- **Extrema mit Nebenbedingung / Lagrange.** Siehe Befund 4.
- **Herleitungen und Beispiele.** Ein Beispiel gehört auf die Karte. In die
  Sammlung kommt eines nur dort, wo die Formel ohne es nicht zu benutzen ist —
  etwa bei den Partialbruch-Typen oder den Ansatztabellen.
- **Zahlenwerte aus Aufgaben.** Die Sammlung ist keine Lösungssammlung.

## Zahlen zum Umfang

| Kapitel | Einträge | davon A | davon B | davon C |
|---|---|---|---|---|
| 1 Integralrechnung | 21 | 16 | 4 | 1 |
| 2 Differentialgleichungen | 13 | 11 | 2 | 0 |
| 3 Lineare Algebra | 69 | 52 | 13 | 4 |
| 4 Mehrere Variablen | 26 | 17 | 4 | 5 |
| Z über das Skript hinaus | 7 | 6 | 1 | 0 |
| **Summe** | **136** | **102** | **24** | **10** |

136 Einträge, davon 102 mit Priorität A. Das ist zu viel für eine Seite und zu
wenig für vier — die Bauform ist die nächste Frage, nicht diese.

## Nächster Schritt

Diese Liste ist der **Inhalt**, nicht die **Form**. Offen und vor dem Bauen zu
entscheiden:

- Eine Seite oder eine Datei je Kapitel? (Der Bauplan der Karten in `CLAUDE.md`
  kennt bisher nur zwei Gattungen — `tools/` und `karten/`. Eine Formelsammlung
  ist eine dritte.)
- Wie findet man etwas: Inhaltsverzeichnis, Sprungmarken, Suchfeld?
- Druck: Die Sammlung ist der erste Kandidat für „auf Papier neben der Klausur".
  Zweispaltig? Wie viele Seiten darf sie werden?
- Verweise: Jeder Eintrag mit Skriptseite — und, wo es eine gibt, mit Link auf die
  Karte und auf das Werkzeug.
- Reihenfolge des Baus: nach Priorität A/B/C oder kapitelweise?
