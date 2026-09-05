
(function(){
"use strict";
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
function store(k,v){try{if(v===undefined){var x=localStorage.getItem(k);return x?JSON.parse(x):null}localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}}
function norm(s){return (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}

/* ===================== Navegação ativa ===================== */
var navLinks=$$("#nm-nav a");
var sections=$$(".nm-section");
if("IntersectionObserver" in window){
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){
        var id=en.target.id;
        navLinks.forEach(function(a){a.classList.toggle("active",a.getAttribute("href")==="#"+id)});
      }
    });
  },{rootMargin:"-20% 0px -70% 0px",threshold:0});
  sections.forEach(function(s){io.observe(s)});
}
$("#btn-top").addEventListener("click",function(){window.scrollTo({top:0,behavior:"smooth"})});

/* ===================== Busca ===================== */
var searchBox=$("#nm-search"), searchHint=$("#nm-search-hint");
var blocks=$$(".block[data-search], .tabpanel[data-search]");
var hideOnSearch=$$(".bench, .nm-hero, .nm-section > .intro");
function runSearch(){
  var q=norm(searchBox.value.trim());
  if(!q){
    blocks.forEach(function(b){b.classList.remove("hidden-by-search")});
    hideOnSearch.forEach(function(b){b.classList.remove("hidden-by-search")});
    $$(".tabpanel").forEach(function(p){p.classList.toggle("show",p.id===activeTab)});
    searchHint.textContent="ex.: Wallenberg, C7, Horner, afasia";
    return;
  }
  var n=0;
  blocks.forEach(function(b){
    var hit=norm(b.textContent).indexOf(q)>=0;
    b.classList.toggle("hidden-by-search",!hit);
    if(b.classList.contains("tabpanel")) b.classList.toggle("show",hit);
    if(hit) n++;
  });
  hideOnSearch.forEach(function(b){b.classList.add("hidden-by-search")});
  searchHint.innerHTML='<span class="search-count">'+n+' bloco'+(n===1?"":"s")+'</span> com "'+esc(searchBox.value.trim())+'"';
}
searchBox.addEventListener("input",runSearch);

/* ===================== Abas ===================== */
var activeTab="qt1";
$$("#qt-tabs button").forEach(function(b){
  b.addEventListener("click",function(){
    activeTab=b.dataset.tab;
    $$("#qt-tabs button").forEach(function(x){x.setAttribute("aria-selected",x===b?"true":"false")});
    $$(".tabpanel").forEach(function(p){p.classList.toggle("show",p.id===activeTab)});
  });
});

/* ===================== Checklist do exame ===================== */
var EXAM=[
 ["Estado mental",[
  ["Nível de consciência","Glasgow por componente ou FOUR; RASS na UTI"],
  ["Atenção","Meses ao contrário, span de dígitos, CAM-ICU"],
  ["Orientação e memória","Tempo, espaço, pessoa; 3 palavras aos 5 min"],
  ["Linguagem em 6 etapas","Fluência, compreensão, repetição, nomeação, leitura, escrita"],
  ["Praxia e gnosia","Gestos, cópia, extinção à dupla estimulação"],
  ["Funções executivas e reflexos primitivos","Fluência verbal, Luria, preensão, palmomentoniano"]]],
 ["Nervos cranianos",[
  ["I — olfato","Café ou sabão por narina"],
  ["II — acuidade, campos, fundo de olho","Confrontação em 4 quadrantes; papila"],
  ["Pupilas","Tamanho na luz e no escuro, fotomotor direto e consensual, lanterna oscilante"],
  ["III, IV, VI — motricidade ocular","Ducções, alinhamento, ptose, nistagmo, INO"],
  ["V — sensibilidade, corneano, mastigação","Três divisões; desvio da mandíbula; reflexo mandibular"],
  ["VII — mímica facial","Fronte, olhos, boca; gustação e hiperacusia se periférica"],
  ["VIII — audição e vestibular","Sussurro, Weber/Rinne; HINTS apenas na síndrome vestibular aguda com nistagmo, por examinador treinado"],
  ["IX, X — palato, voz, deglutição","Úvula, reflexo do vômito, tosse"],
  ["XI — esternocleidomastóideo e trapézio","Rotação da cabeça, elevação dos ombros"],
  ["XII — língua","Desvio, atrofia, fasciculações"]]],
 ["Motor",[
  ["Inspeção","Atrofia, fasciculações, posturas, movimentos anormais"],
  ["Tônus","Espasticidade, rigidez, paratonia, hipotonia"],
  ["Força MRC por segmento","Proximal e distal, quatro membros; padrão piramidal"],
  ["Manobras deficitárias","Braços estendidos com pronação, Mingazzini, Barré"]]],
 ["Reflexos",[
  ["Profundos","Bicipital, estilorradial, tricipital, patelar, aquileu — simetria"],
  ["Cutâneo-plantar","Babinski e equivalentes"],
  ["Hoffmann e clônus","Sinais de UMN cervical/lombar"],
  ["Cutâneo-abdominais","Se suspeita de mielopatia ou EM"]]],
 ["Sensibilidade",[
  ["Dor e temperatura","Palito, frio; busca de nível e dissociação"],
  ["Tátil","Algodão"],
  ["Vibração e propriocepção","Diapasão 128 Hz distal; posição do hálux"],
  ["Cortical","Grafestesia, estereognosia, extinção (se modalidades primárias normais)"],
  ["Nível sensitivo e dermátomos","Tronco de baixo para cima; sela se esfíncter"]]],
 ["Coordenação",[
  ["Índex-nariz e calcanhar-joelho","Dismetria, tremor de intenção"],
  ["Diadococinesia e rechaço","Pronação-supinação; Stewart-Holmes"]]],
 ["Marcha e equilíbrio",[
  ["Marcha comum e tandem","Base, braços, circundução, festinação"],
  ["Ponta dos pés e calcanhares","S1 e L4–L5"],
  ["Romberg","Piora nítida ao fechar os olhos"],
  ["Pull test","Instabilidade postural"]]],
 ["Meninges e fechamento",[
  ["Sinais meníngeos","Rigidez de nuca, Kernig, Brudzinski"],
  ["Sinais funcionais positivos (se indicado)","Hoover, give-way, entrainment"],
  ["Registro comparável","Descreva o achado, não a interpretação; permita comparação por turno"]]]
];
(function(){
  var grid=$("#exam-grid"), total=0, saved=store("nm_exam_v1")||{};
  EXAM.forEach(function(g,gi){
    var box=document.createElement("div");
    box.innerHTML="<h4>"+esc(g[0])+"</h4>";
    g[1].forEach(function(it,ii){
      var id="ex"+gi+"_"+ii; total++;
      var lab=document.createElement("label"); lab.className="chk";
      lab.innerHTML='<input type="checkbox" id="'+id+'"'+(saved[id]?" checked":"")+'><span>'+esc(it[0])+'<small>'+esc(it[1])+'</small></span>';
      if(saved[id]) lab.classList.add("on");
      box.appendChild(lab);
    });
    grid.appendChild(box);
  });
  function update(){
    var n=0, st={};
    $$("#exam-grid input").forEach(function(i){i.parentNode.classList.toggle("on",i.checked);if(i.checked){n++;st[i.id]=1}});
    $("#exam-count").textContent=n+" / "+total;
    $("#exam-fill").style.width=(100*n/total)+"%";
    store("nm_exam_v1",st);
  }
  grid.addEventListener("change",update);
  $("#exam-reset").addEventListener("click",function(){$$("#exam-grid input").forEach(function(i){i.checked=false});update()});
  update();
})();

/* ===================== Classificador de afasia ===================== */
var APH={
 "nf-ok-bad":{n:"Afasia de Broca",t:"Giro frontal inferior posterior (áreas 44/45), opérculo frontal e substância branca subjacente — hemisfério dominante",a:"ACM, divisão superior",s:"Fala esforçada, telegráfica, agramática; nomeação e escrita ruins; compreensão relativamente preservada (falha em sintaxe complexa). Hemiparesia braquiofacial direita, apraxia bucofacial, desvio do olhar. Paciente consciente do déficit.",p:"Afemia (só fala) e apraxia da fala são diferenciais com lesão menor. Se recupera, tende a anômica."},
 "f-bad-bad":{n:"Afasia de Wernicke",t:"Giro temporal superior posterior (área 22) — hemisfério dominante",a:"ACM, divisão inferior",s:"Fala fluente com parafasias e neologismos, jargão; não compreende nem repete; anosognosia. Sem paresia. Quadrantanopsia superior direita frequente.",p:"Confundida com psicose, delirium ou demência. Exame: ordens de linha média são preservadas mesmo aqui — use ordens apendiculares."},
 "f-ok-bad":{n:"Afasia de condução",t:"Fascículo arqueado, giro supramarginal, ínsula — hemisfério dominante",a:"Ramos parietais da ACM",s:"Fala fluente com parafasias fonêmicas e tentativas de autocorreção; compreensão boa; repetição desproporcionalmente ruim, sobretudo de frases longas e palavras sem sentido.",p:"O eixo que a separa de Wernicke é a compreensão preservada."},
 "nf-bad-bad":{n:"Afasia global",t:"Todo o território perissilviano — frontal, temporal e parietal dominantes",a:"ACM proximal (M1) ou carótida",s:"Mutismo ou estereotipias; não compreende, não repete; hemiplegia direita, hemianopsia, desvio do olhar.",p:"Prognóstico de linguagem ruim; se melhora, vira Broca. Sem hemiparesia: lesões separadas frontal + temporal (embólicas)."},
 "nf-ok-ok":{n:"Afasia transcortical motora",t:"Frontal dorsolateral ou área motora suplementar, anterior/superior a Broca; poupa a área perissilviana",a:"Zona limítrofe ACA–ACM; ACA",s:"Fala reduzida, dificuldade em iniciar, respostas curtas; repete bem (até ecolalia); compreende. Paresia crural, abulia.",p:"Hipoperfusão (hipotensão, estenose carotídea) é causa típica das transcorticais."},
 "f-bad-ok":{n:"Afasia transcortical sensitiva",t:"Têmporo-parieto-occipital, posterior a Wernicke; poupa a área perissilviana",a:"Zona limítrofe ACM–ACP",s:"Fluente, vazia, com parafasias semânticas; não compreende; repete sem entender (ecolalia). Anomia grave. Hemianopsia possível.",p:"Vista em Alzheimer avançado e após parada cardíaca."},
 "nf-bad-ok":{n:"Afasia transcortical mista (isolamento da área da linguagem)",t:"Zonas limítrofes anterior e posterior simultâneas; área perissilviana isolada",a:"Hipoperfusão global ou oclusão carotídea com colaterais pobres",s:"Só repete: ecolalia, completa frases e provérbios; não fala espontaneamente nem compreende.",p:"Padrão de parada cardíaca, intoxicação por CO e oclusão carotídea."},
 "f-ok-ok":{n:"Afasia anômica",t:"Giro angular, temporal inferior — pouco localizatória",a:"Variável; também não vascular",s:"Fluente com circunlóquios e pausas para achar palavras; compreende e repete; nomeação ruim.",p:"Estágio final de recuperação de qualquer afasia; ocorre em encefalopatia, demência, lesões expansivas e enxaqueca."}
};
(function(){
  var st={flu:"nf",comp:"ok",rep:"bad"};
  function render(){
    var key=st.flu+"-"+st.comp+"-"+st.rep, d=APH[key];
    $$("#aph-table tbody tr").forEach(function(tr){tr.classList.toggle("hl",tr.dataset.key===key)});
    $("#aph-verdict").innerHTML='<div class="title">'+esc(d.n)+'</div><dl class="dl"><dt>Topografia</dt><dd>'+esc(d.t)+'</dd><dt>Artéria</dt><dd>'+esc(d.a)+'</dd><dt>Quadro</dt><dd>'+esc(d.s)+'</dd><dt>Nota</dt><dd>'+esc(d.p)+'</dd></dl>';
  }
  $$("#aph-bench .seg").forEach(function(seg){
    seg.addEventListener("click",function(e){
      var b=e.target.closest("button"); if(!b) return;
      st[seg.dataset.axis]=b.dataset.v;
      $$("button",seg).forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false")});
      render();
    });
  });
  render();
})();

