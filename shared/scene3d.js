/* MT.scene3d — schiefe Parallelprojektion für Flächen über der x-y-Ebene,
   samt Drehen per Zeiger. */

var MT = MT || {};

MT.scene3d = (function(){
"use strict";

function project(x, y, z, cam){
  var ca=Math.cos(cam.az), sa=Math.sin(cam.az);
  var ce=Math.cos(cam.el), se=Math.sin(cam.el);
  var x1=x*ca-y*sa, y1=x*sa+y*ca;
  return { x:cam.cx+x1*cam.s, y:cam.cy-(y1*se+z*ce)*cam.s, d:y1*ce-z*se };
}

function camera(opt){
  var cam={cx:0, cy:0, s:1, az:opt.az, el:opt.el};
  var R=opt.range, Z=[opt.zMin,opt.zMax], pts=[];
  for(var i=0;i<2;i++) for(var j=0;j<2;j++) for(var k=0;k<2;k++)
    pts.push(project(i?R:-R, j?R:-R, Z[k], cam));
  var a=1e9,b=-1e9,c=1e9,d=-1e9;
  pts.forEach(function(p){ a=Math.min(a,p.x); b=Math.max(b,p.x); c=Math.min(c,p.y); d=Math.max(d,p.y); });
  var pad=18;
  cam.s=Math.min((opt.w-2*pad)/(b-a),(opt.h-2*pad)/(d-c));
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

return { camera:camera, project:project, enableDrag:enableDrag };
})();
