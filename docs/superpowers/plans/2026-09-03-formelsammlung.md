# Formelsammlung Implementierungsplan

> **Für agentische Ausführung:** ERFORDERLICHE SUB-SKILL: `superpowers:subagent-driven-development` (empfohlen) oder `superpowers:executing-plans`, um diesen Plan Aufgabe für Aufgabe abzuarbeiten. Die Schritte nutzen Checkbox-Syntax (`- [ ]`).

**Ziel:** Erst drei geteilte Dinge an ihren Platz holen (Aufgabe 0), dann die dritte Gattung des Repos aufsetzen — `formeln/` mit einer Übersicht aus 14 Kacheln, 14 Themendateien und zwei geteilten Bausteinen. Ein Thema wird vollständig gefüllt (`drehungen-spiegelungen.html`, neun Einträge) und dient als Muster für die dreizehn folgenden Runden.

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
- **Keine Farbliterale in einer Seite.** Farben kommen als `var(--…)`. Die Druckpalette steht nach Aufgabe 0 **einmal** in `shared/theme.css` — `formeln.css` definiert keine eigene.
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

**F2 misst auch das Verzeichnis.** Es liegt außerhalb von `.eintrag` und fällt durch den Selektor oben; seine zwei Spalten sind bei 390 px aber der wahrscheinlichste Überlaufkandidat. Zusätzlich:

```js
() => {
  var nav = document.querySelector('.verzeichnis');
  if (!nav) return 'kein Verzeichnis auf dieser Seite';
  var kasten = nav.getBoundingClientRect(), raus = [];
  nav.querySelectorAll('a').forEach(function (a) {
    var r = a.getBoundingClientRect();
    if (r.right > kasten.right + 0.5) raus.push(a.textContent);
  });
  return { breite: Math.round(kasten.width), ueberstehend: raus,
           hoechsteZeile: Math.max.apply(null, [].map.call(nav.querySelectorAll('li'),
             function (l) { return Math.round(l.getBoundingClientRect().height); })) };
}
```

`ueberstehend` muss leer sein. Steht dort etwas, oder wird `hoechsteZeile` größer als das Dreifache einer Zeilenhöhe, taugt die feste Spaltenzahl bei schmalem Fenster nicht — `columns:2` wird dann durch `column-width:14rem` ersetzt, das die zweite Spalte von selbst fallen lässt.

---

## Aufgabe 0: Drei geteilte Dinge nach `shared/` holen

Ziel: Was die Formelsammlung sonst verdoppeln müsste, steht vorher an einer Stelle. **Keine neue Datei, kein neues Verhalten** — danach sieht jede bestehende Seite auf dem Bildschirm genauso aus wie vorher, und im Druck besser.

Grundlage ist eine Durchsicht des Ist-Zustands vom 2026-09-03. Ihr Kernbefund: **beide Werkzeugseiten laden `shared/karten.css`** (`tools/flaechenrechner/index.html:10`, `tools/schwingung/index.html:10`) und nutzen daraus keine einzige Klasse — der einzige Treffer, `.querlink`, steht in `ui.css`. Sie binden `karten.css` allein wegen des Druckblocks ein. Die Palette ist damit schon heute gattungsübergreifend.

**Dateien:**
- Ändern: `shared/theme.css` (Druckpalette dazu)
- Ändern: `shared/ui.css` (Matrixklammern, `h2.abschnitt`, Druckregeln für `.seitenfuss` und `.querlink`)
- Ändern: `shared/karten.css` (die verschobenen Regeln raus)
- Ändern: `index.html` (seitenlokaler `<style>`-Block raus)

**Schnittstellen:**
- Liefert: `.matrix-rahmen`, `.matrix-klammer`, `.matrix-klammer-3z`, `.matrix-klammer-4z` und `h2.abschnitt` in `ui.css`; die helle Druckpalette in `theme.css` — die Aufgaben 1, 3 und 4 setzen alle vier voraus

- [ ] **Schritt 1: Vorher-Bilder aufnehmen**

Server starten (siehe Prüfroutine F). Von **neun** Seiten je eine Aufnahme im Druckmodus (`emulateMedia({media:'print'})`, Viewport 794×1123) und eine am Bildschirm bei 1280 px:

`index.html`, `karten/index.html`, `karten/partielle-ableitungen.html`, `karten/gradient.html`, `karten/extrema-mit-nebenbedingung.html`, `karten/extremwerte.html`, `karten/differentialgleichungen.html`, `tools/flaechenrechner/index.html`, `tools/schwingung/index.html`.

Dazu die Messwerte, die sich nicht verschieben dürfen:

```js
() => {
  var m = document.querySelector('.matrix-rahmen');
  var h2 = document.querySelector('h2.abschnitt');
  var s = getComputedStyle(document.body);
  return {
    ink: s.color, grund: s.backgroundColor,
    klammer: m ? Math.round(m.firstElementChild.getBoundingClientRect().height * 10) / 10 : null,
    matrix: m ? Math.round(m.querySelector('mtable').getBoundingClientRect().height * 10) / 10 : null,
    h2: h2 ? getComputedStyle(h2).fontFamily + ' / ' + getComputedStyle(h2).fontSize +
             ' / ' + getComputedStyle(h2).color + ' / ' + getComputedStyle(h2).marginTop : null
  };
}
```

