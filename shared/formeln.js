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

  /* Der Titel ohne die Quellenangabe, die in derselben Zeile steht.

     Gearbeitet wird auf einer Kopie, aus der .quelle entfernt wird — nicht mit
     replace() auf dem Text. replace() mit einer Zeichenkette trifft nur das
     erste Vorkommen; enthielte der Titel die Quellenangabe als Teilstueck,
     schnitte es die falsche Stelle heraus und die Quelle bliebe im Verzeichnis
     stehen. Ueber die Kopie ist der Fall bauartbedingt ausgeschlossen. */
  function titel(eintrag){
    var h = eintrag.querySelector("h3");
    if (!h) return "";
    var kopie = h.cloneNode(true);
    var quelle = kopie.querySelector(".quelle");
    if (quelle) quelle.parentNode.removeChild(quelle);
    return text(kopie);
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
      /* Ohne id waere der Sprunglink ein "#" und fuehrte an den Seitenanfang,
         lautlos. Beim Fuellen der uebrigen Themen ist das der wahrscheinlichste
         Fluechtigkeitsfehler, also wird er gemeldet. */
      if (!eintraege[i].id) {
        if (window.console) console.warn("Eintrag ohne id:", titel(eintraege[i]));
        continue;
      }
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
