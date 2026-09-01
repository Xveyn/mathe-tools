/* Flächenrechner: quadratische Analyse, Zeichnen der vier Ansichten
   und die Verdrahtung der Bedienelemente. */

(function(){
"use strict";

/* ==================== Quadratische Analyse ==================== */

function solve(M,b,n){
  var A=[];
  for(var i=0;i<n;i++) A.push(M[i].slice().concat([b[i]]));
  for(var c=0;c<n;c++){
    var piv=c;
    for(var r=c+1;r<n;r++) if(Math.abs(A[r][c])>Math.abs(A[piv][c])) piv=r;
    if(Math.abs(A[piv][c])<1e-12) return null;
    var tmp=A[c]; A[c]=A[piv]; A[piv]=tmp;
    for(var r2=0;r2<n;r2++){
      if(r2===c) continue;
      var fct=A[r2][c]/A[c][c];
      for(var k=c;k<=n;k++) A[r2][k]-=fct*A[c][k];
    }
  }
  var out=[];
  for(var i2=0;i2<n;i2++) out.push(A[i2][n]/A[i2][i2]);
  return out;
}

// f ≈ F + D x + E y + A x² + B xy + C y²
function fitQuadratic(f){
  var pts=[], seed=12345;
  function rnd(){ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; }
  for(var i=0;i<70;i++) pts.push([(rnd()*2-1)*2.5,(rnd()*2-1)*2.5]);
  var basis=function(x,y){ return [1,x,y,x*x,x*y,y*y]; };
  var M=[],b=[];
  for(var r=0;r<6;r++){ M.push([0,0,0,0,0,0]); b.push(0); }
  var ok=true;
  pts.forEach(function(p){
    var v=f(p[0],p[1]); if(!isFinite(v)){ ok=false; return; }
    var g=basis(p[0],p[1]);
    for(var i2=0;i2<6;i2++){ for(var j=0;j<6;j++) M[i2][j]+=g[i2]*g[j]; b[i2]+=g[i2]*v; }
  });
  if(!ok) return null;
  var sol=solve(M,b,6);
  if(!sol) return null;
  var scale=1;
  for(var t=0;t<40;t++){ var vv=Math.abs(f(rnd()*4-2,rnd()*4-2)); if(isFinite(vv)&&vv>scale) scale=vv; }
  for(var t2=0;t2<200;t2++){
    var x=rnd()*6-3, y=rnd()*6-3;
    var g2=basis(x,y), fit=0;
    for(var i3=0;i3<6;i3++) fit+=sol[i3]*g2[i3];
    var act=f(x,y);
    if(!isFinite(act)) return null;
    if(Math.abs(act-fit) > 1e-6*(1+scale)) return null;
  }
  var clean=sol.map(function(v){ return Math.abs(v)<1e-9 ? 0 : v; });
  return { F:clean[0], D:clean[1], E:clean[2], A:clean[3], B:clean[4], C:clean[5] };
}

function isRadial(f){
  var v0=f(0,0);
  if(!isFinite(v0)) return null;
  var vals=[];
  for(var ri=1;ri<=8;ri++){
    var r=ri*0.4, base=null;
    for(var a=0;a<10;a++){
      var t=2*Math.PI*a/10, v=f(r*Math.cos(t), r*Math.sin(t));
      if(!isFinite(v)) return null;
      if(base===null) base=v;
      else if(Math.abs(v-base) > 1e-7*(1+Math.abs(base))) return null;
    }
    vals.push(base);
  }
  var dec=true, inc=true;
  for(var i=1;i<vals.length;i++){ if(vals[i]>=vals[i-1]) dec=false; if(vals[i]<=vals[i-1]) inc=false; }
  if(!dec && !inc) return null;
  var ve=vals[vals.length-1];
  if(Math.abs(ve)<1e-3) ve=0;
  return { v0:v0, vEnd:ve, decreasing:dec };
}

function num(v){
  if(Math.abs(v)<1e-10) return '0';
  var s=(Math.abs(v)>=100||Math.abs(v)<0.01) ? v.toPrecision(3) : v.toFixed(2);
  return s.replace(/\.?0+$/,'').replace('.',',').replace('-','−');
}

function analyse(f){
  var q=fitQuadratic(f);
  var out={ levels:[], secY:[], secX:[], note:'' };

  if(q){
    var A=q.A,B=q.B,C=q.C,D=q.D,E=q.E,F=q.F;
    var qscale=Math.max(Math.abs(A),Math.abs(B),Math.abs(C),1);
    var disc=B*B-4*A*C;
    if(Math.abs(disc)<1e-8*qscale*qscale) disc=0;
    var quadZero=(A===0&&B===0&&C===0);
    function centerOr(fallback){
      var s=solve([[2*A,B],[B,2*C]],[-D,-E],2);
      return s || fallback;
    }

    /* --- Höhenlinien --- */
    if(quadZero){
      if(D===0&&E===0) out.levels.push(['alle c','Die Funktion ist konstant — es gibt nur eine einzige Höhenlinie, und die füllt die ganze Ebene.']);
      else { out.levels.push(['jedes c','parallele Geraden mit Steigung '+(E!==0?num(-D/E):'∞')+', senkrecht zur Richtung des stärksten Anstiegs']);
             out.note='Die Fläche ist eine Ebene: gleichmäßig geneigt, ohne jede Krümmung.'; }
    } else if(disc<0){
      var ctr=centerOr([0,0]);
      var v0=f(ctr[0],ctr[1]);
      var maxAtCenter = (A<0);
      var circ = (Math.abs(A-C)<1e-9 && B===0);
      var word = circ ? 'Kreise' : 'Ellipsen';
      if(maxAtCenter){
        out.levels.push(['c < '+num(v0), word+' um den Punkt ('+num(ctr[0])+' | '+num(ctr[1])+'), die mit fallendem c größer werden']);
        out.levels.push(['c = '+num(v0), 'ein einzelner Punkt — die Höhenlinie entartet zum Maximum']);
        out.levels.push(['c > '+num(v0), 'leere Menge, die Ebene liegt über der Fläche']);
      } else {
        out.levels.push(['c > '+num(v0), word+' um den Punkt ('+num(ctr[0])+' | '+num(ctr[1])+'), die mit wachsendem c größer werden']);
        out.levels.push(['c = '+num(v0), 'ein einzelner Punkt — die Höhenlinie entartet zum Minimum']);
        out.levels.push(['c < '+num(v0), 'leere Menge, die Ebene liegt unter der Fläche']);
      }
      out.note='Elliptisches Paraboloid, '+(maxAtCenter?'nach unten':'nach oben')+' geöffnet. Alle Höhenlinien sind zueinander ähnlich, das Achsenverhältnis bleibt konstant.';
    } else if(disc>0){
      var ctr2=centerOr([0,0]);
      var v02=f(ctr2[0],ctr2[1]);
      out.levels.push(['c ≠ '+num(v02), 'Hyperbeln; beim Überschreiten von c = '+num(v02)+' springen die Äste auf die andere Achse']);
      out.levels.push(['c = '+num(v02), 'zwei sich schneidende Geraden durch ('+num(ctr2[0])+' | '+num(ctr2[1])+') — die Asymptoten aller übrigen Höhenlinien']);
      out.note='Hyperbolisches Paraboloid, also ein Sattel. Der Punkt ('+num(ctr2[0])+' | '+num(ctr2[1])+') ist weder Hoch- noch Tiefpunkt.';
    } else {
      // disc = 0: quadratischer Teil ist ein vollständiges Quadrat
      var lin = (A!==0) ? [1, B/(2*A)] : [B/(2*C), 1];   // Richtung der Entartung
      var alongLinear = (D*lin[1]-E*lin[0]);
      var sgn = (A!==0? A : C);
      if(Math.abs(alongLinear)>1e-9){
        out.levels.push(['jedes c','Parabeln, alle gleich geformt und nur gegeneinander verschoben']);
        out.note='Parabolischer Zylinder mit zusätzlicher Neigung — die Fläche ist in einer Richtung gerade.';
      } else {
        var vC = (A!==0) ? F - D*D/(4*A) : F - E*E/(4*C);
        if(sgn>0){
          out.levels.push(['c > '+num(vC),'zwei parallele Geraden']);
          out.levels.push(['c = '+num(vC),'eine einzige Gerade — die Rinne am Boden der Fläche']);
          out.levels.push(['c < '+num(vC),'leere Menge']);
        } else {
          out.levels.push(['c < '+num(vC),'zwei parallele Geraden']);
          out.levels.push(['c = '+num(vC),'eine einzige Gerade — der Kamm der Fläche']);
          out.levels.push(['c > '+num(vC),'leere Menge']);
        }
        out.note='Parabolischer Zylinder: die Fläche ändert sich entlang einer Richtung überhaupt nicht.';
      }
    }

    /* --- Schnittkurven z = f(x,c): A x² + (Bc+D) x + (Cc²+Ec+F) --- */
    if(A!==0){
      out.secY.push(['Form', 'Parabeln, nach '+(A>0?'oben':'unten')+' geöffnet, für jedes c gleich geformt (Faktor '+num(A)+')']);
      out.secY.push(['Einfluss von c', B!==0 ? 'der Scheitel wandert schräg: c verschiebt ihn zugleich waagerecht und senkrecht'
                                             : 'c verschiebt die Parabel nur senkrecht, weil kein xy-Glied vorkommt']);
    } else if(B!==0 || D!==0){
      out.secY.push(['Form','Geraden']);
      out.secY.push(['Einfluss von c', B!==0 ? 'die Steigung Bc + D = '+num(B)+'c + '+num(D)+' hängt selbst von c ab — die Geraden sind nicht parallel'
                                             : 'alle Geraden haben dieselbe Steigung '+num(D)+', c verschiebt sie nur']);
    } else out.secY.push(['Form','waagerechte Geraden — x kommt gar nicht vor']);

    /* --- Schnittkurven z = f(c,y): C y² + (Bc+E) y + (Ac²+Dc+F) --- */
    if(C!==0){
      out.secX.push(['Form', 'Parabeln, nach '+(C>0?'oben':'unten')+' geöffnet, für jedes c gleich geformt (Faktor '+num(C)+')']);
      out.secX.push(['Einfluss von c', B!==0 ? 'der Scheitel wandert schräg: c verschiebt ihn zugleich waagerecht und senkrecht'
                                             : 'c verschiebt die Parabel nur senkrecht, weil kein xy-Glied vorkommt']);
    } else if(B!==0 || E!==0){
      out.secX.push(['Form','Geraden']);
      out.secX.push(['Einfluss von c', B!==0 ? 'die Steigung Bc + E = '+num(B)+'c + '+num(E)+' hängt selbst von c ab — die Geraden sind nicht parallel'
                                             : 'alle Geraden haben dieselbe Steigung '+num(E)+', c verschiebt sie nur']);
    } else out.secX.push(['Form','waagerechte Geraden — y kommt gar nicht vor']);

    if(A!==0 && C!==0 && A*C<0)
      out.note += ' Die beiden Schnittrichtungen liefern gegenläufig geöffnete Parabeln — genau das macht den Sattel aus.';
    return out;
  }

  var rad=isRadial(f);
  if(rad){
    var lo=Math.min(rad.v0,rad.vEnd), hi=Math.max(rad.v0,rad.vEnd);
    out.levels.push(['zwischen '+num(lo)+' und '+num(hi),'konzentrische Kreise um den Ursprung']);
    out.levels.push(['c = '+num(rad.v0),'ein einzelner Punkt im Ursprung']);
    out.levels.push(['sonst','leere Menge']);
    out.note='Die Funktion hängt nur vom Abstand zum Ursprung ab, ist also rotationssymmetrisch. Die Höhenlinien sind deshalb Kreise, allerdings nicht gleichmäßig verteilt.';
    out.secY.push(['Form','für c = 0 das volle Profil durch die Spitze; für c ≠ 0 dasselbe Profil, flacher und niedriger']);
    out.secX.push(['Form','aus Symmetriegründen identisch zum Schnitt in x-Richtung']);
    return out;
  }

  out.levels.push(['Typ','kein Kegelschnitt — die Form liest du an der Zeichnung ab']);
  out.note='Für diese Funktion greift die automatische Klassifikation nicht. Die Bilder stimmen trotzdem.';
  return out;
}

/* ==================== Zustand ==================== */

var f=null, RANGE=4, cH=-2, cY=0, cX=0;
var zMin=-6, zMax=1;
var az=-0.62, el=0.58;
var GRID=46;
var samples=null;

var C3=document.getElementById('c3d'), G3=C3.getContext('2d');
var CM=document.getElementById('cmap'), GM=CM.getContext('2d');
var CX=document.getElementById('csx'), GX=CX.getContext('2d');
var CY=document.getElementById('csy'), GY=CY.getContext('2d');
var COL={gold:'#F0B429',mint:'#5FD1BE',rose:'#E58BB5',dim:'#7FA6B6',grid:'rgba(94,158,182,.14)',axis:'rgba(150,200,216,.55)'};

function sampleGrid(){
  var n=GRID, vals=new Float64Array((n+1)*(n+1)), fin=[];
  for(var i=0;i<=n;i++){
    for(var j=0;j<=n;j++){
      var x=-RANGE+2*RANGE*i/n, y=-RANGE+2*RANGE*j/n;
      var v=f(x,y);
      if(!isFinite(v)) v=NaN; else fin.push(v);
      vals[i*(n+1)+j]=v;
    }
  }
  fin.sort(function(a,b){return a-b;});
  var lo=fin.length? fin[Math.floor(fin.length*0.01)] : -1;
  var hi=fin.length? fin[Math.floor(fin.length*0.99)] : 1;
  if(hi-lo<1e-6){ lo-=1; hi+=1; }
  var pad=(hi-lo)*0.12;
  zMin=lo-pad; zMax=hi+pad;
  samples={n:n,vals:vals};
}

function fval(i,j){ return samples.vals[i*(samples.n+1)+j]; }
function gx(i){ return -RANGE+2*RANGE*i/samples.n; }

/* ---------- Marching Squares ---------- */
function contour(level){
  var segs=[], n=samples.n;
  for(var i=0;i<n;i++){
    for(var j=0;j<n;j++){
      var v=[fval(i,j),fval(i+1,j),fval(i+1,j+1),fval(i,j+1)];
      if(v.some(isNaN)) continue;
      var p=[[gx(i),gx(j)],[gx(i+1),gx(j)],[gx(i+1),gx(j+1)],[gx(i),gx(j+1)]];
      var idx=0;
      for(var k=0;k<4;k++) if(v[k]>level) idx|=(1<<k);
      if(idx===0||idx===15) continue;
      function ip(a,b){
        var t=(level-v[a])/(v[b]-v[a]);
        return [p[a][0]+t*(p[b][0]-p[a][0]), p[a][1]+t*(p[b][1]-p[a][1])];
      }
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

/* ---------- 3D ---------- */
function proj(x,y,z,cam){
  var ca=Math.cos(az),sa=Math.sin(az),ce=Math.cos(el),se=Math.sin(el);
  var x1=x*ca-y*sa, y1=x*sa+y*ca;
  return { x:cam.cx+x1*cam.s, y:cam.cy-(y1*se+z*ce)*cam.s, d:y1*ce-z*se };
}
function makeCam(w,h){
  var cam={cx:0,cy:0,s:1}, R=RANGE, pts=[];
  var Z=[zMin,zMax];
  for(var i=0;i<2;i++)for(var j=0;j<2;j++)for(var k=0;k<2;k++)
    pts.push(proj(i?R:-R, j?R:-R, Z[k], cam));
  var a=1e9,b=-1e9,c=1e9,d=-1e9;
  pts.forEach(function(p){ a=Math.min(a,p.x); b=Math.max(b,p.x); c=Math.min(c,p.y); d=Math.max(d,p.y); });
  var pad=18;
  cam.s=Math.min((w-2*pad)/(b-a),(h-2*pad)/(d-c));
  cam.cx=w/2-((a+b)/2)*cam.s; cam.cy=h/2+((c+d)/2)*cam.s;
  return cam;
}
function clampZ(v){ return Math.max(zMin,Math.min(zMax,v)); }

function draw3D(){
  var w=C3.clientWidth,h=C3.clientHeight,dpr=window.devicePixelRatio||1;
  if(C3.width!==Math.round(w*dpr)){C3.width=Math.round(w*dpr);C3.height=Math.round(h*dpr);}
  G3.setTransform(dpr,0,0,dpr,0,0); G3.clearRect(0,0,w,h);
  if(!f) return;
  var cam=makeCam(w,h), P=function(x,y,z){return proj(x,y,z,cam);};
  var polys=[], n=samples.n, step=2;

  for(var i=0;i<n;i+=step){
    for(var j=0;j<n;j+=step){
      var i2=Math.min(i+step,n), j2=Math.min(j+step,n);
      var va=fval(i,j), vb=fval(i2,j), vc=fval(i2,j2), vd=fval(i,j2);
      if(isNaN(va)||isNaN(vb)||isNaN(vc)||isNaN(vd)) continue;
      var za=clampZ(va),zb=clampZ(vb),zc2=clampZ(vc),zd=clampZ(vd);
      var pa=P(gx(i),gx(j),za), pb=P(gx(i2),gx(j),zb),
          pc=P(gx(i2),gx(j2),zc2), pd=P(gx(i),gx(j2),zd);
      var mz=(za+zb+zc2+zd)/4;
      var nx=-(vb-va)/(gx(i2)-gx(i)), ny=-(vd-va)/(gx(j2)-gx(j));
      var L=Math.hypot(nx,ny,1); nx/=L; ny/=L;
      var lam=Math.max(0,(nx*-0.45+ny*-0.5+(1/L)*0.74));
      var dep=(mz-zMin)/(zMax-zMin);
      var base=[30+66*dep, 88+72*dep, 112+66*dep];
      var sh=0.55+0.6*lam;
      polys.push({p:[pa,pb,pc,pd],d:(pa.d+pb.d+pc.d+pd.d)/4,
        fill:'rgb('+Math.round(base[0]*sh)+','+Math.round(base[1]*sh)+','+Math.round(base[2]*sh)+')',surf:1});
    }
  }

  if(cH>zMin&&cH<zMax){
    var GP=8;
    for(var a=0;a<GP;a++)for(var b=0;b<GP;b++){
      var x1=-RANGE+2*RANGE*a/GP, x2=-RANGE+2*RANGE*(a+1)/GP,
          y1=-RANGE+2*RANGE*b/GP, y2=-RANGE+2*RANGE*(b+1)/GP;
      var pp=[P(x1,y1,cH),P(x2,y1,cH),P(x2,y2,cH),P(x1,y2,cH)];
      polys.push({p:pp,d:(pp[0].d+pp[1].d+pp[2].d+pp[3].d)/4,fill:'rgba(240,180,41,.16)',surf:0});
    }
  }

  polys.sort(function(A,B){return B.d-A.d;});
  polys.forEach(function(q){
    G3.beginPath(); G3.moveTo(q.p[0].x,q.p[0].y);
    for(var i3=1;i3<4;i3++) G3.lineTo(q.p[i3].x,q.p[i3].y);
    G3.closePath(); G3.fillStyle=q.fill; G3.fill();
    if(q.surf){ G3.strokeStyle='rgba(8,30,40,.35)'; G3.lineWidth=.5; G3.stroke(); }
  });

  // Höhenlinie im Raum
  var segs=contour(cH);
  G3.strokeStyle=COL.gold; G3.lineWidth=2.4; G3.beginPath();
  segs.forEach(function(s){
    var p1=P(s[0][0],s[0][1],cH), p2=P(s[1][0],s[1][1],cH);
    G3.moveTo(p1.x,p1.y); G3.lineTo(p2.x,p2.y);
  });
  G3.stroke();

  // Schnittkurven auf der Fläche
  function ridge(fixY, val, color){
    G3.strokeStyle=color; G3.lineWidth=2.2; G3.beginPath();
    var started=false;
    for(var t=0;t<=120;t++){
      var u=-RANGE+2*RANGE*t/120;
      var z=fixY? f(u,val) : f(val,u);
      if(!isFinite(z)||z<zMin||z>zMax){ started=false; continue; }
      var p=fixY? P(u,val,z) : P(val,u,z);
      if(started) G3.lineTo(p.x,p.y); else { G3.moveTo(p.x,p.y); started=true; }
    }
    G3.stroke();
  }
  ridge(true,cY,COL.mint);
  ridge(false,cX,COL.rose);
}

/* ---------- Höhenlinien von oben ---------- */
function draw2Dmap(){
  var w=CM.clientWidth,h=CM.clientHeight,dpr=window.devicePixelRatio||1;
  if(CM.width!==Math.round(w*dpr)){CM.width=Math.round(w*dpr);CM.height=Math.round(h*dpr);}
  GM.setTransform(dpr,0,0,dpr,0,0); GM.clearRect(0,0,w,h);
  if(!f) return;
  var pad=26, s=Math.min((w-2*pad),(h-2*pad))/(2*RANGE);
  var cx=w/2, cy=h/2;
  var X=function(v){return cx+v*s;}, Y=function(v){return cy-v*s;};

  GM.strokeStyle=COL.grid; GM.lineWidth=1;
  for(var g=-Math.floor(RANGE);g<=Math.floor(RANGE);g++){
    GM.beginPath(); GM.moveTo(X(g),Y(-RANGE)); GM.lineTo(X(g),Y(RANGE)); GM.stroke();
    GM.beginPath(); GM.moveTo(X(-RANGE),Y(g)); GM.lineTo(X(RANGE),Y(g)); GM.stroke();
  }
  GM.strokeStyle=COL.axis; GM.lineWidth=1.1;
  GM.beginPath(); GM.moveTo(X(-RANGE),Y(0)); GM.lineTo(X(RANGE),Y(0)); GM.stroke();
  GM.beginPath(); GM.moveTo(X(0),Y(-RANGE)); GM.lineTo(X(0),Y(RANGE)); GM.stroke();
  GM.fillStyle=COL.dim; GM.font='italic 12px Georgia, serif';
  GM.fillText('x',X(RANGE)-11,Y(0)-7); GM.fillText('y',X(0)+7,Y(RANGE)+13);

  // Schar
  for(var k=1;k<=9;k++){
    var lv=zMin+(zMax-zMin)*k/10;
    if(Math.abs(lv-cH)<(zMax-zMin)*0.012) continue;
    var sg=contour(lv);
    GM.strokeStyle='rgba(94,158,182,.36)'; GM.lineWidth=1; GM.beginPath();
    sg.forEach(function(sm){ GM.moveTo(X(sm[0][0]),Y(sm[0][1])); GM.lineTo(X(sm[1][0]),Y(sm[1][1])); });
    GM.stroke();
  }
  // Schnittebenen als Spuren
  GM.setLineDash([5,4]); GM.lineWidth=1.4;
  GM.strokeStyle=COL.mint; GM.beginPath(); GM.moveTo(X(-RANGE),Y(cY)); GM.lineTo(X(RANGE),Y(cY)); GM.stroke();
  GM.strokeStyle=COL.rose; GM.beginPath(); GM.moveTo(X(cX),Y(-RANGE)); GM.lineTo(X(cX),Y(RANGE)); GM.stroke();
  GM.setLineDash([]);
  // aktive Höhenlinie
  var act=contour(cH);
  GM.strokeStyle=COL.gold; GM.lineWidth=2.6; GM.beginPath();
  act.forEach(function(sm){ GM.moveTo(X(sm[0][0]),Y(sm[0][1])); GM.lineTo(X(sm[1][0]),Y(sm[1][1])); });
  GM.stroke();
  if(act.length===0){
    GM.fillStyle='rgba(240,180,41,.75)'; GM.font='italic 15px Georgia, serif';
    GM.fillText('leere Menge', pad+4, pad+8);
  }
}

/* ---------- Schnittkurven ---------- */
function drawSection(cv,ctx,fixY,val,color,varName){
  var w=cv.clientWidth,h=cv.clientHeight,dpr=window.devicePixelRatio||1;
  if(cv.width!==Math.round(w*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);}
  ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
  if(!f) return;
  var padL=30,padR=14,padT=14,padB=24;
  var sx=(w-padL-padR)/(2*RANGE), sy=(h-padT-padB)/(zMax-zMin);
  var X=function(v){return padL+(v+RANGE)*sx;}, Y=function(v){return h-padB-(v-zMin)*sy;};

  ctx.strokeStyle=COL.grid; ctx.lineWidth=1;
  for(var g=-Math.floor(RANGE);g<=Math.floor(RANGE);g++){ ctx.beginPath(); ctx.moveTo(X(g),padT); ctx.lineTo(X(g),h-padB); ctx.stroke(); }
  var zstep=Math.pow(10,Math.round(Math.log10((zMax-zMin)/5)));
  for(var z=Math.ceil(zMin/zstep)*zstep; z<=zMax; z+=zstep){ ctx.beginPath(); ctx.moveTo(padL,Y(z)); ctx.lineTo(w-padR,Y(z)); ctx.stroke(); }

  ctx.strokeStyle=COL.axis; ctx.lineWidth=1.1;
  if(zMin<0&&zMax>0){ ctx.beginPath(); ctx.moveTo(padL,Y(0)); ctx.lineTo(w-padR,Y(0)); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(X(0),padT); ctx.lineTo(X(0),h-padB); ctx.stroke();
  ctx.fillStyle=COL.dim; ctx.font='italic 12px Georgia, serif';
  ctx.fillText(varName, w-padR-10, (zMin<0&&zMax>0? Y(0):h-padB)-6);
  ctx.fillText('z', X(0)+6, padT+11);

  // Höhe c als waagerechte Marke
  ctx.strokeStyle='rgba(240,180,41,.6)'; ctx.setLineDash([5,4]); ctx.lineWidth=1.3;
  ctx.beginPath(); ctx.moveTo(padL,Y(cH)); ctx.lineTo(w-padR,Y(cH)); ctx.stroke(); ctx.setLineDash([]);

  ctx.strokeStyle=color; ctx.lineWidth=2.4; ctx.beginPath();
  var started=false;
  for(var t=0;t<=260;t++){
    var u=-RANGE+2*RANGE*t/260;
    var v=fixY? f(u,val) : f(val,u);
    if(!isFinite(v)||v<zMin-0.5||v>zMax+0.5){ started=false; continue; }
    var px=X(u), py=Y(Math.max(zMin,Math.min(zMax,v)));
    if(started) ctx.lineTo(px,py); else { ctx.moveTo(px,py); started=true; }
  }
  ctx.stroke();
}

/* ---------- Ausgabe ---------- */
function renderAnalysis(a){
  function block(list){
    return list.map(function(row){
      return '<div class="case"><span>'+row[0]+'</span><span>'+row[1]+'</span></div>';
    }).join('');
  }
  document.getElementById('anaH').innerHTML =
    block(a.levels) + (a.note? '<p style="margin-top:10px;color:var(--dim)">'+a.note+'</p>' : '');
  document.getElementById('anaY').innerHTML =
    a.secY.map(function(r){return '<div class="case mint"><span>'+r[0]+'</span><span>'+r[1]+'</span></div>';}).join('');
  document.getElementById('anaX').innerHTML =
    a.secX.map(function(r){return '<div class="case rose"><span>'+r[0]+'</span><span>'+r[1]+'</span></div>';}).join('');
}

function drawAll(){
  draw3D(); draw2Dmap();
  drawSection(CX,GX,true,cY,COL.mint,'x');
  drawSection(CY,GY,false,cX,COL.rose,'y');
}

function refreshSliders(){
  var sH=document.getElementById('sH');
  sH.min=zMin.toFixed(2); sH.max=zMax.toFixed(2);
  if(cH<zMin||cH>zMax) cH=zMin+(zMax-zMin)*0.35;
  sH.value=cH;
  document.getElementById('oH').textContent=num(cH);
  ['sY','sX'].forEach(function(id){
    var el2=document.getElementById(id); el2.min=-RANGE; el2.max=RANGE;
  });
  document.getElementById('oY').textContent=num(cY);
  document.getElementById('oX').textContent=num(cX);
  document.getElementById('oR').textContent=RANGE.toFixed(1).replace('.',',');
}

function rebuild(){
  var src=document.getElementById('fx').value;
  var errEl=document.getElementById('err'), inp=document.getElementById('fx');
  try{
    f=MT.expr.compile(src);
    errEl.textContent=''; inp.classList.remove('bad');
  }catch(e){
    errEl.textContent=e.message; inp.classList.add('bad');
    return;
  }
  sampleGrid();
  refreshSliders();
  renderAnalysis(analyse(f));
  drawAll();
}

/* ---------- Bedienung ---------- */
var EXAMPLES=[
  ['(a)','-x^2/4 - y^2/9'],
  ['(b)','-x^2/9 + y^2/16'],
  ['(c)','3x - 4y'],
  ['(d)','e^(-(x^2+y^2))'],
  ['(e)','-4xy'],
  ['(f)','x^2 - 2xy + y^2']
];
var chips=document.getElementById('chips');
EXAMPLES.forEach(function(ex){
  var b=document.createElement('button');
  b.className='chip'; b.type='button';
  b.textContent=ex[0]+' '+ex[1].replace(/\*/g,'·').replace(/\^2/g,'²');
  b.addEventListener('click',function(){
    document.getElementById('fx').value=ex[1];
    rebuild();
  });
  chips.appendChild(b);
});

document.getElementById('fx').addEventListener('input',rebuild);
document.getElementById('sH').addEventListener('input',function(){
  cH=parseFloat(this.value); document.getElementById('oH').textContent=num(cH);
  drawAll();
});
document.getElementById('sY').addEventListener('input',function(){
  cY=parseFloat(this.value); document.getElementById('oY').textContent=num(cY);
  drawAll();
});
document.getElementById('sX').addEventListener('input',function(){
  cX=parseFloat(this.value); document.getElementById('oX').textContent=num(cX);
  drawAll();
});
document.getElementById('sR').addEventListener('input',function(){
  RANGE=parseFloat(this.value);
  cY=Math.max(-RANGE,Math.min(RANGE,cY)); cX=Math.max(-RANGE,Math.min(RANGE,cX));
  sampleGrid(); refreshSliders(); drawAll();
});

var drag=null;
C3.addEventListener('pointerdown',function(e){ drag={x:e.clientX,y:e.clientY,az:az,el:el}; C3.setPointerCapture(e.pointerId); });
C3.addEventListener('pointermove',function(e){
  if(!drag) return;
  az=drag.az+(e.clientX-drag.x)*0.008;
  el=Math.max(0.12,Math.min(1.45,drag.el+(e.clientY-drag.y)*0.006));
  draw3D();
});
['pointerup','pointercancel'].forEach(function(ev){ C3.addEventListener(ev,function(){drag=null;}); });

function sizeAll(){
  var w=C3.clientWidth;
  C3.style.height=Math.max(300,Math.min(430,w*0.78))+'px';
  CM.style.height=C3.style.height;
  CX.style.height='220px'; CY.style.height='220px';
  drawAll();
}
window.addEventListener('resize',function(){ sizeAll(); });

document.getElementById('sR').value=4;
sizeAll();
rebuild();
sizeAll();
})();