- [ ] **Schritt 2: Die Druckpalette nach `theme.css` verschieben**

Aus dem `@media print`-Block von `shared/karten.css` den `:root{…}`-Block und die `body`-Zeile **entfernen** (heute `karten.css:180-186`) und in `shared/theme.css` ans Dateiende setzen:

```css
/* ---- Druck ----
   Die helle Palette steht hier und nicht in einer Gattungsdatei, weil sie fuer
   jede Seite gilt: Karten, Werkzeuge, Formelsammlung und die beiden
   Uebersichten. Sie definiert Tokens um — die Farbliterale sind die
   dokumentierte Ausnahme, siehe "Bekannte Grenzen" in CLAUDE.md.

   Bis zum 2026-09-03 stand sie im Druckblock von karten.css. Die beiden
   Werkzeugseiten luden karten.css ausschliesslich deswegen, und index.html
   sowie karten/index.html luden es gar nicht — sie druckten hellblauen Text
   auf weissem Grund. */
@media print{
  :root{
    --ink:#111; --dim:#555; --edge:#bbb;
    --panel-a:transparent; --panel-b:transparent;
    --grid:#ddd; --axis:#666;
    --gold:#8a6300; --mint:#0a7d6c; --rose:#a4457a;
  }
  body{ background:#fff; color:#111; }
}
```

Die übrigen Regeln des Druckblocks in `karten.css` bleiben, wo sie sind — sie betreffen `.karte`, `.abfrage-leiste`, `.aufdecken`, den Abfragemodus, `.formel`/`.beispiel` und `.bild`.

- [ ] **Schritt 3: Die Druckregeln für `.seitenfuss` und `.querlink` nach `ui.css` verschieben**

Beide Bausteine stehen in `ui.css:148-156`, ihre Druckregeln aber in `karten.css`: `.seitenfuss{ display:none !important; }` samt Kommentar und `a.querlink::after,.querlink a::after{ content:" (" attr(href) ")"; … }`. Zeilen und Kommentar nach `ui.css` verschieben, in einen eigenen `@media print`-Block am Dateiende. Danach gilt beides auch für die Formelseiten, ohne dass `formeln.css` es wiederholen muss.

- [ ] **Schritt 4: Die Matrixklammern nach `ui.css` verschieben und ergänzen**

`.matrix-rahmen` und `.matrix-klammer` samt ihrem Erklärkommentar aus `karten.css:100-106` nach `ui.css` verschieben und dort zwei Größen ergänzen. Die Werte für drei und vier Zeilen sind **Startwerte** und werden in Aufgabe 1 und 3 gemessen:

```css
.matrix-rahmen{display:inline-flex;align-items:center}
.matrix-klammer{font-size:3.8em}      /* zwei Zeilen, an der Hesse-Matrix gemessen */
.matrix-klammer-3z{font-size:5.4em}   /* Startwert, in Aufgabe 3 zu messen */
.matrix-klammer-4z{font-size:7em}     /* Startwert, in Aufgabe 1 zu messen */
```

`karten/extremwerte.html` wird **nicht** angefasst: es benutzt `.matrix-rahmen` und `.matrix-klammer` weiter, jetzt aus `ui.css`.

- [ ] **Schritt 5: `h2.abschnitt` nach `ui.css` verschieben**

Den `<style>`-Block aus `index.html:10-15` entfernen und die Regel unverändert nach `ui.css` übernehmen, zu den anderen Katalogbausteinen (`.katalog`, `.kachel`). Die Startseite hat danach keinen eigenen `<style>` mehr.

- [ ] **Schritt 6: Nachher-Bilder und Vergleich**

Dieselben neun Seiten, dieselben Messwerte wie in Schritt 1.

**Sollwerte:**
- Am Bildschirm: `ink`, `grund`, `klammer`, `matrix` und `h2` sind **unverändert**. Jede Abweichung ist ein Fehler, kein Fortschritt.
- Die Hesse-Matrix auf `karten/extremwerte.html`: `klammer` und `matrix` auf zehntel Pixel genau wie vorher.
- Im Druck: die fünf Kartenseiten und beide Werkzeuge unverändert hell, Fußzeile weg, Querlinks mit URL. **`index.html` und `karten/index.html` sind jetzt ebenfalls hell** — vorher standen sie in `--ink` (`#D6E8EF`) auf Weiß. Das ist die eine beabsichtigte Änderung, und sie ist im Commit zu nennen.
- Konsole auf allen neun Seiten ohne Fehler.

- [ ] **Schritt 7: Commit**

```bash
cd "<REPO>" && git add shared/theme.css shared/ui.css shared/karten.css index.html && git commit -m "Druckpalette, Matrixklammern und Abschnittsueberschrift nach shared/ holen" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01TgEoGocBa7YWZbfWT9TDLs"
```

---

## Aufgabe 1: Der Baustein `shared/formeln.css` und die ersten zwei Einträge

Ziel: Die Gestalt steht, geprüft an den beiden Extremen — einer schmalen 2×2-Matrix und der breitesten Formel des Themas, der 4×4-Matrix der Fourier-Transformation.

