/* MT.canvas — was jede Zeichenfläche braucht: scharfe Auflösung,
   lineare Achsen, Gitterschritte und die Farben aus dem Stylesheet. */

var MT = MT || {};

MT.canvas = (function(){
"use strict";

function fit(cv, ctx){
  var w=cv.clientWidth, h=cv.clientHeight, dpr=window.devicePixelRatio||1;
  if(cv.width!==Math.round(w*dpr)){ cv.width=Math.round(w*dpr); cv.height=Math.round(h*dpr); }
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,w,h);
  return {w:w,h:h};
}

function linear(vonMin, vonMax, nachMin, nachMax){
  var k=(nachMax-nachMin)/(vonMax-vonMin);
  return function(v){ return nachMin+(v-vonMin)*k; };
}

function tickStep(spanne){
  return Math.pow(10, Math.round(Math.log10(spanne/5)));
}

var zwischenspeicher=null;
function colors(){
  if(zwischenspeicher) return zwischenspeicher;
  var s=getComputedStyle(document.documentElement);
  function v(name){ return s.getPropertyValue(name).trim(); }
  zwischenspeicher={
    gold:v('--gold'), mint:v('--mint'), rose:v('--rose'),
    dim:v('--dim'), grid:v('--grid'), axis:v('--axis'), ink:v('--ink')
  };
  return zwischenspeicher;
}

return { fit:fit, linear:linear, tickStep:tickStep, colors:colors };
})();