/* ===================== Paralisia facial ===================== */
(function(){
  var fronte="sim";
  var seg=$('#fac-bench .seg[data-fac="fronte"]');
  seg.addEventListener("click",function(e){
    var b=e.target.closest("button"); if(!b) return;
    fronte=b.dataset.v;
    $$("button",seg).forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false")});
    render();
  });
  $$("#fac-bench input").forEach(function(i){i.addEventListener("change",function(){i.parentNode.classList.toggle("on",i.checked);render()})});
  function on(sel){var el=$('#fac-bench input[data-fp="'+sel+'"]');return el&&el.checked}
  function onc(sel){var el=$('#fac-bench input[data-fc="'+sel+'"]');return el&&el.checked}
  function render(){
    var v=$("#fac-verdict"), html="";
    $("#fac-periph-opts").style.display=fronte==="sim"?"":"none";
    $("#fac-central-opts").style.display=fronte==="nao"?"":"none";
    if(fronte==="nao"){
      var topo="Lesão supranuclear contralateral à face: córtex motor (opérculo), coroa radiada, cápsula interna (joelho) ou fibras corticobulbares na ponte acima do núcleo do VII.";
      var extra=[];
      if(onc("afasia")) extra.push("Afasia ou negligência colocam a lesão no córtex (ACM); o lado se define pela dominância.");
      if(onc("hemi")) extra.push("Hemiparesia proporcionada do mesmo lado da face sem sinal cortical aponta para cápsula interna ou base da ponte (lacuna).");
      if(onc("dissoc")) extra.push("Dissociação automático-voluntária: paresia só ao comando = via piramidal (córtex/cápsula); paresia só emocional = tálamo, núcleos da base ou frontal medial/área motora suplementar.");
      html='<div class="title">Fronte relativamente poupada — padrão supranuclear provável</div><dl class="dl"><dt>Topografia</dt><dd>'+topo+'</dd><dt>Lado</dt><dd>Lesão contralateral à hemiface paralisada.</dd>'+(extra.length?'<dt>Refinamento</dt><dd>'+extra.join(" ")+'</dd>':'')+'<dt>Conduta</dt><dd>Trate como déficit central agudo: glicemia, TC/angio-TC, janela de trombólise/trombectomia, NIHSS.</dd></dl>';
    } else {
      var lvl,why,extra2=[],alarm=[];
      if(on("ponte")){lvl="Núcleo ou fascículo do VII na ponte";why="VI ipsilateral, paralisia do olhar conjugado ou hemiparesia contralateral acompanham a paralisia periférica: síndrome de Millard-Gubler ou Foville. Não é Bell."; alarm.push("AVC de tronco, tumor, EM: imagem de urgência (RM).")}
      else if(on("apc")){lvl="Ângulo pontocerebelar / meato acústico interno";why="Hipoacusia neurossensorial, zumbido, vertigem (VIII), hipoestesia facial ou corneano abolido (V) e ataxia ipsilateral indicam lesão na cisterna: schwannoma vestibular, meningioma, cisto epidermoide."; alarm.push("RM com gadolínio do ângulo pontocerebelar.")}
      else if(on("lacri")){lvl="Gânglio geniculado ou proximal (meato acústico interno)";why="Lacrimejamento reduzido implica lesão do nervo petroso maior, que sai no gânglio geniculado; hiperacusia e disgeusia costumam coexistir."; if(on("vesic")) extra2.push("Vesículas com otalgia: síndrome de Ramsay Hunt (VZV) — antiviral + corticoide, prognóstico pior que Bell.")}
      else if(on("hiper")){lvl="Canal do facial, entre o gânglio geniculado e o ramo do estapédio";why="Hiperacusia (estapédio) com lacrimejamento normal; disgeusia presente se a lesão for proximal à corda do tímpano. Padrão frequente na paralisia de Bell."}
      else if(on("gust")){lvl="Canal do facial, entre o ramo do estapédio e a corda do tímpano";why="Disgeusia dos 2/3 anteriores com hiperacusia e lacrimejamento normais: lesão distal ao estapédio (otite média, mastoidite, cirurgia otológica, Bell)."}
      else {lvl="Distal à corda do tímpano (forame estilomastóideo, parótida) — ou canal do facial sem ramos testados";why="Paralisia motora pura. Se de instalação aguda e isolada: paralisia de Bell. Se progressiva ou por ramos: parótida."}
      if(on("vesic")&&!on("lacri")) extra2.push("Vesículas no pavilhão ou conduto: Ramsay Hunt (VZV) — antiviral + corticoide.");
      if(on("bilat")) alarm.push("Bilateral: Guillain-Barré, Lyme, sarcoidose, HIV, meningite carcinomatosa ou linfomatosa, Melkersson-Rosenthal, Möbius. LCR, sorologias, imagem.");
      if(on("lenta")) alarm.push("Progressão lenta, recorrência ipsilateral, massa parotídea ou acometimento por ramos: neoplasia (parótida, schwannoma do facial) — RM e avaliação otorrinolaringológica.");
      if(on("semrec")) alarm.push("Sem recuperação em 3–4 meses: não é Bell até prova em contrário — RM com contraste do trajeto do facial e ENMG.");
      html='<div class="title">Padrão de hemiface inteira — investigar nível</div><dl class="dl"><dt>Nível provável</dt><dd>'+lvl+'</dd><dt>Por quê</dt><dd>'+why+(extra2.length?" "+extra2.join(" "):"")+'</dd>'+(alarm.length?'<dt>Alarme</dt><dd>'+alarm.join(" ")+'</dd>':'<dt>Se Bell</dt><dd>Corticoide em até 72 h (prednisona 60 mg/dia 5 dias com redução, ou 50 mg/dia 10 dias), valaciclovir opcional, proteção ocular, House-Brackmann na evolução.</dd>')+'</dl>';
    }
    v.innerHTML=html;
  }
  render();
})();

/* ===================== Via óptica ===================== */
var VIS={
 "1":{n:"Nervo óptico esquerdo",d:"Amaurose do olho esquerdo (perda de todo o campo do OE)",lost:["oe-sl","oe-sr","oe-il","oe-ir","oe-mac"],p:"DPAR à esquerda; acuidade e cores reduzidas. Ao iluminar o olho com lesão aferente grave, respostas direta e consensual são reduzidas; ao iluminar o olho são, ambas respondem se as vias eferentes estiverem íntegras. Neurite óptica (dor ao mover o olho), NOIA, compressão, oclusão de artéria central."},
 "2":{n:"Quiasma óptico",d:"Hemianopsia bitemporal (fibras nasais cruzadas dos dois olhos)",lost:["oe-sl","oe-il","od-sr","od-ir"],p:"Começa nos quadrantes superiores quando a compressão vem de baixo (adenoma hipofisário); craniofaringioma comprime de cima. Sintoma: colide com objetos laterais, dificuldade de fusão."},
 "3":{n:"Trato óptico esquerdo",d:"Hemianopsia homônima direita, incongruente",lost:["oe-sr","oe-ir","od-sr","od-ir"],p:"Hemianopsia homônima que pode acompanhar DPAR (no olho contralateral, direito, que contribui com mais fibras cruzadas). Atrofia óptica em gravata-borboleta tardia."},
 "4":{n:"Alça de Meyer esquerda (lobo temporal)",d:"Quadrantanopsia superior homônima direita — pie in the sky",lost:["oe-sr","od-sr"],p:"Fibras da retina inferior fazem a alça pelo temporal. Companhia: Wernicke (dominante), crises temporais, amnésia."},
 "5":{n:"Radiação parietal esquerda",d:"Quadrantanopsia inferior homônima direita — pie on the floor",lost:["oe-ir","od-ir"],p:"Fibras da retina superior sobem direto pelo parietal. Companhia: negligência (se direita), Gerstmann (se esquerda), perda sensitiva cortical."},
 "6":{n:"Córtex occipital esquerdo (ACP)",d:"Hemianopsia homônima direita congruente com preservação macular",lost:["oe-sr","oe-ir","od-sr","od-ir"],spare:["oe-mac","od-mac"],p:"A mácula tem representação ampla no polo occipital com dupla irrigação (ACM/ACP). Sem paresia, sem DPAR. Alexia sem agrafia se o esplênio estiver incluído."}
};
(function(){
  var quads=["oe-sl","oe-sr","oe-il","oe-ir","od-sl","od-sr","od-il","od-ir"], macs=["oe-mac","od-mac"];
  function show(k){
    var d=VIS[k];
    $$("#vis-svg .hot").forEach(function(h){h.classList.toggle("on",h.dataset.lesion===k)});
    quads.forEach(function(id){$("#"+id).classList.toggle("lost",d.lost.indexOf(id)>=0)});
    macs.forEach(function(id){var el=$("#"+id);el.classList.remove("lost","spared");if(d.lost.indexOf(id)>=0)el.classList.add("lost");else if(d.spare&&d.spare.indexOf(id)>=0)el.classList.add("spared")});
    $("#vis-verdict").innerHTML='<div class="title">'+k+' · '+esc(d.n)+'</div><dl class="dl"><dt>Defeito</dt><dd>'+esc(d.d)+'</dd><dt>Pistas</dt><dd>'+esc(d.p)+'</dd></dl>';
  }
  $$("#vis-svg .hot").forEach(function(h){
    h.addEventListener("click",function(){show(h.dataset.lesion)});
    h.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();show(h.dataset.lesion)}});
  });
  show("6");
})();