**Dateien:**
- Erstellen: `shared/formeln.css`
- Erstellen: `formeln/drehungen-spiegelungen.html` (zunächst mit zwei Einträgen)

**Schnittstellen:**
- Nutzt: `shared/theme.css` (Tokens `--ink --dim --edge --panel-a --panel-b --gold`), `shared/ui.css` (`.wrap`, `.querlink`, `.seitenfuss`)
- Nutzt zusätzlich aus Aufgabe 0: `.matrix-rahmen`, `.matrix-klammer`, `.matrix-klammer-4z` und die Druckpalette
- Liefert: die Klassen `.eintrag`, `.quelle`, `.bedingung`, `.fall`, `.filterzeile`, `.verzeichnis`, `.leer` — Aufgabe 2, 3 und 4 bauen darauf auf

- [ ] **Schritt 1: `shared/formeln.css` schreiben**

```css
/* Bausteine der Formelsammlung: Eintrag, Verzeichnis, Filterzeile, Druck.

   Diese Datei wird NIE zusammen mit shared/karten.css geladen. Was beide
   Gattungen brauchen, steht seit Aufgabe 0 eine Ebene tiefer und gilt hier von
   selbst: die helle Druckpalette in theme.css, die Matrixklammern
   (.matrix-rahmen, .matrix-klammer, .matrix-klammer-3z, .matrix-klammer-4z),
   die Abschnittsueberschrift h2.abschnitt und die Druckregeln fuer .seitenfuss
   und .querlink in ui.css.

   Diese Datei enthaelt deshalb KEIN einziges Farbliteral — auch nicht im
   Druckblock. Was dort hell werden muss, wird es ueber die Tokens.

   Was hier steht und in karten.css sein Gegenstueck hat, ist die Spaltenbreite
   von 46rem: auf Kartenseiten kommt sie von .karte, nicht von .wrap (das
   1320 px breit ist). .querlink braucht sie nicht — fuer ihn steht sie schon
   in ui.css. */

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

/* Eng gefasst statt global, wie ui.css es bei .glied-felder haelt: nur diese
   zwei Elemente werden ueber die hidden-Eigenschaft geschaltet. */
.eintrag[hidden], .verzeichnis li[hidden]{display:none}

.filterzeile{max-width:46rem;margin:0 0 14px}
.filterzeile input{
  width:100%;box-sizing:border-box;
  background:var(--panel-b);border:1px solid var(--edge);border-radius:2px;
  color:var(--ink);font-family:inherit;font-size:.95rem;padding:7px 11px;
}
.filterzeile input:focus{border-color:var(--gold);outline:none}
.filterzeile input:focus-visible{outline:2px solid currentColor;outline-offset:4px}

.verzeichnis{max-width:46rem;margin:0 0 22px}
.verzeichnis ul{list-style:none;margin:0;padding:0;columns:2;column-gap:24px}
.verzeichnis li{margin:0 0 3px;break-inside:avoid}
.verzeichnis a{color:var(--gold);text-decoration:none;font-size:.9rem}
.verzeichnis a:hover{text-decoration:underline}
.verzeichnis a:focus-visible{outline:2px solid currentColor;outline-offset:4px}

.leer{max-width:46rem;color:var(--dim);font-size:.9rem;margin:0 0 12px}

/* .seitenfuss kommt aus ui.css und hat dort keine Breite. Auf den Kartenseiten
   gibt karten.css sie ihr; hier muss es diese Datei tun. */
.seitenfuss{max-width:46rem}

/* ---- Teil 3: der Druck ----
   Die Palette steht in theme.css, die Regeln fuer .seitenfuss und .querlink in
   ui.css. Hier steht nur, was der Formelsammlung eigen ist. */

@media print{
  .filterzeile{ display:none !important; }
  /* Das Verzeichnis bleibt: auf Papier ist es das Inhaltsverzeichnis des Blattes. */
  .eintrag{ break-inside:avoid; background:none; }
  /* Auf Papier gibt es kein Scrollen; ein Kasten schnitte lautlos ab. */
  .eintrag math[display="block"], .eintrag p{ overflow:visible; }
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
        <mrow class="matrix-rahmen">
          <mo class="matrix-klammer">(</mo>
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
          <mo class="matrix-klammer">)</mo>
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
        <mrow class="matrix-rahmen">
          <mo class="matrix-klammer-4z">(</mo>
          <mtable>
            <mtr><mtd><mn>1</mn></mtd><mtd><mn>1</mn></mtd><mtd><mn>1</mn></mtd><mtd><mn>1</mn></mtd></mtr>
            <mtr><mtd><mn>1</mn></mtd><mtd><mo>&#x2212;</mo><mi>i</mi></mtd><mtd><mo>&#x2212;</mo><mn>1</mn></mtd><mtd><mi>i</mi></mtd></mtr>
            <mtr><mtd><mn>1</mn></mtd><mtd><mo>&#x2212;</mo><mn>1</mn></mtd><mtd><mn>1</mn></mtd><mtd><mo>&#x2212;</mo><mn>1</mn></mtd></mtr>
            <mtr><mtd><mn>1</mn></mtd><mtd><mi>i</mi></mtd><mtd><mo>&#x2212;</mo><mn>1</mn></mtd><mtd><mo>&#x2212;</mo><mi>i</mi></mtd></mtr>
          </mtable>
          <mo class="matrix-klammer-4z">)</mo>
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

Die Werte `3.8em` und `7em` stehen seit Aufgabe 0 in `shared/ui.css`; `7em` ist ein Startwert, keine Messung. `3.8em` ist an der Hesse-Matrix gemessen und wird **nicht** angefasst — es hängt `karten/extremwerte.html` mit dran. Für jede Matrix auf der Seite:

```js
() => {
  var aus = [];
  document.querySelectorAll('.matrix-rahmen').forEach(function (m) {
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

**Sollwert:** `verhaeltnis` zwischen 1,00 und 1,15 — die Klammer ist so hoch wie die Matrix oder eine Spur höher. `obenUeber` und `untenUeber` liegen zwischen 0 und 4 px und unterscheiden sich um höchstens 2 px voneinander (die Klammer sitzt mittig). `.matrix-klammer-4z` in `shared/ui.css` so lange anpassen, bis das für die 4×4-Matrix gilt, und den gemessenen Endwert als Kommentar danebenschreiben. Für `.matrix-klammer` (2 Zeilen) ist die Messung eine **Kontrolle**: kommt sie nicht auf ein Verhältnis zwischen 1,00 und 1,15, ist in Aufgabe 0 etwas verrutscht. `.matrix-klammer-3z` wird in Aufgabe 3 gemessen.

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

## Aufgabe 3: Die sieben übrigen Einträge des Musterthemas

Ziel: `drehungen-spiegelungen.html` ist vollständig — neun Einträge, die Nummern 3.35 bis 3.42 der Inhaltsaufnahme einschließlich 3.40a.

**Dateien:**
- Ändern: `formeln/drehungen-spiegelungen.html`
- Ändern: `shared/ui.css` (nur `.matrix-klammer-3z`, nach Messung)

**Schnittstellen:**
- Nutzt: alles aus Aufgabe 1 und 2

- [ ] **Schritt 1: Die Skriptseiten als Bild lesen**

**Nicht aus extrahiertem Text abschreiben** — die Extraktion verstümmelt Formeln. Zu lesen sind die Seiten **82, 83, 84 und 85** von SKRIPT, mit dem Read-Werkzeug und `pages: "82-85"`. Von dort stammen alle Matrizen dieser Aufgabe.

- [ ] **Schritt 2: Die sieben Einträge schreiben**

Reihenfolge auf der Seite (die beiden vorhandenen an ihrer Stelle eingeordnet):

| Reihenfolge | `id` | Titel | Quelle |
|---|---|---|---|
| 1 | `orthogonal-und-unitaer` | Orthogonale und unitäre Matrizen | Skript S. 82 |
| 2 | `spalten-bilden-onb` | Prüfung: die Spalten bilden eine ONB | Skript S. 82 |
| 3 | `verzerrungsfrei` | Was orthogonale Abbildungen erhalten | Skript S. 83 |
| 4 | `drehung-in-der-ebene` | Drehung in der Ebene *(steht bereits)* | Skript S. 67, 83 |
| 5 | `spiegelung-in-der-ebene` | Spiegelungen in der Ebene | Skript S. 83 |
| 6 | `drehungen-im-raum` | Drehungen und Spiegelungen im Raum | Skript S. 84 |
| 7 | `drehung-um-y-und-x-achse` | Drehung um die y- und die x-Achse | nicht im Skript |
| 8 | `determinante-plus-minus-eins` | Determinante einer orthogonalen Matrix | nicht im Skript |
| 9 | `unitaere-beispiele` | Unitäre Beispiele *(steht bereits)* | Skript S. 84, 85 |

Inhalt je Eintrag — Formeln nach dem Muster aus Aufgabe 1, Klammern über `.matrix-rahmen` und die passende `.matrix-klammer…`:

1. **`orthogonal-und-unitaer`** — Bedingung: „A regulär". Zwei Formelzeilen: `A⁻¹ = Aᵀ` (orthogonal, über ℝ) und `A⁻¹ = A̅ᵀ` (unitär, über ℂ). Dazu eine `.fall`-Zeile „A̅ᵀ heißt adjungierte Matrix". Die Konjugation als `<mover><mi>A</mi><mo>&#xAF;</mo></mover>`, transponiert als `<msup>…<mi>T</mi></msup>`. `data-suche="adjungiert transponiert konjugiert"`.
2. **`spalten-bilden-onb`** — Bedingung: „gilt in beide Richtungen". Formel `A·Aᵀ = E` beziehungsweise `A·A̅ᵀ = E`, dazu die `.fall`-Zeile: „Damit prüft man Orthogonalität, ohne die Inverse zu bestimmen." Zweiter Satz als Fließtext in `.fall`: „Gleichwertig: die Spaltenvektoren (und ebenso die Zeilenvektoren) bilden eine Orthonormalbasis." `data-suche="onb orthonormalbasis pruefung einheitsmatrix"`.
3. **`verzerrungsfrei`** — Bedingung: „A orthogonal oder unitär". Drei Formeln untereinander: `(Av)·(Aw) = v·w`, `‖Av‖ = ‖v‖`, und `v·w = 0 ⟹ (Av)·(Aw) = 0`. `data-suche="norm skalarprodukt winkel laengentreu"`.
4. *(steht bereits)*
5. **`spiegelung-in-der-ebene`** — Bedingung: „Spiegelung an einer Geraden durch den Ursprung, die gegenüber der x-Achse um α geneigt ist". Drei 2×2-Matrizen: `Sx = ((1,0),(0,−1))` an der x-Achse, `Sy = ((−1,0),(0,1))` an der y-Achse, `Sα = ((cos2α, sin2α),(sin2α, −cos2α))` allgemein. Dazu `.fall`: „Für α = 0 wird daraus Sx, für α = π/2 wird daraus Sy." `data-suche="achsenspiegelung winkelhalbierende"`.
6. **`drehungen-im-raum`** — Bedingung: „gegen den Uhrzeigersinn, um den Ursprung". **Genau die drei Matrizen, die auf Skriptseite 84 stehen**, je mit einer `.fall`-Zeile davor: Drehung in der x,y-Ebene, also um die z-Achse, `((cos α,−sin α,0),(sin α,cos α,0),(0,0,1))`; Spiegelung an der x,z-Ebene `diag(1,−1,1)`; Drehspiegelung `((cos α,0,−sin α),(0,−1,0),(sin α,0,cos α))`. `data-suche="raumdrehung z-achse drehspiegelung"`.
7. **`drehung-um-y-und-x-achse`** — Quelle `nicht im Skript`, Bedingung: „im Skript steht nur die z-Achse; Bemerkung 3.9.4 nennt diese Beispiele ausdrücklich einen Spezialfall". Zwei 3×3-Matrizen: um die y-Achse `((cos α,0,sin α),(0,1,0),(−sin α,0,cos α))`, um die x-Achse `((1,0,0),(0,cos α,−sin α),(0,sin α,cos α))`. `.fall`: „Aufgabe LA 35b verlangt die y-Achse, Aufgabe LA 60b die x-Achse." `data-suche="raumdrehung y-achse x-achse"`.

   **Vorzeichen selbst prüfen, nicht abschreiben:** Diese beiden Matrizen stehen in keiner Quelle des Repos. Die Probe ist billig — bei α = π/2 muss die y-Drehung `e₃` auf `e₁` werfen und `e₁` auf `−e₃`, die x-Drehung `e₂` auf `e₃`. Rechne sie einmal von Hand nach und halte das Ergebnis im Bericht fest.
8. **`determinante-plus-minus-eins`** — Quelle `nicht im Skript`, Bedingung: „Folgerung aus A·Aᵀ = E; in Aufgabe LA 40j verlangt". Formel: `det(A) = ±1` für reelle orthogonale A. `.fall`: „Die Umkehrung gilt **nicht** — Determinante ±1 macht eine Matrix nicht orthogonal." `data-suche="determinante orthogonal umkehrung"`.
9. *(steht bereits)*

- [ ] **Schritt 3: `.matrix-klammer-3z` messen**

Mit dem Messcode aus Aufgabe 1, Schritt 4. Jetzt stehen 3×3-Matrizen auf der Seite; `verhaeltnis` zwischen 1,00 und 1,15, `obenUeber` und `untenUeber` je 0 bis 4 px. Den gefundenen Wert in **`shared/ui.css`** eintragen (dort steht die Klasse seit Aufgabe 0) und als Kommentar die Messung dazuschreiben.

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

  <h2 class="abschnitt">Integralrechnung</h2>
  <div class="katalog">
    <a class="kachel" href="integral-grundlagen.html">
      <h3>Grundlagen und Hauptsatz</h3>
      <p>Ober- und Untersumme, Fläche, Hauptsatz, Grundintegrale, uneigentliche Integrale. 13 Einträge.</p>
      <em>noch nicht gefüllt</em>
    </a>
    <!-- zweite Kachel dieses Kapitels -->
  </div>

  <!-- drei weitere h2 mit ihren Rastern -->

  <p class="seitenfuss"><a href="../index.html">&#x2190; Zurück zur Startseite</a></p>

</div>
</body>
</html>
```

Kein `<script>`: die Übersicht trägt keine Einträge und braucht weder Filter noch Verzeichnis.

**Die vier Kapitelüberschriften tragen `class="abschnitt"`.** Die Regel dazu steht seit Aufgabe 0 in `ui.css`; ein blankes `<h2>` gibt es im Repo nirgends gestaltet und fiele auf die Browservorgabe zurück (1.5em fett, serifenlos) — die Formelübersicht sähe in derselben Rolle anders aus als die Startseite.

**Das `<em>` steht hinter dem `<p>`, nicht darin** — so halten es alle zwölf bestehenden Kacheln (`index.html:28,33,42,47,52,57,62`, `karten/index.html:21,26,31,36,41`). Inline im Satz stünde es größer als der Satz selbst, weil `.kachel em` mit `.95rem` gegen `.kachel p` mit `.88rem` steht (`ui.css:122-125`).

Die vierzehn Kacheln, gruppiert — die dreizehn noch leeren tragen die `<em>`-Zeile, `drehungen-spiegelungen.html` nicht:

| Überschrift | Datei | Kacheltitel | Einträge |
|---|---|---|---|
| Integralrechnung | `integral-grundlagen.html` | Grundlagen und Hauptsatz | 14 |
|  | `integral-verfahren.html` | Verfahren und Partialbrüche | 9 |
| Differentialgleichungen | `dgl-erster-ordnung.html` | Erster Ordnung | 5 |
|  | `dgl-zweiter-ordnung.html` | Zweiter Ordnung | 9 |
| Lineare Algebra | `endliche-koerper.html` | Endliche Körper und Restklassen | 7 |
|  | `vektorraeume-rang.html` | Vektorräume, Abbildungen, Rang | 18 |
|  | `skalarprodukt.html` | Skalarprodukt und Orthogonalität | 5 |
|  | `determinante-inverse.html` | Determinante und Inverse | 8 |
|  | `drehungen-spiegelungen.html` | Drehungen und Spiegelungen | 9 |
|  | `eigenwerte.html` | Eigenwerte und Eigenvektoren | 10 |
|  | `basiswechsel-zerlegungen.html` | Basiswechsel und Zerlegungen | 12 |
|  | `homogene-koordinaten.html` | Homogene Koordinaten | 6 |
| Funktionen mehrerer Variablen | `ableitungen-gradient.html` | Partielle Ableitungen und Gradient | 14 |
|  | `extrema-fehler.html` | Extrema, Fehler, kleinste Quadrate | 18 |

`.kachel em` ist in `ui.css` bereits gestaltet.

Am Fuß `<p class="seitenfuss"><a href="../index.html">← Zurück zur Startseite</a></p>` — derselbe Wortlaut wie in `karten/index.html:45`.

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

  <p class="leer">Dieses Thema ist noch nicht gefüllt. Was hineingehört, steht in der
    Inhaltsaufnahme unter docs/superpowers/specs/.</p>

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
| `integral-grundlagen.html` | Vierzehn Einträge nach der Inhaltsaufnahme, Nummern 1.1 bis 1.13, 1.23. |
| `integral-verfahren.html` | Neun Einträge nach der Inhaltsaufnahme, Nummern 1.14 bis 1.22. |
| `dgl-erster-ordnung.html` | Fünf Einträge nach der Inhaltsaufnahme, Nummern 2.1 bis 2.4, 2.14. |
| `dgl-zweiter-ordnung.html` | Neun Einträge nach der Inhaltsaufnahme, Nummern 2.5 bis 2.13. |
| `endliche-koerper.html` | Sieben Einträge nach der Inhaltsaufnahme, Nummern 3.1 bis 3.7. |
| `vektorraeume-rang.html` | Achtzehn Einträge nach der Inhaltsaufnahme, Nummern 3.8 bis 3.21d. |
| `skalarprodukt.html` | Fünf Einträge nach der Inhaltsaufnahme, Nummern 3.22 bis 3.26. |
| `determinante-inverse.html` | Acht Einträge nach der Inhaltsaufnahme, Nummern 3.27 bis 3.34. |
| `eigenwerte.html` | Zehn Einträge nach der Inhaltsaufnahme, Nummern 3.43 bis 3.52. |
| `basiswechsel-zerlegungen.html` | Zwölf Einträge nach der Inhaltsaufnahme, Nummern 3.53 bis 3.63. |
| `homogene-koordinaten.html` | Sechs Einträge nach der Inhaltsaufnahme, Nummern 3.64 bis 3.69. |
| `ableitungen-gradient.html` | Vierzehn Einträge nach der Inhaltsaufnahme, Nummern 4.1 bis 4.12. |
| `extrema-fehler.html` | Achtzehn Einträge nach der Inhaltsaufnahme, Nummern 4.13 bis 4.26, Z.1 bis Z.4. |

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

Ziel: Die Sammlung ist von der Startseite erreichbar, und die Dokumente beschreiben das Repo richtig. Die Stellen sind gezählt, nicht geschätzt — sie stammen aus einer Durchsicht des Ist-Zustands vom 2026-09-03.

**Dateien:**
- Ändern: `index.html`, `CLAUDE.md`, `README.md`

- [ ] **Schritt 1: Startseite**

`index.html` hat heute zwei Abschnitte, „Werkzeuge" und „Karten", beide mit `<h2 class="abschnitt">`. Dazu kommt ein dritter, **Formelsammlung**, mit **einer** `.kachel` auf `formeln/index.html`.

Aufbau der Kachel wie die sieben bestehenden: `h3` als Titel, ein `<p>` mit einem Satz — und **dahinter, nicht darin**, eine `<em>`-Schlusszeile, wie sie alle bestehenden Kacheln tragen (`index.html:28,33,42,47,52,57,62`). Inhalt der `<em>`-Zeile hier: dass von vierzehn Themen bisher eines gefüllt ist.

**Dazu die Fußzeile.** `index.html:65` verweist heute mit „Alle Themen im Überblick" auf `karten/index.html`. Mit einer zweiten Themenübersicht wird das zweideutig — der Text muss sagen, welche Themen gemeint sind (etwa „Alle Kartenthemen im Überblick").

- [ ] **Schritt 2: `CLAUDE.md`**

Elf Stellen, alle geprüft. Die Zeilennummern sind der Stand vor dieser Runde und können sich durch die vorigen Schritte verschoben haben — nach der Stelle suchen, nicht blind zählen.

| # | Stelle | Was zu tun ist |
|---|---|---|
| 1 | `:4-6` | „Zwei Gattungen" → drei, mit `formeln/` |
| 2 | `:30-36` | Die Liste der eingeführten `MT`-Namen bekommt `MT.formeln.start()` |
| 3 | `:47-55` | Der `Aufbau`-Block bekommt `formeln/index.html` und `formeln/<thema>.html`; die Startseitenzeile nennt jetzt drei Abschnitte |
| 4 | `:59-70` | Die Bausteintabelle bekommt `shared/formeln.css` und `shared/formeln.js`; der Eintrag zu `ui.css` nennt zusätzlich die Matrixklammern und `h2.abschnitt`, der zu `theme.css` die Druckpalette |
| 5 | `:62` | Die Begründung für `.katalog`/`.kachel`/`.seitenfuss` nennt „Startseite und Kartenübersicht" — jetzt auch die Formelübersicht |
| 6 | `:122-124` | „Diese vier Namen nicht vermischen" → fünf, mit `.eintrag` |
| 7 | nach `:161` | Neuer Abschnitt **„Einen Formeleintrag schreiben"** (siehe unten) |
| 8 | `:196-201` | Die Scrollkasten-Regel gilt jetzt auch für `.eintrag math[display="block"]` und `.eintrag p` in `formeln.css` |
| 9 | `:268` | „Bei Karten: Sind die Formeln gesetzt…" — der MathML-Test gilt für Formelseiten genauso; der Abfragemodus-Test (`:312`) nicht |
| 10 | `:369-387` | Die Farbliteral-Zählung (siehe Schritt 4) |
| 11 | `:392-401` | Der Eintrag zu den handbemessenen Matrixklammern: sie stehen jetzt in `ui.css`, es sind drei Größen, und die neuen zwei sind gemessen |

Der neue Abschnitt **„Einen Formeleintrag schreiben"** enthält: das `article.eintrag`-Gerüst, die Pflichtteile (`h3` mit `.quelle`, Formel) und die Kür (`.bedingung`, `data-suche`, `.querlink`), die Regel „eine Zeile Bedingung, kein Beispiel — das gehört auf die Karte", dass `karten.css` auf Formelseiten **nicht** geladen wird, und dass eine neue Themendatei an **einer** Stelle einzutragen ist (`formeln/index.html`), nicht an zweien wie eine Karte.

- [ ] **Schritt 3: `README.md`**

Sechs Stellen, ebenfalls geprüft:

| # | Stelle | Was zu tun ist |
|---|---|---|
| 1 | `:4-5` | „Zwei Gattungen" → drei |
| 2 | nach `:26` | Ein dritter Block **Formelsammlung** mit eigener Tabelle, wie die Blöcke für Werkzeuge und Karten |
| 3 | `:28-29` | „Alle fünf sind auch von der Startseite aus erreichbar … `karten/index.html`, das alle Themen im Überblick zeigt" — mit `formeln/index.html` zweideutig |
| 4 | `:37-43` | Der Verzeichnisbaum kennt `formeln/` nicht |
| 5 | `:42` | „Arbeitsregeln und Bauplan für Werkzeuge und Karten" → und Formeleinträge |
| 6 | `:47-58` | Die Bausteintabelle: zwei neue Zeilen |

**Die Datei erst lesen**, dann ergänzen — nicht aus diesem Plan schreiben.

- [ ] **Schritt 4: Die Farbliterale ehrlich neu zählen**

`CLAUDE.md:369` behauptet heute „Zwanzig Farbliterale": 6 (Druckpalette in `karten.css`) + 8 (`ui.css`) + 6 (`flaechenrechner.js`). Die Zählung war schon vorher unvollständig — `karten.css` enthält im Druckblock zusätzlich `#fff`, `#111`, `#bbb` und `#555`, die keiner der drei Posten erfasst.

Nach Aufgabe 0 hat sich die Verteilung ohnehin verschoben: die Palette steht in `theme.css`, die Regeln für `.seitenfuss` und `.querlink` in `ui.css`. **Neu zählen, Posten für Posten, mit Dateinamen und Zeilenzahl**, und die Zählgrundlage danebenschreiben (zählt jedes Literal oder nur die Tokendefinitionen?). `formeln.css` steuert **null** bei — das ist eine Aussage, die man prüfen kann:

```bash
cd "<REPO>" && grep -nE "#[0-9a-fA-F]{3,8}\b|rgba?\(" shared/formeln.css
```

Erwartet: keine Ausgabe.

- [ ] **Schritt 5: Datensuche**

Das Suchmuster steht **nicht** im Repo — es deckt den Klarnamen des Eigners, seine Mailadresse und lokale Pfadfragmente ab und wird außerhalb zusammengestellt. Ein Muster, das sich selbst verschleiert, blendet die Suche.

Muster außerhalb des Repos zusammenstellen, an einer Positivkontrolle prüfen, dann:

```bash
cd "<REPO>" && git ls-files -z | xargs -0 grep -niEf <musterdatei>
```

Erwartet: kein Treffer. Die Ausgabe zitieren.

- [ ] **Schritt 6: Alle Wege gehen**

Startseite → Formelsammlung → Musterthema → zurück zur Übersicht → zurück zur Startseite. Dazu von der Übersicht aus eine leere Themenseite und zurück. Auf jeder Seite Konsole ohne Fehler.

Die Pfadtiefen gegenprüfen: In `formeln/*.html` steht `../shared/…`, `../favicon.svg`, `../index.html`; in `index.html` steht `formeln/index.html`. Ein Blick in eine Kartenseite bestätigt dieselbe Tiefe — Playwright kann `file://` hier nicht öffnen, deshalb wird die Gleichheit der Pfadtiefe geprüft, nicht der Doppelklick selbst. **Der Doppelklick geht als offener Punkt an den Nutzer.**

- [ ] **Schritt 7: Commit**

```bash
cd "<REPO>" && git add index.html CLAUDE.md README.md && git commit -m "Formelsammlung eintragen, Dokumente nachziehen" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01TgEoGocBa7YWZbfWT9TDLs"
```

- [ ] **Schritt 8: Push ist nicht Teil dieser Aufgabe**

Der Push veröffentlicht auf ein öffentliches Remote und geht an den Nutzer, sobald alle Aufgaben geprüft sind. **Hinweis für den Bericht:** Zum Zeitpunkt der Planerstellung lagen bereits drei unveröffentlichte Commits lokal (Inhaltsaufnahme, Design-Spec, dieser Plan); ein Push nähme sie mit.

---

## Selbstprüfung dieses Plans

**Spec-Abdeckung.** Gattung und Ort → 4, 5; Übersichtsseite → 4; Aufbau einer Themenseite → 1, 4; der Eintrag samt `.quelle`, `.bedingung`, `data-suche`, `.querlink` → 1, 3; `shared/formeln.js` mit Verzeichnis, Filter, Verhalten ohne JavaScript → 2; `shared/formeln.css` samt Breiten, Scrollkasten und Klammern → 1, 3; Druck → 1, 2, 3; Eintragen und Wege → 5; Prüfliste der Spec → Prüfroutine F; „diese Runde baut" → alle fünf Aufgaben.

**Typkonsistenz.** `MT.formeln.start()` wird in Aufgabe 2 definiert und in den Aufgaben 2 und 4 unter genau diesem Namen aufgerufen. Die Klassen `.eintrag`, `.quelle`, `.bedingung`, `.fall`, `.matrix`, `.klammer-2z/-3z/-4z`, `.filterzeile`, `.verzeichnis`, `.leer` entstehen in Aufgabe 1 und werden in 2, 3 und 4 unter denselben Namen benutzt. `.leer` hat zwei Verwendungen — die Leermeldung des Filters (Aufgabe 2, `hidden`) und die Auskunft einer ungefüllten Seite (Aufgabe 4, sichtbar); beide sehen gleich aus, das ist Absicht und in Aufgabe 4 vermerkt.

**Abweichung von der Spec, benannt.** Die Spec nennt für die Klammern eine „eigene Klasse"; dieser Plan macht daraus drei — je Zeilenzahl eine —, weil eine Größe für 2, 3 und 4 Zeilen nicht reichen kann.

**Nachtrag vom 2026-09-03, aus einer kritischen Durchsicht des Ist-Zustands.** Der Plan hatte fünf Annahmen, die nicht stimmten: die Werkzeugseiten laden `karten.css` sehr wohl (damit fiel die Begründung für eine zweite Druckpalette weg), `CLAUDE.md` braucht elf Änderungen statt vier und `README.md` sechs statt zwei, ein blankes `<h2>` ist im Repo nirgends gestaltet, und das `<em>` einer Kachel steht hinter dem `<p>`, nicht darin. Daraus ist Aufgabe 0 entstanden; die Aufgaben 1, 3, 4 und 5 sind entsprechend nachgezogen.

**Zweiter Nachtrag, aus der Prüfung der Inhaltsaufnahme gegen das Skript.** Die Aufnahme zählte drei Einträge doppelt und ließ elf aus; sie führt jetzt 144 statt 136. Vier sachliche Fehler betrafen ausgerechnet das Musterthema und die Nachbarn: die Drehungen um die y- und die x-Achse stehen **nicht** im Skript (nur die z-Achse), die Inversentabelle gibt es dort nur für GF(7), die Drehung um einen Punkt ist bloß ein Aufgabentipp, und die DGL-Aufgaben rechnen in drei Schreibweisen statt in zwei. Aufgabe 3 hat deshalb neun Einträge statt acht, und die Kachel- und lede-Tabellen der Aufgabe 4 sind neu gerechnet.

**Bekannte Lücke.** Der Doppelklick über `file://` lässt sich in dieser Umgebung nicht automatisch prüfen (Playwright blockiert das Protokoll). Aufgabe 5, Schritt 5 prüft stattdessen die Gleichheit der Pfadtiefen und meldet den Doppelklick als offenen Punkt an den Nutzer.
