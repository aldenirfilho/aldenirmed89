(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AVCTOOLS=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
// Ferramentas educacionais AldenirMed89 — edição 1.1. Funções puras, testáveis em Node, sem rede e sem persistência.
// Nenhuma função devolve "elegível", "indicar" ou "suspender": elas descrevem o critério usado e o número obtido.
const VERSION='1.1';
const num=x=>{if(x===''||x===null||x===undefined)return NaN;const n=Number(String(x).replace(',','.'));return Number.isFinite(n)?n:NaN;};

// ---- ABC/2 (Kothari 1996) ----
function abc2(a,b,c){
 const A=num(a),B=num(b),C=num(c);
 if([A,B,C].some(v=>!(v>0)))return{volume:null,text:'Informe A, B e C em centímetros (valores maiores que zero).'};
 const warnings=[];
 if([A,B,C].some(v=>v>15))warnings.push('Valor acima de 15 cm: confira se não digitou milímetros.');
 if(C>0&&C<0.3)warnings.push('C menor que 0,3 cm: confira número de cortes × espessura.');
 const volume=Math.round((A*B*C/2)*10)/10;
 return{volume,warnings,text:`≈ ${volume.toLocaleString('pt-BR')} mL (A×B×C÷2). Estimativa para hematoma elipsoide; hematomas irregulares exigem leitura radiológica.`};
}

// ---- Glasgow (Teasdale & Jennett 1974) ----
const gcsOptions={
 eye:[[4,'Espontânea'],[3,'Ao chamado'],[2,'À pressão/dor'],[1,'Ausente']],
 verbal:[[5,'Orientado'],[4,'Confuso'],[3,'Palavras inapropriadas'],[2,'Sons incompreensíveis'],[1,'Ausente']],
 motor:[[6,'Obedece comandos'],[5,'Localiza'],[4,'Retirada (flexão normal)'],[3,'Flexão anormal'],[2,'Extensão'],[1,'Ausente']]
};
function gcs(parts={}){
 const e=num(parts.eye),v=num(parts.verbal),m=num(parts.motor);
 const ok=e>=1&&e<=4&&v>=1&&v<=5&&m>=1&&m<=6;
 if(!ok)return{total:null,text:'Selecione olhos, verbal e motor. Paciente intubado: registre “V não testável (T)” e descreva; o total numérico fica incompleto.'};
 return{total:e+v+m,eye:e,verbal:v,motor:m,text:`Glasgow ${e+v+m} (O${e} V${v} M${m}).`};
}

// ---- WFNS (Teasdale, Drake, Hunt et al. 1988) ----
function wfns(gcsTotal,motorDeficit){
 const g=num(gcsTotal);const d=motorDeficit===true||motorDeficit==='yes'||motorDeficit==='true';
 if(!(g>=3&&g<=15)||(motorDeficit!==true&&motorDeficit!==false&&!['yes','no','true','false'].includes(String(motorDeficit))))return{grade:null,text:'Informe Glasgow (3–15) e se há déficit motor (afasia, hemiparesia ou hemiplegia).'};
 if(g===15&&!d)return{grade:'I',text:'WFNS I · Glasgow 15 sem déficit motor.'};
 if(g===15&&d)return{grade:null,text:'Glasgow 15 com déficit motor não consta na tabela original da WFNS. Descreva o déficit e registre a convenção do serviço; muitos serviços classificam como II — documente a escolha.'};
 if(g>=13)return d?{grade:'III',text:'WFNS III · Glasgow 13–14 com déficit motor.'}:{grade:'II',text:'WFNS II · Glasgow 13–14 sem déficit motor.'};
 if(g>=7)return{grade:'IV',text:'WFNS IV · Glasgow 7–12, com ou sem déficit motor.'};
 return{grade:'V',text:'WFNS V · Glasgow 3–6, com ou sem déficit motor. Registre sedação e horário: sedado não é grau V.'};
}

// ---- ICH Score (Hemphill 2001) ----
function ichScore(p={}){
 const g=num(p.gcs);const vol=num(p.volume);
 const b=x=>x===true||x==='yes'||x==='true';
 const tri=x=>x===true||x===false||['yes','no','true','false'].includes(String(x));
 if(!(g>=3&&g<=15)||!(vol>=0)||!tri(p.infratentorial)||!tri(p.ivh)||!tri(p.age80))return{score:null,text:'Informe Glasgow, volume (mL), idade ≥80, origem infratentorial e sangue ventricular.'};
 const gcsPts=g<=4?2:g<=12?1:0;const agePts=b(p.age80)?1:0;const volPts=vol>=30?1:0;const infPts=b(p.infratentorial)?1:0;const ivhPts=b(p.ivh)?1:0;
 const score=gcsPts+agePts+volPts+infPts+ivhPts;
 return{score,components:{gcs:gcsPts,age:agePts,volume:volPts,infratentorial:infPts,ivh:ivhPts},
  text:`ICH Score ${score}/6 · Glasgow ${gcsPts} + idade ${agePts} + volume ${volPts} + infratentorial ${infPts} + IVH ${ivhPts}. Escala de gravidade derivada de 152 pacientes; não decide futilidade nem limitação de suporte de um indivíduo.`};
}

// ---- Fisher original (Fisher, Kistler, Davis 1980) ----
function fisherOriginal(pattern,ivh,iph){
 const b=x=>x===true||x==='yes'||x==='true';const tri=x=>x===true||x===false||['yes','no','true','false'].includes(String(x));
 if(!['none','diffuse_thin','localized_thick'].includes(pattern)||!tri(ivh)||!tri(iph))return{grade:null,text:'Selecione o padrão subaracnóideo e informe sangue ventricular e parenquimatoso.'};
 const clot=b(ivh)||b(iph);
 if(clot&&pattern==='localized_thick')return{grade:null,text:'Padrão misto (coágulo espesso/localizado + sangue ventricular ou parenquimatoso): fora das quatro definições originais. Descreva o padrão e registre também o Fisher modificado.'};
 if(clot)return{grade:'IV',text:'Fisher original IV · sangue intraventricular ou intraparenquimatoso com HSA difusa ou ausente. IV não é “mais que III”: a associação clássica com vasoespasmo é do grau III.'};
 if(pattern==='none')return{grade:'I',text:'Fisher original I · sem sangue subaracnóideo detectável na TC.'};
 if(pattern==='diffuse_thin')return{grade:'II',text:'Fisher original II · sangue difuso ou camada fina (<1 mm), sem coágulo localizado.'};
 return{grade:'III',text:'Fisher original III · coágulo localizado (>5×3 mm) e/ou camada ≥1 mm em fissura/cisterna vertical — padrão classicamente associado a vasoespasmo.'};
}

// ---- Relógio do código AVC ----
// Recebe datas ISO (ou objetos Date). Devolve horas decorridas desde a última vez bem e as janelas de SELEÇÃO que ainda estão abertas.
// As janelas são limites de triagem de diretrizes/ensaios, não autorização de tratamento.
const WINDOWS=[
 {h:4.5,label:'≤4,5 h da última vez bem',note:'janela de trombólise IV (alteplase/tenecteplase) para pacientes elegíveis'},
 {h:6,label:'≤6 h',note:'trombectomia em oclusão de grande vaso com seleção habitual'},
 {h:9,label:'≤9 h',note:'trombólise selecionada por perfusão (EXTEND) ou discrepância difusão/FLAIR ao despertar (WAKE-UP)'},
 {h:16,label:'≤16 h',note:'trombectomia selecionada por perfusão (DEFUSE 3)'},
 {h:24,label:'≤24 h',note:'trombectomia selecionada por discrepância clínica/imagem (DAWN), grandes núcleos selecionados e oclusão basilar com NIHSS ≥10 (diretriz 2026)'}
];
function clock(lkw,discovery,now){
 const toDate=x=>x instanceof Date?x:(x?new Date(x):null);
 const L=toDate(lkw),D=toDate(discovery),N=toDate(now)||new Date();
 if(!L||isNaN(L))return{hours:null,text:'Informe a última vez visto bem (data e hora).'};
 const hours=Math.round(((N-L)/36e5)*100)/100;
 if(hours<0)return{hours,text:'A última vez bem está no futuro: confira data/hora.'};
 const open=WINDOWS.filter(w=>hours<=w.h),closed=WINDOWS.filter(w=>hours>w.h);
 let gap=null;if(D&&!isNaN(D)){gap=Math.round(((D-L)/36e5)*100)/100;}
 const parts=[`${hours.toLocaleString('pt-BR')} h desde a última vez bem.`];
 if(gap!==null&&gap>0)parts.push(`Descoberta ${gap.toLocaleString('pt-BR')} h depois: início real desconhecido — registre os dois horários; imagem avançada pode selecionar (WAKE-UP/EXTEND).`);
 parts.push(open.length?`Janelas de seleção ainda abertas: ${open.map(w=>w.label).join(', ')}.`:'Todas as janelas habituais de seleção passaram; ainda assim, déficit incapacitante exige avaliação especializada.');
 parts.push('Isto é um relógio, não uma decisão: elegibilidade depende de imagem, contraindicações, déficit e equipe.');
 return{hours,gap,open,closed,text:parts.join(' ')};
}

// ---- Plano de revisão espaçada ----
function spacedSchedule(start){
 const s=start instanceof Date?start:(start?new Date(start):new Date());
 if(isNaN(s))return[];
 return[1,7,14,30].map(d=>{const dt=new Date(s.getTime());dt.setDate(dt.getDate()+d);return{label:'D'+d,days:d,date:dt.toISOString().slice(0,10)};});
}

// ---- Embaralhar (determinístico se semente informada) ----
function shuffle(arr,seed){
 const a=arr.slice();let s=typeof seed==='number'?seed:Math.floor(Math.random()*2**31);
 const rnd=()=>{s=(s*1103515245+12345)%2147483648;return s/2147483648;};
 for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
 return a;
}

return{VERSION,abc2,gcs,gcsOptions,wfns,ichScore,fisherOriginal,clock,WINDOWS,spacedSchedule,shuffle};});
