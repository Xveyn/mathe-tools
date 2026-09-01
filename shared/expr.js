/* MT.expr — Parser für Funktionsterme über einer frei wählbaren
   Variablenliste. Tokenizer mit impliziter Multiplikation, danach
   rekursiver Abstieg. Die Knotenfunktionen nehmen ein Werte-Array
   entgegen; compile() verpackt sie zu einer Funktion mit
   Stellungsargumenten. Variablennamen müssen einzelne Buchstaben
   sein und dürfen nicht mit einer Funktion oder Konstante kollidieren. */

var MT = MT || {};

MT.expr = (function(){
"use strict";

var FUNCS = {
  sin:Math.sin, cos:Math.cos, tan:Math.tan,
  asin:Math.asin, acos:Math.acos, atan:Math.atan,
  sinh:Math.sinh, cosh:Math.cosh, tanh:Math.tanh,
  exp:Math.exp, ln:Math.log, log:Math.log,
  sqrt:Math.sqrt, abs:Math.abs, sign:Math.sign
};
var CONSTS = { pi:Math.PI, e:Math.E };
var NAMES = Object.keys(FUNCS).concat(Object.keys(CONSTS)).sort(function(a,b){return b.length-a.length;});

function tokenize(src, vars){
  var t=[], i=0, s=src.replace(/\s+/g,'').replace(/,/g,'.');
  while(i<s.length){
    var ch=s[i];
    if(/[0-9.]/.test(ch)){
      var n=''; while(i<s.length && /[0-9.]/.test(s[i])) n+=s[i++];
      if(isNaN(parseFloat(n))) throw new Error('Ungültige Zahl "'+n+'"');
      t.push({t:'num',v:parseFloat(n)}); continue;
    }
    if(/[a-zA-Z]/.test(ch)){
      var run=''; while(i<s.length && /[a-zA-Z]/.test(s[i])) run+=s[i++];
      while(run.length){
        var hit=null;
        for(var k=0;k<NAMES.length;k++){
          if(run.indexOf(NAMES[k])===0){ hit=NAMES[k]; break; }
        }
        if(hit && FUNCS[hit]){ t.push({t:'func',v:hit}); run=run.slice(hit.length); continue; }
        if(hit && CONSTS[hit]){ t.push({t:'const',v:CONSTS[hit]}); run=run.slice(hit.length); continue; }
        var c=run[0], vi=vars.indexOf(c);
        if(vi>=0){ t.push({t:'var',v:c,i:vi}); run=run.slice(1); continue; }
        throw new Error('Unbekannter Name "'+c+'" — erlaubt sind '+vars.join(', ')+', e, pi und die üblichen Funktionen');
      }
      continue;
    }
    if('+-*/^()'.indexOf(ch)>=0){ t.push({t:ch}); i++; continue; }
    throw new Error('Zeichen "'+ch+'" wird nicht verstanden');
  }
  // implizite Multiplikation
  var out=[];
  for(var j=0;j<t.length;j++){
    if(j>0){
      var p=t[j-1], q=t[j];
      var pEnd = (p.t==='num'||p.t==='var'||p.t==='const'||p.t===')');
      var qStart = (q.t==='num'||q.t==='var'||q.t==='const'||q.t==='func'||q.t==='(');
      if(pEnd && qStart) out.push({t:'*'});
    }
    out.push(t[j]);
  }
  return out;
}

function parse(tokens){
  var pos=0;
  function peek(){ return tokens[pos]; }
  function eat(type){
    var tk=tokens[pos];
    if(!tk || tk.t!==type) throw new Error('Erwartet: "'+type+'"');
    pos++; return tk;
  }
  function expr(){
    var node=term();
    while(peek() && (peek().t==='+'||peek().t==='-')){
      var op=tokens[pos++].t, rhs=term(), l=node;
      node = op==='+' ? function(a,b){return function(v){return a(v)+b(v);};}(l,rhs)
                      : function(a,b){return function(v){return a(v)-b(v);};}(l,rhs);
    }
    return node;
  }
  function term(){
    var node=unary();
    while(peek() && (peek().t==='*'||peek().t==='/')){
      var op=tokens[pos++].t, rhs=unary(), l=node;
      node = op==='*' ? function(a,b){return function(v){return a(v)*b(v);};}(l,rhs)
                      : function(a,b){return function(v){return a(v)/b(v);};}(l,rhs);
    }
    return node;
  }
  function unary(){
    if(peek() && peek().t==='-'){ pos++; var u=unary(); return function(v){return -u(v);}; }
    if(peek() && peek().t==='+'){ pos++; return unary(); }
    return power();
  }
  function power(){
    var base=atom();
    if(peek() && peek().t==='^'){
      pos++; var ex=unary();
      return function(v){return Math.pow(base(v),ex(v));};
    }
    return base;
  }
  function atom(){
    var tk=peek();
    if(!tk) throw new Error('Term endet unerwartet');
    if(tk.t==='num'||tk.t==='const'){ pos++; var c=tk.v; return function(){return c;}; }
    if(tk.t==='var'){ pos++; var idx=tk.i; return function(v){return v[idx];}; }
    if(tk.t==='func'){
      pos++; var fn=FUNCS[tk.v]; eat('('); var a=expr(); eat(')');
      return function(v){return fn(a(v));};
    }
    if(tk.t==='('){ pos++; var e=expr(); eat(')'); return e; }
    throw new Error('Unerwartetes Zeichen im Term');
  }
  var root=expr();
  if(pos<tokens.length) throw new Error('Der Term hat einen Rest, der nicht dazugehört');
  return root;
}

function compile(src, vars){
  vars = vars || ['x','y'];
  if(!vars.length) throw new Error('Es muss mindestens eine Variable angegeben werden');
  for(var vi=0;vi<vars.length;vi++){
    var name=vars[vi];
    if(typeof name!=='string' || !/^[a-zA-Z]$/.test(name))
      throw new Error('Variablenname "'+name+'" ist nicht erlaubt — Variablen sind einzelne Buchstaben');
    if(FUNCS[name] || CONSTS[name])
      throw new Error('Variablenname "'+name+'" ist schon als Funktion oder Konstante vergeben');
    if(vars.indexOf(name)!==vi)
      throw new Error('Variablenname "'+name+'" kommt doppelt vor');
  }
  var root = parse(tokenize(src, vars));
  // arguments ist array-artig; die Knoten greifen nur per Index zu.
  var fn = function(){ return root(arguments); };
  var probeA=[], probeB=[];
  for(var i=0;i<vars.length;i++){ probeA.push(0.31+i*0.16); probeB.push(1.1-i*0.4); }
  if(!isFinite(fn.apply(null,probeA)) && !isFinite(fn.apply(null,probeB)))
    throw new Error('Die Funktion liefert keine Zahlenwerte');
  return fn;
}

return { compile:compile, FUNCS:FUNCS, CONSTS:CONSTS };
})();
