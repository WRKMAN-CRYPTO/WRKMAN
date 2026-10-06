/*
WRKMAN Brain Interface v1

Brains are replaceable components. WRKMAN owns identity, memory, tools and truth rules.
A brain receives a packet and returns a normalized reply. It never receives tool authority.

Adapter contract:
{
  id: string,
  label: string,
  available(): Promise<boolean>,
  think(packet): Promise<{ text: string, confidence?: string, meta?: object }>
}

Packet contract:
{
  protocol: "wrkman.brain.v1",
  message: string,
  identity: object,
  memories: array,
  observations: array,
  recentJournal: array,
  concepts: array
}
*/
(function(global){
'use strict';

function normalize(adapter, out){
  if(!out || typeof out.text !== 'string') throw new Error('Brain returned no text.');
  return {
    brain: adapter.id,
    text: out.text.trim(),
    confidence: out.confidence || 'unspecified',
    meta: out.meta || {}
  };
}

function BrainBus(){
  this.adapters = {};
  this.active = null;
}
BrainBus.prototype.register=function(adapter){
  if(!adapter || !adapter.id || typeof adapter.think!=='function') throw new Error('Invalid brain adapter.');
  this.adapters[adapter.id]=adapter;
  if(!this.active)this.active=adapter.id;
  return this;
};
BrainBus.prototype.use=function(id){
  if(!this.adapters[id])throw new Error('Unknown brain: '+id);
  this.active=id;
};
BrainBus.prototype.current=function(){return this.adapters[this.active]||null};
BrainBus.prototype.list=function(){
  return Object.keys(this.adapters).map(function(id){
    return {id:id,label:this.adapters[id].label||id,active:id===this.active};
  },this);
};
BrainBus.prototype.think=async function(packet){
  var adapter=this.current();
  if(!adapter)throw new Error('No brain registered.');
  if(adapter.available && !(await adapter.available()))throw new Error('Brain unavailable: '+adapter.id);
  return normalize(adapter,await adapter.think(packet));
};

var none={
  id:'none',
  label:'No model',
  available:async function(){return true},
  think:async function(){
    return {text:'I do not know how to answer that yet. No language model is connected, and I will not invent an answer.',confidence:'certain'};
  }
};


function words(s){
  return String(s||'').toLowerCase().replace(/[^a-z0-9\s']/g,' ').split(/\s+/).filter(Boolean);
}
function meaningful(s){
  var stop={the:1,a:1,an:1,is:1,are:1,am:1,my:1,me:1,i:1,you:1,your:1,what:1,whats:1,"what's":1,who:1,do:1,does:1,did:1,have:1,has:1,remember:1,about:1,tell:1,know:1,of:1,to:1,for:1,and:1};
  return words(s).filter(function(w){return !stop[w] && w.length>1});
}
function equivalenceTerms(c){
  if(!c)return [];
  if(c.type==='edge' && String(c.relation||'').toUpperCase()!=='SAME AS')return [];
  return (c.terms||[]).map(function(t){return String(t).toLowerCase().trim()}).filter(Boolean);
}
function conceptMap(concepts){
  var map={};
  (concepts||[]).forEach(function(c){
    var terms=equivalenceTerms(c);
    terms.forEach(function(t){map[t]=terms});
  });
  return map;
}
function expandTerms(list,concepts){
  var map=conceptMap(concepts),out=[];
  list.forEach(function(term){
    if(out.indexOf(term)===-1)out.push(term);
    (map[term]||[]).forEach(function(x){if(out.indexOf(x)===-1)out.push(x)});
  });
  return out;
}
function phrasePresent(text,term){
  var hay=' '+String(text||'').toLowerCase().replace(/[^a-z0-9\s']/g,' ').replace(/\s+/g,' ').trim()+' ';
  return hay.indexOf(' '+term+' ')!==-1;
}
function taughtPhrases(message,concepts){
  var raw=' '+String(message||'').toLowerCase().replace(/[^a-z0-9\s']/g,' ').replace(/\s+/g,' ').trim()+' ';
  var found=[];
  (concepts||[]).forEach(function(c){
    equivalenceTerms(c).forEach(function(term){
      term=String(term).toLowerCase().trim();
      if(term.indexOf(' ')!==-1 && raw.indexOf(' '+term+' ')!==-1 && found.indexOf(term)===-1)found.push(term);
    });
  });
  return found;
}
function queryShape(message,concepts){
  var raw=String(message||'').toLowerCase();
  var q=meaningful(raw);
  var phrases=taughtPhrases(raw,concepts);
  var weak={favorite:1,favourite:1,like:1,likes:1};
  var anchors=q.filter(function(w){return !weak[w]});
  phrases.forEach(function(p){
    if(q.indexOf(p)===-1)q.push(p);
    if(anchors.indexOf(p)===-1)anchors.push(p);
  });
  return {terms:expandTerms(q,concepts),anchors:expandTerms(anchors,concepts)};
}
function bestMemory(message,memories,concepts){
  var shape=queryShape(message,concepts);
  if(!shape.terms.length)return null;
  var best=null,bestScore=0;
  (memories||[]).forEach(function(m){
    var termHits=0,anchorHits=0;
    shape.terms.forEach(function(w){if(phrasePresent(m.text,w))termHits++});
    shape.anchors.forEach(function(w){if(phrasePresent(m.text,w))anchorHits++});

    // If the question contains a concrete subject/property such as "color" or
    // "food", at least one such anchor must exist in the memory. Generic words
    // such as "favorite" are never enough by themselves.
    if(shape.anchors.length && anchorHits===0)return;

    var score=(anchorHits*10)+termHits;
    if(score>bestScore){bestScore=score;best={memory:m,score:score,anchorHits:anchorHits}}
  });
  return best;
}
function cleanTerm(s){
  return String(s||'').toLowerCase().replace(/^[\s]+|[\s]+$/g,'').replace(/^(a|an|the)\s+/,'');
}
function directEdgesFor(term,concepts){
  term=cleanTerm(term);
  var out=[],incoming=[];
  (concepts||[]).forEach(function(c){
    if(c.type!=='edge'||!c.terms||c.terms.length<2)return;
    var a=cleanTerm(c.terms[0]),z=cleanTerm(c.terms[1]),rel=String(c.relation||'').toUpperCase();
    if(a===term)out.push({from:c.terms[0],relation:rel,to:c.terms[1],id:c.id});
    if(z===term)incoming.push({from:c.terms[0],relation:rel,to:c.terms[1],id:c.id});
  });
  return {out:out,incoming:incoming};
}
function graphAnswerForWhatIs(q,concepts){
  var m=q.match(/^(?:what is|what's)\s+(.+)$/);
  if(!m)return null;
  var subject=cleanTerm(m[1]);
  if(!subject)return null;
  var edges=directEdgesFor(subject,concepts),chosen=edges.out.length?edges.out:edges.incoming;
  if(!chosen.length)return null;
  var limit=12,shown=chosen.slice(0,limit),lines=shown.map(function(e){return e.from+' --'+e.relation+'--> '+e.to});
  var extra=chosen.length-shown.length;
  var lead=edges.out.length?'I know these direct connections:':'I know these direct connections to '+subject+':';
  return {
    text:lead+'\n'+lines.join('\n')+(extra?'\n+'+extra+' more direct connection'+(extra===1?'':'s')+'.':''),
    confidence:'concept-grounded',
    meta:{kind:'direct-concept',subject:subject,direction:edges.out.length?'outgoing':'incoming',edgeIds:shown.map(function(e){return e.id})}
  };
}
var firstWords={
  id:'first-words',
  label:'First Words',
  available:async function(){return true},
  think:async function(packet){
    var raw=String(packet.message||'').trim();
    var q=raw.toLowerCase().replace(/[.!?]+$/,'').trim();
    if(/^(hi|hey|hello|hiya|howdy)\b/.test(q)){
      return {text:'Hey. I am WRKMAN. I am still very small, but I am listening.',confidence:'certain',meta:{kind:'greeting'}};
    }
    if(/^(who are you|what are you|tell me about yourself)$/.test(q)){
      return {text:'I am WRKMAN. My brain is a replaceable component. My identity, memory, tools, journal, and truth rules belong to WRKMAN.',confidence:'certain',meta:{kind:'identity'}};
    }
    var graphHit=graphAnswerForWhatIs(q,packet.concepts);
    if(graphHit)return graphHit;
    if(/\b(remember|know)\b/.test(q) || /^(what|who|where|when)\b/.test(q)){
      var hit=bestMemory(raw,packet.memories,packet.concepts);
      if(hit){
        return {text:'I found this in my memory: "'+hit.memory.text+'"',confidence:'memory-grounded',meta:{kind:'memory',memoryId:hit.memory.id,score:hit.score}};
      }
      return {text:'I do not know. I could not find an answer in my memory.',confidence:'certain',meta:{kind:'unknown-memory'}};
    }
    return {text:'I heard you, but I do not understand that well enough to answer yet.',confidence:'certain',meta:{kind:'unknown-language'}};
  }
};

global.WRKMANBrain={BrainBus:BrainBus,none:none,firstWords:firstWords,protocol:'wrkman.brain.v1'};
})(window);
