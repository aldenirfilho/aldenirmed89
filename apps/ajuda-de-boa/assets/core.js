/* Bolsa de Ajuda 360. Implementação original. Nenhuma chamada de rede.
   BR Code Pix estático + QR versão 8-L, máscara 0. Não envia nem confirma pagamentos. */
(function(root){
'use strict';
const MAX_CENTS=9999999;
function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function cents(value){
 let s=String(value??'').trim().replace(/^R\$\s*/,'');
 if(/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(s))s=s.replace(/\./g,'').replace(',','.');
 else if(/^\d+(,\d{1,2})?$/.test(s))s=s.replace(',','.');
 else if(!/^\d+(\.\d{1,2})?$/.test(s))throw Error('Informe um valor com até duas casas decimais.');
 const [a,b='']=s.split('.');const result=Number(a)*100+Number((b+'00').slice(0,2));
 if(!Number.isSafeInteger(result)||result<1||result>MAX_CENTS)throw Error('O valor deve estar entre R$ 0,01 e R$ 99.999,99.');
 return result;
}
function cash(n){return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n/100);}
function crc16(s){let crc=0xffff;for(const c of new TextEncoder().encode(s)){crc^=c<<8;for(let i=0;i<8;i++)crc=(crc&0x8000)?((crc<<1)^0x1021):(crc<<1);crc&=0xffff;}return crc.toString(16).toUpperCase().padStart(4,'0');}
function field(id,s){s=String(s);const l=new TextEncoder().encode(s).length;if(l>99)throw Error('Campo Pix extenso demais.');return id+String(l).padStart(2,'0')+s;}
function ascii(s,max){return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9 $%*+\-./:]/g,'').slice(0,max).trim();}
function pix(recipient,amount){
 if(!recipient||!recipient.key||!recipient.name||!recipient.city)throw Error('Não há uma chave Pix publicada para esta causa.');
 if(!Number.isSafeInteger(amount)||amount<1||amount>MAX_CENTS)throw Error('Valor inválido.');
 if(!/^[\x20-\x7E]{1,77}$/.test(recipient.key))throw Error('Chave Pix inválida.');
 const name=ascii(recipient.name,25),city=ascii(recipient.city,15);if(!name||!city)throw Error('Recebedor incompleto.');
 const s=field('00','01')+field('01','11')+field('26',field('00','br.gov.bcb.pix')+field('01',recipient.key))+field('52','0000')+field('53','986')+field('54',(amount/100).toFixed(2))+field('58','BR')+field('59',name)+field('60',city)+field('62',field('05','***'))+'6304';
 return s+crc16(s);
}
function qrMatrix(text){
 const bytes=new TextEncoder().encode(text);if(bytes.length>192)throw Error('Código extenso demais para este gerador. Use o site oficial.');
 const bits=[];const push=(v,len)=>{for(let i=len-1;i>=0;i--)bits.push((v>>>i)&1);};
 push(4,4);push(bytes.length,8);for(const b of bytes)push(b,8);
 const remaining=Math.min(4,1552-bits.length);for(let i=0;i<remaining;i++)bits.push(0);
 while(bits.length%8)bits.push(0);
 const data=[];for(let i=0;i<bits.length;i+=8){let b=0;for(let j=0;j<8;j++)b=(b<<1)|bits[i+j];data.push(b);}
 let pad=0;while(data.length<194)data.push((pad++%2)?0x11:0xec);
 const exp=new Uint8Array(512),log=new Uint8Array(256);let x=1;
 for(let i=0;i<255;i++){exp[i]=x;log[x]=i;x<<=1;if(x&256)x^=0x11d;}for(let i=255;i<512;i++)exp[i]=exp[i-255];
 const mul=(a,b)=>(a===0||b===0)?0:exp[log[a]+log[b]];
 let gen=[1];for(let i=0;i<24;i++){const next=Array(gen.length+1).fill(0);for(let j=0;j<gen.length;j++){next[j]^=gen[j];next[j+1]^=mul(gen[j],exp[i]);}gen=next;}
 const blocks=[data.slice(0,97),data.slice(97)];const ecc=blocks.map(b=>{const r=b.concat(Array(24).fill(0));for(let i=0;i<97;i++){const factor=r[i];if(factor)for(let j=0;j<gen.length;j++)r[i+j]^=mul(gen[j],factor);}return r.slice(97);});
 const words=[];for(let i=0;i<97;i++)for(let b=0;b<2;b++)words.push(blocks[b][i]);for(let i=0;i<24;i++)for(let b=0;b<2;b++)words.push(ecc[b][i]);
 const n=49,m=Array.from({length:n},()=>Array(n).fill(null));
 const finder=(r,c)=>{for(let y=-1;y<=7;y++)for(let z=-1;z<=7;z++){const yy=r+y,xx=c+z;if(yy<0||xx<0||yy>=n||xx>=n)continue;m[yy][xx]=(y>=0&&y<=6&&z>=0&&z<=6&&(y===0||y===6||z===0||z===6||(y>=2&&y<=4&&z>=2&&z<=4)));}};
 finder(0,0);finder(n-7,0);finder(0,n-7);
 for(const r of [6,24,42])for(const c of [6,24,42]){if(m[r][c]!==null)continue;for(let y=-2;y<=2;y++)for(let z=-2;z<=2;z++)m[r+y][c+z]=(Math.abs(y)===2||Math.abs(z)===2||(y===0&&z===0));}
 for(let i=8;i<n-8;i++){if(m[i][6]===null)m[i][6]=i%2===0;if(m[6][i]===null)m[6][i]=i%2===0;}
 const bitLen=v=>{let k=0;while(v){v>>>=1;k++;}return k;};
 const bch=(value,shift,poly)=>{let v=value<<shift;while(bitLen(v)>=bitLen(poly))v^=poly<<(bitLen(v)-bitLen(poly));return(value<<shift)|v;};
 const format=bch(8,10,0x537)^0x5412;
 for(let i=0;i<15;i++){const b=!!((format>>>i)&1);const r=i<6?i:i<8?i+1:n-15+i;m[r][8]=b;const c=i<8?n-i-1:i<9?15-i:15-i-1;m[8][c]=b;}
 m[n-8][8]=true;
 const version=bch(8,12,0x1f25);for(let i=0;i<18;i++){const b=!!((version>>>i)&1);m[Math.floor(i/3)][i%3+n-11]=b;m[i%3+n-11][Math.floor(i/3)]=b;}
 let row=n-1,direction=-1,index=0;
 for(let col=n-1;col>0;col-=2){if(col===6)col--;while(true){for(let c=col;c>=col-1;c--){if(m[row][c]!==null)continue;const bit=index<words.length*8?!!((words[index>>>3]>>>(7-(index&7)))&1):false;m[row][c]=((row+c)%2===0)?!bit:bit;index++;}row+=direction;if(row<0||row>=n){row-=direction;direction=-direction;break;}}}
 return m;
}
function qrSvg(text){const m=qrMatrix(text);let d='';for(let r=0;r<m.length;r++)for(let c=0;c<m.length;c++)if(m[r][c])d+='M'+(c+4)+' '+(r+4)+'h1v1h-1z';return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 57 57" width="285" height="285" role="img" aria-label="QR Code Pix. Confira o recebedor no aplicativo do banco." shape-rendering="crispEdges"><rect width="57" height="57" fill="white"/><path d="'+d+'" fill="black"/></svg>';}
function b64(bytes){let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s);}
function unb64(s){return Uint8Array.from(atob(s),c=>c.charCodeAt(0));}
const api={MAX_CENTS,esc,cents,cash,crc16,pix,qrMatrix,qrSvg,b64,unb64};root.BA360=Object.freeze(api);if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
