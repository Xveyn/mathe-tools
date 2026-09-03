# Formelsammlung Implementierungsplan

> **Für agentische Ausführung:** ERFORDERLICHE SUB-SKILL: `superpowers:subagent-driven-development` (empfohlen) oder `superpowers:executing-plans`, um diesen Plan Aufgabe für Aufgabe abzuarbeiten. Die Schritte nutzen Checkbox-Syntax (`- [ ]`).

**Ziel:** Die dritte Gattung des Repos aufsetzen — `formeln/` mit einer Übersicht aus 14 Kacheln, 14 Themendateien und zwei geteilten Bausteinen. Ein Thema wird vollständig gefüllt (`drehungen-spiegelungen.html`, acht Einträge) und dient als Muster für die dreizehn folgenden Runden.

**Architektur:** Wie bisher reines HTML/CSS/JS ohne Build. Der Inhalt steht als MathML im HTML; `shared/formeln.js` erzeugt nur Verzeichnis und Filter und hängt als `MT.formeln` am globalen Objekt. `shared/formeln.css` ist von `karten.css` unabhängig und wird nie zusammen mit ihm geladen.

**Tech Stack:** HTML5, MathML, CSS Custom Properties, ES5-JavaScript (`var`, IIFE, `"use strict"`). Keine Abhängigkeiten. Prüfung mit Playwright über die `mcp__playwright-edge__*`-Werkzeuge gegen einen lokalen HTTP-Server.

**Spec:** `docs/superpowers/specs/2026-09-03-formelsammlung-design.md` — bindend, vor der ersten Aufgabe zu lesen.
**Inhaltsaufnahme:** `docs/superpowers/specs/2026-09-03-formelsammlung-inhalt.md` — die Quelle aller Einträge.
**Repoweite Regeln:** `CLAUDE.md` im Wurzelverzeichnis — bindend für jede Aufgabe.

---

## Globale Randbedingungen

Gelten für **jede** Aufgabe. Die Langfassung steht in `CLAUDE.md`.

- **Kein Build.** Kein npm, kein Bundler, keine `package.json`.
- **Keine ES-Module.** Klassische `<script src="…">` ohne `type="module"`.
- **Doppelklick muss funktionieren**, gleichrangig neben GitHub Pages.
- **Keine externen Abhängigkeiten**, keine CDN-Ressourcen, keine Fremdschriften.
- **Alle Pfade relativ**, niemals mit führendem `/`. Links zeigen auf `index.html`, nie auf ein Verzeichnis. Aus `formeln/` heraus ist der Weg nach `shared/` und zum Favicon `../`.
- **ES5-artiger Stil:** `var`, IIFE, `"use strict"`. Kein `let`, kein `const`, keine Pfeilfunktionen, keine Template-Literale — auch nicht in Kommentaren.
- **Deutsch** in Oberfläche, Kommentaren, lokalen Namen, Dateinamen und Commit-Nachrichten. **Nicht** an der geteilten Schnittstelle: dort gilt die eingeführte Schreibweise, also `MT.formeln.start()` nach dem Vorbild von `MT.abfrage.start()`.
- **Dateinamen und `id`-Werte** klein, mit Bindestrich, ohne Umlaute: `drehungen-spiegelungen.html`, `id="drehung-in-der-ebene"`.
- **Keine Farbliterale in einer Seite.** Farben kommen als `var(--…)`. Die einzige Ausnahme ist die Druckpalette in `formeln.css` — sie definiert Tokens um, genau wie ihr Gegenstück in `karten.css`, und wird in Aufgabe 5 in `CLAUDE.md` vermerkt.
- **Namensraum:** `.karte` = Karteikarte, `.kachel` = Katalogeintrag, `.tafel` = Zeichentafel eines Werkzeugs, `.eintrag` = Eintrag der Formelsammlung. **`.formel` und `.beispiel` sind tabu** — sie gehören den Karten.
- **`karten.css` wird von keiner Formelseite geladen.**
- **Jede neue Seite trägt `<link rel="icon" href="../favicon.svg">`** im `<head>`, sonst holt sie sich einen 404 auf `/favicon.ico`.
- **Punkte in der Strichform** `(0 | 0)`; Komma bleibt bei Funktionsargumenten `f(2, 1)` und bei Vektoren `(2, 4)`.
- **Keine Testdateien im Repo, keine CI.** Geprüft wird am laufenden Bild, siehe Prüfroutine F.
- **Kein URL-Zustand**, kein `localStorage`, keine Tastenkürzel.
- **Commit-Nachrichten** enden mit:
  ```
  Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01TgEoGocBa7YWZbfWT9TDLs
  ```

## Kürzel

| Kürzel | Bedeutung |
|---|---|
| REPO | das Repo-Verzeichnis (`…/Tools/mathe-tools`) |
| SKRIPT | `…/Tools/import files/math_ss26.pdf`, das Vorlesungsskript |

---

## Prüfroutine F

Der Prüfzyklus dieser Runde. Jede Aufgabe, die eine Seite anfasst, fährt die Punkte, die auf sie zutreffen, und **zitiert die Messwerte** im Commit oder im Bericht.

**Vorbereitung — einmal je Sitzung.** Playwright kann in dieser Umgebung `file://` nicht öffnen; es braucht einen Server:

```bash
cd "<REPO>" && python -m http.server 8765 --bind 127.0.0.1
```

im Hintergrund starten, am Ende der Sitzung stoppen. Die Seiten liegen dann unter `http://127.0.0.1:8765/formeln/…`.

**Der Stylesheet-Cache lügt.** Edge behält `shared/*.css` auch bei einer neuen URL im Speicher. Nach jeder CSS-Änderung im geöffneten Dokument:

```js
() => { document.querySelectorAll('link[rel=stylesheet]').forEach(function (l) {
  l.href = l.href.split('?')[0] + '?v=' + Date.now(); }); }
```

danach 400 ms warten. Ohne diesen Schritt misst man den alten Stand — das hat am 2026-09-03 einen ganzen Prüflauf gekostet.

| Nr | Prüfung | Verfahren | Sollwert |
|---|---|---|---|
| F1 | Formelsatz | siehe Code unten | `gesetzt: true` |
| F2 | Breite bei 390 px | siehe Code unten | `seitlich: 0`, `balken: []` |
| F3 | Filter | tippen, zählen | Treffer sichtbar, Rest verborgen, `.leer` bei null Treffern |
| F4 | ohne JavaScript | Seite ohne `formeln.js` laden | alle Einträge sichtbar, keine leere Filterzeile |
| F5 | Druck | `emulateMedia({media:'print'})` | hell, einspaltig, Verzeichnis da, Filterzeile weg, nichts abgeschnitten |
| F6 | Konsole | Fehler mitschreiben | keine, `favicon` ausgenommen |
| F7 | Sprungmarken | jeden Verzeichnislink anklicken | landet beim zugehörigen Eintrag |