/* ===================== Corte medular ===================== */
var CORD={
 completa:{n:"Transecção completa",ids:["t-dc-L","t-dc-R","t-cst-L","t-cst-R","t-stt-L","t-stt-R","t-dh-L","t-dh-R","t-ah-L","t-ah-R","t-com"],d:"Abaixo do nível: paralisia bilateral (UMN após o choque medular), anestesia de todas as modalidades com nível, retenção urinária e fecal. No nível: LMN (arreflexia, atrofia segmentar). Choque medular: depressão transitória de reflexos e tônus. Choque neurogênico pode coexistir, com hipotensão/bradicardia, sobretudo em lesões altas; excluir outras causas de choque."},
 bs:{n:"Brown-Séquard (hemissecção esquerda)",ids:["t-dc-L","t-cst-L","t-stt-L","t-dh-L","t-ah-L"],d:"Ipsilateral (esquerda): paresia UMN abaixo, perda de vibração e propriocepção, LMN e faixa de anestesia no nível. Contralateral (direita): perda de dor e temperatura começando 1–2 segmentos abaixo. Tato pouco afetado (vias bilaterais)."},
 anterior:{n:"Cordão anterior (artéria espinhal anterior)",ids:["t-cst-L","t-cst-R","t-stt-L","t-stt-R","t-ah-L","t-ah-R","t-com","t-dh-L","t-dh-R"],d:"Paraplegia ou tetraplegia + perda bilateral de dor e temperatura + esfíncteres, com vibração e propriocepção preservadas (cordões posteriores irrigados pelas espinhais posteriores). Instalação em minutos–horas: cirurgia de aorta, dissecção, hipotensão, êmbolo fibrocartilaginoso."},
 posterior:{n:"Cordão posterior",ids:["t-dc-L","t-dc-R"],d:"Perda de vibração e propriocepção bilateral, ataxia sensitiva, Romberg positivo, marcha talonante, Lhermitte; força e dor/temperatura preservadas. B12, cobre, tabes dorsalis, EM, compressão posterior, óxido nitroso."},
 central:{n:"Centromedular (siringomielia / lesão central)",ids:["t-com","t-ah-L","t-ah-R","t-dh-L","t-dh-R"],d:"Fibras espinotalâmicas que cruzam na comissura são interrompidas: perda de dor e temperatura bilateral, suspensa (em xale), com tato e propriocepção preservados. Extensão aos cornos anteriores: atrofia e arreflexia nas mãos. Traumática por hiperextensão: MMSS mais fracos que MMII, retenção urinária."},
 combinada:{n:"Degeneração combinada subaguda (B12)",ids:["t-dc-L","t-dc-R","t-cst-L","t-cst-R"],d:"Cordões posteriores + laterais: ataxia sensitiva, parestesias, espasticidade e Babinski; reflexos variáveis pela neuropatia periférica associada. Dosar B12, homocisteína e ácido metilmalônico; cobre e óxido nitroso como alternativas. Trate antes da anemia aparecer."},
 ela:{n:"Doença do neurônio motor (ELA)",ids:["t-ah-L","t-ah-R","t-cst-L","t-cst-R"],d:"Corno anterior (LMN: atrofia, fasciculações, arreflexia) + corticoespinhal (UMN: hiperreflexia, Babinski, espasticidade), sem déficit sensitivo, esfíncteres e oculomotricidade preservados. Assimétrica, progressiva, com sinais bulbares."}
};
(function(){
  var all=["t-dc-L","t-dc-R","t-cst-L","t-cst-R","t-stt-L","t-stt-R","t-dh-L","t-dh-R","t-ah-L","t-ah-R","t-com"];
  function show(k){
    var d=CORD[k];
    all.forEach(function(id){$("#"+id).classList.toggle("lesion",d.ids.indexOf(id)>=0)});
    $$("#cord-btns button").forEach(function(b){b.classList.toggle("primary",b.dataset.cord===k)});
    $("#cord-verdict").innerHTML='<div class="title">'+esc(d.n)+'</div><p style="margin-top:10px;max-width:none">'+esc(d.d)+'</p>';
  }
  $("#cord-btns").addEventListener("click",function(e){var b=e.target.closest("button");if(b)show(b.dataset.cord)});
  show("bs");
})();

