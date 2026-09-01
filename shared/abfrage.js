/* MT.abfrage — verdeckt auf Karteikarten Formel und Beispiel, damit man
   sich selbst abfragen kann. Speichert nichts: der Zustand lebt nur,
   solange die Seite offen ist. Ohne dieses Skript bleibt alles sichtbar. */

var MT = MT || {};

MT.abfrage = (function(){
"use strict";

function start(){
  var schalter = document.getElementById('abfrage-schalter');
  if(!schalter) return;

  schalter.addEventListener('click', function(){
    var an = document.body.classList.toggle('abfrage');
    schalter.setAttribute('aria-pressed', an ? 'true' : 'false');
    schalter.textContent = an ? 'Abfragen beenden' : 'Abfragen';
    if(!an){
      var offen = document.querySelectorAll('.aufgedeckt');
      for(var i=0;i<offen.length;i++) offen[i].classList.remove('aufgedeckt');
    }
  });

  var felder = document.querySelectorAll('[data-verdeckbar]');
  for(var i=0;i<felder.length;i++){
    (function(feld){
      var knopf = document.createElement('button');
      knopf.type = 'button';
      knopf.className = 'aufdecken';
      knopf.textContent = 'aufdecken';
      knopf.addEventListener('click', function(){ feld.classList.add('aufgedeckt'); });
      feld.appendChild(knopf);
    })(felder[i]);
  }
}

return { start: start };
})();
