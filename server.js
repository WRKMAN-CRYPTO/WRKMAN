const http=require('http');
const dns=require('dns').promises;
const net=require('net');
const {JSDOM}=require('jsdom');
const {Readability}=require('@mozilla/readability');

const PORT=process.env.PORT||3000;
function privateIP(ip){
  if(net.isIP(ip)===4){const p=ip.split('.').map(Number);return p[0]===10||p[0]===127||p[0]===0||(p[0]===169&&p[1]===254)||(p[0]===172&&p[1]>=16&&p[1]<=31)||(p[0]===192&&p[1]===168);}
  if(net.isIP(ip)===6){const x=ip.toLowerCase();return x==='::1'||x==='::'||x.startsWith('fc')||x.startsWith('fd')||x.startsWith('fe8')||x.startsWith('fe9')||x.startsWith('fea')||x.startsWith('feb');}
  return true;
}
async function safeURL(raw){
  const u=new URL(raw);if(!['http:','https:'].includes(u.protocol))throw Error('Only HTTP/HTTPS is allowed.');
  if(u.username||u.password)throw Error('Credentialed URLs are not allowed.');
  const addrs=await dns.lookup(u.hostname,{all:true});if(!addrs.length||addrs.some(x=>privateIP(x.address)))throw Error('Private/local destinations are not allowed.');
  return u;
}
function cors(res){res.setHeader('Access-Control-Allow-Origin','https://wrkman-crypto.github.io');res.setHeader('Access-Control-Allow-Methods','GET,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');}
http.createServer(async(req,res)=>{
  cors(res);if(req.method==='OPTIONS'){res.writeHead(204);return res.end()}
  if(req.url==='/health'){res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:true,service:'wrkman-reader'}))}
  const here=new URL(req.url,'http://local');
  if(here.pathname!=='/read'){res.writeHead(404);return res.end('not found')}
  try{
    let target=await safeURL(here.searchParams.get('url')||'');
    let response;
    for(let hops=0;hops<5;hops++){
      response=await fetch(target,{redirect:'manual',headers:{'User-Agent':'WRKMAN-Reader/0.8 (+public reading tool)','Accept':'text/html,text/plain;q=0.9'}});
      if(response.status>=300&&response.status<400&&response.headers.get('location')){target=await safeURL(new URL(response.headers.get('location'),target).href);continue}
      break;
    }
    if(!response||!response.ok)throw Error('Source returned HTTP '+(response?response.status:'unknown'));
    const type=response.headers.get('content-type')||'';if(!/text\/html|text\/plain/.test(type))throw Error('Source is not readable HTML/text.');
    const html=(await response.text()).slice(0,2000000);
    let title='',text='';
    if(type.includes('text/plain'))text=html;
    else{const dom=new JSDOM(html,{url:target.href});const article=new Readability(dom.window.document).parse();if(article){title=article.title||'';text=article.textContent||''}else{text=dom.window.document.body?dom.window.document.body.textContent:'';title=dom.window.document.title||''}}
    text=String(text).replace(/\s+\n/g,'\n').replace(/\n\s+/g,'\n').replace(/[ \t]{2,}/g,' ').replace(/\n{3,}/g,'\n\n').trim();
    if(text.length<120)throw Error('No substantial readable text returned.');
    res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
    res.end(JSON.stringify({ok:true,url:target.href,title:String(title).trim().slice(0,300),text:text.slice(0,120000),chars:Math.min(text.length,120000)}));
  }catch(e){res.writeHead(422,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify({ok:false,error:e.message||'Read failed'}))}
}).listen(PORT,()=>console.log('WRKMAN reader listening on '+PORT));