/* ===================== Localizador ===================== */
var FINDINGS=[
 ["Padrão motor",[
  ["m_hemi_bf","Hemiparesia braquiofacial (face e braço > perna)"],
  ["m_hemi_prop","Hemiparesia proporcionada (face = braço = perna)"],
  ["m_hemi_crural","Paresia crural predominante (perna > braço)"],
  ["m_face_spared","Hemiparesia poupando a face"],
  ["m_cross","Fraqueza cruzada: nervo craniano de um lado, corpo do outro"],
  ["m_para","Paraparesia (pernas), braços normais"],
  ["m_tetra","Tetraparesia"],
  ["m_mono","Monoparesia de um membro"],
  ["m_prox","Fraqueza proximal simétrica (cinturas)"],
  ["m_dist","Fraqueza distal simétrica"],
  ["m_fatig","Fraqueza fatigável ou flutuante ao longo do dia"],
  ["m_asc","Fraqueza ascendente progressiva em dias"]]],
 ["Tônus, reflexos e trofismo",[
  ["r_hiper","Hiperreflexia ou clônus"],
  ["r_babinski","Babinski"],
  ["r_espast","Espasticidade"],
  ["r_hipo","Hipo ou arreflexia"],
  ["r_hipotonia","Hipotonia ou flacidez"],
  ["r_atrofia","Atrofia muscular"],
  ["r_fasc","Fasciculações"],
  ["r_rigidez","Rigidez (roda denteada ou cano de chumbo)"],
  ["r_reflex_norm","Reflexos normais apesar da fraqueza"]]],
 ["Sensibilidade",[
  ["s_hemi","Hemi-hipoestesia de um hemicorpo (face incluída)"],
  ["s_cortical","Perda cortical (grafestesia, estereognosia, extinção) com modalidades primárias preservadas"],
  ["s_dor_talam","Hemianestesia de todas as modalidades com dor central intensa"],
  ["s_cross","Face de um lado e corpo do outro (dor/temperatura)"],
  ["s_nivel","Nível sensitivo no tronco"],
  ["s_bs","Propriocepção perdida de um lado e dor/temperatura do outro, abaixo de um nível"],
  ["s_dissoc","Dor/temperatura perdidas bilateralmente abaixo do nível, vibração/propriocepção preservadas"],
  ["s_suspensa","Perda de dor/temperatura suspensa (em xale) com tato preservado"],
  ["s_prop","Perda de vibração/propriocepção, Romberg positivo"],
  ["s_bota","Distribuição em bota e luva"],
  ["s_derm","Faixa em dermátomo ou território de um nervo"],
  ["s_multi","Déficit sensitivo-motor de várias raízes e vários nervos no mesmo membro"],
  ["s_sela","Anestesia em sela"],
  ["s_none","Sensibilidade normal (com fraqueza)"]]],
 ["Sinais corticais",[
  ["c_afasia","Afasia"],
  ["c_negl","Negligência ou anosognosia"],
  ["c_apraxia","Apraxia"],
  ["c_hemianopsia","Hemianopsia homônima"],
  ["c_quad_sup","Quadrantanopsia superior"],
  ["c_quad_inf","Quadrantanopsia inferior"],
  ["c_olhar","Desvio conjugado do olhar para o lado oposto à hemiparesia"],
  ["c_crise","Crise epiléptica focal"],
  ["c_gerstmann","Gerstmann (acalculia, agrafia, agnosia digital, desorientação D–E)"],
  ["c_abulia","Abulia, reflexo de preensão, incontinência precoce"],
  ["c_amnesia","Amnésia ou confusão flutuante"]]],
 ["Nervos cranianos e olhos",[
  ["n_pfp","Paralisia facial periférica (fronte acometida)"],
  ["n_pfc","Paralisia facial central (fronte poupada)"],
  ["n_iii","Paralisia do III (ptose, olho para fora e para baixo, ± midríase)"],
  ["n_vi","Paralisia do VI ou do olhar horizontal conjugado"],
  ["n_ino","Oftalmoplegia internuclear"],
  ["n_vert","Paralisia do olhar vertical, nistagmo de convergência-retração"],
  ["n_horner","Síndrome de Horner"],
  ["n_v","Hipoestesia facial ou corneano abolido"],
  ["n_viii","Hipoacusia ou zumbido"],
  ["n_bulbar","Disfagia, disfonia, desvio do palato"],
  ["n_xii","Desvio ou atrofia da língua"],
  ["n_vertigo","Vertigem com nistagmo"],
  ["n_diplopia_flut","Ptose ou diplopia flutuantes, pioram à tarde"],
  ["n_pseudobulbar","Reflexo mandibular exaltado, labilidade emocional, disartria espástica"]]],
 ["Coordenação e movimento",[
  ["k_apend","Ataxia apendicular (dismetria, disdiadococinesia, tremor de intenção)"],
  ["k_tronco","Ataxia de tronco e marcha, titubação"],
  ["k_fala","Fala escandida"],
  ["k_brady","Bradicinesia com tremor de repouso"],
  ["k_coreia","Coreia, balismo ou distonia"],
  ["k_mioclonia","Mioclonias multifocais ou asterixis"],
  ["k_steppage","Marcha escarvante (pé caído)"],
  ["k_anserina","Marcha anserina (miopática)"]]],
 ["Autonômico, dor, consciência e outros",[
  ["a_ret","Retenção ou incontinência urinária/fecal"],
  ["a_disaut","Disautonomia (hipotensão postural, arritmia, sudorese)"],
  ["a_dor_rad","Dor radicular irradiada"],
  ["a_dor_lombar","Dor vertebral (cervical ou lombar) intensa com déficit"],
  ["a_rebaix","Rebaixamento do nível de consciência"],
  ["a_anisocoria","Pupila dilatada e fixa unilateral com rebaixamento"],
  ["a_ck","CK elevada"],
  ["a_lhermitte","Sinal de Lhermitte"],
  ["f_hoover","Sinal de Hoover positivo ou fraqueza que cede (give-way)"],
  ["f_incons","Achados inconsistentes, divisão exata na linha média, campo tubular"]]]
];
var FLABEL={}; FINDINGS.forEach(function(g){g[1].forEach(function(f){FLABEL[f[0]]=f[1]})});
function P(name,lv,region,pro,con,confirm,pearl){return {n:name,lv:lv,r:region,pro:pro,con:con,c:confirm,p:pearl}}
var PATTERNS=[
 P("Córtex frontal dominante — ACM divisão superior","cortex","Opérculo frontal e giro pré-central esquerdo",{c_afasia:3,m_hemi_bf:3,c_olhar:2,n_pfc:2,c_apraxia:1,c_crise:1,r_hiper:1,r_babinski:1},{s_nivel:3,m_para:3,n_pfp:2,s_dissoc:2,m_cross:3,s_bota:3},"Afasia não fluente (Broca) com hemiparesia braquiofacial direita; TC/angio-TC: território da ACM esquerda, divisão superior.","O lado da afasia é o lado dominante; em destro, esquerdo."),
 P("Córtex têmporo-parietal dominante — ACM divisão inferior","cortex","Giro temporal superior posterior e giro angular esquerdos",{c_afasia:3,c_quad_sup:2,c_hemianopsia:2,c_gerstmann:3,s_cortical:2,c_apraxia:1},{m_hemi_prop:2,m_para:3,s_nivel:3,m_cross:3,s_bota:3,r_hipo:2},"Afasia fluente (Wernicke) ou Gerstmann sem paresia relevante; quadrantanopsia superior direita.","Fala incompreensível de início súbito exige avaliar afasia e AVC; necessidade de sedação depende de segurança e avaliação clínica, preservando exame quando possível."),
 P("Córtex parietal não dominante","cortex","Lobo parietal direito (ACM)",{c_negl:3,s_cortical:2,m_hemi_bf:2,c_quad_inf:2,c_hemianopsia:1,c_apraxia:1,c_olhar:1},{c_afasia:2,s_nivel:3,m_para:3,m_cross:3,s_bota:3,r_hipo:2},"Negligência esquerda, anosognosia, extinção; hemiparesia esquerda braquiofacial.","NIHSS subestima o hemisfério direito; teste extinção e negligência ativamente."),
 P("Córtex frontal medial — ACA","cortex","Giro pré-central medial e lobo paracentral (ACA)",{m_hemi_crural:3,c_abulia:3,a_ret:2,r_hiper:1,r_babinski:1},{s_nivel:3,m_hemi_bf:2,c_hemianopsia:2,m_cross:3,s_bota:3},"Paresia crural contralateral com abulia, reflexo de preensão e incontinência; angio-TC: ACA.","Paraparesia sem nível sensitivo pode ser parassagital bilateral (meningioma da foice, ACA ázigos)."),
 P("Cápsula interna / coroa radiada — lacuna motora pura","sub","Braço posterior da cápsula interna, coroa radiada",{m_hemi_prop:3,n_pfc:2,r_hiper:1,r_babinski:1,s_none:1},{c_afasia:3,c_negl:3,c_hemianopsia:2,s_nivel:3,m_cross:3,s_bota:3,r_hipo:2},"Hemiparesia proporcionada sem sinal cortical; RM-DWI: lacuna capsular ou pontina.","Disartria–mão desajeitada e hemiparesia atáxica são variantes lacunares (ponte ou cápsula)."),
 P("Tálamo — sensitivo puro / Dejerine-Roussy","sub","Núcleos ventral posterolateral e posteromedial (ACP perfurantes)",{s_dor_talam:3,s_hemi:3,c_amnesia:1,c_afasia:1,k_coreia:1},{m_hemi_bf:2,s_nivel:3,m_cross:3,s_bota:3,r_babinski:1},"Hemi-hipoestesia de todas as modalidades, face incluída, sem paresia; dor central semanas depois.","Afasia talâmica é hipofônica e flutuante; hemorragia talâmica dá olhos para baixo e para dentro."),
 P("Núcleos da base — síndrome extrapiramidal","sub","Substância negra/estriado (parkinsonismo), núcleo subtalâmico contralateral (balismo), estriado (coreia, distonia)",{k_brady:3,r_rigidez:3,k_coreia:3},{r_hiper:2,r_babinski:2,s_nivel:3,s_hemi:2,s_bota:3},"Bradicinesia com decremento + rigidez ou tremor de repouso (parkinsonismo); hemibalismo agudo = lacuna subtalâmica ou hiperglicemia.","Parkinsonismo simétrico sem tremor em uso de antiemético ou neuroléptico: farmacológico."),
 P("Mesencéfalo — Weber / Claude / Benedikt / Parinaud","tronco","Pedúnculo cerebral, núcleo rubro, teto mesencefálico",{n_iii:3,m_cross:3,n_vert:3,m_hemi_prop:1,k_apend:1,r_hiper:1},{n_pfp:2,n_vi:1,s_nivel:3,c_afasia:3,s_bota:3,n_xii:2},"III ipsilateral com hemiparesia (Weber) ou ataxia (Claude) contralateral; olhar vertical e pupilas (Parinaud). RM de tronco.","III com pupila envolvida em paciente acordado: aneurisma de comunicante posterior até angio-TC."),
 P("Ponte — Millard-Gubler / Foville / lacuna pontina / INO","tronco","Base e tegmento pontinos (basilar, paramedianas)",{n_vi:3,n_pfp:3,m_cross:3,n_ino:3,m_hemi_prop:1,k_apend:1,n_v:1,n_viii:1},{c_afasia:3,s_nivel:3,c_negl:3,n_iii:2,n_xii:2,s_bota:3},"Paralisia facial periférica ou do VI ipsilateral com hemiparesia contralateral; olhar desviado para o lado da hemiparesia. RM-DWI.","INO em jovem: EM; em idoso: AVC. Locked-in se bilateral: consciência preservada, testar piscar ao comando."),
 P("Bulbo lateral — Wallenberg","tronco","Bulbo dorsolateral (PICA / artéria vertebral)",{n_vertigo:3,n_horner:3,s_cross:3,n_bulbar:3,k_apend:2,n_v:2},{m_hemi_prop:3,m_hemi_bf:3,m_cross:2,c_afasia:3,s_nivel:3,r_babinski:2,s_bota:3},"Vertigem, Horner, disfagia/rouquidão, hipoestesia facial ipsilateral e corporal contralateral, ataxia ipsilateral, geralmente sem paresia no padrão clássico. Angio-TC: dissecção vertebral em jovem.","Disfagia implica risco importante de aspiração; evitar ingestão oral até triagem/avaliação de deglutição conforme protocolo."),
 P("Bulbo medial — Dejerine","tronco","Pirâmide, lemnisco medial e núcleo do XII (espinhal anterior / vertebral)",{n_xii:3,m_face_spared:3,m_cross:2,s_prop:2,r_babinski:1},{n_pfp:2,n_vertigo:1,n_horner:2,c_afasia:3,s_bota:3,s_nivel:2},"Língua desviada para a lesão, hemiparesia contralateral poupando a face, perda de vibração/propriocepção contralateral.","Padrão clássico de bulbo medial: XII ipsilateral associado a via longa contralateral; confirmar por imagem."),
 P("Cerebelo — hemisfério","cereb","Hemisfério cerebelar ipsilateral (PICA, AICA, SCA)",{k_apend:3,k_fala:2,n_vertigo:2,r_hipotonia:1},{r_hiper:1,m_hemi_prop:2,c_afasia:3,s_nivel:3,s_hemi:2,m_para:3,s_bota:3,r_babinski:2},"Ataxia apendicular ipsilateral sem fraqueza; RM. Vigiar edema em 48–72 h (compressão do IV ventrículo).","Fraqueza ou Babinski com ataxia exigem investigar vias associadas, tronco, efeito de massa ou doença multifocal."),
 P("Cerebelo — vérmis / linha média","cereb","Vérmis e lobo floculonodular",{k_tronco:3,n_vertigo:1,k_fala:1},{m_hemi_prop:2,s_hemi:2,s_nivel:3,c_afasia:3,s_bota:3,r_babinski:2},"Ataxia de tronco e marcha com membros quase normais no leito; álcool, Wernicke, meduloblastoma, paraneoplásica.","Em AVC cerebelar, o exame deitado pode ser pouco expressivo. Avaliar marcha e equilíbrio somente com segurança, apoio e prevenção de quedas."),
 P("Medula cervical — mielopatia","medula","Medula cervical (compressiva, inflamatória, vascular)",{m_tetra:3,s_nivel:3,r_hiper:2,r_babinski:2,a_ret:2,a_lhermitte:2,m_face_spared:1,s_prop:1,a_dor_lombar:1},{c_afasia:3,n_pfc:3,n_pfp:2,c_hemianopsia:3,n_iii:3,m_cross:2,c_negl:3,s_bota:2},"Tetraparesia espástica com nível sensitivo cervical, Lhermitte, reflexo mandibular normal; RM cervical urgente.","LMN nos braços (no nível) com UMN nas pernas imita ELA — déficit sensitivo favorece mielopatia, mas pode faltar; língua normal não exclui ELA. Integrar evolução, ENMG e imagem."),
 P("Medula torácica — mielopatia","medula","Medula torácica",{m_para:3,s_nivel:3,r_hiper:2,r_babinski:2,a_ret:2,a_dor_lombar:1},{m_tetra:2,c_afasia:3,n_pfc:3,n_pfp:2,s_bota:2,m_cross:3,r_hipo:1},"Paraparesia espástica com nível sensitivo torácico e esfíncteres; cutâneo-abdominais abolidos. RM de toda a coluna em horas.","Na fase aguda pode haver choque medular, com flacidez e hiporreflexia; nível sensitivo ajuda, mas sua ausência não exclui mielopatia."),
 P("Hemissecção medular — Brown-Séquard","medula","Metade lateral da medula",{s_bs:4,m_face_spared:2,s_prop:2,r_hiper:1,r_babinski:1,s_nivel:2,m_mono:1},{c_afasia:3,n_pfp:3,n_pfc:3,m_cross:2,s_bota:3},"UMN e propriocepção ipsilaterais + dor/temperatura contralateral abaixo do nível. RM: EM, tumor extramedular, trauma penetrante.","O lado da paresia é o lado da lesão; o lado da termoalgesia perdida é o oposto."),
 P("Centromedular — siringomielia / lesão central","medula","Comissura branca anterior e cornos anteriores cervicais",{s_suspensa:4,s_dissoc:2,r_atrofia:2,r_hipo:2,m_tetra:1,r_hiper:1},{c_afasia:3,n_pfc:3,m_cross:3,s_bota:2},"Perda dissociada suspensa em xale com atrofia e arreflexia das mãos; RM cervical (Chiari, siringe, tumor).","Queimaduras indolores nas mãos são a história clássica."),
 P("Cordão posterior / degeneração combinada","medula","Fascículos grácil e cuneiforme (± cordões laterais)",{s_prop:4,a_lhermitte:2,k_tronco:1,r_hiper:1,r_babinski:1,r_hipo:1},{s_dissoc:3,s_suspensa:3,c_afasia:3,m_cross:3},"Ataxia sensitiva com Romberg, vibração abolida, ± espasticidade e Babinski; B12, homocisteína, metilmalônico, cobre, VDRL.","Vibração se perde antes da propriocepção; anemia pode faltar na B12."),
 P("Cone medular","medula","Segmentos S2–S5 (vértebras T12–L2)",{a_ret:4,s_sela:3,m_para:2,r_hipo:1,r_hiper:1,s_nivel:1,a_dor_lombar:1},{c_afasia:3,m_cross:3,m_tetra:3,s_bota:2},"Retenção precoce, sela simétrica, fraqueza discreta simétrica, aquileu abolido com patelar preservado; RM lombossacra.","Cone tende a alteração esfincteriana precoce e simetria; cauda tende a dor radicular e assimetria. Há sobreposição: não esperar retenção completa ou padrão clássico para investigar."),
 P("Cauda equina","snp","Raízes lombossacras abaixo de L2",{a_dor_rad:3,s_sela:3,m_para:2,r_hipo:3,a_ret:2,r_hipotonia:1,r_atrofia:1,a_dor_lombar:2,k_steppage:1},{r_hiper:3,r_babinski:3,m_cross:3,c_afasia:3,s_nivel:1},"Dor radicular bilateral assimétrica, paraparesia flácida assimétrica, arreflexia, sela assimétrica; RM de urgência e descompressão.","Exame perineal e resíduo pós-miccional são auxiliares; achados normais não excluem compressão quando a suspeita clínica permanece."),
 P("Radiculopatia","snp","Raiz espinhal (cervical ou lombossacra)",{a_dor_rad:4,s_derm:3,r_hipo:2,m_mono:2,r_atrofia:1,r_fasc:1,a_dor_lombar:1},{r_hiper:3,r_babinski:3,s_nivel:2,m_para:2,m_tetra:3,c_afasia:3,s_bota:3},"Dor irradiada em dermátomo com hiporreflexia do reflexo correspondente e fraqueza miotomal (Lasègue, Spurling).","Ausência de Babinski e de nível sensitivo não exclui mielopatia; integrar distribuição, evolução e imagem quando indicada."),
 P("Mononeuropatia","snp","Um nervo periférico (compressão, trauma, isquemia)",{s_derm:3,m_mono:3,k_steppage:2,r_hipo:1,r_atrofia:1},{r_hiper:3,r_babinski:3,s_nivel:3,m_para:2,a_dor_rad:1,c_afasia:3,s_bota:2},"Déficit no território de um único nervo com Tinel no sítio de compressão; ENMG confirma e localiza.","Pé caído com inversão preservada é fibular; várias mononeuropatias assimétricas em semanas = mononeurite múltipla (vasculite)."),
 P("Polineuropatia","snp","Nervos periféricos, dependente do comprimento",{s_bota:4,m_dist:3,r_hipo:3,k_steppage:2,r_atrofia:1,a_disaut:1,s_prop:1},{r_hiper:3,r_babinski:3,s_nivel:3,c_afasia:3,m_prox:1,m_cross:3},"Bota e luva simétrica com arreflexia aquileia e fraqueza distal; glicemia, B12, TSH, eletroforese, ENMG.","Nível sensitivo no tronco exige investigar mielopatia, mesmo com padrão distal; neuropatia e mielopatia podem coexistir."),
 P("Polirradiculoneuropatia aguda — Guillain-Barré","snp","Raízes e nervos periféricos (desmielinização ou axonopatia imunomediada)",{m_asc:4,r_hipo:4,a_disaut:2,n_pfp:2,s_bota:1,a_dor_lombar:1,m_prox:1,m_tetra:1,r_hipotonia:1},{r_babinski:3,s_nivel:3,c_afasia:3,m_cross:2},"Fraqueza ascendente em dias com arreflexia, diplegia facial e disautonomia; LCR com dissociação proteíno-citológica; ENMG. Medir CVF, PImáx, PEmáx.","Reflexos preservados ou aumentados no início não excluem GBS. Ampliar diferenciais e avaliar rapidamente função bulbar, respiratória e autonômica; LCR/ENMG iniciais normais não excluem."),
 P("Junção neuromuscular — miastenia gravis","jnm","Receptor de acetilcolina pós-sináptico",{m_fatig:4,n_diplopia_flut:4,s_none:2,r_reflex_norm:2,n_bulbar:2,m_prox:1},{r_hipo:2,s_bota:3,r_babinski:3,r_hiper:2,r_atrofia:1,r_fasc:1,s_hemi:3,s_nivel:3},"Ptose e diplopia flutuantes, fraqueza fatigável, pupilas e reflexos normais; teste do gelo, anti-AChR, estimulação repetitiva, TC de tórax.","Queda da CVF, disfagia ou tosse fraca alertam para insuficiência respiratória: avaliação intensiva seriada, sem usar um limiar isolado para diagnosticar crise. Botulismo pode ter fraqueza descendente e alterações pupilares."),
 P("Músculo — miopatia","musc","Fibra muscular",{m_prox:4,k_anserina:3,a_ck:3,s_none:2,r_reflex_norm:2},{s_bota:3,r_fasc:2,r_babinski:3,r_hiper:2,s_hemi:3,m_fatig:1,m_dist:1,s_nivel:3},"Fraqueza proximal simétrica, sensibilidade normal, reflexos preservados, CK; ENMG miopática, anticorpos, biópsia.","Estatinas, corticoide, hipotireoidismo e miopatia do doente crítico são as causas do dia a dia."),
 P("Doença do neurônio motor — ELA","medula","Corno anterior, núcleos bulbares e trato corticoespinhal",{r_fasc:3,r_atrofia:2,r_hiper:3,r_babinski:2,s_none:3,n_xii:2,n_bulbar:2,n_pseudobulbar:2,m_dist:1,m_asc:0},{s_bota:3,s_hemi:3,s_nivel:2,c_afasia:2,n_iii:2,a_ret:2,r_reflex_norm:1,a_dor_rad:1},"UMN + LMN em regiões diferentes sem déficit sensitivo, esfíncteres e olhos poupados; língua atrófica com fasciculações; ENMG de 4 regiões; RM cervical para excluir mielopatia.","Mielopatia cervical é um importante imitador; língua, sensibilidade, evolução, ENMG e imagem ajudam a diferenciar, sem sinal isolado decisivo."),
 P("Lobo occipital — ACP","cortex","Córtex calcarino (ACP)",{c_hemianopsia:3,s_none:1,c_amnesia:1,c_quad_sup:1,c_quad_inf:1},{m_hemi_bf:3,m_hemi_prop:2,s_nivel:3,m_cross:3,r_babinski:1,c_negl:1,s_bota:3},"Hemianopsia homônima isolada com preservação macular, sem paresia; alexia sem agrafia se esquerda. RM.","Cegueira bilateral com pupilas normais e negação: Anton (topo da basilar, PRES, eclâmpsia)."),
 P("Nervo facial periférico isolado — Bell e afins","snp","Nervo facial no canal do temporal ou distal",{n_pfp:4,s_none:1},{m_cross:3,n_vi:3,n_viii:2,n_v:2,m_hemi_prop:3,m_hemi_bf:3,k_apend:2,c_afasia:3,s_bota:2},"Paralisia periférica isolada de instalação em < 72 h; otoscopia e parótida normais. Corticoide precoce e proteção ocular.","Com VI ou hemiparesia contralateral é ponte; com VIII/V é ângulo pontocerebelar; bilateral é GBS, Lyme, sarcoidose ou HIV."),
 P("Ângulo pontocerebelar","tronco","Cisterna do ângulo pontocerebelar (VII, VIII, V, cerebelo)",{n_viii:3,n_pfp:2,n_v:2,k_apend:2,n_vertigo:1},{m_cross:1,c_afasia:3,m_hemi_prop:2,s_nivel:3,n_xii:1,s_bota:3},"Hipoacusia neurossensorial progressiva com zumbido, corneano abolido, PFP e ataxia ipsilateral; RM com contraste.","Schwannoma vestibular: o VIII adoece antes do VII."),
 P("Herniação uncal / lesão expansiva supratentorial","cortex","Úncus comprimindo III, pedúnculo e ACP",{a_anisocoria:4,a_rebaix:3,n_iii:2,m_hemi_prop:1,m_hemi_bf:1,r_babinski:1,c_hemianopsia:1},{s_nivel:3,s_bota:3,r_hipo:2,a_dor_rad:2},"Midríase fixa ipsilateral com rebaixamento progressivo e hemiparesia (contra ou ipsilateral — Kernohan). Osmoterapia, TC, neurocirurgia agora.","Não espere a tríade de Cushing."),
 P("Encefalopatia difusa (tóxico-metabólica)","difuso","Disfunção bihemisférica sem lesão focal",{a_rebaix:3,k_mioclonia:3,c_amnesia:2,r_hiper:0},{m_hemi_prop:2,m_hemi_bf:2,c_afasia:2,s_nivel:3,c_hemianopsia:2,n_iii:2,s_bota:2,a_anisocoria:3},"Desatenção flutuante, asterixis ou mioclonia multifocal, pupilas reativas, sem sinal focal; glicemia, sódio, cálcio, amônia, gasometria, função renal, fármacos, EEG se dúvida.","Hipoglicemia e encefalopatia hepática podem produzir déficit focal; estado de mal não convulsivo exige EEG."),
 P("Plexopatia","snp","Plexo braquial ou lombossacro",{s_multi:4,m_mono:3,r_hipo:2,n_horner:2,r_atrofia:1,a_dor_rad:1},{r_hiper:3,r_babinski:3,s_nivel:3,m_para:3,c_afasia:3,s_bota:3},"Déficit sensitivo-motor de várias raízes e nervos num membro; ENMG (potencial sensitivo reduzido), RM de plexo, TC de tórax se Horner (Pancoast).","Erb: tronco superior (ombro/cotovelo); Klumpke: tronco inferior (mão + Horner)."),
 P("Transtorno neurológico funcional — sinais positivos","difuso","Alteração funcional das redes neurológicas; diagnóstico por sinais positivos, podendo coexistir com lesão estrutural",{f_hoover:4,f_incons:4,s_none:1,r_reflex_norm:2},{r_babinski:4,r_hiper:2,r_atrofia:3,r_fasc:3,n_iii:3,s_nivel:3,a_anisocoria:4,n_horner:3},"Hoover, give-way, queda sem pronação, entrainment, campo tubular; explicação transparente ao paciente e fisioterapia orientada.","Pode coexistir com doença orgânica: sinal de alarme ainda pede investigação.")
];
var LVNAME={cortex:"córtex",sub:"subcortical",tronco:"tronco",cereb:"cerebelo",medula:"medula",snp:"raiz / plexo / nervo",jnm:"junção neuromuscular",musc:"músculo",difuso:"difuso / funcional"};
var TIME={
 subito:"Instalação súbita com máximo no início: mecanismo vascular (isquemia, hemorragia). Nas primeiras horas o déficit de primeiro neurônio pode ser flácido e arreflexo.",
 minutos:"Segundos a minutos, estereotipado ou recorrente: crise epiléptica (com paresia de Todd), AIT, síncope, aura de enxaqueca (marcha em minutos), VPPB.",
 horas:"Horas a poucos dias: infeccioso, inflamatório, tóxico-metabólico; se periférico e ascendente, Guillain-Barré; se medular, mielite ou infarto medular.",
 semanas:"Dias a semanas com surtos e remissões: desmielinizante ou autoimune (EM, NMOSD, encefalite autoimune, vasculite).",
 meses:"Semanas a meses, progressivo: neoplásico, compressivo ou infeccioso crônico (tumor, abscesso, hematoma subdural crônico, compressão medular, tuberculose).",
 anos:"Meses a anos: degenerativo, hereditário ou metabólico crônico (Parkinson, ELA, demências, ataxias, polineuropatia diabética).",
 flutuante:"Flutuante ao longo do dia ou com esforço: junção neuromuscular, distúrbio metabólico (glicemia), transtorno funcional."
};
(function(){
  var box=$("#loc-groups"), checked={};
  FINDINGS.forEach(function(g){
    var d=document.createElement("div"); d.className="findgroup";
    d.innerHTML="<h4>"+esc(g[0])+"</h4>";
    var grid=document.createElement("div"); grid.className="findgrid";
    g[1].forEach(function(f){
      var lab=document.createElement("label"); lab.className="chk";
      lab.innerHTML='<input type="checkbox" value="'+f[0]+'"><span>'+esc(f[1])+'</span>';
      grid.appendChild(lab);
    });
    d.appendChild(grid); box.appendChild(d);
  });
  function has(id){return !!checked[id]}
  function any(ids){return ids.some(has)}
  function rules(){
    var out=[];
    if(any(["m_cross","s_cross"])) out.push(["fire","Tronco","Sinal cruzado clássico favorece tronco: nervo craniano de um lado e via longa do outro. Lesões múltiplas também podem produzir combinações atípicas. O nervo marca o andar (III/IV mesencéfalo, V–VIII ponte, IX–XII bulbo)."]);
    if(has("s_nivel")) out.push(["crit","Medula","Nível sensitivo = medula até prova em contrário. Com déficit motor ou esfincteriano: RM de coluna em horas (compressão medular é emergência)."]);
    if(any(["c_afasia","c_negl","c_hemianopsia","c_apraxia","c_gerstmann","c_crise","c_quad_sup","c_quad_inf","s_cortical"])) out.push(["fire","Hemisfério","Afasia, negligência e apraxia favorecem redes hemisféricas, inclusive conexões subcorticais. Defeitos de campo localizam a via visual. Integrar os achados; lesões múltiplas e apresentações atípicas são possíveis."]);
    var umn=any(["r_hiper","r_babinski","r_espast"]), lmn=any(["r_hipo","r_atrofia","r_fasc","r_hipotonia"]);
    if(umn&&!lmn) out.push(["info","1º neurônio","Sinais de primeiro neurônio: lesão central (córtex, cápsula, tronco ou medula). Se o déficit é agudo e flácido, o Babinski ainda vale."]);
    if(lmn&&!umn) out.push(["info","2º neurônio","Sinais de segundo neurônio: corno anterior, raiz, plexo ou nervo — ou fase aguda de lesão central (choque medular, AVC nas primeiras horas)."]);
    if(umn&&lmn&&has("s_none")) out.push(["warn","UMN + LMN sem sensitivo","Doença do neurônio motor (ELA) — ou mielopatia cervical com LMN no nível e UMN abaixo. Atrofia e fasciculações da língua colocam a lesão acima da medula."]);
    if(umn&&lmn&&!has("s_none")&&any(["s_nivel","a_lhermitte","s_prop"])) out.push(["warn","UMN + LMN com sensitivo","Padrão de mielopatia cervical (espondilótica, EM, B12): RM cervical antes de rotular como ELA."]);
    if(has("n_pfp")&&any(["m_cross","n_vi"])) out.push(["crit","Ponte","Paralisia facial periférica com VI ou hemiparesia contralateral é lesão pontina, não Bell."]);
    if(has("n_pfp")&&any(["n_viii","n_v"])) out.push(["warn","Ângulo pontocerebelar","Paralisia facial periférica com VIII ou V: lesão na cisterna (schwannoma, meningioma). RM com contraste."]);
    if(has("s_bota")) out.push(["info","Polineuropatia","Bota e luva favorece polineuropatia dependente do comprimento. Nível no tronco ou Babinski exige investigar mielopatia e possível coexistência."]);
    if(has("m_prox")&&has("s_none")) out.push(["info","Proximal sem sensitivo","Músculo ou junção neuromuscular: fatigabilidade, ptose, CK e reflexos decidem."]);
    if(has("a_anisocoria")&&has("a_rebaix")) out.push(["crit","Herniação uncal","Midríase fixa unilateral com rebaixamento: emergência neurocirúrgica. Osmoterapia e TC imediatas."]);
    if(has("s_sela")||(has("a_ret")&&has("m_para"))) out.push(["crit","Cone / cauda","Alteração perineal, urinária, intestinal ou sexual nova, sobretudo com dor radicular ou déficit, exige avaliação emergencial e RM conforme suspeita. Não esperar paraparesia ou retenção completa; exame retal/resíduo normais não excluem."]);
    if(has("m_asc")&&has("r_hipo")) out.push(["crit","Guillain-Barré","Ascendente com arreflexia: monitorar CVF, PImáx/PEmáx, deglutição e ritmo cardíaco; IVIG ou plasmaférese."]);
    if(has("n_vertigo")&&any(["n_horner","s_cross","n_bulbar","k_apend"])) out.push(["crit","Vertigem central","Vertigem com Horner, disfagia, hipoestesia cruzada ou ataxia: fossa posterior (Wallenberg/AICA). Acionar avaliação de AVC e definir RM/estudo vascular; HINTS só quando aplicável, por examinador treinado. TC normal não afasta infarto de fossa posterior."]);
    if(has("n_horner")&&has("a_dor_lombar")) out.push(["crit","Horner doloroso","Confirmar localização e início da dor: Horner agudo com dor cervical/cefálica preocupa para dissecção carotídea e exige avaliação vascular urgente. O marcador de dor vertebral também inclui lombalgia e não comprova esse padrão."]);
    if(any(["f_hoover","f_incons"])&&umn) out.push(["warn","Sinais mistos","Sinais funcionais positivos coexistindo com sinais de primeiro neurônio: investigue o orgânico; os dois podem coexistir."]);
    return out;
  }
  function run(){
    var ids=Object.keys(checked).filter(function(k){return checked[k]});
    $("#loc-count").textContent=ids.length+" achado"+(ids.length===1?"":"s")+" marcado"+(ids.length===1?"":"s");
    var rl=$("#loc-rules"), rs=$("#loc-result");
    var t=$("#loc-time").value;
    if(!ids.length){rl.innerHTML=t?'<div class="rule info"><span class="k">Tempo</span><span>'+esc(TIME[t])+'</span></div>':"";rs.innerHTML='<span class="empty">Nenhum achado marcado ainda.</span>';return}
    var rh=rules().map(function(r){return '<div class="rule '+r[0]+'"><span class="k">'+esc(r[1])+'</span><span>'+esc(r[2])+'</span></div>'});
    if(t) rh.push('<div class="rule info"><span class="k">Tempo</span><span>'+esc(TIME[t])+'</span></div>');
    rl.innerHTML=rh.join("");
    var scored=PATTERNS.map(function(p){
      var s=0, pro=[], con=[];
      ids.forEach(function(id){
        if(p.pro[id]){s+=p.pro[id];pro.push(id)}
        if(p.con[id]){s-=p.con[id];con.push(id)}
      });
      var unexplained=ids.filter(function(id){return !p.pro[id]});
      return {p:p,s:s,pro:pro,con:con,un:unexplained,cov:pro.length/ids.length};
    }).filter(function(x){return x.s>0}).sort(function(a,b){return b.s-a.s||b.cov-a.cov});
    if(!scored.length){rs.innerHTML='<span class="empty">Nenhum padrão clássico explica esse conjunto. Considere lesão multifocal, encefalopatia difusa ou achados discordantes; revise o exame.</span>';return}
    var top=scored[0].s;
    rs.innerHTML=scored.slice(0,5).map(function(x,i){
      var pct=Math.round(100*x.s/top);
      var pro=x.pro.map(function(id){return FLABEL[id]}).join("; ");
      var con=x.con.map(function(id){return FLABEL[id]}).join("; ");
      var un=x.un.map(function(id){return FLABEL[id]}).join("; ");
      return '<div class="rrow" style="--c:var(--lv-'+x.p.lv+')"><div class="rank">'+(i+1)+'</div><div>'+
        '<div class="name">'+esc(x.p.n)+'<span class="lv lv-'+x.p.lv+'">'+LVNAME[x.p.lv]+'</span><span class="chip">'+x.s+' pts heurísticos · compatível com '+x.pro.length+'/'+ids.length+'</span></div>'+
        '<div class="tiny">'+esc(x.p.r)+'</div><div class="tiny">Barra relativa ao maior escore desta seleção; não é probabilidade.</div><div class="bar"><i style="width:'+pct+'%"></i></div>'+
        '<div class="why"><div class="pro"><b>A favor:</b> '+(pro?esc(pro):"—")+'</div><div class="con"><b>Contra:</b> '+(con?esc(con):"nenhum achado marcado")+'</div>'+(un?'<div><b>Não explicado por este padrão:</b> '+esc(un)+'</div>':'')+'</div>'+
        '<div class="confirm"><b>Como investigar:</b> '+esc(x.p.c)+'<br><span class="muted">'+esc(x.p.p)+'</span></div></div></div>';
    }).join("");
  }
  box.addEventListener("change",function(e){var i=e.target;if(i.type!=="checkbox")return;checked[i.value]=i.checked;i.parentNode.classList.toggle("on",i.checked);run()});
  $("#loc-run").addEventListener("click",run);
  $("#loc-time").addEventListener("change",run);
  $("#loc-clear").addEventListener("click",function(){checked={};$$("#loc-groups input").forEach(function(i){i.checked=false;i.parentNode.classList.remove("on")});$("#loc-time").value="";run()});
  run();
})();

