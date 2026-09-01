# Mathe-Werkzeuge

Kleine Browser-Seiten, die Begriffe aus der Analysis sichtbar machen.
Entstanden neben der Vorlesung Mathematik 2.

**→ [xveyn.github.io/mathe-tools](https://xveyn.github.io/mathe-tools/)**

## Was drin ist

| Werkzeug | Worum es geht |
|---|---|
| [Flächenrechner](tools/flaechenrechner/) | Eine Funktion `z = f(x, y)` als Fläche im Raum, ihre Höhenlinien und die beiden senkrechten Schnitte — gleichzeitig und farblich verknüpft. |

## Wie es gebaut ist

Reines HTML, CSS und JavaScript. Kein Build, keine Abhängigkeiten, kein
npm. Jede Seite läuft genauso gut per Doppelklick aus dem Dateisystem
wie über den Link oben.

```
shared/     gemeinsame Bausteine, hängen am globalen Objekt MT
tools/      ein Ordner je Werkzeug, jeder mit eigener index.html
index.html  die Startseite
```

Die gemeinsamen Bausteine:

| Baustein | Wofür |
|---|---|
| `shared/expr.js` | `MT.expr.compile(term, vars)` — Terme wie `-x^2/4 - y^2/9` in aufrufbare Funktionen übersetzen |
| `shared/canvas.js` | `MT.canvas` — scharfe Zeichenflächen, lineare Achsen, Farben aus dem Stylesheet |
| `shared/plot2d.js` | `MT.plot2d` — Höhenlinien nach Marching Squares, unterbrochene Linienzüge |
| `shared/scene3d.js` | `MT.scene3d` — Projektion in den Raum und Drehen per Maus |
| `shared/theme.css` | Farbtokens und Grundtypografie |
| `shared/ui.css` | Panels, Regler, Chips, Raster |

Eingebunden wird mit klassischen `<script src="…">`-Tags, absichtlich
ohne `type="module"`: Browser blockieren Modul-Importe über `file://`,
und die Seiten sollen ohne Server laufen.

## Ein Werkzeug ergänzen

1. `tools/<name>/index.html` anlegen, `shared/theme.css` und
   `shared/ui.css` einbinden, dazu die gebrauchten `shared/*.js`.
2. Werkzeug-eigenes JavaScript nach `tools/<name>/<name>.js`.
3. Eine Karte in `index.html` ergänzen.

Alle Pfade relativ halten — ein führender `/` bricht sowohl den
Doppelklick als auch die Veröffentlichung.

## Lizenz

MIT, siehe [LICENSE](LICENSE).
