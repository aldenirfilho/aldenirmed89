
(function(){
  const root=document.documentElement;
  const a11yKey='antigravity:a11y:v1';
  function readA11y(serialized){
    let saved={};
    let hasGlobal=serialized!==null;
    try{
      if(serialized===undefined){
        serialized=localStorage.getItem(a11yKey);
        hasGlobal=serialized!==null;
      }
      saved=JSON.parse(serialized||'{}');
      if(!saved||typeof saved!=='object'||Array.isArray(saved))saved={};
    }catch(_){saved={}}
    try{
      if(!hasGlobal&&localStorage.getItem('vasc-theme')==='light')saved.clarity=true;
    }catch(_){}
    return {...saved,clarity:saved.clarity===true,contrast:saved.contrast===true};
  }
  let a11yPrefs=readA11y();
  function clarityEnabled(preferences){
    if(preferences.contrast===true)return false;
    if(preferences.theme==='light')return true;
    if(preferences.theme==='dark')return false;
    if(preferences.theme==='system')return matchMedia('(prefers-color-scheme: light)').matches;
    return preferences.clarity===true;
  }
  function applyTheme({persist=false}={}){
    const light=clarityEnabled(a11yPrefs);
    const contrast=a11yPrefs.contrast===true;
    root.setAttribute('data-theme',contrast?'contrast':light?'light':'dark');
    root.style.colorScheme=light?'light':'dark';
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      light?'#ffffff':a11yPrefs.contrast===true?'#000000':'#08111f'
    );
    document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')?.setAttribute(
      'content',
      light?'default':'black-translucent'
    );
    const button=document.querySelector('[data-theme-toggle]');
    if(button){
      button.textContent=light?'🌙':'☀️';
      button.title=light?'Voltar ao modo espacial escuro':'Ativar visualização clara';
      button.setAttribute('aria-pressed',String(light));
      button.setAttribute(
        'aria-label',
        light
          ?'Desativar visualização clara e voltar ao modo espacial escuro'
          :'Ativar visualização clara com fundo branco'
      );
    }
    if(persist){
      try{
        localStorage.setItem(a11yKey,JSON.stringify(a11yPrefs));
        localStorage.setItem('vasc-theme',light?'light':'dark');
      }catch(_){}
    }
  }
  window.toggleTheme=function(){
    const light=clarityEnabled(a11yPrefs);
    a11yPrefs.clarity=!light;
    a11yPrefs.theme=a11yPrefs.clarity?'light':'dark';
    if(a11yPrefs.clarity)a11yPrefs.contrast=false;
    applyTheme({persist:true});
  };
  window.printPage=function(){window.print()};
  window.addEventListener('storage',event=>{
    if(event.key!==a11yKey)return;
    a11yPrefs=readA11y(event.newValue);
    applyTheme();
  });
  const systemTheme=matchMedia('(prefers-color-scheme: light)');
  const syncVasculitesSystemTheme=()=>{
    a11yPrefs=readA11y();
    if(a11yPrefs.theme==='system')applyTheme();
  };
  if(systemTheme.addEventListener)systemTheme.addEventListener('change',syncVasculitesSystemTheme);
  else systemTheme.addListener?.(syncVasculitesSystemTheme);
  applyTheme();

  function norm(s){return (s||'').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
  window.filterCards=function(){
    const q=norm(document.querySelector('#q')?.value||'');
    const type=document.querySelector('.filterbtn.active')?.dataset.filter||'all';
    document.querySelectorAll('[data-card]').forEach(c=>{
      const text=norm(c.innerText); const group=c.dataset.group||'';
      const okQ=!q||text.includes(q); const okT=type==='all'||group.includes(type);
      c.classList.toggle('hidden',!(okQ&&okT));
    });
  }
  function syncInteractiveStates(){
    document.querySelectorAll('.filterbtn').forEach(button=>{
      button.setAttribute('aria-pressed',String(button.classList.contains('active')));
    });
    document.querySelectorAll('[data-tabs]').forEach(area=>{
      area.querySelectorAll('.tab[data-tab]').forEach(button=>{
        const panel=area.querySelector('#'+button.dataset.tab);
        const buttonId='vasc-tab-'+button.dataset.tab;
        button.id=button.id||buttonId;
        button.setAttribute('role','tab');
        button.setAttribute('aria-selected',String(button.classList.contains('active')));
        if(panel){
          button.setAttribute('aria-controls',panel.id);
          panel.setAttribute('role','tabpanel');
          panel.setAttribute('aria-labelledby',button.id);
        }
      });
    });
  }
  document.addEventListener('click',e=>{
    if(e.target.matches('.filterbtn')){
      document.querySelectorAll('.filterbtn').forEach(b=>b.classList.remove('active'));
      e.target.classList.add('active');
      syncInteractiveStates();
      window.filterCards();
    }
    if(e.target.matches('.tab[data-tab]')){
      const area=e.target.closest('[data-tabs]');
      area.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
      area.querySelectorAll('.tabpane').forEach(p=>p.classList.remove('active'));
      e.target.classList.add('active');
      area.querySelector('#'+e.target.dataset.tab)?.classList.add('active');
      syncInteractiveStates();
    }
  })
  document.addEventListener('input',e=>{ if(e.target.id==='q') window.filterCards(); });
  syncInteractiveStates();

  const rules={
    AAV:{
      label:'Vasculite ANCA-associada — GPA/MPA/EGPA',
      severe:'Pulsoterapia se ameaça imediata + prednisona/prednisolona em esquema reduzido; indução com rituximabe ou ciclofosfamida. Considerar avacopan em GPA/MPA para poupar corticoide quando disponível. Plasmaférese apenas em cenários selecionados: anti-GBM associado, glomerulonefrite rapidamente progressiva muito grave/dialítica, ou hemorragia alveolar com hipoxemia.',
      nonsevere:'Corticoide + rituximabe ou imunossupressor poupador conforme fenótipo. EGPA não grave pode ter mepolizumabe como opção poupadora de corticoide; GPA/MPA geralmente seguir estratégia com rituximabe/MTX/AZA conforme caso.',
      exams:'ANCA por IF + ELISA PR3/MPO, EAS/sedimento, proteinúria, creatinina, TC tórax, avaliação ORL, biópsia renal/pele/pulmão se muda conduta, excluir infecção/TB/endocardite.',
      maintenance:'Rituximabe é forte opção de manutenção após remissão; azatioprina/metotrexato/micofenolato são alternativas conforme rim, idade, fertilidade, custo e disponibilidade.',
      pitfall:'Não chamar PAN se ANCA positivo + GN pauci-imune/hemorragia alveolar: pense AAV.'
    },
    PAN:{
      label:'Poliarterite nodosa sistêmica',
      severe:'Doença grave/ameaça de órgão: metilprednisolona IV ou prednisona alta + ciclofosfamida. Após remissão, transicionar para azatioprina ou metotrexato para reduzir toxicidade cumulativa.',
      nonsevere:'Corticoide sistêmico; considerar azatioprina ou metotrexato se recorrente, corticodependente ou poupar esteroide. Dor/nódulos isolados não justificam ciclofosfamida sem ameaça de órgão.',
      exams:'HBsAg/anti-HBc/anti-HBs, HCV/HIV, angiografia/angioTC abdominal se dor abdominal/renal, biópsia de pele/nervo/músculo se lesão acessível, EAS geralmente sem GN pauci-imune.',
      maintenance:'Azatioprina ou metotrexato após controle; monitorar neuropatia, rim renovascular, aneurismas, isquemia mesentérica.',
      pitfall:'PAN clássica poupa capilares/glomérulos: GN rapidamente progressiva ou hemorragia alveolar puxa para AAV/anti-GBM.'
    },
    GCA:{
      label:'Arterite de células gigantes',
      severe:'Sintoma visual, amaurose fugaz, diplopia ou AVC: corticoide imediatamente; considerar metilprednisolona IV 500–1000 mg/dia por 3 dias, depois prednisona alta. Não esperar biópsia/US para tratar.',
      nonsevere:'Prednisona 40–60 mg/dia, com plano de desmame. Tocilizumabe + corticoide é opção forte para reduzir recaída/exposição cumulativa; metotrexato é alternativa quando tocilizumabe indisponível/contraindicado.',
      exams:'PCR/VHS, hemograma/plaquetas, US temporal/axilar com halo quando disponível, biópsia temporal ou angioTC/MRI/PET em doença de grandes vasos.',
      maintenance:'Tocilizumabe como poupador; acompanhar recaída clínica, imagem se grandes vasos, risco de aneurisma/dissecção.',
      pitfall:'Cefaleia nova em >50 anos + claudicação mandibular = tratar como GCA até prova em contrário.'
    },
    TAK:{
      label:'Arterite de Takayasu',
      severe:'Doença ativa com isquemia crítica, hipertensão renovascular, sintomas neurológicos ou inflamação vascular extensa: corticoide alta dose + poupador precoce. Revascularização idealmente quando inflamação controlada, exceto emergência isquêmica.',
      nonsevere:'Corticoide + imunossupressor poupador: metotrexato, azatioprina, micofenolato; considerar tocilizumabe ou anti-TNF em refratários/recidivantes.',
      exams:'PA em 4 membros, pulsos/sopros, PCR/VHS, angioRM preferencial, angioTC/PET/US como alternativas; avaliar renal/carótida/subclávia/aorta.',
      maintenance:'Monitorar sintomas + imagem seriada; marcadores inflamatórios podem falhar. Controlar HAS, risco vascular e estenoses.',
      pitfall:'PCR normal não exclui atividade de Takayasu.'
    },
    CRIO:{
      label:'Vasculite crioglobulinêmica',
      severe:'Ameaça de órgão: rituximabe + corticoide; associar antiviral direto se HCV. Plasmaférese se hiperviscosidade, glomerulonefrite rapidamente progressiva grave, isquemia/gangrena, hemorragia alveolar ou manifestação fulminante.',
      nonsevere:'Se HCV associado e doença leve: tratar HCV com antivirais diretos e suporte. Se persistente/moderada: rituximabe pode ser usado, individualizando risco infeccioso.',
      exams:'Crioglobulinas com coleta/transporte aquecido, C4 baixo, fator reumatoide, HCV RNA, HBV/HIV, complemento, EAS/proteinúria, biópsia se órgão-alvo.',
      maintenance:'Tratar gatilho: HCV, linfoproliferação, Sjögren/autoimune. Reavaliar C4, RF, sintomas e proteinúria.',
      pitfall:'Crioglobulina negativa não exclui se coleta foi fria/errada; o tubo precisa ficar aquecido até processamento.'
    }
  };
  window.runVascSimulator=function(){
    const d=(id)=>document.getElementById(id)?.value||'';
    const dx=d('dx'), severity=d('severity'), organ=d('organ'), infection=d('infection'), viral=d('viral'), renal=d('renal'), pulmonary=d('pulmonary');
    const r=rules[dx]||rules.AAV;
    let flags=[];
    if(infection==='suspected') flags.push('⚠️ Antes de imunossuprimir: colher culturas, lactato se choque, imagem conforme foco e iniciar antibiótico se sepse provável. Endocardite/TB/fungo podem mimetizar vasculite.');
    if(viral==='HBV' && dx==='PAN') flags.push('🦠 PAN associada a HBV: priorizar antiviral + especialista; imunossupressão prolongada aumenta risco. Plasmaférese pode entrar em casos graves selecionados.');
    if(viral==='HCV' && dx==='CRIO') flags.push('🦠 Crioglobulinemia por HCV: antiviral direto é eixo causal; rituximabe/corticoide entram se manifestação moderada-grave ou órgão-alvo.');
    if(dx==='AAV' && pulmonary==='DAH-hypoxemia') flags.push('🫁 Hemorragia alveolar com hipoxemia: UTI, suporte ventilatório, indução imediata e discutir plasmaférese caso a caso.');
    if(dx==='AAV' && renal==='dialysis') flags.push('🫘 Rim muito grave/dialítico: biópsia renal se possível sem atrasar tratamento; discutir plasmaférese, especialmente se anti-GBM também suspeito.');
    if(dx==='GCA' && organ==='ocular') flags.push('👁️ GCA ocular é emergência: corticoide imediato; não aguardar imagem/biópsia.');
    const isSevere=severity==='severe'||['renal','pulmonary','ocular','neuro','gi','cardiac'].includes(organ);
    const plan=isSevere?r.severe:r.nonsevere;
    const urgency=isSevere?'🚨 Internar / acionar especialista / proteger órgão-alvo':'🟢 Pode ser conduzido com urgência programada se estável, mas sem atrasar investigação';
    const out=`
      <h3>${r.label}</h3>
      <div class="chiprow"><span class="chip ${isSevere?'red':'green'}">${isSevere?'ameaça de órgão/vida':'sem ameaça imediata'}</span><span class="chip">órgão: ${organ||'não definido'}</span><span class="chip">renal: ${renal||'—'}</span></div>
      <p><b>Prioridade agora:</b> ${urgency}</p>
      <div class="danger"><b>Conduta terapêutica sugerida:</b><br>${plan}</div>
      <div class="alert"><b>Exames que mudam decisão:</b><br>${r.exams}</div>
      <div class="ok"><b>Depois que controlar:</b><br>${r.maintenance}</div>
      <p><b>Armadilha clássica:</b> ${r.pitfall}</p>
      ${flags.length?'<h4>Alertas personalizados</h4><ul>'+flags.map(f=>`<li>${f}</li>`).join('')+'</ul>':''}
      <p class="mini">Ferramenta educacional para apoio cognitivo. Em paciente real: ajustar dose, contraindicações, protocolos locais e discutir com Reumato/Nefro/Infecto conforme gravidade.</p>`;
    const box=document.getElementById('decision'); if(box){box.innerHTML=out; box.scrollIntoView({behavior:'smooth',block:'start'});}
  };
  window.loadCase=function(dx,severity,organ,viral='none',renal='none',pulmonary='none'){
    const set=(id,v)=>{const el=document.getElementById(id); if(el) el.value=v};
    set('dx',dx);set('severity',severity);set('organ',organ);set('viral',viral);set('renal',renal);set('pulmonary',pulmonary);set('infection','controlled'); window.runVascSimulator();
  };
})();