/* ===================== Quiz ===================== */
var QUIZ=[
 {lv:"cortex",s:"Homem, 62 anos, hipertenso. Há 1 hora: fala não fluente, esforçada, com poucas palavras; obedece a ordens simples; não repete frases. Hemiparesia direita de predomínio braquiofacial, olhar desviado para a esquerda.",o:["Córtex frontal esquerdo (ACM divisão superior)","Cápsula interna esquerda","Ponte esquerda","Córtex temporal esquerdo"],a:0,e:"Afasia de Broca (não fluente, compreensão preservada, repetição ruim) + hemiparesia braquiofacial + desvio do olhar para a lesão = córtex frontal dominante, divisão superior da ACM. Paresia proporcionada sem afasia favoreceria lacuna capsular; lesões pontinas podem apresentar sinais cruzados. São padrões orientadores, não regras absolutas."},
 {lv:"cortex",s:"Mulher, 70 anos, trazida por 'confusão súbita'. Fala fluente, com neologismos, não compreende ordens nem repete. Sem paresia. Quadrantanopsia superior direita.",o:["Giro temporal superior posterior esquerdo (ACM divisão inferior)","Lobo frontal esquerdo","Lobo occipital esquerdo","Tálamo esquerdo"],a:0,e:"Afasia de Wernicke sem paresia com quadrantanopsia superior (alça de Meyer no temporal): divisão inferior da ACM esquerda. Pode ser confundida com delirium ou alteração psiquiátrica; início súbito exige investigação de AVC."},
 {lv:"tronco",s:"Homem, 55 anos, vertigem súbita, rouquidão, disfagia; ptose e miose à esquerda; hipoestesia térmica na hemiface esquerda e no hemicorpo direito; ataxia do membro superior esquerdo. Força normal.",o:["Bulbo lateral esquerdo (Wallenberg)","Ponte esquerda","Bulbo medial esquerdo","Cerebelo direito"],a:0,e:"Horner + hipoestesia facial ipsilateral + corporal contralateral + ambíguo (disfagia, rouquidão) + ataxia ipsilateral, sem paresia = bulbo lateral (PICA/vertebral). A pirâmide é medial, por isso a força está preservada."},
 {lv:"tronco",s:"Ptose à direita, olho direito desviado para baixo e para fora, midríase direita; hemiparesia esquerda com face incluída.",o:["Mesencéfalo direito (Weber)","Ponte direita","Cápsula interna direita","Seio cavernoso direito"],a:0,e:"III ipsilateral + hemiparesia contralateral = pedúnculo cerebral (Weber). Seio cavernoso não dá via longa. Com ataxia contralateral seria Claude; com movimentos anormais, Benedikt."},
 {lv:"tronco",s:"Paralisia facial esquerda que não franze a testa; olho esquerdo não abduz; hemiparesia direita.",o:["Ponte esquerda (Millard-Gubler)","Ângulo pontocerebelar esquerdo","Córtex frontal direito","Nervo facial esquerdo no forame estilomastóideo"],a:0,e:"Facial periférico + VI ipsilaterais com hemiparesia contralateral = ponte ventral. Bell isolada não explica VI ou via longa; investigar lesão central. No ângulo pontocerebelar, procurar envolvimento de VIII e V."},
 {lv:"sub",s:"Desvio da comissura labial para a direita ao sorrir, com fronte simétrica; hemiparesia esquerda igual em face, braço e perna. Sem afasia, sem negligência, campos normais.",o:["Cápsula interna direita (lacuna)","Córtex frontal direito","Ponte direita","Tálamo direito"],a:0,e:"Paralisia facial central + hemiparesia proporcionada sem sinais corticais = braço posterior da cápsula (síndrome motora pura). Lesão cortical pode também causar déficit motor puro; desproporção e sinais corticais associados favorecem essa alternativa. A imagem confirma a localização."},
 {lv:"sub",s:"Perda de todas as modalidades sensitivas no hemicorpo esquerdo, face incluída, com dor em queimação intensa; força normal.",o:["Tálamo direito (VPL/VPM)","Córtex parietal direito","Bulbo lateral","Medula cervical"],a:0,e:"Hemianestesia completa com dor central = síndrome talâmica (Dejerine-Roussy). O conjunto favorece tálamo; lesões parietais também podem alterar modalidades primárias. Procurar integração sensitiva cortical e demais sinais; a medula isolada poupa a face."},
 {lv:"medula",s:"Paraparesia espástica progressiva há 2 semanas, nível sensitivo em T6, retenção urinária, membros superiores normais, reflexos cutâneo-abdominais abolidos.",o:["Medula torácica","Cauda equina","Polineuropatia","Lobo frontal parassagital"],a:0,e:"Nível sensitivo + paraparesia UMN + esfíncteres = medula torácica; RM urgente. Parassagital não daria nível sensitivo; cauda seria flácida e arreflexa."},
 {lv:"snp",s:"Lombalgia com dor irradiada para ambas as pernas, assimétrica; hipoestesia em sela assimétrica; aquileus abolidos; fraqueza flácida do pé direito; retenção urinária apareceu no terceiro dia.",o:["Cauda equina","Cone medular","Medula torácica","Plexo lombossacro bilateral"],a:0,e:"Dor radicular, assimetria, arreflexia e fraqueza flácida favorecem cauda equina neste caso; alterações esfincterianas podem ocorrer em diferentes momentos. Cone tende à simetria e disfunção esfincteriana precoce, com sobreposição. Nova retenção exige avaliação emergencial."},
 {lv:"medula",s:"Perda de dor e temperatura em ombros e braços (em xale) com tato e vibração preservados; atrofia das mãos e arreflexia dos membros superiores; queimaduras indolores nas mãos.",o:["Siringomielia cervical (centromedular)","Polineuropatia","Cordão posterior","Brown-Séquard"],a:0,e:"Dissociação suspensa (comissura anterior) com LMN nos braços (cornos anteriores) = síndrome centromedular cervical. RM: siringe, Chiari, tumor."},
 {lv:"medula",s:"Paresia espástica da perna direita; vibração e propriocepção abolidas na perna direita; dor e temperatura abolidas na perna esquerda abaixo de T10.",o:["Hemissecção medular direita (Brown-Séquard)","Hemissecção medular esquerda","Cordão posterior","Tálamo esquerdo"],a:0,e:"UMN + cordão posterior do mesmo lado (ipsilateral) + espinotalâmico do lado oposto = hemissecção do lado da paresia (direita)."},
 {lv:"snp",s:"Parestesias em bota e luva, arreflexia aquileia, fraqueza de dorsiflexão bilateral, marcha escarvante; diabetes há 20 anos.",o:["Polineuropatia","Radiculopatia L5 bilateral","Mielopatia","Miopatia distal"],a:0,e:"Distribuição dependente do comprimento com arreflexia distal = polineuropatia. Radiculopatia teria dor radicular e dermátomo; mielopatia teria UMN e nível."},
 {lv:"jnm",s:"Ptose e diplopia que pioram ao fim do dia, fraqueza proximal que piora com esforço; reflexos e sensibilidade normais; pupilas normais.",o:["Junção neuromuscular (miastenia gravis)","Miopatia","Esclerose lateral amiotrófica","Tronco encefálico"],a:0,e:"Fatigabilidade com envolvimento ocular, pupilas e reflexos normais, sem sensitivo = junção neuromuscular. Miopatia não flutua nem poupa tanto os olhos; ELA teria UMN e fasciculações."},
 {lv:"musc",s:"Fraqueza proximal simétrica há 6 semanas, dificuldade para subir escadas e levantar da cadeira; CK 8.000 U/L; sensibilidade normal; reflexos preservados; sem ptose.",o:["Músculo (miopatia inflamatória)","Junção neuromuscular","Polineuropatia","Medula cervical"],a:0,e:"Proximal, simétrica, sem sensitivo, reflexos preservados e CK alta = miopatia. Verifique pele (dermatomiosite), estatinas, tireoide."},
 {lv:"medula",s:"Atrofia e fasciculações da língua, disartria, atrofia das mãos com fasciculações; hiperreflexia generalizada e Babinski bilateral; sensibilidade normal; esfíncteres normais.",o:["Doença do neurônio motor (ELA)","Mielopatia cervical espondilótica","Siringomielia","Miastenia gravis"],a:0,e:"UMN + LMN em regiões bulbar e cervical sem déficit sensitivo = ELA. Atrofia e fasciculações linguais indicam acometimento bulbar/XII não explicado por mielopatia cervical isolada; confirmar etiologia com avaliação especializada."},
 {lv:"snp",s:"Pé caído direito: dorsiflexão e eversão fracas, inversão preservada; hipoestesia no dorso do pé; reflexos normais; sem dor lombar; emagreceu 15 kg e cruza as pernas o dia todo.",o:["Nervo fibular comum na cabeça da fíbula","Raiz L5","Nervo ciático","Medula lombar"],a:0,e:"Inversão preservada (tibial posterior, via nervo tibial) exclui L5, que acometeria inversão e glúteo médio; sem dor lombar; compressão na cabeça da fíbula pela perda de gordura."},
 {lv:"snp",s:"Dor cervical irradiada para o polegar; hipoestesia do polegar e indicador; fraqueza de bíceps e extensores do punho; reflexo bicipital abolido.",o:["Radiculopatia C6","Radiculopatia C7","Síndrome do túnel do carpo","Plexo braquial superior"],a:0,e:"Polegar = C6; bíceps/extensores do punho e bicipital = C6. C7 seria dedo médio, tríceps e tricipital. Túnel do carpo não altera reflexo nem extensores."},
 {lv:"cortex",s:"Hemianopsia homônima direita isolada com preservação macular; sem paresia, sem afasia, sem DPAR.",o:["Lobo occipital esquerdo (ACP)","Lobo temporal esquerdo","Trato óptico direito","Quiasma"],a:0,e:"Hemianopsia congruente com preservação macular e sem outros sinais = córtex calcarino esquerdo. O trato daria DPAR e incongruência; o temporal daria quadrantanopsia superior."},
 {lv:"cortex",s:"Após TCE, rebaixamento progressivo; pupila direita dilatada e fixa; hemiparesia esquerda.",o:["Herniação uncal direita","Hemorragia pontina","Lesão bulbar","Intoxicação por opioide"],a:0,e:"Midríase fixa ipsilateral (III comprimido) + hemiparesia contralateral + rebaixamento = herniação uncal. Ponte e opioides dão miose."},
 {lv:"tronco",s:"Mulher de 28 anos: ao olhar para a direita, o olho esquerdo não aduz e o olho direito apresenta nistagmo em abdução; a convergência está preservada.",o:["Fascículo longitudinal medial esquerdo (INO) — pensar em esclerose múltipla","Paralisia do III esquerdo","Núcleo do VI direito","Miastenia gravis"],a:0,e:"INO é nomeada pelo lado do olho que não aduz (FLM ipsilateral). Convergência preservada exclui III. Jovem: EM."},
 {lv:"cortex",s:"Paresia da perna esquerda maior que do braço, apatia, incontinência urinária precoce, reflexo de preensão.",o:["ACA direita (frontal medial)","ACM direita","Medula torácica","Cápsula interna direita"],a:0,e:"Déficit crural + abulia + incontinência + preensão = território da ACA (lobo paracentral e frontal medial). Medula não daria abulia nem preensão."},
 {lv:"cereb",s:"Dismetria e disdiadococinesia do lado direito, nistagmo, fala escandida; força e sensibilidade normais.",o:["Hemisfério cerebelar direito","Hemisfério cerebelar esquerdo","Cápsula interna esquerda","Cordão posterior"],a:0,e:"Cerebelo é ipsilateral: ataxia apendicular direita = hemisfério cerebelar direito. Sem fraqueza, sem perda sensitiva: não é cápsula nem cordão posterior."},
 {lv:"snp",s:"Tetraparesia flácida que subiu dos pés às mãos em 5 dias, arreflexia global, paralisia facial bilateral, hipotensão postural, parestesias distais leves.",o:["Polirradiculoneuropatia aguda (Guillain-Barré)","Medula cervical","Miastenia gravis","Botulismo"],a:0,e:"Ascendente, arreflexa, com diplegia facial e disautonomia = GBS. O conjunto favorece GBS. Mielopatia aguda pode ser flácida; procurar nível sensitivo e investigar conforme contexto. Miastenia costuma preservar reflexos; botulismo tende a início bulbar/descendente, mas pupilas normais não o excluem."},
 {lv:"cortex",s:"Fala fluente e vazia; não compreende ordens; repete frases longas com exatidão e completa provérbios (ecolalia).",o:["Afasia transcortical sensitiva (zona limítrofe ACM–ACP)","Afasia de Wernicke","Afasia de condução","Afasia global"],a:0,e:"Compreensão ruim com repetição preservada = transcortical sensitiva; a área perissilviana (que sustenta a repetição) está intacta. Wernicke não repete."},
 {lv:"tronco",s:"Paralisia do olhar para cima, pupilas que acomodam mas não reagem à luz, nistagmo de convergência-retração ao tentar olhar para cima, retração palpebral.",o:["Mesencéfalo dorsal (Parinaud)","Ponte","Fascículo longitudinal medial","Lobo frontal"],a:0,e:"Síndrome do mesencéfalo dorsal (comissura posterior): tumor pineal, hidrocefalia, AVC. Ponte afeta olhar horizontal; frontal dá desvio conjugado horizontal."},
 {lv:"snp",s:"Homem de 45 anos com dor cervical e Horner à esquerda após manipulação cervical; horas depois, amaurose fugaz esquerda e disfasia transitória.",o:["Dissecção de carótida interna esquerda (Horner de 3ª ordem)","Wallenberg","Tumor de Pancoast","Cefaleia em salvas"],a:0,e:"Horner doloroso agudo + sintomas isquêmicos carotídeos = dissecção de carótida interna (plexo simpático pericarotídeo). Angio-TC de vasos cervicais e antitrombótico."},
 {lv:"snp",s:"Após TCE leve, diplopia vertical ao descer escadas e ao ler; melhora ao inclinar a cabeça para o lado oposto ao olho afetado.",o:["Nervo troclear (IV)","Nervo oculomotor (III)","Nervo abducente (VI)","Skew deviation"],a:0,e:"Diplopia vertical/torcional pior no olhar para baixo com head tilt compensatório = oblíquo superior (IV), o nervo craniano mais vulnerável ao trauma. VI daria diplopia horizontal."},
 {lv:"tronco",s:"Vertigem contínua há 12 horas com náuseas. Nistagmo que muda de direção conforme o olhar, teste do impulso cefálico sem sacada corretiva, desalinhamento vertical ao cover test. Não consegue ficar em pé sem apoio.",o:["Padrão central preocupante (fossa posterior)","Neurite vestibular","VPPB","Doença de Menière"],a:0,e:"Neste contexto de síndrome vestibular aguda com nistagmo, qualquer componente central preocupa para AVC, se examinado por profissional treinado; não define a etiologia sozinho. Incapacidade de permanecer em pé reforça o alarme. Avaliação urgente com imagem apropriada; TC normal não exclui infarto. Não esperar 24 h para investigar."}
];
(function(){
  var order=QUIZ.map(function(_,i){return i}), pos=0, answered={}, score=store("nm_quiz_v1")||{ok:0,err:0};
  var lvn=LVNAME;
  function render(){
    var q=QUIZ[order[pos]];
    $("#quiz-pos").textContent="Caso "+(pos+1)+" / "+QUIZ.length;
    $("#quiz-score").textContent="Acertos: "+score.ok+" · Erros: "+score.err;
    $("#quiz-level").innerHTML=answered[order[pos]]!==undefined?'<span class="lv lv-'+q.lv+'">'+lvn[q.lv]+'</span>':'';
    $("#quiz-stem").textContent=q.s;
    var opts=$("#quiz-opts"); opts.innerHTML="";
    var letters=["A","B","C","D"];
    var perm=q._perm||(q._perm=shuffle([0,1,2,3]));
    perm.forEach(function(oi,k){
      var b=document.createElement("button"); b.type="button";
      b.innerHTML='<span class="l">'+letters[k]+'</span><span>'+esc(q.o[oi])+'</span>';
      var done=answered[order[pos]];
      if(done!==undefined){b.disabled=true;if(oi===q.a)b.classList.add("right");else if(oi===done)b.classList.add("wrong")}
      b.addEventListener("click",function(){
        if(answered[order[pos]]!==undefined)return;
        answered[order[pos]]=oi;
        if(oi===q.a)score.ok++;else score.err++;
        store("nm_quiz_v1",score); render();
      });
      opts.appendChild(b);
    });
    var ex=$("#quiz-exp");
    if(answered[order[pos]]!==undefined){ex.classList.add("show");ex.innerHTML='<b>'+(answered[order[pos]]===q.a?"Correto.":"Resposta: "+esc(q.o[q.a])+".")+'</b> '+esc(q.e)}
    else{ex.classList.remove("show");ex.innerHTML=""}
  }
  function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
  $("#quiz-next").addEventListener("click",function(){pos=(pos+1)%QUIZ.length;render()});
  $("#quiz-prev").addEventListener("click",function(){pos=(pos-1+QUIZ.length)%QUIZ.length;render()});
  $("#quiz-shuffle").addEventListener("click",function(){shuffle(order);pos=0;render()});
  $("#quiz-reset").addEventListener("click",function(){score={ok:0,err:0};answered={};QUIZ.forEach(function(q){delete q._perm});store("nm_quiz_v1",score);render()});
  render();
})();

