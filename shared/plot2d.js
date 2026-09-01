/* MT.plot2d — Höhenlinien nach Marching Squares und Linienzüge, die an
   undefinierten Stellen unterbrechen. */

var MT = MT || {};

MT.plot2d = (function(){
"use strict";

function contour(gitter, niveau){
  var segs=[], n=gitter.n, vals=gitter.vals, min=gitter.min, spanne=gitter.max-gitter.min;
  function w(i){ return min+spanne*i/n; }
  function val(i,j){ return vals[i*(n+1)+j]; }
  for(var i=0;i<n;i++){
    for(var j=0;j<n;j++){
      var v=[val(i,j),val(i+1,j),val(i+1,j+1),val(i,j+1)];
      if(v.some(isNaN)) continue;
      var p=[[w(i),w(j)],[w(i+1),w(j)],[w(i+1),w(j+1)],[w(i),w(j+1)]];
      var idx=0;
      for(var k=0;k<4;k++) if(v[k]>niveau) idx|=(1<<k);
      if(idx===0||idx===15) continue;
      var ip=function(a,b){
        var t=(niveau-v[a])/(v[b]-v[a]);
        return [p[a][0]+t*(p[b][0]-p[a][0]), p[a][1]+t*(p[b][1]-p[a][1])];
      };
      var e=[];
      if(((idx>>0)&1)!==((idx>>1)&1)) e.push(ip(0,1));
      if(((idx>>1)&1)!==((idx>>2)&1)) e.push(ip(1,2));
      if(((idx>>2)&1)!==((idx>>3)&1)) e.push(ip(2,3));
      if(((idx>>3)&1)!==((idx>>0)&1)) e.push(ip(3,0));
      for(var m=0;m+1<e.length;m+=2) segs.push([e[m],e[m+1]]);
    }
  }
  return segs;
}

function segments(ctx, segs, X, Y){
  ctx.beginPath();
  for(var i=0;i<segs.length;i++){
    var s=segs[i];
    ctx.moveTo(X(s[0][0]),Y(s[0][1]));
    ctx.lineTo(X(s[1][0]),Y(s[1][1]));
  }
  ctx.stroke();
}

function polyline(ctx, punkte){
  ctx.beginPath();
  var begonnen=false;
  for(var i=0;i<punkte.length;i++){
    var p=punkte[i];
    if(!p){ begonnen=false; continue; }
    if(begonnen) ctx.lineTo(p.x,p.y);
    else { ctx.moveTo(p.x,p.y); begonnen=true; }
  }
  ctx.stroke();
}

return { contour:contour, segments:segments, polyline:polyline };
})();