**F1 — Formelsatz.** Derselbe Test wie bei den Karten:

```js
() => {
  var kennt = typeof window.MathMLElement === 'function';
  var m = document.querySelector('math');
  var anzeige = m ? getComputedStyle(m).display : null;
  var bruch = document.querySelector('mfrac');
  var q = bruch ? bruch.getBoundingClientRect().height /
                  bruch.firstElementChild.getBoundingClientRect().height : null;
  return { mathml: kennt, anzeige: anzeige,
           bruchquotient: bruch ? q : 'kein Bruch auf dieser Seite',
           gesetzt: kennt && !!anzeige && anzeige.indexOf('math') >= 0 && (q === null || q > 1.8) };
}
```

**F2 — Breite und Balken.** Bei Viewport 390 × 900:

```js
() => {
  var d = document.documentElement;
  var kaesten = [], balken = [];
  document.querySelectorAll('.eintrag math[display="block"], .eintrag p').forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.width - el.clientWidth > 0.5) balken.push(el.textContent.slice(0, 25));
    if (el.scrollWidth > el.clientWidth + 1) {
      el.scrollLeft = 99999; var max = el.scrollLeft; el.scrollLeft = 0;
      kaesten.push({ text: el.textContent.replace(/\s+/g, ' ').trim().slice(0, 25),
                     fehlt: el.scrollWidth - el.clientWidth,
                     erreichbar: max === el.scrollWidth - el.clientWidth });
    }
  });
  return { seitlich: d.scrollWidth - d.clientWidth, balken: balken, scrollkaesten: kaesten };
}
```

`seitlich` muss 0 sein, `balken` leer. Scrollkästen sind erlaubt, aber jeder muss `erreichbar: true` melden.

---

## Aufgabe 1: Der Baustein `shared/formeln.css` und die ersten zwei Einträge

Ziel: Die Gestalt steht, geprüft an den beiden Extremen — einer schmalen 2×2-Matrix und der breitesten Formel des Themas, der 4×4-Matrix der Fourier-Transformation.

**Dateien:**
- Erstellen: `shared/formeln.css`
- Erstellen: `formeln/drehungen-spiegelungen.html` (zunächst mit zwei Einträgen)

**Schnittstellen:**
- Nutzt: `shared/theme.css` (Tokens `--ink --dim --edge --panel-a --panel-b --gold`), `shared/ui.css` (`.wrap`, `.querlink`, `.seitenfuss`)
- Liefert: die Klassen `.eintrag`, `.quelle`, `.bedingung`, `.fall`, `.klammer-2z`, `.klammer-3z`, `.klammer-4z`, `.filterzeile`, `.verzeichnis`, `.leer` — Aufgabe 2 und 3 bauen darauf auf

- [ ] **Schritt 1: `shared/formeln.css` schreiben**

```css
/* Bausteine der Formelsammlung: Eintrag, Verzeichnis, Filterzeile, Druck.

   Diese Datei wird NIE zusammen mit shared/karten.css geladen. Was von dort
   gebraucht wird, steht deshalb hier noch einmal: die Spaltenbreite von 46rem
   (auf den Kartenseiten kommt sie von .karte, nicht von .wrap, das 1320 px
   breit ist) und die Druckregeln fuer Fusszeile und Farbtokens. */

/* ---- Teil 1: der Eintrag ---- */

.eintrag{
  background:var(--panel-b);
  border:1px solid var(--edge);border-radius:3px;
  padding:12px 16px 14px;margin:0 0 12px;max-width:46rem;
}
.eintrag:target{border-color:var(--gold)}
.eintrag h3{
  font-family:Georgia,"Iowan Old Style",serif;font-weight:400;
  font-size:1.05rem;line-height:1.3;margin:0 0 6px;color:var(--ink);
  display:flex;justify-content:space-between;align-items:baseline;gap:14px;
}
.quelle{
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  font-size:.75rem;color:var(--dim);white-space:nowrap;
}
.bedingung{color:var(--dim);font-size:.85rem;margin:0 0 6px}
.fall{color:var(--ink);font-size:.9rem;margin:12px 0 0}
.eintrag math{font-family:Georgia,"Iowan Old Style",serif;font-size:1.02rem}
.eintrag math[display="block"]{margin:8px 0 0;text-align:center}
.eintrag .querlink{margin:12px 0 0;padding-top:10px;font-size:.85rem}

/* Handgesetzte Matrixklammern. Die Streck-Mechanik von minsize/maxsize greift
   in Chromiums inline-table-Fallback fuer mtable nicht, die Klammern wachsen
   also nicht mit. Je Zeilenzahl eine eigene Groesse, in Schritt 4 gemessen. */
.matrix{display:inline-flex;align-items:center}
.klammer-2z{font-size:3.8em}
.klammer-3z{font-size:5.4em}
.klammer-4z{font-size:7em}

/* Eine Formel bricht nicht um. Ist sie breiter als die Spalte, scrollt sie in
   ihrer eigenen Zeile, statt die Seite aufzuschieben.

   Beide Achsen ausdruecklich: steht nur overflow-x, macht CSS aus dem uebrigen
   "visible" ein "auto", und Chromium meldet fuer eine Formelzeile mehr
   Inhaltshoehe als der Kasten hoch ist — jede Zeile legte sich dann 10 px fuer
   einen senkrechten Balken zurecht, den niemand braucht. Nachgewiesen am
   2026-09-03 an den Karten. */
.eintrag math[display="block"], .eintrag p{
  overflow:auto hidden;scrollbar-width:thin;scrollbar-color:var(--dim) transparent;
}

/* ---- Teil 2: Filterzeile, Verzeichnis, Leermeldung ----
   Alle drei erzeugt shared/formeln.js. Ohne Skript gibt es sie nicht, und die
   Seite ist trotzdem vollstaendig: die Eintraege stehen im HTML. */

[hidden]{display:none !important}

.filterzeile{max-width:46rem;margin:0 0 14px}
.filterzeile input{
  width:100%;box-sizing:border-box;
  background:var(--panel-b);border:1px solid var(--edge);border-radius:2px;
  color:var(--ink);font-family:inherit;font-size:.95rem;padding:7px 11px;
}
.filterzeile input:focus{border-color:var(--gold);outline:none}
.filterzeile input:focus-visible{outline:2px solid currentColor;outline-offset:3px}

.verzeichnis{max-width:46rem;margin:0 0 22px}
.verzeichnis ul{list-style:none;margin:0;padding:0;columns:2;column-gap:24px}
.verzeichnis li{margin:0 0 3px;break-inside:avoid}
.verzeichnis a{color:var(--gold);text-decoration:none;font-size:.9rem}
.verzeichnis a:hover{text-decoration:underline}
.verzeichnis a:focus-visible{outline:2px solid currentColor;outline-offset:3px}

.leer{max-width:46rem;color:var(--dim);font-size:.9rem;margin:0 0 12px}

/* .seitenfuss kommt aus ui.css und hat dort keine Breite. Auf den Kartenseiten
   gibt karten.css sie ihr; hier muss es diese Datei tun. */
.seitenfuss{max-width:46rem}

/* ---- Teil 3: der Druck ---- */

@media print{
  /* Tokens hell umdefinieren — dieselbe Palette wie im Druckblock von
     karten.css. Die Farbliterale sind hier die dokumentierte Ausnahme. */
  :root{
    --ink:#111; --dim:#555; --edge:#bbb;
    --panel-a:transparent; --panel-b:transparent;
    --grid:#ddd; --axis:#666;
    --gold:#8a6300; --mint:#0a7d6c; --rose:#a4457a;
  }
  body{ background:#fff; color:#111; }
  .filterzeile{ display:none !important; }
  .seitenfuss{ display:none !important; }
  /* Das Verzeichnis bleibt: auf Papier ist es das Inhaltsverzeichnis des Blattes. */
  .verzeichnis a{ color:#111; }
  .eintrag{ break-inside:avoid; background:none; border-color:#bbb; }
  /* Auf Papier gibt es kein Scrollen; ein Kasten schnitte lautlos ab. */
  .eintrag math[display="block"], .eintrag p{ overflow:visible; }
  a.querlink::after,.querlink a::after{ content:" (" attr(href) ")"; font-size:.85em; color:#555; }
}
```