/* ===================== Flashcards ===================== */
var FLASH=[
 ["Para que lado desvia a úvula na lesão do X?","Para o lado são (contrário à lesão): o palato do lado lesado não eleva."],
 ["Para que lado desvia a língua na lesão periférica do XII?","Para o lado da lesão, com atrofia e fasciculações. Na lesão central, para o lado oposto, sem atrofia."],
 ["Desvio conjugado do olhar: hemisfério × ponte","Hemisfério: olha para a lesão (foge da hemiparesia). Ponte: olha para longe da lesão (para a hemiparesia). Crise: olha para longe do foco."],
 ["Regra dos 4: quais são os 4 M mediais?","Motor (corticoespinhal), Medial lemnisco, MLF (fascículo longitudinal medial), Motor nuclei III, IV, VI, XII."],
 ["Regra dos 4: quais são os 4 S laterais?","Spinocerebelar, Spinotalâmico, Sensory nucleus do V, Sympathetic."],
 ["Wallenberg: artéria e déficit ausente","PICA ou artéria vertebral (mais comum). No padrão clássico, a força é preservada porque a pirâmide é medial; extensão da lesão ou variantes podem causar paresia."],
 ["III com pupila envolvida: compressivo ou isquêmico?","Compressivo (aneurisma de comunicante posterior, herniação) até prova em contrário — fibras pupilares são superficiais. Pupila poupada favorece microangiopatia no contexto adequado, mas não exclui aneurisma/compressão, sobretudo em paresia parcial. Avaliação urgente e imagem vascular conforme contexto."],
 ["Horner: as três ordens de neurônio","1ª: hipotálamo → tronco → centro cilioespinal C8–T2 (Wallenberg, medula cervical). 2ª: saída simpática torácica → ápice pulmonar → gânglio cervical superior. 3ª: carótida interna → seio cavernoso → órbita (dissecção, cefaleia em salvas)."],
 ["Reflexo bicipital e estilorradial: nível","C5–C6."],
 ["Reflexo tricipital: nível","C7 (C6–C8)."],
 ["Reflexo patelar: nível","L2–L4 (nervo femoral)."],
 ["Reflexo aquileu: nível","S1–S2 (nervo tibial)."],
 ["Dermátomos do mamilo e do umbigo","T4 e T10."],
 ["Pé caído: fibular × L5","Fibular: inversão preservada, sem dor lombar, reflexos normais. L5: inversão e glúteo médio fracos, dor radicular, hipoestesia até a coxa lateral."],
 ["Afasia de condução: local e assinatura","Fascículo arqueado / giro supramarginal. Fluente, compreende, não repete; parafasias fonêmicas com autocorreção."],
 ["Síndrome de Gerstmann","Acalculia, agrafia, agnosia digital, desorientação direita–esquerda. Giro angular do hemisfério dominante."],
 ["Alexia sem agrafia: local","Occipital esquerdo + esplênio do corpo caloso (ACP esquerda). Hemianopsia direita associada."],
 ["Síndrome de Balint","Simultanagnosia, apraxia ocular, ataxia óptica. Parieto-occipital bilateral (watershed ACM–ACP)."],
 ["Síndrome de Anton","Cegueira cortical com negação (anosognosia). Occipital bilateral; pupilas e fundo normais."],
 ["Miastenia × Lambert-Eaton: reflexos e autonômico","MG: reflexos normais, sem disautonomia. LEMS: hipo/arreflexia que melhora após esforço, boca seca, carcinoma de pequenas células."],
 ["Tríade de Hakim-Adams","Marcha apráxica (magnética) + demência + incontinência: hidrocefalia de pressão normal."],
 ["Marcha talonante × ebriosa","Talonante: ataxia sensitiva, piora sem visão, Romberg positivo. Ebriosa: cerebelar, não depende da visão, com nistagmo e disartria."],
 ["Pupilas puntiformes reativas no coma","Ponte (hemorragia pontina) ou opioides/organofosforados."],
 ["Pupilas médias fixas no coma","Mesencéfalo (herniação central, AVC de tronco)."],
 ["Decorticação × descerebração: nível","Decorticação: acima do núcleo rubro (hemisférios, cápsula, diencéfalo). Descerebração: entre o núcleo rubro e os núcleos vestibulares (mesencéfalo/ponte)."],
 ["Fenômeno de Kernohan","Hemiparesia ipsilateral à lesão expansiva por compressão do pedúnculo contralateral contra o tentório — sinal falso localizatório."],
 ["Cone × cauda: esfíncter e dor","Cone tende a alteração esfincteriana precoce e simetria; cauda tende a dor radicular e assimetria. Há sobreposição: disfunção urinária/intestinal/sexual nova ou hipoestesia perineal exige avaliação imediata; não aguardar retenção completa."],
 ["Choque medular","Choque medular é depressão transitória de reflexos/tônus abaixo da lesão, com recuperação variável. Choque neurogênico é hemodinâmico (hipotensão/bradicardia); podem coexistir. Retorno bulbocavernoso é marco tradicional, não definição universal de recuperação completa."],
 ["Sinal de Lhermitte","Choque elétrico descendente à flexão cervical: cordão posterior cervical (EM, B12, espondilose, mielopatia por radiação)."],
 ["Pupila de Hutchinson","Midríase fixa ipsilateral à herniação uncal por compressão do III."],
 ["PFP + hiperacusia + disgeusia + lacrimejamento normal: nível","Canal do facial entre o gânglio geniculado e o ramo do estapédio."],
 ["Paralisia facial periférica bilateral: causas","Guillain-Barré, Lyme, sarcoidose, HIV, meningite carcinomatosa/linfomatosa, Melkersson-Rosenthal, Möbius."],
 ["Sinal de Hoover","Extensão involuntária do quadril 'fraco' ao flexionar o quadril contralateral contra resistência — sinal positivo de fraqueza funcional."],
 ["Impulso cefálico normal na vertigem aguda","Na síndrome vestibular aguda com nistagmo, impulso cefálico normal preocupa para causa central; interpretar o conjunto por examinador treinado. Um teste isolado não estabelece diagnóstico; impulso anormal também não exclui AVC."],
 ["Síndrome do um e meio","Lesão de PPRF/núcleo do VI + FLM do mesmo lado: só resta a abdução do olho contralateral."],
 ["Síndrome de Foster Kennedy","Atrofia óptica ipsilateral + papiledema contralateral + anosmia: meningioma frontobasal/do sulco olfatório."],
 ["Pupila de Marcus Gunn","Defeito pupilar aferente relativo: lesão do nervo óptico/retina; lanterna oscilante mostra dilatação paradoxal."],
 ["Pupila de Argyll Robertson","Pequena, irregular, acomoda mas não reage à luz: neurossífilis (também diabetes)."],
 ["Reflexo mandibular exaltado","UMN acima da ponte (pseudobulbar). Útil para separar mielopatia cervical (normal) de lesão supra-pontina (exaltado)."],
 ["Bota e luva com nível no tronco","Nível sensitivo no tronco exige investigar mielopatia; não é explicado pelo padrão clássico de polineuropatia dependente do comprimento. As duas condições podem coexistir."]
];
(function(){
  var queue=store("nm_flash_v1"), pos=0, back=false;
  if(!Array.isArray(queue)||queue.some(function(i){return !Number.isInteger(i)||i<0||i>=FLASH.length})) queue=FLASH.map(function(_,i){return i});
  function render(){
    if(!queue.length){$("#flash-txt").textContent="Fila concluída. Reinicie para repetir.";$("#flash-side").textContent="Fim";$("#flash-pos").textContent="—";$("#flash-left").textContent="Na fila: 0";$("#flash-card").classList.remove("back");return}
    pos=Math.min(pos,queue.length-1);
    var c=FLASH[queue[pos]];
    $("#flash-side").textContent=back?"Resposta":"Pergunta";
    $("#flash-txt").textContent=back?c[1]:c[0];
    $("#flash-card").classList.toggle("back",back);
    $("#flash-pos").textContent="Cartão "+(pos+1)+" / "+queue.length;
    $("#flash-left").textContent="Na fila: "+queue.length;
  }
  function flip(){back=!back;render()}
  $("#flash-card").addEventListener("click",flip);
  $("#flash-card").addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();flip()}});
  $("#flash-next").addEventListener("click",function(){if(!queue.length)return;pos=(pos+1)%queue.length;back=false;render()});
  $("#flash-prev").addEventListener("click",function(){if(!queue.length)return;pos=(pos-1+queue.length)%queue.length;back=false;render()});
  $("#flash-ok").addEventListener("click",function(){if(!queue.length)return;queue.splice(pos,1);store("nm_flash_v1",queue);back=false;render()});
  $("#flash-restart").addEventListener("click",function(){queue=FLASH.map(function(_,i){return i});store("nm_flash_v1",queue);pos=0;back=false;render()});
  render();
})();
})();
