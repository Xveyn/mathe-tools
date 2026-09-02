/* MT.scene3d — schiefe Parallelprojektion für Flächen über der x-y-Ebene,
   samt Drehen per Zeiger. */

var MT = MT || {};

MT.scene3d = (function(){
"use strict";

/* Die Hoehe wird normiert: der Quader ist immer KASTEN mal Grundflaeche
   hoch (mal der gewaehlten Ueberhoehung), nicht so hoch wie die rohe
   z-Spanne. Ohne das bestimmt allein die z-Spanne den Massstab, denn sie
   waechst bei quadratischen Funktionen mit dem Quadrat des Bereichs, die
   Grundflaeche aber nur linear. Gemessen im Flaechenrechner bei 600 px
   Breite: -4xy fuellte bei Bereich 4 noch 38 px, bei Bereich 8 noch 19;
   fuenf der sechs Beispiele waren durch z begrenzt statt durch die
   Bildbreite. Mathematica (BoxRatios {1,1,0.4}) und matplotlib (4:4:3)
   normieren aus demselben Grund. Preis: das Bild ist in z nicht mehr
   massstabstreu -- deshalb schreibt der Flaechenrechner die z-Spanne als
   Zahl unter das Bild und bietet die Ueberhoehung als Regler an. */
var KASTEN=0.55;

function project(x, y, z, cam){
  var ca=Math.cos(cam.az), sa=Math.sin(cam.az);
  var ce=Math.cos(cam.el), se=Math.sin(cam.el);
  var x1=x*ca-y*sa, y1=x*sa+y*ca;
  /* Auch die Tiefe d muss das normierte z benutzen, sonst sortiert die
     Malerreihenfolge nach einer anderen Geometrie als die gezeichnete. */
  var zw=(z-cam.z0)*cam.zk;
  return { x:cam.cx+x1*cam.s, y:cam.cy-(y1*se+zw*ce)*cam.s, d:y1*ce-zw*se };
}

/* opt.zHoch (Ueberhoehung) und opt.zoom sind freiwillig und stehen ohne
   Angabe auf 1. Bei einer z-Spanne von null bleibt zk null: die Flaeche
   liegt dann flach in halber Hoehe, statt dass eine Division NaN durch das
   ganze Bild traegt. */
function camera(opt){
  var R=opt.range, spanne=opt.zMax-opt.zMin;
  var hoch=(opt.zHoch>0) ? opt.zHoch : 1;
  var zoom=(opt.zoom>0) ? opt.zoom : 1;
  var cam={cx:0, cy:0, s:1, az:opt.az, el:opt.el,
           z0:(opt.zMin+opt.zMax)/2,
           zk:(spanne>1e-12) ? (2*R*KASTEN*hoch)/spanne : 0};
  var Z=[opt.zMin,opt.zMax], pts=[];
  for(var i=0;i<2;i++) for(var j=0;j<2;j++) for(var k=0;k<2;k++)
    pts.push(project(i?R:-R, j?R:-R, Z[k], cam));
  var a=1e9,b=-1e9,c=1e9,d=-1e9;
  pts.forEach(function(p){ a=Math.min(a,p.x); b=Math.max(b,p.x); c=Math.min(c,p.y); d=Math.max(d,p.y); });
  var pad=18;
  cam.s=Math.min((opt.w-2*pad)/(b-a),(opt.h-2*pad)/(d-c))*zoom;
  cam.cx=opt.w/2-((a+b)/2)*cam.s;
  cam.cy=opt.h/2+((c+d)/2)*cam.s;
  return cam;
}

function enableDrag(cv, winkel, beiAenderung){
  var zug=null;
  cv.addEventListener('pointerdown', function(e){
    zug={x:e.clientX, y:e.clientY, az:winkel.az, el:winkel.el};
    cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener('pointermove', function(e){
    if(!zug) return;
    winkel.az = zug.az+(e.clientX-zug.x)*0.008;
    winkel.el = Math.max(0.12, Math.min(1.45, zug.el+(e.clientY-zug.y)*0.006));
    beiAenderung();
  });
  ['pointerup','pointercancel'].forEach(function(ev){
    cv.addEventListener(ev, function(){ zug=null; });
  });
}

/* Mausrad zoomt. Der Wert wird in dasselbe Zustandsobjekt geschrieben, das
   auch der Regler beschreibt, damit es nur einen Zustand gibt. deltaMode 1
   zaehlt Zeilen statt Bildpunkte; ohne die Umrechnung zoomt Firefox um
   Groessenordnungen langsamer als Chromium. */
function enableZoom(cv, zustand, beiAenderung){
  cv.addEventListener('wheel', function(e){
    e.preventDefault();
    var dy=e.deltaY*(e.deltaMode===1 ? 16 : (e.deltaMode===2 ? 300 : 1));
    var z=zustand.zoom*Math.exp(-dy*0.0015);
    zustand.zoom=Math.max(1, Math.min(4, z));
    beiAenderung();
  }, {passive:false});
}

return { camera:camera, project:project, enableDrag:enableDrag, enableZoom:enableZoom };
})();
