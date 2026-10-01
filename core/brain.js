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
  recentJournal: array
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

global.WRKMANBrain={BrainBus:BrainBus,none:none,protocol:'wrkman.brain.v1'};
})(window);