- [ ] **Schritt 2: Die Seite mit zwei Einträgen anlegen**

`formeln/drehungen-spiegelungen.html`:

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
  <p class="lede">Orthogonale und unitäre Matrizen und die Abbildungen, die sie beschreiben. Gesucht wird nur auf dieser Seite — was in einem anderen Thema steht, findet das Feld nicht.</p>

  <article class="eintrag" id="drehung-in-der-ebene" data-suche="drehmatrix rotation winkel alpha">
    <h3>Drehung in der Ebene <span class="quelle">Skript S. 67, 83</span></h3>
    <p class="bedingung">Drehung um den Ursprung, gegen den Uhrzeigersinn, um den Winkel α</p>
    <math display="block">
      <mrow>
        <msub><mi>D</mi><mi>&#x3B1;</mi></msub><mo>=</mo>
        <mrow class="matrix">
          <mo class="klammer-2z">(</mo>
          <mtable>
            <mtr>
              <mtd><mi>cos</mi><mo>(</mo><mi>&#x3B1;</mi><mo>)</mo></mtd>
              <mtd><mo>&#x2212;</mo><mi>sin</mi><mo>(</mo><mi>&#x3B1;</mi><mo>)</mo></mtd>
            </mtr>
            <mtr>
              <mtd><mi>sin</mi><mo>(</mo><mi>&#x3B1;</mi><mo>)</mo></mtd>
              <mtd><mi>cos</mi><mo>(</mo><mi>&#x3B1;</mi><mo>)</mo></mtd>
            </mtr>
          </mtable>
          <mo class="klammer-2z">)</mo>
        </mrow>
      </mrow>
    </math>
  </article>

  <article class="eintrag" id="unitaere-beispiele" data-suche="dft fourier eulersche formel einheitskreis">
    <h3>Unitäre Beispiele <span class="quelle">Skript S. 84, 85</span></h3>
    <p class="bedingung">Die Drehung der Ebene als komplexe 1×1-Matrix; die diskrete Fourier-Transformation in Dimension 4</p>
    <math display="block">
      <mrow>
        <mo>(</mo><msup><mi>e</mi><mrow><mi>i</mi><mi>&#x3B1;</mi></mrow></msup><mo>)</mo>
      </mrow>
    </math>
    <math display="block">
      <mrow>
        <mi>U</mi><mo>=</mo>
        <mfrac><mn>1</mn><mn>2</mn></mfrac>
        <mrow class="matrix">
          <mo class="klammer-4z">(</mo>
          <mtable>
            <mtr><mtd><mn>1</mn></mtd><mtd><mn>1</mn></mtd><mtd><mn>1</mn></mtd><mtd><mn>1</mn></mtd></mtr>
            <mtr><mtd><mn>1</mn></mtd><mtd><mo>&#x2212;</mo><mi>i</mi></mtd><mtd><mo>&#x2212;</mo><mn>1</mn></mtd><mtd><mi>i</mi></mtd></mtr>
            <mtr><mtd><mn>1</mn></mtd><mtd><mo>&#x2212;</mo><mn>1</mn></mtd><mtd><mn>1</mn></mtd><mtd><mo>&#x2212;</mo><mn>1</mn></mtd></mtr>
            <mtr><mtd><mn>1</mn></mtd><mtd><mi>i</mi></mtd><mtd><mo>&#x2212;</mo><mn>1</mn></mtd><mtd><mo>&#x2212;</mo><mi>i</mi></mtd></mtr>
          </mtable>
          <mo class="klammer-4z">)</mo>
        </mrow>
      </mrow>
    </math>
  </article>

  <p class="seitenfuss"><a href="index.html">&#x2190; Alle Themen im Überblick</a></p>

</div>
</body>
</html>
```

Noch **kein** `<script>`-Tag — `shared/formeln.js` entsteht erst in Aufgabe 2.

- [ ] **Schritt 3: Server starten und die Seite ansehen**

```bash
cd "<REPO>" && python -m http.server 8765 --bind 127.0.0.1
```

im Hintergrund, dann `http://127.0.0.1:8765/formeln/drehungen-spiegelungen.html` öffnen. Erwartet: zwei Kästen, Titel links, Skriptseite rechts in derselben Zeile, Formeln zentriert.

- [ ] **Schritt 4: Die Klammern messen**

Die Werte `3.8em` und `7em` in `formeln.css` sind Startwerte, keine Messung. Für jede Matrix auf der Seite:

```js
() => {
  var aus = [];
  document.querySelectorAll('.matrix').forEach(function (m) {
    var tab = m.querySelector('mtable');
    var links = m.firstElementChild, rechts = m.lastElementChild;
    var t = tab.getBoundingClientRect(), k = links.getBoundingClientRect();
    aus.push({
      zeilen: tab.querySelectorAll('mtr').length,
      klasse: links.className.baseVal || links.getAttribute('class'),
      tabelleHoch: Math.round(t.height * 10) / 10,
      klammerHoch: Math.round(k.height * 10) / 10,
      verhaeltnis: Math.round(k.height / t.height * 100) / 100,
      obenUeber: Math.round((t.top - k.top) * 10) / 10,
      untenUeber: Math.round((k.bottom - t.bottom) * 10) / 10,
      rechteBuendig: Math.abs(rechts.getBoundingClientRect().height - k.height) < 0.5
    });
  });
  return aus;
}
```

**Sollwert:** `verhaeltnis` zwischen 1,00 und 1,15 — die Klammer ist so hoch wie die Matrix oder eine Spur höher. `obenUeber` und `untenUeber` liegen zwischen 0 und 4 px und unterscheiden sich um höchstens 2 px voneinander (die Klammer sitzt mittig). Die `font-size`-Werte in `formeln.css` so lange anpassen, bis das für **beide** Matrizen gilt, und die gemessenen Endwerte als Kommentar neben die drei Klammerklassen schreiben. `.klammer-3z` bleibt vorerst unbelegt und wird in Aufgabe 3 gemessen.

- [ ] **Schritt 5: Prüfroutine F, Punkte F1, F2, F5, F6**

F1 erwartet `gesetzt: true` (ein `mfrac` ist auf der Seite — der Faktor ½ vor der DFT-Matrix). F2 erwartet `seitlich: 0` und `balken: []`; die 4×4-Matrix wird bei 390 px einen Scrollkasten bilden, das ist zulässig, er muss `erreichbar: true` melden. F5 im Druckmodus bei 794 px: heller Grund, Fußzeile weg, die Matrizen vollständig, kein Eintrag zerrissen. F6: Konsole ohne Fehler.

**Die Messwerte aller vier Punkte im Commit zitieren.**

- [ ] **Schritt 6: Commit**

```bash
cd "<REPO>" && git add shared/formeln.css formeln/drehungen-spiegelungen.html && git commit -m "Baustein der Formelsammlung und die ersten zwei Eintraege" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01TgEoGocBa7YWZbfWT9TDLs"
```

---

## Aufgabe 2: Der Baustein `shared/formeln.js`

Ziel: Verzeichnis und Filter, erzeugt aus dem, was auf der Seite steht.

**Dateien:**
- Erstellen: `shared/formeln.js`
- Ändern: `formeln/drehungen-spiegelungen.html` (zwei `<script>`-Zeilen am Ende)

**Schnittstellen:**
- Nutzt: die Klassen aus Aufgabe 1
- Liefert: `MT.formeln.start()` — von jeder Themenseite am Ende des `<body>` aufgerufen, ohne Argumente, ohne Rückgabewert

- [ ] **Schritt 1: `shared/formeln.js` schreiben**

```js
/* MT.formeln — Verzeichnis und Filter einer Formelseite.

   Beides entsteht aus dem, was auf der Seite steht: gelesen werden die
   <article class="eintrag">, ihre Ueberschrift, ihre Bedingungszeile und ihr
   data-suche. Es gibt keine zweite Datenhaltung, also kann das Verzeichnis
   nicht veralten.

   Ohne dieses Skript fehlen Filterzeile und Verzeichnis, und die Seite ist
   trotzdem vollstaendig — die Eintraege stehen im HTML. Genau deshalb werden
   beide hier erzeugt und stehen nicht im Markup: ein Filterfeld, das nichts
   tut, waere schlechter als keins, und ein von Hand gepflegtes Verzeichnis
   veraltet. */
var MT = MT || {};
(function(){
  "use strict";

  function text(el){
    return el ? el.textContent.replace(/\s+/g, " ").trim() : "";
  }

  /* Der Titel ohne die Quellenangabe, die in derselben Zeile steht. */
  function titel(eintrag){
    var h = eintrag.querySelector("h3");
    if (!h) return "";
    var quelle = h.querySelector(".quelle");
    var ganz = text(h);
    if (!quelle) return ganz;
    var ohne = ganz.replace(text(quelle), "");
    return ohne.replace(/\s+/g, " ").trim();
  }

  function suchschluessel(eintrag){
    return (titel(eintrag) + " " +
            text(eintrag.querySelector(".bedingung")) + " " +
            (eintrag.getAttribute("data-suche") || "")).toLowerCase();
  }

  function start(){
    var eintraege = [].slice.call(document.querySelectorAll("article.eintrag"));
    if (!eintraege.length) return;

    var erster = eintraege[0];
    var eltern = erster.parentNode;
    var i, schluessel = [], zeilen = [];

    /* Filterzeile */
    var zeile = document.createElement("div");
    zeile.className = "filterzeile";
    var feld = document.createElement("input");
    feld.type = "search";
    feld.setAttribute("placeholder", "Eintrag suchen …");
    feld.setAttribute("aria-label", "Einträge dieser Seite filtern");
    zeile.appendChild(feld);
    eltern.insertBefore(zeile, erster);

    /* Verzeichnis */
    var nav = document.createElement("nav");
    nav.className = "verzeichnis";
    nav.setAttribute("aria-label", "Einträge dieser Seite");
    var liste = document.createElement("ul");
    for (i = 0; i < eintraege.length; i++) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + eintraege[i].id;
      a.textContent = titel(eintraege[i]);
      li.appendChild(a);
      liste.appendChild(li);
      zeilen.push(li);
      schluessel.push(suchschluessel(eintraege[i]));
    }
    nav.appendChild(liste);
    eltern.insertBefore(nav, erster);

    /* Leermeldung, hinter dem letzten Eintrag */
    var leer = document.createElement("p");
    leer.className = "leer";
    leer.hidden = true;
    eintraege[eintraege.length - 1].parentNode.insertBefore(
      leer, eintraege[eintraege.length - 1].nextSibling);

    function filtern(){
      var frage = feld.value.toLowerCase().replace(/\s+/g, " ").trim();
      var treffer = 0, k, passt;
      for (k = 0; k < eintraege.length; k++) {
        passt = !frage || schluessel[k].indexOf(frage) >= 0;
        eintraege[k].hidden = !passt;
        zeilen[k].hidden = !passt;
        if (passt) treffer++;
      }
      if (treffer === 0) {
        leer.textContent = "Kein Eintrag passt zu „" + feld.value.trim() + "“.";
        leer.hidden = false;
      } else {
        leer.hidden = true;
      }
    }

    feld.addEventListener("input", filtern);
  }

  MT.formeln = { start: start };
})();
```

- [ ] **Schritt 2: Die Seite verdrahten**

In `formeln/drehungen-spiegelungen.html` vor `</body>`:

```html
<script src="../shared/formeln.js"></script>
<script>MT.formeln.start();</script>
```

- [ ] **Schritt 3: Verzeichnis und Filter prüfen (F3, F7)**

Seite neu laden. Erwartet: über den Einträgen erst das Suchfeld, darunter das Verzeichnis mit zwei Zeilen — „Drehung in der Ebene" und „Unitäre Beispiele", **ohne** die Skriptseiten im Text.

```js
() => {
  var feld = document.querySelector('.filterzeile input');
  var zeilen = document.querySelectorAll('.verzeichnis li');
  var eintraege = document.querySelectorAll('article.eintrag');
  function tippe(wert){
    feld.value = wert;
    feld.dispatchEvent(new Event('input'));
    var sichtbar = 0, sichtbarZeilen = 0, k;
    for (k = 0; k < eintraege.length; k++) if (!eintraege[k].hidden) sichtbar++;
    for (k = 0; k < zeilen.length; k++) if (!zeilen[k].hidden) sichtbarZeilen++;
    var leer = document.querySelector('.leer');
    return { wert: wert, eintraege: sichtbar, zeilen: sichtbarZeilen,
             leermeldung: leer && !leer.hidden ? leer.textContent : null };
  }
  var aus = [tippe(''), tippe('dreh'), tippe('dft'), tippe('xyz'), tippe('')];
  return { verzeichnistitel: [].map.call(zeilen, function (l) { return l.textContent; }),
           laeufe: aus };
}
```

**Sollwerte:**

| Eingabe | `eintraege` | `zeilen` | `leermeldung` |
|---|---|---|---|
| leer | 2 | 2 | `null` |
| `dreh` | 1 | 1 | `null` |
| `dft` | 1 | 1 | `null` — Treffer nur über `data-suche` |
| `xyz` | 0 | 0 | „Kein Eintrag passt zu „xyz"." |
| leer | 2 | 2 | `null` |

`verzeichnistitel` muss `["Drehung in der Ebene", "Unitäre Beispiele"]` sein. Steht dort die Skriptseite mit drin, ist `titel()` falsch.

Danach F7: beide Verzeichnislinks anklicken, die Seite muss zum Eintrag springen und dessen Rahmen golden werden (`:target`).

- [ ] **Schritt 4: Ohne JavaScript prüfen (F4)**

Der einfachste verlässliche Weg: die beiden `<script>`-Zeilen in der Datei auskommentieren, Seite neu laden, messen, Kommentar wieder entfernen.

```js
() => ({
  eintraege: document.querySelectorAll('article.eintrag').length,
  sichtbar: [].filter.call(document.querySelectorAll('article.eintrag'),
                           function (e) { return !e.hidden; }).length,
  filterzeile: document.querySelectorAll('.filterzeile').length,
  verzeichnis: document.querySelectorAll('.verzeichnis').length
})
```

**Sollwert:** `{ eintraege: 2, sichtbar: 2, filterzeile: 0, verzeichnis: 0 }`. Konsole ohne Fehler, und optisch keine leere Fläche dort, wo Filterzeile und Verzeichnis stünden.

- [ ] **Schritt 5: Druck prüfen (F5)**

Im Druckmodus muss die Filterzeile verschwunden und das Verzeichnis vorhanden sein.

- [ ] **Schritt 6: Commit**

```bash
cd "<REPO>" && git add shared/formeln.js formeln/drehungen-spiegelungen.html && git commit -m "Verzeichnis und Filter der Formelsammlung" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01TgEoGocBa7YWZbfWT9TDLs"
```

---

## Aufgabe 3: Die sechs übrigen Einträge des Musterthemas

Ziel: `drehungen-spiegelungen.html` ist vollständig — acht Einträge, die Nummern 3.35 bis 3.42 der Inhaltsaufnahme.

**Dateien:**
- Ändern: `formeln/drehungen-spiegelungen.html`
- Ändern: `shared/formeln.css` (nur `.klammer-3z`, nach Messung)

**Schnittstellen:**
- Nutzt: alles aus Aufgabe 1 und 2

- [ ] **Schritt 1: Die Skriptseiten als Bild lesen**

**Nicht aus extrahiertem Text abschreiben** — die Extraktion verstümmelt Formeln. Zu lesen sind die Seiten **82, 83, 84 und 85** von SKRIPT, mit dem Read-Werkzeug und `pages: "82-85"`. Von dort stammen alle Matrizen dieser Aufgabe.

- [ ] **Schritt 2: Die sechs Einträge schreiben**

Reihenfolge auf der Seite (die beiden vorhandenen an ihrer Stelle eingeordnet):

| Reihenfolge | `id` | Titel | Quelle |
|---|---|---|---|
| 1 | `orthogonal-und-unitaer` | Orthogonale und unitäre Matrizen | Skript S. 82 |
| 2 | `spalten-bilden-onb` | Prüfung: die Spalten bilden eine ONB | Skript S. 82 |
| 3 | `verzerrungsfrei` | Was orthogonale Abbildungen erhalten | Skript S. 83 |
| 4 | `drehung-in-der-ebene` | Drehung in der Ebene *(steht bereits)* | Skript S. 67, 83 |
| 5 | `spiegelung-in-der-ebene` | Spiegelungen in der Ebene | Skript S. 83 |
| 6 | `drehungen-im-raum` | Drehungen und Spiegelungen im Raum | Skript S. 84 |
| 7 | `determinante-plus-minus-eins` | Determinante einer orthogonalen Matrix | nicht im Skript |
| 8 | `unitaere-beispiele` | Unitäre Beispiele *(steht bereits)* | Skript S. 84, 85 |

Inhalt je Eintrag — Formeln nach dem Muster aus Aufgabe 1, Klammern über `.matrix` und die passende `.klammer-Nz`:

1. **`orthogonal-und-unitaer`** — Bedingung: „A regulär". Zwei Formelzeilen: `A⁻¹ = Aᵀ` (orthogonal, über ℝ) und `A⁻¹ = A̅ᵀ` (unitär, über ℂ). Dazu eine `.fall`-Zeile „A̅ᵀ heißt adjungierte Matrix". Die Konjugation als `<mover><mi>A</mi><mo>&#xAF;</mo></mover>`, transponiert als `<msup>…<mi>T</mi></msup>`. `data-suche="adjungiert transponiert konjugiert"`.
2. **`spalten-bilden-onb`** — Bedingung: „gilt in beide Richtungen". Formel `A·Aᵀ = E` beziehungsweise `A·A̅ᵀ = E`, dazu die `.fall`-Zeile: „Damit prüft man Orthogonalität, ohne die Inverse zu bestimmen." Zweiter Satz als Fließtext in `.fall`: „Gleichwertig: die Spaltenvektoren (und ebenso die Zeilenvektoren) bilden eine Orthonormalbasis." `data-suche="onb orthonormalbasis pruefung einheitsmatrix"`.
3. **`verzerrungsfrei`** — Bedingung: „A orthogonal oder unitär". Drei Formeln untereinander: `(Av)·(Aw) = v·w`, `‖Av‖ = ‖v‖`, und `v·w = 0 ⟹ (Av)·(Aw) = 0`. `data-suche="norm skalarprodukt winkel laengentreu"`.
4. *(steht bereits)*
5. **`spiegelung-in-der-ebene`** — Bedingung: „Spiegelung an einer Geraden durch den Ursprung, die gegenüber der x-Achse um α geneigt ist". Drei 2×2-Matrizen: `Sx = ((1,0),(0,−1))` an der x-Achse, `Sy = ((−1,0),(0,1))` an der y-Achse, `Sα = ((cos2α, sin2α),(sin2α, −cos2α))` allgemein. Dazu `.fall`: „Für α = 0 wird daraus Sx, für α = π/2 wird daraus Sy." `data-suche="achsenspiegelung winkelhalbierende"`.
6. **`drehungen-im-raum`** — Bedingung: „Drehung um eine Koordinatenachse, gegen den Uhrzeigersinn". Vier 3×3-Matrizen mit je einer `.fall`-Zeile davor: Drehung um die z-Achse `((cos,−sin,0),(sin,cos,0),(0,0,1))` (Skript S. 84), Spiegelung an der x,z-Ebene `diag(1,−1,1)` (Skript S. 84), Drehspiegelung `((cos α,0,−sin α),(0,−1,0),(sin α,0,cos α))` (Skript S. 84) — und, ausdrücklich als **nicht im Skript** gekennzeichnet, die Drehung um die y-Achse `((cos α,0,sin α),(0,1,0),(−sin α,0,cos α))`, die Aufgabe LA 35b verlangt. `data-suche="raumdrehung achse drehspiegelung"`.
7. **`determinante-plus-minus-eins`** — Quelle `nicht im Skript`, Bedingung: „Folgerung aus A·Aᵀ = E; in Aufgabe LA 40j verlangt". Formel: `det(A) = ±1` für reelle orthogonale A. `.fall`: „Die Umkehrung gilt **nicht** — Determinante ±1 macht eine Matrix nicht orthogonal." `data-suche="determinante orthogonal umkehrung"`.
8. *(steht bereits)*

- [ ] **Schritt 3: `.klammer-3z` messen**

Mit dem Messcode aus Aufgabe 1, Schritt 4. Jetzt sind 3×3-Matrizen auf der Seite; `verhaeltnis` zwischen 1,00 und 1,15, `obenUeber` und `untenUeber` je 0 bis 4 px. Den gefundenen Wert in `formeln.css` eintragen und als Kommentar die Messung dazuschreiben.

- [ ] **Schritt 4: Prüfroutine F vollständig**

F1 bis F7, alle sieben Punkte, auf der fertigen Seite. Besonders:

- **F2 bei 390 px:** Erwartet werden mehrere Scrollkästen (die 3×3- und die 4×4-Matrix), aber `seitlich: 0` und `balken: []`, und jeder Kasten `erreichbar: true`.
- **F3:** zusätzlich zu den Läufen aus Aufgabe 2 die Eingabe `onb` — sie muss genau den Eintrag `spalten-bilden-onb` treffen — und `spiegel`, die zwei Einträge trifft (`spiegelung-in-der-ebene` und `drehungen-im-raum`).
- **F5:** Im Druckmodus bei 794 px messen, dass **keine** Matrix über den Rand der Spalte tritt:

```js
() => {
  var aus = [];
  document.querySelectorAll('.eintrag').forEach(function (e) {
    var kasten = e.getBoundingClientRect();
    e.querySelectorAll('math[display="block"] > *').forEach(function (inhalt) {
      var r = inhalt.getBoundingClientRect();
      if (r.right > kasten.right - 1) aus.push({
        eintrag: e.id, ueber: Math.round((r.right - kasten.right) * 10) / 10 });
    });
  });
  return aus;
}
```

Sollwert: leere Liste. Tritt etwas über, wird der betreffende Eintrag geteilt — je Matrix eine eigene `math display="block"`-Zeile — und erneut gemessen.

- [ ] **Schritt 5: Commit**

```bash
cd "<REPO>" && git add formeln/drehungen-spiegelungen.html shared/formeln.css && git commit -m "Musterthema vollstaendig: acht Eintraege zu Drehungen und Spiegelungen" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01TgEoGocBa7YWZbfWT9TDLs"
```

---

## Aufgabe 4: Übersicht und die dreizehn übrigen Gerüstdateien

Ziel: Jedes Thema ist erreichbar, und eine leere Seite sagt selbst, dass sie leer ist.

**Dateien:**
- Erstellen: `formeln/index.html`
- Erstellen: 13 Themendateien nach der Tabelle unten

**Schnittstellen:**
- Nutzt: `.kachel` und `.katalog` aus `shared/ui.css`, `shared/formeln.css`

- [ ] **Schritt 1: `formeln/index.html` schreiben**

Aufbau wie `karten/index.html` — dort nachsehen, ob sich das Muster seither geändert hat. Gerüst:

```html
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="../favicon.svg">
<title>Formelsammlung</title>
<link rel="stylesheet" href="../shared/theme.css">
<link rel="stylesheet" href="../shared/ui.css">
<link rel="stylesheet" href="../shared/formeln.css">
</head>
<body>
<div class="wrap">

  <h1>Formelsammlung</h1>
  <p class="lede">Alle Formeln des Stoffes zum Nachschlagen, nach Themen geordnet. Erklärt wird hier nichts &#x2014; dafür gibt es die Karten.</p>

  <h2>Integralrechnung</h2>
  <div class="katalog">
    <a class="kachel" href="integral-grundlagen.html">
      <h3>Grundlagen und Hauptsatz</h3>
      <p>Ober- und Untersumme, Fläche, Hauptsatz, Grundintegrale, uneigentliche Integrale. 13 Einträge. <em>noch nicht gefüllt</em></p>
    </a>
    <!-- zweite Kachel dieses Kapitels -->
  </div>

  <!-- drei weitere h2 mit ihren Rastern -->

  <p class="seitenfuss"><a href="../index.html">&#x2190; Zur Startseite</a></p>

</div>
</body>
</html>
```

Kein `<script>`: die Übersicht trägt keine Einträge und braucht weder Filter noch Verzeichnis.

Die vierzehn Kacheln, gruppiert — **die dreizehn noch leeren tragen `<em>noch nicht gefüllt</em>` am Ende ihres Textes**, `drehungen-spiegelungen.html` nicht:

| Überschrift | Datei | Kacheltitel | Einträge |
|---|---|---|---|
| Integralrechnung | `integral-grundlagen.html` | Grundlagen und Hauptsatz | 13 |
| | `integral-verfahren.html` | Verfahren und Partialbrüche | 8 |
| Differentialgleichungen | `dgl-erster-ordnung.html` | Erster Ordnung | 4 |
| | `dgl-zweiter-ordnung.html` | Zweiter Ordnung | 10 |
| Lineare Algebra | `endliche-koerper.html` | Endliche Körper und Restklassen | 7 |
| | `vektorraeume-rang.html` | Vektorräume, Abbildungen, Rang | 14 |
| | `skalarprodukt.html` | Skalarprodukt und Orthogonalität | 5 |
| | `determinante-inverse.html` | Determinante und Inverse | 9 |
| | `drehungen-spiegelungen.html` | Drehungen und Spiegelungen | 8 |
| | `eigenwerte.html` | Eigenwerte und Eigenvektoren | 10 |
| | `basiswechsel-zerlegungen.html` | Basiswechsel und Zerlegungen | 11 |
| | `homogene-koordinaten.html` | Homogene Koordinaten | 7 |
| Funktionen mehrerer Variablen | `ableitungen-gradient.html` | Partielle Ableitungen und Gradient | 12 |
| | `extrema-fehler.html` | Extrema, Fehler, kleinste Quadrate | 18 |

`.kachel em` ist in `ui.css` bereits gestaltet.

Am Fuß `<p class="seitenfuss"><a href="../index.html">← Zur Startseite</a></p>`.

- [ ] **Schritt 2: Die dreizehn Gerüstdateien anlegen**

Jede nach diesem Muster — hier `eigenwerte.html`, die übrigen zwölf entsprechend mit ihrem Titel aus der Tabelle:

```html
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="../favicon.svg">
<title>Eigenwerte und Eigenvektoren</title>
<link rel="stylesheet" href="../shared/theme.css">
<link rel="stylesheet" href="../shared/ui.css">
<link rel="stylesheet" href="../shared/formeln.css">
</head>
<body>
<div class="wrap">

  <h1>Eigenwerte und Eigenvektoren</h1>
  <p class="lede">Zehn Einträge nach der Inhaltsaufnahme, Nummern 3.43 bis 3.52.</p>

  <p class="leer">Dieses Thema ist noch nicht gefüllt. Was hineingehört, steht in
    <code>docs/superpowers/specs/2026-09-03-formelsammlung-inhalt.md</code>.</p>

  <p class="seitenfuss"><a href="index.html">&#x2190; Alle Themen im Überblick</a></p>

</div>
<script src="../shared/formeln.js"></script>
<script>MT.formeln.start();</script>
</body>
</html>
```

Die `.leer`-Zeile steht hier **fest im HTML** und ist sichtbar (kein `hidden`) — sie ist nicht die Leermeldung des Filters, sondern die Auskunft der Seite über sich selbst. `MT.formeln.start()` findet keine Einträge und kehrt sofort zurück, ohne Filterzeile und Verzeichnis zu bauen; genau dafür steht die Rückgabe in Zeile zwei der Funktion.

**Der Hinweis auf die seitenlokale Suche gehört erst dazu, wenn ein Thema gefüllt ist.** Die Spec verlangt ihn „in der `.lede` jeder Seite“; auf einer leeren Seite gäbe es aber kein Suchfeld, auf das er sich bezöge. Die dreizehn Gerüste tragen ihn deshalb noch nicht — er kommt in der Runde dazu, die das Thema füllt, wie im Musterthema in Aufgabe 1 vorgemacht.

Die `.lede`-Zeile jeder Datei nennt die Zahl der Einträge und ihre Nummern aus der Inhaltsaufnahme:

| Datei | `.lede` |
|---|---|
| `integral-grundlagen.html` | Dreizehn Einträge nach der Inhaltsaufnahme, Nummern 1.1 bis 1.13. |
| `integral-verfahren.html` | Acht Einträge, Nummern 1.14 bis 1.21. |
| `dgl-erster-ordnung.html` | Vier Einträge, Nummern 2.1 bis 2.4. |
| `dgl-zweiter-ordnung.html` | Zehn Einträge, Nummern 2.5 bis 2.13 und Z.7. |
| `endliche-koerper.html` | Sieben Einträge, Nummern 3.1 bis 3.7. |
| `vektorraeume-rang.html` | Vierzehn Einträge, Nummern 3.8 bis 3.21. |
| `skalarprodukt.html` | Fünf Einträge, Nummern 3.22 bis 3.26. |
| `determinante-inverse.html` | Neun Einträge, Nummern 3.27 bis 3.34 und Z.5. |
| `eigenwerte.html` | Zehn Einträge, Nummern 3.43 bis 3.52. |
| `basiswechsel-zerlegungen.html` | Elf Einträge, Nummern 3.53 bis 3.63. |
| `homogene-koordinaten.html` | Sieben Einträge, Nummern 3.64 bis 3.69 und Z.6. |
| `ableitungen-gradient.html` | Zwölf Einträge, Nummern 4.1 bis 4.12. |
| `extrema-fehler.html` | Achtzehn Einträge, Nummern 4.13 bis 4.26 und Z.1 bis Z.4. |

- [ ] **Schritt 3: Alle vierzehn Wege gehen**

Von `formeln/index.html` aus jede Kachel anklicken, auf jeder Seite die Fußzeile zurück. Auf jeder der dreizehn leeren Seiten: die `.leer`-Zeile steht da, **keine** Filterzeile, **kein** Verzeichnis, Konsole ohne Fehler (F6).

- [ ] **Schritt 4: Die Übersicht bei 390 px prüfen**

`seitlich: 0`, die Kacheln stehen untereinander statt nebeneinander (das Raster aus `ui.css` bringt das mit).

- [ ] **Schritt 5: Commit**

```bash
cd "<REPO>" && git add formeln/ && git commit -m "Uebersicht der Formelsammlung und dreizehn Themengerueste" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01TgEoGocBa7YWZbfWT9TDLs"
```

---

## Aufgabe 5: Eintragen, Dokumente, Wege

Ziel: Die Sammlung ist von der Startseite erreichbar, und die Dokumente beschreiben das Repo richtig.

**Dateien:**
- Ändern: `index.html`, `CLAUDE.md`, `README.md`

- [ ] **Schritt 1: Startseite**

`index.html` hat heute zwei Abschnitte, „Werkzeuge" und „Karten". Dazu kommt ein dritter, **Formelsammlung**, mit **einer** `.kachel` auf `formeln/index.html`. Kacheltitel als `h3`, Text in einem Satz: was die Sammlung ist und dass sie 14 Themen hat, von denen eines gefüllt ist. Dem Muster der bestehenden Abschnitte folgen — dort nachsehen, nicht aus diesem Plan abschreiben.

- [ ] **Schritt 2: `CLAUDE.md` — die Gattung eintragen**

Vier Stellen:

1. Der Einleitungssatz nennt „zwei Gattungen". Es sind jetzt drei: Werkzeuge unter `tools/`, Karten unter `karten/`, die Formelsammlung unter `formeln/`.
2. Der `Aufbau`-Block bekommt `formeln/index.html` und `formeln/<thema>.html`.
3. Die Tabelle „Die geteilten Bausteine" bekommt zwei Zeilen: `shared/formeln.css` und `shared/formeln.js` mit `MT.formeln.start()`.
4. Ein neuer Abschnitt **„Einen Formeleintrag schreiben"** nach „Eine Karte schreiben": das `article.eintrag`-Gerüst, die Pflichtteile (`h3` mit `.quelle`, Formel) und die Kür (`.bedingung`, `data-suche`, `.querlink`), die Regel „eine Zeile Bedingung, kein Beispiel — das gehört auf die Karte", und der Hinweis, dass `karten.css` auf Formelseiten **nicht** geladen wird.

Dazu die „Bekannte Grenzen"-Liste: der Eintrag „Zwanzig Farbliterale" wird zu **sechsundzwanzig** — die sechs Zeilen der Druckpalette in `formeln.css` kommen dazu. Grund dazuschreiben: die Palette gehört zum Druck-Stylesheet der Sammlung und wird mit ihm gelesen, genau wie ihr Gegenstück in `karten.css`.

- [ ] **Schritt 3: `README.md`**

Eine Zeile für die Formelsammlung in der passenden Tabelle, zwei Zeilen für die neuen Bausteine. **Die Datei erst lesen**, dann ergänzen — nicht aus diesem Plan schreiben.

- [ ] **Schritt 4: Datensuche**

Das Suchmuster steht **nicht** im Repo — es deckt den Klarnamen des Eigners, seine Mailadresse und lokale Pfadfragmente ab und wird außerhalb zusammengestellt. Ein Muster, das sich selbst verschleiert, blendet die Suche.

Muster außerhalb des Repos zusammenstellen, an einer Positivkontrolle prüfen, dann:

```bash
cd "<REPO>" && git ls-files -z | xargs -0 grep -niEf <musterdatei>
```

Erwartet: kein Treffer. Die Ausgabe zitieren.

- [ ] **Schritt 5: Alle Wege gehen**

Startseite → Formelsammlung → Musterthema → zurück zur Übersicht → zurück zur Startseite. Dazu von der Übersicht aus eine leere Themenseite und zurück. Auf jeder Seite Konsole ohne Fehler.

Die Pfadtiefen gegenprüfen: In `formeln/*.html` steht `../shared/…`, `../favicon.svg`, `../index.html`; in `index.html` steht `formeln/index.html`. Ein Blick in eine Kartenseite bestätigt dieselbe Tiefe — Playwright kann `file://` hier nicht öffnen, deshalb wird die Gleichheit der Pfadtiefe geprüft, nicht der Doppelklick selbst. **Den Doppelklick meldet der Plan als offenen Punkt an den Nutzer**, damit er ihn einmal selbst macht.

- [ ] **Schritt 6: Commit**

```bash
cd "<REPO>" && git add index.html CLAUDE.md README.md && git commit -m "Formelsammlung eintragen, Dokumente nachziehen" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01TgEoGocBa7YWZbfWT9TDLs"
```

- [ ] **Schritt 7: Push ist nicht Teil dieser Aufgabe**

Der Push veröffentlicht auf ein öffentliches Remote und geht an den Nutzer, sobald alle Aufgaben geprüft sind.

---

## Selbstprüfung dieses Plans

**Spec-Abdeckung.** Gattung und Ort → 4, 5; Übersichtsseite → 4; Aufbau einer Themenseite → 1, 4; der Eintrag samt `.quelle`, `.bedingung`, `data-suche`, `.querlink` → 1, 3; `shared/formeln.js` mit Verzeichnis, Filter, Verhalten ohne JavaScript → 2; `shared/formeln.css` samt Breiten, Scrollkasten und Klammern → 1, 3; Druck → 1, 2, 3; Eintragen und Wege → 5; Prüfliste der Spec → Prüfroutine F; „diese Runde baut" → alle fünf Aufgaben.

**Typkonsistenz.** `MT.formeln.start()` wird in Aufgabe 2 definiert und in den Aufgaben 2 und 4 unter genau diesem Namen aufgerufen. Die Klassen `.eintrag`, `.quelle`, `.bedingung`, `.fall`, `.matrix`, `.klammer-2z/-3z/-4z`, `.filterzeile`, `.verzeichnis`, `.leer` entstehen in Aufgabe 1 und werden in 2, 3 und 4 unter denselben Namen benutzt. `.leer` hat zwei Verwendungen — die Leermeldung des Filters (Aufgabe 2, `hidden`) und die Auskunft einer ungefüllten Seite (Aufgabe 4, sichtbar); beide sehen gleich aus, das ist Absicht und in Aufgabe 4 vermerkt.

**Abweichung von der Spec, benannt.** Die Spec nennt für die Klammern eine „eigene Klasse"; dieser Plan macht daraus drei — je Zeilenzahl eine —, weil eine Größe für 2, 3 und 4 Zeilen nicht reichen kann.

**Bekannte Lücke.** Der Doppelklick über `file://` lässt sich in dieser Umgebung nicht automatisch prüfen (Playwright blockiert das Protokoll). Aufgabe 5, Schritt 5 prüft stattdessen die Gleichheit der Pfadtiefen und meldet den Doppelklick als offenen Punkt an den Nutzer.
